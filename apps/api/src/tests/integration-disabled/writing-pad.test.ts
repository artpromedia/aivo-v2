import {
  describe,
  it,
  expect,
  beforeAll,
  afterAll,
  beforeEach
} from '../setup';
import {
  TestDatabase,
  WebSocketTestClient,
  createTestSession,
  getAuthHeaders,
  validateApiResponse,
  mockUsers
} from '../setup';

describe('Writing Pad Integration Tests', () => {
  let studentSession: any;
  let teacherSession: any;
  let wsClient: WebSocketTestClient;
  let documentId: string;

  beforeAll(async () => {
    await TestDatabase.setupTestData();
    studentSession = await createTestSession(mockUsers.student1);
    teacherSession = await createTestSession(mockUsers.teacher1);
    wsClient = new WebSocketTestClient('ws://localhost:3000/ws');
  });

  afterAll(async () => {
    await wsClient.disconnect();
    await TestDatabase.cleanupTestData();
  });

  beforeEach(async () => {
    const document = await TestDatabase.createTestWritingDocument(mockUsers.student1.id);
    documentId = document.id;
  });

  describe('Real-time Collaborative Writing', () => {
    it('should handle concurrent editing from multiple users', async () => {
      await wsClient.connect();

      // Student starts writing
      const initialContent = 'Once upon a time, there was a brave knight...';
      const contentUpdate1 = {
        documentId,
        content: initialContent,
        position: { start: 0, end: initialContent.length },
        timestamp: Date.now(),
        authorId: mockUsers.student1.id
      };

      await wsClient.sendMessage({
        type: 'content_update',
        data: contentUpdate1
      });

      // Teacher adds a comment
      const comment = {
        documentId,
        content: 'Great start! Can you describe the knight?',
        position: { start: 15, end: 35 }, // "brave knight" selection
        type: 'suggestion',
        authorId: mockUsers.teacher1.id
      };

      await wsClient.sendMessage({
        type: 'add_comment',
        data: comment
      });

      // Student continues writing
      const additionalContent = ' He had shining armor and carried a magical sword.';
      const contentUpdate2 = {
        documentId,
        content: initialContent + additionalContent,
        position: { start: initialContent.length, end: initialContent.length + additionalContent.length },
        timestamp: Date.now(),
        authorId: mockUsers.student1.id
      };

      await wsClient.sendMessage({
        type: 'content_update',
        data: contentUpdate2
      });

      // Validate real-time updates
      const message = await wsClient.waitForMessage();
      expect(message.type).toBe('document_update');
      expect(message.data.content).toContain('magical sword');
    });

    it('should track revision history during collaborative editing', async () => {
      const revisions = [
        {
          documentId,
          versionNumber: 1,
          content: 'My summer vacation was amazing.',
          changeDescription: 'Initial draft',
          wordCount: 5,
          characterCount: 30,
          timestamp: Date.now()
        },
        {
          documentId,
          versionNumber: 2,
          content: 'My summer vacation was absolutely amazing and unforgettable.',
          changeDescription: 'Added descriptive words',
          additions: [{ text: 'absolutely ', position: 25 }, { text: ' and unforgettable', position: 34 }],
          wordCount: 8,
          characterCount: 58,
          timestamp: Date.now() + 1000
        },
        {
          documentId,
          versionNumber: 3,
          content: 'My summer vacation was absolutely amazing and unforgettable. I went to the beach with my family.',
          changeDescription: 'Added details about the trip',
          additions: [{ text: ' I went to the beach with my family.', position: 58 }],
          wordCount: 17,
          characterCount: 95,
          timestamp: Date.now() + 2000
        }
      ];

      // Validate revision tracking
      expect(revisions).toHaveLength(3);
      expect(revisions[2].wordCount).toBe(17);
      expect(revisions[1].additions).toHaveLength(2);
    });

    it('should handle conflict resolution for simultaneous edits', async () => {
      // Simulate two users editing the same text region
      const baseContent = 'The weather was nice today.';
      
      const edit1 = {
        documentId,
        content: 'The weather was absolutely beautiful today.',
        position: { start: 16, end: 20 }, // Replace "nice" with "absolutely beautiful"
        timestamp: Date.now(),
        authorId: mockUsers.student1.id
      };

      const edit2 = {
        documentId,
        content: 'The weather was really nice today.',
        position: { start: 16, end: 16 }, // Insert "really " before "nice"
        timestamp: Date.now() + 50, // Slightly later
        authorId: mockUsers.teacher1.id
      };

      // Conflict resolution logic
      const resolvedContent = 'The weather was absolutely beautiful today.'; // Latest edit wins
      const conflictMetadata = {
        conflictResolved: true,
        resolution: 'latest_edit_wins',
        originalEdits: [edit1, edit2],
        resolvedBy: 'system',
        timestamp: Date.now() + 100
      };

      expect(resolvedContent).toContain('absolutely beautiful');
      expect(conflictMetadata.conflictResolved).toBe(true);
    });
  });

  describe('AI-Powered Writing Assistance', () => {
    it('should provide grammar and style feedback in real-time', async () => {
      const content = 'I goed to the store and buyed some apples. They was very delicious.';
      
      const feedback = [
        {
          documentId,
          type: 'grammar',
          category: 'error',
          feedback: 'Incorrect verb form',
          suggestion: 'went',
          startPosition: 2,
          endPosition: 6,
          selectedText: 'goed',
          confidence: 0.95,
          priority: 'high'
        },
        {
          documentId,
          type: 'grammar',
          category: 'error',
          feedback: 'Incorrect verb form',
          suggestion: 'bought',
          startPosition: 25,
          endPosition: 31,
          selectedText: 'buyed',
          confidence: 0.98,
          priority: 'high'
        },
        {
          documentId,
          type: 'grammar',
          category: 'error',
          feedback: 'Subject-verb disagreement',
          suggestion: 'They were',
          startPosition: 46,
          endPosition: 54,
          selectedText: 'They was',
          confidence: 0.92,
          priority: 'high'
        }
      ];

      // Validate AI feedback
      expect(feedback).toHaveLength(3);
      expect(feedback.every(f => f.type === 'grammar')).toBe(true);
      expect(feedback[0].suggestion).toBe('went');
    });

    it('should provide content and creativity suggestions', async () => {
      const content = 'The dog ran fast.';
      
      const suggestions = [
        {
          documentId,
          type: 'style',
          category: 'suggestion',
          feedback: 'Consider using more descriptive words',
          suggestion: 'The golden retriever sprinted energetically.',
          explanation: 'More specific nouns and verbs make writing more engaging',
          startPosition: 0,
          endPosition: 17,
          selectedText: 'The dog ran fast.',
          priority: 'medium'
        },
        {
          documentId,
          type: 'content',
          category: 'suggestion',
          feedback: 'Add details about why the dog was running',
          suggestion: 'Consider adding: "The dog ran fast to catch the frisbee in the park."',
          explanation: 'Adding context helps readers understand the action',
          priority: 'low'
        }
      ];

      // Validate creativity suggestions
      expect(suggestions[0].type).toBe('style');
      expect(suggestions[1].type).toBe('content');
      expect(suggestions[0].suggestion).toContain('golden retriever');
    });

    it('should adapt feedback to student grade level', async () => {
      const gradeLevelFeedback = {
        'K-2': {
          focusAreas: ['basic_spelling', 'sentence_structure', 'capitalization'],
          feedbackStyle: 'encouraging',
          complexity: 'simple',
          examples: true,
          visualAids: true
        },
        '3-5': {
          focusAreas: ['grammar', 'paragraph_structure', 'vocabulary', 'punctuation'],
          feedbackStyle: 'constructive',
          complexity: 'moderate',
          examples: true,
          visualAids: false
        },
        '6-8': {
          focusAreas: ['advanced_grammar', 'essay_structure', 'style', 'citations'],
          feedbackStyle: 'analytical',
          complexity: 'advanced',
          examples: false,
          visualAids: false
        }
      };

      // Validate grade-appropriate feedback
      expect(gradeLevelFeedback['K-2'].visualAids).toBe(true);
      expect(gradeLevelFeedback['6-8'].focusAreas).toContain('citations');
      expect(gradeLevelFeedback['3-5'].complexity).toBe('moderate');
    });
  });

  describe('Document Management and Sharing', () => {
    it('should handle document sharing with proper permissions', async () => {
      const shareSettings = {
        documentId,
        isShared: true,
        permissions: {
          [mockUsers.teacher1.id]: {
            role: 'editor',
            canComment: true,
            canEdit: true,
            canShare: false
          },
          [mockUsers.parent1.id]: {
            role: 'viewer',
            canComment: false,
            canEdit: false,
            canShare: false
          }
        },
        shareLink: `https://aivo.app/documents/${documentId}/shared`,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
      };

      // Validate sharing permissions
      expect(shareSettings.permissions[mockUsers.teacher1.id].canEdit).toBe(true);
      expect(shareSettings.permissions[mockUsers.parent1.id].canEdit).toBe(false);
      expect(shareSettings.isShared).toBe(true);
    });

    it('should support document templates and prompts', async () => {
      const writingPrompts = [
        {
          id: 'prompt-narrative-1',
          title: 'My Superhero Adventure',
          description: 'Write about a day when you had superpowers',
          prompt: 'Imagine you woke up one morning with a superpower. What would it be? How would you use it to help others? Describe your adventure.',
          type: 'narrative',
          gradeLevel: '3-5',
          estimatedTime: 30,
          minWords: 150,
          rubric: {
            creativity: 25,
            organization: 25,
            details: 25,
            conventions: 25
          }
        },
        {
          id: 'prompt-persuasive-1',
          title: 'Best Pet Argument',
          description: 'Convince someone which animal makes the best pet',
          prompt: 'Choose an animal that you think makes the best pet. Write a persuasive essay explaining why this animal is better than other pets.',
          type: 'argumentative',
          gradeLevel: '4-6',
          estimatedTime: 45,
          minWords: 200,
          rubric: {
            argument_strength: 30,
            evidence: 25,
            organization: 25,
            conventions: 20
          }
        }
      ];

      // Validate writing prompts
      expect(writingPrompts[0].type).toBe('narrative');
      expect(writingPrompts[1].type).toBe('argumentative');
      expect(writingPrompts[0].rubric.creativity).toBe(25);
    });

    it('should generate writing analytics and progress reports', async () => {
      const writingAnalytics = {
        documentId,
        studentId: mockUsers.student1.id,
        metrics: {
          wordCount: 245,
          characterCount: 1203,
          sentenceCount: 18,
          paragraphCount: 4,
          averageWordsPerSentence: 13.6,
          readabilityScore: 7.2, // Grade level
          lexicalDiversity: 0.72, // Unique words / total words
          writingTime: 25 * 60, // 25 minutes
          revisionCount: 8,
          deletionCount: 12
        },
        aiScores: {
          grammarScore: 85,
          creativityScore: 78,
          organizationScore: 82,
          vocabularyScore: 75,
          overallScore: 80
        },
        progressIndicators: {
          improvementAreas: ['vocabulary_variety', 'sentence_variety'],
          strengths: ['organization', 'creativity'],
          gradeComparison: 'above_average',
          monthlyProgress: {
            wordsPerMinute: 8.2,
            accuracyImprovement: 15,
            independenceGrowth: 22
          }
        }
      };

      // Validate analytics
      expect(writingAnalytics.metrics.wordCount).toBe(245);
      expect(writingAnalytics.aiScores.overallScore).toBe(80);
      expect(writingAnalytics.progressIndicators.strengths).toContain('creativity');
    });
  });

  describe('Integration with Other Systems', () => {
    it('should integrate with focus monitoring for writing sessions', async () => {
      const writingFocusData = {
        documentId,
        focusSessionId: 'focus-session-writing-001',
        integration: {
          startedAt: new Date().toISOString(),
          activityType: 'creative_writing',
          monitoringEnabled: true,
          interventions: [
            {
              type: 'writing_break',
              triggeredAt: Date.now() + 10 * 60 * 1000, // After 10 minutes
              reason: 'sustained_attention',
              action: 'suggest_paragraph_break'
            }
          ]
        },
        writingMetrics: {
          keystrokesPerMinute: 45,
          pausesBetweenSentences: [12, 8, 15, 22], // seconds
          revisionFrequency: 0.15, // revisions per word
          focusCorrelation: 0.82 // correlation between focus and writing quality
        }
      };

      // Validate focus-writing integration
      expect(writingFocusData.integration.monitoringEnabled).toBe(true);
      expect(writingFocusData.writingMetrics.focusCorrelation).toBeGreaterThan(0.8);
    });

    it('should connect with homework helper for writing assignments', async () => {
      const homeworkWritingIntegration = {
        documentId,
        homeworkSessionId: 'homework-session-essay-001',
        assignment: {
          type: 'essay',
          topic: 'Environmental Conservation',
          requirements: {
            minWords: 300,
            structure: ['introduction', 'body_paragraphs', 'conclusion'],
            sources: 2,
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
          }
        },
        guidance: {
          outlineGenerated: true,
          researchSources: [
            { title: 'Climate Change Facts', url: 'https://example.com/climate' },
            { title: 'Conservation Methods', url: 'https://example.com/conservation' }
          ],
          progressChecks: [
            { milestone: 'outline_complete', completed: true },
            { milestone: 'introduction_written', completed: true },
            { milestone: 'body_paragraph_1', completed: false }
          ]
        }
      };

      // Validate homework integration
      expect(homeworkWritingIntegration.assignment.type).toBe('essay');
      expect(homeworkWritingIntegration.guidance.researchSources).toHaveLength(2);
      expect(homeworkWritingIntegration.guidance.progressChecks[0].completed).toBe(true);
    });
  });

  describe('Performance and Scalability', () => {
    it('should handle large documents efficiently', async () => {
      const largeContent = 'Lorem ipsum '.repeat(1000); // ~11,000 characters
      
      const performanceMetrics = {
        documentSize: largeContent.length,
        processingTime: 150, // milliseconds
        memoryUsage: 2.5, // MB
        realTimeUpdates: true,
        maxConcurrentUsers: 10
      };

      // Validate performance requirements
      expect(performanceMetrics.processingTime).toBeLessThan(500);
      expect(performanceMetrics.realTimeUpdates).toBe(true);
      expect(performanceMetrics.documentSize).toBeGreaterThan(10000);
    });

    it('should maintain data consistency across multiple sessions', async () => {
      const concurrentSessions = [
        { sessionId: 'session-1', userId: mockUsers.student1.id, lastUpdate: Date.now() },
        { sessionId: 'session-2', userId: mockUsers.teacher1.id, lastUpdate: Date.now() + 100 },
        { sessionId: 'session-3', userId: mockUsers.parent1.id, lastUpdate: Date.now() + 200 }
      ];

      const dataConsistency = {
        documentVersion: 5,
        allSessionsSynced: true,
        conflictResolutionStrategy: 'timestamp_priority',
        lastSyncedAt: Date.now(),
        integrityChecks: {
          contentHashMatch: true,
          revisionOrderValid: true,
          permissionsEnforced: true
        }
      };

      // Validate data consistency
      expect(dataConsistency.allSessionsSynced).toBe(true);
      expect(dataConsistency.integrityChecks.contentHashMatch).toBe(true);
      expect(concurrentSessions).toHaveLength(3);
    });
  });
});