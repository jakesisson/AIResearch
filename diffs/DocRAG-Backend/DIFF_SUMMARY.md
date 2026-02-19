# Diff Summary

**Project:** Research Data/DocRAG-Backend  
**Repo:** `Rajathbharadwaj/DocRAG-Backend`  
**Commit range:** `8c0d6875` → `cbe1f370` (researched commit is 1 ahead, 0 behind).
**Category (researched commit):** performance  

[Compare on GitHub](https://github.com/Rajathbharadwaj/DocRAG-Backend/compare/8c0d68755d31ad633fc8c026bc8e866c836149ad...cbe1f370adbd46b191523631613b6afd9ff213bb)

## Summary

- **Files changed:** 16
- **Lines added:** 111
- **Lines removed:** 463

**Themes:** Docker, LangChain/LLM, LLM provider, RAG/retrieval, API/routes, error handling, LangGraph workflow, schemas/types, tests, type checking, CI/CD

**Tech debt (from TruePositiveCommitsClean):** Maintainability/Reliability/Performance

## Changes by file

### ✏️ `langgraph.json`

- **Status:** modified | **+6** / **-3**
- **Description:** Configuration or string content updated.
- **Themes:** Docker, LangChain/LLM, LLM provider, RAG/retrieval

### ✏️ `requirements.txt`

- **Status:** modified | **+3** / **-1**
- **Description:** Implementation or content updated.
- **Themes:** LangChain/LLM, LLM provider, API/routes

### ✏️ `src/rag/__init__.py`

- **Status:** modified | **+6** / **-4**
- **Description:** Imports or dependencies changed.
- **Themes:** RAG/retrieval

### ➕ `src/rag/chat_agent`

- **Status:** added | **+1** / **-0**
- **Description:** Subproject commit c02935fec860d38939b699b0e461863ec2a68c4b

### ✏️ `src/rag/configuration.py`

- **Status:** modified | **+9** / **-3**
- **Description:** Implementation or content updated.
- **Themes:** RAG/retrieval

### ➖ `src/rag/research_agent/__init__.py`

- **Status:** removed | **+0** / **-0**
- **Description:** Content changed.

### ➖ `src/rag/research_agent/graph.py`

- **Status:** removed | **+0** / **-97**
- **Description:** File removed.
- **Themes:** error handling, LangGraph workflow, LangChain/LLM, RAG/retrieval, schemas/types

### ➖ `src/rag/research_agent/state.py`

- **Status:** removed | **+0** / **-30**
- **Description:** File removed.
- **Themes:** LangChain/LLM, RAG/retrieval

### ➖ `src/rag/retrieval_agent/__init__.py`

- **Status:** removed | **+0** / **-0**
- **Description:** Content changed.

### ➖ `src/rag/retrieval_agent/configuration.py`

- **Status:** removed | **+0** / **-62**
- **Description:** File removed.
- **Themes:** LLM provider, RAG/retrieval, API/routes

### ➖ `src/rag/retrieval_agent/graph.py`

- **Status:** removed | **+0** / **-175**
- **Description:** File removed.
- **Themes:** error handling, tests, type checking, LangGraph workflow, LangChain/LLM

### ➖ `src/rag/retrieval_agent/prompts.py`

- **Status:** removed | **+0** / **-30**
- **Description:** File removed.
- **Themes:** CI/CD, RAG/retrieval, API/routes

### ➖ `src/rag/retrieval_agent/state.py`

- **Status:** removed | **+0** / **-24**
- **Description:** File removed.
- **Themes:** LangChain/LLM, RAG/retrieval, schemas/types, API/routes

### ✏️ `src/rag/retriever.py`

- **Status:** modified | **+17** / **-17**
- **Description:** Imports or dependencies changed.
- **Themes:** error handling, LangChain/LLM, RAG/retrieval

### ✏️ `src/record_manager_cache.sql`

- **Status:** modified | **+0** / **-0**
- **Description:** Content changed.

### ✏️ `src/server.py`

- **Status:** modified | **+69** / **-17**
- **Description:** Imports or dependencies changed.
- **Themes:** error handling, CI/CD, LangChain/LLM, LLM provider, RAG/retrieval
