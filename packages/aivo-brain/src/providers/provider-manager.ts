import { EventEmitter } from 'events';
import PQueue from 'p-queue';
import {
  AIProvider,
  AIProviderInterface,
  AIRequest,
  AIResponse,
  ProviderConfig,
  ProviderHealth,
  ProviderStatus,
  TaskType,
  LoadBalancingConfig,
  RoutingStrategy,
  AIError,
  AIErrorType,
  Priority
} from '../types';

/**
 * Provider Manager - Orchestrates multiple AI providers
 * Handles load balancing, failover, health monitoring, and request routing
 */
export class ProviderManager extends EventEmitter {
  private providers = new Map<AIProvider, AIProviderInterface>();
  private healthStats = new Map<AIProvider, ProviderHealth>();
  private requestQueues = new Map<AIProvider, PQueue>();
  private routingStrategies = new Map<string, RoutingStrategy>();
  private loadBalancingConfig: LoadBalancingConfig;
  private healthCheckInterval?: NodeJS.Timeout;

  constructor(config: {
    loadBalancing: LoadBalancingConfig;
    healthCheckInterval?: number;
  }) {
    super();
    this.loadBalancingConfig = config.loadBalancing;
    this.initializeRoutingStrategies();
    
    if (config.healthCheckInterval) {
      this.startHealthMonitoring(config.healthCheckInterval);
    }
  }

  // =============================================================================
  // PROVIDER MANAGEMENT
  // =============================================================================

  async addProvider(provider: AIProviderInterface): Promise<void> {
    try {
      await provider.initialize();
      
      this.providers.set(provider.provider, provider);
      this.requestQueues.set(provider.provider, new PQueue({
        concurrency: provider.config.rateLimit.concurrent,
        interval: 60000,
        intervalCap: provider.config.rateLimit.requestsPerMinute
      }));

      // Set up provider event listeners
      (provider as any).on('error', (event: any) => {
        this.emit('providerError', event);
      });

      (provider as any).on('completion', (event: any) => {
        this.emit('providerCompletion', event);
      });

      console.log(`Provider ${provider.provider} added successfully`);
      this.emit('providerAdded', { provider: provider.provider });

    } catch (error) {
      console.error(`Failed to add provider ${provider.provider}:`, error);
      throw error;
    }
  }

  async removeProvider(providerType: AIProvider): Promise<void> {
    const provider = this.providers.get(providerType);
    if (!provider) {
      return;
    }

    try {
      await provider.dispose();
      this.providers.delete(providerType);
      this.healthStats.delete(providerType);
      
      const queue = this.requestQueues.get(providerType);
      if (queue) {
        queue.clear();
        this.requestQueues.delete(providerType);
      }

      console.log(`Provider ${providerType} removed successfully`);
      this.emit('providerRemoved', { provider: providerType });

    } catch (error) {
      console.error(`Failed to remove provider ${providerType}:`, error);
      throw error;
    }
  }

  getProvider(providerType: AIProvider): AIProviderInterface | null {
    return this.providers.get(providerType) || null;
  }

  getAllProviders(): AIProviderInterface[] {
    return Array.from(this.providers.values());
  }

  getHealthyProviders(): AIProviderInterface[] {
    return Array.from(this.providers.values()).filter(provider => {
      const health = this.healthStats.get(provider.provider);
      return health?.status === ProviderStatus.HEALTHY;
    });
  }

  // =============================================================================
  // REQUEST ROUTING & LOAD BALANCING
  // =============================================================================

