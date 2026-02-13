#!/usr/bin/env python3
"""
Verify that all projects can build successfully.
This script attempts to build each project and reports results.
"""

import json
import subprocess
import sys
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

def detect_build_command(project_path: Path) -> Optional[List[str]]:
    """Detect the appropriate build command for a project."""
    # Check for package.json
    package_json = project_path / 'package.json'
    if package_json.exists():
        try:
            import json as json_lib
            pkg_data = json_lib.loads(package_json.read_text())
            scripts = pkg_data.get('scripts', {})
            
            if 'build' in scripts:
                # Detect package manager - check what's available
                import shutil
                if (project_path / 'pnpm-lock.yaml').exists() and shutil.which('pnpm'):
                    return ['pnpm', 'run', 'build']
                elif (project_path / 'yarn.lock').exists() and shutil.which('yarn'):
                    return ['yarn', 'build']
                elif ((project_path / 'bun.lockb').exists() or (project_path / 'bun.lock').exists()) and shutil.which('bun'):
                    return ['bun', 'run', 'build']
                elif shutil.which('npm'):
                    return ['npm', 'run', 'build']
                else:
                    return None  # No package manager available
        except:
            pass
    
    # Check for Python projects
    if (project_path / 'pyproject.toml').exists():
        return ['python3', '-m', 'build']
    elif (project_path / 'setup.py').exists():
        return ['python3', 'setup.py', 'build']
    elif (project_path / 'requirements.txt').exists():
        # Just verify dependencies can be installed (skip actual install for speed)
        # Return None to skip - we'll handle this differently
        return None
    
    # Check for Makefile
    if (project_path / 'Makefile').exists():
        return ['make', 'build']
    
    return None

def verify_build(project_path: Path, timeout: int = 300, skip_install: bool = False) -> Dict:
    """Verify that a project can build."""
    import os
    import shutil
    
    result = {
        'path': str(project_path),
        'success': False,
        'build_command': None,
        'output': '',
        'error': None,
        'duration': 0,
        'skipped': False
    }
    
    if not project_path.exists():
        result['error'] = 'Path does not exist'
        return result
    
    build_cmd = detect_build_command(project_path)
    if not build_cmd:
        # For Python projects with requirements.txt, try to at least verify structure
        if (project_path / 'requirements.txt').exists():
            result['skipped'] = True
            result['error'] = 'Python project - dependencies check skipped (use --install to install)'
            return result
        result['error'] = 'No build command detected'
        return result
    
    # Check if required tools are available
    if build_cmd[0] not in ['make'] and not shutil.which(build_cmd[0]):
        result['error'] = f'Required tool not found: {build_cmd[0]}'
        return result
    
    result['build_command'] = ' '.join(build_cmd)
    
    start_time = time.time()
    
    try:
        # Run build command
        process = subprocess.run(
            build_cmd,
            cwd=project_path,
            capture_output=True,
            text=True,
            timeout=timeout,
            env={**dict(os.environ), 'NODE_ENV': 'production', 'PYTHON_ENV': 'production'}
        )
        
        result['duration'] = time.time() - start_time
        result['output'] = process.stdout + process.stderr
        
        if process.returncode == 0:
            result['success'] = True
        else:
            result['error'] = f'Build failed with exit code {process.returncode}'
            
    except subprocess.TimeoutExpired:
        result['error'] = f'Build timed out after {timeout} seconds'
        result['duration'] = timeout
    except Exception as e:
        result['error'] = str(e)
        result['duration'] = time.time() - start_time
    
    return result

def main():
    import argparse
    
    parser = argparse.ArgumentParser(description='Verify builds for all projects')
    parser.add_argument('--timeout', type=int, default=300, 
                       help='Build timeout in seconds (default: 300)')
    parser.add_argument('--skip-install', action='store_true',
                       help='Skip dependency installation step')
    parser.add_argument('--dry-run', action='store_true',
                       help='Show what would be built without actually building')
    args = parser.parse_args()
    
    # Load repository history
    with open('repository_history_reduced.json', 'r') as f:
        data = json.load(f)
    
    # Load build requirements
    build_reqs_path = Path('build_requirements.json')
    build_info = {}
    if build_reqs_path.exists():
        with open(build_reqs_path, 'r') as f:
            build_data = json.load(f)
            for proj in build_data.get('projects', []):
                if proj.get('path'):
                    build_info[proj['path']] = proj.get('build_info', {})
    
    base_dir = Path('/Users/jsisson/Research')
    results = []
    
    print("Verifying builds for all projects...")
    print(f"Timeout: {args.timeout}s per project")
    if args.dry_run:
        print("DRY RUN MODE - No actual builds will be performed\n")
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
            print(f"  Path: {researched_dir}")
            
            if args.dry_run:
                build_cmd = detect_build_command(researched_dir)
                if build_cmd:
                    print(f"  Would run: {' '.join(build_cmd)}")
                else:
                    print(f"  No build command detected")
                continue
            
            result = verify_build(researched_dir, args.timeout, args.skip_install)
            results.append(result)
            
            if result['success']:
                print(f"  ✓ Build successful ({result['duration']:.1f}s)")
            else:
                print(f"  ✗ Build failed: {result.get('error', 'Unknown error')}")
                if result.get('output'):
                    # Show last few lines of output
                    output_lines = result['output'].split('\n')
                    print(f"  Last output lines:")
                    for line in output_lines[-5:]:
                        if line.strip():
                            print(f"    {line}")
    
    # Summary
    if not args.dry_run:
        successful = sum(1 for r in results if r['success'])
        failed = len(results) - successful
        
        print(f"\n{'='*80}")
        print(f"BUILD VERIFICATION SUMMARY")
        print(f"{'='*80}")
        print(f"Total projects: {len(results)}")
        print(f"Successful builds: {successful}")
        print(f"Failed builds: {failed}")
        print(f"Success rate: {successful/len(results)*100:.1f}%")
        
        if failed > 0:
            print(f"\nFailed projects:")
            for r in results:
                if not r['success']:
                    print(f"  - {r['path']}: {r.get('error', 'Unknown error')}")
        
        # Save results
        with open('build_verification_results.json', 'w') as f:
            json.dump({
                'total': len(results),
                'successful': successful,
                'failed': failed,
                'results': results
            }, f, indent=2)
        
        print(f"\nDetailed results saved to build_verification_results.json")

if __name__ == '__main__':
    main()
