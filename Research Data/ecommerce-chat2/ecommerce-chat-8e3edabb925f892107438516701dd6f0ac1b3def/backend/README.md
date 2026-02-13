# Backend - Motor de Vendas Conversacional

Backend do projeto de chatbot de IA para e-commerce construído com FastAPI, LangChain e ChromaDB.

## 🚀 Configuração do Ambiente

### 1. Ambiente Virtual
O projeto usa `uv` como gerenciador de pacotes. 

### 2. Dependências
As dependências principais incluem:
- **FastAPI**: Framework web moderno e de alta performance
- **LangChain**: Framework para desenvolvimento de aplicações com LLM
- **ChromaDB**: Banco de dados vetorial para busca semântica
- **Uvicorn**: Servidor ASGI para produção
- **Python-dotenv**: Gerenciamento de variáveis de ambiente

### 3. Instalação

```bash
# Instalar dependências com uv
uv sync

# Ou usando pip com requirements.txt
pip install -r requirements.txt
```

### 4. Configuração de Ambiente

1. Copie o arquivo de exemplo:
```bash
cp .env.example .env
```

2. Configure suas chaves de API no arquivo `.env`:
   - Para Google Gemini: `GEMINI_API_KEY`
   - Para Groq: `GROQ_API_KEY`

### 5. Execução

```bash
# Desenvolvimento
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Produção
uvicorn main:app --host 0.0.0.0 --port 8000
```

## 🏗️ Arquitetura

- **FastAPI**: API REST para comunicação com frontend
- **LangChain**: Orquestração do LLM e lógica de RAG
- **ChromaDB**: Armazenamento de embeddings de produtos
- **LLM**: Google Gemini ou Groq (Llama 3)

## 📁 Estrutura de Pastas

```
backend/
├── main.py              # Entrada da aplicação
├── app/
│   ├── api/             # Rotas da API
│   ├── core/            # Configurações e utilitários
│   ├── models/          # Modelos Pydantic
│   ├── services/        # Lógica de negócio
│   └── db/              # Configuração do ChromaDB
├── requirements.txt     # Dependências Python
├── pyproject.toml      # Configuração do projeto UV
└── .env.example        # Variáveis de ambiente
```

## 🔧 Desenvolvimento

O projeto segue as melhores práticas de desenvolvimento Python:
- Type hints
- Docstrings
- Testes automatizados
- Linting com ruff
- Formatação automática

## 🌐 API Endpoints

- `GET /`: Health check
- `POST /chat`: Endpoint principal do chatbot
- `GET /health`: Status da aplicação
- `GET /docs`: Documentação Swagger automática
