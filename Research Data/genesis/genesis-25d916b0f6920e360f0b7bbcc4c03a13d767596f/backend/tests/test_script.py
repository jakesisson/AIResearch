"""
Test script for genesis repository.

This file defines the test inputs that will be used for both
'previous' and 'updated' versions of the repository.

The test inputs must be defined as TEST_INPUTS - a list of scenarios.
"""

# Test scenarios for Genesis chat assistant
TEST_INPUTS = [
    {
        "scenario": "simple_greeting",
        "messages": [
            "Hello, how are you?",
            "What can you help me with?",
        ]
    },
    {
        "scenario": "technical_question",
        "messages": [
            "Explain how neural networks work",
            "What are the main types of neural network architectures?",
        ]
    },
    {
        "scenario": "coding_assistance",
        "messages": [
            "Write a Python function to calculate the factorial of a number",
            "Can you optimize it using memoization?",
        ]
    },
    {
        "scenario": "conversation_context",
        "messages": [
            "I'm learning Python programming",
            "What are the best resources for beginners?",
            "Can you recommend a learning path?",
        ]
    },
    {
        "scenario": "problem_solving",
        "messages": [
            "I need to sort a list of dictionaries by a specific key",
            "Show me how to do it in Python",
        ]
    },
    {
        "scenario": "explanation_request",
        "messages": [
            "What is the difference between async and sync programming?",
            "When should I use async/await?",
        ]
    },
    {
        "scenario": "multi_turn_discussion",
        "messages": [
            "Tell me about machine learning",
            "What are the main categories?",
            "Explain supervised learning in detail",
        ]
    },
    {
        "scenario": "code_review",
        "messages": [
            "Review this code: def add(a, b): return a + b",
            "How can I make it more robust?",
        ]
    },
    {
        "scenario": "concept_clarification",
        "messages": [
            "What is REST API?",
            "How does it differ from GraphQL?",
        ]
    },
    {
        "scenario": "creative_task",
        "messages": [
            "Help me write a short story about a robot learning to paint",
            "Add more details about the robot's emotions",
        ]
    },
    {
        "scenario": "data_analysis_question",
        "messages": [
            "How do I analyze a CSV file with pandas?",
            "Show me how to filter and aggregate the data",
        ]
    },
    {
        "scenario": "complex_multi_step",
        "messages": [
            "I want to build a web scraper",
            "What libraries should I use?",
            "Show me a basic example",
            "How do I handle errors and retries?",
        ]
    },
]
