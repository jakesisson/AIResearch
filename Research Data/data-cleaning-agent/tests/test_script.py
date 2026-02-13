"""
Test script for data-cleaning-agent repository.

This file defines the test inputs that will be used for both
'previous' and 'updated' versions of the repository.

The test inputs must be defined as TEST_INPUTS - a list of scenarios.
"""

# Test scenarios for data cleaning agent system
TEST_INPUTS = [
    {
        "scenario": "missing_values_handling",
        "messages": [
            "Clean this dataset: Handle missing values in the 'age' and 'salary' columns",
            "What strategy was used for each column?",
        ]
    },
    {
        "scenario": "duplicate_removal",
        "messages": [
            "Remove duplicate records from the dataset while keeping the first occurrence",
            "How many duplicates were found and removed?",
        ]
    },
    {
        "scenario": "outlier_detection",
        "messages": [
            "Detect and flag outliers in the 'price' column using IQR method",
            "What outliers were identified?",
        ]
    },
    {
        "scenario": "date_format_standardization",
        "messages": [
            "Standardize date formats in the 'date' column to YYYY-MM-DD format",
            "What date format issues were found?",
        ]
    },
    {
        "scenario": "data_type_conversion",
        "messages": [
            "Convert the 'price' column from string to numeric, handling invalid entries",
            "How many entries were successfully converted?",
        ]
    },
    {
        "scenario": "text_normalization",
        "messages": [
            "Normalize text in the 'name' column: convert to lowercase and remove extra spaces",
            "What normalization operations were performed?",
        ]
    },
    {
        "scenario": "comprehensive_cleaning",
        "messages": [
            "Perform comprehensive data cleaning: handle missing values, remove duplicates, detect outliers, and standardize formats",
            "Provide a summary of all cleaning operations performed",
        ]
    },
    {
        "scenario": "email_validation",
        "messages": [
            "Validate and clean email addresses in the 'email' column",
            "How many invalid email addresses were found?",
        ]
    },
    {
        "scenario": "phone_number_formatting",
        "messages": [
            "Standardize phone numbers in the 'phone' column to international format",
            "What formatting issues were corrected?",
        ]
    },
    {
        "scenario": "numeric_range_validation",
        "messages": [
            "Validate that 'age' values are between 0 and 120, and 'score' values are between 0 and 100",
            "What values were flagged as out of range?",
        ]
    },
    {
        "scenario": "categorical_standardization",
        "messages": [
            "Standardize categorical values in 'status' column: normalize case and handle variations (e.g., 'active', 'Active', 'ACTIVE')",
            "What categorical inconsistencies were found?",
        ]
    },
    {
        "scenario": "multi_column_validation",
        "messages": [
            "Validate data consistency: ensure 'end_date' is after 'start_date' for all records",
            "How many records have invalid date ranges?",
        ]
    },
]
