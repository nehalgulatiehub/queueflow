# Multi-stage production Dockerfile for QueueFlow API Server
FROM node:22-alpine AS builder
WORKDIR /app

# Copy root workspace configs
COPY package.json pnpm-workspace.yaml tsconfig.base.json ./
COPY packages ./packages
COPY shared ./shared
COPY apps/api-server ./apps/api-server

# Install dependencies and build
RUN npm install
RUN npx prisma generate --schema=packages/database/prisma/schema.prisma
RUN npm run build --workspace=@queueflow/config --workspace=@queueflow/database --workspace=@queueflow/logger --workspace=@queueflow/monitoring --workspace=@queueflow/redis-engine --workspace=@queueflow/shared
RUN npm run build --workspace=@queueflow/api-server

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/shared ./shared
COPY --from=builder /app/apps/api-server/dist ./apps/api-server/dist
COPY --from=builder /app/apps/api-server/package.json ./apps/api-server/package.json

EXPOSE 4000
CMD ["node", "apps/api-server/dist/server.js"]
