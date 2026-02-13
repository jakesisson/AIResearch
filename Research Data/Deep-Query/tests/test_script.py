"""
Test script for Deep-Query repository.

This file defines the test inputs that will be used for both
'previous' and 'updated' versions of the repository.

The test inputs must be defined as TEST_INPUTS - a list of scenarios.
"""

# Test scenarios for Deep-Query RAG system
TEST_INPUTS = [
    {
        "scenario": "simple_query_retrieval",
        "messages": [
            "What is the main topic of the uploaded document?",
            "Summarize the key points.",
        ]
    },
    {
        "scenario": "multi_document_query",
        "messages": [
            "Search across all uploaded documents for information about machine learning.",
            "Which documents contain relevant information?",
        ]
    },
    {
        "scenario": "specific_fact_retrieval",
        "messages": [
            "What is the author's name mentioned in the document?",
            "When was this document created?",
        ]
    },
    {
        "scenario": "comparative_query",
        "messages": [
            "Compare the information in document A and document B on the topic of AI safety.",
            "What are the key differences?",
        ]
    },
    {
        "scenario": "technical_question",
        "messages": [
            "Explain the technical details about neural network architecture from the documents.",
            "What are the specific parameters mentioned?",
        ]
    },
    {
        "scenario": "contextual_follow_up",
        "messages": [
            "What are the main challenges discussed?",
            "What solutions are proposed for these challenges?",
        ]
    },
    {
        "scenario": "citation_request",
        "messages": [
            "Find all references to research papers in the documents.",
            "List the authors and publication years.",
        ]
    },
    {
        "scenario": "data_extraction",
        "messages": [
            "Extract all numerical data and statistics from the documents.",
            "What trends do these numbers show?",
        ]
    },
    {
        "scenario": "concept_explanation",
        "messages": [
            "Explain the concept of 'transfer learning' as described in the documents.",
            "Provide examples from the documents.",
        ]
    },
    {
        "scenario": "timeline_construction",
        "messages": [
            "Create a timeline of events mentioned in the documents.",
            "What is the chronological order?",
        ]
    },
    {
        "scenario": "cross_reference_query",
        "messages": [
            "Find all mentions of 'deep learning' and 'neural networks' together.",
            "How are they related in the context of the documents?",
        ]
    },
    {
        "scenario": "summary_generation",
        "messages": [
            "Generate a comprehensive summary of all uploaded documents.",
            "What are the main themes across all documents?",
        ]
    },
]
