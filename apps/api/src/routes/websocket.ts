import { Hono } from 'hono';
import { logger } from '../config/logger.js';
import { wsManager } from '../websocket/manager.js';

/**
 * WebSocket Routes
 * 
 * Provides WebSocket connection information and management endpoints.
 * Note: WebSocket upgrade handling will be implemented separately in the main server.
 */

const wsRoutes = new Hono();

/**
 * WebSocket connection endpoint information
 * GET /api/v1/ws
 */
wsRoutes.get('/', (c) => {
  return c.json({
    success: true,
    data: {
      websocketUrl: `ws://${c.req.header('host')}/ws`,
      protocols: ['focus-monitoring', 'game-updates', 'homework-assistance', 'writing-collaboration'],
      connectionInstructions: {
        connect: 'Connect to /ws endpoint with appropriate protocol',
        authenticate: 'Send join_session message with studentId and sessionType',
        messageFormat: 'JSON messages with type, data, and timestamp fields'
      },
      supportedMessageTypes: [
        'join_session', 'leave_session', 'focus_event', 'game_update',
        'homework_progress', 'writing_update', 'ping'
      ]
    }
  });
});

/**
 * WebSocket health check endpoint
 * GET /api/v1/ws/health
 */
wsRoutes.get('/health', (c) => {
  const stats = wsManager.getStats();
  
  return c.json({
    success: true,
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      connections: stats
    }
  });
});

/**
 * Broadcast message to all connected clients (admin endpoint)
 * POST /api/v1/ws/broadcast
 */
wsRoutes.post('/broadcast', async (c) => {
  try {
    const body = await c.req.json();
    
    // TODO: Add authentication/authorization for admin endpoints
    
    wsManager.broadcastToAll({
      type: body.type || 'system_message',
      data: body.data
    });
    
    logger.info({ messageType: body.type }, 'Broadcasted message to all clients');
    
    return c.json({
      success: true,
      message: 'Message broadcasted successfully'
    });
    
  } catch (error: any) {
    logger.error({ err: error }, 'Failed to broadcast message');
    return c.json({
      success: false,
      error: 'Failed to broadcast message'
    }, 500);
  }
});

export { wsRoutes };