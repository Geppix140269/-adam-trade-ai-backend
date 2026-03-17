# Use official Ollama image
FROM ollama/ollama:latest

# Install Node.js on top of Ollama
RUN apt-get update && apt-get install -y \
    curl \
    && curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

# Create app directory
WORKDIR /app

# Copy and install dependencies
COPY package*.json ./
RUN npm install --omit=dev && npm cache clean --force

# Copy app code
COPY server.js ./

# Create startup script
RUN echo '#!/bin/bash\n\
set -e\n\
echo "Starting Ollama..."\n\
ollama serve &\n\
sleep 5\n\
echo "Pulling phi3:mini model..."\n\
ollama pull phi3:mini\n\
echo "Starting API server..."\n\
exec node server.js\n\
' > /start.sh && chmod +x /start.sh

EXPOSE 3000 11434

ENV PORT=3000 \
    NODE_ENV=production

CMD ["/start.sh"]
