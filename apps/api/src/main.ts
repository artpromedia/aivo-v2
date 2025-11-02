import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { prettyJSON } from 'hono/pretty-json';
import { secureHeaders } from 'hono/secure-headers';
import { trimTrailingSlash } from 'hono/trailing-slash';

import { env } from './config/env.js';
import { logger, logRequest } from './config/logger.js';
import { initializeSupabase, checkSupabaseHealth } from './config/supabase.js';

/**
 * Aivo Platform API Server with Supabase Integration
 */

// Create Hono application instance
const app = new Hono();

/**
 * Global middleware configuration
 */

// Security headers
app.use('*', secureHeaders({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    defaultSrc: ["'self'"],
    styleSrc: ["'self'", "'unsafe-inline'"],
    scriptSrc: ["'self'"],
    imgSrc: ["'self'", 'data:', 'https:'],
    connectSrc: ["'self'"],
    fontSrc: ["'self'"],
    objectSrc: ["'none'"],
    mediaSrc: ["'self'"],
    frameSrc: ["'none'"],
  },
}));

// CORS configuration
app.use('*', cors({
  origin: env.CORS_ORIGIN ? env.CORS_ORIGIN.split(',') : ['http://localhost:3000'],
  credentials: env.CORS_CREDENTIALS,
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With',
    'X-Tenant-ID',
    'X-Request-ID',
    'X-API-Version'
  ],
  exposeHeaders: [
    'X-Rate-Limit-Remaining',
    'X-Rate-Limit-Reset',
    'X-Request-ID'
  ],
}));

// Remove trailing slashes
app.use('*', trimTrailingSlash());

// Pretty JSON in development
if (env.NODE_ENV === 'development') {
  app.use('*', prettyJSON());
}

// Request logging
app.use('*', logRequest);

/**
 * Health check endpoints
 */
app.get('/health', async (c) => {
  try {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      environment: env.NODE_ENV,
      uptime: process.uptime(),
    };

    return c.json(health);
  } catch (error: any) {
    logger.error({ err: error }, 'Health check failed');
    return c.json({
      status: 'unhealthy',
      error: error.message,
    }, 500);
  }
});

app.get('/health/detailed', async (c) => {
  try {
    // Detailed health check including dependencies
    const checks = await Promise.allSettled([
      // Supabase health check
      checkSupabaseHealth(),
      // Database placeholder (can be added later)
      Promise.resolve({ service: 'database', status: 'not_configured' }),
      // Redis placeholder (can be added later)
      Promise.resolve({ service: 'redis', status: 'not_configured' }),
    ]);

    const services = checks.map((check, index) => {
      const serviceName = ['supabase', 'database', 'redis'][index];
      if (check.status === 'fulfilled') {
        return { ...check.value, service: serviceName };
      } else {
        return { service: serviceName, status: 'unhealthy', error: check.reason };
      }
    });

    const overallStatus = services.filter(s => s.status === 'healthy').length > 0 ? 'healthy' : 'degraded';

    const health = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      environment: env.NODE_ENV,
      uptime: process.uptime(),
      services,
    };

    const statusCode = overallStatus === 'healthy' ? 200 : 503;
    return c.json(health, statusCode);
  } catch (error: any) {
    logger.error({ err: error }, 'Detailed health check failed');
    return c.json({
      status: 'unhealthy',
      error: error.message,
    }, 500);
  }
});

/**
 * API version information
 */
app.get('/api', (c) => {
  return c.json({
    name: 'Aivo Platform API',
    version: process.env.npm_package_version || '1.0.0',
    description: 'Comprehensive educational platform API with Supabase integration',
    documentation: '/api/docs',
    supabase: {
      connected: true,
      url: env.SUPABASE_URL,
    },
    endpoints: {
      v1: '/api/v1',
      health: '/health',
      healthDetailed: '/health/detailed',
    },
  });
});

/**
 * API v1 routes
 */
const v1Routes = new Hono();

