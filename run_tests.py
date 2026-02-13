#!/usr/bin/env python3
"""
Standardized test runner for repository comparison.

This script:
1. Looks for test script in parent directory's tests/ folder
2. Runs tests against a repository version
3. Measures performance (response time)
4. Tracks cost (token usage from Langfuse)
5. Outputs structured JSON results

Usage:
    python run_tests.py --repo-path ./HypochondriAI/HypochondriAI-3b23faa... --output results.json
"""

import argparse
import json
import os
import importlib.util
import requests
import time
import sys
from pathlib import Path
from typing import Dict, List, Optional
from uuid import uuid4
from datetime import datetime


def find_test_script(repo_path: Path) -> Optional[Path]:
    """Find test script in parent directory's tests/ folder."""
    # Go up to parent directory (repository group folder)
    parent_dir = repo_path.parent
    
    # Look for tests/test_*.py or tests/tests.py
    test_paths = [
        parent_dir / "tests" / "test_script.py",
        parent_dir / "tests" / "tests.py",
        parent_dir / "test_script.py",
    ]
    
    for test_path in test_paths:
        if test_path.exists():
            return test_path
    
    return None


def load_test_script(test_script_path: Path) -> Dict:
    """Load test inputs from repository-specific test script."""
    spec = importlib.util.spec_from_file_location("test_script", test_script_path)
    if spec is None or spec.loader is None:
        raise ImportError(f"Could not load test script: {test_script_path}")
    
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    
    # Get TEST_INPUTS from the module
    if not hasattr(module, "TEST_INPUTS"):
        raise ValueError(f"Test script {test_script_path} must define TEST_INPUTS")
    
    return module.TEST_INPUTS


def detect_repo_type(repo_path: Path) -> str:
    """Detect repository type based on structure."""
    if (repo_path / "backend" / "app" / "prompts" / "health_anxiety_prompt_template.py").exists():
        return "hypochondriai"
    # Add more repo type detection here
    return "unknown"


def get_api_config(repo_type: str) -> Dict:
    """Get API configuration for repository type."""
    configs = {
        "hypochondriai": {
            "base_url": "http://localhost:8000",
            "api_base": "http://localhost:8000/v1",  # Router prefix is /v1, not /api/v1
            "new_endpoint": "/new",
            "continue_endpoint": "/conversations",
        }
    }
    return configs.get(repo_type, {
        "base_url": "http://localhost:8000",
        "api_base": "http://localhost:8000/v1",
        "new_endpoint": "/new",
        "continue_endpoint": "/conversations",
    })


def check_backend_running(base_url: str = "http://localhost:8000") -> bool:
    """Check if backend is running."""
    try:
        response = requests.get(f"{base_url}/docs", timeout=2)
        return response.status_code == 200
    except:
        return False


