# Repository Cloning Script

This script automatically clones all repositories from `performance_cost_commits.json` at their specific commit SHAs.

## Features

- ✅ Clones repositories at specific commit SHAs
- ✅ Creates folders in format: `{repo_name}-{SHA}/`
- ✅ Generates JSON log with URL and folder path
- ✅ Skips already cloned repositories (optional)
- ✅ Handles shallow clones and fallback to full clones
- ✅ Saves progress after each clone (resumable)

## Usage

### Basic Usage

```bash
# Clone all repositories to current directory
python3 clone_repositories.py
```

### Advanced Usage

```bash
# Specify custom paths
python3 clone_repositories.py \
  --commits-file "Research Data/Github_Scripting/performance_cost_commits.json" \
  --output-dir "." \
  --log-file "clone_log.json"

# Re-clone even if folders exist
python3 clone_repositories.py --no-skip-existing
```

## Options

- `--commits-file`: Path to `performance_cost_commits.json` (default: `Research Data/Github_Scripting/performance_cost_commits.json`)
- `--output-dir`: Directory where repositories will be cloned (default: current directory)
- `--log-file`: Name of the JSON log file (default: `clone_log.json`)
- `--no-skip-existing`: Re-clone repositories even if they already exist

## Output

### Folder Structure

Repositories are cloned with the naming pattern:
```
{repo_name}-{SHA}/
```

Examples:
- `HypochondriAI-c24b8d2c2fc40913415a7883c87a5c8185a17a37/`
- `AI-Product-Analyzer-6779ffda3a8a21dec8afb5b57bfee345a8a19798/`
- `knowledge_agent-ef77bb2ccb38eee7f8a5e2374edb418adac4473b/`

### JSON Log Format

The script generates `clone_log.json` with the following structure:

```json
[
  {
    "url": "https://github.com/owner/repo/commit/sha",
    "folder": "/path/to/repo-name-sha",
    "status": "success",
    "error": null
  },
  {
    "url": "https://github.com/owner/repo/commit/sha",
    "folder": "/path/to/repo-name-sha",
    "status": "exists",
    "error": null
  },
  {
    "url": "https://github.com/owner/repo/commit/sha",
    "folder": null,
    "status": "failed",
    "error": "Error message"
  }
]
```

**Status values:**
- `success`: Repository cloned successfully
- `exists`: Repository folder already exists (skipped)
- `failed`: Clone or checkout failed

## Example

```bash
# Clone all repositories
python3 clone_repositories.py

# Output:
# 📋 Found 59 commits to process
# 
# [1/59] Processing: Mihai-Tirtara/HypochondriAI
# 📦 Cloning Mihai-Tirtara/HypochondriAI at commit c24b8d2c...
#   🔍 Checking out commit c24b8d2c2fc40913415a7883c87a5c8185a17a37...
#   ✅ Successfully cloned to HypochondriAI-c24b8d2c2fc40913415a7883c87a5c8185a17a37
# 💾 Log saved to clone_log.json
# 
# [2/59] Processing: zanekoch/EndPointApp
# ...
# 
# ============================================================
# 📊 CLONING SUMMARY
# ============================================================
# Total commits: 59
# ✅ Successfully cloned: 45
# ⏭️  Already existed: 2
# ❌ Failed: 12
# 💾 Log saved to: clone_log.json
# ============================================================
```

## Requirements

- Python 3.8+
- Git installed and accessible in PATH
- Internet connection
- Sufficient disk space (repositories can be large)

## Notes

- The script uses shallow clones (`--depth 1`) for speed, but falls back to full clones if needed
- If a commit is not found in a shallow clone, the script automatically fetches more history
- Progress is saved after each clone, so you can safely interrupt and resume
- Failed clones are logged with error messages for debugging

## Troubleshooting

### "git: command not found"
Install Git: `brew install git` (macOS) or `apt-get install git` (Linux)

### "Timeout during clone"
Some repositories are very large. The script has timeouts, but you can modify them in the code if needed.

### "Checkout failed"
The commit SHA might not exist in the repository. Check the error message in the log file.

### "Permission denied"
Make sure you have write permissions to the output directory.
