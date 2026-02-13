#!/usr/bin/env python3
"""
Enforce Azure OpenAI configuration across all projects.
This script:
1. Finds all .env files in projects
2. Updates/creates them to use Azure OpenAI
3. Removes or comments out other model provider configurations
4. Ensures database configuration uses PostgreSQL
"""

import json
import re
from pathlib import Path
from typing import Dict, List, Optional

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

def update_env_file(env_path: Path, azure_config: Dict, db_config: Dict) -> Dict:
    """Update an .env file to use Azure OpenAI and PostgreSQL."""
    result = {
        'file': str(env_path),
        'updated': False,
        'changes': []
    }
    
    if not env_path.exists():
        # Create new .env file
        content = "# Environment configuration - Auto-generated\n"
        content += "# Uses Azure OpenAI and PostgreSQL\n\n"
        content += "# Azure OpenAI Configuration\n"
        for key, value in azure_config.items():
            content += f"{key}={value}\n"
        content += "\n# Database Configuration (PostgreSQL)\n"
        for key, value in db_config.items():
            content += f"{key}={value}\n"
        
        env_path.write_text(content)
        result['updated'] = True
        result['changes'].append('Created new .env file')
        return result
    
    # Read existing content
    content = env_path.read_text(encoding='utf-8', errors='ignore')
    original_content = content
    
    # Track existing variables
    existing_vars = set()
    lines = content.split('\n')
    new_lines = []
    in_section = None
    
    for line in lines:
        stripped = line.strip()
        
        # Skip comments and empty lines (we'll add them back)
        if not stripped or stripped.startswith('#'):
            # Check if this is a section header
            if 'azure' in stripped.lower() or 'openai' in stripped.lower():
                in_section = 'azure'
            elif 'database' in stripped.lower() or 'db_' in stripped.lower() or 'postgres' in stripped.lower():
                in_section = 'database'
            elif 'model' in stripped.lower() or 'llm' in stripped.lower():
                in_section = 'model'
            continue
        
        # Extract variable name
        if '=' in stripped:
            var_name = stripped.split('=')[0].strip()
            existing_vars.add(var_name)
            
            # Skip variables we want to replace
            skip_vars = [
                'MODEL_PROVIDER', 'MODEL_ID', 'AZURE_OPENAI_API_KEY', 'AZURE_OPENAI_ENDPOINT',
                'AZURE_OPENAI_API_VERSION', 'MAX_TOKENS', 'TEMPERATURE', 'TOP_P',
                'OPENAI_API_KEY', 'ANTHROPIC_API_KEY', 'GOOGLE_AI_API_KEY',
                'DB_HOST', 'DB_PORT', 'DB_USERNAME', 'DB_PASSWORD', 'DB_NAME',
                'DATABASE_URL', 'POSTGRES_URL', 'POSTGRES_USER', 'POSTGRES_PASSWORD',
                'POSTGRES_HOST', 'POSTGRES_PORT', 'POSTGRES_DB', 'MONGODB_URI'
            ]
            
            if var_name in skip_vars:
                result['changes'].append(f'Will replace {var_name}')
                continue
        
        new_lines.append(line)
    
    # Add Azure OpenAI configuration
    new_lines.append('\n# ============================================================================')
    new_lines.append('# Azure OpenAI Configuration (ENFORCED)')
    new_lines.append('# ============================================================================')
    for key, value in azure_config.items():
        if key not in existing_vars:
            new_lines.append(f'{key}={value}')
            result['changes'].append(f'Added {key}')
    
    # Add Database configuration
    new_lines.append('\n# ============================================================================')
    new_lines.append('# Database Configuration - PostgreSQL (STANDARD)')
    new_lines.append('# ============================================================================')
    for key, value in db_config.items():
        if key not in existing_vars:
            new_lines.append(f'{key}={value}')
            result['changes'].append(f'Added {key}')
    
    # Write updated content
    new_content = '\n'.join(new_lines)
    if new_content != original_content:
        env_path.write_text(new_content)
        result['updated'] = True
    
    return result

