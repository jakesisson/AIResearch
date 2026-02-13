#!/usr/bin/env python3
"""
Utility script to load parent .env file values into current environment.

This allows repositories to inherit configuration from a parent master.env file
located at the Research root level.

Usage:
    # In your Python code:
    from load_parent_env import load_parent_env
    load_parent_env()  # Loads master.env from Research root
    
    # Or as a module:
    python -m load_parent_env
"""

import os
from pathlib import Path


def find_master_env(start_path: Path = None) -> Path:
    """Find master.env file in parent directories."""
    if start_path is None:
        start_path = Path.cwd()
    
    # Look in current directory and parents
    current = start_path.resolve()
    
    # Check common locations
    locations = [
        current / "master.env",
        current.parent / "master.env",
        Path("/Users/jsisson/Research") / "master.env",
        current / ".env",
        current.parent / ".env",
    ]
    
    for loc in locations:
        if loc.exists():
            return loc
    
    # Walk up the directory tree
    for parent in current.parents:
        master_env = parent / "master.env"
        if master_env.exists():
            return master_env
        parent_env = parent / ".env"
        if parent_env.exists() and "Research" in str(parent):
            return parent_env
    
    return None


def load_parent_env(start_path: Path = None, verbose: bool = False) -> dict:
    """
    Load environment variables from parent master.env file.
    
    Args:
        start_path: Starting path to search from (default: current directory)
        verbose: Print loaded variables
        
    Returns:
        Dictionary of loaded key-value pairs
    """
    master_env = find_master_env(start_path)
    
    if not master_env:
        if verbose:
            print("⚠️  No master.env file found in parent directories")
        return {}
    
    if verbose:
        print(f"📋 Loading from: {master_env}")
    
    loaded = {}
    
    try:
        with open(master_env, 'r') as f:
            for line in f:
                line = line.strip()
                # Skip comments and empty lines
                if not line or line.startswith('#'):
                    continue
                # Parse KEY=VALUE
                if '=' in line:
                    key, value = line.split('=', 1)
                    key = key.strip()
                    value = value.strip()
                    
                    # Only set if not already in environment (parent overrides)
                    if key not in os.environ:
                        os.environ[key] = value
                        loaded[key] = value
                        if verbose:
                            print(f"  ✓ Loaded {key}")
    
    except Exception as e:
        if verbose:
            print(f"❌ Error loading {master_env}: {e}")
    
    if verbose:
        print(f"✅ Loaded {len(loaded)} variables from parent .env")
    
    return loaded


if __name__ == "__main__":
    import sys
    verbose = "--verbose" in sys.argv or "-v" in sys.argv
    loaded = load_parent_env(verbose=verbose)
    print(f"\nLoaded {len(loaded)} variables from parent .env file")
