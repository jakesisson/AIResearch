#!/usr/bin/env python3
"""
Analyze projects from repository_history_reduced.json:
- Check if paths exist
- Count graph nodes in researched_commit and prior_commit versions
- Extract one-line summary from README
"""

import json
import re
import os
from pathlib import Path
from typing import Dict, List, Optional, Tuple

def extract_commit_sha(url: str) -> str:
    """Extract commit SHA from URL."""
    # URL format: https://github.com/user/repo/tree/COMMIT_SHA
    parts = url.split('/')
    if len(parts) >= 7 and parts[-2] == 'tree':
        return parts[-1]
    return ''

def find_project_directory(base_path: Path, repo_name: str, commit_sha: str) -> Optional[Path]:
    """Find the project directory for a given commit."""
    # Try different patterns
    patterns = [
        f"{repo_name}-{commit_sha}",
        f"{repo_name}-{commit_sha[:12]}",  # Short SHA
        commit_sha,
        commit_sha[:12],
    ]
    
    for pattern in patterns:
        candidate = base_path / pattern
        if candidate.exists() and candidate.is_dir():
            return candidate
    
    # If no match, check if base_path itself contains the project
    if base_path.exists():
        # Check if there are subdirectories with commit SHAs
        for item in base_path.iterdir():
            if item.is_dir() and commit_sha in item.name:
                return item
    
    return None

def count_graph_nodes(project_path: Path) -> int:
    """Count graph nodes in a project by searching for StateGraph node definitions."""
    nodes = set()  # Use set to avoid duplicates
    
    # More specific patterns for LangGraph/StateGraph
    patterns = [
        r'\.add_node\s*\(\s*["\']([^"\']+)["\']',  # .add_node("node_name", ...)
        r'workflow\.add_node\s*\(\s*["\']([^"\']+)["\']',  # workflow.add_node("node_name", ...)
        r'graph\.add_node\s*\(\s*["\']([^"\']+)["\']',  # graph.add_node("node_name", ...)
        r'StateGraph\.from_nodes\s*\(\s*\[([^\]]+)\]',  # StateGraph.from_nodes([...])
    ]
    
    # Search Python files
    for py_file in project_path.rglob('*.py'):
        try:
            # Skip very large files and common non-code directories
            if 'venv' in str(py_file) or '__pycache__' in str(py_file):
                continue
            if py_file.stat().st_size > 1000000:  # Skip files > 1MB
                continue
                
            content = py_file.read_text(encoding='utf-8', errors='ignore')
            
            # Pattern 1-3: .add_node("name", ...)
            for pattern in patterns[:3]:
                for match in re.finditer(pattern, content, re.MULTILINE):
                    node_name = match.group(1)
                    if node_name and len(node_name) < 100:  # Reasonable node name length
                        nodes.add(node_name)
            
            # Pattern 4: from_nodes([...])
            for match in re.finditer(patterns[3], content, re.MULTILINE):
                nodes_list = match.group(1)
                # Extract individual node names from the list
                for node_match in re.finditer(r'["\']([^"\']+)["\']', nodes_list):
                    node_name = node_match.group(1)
                    if node_name and len(node_name) < 100:
                        nodes.add(node_name)
        except Exception:
            continue
    
    # Also search TypeScript/JavaScript files
    for js_file in project_path.rglob('*.{ts,tsx,js,jsx}'):
        try:
            if 'node_modules' in str(js_file) or '.next' in str(js_file):
                continue
            if js_file.stat().st_size > 1000000:
                continue
                
            content = js_file.read_text(encoding='utf-8', errors='ignore')
            
            for pattern in patterns[:3]:
                for match in re.finditer(pattern, content, re.MULTILINE):
                    node_name = match.group(1)
                    if node_name and len(node_name) < 100:
                        nodes.add(node_name)
        except Exception:
            continue
    
    return len(nodes)

def find_readme(project_path: Path) -> Optional[Path]:
    """Find README file in project."""
    readme_patterns = ['README.md', 'README.txt', 'README.rst', 'readme.md', 'Readme.md']
    
    # Check root first
    for pattern in readme_patterns:
        readme = project_path / pattern
        if readme.exists() and readme.is_file():
            return readme
    
    # Check one level deep
    for subdir in project_path.iterdir():
        if subdir.is_dir():
            for pattern in readme_patterns:
                readme = subdir / pattern
                if readme.exists() and readme.is_file():
                    return readme
    
    return None

