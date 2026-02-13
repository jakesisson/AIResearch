#!/usr/bin/env python3
"""
AI Model Testing Harness

This harness allows for:
1. Switching AI models in repositories to ChatGPT for consistency testing
2. Setting up Docker PostgreSQL databases
3. Managing test environments

Usage:
    python testing_harness.py <command> [options]
"""

import argparse
import os
import re
import subprocess
import sys
from pathlib import Path
from typing import Dict, List, Optional, Tuple


class TestingHarness:
    """Main testing harness class for managing AI models and databases."""

    def __init__(self, repo_path: Optional[str] = None):
        """Initialize the harness.
        
        Args:
            repo_path: Path to the repository. If None, uses current directory.
        """
        self.repo_path = Path(repo_path) if repo_path else Path.cwd()
        self.docker_compose_path = self.repo_path / "docker-compose.yml"
        self.backup_dir = self.repo_path / ".harness_backups"

    def setup_chatgpt(self, model_id: str = "gpt-4o", api_key: Optional[str] = None) -> bool:
        """Configure repository to use ChatGPT.
        
        Args:
            model_id: OpenAI model ID (default: gpt-4o)
            api_key: OpenAI API key (if None, will check environment)
            
        Returns:
            True if successful, False otherwise
        """
        print(f"🔧 Setting up ChatGPT configuration in {self.repo_path}")
        
        # Find and update config files
        config_files = self._find_config_files()
        if not config_files:
            print("❌ No configuration files found")
            return False
        
        # Backup original files
        self._backup_files(config_files)
        
        # Update config files
        success = True
        for config_file in config_files:
            if not self._update_config_to_chatgpt(config_file, model_id):
                success = False
        
        # Update or create .env file
        env_path = self._find_env_file()
        if env_path:
            self._update_env_file(env_path, model_id, api_key)
        else:
            self._create_env_file(model_id, api_key)
        
        # Update requirements.txt if needed
        self._ensure_openai_dependency()
        
        # Update LLM service code if needed
        self._update_llm_service_code()
        
        if success:
            print("✅ Successfully configured for ChatGPT")
        else:
            print("⚠️  Configuration completed with warnings")
        
        return success

    def setup_postgres(self, db_name: Optional[str] = None, port: int = 5432) -> bool:
        """Set up Docker PostgreSQL database.
        
        Args:
            db_name: Database name (if None, uses repo name)
            port: PostgreSQL port (default: 5432)
            
        Returns:
            True if successful, False otherwise
        """
        print(f"🐘 Setting up Docker PostgreSQL...")
        
        # Create docker-compose.yml if it doesn't exist
        if not self.docker_compose_path.exists():
            self._create_docker_compose(port)
        
        # Start PostgreSQL container
        try:
            subprocess.run(
                ["docker-compose", "-f", str(self.docker_compose_path), "up", "-d"],
                check=True,
                cwd=self.repo_path
            )
            print("✅ PostgreSQL container started")
            
            # Wait for database to be ready
            import time
            print("⏳ Waiting for database to be ready...")
            time.sleep(5)
            
            # Create database if specified
            if db_name:
                self._create_database(db_name, port)
            
            return True
        except subprocess.CalledProcessError as e:
            print(f"❌ Failed to start PostgreSQL: {e}")
            return False
        except FileNotFoundError:
            print("❌ docker-compose not found. Please install Docker Compose.")
            return False

    def stop_postgres(self) -> bool:
        """Stop Docker PostgreSQL container.
        
        Returns:
            True if successful, False otherwise
        """
        print("🛑 Stopping PostgreSQL container...")
        try:
            subprocess.run(
                ["docker-compose", "-f", str(self.docker_compose_path), "down"],
                check=True,
                cwd=self.repo_path
            )
            print("✅ PostgreSQL container stopped")
            return True
        except subprocess.CalledProcessError as e:
            print(f"❌ Failed to stop PostgreSQL: {e}")
            return False

    def restore_original(self) -> bool:
        """Restore original configuration files from backup.
        
        Returns:
            True if successful, False otherwise
        """
        print("↩️  Restoring original configuration...")
        
        if not self.backup_dir.exists():
            print("❌ No backup found")
            return False
        
        try:
            for backup_file in self.backup_dir.glob("*"):
                original_path = self.repo_path / backup_file.name
                if original_path.exists():
                    original_path.unlink()
                backup_file.rename(original_path)
            
            self.backup_dir.rmdir()
            print("✅ Original configuration restored")
            return True
        except Exception as e:
            print(f"❌ Failed to restore: {e}")
            return False

    def _find_config_files(self) -> List[Path]:
        """Find configuration files that need to be updated."""
        config_files = []
        
        # Look for config.py files
        for config_file in self.repo_path.rglob("config.py"):
            if "config" in str(config_file):
                config_files.append(config_file)
        
        # Also check for settings.py
        for settings_file in self.repo_path.rglob("settings.py"):
            config_files.append(settings_file)
        
        return config_files

    def _find_env_file(self) -> Optional[Path]:
        """Find .env file in the repository."""
        # Common locations for .env files
        common_locations = [
            self.repo_path / ".env",
            self.repo_path / "backend" / "app" / ".env",
            self.repo_path / "backend" / ".env",
            self.repo_path / "app" / ".env",
        ]
        
        for env_path in common_locations:
            if env_path.exists():
                return env_path
        
        # Search recursively
        for env_file in self.repo_path.rglob(".env"):
            if env_file.is_file():
                return env_file
        
        return None
    
    def _find_parent_env_file(self) -> Optional[Path]:
        """Find parent/master .env file in parent directories."""
        current = Path.cwd() if not self.repo_path.is_absolute() else self.repo_path
        
        # Look for master.env or .env in parent directories
        for parent in [current.parent, current.parent.parent, Path("/Users/jsisson/Research")]:
            # Check for master.env first
            master_env = parent / "master.env"
            if master_env.exists():
                return master_env
            
            # Check for .env in parent
            parent_env = parent / ".env"
            if parent_env.exists():
                return parent_env
        
        return None
    
    def _load_parent_env_values(self) -> Dict[str, str]:
        """Load values from parent/master .env file."""
        parent_env = self._find_parent_env_file()
        if not parent_env:
            return {}
        
        values = {}
        try:
            with open(parent_env, 'r') as f:
                for line in f:
                    line = line.strip()
                    # Skip comments and empty lines
                    if not line or line.startswith('#'):
                        continue
                    # Parse KEY=VALUE
                    if '=' in line:
                        key, value = line.split('=', 1)
                        values[key.strip()] = value.strip()
        except Exception as e:
            print(f"  ⚠️  Could not load parent .env: {e}")
        
        return values

    def _backup_files(self, files: List[Path]) -> None:
        """Backup files before modification."""
        self.backup_dir.mkdir(exist_ok=True)
        
        for file_path in files:
            if file_path.exists():
                backup_path = self.backup_dir / file_path.name
                import shutil
                shutil.copy2(file_path, backup_path)

    def _update_config_to_chatgpt(self, config_file: Path, model_id: str) -> bool:
        """Update config file to use ChatGPT."""
        try:
            content = config_file.read_text()
            original_content = content
            
            # Update MODEL_ID
            content = re.sub(
                r'MODEL_ID\s*:\s*str\s*=\s*"[^"]*"',
                f'MODEL_ID: str = "{model_id}"',
                content
            )
            
            # Update MODEL_PROVIDER
            content = re.sub(
                r'MODEL_PROVIDER\s*:\s*str\s*=\s*"[^"]*"',
                'MODEL_PROVIDER: str = "openai"',
                content
            )
            
            # Add OPENAI_API_KEY if not present
            if "OPENAI_API_KEY" not in content:
                # Find where to insert (after MODEL_PROVIDER or TOP_P)
                insert_pattern = r'(TOP_P\s*:\s*float\s*=\s*[\d.]+)'
                if re.search(insert_pattern, content):
                    content = re.sub(
                        insert_pattern,
                        r'\1\n\n    # OpenAI settings\n    OPENAI_API_KEY: str | None = None',
                        content
                    )
                else:
                    # Insert after MODEL_PROVIDER
                    content = re.sub(
                        r'(MODEL_PROVIDER\s*:\s*str\s*=\s*"[^"]*")',
                        r'\1\n\n    # OpenAI settings\n    OPENAI_API_KEY: str | None = None',
                        content
                    )
            
            if content != original_content:
                config_file.write_text(content)
                print(f"  ✓ Updated {config_file.relative_to(self.repo_path)}")
                return True
            else:
                print(f"  ⚠️  No changes needed in {config_file.relative_to(self.repo_path)}")
                return True
        except Exception as e:
            print(f"  ❌ Failed to update {config_file}: {e}")
            return False

    def _update_env_file(self, env_path: Path, model_id: str, api_key: Optional[str]) -> None:
        """Update existing .env file."""
        content = env_path.read_text()
        
        # Update or add MODEL_PROVIDER
        if re.search(r'^MODEL_PROVIDER=', content, re.MULTILINE):
            content = re.sub(r'^MODEL_PROVIDER=.*', 'MODEL_PROVIDER=openai', content, flags=re.MULTILINE)
        else:
            content += '\nMODEL_PROVIDER=openai\n'
        
        # Update or add MODEL_ID
        if re.search(r'^MODEL_ID=', content, re.MULTILINE):
            content = re.sub(r'^MODEL_ID=.*', f'MODEL_ID={model_id}', content, flags=re.MULTILINE)
        else:
            content += f'\nMODEL_ID={model_id}\n'
        
        # Update or add OPENAI_API_KEY
        api_key_value = api_key or os.getenv("OPENAI_API_KEY", "your_openai_api_key_here")
        if re.search(r'^OPENAI_API_KEY=', content, re.MULTILINE):
            content = re.sub(r'^OPENAI_API_KEY=.*', f'OPENAI_API_KEY={api_key_value}', content, flags=re.MULTILINE)
        else:
            content += f'\nOPENAI_API_KEY={api_key_value}\n'
        
        env_path.write_text(content)
        print(f"  ✓ Updated {env_path.relative_to(self.repo_path)}")

    def _create_env_file(self, model_id: str, api_key: Optional[str]) -> None:
        """Create new .env file."""
        # Try to find the best location
        env_path = self._find_env_file()
        if not env_path:
            # Default to backend/app/.env or .env in root
            if (self.repo_path / "backend" / "app").exists():
                env_path = self.repo_path / "backend" / "app" / ".env"
            else:
                env_path = self.repo_path / ".env"
        
        api_key_value = api_key or os.getenv("OPENAI_API_KEY", "your_openai_api_key_here")
        
        env_content = f"""# Model Configuration (OpenAI/ChatGPT)
MODEL_PROVIDER=openai
MODEL_ID={model_id}
OPENAI_API_KEY={api_key_value}

# Model Parameters
MAX_TOKENS=1000
TEMPERATURE=0.3
TOP_P=0.4

# Database Configuration (update with your database settings)
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=test_user
DB_PASSWORD=test_password
DB_NAME=test_db

# App Configuration
APP_ENV=dev
LOG_LEVEL=INFO
"""
        
        env_path.parent.mkdir(parents=True, exist_ok=True)
        env_path.write_text(env_content)
        print(f"  ✓ Created {env_path.relative_to(self.repo_path)}")
    
    def setup_langfuse(self) -> bool:
        """Set up Langfuse for cost and performance tracking.
        
        Returns:
            True if successful, False otherwise
        """
        print(f"📊 Setting up Langfuse for cost and performance tracking...")
        
        # Check if Langfuse Docker is running
        try:
            result = subprocess.run(
                ["docker", "ps", "--filter", "name=langfuse", "--format", "{{.Names}}"],
                capture_output=True,
                text=True,
                timeout=10
            )
            if "langfuse" in result.stdout.lower():
                print("  ✅ Langfuse Docker container is running")
            else:
                print("  ⚠️  Langfuse Docker container not running")
                print("     Start it with: docker-compose -f docker-compose.langfuse.yml up -d")
        except FileNotFoundError:
            print("  ⚠️  Docker not found. Please install Docker.")
        except Exception as e:
            print(f"  ⚠️  Could not check Langfuse status: {e}")
        
        # Load parent env values
        parent_values = self._load_parent_env_values()
        
        # Get Langfuse keys from parent or environment
        langfuse_public = os.getenv("LANGFUSE_PUBLIC_KEY") or parent_values.get("LANGFUSE_PUBLIC_KEY")
        langfuse_secret = os.getenv("LANGFUSE_SECRET_KEY") or parent_values.get("LANGFUSE_SECRET_KEY")
        # Support both LANGFUSE_HOST and LANGFUSE_BASE_URL (they're the same)
        langfuse_host = (
            os.getenv("LANGFUSE_HOST") or 
            os.getenv("LANGFUSE_BASE_URL") or 
            parent_values.get("LANGFUSE_HOST") or 
            parent_values.get("LANGFUSE_BASE_URL") or 
            "http://localhost:3000"
        )
        
        if not langfuse_public or not langfuse_secret:
            print("  ⚠️  Langfuse keys not found. Add to master.env:")
            print("     LANGFUSE_PUBLIC_KEY=your_public_key")
            print("     LANGFUSE_SECRET_KEY=your_secret_key")
            print("     LANGFUSE_HOST=https://us.cloud.langfuse.com")
            print("     (or LANGFUSE_BASE_URL)")
            langfuse_public = langfuse_public or "your_langfuse_public_key"
            langfuse_secret = langfuse_secret or "your_langfuse_secret_key"
        
        # Update or create .env file
        env_path = self._find_env_file()
        if env_path:
            self._update_env_file_langfuse(env_path, langfuse_public, langfuse_secret, langfuse_host)
        else:
            self._create_env_file_langfuse(langfuse_public, langfuse_secret, langfuse_host)
        
        # Update requirements.txt
        self._ensure_langfuse_dependency()
        
        # Update LLM service code to add Langfuse callback
        self._update_llm_service_for_langfuse()
        
        print("✅ Langfuse setup complete")
        print(f"   Dashboard: {langfuse_host}")
        return True
    
    def _update_env_file_langfuse(self, env_path: Path, public_key: str, secret_key: str, host: str) -> None:
        """Update .env file with Langfuse configuration."""
        content = env_path.read_text()
        
        # Add or update Langfuse settings
        langfuse_vars = {
            "LANGFUSE_PUBLIC_KEY": public_key,
            "LANGFUSE_SECRET_KEY": secret_key,
            "LANGFUSE_HOST": host,
            "LANGFUSE_BASE_URL": host  # Support both variable names
        }
        
        for key, value in langfuse_vars.items():
            if re.search(rf'^{key}=', content, re.MULTILINE):
                content = re.sub(rf'^{key}=.*', f'{key}={value}', content, flags=re.MULTILINE)
            else:
                content += f'\n{key}={value}\n'
        
        env_path.write_text(content)
        print(f"  ✓ Updated {env_path.relative_to(self.repo_path)} with Langfuse config")
    
    def _create_env_file_langfuse(self, public_key: str, secret_key: str, host: str) -> None:
        """Create .env file with Langfuse configuration."""
        env_path = self._find_env_file()
        if not env_path:
            if (self.repo_path / "backend" / "app").exists():
                env_path = self.repo_path / "backend" / "app" / ".env"
            else:
                env_path = self.repo_path / ".env"
        
        parent_values = self._load_parent_env_values()
        
        env_content = f"""# Langfuse Configuration (for cost & performance tracking)
LANGFUSE_PUBLIC_KEY={public_key}
LANGFUSE_SECRET_KEY={secret_key}
LANGFUSE_HOST={host}
LANGFUSE_BASE_URL={host}

# Model Configuration (from parent master.env)
MODEL_PROVIDER={parent_values.get('MODEL_PROVIDER', 'azure_openai')}
MODEL_ID={parent_values.get('MODEL_ID', 'gpt-4.1')}

# Azure OpenAI (from parent master.env)
AZURE_OPENAI_API_KEY={parent_values.get('AZURE_OPENAI_API_KEY', '')}
AZURE_OPENAI_ENDPOINT={parent_values.get('AZURE_OPENAI_ENDPOINT', '')}
AZURE_OPENAI_API_VERSION={parent_values.get('AZURE_OPENAI_API_VERSION', '2025-01-01-preview')}

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=test_user
DB_PASSWORD=test_password
DB_NAME=test_db

# App Configuration
APP_ENV=dev
LOG_LEVEL=INFO
"""
        
        env_path.parent.mkdir(parents=True, exist_ok=True)
        env_path.write_text(env_content)
        print(f"  ✓ Created {env_path.relative_to(self.repo_path)} with Langfuse config")
    
    def _ensure_langfuse_dependency(self) -> None:
        """Ensure langfuse package is in requirements.txt."""
        req_files = list(self.repo_path.rglob("requirements.txt"))
        
        for req_file in req_files:
            content = req_file.read_text()
            if "langfuse" not in content.lower():
                content += "\nlangfuse  # For LLM observability and cost tracking\n"
                req_file.write_text(content)
                print(f"  ✓ Added langfuse to {req_file.relative_to(self.repo_path)}")
    
    def _update_llm_service_for_langfuse(self) -> None:
        """Update LLM service code to add Langfuse callback."""
        llm_files = list(self.repo_path.rglob("*llm*.py"))
        llm_files.extend(self.repo_path.rglob("*service*.py"))
        
        for llm_file in llm_files:
            if "test" in str(llm_file).lower():
                continue
            
            content = llm_file.read_text()
            original_content = content
            
            # Check if Langfuse is already imported
            has_langfuse_import = "from langfuse" in content or "import langfuse" in content
            
            # Add Langfuse callback handler if using LangChain/LangGraph
            if "init_chat_model" in content or "ChatModel" in content:
                # Add import if not present
                if not has_langfuse_import:
                    # Find where imports are
                    import_match = re.search(r'(^import |^from )', content, re.MULTILINE)
                    if import_match:
                        # Add after other langchain imports
                        if "from langchain" in content:
                            content = re.sub(
                                r'(from langchain[^\n]*)',
                                r'\1\nfrom langfuse.callback import CallbackHandler',
                                content,
                                count=1
                            )
                        else:
                            # Add at top
                            content = "from langfuse.callback import CallbackHandler\n" + content
                
                # Add callback initialization
                if "CallbackHandler" in content and "langfuse_handler" not in content.lower():
                    # Find where model is initialized
                    if "init_chat_model" in content:
                        # Add callback after model init
                        content = re.sub(
                            r'(cls\.model\s*=\s*init_chat_model\([^)]+\))',
                            r'\1\n        \n        # Initialize Langfuse callback for tracking\n        langfuse_handler = CallbackHandler(\n            public_key=os.getenv("LANGFUSE_PUBLIC_KEY"),\n            secret_key=os.getenv("LANGFUSE_SECRET_KEY"),\n            host=os.getenv("LANGFUSE_HOST", "http://localhost:3000")\n        )',
                            content
                        )
            
            if content != original_content:
                llm_file.write_text(content)
                print(f"  ✓ Updated {llm_file.relative_to(self.repo_path)} for Langfuse")
    
    def setup_azure_openai(
        self,
        model_id: str = "gpt-4.1",
        api_key: Optional[str] = None,
        endpoint: Optional[str] = None,
        api_version: str = "2025-01-01-preview"
    ) -> bool:
        """Configure repository to use Azure OpenAI.
        
        Args:
            model_id: Azure OpenAI model ID (default: gpt-4.1)
            api_key: Azure OpenAI API key (if None, will check environment and parent .env)
            endpoint: Azure OpenAI endpoint URL (if None, uses default from env or parent .env)
            api_version: API version (default: 2025-01-01-preview)
            
        Returns:
            True if successful, False otherwise
        """
        print(f"🔧 Setting up Azure OpenAI configuration in {self.repo_path}")
        
        # Load parent .env values first
        parent_values = self._load_parent_env_values()
        parent_env = self._find_parent_env_file()
        if parent_env:
            print(f"  📋 Found parent .env: {parent_env.name}")
        
        # Get API key from parameter, environment, or parent .env
        api_key_value = api_key or os.getenv("AZURE_OPENAI_API_KEY") or parent_values.get("AZURE_OPENAI_API_KEY")
        if not api_key_value:
            print("⚠️  No Azure OpenAI API key found. Set AZURE_OPENAI_API_KEY environment variable or use parent .env.")
            api_key_value = "your_azure_openai_api_key_here"
        
        # Get endpoint from parameter, environment, or parent .env
        endpoint_value = endpoint or os.getenv("AZURE_OPENAI_ENDPOINT") or parent_values.get(
            "AZURE_OPENAI_ENDPOINT",
            "https://ksontini-mcp-project.openai.azure.com/"
        )
        
        # Get API version from parent .env if available
        api_version = parent_values.get("AZURE_OPENAI_API_VERSION", api_version)
        
        # Find and update config files
        config_files = self._find_config_files()
        if config_files:
            self._backup_files(config_files)
            for config_file in config_files:
                self._update_config_to_azure_openai(config_file, model_id, endpoint_value, api_version)
        
        # Update or create .env file
        env_path = self._find_env_file()
        if env_path:
            self._update_env_file_azure(env_path, model_id, api_key_value, endpoint_value, api_version)
        else:
            self._create_env_file_azure(model_id, api_key_value, endpoint_value, api_version)
        
        # Update requirements.txt if needed
        self._ensure_azure_openai_dependency()
        
        if config_files:
            print("✅ Successfully configured for Azure OpenAI")
        else:
            print("⚠️  No config files found, but .env file updated")
        
        return True
    
    def _update_config_to_azure_openai(
        self, config_file: Path, model_id: str, endpoint: str, api_version: str
    ) -> bool:
        """Update config file to use Azure OpenAI."""
        try:
            content = config_file.read_text()
            original_content = content
            
            # Update MODEL_ID
            content = re.sub(
                r'MODEL_ID\s*:\s*str\s*=\s*"[^"]*"',
                f'MODEL_ID: str = "{model_id}"',
                content
            )
            
            # Update MODEL_PROVIDER to azure_openai
            content = re.sub(
                r'MODEL_PROVIDER\s*:\s*str\s*=\s*"[^"]*"',
                'MODEL_PROVIDER: str = "azure_openai"',
                content
            )
            
            # Add Azure OpenAI settings if not present
            if "AZURE_OPENAI_API_KEY" not in content:
                insert_pattern = r'(TOP_P\s*:\s*float\s*=\s*[\d.]+)'
                if re.search(insert_pattern, content):
                    content = re.sub(
                        insert_pattern,
                        f'''\\1

    # Azure OpenAI settings
    AZURE_OPENAI_API_KEY: str | None = None
    AZURE_OPENAI_ENDPOINT: str = "{endpoint}"
    AZURE_OPENAI_API_VERSION: str = "{api_version}"''',
                        content
                    )
                else:
                    content = re.sub(
                        r'(MODEL_PROVIDER\s*:\s*str\s*=\s*"[^"]*")',
                        f'''\\1

    # Azure OpenAI settings
    AZURE_OPENAI_API_KEY: str | None = None
    AZURE_OPENAI_ENDPOINT: str = "{endpoint}"
    AZURE_OPENAI_API_VERSION: str = "{api_version}"''',
                        content
                    )
            
            if content != original_content:
                config_file.write_text(content)
                print(f"  ✓ Updated {config_file.relative_to(self.repo_path)}")
                return True
            return True
        except Exception as e:
            print(f"  ❌ Failed to update {config_file}: {e}")
            return False
    
    def _update_env_file_azure(
        self, env_path: Path, model_id: str, api_key: str, endpoint: str, api_version: str
    ) -> None:
        """Update existing .env file for Azure OpenAI."""
        content = env_path.read_text()
        parent_env = self._find_parent_env_file()
        parent_values = self._load_parent_env_values() if parent_env else {}
        
        # Use parent values if not explicitly provided
        final_api_key = api_key if api_key != "your_azure_openai_api_key_here" else parent_values.get("AZURE_OPENAI_API_KEY", api_key)
        final_endpoint = endpoint if endpoint else parent_values.get("AZURE_OPENAI_ENDPOINT", endpoint)
        final_api_version = api_version if api_version else parent_values.get("AZURE_OPENAI_API_VERSION", api_version)
        
        # Update or add MODEL_PROVIDER
        if re.search(r'^MODEL_PROVIDER=', content, re.MULTILINE):
            content = re.sub(r'^MODEL_PROVIDER=.*', 'MODEL_PROVIDER=azure_openai', content, flags=re.MULTILINE)
        else:
            content += '\nMODEL_PROVIDER=azure_openai\n'
        
        # Update or add MODEL_ID
        if re.search(r'^MODEL_ID=', content, re.MULTILINE):
            content = re.sub(r'^MODEL_ID=.*', f'MODEL_ID={model_id}', content, flags=re.MULTILINE)
        else:
            content += f'\nMODEL_ID={model_id}\n'
        
        # Only add Azure OpenAI settings if not inheriting from parent
        # (Comment them out to use parent values)
        if parent_env and not re.search(r'^AZURE_OPENAI_API_KEY=', content, re.MULTILINE):
            # Add commented out so it uses parent
            content += f'\n# Azure OpenAI settings (inherited from parent master.env)\n'
            content += f'# AZURE_OPENAI_API_KEY={final_api_key}\n'
            content += f'# AZURE_OPENAI_ENDPOINT={final_endpoint}\n'
            content += f'# AZURE_OPENAI_API_VERSION={final_api_version}\n'
        else:
            # Update or add Azure OpenAI settings
            if re.search(r'^AZURE_OPENAI_API_KEY=', content, re.MULTILINE):
                content = re.sub(r'^AZURE_OPENAI_API_KEY=.*', f'AZURE_OPENAI_API_KEY={final_api_key}', content, flags=re.MULTILINE)
            else:
                content += f'\nAZURE_OPENAI_API_KEY={final_api_key}\n'
            
            if re.search(r'^AZURE_OPENAI_ENDPOINT=', content, re.MULTILINE):
                content = re.sub(r'^AZURE_OPENAI_ENDPOINT=.*', f'AZURE_OPENAI_ENDPOINT={final_endpoint}', content, flags=re.MULTILINE)
            else:
                content += f'\nAZURE_OPENAI_ENDPOINT={final_endpoint}\n'
            
            if re.search(r'^AZURE_OPENAI_API_VERSION=', content, re.MULTILINE):
                content = re.sub(r'^AZURE_OPENAI_API_VERSION=.*', f'AZURE_OPENAI_API_VERSION={final_api_version}', content, flags=re.MULTILINE)
            else:
                content += f'\nAZURE_OPENAI_API_VERSION={final_api_version}\n'
        
        env_path.write_text(content)
        print(f"  ✓ Updated {env_path.relative_to(self.repo_path)}")
    
    def _create_env_file_azure(
        self, model_id: str, api_key: str, endpoint: str, api_version: str
    ) -> None:
        """Create new .env file for Azure OpenAI with parent .env inheritance."""
        env_path = self._find_env_file()
        if not env_path:
            if (self.repo_path / "backend" / "app").exists():
                env_path = self.repo_path / "backend" / "app" / ".env"
            else:
                env_path = self.repo_path / ".env"
        
        # Check for parent .env file
        parent_env = self._find_parent_env_file()
        parent_values = self._load_parent_env_values() if parent_env else {}
        
        # Use parent values as defaults, override with provided values
        final_api_key = api_key if api_key != "your_azure_openai_api_key_here" else parent_values.get("AZURE_OPENAI_API_KEY", api_key)
        final_endpoint = endpoint if endpoint else parent_values.get("AZURE_OPENAI_ENDPOINT", endpoint)
        final_api_version = api_version if api_version else parent_values.get("AZURE_OPENAI_API_VERSION", api_version)
        
        # Calculate relative path to parent .env for reference
        if parent_env:
            try:
                rel_path = os.path.relpath(parent_env, env_path.parent)
            except ValueError:
                rel_path = str(parent_env)
        else:
            rel_path = None
        
        # Always create full .env with values from parent (merged)
        # This ensures repositories have complete .env files that work independently
        # but are automatically populated from parent master.env
        parent_values = self._load_parent_env_values()
        
        # Merge parent values with provided values (provided values take precedence)
        merged_max_tokens = parent_values.get("MAX_TOKENS", "1000")
        merged_temperature = parent_values.get("TEMPERATURE", "0.3")
        merged_top_p = parent_values.get("TOP_P", "0.4")
        merged_db_host = parent_values.get("DB_HOST", "localhost")
        merged_db_port = parent_values.get("DB_PORT", "5432")
        merged_db_username = parent_values.get("DB_USERNAME", "test_user")
        merged_db_password = parent_values.get("DB_PASSWORD", "test_password")
        merged_db_name = parent_values.get("DB_NAME", "test_db")
        merged_app_env = parent_values.get("APP_ENV", "dev")
        merged_log_level = parent_values.get("LOG_LEVEL", "INFO")
        
        if parent_env:
            env_content = f"""# Repository .env file
# Values automatically merged from parent master.env: {rel_path}
# Update master.env to change shared values across all repositories

# Model Configuration
MODEL_PROVIDER=azure_openai
MODEL_ID={model_id}

# Azure OpenAI Configuration (from parent master.env)
AZURE_OPENAI_API_KEY={final_api_key}
AZURE_OPENAI_ENDPOINT={final_endpoint}
AZURE_OPENAI_API_VERSION={final_api_version}

# Model Parameters (from parent master.env)
MAX_TOKENS={merged_max_tokens}
TEMPERATURE={merged_temperature}
TOP_P={merged_top_p}

# Database Configuration (from parent master.env)
DB_HOST={merged_db_host}
DB_PORT={merged_db_port}
DB_USERNAME={merged_db_username}
DB_PASSWORD={merged_db_password}
DB_NAME={merged_db_name}

# App Configuration (from parent master.env)
APP_ENV={merged_app_env}
LOG_LEVEL={merged_log_level}
"""
            print(f"  ℹ️  Created .env with values merged from parent master.env")
        else:
            # Create full .env file if no parent found
            env_content = f"""# Model Configuration (Azure OpenAI)
MODEL_PROVIDER=azure_openai
MODEL_ID={model_id}
AZURE_OPENAI_API_KEY={final_api_key}
AZURE_OPENAI_ENDPOINT={final_endpoint}
AZURE_OPENAI_API_VERSION={final_api_version}

# Model Parameters
MAX_TOKENS=1000
TEMPERATURE=0.3
TOP_P=0.4

# Database Configuration (update with your database settings)
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=test_user
DB_PASSWORD=test_password
DB_NAME=test_db

# App Configuration
APP_ENV=dev
LOG_LEVEL=INFO
"""
        
        env_path.parent.mkdir(parents=True, exist_ok=True)
        env_path.write_text(env_content)
        print(f"  ✓ Created {env_path.relative_to(self.repo_path)}")
    
    def _ensure_azure_openai_dependency(self) -> None:
        """Ensure openai package supports Azure OpenAI."""
        req_files = list(self.repo_path.rglob("requirements.txt"))
        
        for req_file in req_files:
            content = req_file.read_text()
            if "openai" not in content.lower():
                content += "\nopenai>=1.0.0  # For Azure OpenAI support\n"
                req_file.write_text(content)
                print(f"  ✓ Updated {req_file.relative_to(self.repo_path)}")

    def _ensure_openai_dependency(self) -> None:
        """Ensure langchain-openai is in requirements.txt."""
        req_files = list(self.repo_path.rglob("requirements.txt"))
        
        for req_file in req_files:
            content = req_file.read_text()
            if "langchain-openai" not in content:
                # Add after langchain or langchain-core
                if "langchain-core" in content:
                    content = re.sub(
                        r'(langchain-core[^\n]*)',
                        r'\1\nlangchain-openai  # For OpenAI/ChatGPT support',
                        content
                    )
                elif "langchain" in content:
                    content = re.sub(
                        r'(langchain[^\n]*)',
                        r'\1\nlangchain-openai  # For OpenAI/ChatGPT support',
                        content,
                        count=1
                    )
                else:
                    content += "\nlangchain-openai  # For OpenAI/ChatGPT support\n"
                
                req_file.write_text(content)
                print(f"  ✓ Updated {req_file.relative_to(self.repo_path)}")

    def _update_llm_service_code(self) -> None:
        """Update LLM service code to support OpenAI."""
        llm_files = list(self.repo_path.rglob("*llm*.py"))
        llm_files.extend(self.repo_path.rglob("*service*.py"))
        
        for llm_file in llm_files:
            if "test" in str(llm_file).lower():
                continue
            
            content = llm_file.read_text()
            original_content = content
            
            # Update Bedrock initialization to be conditional
            if "initialize_bedrock_client()" in content and "if" not in content.split("initialize_bedrock_client()")[0][-50:]:
                # Make Bedrock initialization conditional
                content = re.sub(
                    r'(\s+)(cls\.initialize_bedrock_client\(\))',
                    r'\1# Only initialize Bedrock client if using Bedrock provider\n\1if cls._model_provider == "bedrock_converse":\n\1    \2',
                    content
                )
            
            # Update __init__ method
            if "__init__" in content and "initialize_bedrock_client()" in content:
                # Make it conditional in __init__ too
                content = re.sub(
                    r'(def __init__[^:]*:\s*\n\s*)(LangchainService\.initialize_bedrock_client\(\))',
                    r'\1# Only initialize Bedrock if needed\n\1if settings.MODEL_PROVIDER == "bedrock_converse":\n\1    \2',
                    content,
                    flags=re.MULTILINE
                )
            
            if content != original_content:
                llm_file.write_text(content)
                print(f"  ✓ Updated {llm_file.relative_to(self.repo_path)}")

    def _create_docker_compose(self, port: int) -> None:
        """Create docker-compose.yml for PostgreSQL."""
        db_name = self.repo_path.name.lower().replace("-", "_").replace(" ", "_")
        
        compose_content = f"""version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: {db_name}_postgres
    environment:
      POSTGRES_USER: test_user
      POSTGRES_PASSWORD: test_password
      POSTGRES_DB: {db_name}_db
    ports:
      - "{port}:5432"
    volumes:
      - postgres_data_{db_name}:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U test_user"]
      interval: 5s
      timeout: 5s
      retries: 5

volumes:
  postgres_data_{db_name}:
"""
        
        self.docker_compose_path.write_text(compose_content)
        print(f"  ✓ Created {self.docker_compose_path.relative_to(self.repo_path)}")

    def _create_database(self, db_name: str, port: int) -> None:
        """Create a specific database in PostgreSQL."""
        try:
            cmd = [
                "docker", "exec", "-i",
                f"{self.repo_path.name.lower().replace('-', '_').replace(' ', '_')}_postgres",
                "psql", "-U", "test_user", "-d", "postgres",
                "-c", f"CREATE DATABASE {db_name};"
            ]
            subprocess.run(cmd, check=True, capture_output=True)
            print(f"  ✓ Created database: {db_name}")
        except subprocess.CalledProcessError:
            # Database might already exist, which is fine
            pass


