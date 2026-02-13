#!/usr/bin/env python3
"""
gh_commit_search.py — Search Github commits by message keywords via the REST API.

Examples:
  # Find commits whose message contains ALL of: "langgraph" and "concurrency"
  python gh_commit_search.py --keywords langgraph concurrency --mode AND --since 2023-01-01 --out results.csv

  # Find commits whose message contains ANY of: "RAG", "langchain"
  python gh_commit_search.py -k RAG langchain --mode OR --org langchain-ai --out results.json

  # Limit to a single repo and fetch up to 200 results
  python gh_commit_search.py -k "retry" "timeout" --repo owner/repo --max 200
"""

import os
import sys
import time
import csv
import json
import argparse
import re
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
import urllib.parse
import requests

API_KEY = GITHUB_API_KEY

GITHUB_API = "https://api.github.com"
SEARCH_ENDPOINT = f"{GITHUB_API}/search/commits"
PER_PAGE = 100  # max allowed
SEARCH_MAX = 1000  # GitHub caps search results to 1000 across pages

# Helpful: GitHub recommends sending an API version header.
HEADERS_BASE = {
    "Accept": "application/vnd.github+json, application/vnd.github.text-match+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "gh-commit-search-script"
}


def build_query(keywords: List[str],
                mode: str,
                repo: Optional[str],
                org: Optional[str],
                user: Optional[str],
                author: Optional[str],
                committer: Optional[str],
                since: Optional[str],
                until: Optional[str]) -> str:
    """
    Build the GitHub search/commits 'q' parameter.

    Supported qualifiers (see https://docs.github.com/rest/search/search#search-commits):
      - repo:, org:, user:
      - author:, committer:
      - author-date:, committer-date:
      - message: (used here to constrain by commit message)
    """
    
    terms = []

    # message keyword logic
    clean = [kw.strip() for kw in keywords if kw.strip()]
    if not clean:
        raise ValueError("At least one non-empty keyword is required.")

    def quote(s: str) -> str:
        # quote inside message:"..."; escape embedded quotes
        s = s.replace('"', '\\"')
        return f'message:"{s}"'

    if mode.upper() == "AND":
        # All keywords must appear
        terms.extend(quote(kw) for kw in clean)
    elif mode.upper() == "OR":
        # Any keyword can appear — group with parentheses
        or_group = " OR ".join(quote(kw) for kw in clean)
        terms.append(f"({or_group})")
    else:
        raise ValueError("--mode must be AND or OR")

    # optional qualifiers
    if repo:
        terms.append(f"repo:{repo}")
    if org:
        terms.append(f"org:{org}")
    if user:
        terms.append(f"user:{user}")
    if author:
        terms.append(f"author:{author}")
    if committer:
        terms.append(f"committer:{committer}")
    if since or until:
        # Prefer committer-date range (you can switch to author-date if you prefer)
        rng = f"{since or '*'}..{until or '*'}"
        terms.append(f"committer-date:{rng}")

    # combine
    q = " ".join(terms).strip()
    return q


def parse_owner_repo_from_url(html_url: str) -> Optional[str]:
    """
    From https://github.com/{owner}/{repo}/commit/{sha} return 'owner/repo'.
    """
    m = re.match(r"https?://github\.com/([^/]+)/([^/]+)/commit/", html_url)
    if m:
        return f"{m.group(1)}/{m.group(2)}"
    return None


