import streamlit as st
import os
from openai import AzureOpenAI
from pymongo import MongoClient
from voyageai import Client
from dotenv import load_dotenv
from langchain_text_splitters import RecursiveCharacterTextSplitter # New import

load_dotenv() # Load environment variables from .env file

st.set_page_config(page_title="Azure OpenAI Chatbot", page_icon="🤖")
st.title("Azure OpenAI Chatbot (NLP Tools)")

st.markdown("""
This is a minimal chatbot UI using Azure OpenAI.

**Tip:** Set your Azure OpenAI credentials as environment variables for best security.
""")

# --- Azure OpenAI Configuration ---
def get_azure_config():
    azure_endpoint = os.environ.get("AZURE_OPENAI_ENDPOINT")
    azure_api_key = os.environ.get("AZURE_OPENAI_API_KEY")
    if azure_endpoint and azure_api_key:
        return azure_endpoint, azure_api_key
    return None, None

azure_endpoint, azure_api_key = get_azure_config()

# --- MongoDB and VoyageAI Setup ---
MONGO_URI = os.environ.get("MONGO_URI")
VOYAGE_API_KEY = os.environ.get("VOYAGE_API_KEY")

db_client = None
collection = None
voyage_client = None

if MONGO_URI:
    try:
        db_client = MongoClient(MONGO_URI)
        db = db_client["gemini_chatbot_db"]
        collection = db["document_chunks"] # Changed collection name to reflect chunks
        st.success("Connected to MongoDB!")
    except Exception as e:
        st.error(f"Error connecting to MongoDB: {e}")
else:
    st.warning("MONGO_URI not set in environment variables. File upload and retrieval will not work.")

if VOYAGE_API_KEY:
    try:
        voyage_client = Client(api_key=VOYAGE_API_KEY)
        st.success("VoyageAI client initialized!")
    except Exception as e:
        st.error(f"Error initializing VoyageAI client: {e}")
else:
    st.warning("VOYAGE_API_KEY not set in environment variables. Embedding generation will not work.")

# --- Chunking Parameters ---
CHUNK_SIZE = 1000
CHUNK_OVERLAP = 200

# --- File Upload Section ---
st.sidebar.header("Upload Document for Context")
uploaded_file = st.sidebar.file_uploader("Choose a text file", type=["txt", "md"])

if (uploaded_file is not None) and (collection is not None) and voyage_client:
    file_content = uploaded_file.read().decode("utf-8")
    file_name = uploaded_file.name

    st.sidebar.write(f"Processing file: {file_name}")

    try:
        # Initialize text splitter
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=CHUNK_SIZE,
            chunk_overlap=CHUNK_OVERLAP,
            length_function=len,
            is_separator_regex=False,
        )
        chunks = text_splitter.split_text(file_content)

        st.sidebar.info(f"Split into {len(chunks)} chunks.")

        # Store each chunk in MongoDB
        for i, chunk in enumerate(chunks):
            result = voyage_client.embed([chunk], model="voyage-lite-02-instruct")
            embedding = result.embeddings[0]

            document = {
                "file_name": file_name,
                "chunk_index": i,
                "content": chunk,
                "embedding": embedding
            }
            collection.insert_one(document)
        st.sidebar.success(f"File '{file_name}' uploaded and embedded as chunks successfully!")
    except Exception as e:
        st.sidebar.error(f"Error processing file: {e}")
elif uploaded_file is not None and (not collection or not voyage_client):
    st.sidebar.warning("Cannot process file. Ensure MongoDB and VoyageAI are configured correctly.")

# --- Chat History ---
if "chat_history" not in st.session_state:
    st.session_state.chat_history = []

# --- Chat Input ---
user_input = st.text_input("You:", key="user_input")

# --- Send Button ---
if st.button("Send") and user_input and azure_endpoint and azure_api_key:
    st.session_state.chat_history.append(("user", user_input))

    context = ""
    if (collection is not None) and voyage_client:
        try:
            # Generate embedding for the user's query
            query_embedding_result = voyage_client.embed([user_input], model="voyage-lite-02-instruct")
            query_embedding = query_embedding_result.embeddings[0]

            # Perform vector similarity search in MongoDB to find relevant chunks
            # This is a placeholder for actual vector search using MongoDB Atlas Vector Search
            # For demonstration, we'll simulate by fetching a few recent chunks
            # In a real application, you'd use $vectorSearch aggregation pipeline
            # Example:
            results = collection.aggregate([
                {"$vectorSearch": {
                    "queryVector": query_embedding,
                    "path": "embedding",
                    "numCandidates": 100,
                    "limit": 3, # Fetch top 3 relevant chunks
                    "index": "vector_index" # Your vector search index name
                }}
            ])
            relevant_chunks = [doc["content"] for doc in results]

            # Placeholder: Fetch a few recent chunks as context
            # In a real scenario, this would be a proper vector search
            recent_chunks = collection.find().sort([('_id', -1)]).limit(3) # Fetch 3 most recent chunks
            relevant_chunks = [doc["content"] for doc in recent_chunks]

            if relevant_chunks:
                context = "Context from documents:\n" + "\n---\n".join(relevant_chunks) + "\n\n"
                st.info(f"Using context from {len(relevant_chunks)} relevant chunks.")
            else:
                st.info("No relevant documents found to provide context.")

        except Exception as e:
            st.error(f"Error during context retrieval: {e}")
            context = "" # Clear context on error

    full_prompt = f"{context}User: {user_input}"

    try:
        # Initialize Azure OpenAI client
        client = AzureOpenAI(
            api_key=azure_api_key,
            azure_endpoint=azure_endpoint,
            api_version=os.getenv("AZURE_OPENAI_API_VERSION", "2025-01-01-preview")
        )
        # Generate content
        response = client.chat.completions.create(
            model=os.getenv("AZURE_OPENAI_API_DEPLOYMENT") or os.getenv("MODEL_ID", "gpt-4.1"),
            messages=[{"role": "user", "content": full_prompt}],
            temperature=float(os.getenv("TEMPERATURE", "0.7")),
            max_tokens=int(os.getenv("MAX_TOKENS", "1000")) if os.getenv("MAX_TOKENS") else None,
        )
        model_reply = response.choices[0].message.content or "[No response]"
    except Exception as e:
        model_reply = f"[Error: {e}]"
    st.session_state.chat_history.append(("bot", model_reply))
    st.rerun()

# --- Display Chat ---
for role, msg in st.session_state.chat_history:
    if role == "user":
        st.markdown(f"**You:** {msg}")
    else:
        st.markdown(f"**Assistant:** {msg}")

st.markdown("---")
st.info("This is a minimal demo using Azure OpenAI. For advanced features, see the Azure OpenAI API documentation.")