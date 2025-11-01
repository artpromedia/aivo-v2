import type { UUID, Timestamp, GradeLevel } from './common';
import type { Subject } from './assessment';
import type { UserRole } from './user';

// IEP (Individualized Education Program) Status and Types
export enum IEPStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  UNDER_REVIEW = 'under_review',
  EXPIRED = 'expired',
  SUSPENDED = 'suspended',
  TERMINATED = 'terminated',
}

export enum DisabilityCategory {
  // Federal IDEA Categories
  AUTISM = 'autism',
  DEAF_BLINDNESS = 'deaf_blindness', 
  DEAFNESS = 'deafness',
  DEVELOPMENTAL_DELAY = 'developmental_delay',
  EMOTIONAL_DISTURBANCE = 'emotional_disturbance',
  HEARING_IMPAIRMENT = 'hearing_impairment',
  INTELLECTUAL_DISABILITY = 'intellectual_disability',
  MULTIPLE_DISABILITIES = 'multiple_disabilities',
  ORTHOPEDIC_IMPAIRMENT = 'orthopedic_impairment',
  OTHER_HEALTH_IMPAIRMENT = 'other_health_impairment',
  SPECIFIC_LEARNING_DISABILITY = 'specific_learning_disability',
  SPEECH_LANGUAGE_IMPAIRMENT = 'speech_language_impairment',
  TRAUMATIC_BRAIN_INJURY = 'traumatic_brain_injury',
  VISUAL_IMPAIRMENT = 'visual_impairment',
}

export enum ServiceType {
  SPECIAL_EDUCATION = 'special_education',
  SPEECH_THERAPY = 'speech_therapy',
  OCCUPATIONAL_THERAPY = 'occupational_therapy',
  PHYSICAL_THERAPY = 'physical_therapy',
  COUNSELING = 'counseling',
  SOCIAL_WORK = 'social_work',
  PSYCHOLOGY = 'psychology',
  AUDIOLOGY = 'audiology',
  ASSISTIVE_TECHNOLOGY = 'assistive_technology',
  TRANSPORTATION = 'transportation',
  NURSING = 'nursing',
  ORIENTATION_MOBILITY = 'orientation_mobility',
  VISION_SERVICES = 'vision_services',
  DEAF_HARD_OF_HEARING = 'deaf_hard_of_hearing',
}

// Main IEP Document Structure
export interface IEP {
  id: UUID;
  studentId: UUID;
  schoolId: UUID;
  districtId: UUID;
  status: IEPStatus;
  
  // Basic Information
  studentInfo: {
    name: string;
    dateOfBirth: string;
    gradeLevel: GradeLevel;
    primaryDisability: DisabilityCategory;
    secondaryDisabilities: DisabilityCategory[];
    primaryLanguage: string;
    communicationNeeds?: string;
  };
  
  // IEP Dates and Timeline
  dates: {
    initialReferralDate: string;
    initialEvaluationDate: string;
    eligibilityDate: string;
    initialIEPDate: string;
    currentIEPStartDate: string;
    currentIEPEndDate: string;
    nextAnnualReviewDate: string;
    nextTriennialEvaluationDate: string;
    lastRevisionDate?: string;
  };
  
  // Present Levels of Academic Achievement and Functional Performance (PLAAFP)
  presentLevels: {
    academic: {
      subject: Subject;
      currentLevel: string;
      strengths: string[];
      concerns: string[];
      assessmentData: {
        assessmentName: string;
        date: string;
        results: string;
      }[];
    }[];
    functional: {
      domain: 'communication' | 'social_emotional' | 'behavioral' | 'motor' | 'adaptive' | 'sensory';
      currentLevel: string;
      strengths: string[];
      concerns: string[];
    }[];
    howDisabilityAffects: string;
    parentConcerns: string[];
  };
  
  // Annual Goals and Objectives
  goals: IEPGoal[];
  
  // Special Education and Related Services
  services: IEPService[];
  
  // Least Restrictive Environment (LRE) and Placement
  placement: {
    leastRestrictiveEnvironment: string;
    percentTimeInGenEd: number;
    percentTimeInSpecialEd: number;
    percentTimeInSeparateSettings: number;
    removalJustification?: string;
    supplementaryAidsServices: string[];
    programModifications: string[];
    supportForPersonnel: string[];
  };
  
