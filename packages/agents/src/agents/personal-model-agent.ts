import { v4 as uuidv4 } from 'uuid';
import { cloneDeep, merge } from 'lodash';
import { BaseAgent } from './base-agent';
import type {
  AssessmentReport,
  PersonalModelUpdate,
  PersonalModelAgentInterface,
  AgentConfig,
  AgentContext
} from '../types';
import {
  AgentType,
  AssessmentDomain,
  LearningStyle
} from '../types';
import type { AivoBrain } from '@aivo/aivo-brain';

/**
 * PersonalModelAgent - Manages personalized learning models for individual students
 * 
 * Features:
 * - Clone configuration from baseline assessment results
 * - Adaptive learning style recognition and adjustment
 * - Dynamic pacing adjustment based on performance
 * - Content personalization based on interests and abilities
 * - Comprehensive interaction memory system
 * - Progress monitoring with intelligent insights
 * - Personalized suggestions for parents and teachers
 */
export class PersonalModelAgent extends BaseAgent implements PersonalModelAgentInterface {
  private learningModel: {
    learningStyles: LearningStyle[];
    domainPreferences: Map<AssessmentDomain, number>;
    pacingFactors: Map<AssessmentDomain, number>;
    contentPreferences: {
      topics: string[];
      formats: string[];
      interactionTypes: string[];
    };
    adaptationHistory: PersonalModelUpdate[];
    lastUpdate: Date;
  };

  private interactionMemory: {
    sessions: Array<{
      id: string;
      timestamp: Date;
      type: string;
      duration: number;
      performance: number;
      engagement: number;
      metadata: any;
    }>;
    patterns: Map<string, any>;
    insights: string[];
  };

  private progressMetrics: {
    overallTrend: 'improving' | 'stable' | 'declining';
    domainTrends: Map<AssessmentDomain, number>;
    confidenceLevel: number;
    lastAnalysis: Date;
  };

  constructor(
    config: AgentConfig,
    context: AgentContext,
    aivoBrain: AivoBrain
  ) {
    super(AgentType.PERSONAL_MODEL, config, context, aivoBrain);
    
    // Initialize learning model with defaults
    this.learningModel = {
      learningStyles: context.student.learningStyles || [LearningStyle.MULTIMODAL],
      domainPreferences: new Map(),
      pacingFactors: new Map(),
      contentPreferences: {
        topics: [],
        formats: [],
        interactionTypes: []
      },
      adaptationHistory: [],
      lastUpdate: new Date()
    };

    // Initialize interaction memory
    this.interactionMemory = {
      sessions: [],
      patterns: new Map(),
      insights: []
    };

    // Initialize progress metrics
    this.progressMetrics = {
      overallTrend: 'stable',
      domainTrends: new Map(),
      confidenceLevel: 0.5,
      lastAnalysis: new Date()
    };

    // Initialize all domains with baseline values
    Object.values(AssessmentDomain).forEach(domain => {
      this.learningModel.domainPreferences.set(domain, 0.5);
      this.learningModel.pacingFactors.set(domain, 1.0); // 1.0 = normal pace
      this.progressMetrics.domainTrends.set(domain, 0);
    });
  }

  // =============================================================================
  // ABSTRACT METHOD IMPLEMENTATIONS
  // =============================================================================

  protected async initializeAgent(): Promise<void> {
    this.log('info', 'Initializing PersonalModelAgent', {
      studentId: this.context.student.id,
      currentLearningStyles: this.learningModel.learningStyles,
      hasHistoricalData: !!this.context.historicalData
    });

    // Validate required context
    if (!this.validateContext(['student.id', 'student.gradeLevel'])) {
      throw new Error('Missing required context for personal model agent');
    }

    // Load historical data if available
    if (this.context.historicalData) {
      await this.loadHistoricalData();
    }

    this.log('info', 'Personal model agent initialized successfully');
  }

  protected async disposeAgent(): Promise<void> {
    // Save current model state
    await this.saveModelState();
    this.log('info', 'Personal model agent disposed', {
      totalInteractions: this.interactionMemory.sessions.length,
      totalAdaptations: this.learningModel.adaptationHistory.length
    });
  }

  protected validateConfig(): boolean {
    return this.config.agentType === AgentType.PERSONAL_MODEL &&
           this.config.studentId === this.context.student.id;
  }

