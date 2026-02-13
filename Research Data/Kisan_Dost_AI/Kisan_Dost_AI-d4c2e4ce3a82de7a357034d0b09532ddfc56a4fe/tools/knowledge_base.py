import os
import chromadb
from langchain.tools import Tool
from pydantic import BaseModel, Field
from langchain_community.document_loaders import DirectoryLoader, UnstructuredMarkdownLoader
from langchain_community.embeddings import SentenceTransformerEmbeddings
from langchain_community.vectorstores import Chroma
from langchain.text_splitter import RecursiveCharacterTextSplitter

# --- Configuration ---
# Assumes paths are relative to the project root where the main script is run.
DATA_DIR = "rag_data"
DB_DIR = "chroma_db"
COLLECTION_NAME = "kisan_dost_ai"
EMBEDDING_MODEL = "all-MiniLM-L6-v2"

def create_vector_store():
    """
    Loads documents, splits them into chunks, creates embeddings,
    and stores them in a persistent ChromaDB vector store.
    This function can be run once to set up the database if needed.
    """
    print("Starting to create the vector store...")

    # 1. Load Documents
    print(f"Loading documents from: {DATA_DIR}")
    loader = DirectoryLoader(
        DATA_DIR,
        glob="**/*.md",
        loader_cls=UnstructuredMarkdownLoader,
        show_progress=True,
        use_multithreading=True
    )
    documents = loader.load()
    if not documents:
        print("No documents found. Exiting.")
        return
    print(f"Loaded {len(documents)} documents.")

    # 2. Split Documents into Chunks
    print("Splitting documents into chunks...")
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200,
        length_function=len
    )
    chunks = text_splitter.split_documents(documents)
    print(f"Created {len(chunks)} chunks.")

    # 3. Create Embeddings
    print(f"Creating embeddings using model: {EMBEDDING_MODEL}")
    embeddings = SentenceTransformerEmbeddings(model_name=EMBEDDING_MODEL)

    # 4. Create and Persist Vector Store
    print(f"Creating and persisting vector store at: {DB_DIR}")
    vector_store = Chroma.from_documents(
        documents=chunks,
        embedding=embeddings,
        collection_name=COLLECTION_NAME,
        persist_directory=DB_DIR
    )
    vector_store.persist()
    print("Vector store created and persisted successfully.")

    client = chromadb.PersistentClient(path=DB_DIR)
    collection = client.get_collection(name=COLLECTION_NAME)
    print(f"Verification: Collection '{collection.name}' contains {collection.count()} documents.")


def get_retriever():
    """
    Initializes and returns a retriever for the existing ChromaDB vector store.
    """
    embeddings = SentenceTransformerEmbeddings(model_name=EMBEDDING_MODEL)
    vector_store = Chroma(
        persist_directory=DB_DIR,
        embedding_function=embeddings,
        collection_name=COLLECTION_NAME
    )
    return vector_store.as_retriever(search_kwargs={"k": 3})

def _run_retriever(query: str) -> str:
    """
    Takes a query, retrieves relevant documents, and formats them as a string.
    """
    retriever = get_retriever()
    docs = retriever.invoke(query)

    doc_texts = [f"Source: {os.path.basename(doc.metadata.get('source', 'Unknown'))}\nContent: {doc.page_content}" for doc in docs]

    if not doc_texts:
        return "No relevant information found in the knowledge base."

    return "\n\n---\n\n".join(doc_texts)

# --- Tool Definition ---
class KnowledgeSearchInput(BaseModel):
    query: str = Field(description="The specific question or topic to search for in the knowledge base.")

knowledge_base_search_tool = Tool(
    name="knowledge_base_search",
    func=_run_retriever,
    description="Use this tool to find information about Keralan agriculture, including crop calendars, pest control, soil types, market prices, and government schemes. The input should be a specific question or topic you want to look up.",
    args_schema=KnowledgeSearchInput
)

# To run the setup manually: python -m tools.knowledge_base
if __name__ == "__main__":
    create_vector_store()
