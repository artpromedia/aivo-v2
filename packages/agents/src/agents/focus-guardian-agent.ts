import { BaseAgent } from './base-agent';
import type { FocusEvent, FocusMetrics, InterventionStrategy, FocusSession, Intervention } from '../types/focus-types';

import type { AgentConfig, AgentContext } from '../types';
import { AgentType } from '../types';
import type { AivoBrain } from '@aivo/aivo-brain';

export interface FocusGuardianConfig extends AgentConfig {
  learnerId: string;
  ageGroup: 'k5' | 'middle' | 'high';
  attentionSpanBaseline: number; // minutes
  iepData?: {
    attentionDeficitFlags: boolean;
    customThresholds?: Partial<FocusThresholds>;
    medicationSchedule?: string[];
  };
  parentalConsent: {
    webcamMonitoring: boolean;
    keystrokeAnalysis: boolean;
    tabSwitchTracking: boolean;
  };
}

export interface FocusThresholds {
  mouseIdleTime: number; // seconds
  typingPauseThreshold: number; // seconds
  tabSwitchLimit: number; // per session
  responseTimeSlowdown: number; // percentage increase
  scrollPatternIrregularity: number; // 0-1 score
  frustrationThreshold: number; // rapid clicks per minute
}

export interface FocusMonitoringData {
  mouseMovements: Array<{ x: number; y: number; timestamp: number }>;
  keystrokes: Array<{ key: string; timestamp: number; interval: number }>;
  scrollEvents: Array<{ deltaY: number; timestamp: number }>;
  tabSwitches: Array<{ fromTab: string; toTab: string; timestamp: number }>;
  questionResponses: Array<{ questionId: string; responseTime: number; correct: boolean }>;
  windowFocus: Array<{ focused: boolean; timestamp: number }>;
  webcamData?: Array<{ attentionScore: number; timestamp: number }>; // if consent given
}

export interface AttentionPattern {
  focusScore: number; // 0-100
  distractionLevel: 'low' | 'medium' | 'high';
  fatigueIndicators: string[];
  optimalLearningWindow: boolean;
  recommendedAction: 'continue' | 'break' | 'switch-subject' | 'end-session';
  confidence: number; // 0-1
  timestamp: Date;
}

export class FocusGuardianAgent extends BaseAgent {
  private focusConfig: FocusGuardianConfig;
  private currentSession: FocusSession | null = null;
  private monitoringInterval: NodeJS.Timeout | null = null;
  private thresholds: FocusThresholds;
  private focusHistory: FocusEvent[] = [];

  constructor(config: FocusGuardianConfig, context: AgentContext, aivoBrain: AivoBrain) {
    super(AgentType.FOCUS_GUARDIAN, config, context, aivoBrain);
    this.focusConfig = config;
    this.thresholds = this.calculateThresholds();
  }

  protected async initializeAgent(): Promise<void> {
    this.log('info', 'Initializing Focus Guardian Agent', {
      learnerId: this.focusConfig.learnerId,
      ageGroup: this.focusConfig.ageGroup
    });
    
    // Initialize monitoring systems
    this.focusHistory = [];
    this.currentSession = null;
    
    // Verify parental consent for monitoring features
    if (!this.validateConsentSettings()) {
      throw new Error('Invalid parental consent configuration');
    }
  }

  protected async disposeAgent(): Promise<void> {
    this.log('info', 'Disposing Focus Guardian Agent');
    
    // End any active session
    if (this.currentSession) {
      await this.endSession();
    }
    
    // Clear monitoring interval
    this.stopMonitoring();
    
    // Clear history to free memory
    this.focusHistory = [];
  }

  protected validateConfig(): boolean {
    const config = this.focusConfig;
    
    // Validate required fields
    if (!config.learnerId) {
      this.log('error', 'Missing required field: learnerId');
      return false;
    }
    
    if (!['k5', 'middle', 'high'].includes(config.ageGroup)) {
      this.log('error', 'Invalid age group', { ageGroup: config.ageGroup });
      return false;
    }
    
    if (!config.attentionSpanBaseline || config.attentionSpanBaseline <= 0) {
      this.log('error', 'Invalid attention span baseline', { 
        baseline: config.attentionSpanBaseline 
      });
      return false;
    }
    
    // Validate parental consent object
    if (!config.parentalConsent) {
      this.log('error', 'Missing parental consent configuration');
      return false;
    }
    
    return true;
  }

