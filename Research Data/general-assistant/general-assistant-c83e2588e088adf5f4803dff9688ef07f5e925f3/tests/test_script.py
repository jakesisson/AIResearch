"""
Test script for general-assistant repository.

This file defines the test inputs that will be used for both
'previous' and 'updated' versions of the repository.

The test inputs must be defined as TEST_INPUTS - a list of scenarios.
"""

# Test scenarios for general assistant agent
TEST_INPUTS = [
    {
        "scenario": "simple_question",
        "messages": [
            "What is the capital of France?",
            "What is the population of that city?",
        ]
    },
    {
        "scenario": "math_calculation",
        "messages": [
            "Calculate 15 * 23 + 47 - 12",
            "What is the square root of that result?",
        ]
    },
    {
        "scenario": "web_search_query",
        "messages": [
            "Search for the latest news about artificial intelligence",
            "What are the top 3 headlines?",
        ]
    },
    {
        "scenario": "code_execution",
        "messages": [
            "Write Python code to generate the first 10 Fibonacci numbers",
            "Modify it to calculate the sum of those numbers",
        ]
    },
    {
        "scenario": "data_analysis",
        "messages": [
            "Create a Python script to analyze a list of numbers: [10, 20, 30, 40, 50]",
            "Calculate the mean, median, and standard deviation",
        ]
    },
    {
        "scenario": "complex_calculation",
        "messages": [
            "Solve this equation: 2x + 5 = 15",
            "Verify the solution by substituting it back",
        ]
    },
    {
        "scenario": "information_synthesis",
        "messages": [
            "What are the main differences between Python and JavaScript?",
            "Which one is better for data science and why?",
        ]
    },
    {
        "scenario": "multi_step_problem",
        "messages": [
            "I have a list of temperatures in Celsius: [0, 25, 37, 100]. Convert them to Fahrenheit",
            "Calculate the average temperature in Fahrenheit",
        ]
    },
    {
        "scenario": "text_processing",
        "messages": [
            "Write Python code to count words in a sentence",
            "Modify it to also count unique words",
        ]
    },
    {
        "scenario": "algorithm_implementation",
        "messages": [
            "Implement a Python function to check if a number is prime",
            "Use it to find all prime numbers between 1 and 50",
        ]
    },
    {
        "scenario": "data_transformation",
        "messages": [
            "Create a Python script to convert a dictionary to a list of tuples",
            "Sort the tuples by the second element",
        ]
    },
    {
        "scenario": "comprehensive_task",
        "messages": [
            "Search for information about machine learning algorithms",
            "Write Python code to implement a simple linear regression",
            "Explain how it works",
        ]
    },
]
