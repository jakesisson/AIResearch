# AI-Powered Resume Generator

A local-first, CLI-based resume generator that transforms LinkedIn export data into professional resumes using AI. Built with Node.js + TypeScript + ESM, following DDD and Hexagonal Architecture principles.

## 🏗️ Monorepo Structure

This project is organized as a **Turborepo monorepo** with the following packages:

```
aruizca-resume/
├── packages/
│   ├── core/           # Resume and cover letter generation
│   └── web-ui/         # Web interface (Milestone 4)
├── turbo.json          # Turborepo configuration
└── pnpm-workspace.yaml # pnpm workspace configuration
```

### 📦 Packages

- **`@aruizca-resume/core`**: Core functionality for resume and cover letter generation
- **`@aruizca-resume/web-ui`**: Web UI for cover letter generation (coming in Milestone 4)

## Features

- **LinkedIn Integration**: Parse LinkedIn export ZIP files (CSV + HTML)
- **AI-Powered**: Uses OpenAI (ChatGPT 4o) for structured content generation
- **Multiple Formats**: Generates JSON Resume, HTML, and PDF outputs
- **Professional Themes**: Uses `jsonresume-theme-even-crewshin` for rendering
- **Date-Stamped Output**: Files named with generation date (`resume-yyyymmdd.*`)
- **Extensible Architecture**: Ready for future UI and cover letter features
- **Monorepo**: Organized with Turborepo for scalability

## Quick Start

### Prerequisites
- Node.js 18+ 
- pnpm (recommended) or npm
- OpenAI API key

### Setup
1. **Clone and install**:
```bash
git clone https://github.com/aruizca/aruizca-resume.git
cd aruizca-resume
pnpm install
```

2. **Configure environment**:
```bash
cp env.sample .env
# Edit .env and add your OpenAI API key
```

3. **Prepare LinkedIn export**:
- Export your data from LinkedIn (Settings → Data Privacy → Get a copy)
- Extract the ZIP to `linkedin-export/extracted/`

4. **Generate resume**:
```bash
pnpm start
```

The script will automatically use the newest LinkedIn export in the `linkedin-export/` folder. You can also specify a custom path:
```bash
pnpm start /path/to/custom/extracted/directory
```

**Performance Features:**
- **OpenAI Caching**: Responses are cached for 8 hours to reduce API costs
- **Force Refresh**: Use `--force-refresh` to bypass cache and get fresh AI responses
```bash
pnpm start --force-refresh
```

5. **Generate PDF from existing HTML** (faster alternative):
```bash
pnpm pdf output/resume-20250805.html
```

This skips LinkedIn parsing and AI generation, using only the PDF export pipeline.

### Cover Letter Generation

Generate personalized cover letters using your JSON resume and a job posting URL:

```bash
# Generate cover letter
pnpm cover-letter ./resume/resume-20250807.json https://example.com/job-posting

# The cover letter will be saved to: output/cover-letter-20250807.md
```

## Development

### Monorepo Commands

```bash
# Build all packages
pnpm build

# Run tests across all packages
pnpm test

# Development mode (watch for changes)
pnpm dev

# Clean all build artifacts
pnpm clean

# Lint all packages
pnpm lint
```

### Package-Specific Commands

```bash
# Core package only
pnpm --filter @aruizca-resume/core build
pnpm --filter @aruizca-resume/core test

# Web UI package only
pnpm --filter @aruizca-resume/web-ui build
pnpm --filter @aruizca-resume/web-ui dev
```

### Environment Variables
```bash
OPENAI_API_KEY=your-openai-api-key-here
```

### Output Files
- `output/resume-yyyymmdd.json` - JSON Resume format
- `output/resume-yyyymmdd.html` - Rendered HTML
- `output/resume-yyyymmdd.pdf` - PDF export

## Architecture

### Core Package (`@aruizca-resume/core`)
```
packages/core/
├── src/
│   ├── main/
│   │   ├── resume-generator.ts      # CLI entry point
│   │   ├── cover-letter-generator.ts # Cover letter CLI
│   │   ├── resume-generator/        # Resume generation context
│   │   ├── cover-letter-generator/  # Cover letter generation context
│   │   └── shared/                  # Shared utilities
│   └── test/                        # Unit tests
└── dist/                            # Build output
```

### Web UI Package (`@aruizca-resume/web-ui`)
```
packages/web-ui/
├── src/                             # Web UI source code
├── public/                          # Static assets
└── dist/                            # Build output
```

## Current Status

### ✅ Completed
- Project setup with DDD + Hexagonal Architecture
- OpenAI API integration (ChatGPT 4o)
- HTML rendering with JSON Resume theme
- Date-stamped file naming
- AI-powered skill categorization
- Cover letter generation with job scraping
- Monorepo setup with Turborepo
- pnpm workspace configuration

### 🔄 In Progress
- Web UI development (Milestone 4)

### 📋 Planned
- Web UI for cover letter generation
- Advanced customization options
- Multiple theme support

## CI/CD

### GitHub Actions

This project uses GitHub Actions for automated testing and quality assurance:

- **Test Pipeline**: Runs on every push and pull request
  - Unit tests across Node.js 18.x and 20.x
  - TypeScript compilation checks
  - Build verification
  - Unused dependency detection

- **Security Scanning**: Weekly security audits and vulnerability checks

- **Dependency Management**: Weekly dependency updates and unused dependency detection

## Dependencies

### Core
- **Node.js + TypeScript + ESM**: Modern JavaScript development
- **esbuild**: Fast TypeScript bundler
- **OpenAI API**: ChatGPT 4o for content generation
- **Turborepo**: Monorepo build system
- **pnpm**: Package manager

### Data Processing
- **papaparse**: CSV parsing for LinkedIn exports
- **adm-zip**: ZIP file extraction
- **cheerio**: HTML parsing

### Output Generation
- **jsonresume-theme-even-crewshin**: Professional HTML theme
- **Playwright**: PDF export (implemented)

## License

MIT 