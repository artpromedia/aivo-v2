import OpenAI from 'openai';
import { BaseAIProvider } from './base-provider';
import type {
  AIRequest,
  AIResponse,
  ProviderConfig} from '../types';
import {
  AIProvider,
  TaskType
} from '../types';

/**
 * OpenAI provider implementation
 * Supports GPT-4, GPT-3.5, and other OpenAI models
 */
export class OpenAIProvider extends BaseAIProvider {
  private client: OpenAI;

  constructor(config: ProviderConfig) {
    super(AIProvider.OPENAI, config);
    
    this.client = new OpenAI({
      apiKey: config.apiKey as string,
      baseURL: config.baseUrl as string | undefined,
      timeout: config.timeout as number | undefined,
      maxRetries: 0 // We handle retries in the base class
    });
  }

  protected async _authenticate(): Promise<boolean> {
    try {
      // Test authentication by making a simple API call
      await this.client.models.list();
      return true;
    } catch (error) {
      console.error('OpenAI authentication failed:', error);
      return false;
    }
  }

  protected async _getModelList(): Promise<string[]> {
    try {
      const response = await this.client.models.list();
      return response.data
        .map(model => model.id)
        .filter(id => id.startsWith('gpt-') || id.startsWith('text-'));
    } catch (error) {
      console.warn('Failed to fetch OpenAI model list:', error);
      return this.config.availableModels as string[];
    }
  }

  protected async _healthCheck(): Promise<boolean> {
    try {
      await this.client.models.list();
      return true;
    } catch (error) {
      return false;
    }
  }

  protected async _generateCompletion(request: AIRequest): Promise<AIResponse> {
    const model = request.options?.model || this.config.defaultModel;
    const startTime = Date.now();

    try {
      const completion = await this.client.chat.completions.create({
        model: model as string,
        messages: [
          {
            role: 'system',
            content: this.buildSystemPrompt(request)
          },
          {
            role: 'user',
            content: request.prompt
          }
        ],
        max_tokens: request.options?.maxTokens || 4096,
        temperature: request.options?.temperature || 0.7,
        top_p: request.options?.topP || 1.0,
        stop: request.options?.stopSequences as string[] | undefined,
        stream: false
      });

      const choice = completion.choices[0];
      if (!choice?.message?.content) {
        throw new Error('No content in OpenAI response');
      }

      const response: AIResponse = {
        id: crypto.randomUUID(),
        requestId: request.id,
        provider: AIProvider.OPENAI,
        model: completion.model,
        content: choice.message.content,
        usage: {
          promptTokens: completion.usage?.prompt_tokens || 0,
          completionTokens: completion.usage?.completion_tokens || 0,
          totalTokens: completion.usage?.total_tokens || 0,
          cost: this.calculateCost(completion.usage, model as string)
        },
        metadata: {
          latency: Date.now() - startTime,
          timestamp: new Date(),
          cached: false,
          finishReason: choice.finish_reason || undefined
        }
      };

      return response;

    } catch (error: any) {
      if (error.status === 429) {
        throw new Error('Rate limit exceeded');
      }
      if (error.status === 401) {
        throw new Error('Authentication failed');
      }
      if (error.status === 404) {
        throw new Error('Model not found');
      }
      throw error;
    }
  }

  protected async* _generateStream(request: AIRequest): AsyncGenerator<Partial<AIResponse>, AIResponse> {
    const model = request.options?.model || this.config.defaultModel;
    const startTime = Date.now();

    try {
      const stream = await this.client.chat.completions.create({
        model: model as string,
        messages: [
          {
            role: 'system',
            content: this.buildSystemPrompt(request)
          },
          {
            role: 'user',
            content: request.prompt
          }
        ],
        max_tokens: request.options?.maxTokens || 4096,
        temperature: request.options?.temperature || 0.7,
        top_p: request.options?.topP || 1.0,
        stop: request.options?.stopSequences as string[] | undefined,
        stream: true
      });

      let content = '';
      let usage: any = null;

      for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta;
        
        if (delta?.content) {
          content += delta.content;
          
          yield {
            id: crypto.randomUUID(),
            requestId: request.id,
            provider: AIProvider.OPENAI,
            model: chunk.model,
            content: delta.content,
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

        if (chunk.usage) {
          usage = chunk.usage;
        }
      }

      // Return final response
      const finalResponse: AIResponse = {
        id: crypto.randomUUID(),
        requestId: request.id,
        provider: AIProvider.OPENAI,
        model: model as string,
        content,
        usage: {
          promptTokens: usage?.prompt_tokens || 0,
          completionTokens: usage?.completion_tokens || 0,
          totalTokens: usage?.total_tokens || 0,
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

    let systemPrompt = 'You are an AI assistant specialized in educational content.';

    if (metadata.gradeLevel) {
      systemPrompt += ` You are helping a student at ${metadata.gradeLevel} level.`;
    }

    if (metadata.subject) {
      systemPrompt += ` The subject is ${metadata.subject}.`;
    }

    if (metadata.language && metadata.language !== 'en') {
      systemPrompt += ` Please respond in ${metadata.language}.`;
    }

    // Add task-specific instructions
    switch (request.taskType) {
      case TaskType.QUESTION_GENERATION:
        systemPrompt += ' Generate educational questions that are appropriate for the grade level and subject.';
        break;
      case TaskType.CONTENT_SIMPLIFICATION:
        systemPrompt += ' Simplify the content while maintaining accuracy and key concepts.';
        break;
      case TaskType.EXPLANATION:
        systemPrompt += ' Provide clear, step-by-step explanations that are easy to understand.';
        break;
      case TaskType.ASSESSMENT_GRADING:
        systemPrompt += ' Evaluate the response fairly and provide constructive feedback.';
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
    return (usage.prompt_tokens * costs.inputTokens) + 
           (usage.completion_tokens * costs.outputTokens);
  }
}

// Default OpenAI configuration
export const DEFAULT_OPENAI_CONFIG: Partial<ProviderConfig> = {
  provider: AIProvider.OPENAI,
  defaultModel: 'gpt-4o-mini',
  availableModels: [
    'gpt-4o',
    'gpt-4o-mini',
    'gpt-4-turbo',
    'gpt-4',
    'gpt-3.5-turbo'
  ],
  rateLimit: {
    requestsPerMinute: 500,
    tokensPerMinute: 200000,
    concurrent: 10
  },
  costs: {
    'gpt-4o': {
      inputTokens: 0.0025,
      outputTokens: 0.01
    },
    'gpt-4o-mini': {
      inputTokens: 0.00015,
      outputTokens: 0.0006
    },
    'gpt-4-turbo': {
      inputTokens: 0.01,
      outputTokens: 0.03
    },
    'gpt-4': {
      inputTokens: 0.03,
      outputTokens: 0.06
    },
    'gpt-3.5-turbo': {
      inputTokens: 0.0005,
      outputTokens: 0.0015
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
  priority: 80,
  timeout: 30000,
  retries: 3
};