v1Routes.get('/', (c) => {
  return c.json({
    message: 'Aivo Platform API v1 - Supabase Ready',
    version: '1.0.0',
    supabase: {
      configured: true,
      url: env.SUPABASE_URL,
    },
    endpoints: [
      'GET /auth - Authentication endpoints (ready for implementation)',
      'GET /users - User management (Supabase ready)',
      'GET /students - Student management (Supabase ready)',
      'GET /assessments - Assessment system (Supabase ready)',
      'GET /ai - AI-powered features (Supabase ready)',
      'GET /curriculum - Curriculum management (Supabase ready)',
      'GET /subscriptions - Subscription management (Supabase ready)',
      'GET /analytics - Analytics and reporting (Supabase ready)',
      'GET /admin - Administrative functions (Supabase ready)',
    ],
  });
});

// Mount v1 routes
app.route('/api/v1', v1Routes);

/**
 * 404 handler
 */
app.notFound((c) => {
  return c.json({
    error: 'Not Found',
    message: 'The requested resource was not found',
    path: c.req.path,
  }, 404);
});

/**
 * Global error handler
 */
app.onError((error, c) => {
  logger.error({
    err: error,
    path: c.req.path,
    method: c.req.method,
    headers: c.req.header(),
  }, 'Unhandled error occurred');

  const isDevelopment = env.NODE_ENV === 'development';
  
  return c.json({
    error: 'Internal Server Error',
    message: isDevelopment ? error.message : 'An unexpected error occurred',
    ...(isDevelopment && { stack: error.stack }),
  }, 500);
});

/**
 * Initialize application dependencies
 */
async function initializeApp() {
  try {
    logger.info('Initializing Aivo Platform API with Supabase...');

    // Initialize Supabase connection
    logger.info('Connecting to Supabase...');
    await initializeSupabase();

    logger.info('Supabase services initialized successfully');
  } catch (error: any) {
    logger.error({ err: error }, 'Failed to initialize application');
    throw error;
  }
}

/**
 * Graceful shutdown handler
 */
async function gracefulShutdown(signal: string) {
  logger.info({ signal }, 'Received shutdown signal, starting graceful shutdown...');
  
  try {
    logger.info('Graceful shutdown completed');
    process.exit(0);
  } catch (error: any) {
    logger.error({ err: error }, 'Error during graceful shutdown');
    process.exit(1);
  }
}

/**
 * Start the server
 */
async function startServer() {
  try {
    // Initialize application dependencies
    await initializeApp();

    // Start the HTTP server
    serve({
      fetch: app.fetch,
      port: env.PORT,
      hostname: env.HOST,
    });

    logger.info({
      port: env.PORT,
      host: env.HOST,
      environment: env.NODE_ENV,
      supabase: env.SUPABASE_URL,
    }, 'Aivo Platform API server started successfully with Supabase');

    console.log('\n🚀 Aivo Platform API Server Started!');
    console.log(`📍 Server: http://${env.HOST}:${env.PORT}`);
    console.log(`🏥 Health: http://${env.HOST}:${env.PORT}/health`);
    console.log(`📊 Detailed Health: http://${env.HOST}:${env.PORT}/health/detailed`);
    console.log(`📚 API Info: http://${env.HOST}:${env.PORT}/api`);
    console.log(`🔗 API v1: http://${env.HOST}:${env.PORT}/api/v1`);
    console.log(`🔗 Supabase: ${env.SUPABASE_URL}`);
    console.log('\n✨ Ready to accept requests! 🎉\n');

    // Setup graceful shutdown handlers
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    
    process.on('uncaughtException', (error) => {
      logger.error({ err: error }, 'Uncaught exception occurred');
      gracefulShutdown('uncaughtException');
    });
    
    process.on('unhandledRejection', (reason, promise) => {
      logger.error({ reason, promise }, 'Unhandled promise rejection');
      gracefulShutdown('unhandledRejection');
    });

  } catch (error: any) {
    logger.error({ err: error }, 'Failed to start server');
    process.exit(1);
  }
}

// Start the application
if (import.meta.url === `file://${process.argv[1]}`) {
  startServer();
}

export default app;