def extract_summary(readme_path: Path) -> str:
    """Extract one-line summary from README."""
    try:
        content = readme_path.read_text(encoding='utf-8', errors='ignore')
        lines = content.split('\n')
        
        # Look for first non-empty line that's not a header
        for line in lines[:20]:  # Check first 20 lines
            line = line.strip()
            if line and not line.startswith('#') and len(line) > 20:
                # Remove markdown formatting
                line = re.sub(r'^#+\s*', '', line)
                line = re.sub(r'\*\*([^*]+)\*\*', r'\1', line)
                line = re.sub(r'\*([^*]+)\*', r'\1', line)
                if len(line) > 20 and len(line) < 200:
                    return line
        
        # Fallback: first substantial line
        for line in lines:
            line = line.strip()
            if line and len(line) > 30:
                line = re.sub(r'^#+\s*', '', line)
                return line[:150]  # Limit length
        
        return "No description found"
    except Exception as e:
        return f"Error reading README: {str(e)}"

def get_repo_name_from_url(url: str) -> str:
    """Extract repository name from URL."""
    # URL format: https://github.com/user/repo/tree/...
    parts = url.split('/')
    if len(parts) >= 5:
        return parts[4]  # repo name
    return ''

def analyze_project(repo_data: Dict, base_dir: Path) -> Dict:
    """Analyze a single project."""
    path_str = repo_data.get('path', '')
    base_url = repo_data.get('base_url', '')
    researched_commit_url = repo_data.get('researched_commit', '')
    prior_commit_url = repo_data.get('prior_commit', '')
    
    repo_name = get_repo_name_from_url(base_url)
    researched_sha = extract_commit_sha(researched_commit_url)
    prior_sha = extract_commit_sha(prior_commit_url)
    
    # Handle empty path
    if not path_str or path_str.strip() == '':
        # Try to construct path from repo name
        path_str = f"Research Data/{repo_name}"
    
    project_path = base_dir / path_str
    
    result = {
        'path': path_str,
        'base_url': base_url,
        'path_exists': project_path.exists(),
        'researched_commit_nodes': 0,
        'prior_commit_nodes': 0,
        'summary': 'Not found',
        'researched_commit_path': None,
        'prior_commit_path': None,
    }
    
    if not project_path.exists():
        return result
    
    # Find directories for each commit
    researched_dir = find_project_directory(project_path, repo_name, researched_sha)
    prior_dir = find_project_directory(project_path, repo_name, prior_sha)
    
    # Only use project_path as fallback if it's not the base research directory
    if not researched_dir and str(project_path) != str(base_dir):
        researched_dir = project_path
    if not prior_dir and str(project_path) != str(base_dir):
        prior_dir = project_path
    
    result['researched_commit_path'] = str(researched_dir) if researched_dir else None
    result['prior_commit_path'] = str(prior_dir) if prior_dir else None
    
    # Count nodes only if we have valid directories (not the base directory)
    if researched_dir and str(researched_dir) != str(base_dir):
        result['researched_commit_nodes'] = count_graph_nodes(researched_dir)
    if prior_dir and str(prior_dir) != str(base_dir):
        result['prior_commit_nodes'] = count_graph_nodes(prior_dir)
    
    # Find and read README
    readme = find_readme(project_path)
    if not readme and researched_dir and str(researched_dir) != str(base_dir):
        readme = find_readme(researched_dir)
    if not readme and prior_dir and str(prior_dir) != str(base_dir):
        readme = find_readme(prior_dir)
    
    if readme:
        result['summary'] = extract_summary(readme)
    
    return result

def main():
    # Load repository history
    with open('repository_history_reduced.json', 'r') as f:
        data = json.load(f)
    
    base_dir = Path('/Users/jsisson/Research')
    results = []
    
    print("Analyzing projects...")
    for i, repo in enumerate(data['repositories'], 1):
        path_str = repo.get('path', '')
        if not path_str:
            # Try to get repo name from base_url
            repo_name = get_repo_name_from_url(repo.get('base_url', ''))
            path_str = f"Research Data/{repo_name}" if repo_name else 'unknown'
        print(f"Processing {i}/{len(data['repositories'])}: {path_str}")
        result = analyze_project(repo, base_dir)
        results.append(result)
    
    # Save results
    output = {
        'total_projects': len(results),
        'projects': results
    }
    
    with open('project_analysis.json', 'w') as f:
        json.dump(output, f, indent=2)
    
    # Print summary
    print("\n" + "="*80)
    print("ANALYSIS SUMMARY")
    print("="*80)
    for result in results:
        print(f"\n{result['path']}")
        print(f"  Path exists: {result['path_exists']}")
        print(f"  Researched commit nodes: {result['researched_commit_nodes']}")
        print(f"  Prior commit nodes: {result['prior_commit_nodes']}")
        print(f"  Summary: {result['summary'][:100]}...")
    
    print(f"\n\nResults saved to project_analysis.json")

if __name__ == '__main__':
    main()
