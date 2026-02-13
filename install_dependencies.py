#!/usr/bin/env python3
"""
Automatically install dependencies for all projects.
This script:
1. Installs missing build tools (turbo, yarn, build module)
2. Installs dependencies for each project based on its type
3. Reports progress and any failures
"""

import json
import subprocess
import sys
import shutil
from pathlib import Path
from typing import Dict, List, Optional
import time

def extract_commit_sha(url: str) -> str:
    """Extract commit SHA from URL."""
    parts = url.split('/')
    if len(parts) >= 7 and parts[-2] == 'tree':
        return parts[-1]
    return ''

def get_repo_name_from_url(url: str) -> str:
    """Extract repository name from URL."""
    parts = url.split('/')
    if len(parts) >= 5:
        return parts[4]
    return ''

def find_project_directory(base_path: Path, repo_name: str, commit_sha: str) -> Path:
    """Find the project directory for a given commit."""
    patterns = [
        f"{repo_name}-{commit_sha}",
        f"{repo_name}-{commit_sha[:12]}",
        commit_sha,
        commit_sha[:12],
    ]
    
    for pattern in patterns:
        candidate = base_path / pattern
        if candidate.exists() and candidate.is_dir():
            return candidate
    
    if base_path.exists():
        for item in base_path.iterdir():
            if item.is_dir() and commit_sha in item.name:
                return item
    
    return base_path

def install_build_tools() -> Dict:
    """Install missing build tools globally."""
    results = {
        'tools_installed': [],
        'tools_failed': [],
        'tools_skipped': []
    }
    
    print("Checking and installing build tools...")
    print("="*80)
    
    # Check Python build module
    try:
        import build
        print("✓ Python 'build' module already installed")
        results['tools_skipped'].append('build')
    except ImportError:
        print("Installing Python 'build' module...")
        try:
            subprocess.run([sys.executable, '-m', 'pip', 'install', 'build'], 
                         check=True, capture_output=True)
            print("✓ Installed Python 'build' module")
            results['tools_installed'].append('build')
        except subprocess.CalledProcessError as e:
            print(f"✗ Failed to install 'build': {e}")
            results['tools_failed'].append('build')
    
    # Check turbo
    if not shutil.which('turbo'):
        print("Installing turbo...")
        try:
            subprocess.run(['npm', 'install', '-g', 'turbo'], 
                         check=True, capture_output=True, timeout=120)
            print("✓ Installed turbo")
            results['tools_installed'].append('turbo')
        except (subprocess.CalledProcessError, subprocess.TimeoutExpired, FileNotFoundError) as e:
            print(f"✗ Failed to install turbo: {e}")
            results['tools_failed'].append('turbo')
    else:
        print("✓ turbo already installed")
        results['tools_skipped'].append('turbo')
    
    # Check yarn
    if not shutil.which('yarn'):
        print("Installing yarn...")
        try:
            subprocess.run(['npm', 'install', '-g', 'yarn'], 
                         check=True, capture_output=True, timeout=120)
            print("✓ Installed yarn")
            results['tools_installed'].append('yarn')
        except (subprocess.CalledProcessError, subprocess.TimeoutExpired, FileNotFoundError) as e:
            print(f"✗ Failed to install yarn: {e}")
            results['tools_failed'].append('yarn')
    else:
        print("✓ yarn already installed")
        results['tools_skipped'].append('yarn')
    
    print()
    return results

