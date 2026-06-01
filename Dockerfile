  FROM node:22.22.3-alpine AS deps
  WORKDIR /app
  COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
  RUN corepack enable && pnpm install --frozen-lockfile

  FROM node:22.22.3-alpine AS builder
  WORKDIR /app 
  COPY --from=deps /app/node_modules ./node_modules
  COPY . .
  RUN corepack enable && \
      DATABASE_URL=postgresql://dummy:dummy@localhost/dummy pnpm prisma generate && \
      pnpm build && \
      pnpm prune --prod

  FROM node:22.22.3-alpine AS runner
  WORKDIR /app
  ENV NODE_ENV=production \
      PORT=3001

  RUN apk add --no-cache openssl dumb-init && \
      addgroup -S app && adduser -S app -G app

  COPY --from=builder --chown=app:app /app/node_modules ./node_modules
  COPY --from=builder --chown=app:app /app/dist ./dist
  COPY --from=builder --chown=app:app /app/prisma ./prisma
  COPY --from=builder --chown=app:app /app/package.json ./

  USER app

  EXPOSE 3001
  HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
    CMD wget -qO- http://localhost:3001/health || exit 1

  ENTRYPOINT ["dumb-init", "--"]
  CMD ["sh", "-c", "node node_modules/prisma/build/index.js migrate deploy && exec node dist/main.js"]