# GitHub Actions Workflows

This directory contains GitHub Actions workflows for automated testing, security scanning, and dependency management.

## Workflows

### 1. Test (`test.yml`)

**Triggers:**
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop` branches

**Jobs:**
- **test**: Runs unit tests on Node.js 18.x and 20.x
- **lint**: Checks TypeScript compilation and unused dependencies
- **build**: Builds the project and uploads artifacts

**Features:**
- Matrix testing across Node.js versions
- Automated test result uploads
- TypeScript compilation checks
- Build artifact generation

### 2. Security (`security.yml`)

**Triggers:**
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop` branches
- Weekly scheduled runs (Sundays at midnight)

**Jobs:**
- **security**: Runs security audits and vulnerability checks

**Features:**
- Automated security scanning
- Vulnerability reporting
- Weekly scheduled security checks

### 3. Dependencies (`dependencies.yml`)

**Triggers:**
- Weekly scheduled runs (Mondays at 2 AM)
- Manual workflow dispatch

**Jobs:**
- **check-dependencies**: Checks for outdated and unused dependencies

**Features:**
- Dependency update notifications
- Unused dependency detection
- Automated dependency reports

## Configuration

### Environment Variables

The workflows use the following environment variables:

- `OPENAI_API_KEY`: Used for testing (can be a dummy key for mocked tests)

### Secrets

The following secrets can be configured in your repository:

- `OPENAI_API_KEY`: OpenAI API key for testing (optional)

## Usage

### Manual Workflow Execution

You can manually trigger the dependencies workflow:

1. Go to the "Actions" tab in your GitHub repository
2. Select "Dependencies" workflow
3. Click "Run workflow"
4. Select the branch and click "Run workflow"

### Viewing Results

- **Test Results**: Available in the "Actions" tab under each workflow run
- **Artifacts**: Download test results, build artifacts, and security reports
- **Security Issues**: Check the security tab in your repository

## Troubleshooting

### Common Issues

1. **Tests failing**: Check the test logs for specific error messages
2. **Build failures**: Ensure all dependencies are properly installed
3. **Security vulnerabilities**: Review the security report and update dependencies

### Local Testing

You can run the same checks locally:

```bash
# Run tests
npm test

# Check TypeScript compilation
npx tsc --noEmit

# Check for unused dependencies
npx depcheck --ignores="@types/*,vitest"

# Run security audit
npm audit --audit-level moderate
```

## Contributing

When adding new workflows or modifying existing ones:

1. Test workflows locally using `act` (optional)
2. Ensure proper error handling and reporting
3. Update this README with any changes
4. Consider the impact on CI/CD performance 