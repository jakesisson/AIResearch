"""
Test script for knowledge-agent repository.

This file defines the test inputs that will be used for both
'previous' and 'updated' versions of the repository.

The test inputs must be defined as TEST_INPUTS - a list of scenarios.
"""

# Test scenarios for knowledge-agent LightRAG knowledge base maintenance
TEST_INPUTS = [
    {
        "scenario": "maintenance_workflow",
        "messages": [
            "Identify knowledge gaps in the LightRAG knowledge base and update it",
            "Analyze the current state of the knowledge base",
        ]
    },
    {
        "scenario": "analysis_task",
        "messages": [
            "Analyze the knowledge base for inconsistencies",
            "What are the main topics covered in the knowledge base?",
        ]
    },
    {
        "scenario": "research_task",
        "messages": [
            "Research and find information about machine learning best practices",
            "Search for recent developments in RAG technology",
        ]
    },
    {
        "scenario": "curation_task",
        "messages": [
            "Curate the knowledge base entries for relevance",
            "Review and organize the knowledge base content",
        ]
    },
    {
        "scenario": "audit_task",
        "messages": [
            "Audit the knowledge base for accuracy and completeness",
            "Check for duplicate entries in the knowledge base",
        ]
    },
    {
        "scenario": "fix_task",
        "messages": [
            "Fix any errors or inconsistencies found in the knowledge base",
            "Update outdated information in the knowledge base",
        ]
    },
    {
        "scenario": "advise_task",
        "messages": [
            "Provide recommendations for improving the knowledge base",
            "What improvements should be made to the knowledge base structure?",
        ]
    },
    {
        "scenario": "knowledge_gap_identification",
        "messages": [
            "Identify gaps in the knowledge base coverage",
            "What topics are missing from the knowledge base?",
        ]
    },
    {
        "scenario": "content_validation",
        "messages": [
            "Validate the accuracy of knowledge base entries",
            "Check if the knowledge base content is up to date",
        ]
    },
    {
        "scenario": "search_optimization",
        "messages": [
            "Optimize search functionality in the knowledge base",
            "Improve the retrieval quality of knowledge base queries",
        ]
    },
    {
        "scenario": "data_quality_check",
        "messages": [
            "Perform a quality check on the knowledge base data",
            "Identify low-quality or incomplete entries",
        ]
    },
    {
        "scenario": "knowledge_base_update",
        "messages": [
            "Update the knowledge base with new information",
            "Add recent developments to the knowledge base",
        ]
    },
]
