#!/usr/bin/env python3
"""
Clone repositories from performance_cost_commits.json at specific commit SHAs.

This script:
1. Reads performance_cost_commits.json
2. Clones each repository at the specified commit SHA
3. Creates folders named: {repo_name}-{SHA}/
4. Generates a JSON log with URL and folder path
"""

import json
import os
import re
import subprocess
import sys
from pathlib import Path
from typing import Dict, List, Optional
from urllib.parse import urlparse


class RepositoryCloner:
    """Clone repositories at specific commit SHAs."""

    def __init__(self, output_dir: str = ".", log_file: str = "clone_log.json"):
        """
        Initialize the cloner.
        
        Args:
            output_dir: Directory where repositories will be cloned
            log_file: Name of the JSON log file to create
        """
        self.output_dir = Path(output_dir).resolve()
        self.log_file = Path(log_file)
        self.log_data: List[Dict] = []
        self.output_dir.mkdir(parents=True, exist_ok=True)

    def extract_repo_info(self, url: str) -> Optional[tuple]:
        """
        Extract owner and repo name from GitHub URL.
        
        Args:
            url: GitHub commit URL
            
        Returns:
            Tuple of (owner, repo_name) or None if parsing fails
        """
        # Parse GitHub URL: https://github.com/owner/repo/commit/sha
        match = re.match(r'https://github\.com/([^/]+)/([^/]+)/commit/', url)
        if match:
            return match.group(1), match.group(2)
        return None

    def get_folder_name(self, repo_name: str, sha: str) -> str:
        """
        Generate folder name in format: {repo_name}-{SHA}
        
        Args:
            repo_name: Repository name
            sha: Commit SHA
            
        Returns:
            Folder name
        """
        # Clean repo name (remove special chars that might cause issues)
        clean_name = re.sub(r'[^\w\-_.]', '-', repo_name)
        return f"{clean_name}-{sha}"

    def clone_repository(self, owner: str, repo: str, sha: str, folder_name: str) -> Dict:
        """
        Clone a repository at a specific commit SHA.
        
        Args:
            owner: Repository owner
            repo: Repository name
            sha: Commit SHA to checkout
            folder_name: Name for the cloned folder
            
        Returns:
            Dictionary with clone status and information
        """
        repo_url = f"https://github.com/{owner}/{repo}.git"
        target_path = self.output_dir / folder_name
        
        result = {
            "url": f"https://github.com/{owner}/{repo}/commit/{sha}",
            "folder": str(target_path),
            "status": "unknown",
            "error": None
        }
        
        # Check if folder already exists
        if target_path.exists():
            print(f"⚠️  Folder already exists: {folder_name}")
            result["status"] = "exists"
            return result
        
        try:
            print(f"📦 Cloning {owner}/{repo} at commit {sha[:8]}...")
            
            # Clone the repository (shallow clone for speed)
            clone_cmd = [
                "git", "clone",
                "--depth", "1",  # Shallow clone
                repo_url,
                str(target_path)
            ]
            
            clone_result = subprocess.run(
                clone_cmd,
                capture_output=True,
                text=True,
                timeout=300  # 5 minute timeout
            )
            
            if clone_result.returncode != 0:
                # Try without shallow clone if that fails
                print(f"  ⚠️  Shallow clone failed, trying full clone...")
                clone_cmd = ["git", "clone", repo_url, str(target_path)]
                clone_result = subprocess.run(
                    clone_cmd,
                    capture_output=True,
                    text=True,
                    timeout=600  # 10 minute timeout for full clone
                )
            
            if clone_result.returncode != 0:
                result["status"] = "failed"
                result["error"] = clone_result.stderr.strip()
                print(f"  ❌ Clone failed: {clone_result.stderr.strip()}")
                return result
            
            # Checkout the specific commit
            print(f"  🔍 Checking out commit {sha}...")
            checkout_cmd = ["git", "checkout", sha]
            checkout_result = subprocess.run(
                checkout_cmd,
                cwd=target_path,
                capture_output=True,
                text=True,
                timeout=60
            )
            
            if checkout_result.returncode != 0:
                # If shallow clone, we might need to fetch more
                print(f"  ⚠️  Commit not found in shallow clone, fetching...")
                fetch_cmd = ["git", "fetch", "--unshallow"]
                subprocess.run(fetch_cmd, cwd=target_path, capture_output=True, timeout=300)
                
                # Try checkout again
                checkout_result = subprocess.run(
                    checkout_cmd,
                    cwd=target_path,
                    capture_output=True,
                    text=True,
                    timeout=60
                )
            
            if checkout_result.returncode != 0:
                result["status"] = "failed"
                result["error"] = f"Checkout failed: {checkout_result.stderr.strip()}"
                print(f"  ❌ Checkout failed: {checkout_result.stderr.strip()}")
                # Clean up failed clone
                import shutil
                if target_path.exists():
                    shutil.rmtree(target_path)
                return result
            
            result["status"] = "success"
            print(f"  ✅ Successfully cloned to {folder_name}")
            return result
            
        except subprocess.TimeoutExpired:
            result["status"] = "failed"
            result["error"] = "Timeout during clone/checkout"
            print(f"  ❌ Timeout while cloning {owner}/{repo}")
            # Clean up
            import shutil
            if target_path.exists():
                shutil.rmtree(target_path)
            return result
        except Exception as e:
            result["status"] = "failed"
            result["error"] = str(e)
            print(f"  ❌ Error: {e}")
            # Clean up
            import shutil
            if target_path.exists():
                shutil.rmtree(target_path)
            return result

    def process_commits(self, commits_file: str, skip_existing: bool = True):
        """
        Process all commits from the JSON file.
        
        Args:
            commits_file: Path to performance_cost_commits.json
            skip_existing: Skip repositories that are already cloned
        """
        # Read commits file
        commits_path = Path(commits_file)
        if not commits_path.exists():
            print(f"❌ File not found: {commits_file}")
            sys.exit(1)
        
        with open(commits_path, 'r', encoding='utf-8') as f:
            commits = json.load(f)
        
        print(f"📋 Found {len(commits)} commits to process\n")
        
        # Process each commit
        for i, commit in enumerate(commits, 1):
            url = commit.get('URL', '')
            sha = commit.get('SHA', '')
            
            if not url or not sha:
                print(f"⚠️  Skipping commit {i}: missing URL or SHA")
                continue
            
            # Extract repo info
            repo_info = self.extract_repo_info(url)
            if not repo_info:
                print(f"⚠️  Skipping commit {i}: could not parse URL: {url}")
                self.log_data.append({
                    "url": url,
                    "folder": None,
                    "status": "failed",
                    "error": "Could not parse URL"
                })
                continue
            
            owner, repo = repo_info
            folder_name = self.get_folder_name(repo, sha)
            
            # Skip if exists and skip_existing is True
            if skip_existing and (self.output_dir / folder_name).exists():
                print(f"⏭️  Skipping {i}/{len(commits)}: {folder_name} (already exists)")
                self.log_data.append({
                    "url": url,
                    "folder": str(self.output_dir / folder_name),
                    "status": "exists",
                    "error": None
                })
                continue
            
            print(f"\n[{i}/{len(commits)}] Processing: {owner}/{repo}")
            
            # Clone repository
            result = self.clone_repository(owner, repo, sha, folder_name)
            self.log_data.append(result)
            
            # Save log after each clone (in case of interruption)
            self.save_log()

    def save_log(self):
        """Save the log data to JSON file."""
        with open(self.log_file, 'w', encoding='utf-8') as f:
            json.dump(self.log_data, f, indent=2, ensure_ascii=False)
        print(f"💾 Log saved to {self.log_file}")

    def print_summary(self):
        """Print summary of cloning results."""
        total = len(self.log_data)
        success = sum(1 for entry in self.log_data if entry["status"] == "success")
        exists = sum(1 for entry in self.log_data if entry["status"] == "exists")
        failed = sum(1 for entry in self.log_data if entry["status"] == "failed")
        
        print("\n" + "="*60)
        print("📊 CLONING SUMMARY")
        print("="*60)
        print(f"Total commits: {total}")
        print(f"✅ Successfully cloned: {success}")
        print(f"⏭️  Already existed: {exists}")
        print(f"❌ Failed: {failed}")
        print(f"💾 Log saved to: {self.log_file}")
        print("="*60)