def install_python_dependencies(project_path: Path) -> Dict:
    """Install Python dependencies for a project."""
    result = {
        'success': False,
        'method': None,
        'output': '',
        'error': None
    }
    
    # Check for different dependency files
    requirements_file = project_path / 'requirements.txt'
    pyproject_file = project_path / 'pyproject.toml'
    setup_file = project_path / 'setup.py'
    
    if requirements_file.exists():
        try:
            process = subprocess.run(
                [sys.executable, '-m', 'pip', 'install', '-r', str(requirements_file)],
                cwd=project_path,
                capture_output=True,
                text=True,
                timeout=300
            )
            result['output'] = process.stdout + process.stderr
            result['method'] = 'pip install -r requirements.txt'
            result['success'] = process.returncode == 0
            if not result['success']:
                result['error'] = f'Exit code {process.returncode}'
        except subprocess.TimeoutExpired:
            result['error'] = 'Installation timed out'
        except Exception as e:
            result['error'] = str(e)
    
    elif pyproject_file.exists():
        try:
            # Try pip install -e .
            process = subprocess.run(
                [sys.executable, '-m', 'pip', 'install', '-e', '.'],
                cwd=project_path,
                capture_output=True,
                text=True,
                timeout=300
            )
            result['output'] = process.stdout + process.stderr
            result['method'] = 'pip install -e .'
            result['success'] = process.returncode == 0
            if not result['success']:
                result['error'] = f'Exit code {process.returncode}'
        except subprocess.TimeoutExpired:
            result['error'] = 'Installation timed out'
        except Exception as e:
            result['error'] = str(e)
    
    elif setup_file.exists():
        try:
            process = subprocess.run(
                [sys.executable, 'setup.py', 'install'],
                cwd=project_path,
                capture_output=True,
                text=True,
                timeout=300
            )
            result['output'] = process.stdout + process.stderr
            result['method'] = 'python setup.py install'
            result['success'] = process.returncode == 0
            if not result['success']:
                result['error'] = f'Exit code {process.returncode}'
        except subprocess.TimeoutExpired:
            result['error'] = 'Installation timed out'
        except Exception as e:
            result['error'] = str(e)
    else:
        result['error'] = 'No Python dependency file found'
    
    return result

def install_node_dependencies(project_path: Path) -> Dict:
    """Install Node.js dependencies for a project."""
    result = {
        'success': False,
        'method': None,
        'output': '',
        'error': None
    }
    
    package_json = project_path / 'package.json'
    if not package_json.exists():
        result['error'] = 'No package.json found'
        return result
    
    # Determine package manager
    if (project_path / 'pnpm-lock.yaml').exists() or (project_path / 'pnpm-lock.json').exists():
        if shutil.which('pnpm'):
            cmd = ['pnpm', 'install']
            result['method'] = 'pnpm install'
        else:
            result['error'] = 'pnpm not installed'
            return result
    elif (project_path / 'yarn.lock').exists():
        if shutil.which('yarn'):
            cmd = ['yarn', 'install']
            result['method'] = 'yarn install'
        else:
            result['error'] = 'yarn not installed'
            return result
    elif (project_path / 'bun.lockb').exists() or (project_path / 'bun.lock').exists():
        if shutil.which('bun'):
            cmd = ['bun', 'install']
            result['method'] = 'bun install'
        else:
            result['error'] = 'bun not installed'
            return result
    else:
        if shutil.which('npm'):
            cmd = ['npm', 'install']
            result['method'] = 'npm install'
        else:
            result['error'] = 'npm not installed'
            return result
    
    try:
        process = subprocess.run(
            cmd,
            cwd=project_path,
            capture_output=True,
            text=True,
            timeout=600  # 10 minutes for npm install
        )
        result['output'] = process.stdout + process.stderr
        result['success'] = process.returncode == 0
        if not result['success']:
            result['error'] = f'Exit code {process.returncode}'
    except subprocess.TimeoutExpired:
        result['error'] = 'Installation timed out'
    except Exception as e:
        result['error'] = str(e)
    
    return result

def install_project_dependencies(project_path: Path) -> Dict:
    """Install dependencies for a project (detects type automatically)."""
    result = {
        'path': str(project_path),
        'type': 'unknown',
        'python_result': None,
        'node_result': None,
        'success': False
    }
    
    if not project_path.exists():
        result['error'] = 'Path does not exist'
        return result
    
    # Check for Python project
    has_python = any((project_path / f).exists() for f in 
                     ['requirements.txt', 'pyproject.toml', 'setup.py', 'Pipfile'])
    
    # Check for Node.js project
    has_node = (project_path / 'package.json').exists()
    
    if has_python and has_node:
        result['type'] = 'hybrid'
        result['python_result'] = install_python_dependencies(project_path)
        result['node_result'] = install_node_dependencies(project_path)
        result['success'] = (
            (result['python_result'] and result['python_result']['success']) or
            (result['node_result'] and result['node_result']['success'])
        )
    elif has_python:
        result['type'] = 'python'
        result['python_result'] = install_python_dependencies(project_path)
        result['success'] = result['python_result']['success'] if result['python_result'] else False
    elif has_node:
        result['type'] = 'node'
        result['node_result'] = install_node_dependencies(project_path)
        result['success'] = result['node_result']['success'] if result['node_result'] else False
    else:
        result['error'] = 'No dependency files detected'
    
    return result

