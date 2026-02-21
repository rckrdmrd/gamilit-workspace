# Auditoria Estado Actual — Hallazgos Deploy Produccion

**Fecha:** 2026-02-20 | **Version:** 1.0.0
**Base:** 01-HALLAZGOS.md (56 hallazgos, 2026-02-19)
**Metodo:** Verificacion automatizada contra codebase actual (3 agentes paralelos)

---

## Resumen Ejecutivo

| Estado | Cantidad | % |
|--------|:--------:|:-:|
| RESUELTO | **5** | 9% |
| PARCIAL | **6** | 11% |
| PENDIENTE | **45** | 80% |
| **Total** | **56** | 100% |

**Conclusion:** Se han resuelto 5 de los 56 hallazgos (4 en F1-Seeds + F4-A03 process.send). Los BLOQUEANTES originales siguen en 7 pendientes (2 F1 resueltos, F4-A03 resuelto). Las correcciones recientes incluyen proxy mode para acceso LAN, CORS consistente HTTP+WS, y `process.send('ready')` para PM2.

### Hallazgos BLOQUEANTES — Estado

| ID | Hallazgo | Estado |
|----|----------|--------|
| F1-C01 | Prefijo duplicado 17- en PROD | **RESUELTO** |
| F1-C02 | Prefijo duplicado 17- en STAGING | **RESUELTO** |
| F2-C01 | admin@gamilit.com con Test1234 en PROD | PENDIENTE |
| F2-C02 | Password Test1234 en texto plano en PROD | PENDIENTE |
| F3-C01 | Password sudo 2320 hardcodeado en git | PENDIENTE |
| F4-C01 | JWT_REFRESH_SECRET ausente en .env.production | PENDIENTE |
| F4-C02 | Placeholders CHANGE_ME en .env.production | PENDIENTE |
| F5-C01 | BYPASSRLS=true anula 467 politicas RLS | PENDIENTE |
| F6-C01 | Health check URL /api/health siempre 404 | PENDIENTE |

---

## FASE 1: Seeds (12 hallazgos)

| ID | Severidad | Estado | Evidencia |
|----|-----------|--------|-----------|
| F1-C01 | BLOQUEANTE | **RESUELTO** | `seeds/prod/gamification_system/` — Solo existe `17-shop_items_metadata_normalization.sql`. Los archivos demo `17-user_purchases-demo.sql` fueron eliminados (SEED-HOMOLOGATION B4/B5). |
| F1-C02 | BLOQUEANTE | **RESUELTO** | `seeds/staging/gamification_system/` — Solo existe `17-shop_items_metadata_normalization.sql`. Demo files eliminados. |
| F1-C03 | ALTA | **PENDIENTE** | `seeds/prod/gamification_system/05-user_stats.sql` sigue en v2.0 (2025-11-15). Dev esta en v2.2 (2026-02-18) con fix REC-009 + dynamic lookups. ~240 lineas de diferencia. |
| F1-C04 | ALTA | **PENDIENTE** | `apps/database/scripts/config/staging.conf` no existe. Solo `dev.conf` y `prod.conf`. Linea 1835 de init-database.sh rechaza cualquier ENVIRONMENT != dev/prod. |
| F1-A01 | ALTA | **PARCIAL** | Algunos archivos `\|all\|core` sincronizados (ej. `06-profiles-production.sql` identico). Pero `05-user_stats.sql` aun diverge. Se necesita re-audit completo. |
| F1-A02 | ALTA | **RESUELTO** | `diff` exit 0 — `seeds/dev/auth_management/06-profiles-production.sql` y `seeds/prod/` son identicos. |
| F1-A03 | ALTA | **PARCIAL** | Staging ahora tiene 68 archivos SQL (mejora). Pero init-database.sh no soporta "staging" (F1-C04), asi que son efectivamente dead code. |
| F1-A04 | MEDIA | **PENDIENTE** | SQL funcional identico entre ambientes, pero headers difieren: Order=17 (dev), 16 (prod), 15 (staging). Metadata inconsistente. |
| F1-M01 | MEDIA | **PENDIENTE** | Pipeline (85 entradas) excluye ~20-25 archivos de seed no-test/no-backlog: progress_tracking/ (11 archivos), audit_logging/ (2), lti_integration/ (2), notifications/ (4), social_features/ (3). |
| F1-M02 | MEDIA | **RESUELTO** | `01-default-templates.sql\|all\|core` y `04-moderation_rules.sql\|all\|core` re-habilitados (SEED-HOMOLOGATION). Lineas 1136 y 1141 de init-database.sh. |
| F1-B01 | BAJA | **PENDIENTE** | `seeds/prod/_testing/` (4 SQL + README) y `seeds/prod/educational_content/_backlog/` (2 SQL + README) siguen existiendo. |
| F1-B02 | BAJA | **PENDIENTE** | Scopes solo reconocen `dev`, `prod`, `all`. No existe `staging`. |

