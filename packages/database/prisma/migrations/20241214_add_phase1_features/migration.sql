-- CreateTable
CREATE TABLE "focus_sessions" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "teacherId" TEXT,
    "subject" TEXT,
    "activityType" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "actualDuration" INTEGER,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'active',
    "focusScore" DOUBLE PRECISION,
    "distractionCount" INTEGER NOT NULL DEFAULT 0,
    "attentionSpan" INTEGER,
    "fatigueLevel" TEXT,
    "parentalConsent" BOOLEAN NOT NULL DEFAULT false,
    "consentedBy" TEXT,
    "monitoringLevel" TEXT NOT NULL DEFAULT 'basic',
    "interventionLevel" TEXT NOT NULL DEFAULT 'gentle',
    "analytics" JSONB,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "focus_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "focus_events" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "severity" TEXT NOT NULL DEFAULT 'low',
    "confidence" DOUBLE PRECISION NOT NULL,
    "description" TEXT,
    "duration" INTEGER,
    "triggers" TEXT[],
    "context" JSONB,
    "detectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "acknowledgedAt" TIMESTAMP(3),
    "resolvedAt" TIMESTAMP(3),
    "deviceInfo" JSONB,
    "environmentData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "focus_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "focus_interventions" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "strategy" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "content" JSONB,
    "duration" INTEGER,
    "triggeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "skippedAt" TIMESTAMP(3),
    "effectiveness" TEXT,
    "studentResponse" JSONB,
    "followUpNeeded" BOOLEAN NOT NULL DEFAULT false,
    "aiGenerated" BOOLEAN NOT NULL DEFAULT true,
    "personalizedFor" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "focus_interventions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "game_templates" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "minAge" INTEGER NOT NULL,
    "maxAge" INTEGER NOT NULL,
    "gradeLevel" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL DEFAULT 'medium',
    "estimatedDuration" INTEGER NOT NULL,
    "maxPlayers" INTEGER NOT NULL DEFAULT 1,
    "isMultiplayer" BOOLEAN NOT NULL DEFAULT false,
    "structure" JSONB NOT NULL,
    "contentSlots" JSONB NOT NULL,
    "scoringRubric" JSONB NOT NULL,
    "adaptationRules" JSONB NOT NULL,
    "tags" TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "popularity" INTEGER NOT NULL DEFAULT 0,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "game_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "game_sessions" (
    "id" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "teacherId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'created',
    "generatedContent" JSONB NOT NULL,
    "gameState" JSONB NOT NULL,
    "playerProgress" JSONB NOT NULL,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "estimatedDuration" INTEGER NOT NULL,
    "actualDuration" INTEGER,
    "score" INTEGER,
    "maxScore" INTEGER,
    "percentage" DOUBLE PRECISION,
    "performanceLevel" TEXT,
    "skillsAssessed" TEXT[],
    "masteryLevels" JSONB NOT NULL,
    "learningObjectives" TEXT[],
    "aiAnalysis" JSONB,
    "feedback" TEXT,
    "recommendations" TEXT[],
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "game_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "game_results" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "score" INTEGER NOT NULL,
    "maxScore" INTEGER NOT NULL,
    "percentage" DOUBLE PRECISION NOT NULL,
    "timeTaken" INTEGER NOT NULL,
    "skillBreakdown" JSONB NOT NULL,
    "questionResults" JSONB NOT NULL,
    "mistakes" JSONB NOT NULL,
    "strengths" JSONB NOT NULL,
    "improvements" JSONB NOT NULL,
    "difficultyPath" JSONB NOT NULL,
    "engagementLevel" TEXT NOT NULL,
    "frustrationPoints" JSONB NOT NULL,
    "successMoments" JSONB NOT NULL,
    "aiInsights" JSONB NOT NULL,
    "personalizedTips" TEXT[],
    "nextSteps" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "game_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "homework_sessions" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "teacherId" TEXT,
    "subject" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "gradeLevel" TEXT NOT NULL,
    "problemType" TEXT NOT NULL,
    "problemStatement" TEXT NOT NULL,
    "problemImages" JSONB,
    "attachments" JSONB,
    "status" TEXT NOT NULL DEFAULT 'active',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "initialAnalysis" JSONB,
    "difficultyLevel" TEXT,
    "estimatedTime" INTEGER,
    "requiredSkills" TEXT[],
    "solutionSteps" JSONB NOT NULL,
    "currentStep" INTEGER NOT NULL DEFAULT 0,
    "hintsUsed" INTEGER NOT NULL DEFAULT 0,
    "maxHints" INTEGER NOT NULL DEFAULT 3,
    "studentWork" JSONB NOT NULL,
    "finalAnswer" JSONB,
    "confidence" TEXT,
    "feedback" TEXT,
    "isCorrect" BOOLEAN,
    "score" DOUBLE PRECISION,
    "strugglingAreas" TEXT[],
    "strengths" TEXT[],
    "recommendations" TEXT[],
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "homework_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "homework_hints" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "stepNumber" INTEGER NOT NULL,
    "hintType" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "explanation" TEXT,
    "examples" JSONB,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "viewedAt" TIMESTAMP(3),
    "helpful" BOOLEAN,
    "aiGenerated" BOOLEAN NOT NULL DEFAULT true,
    "personalizedFor" TEXT,
    "difficulty" TEXT NOT NULL DEFAULT 'appropriate',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "homework_hints_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "homework_resources" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "url" TEXT,
    "content" TEXT,
    "subject" TEXT NOT NULL,
    "gradeLevel" TEXT NOT NULL,
    "topics" TEXT[],
    "skills" TEXT[],
    "duration" INTEGER,
    "difficulty" TEXT NOT NULL DEFAULT 'medium',
    "language" TEXT NOT NULL DEFAULT 'en',
    "isInteractive" BOOLEAN NOT NULL DEFAULT false,
    "rating" DOUBLE PRECISION,
    "engagementScore" DOUBLE PRECISION,
    "isRecommended" BOOLEAN NOT NULL DEFAULT false,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "requiresLogin" BOOLEAN NOT NULL DEFAULT false,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "homework_resources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "writing_documents" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "teacherId" TEXT,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "subject" TEXT,
    "gradeLevel" TEXT NOT NULL,
    "content" TEXT NOT NULL DEFAULT '',
    "wordCount" INTEGER NOT NULL DEFAULT 0,
    "characterCount" INTEGER NOT NULL DEFAULT 0,
    "prompt" TEXT,
    "instructions" JSONB,
    "rubric" JSONB,
    "requirements" JSONB,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "submittedAt" TIMESTAMP(3),
    "dueDate" TIMESTAMP(3),
    "isShared" BOOLEAN NOT NULL DEFAULT false,
    "shareSettings" JSONB,
    "collaborators" TEXT[],
    "aiAssistanceLevel" TEXT NOT NULL DEFAULT 'basic',
    "suggestionMode" TEXT NOT NULL DEFAULT 'grammar',
    "writingTime" INTEGER NOT NULL DEFAULT 0,
    "revisionCount" INTEGER NOT NULL DEFAULT 0,
    "pauseCount" INTEGER NOT NULL DEFAULT 0,
    "deletionCount" INTEGER NOT NULL DEFAULT 0,
    "aiScore" DOUBLE PRECISION,
    "readabilityScore" DOUBLE PRECISION,
    "grammarScore" DOUBLE PRECISION,
    "creativityScore" DOUBLE PRECISION,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "writing_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "writing_feedback" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "feedback" TEXT NOT NULL,
    "suggestion" TEXT,
    "explanation" TEXT,
    "startPosition" INTEGER,
    "endPosition" INTEGER,
    "selectedText" TEXT,
    "aiGenerated" BOOLEAN NOT NULL DEFAULT true,
    "confidence" DOUBLE PRECISION,
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "viewedAt" TIMESTAMP(3),
    "acceptedAt" TIMESTAMP(3),
    "dismissedAt" TIMESTAMP(3),
    "helpful" BOOLEAN,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "writing_feedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "writing_revisions" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "versionNumber" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "changeDescription" TEXT,
    "additions" JSONB,
    "deletions" JSONB,
    "modifications" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "wordCount" INTEGER NOT NULL DEFAULT 0,
    "characterCount" INTEGER NOT NULL DEFAULT 0,
    "metadata" JSONB,

    CONSTRAINT "writing_revisions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "writing_comments" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'general',
    "startPosition" INTEGER,
    "endPosition" INTEGER,
    "selectedText" TEXT,
    "parentCommentId" TEXT,
    "isResolved" BOOLEAN NOT NULL DEFAULT false,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "writing_comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "writing_prompts" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "subject" TEXT,
    "gradeLevel" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL DEFAULT 'medium',
    "estimatedTime" INTEGER NOT NULL,
    "minWords" INTEGER,
    "maxWords" INTEGER,
    "instructions" JSONB,
    "examples" JSONB,
    "rubric" JSONB,
    "keywords" TEXT[],
    "tags" TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "popularity" INTEGER NOT NULL DEFAULT 0,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "writing_prompts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "focus_sessions_studentId_startedAt_idx" ON "focus_sessions"("studentId", "startedAt");

