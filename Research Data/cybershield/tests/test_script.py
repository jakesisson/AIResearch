"""
Test script for cybershield repository.

This file defines the test inputs that will be used for both
'previous' and 'updated' versions of the repository.

The test inputs must be defined as TEST_INPUTS - a list of scenarios.
"""

# Test scenarios for cybersecurity multi-agent system
TEST_INPUTS = [
    {
        "scenario": "ip_threat_analysis",
        "messages": [
            "Analyze this IP address for security threats: 192.168.1.100",
            "What are the risk indicators?",
        ]
    },
    {
        "scenario": "pii_detection_text",
        "messages": [
            "Check this text for PII: My email is john.doe@example.com and my SSN is 123-45-6789. Call me at 555-1234.",
            "What PII was detected and how should it be handled?",
        ]
    },
    {
        "scenario": "ioc_extraction_log",
        "messages": [
            "Extract IOCs from this log: Connection from 10.0.0.5 to malicious-domain.com at 2024-01-15 14:30:22. Hash: a1b2c3d4e5f6",
            "What indicators of compromise were found?",
        ]
    },
    {
        "scenario": "domain_reputation_check",
        "messages": [
            "Check the reputation of example-suspicious-domain.com",
            "Is this domain safe?",
        ]
    },
    {
        "scenario": "multi_ioc_analysis",
        "messages": [
            "Analyze these IOCs: IP 203.0.113.42, domain bad-actor.net, hash md5:5d41402abc4b2a76b9719d911017c592",
            "Provide a comprehensive threat assessment.",
        ]
    },
    {
        "scenario": "log_file_parsing",
        "messages": [
            "Parse this log file for security events: [2024-01-15 10:30:15] Failed login attempt from 192.168.1.50 user: admin [2024-01-15 10:31:22] Successful login from 10.0.0.1 user: admin",
            "What security events were detected?",
        ]
    },
    {
        "scenario": "email_phishing_analysis",
        "messages": [
            "Analyze this email for phishing indicators: Subject: Urgent Action Required. From: support@bank-security.com. Link: http://malicious-site.com/verify",
            "Is this a phishing attempt?",
        ]
    },
    {
        "scenario": "network_traffic_analysis",
        "messages": [
            "Analyze this network traffic: Source IP 172.16.0.5 connecting to external IP 198.51.100.42 on port 443. Protocol: HTTPS. Duration: 2 hours.",
            "What are the security implications?",
        ]
    },
    {
        "scenario": "file_hash_verification",
        "messages": [
            "Check this file hash against threat intelligence: SHA256: e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
            "Is this file malicious?",
        ]
    },
    {
        "scenario": "combined_threat_assessment",
        "messages": [
            "Perform a comprehensive security analysis: IP 203.0.113.10, domain suspicious-site.org, email contains PII (john@example.com, SSN: 123-45-6789)",
            "Provide a complete threat assessment with recommendations.",
        ]
    },
    {
        "scenario": "url_analysis",
        "messages": [
            "Analyze this URL for security risks: https://suspicious-domain.com/download/file.exe?token=abc123",
            "What security concerns exist?",
        ]
    },
    {
        "scenario": "security_incident_response",
        "messages": [
            "Security incident detected: Multiple failed login attempts from 192.168.1.100, followed by successful login. User accessed sensitive files. Log entry: [2024-01-15 15:30:00] File access: /confidential/data.txt",
            "What is the severity and recommended response?",
        ]
    },
]
