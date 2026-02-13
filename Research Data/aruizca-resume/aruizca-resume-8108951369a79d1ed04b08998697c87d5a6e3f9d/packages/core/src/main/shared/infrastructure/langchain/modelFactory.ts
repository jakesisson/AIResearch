import { ChatOpenAI } from '@langchain/openai';
import type { ChatOpenAIFields } from '@langchain/openai';

export interface ModelConfig {
  modelName?: string;
  temperature?: number;
  maxTokens?: number;
  openAIApiKey?: string; // Kept for backward compatibility, now uses Azure OpenAI
}

export class ModelFactory {
  /**
   * Creates a ChatOpenAI model with consistent configuration (Azure OpenAI)
   */
  static createModel(config: ModelConfig = {}): ChatOpenAI {
    // Azure OpenAI configuration
    const apiKey = config.openAIApiKey || process.env.AZURE_OPENAI_API_KEY || process.env.OPENAI_API_KEY;
    const endpoint = process.env.AZURE_OPENAI_ENDPOINT || '';
    const apiVersion = process.env.AZURE_OPENAI_API_VERSION || '2025-01-01-preview';
    const deployment = process.env.AZURE_OPENAI_API_DEPLOYMENT || process.env.MODEL_ID || 'gpt-4.1';
    const modelName = config.modelName || process.env.MODEL_ID || 'gpt-4.1';
    
    if (!apiKey) {
      throw new Error('AZURE_OPENAI_API_KEY (or OPENAI_API_KEY) is not set in environment variables');
    }
    
    if (!endpoint) {
      throw new Error('AZURE_OPENAI_ENDPOINT is not set in environment variables');
    }

    const instanceName = endpoint.replace('https://', '').replace('.openai.azure.com', '').replace('/', '');
    
    // Use type assertion to work around TypeScript strict checking
    // The properties are valid at runtime, but TypeScript types may not be fully updated
    return new ChatOpenAI({
      azureOpenAIApiKey: apiKey,
      azureOpenAIApiInstanceName: instanceName,
      azureOpenAIApiDeploymentName: deployment,
      azureOpenAIApiVersion: apiVersion,
      modelName: modelName,
      temperature: config.temperature || 0.2,
      maxTokens: config.maxTokens || 4096
    } as any);
  }

  /**
   * Creates a model optimized for resume generation
   */
  static createResumeModel(): ChatOpenAI {
    return this.createModel({
      modelName: process.env.MODEL_ID || 'gpt-4.1',
      temperature: 0.2,
      maxTokens: 4096
    });
  }

  /**
   * Creates a model optimized for cover letter generation
   */
  static createCoverLetterModel(): ChatOpenAI {
    return this.createModel({
      modelName: process.env.MODEL_ID || 'gpt-4.1',
      temperature: 0.2,
      maxTokens: 4096
    });
  }
} 