# =============================================================================
# Stage 1: Build the React frontend
# =============================================================================
FROM node:18.20.4-alpine3.20 AS builder

WORKDIR /app

# Copy root workspace package files
COPY package*.json ./
COPY packages/frontend/package*.json ./packages/frontend/

# Install ALL dependencies (including devDependencies for build)
RUN npm ci --ignore-scripts

# Copy frontend source code
COPY packages/frontend ./packages/frontend

# Build argument for API URL (inject at build time)
ARG VITE_API_URL=/api
ARG VITE_NODE_ENV=production

# Set environment variables for the build
ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_NODE_ENV=${VITE_NODE_ENV}

# Build the frontend (produces dist/ folder)
RUN npm run build --workspace=packages/frontend

# =============================================================================
# Stage 2: Serve static files with Nginx
# =============================================================================
FROM nginx:1.27.2-alpine3.20 AS production

# Install curl for healthcheck
RUN apk add --no-cache curl=8.9.1-r2

# Create non-root user for nginx
RUN addgroup -S -g 1001 nginxgroup && \
    adduser -S -u 1001 -G nginxgroup nginxuser

# Copy custom nginx config for serving the SPA
COPY packages/frontend/nginx-spa.conf /etc/nginx/conf.d/default.conf

# Copy built assets from builder stage
COPY --from=builder /app/packages/frontend/dist /usr/share/nginx/html

# Set ownership to non-root user
RUN chown -R nginxuser:nginxgroup /usr/share/nginx/html && \
    chown -R nginxuser:nginxgroup /var/cache/nginx && \
    chown -R nginxuser:nginxgroup /var/log/nginx && \
    touch /var/run/nginx.pid && \
    chown nginxuser:nginxgroup /var/run/nginx.pid

# Switch to non-root user
USER nginxuser

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8080/ || exit 1

# Nginx runs in foreground
CMD ["nginx", "-g", "daemon off;"]
