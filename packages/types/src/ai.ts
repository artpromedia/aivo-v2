import type { UUID, Timestamp, GradeLevel } from './common';
import type { Subject } from './assessment';
import type { UserRole } from './user';

// AI Model types and configurations
export enum AIModelType {
  LANGUAGE_MODEL = 'language_model',
  ASSESSMENT_GENERATOR = 'assessment_generator',
  PERSONALIZATION = 'personalization',
  CONTENT_RECOMMENDATION = 'content_recommendation',
  ACCESSIBILITY = 'accessibility',
  BEHAVIOR_ANALYSIS = 'behavior_analysis',
  EARLY_WARNING = 'early_warning',
  CURRICULUM_ALIGNMENT = 'curriculum_alignment',
}

export enum ModelProvider {
  OPENAI = 'openai',
  ANTHROPIC = 'anthropic',
  HUGGING_FACE = 'hugging_face',
  GOOGLE = 'google',
  CUSTOM = 'custom',
  FINE_TUNED = 'fine_tuned',
}

export enum ModelStatus {
  TRAINING = 'training',
  READY = 'ready',
  DEPLOYED = 'deployed',
  UPDATING = 'updating',
  DEPRECATED = 'deprecated',
  ERROR = 'error',
}

// Base AI Model interface
export interface AIModel {
  id: UUID;
  name: string;
  description: string;
  type: AIModelType;
  provider: ModelProvider;
  version: string;
  status: ModelStatus;
  capabilities: string[];
  supportedSubjects: Subject[];
  supportedGrades: GradeLevel[];
  maxTokens?: number;
  temperature?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  stopSequences?: string[];
  systemPrompt?: string;
  safetySettings: {
    contentFiltering: boolean;
    personalDataFiltering: boolean;
    biasDetection: boolean;
    harmfulContentBlocking: boolean;
  };
  metadata: Record<string, any>;
  createdBy: UUID;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  deployedAt?: Timestamp;
  lastUsedAt?: Timestamp;
}