  // =============================================================================
  // PERSONAL MODEL INTERFACE IMPLEMENTATION
  // =============================================================================

  async cloneFromAssessment(assessmentReport: AssessmentReport): Promise<void> {
    this.assertInitialized();
    
    return await this.executeTask('clone_from_assessment', async () => {
      this.log('info', 'Cloning model from assessment report', {
        assessmentId: assessmentReport.assessmentId,
        overallScore: assessmentReport.overallScore,
        domains: Object.keys(assessmentReport.domainScores).length
      });

      // Analyze assessment to extract learning patterns
      const analysisPrompt = this.buildAssessmentAnalysisPrompt(assessmentReport);
      const aiResponse = await this.generateCompletion(analysisPrompt, {
        taskType: 'personal_model_analysis',
        maxTokens: 1500,
        temperature: 0.4
      });

      const modelUpdates = this.parseModelUpdates(aiResponse.content);
      
      // Apply updates to learning model
      await this.applyModelUpdates(modelUpdates, 'baseline_assessment');

      // Update domain preferences based on performance
      Object.entries(assessmentReport.domainScores).forEach(([domain, score]) => {
        const normalizedScore = score / 100;
        this.learningModel.domainPreferences.set(domain as AssessmentDomain, normalizedScore);
        
        // Adjust pacing based on performance
        let pacingFactor = 1.0;
        if (normalizedScore > 0.8) {
          pacingFactor = 1.2; // Faster pace for strong areas
        } else if (normalizedScore < 0.5) {
          pacingFactor = 0.8; // Slower pace for challenging areas
        }
        this.learningModel.pacingFactors.set(domain as AssessmentDomain, pacingFactor);
      });

      this.learningModel.lastUpdate = new Date();

      this.log('info', 'Model successfully cloned from assessment', {
        updatesApplied: modelUpdates.length,
        newPreferences: this.learningModel.domainPreferences.size
      });
    });
  }

  async adaptLearningStyle(newStyles: LearningStyle[]): Promise<PersonalModelUpdate> {
    this.assertInitialized();
    
    return await this.executeTask('adapt_learning_style', async () => {
      this.log('info', 'Adapting learning styles', {
        currentStyles: this.learningModel.learningStyles,
        newStyles
      });

      const previousStyles = [...this.learningModel.learningStyles];
      this.learningModel.learningStyles = newStyles;

      const update: PersonalModelUpdate = {
        studentId: this.context.student.id,
        updateType: 'learning_style',
        changes: {
          previousStyles,
          newStyles,
          adaptationReason: await this.generateAdaptationReasoning('learning_style', { previousStyles, newStyles })
        },
        reasoning: 'Learning style adaptation based on observed preferences and performance patterns',
        confidence: 0.8,
        timestamp: new Date(),
        source: 'learning_pattern_analysis'
      };

      this.learningModel.adaptationHistory.push(update);
      this.learningModel.lastUpdate = new Date();

      this.log('info', 'Learning style adaptation completed', {
        previousStyles,
        newStyles,
        confidence: update.confidence
      });

      return update;
    });
  }

  async adjustPacing(domain: AssessmentDomain, adjustment: number): Promise<PersonalModelUpdate> {
    this.assertInitialized();
    
    return await this.executeTask('adjust_pacing', async () => {
      const currentPacing = this.learningModel.pacingFactors.get(domain) || 1.0;
      const newPacing = Math.max(0.3, Math.min(2.0, currentPacing + adjustment)); // Clamp between 0.3x and 2.0x
      
      this.log('info', 'Adjusting pacing for domain', {
        domain,
        currentPacing,
        adjustment,
        newPacing
      });

      this.learningModel.pacingFactors.set(domain, newPacing);

      const update: PersonalModelUpdate = {
        studentId: this.context.student.id,
        updateType: 'pacing',
        changes: {
          domain,
          previousPacing: currentPacing,
          newPacing,
          adjustment
        },
        reasoning: await this.generateAdaptationReasoning('pacing', {
          domain, currentPacing, newPacing, adjustment
        }),
        confidence: 0.9,
        timestamp: new Date(),
        source: 'performance_analysis'
      };

      this.learningModel.adaptationHistory.push(update);
      this.learningModel.lastUpdate = new Date();

      return update;
    });
  }

