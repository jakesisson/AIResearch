# Kisan Dost AI - Setup Guide

This guide provides step-by-step instructions to set up and run the Kisan Dost AI application on a Windows machine. This guide is intended for a user with intermediate experience with the command line.

## 1. System Architecture Overview

Before you begin, it's helpful to understand the components of the system:

- **Backend Server:** A Python web server using the **FastAPI** framework. It orchestrates the entire application.
- **Frontend UI:** A single, self-contained **HTML file** (`index.html`) that provides the chat interface in your browser.
- **AI Engine (LLM):** The system is designed to use a local Large Language Model (LLM) run through **Ollama**. The required model is `mixtral`.
- **Knowledge Base (RAG):** A Retrieval-Augmented Generation system powered by **ChromaDB**. It uses local agricultural documents (in `rag_data/`) to provide context-specific answers.
- **Image Analysis:** Uses the **Google Gemini Vision API** to diagnose plant diseases from uploaded images.
- **Voice Capabilities:**
    - **Speech-to-Text:** Uses OpenAI's **Whisper** model to transcribe your voice.
    - **Text-to-Speech:** Uses the **Piper TTS** engine to speak the AI's responses.
- **Long-Term Memory:** A separate **ChromaDB** instance is used to give the AI a memory of your past conversations for a personalized experience.

---

## 2. Prerequisites

Ensure you have the following software installed on your Windows machine:

- **Git:** For cloning the project repository. You can download it from [git-scm.com](https://git-scm.com/).
- **Python 3.9+:** Make sure Python is installed and the `python` and `pip` commands are accessible from your command line (added to PATH). You can download it from the [Microsoft Store](https://www.microsoft.com/store/productId/9P7QFQMJRFP7) or [python.org](https://www.python.org/).

---

## 3. Step-by-Step Installation

Follow these steps in a command-line terminal (like Command Prompt or PowerShell).

### Step 3.1: Clone the Repository

First, clone the project code from its repository to your local machine.

```bash
git clone <repository_url>
cd <repository_directory>
```
*(Replace `<repository_url>` and `<repository_directory>` with the actual URL and folder name)*

### Step 3.2: Set Up the Python Environment

It's highly recommended to use a virtual environment to keep the project's dependencies isolated.

```bash
# Create a virtual environment named 'venv'
python -m venv venv

# Activate the virtual environment
venv\Scripts\activate

# Install all the required Python packages
pip install -r requirements.txt
```
**Note:** This installation may take a considerable amount of time, as it includes large libraries like PyTorch.

### Step 3.3: Set Up Ollama and Download the LLM

The AI requires a locally running Ollama server.

1.  **Download and Install Ollama:** Go to [ollama.com](https://ollama.com/) and download the installer for Windows. Run it to install the Ollama server.
2.  **Run Ollama:** The server should start automatically after installation. You will see an icon in your system tray.
3.  **Download the `mixtral` Model:** Open a new command prompt and run the following command to download the required LLM. This will also take some time.
    ```bash
    ollama pull mixtral
    ```

### Step 3.4: Set Up Google Gemini API Key

For the image analysis feature to work, you need a Google Gemini API key.

1.  **Get a Key:** Visit [makersuite.google.com/app/apikey](https://makersuite.google.com/app/apikey) to create your free API key.
2.  **Set Environment Variable:** You need to set this key as an environment variable. In your command prompt (the one with the virtual environment activated), run:
    ```bash
    set GOOGLE_API_KEY="YOUR_API_KEY_HERE"
    ```
    *(Replace `YOUR_API_KEY_HERE` with your actual key)*. **Important:** You will need to do this every time you open a new terminal to run the application.

### Step 3.5: Download the Piper TTS Voice Model

The text-to-speech feature requires a voice model that is not included in the repository.

1.  **Create the Directory:** In the project's root folder, create a new folder named `piper_models`.
2.  **Download the Model Files:** Download the following two files and place them inside the `piper_models` directory:
    - **ONNX Model File:** [en_US-lessac-medium.onnx](https://huggingface.co/rhasspy/piper-voices/resolve/main/en/en_US/lessac/medium/en_US-lessac-medium.onnx)
    - **JSON Config File:** [en_US-lessac-medium.onnx.json](https://huggingface.co/rhasspy/piper-voices/resolve/main/en/en_US/lessac/medium/en_US-lessac-medium.onnx.json)

### Step 3.6: Build the Knowledge Base

You need to run a script that processes the local documents in `rag_data/` and builds the vector database for the RAG system.

In your terminal (with the virtual environment still active), run this command:
```bash
python -m tools.knowledge_base
```
You should see output indicating that documents are being loaded and a `chroma_db` directory will be created in your project folder.

---

## 4. Running the Application

You are now ready to start the server.

1.  **Start the FastAPI Server:** In your terminal (with the virtual environment active and the API key set), run:
    ```bash
    uvicorn main:app --reload
    ```
2.  **Access the UI:** Once the server is running (you'll see a message like `Uvicorn running on http://127.0.0.1:8000`), open your web browser and go to:
    [http://127.0.0.1:8000/](http://127.0.0.1:8000/)

You should see the Kisan Dost AI chat interface and can now proceed to testing. The application will not be accessible until you visit the `/` path.
