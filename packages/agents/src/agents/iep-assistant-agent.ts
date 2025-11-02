import { v4 as uuidv4 } from 'uuid';
import { addDays, addMonths, format } from 'date-fns';
import { BaseAgent } from './base-agent';
import {
  AgentType,
  AssessmentDomain,
  AssessmentReport,
  IEPData,
  IEPGoal,
  IEPAssistantAgentInterface,
  AgentConfig,
  AgentContext,
  DisabilityType
} from '../types';
import { AivoBrain } from '@aivo/aivo-brain';

/**
 * IEPAssistantAgent - Specialized agent for IEP management and support
 * 
 * Features:
 * - IEP template generation based on assessment data
 * - Evidence-based goal setting and tracking
 * - Comprehensive progress report creation
 * - Legal compliance checking and validation
 * - Intelligent modification suggestions
 * - Meeting notes summarization and action items
 * - Parent-friendly explanations and communications
 * - Standards alignment verification
 */
export class IEPAssistantAgent extends BaseAgent implements IEPAssistantAgentInterface {
  private complianceRules: Map<string, any>;
  private goalTemplates: Map<AssessmentDomain, any[]>;
  private reportingSchedule: Map<string, Date>;

  constructor(
    config: AgentConfig,
    context: AgentContext,
    aivoBrain: AivoBrain
  ) {
    super(AgentType.IEP_ASSISTANT, config, context, aivoBrain);
    
    // Initialize compliance rules based on region/state
    this.complianceRules = this.initializeComplianceRules();
    
    // Initialize goal templates for different domains
    this.goalTemplates = this.initializeGoalTemplates();
    
    // Initialize reporting schedule
    this.reportingSchedule = new Map();
  }

  // =============================================================================
  // ABSTRACT METHOD IMPLEMENTATIONS
  // =============================================================================

  protected async initializeAgent(): Promise<void> {
    this.log('info', 'Initializing IEPAssistantAgent', {
      studentId: this.context.student.id,
      disabilities: this.context.student.disabilities,
      curriculumRegion: this.context.student.curriculumRegion,
      hasExistingIEP: !!this.context.iepData
    });

    // Validate required context for IEP operations
    if (!this.validateContext(['student.id', 'student.disabilities', 'student.gradeLevel'])) {
      throw new Error('Missing required context for IEP assistant agent');
    }

    // Load region-specific compliance requirements
    await this.loadRegionSpecificRequirements();

    // Initialize reporting schedules if IEP exists
    if (this.context.iepData) {
      this.initializeReportingSchedule();
    }

    this.log('info', 'IEP assistant agent initialized successfully');
  }

  protected async disposeAgent(): Promise<void> {
    // Save any pending compliance checks or report drafts
    await this.saveAgentState();
    
    this.log('info', 'IEP assistant agent disposed');
  }

  protected validateConfig(): boolean {
    return this.config.agentType === AgentType.IEP_ASSISTANT &&
           this.config.studentId === this.context.student.id;
  }

  // =============================================================================
  // IEP ASSISTANT INTERFACE IMPLEMENTATION
  // =============================================================================

  async generateIEPTemplate(assessmentData: AssessmentReport): Promise<Partial<IEPData>> {
    this.assertInitialized();
    
    return await this.executeTask('generate_iep_template', async () => {
      this.log('info', 'Generating IEP template from assessment', {
        assessmentId: assessmentData.assessmentId,
        overallScore: assessmentData.overallScore,
        knowledgeGaps: assessmentData.knowledgeGaps.length
      });

      const templatePrompt = this.buildIEPTemplatePrompt(assessmentData);
      const aiResponse = await this.generateCompletion(templatePrompt, {
        taskType: 'iep_template_generation',
        maxTokens: 2500,
        temperature: 0.3 // Low temperature for consistent, factual content
      });

      const template = this.parseIEPTemplate(aiResponse.content, assessmentData);
      
      // Validate template against compliance rules
      const complianceCheck = await this.checkCompliance(template as IEPData);
      if (!complianceCheck.compliant) {
        this.log('warn', 'Generated template has compliance issues', {
          issues: complianceCheck.issues
        });
      }

      this.log('info', 'IEP template generated successfully', {
        goalsGenerated: template.goals?.length || 0,
        servicesIncluded: template.services?.length || 0,
        accommodationsIncluded: template.accommodations?.length || 0
      });

      return template;
    });
  }