  async generateCompletion(request: AIRequest): Promise<AIResponse> {
    const availableProviders = this.getProvidersForTask(request.taskType);
    
    if (availableProviders.length === 0) {
      throw new AIError(
        AIErrorType.PROVIDER_UNAVAILABLE,
        AIProvider.OPENAI, // Default for error reporting
        `No providers available for task type: ${request.taskType}`
      );
    }

    const strategy = this.routingStrategies.get(this.loadBalancingConfig.strategy);
    if (!strategy) {
      throw new Error(`Unknown routing strategy: ${this.loadBalancingConfig.strategy}`);
    }

    let lastError: AIError | null = null;
    let attemptedProviders: AIProvider[] = [];

    // Try primary provider selection
    const primaryProvider = strategy.selectProvider(availableProviders, request);
    if (primaryProvider) {
      try {
        return await this.executeRequest(primaryProvider, request);
      } catch (error) {
        lastError = error instanceof AIError ? error : new AIError(
          AIErrorType.UNKNOWN,
          primaryProvider.provider,
          error instanceof Error ? error.message : String(error)
        );
        attemptedProviders.push(primaryProvider.provider);
        
        this.emit('providerFailed', {
          provider: primaryProvider.provider,
          request,
          error: lastError
        });
      }
    }

    // Try failover chain if configured
    if (this.loadBalancingConfig.failoverChain) {
      for (const providerType of this.loadBalancingConfig.failoverChain) {
        if (attemptedProviders.includes(providerType)) {
          continue;
        }

        const provider = this.providers.get(providerType);
        if (!provider || !provider.supportsTask(request.taskType)) {
          continue;
        }

        const health = this.healthStats.get(providerType);
        if (health?.status === ProviderStatus.UNHEALTHY) {
          continue;
        }

        try {
          return await this.executeRequest(provider, request);
        } catch (error) {
          lastError = error instanceof AIError ? error : new AIError(
            AIErrorType.UNKNOWN,
            provider.provider,
            error instanceof Error ? error.message : String(error)
          );
          attemptedProviders.push(provider.provider);
          
          this.emit('providerFailed', {
            provider: provider.provider,
            request,
            error: lastError
          });
        }
      }
    }

    // If all providers failed, throw the last error
    throw lastError || new AIError(
      AIErrorType.PROVIDER_UNAVAILABLE,
      AIProvider.OPENAI,
      'All providers failed'
    );
  }

  async* generateStream(request: AIRequest): AsyncGenerator<Partial<AIResponse>, AIResponse> {
    const availableProviders = this.getProvidersForTask(request.taskType);
    
    if (availableProviders.length === 0) {
      throw new AIError(
        AIErrorType.PROVIDER_UNAVAILABLE,
        AIProvider.OPENAI,
        `No providers available for task type: ${request.taskType}`
      );
    }

    const strategy = this.routingStrategies.get(this.loadBalancingConfig.strategy);
    if (!strategy) {
      throw new Error(`Unknown routing strategy: ${this.loadBalancingConfig.strategy}`);
    }

    const provider = strategy.selectProvider(availableProviders, request);
    if (!provider) {
      throw new AIError(
        AIErrorType.PROVIDER_UNAVAILABLE,
        AIProvider.OPENAI,
        'No suitable provider found'
      );
    }

    const queue = this.requestQueues.get(provider.provider);
    if (!queue) {
      throw new AIError(
        AIErrorType.PROVIDER_UNAVAILABLE,
        provider.provider,
        'Provider queue not found'
      );
    }

    // Execute streaming request through the queue
    const generator = await queue.add(async () => {
      return provider.generateStream(request);
    });
    
    if (generator) {
      return yield* generator;
    }
    
    // Fallback response if no generator
    throw new AIError(
      AIErrorType.PROVIDER_UNAVAILABLE,
      provider.provider,
      'Failed to get stream generator'
    );
  }

  // =============================================================================
  // HEALTH MONITORING
  // =============================================================================

  async checkAllProviders(): Promise<Map<AIProvider, ProviderHealth>> {
    const healthPromises = Array.from(this.providers.entries()).map(
      async ([providerType, provider]) => {
        try {
          const health = await provider.healthCheck();
          this.healthStats.set(providerType, health);
          return [providerType, health] as [AIProvider, ProviderHealth];
        } catch (error) {
          const unhealthyStatus: ProviderHealth = {
            provider: providerType,
            status: ProviderStatus.UNHEALTHY,
            lastCheck: new Date(),
            latency: 0,
            errorRate: 100,
            availability: 0,
            metrics: {
              totalRequests: 0,
              successfulRequests: 0,
              failedRequests: 0,
              averageLatency: 0,
              tokensProcessed: 0,
              totalCost: 0
            },
            error: error instanceof Error ? error.message : String(error)
          };
          
          this.healthStats.set(providerType, unhealthyStatus);
          return [providerType, unhealthyStatus] as [AIProvider, ProviderHealth];
        }
      }
    );

    const results = await Promise.all(healthPromises);
    return new Map(results);
  }

  getProviderHealth(providerType: AIProvider): ProviderHealth | null {
    return this.healthStats.get(providerType) || null;
  }

  getAllHealthStats(): Map<AIProvider, ProviderHealth> {
    return new Map(this.healthStats);
  }

  // =============================================================================
  // PRIVATE METHODS
  // =============================================================================

