import Stripe from 'stripe';
import { env } from '../config/env';

let client: Stripe | null = null;

/** Returns a Stripe client if a secret key is configured, otherwise null (simulated mode). */
export function getStripe(): Stripe | null {
  if (!env.STRIPE_SECRET_KEY) return null;
  if (!client) client = new Stripe(env.STRIPE_SECRET_KEY);
  return client;
}

export const stripeEnabled = (): boolean => Boolean(env.STRIPE_SECRET_KEY);
