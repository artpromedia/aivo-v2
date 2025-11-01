import type { UUID, Timestamp, GradeLevel } from './common';
import { Region } from './common';
import type { Subject } from './assessment';

// Curriculum standards and frameworks
export enum CurriculumFramework {
  COMMON_CORE = 'common_core',
  NEXT_GEN_SCIENCE = 'next_gen_science',
  STATE_STANDARDS = 'state_standards',
  INTERNATIONAL_BACCALAUREATE = 'international_baccalaureate',
  CAMBRIDGE = 'cambridge',
  AUSTRALIAN_CURRICULUM = 'australian_curriculum',
  BRITISH_CURRICULUM = 'british_curriculum',
  FRENCH_CURRICULUM = 'french_curriculum',
  GERMAN_CURRICULUM = 'german_curriculum',
  SINGAPORE_CURRICULUM = 'singapore_curriculum',
  SOUTH_AFRICAN_CAPS = 'south_african_caps',
  KENYAN_CURRICULUM = 'kenyan_curriculum',
  NIGERIAN_CURRICULUM = 'nigerian_curriculum',
  CUSTOM = 'custom',
}

// Regional curriculum specifications
export interface RegionalCurriculum {
  region: Region;
  country: string;
  state?: string;
  frameworks: CurriculumFramework[];
  languages: string[];
  assessmentTypes: string[];
  complianceRequirements: string[];
}

// Curriculum mapping for different regions
export const REGIONAL_CURRICULA: Record<Region, RegionalCurriculum[]> = {
  [Region.NORTH_AMERICA]: [
    {
      region: Region.NORTH_AMERICA,
      country: 'United States',
      frameworks: [CurriculumFramework.COMMON_CORE, CurriculumFramework.NEXT_GEN_SCIENCE, CurriculumFramework.STATE_STANDARDS],
      languages: ['en-US', 'es-US'],
      assessmentTypes: ['SBAC', 'PARCC', 'State Tests'],
      complianceRequirements: ['COPPA', 'FERPA', 'IDEA'],
    },
    {
      region: Region.NORTH_AMERICA,
      country: 'Canada',
      frameworks: [CurriculumFramework.STATE_STANDARDS],
      languages: ['en-CA', 'fr-CA'],
      assessmentTypes: ['Provincial Tests'],
      complianceRequirements: ['PIPEDA', 'Provincial Privacy Acts'],
    },
  ],
  [Region.EUROPE]: [
    {
      region: Region.EUROPE,
      country: 'United Kingdom',
      frameworks: [CurriculumFramework.BRITISH_CURRICULUM, CurriculumFramework.CAMBRIDGE],
      languages: ['en-GB'],
      assessmentTypes: ['GCSE', 'A-Levels', 'SATs'],
      complianceRequirements: ['GDPR', 'UK GDPR'],
    },
    {
      region: Region.EUROPE,
      country: 'Germany',
      frameworks: [CurriculumFramework.GERMAN_CURRICULUM],
      languages: ['de-DE'],
      assessmentTypes: ['Abitur', 'Mittlere Reife'],
      complianceRequirements: ['GDPR', 'BDSG'],
    },
  ],
  [Region.AUSTRALIA]: [
    {
      region: Region.AUSTRALIA,
      country: 'Australia',
      frameworks: [CurriculumFramework.AUSTRALIAN_CURRICULUM],
      languages: ['en-AU'],
      assessmentTypes: ['NAPLAN', 'ATAR'],
      complianceRequirements: ['Privacy Act 1988'],
    },
  ],
  [Region.ASIA]: [
    {
      region: Region.ASIA,
      country: 'Singapore',
      frameworks: [CurriculumFramework.SINGAPORE_CURRICULUM, CurriculumFramework.CAMBRIDGE],
      languages: ['en-SG', 'zh-SG', 'ms-SG', 'ta-SG'],
      assessmentTypes: ['PSLE', 'O-Levels', 'A-Levels'],
      complianceRequirements: ['PDPA'],
    },
  ],
  [Region.AFRICA]: [
    {
      region: Region.AFRICA,
      country: 'South Africa',
      frameworks: [CurriculumFramework.SOUTH_AFRICAN_CAPS],
      languages: ['en-ZA', 'af-ZA', 'zu-ZA', 'xh-ZA'],
      assessmentTypes: ['NSC', 'ANA'],
      complianceRequirements: ['POPIA'],
    },
    {
      region: Region.AFRICA,
      country: 'Kenya',
      frameworks: [CurriculumFramework.KENYAN_CURRICULUM],
      languages: ['en-KE', 'sw-KE'],
      assessmentTypes: ['KCPE', 'KCSE'],
      complianceRequirements: ['Data Protection Act 2019'],
    },
  ],
  [Region.MIDDLE_EAST]: [],
};

