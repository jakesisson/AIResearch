# Build Setup and Master Environment Guide

This guide explains how to set up a unified build system and master environment for all research projects.

## Overview

The system consists of:
1. **Master Environment** (`master.env`) - Centralized environment variables
2. **Build Requirements Analysis** - Detects build systems and dependencies
3. **Environment Setup Script** - Links master env to all projects
4. **Build Verification Script** - Verifies all projects can build

## Quick Start

### 1. Analyze Build Requirements

First, analyze all projects to understand their build systems:

```bash
python3 analyze_build_requirements.py
```

This creates `build_requirements.json` with:
- Project types (Python, Node.js, Hybrid)
- Package managers used
- Common dependencies
- Environment variables needed

### 2. Setup Master Environment

The master environment file (`master.env`) contains all environment variables used across projects. Edit it to add your API keys and configuration:

```bash
# Edit master.env with your actual values
nano master.env
```

### 3. Link Master Environment to All Projects

Choose a strategy for linking the master environment:

**Option A: Symlink (Recommended)**
- Creates symlinks to master.env in each project
- Changes to master.env automatically propagate
```bash
python3 setup_master_env.py --strategy symlink
```

**Option B: Copy**
- Copies master.env to each project
- Each project has its own copy
```bash
python3 setup_master_env.py --strategy copy
```

**Option C: Merge**
- Merges master.env with existing .env files
- Preserves project-specific variables
```bash
python3 setup_master_env.py --strategy merge
```

### 4. Verify Builds

Verify that all projects can build successfully:

```bash
# Dry run (see what would be built)
python3 verify_builds.py --dry-run

# Actual build verification
python3 verify_builds.py --timeout 300
```

## Master Environment Structure

The `master.env` file is organized into sections:

- **AI/LLM API Keys**: OpenAI, Anthropic, Google AI, AWS Bedrock
- **Database Configuration**: PostgreSQL, MongoDB, Redis
- **Vector Stores**: Pinecone, Weaviate, Qdrant, Chroma
- **LangSmith/LangChain**: Tracing and monitoring
- **Observability**: OpenTelemetry configuration
- **Application Config**: Node/Python environment, ports, hosts
- **External Services**: Browserbase, E2B, Inngest
- **Feature Flags**: Enable/disable features
- **Security**: Secret keys, JWT secrets

## Using Master Environment in Projects

### Python Projects

```python
# Option 1: Load from .env.master
from dotenv import load_dotenv
load_dotenv('.env.master')

# Option 2: Source before running
# source .env.master
# python app.py
```

### Node.js Projects

```javascript
// Option 1: Use dotenv to load .env.master
require('dotenv').config({ path: '.env.master' });

// Option 2: Source before running
// source .env.master
// npm start
```

### Shell Scripts

```bash
# Source the master environment
if [ -f .env.master ]; then
    set -a
    source .env.master
    set +a
fi
```

## Project Types Detected

Based on analysis:
- **Python**: 21 projects (pip, poetry, uv)
- **Node.js**: 7 projects (npm, yarn, pnpm, bun)
- **Hybrid**: 14 projects (both Python and Node.js)
- **Unknown**: 2 projects

## Package Managers

- **npm**: 16 projects
- **pip**: 12 projects
- **poetry**: 9 projects
- **bun**: 3 projects
- **pnpm**: 2 projects

## Common Dependencies

Top dependencies found across projects:
- `langchain` (27 projects)
- `python-dotenv` (26 projects)
- `pydantic` (22 projects)
- `langgraph` (19 projects)
- `fastapi` (18 projects)
- `openai` (15 projects)

## Troubleshooting

### Build Failures

1. Check `build_verification_results.json` for detailed error messages
2. Verify dependencies are installed:
   ```bash
   # Python projects
   pip install -r requirements.txt
   
   # Node.js projects
   npm install
   ```

### Environment Variable Issues

1. Verify master.env is linked correctly:
   ```bash
   ls -la Research\ Data/*/.env.master
   ```

2. Check if project needs additional variables:
   ```bash
   # Compare project's .env with master.env
   diff .env .env.master
   ```

### Missing Dependencies

Some projects may require system dependencies:
- Docker (for containerized builds)
- Python 3.8+ (for Python projects)
- Node.js 18+ (for Node.js projects)
- Build tools (gcc, make, etc.)

## Next Steps

1. **Customize master.env** with your actual API keys and configuration
2. **Run setup_master_env.py** to link environment to all projects
3. **Run verify_builds.py** to ensure all projects build
4. **Fix any build failures** identified in the verification
5. **Update master.env** as needed - changes propagate automatically (if using symlink)

## Files Created

- `master.env` - Master environment configuration
- `build_requirements.json` - Analysis of all project build systems
- `env_setup_results.json` - Results of environment setup
- `build_verification_results.json` - Results of build verification

## Scripts

- `analyze_build_requirements.py` - Analyze project build systems
- `setup_master_env.py` - Setup master environment in all projects
- `verify_builds.py` - Verify all projects can build
