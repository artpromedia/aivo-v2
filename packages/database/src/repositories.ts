import type { User, UserRole, GradeLevel } from '@aivo/types';

// Placeholder types for database entities (to be replaced with Prisma-generated types)
export interface Assessment {
  id: string;
  title: string;
  description?: string;
  type: string;
  subject: string;
  gradeLevel: GradeLevel;
  schoolId: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AssessmentQuestion {
  id: string;
  assessmentId: string;
  questionText: string;
  questionType: string;
  points: number;
  order: number;
}

export interface AssessmentAttempt {
  id: string;
  assessmentId: string;
  studentId: string;
  responses: Record<string, unknown>[];
  score?: number;
  timeSpent: number;
  completedAt?: Date;
}

export interface IEP {
  id: string;
  studentId: string;
  schoolId: string;
  status: string;
  startDate: Date;
  endDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IEPGoal {
  id: string;
  iepId: string;
  goalText: string;
  progress: number;
  status: string;
}

export interface IEPService {
  id: string;
  iepId: string;
  serviceType: string;
  frequency: string;
  duration: number;
}

export interface IEPMeeting {
  id: string;
  iepId: string;
  scheduledAt: Date;
  attendees: string[];
  notes?: string;
}

export interface AIModel {
  id: string;
  name: string;
  type: string;
  version: string;
  studentId?: string;
  settings: Record<string, unknown>;
  createdAt: Date;
}

export interface Conversation {
  id: string;
  modelId: string;
  studentId: string;
  messages: Record<string, unknown>[];
  createdAt: Date;
}

export interface ModelUsageMetrics {
  modelId: string;
  date: Date;
  requestCount: number;
  tokensUsed: number;
  averageResponseTime: number;
}

export interface Subscription {
  id: string;
  tenantId: string;
  customerId: string;
  planId: string;
  status: string;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
}

export interface Invoice {
  id: string;
  subscriptionId: string;
  amount: number;
  status: string;
  dueDate: Date;
  paidAt?: Date;
}

export interface FocusSession {
  id: string;
  studentId: string;
  teacherId?: string;
  status: string;
  startTime: Date;
  endTime?: Date;
  focusScore?: number;
}

export interface FocusEvent {
  id: string;
  sessionId: string;
  eventType: string;
  timestamp: Date;
  data: Record<string, unknown>;
}

export interface FocusIntervention {
  id: string;
  sessionId: string;
  interventionType: string;
  triggeredAt: Date;
  effectiveness?: string;
}

export interface GameTemplate {
  id: string;
  name: string;
  category: string;
  type: string;
  gradeLevel: string;
  subject: string;
  structure: Record<string, unknown>;
  createdBy: string;
}

export interface GameSession {
  id: string;
  templateId: string;
  studentId: string;
  status: string;
  gameState: Record<string, unknown>;
  startTime: Date;
  endTime?: Date;
}

export interface GameResult {
  id: string;
  sessionId: string;
  score: number;
  accuracy: number;
  completedAt: Date;
  data: Record<string, unknown>;
}

export interface HomeworkSession {
  id: string;
  studentId: string;
  subject: string;
  topic: string;
  status: string;
  work: Record<string, unknown>;
  createdAt: Date;
  completedAt?: Date;
}

export interface HomeworkHint {
  id: string;
  sessionId: string;
  hintText: string;
  stepNumber: number;
  helpful?: boolean;
}

export interface HomeworkResource {
  id: string;
  title: string;
  type: string;
  subject: string;
  gradeLevel: string;
  topics: string[];
  skills: string[];
  rating?: number;
}

export interface WritingDocument {
  id: string;
  studentId: string;
  title: string;
  type: string;
  content: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface WritingFeedback {
  id: string;
  documentId: string;
  feedbackType: string;
  text: string;
  status: string;
  createdAt: Date;
}

export interface WritingRevision {
  id: string;
  documentId: string;
  version: number;
  content: string;
  changes: string;
  createdAt: Date;
}

export interface WritingComment {
  id: string;
  documentId: string;
  authorId: string;
  text: string;
  resolved: boolean;
  parentId?: string;
  createdAt: Date;
}

export interface WritingPrompt {
  id: string;
  title: string;
  prompt: string;
  type: string;
  gradeLevel: string;
  difficulty?: string;
  createdBy: string;
}

// Analytics and metrics types
export interface FocusAnalytics {
  averageFocusScore: number;
  totalEvents: number;
  interventionCount: number;
  trendsOverTime: Array<{ date: Date; score: number }>;
}

export interface GameAnalytics {
  totalPlays: number;
  averageScore: number;
  averageAccuracy: number;
  completionRate: number;
  averageDuration: number;
}

export interface StudentGameAnalytics {
  gamesPlayed: number;
  totalScore: number;
  favoriteGames: Array<{ gameId: string; playCount: number }>;
  skillProgress: Record<string, number>;
}

export interface InterventionAnalytics {
  totalInterventions: number;
  effectivenessRates: Record<string, number>;
  mostEffectiveTypes: string[];
}

export interface RevisionComparison {
  version1: number;
  version2: number;
  addedText: string[];
  removedText: string[];
  modifiedSections: Array<{ old: string; new: string }>;
}

// Base repository interface for common operations
export interface BaseRepository<T> {
  findById(id: string): Promise<T | null>;
  findMany(options?: QueryOptions): Promise<T[]>;
  create(data: Partial<T>): Promise<T>;
  update(id: string, data: Partial<T>): Promise<T>;
  delete(id: string): Promise<void>;
  softDelete(id: string): Promise<T>;
}

export interface QueryOptions {
  where?: Record<string, unknown>;
  orderBy?: Record<string, 'asc' | 'desc'>;
  skip?: number;
  take?: number;
  include?: Record<string, boolean | QueryOptions>;
}

// User repository with role-specific methods
export interface UserRepository extends BaseRepository<User> {
  findByEmail(email: string, tenantId: string): Promise<User | null>;
  findByRole(role: UserRole, tenantId: string): Promise<User[]>;
  findStudentsBySchool(schoolId: string): Promise<User[]>;
  findTeachersBySchool(schoolId: string): Promise<User[]>;
  findParentsByStudent(studentId: string): Promise<User[]>;
  createStudent(data: CreateStudentData): Promise<User>;
  createTeacher(data: CreateTeacherData): Promise<User>;
  createParent(data: CreateParentData): Promise<User>;
  updateLastLogin(id: string): Promise<void>;
  activateUser(id: string): Promise<User>;
  deactivateUser(id: string): Promise<User>;
}

// Assessment repository
export interface AssessmentRepository extends BaseRepository<Assessment> {
  findBySchool(schoolId: string): Promise<Assessment[]>;
  findBySubjectAndGrade(subject: string, gradeLevel: GradeLevel): Promise<Assessment[]>;
  findAssignedToStudent(studentId: string): Promise<Assessment[]>;
  createWithQuestions(data: CreateAssessmentData): Promise<Assessment>;
  addQuestion(assessmentId: string, questionData: Partial<AssessmentQuestion>): Promise<AssessmentQuestion>;
  removeQuestion(assessmentId: string, questionId: string): Promise<void>;
  assignToStudents(assessmentId: string, studentIds: string[]): Promise<AssessmentAttempt[]>;
  submitAttempt(attemptData: SubmitAttemptData): Promise<AssessmentAttempt>;
  gradeAttempt(attemptId: string, grading: GradingData): Promise<AssessmentAttempt>;
}

// IEP repository
export interface IEPRepository extends BaseRepository<IEP> {
  findByStudent(studentId: string): Promise<IEP[]>;
  findActiveByStudent(studentId: string): Promise<IEP | null>;
  findBySchool(schoolId: string): Promise<IEP[]>;
  findDueForReview(daysFromNow: number): Promise<IEP[]>;
  createWithGoalsAndServices(data: CreateIEPData): Promise<IEP>;
  addGoal(iepId: string, goalData: Partial<IEPGoal>): Promise<IEPGoal>;
  updateGoalProgress(goalId: string, progressData: Partial<IEPGoal>): Promise<IEPGoal>;
  addService(iepId: string, serviceData: Partial<IEPService>): Promise<IEPService>;
  scheduleTeamMeeting(iepId: string, meetingData: Partial<IEPMeeting>): Promise<IEPMeeting>;
  approveIEP(iepId: string, approvedBy: string): Promise<IEP>;
}

// AI Model repository
export interface AIModelRepository extends BaseRepository<AIModel> {
  findByType(type: string): Promise<AIModel[]>;
  findPersonalModel(studentId: string): Promise<AIModel | null>;
  createPersonalModel(studentId: string, baseModelId: string, settings: Record<string, unknown>): Promise<AIModel>;
  updatePersonalModelSettings(modelId: string, settings: Record<string, unknown>): Promise<AIModel>;
  logConversation(conversationData: Partial<Conversation>): Promise<Conversation>;
  getConversationHistory(studentId: string, limit?: number): Promise<Conversation[]>;
  recordUsageMetrics(modelId: string, metrics: Partial<ModelUsageMetrics>): Promise<void>;
}

// Subscription repository
export interface SubscriptionRepository extends BaseRepository<Subscription> {
  findByTenant(tenantId: string): Promise<Subscription | null>;
  findByCustomer(customerId: string): Promise<Subscription[]>;
  findExpiring(daysFromNow: number): Promise<Subscription[]>;
  createWithPaymentMethod(subscriptionData: Partial<Subscription>, paymentData: Record<string, unknown>): Promise<Subscription>;
  updateUsage(subscriptionId: string, usage: Record<string, unknown>): Promise<Subscription>;
  generateInvoice(subscriptionId: string): Promise<Invoice>;
  processPayment(invoiceId: string): Promise<Invoice>;
  cancelSubscription(subscriptionId: string, reason: string): Promise<Subscription>;
}

// Data transfer objects
export interface CreateStudentData {
  tenantId: string;
  firstName: string;
  lastName: string;
  email?: string;
  studentId: string;
  gradeLevel: GradeLevel;
  dateOfBirth: string;
  schoolId: string;
  parentIds?: string[];
  hasIEP?: boolean;
  hasDisabilities?: boolean;
}

export interface CreateTeacherData {
  tenantId: string;
  firstName: string;
  lastName: string;
  email: string;
  teacherId: string;
  schoolId: string;
  districtId: string;
  specializations: string[];
  licenseNumber?: string;
  certifications?: string[];
}

export interface CreateParentData {
  tenantId: string;
  firstName: string;
  lastName: string;
  email?: string;
  phoneNumber?: string;
  relationshipType: string;
  studentIds: string[];
}

export interface CreateAssessmentData {
  title: string;
  description?: string;
  type: string;
  subject: string;
  gradeLevel: GradeLevel;
  schoolId: string;
  createdBy: string;
  questions?: Partial<AssessmentQuestion>[];
  settings?: Record<string, unknown>;
}

export interface SubmitAttemptData {
  assessmentId: string;
  studentId: string;
  responses: Record<string, unknown>[];
  timeSpent: number;
  accommodationsUsed?: string[];
}

export interface GradingData {
  scores: Record<string, number>;
  feedback?: string;
  gradedBy: string;
}

export interface CreateIEPData {
  studentId: string;
  schoolId: string;
  studentInfo: Record<string, unknown>;
  dates: {
    startDate: Date;
    endDate: Date;
    reviewDate?: Date;
  };
  presentLevels: Record<string, unknown>;
  goals?: Partial<IEPGoal>[];
  services?: Partial<IEPService>[];
  teamMembers?: Array<{ userId: string; role: string }>;
}

// Phase 1 Features Repositories

// Focus Guardian repository
export interface FocusRepository extends BaseRepository<FocusSession> {
  // Focus Sessions
  createFocusSession(data: CreateFocusSessionData): Promise<FocusSession>;
  findSessionsByStudent(studentId: string, limit?: number): Promise<FocusSession[]>;
  findActiveSessionsByStudent(studentId: string): Promise<FocusSession[]>;
  updateSessionStatus(sessionId: string, status: string): Promise<FocusSession>;
  endSession(sessionId: string, analytics: Partial<FocusAnalytics>): Promise<FocusSession>;
  
