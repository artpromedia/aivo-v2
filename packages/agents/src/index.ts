// =============================================================================
// AIVO Agents Package - Main Exports
// =============================================================================

// Types and Interfaces
export * from './types';

// Base Agent Architecture
export { BaseAgent } from './agents/base-agent';

// Specialized Educational AI Agents
export { BaselineAssessmentAgent } from './agents/baseline-assessment-agent';
export { PersonalModelAgent } from './agents/personal-model-agent';
export { IEPAssistantAgent } from './agents/iep-assistant-agent';
export { ProgressMonitorAgent } from './agents/progress-monitor-agent';

// Agent Factory and Utilities
export class AgentFactory {
  /**
   * Create a specialized agent instance based on type
   */
  static createAgent(
    type: import('./types').AgentType,
    config: import('./types').AgentConfig,
    context: import('./types').AgentContext,
    aivoBrain: any
  ) {
    const { AgentType } = require('./types');
    
    switch (type) {
      case AgentType.BASELINE_ASSESSMENT:
        const { BaselineAssessmentAgent } = require('./agents/baseline-assessment-agent');
        return new BaselineAssessmentAgent(config, context, aivoBrain);
        
      case AgentType.PERSONAL_MODEL:
        const { PersonalModelAgent } = require('./agents/personal-model-agent');
        return new PersonalModelAgent(config, context, aivoBrain);
        
      case AgentType.IEP_ASSISTANT:
        const { IEPAssistantAgent } = require('./agents/iep-assistant-agent');
        return new IEPAssistantAgent(config, context, aivoBrain);
        
      case AgentType.PROGRESS_MONITOR:
        const { ProgressMonitorAgent } = require('./agents/progress-monitor-agent');
        return new ProgressMonitorAgent(config, context, aivoBrain);
        
      default:
        throw new Error(`Unknown agent type: ${type}`);
    }
  }

  /**
   * Get available agent types
   */
  static getAvailableTypes(): import('./types').AgentType[] {
    const { AgentType } = require('./types');
    return Object.values(AgentType);
  }
}

// Package Information
export const PACKAGE_INFO = {
  name: '@aivo/agents',
  version: '1.0.0',
  description: 'Specialized AI agents for educational assessment, personalization, and support',
  agents: {
    baseline_assessment: {
      description: 'Adaptive baseline assessment with multi-domain testing and real-time difficulty adjustment',
      capabilities: ['question_generation', 'difficulty_adaptation', 'comprehensive_reporting', 'gap_analysis']
    },
    personal_model: {
      description: 'Personalized learning model management with adaptation and interaction memory',
      capabilities: ['learning_style_detection', 'content_personalization', 'pacing_adjustment', 'suggestion_generation']
    },
    iep_assistant: {
      description: 'Comprehensive IEP management and support with compliance checking',
      capabilities: ['iep_template_generation', 'goal_creation', 'compliance_checking', 'progress_reporting', 'parent_communication']
    },
    progress_monitor: {
      description: 'Advanced progress tracking and trend analysis with predictive insights',
      capabilities: ['trend_analysis', 'alert_generation', 'outcome_prediction', 'automated_reporting']
    }
  }
};