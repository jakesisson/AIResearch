# Resume Generation Services

This module provides a modular architecture for generating resumes from LinkedIn export data.

## Services Overview

### 🎯 `ResumeGenerator` - Core JSON Generation
**Single Responsibility**: Generate JSON Resume from LinkedIn export file

```typescript
import { ResumeGenerator } from './service';

const generator = new ResumeGenerator();
const result = await generator.generateFromFile('/path/to/linkedin-export.zip', forceRefresh);

if (result.success) {
  console.log('JSON Resume:', result.resume);
  console.log('Performance:', result.performance);
}
```

**Features:**
- ✅ Focused on JSON Resume generation only
- ✅ Returns structured result with error handling
- ✅ Performance metrics included
- ✅ Validation against JSON Resume schema
- ✅ Reusable for APIs, web apps, and CLI tools

### 📤 `ResumeExportService` - Format Transformation
**Single Responsibility**: Export JSON Resume to various formats

```typescript
import { ResumeExportService } from './service';

const exporter = new ResumeExportService();
const result = await exporter.exportResume(jsonResume, {
  outputDir: './output',
  filename: 'my-resume',
  formats: ['json', 'html', 'pdf'] // Choose any combination
});
```

**Features:**
- ✅ Export to JSON, HTML, and/or PDF
- ✅ Configurable output directory and filename
- ✅ Selective format export (e.g., PDF only)
- ✅ Performance tracking per format
- ✅ Independent of resume generation

### 🔄 `LegacyResumeService` - Backward Compatibility
**Purpose**: Maintains API compatibility with old code

```typescript
import { LegacyResumeService } from './service';

const service = new LegacyResumeService();
const { jsonPath, htmlPath, pdfPath } = await service.run(exportPath, outputDir, forceRefresh);
```

**Note**: Marked as deprecated. Use the modular services for new code.

## Architecture Benefits

### 🏗️ **Modular Design**
- **Separation of Concerns**: Generation vs. Export
- **Single Responsibility**: Each service has one job
- **Reusability**: Use services independently

### 🔧 **Flexibility**
- **API-First**: Perfect for web APIs (JSON only)
- **Selective Export**: Choose specific formats
- **Custom Workflows**: Compose services as needed

### 🧪 **Testability**
- **Isolated Logic**: Test generation and export separately
- **Mocking**: Easy to mock individual services
- **Error Handling**: Clear error boundaries

### ⚡ **Performance**
- **Optional Export**: Skip file I/O for APIs
- **Selective Formats**: Only generate what you need
- **Caching**: Cache JSON, export multiple formats

## Migration Guide

### Old Way (Monolithic)
```typescript
// ❌ Old: Does everything in one service
const generator = new ResumeGenerator();
const { jsonPath, htmlPath, pdfPath } = await generator.run(path, outputDir);
```

### New Way (Modular)
```typescript
// ✅ New: Separate concerns
const generator = new ResumeGenerator();
const exporter = new ResumeExportService();

// 1. Generate JSON
const result = await generator.generateFromFile(path);

// 2. Export as needed
if (result.success) {
  await exporter.exportResume(result.resume, {
    outputDir,
    formats: ['html', 'pdf'] // Only what you need
  });
}
```

### For Web APIs
```typescript
// Perfect for REST APIs - no file I/O
const generator = new ResumeGenerator();
const result = await generator.generateFromFile(uploadedFile);

return result.success ? result.resume : { error: result.error };
```

### For Custom Workflows
```typescript
// Generate once, export multiple ways
const result = await generator.generateFromFile(path);

if (result.success) {
  // Export for web
  await exporter.exportResume(result.resume, {
    outputDir: './web',
    formats: ['html']
  });
  
  // Export for print
  await exporter.exportResume(result.resume, {
    outputDir: './print',
    formats: ['pdf']
  });
  
  // Save to database
  await saveToDatabase(result.resume);
}
```

## Examples

See `examples/example-usage.ts` for complete examples of:
- Modular service usage
- API endpoint implementation
- Web app integration
- Custom export workflows
