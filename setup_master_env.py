#!/usr/bin/env python3
"""
Setup master environment for all projects.
This script:
1. Creates .env files in each project from master.env
2. Creates symlinks or copies master.env to each project
3. Ensures all projects can access the master environment
"""

import json
import shutil
from pathlib import Path
from typing import Dict, List

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

def setup_project_env(project_path: Path, master_env_path: Path, strategy: str = 'symlink') -> Dict:
    """Setup environment for a single project."""
    result = {
        'path': str(project_path),
        'success': False,
        'method': None,
        'error': None
    }
    
    if not project_path.exists():
        result['error'] = 'Path does not exist'
        return result
    
    # Target .env file in project
    target_env = project_path / '.env'
    target_master_env = project_path / '.env.master'
    
    try:
        if strategy == 'symlink':
            # Create symlink to master.env
            if target_master_env.exists():
                target_master_env.unlink()
            target_master_env.symlink_to(master_env_path.absolute())
            result['method'] = 'symlink'
            result['success'] = True
            
        elif strategy == 'copy':
            # Copy master.env to project
            shutil.copy2(master_env_path, target_master_env)
            result['method'] = 'copy'
            result['success'] = True
            
        elif strategy == 'merge':
            # Merge master.env with existing .env if it exists
            master_content = master_env_path.read_text()
            
            if target_env.exists():
                existing_content = target_env.read_text()
                # Append master env vars that don't exist
                existing_vars = set()
                for line in existing_content.split('\n'):
                    if '=' in line and not line.strip().startswith('#'):
                        var_name = line.split('=')[0].strip()
                        existing_vars.add(var_name)
                
                merged_content = existing_content + '\n\n# Master environment variables\n'
                for line in master_content.split('\n'):
                    if '=' in line and not line.strip().startswith('#'):
                        var_name = line.split('=')[0].strip()
                        if var_name not in existing_vars:
                            merged_content += line + '\n'
                
                target_env.write_text(merged_content)
            else:
                target_env.write_text(master_content)
            
            result['method'] = 'merge'
            result['success'] = True
        
        # Also create a .env file that sources master.env
        env_loader = f"""# Auto-generated file - sources master environment
# This file loads variables from .env.master
# To use: source .env or export $(cat .env.master | grep -v '^#' | xargs)

if [ -f .env.master ]; then
    set -a
    source .env.master
    set +a
fi
"""
        (project_path / '.env.loader.sh').write_text(env_loader)
        
    except Exception as e:
        result['error'] = str(e)
        result['success'] = False
    
    return result

def main():
    import argparse
    
    parser = argparse.ArgumentParser(description='Setup master environment for all projects')
    parser.add_argument('--strategy', choices=['symlink', 'copy', 'merge'], 
                       default='symlink', help='How to link master.env to projects')
    parser.add_argument('--master-env', default='master.env', 
                       help='Path to master environment file')
    args = parser.parse_args()
    
    # Load repository history
    with open('repository_history_reduced.json', 'r') as f:
        data = json.load(f)
    
    base_dir = Path('/Users/jsisson/Research')
    master_env_path = base_dir / args.master_env
    
    if not master_env_path.exists():
        print(f"Error: Master environment file not found: {master_env_path}")
        return
    
    print(f"Using master environment: {master_env_path}")
    print(f"Strategy: {args.strategy}\n")
    
    results = []
    
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
            print(f"{i}/{len(data['repositories'])}: {path_str}")
            result = setup_project_env(researched_dir, master_env_path, args.strategy)
            results.append(result)
            
            if result['success']:
                print(f"  ✓ Setup complete ({result['method']})")
            else:
                print(f"  ✗ Failed: {result.get('error', 'Unknown error')}")
    
    # Summary
    successful = sum(1 for r in results if r['success'])
    print(f"\n{'='*80}")
    print(f"SUMMARY: {successful}/{len(results)} projects configured successfully")
    print(f"{'='*80}")
    
    # Save results
    with open('env_setup_results.json', 'w') as f:
        json.dump({
            'total': len(results),
            'successful': successful,
            'failed': len(results) - successful,
            'strategy': args.strategy,
            'results': results
        }, f, indent=2)

if __name__ == '__main__':
    main()