def main():
    import argparse
    
    parser = argparse.ArgumentParser(description='Install dependencies for all projects')
    parser.add_argument('--skip-tools', action='store_true',
                       help='Skip installing build tools')
    parser.add_argument('--python-only', action='store_true',
                       help='Only install Python dependencies')
    parser.add_argument('--node-only', action='store_true',
                       help='Only install Node.js dependencies')
    parser.add_argument('--timeout', type=int, default=600,
                       help='Timeout per project in seconds (default: 600)')
    parser.add_argument('--dry-run', action='store_true',
                       help='Show what would be installed without actually installing')
    args = parser.parse_args()
    
    # Install build tools first
    tools_result = {}
    if not args.skip_tools and not args.dry_run:
        tools_result = install_build_tools()
        print()
    elif not args.skip_tools and args.dry_run:
        print("DRY RUN: Would install build tools (turbo, yarn, build module)")
        print()
    
    # Load repository history
    with open('repository_history_reduced.json', 'r') as f:
        data = json.load(f)
    
    base_dir = Path('/Users/jsisson/Research')
    results = []
    
    print("Installing dependencies for all projects...")
    print("="*80)
    
    for i, repo in enumerate(data['repositories'], 1):
        path_str = repo.get('path', '')
        base_url = repo.get('base_url', '')
        researched_commit_url = repo.get('researched_commit', '')
        
        repo_name = get_repo_name_from_url(base_url)
        researched_sha = extract_commit_sha(researched_commit_url)
        
        if not path_str or path_str.strip() == '':
            path_str = f"Research Data/{repo_name}"
        
        project_path = base_dir / path_str
        
        if not project_path.exists():
            print(f"{i}/{len(data['repositories'])}: {path_str} - SKIP (path not found)")
            continue
        
        # Find directory for researched commit
        researched_dir = find_project_directory(project_path, repo_name, researched_sha)
        if str(researched_dir) == str(base_dir):
            researched_dir = project_path
        
        if researched_dir and str(researched_dir) != str(base_dir):
            print(f"\n{i}/{len(data['repositories'])}: {path_str}")
            print(f"  Path: {researched_dir.name}")
            
            if args.dry_run:
                # Just detect what would be installed
                has_python = any((researched_dir / f).exists() for f in 
                                ['requirements.txt', 'pyproject.toml', 'setup.py', 'Pipfile'])
                has_node = (researched_dir / 'package.json').exists()
                
                if has_python and has_node:
                    print(f"  Would install: Python + Node.js dependencies")
                elif has_python:
                    print(f"  Would install: Python dependencies")
                elif has_node:
                    print(f"  Would install: Node.js dependencies")
                else:
                    print(f"  No dependencies to install")
                continue
            
            result = install_project_dependencies(researched_dir)
            results.append(result)
            
            if result['success']:
                print(f"  ✓ Dependencies installed ({result['type']})")
                if result['python_result'] and result['python_result'].get('method'):
                    print(f"    Python: {result['python_result']['method']}")
                if result['node_result'] and result['node_result'].get('method'):
                    print(f"    Node: {result['node_result']['method']}")
            else:
                error_msg = result.get('error', 'Unknown error')
                if result['python_result'] and result['python_result'].get('error'):
                    error_msg = result['python_result']['error']
                elif result['node_result'] and result['node_result'].get('error'):
                    error_msg = result['node_result']['error']
                print(f"  ✗ Failed: {error_msg}")
    
    # Summary
    successful = sum(1 for r in results if r['success'])
    total = len(results)
    
    print(f"\n{'='*80}")
    print("INSTALLATION SUMMARY")
    print(f"{'='*80}")
    print(f"Total projects: {total}")
    print(f"Successful: {successful}")
    print(f"Failed: {total - successful}")
    print(f"Success rate: {successful/total*100:.1f}%")
    
    if not args.skip_tools:
        print(f"\nBuild tools:")
        print(f"  Installed: {len(tools_result.get('tools_installed', []))}")
        print(f"  Already present: {len(tools_result.get('tools_skipped', []))}")
        print(f"  Failed: {len(tools_result.get('tools_failed', []))}")
    
    # Save results
    output = {
        'tools_installation': tools_result,
        'total_projects': total,
        'successful': successful,
        'failed': total - successful,
        'results': results
    }
    
    with open('dependency_installation_results.json', 'w') as f:
        json.dump(output, f, indent=2)
    
    print(f"\nDetailed results saved to dependency_installation_results.json")
    
    if successful < total:
        print(f"\n⚠️  {total - successful} projects failed. Check the results file for details.")

if __name__ == '__main__':
    main()
