# 🤖 Siyadah AI FastAPI Microservice

FastAPI microservice for advanced AI processing within the Siyadah AI platform.

## 🏗️ Architecture

```
Express.js (Port 5000)  ←→  FastAPI Microservice (Port 8001)
     ↓                              ↓
MongoDB Atlas                   OpenAI GPT-4o
VoIP Integration               AI Processing Engine
```

## 🚀 Quick Start

### 1. Installation
```bash
cd ai-service
chmod +x install.sh
./install.sh
```

### 2. Environment Setup
```bash
export OPENAI_API_KEY="your-openai-key"
```

### 3. Start Service
```bash
./run.sh
```

### 4. Verify Installation
```bash
curl http://localhost:8001/health
```

## 📡 API Endpoints

### Core AI Processing
- `POST /api/v1/ai/respond` - Process AI prompts
- `POST /api/v1/ai/analyze` - Business data analysis  
- `POST /api/v1/ai/translate` - Arabic/English translation
- `GET /api/v1/ai/status` - Service capabilities

### Health & Monitoring
- `GET /` - Service information
- `GET /health` - Health check

## 🔗 Express.js Integration

The FastAPI microservice integrates with Express.js through dedicated routes:

```javascript
// Available in Express.js at:
POST /api/microservice/ai/process
POST /api/microservice/ai/analyze  
POST /api/microservice/ai/translate
POST /api/microservice/ai/business-insights
POST /api/microservice/ai/chat
GET  /api/microservice/ai/health
```

## 💡 Usage Examples

### AI Chat Processing
```bash
curl -X POST http://localhost:5000/api/microservice/ai/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "كيف يمكنني تحسين مبيعاتي؟", "context": "شركة تقنية"}'
```

### Business Analysis
```bash
curl -X POST http://localhost:5000/api/microservice/ai/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "data": {"revenue": 150000, "customers": 45},
    "analysis_type": "performance"
  }'
```

### Translation
```bash
curl -X POST http://localhost:5000/api/microservice/ai/translate \
  -H "Content-Type: application/json" \
  -d '{
    "text": "مرحباً بكم في منصة سيادة",
    "from_lang": "ar",
    "to_lang": "en"
  }'
```

## 🔧 Configuration

### Environment Variables
- `OPENAI_API_KEY` - OpenAI API key (required)
- `AI_MICROSERVICE_URL` - Service URL (default: http://localhost:8001)

### Service Settings
- Port: 8001
- CORS: Enabled for localhost:5000
- Timeout: 30 seconds
- Max Tokens: 4000

## 🛡️ Fallback System

If FastAPI microservice is unavailable, Express.js automatically falls back to:
- Direct OpenAI integration
- Basic analysis functions
- Simple translations

## 📊 Monitoring

### Health Check Response
```json
{
  "status": "healthy",
  "service": "ai-microservice"
}
```

### Service Status
```json
{
  "status": "operational",
  "capabilities": [
    "Arabic text processing",
    "Business data analysis",
    "Translation services"
  ],
  "languages_supported": ["ar", "en"]
}
```

## 🔄 Development

### File Structure
```
ai-service/
├── app/
│   ├── main.py          # FastAPI application
│   ├── routes.py        # API routes
│   ├── ai_engine.py     # AI processing logic
│   └── utils.py         # Utility functions
├── requirements.txt     # Python dependencies
├── install.sh          # Installation script
├── run.sh              # Startup script
└── README.md           # This file
```

### Adding New Features
1. Add route in `app/routes.py`
2. Implement logic in `app/ai_engine.py`
3. Update Express.js client in `server/ai-microservice-client.ts`
4. Add route in `server/routes/ai-microservice.ts`

## 🐛 Troubleshooting

### Common Issues

**Service won't start:**
```bash
# Check Python version
python3 --version

# Reinstall dependencies
pip install -r requirements.txt
```

**Connection refused:**
```bash
# Check if service is running
curl http://localhost:8001/health

# Check logs
tail -f logs/fastapi.log
```

**OpenAI errors:**
```bash
# Verify API key
echo $OPENAI_API_KEY

# Test direct connection
python -c "import openai; print('OK')"
```

## 📈 Performance

- Average response time: 200-500ms
- Concurrent requests: Up to 100
- Memory usage: ~50MB
- CPU usage: ~5% idle, ~30% under load

## 🔐 Security

- CORS restricted to localhost:5000
- No API key exposure in responses
- Request validation with Pydantic
- Error sanitization

## 📝 Logs

Service logs are available in:
- Console output (development)
- `/var/log/siyadah-ai-microservice.log` (production)

## 🚀 Production Deployment

For production deployment:
1. Use environment-specific configuration
2. Set up process manager (systemd/supervisor)
3. Configure reverse proxy (nginx)
4. Enable SSL/TLS
5. Set up monitoring and alerting