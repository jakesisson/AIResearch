"""
Test script for chatluna repository.

This file defines the test inputs that will be used for both
'previous' and 'updated' versions of the repository.

The test inputs must be defined as TEST_INPUTS - a list of scenarios.
"""

# Test scenarios for ChatLuna multi-platform LLM chat service
TEST_INPUTS = [
    {
        "scenario": "basic_conversation",
        "messages": [
            "Hello, how are you?",
            "Tell me about artificial intelligence",
        ]
    },
    {
        "scenario": "code_generation",
        "messages": [
            "Write a Python function to calculate the factorial of a number",
            "Can you optimize it for large numbers?",
        ]
    },
    {
        "scenario": "multi_turn_dialogue",
        "messages": [
            "I'm planning a trip to Japan",
            "What are the best cities to visit?",
            "Tell me about the food culture in Tokyo",
        ]
    },
    {
        "scenario": "technical_explanation",
        "messages": [
            "Explain how neural networks work",
            "What's the difference between CNN and RNN?",
        ]
    },
    {
        "scenario": "creative_writing",
        "messages": [
            "Write a short story about a robot learning to paint",
            "Make it more emotional and add dialogue",
        ]
    },
    {
        "scenario": "problem_solving",
        "messages": [
            "I have a list of numbers and need to find the two that sum to a target value",
            "What's the most efficient algorithm for this?",
        ]
    },
    {
        "scenario": "language_translation",
        "messages": [
            "Translate 'Hello, how are you?' to Spanish",
            "Now translate it to Japanese",
        ]
    },
    {
        "scenario": "data_analysis_question",
        "messages": [
            "What are the key trends in machine learning for 2024?",
            "Which ones are most relevant for healthcare?",
        ]
    },
    {
        "scenario": "preset_personality",
        "messages": [
            "Act as a helpful coding assistant",
            "Help me debug this Python code: def add(a, b): return a - b",
        ]
    },
    {
        "scenario": "streaming_response",
        "messages": [
            "Write a detailed explanation of quantum computing",
            "Break it down into smaller concepts",
        ]
    },
    {
        "scenario": "tool_usage_simulation",
        "messages": [
            "Search for information about the latest AI developments",
            "Summarize the top 3 findings",
        ]
    },
    {
        "scenario": "context_awareness",
        "messages": [
            "My name is Alice and I'm a software engineer",
            "What programming languages should I learn next?",
            "Remember, I'm Alice, what would you recommend specifically for me?",
        ]
    },
]
