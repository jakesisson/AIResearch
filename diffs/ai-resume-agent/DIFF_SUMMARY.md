# Diff Summary

**Project:** Research Data/ai-resume-agent  
**Repo:** `aandmaldonado/ai-resume-agent`  
**Commit range:** `d251ed01` → `0ad71e19` (researched commit is 1 ahead, 0 behind).
**Category (researched commit):** performance  

[Compare on GitHub](https://github.com/aandmaldonado/ai-resume-agent/compare/d251ed01d4dbdc6ea94ff8cdf43005ab995ea5f6...0ad71e1993b2e1361290dc93d5d04a11b66c8bdf)

## Summary

- **Files changed:** 61
- **Lines added:** 8401
- **Lines removed:** 1349

**Themes:** tests, type checking, test coverage, RAG/retrieval, pre-commit hooks, CI/CD, API/routes, authentication, LangChain/LLM, LLM provider, error handling, schemas/types, Docker, message trimming

**Tech debt (from TruePositiveCommitsClean):** Reliability/Performance

## Changes by file

### ➕ `.basedpyright.toml`

- **Status:** added | **+13** / **-0**
- **Description:** New config or list.
- **Themes:** tests, type checking, test coverage, RAG/retrieval

### ➕ `.coveragerc`

- **Status:** added | **+25** / **-0**
- **Description:** New config or list.
- **Themes:** tests, RAG/retrieval

### ✏️ `.gitignore`

- **Status:** modified | **+32** / **-0**
- **Description:** Additions: e.g. # Pre-commit y herramientas de desarrollo
- **Themes:** type checking, test coverage, pre-commit hooks, CI/CD, RAG/retrieval

### ➕ `.pre-commit-config.yaml`

- **Status:** added | **+45** / **-0**
- **Description:** repos:
- **Themes:** tests, pre-commit hooks, CI/CD, API/routes, authentication

### ✏️ `README.md`

- **Status:** modified | **+76** / **-16**
- **Description:** Implementation or content updated.
- **Themes:** tests, pre-commit hooks, CI/CD, LangChain/LLM, LLM provider

### ➕ `alembic.ini`

- **Status:** added | **+106** / **-0**
- **Description:** # A generic, single database configuration.
- **Themes:** CI/CD

### ➕ `alembic/env.py`

- **Status:** added | **+121** / **-0**
- **Description:** """
- **Themes:** error handling, CI/CD, API/routes

### ➕ `alembic/script.py.mako`

- **Status:** added | **+26** / **-0**
- **Description:** """${message}

### ➕ `alembic/versions/001_create_analytics_tables.py`

- **Status:** added | **+206** / **-0**
- **Description:** """Create analytics tables
- **Themes:** CI/CD

### ➕ `alembic/versions/002_add_chat_messages_table.py`

- **Status:** added | **+86** / **-0**
- **Description:** """Add chat_messages table to store conversation content
- **Themes:** type checking, CI/CD

### ➕ `alembic/versions/003_add_conversation_pairs_table.py`

- **Status:** added | **+92** / **-0**
- **Description:** """Add conversation_pairs table to associate questions and answers
- **Themes:** type checking, CI/CD

### ➕ `alembic/versions/9627c905e179_simplify_contact_form_add_linkedin_.py`

- **Status:** added | **+145** / **-0**
- **Description:** """simplify_contact_form_add_linkedin_remove_company_role
- **Themes:** CI/CD, LangChain/LLM, RAG/retrieval

### ✏️ `app/__init__.py`

- **Status:** modified | **+0** / **-1**
- **Description:** Formatting or whitespace changes.
- **Themes:** RAG/retrieval

### ✏️ `app/api/__init__.py`

- **Status:** modified | **+0** / **-1**
- **Description:** Formatting or whitespace changes.
- **Themes:** API/routes

### ✏️ `app/api/v1/__init__.py`

- **Status:** modified | **+0** / **-1**
- **Description:** Formatting or whitespace changes.
- **Themes:** API/routes

### ✏️ `app/api/v1/endpoints/__init__.py`

- **Status:** modified | **+0** / **-1**
- **Description:** Formatting or whitespace changes.
- **Themes:** API/routes

### ➕ `app/api/v1/endpoints/analytics.py`

- **Status:** added | **+589** / **-0**
- **Description:** """
- **Themes:** error handling, type checking, CI/CD, schemas/types, API/routes

### ✏️ `app/api/v1/endpoints/chat.py`

- **Status:** modified | **+393** / **-62**
- **Description:** Imports or dependencies changed.
- **Themes:** error handling, tests, type checking, CI/CD, LLM provider

### ✏️ `app/core/__init__.py`

- **Status:** modified | **+0** / **-1**
- **Description:** Formatting or whitespace changes.

### ✏️ `app/core/config.py`

- **Status:** modified | **+70** / **-30**
- **Description:** Imports or dependencies changed.
- **Themes:** tests, CI/CD, LLM provider, RAG/retrieval, schemas/types

### ➕ `app/core/secrets.py`

- **Status:** added | **+92** / **-0**
- **Description:** """
- **Themes:** error handling, tests, CI/CD, API/routes

### ✏️ `app/main.py`

- **Status:** modified | **+31** / **-22**
- **Description:** Imports or dependencies changed.
- **Themes:** error handling, tests, CI/CD, LLM provider, RAG/retrieval

### ➕ `app/models/__init__.py`

- **Status:** added | **+13** / **-0**
- **Description:** """

### ➕ `app/models/analytics.py`

- **Status:** added | **+430** / **-0**
- **Description:** """
- **Themes:** type checking, CI/CD, RAG/retrieval

### ✏️ `app/schemas/__init__.py`

- **Status:** modified | **+0** / **-1**
- **Description:** Formatting or whitespace changes.
- **Themes:** schemas/types

### ➕ `app/schemas/analytics.py`

- **Status:** added | **+272** / **-0**
- **Description:** """
- **Themes:** CI/CD, RAG/retrieval, schemas/types

### ✏️ `app/schemas/chat.py`

- **Status:** modified | **+127** / **-20**
- **Description:** Imports or dependencies changed.
- **Themes:** type checking, CI/CD, schemas/types, API/routes

### ✏️ `app/services/__init__.py`

- **Status:** modified | **+0** / **-1**
- **Description:** Formatting or whitespace changes.

### ➕ `app/services/analytics_service.py`

- **Status:** added | **+1067** / **-0**
- **Description:** """
- **Themes:** error handling, tests, Docker, CI/CD, RAG/retrieval

### ➕ `app/services/flow_controller.py`

- **Status:** added | **+485** / **-0**
- **Description:** """
- **Themes:** error handling, CI/CD

### ➕ `app/services/gdpr_service.py`

- **Status:** added | **+510** / **-0**
- **Description:** """
- **Themes:** error handling, tests, CI/CD

### ✏️ `app/services/rag_service.py`

- **Status:** modified | **+442** / **-194**
- **Description:** Implementation or content updated.
- **Themes:** error handling, tests, CI/CD, LangChain/LLM, LLM provider

### ➕ `data/portfolio.yaml`

- **Status:** added | **+383** / **-0**
- **Description:** # Professional Portfolio - Estructura Optimizada para RAG (v2.1)
- **Themes:** tests, Docker, CI/CD, LangChain/LLM, LLM provider

### ✏️ `docs/BEST_PRACTICES.md`

- **Status:** modified | **+57** / **-4**
- **Description:** Implementation or content updated.
- **Themes:** tests, pre-commit hooks, CI/CD, LLM provider, RAG/retrieval

### ➖ `docs/DIALOGFLOW_EXPLORATION.md`

- **Status:** removed | **+0** / **-214**
- **Description:** File removed.
- **Themes:** tests, Docker, CI/CD, API/routes, authentication

### ➕ `docs/IMPLEMENTACION_ANALYTICS_COMPLETADA.md`

- **Status:** added | **+177** / **-0**
- **Description:** # 🎉 Implementación de Analytics y GDPR Completada
- **Themes:** tests, CI/CD, RAG/retrieval, schemas/types, API/routes

### ✏️ `docs/PRD.md`

- **Status:** modified | **+1** / **-1**
- **Description:** Implementation or content updated.
- **Themes:** CI/CD, LLM provider, RAG/retrieval

### ✏️ `docs/QA.md`

- **Status:** modified | **+9** / **-9**
- **Description:** Implementation or content updated.
- **Themes:** tests, CI/CD, API/routes

### ✏️ `docs/TESTING_GUIDE.md`

- **Status:** modified | **+78** / **-24**
- **Description:** Implementation or content updated.
- **Themes:** error handling, tests, pre-commit hooks, CI/CD, RAG/retrieval

### ✏️ `docs/auditoria-gcp.md`

- **Status:** modified | **+21** / **-21**
- **Description:** Configuration or string content updated.
- **Themes:** error handling, tests, CI/CD, LLM provider, RAG/retrieval

### ✏️ `docs/backend-development.md`

- **Status:** modified | **+118** / **-48**
- **Description:** Implementation or content updated.
- **Themes:** error handling, tests, pre-commit hooks, CI/CD, LangChain/LLM

### ✏️ `docs/design.md`

- **Status:** modified | **+24** / **-24**
- **Description:** Implementation or content updated.
- **Themes:** error handling, CI/CD, RAG/retrieval, API/routes, authentication

### ✏️ `docs/frontend-development.md`

- **Status:** modified | **+18** / **-18**
- **Description:** Implementation or content updated.
- **Themes:** error handling, tests, test coverage, CI/CD, RAG/retrieval

### ✏️ `docs/product-roadmap.md`

- **Status:** modified | **+6** / **-6**
- **Description:** Implementation or content updated.
- **Themes:** CI/CD, API/routes

### ✏️ `docs/prompts-AMP.md`

- **Status:** modified | **+1** / **-1**
- **Description:** Implementation or content updated.
- **Themes:** tests, CI/CD, API/routes

### ✏️ `docs/security-plan.md`

- **Status:** modified | **+1** / **-1**
- **Description:** Implementation or content updated.
- **Themes:** CI/CD, LLM provider, RAG/retrieval, API/routes

### ✏️ `docs/tech-solution.md`

- **Status:** modified | **+38** / **-38**
- **Description:** Implementation or content updated.
- **Themes:** error handling, tests, test coverage, CI/CD, LangChain/LLM

### ✏️ `docs/tickets.md`

- **Status:** modified | **+16** / **-16**
- **Description:** Implementation or content updated.
- **Themes:** tests, CI/CD, RAG/retrieval, schemas/types, API/routes

### ➕ `pyproject.toml`

- **Status:** added | **+32** / **-0**
- **Description:** New config or list.
- **Themes:** tests, type checking, test coverage, CI/CD, RAG/retrieval

### ➖ `pytest.ini`

- **Status:** removed | **+0** / **-14**
- **Description:** File removed.
- **Themes:** tests, CI/CD

### ✏️ `requirements.txt`

- **Status:** modified | **+16** / **-2**
- **Description:** Implementation or content updated.
- **Themes:** tests, CI/CD, LangChain/LLM, RAG/retrieval, API/routes

### ✏️ `scripts/dev/query_vectors.sh`

- **Status:** modified | **+55** / **-7**
- **Description:** Configuration or string content updated.
- **Themes:** CI/CD, LangChain/LLM, RAG/retrieval

### ➕ `scripts/setup/build_knowledge_base.py`

- **Status:** added | **+195** / **-0**
- **Description:** # Guarda esto como 'build_knowledge_base.py'
- **Themes:** error handling, CI/CD, LangChain/LLM, RAG/retrieval

### ✏️ `scripts/setup/initialize_vector_store.py`

- **Status:** modified | **+58** / **-59**
- **Description:** Imports or dependencies changed.
- **Themes:** error handling, tests, CI/CD, LangChain/LLM, RAG/retrieval

### ✏️ `scripts/setup/prepare_knowledge_base.py`

- **Status:** modified | **+473** / **-257**
- **Description:** Implementation or content updated.
- **Themes:** error handling, tests, CI/CD, LangChain/LLM, RAG/retrieval

### ➕ `test-local.html`

- **Status:** added | **+1025** / **-0**
- **Description:** <!DOCTYPE html>
- **Themes:** message trimming, error handling, tests, type checking, CI/CD

### ➖ `tests/__init__.py`

- **Status:** removed | **+0** / **-2**
- **Description:** File removed.
- **Themes:** tests

### ➕ `tests/test_basic.py`

- **Status:** added | **+45** / **-0**
- **Description:** """
- **Themes:** tests, CI/CD

### ➕ `tests/test_coverage_basic.py`

- **Status:** added | **+60** / **-0**
- **Description:** """
- **Themes:** tests, pre-commit hooks, CI/CD, schemas/types, API/routes

### ➖ `tests/test_memory.py`

- **Status:** removed | **+0** / **-67**
- **Description:** File removed.
- **Themes:** error handling, tests, CI/CD, API/routes

### ➖ `tests/test_rag_service.py`

- **Status:** removed | **+0** / **-165**
- **Description:** File removed.
- **Themes:** tests, CI/CD, LangChain/LLM, RAG/retrieval, API/routes