def run_test_scenario(
    scenario: Dict,
    api_config: Dict,
    user_id: str,
    repo_type: str
) -> Dict:
    """Run a single test scenario and return results."""
    
    results = {
        "scenario": scenario["scenario"],
        "messages": [],
        "total_response_time": 0.0,
        "total_input_tokens": 0,
        "total_output_tokens": 0,
        "errors": []
    }
    
    api_base = api_config["api_base"]
    conversation_id = None
    
    try:
        # First message - creates conversation
        first_message = scenario["messages"][0]
        start_time = time.time()
        
        if repo_type == "hypochondriai":
            # Use /test/new endpoint which creates test user automatically
            response = requests.post(
                f"{api_base.replace('/v1', '/test')}/new",
                json={"content": first_message, "role": "user"},
                timeout=30
            )
        else:
            # Default API pattern (can be customized in test script)
            response = requests.post(
                f"{api_base}/new",
                params={"user_id": user_id},
                json={"content": first_message},
                timeout=30
            )
        
        elapsed = time.time() - start_time
        results["total_response_time"] += elapsed
        
        if response.status_code != 200:
            results["errors"].append(f"Error {response.status_code}: {response.text}")
            return results
        
        conversation = response.json()
        conversation_id = conversation.get("id")
        messages = conversation.get("messages", [])
        ai_message = messages[-1] if messages else {}
        ai_response = ai_message.get("content", "")
        
        # Extract token usage from message if available
        token_usage = ai_message.get("token_usage") or ai_message.get("message_data", {}).get("token_usage", {})
        input_tokens = token_usage.get("input_tokens", 0) if token_usage else 0
        output_tokens = token_usage.get("output_tokens", 0) if token_usage else 0
        
        results["total_input_tokens"] += input_tokens
        results["total_output_tokens"] += output_tokens
        
        results["messages"].append({
            "input": first_message,
            "output": ai_response[:500],  # Truncate for storage
            "response_time": elapsed,
            "input_tokens": input_tokens,
            "output_tokens": output_tokens,
        })
        
        # Follow-up messages
        for message in scenario["messages"][1:]:
            time.sleep(0.5)  # Brief pause
            start_time = time.time()
            
            if repo_type == "hypochondriai":
                response = requests.post(
                    f"{api_base}/conversations",
                    params={"conversation_id": conversation_id},
                    json={"content": message, "role": "user"},
                    timeout=30
                )
            else:
                response = requests.post(
                    f"{api_base}/conversations",
                    params={"conversation_id": conversation_id},
                    json={"content": message},
                    timeout=30
                )
            
            elapsed = time.time() - start_time
            results["total_response_time"] += elapsed
            
            if response.status_code != 200:
                results["errors"].append(f"Error {response.status_code}: {response.text}")
                continue
            
            conversation = response.json()
            messages = conversation.get("messages", [])
            ai_message = messages[-1] if messages else {}
            ai_response = ai_message.get("content", "")
            
            # Extract token usage from message if available
            token_usage = ai_message.get("token_usage") or ai_message.get("message_data", {}).get("token_usage", {})
            input_tokens = token_usage.get("input_tokens", 0) if token_usage else 0
            output_tokens = token_usage.get("output_tokens", 0) if token_usage else 0
            
            results["total_input_tokens"] += input_tokens
            results["total_output_tokens"] += output_tokens
            
            results["messages"].append({
                "input": message,
                "output": ai_response[:500],
                "response_time": elapsed,
                "input_tokens": input_tokens,
                "output_tokens": output_tokens,
            })
    
    except Exception as e:
        results["errors"].append(f"Exception: {str(e)}")
    
    return results


def calculate_cost(input_tokens: int, output_tokens: int, model_id: str = "gpt-4.1") -> float:
    """
    Calculate cost based on token usage and model pricing.
    Azure OpenAI pricing (as of 2024, approximate):
    - gpt-4.1: ~$0.03 per 1K input tokens, ~$0.12 per 1K output tokens
    - gpt-4o: ~$0.005 per 1K input tokens, ~$0.015 per 1K output tokens
    - gpt-4: ~$0.03 per 1K input tokens, ~$0.06 per 1K output tokens
    """
    pricing = {
        "gpt-4.1": {"input": 0.03, "output": 0.12},
        "gpt-4o": {"input": 0.005, "output": 0.015},
        "gpt-4": {"input": 0.03, "output": 0.06},
        "gpt-35-turbo": {"input": 0.0015, "output": 0.002},
    }
    
    # Get pricing for model or use gpt-4.1 as default
    model_pricing = pricing.get(model_id, pricing["gpt-4.1"])
    
    input_cost = (input_tokens / 1000) * model_pricing["input"]
    output_cost = (output_tokens / 1000) * model_pricing["output"]
    
    return input_cost + output_cost


def get_langfuse_metrics(start_time: datetime, end_time: datetime) -> Dict:
    """
    Get token usage from Langfuse API.
    Note: This requires Langfuse API access. For now, returns placeholder.
    In production, you'd query Langfuse API for traces in the time range.
    """
    # TODO: Implement Langfuse API query
    # For now, return structure that will be filled
    return {
        "total_input_tokens": 0,
        "total_output_tokens": 0,
        "total_cost": 0.0,
        "trace_count": 0
    }


