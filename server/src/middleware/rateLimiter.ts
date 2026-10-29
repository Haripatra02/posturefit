import { Request, Response, NextFunction } from 'express';

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const windowMs = 60 * 1000; // 1 minute
const maxRequests = 120; // 120 requests per minute
const hits = new Map<string, RateLimitRecord>();

export const rateLimiter = (req: Request, res: Response, next: NextFunction): void => {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const now = Date.now();

  const record = hits.get(ip);
  if (!record || now > record.resetAt) {
    hits.set(ip, { count: 1, resetAt: now + windowMs });
    next();
    return;
  }

  if (record.count >= maxRequests) {
    res.status(429).json({
      success: false,
      error: 'Too many requests. Please slow down and try again shortly.',
    });
    return;
  }

  record.count++;
  next();
};
