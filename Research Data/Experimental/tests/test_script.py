"""
Test script for Experimental repository.

This file defines the test inputs that will be used for both
'previous' and 'updated' versions of the repository.

The test inputs must be defined as TEST_INPUTS - a list of scenarios.
"""

# Test scenarios for Experimental project (multiple tools)
TEST_INPUTS = [
    {
        "scenario": "crewai_research_crew",
        "messages": [
            "Run a research crew on the topic of quantum computing.",
            "What are the key findings?",
        ]
    },
    {
        "scenario": "langchain_file_processor_qa",
        "messages": [
            "Upload a PDF and ask: What is the main topic of this document?",
            "Can you summarize the key points?",
        ]
    },
    {
        "scenario": "gemini_api_chatbot_basic",
        "messages": [
            "Hello, how are you?",
            "Tell me about artificial intelligence.",
        ]
    },
    {
        "scenario": "gemini_api_chatbot_with_context",
        "messages": [
            "Upload a document about machine learning.",
            "Based on the uploaded document, what are the main types of machine learning?",
        ]
    },
    {
        "scenario": "atomic_pdf_qa_upload",
        "messages": [
            "Upload a PDF book about Python programming.",
            "What are the main topics covered in this book?",
        ]
    },
    {
        "scenario": "atomic_pdf_qa_followup",
        "messages": [
            "What is object-oriented programming?",
            "Can you give me an example from the book?",
        ]
    },
    {
        "scenario": "smart_notes_create",
        "messages": [
            "Create a note with title 'Meeting Notes' and content 'Discussed project timeline and deliverables.'",
            "Summarize this note.",
        ]
    },
    {
        "scenario": "smart_notes_update",
        "messages": [
            "Update the note with new content: 'Meeting Notes: Discussed project timeline, deliverables, and budget constraints.'",
            "Get the summary of the updated note.",
        ]
    },
    {
        "scenario": "crewai_multi_agent_workflow",
        "messages": [
            "Run a research crew on 'sustainable energy solutions'.",
            "What did the quality assurance reviewer find?",
        ]
    },
    {
        "scenario": "langchain_file_processor_advanced_rag",
        "messages": [
            "Upload a technical document and ask: Explain the architecture described in this document.",
            "What are the key components mentioned?",
        ]
    },
    {
        "scenario": "gemini_api_chatbot_vector_search",
        "messages": [
            "Upload multiple documents about data science.",
            "Search for information about neural networks in the uploaded documents.",
        ]
    },
    {
        "scenario": "atomic_pdf_qa_complex_query",
        "messages": [
            "Upload a research paper PDF.",
            "What methodology was used in this research? What were the main conclusions?",
        ]
    },
]
