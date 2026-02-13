# Token Count and Cost Tracking Setup

## Current Status

✅ **Test framework is working** - Tests run successfully and save results
❌ **Token tracking not working** - Token counts show as 0
❌ **Cost calculation not working** - Costs show as 0.0

## What Needs to Be Done

### 1. Extract Token Usage from Langchain Responses

The Langchain service needs to capture token usage from Azure OpenAI responses. Token usage information is typically available in:
- Response metadata from the LLM call
- Langfuse callbacks (if working)
- Direct API response from Azure OpenAI

### 2. Store Token Usage in Database

Token usage should be stored in the `message_data` field of the `Message` model, which is already set up to store JSON data.

### 3. Include Token Usage in API Responses

The `MessagePublic` model has been updated to include a `token_usage` field. The API needs to populate this field when converting `Message` objects to `MessagePublic` objects.

### 4. Extract Token Usage in Test Framework

The test framework (`run_tests.py`) has been updated to extract token usage from API responses. It looks for:
- `token_usage` field in the message object
- `message_data.token_usage` as a fallback

### 5. Calculate Costs

A `calculate_cost()` function has been added to calculate costs based on:
- Input tokens
- Output tokens  
- Model pricing (gpt-4.1, gpt-4o, etc.)

## Implementation Steps

### Step 1: Fix Token Extraction in Langchain Service

The `conversation()` method in `LangchainService` needs to capture token usage from the graph response. Check if Langchain stores this in:
- `response_metadata` on the message
- Graph execution metadata
- Callback handlers

### Step 2: Update API Response Serialization

When returning `ConversationPublic`, ensure `MessagePublic` objects include `token_usage` populated from `message_data.token_usage`.

### Step 3: Test Token Extraction

Run a test and verify:
1. Token usage is captured in the backend
2. Token usage is returned in API responses
3. Token usage is extracted by the test framework
4. Costs are calculated correctly

## Current Code Changes Made

1. ✅ Updated `get_and_save_ai_response()` to return token usage tuple
2. ✅ Updated API endpoints to handle token usage tuple
3. ✅ Added `token_usage` field to `MessagePublic` model
4. ✅ Updated test framework to extract token usage from responses
5. ✅ Added `calculate_cost()` function
6. ✅ Updated test results to include token counts and costs

## Next Steps

1. **Debug token extraction**: Check if Langchain/Azure OpenAI returns token usage in the response
2. **Fix API serialization**: Ensure token_usage is populated in MessagePublic responses
3. **Test end-to-end**: Run a test and verify token counts are captured

## Testing

After implementation, run:
```bash
python3 run_tests.py --repo-path "./Research Data/HypochondriAI/HypochondriAI-3b23faa83b3007490569ac2951887fe622c0cdcc"
```

Check the `test_results.json` file to verify:
- `input_tokens` > 0
- `output_tokens` > 0
- `total_cost` > 0.0
