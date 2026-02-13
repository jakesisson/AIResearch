#!/bin/bash
# Script to start Langfuse after Docker is installed

echo "🐳 Starting Langfuse..."
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running!"
    echo ""
    echo "Please:"
    echo "1. Open Docker Desktop from Applications"
    echo "2. Wait for Docker to start (whale icon in menu bar)"
    echo "3. Run this script again"
    exit 1
fi

echo "✅ Docker is running"
echo ""

# Start Langfuse
cd /Users/jsisson/Research
docker compose -f docker-compose.langfuse.yml up -d

echo ""
echo "⏳ Waiting for Langfuse to start (30 seconds)..."
sleep 30

# Check if containers are running
if docker ps | grep -q langfuse; then
    echo ""
    echo "✅ Langfuse is running!"
    echo ""
    echo "🌐 Open in browser: http://localhost:3000"
    echo ""
    echo "Next steps:"
    echo "1. Create an account (first time only)"
    echo "2. Go to Settings → API Keys"
    echo "3. Copy Public Key and Secret Key"
    echo "4. Add them to master.env"
else
    echo ""
    echo "⚠️  Langfuse containers may still be starting..."
    echo "Check status with: docker ps"
    echo "View logs with: docker logs langfuse_server"
fi
