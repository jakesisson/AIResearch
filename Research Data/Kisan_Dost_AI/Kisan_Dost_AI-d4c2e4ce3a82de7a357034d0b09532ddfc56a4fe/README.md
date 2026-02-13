# Kisan Dost AI - Personal Farming Assistant

## 1. Project Overview

Kisan Dost AI is a prototype for an AI-powered personal farming assistant designed to help smallholder farmers in Kerala. It acts as a digital companion, providing personalized, timely, and context-aware agricultural advice through a conversational interface that supports both text and voice.

This repository contains the complete backend service and a simple frontend, built with a local-first approach using Python, LangChain, and FastAPI.

### 1.1. Architecture

The chatbot is built as a stateful, tool-using agent. The conversational flow is managed by a **LangGraph** graph that can dynamically select a persona and use a variety of tools to answer farmer's queries.

For a visual representation of the agent's logic, please see the [chatbot_flow.svg](chatbot_flow.svg) file.

![Chatbot Flow](chatbot_flow.svg)

### 1.2. Project Status

This summary breaks down our progress against the core features outlined in the original problem statement.

#### Implemented Features (Current Prototype)

- **Natural Language Query Handling (Voice & Text):** The system is fully equipped for voice interaction using local **Whisper** for speech-to-text and **Piper TTS** for high-quality speech synthesis. The core language understanding is handled by a local **Ollama (Mixtral)** model.
- **AI-Powered Knowledge Engine:** A flexible **RAG (Retrieval-Augmented Generation)** system allows the agent to answer questions using a dedicated knowledge base of agricultural documents.
- **Context Awareness & Personalization:** A sophisticated **Long-Term Memory** feature allows the agent to remember key user details across conversations. It features an intelligent **Memory Consolidation** step that automatically refines its memory after each chat.
- **Escalation System:** A functional **Fallback Ticket System** creates a support ticket when the agent cannot answer a query. An `admin.html` page provides a dashboard to view these tickets.

#### Future Roadmap (Next Steps)

- **Multimodal Input:** Implement image uploads for diagnosing crop diseases.
- **Full Malayalam Language Support:** Integrate a Malayalam TTS voice and test performance.
- **Integrate Production Farmer Profiles:** Connect the agent to a central farmer database.
- **User Feedback & Learning Loop:** Add a feedback mechanism to help fine-tune the agent.

## 2. User Manual: Local Setup and Installation

This guide provides detailed steps to set up and run the entire project on your local machine.

### Step 2.1: Install System Dependencies

The voice features rely on underlying system libraries for audio processing. You must install these first.

**On Debian/Ubuntu:**
```bash
# Updates package list and installs PortAudio (for audio I/O) and FFmpeg (for audio conversion).
sudo apt-get update
sudo apt-get install portaudio19-dev ffmpeg
```

**On macOS (using Homebrew):**
```bash
# Installs PortAudio and FFmpeg using Homebrew.
brew install portaudio ffmpeg
```

### Step 2.2: Set Up Python Environment

It is highly recommended to use a Python virtual environment to manage project dependencies without affecting your system's global Python installation.

```bash
# Create a new virtual environment named 'venv'
python -m venv venv

# Activate the virtual environment
# On macOS/Linux:
source venv/bin/activate

# On Windows:
# venv\Scripts\activate
```

Once activated, your terminal prompt will usually change to show `(venv)`.

### Step 2.3: Install Python Packages

Install all required Python libraries using the provided `requirements.txt` file.

```bash
# This command reads every line in the file and installs the specified version of each package.
pip install -r requirements.txt
```

### Step 2.4: Download Local AI Models

This project runs entirely locally and requires three different AI models.

**A. The Language Model (Ollama):**
1.  Download and install **[Ollama](https://ollama.com/)** for your operating system.
2.  After installation, run the Ollama application. It will run as a background server.
3.  Pull the `mixtral` model by opening your terminal and running:
    ```bash
    ollama pull mixtral
    ```
    This will download the model (several gigabytes) and make it available to the Ollama server.

**B. The Speech-to-Text Model (Whisper):**
- No manual action is needed here. The `openai-whisper` Python library will automatically download the small 'base' model the first time the application runs the transcription service.

**C. The Text-to-Speech Model (Piper):**
1.  First, create a directory in the project folder to store the voice files:
    ```bash
    mkdir piper_models
    ```
2.  Next, download the voice model and its configuration file into that directory. We use `wget` here, but you can also download these from your browser.
    ```bash
    # Download the main voice model file (.onnx)
    wget https://huggingface.co/rhasspy/piper-voices/resolve/main/en/en_US/lessac/medium/en_US-lessac-medium.onnx -O piper_models/en_US-lessac-medium.onnx

    # Download the model's config file (.json)
    wget https://huggingface.co/rhasspy/piper-voices/resolve/main/en/en_US/lessac/medium/en_US-lessac-medium.onnx.json -O piper_models/en_US-lessac-medium.onnx.json
    ```

## 3. How to Use the Application

### Step 3.1: Build the Knowledge Base (One-Time Setup)

Before you can ask the agent questions about Keralan agriculture, you must first build its knowledge base. This process reads the markdown files in the `rag_data/` directory and indexes them in a local vector store.

Run the following command from the root of the project directory:
```bash
# The -m flag tells Python to run the 'knowledge_base' module as a script.
python -m tools.knowledge_base
```
This will create a `chroma_db/` directory. You only need to do this once. If you ever add or change the files in `rag_data/`, you should delete the `chroma_db/` directory and run this command again.

### Step 3.2: Run the Application Server

The `main.py` file contains the web server that powers the entire application. To run it, use `uvicorn`, a fast ASGI server.

```bash
# This command tells uvicorn to run the 'app' object from the 'main.py' file.
# The --reload flag makes the server automatically restart when you change the code.
uvicorn main:app --reload
```

If everything is set up correctly, you will see output indicating the server is running on `http://127.0.0.1:8000`.

### Step 3.3: Access the Chatbot

1.  Open your web browser.
2.  Navigate to **`http://127.0.0.1:8000/index.html`** to use the main voice-enabled chatbot.
3.  Your browser will likely ask for permission to use your microphone. You must **allow** this for the voice features to work.
4.  Click the microphone button to start and stop recording.
5.  To view the support ticket dashboard, navigate to `http://127.0.0.1:8000/admin`.
