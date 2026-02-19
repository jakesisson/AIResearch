"""Re-export metrics from parent agent package for legacy pipeline."""
from __future__ import annotations
from ..metrics import get_metrics_collector, MetricsCollector

__all__ = ["get_metrics_collector", "MetricsCollector"]