  // Focus Events
  logFocusEvent(sessionId: string, eventData: Partial<FocusEvent>): Promise<FocusEvent>;
  getEventsBySession(sessionId: string): Promise<FocusEvent[]>;
  getEventAnalytics(studentId: string, dateRange: { start: Date; end: Date }): Promise<FocusAnalytics>;
  
  // Focus Interventions
  createIntervention(sessionId: string, interventionData: Partial<FocusIntervention>): Promise<FocusIntervention>;
  findInterventionsBySession(sessionId: string): Promise<FocusIntervention[]>;
  updateInterventionEffectiveness(interventionId: string, effectiveness: string): Promise<FocusIntervention>;
  getInterventionAnalytics(studentId: string): Promise<InterventionAnalytics>;
}

// Game Generation repository
export interface GameRepository extends BaseRepository<GameSession> {
  // Game Templates
  findTemplatesByGradeAndSubject(gradeLevel: string, subject: string): Promise<GameTemplate[]>;
  findTemplatesByCategory(category: string): Promise<GameTemplate[]>;
  createTemplate(templateData: CreateGameTemplateData): Promise<GameTemplate>;
  updateTemplatePopularity(templateId: string): Promise<GameTemplate>;
  
  // Game Sessions
  createGameSession(templateId: string, sessionData: CreateGameSessionData): Promise<GameSession>;
  findSessionsByStudent(studentId: string, limit?: number): Promise<GameSession[]>;
  updateGameState(sessionId: string, gameState: Record<string, unknown>): Promise<GameSession>;
  completeGame(sessionId: string, results: Partial<GameResult>): Promise<GameSession>;
  
