from langchain_openai import ChatOpenAI
from langgraph.prebuilt import create_react_agent
from langsmith import Client as LangSmithClient

from src.general_assistant.config.settings import WorkflowsSettings
from src.general_assistant.core.agent.tools import (
    PythonExecutorTool,
    WebSearchTool,
)


class AgentFactory:
    """Factory for creating agents."""

    def __init__(self, settings: WorkflowsSettings):
        self._settings = settings
        self._langsmith_client = LangSmithClient()

    def get_general_agent(self):
        model_settings = self._settings.models.general_agent
        
        # Check if Azure OpenAI is configured
        if model_settings.azure_endpoint and model_settings.azure_api_key:
            llm = ChatOpenAI(
                azure_endpoint=model_settings.azure_endpoint,
                azure_deployment=model_settings.azure_deployment or model_settings.model_name,
                api_version=model_settings.azure_api_version,
                api_key=model_settings.azure_api_key,
                temperature=model_settings.temperature,
                max_tokens=model_settings.max_tokens,
            )
        else:
            # Fallback to standard OpenAI
            llm = ChatOpenAI(
                model=model_settings.model_name,
                temperature=model_settings.temperature,
                max_tokens=model_settings.max_tokens,
            )
        prompt_template = self._langsmith_client.pull_prompt(
            self._settings.models.general_agent.prompt_id
        )
        prompt = prompt_template.format_messages()[0]

        tools = []
        tools.extend(
            WebSearchTool(settings=self._settings.tools.web_search_tool).get_tools()
        )
        tools.extend(PythonExecutorTool().get_tools())

        agent_executor = create_react_agent(
            llm,
            tools,
            name="general_agent",
            prompt=prompt,
        )

        return agent_executor
