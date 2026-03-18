require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const axios = require('axios');
const knowledgeManager = require('./knowledge-manager');

const app = express();
const PORT = process.env.PORT || 3000;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Trust proxy
app.set('trust proxy', 1);

// Security
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));

// CORS
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    const allowedOrigins = [
      'https://adamftd-trade-academy.netlify.app',
      'http://localhost:3000',
      'http://localhost:8000'
    ];
    if (allowedOrigins.indexOf(origin) !== -1 || origin.endsWith('.netlify.app')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'OPTIONS', 'HEAD'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: false,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(express.json({ limit: '10mb' }));

// Rate limiting - STRICT to keep costs under $5/month
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // 50 requests per 15 min
  message: 'Too many requests, please try again later.'
});
app.use('/api/', limiter);

// AI generation rate limit - very strict
const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 AI requests per hour per IP
  message: 'AI request limit reached. Please try again in an hour.'
});

// ============================================
// ROUTES
// ============================================

app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    service: 'ADAM Trade AI Backend (OpenAI)',
    version: '2.0.0'
  });
});

// Health check
app.get('/api/health', async (req, res) => {
  const hasKey = !!OPENAI_API_KEY;
  res.json({
    status: hasKey ? 'connected' : 'disconnected',
    provider: 'OpenAI',
    model: 'gpt-3.5-turbo',
    models: hasKey ? [{ name: 'gpt-3.5-turbo', size: 0 }] : []
  });
});

// Generate AI response
app.post('/api/generate', aiLimiter, async (req, res) => {
  const { prompt, system } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Missing required field: prompt' });
  }

  if (!OPENAI_API_KEY) {
    return res.status(503).json({ error: 'OpenAI API key not configured' });
  }

  if (prompt.length > 4000) {
    return res.status(400).json({ error: 'Prompt too long. Maximum 4000 characters.' });
  }

  try {
    // Get relevant ADAM course content for this question
    const adamContext = knowledgeManager.getContext(prompt);

    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: system || adamContext
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 500, // Keep costs low
        temperature: 0.7
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    );

    const aiResponse = response.data.choices[0].message.content;

    // Format response to match Ollama format
    res.json({
      response: aiResponse,
      model: 'gpt-3.5-turbo',
      done: true
    });

  } catch (error) {
    console.error('OpenAI API error:', error.response?.data || error.message);
    res.status(500).json({
      error: 'Failed to generate AI response',
      details: error.response?.data?.error?.message || error.message
    });
  }
});

// Chat endpoint
app.post('/api/chat', aiLimiter, async (req, res) => {
  const { messages } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Missing required field: messages array' });
  }

  if (!OPENAI_API_KEY) {
    return res.status(503).json({ error: 'OpenAI API key not configured' });
  }

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: messages,
        max_tokens: 500,
        temperature: 0.7
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    );

    res.json({
      message: response.data.choices[0].message,
      model: 'gpt-3.5-turbo',
      done: true
    });

  } catch (error) {
    console.error('OpenAI API error:', error.response?.data || error.message);
    res.status(500).json({
      error: 'Failed to generate chat response',
      details: error.response?.data?.error?.message || error.message
    });
  }
});

// List models
app.get('/api/models', (req, res) => {
  res.json({
    models: [
      { name: 'gpt-3.5-turbo', size: 0 }
    ]
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Not found', path: req.path });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 ADAM Trade AI Backend (OpenAI) running on port ${PORT}`);
  console.log(`🤖 Provider: OpenAI GPT-3.5-turbo`);
  console.log(`🔑 API Key configured: ${!!OPENAI_API_KEY}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});
