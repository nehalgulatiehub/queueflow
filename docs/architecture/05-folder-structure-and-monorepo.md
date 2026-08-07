# QueueFlow: Monorepo Architecture & Package Structure

QueueFlow uses a **pnpm Workspaces** monorepo layout enforcing Clean Architecture and Domain-Driven Design boundaries.

---

### Monorepo Directory Tree

```text
queueflow/
├── apps/
│   ├── api-server/                 # REST API + WebSockets Gateway (Fastify)
│   │   ├── src/
│   │   │   ├── config/             # Zod environment config validation
│   │   │   ├── plugins/            # Fastify plugins (JWT, Rate limit, CORS, OTel)
│   │   │   ├── modules/            # Domain modules (auth, queues, jobs, workers, metrics)
│   │   │   │   └── jobs/
│   │   │   │       ├── jobs.controller.ts
│   │   │   │       ├── jobs.service.ts
│   │   │   │       ├── jobs.routes.ts
│   │   │   │       └── dtos/
│   │   │   ├── websocket/          # Gateway broadcasting & subscriptions
│   │   │   └── app.ts              # Fastify server instance & lifecycle
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   └── dashboard/                  # Operations UI (Next.js 15 App Router)
│       ├── src/
│       │   ├── app/                # Next.js 15 pages (Dashboard, Queues, Workers, Logs)
│       │   ├── components/         # Shadcn UI + Recharts components
│       │   ├── hooks/              # TanStack Query & WebSocket hooks
│       │   └── stores/             # Zustand state management
│       ├── Dockerfile
│       └── package.json
│
├── services/
│   ├── worker-service/             # High-concurrency stream worker
│   │   ├── src/
│   │   │   ├── consumer/           # Redis Stream consumer group loop
│   │   │   ├── executor/           # Job execution engine & timeout handlers
│   │   │   ├── heartbeat/          # Worker telemetry pulse generator
│   │   │   └── recovery/           # PEL auto-claim & orphan recovery
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   └── scheduler-service/          # Delayed & Cron execution daemon
│       ├── src/
│       │   ├── cron/               # Cron expression parser & trigger
│       │   ├── sweeper/            # Scheduled job database sweeper
│       │   └── retry/              # Retry exponential backoff dispatcher
│       ├── Dockerfile
│       └── package.json
│
├── packages/
│   ├── core/                       # Domain entities, interfaces, value objects
│   │   ├── src/
│   │   │   ├── domain/             # Job, Queue, Worker domain models
│   │   │   ├── errors/             # Custom domain exception hierarchy
│   │   │   └── ports/              # Repository & Cache interfaces
│   │   └── package.json
│   │
│   ├── redis-engine/               # Redis Streams client wrapper & Lua scripts
│   │   ├── src/
│   │   │   ├── producer.ts         # Stream XADD encapsulation
│   │   │   ├── consumer-group.ts   # Stream XREADGROUP & XACK manager
│   │   │   ├── lock.ts             # Redlock execution locks
│   │   │   └── lua/                # Atomic Lua scripts
│   │   └── package.json
│   │
│   ├── database/                   # Prisma Client, migrations, seeders
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   └── seed.ts
│   │   ├── src/
│   │   │   ├── client.ts           # Prisma Singleton client with logging
│   │   │   └── repositories/       # Clean Architecture repository implementations
│   │   └── package.json
│   │
│   ├── logger/                     # Structured Pino Logger + OTel context tracing
│   │   ├── src/
│   │   │   └── logger.ts
│   │   └── package.json
│   │
│   └── config/                     # Shared TypeScript configs, ESLint, Prettier
│       └── tsconfig.base.json
│
├── shared/                         # Transpiled DTOs, Zod contracts, Constants
│   ├── src/
│   │   ├── dto/
│   │   ├── events/                 # WebSocket event schemas
│   │   └── constants/              # Status enums & key formats
│   └── package.json
│
├── docs/                           # Architecture specs, diagrams, guides
│   ├── architecture/
│   └── api/
│
├── infra/                          # Infrastructure configurations
│   ├── docker/                     # Compose files (Local dev, Postgres, Redis, Prom, Grafana)
│   ├── k8s/                        # Helm charts & K8s deployment manifests
│   └── monitoring/                 # Grafana dashboards & Prometheus alerts
│
├── scripts/                        # Monorepo setup, database migration, benchmark scripts
├── pnpm-workspace.yaml
├── package.json
└── README.md
```
