import pino from 'pino';
import { env, isDevelopment } from './env.js';

/**
 * Logger configuration for structured logging
 * Uses Pino for high-performance JSON logging in production
 * and pretty printing in development
 */

// Determine log level based on environment
const logLevel = env.LOG_LEVEL || (isDevelopment ? 'debug' : 'info');

// Configure pretty printing for development
const prettyPrint = isDevelopment && env.LOG_FORMAT !== 'json' ? {
  target: 'pino-pretty',
  options: {
    colorize: true,
    translateTime: 'HH:MM:ss Z',
    ignore: 'pid,hostname',
    singleLine: false,
  },
} : undefined;

/**
 * Main application logger
 */
export const logger = pino({
  level: logLevel,
  transport: prettyPrint,
  
  // Base fields for all log entries
  base: {
    service: 'aivo-api',
    version: process.env.npm_package_version || '1.0.0',
    environment: env.NODE_ENV,
  },

  // Timestamp configuration
  timestamp: () => `,"time":"${new Date().toISOString()}"`,

  // Serializers for common objects
  serializers: {
    req: pino.stdSerializers.req,
    res: pino.stdSerializers.res,
    err: pino.stdSerializers.err,
    
    // Custom serializer for user context (avoid logging sensitive data)
    user: (user: any) => {
      if (!user) return undefined;
      return {
        id: user.id,
        role: user.role,
        tenantId: user.tenantId,
      };
    },

    // Custom serializer for request context
    context: (ctx: any) => {
      if (!ctx) return undefined;
      return {
        requestId: ctx.requestId,
        tenantId: ctx.tenantId,
        userId: ctx.userId,
        userAgent: ctx.userAgent,
        ip: ctx.ip,
      };
    },
  },

  // Redact sensitive fields
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      'password',
      'token',
      'secret',
      'key',
      'apiKey',
      '*.password',
      '*.token',
      '*.secret',
      '*.key',
    ],
    censor: '[REDACTED]',
  },
});

/**
 * Create child logger with additional context
 */
export function createChildLogger(context: Record<string, any>) {
  return logger.child(context);
}

/**
 * Logger for authentication events
 */
export const authLogger = logger.child({ component: 'auth' });

/**
 * Logger for database operations
 */
export const dbLogger = logger.child({ component: 'database' });

/**
 * Logger for API routes
 */
export const apiLogger = logger.child({ component: 'api' });

/**
 * Logger for WebSocket events
 */
export const wsLogger = logger.child({ component: 'websocket' });

/**
 * Logger for background jobs and cron tasks
 */
export const jobLogger = logger.child({ component: 'jobs' });

/**
 * Logger for external service integrations
 */
export const integrationLogger = logger.child({ component: 'integrations' });

/**
 * Error logger with additional error tracking
 */
export function logError(error: Error, context?: Record<string, any>) {
  const errorLogger = context ? logger.child(context) : logger;
  
  errorLogger.error({
    err: error,
    stack: error.stack,
    message: error.message,
  }, 'Error occurred');

  // In production, you might want to send to error tracking service
  if (env.NODE_ENV === 'production' && env.SENTRY_DSN) {
    // Integration with Sentry or other error tracking would go here
    console.error('Error tracking integration needed');
  }
}

/**
 * Performance logger for timing operations
 */
export function createTimer(operation: string, context?: Record<string, any>) {
  const start = Date.now();
  const timerLogger = context ? logger.child(context) : logger;
  
  return {
    end: (additionalContext?: Record<string, any>) => {
      const duration = Date.now() - start;
      timerLogger.info({
        operation,
        duration,
        ...additionalContext,
      }, `${operation} completed in ${duration}ms`);
    },
  };
}

/**
 * Audit logger for security and compliance events
 */
export function logAuditEvent(event: {
  action: string;
  userId?: string;
  tenantId?: string;
  resourceType?: string;
  resourceId?: string;
  details?: Record<string, any>;
  ip?: string;
  userAgent?: string;
}) {
  logger.info({
    audit: true,
    ...event,
    timestamp: new Date().toISOString(),
  }, `Audit: ${event.action}`);
}

/**
 * Request logger middleware compatible with Hono
 */
export function logRequest(c: any, next: () => Promise<void>) {
  const start = Date.now();
  const requestId = crypto.randomUUID();
  
  // Add request ID to context
  c.set('requestId', requestId);
  
  const requestLogger = logger.child({
    requestId,
    method: c.req.method,
    path: c.req.path,
    query: c.req.query(),
    ip: c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || 'unknown',
    userAgent: c.req.header('user-agent'),
  });

  requestLogger.info('Request started');

  return next().then(() => {
    const duration = Date.now() - start;
    requestLogger.info({
      status: c.res.status,
      duration,
    }, 'Request completed');
  }).catch((error) => {
    const duration = Date.now() - start;
    requestLogger.error({
      err: error,
      status: c.res.status || 500,
      duration,
    }, 'Request failed');
    throw error;
  });
}

export default logger;