  private validateConsentSettings(): boolean {
    const consent = this.focusConfig.parentalConsent;
    
    // Ensure at least one monitoring type is enabled
    if (!consent.webcamMonitoring && !consent.keystrokeAnalysis && !consent.tabSwitchTracking) {
      this.log('warn', 'No monitoring types enabled - limited functionality');
    }
    
    return true;
  }

  private calculateThresholds(): FocusThresholds {
    // Age-specific baseline thresholds
    const baselineThresholds: Record<string, FocusThresholds> = {
      k5: {
        mouseIdleTime: 15,
        typingPauseThreshold: 8,
        tabSwitchLimit: 3,
        responseTimeSlowdown: 150, // 150% of baseline
        scrollPatternIrregularity: 0.7,
        frustrationThreshold: 10
      },
      middle: {
        mouseIdleTime: 20,
        typingPauseThreshold: 12,
        tabSwitchLimit: 5,
        responseTimeSlowdown: 130,
        scrollPatternIrregularity: 0.6,
        frustrationThreshold: 8
      },
      high: {
        mouseIdleTime: 30,
        typingPauseThreshold: 15,
        tabSwitchLimit: 7,
        responseTimeSlowdown: 120,
        scrollPatternIrregularity: 0.5,
        frustrationThreshold: 6
      }
    };

    const baseThresholds = baselineThresholds[this.focusConfig.ageGroup];
    
    // Apply IEP customizations if available
    if (this.focusConfig.iepData?.customThresholds) {
      return { ...baseThresholds, ...this.focusConfig.iepData.customThresholds };
    }

    return baseThresholds;
  }

  public async startSession(sessionId: string, subject: string): Promise<FocusSession> {
    this.currentSession = {
      id: sessionId,
      learnerId: this.focusConfig.learnerId,
      subject,
      startTime: new Date(),
      endTime: null,
      focusEvents: [],
      interventions: [],
      metrics: this.initializeMetrics(),
      status: 'active'
    };

    // Start monitoring
    this.startMonitoring();
    
    return this.currentSession;
  }

  public async endSession(): Promise<FocusSession> {
    if (!this.currentSession) {
      throw new Error('No active session to end');
    }

    this.stopMonitoring();
    this.currentSession.endTime = new Date();
    this.currentSession.status = 'completed';
    this.currentSession.metrics = this.calculateSessionMetrics();

    const completedSession = this.currentSession;
    this.currentSession = null;

    return completedSession;
  }

  public recordFocusEvent(event: Omit<FocusEvent, 'id' | 'timestamp'>): void {
    const focusEvent: FocusEvent = {
      ...event,
      id: this.generateId(),
      timestamp: new Date()
    };

    this.focusHistory.push(focusEvent);
    
    if (this.currentSession) {
      this.currentSession.focusEvents.push(focusEvent);
      this.analyzePatterns(focusEvent);
    }
  }

  public analyzeAttentionPattern(data: FocusMonitoringData): AttentionPattern {
    const scores = this.calculateAttentionScores(data);
    const distractionLevel = this.assessDistractionLevel(scores);
    const fatigueIndicators = this.detectFatigue(data);
    const optimalWindow = this.isOptimalLearningWindow();
    
    const focusScore = this.calculateOverallFocusScore(scores);
    const recommendedAction = this.determineRecommendedAction(focusScore, distractionLevel, fatigueIndicators);

    return {
      focusScore,
      distractionLevel,
      fatigueIndicators,
      optimalLearningWindow: optimalWindow,
      recommendedAction,
      confidence: 0.8, // Default confidence level
      timestamp: new Date()
    };
  }

  private calculateAttentionScores(data: FocusMonitoringData): Record<string, number> {
    const scores: Record<string, number> = {};

    // Mouse movement analysis
    scores.mouseActivity = this.analyzeMouseActivity(data.mouseMovements);
    
    // Typing rhythm analysis
    scores.typingRhythm = this.analyzeTypingRhythm(data.keystrokes);
    
    // Tab switch frequency
    scores.tabStability = this.analyzeTabStability(data.tabSwitches);
    
    // Response time analysis
    scores.responseConsistency = this.analyzeResponseTimes(data.questionResponses);
    
    // Scroll pattern analysis
    scores.scrollPattern = this.analyzeScrollPatterns(data.scrollEvents);
    
    // Window focus stability
    scores.windowFocus = this.analyzeWindowFocus(data.windowFocus);

    // Webcam attention (if available and consented)
    if (data.webcamData && this.focusConfig.parentalConsent.webcamMonitoring) {
      scores.visualAttention = this.analyzeVisualAttention(data.webcamData);
    }

    return scores;
  }

