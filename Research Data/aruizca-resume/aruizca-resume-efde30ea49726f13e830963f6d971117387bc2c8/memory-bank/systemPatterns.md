# System Patterns: Architecture & Design

## Architecture Overview
**Pattern**: Domain-Driven Design (DDD) + Hexagonal Architecture (Ports & Adapters)

### Context Module: `resume-generator`
All core application logic is encapsulated within the `resume-generator` context module, following DDD principles.

## Component Structure

```
src/resume-generator/
├── service/                    # Application Services (Use Cases)
│   ├── GenerateResume.ts      # Main orchestration service
│   └── index.ts
├── domain/                     # Domain Layer
│   ├── model/
│   │   ├── Resume.ts          # Resume entity (JSON Resume schema)
│   │   └── index.ts
│   ├── services/
│   │   ├── ResumeBuilder.ts   # Domain logic for resume construction
│   │   └── index.ts
│   └── index.ts
├── infrastructure/             # Infrastructure Layer
│   ├── parsers/
│   │   ├── LinkedInParser.ts  # LinkedIn data extraction
│   │   └── index.ts
│   ├── langchain/
│   │   ├── PromptRunner.ts    # AI/LLM integration
│   │   └── index.ts
│   ├── output/
│   │   ├── HtmlRenderer.ts    # HTML generation
│   │   ├── PdfExporter.ts     # PDF export
│   │   └── index.ts
│   └── index.ts
├── prompts/
│   └── resumePrompt.txt       # Externalized prompt template
└── index.ts                   # Context module exports
```

## Design Patterns

### 1. Hexagonal Architecture (Ports & Adapters)
- **Domain Layer**: Core business logic (Resume entity, ResumeBuilder service)
- **Application Layer**: Use cases and orchestration (GenerateResume service)
- **Infrastructure Layer**: External concerns (parsers, AI, output renderers)

### 2. Dependency Injection
- Services accept dependencies through constructor injection
- Enables easy testing and component swapping
- Example: `GenerateResume` accepts all dependencies as constructor parameters

### 3. Repository Pattern (Future)
- Current: Direct file system operations
- Future: Abstract interfaces for data persistence
- Enables different storage backends (local files, cloud storage, etc.)

### 4. Strategy Pattern
- Different output formats (HTML, PDF) implement common interface
- Theme selection can be swapped without changing core logic
- AI providers can be swapped (OpenAI, other LLMs)

### 5. Barrel Exports Pattern
- **Purpose**: Clean imports and encapsulation through `index.ts` files
- **Implementation**: Each directory has an `index.ts` that re-exports from sub-modules
- **Requirement**: ALL imports MUST use the barrel pattern. Direct imports from specific files are NOT allowed.
- **Benefits**: 
  - Clean imports: `import { Component } from './components'` vs `import { Component } from './components/Component'`
  - Encapsulation: Hide internal file structure from consumers
  - Refactoring: Change internal organization without breaking external imports
  - Tree-shaking friendly: Better for bundlers to optimize

#### Barrel Pattern Implementation
```typescript
// src/main/resume-generator/index.ts
export * from './service';
export * from './domain';
export * from './infrastructure';

// src/main/resume-generator/domain/index.ts
export * from './model';
export * from './services';

// src/main/shared/infrastructure/utils/index.ts
export * from './fileUtils';
export * from './errors';
export * from './validation';
export * from './errorMessages';
export * from './recovery';
export * from './performanceMonitor';
```

#### Best Practices
- **MANDATORY**: All imports must use the barrel pattern through index.ts files
- **CRITICAL RULE**: NEVER import from subfolders below domain context folders:
  ```typescript
  // ✅ CORRECT - Only import from domain context level
  import { LinkedInParser } from '../main/resume';
  import { ValidationError } from '../main/shared';
  import { JobOffer } from '../main/cover-letter';

  // ❌ WRONG - Never import from subfolders
  import { LinkedInParser } from '../main/resume/infrastructure';
  import { ValidationError } from '../main/shared/infrastructure/utils';
  import { JobOffer } from '../main/cover-letter/domain/model';
  ```
- **NO EXCEPTIONS**: Direct imports from specific files are not allowed
- **Import Optimization** (MANDATORY for ALL files):
  1. **Remove unused imports** FIRST - eliminate any import that is not actually used in the file
  2. **Alphabetize imports** within each group for consistency
  3. **Group imports** in this specific order:
     - Node.js built-ins (path, fs/promises, etc.)
     - Third-party packages (react, vitest, @chakra-ui/react, etc.)  
     - Local imports (relative paths starting with ./ or ../)
  4. **Use barrel patterns** at domain context level ONLY
  5. **Combine imports** from the same module into a single statement
  6. **Sort Chakra UI imports** alphabetically for readability
  7. **Verify usage** - ensure every imported symbol is actually used in the code
