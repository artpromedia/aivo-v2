# Integration Testing Documentation

## Overview

This document describes the comprehensive integration testing strategy for AIVO Platform Phase 1 features, including Focus Guardian, Game Generation, Homework Helper, and Writing Pad capabilities.

## Test Structure

### Test Organization

```
src/tests/
├── setup.ts                 # Test utilities and configuration
├── fixtures/                # Test data and mock objects
├── integration/             # Integration tests
│   ├── focus-game-integration.test.ts
│   ├── homework-helper.test.ts
│   ├── writing-pad.test.ts
│   └── websocket.test.ts
└── unit/                   # Unit tests (future)
```

### Test Categories

#### 1. Focus Guardian + Game Generation Integration
**File**: `focus-game-integration.test.ts`

**Test Scenarios**:
- Start focus session with parental consent
- Detect attention loss and trigger events
- Generate appropriate game interventions
- Track game completion and return to focus monitoring
- Validate end-to-end analytics and reporting
- Handle performance with rapid events
- Test error conditions and recovery

**Key Features Tested**:
- Real-time focus monitoring
- AI-driven intervention triggering
- Game content generation based on context
- WebSocket communication for live updates
- Session analytics and progress tracking

#### 2. Homework Helper System
**File**: `homework-helper.test.ts`

**Test Scenarios**:
- Problem analysis and solution step generation
- Progressive hint system with student feedback
- Resource recommendation based on topic and skill level
- Session completion with comprehensive reporting
- Multi-subject support (math, reading, science)
- Grade-appropriate content adaptation

**Key Features Tested**:
- AI problem analysis and step-by-step guidance
- Adaptive hint generation
- Learning resource curation and recommendation
- Student progress tracking and analytics
- Subject-specific problem handling

#### 3. Writing Pad Collaboration
**File**: `writing-pad.test.ts`

**Test Scenarios**:
- Real-time collaborative document editing
- AI-powered grammar and style feedback
- Document sharing with permission controls
- Revision history and change tracking
- Comment threads and discussions
- Integration with focus monitoring and homework systems

**Key Features Tested**:
- Real-time content synchronization
- AI writing assistance and feedback
- Collaborative features (comments, sharing)
- Document analytics and progress reporting
- Cross-feature integration capabilities

#### 4. WebSocket Real-time Communication
**File**: `websocket.test.ts`

**Test Scenarios**:
- Connection management for multiple users
- Real-time event broadcasting (focus, games, writing)
- Cross-feature message coordination
- Performance under high-frequency messaging
- Security and authentication validation
- Connection recovery and reliability

**Key Features Tested**:
- WebSocket connection lifecycle
- Multi-channel subscription management  
- Real-time data synchronization
- Message ordering and consistency
- Authentication and authorization
- Error handling and recovery

## Test Data and Fixtures

### Mock Users
```typescript
mockUsers = {
  student1: { id: 'student-test-001', role: 'student', gradeLevel: '3' },
  teacher1: { id: 'teacher-test-001', role: 'teacher', subject: 'mathematics' },
  parent1: { id: 'parent-test-001', role: 'parent', children: ['student-test-001'] }
}
```

### Test Database Utilities
- `TestDatabase.setupTestData()`: Initialize test data
- `TestDatabase.cleanupTestData()`: Clean up after tests
- `TestDatabase.createTestFocusSession()`: Create focus session fixtures
- `TestDatabase.createTestGameTemplate()`: Create game template fixtures
- `TestDatabase.createTestHomeworkSession()`: Create homework fixtures
- `TestDatabase.createTestWritingDocument()`: Create writing document fixtures

### WebSocket Test Client
Mock WebSocket client for testing real-time features:
- Connection management
- Message sending/receiving
- Event simulation
- Connection failure testing

## Running Tests

### Prerequisites
1. Node.js 20.19.4+
2. PostgreSQL database (for integration tests)
3. Environment variables configured (.env.test)

### Commands

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test file
npx vitest src/tests/integration/focus-game-integration.test.ts

# Run in watch mode
npx vitest --watch

# Run integration tests only
npx vitest src/tests/integration/

# Generate coverage report
npx vitest --coverage
```

### Environment Setup

#### Test Environment Variables (.env.test)
```env
NODE_ENV=test
DATABASE_URL="postgresql://test:password@localhost:5432/aivo_test"
REDIS_URL="redis://localhost:6379/1"
JWT_SECRET="test-jwt-secret"
WEBSOCKET_PORT=3001
```

#### Database Setup
```bash
# Create test database
createdb aivo_test

# Run migrations
npx prisma migrate deploy --preview-feature

