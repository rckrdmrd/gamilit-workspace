# 02-DISCREPANCIAS: Clasificacion Completa por Severidad

**Fecha:** 2026-02-17
**Version:** 1.0.0
**Total discrepancias:** 38

---

## Exclusiones (ya resueltos, NO re-reportados)

| ID Previo | Descripcion | Estado |
|-----------|-------------|--------|
| H-DB-01 | 18 FKs data_warehouse singular->plural | FIXED (Sprint P0-P1) |
| H-DB-02 | 3 FKs auth.users->auth_management.profiles | FIXED (Sprint P0-P1) |
| H-BE-01 | SSOT endpoints 899->901 | FIXED (Sprint P0-P1) |
| H-FE-01 | Dual leaderboard stores | INTENTIONAL |
| H-FE-03 | AuthStore + AuthContext | INTENTIONAL (complementarios) |
| CORR-01 | env.validation.ts types | ALREADY RESOLVED |
| CORR-02 | Lint errors | ALREADY RESOLVED |

---

## P0 Critical (Bloquean coherencia de documentacion SSOT)

### DISC-P0-001: _INDEX.md RLS Policies = 207 (debe ser 227)
- **Dimension:** C (Doc-DDL)
- **Capa:** Documentation
- **Archivo:** `docs/20-architecture/schema-reference/_INDEX.md`
- **Evidencia:** _INDEX.md summary table y footer dicen "207 RLS policies". Realidad DDL = 227 (207 + 20 Phase 2 FORCE RLS)
- **Impacto:** Documentacion SSOT incorrecta. Cualquier nuevo desarrollador leer? metricas incorrectas.
- **Fix:** Update summary table line + footer line: 207 -> 227

### DISC-P0-002: _INDEX.md ENUMs = 40 (debe ser 42)
- **Dimension:** C (Doc-DDL)
- **Capa:** Documentation
- **Archivo:** `docs/20-architecture/schema-reference/_INDEX.md`
- **Evidencia:** Summary table y footer dicen "40 ENUMs". Realidad = 42 (alert_severity, alert_status son ENUMs en 00-prerequisites.sql)
- **Impacto:** Documentacion SSOT incorrecta
- **Fix:** Update: 40 -> 42 en summary + footer

---

## P1 High (Requieren correccion pronta)

### DISC-P1-001: ~10 phantom API calls activos en runtime
- **Dimension:** B (Backend-Frontend)
- **Capa:** Frontend
- **Archivo:** `apps/frontend/src/config/api.config.ts` + archivos que consumen estos endpoints
- **Evidencia:** API_ENDPOINTS define ~35 rutas sin controller backend. ~10 son llamados activamente via apiClient:
  - `/economy/*` (balance, transactions, shop, purchase, earn, spend) -> deberia ser `/gamification/shop` + `/gamification/ml-coins`
  - `/auth/me` -> deberia ser `/auth/profile`
  - `/auth/request-password-reset` -> deberia ser `/auth/reset-password/request`
  - `/notifications/send` -> deberia ser `POST /notifications`
  - `/health/status` -> deberia ser `/health/live`
  - `/health/detailed` -> deberia ser `/health/ready`
- **Impacto:** Runtime errors 404 para usuarios que activan estas features
- **Fix:** Corregir paths en api.config.ts para mapear a controllers reales

### DISC-P1-002: 99-utilities.md ENUMs incompleto (36 listados, 42 reales)
- **Dimension:** C (Doc-DDL)
- **Capa:** Documentation
- **Archivo:** `docs/20-architecture/schema-reference/99-utilities.md`
- **Evidencia:** Titulo dice "ENUMs (40)", lista 36 ENUMs explicitamente, realidad = 42. Footer tambien stale (207 RLS, 40 ENUMs)
- **Impacto:** Referencia incompleta para desarrolladores
- **Fix:** Agregar 6 ENUMs faltantes, corregir titulo 40->42, corregir footer