  async personalizeContent(content: any, domain: AssessmentDomain): Promise<any> {
    this.assertInitialized();
    
    return await this.executeTask('personalize_content', async () => {
      this.log('debug', 'Personalizing content', {
        domain,
        contentType: typeof content,
        learningStyles: this.learningModel.learningStyles
      });

      const personalizationPrompt = this.buildPersonalizationPrompt(content, domain);
      const aiResponse = await this.generateCompletion(personalizationPrompt, {
        taskType: 'content_adaptation',
        maxTokens: 2000,
        temperature: 0.6
      });

      const personalizedContent = this.parsePersonalizedContent(aiResponse.content, content);

      this.log('debug', 'Content personalization completed', {
        domain,
        originalLength: JSON.stringify(content).length,
        personalizedLength: JSON.stringify(personalizedContent).length
      });

      return personalizedContent;
    });
  }

  async recordInteraction(interaction: any): Promise<void> {
    this.assertInitialized();
    
    return await this.executeTask('record_interaction', async () => {
      const sessionData = {
        id: interaction.id || uuidv4(),
        timestamp: interaction.timestamp || new Date(),
        type: interaction.type,
        duration: interaction.duration || 0,
        performance: interaction.performance || 0,
        engagement: interaction.engagement || 0.5,
        metadata: interaction.metadata || {}
      };

      this.interactionMemory.sessions.push(sessionData);
      
      // Keep only last 1000 interactions for memory efficiency
      if (this.interactionMemory.sessions.length > 1000) {
        this.interactionMemory.sessions = this.interactionMemory.sessions.slice(-1000);
      }

      // Analyze patterns periodically
      if (this.interactionMemory.sessions.length % 10 === 0) {
        await this.analyzeInteractionPatterns();
      }

      // Update model based on interaction if significant
      if (sessionData.performance !== 0 || sessionData.engagement !== 0.5) {
        await this.updateModelFromInteraction(sessionData);
      }

      this.log('debug', 'Interaction recorded', {
        sessionId: sessionData.id,
        type: sessionData.type,
        performance: sessionData.performance,
        engagement: sessionData.engagement
      });
    });
  }

  async generateSuggestions(audienceType: 'parent' | 'teacher'): Promise<string[]> {
    this.assertInitialized();
    
    return await this.executeTask('generate_suggestions', async () => {
      this.log('info', 'Generating suggestions', {
        audienceType,
        modelAge: Date.now() - this.learningModel.lastUpdate.getTime(),
        interactionCount: this.interactionMemory.sessions.length
      });

      const suggestionsPrompt = this.buildSuggestionsPrompt(audienceType);
      const aiResponse = await this.generateCompletion(suggestionsPrompt, {
        taskType: 'suggestion_generation',
        maxTokens: 1200,
        temperature: 0.5
      });

      const suggestions = this.parseSuggestions(aiResponse.content);

      this.log('info', 'Suggestions generated', {
        audienceType,
        suggestionCount: suggestions.length
      });

      return suggestions;
    });
  }

  // =============================================================================
  // PRIVATE HELPER METHODS
  // =============================================================================

  private async loadHistoricalData(): Promise<void> {
    if (this.context.historicalData?.interactions) {
      this.interactionMemory.sessions = this.context.historicalData.interactions.slice(-500); // Last 500 interactions
    }

    if (this.context.historicalData?.progress) {
      await this.analyzeHistoricalProgress();
    }
  }

  private async saveModelState(): Promise<void> {
    // In a real implementation, this would save to a persistent store
    this.log('debug', 'Saving model state', {
      learningStyles: this.learningModel.learningStyles,
      adaptationCount: this.learningModel.adaptationHistory.length,
      interactionCount: this.interactionMemory.sessions.length
    });
  }

