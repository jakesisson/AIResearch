import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { OpenAIEmbeddings } from "@langchain/openai";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";

// Process PDF and create a retriever
export async function processLeaflet(pdfBase64: string) {
  try {
    // Convert base64 to Buffer
    const pdfBuffer = Buffer.from(pdfBase64, "base64");

    // Create a blob from the buffer
    const blob = new Blob([pdfBuffer], { type: "application/pdf" });

    // Load PDF document
    const loader = new PDFLoader(blob);
    const docs = await loader.load();

    // Split into chunks
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });
    const splitDocs = await splitter.splitDocuments(docs);

    // Create vector store with Azure OpenAI support
    const azureEndpoint = process.env.AZURE_OPENAI_ENDPOINT;
    const azureApiKey = process.env.AZURE_OPENAI_API_KEY;
    
    // Extract resource name from endpoint (e.g., https://myresource.openai.azure.com -> myresource)
    const getAzureResourceName = (endpoint: string): string => {
      const match = endpoint.match(/https?:\/\/([^.]+)\.openai\.azure\.com/);
      return match ? match[1] : "";
    };
    
    const embeddings = azureEndpoint && azureApiKey
      ? new OpenAIEmbeddings({
          azureOpenAIApiKey: azureApiKey,
          azureOpenAIApiInstanceName: getAzureResourceName(azureEndpoint),
          azureOpenAIApiDeploymentName: process.env.AZURE_OPENAI_EMBEDDING_DEPLOYMENT || process.env.AZURE_OPENAI_API_DEPLOYMENT || "text-embedding-ada-002",
          azureOpenAIApiVersion: process.env.AZURE_OPENAI_API_VERSION || "2024-02-15-preview",
        })
      : new OpenAIEmbeddings({
          openAIApiKey: process.env.OPENAI_API_KEY,
        });
    
    const vectorStore = await MemoryVectorStore.fromDocuments(
      splitDocs,
      embeddings
    );

    // Create retriever
    const retriever = vectorStore.asRetriever({
      k: 3, // Return top 3 most relevant chunks
    });

    return {
      retriever,
      vectorStore,
      documentCount: splitDocs.length,
      chunks: splitDocs,
    };
  } catch (error) {
    console.error("Error processing leaflet:", error);
    throw error;
  }
}

// Simple function to query the leaflet using retriever + LLM
export async function queryLeaflet(retriever: any, question: string) {
  try {
    // Get relevant documents
    const relevantDocs = await retriever.getRelevantDocuments(question);

    // Create context from relevant documents
    const context = relevantDocs
      .map((doc: any) => doc.pageContent)
      .join("\n\n");

    // Create prompt template
    const prompt = ChatPromptTemplate.fromTemplate(`
You are a helpful medical assistant that provides information ONLY from the patient information leaflet.

Answer questions based ONLY on the following context from the patient leaflet:

{context}

Question: {question}

Instructions:
- Only use information explicitly stated in the leaflet context above
- If the information is not in the leaflet, say "I don't see information about this in the patient leaflet" and suggest consulting a healthcare professional
- Do not make up or infer information not explicitly stated in the leaflet
- Be precise and cite specific sections when possible
- Always recommend consulting healthcare professionals for personalized medical advice
- Always reply in portuguese.

Answer:
    `);

    // Create chat model with Azure OpenAI support
    const azureEndpoint = process.env.AZURE_OPENAI_ENDPOINT;
    const azureApiKey = process.env.AZURE_OPENAI_API_KEY;
    
    // Extract resource name from endpoint (e.g., https://myresource.openai.azure.com -> myresource)
    const getAzureResourceName = (endpoint: string): string => {
      const match = endpoint.match(/https?:\/\/([^.]+)\.openai\.azure\.com/);
      return match ? match[1] : "";
    };
    
    const llm = azureEndpoint && azureApiKey
      ? new ChatOpenAI({
          azureOpenAIApiKey: azureApiKey,
          azureOpenAIApiInstanceName: getAzureResourceName(azureEndpoint),
          azureOpenAIApiDeploymentName: process.env.AZURE_OPENAI_API_DEPLOYMENT || "gpt-4",
          azureOpenAIApiVersion: process.env.AZURE_OPENAI_API_VERSION || "2024-02-15-preview",
          temperature: 0,
        })
      : new ChatOpenAI({
          modelName: "gpt-4.1-nano",
          temperature: 0,
          openAIApiKey: process.env.OPENAI_API_KEY,
        });

    // Format the prompt
    const formattedPrompt = await prompt.format({
      context: context,
      question: question,
    });

    // Get response from LLM
    const response = await llm.invoke(formattedPrompt);

    return {
      answer: response.content,
      sourceDocuments: relevantDocs,
      context: context,
    };
  } catch (error) {
    console.error("Error querying leaflet:", error);
    throw error;
  }
}
