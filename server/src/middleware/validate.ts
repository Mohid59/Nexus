import { Request, Response, NextFunction } from 'express';
import { ZodError, ZodTypeAny } from 'zod';
import { AppError } from '../utils/AppError';

interface RequestSchemas {
  body?: ZodTypeAny;
  query?: ZodTypeAny;
  params?: ZodTypeAny;
}

/**
 * Validates and sanitizes request parts against zod schemas.
 * Parsed (and coerced) values replace the originals so handlers get typed, clean input.
 */
export function validate(schemas: RequestSchemas) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      if (schemas.body) req.body = schemas.body.parse(req.body);
      if (schemas.query) Object.assign(req.query, schemas.query.parse(req.query));
      if (schemas.params) Object.assign(req.params, schemas.params.parse(req.params));
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        return next(new AppError(422, 'Validation failed', err.flatten().fieldErrors));
      }
      next(err);
    }
  };
}
