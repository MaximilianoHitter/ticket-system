# Ticket System

Sistema de gestión de tickets full-stack, desarrollado como proyecto de aprendizaje. Monorepo con backend en NestJS (arquitectura hexagonal), frontend en React, PostgreSQL como base de datos, y toda la infraestructura orquestada con Docker.

## Stack

- **Backend:** NestJS + arquitectura hexagonal
- **Frontend:** React + Vite + Tailwind + shadcn/ui + TanStack Query + Zustand
- **Base de datos:** PostgreSQL
- **ORM:** Prisma _(a integrar en Fase 1)_
- **Monorepo:** pnpm workspaces
- **Infraestructura:** Docker + Docker Compose + nginx (api-gateway)

## Estructura del proyecto

```
.
├── apps/
│   ├── backend/         # NestJS API (arquitectura hexagonal)
│   ├── frontend/         # React + Vite
│   └── api-gateway/      # nginx reverse proxy
├── packages/
│   ├── shared-types/     # Tipos/enums compartidos entre back y front
│   ├── eslint-config/    # Config compartida de ESLint (base/nest/react)
│   └── prettier-config/  # Config compartida de Prettier
├── docker-compose.yml
├── pnpm-workspace.yaml
└── .env.example
```

## Requisitos previos

- [Node.js](https://nodejs.org/) 20+
- [pnpm](https://pnpm.io/) 9+ (`npm install -g pnpm`)
- [Docker](https://www.docker.com/) y Docker Compose (para levantar el stack completo)

## Setup inicial

1. Cloná el repositorio:

```bash
   git clone https://github.com/MaximilianoHitter/ticket-system
   cd ticket-system
```

2. Copiá el archivo de variables de entorno:

```bash
   cp .env.example .env
```

Completá los valores en `.env` (credenciales de Postgres, `JWT_SECRET`, etc.).

3. Instalá las dependencias del workspace:

```bash
   pnpm install
```

## Correr el proyecto

### Opción A — Con Docker (recomendado, levanta todo el stack)

```bash
docker compose up --build
```

Esto levanta 4 servicios en la red `ticketapp-net`:

| Servicio      | Descripción                    | Acceso                                |
| ------------- | ------------------------------ | ------------------------------------- |
| `api-gateway` | Punto de entrada único (nginx) | http://localhost                      |
| `frontend`    | React servido por nginx        | vía gateway (`http://localhost/`)     |
| `backend`     | API NestJS                     | vía gateway (`http://localhost/api/`) |
| `db`          | PostgreSQL                     | `localhost:5432` (cliente externo)    |

Para apagar los servicios (conservando los datos de Postgres):

```bash
docker compose down
```

Para apagar y **borrar también el volumen de datos** de Postgres:

```bash
docker compose down -v
```

### Opción B — Desarrollo local sin Docker (solo apps, DB sigue en Docker)

Es útil para tener hot-reload rápido en backend/frontend mientras seguís usando Postgres en contenedor:

```bash
docker compose up db -d
```

Y en dos terminales separadas:

```bash
pnpm --filter backend start:dev
pnpm --filter frontend dev
```

> Nota: en este modo, `DATABASE_URL` en tu `.env` local del backend debe apuntar a `localhost:5432` (no `db:5432`, que solo se resuelve dentro de la red de Docker).

## Variables de entorno

Ver `.env.example` para la lista completa. Las más relevantes:

| Variable            | Descripción                                             |
| ------------------- | ------------------------------------------------------- |
| `POSTGRES_USER`     | Usuario de Postgres                                     |
| `POSTGRES_PASSWORD` | Password de Postgres                                    |
| `POSTGRES_DB`       | Nombre de la base de datos                              |
| `DATABASE_URL`      | Connection string completo (usado por el backend)       |
| `JWT_SECRET`        | Secreto para firmar tokens JWT                          |
| `BACKEND_PORT`      | Puerto interno del backend (default `3000`)             |
| `VITE_API_URL`      | URL base de la API que consume el frontend (build-time) |

## Scripts útiles (desde la raíz)

```bash
pnpm dev:backend      # corre el backend en modo watch
pnpm dev:frontend     # corre el frontend en modo dev
pnpm lint             # lint en todos los paquetes del workspace
pnpm format           # formatea todos los paquetes con Prettier
pnpm build            # build de todos los paquetes
```

## Convenciones y notas técnicas

- **Gestor de paquetes:** el proyecto usa exclusivamente `pnpm`. No usar `npm install` ni `yarn`, rompe el lockfile del workspace.
- **Dependencias entre paquetes internos:** se agregan con `pnpm --filter <app> add <paquete>@workspace:*`.
- **Pre-commit hooks:** Husky + lint-staged corren ESLint y Prettier automáticamente sobre los archivos modificados en cada commit.
- **`shared-types`:** cualquier tipo, enum o DTO usado tanto en backend como frontend debe vivir en `packages/shared-types` y compilarse (`pnpm --filter @ticketapp/shared-types build`) antes de que otros paquetes lo consuman en un build limpio.

## Roadmap

El seguimiento de tareas y fases del proyecto se lleva en el [GitHub Project](https://github.com/users/MaximilianoHitter/projects/6).

**Fases:**

- ✅ Fase 0 — Infraestructura del monorepo
- ⬜ Fase 1 — Backend base + Autenticación (JWT)
- ⬜ Fase 2 — Gestión de usuarios
- ⬜ Fase 3 — Proyectos
- ⬜ Fase 4 — Tickets
- ⬜ Fase 5 — Frontend base + Auth
- ⬜ Fase 6 — Frontend: proyectos y tickets
- ⬜ Fase 7 — Infra final (deploy)
- ⬜ Fase 8 — Extras (2FA, login con Google, CI/CD)

## Licencia

Este proyecto es de uso personal y no está licenciado para su uso, copia
o distribución por terceros. El repositorio es público únicamente con
fines de portfolio. Ver [LICENSE](./LICENSE) para más detalles.