  private analyzeMouseActivity(movements: Array<{ x: number; y: number; timestamp: number }>): number {
    if (movements.length < 2) return 50; // neutral score

    let score = 100;
    let lastMovement = movements[0];
    let idleTime = 0;
    let erraticMovements = 0;

    for (let i = 1; i < movements.length; i++) {
      const movement = movements[i];
      const timeDiff = movement.timestamp - lastMovement.timestamp;
      
      // Check for idle time
      if (timeDiff > this.thresholds.mouseIdleTime * 1000) {
        idleTime += timeDiff;
      }

      // Check for erratic movements (rapid, large movements)
      const distance = Math.sqrt(
        Math.pow(movement.x - lastMovement.x, 2) + 
        Math.pow(movement.y - lastMovement.y, 2)
      );
      
      if (distance > 200 && timeDiff < 100) { // Large movement in short time
        erraticMovements++;
      }

      lastMovement = movement;
    }

    // Penalize excessive idle time and erratic movements
    const totalTime = movements[movements.length - 1].timestamp - movements[0].timestamp;
    const idleRatio = idleTime / totalTime;
    const erraticRatio = erraticMovements / movements.length;

    score -= (idleRatio * 50); // Max 50 point penalty for idle
    score -= (erraticRatio * 30); // Max 30 point penalty for erratic

    return Math.max(0, Math.min(100, score));
  }

  private analyzeTypingRhythm(keystrokes: Array<{ key: string; timestamp: number; interval: number }>): number {
    if (keystrokes.length < 5) return 50;

    let score = 100;
    let longPauses = 0;
    let rapidBursts = 0;

    for (const keystroke of keystrokes) {
      // Check for unusually long pauses
      if (keystroke.interval > this.thresholds.typingPauseThreshold * 1000) {
        longPauses++;
      }
      
      // Check for rapid, potentially frustrated typing
      if (keystroke.interval < 50 && keystroke.key === 'Backspace') {
        rapidBursts++;
      }
    }

    const pauseRatio = longPauses / keystrokes.length;
    const burstRatio = rapidBursts / keystrokes.length;

    score -= (pauseRatio * 40); // Penalty for confusion pauses
    score -= (burstRatio * 30); // Penalty for frustration

    return Math.max(0, Math.min(100, score));
  }

  private analyzeTabStability(tabSwitches: Array<{ fromTab: string; toTab: string; timestamp: number }>): number {
    const switchCount = tabSwitches.length;
    const limit = this.thresholds.tabSwitchLimit;
    
    if (switchCount <= limit) return 100;
    
    // Penalize excessive tab switching
    const excessSwitches = switchCount - limit;
    const penalty = (excessSwitches / limit) * 50;
    
    return Math.max(50, 100 - penalty);
  }

  private analyzeResponseTimes(responses: Array<{ questionId: string; responseTime: number; correct: boolean }>): number {
    if (responses.length < 3) return 50;

    // Calculate baseline response time from first few responses
    const baselineResponses = responses.slice(0, Math.min(3, responses.length));
    const baselineTime = baselineResponses.reduce((sum, r) => sum + r.responseTime, 0) / baselineResponses.length;
    
    let score = 100;
    let slowResponses = 0;

    for (const response of responses) {
      const slowdownRatio = response.responseTime / baselineTime;
      
      if (slowdownRatio > this.thresholds.responseTimeSlowdown / 100) {
        slowResponses++;
      }
    }

    const slowdownRate = slowResponses / responses.length;
    score -= (slowdownRate * 60); // Significant penalty for slowing down

    return Math.max(0, Math.min(100, score));
  }

