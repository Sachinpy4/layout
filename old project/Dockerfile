FROM node:22-alpine AS build

WORKDIR /app

# Copy package.json files
COPY package.json ./
COPY frontend/package.json ./frontend/
COPY backend/package.json ./backend/

# Install dependencies
RUN npm run install:all

# Copy source code
COPY . .

# Build both frontend and backend
RUN npm run build

# Production stage
FROM node:22-alpine

WORKDIR /app

# Install Puppeteer dependencies with specific Chromium version
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    freetype-dev \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    nodejs \
    yarn \
    dumb-init

# Set environment variables for Puppeteer
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser \
    PUPPETEER_DISABLE_SETUID_SANDBOX=true \
    PUPPETEER_NO_SANDBOX=true

# Copy package files
COPY --from=build /app/package.json ./
COPY --from=build /app/backend/package.json ./backend/

# Copy built assets
COPY --from=build /app/backend/dist ./backend/dist
COPY --from=build /app/frontend/dist ./frontend/dist

# Copy invoice template files
COPY --from=build /app/backend/invoice-template.html /app/backend/
COPY --from=build /app/backend/invoice-styles.css /app/backend/

# Install only production dependencies
RUN cd backend && npm install --only=production

# Expose the port the app runs on
EXPOSE 5000

# Use dumb-init as entrypoint to handle signals properly
ENTRYPOINT ["dumb-init", "--"]
CMD ["npm", "start"] 