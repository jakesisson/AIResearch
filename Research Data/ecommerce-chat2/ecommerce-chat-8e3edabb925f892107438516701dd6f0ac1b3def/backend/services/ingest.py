from pathlib import Path

from chroma.client import chroma_client
from utils.documents import generate_document_id, split_pdf


def load_pdf_documents(pdf_dir: str):
    """Carrega documentos PDF para o ChromaDB"""
    pdf_paths = [str(p) for p in Path(pdf_dir).glob("*.pdf")]
    collection = chroma_client.get_or_create_collection()

    for path in pdf_paths:
        document_id = generate_document_id(path)
        filename = Path(path).name

        existing = collection.get(where={"document_id": document_id}, limit=1)

        if existing["ids"]:
            print(f"Document {filename} already exists")
            continue

        try:
            docs = split_pdf(path)

            ids = [f"{document_id}-chunk-{i}" for i in range(len(docs))]
            metadata = [
                {
                    "document_id": document_id,
                    "chunk_index": i,
                    "filename": filename,
                    "source": path,
                }
                for i in range(len(docs))
            ]

            collection.add(documents=docs, ids=ids, metadatas=metadata)

            print(
                f"Document {document_id} inserted successfully with filename {filename}"
            )

        except Exception as e:
            print(f"Error inserting document {filename}: {e}")
