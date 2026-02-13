"""
Test script for medabot repository.

This file defines the test inputs that will be used for both
'previous' and 'updated' versions of the repository.

The test inputs must be defined as TEST_INPUTS - a list of scenarios.
"""

# Test scenarios for medabot medical assistant
TEST_INPUTS = [
    {
        "scenario": "medicine_identification",
        "messages": [
            "Identify the medicine in this image",
            "What is the active substance in this medication?",
        ]
    },
    {
        "scenario": "dosage_information",
        "messages": [
            "What is the recommended dosage for this medicine?",
            "How should I take this medication?",
        ]
    },
    {
        "scenario": "side_effects_query",
        "messages": [
            "What are the side effects of this medicine?",
            "Are there any adverse reactions I should be aware of?",
        ]
    },
    {
        "scenario": "contraindications",
        "messages": [
            "Who should not take this medicine?",
            "What are the contraindications for this medication?",
        ]
    },
    {
        "scenario": "interactions",
        "messages": [
            "Can I take this medicine with other medications?",
            "What drug interactions should I be aware of?",
        ]
    },
    {
        "scenario": "storage_instructions",
        "messages": [
            "How should I store this medicine?",
            "What are the storage requirements for this medication?",
        ]
    },
    {
        "scenario": "pregnancy_safety",
        "messages": [
            "Is this medicine safe during pregnancy?",
            "Can I take this medication while breastfeeding?",
        ]
    },
    {
        "scenario": "administration_method",
        "messages": [
            "How should I administer this medicine?",
            "What is the correct way to take this medication?",
        ]
    },
    {
        "scenario": "overdose_information",
        "messages": [
            "What should I do if I take too much of this medicine?",
            "What are the symptoms of an overdose?",
        ]
    },
    {
        "scenario": "missed_dose",
        "messages": [
            "What should I do if I miss a dose?",
            "How should I handle a missed dose of this medication?",
        ]
    },
    {
        "scenario": "precautions",
        "messages": [
            "What precautions should I take with this medicine?",
            "Are there any special warnings for this medication?",
        ]
    },
    {
        "scenario": "general_information",
        "messages": [
            "Tell me about this medicine",
            "What is this medication used for?",
        ]
    },
]
