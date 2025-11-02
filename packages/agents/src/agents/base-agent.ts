import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';
import pRetry from 'p-retry';
import pTimeout from 'p-timeout';
import PQueue from 'p-queue';
import winston from 'winston';
import { AivoBrain } from '@aivo/aivo-brain';
import {
  AgentType,
  AgentStatus,
  AgentConfig,
  AgentContext,
  AgentInterface,
  StreamingCapable
} from '../types';

/**
 * Abstract base class for all AIVO AI agents
 * Provides common functionality including:
 * - AIVO Brain integration
 * - Error handling and retry logic
 * - Logging and monitoring
 * - Task queuing and concurrency management
 * - Health checks and metrics
 */
export abstract class BaseAgent extends EventEmitter implements AgentInterface, StreamingCapable {
  protected readonly aivoBrain: AivoBrain;
  protected readonly logger: winston.Logger;
  protected readonly taskQueue: PQueue;
  
  private _status: AgentStatus = AgentStatus.IDLE;
  private _isInitialized = false;
  private _startTime = new Date();
  private _tasksCompleted = 0;
  private _tasksInProgress = 0;
  private _lastError: string | null = null;
  private _totalTasks = 0;
  private _successfulTasks = 0;
  private _processingTimes: number[] = [];
  private _streamingEnabled = false;

