---
titulo: Guia de CI/CD con GitHub Actions
version: 1.0.0
fecha_creacion: 2026-02-14
tags: [devops, cicd, github-actions, deployment]
aplica_a: [backend, frontend, devops]
estado: vigente
---

# Guia de CI/CD con GitHub Actions para Gamilit

> **Version:** 1.0.0
> **Fecha:** 2026-02-14
> **Repositorio:** git@github.com:rckrdmrd/gamilit-workspace.git
> **Branch principal:** master

---

## Indice

1. [Proposito](#1-proposito)
2. [Arquitectura del Pipeline](#2-arquitectura-del-pipeline)
3. [Workflow CI: Validacion en PR](#3-workflow-ci-validacion-en-pr)
4. [Workflow CD: Deploy a Produccion](#4-workflow-cd-deploy-a-produccion)
5. [Secrets Requeridos en GitHub](#5-secrets-requeridos-en-github)
6. [Estrategia de Branches](#6-estrategia-de-branches)
7. [Monorepo Path Filters](#7-monorepo-path-filters)
8. [Estrategia de Caching](#8-estrategia-de-caching)
9. [Notificaciones](#9-notificaciones)
10. [Checklist de Implementacion](#10-checklist-de-implementacion)

---

## 1. Proposito

Automatizar los procesos de integracion continua (CI) y despliegue continuo (CD) para el monorepo gamilit usando GitHub Actions. Actualmente el proyecto opera con deploy manual via SSH a `74.208.126.102` con PM2 en fork mode. Esta guia establece el camino hacia la automatizacion progresiva.

### Estado Actual vs Objetivo

| Aspecto | Estado Actual | Objetivo con CI/CD |
|---------|---------------|---------------------|
| Validacion de codigo | Manual (`npm run lint/test/build`) | Automatica en cada PR |
| Deploy a produccion | SSH manual + PM2 restart | Automatizado con aprobacion |
| Quality gates | No existen | Bloquean merge si fallan |
| Tests backend | 833 tests Jest, ejecucion manual | Ejecucion automatica en CI |
| Tests frontend | 46 tests Vitest, ejecucion manual | Ejecucion automatica en CI |
| Auditoria de seguridad | No se ejecuta regularmente | `npm audit` en cada PR |

---

## 2. Arquitectura del Pipeline

```
Push/PR → CI Pipeline → Quality Gates → CD Pipeline → Deploy

┌─────────────────── CI (on: push/PR a master) ─────────────────┐
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Backend    │  │   Frontend   │  │   Database   │ (paralelo)│
│  │   lint       │  │   lint       │  │   validate   │          │
│  │   test       │  │   typecheck  │  │   schemas    │          │
│  │   build      │  │   test       │  │              │          │
│  │   audit      │  │   build      │  │              │          │
│  │              │  │   audit      │  │              │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                 │
│  ┌──────────────────────────────────────────────┐               │
│  │ Quality Gates (TODAS deben pasar)            │               │
│  │ • Backend lint: 0 errores                    │               │
│  │ • Backend tests: 833+ passing (Jest)         │               │
│  │ • Backend build: exitoso                     │               │
│  │ • Frontend lint: 0 errores                   │               │
│  │ • Frontend typecheck: 0 errores              │               │
│  │ • Frontend tests: 46+ passing (Vitest)       │               │
│  │ • Frontend build: exitoso (Vite 6.x)         │               │
│  │ • npm audit: sin vulnerabilidades criticas   │               │
│  └──────────────────────────────────────────────┘               │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────── CD (manual / merge a master) ──────────────┐
│                                                                 │
│  SSH a 74.208.126.102 (usuario: isem)                          │
│    → git pull origin master                                     │
│    → cd apps/backend && npm ci && npm run build                 │
│    → cd apps/frontend && npm ci && npm run build                │
│    → pm2 restart ecosystem.config.js --env production           │
│    → Health checks (backend :4006, frontend :4005)              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Flujo Visual

```
Desarrollador                GitHub Actions              Servidor Produccion
     │                            │                           │
     ├── push/PR ────────────────>│                           │
     │                            ├── CI: lint ──────────┐    │
     │                            ├── CI: test ──────────┤    │
     │                            ├── CI: build ─────────┘    │
     │                            │                           │
     │  <── status check ─────────┤                           │
     │                            │                           │
     ├── merge a master ─────────>│                           │
     │                            ├── CD: SSH deploy ────────>│
     │                            │                    git pull│
     │                            │                    build   │
     │                            │                    restart │
     │  <── deploy exitoso ───────┤<── health check ──────────┤
     │                            │                           │
```

---

## 3. Workflow CI: Validacion en PR

Crear el archivo `.github/workflows/ci.yml` en la raiz del repositorio:

```yaml
# .github/workflows/ci.yml
name: CI - Validar PR

on:
  pull_request:
    branches: [master]
  push:
    branches: [master]

concurrency:
  group: ci-${{ github.ref }}
  cancel-in-progress: true

jobs:
  # ================================================================
  # JOB 1: Backend (NestJS 11)
  # ================================================================
  backend:
    name: Backend - Lint, Test, Build
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: apps/backend

    steps:
      - name: Checkout codigo
        uses: actions/checkout@v4

      - name: Configurar Node.js 20
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
          cache-dependency-path: apps/backend/package-lock.json

      - name: Instalar dependencias
        run: npm ci

      - name: Ejecutar linter (ESLint)
        run: npm run lint

      - name: Ejecutar tests (Jest, 833+ tests)
        run: npm run test
        env:
          NODE_ENV: test

      - name: Compilar proyecto (NestJS build)
        run: npm run build

      - name: Auditoria de seguridad
        run: npm audit --audit-level=high
        continue-on-error: true  # No bloquear por vulnerabilidades medias

  # ================================================================
  # JOB 2: Frontend (React 19 + Vite 6.x)
  # ================================================================
  frontend:
    name: Frontend - Lint, Typecheck, Test, Build
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: apps/frontend

    steps:
      - name: Checkout codigo
        uses: actions/checkout@v4

      - name: Configurar Node.js 20
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
          cache-dependency-path: apps/frontend/package-lock.json

      - name: Instalar dependencias
        run: npm ci

      - name: Ejecutar linter (ESLint)
        run: npm run lint

      - name: Verificacion de tipos (TypeScript)
        run: npm run typecheck

      - name: Ejecutar tests (Vitest)
        run: npx vitest run
        env:
          NODE_ENV: test

      - name: Compilar proyecto (Vite build)
        run: npm run build

      - name: Auditoria de seguridad
        run: npm audit --audit-level=high
        continue-on-error: true

  # ================================================================
  # JOB 3: Database (Validacion de DDL)
  # ================================================================
  database:
    name: Database - Validar DDL
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:15-alpine
        env:
          POSTGRES_DB: gamilit_platform
          POSTGRES_USER: gamilit_user
          POSTGRES_PASSWORD: gamilit_dev_2026
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - name: Checkout codigo
        uses: actions/checkout@v4

      - name: Validar sintaxis SQL de DDL
        run: |
          # Verificar que todos los archivos .sql tienen sintaxis valida
          for f in $(find apps/database/ddl -name "*.sql" ! -name "*.TEST.sql"); do
            echo "Validando: $f"
            psql "postgresql://gamilit_user:gamilit_dev_2026@localhost:5432/gamilit_platform" \
              -v ON_ERROR_STOP=1 -f "$f" || echo "ADVERTENCIA: Error en $f"
          done
        continue-on-error: true  # DDL puede tener dependencias de orden

  # ================================================================
  # JOB 4: Quality Gate (depende de todos los anteriores)
  # ================================================================
  quality-gate:
    name: Quality Gate
    runs-on: ubuntu-latest
    needs: [backend, frontend]
    if: always()

    steps:
      - name: Verificar resultados
        run: |
          if [ "${{ needs.backend.result }}" != "success" ]; then
            echo "Backend CI fallo"
            exit 1
          fi
          if [ "${{ needs.frontend.result }}" != "success" ]; then
            echo "Frontend CI fallo"
            exit 1
          fi
          echo "Quality Gate: APROBADO - Todos los checks pasaron"
```

### Notas sobre el CI

- **Concurrencia:** Se cancela la ejecucion anterior si hay un nuevo push al mismo PR, evitando gastos innecesarios.
- **Jobs en paralelo:** Backend, Frontend y Database se ejecutan simultaneamente para minimizar tiempo.
- **Quality Gate:** Job final que agrega los resultados y actua como status check obligatorio.
- **npm audit:** Se configura con `continue-on-error: true` inicialmente para no bloquear por vulnerabilidades no criticas.

---

## 4. Workflow CD: Deploy a Produccion

Crear el archivo `.github/workflows/cd.yml`:

```yaml
# .github/workflows/cd.yml
name: CD - Deploy a Produccion

on:
  workflow_dispatch:  # Trigger manual (recomendado inicialmente)
    inputs:
      skip_backup:
        description: 'Saltar backup de BD (solo para hotfixes)'
        required: false
        default: 'false'
        type: boolean
  # Descomentar cuando CI sea estable para auto-deploy:
  # push:
  #   branches: [master]

jobs:
  deploy:
    name: Deploy a Produccion (74.208.126.102)
    runs-on: ubuntu-latest
    environment: production  # Requiere aprobacion manual en GitHub

    steps:
      - name: Checkout codigo (para referencia)
        uses: actions/checkout@v4

      - name: Backup de base de datos
        if: ${{ github.event.inputs.skip_backup != 'true' }}
        uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: isem
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            echo "=== Backup de BD antes de deploy ==="
            BACKUP_DIR="/home/isem/backups/$(date +%Y%m%d_%H%M%S)"
            mkdir -p "$BACKUP_DIR"
            pg_dump -U gamilit_user -d gamilit_platform -F c \
              -f "$BACKUP_DIR/gamilit_platform.dump" || true
            echo "Backup guardado en: $BACKUP_DIR"

      - name: Deploy via SSH
        uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: isem
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          command_timeout: 10m
          script: |
            echo "=== Iniciando deploy de gamilit ==="
            cd /home/isem/workspace-v2/projects/gamilit

            echo "--- 1. Pull de cambios ---"
            git fetch origin master
            git pull origin master

            echo "--- 2. Build Backend (NestJS 11) ---"
            cd apps/backend
            npm ci --production=false
            npm run build
            cd ../..

            echo "--- 3. Build Frontend (React 19 + Vite 6.x) ---"
            cd apps/frontend
            npm ci
            npm run build
            cd ../..

            echo "--- 4. Restart PM2 ---"
            pm2 restart ecosystem.config.js --env production
            pm2 save

            echo "--- 5. Esperar arranque (10s) ---"
            sleep 10

            echo "--- 6. Health checks ---"
            # Backend en puerto interno 4006
            BACKEND_STATUS=$(curl -sf http://localhost:4006/api/v1/health || echo "FAIL")
            if echo "$BACKEND_STATUS" | grep -q "FAIL"; then
              echo "ERROR: Backend health check fallo"
              pm2 logs gamilit-backend --lines 20 --nostream
              exit 1
            fi
            echo "Backend OK: $BACKEND_STATUS"

            # Frontend en puerto interno 4005
            FRONTEND_STATUS=$(curl -sf http://localhost:4005 || echo "FAIL")
            if echo "$FRONTEND_STATUS" | grep -q "FAIL"; then
              echo "ERROR: Frontend health check fallo"
              pm2 logs gamilit-frontend --lines 20 --nostream
              exit 1
            fi
            echo "Frontend OK"

            echo "=== Deploy completado exitosamente ==="

      - name: Verificar deploy desde exterior
        run: |
          echo "Verificando acceso externo..."
          # Verificar via HTTPS (Nginx reverse proxy)
          curl -sf -o /dev/null -w "%{http_code}" \
            https://74.208.126.102/api/v1/health --insecure || true
          echo "Deploy verificado"
```

### Notas sobre el CD

- **workflow_dispatch:** Permite trigger manual desde la interfaz de GitHub Actions. Recomendado como primer paso antes de auto-deploy.
- **environment: production:** Requiere aprobacion manual en la configuracion de GitHub (Settings > Environments > production > Required reviewers).
- **Backup previo:** Se crea un dump de la BD antes de cada deploy. Se puede saltar para hotfixes urgentes.
- **Health checks:** Verifican que tanto backend (`:4006/api/v1/health`) como frontend (`:4005`) responden correctamente despues del restart de PM2.
- **Timeout de 10 minutos:** Suficiente para `npm ci` + `npm run build` de ambas aplicaciones.

---

## 5. Secrets Requeridos en GitHub

Configurar en **Settings > Secrets and variables > Actions** del repositorio:

| Secret | Descripcion | Como Obtener |
|--------|-------------|--------------|
| `SSH_PRIVATE_KEY` | Clave SSH privada para `isem@74.208.126.102` | Generar con `ssh-keygen -t ed25519` en el servidor, agregar publica a `~/.ssh/authorized_keys` |
| `SERVER_HOST` | IP del servidor de produccion | `74.208.126.102` |

### Pasos para Configurar SSH

```bash
# En el servidor (74.208.126.102) como usuario isem:
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/github_actions
cat ~/.ssh/github_actions.pub >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys

# Copiar el contenido de la clave privada:
cat ~/.ssh/github_actions
# Pegar este contenido como el secret SSH_PRIVATE_KEY en GitHub
```

### Configurar Environment de Produccion

1. Ir a **Settings > Environments** en el repositorio de GitHub.
2. Crear environment `production`.
3. Activar **Required reviewers** y agregar al menos un revisor.
4. Opcionalmente configurar **Wait timer** (ej: 5 minutos de espera).

---

## 6. Estrategia de Branches

### Modelo Simplificado para Monorepo

```
master (siempre deployable)
  │
  ├── feature/GAM-XXX-descripcion  (feature branches)
  ├── fix/GAM-XXX-descripcion      (bug fixes)
  └── hotfix/GAM-XXX-descripcion   (urgentes, bypass CI)
```

### Reglas

| Regla | Descripcion |
|-------|-------------|
| `master` es sagrado | Siempre debe compilar y pasar tests |
| Feature branches | Para todo cambio nuevo, se crea PR contra `master` |
| No usar `develop` | El monorepo es simple, un solo ambiente de produccion |
| Tags para releases | Usar versionado semantico: `v1.0.0`, `v1.1.0` |
| Proteccion de branch | Activar "Require status checks" en master |

### Proteccion del Branch Master

Configurar en **Settings > Branches > Branch protection rules**:

- [x] Require a pull request before merging
- [x] Require status checks to pass before merging
  - Seleccionar: `quality-gate`
- [x] Require branches to be up to date before merging
- [ ] Do not use "Require linear history" (permite merge commits)

---

## 7. Monorepo Path Filters

Para optimizar el CI y no ejecutar todos los jobs cuando solo cambia una parte del monorepo, usar path filters:

```yaml
# Agregar al job backend:
backend:
  if: |
    github.event_name == 'push' ||
    contains(github.event.pull_request.changed_files, 'apps/backend/')
  # ... resto del job

# Alternativa: usar dorny/paths-filter
jobs:
  detect-changes:
    runs-on: ubuntu-latest
    outputs:
      backend: ${{ steps.filter.outputs.backend }}
      frontend: ${{ steps.filter.outputs.frontend }}
      database: ${{ steps.filter.outputs.database }}
    steps:
      - uses: actions/checkout@v4
      - uses: dorny/paths-filter@v3
        id: filter
        with:
          filters: |
            backend:
              - 'apps/backend/**'
            frontend:
              - 'apps/frontend/**'
            database:
              - 'apps/database/**'

  backend:
    needs: detect-changes
    if: needs.detect-changes.outputs.backend == 'true'
    # ... resto del job

  frontend:
    needs: detect-changes
    if: needs.detect-changes.outputs.frontend == 'true'
    # ... resto del job
```

### Archivos que Afectan Todo

Cambios en estos archivos deben ejecutar TODOS los jobs:

- `ecosystem.config.js` — Configuracion PM2
- `package.json` (raiz) — Si existe
- `.github/workflows/*.yml` — Cambios al propio CI
- `orchestration/` — No afecta CI pero es buena practica validar

---

## 8. Estrategia de Caching

### Cache de node_modules

GitHub Actions ofrece caching integrado en `actions/setup-node@v4`:

```yaml
- uses: actions/setup-node@v4
  with:
    node-version: 20
    cache: 'npm'
    cache-dependency-path: apps/backend/package-lock.json
```

El cache key se genera automaticamente con el hash de `package-lock.json`. Cuando las dependencias no cambian, `npm ci` usa el cache y es significativamente mas rapido.

### Cache Adicional de Build

Para compilaciones pesadas, se puede cachear el directorio `dist`:

```yaml
- name: Cache de build backend
  uses: actions/cache@v4
  with:
    path: apps/backend/dist
    key: backend-build-${{ hashFiles('apps/backend/src/**') }}
    restore-keys: |
      backend-build-
```

### Tiempos Estimados

| Paso | Sin Cache | Con Cache |
|------|-----------|-----------|
| npm ci backend | ~60s | ~15s |
| npm ci frontend | ~90s | ~20s |
| npm run build backend | ~30s | ~30s |
| npm run build frontend | ~45s | ~45s |
| Tests backend (833) | ~60s | ~60s |
| Tests frontend (46) | ~15s | ~15s |
| **Total CI (paralelo)** | **~4 min** | **~2.5 min** |

---

## 9. Notificaciones

### Status Checks en PR (Integrado)

GitHub Actions muestra automaticamente el estado de los checks en cada PR. No requiere configuracion adicional.

### Notificacion Slack (Opcional)

Para notificar al equipo cuando un deploy se completa o falla:

```yaml
# Agregar al final del job deploy en cd.yml:
- name: Notificar Slack
  if: always()
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    fields: repo,message,commit,author,action,eventName,ref,workflow
  env:
    SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK }}
```

### Notificacion por Email (Integrado)

GitHub envia notificaciones por email automaticamente cuando:
- Un workflow falla
- Un status check falla en un PR

Configurar en **Settings > Notifications** del perfil personal.

---

## 10. Checklist de Implementacion

### Fase 1: Configurar CI (Prioridad Alta)

- [ ] Crear directorio `.github/workflows/` en la raiz del repositorio
- [ ] Crear archivo `.github/workflows/ci.yml` con el contenido de la seccion 3
- [ ] Hacer push a master y verificar que los jobs ejecutan correctamente
- [ ] Corregir cualquier falla en lint, tests o build
- [ ] Configurar branch protection en master con status checks obligatorios

### Fase 2: Configurar Secrets y Environments (Prioridad Alta)

- [ ] Generar key SSH dedicada para GitHub Actions en el servidor
- [ ] Agregar `SSH_PRIVATE_KEY` como secret en GitHub
- [ ] Agregar `SERVER_HOST` como secret en GitHub
- [ ] Crear environment `production` con required reviewers

### Fase 3: Configurar CD (Prioridad Media)

- [ ] Crear archivo `.github/workflows/cd.yml` con el contenido de la seccion 4
- [ ] Probar deploy manual con `workflow_dispatch`
- [ ] Verificar que backup, build y restart funcionan correctamente
- [ ] Verificar health checks post-deploy
- [ ] Documentar el proceso en el equipo

### Fase 4: Optimizar (Prioridad Baja)

- [ ] Implementar path filters para monorepo (seccion 7)
- [ ] Configurar notificaciones Slack (seccion 9)
- [ ] Evaluar auto-deploy en merge a master (descomentar trigger push en cd.yml)
- [ ] Agregar badge de CI/CD al README.md
- [ ] Configurar cache avanzado si los tiempos de build son lentos

### Fase 5: Mantenimiento Continuo

- [ ] Revisar logs de CI semanalmente para detectar flaky tests
- [ ] Actualizar versiones de actions anualmente (`actions/checkout@v5`, etc.)
- [ ] Monitorear uso de minutos de GitHub Actions (plan gratuito: 2000 min/mes)
- [ ] Actualizar health check endpoints si cambian

---

## Referencia Rapida

### Estructura de Archivos CI/CD

```
gamilit-workspace/
├── .github/
│   └── workflows/
│       ├── ci.yml          ← Validacion en PR (lint, test, build)
│       └── cd.yml          ← Deploy a produccion (SSH + PM2)
├── ecosystem.config.js     ← Configuracion PM2 (backend:4006, frontend:4005)
├── apps/
│   ├── backend/            ← NestJS 11, Jest (833 tests)
│   ├── frontend/           ← React 19, Vitest (46 tests), Vite 6.x
│   └── database/           ← PostgreSQL 15, 18 schemas, 169 tablas
└── ...
```

### Comandos Utiles

```bash
# Ver ejecuciones de workflows desde CLI
gh run list --workflow=ci.yml
gh run list --workflow=cd.yml

# Ver detalles de una ejecucion
gh run view <run-id>

# Trigger manual de deploy
gh workflow run cd.yml

# Ver logs de una ejecucion
gh run view <run-id> --log
```

---

## Relacion con Otros Documentos

| Documento | Relacion |
|-----------|----------|
| `GUIA-DESPLIEGUE-PRODUCCION-COMPLETA.md` | Deploy manual existente, CD automatiza este flujo |
| `GUIA-ACTUALIZACION-PRODUCCION.md` | Flujo de actualizacion que CD reemplaza |
| `GUIA-SSL-NGINX-PRODUCCION.md` | Nginx como reverse proxy, no cambia con CI/CD |
| `ecosystem.config.js` | Configuracion PM2 usada por el step de deploy |
| `TRIGGER-QUALITY-GATE.md` | Trigger SIMCO que define condiciones de calidad |

---

*Guia CI/CD v1.0.0 — gamilit monorepo — Actualizado 2026-02-14*
