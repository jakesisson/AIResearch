"""
Test script for ai-resume-agent repository.

This file defines the test inputs that will be used for both
'previous' and 'updated' versions of the repository.

The test inputs must be defined as TEST_INPUTS - a list of scenarios.
"""

# Test scenarios for professional portfolio chatbot (experience, skills, projects)
TEST_INPUTS = [
    {
        "scenario": "technical_skills_inquiry",
        "messages": [
            "What programming languages and frameworks are you experienced with?",
            "Can you tell me about your Java and Spring Boot experience?",
        ]
    },
    {
        "scenario": "project_experience",
        "messages": [
            "What projects have you worked on involving AI or machine learning?",
            "Tell me more about your experience with modernizing legacy systems",
        ]
    },
    {
        "scenario": "behavioral_question",
        "messages": [
            "Describe a situation where you acted as a bridge between business and technology",
            "Can you give me an example of a technical challenge you overcame?",
        ]
    },
    {
        "scenario": "professional_conditions",
        "messages": [
            "What are your salary expectations?",
            "What is your availability for interviews?",
        ]
    },
    {
        "scenario": "location_and_work",
        "messages": [
            "Where are you located?",
            "Are you open to remote work?",
        ]
    },
    {
        "scenario": "motivation_question",
        "messages": [
            "What motivates you in your work?",
            "What are you looking for in your next role?",
        ]
    },
    {
        "scenario": "aws_experience",
        "messages": [
            "Do you have experience with AWS?",
            "What AWS services have you used in production?",
        ]
    },
    {
        "scenario": "devops_skills",
        "messages": [
            "What is your experience with DevOps and CI/CD?",
            "Have you worked with containerization technologies?",
        ]
    },
    {
        "scenario": "product_engineering",
        "messages": [
            "What is your experience as a Product Engineer?",
            "How do you balance technical requirements with business needs?",
        ]
    },
    {
        "scenario": "ai_ml_projects",
        "messages": [
            "Tell me about your AI and machine learning projects",
            "What frameworks and tools have you used for ML projects?",
        ]
    },
    {
        "scenario": "team_collaboration",
        "messages": [
            "How do you work in a team environment?",
            "Describe your experience leading technical teams",
        ]
    },
    {
        "scenario": "technology_gaps",
        "messages": [
            "Do you have experience with C# or .NET?",
            "What about Ruby or Go programming?",
        ]
    },
]
