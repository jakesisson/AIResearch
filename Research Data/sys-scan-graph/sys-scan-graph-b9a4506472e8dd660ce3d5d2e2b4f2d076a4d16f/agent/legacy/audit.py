"""Re-export audit from parent agent package for legacy pipeline."""
from __future__ import annotations
from ..audit import log_stage, hash_text

__all__ = ["log_stage", "hash_text"]
