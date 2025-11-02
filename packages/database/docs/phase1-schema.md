# Database Schema Documentation - Phase 1 Features

## Overview

This document describes the database schema extensions for AIVO Platform Phase 1 features, including Focus Guardian, Game Generation, Homework Helper, and Writing Pad capabilities.

## Phase 1 Feature Tables

### 1. Focus Guardian System

#### focus_sessions
Tracks student focus monitoring sessions with comprehensive analytics and consent management.

**Key Fields:**
- `studentId`: Student being monitored (FK to users)
- `teacherId`: Optional supervising teacher (FK to users)
- `activityType`: Type of activity (lesson, assignment, assessment, free_time)
- `duration`/`actualDuration`: Planned vs actual session time
- `focusScore`: Calculated attention score (0-100)
- `distractionCount`: Number of distractions detected
- `parentalConsent`: Required consent for monitoring
- `monitoringLevel`: Intensity of monitoring (basic, detailed, comprehensive)
- `interventionLevel`: Intervention approach (gentle, moderate, assertive)

**Relationships:**
- One-to-many with `focus_events` (events during session)
- One-to-many with `focus_interventions` (interventions triggered)

#### focus_events
Records individual attention events detected during focus sessions.

**Key Fields:**
- `sessionId`: Parent focus session (FK)
- `type`: Event type (attention_lost, attention_regained, distraction_detected, fatigue_detected)
- `severity`: Event severity (low, medium, high, critical)
- `confidence`: AI confidence in detection (0-1)
- `triggers`: Array of trigger types that caused the event
- `context`: JSON context data about the event

#### focus_interventions
Stores interventions triggered during focus sessions and their effectiveness.

**Key Fields:**
- `sessionId`: Parent focus session (FK)
- `type`: Intervention type (reminder, break_suggestion, game_break, breathing_exercise)
- `strategy`: Approach used (gentle, motivational, gamified, educational)
- `effectiveness`: Post-intervention assessment
- `studentResponse`: JSON data about student's response

### 2. Game Generation System

#### game_templates
Defines reusable game templates for AI content generation.

**Key Fields:**
- `category`: Game category (math, reading, science, logic, memory, creativity)
- `type`: Game type (puzzle, quiz, matching, sorting, drawing, story)
- `minAge`/`maxAge`: Age range for the game
- `gradeLevel`: Target grade level
- `subject`: Academic subject
- `structure`: JSON defining game structure and rules
- `contentSlots`: JSON defining dynamic content areas
- `scoringRubric`: JSON scoring and feedback rules
- `adaptationRules`: JSON rules for difficulty adaptation

#### game_sessions
Individual game instances with generated content and student progress.

**Key Fields:**
- `templateId`: Template used (FK to game_templates)
- `studentId`: Playing student (FK to users)
- `generatedContent`: AI-generated game content
- `gameState`: Current state of the game
- `playerProgress`: Student's progress and achievements
- `skillsAssessed`: Array of skills being evaluated
- `masteryLevels`: JSON mastery data per skill
- `aiAnalysis`: AI insights about performance

#### game_results
Detailed results and analytics after game completion.

**Key Fields:**
- `sessionId`: Game session (FK)
- `skillBreakdown`: JSON performance by skill area
- `questionResults`: JSON individual question/challenge results
- `mistakes`/`strengths`/`improvements`: JSON analysis data
- `difficultyPath`: JSON difficulty progression during game
- `engagementLevel`: Engagement assessment
- `aiInsights`: AI-generated learning insights
- `personalizedTips`: Array of personalized learning tips

### 3. Homework Helper System

#### homework_sessions
Tracks homework assistance sessions with problem analysis and step-by-step guidance.

**Key Fields:**
- `studentId`: Student requesting help (FK to users)
- `subject`: Academic subject
- `problemType`: Type of problem (math_problem, essay, reading_comprehension, science_experiment)
- `problemStatement`: The actual problem/question
- `initialAnalysis`: JSON AI analysis of the problem
- `solutionSteps`: JSON structured solution steps
- `currentStep`: Current step in the solution process
- `hintsUsed`/`maxHints`: Hint usage tracking
- `studentWork`: JSON student's work and progress
- `strugglingAreas`/`strengths`: Arrays of identified areas

#### homework_hints
Individual hints provided during homework sessions.

**Key Fields:**
- `sessionId`: Homework session (FK)
- `stepNumber`: Which solution step this hint applies to
- `hintType`: Type of hint (conceptual, procedural, example, encouragement)
- `content`: The hint text
- `helpful`: Student feedback on hint usefulness
- `personalizedFor`: Personalization context

#### homework_resources
Curated educational resources for homework assistance.

**Key Fields:**
- `type`: Resource type (video, article, interactive, practice_problems, tutorial)
- `subject`/`gradeLevel`: Academic targeting
- `topics`/`skills`: Arrays of covered topics and skills
- `isRecommended`: Whether this is a recommended resource
- `rating`/`engagementScore`: Quality metrics
- `isInteractive`: Whether the resource is interactive

### 4. Writing Pad System

#### writing_documents
Digital writing documents with collaboration and AI assistance features.

