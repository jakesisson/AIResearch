"""
Test script for analytics_ai repository.

This file defines the test inputs that will be used for both
'previous' and 'updated' versions of the repository.

The test inputs must be defined as TEST_INPUTS - a list of scenarios.
"""

# Test scenarios for data analysis chatbot (SQL generation, visualization, interpretation)
TEST_INPUTS = [
    {
        "scenario": "sales_by_category",
        "messages": [
            "Show me the total sales by category",
            "Visualize this data as a bar chart",
        ]
    },
    {
        "scenario": "date_specific_query",
        "messages": [
            "What are the sales by product for May 1, 2024?",
            "Display this data as a time series graph",
        ]
    },
    {
        "scenario": "product_sales_total",
        "messages": [
            "Calculate the total sales for bread",
            "Interpret this result",
        ]
    },
    {
        "scenario": "user_demographics",
        "messages": [
            "List all users with their names and prefectures",
            "Aggregate the number of users by prefecture and create a graph",
        ]
    },
    {
        "scenario": "age_filtered_query",
        "messages": [
            "Extract user names for users 30 years old and above",
            "Visualize the distribution of this age group",
        ]
    },
    {
        "scenario": "product_listing",
        "messages": [
            "Display the list of all products",
            "Aggregate the number of products by category",
        ]
    },
    {
        "scenario": "category_filter",
        "messages": [
            "Extract products in the beverage category",
            "Calculate the average price for these products",
        ]
    },
    {
        "scenario": "rating_analysis",
        "messages": [
            "Calculate the average rating for all products",
            "Display the rating distribution as a histogram",
        ]
    },
    {
        "scenario": "review_extraction",
        "messages": [
            "Extract comments from reviews with a rating of 5",
            "Analyze the common themes in these reviews",
        ]
    },
    {
        "scenario": "time_series_analysis",
        "messages": [
            "Show the sales trend for the past 3 months as a time series",
            "Analyze and interpret the trend",
        ]
    },
    {
        "scenario": "data_processing",
        "messages": [
            "Add a profit margin column to the sales data",
            "Display the top 10 products with the highest profit margin",
        ]
    },
    {
        "scenario": "multi_step_analysis",
        "messages": [
            "First get sales by category, then visualize it, and finally interpret it",
            "Provide business insights from this analysis result",
        ]
    },
]
