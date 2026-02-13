#!/usr/bin/env python3
"""
Verify if projects with 0 nodes actually use LangGraph or other graph frameworks.
"""

import json
import re
from pathlib import Path
from typing import Dict, List, Set

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
    
    # Check subdirectories
    if base_path.exists():
        for item in base_path.iterdir():
            if item.is_dir() and commit_sha in item.name:
                return item
    
    return base_path

def check_graph_usage(project_path: Path) -> Dict:
    """Check for various graph framework usage indicators."""
    results = {
        'langgraph_imports': set(),
        'langgraph_usage': False,
        'stategraph_usage': False,
        'langchain_agents': False,
        'other_graph_frameworks': set(),
        'graph_files': [],
        'sample_code': []
    }
    
    # Patterns to check
    langgraph_patterns = [
        (r'from\s+langgraph\s+import', 'langgraph import'),
        (r'import\s+langgraph', 'langgraph import'),
        (r'from\s+langgraph\.', 'langgraph module'),
        (r'StateGraph', 'StateGraph'),
        (r'langgraph\.', 'langgraph usage'),
    ]
    
    langchain_patterns = [
        (r'AgentExecutor', 'AgentExecutor'),
        (r'create_react_agent', 'create_react_agent'),
        (r'create_openai_functions_agent', 'create_openai_functions_agent'),
        (r'AgentType\.', 'AgentType'),
    ]
    
    other_frameworks = [
        (r'from\s+crewai\s+import', 'CrewAI'),
        (r'from\s+autogen\s+import', 'AutoGen'),
        (r'from\s+semantic_kernel\s+import', 'Semantic Kernel'),
        (r'from\s+llama_index\s+import', 'LlamaIndex'),
    ]
    
    # Search Python files
    for py_file in project_path.rglob('*.py'):
        try:
            # Skip common non-code directories
            if any(skip in str(py_file) for skip in ['venv', '__pycache__', '.git', 'node_modules', '.next']):
                continue
            if py_file.stat().st_size > 500000:  # Skip very large files
                continue
                
            content = py_file.read_text(encoding='utf-8', errors='ignore')
            
            # Check LangGraph patterns
            for pattern, label in langgraph_patterns:
                if re.search(pattern, content, re.IGNORECASE):
                    results['langgraph_usage'] = True
                    results['langgraph_imports'].add(label)
                    if 'StateGraph' in label:
                        results['stategraph_usage'] = True
                    if len(results['graph_files']) < 5:  # Keep first 5 examples
                        results['graph_files'].append(str(py_file.relative_to(project_path)))
                    # Extract a sample line
                    for line in content.split('\n')[:100]:  # Check first 100 lines
                        if re.search(pattern, line, re.IGNORECASE):
                            if len(results['sample_code']) < 3:
                                results['sample_code'].append(line.strip()[:150])
                            break
            
            # Check LangChain agents
            for pattern, label in langchain_patterns:
                if re.search(pattern, content, re.IGNORECASE):
                    results['langchain_agents'] = True
                    break
            
            # Check other frameworks
            for pattern, framework in other_frameworks:
                if re.search(pattern, content, re.IGNORECASE):
                    results['other_graph_frameworks'].add(framework)
        except Exception:
            continue
    
    # Search TypeScript/JavaScript files
    for js_file in project_path.rglob('*.{ts,tsx,js,jsx}'):
        try:
            if any(skip in str(js_file) for skip in ['node_modules', '.next', '.git']):
                continue
            if js_file.stat().st_size > 500000:
                continue
                
            content = js_file.read_text(encoding='utf-8', errors='ignore')
            
            # Check for LangGraph in JS/TS
            if re.search(r'langgraph|StateGraph', content, re.IGNORECASE):
                results['langgraph_usage'] = True
                results['langgraph_imports'].add('langgraph (JS/TS)')
                if len(results['graph_files']) < 5:
                    results['graph_files'].append(str(js_file.relative_to(project_path)))
        except Exception:
            continue
    
    # Check package.json / requirements.txt for dependencies
    for dep_file in [project_path / 'package.json', project_path / 'requirements.txt', 
                     project_path / 'pyproject.toml', project_path / 'Pipfile']:
        if dep_file.exists():
            try:
                content = dep_file.read_text(encoding='utf-8', errors='ignore')
                if 'langgraph' in content.lower():
                    results['langgraph_usage'] = True
                    results['langgraph_imports'].add('dependency')
            except Exception:
                continue
    
    return results

def verify_project(repo_data: Dict, base_dir: Path) -> Dict:
    """Verify graph usage for a single project."""
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
        'verification': {}
    }
    
    if not project_path.exists():
        return result
    
    # Find directory for researched commit
    researched_dir = find_project_directory(project_path, repo_name, researched_sha)
    if str(researched_dir) == str(base_dir):
        researched_dir = project_path
    
    if researched_dir and str(researched_dir) != str(base_dir):
        result['verification'] = check_graph_usage(researched_dir)
    
    return result