def main():
    """Main entry point."""
    import argparse
    
    parser = argparse.ArgumentParser(
        description="Clone repositories from performance_cost_commits.json at specific commit SHAs"
    )
    parser.add_argument(
        "--commits-file",
        type=str,
        default="Research Data/Github_Scripting/performance_cost_commits.json",
        help="Path to performance_cost_commits.json (default: Research Data/Github_Scripting/performance_cost_commits.json)"
    )
    parser.add_argument(
        "--output-dir",
        type=str,
        default=".",
        help="Directory where repositories will be cloned (default: current directory)"
    )
    parser.add_argument(
        "--log-file",
        type=str,
        default="clone_log.json",
        help="Name of the JSON log file (default: clone_log.json)"
    )
    parser.add_argument(
        "--no-skip-existing",
        action="store_true",
        help="Re-clone repositories even if they already exist"
    )
    
    args = parser.parse_args()
    
    # Create cloner
    cloner = RepositoryCloner(
        output_dir=args.output_dir,
        log_file=args.log_file
    )
    
    # Process commits
    try:
        cloner.process_commits(
            commits_file=args.commits_file,
            skip_existing=not args.no_skip_existing
        )
    except KeyboardInterrupt:
        print("\n\n⚠️  Interrupted by user. Saving progress...")
        cloner.save_log()
        sys.exit(1)
    
    # Print summary
    cloner.print_summary()


if __name__ == "__main__":
    main()