-- CreateIndex
CREATE INDEX "focus_sessions_status_startedAt_idx" ON "focus_sessions"("status", "startedAt");

-- CreateIndex
CREATE INDEX "focus_events_sessionId_detectedAt_idx" ON "focus_events"("sessionId", "detectedAt");

-- CreateIndex
CREATE INDEX "focus_events_type_detectedAt_idx" ON "focus_events"("type", "detectedAt");

-- CreateIndex
CREATE INDEX "focus_interventions_sessionId_triggeredAt_idx" ON "focus_interventions"("sessionId", "triggeredAt");

-- CreateIndex
CREATE INDEX "focus_interventions_type_effectiveness_idx" ON "focus_interventions"("type", "effectiveness");

-- CreateIndex
CREATE INDEX "game_templates_category_gradeLevel_idx" ON "game_templates"("category", "gradeLevel");

-- CreateIndex
CREATE INDEX "game_templates_subject_difficulty_idx" ON "game_templates"("subject", "difficulty");

-- CreateIndex
CREATE INDEX "game_sessions_studentId_createdAt_idx" ON "game_sessions"("studentId", "createdAt");

-- CreateIndex
CREATE INDEX "game_sessions_status_startedAt_idx" ON "game_sessions"("status", "startedAt");

-- CreateIndex
CREATE INDEX "game_results_sessionId_idx" ON "game_results"("sessionId");

