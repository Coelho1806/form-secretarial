FROM node:20-alpine AS builder

WORKDIR /app

# Install ALL dependencies (including devDependencies for build)
COPY package*.json ./
RUN npm ci

# Copy application files
COPY . .

# Build the frontend
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Install wget for healthcheck
RUN apk add --no-cache wget

# Install only production dependencies
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy built assets from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server.js ./server.js
COPY --from=builder /app/src ./src
COPY --from=builder /app/database ./database

# Expose port
EXPOSE 3001

# Start the server
CMD ["node", "server.js"]
