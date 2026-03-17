require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;
const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';

// ============================================
// MIDDLEWARE
// ============================================

// Security headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS configuration - Permissive for production
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, Postman)
    if (!origin) return callback(null, true);

    // Allow all Netlify domains and localhost
    const allowedOrigins = [
      'https://adamftd-trade-academy.netlify.app',
      'http://localhost:3000',
      'http://localhost:8000',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:8000'
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
  optionsSuccessStatus: 200,
  preflightContinue: false
};

// Apply CORS before other middleware
app.use(cors(corsOptions));

// Handle preflight requests explicitly
app.options('*', cors(corsOptions));

// Body parser
app.use(express.json({ limit: '10mb' }));

// Rate limiting - 100 requests per 15 minutes per IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Stricter rate limiting for generate endpoint - 20 requests per 15 minutes
const generateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: 'Too many AI generation requests, please try again later.',
});

// ============================================
// ROUTES
// ============================================

// Health check
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    service: 'ADAM Trade AI Backend',
    version: '1.0.0',
    ollama: OLLAMA_URL
  });
});

// Check Ollama connection and available models
app.get('/api/health', async (req, res) => {
  try {
    const response = await axios.get(`${OLLAMA_URL}/api/tags`, { timeout: 5000 });
    res.json({
      status: 'connected',
      models: response.data.models || [],
      ollamaUrl: OLLAMA_URL
    });
  } catch (error) {
    res.status(503).json({
      status: 'disconnected',
      error: 'Ollama service not available',
      details: error.message
    });
  }
});

// Generate AI response (streaming)
app.post('/api/generate', generateLimiter, async (req, res) => {
  const { model, prompt, system, stream = false } = req.body;

  if (!model || !prompt) {
    return res.status(400).json({
      error: 'Missing required fields: model and prompt'
    });
  }

  // Validate model name (prevent injection)
  const allowedModels = ['phi3', 'mistral', 'llama3.1', 'llama2', 'codellama'];
  if (!allowedModels.some(m => model.includes(m))) {
    return res.status(400).json({
      error: 'Invalid model name'
    });
  }

  // Limit prompt size
  if (prompt.length > 4000) {
    return res.status(400).json({
      error: 'Prompt too long. Maximum 4000 characters.'
    });
  }

  try {
    const ollamaResponse = await axios.post(
      `${OLLAMA_URL}/api/generate`,
      {
        model,
        prompt,
        system: system || 'You are a helpful AI tutor specializing in global trade, international commerce, and business.',
        stream: false
      },
      {
        timeout: 120000, // 2 minutes timeout
        maxContentLength: 50 * 1024 * 1024 // 50MB max
      }
    );

    res.json(ollamaResponse.data);
  } catch (error) {
    console.error('Ollama generate error:', error.message);
    res.status(500).json({
      error: 'Failed to generate AI response',
      details: error.response?.data || error.message
    });
  }
});

// Chat endpoint (for conversational AI)
app.post('/api/chat', generateLimiter, async (req, res) => {
  const { model, messages } = req.body;

  if (!model || !messages || !Array.isArray(messages)) {
    return res.status(400).json({
      error: 'Missing required fields: model and messages array'
    });
  }

  // Validate model name
  const allowedModels = ['phi3', 'mistral', 'llama3.1', 'llama2', 'codellama'];
  if (!allowedModels.some(m => model.includes(m))) {
    return res.status(400).json({
      error: 'Invalid model name'
    });
  }

  try {
    const ollamaResponse = await axios.post(
      `${OLLAMA_URL}/api/chat`,
      {
        model,
        messages,
        stream: false
      },
      {
        timeout: 120000,
        maxContentLength: 50 * 1024 * 1024
      }
    );

    res.json(ollamaResponse.data);
  } catch (error) {
    console.error('Ollama chat error:', error.message);
    res.status(500).json({
      error: 'Failed to generate chat response',
      details: error.response?.data || error.message
    });
  }
});

// List available models
app.get('/api/models', async (req, res) => {
  try {
    const response = await axios.get(`${OLLAMA_URL}/api/tags`, { timeout: 5000 });
    res.json({
      models: response.data.models || []
    });
  } catch (error) {
    res.status(503).json({
      error: 'Failed to fetch models',
      details: error.message
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    path: req.path
  });
});

// ============================================
// START SERVER
// ============================================

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 ADAM Trade AI Backend running on port ${PORT}`);
  console.log(`📡 Ollama URL: ${OLLAMA_URL}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});