  async generateGoals(domain: AssessmentDomain, currentLevel: string): Promise<IEPGoal[]> {
    this.assertInitialized();
    
    return await this.executeTask('generate_iep_goals', async () => {
      this.log('info', 'Generating IEP goals for domain', {
        domain,
        currentLevel,
        studentDisabilities: this.context.student.disabilities
      });

      const goalPrompt = this.buildGoalGenerationPrompt(domain, currentLevel);
      const aiResponse = await this.generateCompletion(goalPrompt, {
        taskType: 'iep_goal_generation',
        maxTokens: 1500,
        temperature: 0.4
      });

      const goals = this.parseGeneratedGoals(aiResponse.content, domain);
      
      // Validate goals are SMART (Specific, Measurable, Achievable, Relevant, Time-bound)
      const validatedGoals = await this.validateSMARTGoals(goals);

      this.log('info', 'IEP goals generated', {
        domain,
        goalsGenerated: validatedGoals.length,
        validGoals: validatedGoals.filter(g => g.status === 'active').length
      });

      return validatedGoals;
    });
  }

  async checkCompliance(iepData: IEPData): Promise<{
    compliant: boolean;
    issues: string[];
    suggestions: string[];
  }> {
    this.assertInitialized();
    
    return await this.executeTask('check_iep_compliance', async () => {
      this.log('info', 'Checking IEP compliance', {
        studentId: iepData.studentId,
        goalsCount: iepData.goals.length,
        servicesCount: iepData.services.length
      });

      const issues: string[] = [];
      const suggestions: string[] = [];

      // Check basic structural requirements
      this.checkStructuralCompliance(iepData, issues, suggestions);
      
      // Check goal compliance
      this.checkGoalCompliance(iepData.goals, issues, suggestions);
      
      // Check service requirements
      this.checkServiceCompliance(iepData.services, issues, suggestions);
      
      // Check timeline compliance
      this.checkTimelineCompliance(iepData, issues, suggestions);
      
      // Use AI to check for additional compliance issues
      const aiComplianceCheck = await this.performAIComplianceCheck(iepData);
      issues.push(...aiComplianceCheck.issues);
      suggestions.push(...aiComplianceCheck.suggestions);

      const compliant = issues.length === 0;

      this.log('info', 'Compliance check completed', {
        compliant,
        issuesFound: issues.length,
        suggestionsGenerated: suggestions.length
      });

      return {
        compliant,
        issues,
        suggestions
      };
    });
  }

  async generateProgressReport(goals: IEPGoal[]): Promise<string> {
    this.assertInitialized();
    
    return await this.executeTask('generate_progress_report', async () => {
      this.log('info', 'Generating progress report', {
        goalsCount: goals.length,
        activeGoals: goals.filter(g => g.status === 'active').length,
        metGoals: goals.filter(g => g.status === 'met').length
      });

      const reportPrompt = this.buildProgressReportPrompt(goals);
      const aiResponse = await this.generateCompletion(reportPrompt, {
        taskType: 'iep_progress_report',
        maxTokens: 2000,
        temperature: 0.4
      });

      const formattedReport = this.formatProgressReport(aiResponse.content, goals);

      this.log('info', 'Progress report generated successfully', {
        reportLength: formattedReport.length,
        goalsReviewed: goals.length
      });

      return formattedReport;
    });
  }

