# AI Model Testing Harness Documentation

## Overview

The AI Model Testing Harness is a comprehensive tool designed to:
1. **Switch AI models to ChatGPT** for consistency testing across repositories
2. **Set up Docker PostgreSQL** databases for testing environments
3. **Manage test configurations** with automatic backups and restoration

This harness is particularly useful for:
- Testing consistency across different AI models
- Standardizing test environments
- Quickly switching between model providers
- Setting up isolated database environments

## Installation

### Prerequisites

- Python 3.8 or higher
- Docker and Docker Compose installed
- Access to OpenAI API (for ChatGPT testing)

### Setup

1. **Make the script executable** (optional):
   ```bash
   chmod +x testing_harness.py
   ```

2. **Install Python dependencies** (if needed):
   ```bash
   pip install docker-compose
   ```

## Quick Start

### 1. Switch Repository to ChatGPT

```bash
# From the repository root directory
python testing_harness.py setup-chatgpt

# Or specify a repository path
python testing_harness.py setup-chatgpt --repo-path /path/to/repo

# Use a specific model
python testing_harness.py setup-chatgpt --model-id gpt-4-turbo

# Provide API key directly
python testing_harness.py setup-chatgpt --api-key sk-your-api-key-here
```

### 2. Set Up PostgreSQL Database

```bash
# Start PostgreSQL container
python testing_harness.py setup-postgres

# Create a specific database
python testing_harness.py setup-postgres --db-name my_test_db

# Use a custom port
python testing_harness.py setup-postgres --db-port 5433
```

### 3. Stop PostgreSQL

```bash
python testing_harness.py stop-postgres
```

### 4. Restore Original Configuration

```bash
python testing_harness.py restore
```

## Commands Reference

### `setup-chatgpt`

Configures a repository to use ChatGPT instead of other AI models (e.g., Claude/Bedrock).

**Options:**
- `--repo-path PATH`: Path to repository (default: current directory)
- `--model-id MODEL`: OpenAI model ID (default: `gpt-4o`)
  - Options: `gpt-4o`, `gpt-4-turbo`, `gpt-3.5-turbo`, etc.
- `--api-key KEY`: OpenAI API key (or set `OPENAI_API_KEY` environment variable)

**What it does:**
1. Finds and updates configuration files (`config.py`, `settings.py`)
2. Updates or creates `.env` files with OpenAI settings
3. Adds `langchain-openai` to `requirements.txt` if missing
4. Updates LLM service code to conditionally initialize Bedrock
5. Creates backups of modified files in `.harness_backups/`

**Example:**
```bash
python testing_harness.py setup-chatgpt \
  --repo-path ./HypochondriAI-c24b8d2c2fc40913415a7883c87a5c8185a17a37 \
  --model-id gpt-4o \
  --api-key $OPENAI_API_KEY
```

### `setup-postgres`

Sets up a Docker PostgreSQL container for testing.

**Options:**
- `--repo-path PATH`: Path to repository (default: current directory)
- `--db-name NAME`: Database name to create (optional)
- `--db-port PORT`: PostgreSQL port (default: 5432)

**What it does:**
1. Creates `docker-compose.yml` if it doesn't exist
2. Starts PostgreSQL container
3. Waits for database to be ready
4. Creates specified database if provided

**Default PostgreSQL credentials:**
- User: `test_user`
- Password: `test_password`
- Database: `test_db` (or repo-specific name)

**Example:**
```bash
python testing_harness.py setup-postgres \
  --db-name hypochondriai_db \
  --db-port 5432
```

### `stop-postgres`

Stops the PostgreSQL Docker container.

**Options:**
- `--repo-path PATH`: Path to repository (default: current directory)

**Example:**
```bash
python testing_harness.py stop-postgres
```

### `restore`

Restores original configuration files from backup.

**Options:**
- `--repo-path PATH`: Path to repository (default: current directory)

