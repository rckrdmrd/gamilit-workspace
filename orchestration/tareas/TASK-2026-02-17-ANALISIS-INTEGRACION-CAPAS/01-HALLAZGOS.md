# 01-HALLAZGOS: Analisis de Integracion entre 4 Capas

**Fecha:** 2026-02-17
**Version:** 1.0.0
**Metodo:** 5 agentes en paralelo (A-E) analizando 6 dimensiones de integracion
**Duracion total:** ~6 minutos (5 agentes concurrentes)

---

## Resumen Ejecutivo

| Dimension | Agente | Resultado | Score |
|-----------|--------|-----------|-------|
| A: DB-Backend Entity | A | 153/169 matched, 16 DDL-only (esperado) | **90.5%** |
| B: Backend-Frontend API | B | 548 consumed / 902 total, ~35 phantom FE defs | **60.8%** |
| C: Docs-DDL Consistency | C | ~25 phantom tables, ~75 undocumented, metricas stale | **~55%** |
| D: Flujos-Implementation | D | 37/72 rutas cubiertas, 5 phantom schemas | **51.4%** |
| E: Inventarios Cross-Val | E | MASTER 100% consistente, FE stale, API docs 21% | **85%** |

### Veredicto General

La integracion **DB-Backend es excelente** (90.5%). La integracion **Backend-Frontend es funcional** (60.8%) con gaps conocidos en social/content/LTI. La **documentacion es el area mas debil**: schema-reference docs son conceptuales (~25 phantom tables), flujos cubren solo 51.4% de rutas, y API-REFERENCE documenta solo 21% de endpoints. Los **inventarios SSOT son altamente precisos** excepto FRONTEND_INVENTORY que tiene 2 dias de antiguedad.

---

## Hallazgos por Dimension

### A: DB-Backend Entity Integrity (Score: 90.5%)

**Estado: EXCELENTE**

| Hallazgo | Severidad | Detalle |
|----------|-----------|---------|
| H-A-01: 169 DDL tables, 153 entities, 0 orphans | INFO | Perfecto alineamiento. 16 DDL-only = data_warehouse (esperado) |
| H-A-02: 0 schema mismatches | INFO | Todas las entities referencian schema correcto via DB_SCHEMAS |
| H-A-03: 11 datasources cubren 153 entities | INFO | 0 gaps de cobertura. Cross-datasource registrations correctos |
| H-A-04: 3 guild entities usan hardcoded strings | P3 | guild, guild_members, guild_join_requests no usan DB_TABLES constants |
| H-A-05: 2 data_warehouse tables sin DB_TABLES entry | P3 | ml_model_weights, ml_prediction_logs no estan en database.constants.ts |
| H-A-06: Entity file locations vs DDL schema | INFO | teacher/ entities mapean a social_features, progress_tracking, communication. admin/ entities mapean a system_configuration, audit_logging, admin_dashboard. Esto es intencional (organizacion por modulo backend, no por schema). |

**Fortalezas:**
- Zero orphan entities (toda entity tiene DDL)
- Zero schema mismatches
- Cross-datasource registrations completos (Profile/Tenant en 6 datasources)
- database.constants.ts cubre 167/169 tablas

---

### B: Backend-Frontend API Coverage (Score: 60.8%)

**Estado: FUNCIONAL con gaps conocidos**

