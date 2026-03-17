# Use the official Ollama image as base
FROM ollama/ollama:latest as ollama

# Use Node.js for the API server
FROM node:18-slim

# Install curl and other dependencies
RUN apt-get update && apt-get install -y \
    curl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Copy Ollama binary from the ollama image
COPY --from=ollama /usr/bin/ollama /usr/bin/ollama
COPY --from=ollama /usr/lib /usr/lib

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application code
COPY . .

# Create startup script
RUN echo '#!/bin/bash\n\
set -e\n\
echo "Starting Ollama service..."\n\
ollama serve &\n\
OLLAMA_PID=$!\n\
echo "Ollama PID: $OLLAMA_PID"\n\
sleep 5\n\
echo "Pulling Mistral model..."\n\
ollama pull mistral || echo "Model pull failed or already exists"\n\
echo "Starting Node.js API server..."\n\
exec node server.js\n\
' > /app/start.sh && chmod +x /app/start.sh

# Expose ports
EXPOSE 3000 11434

# Set environment variables
ENV OLLAMA_URL=http://localhost:11434
ENV PORT=3000
ENV NODE_ENV=production

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

# Run the startup script
CMD ["/app/start.sh"]
