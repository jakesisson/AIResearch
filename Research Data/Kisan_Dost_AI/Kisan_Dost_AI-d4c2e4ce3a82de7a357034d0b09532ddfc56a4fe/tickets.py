import uuid
from datetime import datetime, timezone

# In-memory storage for tickets.
# In a real application, this would be a database.
_tickets = []

def create_ticket(summary: str, user_info: dict) -> dict:
    """
    Creates a new support ticket and stores it in memory.
    """
    new_ticket = {
        "id": str(uuid.uuid4()),
        "summary": summary,
        "user_info": user_info,
        "status": "Open",
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    _tickets.append(new_ticket)
    print(f"--- TICKET CREATED: {new_ticket['id']} ---")
    return new_ticket

def get_all_tickets() -> list[dict]:
    """
    Returns all tickets currently in memory.
    """
    return _tickets