  async summarizeMeetingNotes(notes: string): Promise<string> {
    this.assertInitialized();
    
    return await this.executeTask('summarize_meeting_notes', async () => {
      this.log('info', 'Summarizing meeting notes', {
        originalLength: notes.length
      });

      const summaryPrompt = this.buildMeetingSummaryPrompt(notes);
      const aiResponse = await this.generateCompletion(summaryPrompt, {
        taskType: 'meeting_summarization',
        maxTokens: 1000,
        temperature: 0.3
      });

      const summary = this.formatMeetingSummary(aiResponse.content);

      this.log('info', 'Meeting notes summarized', {
        originalLength: notes.length,
        summaryLength: summary.length,
        compressionRatio: (summary.length / notes.length * 100).toFixed(1) + '%'
      });

      return summary;
    });
  }

  async explainForParents(iepContent: string): Promise<string> {
    this.assertInitialized();
    
    return await this.executeTask('explain_for_parents', async () => {
      this.log('info', 'Creating parent-friendly explanation', {
        contentLength: iepContent.length,
        studentGrade: this.context.student.gradeLevel
      });

      const explanationPrompt = this.buildParentExplanationPrompt(iepContent);
      const aiResponse = await this.generateCompletion(explanationPrompt, {
        taskType: 'parent_explanation',
        maxTokens: 1500,
        temperature: 0.5
      });

      const parentFriendlyExplanation = this.formatParentExplanation(aiResponse.content);

      this.log('info', 'Parent explanation generated', {
        originalLength: iepContent.length,
        explanationLength: parentFriendlyExplanation.length
      });

      return parentFriendlyExplanation;
    });
  }

  // =============================================================================
  // PRIVATE HELPER METHODS
  // =============================================================================

  private initializeComplianceRules(): Map<string, any> {
    const rules = new Map();
    
    // Federal IDEA requirements
    rules.set('idea_federal', {
      requiredGoals: ['academic', 'functional'],
      serviceRequirements: ['frequency', 'duration', 'location'],
      timelineRequirements: {
        annualReview: 365, // days
        triannualEvaluation: 1095, // 3 years in days
        transitionPlanning: 16 // age to start
      }
    });

    // Add region-specific rules based on student's curriculum region
    const region = this.context.student.curriculumRegion;
    rules.set(`region_${region}`, this.getRegionSpecificRules(region));

    return rules;
  }

  private initializeGoalTemplates(): Map<AssessmentDomain, any[]> {
    const templates = new Map();
    
    templates.set(AssessmentDomain.READING_COMPREHENSION, [
      {
        template: "By {date}, {student} will read grade-level text with {accuracy}% accuracy and demonstrate comprehension by {method} with {independence} support, as measured by {evaluation}.",
        variables: ['date', 'student', 'accuracy', 'method', 'independence', 'evaluation']
      }
    ]);

    templates.set(AssessmentDomain.MATHEMATICS, [
      {
        template: "By {date}, {student} will solve {type} math problems at the {grade} level with {accuracy}% accuracy using {tools} with {support} assistance, as measured by {evaluation}.",
        variables: ['date', 'student', 'type', 'grade', 'accuracy', 'tools', 'support', 'evaluation']
      }
    ]);

    // Add templates for other domains...
    return templates;
  }

  private async loadRegionSpecificRequirements(): Promise<void> {
    // Load compliance requirements specific to the student's region
    const region = this.context.student.curriculumRegion;
    this.log('debug', 'Loading region-specific requirements', { region });
    
    // In a real implementation, this would load from a compliance database
    // For now, we'll use default requirements
  }

  private initializeReportingSchedule(): void {
    if (!this.context.iepData) return;
    
    const iep = this.context.iepData;
    this.reportingSchedule.set('quarterly_progress', addDays(iep.effectiveDate, 90));
    this.reportingSchedule.set('annual_review', addDays(iep.effectiveDate, 365));
    this.reportingSchedule.set('triennial_evaluation', addDays(iep.effectiveDate, 1095));
  }

