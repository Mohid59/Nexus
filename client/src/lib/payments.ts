import { api } from './api';
import { UserRole } from '../types';

export type TxType = 'deposit' | 'withdraw' | 'transfer';
export type TxStatus = 'pending' | 'completed' | 'failed';
export type TxDirection = 'in' | 'out';

export interface TxParty {
  id: string;
  name: string;
  avatarUrl: string;
  role: UserRole;
}

export interface Transaction {
  id: string;
  type: TxType;
  direction: TxDirection;
  status: TxStatus;
  amount: number; // cents
  currency: string;
  counterparty?: TxParty;
  description?: string;
  createdAt: string;
}

export interface Wallet {
  balance: number; // cents
  currency: string;
  stripeEnabled: boolean;
  transactions: Transaction[];
}

export interface DepositResult {
  transaction: Transaction;
  balance?: number;
  simulated: boolean;
  clientSecret?: string;
}

export async function getWallet(): Promise<Wallet> {
  const { data } = await api.get('/payments/wallet');
  return data as Wallet;
}

export async function listTransactions(page = 1): Promise<{ data: Transaction[]; pagination: { page: number; pages: number; total: number } }> {
  const { data } = await api.get('/payments/transactions', { params: { page, limit: 20 } });
  return data;
}

export async function deposit(amount: number): Promise<DepositResult> {
  const { data } = await api.post('/payments/deposit', { amount });
  return data as DepositResult;
}

export async function withdraw(amount: number): Promise<{ balance: number }> {
  const { data } = await api.post('/payments/withdraw', { amount });
  return data;
}

export async function transfer(to: string, amount: number, note?: string): Promise<{ balance: number }> {
  const { data } = await api.post('/payments/transfer', { to, amount, note });
  return data;
}

export const formatMoney = (cents: number, currency = 'usd'): string =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: currency.toUpperCase() }).format(cents / 100);
