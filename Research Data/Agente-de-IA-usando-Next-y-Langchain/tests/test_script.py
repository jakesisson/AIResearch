"""
Test script for Agente-de-IA-usando-Next-y-Langchain repository.

This file defines the test inputs that will be used for both
'previous' and 'updated' versions of the repository.

The test inputs must be defined as TEST_INPUTS - a list of scenarios.
"""

# Test scenarios for AI agent with tool usage (YouTube, Google Books, Math)
TEST_INPUTS = [
    {
        "scenario": "youtube_transcript_request",
        "messages": [
            "Can you get the transcript from this YouTube video: https://www.youtube.com/watch?v=dQw4w9WgXcQ",
            "What are the main points discussed in the video?",
        ]
    },
    {
        "scenario": "google_books_search",
        "messages": [
            "Search for books about machine learning",
            "What are the top 3 results?",
        ]
    },
    {
        "scenario": "math_calculation",
        "messages": [
            "Calculate the integral of x^2 from 0 to 10",
            "What is the result?",
        ]
    },
    {
        "scenario": "multi_tool_workflow",
        "messages": [
            "Find books about Python programming and then calculate how many pages would be in 5 copies",
            "Can you summarize the first book you found?",
        ]
    },
    {
        "scenario": "youtube_analysis",
        "messages": [
            "Get the transcript from https://www.youtube.com/watch?v=example123",
            "Analyze the key themes and create a summary",
        ]
    },
    {
        "scenario": "book_recommendation",
        "messages": [
            "I'm interested in learning about artificial intelligence. Can you find some good books?",
            "Which one would you recommend for a beginner?",
        ]
    },
    {
        "scenario": "complex_math_problem",
        "messages": [
            "Solve this equation: 2x^2 + 5x - 3 = 0",
            "What are the roots?",
        ]
    },
    {
        "scenario": "video_content_extraction",
        "messages": [
            "Extract the transcript from this video: https://www.youtube.com/watch?v=test456",
            "What topics are covered in the first 5 minutes?",
        ]
    },
    {
        "scenario": "research_workflow",
        "messages": [
            "I need to research quantum computing. Find me some books and then help me understand the basics",
            "What are the key concepts I should know?",
        ]
    },
    {
        "scenario": "educational_content",
        "messages": [
            "Find educational videos about data science and get their transcripts",
            "What are the common topics across these videos?",
        ]
    },
    {
        "scenario": "book_author_search",
        "messages": [
            "Search for books by Isaac Asimov",
            "What are his most popular science fiction works?",
        ]
    },
    {
        "scenario": "mathematical_analysis",
        "messages": [
            "Calculate the derivative of f(x) = x^3 + 2x^2 - 5x + 1",
            "What is the value at x = 3?",
        ]
    },
]
