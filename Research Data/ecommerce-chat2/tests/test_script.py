"""
Test script for ecommerce-chat2 repository.

This file defines the test inputs that will be used for both
'previous' and 'updated' versions of the repository.

The test inputs must be defined as TEST_INPUTS - a list of scenarios.
"""

# Test scenarios for e-commerce chatbot
TEST_INPUTS = [
    {
        "scenario": "product_inquiry_smartphone",
        "messages": [
            "What smartphones do you have available?",
            "Tell me about the features of your best smartphone.",
        ]
    },
    {
        "scenario": "product_inquiry_laptop",
        "messages": [
            "I'm looking for a laptop for gaming. What do you recommend?",
            "What are the specifications of your gaming laptops?",
        ]
    },
    {
        "scenario": "product_search_by_category",
        "messages": [
            "Show me all your tablets.",
            "What are the prices?",
        ]
    },
    {
        "scenario": "product_comparison",
        "messages": [
            "Compare the features of your smartphones and tablets.",
            "Which one is better for watching videos?",
        ]
    },
    {
        "scenario": "product_availability",
        "messages": [
            "Do you have wireless headphones in stock?",
            "When will they be available?",
        ]
    },
    {
        "scenario": "product_recommendation_budget",
        "messages": [
            "I have a budget of $500. What can I buy?",
            "What's the best value for money?",
        ]
    },
    {
        "scenario": "product_details_specific",
        "messages": [
            "Tell me everything about the gaming laptops.",
            "What accessories come with them?",
        ]
    },
    {
        "scenario": "multi_product_query",
        "messages": [
            "I need a smartphone, a laptop, and headphones. What do you recommend?",
            "Can you create a bundle deal?",
        ]
    },
    {
        "scenario": "product_features_technical",
        "messages": [
            "What are the technical specifications of your smart TVs?",
            "What connectivity options do they support?",
        ]
    },
    {
        "scenario": "product_search_by_use_case",
        "messages": [
            "I need a device for video editing. What should I get?",
            "What about for online meetings?",
        ]
    },
    {
        "scenario": "product_inquiry_accessories",
        "messages": [
            "What accessories do you have for smartphones?",
            "Do you have protective cases?",
        ]
    },
    {
        "scenario": "general_store_information",
        "messages": [
            "What products do you sell?",
            "What are your return policies?",
        ]
    },
]
