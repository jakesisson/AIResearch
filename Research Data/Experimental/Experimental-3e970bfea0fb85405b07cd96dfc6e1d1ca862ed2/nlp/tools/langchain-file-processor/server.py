"""
A Streamlit application for processing and chatting with uploaded files using LangChain.
This version incorporates best practices for Streamlit apps, including:
- Caching for expensive resources (@st.cache_resource) and data processing (@st.cache_data).
- Modularity and separation of concerns for better readability and maintenance.
- Advanced RAG techniques: ParentDocumentRetriever and LLM-based re-ranking.
"""
import os
import tempfile
from pathlib import Path
from typing import List, Optional, Tuple

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
    from langchain_classic.retrievers import (ContextualCompressionRetriever,
                                              ParentDocumentRetriever)
    from langchain_classic.retrievers.document_compressors import LLMChainExtractor
    from langchain_classic.storage import InMemoryStore
    from langchain_text_splitters import RecursiveCharacterTextSplitter
except ImportError:
    try:
        from langchain.retrievers import (ContextualCompressionRetriever,
                                          ParentDocumentRetriever)
        from langchain.retrievers.document_compressors import LLMChainExtractor
        from langchain.storage import InMemoryStore
        from langchain.text_splitter import RecursiveCharacterTextSplitter
    except ImportError:
        from langchain_community.retrievers import ContextualCompressionRetriever, ParentDocumentRetriever
        from langchain_community.retrievers.document_compressors import LLMChainExtractor
        from langchain_community.storage import InMemoryStore
        from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_chroma import Chroma
from langchain_community.document_loaders import PyPDFLoader
from langchain_core.documents import Document
from langchain_openai import ChatOpenAI, AzureOpenAIEmbeddings

# --- Configuration ---
PERSIST_DIRECTORY = Path(__file__).parent / ".chroma_db"
PARENT_CHUNK_SIZE = 2000
CHILD_CHUNK_SIZE = 400

# --- Helper Functions ---

def get_azure_openai_config() -> Tuple[Optional[str], Optional[str]]:
    """
    Fetches the Azure OpenAI configuration from environment variables.
    Returns (azure_endpoint, azure_api_key) tuple.
    """
    azure_endpoint = os.getenv("AZURE_OPENAI_ENDPOINT")
    azure_api_key = os.getenv("AZURE_OPENAI_API_KEY")
    return azure_endpoint, azure_api_key

# --- Caching Functions for Expensive Resources ---

@st.cache_resource
def get_llm(azure_endpoint: str, azure_api_key: str) -> ChatOpenAI:
    """Initializes and caches the LLM."""
    return ChatOpenAI(
        azure_endpoint=azure_endpoint,
        azure_deployment=os.getenv("AZURE_OPENAI_API_DEPLOYMENT") or os.getenv("MODEL_ID", "gpt-4.1"),
        api_version=os.getenv("AZURE_OPENAI_API_VERSION", "2025-01-01-preview"),
        api_key=azure_api_key,
        temperature=float(os.getenv("TEMPERATURE", "0.7")),
        max_tokens=int(os.getenv("MAX_TOKENS", "1000")) if os.getenv("MAX_TOKENS") else None,
    )

@st.cache_resource
def get_embeddings(azure_endpoint: str, azure_api_key: str) -> AzureOpenAIEmbeddings:
    """Initializes and caches the embeddings model."""
    return AzureOpenAIEmbeddings(
        azure_endpoint=azure_endpoint,
        azure_deployment=os.getenv("AZURE_OPENAI_EMBEDDING_DEPLOYMENT", "text-embedding-ada-002"),
        api_version=os.getenv("AZURE_OPENAI_API_VERSION", "2025-01-01-preview"),
        api_key=azure_api_key,
    )

@st.cache_data
def load_and_split_docs(file_path: str) -> List[Document]:
    """
    Loads a PDF and splits it into documents.
    Caches the result based on the file path.
    """
    loader = PyPDFLoader(file_path)
    return loader.load()

