import { createClient } from 'redis';
import logger from '../Logger/index.js';

export const redisClient = createClient({
  url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
})
  .on('error', (err) => logger.error('Redis Client Error', err))
  .on('connect', () => logger.info('Connected to Redis'));

async function connectRedis() {
  console.log(
    'url',
    `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
  );
  await redisClient.connect();
}

connectRedis().catch((err) => {
  logger.error('Failed to connect to Redis', err);
});
