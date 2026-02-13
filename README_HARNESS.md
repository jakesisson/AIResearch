# AI Model Testing Harness

A comprehensive testing harness for switching AI models to ChatGPT and managing Docker PostgreSQL databases.

## 📦 What's Included

1. **`testing_harness.py`** - Main harness script with all functionality
2. **`docker-compose.yml`** - PostgreSQL Docker configuration
3. **`TESTING_HARNESS.md`** - Complete documentation
4. **`HARNESS_QUICK_START.md`** - Quick reference guide

## 🚀 Quick Start

### Switch to ChatGPT
```bash
python testing_harness.py setup-chatgpt --api-key $OPENAI_API_KEY
```

### Set Up PostgreSQL
```bash
python testing_harness.py setup-postgres --db-name my_test_db
```

### Restore Original Config
```bash
python testing_harness.py restore
```

## ✨ Features

- ✅ **Automatic Model Switching**: Converts repositories from Claude/Bedrock to ChatGPT
- ✅ **Docker PostgreSQL**: One-command database setup
- ✅ **Automatic Backups**: Creates backups before modifying files
- ✅ **Smart Detection**: Finds config files, .env files, and service files automatically
- ✅ **Code Updates**: Modifies LLM service code to support OpenAI conditionally
- ✅ **Multiple Repos**: Works with any repository path

## 📚 Documentation

- **[Complete Documentation](./TESTING_HARNESS.md)** - Full guide with examples
- **[Quick Start Guide](./HARNESS_QUICK_START.md)** - Quick reference

## 🎯 Use Cases

1. **Consistency Testing**: Test all repositories with the same AI model (ChatGPT)
2. **Isolated Testing**: Each repository gets its own PostgreSQL database
3. **Quick Setup**: One command to configure everything
4. **Easy Cleanup**: Restore original configs with one command

## 📋 Requirements

- Python 3.8+
- Docker & Docker Compose
- OpenAI API key (for ChatGPT testing)

## 🔧 Commands

| Command | Description |
|---------|-------------|
| `setup-chatgpt` | Switch repository to use ChatGPT |
| `setup-postgres` | Start Docker PostgreSQL container |
| `stop-postgres` | Stop PostgreSQL container |
| `restore` | Restore original configuration files |

## 📝 Example Workflow

```bash
# 1. Switch to ChatGPT
python testing_harness.py setup-chatgpt \
  --repo-path ./HypochondriAI-c24b8d2c2fc40913415a7883c87a5c8185a17a37 \
  --model-id gpt-4o

# 2. Set up database
python testing_harness.py setup-postgres \
  --db-name hypochondriai_db

# 3. Run your tests
cd HypochondriAI-c24b8d2c2fc40913415a7883c87a5c8185a17a37/backend/app
alembic upgrade head
pytest

# 4. Cleanup
python testing_harness.py restore
python testing_harness.py stop-postgres
```

## 🛠️ What Gets Modified

The harness automatically:
- Updates `config.py` / `settings.py` files
- Creates/updates `.env` files
- Adds `langchain-openai` to `requirements.txt`
- Updates LLM service code for conditional Bedrock initialization
- Creates backups in `.harness_backups/`

## 🔒 Safety Features

- **Automatic Backups**: All modified files are backed up
- **Non-destructive**: Can restore original configs anytime
- **Isolated Databases**: Each repo gets its own database
- **Version Control Friendly**: Backups allow easy restoration

## 📖 For More Information

See [TESTING_HARNESS.md](./TESTING_HARNESS.md) for:
- Detailed command reference
- Configuration file details
- Troubleshooting guide
- CI/CD integration examples
- Advanced usage patterns