  private analyzeScrollPatterns(scrollEvents: Array<{ deltaY: number; timestamp: number }>): number {
    if (scrollEvents.length < 5) return 50;

    let score = 100;
    let rapidScrolls = 0;
    let backtracking = 0;

    for (let i = 1; i < scrollEvents.length; i++) {
      const current = scrollEvents[i];
      const previous = scrollEvents[i - 1];
      const timeDiff = current.timestamp - previous.timestamp;

      // Rapid scrolling (too fast to read)
      if (Math.abs(current.deltaY) > 300 && timeDiff < 200) {
        rapidScrolls++;
      }

      // Excessive backtracking (scrolling up and down repeatedly)
      if (i > 1 && 
          Math.sign(current.deltaY) !== Math.sign(previous.deltaY) && 
          Math.sign(previous.deltaY) !== Math.sign(scrollEvents[i - 2].deltaY)) {
        backtracking++;
      }
    }

    const rapidRatio = rapidScrolls / scrollEvents.length;
    const backtrackRatio = backtracking / scrollEvents.length;

    score -= (rapidRatio * 30); // Penalty for not reading
    score -= (backtrackRatio * 40); // Penalty for confusion

    return Math.max(0, Math.min(100, score));
  }

  private analyzeWindowFocus(focusEvents: Array<{ focused: boolean; timestamp: number }>): number {
    if (focusEvents.length < 2) return 100;

    let totalFocusTime = 0;
    let totalTime = 0;
    let currentFocusStart: number | null = null;

    for (const event of focusEvents) {
      if (event.focused && currentFocusStart === null) {
        currentFocusStart = event.timestamp;
      } else if (!event.focused && currentFocusStart !== null) {
        totalFocusTime += event.timestamp - currentFocusStart;
        currentFocusStart = null;
      }
    }

    // Handle case where session ends while focused
    if (currentFocusStart !== null) {
      totalFocusTime += focusEvents[focusEvents.length - 1].timestamp - currentFocusStart;
    }

    totalTime = focusEvents[focusEvents.length - 1].timestamp - focusEvents[0].timestamp;
    const focusRatio = totalTime > 0 ? totalFocusTime / totalTime : 1;

    return Math.round(focusRatio * 100);
  }

  private analyzeVisualAttention(webcamData: Array<{ attentionScore: number; timestamp: number }>): number {
    if (webcamData.length === 0) return 50;

    const avgAttention = webcamData.reduce((sum, data) => sum + data.attentionScore, 0) / webcamData.length;
    return Math.round(avgAttention);
  }

  private assessDistractionLevel(scores: Record<string, number>): 'low' | 'medium' | 'high' {
    const avgScore = Object.values(scores).reduce((sum, score) => sum + score, 0) / Object.values(scores).length;

    if (avgScore >= 75) return 'low';
    if (avgScore >= 50) return 'medium';
    return 'high';
  }

  private detectFatigue(data: FocusMonitoringData): string[] {
    const indicators: string[] = [];

    // Declining response times over session
    if (data.questionResponses.length >= 5) {
      const firstHalf = data.questionResponses.slice(0, Math.floor(data.questionResponses.length / 2));
      const secondHalf = data.questionResponses.slice(Math.floor(data.questionResponses.length / 2));
      
      const firstAvg = firstHalf.reduce((sum, r) => sum + r.responseTime, 0) / firstHalf.length;
      const secondAvg = secondHalf.reduce((sum, r) => sum + r.responseTime, 0) / secondHalf.length;
      
      if (secondAvg > firstAvg * 1.3) {
        indicators.push('Response time degradation');
      }
    }

    // Increasing mouse idle time
    const recentMovements = data.mouseMovements.slice(-10);
    if (recentMovements.length > 1) {
      let longIdles = 0;
      for (let i = 1; i < recentMovements.length; i++) {
        const gap = recentMovements[i].timestamp - recentMovements[i-1].timestamp;
        if (gap > this.thresholds.mouseIdleTime * 1000) longIdles++;
      }
      
      if (longIdles / recentMovements.length > 0.5) {
        indicators.push('Increased inactivity');
      }
    }

    // Declining accuracy
    const recentResponses = data.questionResponses.slice(-5);
    if (recentResponses.length >= 3) {
      const accuracyRate = recentResponses.filter(r => r.correct).length / recentResponses.length;
      if (accuracyRate < 0.6) {
        indicators.push('Declining accuracy');
      }
    }

    return indicators;
  }

  private isOptimalLearningWindow(): boolean {
    const now = new Date();
    const hour = now.getHours();
    
    // Age-specific optimal learning windows
    const optimalHours: Record<string, number[]> = {
      k5: [9, 10, 11, 14, 15], // Morning and early afternoon
      middle: [9, 10, 11, 13, 14, 15, 16], // Extended afternoon
      high: [9, 10, 11, 13, 14, 15, 16, 19, 20] // Including evening
    };

    return optimalHours[this.focusConfig.ageGroup].includes(hour);
  }

