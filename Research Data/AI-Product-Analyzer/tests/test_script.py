"""
Test script for AI-Product-Analyzer repository.

This file defines the test inputs that will be used for both
'previous' and 'updated' versions of the repository.

The test inputs must be defined as TEST_INPUTS - a list of scenarios.
"""

# Test scenarios for product research agent (market analysis, purchase likelihood)
TEST_INPUTS = [
    {
        "scenario": "product_specification_query",
        "messages": [
            "mobile with 8 gb ram, hd camera at 40000k how likely someone will buy this",
            "What is the market analysis for this product?",
        ]
    },
    {
        "scenario": "laptop_research",
        "messages": [
            "laptop with 16gb ram under 50000",
            "What are the purchase likelihood factors?",
        ]
    },
    {
        "scenario": "wireless_headphones",
        "messages": [
            "wireless headphones with noise cancellation",
            "Analyze the market trends and consumer interest",
        ]
    },
    {
        "scenario": "smartphone_market",
        "messages": [
            "smartphone with 128GB storage, 5G support, under 30000",
            "What is the purchase likelihood and market sentiment?",
        ]
    },
    {
        "scenario": "gaming_laptop",
        "messages": [
            "gaming laptop with RTX 4060, 16GB RAM, 1TB SSD",
            "How likely are gamers to purchase this configuration?",
        ]
    },
    {
        "scenario": "smartwatch_analysis",
        "messages": [
            "smartwatch with heart rate monitor, GPS, and 7-day battery life",
            "What is the market analysis for fitness-focused smartwatches?",
        ]
    },
    {
        "scenario": "tablet_research",
        "messages": [
            "tablet with 10-inch display, 64GB storage, under 20000",
            "Analyze purchase likelihood for budget tablets",
        ]
    },
    {
        "scenario": "camera_equipment",
        "messages": [
            "DSLR camera with 24MP sensor, 4K video recording",
            "What are the market trends for professional cameras?",
        ]
    },
    {
        "scenario": "earbuds_market",
        "messages": [
            "true wireless earbuds with ANC, 30-hour battery, under 5000",
            "How likely are consumers to buy premium budget earbuds?",
        ]
    },
    {
        "scenario": "monitor_specifications",
        "messages": [
            "27-inch 4K monitor with 144Hz refresh rate, HDR support",
            "What is the purchase likelihood for high-end monitors?",
        ]
    },
    {
        "scenario": "keyboard_analysis",
        "messages": [
            "mechanical keyboard with RGB lighting, wireless, under 8000",
            "Analyze market trends for gaming keyboards",
        ]
    },
    {
        "scenario": "storage_device_research",
        "messages": [
            "1TB external SSD with USB-C, portable, under 10000",
            "What is the consumer interest in portable storage solutions?",
        ]
    },
]
