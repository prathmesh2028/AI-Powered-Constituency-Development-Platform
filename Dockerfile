# ═══════════════════════════════════════════════
# Stage 1: Install frontend dependencies
# ═══════════════════════════════════════════════
FROM node:20-alpine AS frontend-deps
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci

# ═══════════════════════════════════════════════
# Stage 2: Build Next.js frontend (standalone)
# ═══════════════════════════════════════════════
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY --from=frontend-deps /app/frontend/node_modules ./node_modules
COPY frontend/ .

# Backend runs on 5001 internally in the combined container
ARG BACKEND_URL=http://localhost:5001
ENV BACKEND_URL=${BACKEND_URL}
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

RUN npm run build

# ═══════════════════════════════════════════════
# Stage 3: Final combined production image
# ═══════════════════════════════════════════════
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

# ── Backend: install production deps only ──────
COPY backend/package*.json ./backend/
RUN cd backend && npm ci --only=production

# Copy backend source
COPY backend/src/ ./backend/src/

# ── Frontend: copy Next.js standalone output ───
COPY frontend/public/ ./frontend/public/
COPY --from=frontend-builder /app/frontend/.next/standalone/ ./frontend/
COPY --from=frontend-builder /app/frontend/.next/static/ ./frontend/.next/static/

# ── Startup script ─────────────────────────────
COPY start.sh ./start.sh
RUN chmod +x ./start.sh

# Run as non-root user
RUN addgroup --system --gid 1001 appgroup && \
    adduser --system --uid 1001 appuser && \
    chown -R appuser:appgroup /app

USER appuser

# Cloud Run routes traffic to this port
EXPOSE 3000

CMD ["sh", "start.sh"]
