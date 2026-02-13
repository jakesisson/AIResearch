# How to Find API Keys in Langfuse

## The Issue
Langfuse v3 requires **ClickHouse** (not just PostgreSQL). I've updated the Docker setup to include it.

## Where to Find API Keys

API keys in Langfuse are found in **Project Settings**, not Account Settings:

1. **Open Langfuse**: http://localhost:3000
2. **Log in** (create account if first time)
3. **Navigate to a Project** (or create one)
4. **Go to Project Settings**:
   - Click on your project name in the sidebar
   - Or go to: **Settings** → **Projects** → Select your project
5. **Find API Keys**:
   - Look for **"API Keys"** or **"Credentials"** section
   - You should see:
     - **Public Key** (starts with `pk-lf-`)
     - **Secret Key** (starts with `sk-lf-`)

## Alternative: Check the UI Navigation

If you don't see "API Keys" in Project Settings, try:

1. **Left Sidebar** → Look for:
   - "Settings" 
   - "API Keys"
   - "Credentials"
   - "Integrations"

2. **Top Navigation** → Click your profile/avatar → Settings

3. **Project Page** → Click the gear icon or "Settings" button

## If You Still Can't Find It

The API keys might be auto-generated. Check:

1. **Browser Console** (F12) → Look for any API key references
2. **Docker Logs**: `docker logs langfuse_server` might show default keys
3. **First-time Setup**: Some versions create keys during initial setup

## After Getting Keys

Add to `master.env`:
```env
LANGFUSE_PUBLIC_KEY=pk-lf-xxxxx
LANGFUSE_SECRET_KEY=sk-lf-xxxxx
LANGFUSE_HOST=http://localhost:3000
```

## Restart Langfuse with ClickHouse

After I fix the Docker setup, restart:
```bash
cd /Users/jsisson/Research
docker compose -f docker-compose.langfuse.yml up -d
```

Wait ~60 seconds for all services to start, then check:
```bash
docker ps  # Should show langfuse_server, langfuse_postgres, and langfuse_clickhouse all running
```
