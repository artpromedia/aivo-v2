import { v4 as uuidv4 } from 'uuid';
import { BaseAgent } from './base-agent';
import type {
  IEPGoal,
  ProgressMonitorAgentInterface,
  AgentConfig,
  AgentContext,
  ProgressTrend,
  ProgressAlert
} from '../types';
import {
  AgentType,
  AssessmentDomain,
  AssessmentReport,
  AlertLevel
} from '../types';
import type { AivoBrain } from '@aivo/aivo-brain';

/**
 * ProgressMonitorAgent - Specialized agent for tracking and analyzing student progress
 * 
 * Features:
 * - Continuous progress tracking and trend analysis
 * - Automated alert generation for concerning patterns
 * - Data-driven insights and recommendations
 * - Predictive modeling for intervention timing
 * - Comprehensive progress visualization
 * - Automated reporting and notifications
 * - Performance pattern recognition
 * - Evidence-based intervention suggestions
 */
export class ProgressMonitorAgent extends BaseAgent implements ProgressMonitorAgentInterface {
  private progressHistory: Map<string, any[]>;
  private alertThresholds: Map<AssessmentDomain, number>;
  private trendAnalysisWindow: number;
  private interventionTriggers: Map<string, any>;

  constructor(
    config: AgentConfig,
    context: AgentContext,
    aivoBrain: AivoBrain
  ) {
    super(AgentType.PROGRESS_MONITOR, config, context, aivoBrain);
    
    // Initialize progress tracking systems
    this.progressHistory = new Map();
    this.alertThresholds = this.initializeAlertThresholds();
    this.trendAnalysisWindow = 30; // days
    this.interventionTriggers = this.initializeInterventionTriggers();
  }

  // =============================================================================
  // ABSTRACT METHOD IMPLEMENTATIONS
  // =============================================================================

  protected async initializeAgent(): Promise<void> {
    this.log('info', 'Initializing ProgressMonitorAgent', {
      studentId: this.context.student.id,
      hasExistingProgress: this.context.progressData?.length || 0,
      monitoringDomains: Object.values(AssessmentDomain).length
    });

    // Validate required context for progress monitoring
    if (!this.validateContext(['student.id'])) {
      throw new Error('Missing required context for progress monitor agent');
    }

    // Load existing progress data
    await this.loadProgressHistory();

    // Initialize domain-specific monitoring
    await this.initializeDomainMonitoring();

    // Set up automated monitoring schedules
    this.setupMonitoringSchedules();

    this.log('info', 'Progress monitor agent initialized successfully');
  }

  protected async disposeAgent(): Promise<void> {
    // Save progress data and clear monitoring schedules
    await this.saveProgressData();
    
    this.log('info', 'Progress monitor agent disposed');
  }

  protected validateConfig(): boolean {
    return this.config.agentType === AgentType.PROGRESS_MONITOR &&
           this.config.studentId === this.context.student.id;
  }

  // =============================================================================
  // PROGRESS MONITOR INTERFACE IMPLEMENTATION
  // =============================================================================

  async trackProgress(domain: AssessmentDomain, data: any): Promise<void> {
    this.assertInitialized();
    
    return await this.executeTask('track_progress', async () => {
      this.log('info', 'Tracking progress data', {
        domain,
        dataType: typeof data,
        timestamp: new Date().toISOString()
      });

      const progressEntry = {
        id: uuidv4(),
        domain,
        timestamp: new Date(),
        data: data,
        studentId: this.context.student.id,
        source: 'progress_monitor_agent'
      };

      // Store progress entry
      if (!this.progressHistory.has(domain)) {
        this.progressHistory.set(domain, []);
      }
      
      this.progressHistory.get(domain)!.push(progressEntry);

      // Analyze for immediate alerts
      await this.checkForImmediateAlerts(domain, progressEntry);

      // Update trend analysis
      await this.updateTrendAnalysis(domain);

      this.log('info', 'Progress tracked successfully', {
        domain,
        totalEntries: this.progressHistory.get(domain)!.length
      });
    });
  }

