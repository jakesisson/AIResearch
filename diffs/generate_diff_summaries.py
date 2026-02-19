#!/usr/bin/env python3
"""
Generate a diff summary document for each subfolder in diffs/ that contains
a researched_vs_prior.json file. Each document describes what the diff is doing.
"""

import json
import re
from pathlib import Path


def infer_change_description(patch: str, path: str, status: str) -> str:
    """Infer a short human-readable description from the patch content."""
    if not patch or not patch.strip():
        return "Content changed."
    lines = patch.replace("\\n", "\n").split("\n")
    added_terms = []
    removed_terms = []
    for line in lines:
        if line.startswith("@@"):
            continue
        if line.startswith("+") and not line.startswith("+++"):
            s = line[1:].strip()
            if len(s) > 80:
                s = s[:77] + "..."
            if s and not s.isspace():
                added_terms.append(s)
        elif line.startswith("-") and not line.startswith("---"):
            s = line[1:].strip()
            if len(s) > 80:
                s = s[:77] + "..."
            if s and not s.isspace():
                removed_terms.append(s)
    # Build description from first few significant additions/removals
    desc_parts = []
    if status == "added":
        if added_terms:
            first = added_terms[0][:100]
            if first.startswith("["):
                desc_parts.append("New config or list.")
            elif "def " in first or "function " in first or "class " in first:
                desc_parts.append("New code (functions/classes).")
            elif "import " in first:
                desc_parts.append("New module with imports.")
            else:
                desc_parts.append(first)
        else:
            desc_parts.append("New file added.")
    elif status == "removed":
        desc_parts.append("File removed.")
    else:
        if added_terms and removed_terms:
            # Summarize: what was added vs removed
            add_sample = " ".join(added_terms[:2])[:80]
            rem_sample = " ".join(removed_terms[:2])[:80]
            if "import " in add_sample or "import " in rem_sample:
                desc_parts.append("Imports or dependencies changed.")
            elif "def " in add_sample or "def " in rem_sample:
                desc_parts.append("Logic or function implementation changed.")
            elif re.search(r"[\"\'](.*?)[\"\']", add_sample):
                desc_parts.append("Configuration or string content updated.")
            else:
                desc_parts.append("Implementation or content updated.")
        elif added_terms:
            desc_parts.append("Additions: e.g. " + added_terms[0][:60].replace("\n", " "))
        elif removed_terms:
            desc_parts.append("Removals or deletions.")
        else:
            desc_parts.append("Formatting or whitespace changes.")
    return " ".join(desc_parts)[:200].strip()


def summarize_patch_themes(patch: str) -> list[str]:
    """Extract recurring themes (e.g. 'error handling', 'trimMessages') from patch."""
    if not patch:
        return []
    text = patch.replace("\\n", " ").replace("\n", " ")
    themes = []
    patterns = [
        (r"trimMessages|trim.*message|message.*trim", "message trimming"),
        (r"error.*handl|handl.*error|try.*except", "error handling"),
        (r"test|spec\.ts|\.test\.|pytest|jest", "tests"),
        (r"eslint|prettier|\.eslintrc|\.prettier", "linting/formatting"),
        (r"type.*check|mypy|pyright|basedpyright", "type checking"),
        (r"coverage|\.coveragerc|coverage\.xml", "test coverage"),
        (r"pre-commit|pre_commit", "pre-commit hooks"),
        (r"docker|Dockerfile", "Docker"),
        (r"CI|github.*workflow|\.yml.*workflow", "CI/CD"),
        (r"langgraph|StateGraph|addNode|add_node", "LangGraph workflow"),
        (r"LangChain|langchain|ChatOpenAI|ChatGroq", "LangChain/LLM"),
        (r"gemini|openai|anthropic", "LLM provider"),
        (r"RAG|retrieval|vectorstore|embedding", "RAG/retrieval"),
        (r"schema|Schema|Pydantic|TypedDict", "schemas/types"),
        (r"API|endpoint|route|router", "API/routes"),
        (r"auth|login|token|JWT", "authentication"),
    ]
    for pattern, label in patterns:
        if re.search(pattern, text, re.I):
            themes.append(label)
    return themes[:5]