  private calculateOverallFocusScore(scores: Record<string, number>): number {
    // Weighted average of different attention metrics
    const weights = {
      mouseActivity: 0.15,
      typingRhythm: 0.15,
      tabStability: 0.15,
      responseConsistency: 0.25,
      scrollPattern: 0.10,
      windowFocus: 0.15,
      visualAttention: 0.05 // Only if available
    };

    let weightedSum = 0;
    let totalWeight = 0;

    for (const [metric, score] of Object.entries(scores)) {
      const weight = weights[metric as keyof typeof weights] || 0;
      weightedSum += score * weight;
      totalWeight += weight;
    }

    return totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 50;
  }

  private determineRecommendedAction(
    focusScore: number, 
    distractionLevel: 'low' | 'medium' | 'high',
    fatigueIndicators: string[]
  ): 'continue' | 'break' | 'switch-subject' | 'end-session' {
    
    // High fatigue always suggests break or end
    if (fatigueIndicators.length >= 2) {
      return focusScore < 40 ? 'end-session' : 'break';
    }

    // High distraction suggests intervention
    if (distractionLevel === 'high') {
      return focusScore < 30 ? 'break' : 'switch-subject';
    }

    // Medium distraction with low focus suggests break
    if (distractionLevel === 'medium' && focusScore < 50) {
      return 'break';
    }

    // Otherwise continue learning
    return 'continue';
  }

  private startMonitoring(): void {
    // Start periodic analysis (every 30 seconds)
    this.monitoringInterval = setInterval(() => {
      if (this.currentSession) {
        this.performPeriodicAnalysis();
      }
    }, 30000);
  }

