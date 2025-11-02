// User & Parent Types
export interface Parent {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  phoneNumber?: string;
  timezone: string;
  preferences: ParentPreferences;
  subscription: Subscription;
  children: Child[];
  notifications: NotificationSettings;
  permissions: ParentPermissions;
  createdAt: Date;
  lastLogin: Date;
}

export interface ParentPreferences {
  language: string;
  emailNotifications: boolean;
  smsNotifications: boolean;
  weeklyReports: boolean;
  monthlyReports: boolean;
  emergencyAlerts: boolean;
  theme: 'light' | 'dark' | 'auto';
  digestFrequency: 'daily' | 'weekly' | 'never';
}

export interface ParentPermissions {
  canModifyChildProfiles: boolean;
  canViewDetailedProgress: boolean;
  canCommunicateWithTeachers: boolean;
  canManageScreenTime: boolean;
  canSetLearningGoals: boolean;
  canDownloadReports: boolean;
  canManageBilling: boolean;
  canInviteOtherParents: boolean;
}

// Child Types
export interface Child {
  id: string;
  parentId: string;
  name: string;
  avatar?: string;
  dateOfBirth: Date;
  gradeLevel: number;
  ageGroup: 'k5' | 'middle' | 'high';
  schoolName?: string;
  teacherName?: string;
  teacherEmail?: string;
  preferences: ChildPreferences;
  progress: ChildProgress;
  screenTime: ScreenTimeData;
  learningGoals: LearningGoal[];
  assessments: Assessment[];
  aiSuggestions: AISuggestion[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChildPreferences {
  subjectsOfInterest: string[];
  learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'reading';
  difficultyPreference: 'easy' | 'medium' | 'hard' | 'adaptive';
  sessionDuration: number; // minutes
  accessibilityNeeds: AccessibilitySettings;
}

export interface ChildProgress {
  totalPoints: number;
  level: number;
  currentStreak: number;
  longestStreak: number;
  totalLessonsCompleted: number;
  averageScore: number;
  improvementRate: number;
  strongSubjects: string[];
  needsImprovementSubjects: string[];
  badges: Badge[];
  achievements: Achievement[];
  weeklyProgress: WeeklyProgress[];
  monthlyProgress: MonthlyProgress[];
}

export interface WeeklyProgress {
  week: string; // ISO week string
  lessonsCompleted: number;
  totalTimeSpent: number; // minutes
  averageScore: number;
  subjectBreakdown: Record<string, SubjectProgress>;
}

export interface MonthlyProgress {
  month: string; // YYYY-MM format
  lessonsCompleted: number;
  totalTimeSpent: number;
  averageScore: number;
  improvementPercentage: number;
  goalsAchieved: number;
  totalGoals: number;
}

export interface SubjectProgress {
  name: string;
  lessonsCompleted: number;
  averageScore: number;
  timeSpent: number;
  difficulty: 'easy' | 'medium' | 'hard';
  masteryLevel: number; // 0-100
}

// Learning Goals
export interface LearningGoal {
  id: string;
  childId: string;
  title: string;
  description: string;
  subject: string;
  targetValue: number;
  currentValue: number;
  unit: 'lessons' | 'points' | 'hours' | 'assessments';
  difficulty: 'easy' | 'medium' | 'hard';
  deadline: Date;
  status: 'active' | 'completed' | 'paused' | 'cancelled';
  priority: 'low' | 'medium' | 'high';
  createdBy: 'parent' | 'teacher' | 'ai';
  rewards: GoalReward[];
  milestones: GoalMilestone[];
  createdAt: Date;
  completedAt?: Date;
}

export interface GoalReward {
  type: 'badge' | 'points' | 'privilege' | 'item';
  name: string;
  description: string;
  value: number;
}

export interface GoalMilestone {
  percentage: number;
  title: string;
  achieved: boolean;
  achievedAt?: Date;
}

// Screen Time & Analytics
export interface ScreenTimeData {
  dailyLimit: number; // minutes
  weeklyLimit: number; // minutes
  currentDayUsage: number;
  currentWeekUsage: number;
  allowedTimeSlots: TimeSlot[];
  blockedApps: string[];
  restrictions: ScreenTimeRestrictions;
  usage: ScreenTimeUsage[];
}

export interface TimeSlot {
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
  days: DayOfWeek[];
}

export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export interface ScreenTimeRestrictions {
  bedtimeMode: boolean;
  bedtimeStart: string; // HH:MM
  bedtimeEnd: string; // HH:MM
  educationalAppsOnly: boolean;
  requireParentApproval: boolean;
  breakReminders: boolean;
  breakInterval: number; // minutes
}

export interface ScreenTimeUsage {
  date: Date;
  totalMinutes: number;
  appUsage: AppUsage[];
  sessions: UsageSession[];
}

export interface AppUsage {
  appName: string;
  category: 'educational' | 'entertainment' | 'social' | 'productivity';
  minutes: number;
  launches: number;
}

export interface UsageSession {
  startTime: Date;
  endTime: Date;
  appName: string;
  duration: number; // minutes
}

// Assessment Types
export interface Assessment {
  id: string;
  childId: string;
  title: string;
  subject: string;
  type: 'quiz' | 'test' | 'project' | 'assignment';
  score: number;
  maxScore: number;
  percentage: number;
  grade: string;
  timeSpent: number; // minutes
  difficulty: 'easy' | 'medium' | 'hard';
  topics: string[];
  strengths: string[];
  improvements: string[];
  teacherFeedback?: string;
  aiAnalysis?: AssessmentAIAnalysis;
  submittedAt: Date;
  gradedAt?: Date;
}

export interface AssessmentAIAnalysis {
  overallPerformance: 'excellent' | 'good' | 'satisfactory' | 'needs-improvement';
  strengths: AnalysisPoint[];
  improvements: AnalysisPoint[];
  recommendations: Recommendation[];
  nextSteps: string[];
}

export interface AnalysisPoint {
  area: string;
  description: string;
  confidence: number; // 0-100
}

export interface Recommendation {
  type: 'practice' | 'review' | 'advance' | 'support';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  estimatedTime: number; // minutes
}

// AI Suggestions
export interface AISuggestion {
  id: string;
  childId: string;
  type: 'learning-path' | 'difficulty-adjustment' | 'content-recommendation' | 'goal-suggestion' | 'schedule-optimization';
  title: string;
  description: string;
  reasoning: string;
  confidence: number; // 0-100
  impact: 'low' | 'medium' | 'high';
  category: string;
  status: 'pending' | 'accepted' | 'rejected' | 'modified' | 'implemented';
  implementation: SuggestionImplementation;
  parentResponse?: ParentResponse;
  createdAt: Date;
  respondedAt?: Date;
  implementedAt?: Date;
}

export interface SuggestionImplementation {
  steps: string[];
  estimatedTime: number;
  requirements: string[];
  expectedOutcome: string;
}

export interface ParentResponse {
  action: 'accept' | 'reject' | 'modify';
  feedback?: string;
  modifications?: Record<string, any>;
  reason?: string;
}

// Billing & Subscription
export interface Subscription {
  id: string;
  parentId: string;
  planType: 'single-child' | 'multi-child' | 'family' | 'premium';
  planName: string;
  price: number;
  billingCycle: 'monthly' | 'yearly';
  status: 'active' | 'cancelled' | 'past_due' | 'trialing' | 'paused';
  trialEndsAt?: Date;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelledAt?: Date;
  features: SubscriptionFeature[];
  childLimit: number;
  stripeSubscriptionId?: string;
  paymentMethod: PaymentMethod;
  invoices: Invoice[];
  usageMetrics: UsageMetrics;
}

export interface SubscriptionFeature {
  name: string;
  included: boolean;
  limit?: number;
  description: string;
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'bank_account' | 'paypal';
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
  stripePaymentMethodId?: string;
}

export interface Invoice {
  id: string;
  subscriptionId: string;
  amount: number;
  currency: string;
  status: 'paid' | 'pending' | 'failed' | 'refunded';
  issueDate: Date;
  dueDate: Date;
  paidAt?: Date;
  items: InvoiceItem[];
  downloadUrl?: string;
  stripeInvoiceId?: string;
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface UsageMetrics {
  childrenCount: number;
  activeChildren: number;
  totalLessonsThisMonth: number;
  totalAssessmentsThisMonth: number;
  storageUsedMB: number;
  reportGeneratedThisMonth: number;
  apiCallsThisMonth: number;
}

// Communication Types
export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderType: 'parent' | 'teacher' | 'admin';
  recipientId: string;
  recipientType: 'parent' | 'teacher' | 'admin';
  subject?: string;
  content: string;
  type: 'message' | 'announcement' | 'report' | 'alert';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'sent' | 'delivered' | 'read' | 'replied';
  attachments: MessageAttachment[];
  readAt?: Date;
  sentAt: Date;
  childId?: string; // If message is about a specific child
}

export interface MessageAttachment {
  id: string;
  name: string;
  type: 'image' | 'document' | 'video' | 'audio';
  size: number; // bytes
  url: string;
  mimeType: string;
}

export interface Conversation {
  id: string;
  participants: ConversationParticipant[];
  subject: string;
  lastMessage: Message;
  unreadCount: number;
  childId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ConversationParticipant {
  id: string;
  type: 'parent' | 'teacher' | 'admin';
  name: string;
  avatar?: string;
  lastReadAt?: Date;
}

// Notification Types
export interface Notification {
  id: string;
  parentId: string;
  childId?: string;
  type: 'achievement' | 'progress' | 'assessment' | 'message' | 'goal' | 'billing' | 'system';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'unread' | 'read' | 'archived';
  actionRequired: boolean;
  actionUrl?: string;
  actionLabel?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  readAt?: Date;
}

export interface NotificationSettings {
  email: {
    achievements: boolean;
    weeklyReports: boolean;
    assessmentGraded: boolean;
    goalCompleted: boolean;
    messageReceived: boolean;
    billingUpdates: boolean;
    systemUpdates: boolean;
  };
  push: {
    achievements: boolean;
    dailySummary: boolean;
    messageReceived: boolean;
    urgentAlerts: boolean;
  };
  sms: {
    emergencyAlerts: boolean;
    billingIssues: boolean;
  };
}

// Calendar & Events
export interface CalendarEvent {
  id: string;
  childId?: string;
  type: 'assessment' | 'assignment' | 'meeting' | 'goal-deadline' | 'report-due';
  title: string;
  description?: string;
  startTime: Date;
  endTime?: Date;
  allDay: boolean;
  location?: string;
  attendees: string[];
  reminders: EventReminder[];
  status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';
  metadata?: Record<string, any>;
}

export interface EventReminder {
  type: 'email' | 'push' | 'sms';
  minutesBefore: number;
}

// Badges & Achievements
export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'academic' | 'behavioral' | 'milestone' | 'special';
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  requirements: BadgeRequirement[];
  earnedAt?: Date;
  progress?: number; // 0-100 if partially completed
}

export interface BadgeRequirement {
  type: 'lessons_completed' | 'streak_days' | 'subject_mastery' | 'assessment_score' | 'time_spent';
  value: number;
  subject?: string;
  description: string;
}

export interface Achievement {
  id: string;
  childId: string;
  type: 'milestone' | 'streak' | 'improvement' | 'mastery' | 'special';
  title: string;
  description: string;
  icon: string;
  points: number;
  unlockedAt: Date;
  shareableUrl?: string;
  celebrationShown: boolean;
}

// Accessibility
export interface AccessibilitySettings {
  fontSize: 'small' | 'medium' | 'large' | 'extra-large';
  highContrast: boolean;
  reducedMotion: boolean;
  screenReader: boolean;
  keyboardNavigation: boolean;
  colorBlindnessSupport: 'none' | 'deuteranopia' | 'protanopia' | 'tritanopia';
  voiceGuidance: boolean;
  closedCaptions: boolean;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  error?: ApiError;
  pagination?: PaginationMeta;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

export interface PaginationMeta {
  current: number;
  total: number;
  pageSize: number;
  hasNext: boolean;
  hasPrev: boolean;
  totalCount: number;
}

// Chart & Analytics Types
export interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

export interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string | string[];
  borderWidth?: number;
}

export interface AnalyticsFilter {
  dateRange: DateRange;
  childIds?: string[];
  subjects?: string[];
  metrics: string[];
}

export interface DateRange {
  start: Date;
  end: Date;
  preset?: 'today' | 'week' | 'month' | 'quarter' | 'year' | 'custom';
}

// Form Types
export interface FormField {
  name: string;
  label: string;
  type: string;
  required?: boolean;
  validation?: ValidationRule[];
  options?: SelectOption[];
  placeholder?: string;
  helpText?: string;
}

export interface ValidationRule {
  type: 'required' | 'min' | 'max' | 'pattern' | 'custom';
  value?: any;
  message: string;
}

export interface SelectOption {
  label: string;
  value: string | number;
  disabled?: boolean;
}

// Report Types
export interface Report {
  id: string;
  childId: string;
  type: 'progress' | 'assessment' | 'behavior' | 'usage' | 'comprehensive';
  title: string;
  period: DateRange;
  status: 'generating' | 'ready' | 'failed';
  format: 'pdf' | 'excel' | 'json';
  downloadUrl?: string;
  generatedAt?: Date;
  expiresAt?: Date;
  sections: ReportSection[];
}

export interface ReportSection {
  type: 'summary' | 'chart' | 'table' | 'text' | 'recommendation';
  title: string;
  content: any;
  order: number;
}

export type ReportType = 'progress' | 'assessment' | 'behavior' | 'usage' | 'comprehensive';