# Test Resources

This directory contains test resources used for testing the resume and cover letter generation functionality.

## Files

- `test-job-posting.html` - Sample HTML job posting for testing cover letter generation

## Usage

The test resources can be used with the cover letter generation in test mode:

```bash
pnpm run cover-letter <resume-path> <job-url> --test-html packages/core/src/test/resources/test-job-posting.html
```

## Adding New Test Resources

When adding new test resources:
1. Place them in this directory
2. Update this README with a description
3. Consider adding them to `.gitignore` if they contain sensitive data 