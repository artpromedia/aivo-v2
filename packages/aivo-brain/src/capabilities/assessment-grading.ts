import type { 
  ProviderManager 
} from '../providers/provider-manager';
import type {
  AIRequest,
  AIResponse,
  EducationalContext} from '../types';
import {
  TaskType,
  Priority
} from '../types';

/**
 * Assessment and Assignment Grading Service
 * Uses AI to grade assignments, provide feedback, and assess student work
 */
export class AssessmentGradingService {
  constructor(private providerManager: ProviderManager) {}

  /**
   * Grade a student's written response
   */
  async gradeWrittenResponse(
    question: string,
    studentResponse: string,
    rubric: GradingRubric,
    context: EducationalContext
  ): Promise<GradingResult> {
    const prompt = this.buildGradingPrompt(question, studentResponse, rubric, context);
    
    const aiRequest: AIRequest = {
      id: crypto.randomUUID(),
      taskType: TaskType.ASSESSMENT_GRADING,
      prompt,
      context: {
        question,
        studentResponse,
        rubric: rubric.criteria
      },
      options: {
        maxTokens: 3000,
        temperature: 0.1, // Low temperature for consistent grading
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
      return this.parseGradingResult(response, rubric);
    } catch (error) {
      console.error('Assessment grading failed:', error);
      throw new Error(`Failed to grade assessment: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Grade multiple choice or structured responses
   */
  async gradeStructuredResponse(
    question: string,
    correctAnswer: string | string[],
    studentAnswer: string | string[],
    partialCreditRules?: PartialCreditRule[]
  ): Promise<StructuredGradingResult> {
    const isCorrect = this.compareAnswers(correctAnswer, studentAnswer);
    let score = isCorrect ? 1.0 : 0.0;
    let feedback = isCorrect ? 'Correct!' : 'Incorrect.';

    // Apply partial credit rules if applicable
    if (!isCorrect && partialCreditRules) {
      const partialResult = this.applyPartialCredit(
        correctAnswer, 
        studentAnswer, 
        partialCreditRules
      );
      score = partialResult.score;
      feedback = partialResult.feedback;
    }

    return {
      id: crypto.randomUUID(),
      question,
      correctAnswer,
      studentAnswer,
      score,
      maxScore: 1.0,
      percentage: score * 100,
      isCorrect,
      feedback,
      gradedAt: new Date()
    };
  }

  /**
   * Grade an essay or long-form response
   */
  async gradeEssay(
    prompt: string,
    studentEssay: string,
    rubric: EssayRubric,
    context: EducationalContext
  ): Promise<EssayGradingResult> {
    const gradingPrompt = this.buildEssayGradingPrompt(prompt, studentEssay, rubric, context);
    
    const aiRequest: AIRequest = {
      id: crypto.randomUUID(),
      taskType: TaskType.ASSESSMENT_GRADING,
      prompt: gradingPrompt,
      context: {
        essayPrompt: prompt,
        studentEssay,
        rubric: rubric.dimensions
      },
      options: {
        maxTokens: 4000,
        temperature: 0.2,
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
      return this.parseEssayGradingResult(response, rubric);
    } catch (error) {
      console.error('Essay grading failed:', error);
      throw new Error(`Failed to grade essay: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Provide detailed feedback on student work
   */
  async provideFeedback(
    studentWork: string,
    gradingResult: GradingResult,
    context: EducationalContext,
    feedbackType: 'constructive' | 'corrective' | 'encouraging' = 'constructive'
  ): Promise<DetailedFeedback> {
    const prompt = this.buildFeedbackPrompt(studentWork, gradingResult, context, feedbackType);
    
    const aiRequest: AIRequest = {
      id: crypto.randomUUID(),
      taskType: TaskType.ASSESSMENT_GRADING,
      prompt,
      context: {
        studentWork,
        currentScore: gradingResult.score,
        feedbackType
      },
      options: {
        maxTokens: 2000,
        temperature: 0.3,
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
      return this.parseFeedbackResult(response, feedbackType);
    } catch (error) {
      console.error('Feedback generation failed:', error);
      throw new Error(`Failed to generate feedback: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private buildGradingPrompt(
    question: string,
    studentResponse: string,
    rubric: GradingRubric,
    context: EducationalContext
  ): string {
    let prompt = `Grade the following student response using the provided rubric.\n\n`;
    
    prompt += `Question: ${question}\n\n`;
    prompt += `Student Response: ${studentResponse}\n\n`;
    
    prompt += `Grading Rubric:\n`;
    rubric.criteria.forEach((criterion, index) => {
      prompt += `${index + 1}. ${criterion.name} (${criterion.weight}% of total score):\n`;
      criterion.levels.forEach(level => {
        prompt += `   - ${level.name} (${level.points} pts): ${level.description}\n`;
      });
      prompt += `\n`;
    });
    
    prompt += `Context:\n`;
    prompt += `- Grade Level: ${context.gradeLevel}\n`;
    prompt += `- Subject: ${context.subject}\n`;
    prompt += `- Language: ${context.language}\n\n`;
    
    prompt += `Provide a detailed evaluation in JSON format:
{
  "overallScore": total_score_out_of_${rubric.maxScore},
  "percentage": percentage_score,
  "criteriaScores": [
    {
      "criterionName": "criterion_name",
      "score": points_earned,
      "maxScore": max_points_possible,
      "level": "achievement_level",
      "feedback": "specific feedback for this criterion"
    }
  ],
  "overallFeedback": "comprehensive feedback on the response",
  "strengths": ["strength1", "strength2"],
  "areasForImprovement": ["improvement1", "improvement2"],
  "suggestions": ["specific suggestion1", "specific suggestion2"],
  "grade": "letter_grade_if_applicable"
}`;

    return prompt;
  }

  private buildEssayGradingPrompt(
    prompt: string,
    studentEssay: string,
    rubric: EssayRubric,
    context: EducationalContext
  ): string {
    let gradingPrompt = `Grade the following student essay using the provided rubric.\n\n`;
    
    gradingPrompt += `Essay Prompt: ${prompt}\n\n`;
    gradingPrompt += `Student Essay:\n${studentEssay}\n\n`;
    
    gradingPrompt += `Essay Grading Rubric:\n`;
    rubric.dimensions.forEach((dimension, index) => {
      gradingPrompt += `${index + 1}. ${dimension.name} (Weight: ${dimension.weight}%):\n`;
      gradingPrompt += `   Description: ${dimension.description}\n`;
      dimension.levels.forEach(level => {
        gradingPrompt += `   - ${level.score} pts: ${level.description}\n`;
      });
      gradingPrompt += `\n`;
    });
    
    gradingPrompt += `Additional Evaluation Criteria:\n`;
    gradingPrompt += `- Word count requirement: ${rubric.wordCountRange?.min || 'N/A'} - ${rubric.wordCountRange?.max || 'N/A'} words\n`;
    gradingPrompt += `- Grammar and mechanics weight: ${rubric.grammarWeight || 10}%\n\n`;
    
    gradingPrompt += `Context:\n`;
    gradingPrompt += `- Grade Level: ${context.gradeLevel}\n`;
    gradingPrompt += `- Subject: ${context.subject}\n`;
    gradingPrompt += `- Language: ${context.language}\n\n`;
    
    gradingPrompt += `Provide a comprehensive evaluation in JSON format:
{
  "overallScore": total_score,
  "maxScore": ${rubric.maxScore},
  "percentage": percentage_score,
  "letterGrade": "letter_grade",
  "dimensionScores": [
    {
      "dimensionName": "dimension_name",
      "score": points_earned,
      "maxScore": max_points,
      "feedback": "detailed feedback for this dimension"
    }
  ],
  "wordCount": actual_word_count,
  "grammarScore": grammar_mechanics_score,
  "overallFeedback": "comprehensive essay feedback",
  "strengths": ["strength1", "strength2"],
  "areasForImprovement": ["improvement1", "improvement2"],
  "specificSuggestions": ["suggestion1", "suggestion2"],
  "nextSteps": ["next_step1", "next_step2"]
}`;

    return gradingPrompt;
  }

  private buildFeedbackPrompt(
    studentWork: string,
    gradingResult: GradingResult,
    context: EducationalContext,
    feedbackType: string
  ): string {
    let prompt = `Generate ${feedbackType} feedback for the following student work.\n\n`;
    
    prompt += `Student Work: ${studentWork}\n\n`;
    prompt += `Current Score: ${gradingResult.score}/${gradingResult.maxScore} (${gradingResult.percentage}%)\n\n`;
    
    prompt += `Context:\n`;
    prompt += `- Grade Level: ${context.gradeLevel}\n`;
    prompt += `- Subject: ${context.subject}\n`;
    prompt += `- Language: ${context.language}\n\n`;
    
    switch (feedbackType) {
      case 'constructive':
        prompt += `Focus on providing specific, actionable feedback that helps the student improve.`;
        break;
      case 'corrective':
        prompt += `Focus on identifying errors and providing clear corrections.`;
        break;
      case 'encouraging':
        prompt += `Focus on positive reinforcement while gently addressing areas for improvement.`;
        break;
    }
    
    prompt += `\n\nProvide feedback in JSON format:
{
  "mainMessage": "primary feedback message",
  "specificPoints": [
    {
      "area": "specific area of work",
      "feedback": "detailed feedback",
      "suggestion": "actionable suggestion"
    }
  ],
  "encouragement": "encouraging message",
  "nextSteps": ["next_step1", "next_step2"],
  "resources": ["helpful_resource1", "helpful_resource2"]
}`;

    return prompt;
  }

  private compareAnswers(correct: string | string[], student: string | string[]): boolean {
    if (Array.isArray(correct) && Array.isArray(student)) {
      return correct.length === student.length && 
             correct.every(c => student.some(s => s.toLowerCase().trim() === c.toLowerCase().trim()));
    }
    
    if (Array.isArray(correct)) {
      return correct.some(c => c.toLowerCase().trim() === String(student).toLowerCase().trim());
    }
    
    if (Array.isArray(student)) {
      return student.some(s => s.toLowerCase().trim() === String(correct).toLowerCase().trim());
    }
    
    return String(correct).toLowerCase().trim() === String(student).toLowerCase().trim();
  }

  private applyPartialCredit(
    correct: string | string[],
    student: string | string[],
    rules: PartialCreditRule[]
  ): { score: number; feedback: string } {
    for (const rule of rules) {
      if (rule.condition(correct, student)) {
        return {
          score: rule.creditPercentage,
          feedback: rule.feedback
        };
      }
    }
    
    return { score: 0, feedback: 'Incorrect answer.' };
  }

  private parseGradingResult(response: AIResponse, rubric: GradingRubric): GradingResult {
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
        score: parsed.overallScore || 0,
        maxScore: rubric.maxScore,
        percentage: parsed.percentage || 0,
        grade: parsed.grade,
        criteriaScores: parsed.criteriaScores || [],
        feedback: parsed.overallFeedback || '',
        strengths: parsed.strengths || [],
        areasForImprovement: parsed.areasForImprovement || [],
        suggestions: parsed.suggestions || [],
        gradedAt: new Date(),
        graderId: 'ai-grader'
      };
    } catch (error) {
      console.error('Failed to parse grading result:', error);
      
      // Fallback result
      return {
        id: crypto.randomUUID(),
        score: 0,
        maxScore: rubric.maxScore,
        percentage: 0,
        feedback: 'Unable to process grading result.',
        strengths: [],
        areasForImprovement: [],
        suggestions: [],
        gradedAt: new Date(),
        graderId: 'ai-grader'
      };
    }
  }

  private parseEssayGradingResult(response: AIResponse, rubric: EssayRubric): EssayGradingResult {
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
        score: parsed.overallScore || 0,
        maxScore: parsed.maxScore || rubric.maxScore,
        percentage: parsed.percentage || 0,
        letterGrade: parsed.letterGrade,
        dimensionScores: parsed.dimensionScores || [],
        wordCount: parsed.wordCount || 0,
        grammarScore: parsed.grammarScore || 0,
        feedback: parsed.overallFeedback || '',
        strengths: parsed.strengths || [],
        areasForImprovement: parsed.areasForImprovement || [],
        suggestions: parsed.specificSuggestions || [],
        nextSteps: parsed.nextSteps || [],
        gradedAt: new Date(),
        graderId: 'ai-grader'
      };
    } catch (error) {
      console.error('Failed to parse essay grading result:', error);
      
      return {
        id: crypto.randomUUID(),
        score: 0,
        maxScore: rubric.maxScore,
        percentage: 0,
        dimensionScores: [],
        wordCount: 0,
        grammarScore: 0,
        feedback: 'Unable to process essay grading result.',
        strengths: [],
        areasForImprovement: [],
        suggestions: [],
        nextSteps: [],
        gradedAt: new Date(),
        graderId: 'ai-grader'
      };
    }
  }

  private parseFeedbackResult(response: AIResponse, feedbackType: string): DetailedFeedback {
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
        type: feedbackType as any,
        mainMessage: parsed.mainMessage || '',
        specificPoints: parsed.specificPoints || [],
        encouragement: parsed.encouragement || '',
        nextSteps: parsed.nextSteps || [],
        resources: parsed.resources || [],
        createdAt: new Date()
      };
    } catch (error) {
      console.error('Failed to parse feedback result:', error);
      
      return {
        id: crypto.randomUUID(),
        type: feedbackType as any,
        mainMessage: response.content,
        specificPoints: [],
        encouragement: 'Keep working hard!',
        nextSteps: [],
        resources: [],
        createdAt: new Date()
      };
    }
  }
}

// Supporting interfaces
export interface GradingRubric {
  id: string;
  name: string;
  maxScore: number;
  criteria: Array<{
    name: string;
    weight: number;
    levels: Array<{
      name: string;
      points: number;
      description: string;
    }>;
  }>;
}

export interface EssayRubric {
  id: string;
  name: string;
  maxScore: number;
  dimensions: Array<{
    name: string;
    description: string;
    weight: number;
    levels: Array<{
      score: number;
      description: string;
    }>;
  }>;
  wordCountRange?: {
    min: number;
    max: number;
  };
  grammarWeight?: number;
}

export interface GradingResult {
  id: string;
  score: number;
  maxScore: number;
  percentage: number;
  grade?: string;
  criteriaScores?: Array<{
    criterionName: string;
    score: number;
    maxScore: number;
    level?: string;
    feedback: string;
  }>;
  feedback: string;
  strengths: string[];
  areasForImprovement: string[];
  suggestions: string[];
  gradedAt: Date;
  graderId: string;
}

export interface EssayGradingResult extends GradingResult {
  letterGrade?: string;
  dimensionScores: Array<{
    dimensionName: string;
    score: number;
    maxScore: number;
    feedback: string;
  }>;
  wordCount: number;
  grammarScore: number;
  nextSteps: string[];
}

export interface StructuredGradingResult {
  id: string;
  question: string;
  correctAnswer: string | string[];
  studentAnswer: string | string[];
  score: number;
  maxScore: number;
  percentage: number;
  isCorrect: boolean;
  feedback: string;
  gradedAt: Date;
}

export interface DetailedFeedback {
  id: string;
  type: 'constructive' | 'corrective' | 'encouraging';
  mainMessage: string;
  specificPoints: Array<{
    area: string;
    feedback: string;
    suggestion: string;
  }>;
  encouragement: string;
  nextSteps: string[];
  resources: string[];
  createdAt: Date;
}

export interface PartialCreditRule {
  condition: (correct: string | string[], student: string | string[]) => boolean;
  creditPercentage: number;
  feedback: string;
}