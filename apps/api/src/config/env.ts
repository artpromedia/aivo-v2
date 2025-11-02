import { z } from 'zod';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Environment configuration schema with Zod validation
 * Ensures all required environment variables are present and properly typed
 */
const envSchema = z.object({
  // Server Configuration
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3000),
  HOST: z.string().default('localhost'),
  API_VERSION: z.string().default('v1'),

  // Database
  DATABASE_URL: z.string().url('Invalid database URL'),

  // Authentication
  JWT_SECRET: z.string().min(32, 'JWT secret must be at least 32 characters'),
  JWT_EXPIRES_IN: z.string().default('1h'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

  // Supabase Configuration
  SUPABASE_URL: z.string().url('Invalid Supabase URL format'),
  SUPABASE_ANON_KEY: z.string().startsWith('sb_publishable_', 'Invalid Supabase publishable key format'),
  SUPABASE_SERVICE_KEY: z.string().startsWith('sb_secret_', 'Invalid Supabase service key format'),

  // Redis
  REDIS_URL: z.string().url('Invalid Redis URL').optional(),
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.coerce.number().default(6379),
  REDIS_PASSWORD: z.string().optional(),
  REDIS_DB: z.coerce.number().default(0),
  REDIS_TLS_ENABLED: z.coerce.boolean().default(false),

  // Stripe
  STRIPE_SECRET_KEY: z.string().startsWith('sk_', 'Invalid Stripe secret key format'),
  STRIPE_WEBHOOK_SECRET: z.string().startsWith('whsec_', 'Invalid Stripe webhook secret format'),
  STRIPE_PUBLISHABLE_KEY: z.string().startsWith('pk_', 'Invalid Stripe publishable key format'),

  // Logging
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  LOG_FORMAT: z.enum(['json', 'pretty']).default('json'),

  // CORS
  CORS_ORIGIN: z.string().default('*'),
  CORS_CREDENTIALS: z.coerce.boolean().default(true),

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(900000), // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().default(100),

  // WebSocket
  WS_PORT: z.coerce.number().default(3001),
  WS_PATH: z.string().default('/ws'),

  // File Upload
  MAX_FILE_SIZE: z.coerce.number().default(10485760), // 10MB
  UPLOAD_DIR: z.string().default('./uploads'),

  // Monitoring
  SENTRY_DSN: z.string().url().optional().or(z.literal('')),
  METRICS_ENABLED: z.coerce.boolean().default(true),

  // Feature Flags
  AI_FEATURES_ENABLED: z.coerce.boolean().default(true),
  ANALYTICS_ENABLED: z.coerce.boolean().default(true),
  COPPA_COMPLIANCE: z.coerce.boolean().default(true),
});

/**
 * Validated environment configuration
 */
export type EnvConfig = z.infer<typeof envSchema>;

/**
 * Parse and validate environment variables
 */
function parseEnv(): EnvConfig {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors.map(
        (issue) => `${issue.path.join('.')}: ${issue.message}`
      );
      
      console.error('❌ Invalid environment configuration:');
      console.error(errorMessages.join('\n'));
      
      // In development, show helpful hints
      if (process.env.NODE_ENV === 'development') {
        console.error('\n💡 Hints:');
        console.error('- Copy .env.example to .env and fill in the values');
        console.error('- Make sure JWT_SECRET is at least 32 characters long');
        console.error('- Ensure all URLs are properly formatted');
        console.error('- Check that Stripe keys have correct prefixes (sk_, pk_, whsec_)');
      }
      
      process.exit(1);
    }
    
    throw error;
  }
}

/**
 * Validated environment configuration instance
 */
export const env = parseEnv();

/**
 * Type-safe environment getter with defaults
 */
export function getEnv<K extends keyof EnvConfig>(
  key: K,
  defaultValue?: EnvConfig[K]
): EnvConfig[K] {
  const value = env[key];
  return value !== undefined ? value : (defaultValue as EnvConfig[K]);
}

/**
 * Check if we're in production environment
 */
export const isProduction = env.NODE_ENV === 'production';

/**
 * Check if we're in development environment
 */
export const isDevelopment = env.NODE_ENV === 'development';

/**
 * Check if we're in test environment
 */
export const isTest = env.NODE_ENV === 'test';

/**
 * Get database configuration
 */
export const dbConfig = {
  url: env.DATABASE_URL,
  // Add connection pooling settings for production
  ...(isProduction && {
    pool: {
      min: 2,
      max: 10,
    },
  }),
} as const;

/**
 * Get Redis configuration
 */
export const redisConfig = {
  url: env.REDIS_URL,
  retryDelayOnFailover: 100,
  enableOfflineQueue: false,
  maxRetriesPerRequest: 3,
} as const;

/**
 * Get Stripe configuration
 */
export const stripeConfig = {
  secretKey: env.STRIPE_SECRET_KEY,
  webhookSecret: env.STRIPE_WEBHOOK_SECRET,
  publishableKey: env.STRIPE_PUBLISHABLE_KEY,
  apiVersion: '2024-10-28.acacia' as const,
} as const;

/**
 * Get CORS configuration
 */
export const corsConfig = {
  origin: env.CORS_ORIGIN.split(',').map(origin => origin.trim()),
  credentials: env.CORS_CREDENTIALS,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Tenant-ID'],
} as const;

/**
 * Get rate limit configuration
 */
export const rateLimitConfig = {
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  maxRequests: env.RATE_LIMIT_MAX_REQUESTS,
  standardHeaders: true,
  legacyHeaders: false,
} as const;