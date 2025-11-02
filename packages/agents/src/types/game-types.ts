// Game generation types for the Game Generation Agent

export type GameType = 
  | 'word-scramble'
  | 'math-puzzle'
  | 'memory-match' 
  | 'drawing-challenge'
  | 'spot-difference'
  | 'rhythm-game'
  | 'trivia'
  | 'logic-puzzle'
  | 'word-search'
  | 'pattern-completion'
  | 'code-breaking'
  | 'speed-math'
  | 'strategy-puzzle'
  | 'concept-connection'
  | 'critical-thinking'
  | 'speed-reading';

export type AgeGroup = 'k5' | 'middle' | 'high';

export interface GameTemplate {
  id: string;
  type: GameType;
  ageGroup: AgeGroup;
  name: string;
  description: string;
  duration: {
    min: number; // seconds
    max: number; // seconds
    target: number; // seconds
  };
  difficulty: {
    min: number;
    max: number;
    default: number;
  };
  objectives: string[];
  mechanics: {
    inputType: 'click' | 'drag' | 'type' | 'draw' | 'voice' | 'multi';
    feedbackType: 'instant' | 'progressive' | 'final';
    scoringSystem: 'points' | 'time' | 'accuracy' | 'completion';
    hasTimer: boolean;
    allowPause: boolean;
    multiAttempts: boolean;
  };
  educationalAlignment: {
    subjects: string[];
    skills: string[];
    bloomsLevel: 'remember' | 'understand' | 'apply' | 'analyze' | 'evaluate' | 'create';
  };
  contentRequirements: {
    vocabularyWords?: number;
    mathProblems?: number;
    concepts?: number;
    images?: number;
    sounds?: number;
    questions?: number;
  };
  accessibility: {
    visualImpairment: boolean;
    hearingImpairment: boolean;
    motorImpairment: boolean;
    cognitiveImpairment: boolean;
  };
  metadata: {
    created: Date;
    lastModified: Date;
    usageCount: number;
    averageRating: number;
    tags: string[];
  };
}

export interface GameContent {
  vocabulary?: string[];
  mathProblems?: MathProblem[];
  concepts?: ConceptNode[];
  images?: GameImage[];
  sounds?: GameSound[];
  questions?: GameQuestion[];
  patterns?: GamePattern[];
  stories?: string[];
  rules?: string[];
}

export interface MathProblem {
  id: string;
  equation: string;
  answer: number | string;
  difficulty: number; // 1-10
  topic: string;
  visualAid?: string; // SVG or image URL
  steps?: string[];
}

export interface ConceptNode {
  id: string;
  name: string;
  definition: string;
  examples: string[];
  connections: string[]; // IDs of related concepts
  subject: string;
  gradeLevel: string;
}

export interface GameImage {
  id: string;
  url: string;
  alt: string;
  category: string;
  tags: string[];
  difficulty: number;
}

export interface GameSound {
  id: string;
  url: string;
  type: 'effect' | 'music' | 'voice' | 'ambient';
  duration: number; // seconds
  description: string;
}

export interface GameQuestion {
  id: string;
  question: string;
  type: 'multiple-choice' | 'true-false' | 'fill-blank' | 'short-answer' | 'matching';
  options?: string[];
  correctAnswer: string | string[];
  explanation?: string;
  hint?: string;
  difficulty: number;
  subject: string;
  topic: string;
}

export interface GamePattern {
  id: string;
  sequence: (string | number | boolean)[];
  rule: string;
  nextElement?: string | number | boolean;
  difficulty: number;
  category: 'numeric' | 'visual' | 'logical' | 'spatial';
}

export interface GeneratedGame {
  id: string;
  sessionId?: string; // Link to focus session if applicable
  templateId: string;
  type: GameType;
  ageGroup: AgeGroup;
  title: string;
  instructions: string[];
  content: GameContent;
  config: GameConfiguration;
  state: GameState;
  metadata: {
    generated: Date;
    estimatedDuration: number; // seconds
    difficulty: number;
    learnerProfile?: {
      id: string;
      preferences: string[];
      strengths: string[];
      challenges: string[];
    };
    educationalContext?: {
      currentLesson?: string;
      subject?: string;
      recentTopics?: string[];
      strugglingAreas?: string[];
    };
  };
}

export interface GameConfiguration {
  difficulty: number; // 1-10
  timeLimit?: number; // seconds, null for untimed
  attempts: number | 'unlimited';
  showHints: boolean;
  showScore: boolean;
  showTimer: boolean;
  allowPause: boolean;
  backgroundMusic: boolean;
  soundEffects: boolean;
  animations: boolean;
  accessibility: {
    highContrast: boolean;
    largeText: boolean;
    reduceMotion: boolean;
    screenReader: boolean;
    keyboardOnly: boolean;
  };
  progressiveHints: boolean;
  celebrationLevel: 'minimal' | 'standard' | 'enthusiastic';
}

