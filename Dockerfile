# Multi-stage build for minimal image size
FROM ollama/ollama:latest as ollama-base

# Minimal Node.js base
FROM node:18-slim

# Install only essential dependencies
RUN apt-get update && apt-get install -y \
    curl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

# Copy only Ollama binary (not entire /usr/lib)
COPY --from=ollama-base /bin/ollama /bin/ollama

# Make ollama executable
RUN chmod +x /bin/ollama

# Create app directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install --omit=dev && npm cache clean --force

# Copy application code
COPY server.js ./

# Create optimized startup script
RUN echo '#!/bin/bash\n\
set -e\n\
echo "=== Starting Ollama service ==="\n\
ollama serve > /tmp/ollama.log 2>&1 &\n\
OLLAMA_PID=$!\n\
echo "Ollama PID: $OLLAMA_PID"\n\
\n\
# Wait for Ollama to be ready\n\
echo "Waiting for Ollama to start..."\n\
for i in {1..30}; do\n\
  if curl -s http://localhost:11434/api/tags >/dev/null 2>&1; then\n\
    echo "Ollama is ready!"\n\
    break\n\
  fi\n\
  echo "Waiting... ($i/30)"\n\
  sleep 2\n\
done\n\
\n\
echo "=== Pulling Phi-3 Mini model ==="\n\
ollama pull phi3:mini || echo "WARNING: Model pull failed"\n\
\n\
echo "=== Starting Node.js API server ==="\n\
exec node server.js\n\
' > /app/start.sh && chmod +x /app/start.sh

# Expose ports
EXPOSE 3000 11434

# Environment variables
ENV OLLAMA_HOST=0.0.0.0:11434 \
    OLLAMA_ORIGINS=* \
    PORT=3000 \
    NODE_ENV=production

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=90s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

# Run startup script
CMD ["/app/start.sh"]