  private buildAssessmentAnalysisPrompt(assessmentReport: AssessmentReport): string {
    return `
Analyze the following baseline assessment report to extract learning patterns and preferences:

Student Profile:
- Disabilities: ${this.context.student.disabilities.join(', ')}
- Current Learning Styles: ${this.learningModel.learningStyles.join(', ')}

Assessment Results:
- Overall Score: ${assessmentReport.overallScore}%
- Domain Scores: ${JSON.stringify(assessmentReport.domainScores)}
- Strengths: ${assessmentReport.strengths.join(', ')}
- Weaknesses: ${assessmentReport.weaknesses.join(', ')}
- Knowledge Gaps: ${assessmentReport.knowledgeGaps.length}

Based on this assessment, provide insights about:
1. Optimal learning styles for this student
2. Content format preferences (visual, auditory, interactive, etc.)
3. Interaction patterns that would be most effective
4. Pacing adjustments needed for different domains
5. Motivational factors based on performance patterns

Return analysis in JSON format:
{
  "recommendedLearningStyles": ["visual", "kinesthetic", etc.],
  "contentPreferences": {
    "formats": ["interactive", "visual", etc.],
    "interactionTypes": ["guided", "exploratory", etc.]
  },
  "pacingRecommendations": {
    "domain": "faster|normal|slower"
  },
  "motivationalFactors": ["achievement", "collaboration", etc.],
  "confidenceLevel": 0.8
}
    `.trim();
  }

  private buildPersonalizationPrompt(content: any, domain: AssessmentDomain): string {
    const preferences = this.learningModel.domainPreferences.get(domain) || 0.5;
    const pacingFactor = this.learningModel.pacingFactors.get(domain) || 1.0;
    
    return `
Personalize the following content for a student with specific learning characteristics:

Original Content:
${JSON.stringify(content, null, 2)}

Student Learning Profile:
- Learning Styles: ${this.learningModel.learningStyles.join(', ')}
- Domain: ${domain}
- Domain Preference Score: ${preferences} (0-1 scale)
- Pacing Factor: ${pacingFactor}x (normal = 1.0)
- Disabilities: ${this.context.student.disabilities.join(', ')}
- Grade Level: ${this.context.student.gradeLevel}

Content Preferences:
- Preferred Formats: ${this.learningModel.contentPreferences.formats.join(', ')}
- Preferred Interactions: ${this.learningModel.contentPreferences.interactionTypes.join(', ')}

Recent Performance Insights:
${this.interactionMemory.insights.slice(-3).join('; ')}

Personalization Requirements:
1. Adapt content difficulty and pacing based on the pacing factor
2. Incorporate preferred learning modalities
3. Add accommodations for specific disabilities
4. Include engaging elements based on demonstrated interests
5. Adjust language complexity for grade level and abilities
6. Add supportive scaffolding where needed

Return personalized content maintaining the original structure but with adaptations.
    `.trim();
  }

  private buildSuggestionsPrompt(audienceType: 'parent' | 'teacher'): string {
    const recentTrends = Array.from(this.progressMetrics.domainTrends.entries())
      .map(([domain, trend]) => `${domain}: ${trend > 0 ? 'improving' : trend < 0 ? 'declining' : 'stable'}`)
      .join('; ');

    return `
Generate personalized suggestions for ${audienceType}s based on the student's learning model:

Student Profile:
- Grade Level: ${this.context.student.gradeLevel}
- Disabilities: ${this.context.student.disabilities.join(', ')}
- Learning Styles: ${this.learningModel.learningStyles.join(', ')}

Current Learning Model:
- Overall Trend: ${this.progressMetrics.overallTrend}
- Domain Trends: ${recentTrends}
- Recent Interactions: ${this.interactionMemory.sessions.length}

Performance Insights:
${this.interactionMemory.insights.slice(-5).join('\n')}

Recent Adaptations:
${this.learningModel.adaptationHistory.slice(-3).map(a => 
  `${a.updateType}: ${a.reasoning}`
).join('\n')}

Generate 5-8 specific, actionable suggestions for ${audienceType}s that:
1. Address current learning needs and challenges
2. Leverage identified strengths and preferences
3. Support areas where the student is struggling
4. Provide concrete activities or strategies
5. Consider the home/school environment appropriately
6. Are realistic and implementable

Format as a JSON array of strings: ["suggestion1", "suggestion2", ...]
    `.trim();
  }

