"""
A Streamlit application for processing and chatting with uploaded files using LangChain.
"""
import os
import tempfile
from pathlib import Path
from typing import Optional

import streamlit as st
from dotenv import load_dotenv
try:
    from langchain_classic.chains import RetrievalQA
except ImportError:
    try:
        from langchain.chains import RetrievalQA
    except ImportError:
        from langchain_community.chains import RetrievalQA
try:
    from langchain.text_splitter import RecursiveCharacterTextSplitter
except ImportError:
    from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_chroma import Chroma
from langchain_community.document_loaders import PyPDFLoader
from langchain_core.documents import Document
from langchain_core.vectorstores import VectorStore
from langchain_openai import ChatOpenAI, AzureOpenAIEmbeddings

# Define the path for the persistent Chroma database relative to the script file
PERSIST_DIRECTORY = Path(__file__).parent / ".chroma_db"


def get_azure_openai_config() -> tuple[Optional[str], Optional[str]]:
    """
    Fetches the Azure OpenAI configuration from environment variables.
    Returns (azure_endpoint, azure_api_key) tuple.
    """
    azure_endpoint = os.getenv("AZURE_OPENAI_ENDPOINT")
    azure_api_key = os.getenv("AZURE_OPENAI_API_KEY")
    return azure_endpoint, azure_api_key


def initialize_session_state(embeddings: AzureOpenAIEmbeddings):
    """Initializes the Streamlit session state."""
    if "vector_store" not in st.session_state:
        if PERSIST_DIRECTORY.exists():
            st.write("Loading existing vector store...")
            st.session_state.vector_store = Chroma(
                persist_directory=str(PERSIST_DIRECTORY),
                embedding_function=embeddings,
            )
            st.write("Vector store loaded.")
        else:
            st.session_state.vector_store = None
    if "processed_file_id" not in st.session_state:
        st.session_state.processed_file_id = None


def process_uploaded_file(uploaded_file, embeddings: AzureOpenAIEmbeddings):
    """
    Processes the uploaded PDF file, creates a vector store, and updates the session state.
    """
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp_file:
            tmp_file.write(uploaded_file.getbuffer())
            tmp_file_path = tmp_file.name

        st.write(f"Processing `{uploaded_file.name}`...")
        progress_bar = st.progress(0)
        status_text = st.empty()

        # 1. Load the document
        status_text.text("Loading PDF...")
        loader = PyPDFLoader(tmp_file_path)
        documents = loader.load()
        progress_bar.progress(25)

        # 2. Split the document into chunks
        status_text.text(f"Splitting {len(documents)} pages into chunks...")
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200,
            add_start_index=True,
            separators=["\n\n", "\n", " ", ""],
        )
        texts: list[Document] = text_splitter.split_documents(documents)
        progress_bar.progress(50)

        # 3. Create embeddings and vector store
        status_text.text(f"Creating embeddings for {len(texts)} chunks...")
        st.session_state.vector_store = Chroma.from_documents(
            texts, embeddings, persist_directory=str(PERSIST_DIRECTORY)
        )
        progress_bar.progress(100)
        status_text.text("Processing complete!")
        st.success("File processed and vector store created/updated successfully!")
        st.session_state.processed_file_id = uploaded_file.file_id

    except Exception as e:
        st.error(f"An error occurred during file processing: {e}")
    finally:
        if 'tmp_file_path' in locals() and os.path.exists(tmp_file_path):
            os.remove(tmp_file_path)


def handle_question_answering(azure_endpoint: str, azure_api_key: str, vector_store: VectorStore):
    """Handles the user input and the QA process."""
    st.header("Ask a question about the document")
    user_question = st.text_input("Your question:")

    if user_question:
        try:
            llm = ChatOpenAI(
                azure_endpoint=azure_endpoint,
                azure_deployment=os.getenv("AZURE_OPENAI_API_DEPLOYMENT") or os.getenv("MODEL_ID", "gpt-4.1"),
                api_version=os.getenv("AZURE_OPENAI_API_VERSION", "2025-01-01-preview"),
                api_key=azure_api_key,
                temperature=float(os.getenv("TEMPERATURE", "0.7")),
                max_tokens=int(os.getenv("MAX_TOKENS", "1000")) if os.getenv("MAX_TOKENS") else None,
            )
            retriever = vector_store.as_retriever(
                search_type="similarity", search_kwargs={"k": 3}
            )
            qa_chain = RetrievalQA.from_chain_type(
                llm=llm,
                chain_type="stuff",
                retriever=retriever,
                return_source_documents=True,
            )

            with st.spinner("Finding the answer..."):
                response = qa_chain.invoke({"query": user_question})
                st.write("### Answer")
                st.write(response["result"])

                with st.expander("Show source documents"):
                    st.write(response["source_documents"])

        except Exception as e:
            st.error(f"An error occurred while answering the question: {e}")


def main():
    """Main function to run the Streamlit application."""
    st.set_page_config(page_title="Chat with your PDF", layout="wide")
    st.title("📚 Chat with Your Book")

    load_dotenv()
    azure_endpoint, azure_api_key = get_azure_openai_config()

    if not azure_endpoint or not azure_api_key:
        st.error(
            "Azure OpenAI configuration not found. Please set AZURE_OPENAI_ENDPOINT and AZURE_OPENAI_API_KEY in your .env file."
        )
        return

    embeddings = AzureOpenAIEmbeddings(
        azure_endpoint=azure_endpoint,
        azure_deployment=os.getenv("AZURE_OPENAI_EMBEDDING_DEPLOYMENT", "text-embedding-ada-002"),
        api_version=os.getenv("AZURE_OPENAI_API_VERSION", "2025-01-01-preview"),
        api_key=azure_api_key,
    )

    initialize_session_state(embeddings)

    uploaded_file = st.file_uploader(
        "Upload your PDF book to create or update the vector store", type="pdf"
    )

    if uploaded_file and uploaded_file.file_id != st.session_state.get(
        "processed_file_id"
    ):
        process_uploaded_file(uploaded_file, embeddings)

    if st.session_state.get("vector_store"):
        handle_question_answering(azure_endpoint, azure_api_key, st.session_state.vector_store)


if __name__ == "__main__":
    main()