  async analyzeTrends(domain: AssessmentDomain, timeframe: number): Promise<ProgressTrend> {
    this.assertInitialized();
    
    return await this.executeTask('analyze_trends', async () => {
      this.log('info', 'Analyzing progress trends', {
        domain,
        timeframe,
        dataPoints: this.progressHistory.get(domain)?.length || 0
      });

      const domainHistory = this.progressHistory.get(domain) || [];
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - timeframe);
      
      const recentData = domainHistory.filter(entry => 
        entry.timestamp >= cutoffDate
      );

      if (recentData.length < 2) {
        return {
          id: uuidv4(),
          domain,
          direction: 'stable',
          confidence: 0,
          magnitude: 0,
          timeframe,
          dataPoints: recentData.length,
          insights: ['Insufficient data for trend analysis'],
          predictions: []
        };
      }

      // Perform statistical trend analysis
      const trendAnalysis = await this.performTrendAnalysis(recentData);
      
      // Generate AI-powered insights
      const aiInsights = await this.generateTrendInsights(domain, recentData, trendAnalysis);

      const trend: ProgressTrend = {
        id: uuidv4(),
        domain,
        direction: trendAnalysis.direction,
        confidence: trendAnalysis.confidence,
        magnitude: trendAnalysis.magnitude,
        timeframe,
        dataPoints: recentData.length,
        insights: aiInsights.insights,
        predictions: aiInsights.predictions
      };

      this.log('info', 'Trend analysis completed', {
        domain,
        direction: trend.direction,
        confidence: trend.confidence,
        dataPoints: trend.dataPoints
      });

      return trend;
    });
  }

  async generateAlerts(): Promise<ProgressAlert[]> {
    this.assertInitialized();
    
    return await this.executeTask('generate_alerts', async () => {
      this.log('info', 'Generating progress alerts');

      const alerts: ProgressAlert[] = [];

      // Check each domain for alert conditions
      for (const domain of Object.values(AssessmentDomain)) {
        const domainAlerts = await this.checkDomainForAlerts(domain);
        alerts.push(...domainAlerts);
      }

      // Check cross-domain patterns
      const crossDomainAlerts = await this.checkCrossDomainPatterns();
      alerts.push(...crossDomainAlerts);

      // Check IEP goal progress (if applicable)
      if (this.context.iepData?.goals) {
        const iepAlerts = await this.checkIEPGoalProgress();
        alerts.push(...iepAlerts);
      }

      // Sort alerts by priority
      alerts.sort((a, b) => {
        const priorityOrder: Record<string, number> = { critical: 3, warning: 2, info: 1 };
        return (priorityOrder[b.severity] || 0) - (priorityOrder[a.severity] || 0);
      });

      this.log('info', 'Alerts generated', {
        totalAlerts: alerts.length,
        criticalPriority: alerts.filter(a => a.severity === 'critical').length,
        warningPriority: alerts.filter(a => a.severity === 'warning').length,
        infoPriority: alerts.filter(a => a.severity === 'info').length
      });

      return alerts;
    });
  }

  async generateReport(timeframe: number): Promise<string> {
    this.assertInitialized();
    
    return await this.executeTask('generate_progress_report', async () => {
      this.log('info', 'Generating comprehensive progress report', {
        timeframe,
        domains: this.progressHistory.size
      });

      // Collect data for report
      const reportData = await this.collectReportData(timeframe);
      
      // Generate AI-powered analysis
      const analysisPrompt = this.buildReportAnalysisPrompt(reportData);
      const aiResponse = await this.generateCompletion(analysisPrompt, {
        taskType: 'progress_report_generation',
        maxTokens: 2500,
        temperature: 0.4
      });

      // Format comprehensive report
      const report = this.formatProgressReport(aiResponse.content, reportData);

      this.log('info', 'Progress report generated', {
        reportLength: report.length,
        domainsAnalyzed: reportData.domainSummaries.length,
        alertsIncluded: reportData.alerts.length
      });

      return report;
    });
  }

  async predictOutcomes(domain: AssessmentDomain, projectionDays: number): Promise<any> {
    this.assertInitialized();
    
    return await this.executeTask('predict_outcomes', async () => {
      this.log('info', 'Predicting outcomes', {
        domain,
        projectionDays,
        historicalDataPoints: this.progressHistory.get(domain)?.length || 0
      });

      const domainHistory = this.progressHistory.get(domain) || [];
      
      if (domainHistory.length < 5) {
        return {
          domain,
          prediction: 'insufficient_data',
          confidence: 0,
          projectedDate: null,
          recommendations: ['Collect more progress data for accurate predictions']
        };
      }

      // Perform predictive analysis
      const prediction = await this.performPredictiveAnalysis(domain, domainHistory, projectionDays);

      this.log('info', 'Outcome prediction completed', {
        domain,
        confidence: prediction.confidence,
        outcome: prediction.prediction
      });

      return prediction;
    });
  }

  // =============================================================================
  // PRIVATE HELPER METHODS
  // =============================================================================

  private initializeAlertThresholds(): Map<AssessmentDomain, number> {
    const thresholds = new Map();
    
    // Set domain-specific alert thresholds (percentage decline that triggers alert)
    thresholds.set(AssessmentDomain.READING_COMPREHENSION, 15);
    thresholds.set(AssessmentDomain.MATHEMATICS, 15);
    thresholds.set(AssessmentDomain.WRITING, 20);
    thresholds.set(AssessmentDomain.SCIENCE, 20);
    thresholds.set(AssessmentDomain.SOCIAL_STUDIES, 20);
    thresholds.set(AssessmentDomain.LANGUAGE_ARTS, 15);
    
    return thresholds;
  }

  private initializeInterventionTriggers(): Map<string, any> {
    const triggers = new Map();
    
    triggers.set('consecutive_decline', {
      threshold: 3, // consecutive sessions with decline
      action: 'immediate_intervention_review'
    });
    
    triggers.set('significant_drop', {
      threshold: 25, // percentage drop in single session
      action: 'urgent_assessment_needed'
    });
    
    triggers.set('plateau_extended', {
      threshold: 14, // days without progress
      action: 'strategy_modification_needed'
    });
    
    return triggers;
  }

  private async loadProgressHistory(): Promise<void> {
    // In real implementation, load from database
    // For now, initialize empty history
    if (this.context.progressData) {
      this.context.progressData.forEach((entry: any) => {
        const domain = entry.domain;
        if (!this.progressHistory.has(domain)) {
          this.progressHistory.set(domain, []);
        }
        this.progressHistory.get(domain)!.push(entry);
      });
    }
  }

  private async initializeDomainMonitoring(): Promise<void> {
    // Set up monitoring for each assessment domain
    for (const domain of Object.values(AssessmentDomain)) {
      if (!this.progressHistory.has(domain)) {
        this.progressHistory.set(domain, []);
      }
    }
  }

  private setupMonitoringSchedules(): void {
    // In real implementation, set up automated monitoring schedules
    this.log('debug', 'Monitoring schedules initialized');
  }

  private async checkForImmediateAlerts(domain: AssessmentDomain, newEntry: any): Promise<void> {
    const domainHistory = this.progressHistory.get(domain) || [];
    
    if (domainHistory.length < 2) return;
    
    const previousEntry = domainHistory[domainHistory.length - 2];
    const currentValue = this.extractProgressValue(newEntry.data);
    const previousValue = this.extractProgressValue(previousEntry.data);
    
    if (currentValue && previousValue) {
      const changePercent = ((currentValue - previousValue) / previousValue) * 100;
      
      if (Math.abs(changePercent) > (this.alertThresholds.get(domain) || 15)) {
        this.log('warn', 'Immediate alert triggered', {
          domain,
          changePercent,
          threshold: this.alertThresholds.get(domain)
        });
      }
    }
  }

  private async updateTrendAnalysis(domain: AssessmentDomain): Promise<void> {
    // Update running trend analysis for the domain
    const trend = await this.analyzeTrends(domain, this.trendAnalysisWindow);
    
    if (trend.confidence > 0.7 && trend.direction === 'declining') {
      this.log('warn', 'Concerning trend detected', {
        domain,
        confidence: trend.confidence,
        direction: trend.direction
      });
    }
  }

  private async performTrendAnalysis(data: any[]): Promise<any> {
    if (data.length < 2) {
      return {
        direction: 'stable',
        confidence: 0,
        magnitude: 0
      };
    }

    // Extract numeric values for trend analysis
    const values = data.map(entry => this.extractProgressValue(entry.data)).filter(v => v !== null);
    
    if (values.length < 2) {
      return {
        direction: 'stable',
        confidence: 0,
        magnitude: 0
      };
    }

    // Perform linear regression for trend
    const n = values.length;
    const x = Array.from({ length: n }, (_, i) => i);
    const y = values;
    
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    
    // Determine trend direction and confidence
    const direction = slope > 0.1 ? 'improving' : slope < -0.1 ? 'declining' : 'stable';
    const magnitude = Math.abs(slope);
    
    // Calculate R-squared for confidence
    const yMean = sumY / n;
    const ssRes = y.reduce((sum, yi, i) => {
      const predicted = slope * x[i] + (sumY - slope * sumX) / n;
      return sum + Math.pow(yi - predicted, 2);
    }, 0);
    const ssTot = y.reduce((sum, yi) => sum + Math.pow(yi - yMean, 2), 0);
    const confidence = Math.max(0, 1 - ssRes / ssTot);
    
    return {
      direction,
      confidence,
      magnitude
    };
  }

  private async generateTrendInsights(domain: AssessmentDomain, data: any[], analysis: any): Promise<any> {
    const insightsPrompt = `
Analyze the following progress data and trend analysis for insights:

Domain: ${domain}
Student: ${this.context.student.firstName} ${this.context.student.lastName}
Data Points: ${data.length}
Trend Direction: ${analysis.direction}
Trend Confidence: ${analysis.confidence}
Trend Magnitude: ${analysis.magnitude}

Recent Progress Data:
${JSON.stringify(data.slice(-10), null, 2)}

Student Context:
- Grade Level: ${this.context.student.gradeLevel}
- Disabilities: ${this.context.student.disabilities.join(', ')}
- Current Accommodations: ${this.context.student.accommodations.join(', ')}

Generate:
1. Key insights about the student's progress pattern
2. Potential factors influencing the trend
3. Predictions for next 2-4 weeks
4. Recommended interventions or strategy adjustments
5. Areas requiring closer monitoring

Return as JSON with 'insights' and 'predictions' arrays.
    `.trim();

    try {
      const response = await this.generateCompletion(insightsPrompt, {
        taskType: 'trend_analysis',
        maxTokens: 1000,
        temperature: 0.5
      });

      const result = JSON.parse(response.content);
      return {
        insights: result.insights || [],
        predictions: result.predictions || []
      };
    } catch (error) {
      this.log('error', 'Failed to generate trend insights', { error });
      return {
        insights: [`${analysis.direction} trend detected with ${(analysis.confidence * 100).toFixed(1)}% confidence`],
        predictions: ['Continue monitoring for pattern confirmation']
      };
    }
  }

  private async checkDomainForAlerts(domain: AssessmentDomain): Promise<ProgressAlert[]> {
    const alerts: ProgressAlert[] = [];
    const domainHistory = this.progressHistory.get(domain) || [];
    
    if (domainHistory.length < 2) return alerts;

    // Check for consecutive decline
    const recentEntries = domainHistory.slice(-3);
    if (this.checkConsecutiveDecline(recentEntries)) {
      alerts.push({
        studentId: this.context.student.id,
        domain,
        severity: 'critical',
        alertType: 'regression',
        message: `Student showing consecutive decline in ${domain} performance`,
        timestamp: new Date(),
        data: { consecutiveDeclineCount: 3, domain },
        recommendations: ['Review current intervention strategies', 'Consider additional assessment', 'Increase monitoring frequency'],
        recipients: ['teacher', 'specialist'],
        acknowledged: false
      });
    }

    // Check for plateau
    const plateauDays = this.checkForPlateau(domainHistory);
    if (plateauDays > 14) {
      alerts.push({
        studentId: this.context.student.id,
        domain,
        severity: 'warning',
        alertType: 'plateau',
        message: `No significant progress in ${domain} for ${plateauDays} days`,
        timestamp: new Date(),
        data: { plateauDays, domain },
        recommendations: ['Modify teaching strategies', 'Introduce new interventions', 'Review goal appropriateness'],
        recipients: ['teacher'],
        acknowledged: false
      });
    }

    return alerts;
  }

  private async checkCrossDomainPatterns(): Promise<ProgressAlert[]> {
    const alerts: ProgressAlert[] = [];
    
    // Check if decline is happening across multiple domains
    const declines = [];
    for (const domain of Object.values(AssessmentDomain)) {
      const trend = await this.analyzeTrends(domain, 14);
      if (trend.direction === 'declining' && trend.confidence > 0.5) {
        declines.push(domain);
      }
    }

    if (declines.length >= 3) {
      alerts.push({
        studentId: this.context.student.id,
        domain: AssessmentDomain.READING_COMPREHENSION, // Default domain for cross-domain alerts
        severity: 'critical',
        alertType: 'concern',
        message: `Declining performance detected across ${declines.length} domains`,
        timestamp: new Date(),
        data: { affectedDomains: declines, declineCount: declines.length },
        recommendations: [
          'Comprehensive student evaluation needed',
          'Review overall intervention plan',
          'Consider environmental or health factors',
          'IEP team meeting recommended'
        ],
        recipients: ['teacher', 'specialist', 'parent'],
        acknowledged: false
      });
    }

    return alerts;
  }

  private async checkIEPGoalProgress(): Promise<ProgressAlert[]> {
    const alerts: ProgressAlert[] = [];
    
    if (!this.context.iepData?.goals) return alerts;

    for (const goal of this.context.iepData.goals) {
      // Check if goal is behind schedule
      const progressRate = this.calculateGoalProgressRate(goal);
      if (progressRate < 0.5) { // Less than 50% of expected progress
        alerts.push({
          studentId: this.context.student.id,
          domain: goal.domain,
          severity: 'warning',
          alertType: 'concern',
          message: `IEP goal progress below expected rate: ${goal.description}`,
          timestamp: new Date(),
          data: { goalId: goal.id, progressRate, goalDescription: goal.description },
          recommendations: [
            'Review goal appropriateness',
            'Adjust intervention intensity',
            'Consider goal modification',
            'Increase progress monitoring frequency'
          ],
          recipients: ['teacher', 'specialist'],
          acknowledged: false
        });
      }
    }

    return alerts;
  }

  private async collectReportData(timeframe: number): Promise<any> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - timeframe);

    const reportData = {
      timeframe,
      studentInfo: {
        name: `${this.context.student.firstName} ${this.context.student.lastName}`,
        grade: this.context.student.gradeLevel,
        disabilities: this.context.student.disabilities
      },
      domainSummaries: [] as any[],
      trends: [] as any[],
      alerts: await this.generateAlerts(),
      recommendations: [] as string[]
    };

    // Collect domain summaries
    for (const domain of Object.values(AssessmentDomain)) {
      const domainHistory = this.progressHistory.get(domain) || [];
      const recentData = domainHistory.filter(entry => entry.timestamp >= cutoffDate);
      
      if (recentData.length > 0) {
        const trend = await this.analyzeTrends(domain, timeframe);
        
        reportData.domainSummaries.push({
          domain,
          dataPoints: recentData.length,
          trend: trend.direction,
          confidence: trend.confidence,
          insights: trend.insights
        });
        
        reportData.trends.push(trend);
      }
    }

    return reportData;
  }

  private buildReportAnalysisPrompt(reportData: any): string {
    return `
Generate a comprehensive progress monitoring report based on the following data:

Student: ${reportData.studentInfo.name}
Grade: ${reportData.studentInfo.grade}
Reporting Period: ${reportData.timeframe} days
Disabilities: ${reportData.studentInfo.disabilities.join(', ')}

Domain Performance Summary:
${JSON.stringify(reportData.domainSummaries, null, 2)}

Active Alerts:
${reportData.alerts.map((alert: any) => 
  `- ${alert.level.toUpperCase()}: ${alert.message} (${alert.domain})`
).join('\n')}

Include in the report:
1. Executive Summary of overall progress
2. Domain-by-domain analysis with trends
3. Key achievements and areas of concern
4. Pattern analysis across domains
5. Impact of current interventions
6. Evidence-based recommendations
7. Next steps and action items
8. Suggested monitoring adjustments

Format as a professional progress monitoring report suitable for educators and parents.
    `.trim();
  }

  private formatProgressReport(content: string, reportData: any): string {
    const currentDate = new Date().toLocaleDateString();
    
    return `
PROGRESS MONITORING REPORT
Student: ${reportData.studentInfo.name}
Grade Level: ${reportData.studentInfo.grade}
Report Period: ${reportData.timeframe} days (ending ${currentDate})
Generated: ${currentDate}

${content}

SUMMARY STATISTICS:
- Domains Monitored: ${reportData.domainSummaries.length}
- Total Data Points: ${reportData.domainSummaries.reduce((sum: number, d: any) => sum + d.dataPoints, 0)}
- Active Alerts: ${reportData.alerts.length}
- High Priority Alerts: ${reportData.alerts.filter((a: any) => a.level === 'high').length}

This report was automatically generated by the AIVO Progress Monitoring System.
    `.trim();
  }

  private async performPredictiveAnalysis(domain: AssessmentDomain, history: any[], projectionDays: number): Promise<any> {
    // Extract trend and project forward
    const trend = await this.performTrendAnalysis(history);
    
    if (trend.confidence < 0.3) {
      return {
        domain,
        prediction: 'uncertain',
        confidence: trend.confidence,
        projectedDate: null,
        recommendations: ['Collect more consistent data for reliable predictions']
      };
    }

    // Simple linear projection
    const currentValue = this.extractProgressValue(history[history.length - 1].data);
    
    if (currentValue === null) {
      return {
        domain,
        prediction: 'insufficient_data',
        confidence: 0,
        projectedDate: null,
        recommendations: ['Unable to extract numeric progress value for prediction']
      };
    }
    
    const projectedValue = currentValue + (trend.magnitude * projectionDays * (trend.direction === 'improving' ? 1 : -1));
    
    return {
      domain,
      prediction: trend.direction,
      confidence: trend.confidence,
      currentValue,
      projectedValue,
      projectedDate: new Date(Date.now() + projectionDays * 24 * 60 * 60 * 1000),
      recommendations: this.generatePredictionRecommendations(trend, projectedValue)
    };
  }

  private extractProgressValue(data: any): number | null {
    // Extract numeric progress value from various data formats
    if (typeof data === 'number') return data;
    if (data && typeof data.score === 'number') return data.score;
    if (data && typeof data.percentage === 'number') return data.percentage;
    if (data && typeof data.accuracy === 'number') return data.accuracy;
    return null;
  }

  private checkConsecutiveDecline(entries: any[]): boolean {
    if (entries.length < 3) return false;
    
    const values = entries.map(e => this.extractProgressValue(e.data)).filter(v => v !== null);
    if (values.length < 3) return false;
    
    return values[1] < values[0] && values[2] < values[1];
  }

  private checkForPlateau(history: any[]): number {
    // Calculate days since last significant progress
    const recentEntries = history.slice(-10);
    if (recentEntries.length < 2) return 0;
    
    const values = recentEntries.map(e => this.extractProgressValue(e.data)).filter(v => v !== null);
    const latestValue = values[values.length - 1];
    
    let plateauDays = 0;
    for (let i = values.length - 2; i >= 0; i--) {
      const change = Math.abs(values[i] - latestValue) / latestValue;
      if (change > 0.05) break; // 5% change considered significant
      plateauDays += 1;
    }
    
    return plateauDays;
  }

  private calculateGoalProgressRate(goal: IEPGoal): number {
    // Calculate expected vs actual progress rate for IEP goal
    const daysSinceStart = Math.floor((Date.now() - goal.targetDate.getTime()) / (1000 * 60 * 60 * 24));
    const totalDays = Math.floor((goal.targetDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    
    if (totalDays <= 0) return 1; // Goal period ended
    
    const expectedProgress = daysSinceStart / totalDays;
    const actualProgress = goal.progress.length > 0 ? 
      (goal.progress[goal.progress.length - 1] as any).progressPercentage / 100 : 0;
    
    return actualProgress / expectedProgress;
  }

  private generatePredictionRecommendations(trend: any, projectedValue: number): string[] {
    const recommendations = [];
    
    if (trend.direction === 'declining') {
      recommendations.push('Implement immediate intervention strategies');
      recommendations.push('Increase monitoring frequency');
      recommendations.push('Review and adjust current teaching methods');
    } else if (trend.direction === 'improving') {
      recommendations.push('Continue current successful strategies');
      recommendations.push('Consider advancing difficulty level');
      recommendations.push('Document effective interventions for replication');
    } else {
      recommendations.push('Introduce variety in teaching approaches');
      recommendations.push('Set more challenging or different goals');
      recommendations.push('Investigate factors maintaining plateau');
    }
    
    return recommendations;
  }

  private async saveProgressData(): Promise<void> {
    // Save progress history and monitoring state
    this.log('debug', 'Saving progress monitoring data', {
      domains: this.progressHistory.size,
      totalEntries: Array.from(this.progressHistory.values()).reduce((sum, arr) => sum + arr.length, 0)
    });
  }
}