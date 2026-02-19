"""Re-export data_governance from parent agent package for legacy pipeline."""
from __future__ import annotations
from ..data_governance import get_data_governor

__all__ = ["get_data_governor"]
