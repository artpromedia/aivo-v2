/**
 * Virtual Brain Types for Teacher Dashboard
 * Comprehensive type definitions for Virtual Brain integration
 */

export interface VirtualBrain {
  id: string;
  studentId: string;
  createdAt: string;
  lastUpdated: string;
  status: 'active' | 'idle' | 'processing' | 'offline';
  learningProfile: LearningProfile;
  currentState: BrainState;
  metrics: BrainMetrics;
  suggestions: BrainSuggestion[];
}

export interface LearningProfile {
  learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'reading-writing';
  optimalTimes: TimeSlot[];
  strengthAreas: string[];
  challengeAreas: string[];
  pacePreference: 'fast' | 'moderate' | 'slow';
  focusPatterns: FocusPattern[];
}

export interface TimeSlot {
  start: string; // HH:mm format
  end: string;
  effectiveness: number; // 0-100
}

export interface FocusPattern {
  dayOfWeek: number; // 0-6
  timeOfDay: 'morning' | 'afternoon' | 'evening';
  averageFocus: number; // 0-100
  samples: number;
}

export interface BrainState {
  currentActivity: string;
  currentSubject: string;
  focusLevel: number; // 0-100
  lastAdaptation: string;
  documentsProcessed: number;
  adaptationsMade: number;
  interventionsTriggered: number;
}

export interface BrainMetrics {
  totalLearningTime: number; // minutes
  averageFocus: number; // 0-100
  successRate: number; // 0-100
  adaptationAcceptanceRate: number; // 0-100
  progressVelocity: number; // units/day
  engagementScore: number; // 0-100
}

export interface BrainSuggestion {
  id: string;
  brainId: string;
  type: 'difficulty' | 'pacing' | 'content' | 'intervention' | 'break';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  suggestion: string;
  reasoning: string;
  proposedChange: ProposedChange;
  createdAt: string;
  status: 'pending' | 'accepted' | 'modified' | 'rejected';
  teacherNote?: string;
}

export interface ProposedChange {
  type: string;
  before: unknown;
  after: unknown;
  expectedImpact: string;
}

export interface Student {
  id: string;
  name: string;
  photo?: string;
  gradeLevel: string;
  hasIEP: boolean;
  virtualBrain?: VirtualBrain;
  parentConsent: boolean;
  lastActive: string;
}

export interface ClassroomInsights {
  totalBrainsActive: number;
  averageFocus: number;
  brainsNeedingIntervention: number;
  documentsBeingProcessed: number;
  nextIEPReview?: string;
  trends: InsightTrend[];
}

export interface InsightTrend {
  metric: string;
  direction: 'up' | 'down' | 'stable';
  change: number;
  period: string;
}

export interface IEPGoal {
  id: string;
  studentId: string;
  goal: string;
  category: string;
  targetDate: string;
  currentProgress: number; // 0-100
  brainMetrics: string[]; // Mapped brain metric IDs
  accommodations: string[];
  status: 'active' | 'completed' | 'modified';
}

export interface DocumentDistribution {
  id: string;
  fileName: string;
  uploadedAt: string;
  uploadedBy: string;
  status: 'uploading' | 'processing' | 'distributed' | 'failed';
  studentsTargeted: string[];
  processingStatus: ProcessingStatus[];
  differentiations: Differentiation[];
}

export interface ProcessingStatus {
  studentId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  brainInterpretation?: string;
  suggestedModifications?: string[];
}

export interface Differentiation {
  studentId: string;
  modifications: string[];
  reasoning: string;
  appliedAutomatically: boolean;
}

export interface LiveLearningEvent {
  type: 'help_request' | 'focus_drop' | 'game_break' | 'parent_viewing' | 'brain_update';
  studentId: string;
  timestamp: string;
  data: unknown;
  priority: 'low' | 'medium' | 'high';
}

export interface ParentMessage {
  id: string;
  studentId: string;
  parentId: string;
  subject: string;
  body: string;
  includesBrainInsight: boolean;
  sentAt: string;
  read: boolean;
}

export interface Report {
  id: string;
  type: 'weekly_brain' | 'iep_progress' | 'parent_conference' | 'compliance';
  studentId?: string;
  generatedAt: string;
  data: unknown;
  format: 'pdf' | 'html' | 'json';
}