def run_all_tests(
    repo_path: Path,
    output_file: Path,
    test_inputs: List[Dict],
    api_config: Dict
) -> Dict:
    """Run all tests and save results to JSON."""
    
    repo_type = detect_repo_type(repo_path)
    repo_name = repo_path.name
    api_base = api_config["api_base"]
    base_url = api_config["base_url"]
    
    print(f"Testing repository: {repo_name}")
    print(f"Repository type: {repo_type}")
    print(f"API base: {api_base}")
    
    # Check backend
    if not check_backend_running(base_url):
        print(f"❌ Backend not running at {base_url}")
        print("   Please start the backend server first")
        sys.exit(1)
    
    print("✅ Backend is running")
    
    # Run tests
    all_results = []
    user_id = str(uuid4())
    test_start_time = datetime.now()
    
    print(f"\nRunning {len(test_inputs)} test scenarios...")
    for i, scenario in enumerate(test_inputs, 1):
        print(f"\n[{i}/{len(test_inputs)}] Testing: {scenario['scenario']}")
        result = run_test_scenario(scenario, api_config, user_id, repo_type)
        all_results.append(result)
        
        if result["errors"]:
            print(f"  ⚠️  {len(result['errors'])} errors")
        else:
            print(f"  ✅ {result['total_response_time']:.2f}s")
        
        time.sleep(1)  # Pause between scenarios
    
    test_end_time = datetime.now()
    
    # Calculate totals from test results
    total_response_time = sum(r["total_response_time"] for r in all_results)
    total_errors = sum(len(r["errors"]) for r in all_results)
    total_input_tokens = sum(r["total_input_tokens"] for r in all_results)
    total_output_tokens = sum(r["total_output_tokens"] for r in all_results)
    
    # Get model ID from config or default
    model_id = os.getenv("MODEL_ID", "gpt-4.1")
    total_cost = calculate_cost(total_input_tokens, total_output_tokens, model_id)
    
    # Compile results
    results = {
        "repository": repo_name,
        "repository_type": repo_type,
        "commit_sha": repo_path.name.split("-")[-1] if "-" in repo_path.name else "unknown",
        "test_date": datetime.now().isoformat(),
        "test_duration": (test_end_time - test_start_time).total_seconds(),
        "test_inputs": test_inputs,  # Store inputs for reference
        "scenarios": all_results,
        "summary": {
            "total_scenarios": len(all_results),
            "total_response_time": total_response_time,
            "average_response_time": total_response_time / len(all_results) if all_results else 0,
            "total_errors": total_errors,
            "total_input_tokens": total_input_tokens,
            "total_output_tokens": total_output_tokens,
            "total_tokens": total_input_tokens + total_output_tokens,
            "total_cost": total_cost,
            "model_id": model_id,
        }
    }
    
    # Save to JSON
    output_file.parent.mkdir(parents=True, exist_ok=True)
    with open(output_file, "w") as f:
        json.dump(results, f, indent=2)
    
    print(f"\n{'='*60}")
    print("Test Summary")
    print(f"{'='*60}")
    print(f"Total scenarios: {len(all_results)}")
    print(f"Total time: {total_response_time:.2f}s")
    print(f"Average time: {total_response_time / len(all_results):.2f}s" if all_results else "N/A")
    print(f"Total errors: {total_errors}")
    print(f"\nResults saved to: {output_file}")
    
    return results


def main():
    parser = argparse.ArgumentParser(description="Run standardized tests on a repository")
    parser.add_argument(
        "--repo-path",
        type=Path,
        required=True,
        help="Path to repository directory (e.g., ./HypochondriAI/HypochondriAI-3b23faa...)"
    )
    parser.add_argument(
        "--output",
        type=Path,
        default=None,
        help="Output JSON file path (default: <repo-path>/test_results.json)"
    )
    
    args = parser.parse_args()
    
    if not args.repo_path.exists():
        print(f"❌ Repository path does not exist: {args.repo_path}")
        sys.exit(1)
    
    # Find test script in parent directory
    test_script_path = find_test_script(args.repo_path)
    if test_script_path is None:
        print(f"❌ Test script not found!")
        print(f"   Looking for: {args.repo_path.parent / 'tests' / 'test_script.py'}")
        print(f"   Or: {args.repo_path.parent / 'tests' / 'tests.py'}")
        sys.exit(1)
    
    print(f"✅ Found test script: {test_script_path}")
    
    # Load test inputs
    try:
        test_inputs = load_test_script(test_script_path)
        print(f"✅ Loaded {len(test_inputs)} test scenarios")
    except Exception as e:
        print(f"❌ Failed to load test script: {e}")
        sys.exit(1)
    
    # Get API config
    repo_type = detect_repo_type(args.repo_path)
    api_config = get_api_config(repo_type)
    
    # Set output path
    if args.output is None:
        args.output = args.repo_path / "test_results.json"
    
    # Run tests
    run_all_tests(args.repo_path, args.output, test_inputs, api_config)


if __name__ == "__main__":
    main()
