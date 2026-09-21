# School Platform

A school landing page with a public student registration request system. Built as a TypeScript monorepo with a React SPA frontend and a NestJS API backend, backed by MongoDB.

![School Platform](./Screenshot.png)

## Tech Stack

| Layer      | Technology                                                                 |
| ---------- | -------------------------------------------------------------------------- |
| Frontend   | React 18, Vite 5, TypeScript, Tailwind CSS, Radix UI, React Hook Form, Zod |
| Backend    | NestJS 10, Mongoose, class-validator, Swagger                              |
| Database   | MongoDB 7                                                                  |
| Tooling    | npm workspaces, ESLint, Prettier, Vitest, Jest                             |
| Deployment | Docker Compose, Nginx (reverse proxy)                                      |

## Architecture

```text
Browser ──► Frontend (React SPA, :3000 dev / Nginx :8080 prod)
                 │
                 ▼
            NestJS API (:3001) ──► MongoDB (:27017)
```

- In development, the frontend dev server and API run separately (or as containers via `docker-compose.dev.yml`).
- In production, Nginx is the single entry point (ports 80/443) routing traffic to the frontend and API containers — see [DEPLOYMENT.md](./DEPLOYMENT.md).

## Project Structure

```text
├── packages/
│   ├── frontend/                 # React + Vite SPA
│   │   └── src/
│   │       ├── components/        # UI primitives & landing page components
│   │       ├── features/registration/   # registration form feature module
│   │       ├── hooks/            # shared hooks (toast, etc.)
│   │       └── lib/              # utilities
│   └── backend/                   # NestJS API
│       └── src/
│           ├── common/           # filters, interceptors, security services
│           ├── config/           # configuration & validation
│           ├── health/           # health check module
│           └── registration/     # registration request feature module
├── nginx/                        # Nginx reverse proxy config (production)
├── scripts/                      # mongo-init, production build helpers
├── docker-compose.dev.yml        # development stack
├── docker-compose.prod.yml       # production stack
├── .env.example                  # environment variable template
├── DEPLOYMENT.md                 # production deployment guide
└── SECURITY_CHECKLIST.md         # security review checklist
```

## Prerequisites

- **Node.js ≥ 18** and **npm ≥ 9**
- **Docker** and **Docker Compose** (for the containerized workflows)

## Getting Started

### 1. Local Development

```bash
# Install dependencies (npm workspaces — run from the repo root)
npm ci

# Start frontend + backend concurrently
npm run dev
```

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:3001` (`GET /api/v1/health`)

> Requires a running MongoDB instance. Set `MONGODB_URI` in your environment or copy [.env.example](./.env.example) as a reference for the variables used.

### 2. Docker (Development)

```bash
npm run docker:dev
```

Starts MongoDB, the API (:3001), and the frontend (:3000) with source bind mounts and hot reload:

```bash
docker-compose -f docker-compose.dev.yml ps      # service status
docker-compose -f docker-compose.dev.yml logs -f # follow logs
```

### 3. Production

```bash
cp .env.production .env   # then fill in production values
npm run docker:prod
```

See [DEPLOYMENT.md](./DEPLOYMENT.md) for the full production guide (SSL, backups, monitoring, troubleshooting).

## Available Scripts

Run from the repo root:

| Command                | Description                               |
| ---------------------- | ----------------------------------------- |
| `npm run dev`          | Start frontend + backend concurrently     |
| `npm run dev:frontend` | Start the frontend only (Vite dev server) |
| `npm run dev:backend`  | Start the backend only (Nest watch mode)  |
| `npm run build`        | Build all workspaces                      |
| `npm test`             | Run tests in all workspaces               |
| `npm run lint`         | Lint all workspaces                       |
| `npm run docker:dev`   | Start the development Docker stack        |
| `npm run docker:prod`  | Start the production Docker stack         |

Workspace-specific scripts (e.g. `npm run dev --workspace=packages/frontend`) are defined in each package's `package.json`.

## Environment Variables

Key variables (see [.env.example](./.env.example) and the full reference in [DEPLOYMENT.md](./DEPLOYMENT.md)):

| Variable          | Required | Description                                |
| ----------------- | -------- | ------------------------------------------ |
| `NODE_ENV`        | Yes      | development / production                   |
| `PORT`            | Yes      | API port (default 3001)                    |
| `MONGODB_URI`     | Yes      | MongoDB connection string                  |
| `FRONTEND_URL`    | Yes      | Frontend origin (CORS)                     |
| `THROTTLER_TTL`   | No       | Rate limit window in ms                    |
| `THROTTLER_LIMIT` | No       | Rate limit request count                   |
| `SWAGGER_ENABLED` | No       | Expose API docs                            |
| `VITE_API_URL`    | Yes*     | API base URL for the frontend (build time) |

## API Documentation

- **Swagger UI** (non-production): `http://localhost:3001/api/docs`
- **Health check**: `GET /api/v1/health`
- **Registration requests**: `POST /api/v1/registration-requests` — public endpoint protected by rate limiting, bot detection (Cloudflare Turnstile), and spam filtering.

## Testing

```bash
npm test                     # all workspaces (frontend: Vitest, backend: Jest)
npm run test --workspace=packages/frontend
npm run test --workspace=packages/backend
```

## Additional Documentation

- [DEPLOYMENT.md](./DEPLOYMENT.md) — production deployment guide
- [SECURITY_CHECKLIST.md](./SECURITY_CHECKLIST.md) — security review checklist
