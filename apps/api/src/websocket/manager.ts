import type { WSContext } from 'hono/ws';
import { logger } from '../config/logger.js';

/**
 * WebSocket Handlers for Real-time Communication
 * 
 * Handles real-time updates for focus monitoring, game state,
 * homework assistance, and writing collaboration.
 */

interface WSMessage {
  type: string;
  data: Record<string, unknown>;
  timestamp: string;
  clientId?: string;
}

interface FocusEventData {
  sessionId: string;
  attentionScore: number;
  distractionType?: string;
  timestamp: Date;
}

interface GameUpdateData {
  sessionId: string;
  gameId: string;
  progress: number;
  score: number;
  currentLevel?: number;
}

interface HomeworkProgressData {
  sessionId: string;
  stepId: string;
  completed: boolean;
  hintsUsed?: number;
  timeSpent?: number;
}

interface WritingUpdateData {
  documentId: string;
  content: string;
  cursorPosition: number;
  collaboratorId: string;
}

interface ClientConnection {
  id: string;
  ws: WSContext;
  studentId?: string;
  sessionType?: 'focus' | 'game' | 'homework' | 'writing';
  sessionId?: string;
  connectedAt: Date;
  lastActivity: Date;
}

class WebSocketManager {
  private connections = new Map<string, ClientConnection>();
  private sessionConnections = new Map<string, Set<string>>(); // sessionId -> clientIds

  /**
   * Handle new WebSocket connection
   */
  handleConnection(ws: WSContext, clientId: string) {
    logger.info({ clientId }, 'New WebSocket connection established');
    
    const connection: ClientConnection = {
      id: clientId,
      ws,
      connectedAt: new Date(),
      lastActivity: new Date()
    };
    
    this.connections.set(clientId, connection);

    // Send connection confirmation
    this.sendMessage(clientId, {
      type: 'connection_established',
      data: { clientId, timestamp: new Date().toISOString() }
    });
  }

  /**
   * Handle WebSocket message (to be called from route handler)
   */
  handleWebSocketMessage(clientId: string, message: string) {
    try {
      const parsedMessage: WSMessage = JSON.parse(message);
      this.handleMessage(clientId, parsedMessage);
    } catch (error) {
      logger.error({ err: error, clientId }, 'Failed to parse WebSocket message');
      this.sendError(clientId, 'Invalid message format');
    }
  }

  /**
   * Handle WebSocket close (to be called from route handler)
   */
  handleWebSocketClose(clientId: string) {
    this.handleDisconnection(clientId);
  }

  /**
   * Handle incoming WebSocket messages
   */
  private handleMessage(clientId: string, message: WSMessage) {
    const connection = this.connections.get(clientId);
    if (!connection) return;

    connection.lastActivity = new Date();

    logger.debug({ clientId, messageType: message.type }, 'Received WebSocket message');

    switch (message.type) {
      case 'join_session':
        this.handleJoinSession(clientId, message.data);
        break;
      case 'leave_session':
        this.handleLeaveSession(clientId, message.data);
        break;
      case 'focus_event':
        this.handleFocusEvent(clientId, message.data);
        break;
      case 'game_update':
        this.handleGameUpdate(clientId, message.data);
        break;
      case 'homework_progress':
        this.handleHomeworkProgress(clientId, message.data);
        break;
      case 'writing_update':
        this.handleWritingUpdate(clientId, message.data);
        break;
      case 'ping':
        this.sendMessage(clientId, { type: 'pong', data: { timestamp: new Date().toISOString() } });
        break;
      default:
        logger.warn({ clientId, messageType: message.type }, 'Unknown message type');
        this.sendError(clientId, `Unknown message type: ${message.type}`);
    }
  }

  /**
   * Handle client joining a session
   */
  private handleJoinSession(clientId: string, data: Record<string, unknown>) {
    const connection = this.connections.get(clientId);
    if (!connection) return;

    const { sessionId, sessionType, studentId } = data;
    
    // Type checking for unknown values
    if (typeof sessionId === 'string') {
      connection.sessionId = sessionId;
    }
    if (typeof sessionType === 'string' && ['focus', 'game', 'homework', 'writing'].includes(sessionType)) {
      connection.sessionType = sessionType as 'focus' | 'game' | 'homework' | 'writing';
    }
    if (typeof studentId === 'string') {
      connection.studentId = studentId;
    }

    // Add to session connections
    if (typeof sessionId === 'string') {
      if (!this.sessionConnections.has(sessionId)) {
        this.sessionConnections.set(sessionId, new Set());
      }
      this.sessionConnections.get(sessionId)!.add(clientId);
    }

    logger.info({ clientId, sessionId, sessionType, studentId }, 'Client joined session');

    // Confirm session join
    this.sendMessage(clientId, {
      type: 'session_joined',
      data: { sessionId, sessionType, timestamp: new Date().toISOString() }
    });

    // Notify other session participants (for collaborative features)
    if (typeof sessionId === 'string') {
      this.broadcastToSession(sessionId, {
        type: 'participant_joined',
        data: { clientId, studentId, sessionType, timestamp: new Date().toISOString() }
      }, [clientId]);
    }
  }

