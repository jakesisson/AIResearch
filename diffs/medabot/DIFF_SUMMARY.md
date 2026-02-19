# Diff Summary

**Project:** Research Data/medabot  
**Repo:** `luistorres/medabot`  
**Commit range:** `3facc256` → `b44b80ae` (researched commit is 1 ahead, 0 behind).
**Category (researched commit):** cost  

[Compare on GitHub](https://github.com/luistorres/medabot/compare/3facc256a7fb92baff9246476227839385f537f4...b44b80ae3991ac76872bec46e622c51bb5ab4cea)

## Summary

- **Files changed:** 22
- **Lines added:** 2132
- **Lines removed:** 233

**Themes:** error handling, CI/CD, message trimming, API/routes, schemas/types, LangChain/LLM, LLM provider, RAG/retrieval, authentication

**Tech debt (from TruePositiveCommitsClean):** Reliability/Cost

## Changes by file

### ✏️ `app.config.ts`

- **Status:** modified | **+2** / **-0**
- **Description:** Additions: e.g. // Ensure public directory is properly configured

### ✏️ `app/components/App.tsx`

- **Status:** modified | **+213** / **-145**
- **Description:** Imports or dependencies changed.
- **Themes:** error handling, CI/CD

### ✏️ `app/components/Camera.tsx`

- **Status:** modified | **+101** / **-19**
- **Description:** Implementation or content updated.

### ✏️ `app/components/Chat.tsx`

- **Status:** modified | **+70** / **-22**
- **Description:** Imports or dependencies changed.
- **Themes:** message trimming, CI/CD

### ➕ `app/components/LandingPage.tsx`

- **Status:** added | **+156** / **-0**
- **Description:** interface LandingPageProps {
- **Themes:** CI/CD

### ➕ `app/components/ManualMedicineForm.tsx`

- **Status:** added | **+240** / **-0**
- **Description:** New module with imports.
- **Themes:** error handling, CI/CD

### ➕ `app/components/MedicineInfoPanel.tsx`

- **Status:** added | **+163** / **-0**
- **Description:** New module with imports.
- **Themes:** CI/CD

### ➕ `app/components/PDFViewer.tsx`

- **Status:** added | **+266** / **-0**
- **Description:** New module with imports.
- **Themes:** error handling, API/routes

### ➕ `app/components/layouts/DesktopLayout.tsx`

- **Status:** added | **+103** / **-0**
- **Description:** New module with imports.
- **Themes:** CI/CD

### ➕ `app/components/layouts/MobileLayout.tsx`

- **Status:** added | **+34** / **-0**
- **Description:** New module with imports.
- **Themes:** CI/CD

### ➕ `app/components/layouts/ResponsiveContainer.tsx`

- **Status:** added | **+32** / **-0**
- **Description:** New module with imports.
- **Themes:** CI/CD

### ➕ `app/context/PDFContext.tsx`

- **Status:** added | **+56** / **-0**
- **Description:** New module with imports.

### ✏️ `app/core/identify.ts`

- **Status:** modified | **+4** / **-1**
- **Description:** Additions: e.g. try {
- **Themes:** CI/CD, schemas/types

### ✏️ `app/core/leafletProcessor.ts`

- **Status:** modified | **+102** / **-41**
- **Description:** Imports or dependencies changed.
- **Themes:** CI/CD, LangChain/LLM, LLM provider, RAG/retrieval, API/routes

### ➕ `app/hooks/useMediaQuery.ts`

- **Status:** added | **+23** / **-0**
- **Description:** New module with imports.

### ➕ `app/hooks/useScrollToBottom.ts`

- **Status:** added | **+41** / **-0**
- **Description:** New module with imports.

### ✏️ `app/index.css`

- **Status:** modified | **+74** / **-0**
- **Description:** Additions: e.g. /* Global styles */
- **Themes:** CI/CD

### ✏️ `app/server/queryLeaflet.ts`

- **Status:** modified | **+5** / **-1**
- **Description:** Implementation or content updated.
- **Themes:** CI/CD

### ➕ `app/utils/parseReferences.tsx`

- **Status:** added | **+81** / **-0**
- **Description:** New module with imports.
- **Themes:** message trimming, CI/CD

### ✏️ `package-lock.json`

- **Status:** modified | **+317** / **-2**
- **Description:** Configuration or string content updated.
- **Themes:** CI/CD, LangChain/LLM, LLM provider, API/routes, authentication

### ✏️ `package.json`

- **Status:** modified | **+6** / **-2**
- **Description:** Configuration or string content updated.
- **Themes:** CI/CD, LangChain/LLM, LLM provider

### ➕ `scripts/copy-pdf-worker.js`

- **Status:** added | **+43** / **-0**
- **Description:** #!/usr/bin/env node
