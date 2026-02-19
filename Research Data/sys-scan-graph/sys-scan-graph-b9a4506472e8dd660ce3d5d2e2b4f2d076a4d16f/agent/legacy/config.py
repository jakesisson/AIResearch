"""Re-export config from parent agent package for legacy pipeline."""
from __future__ import annotations
from ..config import load_config

__all__ = ["load_config"]
