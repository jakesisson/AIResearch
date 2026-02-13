# Langfuse Cloud - Quick Start Guide

## Complete Setup Flow

### 1. First Time Setup

1. **Log in**: https://cloud.langfuse.com
2. **Create Organization** (if prompted):
   - Name it (e.g., "Research")
   - This is your workspace
3. **Create Project** (if needed):
   - Name it (e.g., "Research Projects" or "Performance Testing")
   - This is where your data will be stored

### 2. Get API Keys

1. Go to **Settings** → **API Keys**
   - Click your profile (top right) → Settings → API Keys
   - Or: Sidebar → Settings → API Keys
2. **Create a new API key** (if you don't have one):
   - Click "Create API Key" or "Generate Key"
   - Give it a name (e.g., "Research Harness")
3. **Copy both keys**:
   - Public Key (`pk-lf-...`)
   - Secret Key (`sk-lf-...`) - **Copy this immediately!**

### 3. Add to master.env

Edit `/Users/jsisson/Research/master.env`:

```env
LANGFUSE_PUBLIC_KEY=pk-lf-your-actual-key-here
LANGFUSE_SECRET_KEY=sk-lf-your-actual-key-here
LANGFUSE_HOST=https://cloud.langfuse.com
```

### 4. Use with Testing Harness

```bash
cd /path/to/your/repository
python ../testing_harness.py setup-langfuse
```

## What You'll See

After setup, when you run your code with Langfuse tracking:

1. **Go to**: https://cloud.langfuse.com
2. **View**:
   - **Traces**: Individual LLM calls with prompts/responses
   - **Analytics**: Cost and performance dashboards
   - **Projects**: All your tracked repositories

## Tips

- **One Project per Repository**: Create separate projects for each repo you're testing
- **Project Names**: Use descriptive names like "AI-Product-Analyzer" or "HypochondriAI"
- **API Keys**: You can create multiple API keys for different purposes
- **Free Tier**: Langfuse Cloud has a free tier - check your usage in Settings
