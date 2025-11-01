import Anthropic from '@anthropic-ai/sdk';
import { BaseAIProvider } from './base-provider';
import {
  AIProvider,
  AIRequest,
  AIResponse,
  ProviderConfig,
  TaskType
} from '../types';

/**
 * Anthropic (Claude) provider implementation
 * Supports Claude 3.5 Sonnet, Claude 3 Haiku, and other Anthropic models
 */
export class AnthropicProvider extends BaseAIProvider {
  private client: Anthropic;

  constructor(config: ProviderConfig) {
    super(AIProvider.ANTHROPIC, config);
    
    this.client = new Anthropic({
      apiKey: config.apiKey as string,
      baseURL: config.baseUrl as string | undefined,
      timeout: config.timeout as number | undefined,
      maxRetries: 0 // We handle retries in the base class
    });
  }

  protected async _authenticate(): Promise<boolean> {
    try {
      // Test authentication by making a simple API call
      // Anthropic doesn't have a models endpoint, so we'll test with a minimal message
      await this.client.messages.create({
        model: this.config.defaultModel as string,
        max_tokens: 1,
        messages: [{ role: 'user', content: 'test' }]
      });
      return true;
    } catch (error: any) {
      if (error.status === 401) {
        return false;
      }
      // Other errors might be rate limits or server issues, still consider auth valid
      return true;
    }
  }

  protected async _getModelList(): Promise<string[]> {
    // Anthropic doesn't provide a models endpoint, return configured models
    return this.config.availableModels as string[];
  }

