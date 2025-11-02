import {
  describe,
  it,
  expect,
  beforeAll,
  afterAll,
  beforeEach,
  createTestRequest
} from '../setup';
import {
  TestDatabase,
  WebSocketTestClient,
  createTestSession,
  getAuthHeaders,
  validateApiResponse,
  mockUsers,
  getTestApp
} from '../setup';

describe('Focus Guardian + Game Generation Integration', () => {
  let studentSession: any;
  let teacherSession: any;
  let wsClient: WebSocketTestClient;
  let focusSessionId: string;
  let gameTemplateId: string;

  beforeAll(async () => {
    await TestDatabase.setupTestData();
    studentSession = await createTestSession(mockUsers.student1);
    teacherSession = await createTestSession(mockUsers.teacher1);
    
    // Setup WebSocket client
    wsClient = new WebSocketTestClient('ws://localhost:3000/ws');
  });

  afterAll(async () => {
    await wsClient.disconnect();
    await TestDatabase.cleanupTestData();
  });

  beforeEach(async () => {
    // Create test game template
    const gameTemplate = await TestDatabase.createTestGameTemplate({
      category: 'math',
      type: 'quiz',
      difficulty: 'easy'
    });
    gameTemplateId = gameTemplate.id;
  });

  describe('Focus Monitoring with Game Break Integration', () => {
    it('should start focus session and detect attention loss', async () => {
      const app = getTestApp();
      
      // Start focus session
      const focusResponse = await request(app)
        .post('/api/v1/focus/sessions')
        .set(getAuthHeaders(studentSession))
        .send({
          subject: 'mathematics',
          activityType: 'lesson',
          duration: 30,
          parentalConsent: true,
          consentedBy: mockUsers.parent1.id
        })
        .expect(201);

      validateApiResponse(focusResponse.body, {
        success: true,
        data: { required: ['id', 'studentId', 'status', 'startedAt'] }
      });

      focusSessionId = focusResponse.body.data.id;
      expect(focusResponse.body.data.status).toBe('active');
    });

    it('should log focus events during session', async () => {
      const app = getTestApp();
      
      // Simulate attention loss event
      const eventResponse = await request(app)
        .post('/api/v1/focus/events')
        .set(getAuthHeaders(studentSession))
        .send({
          sessionId: focusSessionId,
          type: 'attention_lost',
          severity: 'medium',
          confidence: 0.85,
          description: 'Student looking away from screen',
          triggers: ['eye_tracking', 'mouse_inactivity'],
          context: {
            duration: 15,
            previousActivity: 'reading_problem',
            timeInSession: 300
          }
        })
        .expect(201);

      validateApiResponse(eventResponse.body, {
        success: true,
        data: { required: ['id', 'sessionId', 'type', 'detectedAt'] }
      });

      expect(eventResponse.body.data.type).toBe('attention_lost');
      expect(eventResponse.body.data.confidence).toBe(0.85);
    });

    it('should trigger game break intervention for attention loss', async () => {
      const app = getTestApp();
      
      // Trigger game break intervention
      const interventionResponse = await request(app)
        .post(`/api/v1/focus/sessions/${focusSessionId}/intervention`)
        .set(getAuthHeaders(studentSession))
        .send({
          type: 'game_break',
          strategy: 'gamified',
          triggerReason: 'attention_loss_threshold',
          gamePreferences: {
            category: 'math',
            difficulty: 'easy',
            maxDuration: 5
          }
        })
        .expect(201);

      validateApiResponse(interventionResponse.body, {
        success: true,
        data: { required: ['intervention', 'gameSession'] }
      });

      const intervention = interventionResponse.body.data.intervention;
      const gameSession = interventionResponse.body.data.gameSession;

      expect(intervention.type).toBe('game_break');
      expect(intervention.strategy).toBe('gamified');
      expect(gameSession.templateId).toBeDefined();
      expect(gameSession.status).toBe('created');
    });

    it('should connect to WebSocket for real-time focus updates', async () => {
      await wsClient.connect();
      
      // Subscribe to focus session updates
      await wsClient.sendMessage({
        type: 'subscribe',
        channel: 'focus',
        sessionId: focusSessionId
      });

      // Simulate focus event
      const app = getTestApp();
      await request(app)
        .post('/api/v1/focus/events')
        .set(getAuthHeaders(studentSession))
        .send({
          sessionId: focusSessionId,
          type: 'attention_regained',
          severity: 'low',
          confidence: 0.90
        })
        .expect(201);

      // Wait for WebSocket notification
      const message = await wsClient.waitForMessage(3000);
      expect(message.type).toBe('focus_event');
      expect(message.data.sessionId).toBe(focusSessionId);
    });

    it('should generate game content based on focus session context', async () => {
      const app = getTestApp();
      
      // Generate game for math lesson context
      const gameResponse = await request(app)
        .post('/api/v1/games/generate')
        .set(getAuthHeaders(studentSession))
        .send({
          templateId: gameTemplateId,
          context: {
            currentSubject: 'mathematics',
            currentTopic: 'addition',
            gradeLevel: '2',
            focusSessionId: focusSessionId,
            interventionType: 'attention_break'
          },
          settings: {
            difficulty: 'easy',
            duration: 5,
            questions: 3
          }
        })
        .expect(201);

      validateApiResponse(gameResponse.body, {
        success: true,
        data: { required: ['id', 'title', 'generatedContent', 'gameState'] }
      });

      const game = gameResponse.body.data;
      expect(game.generatedContent.questions).toHaveLength(3);
      expect(game.generatedContent.context.subject).toBe('mathematics');
    });

    it('should track game session progress and return to focus monitoring', async () => {
      const app = getTestApp();
      
      // Start the generated game
      const gameId = 'game-session-test-001';
      const startResponse = await request(app)
        .put(`/api/v1/games/${gameId}`)
        .set(getAuthHeaders(studentSession))
        .send({
          status: 'started',
          gameState: {
            currentQuestion: 0,
            startTime: new Date().toISOString()
          }
        })
        .expect(200);

      // Complete game with results
      const completeResponse = await request(app)
        .post(`/api/v1/games/${gameId}/complete`)
        .set(getAuthHeaders(studentSession))
        .send({
          finalState: {
            questionsAnswered: 3,
            correctAnswers: 2,
            totalTime: 180,
            engagementLevel: 'high'
          },
          results: {
            score: 20,
            maxScore: 30,
            percentage: 67,
            skillsAssessed: ['addition', 'number_recognition'],
            masteryLevels: {
              addition: 0.8,
              number_recognition: 0.9
            }
          }
        })
        .expect(200);

      validateApiResponse(completeResponse.body, {
        success: true,
        data: { required: ['gameSession', 'gameResult', 'focusUpdate'] }
      });

      const result = completeResponse.body.data;
      expect(result.gameResult.score).toBe(20);
      expect(result.focusUpdate.interventionCompleted).toBe(true);
    });

    it('should resume focus monitoring after game intervention', async () => {
      const app = getTestApp();
      
      // Get focus session analytics after game intervention
      const analyticsResponse = await request(app)
        .get(`/api/v1/focus/sessions/${focusSessionId}/analytics`)
        .set(getAuthHeaders(studentSession))
        .expect(200);

      validateApiResponse(analyticsResponse.body, {
        success: true,
        data: { required: ['sessionSummary', 'interventions', 'effectiveness'] }
      });

      const analytics = analyticsResponse.body.data;
      expect(analytics.interventions).toHaveLength(1);
      expect(analytics.interventions[0].type).toBe('game_break');
      expect(analytics.interventions[0].effectiveness).toBeDefined();
    });
  });

  describe('End-to-End Focus + Game Workflow', () => {
    it('should complete full focus session with multiple game interventions', async () => {
      const app = getTestApp();
      
      // 1. Start comprehensive focus session
      const sessionResponse = await request(app)
        .post('/api/v1/focus/sessions')
        .set(getAuthHeaders(studentSession))
        .send({
          subject: 'mathematics',
          activityType: 'assignment',
          duration: 45,
          parentalConsent: true,
          monitoringLevel: 'comprehensive',
          interventionLevel: 'moderate'
        })
        .expect(201);

      const sessionId = sessionResponse.body.data.id;

      // 2. Simulate multiple focus events
      const events = [
        { type: 'attention_lost', severity: 'low', confidence: 0.75 },
        { type: 'distraction_detected', severity: 'medium', confidence: 0.85 },
        { type: 'fatigue_detected', severity: 'high', confidence: 0.90 }
      ];

      for (const event of events) {
        await request(app)
          .post('/api/v1/focus/events')
          .set(getAuthHeaders(studentSession))
          .send({
            sessionId,
            ...event,
            context: { timeInSession: Date.now() }
          })
          .expect(201);
      }

      // 3. Trigger appropriate interventions
      const gameInterventionResponse = await request(app)
        .post(`/api/v1/focus/sessions/${sessionId}/intervention`)
        .set(getAuthHeaders(studentSession))
        .send({
          type: 'game_break',
          strategy: 'educational',
          gamePreferences: { category: 'math', difficulty: 'medium' }
        })
        .expect(201);

      // 4. Complete game intervention
      const gameSessionId = gameInterventionResponse.body.data.gameSession.id;
      await request(app)
        .post(`/api/v1/games/${gameSessionId}/complete`)
        .set(getAuthHeaders(studentSession))
        .send({
          results: { score: 25, maxScore: 30, engagementLevel: 'high' }
        })
        .expect(200);

      // 5. End focus session
      const endResponse = await request(app)
        .put(`/api/v1/focus/sessions/${sessionId}`)
        .set(getAuthHeaders(studentSession))
        .send({
          status: 'completed',
          endedAt: new Date().toISOString(),
          finalAnalytics: {
            totalDistractions: 3,
            interventionsUsed: 1,
            improvementAfterInterventions: true
          }
        })
        .expect(200);

      // 6. Validate final session state
      const finalSession = endResponse.body.data;
      expect(finalSession.status).toBe('completed');
      expect(finalSession.analytics.interventions).toHaveLength(1);
      expect(finalSession.analytics.effectiveness).toBeDefined();
    });

    it('should provide comprehensive student progress report', async () => {
      const app = getTestApp();
      
      // Get student history across focus and games
      const historyResponse = await request(app)
        .get(`/api/v1/focus/student/${mockUsers.student1.id}/history`)
        .set(getAuthHeaders(studentSession))
        .query({ includeGames: 'true', limit: '10' })
        .expect(200);

      validateApiResponse(historyResponse.body, {
        success: true,
        data: { required: ['focusSessions', 'gameResults', 'trends'] }
      });

      const history = historyResponse.body.data;
      expect(history.focusSessions).toBeDefined();
      expect(history.gameResults).toBeDefined();
      expect(history.trends.focusImprovement).toBeDefined();
      expect(history.trends.gamePerformance).toBeDefined();
    });
  });

  describe('Performance and Error Handling', () => {
    it('should handle rapid focus events without dropping data', async () => {
      const app = getTestApp();
      
      // Create focus session
      const sessionResponse = await request(app)
        .post('/api/v1/focus/sessions')
        .set(getAuthHeaders(studentSession))
        .send({
          activityType: 'assessment',
          duration: 20,
          parentalConsent: true
        })
        .expect(201);

      const sessionId = sessionResponse.body.data.id;

      // Send multiple rapid events
      const eventPromises = Array.from({ length: 10 }, (_, i) =>
        request(app)
          .post('/api/v1/focus/events')
          .set(getAuthHeaders(studentSession))
          .send({
            sessionId,
            type: 'attention_lost',
            severity: 'low',
            confidence: 0.5 + (i * 0.05),
            context: { sequenceNumber: i }
          })
          .expect(201)
      );

      const responses = await Promise.all(eventPromises);
      expect(responses).toHaveLength(10);
      
      // Verify all events were recorded
      const eventsResponse = await request(app)
        .get(`/api/v1/focus/sessions/${sessionId}`)
        .set(getAuthHeaders(studentSession))
        .expect(200);

      expect(eventsResponse.body.data.events).toHaveLength(10);
    });

    it('should handle game generation errors gracefully', async () => {
      const app = getTestApp();
      
      // Try to generate game with invalid template
      const invalidResponse = await request(app)
        .post('/api/v1/games/generate')
        .set(getAuthHeaders(studentSession))
        .send({
          templateId: 'invalid-template-id',
          context: { subject: 'mathematics' }
        })
        .expect(404);

      validateApiResponse(invalidResponse.body, {
        success: false,
        error: true
      });

      expect(invalidResponse.body.error.code).toBe('TEMPLATE_NOT_FOUND');
    });

    it('should handle WebSocket connection failures', async () => {
      // Test WebSocket resilience
      const wsClient2 = new WebSocketTestClient('ws://invalid-url');
      
      try {
        await wsClient2.connect();
        expect(false).toBe(true); // Should not reach here
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });
});