  /**
   * Handle client leaving a session
   */
  private handleLeaveSession(clientId: string, _data: Record<string, unknown>) {
    const connection = this.connections.get(clientId);
    if (!connection || !connection.sessionId) return;

    const sessionId = connection.sessionId;
    
    // Remove from session connections
    const sessionClients = this.sessionConnections.get(sessionId);
    if (sessionClients) {
      sessionClients.delete(clientId);
      if (sessionClients.size === 0) {
        this.sessionConnections.delete(sessionId);
      }
    }

    logger.info({ clientId, sessionId }, 'Client left session');

    // Notify other session participants
    this.broadcastToSession(sessionId, {
      type: 'participant_left',
      data: { clientId, studentId: connection.studentId, timestamp: new Date().toISOString() }
    }, [clientId]);

    connection.sessionId = undefined;
    connection.sessionType = undefined;
  }

  /**
   * Handle focus monitoring events
   */
  private handleFocusEvent(clientId: string, data: Record<string, unknown>) {
    const connection = this.connections.get(clientId);
    if (!connection || connection.sessionType !== 'focus') return;

    // TODO: Process focus event through Focus Guardian Agent
    // TODO: Check if intervention is needed
    // TODO: Update real-time dashboard

    logger.debug({ clientId, eventType: data.eventType }, 'Processing focus event');

    // Example: Send intervention if focus score drops
    if (data.focusScore < 0.3 && data.eventType === 'distraction_detected') {
      this.sendMessage(clientId, {
        type: 'intervention_suggested',
        data: {
          type: 'game_break',
          reason: 'Low focus score detected',
          estimatedDuration: 180, // 3 minutes
          timestamp: new Date().toISOString()
        }
      });
    }

    // Broadcast real-time metrics to dashboard (teacher/parent view)
    if (connection.sessionId) {
      this.broadcastToSession(connection.sessionId, {
        type: 'focus_metrics_update',
        data: {
          studentId: connection.studentId,
          focusScore: data.focusScore,
          attentionLevel: data.attentionLevel,
          timestamp: new Date().toISOString()
        }
      }, [clientId]);
    }
  }

  /**
   * Handle game state updates
   */
  private handleGameUpdate(clientId: string, data: Record<string, unknown>) {
    const connection = this.connections.get(clientId);
    if (!connection || connection.sessionType !== 'game') return;

    logger.debug({ clientId, gameId: data.gameId }, 'Processing game update');

    // TODO: Update game state through Game Generation Agent
    // TODO: Calculate real-time progress and performance

    // Send real-time feedback
    this.sendMessage(clientId, {
      type: 'game_feedback',
      data: {
        correct: data.correct,
        score: data.score,
        streak: data.streak,
        encouragement: data.correct ? 'Great job!' : 'Keep trying!',
        timestamp: new Date().toISOString()
      }
    });

    // Update focus session if this is an intervention game
    if (data.focusSessionId) {
      this.broadcastToSession(data.focusSessionId, {
        type: 'intervention_progress',
        data: {
          gameProgress: (data.currentStep / data.totalSteps) * 100,
          focusImprovement: data.focusImprovement || 0,
          timestamp: new Date().toISOString()
        }
      }, [clientId]);
    }
  }

  /**
   * Handle homework progress updates
   */
  private handleHomeworkProgress(clientId: string, data: Record<string, unknown>) {
    const connection = this.connections.get(clientId);
    if (!connection || connection.sessionType !== 'homework') return;

    logger.debug({ clientId, sessionId: data.sessionId }, 'Processing homework progress');

    // TODO: Update homework session through Homework Helper Agent
    // TODO: Provide real-time guidance and feedback

    // Send step completion confirmation
    if (data.stepCompleted) {
      this.sendMessage(clientId, {
        type: 'step_completed',
        data: {
          stepNumber: data.stepNumber,
          feedback: 'Well done! Moving to the next step.',
          nextStep: data.stepNumber + 1,
          progress: (data.stepNumber / data.totalSteps) * 100,
          timestamp: new Date().toISOString()
        }
      });
    }

    // Send real-time hints if student is struggling
    if (data.strugglingIndicator && data.timeOnStep > 300) { // 5 minutes
      this.sendMessage(clientId, {
        type: 'hint_available',
        data: {
          message: 'It looks like you might need a hint. Would you like some help?',
          hintAvailable: true,
          timestamp: new Date().toISOString()
        }
      });
    }
  }

