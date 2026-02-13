"""
Azure OpenAI API Script for Processing GitHub Data

This script appears to be designed to:
1. Read GitHub tools/operations from CSV files
2. Use Azure OpenAI to process/map the data
3. Output results to a CSV file

FIXED VERSION - Addresses security and functionality issues
"""

import os
import json
import pandas as pd
from tqdm import tqdm
from openai import AzureOpenAI
from pathlib import Path

# ============================================================================
# CONFIGURATION - Update these paths for your environment
# ============================================================================

# File paths (updated for local use, not Google Colab)
BASE_DIR = Path(__file__).parent
TOOLS_FILE = BASE_DIR / "GitHub_MCP_Tools2.csv"  # Input: GitHub tools
OPS_FILE = BASE_DIR / "Github_operations.csv"     # Input: GitHub operations
OUTPUT_FILE = BASE_DIR / "Github_mapped_2.csv"    # Output: Mapped results

# Azure OpenAI Configuration
AZURE_OPENAI_ENDPOINT = "https://ksontini-mcp-project.openai.azure.com/"
MODEL = "gpt-4.1"  # Note: Verify this model name is correct
API_VERSION = "2025-01-01-preview"

# ============================================================================
# SETUP
# ============================================================================

def get_api_key():
    """Get API key from environment or prompt user."""
    api_key = os.getenv("AZURE_OPENAI_API_KEY")
    if not api_key:
        api_key = input("Enter your Azure OpenAI API Key: ").strip()
        os.environ["AZURE_OPENAI_API_KEY"] = api_key
    return api_key

# Initialize client
api_key = get_api_key()
client = AzureOpenAI(
    api_key=api_key,
    api_version=API_VERSION,
    azure_endpoint=AZURE_OPENAI_ENDPOINT
)

# ============================================================================
# MAIN PROCESSING FUNCTION
# ============================================================================

def create_prompt(tools_data, operations_data):
    """
    Create a prompt for the AI model based on the data.
    
    This is a template - you'll need to customize based on what you want to do.
    """
    prompt = f"""
You are analyzing GitHub tools and operations data.

Tools Data:
{json.dumps(tools_data.head().to_dict('records'), indent=2) if not tools_data.empty else "No tools data"}

Operations Data:
{json.dumps(operations_data.head().to_dict('records'), indent=2) if not operations_data.empty else "No operations data"}

Task: Map the tools to operations and return a JSON array of mappings.
Each mapping should include the tool name and corresponding operations.

Return ONLY a valid JSON array. No markdown, no explanations.
"""
    return prompt

def process_data():
    """Main function to process the CSV files and generate mappings."""
    
    # Check if input files exist
    if not TOOLS_FILE.exists():
        print(f"⚠️  Warning: {TOOLS_FILE} not found. Creating empty DataFrame.")
        tools_df = pd.DataFrame()
    else:
        print(f"📖 Reading {TOOLS_FILE.name}...")
        tools_df = pd.read_csv(TOOLS_FILE)
        print(f"   Loaded {len(tools_df)} rows")
    
    if not OPS_FILE.exists():
        print(f"⚠️  Warning: {OPS_FILE} not found. Creating empty DataFrame.")
        ops_df = pd.DataFrame()
    else:
        print(f"📖 Reading {OPS_FILE.name}...")
        ops_df = pd.read_csv(OPS_FILE)
        print(f"   Loaded {len(ops_df)} rows")
    
    if tools_df.empty and ops_df.empty:
        print("❌ No data to process. Please provide at least one CSV file.")
        return
    
    # Process in batches if data is large
    batch_size = 10  # Adjust based on your needs
    results = []
    
    # Example: Process tools in batches
    if not tools_df.empty:
        print(f"\n🔄 Processing {len(tools_df)} tools in batches of {batch_size}...")
        
        for i in tqdm(range(0, len(tools_df), batch_size)):
            batch = tools_df.iloc[i:i+batch_size]
            
            # Create prompt for this batch
            prompt = create_prompt(batch, ops_df)
            
            try:
                # Call Azure OpenAI API
                response = client.chat.completions.create(
                    model=MODEL,
                    messages=[
                        {
                            "role": "system",
                            "content": "You must return strictly valid JSON arrays. No markdown or explanations."
                        },
                        {
                            "role": "user",
                            "content": prompt
                        }
                    ],
                    temperature=0.2,
                    max_tokens=1200,
                )
                
                # Extract response
                content = response.choices[0].message.content.strip()
                
                # Try to parse JSON response
                try:
                    # Remove markdown code blocks if present
                    if content.startswith("```"):
                        content = content.split("```")[1]
                        if content.startswith("json"):
                            content = content[4:]
                    content = content.strip()
                    
                    parsed = json.loads(content)
                    if isinstance(parsed, list):
                        results.extend(parsed)
                    else:
                        results.append(parsed)
                except json.JSONDecodeError as e:
                    print(f"⚠️  Could not parse JSON response: {e}")
                    print(f"   Response: {content[:200]}...")
                
            except Exception as e:
                print(f"❌ Error processing batch {i//batch_size + 1}: {e}")
                continue
    
    # Save results
    if results:
        print(f"\n💾 Saving {len(results)} results to {OUTPUT_FILE.name}...")
        results_df = pd.DataFrame(results)
        results_df.to_csv(OUTPUT_FILE, index=False)
        print(f"✅ Saved to {OUTPUT_FILE}")
    else:
        print("⚠️  No results to save.")

# ============================================================================
# RUN
# ============================================================================

if __name__ == "__main__":
    print("="*60)
    print("GitHub Tools/Operations Mapper")
    print("="*60)
    print(f"Tools file: {TOOLS_FILE}")
    print(f"Operations file: {OPS_FILE}")
    print(f"Output file: {OUTPUT_FILE}")
    print("="*60)
    print()
    
    try:
        process_data()
    except KeyboardInterrupt:
        print("\n\n⚠️  Interrupted by user")
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
