# =============================================================================
# Stage 1: Build the NestJS backend
# =============================================================================
FROM node:18.20.4-alpine3.20 AS builder

WORKDIR /app

# Copy root workspace package files
COPY package*.json ./
COPY packages/backend/package*.json ./packages/backend/

# Install ALL dependencies (including devDependencies for build)
RUN npm ci --ignore-scripts

# Copy backend source code
COPY packages/backend ./packages/backend

# Build the backend
RUN npm run build --workspace=packages/backend

# =============================================================================
# Stage 2: Production image with only runtime dependencies
# =============================================================================
FROM node:18.20.4-alpine3.20 AS production

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init=1.2.5-r2 curl=8.9.1-r2

# Create non-root user and group
RUN addgroup -S -g 1001 appgroup && \
    adduser -S -u 1001 -G appgroup appuser

WORKDIR /app

# Copy root workspace package files
COPY package*.json ./
COPY packages/backend/package*.json ./packages/backend/

# Install ONLY production dependencies
RUN npm ci --omit=dev --ignore-scripts && \
    npm cache clean --force

# Copy built artifacts from builder stage
COPY --from=builder /app/packages/backend/dist ./packages/backend/dist

# Set ownership to non-root user
RUN chown -R appuser:appgroup /app

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 3001

# Health check using the /api/v1/health endpoint
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD curl -f http://localhost:3001/api/v1/health || exit 1

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the production server
CMD ["node", "packages/backend/dist/main.js"]
