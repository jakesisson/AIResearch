import { AzureChatOpenAI } from '@langchain/openai';

export interface ModelConfig {
  modelName?: string;
  temperature?: number;
  maxTokens?: number;
  openAIApiKey?: string; // Kept for backward compatibility
}

export class ModelFactory {
  /**
   * Creates an Azure OpenAI chat model (use AzureChatOpenAI so requests go to Azure endpoint)
   */
  static createModel(config: ModelConfig = {}): AzureChatOpenAI {
    const apiKey = config.openAIApiKey || process.env.AZURE_OPENAI_API_KEY || process.env.OPENAI_API_KEY;
    const endpoint = process.env.AZURE_OPENAI_ENDPOINT || '';
    const apiVersion = process.env.AZURE_OPENAI_API_VERSION || '2025-01-01-preview';
    const deployment = process.env.AZURE_OPENAI_API_DEPLOYMENT || process.env.MODEL_ID || 'gpt-4.1';
    const instanceName = process.env.AZURE_OPENAI_API_INSTANCE || endpoint.replace(/^https?:\/\//, '').replace(/\.openai\.azure\.com.*$/, '').replace(/\/$/, '');

    if (!apiKey) {
      throw new Error('AZURE_OPENAI_API_KEY (or OPENAI_API_KEY) is not set in environment variables');
    }
    if (!endpoint) {
      throw new Error('AZURE_OPENAI_ENDPOINT is not set in environment variables');
    }

    return new AzureChatOpenAI({
      azureOpenAIApiKey: apiKey,
      azureOpenAIApiInstanceName: instanceName,
      azureOpenAIApiDeploymentName: deployment,
      azureOpenAIApiVersion: apiVersion,
      temperature: config.temperature ?? 0.2,
      maxTokens: config.maxTokens ?? 4096,
    });
  }

  static createResumeModel(): AzureChatOpenAI {
    return this.createModel({ temperature: 0.2, maxTokens: 4096 });
  }

  static createCoverLetterModel(): AzureChatOpenAI {
    return this.createModel({ temperature: 0.2, maxTokens: 4096 });
  }
} 