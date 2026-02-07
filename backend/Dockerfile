# Stage 1: Base - Common restrictions and setup
FROM node:20-slim AS base
WORKDIR /app
COPY package*.json ./
RUN apt-get update -y && apt-get install -y openssl

# Stage 2: Development - Focus on reloading and debugging
FROM base AS development
# Install all dependencies including devDependencies (needed for checks, tests, etc.)
RUN npm install --legacy-peer-deps
# Copy the rest of the application code
COPY . .
# Generate Prisma Client
RUN npx prisma generate
# Expose the port
EXPOSE 3001
# Start in watch mode
CMD ["npx", "tsx", "watch", "src/server.ts"]

# Stage 3: Builder - Create the production build
FROM base AS builder
RUN npm install --legacy-peer-deps
COPY . .
RUN npx prisma generate
RUN npm run build

# Stage 4: Production - Minimal image
FROM node:20-slim AS production
WORKDIR /app
COPY package*.json ./
# Install ONLY production dependencies
RUN npm install --only=production
# Copy built assets from builder
COPY --from=builder /app/dist ./dist
EXPOSE 3001
CMD ["node", "dist/server.js"]
