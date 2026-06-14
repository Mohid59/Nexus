export type UserRole = 'entrepreneur' | 'investor';

export type MeetingStatus = 'pending' | 'accepted' | 'rejected' | 'cancelled';

export interface AccessTokenPayload {
  sub: string;
  role: UserRole;
}

export interface RefreshTokenPayload {
  sub: string;
  tv: number;
}
