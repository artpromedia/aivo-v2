// Database migration utilities and helpers

export interface MigrationContext {
  tenantId: string;
  userId: string;
  timestamp: Date;
}

export interface MigrationOptions {
  dryRun?: boolean;
  batchSize?: number;
  skipValidation?: boolean;
}

export interface DataMigration {
  name: string;
  description: string;
  version: string;
  up(context: MigrationContext, options?: MigrationOptions): Promise<void>;
  down(context: MigrationContext, options?: MigrationOptions): Promise<void>;
  validate?(context: MigrationContext): Promise<boolean>;
}

// Seed data for development and testing
export interface SeedData {
  tenants: any[];
  districts: any[];
  schools: any[];
  users: any[];
  subscriptionPlans: any[];
  curriculumStandards: any[];
  // Phase 1 Features
  gameTemplates: any[];
  writingPrompts: any[];
  homeworkResources: any[];
}

// Database utilities
export class DatabaseUtils {
  static async createTenant(data: {
    name: string;
    slug: string;
    region: string;
    timezone?: string;
  }): Promise<any> {
    // Implementation will be added when Prisma client is available
    return Promise.resolve(data);
  }

  static async setupSchoolDistrict(tenantId: string, data: {
    districtName: string;
    schoolName: string;
    adminUser: any;
  }): Promise<{ district: any; school: any; admin: any }> {
    // Implementation will be added when Prisma client is available
    return Promise.resolve({
      district: { id: 'district-1', name: data.districtName },
      school: { id: 'school-1', name: data.schoolName },
      admin: { id: 'admin-1', ...data.adminUser }
    });
  }

  static async cleanupTestData(tenantId: string): Promise<void> {
    // Implementation for cleaning up test data
    console.log(`Cleaning up test data for tenant: ${tenantId}`);
  }

