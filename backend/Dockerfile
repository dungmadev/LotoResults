# ============================================================
# Backend Dockerfile — LotoResults
# ============================================================
# Multi-stage build: install → build → production
# ============================================================

# ── Stage 1: Install dependencies ──
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --production=false

# ── Stage 2: Build TypeScript ──
FROM deps AS build
COPY tsconfig.json ./
COPY src/ ./src/
RUN npm run build

# ── Stage 3: Production image ──
FROM node:20-alpine AS production

# Security: run as non-root
RUN addgroup -g 1001 -S appgroup && \
    adduser -S appuser -u 1001 -G appgroup

WORKDIR /app

# Copy production deps only
COPY package.json package-lock.json ./
RUN npm ci --production && npm cache clean --force

# Copy built files
COPY --from=build /app/dist ./dist

# Create data directory for SQLite
RUN mkdir -p /app/data && chown -R appuser:appgroup /app/data

# Environment
ENV NODE_ENV=production
ENV PORT=3001

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3001/health || exit 1

# Run as non-root
USER appuser

# Data volume for SQLite persistence
VOLUME ["/app/data"]

CMD ["node", "dist/index.js"]