export interface GameState {
  status: 'not-started' | 'playing' | 'paused' | 'completed' | 'abandoned';
  startTime?: Date;
  endTime?: Date;
  currentStep: number;
  totalSteps: number;
  score: number;
  maxScore: number;
  attempts: number;
  hintsUsed: number;
  timeElapsed: number; // seconds
  correctAnswers: number;
  incorrectAnswers: number;
  streakCount: number;
  longestStreak: number;
  playerResponses: PlayerResponse[];
  checkpoints: GameCheckpoint[];
}

export interface PlayerResponse {
  id: string;
  questionId?: string;
  stepNumber: number;
  response: string | number | boolean | string[] | number[] | Record<string, unknown>;
  correct: boolean;
  timeToRespond: number; // milliseconds
  hintsUsed: number;
  attempts: number;
  timestamp: Date;
  confidence?: number; // 1-5 scale if tracked
}

export interface GameCheckpoint {
  step: number;
  timestamp: Date;
  score: number;
  timeElapsed: number;
  state: Record<string, unknown>; // Serializable game state for restore
}

export interface GameResults {
  gameId: string;
  sessionId?: string;
  playerId: string;
  completionStatus: 'completed' | 'partial' | 'abandoned';
  finalScore: number;
  maxPossibleScore: number;
  accuracyRate: number; // 0-1
  averageResponseTime: number; // milliseconds
  totalPlayTime: number; // seconds
  hintsUsed: number;
  attemptsUsed: number;
  streakAnalysis: {
    longestStreak: number;
    averageStreakLength: number;
    totalStreaks: number;
  };
  learningMetrics: {
    conceptsMastered: string[];
    skillsImproved: string[];
    areasForImprovement: string[];
    nextRecommendations: string[];
  };
  engagementMetrics: {
    focusScore?: number; // from focus monitoring if available
    enjoymentRating?: number; // player feedback 1-5
    difficultyRating?: number; // player feedback 1-5
    pauseCount: number;
    quitAttempts: number;
  };
  focusRestoration?: {
    preGameFocusScore: number;
    postGameFocusScore: number;
    restorationRate: number; // improvement percentage
    effectiveness: 'high' | 'medium' | 'low';
  };
}

export interface GameGenerationRequest {
  ageGroup: AgeGroup;
  duration: number; // seconds
  currentContext?: {
    subject?: string;
    recentLessons?: string[];
    strugglingAreas?: string[];
    currentTopic?: string;
  };
  learnerProfile?: {
    id: string;
    preferences?: string[];
    strengths?: string[];
    challenges?: string[];
    learningStyle?: 'visual' | 'auditory' | 'kinesthetic' | 'reading';
    attentionSpan?: number; // minutes
  };
  focusContext?: {
    currentFocusScore: number;
    distractionLevel: 'low' | 'medium' | 'high';
    fatigueIndicators: string[];
    interventionReason: string;
  };
  constraints?: {
    gameTypes?: GameType[];
    excludeTypes?: GameType[];
    maxDifficulty?: number;
    requiresAudio?: boolean;
    requiresText?: boolean;
    accessibilityNeeds?: string[];
  };
  preferences?: {
    gameType?: GameType;
    difficulty?: number;
    includeTimer?: boolean;
    allowHints?: boolean;
    celebrationLevel?: 'minimal' | 'standard' | 'enthusiastic';
  };
}

export interface GameAnalytics {
  gameId: string;
  totalPlays: number;
  completionRate: number; // 0-1
  averageScore: number;
  averageDuration: number; // seconds
  popularityScore: number; // based on play frequency and ratings
  difficultyAnalysis: {
    perceivedDifficulty: number; // 1-10 based on player feedback
    actualDifficulty: number; // based on performance metrics
    recommendedAdjustment: number; // +/- adjustment suggestion
  };
  learningEffectiveness: {
    knowledgeRetention: number; // 0-1
    skillImprovement: number; // 0-1  
    engagementLevel: number; // 0-1
    focusRestorationRate: number; // 0-1
  };
  playerFeedback: {
    averageEnjoyment: number; // 1-5
    averageDifficulty: number; // 1-5
    commonComplaints: string[];
    commonPraise: string[];
    suggestedImprovements: string[];
  };
  performanceByDemographic: {
    ageGroup: Record<AgeGroup, Record<string, unknown>>;
    learningStyle: Record<string, Record<string, unknown>>;
    accessibilityNeeds: Record<string, Record<string, unknown>>;
  };
}