def maybe_sleep_for_rate_limit(resp: requests.Response):
    """
    If we're rate-limited or about to be, sleep until reset time.
    Search API (authenticated) is typically 30 req/min.
    """
    if resp.status_code == 403:
        # Could be rate limit. Respect reset header if present.
        reset = resp.headers.get("X-RateLimit-Reset")
        if reset:
            reset_ts = int(reset)
            now = int(time.time())
            sleep_s = max(0, reset_ts - now + 2)
            print(f"[rate-limit] Sleeping {sleep_s}s until reset…", file=sys.stderr)
            time.sleep(sleep_s)
            return

    # If remaining is 0, also sleep to reset
    remaining = resp.headers.get("X-RateLimit-Remaining")
    reset = resp.headers.get("X-RateLimit-Reset")
    if remaining is not None and reset is not None and remaining == "0":
        reset_ts = int(reset)
        now = int(time.time())
        sleep_s = max(0, reset_ts - now + 2)
        print(f"[rate-limit] Remaining=0. Sleeping {sleep_s}s until reset…", file=sys.stderr)
        time.sleep(sleep_s)


def search_commits(q: str, token: str, max_results: int) -> List[Dict[str, Any]]:
    """
    Page through /search/commits and collect results (up to GitHub's 1000 cap or user max).
    """
    headers = HEADERS_BASE.copy()
    headers["Authorization"] = f"Bearer {token}"

    all_items: List[Dict[str, Any]] = []
    page = 1
    to_fetch = min(max_results, SEARCH_MAX)

    session = requests.Session()
    while len(all_items) < to_fetch:
        params = {
            "q": q,
            "per_page": PER_PAGE,
            "page": page,
            "sort": "committer-date",
            "order": "desc",
        }
        url = f"{SEARCH_ENDPOINT}?{urllib.parse.urlencode(params)}"
        resp = session.get(url, headers=headers, timeout=30)

        # Handle rate limits politely
        if resp.status_code == 403:
            maybe_sleep_for_rate_limit(resp)
            # retry once after sleep
            resp = session.get(url, headers=headers, timeout=30)

        if resp.status_code != 200:
            try:
                payload = resp.json()
            except Exception:
                payload = {"message": resp.text}
            raise RuntimeError(f"GitHub API error {resp.status_code}: {payload.get('message')}")

        data = resp.json()
        items = data.get("items", [])
        if not items:
            break

        # Cut off if we would exceed to_fetch
        take = min(len(items), to_fetch - len(all_items))
        all_items.extend(items[:take])

        # Stop early if we've covered all possible pages
        if len(items) < PER_PAGE or len(all_items) >= to_fetch:
            break

        page += 1

    return all_items