// Curriculum standard definition
export interface CurriculumStandard {
  id: UUID;
  code: string; // Official standard code
  title: string;
  description: string;
  framework: CurriculumFramework;
  region: Region;
  country: string;
  state?: string;
  subject: Subject;
  gradeLevel: GradeLevel;
  domain: string;
  cluster?: string;
  subCluster?: string;
  learningObjectives: string[];
  prerequisites: UUID[]; // IDs of prerequisite standards
  masteryLevel: number; // 1-4 scale
  bloomsLevel: 'remember' | 'understand' | 'apply' | 'analyze' | 'evaluate' | 'create';
  cognitiveComplexity: 'low' | 'moderate' | 'high';
  tags: string[];
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Curriculum unit and lesson structure
export interface CurriculumUnit {
  id: UUID;
  title: string;
  description: string;
  framework: CurriculumFramework;
  subject: Subject;
  gradeLevel: GradeLevel;
  standardIds: UUID[];
  estimatedDuration: number; // in hours
  prerequisiteUnits: UUID[];
  learningGoals: string[];
  essentialQuestions: string[];
  vocabulary: {
    term: string;
    definition: string;
    examples?: string[];
  }[];
  assessmentTypes: string[];
  resources: {
    type: 'text' | 'video' | 'interactive' | 'game' | 'worksheet';
    title: string;
    url?: string;
    description: string;
  }[];
  accommodations: {
    type: string;
    description: string;
    applicableDisabilities: string[];
  }[];
  isActive: boolean;
  createdBy: UUID;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Individual lesson within a unit
export interface CurriculumLesson {
  id: UUID;
  unitId: UUID;
  title: string;
  description: string;
  objectives: string[];
  duration: number; // minutes
  sequence: number;
  activities: {
    id: UUID;
    title: string;
    type: 'warm_up' | 'instruction' | 'guided_practice' | 'independent_practice' | 'assessment' | 'closure';
    duration: number;
    description: string;
    materials: string[];
    instructions: string[];
  }[];
  materials: string[];
  homework?: string;
  extensions: string[];
  assessmentOpportunities: string[];
  differentiationStrategies: {
    level: 'below' | 'at' | 'above';
    strategies: string[];
  }[];
  technologyIntegration?: {
    tools: string[];
    purpose: string;
  };
}

// Curriculum progression and scope & sequence
export interface CurriculumProgression {
  id: UUID;
  framework: CurriculumFramework;
  subject: Subject;
  startGrade: GradeLevel;
  endGrade: GradeLevel;
  progression: {
    gradeLevel: GradeLevel;
    units: {
      unitId: UUID;
      quarter: 1 | 2 | 3 | 4;
      weeks: number;
      priority: 'essential' | 'important' | 'supplemental';
    }[];
  }[];
  verticalAlignment: {
    concept: string;
    gradeProgressions: {
      grade: GradeLevel;
      expectation: string;
      complexity: number;
    }[];
  }[];
}

// Curriculum alignment and mapping
export interface StandardAlignment {
  id: UUID;
  sourceStandardId: UUID;
  targetStandardId: UUID;
  alignmentType: 'equivalent' | 'subset' | 'superset' | 'related' | 'prerequisite';
  confidence: number; // 0-1 scale
  notes?: string;
  reviewedBy: UUID;
  reviewedAt: Timestamp;
}

// Curriculum customization for schools/districts
export interface CurriculumCustomization {
  id: UUID;
  schoolId?: UUID;
  districtId?: UUID;
  baseFramework: CurriculumFramework;
  customizations: {
    standardId: UUID;
    action: 'add' | 'modify' | 'remove' | 'reorder';
    details: Record<string, any>;
    reason: string;
    approvedBy: UUID;
    approvedAt: Timestamp;
  }[];
  pacingGuides: {
    subject: Subject;
    gradeLevel: GradeLevel;
    calendar: {
      week: number;
      unitIds: UUID[];
          standards: UUID[];
      assessments?: UUID[];
    }[];
  }[];
  isActive: boolean;
  createdBy: UUID;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Curriculum analytics and reporting
export interface CurriculumAnalytics {
  id: UUID;
  schoolId?: UUID;
  districtId?: UUID;
  framework: CurriculumFramework;
  subject: Subject;
  gradeLevel: GradeLevel;
  timeframe: {
    start: Timestamp;
    end: Timestamp;
  };
  coverage: {
    standardId: UUID;
    taught: boolean;
    assessed: boolean;
    mastered: boolean;
    masteryRate: number;
  }[];
  pacing: {
    unitId: UUID;
    plannedWeeks: number;
    actualWeeks: number;
    variance: number;
  }[];
  studentOutcomes: {
    standardId: UUID;
    averageScore: number;
    masteryRate: number;
    strugglingStudents: number;
  }[];
  recommendations: {
    type: 'pacing' | 'instruction' | 'assessment' | 'intervention';
    priority: 'high' | 'medium' | 'low';
    description: string;
    standardsAffected: UUID[];
  }[];
  generatedAt: Timestamp;
}