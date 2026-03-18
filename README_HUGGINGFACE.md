# ADAM Trade AI Backend - Hugging Face Spaces Deployment

This backend API serves the ADAM Trade AI educational platform with AI-powered features.

## Quick Start

1. Create a new Space on Hugging Face
2. Choose "Docker" as the SDK
3. Connect this GitHub repository
4. Set Space hardware to "CPU basic" (free tier)
5. Deploy!

## Environment Variables

No environment variables required for basic deployment.

## Endpoints

- `GET /api/health` - Health check
- `POST /api/generate` - Generate AI responses
- `POST /api/chat` - Chat interface
- `GET /api/models` - List available models

## Model

Uses Phi-3 Mini (2.3GB) for educational content generation.

## Frontend

Connect from: https://adamftd-trade-academy.netlify.app
