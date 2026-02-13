# Project Brief: AI-Powered Resume Generator

## Project Goals
Build a local-first resume generator tool that transforms LinkedIn export data into professional resumes using AI.

## Core Requirements
- **Input**: LinkedIn export ZIP file containing CSV and HTML profile data
- **Output**: Three formats generated to `/output` directory:
  - `resume.json` (JSON Resume format)
  - `resume.html` (rendered HTML)
  - `resume.pdf` (PDF export)
- **AI Integration**: LangChain.js + OpenAI (ChatGPT 4o) for structured content generation
- **Theme**: `jsonresume-theme-even-crewshin` for HTML rendering
- **Architecture**: DDD + Hexagonal Architecture ready for future UI/cover letter features

## Technical Stack
- **Runtime**: Node.js + TypeScript + ESM
- **Build**: esbuild for bundling
- **AI**: OpenAI API (ChatGPT 4o) via LangChain.js
- **Parsing**: adm-zip, papaparse, cheerio for LinkedIn data extraction
- **PDF**: Playwright for HTML-to-PDF conversion
- **Theme**: jsonresume-theme-even-crewshin

## Project Scope
### Phase 1 (Current): CLI-First Tool
- Simple CLI script accepting LinkedIn ZIP as input
- Hardcoded theme selection
- Basic file output to `/output` directory
- No UI or cover letter features

### Future Phases
- Web UI for resume editing
- Cover letter generation
- Multiple theme support
- Advanced customization options

## Success Criteria
- Successfully parse LinkedIn export data
- Generate structured JSON Resume format
- Render professional HTML output
- Export clean PDF version
- Maintain clean, extensible architecture 