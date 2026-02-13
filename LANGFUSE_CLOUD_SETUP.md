# Langfuse Cloud Setup

## Getting Your API Keys from Langfuse Cloud

### Step 1: Log in to Langfuse Cloud
- Go to: https://cloud.langfuse.com
- Log in with your account

### Step 2: Create an Organization (if needed)
When you first log in, you may need to:
- **Create an organization** (if you don't have one yet)
  - Look for a prompt to "Create Organization" or "Set up Organization"
  - Give it a name (e.g., "Research" or your name)
  - This is the top-level container for your projects

### Step 3: Create a Project (if needed)
- You may also need to create a **Project** within your organization
  - Projects are where your traces/data will be stored
  - You can create multiple projects (e.g., one per repository)
  - Or use one project for all your research

### Step 4: Get Your API Keys
Once you have an organization and project set up:

1. **Navigate to API Keys**:
   - Click on your **profile/avatar** (top right) → **Settings** → **API Keys**
   - Or: Left sidebar → **Settings** → **API Keys**
   - Or: **Project Settings** → **API Keys** (project-specific keys)

2. **Generate/Copy Your Keys**:
   - If you don't see keys, click **"Create API Key"** or **"Generate Key"**
   - Copy both:
     - **Public Key** (starts with `pk-lf-`)
     - **Secret Key** (starts with `sk-lf-`)
   - **Important**: Copy the secret key immediately - you won't be able to see it again!

3. **Note the Host**:
   - **Host**: `https://cloud.langfuse.com` (or your custom domain if you have one)

## Add to master.env

Edit `/Users/jsisson/Research/master.env`:

```env
# Langfuse Cloud Configuration
LANGFUSE_PUBLIC_KEY=pk-lf-your-key-here
LANGFUSE_SECRET_KEY=sk-lf-your-key-here
LANGFUSE_HOST=https://cloud.langfuse.com
```

## Benefits of Langfuse Cloud

✅ No Docker setup needed  
✅ No ClickHouse configuration  
✅ Automatic updates  
✅ Managed infrastructure  
✅ Free tier available  

## Using with Testing Harness

Once keys are in `master.env`, you can use:

```bash
python testing_harness.py setup-langfuse
```

This will automatically add Langfuse tracking to your repositories.
