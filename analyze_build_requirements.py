#!/usr/bin/env python3
"""
Analyze all projects to determine their build requirements and dependencies.
"""

import json
import re
from pathlib import Path
from typing import Dict, List, Set
from collections import defaultdict

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

def detect_build_system(project_path: Path) -> Dict:
    """Detect the build system and package manager used."""
    result = {
        'type': 'unknown',
        'package_manager': None,
        'build_files': [],
        'env_files': [],
        'python_version': None,
        'node_version': None,
        'dependencies': {
            'python': [],
            'node': [],
            'system': []
        },
        'env_vars': set(),
        'build_commands': []
    }
    
    # Check for Python projects
    python_files = list(project_path.rglob('requirements.txt'))
    python_files.extend(list(project_path.rglob('pyproject.toml')))
    python_files.extend(list(project_path.rglob('setup.py')))
    python_files.extend(list(project_path.rglob('Pipfile')))
    
    if python_files:
        result['type'] = 'python'
        result['build_files'].extend([str(f.relative_to(project_path)) for f in python_files[:5]])
        
        # Check for uv, pip, poetry, pipenv
        if any('pyproject.toml' in str(f) for f in python_files):
            result['package_manager'] = 'poetry'  # or uv
        elif any('Pipfile' in str(f) for f in python_files):
            result['package_manager'] = 'pipenv'
        else:
            result['package_manager'] = 'pip'
        
        # Read requirements if available
        for req_file in python_files[:3]:
            try:
                content = req_file.read_text(encoding='utf-8', errors='ignore')
                # Extract package names
                for line in content.split('\n'):
                    line = line.strip()
                    if line and not line.startswith('#'):
                        # Remove version specifiers
                        pkg = re.sub(r'[<>=!].*', '', line.split(';')[0].strip())
                        if pkg and not pkg.startswith('-'):
                            result['dependencies']['python'].append(pkg)
            except:
                pass
    
    # Check for Node.js projects
    node_files = list(project_path.rglob('package.json'))
    
    if node_files:
        if result['type'] == 'python':
            result['type'] = 'hybrid'
        else:
            result['type'] = 'node'
        
        result['build_files'].extend([str(f.relative_to(project_path)) for f in node_files[:5]])
        
        # Check package manager
        if (project_path / 'pnpm-lock.yaml').exists() or (project_path / 'pnpm-lock.json').exists():
            result['package_manager'] = 'pnpm'
        elif (project_path / 'yarn.lock').exists():
            result['package_manager'] = 'yarn'
        elif (project_path / 'bun.lockb').exists() or (project_path / 'bun.lock').exists():
            result['package_manager'] = 'bun'
        else:
            result['package_manager'] = 'npm'
        
        # Read package.json
        for pkg_file in node_files[:1]:
            try:
                import json as json_lib
                content = pkg_file.read_text(encoding='utf-8', errors='ignore')
                pkg_data = json_lib.loads(content)
                
                # Get dependencies
                deps = pkg_data.get('dependencies', {})
                dev_deps = pkg_data.get('devDependencies', {})
                result['dependencies']['node'].extend(list(deps.keys())[:20])
                result['dependencies']['node'].extend(list(dev_deps.keys())[:20])
                
                # Get scripts
                scripts = pkg_data.get('scripts', {})
                if 'build' in scripts:
                    result['build_commands'].append(f"npm run build")
                if 'dev' in scripts or 'start' in scripts:
                    result['build_commands'].append(f"npm run dev")
            except:
                pass
    
    # Check for environment files
    env_files = list(project_path.rglob('.env*'))
    env_files.extend(list(project_path.rglob('*.env')))
    
    for env_file in env_files[:5]:
        if '.example' in str(env_file) or '.template' in str(env_file):
            continue
        try:
            content = env_file.read_text(encoding='utf-8', errors='ignore')
            # Extract env var names
            for line in content.split('\n'):
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    var_name = line.split('=')[0].strip()
                    if var_name:
                        result['env_vars'].add(var_name)
        except:
            pass
    
    # Check for Docker
    if (project_path / 'Dockerfile').exists() or (project_path / 'docker-compose.yml').exists():
        result['dependencies']['system'].append('docker')
    
    return result

