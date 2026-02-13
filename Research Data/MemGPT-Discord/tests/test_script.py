"""
Test script for MemGPT-Discord repository.

This file defines the test inputs that will be used for both
'previous' and 'updated' versions of the repository.

The test inputs must be defined as TEST_INPUTS - a list of scenarios.
"""

# Test scenarios for Discord bot with long-term memory (MemGPT-style agent)
TEST_INPUTS = [
    {
        "scenario": "remember_preference",
        "messages": [
            "My name is Alex and I prefer short, direct answers",
            "What did I tell you about my preferences?",
        ]
    },
    {
        "scenario": "core_memory_store",
        "messages": [
            "Remember that I work as a software engineer at a fintech company",
            "What do you know about my job?",
        ]
    },
    {
        "scenario": "recall_context",
        "messages": [
            "I'm planning a trip to Japan next month",
            "Can you remind me what travel plans we discussed?",
        ]
    },
    {
        "scenario": "emotional_context",
        "messages": [
            "I've been stressed about the project deadline this week",
            "How am I feeling about work lately?",
        ]
    },
    {
        "scenario": "multi_turn_memory",
        "messages": [
            "My favorite programming language is Python",
            "I use it mainly for data science",
            "What language do I prefer and what for?",
        ]
    },
    {
        "scenario": "update_memory",
        "messages": [
            "Remember that my dog's name is Max",
            "Actually, I need to correct that - my dog's name is Rex",
            "What is my dog's name?",
        ]
    },
    {
        "scenario": "personalization",
        "messages": [
            "I like to be called by my nickname Chip",
            "Address me the way I asked next time",
        ]
    },
    {
        "scenario": "context_retrieval",
        "messages": [
            "Save that I'm learning Spanish and my goal is to be conversational in 6 months",
            "What are my language learning goals?",
        ]
    },
    {
        "scenario": "pattern_recognition",
        "messages": [
            "I usually ask for help with code reviews on Fridays",
            "Based on our history, when do I typically need code review help?",
        ]
    },
    {
        "scenario": "cross_reference",
        "messages": [
            "I'm vegetarian and allergic to nuts",
            "Suggest a quick recipe that fits my diet",
        ]
    },
    {
        "scenario": "anticipate_needs",
        "messages": [
            "I have a presentation tomorrow on the Q3 results",
            "What might I need help with given our conversation?",
        ]
    },
    {
        "scenario": "past_challenges",
        "messages": [
            "Last time we talked about debugging, the issue was with async error handling",
            "What was the debugging issue we solved before?",
        ]
    },
]
