"""Azure OpenAI LLM provider for cost-perf and production.

Uses Azure OpenAI for summarize(); returns real token usage from response_metadata.
Environment variables (for cost-perf, set in master.env or shell):
  AZURE_OPENAI_API_KEY     - Azure OpenAI API key
  AZURE_OPENAI_ENDPOINT    - e.g. https://your-resource.openai.azure.com
  AZURE_OPENAI_API_VERSION - e.g. 2024-02-15-preview
  AZURE_OPENAI_DEPLOYMENT  - deployment name (e.g. gpt-4o)
  AGENT_LLM_TIMEOUT_S      - optional timeout (default 60)
"""
from __future__ import annotations
import os
import time
from typing import List, Optional, Dict, Any
from ..models import Reductions, Correlation, Summaries, ActionItem
from ..llm_provider import ILLMProvider, NullLLMProvider
from ..data_governance import get_data_governor

try:
    from langchain_openai import AzureChatOpenAI
    from langchain_core.prompts import ChatPromptTemplate
except Exception:
    AzureChatOpenAI = None
    ChatPromptTemplate = None

SUMMARY_TEMPLATE = (
    "You are a security analyst. Produce a concise executive summary (<=120 words) "
    "highlighting module stats, notable SUID anomalies, listening ports, and any correlations. "
    "Focus on risk-relevant changes.\n"
    "Top Findings (redacted JSON): {top_findings}\n"
    "Module Summary: {module_summary}\n"
    "SUID Summary: {suid_summary}\n"
    "Network Summary: {network_summary}\n"
    "Correlations: {correlation_titles}\n"
    "Return only the summary paragraph."
)


def _usage_from_message(msg) -> Dict[str, int]:
    """Extract input_tokens, output_tokens from LangChain AIMessage (response_metadata or usage_metadata)."""
    out = {"input_tokens": 0, "output_tokens": 0}
    if msg is None:
        return out
    usage = None
    um = getattr(msg, "usage_metadata", None)
    if um is not None and hasattr(um, "get"):
        usage = um
    elif um is not None and hasattr(um, "input_tokens"):
        out["input_tokens"] = int(getattr(um, "input_tokens", 0) or 0)
        out["output_tokens"] = int(getattr(um, "output_tokens", 0) or 0)
        return out
    if not usage:
        meta = getattr(msg, "response_metadata", None) or {}
        usage = meta.get("usage") or meta.get("token_usage") or {}
    if isinstance(usage, dict):
        out["input_tokens"] = int(usage.get("input_tokens") or usage.get("prompt_tokens") or 0)
        out["output_tokens"] = int(usage.get("output_tokens") or usage.get("completion_tokens") or 0)
    return out


class AzureLLMProvider(ILLMProvider):
    """ILLMProvider backed by Azure OpenAI. Reports real token usage."""

    def __init__(self):
        if AzureChatOpenAI is None:
            raise RuntimeError("langchain-openai not installed. pip install langchain-openai")
        api_key = os.environ.get("AZURE_OPENAI_API_KEY")
        endpoint = os.environ.get("AZURE_OPENAI_ENDPOINT")
        if not api_key or not endpoint:
            raise RuntimeError("AZURE_OPENAI_API_KEY and AZURE_OPENAI_ENDPOINT required for Azure provider")
        api_version = os.environ.get("AZURE_OPENAI_API_VERSION", "2024-02-15-preview")
        deployment = os.environ.get("AZURE_OPENAI_DEPLOYMENT") or os.environ.get("MODEL_ID", "gpt-4o")
        timeout = float(os.environ.get("AGENT_LLM_TIMEOUT_S", "60") or 60)
        self.llm = AzureChatOpenAI(
            azure_endpoint=endpoint,
            api_key=api_key,
            api_version=api_version,
            deployment_name=deployment,
            timeout=timeout,
        )
        self.prompt = ChatPromptTemplate.from_template(SUMMARY_TEMPLATE)
        self.null_fallback = NullLLMProvider()
        self.governor = get_data_governor()

    def summarize(
        self,
        reductions: Reductions,
        correlations: List[Correlation],
        actions: List[ActionItem],
        *,
        skip: bool = False,
        previous: Optional[Summaries] = None,
        skip_reason: Optional[str] = None,
        baseline_context: Optional[Dict[str, Any]] = None,
    ) -> Summaries:
        if skip and previous:
            return self.null_fallback.summarize(
                reductions, correlations, actions, skip=skip, previous=previous, skip_reason=skip_reason
            )
        red_top = self.governor.redact_for_llm(reductions.top_findings) if reductions.top_findings else []
        mod = reductions.module_summary or {}
        suid = reductions.suid_summary or {}
        net = reductions.network_summary or {}
        corr_titles = [c.title for c in correlations]
        start = time.time()
        try:
            chain = self.prompt | self.llm
            msg = chain.invoke({
                "top_findings": red_top,
                "module_summary": mod,
                "suid_summary": suid,
                "network_summary": net,
                "correlation_titles": corr_titles,
            })
            summary_text = (msg.content or "").strip()
            usage = _usage_from_message(msg)
        except Exception as e:
            if os.environ.get("COST_PERF") == "1":
                import sys
                print(f"Cost-perf: Azure invoke failed: {e}", file=sys.stderr)
                fallback = self.null_fallback.summarize(reductions, correlations, actions, previous=previous)
                fallback.metrics = (fallback.metrics or {}) | {
                    "provider": "azure-openai",
                    "tokens_prompt": None,
                    "tokens_completion": None,
                    "latency_ms": int((time.time() - start) * 1000),
                    "error": str(e),
                }
                return fallback
            return self.null_fallback.summarize(reductions, correlations, actions, previous=previous)
        elapsed = int((time.time() - start) * 1000)
        pt = usage["input_tokens"]
        ct = usage["output_tokens"]
        if os.environ.get("COST_PERF") == "1":
            import sys
            meta = getattr(msg, "response_metadata", None) or {}
            um = getattr(msg, "usage_metadata", None)
            print(f"Cost-perf: Azure usage extracted: input_tokens={pt}, output_tokens={ct}", file=sys.stderr)
            print(f"Cost-perf: response_metadata keys: {list(meta.keys())}, usage_metadata={um!r}", file=sys.stderr)
        metrics = {
            "provider": "azure-openai",
            "tokens_prompt": pt if (pt or ct) else None,
            "tokens_completion": ct if (pt or ct) else None,
            "latency_ms": elapsed,
            "findings_count": len(red_top),
        }
        if baseline_context:
            summary_text += f"\nBaseline references: {len(baseline_context)} findings checked."
        return Summaries(
            executive_summary=summary_text,
            metrics=metrics,
            explanation_provenance={"executive_summary": [f.get("id") for f in red_top]},
        )

    def refine_rules(
        self, suggestions: List[Dict[str, Any]], examples: Optional[Dict[str, List[str]]] = None
    ) -> List[Dict[str, Any]]:
        return self.null_fallback.refine_rules(suggestions, examples)

    def triage(self, reductions: Reductions, correlations: List[Correlation]) -> Dict[str, Any]:
        return self.null_fallback.triage(reductions, correlations)


__all__ = ["AzureLLMProvider"]
