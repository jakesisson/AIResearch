import SYSTEM_MESSAGE from "@/constants/systemMessage";
import { AIMessage, SystemMessage } from "@langchain/core/messages";
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { ChatOpenAI } from "@langchain/openai";
import { END, MessagesAnnotation, START, StateGraph } from "@langchain/langgraph";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import wxflows from "@wxflows/sdk/langchain";

//Customers at : https://introspection.apis.stepzen.com/customers
// Comments at: https://dummyjson.com/comments  a wxflows import curl + url

// Connect to WxFlows
const toolClient = new wxflows({ endpoint: process.env.WXFLOWS_ENDPOINT || "", apikey: process.env.WXFLOWS_APIKEY });

// Retrieve the tools
const tools = await toolClient.lcTools;
const toolNode = new ToolNode(tools);

// Use Azure OpenAI instead of Groq
if (!process.env.AZURE_OPENAI_API_KEY || !process.env.AZURE_OPENAI_ENDPOINT) {
  throw new Error("Azure OpenAI credentials are not defined in the environment variables");
}

const initialiserModel = () => {
  // Extract instance name from endpoint: https://ksontini-mcp-project.openai.azure.com/ -> ksontini-mcp-project
  const endpoint = process.env.AZURE_OPENAI_ENDPOINT || "";
  const instanceName = endpoint.replace("https://", "").replace(".openai.azure.com", "").replace("/", "") || "";
  
  const model = new ChatOpenAI({
    model: process.env.MODEL_ID || "gpt-4.1",
    azureOpenAIApiKey: process.env.AZURE_OPENAI_API_KEY as string,
    azureOpenAIApiInstanceName: instanceName,
    azureOpenAIApiDeploymentName: process.env.MODEL_ID || "gpt-4.1",
    azureOpenAIApiVersion: process.env.AZURE_OPENAI_API_VERSION || "2025-01-01-preview",
    temperature: parseFloat(process.env.TEMPERATURE || "0.3"),
    maxTokens: parseInt(process.env.MAX_TOKENS || "1000"),
    streaming: true, // Enable streaming for SSE
    callbacks: [
      {
        handleLLMStart: async () => {
          console.log("LLM started");
        },
        handleLLMEnd: async (output) => {
          console.log("LLM ended", output);
          const usage = output.llmOutput?.usage;
          if (usage) {
            console.log("LLM usage", usage);
          }
        },
      },
    ],
  }).bindTools(tools);
  return model;
};

// define the function to determine if the conversation should continue
const shouldContinue = async (state: typeof MessagesAnnotation.State) => {
  const messages = state.messages;
  const lastMessage = messages[messages.length - 1] as AIMessage;
  // if the LLM makes a tool call, then we route to the tool node
  if (lastMessage.tool_calls?.length) {
    return "tools";
  }
  if (lastMessage.content && lastMessage._getType() === "tool") {
    return "agent";
  }
  return END;
};

const createWorkflow = () => {
  const model = initialiserModel();
  const stateGraph = new StateGraph(MessagesAnnotation)
    .addNode("agent", async (state) => {
      const systemContent = SYSTEM_MESSAGE;

      // Create the prompt template with system and message placeholder
      const promptTemplate = ChatPromptTemplate.fromMessages([
        new SystemMessage(systemContent, {
          cache_control: { type: "ephemeral" },
        }),
        new MessagesPlaceholder("messages"),
      ]);

      const response = await model.invoke(await promptTemplate.invoke({ messages: state.messages }));
      return { messages: [response] };
    })
    .addEdge(START, "agent")
    .addNode("tool", toolNode)
    .addConditionalEdges("agent", shouldContinue)
    .addEdge("tool", "agent");

  return stateGraph;
};

export { createWorkflow };
