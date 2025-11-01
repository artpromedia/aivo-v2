import { EventEmitter } from 'events';
import pRetry from 'p-retry';
import pTimeout from 'p-timeout';
import { 
  AIProvider, 
  AIProviderInterface, 
  AIRequest, 
  AIResponse, 
  ProviderConfig, 
  ProviderHealth, 
  ProviderStatus,
  TaskType,
  AIError,
  AIErrorType,
  RequestMetrics
} from '../types';

/**
 * Base abstract class for all AI providers
 * Provides common functionality like retry logic, rate limiting, health checks
 */
export abstract class BaseAIProvider extends EventEmitter implements AIProviderInterface {
  public readonly provider: AIProvider;
  public readonly config: ProviderConfig;
  
  private _isInitialized = false;
  private _health: ProviderHealth;
  private _activeConnections = 0;
  private _requestCount = 0;
  private _successCount = 0;
  private _failureCount = 0;
  private _totalLatency = 0;
  private _totalTokens = 0;
  private _totalCost = 0;
  private _healthCheckInterval?: NodeJS.Timeout;

  constructor(provider: AIProvider, config: ProviderConfig) {
    super();
    this.provider = provider;
    this.config = config;
    this._health = this.initializeHealth();
  }

  // =============================================================================
  // ABSTRACT METHODS (must be implemented by subclasses)
  // =============================================================================

  protected abstract _generateCompletion(request: AIRequest): Promise<AIResponse>;
  protected abstract _generateStream(request: AIRequest): AsyncGenerator<Partial<AIResponse>, AIResponse>;
  protected abstract _healthCheck(): Promise<boolean>;
  protected abstract _authenticate(): Promise<boolean>;
  protected abstract _getModelList(): Promise<string[]>;

  // =============================================================================
  // INITIALIZATION & CLEANUP
  // =============================================================================

  async initialize(): Promise<void> {
    try {
      // Authenticate with the provider
      const authenticated = await this._authenticate();
      if (!authenticated) {
        throw new AIError(
          AIErrorType.AUTHENTICATION_FAILED,
          this.provider,
          'Failed to authenticate with provider'
        );
      }

      // Update available models
      try {
        this.config.availableModels = await this._getModelList();
      } catch (error) {
        console.warn(`Failed to fetch model list for ${this.provider}:`, error);
      }

      // Start health check monitoring if enabled
      if ((this.config.healthCheck as any)?.enabled) {
        this.startHealthMonitoring();
      }

      this._isInitialized = true;
      this.emit('initialized', { provider: this.provider });
      
      console.log(`AI Provider ${this.provider} initialized successfully`);
    } catch (error) {
      this._health.status = ProviderStatus.UNHEALTHY;
      this._health.error = error instanceof Error ? error.message : String(error);
      this.emit('error', error);
      throw error;
    }
  }

  async dispose(): Promise<void> {
    if (this._healthCheckInterval) {
      clearInterval(this._healthCheckInterval);
      this._healthCheckInterval = undefined;
    }

    this._isInitialized = false;
    this.emit('disposed', { provider: this.provider });
    
    console.log(`AI Provider ${this.provider} disposed`);
  }

  // =============================================================================
  // REQUEST HANDLING
  // =============================================================================

