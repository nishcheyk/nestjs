import rateLimit from 'express-rate-limit';
import { RequestHandler } from 'express';

export function createRateLimitMiddleware(opts: { windowMs: number; max: number; message: string }): RequestHandler {
  return rateLimit({
    windowMs: opts.windowMs,
    max: opts.max,
    message: opts.message,
    standardHeaders: true,
    legacyHeaders: false,
    statusCode: 429,
    headers: true,
    handler: (req, res) => {
      res.status(429).json({
        statusCode: 429,
        error: "Too Many Requests",
        message: opts.message,
      });
    }
  });
}
