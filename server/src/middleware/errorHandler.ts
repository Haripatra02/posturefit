import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Safe console log for developers without leaking in response
  console.error('[API Error]:', err.message || err);

  const statusCode = err.status || err.statusCode || 500;
  const message = statusCode === 500 ? 'An unexpected internal error occurred' : err.message;

  res.status(statusCode).json({
    success: false,
    error: message,
  });
};
