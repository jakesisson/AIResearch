# Tech Context: Technologies & Setup

## Technology Stack

### Core Runtime
- **Node.js**: JavaScript runtime (v18+ recommended)
- **TypeScript**: Type-safe JavaScript development
- **ESM**: ES Modules for modern JavaScript
- **esbuild**: Fast TypeScript bundler

### AI & Language Processing
- **OpenAI API**: ChatGPT 4o for content generation
- **LangChain.js**: LLM integration framework
- **Prompt Engineering**: Externalized templates for consistent AI output

### Data Processing
- **adm-zip**: ZIP file extraction
- **papaparse**: CSV parsing for LinkedIn exports
- **cheerio**: HTML parsing for LinkedIn profile data

### Resume Generation
- **JSON Resume**: Standard resume format specification
- **jsonresume-theme-even-crewshin**: Professional HTML theme
- **Playwright**: HTML-to-PDF conversion (implemented)

### Development Tools
- **Git**: Version control
- **pnpm**: Package management (primary)
- **Turbo**: Monorepo build system
- **Vite**: Fast development server with HMR for web-ui
- **concurrently**: Run multiple dev processes in parallel
- **Vitest**: Fast unit test runner
- **TypeScript Compiler**: Watch mode for real-time type checking

## Project Dependencies

### Production Dependencies
```json
{
  "openai": "^4.0.0",           // OpenAI API client
  "papaparse": "^5.0.0",        // CSV parsing
  "jsonresume-theme-even": "^1.0.0", // HTML theme
  "playwright": "^1.54.2"        // PDF generation (implemented)
}
```

### Development Dependencies
```json
{
  "@types/papaparse": "^5.0.0", // TypeScript definitions
  "typescript": "^5.0.0",       // TypeScript compiler
  "esbuild": "^0.19.0"          // TypeScript bundler
}
```

## Development Workflow (Hot Reload)

### Required Environment Variables
```bash
# .env file
OPENAI_API_KEY=your-openai-api-key-here
```

### Node.js Version
- **Minimum**: Node.js 18+
- **Recommended**: Node.js 20+ (LTS)

### Package Manager
- **Primary**: pnpm (migrated from npm)
- **Alternative**: npm, yarn

## Build & Development

### Build Process
```bash
# Install dependencies
pnpm install

# Build TypeScript to JavaScript
pnpm run build

# Run the application
pnpm start
```

### Development Workflow

#### For Web UI Development (with Hot Reload)
```bash
# Start full development mode (recommended)
pnpm start:dev               # Runs both core watch and web-ui dev server

# OR start components separately  
pnpm dev:full                # Same as start:dev - runs both in parallel
pnpm dev:ui                  # Web UI only (port 3000)
pnpm dev:core                # Core package TypeScript watch only
```

**Features:**
- ✅ **Hot Module Replacement (HMR)**: Changes in web-ui reflect immediately
- ✅ **TypeScript Watch Mode**: Core package types update automatically  
- ✅ **Cross-package Detection**: Vite watches core package changes
- ✅ **Parallel Execution**: Core and UI build in parallel with colored logs
- ✅ **Automatic Browser Refresh**: Opens http://localhost:3000 automatically

#### For CLI Development
```bash
# Traditional CLI workflow
pnpm build                    # Build both packages
pnpm resume                   # Generate resume
pnpm cover-letter            # Generate cover letter
```

#### For Production/Preview
```bash
# Production build and preview
pnpm start                   # Builds both packages and serves production web UI
pnpm build                   # Build all packages for production
```

#### Setup Steps
1. **Initial Setup**: `pnpm install` (installs all workspace dependencies)
2. **Environment**: Copy `env.sample` to `.env` and add your OpenAI API key  
3. **Start Development**: `pnpm start:dev` for web UI development or `pnpm build` for CLI
4. **Development**: Edit files and see changes automatically reflected
5. **Production**: `pnpm start` to build and serve production version

## File Structure

### Source Code
```
src/
├── resume-generator.ts          # CLI entry point for resume generation
└── resume-generator/            # Main context module
    ├── service/                 # Application services
    ├── domain/                  # Domain models & logic
    ├── infrastructure/          # External integrations
    └── prompts/                # AI prompt templates
```

### Configuration Files
- `package.json`: Dependencies and scripts
- `tsconfig.json`: TypeScript configuration
- `.env`: Environment variables (not in repo)
- `env.sample`: Environment template

### Output Directory
- `output/`: Generated resume files (gitignored)
- Files named with date stamps: `resume-yyyymmdd.{json,html,pdf}`

## Development Guidelines

### Code Organization
- **DDD Principles**: Domain logic in domain layer
- **Hexagonal Architecture**: Clear separation of concerns
- **ESM Modules**: Use ES6 import/export syntax
- **TypeScript**: Strict typing for all components

### Import Conventions
- Use `index.ts` files for clean imports
- Avoid `.js` extensions in imports
- Prefer relative imports within context module
- Use absolute imports for external dependencies

### Error Handling
- **API Errors**: Handle OpenAI rate limits and quotas
- **File Errors**: Validate input files and output directories
- **Parsing Errors**: Handle malformed LinkedIn exports
- **Validation Errors**: Ensure JSON Resume compliance

## Testing Strategy (Planned)

### Unit Tests
- **Domain Logic**: ResumeBuilder, Resume entity
- **Infrastructure**: LinkedInParser, PromptRunner
- **Output**: HtmlRenderer, PdfExporter

### Integration Tests
- **End-to-End**: Full pipeline from LinkedIn ZIP to output files
- **API Integration**: OpenAI API response handling
- **File Operations**: Input/output file processing

### Test Tools
- **Jest**: Test framework
- **ts-jest**: TypeScript support
- **Mocking**: OpenAI API, file system operations

## Deployment Considerations

### Local Development
- **Environment**: Local Node.js installation
- **Dependencies**: pnpm install
- **Configuration**: .env file with API keys

### Future Deployment Options
- **Docker**: Containerized deployment
- **Cloud Functions**: Serverless execution
- **Web UI**: Browser-based interface
- **Desktop App**: Electron packaging

## Performance Considerations

### API Usage
- **OpenAI Quotas**: Monitor API usage and costs
- **Rate Limiting**: Handle API rate limits gracefully
- **Caching**: Consider caching for repeated operations

### File Processing
- **Memory Usage**: Handle large LinkedIn exports
- **Processing Time**: Optimize for reasonable execution times
- **Output Size**: Manage PDF file sizes

## Security Considerations

### API Keys
- **Environment Variables**: Never commit API keys to repo
- **Access Control**: Limit API key permissions
- **Rotation**: Regular key rotation practices

### File Handling
- **Input Validation**: Validate LinkedIn export files
- **Path Traversal**: Prevent directory traversal attacks
- **File Permissions**: Secure output file permissions 