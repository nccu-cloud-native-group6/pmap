import { Request, Response, NextFunction } from 'express';

import { readFileSync } from 'fs';

import path from 'path';
import { redis } from '../Database/redis.js';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const luaScript = readFileSync(
  path.join(__dirname, '../utils/rateLimit.lua'),
  'utf8',
);

// 預加載 Lua 腳本
let scriptSha: string | null = null;

redis
  .script('LOAD', luaScript)
  .then((sha) => {
    scriptSha = sha as string;
  })
  .catch((error) => {
    console.error('Failed to load Lua script:', error);
  });

export function createRateLimiter(windowSize: number, maxRequests: number) {
  // 這個函式return回去的才是真正的Express中介層
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // 確保Lua腳本已載入
      if (!scriptSha) {
        // 若尚未載入完，稍等一下
        await new Promise((resolve) => setTimeout(resolve, 50));
        if (!scriptSha) {
          throw new Error('Lua script SHA not available');
        }
      }

      const key = `rate_limit:${req.ip}`;
      const now = Math.floor(Date.now() / 1000); // 以秒為單位

      const allowed = await redis.evalsha(
        scriptSha,
        1, // 傳入1個key
        key,
        now.toString(),
        windowSize.toString(),
        maxRequests.toString(),
      );

      if (allowed === 1) {
        next();
      } else {
        res
          .status(429)
          .json({ message: 'Too many requests, please try again later.' });
      }
    } catch (error) {
      console.error('Rate Limiter Error:', error);
      // 錯誤時先不擋請求，以免誤傷
      next();
    }
  };
}
