"""
Test script for bt-servant-engine repository.

This file defines the test inputs that will be used for both
'previous' and 'updated' versions of the repository.

The test inputs must be defined as TEST_INPUTS - a list of scenarios.
"""

# Test scenarios for Bible translation assistant WhatsApp bot
TEST_INPUTS = [
    {
        "scenario": "passage_summary_request",
        "messages": [
            "Summarize Titus 1",
            "What are the key themes in this passage?",
        ]
    },
    {
        "scenario": "translation_helps_query",
        "messages": [
            "What are the translation challenges for John 1:1?",
            "Explain the cultural context for this verse.",
        ]
    },
    {
        "scenario": "keywords_extraction",
        "messages": [
            "What are the important words in Romans 1?",
            "Which terms need special attention in translation?",
        ]
    },
    {
        "scenario": "scripture_retrieval",
        "messages": [
            "Show me John 3:16-18",
            "What does this passage say in the original language?",
        ]
    },
    {
        "scenario": "scripture_audio",
        "messages": [
            "Read Romans 8:1-4 aloud",
            "Can you read it in a different language?",
        ]
    },
    {
        "scenario": "scripture_translation",
        "messages": [
            "Translate John 3:16 into Indonesian",
            "What are alternative translations for 'love' in this context?",
        ]
    },
    {
        "scenario": "language_preference_setting",
        "messages": [
            "Set my response language to Spanish",
            "Confirm my current language preference",
        ]
    },
    {
        "scenario": "general_translation_assistance",
        "messages": [
            "I'm translating the book of Mark. What should I know?",
            "What are common translation challenges in Mark?",
        ]
    },
    {
        "scenario": "system_information_request",
        "messages": [
            "What can you help me with?",
            "How do you work?",
        ]
    },
    {
        "scenario": "conversational_interaction",
        "messages": [
            "Hello, how are you?",
            "Tell me about yourself",
        ]
    },
    {
        "scenario": "multi_intent_query",
        "messages": [
            "Summarize Mark 1:1-8 and show me the keywords",
            "Also translate verse 3 into French",
        ]
    },
    {
        "scenario": "complex_passage_analysis",
        "messages": [
            "Analyze 1 Corinthians 13:1-3 for translation challenges",
            "What cultural concepts need explanation?",
        ]
    },
]
