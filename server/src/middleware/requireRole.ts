import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';
import { UserRole } from '../types';

/** Guards a route so only the listed roles may proceed. Must run after requireAuth. */
export function requireRole(...roles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) return next(new AppError(401, 'Authentication required'));
    if (!roles.includes(req.user.role)) {
      return next(new AppError(403, 'Insufficient permissions for this resource'));
    }
    next();
  };
}
