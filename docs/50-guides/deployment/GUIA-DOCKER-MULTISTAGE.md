---
titulo: Guia de Docker Multi-Stage para Gamilit
version: 1.0.0
fecha_creacion: 2026-02-14
tags: [devops, docker, contenedores, deployment]
aplica_a: [backend, frontend, devops]
estado: vigente
---

# Guia de Docker Multi-Stage para Gamilit

> **Version:** 1.0.0
> **Fecha:** 2026-02-14
> **Stack:** NestJS 11 + React 19 + PostgreSQL 15 + Redis 7 + Vite 6.x

---

## Indice

1. [Proposito](#1-proposito)
2. [Arquitectura de Contenedores](#2-arquitectura-de-contenedores)
3. [Dockerfile Backend (NestJS Multi-Stage)](#3-dockerfile-backend-nestjs-multi-stage)
4. [Dockerfile Frontend (Vite + Nginx)](#4-dockerfile-frontend-vite--nginx)
5. [Docker Compose para Desarrollo Local](#5-docker-compose-para-desarrollo-local)
6. [Archivo .dockerignore](#6-archivo-dockerignore)
7. [Comandos de Uso](#7-comandos-de-uso)
8. [Configuracion Nginx para Frontend](#8-configuracion-nginx-para-frontend)
9. [Consideraciones para Produccion](#9-consideraciones-para-produccion)
10. [Best Practices](#10-best-practices)
11. [Tamano Estimado de Images](#11-tamano-estimado-de-images)
12. [Checklist Docker](#12-checklist-docker)

---

## 1. Proposito

Containerizar la plataforma gamilit para lograr:

- **Desarrollo local consistente:** Todos los desarrolladores trabajan con el mismo entorno (PostgreSQL 15, Redis 7, Node.js 20).
- **Builds reproducibles:** Multi-stage builds garantizan que el artefacto de produccion es identico en cualquier maquina.
- **Preparacion para escalamiento:** Cuando el proyecto necesite migrar a containers en produccion (Kubernetes, Docker Swarm, etc.).

### Estado Actual vs Docker

| Aspecto | Estado Actual | Con Docker |
|---------|---------------|------------|
| Base de datos | PostgreSQL local/WSL | Container `postgres:15-alpine` |
| Redis | Redis local/WSL | Container `redis:7-alpine` |
| Backend | `npm run start:dev` en terminal | Container con hot-reload |
| Frontend | `npm run dev` (Vite) en terminal | Container con hot-reload |
| Setup inicial | Manual (instalar PG, Redis, Node) | `docker compose up -d` |
| Produccion | PM2 + bare metal (74.208.126.102) | Sin cambio (fase futura) |

---

## 2. Arquitectura de Contenedores

```
┌─────────────────── Docker Compose ──────────────────┐
│                                                       │
│  ┌──────────────┐  ┌──────────────┐                  │
│  │   postgres   │  │    redis     │                  │
│  │  :5432       │  │   :6379      │  Servicios base  │
│  │  PG 15       │  │   Redis 7   │                  │
│  └──────┬───────┘  └──────┬───────┘                  │
│         │                  │                          │
│         └────────┬─────────┘                          │
│                  │                                    │
│         ┌────────┴────────┐                           │
│         │                 │                           │
│  ┌──────┴───────┐  ┌─────┴────────┐                  │
│  │   backend    │  │   frontend   │  Aplicaciones    │
│  │  :3006       │  │   :3005      │                  │
│  │  NestJS 11   │  │  Nginx/Vite  │                  │
│  └──────────────┘  └──────────────┘                  │
│                                                       │
└───────────────────────────────────────────────────────┘
         │                    │
         ▼                    ▼
   API: localhost:3006   UI: localhost:3005
```

---

## 3. Dockerfile Backend (NestJS Multi-Stage)

Crear en `apps/backend/Dockerfile`:

```dockerfile
# ==============================================================================
# GAMILIT Backend - NestJS 11 Multi-Stage Dockerfile
# ==============================================================================

# ---------- Stage 1: Dependencias ----------
FROM node:20-alpine AS deps
WORKDIR /app

# Copiar solo archivos de dependencias para aprovechar cache de Docker
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts

# ---------- Stage 2: Build ----------
FROM node:20-alpine AS builder
WORKDIR /app

# Copiar dependencias del stage anterior
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Compilar TypeScript a JavaScript
RUN npm run build

# ---------- Stage 3: Produccion ----------
FROM node:20-slim AS production
WORKDIR /app

# Crear usuario no-root para seguridad
RUN groupadd --gid 1001 nodejs && \
    useradd --uid 1001 --gid nodejs nestjs

# Copiar solo lo necesario para ejecutar
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/package.json ./
COPY --from=builder --chown=nestjs:nodejs /app/tsconfig-paths-bootstrap.js ./

# Variables de entorno por defecto
ENV NODE_ENV=production
ENV PORT=3006

# Exponer puerto interno (mismo que ecosystem.config.js)
EXPOSE 3006

# Cambiar a usuario no-root
USER nestjs

# Health check integrado
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:3006/api/v1/health || exit 1

# tsconfig-paths-bootstrap.js requerido para resolver path aliases (@modules/*, etc.)
CMD ["node", "-r", "./tsconfig-paths-bootstrap.js", "dist/main.js"]
```

### Notas del Dockerfile Backend

- **3 stages:** Separa dependencias, build y runtime para minimizar tamano final.
- **tsconfig-paths-bootstrap.js:** Archivo critico que resuelve los path aliases de TypeScript en runtime. Sin el, NestJS no encuentra los modulos.
- **node:20-slim:** Mas ligero que `node:20` pero incluye libc necesario para modulos nativos.
- **Usuario no-root:** Mejora seguridad al no ejecutar como root dentro del container.
- **Health check:** Usa el endpoint `/api/v1/health` existente en el modulo health de gamilit.

---

## 4. Dockerfile Frontend (Vite + Nginx)

Crear en `apps/frontend/Dockerfile`:

```dockerfile
# ==============================================================================
# GAMILIT Frontend - React 19 + Vite 6.x Multi-Stage Dockerfile
# ==============================================================================

# ---------- Stage 1: Dependencias ----------
FROM node:20-alpine AS deps
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# ---------- Stage 2: Build ----------
FROM node:20-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Variables de entorno para el build de Vite
# (se inyectan en build time, no en runtime)
ARG VITE_API_URL=http://localhost:3006
ARG VITE_ENV=production
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_ENV=$VITE_ENV

# Compilar con Vite (genera /app/dist con archivos estaticos)
RUN npm run build

# ---------- Stage 3: Servir con Nginx ----------
FROM nginx:alpine AS production

# Copiar archivos estaticos compilados
COPY --from=builder /app/dist /usr/share/nginx/html

# Copiar configuracion personalizada de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exponer puerto (consistente con ecosystem.config.js)
EXPOSE 3005

# Health check
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD curl -f http://localhost:3005/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
```

### Notas del Dockerfile Frontend

- **Build-time env vars:** Las variables `VITE_*` se inyectan durante el build de Vite, no en runtime. Usar `ARG` para personalizarlas.
- **nginx:alpine:** Servidor web optimizado para archivos estaticos (~30MB).
- **SPA routing:** La configuracion de Nginx debe manejar `try_files` para que React Router funcione correctamente.

---

## 5. Docker Compose para Desarrollo Local

Crear `docker-compose.yml` en la raiz del repositorio:

```yaml
# ==============================================================================
# GAMILIT - Docker Compose para Desarrollo Local
# ==============================================================================
# Uso: docker compose up -d
# Puertos consistentes con ecosystem.config.js y configuracion del proyecto
# ==============================================================================

version: '3.8'

services:
  # ============================================================================
  # PostgreSQL 15 - Base de datos principal
  # ============================================================================
  postgres:
    image: postgres:15-alpine
    container_name: gamilit-postgres
    restart: unless-stopped
    environment:
      POSTGRES_DB: gamilit_platform
      POSTGRES_USER: gamilit_user
      POSTGRES_PASSWORD: gamilit_dev_2026
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
      # Montar DDL scripts para inicializacion automatica
      # NOTA: Solo ejecuta en primera creacion del volumen
      # Para reiniciar: docker compose down -v && docker compose up -d
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U gamilit_user -d gamilit_platform"]
      interval: 10s
      timeout: 5s
      retries: 5

  # ============================================================================
  # Redis 7 - Cache y WebSocket adapter (Socket.IO 4.8+)
  # ============================================================================
  redis:
    image: redis:7-alpine
    container_name: gamilit-redis
    restart: unless-stopped
    ports:
      - "6379:6379"
    volumes:
      - redisdata:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  # ============================================================================
  # Backend - NestJS 11 API
  # ============================================================================
  backend:
    build:
      context: ./apps/backend
      dockerfile: Dockerfile
      target: production  # Usar stage de produccion
    container_name: gamilit-backend
    restart: unless-stopped
    ports:
      - "3006:3006"
    environment:
      NODE_ENV: development
      PORT: 3006
      # Base de datos
      DB_HOST: postgres
      DB_PORT: 5432
      DB_USERNAME: gamilit_user
      DB_PASSWORD: gamilit_dev_2026
      DB_DATABASE: gamilit_platform
      # Redis (para Socket.IO adapter y cache)
      REDIS_HOST: redis
      REDIS_PORT: 6379
      REDIS_DB: 0
      # JWT (cambiar en produccion)
      JWT_SECRET: dev-jwt-secret-change-in-prod
      JWT_EXPIRES_IN: 24h
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3006/api/v1/health"]
      interval: 30s
      timeout: 5s
      start_period: 15s
      retries: 3

  # ============================================================================
  # Frontend - React 19 + Vite 6.x (servido por Nginx)
  # ============================================================================
  frontend:
    build:
      context: ./apps/frontend
      dockerfile: Dockerfile
      args:
        VITE_API_URL: http://localhost:3006
        VITE_ENV: development
    container_name: gamilit-frontend
    restart: unless-stopped
    ports:
      - "3005:3005"
    depends_on:
      backend:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3005/"]
      interval: 30s
      timeout: 5s
      retries: 3

# ==============================================================================
# Volumenes persistentes
# ==============================================================================
volumes:
  pgdata:
    driver: local
  redisdata:
    driver: local
```

### Docker Compose para Desarrollo con Hot-Reload

Para desarrollo activo con hot-reload (sin necesidad de rebuild):

```yaml
# docker-compose.dev.yml
# Uso: docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d
version: '3.8'

services:
  backend:
    build:
      target: deps  # Solo usar stage de dependencias
    command: npm run start:dev
    volumes:
      - ./apps/backend/src:/app/src:ro  # Montar codigo fuente
    environment:
      NODE_ENV: development

  frontend:
    build:
      context: ./apps/frontend
      dockerfile: Dockerfile
      target: deps
    command: npx vite --host 0.0.0.0 --port 3005
    volumes:
      - ./apps/frontend/src:/app/src:ro  # Montar codigo fuente
    ports:
      - "3005:3005"
```

---

## 6. Archivo .dockerignore

Crear `.dockerignore` en la raiz del repositorio y en cada app:

### `.dockerignore` (raiz)

```
# Dependencias
node_modules
**/node_modules

# Build output
dist
**/dist
coverage
**/coverage

# Entorno
.env
.env.local
.env.production
**/.env*

# Git
.git
.gitignore

# Documentacion y orquestacion (no necesarios en imagen)
docs/
orchestration/
*.md
!README.md

# Logs
*.log
logs/

# IDE
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db

# Docker
docker-compose*.yml
Dockerfile*
.dockerignore
```

### `apps/backend/.dockerignore`

```
node_modules
dist
coverage
.env
.env.*
*.log
test/
*.spec.ts
*.test.ts
```

### `apps/frontend/.dockerignore`

```
node_modules
dist
coverage
.env
.env.*
*.log
*.spec.ts
*.spec.tsx
*.test.ts
*.test.tsx
```

---

## 7. Comandos de Uso

### Desarrollo Local Completo

```bash
# Levantar todos los servicios (postgres, redis, backend, frontend)
docker compose up -d

# Ver estado de los servicios
docker compose ps

# Ver logs de todos los servicios
docker compose logs -f

# Ver logs de un servicio especifico
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f postgres

# Rebuild despues de cambios en Dockerfile o dependencias
docker compose up -d --build

# Rebuild un servicio especifico
docker compose up -d --build backend

# Detener todos los servicios
docker compose down

# Detener y eliminar volumenes (BORRA datos de BD)
docker compose down -v

# Ejecutar comando dentro de un contenedor
docker compose exec backend sh
docker compose exec postgres psql -U gamilit_user -d gamilit_platform
docker compose exec redis redis-cli
```

### Solo Infraestructura (BD + Redis)

Para desarrolladores que prefieren ejecutar backend/frontend directamente con Node.js:

```bash
# Levantar solo postgres y redis
docker compose up -d postgres redis

# Backend y frontend se ejecutan con npm run start:dev localmente
# usando DB_HOST=localhost y REDIS_HOST=localhost
```

### Rebuild Limpio

```bash
# Eliminar todo y reconstruir desde cero
docker compose down -v --rmi all
docker compose up -d --build
```

---

## 8. Configuracion Nginx para Frontend

Crear `apps/frontend/nginx.conf`:

```nginx
# ==============================================================================
# GAMILIT Frontend - Nginx Configuration
# ==============================================================================
# Configuracion para servir la SPA de React con Vite
# Puerto: 3005 (consistente con ecosystem.config.js)
# ==============================================================================

server {
    listen 3005;
    server_name localhost;

    root /usr/share/nginx/html;
    index index.html;

    # Gzip compression para mejor rendimiento
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types
        text/plain
        text/css
        text/javascript
        application/javascript
        application/json
        application/xml
        image/svg+xml;

    # Cache para archivos estaticos (Vite genera hashes en nombres)
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        try_files $uri =404;
    }

    # SPA fallback: todas las rutas redirigen a index.html
    # Necesario para que React Router funcione correctamente
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy para API (opcional, si frontend necesita hacer llamadas relativas)
    # location /api/ {
    #     proxy_pass http://backend:3006;
    #     proxy_set_header Host $host;
    #     proxy_set_header X-Real-IP $remote_addr;
    #     proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    #     proxy_set_header X-Forwarded-Proto $scheme;
    # }

    # Deshabilitar acceso a archivos ocultos
    location ~ /\. {
        deny all;
        return 404;
    }
}
```

---

## 9. Consideraciones para Produccion

### Estado Actual: PM2 + Bare Metal

Actualmente gamilit se despliega en `74.208.126.102` con:
- **PM2** gestionando procesos backend (`:3006`) y frontend (`:3005`)
- **Nginx** como reverse proxy con SSL/HTTPS (`:443`)
- **PostgreSQL 15** instalado directamente en el servidor
- **Redis** instalado directamente en el servidor

Esta configuracion es **suficiente para el MVP** y el volumen actual de usuarios.

### Cuando Migrar a Docker en Produccion

| Senal | Accion |
|-------|--------|
| Necesidad de escalar horizontalmente | Considerar Docker + orchestrator |
| Mas de un servidor de produccion | Docker facilita despliegues consistentes |
| Entorno de staging requerido | Docker Compose para staging identico a prod |
| Equipo de desarrollo crece (5+ devs) | Docker normaliza entorno local |
| Rollbacks frecuentes | Docker images permiten rollback instantaneo |

### Riesgos de Docker en Produccion

| Riesgo | Mitigacion |
|--------|------------|
| Overhead de networking entre containers | Usar `host` network mode para BD |
| Gestion de volumenes para PostgreSQL | Backups regulares, volumen nombrado |
| Complejidad de debugging | Logs centralizados, `docker compose logs` |
| Instalacion de Docker en servidor | Docker Engine + docker-compose-plugin |
| Actualizacion de images base | Renovar images base mensualmente |

### Migracion Gradual

1. **Fase 1 (Actual):** Docker solo para desarrollo local.
2. **Fase 2:** Docker para CI/CD (build images en GitHub Actions).
3. **Fase 3:** Docker en staging (servidor secundario).
4. **Fase 4:** Docker en produccion (reemplazar PM2).

---

## 10. Best Practices

### Seguridad

- **No ejecutar como root:** Usar `USER node` o crear usuario dedicado.
- **No copiar secrets:** Jamas incluir `.env`, claves SSH o credenciales en la imagen.
- **Escanear vulnerabilidades:** Usar `docker scout` o `trivy` para detectar CVEs en images base.
- **Images firmadas:** Usar images oficiales de Docker Hub.

### Rendimiento

- **Multi-stage builds:** Separar build y runtime reduce tamano significativamente.
- **Alpine images:** Usar variantes `-alpine` cuando sea posible (menor superficie de ataque).
- **Layer caching:** Ordenar COPY/RUN de menos cambiante a mas cambiante.
- **`.dockerignore` estricto:** Evitar copiar `node_modules`, `dist`, `.git` al contexto de build.

### Orden Optimo de Instrucciones

```dockerfile
# 1. Base image (cambia rara vez)
FROM node:20-alpine

# 2. Dependencias del sistema (cambia rara vez)
RUN apk add --no-cache curl

# 3. package.json (cambia al agregar dependencias)
COPY package*.json ./
RUN npm ci

# 4. Codigo fuente (cambia frecuentemente)
COPY . .
RUN npm run build
```

Este orden maximiza el cache de Docker: si solo cambia codigo fuente (paso 4), los pasos 1-3 se reutilizan del cache.

### Health Checks

Siempre incluir HEALTHCHECK en el Dockerfile:

```dockerfile
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:PORT/health || exit 1
```

---

## 11. Tamano Estimado de Images

| Image | Base | Estimado | Notas |
|-------|------|----------|-------|
| Backend (NestJS) | `node:20-slim` | ~250 MB | Incluye node_modules de produccion |
| Frontend (Nginx) | `nginx:alpine` | ~30 MB | Solo archivos estaticos compilados |
| PostgreSQL | `postgres:15-alpine` | ~80 MB | Image oficial, incluye extensiones |
| Redis | `redis:7-alpine` | ~30 MB | Image oficial, minimal |
| **Total stack** | | **~390 MB** | Comparado con ~2GB sin multi-stage |

### Comparacion Sin Multi-Stage

| Metrica | Sin Multi-Stage | Con Multi-Stage |
|---------|----------------|-----------------|
| Backend image | ~1.2 GB | ~250 MB |
| Frontend image | ~800 MB | ~30 MB |
| Tiempo de pull | ~5 min | ~1 min |
| Superficie de ataque | Alta (compiler, dev deps) | Baja (solo runtime) |

---

## 12. Checklist Docker

### Configuracion Inicial

- [ ] Instalar Docker Desktop (Windows/Mac) o Docker Engine (Linux)
- [ ] Verificar: `docker --version` (>= 24.x)
- [ ] Verificar: `docker compose version` (>= 2.x)

### Archivos a Crear

- [ ] `apps/backend/Dockerfile` (contenido seccion 3)
- [ ] `apps/frontend/Dockerfile` (contenido seccion 4)
- [ ] `apps/frontend/nginx.conf` (contenido seccion 8)
- [ ] `docker-compose.yml` en raiz (contenido seccion 5)
- [ ] `.dockerignore` en raiz (contenido seccion 6)
- [ ] `apps/backend/.dockerignore` (contenido seccion 6)
- [ ] `apps/frontend/.dockerignore` (contenido seccion 6)

### Validacion

- [ ] `docker compose up -d` levanta todos los servicios sin errores
- [ ] `docker compose ps` muestra todos los servicios healthy
- [ ] Backend responde en `http://localhost:3006/api/v1/health`
- [ ] Frontend carga en `http://localhost:3005`
- [ ] PostgreSQL acepta conexiones: `docker compose exec postgres psql -U gamilit_user -d gamilit_platform`
- [ ] Redis responde: `docker compose exec redis redis-cli ping`
- [ ] `docker compose down -v && docker compose up -d` funciona (rebuild limpio)

### Mantenimiento

- [ ] Revisar actualizaciones de images base mensualmente
- [ ] Ejecutar `docker scout quickview` para vulnerabilidades
- [ ] Limpiar images no usadas: `docker image prune -a`
- [ ] Documentar cambios en Dockerfiles cuando se modifiquen dependencias

---

## Relacion con Otros Documentos

| Documento | Relacion |
|-----------|----------|
| `GUIA-GITHUB-ACTIONS-CICD.md` | CI/CD puede usar Docker para builds consistentes |
| `GUIA-DESPLIEGUE-PRODUCCION-COMPLETA.md` | Deploy actual sin Docker, referencia de arquitectura |
| `ecosystem.config.js` | Puertos 3006/3005 son consistentes con Docker |
| `GUIA-SSL-NGINX-PRODUCCION.md` | Nginx en produccion vs Nginx en container de frontend |

---

*Guia Docker Multi-Stage v1.0.0 — gamilit monorepo — Actualizado 2026-02-14*