  constructor(
    public readonly agentType: AgentType,
    public readonly config: AgentConfig,
    public readonly context: AgentContext,
    aivoBrain: AivoBrain
  ) {
    super();
    this.aivoBrain = aivoBrain;
    this.taskQueue = new PQueue({ 
      concurrency: config.maxConcurrentTasks || 5 
    });
    
    // Initialize logger
    this.logger = winston.createLogger({
      level: config.logLevel || 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json(),
        winston.format.prettyPrint()
      ),
      defaultMeta: {
        agentType: this.agentType,
        studentId: this.context.student.id,
        sessionId: this.config.sessionId
      },
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
          )
        })
      ]
    });

    this.setupEventHandlers();
  }

  // =============================================================================
  // ABSTRACT METHODS (to be implemented by subclasses)
  // =============================================================================

  /**
   * Agent-specific initialization logic
   */
  protected abstract initializeAgent(): Promise<void>;

  /**
   * Agent-specific cleanup logic
   */
  protected abstract disposeAgent(): Promise<void>;

  /**
   * Validate agent configuration
   */
  protected abstract validateConfig(): boolean;

  // =============================================================================
  // CORE INTERFACE IMPLEMENTATION
  // =============================================================================

  async initialize(): Promise<void> {
    try {
      this.log('info', 'Initializing agent');
      
      if (!this.validateConfig()) {
        throw new Error('Invalid agent configuration');
      }

      await this.initializeAgent();
      this._isInitialized = true;
      this._status = AgentStatus.IDLE;
      
      this.log('info', 'Agent initialized successfully');
      this.emit('initialized', { agentType: this.agentType });
    } catch (error) {
      this._status = AgentStatus.ERROR;
      this._lastError = error instanceof Error ? error.message : String(error);
      this.log('error', 'Failed to initialize agent', { error: this._lastError });
      throw error;
    }
  }

  async dispose(): Promise<void> {
    try {
      this.log('info', 'Disposing agent');
      this._status = AgentStatus.IDLE;
      
      // Wait for all tasks to complete
      await this.taskQueue.onIdle();
      
      // Agent-specific cleanup
      await this.disposeAgent();
      
      this._isInitialized = false;
      this.log('info', 'Agent disposed successfully');
      this.emit('disposed', { agentType: this.agentType });
    } catch (error) {
      this._lastError = error instanceof Error ? error.message : String(error);
      this.log('error', 'Failed to dispose agent', { error: this._lastError });
      throw error;
    }
  }

  getStatus(): AgentStatus {
    return this._status;
  }

  async getHealth(): Promise<{
    status: AgentStatus;
    uptime: number;
    tasksCompleted: number;
    tasksInProgress: number;
    lastError: string | null;
  }> {
    return {
      status: this._status,
      uptime: Date.now() - this._startTime.getTime(),
      tasksCompleted: this._tasksCompleted,
      tasksInProgress: this._tasksInProgress,
      lastError: this._lastError
    };
  }

  log(level: 'debug' | 'info' | 'warn' | 'error', message: string, metadata?: any): void {
    this.logger.log(level, message, metadata);
  }

  async getMetrics(): Promise<{
    totalTasks: number;
    successRate: number;
    averageProcessingTime: number;
    errorCount: number;
  }> {
    const errorCount = this._totalTasks - this._successfulTasks;
    const avgProcessingTime = this._processingTimes.length > 0 
      ? this._processingTimes.reduce((a, b) => a + b, 0) / this._processingTimes.length 
      : 0;
    
    return {
      totalTasks: this._totalTasks,
      successRate: this._totalTasks > 0 ? this._successfulTasks / this._totalTasks : 0,
      averageProcessingTime: avgProcessingTime,
      errorCount
    };
  }

  // =============================================================================
  // STREAMING CAPABILITIES
  // =============================================================================

  supportsStreaming(): boolean {
    return true; // Base implementation supports streaming
  }

  enableStreaming(enabled: boolean): void {
    this._streamingEnabled = enabled;
    this.log('info', `Streaming ${enabled ? 'enabled' : 'disabled'}`);
  }

  protected get streamingEnabled(): boolean {
    return this._streamingEnabled && this.config.enableStreaming;
  }

  // =============================================================================
  // TASK EXECUTION UTILITIES
  // =============================================================================

  /**
   * Execute a task with retry logic, timeout, and error handling
   */
  protected async executeTask<T>(
    taskName: string,
    taskFunction: () => Promise<T>,
    options: {
      retries?: number;
      timeout?: number;
      priority?: number;
    } = {}
  ): Promise<T> {
    const startTime = Date.now();
    const retries = options.retries ?? this.config.retryAttempts;
    const timeout = options.timeout ?? this.config.timeout;

    this._totalTasks++;
    this._tasksInProgress++;
    this._status = AgentStatus.PROCESSING;

    try {
      this.log('debug', `Starting task: ${taskName}`, { retries, timeout });
      
      const result = await this.taskQueue.add(async () => {
        return await pRetry(async () => {
          return await pTimeout(taskFunction(), { milliseconds: timeout });
        }, {
          retries,
          onFailedAttempt: (error) => {
            this.log('warn', `Task ${taskName} attempt failed`, { 
              attempt: error.attemptNumber,
              retriesLeft: error.retriesLeft,
              error: error.message
            });
          }
        });
      }, { priority: options.priority });

      const processingTime = Date.now() - startTime;
      this._processingTimes.push(processingTime);
      
      // Keep only last 100 processing times for memory efficiency
      if (this._processingTimes.length > 100) {
        this._processingTimes = this._processingTimes.slice(-100);
      }

      this._tasksCompleted++;
      this._successfulTasks++;
      this._tasksInProgress--;

      if (this._tasksInProgress === 0) {
        this._status = AgentStatus.IDLE;
      }

      this.log('debug', `Task completed: ${taskName}`, { 
        processingTime,
        success: true 
      });

      this.emit('taskCompleted', {
        taskName,
        processingTime,
        success: true
      });

      return result as T;
    } catch (error) {
      const processingTime = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      this._lastError = errorMessage;
      this._tasksInProgress--;
      this._status = this._tasksInProgress > 0 ? AgentStatus.PROCESSING : AgentStatus.ERROR;

      this.log('error', `Task failed: ${taskName}`, { 
        processingTime,
        error: errorMessage,
        retries
      });

      this.emit('taskFailed', {
        taskName,
        processingTime,
        error: errorMessage,
        success: false
      });

      throw error;
    }
  }

  /**
   * Execute a streaming task with proper error handling
   */
  protected async* executeStreamingTask<T>(
    taskName: string,
    generator: () => AsyncGenerator<T>
  ): AsyncGenerator<T> {
    const startTime = Date.now();
    
    this._totalTasks++;
    this._tasksInProgress++;
    this._status = AgentStatus.PROCESSING;

    try {
      this.log('debug', `Starting streaming task: ${taskName}`);
      
      const gen = generator();
      for await (const chunk of gen) {
        yield chunk;
      }

      const processingTime = Date.now() - startTime;
      this._processingTimes.push(processingTime);
      
      this._tasksCompleted++;
      this._successfulTasks++;
      this._tasksInProgress--;

      if (this._tasksInProgress === 0) {
        this._status = AgentStatus.IDLE;
      }

      this.log('debug', `Streaming task completed: ${taskName}`, { processingTime });
      this.emit('taskCompleted', { taskName, processingTime, success: true, streaming: true });

    } catch (error) {
      const processingTime = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      this._lastError = errorMessage;
      this._tasksInProgress--;
      this._status = this._tasksInProgress > 0 ? AgentStatus.PROCESSING : AgentStatus.ERROR;

      this.log('error', `Streaming task failed: ${taskName}`, { 
        processingTime,
        error: errorMessage
      });

      this.emit('taskFailed', {
        taskName,
        processingTime,
        error: errorMessage,
        success: false,
        streaming: true
      });

      throw error;
    }
  }

  // =============================================================================
  // AIVO BRAIN INTEGRATION UTILITIES
  // =============================================================================

  /**
   * Generate AI completion using AIVO Brain
   */
  protected async generateCompletion(
    prompt: string,
    options: {
      taskType?: string;
      maxTokens?: number;
      temperature?: number;
      stream?: boolean;
    } = {}
  ): Promise<any> {
    return await this.executeTask('ai_completion', async () => {
      // This would integrate with the actual AIVO Brain API
      // For now, we'll create a mock structure
      const request = {
        id: uuidv4(),
        taskType: options.taskType || 'text_generation',
        prompt,
        context: {
          studentId: this.context.student.id,
          agentType: this.agentType
        },
        options: {
          maxTokens: options.maxTokens || 1000,
          temperature: options.temperature || 0.7,
          stream: options.stream || false,
          retries: 3
        }
      };

      // TODO: Replace with actual AIVO Brain integration
      return {
        content: `AI response for: ${prompt}`,
        usage: { totalTokens: 100 },
        metadata: { processingTime: 1000 }
      };
    });
  }

  /**
   * Generate streaming AI completion using AIVO Brain
   */
  protected async* generateStreamingCompletion(
    prompt: string,
    options: {
      taskType?: string;
      maxTokens?: number;
      temperature?: number;
    } = {}
  ): AsyncGenerator<string> {
    if (!this.streamingEnabled) {
      const result = await this.generateCompletion(prompt, { ...options, stream: false });
      yield result.content;
      return;
    }

    yield* this.executeStreamingTask('ai_streaming_completion', async function* () {
      // TODO: Replace with actual AIVO Brain streaming integration
      const chunks = [`Streaming response for: ${prompt}`.split(' ')];
      for (const chunk of chunks[0]) {
        yield chunk + ' ';
        // Simulate streaming delay
        await new Promise(resolve => setTimeout(resolve, 50));
      }
    });
  }

  // =============================================================================
  // UTILITY METHODS
  // =============================================================================

  /**
   * Validate required context data
   */
  protected validateContext(requiredFields: string[]): boolean {
    for (const field of requiredFields) {
      if (!this.hasNestedProperty(this.context, field)) {
        this.log('error', `Missing required context field: ${field}`);
        return false;
      }
    }
    return true;
  }

  /**
   * Check if object has nested property (supports dot notation)
   */
  private hasNestedProperty(obj: any, path: string): boolean {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined;
    }, obj) !== undefined;
  }

  /**
   * Generate unique session ID
   */
  protected generateSessionId(): string {
    return `${this.agentType}_${this.context.student.id}_${Date.now()}_${uuidv4().slice(0, 8)}`;
  }

  /**
   * Setup event handlers for monitoring
   */
  private setupEventHandlers(): void {
    this.on('error', (error) => {
      this.log('error', 'Agent error occurred', { error });
    });

    this.taskQueue.on('add', () => {
      this.log('debug', 'Task added to queue', { 
        size: this.taskQueue.size,
        pending: this.taskQueue.pending 
      });
    });

    this.taskQueue.on('next', () => {
      this.log('debug', 'Processing next task', { 
        size: this.taskQueue.size,
        pending: this.taskQueue.pending 
      });
    });
  }

  // =============================================================================
  // CLEANUP
  // =============================================================================

  /**
   * Check if agent is properly initialized
   */
  protected get isInitialized(): boolean {
    return this._isInitialized;
  }

  /**
   * Assert that agent is initialized before operations
   */
  protected assertInitialized(): void {
    if (!this._isInitialized) {
      throw new Error(`Agent ${this.agentType} is not initialized`);
    }
  }
}