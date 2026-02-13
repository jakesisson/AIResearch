"""
Test script for DocRAG-Backend repository.

This file defines the test inputs that will be used for both
'previous' and 'updated' versions of the repository.

The test inputs must be defined as TEST_INPUTS - a list of scenarios.
"""

# Test scenarios for DocRAG-Backend RAG system
TEST_INPUTS = [
    {
        "scenario": "simple_question",
        "messages": [
            "What is the main topic of the indexed document?",
            "Can you provide more details?",
        ]
    },
    {
        "scenario": "technical_query",
        "messages": [
            "Explain the technical implementation details from the documentation.",
            "What are the key components mentioned?",
        ]
    },
    {
        "scenario": "multi_turn_conversation",
        "messages": [
            "What are the main features discussed?",
            "How do these features work together?",
            "What are the limitations?",
        ]
    },
    {
        "scenario": "code_example_request",
        "messages": [
            "Find code examples in the documentation.",
            "Explain how to use the code examples.",
        ]
    },
    {
        "scenario": "comparison_query",
        "messages": [
            "Compare the different approaches mentioned in the documents.",
            "What are the pros and cons of each?",
        ]
    },
    {
        "scenario": "specific_fact_retrieval",
        "messages": [
            "What is the version number mentioned?",
            "When was this document last updated?",
        ]
    },
    {
        "scenario": "step_by_step_instructions",
        "messages": [
            "What are the steps to set up the system?",
            "What prerequisites are needed?",
        ]
    },
    {
        "scenario": "troubleshooting_query",
        "messages": [
            "What common issues are mentioned in the documentation?",
            "How are these issues resolved?",
        ]
    },
    {
        "scenario": "api_reference_query",
        "messages": [
            "What API endpoints are documented?",
            "What are the request and response formats?",
        ]
    },
    {
        "scenario": "conceptual_explanation",
        "messages": [
            "Explain the architecture described in the documents.",
            "How do the different components interact?",
        ]
    },
    {
        "scenario": "best_practices_query",
        "messages": [
            "What best practices are recommended?",
            "What should be avoided?",
        ]
    },
    {
        "scenario": "summary_request",
        "messages": [
            "Provide a comprehensive summary of the indexed content.",
            "What are the main takeaways?",
        ]
    },
]