- **Explicit named exports** over `export *` for better tree-shaking
- **Avoid `export *` with CommonJS modules** - use explicit named exports instead
- **Performance consideration**: Barrel files can slow down builds in Next.js
- **Consistent naming**: Use `index.ts` for all barrel files

#### Identifying Unused Imports
**CRITICAL**: Before organizing imports, always remove unused ones:

1. **Check for usage** - Search for each imported symbol in the file
2. **Remove completely unused imports** - Delete entire import lines if nothing is used
3. **Remove specific unused symbols** - Keep only the symbols that are actually used
4. **Validate after removal** - Ensure code still compiles and tests pass

```typescript
// ❌ BAD - Has unused imports
import { useState, useEffect, useCallback } from 'react';                    // useCallback unused
import { Box, Button, Alert, Badge, Text } from '@chakra-ui/react';         // Badge unused
import { join, dirname, basename } from 'path';                             // dirname, basename unused

// ✅ GOOD - Only imports what's actually used
import { useState, useEffect } from 'react';                                // Only used hooks
import { Alert, Box, Button, Text } from '@chakra-ui/react';                // Only used components
import { join } from 'path';                                                // Only used function
```

#### Example Pattern
```typescript
// ✅ PERFECT - Fully optimized imports following ALL standards
import { join } from 'path';                                                 // Node built-ins first
import { beforeEach, describe, expect, it, vi } from 'vitest';               // Third-party (alphabetized)
import { mkdir, readFile, writeFile } from 'fs/promises';                   // Node built-ins (alphabetized)
import { 
  Alert,
  AlertIcon, 
  Box,
  Button,
  FormControl,
  FormLabel,
  VStack 
} from '@chakra-ui/react';                                                   // Third-party UI (alphabetized)
import { LinkedInParser } from '../../../main/resume';                      // Local (domain context only)
import { ValidationError } from '../../../main/shared';                     // Local (domain context only)

// ❌ BAD - Multiple violations
import { Resume } from './domain/model/Resume';                              // ❌ Too deep (violates barrel pattern)
import { describe } from 'vitest';                                          // ❌ Split imports
import { it, expect, vi } from 'vitest';                                    // ❌ Split imports  
import { VStack, Box, Button, Alert, Badge } from '@chakra-ui/react';       // ❌ Not alphabetized + Badge unused
import { readFile } from 'fs/promises';
import { writeFile, stat } from 'fs/promises';                              // ❌ Split fs imports + stat unused
import { ResumeBuilder } from './domain/services/ResumeBuilder';             // ❌ Too deep (violates barrel pattern)
import { useState, useEffect } from 'react';                                // ❌ Wrong order + useEffect unused

// ✅ Good - Explicit named exports in barrel files
export { Resume } from './model/Resume';
export { ResumeBuilder } from './services/ResumeBuilder';

// ❌ Avoid - Wildcard exports with CommonJS
export * from './components';
```

## Data Flow

```
LinkedIn ZIP → LinkedInParser → ParsedData
                                    ↓
PromptRunner ← PromptTemplate ← OpenAI API
                                    ↓
ResumeBuilder → JSON Resume → HtmlRenderer → HTML
                                    ↓
PdfExporter → PDF
```

## Key Interfaces

### Resume Entity
```typescript
interface Resume {
  basics: {
    name: string;
    email: string;
    phone?: string;
    location?: Location;
    profiles?: Profile[];
  };
  work: Work[];
  education: Education[];
  skills: Skill[];
  languages?: Language[];
  // ... other JSON Resume fields
}
```

### Service Contracts
- `LinkedInParser.parse(zipPath: string): Promise<ParsedData>`
- `PromptRunner.run(data: ParsedData): Promise<StructuredData>`
- `ResumeBuilder.build(data: StructuredData): Resume`
- `HtmlRenderer.render(resume: Resume): Promise<string>`
- `PdfExporter.export(html: string, outputPath: string): Promise<void>`

## Configuration Management
- **Environment Variables**: API keys, configuration settings
- **External Files**: Prompt templates, theme configurations
- **Runtime Options**: CLI arguments for input/output paths

## Error Handling Strategy
- **Domain Errors**: Business rule violations
- **Infrastructure Errors**: File I/O, API failures
- **Validation Errors**: Invalid input data
- **Graceful Degradation**: Continue processing when possible

## Future Extension Points
1. **UI Layer**: Web interface for resume editing
2. **Cover Letter Generation**: Additional AI-powered content
3. **Multiple Themes**: Theme selection and customization
4. **Cloud Storage**: Remote file storage and sharing
5. **Collaboration**: Multi-user editing and versioning