  private async generateAdaptationReasoning(updateType: string, changes: any): Promise<string> {
    const reasoningPrompt = `
Explain the reasoning for a personal learning model adaptation:

Update Type: ${updateType}
Changes Made: ${JSON.stringify(changes)}

Student Context:
- Disabilities: ${this.context.student.disabilities.join(', ')}
- Current Learning Styles: ${this.learningModel.learningStyles.join(', ')}
- Recent Performance: ${this.progressMetrics.overallTrend}

Provide a clear, concise explanation (2-3 sentences) for why this adaptation was made.
    `.trim();

    const response = await this.generateCompletion(reasoningPrompt, {
      taskType: 'explanation',
      maxTokens: 200,
      temperature: 0.3
    });

    return response.content.trim();
  }

  private async analyzeInteractionPatterns(): Promise<void> {
    const recentSessions = this.interactionMemory.sessions.slice(-50); // Analyze last 50 interactions
    
    if (recentSessions.length < 5) return; // Need minimum data

    // Calculate pattern metrics
    const avgPerformance = recentSessions.reduce((sum, s) => sum + s.performance, 0) / recentSessions.length;
    const avgEngagement = recentSessions.reduce((sum, s) => sum + s.engagement, 0) / recentSessions.length;
    const avgDuration = recentSessions.reduce((sum, s) => sum + s.duration, 0) / recentSessions.length;

    // Detect patterns
    const patterns = new Map();
    patterns.set('performance_trend', this.calculateTrend(recentSessions.map(s => s.performance)));
    patterns.set('engagement_trend', this.calculateTrend(recentSessions.map(s => s.engagement)));
    patterns.set('session_duration_avg', avgDuration);

    this.interactionMemory.patterns = patterns;

    // Generate insights
    const insight = `Recent patterns: Performance ${avgPerformance.toFixed(2)}, Engagement ${avgEngagement.toFixed(2)}, Avg Duration ${Math.round(avgDuration)}min`;
    this.interactionMemory.insights.push(insight);
    
    // Keep only last 20 insights
    if (this.interactionMemory.insights.length > 20) {
      this.interactionMemory.insights = this.interactionMemory.insights.slice(-20);
    }
  }

  private async updateModelFromInteraction(session: any): Promise<void> {
    // Adjust preferences based on performance and engagement
    if (session.metadata?.domain) {
      const domain = session.metadata.domain as AssessmentDomain;
      const currentPreference = this.learningModel.domainPreferences.get(domain) || 0.5;
      
      // Weight performance and engagement equally
      const sessionScore = (session.performance + session.engagement) / 2;
      const adjustment = (sessionScore - 0.5) * 0.1; // Small incremental adjustments
      
      const newPreference = Math.max(0.1, Math.min(0.9, currentPreference + adjustment));
      this.learningModel.domainPreferences.set(domain, newPreference);
    }
  }

  private calculateTrend(values: number[]): number {
    if (values.length < 3) return 0;
    
    // Simple linear trend calculation
    const n = values.length;
    const sumX = (n * (n + 1)) / 2;
    const sumY = values.reduce((sum, val) => sum + val, 0);
    const sumXY = values.reduce((sum, val, i) => sum + val * (i + 1), 0);
    const sumXX = (n * (n + 1) * (2 * n + 1)) / 6;
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    return slope;
  }

  private parseModelUpdates(aiResponse: string): any[] {
    try {
      const parsed = JSON.parse(aiResponse);
      return parsed.updates || [];
    } catch {
      return [];
    }
  }

  private async applyModelUpdates(updates: any[], source: string): Promise<void> {
    for (const update of updates) {
      // Apply update logic based on type
      if (update.learningStyles) {
        this.learningModel.learningStyles = update.learningStyles;
      }
      if (update.contentPreferences) {
        this.learningModel.contentPreferences = merge(
          this.learningModel.contentPreferences,
          update.contentPreferences
        );
      }
    }
  }

  private parsePersonalizedContent(aiResponse: string, originalContent: any): any {
    try {
      return JSON.parse(aiResponse);
    } catch {
      // Return original content if parsing fails
      return originalContent;
    }
  }

  private parseSuggestions(aiResponse: string): string[] {
    try {
      const parsed = JSON.parse(aiResponse);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return ['Continue supporting the student\'s learning journey with patience and encouragement.'];
    }
  }

  private async analyzeHistoricalProgress(): Promise<void> {
    // Analyze historical progress data to initialize trends
    if (this.context.historicalData?.progress) {
      const progressData = this.context.historicalData.progress;
      // Update progress metrics based on historical data
      this.progressMetrics.lastAnalysis = new Date();
    }
  }
}