**What it does:**
1. Restores all files from `.harness_backups/` directory
2. Removes backup directory after restoration

**Example:**
```bash
python testing_harness.py restore
```

## Configuration Files Modified

The harness automatically detects and modifies:

### 1. Configuration Files (`config.py`, `settings.py`)

**Changes made:**
- `MODEL_ID`: Changed to specified OpenAI model (e.g., `gpt-4o`)
- `MODEL_PROVIDER`: Changed to `openai`
- `OPENAI_API_KEY`: Added if not present

**Example:**
```python
# Before
MODEL_ID: str = "anthropic.claude-3-5-sonnet-20240620-v1:0"
MODEL_PROVIDER: str = "bedrock_converse"

# After
MODEL_ID: str = "gpt-4o"
MODEL_PROVIDER: str = "openai"
OPENAI_API_KEY: str | None = None
```

### 2. Environment Files (`.env`)

**Changes made:**
- Adds/updates `MODEL_PROVIDER=openai`
- Adds/updates `MODEL_ID=gpt-4o` (or specified model)
- Adds/updates `OPENAI_API_KEY=your_key_here`

**Example `.env` file:**
```env
MODEL_PROVIDER=openai
MODEL_ID=gpt-4o
OPENAI_API_KEY=sk-your-api-key-here
MAX_TOKENS=1000
TEMPERATURE=0.3
TOP_P=0.4
```

### 3. Requirements Files (`requirements.txt`)

**Changes made:**
- Adds `langchain-openai` dependency if missing

### 4. LLM Service Files (`*llm*.py`, `*service*.py`)

**Changes made:**
- Makes Bedrock initialization conditional
- Only initializes Bedrock when `MODEL_PROVIDER == "bedrock_converse"`

**Example:**
```python
# Before
def __init__(self, ...):
    LangchainService.initialize_bedrock_client()

# After
def __init__(self, ...):
    if settings.MODEL_PROVIDER == "bedrock_converse":
        LangchainService.initialize_bedrock_client()
```

## Docker PostgreSQL Setup

### Container Details

The harness creates a PostgreSQL container with:
- **Image**: `postgres:15-alpine`
- **Default Port**: `5432` (configurable)
- **User**: `test_user`
- **Password**: `test_password`
- **Default Database**: `test_db` (or repo-specific)

### Volume Persistence

Data is persisted in a Docker volume named `postgres_data_<repo_name>`, so data persists even if the container is stopped.

### Health Checks

The container includes health checks to ensure the database is ready before use.

### Accessing the Database

**From host machine:**
```bash
psql -h localhost -p 5432 -U test_user -d test_db
# Password: test_password
```

**From within Docker:**
```bash
docker exec -it <container_name> psql -U test_user -d test_db
```

## Workflow Examples

### Complete Testing Setup

```bash
# 1. Switch to ChatGPT
python testing_harness.py setup-chatgpt \
  --repo-path ./my-repo \
  --model-id gpt-4o

# 2. Set up PostgreSQL
python testing_harness.py setup-postgres \
  --repo-path ./my-repo \
  --db-name my_test_db

# 3. Update .env with database connection
# (Edit .env file or use the one created by harness)

# 4. Run migrations
cd my-repo/backend/app
alembic upgrade head

# 5. Run tests
pytest

# 6. When done, restore original config
python testing_harness.py restore --repo-path ./my-repo

# 7. Stop PostgreSQL
python testing_harness.py stop-postgres --repo-path ./my-repo
```

### Testing Multiple Repositories

```bash
# Repository 1
python testing_harness.py setup-chatgpt --repo-path ./repo1
python testing_harness.py setup-postgres --repo-path ./repo1 --db-name repo1_db

# Repository 2
python testing_harness.py setup-chatgpt --repo-path ./repo2
python testing_harness.py setup-postgres --repo-path ./repo2 --db-name repo2_db --db-port 5433

# Test both...

# Cleanup
python testing_harness.py restore --repo-path ./repo1
python testing_harness.py restore --repo-path ./repo2
python testing_harness.py stop-postgres --repo-path ./repo1
python testing_harness.py stop-postgres --repo-path ./repo2
```

