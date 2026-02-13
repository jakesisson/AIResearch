"""
Test script for aruizca-resume repository.

This file defines the test inputs that will be used for both
'previous' and 'updated' versions of the repository.

The test inputs must be defined as TEST_INPUTS - a list of scenarios.
"""

# Test scenarios for resume generator (LinkedIn data processing, resume generation, cover letter)
TEST_INPUTS = [
    {
        "scenario": "resume_generation_basic",
        "messages": [
            "Generate a resume from LinkedIn export data",
            "Create a professional JSON Resume format",
        ]
    },
    {
        "scenario": "cover_letter_generation",
        "messages": [
            "Generate a cover letter for a software engineering position",
            "Tailor it to emphasize my technical skills and experience",
        ]
    },
    {
        "scenario": "linkedin_parsing",
        "messages": [
            "Parse LinkedIn export ZIP file and extract profile information",
            "Structure the data according to JSON Resume schema",
        ]
    },
    {
        "scenario": "experience_formatting",
        "messages": [
            "Format my work experience from LinkedIn data",
            "Highlight achievements and responsibilities",
        ]
    },
    {
        "scenario": "skills_extraction",
        "messages": [
            "Extract and categorize skills from LinkedIn profile",
            "Organize them by proficiency level",
        ]
    },
    {
        "scenario": "education_processing",
        "messages": [
            "Process education history from LinkedIn export",
            "Format degrees and certifications properly",
        ]
    },
    {
        "scenario": "cover_letter_customization",
        "messages": [
            "Generate a cover letter for a product engineering role",
            "Customize it based on the job description",
        ]
    },
    {
        "scenario": "resume_multiple_formats",
        "messages": [
            "Generate resume in JSON, HTML, and PDF formats",
            "Ensure consistency across all formats",
        ]
    },
    {
        "scenario": "professional_summary",
        "messages": [
            "Create a professional summary from LinkedIn profile data",
            "Highlight key achievements and expertise",
        ]
    },
    {
        "scenario": "project_highlighting",
        "messages": [
            "Extract and format project information from LinkedIn",
            "Emphasize technical achievements and impact",
        ]
    },
    {
        "scenario": "cover_letter_job_matching",
        "messages": [
            "Generate a cover letter that matches job requirements",
            "Align my experience with the position description",
        ]
    },
    {
        "scenario": "resume_optimization",
        "messages": [
            "Optimize resume content for ATS systems",
            "Ensure proper keyword usage and formatting",
        ]
    },
]
