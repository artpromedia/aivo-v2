import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { prettyJSON } from 'hono/pretty-json';


/**
 * Simple Aivo Platform API Server - Development Version
 */

// Create Hono application instance
const app = new Hono();

// Basic middleware
app.use('*', cors());
app.use('*', prettyJSON());

/**
 * Health check endpoint
 */
app.get('/health', (c) => {
  return c.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: 'development',
    uptime: process.uptime(),
  });
});

/**
 * API information endpoint
 */
app.get('/api', (c) => {
  return c.json({
    name: 'Aivo Platform API',
    version: '1.0.0',
    description: 'Comprehensive educational platform API',
    endpoints: {
      health: '/health',
      api: '/api',
      v1: '/api/v1',
    },
  });
});

/**
 * API v1 routes placeholder
 */
const v1Routes = new Hono();

v1Routes.get('/', (c) => {
  return c.json({
    message: 'Aivo Platform API v1',
    version: '1.0.0',
    status: 'Under Development',
    endpoints: [
      'GET /auth - Authentication endpoints (coming soon)',
      'GET /users - User management (coming soon)',
      'GET /students - Student management (coming soon)',
      'GET /assessments - Assessment system (coming soon)',
      'GET /ai - AI-powered features (coming soon)',
      'GET /curriculum - Curriculum management (coming soon)',
      'GET /subscriptions - Subscription management (coming soon)',
      'GET /analytics - Analytics and reporting (coming soon)',
      'GET /admin - Administrative functions (coming soon)',
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
  console.error('Error occurred:', error);
  
  return c.json({
    error: 'Internal Server Error',
    message: 'An unexpected error occurred',
    ...(process.env.NODE_ENV === 'development' && { 
      details: error.message,
      stack: error.stack 
    }),
  }, 500);
});

/**
 * Start the server
 */
const port = parseInt(process.env.PORT || '3000');
const hostname = process.env.HOST || 'localhost';

console.log('🚀 Starting Aivo Platform API...');

serve({
  fetch: app.fetch,
  port,
  hostname,
});

console.log(`✅ Aivo Platform API server started successfully`);
console.log(`🚀 Server running at http://${hostname}:${port}`);
console.log(`🏥 Health check: http://${hostname}:${port}/health`);
console.log(`📚 API info: http://${hostname}:${port}/`);
console.log(`🔗 API v1: http://${hostname}:${port}/api/v1`);
console.log('');
console.log('Ready to accept requests! 🎉');

export default app;