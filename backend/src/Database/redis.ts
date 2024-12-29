import { Redis } from 'ioredis';
import logger from '../Logger/index.js';

export const redis = new Redis({
  port: Number(process.env.REDIS_PORT),
  host: process.env.REDIS_HOST,
});

redis.on('connect', () => {
  logger.info('Successfully connected to Redis');
  createIndex();
});

redis.on('error', (error) => {
  logger.error('Redis connection error: ' + error);
});

const INDEX_NAME = 'idx:subscription';

async function createIndex() {
  try {
    await redis.call(
      'FT.CREATE',
      INDEX_NAME,
      'ON',
      'HASH',
      'PREFIX',
      '1',
      'id:',
      'SCHEMA',
      'subId',
      'TEXT',
      'userId',
      'TEXT',
      'type',
      'TAG',
      'startDate',
      'NUMERIC',
      'endDate',
      'NUMERIC',
      'startTime',
      'NUMERIC',
      'endTime',
      'NUMERIC',
      'polygonIds',
      'TAG',
      'condition',
      'TAG',
      'until',
      'NUMERIC',
      'recurrence',
      'TAG',
      'email',
      'TEXT',
      'nickname',
      'TEXT',
    );
    logger.info('Index created');
  } catch (err) {
    if ((err as Error).message.includes('Index already exists')) {
      logger.info('Index already exists');
    } else {
      logger.info('Error creating index: ' + String(err));
    }
  }
}
