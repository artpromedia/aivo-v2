import { EventEmitter } from 'events';
import { BaseAgent } from './base-agent';
import type { AivoBrain, AIRequest} from '@aivo/aivo-brain';
import { TaskType } from '@aivo/aivo-brain';
import type { 
  AgentType, 
  AgentConfig, 
  AgentContext 
} from '../types';
import type {
  AgeGroup,
  GameTemplate,
  GeneratedGame,
  GameGenerationRequest,
  GameContent,
  GameConfiguration,
  GameState,
  GameResults,
  GameAnalytics,
  MathProblem,
  GameQuestion,
  ConceptNode,
  PlayerResponse} from '../types/game-types';
import {
  K5_GAME_TEMPLATES,
  MIDDLE_GAME_TEMPLATES,
  HIGH_GAME_TEMPLATES
} from '../types/game-types';

export interface GameGeneratorConfig {
  // Content generation settings
  contentComplexity: {
    k5: number;        // 1-3
    middle: number;    // 2-6
    high: number;      // 4-10
  };
  
  // Game balancing
  difficultyProgression: boolean;
  adaptiveContent: boolean;
  personalizedRecommendations: boolean;
  
  // Content sources
  curriculumAlignment: boolean;
  recentLessonIntegration: boolean;
  strugglingAreasBoost: boolean;
  
  // Generation limits
  maxGamesPerSession: number;
  contentCacheSize: number;
  generationTimeout: number; // ms
  
  // Quality control
  contentValidation: boolean;
  appropriatenessCheck: boolean;
  difficultyCalibration: boolean;
  
  // Analytics
  trackUsage: boolean;
  collectFeedback: boolean;
  optimizeGeneration: boolean;
}

export class GameGenerationAgent extends BaseAgent {
  private gameGeneratorConfig: GameGeneratorConfig;
  private gameTemplates: Map<string, GameTemplate>;
  private generatedGames: Map<string, GeneratedGame>;
  private gameAnalytics: Map<string, GameAnalytics>;
  private contentCache: Map<string, GameContent>;
  private eventEmitter: EventEmitter;

  constructor(
    agentType: AgentType,
    config: AgentConfig,
    context: AgentContext,
    aivoBrain: AivoBrain
  ) {
    super(agentType, config, context, aivoBrain);
    
    this.gameGeneratorConfig = this.parseGameGeneratorConfig(config.customSettings || {});
    this.gameTemplates = new Map();
    this.generatedGames = new Map();
    this.gameAnalytics = new Map();
    this.contentCache = new Map();
    this.eventEmitter = new EventEmitter();
    
    this.initializeGameTemplates();
    this.setupGameEventHandlers();
  }

  protected async initializeAgent(): Promise<void> {
    console.log('[GameGenerationAgent] Initializing game generation capabilities...');
    
    // Load existing game templates and analytics
    await this.loadGameTemplates();
    await this.loadGameAnalytics();
    
    // Initialize content generation
    await this.initializeContentGenerators();
    
    // Setup analytics tracking
    if (this.gameGeneratorConfig.trackUsage) {
      this.startAnalyticsCollection();
    }
    
    console.log('[GameGenerationAgent] Game generation agent ready');
  }

  protected async disposeAgent(): Promise<void> {
    console.log('[GameGenerationAgent] Shutting down game generation agent...');
    
    // Save analytics data
    await this.saveGameAnalytics();
    
    // Clear caches
    this.contentCache.clear();
    this.generatedGames.clear();
    
    // Clean up event listeners
    this.eventEmitter.removeAllListeners();
  }

  protected validateConfig(): boolean {
    // Basic validation - we'll provide defaults if missing
    return true;
  }

  // Public API for game generation
  public async generateGameForFocus(request: GameGenerationRequest): Promise<GeneratedGame> {
    return this.executeTask('generateGame', () => this.generateGame(request));
  }

  public async getGameResults(gameId: string): Promise<GameResults | null> {
    const game = this.generatedGames.get(gameId);
    return game ? this.calculateGameResults(game) : null;
  }

