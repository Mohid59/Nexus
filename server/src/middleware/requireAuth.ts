import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/tokens';
import { AppError } from '../utils/AppError';

/** Verifies the Bearer access token and attaches { id, role } to req.user. */
export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return next(new AppError(401, 'Authentication required'));
  }
  const token = header.slice('Bearer '.length).trim();
  try {
    const payload = verifyAccessToken(token);
    req.user = { id: payload.sub, role: payload.role };
    next();
  } catch {
    next(new AppError(401, 'Invalid or expired token'));
  }
}