-- CreateIndex
CREATE INDEX "game_results_completedAt_idx" ON "game_results"("completedAt");

-- CreateIndex
CREATE INDEX "homework_sessions_studentId_createdAt_idx" ON "homework_sessions"("studentId", "createdAt");

-- CreateIndex
CREATE INDEX "homework_sessions_subject_gradeLevel_idx" ON "homework_sessions"("subject", "gradeLevel");

-- CreateIndex
CREATE INDEX "homework_hints_sessionId_stepNumber_idx" ON "homework_hints"("sessionId", "stepNumber");

-- CreateIndex
CREATE INDEX "homework_resources_subject_gradeLevel_idx" ON "homework_resources"("subject", "gradeLevel");

-- CreateIndex
CREATE INDEX "homework_resources_type_isRecommended_idx" ON "homework_resources"("type", "isRecommended");

-- CreateIndex
CREATE INDEX "writing_documents_studentId_createdAt_idx" ON "writing_documents"("studentId", "createdAt");

-- CreateIndex
CREATE INDEX "writing_documents_status_dueDate_idx" ON "writing_documents"("status", "dueDate");

-- CreateIndex
CREATE INDEX "writing_feedback_documentId_type_idx" ON "writing_feedback"("documentId", "type");

-- CreateIndex
CREATE INDEX "writing_feedback_aiGenerated_priority_idx" ON "writing_feedback"("aiGenerated", "priority");

-- CreateIndex
CREATE INDEX "writing_revisions_documentId_versionNumber_idx" ON "writing_revisions"("documentId", "versionNumber");

-- CreateIndex
CREATE INDEX "writing_comments_documentId_createdAt_idx" ON "writing_comments"("documentId", "createdAt");

-- CreateIndex
CREATE INDEX "writing_comments_authorId_idx" ON "writing_comments"("authorId");

-- CreateIndex
CREATE INDEX "writing_prompts_gradeLevel_subject_idx" ON "writing_prompts"("gradeLevel", "subject");

-- CreateIndex
CREATE INDEX "writing_prompts_type_difficulty_idx" ON "writing_prompts"("type", "difficulty");

-- AddForeignKey
ALTER TABLE "focus_sessions" ADD CONSTRAINT "focus_sessions_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "focus_sessions" ADD CONSTRAINT "focus_sessions_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "focus_events" ADD CONSTRAINT "focus_events_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "focus_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "focus_interventions" ADD CONSTRAINT "focus_interventions_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "focus_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game_sessions" ADD CONSTRAINT "game_sessions_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "game_templates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game_sessions" ADD CONSTRAINT "game_sessions_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game_sessions" ADD CONSTRAINT "game_sessions_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game_results" ADD CONSTRAINT "game_results_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "game_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "homework_sessions" ADD CONSTRAINT "homework_sessions_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "homework_sessions" ADD CONSTRAINT "homework_sessions_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "homework_hints" ADD CONSTRAINT "homework_hints_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "homework_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "homework_resources" ADD CONSTRAINT "homework_resources_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "homework_sessions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "writing_documents" ADD CONSTRAINT "writing_documents_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "writing_documents" ADD CONSTRAINT "writing_documents_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "writing_feedback" ADD CONSTRAINT "writing_feedback_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "writing_documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "writing_revisions" ADD CONSTRAINT "writing_revisions_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "writing_documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "writing_comments" ADD CONSTRAINT "writing_comments_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "writing_documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "writing_comments" ADD CONSTRAINT "writing_comments_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "writing_comments" ADD CONSTRAINT "writing_comments_parentCommentId_fkey" FOREIGN KEY ("parentCommentId") REFERENCES "writing_comments"("id") ON DELETE SET NULL ON UPDATE CASCADE;