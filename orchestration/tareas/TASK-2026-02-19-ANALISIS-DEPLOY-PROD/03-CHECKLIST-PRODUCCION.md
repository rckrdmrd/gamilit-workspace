# Checklist de Produccion — GAMILIT

**Fecha:** 2026-02-19 | **Version:** 1.0.0
**Total items:** 41 | **Bloqueantes:** 10 | **Altos:** 14 | **Medios:** 12 | **Bajos:** 5

---

## ITEMS BLOQUEANTES (Resolver ANTES de deploy)

| # | Item | Fase | Accion | Estado |
|---|------|:----:|--------|:------:|
| BLQ-01 | Reemplazar `CHANGE_ME_IN_PRODUCTION` en `.env.production` del servidor (DB_PASSWORD, JWT_SECRET, SESSION_SECRET) | F4 | Editar archivo en servidor 74.208.126.102 con valores reales | PENDIENTE |
| BLQ-02 | Agregar `JWT_REFRESH_SECRET` (>=32 chars) a `.env.production` del servidor | F4 | Sin este secreto, `main.ts` ejecuta `process.exit(1)` | PENDIENTE |
| BLQ-03 | Crear `apps/frontend/.env.production` en servidor a partir del `.env.production.example` | F4 | Sin esto, `vite build` usa localhost y el validador rechaza | PENDIENTE |
| BLQ-04 | Cambiar password de `admin@gamilit.com` en BD de produccion | F2 | `UPDATE auth.users SET encrypted_password = crypt('<nuevo>', gen_salt('bf',10)) WHERE email = 'admin@gamilit.com'` | PENDIENTE |
| BLQ-05 | Eliminar sudo password de `database-master.sh` y limpiar historial git | F3 | Reemplazar `SUDO_PASS_DEV="2320"` por `"${GAMILIT_SUDO_PASSWORD:-}"`, luego `git filter-repo` | **RESUELTO** (password reemplazado, git filter-repo pendiente en servidor) |
| BLQ-06 | Corregir URL de health check en `deploy-production.sh` | F6 | Cambiar `/api/health` a `/api/v1/health` (linea 434) | **RESUELTO** |
| BLQ-07 | Renumerar `17-user_purchases-demo.sql` a `18-` en PROD y `16-` a `18-` en STAGING | F1 | Renombrar archivos para eliminar prefijos duplicados | **RESUELTO** (Sprint Seed Homologation 2026-02-18) |
| BLQ-08 | Sincronizar `05-user_stats.sql` — copiar DEV v2.2 a PROD y STAGING | F1 | DEV tiene fix REC-009 (UUID), PROD/STAGING tienen v2.0 (TEXT) | **RESUELTO** (Sprint Seed Homologation 2026-02-18) |
| BLQ-09 | Eliminar `.env.database` y `.env.dev` del tracking git | F3 | `git rm --cached apps/database/.env.database apps/database/.env.dev` + agregar a .gitignore | **RESUELTO** |
| BLQ-10 | Corregir branch en `deploy-production.yml` de `main` a `master` | F6 | El deploy CI nunca se ejecuta por branch incorrecta | **RESUELTO** |

---

## ITEMS DE ALTA PRIORIDAD (Resolver en sprint actual)

