import hashlib
from typing import List

from pypdf import PdfReader


def generate_document_id(path: str) -> str:
    reader = PdfReader(path)
    text = "".join(page.extract_text() for page in reader.pages)
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


def split_pdf(path: str, chunk_size: int = 1000) -> List[str]:
    """Divide o PDF em chunks para RAG"""
    reader = PdfReader(path)

    # Extrair texto de todas as páginas
    full_text = ""
    for page in reader.pages:
        full_text += page.extract_text() + "\n"

    # Dividir em chunks por palavras
    words = full_text.split()
    chunks = []

    current_chunk = []
    current_size = 0

    for word in words:
        current_chunk.append(word)
        current_size += len(word) + 1  # +1 para o espaço

        if current_size >= chunk_size:
            chunks.append(" ".join(current_chunk))
            current_chunk = []
            current_size = 0

    # Adicionar último chunk se não estiver vazio
    if current_chunk:
        chunks.append(" ".join(current_chunk))

    return chunks
