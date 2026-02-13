"""
Test script for langflow repository.

This file defines the test inputs that will be used for both
'previous' and 'updated' versions of the repository.

The test inputs must be defined as TEST_INPUTS - a list of scenarios.
"""

# Test scenarios for langflow visual workflow builder
TEST_INPUTS = [
    {
        "scenario": "basic_chat_flow",
        "messages": [
            "Create a simple chat flow with OpenAI",
            "Build a chatbot that responds to user queries",
        ]
    },
    {
        "scenario": "rag_pipeline",
        "messages": [
            "Create a RAG pipeline with vector store and retrieval",
            "Build a document Q&A system with embeddings",
        ]
    },
    {
        "scenario": "multi_agent_workflow",
        "messages": [
            "Create a multi-agent workflow with tool calling",
            "Build an agent system with multiple specialized agents",
        ]
    },
    {
        "scenario": "text_processing_chain",
        "messages": [
            "Create a text processing chain with summarization",
            "Build a pipeline that processes and summarizes documents",
        ]
    },
    {
        "scenario": "data_extraction_flow",
        "messages": [
            "Create a data extraction flow from unstructured text",
            "Build a system that extracts structured data from documents",
        ]
    },
    {
        "scenario": "conversation_memory",
        "messages": [
            "Create a chat flow with conversation memory",
            "Build a chatbot that remembers previous conversations",
        ]
    },
    {
        "scenario": "conditional_routing",
        "messages": [
            "Create a flow with conditional routing based on input",
            "Build a system that routes queries to different handlers",
        ]
    },
    {
        "scenario": "streaming_response",
        "messages": [
            "Create a flow with streaming responses",
            "Build a chatbot that streams responses in real-time",
        ]
    },
    {
        "scenario": "custom_tool_integration",
        "messages": [
            "Create a flow with custom tool integration",
            "Build an agent that uses custom tools for specific tasks",
        ]
    },
    {
        "scenario": "multi_model_comparison",
        "messages": [
            "Create a flow that compares outputs from multiple models",
            "Build a system that evaluates different LLM responses",
        ]
    },
    {
        "scenario": "error_handling_flow",
        "messages": [
            "Create a flow with error handling and fallbacks",
            "Build a robust system that handles API failures gracefully",
        ]
    },
    {
        "scenario": "complex_workflow",
        "messages": [
            "Create a complex workflow with multiple steps and branches",
            "Build an advanced system with parallel processing and merging",
        ]
    },
]