### DISC-P1-003: API-REFERENCE.md documenta solo 21% de endpoints
- **Dimension:** E (Inventory/API Docs)
- **Capa:** Documentation
- **Archivo:** `docs/40-api/API-REFERENCE.md`
- **Evidencia:** 191 endpoints documentados en tablas vs 901 en codigo. Header dice "899 endpoints".
- **Impacto:** Nuevo desarrollador no tiene referencia de ~710 endpoints
- **Fix:** (a) Agregar disclaimer "subset representativo" o (b) expandir documentacion sistematicamente

### DISC-P1-004: FRONTEND_INVENTORY.yml stale (+22 components, -5 API files)
- **Dimension:** E (Inventory)
- **Capa:** Inventarios
- **Archivo:** `orchestration/inventarios/FRONTEND_INVENTORY.yml`
- **Evidencia:** Components 480 vs 502 (+22), API files 52 vs 47 (-5), Routes 72 vs 75 (+3)
- **Impacto:** MASTER_INVENTORY hereda valores incorrectos. Metricas en CLAUDE.md incorrectas.
- **Fix:** Re-verificar y actualizar counts: components~502, api_files~47, routes~75

### DISC-P1-005: 5 phantom schema references en flujos
- **Dimension:** D (Flujos)
- **Capa:** Documentation
- **Archivos:** 11 flujos afectados (FL-TCH-03/04/05, FL-ADM-02/04/06/07, FL-PRN-02/06/07, FL-SHR-03)
- **Evidencia:** Schemas `analytics`, `monitoring`, `platform_settings`, `audit`, `tenant_settings` no existen en DDL
- **Impacto:** Trazabilidad rota entre flujos y base de datos
- **Fix:** Reemplazar con schemas reales: analytics->data_warehouse+audit_logging, monitoring->audit_logging, platform_settings->system_configuration, audit->audit_logging

### DISC-P1-006: Auth API path mismatches
- **Dimension:** B (Backend-Frontend)
- **Capa:** Frontend
- **Archivos:** `apps/frontend/src/config/api.config.ts`, auth-related API files
- **Evidencia:**
  - FE: `/auth/request-password-reset` vs BE: `/auth/reset-password/request`
  - FE: `/auth/me` vs BE: `/auth/profile`
  - FE: `/auth/validate-token` -> no existe en backend
- **Impacto:** Password reset flow puede fallar; /auth/me retorna 404
- **Fix:** Alinear api.config.ts con rutas reales del PasswordController y AuthController

---

## P2 Medium (Mejora recomendada)

### DISC-P2-001: Admin alerts dismiss vs suppress naming mismatch
- **Dimension:** B (Backend-Frontend)
- **Capa:** Frontend + Backend
- **Archivos:** FE admin alerts API, `admin-alerts.controller.ts`
- **Evidencia:** FE llama `/admin/alerts/:id/dismiss`, BE tiene `PATCH /admin/alerts/:id/suppress`
- **Impacto:** Dismiss all y individual dismiss fallan en runtime
- **Fix:** Alinear naming (cambiar FE dismiss->suppress o agregar alias en BE)

### DISC-P2-002: NotificationService.ts phantom endpoint
- **Dimension:** B (Backend-Frontend)
- **Capa:** Frontend
- **Archivo:** `apps/frontend/src/services/NotificationService.ts`
- **Evidencia:** `POST /notifications/send` no existe; BE usa `POST /notifications`
- **Impacto:** Push notifications desde FE fallan
- **Fix:** Cambiar `/notifications/send` -> `/notifications`

### DISC-P2-003: ~25 phantom tables en schema-reference docs
- **Dimension:** C (Doc-DDL)
- **Capa:** Documentation
- **Archivos:** 12 schema-reference docs afectados
- **Evidencia:** Tablas como auth.refresh_tokens, tenants.tenant_settings, education.exercise_types, gamification.levels, social.social_feed, etc. no existen en DDL
- **Impacto:** Documentacion misleading para desarrolladores
- **Fix:** Marcar como CONCEPTUAL/DEFERRED o eliminar

### DISC-P2-004: ~75-80 DDL tables sin documentacion de columnas
- **Dimension:** C (Doc-DDL)
- **Capa:** Documentation
- **Archivos:** Todos los schema-reference docs
- **Evidencia:** 169 DDL tables, ~90 mencionadas en docs (muchas phantom). Cobertura real ~55%
- **Impacto:** Desarrolladores deben leer DDL directamente para entender estructura
- **Fix:** Agregar disclaimer a docs + gradualmente expandir documentacion de tablas criticas

