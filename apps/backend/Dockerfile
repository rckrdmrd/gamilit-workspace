# ============================================================================
# GAMILIT Backend - Multi-stage Dockerfile
# @ref GUIA-DOCKER-MULTISTAGE §3
# ============================================================================

# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files for dependency caching
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts

# Copy source and build
COPY tsconfig.json ./
COPY src/ ./src/

RUN npm run build

# Prune dev dependencies
RUN npm prune --production

# Stage 2: Production
FROM node:20-slim AS production

# Security: run as non-root
RUN groupadd -r gamilit && useradd -r -g gamilit gamilit

WORKDIR /app

# Copy built artifacts and production deps
COPY --from=builder --chown=gamilit:gamilit /app/dist ./dist
COPY --from=builder --chown=gamilit:gamilit /app/node_modules ./node_modules
COPY --from=builder --chown=gamilit:gamilit /app/package.json ./

# Environment
ENV NODE_ENV=production
ENV PORT=3006

EXPOSE 3006

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD node -e "const http = require('http'); http.get('http://localhost:3006/api/v1/health/live', (r) => { process.exit(r.statusCode === 200 ? 0 : 1); }).on('error', () => process.exit(1));"

USER gamilit

CMD ["node", "-r", "tsconfig-paths/register", "dist/main.js"]
