"""Re-export graph_analysis from parent agent package for legacy pipeline."""
from __future__ import annotations
from ..graph_analysis import annotate_and_summarize

__all__ = ["annotate_and_summarize"]
