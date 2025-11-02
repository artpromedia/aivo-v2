import { v4 as uuidv4 } from 'uuid';
import { BaseAgent } from './base-agent';
import type {
  AssessmentQuestion,
  AssessmentResponse,
  AssessmentResult,
  AssessmentReport,
  BaselineAssessmentAgentInterface,
  AgentConfig,
  AgentContext
} from '../types';
import {
  AgentType,
  AssessmentDomain,
  DifficultyLevel,
  DisabilityType
} from '../types';
import type { AivoBrain } from '@aivo/aivo-brain';

/**
 * BaselineAssessmentAgent - Specialized agent for adaptive baseline assessments
 * 
 * Features:
 * - Adaptive question generation based on disability type and IEP data
 * - Real-time difficulty adjustment based on student responses
 * - Multi-domain assessment across all educational areas
 * - Knowledge gap identification and analysis
 * - Comprehensive progress tracking
 * - Detailed report generation with actionable insights
 */
export class BaselineAssessmentAgent extends BaseAgent implements BaselineAssessmentAgentInterface {
  private readonly domainWeights: Map<AssessmentDomain, number>;
  private readonly difficultyProgression: Map<AssessmentDomain, DifficultyLevel>;
  private currentAssessmentSession: {
    id: string;
    startTime: Date;
    questionsGenerated: number;
    questionsAnswered: number;
    domainProgress: Map<AssessmentDomain, number>;
  } | null = null;

  constructor(
    config: AgentConfig,
    context: AgentContext,
    aivoBrain: AivoBrain
  ) {
    super(AgentType.BASELINE_ASSESSMENT, config, context, aivoBrain);
    
    // Initialize domain weights based on student's disabilities and IEP
    this.domainWeights = this.calculateDomainWeights();
    this.difficultyProgression = new Map();
    
    // Initialize all domains at developing level
    Object.values(AssessmentDomain).forEach(domain => {
      this.difficultyProgression.set(domain, DifficultyLevel.DEVELOPING);
    });
  }

  // =============================================================================
  // ABSTRACT METHOD IMPLEMENTATIONS
  // =============================================================================

  protected async initializeAgent(): Promise<void> {
    this.log('info', 'Initializing BaselineAssessmentAgent', {
      studentId: this.context.student.id,
      disabilities: this.context.student.disabilities,
      gradeLevel: this.context.student.gradeLevel
    });

    // Validate that we have necessary context for assessment
    if (!this.validateContext(['student.id', 'student.gradeLevel', 'student.disabilities'])) {
      throw new Error('Missing required context for baseline assessment');
    }

    // Initialize assessment session
    this.currentAssessmentSession = {
      id: this.generateSessionId(),
      startTime: new Date(),
      questionsGenerated: 0,
      questionsAnswered: 0,
      domainProgress: new Map()
    };

    this.log('info', 'Assessment session initialized', {
      sessionId: this.currentAssessmentSession.id
    });
  }

  protected async disposeAgent(): Promise<void> {
    if (this.currentAssessmentSession) {
      this.log('info', 'Finalizing assessment session', {
        sessionId: this.currentAssessmentSession.id,
        questionsGenerated: this.currentAssessmentSession.questionsGenerated,
        questionsAnswered: this.currentAssessmentSession.questionsAnswered
      });
      this.currentAssessmentSession = null;
    }
  }

  protected validateConfig(): boolean {
    // Validate agent-specific configuration
    return this.config.agentType === AgentType.BASELINE_ASSESSMENT &&
           this.config.studentId === this.context.student.id;
  }

  // =============================================================================
  // BASELINE ASSESSMENT INTERFACE IMPLEMENTATION
  // =============================================================================

