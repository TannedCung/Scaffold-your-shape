import { Redis } from '@upstash/redis';

// Redis connection configuration
const getRedisClient = () => {
  const redisUrl = process.env.REDIS_URL;
  const redisToken = process.env.REDIS_TOKEN;

  if (!redisUrl) {
    throw new Error('REDIS_URL environment variable is required');
  }

  // For Upstash Redis (production), we need both URL and token
  if (redisToken) {
    return new Redis({
      url: redisUrl,
      token: redisToken,
    });
  }

  // For local Redis (development), use empty token
  return new Redis({
    url: redisUrl,
    token: '',
  });
};

// Create a singleton Redis client
let redisClient: Redis | null = null;

export const getRedis = (): Redis => {
  if (!redisClient) {
    redisClient = getRedisClient();
  }
  return redisClient;
};

// Helper function to generate leaderboard keys
export const getLeaderboardKey = (clubId: string, activityType: string): string => {
  return `leaderboard:${clubId}:${activityType}`;
};

// Helper function to check if Redis is available
export const isRedisAvailable = async (): Promise<boolean> => {
  try {
    const redis = getRedis();
    await redis.ping();
    return true;
  } catch (error) {
    console.error('Redis not available:', error);
    return false;
  }
}; 