  // Game Results
  recordGameResult(sessionId: string, resultData: Partial<GameResult>): Promise<GameResult>;
  getResultsByStudent(studentId: string): Promise<GameResult[]>;
  getGameAnalytics(gameId: string): Promise<GameAnalytics>;
  getStudentGameAnalytics(studentId: string): Promise<StudentGameAnalytics>;
}

// Homework Helper repository
export interface HomeworkRepository extends BaseRepository<HomeworkSession> {
  // Homework Sessions
  createHomeworkSession(sessionData: CreateHomeworkSessionData): Promise<HomeworkSession>;
  findSessionsByStudent(studentId: string, limit?: number): Promise<HomeworkSession[]>;
  updateStudentWork(sessionId: string, work: Record<string, unknown>): Promise<HomeworkSession>;
  submitAnswer(sessionId: string, answer: Record<string, unknown>): Promise<HomeworkSession>;
  completeSession(sessionId: string, feedback: Record<string, unknown>): Promise<HomeworkSession>;
  
  // Homework Hints
  createHint(sessionId: string, hintData: Partial<HomeworkHint>): Promise<HomeworkHint>;
  getHintsBySession(sessionId: string): Promise<HomeworkHint[]>;
  recordHintFeedback(hintId: string, helpful: boolean): Promise<HomeworkHint>;
  