@st.cache_resource
def build_retriever(
    _docs: List[Document], embeddings: AzureOpenAIEmbeddings
) -> ParentDocumentRetriever:
    """
    Builds and caches the advanced ParentDocumentRetriever.
    The '_docs' argument is used for caching purposes but the function
    relies on the documents being passed to retriever.add_documents.
    """
    parent_splitter = RecursiveCharacterTextSplitter(chunk_size=PARENT_CHUNK_SIZE)
    child_splitter = RecursiveCharacterTextSplitter(chunk_size=CHILD_CHUNK_SIZE)
    
    vectorstore = Chroma(
        collection_name="split_parents",
        embedding_function=embeddings,
        persist_directory=str(PERSIST_DIRECTORY),
    )
    store = InMemoryStore()

    retriever = ParentDocumentRetriever(
        vectorstore=vectorstore,
        docstore=store,
        child_splitter=child_splitter,
        parent_splitter=parent_splitter,
    )
    # This part is crucial and will run only when the documents change
    retriever.add_documents(_docs, ids=None)
    return retriever

# --- Main Application Logic ---

def handle_question_answering(llm: ChatOpenAI, retriever):
    """Handles the user input and the QA process with re-ranking."""
    st.header("Ask a question about the document")
    user_question = st.text_input("Your question:")

    if user_question:
        with st.spinner("Retrieving, re-ranking, and finding the answer..."):
            try:
                # 1. Set up the re-ranking compressor
                compressor = LLMChainExtractor.from_llm(llm)
                compression_retriever = ContextualCompressionRetriever(
                    base_compressor=compressor, base_retriever=retriever
                )

                # 2. Set up the QA chain
                qa_chain = RetrievalQA.from_chain_type(
                    llm=llm,
                    chain_type="stuff",
                    retriever=compression_retriever,
                    return_source_documents=True,
                )

                # 3. Invoke the chain and display the response
                response = qa_chain.invoke({"query": user_question})
                st.write("### Answer")
                st.write(response["result"])

                with st.expander("Show source documents"):
                    st.write(response["source_documents"])

            except Exception as e:
                st.error(f"An error occurred: {e}")
                st.exception(e)

def main():
    """Main function to run the Streamlit application."""
    st.set_page_config(page_title="Chat with your PDF", layout="wide")
    st.title("📚 Advanced Chat with Your Book")
    st.markdown(
        "This app uses advanced RAG techniques for more accurate answers. "
        "Upload a PDF to get started."
    )

    load_dotenv()
    azure_endpoint, azure_api_key = get_azure_openai_config()

    if not azure_endpoint or not azure_api_key:
        st.error(
            "Azure OpenAI configuration not found. Please set AZURE_OPENAI_ENDPOINT and AZURE_OPENAI_API_KEY in your .env file."
        )
        return

    # Initialize LLM and Embeddings using cached functions
    llm = get_llm(azure_endpoint, azure_api_key)
    embeddings = get_embeddings(azure_endpoint, azure_api_key)

    # File uploader
    uploaded_file = st.file_uploader(
        "Upload your PDF book to create the retriever", type="pdf"
    )

    if uploaded_file:
        try:
            # Use a temporary file to get a stable path for caching
            with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp_file:
                tmp_file.write(uploaded_file.getbuffer())
                tmp_file_path = tmp_file.name
            
            # Load, split, and build the retriever using cached functions
            with st.spinner("Processing your document... This may take a moment."):
                docs = load_and_split_docs(tmp_file_path)
                retriever = build_retriever(docs, embeddings)

            st.success("Document processed successfully! You can now ask questions.")
            
            # Handle the QA logic
            handle_question_answering(llm, retriever)

        except Exception as e:
            st.error(f"An error occurred during file processing: {e}")
            st.exception(e)
        finally:
            # Clean up the temporary file
            if "tmp_file_path" in locals() and os.path.exists(tmp_file_path):
                os.remove(tmp_file_path)
    else:
        st.info("Please upload a PDF file to begin.")


if __name__ == "__main__":
    main()
