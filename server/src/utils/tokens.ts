import jwt, { SignOptions } from 'jsonwebtoken';
import { env } from '../config/env';
import { AccessTokenPayload, RefreshTokenPayload } from '../types';

export function signAccessToken(payload: AccessTokenPayload): string {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.ACCESS_TOKEN_TTL as SignOptions['expiresIn'],
  });
}

export function signRefreshToken(payload: RefreshTokenPayload): string {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.REFRESH_TOKEN_TTL as SignOptions['expiresIn'],
  });
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessTokenPayload;
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as RefreshTokenPayload;
}

/** Short-lived token issued after password check when 2FA is pending. */
export function signPendingToken(sub: string): string {
  return jwt.sign({ sub, purpose: '2fa' }, env.JWT_ACCESS_SECRET, { expiresIn: '10m' } as SignOptions);
}

export function verifyPendingToken(token: string): { sub: string; purpose: string } {
  const payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as { sub: string; purpose: string };
  if (payload.purpose !== '2fa') throw new Error('Invalid token purpose');
  return payload;
}
