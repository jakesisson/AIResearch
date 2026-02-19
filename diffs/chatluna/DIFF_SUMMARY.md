# Diff Summary

**Project:** Research Data/chatluna  
**Repo:** `ChatLunaLab/chatluna`  
**Commit range:** `e850d438` → `9f733252` (researched commit is 1 ahead, 0 behind).
**Category (researched commit):** cost  

[Compare on GitHub](https://github.com/ChatLunaLab/chatluna/compare/e850d438efacba2ef391155e864fb8e7c7dbbc42...9f7332529850cceb0b1ab8138540796c6a47890e)

## Summary

- **Files changed:** 32
- **Lines added:** 262
- **Lines removed:** 144

**Themes:** CI/CD, LangChain/LLM, LLM provider, schemas/types, RAG/retrieval, API/routes, authentication, error handling, tests, linting/formatting

**Tech debt (from TruePositiveCommitsClean):** Reliability/Cost

## Changes by file

### ✏️ `packages/adapter-azure-openai/package.json`

- **Status:** modified | **+3** / **-3**
- **Description:** Configuration or string content updated.
- **Themes:** CI/CD, LangChain/LLM, LLM provider, schemas/types

### ✏️ `packages/adapter-claude/package.json`

- **Status:** modified | **+3** / **-3**
- **Description:** Configuration or string content updated.
- **Themes:** CI/CD, LangChain/LLM, schemas/types

### ✏️ `packages/adapter-deepseek/package.json`

- **Status:** modified | **+3** / **-3**
- **Description:** Configuration or string content updated.
- **Themes:** CI/CD, LangChain/LLM, schemas/types

### ✏️ `packages/adapter-dify/package.json`

- **Status:** modified | **+2** / **-2**
- **Description:** Configuration or string content updated.
- **Themes:** CI/CD

### ✏️ `packages/adapter-doubao/package.json`

- **Status:** modified | **+3** / **-3**
- **Description:** Configuration or string content updated.
- **Themes:** CI/CD, LangChain/LLM, schemas/types

### ✏️ `packages/adapter-gemini/package.json`

- **Status:** modified | **+3** / **-3**
- **Description:** Configuration or string content updated.
- **Themes:** CI/CD, LangChain/LLM, LLM provider, RAG/retrieval, API/routes

### ✏️ `packages/adapter-gemini/src/requester.ts`

- **Status:** modified | **+7** / **-5**
- **Description:** Configuration or string content updated.
- **Themes:** LLM provider, authentication

### ✏️ `packages/adapter-hunyuan/package.json`

- **Status:** modified | **+3** / **-3**
- **Description:** Configuration or string content updated.
- **Themes:** CI/CD, LangChain/LLM, schemas/types

### ✏️ `packages/adapter-ollama/package.json`

- **Status:** modified | **+3** / **-3**
- **Description:** Configuration or string content updated.
- **Themes:** CI/CD, LangChain/LLM

### ✏️ `packages/adapter-openai-like/package.json`

- **Status:** modified | **+3** / **-3**
- **Description:** Configuration or string content updated.
- **Themes:** CI/CD, LangChain/LLM, LLM provider, schemas/types, API/routes

### ✏️ `packages/adapter-openai/package.json`

- **Status:** modified | **+3** / **-3**
- **Description:** Configuration or string content updated.
- **Themes:** CI/CD, LangChain/LLM, LLM provider, schemas/types

### ✏️ `packages/adapter-qwen/package.json`

- **Status:** modified | **+3** / **-3**
- **Description:** Configuration or string content updated.
- **Themes:** CI/CD, LangChain/LLM, schemas/types

### ✏️ `packages/adapter-qwen/src/requester.ts`

- **Status:** modified | **+11** / **-8**
- **Description:** Configuration or string content updated.
- **Themes:** authentication

### ✏️ `packages/adapter-rwkv/package.json`

- **Status:** modified | **+3** / **-3**
- **Description:** Configuration or string content updated.
- **Themes:** CI/CD, LangChain/LLM, schemas/types

### ✏️ `packages/adapter-spark/package.json`

- **Status:** modified | **+3** / **-3**
- **Description:** Configuration or string content updated.
- **Themes:** CI/CD, LangChain/LLM, schemas/types

### ✏️ `packages/adapter-wenxin/package.json`

- **Status:** modified | **+3** / **-3**
- **Description:** Configuration or string content updated.
- **Themes:** CI/CD, LangChain/LLM, schemas/types

### ✏️ `packages/adapter-zhipu/package.json`

- **Status:** modified | **+3** / **-3**
- **Description:** Configuration or string content updated.
- **Themes:** CI/CD, LangChain/LLM, authentication

### ✏️ `packages/adapter-zhipu/src/requester.ts`

- **Status:** modified | **+11** / **-8**
- **Description:** Configuration or string content updated.
- **Themes:** authentication

### ✏️ `packages/core/package.json`

- **Status:** modified | **+1** / **-1**
- **Description:** Configuration or string content updated.

### ✏️ `packages/core/src/llm-core/platform/model.ts`

- **Status:** modified | **+161** / **-59**
- **Description:** Imports or dependencies changed.
- **Themes:** error handling, tests, linting/formatting, API/routes, authentication

### ✏️ `packages/core/src/llm-core/platform/types.ts`

- **Status:** modified | **+6** / **-0**
- **Description:** Additions: e.g. export type TokenUsageTracker = {
- **Themes:** authentication

### ✏️ `packages/extension-long-memory/package.json`

- **Status:** modified | **+1** / **-1**
- **Description:** Configuration or string content updated.
- **Themes:** CI/CD, LangChain/LLM

### ✏️ `packages/extension-mcp/package.json`

- **Status:** modified | **+1** / **-1**
- **Description:** Configuration or string content updated.
- **Themes:** CI/CD, RAG/retrieval

### ✏️ `packages/extension-tools/package.json`

- **Status:** modified | **+1** / **-1**
- **Description:** Configuration or string content updated.
- **Themes:** CI/CD, RAG/retrieval

### ✏️ `packages/extension-variable/package.json`

- **Status:** modified | **+1** / **-1**
- **Description:** Configuration or string content updated.
- **Themes:** CI/CD, LangChain/LLM

### ✏️ `packages/renderer-image/package.json`

- **Status:** modified | **+1** / **-1**
- **Description:** Configuration or string content updated.
- **Themes:** CI/CD

### ✏️ `packages/service-embeddings/package.json`

- **Status:** modified | **+1** / **-1**
- **Description:** Configuration or string content updated.
- **Themes:** CI/CD

### ✏️ `packages/service-image/package.json`

- **Status:** modified | **+1** / **-1**
- **Description:** Configuration or string content updated.
- **Themes:** CI/CD, LangChain/LLM

### ✏️ `packages/service-search/package.json`

- **Status:** modified | **+1** / **-1**
- **Description:** Configuration or string content updated.
- **Themes:** CI/CD

### ✏️ `packages/service-vector-store/package.json`

- **Status:** modified | **+1** / **-1**
- **Description:** Configuration or string content updated.
- **Themes:** CI/CD

### ✏️ `packages/shared-adapter/package.json`

- **Status:** modified | **+2** / **-2**
- **Description:** Configuration or string content updated.
- **Themes:** CI/CD

### ✏️ `packages/shared-adapter/src/requester.ts`

- **Status:** modified | **+10** / **-8**
- **Description:** Configuration or string content updated.
- **Themes:** authentication
