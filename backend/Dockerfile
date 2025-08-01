# =============================================================================
# STAGE 1: Build Stage
# =============================================================================
FROM node:22.15.0-alpine AS builder

# Set working directory
WORKDIR /app

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies for build)
RUN npm ci && \
    npm cache clean --force

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Remove dev dependencies and clean up
RUN npm prune --production && \
    rm -rf node_modules/.cache

# =============================================================================
# STAGE 2: Production Stage
# =============================================================================
FROM node:22.15.0-alpine AS production

# Install security updates, curl for health check, and Chromium for Puppeteer
RUN apk --no-cache upgrade && \
    apk --no-cache add \
        dumb-init \
        curl \
        chromium \
        nss \
        freetype \
        freetype-dev \
        harfbuzz \
        ca-certificates \
        ttf-freefont && \
    rm -rf /var/cache/apk/*

# Set working directory
WORKDIR /app

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

# Copy built application from builder stage
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/package*.json ./

# Copy templates directory for invoice generation
COPY --from=builder --chown=nestjs:nodejs /app/templates ./templates

# Create upload directories with proper permissions
RUN mkdir -p uploads/images/exhibitions/headers \
             uploads/images/exhibitions/sponsors \
             uploads/images/exhibitions/footers \
             uploads/images/users/avatars \
             uploads/images/exhibitors/logos \
             uploads/images/exhibitors/documents \
             uploads/images/system \
             uploads/documents/exhibitions \
             uploads/documents/bookings && \
    chown -R nestjs:nodejs uploads && \
    chmod -R 755 uploads

# Set security-focused environment variables + Puppeteer configuration
ENV NODE_ENV=production \
    NODE_OPTIONS="--max-old-space-size=1024" \
    PORT=3001 \
    HELMET_ENABLED=true \
    RATE_LIMITING_ENABLED=true \
    PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser \
    PUPPETEER_DISABLE_SETUID_SANDBOX=true \
    PUPPETEER_NO_SANDBOX=true

# Expose port
EXPOSE 3001

# Switch to non-root user
USER nestjs

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:3001/api/v1/ || exit 1

# Use dumb-init for proper signal handling
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["node", "dist/main"] 