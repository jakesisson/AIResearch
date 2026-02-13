"""
Test script for ecommerce-chat repository.

This file defines the test inputs that will be used for both
'previous' and 'updated' versions of the repository.

The test inputs must be defined as TEST_INPUTS - a list of scenarios.
"""

# Test scenarios for e-commerce chatbot
TEST_INPUTS = [
    {
        "scenario": "product_search_smartphone",
        "messages": [
            "I'm looking for a smartphone with good camera quality.",
            "What are the best options under $500?",
        ]
    },
    {
        "scenario": "product_comparison",
        "messages": [
            "Compare the features of gaming laptops and regular laptops.",
            "Which one is better for video editing?",
        ]
    },
    {
        "scenario": "product_recommendation",
        "messages": [
            "I need a tablet for reading and note-taking.",
            "What would you recommend?",
        ]
    },
    {
        "scenario": "price_inquiry",
        "messages": [
            "What is the price of the latest smart TV models?",
            "Are there any discounts available?",
        ]
    },
    {
        "scenario": "product_specifications",
        "messages": [
            "Tell me about the specifications of the gaming headphones.",
            "What is the battery life?",
        ]
    },
    {
        "scenario": "availability_check",
        "messages": [
            "Is the iPhone 15 Pro available in stock?",
            "When will it be available if not?",
        ]
    },
    {
        "scenario": "accessory_recommendation",
        "messages": [
            "What accessories do you recommend for a new laptop?",
            "Which ones are essential?",
        ]
    },
    {
        "scenario": "multi_product_query",
        "messages": [
            "I need a smartphone, a tablet, and wireless earbuds.",
            "Can you suggest a bundle or compatible products?",
        ]
    },
    {
        "scenario": "technical_support",
        "messages": [
            "My smart TV is not connecting to WiFi. What should I do?",
            "Are there troubleshooting steps I can follow?",
        ]
    },
    {
        "scenario": "warranty_inquiry",
        "messages": [
            "What is the warranty period for tablets?",
            "What does the warranty cover?",
        ]
    },
    {
        "scenario": "product_filtering",
        "messages": [
            "Show me notebooks with at least 16GB RAM and SSD storage.",
            "Filter by price range $800-$1200.",
        ]
    },
    {
        "scenario": "return_policy",
        "messages": [
            "What is your return policy?",
            "How long do I have to return a product?",
        ]
    },
]
