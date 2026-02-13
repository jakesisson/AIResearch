"""
Test script for aigie-io repository.

This file defines the test inputs that will be used for both
'previous' and 'updated' versions of the repository.

The test inputs must be defined as TEST_INPUTS - a list of scenarios.
"""

# Test scenarios for error detection and remediation (runtime errors, API errors, state errors)
TEST_INPUTS = [
    {
        "scenario": "runtime_exception",
        "messages": [
            "Simulate a runtime exception in a LangChain agent",
            "How does the error detection system classify this error?",
        ]
    },
    {
        "scenario": "api_rate_limit",
        "messages": [
            "Trigger an API rate limit error",
            "What remediation strategy is suggested?",
        ]
    },
    {
        "scenario": "state_transition_error",
        "messages": [
            "Cause an invalid state transition in a LangGraph workflow",
            "How is this state error detected and handled?",
        ]
    },
    {
        "scenario": "timeout_error",
        "messages": [
            "Simulate a timeout in an LLM API call",
            "What retry mechanism is activated?",
        ]
    },
    {
        "scenario": "authentication_error",
        "messages": [
            "Trigger an authentication failure with an external API",
            "How does the system classify and remediate this error?",
        ]
    },
    {
        "scenario": "memory_overflow",
        "messages": [
            "Cause a memory overflow error in the agent",
            "What monitoring and remediation actions are taken?",
        ]
    },
    {
        "scenario": "prompt_injection_detection",
        "messages": [
            "Detect a prompt injection attempt",
            "What remediation strategy is applied?",
        ]
    },
    {
        "scenario": "data_corruption",
        "messages": [
            "Simulate data corruption in agent state",
            "How is this state error detected and fixed?",
        ]
    },
    {
        "scenario": "network_connectivity",
        "messages": [
            "Trigger a network connectivity error",
            "What error classification and retry logic is used?",
        ]
    },
    {
        "scenario": "invalid_tool_call",
        "messages": [
            "Cause an invalid tool call in a LangChain agent",
            "How does the error detector handle tool-related errors?",
        ]
    },
    {
        "scenario": "performance_degradation",
        "messages": [
            "Simulate slow execution in an agent workflow",
            "What performance monitoring alerts are triggered?",
        ]
    },
    {
        "scenario": "intelligent_retry",
        "messages": [
            "Trigger an error that requires intelligent retry",
            "How does the system enhance context and retry the operation?",
        ]
    },
]