---

## FASE 2: Usuarios y Datos Sensibles (7 hallazgos)

| ID | Severidad | Estado | Evidencia |
|----|-----------|--------|-----------|
| F2-C01 | BLOQUEANTE | **PENDIENTE** | `seeds/prod/auth/01-demo-users.sql` linea 62-65: UUID `aaaaaaaa-...`, `admin@gamilit.com`, `crypt('Test1234')`. Scope `\|all\|core` = se ejecuta en produccion. |
| F2-C02 | BLOQUEANTE | **PENDIENTE** | Mismo archivo: linea 12 `admin@gamilit.com / Test1234`, linea 33 `Password: "Test1234"`, lineas 185-187 `RAISE NOTICE` con credenciales en texto plano. |
| F2-C03 | ALTA | **PENDIENTE** | `seeds/dev/auth/02-production-users.sql` — 45 estudiantes reales con Gmail, nombres, hashes bcrypt. Scope `\|all\|core` = corre en todos los ambientes. |
| F2-A01 | ALTA | **PENDIENTE** | 45 hashes bcrypt de passwords reales en git history. `$2b$10$kb9yCB4Y...` en ambos dev/ y prod/. |
| F2-A02 | ALTA | **PENDIENTE** | `diff` exit 0 — dev y prod `02-production-users.sql` son byte-identicos. Sin segregacion. |
| F2-M01 | MEDIA | **PENDIENTE** | Lineas 200-204: curl ejemplo con `admin@gamilit.com / Test1234` en comments del seed de produccion. |
| F2-M02 | MEDIA | **PARCIAL** | Staging ahora tiene 2 archivos (48 usuarios total: 3 demo + 45 produccion). Pero init-database.sh no ejecuta staging. |

---

## FASE 3: Scripts y Pipeline DDL (14 hallazgos)

| ID | Severidad | Estado | Evidencia |
|----|-----------|--------|-----------|
| F3-C01 | BLOQUEANTE | **PENDIENTE** | `database-master.sh:41` — `SUDO_PASS_DEV="2320"` hardcodeado y tracked en git. |
| F3-C02 | ALTA | **PENDIENTE** | `database-master.sh:40` — `DB_PORT="5433"` hardcodeado. Prod usa 5432 (`prod.conf:14`). |
| F3-A01 | ALTA | **PENDIENTE** | `.env.database:13` y `.env.dev:28` — `DB_PASSWORD=gamilit_dev_2026` tracked en git. |
| F3-A02 | ALTA | **PENDIENTE** | `init-database.sh:602-606` — `> /dev/null 2>&1` suprime stdout+stderr de tablas. |
| F3-A03 | ALTA | **PENDIENTE** | `init-database.sh:476-483` — Output de prerequisites completamente suprimido. |
| F3-A04 | ALTA | **PENDIENTE** | `deploy-production.sh:228-239` — Tests fallidos solo print_warning, no bloquean deploy. |
| F3-A05 | ALTA | **PENDIENTE** | `deploy-production.sh:465-496` — Rollback solo restaura datos parciales, no codigo. |
| F3-M01 | MEDIA | **PENDIENTE** | `deploy-production.sh:451` — Health check contra `/api/v1/docs` (Swagger deshabilitado en prod). |
| F3-M02 | MEDIA | **PENDIENTE** | `init-database.sh:1696` — Connection string con password impresa en stdout. |
| F3-M03 | MEDIA | **PENDIENTE** | `init-database.sh:422` y `database-master.sh:494` — SQL injection potencial via single quotes en password. |
| F3-M04 | MEDIA | **PENDIENTE** | `deploy-production.sh:316-333` — Migrations sin BEGIN/COMMIT. |
| F3-M05 | BAJA | **PENDIENTE** | `prod.conf:72` — `ENV_SAVE_CREDENTIALS_ENCRYPTED="true"` sin implementacion. |
| F3-B01 | BAJA | **PENDIENTE** | 4 scripts temporales: `temp-init.sh`, `temp-phase2.sh`, `temp-phase3.sh`, `temp-seeds.sh`. |
| F3-B02 | BAJA | **PENDIENTE** | 3 de 32 scripts tienen `pipefail` (correccion: original decia 1/11). |

