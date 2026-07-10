import { createClient } from 'redis';

let redisClient = null;
let redisSubClient = null;

export const connectRedis = async () => {
  if (redisClient) return redisClient;

  const url = `redis://${process.env.REDIS_HOST || '127.0.0.1'}:${process.env.REDIS_PORT || '6379'}`;
  
  redisClient = createClient({ url });

  redisClient.on('error', (err) => console.error('[Redis] Client Error:', err));
  redisClient.on('connect', () => console.log('[Redis] Connected successfully'));

  await redisClient.connect();

  // Create duplicate for Pub/Sub subscription
  redisSubClient = redisClient.duplicate();
  redisSubClient.on('error', (err) => console.error('[Redis Sub] Client Error:', err));
  await redisSubClient.connect();

  return redisClient;
};

export const getRedisClient = () => {
  if (!redisClient) {
    throw new Error('Redis client not connected. Call connectRedis first.');
  }
  return redisClient;
};

export const getRedisSubClient = () => {
  if (!redisSubClient) {
    throw new Error('Redis sub client not connected.');
  }
  return redisSubClient;
};

export const publishSocketEvent = async (room, event, data) => {
  try {
    const redis = getRedisClient();
    await redis.publish('socket_events', JSON.stringify({ room, event, data }));
  } catch (err) {
    console.error('[Redis Pub] Failed to publish socket event:', err.message);
  }
};
