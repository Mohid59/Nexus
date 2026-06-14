import { Request, Response } from 'express';
import Stripe from 'stripe';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/AppError';
import { User } from '../models/User';
import { Transaction } from '../models/Transaction';
import { getStripe, stripeEnabled } from '../utils/stripe';
import { env } from '../config/env';
import { logger } from '../utils/logger';
import { TransferInput, ListTxQuery } from '../validators/payment.schema';

const CP = 'name avatarUrl role';
const toCents = (dollars: number): number => Math.round(dollars * 100);

export const getWallet = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user!.id);
  if (!user) throw new AppError(404, 'User not found');
  const transactions = await Transaction.find({ user: user.id })
    .sort({ createdAt: -1 })
    .limit(5)
    .populate({ path: 'counterparty', select: CP });
  res.json({
    balance: user.balance,
    currency: 'usd',
    stripeEnabled: stripeEnabled(),
    transactions: transactions.map((t) => t.toJSON()),
  });
});

export const listTransactions = asyncHandler(async (req, res) => {
  const { page, limit } = req.query as unknown as ListTxQuery;
  const filter = { user: req.user!.id };
  const [items, total] = await Promise.all([
    Transaction.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate({ path: 'counterparty', select: CP }),
    Transaction.countDocuments(filter),
  ]);
  res.json({ data: items.map((t) => t.toJSON()), pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
});

export const deposit = asyncHandler(async (req, res) => {
  const { amount } = req.body as { amount: number };
  const cents = toCents(amount);
  const stripe = getStripe();

  if (stripe) {
    const intent = await stripe.paymentIntents.create({
      amount: cents,
      currency: 'usd',
      metadata: { userId: req.user!.id },
      automatic_payment_methods: { enabled: true },
    });
    const tx = await Transaction.create({
      user: req.user!.id,
      type: 'deposit',
      direction: 'in',
      status: 'pending',
      amount: cents,
      stripePaymentIntentId: intent.id,
      description: 'Wallet deposit',
    });
    res.status(201).json({ clientSecret: intent.client_secret, transaction: tx.toJSON(), simulated: false });
    return;
  }

  // Simulated mode (no Stripe key): complete immediately.
  const tx = await Transaction.create({
    user: req.user!.id,
    type: 'deposit',
    direction: 'in',
    status: 'completed',
    amount: cents,
    description: 'Wallet deposit (simulated)',
  });
  const user = await User.findByIdAndUpdate(req.user!.id, { $inc: { balance: cents } }, { new: true });
  res.status(201).json({ transaction: tx.toJSON(), balance: user?.balance, simulated: true });
});

export const withdraw = asyncHandler(async (req, res) => {
  const { amount } = req.body as { amount: number };
  const cents = toCents(amount);
  const user = await User.findOneAndUpdate(
    { _id: req.user!.id, balance: { $gte: cents } },
    { $inc: { balance: -cents } },
    { new: true }
  );
  if (!user) throw new AppError(400, 'Insufficient balance');
  const tx = await Transaction.create({
    user: user.id,
    type: 'withdraw',
    direction: 'out',
    status: 'completed',
    amount: cents,
    description: 'Wallet withdrawal',
  });
  res.status(201).json({ transaction: tx.toJSON(), balance: user.balance });
});

export const transfer = asyncHandler(async (req, res) => {
  const { to, amount, note } = req.body as TransferInput;
  const cents = toCents(amount);
  if (to === req.user!.id) throw new AppError(400, 'You cannot transfer to yourself');

  const recipient = await User.findById(to);
  if (!recipient) throw new AppError(404, 'Recipient not found');

  const sender = await User.findOneAndUpdate(
    { _id: req.user!.id, balance: { $gte: cents } },
    { $inc: { balance: -cents } },
    { new: true }
  );
  if (!sender) throw new AppError(400, 'Insufficient balance');

  await User.findByIdAndUpdate(to, { $inc: { balance: cents } });

  const out = await Transaction.create({
    user: sender.id,
    type: 'transfer',
    direction: 'out',
    status: 'completed',
    amount: cents,
    counterparty: to,
    description: note || `Transfer to ${recipient.name}`,
  });
  await Transaction.create({
    user: to,
    type: 'transfer',
    direction: 'in',
    status: 'completed',
    amount: cents,
    counterparty: sender.id,
    description: note || `Transfer from ${sender.name}`,
  });

  res.status(201).json({ transaction: out.toJSON(), balance: sender.balance });
});

/** Stripe webhook — mounted with express.raw in app.ts (needs the raw body for signature verification). */
export async function stripeWebhook(req: Request, res: Response): Promise<void> {
  const stripe = getStripe();
  if (!stripe || !env.STRIPE_WEBHOOK_SECRET) {
    res.status(200).json({ received: true, skipped: 'stripe not configured' });
    return;
  }

  let event: Stripe.Event;
  try {
    const sig = req.headers['stripe-signature'] as string;
    event = stripe.webhooks.constructEvent(req.body, sig, env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    logger.error(`Stripe webhook signature failed: ${err instanceof Error ? err.message : String(err)}`);
    res.status(400).send('Webhook signature verification failed');
    return;
  }

  if (event.type === 'payment_intent.succeeded') {
    const pi = event.data.object as Stripe.PaymentIntent;
    const tx = await Transaction.findOne({ stripePaymentIntentId: pi.id });
    if (tx && tx.status !== 'completed') {
      tx.status = 'completed';
      await tx.save();
      await User.findByIdAndUpdate(tx.user, { $inc: { balance: tx.amount } });
    }
  } else if (event.type === 'payment_intent.payment_failed') {
    const pi = event.data.object as Stripe.PaymentIntent;
    await Transaction.findOneAndUpdate({ stripePaymentIntentId: pi.id }, { status: 'failed' });
  }

  res.json({ received: true });
}
