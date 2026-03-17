# ADAM Trade AI - Backend Server

Backend API service for the ADAM Trade AI platform. Provides a secure, scalable API that interfaces with Ollama for AI-powered educational features.

## Features

- 🔒 **Secure API** with CORS, Helmet security headers, and rate limiting
- 🤖 **Ollama Integration** for local AI model inference
- 🚀 **Production Ready** with health checks and error handling
- 📊 **Rate Limiting** to prevent abuse (100 req/15min general, 20 req/15min for AI)
- 🌍 **CORS Support** for frontend integration
- 📝 **Comprehensive Logging** for debugging and monitoring

## API Endpoints

### Health & Status

**GET /**
- Health check endpoint
- Returns: Service status and version

**GET /api/health**
- Ollama connection status
- Returns: Connection status and available models

**GET /api/models**
- List available Ollama models
- Returns: Array of installed models

### AI Generation

**POST /api/generate**
- Generate AI responses
- Body: `{ model: string, prompt: string, system?: string }`
- Rate limit: 20 requests per 15 minutes
- Max prompt length: 4000 characters

**POST /api/chat**
- Conversational AI chat
- Body: `{ model: string, messages: Array<{role: string, content: string}> }`
- Rate limit: 20 requests per 15 minutes

## Environment Variables

Create a `.env` file (see `.env.example`):

```env
PORT=3000
OLLAMA_URL=http://localhost:11434
ALLOWED_ORIGINS=*
NODE_ENV=production
```

## Local Development

### Prerequisites
- Node.js 18+
- Ollama installed locally

### Setup

```bash
# Install dependencies
npm install

# Start Ollama (in separate terminal)
ollama serve

# Pull required model
ollama pull mistral

# Start the server
npm start

# Or with auto-reload
npm run dev
```

The server will run on `http://localhost:3000`

## Deployment to Railway

### Option 1: Using Railway CLI

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Deploy
railway up
```

### Option 2: Using GitHub Integration

1. Push code to GitHub repository
2. Go to [railway.app](https://railway.app)
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your backend repository
5. Railway will auto-detect the Dockerfile and deploy

### Post-Deployment

1. Wait for Ollama model to download (first deployment takes 5-10 minutes)
2. Copy your Railway URL (e.g., `https://your-app.up.railway.app`)
3. Update frontend to use this URL instead of `http://localhost:11434`

## Docker Deployment

```bash
# Build
docker build -t adam-trade-ai-backend .

# Run
docker run -p 3000:3000 adam-trade-ai-backend

# With environment variables
docker run -p 3000:3000 \
  -e ALLOWED_ORIGINS="https://your-frontend.netlify.app" \
  adam-trade-ai-backend
```

## Security Considerations

- ✅ Rate limiting prevents abuse
- ✅ CORS configured for trusted origins
- ✅ Helmet security headers enabled
- ✅ Request validation (model names, prompt length)
- ✅ No sensitive data in responses
- ⚠️ Consider adding authentication for production use
- ⚠️ Update `ALLOWED_ORIGINS` to your actual frontend URL

## Monitoring

Check service health:
```bash
curl https://your-app.up.railway.app/api/health
```

Expected response:
```json
{
  "status": "connected",
  "models": [...],
  "ollamaUrl": "http://localhost:11434"
}
```

## Troubleshooting

**Ollama not responding:**
- Check if Ollama service is running
- Verify `OLLAMA_URL` environment variable
- Check Docker logs: `docker logs <container-id>`

**Model not found:**
- Ensure model is pulled: `ollama pull mistral`
- Check available models: `GET /api/models`

**Rate limit errors:**
- Wait 15 minutes for limit reset
- Adjust rate limits in `server.js` if needed

## Cost Estimation (Railway)

- **Startup Plan:** $5/month for 500 hours
- **Developer Plan:** $10/month for 1000 hours
- Estimated usage: ~$10-20/month for moderate traffic

## Support

For issues, check:
- Railway logs: `railway logs`
- GitHub Issues: [Repository Issues](https://github.com/Geppix140269/adam-trade-ai-backend/issues)

## License

MIT

---
*Last updated: 2026-03-17*
