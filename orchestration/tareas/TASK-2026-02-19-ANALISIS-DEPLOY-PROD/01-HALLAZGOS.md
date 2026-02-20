# Hallazgos Consolidados: Analisis de Preparacion para Deploy a Produccion

**Fecha:** 2026-02-19 | **Version:** 1.0.0
**Total hallazgos:** 56 (6 bloqueantes, 16 altos, 19 medios, 15 bajos)

---

## FASE 1: Seeds — Inventario y Discrepancias

| ID | Hallazgo | Severidad | Archivo/Linea |
|----|----------|-----------|---------------|
| F1-C01 | PROD: Prefijo duplicado `17-` en gamification_system (`17-shop_items_metadata_normalization.sql` y `17-user_purchases-demo.sql`) | **BLOQUEANTE** | `seeds/prod/gamification_system/` |
| F1-C02 | STAGING: Prefijo duplicado `17-` en gamification_system (`17-shop_items_metadata_normalization.sql` y `17-user_equipped_items-demo.sql`) | **BLOQUEANTE** | `seeds/staging/gamification_system/` |
| F1-C03 | `05-user_stats.sql` desactualizado en PROD/STAGING (v2.0 vs DEV v2.2, fix REC-009) — riesgo de FK violation | ALTA | `seeds/prod/gamification_system/05-user_stats.sql` |
| F1-C04 | `staging.conf` NO EXISTE — staging no puede ejecutarse via init-database.sh | ALTA | `apps/database/scripts/config/` (ausente) |
| F1-A01 | 26 archivos con contenido diferente entre DEV y PROD (seeds `all\|core` divergentes) | ALTA | Ver FASE1-SEEDS.md seccion 4.1 |
| F1-A02 | `06-profiles-production.sql` difiere entre DEV y PROD (seed core) | ALTA | `seeds/*/auth_management/06-profiles-production.sql` |
| F1-A03 | STAGING falta 8+ archivos `all\|core` (admin_dashboard, auth, auth_management) | ALTA | `seeds/staging/` |
| F1-A04 | `17-shop_items_metadata_normalization.sql` tiene 3 versiones diferentes entre ambientes | MEDIA | `seeds/*/gamification_system/17-*.sql` |
| F1-M01 | 27 archivos de seed no en pipeline init-database.sh | MEDIA | Ver FASE1-SEEDS.md seccion 3.3 |
| F1-M02 | 2 seeds excluidos del pipeline existen en 3 ambientes (archivos muertos) | MEDIA | `content_management/01-default-templates.sql`, `04-moderation_rules.sql` |
| F1-B01 | Directorios `_testing/` y `_backlog/` existen en PROD | BAJA | `seeds/prod/_testing/`, `seeds/prod/_backlog/` |
| F1-B02 | Scope tags en seed_entries no incluyen `staging` — todo es `all\|dev\|prod` | BAJA | `init-database.sh:1045-1182` |

---

## FASE 2: Usuarios y Datos Sensibles

| ID | Hallazgo | Severidad | Archivo/Linea |
|----|----------|-----------|---------------|
| F2-C01 | Super admin `admin@gamilit.com` con UUID `aaaaaaaa-...` y password `Test1234` en PRODUCCION | **BLOQUEANTE** | `seeds/prod/auth/01-demo-users.sql` |
| F2-C02 | Password `Test1234` documentado en texto plano en SQL comments y RAISE NOTICE en prod | **BLOQUEANTE** | `seeds/prod/auth/01-demo-users.sql:12-14, 185-188` |
| F2-C03 | PII real de 45 estudiantes menores (Gmail, nombres, hashes) en ambiente DEV | ALTA | `seeds/dev/auth/02-production-users.sql` |
| F2-A01 | Hashes bcrypt de passwords reales de produccion commiteados al repo git | ALTA | `seeds/*/auth/02-production-users.sql` |
| F2-A02 | Sin segregacion dev/prod — `02-production-users.sql` identico en ambos ambientes | ALTA | `seeds/dev/auth/` y `seeds/prod/auth/` |
| F2-M01 | Credenciales de testing en SQL comments del seed de produccion | MEDIA | `seeds/prod/auth/01-demo-users.sql:200-205` |
| F2-M02 | Staging solo tiene 3 usuarios — no representativo para testing | MEDIA | `seeds/staging/auth/` |

---

