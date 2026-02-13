"""
Test script for JAA repository.

This file defines the test inputs that will be used for both
'previous' and 'updated' versions of the repository.

The test inputs must be defined as TEST_INPUTS - a list of scenarios.
"""

# Test scenarios for JAA security vulnerability analysis system
TEST_INPUTS = [
    {
        "scenario": "vulnerability_check",
        "messages": [
            "Check this code for security vulnerabilities: def login(username, password): return username == 'admin' and password == 'password123'",
            "What type of vulnerability is this?",
        ]
    },
    {
        "scenario": "sql_injection_check",
        "messages": [
            "Analyze this SQL query: SELECT * FROM users WHERE id = user_input",
            "Is this vulnerable to SQL injection?",
        ]
    },
    {
        "scenario": "buffer_overflow_check",
        "messages": [
            "Check this C code: char buffer[10]; strcpy(buffer, user_input);",
            "What security issues does this have?",
        ]
    },
    {
        "scenario": "xss_vulnerability",
        "messages": [
            "Review this JavaScript: document.getElementById('output').innerHTML = userInput;",
            "What vulnerabilities are present?",
        ]
    },
    {
        "scenario": "authentication_bypass",
        "messages": [
            "Check this authentication code: if (user.role == 'admin'): grant_access()",
            "What security problems exist?",
        ]
    },
    {
        "scenario": "path_traversal",
        "messages": [
            "Analyze: file = open('/data/' + filename, 'r')",
            "Is this vulnerable to path traversal?",
        ]
    },
    {
        "scenario": "command_injection",
        "messages": [
            "Check: os.system('ls ' + user_input)",
            "What security risks does this pose?",
        ]
    },
    {
        "scenario": "crypto_weakness",
        "messages": [
            "Review: password_hash = md5(password)",
            "What cryptographic issues are present?",
        ]
    },
    {
        "scenario": "race_condition",
        "messages": [
            "Analyze: if not file.exists(): create_file()",
            "What race conditions exist?",
        ]
    },
    {
        "scenario": "hardcoded_secrets",
        "messages": [
            "Check: api_key = 'sk-1234567890abcdef'",
            "What security problems does this have?",
        ]
    },
    {
        "scenario": "insecure_deserialization",
        "messages": [
            "Review: obj = pickle.loads(user_data)",
            "What vulnerabilities are in this code?",
        ]
    },
    {
        "scenario": "rag_vulnerability_search",
        "messages": [
            "Search for information about SQL injection vulnerabilities with rag",
            "What are the latest SQL injection attack vectors?",
        ]
    },
]
