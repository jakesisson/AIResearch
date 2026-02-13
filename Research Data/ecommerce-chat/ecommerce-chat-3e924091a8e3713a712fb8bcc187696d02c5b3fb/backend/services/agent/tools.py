from typing import Optional

from chroma.client import chroma_client
from langchain_core.tools import tool


@tool
def get_product_info(query: str, filename: Optional[str] = None) -> str:
    """
    Busca informações sobre um produto no banco de dados

    Args:
        query: A consulta para buscar informações sobre o produto
        filename: O nome do arquivo onde o produto está localizado

    Returns:
        Uma string com o resultado da busca
    """
    collection = chroma_client.get_or_create_collection()

    where = {"filename": filename} if filename else None

    results = collection.query(
        query_texts=[query],
        n_results=2,  # Retorna apenas 2 documentos
        where=where,
    )

    if results["documents"] and results["documents"][0]:
        return "\n\n".join(results["documents"][0])

    return "Nenhum produto encontrado."


tools = [get_product_info]