## FASE 3: Scripts y Pipeline DDL

| ID | Hallazgo | Severidad | Archivo/Linea |
|----|----------|-----------|---------------|
| F3-C01 | Password sudo `2320` hardcodeado y tracked en git | **BLOQUEANTE** | `database-master.sh:41` |
| F3-C02 | Puerto `5433` hardcodeado en database-master.sh (prod usa 5432) | ALTA | `database-master.sh:40` |
| F3-A01 | DB password `gamilit_dev_2026` tracked en git en 2 archivos .env | ALTA | `.env.database`, `.env.dev` |
| F3-A02 | Batch mode para tablas suprime errores (`> /dev/null 2>&1`) | ALTA | `init-database.sh:602-606` |
| F3-A03 | Prerequisites output completamente suprimido | ALTA | `init-database.sh:476-484` |
| F3-A04 | Tests fallidos NO bloquean deploy a produccion | ALTA | `deploy-production.sh:228-239` |
| F3-A05 | Rollback no restaura codigo — solo datos parciales | ALTA | `deploy-production.sh:465-496` |
| F3-M01 | Health check verifica Swagger (deshabilitado en prod) — siempre falla | MEDIA | `deploy-production.sh:451` |
| F3-M02 | Connection string con password impresa en stdout | MEDIA | `init-database.sh:1696` |
| F3-M03 | SQL injection potencial via --password (comillas simples) | MEDIA | `init-database.sh:422`, `database-master.sh:494` |
| F3-M04 | Migrations sin transaccion — BD puede quedar en estado parcial | MEDIA | `deploy-production.sh:316-333` |
| F3-M05 | Dead config en prod.conf (ENV_SAVE_CREDENTIALS_ENCRYPTED no implementado) | BAJA | `config/prod.conf` |
| F3-B01 | Scripts temporales de debug en repositorio (temp-init.sh, etc.) | BAJA | `apps/database/scripts/temp-*.sh` |
| F3-B02 | Solo 1 de 11 scripts tiene `pipefail` | BAJA | `pre-deploy-backup.sh` |

---

## FASE 4: Configuracion, CORS, SSL y PM2