def main():
    """Main entry point for the harness."""
    parser = argparse.ArgumentParser(
        description="AI Model Testing Harness - Switch to ChatGPT/Azure OpenAI and manage PostgreSQL"
    )
    parser.add_argument(
        "command",
        choices=["setup-chatgpt", "setup-azure-openai", "setup-langfuse", "setup-postgres", "stop-postgres", "restore"],
        help="Command to execute"
    )
    parser.add_argument(
        "--repo-path",
        type=str,
        help="Path to repository (default: current directory)"
    )
    parser.add_argument(
        "--model-id",
        type=str,
        default="gpt-4o",
        help="OpenAI model ID (default: gpt-4o)"
    )
    parser.add_argument(
        "--api-key",
        type=str,
        help="OpenAI/Azure OpenAI API key (or set OPENAI_API_KEY/AZURE_OPENAI_API_KEY env var)"
    )
    parser.add_argument(
        "--endpoint",
        type=str,
        help="Azure OpenAI endpoint URL (or set AZURE_OPENAI_ENDPOINT env var)"
    )
    parser.add_argument(
        "--api-version",
        type=str,
        default="2025-01-01-preview",
        help="Azure OpenAI API version (default: 2025-01-01-preview)"
    )
    parser.add_argument(
        "--db-name",
        type=str,
        help="Database name for PostgreSQL setup"
    )
    parser.add_argument(
        "--db-port",
        type=int,
        default=5432,
        help="PostgreSQL port (default: 5432)"
    )
    
    args = parser.parse_args()
    
    harness = TestingHarness(repo_path=args.repo_path)
    
    if args.command == "setup-chatgpt":
        success = harness.setup_chatgpt(
            model_id=args.model_id,
            api_key=args.api_key
        )
        sys.exit(0 if success else 1)
    
    elif args.command == "setup-azure-openai":
        success = harness.setup_azure_openai(
            model_id=args.model_id,
            api_key=args.api_key,
            endpoint=args.endpoint,
            api_version=args.api_version
        )
        sys.exit(0 if success else 1)
    
    elif args.command == "setup-langfuse":
        success = harness.setup_langfuse()
        sys.exit(0 if success else 1)
    
    elif args.command == "setup-postgres":
        success = harness.setup_postgres(
            db_name=args.db_name,
            port=args.db_port
        )
        sys.exit(0 if success else 1)
    
    elif args.command == "stop-postgres":
        success = harness.stop_postgres()
        sys.exit(0 if success else 1)
    
    elif args.command == "restore":
        success = harness.restore_original()
        sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()
