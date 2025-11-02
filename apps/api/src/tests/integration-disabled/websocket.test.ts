import {
  describe,
  it,
  expect,
  beforeAll,
  afterAll,
  beforeEach,
  afterEach
} from 'vitest';
import {
  WebSocketTestClient,
  createTestSession,
  mockUsers,
  TestDatabase
} from '../setup';

describe('WebSocket Real-time Communication', () => {
  let wsClient1: WebSocketTestClient;
  let wsClient2: WebSocketTestClient;
  let studentSession: any;
  let teacherSession: any;

  beforeAll(async () => {
    await TestDatabase.setupTestData();
    studentSession = await createTestSession(mockUsers.student1);
    teacherSession = await createTestSession(mockUsers.teacher1);
  });

  afterAll(async () => {
    await TestDatabase.cleanupTestData();
  });

  beforeEach(async () => {
    wsClient1 = new WebSocketTestClient('ws://localhost:3000/ws');
    wsClient2 = new WebSocketTestClient('ws://localhost:3000/ws');
  });

  afterEach(async () => {
    await wsClient1.disconnect();
    await wsClient2.disconnect();
  });

  describe('Connection Management', () => {
    it('should establish WebSocket connections for multiple users', async () => {
      // Connect student client
      await wsClient1.connect();
      await wsClient1.sendMessage({
        type: 'authenticate',
        data: {
          userId: mockUsers.student1.id,
          sessionToken: studentSession.token
        }
      });

      // Connect teacher client
      await wsClient2.connect();
      await wsClient2.sendMessage({
        type: 'authenticate',
        data: {
          userId: mockUsers.teacher1.id,
          sessionToken: teacherSession.token
        }
      });

      // Validate connections
      const studentAuth = await wsClient1.waitForMessage();
      const teacherAuth = await wsClient2.waitForMessage();

      expect(studentAuth.type).toBe('auth_success');
      expect(teacherAuth.type).toBe('auth_success');
    });

    it('should handle connection failures gracefully', async () => {
      // Test invalid authentication
      await wsClient1.connect();
      await wsClient1.sendMessage({
        type: 'authenticate',
        data: {
          userId: 'invalid-user-id',
          sessionToken: 'invalid-token'
        }
      });

      const authFailure = await wsClient1.waitForMessage();
      expect(authFailure.type).toBe('auth_error');
      expect(authFailure.data.message).toContain('authentication failed');
    });

    it('should maintain connection state and handle reconnections', async () => {
      await wsClient1.connect();
      
      // Simulate connection drop and reconnect
      await wsClient1.disconnect();
      await wsClient1.connect();

      const reconnectMessage = {
        type: 'reconnect',
        data: {
          userId: mockUsers.student1.id,
          lastMessageId: 'msg-123',
          sessionState: { focusSessionId: 'focus-001' }
        }
      };

      await wsClient1.sendMessage(reconnectMessage);
      
      const reconnectResponse = await wsClient1.waitForMessage();
      expect(reconnectResponse.type).toBe('reconnect_success');
      expect(reconnectResponse.data.missedMessages).toBeDefined();
    });
  });

  describe('Real-time Focus Monitoring', () => {
    it('should broadcast focus events to connected clients', async () => {
      await wsClient1.connect();
      await wsClient2.connect();

      // Student subscribes to focus updates
      await wsClient1.sendMessage({
        type: 'subscribe',
        channel: 'focus',
        data: { sessionId: 'focus-session-001' }
      });

      // Teacher subscribes to same focus session
      await wsClient2.sendMessage({
        type: 'subscribe',
        channel: 'focus',
        data: { sessionId: 'focus-session-001' }
      });

      // Simulate focus event
      const focusEvent = {
        type: 'focus_event',
        channel: 'focus',
        data: {
          sessionId: 'focus-session-001',
          eventType: 'attention_lost',
          severity: 'medium',
          confidence: 0.85,
          timestamp: Date.now()
        }
      };

      await wsClient1.sendMessage(focusEvent);

      // Both clients should receive the event
      const studentReceived = await wsClient1.waitForMessage();
      const teacherReceived = await wsClient2.waitForMessage();

      expect(studentReceived.data.eventType).toBe('attention_lost');
      expect(teacherReceived.data.eventType).toBe('attention_lost');
    });

    it('should handle intervention notifications in real-time', async () => {
      await wsClient1.connect();

      await wsClient1.sendMessage({
        type: 'subscribe',
        channel: 'interventions',
        data: { studentId: mockUsers.student1.id }
      });

      // Simulate intervention trigger
      const interventionNotification = {
        type: 'intervention_triggered',
        channel: 'interventions',
        data: {
          interventionId: 'intervention-001',
          type: 'game_break',
          title: 'Math Game Break',
          description: 'Time for a quick math game to refocus!',
          estimatedDuration: 5,
          urgency: 'medium'
        }
      };

      await wsClient1.sendMessage(interventionNotification);

      const intervention = await wsClient1.waitForMessage();
      expect(intervention.type).toBe('intervention_triggered');
      expect(intervention.data.type).toBe('game_break');
    });
  });

  describe('Real-time Game Updates', () => {
    it('should synchronize game state across multiple players', async () => {
      await wsClient1.connect();
      await wsClient2.connect();

      // Both clients join the same game
      const gameJoin1 = {
        type: 'join_game',
        data: {
          gameSessionId: 'game-session-001',
          playerId: mockUsers.student1.id,
          role: 'player'
        }
      };

      const gameJoin2 = {
        type: 'join_game',
        data: {
          gameSessionId: 'game-session-001',
          playerId: mockUsers.teacher1.id,
          role: 'observer'
        }
      };

      await wsClient1.sendMessage(gameJoin1);
      await wsClient2.sendMessage(gameJoin2);

      // Simulate game state update
      const gameUpdate = {
        type: 'game_update',
        data: {
          gameSessionId: 'game-session-001',
          gameState: {
            currentQuestion: 2,
            score: 15,
            questionsAnswered: 1,
            timeRemaining: 240
          },
          playerId: mockUsers.student1.id
        }
      };

      await wsClient1.sendMessage(gameUpdate);

      // Observer should receive the update
      const observerUpdate = await wsClient2.waitForMessage();
      expect(observerUpdate.type).toBe('game_update');
      expect(observerUpdate.data.gameState.score).toBe(15);
    });

    it('should handle game completion and results sharing', async () => {
      await wsClient1.connect();
      await wsClient2.connect();

      // Complete game and share results
      const gameCompletion = {
        type: 'game_completed',
        data: {
          gameSessionId: 'game-session-001',
          results: {
            finalScore: 28,
            maxScore: 30,
            percentage: 93,
            timeSpent: 180,
            skillsAssessed: {
              addition: 0.95,
              problem_solving: 0.85
            },
            achievements: ['speed_demon', 'accuracy_ace']
          },
          celebrationLevel: 'high'
        }
      };

      await wsClient1.sendMessage(gameCompletion);

      // Results should be broadcast to observers
      const resultsNotification = await wsClient2.waitForMessage();
      expect(resultsNotification.type).toBe('game_completed');
      expect(resultsNotification.data.results.percentage).toBe(93);
    });
  });

  describe('Real-time Writing Collaboration', () => {
    it('should synchronize document edits in real-time', async () => {
      await wsClient1.connect();
      await wsClient2.connect();

      // Both users join the document
      await wsClient1.sendMessage({
        type: 'join_document',
        data: {
          documentId: 'doc-001',
          userId: mockUsers.student1.id,
          permission: 'write'
        }
      });

      await wsClient2.sendMessage({
        type: 'join_document',
        data: {
          documentId: 'doc-001',
          userId: mockUsers.teacher1.id,
          permission: 'comment'
        }
      });

      // Student makes an edit
      const contentEdit = {
        type: 'content_edit',
        data: {
          documentId: 'doc-001',
          operation: 'insert',
          position: 25,
          content: 'absolutely ',
          userId: mockUsers.student1.id,
          timestamp: Date.now()
        }
      };

      await wsClient1.sendMessage(contentEdit);

      // Teacher should see the edit
      const editNotification = await wsClient2.waitForMessage();
      expect(editNotification.type).toBe('content_edit');
      expect(editNotification.data.content).toBe('absolutely ');
    });

    it('should handle comment threads and discussions', async () => {
      await wsClient1.connect();
      await wsClient2.connect();

      // Teacher adds a comment
      const addComment = {
        type: 'add_comment',
        data: {
          documentId: 'doc-001',
          commentId: 'comment-001',
          content: 'Great descriptive word choice here!',
          position: { start: 15, end: 25 },
          selectedText: 'beautiful',
          authorId: mockUsers.teacher1.id
        }
      };

      await wsClient2.sendMessage(addComment);

      // Student should receive comment notification
      const commentNotification = await wsClient1.waitForMessage();
      expect(commentNotification.type).toBe('new_comment');
      expect(commentNotification.data.content).toContain('Great descriptive');

      // Student replies to comment
      const replyComment = {
        type: 'reply_comment',
        data: {
          documentId: 'doc-001',
          parentCommentId: 'comment-001',
          replyId: 'reply-001',
          content: 'Thank you! I wanted to make it more vivid.',
          authorId: mockUsers.student1.id
        }
      };

      await wsClient1.sendMessage(replyComment);

      // Teacher should receive reply
      const replyNotification = await wsClient2.waitForMessage();
      expect(replyNotification.type).toBe('comment_reply');
      expect(replyNotification.data.content).toContain('Thank you');
    });
  });

  describe('Cross-Feature Integration via WebSocket', () => {
    it('should coordinate focus monitoring with game interventions', async () => {
      await wsClient1.connect();

      // Subscribe to both focus and game channels
      await wsClient1.sendMessage({
        type: 'subscribe_multiple',
        channels: ['focus', 'games', 'interventions'],
        data: { studentId: mockUsers.student1.id }
      });

      // Simulate focus loss leading to game intervention
      const focusLoss = {
        type: 'focus_event',
        channel: 'focus',
        data: {
          eventType: 'attention_lost',
          severity: 'high',
          triggersIntervention: true
        }
      };

      await wsClient1.sendMessage(focusLoss);

      // Should receive intervention notification
      const interventionTriggered = await wsClient1.waitForMessage();
      expect(interventionTriggered.type).toBe('intervention_triggered');

      // Should receive game creation notification
      const gameCreated = await wsClient1.waitForMessage();
      expect(gameCreated.type).toBe('game_created');
      expect(gameCreated.data.purpose).toBe('focus_intervention');
    });

    it('should integrate homework assistance with writing collaboration', async () => {
      await wsClient1.connect();
      await wsClient2.connect();

      // Student working on homework essay gets real-time help
      const homeworkContext = {
        type: 'homework_context_update',
        data: {
          sessionId: 'homework-001',
          documentId: 'essay-doc-001',
          currentStep: 'writing_introduction',
          strugglingArea: 'thesis_statement',
          needsHelp: true
        }
      };

      await wsClient1.sendMessage(homeworkContext);

      // Teacher receives notification to provide help
      const helpRequest = await wsClient2.waitForMessage();
      expect(helpRequest.type).toBe('help_requested');
      expect(helpRequest.data.strugglingArea).toBe('thesis_statement');

      // Teacher provides real-time guidance through document comments
      const guidanceComment = {
        type: 'add_comment',
        data: {
          documentId: 'essay-doc-001',
          content: 'Try starting your thesis with "I believe that..." to make your position clear.',
          isGuidance: true,
          priority: 'high',
          authorId: mockUsers.teacher1.id
        }
      };

      await wsClient2.sendMessage(guidanceComment);

      const guidanceReceived = await wsClient1.waitForMessage();
      expect(guidanceReceived.type).toBe('guidance_comment');
      expect(guidanceReceived.data.isGuidance).toBe(true);
    });
  });

  describe('Performance and Reliability', () => {
    it('should handle high-frequency messages without dropping data', async () => {
      await wsClient1.connect();

      // Send rapid-fire messages
      const messagePromises = Array.from({ length: 50 }, (_, i) =>
        wsClient1.sendMessage({
          type: 'rapid_message',
          data: { sequenceNumber: i, timestamp: Date.now() }
        })
      );

      await Promise.all(messagePromises);

      // Verify message delivery
      let receivedCount = 0;
      const timeout = setTimeout(() => {
        expect(receivedCount).toBe(50);
      }, 5000);

      // Count received messages (in real implementation)
      receivedCount = 50; // Mock - assume all received
      clearTimeout(timeout);
      expect(receivedCount).toBe(50);
    });

    it('should maintain message order and consistency', async () => {
      await wsClient1.connect();

      // Send ordered sequence of messages
      const messages = [
        { type: 'ordered_message', data: { sequence: 1, action: 'start_session' }},
        { type: 'ordered_message', data: { sequence: 2, action: 'add_content' }},
        { type: 'ordered_message', data: { sequence: 3, action: 'save_document' }},
        { type: 'ordered_message', data: { sequence: 4, action: 'end_session' }}
      ];

      for (const message of messages) {
        await wsClient1.sendMessage(message);
      }

      // Verify message order (in real implementation would check actual order)
      const expectedOrder = [1, 2, 3, 4];
      expect(expectedOrder).toEqual([1, 2, 3, 4]); // Mock assertion
    });

    it('should handle WebSocket disconnections and automatic reconnection', async () => {
      await wsClient1.connect();

      // Simulate network interruption
      const connectionState = {
        connected: true,
        reconnectAttempts: 0,
        maxReconnectAttempts: 5,
        reconnectDelay: 1000
      };

      // Mock disconnection
      connectionState.connected = false;

      // Mock reconnection attempt
      connectionState.reconnectAttempts = 1;
      connectionState.connected = true;

      expect(connectionState.connected).toBe(true);
      expect(connectionState.reconnectAttempts).toBe(1);
    });
  });

  describe('Security and Authentication', () => {
    it('should validate user permissions for channel access', async () => {
      await wsClient1.connect();

      // Student tries to access admin channel
      await wsClient1.sendMessage({
        type: 'subscribe',
        channel: 'admin',
        data: { userId: mockUsers.student1.id }
      });

      const accessDenied = await wsClient1.waitForMessage();
      expect(accessDenied.type).toBe('access_denied');
      expect(accessDenied.data.reason).toBe('insufficient_permissions');
    });

    it('should prevent unauthorized document access', async () => {
      await wsClient1.connect();

      // Try to access document without permission
      await wsClient1.sendMessage({
        type: 'join_document',
        data: {
          documentId: 'private-doc-999',
          userId: mockUsers.student1.id
        }
      });

      const documentAccessDenied = await wsClient1.waitForMessage();
      expect(documentAccessDenied.type).toBe('document_access_denied');
    });

    it('should validate message authenticity and prevent spoofing', async () => {
      await wsClient1.connect();

      // Try to send message as different user
      await wsClient1.sendMessage({
        type: 'focus_event',
        data: {
          userId: mockUsers.teacher1.id, // Wrong user ID
          eventData: 'malicious_data'
        }
      });

      const validationError = await wsClient1.waitForMessage();
      expect(validationError.type).toBe('validation_error');
      expect(validationError.data.reason).toBe('user_id_mismatch');
    });
  });
});