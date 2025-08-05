import { Request, Response, NextFunction } from 'express';
import { RateLimiterRedis } from 'rate-limiter-flexible';
import Redis from 'ioredis';
import { Config } from '../helper/config.helper'; // Adjust path if needed

const redisClient = new Redis({
  host: Config.redisHost,
  port: Config.redisPort,
  password: Config.redisPassword || undefined,
});

const rateLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  points: Config.rateLimitMax ?? 10,
  duration: (Config.rateLimitWindowMs ?? 60000) / 1000,
  keyPrefix: 'rlm',
});

export const rateLimiterMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Skip rate limiting for Socket.IO paths to avoid 429 during polling
  if (req.path.startsWith('/socket.io/')) {
    return next();
  }

  rateLimiter.consume(req.ip as string)
    .then(() => {
      next();
    })
    .catch((rejRes) => {
      if (rejRes instanceof Error) {
        console.error('Rate limiter error:', rejRes);
        return res.status(500).json({ message: 'Internal Server Error' });
      }
      res.set('Retry-After', String(Math.ceil(rejRes.msBeforeNext / 1000)));
      return res.status(429).json({ message: 'Too Many Requests' });
    });
};