  async generateAdaptiveQuestions(
    domain: AssessmentDomain,
    currentLevel: DifficultyLevel,
    count: number
  ): Promise<AssessmentQuestion[]> {
    this.assertInitialized();
    
    return await this.executeTask('generate_adaptive_questions', async () => {
      this.log('info', 'Generating adaptive questions', {
        domain,
        currentLevel,
        count,
        sessionId: this.currentAssessmentSession?.id
      });

      const questions: AssessmentQuestion[] = [];
      
      for (let i = 0; i < count; i++) {
        const question = await this.generateSingleQuestion(domain, currentLevel, i);
        questions.push(question);
        
        if (this.currentAssessmentSession) {
          this.currentAssessmentSession.questionsGenerated++;
        }
      }

      this.log('debug', 'Generated adaptive questions', {
        domain,
        questionsGenerated: questions.length
      });

      return questions;
    });
  }

  async evaluateResponse(
    question: AssessmentQuestion,
    response: AssessmentResponse
  ): Promise<AssessmentResult> {
    this.assertInitialized();
    
    return await this.executeTask('evaluate_response', async () => {
      this.log('debug', 'Evaluating student response', {
        questionId: question.id,
        domain: question.domain,
        difficulty: question.difficulty,
        responseTime: response.timeSpent
      });

      const evaluationPrompt = this.buildEvaluationPrompt(question, response);
      const aiResponse = await this.generateCompletion(evaluationPrompt, {
        taskType: 'assessment_grading',
        maxTokens: 1000,
        temperature: 0.1 // Low temperature for consistent grading
      });

      const result = this.parseEvaluationResponse(aiResponse.content, question, response);
      
      if (this.currentAssessmentSession) {
        this.currentAssessmentSession.questionsAnswered++;
        const domainProgress = this.currentAssessmentSession.domainProgress.get(question.domain) || 0;
        this.currentAssessmentSession.domainProgress.set(question.domain, domainProgress + 1);
      }

      this.log('debug', 'Response evaluated', {
        questionId: question.id,
        score: result.score,
        processingTime: aiResponse.metadata?.processingTime
      });

      return result;
    });
  }

  async adjustDifficulty(
    currentResults: AssessmentResult[],
    domain: AssessmentDomain
  ): Promise<DifficultyLevel> {
    return await this.executeTask('adjust_difficulty', async () => {
      const recentResults = currentResults
        .filter(r => r.domain === domain)
        .slice(-5); // Last 5 questions in this domain

      if (recentResults.length === 0) {
        return DifficultyLevel.DEVELOPING; // Default starting level
      }

      const averageScore = recentResults.reduce((sum, r) => sum + r.score, 0) / recentResults.length;
      const currentLevel = this.difficultyProgression.get(domain) || DifficultyLevel.DEVELOPING;

      let newLevel = currentLevel;

      // Adjust difficulty based on performance
      if (averageScore >= 80) {
        // Student performing well, increase difficulty
        newLevel = this.getNextDifficultyLevel(currentLevel, 'up');
      } else if (averageScore < 50) {
        // Student struggling, decrease difficulty
        newLevel = this.getNextDifficultyLevel(currentLevel, 'down');
      }
      // 50-79% range: maintain current level

      this.difficultyProgression.set(domain, newLevel);

      this.log('info', 'Difficulty adjusted', {
        domain,
        previousLevel: currentLevel,
        newLevel,
        averageScore,
        questionsConsidered: recentResults.length
      });

      return newLevel;
    });
  }

  async generateReport(results: AssessmentResult[]): Promise<AssessmentReport> {
    this.assertInitialized();
    
    return await this.executeTask('generate_assessment_report', async () => {
      this.log('info', 'Generating assessment report', {
        totalResults: results.length,
        sessionId: this.currentAssessmentSession?.id
      });

      const reportData = this.analyzeResults(results);
      const reportPrompt = this.buildReportPrompt(reportData);
      
      const aiResponse = await this.generateCompletion(reportPrompt, {
        taskType: 'assessment_report_generation',
        maxTokens: 2000,
        temperature: 0.3
      });

      const report = this.parseReportResponse(aiResponse.content, reportData);
      
      this.log('info', 'Assessment report generated', {
        overallScore: report.overallScore,
        domains: Object.keys(report.domainScores).length,
        knowledgeGaps: report.knowledgeGaps.length
      });

      return report;
    });
  }