### DISC-P2-005: auth.users doc estructura completamente diferente a DDL
- **Dimension:** C (Doc-DDL)
- **Capa:** Documentation
- **Archivo:** `docs/20-architecture/schema-reference/01-auth.md`
- **Evidencia:** Doc describe 14 columnas simples (password_hash, first_name, etc.). DDL tiene 30+ columnas Supabase-compatible (encrypted_password, confirmation_token, raw_app_meta_data, etc.). No hay tenant_id, no hay first_name/last_name en DDL.
- **Impacto:** Documento mas misleading de toda la documentacion
- **Fix:** Reescribir seccion auth.users para reflejar estructura Supabase

### DISC-P2-006: 35/72 rutas frontend sin flujo documentado
- **Dimension:** D (Flujos)
- **Capa:** Documentation
- **Archivos:** Flujos index files + App.tsx
- **Evidencia:** Admin 14 unmapped, Teacher 12 unmapped, Student 7 unmapped. Paginas criticas sin flujo: Teacher Dashboard, Admin Dashboard, Student Progress, Student Assignments
- **Impacto:** Testing y onboarding sin referencia para ~49% de la aplicacion
- **Fix:** Crear flujos para dashboards y paginas criticas (priorizar landing pages)

### DISC-P2-007: 4 table name mismatches en flujos
- **Dimension:** D (Flujos)
- **Capa:** Documentation
- **Archivos:** FL-ADM-06, FL-STU-14, FL-TCH-05, FL-ADM-07
- **Evidencia:**
  - `login_attempts` -> deberia ser `auth_attempts`
  - `user_activity` -> deberia ser `user_activity_logs`
  - `leaderboard_entries` -> no existe (uses MVs)
  - `exercise_options` -> no existe (JSONB en exercises)
- **Fix:** Corregir nombres en flujos afectados

### DISC-P2-008: 3 endpoint path mismatches en flujos
- **Dimension:** D (Flujos)
- **Capa:** Documentation
- **Archivos:** FL-AUTH-02, FL-ADM-02, FL-TCH-07
- **Evidencia:**
  - `forgot-password` -> `reset-password/request`
  - `admin/config` -> `admin/system/config`
  - `teacher/settings` -> no existe
- **Fix:** Corregir paths en flujos afectados

### DISC-P2-009: Database function count ambiguity (183 vs ~201)
- **Dimension:** E (Inventory)
- **Capa:** Inventarios
- **Archivo:** `orchestration/inventarios/DATABASE_INVENTORY.yml`
- **Evidencia:** Inventory = 183, CREATE FUNCTION grep = ~201. Diferencia por archivos multi-funcion (mission_trigger_wrappers=9, friendship_helpers=9, block_helpers=8, conversation-functions=8)
- **Impacto:** Metrica confusa sin nota de metodologia
- **Fix:** Agregar nota explicativa: "183 = unique function files (excl .TEST.sql), ~201 = CREATE FUNCTION statements"

### DISC-P2-010: API-REFERENCE.md header stale (899 vs 901)
- **Dimension:** E (Inventory/API Docs)
- **Capa:** Documentation
- **Archivo:** `docs/40-api/API-REFERENCE.md`
- **Evidencia:** Header "Total Endpoints: 899", footer "899 endpoints | 22 modulos". Real: 901 endpoints, 23 modulos
- **Fix:** Update header/footer: 899->901, 22->23

### DISC-P2-011: Gamification config API phantom endpoints
- **Dimension:** B (Backend-Frontend)
- **Capa:** Frontend
- **Archivo:** `apps/frontend/src/services/api/admin/gamificationConfigApi.ts`
- **Evidencia:**
  - `POST /admin/gamification/config/parameters/:key/reset` -> no existe
  - `POST /admin/gamification/config/parameters/bulk-update` -> no existe
  - `POST /admin/gamification/config/preview-impact` -> no existe (BE tiene `settings/preview`)
  - `GET /admin/gamification/config/stats` -> no existe