  public async updateGameState(gameId: string, stateUpdate: Partial<GameState>): Promise<boolean> {
    const game = this.generatedGames.get(gameId);
    if (!game) return false;
    
    Object.assign(game.state, stateUpdate);
    return true;
  }

  // Core game generation methods
  public async generateGame(request: GameGenerationRequest): Promise<GeneratedGame> {
    console.log('[GameGenerationAgent] Generating game...', request);
    
    try {
      // Select appropriate game template
      const template = await this.selectGameTemplate(request);
      
      // Generate game content
      const content = await this.generateGameContent(template, request);
      
      // Configure game settings
      const config = this.createGameConfiguration(template, request);
      
      // Initialize game state
      const state = this.createInitialGameState(template);
      
      // Create generated game
      const generatedGame: GeneratedGame = {
        id: this.generateGameId(),
        sessionId: request.focusContext ? `focus-${Date.now()}` : undefined,
        templateId: template.id,
        type: template.type,
        ageGroup: template.ageGroup,
        title: this.generateGameTitle(template, request),
        instructions: this.generateGameInstructions(template, content),
        content,
        config,
        state,
        metadata: {
          generated: new Date(),
          estimatedDuration: template.duration.target,
          difficulty: config.difficulty,
          learnerProfile: request.learnerProfile ? {
            id: request.learnerProfile.id,
            preferences: request.learnerProfile.preferences || [],
            strengths: request.learnerProfile.strengths || [],
            challenges: request.learnerProfile.challenges || []
          } : undefined,
          educationalContext: request.currentContext
        }
      };
      
      // Store generated game
      this.generatedGames.set(generatedGame.id, generatedGame);
      
      // Track generation event
      this.trackGameGeneration(generatedGame, request);
      
      console.log('[GameGenerationAgent] Game generated successfully:', generatedGame.id);
      return generatedGame;
      
    } catch (error) {
      console.error('[GameGenerationAgent] Game generation failed:', error);
      throw new Error(`Game generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async selectGameTemplate(request: GameGenerationRequest): Promise<GameTemplate> {
    const ageTemplates = this.getTemplatesForAge(request.ageGroup);
    
    // Filter by constraints
    const availableTemplates = Array.from(ageTemplates.values()).filter(template => {
      // Duration constraint
      if (request.duration < template.duration.min || request.duration > template.duration.max) {
        return false;
      }
      
      // Game type constraints
      if (request.constraints?.gameTypes && !request.constraints.gameTypes.includes(template.type)) {
        return false;
      }
      
      if (request.constraints?.excludeTypes && request.constraints.excludeTypes.includes(template.type)) {
        return false;
      }
      
      return true;
    });
    
    if (availableTemplates.length === 0) {
      throw new Error('No suitable game templates found for request');
    }
    
    // Select best template based on context and preferences
    const selectedTemplate = this.selectBestTemplate(availableTemplates, request);
    
    return selectedTemplate;
  }

  private selectBestTemplate(templates: GameTemplate[], request: GameGenerationRequest): GameTemplate {
    // Score templates based on various factors
    const scoredTemplates = templates.map(template => {
      let score = 0;
      
      // Educational alignment score
      if (request.currentContext?.subject) {
        if (template.educationalAlignment.subjects.includes(request.currentContext.subject)) {
          score += 30;
        }
      }
      
      // Learner preference score
      if (request.learnerProfile?.preferences) {
        const matchingPrefs = template.educationalAlignment.skills.filter(skill =>
          request.learnerProfile!.preferences!.some(pref => 
            pref.toLowerCase().includes(skill.toLowerCase())
          )
        );
        score += matchingPrefs.length * 10;
      }
      
      // Focus context score
      if (request.focusContext) {
        // Prefer shorter, more engaging games for high distraction
        if (request.focusContext.distractionLevel === 'high') {
          score += (300 - template.duration.target) / 10; // Favor shorter games
        }
        
        // Prefer interactive games for fatigue
        if (request.focusContext.fatigueIndicators.length > 0) {
          if (['click', 'drag', 'multi'].includes(template.mechanics.inputType)) {
            score += 20;
          }
        }
      }
      
      // Difficulty appropriateness
      const targetDifficulty = this.calculateTargetDifficulty(request);
      const difficultyMatch = 10 - Math.abs(template.difficulty.default - targetDifficulty);
      score += difficultyMatch * 5;
      
      // Template popularity (if analytics available)
      const analytics = this.gameAnalytics.get(template.id);
      if (analytics) {
        score += analytics.popularityScore * 2;
        score += analytics.learningEffectiveness.engagementLevel * 10;
      }
      
      return { template, score };
    });
    
    // Sort by score and return best template
    scoredTemplates.sort((a, b) => b.score - a.score);
    return scoredTemplates[0].template;
  }

  private async generateGameContent(template: GameTemplate, request: GameGenerationRequest): Promise<GameContent> {
    const content: GameContent = {};
    
    try {
      // Generate vocabulary words if needed
      if (template.contentRequirements.vocabularyWords) {
        content.vocabulary = await this.generateVocabularyContent(
          template.contentRequirements.vocabularyWords,
          template,
          request
        );
      }
      
      // Generate math problems if needed  
      if (template.contentRequirements.mathProblems) {
        content.mathProblems = await this.generateMathContent(
          template.contentRequirements.mathProblems,
          template,
          request
        );
      }
      
      // Generate questions if needed
      if (template.contentRequirements.questions) {
        content.questions = await this.generateQuestionContent(
          template.contentRequirements.questions,
          template,
          request
        );
      }
      
      // Generate concepts if needed
      if (template.contentRequirements.concepts) {
        content.concepts = await this.generateConceptContent(
          template.contentRequirements.concepts,
          template,
          request
        );
      }
      
      return content;
      
    } catch (error) {
      console.error('[GameGenerationAgent] Content generation failed:', error);
      throw new Error(`Content generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async generateVocabularyContent(
    count: number, 
    template: GameTemplate, 
    request: GameGenerationRequest
  ): Promise<string[]> {
    const cacheKey = `vocab_${template.ageGroup}_${request.currentContext?.subject || 'general'}_${count}`;
    
    if (this.contentCache.has(cacheKey)) {
      const cached = this.contentCache.get(cacheKey);
      if (cached?.vocabulary) return cached.vocabulary;
    }
    
    // Use AIVO Brain to generate appropriate vocabulary
    const prompt = this.buildVocabularyPrompt(count, template, request);
    const aiRequest: AIRequest = {
      id: `vocab_${Date.now()}`,
      taskType: TaskType.CONTENT_ADAPTATION,
      prompt,
      context: {
        studentId: this.context.student.id,
        agentType: this.agentType.toString()
      },
      options: {
        maxTokens: 500,
        temperature: 0.7,
        stream: false,
        retries: 3
      }
    };
    const response = await this.aivoBrain.generateCompletion(aiRequest);
    
    const vocabulary = this.parseVocabularyResponse(response.content);
    
    // Cache the result
    this.contentCache.set(cacheKey, { vocabulary });
    
    return vocabulary;
  }

  private async generateMathContent(
    count: number, 
    template: GameTemplate, 
    request: GameGenerationRequest
  ): Promise<MathProblem[]> {
    const cacheKey = `math_${template.ageGroup}_${template.difficulty.default}_${count}`;
    
    if (this.contentCache.has(cacheKey)) {
      const cached = this.contentCache.get(cacheKey);
      if (cached?.mathProblems) return cached.mathProblems;
    }
    
    const prompt = this.buildMathPrompt(count, template, request);
    const aiRequest: AIRequest = {
      id: `math_${Date.now()}`,
      taskType: TaskType.QUESTION_GENERATION,
      prompt,
      context: { studentId: this.context.student.id },
      options: { maxTokens: 500, temperature: 0.7, stream: false, retries: 3 }
    };
    const response = await this.aivoBrain.generateCompletion(aiRequest);
    
    const mathProblems = this.parseMathResponse(response.content, template);
    
    // Cache the result
    this.contentCache.set(cacheKey, { mathProblems });
    
    return mathProblems;
  }

  private async generateQuestionContent(
    count: number, 
    template: GameTemplate, 
    request: GameGenerationRequest
  ): Promise<GameQuestion[]> {
    const prompt = this.buildQuestionPrompt(count, template, request);
    const aiRequest: AIRequest = {
      id: `question_${Date.now()}`,
      taskType: TaskType.QUESTION_GENERATION,
      prompt,
      context: { studentId: this.context.student.id },
      options: { maxTokens: 500, temperature: 0.7, stream: false, retries: 3 }
    };
    const response = await this.aivoBrain.generateCompletion(aiRequest);
    
    return this.parseQuestionResponse(response.content, template);
  }

  private async generateConceptContent(
    count: number, 
    template: GameTemplate, 
    request: GameGenerationRequest
  ): Promise<ConceptNode[]> {
    const prompt = this.buildConceptPrompt(count, template, request);
    const aiRequest: AIRequest = {
      id: `concept_${Date.now()}`,
      taskType: TaskType.CONTENT_ADAPTATION,
      prompt,
      context: { studentId: this.context.student.id },
      options: { maxTokens: 500, temperature: 0.7, stream: false, retries: 3 }
    };
    const response = await this.aivoBrain.generateCompletion(aiRequest);
    
    return this.parseConceptResponse(response.content, template);
  }

  // Content generation prompt builders
  private buildVocabularyPrompt(count: number, template: GameTemplate, request: GameGenerationRequest): string {
    const ageLevel = template.ageGroup === 'k5' ? 'kindergarten through 5th grade' : 
                     template.ageGroup === 'middle' ? '6th through 8th grade' : 
                     '9th through 12th grade';
    
    let prompt = `Generate ${count} vocabulary words appropriate for ${ageLevel} students.`;
    
    if (request.currentContext?.subject) {
      prompt += ` Focus on ${request.currentContext.subject} vocabulary.`;
    }
    
    if (request.currentContext?.recentLessons) {
      prompt += ` Include words related to recent lessons: ${request.currentContext.recentLessons.join(', ')}.`;
    }
    
    prompt += ` Return as a JSON array of strings. Each word should be challenging but achievable for the grade level.`;
    
    return prompt;
  }

  private buildMathPrompt(count: number, template: GameTemplate, request: GameGenerationRequest): string {
    const ageLevel = template.ageGroup === 'k5' ? 'elementary (K-5)' : 
                     template.ageGroup === 'middle' ? 'middle school (6-8)' : 
                     'high school (9-12)';
    
    let prompt = `Generate ${count} math problems for ${ageLevel} students at difficulty level ${template.difficulty.default}/10.`;
    
    if (request.currentContext?.currentTopic) {
      prompt += ` Focus on ${request.currentContext.currentTopic}.`;
    }
    
    prompt += ` Return as JSON array with format: [{"equation": "2+3", "answer": 5, "topic": "addition", "steps": ["Add 2 and 3", "2+3=5"]}].`;
    
    return prompt;
  }

  private buildQuestionPrompt(count: number, template: GameTemplate, request: GameGenerationRequest): string {
    const ageLevel = template.ageGroup === 'k5' ? 'elementary' : 
                     template.ageGroup === 'middle' ? 'middle school' : 
                     'high school';
    
    let prompt = `Generate ${count} ${template.type} questions for ${ageLevel} students.`;
    
    if (request.currentContext?.subject) {
      prompt += ` Subject: ${request.currentContext.subject}.`;
    }
    
    prompt += ` Return as JSON array with format: [{"question": "...", "type": "multiple-choice", "options": [...], "correctAnswer": "...", "explanation": "..."}].`;
    
    return prompt;
  }

  private buildConceptPrompt(count: number, template: GameTemplate, request: GameGenerationRequest): string {
    let prompt = `Generate ${count} educational concepts for ${template.ageGroup} level.`;
    
    if (request.currentContext?.subject) {
      prompt += ` Subject: ${request.currentContext.subject}.`;
    }
    
    prompt += ` Return as JSON with format: [{"name": "...", "definition": "...", "examples": [...], "subject": "...", "gradeLevel": "..."}].`;
    
    return prompt;
  }

  // Response parsers
  private parseVocabularyResponse(response: unknown): string[] {
    try {
      if (typeof response === 'string') {
        const parsed = JSON.parse(response);
        return Array.isArray(parsed) ? parsed : [];
      }
      return Array.isArray(response) ? response : [];
    } catch {
      // Fallback to basic vocabulary
      return this.getFallbackVocabulary();
    }
  }

  private parseMathResponse(response: unknown, template: GameTemplate): MathProblem[] {
    try {
      const parsed = typeof response === 'string' ? JSON.parse(response) : response;
      return Array.isArray(parsed) ? parsed.map((item, index) => ({
        id: `math_${Date.now()}_${index}`,
        equation: item.equation || '1+1',
        answer: item.answer || 2,
        difficulty: template.difficulty.default,
        topic: item.topic || 'arithmetic',
        steps: item.steps || []
      })) : [];
    } catch {
      return this.getFallbackMathProblems(template);
    }
  }

  private parseQuestionResponse(response: unknown, template: GameTemplate): GameQuestion[] {
    try {
      const parsed = typeof response === 'string' ? JSON.parse(response) : response;
      return Array.isArray(parsed) ? parsed.map((item, index) => ({
        id: `question_${Date.now()}_${index}`,
        question: item.question || 'Sample question?',
        type: item.type || 'multiple-choice',
        options: item.options || ['A', 'B', 'C', 'D'],
        correctAnswer: item.correctAnswer || 'A',
        explanation: item.explanation,
        hint: item.hint,
        difficulty: template.difficulty.default,
        subject: template.educationalAlignment.subjects[0] || 'general',
        topic: item.topic || 'general'
      })) : [];
    } catch {
      return this.getFallbackQuestions(template);
    }
  }

  private parseConceptResponse(response: unknown, template: GameTemplate): ConceptNode[] {
    try {
      const parsed = typeof response === 'string' ? JSON.parse(response) : response;
      return Array.isArray(parsed) ? parsed.map((item, index) => ({
        id: `concept_${Date.now()}_${index}`,
        name: item.name || 'Sample Concept',
        definition: item.definition || 'Sample definition',
        examples: item.examples || ['Example 1'],
        connections: item.connections || [],
        subject: item.subject || template.educationalAlignment.subjects[0] || 'general',
        gradeLevel: item.gradeLevel || template.ageGroup
      })) : [];
    } catch {
      return this.getFallbackConcepts(template);
    }
  }

  // Fallback content methods
  private getFallbackVocabulary(): string[] {
    return ['learn', 'study', 'practice', 'solve', 'discover'];
  }

  private getFallbackMathProblems(template: GameTemplate): MathProblem[] {
    const problems = template.ageGroup === 'k5' ? 
      [{ equation: '2+3', answer: 5, topic: 'addition' }] :
      template.ageGroup === 'middle' ?
      [{ equation: '12×7', answer: 84, topic: 'multiplication' }] :
      [{ equation: '2x + 5 = 13', answer: '4', topic: 'algebra' }];
    
    return problems.map((p, i) => ({
      id: `fallback_${i}`,
      equation: p.equation,
      answer: p.answer,
      difficulty: template.difficulty.default,
      topic: p.topic,
      steps: []
    }));
  }

  private getFallbackQuestions(template: GameTemplate): GameQuestion[] {
    return [{
      id: 'fallback_q1',
      question: 'What is the main idea?',
      type: 'multiple-choice',
      options: ['Option A', 'Option B', 'Option C', 'Option D'],
      correctAnswer: 'Option A',
      difficulty: template.difficulty.default,
      subject: template.educationalAlignment.subjects[0] || 'general',
      topic: 'general'
    }];
  }

  private getFallbackConcepts(template: GameTemplate): ConceptNode[] {
    return [{
      id: 'fallback_c1',
      name: 'Learning',
      definition: 'The process of acquiring knowledge or skills',
      examples: ['Reading books', 'Practicing math', 'Studying science'],
      connections: [],
      subject: template.educationalAlignment.subjects[0] || 'general',
      gradeLevel: template.ageGroup
    }];
  }

  // Configuration and state management
  private createGameConfiguration(template: GameTemplate, request: GameGenerationRequest): GameConfiguration {
    return {
      difficulty: this.calculateTargetDifficulty(request),
      timeLimit: template.mechanics.hasTimer ? template.duration.target : undefined,
      attempts: template.mechanics.multiAttempts ? 3 : 1,
      showHints: request.preferences?.allowHints ?? true,
      showScore: true,
      showTimer: template.mechanics.hasTimer,
      allowPause: template.mechanics.allowPause,
      backgroundMusic: true,
      soundEffects: true,
      animations: true,
      accessibility: {
        highContrast: false,
        largeText: false,
        reduceMotion: false,
        screenReader: false,
        keyboardOnly: false
      },
      progressiveHints: true,
      celebrationLevel: request.preferences?.celebrationLevel || 'standard'
    };
  }

  private createInitialGameState(template: GameTemplate): GameState {
    return {
      status: 'not-started',
      currentStep: 0,
      totalSteps: this.calculateTotalSteps(template),
      score: 0,
      maxScore: this.calculateMaxScore(template),
      attempts: 0,
      hintsUsed: 0,
      timeElapsed: 0,
      correctAnswers: 0,
      incorrectAnswers: 0,
      streakCount: 0,
      longestStreak: 0,
      playerResponses: [],
      checkpoints: []
    };
  }

  private calculateTargetDifficulty(request: GameGenerationRequest): number {
    if (request.preferences?.difficulty) {
      return request.preferences.difficulty;
    }
    
    // Base difficulty by age group
    let baseDifficulty = request.ageGroup === 'k5' ? 2 : 
                        request.ageGroup === 'middle' ? 4 : 
                        6;
    
    // Adjust based on learner profile
    if (request.learnerProfile?.challenges && request.learnerProfile.challenges.length > 0) {
      baseDifficulty = Math.max(1, baseDifficulty - 1);
    }
    
    if (request.learnerProfile?.strengths && request.learnerProfile.strengths.length > 2) {
      baseDifficulty = Math.min(10, baseDifficulty + 1);
    }
    
    // Adjust based on focus context
    if (request.focusContext?.distractionLevel === 'high') {
      baseDifficulty = Math.max(1, baseDifficulty - 1);
    }
    
    return baseDifficulty;
  }

  private calculateTotalSteps(template: GameTemplate): number {
    return (template.contentRequirements.vocabularyWords || 0) +
           (template.contentRequirements.mathProblems || 0) +
           (template.contentRequirements.questions || 0) +
           (template.contentRequirements.concepts || 0) || 5;
  }

  private calculateMaxScore(template: GameTemplate): number {
    return this.calculateTotalSteps(template) * 100;
  }



  // Utility methods
  private generateGameId(): string {
    return `game_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateGameTitle(template: GameTemplate, request: GameGenerationRequest): string {
    const subjects = request.currentContext?.subject ? ` - ${request.currentContext.subject}` : '';
    return `${template.name}${subjects}`;
  }

  private generateGameInstructions(template: GameTemplate, content: GameContent): string[] {
    const instructions = [`Welcome to ${template.name}!`];
    
    if (template.type === 'word-scramble' && content.vocabulary) {
      instructions.push('Unscramble the letters to form words.');
      instructions.push('Drag the letters to rearrange them.');
    } else if (template.type === 'math-puzzle' && content.mathProblems) {
      instructions.push('Solve the math problems.');
      instructions.push('Click on your answer choice.');
    } else if (template.type === 'trivia' && content.questions) {
      instructions.push('Answer the questions correctly.');
      instructions.push('You have limited time for each question.');
    }
    
    if (template.mechanics.allowPause) {
      instructions.push('You can pause the game at any time.');
    }
    
    return instructions;
  }

  private calculateGameResults(game: GeneratedGame): GameResults {
    const state = game.state;
    
    return {
      gameId: game.id,
      sessionId: game.sessionId,
      playerId: game.metadata.learnerProfile?.id || 'anonymous',
      completionStatus: state.status === 'completed' ? 'completed' : 
                       state.currentStep > 0 ? 'partial' : 'abandoned',
      finalScore: state.score,
      maxPossibleScore: state.maxScore,
      accuracyRate: state.correctAnswers / (state.correctAnswers + state.incorrectAnswers) || 0,
      averageResponseTime: this.calculateAverageResponseTime(state.playerResponses),
      totalPlayTime: state.timeElapsed,
      hintsUsed: state.hintsUsed,
      attemptsUsed: state.attempts,
      streakAnalysis: {
        longestStreak: state.longestStreak,
        averageStreakLength: this.calculateAverageStreakLength(state.playerResponses),
        totalStreaks: this.countStreaks(state.playerResponses)
      },
      learningMetrics: {
        conceptsMastered: this.identifyMasteredConcepts(state.playerResponses),
        skillsImproved: this.identifyImprovedSkills(game),
        areasForImprovement: this.identifyImprovementAreas(state.playerResponses),
        nextRecommendations: this.generateNextRecommendations(game)
      },
      engagementMetrics: {
        pauseCount: 0, // Would be tracked in real implementation
        quitAttempts: 0
      }
    };
  }

  private calculateAverageResponseTime(responses: PlayerResponse[]): number {
    if (responses.length === 0) return 0;
    const total = responses.reduce((sum, r) => sum + (r.timeToRespond || 0), 0);
    return total / responses.length;
  }

  private calculateAverageStreakLength(responses: PlayerResponse[]): number {
    // Simplified streak calculation
    return responses.length > 0 ? responses.length / 2 : 0;
  }

  private countStreaks(responses: PlayerResponse[]): number {
    // Count consecutive correct answer streaks
    let streaks = 0;
    let inStreak = false;
    
    for (const response of responses) {
      if (response.correct && !inStreak) {
        streaks++;
        inStreak = true;
      } else if (!response.correct) {
        inStreak = false;
      }
    }
    
    return streaks;
  }

  private identifyMasteredConcepts(responses: Array<{ concept?: string; correct: boolean }>): string[] {
    // Identify concepts with high accuracy
    const conceptAccuracy: Record<string, { correct: number; total: number }> = {};
    
    responses.forEach(response => {
      const concept = response.concept || 'general';
      if (!conceptAccuracy[concept]) {
        conceptAccuracy[concept] = { correct: 0, total: 0 };
      }
      conceptAccuracy[concept].total++;
      if (response.correct) {
        conceptAccuracy[concept].correct++;
      }
    });
    
    return Object.entries(conceptAccuracy)
      .filter(([, stats]) => stats.correct / stats.total >= 0.8)
      .map(([concept]) => concept);
  }

  private identifyImprovedSkills(game: GeneratedGame): string[] {
    return game.metadata.educationalContext?.recentTopics || [];
  }

  private identifyImprovementAreas(responses: Array<{ concept?: string; correct: boolean }>): string[] {
    // Identify areas with low accuracy
    const conceptAccuracy: Record<string, { correct: number; total: number }> = {};
    
    responses.forEach(response => {
      const concept = response.concept || 'general';
      if (!conceptAccuracy[concept]) {
        conceptAccuracy[concept] = { correct: 0, total: 0 };
      }
      conceptAccuracy[concept].total++;
      if (response.correct) {
        conceptAccuracy[concept].correct++;
      }
    });
    
    return Object.entries(conceptAccuracy)
      .filter(([, stats]) => stats.correct / stats.total < 0.6)
      .map(([concept]) => concept);
  }

  private generateNextRecommendations(game: GeneratedGame): string[] {
    const recommendations = [];
    
    // Recommend similar games
    recommendations.push(`More ${game.type} games`);
    
    // Recommend subject-specific content
    if (game.metadata.educationalContext?.subject) {
      recommendations.push(`${game.metadata.educationalContext.subject} practice`);
    }
    
    return recommendations;
  }

  // Template management
  private initializeGameTemplates(): void {
    // Load built-in templates
    Object.entries(K5_GAME_TEMPLATES).forEach(([type, template]) => {
      if (template) {
        const fullTemplate: GameTemplate = {
          ...template,
          id: `k5_${type}`,
          metadata: {
            created: new Date(),
            lastModified: new Date(),
            usageCount: 0,
            averageRating: 0,
            tags: []
          }
        };
        this.gameTemplates.set(fullTemplate.id, fullTemplate);
      }
    });
    
    Object.entries(MIDDLE_GAME_TEMPLATES).forEach(([type, template]) => {
      if (template) {
        const fullTemplate: GameTemplate = {
          ...template,
          id: `middle_${type}`,
          metadata: {
            created: new Date(),
            lastModified: new Date(),
            usageCount: 0,
            averageRating: 0,
            tags: []
          }
        };
        this.gameTemplates.set(fullTemplate.id, fullTemplate);
      }
    });
    
    Object.entries(HIGH_GAME_TEMPLATES).forEach(([type, template]) => {
      if (template) {
        const fullTemplate: GameTemplate = {
          ...template,
          id: `high_${type}`,
          metadata: {
            created: new Date(),
            lastModified: new Date(),
            usageCount: 0,
            averageRating: 0,
            tags: []
          }
        };
        this.gameTemplates.set(fullTemplate.id, fullTemplate);
      }
    });
  }

  private getTemplatesForAge(ageGroup: AgeGroup): Map<string, GameTemplate> {
    const filtered = new Map();
    
    this.gameTemplates.forEach((template, id) => {
      if (template.ageGroup === ageGroup) {
        filtered.set(id, template);
      }
    });
    
    return filtered;
  }

  // Setup and initialization
  private async loadGameTemplates(): Promise<void> {
    // In a real implementation, this would load from database
    console.log('[GameGenerationAgent] Loading game templates...');
  }

  private async loadGameAnalytics(): Promise<void> {
    // In a real implementation, this would load from database
    console.log('[GameGenerationAgent] Loading game analytics...');
  }

  private async saveGameAnalytics(): Promise<void> {
    // In a real implementation, this would save to database
    console.log('[GameGenerationAgent] Saving game analytics...');
  }

  private async initializeContentGenerators(): Promise<void> {
    console.log('[GameGenerationAgent] Initializing content generators...');
  }

  private startAnalyticsCollection(): void {
    console.log('[GameGenerationAgent] Starting analytics collection...');
  }

  private trackGameGeneration(game: GeneratedGame, _request: GameGenerationRequest): void {
    // Track game generation for analytics
    console.log('[GameGenerationAgent] Tracking game generation:', game.id);
  }

  private setupGameEventHandlers(): void {
    this.eventEmitter.on('gameCompleted', (gameId: string) => {
      console.log('[GameGenerationAgent] Game completed:', gameId);
    });
    
    this.eventEmitter.on('gameAbandoned', (gameId: string) => {
      console.log('[GameGenerationAgent] Game abandoned:', gameId);
    });
  }

  private parseGameGeneratorConfig(config: unknown): GameGeneratorConfig {
    const typedConfig = config as Partial<GameGeneratorConfig>;
    return {
      contentComplexity: typedConfig.contentComplexity || {
        k5: 2,
        middle: 4,
        high: 6
      },
      difficultyProgression: typedConfig.difficultyProgression ?? true,
      adaptiveContent: typedConfig.adaptiveContent ?? true,
      personalizedRecommendations: typedConfig.personalizedRecommendations ?? true,
      curriculumAlignment: typedConfig.curriculumAlignment ?? true,
      recentLessonIntegration: typedConfig.recentLessonIntegration ?? true,
      strugglingAreasBoost: typedConfig.strugglingAreasBoost ?? true,
      maxGamesPerSession: typedConfig.maxGamesPerSession || 10,
      contentCacheSize: typedConfig.contentCacheSize || 100,
      generationTimeout: typedConfig.generationTimeout || 30000,
      contentValidation: typedConfig.contentValidation ?? true,
      appropriatenessCheck: typedConfig.appropriatenessCheck ?? true,
      difficultyCalibration: typedConfig.difficultyCalibration ?? true,
      trackUsage: typedConfig.trackUsage ?? true,
      collectFeedback: typedConfig.collectFeedback ?? true,
      optimizeGeneration: typedConfig.optimizeGeneration ?? true
    };
  }
}