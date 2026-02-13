"""
Memory Manager Module (Shim).

Purpose:
- This module now serves as a lightweight adapter to support message-based
  memory using LangGraph's MessagesState and add_messages reducer, as described
  in the LangGraph Graph API documentation ("Using Messages in your graph").
- The previous summarization-based memory storage has been deprecated to avoid
  duplicating functionality that is already built into LangGraph.

Notes for developers:
- Conversation history should be passed through the graph via the `messages`
  field (list of LangChain `Message` objects or their serialized dict form).
- This shim preserves the class and method surface so existing imports do not
  break, but most methods are now no-ops.
"""

from typing import Optional, Dict, Any, List


class MemoryManager:
    """Shim over message-based memory.

    This class exists for backward compatibility with previous code paths that
    imported and used a MemoryManager. It no longer stores or summarizes
    conversation state. Instead, use LangGraph's `messages` in the graph state.
    """

    def __init__(self, *_args: Any, **_kwargs: Any):
        """Initialize the shim. No services or state are created."""
        self._deprecated = True

    def save_conversation_turn(self, human_input: str, ai_response: str) -> None:
        """No-op. Kept for API compatibility.

        Parameters:
            human_input (str): User message text.
            ai_response (str): Assistant message text.
        Side Effects:
            None.
        """
        return None

    def get_memory_context(self) -> str:
        """Return an empty string to indicate no external memory context.

        Return:
            str: Always "". Graph nodes should rely on `messages` instead.
        """
        return ""

    def clear_memory(self) -> None:
        """No-op. Left for backward compatibility."""
        return None

    def reset_session(self) -> None:
        """No-op. Left for backward compatibility."""
        return None

    def is_available(self) -> bool:
        """Indicate that external memory storage is not used.

        Return:
            bool: Always False.
        """
        return False

    def get_buffer_string(self) -> str:
        """No-op buffer accessor kept for compatibility.

        Return:
            str: Always "".
        """
        return ""

    # ---------- Adapters for UI <-> Graph messages ----------
    def to_messages(self, chat_history: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Convert UI chat history to LangGraph-serializable message dicts.

        Parameters:
            chat_history (List[Dict[str, Any]]): Items with keys 'role' and 'content'.
                For assistant turns, 'content' may be a dict with 'text'.

        Return:
            List[Dict[str, Any]]: Each item has keys 'type' ('human'|'ai') and 'content' (str).

        Example:
            >>> mgr = MemoryManager()
            >>> mgr.to_messages([
            ...   {'role': 'user', 'content': 'Hi'},
            ...   {'role': 'assistant', 'content': {'text': 'Hello'}}
            ... ])
            [{'type': 'human', 'content': 'Hi'}, {'type': 'ai', 'content': 'Hello'}]
        """
        msgs: List[Dict[str, Any]] = []
        for m in chat_history or []:
            role = (m.get('role') or '').strip().lower()
            content = m.get('content', '')
            if role == 'assistant' and isinstance(content, dict):
                content = content.get('text', str(content))
            if role == 'user':
                msgs.append({"type": "human", "content": str(content)})
            elif role == 'assistant':
                msgs.append({"type": "ai", "content": str(content)})
        return msgs

    def from_messages(self, messages: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Convert LangGraph message dicts back to simple UI chat entries.

        Parameters:
            messages (List[Dict[str, Any]]): Items with keys 'type' and 'content'.

        Return:
            List[Dict[str, Any]]: Items with 'role' and 'content'.
        """
        ui: List[Dict[str, Any]] = []
        for m in messages or []:
            t = (m.get('type') or '').strip().lower()
            c = m.get('content', '')
            if t == 'human':
                ui.append({'role': 'user', 'content': c})
            elif t == 'ai':
                ui.append({'role': 'assistant', 'content': {'text': c}})
        return ui
