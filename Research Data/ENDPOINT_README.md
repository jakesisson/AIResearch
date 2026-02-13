# Azure OpenAI Endpoint Script

## What This Script Does

This script appears to be designed to:
1. **Read GitHub data** from CSV files (tools and operations)
2. **Use Azure OpenAI** to process/map the data
3. **Output results** to a CSV file

## Issues in Original Script

The original script had several problems:
- ❌ Undefined variable `pmt` (would cause error)
- ❌ Hardcoded API key (security risk)
- ❌ Google Colab paths (`/content/`) that won't work locally
- ❌ Doesn't actually read or process CSV files
- ❌ Doesn't save the API response

## Fixed Version

I've created `endpoint_fixed.py` which:
- ✅ Fixes all the issues above
- ✅ Uses local file paths
- ✅ Reads CSV files properly
- ✅ Processes data in batches
- ✅ Saves results to output CSV
- ✅ Better error handling

## Setup

1. **Install dependencies:**
   ```bash
   pip install pandas tqdm openai
   ```

2. **Set up your CSV files:**
   - Place `GitHub_MCP_Tools2.csv` in the same directory
   - Place `Github_operations.csv` in the same directory
   - Or update the file paths in the script

3. **Set API key:**
   ```bash
   # Option 1: Environment variable
   export AZURE_OPENAI_API_KEY="your_key_here"
   
   # Option 2: The script will prompt you
   ```

4. **Update configuration:**
   - Verify the Azure endpoint URL is correct
   - Verify the model name (`gpt-4.1` - this seems unusual, might be `gpt-4` or `gpt-4-turbo`)
   - Adjust batch size if needed

## Usage

```bash
cd "Research Data"
python3 endpoint_fixed.py
```

## Customization

You'll need to customize the `create_prompt()` function based on what you want the AI to do:
- Map tools to operations?
- Analyze relationships?
- Generate summaries?
- Something else?

The current prompt is a template - modify it for your specific use case.

## Security Note

⚠️ **IMPORTANT**: The original script had a hardcoded API key. I've removed it from the fixed version. Never commit API keys to version control!

## What You Need to Provide

1. **The CSV files** (`GitHub_MCP_Tools2.csv` and `Github_operations.csv`)
2. **Your Azure OpenAI API key**
3. **Clarification on what the script should do** (what kind of mapping/processing?)

If you can share:
- What the CSV files contain
- What the expected output should be
- What the mapping/processing logic should be

I can help you complete the script with the correct prompt and processing logic.
