# Kisan Dost AI - Testing Guide

This guide provides a set of tests to verify that your installation of the Kisan Dost AI is working correctly. Follow these steps after you have completed the `SETUP_GUIDE.md` and the application is running.

## Pre-Test Checklist

1.  Is the `uvicorn` server running in your terminal?
2.  Is the Ollama server running?
3.  Have you opened the user interface in your browser at [http://127.0.0.1:8000/](http://127.0.0.1:8000/)?

If all checks are "yes", you can proceed with the tests.

---

## Test Cases

Perform these tests in the chat UI in your browser.

### Test 1: Basic Conversation

This test checks if the connection to the Ollama LLM is working.

1.  **Action:** In the text input box, type `Hello, who are you?` and press Enter.
2.  **Expected Result:** The AI should respond with a greeting, introducing itself as either "The Experienced Agronomist" or "The Practical Problem-Solver". The response should be quick and fluent.

### Test 2: Knowledge Base (RAG)

This test checks if the AI can retrieve information from the local knowledge base you created.

1.  **Action:** Ask a specific question that can only be answered by the documents in the `rag_data/` folder. For example:
    `What are the government schemes for farmers in Kerala?`
2.  **Expected Result:** The AI should provide a detailed answer listing government schemes. The response should be based on the content of `kerala_govt_schemes.md` and not just generic knowledge. This confirms that the RAG system is working.

### Test 3: Image Analysis (Gemini API)

This test checks if the connection to the Google Gemini API is working and if the image diagnosis feature is functional.

1.  **Action:**
    a. Find a clear picture of a plant with a common disease (e.g., search for "powdery mildew on a leaf"). Save it to your computer.
    b. In the chat UI, click the "🖼️" (image) button and select the image you saved.
    c. You can add a text query like `What is wrong with my plant?` or send the image by itself.
2.  **Expected Result:** The AI should respond with a structured diagnosis, including the disease name, description, severity, and treatment options, as described in the `GEMINI_DIAGNOSIS_PROMPT`. This confirms the Gemini API key is set up correctly and the feature is working.

### Test 4: Language Translation (Malayalam)

This test checks the full-cycle translation feature.

1.  **Action:** Type a query in Malayalam. For example:
    `എൻ്റെ വാഴയുടെ ഇലകൾ മഞ്ഞളിക്കുന്നു, ഞാൻ എന്തുചെയ്യണം?` (My banana leaves are yellowing, what should I do?)
2.  **Expected Result:** The AI should provide a helpful response written entirely in **Malayalam**. This confirms that the system can detect the source language, translate it to English for processing, and translate the final answer back to Malayalam.

### Test 5: Voice-to-Text (Whisper)

This test checks if the microphone input and Whisper transcription are working.

1.  **Action:**
    a. Click the "🎤" (microphone) button. It should turn red, and the status bar should say "Status: Listening...".
    b. Your browser may ask for permission to use your microphone. Click "Allow".
    c. Speak a clear sentence, for example: "What is the best fertilizer for rice?".
    d. Click the "🎤" button again to stop recording.
2.  **Expected Result:** Your spoken query should appear in the chat as a user message, and the AI should respond to it. This confirms that audio recording and transcription are working.

### Test 6: Text-to-Speech (Piper)

This test checks if the Piper TTS model is working.

1.  **Action:** After the AI responds to any text query (like in Test 1 or 2), wait a moment.
2.  **Expected Result:** You should hear the AI's response spoken out loud through your computer's speakers. The status bar will briefly say "Status: Speaking...". This confirms that the Piper model was downloaded correctly and is being used by the system.

### Test 7: Long-Term Memory

This test checks if the AI can remember facts about you across multiple interactions.

1.  **First Interaction:**
    *   **Action:** Type `My name is Rohan and I primarily grow coconuts.`
    *   **AI Response:** The AI will acknowledge this.
2.  **Clear the Session (Simulate a new day):**
    *   **Action:** Refresh your browser window. This will start a new chat session but the AI's long-term memory will persist. *(Note: The UI will show a new session ID, but the backend memory is linked to the original session ID used in this test)*.
3.  **Second Interaction:**
    *   **Action:** Ask a follow-up question: `What was the main crop I told you I grow?`
4.  **Expected Result:** The AI should correctly answer "coconuts". This confirms that the memory consolidation and retrieval system is working. *(Note: This test is the most complex and relies on the `consolidate_memories` function working correctly after the first interaction)*.

---

If all these tests pass, your installation is fully functional!
