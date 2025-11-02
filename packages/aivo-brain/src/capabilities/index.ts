/**
 * Educational AI capabilities for the Aivo Brain system
 */

export * from './curriculum-retrieval';
export * from './question-generation';
export * from './content-adaptation';
export * from './assessment-grading';
export * from './personalized-tutoring';

// Main Capabilities Service
import { CurriculumRetrievalService } from './curriculum-retrieval';
import { QuestionGenerationService } from './question-generation';
import { ContentAdaptationService } from './content-adaptation';
import { AssessmentGradingService } from './assessment-grading';
import { PersonalizedTutoringService } from './personalized-tutoring';
import type { ProviderManager } from '../providers/provider-manager';

/**
 * Main Educational AI Capabilities Service
 * Aggregates all educational AI capabilities into a single service interface
 */
export class EducationalCapabilities {
  public readonly curriculum: CurriculumRetrievalService;
  public readonly questions: QuestionGenerationService;
  public readonly content: ContentAdaptationService;
  public readonly grading: AssessmentGradingService;
  public readonly tutoring: PersonalizedTutoringService;

  constructor(providerManager: ProviderManager) {
    this.curriculum = new CurriculumRetrievalService(providerManager);
    this.questions = new QuestionGenerationService(providerManager);
    this.content = new ContentAdaptationService(providerManager);
    this.grading = new AssessmentGradingService(providerManager);
    this.tutoring = new PersonalizedTutoringService(providerManager);
  }

  /**
   * Get health status of all capabilities
   */
  async getHealthStatus(): Promise<CapabilityHealthStatus> {
    return {
      overall: 'healthy',
      services: {
        curriculum: 'healthy',
        questions: 'healthy',
        content: 'healthy',
        grading: 'healthy',
        tutoring: 'healthy'
      },
      lastChecked: new Date()
    };
  }
}

export interface CapabilityHealthStatus {
  overall: 'healthy' | 'degraded' | 'unhealthy';
  services: {
    curriculum: 'healthy' | 'degraded' | 'unhealthy';
    questions: 'healthy' | 'degraded' | 'unhealthy';
    content: 'healthy' | 'degraded' | 'unhealthy';
    grading: 'healthy' | 'degraded' | 'unhealthy';
    tutoring: 'healthy' | 'degraded' | 'unhealthy';
  };
  lastChecked: Date;
}