  private stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
  }

  private performPeriodicAnalysis(): void {
    if (!this.currentSession) return;

    // This would integrate with the actual monitoring hooks to get real data
    // For now, we'll emit an event that the monitoring system should analyze current state
    this.emit('analysis-required', {
      sessionId: this.currentSession.id,
      timestamp: new Date()
    });
  }

  private analyzePatterns(event: FocusEvent): void {
    // Real-time pattern analysis for immediate intervention
    if (event.type === 'distraction-detected' && event.severity === 'high') {
      this.triggerIntervention('immediate-break', 'High distraction detected');
    } else if (event.type === 'frustration-detected') {
      this.triggerIntervention('encouragement', 'Frustration patterns detected');
    }
  }

  public async triggerIntervention(type: InterventionStrategy, reason: string): Promise<void> {
    if (!this.currentSession) return;

    const intervention = {
      id: this.generateId(),
      type,
      reason,
      timestamp: new Date(),
      effectiveness: null // Will be measured later
    };

    this.currentSession.interventions.push(intervention);

    // Emit intervention event for UI to handle
    this.emit('intervention-triggered', {
      sessionId: this.currentSession.id,
      intervention
    });
  }

  private initializeMetrics(): FocusMetrics {
    return {
      totalFocusTime: 0,
      averageFocusScore: 0,
      distractionCount: 0,
      interventionCount: 0,
      gameBreakCount: 0,
      subjectSwitchCount: 0,
      optimalLearningTimePercentage: 0,
      fatigueOnsetTime: null
    };
  }

  private calculateSessionMetrics(): FocusMetrics {
    if (!this.currentSession) {
      return this.initializeMetrics();
    }

    const session = this.currentSession;
    const duration = session.endTime ? 
      (session.endTime.getTime() - session.startTime.getTime()) : 0;

    const focusEvents = session.focusEvents;
    const interventions = session.interventions;

    // Calculate total focus time from focus/blur events
    const totalFocusTime = this.calculateTotalFocusTime(focusEvents, duration);
    
    // Calculate average focus score
    const focusScores = focusEvents
      .filter((e: FocusEvent) => e.data?.focusScore !== undefined)
      .map((e: FocusEvent) => e.data!.focusScore as number);
    const averageFocusScore = focusScores.length > 0 ? 
      focusScores.reduce((sum: number, score: number) => sum + score, 0) / focusScores.length : 0;

    // Count different types of events and interventions
    const distractionCount = focusEvents.filter((e: FocusEvent) => e.type === 'distraction-detected').length;
    const interventionCount = interventions.length;
    const gameBreakCount = interventions.filter((i: Intervention) => i.type === 'game-break').length;
    const subjectSwitchCount = interventions.filter((i: Intervention) => i.type === 'subject-switch').length;

    // Calculate optimal learning time percentage
    const optimalLearningTimePercentage = this.calculateOptimalTimePercentage(session.startTime, duration);

    // Detect fatigue onset time
    const fatigueOnsetTime = this.detectFatigueOnset(focusEvents);

    return {
      totalFocusTime,
      averageFocusScore,
      distractionCount,
      interventionCount,
      gameBreakCount,
      subjectSwitchCount,
      optimalLearningTimePercentage,
      fatigueOnsetTime
    };
  }

  private calculateTotalFocusTime(events: FocusEvent[], sessionDuration: number): number {
    const focusEvents = events
      .filter(e => e.type === 'window-focus' || e.type === 'window-blur')
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    let totalFocusTime = 0;
    let currentFocusStart: Date | null = null;

    for (const event of focusEvents) {
      if (event.type === 'window-focus' && !currentFocusStart) {
        currentFocusStart = event.timestamp;
      } else if (event.type === 'window-blur' && currentFocusStart) {
        totalFocusTime += event.timestamp.getTime() - currentFocusStart.getTime();
        currentFocusStart = null;
      }
    }

    // If session ended while focused
    if (currentFocusStart && sessionDuration > 0) {
      totalFocusTime += sessionDuration - (currentFocusStart.getTime() - (this.currentSession?.startTime.getTime() || 0));
    }

    return Math.round(totalFocusTime / 1000); // Return in seconds
  }

  private calculateOptimalTimePercentage(startTime: Date, duration: number): number {
    if (duration === 0) return 0;

    const startHour = startTime.getHours();
    const endTime = new Date(startTime.getTime() + duration);
    const endHour = endTime.getHours();

    const optimalHours: Record<string, number[]> = {
      k5: [9, 10, 11, 14, 15],
      middle: [9, 10, 11, 13, 14, 15, 16],
      high: [9, 10, 11, 13, 14, 15, 16, 19, 20]
    };

    const optimal = optimalHours[this.focusConfig.ageGroup];
    let optimalMinutes = 0;

    for (let hour = startHour; hour <= endHour; hour++) {
      if (optimal.includes(hour)) {
        // Calculate overlap with this optimal hour
        const hourStart = Math.max(startTime.getTime(), new Date(startTime.getFullYear(), startTime.getMonth(), startTime.getDate(), hour).getTime());
        const hourEnd = Math.min(endTime.getTime(), new Date(startTime.getFullYear(), startTime.getMonth(), startTime.getDate(), hour + 1).getTime());
        
        if (hourEnd > hourStart) {
          optimalMinutes += (hourEnd - hourStart) / (1000 * 60);
        }
      }
    }

    return Math.round((optimalMinutes / (duration / (1000 * 60))) * 100);
  }

  private detectFatigueOnset(events: FocusEvent[]): Date | null {
    // Look for the first significant drop in focus score
    const focusScoreEvents = events
      .filter((e: FocusEvent) => e.data?.focusScore !== undefined)
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    if (focusScoreEvents.length < 5) return null;

    const windowSize = 3;
    let baselineScore = 0;

    // Calculate baseline from first few measurements
    for (let i = 0; i < Math.min(windowSize, focusScoreEvents.length); i++) {
      baselineScore += focusScoreEvents[i].data!.focusScore as number;
    }
    baselineScore /= Math.min(windowSize, focusScoreEvents.length);

    // Look for sustained drop below 70% of baseline
    const fatigueThreshold = baselineScore * 0.7;
    let consecutiveDrops = 0;

    for (let i = windowSize; i < focusScoreEvents.length; i++) {
      const currentScore = focusScoreEvents[i].data!.focusScore as number;
      
      if (currentScore < fatigueThreshold) {
        consecutiveDrops++;
        if (consecutiveDrops >= 2) { // Sustained drop
          return focusScoreEvents[i - 1].timestamp;
        }
      } else {
        consecutiveDrops = 0;
      }
    }

    return null;
  }

  public getFocusHistory(limit?: number): FocusEvent[] {
    const history = [...this.focusHistory].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    return limit ? history.slice(0, limit) : history;
  }

  public getCurrentSession(): FocusSession | null {
    return this.currentSession;
  }

  public getThresholds(): FocusThresholds {
    return { ...this.thresholds };
  }

  private generateId(): string {
    return `focus_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export default FocusGuardianAgent;