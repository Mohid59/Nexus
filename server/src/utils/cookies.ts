import { Response } from 'express';
import { env } from '../config/env';

export const REFRESH_COOKIE = 'nexus_refresh';
const COOKIE_PATH = '/api/auth';

/** Parses simple durations like "7d", "15m", "30s", "12h" into milliseconds. */
function parseDurationMs(ttl: string): number {
  const match = /^(\d+)\s*([smhd])$/.exec(ttl.trim());
  const fallback = 7 * 24 * 60 * 60 * 1000;
  if (!match) return fallback;
  const numStr = match[1];
  const unit = match[2];
  if (!numStr || !unit) return fallback;
  const n = Number(numStr);
  const mult = unit === 's' ? 1000 : unit === 'm' ? 60_000 : unit === 'h' ? 3_600_000 : 86_400_000;
  return n * mult;
}

export function setRefreshCookie(res: Response, token: string): void {
  res.cookie(REFRESH_COOKIE, token, {
    httpOnly: true,
    secure: env.COOKIE_SECURE,
    sameSite: env.COOKIE_SAMESITE,
    path: COOKIE_PATH,
    maxAge: parseDurationMs(env.REFRESH_TOKEN_TTL),
  });
}

export function clearRefreshCookie(res: Response): void {
  res.clearCookie(REFRESH_COOKIE, {
    httpOnly: true,
    secure: env.COOKIE_SECURE,
    sameSite: env.COOKIE_SAMESITE,
    path: COOKIE_PATH,
  });
}