## Backup and Restoration

### Automatic Backups

When you run `setup-chatgpt`, the harness automatically:
1. Creates a `.harness_backups/` directory
2. Backs up all modified configuration files
3. Stores backups with original filenames

### Manual Backup

You can manually backup files before running the harness:
```bash
mkdir -p .harness_backups
cp config/config.py .harness_backups/
cp .env .harness_backups/ 2>/dev/null || true
```

### Restoration

To restore original files:
```bash
python testing_harness.py restore
```

**Note:** Restoration only works if backups exist. If you've deleted `.harness_backups/`, you'll need to manually restore from version control.

## Troubleshooting

### Issue: "docker-compose not found"

**Solution:** Install Docker Compose:
```bash
# macOS
brew install docker-compose

# Linux
sudo apt-get install docker-compose

# Or use Docker Desktop which includes compose
```

### Issue: "No configuration files found"

**Solution:** The harness looks for `config.py` or `settings.py` files. If your repository uses different naming:
1. Check the file structure
2. Manually update files if needed
3. The harness will still create/update `.env` files

### Issue: "Failed to start PostgreSQL"

**Solution:**
1. Check if port is already in use: `lsof -i :5432`
2. Stop existing PostgreSQL: `docker-compose down`
3. Try a different port: `--db-port 5433`

### Issue: "OpenAI API key not working"

**Solution:**
1. Verify API key: `echo $OPENAI_API_KEY`
2. Set it explicitly: `--api-key sk-your-key`
3. Check OpenAI account has credits

### Issue: "Model initialization fails"

**Solution:**
1. Ensure `langchain-openai` is installed: `pip install langchain-openai`
2. Check model ID is valid: `gpt-4o`, `gpt-4-turbo`, etc.
3. Verify API key has access to the model

## Best Practices

1. **Use Version Control**: Always commit before running the harness
2. **Test in Isolation**: Use separate databases for each test run
3. **Clean Up**: Restore original configs and stop containers after testing
4. **API Key Security**: Use environment variables, not command-line arguments
5. **Backup First**: The harness creates backups, but version control is safer

## Integration with CI/CD

### GitHub Actions Example

```yaml
name: Test with ChatGPT

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Set up Python
        uses: actions/setup-python@v2
        with:
          python-version: '3.11'
      
      - name: Install dependencies
        run: |
          pip install docker-compose
      
      - name: Switch to ChatGPT
        run: |
          python testing_harness.py setup-chatgpt \
            --api-key ${{ secrets.OPENAI_API_KEY }}
      
      - name: Start PostgreSQL
        run: |
          python testing_harness.py setup-postgres
      
      - name: Run tests
        run: |
          cd backend/app
          pip install -r requirements.txt
          alembic upgrade head
          pytest
      
      - name: Cleanup
        if: always()
        run: |
          python testing_harness.py stop-postgres
          python testing_harness.py restore
```

## Advanced Usage

### Custom Model Configuration

You can use any OpenAI-compatible model:
```bash
python testing_harness.py setup-chatgpt --model-id gpt-4-turbo-preview
```

### Multiple Databases

Run multiple PostgreSQL instances on different ports:
```bash
python testing_harness.py setup-postgres --db-port 5432 --db-name db1
python testing_harness.py setup-postgres --db-port 5433 --db-name db2
```

### Environment-Specific Setup

Create environment-specific configurations:
```bash
# Development
python testing_harness.py setup-chatgpt --model-id gpt-3.5-turbo

# Production testing
python testing_harness.py setup-chatgpt --model-id gpt-4o
```

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review backup files in `.harness_backups/`
3. Check Docker logs: `docker-compose logs postgres`
4. Verify file permissions and paths

## License

This harness is provided as-is for testing purposes. Use at your own risk.
