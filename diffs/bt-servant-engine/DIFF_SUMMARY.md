# Diff Summary

**Project:** Research Data/bt-servant-engine  
**Repo:** `unfoldingWord/bt-servant-engine`  
**Commit range:** `64e8ae14` → `231d4f2d` (researched commit is 1 ahead, 0 behind).
**Category (researched commit):** both  

[Compare on GitHub](https://github.com/unfoldingWord/bt-servant-engine/compare/64e8ae1443de945f9d01633685d106326b3c558b...231d4f2d2c062c04a233a788fd99f487ba4866bf)

## Summary

- **Files changed:** 11
- **Lines added:** 866
- **Lines removed:** 180

**Themes:** error handling, type checking, CI/CD, LLM provider, API/routes, authentication, message trimming, tests, RAG/retrieval, schemas/types

**Tech debt (from TruePositiveCommitsClean):** Cost/Performance

## Changes by file

### ✏️ `AGENTS.md`

- **Status:** modified | **+17** / **-1**
- **Description:** Implementation or content updated.
- **Themes:** error handling, type checking, CI/CD

### ✏️ `README.md`

- **Status:** modified | **+3** / **-2**
- **Description:** Implementation or content updated.
- **Themes:** CI/CD, LLM provider, API/routes, authentication

### ✏️ `brain.py`

- **Status:** modified | **+637** / **-167**
- **Description:** Imports or dependencies changed.
- **Themes:** message trimming, error handling, tests, type checking, CI/CD

### ✏️ `bt_servant.py`

- **Status:** modified | **+42** / **-8**
- **Description:** Logic or function implementation changed.
- **Themes:** type checking, CI/CD, LLM provider, RAG/retrieval, API/routes

### ✏️ `config.py`

- **Status:** modified | **+6** / **-1**
- **Description:** Imports or dependencies changed.
- **Themes:** tests, schemas/types, API/routes, authentication

### ✏️ `db/__init__.py`

- **Status:** modified | **+4** / **-0**
- **Description:** Additions: e.g. get_user_agentic_strength,

### ✏️ `db/user.py`

- **Status:** modified | **+31** / **-0**
- **Description:** Additions: e.g. VALID_AGENTIC_STRENGTH = {"normal", "low", "very_low"}

### ✏️ `env.example`

- **Status:** modified | **+3** / **-0**
- **Description:** Additions: e.g. # Agentic creativity tuning for LLM calls (normal | low)
- **Themes:** API/routes, authentication

### ➕ `tests/test_agentic_strength.py`

- **Status:** added | **+82** / **-0**
- **Description:** """Tests for agentic strength preference handling."""
- **Themes:** tests

### ✏️ `tests/test_consult_fia_resources.py`

- **Status:** modified | **+40** / **-0**
- **Description:** Additions: e.g. captured_messages["model"] = kwargs.get("model")
- **Themes:** tests

### ✏️ `tests/test_perf_coverage_llm_calls.py`

- **Status:** modified | **+1** / **-1**
- **Description:** Configuration or string content updated.
