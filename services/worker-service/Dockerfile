# Multi-stage production Dockerfile for QueueFlow Worker Service
FROM node:22-alpine AS builder
WORKDIR /app

COPY package.json pnpm-workspace.yaml tsconfig.base.json ./
COPY packages ./packages
COPY shared ./shared
COPY services/worker-service ./services/worker-service

RUN npm install
RUN npx prisma generate --schema=packages/database/prisma/schema.prisma
RUN npm run build --workspace=@queueflow/worker-service

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/shared ./shared
COPY --from=builder /app/services/worker-service/dist ./services/worker-service/dist
COPY --from=builder /app/services/worker-service/package.json ./services/worker-service/package.json

CMD ["node", "services/worker-service/dist/index.js"]
