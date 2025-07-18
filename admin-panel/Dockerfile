# =============================================================================
# STAGE 1: Build Stage
# =============================================================================
FROM node:22-alpine AS builder

# Set working directory
WORKDIR /app

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S vite -u 1001

# Copy package files
COPY package*.json ./

# Install dependencies including dev dependencies for build
RUN npm ci && \
    npm cache clean --force

# Copy source code
COPY . .

# Build the application for production
RUN npm run build

# =============================================================================
# STAGE 2: Production Stage with Simple HTTP Server
# =============================================================================
FROM node:22-alpine AS production

# Install security updates
RUN apk --no-cache upgrade && \
    apk --no-cache add dumb-init curl && \
    rm -rf /var/cache/apk/*

# Set working directory
WORKDIR /app

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S vite -u 1001

# Install serve to host static files
RUN npm install -g serve

# Copy built application from builder stage
COPY --from=builder --chown=vite:nodejs /app/dist ./dist

# Set security-focused environment variables
ENV NODE_ENV=production \
    SERVE_STATIC_COMPRESSION=true \
    SERVE_STATIC_CACHE=86400

# Expose port (EasyPanel will handle routing)
EXPOSE 3000

# Switch to non-root user
USER vite

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000 || exit 1

# Use dumb-init for proper signal handling
ENTRYPOINT ["dumb-init", "--"]

# Serve the static files
CMD ["serve", "-s", "dist", "-l", "3000"] 