// Focus monitoring types for the Focus Guardian Agent

export type InterventionStrategy = 
  | 'immediate-break' 
  | 'game-break' 
  | 'subject-switch' 
  | 'encouragement' 
  | 'end-session'
  | 'movement-break'
  | 'breathing-exercise'
  | 'stretch-guide';

export type DistractionTrigger =
  | 'mouse-idle'
  | 'typing-pause'
  | 'tab-switch'
  | 'window-blur'
  | 'response-slowdown'
  | 'erratic-scrolling'
  | 'frustration-pattern'
  | 'fatigue-detected';

export type FocusEventType =
  | 'session-start'
  | 'session-end'
  | 'window-focus'
  | 'window-blur'
  | 'distraction-detected'
  | 'frustration-detected'
  | 'fatigue-detected'
  | 'intervention-triggered'
  | 'intervention-completed'
  | 'focus-restored'
  | 'game-break-started'
  | 'game-break-ended';

export interface FocusEvent {
  id: string;
  type: FocusEventType;
  timestamp: Date;
  sessionId?: string;
  severity?: 'low' | 'medium' | 'high';
  trigger?: DistractionTrigger;
  data?: {
    focusScore?: number;
    distractionLevel?: 'low' | 'medium' | 'high';
    mousePosition?: { x: number; y: number };
    responseTime?: number;
    tabSwitchCount?: number;
    [key: string]: any;
  };
  metadata?: {
    userAgent?: string;
    screenResolution?: { width: number; height: number };
    timestamp?: number;
    [key: string]: any;
  };
}

export interface FocusMetrics {
  totalFocusTime: number; // seconds
  averageFocusScore: number; // 0-100
  distractionCount: number;
  interventionCount: number;
  gameBreakCount: number;
  subjectSwitchCount: number;
  optimalLearningTimePercentage: number; // 0-100
  fatigueOnsetTime: Date | null;
}

export interface Intervention {
  id: string;
  type: InterventionStrategy;
  reason: string;
  timestamp: Date;
  duration?: number; // milliseconds
  effectiveness?: number | null; // 0-100, measured post-intervention
  gameId?: string; // if intervention was a game
  data?: {
    preInterventionFocusScore?: number;
    postInterventionFocusScore?: number;
    userResponse?: 'accepted' | 'dismissed' | 'delayed';
    completionRate?: number; // for games/exercises
    [key: string]: any;
  };
}

export interface FocusSession {
  id: string;
  learnerId: string;
  subject: string;
  startTime: Date;
  endTime: Date | null;
  status: 'active' | 'paused' | 'completed' | 'interrupted';
  focusEvents: FocusEvent[];
  interventions: Intervention[];
  metrics: FocusMetrics;
  context?: {
    lessonId?: string;
    activityType?: string;
    difficulty?: 'easy' | 'medium' | 'hard';
    expectedDuration?: number; // minutes
    [key: string]: any;
  };
}

export interface AttentionBaseline {
  learnerId: string;
  ageGroup: 'k5' | 'middle' | 'high';
  averageAttentionSpan: number; // minutes
  optimalLearningHours: number[];
  responseTimeBaseline: number; // milliseconds
  distractionThresholds: {
    mouseIdleTime: number;
    tabSwitchFrequency: number;
    responseTimeVariation: number;
  };
  personalFactors: {
    hasADHD: boolean;
    medicationSchedule?: string[];
    environmentalPreferences?: {
      backgroundNoise: boolean;
      visualDistractions: boolean;
    };
  };
  calibrationDate: Date;
  lastUpdated: Date;
}

