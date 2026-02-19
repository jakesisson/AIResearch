# Diffs (prior vs researched)

This folder holds **researched_vs_prior.json** for each project: the output of comparing the **prior** and **researched** commits (same format as GitHub Compare).

## Regenerating diffs

From the **Research** repo root:

```bash
python3 generate_diffs.py
```

- Reads **repository_history_reduced.json** (prior/researched commit URLs and project paths).
- For each repo, calls GitHub Compare API: `GET /repos/{owner}/{repo}/compare/{prior_sha}...{researched_sha}`.
- Writes **diffs/<project_folder>/researched_vs_prior.json** and **diffs/summary.json**.

**Rate limits:** Without `GITHUB_TOKEN`, GitHub allows 60 requests/hour. To avoid limits, set a token:

```bash
export GITHUB_TOKEN=your_github_token
python3 generate_diffs.py
```

## Output format

Each **researched_vs_prior.json** contains:

- **project**: e.g. `"Research Data/agents"`
- **repo**: e.g. `"danny-avila/agents"`
- **prior_commit**, **researched_commit**: full SHA
- **compare_url**: GitHub compare page
- **ahead_by**, **behind_by**: commit counts
- **changed_files**: list of `{ path, status, additions, deletions, patch, patch_lines }`

## Source script

**generate_diffs.py** (in Research root) – uses only the standard library. If you see SSL certificate errors (e.g. on macOS), run `pip install certifi` and the script will use certifi’s CA bundle.