  private buildIEPTemplatePrompt(assessmentData: AssessmentReport): string {
    return `
Generate a comprehensive IEP template based on the following assessment data:

Student Information:
- Name: ${this.context.student.firstName} ${this.context.student.lastName}
- Grade Level: ${this.context.student.gradeLevel}
- Disabilities: ${this.context.student.disabilities.join(', ')}
- Current Accommodations: ${this.context.student.accommodations.join(', ')}

Assessment Results:
- Overall Score: ${assessmentData.overallScore}%
- Domain Scores: ${JSON.stringify(assessmentData.domainScores)}
- Identified Strengths: ${assessmentData.strengths.join(', ')}
- Areas of Concern: ${assessmentData.weaknesses.join(', ')}
- Knowledge Gaps: ${assessmentData.knowledgeGaps.map((gap: any) => 
    `${gap.domain}: ${gap.topic} (${gap.severity} severity)`
  ).join('; ')}

Generate an IEP template that includes:
1. Present Level of Academic Achievement and Functional Performance (PLAAFP)
2. Annual goals with measurable objectives
3. Special education services and supports
4. Accommodations and modifications
5. Participation in general education
6. Assessment accommodations
7. Transition services (if age-appropriate)

Ensure all goals are SMART (Specific, Measurable, Achievable, Relevant, Time-bound) and aligned with the student's needs and grade-level standards.

Return in JSON format following the IEPData schema.
    `.trim();
  }

  private buildGoalGenerationPrompt(domain: AssessmentDomain, currentLevel: string): string {
    const disabilities = this.context.student.disabilities.join(', ');
    const gradeLevel = this.context.student.gradeLevel;
    
    return `
Generate SMART IEP goals for the following domain and student profile:

Domain: ${domain}
Current Performance Level: ${currentLevel}
Student Grade Level: ${gradeLevel}
Student Disabilities: ${disabilities}

Requirements for each goal:
1. Specific: Clear, well-defined objective
2. Measurable: Quantifiable success criteria
3. Achievable: Realistic for the student's abilities
4. Relevant: Aligned with student needs and curriculum standards
5. Time-bound: Clear deadline (typically annual)

Include for each goal:
- Measurable objective with specific criteria
- Baseline data reference
- Target performance level
- Evaluation method and frequency
- Progress monitoring schedule
- Necessary accommodations/supports

Generate 2-3 goals for this domain. Return as JSON array following the IEPGoal schema.
    `.trim();
  }

  private buildProgressReportPrompt(goals: IEPGoal[]): string {
    const goalsAnalysis = goals.map(goal => ({
      domain: goal.domain,
      objective: goal.measurableObjective,
      currentProgress: goal.progress.length > 0 ? goal.progress[goal.progress.length - 1] : null,
      status: goal.status
    }));

    return `
Generate a comprehensive IEP progress report based on the following goal data:

Student: ${this.context.student.firstName} ${this.context.student.lastName}
Reporting Period: Current Quarter

Goals and Progress:
${JSON.stringify(goalsAnalysis, null, 2)}

Include in the report:
1. Executive summary of overall progress
2. Goal-by-goal analysis with current performance
3. Data analysis and trends
4. Challenges and barriers identified
5. Successful strategies and interventions
6. Recommendations for continued support
7. Any needed goal modifications
8. Next steps and priorities

Format as a professional progress report suitable for IEP team review.
    `.trim();
  }

  private buildMeetingSummaryPrompt(notes: string): string {
    return `
Summarize the following IEP meeting notes into a concise, professional summary:

Meeting Notes:
${notes}

Include in the summary:
1. Meeting participants and roles
2. Key decisions made
3. Action items with responsible parties and deadlines
4. Goal modifications or updates
5. Service changes
6. Parent concerns and input
7. Student input (if age-appropriate)
8. Next meeting date and focus

Format as a professional meeting summary for official documentation.
    `.trim();
  }

  private buildParentExplanationPrompt(iepContent: string): string {
    return `
Create a parent-friendly explanation of the following IEP content:

IEP Content:
${iepContent}

Student Context:
- Grade Level: ${this.context.student.gradeLevel}
- Disabilities: ${this.context.student.disabilities.join(', ')}

Guidelines for parent explanation:
1. Use simple, clear language avoiding educational jargon
2. Explain the purpose and benefit of each component
3. Provide concrete examples of what support looks like
4. Address common parent concerns and questions
5. Emphasize the student's strengths and potential
6. Explain how parents can support goals at home
7. Include information about rights and advocacy

Make the explanation encouraging and empowering while being honest about challenges and timelines.
    `.trim();
  }

