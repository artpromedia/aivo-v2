import { z } from 'zod';

// =============================================================================
// CORE AGENT TYPES
// =============================================================================

export enum AgentType {
  BASELINE_ASSESSMENT = 'baseline_assessment',
  PERSONAL_MODEL = 'personal_model',
  IEP_ASSISTANT = 'iep_assistant',
  PROGRESS_MONITOR = 'progress_monitor'
}

export enum AgentStatus {
  IDLE = 'idle',
  PROCESSING = 'processing',
  WAITING = 'waiting',
  ERROR = 'error',
  COMPLETED = 'completed'
}

// =============================================================================
// DISABILITY & ASSESSMENT TYPES
// =============================================================================

export enum DisabilityType {
  AUTISM_SPECTRUM = 'autism_spectrum',
  ADHD = 'adhd',
  LEARNING_DISABILITY = 'learning_disability',
  INTELLECTUAL_DISABILITY = 'intellectual_disability',
  SPEECH_LANGUAGE = 'speech_language',
  PHYSICAL_DISABILITY = 'physical_disability',
  VISUAL_IMPAIRMENT = 'visual_impairment',
  HEARING_IMPAIRMENT = 'hearing_impairment',
  EMOTIONAL_BEHAVIORAL = 'emotional_behavioral',
  MULTIPLE_DISABILITIES = 'multiple_disabilities',
  OTHER = 'other'
}

export enum AssessmentDomain {
  READING_COMPREHENSION = 'reading_comprehension',
  MATHEMATICS = 'mathematics',
  SCIENCE = 'science',
  WRITING = 'writing',
  SOCIAL_STUDIES = 'social_studies',
  LANGUAGE_ARTS = 'language_arts',
  SOCIAL_EMOTIONAL = 'social_emotional',
  SPEECH_LANGUAGE = 'speech_language',
  MOTOR_SKILLS = 'motor_skills',
  ADAPTIVE_BEHAVIOR = 'adaptive_behavior'
}

export enum DifficultyLevel {
  EMERGENT = 'emergent',
  DEVELOPING = 'developing',
  PROFICIENT = 'proficient',
  ADVANCED = 'advanced'
}

export enum LearningStyle {
  VISUAL = 'visual',
  AUDITORY = 'auditory',
  KINESTHETIC = 'kinesthetic',
  READING_WRITING = 'reading_writing',
  MULTIMODAL = 'multimodal'
}

// =============================================================================
// ASSESSMENT SCHEMAS
// =============================================================================

export const AssessmentQuestionSchema = z.object({
  id: z.string(),
  domain: z.nativeEnum(AssessmentDomain),
  difficulty: z.nativeEnum(DifficultyLevel),
  question: z.string(),
  type: z.enum(['multiple_choice', 'short_answer', 'essay', 'interactive', 'visual']),
  options: z.array(z.string()).optional(),
  correctAnswer: z.string().optional(),
  rubric: z.array(z.object({
    criteria: z.string(),
    points: z.number(),
    description: z.string()
  })).optional(),
  accommodations: z.array(z.string()).optional(),
  timeLimit: z.number().optional(), // in seconds
  metadata: z.record(z.any()).optional()
});

export const AssessmentResponseSchema = z.object({
  questionId: z.string(),
  response: z.string(),
  timeSpent: z.number(), // in seconds
  confidence: z.number().min(0).max(1).optional(),
  assistanceUsed: z.array(z.string()).optional(),
  timestamp: z.date()
});

export const AssessmentResultSchema = z.object({
  questionId: z.string(),
  domain: z.nativeEnum(AssessmentDomain),
  score: z.number().min(0).max(100),
  feedback: z.string(),
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
  recommendations: z.array(z.string()),
  nextSteps: z.array(z.string())
});

// =============================================================================
// STUDENT & IEP TYPES
// =============================================================================

export const StudentProfileSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  dateOfBirth: z.date(),
  gradeLevel: z.string(),
  disabilities: z.array(z.nativeEnum(DisabilityType)),
  learningStyles: z.array(z.nativeEnum(LearningStyle)),
  accommodations: z.array(z.string()),
  modifications: z.array(z.string()),
  assistiveTechnology: z.array(z.string()).optional(),
  curriculumRegion: z.string(),
  schoolId: z.string(),
  teacherId: z.string(),
  parentIds: z.array(z.string())
});