| # | Item | Fase | Accion | Estado |
|---|------|:----:|--------|:------:|
| ALT-01 | Hacer que tests bloqueen deploy en `deploy-production.sh` | F3/F6 | Cambiar `print_warning` a `print_error` + `return 1` en lineas 228-239 | **RESUELTO** |
| ALT-02 | Reemplazar `vite preview` por Nginx para frontend en produccion | F4/F6 | Usar `apps/frontend/nginx.conf` existente; eliminar bloque frontend de PM2 | PENDIENTE |
| ALT-03 | Agregar `process.send?.('ready')` en `main.ts` despues de `app.listen()` | F4/F6 | PM2 wait_ready espera timeout sin esta senial | **RESUELTO** |
| ALT-04 | Eliminar HTTP origins del CORS de produccion | F4 | Quitar `http://74.208.126.102:3005` y `http://74.208.126.102` de `.env.production` | PENDIENTE |
| ALT-05 | Eliminar `env_file` del ecosystem.config.js (propiedad invalida PM2) | F4 | Eliminar lineas 65 y 114 | **RESUELTO** |
| ALT-06 | Eliminar `continue-on-error: true` del backend build en CI | F6 | `.github/workflows/deploy-production.yml:134` | **RESUELTO** |
| ALT-07 | Crear staging.conf para habilitar staging en init-database.sh | F1 | Copiar dev.conf, ajustar `ENV_SEEDS_DIR="seeds/staging"` y `ENV_LOAD_DEMO_DATA=false` | PENDIENTE |
| ALT-08 | Completar STAGING con archivos `all\|core` faltantes (8+ archivos) | F1 | Copiar de PROD: admin_dashboard/*, auth/02-production-users, auth_management/02,04,06,07,08 | PENDIENTE |
| ALT-09 | Eliminar PII real de DEV — crear seed sintetico `02-synthetic-users.sql` | F2 | Reemplazar `02-production-users.sql` en dev con datos faker | PENDIENTE |
| ALT-10 | Versionar config Nginx del servidor en `apps/devops/` | F4 | Crear `apps/devops/config/nginx-production.conf` | PENDIENTE |
| ALT-11 | Deshabilitar source maps en build de produccion | F4 | Cambiar a `sourcemap: process.env.NODE_ENV !== 'production'` en `vite.config.ts:49` | **RESUELTO** |
| ALT-12 | Reordenar deploy: build ANTES de stop (reduce downtime a ~20s) | F6 | npm ci + build mientras servicios siguen corriendo, luego pm2 restart | PENDIENTE |
| ALT-13 | Usar full pg_dump (pre-deploy-backup.sh) en vez de backup parcial | F6 | Reemplazar llamada a backup-production-data.sh por pre-deploy-backup.sh | PENDIENTE |
| ALT-14 | Subir thresholds de validacion BD en prod.conf | F6 | Tablas: 64->150, Funciones: 60->160, Schemas: 9->15 | PENDIENTE |

---

## ITEMS DE MEDIA PRIORIDAD (Proximo sprint)

| # | Item | Fase | Accion | Estado |
|---|------|:----:|--------|:------:|
| MED-01 | Agregar `DB_POOL_MAX=5` a `.env.production` | F4 | Default 2 es insuficiente para produccion con trafico real | PENDIENTE |
| MED-02 | Corregir `FRONTEND_URL` a `https://74.208.126.102` (sin :3005) en `.env.production` | F4 | URLs en emails tendran puerto incorrecto si Nginx en 443 | PENDIENTE |
| MED-03 | Reducir `RATE_LIMIT_MAX` a 30-50 para produccion | F4 | 100 es muy generoso | PENDIENTE |
| MED-04 | Consolidar scripts de deploy — eliminar duplicados en `scripts/` | F6 | Mantener solo `apps/devops/scripts/deploy-production.sh` como SSOT | PENDIENTE |
| MED-05 | Implementar deploy lock (prevenir deploys concurrentes) | F6 | Agregar lock file `/tmp/gamilit-deploy.lock` | PENDIENTE |
| MED-06 | Corregir SQL injection en TeacherReportsService | F5 | Usar parametros preparados en vez de string interpolation para SET LOCAL | PENDIENTE |
| MED-07 | Sanitizar password input en scripts (escapar comillas simples) | F3 | `local safe_pass="${DB_PASSWORD//\'/\'\'}"` antes de construir SQL | PENDIENTE |
| MED-08 | Eliminar supresion de errores en batch DDL de init-database.sh | F3 | Reemplazar `> /dev/null 2>&1` con captura de output a variable | PENDIENTE |
| MED-09 | Limpiar archivos muertos en seeds PROD (`_testing/`, `_backlog/`, seeds excluidos) | F1 | Eliminar directorios y archivos no usados | PENDIENTE |
| MED-10 | Decidir sobre 27 seeds huerfanos (agregar al pipeline o eliminar) | F1 | Revisar cada archivo, agregar los utiles al pipeline, archivar los demas | PENDIENTE |
| MED-11 | Documentar que RLS NO esta activo y que seguridad depende de app logic | F5 | Crear ADR explicitando el riesgo aceptado temporalmente | PENDIENTE |
| MED-12 | Integrar scripts de monitoreo SQL en cron post-deploy | F6 | Crear wrapper script y cron job para ejecutar 5 scripts de monitoring | PENDIENTE |

---

## ITEMS DE BAJA PRIORIDAD (Backlog)

| # | Item | Fase | Accion | Estado |
|---|------|:----:|--------|:------:|
| BAJ-01 | Eliminar scripts temporales (temp-*.sh) del repositorio | F3 | `git rm apps/database/scripts/temp-*.sh` | PENDIENTE |
| BAJ-02 | Agregar `pipefail` a todos los scripts bash | F3 | Cambiar `set -e` a `set -euo pipefail` en 10 scripts | PENDIENTE |
| BAJ-03 | Configurar rotacion de logs PM2 | F6 | Instalar `pm2-logrotate` o configurar logrotate del sistema | PENDIENTE |
| BAJ-04 | Estandarizar variables env duplicadas (DB_USER/DB_USERNAME, DB_DATABASE/DB_NAME) | F4 | Elegir uno, deprecar el otro | PENDIENTE |
| BAJ-05 | Agregar notificaciones de deploy (Slack/email) | F6 | Integrar con webhook al final de deploy exitoso/fallido | PENDIENTE |

---

## PLAN RLS (Track separado — 6-10 semanas)

Este track es independiente del checklist de deploy pero critico para seguridad a mediano plazo:

| Fase | Duracion | Objetivo |
|------|----------|----------|
| 0 | 1-2 sem | Auditar policies, clasificar endpoints, crear policies para publicos |
| 1 | 2-3 sem | Implementar SET LOCAL en RlsInterceptor con TransactionInterceptor |
| 2 | 1-2 sem | Validar con BYPASSRLS activo (logging de get_current_user_id()) |
| 3 | 2-3 sem | NOBYPASSRLS en dev — testing exhaustivo de todos los flujos |
| 4 | 1 sem | NOBYPASSRLS en produccion con monitoreo |

**Prerequisitos documentados en init-database.sh:**
1. RlsInterceptor debe ejecutar SET LOCAL en cada request
2. Endpoints publicos necesitan policies permisivas
3. INSERT...RETURNING* necesita SELECT policies
4. Validacion end-to-end completa

---

## METRICAS DE PROGRESO

| Categoria | Total | Completados | % |
|-----------|:-----:|:-----------:|:-:|
| Bloqueantes | 10 | 6 | 60% |
| Altos | 14 | 5 | 36% |
| Medios | 12 | 0 | 0% |
| Bajos | 5 | 0 | 0% |
| **TOTAL** | **41** | **11** | **27%** |

**Criterio de deploy:** Todos los items BLOQUEANTES deben estar en estado COMPLETADO antes de ejecutar deploy a produccion.

---

*Checklist generado por TASK-2026-02-19-ANALISIS-DEPLOY-PROD — Claude Opus 4.6*
