import { LangchainPromptRunner, ModelFactory, PromptFactory } from '../../../shared';
import { Resume } from '../../domain';

export class PromptRunner {
  private runner: LangchainPromptRunner<any, Resume>;

  constructor(forceRefresh: boolean = false) {
    this.runner = new LangchainPromptRunner({
      modelFactory: () => ModelFactory.createResumeModel(),
      promptFactory: () => PromptFactory.createResumePrompt(),
      inputTransformer: (parsedData) => ({
        linkedinData: JSON.stringify(parsedData, null, 2)
      }),
      outputTransformer: (result) => result as Resume,
      outputParser: 'json',
      cacheConfig: {
        ttl: 8 * 60 * 60 * 1000 // 8 hours
      },
      operationName: 'Generate JSON Resume (LLM)'
    });
  }

  async run(parsedData: any, forceRefresh: boolean = false): Promise<Resume> {
    return await this.runner.execute(parsedData, forceRefresh);
  }

  /**
   * Get cache statistics
   */
  async getCacheStats(): Promise<{ totalEntries: number; totalSize: number }> {
    return await this.runner.getCacheStats();
  }

  /**
   * Clear the cache
   */
  async clearCache(): Promise<void> {
    await this.runner.clearCache();
  }
} 