  // Homework Resources
  findResourcesBySubjectAndGrade(subject: string, gradeLevel: string): Promise<HomeworkResource[]>;
  findRecommendedResources(topics: string[], skills: string[]): Promise<HomeworkResource[]>;
  createResource(resourceData: CreateHomeworkResourceData): Promise<HomeworkResource>;
  updateResourceRating(resourceId: string, rating: number): Promise<HomeworkResource>;
}

// Writing Pad repository
export interface WritingRepository extends BaseRepository<WritingDocument> {
  // Writing Documents
  createDocument(documentData: CreateWritingDocumentData): Promise<WritingDocument>;
  findDocumentsByStudent(studentId: string, limit?: number): Promise<WritingDocument[]>;
  updateDocumentContent(documentId: string, content: string): Promise<WritingDocument>;
  submitDocument(documentId: string): Promise<WritingDocument>;
  shareDocument(documentId: string, shareSettings: Record<string, unknown>): Promise<WritingDocument>;
  
  // Writing Feedback
  generateFeedback(documentId: string, content: string): Promise<WritingFeedback[]>;
  getFeedbackByDocument(documentId: string): Promise<WritingFeedback[]>;
  updateFeedbackStatus(feedbackId: string, status: string): Promise<WritingFeedback>;
  
  // Writing Revisions
  createRevision(documentId: string, revisionData: Partial<WritingRevision>): Promise<WritingRevision>;
  getRevisionsByDocument(documentId: string): Promise<WritingRevision[]>;
  compareRevisions(documentId: string, version1: number, version2: number): Promise<RevisionComparison>;
  
