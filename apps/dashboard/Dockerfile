# Multi-stage production Dockerfile for QueueFlow Dashboard
FROM node:22-alpine AS builder
WORKDIR /app

COPY package.json pnpm-workspace.yaml tsconfig.base.json ./
COPY packages ./packages
COPY shared ./shared
COPY apps/dashboard ./apps/dashboard

RUN npm install --legacy-peer-deps
RUN npm run build --workspace=@queueflow/dashboard

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/apps/dashboard/public ./public
COPY --from=builder /app/apps/dashboard/.next/standalone ./
COPY --from=builder /app/apps/dashboard/.next/static ./.next/static

EXPOSE 3000
CMD ["node", "server.js"]
