# Stage 1: Builder
FROM node:lts-alpine AS builder

WORKDIR /app

# Install dependencies including devDependencies for building
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Build the TypeScript code
RUN npm run build

# Stage 2: Production Runner
FROM node:lts-alpine

WORKDIR /app

ENV NODE_ENV=production

# Install only production dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy built artifacts from builder stage
COPY --from=builder /app/dist ./dist

# Create a non-root user for security (optional but recommended)
USER node

# Expose the port (defaulting to 3000, can be overridden by env var)
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
