export type UserRole = 'entrepreneur' | 'investor';

export type MeetingStatus = 'pending' | 'accepted' | 'rejected' | 'cancelled';

export type TransactionType = 'deposit' | 'withdraw' | 'transfer';
export type TransactionStatus = 'pending' | 'completed' | 'failed';
export type TransactionDirection = 'in' | 'out';

export interface AccessTokenPayload {
  sub: string;
  role: UserRole;
}

export interface RefreshTokenPayload {
  sub: string;
  tv: number;
}
