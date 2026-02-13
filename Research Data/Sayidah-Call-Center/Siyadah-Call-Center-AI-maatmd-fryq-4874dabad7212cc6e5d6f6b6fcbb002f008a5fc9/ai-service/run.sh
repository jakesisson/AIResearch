#!/bin/bash

# Siyadah AI FastAPI Microservice Runner
echo "🚀 Starting Siyadah AI FastAPI Microservice..."

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "📦 Creating Python virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "📥 Installing dependencies..."
pip install -r requirements.txt

# Set environment variables
export PYTHONPATH="${PYTHONPATH}:$(pwd)"
export OPENAI_API_KEY="${OPENAI_API_KEY}"

# Start FastAPI server
echo "🎯 Starting FastAPI server on port 8001..."
cd app && python -m uvicorn main:app --host 0.0.0.0 --port 8001 --reload

echo "✅ Siyadah AI Microservice is running on http://localhost:8001"