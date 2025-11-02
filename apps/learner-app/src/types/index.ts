export type AgeGroup = 'k5' | 'middle' | 'high';

export type ThemeConfig = {
  id: AgeGroup;
  name: string;
  description: string;
  ageRange: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    muted: string;
  };
  typography: {
    fontFamily: string;
    baseSize: string;
    headingSize: string;
    buttonSize: string;
  };
  spacing: {
    touchTarget: string;
    padding: string;
    margin: string;
  };
  borderRadius: string;
  shadow: string;
  animations: boolean;
};

export interface AccessibilitySettings {
  fontSize: 'small' | 'medium' | 'large' | 'extra-large';
  highContrast: boolean;
  reducedMotion: boolean;
  screenReader: boolean;
  keyboardNavigation: boolean;
  focusVisible: boolean;
  colorBlindnessSupport: 'none' | 'deuteranopia' | 'protanopia' | 'tritanopia';
}

export interface User {
  id: string;
  name: string;
  ageGroup: AgeGroup;
  gradeLevel: number;
  avatar?: string;
  preferences: {
    theme: AgeGroup;
    accessibility: AccessibilitySettings;
    language: string;
    notifications: boolean;
  };
  progress: {
    totalPoints: number;
    level: number;
    badges: Badge[];
    completedLessons: string[];
    currentStreak: number;
  };
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedAt: Date;
  category: string;
}

export type Lesson = {
  id: string;
  title: string;
  subject: string;
  gradeLevel: number;
  difficulty: 'easy' | 'medium' | 'hard';
  duration: number; // in minutes
  type: 'video' | 'interactive' | 'reading' | 'assessment';
  content: LessonContent;
  prerequisites: string[];
  objectives: string[];
  tags: string[];
  adaptiveElements: AdaptiveElement[];
};

export type LessonContent = {
  introduction: string;
  modules: LessonModule[];
  summary: string;
  resources: Resource[];
};

export type LessonModule = {
  id: string;
  title: string;
  type: 'text' | 'video' | 'audio' | 'interactive' | 'quiz';
  content: string | VideoContent | AudioContent | InteractiveContent;
  duration: number;
  required: boolean;
};

export type VideoContent = {
  url: string;
  subtitles?: string;
  transcript?: string;
  chapters?: VideoChapter[];
};

export type AudioContent = {
  url: string;
  transcript?: string;
  chapters?: AudioChapter[];
};

export type InteractiveContent = {
  type: 'drag-drop' | 'multiple-choice' | 'fill-blank' | 'matching' | 'drawing';
  instructions: string;
  elements: InteractiveElement[];
  feedback: FeedbackRule[];
};

export type VideoChapter = {
  title: string;
  startTime: number;
  endTime: number;
};

export type AudioChapter = {
  title: string;
  startTime: number;
  endTime: number;
};

export type InteractiveElement = {
  id: string;
  type: string;
  properties: Record<string, any>;
  position?: { x: number; y: number };
};

export type FeedbackRule = {
  condition: string;
  message: string;
  type: 'success' | 'error' | 'hint';
};

export type AdaptiveElement = {
  id: string;
  type: 'difficulty-adjustment' | 'pacing' | 'content-variation' | 'support';
  triggers: string[];
  adaptations: Adaptation[];
};

export type Adaptation = {
  type: 'content' | 'presentation' | 'interaction' | 'support';
  changes: Record<string, any>;
};

export type Assessment = {
  id: string;
  title: string;
  type: 'formative' | 'summative' | 'diagnostic';
  subject: string;
  gradeLevel: number;
  questions: Question[];
  timeLimit?: number;
  attempts: number;
  adaptiveScoring: boolean;
};

export type Question = {
  id: string;
  type: 'multiple-choice' | 'true-false' | 'short-answer' | 'essay' | 'drag-drop' | 'drawing';
  question: string;
  options?: string[];
  correctAnswers: string[];
  explanation: string;
  difficulty: number;
  points: number;
  tags: string[];
  adaptiveHints: string[];
};

export type Progress = {
  lessonId: string;
  userId: string;
  status: 'not-started' | 'in-progress' | 'completed' | 'mastered';
  progress: number; // 0-100
  timeSpent: number; // in minutes
  attempts: number;
  score?: number;
  lastAccessed: Date;
  adaptiveData: Record<string, any>;
};

export type Resource = {
  id: string;
  title: string;
  type: 'pdf' | 'link' | 'video' | 'audio' | 'interactive';
  url: string;
  description?: string;
  downloadable: boolean;
};

export type Notification = {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
};

export type OfflineData = {
  lessons: Lesson[];
  progress: Progress[];
  user: User;
  lastSync: Date;
  pendingActions: OfflineAction[];
};

export type OfflineAction = {
  id: string;
  type: 'progress-update' | 'assessment-submit' | 'lesson-complete';
  data: Record<string, any>;
  timestamp: Date;
  synced: boolean;
};