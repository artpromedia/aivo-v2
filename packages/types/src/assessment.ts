import type { UUID, Timestamp, GradeLevel } from './common';
import type { UserRole } from './user';

// Assessment types and difficulty levels
export enum AssessmentType {
  DIAGNOSTIC = 'diagnostic',
  FORMATIVE = 'formative',
  SUMMATIVE = 'summative',
  BENCHMARK = 'benchmark',
  SCREENING = 'screening',
  PROGRESS_MONITORING = 'progress_monitoring',
  ADAPTIVE = 'adaptive',
}

export enum DifficultyLevel {
  BEGINNER = 'beginner',
  ELEMENTARY = 'elementary',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  EXPERT = 'expert',
}

export enum QuestionType {
  MULTIPLE_CHOICE = 'multiple_choice',
  TRUE_FALSE = 'true_false',
  SHORT_ANSWER = 'short_answer',
  LONG_ANSWER = 'long_answer',
  FILL_IN_BLANK = 'fill_in_blank',
  MATCHING = 'matching',
  ORDERING = 'ordering',
  DRAG_AND_DROP = 'drag_and_drop',
  DRAWING = 'drawing',
  AUDIO_RESPONSE = 'audio_response',
  VIDEO_RESPONSE = 'video_response',
}

// Subject areas aligned with curriculum standards
export enum Subject {
  MATHEMATICS = 'mathematics',
  ENGLISH_LANGUAGE_ARTS = 'english_language_arts',
  SCIENCE = 'science',
  SOCIAL_STUDIES = 'social_studies',
  READING = 'reading',
  WRITING = 'writing',
  PHONICS = 'phonics',
  SPELLING = 'spelling',
  VOCABULARY = 'vocabulary',
  GRAMMAR = 'grammar',
  ALGEBRA = 'algebra',
  GEOMETRY = 'geometry',
  STATISTICS = 'statistics',
  BIOLOGY = 'biology',
  CHEMISTRY = 'chemistry',
  PHYSICS = 'physics',
  EARTH_SCIENCE = 'earth_science',
  HISTORY = 'history',
  GEOGRAPHY = 'geography',
  CIVICS = 'civics',
  ECONOMICS = 'economics',
  ART = 'art',
  MUSIC = 'music',
  PHYSICAL_EDUCATION = 'physical_education',
  HEALTH = 'health',
  COMPUTER_SCIENCE = 'computer_science',
  FOREIGN_LANGUAGE = 'foreign_language',
}

// Learning objectives and standards
export interface LearningStandard {
  id: string;
  code: string; // e.g., "CCSS.MATH.1.NBT.A.1"
  title: string;
  description: string;
  subject: Subject;
  gradeLevel: GradeLevel;
  domain?: string;
  cluster?: string;
  standardType: 'common_core' | 'state' | 'district' | 'custom';
  region: string;
  masteryLevel: number; // 1-4 scale
}

// Question and assessment structures
export interface AssessmentQuestion {
  id: UUID;
  type: QuestionType;
  subject: Subject;
  gradeLevel: GradeLevel;
  difficultyLevel: DifficultyLevel;
  standardIds: string[];
  questionText: string;
  questionMedia?: {
    type: 'image' | 'audio' | 'video';
    url: string;
    altText?: string;
  };
  options?: {
    id: string;
    text: string;
    isCorrect: boolean;
    explanation?: string;
  }[];
  correctAnswer?: string | string[];
  rubric?: {
    criteria: string;
    levels: {
      score: number;
      description: string;
    }[];
  };
  points: number;
  timeLimit?: number; // seconds
  accommodations?: {
    extraTime?: number;
    readAloud?: boolean;
    largeText?: boolean;
    highlighter?: boolean;
    calculator?: boolean;
    reference?: boolean;
  };
  aiGenerated: boolean;
  createdBy: UUID;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Assessment definition
export interface Assessment {
  id: UUID;
  title: string;
  description?: string;
  type: AssessmentType;
  subject: Subject;
  gradeLevel: GradeLevel;
  questions: AssessmentQuestion[];
  totalPoints: number;
  timeLimit?: number; // minutes
  attemptsAllowed: number;
  showFeedback: boolean;
  showCorrectAnswers: boolean;
  randomizeQuestions: boolean;
  randomizeOptions: boolean;
  isAdaptive: boolean;
  passingScore?: number;
  schoolId: UUID;
  districtId?: UUID;
  createdBy: UUID;
  assignedTo: UUID[]; // Student IDs or classroom IDs
  dueDate?: Timestamp;
  availableFrom: Timestamp;
  availableUntil?: Timestamp;
  status: 'draft' | 'published' | 'archived';
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Student assessment attempt
export interface AssessmentAttempt {
  id: UUID;
  assessmentId: UUID;
  studentId: UUID;
  attemptNumber: number;
  startedAt: Timestamp;
  submittedAt?: Timestamp;
  timeSpent: number; // seconds
  responses: {
    questionId: UUID;
    answer: string | string[];
    timeSpent: number;
    isCorrect?: boolean;
    pointsEarned?: number;
    feedback?: string;
  }[];
  score?: number;
  percentage?: number;
  passed?: boolean;
  feedback?: string;
  gradedBy?: UUID;
  gradedAt?: Timestamp;
  flaggedForReview: boolean;
  accommodationsUsed?: string[];
  aiInsights?: {
    strengthAreas: Subject[];
    improvementAreas: Subject[];
    recommendedResources: string[];
    difficultyAdjustment?: DifficultyLevel;
  };
}

// Assessment analytics and reporting
export interface AssessmentAnalytics {
  assessmentId: UUID;
  totalAttempts: number;
  completionRate: number;
  averageScore: number;
  averageTimeSpent: number;
  questionAnalytics: {
    questionId: UUID;
    correctRate: number;
    averageTimeSpent: number;
    difficultyRating: number;
    discriminationIndex: number;
  }[];
  studentPerformance: {
    studentId: UUID;
    attempts: number;
    bestScore: number;
    averageScore: number;
    timeSpent: number;
    masteredStandards: string[];
    strugglingStandards: string[];
  }[];
  standardsMastery: {
    standardId: string;
    masteryRate: number;
    averageScore: number;
  }[];
  generatedAt: Timestamp;
}

// Real-time assessment data
export interface AssessmentSession {
  id: UUID;
  assessmentId: UUID;
  studentId: UUID;
  attemptId: UUID;
  currentQuestionIndex: number;
  timeRemaining?: number;
  responses: Record<string, any>;
  isActive: boolean;
  pausedAt?: Timestamp;
  resumedAt?: Timestamp;
  lastActivityAt: Timestamp;
}

// Assessment creation and management
export interface CreateAssessmentInput {
  title: string;
  description?: string;
  type: AssessmentType;
  subject: Subject;
  gradeLevel: GradeLevel;
  questionIds: UUID[];
  timeLimit?: number;
  attemptsAllowed?: number;
  showFeedback?: boolean;
  showCorrectAnswers?: boolean;
  randomizeQuestions?: boolean;
  randomizeOptions?: boolean;
  isAdaptive?: boolean;
  passingScore?: number;
  dueDate?: Timestamp;
  availableFrom?: Timestamp;
  availableUntil?: Timestamp;
}

export interface AssessmentFilters {
  type?: AssessmentType[];
  subject?: Subject[];
  gradeLevel?: GradeLevel[];
  difficultyLevel?: DifficultyLevel[];
  standardIds?: string[];
  createdBy?: UUID;
  schoolId?: UUID;
  districtId?: UUID;
  dateRange?: {
    from: Timestamp;
    to: Timestamp;
  };
}