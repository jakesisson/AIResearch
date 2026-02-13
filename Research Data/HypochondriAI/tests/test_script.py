"""
Test script for HypochondriAI repository.

This file defines the test inputs that will be used for both
'previous' and 'updated' versions of the repository.

The test inputs must be defined as TEST_INPUTS - a list of scenarios.
"""

# Test scenarios for HypochondriAI health anxiety LLM service
TEST_INPUTS = [
    {
        "scenario": "health_anxiety_query",
        "messages": [
            "I've been experiencing headaches for the past week. Should I be worried?",
            "What are the common causes of persistent headaches?",
        ]
    },
    {
        "scenario": "symptom_interpretation",
        "messages": [
            "I have a persistent cough that won't go away. What could this mean?",
            "How long should I wait before seeing a doctor?",
        ]
    },
    {
        "scenario": "anxiety_reassurance",
        "messages": [
            "I'm worried about my heart rate. It feels fast sometimes.",
            "What are normal heart rate ranges?",
        ]
    },
    {
        "scenario": "general_health_question",
        "messages": [
            "What are the symptoms of a common cold?",
            "How can I tell the difference between a cold and the flu?",
        ]
    },
    {
        "scenario": "chronic_condition_management",
        "messages": [
            "I have diabetes. What should I know about managing it?",
            "What are the warning signs I should watch for?",
        ]
    },
    {
        "scenario": "preventive_care",
        "messages": [
            "What preventive health measures should I take?",
            "How often should I get a checkup?",
        ]
    },
    {
        "scenario": "medication_concern",
        "messages": [
            "I'm taking medication and experiencing side effects. Is this normal?",
            "When should I contact my doctor about medication side effects?",
        ]
    },
    {
        "scenario": "mental_health_anxiety",
        "messages": [
            "I've been feeling anxious about my health lately.",
            "What are some strategies for managing health anxiety?",
        ]
    },
    {
        "scenario": "emergency_situation",
        "messages": [
            "I'm experiencing chest pain. What should I do?",
            "What are the signs of a medical emergency?",
        ]
    },
    {
        "scenario": "lifestyle_health",
        "messages": [
            "How does diet affect my overall health?",
            "What lifestyle changes can improve my health?",
        ]
    },
    {
        "scenario": "family_history_concern",
        "messages": [
            "My family has a history of heart disease. Should I be concerned?",
            "What preventive measures can I take given my family history?",
        ]
    },
    {
        "scenario": "symptom_tracking",
        "messages": [
            "I've been tracking my symptoms. How should I present this to my doctor?",
            "What information is most important to share with healthcare providers?",
        ]
    },
]