  private parseIEPTemplate(aiResponse: string, assessmentData: AssessmentReport): Partial<IEPData> {
    try {
      const parsed = JSON.parse(aiResponse);
      
      // Ensure required fields and add defaults
      const template: Partial<IEPData> = {
        studentId: this.context.student.id,
        effectiveDate: new Date(),
        nextReviewDate: addDays(new Date(), 365),
        nextEvaluationDate: addDays(new Date(), 1095),
        goals: parsed.goals || [],
        services: parsed.services || [],
        accommodations: parsed.accommodations || [],
        modifications: parsed.modifications || [],
        ...parsed
      };

      return template;
    } catch (error) {
      this.log('error', 'Failed to parse IEP template', { error, aiResponse });
      // Return minimal template
      return {
        studentId: this.context.student.id,
        effectiveDate: new Date(),
        nextReviewDate: addDays(new Date(), 365),
        nextEvaluationDate: addDays(new Date(), 1095),
        goals: [],
        services: [],
        accommodations: [],
        modifications: []
      };
    }
  }

  private parseGeneratedGoals(aiResponse: string, domain: AssessmentDomain): IEPGoal[] {
    try {
      const parsed = JSON.parse(aiResponse);
      const goals = Array.isArray(parsed) ? parsed : [parsed];
      
      return goals.map((goal: any) => ({
        id: uuidv4(),
        domain,
        description: goal.description || 'IEP Goal',
        measurableObjective: goal.measurableObjective || goal.objective,
        targetDate: goal.targetDate ? new Date(goal.targetDate) : addDays(new Date(), 365),
        currentLevel: goal.currentLevel || 'Baseline to be established',
        targetLevel: goal.targetLevel || 'Target to be determined',
        evaluationMethod: goal.evaluationMethod || 'Data collection and analysis',
        frequency: goal.frequency || 'Weekly',
        criteria: goal.criteria || '80% accuracy over 3 consecutive sessions',
        progress: [],
        status: 'active' as const,
        accommodations: goal.accommodations || [],
        services: goal.services || []
      }));
    } catch (error) {
      this.log('error', 'Failed to parse generated goals', { error, aiResponse });
      return [];
    }
  }

  private async validateSMARTGoals(goals: IEPGoal[]): Promise<IEPGoal[]> {
    // Validate that goals meet SMART criteria
    return goals.filter(goal => {
      // Basic validation - in real implementation, this would be more comprehensive
      return goal.measurableObjective && 
             goal.targetDate && 
             goal.evaluationMethod && 
             goal.criteria;
    });
  }

  private checkStructuralCompliance(iepData: IEPData, issues: string[], suggestions: string[]): void {
    if (!iepData.goals || iepData.goals.length === 0) {
      issues.push('IEP must contain at least one annual goal');
      suggestions.push('Add measurable annual goals based on assessment data');
    }

    if (!iepData.services || iepData.services.length === 0) {
      issues.push('IEP must specify special education services');
      suggestions.push('Define special education services including frequency and duration');
    }

    if (!iepData.nextReviewDate) {
      issues.push('IEP must have scheduled annual review date');
      suggestions.push('Schedule annual review within 365 days of effective date');
    }
  }

  private checkGoalCompliance(goals: IEPGoal[], issues: string[], suggestions: string[]): void {
    goals.forEach((goal, index) => {
      if (!goal.measurableObjective || goal.measurableObjective.length < 20) {
        issues.push(`Goal ${index + 1} lacks specific measurable objective`);
        suggestions.push(`Revise goal ${index + 1} to include specific, measurable criteria`);
      }

      if (!goal.evaluationMethod) {
        issues.push(`Goal ${index + 1} missing evaluation method`);
        suggestions.push(`Specify how progress on goal ${index + 1} will be measured`);
      }
    });
  }