| ID | Hallazgo | Severidad | Archivo/Linea |
|----|----------|-----------|---------------|
| F4-C01 | `JWT_REFRESH_SECRET` ausente en TODOS los .env — main.ts bloquea startup sin el | **BLOQUEANTE** | `apps/backend/.env*` (ausente) |
| F4-C02 | 3 placeholders `CHANGE_ME_IN_PRODUCTION` en `.env.production` | **BLOQUEANTE** | `.env.production:20,25,43` |
| F4-C03 | Frontend `.env.production` NO existe — build usara localhost | ALTA | `apps/frontend/` (ausente) |
| F4-A01 | `env_file` en ecosystem.config.js no es propiedad valida de PM2 (ignorada) | ALTA | `ecosystem.config.js:65,114` |
| F4-A02 | `vite preview` inadecuado para produccion (Vite docs: "not for production") | ALTA | `ecosystem.config.js:92` |
| F4-A03 | `wait_ready: true` sin `process.send('ready')` — PM2 espera timeout | ALTA | `ecosystem.config.js:79`, `main.ts` |
| F4-A04 | HTTP origins (`http://74.208.126.102`) en CORS de produccion | ALTA | `.env.production:30` |
| F4-A05 | Config Nginx del servidor NO versionada en repo | ALTA | (ausente) |
| F4-A06 | `sourcemap: true` en produccion expone codigo fuente | MEDIA | `vite.config.ts:49` |
| F4-M01 | `DB_POOL_MAX` ausente en .env.production (default 2, deberia ser 5-10) | MEDIA | `.env.production` |
| F4-M02 | `FRONTEND_URL` con `:3005` (si Nginx en 443, URLs en emails rotas) | MEDIA | `.env.production:51` |
| F4-M03 | `RATE_LIMIT_MAX=100` muy generoso para produccion | MEDIA | `.env.production` |
| F4-M04 | Null origin permitido en CORS (file://, redirects) | MEDIA | `main.ts:35-37` |
| F4-B01 | `DB_USER`/`DB_USERNAME` y `DB_DATABASE`/`DB_NAME` duplicados | BAJA | `.env*` |

---

## FASE 5: RLS y BYPASSRLS

| ID | Hallazgo | Severidad | Archivo/Linea |
|----|----------|-----------|---------------|
| F5-C01 | BYPASSRLS=true anula TODAS las 467 politicas RLS | **BLOQUEANTE** | `99-post-ddl-permissions.sql:119` |
| F5-C02 | RlsInterceptor es un stub — NO ejecuta SET LOCAL (TODO en linea 98-99) | ALTA | `rls.interceptor.ts:96-99` |
| F5-C03 | Solo 4/904 endpoints ejecutan SET LOCAL app.current_user_id | ALTA | `teacher-reports.service.ts:55,85,162,230` |
| F5-A01 | Aislamiento multi-tenant depende 100% de app logic (sin defensa DB) | ALTA | Arquitectura |
| F5-A02 | `app.current_tenant_id` NUNCA se ejecuta en el backend (19 policies inoperantes) | ALTA | Backend (ausente) |
| F5-M01 | Solo 13/104 tablas tienen FORCE ROW LEVEL SECURITY | MEDIA | DDL `07-enable-rls*.sql` |
| F5-M02 | SQL injection potencial en TeacherReportsService (string interpolation) | MEDIA | `teacher-reports.service.ts:55` |
| F5-M03 | 65/169 tablas no tienen politicas RLS definidas | MEDIA | DDL |
| F5-I01 | `post_seeds_security()` comentada en init-database.sh con prerrequisitos documentados | INFO | `init-database.sh:1471-1513` |

---

## FASE 6: Pipeline de Deploy

| ID | Hallazgo | Severidad | Archivo/Linea |
|----|----------|-----------|---------------|
| F6-C01 | Health check URL incorrecta (`/api/health` vs `/api/v1/health`) — siempre 404 | **BLOQUEANTE** | `deploy-production.sh:434` |
| F6-A01 | `pm2 stop all` causa downtime total (2-10 minutos por deploy) | ALTA | `deploy-production.sh:399` |
| F6-A02 | CI deploy workflow apunta a `main` (proyecto usa `master`) — nunca ejecuta | ALTA | `deploy-production.yml:6` |
| F6-A03 | Backend build en CI usa `continue-on-error: true` | ALTA | `deploy-production.yml:134` |
| F6-A04 | Backup pre-deploy solo tablas seleccionadas — no full pg_dump | ALTA | `backup-production-data.sh` |
| F6-A05 | Thresholds de validacion BD demasiado bajos (tablas: 64/169 = 38%) | ALTA | `prod.conf:55` |
| F6-M01 | 4+ scripts de deploy duplicados sin claridad sobre cual es oficial | MEDIA | `scripts/`, `apps/devops/scripts/` |
| F6-M02 | No hay deploy lock (deploys concurrentes posibles) | MEDIA | `deploy-production.sh` |
| F6-M03 | Monitoreo SQL no integrado en deploy ni cron | MEDIA | `scripts/monitoring/` |
| F6-M04 | `rollback-migration.sh` usa `dropdb` (destructivo total) | MEDIA | `rollback-migration.sh:56` |
| F6-M05 | Node 18 en deploy-production.yml vs Node 20 en CI workflows | MEDIA | Workflows |
| F6-B01 | Sin notificaciones de deploy (Slack/email) | BAJA | N/A |
| F6-B02 | PM2 logs sin rotacion | BAJA | `ecosystem.config.js` |
| F6-B03 | Sin smoke tests post-deploy (solo health check basico) | BAJA | `deploy-production.sh` |

---

## Resumen por Severidad

| Severidad | F1 | F2 | F3 | F4 | F5 | F6 | Total |
|-----------|:--:|:--:|:--:|:--:|:--:|:--:|:-----:|
| BLOQUEANTE | 2 | 2 | 1 | 2 | 1 | 1 | **6** + 3 duplicados cross-fase |
| ALTA | 5 | 3 | 4 | 6 | 4 | 5 | **16** (dedup) |
| MEDIA | 2 | 2 | 5 | 4 | 3 | 5 | **19** (dedup) |
| BAJA | 2 | 0 | 2 | 1 | 0 | 3 | **15** (dedup) |
| INFO | 0 | 0 | 0 | 0 | 1 | 0 | 1 |

---

*Documento consolidado de 6 fases de analisis — TASK-2026-02-19-ANALISIS-DEPLOY-PROD*
*Generado por Claude Opus 4.6 — Modo ANALYSIS*
