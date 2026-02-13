# Testing Harness - Quick Start Guide

## TL;DR

```bash
# Switch to ChatGPT
python testing_harness.py setup-chatgpt --api-key $OPENAI_API_KEY

# Set up PostgreSQL
python testing_harness.py setup-postgres --db-name my_db

# When done
python testing_harness.py restore
python testing_harness.py stop-postgres
```

## Common Commands

### Switch Repository to ChatGPT
```bash
python testing_harness.py setup-chatgpt \
  --repo-path ./HypochondriAI-c24b8d2c2fc40913415a7883c87a5c8185a17a37 \
  --model-id gpt-4o
```

### Start PostgreSQL
```bash
python testing_harness.py setup-postgres \
  --db-name hypochondriai_db \
  --db-port 5432
```

### Stop PostgreSQL
```bash
python testing_harness.py stop-postgres
```

### Restore Original Config
```bash
python testing_harness.py restore
```

## What Gets Changed

✅ Configuration files (`config.py`, `settings.py`)
✅ Environment files (`.env`)
✅ Requirements (`requirements.txt`)
✅ LLM service code (conditional Bedrock init)

## Default PostgreSQL Credentials

- **Host**: `localhost`
- **Port**: `5432`
- **User**: `test_user`
- **Password**: `test_password`
- **Database**: `test_db` (or specified name)

## Full Documentation

See [TESTING_HARNESS.md](./TESTING_HARNESS.md) for complete documentation.
