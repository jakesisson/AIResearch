import os
import base64
from PIL import Image
import io
from prompts import GEMINI_DIAGNOSIS_PROMPT
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage

# Check for Azure OpenAI configuration
AZURE_OPENAI_ENDPOINT = os.getenv("AZURE_OPENAI_ENDPOINT")
AZURE_OPENAI_API_KEY = os.getenv("AZURE_OPENAI_API_KEY")
AZURE_OPENAI_API_VERSION = os.getenv("AZURE_OPENAI_API_VERSION", "2025-01-01-preview")
AZURE_OPENAI_VISION_DEPLOYMENT = os.getenv("AZURE_OPENAI_API_VISION_DEPLOYMENT") or os.getenv("AZURE_OPENAI_API_DEPLOYMENT") or "gpt-4-vision"

# Legacy Gemini support (fallback if Azure OpenAI not configured)
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
USE_GEMINI = GOOGLE_API_KEY and not (AZURE_OPENAI_ENDPOINT and AZURE_OPENAI_API_KEY)

if USE_GEMINI:
    try:
        import google.generativeai as genai
        genai.configure(api_key=GOOGLE_API_KEY)
        print("Using Google Gemini for image diagnosis (fallback)")
    except Exception as e:
        print(f"Error configuring Gemini API: {e}")
else:
    if not AZURE_OPENAI_ENDPOINT or not AZURE_OPENAI_API_KEY:
        print("Warning: Neither Azure OpenAI nor Google Gemini configured for image diagnosis")


def get_image_diagnosis(image_bytes: bytes) -> str:
    """
    Analyzes an image of a plant using Azure OpenAI Vision API (or Google Gemini as fallback).

    Args:
        image_bytes: The image file in bytes.

    Returns:
        A string containing the diagnosis from the model, or an error message.
    """
    # Use Azure OpenAI if configured
    if AZURE_OPENAI_ENDPOINT and AZURE_OPENAI_API_KEY:
        try:
            # Prepare the image
            img = Image.open(io.BytesIO(image_bytes))
            
            # Convert image to base64 for Azure OpenAI
            buffered = io.BytesIO()
            img.save(buffered, format="PNG")
            img_base64 = base64.b64encode(buffered.getvalue()).decode()
            
            # Initialize Azure OpenAI Vision model
            vision_llm = ChatOpenAI(
                azure_endpoint=AZURE_OPENAI_ENDPOINT,
                azure_deployment=AZURE_OPENAI_VISION_DEPLOYMENT,
                api_version=AZURE_OPENAI_API_VERSION,
                api_key=AZURE_OPENAI_API_KEY,
                temperature=0,
            )
            
            # Prepare message with image
            message = HumanMessage(
                content=[
                    {"type": "text", "text": GEMINI_DIAGNOSIS_PROMPT},
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:image/png;base64,{img_base64}"
                        }
                    }
                ]
            )
            
            print("--- Calling Azure OpenAI Vision API for image diagnosis ---")
            response = vision_llm.invoke([message])
            print("--- Azure OpenAI Vision API response received ---")
            
            if response and hasattr(response, 'content'):
                return response.content.strip()
            else:
                return "Error: Received an empty response from the diagnosis model."
                
        except Exception as e:
            print(f"An error occurred during Azure OpenAI image diagnosis: {e}")
            return f"Error: An unexpected error occurred while analyzing the image. Details: {e}"
    
    # Fallback to Gemini if Azure OpenAI not configured
    elif USE_GEMINI:
        try:
            # Prepare the image for the model
            img = Image.open(io.BytesIO(image_bytes))

            # Initialize the Gemini model
            # Using gemini-1.5-flash as it's faster and more cost-effective for this use case
            model = genai.GenerativeModel('gemini-1.5-flash')

            # Prepare the content for the API call
            prompt_parts = [
                GEMINI_DIAGNOSIS_PROMPT,
                img,
            ]

            # Generate content
            print("--- Calling Gemini API for image diagnosis ---")
            response = model.generate_content(prompt_parts)
            print("--- Gemini API response received ---")

            # Check if the response has text
            if response and response.text:
                return response.text.strip()
            else:
                return "Error: Received an empty response from the diagnosis model."

        except Exception as e:
            print(f"An error occurred during image diagnosis: {e}")
            return f"Error: An unexpected error occurred while analyzing the image. Details: {e}"
    else:
        return "Error: Neither Azure OpenAI nor Google Gemini API Key is configured."
