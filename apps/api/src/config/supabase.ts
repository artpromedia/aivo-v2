import { createClient } from '@supabase/supabase-js';
import { logger } from './logger.js';
import { env } from './env.js';

/**
 * Supabase configuration and client management
 * Provides singleton Supabase client instance with proper configuration
 * for authentication, database operations, and real-time subscriptions
 */

// Singleton instance
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let supabaseInstance: any | null = null;

/**
 * Supabase client configuration options
 */
const supabaseConfig = {
  auth: {
    // Auto refresh tokens
    autoRefreshToken: true,
    
    // Persist session in localStorage (for web clients)
    persistSession: false, // Server-side, so no persistence needed
    
    // Detect session in URL (for OAuth flows)
    detectSessionInUrl: false,
    
    // Flow type for authentication
    flowType: 'pkce' as const,
  },
  
  db: {
    // Database schema
    schema: 'public',
  },
  
  realtime: {
    // Enable real-time subscriptions
    params: {
      eventsPerSecond: 10,
    },
  },
  
  global: {
    headers: {
      'X-Client-Info': 'aivo-platform-api',
    },
  },
};

/**
 * Create and configure Supabase client instance
 */
function createSupabaseClient() {
  const supabase = createClient(
    env.SUPABASE_URL,
    env.SUPABASE_SERVICE_KEY, // Use service key for server-side operations
    supabaseConfig
  );

  logger.info({
    url: env.SUPABASE_URL,
    hasServiceKey: !!env.SUPABASE_SERVICE_KEY,
  }, 'Supabase client created');

  return supabase;
}

/**
 * Get the singleton Supabase client instance
 */
export function getSupabaseClient() {
  if (!supabaseInstance) {
    supabaseInstance = createSupabaseClient();
  }
  return supabaseInstance;
}

/**
 * Create a Supabase client with anon key (for public operations)
 */
export function getSupabaseAnonClient() {
  return createClient(
    env.SUPABASE_URL,
    env.SUPABASE_ANON_KEY,
    {
      ...supabaseConfig,
      auth: {
        ...supabaseConfig.auth,
        persistSession: true, // Allow session persistence for client-side auth
      },
    }
  );
}

/**
 * Initialize Supabase connection and test connectivity
 */
export async function initializeSupabase(): Promise<void> {
  try {
    const supabase = getSupabaseClient();
    
    // Test the connection by making a simple query
    const { error } = await supabase
      .from('users') // This table might not exist yet, that's okay
      .select('count')
      .limit(1)
      .maybeSingle();
    
    if (error && error.code !== 'PGRST116') { // PGRST116 = relation does not exist
      throw error;
    }
    
    logger.info('Supabase connection initialized successfully');
  } catch (error: unknown) {
    logger.warn({
      err: error,
      message: error instanceof Error ? error.message : 'Unknown error',
    }, 'Supabase connection test failed (this is normal if tables don\'t exist yet)');
    
    // Don't throw error for missing tables, just log it
    const errorMessage = error instanceof Error ? error.message : '';
    if (!errorMessage?.includes('relation') && !errorMessage?.includes('does not exist')) {
      throw new Error(`Supabase initialization failed: ${errorMessage}`);
    }
  }
}

/**
 * Close Supabase connection (cleanup)
 */
export async function closeSupabaseConnection(): Promise<void> {
  if (supabaseInstance) {
    try {
      // Remove all real-time subscriptions
      await supabaseInstance.removeAllChannels();
      supabaseInstance = null;
      logger.info('Supabase connection closed');
    } catch (error: unknown) {
      logger.error({ err: error }, 'Error closing Supabase connection');
      throw error;
    }
  }
}

/**
 * Supabase health check
 */
export async function checkSupabaseHealth(): Promise<{
  status: 'healthy' | 'unhealthy';
  latency?: number;
  error?: string;
}> {
  try {
    const start = Date.now();
    const supabase = getSupabaseClient();
    
    // Simple ping to check connectivity
    const { error } = await supabase
      .from('_health_check')
      .select('*')
      .limit(1)
      .maybeSingle();
    
    const latency = Date.now() - start;
    
    // If it's just a table not found error, that's actually healthy
    if (error && (error.code === 'PGRST116' || error.message?.includes('does not exist'))) {
      return {
        status: 'healthy',
        latency,
      };
    }
    
    if (error) {
      return {
        status: 'unhealthy',
        error: error.message,
      };
    }
    
    return {
      status: 'healthy',
      latency,
    };
  } catch (error: unknown) {
    logger.error({ err: error }, 'Supabase health check failed');
    return {
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Authentication utilities
 */
export class SupabaseAuth {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private supabase: any;
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(supabase?: any) {
    this.supabase = supabase || getSupabaseClient();
  }
  
  /**
   * Verify JWT token
   */
  async verifyToken(token: string): Promise<{
    valid: boolean;
    user?: unknown;
    error?: string;
  }> {
    try {
      const { data: { user }, error } = await this.supabase.auth.getUser(token);
      
      if (error) {
        return {
          valid: false,
          error: error.message,
        };
      }
      
      return {
        valid: true,
        user,
      };
    } catch (error: unknown) {
      return {
        valid: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
  
  /**
   * Create new user
   */
  async createUser(email: string, password: string, userData?: Record<string, unknown>) {
    const { data, error } = await this.supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: userData,
      email_confirm: false, // Auto-confirm for admin created users
    });
    
    if (error) {
      throw error;
    }
    
    return data;
  }
  
  /**
   * Get user by ID
   */
  async getUserById(userId: string) {
    const { data, error } = await this.supabase.auth.admin.getUserById(userId);
    
    if (error) {
      throw error;
    }
    
    return data;
  }
  
  /**
   * Update user metadata
   */
  async updateUser(userId: string, updates: {
    email?: string;
    password?: string;
    user_metadata?: Record<string, unknown>;
  }) {
    const { data, error } = await this.supabase.auth.admin.updateUserById(
      userId,
      updates
    );
    
    if (error) {
      throw error;
    }
    
    return data;
  }
  
  /**
   * Delete user
   */
  async deleteUser(userId: string) {
    const { data, error } = await this.supabase.auth.admin.deleteUser(userId);
    
    if (error) {
      throw error;
    }
    
    return data;
  }
}

/**
 * Database utilities for common operations
 */
export class SupabaseDatabase {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private supabase: any;
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(supabase?: any) {
    this.supabase = supabase || getSupabaseClient();
  }
  
  /**
   * Execute RPC (stored procedure)
   */
  async rpc(functionName: string, params: Record<string, unknown> = {}) {
    const { data, error } = await this.supabase.rpc(functionName, params);
    
    if (error) {
      throw error;
    }
    
    return data;
  }
  
  /**
   * Get table with proper error handling
   */
  table(tableName: string) {
    return this.supabase.from(tableName);
  }
  
  /**
   * Execute raw SQL (use with caution)
   */
  async sql(query: string, _params: unknown[] = []) {
    // Note: This would require a custom RPC function in Supabase
    // that accepts SQL queries. Not recommended for production.
    throw new Error('Raw SQL execution not implemented. Use RPC functions instead.');
  }
}

// Export configured instances
export const supabaseAuth = new SupabaseAuth();
export const supabaseDb = new SupabaseDatabase();

export default getSupabaseClient;