  private checkServiceCompliance(services: any[], issues: string[], suggestions: string[]): void {
    services.forEach((service, index) => {
      if (!service.frequency || !service.duration) {
        issues.push(`Service ${index + 1} missing frequency or duration`);
        suggestions.push(`Specify frequency and duration for service ${index + 1}`);
      }

      if (!service.location) {
        issues.push(`Service ${index + 1} missing location specification`);
        suggestions.push(`Specify where service ${index + 1} will be provided`);
      }
    });
  }

  private checkTimelineCompliance(iepData: IEPData, issues: string[], suggestions: string[]): void {
    const now = new Date();
    
    if (iepData.nextReviewDate && iepData.nextReviewDate < now) {
      issues.push('Annual review date has passed');
      suggestions.push('Schedule new annual review immediately');
    }

    if (iepData.nextEvaluationDate && iepData.nextEvaluationDate < now) {
      issues.push('Triennial evaluation is overdue');
      suggestions.push('Initiate triennial evaluation process');
    }
  }

  private async performAIComplianceCheck(iepData: IEPData): Promise<{issues: string[], suggestions: string[]}> {
    const compliancePrompt = `
Review the following IEP for compliance with IDEA requirements:

${JSON.stringify(iepData, null, 2)}

Check for:
1. FAPE (Free Appropriate Public Education) compliance
2. LRE (Least Restrictive Environment) considerations
3. Goal appropriateness and measurability
4. Service adequacy
5. Procedural safeguards
6. Transition planning (if age 16+)

Return JSON with 'issues' and 'suggestions' arrays.
    `.trim();

    try {
      const response = await this.generateCompletion(compliancePrompt, {
        taskType: 'compliance_checking',
        maxTokens: 800,
        temperature: 0.2
      });

      const result = JSON.parse(response.content);
      return {
        issues: result.issues || [],
        suggestions: result.suggestions || []
      };
    } catch (error) {
      this.log('error', 'AI compliance check failed', { error });
      return { issues: [], suggestions: [] };
    }
  }

  private formatProgressReport(content: string, goals: IEPGoal[]): string {
    return `
IEP PROGRESS REPORT
Student: ${this.context.student.firstName} ${this.context.student.lastName}
Report Date: ${format(new Date(), 'MMMM dd, yyyy')}
Reporting Period: ${format(addDays(new Date(), -90), 'MMMM dd')} - ${format(new Date(), 'MMMM dd, yyyy')}

${content}

Goals Reviewed: ${goals.length}
Active Goals: ${goals.filter(g => g.status === 'active').length}
Met Goals: ${goals.filter(g => g.status === 'met').length}

Report Generated: ${format(new Date(), 'MMMM dd, yyyy \'at\' h:mm a')}
    `.trim();
  }

  private formatMeetingSummary(content: string): string {
    return `
IEP TEAM MEETING SUMMARY
Student: ${this.context.student.firstName} ${this.context.student.lastName}
Meeting Date: ${format(new Date(), 'MMMM dd, yyyy')}

${content}

Summary Generated: ${format(new Date(), 'MMMM dd, yyyy \'at\' h:mm a')}
    `.trim();
  }

  private formatParentExplanation(content: string): string {
    return `
Understanding Your Child's IEP
Student: ${this.context.student.firstName} ${this.context.student.lastName}

${content}

Questions? Please don't hesitate to contact your child's IEP team.
This explanation was prepared on ${format(new Date(), 'MMMM dd, yyyy')}.
    `.trim();
  }

  private getRegionSpecificRules(region: string): any {
    // Return region-specific compliance rules
    // This would be loaded from a comprehensive compliance database
    return {
      additionalRequirements: [],
      specificForms: [],
      timelineAdjustments: {}
    };
  }

  private async saveAgentState(): Promise<void> {
    // Save any pending work or compliance data
    this.log('debug', 'Saving IEP assistant state');
  }
}