  // =============================================================================
  // PRIVATE HELPER METHODS
  // =============================================================================

  private calculateDomainWeights(): Map<AssessmentDomain, number> {
    const weights = new Map<AssessmentDomain, number>();
    
    // Base weights for all domains
    Object.values(AssessmentDomain).forEach(domain => {
      weights.set(domain, 1.0);
    });

    // Adjust weights based on student's disabilities
    this.context.student.disabilities.forEach(disability => {
      switch (disability) {
        case DisabilityType.LEARNING_DISABILITY:
          weights.set(AssessmentDomain.READING_COMPREHENSION, 1.5);
          weights.set(AssessmentDomain.MATHEMATICS, 1.3);
          break;
        case DisabilityType.AUTISM_SPECTRUM:
          weights.set(AssessmentDomain.SOCIAL_EMOTIONAL, 1.8);
          weights.set(AssessmentDomain.ADAPTIVE_BEHAVIOR, 1.5);
          break;
        case DisabilityType.SPEECH_LANGUAGE:
          weights.set(AssessmentDomain.SPEECH_LANGUAGE, 2.0);
          weights.set(AssessmentDomain.READING_COMPREHENSION, 1.4);
          break;
        case DisabilityType.ADHD:
          weights.set(AssessmentDomain.SOCIAL_EMOTIONAL, 1.3);
          weights.set(AssessmentDomain.MATHEMATICS, 1.2);
          break;
      }
    });

    return weights;
  }

  private async generateSingleQuestion(
    domain: AssessmentDomain,
    difficulty: DifficultyLevel,
    questionIndex: number
  ): Promise<AssessmentQuestion> {
    const prompt = this.buildQuestionGenerationPrompt(domain, difficulty, questionIndex);
    
    const aiResponse = await this.generateCompletion(prompt, {
      taskType: 'question_generation',
      maxTokens: 800,
      temperature: 0.7
    });

    return this.parseQuestionResponse(aiResponse.content, domain, difficulty);
  }

  private buildQuestionGenerationPrompt(
    domain: AssessmentDomain,
    difficulty: DifficultyLevel,
    questionIndex: number
  ): string {
    const student = this.context.student;
    const accommodations = student.accommodations.join(', ') || 'None specified';
    
    return `
Generate an adaptive assessment question for a student with the following profile:

Student Profile:
- Grade Level: ${student.gradeLevel}
- Disabilities: ${student.disabilities.join(', ')}
- Accommodations: ${accommodations}
- Curriculum Region: ${student.curriculumRegion}

Assessment Parameters:
- Domain: ${domain}
- Difficulty Level: ${difficulty}
- Question Number: ${questionIndex + 1}

Requirements:
1. Question must be appropriate for the grade level and disability considerations
2. Include any necessary accommodations (visual aids, simplified language, etc.)
3. Provide multiple choice options if applicable
4. Include rubric for evaluation if it's an open-ended question
5. Consider cultural sensitivity and accessibility
6. Align with regional curriculum standards

Return the question in JSON format with the following structure:
{
  "question": "The actual question text",
  "type": "multiple_choice|short_answer|essay|interactive|visual",
  "options": ["option1", "option2", "option3", "option4"] (if applicable),
  "correctAnswer": "correct answer" (if applicable),
  "rubric": [{"criteria": "...", "points": 0-4, "description": "..."}] (if applicable),
  "accommodations": ["visual aids", "extra time", etc.],
  "timeLimit": 300 (seconds),
  "metadata": {"topic": "specific topic", "skill": "specific skill being assessed"}
}
    `.trim();
  }