export const IEPGoalSchema = z.object({
  id: z.string(),
  domain: z.nativeEnum(AssessmentDomain),
  description: z.string(),
  measurableObjective: z.string(),
  targetDate: z.date(),
  currentLevel: z.string(),
  targetLevel: z.string(),
  evaluationMethod: z.string(),
  frequency: z.string(),
  criteria: z.string(),
  progress: z.array(z.object({
    date: z.date(),
    score: z.number(),
    notes: z.string(),
    reportedBy: z.string()
  })),
  status: z.enum(['active', 'met', 'discontinued', 'revised']),
  accommodations: z.array(z.string()),
  services: z.array(z.string())
});

export const IEPDataSchema = z.object({
  studentId: z.string(),
  effectiveDate: z.date(),
  nextReviewDate: z.date(),
  nextEvaluationDate: z.date(),
  goals: z.array(IEPGoalSchema),
  services: z.array(z.object({
    type: z.string(),
    frequency: z.string(),
    duration: z.string(),
    location: z.string(),
    provider: z.string()
  })),
  accommodations: z.array(z.object({
    category: z.string(),
    description: z.string(),
    settings: z.array(z.string())
  })),
  modifications: z.array(z.object({
    subject: z.string(),
    description: z.string()
  })),
  transitionPlan: z.object({
    postSecondaryGoals: z.array(z.string()),
    transitionServices: z.array(z.string()),
    agencyInvolvement: z.array(z.string())
  }).optional()
});

// =============================================================================
// AGENT CONFIGURATION & CONTEXT
// =============================================================================

export const AgentConfigSchema = z.object({
  agentType: z.nativeEnum(AgentType),
  studentId: z.string(),
  sessionId: z.string().optional(),
  retryAttempts: z.number().default(3),
  timeout: z.number().default(30000),
  enableStreaming: z.boolean().default(false),
  logLevel: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  maxConcurrentTasks: z.number().default(5),
  customSettings: z.record(z.any()).optional()
});

export const AgentContextSchema = z.object({
  student: StudentProfileSchema,
  iepData: IEPDataSchema.optional(),
  progressData: z.array(z.any()).optional(),
  currentSession: z.object({
    id: z.string(),
    startTime: z.date(),
    type: z.string(),
    metadata: z.record(z.any()).optional()
  }).optional(),
  historicalData: z.object({
    assessments: z.array(z.any()),
    interactions: z.array(z.any()),
    progress: z.array(z.any())
  }).optional()
});

// =============================================================================
// AGENT RESPONSES & RESULTS
// =============================================================================

export const BaseAgentResponseSchema = z.object({
  agentType: z.nativeEnum(AgentType),
  sessionId: z.string(),
  timestamp: z.date(),
  success: z.boolean(),
  processingTime: z.number(),
  confidence: z.number().min(0).max(1).optional(),
  metadata: z.record(z.any()).optional()
});

export const AssessmentReportSchema = z.object({
  studentId: z.string(),
  assessmentId: z.string(),
  completionDate: z.date(),
  overallScore: z.number().min(0).max(100),
  domainScores: z.record(z.number().min(0).max(100)),
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
  knowledgeGaps: z.array(z.object({
    domain: z.nativeEnum(AssessmentDomain),
    topic: z.string(),
    severity: z.enum(['low', 'medium', 'high']),
    recommendations: z.array(z.string())
  })),
  recommendations: z.array(z.object({
    category: z.string(),
    description: z.string(),
    priority: z.enum(['low', 'medium', 'high', 'critical']),
    timeline: z.string()
  })),
  accommodationsUsed: z.array(z.string()),
  nextSteps: z.array(z.string()),
  parentSummary: z.string(),
  teacherNotes: z.string()
});

export const PersonalModelUpdateSchema = z.object({
  studentId: z.string(),
  updateType: z.enum(['learning_style', 'pacing', 'content_preference', 'interaction_memory']),
  changes: z.record(z.any()),
  reasoning: z.string(),
  confidence: z.number().min(0).max(1),
  timestamp: z.date(),
  source: z.string() // assessment, interaction, observation, etc.
});

export const ProgressAlertSchema = z.object({
  studentId: z.string(),
  alertType: z.enum(['regression', 'plateau', 'breakthrough', 'goal_met', 'concern']),
  domain: z.nativeEnum(AssessmentDomain).optional(),
  severity: z.enum(['info', 'warning', 'critical']),
  message: z.string(),
  data: z.record(z.any()),
  recommendations: z.array(z.string()),
  recipients: z.array(z.string()), // teacher, parent, specialist IDs
  timestamp: z.date(),
  acknowledged: z.boolean().default(false)
});

// =============================================================================
// EXPORTED TYPES
// =============================================================================