// Personal AI Model for individual students
export interface PersonalAIModel {
  id: UUID;
  studentId: UUID;
  baseModelId: UUID;
  name: string;
  personalityTraits: {
    enthusiasm: number; // 1-10
    patience: number;   // 1-10
    formality: number;  // 1-10 (1=casual, 10=formal)
    humor: number;      // 1-10
    encouragement: number; // 1-10
  };
  learningPreferences: {
    visual: number;     // 1-10
    auditory: number;   // 1-10
    kinesthetic: number; // 1-10
    reading: number;    // 1-10
  };
  communicationStyle: {
    vocabulary: 'simple' | 'grade_level' | 'advanced';
    sentenceLength: 'short' | 'medium' | 'long';
    explanationDepth: 'brief' | 'detailed' | 'comprehensive';
    examples: 'few' | 'moderate' | 'many';
  };
  adaptations: {
    disabilityType?: string;
    accommodations: string[];
    alternativeFormats: string[];
    assistiveTechnology: string[];
  };
  performanceMetrics: {
    engagementScore: number;
    satisfactionRating: number;
    learningProgress: number;
    interactionCount: number;
    lastInteractionAt: Timestamp;
  };
  trainingData: {
    interactions: number;
    feedbackReceived: number;
    correctPredictions: number;
    totalPredictions: number;
    lastTrainingAt: Timestamp;
  };
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// AI Conversation and Interaction
export interface AIConversation {
  id: UUID;
  studentId: UUID;
  aiModelId: UUID;
  sessionId: UUID;
  context: {
    subject?: Subject;
    gradeLevel: GradeLevel;
    topic?: string;
    assessmentId?: UUID;
    lessonId?: UUID;
    currentActivity?: string;
  };
  messages: AIMessage[];
  metadata: {
    startedAt: Timestamp;
    lastMessageAt: Timestamp;
    totalMessages: number;
    avgResponseTime: number;
    sentimentScore: number;
    engagementLevel: number;
  };
  isActive: boolean;
  endedAt?: Timestamp;
  endReason?: 'user_ended' | 'timeout' | 'error' | 'system_ended';
}

export interface AIMessage {
  id: UUID;
  conversationId: UUID;
  role: 'user' | 'assistant' | 'system';
  content: string;
  metadata: {
    timestamp: Timestamp;
    responseTime?: number;
    tokenCount?: number;
    confidence?: number;
    sentiment?: number;
    flagged?: boolean;
    flagReason?: string;
  };
  attachments?: {
    type: 'image' | 'audio' | 'video' | 'document';
    url: string;
    description?: string;
  }[];
  feedback?: {
    helpful: boolean;
    rating: number; // 1-5
    comment?: string;
    providedAt: Timestamp;
  };
}

// AI-Generated Content
export interface AIGeneratedContent {
  id: UUID;
  type: 'question' | 'explanation' | 'example' | 'hint' | 'feedback' | 'lesson_plan' | 'worksheet';
  modelId: UUID;
  subject: Subject;
  gradeLevel: GradeLevel;
  topic: string;
  content: string;
  metadata: {
    prompt: string;
    generationTime: number;
    tokenCount: number;
    confidence: number;
    reviewStatus: 'pending' | 'approved' | 'rejected' | 'needs_revision';
    reviewedBy?: UUID;
    reviewedAt?: Timestamp;
    reviewComments?: string;
  };
  usage: {
    timesUsed: number;
    averageRating: number;
    lastUsedAt?: Timestamp;
  };
  alignment: {
    standardIds: UUID[];
    difficultyLevel: string;
    bloomsLevel: string;
  };
  createdBy: UUID;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// AI Analytics and Performance
export interface AIModelAnalytics {
  modelId: UUID;
  timeframe: {
    start: Timestamp;
    end: Timestamp;
  };
  usage: {
    totalInteractions: number;
    uniqueUsers: number;
    averageSessionDuration: number;
    totalTokensUsed: number;
    costEstimate: number;
  };
  performance: {
    averageResponseTime: number;
    errorRate: number;
    userSatisfactionRating: number;
    taskCompletionRate: number;
    accuracyScore: number;
  };
  engagement: {
    messagesPerSession: number;
    returnUserRate: number;
    sessionAbandonment: number;
    feedbackRate: number;
  };
  content: {
    questionsGenerated: number;
    explanationsProvided: number;
    hintsGiven: number;
    contentApprovalRate: number;
  };
  safety: {
    flaggedResponses: number;
    falsePositives: number;
    contentViolations: number;
    biasDetected: number;
  };
}

// AI Training and Fine-tuning
export interface AITrainingJob {
  id: UUID;
  modelId: UUID;
  type: 'initial_training' | 'fine_tuning' | 'reinforcement_learning' | 'continuous_learning';
  dataset: {
    id: UUID;
    name: string;
    size: number; // number of examples
    source: 'student_interactions' | 'curated_content' | 'assessment_data' | 'teacher_feedback';
    quality: number; // 1-10 score
  };
  hyperparameters: {
    learningRate: number;
    batchSize: number;
    epochs: number;
    temperature: number;
    dropout?: number;
    regularization?: number;
  };
  status: 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';
  progress: {
    currentEpoch?: number;
    totalEpochs: number;
    trainingLoss?: number;
    validationLoss?: number;
    accuracy?: number;
  };
  results?: {
    finalAccuracy: number;
    trainingTime: number;
    modelSize: number;
    performanceImprovement: number;
    validationMetrics: Record<string, number>;
  };
  startedAt?: Timestamp;
  completedAt?: Timestamp;
  failureReason?: string;
  createdBy: UUID;
  createdAt: Timestamp;
}

// AI Safety and Monitoring
export interface AISafetyLog {
  id: UUID;
  modelId: UUID;
  conversationId?: UUID;
  messageId?: UUID;
  studentId?: UUID;
  alertType: 'content_violation' | 'bias_detected' | 'inappropriate_response' | 'privacy_concern' | 'safety_risk';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  content: string; // The flagged content
  detectionMethod: 'automated' | 'human_review' | 'user_report';
  actionTaken: 'none' | 'content_blocked' | 'conversation_ended' | 'model_disabled' | 'human_escalation';
  reviewStatus: 'pending' | 'reviewed' | 'resolved' | 'false_positive';
  reviewedBy?: UUID;
  reviewedAt?: Timestamp;
  resolution?: string;
  createdAt: Timestamp;
}

// AI Configuration for different user roles
export interface AIRoleConfiguration {
  role: UserRole;
  allowedModels: AIModelType[];
  permissions: {
    canCreateModels: boolean;
    canTrainModels: boolean;
    canDeployModels: boolean;
    canViewAnalytics: boolean;
    canAccessSafetyLogs: boolean;
    canModifySettings: boolean;
  };
  restrictions: {
    maxTokensPerDay?: number;
    maxInteractionsPerDay?: number;
    allowedSubjects?: Subject[];
    allowedGrades?: GradeLevel[];
    contentFiltering: boolean;
    supervisorApprovalRequired: boolean;
  };
  defaultSettings: {
    temperature: number;
    maxTokens: number;
    safetyLevel: number;
    personalitySettings: Partial<PersonalAIModel['personalityTraits']>;
  };
}