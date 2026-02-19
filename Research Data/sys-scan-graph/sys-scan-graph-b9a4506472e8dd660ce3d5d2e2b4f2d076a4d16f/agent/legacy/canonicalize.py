"""Re-export canonicalize from parent agent package for legacy pipeline."""
from __future__ import annotations
from ..canonicalize import canonicalize_enriched_output_dict

__all__ = ["canonicalize_enriched_output_dict"]
