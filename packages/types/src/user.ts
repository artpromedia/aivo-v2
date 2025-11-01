import type { UUID, Email, PhoneNumber, Timestamp, Status, GradeLevel, ConsentRecord } from './common';

// User role hierarchy
export enum UserRole {
  // Student
  LEARNER = 'learner',
  
  // Family
  PARENT = 'parent',
  GUARDIAN = 'guardian',
  
  // Education staff
  TEACHER = 'teacher',
  COUNSELOR = 'counselor',
  SPECIALIST = 'specialist',
  PRINCIPAL = 'principal',
  
  // District level
  DISTRICT_ADMIN = 'district_admin',
  DISTRICT_SUPER = 'district_super',
  
  // Platform level
  PLATFORM_ADMIN = 'platform_admin',
  PLATFORM_SUPER = 'platform_super',
  
  // Support
  SUPPORT = 'support',
  DEVELOPER = 'developer',
}

// Permission system
export enum Permission {
  // Student data
  VIEW_STUDENT_DATA = 'view_student_data',
  EDIT_STUDENT_DATA = 'edit_student_data',
  DELETE_STUDENT_DATA = 'delete_student_data',
  
  // Assessment
  VIEW_ASSESSMENTS = 'view_assessments',
  CREATE_ASSESSMENTS = 'create_assessments',
  GRADE_ASSESSMENTS = 'grade_assessments',
  
  // IEP
  VIEW_IEP = 'view_iep',
  EDIT_IEP = 'edit_iep',
  APPROVE_IEP = 'approve_iep',
  
  // AI Models
  VIEW_AI_MODELS = 'view_ai_models',
  TRAIN_AI_MODELS = 'train_ai_models',
  DEPLOY_AI_MODELS = 'deploy_ai_models',
  
  // Administrative
  MANAGE_USERS = 'manage_users',
  MANAGE_SUBSCRIPTIONS = 'manage_subscriptions',
  VIEW_ANALYTICS = 'view_analytics',
  MANAGE_CURRICULUM = 'manage_curriculum',
  
  // Platform
  PLATFORM_CONFIG = 'platform_config',
  SYSTEM_ADMIN = 'system_admin',
}

// Base user interface
export interface BaseUser {
  id: UUID;
  email?: Email;
  phoneNumber?: PhoneNumber;
  firstName: string;
  lastName: string;
  displayName?: string;
  avatar?: string;
  role: UserRole;
  status: Status;
  lastLoginAt?: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  deletedAt?: Timestamp;
}

// Learner-specific types
export interface Learner extends BaseUser {
  role: UserRole.LEARNER;
  studentId: string;
  gradeLevel: GradeLevel;
  dateOfBirth: string; // YYYY-MM-DD format for privacy
  schoolId: UUID;
  classroomIds: UUID[];
  parentIds: UUID[];
  hasIEP: boolean;
  hasDisabilities: boolean;
  preferredLanguage: string;
  timezone: string;
  consentRecords: ConsentRecord[];
  aiModelId?: UUID;
}

// Parent/Guardian types
export interface Parent extends BaseUser {
  role: UserRole.PARENT | UserRole.GUARDIAN;
  relationshipType: 'parent' | 'guardian' | 'foster' | 'relative' | 'other';
  studentIds: UUID[];
  primaryContact: boolean;
  emergencyContact: boolean;
  canPickup: boolean;
  receiveNotifications: boolean;
  preferredContactMethod: 'email' | 'phone' | 'sms' | 'app';
}

// Teacher types
export enum TeacherSpecialization {
  GENERAL_ED = 'general_ed',
  SPECIAL_ED = 'special_ed',
  MATH = 'math',
  SCIENCE = 'science',
  ENGLISH = 'english',
  SOCIAL_STUDIES = 'social_studies',
  ART = 'art',
  MUSIC = 'music',
  PE = 'pe',
  ESL = 'esl',
  COUNSELING = 'counseling',
  SPEECH_THERAPY = 'speech_therapy',
  OCCUPATIONAL_THERAPY = 'occupational_therapy',
  PHYSICAL_THERAPY = 'physical_therapy',
}

export interface Teacher extends BaseUser {
  role: UserRole.TEACHER | UserRole.COUNSELOR | UserRole.SPECIALIST | UserRole.PRINCIPAL;
  teacherId: string;
  specializations: TeacherSpecialization[];
  schoolId: UUID;
  districtId: UUID;
  classroomIds: UUID[];
  licenseNumber?: string;
  certifications: string[];
  yearsExperience: number;
  canAccessIEP: boolean;
  canCreateAssessments: boolean;
}

// District Admin types
export interface DistrictAdmin extends BaseUser {
  role: UserRole.DISTRICT_ADMIN | UserRole.DISTRICT_SUPER;
  districtId: UUID;
  managedSchoolIds: UUID[];
  permissions: Permission[];
  canManageTeachers: boolean;
  canViewReports: boolean;
  canManageSubscription: boolean;
}

// Platform Admin types
export interface PlatformAdmin extends BaseUser {
  role: UserRole.PLATFORM_ADMIN | UserRole.PLATFORM_SUPER | UserRole.SUPPORT | UserRole.DEVELOPER;
  permissions: Permission[];
  accessLevel: number; // 1-10 scale
  canAccessAllTenants: boolean;
  canManageSystem: boolean;
}

// Union type for all users
export type User = Learner | Parent | Teacher | DistrictAdmin | PlatformAdmin;

// User creation DTOs
export interface CreateLearnerInput {
  email?: Email;
  phoneNumber?: PhoneNumber;
  firstName: string;
  lastName: string;
  studentId: string;
  gradeLevel: GradeLevel;
  dateOfBirth: string;
  schoolId: UUID;
  parentIds: UUID[];
  hasIEP?: boolean;
  hasDisabilities?: boolean;
  preferredLanguage?: string;
  timezone?: string;
}

export interface CreateParentInput {
  email?: Email;
  phoneNumber?: PhoneNumber;
  firstName: string;
  lastName: string;
  relationshipType: Parent['relationshipType'];
  primaryContact?: boolean;
  emergencyContact?: boolean;
  canPickup?: boolean;
  receiveNotifications?: boolean;
  preferredContactMethod?: Parent['preferredContactMethod'];
}

export interface CreateTeacherInput {
  email: Email;
  phoneNumber?: PhoneNumber;
  firstName: string;
  lastName: string;
  teacherId: string;
  specializations: TeacherSpecialization[];
  schoolId: UUID;
  districtId: UUID;
  licenseNumber?: string;
  certifications?: string[];
  yearsExperience?: number;
}

// User session and authentication
export interface UserSession {
  userId: UUID;
  sessionId: UUID;
  role: UserRole;
  permissions: Permission[];
  schoolId?: UUID;
  districtId?: UUID;
  tenantId: UUID;
  expiresAt: Timestamp;
  lastActivityAt: Timestamp;
  ipAddress?: string;
  userAgent?: string;
}