**Key Fields:**
- `studentId`: Document author (FK to users)
- `type`: Document type (essay, story, report, journal, poem, letter)
- `content`: Document text content
- `wordCount`/`characterCount`: Content metrics
- `prompt`: Writing prompt or assignment
- `requirements`: JSON formatting and content requirements
- `isShared`: Whether document is shared for collaboration
- `collaborators`: Array of collaborating user IDs
- `aiAssistanceLevel`: Level of AI help (none, basic, moderate, comprehensive)
- `writingTime`/`revisionCount`: Writing analytics
- `aiScore`/`readabilityScore`/`grammarScore`/`creativityScore`: AI assessments

#### writing_feedback
AI-generated and human feedback on writing documents.

**Key Fields:**
- `documentId`: Target document (FK)
- `type`: Feedback type (grammar, style, content, structure, creativity)
- `category`: Feedback category (strength, suggestion, error, question)
- `startPosition`/`endPosition`: Text location for feedback
- `selectedText`: Text being referenced
- `priority`: Feedback priority (low, medium, high)
- `resolved`: Whether feedback has been addressed

#### writing_revisions
Version history and change tracking for writing documents.

**Key Fields:**
- `documentId`: Parent document (FK)
- `versionNumber`: Sequential version number
- `content`: Document content at this version
- `additions`/`deletions`/`modifications`: JSON change tracking
- `changeDescription`: Description of changes made

#### writing_comments
Collaborative comments and discussions on writing documents.

**Key Fields:**
- `documentId`: Target document (FK)
- `authorId`: Comment author (FK to users)
- `parentCommentId`: For threaded replies (FK to writing_comments)
- `startPosition`/`endPosition`: Text location for comments
- `type`: Comment type (general, suggestion, question, praise)
- `isResolved`: Whether comment thread is resolved

#### writing_prompts
Curated writing prompts and assignments.

**Key Fields:**
- `type`: Prompt type (creative, argumentative, narrative, expository, descriptive)
- `gradeLevel`/`subject`: Academic targeting
- `estimatedTime`: Expected completion time
- `minWords`/`maxWords`: Length requirements
- `instructions`: JSON detailed instructions
- `examples`: JSON example responses
- `rubric`: JSON evaluation rubric

## Database Relationships

### User Relationships
The existing `users` table has been extended with new relationship fields for Phase 1 features:
- `focusSessionsAsStudent`/`focusSessionsAsTeacher`
- `gameSessionsAsStudent`/`gameSessionsAsTeacher`  
- `homeworkSessionsAsStudent`/`homeworkSessionsAsTeacher`
- `writingDocumentsAsStudent`/`writingDocumentsAsTeacher`
- `writingComments`

### Key Foreign Key Relationships
- All session tables link to `users` for students and optional teachers
- Event/result tables link to their respective session tables
- Template tables are referenced by session tables
- Comment systems support threaded discussions via self-references

## Indexes and Performance

### Focus Guardian Indexes
- `focus_sessions_studentId_startedAt_idx`: Student focus history queries
- `focus_events_sessionId_detectedAt_idx`: Event timeline queries
- `focus_interventions_type_effectiveness_idx`: Intervention analytics

### Game Generation Indexes
- `game_templates_category_gradeLevel_idx`: Template discovery
- `game_sessions_studentId_createdAt_idx`: Student game history
- `game_results_completedAt_idx`: Recent results queries

### Homework Helper Indexes
- `homework_sessions_subject_gradeLevel_idx`: Academic content queries
- `homework_resources_type_isRecommended_idx`: Resource recommendations

### Writing Pad Indexes
- `writing_documents_studentId_createdAt_idx`: Student document history
- `writing_feedback_documentId_type_idx`: Document feedback queries
- `writing_comments_documentId_createdAt_idx`: Comment timeline queries

## Data Privacy and Consent

### Focus Guardian Privacy
- All focus monitoring requires explicit `parentalConsent`
- `consentedBy` field tracks who provided consent
- Configurable `monitoringLevel` respects privacy preferences
- Event data includes only necessary context for educational purposes

### Student Data Protection
- All student-generated content is tied to specific students
- Soft deletion preserves data for academic records while respecting privacy
- Shared documents have granular `shareSettings` controls
- AI analysis data is anonymized for system improvements

## Migration Strategy

### Phase 1 Migration: `20241214_add_phase1_features`
1. **Create new tables** for all Phase 1 features
2. **Add indexes** for optimal query performance  
3. **Establish foreign key relationships** to existing user system
4. **Seed initial data** including game templates, writing prompts, and homework resources

### Data Seeding
The migration includes comprehensive seed data:
- **Game Templates**: Math and reading games for different age groups
- **Writing Prompts**: Narrative and expository prompts with rubrics
- **Homework Resources**: Interactive tutorials and educational content

## API Integration

### Repository Pattern
Each feature area has a dedicated repository interface:
- `FocusRepository`: Focus session and event management
- `GameRepository`: Game template and session handling
- `HomeworkRepository`: Homework session and resource management  
- `WritingRepository`: Document and collaboration features

### Query Optimization
- Pagination support for all list endpoints
- Filtered queries by grade level, subject, and date ranges
- Aggregated analytics queries for dashboards and reports
- Real-time query support for WebSocket features

## Future Considerations

### Scalability
- JSON fields allow flexible schema evolution
- Partitioning strategies for high-volume event data
- Caching layers for frequently accessed templates and resources

### Analytics Enhancement
- Time-series data collection for learning pattern analysis
- Machine learning feature extraction from student interaction data
- Cross-feature correlation analysis (focus vs. game performance)

### Integration Points
- Assessment system integration for comprehensive student profiles  
- IEP system integration for accommodation tracking
- Curriculum standards alignment for content recommendations