export type AgentConfig = z.infer<typeof AgentConfigSchema>;
export type AgentContext = z.infer<typeof AgentContextSchema>;
export type StudentProfile = z.infer<typeof StudentProfileSchema>;
export type IEPData = z.infer<typeof IEPDataSchema>;
export type IEPGoal = z.infer<typeof IEPGoalSchema>;
export type AssessmentQuestion = z.infer<typeof AssessmentQuestionSchema>;
export type AssessmentResponse = z.infer<typeof AssessmentResponseSchema>;
export type AssessmentResult = z.infer<typeof AssessmentResultSchema>;
export type BaseAgentResponse = z.infer<typeof BaseAgentResponseSchema>;
export type AssessmentReport = z.infer<typeof AssessmentReportSchema>;
export type PersonalModelUpdate = z.infer<typeof PersonalModelUpdateSchema>;
export type ProgressAlert = z.infer<typeof ProgressAlertSchema>;

// =============================================================================
// AGENT INTERFACE DEFINITIONS
// =============================================================================

export interface AgentInterface {
  readonly agentType: AgentType;
  readonly config: AgentConfig;
  readonly context: AgentContext;
  
  // Core methods
  initialize(): Promise<void>;
  dispose(): Promise<void>;
  
  // Status management
  getStatus(): AgentStatus;
  getHealth(): Promise<{
    status: AgentStatus;
    uptime: number;
    tasksCompleted: number;
    tasksInProgress: number;
    lastError: string | null;
  }>;
  
  // Logging and monitoring
  log(level: 'debug' | 'info' | 'warn' | 'error', message: string, metadata?: any): void;
  getMetrics(): Promise<{
    totalTasks: number;
    successRate: number;
    averageProcessingTime: number;
    errorCount: number;
  }>;
}

export interface StreamingCapable {
  supportsStreaming(): boolean;
  enableStreaming(enabled: boolean): void;
}

// =============================================================================
// DOMAIN-SPECIFIC AGENT INTERFACES
// =============================================================================

export interface BaselineAssessmentAgentInterface extends AgentInterface {
  generateAdaptiveQuestions(
    domain: AssessmentDomain,
    currentLevel: DifficultyLevel,
    count: number
  ): Promise<AssessmentQuestion[]>;
  
  evaluateResponse(
    question: AssessmentQuestion,
    response: AssessmentResponse
  ): Promise<AssessmentResult>;
  
  adjustDifficulty(
    currentResults: AssessmentResult[],
    domain: AssessmentDomain
  ): Promise<DifficultyLevel>;
  
  generateReport(
    results: AssessmentResult[]
  ): Promise<AssessmentReport>;
}

export interface PersonalModelAgentInterface extends AgentInterface {
  cloneFromAssessment(assessmentReport: AssessmentReport): Promise<void>;
  adaptLearningStyle(newStyles: LearningStyle[]): Promise<PersonalModelUpdate>;
  adjustPacing(domain: AssessmentDomain, adjustment: number): Promise<PersonalModelUpdate>;
  personalizeContent(content: any, domain: AssessmentDomain): Promise<any>;
  recordInteraction(interaction: any): Promise<void>;
  generateSuggestions(audienceType: 'parent' | 'teacher'): Promise<string[]>;
}

export interface IEPAssistantAgentInterface extends AgentInterface {
  generateIEPTemplate(assessmentData: AssessmentReport): Promise<Partial<IEPData>>;
  generateGoals(domain: AssessmentDomain, currentLevel: string): Promise<IEPGoal[]>;
  checkCompliance(iepData: IEPData): Promise<{
    compliant: boolean;
    issues: string[];
    suggestions: string[];
  }>;
  generateProgressReport(goals: IEPGoal[]): Promise<string>;
  summarizeMeetingNotes(notes: string): Promise<string>;
  explainForParents(iepContent: string): Promise<string>;
}

export interface ProgressMonitorAgentInterface extends AgentInterface {
  trackProgress(domain: AssessmentDomain, data: any): Promise<void>;
  analyzeTrends(domain: AssessmentDomain, timeframe: number): Promise<ProgressTrend>;
  generateAlerts(): Promise<ProgressAlert[]>;
  generateReport(timeframe: number): Promise<string>;
  predictOutcomes(domain: AssessmentDomain, projectionDays: number): Promise<any>;
}

// =============================================================================
// PROGRESS MONITORING TYPES
// =============================================================================

export enum AlertLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high'
}

export interface ProgressTrend {
  id: string;
  domain: AssessmentDomain;
  direction: 'improving' | 'stable' | 'declining';
  confidence: number;
  magnitude: number;
  timeframe: number;
  dataPoints: number;
  insights: string[];
  predictions: string[];
}

