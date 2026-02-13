#!/usr/bin/env python3
"""
Extract commit history using GitHub API (no cloning required).

For each repository in clone_log.json, this script:
1. Uses GitHub API to get commit information
2. Finds the commit prior to the researched commit
3. Extracts commit history with dates/times
4. Creates repository objects with all this information

Uses Python's built-in urllib (no external dependencies required).
"""

import json
import ssl
import sys
import time
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional
from urllib.parse import urlparse
from urllib.request import Request, urlopen
from urllib.error import HTTPError, URLError


class GitHubAPIExtractor:
    """Extract commit history using GitHub API."""

    def __init__(
        self,
        log_file: str = "clone_log.json",
        output_file: str = "repository_history.json",
        github_token: Optional[str] = None
    ):
        """
        Initialize the extractor.
        
        Args:
            log_file: Path to clone_log.json
            output_file: Path to output JSON file
            github_token: GitHub personal access token (optional, increases rate limit)
        """
        self.log_file = Path(log_file)
        self.output_file = Path(output_file)
        self.repositories: List[Dict] = []
        self.github_token = github_token or self._get_token_from_env()
        
        # Setup API headers
        self.headers = {
            "Accept": "application/vnd.github.v3+json",
            "User-Agent": "CommitHistoryExtractor"
        }
        if self.github_token:
            self.headers["Authorization"] = f"token {self.github_token}"
        
        self.base_url = "https://api.github.com"
        self.rate_limit_remaining = None

    def _get_token_from_env(self) -> Optional[str]:
        """Get GitHub token from environment variable."""
        import os
        return os.getenv("GITHUB_TOKEN") or os.getenv("GH_TOKEN")

    def _make_request(self, url: str, params: Optional[Dict] = None) -> Optional[Dict]:
        """
        Make HTTP request to GitHub API.
        
        Args:
            url: API URL
            params: Query parameters
            
        Returns:
            JSON response as dictionary or None
        """
        # Add query parameters
        if params:
            query_string = "&".join(f"{k}={v}" for k, v in params.items())
            url = f"{url}?{query_string}"
        
        try:
            # Create SSL context that doesn't verify certificates (for macOS compatibility)
            # Note: This is less secure but necessary if certificates aren't properly configured
            ssl_context = ssl.create_default_context()
            ssl_context.check_hostname = False
            ssl_context.verify_mode = ssl.CERT_NONE
            
            req = Request(url, headers=self.headers)
            with urlopen(req, timeout=30, context=ssl_context) as response:
                # Get rate limit info
                self.rate_limit_remaining = int(
                    response.headers.get("X-RateLimit-Remaining", 0)
                )
                
                data = response.read().decode('utf-8')
                return json.loads(data)
        except HTTPError as e:
            if e.code == 404:
                return None
            if e.code == 403:
                print(f"  ⚠️  Rate limited or forbidden. Status: {e.code}")
                # Try to get rate limit info from headers
                if hasattr(e, 'headers'):
                    remaining = int(e.headers.get("X-RateLimit-Remaining", 0))
                    if remaining == 0:
                        reset_time = int(e.headers.get("X-RateLimit-Reset", 0))
                        wait_time = max(0, reset_time - int(time.time())) + 5
                        print(f"  ⏳ Waiting {wait_time} seconds for rate limit reset...")
                        time.sleep(wait_time)
                        return self._make_request(url.split('?')[0], params)
                return None
            print(f"  ⚠️  HTTP error {e.code}: {e.reason}")
            return None
        except (URLError, json.JSONDecodeError) as e:
            print(f"  ⚠️  Request error: {e}")
            return None

    def check_rate_limit(self):
        """Check and handle rate limiting."""
        if self.rate_limit_remaining is not None and self.rate_limit_remaining < 10:
            print(f"  ⚠️  Rate limit low ({self.rate_limit_remaining} remaining)")
            if self.rate_limit_remaining == 0:
                print("  ⏳ Rate limit exceeded. Waiting 60 seconds...")
                time.sleep(60)

    def get_repo_info(self, commit_url: str) -> Optional[tuple]:
        """
        Extract owner and repo from GitHub commit URL.
        
        Args:
            commit_url: Full GitHub commit URL
            
        Returns:
            Tuple of (owner, repo) or None
        """
        # Parse: https://github.com/owner/repo/commit/sha
        parts = commit_url.replace("https://github.com/", "").split("/")
        if len(parts) >= 2:
            return parts[0], parts[1]
        return None

    def get_commit_info(self, owner: str, repo: str, sha: str) -> Optional[Dict]:
        """
        Get commit information from GitHub API.
        
        Args:
            owner: Repository owner
            repo: Repository name
            sha: Commit SHA
            
        Returns:
            Dictionary with commit info or None
        """
        self.check_rate_limit()
        
        url = f"{self.base_url}/repos/{owner}/{repo}/commits/{sha}"
        data = self._make_request(url)
        
        if not data:
            return None
        
        return {
            "sha": data["sha"],
            "author_name": data["commit"]["author"]["name"],
            "author_email": data["commit"]["author"]["email"],
            "date": data["commit"]["author"]["date"],
            "message": data["commit"]["message"].split("\n")[0]  # First line only
        }

    def get_prior_commit(self, owner: str, repo: str, sha: str) -> Optional[Dict]:
        """
        Get the commit immediately prior to the specified commit.
        
        Args:
            owner: Repository owner
            repo: Repository name
            sha: Commit SHA to find prior commit for
            
        Returns:
            Dictionary with prior commit info or None
        """
        self.check_rate_limit()
        
        # Get the commit to find its parent
        url = f"{self.base_url}/repos/{owner}/{repo}/commits/{sha}"
        data = self._make_request(url)
        
        if not data:
            return None
        
        parents = data.get("parents", [])
        if not parents:
            # This is the first commit, no prior commit
            return None
        
        # Get the first parent (most common case)
        parent_sha = parents[0]["sha"]
        return self.get_commit_info(owner, repo, parent_sha)

    def get_commit_history(self, owner: str, repo: str, sha: str, limit: int = 50) -> List[Dict]:
        """
        Get commit history for the repository.
        
        Args:
            owner: Repository owner
            repo: Repository name
            sha: Reference commit SHA
            limit: Maximum number of commits to retrieve
            
        Returns:
            List of commit dictionaries
        """
        self.check_rate_limit()
        
        url = f"{self.base_url}/repos/{owner}/{repo}/commits"
        commits = []
        page = 1
        per_page = min(limit, 100)  # GitHub API max is 100 per page
        
        while len(commits) < limit:
            params = {
                "sha": sha,
                "per_page": per_page,
                "page": page
            }
            
            data = self._make_request(url, params)
            if not data or not isinstance(data, list):
                break
            
            if len(data) == 0:
                break
            
            for commit in data:
                if len(commits) >= limit:
                    break
                commits.append({
                    "sha": commit["sha"],
                    "author_name": commit["commit"]["author"]["name"],
                    "author_email": commit["commit"]["author"]["email"],
                    "date": commit["commit"]["author"]["date"],
                    "message": commit["commit"]["message"].split("\n")[0]
                })
            
            # Check if there are more pages
            if len(data) < per_page:
                break
            
            page += 1
            
            # Small delay to avoid hitting rate limits
            time.sleep(0.1)
        
        return commits

    def extract_repository_info(self, log_entry: Dict) -> Optional[Dict]:
        """
        Extract all information for a repository using GitHub API.
        
        Args:
            log_entry: Entry from clone_log.json
            
        Returns:
            Repository object with all commit information
        """
        if log_entry.get("status") == "failed":
            return None
        
        commit_url = log_entry["url"]
        base_url = commit_url.split('/commit/')[0]
        
        # Extract repo info
        repo_info = self.get_repo_info(commit_url)
        if not repo_info:
            print(f"⚠️  Could not parse URL: {commit_url}")
            return None
        
        owner, repo = repo_info
        commit_sha = commit_url.split('/commit/')[-1].split('#')[0]
        
        print(f"📖 Processing: {owner}/{repo}")
        print(f"   Commit: {commit_sha[:8]}...")
        
        # Get researched commit info
        researched_commit = self.get_commit_info(owner, repo, commit_sha)
        if not researched_commit:
            print(f"  ❌ Could not find researched commit {commit_sha}")
            return None
        
        # Get prior commit
        print(f"   Finding prior commit...")
        prior_commit = self.get_prior_commit(owner, repo, commit_sha)
        
        # Get commit history
        print(f"   Getting commit history...")
        commit_history = self.get_commit_history(owner, repo, commit_sha, limit=100)
        
        repo_info = {
            "base_url": base_url,
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
        
        # Small delay between repositories
        time.sleep(0.5)
        
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
        
        if self.github_token:
            print("✅ Using GitHub token (higher rate limit: 5000/hour)")
        else:
            print("⚠️  No GitHub token found. Using unauthenticated API (rate limit: 60/hour)")
            print("   Set GITHUB_TOKEN environment variable for better rate limits")
            print("   Get token at: https://github.com/settings/tokens\n")
        
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
        description="Extract commit history using GitHub API (no cloning required)"
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
    parser.add_argument(
        "--github-token",
        type=str,
        help="GitHub personal access token (or set GITHUB_TOKEN env var)"
    )
    
    args = parser.parse_args()
    
    extractor = GitHubAPIExtractor(
        log_file=args.log_file,
        output_file=args.output_file,
        github_token=args.github_token
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
