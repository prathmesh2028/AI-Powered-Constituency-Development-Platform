# Multi-stage production build for Express Backend
FROM node:20-alpine AS builder
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci

# Final Production Runner Stage
FROM node:20-alpine
WORKDIR /usr/src/app
ENV NODE_ENV=production
ENV PORT=5000

COPY package*.json ./
# Install production dependencies only to minimize image footprint
RUN npm ci --only=production

# Copy application source code
COPY src/ ./src/

# Expose backend service port
EXPOSE 5000

# Execute as standard non-privileged container user for security compliance
USER node

CMD ["node", "src/server.js"]
