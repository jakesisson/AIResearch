# Dependency Installation Guide

## Quick Start

The script `install_dependencies.py` will automatically:
1. Install missing build tools (turbo, yarn, Python build module)
2. Install dependencies for all projects
3. Report progress and results

## Usage

### Dry Run (See What Would Happen)
```bash
python3 install_dependencies.py --dry-run
```

### Full Installation
```bash
# Install build tools + all dependencies
python3 install_dependencies.py

# Skip build tools installation (if already installed)
python3 install_dependencies.py --skip-tools

# Only Python projects
python3 install_dependencies.py --python-only

# Only Node.js projects
python3 install_dependencies.py --node-only
```

## What Gets Installed

### Build Tools (Global)
- `build` - Python build module
- `turbo` - Turborepo build system
- `yarn` - Yarn package manager

### Project Dependencies
- **Python projects**: Installs from `requirements.txt`, `pyproject.toml`, or `setup.py`
- **Node.js projects**: Installs using `npm`, `yarn`, `pnpm`, or `bun` based on lock files
- **Hybrid projects**: Installs both Python and Node.js dependencies

## Expected Results

Based on the dry run:
- ~20 Python projects will have dependencies installed
- ~15 Node.js projects will have dependencies installed
- ~5 Hybrid projects will have both installed
- ~5 projects have no dependency files (may be libraries or already built)

## Time Estimate

- Build tools: ~2-5 minutes
- Python projects: ~1-3 minutes each (can be slow with large requirements)
- Node.js projects: ~2-5 minutes each (npm install can be slow)

**Total estimated time: 1-2 hours** for all projects

## After Installation

Once dependencies are installed, you can:
1. Re-run build verification: `python3 verify_builds.py`
2. Test individual projects
3. Run the projects with proper environment variables

## Troubleshooting

### Installation Fails
- Check internet connection
- Some packages may need system dependencies
- Some projects may have conflicting requirements

### Timeout Issues
- Increase timeout: `--timeout 1200` (20 minutes per project)
- Install projects in batches

### Missing Tools
- Install manually: `npm install -g turbo yarn`
- Install Python build: `pip3 install build`