  async generateCompletion(request: AIRequest): Promise<AIResponse> {
    this.validateInitialized();
    this.validateRequest(request);

    const startTime = Date.now();
    this._activeConnections++;
    this._requestCount++;

    try {
      // Apply rate limiting
      await this.applyRateLimit();

      // Execute with retry logic and timeout
      const response = await pRetry(
        async () => {
          return await pTimeout(
            this._generateCompletion(request),
            { 
              milliseconds: this.config.timeout as number,
              message: `Request timeout after ${this.config.timeout}ms`
            }
          );
        },
        {
          retries: (request.options?.retries ?? this.config.retries) as number,
          onFailedAttempt: (error) => {
            console.warn(`Attempt ${error.attemptNumber} failed for provider ${this.provider}:`, error.message);
          }
        }
      );

      // Update metrics
      const latency = Date.now() - startTime;
      this.updateSuccessMetrics(latency, response);
      
      // Emit success event
      this.emit('completion', { 
        provider: this.provider, 
        request, 
        response, 
        latency 
      });

      return response;

    } catch (error) {
      // Update failure metrics
      this.updateFailureMetrics(error);
      
      // Convert to AIError if needed
      const aiError = error instanceof AIError 
        ? error 
        : new AIError(
            this.mapErrorType(error),
            this.provider,
            error instanceof Error ? error.message : String(error)
          );

      // Emit error event
      this.emit('error', { 
        provider: this.provider, 
        request, 
        error: aiError,
        latency: Date.now() - startTime
      });

      throw aiError;

    } finally {
      this._activeConnections--;
    }
  }

  async* generateStream(request: AIRequest): AsyncGenerator<Partial<AIResponse>, AIResponse> {
    this.validateInitialized();
    this.validateRequest(request);

    const startTime = Date.now();
    this._activeConnections++;

    try {
      await this.applyRateLimit();
      
      const streamGenerator = this._generateStream(request);
      let finalResponse: AIResponse | null = null;

      for await (const chunk of streamGenerator) {
        if (chunk) {
          yield chunk;
          if (chunk.content !== undefined && chunk.usage !== undefined) {
            finalResponse = chunk as AIResponse;
          }
        }
      }

      if (!finalResponse) {
        throw new AIError(
          AIErrorType.UNKNOWN,
          this.provider,
          'Stream completed without final response'
        );
      }

      // Update success metrics
      const latency = Date.now() - startTime;
      this.updateSuccessMetrics(latency, finalResponse);

      this.emit('streamComplete', { 
        provider: this.provider, 
        request, 
        response: finalResponse, 
        latency 
      });

      return finalResponse;

    } catch (error) {
      this.updateFailureMetrics(error);
      
      const aiError = error instanceof AIError 
        ? error 
        : new AIError(
            this.mapErrorType(error),
            this.provider,
            error instanceof Error ? error.message : String(error)
          );

      this.emit('streamError', { 
        provider: this.provider, 
        request, 
        error: aiError,
        latency: Date.now() - startTime
      });

      throw aiError;

    } finally {
      this._activeConnections--;
    }
  }

  // =============================================================================
  // HEALTH & MONITORING
  // =============================================================================

  async healthCheck(): Promise<ProviderHealth> {
    const startTime = Date.now();
    
    try {
      const isHealthy = await this._healthCheck();
      const latency = Date.now() - startTime;

      this._health.status = isHealthy ? ProviderStatus.HEALTHY : ProviderStatus.DEGRADED;
      this._health.lastCheck = new Date();
      this._health.latency = latency;
      this._health.errorRate = this.calculateErrorRate();
      this._health.availability = this.calculateAvailability();
      this._health.error = undefined;

      return { ...this._health };

    } catch (error) {
      this._health.status = ProviderStatus.UNHEALTHY;
      this._health.lastCheck = new Date();
      this._health.error = error instanceof Error ? error.message : String(error);
      this._health.latency = Date.now() - startTime;

      return { ...this._health };
    }
  }

  async getUsage(): Promise<ProviderHealth['metrics']> {
    return {
      totalRequests: this._requestCount,
      successfulRequests: this._successCount,
      failedRequests: this._failureCount,
      averageLatency: this._requestCount > 0 ? this._totalLatency / this._requestCount : 0,
      tokensProcessed: this._totalTokens,
      totalCost: this._totalCost
    };
  }

  // =============================================================================
  // CAPABILITIES
  // =============================================================================

  supportsTask(taskType: TaskType): boolean {
    return (this.config.capabilities as TaskType[]).includes(taskType);
  }

  getAvailableModels(): string[] {
    return [...(this.config.availableModels as string[])];
  }

