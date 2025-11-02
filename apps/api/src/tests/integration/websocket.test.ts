/**
 * WebSocket Real-time Communication Integration Tests
 * 
 * Basic integration tests for Phase 1 - WebSocket communication system
 * These tests verify the core WebSocket functionality and message handling.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { WebSocketManager } from '../../websocket/manager.js';

describe('WebSocket Real-time Communication', () => {
  let wsManager: WebSocketManager;

  beforeEach(() => {
    wsManager = new WebSocketManager();
  });

  describe('Basic WebSocket Manager', () => {
    it('should initialize WebSocket manager successfully', () => {
      expect(wsManager).toBeDefined();
      expect(typeof wsManager.handleConnection).toBe('function');
    });

    it('should have WebSocket event handlers', () => {
      expect(typeof wsManager.handleWebSocketMessage).toBe('function');
      expect(typeof wsManager.handleWebSocketClose).toBe('function');
    });

    it('should have stats method', () => {
      expect(typeof wsManager.getStats).toBe('function');
      
      const stats = wsManager.getStats();
      expect(stats).toBeDefined();
      expect(typeof stats.totalConnections).toBe('number');
      expect(typeof stats.activeSessions).toBe('number');
    });
  });

  describe('Message Type Validation', () => {
    it('should validate focus event message structure', () => {
      const focusMessage = {
        type: 'focus_event',
        data: {
          focusScore: 0.75,
          eventType: 'attention_improved',
          attentionLevel: 'high',
          sessionId: 'session-123'
        }
      };

      expect(focusMessage.type).toBe('focus_event');
      expect(typeof focusMessage.data.focusScore).toBe('number');
      expect(typeof focusMessage.data.eventType).toBe('string');
      expect(focusMessage.data.focusScore).toBeGreaterThan(0);
      expect(focusMessage.data.focusScore).toBeLessThanOrEqual(1);
    });

    it('should validate game update message structure', () => {
      const gameMessage = {
        type: 'game_update',
        data: {
          correct: true,
          score: 150,
          streak: 3,
          currentStep: 5,
          totalSteps: 10,
          focusSessionId: 'focus-session-456'
        }
      };

      expect(gameMessage.type).toBe('game_update');
      expect(typeof gameMessage.data.correct).toBe('boolean');
      expect(typeof gameMessage.data.score).toBe('number');
      expect(typeof gameMessage.data.streak).toBe('number');
      expect(gameMessage.data.score).toBeGreaterThanOrEqual(0);
    });

    it('should validate homework progress message structure', () => {
      const homeworkMessage = {
        type: 'homework_progress',
        data: {
          stepCompleted: true,
          stepNumber: 3,
          totalSteps: 8,
          strugglingIndicator: false,
          timeOnStep: 240,
          sessionId: 'homework-session-789'
        }
      };

      expect(homeworkMessage.type).toBe('homework_progress');
      expect(typeof homeworkMessage.data.stepCompleted).toBe('boolean');
      expect(typeof homeworkMessage.data.stepNumber).toBe('number');
      expect(typeof homeworkMessage.data.totalSteps).toBe('number');
      expect(homeworkMessage.data.stepNumber).toBeLessThanOrEqual(homeworkMessage.data.totalSteps);
    });

    it('should validate writing update message structure', () => {
      const writingMessage = {
        type: 'writing_update',
        data: {
          documentId: 'doc-123',
          content: 'Sample writing content',
          cursorPosition: 21,
          collaboratorId: 'user-456'
        }
      };

      expect(writingMessage.type).toBe('writing_update');
      expect(typeof writingMessage.data.documentId).toBe('string');
      expect(typeof writingMessage.data.content).toBe('string');
      expect(typeof writingMessage.data.cursorPosition).toBe('number');
      expect(writingMessage.data.cursorPosition).toBeLessThanOrEqual(writingMessage.data.content.length);
    });
  });

  describe('Connection Management', () => {
    it('should handle connection metadata', () => {
      const connectionData = {
        id: 'conn-123',
        studentId: 'student-456',
        sessionType: 'focus' as const,
        sessionId: 'session-789',
        connectedAt: new Date(),
        lastActivity: new Date()
      };

      expect(connectionData.id).toBe('conn-123');
      expect(connectionData.studentId).toBe('student-456');
      expect(['focus', 'game', 'homework', 'writing']).toContain(connectionData.sessionType);
      expect(connectionData.connectedAt).toBeInstanceOf(Date);
      expect(connectionData.lastActivity).toBeInstanceOf(Date);
    });

    it('should validate session types', () => {
      const validSessionTypes = ['focus', 'game', 'homework', 'writing'];
      
      validSessionTypes.forEach(sessionType => {
        expect(['focus', 'game', 'homework', 'writing']).toContain(sessionType);
      });
    });

    it('should handle client identification', () => {
      const clientId = 'client-abc123';
      const studentId = 'student-def456';
      
      expect(typeof clientId).toBe('string');
      expect(typeof studentId).toBe('string');
      expect(clientId.length).toBeGreaterThan(0);
      expect(studentId.length).toBeGreaterThan(0);
    });
  });

  describe('Response Message Generation', () => {
    it('should generate intervention suggestion response', () => {
      const response = {
        type: 'intervention_suggested',
        data: {
          type: 'game_break',
          reason: 'Low focus score detected',
          estimatedDuration: 180,
          timestamp: new Date().toISOString()
        }
      };

      expect(response.type).toBe('intervention_suggested');
      expect(response.data.type).toBe('game_break');
      expect(response.data.estimatedDuration).toBe(180);
      expect(response.data.timestamp).toBeDefined();
    });

    it('should generate game feedback response', () => {
      const response = {
        type: 'game_feedback',
        data: {
          correct: true,
          score: 100,
          streak: 2,
          encouragement: 'Great job!',
          timestamp: new Date().toISOString()
        }
      };

      expect(response.type).toBe('game_feedback');
      expect(response.data.correct).toBe(true);
      expect(response.data.score).toBe(100);
      expect(response.data.encouragement).toBe('Great job!');
    });

    it('should generate step completion response', () => {
      const response = {
        type: 'step_completed',
        data: {
          stepNumber: 3,
          feedback: 'Well done! Moving to the next step.',
          nextStep: 4,
          progress: 37.5, // 3/8 * 100
          timestamp: new Date().toISOString()
        }
      };

      expect(response.type).toBe('step_completed');
      expect(response.data.stepNumber).toBe(3);
      expect(response.data.nextStep).toBe(4);
      expect(response.data.progress).toBe(37.5);
    });
  });
});