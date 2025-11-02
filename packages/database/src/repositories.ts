import type { User, UserRole, Status, GradeLevel } from '@aivo/types';

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
  where?: Record<string, any>;
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
export interface AssessmentRepository extends BaseRepository<any> {
  findBySchool(schoolId: string): Promise<any[]>;
  findBySubjectAndGrade(subject: string, gradeLevel: GradeLevel): Promise<any[]>;
  findAssignedToStudent(studentId: string): Promise<any[]>;
  createWithQuestions(data: CreateAssessmentData): Promise<any>;
  addQuestion(assessmentId: string, questionData: any): Promise<any>;
  removeQuestion(assessmentId: string, questionId: string): Promise<void>;
  assignToStudents(assessmentId: string, studentIds: string[]): Promise<any[]>;
  submitAttempt(attemptData: SubmitAttemptData): Promise<any>;
  gradeAttempt(attemptId: string, grading: GradingData): Promise<any>;
}

// IEP repository
export interface IEPRepository extends BaseRepository<any> {
  findByStudent(studentId: string): Promise<any[]>;
  findActiveByStudent(studentId: string): Promise<any | null>;
  findBySchool(schoolId: string): Promise<any[]>;
  findDueForReview(daysFromNow: number): Promise<any[]>;
  createWithGoalsAndServices(data: CreateIEPData): Promise<any>;
  addGoal(iepId: string, goalData: any): Promise<any>;
  updateGoalProgress(goalId: string, progressData: any): Promise<any>;
  addService(iepId: string, serviceData: any): Promise<any>;
  scheduleTeamMeeting(iepId: string, meetingData: any): Promise<any>;
  approveIEP(iepId: string, approvedBy: string): Promise<any>;
}

// AI Model repository
export interface AIModelRepository extends BaseRepository<any> {
  findByType(type: string): Promise<any[]>;
  findPersonalModel(studentId: string): Promise<any | null>;
  createPersonalModel(studentId: string, baseModelId: string, settings: any): Promise<any>;
  updatePersonalModelSettings(modelId: string, settings: any): Promise<any>;
  logConversation(conversationData: any): Promise<any>;
  getConversationHistory(studentId: string, limit?: number): Promise<any[]>;
  recordUsageMetrics(modelId: string, metrics: any): Promise<void>;
}

// Subscription repository
export interface SubscriptionRepository extends BaseRepository<any> {
  findByTenant(tenantId: string): Promise<any | null>;
  findByCustomer(customerId: string): Promise<any[]>;
  findExpiring(daysFromNow: number): Promise<any[]>;
  createWithPaymentMethod(subscriptionData: any, paymentData: any): Promise<any>;
  updateUsage(subscriptionId: string, usage: any): Promise<any>;
  generateInvoice(subscriptionId: string): Promise<any>;
  processPayment(invoiceId: string): Promise<any>;
  cancelSubscription(subscriptionId: string, reason: string): Promise<any>;
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
  questions?: any[];
  settings?: any;
}

export interface SubmitAttemptData {
  assessmentId: string;
  studentId: string;
  responses: any[];
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
  studentInfo: any;
  dates: any;
  presentLevels: any;
  goals?: any[];
  services?: any[];
  teamMembers?: any[];
}

// Phase 1 Features Repositories

// Focus Guardian repository
export interface FocusRepository extends BaseRepository<any> {
  // Focus Sessions
  createFocusSession(data: CreateFocusSessionData): Promise<any>;
  findSessionsByStudent(studentId: string, limit?: number): Promise<any[]>;
  findActiveSessionsByStudent(studentId: string): Promise<any[]>;
  updateSessionStatus(sessionId: string, status: string): Promise<any>;
  endSession(sessionId: string, analytics: any): Promise<any>;
  
  // Focus Events
  logFocusEvent(sessionId: string, eventData: any): Promise<any>;
  getEventsBySession(sessionId: string): Promise<any[]>;
  getEventAnalytics(studentId: string, dateRange: { start: Date; end: Date }): Promise<any>;
  
  // Focus Interventions
  createIntervention(sessionId: string, interventionData: any): Promise<any>;
  findInterventionsBySession(sessionId: string): Promise<any[]>;
  updateInterventionEffectiveness(interventionId: string, effectiveness: string): Promise<any>;
  getInterventionAnalytics(studentId: string): Promise<any>;
}

