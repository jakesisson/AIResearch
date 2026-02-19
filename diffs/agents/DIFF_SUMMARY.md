# Diff Summary

**Project:** Research Data/agents  
**Repo:** `danny-avila/agents`  
**Commit range:** `ce19a8b8` → `399dbb01` (researched commit is 1 ahead, 0 behind).
**Category (researched commit):** performance  

[Compare on GitHub](https://github.com/danny-avila/agents/compare/ce19a8b87353f038fb99122ed66f0bbd2a9f977f...399dbb01547de86c1b159c30c2e139093628988f)

## Summary

- **Files changed:** 53
- **Lines added:** 3911
- **Lines removed:** 833

**Themes:** tests, CI/CD, LLM provider, API/routes, linting/formatting, Docker, error handling, LangGraph workflow, type checking, test coverage, RAG/retrieval, LangChain/LLM, authentication, schemas/types, message trimming

**Tech debt (from TruePositiveCommitsClean):** Scalability/Performance/Maintainability

## Changes by file

### ➖ `.eslintignore`

- **Status:** removed | **+0** / **-19**
- **Description:** File removed.
- **Themes:** tests, CI/CD, LLM provider, API/routes

### ➖ `.eslintrc.json`

- **Status:** removed | **+0** / **-65**
- **Description:** File removed.
- **Themes:** tests, linting/formatting, CI/CD, LLM provider, API/routes

### ➕ `.gitattributes`

- **Status:** added | **+66** / **-0**
- **Description:** # Set default behavior to automatically normalize line endings to LF
- **Themes:** linting/formatting, Docker, CI/CD

### ✏️ `bun.lockb`

- **Status:** modified | **+0** / **-0**
- **Description:** Content changed.

### ➕ `docs/multi-agent-patterns.md`

- **Status:** added | **+153** / **-0**
- **Description:** # Multi-Agent Patterns in Agentus
- **Themes:** error handling, CI/CD, LangGraph workflow, API/routes

### ➕ `docs/prompt-runnable-feature.md`

- **Status:** added | **+96** / **-0**
- **Description:** # Prompt Runnable Feature
- **Themes:** CI/CD, LLM provider

### ✏️ `eslint.config.mjs`

- **Status:** modified | **+3** / **-0**
- **Description:** Additions: e.g. varsIgnorePattern: "^_",
- **Themes:** linting/formatting

### ➕ `fix-line-endings.sh`

- **Status:** added | **+68** / **-0**
- **Description:** #!/bin/bash
- **Themes:** linting/formatting, type checking, test coverage, Docker, RAG/retrieval

### ✏️ `jest.config.mjs`

- **Status:** modified | **+12** / **-1**
- **Description:** Implementation or content updated.
- **Themes:** tests

### ✏️ `lint_analyzer.sh`

- **Status:** modified | **+0** / **-0**
- **Description:** Content changed.

### ✏️ `package-lock.json`

- **Status:** modified | **+51** / **-23**
- **Description:** Configuration or string content updated.
- **Themes:** type checking, CI/CD, LangGraph workflow, LangChain/LLM, LLM provider

### ✏️ `package.json`

- **Status:** modified | **+9** / **-4**
- **Description:** Configuration or string content updated.
- **Themes:** tests, CI/CD, LangGraph workflow, LangChain/LLM, LLM provider

### ➕ `remove-zone-identifiers.sh`

- **Status:** added | **+36** / **-0**
- **Description:** #!/bin/bash

### ➕ `src/agents/AgentContext.ts`

- **Status:** added | **+315** / **-0**
- **Description:** /* eslint-disable no-console */
- **Themes:** error handling, linting/formatting, CI/CD, LangChain/LLM, LLM provider

### ✏️ `src/common/enum.ts`

- **Status:** modified | **+4** / **-3**
- **Description:** Configuration or string content updated.
- **Themes:** error handling, API/routes, authentication

### ✏️ `src/events.ts`

- **Status:** modified | **+17** / **-11**
- **Description:** Imports or dependencies changed.
- **Themes:** linting/formatting, LangChain/LLM

### ✏️ `src/graphs/Graph.ts`

- **Status:** modified | **+472** / **-299**
- **Description:** Imports or dependencies changed.
- **Themes:** error handling, tests, linting/formatting, type checking, CI/CD

### ➕ `src/graphs/MultiAgentGraph.ts`

- **Status:** added | **+381** / **-0**
- **Description:** New module with imports.
- **Themes:** linting/formatting, type checking, CI/CD, LangGraph workflow, LangChain/LLM

### ✏️ `src/graphs/index.ts`

- **Status:** modified | **+2** / **-1**
- **Description:** Configuration or string content updated.

### ✏️ `src/llm/google/utils/zod_to_genai_parameters.ts`

- **Status:** modified | **+2** / **-4**
- **Description:** Implementation or content updated.
- **Themes:** linting/formatting, LLM provider, schemas/types

### ➕ `src/messages/reducer.ts`

- **Status:** added | **+80** / **-0**
- **Description:** New module with imports.
- **Themes:** error handling, CI/CD, LangChain/LLM

### ✏️ `src/run.ts`

- **Status:** modified | **+158** / **-103**
- **Description:** Imports or dependencies changed.
- **Themes:** error handling, tests, LangChain/LLM, LLM provider, schemas/types

### ✏️ `src/scripts/cli4.ts`

- **Status:** modified | **+29** / **-21**
- **Description:** Implementation or content updated.
- **Themes:** tests, LLM provider

### ✏️ `src/scripts/cli5.ts`

- **Status:** modified | **+29** / **-21**
- **Description:** Implementation or content updated.
- **Themes:** tests, LLM provider

### ✏️ `src/scripts/code_exec.ts`

- **Status:** modified | **+5** / **-5**
- **Description:** Configuration or string content updated.
- **Themes:** tests

### ✏️ `src/scripts/code_exec_simple.ts`

- **Status:** modified | **+46** / **-27**
- **Description:** Implementation or content updated.
- **Themes:** tests, authentication

### ➕ `src/scripts/handoff-test.ts`

- **Status:** added | **+135** / **-0**
- **Description:** New module with imports.
- **Themes:** tests, LangGraph workflow, LangChain/LLM, LLM provider, schemas/types

### ➕ `src/scripts/multi-agent-conditional.ts`

- **Status:** added | **+220** / **-0**
- **Description:** New module with imports.
- **Themes:** error handling, tests, CI/CD, LangChain/LLM, LLM provider

### ➕ `src/scripts/multi-agent-example-output.md`

- **Status:** added | **+110** / **-0**
- **Description:** # Multi-Agent Test Scripts - Example Output
- **Themes:** tests, CI/CD, API/routes, authentication

### ➕ `src/scripts/multi-agent-parallel.ts`

- **Status:** added | **+337** / **-0**
- **Description:** New module with imports.
- **Themes:** error handling, tests, type checking, CI/CD, LangGraph workflow

### ➕ `src/scripts/multi-agent-sequence.ts`

- **Status:** added | **+212** / **-0**
- **Description:** New module with imports.
- **Themes:** error handling, tests, LangChain/LLM, LLM provider, API/routes

### ➕ `src/scripts/multi-agent-test.ts`

- **Status:** added | **+186** / **-0**
- **Description:** New module with imports.
- **Themes:** error handling, tests, LangChain/LLM, LLM provider, API/routes

### ✏️ `src/scripts/search.ts`

- **Status:** modified | **+1** / **-9**
- **Description:** Configuration or string content updated.
- **Themes:** error handling, tests

### ✏️ `src/scripts/simple.ts`

- **Status:** modified | **+3** / **-2**
- **Description:** Imports or dependencies changed.
- **Themes:** tests

### ✏️ `src/scripts/tools.ts`

- **Status:** modified | **+3** / **-4**
- **Description:** Implementation or content updated.
- **Themes:** tests

### ✏️ `src/specs/anthropic.simple.test.ts`

- **Status:** modified | **+10** / **-7**
- **Description:** Imports or dependencies changed.
- **Themes:** tests, LangChain/LLM, API/routes

### ✏️ `src/specs/azure.simple.test.ts`

- **Status:** modified | **+17** / **-8**
- **Description:** Imports or dependencies changed.
- **Themes:** message trimming, tests, LangChain/LLM, LLM provider, API/routes

### ✏️ `src/specs/openai.simple.test.ts`

- **Status:** modified | **+2** / **-7**
- **Description:** Imports or dependencies changed.
- **Themes:** tests, LangChain/LLM, API/routes

### ➕ `src/specs/openrouter.simple.test.ts`

- **Status:** added | **+107** / **-0**
- **Description:** New module with imports.
- **Themes:** message trimming, tests, LangChain/LLM, API/routes, authentication

### ✏️ `src/specs/prune.test.ts`

- **Status:** modified | **+4** / **-9**
- **Description:** Implementation or content updated.
- **Themes:** tests, authentication

### ✏️ `src/specs/reasoning.test.ts`

- **Status:** modified | **+80** / **-44**
- **Description:** Imports or dependencies changed.
- **Themes:** tests, LangChain/LLM, API/routes

### ➕ `src/specs/token-memoization.test.ts`

- **Status:** added | **+39** / **-0**
- **Description:** New module with imports.
- **Themes:** tests, LangChain/LLM, authentication

### ✏️ `src/stream.ts`

- **Status:** modified | **+56** / **-55**
- **Description:** Imports or dependencies changed.
- **Themes:** error handling, LangChain/LLM, LLM provider, authentication

### ✏️ `src/tools/ToolNode.ts`

- **Status:** modified | **+4** / **-4**
- **Description:** Imports or dependencies changed.
- **Themes:** linting/formatting, CI/CD, LangChain/LLM

### ✏️ `src/tools/handlers.ts`

- **Status:** modified | **+32** / **-27**
- **Description:** Imports or dependencies changed.
- **Themes:** LangChain/LLM, LLM provider

### ✏️ `src/types/graph.ts`

- **Status:** modified | **+159** / **-20**
- **Description:** Imports or dependencies changed.
- **Themes:** error handling, linting/formatting, type checking, CI/CD, LangGraph workflow

### ✏️ `src/types/llm.ts`

- **Status:** modified | **+7** / **-3**
- **Description:** Imports or dependencies changed.
- **Themes:** LangChain/LLM, LLM provider, API/routes

### ✏️ `src/types/run.ts`

- **Status:** modified | **+47** / **-13**
- **Description:** Imports or dependencies changed.
- **Themes:** linting/formatting, CI/CD, LangChain/LLM, API/routes, authentication

### ✏️ `src/types/stream.ts`

- **Status:** modified | **+2** / **-1**
- **Description:** Imports or dependencies changed.
- **Themes:** LangGraph workflow, LangChain/LLM, LLM provider

### ➕ `src/utils/events.ts`

- **Status:** added | **+32** / **-0**
- **Description:** /* eslint-disable no-console */
- **Themes:** error handling, linting/formatting, type checking, CI/CD, LangChain/LLM

### ✏️ `src/utils/llmConfig.ts`

- **Status:** modified | **+2** / **-2**
- **Description:** Configuration or string content updated.
- **Themes:** LLM provider, API/routes

### ✏️ `src/utils/tokens.ts`

- **Status:** modified | **+69** / **-10**
- **Description:** Implementation or content updated.
- **Themes:** tests, type checking, CI/CD, LangChain/LLM, authentication

### ✏️ `types/package.json`

- **Status:** modified | **+1** / **-1**
- **Description:** Configuration or string content updated.
