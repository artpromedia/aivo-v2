import Redis, { RedisOptions } from 'ioredis';
import { logger } from './logger.js';
import { env } from './env.js';

/**
 * Redis configuration and connection management
 * Provides singleton Redis instance with proper error handling,
 * retry logic, and connection pooling
 */

// Singleton instance
let redisInstance: Redis | null = null;
let isConnected = false;

/**
 * Redis connection options
 */
const redisOptions: RedisOptions = {
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  password: env.REDIS_PASSWORD || undefined,
  db: env.REDIS_DB || 0,
  
  // Connection settings
  connectTimeout: 10000,
  commandTimeout: 5000,
  enableReadyCheck: true,
  maxRetriesPerRequest: 3,
  enableOfflineQueue: false,
  
  // Lazy connect
  lazyConnect: true,
  
  // Keep alive settings
  keepAlive: 30000,
  
  // Family (IPv4/IPv6)
  family: 4,
  
  // TLS configuration (if needed)
  ...(env.REDIS_TLS_ENABLED && {
    tls: {
      rejectUnauthorized: env.NODE_ENV === 'production',
    },
  }),
};

/**
 * Create and configure Redis instance
 */
function createRedisClient(): Redis {
  const redis = new Redis(redisOptions);
  
  // Connection event handlers
  redis.on('connect', () => {
    isConnected = false; // Still connecting
    logger.info('Redis connection established');
  });
  
  redis.on('ready', () => {
    isConnected = true;
    logger.info('Redis client ready');
  });
  
  redis.on('error', (error) => {
    isConnected = false;
    logger.error({ err: error }, 'Redis connection error');
  });
  
  redis.on('close', () => {
    isConnected = false;
    logger.warn('Redis connection closed');
  });
  
  redis.on('reconnecting', (delay: number) => {
    isConnected = false;
    logger.info({ delay }, 'Redis reconnecting...');
  });
  
  redis.on('end', () => {
    isConnected = false;
    logger.info('Redis connection ended');
  });
  
  return redis;
}

/**
 * Get the singleton Redis instance
 */
export function getRedisClient(): Redis {
  if (!redisInstance) {
    redisInstance = createRedisClient();
    logger.info('Redis client instance created');
  }
  return redisInstance;
}

/**
 * Initialize Redis connection
 */
export async function initializeRedis(): Promise<void> {
  try {
    const redis = getRedisClient();
    await redis.connect();
    
    // Test the connection
    const pong = await redis.ping();
    if (pong !== 'PONG') {
      throw new Error('Redis ping test failed');
    }
    
    logger.info('Redis connection initialized successfully');
  } catch (error: any) {
    logger.error({ err: error }, 'Failed to initialize Redis connection');
    throw new Error(`Redis initialization failed: ${error.message}`);
  }
}

/**
 * Close Redis connection
 */
export async function closeRedisConnection(): Promise<void> {
  if (redisInstance) {
    try {
      await redisInstance.quit();
      redisInstance = null;
      isConnected = false;
      logger.info('Redis connection closed');
    } catch (error: any) {
      logger.error({ err: error }, 'Error closing Redis connection');
      throw error;
    }
  }
}

/**
 * Check Redis health
 */
export async function checkRedisHealth(): Promise<{
  status: 'healthy' | 'unhealthy';
  latency?: number;
  error?: string;
}> {
  try {
    if (!isConnected) {
      return {
        status: 'unhealthy',
        error: 'Redis not connected',
      };
    }
    
    const start = Date.now();
    const redis = getRedisClient();
    
    const pong = await redis.ping();
    
    if (pong !== 'PONG') {
      return {
        status: 'unhealthy',
        error: 'Redis ping failed',
      };
    }
    
    const latency = Date.now() - start;
    
    return {
      status: 'healthy',
      latency,
    };
  } catch (error: any) {
    logger.error({ err: error }, 'Redis health check failed');
    return {
      status: 'unhealthy',
      error: error.message,
    };
  }
}

/**
 * Session management utilities
 */
export class SessionManager {
  private redis: Redis;
  private prefix: string = 'session:';
  private defaultTTL: number = 24 * 60 * 60; // 24 hours in seconds
  
  constructor(redis?: Redis, prefix?: string) {
    this.redis = redis || getRedisClient();
    if (prefix) this.prefix = prefix;
  }
  
  /**
   * Store session data
   */
  async setSession(sessionId: string, data: Record<string, any>, ttl?: number): Promise<void> {
    const key = `${this.prefix}${sessionId}`;
    const serializedData = JSON.stringify(data);
    
    await this.redis.setex(key, ttl || this.defaultTTL, serializedData);
  }
  
  /**
   * Retrieve session data
   */
  async getSession(sessionId: string): Promise<Record<string, any> | null> {
    const key = `${this.prefix}${sessionId}`;
    const data = await this.redis.get(key);
    
    if (!data) return null;
    
    try {
      return JSON.parse(data);
    } catch (error) {
      logger.error({ err: error, sessionId }, 'Failed to parse session data');
      return null;
    }
  }
  
