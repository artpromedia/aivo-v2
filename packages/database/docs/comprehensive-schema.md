# Aivo Platform - Comprehensive Database Schema

## Overview

This document describes the comprehensive Prisma schema for the Aivo Platform, a special education AI-powered learning platform. The schema supports multi-tenancy, IEP management, AI-powered features, and Phase 1 specialized features.

## Schema Architecture

### Multi-Tenant Foundation
- **Tenant**: Top-level organization (districts, schools, or individual customers)
- **District**: Educational districts within tenants
- **School**: Individual schools within districts
- **Classroom**: Classrooms within schools

### User Management
- **User**: Multi-role users (learner, parent, teacher, district_admin, platform_admin)
- **ParentStudentRelation**: Parent-child relationships
- **UserSession**: Session management with device tracking
- **ConsentRecord**: COPPA and privacy consent tracking

### Student Profiles & Special Needs
- **StudentProfile**: Comprehensive student information including:
  - Disability classifications and accommodations
  - IEP and 504 plan status
  - Learning preferences and accessibility settings
  - Focus baseline metrics
  - Behavioral patterns and motivators

### IEP Management
- **IEP**: Individual Education Programs
- **IEPGoal**: SMART goals with progress tracking
- **IEPService**: Related services (speech, OT, PT, etc.)
- **IEPTeamMember**: Team member participation
- **IEPMeeting**: Meeting records and documentation
- **BehaviorInterventionPlan**: Behavior support plans

### Assessment System
- **Assessment**: Assessments with adaptive capabilities
- **AssessmentQuestion**: Questions with accommodations support
- **AssessmentAssignment**: Student assignments with accommodations
- **AssessmentAttempt**: Attempt tracking with AI insights
- **AssessmentResponse**: Individual question responses

### Curriculum & Standards
- **CurriculumStandard**: Standards alignment (Common Core, state standards)

### AI Models & Personalization
- **AIModel**: Base AI models with capabilities
- **PersonalAIModel**: Student-specific AI adaptations
- **AIConversation**: Conversational AI sessions
- **AIMessage**: Individual messages in conversations
- **AIGeneratedContent**: AI-created educational content

## Phase 1 Features

### Focus Guardian
Monitor and improve student attention and focus:

- **FocusSession**: Learning sessions with attention tracking
  - Focus scores and distraction counts
  - Parental consent and monitoring levels
  - Real-time analytics and metadata

- **FocusEvent**: Individual attention events
  - Types: attention_lost, attention_regained, distraction_detected
  - Severity levels and confidence scores
  - Environmental context

- **FocusIntervention**: AI-powered interventions
  - Types: reminders, breaks, games, exercises
  - Effectiveness tracking
  - Student response and feedback

### Game Generation
AI-generated educational games for focus restoration:

- **GameTemplate**: Reusable game templates
  - Age/grade targeting and subject alignment
  - Difficulty levels and adaptation rules
  - Content slots for dynamic generation

- **GameSession**: Individual game play sessions
  - AI-generated content and game state
  - Performance tracking and scoring
  - Learning outcomes assessment

- **GameResult**: Detailed game performance analysis
  - Skill breakdown and mistake analysis
  - Engagement and frustration tracking
  - AI insights and recommendations

### Homework Helper
AI-powered homework assistance:

- **HomeworkSession**: Homework help sessions
  - Problem analysis and difficulty assessment
  - Step-by-step solution tracking
  - Student work and confidence levels

- **HomeworkHint**: Contextual hints and help
  - Multiple hint types (conceptual, procedural, examples)
  - Effectiveness tracking
  - Personalized AI generation

- **HomeworkResource**: Educational resources and references
  - Multiple content types (videos, articles, tutorials)
  - Quality ratings and engagement metrics
  - Subject and skill targeting

### Writing Pad
Digital writing platform with AI assistance:

- **WritingDocument**: Student writing assignments
  - Multiple document types (essays, stories, reports)
  - Collaboration and sharing features
  - AI assistance levels and writing analytics

- **WritingFeedback**: AI-generated writing feedback
  - Grammar, style, and content suggestions
  - Position-specific comments
  - Student interaction tracking

- **WritingRevision**: Version control for documents
  - Change tracking (additions, deletions, modifications)
  - Word count progression

- **WritingComment**: Collaborative commenting system
  - Teacher and peer feedback
  - Thread management and resolution

- **WritingPrompt**: Writing prompt templates
  - Grade-level and subject targeting
  - Rubrics and example responses

## Analytics & Reporting

### Daily & Weekly Summaries
- **DailyFocusSummary**: Daily focus metrics and patterns
  - Subject breakdown and time patterns
  - Intervention effectiveness
  - AI-generated recommendations

- **WeeklyProgressReport**: Comprehensive weekly progress
  - Academic and focus progress tracking
  - IEP goal progress (if applicable)
  - AI insights and recommendations

## Subscription & Billing
- **SubscriptionPlan**: Tiered feature sets
- **Subscription**: Customer subscriptions with usage tracking
- **Invoice**: Billing and payment records
- **UsageRecord**: Feature usage metrics

## Key Design Principles

### Multi-Tenancy
- All data isolated by `tenantId`
- Hierarchical organization (Tenant → District → School → Classroom)
- Row-level security support

### Audit & Compliance
- Comprehensive audit fields (`createdAt`, `updatedAt`, `deletedAt`)
- Soft delete support across all models
- COPPA consent tracking
- Session and activity logging

### Performance Optimization
- Strategic compound indexes for common queries:
  - `[tenantId, role]` on users
  - `[studentId, createdAt]` on sessions
  - `[subject, gradeLevel]` on content
  - `[status, startedAt]` on activities

### Flexibility & Extensibility
- JSON fields for flexible data storage
- Metadata fields for future extensions
- Modular feature design
- Standards-based curriculum alignment

### Privacy & Security
- Proper data relationships with cascade deletes
- Consent management
- Session tracking with device information
- Multi-factor authentication support

## Usage Examples

### Common Query Patterns

```typescript
// Get student's daily focus summary
const focusSummary = await prisma.dailyFocusSummary.findUnique({
  where: {
    studentId_date: {
      studentId: "student123",
      date: new Date("2024-01-15")
    }
  }
});

// Get homework sessions for a student with hints
const homeworkSessions = await prisma.homeworkSession.findMany({
  where: {
    studentId: "student123",
    subject: "math"
  },
  include: {
    hints: true,
    resources: true
  },
  orderBy: { createdAt: 'desc' }
});

// Get IEP with all related data
const iep = await prisma.iEP.findUnique({
  where: { id: "iep123" },
  include: {
    goals: true,
    services: true,
    teamMembers: true,
    meetings: true,
    behaviorPlan: true
  }
});
```

## Migration Strategy

1. **Phase 1**: Core models (User, Tenant, School hierarchy)
2. **Phase 2**: IEP and assessment models
3. **Phase 3**: AI models and personalization
4. **Phase 4**: Phase 1 features (Focus, Games, Homework, Writing)
5. **Phase 5**: Analytics and reporting models

Each migration includes:
- Data migration scripts
- Index creation
- Security policy setup
- Seed data for testing

## Security Considerations

- Row-level security policies for multi-tenant isolation
- Encrypted fields for sensitive data (MFA secrets, backup codes)
- Audit trails for all data modifications
- Consent management for minors
- Session management with device tracking

This schema provides a solid foundation for the Aivo Platform while maintaining flexibility for future enhancements and compliance with educational data privacy requirements.