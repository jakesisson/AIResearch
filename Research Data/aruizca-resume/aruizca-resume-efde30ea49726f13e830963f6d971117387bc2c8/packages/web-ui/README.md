# Cover Letter Generator Web UI

A React-based web application for generating personalized cover letters using AI. Built with React 18, TypeScript, Vite, and Chakra UI.

## Features

- **JSON Resume Upload**: Drag-and-drop or click to upload JSON Resume files
- **Job URL Input**: Enter job posting URLs for analysis
- **Customizable Parameters**: Set word count and additional considerations
- **Live Preview**: Real-time HTML preview of generated cover letters
- **Export Options**: Copy to clipboard and PDF download (coming soon)
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## Tech Stack

- **React 18** with TypeScript
- **Vite** for fast development and building
- **Chakra UI v3** for modern, accessible UI components
- **Emotion** for CSS-in-JS styling

## Development

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm

### Getting Started

```bash
# Install dependencies (from root)
pnpm install

# Start development server
cd packages/web-ui
pnpm dev
```

The development server will start at `http://localhost:3000`.

### Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm preview` - Preview production build
- `pnpm test` - Run tests

## Architecture

The web UI follows a clean component-based architecture:

- **App.tsx** - Main application component with state management
- **CoverLetterForm.tsx** - Input form with file upload and form validation
- **CoverLetterDisplay.tsx** - Preview and export functionality
- **provider.tsx** - Chakra UI theme and provider setup

## Integration

This package integrates with the `@aruizca-resume/core` package for:
- Cover letter generation logic
- PDF export functionality
- Resume parsing and validation

## Roadmap

### Iteration 1 ✅ (Current)
- [x] Basic UI scaffold with Chakra UI
- [x] File upload and form inputs
- [x] Mock cover letter generation
- [x] Static HTML preview

### Iteration 2 (Next)
- [ ] Backend integration with core package
- [ ] Real cover letter generation
- [ ] PDF export functionality

### Iteration 3 (Future)
- [ ] Real-time parameter adjustments
- [ ] Cover letter refinement
- [ ] Enhanced customization options