  private buildEvaluationPrompt(question: AssessmentQuestion, response: AssessmentResponse): string {
    return `
Evaluate the following student response for an adaptive assessment:

Question:
${question.question}

${question.type === 'multiple_choice' ? `Options: ${question.options?.join(', ')}` : ''}
${question.correctAnswer ? `Correct Answer: ${question.correctAnswer}` : ''}

Student Response:
${response.response}

Time Spent: ${response.timeSpent} seconds (Limit: ${question.timeLimit || 'No limit'})
Confidence Level: ${response.confidence || 'Not provided'}

Student Context:
- Disabilities: ${this.context.student.disabilities.join(', ')}
- Accommodations Used: ${response.assistanceUsed?.join(', ') || 'None'}

Evaluation Criteria:
1. Accuracy of the response (0-100 points)
2. Consider disability-related factors that might affect response
3. Account for accommodations and assistance used
4. Provide constructive feedback
5. Identify strengths demonstrated in the response
6. Identify areas for improvement
7. Suggest next steps for learning

Return evaluation in JSON format:
{
  "score": 0-100,
  "feedback": "Detailed feedback explaining the score",
  "strengths": ["strength1", "strength2"],
  "weaknesses": ["area1", "area2"],
  "recommendations": ["recommendation1", "recommendation2"],
  "nextSteps": ["step1", "step2"]
}
    `.trim();
  }

  private buildReportPrompt(reportData: any): string {
    return `
Generate a comprehensive baseline assessment report for the following student data:

Student Profile:
- Name: ${this.context.student.firstName} ${this.context.student.lastName}
- Grade Level: ${this.context.student.gradeLevel}
- Disabilities: ${this.context.student.disabilities.join(', ')}

Assessment Results Summary:
- Overall Score: ${reportData.overallScore}%
- Domain Scores: ${JSON.stringify(reportData.domainScores)}
- Total Questions: ${reportData.totalQuestions}
- Assessment Duration: ${reportData.duration} minutes

Detailed Analysis:
- Strongest Areas: ${reportData.strengths.join(', ')}
- Areas of Concern: ${reportData.weaknesses.join(', ')}
- Knowledge Gaps Identified: ${reportData.gaps.length}

Generate a report that includes:
1. Executive Summary suitable for parents
2. Detailed findings for educators
3. Specific knowledge gaps with severity levels
4. Actionable recommendations prioritized by impact
5. Suggested next steps with timeline
6. Areas where the student demonstrated particular strength
7. Considerations related to the student's disabilities

Return the report in JSON format following the AssessmentReport schema.
    `.trim();
  }

  private parseQuestionResponse(
    aiResponse: string,
    domain: AssessmentDomain,
    difficulty: DifficultyLevel
  ): AssessmentQuestion {
    try {
      const parsed = JSON.parse(aiResponse);
      return {
        id: uuidv4(),
        domain,
        difficulty,
        question: parsed.question,
        type: parsed.type,
        options: parsed.options,
        correctAnswer: parsed.correctAnswer,
        rubric: parsed.rubric,
        accommodations: parsed.accommodations || [],
        timeLimit: parsed.timeLimit || 300,
        metadata: parsed.metadata || {}
      };
    } catch (error) {
      this.log('error', 'Failed to parse question response', { error, aiResponse });
      // Return a fallback question
      return {
        id: uuidv4(),
        domain,
        difficulty,
        question: `Assessment question for ${domain} at ${difficulty} level`,
        type: 'short_answer',
        timeLimit: 300,
        accommodations: []
      };
    }
  }

  private parseEvaluationResponse(
    aiResponse: string,
    question: AssessmentQuestion,
    _response: AssessmentResponse
  ): AssessmentResult {
    try {
      const parsed = JSON.parse(aiResponse);
      return {
        questionId: question.id,
        domain: question.domain,
        score: Math.min(100, Math.max(0, parsed.score)),
        feedback: parsed.feedback || 'Response evaluated.',
        strengths: parsed.strengths || [],
        weaknesses: parsed.weaknesses || [],
        recommendations: parsed.recommendations || [],
        nextSteps: parsed.nextSteps || []
      };
    } catch (error) {
      this.log('error', 'Failed to parse evaluation response', { error, aiResponse });
      // Return a basic evaluation
      return {
        questionId: question.id,
        domain: question.domain,
        score: 50, // Default middle score
        feedback: 'Response received and processed.',
        strengths: [],
        weaknesses: [],
        recommendations: ['Continue practicing in this area'],
        nextSteps: ['Review feedback with instructor']
      };
    }
  }

