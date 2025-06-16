# Use official Node.js LTS image
FROM node:20-alpine AS base

# Set working directory
WORKDIR /app

# Install dependencies only when needed
COPY package.json package-lock.json* pnpm-lock.yaml* yarn.lock* ./
RUN \
  if [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then npm install -g pnpm && pnpm install; \
  elif [ -f yarn.lock ]; then yarn install --frozen-lockfile; \
  else npm install; fi

# Copy all files
COPY . .

# Build Next.js app
RUN npm run build

# Production image, copy only necessary files
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Copy built app and node_modules from previous stage
COPY --from=base /app/.next ./.next
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/package.json ./package.json
COPY --from=base /app/public ./public
COPY --from=base /app/next.config.ts ./next.config.ts

# Expose port 3006
EXPOSE 3006

# Start Next.js app
CMD ["npm", "run", "start", "--", "-p", "3006"]
