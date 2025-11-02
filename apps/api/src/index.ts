import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';

import { prettyJSON } from 'hono/pretty-json';
import { secureHeaders } from 'hono/secure-headers';
import { trimTrailingSlash } from 'hono/trailing-slash';

import { env } from './config/env.js';
import { logger, logRequest } from './config/logger.js';
import { initializeDatabase } from './config/database.js';
import { initializeRedis } from './config/redis.js';
import { initializeSupabase, checkSupabaseHealth } from './config/supabase.js';

/**
 * Aivo Platform API Server
 * 
 * A comprehensive educational platform API built with Hono.js
 * Provides endpoints for student assessment, curriculum management,
 * AI-powered learning assistance, and administrative functions.
 */

// Create Hono application instance
const app = new Hono();

/**
 * Global middleware configuration
 */

// Security headers
app.use('*', secureHeaders({
  crossOriginEmbedderPolicy: false, // Allow embedding for educational content
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

// Rate limiting middleware (will be implemented later)
// app.use('*', rateLimitMiddleware);

/**
 * Health check endpoints
 */
app.get('/health', async (c) => {
  try {
    // Basic health check
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
      // Database health check (will be implemented)
      Promise.resolve({ service: 'database', status: 'healthy' }),
      // Redis health check (will be implemented)
      Promise.resolve({ service: 'redis', status: 'healthy' }),
      // Supabase health check
      checkSupabaseHealth(),
    ]);

    const services = checks.map((check, index) => {
      const serviceName = ['database', 'redis', 'supabase'][index];
      if (check.status === 'fulfilled') {
        return { ...check.value, service: serviceName };
      } else {
        return { service: serviceName, status: 'unhealthy', error: check.reason };
      }
    });

    const overallStatus = services.every(s => s.status === 'healthy') ? 'healthy' : 'degraded';

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
    description: 'Comprehensive educational platform API',
    documentation: '/api/docs',
    endpoints: {
      v1: '/api/v1',
      health: '/health',
      metrics: '/metrics',
    },
  });
});

// Import new route modules
import { focusRoutes, gamesRoutes, homeworkRoutes, writingRoutes, wsRoutes } from './routes/index.js';

/**
 * API v1 routes
 */
const v1Routes = new Hono();

// Focus monitoring routes
v1Routes.route('/focus', focusRoutes);

// Game generation routes
v1Routes.route('/games', gamesRoutes);

// Homework assistance routes
v1Routes.route('/homework', homeworkRoutes);

// Writing pad routes
v1Routes.route('/writing', writingRoutes);

// WebSocket routes
v1Routes.route('/ws', wsRoutes);

// Authentication routes (to be implemented)
// v1Routes.route('/auth', authRoutes);

// User management routes (to be implemented)
// v1Routes.route('/users', userRoutes);

// Student management routes (to be implemented)
// v1Routes.route('/students', studentRoutes);

// Assessment routes (to be implemented)
// v1Routes.route('/assessments', assessmentRoutes);

// AI/Chat routes (to be implemented)
// v1Routes.route('/ai', aiRoutes);

// Curriculum routes (to be implemented)
// v1Routes.route('/curriculum', curriculumRoutes);

// Subscription/billing routes (to be implemented)
// v1Routes.route('/subscriptions', subscriptionRoutes);

// Analytics routes (to be implemented)
// v1Routes.route('/analytics', analyticsRoutes);

// Admin routes (to be implemented)
// v1Routes.route('/admin', adminRoutes);

// API v1 overview
v1Routes.get('/', (c) => {
  return c.json({
    message: 'Aivo Platform API v1',
    version: '1.0.0',
    description: 'Enhanced AI-powered educational platform with Phase 1 features',
    endpoints: {
      focus: 'GET /focus - Focus monitoring and attention tracking',
      games: 'GET /games - Educational game generation and management', 
      homework: 'GET /homework - AI-powered homework assistance',
      writing: 'GET /writing - Digital writing pad with real-time feedback',
      websocket: 'GET /ws - WebSocket connections for real-time features',
      // Future endpoints
      auth: 'GET /auth - Authentication endpoints (coming soon)',
      users: 'GET /users - User management (coming soon)',
      students: 'GET /students - Student management (coming soon)',
      assessments: 'GET /assessments - Assessment system (coming soon)',
      ai: 'GET /ai - AI-powered features (coming soon)',
      curriculum: 'GET /curriculum - Curriculum management (coming soon)',
      subscriptions: 'GET /subscriptions - Subscription management (coming soon)',
      analytics: 'GET /analytics - Analytics and reporting (coming soon)',
      admin: 'GET /admin - Administrative functions (coming soon)',
    },
    phase1Features: {
      focusGuardian: 'Real-time attention monitoring with privacy controls',
      gameGeneration: 'Age-appropriate educational games with adaptive difficulty',
      homeworkHelper: 'Step-by-step homework assistance with personalized guidance',
      writingPad: 'Digital writing with real-time feedback and collaboration',
      realTimeUpdates: 'WebSocket support for live interactions'
    }
  });
});

// Mount v1 routes
app.route('/api/v1', v1Routes);

/**
 * Metrics endpoint (for monitoring)
 */
app.get('/metrics', (c) => {
  // This will be implemented with proper metrics collection
  return c.text('# Metrics endpoint - to be implemented');
});

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

  // Don't expose internal errors in production
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
    logger.info('Initializing Aivo Platform API...');

    // Initialize database connection
    logger.info('Connecting to database...');
    await initializeDatabase();

    // Initialize Redis connection
    logger.info('Connecting to Redis...');
    await initializeRedis();

    // Initialize Supabase connection
    logger.info('Connecting to Supabase...');
    await initializeSupabase();

    logger.info('All services initialized successfully');
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
    // Close database connections
    logger.info('Closing database connections...');
    // await closeDatabaseConnection();
    
    // Close Redis connections
    logger.info('Closing Redis connections...');
    // await closeRedisConnection();
    
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
    }, 'Aivo Platform API server started successfully');

    // Setup graceful shutdown handlers
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    
    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      logger.error({ err: error }, 'Uncaught exception occurred');
      gracefulShutdown('uncaughtException');
    });
    
    // Handle unhandled promise rejections
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