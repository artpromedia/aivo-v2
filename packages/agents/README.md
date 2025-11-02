# AIVO Agents Package

A comprehensive collection of specialized AI agents for educational assessment, personalization, and support within the AIVO platform.

## Overview

The AIVO Agents package provides four powerful AI agents designed specifically for special education and personalized learning:

1. **BaselineAssessmentAgent** - Adaptive baseline assessment with multi-domain testing
2. **PersonalModelAgent** - Personalized learning model management and adaptation
3. **IEPAssistantAgent** - Comprehensive IEP management and compliance support
4. **ProgressMonitorAgent** - Advanced progress tracking and predictive analytics

## Installation

```bash
npm install @aivo/agents
```

## Quick Start

### Basic Usage

```typescript
import { AgentFactory, AgentType } from '@aivo/agents';
import { AivoBrain } from '@aivo/aivo-brain';

// Initialize AIVO Brain
const aivoBrain = new AivoBrain(config);

// Create agent configuration
const agentConfig = {
  agentType: AgentType.BASELINE_ASSESSMENT,
  studentId: 'student-123',
  settings: {
    adaptiveDifficulty: true,
    timeLimit: 30 // minutes
  }
};

// Create agent context
const context = {
  student: {
    id: 'student-123',
    firstName: 'Jane',
    lastName: 'Doe',
    gradeLevel: 5,
    disabilities: ['learning_disability'],
    accommodations: ['extended_time', 'read_aloud']
  }
};

// Create and initialize agent
const agent = AgentFactory.createAgent(
  AgentType.BASELINE_ASSESSMENT,
  agentConfig,
  context,
  aivoBrain
);

await agent.initialize();
```

### Assessment Agent Example

```typescript
import { BaselineAssessmentAgent, AssessmentDomain } from '@aivo/agents';

const assessmentAgent = new BaselineAssessmentAgent(config, context, aivoBrain);
await assessmentAgent.initialize();

// Start adaptive assessment
const assessment = await assessmentAgent.createAssessment([
  AssessmentDomain.READING_COMPREHENSION,
  AssessmentDomain.MATHEMATICS
]);

// Get next question based on student performance
const question = await assessmentAgent.getNextQuestion(
  AssessmentDomain.MATHEMATICS,
  previousResponse
);

// Generate comprehensive report
const report = await assessmentAgent.generateReport(results);
```

### Personal Model Agent Example

```typescript
import { PersonalModelAgent, LearningStyle } from '@aivo/agents';

const modelAgent = new PersonalModelAgent(config, context, aivoBrain);
await modelAgent.initialize();

// Clone learning model from assessment
await modelAgent.cloneFromAssessment(assessmentReport);

// Adapt to new learning styles
const update = await modelAgent.adaptLearningStyle([
  LearningStyle.VISUAL,
  LearningStyle.KINESTHETIC
]);

// Personalize content for specific domain
const personalizedContent = await modelAgent.personalizeContent(
  originalContent,
  AssessmentDomain.MATHEMATICS
);

// Generate suggestions for parents and teachers
const suggestions = await modelAgent.generateSuggestions('parent');
```

### IEP Assistant Agent Example

```typescript
import { IEPAssistantAgent, AssessmentDomain } from '@aivo/agents';

const iepAgent = new IEPAssistantAgent(config, context, aivoBrain);
await iepAgent.initialize();

// Generate IEP template from assessment
const iepTemplate = await iepAgent.generateIEPTemplate(assessmentReport);

// Generate specific goals for domain
const goals = await iepAgent.generateGoals(
  AssessmentDomain.READING_COMPREHENSION,
  'Grade 3 instructional level'
);

// Check compliance
const compliance = await iepAgent.checkCompliance(iepData);

// Create parent-friendly explanation
const explanation = await iepAgent.explainForParents(iepContent);
```

### Progress Monitor Agent Example

