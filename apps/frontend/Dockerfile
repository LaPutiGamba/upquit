FROM node:22-alpine AS base
RUN npm install -g pnpm@11.0.9

FROM base AS builder
WORKDIR /app

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/frontend ./apps/frontend
RUN pnpm install --frozen-lockfile

RUN rm -f apps/frontend/.env && cp ../../.env apps/frontend/.env || true

ARG NEXT_PUBLIC_BACKEND_URL
ENV NEXT_PUBLIC_BACKEND_URL=$NEXT_PUBLIC_BACKEND_URL

RUN pnpm --filter upquit-frontend run build

FROM base AS runner
WORKDIR /app
COPY --from=builder /app ./
WORKDIR /app/apps/frontend
EXPOSE 3000
CMD ["pnpm", "start"]