  // Assessment Accommodations
  assessmentAccommodations: {
    stateAssessments: {
      participates: boolean;
      accommodations: string[];
      alternativeAssessment?: string;
      nonParticipationReason?: string;
    };
    districtAssessments: {
      accommodations: string[];
      modifications: string[];
    };
  };
  
  // Extended School Year (ESY)
  extendedSchoolYear: {
    required: boolean;
    justification?: string;
    services?: string[];
    duration?: string;
  };
  
  // Transition Services (for students 14+)
  transition?: {
    postSecondaryGoals: {
      education: string;
      employment: string;
      independentLiving?: string;
    };
    transitionServices: string[];
    agencyResponsibilities: {
      agency: string;
      responsibility: string;
    }[];
    courseOfStudy: string;
  };
  
  // Team Members and Signatures
  team: IEPTeamMember[];
  
  // Parent/Student Input
  parentInput: string;
  studentInput?: string;
  
  // Behavior Intervention Plan (if applicable)
  behaviorPlan?: BehaviorInterventionPlan;
  
  // Metadata
  createdBy: UUID;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  approvedAt?: Timestamp;
  approvedBy?: UUID;
}

// IEP Goals Structure
export interface IEPGoal {
  id: UUID;
  iepId: UUID;
  domain: 'academic' | 'functional' | 'behavioral' | 'communication' | 'social_emotional' | 'motor' | 'vocational' | 'transition';
  subject?: Subject;
  description: string;
  measurableAnnualGoal: string;
  
  // SMART Goal Components
  specific: string;
  measurable: {
    criteria: string;
    method: string;
    schedule: string;
  };
  achievable: boolean;
  relevant: string;
  timeBound: string;
  
  // Short-term Objectives (for students with significant cognitive disabilities)
  objectives: {
    id: UUID;
    description: string;
    criteria: string;
    method: string;
    schedule: string;
    completed: boolean;
    completedDate?: string;
  }[];
  
  // Progress Monitoring
  progressReporting: {
    method: string;
    frequency: string;
    responsiblePerson: UUID;
  };
  
  // Current Progress Data
  progress: {
    reportingPeriod: string;
    date: string;
    progressToward: 'sufficient' | 'insufficient' | 'no_progress';
    data: string;
    notes: string;
    reportedBy: UUID;
  }[];
  
  // Goal Status
  status: 'active' | 'mastered' | 'discontinued' | 'modified';
  masteryDate?: string;
  
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// IEP Services Structure  
export interface IEPService {
  id: UUID;
  iepId: UUID;
  type: ServiceType;
  description: string;
  
  // Service Details
  frequency: {
    amount: number;
    unit: 'minutes' | 'hours';
    per: 'day' | 'week' | 'month' | 'year';
  };
  
  duration: {
    amount: number;
    unit: 'minutes' | 'hours' | 'days' | 'weeks' | 'months';
  };
  
  location: 'general_education' | 'special_education' | 'separate_facility' | 'home' | 'community' | 'other';
  locationDetails?: string;
  
  // Service Provider
  provider: {
    userId?: UUID;
    title: string;
    qualifications: string[];
  };
  
  // Service Dates
  startDate: string;
  endDate: string;
  
  // Progress Tracking
  progressNotes: {
    id: UUID;
    date: string;
    note: string;
    providerId: UUID;
    createdAt: Timestamp;
  }[];
  
  status: 'active' | 'completed' | 'discontinued';
  
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// IEP Team Members
export interface IEPTeamMember {
  userId?: UUID;
  name: string;
  role: UserRole | 'parent' | 'student' | 'advocate' | 'interpreter' | 'other';
  title: string;
  qualifications?: string[];
  relationship?: string; // for parents/advocates
  participationType: 'required' | 'invited' | 'excused_written_input' | 'excused_no_input';
  attended: boolean;
  signedDate?: string;
  comments?: string;
}

// Behavior Intervention Plan
export interface BehaviorInterventionPlan {
  id: UUID;
  iepId: UUID;
  
