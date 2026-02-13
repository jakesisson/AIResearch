# Parent .env File Setup

The testing harness now supports a **master .env file** at the Research root level that all repositories can inherit from.

## Master .env File

A `master.env` file has been created at `/Users/jsisson/Research/master.env` containing:

- Azure OpenAI API key
- Azure OpenAI endpoint
- Default model configuration
- Database configuration
- Other shared settings

## How It Works

### Automatic Merging (Recommended)

The harness automatically detects and **merges** values from the parent `master.env` file:

```bash
# The harness will automatically find and merge master.env
python3 testing_harness.py setup-azure-openai --repo-path ./your-repo
```

The harness will:
1. ✅ Look for `master.env` in parent directories
2. ✅ Load all values from it
3. ✅ **Merge** parent values into repository `.env` files
4. ✅ Create complete `.env` files with all values (so repos work independently)
5. ✅ Repository `.env` files are automatically kept in sync with `master.env`

**Key Benefit**: Each repository gets a complete `.env` file, but values are automatically populated from `master.env`. Update `master.env` once, then re-run the harness to update all repositories.

### Option 2: Using load_parent_env.py

For repositories that need to load parent .env at runtime:

```python
# At the top of your Python files
from load_parent_env import load_parent_env
load_parent_env()  # Loads master.env automatically

# Now all environment variables from master.env are available
import os
api_key = os.getenv("AZURE_OPENAI_API_KEY")
```

### Option 3: Manual .env Files

You can still create full `.env` files in each repository if you want to override parent values:

```env
# Repository .env (overrides parent values)
MODEL_ID=gpt-4-turbo  # Override parent's gpt-4.1
AZURE_OPENAI_API_KEY=different_key  # Override parent's key
```

## File Structure

```
/Users/jsisson/Research/
├── master.env                    # ← Master configuration (shared)
├── repository1/
│   └── .env                     # ← Minimal (inherits from master.env)
├── repository2/
│   └── .env                     # ← Minimal (inherits from master.env)
└── ...
```

## Benefits

- ✅ **Single source of truth**: Update API key once in `master.env`
- ✅ **No duplication**: Repositories don't need full .env files
- ✅ **Easy updates**: Change master.env and all repos inherit
- ✅ **Override capability**: Repos can still override specific values

## Updating the Master .env

To update the Azure OpenAI API key or other shared settings:

1. Edit `/Users/jsisson/Research/master.env`
2. All repositories will automatically use the new values (if they're using inheritance)

## Repository .env Files

When using inheritance, repository `.env` files will look like:

```env
# Repository-specific .env file
# Inherits from parent master.env file

MODEL_PROVIDER=azure_openai
MODEL_ID=gpt-4.1

# Azure OpenAI Configuration (inherited from parent master.env)
# Uncomment to override:
# AZURE_OPENAI_API_KEY=...
# AZURE_OPENAI_ENDPOINT=...
```

## Overriding Parent Values

To override a specific value in a repository:

1. Uncomment the line in the repository's `.env` file
2. Set your custom value
3. That value will override the parent

Example:
```env
# Override the API key for this specific repository
AZURE_OPENAI_API_KEY=different_key_here
```
