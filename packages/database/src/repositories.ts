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

// Repository factory interface
export interface RepositoryFactory {
  createUserRepository(): UserRepository;
  createAssessmentRepository(): AssessmentRepository;
  createIEPRepository(): IEPRepository;
  createAIModelRepository(): AIModelRepository;
  createSubscriptionRepository(): SubscriptionRepository;
}