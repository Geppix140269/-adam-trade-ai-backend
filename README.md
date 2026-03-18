# ADAM Trade AI - Backend Server (OpenAI Version)

Lightweight backend API for the ADAM Trade AI platform using OpenAI's GPT-3.5-turbo.

## Why OpenAI Instead of Ollama?

- **No deployment issues** - Small Node.js app, deploys anywhere
- **Reliable** - OpenAI's infrastructure, no maintenance
- **Cost-effective** - ~$4-5/month with rate limiting
- **Works for everyone** - No user installation required

## Features

- 🤖 **OpenAI GPT-3.5-turbo** for AI responses
- 🔒 **Secure** with CORS, Helmet, and rate limiting
- 💰 **Budget-friendly** - Strict rate limits keep costs under $5/month
- 🚀 **Easy deployment** - No Docker, works on Railway/Render free tier

## Cost Control

**Rate Limits:**
- 50 requests per 15 minutes (general)
- 10 AI requests per hour per IP (strict)
- Max 500 tokens per response

**Expected costs:**
- ~3,000 AI requests/month = ~$4/month
- Well under $5/month budget

## Setup

### 1. Get OpenAI API Key

1. Go to https://platform.openai.com/signup
2. Create account (free)
3. Go to https://platform.openai.com/api-keys
4. Click "Create new secret key"
5. Copy the key (starts with `sk-`)

### 2. Configure Environment

Create `.env` file:
```env
PORT=3000
OPENAI_API_KEY=sk-your-actual-key-here
NODE_ENV=production
```

### 3. Install & Run Locally

```bash
npm install
npm start
```

Visit: http://localhost:3000/api/health

## Deploy to Railway

1. **Push to GitHub** (already done)

2. **Go to Railway:**
   - Visit https://railway.app
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose: `-adam-trade-ai-backend`

3. **Add Environment Variable:**
   - Click on your service
   - Go to "Variables" tab
   - Click "New Variable"
   - Name: `OPENAI_API_KEY`
   - Value: `sk-your-actual-key-here`
   - Click "Add"

4. **Deploy:**
   - Railway will auto-deploy
   - Wait ~1-2 minutes
   - Generate domain (Settings → Networking → Generate Domain)

5. **Test:**
   - Visit: `https://your-url.up.railway.app/api/health`
   - Should show: `"status": "connected"`

## API Endpoints

### GET /api/health
Health check - returns connection status

### POST /api/generate
Generate AI text response
```json
{
  "prompt": "What are Incoterms?",
  "system": "You are a helpful tutor..."
}
```

### POST /api/chat
Chat interface with message history
```json
{
  "messages": [
    {"role": "system", "content": "You are a tutor..."},
    {"role": "user", "content": "Explain FOB"}
  ]
}
```

### GET /api/models
List available models

## Troubleshooting

**"OpenAI API key not configured"**
- Add OPENAI_API_KEY environment variable in Railway

**"AI request limit reached"**
- Rate limit hit - wait 1 hour or adjust limits in server-openai.js

**CORS errors**
- Check allowed origins in server-openai.js matches your Netlify URL

## Cost Monitoring

Monitor your OpenAI usage:
1. Go to https://platform.openai.com/usage
2. Check daily/monthly usage
3. Set up billing alerts

## Reverting to Ollama

If you want to go back to local Ollama:
```bash
# Restore Dockerfile
mv Dockerfile.ollama.bak Dockerfile

# Use old server
npm run start:ollama
```

## License

MIT
