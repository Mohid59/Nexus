import { api } from './api';
import { Entrepreneur, Investor } from '../types';

export async function listInvestors(): Promise<Investor[]> {
  const { data } = await api.get('/investors', { params: { limit: 100 } });
  return data.data as Investor[];
}

export async function listEntrepreneurs(): Promise<Entrepreneur[]> {
  const { data } = await api.get('/entrepreneurs', { params: { limit: 100 } });
  return data.data as Entrepreneur[];
}
