import { api } from './api';
import { Entrepreneur, Investor, User } from '../types';

export async function getUser(id: string): Promise<User> {
  const { data } = await api.get(`/users/${id}`);
  return data.user as User;
}

export async function listInvestors(): Promise<Investor[]> {
  const { data } = await api.get('/investors', { params: { limit: 100 } });
  return data.data as Investor[];
}

export async function listEntrepreneurs(): Promise<Entrepreneur[]> {
  const { data } = await api.get('/entrepreneurs', { params: { limit: 100 } });
  return data.data as Entrepreneur[];
}