def generate_doc(data: dict, out_path: Path, category: str | None = None, tech_debt: str | None = None) -> None:
    """Generate a single diff summary markdown document."""
    project = data.get("project", "Unknown")
    repo = data.get("repo", "")
    prior = data.get("prior_commit", "")[:8]
    researched = data.get("researched_commit", "")[:8]
    compare_url = data.get("compare_url", "")
    ahead = data.get("ahead_by", 0)
    behind = data.get("behind_by", 0)
    files = data.get("changed_files", [])

    total_add = sum(f.get("additions", 0) for f in files)
    total_del = sum(f.get("deletions", 0) for f in files)

    # Overall themes across all patches
    all_themes = []
    for f in files:
        all_themes.extend(summarize_patch_themes(f.get("patch", "")))
    unique_themes = list(dict.fromkeys(all_themes))

    category_label = category if category else "—"
    lines = [
        "# Diff Summary",
        "",
        f"**Project:** {project}  ",
        f"**Repo:** `{repo}`  ",
        f"**Commit range:** `{prior}` → `{researched}` (researched commit is {ahead} ahead, {behind} behind).",
        f"**Category (researched commit):** {category_label}  ",
        "",
        f"[Compare on GitHub]({compare_url})",
        "",
        "## Summary",
        "",
        f"- **Files changed:** {len(files)}",
        f"- **Lines added:** {total_add}",
        f"- **Lines removed:** {total_del}",
        "",
    ]

    if unique_themes:
        lines.extend(["**Themes:** " + ", ".join(unique_themes), ""])
    if tech_debt:
        lines.extend([f"**Tech debt (from TruePositiveCommitsClean):** {tech_debt}", ""])

    lines.extend(["## Changes by file", ""])

    for f in files:
        path = f.get("path", "")
        status = f.get("status", "modified")
        add = f.get("additions", 0)
        dele = f.get("deletions", 0)
        patch = f.get("patch", "")
        desc = infer_change_description(patch, path, status)
        themes = summarize_patch_themes(patch)
        status_emoji = {"added": "➕", "removed": "➖", "modified": "✏️"}.get(status, "✏️")
        lines.append(f"### {status_emoji} `{path}`")
        lines.append("")
        lines.append(f"- **Status:** {status} | **+{add}** / **-{dele}**")
        lines.append(f"- **Description:** {desc}")
        if themes:
            lines.append(f"- **Themes:** {', '.join(themes)}")
        lines.append("")

    out_path.write_text("\n".join(lines), encoding="utf-8")
    print(f"Wrote {out_path}")


def main():
    diffs_dir = Path(__file__).resolve().parent
    summary_path = diffs_dir / "summary.json"
    category_by_diffs_file: dict[str, tuple[str | None, str | None]] = {}
    if summary_path.exists():
        with open(summary_path, "r", encoding="utf-8") as f:
            summary = json.load(f)
        for entry in summary.get("entries", []):
            key = entry.get("diffs_file", "")
            cat = entry.get("category")
            tech = entry.get("tech_debt") or None
            category_by_diffs_file[key] = (cat, tech)

    json_files = list(diffs_dir.glob("**/researched_vs_prior.json"))
    for jpath in sorted(json_files):
        subfolder = jpath.parent
        out_path = subfolder / "DIFF_SUMMARY.md"
        rel = jpath.relative_to(diffs_dir)
        diffs_file_key = str(Path("diffs") / rel).replace("\\", "/")
        category, tech_debt = category_by_diffs_file.get(diffs_file_key, (None, None))
        try:
            with open(jpath, "r", encoding="utf-8") as f:
                data = json.load(f)
            generate_doc(data, out_path, category=category, tech_debt=tech_debt)
        except Exception as e:
            print(f"Error processing {jpath}: {e}")
            raise


if __name__ == "__main__":
    main()
