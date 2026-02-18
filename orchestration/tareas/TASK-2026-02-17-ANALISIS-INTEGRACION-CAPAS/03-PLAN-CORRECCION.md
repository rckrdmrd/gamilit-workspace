# 03-PLAN-CORRECCION: Remediacion Priorizada

**Fecha:** 2026-02-17
**Version:** 1.0.0
**Discrepancias totales:** 30 (2 P0, 7 P1, 13 P2, 8 P3)
**Esfuerzo estimado total:** ~18-24 horas

---

## Fase 1: P0 Critical — Correccion Inmediata (30 min)

| # | ID | Tarea | Archivo | Esfuerzo | Dependencias |
|---|-----|-------|---------|----------|--------------|
| 1.1 | DISC-P0-001 | Actualizar _INDEX.md: RLS 207->227 (summary + footer) | schema-reference/_INDEX.md | 5 min | Ninguna |
| 1.2 | DISC-P0-002 | Actualizar _INDEX.md: ENUMs 40->42 (summary + footer) | schema-reference/_INDEX.md | 5 min | Ninguna |

**Criterio de cierre:** `_INDEX.md` muestra "227 RLS policies" y "42 ENUMs" en tabla y footer.

---

## Fase 2: P1 High — Correccion Esta Semana (~6-8 horas)

### 2.1 Frontend API Path Fixes (2-3 horas)

| # | ID | Tarea | Archivo(s) | Esfuerzo |
|---|-----|-------|-----------|----------|
| 2.1.1 | DISC-P1-001 | Corregir ~10 phantom API calls activos | api.config.ts + consumers | 1.5h |
| 2.1.2 | DISC-P1-006 | Fix auth paths (request-password-reset, /auth/me, validate-token) | api.config.ts + auth API files | 30 min |

**Detalle DISC-P1-001 (phantom API calls):**
1. `economy/*` -> Remapear a `/gamification/shop/*` + `/gamification/ml-coins/*`
2. `student/*` -> Remapear a rutas existentes (profile, progress, etc.)
3. `mechanics/*` -> Evaluar si eliminar o mapear a `/educational/exercises`
4. `ai/*` -> Evaluar si eliminar (no hay controller AI)
5. `gamification/friends/*` -> Remapear a `/friends/*` o `/social/friendships/*`
6. `gamification/streaks/*` -> Eliminar (streaks en user_stats, no endpoint dedicado)
7. `gamification/leaderboard/user/:userId/position` -> Remapear a `/gamification/leaderboards/user-rank`

**Detalle DISC-P1-006 (auth paths):**
1. `request-password-reset` -> `reset-password/request`
2. `/auth/me` -> `/auth/profile`
3. `/auth/validate-token` -> Eliminar (no existe) o crear endpoint BE

**Dependencias:** Requiere verificar que componentes que consumen estos endpoints se actualizan tambien.

### 2.2 Documentation Fixes (2-3 horas)

| # | ID | Tarea | Archivo(s) | Esfuerzo |
|---|-----|-------|-----------|----------|
| 2.2.1 | DISC-P1-002 | Completar 99-utilities.md ENUMs (36->42, titulo 40->42, footer) | 99-utilities.md | 30 min |
| 2.2.2 | DISC-P1-003 | Agregar disclaimer a API-REFERENCE.md + update header | API-REFERENCE.md | 30 min |
| 2.2.3 | DISC-P1-005 | Fix 5 phantom schema refs en 11 flujos | 11 flujo files | 1h |

**Detalle DISC-P1-005 (phantom schema refs):**

| Schema Phantom | Reemplazo Correcto | Flujos Afectados |
|---------------|-------------------|-----------------|
| `analytics` | `data_warehouse` + `audit_logging` | FL-TCH-03, FL-TCH-04, FL-PRN-02, FL-PRN-06, FL-PRN-07 |
| `monitoring` | `audit_logging` (system_alerts, performance_metrics) | FL-ADM-04 |
| `platform_settings` | `system_configuration` | FL-ADM-02 |
| `audit` | `audit_logging` | FL-ADM-02 |
| `tenant_settings` | `system_configuration.tenant_configurations` | FL-SHR-03 |

