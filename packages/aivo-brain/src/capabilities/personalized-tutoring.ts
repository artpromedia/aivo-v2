import { 
  ProviderManager 
} from '../providers/provider-manager';
import {
  AIRequest,
  AIResponse,
  TaskType,
  EducationalContext,
  Priority
} from '../types';

/**
 * Personalized Tutoring Service
 * Provides adaptive, personalized tutoring sessions and learning support
 */
export class PersonalizedTutoringService {
  private learningProfiles: Map<string, StudentLearningProfile> = new Map();
  
  constructor(private providerManager: ProviderManager) {}

  /**
   * Start a personalized tutoring session
   */
  async startTutoringSession(
    studentId: string,
    topic: string,
    context: EducationalContext,
    sessionType: 'review' | 'new_concept' | 'problem_solving' | 'test_prep' = 'new_concept'
  ): Promise<TutoringSession> {
    const profile = this.getOrCreateLearningProfile(studentId);
    const sessionId = crypto.randomUUID();
    
    const prompt = this.buildTutoringSessionPrompt(topic, context, profile, sessionType);
    
    const aiRequest: AIRequest = {
      id: crypto.randomUUID(),
      taskType: TaskType.PERSONALIZED_TUTORING,
      prompt,
      context: {
        studentId,
        topic,
        sessionType,
        learningProfile: profile.preferences
      },
      options: {
        maxTokens: 2000,
        temperature: 0.6,
        topP: 0.9,
        retries: 3,
        stream: false
      },
      metadata: {
        gradeLevel: context.gradeLevel,
        subject: context.subject,
        language: context.language,
        priority: Priority.NORMAL
      }
    };

    try {
      const response = await this.providerManager.generateCompletion(aiRequest);
      const sessionPlan = this.parseSessionPlan(response);
      
      const session: TutoringSession = {
        id: sessionId,
        studentId,
        topic,
        sessionType,
        context,
        plan: sessionPlan,
        interactions: [],
        startTime: new Date(),
        status: 'active',
        progress: {
          currentStep: 0,
          totalSteps: sessionPlan.steps.length,
          completedSteps: [],
          strugglingAreas: [],
          masteredConcepts: []
        }
      };
      
      return session;
    } catch (error) {
      console.error('Tutoring session initialization failed:', error);
      throw new Error(`Failed to start tutoring session: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Process student interaction and provide tutoring response
   */
  async processStudentInteraction(
    sessionId: string,
    studentInput: string,
    interactionType: 'question' | 'answer' | 'request_help' | 'confusion' = 'question'
  ): Promise<TutoringResponse> {
    const session = await this.getTutoringSession(sessionId);
    if (!session) {
      throw new Error('Tutoring session not found');
    }

    const profile = this.getOrCreateLearningProfile(session.studentId);
    const prompt = this.buildInteractionPrompt(session, studentInput, interactionType, profile);
    
    const aiRequest: AIRequest = {
      id: crypto.randomUUID(),
      taskType: TaskType.PERSONALIZED_TUTORING,
      prompt,
      context: {
        sessionId,
        currentStep: session.progress.currentStep,
        interactionType,
        sessionHistory: session.interactions.slice(-5) // Last 5 interactions for context
      },
      options: {
        maxTokens: 1500,
        temperature: 0.5,
        topP: 0.9,
        retries: 3,
        stream: false
      },
      metadata: {
        gradeLevel: session.context.gradeLevel,
        subject: session.context.subject,
        language: session.context.language,
        priority: Priority.HIGH
      }
    };

    try {
      const response = await this.providerManager.generateCompletion(aiRequest);
      const tutoringResponse = this.parseTutoringResponse(response, interactionType);
      
      // Record the interaction
      const interaction: TutoringInteraction = {
        id: crypto.randomUUID(),
        timestamp: new Date(),
        studentInput,
        tutorResponse: tutoringResponse.message,
        type: interactionType,
        effectiveness: tutoringResponse.effectiveness,
        metadata: {
          step: session.progress.currentStep,
          concept: session.plan.steps[session.progress.currentStep]?.concept || session.topic
        }
      };
      
      session.interactions.push(interaction);
      
      // Update learning profile based on interaction
      this.updateLearningProfile(session.studentId, interaction, tutoringResponse);
      
      return tutoringResponse;
    } catch (error) {
      console.error('Tutoring interaction processing failed:', error);
      throw new Error(`Failed to process interaction: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Provide adaptive hints for problem solving
   */
  async provideHint(
    sessionId: string,
    problemContext: string,
    hintLevel: 'gentle' | 'moderate' | 'strong' = 'gentle'
  ): Promise<AdaptiveHint> {
    const session = await this.getTutoringSession(sessionId);
    if (!session) {
      throw new Error('Tutoring session not found');
    }

    const profile = this.getOrCreateLearningProfile(session.studentId);
    const prompt = this.buildHintPrompt(problemContext, hintLevel, profile, session.context);
    
    const aiRequest: AIRequest = {
      id: crypto.randomUUID(),
      taskType: TaskType.PERSONALIZED_TUTORING,
      prompt,
      context: {
        sessionId,
        problemContext,
        hintLevel,
        previousHints: session.interactions.filter(i => i.type === 'request_help').length
      },
      options: {
        maxTokens: 800,
        temperature: 0.4,
        topP: 0.8,
        retries: 3,
        stream: false
      },
      metadata: {
        gradeLevel: session.context.gradeLevel,
        subject: session.context.subject,
        language: session.context.language,
        priority: Priority.HIGH
      }
    };

    try {
      const response = await this.providerManager.generateCompletion(aiRequest);
      return this.parseHint(response, hintLevel);
    } catch (error) {
      console.error('Hint generation failed:', error);
      throw new Error(`Failed to generate hint: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Assess student understanding and adapt teaching approach
   */
  async assessUnderstanding(
    sessionId: string,
    assessmentType: 'quick_check' | 'concept_mastery' | 'misconception_check' = 'quick_check'
  ): Promise<UnderstandingAssessment> {
    const session = await this.getTutoringSession(sessionId);
    if (!session) {
      throw new Error('Tutoring session not found');
    }

    const recentInteractions = session.interactions.slice(-10);
    const prompt = this.buildAssessmentPrompt(session, recentInteractions, assessmentType);
    
    const aiRequest: AIRequest = {
      id: crypto.randomUUID(),
      taskType: TaskType.PERSONALIZED_TUTORING,
      prompt,
      context: {
        sessionId,
        assessmentType,
        interactionCount: recentInteractions.length
      },
      options: {
        maxTokens: 1000,
        temperature: 0.2,
        topP: 0.7,
        retries: 3,
        stream: false
      },
      metadata: {
        gradeLevel: session.context.gradeLevel,
        subject: session.context.subject,
        language: session.context.language,
        priority: Priority.NORMAL
      }
    };

    try {
      const response = await this.providerManager.generateCompletion(aiRequest);
      const assessment = this.parseUnderstandingAssessment(response, assessmentType);
      
      // Update session progress based on assessment
      this.updateSessionProgress(session, assessment);
      
      return assessment;
    } catch (error) {
      console.error('Understanding assessment failed:', error);
      throw new Error(`Failed to assess understanding: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Generate personalized practice problems
   */
  async generatePracticeProblems(
    studentId: string,
    topic: string,
    context: EducationalContext,
    count: number = 3,
    difficulty?: 'adaptive' | 'easy' | 'medium' | 'hard'
  ): Promise<PracticeProblem[]> {
    const profile = this.getOrCreateLearningProfile(studentId);
    const adaptedDifficulty = difficulty === 'adaptive' 
      ? this.determineDifficulty(profile, topic)
      : difficulty || 'medium';

    const prompt = this.buildPracticeProblemsPrompt(topic, context, profile, count, adaptedDifficulty);
    
    const aiRequest: AIRequest = {
      id: crypto.randomUUID(),
      taskType: TaskType.PERSONALIZED_TUTORING,
      prompt,
      context: {
        studentId,
        topic,
        targetDifficulty: adaptedDifficulty
      },
      options: {
        maxTokens: 3000,
        temperature: 0.4,
        topP: 0.8,
        retries: 3,
        stream: false
      },
      metadata: {
        gradeLevel: context.gradeLevel,
        subject: context.subject,
        language: context.language,
        priority: Priority.NORMAL
      }
    };

    try {
      const response = await this.providerManager.generateCompletion(aiRequest);
      return this.parsePracticeProblems(response, adaptedDifficulty);
    } catch (error) {
      console.error('Practice problem generation failed:', error);
      throw new Error(`Failed to generate practice problems: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private buildTutoringSessionPrompt(
    topic: string, 
    context: EducationalContext, 
    profile: StudentLearningProfile,
    sessionType: string
  ): string {
    let prompt = `Create a personalized tutoring session plan for the following topic.\n\n`;
    
    prompt += `Topic: ${topic}\n`;
    prompt += `Session Type: ${sessionType}\n\n`;
    
    prompt += `Educational Context:\n`;
    prompt += `- Grade Level: ${context.gradeLevel}\n`;
    prompt += `- Subject: ${context.subject}\n`;
    prompt += `- Language: ${context.language}\n\n`;
    
    prompt += `Student Learning Profile:\n`;
    prompt += `- Learning Style: ${profile.preferences.learningStyle}\n`;
    prompt += `- Interaction Style: ${profile.preferences.interactionStyle}\n`;
    prompt += `- Difficulty Preference: ${profile.preferences.difficultyPreference}\n`;
    
    if (profile.strengths.length > 0) {
      prompt += `- Strengths: ${profile.strengths.join(', ')}\n`;
    }
    
    if (profile.challengeAreas.length > 0) {
      prompt += `- Challenge Areas: ${profile.challengeAreas.join(', ')}\n`;
    }

    prompt += `\nCreate a session plan in JSON format:
{
  "sessionGoals": ["goal1", "goal2"],
  "estimatedDuration": "minutes",
  "steps": [
    {
      "stepNumber": 1,
      "concept": "concept_to_teach",
      "approach": "teaching_approach",
      "activities": ["activity1", "activity2"],
      "checkpoints": ["checkpoint1", "checkpoint2"],
      "estimatedTime": "minutes"
    }
  ],
  "adaptationTriggers": [
    {
      "condition": "if_student_struggles",
      "action": "how_to_adapt"
    }
  ],
  "resources": ["resource1", "resource2"],
  "assessmentStrategy": "how_to_assess_progress"
}`;

    return prompt;
  }

  private buildInteractionPrompt(
    session: TutoringSession,
    studentInput: string,
    interactionType: string,
    profile: StudentLearningProfile
  ): string {
    let prompt = `Respond as a personalized AI tutor to the student's input.\n\n`;
    
    prompt += `Session Context:\n`;
    prompt += `- Topic: ${session.topic}\n`;
    prompt += `- Current Step: ${session.progress.currentStep + 1}/${session.progress.totalSteps}\n`;
    prompt += `- Session Type: ${session.sessionType}\n\n`;
    
    prompt += `Student Input: "${studentInput}"\n`;
    prompt += `Interaction Type: ${interactionType}\n\n`;
    
    prompt += `Student Profile:\n`;
    prompt += `- Learning Style: ${profile.preferences.learningStyle}\n`;
    prompt += `- Interaction Style: ${profile.preferences.interactionStyle}\n\n`;
    
    if (session.interactions.length > 0) {
      prompt += `Recent Interaction History:\n`;
      session.interactions.slice(-3).forEach((interaction, index) => {
        prompt += `${index + 1}. Student: "${interaction.studentInput}"\n`;
        prompt += `   Tutor: "${interaction.tutorResponse}"\n`;
      });
      prompt += `\n`;
    }

    prompt += `Provide a tutoring response in JSON format:
{
  "message": "personalized_response_to_student",
  "reasoning": "why_this_response_is_appropriate",
  "nextSuggestion": "suggested_next_action_for_student",
  "encouragement": "encouraging_message",
  "effectiveness": "high|medium|low",
  "adaptations": ["adaptation1", "adaptation2"],
  "followUpQuestions": ["question1", "question2"]
}`;

    return prompt;
  }

  private buildHintPrompt(
    problemContext: string,
    hintLevel: string,
    profile: StudentLearningProfile,
    context: EducationalContext
  ): string {
    let prompt = `Provide a ${hintLevel} hint for the following problem context.\n\n`;
    
    prompt += `Problem Context: ${problemContext}\n\n`;
    prompt += `Hint Level: ${hintLevel}\n`;
    prompt += `- gentle: Subtle guidance without giving away the answer\n`;
    prompt += `- moderate: More direct guidance with partial information\n`;
    prompt += `- strong: Clear direction with significant scaffolding\n\n`;
    
    prompt += `Student Profile:\n`;
    prompt += `- Learning Style: ${profile.preferences.learningStyle}\n`;
    prompt += `- Grade Level: ${context.gradeLevel}\n`;
    prompt += `- Subject: ${context.subject}\n\n`;

    prompt += `Provide hint in JSON format:
{
  "hintText": "the_hint_message",
  "hintType": "conceptual|procedural|strategic",
  "reasoning": "why_this_hint_is_appropriate",
  "nextLevel": "what_stronger_hint_would_be",
  "encouragement": "encouraging_message",
  "visualAid": "description_of_helpful_visual_if_applicable"
}`;

    return prompt;
  }

  private buildAssessmentPrompt(
    session: TutoringSession,
    interactions: TutoringInteraction[],
    assessmentType: string
  ): string {
    let prompt = `Assess the student's understanding based on recent interactions.\n\n`;
    
    prompt += `Topic: ${session.topic}\n`;
    prompt += `Assessment Type: ${assessmentType}\n\n`;
    
    prompt += `Recent Interactions:\n`;
    interactions.forEach((interaction, index) => {
      prompt += `${index + 1}. Type: ${interaction.type}\n`;
      prompt += `   Student: "${interaction.studentInput}"\n`;
      prompt += `   Tutor: "${interaction.tutorResponse}"\n`;
      prompt += `   Effectiveness: ${interaction.effectiveness}\n\n`;
    });

    prompt += `Provide assessment in JSON format:
{
  "understandingLevel": "high|medium|low|unclear",
  "confidence": "high|medium|low",
  "misconceptions": ["misconception1", "misconception2"],
  "masteredConcepts": ["concept1", "concept2"],
  "strugglingAreas": ["area1", "area2"],
  "recommendations": [
    {
      "action": "recommended_action",
      "reason": "why_this_recommendation",
      "priority": "high|medium|low"
    }
  ],
  "readinessForNext": "ready|needs_review|needs_reteaching"
}`;

    return prompt;
  }

  private buildPracticeProblemsPrompt(
    topic: string,
    context: EducationalContext,
    profile: StudentLearningProfile,
    count: number,
    difficulty: string
  ): string {
    let prompt = `Generate ${count} practice problems for the following topic.\n\n`;
    
    prompt += `Topic: ${topic}\n`;
    prompt += `Difficulty: ${difficulty}\n`;
    prompt += `Grade Level: ${context.gradeLevel}\n`;
    prompt += `Subject: ${context.subject}\n\n`;
    
    prompt += `Student Preferences:\n`;
    prompt += `- Learning Style: ${profile.preferences.learningStyle}\n`;
    
    if (profile.strengths.length > 0) {
      prompt += `- Strengths: ${profile.strengths.join(', ')}\n`;
    }
    
    if (profile.challengeAreas.length > 0) {
      prompt += `- Areas to Practice: ${profile.challengeAreas.join(', ')}\n`;
    }

    prompt += `\nGenerate problems in JSON format:
[
  {
    "id": "problem_id",
    "problem": "problem_statement",
    "solution": "step_by_step_solution",
    "hints": ["hint1", "hint2", "hint3"],
    "difficulty": "${difficulty}",
    "estimatedTime": "minutes",
    "conceptsFocused": ["concept1", "concept2"],
    "scaffolding": {
      "setup": "how_to_set_up_problem",
      "steps": ["step1", "step2", "step3"],
      "checks": ["what_to_check_along_the_way"]
    }
  }
]`;

    return prompt;
  }

  // Parsing and helper methods
  private parseSessionPlan(response: AIResponse): SessionPlan {
    try {
      const content = response.content.trim();
      let jsonStr = content;
      
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        jsonStr = jsonMatch[1];
      }

      return JSON.parse(jsonStr);
    } catch (error) {
      console.error('Failed to parse session plan:', error);
      return this.getDefaultSessionPlan();
    }
  }

  private parseTutoringResponse(response: AIResponse, interactionType: string): TutoringResponse {
    try {
      const content = response.content.trim();
      let jsonStr = content;
      
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        jsonStr = jsonMatch[1];
      }

      const parsed = JSON.parse(jsonStr);
      return {
        message: parsed.message || response.content,
        reasoning: parsed.reasoning || '',
        nextSuggestion: parsed.nextSuggestion || '',
        encouragement: parsed.encouragement || '',
        effectiveness: parsed.effectiveness || 'medium',
        adaptations: parsed.adaptations || [],
        followUpQuestions: parsed.followUpQuestions || []
      };
    } catch (error) {
      console.error('Failed to parse tutoring response:', error);
      return {
        message: response.content,
        reasoning: 'Direct response',
        nextSuggestion: 'Continue practicing',
        encouragement: 'Keep up the good work!',
        effectiveness: 'medium',
        adaptations: [],
        followUpQuestions: []
      };
    }
  }

  private parseHint(response: AIResponse, hintLevel: string): AdaptiveHint {
    try {
      const content = response.content.trim();
      let jsonStr = content;
      
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        jsonStr = jsonMatch[1];
      }

      const parsed = JSON.parse(jsonStr);
      return {
        id: crypto.randomUUID(),
        level: hintLevel as any,
        text: parsed.hintText || response.content,
        type: parsed.hintType || 'conceptual',
        reasoning: parsed.reasoning || '',
        nextLevel: parsed.nextLevel || '',
        encouragement: parsed.encouragement || '',
        visualAid: parsed.visualAid,
        createdAt: new Date()
      };
    } catch (error) {
      console.error('Failed to parse hint:', error);
      return {
        id: crypto.randomUUID(),
        level: hintLevel as any,
        text: response.content,
        type: 'conceptual',
        reasoning: 'Direct hint',
        encouragement: 'You can do this!',
        createdAt: new Date()
      };
    }
  }

  private parseUnderstandingAssessment(response: AIResponse, assessmentType: string): UnderstandingAssessment {
    try {
      const content = response.content.trim();
      let jsonStr = content;
      
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        jsonStr = jsonMatch[1];
      }

      const parsed = JSON.parse(jsonStr);
      return {
        id: crypto.randomUUID(),
        type: assessmentType as any,
        understandingLevel: parsed.understandingLevel || 'medium',
        confidence: parsed.confidence || 'medium',
        misconceptions: parsed.misconceptions || [],
        masteredConcepts: parsed.masteredConcepts || [],
        strugglingAreas: parsed.strugglingAreas || [],
        recommendations: parsed.recommendations || [],
        readinessForNext: parsed.readinessForNext || 'needs_review',
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Failed to parse understanding assessment:', error);
      return {
        id: crypto.randomUUID(),
        type: assessmentType as any,
        understandingLevel: 'medium',
        confidence: 'medium',
        misconceptions: [],
        masteredConcepts: [],
        strugglingAreas: [],
        recommendations: [],
        readinessForNext: 'needs_review',
        timestamp: new Date()
      };
    }
  }

  private parsePracticeProblems(response: AIResponse, difficulty: string): PracticeProblem[] {
    try {
      const content = response.content.trim();
      let jsonStr = content;
      
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        jsonStr = jsonMatch[1];
      }

      const parsed = JSON.parse(jsonStr);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.error('Failed to parse practice problems:', error);
      return [];
    }
  }

  private getOrCreateLearningProfile(studentId: string): StudentLearningProfile {
    if (!this.learningProfiles.has(studentId)) {
      this.learningProfiles.set(studentId, {
        studentId,
        preferences: {
          learningStyle: 'mixed',
          interactionStyle: 'encouraging',
          difficultyPreference: 'adaptive',
          pacePreference: 'medium'
        },
        strengths: [],
        challengeAreas: [],
        learningHistory: [],
        adaptationTriggers: new Map(),
        lastUpdated: new Date()
      });
    }
    return this.learningProfiles.get(studentId)!;
  }

  private async getTutoringSession(sessionId: string): Promise<TutoringSession | null> {
    // In a real implementation, this would fetch from a database
    // For now, return null to indicate session not found
    return null;
  }

  private updateLearningProfile(
    studentId: string, 
    interaction: TutoringInteraction, 
    response: TutoringResponse
  ): void {
    const profile = this.getOrCreateLearningProfile(studentId);
    
    // Add interaction to learning history
    profile.learningHistory.push({
      timestamp: interaction.timestamp,
      topic: interaction.metadata?.concept || 'unknown',
      performance: response.effectiveness,
      interactionType: interaction.type
    });
    
    // Update profile based on interaction patterns
    if (response.effectiveness === 'low' && interaction.metadata?.concept) {
      if (!profile.challengeAreas.includes(interaction.metadata.concept)) {
        profile.challengeAreas.push(interaction.metadata.concept);
      }
    } else if (response.effectiveness === 'high' && interaction.metadata?.concept) {
      if (!profile.strengths.includes(interaction.metadata.concept)) {
        profile.strengths.push(interaction.metadata.concept);
      }
    }
    
    profile.lastUpdated = new Date();
  }

  private updateSessionProgress(session: TutoringSession, assessment: UnderstandingAssessment): void {
    // Update session progress based on understanding assessment
    session.progress.masteredConcepts.push(...assessment.masteredConcepts);
    session.progress.strugglingAreas.push(...assessment.strugglingAreas);
    
    // Move to next step if ready
    if (assessment.readinessForNext === 'ready' && 
        session.progress.currentStep < session.progress.totalSteps - 1) {
      session.progress.completedSteps.push(session.progress.currentStep);
      session.progress.currentStep++;
    }
  }

  private determineDifficulty(profile: StudentLearningProfile, topic: string): 'easy' | 'medium' | 'hard' {
    if (profile.challengeAreas.includes(topic)) {
      return 'easy';
    } else if (profile.strengths.includes(topic)) {
      return 'hard';
    }
    return 'medium';
  }

  private getDefaultSessionPlan(): SessionPlan {
    return {
      sessionGoals: ['Understand the topic', 'Practice application'],
      estimatedDuration: '30 minutes',
      steps: [{
        stepNumber: 1,
        concept: 'Introduction',
        approach: 'Guided discovery',
        activities: ['Discussion', 'Examples'],
        checkpoints: ['Check understanding'],
        estimatedTime: '15 minutes'
      }],
      adaptationTriggers: [],
      resources: [],
      assessmentStrategy: 'Formative assessment'
    };
  }
}

// Supporting interfaces
export interface StudentLearningProfile {
  studentId: string;
  preferences: {
    learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'reading' | 'mixed';
    interactionStyle: 'formal' | 'casual' | 'encouraging' | 'direct';
    difficultyPreference: 'adaptive' | 'challenging' | 'comfortable';
    pacePreference: 'slow' | 'medium' | 'fast';
  };
  strengths: string[];
  challengeAreas: string[];
  learningHistory: Array<{
    timestamp: Date;
    topic: string;
    performance: 'high' | 'medium' | 'low';
    interactionType: string;
  }>;
  adaptationTriggers: Map<string, string>;
  lastUpdated: Date;
}

export interface TutoringSession {
  id: string;
  studentId: string;
  topic: string;
  sessionType: 'review' | 'new_concept' | 'problem_solving' | 'test_prep';
  context: EducationalContext;
  plan: SessionPlan;
  interactions: TutoringInteraction[];
  startTime: Date;
  endTime?: Date;
  status: 'active' | 'completed' | 'paused' | 'abandoned';
  progress: {
    currentStep: number;
    totalSteps: number;
    completedSteps: number[];
    strugglingAreas: string[];
    masteredConcepts: string[];
  };
}

export interface SessionPlan {
  sessionGoals: string[];
  estimatedDuration: string;
  steps: Array<{
    stepNumber: number;
    concept: string;
    approach: string;
    activities: string[];
    checkpoints: string[];
    estimatedTime: string;
  }>;
  adaptationTriggers: Array<{
    condition: string;
    action: string;
  }>;
  resources: string[];
  assessmentStrategy: string;
}

export interface TutoringInteraction {
  id: string;
  timestamp: Date;
  studentInput: string;
  tutorResponse: string;
  type: 'question' | 'answer' | 'request_help' | 'confusion';
  effectiveness: 'high' | 'medium' | 'low';
  metadata?: {
    step: number;
    concept: string;
  };
}

export interface TutoringResponse {
  message: string;
  reasoning: string;
  nextSuggestion: string;
  encouragement: string;
  effectiveness: 'high' | 'medium' | 'low';
  adaptations: string[];
  followUpQuestions: string[];
}

export interface AdaptiveHint {
  id: string;
  level: 'gentle' | 'moderate' | 'strong';
  text: string;
  type: 'conceptual' | 'procedural' | 'strategic';
  reasoning: string;
  nextLevel?: string;
  encouragement: string;
  visualAid?: string;
  createdAt: Date;
}

export interface UnderstandingAssessment {
  id: string;
  type: 'quick_check' | 'concept_mastery' | 'misconception_check';
  understandingLevel: 'high' | 'medium' | 'low' | 'unclear';
  confidence: 'high' | 'medium' | 'low';
  misconceptions: string[];
  masteredConcepts: string[];
  strugglingAreas: string[];
  recommendations: Array<{
    action: string;
    reason: string;
    priority: 'high' | 'medium' | 'low';
  }>;
  readinessForNext: 'ready' | 'needs_review' | 'needs_reteaching';
  timestamp: Date;
}

export interface PracticeProblem {
  id: string;
  problem: string;
  solution: string;
  hints: string[];
  difficulty: string;
  estimatedTime: string;
  conceptsFocused: string[];
  scaffolding: {
    setup: string;
    steps: string[];
    checks: string[];
  };
}