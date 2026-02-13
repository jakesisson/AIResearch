import OpenAI from "openai";

// Check for Azure OpenAI configuration
const azureEndpoint = process.env.AZURE_OPENAI_ENDPOINT;
const azureApiKey = process.env.AZURE_OPENAI_API_KEY;
const azureDeployment = process.env.AZURE_OPENAI_API_DEPLOYMENT || "gpt-4";
const azureApiVersion = process.env.AZURE_OPENAI_API_VERSION || "2024-02-15-preview";

export const openai = azureEndpoint && azureApiKey
  ? new OpenAI({
      dangerouslyAllowBrowser: true,
      apiKey: azureApiKey,
      baseURL: `${azureEndpoint}/openai/deployments/${azureDeployment}`,
      defaultQuery: { "api-version": azureApiVersion },
    })
  : new OpenAI({
      dangerouslyAllowBrowser: true,
      apiKey: process.env.OPENAI_API_KEY,
    });
