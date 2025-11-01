import { 
  ProviderManager 
} from '../providers/provider-manager';
import {
  AIRequest,
  AIResponse,
  TaskType,
  QuestionType,
  QuestionGenerationRequest,
  GeneratedQuestion,
  EducationalContext,
  Priority
} from '../types';

/**
 * Question Generation Service
 * Uses AI to generate educational questions based on content and context
 */
export class QuestionGenerationService {
  constructor(private providerManager: ProviderManager) {}

  /**
   * Generate questions from educational content
   */
  async generateQuestions(request: QuestionGenerationRequest): Promise<GeneratedQuestion[]> {
    const prompt = this.buildQuestionGenerationPrompt(request);
    
    const aiRequest: AIRequest = {
      id: crypto.randomUUID(),
      taskType: TaskType.QUESTION_GENERATION,
      prompt,
      context: {
        content: request.content,
        questionType: request.questionType,
        count: request.count,
        difficulty: request.difficulty
      },
      options: {
        maxTokens: 4000,
        temperature: 0.7,
        topP: 0.9,
        retries: 3,
        stream: false
      },
      metadata: {
        gradeLevel: request.context.gradeLevel,
        subject: request.context.subject,
        language: request.context.language,
        priority: Priority.NORMAL
      }
    };

    try {
      const response = await this.providerManager.generateCompletion(aiRequest);
      return this.parseQuestionsFromResponse(response, request);
    } catch (error) {
      console.error('Question generation failed:', error);
      throw new Error(`Failed to generate questions: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Generate adaptive questions based on student performance
   */
  async generateAdaptiveQuestions(
    request: QuestionGenerationRequest,
    studentPerformance: {
      correctAnswers: number;
      totalAttempts: number;
      averageTime: number;
      strugglingTopics: string[];
    }
  ): Promise<GeneratedQuestion[]> {
    const adaptedRequest = this.adaptRequestToPerformance(request, studentPerformance);
    return this.generateQuestions(adaptedRequest);
  }

  /**
   * Generate questions for specific learning objectives
   */
  async generateObjectiveBasedQuestions(
    content: string,
    context: EducationalContext,
    learningObjectives: string[],
    questionType: QuestionType,
    count: number
  ): Promise<GeneratedQuestion[]> {
    const request: QuestionGenerationRequest = {
      content,
      context: {
        ...context,
        learningObjectives
      },
      questionType,
      count,
      difficulty: 'medium',
      options: {
        includeExplanations: true,
        adaptiveLevel: true
      }
    };

    return this.generateQuestions(request);
  }

  private buildQuestionGenerationPrompt(request: QuestionGenerationRequest): string {
    let prompt = `Generate ${request.count} ${request.questionType} question(s) based on the following educational content.\n\n`;
    
    prompt += `Content:\n${request.content}\n\n`;
    
    prompt += `Context:\n`;
    prompt += `- Grade Level: ${request.context.gradeLevel}\n`;
    prompt += `- Subject: ${request.context.subject}\n`;
    prompt += `- Difficulty: ${request.difficulty}\n`;
    prompt += `- Language: ${request.context.language}\n`;
    
    if (request.context.learningObjectives?.length) {
      prompt += `- Learning Objectives: ${request.context.learningObjectives.join(', ')}\n`;
    }
    
    if (request.context.accommodations?.length) {
      prompt += `- Accommodations: ${request.context.accommodations.join(', ')}\n`;
    }

    prompt += `\nQuestion Type: ${request.questionType}\n`;

    // Add specific instructions based on question type
    switch (request.questionType) {
      case QuestionType.MULTIPLE_CHOICE:
        prompt += `\nFor multiple choice questions:
- Provide 4 options (A, B, C, D)
- Only one correct answer
- Make distractors plausible but clearly incorrect
- Avoid "all of the above" or "none of the above" options`;
        break;
      
      case QuestionType.TRUE_FALSE:
        prompt += `\nFor true/false questions:
- Make statements that require understanding, not just memorization
- Avoid absolute terms unless they are accurate`;
        break;
      
      case QuestionType.SHORT_ANSWER:
        prompt += `\nFor short answer questions:
- Expect 1-3 sentence responses
- Focus on key concepts and understanding`;
        break;
      
      case QuestionType.ESSAY:
        prompt += `\nFor essay questions:
- Require analysis, synthesis, or evaluation
- Provide clear expectations for response length
- Include specific aspects to address`;
        break;
      
      case QuestionType.MATH_PROBLEM:
        prompt += `\nFor math problems:
- Show clear step-by-step solutions
- Include appropriate diagrams or visual aids descriptions if needed
- Vary problem types and contexts`;
        break;
    }

    if (request.options?.includeExplanations) {
      prompt += `\n- Include explanations for correct answers`;
    }

    prompt += `\nFormat the response as a JSON array with the following structure for each question:
{
  "id": "unique_id",
  "type": "${request.questionType}",
  "question": "question text",
  "options": ["option1", "option2", "option3", "option4"], // for multiple choice only
  "correctAnswer": "correct answer or option letter",
  "explanation": "explanation of the correct answer",
  "difficulty": "${request.difficulty}",
  "bloomsLevel": "knowledge|comprehension|application|analysis|synthesis|evaluation",
  "estimatedTime": minutes_to_complete,
  "metadata": {
    "topics": ["topic1", "topic2"],
    "standards": ["standard1", "standard2"],
    "cognitiveLoad": 1-5_scale
  }
}`;

    return prompt;
  }

  private parseQuestionsFromResponse(response: AIResponse, request: QuestionGenerationRequest): GeneratedQuestion[] {
    try {
      // Try to extract JSON from the response
      const content = response.content.trim();
      let jsonStr = content;
      
      // Handle cases where the response includes markdown code blocks
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        jsonStr = jsonMatch[1];
      } else {
        // Look for array patterns
        const arrayMatch = content.match(/\[[\s\S]*\]/);
        if (arrayMatch) {
          jsonStr = arrayMatch[0];
        }
      }

      const questions = JSON.parse(jsonStr);
      
      if (!Array.isArray(questions)) {
        throw new Error('Response is not an array');
      }

      return questions.map((q: any, index: number) => ({
        id: q.id || crypto.randomUUID(),
        type: q.type || request.questionType,
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        difficulty: q.difficulty || request.difficulty,
        bloomsLevel: q.bloomsLevel || 'knowledge',
        estimatedTime: q.estimatedTime || 5,
        metadata: {
          topics: q.metadata?.topics || [],
          standards: q.metadata?.standards || [],
          cognitiveLoad: q.metadata?.cognitiveLoad || 3
        }
      }));

    } catch (error) {
      console.error('Failed to parse questions from response:', error);
      console.log('Raw response:', response.content);
      
      // Fallback: try to extract questions using text patterns
      return this.extractQuestionsFromText(response.content, request);
    }
  }

  private extractQuestionsFromText(content: string, request: QuestionGenerationRequest): GeneratedQuestion[] {
    // Simple text extraction as fallback
    const questions: GeneratedQuestion[] = [];
    const lines = content.split('\n').filter(line => line.trim());
    
    let currentQuestion = '';
    let questionCount = 0;
    
    for (const line of lines) {
      if (line.match(/^\d+\.|^Q\d+:|^Question/i)) {
        if (currentQuestion && questionCount < request.count) {
          questions.push({
            id: crypto.randomUUID(),
            type: request.questionType,
            question: currentQuestion.trim(),
            correctAnswer: '',
            difficulty: request.difficulty,
            bloomsLevel: 'knowledge',
            estimatedTime: 5,
            metadata: {
              topics: [],
              standards: [],
              cognitiveLoad: 3
            }
          });
          questionCount++;
        }
        currentQuestion = line.replace(/^\d+\.|^Q\d+:|^Question\s*\d+:?/i, '').trim();
      } else if (currentQuestion) {
        currentQuestion += ' ' + line.trim();
      }
    }
    
    // Add the last question if exists
    if (currentQuestion && questionCount < request.count) {
      questions.push({
        id: crypto.randomUUID(),
        type: request.questionType,
        question: currentQuestion.trim(),
        correctAnswer: '',
        difficulty: request.difficulty,
        bloomsLevel: 'knowledge',
        estimatedTime: 5,
        metadata: {
          topics: [],
          standards: [],
          cognitiveLoad: 3
        }
      });
    }

    return questions.slice(0, request.count);
  }

  private adaptRequestToPerformance(
    request: QuestionGenerationRequest,
    performance: {
      correctAnswers: number;
      totalAttempts: number;
      averageTime: number;
      strugglingTopics: string[];
    }
  ): QuestionGenerationRequest {
    const successRate = performance.totalAttempts > 0 
      ? performance.correctAnswers / performance.totalAttempts 
      : 0.5;

    // Adapt difficulty based on performance
    let adaptedDifficulty: 'easy' | 'medium' | 'hard' = request.difficulty;
    
    if (successRate < 0.4) {
      adaptedDifficulty = 'easy';
    } else if (successRate > 0.8) {
      adaptedDifficulty = 'hard';
    } else {
      adaptedDifficulty = 'medium';
    }

    // Focus on struggling topics if any
    let adaptedContext = { ...request.context };
    if (performance.strugglingTopics.length > 0) {
      adaptedContext.learningObjectives = [
        ...(adaptedContext.learningObjectives || []),
        ...performance.strugglingTopics.map(topic => `Review and reinforce understanding of ${topic}`)
      ];
    }

    return {
      ...request,
      difficulty: adaptedDifficulty,
      context: adaptedContext,
      options: {
        ...request.options,
        adaptiveLevel: true,
        includeExplanations: successRate < 0.6 // Include more explanations for struggling students
      }
    };
  }
}