```typescript
import { ProgressMonitorAgent, AssessmentDomain } from '@aivo/agents';

const progressAgent = new ProgressMonitorAgent(config, context, aivoBrain);
await progressAgent.initialize();

// Track progress data
await progressAgent.trackProgress(
  AssessmentDomain.MATHEMATICS,
  { score: 85, timestamp: new Date() }
);

// Analyze trends
const trend = await progressAgent.analyzeTrends(
  AssessmentDomain.MATHEMATICS,
  30 // last 30 days
);

// Generate alerts
const alerts = await progressAgent.generateAlerts();

// Create comprehensive report
const report = await progressAgent.generateReport(90); // 90-day report
```

## Agent Architecture

### Base Agent

All agents extend the `BaseAgent` class which provides:

- **Event-driven architecture** with EventEmitter
- **Robust error handling** with retry logic
- **Comprehensive logging** with Winston
- **Task queue management** with p-queue
- **Streaming capabilities** for real-time responses
- **AIVO Brain integration** for AI operations

### Agent Lifecycle

1. **Initialization** - Agent validates context and initializes resources
2. **Processing** - Agent performs specialized educational tasks
3. **Monitoring** - Agent tracks performance and generates insights
4. **Disposal** - Agent cleans up resources and saves state

## Features

### Baseline Assessment Agent

- **Adaptive Difficulty**: Real-time adjustment based on student responses
- **Multi-Domain Support**: Reading, mathematics, science, and more
- **Comprehensive Reporting**: Detailed analysis with recommendations
- **Knowledge Gap Detection**: Identifies specific learning gaps
- **Accessibility Features**: Built-in accommodations support

### Personal Model Agent

- **Learning Style Detection**: Automatic identification of preferred styles
- **Content Personalization**: Dynamic content adaptation
- **Pacing Adjustment**: Performance-based speed modifications
- **Interaction Memory**: Tracks and learns from student interactions
- **Suggestion Generation**: AI-powered recommendations for educators

### IEP Assistant Agent

- **Template Generation**: Evidence-based IEP creation
- **SMART Goal Development**: Specific, measurable, achievable goals
- **Compliance Checking**: IDEA and state-specific validation
- **Progress Reporting**: Automated progress documentation
- **Parent Communication**: Clear, accessible explanations

### Progress Monitor Agent

- **Trend Analysis**: Statistical analysis of performance data
- **Predictive Modeling**: Outcome prediction and intervention timing
- **Alert System**: Automated concern detection and notifications
- **Comprehensive Reporting**: Data-driven insights and recommendations
- **Pattern Recognition**: Cross-domain performance analysis

## Configuration

### Agent Configuration

```typescript
interface AgentConfig {
  agentType: AgentType;
  studentId: string;
  settings: Record<string, any>;
  capabilities?: string[];
  timeoutMs?: number;
  retryAttempts?: number;
}
```

### Agent Context

```typescript
interface AgentContext {
  student: StudentProfile;
  assessmentData?: AssessmentReport[];
  iepData?: IEPData;
  progressData?: any[];
  environmentSettings?: Record<string, any>;
}
```

## Error Handling

All agents include comprehensive error handling:

- **Retry Logic**: Automatic retry with exponential backoff
- **Graceful Degradation**: Fallback behaviors when services unavailable
- **Detailed Logging**: Comprehensive error tracking and debugging
- **User-Friendly Messages**: Clear error communication

```typescript
try {
  const result = await agent.performTask();
} catch (error) {
  if (error instanceof AgentError) {
    // Handle specific agent errors
    console.log('Agent Error:', error.message);
    console.log('Suggestions:', error.suggestions);
  }
}
```

## Events

Agents emit events for monitoring and integration:

```typescript
agent.on('taskStarted', (taskInfo) => {
  console.log('Task started:', taskInfo.taskType);
});

agent.on('progress', (progressInfo) => {
  console.log('Progress:', progressInfo.percentage);
});

agent.on('taskCompleted', (result) => {
  console.log('Task completed successfully');
});

agent.on('error', (error) => {
  console.log('Agent error:', error.message);
});
```

## Development

### Building

```bash
npm run build
```

### Testing

```bash
npm test
npm run test:coverage
```

### Linting

```bash
npm run lint
```

## License

MIT License - see LICENSE file for details

## Support

For questions and support, please contact the AIVO development team or create an issue in the repository.