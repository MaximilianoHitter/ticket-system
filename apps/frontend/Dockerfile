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
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json .npmrc ./
COPY apps/frontend/package.json ./apps/frontend/package.json
COPY packages/shared-types/package.json ./packages/shared-types/package.json

RUN pnpm install --frozen-lockfile --filter frontend...

################################
# Build: compila el frontend (Vite)
################################
FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/frontend/node_modules ./apps/frontend/node_modules
COPY --from=deps /app/packages/shared-types/node_modules ./packages/shared-types/node_modules

COPY pnpm-workspace.yaml pnpm-lock.yaml package.json .npmrc ./
COPY apps/frontend ./apps/frontend
COPY packages/shared-types ./packages/shared-types

# Variables de entorno que Vite necesita "hornear" en el build (ej: URL de la API)
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

RUN pnpm --filter frontend... build

################################
# Production: nginx sirviendo estáticos
################################
FROM nginx:alpine AS production

COPY --from=build /app/apps/frontend/dist /usr/share/nginx/html
COPY apps/frontend/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]