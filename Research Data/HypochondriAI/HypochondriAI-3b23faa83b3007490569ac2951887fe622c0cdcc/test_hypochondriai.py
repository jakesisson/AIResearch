#!/usr/bin/env python3
"""
Test script for HypochondriAI chatbot.

This script tests the HypochondriAI health anxiety support chatbot by:
1. Creating conversations
2. Sending test messages
3. Measuring response times
4. Displaying results

Usage:
    python test_hypochondriai.py
"""

import requests
import time
import sys
from typing import List, Dict
from uuid import uuid4

BASE_URL = "http://localhost:8000"
API_BASE = f"{BASE_URL}/api/v1"

# Test scenarios for health anxiety
TEST_SCENARIOS = {
    "mild_concern": [
        "I've been having headaches for a few days. Should I be worried?",
        "What could be causing this?",
    ],
    "moderate_anxiety": [
        "I keep thinking I have cancer. I can't stop worrying about it.",
        "How do I know if my concern is valid or just anxiety?",
    ],
    "symptom_checking": [
        "I've been checking my symptoms online multiple times a day. Is this normal?",
        "How can I stop doing this?",
    ],
    "general_question": [
        "What is health anxiety?",
        "How can I manage it?",
    ],
}


def check_backend_running() -> bool:
    """Check if the backend is running."""
    try:
        response = requests.get(f"{BASE_URL}/docs", timeout=2)
        return response.status_code == 200
    except requests.exceptions.RequestException:
        return False


def create_user_id() -> str:
    """Generate a test user ID."""
    return str(uuid4())


def test_conversation(
    questions: List[str], 
    user_id: str = None,
    scenario_name: str = "test"
) -> Dict:
    """Test a conversation with multiple questions."""
    
    if user_id is None:
        user_id = create_user_id()
    
    print(f"\n{'='*60}")
    print(f"Testing Scenario: {scenario_name}")
    print(f"User ID: {user_id}")
    print(f"{'='*60}")
    
    results = {
        "scenario": scenario_name,
        "user_id": user_id,
        "messages": [],
        "total_time": 0,
        "errors": []
    }
    
    conversation_id = None
    
    try:
        # Send first message (creates conversation)
        print(f"\n[1] Sending: {questions[0]}")
        start_time = time.time()
        
        response = requests.post(
            f"{API_BASE}/new",
            params={"user_id": user_id},
            json={"content": questions[0]},
            timeout=30
        )
        
        elapsed = time.time() - start_time
        results["total_time"] += elapsed
        
        if response.status_code != 200:
            error_msg = f"Error {response.status_code}: {response.text}"
            print(f"❌ {error_msg}")
            results["errors"].append(error_msg)
            return results
        
        conversation = response.json()
        conversation_id = conversation["id"]
        ai_response = conversation["messages"][-1]["content"] if conversation.get("messages") else "No response"
        
        print(f"✅ Response ({elapsed:.2f}s):")
        print(f"   {ai_response[:200]}...")
        
        results["messages"].append({
            "question": questions[0],
            "response": ai_response[:500],  # Truncate for display
            "time": elapsed
        })
        
        # Send follow-up messages
        for i, question in enumerate(questions[1:], 2):
            print(f"\n[{i}] Sending: {question}")
            start_time = time.time()
            
            response = requests.post(
                f"{API_BASE}/conversations",
                params={"conversation_id": conversation_id},
                json={"content": question},
                timeout=30
            )
            
            elapsed = time.time() - start_time
            results["total_time"] += elapsed
            
            if response.status_code != 200:
                error_msg = f"Error {response.status_code}: {response.text}"
                print(f"❌ {error_msg}")
                results["errors"].append(error_msg)
                continue
            
            conversation = response.json()
            ai_response = conversation["messages"][-1]["content"] if conversation.get("messages") else "No response"
            
            print(f"✅ Response ({elapsed:.2f}s):")
            print(f"   {ai_response[:200]}...")
            
            results["messages"].append({
                "question": question,
                "response": ai_response[:500],
                "time": elapsed
            })
            
            time.sleep(0.5)  # Brief pause between messages
        
        print(f"\n✅ Scenario complete! Total time: {results['total_time']:.2f}s")
        
    except requests.exceptions.Timeout:
        error_msg = "Request timed out"
        print(f"❌ {error_msg}")
        results["errors"].append(error_msg)
    except Exception as e:
        error_msg = f"Error: {str(e)}"
        print(f"❌ {error_msg}")
        results["errors"].append(error_msg)
    
    return results


def run_all_tests():
    """Run all test scenarios."""
    print("="*60)
    print("HypochondriAI Test Suite")
    print("="*60)
    
    # Check if backend is running
    print("\nChecking if backend is running...")
    if not check_backend_running():
        print("❌ Backend is not running!")
        print(f"   Please start it with: cd backend/app && uvicorn main:app --reload")
        print(f"   Expected URL: {BASE_URL}")
        sys.exit(1)
    
    print(f"✅ Backend is running at {BASE_URL}")
    
    # Run all test scenarios
    all_results = []
    user_id = create_user_id()
    
    for scenario_name, questions in TEST_SCENARIOS.items():
        result = test_conversation(questions, user_id, scenario_name)
        all_results.append(result)
        time.sleep(1)  # Pause between scenarios
    
    # Summary
    print("\n" + "="*60)
    print("Test Summary")
    print("="*60)
    
    total_time = sum(r["total_time"] for r in all_results)
    total_errors = sum(len(r["errors"]) for r in all_results)
    
    for result in all_results:
        status = "✅" if not result["errors"] else "❌"
        print(f"{status} {result['scenario']}: {result['total_time']:.2f}s")
        if result["errors"]:
            for error in result["errors"]:
                print(f"   Error: {error}")
    
    print(f"\nTotal time: {total_time:.2f}s")
    print(f"Total errors: {total_errors}")
    print(f"\n✅ Check Langfuse Cloud for detailed metrics:")
    print(f"   https://us.cloud.langfuse.com")


if __name__ == "__main__":
    try:
        run_all_tests()
    except KeyboardInterrupt:
        print("\n\n⚠️  Tests interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
