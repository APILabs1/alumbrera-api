● <div align="center">

  # alumbrera-api

  REST API for the Alumbrera platform — NestJS · PostgreSQL · Azure Entra

  ![CI](https://github.com/APILabs1/alumbrera-api/actions/workflows/ci.yml/badge.svg?branch=dev)
  ![Node](https://img.shields.io/badge/Node.js-22-1a365d?logo=node.js&logoColor=white)
  ![TypeScript](https://img.shields.io/badge/TypeScript-5-1a365d?logo=typescript&logoColor=white)
  ![NestJS](https://img.shields.io/badge/NestJS-11-1a365d?logo=nestjs&logoColor=white)
  ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-1a365d?logo=postgresql&logoColor=white)
  
  </div>

  ---

  ## Stack

  | | Technology | Version |
  |---|---|---|
  | Runtime | Node.js + TypeScript | 22 / 5.x |
  | Framework | NestJS | 11 |
  | Database | PostgreSQL + Prisma | 16 / 6 |
  | Auth | passport-jwt + jwks-rsa (Azure Entra CIAM) | 4 |
  | Logging | Pino (nestjs-pino) | 4.6 |
  | Package manager | pnpm | 11 |

  ## Prerequisites

  - Node.js >= 22
  - pnpm >= 11
  - Docker (for local PostgreSQL)

  ## Getting started

  ```bash
  cp .env.example .env       # fill in your values
  docker compose up -d       # start local database
  pnpm install
  pnpm prisma migrate dev
  pnpm run start:dev

  API at http://localhost:3001 · Swagger at http://localhost:3001/docs

  Environment variables

  See .env.example. Key variables:

  ┌────────────────────────────────────────┬──────────────────────────────────────────┐
  │                Variable                │               Description                │
  ├────────────────────────────────────────┼──────────────────────────────────────────┤
  │ DB_HOST, DB_USER, DB_PASSWORD, DB_NAME │ PostgreSQL connection                    │
  ├────────────────────────────────────────┼──────────────────────────────────────────┤
  │ AZURE_JWKS_URI                         │ Entra JWKS endpoint for JWT verification │
  ├────────────────────────────────────────┼──────────────────────────────────────────┤
  │ AZURE_ISSUER                           │ Token issuer URL                         │
  ├────────────────────────────────────────┼──────────────────────────────────────────┤
  │ AZURE_AUDIENCE                         │ API client ID (GUID)                     │
  ├────────────────────────────────────────┼──────────────────────────────────────────┤
  │ ALLOWED_ORIGINS                        │ Comma-separated CORS origins             │
  └────────────────────────────────────────┴──────────────────────────────────────────┘

  Commands

  pnpm run start:dev    # Development server (watch mode)
  pnpm run build        # Compile to dist/
  pnpm run lint         # ESLint + Prettier
  pnpm run test         # Unit tests
  pnpm run test:e2e     # E2E tests (requires local DB)
  pnpm run test:cov     # Unit tests with coverage

  Endpoints

  ┌────────┬─────────────┬──────────┬────────────────────────────────────────┐
  │ Method │    Path     │   Auth   │              Description               │
  ├────────┼─────────────┼──────────┼────────────────────────────────────────┤
  │ GET    │ /health     │ Public   │ Health check (includes DB ping)        │
  ├────────┼─────────────┼──────────┼────────────────────────────────────────┤
  │ GET    │ /me         │ Required │ Returns the current authenticated user │
  ├────────┼─────────────┼──────────┼────────────────────────────────────────┤
  │ POST   │ /users/sync │ Required │ Upserts local user from Entra claims   │
  └────────┴─────────────┴──────────┴────────────────────────────────────────┘

  Docker

  docker build -t alumbrera-api .
  docker run -p 3001:3001 --env-file .env alumbrera-api

  Container runs prisma migrate deploy automatically on startup.

  CI

  GitHub Actions runs on push to main/dev and on PRs to main: lint · type check · unit tests · E2E tests · Docker build + smoke test.
  ```