### 2.3 Inventory Update (1-2 horas)

| # | ID | Tarea | Archivo(s) | Esfuerzo |
|---|-----|-------|-----------|----------|
| 2.3.1 | DISC-P1-004 | Re-verificar y actualizar FRONTEND_INVENTORY.yml | FRONTEND_INVENTORY.yml + MASTER_INVENTORY.yml | 1h |

**Metricas a actualizar:**
- `components_tsx`: 480 -> verificar (esperado ~502)
- `api_service_files`: 52 -> verificar (esperado ~47)
- `routes`: 72 -> verificar (esperado ~75)
- `hooks`: 102 -> verificar (esperado 102-110 segun metodologia)
- Actualizar MASTER_INVENTORY correspondiente
- Actualizar CLAUDE.md metricas si cambian

---

## Fase 3: P2 Medium — Sprint 2 (~8-12 horas)

### 3.1 Frontend API Alignment (2-3 horas)

| # | ID | Tarea | Esfuerzo |
|---|-----|-------|----------|
| 3.1.1 | DISC-P2-001 | Admin alerts: alinear dismiss/suppress | 30 min |
| 3.1.2 | DISC-P2-002 | NotificationService: /notifications/send -> /notifications | 15 min |
| 3.1.3 | DISC-P2-011 | Gamification config API: fix 4 phantom endpoints | 30 min |

**Dependencia:** DISC-P1-001 (fase 2.1) debe completarse primero para evitar doble trabajo en api.config.ts.

### 3.2 Schema-Reference Documentation (3-4 horas)

| # | ID | Tarea | Esfuerzo |
|---|-----|-------|----------|
| 3.2.1 | DISC-P2-003 | Agregar disclaimer "CONCEPTUAL" a 12 schema-ref docs con phantoms | 1h |
| 3.2.2 | DISC-P2-005 | Reescribir auth.users seccion en 01-auth.md (Supabase structure) | 1h |
| 3.2.3 | DISC-P2-004 | Documentar 20 tablas criticas faltantes (auth_management, educational top tables) | 2h |

**Prioridad de documentacion de tablas (top 20):**
1. auth_management.roles, user_roles, security_events, memberships
2. educational_content.assessment_rubrics, assignment_exercises, assignment_students, assignment_submissions
3. gamification_system.comodines_inventory, comodin_usage_logs, shop_items, user_purchases
4. progress_tracking.exercise_submissions, manual_reviews, learning_sessions, exercise_attempts
5. social_features.friendships, friend_requests, guilds, guild_members

### 3.3 Flujo Documentation (2-3 horas)

| # | ID | Tarea | Esfuerzo |
|---|-----|-------|----------|
| 3.3.1 | DISC-P2-006 | Crear 4 flujos para paginas criticas | 2h |
| 3.3.2 | DISC-P2-007 | Fix 4 table name mismatches en flujos | 15 min |
| 3.3.3 | DISC-P2-008 | Fix 3 endpoint path mismatches en flujos | 15 min |

**Flujos prioritarios a crear (DISC-P2-006):**
1. **FL-TCH-DASH**: Teacher Dashboard (landing page, metricas, accesos rapidos)
2. **FL-ADM-DASH**: Admin Dashboard (overview sistema, alertas, metricas)
3. **FL-STU-PROGRESS**: Student Progress (modulos, ejercicios, historial)
4. **FL-STU-ASSIGN**: Student Assignments (ver asignaciones, entregar, feedback)

### 3.4 Inventory Clarification (1 hora)

| # | ID | Tarea | Esfuerzo |
|---|-----|-------|----------|
| 3.4.1 | DISC-P2-009 | Agregar nota de metodologia para functions en DATABASE_INVENTORY | 15 min |
| 3.4.2 | DISC-P2-010 | Actualizar API-REFERENCE.md header 899->901, 22->23 | 10 min |

---

## Fase 4: P3 Low — Backlog (~2-3 horas)

