# Product Context: AI-Powered Resume Generator

## Problem Statement
Creating professional resumes from LinkedIn data is time-consuming and often requires manual reformatting. Users need a tool that can:
- Extract relevant information from LinkedIn exports
- Structure data according to professional resume standards
- Generate multiple output formats (JSON, HTML, PDF)
- Maintain consistency across different resume versions

## User Stories

### Primary User: Job Seeker
**As a job seeker, I want to:**
- Upload my LinkedIn export and get a professional resume instantly
- Have my experience and skills properly categorized and formatted
- Generate multiple resume formats for different applications
- Maintain consistency between my LinkedIn profile and resume

**Acceptance Criteria:**
- CLI tool accepts LinkedIn ZIP export
- Generates structured JSON Resume format
- Outputs professional HTML and PDF versions
- Preserves all relevant experience and skills

### Secondary User: Recruiter/HR
**As a recruiter, I want to:**
- Receive standardized resume formats from candidates
- Have consistent data structure for parsing and analysis
- Access both human-readable (HTML/PDF) and machine-readable (JSON) formats

## Value Proposition
- **Time Savings**: Automate manual resume creation from LinkedIn data
- **Consistency**: Ensure LinkedIn profile and resume are aligned
- **Professional Quality**: AI-powered content structuring and formatting
- **Flexibility**: Multiple output formats for different use cases
- **Local-First**: Privacy-focused, no data sent to external services (except OpenAI API)

## Key Features
1. **LinkedIn Data Extraction**: Parse CSV and HTML files from LinkedIn exports
2. **AI-Powered Structuring**: Use ChatGPT 4o to organize and format content
3. **JSON Resume Compliance**: Generate standard JSON Resume format
4. **Professional Rendering**: Use established themes for consistent output
5. **Multi-Format Export**: JSON, HTML, and PDF outputs
6. **Extensible Architecture**: Ready for future UI and cover letter features

## Success Metrics
- **Accuracy**: AI correctly structures LinkedIn data into resume format
- **Completeness**: All relevant experience and skills are preserved
- **Professional Quality**: Output meets industry resume standards
- **Performance**: Fast processing of LinkedIn exports
- **Reliability**: Consistent output across different LinkedIn export formats 