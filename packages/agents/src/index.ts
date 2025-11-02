// =============================================================================
// AIVO Agents Package - Main Exports
// =============================================================================

// Types and Interfaces
export * from './types';
export type { AgentType, AgentConfig, AgentContext } from './types';

// Base Agent Architecture
export { BaseAgent } from './agents/base-agent';

// Specialized Educational AI Agents
export { BaselineAssessmentAgent } from './agents/baseline-assessment-agent';
export { PersonalModelAgent } from './agents/personal-model-agent';
export { IEPAssistantAgent } from './agents/iep-assistant-agent';
export { ProgressMonitorAgent } from './agents/progress-monitor-agent';
export { HomeworkHelperAgent } from './agents/homework-helper-agent';
export { FocusGuardianAgent } from './agents/focus-guardian-agent';
export { GameGenerationAgent } from './agents/game-generation-agent';

// Import types and classes for factory
import type { AivoBrain } from '@aivo/aivo-brain';
import { AgentType } from './types';
import type { AgentConfig, AgentContext } from './types';
import { BaselineAssessmentAgent } from './agents/baseline-assessment-agent';
import { PersonalModelAgent } from './agents/personal-model-agent';
import { IEPAssistantAgent } from './agents/iep-assistant-agent';
import { ProgressMonitorAgent } from './agents/progress-monitor-agent';
import { FocusGuardianAgent, type FocusGuardianConfig } from './agents/focus-guardian-agent';
import { GameGenerationAgent } from './agents/game-generation-agent';
import { HomeworkHelperAgent } from './agents/homework-helper-agent';

// Agent Factory and Utilities
export class AgentFactory {
  /**
   * Create a specialized agent instance based on type
   */
  static createAgent(
    type: AgentType,
    config: AgentConfig,
    context: AgentContext,
    aivoBrain: AivoBrain
  ) {
    switch (type) {
      case AgentType.BASELINE_ASSESSMENT: {
        return new BaselineAssessmentAgent(config, context, aivoBrain);
      }
        
      case AgentType.PERSONAL_MODEL: {
        return new PersonalModelAgent(config, context, aivoBrain);
      }
        
      case AgentType.IEP_ASSISTANT: {
        return new IEPAssistantAgent(config, context, aivoBrain);
      }
        
      case AgentType.PROGRESS_MONITOR: {
        return new ProgressMonitorAgent(config, context, aivoBrain);
      }
        
      case AgentType.FOCUS_GUARDIAN: {
        return new FocusGuardianAgent(config as FocusGuardianConfig, context, aivoBrain);
      }
        
      case AgentType.GAME_GENERATOR: {
        return new GameGenerationAgent(type, config, context, aivoBrain);
      }
        
      case AgentType.HOMEWORK_HELPER: {
        return new HomeworkHelperAgent(config, context, aivoBrain);
      }
        
      default:
        throw new Error(`Unknown agent type: ${type}`);
    }
  }

  /**
   * Get available agent types
   */
  static getAvailableTypes(): AgentType[] {
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
    },
    focus_guardian: {
      description: 'Real-time attention monitoring and intervention system with privacy-first design',
      capabilities: ['attention_tracking', 'distraction_detection', 'intervention_strategies', 'focus_analytics', 'parental_controls']
    },
    game_generator: {
      description: 'Educational game generation with age-appropriate content and dynamic difficulty',
      capabilities: ['age_appropriate_games', 'dynamic_content', 'educational_alignment', 'engagement_analytics', 'adaptive_difficulty']
    }
  }
};