FROM node:20-alpine AS base
RUN apk update && apk upgrade && rm -rf /var/cache/apk/*
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS builder
WORKDIR /app
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm --filter upquit-backend run build
RUN pnpm deploy --filter upquit-backend --prod --legacy /app/deploy

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs && \
  adduser --system --uid 1001 backend --ingroup nodejs

COPY --from=builder --chown=backend:nodejs /app/deploy ./

USER backend

EXPOSE 8080

CMD ["node", "dist/index.js"]