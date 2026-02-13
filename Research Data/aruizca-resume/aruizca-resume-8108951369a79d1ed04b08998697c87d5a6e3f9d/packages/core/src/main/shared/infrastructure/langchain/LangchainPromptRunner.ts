import { ChatOpenAI } from '@langchain/openai';
import { PromptTemplate } from '@langchain/core/prompts';
import { Runnable } from '@langchain/core/runnables';
import { OpenAICache } from '../cache';
import { performanceMonitor } from '../utils';

export interface PromptRunnerConfig<TInput, TOutput> {
  /**
   * Factory function to create the ChatOpenAI model
   */
  modelFactory: () => ChatOpenAI;
  
  /**
   * Factory function to create the prompt template
   */
  promptFactory: () => Promise<PromptTemplate> | PromptTemplate;
  
  /**
   * Transform input data into variables for the prompt template
   */
  inputTransformer: (input: TInput) => Record<string, any>;
  
  /**
   * Transform the LLM output into the desired output type
   */
  outputTransformer: (result: any) => TOutput;
  
  /**
   * Output parser type for the chain
   */
  outputParser?: 'json' | 'string';
  
  /**
   * Cache configuration
   */
  cacheConfig?: {
    ttl?: number; // Time to live in milliseconds
    cacheDir?: string;
  };
  
  /**
   * Operation name for logging and debugging
   */
  operationName?: string;
}

export interface CacheStats {
  totalEntries: number;
  totalSize: number;
}

/**
 * Generic LLM prompt runner that provides consistent caching, error handling,
 * and performance monitoring across all domain contexts.
 */
export class LangchainPromptRunner<TInput, TOutput> {
  private model: ChatOpenAI;
  private cache: OpenAICache;
  private config: PromptRunnerConfig<TInput, TOutput>;
  private promptTemplate: PromptTemplate | null = null;

  constructor(config: PromptRunnerConfig<TInput, TOutput>) {
    this.config = config;
    this.model = config.modelFactory();
    this.cache = new OpenAICache({
      ttl: config.cacheConfig?.ttl,
      cacheDir: config.cacheConfig?.cacheDir
    });
  }

  /**
   * Execute the prompt runner with the given input
   * @param input The input data for the prompt
   * @param forceRefresh Whether to bypass cache for fresh content
   * @returns The transformed output
   */
  async execute(input: TInput, forceRefresh: boolean = false): Promise<TOutput> {
    const operationName = this.config.operationName || 'LLM Operation';
    
    try {
      // Lazy load prompt template
      if (!this.promptTemplate) {
        this.promptTemplate = await this.config.promptFactory();
      }

      // Transform input to prompt variables
      const promptVariables = this.config.inputTransformer(input);
      const promptTemplateString = typeof this.promptTemplate.template === 'string' 
        ? this.promptTemplate.template 
        : JSON.stringify(this.promptTemplate.template);

      // Check cache first
      const cachedResponse = await this.cache.get(input, promptTemplateString, forceRefresh);
      if (cachedResponse && !forceRefresh) {
        return this.config.outputTransformer(cachedResponse);
      }

      console.log(`🤖 Executing ${operationName}...`);

      // Execute the LLM operation with performance monitoring
      const result = await performanceMonitor.trackOperation(
        operationName,
        async () => {
          // Create and execute chain
          const chain = await this.createChain();
          return await chain.invoke(promptVariables);
        },
        { logToConsole: true }
      );

      // Cache the response
      await this.cache.set(input, promptTemplateString, result);

      // Transform and return output
      return this.config.outputTransformer(result);

    } catch (error) {
      // Enhanced error handling with operation context
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`${operationName} failed: ${errorMessage}`);
    }
  }

  /**
   * Get cache statistics
   */
  async getCacheStats(): Promise<CacheStats> {
    return await this.cache.getStats();
  }

  /**
   * Clear the cache
   */
  async clearCache(): Promise<void> {
    await this.cache.clear();
  }

  /**
   * Create a Langchain chain with the configured prompt and model
   */
  private async createChain(): Promise<Runnable> {
    if (!this.promptTemplate) {
      this.promptTemplate = await this.config.promptFactory();
    }

    const { ChainFactory } = await import('./chainFactory');
    return ChainFactory.createChain({
      model: this.model,
      prompt: this.promptTemplate,
      outputParser: this.config.outputParser || 'json'
    });
  }
}