def main():
    # Load repository history
    with open('repository_history_reduced.json', 'r') as f:
        data = json.load(f)
    
    # Load analysis results
    with open('project_analysis.json', 'r') as f:
        analysis = json.load(f)
    
    base_dir = Path('/Users/jsisson/Research')
    
    # Find projects with 0 nodes
    zero_node_projects = [
        p for p in analysis['projects'] 
        if p['researched_commit_nodes'] == 0 and p['path_exists']
    ]
    
    print(f"Found {len(zero_node_projects)} projects with 0 nodes")
    print("Verifying graph framework usage...\n")
    
    verification_results = []
    
    for zero_proj in zero_node_projects:
        # Find corresponding repo data - try multiple matching strategies
        repo_data = None
        
        # Strategy 1: Exact path match
        repo_data = next(
            (r for r in data['repositories'] if r.get('path') == zero_proj['path']),
            None
        )
        
        # Strategy 2: Match by base_url if path doesn't match
        if not repo_data:
            repo_data = next(
                (r for r in data['repositories'] 
                 if r.get('base_url') and zero_proj.get('base_url') and 
                 r.get('base_url') == zero_proj.get('base_url')),
                None
            )
        
        # Strategy 3: Use zero_proj data directly if it has the needed fields
        if not repo_data and zero_proj.get('base_url'):
            repo_data = {
                'path': zero_proj.get('path', ''),
                'base_url': zero_proj.get('base_url', ''),
                'researched_commit': zero_proj.get('researched_commit_url', ''),
                'prior_commit': zero_proj.get('prior_commit_url', '')
            }
        
        if repo_data:
            result = verify_project(repo_data, base_dir)
            verification_results.append(result)
        else:
            # Still verify even without repo_data match
            result = {
                'path': zero_proj.get('path', 'unknown'),
                'base_url': zero_proj.get('base_url', ''),
                'path_exists': zero_proj.get('path_exists', False),
                'verification': {}
            }
            if zero_proj.get('path_exists'):
                project_path = base_dir / zero_proj.get('path', '')
                if project_path.exists():
                    result['verification'] = check_graph_usage(project_path)
            verification_results.append(result)
    
    # Generate report
    print("="*80)
    print("VERIFICATION RESULTS")
    print("="*80)
    
    langgraph_found = []
    langchain_only = []
    other_frameworks = []
    no_graph = []
    
    for result in verification_results:
        verif = result.get('verification', {})
        path = result['path']
        
        if verif.get('langgraph_usage'):
            langgraph_found.append({
                'path': path,
                'imports': list(verif.get('langgraph_imports', set())),
                'files': verif.get('graph_files', [])[:3]
            })
        elif verif.get('langchain_agents'):
            langchain_only.append(path)
        elif verif.get('other_graph_frameworks'):
            other_frameworks.append({
                'path': path,
                'frameworks': list(verif.get('other_graph_frameworks', set()))
            })
        else:
            no_graph.append(path)
    
    print(f"\n📊 Projects using LangGraph (but had 0 nodes detected): {len(langgraph_found)}")
    for item in langgraph_found:
        print(f"  - {item['path']}")
        print(f"    Imports: {', '.join(item['imports'])}")
        if item['files']:
            print(f"    Files: {', '.join(item['files'])}")
    
    print(f"\n🔗 Projects using LangChain Agents (not LangGraph): {len(langchain_only)}")
    for path in langchain_only[:10]:
        print(f"  - {path}")
    if len(langchain_only) > 10:
        print(f"  ... and {len(langchain_only) - 10} more")
    
    print(f"\n🔄 Projects using other graph frameworks: {len(other_frameworks)}")
    for item in other_frameworks:
        print(f"  - {item['path']}: {', '.join(item['frameworks'])}")
    
    print(f"\n❌ Projects with no graph framework detected: {len(no_graph)}")
    for path in no_graph[:10]:
        print(f"  - {path}")
    if len(no_graph) > 10:
        print(f"  ... and {len(no_graph) - 10} more")
    
    # Convert sets to lists for JSON serialization
    for result in verification_results:
        if 'verification' in result:
            verif = result['verification']
            if 'langgraph_imports' in verif:
                verif['langgraph_imports'] = list(verif['langgraph_imports'])
            if 'other_graph_frameworks' in verif:
                verif['other_graph_frameworks'] = list(verif['other_graph_frameworks'])
    
    # Save detailed results
    output = {
        'total_verified': len(verification_results),
        'langgraph_found': langgraph_found,
        'langchain_only': langchain_only,
        'other_frameworks': other_frameworks,
        'no_graph': no_graph,
        'detailed_results': verification_results
    }
    
    with open('graph_verification.json', 'w') as f:
        json.dump(output, f, indent=2)
    
    print(f"\n\nDetailed results saved to graph_verification.json")

if __name__ == '__main__':
    main()