def normalize_items(items: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Convert raw search items to a neat, analysis-friendly schema.
    """
    rows = []
    for it in items:
        commit = it.get("commit", {}) or {}
        message = commit.get("message", "")
        committer_info = commit.get("committer") or {}
        author_info = commit.get("author") or {}

        html_url = it.get("html_url", "")
        sha = it.get("sha")
        owner_repo = parse_owner_repo_from_url(html_url) or ""
        text_matches = it.get("text_matches", None)

        rows.append({
            "sha": sha,
            "html_url": html_url,
            "repo": owner_repo,
            "committer_login": (it.get("committer") or {}).get("login"),
        })
    return rows


def write_output(rows: List[Dict[str, Any]], path: str):
    """
    Write results to CSV or JSON depending on file extension.
    """
    if not rows:
        print("No results to write.")
        return

    # Filter out rows already present in results_clean.csv by sha
    existing_shas = set()
    existing_path = "results_clean_unquoted.csv"
    if os.path.exists(existing_path):
        try:
            with open(existing_path, "r", encoding="utf-8", newline="") as f:
                reader = csv.DictReader(f)
                for rec in reader:
                    sha_val = rec.get("sha")
                    if sha_val:
                        existing_shas.add(sha_val)
        except Exception as e:
            print(f"Warning: could not read {existing_path}: {e}", file=sys.stderr)

    filtered = [r for r in rows if r.get("sha") and r.get("sha") not in existing_shas]
    if not filtered:
        print("No new results to write (all present in results_clean.csv).")
        return
    rows = filtered

    ext = os.path.splitext(path)[1].lower()
    if ext in (".json", ".ndjson"):
        # JSON array for .json; line-delimited JSON for .ndjson
        if ext == ".json":
            with open(path, "w", encoding="utf-8") as f:
                json.dump(rows, f, ensure_ascii=False, indent=2)
        else:
            with open(path, "w", encoding="utf-8") as f:
                for r in rows:
                    f.write(json.dumps(r, ensure_ascii=False) + "\n")
    elif ext == ".csv":
        # Flatten keys for CSV; omit commit message from CSV output
        keys = [k for k in rows[0].keys() if k != "message"]

        # Append if file exists; write header only for new/empty files
        file_exists = os.path.exists(path)
        header_needed = (not file_exists) or (os.path.getsize(path) == 0)
        mode = "a" if file_exists else "w"

        with open(path, mode, encoding="utf-8", newline="") as f:
            writer = csv.DictWriter(f, fieldnames=keys)
            if header_needed:
                writer.writeheader()
            for r in rows:
                # Avoid dumping giant text_matches object into CSV
                r2 = r.copy()
                if isinstance(r2.get("text_matches"), list):
                    r2["text_matches"] = json.dumps(r2["text_matches"], ensure_ascii=False)
                # Ensure commit message is not written to CSV
                r2.pop("message", None)
                writer.writerow(r2)
    else:
        raise ValueError("Output must end with .json, .ndjson, or .csv")

    print(f"Wrote {len(rows)} results to {path}")


def valid_iso_date(s: str) -> str:
    # Simple validator for YYYY-MM-DD
    try:
        datetime.strptime(s, "%Y-%m-%d")
        return s
    except ValueError:
        raise argparse.ArgumentTypeError("Use YYYY-MM-DD (e.g., 2024-01-31)")


def main():
    ap = argparse.ArgumentParser(description="Search GitHub commits by commit-message keywords.")
    ap.add_argument("-k", "--keywords", nargs="+", required=True,
                    help="Keywords to search for in commit messages. Wrap multi-word phrases in quotes.")
    ap.add_argument("--mode", choices=["AND", "OR"], default="AND",
                    help="Require ALL keywords (AND) or ANY keyword (OR). Default AND.")
    ap.add_argument("--repo", help="Limit to a repository, e.g. owner/name")
    ap.add_argument("--org", help="Limit to an organization, e.g. langchain-ai")
    ap.add_argument("--user", help="Limit to a user account (commit authored in repos they own).")
    ap.add_argument("--author", help="Limit by author username or email.")
    ap.add_argument("--committer", help="Limit by committer username or email.")
    ap.add_argument("--since", type=valid_iso_date, help="Commits from this date (YYYY-MM-DD).")
    ap.add_argument("--until", type=valid_iso_date, help="Commits up to this date (YYYY-MM-DD).")
    ap.add_argument("--max", type=int, default=500,
                    help="Maximum results to collect (<=1000 due to GitHub search cap). Default 500.")
    ap.add_argument("--out", default="commits.json",
                    help="Output path (.json, .ndjson, or .csv). Default commits.json")
    ap.add_argument("--dry-run", action="store_true",
                    help="Print the constructed query and exit.")
    
    args = ap.parse_args()

    # token = os.getenv("GITHUB_TOKEN")
    token = API_KEY
    if not token:
        print("ERROR: Please set GITHUB_TOKEN environment variable.", file=sys.stderr)
        sys.exit(1)

    q = build_query(
        keywords=args.keywords,
        mode=args.mode,
        repo=args.repo,
        org=args.org,
        user=args.user,
        author=args.author,
        committer=args.committer,
        since=args.since,
        until=args.until,
    )

    if args.dry_run:
        print("Search query string:")
        print(q)
        sys.exit(0)

    print(f"Query: {q}", file=sys.stderr)
    items = search_commits(q, token, max_results=args.max)
    rows = normalize_items(items)

    write_output(rows, args.out)


if __name__ == "__main__":
    main()
