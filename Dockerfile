# Base Dockerfile for all services
FROM node:20-alpine AS base

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build the application
RUN pnpm run build

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --prod --frozen-lockfile

COPY --from=base /app/dist ./dist
COPY --from=base /app/node_modules ./node_modules

EXPOSE 3000

CMD ["node", "dist/apps/api-gateway/main"]
