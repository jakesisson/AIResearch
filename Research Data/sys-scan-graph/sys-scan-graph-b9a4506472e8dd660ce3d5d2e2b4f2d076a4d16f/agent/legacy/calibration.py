"""Re-export calibration from parent agent package for legacy pipeline."""
from __future__ import annotations
from ..calibration import apply_probability

__all__ = ["apply_probability"]