def analyze_project(repo_data: Dict, base_dir: Path) -> Dict:
    """Analyze build requirements for a single project."""
    path_str = repo_data.get('path', '')
    base_url = repo_data.get('base_url', '')
    researched_commit_url = repo_data.get('researched_commit', '')
    
    repo_name = get_repo_name_from_url(base_url)
    researched_sha = extract_commit_sha(researched_commit_url)
    
    if not path_str or path_str.strip() == '':
        path_str = f"Research Data/{repo_name}"
    
    project_path = base_dir / path_str
    
    result = {
        'path': path_str,
        'base_url': base_url,
        'path_exists': project_path.exists(),
        'build_info': {}
    }
    
    if not project_path.exists():
        return result
    
    # Find directory for researched commit
    researched_dir = find_project_directory(project_path, repo_name, researched_sha)
    if str(researched_dir) == str(base_dir):
        researched_dir = project_path
    
    if researched_dir and str(researched_dir) != str(base_dir):
        result['build_info'] = detect_build_system(researched_dir)
        # Convert set to list for JSON
        result['build_info']['env_vars'] = list(result['build_info']['env_vars'])
    
    return result

def main():
    # Load repository history
    with open('repository_history_reduced.json', 'r') as f:
        data = json.load(f)
    
    base_dir = Path('/Users/jsisson/Research')
    results = []
    
    print("Analyzing build requirements...")
    for i, repo in enumerate(data['repositories'], 1):
        path_str = repo.get('path', '')
        if not path_str:
            repo_name = get_repo_name_from_url(repo.get('base_url', ''))
            path_str = f"Research Data/{repo_name}" if repo_name else 'unknown'
        print(f"Processing {i}/{len(data['repositories'])}: {path_str}")
        result = analyze_project(repo, base_dir)
        results.append(result)
    
    # Aggregate statistics
    stats = {
        'total_projects': len(results),
        'by_type': defaultdict(int),
        'by_package_manager': defaultdict(int),
        'common_env_vars': defaultdict(int),
        'common_dependencies': defaultdict(int)
    }
    
    for result in results:
        build_info = result.get('build_info', {})
        if build_info:
            stats['by_type'][build_info.get('type', 'unknown')] += 1
            if build_info.get('package_manager'):
                stats['by_package_manager'][build_info['package_manager']] += 1
            
            for env_var in build_info.get('env_vars', []):
                stats['common_env_vars'][env_var] += 1
            
            for deps in build_info.get('dependencies', {}).values():
                for dep in deps:
                    stats['common_dependencies'][dep] += 1
    
    # Save results
    output = {
        'statistics': {
            'by_type': dict(stats['by_type']),
            'by_package_manager': dict(stats['by_package_manager']),
            'top_env_vars': dict(sorted(stats['common_env_vars'].items(), 
                                        key=lambda x: x[1], reverse=True)[:30]),
            'top_dependencies': dict(sorted(stats['common_dependencies'].items(), 
                                          key=lambda x: x[1], reverse=True)[:50])
        },
        'projects': results
    }
    
    with open('build_requirements.json', 'w') as f:
        json.dump(output, f, indent=2)
    
    print("\n" + "="*80)
    print("BUILD REQUIREMENTS SUMMARY")
    print("="*80)
    print(f"\nTotal projects: {stats['total_projects']}")
    print(f"\nProject types:")
    for ptype, count in sorted(stats['by_type'].items(), key=lambda x: x[1], reverse=True):
        print(f"  {ptype}: {count}")
    
    print(f"\nPackage managers:")
    for pm, count in sorted(stats['by_package_manager'].items(), key=lambda x: x[1], reverse=True):
        print(f"  {pm}: {count}")
    
    print(f"\nTop 10 environment variables:")
    for var, count in list(stats['common_env_vars'].items())[:10]:
        print(f"  {var}: {count} projects")
    
    print(f"\n\nResults saved to build_requirements.json")

if __name__ == '__main__':
    main()
