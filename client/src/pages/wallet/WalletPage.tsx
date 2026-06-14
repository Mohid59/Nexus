import React, { useCallback, useEffect, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { ArrowDownLeft, ArrowUpRight, Plus, Send, Wallet as WalletIcon, Banknote } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

import { useAuth } from '../../context/AuthContext';
import { api, apiErrorMessage } from '../../lib/api';
import {
  Wallet,
  Transaction,
  TxStatus,
  getWallet,
  listTransactions,
  deposit,
  withdraw,
  transfer,
  formatMoney,
} from '../../lib/payments';
import { Button } from '../../components/ui/Button';
import { Badge, BadgeVariant } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { EmptyState } from '../../components/ui/EmptyState';
import { Skeleton } from '../../components/ui/Skeleton';

const pubKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
const stripePromise = pubKey ? loadStripe(pubKey) : null;

const STATUS_BADGE: Record<TxStatus, BadgeVariant> = {
  completed: 'success',
  pending: 'accent',
  failed: 'error',
};

type ModalKind = 'deposit' | 'withdraw' | 'transfer' | null;

const StripeDepositForm: React.FC<{ onDone: () => void }> = ({ onDone }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [busy, setBusy] = useState(false);

  const pay = async () => {
    if (!stripe || !elements) return;
    setBusy(true);
    const { error } = await stripe.confirmPayment({ elements, redirect: 'if_required' });
    setBusy(false);
    if (error) toast.error(error.message || 'Payment failed');
    else {
      toast.success('Payment submitted');
      onDone();
    }
  };

  return (
    <div className="space-y-4">
      <PaymentElement />
      <Button onClick={pay} isLoading={busy} fullWidth>
        Pay now
      </Button>
    </div>
  );
};

export const WalletPage: React.FC = () => {
  const { user } = useAuth();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [txns, setTxns] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const [modal, setModal] = useState<ModalKind>(null);
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [counterparts, setCounterparts] = useState<{ id: string; name: string }[]>([]);

  const refresh = useCallback(async () => {
    try {
      const [w, t] = await Promise.all([getWallet(), listTransactions(1)]);
      setWallet(w);
      setTxns(t.data);
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Could not load wallet'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (!user) return;
    const role = user.role === 'entrepreneur' ? 'investors' : 'entrepreneurs';
    api
      .get(`/${role}`, { params: { limit: 100 } })
      .then(({ data }) => setCounterparts(data.data))
      .catch(() => undefined);
  }, [user]);

  const closeModal = () => {
    setModal(null);
    setAmount('');
    setRecipient('');
    setNote('');
    setClientSecret(null);
  };

  const amountNum = parseFloat(amount);

  const handleSubmit = async () => {
    if (!amountNum || amountNum <= 0) {
      toast.error('Enter a valid amount');
      return;
    }
    setSubmitting(true);
    try {
      if (modal === 'deposit') {
        const res = await deposit(amountNum);
        if (res.clientSecret && stripePromise) {
          setClientSecret(res.clientSecret);
          setSubmitting(false);
          return; // show Stripe Elements step
        }
        toast.success('Funds added');
      } else if (modal === 'withdraw') {
        await withdraw(amountNum);
        toast.success('Withdrawal complete');
      } else if (modal === 'transfer') {
        if (!recipient) {
          toast.error('Select a recipient');
          setSubmitting(false);
          return;
        }
        await transfer(recipient, amountNum, note || undefined);
        toast.success('Transfer sent');
      }
      closeModal();
      await refresh();
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Transaction failed'));
    } finally {
      setSubmitting(false);
    }
  };

  const sign = (t: Transaction) => (t.direction === 'in' ? '+' : '-');

  return (
    <div className="space-y-7 animate-fade-in">
      <div>
        <h1 className="text-2xl font-semibold text-ink sm:text-3xl">Wallet</h1>
        <p className="mt-1 text-muted">Manage deposits, withdrawals, and transfers.</p>
      </div>

      {/* Balance hero */}
      <div className="relative overflow-hidden rounded-3xl border border-line bg-surface hero-band p-7 sm:p-9">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="flex items-center gap-2 text-sm font-medium text-muted">
              <WalletIcon size={16} /> Available balance
            </p>
            {loading ? (
              <Skeleton className="mt-3 h-12 w-48" />
            ) : (
              <p className="mt-2 font-display text-5xl font-semibold text-ink">{formatMoney(wallet?.balance ?? 0)}</p>
            )}
            {wallet && !wallet.stripeEnabled && (
              <Badge variant="gray" rounded size="sm" className="mt-3">
                Simulated mode (no Stripe key)
              </Badge>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button leftIcon={<Plus size={16} />} onClick={() => setModal('deposit')}>
              Add funds
            </Button>
            <Button variant="outline" leftIcon={<Banknote size={16} />} onClick={() => setModal('withdraw')}>
              Withdraw
            </Button>
            <Button variant="outline" leftIcon={<Send size={16} />} onClick={() => setModal('transfer')}>
              Send
            </Button>
          </div>
        </div>
      </div>

      {/* History */}
      <div className="overflow-hidden rounded-2xl border border-line bg-surface shadow-card">
        <div className="border-b border-line px-6 py-4">
          <h2 className="text-lg font-semibold text-ink">Transaction history</h2>
        </div>
        {loading ? (
          <div className="space-y-2 p-6">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : txns.length === 0 ? (
          <EmptyState icon={<WalletIcon size={24} />} title="No transactions yet" description="Add funds to get started." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line text-left text-xs uppercase tracking-wider text-muted">
                  <th className="px-6 py-3 font-semibold">Type</th>
                  <th className="px-6 py-3 font-semibold">Details</th>
                  <th className="px-6 py-3 font-semibold">Status</th>
                  <th className="px-6 py-3 font-semibold">Date</th>
                  <th className="px-6 py-3 text-right font-semibold">Amount</th>
                </tr>
              </thead>
              <tbody>
                {txns.map((t) => (
                  <tr key={t.id} className="border-b border-line last:border-0">
                    <td className="px-6 py-3">
                      <span className="flex items-center gap-2 capitalize text-ink">
                        {t.direction === 'in' ? (
                          <ArrowDownLeft size={16} className="text-success-600" />
                        ) : (
                          <ArrowUpRight size={16} className="text-accent-600" />
                        )}
                        {t.type}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-muted">{t.counterparty?.name ?? t.description ?? '—'}</td>
                    <td className="px-6 py-3">
                      <Badge variant={STATUS_BADGE[t.status]} rounded size="sm" className="capitalize">
                        {t.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-3 text-muted">{format(new Date(t.createdAt), 'd MMM yyyy')}</td>
                    <td className={`px-6 py-3 text-right font-medium ${t.direction === 'in' ? 'text-success-600' : 'text-ink'}`}>
                      {sign(t)}
                      {formatMoney(t.amount, t.currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Action modal */}
      <Modal
        isOpen={modal !== null}
        onClose={closeModal}
        title={modal === 'deposit' ? 'Add funds' : modal === 'withdraw' ? 'Withdraw funds' : 'Send money'}
        footer={
          clientSecret ? undefined : (
            <>
              <Button variant="ghost" onClick={closeModal}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} isLoading={submitting}>
                {modal === 'deposit' ? 'Add' : modal === 'withdraw' ? 'Withdraw' : 'Send'}
              </Button>
            </>
          )
        }
      >
        {clientSecret && stripePromise ? (
          <Elements stripe={stripePromise} options={{ clientSecret }}>
            <StripeDepositForm
              onDone={() => {
                closeModal();
                refresh();
              }}
            />
          </Elements>
        ) : (
          <div className="space-y-4">
            {modal === 'transfer' && (
              <div>
                <label className="mb-1.5 block text-sm font-medium text-ink">Recipient</label>
                <select
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  className="block w-full rounded-lg border border-line bg-surface px-3.5 py-2.5 text-sm text-ink shadow-soft focus:border-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-500/35"
                >
                  <option value="" disabled>
                    Select a person
                  </option>
                  {counterparts.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <Input
              label="Amount (USD)"
              type="number"
              min="0"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              fullWidth
              placeholder="0.00"
            />
            {modal === 'transfer' && (
              <Input label="Note (optional)" value={note} onChange={(e) => setNote(e.target.value)} fullWidth placeholder="What's this for?" />
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};
