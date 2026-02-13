#!/usr/bin/env python3
"""
Compare test results between 'previous' and 'updated' versions.

This script:
1. Reads test results from both versions
2. Calculates deltas (differences)
3. Outputs comparison JSON

Usage:
    python compare_results.py --previous previous_results.json --updated updated_results.json --output delta.json
"""

import argparse
import json
import sys
from pathlib import Path
from typing import Dict


def load_results(file_path: Path) -> Dict:
    """Load test results from JSON file."""
    if not file_path.exists():
        print(f"❌ Results file not found: {file_path}")
        sys.exit(1)
    
    with open(file_path, "r") as f:
        return json.load(f)


def calculate_delta(previous: Dict, updated: Dict) -> Dict:
    """Calculate differences between previous and updated results."""
    
    prev_summary = previous.get("summary", {})
    upd_summary = updated.get("summary", {})
    
    # Performance deltas
    prev_time = prev_summary.get("total_response_time", 0)
    upd_time = upd_summary.get("total_response_time", 0)
    time_delta = upd_time - prev_time
    time_delta_percent = (time_delta / prev_time * 100) if prev_time > 0 else 0
    
    prev_avg_time = prev_summary.get("average_response_time", 0)
    upd_avg_time = upd_summary.get("average_response_time", 0)
    avg_time_delta = upd_avg_time - prev_avg_time
    avg_time_delta_percent = (avg_time_delta / prev_avg_time * 100) if prev_avg_time > 0 else 0
    
    # Cost deltas
    prev_tokens = prev_summary.get("total_tokens", 0)
    upd_tokens = upd_summary.get("total_tokens", 0)
    tokens_delta = upd_tokens - prev_tokens
    tokens_delta_percent = (tokens_delta / prev_tokens * 100) if prev_tokens > 0 else 0
    
    prev_input_tokens = prev_summary.get("total_input_tokens", 0)
    upd_input_tokens = upd_summary.get("total_input_tokens", 0)
    input_tokens_delta = upd_input_tokens - prev_input_tokens
    
    prev_output_tokens = prev_summary.get("total_output_tokens", 0)
    upd_output_tokens = upd_summary.get("total_output_tokens", 0)
    output_tokens_delta = upd_output_tokens - prev_output_tokens
    
    prev_cost = prev_summary.get("total_cost", 0.0)
    upd_cost = upd_summary.get("total_cost", 0.0)
    cost_delta = upd_cost - prev_cost
    cost_delta_percent = (cost_delta / prev_cost * 100) if prev_cost > 0 else 0
    
    # Error deltas
    prev_errors = prev_summary.get("total_errors", 0)
    upd_errors = upd_summary.get("total_errors", 0)
    errors_delta = upd_errors - prev_errors
    
    # Scenario-level comparison
    scenario_deltas = []
    prev_scenarios = {s["scenario"]: s for s in previous.get("scenarios", [])}
    upd_scenarios = {s["scenario"]: s for s in updated.get("scenarios", [])}
    
    for scenario_name in set(prev_scenarios.keys()) | set(upd_scenarios.keys()):
        prev_scenario = prev_scenarios.get(scenario_name, {})
        upd_scenario = upd_scenarios.get(scenario_name, {})
        
        prev_scenario_time = prev_scenario.get("total_response_time", 0)
        upd_scenario_time = upd_scenario.get("total_response_time", 0)
        scenario_time_delta = upd_scenario_time - prev_scenario_time
        
        scenario_deltas.append({
            "scenario": scenario_name,
            "previous_time": prev_scenario_time,
            "updated_time": upd_scenario_time,
            "time_delta": scenario_time_delta,
            "time_delta_percent": (scenario_time_delta / prev_scenario_time * 100) if prev_scenario_time > 0 else 0,
            "previous_errors": len(prev_scenario.get("errors", [])),
            "updated_errors": len(upd_scenario.get("errors", [])),
        })
    
    return {
        "comparison_date": previous.get("test_date", "unknown"),
        "previous_version": {
            "repository": previous.get("repository", "unknown"),
            "commit_sha": previous.get("commit_sha", "unknown"),
            "test_date": previous.get("test_date", "unknown"),
        },
        "updated_version": {
            "repository": updated.get("repository", "unknown"),
            "commit_sha": updated.get("commit_sha", "unknown"),
            "test_date": updated.get("test_date", "unknown"),
        },
        "performance_deltas": {
            "total_response_time": {
                "previous": prev_time,
                "updated": upd_time,
                "delta": time_delta,
                "delta_percent": time_delta_percent,
                "improvement": time_delta < 0,  # Negative is better (faster)
            },
            "average_response_time": {
                "previous": prev_avg_time,
                "updated": upd_avg_time,
                "delta": avg_time_delta,
                "delta_percent": avg_time_delta_percent,
                "improvement": avg_time_delta < 0,
            },
        },
        "cost_deltas": {
            "total_tokens": {
                "previous": prev_tokens,
                "updated": upd_tokens,
                "delta": tokens_delta,
                "delta_percent": tokens_delta_percent,
                "improvement": tokens_delta < 0,  # Negative is better (fewer tokens)
            },
            "input_tokens": {
                "previous": prev_input_tokens,
                "updated": upd_input_tokens,
                "delta": input_tokens_delta,
                "improvement": input_tokens_delta < 0,
            },
            "output_tokens": {
                "previous": prev_output_tokens,
                "updated": upd_output_tokens,
                "delta": output_tokens_delta,
                "improvement": output_tokens_delta < 0,
            },
            "total_cost": {
                "previous": prev_cost,
                "updated": upd_cost,
                "delta": cost_delta,
                "delta_percent": cost_delta_percent,
                "improvement": cost_delta < 0,  # Negative is better (cheaper)
            },
        },
        "error_deltas": {
            "previous": prev_errors,
            "updated": upd_errors,
            "delta": errors_delta,
            "improvement": errors_delta < 0,  # Negative is better (fewer errors)
        },
        "scenario_deltas": scenario_deltas,
        "summary": {
            "performance_improved": time_delta < 0,
            "cost_improved": tokens_delta < 0,
            "errors_improved": errors_delta < 0,
            "overall_improvement": (time_delta < 0) and (tokens_delta < 0) and (errors_delta <= 0),
        }
    }


