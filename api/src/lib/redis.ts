import Redis from 'ioredis';

let redis: Redis | null = null;
let isRedisConnected = false;

// Only initialize Redis if REDIS_URL is set
if (process.env.REDIS_URL) {
  try {
    redis = new Redis(process.env.REDIS_URL, {
      lazyConnect: true,
      maxRetriesPerRequest: 3,
      retryDelayOnFailover: 100,
      connectTimeout: 1000,
    });

    redis.on('connect', () => {
      isRedisConnected = true;
      console.log('Redis connected');
    });

    redis.on('error', (err) => {
      if (isRedisConnected) {
        console.warn('Redis connection error:', err.message);
      }
      isRedisConnected = false;
      redis = null;
    });

    redis.on('close', () => {
      isRedisConnected = false;
      console.log('Redis connection closed');
    });

    // Attempt to connect
    redis.connect().catch(() => {
      // Prevent unhandled promise rejection
      isRedisConnected = false;
      redis = null;
    });

  } catch (error) {
    console.warn('Redis initialization failed:', error);
    redis = null;
  }
}

// Safe Redis wrapper with fallback
export const safeRedis = {
  async get(key: string): Promise<string | null> {
    if (!redis || !isRedisConnected) return null;
    try {
      return await redis.get(key);
    } catch (error) {
      console.warn('Redis GET error:', error);
      return null;
    }
  },

  async set(key: string, value: string, mode?: string, duration?: number): Promise<void> {
    if (!redis || !isRedisConnected) return;
    try {
      if (mode === 'EX' && duration) {
        await redis.set(key, value, 'EX', duration);
      } else {
        await redis.set(key, value);
      }
    } catch (error) {
      console.warn('Redis SET error:', error);
    }
  },

  async del(key: string): Promise<void> {
    if (!redis || !isRedisConnected) return;
    try {
      await redis.del(key);
    } catch (error) {
      console.warn('Redis DEL error:', error);
    }
  }
};

export { redis };
export type RedisClient = typeof redis; 