export interface FocusAnalytics {
  daily: {
    date: Date;
    totalFocusTime: number;
    averageFocusScore: number;
    sessionCount: number;
    interventionCount: number;
    optimalTimeUtilization: number; // percentage
    subjectBreakdown: {
      subject: string;
      focusTime: number;
      averageScore: number;
    }[];
  }[];
  weekly: {
    weekStart: Date;
    weekEnd: Date;
    totalFocusTime: number;
    averageFocusScore: number;
    improvementTrend: 'improving' | 'stable' | 'declining';
    bestLearningTimes: number[]; // hours of day
    worstLearningTimes: number[];
    recommendedSchedule: {
      subject: string;
      recommendedHours: number[];
      estimatedFocusScore: number;
    }[];
  };
  monthly: {
    monthStart: Date;
    monthEnd: Date;
    focusImprovementPercentage: number;
    consistencyScore: number; // 0-100
    optimalScheduleAdherence: number; // percentage
    interventionEffectiveness: {
      type: InterventionStrategy;
      averageEffectiveness: number;
      usageCount: number;
    }[];
  };
}

export interface GameBreakSession {
  id: string;
  sessionId: string; // parent focus session
  gameType: string;
  startTime: Date;
  endTime: Date | null;
  expectedDuration: number; // seconds
  actualDuration: number; // seconds
  completed: boolean;
  score?: number;
  focusRestorationScore: number; // how much focus improved after game
  gameData?: {
    level?: number;
    attempts?: number;
    correctAnswers?: number;
    totalQuestions?: number;
    [key: string]: any;
  };
}

export interface FocusReport {
  learnerId: string;
  reportType: 'daily' | 'weekly' | 'monthly' | 'iep';
  dateRange: {
    start: Date;
    end: Date;
  };
  summary: {
    totalFocusTime: number;
    averageFocusScore: number;
    sessionCount: number;
    improvementRate: number; // percentage change
  };
  patterns: {
    bestLearningTimes: number[];
    worstLearningTimes: number[];
    subjectPerformance: {
      subject: string;
      focusScore: number;
      engagementLevel: 'high' | 'medium' | 'low';
      recommendedAdjustments: string[];
    }[];
  };
  interventions: {
    mostEffective: InterventionStrategy[];
    leastEffective: InterventionStrategy[];
    recommendedFrequency: number; // per hour
  };
  recommendations: {
    scheduleAdjustments: string[];
    environmentalChanges: string[];
    interventionStrategy: string[];
    parentActions: string[];
  };
  iepAlignment?: {
    attentionGoals: {
      goal: string;
      currentProgress: number; // percentage
      targetDate: Date;
      onTrack: boolean;
    }[];
    accommodationEffectiveness: {
      accommodation: string;
      effectiveness: number; // 0-100
      usage: number; // how often used
    }[];
  };
}

// Monitoring hook types for React integration
export interface FocusMonitoringHookOptions {
  enabled: boolean;
  sessionId?: string;
  trackMouse?: boolean;
  trackKeyboard?: boolean;
  trackScrolling?: boolean;
  trackWindowFocus?: boolean;
  trackWebcam?: boolean;
  analysisInterval?: number; // milliseconds
  consentFlags: {
    webcamMonitoring: boolean;
    keystrokeAnalysis: boolean;
    tabSwitchTracking: boolean;
  };
}

export interface FocusMonitoringHookReturn {
  isMonitoring: boolean;
  currentFocusScore: number | null;
  currentSession: FocusSession | null;
  startMonitoring: (options?: Partial<FocusMonitoringHookOptions>) => Promise<void>;
  stopMonitoring: () => Promise<void>;
  recordEvent: (event: Omit<FocusEvent, 'id' | 'timestamp'>) => void;
  getCurrentAnalysis: () => Promise<AttentionPattern | null>;
  triggerBreak: (type?: InterventionStrategy) => Promise<void>;
}

// Attention pattern (moved from main file to avoid circular dependency)
export interface AttentionPattern {
  focusScore: number; // 0-100
  distractionLevel: 'low' | 'medium' | 'high';
  fatigueIndicators: string[];
  optimalLearningWindow: boolean;
  recommendedAction: 'continue' | 'break' | 'switch-subject' | 'end-session';
  confidence: number; // 0-100, how confident the AI is in this assessment
  timestamp: Date;
}