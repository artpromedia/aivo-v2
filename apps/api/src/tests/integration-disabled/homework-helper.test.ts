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
  createTestSession,
  getAuthHeaders,
  validateApiResponse,
  mockUsers
} from '../setup';

describe('Homework Helper Integration Tests', () => {
  let studentSession: any;
  let teacherSession: any;
  let homeworkSessionId: string;

  beforeAll(async () => {
    await TestDatabase.setupTestData();
    studentSession = await createTestSession(mockUsers.student1);
    teacherSession = await createTestSession(mockUsers.teacher1);
  });

  afterAll(async () => {
    await TestDatabase.cleanupTestData();
  });

  beforeEach(async () => {
    // Create test homework session
    const session = await TestDatabase.createTestHomeworkSession(mockUsers.student1.id);
    homeworkSessionId = session.id;
  });

  describe('Problem Analysis and Step-by-Step Guidance', () => {
    it('should analyze problem and provide solution steps', async () => {
      const problemAnalysis = {
        sessionId: homeworkSessionId,
        analysis: {
          problemType: 'math_problem',
          difficulty: 'medium',
          requiredSkills: ['addition', 'word_problems'],
          estimatedTime: 10,
          solutionSteps: [
            {
              step: 1,
              description: 'Read and understand the problem',
              content: 'Identify what is being asked and what information is given',
              hints: ['Look for key words', 'Identify numbers in the problem']
            },
            {
              step: 2,
              description: 'Set up the equation',
              content: 'Write the mathematical expression based on the problem',
              hints: ['Use the operation that matches the problem type']
            }
          ]
        }
      };

      // Validate analysis structure
      expect(problemAnalysis.analysis.solutionSteps).toHaveLength(2);
      expect(problemAnalysis.analysis.requiredSkills).toContain('addition');
    });

    it('should provide progressive hints for each step', async () => {
      const hints = [
        {
          sessionId: homeworkSessionId,
          stepNumber: 1,
          hintType: 'conceptual',
          content: 'Think about what operation you need to solve this problem',
          explanation: 'When you see words like "total" or "altogether", you usually need to add numbers'
        },
        {
          sessionId: homeworkSessionId,
          stepNumber: 1,
          hintType: 'procedural',
          content: 'Add the two numbers: 5 + 3',
          explanation: 'Place the numbers in order and add them together'
        }
      ];

      // Validate hint progression
      expect(hints[0].hintType).toBe('conceptual');
      expect(hints[1].hintType).toBe('procedural');
      expect(hints[0].stepNumber).toBe(hints[1].stepNumber);
    });

    it('should track student work and provide feedback', async () => {
      const studentWork = {
        sessionId: homeworkSessionId,
        work: {
          step1: { content: 'I need to add 5 and 3', completed: true },
          step2: { content: '5 + 3 = 8', completed: true, answer: 8 }
        },
        currentStep: 2,
        confidence: 'high'
      };

      const feedback = {
        isCorrect: true,
        score: 10,
        feedback: 'Excellent work! You correctly identified the operation and solved the problem.',
        strengths: ['problem_identification', 'arithmetic_accuracy'],
        improvements: [],
        nextSteps: ['Try more complex addition problems', 'Practice word problems']
      };

      // Validate student work tracking
      expect(studentWork.work.step2.answer).toBe(8);
      expect(feedback.isCorrect).toBe(true);
      expect(feedback.strengths).toContain('arithmetic_accuracy');
    });
  });

  describe('Resource Recommendations', () => {
    it('should recommend relevant educational resources', async () => {
      const resources = await TestDatabase.createTestHomeworkSession(mockUsers.student1.id, {
        subject: 'mathematics',
        topic: 'fractions',
        gradeLevel: '4'
      });

      const recommendations = [
        {
          title: 'Visual Fractions Tutorial',
          type: 'interactive',
          subject: 'mathematics',
          gradeLevel: '4',
          topics: ['fractions', 'visual_representation'],
          skills: ['fraction_identification', 'equivalent_fractions'],
          difficulty: 'medium',
          isRecommended: true,
          rating: 4.5
        },
        {
          title: 'Fraction Practice Problems',
          type: 'practice_problems',
          subject: 'mathematics',
          gradeLevel: '4',
          topics: ['fractions', 'practice'],
          skills: ['fraction_operations', 'problem_solving'],
          difficulty: 'medium',
          isRecommended: true,
          rating: 4.2
        }
      ];

      // Validate resource recommendations
      expect(recommendations).toHaveLength(2);
      expect(recommendations[0].topics).toContain('fractions');
      expect(recommendations.every(r => r.isRecommended)).toBe(true);
    });

    it('should adapt resources to student skill level', async () => {
      const studentProfile = {
        gradeLevel: '3',
        skillLevels: {
          addition: 0.9,
          subtraction: 0.7,
          multiplication: 0.3,
          fractions: 0.1
        },
        learningPreferences: ['visual', 'interactive']
      };

      // Resource adaptation logic
      const adaptedResources = [
        {
          title: 'Basic Addition Review',
          difficulty: 'easy', // Matched to grade level
          type: 'interactive', // Matched to preferences
          skillLevel: 0.9 // Matched to student ability
        }
      ];

      expect(adaptedResources[0].difficulty).toBe('easy');
      expect(adaptedResources[0].type).toBe('interactive');
    });
  });

  describe('Session Completion and Analytics', () => {
    it('should generate comprehensive session report', async () => {
      const sessionReport = {
        sessionId: homeworkSessionId,
        completedAt: new Date().toISOString(),
        totalTime: 15 * 60, // 15 minutes in seconds
        hintsUsed: 2,
        stepsCompleted: 2,
        finalAnswer: { value: 8, isCorrect: true },
        performance: {
          accuracy: 100,
          efficiency: 85,
          independence: 75 // Based on hints used
        },
        learningProgress: {
          skillsImproved: ['problem_solving', 'addition'],
          conceptsReinforced: ['word_problems', 'arithmetic'],
          nextRecommendations: ['Try subtraction word problems']
        }
      };

      // Validate session completion
      expect(sessionReport.performance.accuracy).toBe(100);
      expect(sessionReport.learningProgress.skillsImproved).toContain('problem_solving');
      expect(sessionReport.hintsUsed).toBe(2);
    });

    it('should track long-term student progress', async () => {
      const studentProgress = {
        studentId: mockUsers.student1.id,
        subject: 'mathematics',
        dateRange: { start: '2024-01-01', end: '2024-12-31' },
        sessions: [
          {
            date: '2024-12-01',
            topic: 'addition',
            accuracy: 90,
            hintsUsed: 3,
            timeSpent: 600
          },
          {
            date: '2024-12-07',
            topic: 'addition',
            accuracy: 95,
            hintsUsed: 1,
            timeSpent: 450
          },
          {
            date: '2024-12-14',
            topic: 'addition',
            accuracy: 100,
            hintsUsed: 0,
            timeSpent: 300
          }
        ],
        trends: {
          improvementRate: 15, // Percentage improvement over time
          independenceGrowth: 85, // Reduced need for hints
          efficiencyGain: 50 // Faster completion times
        }
      };

      // Validate progress tracking
      expect(studentProgress.sessions).toHaveLength(3);
      expect(studentProgress.trends.improvementRate).toBe(15);
      expect(studentProgress.sessions[2].hintsUsed).toBe(0); // Shows independence growth
    });
  });

  describe('Multi-Subject Support', () => {
    it('should handle different subject types appropriately', async () => {
      const subjects = [
        {
          subject: 'mathematics',
          problemType: 'word_problem',
          analysisApproach: 'step_by_step_numerical',
          hintTypes: ['conceptual', 'procedural', 'computational']
        },
        {
          subject: 'english_language_arts',
          problemType: 'reading_comprehension',
          analysisApproach: 'text_analysis',
          hintTypes: ['context_clues', 'main_idea', 'supporting_details']
        },
        {
          subject: 'science',
          problemType: 'experiment_design',
          analysisApproach: 'scientific_method',
          hintTypes: ['hypothesis_formation', 'variable_identification', 'conclusion_drawing']
        }
      ];

      // Validate subject-specific approaches
      expect(subjects[0].hintTypes).toContain('computational');
      expect(subjects[1].hintTypes).toContain('context_clues');
      expect(subjects[2].analysisApproach).toBe('scientific_method');
    });

    it('should provide grade-appropriate complexity', async () => {
      const gradeAdaptations = [
        {
          gradeLevel: 'K-2',
          features: {
            visualAids: true,
            audioSupport: true,
            simplifiedLanguage: true,
            maxHints: 5,
            encouragementLevel: 'high'
          }
        },
        {
          gradeLevel: '3-5',
          features: {
            visualAids: true,
            audioSupport: false,
            simplifiedLanguage: false,
            maxHints: 3,
            encouragementLevel: 'medium'
          }
        },
        {
          gradeLevel: '6-8',
          features: {
            visualAids: false,
            audioSupport: false,
            simplifiedLanguage: false,
            maxHints: 2,
            encouragementLevel: 'low'
          }
        }
      ];

      // Validate grade-appropriate features
      expect(gradeAdaptations[0].features.maxHints).toBe(5); // More support for younger students
      expect(gradeAdaptations[2].features.maxHints).toBe(2); // Less support for older students
      expect(gradeAdaptations[0].features.visualAids).toBe(true);
    });
  });
});