  private parseReportResponse(aiResponse: string, reportData: any): AssessmentReport {
    try {
      const parsed = JSON.parse(aiResponse);
      return {
        studentId: this.context.student.id,
        assessmentId: this.currentAssessmentSession?.id || uuidv4(),
        completionDate: new Date(),
        overallScore: reportData.overallScore,
        domainScores: reportData.domainScores,
        strengths: parsed.strengths || reportData.strengths,
        weaknesses: parsed.weaknesses || reportData.weaknesses,
        knowledgeGaps: parsed.knowledgeGaps || [],
        recommendations: parsed.recommendations || [],
        accommodationsUsed: this.context.student.accommodations,
        nextSteps: parsed.nextSteps || [],
        parentSummary: parsed.parentSummary || 'Assessment completed successfully.',
        teacherNotes: parsed.teacherNotes || 'Detailed results available in full report.'
      };
    } catch (error) {
      this.log('error', 'Failed to parse report response', { error, aiResponse });
      // Return basic report structure
      return {
        studentId: this.context.student.id,
        assessmentId: this.currentAssessmentSession?.id || uuidv4(),
        completionDate: new Date(),
        overallScore: reportData.overallScore,
        domainScores: reportData.domainScores,
        strengths: reportData.strengths,
        weaknesses: reportData.weaknesses,
        knowledgeGaps: [],
        recommendations: [{
          category: 'Assessment Review',
          description: 'Review assessment with educational team',
          priority: 'medium' as const,
          timeline: 'Within 1-2 weeks'
        }],
        accommodationsUsed: this.context.student.accommodations,
        nextSteps: ['Schedule follow-up assessment'],
        parentSummary: 'Assessment completed. Please review with your child\'s teacher.',
        teacherNotes: 'Assessment results require further analysis.'
      };
    }
  }

  private analyzeResults(results: AssessmentResult[]): any {
    const domainScores: { [key: string]: number } = {};
    const domainCounts: { [key: string]: number } = {};
    
    // Calculate average scores by domain
    results.forEach(result => {
      const domain = result.domain;
      if (!domainScores[domain]) {
        domainScores[domain] = 0;
        domainCounts[domain] = 0;
      }
      domainScores[domain] += result.score;
      domainCounts[domain]++;
    });

    // Calculate averages
    Object.keys(domainScores).forEach(domain => {
      domainScores[domain] = domainScores[domain] / domainCounts[domain];
    });

    const overallScore = Object.values(domainScores).reduce((sum, score) => sum + score, 0) / Object.keys(domainScores).length;
    
    const strengths = Object.entries(domainScores)
      .filter(([, score]) => score >= 75)
      .map(([domain]) => domain);
    
    const weaknesses = Object.entries(domainScores)
      .filter(([, score]) => score < 50)
      .map(([domain]) => domain);

    return {
      overallScore: Math.round(overallScore),
      domainScores: Object.fromEntries(
        Object.entries(domainScores).map(([domain, score]) => [domain, Math.round(score)])
      ),
      strengths,
      weaknesses,
      totalQuestions: results.length,
      duration: this.currentAssessmentSession 
        ? Math.round((Date.now() - this.currentAssessmentSession.startTime.getTime()) / (1000 * 60))
        : 0,
      gaps: results.filter(r => r.score < 60).map(r => ({
        domain: r.domain,
        severity: r.score < 30 ? 'high' : r.score < 50 ? 'medium' : 'low'
      }))
    };
  }

  private getNextDifficultyLevel(current: DifficultyLevel, direction: 'up' | 'down'): DifficultyLevel {
    const levels = [
      DifficultyLevel.EMERGENT,
      DifficultyLevel.DEVELOPING, 
      DifficultyLevel.PROFICIENT,
      DifficultyLevel.ADVANCED
    ];
    
    const currentIndex = levels.indexOf(current);
    
    if (direction === 'up') {
      return currentIndex < levels.length - 1 ? levels[currentIndex + 1] : current;
    } else {
      return currentIndex > 0 ? levels[currentIndex - 1] : current;
    }
  }
}