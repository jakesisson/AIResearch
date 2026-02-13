import chromadb
from langchain.tools import tool
from langchain_community.embeddings import SentenceTransformerEmbeddings
from langchain_community.vectorstores import Chroma
from pydantic import BaseModel, Field
import uuid

# --- Configuration for Memory Vector Store ---
MEMORY_DB_DIR = "user_memory_db"
MEMORY_COLLECTION_NAME = "user_memories"
EMBEDDING_MODEL = "all-MiniLM-L6-v2"

# --- Embedding Function ---
embeddings = SentenceTransformerEmbeddings(model_name=EMBEDDING_MODEL)

# --- ChromaDB Client ---
client = chromadb.PersistentClient(path=MEMORY_DB_DIR)

# --- Vector Store ---
vector_store = Chroma(
    client=client,
    collection_name=MEMORY_COLLECTION_NAME,
    embedding_function=embeddings,
)

# --- Low-Level Memory Management Functions ---

def add_memory(user_id: str, memory_text: str):
    """Adds a new memory snippet for a specific user."""
    print(f"--- MEMORY: Adding memory for user {user_id}: '{memory_text}' ---")
    vector_store.add_texts(
        texts=[memory_text],
        metadatas=[{"user_id": user_id}],
        ids=[str(uuid.uuid4())]
    )

def get_memories(user_id: str) -> list:
    """Retrieves all memories for a specific user."""
    print(f"--- MEMORY: Retrieving all memories for user {user_id} ---")
    results = vector_store.get(where={"user_id": user_id}, include=["metadatas", "documents"])
    if not results or not results.get('ids'):
        return []

    memories = []
    for i, doc_id in enumerate(results['ids']):
        memories.append({
            "id": doc_id,
            "text": results['documents'][i],
            "metadata": results['metadatas'][i]
        })
    return memories

def update_memory(memory_id: str, new_memory_text: str):
    """Updates an existing memory by its unique ID."""
    print(f"--- MEMORY: Updating memory {memory_id} to '{new_memory_text}' ---")
    vector_store.update_document(document_id=memory_id, document=new_memory_text)

def delete_memory(memory_id: str):
    """Deletes a memory by its unique ID."""
    print(f"--- MEMORY: Deleting memory {memory_id} ---")
    vector_store.delete(ids=[memory_id])


# --- Agent-Facing Tool for Memory Retrieval ---
# Tool is disabled for now as per user request
retrieve_relevant_memories_tool = None