  static generateTestData(): SeedData {
    return {
      tenants: [
        {
          id: 'tenant-1',
          name: 'Demo School District',
          slug: 'demo-district',
          region: 'north_america',
          timezone: 'America/New_York',
          isActive: true,
        }
      ],
      districts: [
        {
          id: 'district-1',
          tenantId: 'tenant-1',
          name: 'Demo School District',
          code: 'DSD001',
          isActive: true,
        }
      ],
      schools: [
        {
          id: 'school-1',
          tenantId: 'tenant-1',
          districtId: 'district-1',
          name: 'Demo Elementary School',
          code: 'DES001',
          type: 'elementary',
          isActive: true,
        },
        {
          id: 'school-2',
          tenantId: 'tenant-1',
          districtId: 'district-1',
          name: 'Demo Middle School',
          code: 'DMS001',
          type: 'middle',
          isActive: true,
        }
      ],
      users: [
        {
          id: 'admin-1',
          tenantId: 'tenant-1',
          email: 'admin@demo.edu',
          firstName: 'System',
          lastName: 'Administrator',
          role: 'platform_admin',
          status: 'active',
          emailVerified: true,
        },
        {
          id: 'teacher-1',
          tenantId: 'tenant-1',
          schoolId: 'school-1',
          email: 'teacher@demo.edu',
          firstName: 'Jane',
          lastName: 'Smith',
          role: 'teacher',
          status: 'active',
          emailVerified: true,
          roleData: {
            teacherId: 'T001',
            specializations: ['general_ed', 'math'],
            yearsExperience: 5,
          }
        },
        {
          id: 'student-1',
          tenantId: 'tenant-1',
          schoolId: 'school-1',
          firstName: 'John',
          lastName: 'Doe',
          role: 'learner',
          status: 'active',
          roleData: {
            studentId: 'S001',
            gradeLevel: '3',
            dateOfBirth: '2014-05-15',
            hasIEP: true,
            hasDisabilities: true,
          }
        }
      ],
      subscriptionPlans: [
        {
          id: 'plan-free',
          name: 'Free Plan',
          tier: 'free',
          description: 'Basic features for small classrooms',
          isActive: true,
          features: {
            maxStudents: 30,
            maxTeachers: 5,
            storageGB: 1,
            aiInteractionsPerMonth: 100,
            personalizedAI: false,
            iepManagement: false,
          },
          pricing: []
        },
        {
          id: 'plan-school',
          name: 'School Plan',
          tier: 'standard',
          description: 'Complete school management solution',
          isActive: true,
          features: {
            maxStudents: 1000,
            maxTeachers: 100,
            storageGB: 100,
            aiInteractionsPerMonth: 10000,
            personalizedAI: true,
            iepManagement: true,
          },
          pricing: [
            {
              region: 'north_america',
              currency: 'USD',
              prices: [
                { cycle: 'monthly', amount: 999, perUnit: 'school' },
                { cycle: 'annual', amount: 9990, perUnit: 'school' }
              ]
            }
          ]
        }
      ],
      curriculumStandards: [
        {
          id: 'ccss-math-3-nbt-1',
          code: 'CCSS.MATH.3.NBT.A.1',
          title: 'Round whole numbers to the nearest 10 or 100',
          description: 'Use place value understanding to round whole numbers to the nearest 10 or 100.',
          framework: 'common_core',
          region: 'north_america',
          country: 'United States',
          subject: 'mathematics',
          gradeLevel: '3',
          domain: 'Number & Operations in Base Ten',
          cluster: 'Use place value understanding and properties of operations to perform multi-digit arithmetic.',
          masteryLevel: 2,
          bloomsLevel: 'apply',
          cognitiveComplexity: 'moderate',
          isActive: true,
        }
      ],
      // Phase 1 Features Seed Data
      gameTemplates: [
        {
          id: 'template-math-addition',
          name: 'Math Addition Adventure',
          description: 'Interactive addition game with visual elements',
          category: 'math',
          type: 'quiz',
          minAge: 6,
          maxAge: 9,
          gradeLevel: 'K-2',
          subject: 'mathematics',
          difficulty: 'easy',
          estimatedDuration: 15,
          isActive: true,
          structure: {
            rounds: 3,
            questionsPerRound: 5,
            timePerQuestion: 30,
            visualAids: true,
            hints: true
          },
          contentSlots: {
            numbers: { min: 1, max: 10 },
            operations: ['addition'],
            contexts: ['toys', 'animals', 'fruits'],
            difficulty_progression: true
          },
          scoringRubric: {
            correct_answer: 10,
            partial_credit: 5,
            time_bonus: 2,
            streak_bonus: 5
          },
          adaptationRules: {
            increase_difficulty: { consecutive_correct: 3 },
            decrease_difficulty: { consecutive_wrong: 2 },
            provide_hint: { wrong_attempts: 1 }
          },
          tags: ['addition', 'visual', 'beginner'],
          createdBy: 'admin-1'
        },
        {
          id: 'template-reading-comprehension',
          name: 'Story Detective',
          description: 'Reading comprehension through interactive stories',
          category: 'reading',
          type: 'story',
          minAge: 8,
          maxAge: 12,
          gradeLevel: '3-5',
          subject: 'english_language_arts',
          difficulty: 'medium',
          estimatedDuration: 20,
          isActive: true,
          structure: {
            story_length: 'medium',
            question_types: ['multiple_choice', 'short_answer'],
            multimedia: true,
            interactive_elements: true
          },
          contentSlots: {
            themes: ['friendship', 'adventure', 'mystery'],
            vocabulary_level: 'grade_appropriate',
            question_focus: ['main_idea', 'details', 'inference'],
            adaptive_vocabulary: true
          },
          scoringRubric: {
            comprehension_questions: 15,
            vocabulary_questions: 10,
            inference_questions: 20,
            completion_bonus: 5
          },
          adaptationRules: {
            vocabulary_support: { reading_level: 'below_grade' },
            additional_questions: { high_performance: true },
            reading_support: { comprehension_struggles: true }
          },
          tags: ['reading', 'comprehension', 'interactive'],
          createdBy: 'admin-1'
        }
      ],
      writingPrompts: [
        {
          id: 'prompt-narrative-adventure',
          title: 'My Greatest Adventure',
          description: 'Write about a real or imaginary adventure you had',
          prompt: 'Think about an exciting adventure you\'ve had or would like to have. It could be exploring a new place, trying something for the first time, or going on an imaginary journey. Describe what happened, how you felt, and what made it special.',
          type: 'narrative',
          gradeLevel: '3-5',
          subject: 'english_language_arts',
          difficulty: 'medium',
          estimatedTime: 30,
          minWords: 150,
          maxWords: 300,
          instructions: {
            structure: ['introduction', 'beginning', 'middle', 'end'],
            elements: ['characters', 'setting', 'problem', 'solution'],
            language: ['descriptive_words', 'action_words', 'dialogue']
          },
          examples: [
            {
              title: 'Sample Opening',
              content: 'The day I discovered the secret garden behind my grandmother\'s house was the most exciting day of my summer...'
            }
          ],
          rubric: {
            creativity: { points: 25, description: 'Original and imaginative ideas' },
            organization: { points: 25, description: 'Clear beginning, middle, and end' },
            details: { points: 25, description: 'Descriptive language and specific details' },
            conventions: { points: 25, description: 'Grammar, spelling, and punctuation' }
          },
          keywords: ['adventure', 'journey', 'exploration', 'discovery', 'excitement'],
          tags: ['narrative', 'personal', 'creative'],
          isActive: true,
          createdBy: 'teacher-1'
        },
        {
          id: 'prompt-expository-animals',
          title: 'Animal Expert Report',
          description: 'Research and write about your favorite animal',
          prompt: 'Choose an animal that interests you and become an expert! Research your animal and write a report that teaches others about it. Include information about where it lives, what it eats, how it behaves, and why it\'s special.',
          type: 'expository',
          gradeLevel: '2-4',
          subject: 'science',
          difficulty: 'medium',
          estimatedTime: 45,
          minWords: 100,
          maxWords: 250,
          instructions: {
            structure: ['introduction', 'body_paragraphs', 'conclusion'],
            research: ['facts', 'habitat', 'diet', 'behavior', 'interesting_facts'],
            sources: ['books', 'websites', 'videos']
          },
          examples: [
            {
              title: 'Sample Introduction',
              content: 'Did you know that dolphins are one of the smartest animals in the ocean? Let me tell you amazing facts about these incredible creatures...'
            }
          ],
          rubric: {
            information: { points: 30, description: 'Accurate and relevant facts' },
            organization: { points: 25, description: 'Clear structure and logical flow' },
            research: { points: 25, description: 'Evidence of research from multiple sources' },
            conventions: { points: 20, description: 'Grammar, spelling, and punctuation' }
          },
          keywords: ['research', 'facts', 'animals', 'habitat', 'behavior'],
          tags: ['expository', 'research', 'science'],
          isActive: true,
          createdBy: 'teacher-1'
        }
      ],
      homeworkResources: [
        {
          id: 'resource-math-fractions',
          title: 'Understanding Fractions',
          description: 'Interactive tutorial on basic fraction concepts',
          type: 'interactive',
          subject: 'mathematics',
          gradeLevel: '3-5',
          topics: ['fractions', 'parts_of_whole', 'equivalent_fractions'],
          skills: ['fraction_identification', 'fraction_comparison', 'visual_representation'],
          content: 'https://example.com/fractions-tutorial',
          duration: 15,
          difficulty: 'medium',
          isInteractive: true,
          isRecommended: true,
          isPublic: true,
          rating: 4.5,
          engagementScore: 0.85,
          createdBy: 'teacher-1'
        },
        {
          id: 'resource-reading-strategies',
          title: 'Reading Comprehension Strategies',
          description: 'Video tutorial on effective reading strategies',
          type: 'video',
          subject: 'english_language_arts',
          gradeLevel: '2-6',
          topics: ['reading_comprehension', 'reading_strategies', 'text_analysis'],
          skills: ['main_idea', 'supporting_details', 'inference', 'summarizing'],
          url: 'https://example.com/reading-strategies-video',
          duration: 12,
          difficulty: 'medium',
          isInteractive: false,
          isRecommended: true,
          isPublic: true,
          rating: 4.8,
          engagementScore: 0.92,
          createdBy: 'teacher-1'
        },
        {
          id: 'resource-science-experiments',
          title: 'Simple Science Experiments',
          description: 'Collection of easy science experiments for home',
          type: 'article',
          subject: 'science',
          gradeLevel: 'K-5',
          topics: ['scientific_method', 'experiments', 'observations'],
          skills: ['hypothesis_formation', 'data_collection', 'conclusion_drawing'],
          content: `# Simple Science Experiments You Can Do at Home

## Experiment 1: Dancing Raisins
**Materials:** Clear soda, raisins
**Instructions:** Drop raisins into clear soda and watch them dance!
**What happens:** The bubbles attach to the raisins, making them float up and down.

## Experiment 2: Rainbow in a Jar
**Materials:** Honey, dish soap, water, food coloring
**Instructions:** Carefully layer different density liquids to create a rainbow effect.`,
          duration: 30,
          difficulty: 'easy',
          isInteractive: false,
          isRecommended: true,
          isPublic: true,
          rating: 4.6,
          engagementScore: 0.78,
          createdBy: 'teacher-1'
        }
      ]
    };
  }
}

// Migration helpers are exported above with their definitions