| Hallazgo | Severidad | Detalle |
|----------|-----------|---------|
| H-B-01: ~35 phantom API_ENDPOINTS en api.config.ts | **P1** | economy/*, mechanics/*, ai/*, student/* no tienen controllers backend. ~10 son llamados activamente en runtime |
| H-B-02: Auth path mismatches | **P1** | request-password-reset vs reset-password/request, /auth/me vs /auth/profile, /auth/validate-token no existe |
| H-B-03: Admin alerts dismiss vs suppress | **P2** | FE llama dismiss, BE tiene suppress |
| H-B-04: NotificationService.ts phantom | **P2** | POST /notifications/send vs POST /notifications |
| H-B-05: 58 endpoints en modulos no importados | INFO | etl (16), ml (21), visualization (21) - NOT imported, future capabilities |
| H-B-06: Social challenges 46 orphaned | INFO | team-challenges (9), peer-challenges (14), challenge-participants (15), user-follows (7) - KNOWN GAP documentado |
| H-B-07: Content management 42 orphaned | P3 | tags, moderation-rules, media-metadata, content-versions, flagged-content sin FE |
| H-B-08: LTI 41 orphaned | INFO | Arquitecturalmente correcto (server-to-server protocol) |
| H-B-09: Notifications 29 orphaned | INFO | Infrastructure server-side, admin-facing |

**Cobertura por portal:**
- Teacher: 79.6% (mejor cubierto)
- Gamification: 78.2%
- Progress: 76.9%
- Auth: 75.9%
- Educational: 70.6%
- Content: 34.8%
- Social: 34.4%
- LTI: 2.4% (esperado)

---

### C: Docs-DDL Consistency (Score: ~55%)

**Estado: DEBIL - documentacion conceptual, no DDL-exact**

| Hallazgo | Severidad | Detalle |
|----------|-----------|---------|
| H-C-01: _INDEX.md RLS=207 (debe ser 227) | **P0** | Stale desde Phase 2 FORCE RLS |
| H-C-02: _INDEX.md ENUMs=40 (debe ser 42) | **P0** | Stale |
| H-C-03: 99-utilities.md lista 36 ENUMs (debe ser 42) | **P1** | Titulo dice 40, lista 36, realidad 42 |
| H-C-04: ~25 phantom tables en schema-ref docs | **P2** | Tablas conceptuales que nunca se crearon en DDL |
| H-C-05: ~75-80 tables sin documentacion de columnas | **P2** | DDL tiene 169 tablas pero docs solo cubren ~90 (y muchas son phantom) |
| H-C-06: auth.users doc vs DDL = MAJOR mismatch | **P2** | Doc describe 14 cols simples, DDL tiene 30+ cols Supabase-compatible |
| H-C-07: Spot-check 5 tablas: TODAS con divergencia significativa | **P2** | auth.users (CRITICAL), profiles (HIGH), exercises (HIGH), user_stats (HIGH), tenants (MODERATE) |
| H-C-08: DATABASE_INVENTORY gamification_system=21 vs DDL=20 | **P3** | Off by 1 |
| H-C-09: MODELO-DATOS.md v1.2.0 metricas correctas | INFO | Unico doc completamente actualizado |
| H-C-10: 18-admin-dashboard.md lista 4 tablas, DDL tiene 3 | **P3** | materialized_views_config es phantom |

**Docs mejor alineados:** communication (19-communication.md), data_warehouse (17-data-warehouse.md), gamilit utility (20-gamilit-utility.md)
**Docs peor alineados:** missions (11-missions.md: 5/6 phantom), leaderboard (12-leaderboard.md: 4/4 phantom), auth (01-auth.md: estructura completamente diferente)

---

### D: Flujos-Implementation Mapping (Score: 51.4%)

**Estado: PARCIAL - buena cobertura estudiante, debil admin/teacher**

| Hallazgo | Severidad | Detalle |
|----------|-----------|---------|
| H-D-01: 35/72 rutas sin flujo | **P2** | Admin 14 unmapped, Teacher 12 unmapped, Student 7 unmapped |
| H-D-02: 5 phantom schema references | **P1** | analytics, monitoring, platform_settings, audit, tenant_settings - nombres conceptuales, no DDL |
| H-D-03: 4 table name mismatches | **P2** | login_attempts (auth_attempts), user_activity (user_activity_logs), leaderboard_entries (no existe), exercise_options (JSONB) |
| H-D-04: 3 endpoint path mismatches | **P2** | forgot-password, admin/config, teacher/settings |
| H-D-05: 3 flujos con FE refs genericas | **P3** | FL-PRN-01/02/03 usan prosa, no paths |
| H-D-06: 0 FE file references rotas | INFO | Todas las refs a archivos .tsx/.ts existen en disco |
| H-D-07: 43 entries, 39 archivos unicos, FL-TCH-07 es alias | INFO | Discrepancia explicada por alias y compositos |

**Cobertura por portal:**
- Estudiante: 71% (17/24 rutas) - mejor
- Teacher: 37% (7/19 rutas) - debil
- Admin: 36% (8/22 rutas) - debil
- Utility: 2 rutas no necesitan flujo (404, unauthorized)

**Paginas criticas sin flujo:**
- Teacher Dashboard, Admin Dashboard (landing pages principales)
- Student Progress, Student Assignments (funcionalidad core)
- Teacher Classes/Students (gestion de aulas)
- Admin Institutions (multi-tenant)

---

### E: Inventory Cross-Validation (Score: 85%)

**Estado: BUENO - MASTER consistente, FE stale**

| Hallazgo | Severidad | Detalle |
|----------|-----------|---------|
| H-E-01: MASTER = Sub-inventarios (25/25 metricas) | INFO | 100% consistente |
| H-E-02: API-REFERENCE.md = 191 endpoints (21% de 901) | **P1** | Gap masivo de documentacion API |
| H-E-03: FRONTEND_INVENTORY stale | **P1** | Components 480 vs 502 (+22), API files 52 vs 47 (-5), Routes 72 vs 75 (+3) |
| H-E-04: API-REFERENCE.md header=899 vs real=901 | **P2** | Stale por +2-3 endpoints |
| H-E-05: Backend endpoints 901 vs 902 | **P3** | Delta +1, posiblemente health module (inventario dice 1, controller tiene 4 decorators) |
| H-E-06: Database functions 183 vs ~201 CREATE FUNCTION | **P2** | Metodologia de conteo ambigua (archivos vs statements) |
| H-E-07: Health module inventory=1 endpoint, real=4 | **P3** | Per-module breakdown inconsistente |
| H-E-08: Trigger raw count=131 vs inventory=67 | INFO | Batch trigger files inflacionan grep; inventory correcto contando conceptual |
| H-E-09: RLS raw count=611 vs inventory=227 | INFO | Multiple locations de definicion; inventory correcto contando unicos |

---

## Correlaciones Cross-Dimension

### 1. Phantom API = Phantom Docs
Los ~35 phantom API_ENDPOINTS en frontend (economy/*, mechanics/*, student/*) correlacionan con tablas phantom en docs (education.exercise_types, gamification.levels). Ambos reflejan **planning aspiracional que nunca se implemento**.

### 2. Schema Naming Inconsistency Spans All Layers
5 phantom schema refs en flujos (analytics, monitoring, etc.) = mismos nombres conceptuales en schema-ref docs (01-auth → `auth.sessions` vs DDL `auth_management.user_sessions`). La desconexion conceptual-vs-fisico afecta docs, flujos, y frontend API configs.

### 3. Social Module: Backend-Heavy, Frontend-Light
128 backend endpoints en social, solo 44 consumed (34.4%). Este patron se refleja en flujos (FL-STU-09/10 cubren amigos/gremios pero team/peer challenges no tienen flujo).

### 4. Content Management: Under-Documented, Under-Wired
92 backend endpoints, 34.8% coverage. 10 DDL tables, 9 sin documentacion en 13-content.md. Schema-ref doc solo lista 3 tablas (2 phantom).

### 5. Inventory Accuracy Gradient
- DATABASE_INVENTORY: Muy preciso (solo -1 gamification tables)
- BACKEND_INVENTORY: Preciso (delta +1 endpoint)
- FRONTEND_INVENTORY: Stale (deltas +22/-5/+3)
- El frontend evoluciona mas rapido que el tracking manual de inventario.

---

## Resumen de Hallazgos por Prioridad

| Prioridad | Count | Ejemplos |
|-----------|-------|----------|
| **P0 Critical** | 2 | _INDEX.md RLS/ENUM stale |
| **P1 High** | 6 | Phantom API calls, schema-ref ENUMs, API docs 21%, FE inventory stale, phantom schema refs in flujos |
| **P2 Medium** | 11 | Auth path mismatches, phantom tables in docs, undocumented tables, route coverage gaps, function count ambiguity |
| **P3 Low** | 7 | Guild hardcoded strings, DW tables sin constants, health endpoint count, generic FE refs |
| **INFO** | 12 | Correct by design patterns, known gaps |

**Total hallazgos unicos:** 38 (excluyendo duplicados cross-dimension)

---

*Generado por consolidacion de 5 agentes: A (DB-Backend), B (Endpoint Coverage), C (Doc-DDL), D (Flujos), E (Inventory)*
*Archivos fuente: orchestration/tareas/TASK-2026-02-17-ANALISIS-INTEGRACION-CAPAS/04-MATRICES/{A,B,C,D,E}-*.md*
