#!/usr/bin/env python3
"""
Update all repository .env files from master.env

This script finds all repositories and updates their .env files
with values from the parent master.env file.

Usage:
    python3 update_all_repos_from_master.py
"""

import sys
from pathlib import Path
from testing_harness import TestingHarness


def find_repositories(base_path: Path) -> list:
    """Find all repository directories (those with -SHA pattern)."""
    repos = []
    for item in base_path.iterdir():
        if item.is_dir() and '-' in item.name and len(item.name) > 40:
            # Likely a repository folder (name-SHA pattern)
            repos.append(item)
    return repos


def main():
    """Update all repositories from master.env."""
    base_path = Path("/Users/jsisson/Research")
    master_env = base_path / "master.env"
    
    if not master_env.exists():
        print(f"❌ master.env not found at {master_env}")
        sys.exit(1)
    
    print(f"📋 Found master.env at {master_env}")
    print(f"🔍 Searching for repositories in {base_path}...\n")
    
    repos = find_repositories(base_path)
    
    if not repos:
        print("⚠️  No repositories found")
        sys.exit(0)
    
    print(f"Found {len(repos)} repositories\n")
    
    for i, repo_path in enumerate(repos, 1):
        print(f"[{i}/{len(repos)} Processing: {repo_path.name}")
        
        harness = TestingHarness(repo_path=str(repo_path))
        
        # Load parent values
        parent_values = harness._load_parent_env_values()
        if not parent_values:
            print(f"  ⚠️  Could not load parent .env values")
            continue
        
        # Get values from parent
        model_id = parent_values.get("MODEL_ID", "gpt-4.1")
        api_key = parent_values.get("AZURE_OPENAI_API_KEY", "")
        endpoint = parent_values.get("AZURE_OPENAI_ENDPOINT", "")
        api_version = parent_values.get("AZURE_OPENAI_API_VERSION", "2025-01-01-preview")
        
        # Update or create .env file
        env_path = harness._find_env_file()
        if env_path:
            harness._update_env_file_azure(env_path, model_id, api_key, endpoint, api_version)
        else:
            harness._create_env_file_azure(model_id, api_key, endpoint, api_version)
    
    print(f"\n✅ Updated {len(repos)} repositories from master.env")


if __name__ == "__main__":
    main()
