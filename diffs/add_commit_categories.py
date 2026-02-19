#!/usr/bin/env python3
"""
Add cost/performance category to diffs/summary.json by matching researched_commit
to TruePositiveCommitsClean.csv Tech Debt column. Writes back to summary.json.
"""

import csv
import json
from pathlib import Path


def parse_tech_debt_categories(tech_debt: str) -> tuple[bool, bool]:
    """Parse Tech Debt string; return (is_cost, is_performance)."""
    if not tech_debt or not str(tech_debt).strip():
        return False, False
    s = str(tech_debt).strip()
    is_cost = "cost" in s.lower()
    is_performance = "performance" in s.lower()
    return is_cost, is_performance


def category_label(is_cost: bool, is_performance: bool) -> str | None:
    """Return 'cost', 'performance', 'both', or None."""
    if not is_cost and not is_performance:
        return None
    if is_cost and is_performance:
        return "both"
    if is_cost:
        return "cost"
    return "performance"


def main():
    base = Path(__file__).resolve().parent.parent  # AIResearch
    csv_path = base / "TruePositiveCommitsClean.csv"
    summary_path = base / "diffs" / "summary.json"

    # Build SHA -> Tech Debt map from CSV
    sha_to_tech_debt: dict[str, str] = {}
    with open(csv_path, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            sha = (row.get("SHA") or "").strip().lower()
            tech_debt = (row.get("Tech Debt") or "").strip()
            if sha:
                sha_to_tech_debt[sha] = tech_debt

    with open(summary_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    for entry in data.get("entries", []):
        researched = (entry.get("researched_commit") or "").strip().lower()
        tech_debt = sha_to_tech_debt.get(researched, "")
        is_cost, is_performance = parse_tech_debt_categories(tech_debt)
        entry["category_cost"] = is_cost
        entry["category_performance"] = is_performance
        entry["category"] = category_label(is_cost, is_performance)
        if tech_debt:
            entry["tech_debt"] = tech_debt

    with open(summary_path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    print(f"Updated {summary_path} with cost/performance categories for {len(data['entries'])} entries.")


if __name__ == "__main__":
    main()