def enforce_configuration(project_path: Path, azure_config: Dict, db_config: Dict) -> Dict:
    """Enforce Azure OpenAI and PostgreSQL configuration in a project."""
    result = {
        'path': str(project_path),
        'env_files_updated': [],
        'config_files_found': []
    }
    
    if not project_path.exists():
        return result
    
    # Find all .env files
    env_files = list(project_path.rglob('.env'))
    env_files.extend(list(project_path.rglob('.env.*')))
    env_files.extend(list(project_path.rglob('*.env')))
    
    # Filter out .env.master and .env.example
    env_files = [f for f in env_files if 'master' not in str(f) and 'example' not in str(f).lower()]
    
    for env_file in env_files[:5]:  # Limit to first 5 .env files
        update_result = update_env_file(env_file, azure_config, db_config)
        if update_result['updated']:
            result['env_files_updated'].append(update_result)
    
    # Also check for config files that might need updating
    config_patterns = ['config.py', 'settings.py', 'config.ts', 'config.js']
    for pattern in config_patterns:
        config_files = list(project_path.rglob(pattern))
        if config_files:
            result['config_files_found'].extend([str(f.relative_to(project_path)) for f in config_files[:3]])
    
    return result

def main():
    import argparse
    
    parser = argparse.ArgumentParser(description='Enforce Azure OpenAI and PostgreSQL configuration')
    parser.add_argument('--dry-run', action='store_true', help='Show what would be changed without making changes')
    parser.add_argument('--create-missing', action='store_true', help='Create .env files if they don\'t exist')
    args = parser.parse_args()
    
    # Azure OpenAI configuration from template
    azure_config = {
        'MODEL_PROVIDER': 'azure_openai',
        'MODEL_ID': 'gpt-4.1',
        'AZURE_OPENAI_API_KEY': 'EBV6HXBgllfMaegY1CzWcRVfCMLgXeSLbnnNNqIYaiJf28gVPcePJQQJ99BKACYeBjFXJ3w3AAAAACOG60w6',
        'AZURE_OPENAI_ENDPOINT': 'https://ksontini-mcp-project.openai.azure.com/',
        'AZURE_OPENAI_API_VERSION': '2025-01-01-preview',
        'MAX_TOKENS': '1000',
        'TEMPERATURE': '0.3',
        'TOP_P': '0.4'
    }
    
    # PostgreSQL configuration
    db_config = {
        'DB_HOST': 'localhost',
        'DB_PORT': '5432',
        'DB_USERNAME': 'test_user',
        'DB_PASSWORD': 'test_password',
        'DB_NAME': 'test_db',
        'DATABASE_URL': 'postgresql://test_user:test_password@localhost:5432/test_db',
        'POSTGRES_URL': 'postgresql://test_user:test_password@localhost:5432/test_db',
        'POSTGRES_USER': 'test_user',
        'POSTGRES_PASSWORD': 'test_password',
        'POSTGRES_HOST': 'localhost',
        'POSTGRES_PORT': '5432',
        'POSTGRES_DB': 'test_db'
    }
    
    # Load repository history
    with open('repository_history_reduced.json', 'r') as f:
        data = json.load(f)
    
    base_dir = Path('/Users/jsisson/Research')
    results = []
    
    print("Enforcing Azure OpenAI and PostgreSQL configuration...")
    if args.dry_run:
        print("DRY RUN MODE - No changes will be made\n")
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
            
            if args.dry_run:
                # Just report what would be done
                env_files = list(researched_dir.rglob('.env'))
                env_files = [f for f in env_files if 'master' not in str(f) and 'example' not in str(f).lower()]
                if env_files:
                    print(f"  Would update {len(env_files)} .env file(s)")
                    for env_file in env_files[:3]:
                        print(f"    - {env_file.relative_to(researched_dir)}")
                else:
                    print(f"  No .env files found")
            else:
                result = enforce_configuration(researched_dir, azure_config, db_config)
                results.append(result)
                
                if result['env_files_updated']:
                    print(f"  ✓ Updated {len(result['env_files_updated'])} .env file(s)")
                    for update in result['env_files_updated'][:2]:
                        print(f"    Changes: {len(update['changes'])}")
                else:
                    print(f"  - No .env files to update")
    
    if not args.dry_run:
        # Summary
        total_updated = sum(len(r['env_files_updated']) for r in results)
        print(f"\n{'='*80}")
        print(f"SUMMARY: Updated {total_updated} .env files across {len(results)} projects")
        print(f"{'='*80}")
        
        # Save results
        with open('enforcement_results.json', 'w') as f:
            json.dump({
                'total_projects': len(results),
                'total_env_files_updated': total_updated,
                'azure_config': azure_config,
                'db_config': db_config,
                'results': results
            }, f, indent=2)
        
        print(f"\nDetailed results saved to enforcement_results.json")

if __name__ == '__main__':
    main()