def print_summary(delta: Dict):
    """Print a human-readable summary of the comparison."""
    print("\n" + "="*60)
    print("Comparison Summary")
    print("="*60)
    
    print(f"\nPrevious: {delta['previous_version']['repository']} ({delta['previous_version']['commit_sha'][:8]})")
    print(f"Updated:  {delta['updated_version']['repository']} ({delta['updated_version']['commit_sha'][:8]})")
    
    print("\n" + "-"*60)
    print("PERFORMANCE")
    print("-"*60)
    perf = delta["performance_deltas"]["total_response_time"]
    status = "✅ IMPROVED" if perf["improvement"] else "❌ REGRESSED"
    print(f"Total Response Time: {perf['previous']:.2f}s → {perf['updated']:.2f}s")
    print(f"  Delta: {perf['delta']:+.2f}s ({perf['delta_percent']:+.1f}%) {status}")
    
    avg_perf = delta["performance_deltas"]["average_response_time"]
    status = "✅ IMPROVED" if avg_perf["improvement"] else "❌ REGRESSED"
    print(f"Average Response Time: {avg_perf['previous']:.2f}s → {avg_perf['updated']:.2f}s")
    print(f"  Delta: {avg_perf['delta']:+.2f}s ({avg_perf['delta_percent']:+.1f}%) {status}")
    
    print("\n" + "-"*60)
    print("COST")
    print("-"*60)
    tokens = delta["cost_deltas"]["total_tokens"]
    status = "✅ IMPROVED" if tokens["improvement"] else "❌ REGRESSED"
    print(f"Total Tokens: {tokens['previous']} → {tokens['updated']}")
    print(f"  Delta: {tokens['delta']:+d} ({tokens['delta_percent']:+.1f}%) {status}")
    
    cost = delta["cost_deltas"]["total_cost"]
    status = "✅ IMPROVED" if cost["improvement"] else "❌ REGRESSED"
    print(f"Total Cost: ${cost['previous']:.4f} → ${cost['updated']:.4f}")
    print(f"  Delta: ${cost['delta']:+.4f} ({cost['delta_percent']:+.1f}%) {status}")
    
    print("\n" + "-"*60)
    print("ERRORS")
    print("-"*60)
    errors = delta["error_deltas"]
    status = "✅ IMPROVED" if errors["improvement"] else "❌ REGRESSED"
    print(f"Total Errors: {errors['previous']} → {errors['updated']}")
    print(f"  Delta: {errors['delta']:+d} {status}")
    
    print("\n" + "-"*60)
    print("OVERALL")
    print("-"*60)
    summary = delta["summary"]
    if summary["overall_improvement"]:
        print("✅ Overall: IMPROVEMENT across all metrics")
    else:
        improvements = []
        if summary["performance_improved"]:
            improvements.append("Performance")
        if summary["cost_improved"]:
            improvements.append("Cost")
        if summary["errors_improved"]:
            improvements.append("Errors")
        
        if improvements:
            print(f"⚠️  Mixed results: Improved in {', '.join(improvements)}")
        else:
            print("❌ Overall: REGRESSION across all metrics")


def main():
    parser = argparse.ArgumentParser(description="Compare test results between versions")
    parser.add_argument(
        "--previous",
        type=Path,
        required=True,
        help="Path to previous version results JSON"
    )
    parser.add_argument(
        "--updated",
        type=Path,
        required=True,
        help="Path to updated version results JSON"
    )
    parser.add_argument(
        "--output",
        type=Path,
        default=Path("delta_results.json"),
        help="Output delta JSON file (default: delta_results.json)"
    )
    parser.add_argument(
        "--no-summary",
        action="store_true",
        help="Don't print summary to console"
    )
    
    args = parser.parse_args()
    
    # Load results
    print("Loading previous results...")
    previous = load_results(args.previous)
    
    print("Loading updated results...")
    updated = load_results(args.updated)
    
    # Calculate delta
    print("Calculating deltas...")
    delta = calculate_delta(previous, updated)
    
    # Save delta
    args.output.parent.mkdir(parents=True, exist_ok=True)
    with open(args.output, "w") as f:
        json.dump(delta, f, indent=2)
    
    print(f"\n✅ Delta results saved to: {args.output}")
    
    # Print summary
    if not args.no_summary:
        print_summary(delta)


if __name__ == "__main__":
    main()
