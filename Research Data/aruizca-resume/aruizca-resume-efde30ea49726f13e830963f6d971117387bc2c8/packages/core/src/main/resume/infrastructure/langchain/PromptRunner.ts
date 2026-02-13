import { ChatOpenAI } from '@langchain/openai';
import { ChainFactory, ModelFactory, OpenAICache } from '../../../shared';
import { Resume } from '../../domain';

export class PromptRunner {
  private model: ChatOpenAI;
  private cache: OpenAICache;

  constructor(forceRefresh: boolean = false) {
    this.model = ModelFactory.createResumeModel();
    this.cache = new OpenAICache({ forceRefresh });
  }

  async run(parsedData: any, forceRefresh: boolean = false): Promise<Resume> {
    try {
      // Create the chain using shared utilities
      const chain = await ChainFactory.createResumeChain(this.model);
      
      // Check cache first
      const promptTemplateString = JSON.stringify(parsedData, null, 2);
      const cachedResponse = await this.cache.get(parsedData, promptTemplateString, forceRefresh);
      if (cachedResponse) {
        return cachedResponse as Resume;
      }

      // Prepare input variables
      const inputVariables = {
        linkedinData: JSON.stringify(parsedData, null, 2)
      };

      console.log('🤖 Calling OpenAI API with Langchain...');
      
      // Execute the chain
      const result = await chain.invoke(inputVariables);
      
      // Cache the response
      await this.cache.set(parsedData, promptTemplateString, result);
      
      // Return as Resume (LLM is configured to output JSON Resume format)
      return result as Resume;
    } catch (error) {
      // Handle JSON parsing errors more gracefully
      if (error instanceof Error && error.message.includes('JSON')) {
        throw new Error(`Failed to parse LLM response as JSON: ${error.message}`);
      }
      throw new Error(`Failed to generate resume: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get cache statistics
   */
  async getCacheStats(): Promise<{ totalEntries: number; totalSize: number }> {
    return await this.cache.getStats();
  }

  /**
   * Clear the cache
   */
  async clearCache(): Promise<void> {
    await this.cache.clear();
  }
} 