  private async executeRequest(provider: AIProviderInterface, request: AIRequest): Promise<AIResponse> {
    const queue = this.requestQueues.get(provider.provider);
    if (!queue) {
      throw new AIError(
        AIErrorType.PROVIDER_UNAVAILABLE,
        provider.provider,
        'Provider queue not found'
      );
    }

    const result = await queue.add(async () => {
      return provider.generateCompletion(request);
    });

    if (!result) {
      throw new AIError(
        AIErrorType.PROVIDER_UNAVAILABLE,
        provider.provider,
        'Provider returned empty result'
      );
    }

    return result;
  }

  private getProvidersForTask(taskType: TaskType): AIProviderInterface[] {
    return Array.from(this.providers.values()).filter(provider => {
      // Check if provider supports the task
      if (!provider.supportsTask(taskType)) {
        return false;
      }

      // Check if provider is healthy
      const health = this.healthStats.get(provider.provider);
      if (health?.status === ProviderStatus.UNHEALTHY) {
        return false;
      }

      return true;
    });
  }

  private initializeRoutingStrategies(): void {
    // Round Robin Strategy
    this.routingStrategies.set('round_robin', new RoundRobinStrategy());
    
    // Cost Optimized Strategy
    this.routingStrategies.set('cost_optimized', new CostOptimizedStrategy());
    
    // Performance Based Strategy
    this.routingStrategies.set('performance_based', new PerformanceBasedStrategy(this.healthStats));
    
    // Weighted Strategy
    this.routingStrategies.set('weighted', new WeightedStrategy(this.loadBalancingConfig.weights));
  }

  private startHealthMonitoring(interval: number): void {
    this.healthCheckInterval = setInterval(async () => {
      try {
        await this.checkAllProviders();
        this.emit('healthCheckCompleted', {
          timestamp: new Date(),
          healthStats: this.getAllHealthStats()
        });
      } catch (error) {
        console.error('Health check failed:', error);
        this.emit('healthCheckFailed', { error });
      }
    }, interval);
  }

  async dispose(): Promise<void> {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }

    // Dispose all providers
    const disposePromises = Array.from(this.providers.values()).map(
      provider => provider.dispose()
    );
    
    await Promise.allSettled(disposePromises);
    
    this.providers.clear();
    this.healthStats.clear();
    this.requestQueues.clear();
  }
}

// =============================================================================
// ROUTING STRATEGIES
// =============================================================================

class RoundRobinStrategy implements RoutingStrategy {
  name = 'round_robin';
  private currentIndex = 0;

  selectProvider(providers: AIProviderInterface[]): AIProviderInterface | null {
    if (providers.length === 0) return null;
    
    const provider = providers[this.currentIndex % providers.length];
    this.currentIndex = (this.currentIndex + 1) % providers.length;
    return provider;
  }
}

class CostOptimizedStrategy implements RoutingStrategy {
  name = 'cost_optimized';

  selectProvider(providers: AIProviderInterface[], request: AIRequest): AIProviderInterface | null {
    if (providers.length === 0) return null;
    
    return providers.reduce((cheapest, current) => {
      const cheapestCost = cheapest.estimateCost(request);
      const currentCost = current.estimateCost(request);
      return currentCost < cheapestCost ? current : cheapest;
    });
  }
}

class PerformanceBasedStrategy implements RoutingStrategy {
  name = 'performance_based';

  constructor(private healthStats: Map<AIProvider, ProviderHealth>) {}

  selectProvider(providers: AIProviderInterface[]): AIProviderInterface | null {
    if (providers.length === 0) return null;
    
    return providers.reduce((fastest, current) => {
      const fastestHealth = this.healthStats.get(fastest.provider);
      const currentHealth = this.healthStats.get(current.provider);
      
      if (!fastestHealth) return current;
      if (!currentHealth) return fastest;
      
      return currentHealth.latency < fastestHealth.latency ? current : fastest;
    });
  }
}

class WeightedStrategy implements RoutingStrategy {
  name = 'weighted';

  constructor(private weights?: Record<AIProvider, number>) {}

  selectProvider(providers: AIProviderInterface[]): AIProviderInterface | null {
    if (providers.length === 0) return null;
    if (!this.weights) return providers[0];
    
    // Simple weighted selection based on provider priority and weights
    const weightedProviders = providers.map(provider => ({
      provider,
      weight: (this.weights?.[provider.provider] || 1) * provider.config.priority
    }));
    
    const totalWeight = weightedProviders.reduce((sum, item) => sum + item.weight, 0);
    const random = Math.random() * totalWeight;
    
    let currentWeight = 0;
    for (const item of weightedProviders) {
      currentWeight += item.weight;
      if (random <= currentWeight) {
        return item.provider;
      }
    }
    
    return weightedProviders[0].provider;
  }
}