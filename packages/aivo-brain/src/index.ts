/**
 * AIVO Brain - Core AI Service
 * Multi-provider AI orchestration system for educational applications
 */

// Core exports
export * from './types';
export * from './providers';
export * from './capabilities';

// Import for internal use
import { TaskType } from './types';

// Main service exports
import { ProviderManager } from './providers/provider-manager';
import { EducationalCapabilities } from './capabilities';
import type { 
  ProviderConfig,
  AIRequest,
  AIResponse
} from './types';
import { 
  AIProvider, 
  EducationalContext
} from './types';

/**
 * Main AIVO Brain Service
 * Orchestrates AI providers and educational capabilities
 */
export class AivoBrain {
  private providerManager: ProviderManager;
  private capabilities: EducationalCapabilities;

  constructor(configs: ProviderConfig[]) {
    // Create provider manager with default load balancing config
    this.providerManager = new ProviderManager({
      loadBalancing: {
        strategy: 'round_robin',
        maxConcurrentPerProvider: 10
      },
      healthCheckInterval: 60000 // Check health every minute
    });
    
    this.capabilities = new EducationalCapabilities(this.providerManager);
  }

  /**
   * Initialize the AIVO Brain system
   */
  async initialize(providerConfigs: ProviderConfig[]): Promise<void> {
    // Initialize providers based on configs
    for (const config of providerConfigs) {
      if (config.enabled) {
        try {
          await this.addProviderFromConfig(config);
        } catch (error) {
          console.error(`Failed to initialize provider ${config.provider}:`, error);
        }
      }
    }
    console.log('AIVO Brain initialized successfully');
  }

  private async addProviderFromConfig(config: ProviderConfig): Promise<void> {
    // This would create and add providers based on configuration
    // For now, we'll just log the intention
    console.log(`Would initialize provider: ${config.provider}`);
  }

  /**
   * Get educational capabilities
   */
  getCapabilities(): EducationalCapabilities {
    return this.capabilities;
  }

  /**
   * Get provider manager for direct access
   */
  getProviderManager(): ProviderManager {
    return this.providerManager;
  }

  /**
   * Generate AI completion using the best available provider
   */
  async generateCompletion(request: AIRequest): Promise<AIResponse> {
    return this.providerManager.generateCompletion(request);
  }

  /**
   * Get system health status
   */
  async getHealthStatus(): Promise<SystemHealthStatus> {
    const providerHealthMap = this.providerManager.getAllHealthStats();
    const capabilityHealth = await this.capabilities.getHealthStatus();
    
    // Convert health map to simple status
    const providerHealth = {
      overall: this.determineProviderOverallHealth(providerHealthMap),
      details: providerHealthMap
    };
    
    const overallHealth = this.determineOverallHealth(
      providerHealth.overall,
      capabilityHealth.overall
    );

    return {
      overall: overallHealth,
      providers: providerHealth,
      capabilities: capabilityHealth,
      timestamp: new Date()
    };
  }

  /**
   * Shutdown the system gracefully
   */
  async shutdown(): Promise<void> {
    await this.providerManager.dispose();
    console.log('AIVO Brain shutdown complete');
  }

  private determineProviderOverallHealth(
    healthMap: Map<AIProvider, any>
  ): 'healthy' | 'degraded' | 'unhealthy' {
    if (healthMap.size === 0) return 'unhealthy';
    
    const healthValues = Array.from(healthMap.values());
    const unhealthyCount = healthValues.filter(h => h.status === 'unhealthy').length;
    const degradedCount = healthValues.filter(h => h.status === 'degraded').length;
    
    if (unhealthyCount > healthValues.length / 2) return 'unhealthy';
    if (degradedCount > 0 || unhealthyCount > 0) return 'degraded';
    return 'healthy';
  }

  private determineOverallHealth(
    providerHealth: string, 
    capabilityHealth: string
  ): 'healthy' | 'degraded' | 'unhealthy' {
    if (providerHealth === 'unhealthy' || capabilityHealth === 'unhealthy') {
      return 'unhealthy';
    }
    if (providerHealth === 'degraded' || capabilityHealth === 'degraded') {
      return 'degraded';
    }
    return 'healthy';
  }
}

export interface SystemHealthStatus {
  overall: 'healthy' | 'degraded' | 'unhealthy';
  providers: any;
  capabilities: any;
  timestamp: Date;
}

// Convenience factory functions
export function createAivoBrain(configs: ProviderConfig[]): AivoBrain {
  return new AivoBrain(configs);
}

export function createDefaultAivoBrain(): AivoBrain {
  const defaultConfigs: ProviderConfig[] = [
    {
      provider: AIProvider.OPENAI,
      enabled: !!process.env.OPENAI_API_KEY,
      apiKey: process.env.OPENAI_API_KEY || '',
      defaultModel: 'gpt-4',
      availableModels: ['gpt-4', 'gpt-3.5-turbo'],
      rateLimit: {
        requestsPerMinute: 100,
        concurrent: 5
      },
      costs: {
        'gpt-4': { inputTokens: 0.03, outputTokens: 0.06 },
        'gpt-3.5-turbo': { inputTokens: 0.001, outputTokens: 0.002 }
      },
      capabilities: [TaskType.QUESTION_GENERATION, TaskType.CONTENT_ADAPTATION, TaskType.SUMMARIZATION],
      priority: 80,
      timeout: 30000,
      retries: 3
    },
    {
      provider: AIProvider.ANTHROPIC,
      enabled: !!process.env.ANTHROPIC_API_KEY,
      apiKey: process.env.ANTHROPIC_API_KEY || '',
      defaultModel: 'claude-3-5-sonnet-20241022',
      availableModels: ['claude-3-5-sonnet-20241022'],
      rateLimit: {
        requestsPerMinute: 100,
        concurrent: 5
      },
      costs: {
        'claude-3-5-sonnet-20241022': { inputTokens: 0.003, outputTokens: 0.015 }
      },
      capabilities: [TaskType.QUESTION_GENERATION, TaskType.CONTENT_ADAPTATION, TaskType.SUMMARIZATION],
      priority: 85,
      timeout: 30000,
      retries: 3
    }
  ];
  
  return new AivoBrain(defaultConfigs);
}

// Version info
export const VERSION = '1.0.0';
export const BUILD_DATE = new Date().toISOString();

console.log(`AIVO Brain v${VERSION} loaded`);