from crewai import Agent, Crew, Process, Task
from crewai_tools import SerperDevTool
import os
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI

# Load environment variables from .env file
load_dotenv()

# Ensure Azure OpenAI and SERPER_API_KEY are set in your .env file
# For example:
# SERPER_API_KEY="your_serper_api_key_here"
# AZURE_OPENAI_API_KEY="your_azure_openai_api_key_here"
# AZURE_OPENAI_ENDPOINT="https://your-instance.openai.azure.com/"

# Get API Keys directly from environment
azure_endpoint = os.getenv("AZURE_OPENAI_ENDPOINT")
azure_api_key = os.getenv("AZURE_OPENAI_API_KEY")
serper_api_key = os.getenv("SERPER_API_KEY")

if not azure_endpoint or not azure_api_key:
    raise ValueError(
        "AZURE_OPENAI_ENDPOINT and AZURE_OPENAI_API_KEY not found in environment variables. Please set them in your .env file.")
# SERPER_API_KEY is optional - only needed if using search tools
if not serper_api_key:
    import warnings
    warnings.warn(
        "SERPER_API_KEY not found. Search functionality will not work. Please set it in your .env file if you need search features.")

# Initialize Azure OpenAI LLM
azure_llm = ChatOpenAI(
    azure_endpoint=azure_endpoint,
    azure_deployment=os.getenv("AZURE_OPENAI_API_DEPLOYMENT") or os.getenv("MODEL_ID", "gpt-4.1"),
    api_version=os.getenv("AZURE_OPENAI_API_VERSION", "2025-01-01-preview"),
    api_key=azure_api_key,
    temperature=float(os.getenv("TEMPERATURE", "0.7")),
    max_tokens=int(os.getenv("MAX_TOKENS", "1000")) if os.getenv("MAX_TOKENS") else None,
)

def test_llm_response():
    response = azure_llm.invoke("Say hello and tell me your model name.")
    print("LLM Test Response:\n", response.content)


def run_research_crew(topic: str) -> str:
    """
    Runs a CrewAI workflow for genetic research and analysis.
    """
    # Initialize the search tool
    search_tool = SerperDevTool(api_key=serper_api_key)

    # Define specialized agents
    senior_research_specialist = Agent(
        role="Senior Research Specialist",
        goal=f"Gather comprehensive and up-to-date information on {topic}",
        backstory=(
            "You are a leading expert in research, highly skilled in "
            "finding relevant papers, studies, and breakthroughs "
            "related to any given topic. You use advanced search techniques "
            "to ensure accuracy and completeness."
        ),
        verbose=True,
        allow_delegation=False,
        tools=[search_tool],
    )

    research_analyst = Agent(
        role="Research Analyst and Report Writer",
        goal=f"Analyze and synthesize research data on {topic} into actionable insights and comprehensive reports",
        backstory=(
            "You are a meticulous research analyst, proficient in interpreting "
            "complex information, identifying key patterns, and summarizing "
            "findings into clear, concise reports. You excel at extracting the "
            "most critical information for further study or application."
        ),
        verbose=True,
        llm=azure_llm  # Assign Azure OpenAI LLM here
    )

    quality_assurance_reviewer = Agent(
        role="Quality Assurance Reviewer",
        goal=f"Ensure the research findings and analysis on {topic} are accurate, well-supported, and meet high standards of clarity and completeness",
        backstory=(
            "You are an experienced fact-checker and editor, meticulous in reviewing "
            "research outputs for accuracy, logical flow, and adherence to the "
            "research objectives. You ensure all information is credible and "
            "presented clearly."
        ),
        verbose=True,
        llm=azure_llm # Assign Azure OpenAI LLM here
    )

    # Define tasks for each agent
    research_task = Task(
        description=f"Conduct a thorough search and gather all pertinent information about '{topic}'. "
        "Focus on recent discoveries, significant studies, and potential implications. "
        "Compile findings into detailed bullet points.",
        expected_output="A detailed bulleted list of recent research findings and studies on the given topic.",
        agent=senior_research_specialist
    )

    analysis_task = Task(
        description=f"Based on the research findings about '{topic}', analyze and synthesize the information. "
        "Identify the most important breakthroughs, potential applications, and any unresolved questions. "
        "Present a concise summary of the key insights and their significance.",
        expected_output="A concise summary (2-3 paragraphs) highlighting key breakthroughs, applications, and open questions related to the research topic.",
        agent=research_analyst,
        context=[research_task]
    )

    review_task = Task(
        description=f"Review the research analysis and summary on '{topic}' for accuracy, completeness, and clarity. "
        "Provide constructive feedback and suggest improvements if necessary. "
        "Ensure the final output is polished and ready for presentation.",
        expected_output="A reviewed and refined summary of the research findings, ensuring high quality and accuracy.",
        agent=quality_assurance_reviewer,
        context=[analysis_task]
    )

    # Create the crew
    genetic_crew = Crew(
        agents=[senior_research_specialist, research_analyst, quality_assurance_reviewer],
        tasks=[research_task, analysis_task, review_task],
        process=Process.sequential,
        verbose=True
    )

    # Kick off the crew
    result = genetic_crew.kickoff()
    return str(result)


if __name__ == '__main__':
    # Example usage (for testing the crew_logic directly)
    test_llm_response()
    print("Running general research crew for 'AI in healthcare'...")
    output = run_research_crew(topic="AI in healthcare")
    print("\n---" + " Crew Output ---\n")
    print(output)