// Game template definitions by age group
export const K5_GAME_TEMPLATES: Partial<Record<GameType, Omit<GameTemplate, 'id' | 'metadata'>>> = {
  'word-scramble': {
    type: 'word-scramble',
    ageGroup: 'k5',
    name: 'Word Mix-Up',
    description: 'Unscramble letters to make words from your lessons',
    duration: { min: 120, max: 180, target: 150 },
    difficulty: { min: 1, max: 5, default: 2 },
    objectives: ['Spelling practice', 'Letter recognition', 'Vocabulary building'],
    mechanics: {
      inputType: 'drag',
      feedbackType: 'instant',
      scoringSystem: 'points',
      hasTimer: false,
      allowPause: true,
      multiAttempts: true
    },
    educationalAlignment: {
      subjects: ['language-arts', 'reading'],
      skills: ['spelling', 'phonics', 'vocabulary'],
      bloomsLevel: 'remember'
    },
    contentRequirements: {
      vocabularyWords: 5
    },
    accessibility: {
      visualImpairment: true,
      hearingImpairment: true,
      motorImpairment: true,
      cognitiveImpairment: true
    }
  },
  'math-puzzle': {
    type: 'math-puzzle',
    ageGroup: 'k5',
    name: 'Number Fun',
    description: 'Solve simple math problems with colorful animations',
    duration: { min: 90, max: 150, target: 120 },
    difficulty: { min: 1, max: 4, default: 2 },
    objectives: ['Basic arithmetic', 'Number recognition', 'Problem solving'],
    mechanics: {
      inputType: 'click',
      feedbackType: 'instant',
      scoringSystem: 'accuracy',
      hasTimer: false,
      allowPause: true,
      multiAttempts: true
    },
    educationalAlignment: {
      subjects: ['mathematics'],
      skills: ['addition', 'subtraction', 'counting'],
      bloomsLevel: 'apply'
    },
    contentRequirements: {
      mathProblems: 5
    },
    accessibility: {
      visualImpairment: true,
      hearingImpairment: true,
      motorImpairment: true,
      cognitiveImpairment: true
    }
  }
};

export const MIDDLE_GAME_TEMPLATES: Partial<Record<GameType, Omit<GameTemplate, 'id' | 'metadata'>>> = {
  'trivia': {
    type: 'trivia',
    ageGroup: 'middle',
    name: 'Quick Quiz',
    description: 'Test your knowledge on recent lessons',
    duration: { min: 180, max: 240, target: 210 },
    difficulty: { min: 2, max: 7, default: 4 },
    objectives: ['Knowledge recall', 'Critical thinking', 'Subject mastery'],
    mechanics: {
      inputType: 'click',
      feedbackType: 'progressive',
      scoringSystem: 'points',
      hasTimer: true,
      allowPause: true,
      multiAttempts: false
    },
    educationalAlignment: {
      subjects: ['science', 'social-studies', 'mathematics', 'language-arts'],
      skills: ['recall', 'analysis', 'comprehension'],
      bloomsLevel: 'understand'
    },
    contentRequirements: {
      questions: 8
    },
    accessibility: {
      visualImpairment: true,
      hearingImpairment: true,
      motorImpairment: true,
      cognitiveImpairment: false
    }
  }
};

export const HIGH_GAME_TEMPLATES: Partial<Record<GameType, Omit<GameTemplate, 'id' | 'metadata'>>> = {
  'strategy-puzzle': {
    type: 'strategy-puzzle',
    ageGroup: 'high',
    name: 'Strategic Thinking',
    description: 'Complex problem-solving with lesson concepts',
    duration: { min: 240, max: 300, target: 270 },
    difficulty: { min: 4, max: 10, default: 6 },
    objectives: ['Strategic thinking', 'Complex analysis', 'Synthesis'],
    mechanics: {
      inputType: 'multi',
      feedbackType: 'final',
      scoringSystem: 'completion',
      hasTimer: true,
      allowPause: true,
      multiAttempts: true
    },
    educationalAlignment: {
      subjects: ['mathematics', 'science', 'critical-thinking'],
      skills: ['analysis', 'synthesis', 'evaluation'],
      bloomsLevel: 'create'
    },
    contentRequirements: {
      concepts: 3,
      questions: 5
    },
    accessibility: {
      visualImpairment: false,
      hearingImpairment: true,
      motorImpairment: false,
      cognitiveImpairment: false
    }
  }
};