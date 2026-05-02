FROM node:20-alpine AS base
RUN apk update && apk upgrade && rm -rf /var/cache/apk/*
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS builder
WORKDIR /app
COPY . .
COPY ../../.env /app/apps/frontend/.env

ARG NEXT_PUBLIC_BACKEND_URL
ENV NEXT_PUBLIC_BACKEND_URL=$NEXT_PUBLIC_BACKEND_URL

RUN pnpm install --frozen-lockfile
RUN pnpm --filter frontend run build
RUN pnpm deploy --filter frontend --prod --legacy /app/deploy
# Ensure that the compiled Next.js folder is moved to the deployment folder
RUN cp -r apps/frontend/.next /app/deploy/.next || true

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs && \
  adduser --system --uid 1001 nextjs --ingroup nodejs

COPY --from=builder --chown=nextjs:nodejs /app/deploy ./

USER nextjs

EXPOSE 3000

CMD ["pnpm", "start"]