  protected async _healthCheck(): Promise<boolean> {
    try {
      await this.client.messages.create({
        model: this.config.defaultModel as string,
        max_tokens: 1,
        messages: [{ role: 'user', content: 'ping' }]
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  protected async _generateCompletion(request: AIRequest): Promise<AIResponse> {
    const model = request.options?.model || this.config.defaultModel;
    const startTime = Date.now();

    try {
      const response = await this.client.messages.create({
        model: model as string,
        max_tokens: request.options?.maxTokens || 4000,
        temperature: request.options?.temperature || 0.7,
        top_p: request.options?.topP || 1.0,
        stop_sequences: request.options?.stopSequences as string[] | undefined,
        system: this.buildSystemPrompt(request),
        messages: [
          {
            role: 'user',
            content: request.prompt
          }
        ]
      });

      const textContent = response.content.find(block => block.type === 'text');
      if (!textContent || textContent.type !== 'text') {
        throw new Error('No text content in Anthropic response');
      }

      const aiResponse: AIResponse = {
        id: crypto.randomUUID(),
        requestId: request.id,
        provider: AIProvider.ANTHROPIC,
        model: response.model,
        content: textContent.text,
        usage: {
          promptTokens: response.usage.input_tokens,
          completionTokens: response.usage.output_tokens,
          totalTokens: response.usage.input_tokens + response.usage.output_tokens,
          cost: this.calculateCost(response.usage, model as string)
        },
        metadata: {
          latency: Date.now() - startTime,
          timestamp: new Date(),
          cached: false,
          finishReason: response.stop_reason || undefined
        }
      };

      return aiResponse;

    } catch (error: any) {
      if (error.status === 429) {
        throw new Error('Rate limit exceeded');
      }
      if (error.status === 401) {
        throw new Error('Authentication failed');
      }
      if (error.status === 400 && error.message?.includes('model')) {
        throw new Error('Model not found');
      }
      throw error;
    }
  }

  protected async* _generateStream(request: AIRequest): AsyncGenerator<Partial<AIResponse>, AIResponse> {
    const model = request.options?.model || this.config.defaultModel;
    const startTime = Date.now();

    try {
      const stream = await this.client.messages.create({
        model: model as string,
        max_tokens: request.options?.maxTokens || 4000,
        temperature: request.options?.temperature || 0.7,
        top_p: request.options?.topP || 1.0,
        stop_sequences: request.options?.stopSequences as string[] | undefined,
        system: this.buildSystemPrompt(request),
        messages: [
          {
            role: 'user',
            content: request.prompt
          }
        ],
        stream: true
      });

      let fullContent = '';
      let usage: any = null;

      for await (const chunk of stream) {
        if (chunk.type === 'content_block_delta') {
          const delta = chunk.delta;
          if (delta.type === 'text_delta' && delta.text) {
            fullContent += delta.text;
            
            yield {
              id: crypto.randomUUID(),
              requestId: request.id,
              provider: AIProvider.ANTHROPIC,
              model: model as string,
              content: delta.text,
              usage: {
                promptTokens: 0,
                completionTokens: 0,
                totalTokens: 0
              },
              metadata: {
                latency: Date.now() - startTime,
                timestamp: new Date(),
                cached: false
              }
            };
          }
        } else if (chunk.type === 'message_delta' && chunk.usage) {
          usage = chunk.usage;
        }
      }

      // Return final response
      const finalResponse: AIResponse = {
        id: crypto.randomUUID(),
        requestId: request.id,
        provider: AIProvider.ANTHROPIC,
        model: model as string,
        content: fullContent,
        usage: {
          promptTokens: usage?.input_tokens || 0,
          completionTokens: usage?.output_tokens || 0,
          totalTokens: (usage?.input_tokens || 0) + (usage?.output_tokens || 0),
          cost: this.calculateCost(usage, model as string)
        },
        metadata: {
          latency: Date.now() - startTime,
          timestamp: new Date(),
          cached: false,
          finishReason: 'stop'
        }
      };

      return finalResponse;

    } catch (error: any) {
      if (error.status === 429) {
        throw new Error('Rate limit exceeded');
      }
      if (error.status === 401) {
        throw new Error('Authentication failed');
      }
      throw error;
    }
  }

  private buildSystemPrompt(request: AIRequest): string {
    const context = request.context || {};
    const metadata = request.metadata as any || {};

    let systemPrompt = 'You are Claude, an AI assistant created by Anthropic to be helpful, harmless, and honest. You specialize in educational content and helping students learn.';

    if (metadata.gradeLevel) {
      systemPrompt += ` You are currently helping a student at ${metadata.gradeLevel} level.`;
    }

    if (metadata.subject) {
      systemPrompt += ` The current subject is ${metadata.subject}.`;
    }

    if (metadata.language && metadata.language !== 'en') {
      systemPrompt += ` Please respond in ${metadata.language}.`;
    }

    // Add task-specific instructions
    switch (request.taskType) {
      case TaskType.QUESTION_GENERATION:
        systemPrompt += ' Generate thoughtful educational questions that promote critical thinking and are appropriate for the student\'s level.';
        break;
      case TaskType.CONTENT_SIMPLIFICATION:
        systemPrompt += ' Simplify complex concepts while maintaining accuracy. Use clear examples and analogies when helpful.';
        break;
      case TaskType.EXPLANATION:
        systemPrompt += ' Provide clear, step-by-step explanations. Break down complex ideas into manageable parts.';
        break;
      case TaskType.ASSESSMENT_GRADING:
        systemPrompt += ' Evaluate responses fairly and provide constructive, encouraging feedback that helps the student improve.';
        break;
      case TaskType.PERSONALIZED_TUTORING:
        systemPrompt += ' Act as a patient tutor, adapting your teaching style to the student\'s needs and learning pace.';
        break;
      default:
        break;
    }

    return systemPrompt;
  }

  private calculateCost(usage: any, model: string): number {
    if (!usage || !(this.config.costs as any)[model]) {
      return 0;
    }

    const costs = (this.config.costs as any)[model];
    return (usage.input_tokens * costs.inputTokens) + 
           (usage.output_tokens * costs.outputTokens);
  }
}

// Default Anthropic configuration
export const DEFAULT_ANTHROPIC_CONFIG: Partial<ProviderConfig> = {
  provider: AIProvider.ANTHROPIC,
  defaultModel: 'claude-3-5-sonnet-20241022',
  availableModels: [
    'claude-3-5-sonnet-20241022',
    'claude-3-5-haiku-20241022',
    'claude-3-opus-20240229',
    'claude-3-sonnet-20240229',
    'claude-3-haiku-20240307'
  ],
  rateLimit: {
    requestsPerMinute: 1000,
    tokensPerMinute: 400000,
    concurrent: 5
  },
  costs: {
    'claude-3-5-sonnet-20241022': {
      inputTokens: 0.003,
      outputTokens: 0.015
    },
    'claude-3-5-haiku-20241022': {
      inputTokens: 0.001,
      outputTokens: 0.005
    },
    'claude-3-opus-20240229': {
      inputTokens: 0.015,
      outputTokens: 0.075
    },
    'claude-3-sonnet-20240229': {
      inputTokens: 0.003,
      outputTokens: 0.015
    },
    'claude-3-haiku-20240307': {
      inputTokens: 0.00025,
      outputTokens: 0.00125
    }
  },
  capabilities: [
    TaskType.QUESTION_GENERATION,
    TaskType.CONTENT_SIMPLIFICATION,
    TaskType.CURRICULUM_RETRIEVAL,
    TaskType.ASSESSMENT_GRADING,
    TaskType.PERSONALIZED_TUTORING,
    TaskType.TRANSLATION,
    TaskType.SUMMARIZATION,
    TaskType.EXPLANATION,
    TaskType.MATH_SOLVING,
    TaskType.CODE_REVIEW
  ],
  priority: 85,
  timeout: 30000,
  retries: 3
};