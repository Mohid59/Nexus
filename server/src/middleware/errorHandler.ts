import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';
import { logger } from '../utils/logger';

/** 404 fallthrough — turns unmatched routes into an AppError. */
export function notFound(req: Request, _res: Response, next: NextFunction): void {
  next(new AppError(404, `Route not found: ${req.method} ${req.originalUrl}`));
}

/** Central error handler. Maps known error shapes to clean JSON responses. */
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  let statusCode = 500;
  let message = 'Internal server error';
  let details: unknown;

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    details = err.details;
  } else if (err instanceof Error) {
    const e = err as Error & { code?: number; keyValue?: Record<string, unknown> };
    if (e.code === 11000) {
      statusCode = 409;
      message = `Duplicate value for: ${Object.keys(e.keyValue ?? {}).join(', ') || 'field'}`;
    } else if (err.name === 'ValidationError') {
      statusCode = 422;
      message = err.message;
    } else if (err.name === 'CastError') {
      statusCode = 400;
      message = 'Invalid identifier';
    } else if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      statusCode = 401;
      message = 'Invalid or expired token';
    } else {
      message = err.message || message;
    }
  }

  if (statusCode >= 500) {
    const stack = err instanceof Error && err.stack ? `\n${err.stack}` : '';
    logger.error(`${statusCode} ${message}${stack}`);
  }

  res.status(statusCode).json({
    error: { message, ...(details ? { details } : {}) },
  });
}
