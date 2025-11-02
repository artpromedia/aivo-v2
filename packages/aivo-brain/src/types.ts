import { z } from 'zod';

/**
 * Core AI provider types and interfaces for the Aivo Brain system
 */

// =============================================================================
// ENUMS & CONSTANTS
// =============================================================================

export enum AIProvider {
  OPENAI = 'openai',
  ANTHROPIC = 'anthropic',
  GOOGLE = 'google',
  META = 'meta',
  XAI = 'xai',
  ALIBABA = 'alibaba'
}

export enum TaskType {
  QUESTION_GENERATION = 'question_generation',
  CONTENT_ADAPTATION = 'content_adaptation',
  CONTENT_SIMPLIFICATION = 'content_simplification',
  CURRICULUM_RETRIEVAL = 'curriculum_retrieval',
  ASSESSMENT_GRADING = 'assessment_grading',
  PERSONALIZED_TUTORING = 'personalized_tutoring',
  TRANSLATION = 'translation',
  SUMMARIZATION = 'summarization',
  EXPLANATION = 'explanation',
  MATH_SOLVING = 'math_solving',
  CODE_REVIEW = 'code_review'
}

export enum ProviderStatus {
  HEALTHY = 'healthy',
  DEGRADED = 'degraded',
  UNHEALTHY = 'unhealthy',
  DISABLED = 'disabled'
}

export enum Priority {
  LOW = 1,
  NORMAL = 2,
  HIGH = 3,
  URGENT = 4
}

// =============================================================================
// REQUEST & RESPONSE SCHEMAS
// =============================================================================

export const AIRequestSchema = z.object({
  id: z.string().uuid(),
  taskType: z.nativeEnum(TaskType),
  prompt: z.string().min(1),
  context: z.record(z.string(), z.any()).optional(),
  options: z.object({
    maxTokens: z.number().positive().optional(),
    temperature: z.number().min(0).max(2).optional(),
    topP: z.number().min(0).max(1).optional(),
    stopSequences: z.array(z.string()).optional(),
    model: z.string().optional(),
    stream: z.boolean().optional().default(false),
    timeout: z.number().positive().optional(),
    retries: z.number().nonnegative().optional().default(3)
  }).optional(),
  metadata: z.object({
    userId: z.string().optional(),
    sessionId: z.string().optional(),
    gradeLevel: z.string().optional(),
    subject: z.string().optional(),
    language: z.string().optional().default('en'),
    priority: z.nativeEnum(Priority).optional().default(Priority.NORMAL)
  }).optional()
});

export const AIResponseSchema = z.object({
  id: z.string().uuid(),
  requestId: z.string().uuid(),
  provider: z.nativeEnum(AIProvider),
  model: z.string(),
  content: z.string(),
  usage: z.object({
    promptTokens: z.number().nonnegative(),
    completionTokens: z.number().nonnegative(),
    totalTokens: z.number().nonnegative(),
    cost: z.number().nonnegative().optional()
  }),
  metadata: z.object({
    latency: z.number().nonnegative(),
    timestamp: z.date(),
    finishReason: z.string().optional(),
    cached: z.boolean().optional().default(false)
  }),
  error: z.string().optional()
});

export type AIRequest = z.infer<typeof AIRequestSchema>;
export type AIResponse = z.infer<typeof AIResponseSchema>;

// =============================================================================
// PROVIDER CONFIGURATION
// =============================================================================

export const ProviderConfigSchema = z.object({
  provider: z.nativeEnum(AIProvider),
  enabled: z.boolean().default(true),
  apiKey: z.string().min(1),
  baseUrl: z.string().url().optional(),
  defaultModel: z.string(),
  availableModels: z.array(z.string()),
  rateLimit: z.object({
    requestsPerMinute: z.number().positive(),
    tokensPerMinute: z.number().positive().optional(),
    concurrent: z.number().positive().default(10)
  }),
  costs: z.record(z.string(), z.object({
    inputTokens: z.number().nonnegative(),
    outputTokens: z.number().nonnegative()
  })),
  capabilities: z.array(z.nativeEnum(TaskType)),
  priority: z.number().min(0).max(100).default(50),
  timeout: z.number().positive().default(30000),
  retries: z.number().nonnegative().default(3),
  healthCheck: z.object({
    enabled: z.boolean().default(true),
    interval: z.number().positive().default(60000),
    timeout: z.number().positive().default(5000)
  }).optional()
});