// Game Generation repository
export interface GameRepository extends BaseRepository<any> {
  // Game Templates
  findTemplatesByGradeAndSubject(gradeLevel: string, subject: string): Promise<any[]>;
  findTemplatesByCategory(category: string): Promise<any[]>;
  createTemplate(templateData: CreateGameTemplateData): Promise<any>;
  updateTemplatePopularity(templateId: string): Promise<any>;
  
  // Game Sessions
  createGameSession(templateId: string, sessionData: CreateGameSessionData): Promise<any>;
  findSessionsByStudent(studentId: string, limit?: number): Promise<any[]>;
  updateGameState(sessionId: string, gameState: any): Promise<any>;
  completeGame(sessionId: string, results: any): Promise<any>;
  
  // Game Results
  recordGameResult(sessionId: string, resultData: any): Promise<any>;
  getResultsByStudent(studentId: string): Promise<any[]>;
  getGameAnalytics(gameId: string): Promise<any>;
  getStudentGameAnalytics(studentId: string): Promise<any>;
}

// Homework Helper repository
export interface HomeworkRepository extends BaseRepository<any> {
  // Homework Sessions
  createHomeworkSession(sessionData: CreateHomeworkSessionData): Promise<any>;
  findSessionsByStudent(studentId: string, limit?: number): Promise<any[]>;
  updateStudentWork(sessionId: string, work: any): Promise<any>;
  submitAnswer(sessionId: string, answer: any): Promise<any>;
  completeSession(sessionId: string, feedback: any): Promise<any>;
  
  // Homework Hints
  createHint(sessionId: string, hintData: any): Promise<any>;
  getHintsBySession(sessionId: string): Promise<any[]>;
  recordHintFeedback(hintId: string, helpful: boolean): Promise<any>;
  
  // Homework Resources
  findResourcesBySubjectAndGrade(subject: string, gradeLevel: string): Promise<any[]>;
  findRecommendedResources(topics: string[], skills: string[]): Promise<any[]>;
  createResource(resourceData: CreateHomeworkResourceData): Promise<any>;
  updateResourceRating(resourceId: string, rating: number): Promise<any>;
}

// Writing Pad repository
export interface WritingRepository extends BaseRepository<any> {
  // Writing Documents
  createDocument(documentData: CreateWritingDocumentData): Promise<any>;
  findDocumentsByStudent(studentId: string, limit?: number): Promise<any[]>;
  updateDocumentContent(documentId: string, content: string): Promise<any>;
  submitDocument(documentId: string): Promise<any>;
  shareDocument(documentId: string, shareSettings: any): Promise<any>;
  
  // Writing Feedback
  generateFeedback(documentId: string, content: string): Promise<any[]>;
  getFeedbackByDocument(documentId: string): Promise<any[]>;
  updateFeedbackStatus(feedbackId: string, status: string): Promise<any>;
  
  // Writing Revisions
  createRevision(documentId: string, revisionData: any): Promise<any>;
  getRevisionsByDocument(documentId: string): Promise<any[]>;
  compareRevisions(documentId: string, version1: number, version2: number): Promise<any>;
  
  // Writing Comments
  addComment(documentId: string, commentData: any): Promise<any>;
  getCommentsByDocument(documentId: string): Promise<any[]>;
  replyToComment(parentCommentId: string, replyData: any): Promise<any>;
  resolveComment(commentId: string): Promise<any>;
  
  // Writing Prompts
  findPromptsByGradeAndType(gradeLevel: string, type: string): Promise<any[]>;
  findPromptsBySubject(subject: string): Promise<any[]>;
  createPrompt(promptData: CreateWritingPromptData): Promise<any>;
  updatePromptPopularity(promptId: string): Promise<any>;
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
  structure: any;
  contentSlots: any;
  scoringRubric: any;
  adaptationRules: any;
  createdBy: string;
}

export interface CreateGameSessionData {
  studentId: string;
  teacherId?: string;
  title: string;
  description?: string;
  generatedContent: any;
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
  problemImages?: any;
  attachments?: any;
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
  instructions?: any;
  rubric?: any;
  requirements?: any;
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
  instructions?: any;
  examples?: any;
  rubric?: any;
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