"""Re-export endpoint_classification from parent agent package for legacy pipeline."""
from __future__ import annotations
from ..endpoint_classification import classify

__all__ = ["classify"]
