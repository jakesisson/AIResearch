"""
Test script for agents repository.

This file defines the test inputs that will be used for both
'previous' and 'updated' versions of the repository.

The test inputs must be defined as TEST_INPUTS - a list of scenarios.
"""

# Test scenarios for multi-agent library (task management, parallel processing, conditional routing)
TEST_INPUTS = [
    {
        "scenario": "simple_task_assignment",
        "messages": [
            "I need to analyze market trends for the tech industry",
            "Break this down into tasks and assign them to appropriate agents",
        ]
    },
    {
        "scenario": "parallel_processing",
        "messages": [
            "Research three different topics simultaneously: AI ethics, quantum computing, and blockchain",
            "Aggregate the results from all three research tasks",
        ]
    },
    {
        "scenario": "conditional_routing",
        "messages": [
            "I have a technical question about database optimization",
            "Route this to the appropriate expert agent",
        ]
    },
    {
        "scenario": "multi_agent_coordination",
        "messages": [
            "Coordinate a team to analyze a business problem from financial, technical, and market perspectives",
            "Provide a comprehensive summary of all analyses",
        ]
    },
    {
        "scenario": "task_breakdown",
        "messages": [
            "I need to build a web application. Break this into development tasks",
            "Assign each task to the most suitable agent",
        ]
    },
    {
        "scenario": "sequential_workflow",
        "messages": [
            "First research the topic, then analyze the data, and finally create a report",
            "Execute these steps in sequence",
        ]
    },
    {
        "scenario": "fan_out_fan_in",
        "messages": [
            "Distribute this analysis task to three different specialist agents",
            "Collect and synthesize their responses",
        ]
    },
    {
        "scenario": "dynamic_handoff",
        "messages": [
            "This query requires both technical and business expertise",
            "Route it through the appropriate chain of agents",
        ]
    },
    {
        "scenario": "complex_multi_agent",
        "messages": [
            "I need a comprehensive analysis involving research, data processing, and report generation",
            "Coordinate multiple agents to complete this workflow",
        ]
    },
    {
        "scenario": "task_prioritization",
        "messages": [
            "I have multiple tasks with different priorities",
            "Assign and execute them in order of importance",
        ]
    },
    {
        "scenario": "agent_specialization",
        "messages": [
            "I need help with a coding problem",
            "Route this to the technical expert agent",
        ]
    },
    {
        "scenario": "parallel_aggregation",
        "messages": [
            "Run three independent analyses in parallel",
            "Combine the results into a single comprehensive report",
        ]
    },
]
