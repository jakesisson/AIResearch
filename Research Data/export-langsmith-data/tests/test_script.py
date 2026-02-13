"""
Test script for export-langsmith-data repository.

This file defines the test inputs that will be used for both
'previous' and 'updated' versions of the repository.

The test inputs must be defined as TEST_INPUTS - a list of scenarios.

Note: This project analyzes LangSmith traces and does not make
direct LLM API calls. Test scenarios represent trace analysis operations.
Azure OpenAI pricing is used for cost calculations from token usage data.
"""

# Test scenarios for LangSmith trace export and analysis
TEST_INPUTS = [
    {
        "scenario": "export_small_project",
        "messages": [
            "Export 50 traces from project 'test-project'",
            "Analyze latency distribution and calculate costs with Azure OpenAI pricing",
        ]
    },
    {
        "scenario": "export_medium_project",
        "messages": [
            "Export 150 traces from project 'production-workflows'",
            "Identify performance bottlenecks and estimate costs",
        ]
    },
    {
        "scenario": "export_large_project",
        "messages": [
            "Export 500 traces from project 'large-scale-testing'",
            "Calculate workflow duration statistics and total costs",
        ]
    },
    {
        "scenario": "latency_analysis",
        "messages": [
            "Analyze latency distribution for exported traces",
            "Identify workflows outside the 7-23 minute range",
        ]
    },
    {
        "scenario": "bottleneck_identification",
        "messages": [
            "Identify the primary bottleneck in workflow execution",
            "List the top 3 slowest nodes",
        ]
    },
    {
        "scenario": "parallel_execution_verification",
        "messages": [
            "Verify if validators execute in parallel",
            "Calculate time savings from parallelization",
        ]
    },
    {
        "scenario": "cost_analysis_azure_openai",
        "messages": [
            "Calculate costs using Azure OpenAI GPT-4 pricing",
            "Generate cost breakdown by node type",
        ]
    },
    {
        "scenario": "cost_analysis_gpt35_turbo",
        "messages": [
            "Calculate costs using Azure OpenAI GPT-3.5 Turbo pricing",
            "Compare with GPT-4 costs",
        ]
    },
    {
        "scenario": "failure_pattern_analysis",
        "messages": [
            "Analyze failure patterns in workflows",
            "Identify retry sequences and error types",
        ]
    },
    {
        "scenario": "cache_effectiveness",
        "messages": [
            "Calculate cache hit rate from trace data",
            "Estimate cost savings from cache usage",
        ]
    },
    {
        "scenario": "scaling_projections",
        "messages": [
            "Project costs at 10x, 100x, and 1000x scale",
            "Estimate monthly costs at different scales",
        ]
    },
    {
        "scenario": "comprehensive_analysis",
        "messages": [
            "Export 200 traces and perform full analysis",
            "Generate latency, bottleneck, cost, and failure reports",
        ]
    },
]
