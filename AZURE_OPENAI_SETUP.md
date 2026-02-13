# Azure OpenAI Setup for Testing Harness

The testing harness now supports Azure OpenAI! Here's how to use it.

## Quick Start

### Option 1: Using the Harness Command (Recommended)

```bash
# Set environment variables
export AZURE_OPENAI_API_KEY="EBV6HXBgllfMaegY1CzWcRVfCMLgXeSLbnnNNqIYaiJf28gVPcePJQQJ99BKACYeBjFXJ3w3AAAAACOG60w6"
export AZURE_OPENAI_ENDPOINT="https://ksontini-mcp-project.openai.azure.com/"

# Setup repository for Azure OpenAI
python3 testing_harness.py setup-azure-openai --repo-path ./your-repo
```

### Option 2: Using Command Line Arguments

```bash
python3 testing_harness.py setup-azure-openai \
  --repo-path ./your-repo \
  --api-key "EBV6HXBgllfMaegY1CzWcRVfCMLgXeSLbnnNNqIYaiJf28gVPcePJQQJ99BKACYeBjFXJ3w3AAAAACOG60w6" \
  --endpoint "https://ksontini-mcp-project.openai.azure.com/" \
  --model-id "gpt-4.1"
```

### Option 3: Manual .env File

1. Copy the template:
   ```bash
   cp "Research Data/azure_openai.env.template" ./your-repo/.env
   ```

2. Or create `.env` manually with:
   ```env
   MODEL_PROVIDER=azure_openai
   MODEL_ID=gpt-4.1
   AZURE_OPENAI_API_KEY=EBV6HXBgllfMaegY1CzWcRVfCMLgXeSLbnnNNqIYaiJf28gVPcePJQQJ99BKACYeBjFXJ3w3AAAAACOG60w6
   AZURE_OPENAI_ENDPOINT=https://ksontini-mcp-project.openai.azure.com/
   AZURE_OPENAI_API_VERSION=2025-01-01-preview
   ```

## Configuration Details

### Azure OpenAI Credentials

- **API Key**: `EBV6HXBgllfMaegY1CzWcRVfCMLgXeSLbnnNNqIYaiJf28gVPcePJQQJ99BKACYeBjFXJ3w3AAAAACOG60w6`
- **Endpoint**: `https://ksontini-mcp-project.openai.azure.com/`
- **Model**: `gpt-4.1`
- **API Version**: `2025-01-01-preview`

### Environment Variables

The harness will automatically use these environment variables if set:
- `AZURE_OPENAI_API_KEY` - Your Azure OpenAI API key
- `AZURE_OPENAI_ENDPOINT` - Your Azure OpenAI endpoint URL
- `AZURE_OPENAI_API_VERSION` - API version (defaults to `2025-01-01-preview`)

## What the Harness Does

When you run `setup-azure-openai`, the harness will:

1. ✅ Update `config.py`/`settings.py` files with Azure OpenAI settings
2. ✅ Create/update `.env` file with Azure OpenAI configuration
3. ✅ Add `openai` package to `requirements.txt` if needed
4. ✅ Set `MODEL_PROVIDER=azure_openai` in configuration

## Example Usage

```bash
# Setup a repository for Azure OpenAI
python3 testing_harness.py setup-azure-openai \
  --repo-path ./HypochondriAI-c24b8d2c2fc40913415a7883c87a5c8185a17a37

# The harness will:
# - Update config files
# - Create .env with Azure OpenAI settings
# - Ready to use!
```

## Switching Between Providers

You can switch between providers:

```bash
# Switch to Azure OpenAI
python3 testing_harness.py setup-azure-openai --repo-path ./repo

# Switch to ChatGPT
python3 testing_harness.py setup-chatgpt --repo-path ./repo

# Restore original
python3 testing_harness.py restore --repo-path ./repo
```

## Security Note

⚠️ **Important**: The API key is stored in the template file for convenience, but:
- Never commit `.env` files to version control
- Consider rotating the key if it's been exposed
- Use environment variables in production

## Troubleshooting

### "No Azure OpenAI API key found"
Set the environment variable:
```bash
export AZURE_OPENAI_API_KEY="your_key_here"
```

### "Invalid endpoint"
Verify the endpoint URL is correct and accessible.

### Model not found
Check that `gpt-4.1` is the correct model name for your Azure OpenAI deployment.
