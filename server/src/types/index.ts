export type UserRole = 'entrepreneur' | 'investor';

export interface AccessTokenPayload {
  sub: string;
  role: UserRole;
}

export interface RefreshTokenPayload {
  sub: string;
  tv: number;
}
