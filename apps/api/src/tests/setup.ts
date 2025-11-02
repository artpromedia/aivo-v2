import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { Hono } from 'hono';
import { testClient } from 'hono/testing';

// Test utilities and setup for AIVO API integration tests

export interface TestUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'student' | 'teacher' | 'parent' | 'admin';
  tenantId: string;
  schoolId?: string;
}

export interface TestSession {
  user: TestUser;
  token?: string;
  sessionId?: string;
}

// Mock data for testing
export const mockUsers: Record<string, TestUser> = {
  student1: {
    id: 'student-test-001',
    email: 'student1@test.edu',
    firstName: 'John',
    lastName: 'Doe',
    role: 'student',
    tenantId: 'tenant-test',
    schoolId: 'school-test'
  },
  teacher1: {
    id: 'teacher-test-001',
    email: 'teacher1@test.edu',
    firstName: 'Jane',
    lastName: 'Smith',
    role: 'teacher',
    tenantId: 'tenant-test',
    schoolId: 'school-test'
  },
  parent1: {
    id: 'parent-test-001',
    email: 'parent1@test.edu',
    firstName: 'Bob',
    lastName: 'Johnson',
    role: 'parent',
    tenantId: 'tenant-test'
  }
};

// Test app instance
let testApp: Hono;

export function getTestApp(): Hono {
  if (!testApp) {
    // Import the main app for testing
    // Note: This would normally import from '../index.ts' or '../app.ts'
    testApp = new Hono();
    
    // Add basic test routes for now
    testApp.get('/health', (c) => c.json({ status: 'ok', timestamp: new Date().toISOString() }));
  }
  return testApp;
}

// Authentication helpers for testing
export async function createTestSession(user: TestUser): Promise<TestSession> {
  // In a real implementation, this would create a proper auth token
  return {
    user,
    token: `test-token-${user.id}`,
    sessionId: `session-${user.id}-${Date.now()}`
  };
}

export function getAuthHeaders(session: TestSession): Record<string, string> {
  return {
    'Authorization': `Bearer ${session.token}`,
    'X-Tenant-ID': session.user.tenantId,
    'Content-Type': 'application/json'
  };
}

// Database utilities for testing
export class TestDatabase {
  static async setupTestData(): Promise<void> {
    // Setup test data in database
    console.log('Setting up test data...');
    // This would use the actual database client when available
  }

  static async cleanupTestData(): Promise<void> {
    // Cleanup test data from database
    console.log('Cleaning up test data...');
    // This would use the actual database client when available
  }

  static async createTestFocusSession(studentId: string, options: Partial<Record<string, unknown>> = {}): Promise<Record<string, unknown>> {
    return {
      id: `focus-session-${Date.now()}`,
      studentId,
      activityType: 'lesson',
      duration: 30,
      status: 'active',
      parentalConsent: true,
      consentedBy: 'parent-test-001',
      monitoringLevel: 'basic',
      interventionLevel: 'gentle',
      startedAt: new Date().toISOString(),
      ...options
    };
  }

  static async createTestGameTemplate(options: Partial<Record<string, unknown>> = {}): Promise<Record<string, unknown>> {
    return {
      id: `game-template-${Date.now()}`,
      name: 'Test Math Game',
      description: 'A test math game for integration testing',
      category: 'math',
      type: 'quiz',
      minAge: 6,
      maxAge: 9,
      gradeLevel: 'K-2',
      subject: 'mathematics',
      difficulty: 'easy',
      estimatedDuration: 15,
      structure: {
        rounds: 3,
        questionsPerRound: 5,
        timePerQuestion: 30
      },
      contentSlots: {
        numbers: { min: 1, max: 10 },
        operations: ['addition']
      },
      scoringRubric: {
        correct_answer: 10,
        time_bonus: 2
      },
      adaptationRules: {
        increase_difficulty: { consecutive_correct: 3 }
      },
      createdBy: 'teacher-test-001',
      isActive: true,
      ...options
    };
  }

  static async createTestHomeworkSession(studentId: string, options: Partial<Record<string, unknown>> = {}): Promise<Record<string, unknown>> {
    return {
      id: `homework-session-${Date.now()}`,
      studentId,
      subject: 'mathematics',
      topic: 'Addition',
      gradeLevel: '2',
      problemType: 'math_problem',
      problemStatement: 'What is 5 + 3?',
      status: 'active',
      startedAt: new Date().toISOString(),
      solutionSteps: [
        { step: 1, description: 'Identify the numbers to add', content: '5 and 3' },
        { step: 2, description: 'Add the numbers together', content: '5 + 3 = 8' }
      ],
      currentStep: 0,
      studentWork: {},
      ...options
    };
  }

