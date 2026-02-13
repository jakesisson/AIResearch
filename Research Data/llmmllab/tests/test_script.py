"""
Test script for llmmllab repository.

This file defines the test inputs that will be used for both
'previous' and 'updated' versions of the repository.

The test inputs must be defined as TEST_INPUTS - a list of scenarios.
"""

# Test scenarios for llmmllab ML inference platform
TEST_INPUTS = [
    {
        "scenario": "basic_chat_completion",
        "messages": [
            "Hello, how are you?",
            "What is the capital of France?",
        ]
    },
    {
        "scenario": "text_summarization",
        "messages": [
            "Summarize this text: Machine learning is a subset of artificial intelligence that focuses on algorithms and statistical models.",
            "Provide a brief summary of the following article.",
        ]
    },
    {
        "scenario": "code_generation",
        "messages": [
            "Write a Python function to calculate the factorial of a number",
            "Generate code to sort a list of dictionaries by a specific key",
        ]
    },
    {
        "scenario": "analysis_task",
        "messages": [
            "Analyze the pros and cons of cloud computing",
            "What are the key factors to consider when choosing a database?",
        ]
    },
    {
        "scenario": "research_planning",
        "messages": [
            "Create a research plan for studying the impact of AI on healthcare",
            "Outline a research methodology for analyzing customer behavior",
        ]
    },
    {
        "scenario": "engineering_task",
        "messages": [
            "Design a REST API for a todo list application",
            "Explain how to implement a caching layer for a web application",
        ]
    },
    {
        "scenario": "key_points_extraction",
        "messages": [
            "Extract key points from this document",
            "What are the main takeaways from this article?",
        ]
    },
    {
        "scenario": "formatting_task",
        "messages": [
            "Format this text as a structured report",
            "Convert this data into a markdown table",
        ]
    },
    {
        "scenario": "memory_retrieval",
        "messages": [
            "What did we discuss earlier about machine learning?",
            "Retrieve information about our previous conversation on databases",
        ]
    },
    {
        "scenario": "self_critique",
        "messages": [
            "Review and critique this code for potential improvements",
            "Evaluate this solution and suggest enhancements",
        ]
    },
    {
        "scenario": "improvement_suggestion",
        "messages": [
            "How can I improve this algorithm?",
            "Suggest ways to optimize this code",
        ]
    },
    {
        "scenario": "complex_reasoning",
        "messages": [
            "Explain the relationship between machine learning, deep learning, and neural networks",
            "How do different database indexing strategies affect query performance?",
        ]
    },
]
