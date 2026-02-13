# ABOUTME: LangGraph checkpointer setup and factory for PostgreSQL-based checkpoint storage
# ABOUTME: Provides checkpointer instance for LangGraph graph compilation

# Import system langgraph package (not local app/langgraph)
# Need to import from site-packages directly to avoid conflict with local app/langgraph directory
import sys
import importlib.util
import os
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from langgraph.checkpoint.postgres.aio import AsyncPostgresSaver
else:
    # Lazy import to avoid conflict with local app/langgraph directory
    # Temporarily remove app from path, import, then restore
    _app_path = None
    if 'app' in sys.path:
        _app_path = sys.path.pop(sys.path.index('app'))
    
    try:
        from langgraph.checkpoint.postgres.aio import AsyncPostgresSaver
    except ImportError as e:
        if _app_path:
            sys.path.insert(0, _app_path)
        raise ImportError(
            "langgraph.checkpoint.postgres.aio not found. "
            "Please install langgraph-checkpoint-postgres: pip install langgraph-checkpoint-postgres"
        ) from e
    finally:
        if _app_path:
            sys.path.insert(0, _app_path)

from app.infrastructure.config.settings import settings
from app.infrastructure.config.logging_config import get_logger

logger = get_logger(__name__)


async def get_checkpointer() -> AsyncPostgresSaver:
    """
    Get LangGraph checkpointer instance using PostgreSQL connection.

    Returns:
        AsyncPostgresSaver: Checkpointer for LangGraph state persistence
    """
    if not settings.postgres_langgraph_url:
        raise RuntimeError("POSTGRES_LANGGRAPH_URL is not configured. Please set it in your .env file.")

    logger.info("Creating LangGraph AsyncPostgresSaver checkpointer")

    # Use from_conn_string as shown in LangGraph documentation
    conn_string = settings.postgres_langgraph_url
    return await AsyncPostgresSaver.from_conn_string(conn_string).__aenter__()