export type ProviderConfig = z.infer<typeof ProviderConfigSchema>;

// =============================================================================
// PROVIDER HEALTH & STATUS
// =============================================================================

export interface ProviderHealth {
  provider: AIProvider;
  status: ProviderStatus;
  lastCheck: Date;
  latency: number;
  errorRate: number;
  availability: number;
  metrics: {
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    averageLatency: number;
    tokensProcessed: number;
    totalCost: number;
  };
  error?: string;
}

// =============================================================================
// PROVIDER INTERFACE
// =============================================================================

export interface AIProviderInterface {
  readonly provider: AIProvider;
  readonly config: ProviderConfig;
  
  // Core methods
  initialize(): Promise<void>;
  dispose(): Promise<void>;
  
  // Request handling
  generateCompletion(request: AIRequest): Promise<AIResponse>;
  generateStream(request: AIRequest): AsyncGenerator<Partial<AIResponse>, AIResponse>;
  
  // Health & monitoring
  healthCheck(): Promise<ProviderHealth>;
  getUsage(): Promise<ProviderHealth['metrics']>;
  
  // Capabilities
  supportsTask(taskType: TaskType): boolean;
  getAvailableModels(): string[];
  estimateCost(request: AIRequest): number;
}

// =============================================================================
// ROUTING & LOAD BALANCING
// =============================================================================

export interface RoutingStrategy {
  name: string;
  selectProvider(
    providers: AIProviderInterface[],
    request: AIRequest
  ): AIProviderInterface | null;
}

export interface LoadBalancingConfig {
  strategy: 'round_robin' | 'least_connections' | 'weighted' | 'cost_optimized' | 'performance_based';
  weights?: Record<AIProvider, number>;
  failoverChain?: AIProvider[];
  maxConcurrentPerProvider?: number;
}

// =============================================================================
// EDUCATIONAL CONTEXT
// =============================================================================

export const EducationalContextSchema = z.object({
  gradeLevel: z.string(),
  subject: z.string(),
  difficultyLevel: z.enum(['beginner', 'intermediate', 'advanced']),
  learningObjectives: z.array(z.string()),
  prerequisites: z.array(z.string()).optional(),
  accommodations: z.array(z.string()).optional(),
  language: z.string().default('en'),
  culturalContext: z.string().optional()
});

export type EducationalContext = z.infer<typeof EducationalContextSchema>;

// =============================================================================
// CURRICULUM & KNOWLEDGE BASE
// =============================================================================

export interface CurriculumNode {
  id: string;
  title: string;
  description: string;
  subject: string;
  gradeLevel: string;
  standards: string[];
  prerequisites: string[];
  learningObjectives: string[];
  content: string;
  examples: string[];
  assessmentCriteria: string[];
  metadata: Record<string, any>;
}

export interface KnowledgeRetrievalRequest {
  query: string;
  context: EducationalContext;
  maxResults?: number;
  similarityThreshold?: number;
  includeExamples?: boolean;
}

export interface KnowledgeRetrievalResponse {
  nodes: CurriculumNode[];
  totalFound: number;
  searchMetadata: {
    query: string;
    executionTime: number;
    similarityScores: number[];
  };
}

// =============================================================================
// QUESTION GENERATION
// =============================================================================

export enum QuestionType {
  MULTIPLE_CHOICE = 'multiple_choice',
  TRUE_FALSE = 'true_false',
  SHORT_ANSWER = 'short_answer',
  ESSAY = 'essay',
  FILL_IN_BLANK = 'fill_in_blank',
  MATCHING = 'matching',
  ORDERING = 'ordering',
  MATH_PROBLEM = 'math_problem'
}

export interface QuestionGenerationRequest {
  content: string;
  context: EducationalContext;
  questionType: QuestionType;
  count: number;
  difficulty: 'easy' | 'medium' | 'hard';
  options?: {
    includeExplanations?: boolean;
    adaptiveLevel?: boolean;
    distractorQuality?: 'low' | 'medium' | 'high';
  };
}

