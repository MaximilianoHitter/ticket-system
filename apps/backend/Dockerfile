# syntax=docker/dockerfile:1

################################
# Base: Node + pnpm habilitado
################################
FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate
WORKDIR /app

################################
# Deps: instala dependencias del workspace
################################
FROM base AS deps
# Copiamos solo lo necesario para resolver dependencias (mejor cache de Docker)
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json .npmrc ./
COPY apps/backend/package.json ./apps/backend/package.json
COPY packages/shared-types/package.json ./packages/shared-types/package.json

RUN pnpm install --frozen-lockfile --filter backend...

################################
# Build: compila el backend
################################
FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/backend/node_modules ./apps/backend/node_modules
COPY --from=deps /app/packages/shared-types/node_modules ./packages/shared-types/node_modules

COPY pnpm-workspace.yaml pnpm-lock.yaml package.json .npmrc ./
COPY apps/backend ./apps/backend
COPY packages/shared-types ./packages/shared-types

RUN pnpm --filter backend... build

################################
# Production: imagen final liviana
################################
FROM base AS production
ENV NODE_ENV=production

COPY pnpm-workspace.yaml pnpm-lock.yaml package.json .npmrc ./
COPY apps/backend/package.json ./apps/backend/package.json
COPY packages/shared-types/package.json ./packages/shared-types/package.json

# Solo dependencias de producción
RUN pnpm install --frozen-lockfile --prod --filter backend...

COPY --from=build /app/apps/backend/dist ./apps/backend/dist
COPY --from=build /app/packages/shared-types/dist ./packages/shared-types/dist

WORKDIR /app/apps/backend
EXPOSE 3000

CMD ["node", "dist/main.js"]