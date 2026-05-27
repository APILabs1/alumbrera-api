# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

NestJS v11 REST API using TypeScript. Package manager is **pnpm**.

## Commands

```bash
pnpm run start:dev       # Start in watch mode (development)
pnpm run build           # Compile to dist/
pnpm run start:prod      # Run compiled output

pnpm run test            # Unit tests (Jest, files matching *.spec.ts under src/)
pnpm run test:watch      # Unit tests in watch mode
pnpm run test:e2e        # E2E tests (config: test/jest-e2e.json)
pnpm run test:cov        # Unit tests with coverage

pnpm run lint            # ESLint + Prettier (auto-fix)
pnpm run format          # Prettier only (auto-fix)
```

To run a single test file:
```bash
pnpm run test -- --testPathPattern="app.controller"
```

Server listens on `process.env.PORT` (default `3001`).

Standard NestJS module structure: each feature lives in its own directory under `src/` with a `*.module.ts`, `*.controller.ts`, `*.service.ts`, and `*.spec.ts`.

## Conventions

All identifiers — variables, functions, classes, interfaces, enums, and file names — must be written in English.

## Architecture

### Auth (`src/auth/`)

JWT authentication via **passport-jwt** + **jwks-rsa** against Azure Entra External ID (CIAM). The strategy fetches the public key from the tenant's JWKS endpoint to verify RS256 tokens — no shared secret. `JwtAuthGuard` is registered globally via `APP_GUARD`; routes opt out of auth with `@Public()` from `src/auth/public.decorator.ts`.

### TypeScript config

- `emitDecoratorMetadata` and `experimentalDecorators` are enabled (required for NestJS DI).
- `noImplicitAny` is **off**; `strictNullChecks` is **on**.
- `module: "nodenext"` — use `.js` extensions in relative imports when needed by the compiler.

### ESLint

- `@typescript-eslint/no-explicit-any` is disabled.
- `@typescript-eslint/no-floating-promises` and `no-unsafe-argument` are warnings, not errors.
- Prettier is enforced as an ESLint error (`prettier/prettier`).
