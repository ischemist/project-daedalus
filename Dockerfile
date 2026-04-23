FROM node:22-alpine AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable

WORKDIR /app

FROM base AS deps

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/web/package.json apps/web/package.json

RUN pnpm install --frozen-lockfile

FROM base AS builder

ARG DATABASE_URL="postgresql://postgres:postgres@localhost:5432/daedalus?schema=public"
ARG BETTER_AUTH_SECRET="build-placeholder-secret"
ARG BETTER_AUTH_URL="http://localhost:3000"
ENV DATABASE_URL="$DATABASE_URL" \
    BETTER_AUTH_SECRET="$BETTER_AUTH_SECRET" \
    BETTER_AUTH_URL="$BETTER_AUTH_URL"

COPY --from=deps /app /app
COPY . .

RUN pnpm db:generate

RUN pnpm build

FROM base AS runner

ENV NODE_ENV=production

COPY --from=builder /app /app

EXPOSE 3000

CMD ["pnpm", "--filter", "@ischemist/web", "start"]
