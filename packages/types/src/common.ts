// Base types
export type UUID = string;
export type Email = string;
export type PhoneNumber = string;
export type Timestamp = Date | string;

// Geographic regions
export enum Region {
  NORTH_AMERICA = 'north_america',
  EUROPE = 'europe',
  AFRICA = 'africa',
  ASIA = 'asia',
  MIDDLE_EAST = 'middle_east',
  AUSTRALIA = 'australia',
}

// Grade levels
export enum GradeLevel {
  K = 'K',
  GRADE_1 = '1',
  GRADE_2 = '2',
  GRADE_3 = '3',
  GRADE_4 = '4',
  GRADE_5 = '5',
  GRADE_6 = '6',
  GRADE_7 = '7',
  GRADE_8 = '8',
  GRADE_9 = '9',
  GRADE_10 = '10',
  GRADE_11 = '11',
  GRADE_12 = '12',
}

// Age groups for UI theming
export enum AgeGroup {
  ELEMENTARY = 'elementary', // K-5
  MIDDLE = 'middle',         // 6-8
  HIGH = 'high',            // 9-12
}

export const gradeToAgeGroup = (grade: GradeLevel): AgeGroup => {
  const elementaryGrades = [GradeLevel.K, GradeLevel.GRADE_1, GradeLevel.GRADE_2, GradeLevel.GRADE_3, GradeLevel.GRADE_4, GradeLevel.GRADE_5];
  const middleGrades = [GradeLevel.GRADE_6, GradeLevel.GRADE_7, GradeLevel.GRADE_8];
  
  if (elementaryGrades.includes(grade)) return AgeGroup.ELEMENTARY;
  if (middleGrades.includes(grade)) return AgeGroup.MIDDLE;
  return AgeGroup.HIGH;
};

// Common status enums
export enum Status {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending',
  SUSPENDED = 'suspended',
  ARCHIVED = 'archived',
}

// Privacy and compliance
export enum ConsentType {
  COPPA = 'coppa',
  FERPA = 'ferpa',
  GDPR = 'gdpr',
  PIPEDA = 'pipeda',
}

export interface ConsentRecord {
  type: ConsentType;
  granted: boolean;
  grantedAt: Timestamp;
  grantedBy: UUID; // Parent/Guardian ID
  ipAddress?: string;
  userAgent?: string;
}