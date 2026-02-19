# Diff Summary

**Project:** Research Data/Deep-Query  
**Repo:** `Yousif-Abuzeid/Deep-Query`  
**Commit range:** `cff22449` → `14a6100a` (researched commit is 1 ahead, 0 behind).
**Category (researched commit):** performance  

[Compare on GitHub](https://github.com/Yousif-Abuzeid/Deep-Query/compare/cff22449ff1f8213488a681f1b0766ccfa85cf28...14a6100a1b7eaa168c0e04ec15e7ccee75e40b2f)

## Summary

- **Files changed:** 19
- **Lines added:** 1533
- **Lines removed:** 28

**Themes:** LLM provider, RAG/retrieval, API/routes, CI/CD, LangGraph workflow, LangChain/LLM, schemas/types, message trimming, error handling, type checking

**Tech debt (from TruePositiveCommitsClean):** Reliability/Performance/Scalability/Maintainability

## Changes by file

### ✏️ `docker/env/.env.app.example`

- **Status:** modified | **+1** / **-0**
- **Description:** Additions: e.g. TAVILY_API_KEY="your_tavily_api_key"
- **Themes:** LLM provider, RAG/retrieval, API/routes

### ✏️ `docker/minirag/DockerFile`

- **Status:** modified | **+3** / **-0**
- **Description:** Additions: e.g. # Install Playwright browsers with dependencies
- **Themes:** CI/CD

### ✏️ `docker/minirag/entrypoint.sh`

- **Status:** modified | **+13** / **-0**
- **Description:** Additions: e.g. echo "=== DEBUG ARGUMENTS ==="
- **Themes:** API/routes

### ➕ `src/agents/deep_researcher/__init__.py`

- **Status:** added | **+1** / **-0**
- **Description:** New module with imports.

### ➕ `src/agents/deep_researcher/deep_researcher.py`

- **Status:** added | **+451** / **-0**
- **Description:** """Deep Research Agent with LangGraph implementation."""
- **Themes:** CI/CD, LangGraph workflow, LangChain/LLM

### ➕ `src/agents/deep_researcher/state.py`

- **Status:** added | **+57** / **-0**
- **Description:** """Graph state definitions and data structures for the Deep Research agent."""
- **Themes:** CI/CD, schemas/types

### ➕ `src/agents/deep_researcher/tools.py`

- **Status:** added | **+76** / **-0**
- **Description:** New module with imports.
- **Themes:** CI/CD, LangChain/LLM, API/routes

### ✏️ `src/controllers/NLPController.py`

- **Status:** modified | **+6** / **-0**
- **Description:** Additions: e.g. from agents.deep_researcher import DeepResearch
- **Themes:** RAG/retrieval

### ✏️ `src/helpers/config.py`

- **Status:** modified | **+1** / **-1**
- **Description:** Additions: e.g. TAVILY_API_KEY: str = None
- **Themes:** API/routes

### ✏️ `src/main.py`

- **Status:** modified | **+14** / **-2**
- **Description:** Imports or dependencies changed.
- **Themes:** CI/CD, API/routes

### ➕ `src/models/db_schemas/minirag/alembic/versions/4943547c1891_add_chat_history.py`

- **Status:** added | **+32** / **-0**
- **Description:** """Add chat history
- **Themes:** schemas/types

### ✏️ `src/models/enums/ResponseEnums.py`

- **Status:** modified | **+3** / **-1**
- **Description:** Configuration or string content updated.
- **Themes:** RAG/retrieval

### ✏️ `src/requirments.txt`

- **Status:** modified | **+12** / **-2**
- **Description:** Implementation or content updated.
- **Themes:** LangGraph workflow, LangChain/LLM, LLM provider, API/routes

### ✏️ `src/routes/nlp.py`

- **Status:** modified | **+38** / **-0**
- **Description:** Additions: e.g. )
- **Themes:** RAG/retrieval, API/routes

### ✏️ `src/static/index.html`

- **Status:** modified | **+567** / **-16**
- **Description:** Implementation or content updated.
- **Themes:** message trimming, error handling, type checking, CI/CD, RAG/retrieval

### ✏️ `src/stores/llm/providers/GoogleGenAIProvider.py`

- **Status:** modified | **+7** / **-2**
- **Description:** Imports or dependencies changed.
- **Themes:** LangChain/LLM, API/routes

### ✏️ `src/stores/llm/providers/OpenAIProvider.py`

- **Status:** modified | **+17** / **-4**
- **Description:** Imports or dependencies changed.
- **Themes:** LangChain/LLM, LLM provider, RAG/retrieval, API/routes

### ➕ `src/stores/llm/templates/locales/en/chat.py`

- **Status:** added | **+15** / **-0**
- **Description:** New module with imports.

### ➕ `src/stores/llm/templates/locales/en/deep_researcher.py`

- **Status:** added | **+219** / **-0**
- **Description:** """System prompts and prompt templates for the Deep Research agent."""
- **Themes:** CI/CD, RAG/retrieval