  /**
   * Handle writing document updates
   */
  private handleWritingUpdate(clientId: string, data: Record<string, unknown>) {
    const connection = this.connections.get(clientId);
    if (!connection || connection.sessionType !== 'writing') return;

    logger.debug({ clientId, documentId: data.documentId }, 'Processing writing update');

    // TODO: Update document content through Writing Helper Agent
    // TODO: Provide real-time grammar and style feedback

    // Broadcast collaborative updates to other editors
    if (connection.sessionId && data.collaborative) {
      this.broadcastToSession(connection.sessionId, {
        type: 'document_updated',
        data: {
          documentId: data.documentId,
          changes: data.changes,
          author: connection.studentId,
          timestamp: new Date().toISOString()
        }
      }, [clientId]);
    }

    // Send real-time writing assistance
    if (data.requestFeedback) {
      this.sendMessage(clientId, {
        type: 'writing_feedback',
        data: {
          suggestions: [
            {
              type: 'grammar',
              position: data.cursorPosition,
              suggestion: 'Consider checking this sentence structure',
              severity: 'low'
            }
          ],
          wordCount: data.wordCount,
          readabilityScore: 0.75,
          timestamp: new Date().toISOString()
        }
      });
    }
  }

  /**
   * Handle client disconnection
   */
  private handleDisconnection(clientId: string) {
    const connection = this.connections.get(clientId);
    if (!connection) return;

    logger.info({ clientId, sessionId: connection.sessionId }, 'WebSocket client disconnected');

    // Remove from session if joined
    if (connection.sessionId) {
      const sessionClients = this.sessionConnections.get(connection.sessionId);
      if (sessionClients) {
        sessionClients.delete(clientId);
        if (sessionClients.size === 0) {
          this.sessionConnections.delete(connection.sessionId);
        }
      }

      // Notify other session participants
      this.broadcastToSession(connection.sessionId, {
        type: 'participant_disconnected',
        data: { clientId, studentId: connection.studentId, timestamp: new Date().toISOString() }
      }, [clientId]);
    }

    // Remove connection
    this.connections.delete(clientId);
  }

  /**
   * Send message to specific client
   */
  private sendMessage(clientId: string, message: { type: string; data: Record<string, unknown> }) {
    const connection = this.connections.get(clientId);
    if (!connection) return;

    try {
      const wsMessage: WSMessage = {
        ...message,
        timestamp: new Date().toISOString(),
        clientId
      };

      connection.ws.send(JSON.stringify(wsMessage));
    } catch (error) {
      logger.error({ err: error, clientId }, 'Failed to send WebSocket message');
    }
  }

  /**
   * Send error message to client
   */
  private sendError(clientId: string, error: string) {
    this.sendMessage(clientId, {
      type: 'error',
      data: { error, timestamp: new Date().toISOString() }
    });
  }

  /**
   * Broadcast message to all clients in a session
   */
  private broadcastToSession(sessionId: string, message: { type: string; data: Record<string, unknown> }, excludeClients: string[] = []) {
    const sessionClients = this.sessionConnections.get(sessionId);
    if (!sessionClients) return;

    for (const clientId of sessionClients) {
      if (!excludeClients.includes(clientId)) {
        this.sendMessage(clientId, message);
      }
    }
  }

  /**
   * Broadcast message to all connected clients
   */
  broadcastToAll(message: { type: string; data: Record<string, unknown> }, excludeClients: string[] = []) {
    for (const clientId of this.connections.keys()) {
      if (!excludeClients.includes(clientId)) {
        this.sendMessage(clientId, message);
      }
    }
  }

  /**
   * Send intervention notification
   */
  sendInterventionNotification(sessionId: string, intervention: Record<string, unknown>) {
    this.broadcastToSession(sessionId, {
      type: 'intervention_triggered',
      data: {
        ...intervention,
        timestamp: new Date().toISOString()
      }
    });
  }

  /**
   * Send focus alert to monitoring dashboard
   */
  sendFocusAlert(sessionId: string, alert: Record<string, unknown>) {
    this.broadcastToSession(sessionId, {
      type: 'focus_alert',
      data: {
        ...alert,
        timestamp: new Date().toISOString()
      }
    });
  }

  /**
   * Get connection statistics
   */
  getStats() {
    const now = new Date();
    const connections = Array.from(this.connections.values());
    
    return {
      totalConnections: connections.length,
      activeSessions: this.sessionConnections.size,
      connectionsByType: {
        focus: connections.filter(c => c.sessionType === 'focus').length,
        game: connections.filter(c => c.sessionType === 'game').length,
        homework: connections.filter(c => c.sessionType === 'homework').length,
        writing: connections.filter(c => c.sessionType === 'writing').length
      },
      averageConnectionDuration: connections.reduce((sum, c) => 
        sum + (now.getTime() - c.connectedAt.getTime()), 0) / connections.length / 1000 / 60 // minutes
    };
  }

  /**
   * Cleanup inactive connections
   */
  cleanupInactiveConnections() {
    const now = new Date();
    const inactiveThreshold = 30 * 60 * 1000; // 30 minutes

    for (const [clientId, connection] of this.connections.entries()) {
      if (now.getTime() - connection.lastActivity.getTime() > inactiveThreshold) {
        logger.info({ clientId }, 'Cleaning up inactive connection');
        this.handleDisconnection(clientId);
      }
    }
  }
}

// Singleton instance
export const wsManager = new WebSocketManager();

// Periodic cleanup of inactive connections
setInterval(() => {
  wsManager.cleanupInactiveConnections();
}, 5 * 60 * 1000); // Run every 5 minutes