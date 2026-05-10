FROM node:22-alpine AS base
RUN npm install -g pnpm@11.0.9

FROM base AS builder
WORKDIR /app

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/backend ./apps/backend
RUN pnpm install --frozen-lockfile

RUN rm -f apps/frontend/.env && cp ../../.env apps/frontend/.env || true

RUN pnpm --filter upquit-backend run build

FROM base AS runner
WORKDIR /app
COPY --from=builder /app ./
WORKDIR /app/apps/backend
EXPOSE 8080
CMD pnpm run db:migrate && pnpm run db:seed && node dist/index.js