| # | ID | Tarea | Esfuerzo |
|---|-----|-------|----------|
| 4.1 | DISC-P3-001 | Refactorizar 3 guild entities a usar DB_TABLES constants | 20 min |
| 4.2 | DISC-P3-002 | Agregar ml_model_weights, ml_prediction_logs a DB_TABLES | 10 min |
| 4.3 | DISC-P3-003 | Corregir gamification_system table count 21->20 en DATABASE_INVENTORY | 5 min |
| 4.4 | DISC-P3-004 | Actualizar health module endpoints 1->4 en BACKEND_INVENTORY | 5 min |
| 4.5 | DISC-P3-005 | Fix 18-admin-dashboard.md phantom table | 10 min |
| 4.6 | DISC-P3-006 | Reemplazar refs genericas en FL-PRN-01/02/03 con paths reales | 15 min |
| 4.7 | DISC-P3-007 | Re-verificar endpoint total 901 vs 902 | 15 min |

---

## Diagrama de Dependencias

```
Fase 1 (P0): _INDEX.md fixes
  |
  v
Fase 2 (P1): [paralelo]
  2.1 FE API paths ─────────> Fase 3.1 (P2 FE alignment)
  2.2 Doc fixes (independiente)
  2.3 Inventory update ──────> Fase 3.4 (P2 inventory)
  |
  v
Fase 3 (P2): [paralelo]
  3.1 FE API alignment (depende de 2.1)
  3.2 Schema-ref docs (independiente)
  3.3 Flujo docs (independiente)
  3.4 Inventory clarification (depende de 2.3)
  |
  v
Fase 4 (P3): All independent, can be done anytime
```

---

## Criterios de Verificacion Post-Correccion

### Fase 1 (P0)
- [ ] `_INDEX.md` summary: "227 RLS policies", "42 ENUMs"
- [ ] `_INDEX.md` footer: "227 RLS policies | 42 ENUMs"

### Fase 2 (P1)
- [ ] `api.config.ts` sin phantom endpoints para economy/*, student/*, mechanics/*, ai/*
- [ ] Auth paths alineados: /auth/profile (no /me), /reset-password/request (no request-password-reset)
- [ ] `99-utilities.md` lista 42 ENUMs, titulo correcto, footer correcto
- [ ] `API-REFERENCE.md` tiene disclaimer + header actualizado
- [ ] 11 flujos con phantom schemas corregidos
- [ ] `FRONTEND_INVENTORY.yml` + `MASTER_INVENTORY.yml` actualizados con counts reales

### Fase 3 (P2)
- [ ] Admin alerts: FE y BE usan mismo nombre (dismiss o suppress)
- [ ] NotificationService usa `POST /notifications`
- [ ] Gamification config API alineado con controller
- [ ] 12 schema-ref docs tienen disclaimer "CONCEPTUAL"
- [ ] 01-auth.md seccion auth.users describe estructura Supabase
- [ ] 20 tablas criticas documentadas
- [ ] 4 nuevos flujos creados (dashboards + progress + assignments)
- [ ] Table/endpoint names corregidos en flujos

### Fase 4 (P3)
- [ ] Guild entities usan DB_TABLES constants
- [ ] ml_model_weights, ml_prediction_logs en DB_TABLES
- [ ] Inventory counts alineados (gamification 20, health 4, total 901-902)

---

## Resumen de Esfuerzo

| Fase | Severidad | Items | Esfuerzo | Timeline |
|------|-----------|-------|----------|----------|
| 1 | P0 Critical | 2 | 30 min | Inmediato |
| 2 | P1 High | 7 | 6-8 h | Esta semana |
| 3 | P2 Medium | 13 | 8-12 h | Sprint 2 |
| 4 | P3 Low | 8 | 2-3 h | Backlog |
| **Total** | | **30** | **~18-24 h** | |

---

*Plan generado: 2026-02-17 | Basado en 02-DISCREPANCIAS.md v1.0.0*
*Siguiente paso recomendado: Ejecutar Fase 1 (P0) inmediatamente, planificar Fase 2 (P1) para esta semana*
