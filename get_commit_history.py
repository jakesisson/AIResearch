#!/usr/bin/env python3
"""
Extract commit history for cloned repositories.

For each successfully cloned repository, this script:
1. Gets the commit history
2. Finds the commit prior to the researched commit
3. Extracts commit dates/times
4. Creates a repository object with all this information
"""

import json
import subprocess
import sys
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional


class CommitHistoryExtractor:
    """Extract commit history from cloned repositories."""

    def __init__(self, log_file: str = "clone_log.json", output_file: str = "repository_history.json"):
        """
        Initialize the extractor.
        
        Args:
            log_file: Path to clone_log.json
            output_file: Path to output JSON file
        """
        self.log_file = Path(log_file)
        self.output_file = Path(output_file)
        self.repositories: List[Dict] = []

    def get_base_url(self, commit_url: str) -> str:
        """
        Extract base repository URL from commit URL.
        
        Args:
            commit_url: Full GitHub commit URL
            
        Returns:
            Base repository URL
        """
        # Convert: https://github.com/owner/repo/commit/sha
        # To: https://github.com/owner/repo
        if '/commit/' in commit_url:
            return commit_url.split('/commit/')[0]
        return commit_url

    def get_commit_info(self, repo_path: Path, commit_sha: str) -> Optional[Dict]:
        """
        Get detailed information about a specific commit.
        
        Args:
            repo_path: Path to repository
            commit_sha: Commit SHA (can be partial or full)
            
        Returns:
            Dictionary with commit info or None if not found
        """
        try:
            # Get commit details: SHA, author, date, message
            cmd = [
                "git", "log",
                "-1",  # Only one commit
                "--format=%H|%an|%ae|%ad|%s",  # SHA|Author Name|Author Email|Date|Subject
                "--date=iso-strict",  # ISO 8601 format
                commit_sha
            ]
            
            result = subprocess.run(
                cmd,
                cwd=repo_path,
                capture_output=True,
                text=True,
                timeout=30
            )
            
            if result.returncode != 0:
                return None
            
            parts = result.stdout.strip().split('|', 4)
            if len(parts) != 5:
                return None
            
            return {
                "sha": parts[0],
                "author_name": parts[1],
                "author_email": parts[2],
                "date": parts[3],
                "message": parts[4]
            }
        except Exception as e:
            print(f"  ⚠️  Error getting commit info: {e}")
            return None

    def get_prior_commit(self, repo_path: Path, commit_sha: str) -> Optional[Dict]:
        """
        Get the commit immediately prior to the specified commit.
        
        Args:
            repo_path: Path to repository
            commit_sha: Commit SHA to find prior commit for
            
        Returns:
            Dictionary with prior commit info or None
        """
        try:
            # Get the parent commit
            cmd = [
                "git", "log",
                "-1",  # Only one commit
                "--format=%H|%an|%ae|%ad|%s",
                "--date=iso-strict",
                f"{commit_sha}^"  # Parent commit
            ]
            
            result = subprocess.run(
                cmd,
                cwd=repo_path,
                capture_output=True,
                text=True,
                timeout=30
            )
            
            if result.returncode != 0:
                # Try alternative: get commit before this one
                cmd = [
                    "git", "log",
                    "-1",  # Only one commit
                    "--format=%H|%an|%ae|%ad|%s",
                    "--date=iso-strict",
                    "--skip=1",  # Skip the current commit
                    commit_sha
                ]
                result = subprocess.run(
                    cmd,
                    cwd=repo_path,
                    capture_output=True,
                    text=True,
                    timeout=30
                )
                
                if result.returncode != 0:
                    return None
            
            parts = result.stdout.strip().split('|', 4)
            if len(parts) != 5:
                return None
            
            return {
                "sha": parts[0],
                "author_name": parts[1],
                "author_email": parts[2],
                "date": parts[3],
                "message": parts[4]
            }
        except Exception as e:
            print(f"  ⚠️  Error getting prior commit: {e}")
            return None

    def get_commit_history(self, repo_path: Path, limit: int = 50) -> List[Dict]:
        """
        Get commit history for the repository.
        
        Args:
            repo_path: Path to repository
            limit: Maximum number of commits to retrieve
            
        Returns:
            List of commit dictionaries
        """
        try:
            cmd = [
                "git", "log",
                f"-{limit}",  # Limit number of commits
                "--format=%H|%an|%ae|%ad|%s",
                "--date=iso-strict",
                "--all"  # Include all branches
            ]
            
            result = subprocess.run(
                cmd,
                cwd=repo_path,
                capture_output=True,
                text=True,
                timeout=60
            )
            
            if result.returncode != 0:
                return []
            
            commits = []
            for line in result.stdout.strip().split('\n'):
                if not line:
                    continue
                parts = line.split('|', 4)
                if len(parts) == 5:
                    commits.append({
                        "sha": parts[0],
                        "author_name": parts[1],
                        "author_email": parts[2],
                        "date": parts[3],
                        "message": parts[4]
                    })
            
            return commits
        except Exception as e:
            print(f"  ⚠️  Error getting commit history: {e}")
            return []

    def extract_repository_info(self, log_entry: Dict) -> Optional[Dict]:
        """
        Extract all information for a repository.
        
        Args:
            log_entry: Entry from clone_log.json
            
        Returns:
            Repository object with all commit information
        """
        if log_entry.get("status") == "failed" or not log_entry.get("folder"):
            return None
        
        repo_path = Path(log_entry["folder"])
        if not repo_path.exists():
            print(f"⚠️  Repository folder not found: {repo_path}")
            return None
        
        commit_url = log_entry["url"]
        base_url = self.get_base_url(commit_url)
        
        # Extract commit SHA from URL
        commit_sha = commit_url.split('/commit/')[-1].split('#')[0]
        
        print(f"📖 Processing: {repo_path.name}")
        print(f"   Commit: {commit_sha[:8]}...")
        
        # Get researched commit info
        researched_commit = self.get_commit_info(repo_path, commit_sha)
        if not researched_commit:
            print(f"  ❌ Could not find researched commit {commit_sha}")
            return None
        
        # Get prior commit
        print(f"   Finding prior commit...")
        prior_commit = self.get_prior_commit(repo_path, commit_sha)
        
        # Get commit history
        print(f"   Getting commit history...")
        commit_history = self.get_commit_history(repo_path, limit=100)
        
        repo_info = {
            "base_url": base_url,
            "folder": str(repo_path),
            "researched_commit": researched_commit,
            "prior_commit": prior_commit,
            "commit_history": commit_history,
            "total_commits_in_history": len(commit_history)
        }
        
        print(f"   ✅ Found {len(commit_history)} commits in history")
        if prior_commit:
            print(f"   ✅ Prior commit: {prior_commit['sha'][:8]}... ({prior_commit['date']})")
        else:
            print(f"   ⚠️  No prior commit found (might be first commit)")
        
        return repo_info

    def process_all_repositories(self):
        """Process all repositories from the log file."""
        # Read clone log
        if not self.log_file.exists():
            print(f"❌ Log file not found: {self.log_file}")
            sys.exit(1)
        
        with open(self.log_file, 'r', encoding='utf-8') as f:
            log_entries = json.load(f)
        
        print(f"📋 Processing {len(log_entries)} repositories from log file\n")
        
        # Process each repository
        for i, entry in enumerate(log_entries, 1):
            if entry.get("status") == "failed":
                continue
            
            print(f"\n[{i}/{len(log_entries)}] ", end="")
            repo_info = self.extract_repository_info(entry)
            
            if repo_info:
                self.repositories.append(repo_info)
        
        # Save results
        self.save_results()

    def save_results(self):
        """Save extracted repository information to JSON file."""
        output_data = {
            "extracted_at": datetime.now().isoformat(),
            "total_repositories": len(self.repositories),
            "repositories": self.repositories
        }
        
        with open(self.output_file, 'w', encoding='utf-8') as f:
            json.dump(output_data, f, indent=2, ensure_ascii=False)
        
        print(f"\n💾 Results saved to {self.output_file}")
        print(f"📊 Extracted information for {len(self.repositories)} repositories")

    def print_summary(self):
        """Print summary of extracted information."""
        print("\n" + "="*60)
        print("📊 EXTRACTION SUMMARY")
        print("="*60)
        print(f"Total repositories processed: {len(self.repositories)}")
        
        with_prior = sum(1 for r in self.repositories if r.get("prior_commit"))
        without_prior = len(self.repositories) - with_prior
        
        print(f"  ✅ With prior commit: {with_prior}")
        print(f"  ⚠️  Without prior commit: {without_prior}")
        
        total_commits = sum(r.get("total_commits_in_history", 0) for r in self.repositories)
        print(f"  📝 Total commits in history: {total_commits}")
        print("="*60)


def main():
    """Main entry point."""
    import argparse
    
    parser = argparse.ArgumentParser(
        description="Extract commit history from cloned repositories"
    )
    parser.add_argument(
        "--log-file",
        type=str,
        default="clone_log.json",
        help="Path to clone_log.json (default: clone_log.json)"
    )
    parser.add_argument(
        "--output-file",
        type=str,
        default="repository_history.json",
        help="Path to output JSON file (default: repository_history.json)"
    )
    
    args = parser.parse_args()
    
    extractor = CommitHistoryExtractor(
        log_file=args.log_file,
        output_file=args.output_file
    )
    
    try:
        extractor.process_all_repositories()
        extractor.print_summary()
    except KeyboardInterrupt:
        print("\n\n⚠️  Interrupted by user. Saving progress...")
        extractor.save_results()
        sys.exit(1)


if __name__ == "__main__":
    main()
