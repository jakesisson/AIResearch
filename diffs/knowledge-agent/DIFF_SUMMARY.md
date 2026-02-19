# Diff Summary

**Project:** Research Data/knowledge-agent  
**Repo:** `fvanevski/knowledge_agent`  
**Commit range:** `e4c81ec2` → `ef77bb2c` (researched commit is 13 ahead, 0 behind).
**Category (researched commit):** performance  

[Compare on GitHub](https://github.com/fvanevski/knowledge_agent/compare/e4c81ec2352265ce89233400995dfca1c9101f94...ef77bb2ccb38eee7f8a5e2374edb418adac4473b)

## Summary

- **Files changed:** 29
- **Lines added:** 1059
- **Lines removed:** 2386

**Themes:** tests, CI/CD, LangGraph workflow, LangChain/LLM, LLM provider, test coverage, RAG/retrieval, schemas/types, authentication, type checking, error handling

**Tech debt (from TruePositiveCommitsClean):** Maintainability/Scalability/Understandability/Performance

## Changes by file

### ➕ `db_utils.py`

- **Status:** added | **+122** / **-0**
- **Description:** # db_utils.py
- **Themes:** tests, CI/CD

### ✏️ `knowledge_agent.py`

- **Status:** modified | **+61** / **-26**
- **Description:** Imports or dependencies changed.
- **Themes:** LangGraph workflow, LangChain/LLM, LLM provider

### ➖ `prompt_templates/analyst_prompt.txt`

- **Status:** removed | **+0** / **-35**
- **Description:** File removed.
- **Themes:** test coverage, CI/CD, RAG/retrieval, schemas/types

### ✏️ `prompts/advisor_prompt.txt`

- **Status:** renamed | **+0** / **-0**
- **Description:** Content changed.

### ➕ `prompts/analyst_prompt.txt`

- **Status:** added | **+45** / **-0**
- **Description:** System: You are an expert AI assistant tasked with analyzing a LightRAG knowl...
- **Themes:** CI/CD, RAG/retrieval, schemas/types

### ✏️ `prompts/auditor_prompt.txt`

- **Status:** renamed | **+0** / **-0**
- **Description:** Content changed.

### ✏️ `prompts/fixer_prompt.txt`

- **Status:** renamed | **+0** / **-0**
- **Description:** Content changed.

### ➕ `prompts/ingester_prompt.txt`

- **Status:** added | **+32** / **-0**
- **Description:** System: You are an expert AI assistant tasked with ingesting the contents of ...
- **Themes:** RAG/retrieval, schemas/types

### ✏️ `prompts/researcher_prompt.txt`

- **Status:** renamed | **+0** / **-0**
- **Description:** Content changed.

### ➕ `prompts/search_ranker_prompt.txt`

- **Status:** added | **+26** / **-0**
- **Description:** System: You are an expert AI assistant tasked with analyzing search results a...
- **Themes:** CI/CD, RAG/retrieval, schemas/types

### ✏️ `prompts/searcher_prompt.txt`

- **Status:** renamed | **+8** / **-3**
- **Description:** Implementation or content updated.
- **Themes:** CI/CD, RAG/retrieval

### ✏️ `pyproject.toml`

- **Status:** modified | **+2** / **-0**
- **Description:** Additions: e.g. "json-repair",
- **Themes:** CI/CD, LangGraph workflow, LangChain/LLM, LLM provider, RAG/retrieval

### ✏️ `run.py`

- **Status:** modified | **+21** / **-7**
- **Description:** Imports or dependencies changed.
- **Themes:** CI/CD, LangChain/LLM, LLM provider, RAG/retrieval

### ✏️ `state.py`

- **Status:** modified | **+22** / **-1**
- **Description:** Imports or dependencies changed.
- **Themes:** LangChain/LLM, schemas/types

### ➖ `state/advisor_report.json`

- **Status:** removed | **+0** / **-0**
- **Description:** Content changed.

### ➖ `state/analyst_report.json`

- **Status:** removed | **+0** / **-115**
- **Description:** File removed.
- **Themes:** tests, test coverage, CI/CD, RAG/retrieval, authentication

### ➖ `state/auditor_report.json`

- **Status:** removed | **+0** / **-0**
- **Description:** Content changed.

### ➖ `state/curator_report.json`

- **Status:** removed | **+0** / **-92**
- **Description:** File removed.
- **Themes:** tests, CI/CD

### ➖ `state/fixer_report.json`

- **Status:** removed | **+0** / **-0**
- **Description:** Content changed.

### ➖ `state/researcher_report.json`

- **Status:** removed | **+0** / **-1556**
- **Description:** File removed.
- **Themes:** tests, type checking, test coverage, CI/CD, RAG/retrieval

### ➖ `sub_agents.py`

- **Status:** removed | **+0** / **-551**
- **Description:** File removed.
- **Themes:** error handling, tests, CI/CD, LangChain/LLM, LLM provider

### ✏️ `sub_agents/__init__.py`

- **Status:** renamed | **+0** / **-0**
- **Description:** Content changed.

### ➕ `sub_agents/advisor.py`

- **Status:** added | **+57** / **-0**
- **Description:** # advisor.py
- **Themes:** error handling, tests, LangChain/LLM, LLM provider

### ➕ `sub_agents/analyst.py`

- **Status:** added | **+84** / **-0**
- **Description:** # analyst.py
- **Themes:** error handling, LangChain/LLM, LLM provider

### ➕ `sub_agents/auditor.py`

- **Status:** added | **+57** / **-0**
- **Description:** # auditor.py
- **Themes:** error handling, LangChain/LLM, LLM provider, RAG/retrieval

### ➕ `sub_agents/curator.py`

- **Status:** added | **+197** / **-0**
- **Description:** # curator.py
- **Themes:** error handling, CI/CD, LangChain/LLM, LLM provider

### ➕ `sub_agents/fixer.py`

- **Status:** added | **+60** / **-0**
- **Description:** # sub_agents.py
- **Themes:** error handling, LangChain/LLM, LLM provider

### ➕ `sub_agents/researcher.py`

- **Status:** added | **+122** / **-0**
- **Description:** # researcher.py
- **Themes:** error handling, CI/CD, LangChain/LLM, LLM provider

### ➕ `tools.py`

- **Status:** added | **+143** / **-0**
- **Description:** # tools.py
- **Themes:** error handling, tests, LangChain/LLM