  estimateCost(request: AIRequest): number {
    const model = request.options?.model || this.config.defaultModel;
    const costs = (this.config.costs as any)[model as string];
    
    if (!costs) {
      return 0;
    }

    // Rough estimation based on prompt length
    // In practice, this would use a tokenizer for accurate counts
    const estimatedPromptTokens = Math.ceil(request.prompt.length / 4);
    const estimatedCompletionTokens = request.options?.maxTokens || 1000;

    return (estimatedPromptTokens * costs.inputTokens) + 
           (estimatedCompletionTokens * costs.outputTokens);
  }

  // =============================================================================
  // PRIVATE METHODS
  // =============================================================================

  private initializeHealth(): ProviderHealth {
    return {
      provider: this.provider,
      status: ProviderStatus.HEALTHY,
      lastCheck: new Date(),
      latency: 0,
      errorRate: 0,
      availability: 100,
      metrics: {
        totalRequests: 0,
        successfulRequests: 0,
        failedRequests: 0,
        averageLatency: 0,
        tokensProcessed: 0,
        totalCost: 0
      }
    };
  }

  private validateInitialized(): void {
    if (!this._isInitialized) {
      throw new AIError(
        AIErrorType.PROVIDER_UNAVAILABLE,
        this.provider,
        'Provider not initialized'
      );
    }
  }

  private validateRequest(request: AIRequest): void {
    if (!request.prompt || request.prompt.trim().length === 0) {
      throw new AIError(
        AIErrorType.INVALID_REQUEST,
        this.provider,
        'Request prompt is empty'
      );
    }

    if (!this.supportsTask(request.taskType)) {
      throw new AIError(
        AIErrorType.INVALID_REQUEST,
        this.provider,
        `Provider does not support task type: ${request.taskType}`
      );
    }
  }

  private async applyRateLimit(): Promise<void> {
    // Simple rate limiting - in production, use a proper rate limiter
    if (this._activeConnections >= (this.config.rateLimit as any).concurrent) {
      throw new AIError(
        AIErrorType.RATE_LIMIT_EXCEEDED,
        this.provider,
        'Concurrent request limit exceeded'
      );
    }
  }

  private updateSuccessMetrics(latency: number, response: AIResponse): void {
    this._successCount++;
    this._totalLatency += latency;
    this._totalTokens += response.usage.totalTokens as number;
    this._totalCost += (response.usage.cost as number) || 0;
  }

  private updateFailureMetrics(error: any): void {
    this._failureCount++;
  }

  private calculateErrorRate(): number {
    if (this._requestCount === 0) return 0;
    return (this._failureCount / this._requestCount) * 100;
  }

  private calculateAvailability(): number {
    if (this._requestCount === 0) return 100;
    return (this._successCount / this._requestCount) * 100;
  }

  private mapErrorType(error: any): AIErrorType {
    const errorMessage = error?.message?.toLowerCase() || '';
    
    if (errorMessage.includes('timeout')) return AIErrorType.TIMEOUT;
    if (errorMessage.includes('rate limit') || errorMessage.includes('quota')) return AIErrorType.RATE_LIMIT_EXCEEDED;
    if (errorMessage.includes('auth') || errorMessage.includes('unauthorized')) return AIErrorType.AUTHENTICATION_FAILED;
    if (errorMessage.includes('model') || errorMessage.includes('not found')) return AIErrorType.MODEL_NOT_FOUND;
    if (errorMessage.includes('content') || errorMessage.includes('filter')) return AIErrorType.CONTENT_FILTERED;
    
    return AIErrorType.UNKNOWN;
  }

  private startHealthMonitoring(): void {
    if (!(this.config.healthCheck as any)?.enabled) return;

    this._healthCheckInterval = setInterval(async () => {
      try {
        await this.healthCheck();
      } catch (error) {
        console.error(`Health check failed for provider ${this.provider}:`, error);
      }
    }, (this.config.healthCheck as any).interval);
  }
}