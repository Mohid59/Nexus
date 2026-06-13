/** Operational HTTP error with a status code and optional details payload. */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly details?: unknown;
  public readonly isOperational = true;

  constructor(statusCode: number, message: string, details?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    Object.setPrototypeOf(this, AppError.prototype);
    Error.captureStackTrace?.(this, AppError);
  }
}
