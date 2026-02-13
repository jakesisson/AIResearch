#!/bin/bash

# FastAPI AI Microservice Installation Script
# For Siyadah AI Platform

echo "🚀 Installing FastAPI AI Microservice for Siyadah Platform..."

# Check Python installation
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is required but not installed."
    echo "Please install Python 3.8+ and try again."
    exit 1
fi

echo "✅ Python 3 found: $(python3 --version)"

# Create virtual environment
echo "📦 Creating Python virtual environment..."
python3 -m venv venv

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Upgrade pip
echo "⬆️ Upgrading pip..."
pip install --upgrade pip

# Install dependencies
echo "📥 Installing FastAPI dependencies..."
pip install -r requirements.txt

# Verify installation
echo "🔍 Verifying installation..."
python -c "import fastapi; print('✅ FastAPI installed successfully')"
python -c "import uvicorn; print('✅ Uvicorn installed successfully')"
python -c "import openai; print('✅ OpenAI library installed successfully')"

echo ""
echo "✅ FastAPI AI Microservice installation completed!"
echo ""
echo "📋 Next steps:"
echo "1. Set your OpenAI API key: export OPENAI_API_KEY='your-key-here'"
echo "2. Start the service: ./run.sh"
echo "3. Test the service: curl http://localhost:8001/health"
echo ""
echo "🔗 Service will be available at: http://localhost:8001"
echo "📚 API documentation at: http://localhost:8001/docs"