# Seed test data
npx prisma db seed --preview-feature
```

## Integration Test Patterns

### 1. End-to-End Workflow Testing
```typescript
it('should complete full focus session with game intervention', async () => {
  // 1. Start focus session
  const session = await createFocusSession();
  
  // 2. Simulate attention loss
  await triggerFocusEvent('attention_lost');
  
  // 3. Verify intervention trigger
  const intervention = await waitForIntervention();
  
  // 4. Complete game intervention
  await completeGameIntervention(intervention);
  
  // 5. Validate session completion
  const analytics = await getFinalAnalytics(session.id);
  expect(analytics.interventionEffectiveness).toBeGreaterThan(0.7);
});
```

### 2. Real-time Communication Testing
```typescript
it('should synchronize data across WebSocket connections', async () => {
  const client1 = new WebSocketTestClient();
  const client2 = new WebSocketTestClient();
  
  await client1.connect();
  await client2.connect();
  
  // Subscribe both clients to same channel
  await client1.subscribe('focus', sessionId);
  await client2.subscribe('focus', sessionId);
  
  // Send event from client1
  await client1.sendEvent(focusEvent);
  
  // Verify client2 receives event
  const receivedEvent = await client2.waitForMessage();
  expect(receivedEvent.type).toBe('focus_event');
});
```

### 3. Performance and Load Testing
```typescript
it('should handle high-frequency events without data loss', async () => {
  const eventPromises = Array.from({ length: 100 }, (_, i) =>
    sendFocusEvent({ sequenceNumber: i })
  );
  
  const responses = await Promise.all(eventPromises);
  expect(responses).toHaveLength(100);
  
  // Verify all events were recorded
  const storedEvents = await getFocusEvents(sessionId);
  expect(storedEvents).toHaveLength(100);
});
```

## Validation and Assertions

### API Response Validation
```typescript
function validateApiResponse(response, expectedSchema) {
  expect(response.success).toBeDefined();
  if (expectedSchema.data) {
    expect(response.data).toBeDefined();
    for (const field of expectedSchema.data.required) {
      expect(response.data[field]).toBeDefined();
    }
  }
}
```

### WebSocket Message Validation
```typescript
function validateWebSocketMessage(message, expectedType) {
  expect(message.type).toBe(expectedType);
  expect(message.timestamp).toBeDefined();
  expect(message.data).toBeDefined();
}
```

### Data Integrity Validation
```typescript
function validateDataConsistency(before, after, expectedChanges) {
  expect(after.version).toBe(before.version + 1);
  expect(after.updatedAt).toBeGreaterThan(before.updatedAt);
  
  for (const [field, expectedValue] of Object.entries(expectedChanges)) {
    expect(after[field]).toBe(expectedValue);
  }
}
```

## Coverage Requirements

### Minimum Coverage Thresholds
- **Lines**: 70%
- **Functions**: 70%  
- **Branches**: 70%
- **Statements**: 70%

### Critical Path Coverage
- Authentication and authorization flows: 95%
- Data persistence operations: 90%
- WebSocket message handling: 85%
- AI integration points: 80%
- Error handling paths: 75%

## Continuous Integration

### GitHub Actions Workflow
```yaml
name: Integration Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: password
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run database migrations
        run: npx prisma migrate deploy
      
      - name: Run integration tests
        run: npm run test:coverage
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

## Troubleshooting

### Common Issues

#### 1. WebSocket Connection Failures
```typescript
// Check WebSocket server is running
// Verify authentication tokens
// Ensure proper cleanup in afterEach
```

#### 2. Database Connection Issues  
```typescript
// Verify test database exists
// Check migration status
// Ensure cleanup after tests
```

#### 3. Async Test Timing
```typescript
// Use proper await patterns
// Set appropriate timeouts
// Handle race conditions
```

### Debug Utilities
```typescript
// Enable debug logging
process.env.DEBUG = 'aivo:test,aivo:websocket';

// Test data inspection
console.log('Test data:', JSON.stringify(testData, null, 2));

// WebSocket message debugging
wsClient.on('message', (msg) => {
  console.log('WS Message:', msg);
});
```

## Future Enhancements

### Planned Test Additions
1. **Performance benchmarking** for high-load scenarios
2. **Cross-browser WebSocket compatibility** testing
3. **Mobile device integration** testing
4. **Accessibility compliance** validation
5. **Security penetration** testing for APIs
6. **Data migration testing** for schema changes

### Test Infrastructure Improvements
1. **Parallel test execution** optimization
2. **Test data factory** patterns
3. **Visual regression testing** for UI components
4. **API contract testing** with OpenAPI specs
5. **End-to-end testing** with Playwright/Cypress