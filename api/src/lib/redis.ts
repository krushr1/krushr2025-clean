import Redis from 'ioredis';

let redis: Redis | null = null;

try {
  redis = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
    lazyConnect: true,
    maxRetriesPerRequest: 3,
    retryDelayOnFailover: 100,
  });

  // Test connection
  redis.on('error', (err) => {
    console.warn('Redis connection error:', err.message);
    redis = null;
  });
} catch (error) {
  console.warn('Redis initialization failed:', error);
  redis = null;
}

// Safe Redis wrapper with fallback
export const safeRedis = {
  async get(key: string): Promise<string | null> {
    try {
      return redis ? await redis.get(key) : null;
    } catch (error) {
      console.warn('Redis GET error:', error);
      return null;
    }
  },

  async set(key: string, value: string, mode?: string, duration?: number): Promise<void> {
    try {
      if (redis) {
        if (mode === 'EX' && duration) {
          await redis.set(key, value, 'EX', duration);
        } else {
          await redis.set(key, value);
        }
      }
    } catch (error) {
      console.warn('Redis SET error:', error);
    }
  }
};

export { redis };
export type RedisClient = typeof redis; 