  static async createTestWritingDocument(studentId: string, options: Partial<Record<string, unknown>> = {}): Promise<Record<string, unknown>> {
    return {
      id: `writing-doc-${Date.now()}`,
      studentId,
      title: 'My Test Essay',
      type: 'essay',
      gradeLevel: '3',
      content: 'This is a test essay about my summer vacation...',
      wordCount: 50,
      characterCount: 250,
      status: 'draft',
      startedAt: new Date().toISOString(),
      aiAssistanceLevel: 'basic',
      suggestionMode: 'grammar',
      ...options
    };
  }
}

// WebSocket testing utilities
export class WebSocketTestClient {
  private ws: unknown;
  private messages: unknown[] = [];

  constructor(private url: string) {}

  async connect(): Promise<void> {
    // Mock WebSocket connection for testing
    console.log(`Connecting to WebSocket: ${this.url}`);
    // In real implementation, would use ws library
  }

  async disconnect(): Promise<void> {
    console.log('Disconnecting WebSocket');
    this.messages = [];
  }

  async sendMessage(message: Record<string, unknown>): Promise<void> {
    console.log('Sending WebSocket message:', message);
    // Mock sending message
  }

  getReceivedMessages(): unknown[] {
    return this.messages;
  }

  waitForMessage(timeout: number = 5000): Promise<Record<string, unknown>> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error('WebSocket message timeout'));
      }, timeout);

      // Mock waiting for message
      setTimeout(() => {
        clearTimeout(timer);
        resolve({ type: 'test', data: 'mock message' });
      }, 100);
    });
  }
}

// API response validation helpers
export function validateApiResponse(response: unknown, expectedSchema: Record<string, unknown>): void {
  expect(response).toBeDefined();
  
  // Type guard for response structure
  const typedResponse = response as { success?: boolean; data?: Record<string, unknown>; error?: { message?: string } };
  
  expect(typedResponse.success).toBeDefined();
  
  if (expectedSchema.success !== undefined) {
    expect(typedResponse.success).toBe(expectedSchema.success);
  }
  
  if (expectedSchema.data && typedResponse.success) {
    expect(typedResponse.data).toBeDefined();
    
    // Validate required fields if specified
    const dataSchema = expectedSchema.data as { required?: string[] };
    if (dataSchema.required) {
      for (const field of dataSchema.required) {
        expect(typedResponse.data?.[field]).toBeDefined();
      }
    }
  }
  
  if (expectedSchema.error && !typedResponse.success) {
    expect(typedResponse.error).toBeDefined();
    expect(typedResponse.error?.message).toBeDefined();
  }
}

// Performance testing utilities
export function measureApiPerformance(testName: string, maxDuration: number = 1000) {
  return function(target: unknown, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;
    
    descriptor.value = async function(...args: unknown[]) {
      const start = Date.now();
      const result = await method.apply(this, args);
      const duration = Date.now() - start;
      
      console.log(`${testName} took ${duration}ms`);
      expect(duration).toBeLessThan(maxDuration);
      
      return result;
    };
  };
}

// Export common testing utilities
// Helper function to create test requests for Hono apps
export const createTestRequest = (app: Hono) => {
  return {
    get: (path: string) => app.request(path, { method: 'GET' }),
    post: (path: string, data?: Record<string, unknown>) => app.request(path, { 
      method: 'POST', 
      body: data ? JSON.stringify(data) : undefined,
      headers: data ? { 'Content-Type': 'application/json' } : undefined
    }),
    put: (path: string, data?: Record<string, unknown>) => app.request(path, { 
      method: 'PUT', 
      body: data ? JSON.stringify(data) : undefined,
      headers: data ? { 'Content-Type': 'application/json' } : undefined
    }),
    delete: (path: string) => app.request(path, { method: 'DELETE' }),
    patch: (path: string, data?: Record<string, unknown>) => app.request(path, { 
      method: 'PATCH', 
      body: data ? JSON.stringify(data) : undefined,
      headers: data ? { 'Content-Type': 'application/json' } : undefined
    })
  };
};

export { describe, it, expect, beforeAll, afterAll, beforeEach, testClient };

