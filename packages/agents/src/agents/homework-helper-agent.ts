import { v4 as uuidv4 } from 'uuid';
import { BaseAgent } from './base-agent';
import type {
  AgentConfig,
  AgentContext,
  HomeworkHelperAgentInterface,
  HomeworkProblem,
  HomeworkHint,
  HomeworkSession,
  HomeworkAnalysis
} from '../types';
import {
  AgentType,
  HomeworkSolution
} from '../types';
import type { AivoBrain } from '@aivo/aivo-brain';

/**
 * HomeworkHelperAgent - Specialized agent for AI-powered homework assistance
 * 
 * Features:
 * - Image and document upload with OCR processing
 * - Text-based question input and analysis
 * - Multi-modal content analysis (text, images, documents)
 * - Step-by-step problem solving guidance
 * - Personalized hints and explanations
 * - Progress tracking and performance analytics
 * - Subject-specific problem recognition
 * - Adaptive difficulty assessment
 */
class HomeworkHelperAgent extends BaseAgent implements HomeworkHelperAgentInterface {
  private currentSession: HomeworkSession | null = null;
  private problemHistory: Map<string, HomeworkProblem> = new Map();
  private supportedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  private supportedDocumentTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];

  constructor(
    config: AgentConfig,
    context: AgentContext,
    aivoBrain: AivoBrain
  ) {
    super(AgentType.HOMEWORK_HELPER, config, context, aivoBrain);
  }

  // =============================================================================
  // ABSTRACT METHOD IMPLEMENTATIONS
  // =============================================================================

  protected async initializeAgent(): Promise<void> {
    this.log('info', 'Initializing HomeworkHelperAgent', {
      studentId: this.context.student.id,
      gradeLevel: this.context.student.gradeLevel,
      disabilities: this.context.student.disabilities
    });

    if (!this.validateContext(['student.id', 'student.gradeLevel'])) {
      throw new Error('Missing required context for homework helper agent');
    }

    // Initialize session tracking
    this.currentSession = null;
    this.problemHistory.clear();

    this.log('info', 'Homework helper agent initialized successfully');
  }

  protected async disposeAgent(): Promise<void> {
    if (this.currentSession) {
      this.log('info', 'Finalizing homework session', {
        sessionId: this.currentSession.id,
        problemsSolved: this.currentSession.problemsSolved,
        totalTime: this.currentSession.totalTimeSpent
      });
    }
    this.currentSession = null;
    this.problemHistory.clear();
  }

  protected validateConfig(): boolean {
    return this.config.agentType === AgentType.HOMEWORK_HELPER &&
           this.config.studentId === this.context.student.id;
  }

  // =============================================================================
  // HOMEWORK HELPER INTERFACE IMPLEMENTATION
  // =============================================================================

  async analyzeImageProblem(
    imageData: string | Buffer,
    mimeType: string,
    context?: {
      subject?: string;
      gradeLevel?: string;
      additionalInstructions?: string;
    }
  ): Promise<HomeworkAnalysis> {
    this.assertInitialized();
    
    return await this.executeTask('analyze_image_problem', async () => {
      this.log('info', 'Analyzing homework from image', {
        mimeType,
        hasContext: !!context,
        subject: context?.subject
      });

      // Validate image type
      if (!this.supportedImageTypes.includes(mimeType)) {
        throw new Error(`Unsupported image type: ${mimeType}`);
      }

      // Convert image to base64 if needed
      const base64Image = typeof imageData === 'string' 
        ? imageData 
        : imageData.toString('base64');

      // Use AI vision capabilities to analyze the image
      const analysisPrompt = this.buildImageAnalysisPrompt(context);
      
      const aiResponse = await this.generateCompletion(analysisPrompt, {
        taskType: 'image_analysis',
        maxTokens: 2000,
        temperature: 0.3,
        // Note: Attachment support would need to be added to AivoBrain interface
        // attachments: [{
        //   type: 'image',
        //   data: base64Image,
        //   mimeType
        // }]
      });

      const analysis = this.parseImageAnalysisResponse(aiResponse.content, context);
      
      this.log('info', 'Image problem analysis completed', {
        problemType: analysis.problem.type,
        subject: analysis.problem.subject,
        confidence: analysis.confidence
      });

      return analysis;
    });
  }

  async analyzeDocumentProblem(
    documentData: Buffer,
    mimeType: string,
    filename: string,
    context?: {
      subject?: string;
      gradeLevel?: string;
      specificPages?: number[];
      additionalInstructions?: string;
    }
  ): Promise<HomeworkAnalysis> {
    this.assertInitialized();
    
    return await this.executeTask('analyze_document_problem', async () => {
      this.log('info', 'Analyzing homework from document', {
        filename,
        mimeType,
        hasContext: !!context,
        subject: context?.subject
      });

      // Validate document type
      if (!this.supportedDocumentTypes.includes(mimeType)) {
        throw new Error(`Unsupported document type: ${mimeType}`);
      }

      // Extract text from document
      const extractedText = await this.extractTextFromDocument(documentData, mimeType, filename);
      
      // Analyze the extracted text
      const analysisPrompt = this.buildDocumentAnalysisPrompt(extractedText, context);
      
      const aiResponse = await this.generateCompletion(analysisPrompt, {
        taskType: 'document_analysis',
        maxTokens: 2000,
        temperature: 0.3
      });

      const analysis = this.parseDocumentAnalysisResponse(aiResponse.content, extractedText, context);
      
      this.log('info', 'Document problem analysis completed', {
        problemType: analysis.problem.type,
        subject: analysis.problem.subject,
        textLength: extractedText.length
      });

      return analysis;
    });
  }

  async analyzeTextProblem(
    problemText: string,
    context?: {
      subject?: string;
      gradeLevel?: string;
      problemType?: string;
      additionalInstructions?: string;
    }
  ): Promise<HomeworkAnalysis> {
    this.assertInitialized();
    
    return await this.executeTask('analyze_text_problem', async () => {
      this.log('info', 'Analyzing homework from text input', {
        textLength: problemText.length,
        hasContext: !!context,
        subject: context?.subject
      });

      const analysisPrompt = this.buildTextAnalysisPrompt(problemText, context);
      
      const aiResponse = await this.generateCompletion(analysisPrompt, {
        taskType: 'text_analysis',
        maxTokens: 2000,
        temperature: 0.3
      });

      const analysis = this.parseTextAnalysisResponse(aiResponse.content, problemText, context);
      
      this.log('info', 'Text problem analysis completed', {
        problemType: analysis.problem.type,
        subject: analysis.problem.subject,
        difficulty: analysis.problem.difficulty
      });

      return analysis;
    });
  }

  async startHomeworkSession(analysis: HomeworkAnalysis): Promise<HomeworkSession> {
    this.assertInitialized();
    
    return await this.executeTask('start_homework_session', async () => {
      const sessionId = uuidv4();
      
      this.currentSession = {
        id: sessionId,
        studentId: this.context.student.id,
        problem: analysis.problem,
        solution: analysis.solution,
        startTime: new Date(),
        currentStep: 0,
        hintsUsed: 0,
        attemptsPerStep: [],
        timeSpentPerStep: [],
        totalTimeSpent: 0,
        problemsSolved: 0,
        status: 'active',
        performance: {
          accuracy: 0,
          efficiency: 1.0,
          independence: 1.0,
          understanding: 0
        }
      };

      // Store problem in history
      this.problemHistory.set(analysis.problem.id, analysis.problem);

      this.log('info', 'Homework session started', {
        sessionId,
        problemId: analysis.problem.id,
        totalSteps: analysis.solution.steps.length
      });

      return this.currentSession;
    });
  }

  async getHint(
    sessionId: string,
    stepNumber: number,
    studentAttempt?: string,
    specificQuestion?: string
  ): Promise<HomeworkHint> {
    this.assertInitialized();
    
    return await this.executeTask('get_homework_hint', async () => {
      if (!this.currentSession || this.currentSession.id !== sessionId) {
        throw new Error('Invalid or expired session');
      }

      if (stepNumber >= this.currentSession.solution.steps.length) {
        throw new Error('Invalid step number');
      }

      const currentStep = this.currentSession.solution.steps[stepNumber];
      const hintLevel = (currentStep.hintsGiven || 0) + 1;

      this.log('info', 'Generating homework hint', {
        sessionId,
        stepNumber,
        hintLevel,
        hasAttempt: !!studentAttempt
      });

      const hintPrompt = this.buildHintPrompt(
        this.currentSession.problem,
        currentStep,
        hintLevel,
        studentAttempt,
        specificQuestion
      );

      const aiResponse = await this.generateCompletion(hintPrompt, {
        taskType: 'hint_generation',
        maxTokens: 800,
        temperature: 0.6
      });

      const hint = this.parseHintResponse(aiResponse.content, stepNumber, hintLevel);

      // Update session tracking
      this.currentSession.hintsUsed++;
      currentStep.hintsGiven = hintLevel;

      this.log('info', 'Homework hint generated', {
        sessionId,
        stepNumber,
        hintLevel,
        hintType: hint.type
      });

      return hint;
    });
  }

  async submitStepAnswer(
    sessionId: string,
    stepNumber: number,
    answer: any,
    workShown?: string,
    timeSpent?: number
  ): Promise<{
    correct: boolean;
    feedback: string;
    nextStep?: {
      stepNumber: number;
      instruction: string;
      available: boolean;
    };
    sessionComplete?: boolean;
    finalReport?: any;
  }> {
    this.assertInitialized();
    
    return await this.executeTask('submit_step_answer', async () => {
      if (!this.currentSession || this.currentSession.id !== sessionId) {
        throw new Error('Invalid or expired session');
      }

      if (stepNumber >= this.currentSession.solution.steps.length) {
        throw new Error('Invalid step number');
      }

      const currentStep = this.currentSession.solution.steps[stepNumber];
      
      this.log('info', 'Evaluating step answer', {
        sessionId,
        stepNumber,
        hasWorkShown: !!workShown,
        timeSpent
      });

      // Evaluate the answer
      const evaluationPrompt = this.buildAnswerEvaluationPrompt(
        this.currentSession.problem,
        currentStep,
        answer,
        workShown
      );

      const aiResponse = await this.generateCompletion(evaluationPrompt, {
        taskType: 'answer_evaluation',
        maxTokens: 1000,
        temperature: 0.2
      });

      const evaluation = this.parseAnswerEvaluationResponse(aiResponse.content);

      // Update session progress
      this.updateSessionProgress(stepNumber, evaluation.correct, timeSpent || 0);

      // Check if session is complete
      const isComplete = stepNumber === this.currentSession.solution.steps.length - 1;
      let finalReport = null;

      if (isComplete) {
        this.currentSession.status = 'completed';
        finalReport = await this.generateSessionReport();
      }

      const result = {
        correct: evaluation.correct,
        feedback: evaluation.feedback,
        nextStep: !isComplete ? {
          stepNumber: stepNumber + 1,
          instruction: this.currentSession.solution.steps[stepNumber + 1].instruction,
          available: evaluation.correct || (this.config.customSettings?.allowSkipSteps as boolean) || false
        } : undefined,
        sessionComplete: isComplete,
        finalReport
      };

      this.log('info', 'Step answer evaluated', {
        sessionId,
        stepNumber,
        correct: evaluation.correct,
        sessionComplete: isComplete
      });

      return result;
    });
  }

  async getSessionStatus(sessionId: string): Promise<HomeworkSession> {
    if (!this.currentSession || this.currentSession.id !== sessionId) {
      throw new Error('Session not found');
    }

    return { ...this.currentSession };
  }

  // =============================================================================
  // PRIVATE HELPER METHODS
  // =============================================================================

  private async extractTextFromDocument(
    documentData: Buffer,
    mimeType: string,
    filename: string
  ): Promise<string> {
    // This would integrate with OCR/document processing services
    // For now, return a placeholder implementation
    
    this.log('debug', 'Extracting text from document', {
      filename,
      mimeType,
      size: documentData.length
    });

    // In a real implementation, this would:
    // 1. Use PDF parsing libraries for PDFs
    // 2. Use OCR services for scanned documents
    // 3. Extract text from Word documents
    // 4. Handle various document formats
    
    return `[Extracted text from ${filename} would appear here. Integration with OCR/document processing services needed.]`;
  }

  private buildImageAnalysisPrompt(context?: any): string {
    const student = this.context.student;
    
    return `
Analyze this homework problem image for a student with the following profile:

Student Profile:
- Grade Level: ${student.gradeLevel}
- Disabilities: ${student.disabilities.join(', ') || 'None specified'}
- Accommodations: ${student.accommodations?.join(', ') || 'None specified'}

Context:
${context?.subject ? `- Subject: ${context.subject}` : ''}
${context?.gradeLevel ? `- Expected Grade Level: ${context.gradeLevel}` : ''}
${context?.additionalInstructions ? `- Additional Instructions: ${context.additionalInstructions}` : ''}

Tasks:
1. Extract and identify all text, numbers, equations, diagrams, and other content from the image
2. Determine the subject area and specific topic
3. Identify the type of problem (word problem, equation, diagram analysis, etc.)
4. Assess the difficulty level appropriate for the student's grade
5. Break down the problem into logical steps
6. Consider any accessibility needs based on the student's profile

Return analysis in JSON format:
{
  "problem": {
    "id": "unique-id",
    "extractedText": "all text found in the image",
    "subject": "mathematics|science|english|social_studies|other",
    "topic": "specific topic like 'algebra', 'geometry', 'reading_comprehension'",
    "type": "word_problem|equation|diagram|multiple_choice|essay|other",
    "difficulty": "easy|medium|hard",
    "gradeLevel": "estimated grade level",
    "requirements": ["list", "of", "skills", "needed"]
  },
  "solution": {
    "approach": "step_by_step|conceptual|procedural|creative",
    "steps": [
      {
        "stepNumber": 1,
        "instruction": "clear instruction for this step",
        "hints": ["helpful hint 1", "helpful hint 2"],
        "expectedAnswer": "what student should find/do",
        "commonMistakes": ["mistake 1", "mistake 2"]
      }
    ],
    "estimatedTime": "time in minutes",
    "accommodations": ["visual aids", "extra time", "simplified language"]
  },
  "confidence": 0.85,
  "extractionQuality": "high|medium|low",
  "additionalNotes": ["any special observations"]
}
    `.trim();
  }

  private buildDocumentAnalysisPrompt(extractedText: string, context?: any): string {
    const student = this.context.student;
    
    return `
Analyze this homework problem from a document for a student with the following profile:

Student Profile:
- Grade Level: ${student.gradeLevel}
- Disabilities: ${student.disabilities.join(', ') || 'None specified'}
- Accommodations: ${student.accommodations?.join(', ') || 'None specified'}

Extracted Text:
${extractedText}

Context:
${context?.subject ? `- Subject: ${context.subject}` : ''}
${context?.gradeLevel ? `- Expected Grade Level: ${context.gradeLevel}` : ''}
${context?.specificPages ? `- Specific Pages: ${context.specificPages.join(', ')}` : ''}
${context?.additionalInstructions ? `- Additional Instructions: ${context.additionalInstructions}` : ''}

Tasks:
1. Identify homework problems or questions in the text
2. Determine subject area and topics for each problem
3. Assess difficulty and grade appropriateness
4. Create step-by-step solution approaches
5. Consider student's learning needs and accommodations

Use the same JSON format as image analysis.
    `.trim();
  }

  private buildTextAnalysisPrompt(problemText: string, context?: any): string {
    const student = this.context.student;
    
    return `
Analyze this homework problem for a student with the following profile:

Student Profile:
- Grade Level: ${student.gradeLevel}
- Disabilities: ${student.disabilities.join(', ') || 'None specified'}
- Accommodations: ${student.accommodations?.join(', ') || 'None specified'}

Problem Text:
${problemText}

Context:
${context?.subject ? `- Subject: ${context.subject}` : ''}
${context?.gradeLevel ? `- Expected Grade Level: ${context.gradeLevel}` : ''}
${context?.problemType ? `- Problem Type: ${context.problemType}` : ''}
${context?.additionalInstructions ? `- Additional Instructions: ${context.additionalInstructions}` : ''}

Tasks:
1. Analyze the problem and identify what's being asked
2. Determine the subject area and specific topic
3. Assess difficulty level and grade appropriateness
4. Break down the solution into clear, manageable steps
5. Consider student's learning profile and accommodations

Use the same JSON format as image analysis.
    `.trim();
  }

  private buildHintPrompt(
    problem: HomeworkProblem,
    currentStep: any,
    hintLevel: number,
    studentAttempt?: string,
    specificQuestion?: string
  ): string {
    return `
Provide a helpful hint for this homework problem step.

Problem Context:
- Subject: ${problem.subject}
- Topic: ${problem.topic}
- Type: ${problem.type}
- Student Grade: ${this.context.student.gradeLevel}
- Student Disabilities: ${this.context.student.disabilities.join(', ') || 'None'}

Current Step:
${currentStep.instruction}

Hint Level: ${hintLevel} (1=gentle nudge, 2=more specific, 3=detailed guidance)

${studentAttempt ? `Student's Current Attempt: ${studentAttempt}` : ''}
${specificQuestion ? `Student's Specific Question: ${specificQuestion}` : ''}

Guidelines:
- Provide progressive hints based on the hint level
- Don't give away the answer directly
- Encourage student thinking and problem-solving
- Consider the student's learning profile
- Use age-appropriate language
- Build confidence while providing guidance

Return hint in JSON format:
{
  "hintText": "the actual hint text",
  "type": "conceptual|procedural|encouraging|clarifying",
  "level": ${hintLevel},
  "encouragement": "positive, supportive message",
  "nextSteps": ["suggestion 1", "suggestion 2"],
  "visualAid": "description of helpful visual if applicable",
  "commonMistake": "if addressing a common error pattern"
}
    `.trim();
  }

  private buildAnswerEvaluationPrompt(
    problem: HomeworkProblem,
    currentStep: any,
    answer: any,
    workShown?: string
  ): string {
    return `
Evaluate this student's answer for the current step.

Problem Context:
- Subject: ${problem.subject}
- Topic: ${problem.topic}
- Type: ${problem.type}

Current Step:
${currentStep.instruction}
Expected: ${currentStep.expectedAnswer}

Student's Answer: ${JSON.stringify(answer)}
${workShown ? `Work Shown: ${workShown}` : ''}

Student Profile:
- Grade Level: ${this.context.student.gradeLevel}
- Disabilities: ${this.context.student.disabilities.join(', ') || 'None'}

Evaluation Criteria:
1. Is the answer correct or partially correct?
2. Does the work shown demonstrate understanding?
3. Are there any misconceptions to address?
4. What specific feedback would be most helpful?
5. How can we encourage the student's progress?

Return evaluation in JSON format:
{
  "correct": true/false,
  "partialCredit": 0.0-1.0,
  "feedback": "specific, encouraging feedback",
  "strengths": ["what the student did well"],
  "improvements": ["areas to work on"],
  "misconceptions": ["any misunderstandings to address"],
  "encouragement": "positive, motivating message",
  "nextGuidance": "what to focus on for the next step"
}
    `.trim();
  }

  private parseImageAnalysisResponse(aiResponse: string, context?: any): HomeworkAnalysis {
    try {
      const parsed = JSON.parse(aiResponse);
      return {
        problem: {
          id: parsed.problem.id || uuidv4(),
          extractedContent: parsed.problem.extractedText,
          subject: parsed.problem.subject,
          topic: parsed.problem.topic,
          type: parsed.problem.type,
          difficulty: parsed.problem.difficulty,
          gradeLevel: parsed.problem.gradeLevel,
          requirements: parsed.problem.requirements || []
        },
        solution: parsed.solution,
        confidence: parsed.confidence || 0.8,
        extractionQuality: parsed.extractionQuality || 'medium',
        additionalNotes: parsed.additionalNotes || []
      };
    } catch (error) {
      this.log('error', 'Failed to parse image analysis response', { error, aiResponse });
      throw new Error('Failed to analyze homework image');
    }
  }

  private parseDocumentAnalysisResponse(aiResponse: string, extractedText: string, context?: any): HomeworkAnalysis {
    // Similar to parseImageAnalysisResponse but for document content
    return this.parseImageAnalysisResponse(aiResponse, context);
  }

  private parseTextAnalysisResponse(aiResponse: string, problemText: string, context?: any): HomeworkAnalysis {
    // Similar to parseImageAnalysisResponse but for text content
    return this.parseImageAnalysisResponse(aiResponse, context);
  }

  private parseHintResponse(aiResponse: string, stepNumber: number, hintLevel: number): HomeworkHint {
    try {
      const parsed = JSON.parse(aiResponse);
      return {
        id: uuidv4(),
        stepNumber,
        level: hintLevel,
        type: parsed.type || 'conceptual',
        content: parsed.hintText,
        encouragement: parsed.encouragement,
        nextSteps: parsed.nextSteps || [],
        visualAid: parsed.visualAid,
        timestamp: new Date()
      };
    } catch (error) {
      this.log('error', 'Failed to parse hint response', { error, aiResponse });
      return {
        id: uuidv4(),
        stepNumber,
        level: hintLevel,
        type: 'encouraging',
        content: 'Take your time and think through the problem step by step. You can do this!',
        encouragement: 'Keep going, you\'re doing great!',
        nextSteps: [],
        timestamp: new Date()
      };
    }
  }

  private parseAnswerEvaluationResponse(aiResponse: string): any {
    try {
      const parsed = JSON.parse(aiResponse);
      return {
        correct: parsed.correct,
        partialCredit: parsed.partialCredit || (parsed.correct ? 1.0 : 0.0),
        feedback: parsed.feedback || 'Answer received.',
        strengths: parsed.strengths || [],
        improvements: parsed.improvements || [],
        misconceptions: parsed.misconceptions || [],
        encouragement: parsed.encouragement || 'Keep up the good work!',
        nextGuidance: parsed.nextGuidance
      };
    } catch (error) {
      this.log('error', 'Failed to parse evaluation response', { error, aiResponse });
      return {
        correct: false,
        partialCredit: 0.0,
        feedback: 'Please try again.',
        strengths: [],
        improvements: [],
        misconceptions: [],
        encouragement: 'Don\'t give up!',
        nextGuidance: 'Review the problem and try a different approach.'
      };
    }
  }

  private updateSessionProgress(stepNumber: number, correct: boolean, timeSpent: number): void {
    if (!this.currentSession) return;

    // Update step attempts
    if (!this.currentSession.attemptsPerStep[stepNumber]) {
      this.currentSession.attemptsPerStep[stepNumber] = 0;
    }
    this.currentSession.attemptsPerStep[stepNumber]++;

    // Update time tracking
    if (!this.currentSession.timeSpentPerStep[stepNumber]) {
      this.currentSession.timeSpentPerStep[stepNumber] = 0;
    }
    this.currentSession.timeSpentPerStep[stepNumber] += timeSpent;
    this.currentSession.totalTimeSpent += timeSpent;

    // Update current step if correct
    if (correct) {
      this.currentSession.currentStep = Math.max(this.currentSession.currentStep, stepNumber + 1);
    }

    // Update performance metrics
    this.updatePerformanceMetrics();
  }

  private updatePerformanceMetrics(): void {
    if (!this.currentSession) return;

    const completedSteps = this.currentSession.currentStep;
    const totalSteps = this.currentSession.solution.steps.length;

    // Calculate accuracy based on first attempts
    const firstAttempts = this.currentSession.attemptsPerStep.filter((attempts: number) => attempts === 1).length;
    this.currentSession.performance.accuracy = completedSteps > 0 ? firstAttempts / completedSteps : 0;

    // Calculate efficiency based on time spent vs. estimated time
    const estimatedTime = this.currentSession.solution.estimatedTime || 30; // minutes
    this.currentSession.performance.efficiency = Math.max(0, 1 - (this.currentSession.totalTimeSpent / 60) / estimatedTime);

    // Calculate independence based on hints used
    const maxHints = totalSteps * 2; // Allow up to 2 hints per step
    this.currentSession.performance.independence = Math.max(0, 1 - this.currentSession.hintsUsed / maxHints);

    // Calculate understanding based on accuracy and independence
    this.currentSession.performance.understanding = 
      (this.currentSession.performance.accuracy * 0.6) + 
      (this.currentSession.performance.independence * 0.4);
  }

  private async generateSessionReport(): Promise<any> {
    if (!this.currentSession) return null;

    const completionTime = new Date();
    const duration = Math.round((completionTime.getTime() - this.currentSession.startTime.getTime()) / 1000 / 60); // minutes

    return {
      sessionId: this.currentSession.id,
      studentId: this.currentSession.studentId,
      problem: this.currentSession.problem,
      completedAt: completionTime,
      duration: duration,
      performance: this.currentSession.performance,
      summary: {
        totalSteps: this.currentSession.solution.steps.length,
        stepsCompleted: this.currentSession.currentStep,
        hintsUsed: this.currentSession.hintsUsed,
        totalAttempts: this.currentSession.attemptsPerStep.reduce((sum: number, attempts: number) => sum + attempts, 0),
        averageTimePerStep: this.currentSession.totalTimeSpent / Math.max(1, this.currentSession.currentStep)
      },
      recommendations: this.generateRecommendations(),
      nextSteps: this.generateNextSteps()
    };
  }

  private generateRecommendations(): string[] {
    if (!this.currentSession) return [];

    const recommendations = [];
    const performance = this.currentSession.performance;

    if (performance.accuracy < 0.6) {
      recommendations.push('Practice similar problems to improve accuracy');
      recommendations.push('Review fundamental concepts for this topic');
    }

    if (performance.independence < 0.7) {
      recommendations.push('Try solving problems independently before asking for hints');
      recommendations.push('Build confidence with easier practice problems');
    }

    if (performance.efficiency < 0.5) {
      recommendations.push('Work on time management and problem-solving strategies');
      recommendations.push('Practice identifying problem types quickly');
    }

    if (recommendations.length === 0) {
      recommendations.push('Excellent work! Continue practicing to maintain your skills');
      recommendations.push('Challenge yourself with slightly harder problems');
    }

    return recommendations;
  }

  private generateNextSteps(): string[] {
    if (!this.currentSession) return [];

    const nextSteps = ['Review your work and celebrate your progress!'];
    
    if (this.currentSession.performance.understanding >= 0.8) {
      nextSteps.push('Try a more challenging problem in this topic');
      nextSteps.push('Help a classmate with similar problems');
    } else if (this.currentSession.performance.understanding >= 0.6) {
      nextSteps.push('Practice 2-3 more problems like this one');
      nextSteps.push('Ask your teacher for additional practice resources');
    } else {
      nextSteps.push('Review the fundamental concepts with your teacher');
      nextSteps.push('Start with simpler problems to build understanding');
    }

    return nextSteps;
  }
}

export { HomeworkHelperAgent };