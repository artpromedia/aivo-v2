import { env } from './config/env.js';
import { logger } from './config/logger.js';

/**
 * Environment validation test
 */

console.log('🧪 Testing environment configuration...');

try {
  logger.info({
    nodeEnv: env.NODE_ENV,
    port: env.PORT,
    host: env.HOST,
    supabaseUrl: env.SUPABASE_URL,
    hasSupabaseAnonKey: !!env.SUPABASE_ANON_KEY,
    hasSupabaseServiceKey: !!env.SUPABASE_SERVICE_KEY,
  }, 'Environment validation successful');
  
  console.log('✅ All environment variables are valid!');
  console.log(`📍 Supabase URL: ${env.SUPABASE_URL}`);
  console.log(`🔑 Anon Key: ${env.SUPABASE_ANON_KEY.substring(0, 20)}...`);
  console.log(`🔐 Service Key: ${env.SUPABASE_SERVICE_KEY.substring(0, 20)}...`);
  
} catch (error) {
  logger.error({ err: error }, 'Environment validation failed');
  console.error('❌ Environment validation failed:', error instanceof Error ? error.message : String(error));
  process.exit(1);
}