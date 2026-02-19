"""Re-export risk from parent agent package for legacy pipeline."""
from __future__ import annotations
from ..risk import compute_risk, load_persistent_weights

__all__ = ["compute_risk", "load_persistent_weights"]
