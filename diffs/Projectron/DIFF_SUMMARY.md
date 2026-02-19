# Diff Summary

**Project:** Research Data/Projectron  
**Repo:** `Eden-Cohen1/Projectron`  
**Commit range:** `2cddc9ed` → `b0c6e9a9` (researched commit is 1 ahead, 0 behind).
**Category (researched commit):** both  

[Compare on GitHub](https://github.com/Eden-Cohen1/Projectron/compare/2cddc9edf806a39818e5cdf698fe4dd7ac764931...b0c6e9a966b61ae3f72057f07e3c20c6cc0d8ebe)

## Summary

- **Files changed:** 155
- **Lines added:** 21134
- **Lines removed:** 21090

**Themes:** error handling, API/routes, authentication, CI/CD, Docker, LangChain/LLM, RAG/retrieval, schemas/types, LLM provider, type checking, LangGraph workflow, tests, linting/formatting, message trimming

**Tech debt (from TruePositiveCommitsClean):** Performance/Cost

## Changes by file

### ✏️ `.gitignore`

- **Status:** modified | **+1** / **-0**
- **Description:** Additions: e.g. .history

### ➕ `.history/frontend/src/app/projects/new/page_20250511001153.tsx`

- **Status:** added | **+158** / **-0**
- **Description:** "use client";
- **Themes:** error handling, API/routes, authentication

### ➕ `.history/frontend/src/app/projects/new/page_20250511002420.tsx`

- **Status:** added | **+158** / **-0**
- **Description:** "use client";
- **Themes:** error handling, API/routes, authentication

### ✏️ `.history/frontend/src/app/projects/page_20250511000503.tsx`

- **Status:** modified | **+177** / **-177**
- **Description:** Imports or dependencies changed.
- **Themes:** error handling, CI/CD, API/routes, authentication

### ✏️ `.history/frontend/src/app/projects/page_20250511000621.tsx`

- **Status:** modified | **+173** / **-173**
- **Description:** Imports or dependencies changed.
- **Themes:** error handling, CI/CD, API/routes, authentication

### ✏️ `.history/frontend/src/app/projects/page_20250511000623.tsx`

- **Status:** modified | **+173** / **-173**
- **Description:** Imports or dependencies changed.
- **Themes:** error handling, CI/CD, API/routes, authentication

### ✏️ `.history/frontend/src/app/projects/page_20250511000626.tsx`

- **Status:** modified | **+173** / **-173**
- **Description:** Imports or dependencies changed.
- **Themes:** error handling, CI/CD, API/routes, authentication

### ✏️ `.history/frontend/src/app/projects/page_20250511000634.tsx`

- **Status:** modified | **+173** / **-173**
- **Description:** Imports or dependencies changed.
- **Themes:** error handling, CI/CD, API/routes, authentication

### ✏️ `.history/frontend/src/app/projects/page_20250511000649.tsx`

- **Status:** modified | **+347** / **-347**
- **Description:** Imports or dependencies changed.
- **Themes:** error handling, CI/CD, API/routes, authentication

### ✏️ `.vscode/settings.json`

- **Status:** modified | **+21** / **-21**
- **Description:** Configuration or string content updated.

### ➖ `Dockerfile`

- **Status:** removed | **+0** / **-0**
- **Description:** Content changed.

### ✏️ `README.md`

- **Status:** modified | **+74** / **-74**
- **Description:** Implementation or content updated.
- **Themes:** Docker, CI/CD, LangChain/LLM, RAG/retrieval, schemas/types

### ✏️ `backend/app/api/api_router.py`

- **Status:** modified | **+17** / **-17**
- **Description:** Imports or dependencies changed.
- **Themes:** API/routes, authentication

### ✏️ `backend/app/api/endpoints/diagrams.py`

- **Status:** modified | **+1** / **-1**
- **Description:** Configuration or string content updated.

### ✏️ `backend/app/api/endpoints/plan.py`

- **Status:** modified | **+47** / **-113**
- **Description:** Imports or dependencies changed.
- **Themes:** error handling, schemas/types, API/routes, authentication

### ✏️ `backend/app/api/endpoints/projects.py`

- **Status:** modified | **+140** / **-140**
- **Description:** Imports or dependencies changed.
- **Themes:** error handling, API/routes, authentication

### ✏️ `backend/app/core/config.py`

- **Status:** modified | **+67** / **-67**
- **Description:** Imports or dependencies changed.
- **Themes:** LLM provider, schemas/types, API/routes, authentication

### ✏️ `backend/app/db/models/__init__.py`

- **Status:** modified | **+6** / **-6**
- **Description:** Imports or dependencies changed.
- **Themes:** authentication

### ✏️ `backend/app/db/models/project.py`

- **Status:** modified | **+45** / **-45**
- **Description:** Imports or dependencies changed.
- **Themes:** API/routes, authentication

### ✏️ `backend/app/pydantic_models/ai_plan_models.py`

- **Status:** modified | **+296** / **-198**
- **Description:** Imports or dependencies changed.
- **Themes:** CI/CD, schemas/types, API/routes, authentication

### ✏️ `backend/app/pydantic_models/project_http_models.py`

- **Status:** modified | **+52** / **-52**
- **Description:** Imports or dependencies changed.
- **Themes:** schemas/types

### ✏️ `backend/app/services/ai/__init__.py`

- **Status:** modified | **+0** / **-3**
- **Description:** Removals or deletions.

### ✏️ `backend/app/services/ai/__pycache__/__init__.cpython-312.pyc`

- **Status:** modified | **+0** / **-0**
- **Description:** Content changed.

### ✏️ `backend/app/services/ai/__pycache__/project_ai_service.cpython-312.pyc`

- **Status:** modified | **+0** / **-0**
- **Description:** Content changed.

### ➕ `backend/app/services/ai/ai_plan_service.py`

- **Status:** added | **+448** / **-0**
- **Description:** New module with imports.
- **Themes:** error handling, type checking, CI/CD, LangGraph workflow, schemas/types

### ✏️ `backend/app/services/ai/ai_utils.py`

- **Status:** modified | **+31** / **-12**
- **Description:** Imports or dependencies changed.
- **Themes:** error handling, CI/CD, LangChain/LLM, LLM provider, API/routes

### ➖ `backend/app/services/ai/plan_prompts.py`

- **Status:** removed | **+0** / **-566**
- **Description:** File removed.
- **Themes:** tests, CI/CD, schemas/types, API/routes, authentication

### ➕ `backend/app/services/ai/plan_prompts_copy.py`

- **Status:** added | **+328** / **-0**
- **Description:** """
- **Themes:** tests, CI/CD, LangGraph workflow, schemas/types, API/routes

### ➖ `backend/app/services/ai/project_ai_service.py`

- **Status:** removed | **+0** / **-446**
- **Description:** File removed.
- **Themes:** error handling, LangChain/LLM, schemas/types, API/routes

### ➖ `backend/app/services/ai/validations.py`

- **Status:** removed | **+0** / **-104**
- **Description:** File removed.
- **Themes:** error handling, LangChain/LLM, schemas/types

### ✏️ `backend/app/utils/mongo_encoder.py`

- **Status:** modified | **+43** / **-43**
- **Description:** Imports or dependencies changed.
- **Themes:** CI/CD, API/routes

### ✏️ `backend/app/utils/serializers.py`

- **Status:** modified | **+184** / **-186**
- **Description:** Imports or dependencies changed.
- **Themes:** error handling, schemas/types, API/routes, authentication

### ✏️ `backend/requirements.txt`

- **Status:** modified | **+3** / **-1**
- **Description:** Implementation or content updated.
- **Themes:** LangGraph workflow, LangChain/LLM, LLM provider

### ✏️ `docker-compose.yml`

- **Status:** modified | **+13** / **-6**
- **Description:** Implementation or content updated.
- **Themes:** LLM provider, API/routes

### ➕ `frontend/Dockerfile`

- **Status:** added | **+12** / **-0**
- **Description:** FROM node:18-alpine

### ✏️ `frontend/package-lock.json`

- **Status:** modified | **+11188** / **-11188**
- **Description:** Content changed.

### ✏️ `frontend/package.json`

- **Status:** modified | **+60** / **-60**
- **Description:** Configuration or string content updated.
- **Themes:** linting/formatting, type checking, CI/CD, authentication

### ✏️ `frontend/src/app/auth/verify-email/confirm/page.tsx`

- **Status:** modified | **+14** / **-14**
- **Description:** Imports or dependencies changed.
- **Themes:** authentication

### ✏️ `frontend/src/app/globals.css`

- **Status:** modified | **+256** / **-256**
- **Description:** Implementation or content updated.
- **Themes:** CI/CD

### ✏️ `frontend/src/app/page.tsx`

- **Status:** modified | **+20** / **-20**
- **Description:** Imports or dependencies changed.

### ✏️ `frontend/src/app/projects/[id]/page.tsx`

- **Status:** modified | **+68** / **-68**
- **Description:** Imports or dependencies changed.
- **Themes:** API/routes, authentication

### ✏️ `frontend/src/app/projects/new/page.tsx`

- **Status:** modified | **+158** / **-158**
- **Description:** Imports or dependencies changed.
- **Themes:** error handling, API/routes, authentication

### ✏️ `frontend/src/app/projects/page.tsx`

- **Status:** modified | **+173** / **-173**
- **Description:** Imports or dependencies changed.
- **Themes:** error handling, CI/CD, API/routes, authentication

### ✏️ `frontend/src/components/auth/email-verification-confirm.tsx`

- **Status:** modified | **+101** / **-101**
- **Description:** Imports or dependencies changed.
- **Themes:** error handling, CI/CD, API/routes, authentication

### ✏️ `frontend/src/components/auth/login-form.tsx`

- **Status:** modified | **+145** / **-145**
- **Description:** Configuration or string content updated.
- **Themes:** error handling, CI/CD, schemas/types, authentication

### ✏️ `frontend/src/components/auth/register-form.tsx`

- **Status:** modified | **+196** / **-196**
- **Description:** Imports or dependencies changed.
- **Themes:** error handling, CI/CD, schemas/types, authentication

### ✏️ `frontend/src/components/layout/app-layout.tsx`

- **Status:** modified | **+54** / **-54**
- **Description:** Configuration or string content updated.
- **Themes:** API/routes, authentication

### ✏️ `frontend/src/components/layout/auth-layout.tsx`

- **Status:** modified | **+56** / **-56**
- **Description:** Configuration or string content updated.
- **Themes:** API/routes, authentication

### ✏️ `frontend/src/components/layout/landing-footer.tsx`

- **Status:** modified | **+96** / **-96**
- **Description:** Imports or dependencies changed.
- **Themes:** type checking, CI/CD

### ✏️ `frontend/src/components/layout/landing-header.tsx`

- **Status:** modified | **+187** / **-187**
- **Description:** Imports or dependencies changed.
- **Themes:** CI/CD, authentication

### ✏️ `frontend/src/components/layout/main-nav.tsx`

- **Status:** modified | **+203** / **-203**
- **Description:** Imports or dependencies changed.
- **Themes:** CI/CD, API/routes, authentication

### ✏️ `frontend/src/components/projects/empty-projects.tsx`

- **Status:** modified | **+25** / **-25**
- **Description:** Imports or dependencies changed.
- **Themes:** CI/CD

### ✏️ `frontend/src/components/projects/new/components/clarification-questions-section.tsx`

- **Status:** modified | **+215** / **-215**
- **Description:** Imports or dependencies changed.
- **Themes:** type checking, CI/CD

### ✏️ `frontend/src/components/projects/new/components/plan-generation-form.tsx`

- **Status:** modified | **+303** / **-303**
- **Description:** Imports or dependencies changed.
- **Themes:** error handling, CI/CD, schemas/types

### ✏️ `frontend/src/components/projects/new/components/tech-stack-selector.tsx`

- **Status:** modified | **+206** / **-206**
- **Description:** Imports or dependencies changed.
- **Themes:** Docker, CI/CD, API/routes

### ✏️ `frontend/src/components/projects/new/components/typewriter-text.tsx`

- **Status:** modified | **+55** / **-55**
- **Description:** Imports or dependencies changed.

### ✏️ `frontend/src/components/projects/new/types.ts`

- **Status:** modified | **+111** / **-111**
- **Description:** Implementation or content updated.
- **Themes:** tests, API/routes

### ✏️ `frontend/src/components/projects/project-card.tsx`

- **Status:** modified | **+99** / **-99**
- **Description:** Imports or dependencies changed.
- **Themes:** type checking, CI/CD

### ✏️ `frontend/src/components/projects/project-error.tsx`

- **Status:** modified | **+38** / **-38**
- **Description:** Imports or dependencies changed.
- **Themes:** CI/CD, API/routes

### ✏️ `frontend/src/components/projects/project-header.tsx`

- **Status:** modified | **+261** / **-261**
- **Description:** Imports or dependencies changed.
- **Themes:** error handling, CI/CD, API/routes

### ✏️ `frontend/src/components/projects/project-loading-skeleton.tsx`

- **Status:** modified | **+37** / **-37**
- **Description:** Imports or dependencies changed.

### ✏️ `frontend/src/components/projects/project-tabs.tsx`

- **Status:** modified | **+235** / **-235**
- **Description:** Imports or dependencies changed.
- **Themes:** CI/CD, API/routes

### ✏️ `frontend/src/components/projects/projects-list.tsx`

- **Status:** modified | **+23** / **-23**
- **Description:** Imports or dependencies changed.

### ✏️ `frontend/src/components/projects/search-projects.tsx`

- **Status:** modified | **+31** / **-31**
- **Description:** Imports or dependencies changed.
- **Themes:** CI/CD

### ✏️ `frontend/src/components/projects/tabs/api-endpoints-tab/components/dialogs/new-endpoint-dialog.tsx`

- **Status:** modified | **+159** / **-159**
- **Description:** Imports or dependencies changed.
- **Themes:** type checking, API/routes, authentication

### ✏️ `frontend/src/components/projects/tabs/api-endpoints-tab/components/dialogs/new-recource-dialog.tsx`

- **Status:** modified | **+99** / **-99**
- **Description:** Imports or dependencies changed.
- **Themes:** API/routes

### ✏️ `frontend/src/components/projects/tabs/api-endpoints-tab/components/endpoint-item.tsx`

- **Status:** modified | **+350** / **-350**
- **Description:** Imports or dependencies changed.
- **Themes:** type checking, CI/CD, API/routes, authentication

### ✏️ `frontend/src/components/projects/tabs/api-endpoints-tab/components/expandable-text.tsx`

- **Status:** modified | **+31** / **-31**
- **Description:** Imports or dependencies changed.

### ✏️ `frontend/src/components/projects/tabs/api-endpoints-tab/components/json-display.tsx`

- **Status:** modified | **+104** / **-104**
- **Description:** Imports or dependencies changed.
- **Themes:** CI/CD

### ✏️ `frontend/src/components/projects/tabs/api-endpoints-tab/components/path-params.tsx`

- **Status:** modified | **+48** / **-48**
- **Description:** Configuration or string content updated.

### ✏️ `frontend/src/components/projects/tabs/api-endpoints-tab/components/query-param-item.tsx`

- **Status:** modified | **+216** / **-216**
- **Description:** Imports or dependencies changed.
- **Themes:** type checking, CI/CD

### ✏️ `frontend/src/components/projects/tabs/api-endpoints-tab/components/request-section.tsx`

- **Status:** modified | **+772** / **-772**
- **Description:** Imports or dependencies changed.
- **Themes:** type checking, CI/CD, schemas/types

### ✏️ `frontend/src/components/projects/tabs/api-endpoints-tab/components/resource-section.tsx`

- **Status:** modified | **+249** / **-249**
- **Description:** Imports or dependencies changed.
- **Themes:** CI/CD, API/routes

### ✏️ `frontend/src/components/projects/tabs/api-endpoints-tab/components/response-error-item.tsx`

- **Status:** modified | **+155** / **-155**
- **Description:** Imports or dependencies changed.
- **Themes:** CI/CD

### ✏️ `frontend/src/components/projects/tabs/api-endpoints-tab/components/response-section.tsx`

- **Status:** modified | **+318** / **-318**
- **Description:** Imports or dependencies changed.
- **Themes:** error handling, CI/CD, schemas/types

### ✏️ `frontend/src/components/projects/tabs/api-endpoints-tab/constants.ts`

- **Status:** modified | **+78** / **-78**
- **Description:** Implementation or content updated.
- **Themes:** schemas/types, API/routes, authentication

### ✏️ `frontend/src/components/projects/tabs/api-endpoints-tab/index.tsx`

- **Status:** modified | **+580** / **-580**
- **Description:** Imports or dependencies changed.
- **Themes:** message trimming, error handling, type checking, CI/CD, RAG/retrieval

### ✏️ `frontend/src/components/projects/tabs/api-endpoints-tab/types.ts`

- **Status:** modified | **+0** / **-0**
- **Description:** Content changed.

### ✏️ `frontend/src/components/projects/tabs/architecture-tab/components/section-communication.tsx`

- **Status:** modified | **+0** / **-0**
- **Description:** Content changed.

### ✏️ `frontend/src/components/projects/tabs/architecture-tab/components/section-components.tsx`

- **Status:** modified | **+0** / **-0**
- **Description:** Content changed.

### ✏️ `frontend/src/components/projects/tabs/architecture-tab/components/section-infrastructure.tsx`

- **Status:** modified | **+0** / **-0**
- **Description:** Content changed.

### ✏️ `frontend/src/components/projects/tabs/architecture-tab/components/section-overview.tsx`

- **Status:** modified | **+0** / **-0**
- **Description:** Content changed.

### ✏️ `frontend/src/components/projects/tabs/architecture-tab/components/section-patterns.tsx`

- **Status:** modified | **+0** / **-0**
- **Description:** Content changed.

### ✏️ `frontend/src/components/projects/tabs/architecture-tab/helpers.ts`

- **Status:** modified | **+0** / **-0**
- **Description:** Content changed.

### ✏️ `frontend/src/components/projects/tabs/architecture-tab/index.tsx`

- **Status:** modified | **+0** / **-0**
- **Description:** Content changed.

### ✏️ `frontend/src/components/projects/tabs/architecture-tab/types.ts`

- **Status:** modified | **+0** / **-0**
- **Description:** Content changed.

### ✏️ `frontend/src/components/projects/tabs/data-models-tab/components/dialogs/new-entity-dialog.tsx`

- **Status:** modified | **+0** / **-0**
- **Description:** Content changed.

### ✏️ `frontend/src/components/projects/tabs/data-models-tab/components/dialogs/new-relationship-dialog.tsx`

- **Status:** modified | **+0** / **-0**
- **Description:** Content changed.

### ✏️ `frontend/src/components/projects/tabs/data-models-tab/components/entity-card.tsx`

- **Status:** modified | **+0** / **-0**
- **Description:** Content changed.

### ✏️ `frontend/src/components/projects/tabs/data-models-tab/components/expandable-text.tsx`

- **Status:** modified | **+0** / **-0**
- **Description:** Content changed.

### ✏️ `frontend/src/components/projects/tabs/data-models-tab/components/property-item.tsx`

- **Status:** modified | **+0** / **-0**
- **Description:** Content changed.

### ✏️ `frontend/src/components/projects/tabs/data-models-tab/components/relationship-badge.tsx`

- **Status:** modified | **+0** / **-0**
- **Description:** Content changed.

### ✏️ `frontend/src/components/projects/tabs/data-models-tab/constants.ts`

- **Status:** modified | **+0** / **-0**
- **Description:** Content changed.

### ✏️ `frontend/src/components/projects/tabs/data-models-tab/index.tsx`

- **Status:** modified | **+0** / **-0**
- **Description:** Content changed.

### ✏️ `frontend/src/components/projects/tabs/data-models-tab/types.ts`

- **Status:** modified | **+0** / **-0**
- **Description:** Content changed.

### ✏️ `frontend/src/components/projects/tabs/high-level-plan-tab/components/section-features.tsx`

- **Status:** modified | **+0** / **-0**
- **Description:** Content changed.

### ✏️ `frontend/src/components/projects/tabs/high-level-plan-tab/components/section-overview.tsx`

- **Status:** modified | **+0** / **-0**
- **Description:** Content changed.

### ✏️ `frontend/src/components/projects/tabs/high-level-plan-tab/components/section-risks.tsx`

- **Status:** modified | **+0** / **-0**
- **Description:** Content changed.

### ✏️ `frontend/src/components/projects/tabs/high-level-plan-tab/components/section-scope.tsx`

- **Status:** modified | **+0** / **-0**
- **Description:** Content changed.

### ✏️ `frontend/src/components/projects/tabs/high-level-plan-tab/components/section-success.tsx`

- **Status:** modified | **+0** / **-0**
- **Description:** Content changed.

### ✏️ `frontend/src/components/projects/tabs/high-level-plan-tab/components/section-users.tsx`

- **Status:** modified | **+0** / **-0**
- **Description:** Content changed.

### ✏️ `frontend/src/components/projects/tabs/high-level-plan-tab/components/section-vision.tsx`

- **Status:** modified | **+0** / **-0**
- **Description:** Content changed.

### ✏️ `frontend/src/components/projects/tabs/high-level-plan-tab/helpers.ts`

- **Status:** modified | **+0** / **-0**
- **Description:** Content changed.

### ✏️ `frontend/src/components/projects/tabs/high-level-plan-tab/index.tsx`

- **Status:** modified | **+0** / **-0**
- **Description:** Content changed.

### ✏️ `frontend/src/components/projects/tabs/high-level-plan-tab/types.ts`

- **Status:** modified | **+0** / **-0**
- **Description:** Content changed.

### ✏️ `frontend/src/components/projects/tabs/implementation_plan_tab/components/completion-bar.tsx`

- **Status:** modified | **+0** / **-0**
- **Description:** Content changed.

### ✏️ `frontend/src/components/projects/tabs/implementation_plan_tab/components/dialogs/edit-milestone-dialog.tsx`

- **Status:** modified | **+0** / **-0**
- **Description:** Content changed.

### ✏️ `frontend/src/components/projects/tabs/implementation_plan_tab/components/dialogs/edit-subtask-dialog.tsx`

- **Status:** modified | **+0** / **-0**
- **Description:** Content changed.

### ✏️ `frontend/src/components/projects/tabs/implementation_plan_tab/components/dialogs/edit-task-dialog.tsx`

- **Status:** modified | **+0** / **-0**
- **Description:** Content changed.

### ✏️ `frontend/src/components/projects/tabs/implementation_plan_tab/components/milestone-item.tsx`

- **Status:** modified | **+0** / **-0**
- **Description:** Content changed.

### ✏️ `frontend/src/components/projects/tabs/implementation_plan_tab/components/subtask-item.tsx`

- **Status:** modified | **+0** / **-0**
- **Description:** Content changed.

### ✏️ `frontend/src/components/projects/tabs/implementation_plan_tab/components/task-item.tsx`

- **Status:** modified | **+0** / **-0**
- **Description:** Content changed.

### ✏️ `frontend/src/components/projects/tabs/implementation_plan_tab/constants.ts`

- **Status:** modified | **+0** / **-0**
- **Description:** Content changed.

### ✏️ `frontend/src/components/projects/tabs/implementation_plan_tab/index.tsx`

- **Status:** modified | **+0** / **-0**
- **Description:** Content changed.

### ✏️ `frontend/src/components/projects/tabs/implementation_plan_tab/types.ts`

- **Status:** modified | **+0** / **-0**
- **Description:** Content changed.

### ✏️ `frontend/src/components/projects/tabs/ui_components-tab/components/component-card.tsx`

- **Status:** modified | **+0** / **-0**
- **Description:** Content changed.

### ✏️ `frontend/src/components/projects/tabs/ui_components-tab/components/component-item.tsx`

- **Status:** modified | **+0** / **-0**
- **Description:** Content changed.

### ✏️ `frontend/src/components/projects/tabs/ui_components-tab/components/dialogs/new-component-dialog.tsx`

- **Status:** modified | **+0** / **-0**
- **Description:** Content changed.

### ✏️ `frontend/src/components/projects/tabs/ui_components-tab/components/dialogs/new-screen-dialog.tsx`

- **Status:** modified | **+0** / **-0**
- **Description:** Content changed.

### ✏️ `frontend/src/components/projects/tabs/ui_components-tab/components/expandable-text.tsx`

- **Status:** modified | **+0** / **-0**
- **Description:** Content changed.

### ✏️ `frontend/src/components/projects/tabs/ui_components-tab/components/screen-header.tsx`

- **Status:** modified | **+0** / **-0**
- **Description:** Content changed.

### ✏️ `frontend/src/components/projects/tabs/ui_components-tab/constants.ts`

- **Status:** modified | **+0** / **-0**
- **Description:** Content changed.

### ✏️ `frontend/src/components/projects/tabs/ui_components-tab/index.tsx`

- **Status:** modified | **+0** / **-0**
- **Description:** Content changed.

### ✏️ `frontend/src/components/projects/tabs/ui_components-tab/types.ts`

- **Status:** modified | **+0** / **-0**
- **Description:** Content changed.

### ✏️ `frontend/src/components/sections/feature-carousel.tsx`

- **Status:** modified | **+0** / **-0**
- **Description:** Content changed.

### ✏️ `frontend/src/components/sections/hero-section.tsx`

- **Status:** modified | **+0** / **-0**
- **Description:** Content changed.

### ✏️ `frontend/src/components/sections/how-it-works.tsx`

- **Status:** modified | **+0** / **-0**
- **Description:** Content changed.

### ✏️ `frontend/src/components/sections/index.ts`

- **Status:** modified | **+0** / **-0**
- **Description:** Content changed.

### ✏️ `frontend/src/components/sections/pain-points-section.tsx`

- **Status:** modified | **+0** / **-0**
- **Description:** Content changed.

### ✏️ `frontend/src/components/ui/accordion.tsx`

- **Status:** modified | **+0** / **-0**
- **Description:** Content changed.

### ✏️ `frontend/src/components/ui/alert-dialog.tsx`

- **Status:** modified | **+0** / **-0**
- **Description:** Content changed.

### ✏️ `frontend/src/components/ui/background-gradient.tsx`

- **Status:** modified | **+0** / **-0**
- **Description:** Content changed.

### ✏️ `frontend/src/components/ui/badge.tsx`

- **Status:** modified | **+0** / **-0**
- **Description:** Content changed.

### ✏️ `frontend/src/components/ui/button.tsx`

- **Status:** modified | **+0** / **-0**
- **Description:** Content changed.

### ✏️ `frontend/src/components/ui/checkbox.tsx`

- **Status:** modified | **+0** / **-0**
- **Description:** Content changed.

### ✏️ `frontend/src/components/ui/collapsible.tsx`

- **Status:** modified | **+0** / **-0**
- **Description:** Content changed.

### ✏️ `frontend/src/components/ui/comparison-slider.tsx`

- **Status:** modified | **+0** / **-0**
- **Description:** Content changed.

### ✏️ `frontend/src/components/ui/progress.tsx`

- **Status:** modified | **+0** / **-0**
- **Description:** Content changed.

### ✏️ `frontend/src/components/ui/radio-group.tsx`

- **Status:** modified | **+0** / **-0**
- **Description:** Content changed.

### ✏️ `frontend/src/components/ui/screenshot-display.tsx`

- **Status:** modified | **+0** / **-0**
- **Description:** Content changed.

### ✏️ `frontend/src/components/ui/scroll-area.tsx`

- **Status:** modified | **+0** / **-0**
- **Description:** Content changed.

### ✏️ `frontend/src/components/ui/select.tsx`

- **Status:** modified | **+0** / **-0**
- **Description:** Content changed.

### ✏️ `frontend/src/components/ui/skeleton.tsx`

- **Status:** modified | **+0** / **-0**
- **Description:** Content changed.

### ✏️ `frontend/src/components/ui/switch.tsx`

- **Status:** modified | **+0** / **-0**
- **Description:** Content changed.

### ✏️ `frontend/src/components/ui/textarea.tsx`

- **Status:** modified | **+0** / **-0**
- **Description:** Content changed.

### ✏️ `frontend/src/components/ui/timeline-progress.tsx`

- **Status:** modified | **+0** / **-0**
- **Description:** Content changed.

### ✏️ `frontend/src/components/ui/toast.tsx`

- **Status:** modified | **+0** / **-0**
- **Description:** Content changed.

### ✏️ `frontend/src/components/ui/toaster.tsx`

- **Status:** modified | **+0** / **-0**
- **Description:** Content changed.

### ✏️ `frontend/src/hooks/use-toast.ts`

- **Status:** modified | **+0** / **-0**
- **Description:** Content changed.

### ✏️ `frontend/src/lib/api.ts`

- **Status:** modified | **+0** / **-0**
- **Description:** Content changed.

### ✏️ `frontend/src/lib/auth.ts`

- **Status:** modified | **+0** / **-0**
- **Description:** Content changed.

### ✏️ `frontend/src/lib/projects.ts`

- **Status:** modified | **+0** / **-0**
- **Description:** Content changed.

### ✏️ `frontend/src/lib/utils.ts`

- **Status:** modified | **+0** / **-0**
- **Description:** Content changed.

### ✏️ `frontend/src/types/index.ts`

- **Status:** modified | **+0** / **-0**
- **Description:** Content changed.

### ✏️ `frontend/tailwind.config.ts`

- **Status:** modified | **+0** / **-0**
- **Description:** Content changed.