export interface GeneratedQuestion {
  id: string;
  type: QuestionType;
  question: string;
  options?: string[];
  correctAnswer: string | string[];
  explanation?: string;
  difficulty: string;
  bloomsLevel: string;
  estimatedTime: number;
  metadata: {
    topics: string[];
    standards: string[];
    cognitiveLoad: number;
  };
}

// =============================================================================
// CONTENT ADAPTATION
// =============================================================================

export interface ContentAdaptationRequest {
  originalContent: string;
  targetAudience: {
    gradeLevel: string;
    learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'reading' | 'mixed';
    accommodations: string[];
  };
  adaptationType: 'grade_level' | 'learning_style' | 'accessibility' | 'language_support' | 'simplify' | 'elaborate' | 'translate' | 'reformat';
  context: EducationalContext;
  options?: {
    preserveKeyLearningObjectives?: boolean;
    adjustComplexity?: boolean;
    includeVisualAids?: boolean;
    includeAudioSuggestions?: boolean;
    includeHandsOnActivities?: boolean;
    simplifyLanguage?: boolean;
    addStructuralElements?: boolean;
    includeGlossary?: boolean;
    addCulturalContext?: boolean;
    preserveKeyTerms?: string[];
    maxLength?: number;
    includeExamples?: boolean;
    visualDescriptions?: boolean;
  };
}

export interface AdaptedContent {
  id: string;
  originalContent: string;
  adaptedContent: string;
  adaptationType: string;
  targetAudience: {
    gradeLevel: string;
    learningStyle: string;
    accommodations: string[];
  };
  changes: Array<{
    type: 'vocabulary' | 'structure' | 'examples' | 'formatting' | 'other';
    description: string;
    impact: string;
  }>;
  learningObjectives: string[];
  visualAidSuggestions: string[];
  glossary: Record<string, string>;
  additionalResources: string[];
  metadata: {
    readabilityLevel: string;
    estimatedReadingTime: string;
    cognitiveLoad: number;
    adaptationScore: number;
  };
  createdAt: Date;
  version: string;
}

// =============================================================================
// ERROR HANDLING
// =============================================================================

export enum AIErrorType {
  PROVIDER_UNAVAILABLE = 'provider_unavailable',
  RATE_LIMIT_EXCEEDED = 'rate_limit_exceeded',
  INVALID_REQUEST = 'invalid_request',
  AUTHENTICATION_FAILED = 'authentication_failed',
  MODEL_NOT_FOUND = 'model_not_found',
  CONTENT_FILTERED = 'content_filtered',
  TIMEOUT = 'timeout',
  UNKNOWN = 'unknown'
}

export class AIError extends Error {
  constructor(
    public type: AIErrorType,
    public provider: AIProvider,
    message: string,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = 'AIError';
  }
}

// =============================================================================
// MONITORING & ANALYTICS
// =============================================================================

export interface RequestMetrics {
  requestId: string;
  provider: AIProvider;
  model: string;
  taskType: TaskType;
  startTime: Date;
  endTime: Date;
  latency: number;
  tokenUsage: {
    prompt: number;
    completion: number;
    total: number;
  };
  cost: number;
  success: boolean;
  errorType?: AIErrorType;
  retryCount: number;
  userId?: string;
  sessionId?: string;
}

export interface ProviderAnalytics {
  provider: AIProvider;
  timeWindow: {
    start: Date;
    end: Date;
  };
  metrics: {
    totalRequests: number;
    successRate: number;
    averageLatency: number;
    totalTokens: number;
    totalCost: number;
    errorBreakdown: Record<AIErrorType, number>;
    taskTypeBreakdown: Record<TaskType, number>;
    modelUsage: Record<string, number>;
  };
}

// =============================================================================
// CACHING
// =============================================================================

export interface CacheConfig {
  enabled: boolean;
  ttl: number; // Time to live in seconds
  maxSize: number; // Maximum cache entries
  keyStrategy: 'content_hash' | 'structured' | 'custom';
  storage: 'memory' | 'redis' | 'hybrid';
}

export interface CacheEntry {
  key: string;
  response: AIResponse;
  timestamp: Date;
  hits: number;
  lastAccessed: Date;
}

// =============================================================================
// EXPORT EVERYTHING
// =============================================================================

export * from './providers';
export * from './capabilities';