# ---- Base Stage ----
FROM node:20-slim AS base

WORKDIR /app

# Install OpenSSL for Prisma
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev for build)
RUN npm ci

# Copy source code
COPY . .

# ---- Build Stage ----
FROM base AS build

# Generate Prisma client
RUN npx prisma generate

# Build TypeScript
RUN npm run build

# Build seed script
RUN npm run seed:build

# ---- Production Stage ----
FROM node:20-slim AS production

WORKDIR /app

ENV NODE_ENV=production

# Install OpenSSL for Prisma
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --omit=dev

# Install Prisma CLI globally for migrations
RUN npm install -g prisma@5.22.0

# Copy built application
COPY --from=build /app/dist ./dist

# Copy built seed script (used only when RUN_SEED=true)
COPY --from=build /app/dist-seed ./dist-seed

# Copy Prisma schema and migrations
COPY --from=build /app/prisma ./prisma

# Generate Prisma client in production
RUN npx prisma generate

# Expose application port
EXPOSE 3333

# Start the application: run migrations, optionally seed (only in dev), then start server.
# In production RUN_SEED must be false to avoid wiping real data.
CMD ["sh", "-c", "npx prisma migrate deploy && if [ \"$RUN_SEED\" = \"true\" ]; then node dist-seed/seed.js; fi && node dist/server.js"]