- **Fix:** Alinear con endpoints reales del admin-gamification-config.controller.ts

---

## P3 Low (Nice to have)

### DISC-P3-001: 3 guild entities usan hardcoded table names
- **Dimension:** A (DB-Backend)
- **Capa:** Backend
- **Archivos:** guild.entity.ts, guild-member.entity.ts, guild-join-request.entity.ts
- **Evidencia:** `@Entity({ name: 'guilds' })` en lugar de `DB_TABLES.SOCIAL.GUILDS`
- **Fix:** Usar DB_TABLES constants como el resto de entities

### DISC-P3-002: 2 data_warehouse tables sin DB_TABLES entry
- **Dimension:** A (DB-Backend)
- **Capa:** Backend
- **Archivo:** `apps/backend/src/shared/constants/database.constants.ts`
- **Evidencia:** ml_model_weights y ml_prediction_logs no estan en DB_TABLES.DATA_WAREHOUSE
- **Fix:** Agregar entries (aunque modulos no estan importados)

### DISC-P3-003: DATABASE_INVENTORY gamification_system=21 vs DDL=20
- **Dimension:** E (Inventory) / C (Doc-DDL)
- **Capa:** Inventarios
- **Archivo:** `orchestration/inventarios/DATABASE_INVENTORY.yml`
- **Evidencia:** Per-schema count dice 21 tablas para gamification_system, DDL tiene 20 CREATE TABLE
- **Fix:** Verificar y corregir a 20

### DISC-P3-004: Health module inventory=1 endpoint, real=4
- **Dimension:** E (Inventory)
- **Capa:** Inventarios
- **Archivo:** `orchestration/inventarios/BACKEND_INVENTORY.yml`
- **Evidencia:** Per-module breakdown `health: endpoints: 1` pero controller tiene @Get(), @Get('live'), @Get('ready'), @Get('metrics')
- **Fix:** Actualizar health endpoints: 1 -> 4

### DISC-P3-005: 18-admin-dashboard.md lista phantom materialized_views_config
- **Dimension:** C (Doc-DDL)
- **Capa:** Documentation
- **Archivo:** `docs/20-architecture/schema-reference/18-admin-dashboard.md`
- **Evidencia:** Doc dice 4 tablas incluyendo materialized_views_config, DDL solo tiene 3 tablas
- **Fix:** Remover materialized_views_config o clarificar como "config de MVs, no una tabla"

### DISC-P3-006: 3 flujos con FE refs genericas (prosa)
- **Dimension:** D (Flujos)
- **Capa:** Documentation
- **Archivos:** FL-PRN-01, FL-PRN-02, FL-PRN-03
- **Evidencia:** Usan "portal padres (vinculacion)" en lugar de paths a archivos
- **Fix:** Reemplazar con paths reales (ParentDashboardPage.tsx, ChildProgressPage.tsx)

### DISC-P3-007: Backend endpoint total 901 vs 902
- **Dimension:** E (Inventory)
- **Capa:** Inventarios
- **Archivos:** BACKEND_INVENTORY.yml, MASTER_INVENTORY.yml
- **Evidencia:** grep @Get/@Post/@Patch/@Put/@Delete = 902 vs inventory = 901. Delta +1
- **Fix:** Re-verificar y actualizar si es real

---

## Resumen por Capa

| Capa | P0 | P1 | P2 | P3 | Total |
|------|----|----|----|----|-------|
| Database/DDL | 0 | 0 | 0 | 2 | 2 |
| Backend | 0 | 1 | 2 | 2 | 5 |
| Frontend | 0 | 2 | 2 | 0 | 4 |
| Documentation | 2 | 3 | 7 | 2 | 14 |
| Inventarios | 0 | 1 | 2 | 2 | 5 |
| **Total** | **2** | **7** | **13** | **8** | **30** |

**Nota:** 8 hallazgos adicionales clasificados como INFO no se incluyen como discrepancias (son by design o known gaps).

---

*Generado: 2026-02-17 | Fuente: 5 matrices de agentes A-E*
