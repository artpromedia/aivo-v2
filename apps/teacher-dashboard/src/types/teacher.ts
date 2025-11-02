// Teacher-specific types for Virtual Brain creation and management
import type { VirtualBrain } from './virtual-brain';

export interface TeacherStudent {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  initials: string;
  dateOfBirth: Date;
  age: number;
  grade: string;
  studentId?: string;
  
  // District & Curriculum
  zipCode: string;
  district: District;
  
  // Learning Profile
  hasIEP: boolean;
  iepDocument?: File;
  iepGoals?: IEPGoal[];
  iepAccommodations?: string[];
  disabilities?: string[];
  learningStrengths?: string[];
  subjectStrengths?: string[];
  challengeAreas?: string[];
  notes?: string;
  
  // Consent & Compliance
  parentConsentObtained: boolean;
  ferpaCompliant: boolean;
  districtApproved: boolean;
  dataSharing: boolean;
  anonymousData: boolean;
  
  // Parent Info
  parentName?: string;
  parentEmail?: string;
  parentPhone?: string;
  parentRelationship?: 'Mother' | 'Father' | 'Guardian';
  parentNotificationTiming?: 'now' | 'after' | 'manual';
  parentConnected: boolean;
  parentLastLogin?: Date;
  parentWeeklyViews?: number;
  parentMessages?: number;
  
  // License
  licenseType: 'district' | 'parent' | 'trial';
  
  // Virtual Brain
  virtualBrain?: VirtualBrain;
  brainCreated: boolean;
  brainActive: boolean;
  brainHealth: number;
  currentActivity?: string;
  lastAdaptation?: string;
  focusLevel: number;
  focusThreshold: number;
  dailyProgress: number;
  progressTarget: number;
  pendingSuggestions: number;
  
  // Assessment
  assessmentCompleted: boolean;
  assessmentMode?: 'student-independent' | 'teacher-assisted' | 'remote';
  assessmentProgress?: number;
  baselineResults?: AssessmentResults;
}

export interface District {
  id: string;
  name: string;
  state: string;
  curriculum: string;
  standards: string[];
  zipCodes: string[];
}

export interface IEPGoal {
  id: string;
  description: string;
  category: string;
  targetDate: Date;
  progress: number;
  status: 'active' | 'completed' | 'modified';
  brainAdaptations: number;
  practiceSessions: number;
  metrics?: BrainMetrics[];
}

export interface AssessmentResults {
  overallScore: number;
  strengthAreas: string[];
  challengeAreas: string[];
  learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'reading-writing';
  learningPace: 'fast' | 'moderate' | 'slow';
  preferredModality: string;
  detailedScores: {
    math: number;
    reading: number;
    writing: number;
    science: number;
  };
  adaptiveLevel: string;
}

export interface AssessmentQuestion {
  id: string;
  type: 'multiple-choice' | 'open-ended' | 'interactive';
  subject: string;
  difficulty: number;
  text: string;
  image?: string;
  audio?: string;
  options?: QuestionOption[];
  correctAnswer?: string;
}

export interface QuestionOption {
  id: string;
  label: string;
  text: string;
  image?: string;
}

export interface AssessmentObservation {
  questionId: string;
  note: string;
  showedFrustration: boolean;
  requiredExplanation: boolean;
  usedAccommodation: boolean;
  answeredConfidently: boolean;
  timestamp: Date;
}

export interface VirtualBrainCreationStage {
  name: 'analyzing' | 'cloning' | 'personalizing' | 'testing' | 'ready';
  status: 'pending' | 'in-progress' | 'complete' | 'error';
  progress: number;
  details?: string[];
}

export interface DocumentUpload {
  id: string;
  name: string;
  size: string;
  type: string;
  file: File;
  status: 'uploading' | 'processing' | 'complete' | 'error';
  progress: number;
  processedAt?: Date;
}

export interface DistributionSettings {
  recipientType: 'all' | 'selected' | 'grade' | 'iep';
  selectedStudents: string[];
  adaptations: {
    adjustDifficulty: boolean;
    createPractice: boolean;
    generateStudyGuides: boolean;
    extractConcepts: boolean;
    createAssessments: boolean;
  };
  timing: 'now' | 'scheduled';
  scheduledDate?: Date;
}

export interface BrainFleetStats {
  totalBrains: number;
  activeBrains: number;
  avgAdaptations: number;
  docsProcessed: number;
}

export interface ParentInvitation {
  studentId: string;
  method: 'individual' | 'bulk' | 'qr';
  parentName: string;
  parentEmail: string;
  parentPhone?: string;
  fullAccess: boolean;
  sendWelcomeGuide: boolean;
  status: 'pending' | 'sent' | 'accepted' | 'expired';
  sentAt?: Date;
  acceptedAt?: Date;
}

export interface ClassroomJoinInfo {
  classroomCode: string;
  joinUrl: string;
  qrCodeData: string;
  expiresAt: Date;
}

export interface IEPDashboardStats {
  activeIEPs: number;
  goalsOnTrack: number;
  upcomingReviews: number;
}

export interface BrainMetrics {
  name: string;
  value: number;
  target: number;
  trend: 'up' | 'down' | 'stable';
}
