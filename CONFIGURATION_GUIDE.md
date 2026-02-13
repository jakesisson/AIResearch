# Configuration Guide: Azure OpenAI & PostgreSQL

This guide explains how to ensure all projects use Azure OpenAI and PostgreSQL as standardized configurations.

## Overview

All research projects should use:
- **Azure OpenAI** as the model provider (not OpenAI, Anthropic, or others)
- **PostgreSQL** as the database (not MongoDB or other databases)
- **Standardized LangChain credentials** for tracing

## Master Environment

The `master.env` file has been updated with:

### Azure OpenAI Configuration
```bash
MODEL_PROVIDER=azure_openai
MODEL_ID=gpt-4.1
AZURE_OPENAI_API_KEY=EBV6HXBgllfMaegY1CzWcRVfCMLgXeSLbnnNNqIYaiJf28gVPcePJQQJ99BKACYeBjFXJ3w3AAAAACOG60w6
AZURE_OPENAI_ENDPOINT=https://ksontini-mcp-project.openai.azure.com/
AZURE_OPENAI_API_VERSION=2025-01-01-preview
MAX_TOKENS=1000
TEMPERATURE=0.3
TOP_P=0.4
```

### PostgreSQL Configuration
```bash
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=test_user
DB_PASSWORD=test_password
DB_NAME=test_db
DATABASE_URL=postgresql://test_user:test_password@localhost:5432/test_db
```

### LangChain Configuration
```bash
LANGCHAIN_API_KEY=<your-key>
LANGCHAIN_TRACING_V2=true
LANGCHAIN_ENDPOINT=https://api.smith.langchain.com
LANGCHAIN_PROJECT=research-projects
```

## Enforcing Configuration

### Step 1: Update Master Environment

First, ensure `master.env` has your actual credentials:

```bash
# Edit master.env
nano master.env

# Add your LangChain API key if you have one
# LANGCHAIN_API_KEY=your-actual-key-here
```

### Step 2: Setup Master Environment in Projects

Link the master environment to all projects:

```bash
python3 setup_master_env.py --strategy symlink
```

### Step 3: Enforce Azure OpenAI & PostgreSQL

Force all projects to use Azure OpenAI and PostgreSQL:

```bash
# Dry run first (see what would change)
python3 enforce_azure_openai.py --dry-run

# Actually enforce the configuration
python3 enforce_azure_openai.py
```

This script will:
- Update all `.env` files to use Azure OpenAI
- Replace database configurations with PostgreSQL
- Comment out or remove other model provider configs
- Create `.env` files if they don't exist (with `--create-missing`)

## What Gets Changed

### Model Provider Changes

**Before:**
```bash
OPENAI_API_KEY=sk-...
MODEL_PROVIDER=openai
MODEL_ID=gpt-4
```

**After:**
```bash
MODEL_PROVIDER=azure_openai
MODEL_ID=gpt-4.1
AZURE_OPENAI_API_KEY=EBV6HXBgllfMaegY1CzWcRVfCMLgXeSLbnnNNqIYaiJf28gVPcePJQQJ99BKACYeBjFXJ3w3AAAAACOG60w6
AZURE_OPENAI_ENDPOINT=https://ksontini-mcp-project.openai.azure.com/
AZURE_OPENAI_API_VERSION=2025-01-01-preview
```

### Database Changes

**Before:**
```bash
MONGODB_URI=mongodb://localhost:27017
DATABASE_URL=mongodb://...
```

**After:**
```bash
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=test_user
DB_PASSWORD=test_password
DB_NAME=test_db
DATABASE_URL=postgresql://test_user:test_password@localhost:5432/test_db
```

## Code Changes Needed

Some projects may need code changes to use Azure OpenAI. Common patterns:

### Python Projects

**Before (OpenAI):**
```python
from openai import OpenAI
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
```

**After (Azure OpenAI):**
```python
from openai import AzureOpenAI
client = AzureOpenAI(
    api_key=os.getenv("AZURE_OPENAI_API_KEY"),
    api_version=os.getenv("AZURE_OPENAI_API_VERSION"),
    azure_endpoint=os.getenv("AZURE_OPENAI_ENDPOINT")
)
```

### LangChain Projects

**Before:**
```python
from langchain_openai import ChatOpenAI
llm = ChatOpenAI(model="gpt-4")
```

**After:**
```python
from langchain_openai import AzureChatOpenAI
llm = AzureChatOpenAI(
    azure_endpoint=os.getenv("AZURE_OPENAI_ENDPOINT"),
    api_key=os.getenv("AZURE_OPENAI_API_KEY"),
    api_version=os.getenv("AZURE_OPENAI_API_VERSION"),
    model=os.getenv("MODEL_ID", "gpt-4.1")
)
```

### Database Changes

**Before (MongoDB):**
```python
from pymongo import MongoClient
client = MongoClient(os.getenv("MONGODB_URI"))
```

**After (PostgreSQL):**
```python
from sqlalchemy import create_engine
engine = create_engine(os.getenv("DATABASE_URL"))
```

## LangChain Credentials

For LangChain tracing and monitoring:

1. **Get LangSmith API Key:**
   - Go to https://smith.langchain.com
   - Sign up/login
   - Get your API key from settings

2. **Add to master.env:**
   ```bash
   LANGCHAIN_API_KEY=lsv2_pt_...
   LANGCHAIN_TRACING_V2=true
   LANGCHAIN_PROJECT=research-projects
   ```

3. **Projects will automatically use it** if they:
   - Source `.env.master` or
   - Use `python-dotenv` to load `.env.master`

## Verification

After enforcing configuration:

1. **Check environment files:**
   ```bash
   # See what was changed
   cat enforcement_results.json
   ```

2. **Verify a project:**
   ```bash
   cd "Research Data/HypochondriAI/HypochondriAI-*/"
   cat .env | grep -E "MODEL_PROVIDER|AZURE_OPENAI|DB_"
   ```

3. **Test a build:**
   ```bash
   python3 verify_builds.py --dry-run
   ```

## Troubleshooting

### Projects Still Using Other Providers

If a project still uses OpenAI/Anthropic:
1. Check if it has hardcoded values in code
2. Search for `OPENAI_API_KEY` or `ANTHROPIC_API_KEY` in source files
3. Update the code to use Azure OpenAI

### Database Connection Issues

If a project can't connect to PostgreSQL:
1. Ensure PostgreSQL is running: `pg_isready`
2. Check credentials match your actual database
3. Update `master.env` with correct credentials
4. Re-run `setup_master_env.py`

### LangChain Not Tracing

If LangChain tracing isn't working:
1. Verify `LANGCHAIN_API_KEY` is set in master.env
2. Check `LANGCHAIN_TRACING_V2=true`
3. Ensure project loads `.env.master` or uses `python-dotenv`

## Files

- `master.env` - Master environment with Azure OpenAI and PostgreSQL
- `enforce_azure_openai.py` - Script to enforce configuration
- `enforcement_results.json` - Results of enforcement
- `setup_master_env.py` - Links master.env to projects

## Next Steps

1. ✅ Update `master.env` with your LangChain API key
2. ✅ Run `setup_master_env.py` to link environment
3. ✅ Run `enforce_azure_openai.py` to enforce configuration
4. ✅ Update any code that hardcodes model providers
5. ✅ Test builds with `verify_builds.py`
