# Commit History Extraction Script

This script extracts commit history information from cloned repositories, including the commit prior to the researched commit.

## Features

- ✅ Extracts commit history with dates/times
- ✅ Finds the commit immediately prior to the researched commit
- ✅ Gets detailed information for each commit (SHA, author, date, message)
- ✅ Creates repository objects with all commit information
- ✅ Outputs structured JSON with base URL, researched commit, prior commit, and full history

## Usage

```bash
# Extract commit history from all successfully cloned repositories
python3 get_commit_history.py

# Specify custom log file
python3 get_commit_history.py --log-file clone_log.json

# Specify custom output file
python3 get_commit_history.py --output-file repository_history.json
```

## Output Format

The script generates `repository_history.json` with the following structure:

```json
{
  "extracted_at": "2024-01-26T12:00:00",
  "total_repositories": 44,
  "repositories": [
    {
      "base_url": "https://github.com/owner/repo",
      "folder": "/path/to/repo-name-sha",
      "researched_commit": {
        "sha": "full_commit_sha",
        "author_name": "Author Name",
        "author_email": "author@example.com",
        "date": "2024-01-15T10:30:00-05:00",
        "message": "Commit message"
      },
      "prior_commit": {
        "sha": "prior_commit_sha",
        "author_name": "Author Name",
        "author_email": "author@example.com",
        "date": "2024-01-14T15:20:00-05:00",
        "message": "Previous commit message"
      },
      "commit_history": [
        {
          "sha": "commit_sha_1",
          "author_name": "Author",
          "author_email": "email@example.com",
          "date": "2024-01-15T10:30:00-05:00",
          "message": "Commit message 1"
        },
        {
          "sha": "commit_sha_2",
          "author_name": "Author",
          "author_email": "email@example.com",
          "date": "2024-01-14T15:20:00-05:00",
          "message": "Commit message 2"
        }
      ],
      "total_commits_in_history": 50
    }
  ]
}
```

## Repository Object Fields

Each repository object contains:

- **base_url**: Base GitHub repository URL (without `/commit/sha`)
- **folder**: Local path to the cloned repository
- **researched_commit**: The commit SHA from the performance_cost_commits.json
  - Full SHA, author info, date/time (ISO 8601), commit message
- **prior_commit**: The commit immediately before the researched commit
  - Same structure as researched_commit
  - `null` if the researched commit is the first commit
- **commit_history**: Array of recent commits (up to 100)
  - Each commit includes SHA, author, date/time, message
  - Ordered from newest to oldest
- **total_commits_in_history**: Number of commits in the history array

## Date Format

All dates are in ISO 8601 format with timezone:
- Format: `YYYY-MM-DDTHH:MM:SS±HH:MM`
- Example: `2024-01-15T10:30:00-05:00`

## Requirements

- Python 3.8+
- Git installed and accessible
- Cloned repositories (from `clone_repositories.py`)
- `clone_log.json` file

## Notes

- Only processes repositories with `status: "success"` or `status: "exists"` in the log
- Skips repositories with `status: "failed"`
- If a repository folder doesn't exist, it's skipped with a warning
- If the researched commit is the first commit, `prior_commit` will be `null`
- Commit history is limited to 100 commits by default (can be modified in code)

## Example Workflow

```bash
# 1. Clone repositories
python3 clone_repositories.py

# 2. Extract commit history
python3 get_commit_history.py

# 3. Use repository_history.json for analysis
```

## Troubleshooting

### "Repository folder not found"
- Make sure repositories were successfully cloned
- Check that the folder paths in `clone_log.json` are correct
- Re-run `clone_repositories.py` if needed

### "Could not find researched commit"
- The commit SHA might not exist in the repository
- Check if the repository was cloned at the correct commit
- Verify the SHA in the URL matches the repository state

### "No prior commit found"
- The researched commit might be the first commit in the repository
- This is normal and `prior_commit` will be `null`