  // Writing Comments
  addComment(documentId: string, commentData: Partial<WritingComment>): Promise<WritingComment>;
  getCommentsByDocument(documentId: string): Promise<WritingComment[]>;
  replyToComment(parentCommentId: string, replyData: Partial<WritingComment>): Promise<WritingComment>;
  resolveComment(commentId: string): Promise<WritingComment>;
  
  // Writing Prompts
  findPromptsByGradeAndType(gradeLevel: string, type: string): Promise<WritingPrompt[]>;
  findPromptsBySubject(subject: string): Promise<WritingPrompt[]>;
  createPrompt(promptData: CreateWritingPromptData): Promise<WritingPrompt>;
  updatePromptPopularity(promptId: string): Promise<WritingPrompt>;
}

// Data transfer objects for Phase 1 features
export interface CreateFocusSessionData {
  studentId: string;
  teacherId?: string;
  subject?: string;
  activityType: string;
  duration: number;
  parentalConsent: boolean;
  consentedBy?: string;
  monitoringLevel?: string;
  interventionLevel?: string;
}

export interface CreateGameTemplateData {
  name: string;
  description: string;
  category: string;
  type: string;
  minAge: number;
  maxAge: number;
  gradeLevel: string;
  subject: string;
  difficulty?: string;
  estimatedDuration: number;
  structure: Record<string, unknown>;
  contentSlots: Record<string, unknown>;
  scoringRubric: Record<string, unknown>;
  adaptationRules: Record<string, unknown>;
  createdBy: string;
}

export interface CreateGameSessionData {
  studentId: string;
  teacherId?: string;
  title: string;
  description?: string;
  generatedContent: Record<string, unknown>;
  estimatedDuration: number;
}

export interface CreateHomeworkSessionData {
  studentId: string;
  teacherId?: string;
  subject: string;
  topic: string;
  gradeLevel: string;
  problemType: string;
  problemStatement: string;
  problemImages?: Array<{ url: string; alt?: string }>;
  attachments?: Array<{ url: string; name: string; type: string }>;
}

export interface CreateHomeworkResourceData {
  title: string;
  description: string;
  type: string;
  subject: string;
  gradeLevel: string;
  topics: string[];
  skills: string[];
  url?: string;
  content?: string;
  duration?: number;
  difficulty?: string;
  createdBy?: string;
}

export interface CreateWritingDocumentData {
  studentId: string;
  teacherId?: string;
  title: string;
  type: string;
  subject?: string;
  gradeLevel: string;
  prompt?: string;
  instructions?: Record<string, unknown>;
  rubric?: Record<string, unknown>;
  requirements?: Record<string, unknown>;
  dueDate?: Date;
}

export interface CreateWritingPromptData {
  title: string;
  description: string;
  prompt: string;
  type: string;
  subject?: string;
  gradeLevel: string;
  difficulty?: string;
  estimatedTime: number;
  minWords?: number;
  maxWords?: number;
  instructions?: Record<string, unknown>;
  examples?: Array<{ title: string; content: string }>;
  rubric?: Record<string, unknown>;
  createdBy: string;
}

// Extended Repository factory interface
export interface RepositoryFactory {
  createUserRepository(): UserRepository;
  createAssessmentRepository(): AssessmentRepository;
  createIEPRepository(): IEPRepository;
  createAIModelRepository(): AIModelRepository;
  createSubscriptionRepository(): SubscriptionRepository;
  
  // Phase 1 Features
  createFocusRepository(): FocusRepository;
  createGameRepository(): GameRepository;
  createHomeworkRepository(): HomeworkRepository;
  createWritingRepository(): WritingRepository;
}