  /**
   * Update session TTL
   */
  async refreshSession(sessionId: string, ttl?: number): Promise<boolean> {
    const key = `${this.prefix}${sessionId}`;
    const result = await this.redis.expire(key, ttl || this.defaultTTL);
    return result === 1;
  }
  
  /**
   * Delete session
   */
  async deleteSession(sessionId: string): Promise<void> {
    const key = `${this.prefix}${sessionId}`;
    await this.redis.del(key);
  }
  
  /**
   * Get all sessions for a user
   */
  async getUserSessions(userId: string): Promise<string[]> {
    const pattern = `${this.prefix}*`;
    const keys = await this.redis.keys(pattern);
    const userSessions: string[] = [];
    
    for (const key of keys) {
      const data = await this.redis.get(key);
      if (data) {
        try {
          const sessionData = JSON.parse(data);
          if (sessionData.userId === userId) {
            userSessions.push(key.replace(this.prefix, ''));
          }
        } catch {
          // Ignore invalid session data
        }
      }
    }
    
    return userSessions;
  }
}

/**
 * Cache utilities
 */
export class CacheManager {
  private redis: Redis;
  private prefix: string = 'cache:';
  private defaultTTL: number = 60 * 60; // 1 hour in seconds
  
  constructor(redis?: Redis, prefix?: string) {
    this.redis = redis || getRedisClient();
    if (prefix) this.prefix = prefix;
  }
  
  /**
   * Set cache value
   */
  async set(key: string, value: any, ttl?: number): Promise<void> {
    const cacheKey = `${this.prefix}${key}`;
    const serializedValue = JSON.stringify(value);
    
    if (ttl || this.defaultTTL) {
      await this.redis.setex(cacheKey, ttl || this.defaultTTL, serializedValue);
    } else {
      await this.redis.set(cacheKey, serializedValue);
    }
  }
  
  /**
   * Get cache value
   */
  async get<T = any>(key: string): Promise<T | null> {
    const cacheKey = `${this.prefix}${key}`;
    const value = await this.redis.get(cacheKey);
    
    if (!value) return null;
    
    try {
      return JSON.parse(value) as T;
    } catch (error) {
      logger.error({ err: error, key }, 'Failed to parse cached value');
      return null;
    }
  }
  
  /**
   * Delete cache value
   */
  async del(key: string): Promise<void> {
    const cacheKey = `${this.prefix}${key}`;
    await this.redis.del(cacheKey);
  }
  
  /**
   * Check if cache key exists
   */
  async exists(key: string): Promise<boolean> {
    const cacheKey = `${this.prefix}${key}`;
    const result = await this.redis.exists(cacheKey);
    return result === 1;
  }
  
  /**
   * Clear cache by pattern
   */
  async clearByPattern(pattern: string): Promise<number> {
    const searchPattern = `${this.prefix}${pattern}`;
    const keys = await this.redis.keys(searchPattern);
    
    if (keys.length === 0) return 0;
    
    await this.redis.del(...keys);
    return keys.length;
  }
  
  /**
   * Get or set cache with function
   */
  async getOrSet<T>(
    key: string,
    fn: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }
    
    const value = await fn();
    await this.set(key, value, ttl);
    return value;
  }
}

/**
 * Rate limiting utilities
 */
export class RateLimiter {
  private redis: Redis;
  private prefix: string = 'rate_limit:';
  
  constructor(redis?: Redis, prefix?: string) {
    this.redis = redis || getRedisClient();
    if (prefix) this.prefix = prefix;
  }
  
  /**
   * Check if request is within rate limit
   */
  async checkLimit(
    identifier: string,
    windowSizeInSeconds: number,
    maxRequests: number
  ): Promise<{
    allowed: boolean;
    count: number;
    remaining: number;
    resetTime: number;
  }> {
    const key = `${this.prefix}${identifier}`;
    const now = Date.now();
    const windowStart = Math.floor(now / (windowSizeInSeconds * 1000));
    
    const multi = this.redis.multi();
    const windowKey = `${key}:${windowStart}`;
    
    multi.incr(windowKey);
    multi.expire(windowKey, windowSizeInSeconds);
    
    const results = await multi.exec();
    const count = results?.[0]?.[1] as number || 0;
    
    const allowed = count <= maxRequests;
    const remaining = Math.max(0, maxRequests - count);
    const resetTime = (windowStart + 1) * windowSizeInSeconds * 1000;
    
    return {
      allowed,
      count,
      remaining,
      resetTime,
    };
  }
}

// Export instances
export const sessionManager = new SessionManager();
export const cacheManager = new CacheManager();
export const rateLimiter = new RateLimiter();

export default getRedisClient;