  // Target Behaviors
  targetBehaviors: {
    behavior: string;
    operationalDefinition: string;
    frequency: string;
    intensity: string;
    duration: string;
    antecedents: string[];
    consequences: string[];
  }[];
  
  // Replacement Behaviors
  replacementBehaviors: {
    behavior: string;
    teachingStrategies: string[];
    reinforcement: string[];
  }[];
  
  // Intervention Strategies
  interventions: {
    proactive: string[];
    reactive: string[];
    environmental: string[];
    instructional: string[];
  };
  
  // Crisis Procedures
  crisisProcedures?: {
    triggers: string[];
    procedures: string[];
    contacts: {
      name: string;
      role: string;
      phone: string;
    }[];
  };
  
  // Data Collection
  dataCollection: {
    method: string;
    frequency: string;
    responsiblePerson: UUID;
  };
  
  // Progress Data
  progressData: {
    date: string;
    frequency: number;
    intensity: number;
    duration: number;
    notes: string;
    collectedBy: UUID;
  }[];
  
  // Review Information
  reviewDate: string;
  effectiveDate: string;
  lastReviewDate?: string;
  
  createdBy: UUID;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// IEP Meeting and Documentation
export interface IEPMeeting {
  id: UUID;
  iepId: UUID;
  type: 'initial' | 'annual_review' | 'reevaluation' | 'revision' | 'transition' | 'manifestation_determination';
  
  // Meeting Details
  scheduledDate: Timestamp;
  actualDate?: Timestamp;
  duration?: number; // minutes
  location: string;
  method: 'in_person' | 'virtual' | 'hybrid';
  
  // Attendees
  attendees: {
    teamMemberId: UUID;
    attended: boolean;
    late?: number; // minutes late
    leftEarly?: number; // minutes before end
    excusedReason?: string;
  }[];
  
  // Meeting Agenda and Outcomes
  agenda: string[];
  discussionPoints: string[];
  decisions: {
    item: string;
    decision: string;
    rationale: string;
    votingRecord?: {
      memberId: UUID;
      vote: 'agree' | 'disagree' | 'abstain';
    }[];
  }[];
  
  // Parent Participation
  parentNotification: {
    method: 'mail' | 'email' | 'phone' | 'in_person';
    date: string;
    response?: 'accept' | 'decline' | 'reschedule';
  }[];
  
  parentRights: {
    provided: boolean;
    method: 'written' | 'oral' | 'both';
    language: string;
  };
  
  // Meeting Documentation
  minutes: string;
  followUpActions: {
    action: string;
    responsiblePerson: UUID;
    dueDate: string;
    completed: boolean;
    completedDate?: string;
  }[];
  
  // Next Steps
  nextMeetingDate?: Timestamp;
  nextMeetingType?: string;
  
  createdBy: UUID;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// IEP Analytics and Reporting
export interface IEPAnalytics {
  schoolId?: UUID;
  districtId?: UUID;
  timeframe: {
    start: Timestamp;
    end: Timestamp;
  };
  
  // Enrollment Data
  enrollment: {
    totalStudents: number;
    studentsWithIEP: number;
    percentageWithIEP: number;
    byDisability: Record<DisabilityCategory, number>;
    byGrade: Record<GradeLevel, number>;
  };
  
  // Compliance Metrics
  compliance: {
    timeliness: {
      initialEvaluations: number; // % completed within 60 days
      iepDevelopment: number; // % completed within 30 days
      annualReviews: number; // % completed on time
      triennialEvaluations: number; // % completed on time
    };
    leastRestrictiveEnvironment: {
      averageInclusionPercentage: number;
      studentsByPlacement: Record<string, number>;
    };
    transitionServices: {
      studentsReceivingServices: number;
      postSecondaryOutcomes: Record<string, number>;
    };
  };
  
  // Goal Progress
  goalProgress: {
    totalGoals: number;
    goalsMastered: number;
    goalsInProgress: number;
    goalsModified: number;
    averageProgressRate: number;
  };
  
  // Service Delivery
  serviceDelivery: {
    totalMinutes: number;
    servicesByType: Record<ServiceType, number>;
    providerWorkload: {
      providerId: UUID;
      caseload: number;
      totalMinutes: number;
    }[];
  };
  
  generatedAt: Timestamp;
}