---

## FASE 4: Configuracion, CORS, SSL, PM2 (13 hallazgos)

| ID | Severidad | Estado | Evidencia |
|----|-----------|--------|-----------|
| F4-C01 | BLOQUEANTE | **PENDIENTE** | JWT_REFRESH_SECRET ausente en `.env`, `.env.dev`, `.env.production`. En dev, fallback inseguro `'your-refresh-secret-change-in-production'` (`jwt.config.ts:21`). En prod, `main.ts:142-143` detecta string vacio (< 32 chars) y llama `process.exit(1)`. |
| F4-C02 | BLOQUEANTE | **PENDIENTE** | `.env.production` lineas 20,25,43: `DB_PASSWORD=CHANGE_ME_IN_PRODUCTION`, `JWT_SECRET=CHANGE_ME_IN_PRODUCTION`, `SESSION_SECRET=CHANGE_ME_IN_PRODUCTION`. Placeholders committed. |
| F4-A01 | ALTA | **PENDIENTE** | `ecosystem.config.js:65,114` — `env_file` no es propiedad valida de PM2, ignorada silenciosamente. |
| F4-A02 | ALTA | **PENDIENTE** | `ecosystem.config.js:91-92` — Frontend sirve con `vite preview` (no apto para produccion). |
| F4-A03 | ALTA | **RESUELTO** | `main.ts` ahora incluye `process.send('ready')` despues de `app.listen()`. PM2 recibe la senal correctamente. |
| F4-A04 | ALTA | **PENDIENTE** | `.env.production:30` — 2 de 4 origenes CORS son HTTP (no HTTPS). |
| F4-A05 | ALTA | **PARCIAL** | Existe `apps/frontend/nginx.conf` generico (container-style). La config real de produccion (SSL, proxy) NO esta versionada. |
| F4-A06 | MEDIA | **PENDIENTE** | `vite.config.ts:49` — `sourcemap: true` incondicional, expone codigo fuente en prod. |
| F4-M01 | MEDIA | **PENDIENTE** | `DB_POOL_MAX` ausente en `.env.production`. Default 2 es insuficiente para prod (11 datasources). |
| F4-M02 | MEDIA | **PENDIENTE** | `.env.production:51` — `FRONTEND_URL=https://74.208.126.102:3005`. Si Nginx usa 443, URLs en emails apuntan a puerto incorrecto. |
| F4-M03 | MEDIA | **PENDIENTE** | `.env.production:40` — `RATE_LIMIT_MAX=100` identico a dev. |
| F4-M04 | MEDIA | **PENDIENTE** | `main.ts:34-37` — Requests sin origin permitidos (mobile, Postman, pero tambien file:// y redirects). |
| F4-B01 | BAJA | **PENDIENTE** | Duplicados `DB_USER`/`DB_USERNAME` y `DB_DATABASE`/`DB_NAME` en todos los .env. Documentado como intencional. |

---

## FASE 5: RLS y BYPASSRLS (9 hallazgos)

| ID | Severidad | Estado | Evidencia |
|----|-----------|--------|-----------|
| F5-C01 | BLOQUEANTE | **PENDIENTE** | `99-post-ddl-permissions.sql:119` — `ALTER ROLE gamilit_user BYPASSRLS`. `post_seeds_security()` deshabilitada intencionalmente (prerrequisitos documentados en `init-database.sh:1483-1491`). |
| F5-C02 | ALTA | **PENDIENTE** | `rls.interceptor.ts:98-99` — TODO comment. `getDataSource()` retorna `null` siempre (linea 55). Interceptor solo adjunta contexto, nunca ejecuta SET LOCAL. |
| F5-C03 | ALTA | **PENDIENTE** | Solo `teacher-reports.service.ts` (4 metodos: lineas 55, 85, 162, 230) ejecuta SET LOCAL. 0 de los demas ~900 endpoints. |
| F5-A01 | ALTA | **PENDIENTE** | Aislamiento multi-tenant depende 100% de logica de aplicacion. BYPASSRLS + stub interceptor = sin defensa en BD. |
| F5-A02 | ALTA | **PENDIENTE** | `current_tenant_id` solo aparece en comments/docstrings (6 matches). Cero ejecuciones reales de SET LOCAL. 19 policies DDL inoperantes. |
| F5-M01 | MEDIA | **PARCIAL** | Original reportaba 13 tablas con FORCE. Actual: **36 tablas** con FORCE ROW LEVEL SECURITY (mejora significativa, 07d-rls-policies anadio 14). Aun incompleto: 36/104 tablas RLS-enabled. Con BYPASSRLS=true, FORCE no tiene efecto practico. |
| F5-M02 | MEDIA | **PARCIAL** | `teacher-reports.service.ts:55` — String interpolation persiste, pero UUID validation guard (`isUUID()` regex) fue anadido en lineas 48-51. Injection mitigada en practica. |
| F5-M03 | MEDIA | **PENDIENTE** | ~65/169 tablas sin politicas RLS (104 tablas con ENABLE RLS, 65 sin ninguna policy). |
| F5-I01 | INFO | **PENDIENTE** | `init-database.sh:1494-1511` — `post_seeds_security()` imprime warnings pero NOBYPASSRLS esta comentado. Prerrequisitos documentados. |

---

## FASE 6: Pipeline de Deploy (14 hallazgos)

| ID | Severidad | Estado | Evidencia |
|----|-----------|--------|-----------|
| F6-C01 | BLOQUEANTE | **PENDIENTE** | `deploy-production.sh:434` — `curl /api/health` pero ruta real es `/api/v1/health`. Siempre 404. |
| F6-A01 | ALTA | **PENDIENTE** | `deploy-production.sh:399` — `pm2 stop all` = downtime total (2-10 min). Sin rolling restart. |
| F6-A02 | ALTA | **PENDIENTE** | `deploy-production.yml:6` — `branches: - main`. Proyecto usa `master`. Workflow nunca ejecuta. |
| F6-A03 | ALTA | **PENDIENTE** | `deploy-production.yml:134-135` — `continue-on-error: true` en build. Backend roto pasaria a deploy. |
| F6-A04 | ALTA | **PENDIENTE** | `backup-production-data.sh:181-219` — Solo ~20 tablas respaldadas de 169 totales. |
| F6-A05 | ALTA | **PENDIENTE** | `prod.conf:55` — `ENV_MIN_TABLES="64"` (38% de 169). Thresholds demasiado bajos. |
| F6-M01 | MEDIA | **PENDIENTE** | 5 scripts de deploy sin claridad sobre cual es oficial. |
| F6-M02 | MEDIA | **PENDIENTE** | Sin lock de deploy. Deploys concurrentes posibles. |
| F6-M03 | MEDIA | **PENDIENTE** | Sin monitoring SQL integrado en deploy o cron. |
| F6-M04 | MEDIA | **PENDIENTE** | `rollback-migration.sh:56` — `dropdb` destructivo total. |
| F6-M05 | MEDIA | **PENDIENTE** | `deploy-production.yml:21` — Node 18 vs Node 20 en CI workflows. |
| F6-B01 | BAJA | **PENDIENTE** | Sin notificaciones de deploy externas (Slack/email). |
| F6-B02 | BAJA | **PENDIENTE** | PM2 logs sin rotacion (`merge_logs: true` pero sin `max_size`). |
| F6-B03 | BAJA | **PENDIENTE** | Sin smoke tests post-deploy (solo health check basico que ademas falla F6-C01). |

---

## Resumen por Severidad y Estado

| Severidad | RESUELTO | PARCIAL | PENDIENTE | Total |
|-----------|:--------:|:-------:|:---------:|:-----:|
| BLOQUEANTE | 2 | 0 | 7 | 9 |
| ALTA | 2 | 2 | 23 | 27 |
| MEDIA | 1 | 2 | 13 | 16 |
| BAJA | 0 | 0 | 7 | 7 |
| INFO | 0 | 0 | 1 | 1 |
| **Total** | **5** | **4** | **51** | **56** |

> **Nota:** El conteo original reportaba 6 BLOQUEANTES + 3 duplicados cross-fase = 9 total. Esta auditoria los contabiliza como 9 hallazgos BLOQUEANTES unicos.

---

## Correcciones Aplicadas Hoy (2026-02-20)

### Fix Acceso LAN (Fase 3 del plan de auditoria)

Se corrigio el problema de acceso desde dispositivos LAN:

| Archivo | Cambio |
|---------|--------|
| `apps/frontend/src/config/api.config.ts` | URLs proxy-aware: `VITE_API_HOST=proxy` → URLs relativas (`/api/v1`). Produccion sin cambio. |
| `apps/frontend/.env` | `VITE_API_HOST=proxy`, `VITE_WS_HOST=` — activa modo proxy via Vite |
| `apps/backend/src/main.ts` | CORS en dev auto-acepta origenes de red local (192.168.x.x, 10.x.x.x, 172.16-31.x.x) |

**Impacto en hallazgos:**
- F4-A04 (HTTP origins CORS) → Sin cambio en produccion. En dev, LAN access ahora funciona automaticamente.

### Builds Validados

- Frontend: `vite build` exitoso (19s)
- Frontend: `tsc --noEmit` sin errores nuevos (pre-existentes en .example.tsx)
- Backend: `tsc` exitoso sin errores

---

## Priorizacion Recomendada de Pendientes

### P0 — Bloquean produccion segura (7 hallazgos)

1. **F2-C01/C02** — Eliminar admin@gamilit.com/Test1234 de seeds de produccion
2. **F4-C01** — Agregar JWT_REFRESH_SECRET a `.env.production`
3. **F4-C02** — Reemplazar placeholders CHANGE_ME con valores reales en servidor
4. **F5-C01** — Plan de activacion de NOBYPASSRLS (requiere F5-C02 primero)
5. **F6-C01** — Corregir URL de health check a `/api/v1/health`
6. **F3-C01** — Remover password sudo del repo

### P1 — Riesgo alto, correccion recomendada (19 hallazgos)

- F2-C03, F2-A01, F2-A02 — Anonimizar PII de estudiantes, segregar dev/prod
- F3-A04 — Tests fallidos deben bloquear deploy
- F4-A02 — Reemplazar `vite preview` con Nginx/static server
- F4-A03 — Agregar `process.send('ready')` en main.ts
- F5-C02, F5-C03, F5-A01, F5-A02 — Implementar RlsInterceptor funcional
- F6-A02 — Corregir branch `main` → `master` en deploy workflow
- F6-A03 — Remover `continue-on-error: true` de build step

---

*Auditoria generada por Claude Opus 4.6 — 2026-02-20*
*3 agentes paralelos: Seeds+Usuarios, Scripts+Deploy, Config+RLS*
