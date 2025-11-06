FROM node:20-alpine

WORKDIR /app

# Install dependencies first (better caching)
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy application files
COPY . .

# Build the frontend
RUN npm run build

# Expose port
EXPOSE 3001

# Start the server
CMD ["node", "server.js"]
