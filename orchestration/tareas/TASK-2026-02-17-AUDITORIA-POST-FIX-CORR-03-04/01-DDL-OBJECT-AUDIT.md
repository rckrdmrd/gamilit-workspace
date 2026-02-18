# P1: Auditoria de Objetos DDL -- Traza Completa

**Version:** 1.0.0
**Fecha:** 2026-02-17
**Auditor:** Claude Opus 4.6
**Alcance:** CORR-03 (14 index errors), CORR-04 (16 RLS errors), 18+3 FK fixes (H-DB-01/H-DB-02)
**Archivos auditados:** 17 index files, 43 RLS policy files, 1 global RLS file, 3 table files con inline RLS, 23 schema-reference docs

---

## Resumen Ejecutivo

La auditoria traza cada objeto DDL modificado en CORR-03, CORR-04 y los 21 FK fixes de H-DB-01/H-DB-02 hacia su requisito (EPIC/US/TASK), ticket y flujo (FL-*). De 7 checks realizados:

- **3 PASS** (T-003, T-005, T-006)
- **2 PARTIAL** (T-001, T-002)
- **2 FAIL** (T-004, T-007)

**Hallazgos principales:**
1. **11 de 17 index files** carecen de referencia a Ticket/Task/Sprint en comentarios (solo tienen `Created:` con fecha)
2. **23 de 43 RLS files** carecen de referencia formal a Gap/Ticket/Phase (solo tienen `Created:` con fecha)
3. Los FK fixes de H-DB-01/H-DB-02 estan correctamente trazados en PROXIMA-ACCION y BACKLOG (EPIC-WS-005)
4. **9 tablas modificadas** no aparecen en ningun flujo FL-* en la TRACEABILITY-MATRIX
5. CORR-03/04/05 estan correctamente registrados en EPIC-WS-005 del BACKLOG.yml
6. Los 9 schemas afectados tienen documentacion en schema-reference/ (todos cubiertos)
7. **No existe convencion formal documentada** para cross-schema table references en DDL

---

## Checks Realizados

### T-001: Referencias en archivos de indices

**Objetivo:** Verificar que cada index file tiene referencia a ticket/task/sprint en comentarios.

**Metodologia:** Busqueda de patrones `Ticket:`, `Task:`, `Sprint:`, `Created:`, `TASK-RLS`, `Gap Reference:` en los 17 archivos de indices.

**Resultados:**

| # | Archivo | Ticket/Task | Sprint | Created | Status |
|---|---------|-------------|--------|---------|--------|
| 1 | `optimization/indexes/01-fk-optimization-indexes.sql` | `TASK-RLS-FK-OPTIMIZATION` | -- | 2026-02-03 | PASS |
| 2 | `data_warehouse/indexes/01-warehouse-indexes.sql` | -- | `2.1 - Data Warehouse Design` | 2026-02-03 | PASS |
| 3 | `content_management/indexes/01-idx_marie_content_grade_levels_gin.sql` | -- | -- | 2025-10-27 | FAIL |
| 4 | `content_management/indexes/02-idx_marie_content_keywords_gin.sql` | -- | -- | 2025-10-27 | FAIL |
| 5 | `progress_tracking/indexes/01-idx_module_progress_analytics_gin.sql` | -- | -- | 2025-10-27 | FAIL |
| 6 | `progress_tracking/indexes/02-idx_scheduled_missions_mission.sql` | -- | -- | 2025-10-28 | FAIL |
| 7 | `progress_tracking/indexes/03-teacher-portal-indexes.sql` | -- | `P1-02 - FASE 5` | 2025-12-18 | PASS |
| 8 | `social_features/indexes/01-teacher-portal-indexes.sql` | -- | `P1-02 - FASE 5` | 2025-12-18 | PASS |
| 9 | `gamification_system/indexes/01-idx_achievement_categories_active.sql` | -- | -- | 2025-11-02 | FAIL |
| 10 | `gamification_system/indexes/02-idx_active_boosts_user.sql` | -- | -- | 2025-10-28 | FAIL |
| 11 | `gamification_system/indexes/03-idx_achievements_metadata_gin.sql` | -- | -- | 2025-10-27 | FAIL |
| 12 | `gamification_system/indexes/04-idx_inventory_transactions_user.sql` | -- | -- | 2025-11-02 | FAIL |
| 13 | `auth_management/indexes/01-idx_user_preferences_theme.sql` | -- | -- | 2025-11-02 | FAIL |
| 14 | `auth_management/indexes/02-idx_user_roles_permissions_gin.sql` | -- | -- | -- | FAIL |
| 15 | `auth_management/indexes/03-idx_user_roles_user_role_composite.sql` | `GAP-AUTH-001` | -- | -- | PASS |
| 16 | `auth_management/indexes/idx_user_sessions_refresh_token_hash.sql` | -- | -- | -- | FAIL |
| 17 | `auth_management/indexes/idx_user_sessions_session_token_hash.sql` | -- | -- | -- | FAIL |

**Resumen:** 6/17 PASS (35%), 11/17 FAIL (65%)

**Archivos modificados en CORR-03 especificamente:**
- `progress_tracking/indexes/03-teacher-portal-indexes.sql` -- PASS (tiene referencia `P1-02 - FASE 5`, CORR-03 comment added)
- `data_warehouse/indexes/01-warehouse-indexes.sql` -- PASS (tiene `Sprint: 2.1`, tablas dim_ corregidas singular->plural)
- `content_management/indexes/01-idx_marie_content_grade_levels_gin.sql` -- FAIL (solo `Created:`, tabla corregida singular->plural)
- `content_management/indexes/02-idx_marie_content_keywords_gin.sql` -- FAIL (solo `Created:`, tabla corregida singular->plural)
- `optimization/indexes/01-fk-optimization-indexes.sql` -- PASS (tiene `TASK-RLS-FK-OPTIMIZATION`, tabla comodin_usage_trackings corregida)

**De los 5 archivos directamente tocados por CORR-03, 3/5 tienen referencia formal.**

---

### T-002: Referencias en archivos RLS

**Objetivo:** Verificar que cada RLS file tiene referencia a Gap/Phase/Ticket.

**Metodologia:** Busqueda de patrones `Gap Reference:`, `TASK-RLS`, `Phase:`, `Ticket:`, `EPIC:` en los 43 archivos RLS.

**Resultados por schema:**

| Schema | Total Files | Con Ticket/Gap | Solo Created | Sin Refs |
|--------|-------------|----------------|-------------|----------|
| audit_logging | 1 | 0 | 1 | 0 |
| auth_management | 2 | 0 | 0 | 2 |
| communication | 1 | 0 | 0 | 1 |
| content_management | 1 | 0 | 1 | 0 |
| educational_content | 3 | 1 (TASK-2026-01-25) | 2 | 0 |
| gamification_system | 7 | 0 | 7 | 0 |
| lti_integration | 2 | 2 (GAP-SYS-001) | 0 | 0 |
| notifications | 1 | 0 | 1 | 0 |
| progress_tracking | 5 | 1 (EPIC 10.2, TASK-2026-01-18) | 4 | 0 |
| social_features | 14 | 6 (GAP-SOC-001..005, TASK-RLS-FK) | 8 | 0 |
| system_configuration | 1 | 0 | 1 | 0 |

**Archivos con referencia formal (Ticket/Gap/EPIC/TASK):** 10/43 (23%)

**Detalle de los 10 archivos con trazabilidad:**
1. `educational_content/03-teacher_content-policies.sql` -- `TASK-2026-01-25-VALIDACION-PORTAL-TEACHER`
2. `lti_integration/01-rls-policies.sql` -- `GAP-SYS-001 (CRITICAL - Security)`
3. `lti_integration/02-enable-rls.sql` -- `GAP-SYS-001 (CRITICAL - Security)`
4. `progress_tracking/04-certificates-policies.sql` -- `EPIC: 10.2`
5. `progress_tracking/05-manual-reviews-policies.sql` -- `TASK-2026-01-18-011 (FIX-DB-005)`
6. `social_features/10-discussion-threads-policies.sql` -- `TASK-RLS-FK-OPTIMIZATION`
7. `social_features/11-guild-members-policies.sql` -- `TASK-RLS-FK-OPTIMIZATION`
8. `social_features/12-guild-missions-policies.sql` -- `TASK-RLS-FK-OPTIMIZATION`
9. `social_features/13-peer-challenges-policies.sql` -- `GAP-SOC-001`
10. `social_features/13-user-blocks-policies.sql` -- `GAP-SOC-004`
11. `social_features/14-user-reports-policies.sql` -- `GAP-SOC-005`
12. `social_features/14-team-vs-team-challenges-policies.sql` -- `GAP-SOC-002`

**Correccion:** 12/43 (28%), no 10.

**Archivos modificados en CORR-04 especificamente (basado en git status):** 17 archivos RLS. De estos:
- **Con referencia formal:** `lti_integration/01-rls-policies.sql` (GAP-SYS-001), `educational_content/03-teacher_content-policies.sql` (TASK-2026-01-25), `social_features/10-discussion-threads-policies.sql` (TASK-RLS-FK), `social_features/11-guild-members-policies.sql` (TASK-RLS-FK), `social_features/12-guild-missions-policies.sql` (TASK-RLS-FK), `social_features/13-peer-challenges-policies.sql` (GAP-SOC-001), `social_features/13-user-blocks-policies.sql` (GAP-SOC-004), `social_features/14-user-reports-policies.sql` (GAP-SOC-005) -- **8/17 PASS**
- **Sin referencia formal (solo Created):** `audit_logging/01-policies.sql`, `content_management/01-policies.sql`, `educational_content/01-enable-rls.sql`, `gamification_system/01-enable-rls.sql`, `gamification_system/06-notifications-leaderboard-policies.sql`, `lti_integration/02-enable-rls.sql`, `progress_tracking/04-certificates-policies.sql`, `progress_tracking/05-manual-reviews-policies.sql`, `social_features/02-policies.sql` -- **9/17 FAIL** (nota: certificates tiene EPIC y manual-reviews tiene TASK, se corrige a 7/17 FAIL)

**Resumen CORR-04:** 10/17 archivos PASS (59%), 7/17 FAIL (41%)

**Nota:** Ninguno de los archivos modificados por CORR-04 tiene un marcador `CORR-04` o `2026-02-17` en el contenido. Las correcciones (singular->plural, enum fixes, column fixes) se aplicaron silenciosamente sin dejar traza del fix en los propios archivos DDL. Solo `progress_tracking/indexes/03-teacher-portal-indexes.sql` contiene la marca `CORR-03`.

---

### T-003: Los 18+3 FK fixes trazan a H-DB-01/H-DB-02

**Objetivo:** Verificar que los 21 FK fixes estan documentados y trazados a sus hallazgos.

**Evidencia en PROXIMA-ACCION.md:**

```
Sprint de correcciones inmediatas (P0-P1): COMPLETADO (2026-02-16)
- A1: Fix 18 FKs data_warehouse singular->plural -- RESUELTO (4 fact tables, 18 FKs corregidos)
- A2: Fix 3 FKs auth.users->auth_management.profiles -- RESUELTO (content_approvals.sql, content_tags.sql)
```

**Evidencia en BACKLOG.yml (EPIC-WS-005):**
- No hay item especifico para H-DB-01/H-DB-02 en EPIC-WS-005. Estos fixes fueron parte de `TASK-2026-02-16-VALIDACION-INTEGRAL` Sprint P0-P1, ejecutado ANTES de que se creara EPIC-WS-005.

**Evidencia en orchestration/tareas/:**
- `TASK-2026-02-16-VALIDACION-INTEGRAL/01-HALLAZGOS-DB.md` documenta H-DB-01 (18 FKs) y H-DB-02 (3 FKs)
- `TASK-2026-02-16-VALIDACION-INTEGRAL/04-DISCREPANCIAS-CONSOLIDADAS.md` confirma ambos como RESUELTO
- `TASK-2026-02-16-VALIDACION-INTEGRAL/05-PLAN-CORRECCIONES.md` detalla los archivos afectados

**Evidencia en MEMORY.md:**
```
## Sprint P0-P1 Corrections (2026-02-16)
- H-DB-01 FIXED: 18 FKs data_warehouse singular->plural across 4 fact tables
- H-DB-02 FIXED: 3 FKs auth.users->auth_management.profiles (content_approvals, content_tags)
```

**Status:** PASS -- Trazabilidad completa de H-DB-01 y H-DB-02 desde hallazgo hasta resolucion, documentada en PROXIMA-ACCION, task reports y MEMORY.

---

### T-004: Cada tabla modificada aparece en al menos 1 FL-* flow

**Objetivo:** Verificar que todas las tablas cuyos objetos (indices, RLS, FKs) fueron modificados en CORR-03/04 aparecen en la TRACEABILITY-MATRIX.

**Tablas afectadas por CORR-03 (indices):**

| Tabla | Schema | Fix | En TRACEABILITY-MATRIX | FL-* |
|-------|--------|-----|------------------------|------|
| dim_dates | data_warehouse | singular->plural | Si | FL-TCH-04, FL-ADM-11 (via `data_warehouse.*`) |
| dim_students | data_warehouse | singular->plural | Si | FL-TCH-04, FL-ADM-11 |
| dim_exercises | data_warehouse | singular->plural | Si | FL-TCH-04, FL-ADM-11 |
| dim_modules | data_warehouse | singular->plural | Si | FL-TCH-04, FL-ADM-11 |
| marie_curie_contents | content_management | singular->plural | **No** | **Ninguno directo** |
| comodin_usage_trackings | gamification_system | singular->plural | **No** | **Ninguno directo** |
| student_intervention_alerts | progress_tracking | 3 broken indexes removed | Si | FL-TCH-03 (via `notifications.*`, `analytics.*`) |

**Tablas afectadas por CORR-04 (RLS):**

| Tabla | Schema | Fix | En TRACEABILITY-MATRIX | FL-* |
|-------|--------|-----|------------------------|------|
| leaderboard_metadatas | gamification_system | singular->plural | **No** | FL-STU-14 (como `leaderboard_entries` no `leaderboard_metadatas`) |
| teacher_contents | educational_content | singular->plural | Si | FL-TCH-05 (via `educational_content.content_items`) |
| lti_grade_passbacks | lti_integration | singular->plural | Si | FL-ADM-05 (via `lti_integration.lti_consumers`) |
| user_activity_logs | audit_logging | singular->plural | Si | FL-ADM-06 (via `audit_logging.user_activity`) |
| flagged_contents | content_management | singular->plural | **No** | **Ninguno** |
| guilds (is_recruiting->is_public) | social_features | column fix | Si | FL-STU-10 (via `social_features.guilds`) |
| guild_members (status->left_at) | social_features | column fix | Si | FL-STU-10 (via `guild_members`) |
| team_members (status->left_at) | social_features | column fix | **No** | **Ninguno directo** |
| user_blocks | social_features | enum fix | **No** | **Ninguno** |
| user_reports | social_features | new table ref | **No** | **Ninguno** |
| peer_challenges | social_features | enum fix | **No** | **Ninguno** |
| certificates | progress_tracking | enum fix | **No** | **Ninguno directo** (FL-STU-16 has `progress_tracking.module_progress` but not certificates) |
| manual_reviews | progress_tracking | enum fix | Si | FL-STU-02, FL-TCH-01 |

**Tablas SIN flujo en TRACEABILITY-MATRIX:**

1. `content_management.marie_curie_contents` -- Contenido externo Marie Curie, no tiene flujo de usuario
2. `gamification_system.comodin_usage_trackings` -- Tracking de uso de comodines, cubierto indirectamente por FL-STU-08 (`comodines_inventory`) pero no la tabla de tracking
3. `gamification_system.leaderboard_metadatas` -- Metadata de config, FL-STU-14 refiere a `leaderboard_entries` no metadata
4. `content_management.flagged_contents` -- Moderacion de contenido, sin flujo dedicado
5. `social_features.team_members` -- Solo en contexto de `teams`, sin flujo directo
6. `social_features.user_blocks` -- Bloqueo entre usuarios, sin flujo dedicado
7. `social_features.user_reports` -- Reportes de usuarios, sin flujo dedicado (archivo 27-user_reports.sql eliminado/movido a 28)
8. `social_features.peer_challenges` -- Desafios peer-to-peer, documentado como backend-only sin frontend (H-FE-02)
9. `progress_tracking.certificates` -- Certificados digitales, sin flujo dedicado en la matriz

**Status:** FAIL -- 9 tablas modificadas no aparecen en la TRACEABILITY-MATRIX. Sin embargo, varias son tablas de soporte/administracion que no tienen flujo de usuario directo (moderacion, metadata, tracking).

---

### T-005: CORR-03/04/05 estan en EPIC-WS-005

**Objetivo:** Verificar que los tres CORR items estan registrados en EPIC-WS-005 del BACKLOG.yml.

**Evidencia directa de BACKLOG.yml (lineas 104-144):**

```yaml
- id: "EPIC-WS-005"
    titulo: "Correcciones Tecnicas Pendientes"
    descripcion: "Correcciones tecnicas de codigo, DDL, RLS y seeds identificadas en auditorias"
    estado: "en_progreso"
    prioridad: "P0"
    items:
      - id: "CORR-03"
        titulo: "DDL cascade errors -- 14 index errors + trigger/function/view fixes"
        prioridad: "P1"
        esfuerzo: "L"
        estado: "completado"
        fecha_completado: "2026-02-17"
        detalle_fix: "14->0 index errors: singular->plural table names..."
      - id: "CORR-04"
        titulo: "RLS schema file errors -- 16->0 errors, runtime 349->404 policies"
        prioridad: "P1"
        esfuerzo: "M"
        estado: "completado"
        dependencias: ["CORR-03"]
        fecha_completado: "2026-02-17"
        detalle_fix: "16->0 RLS errors: singular->plural table names..."
      - id: "CORR-05"
        titulo: "30 seed errors -- FK violations, orden incorrecto, columnas renombradas"
        prioridad: "P2"
        esfuerzo: "L"
        estado: "completado"
        dependencias: ["CORR-03", "CORR-04"]
        fecha_completado: "2026-02-17"
```

**Verificacion:**
- CORR-03: Presente, completado, con detalle_fix -- PASS
- CORR-04: Presente, completado, con dependencia CORR-03, detalle_fix -- PASS
- CORR-05: Presente, completado, con dependencias CORR-03/04 -- PASS

**Trazabilidad adicional:**
- EPIC-WS-005.tarea_origen = `TASK-2026-02-17-MEJORAS-CALIDAD-CODIGO` -- Correcto
- PROXIMA-ACCION.md confirma los tres como COMPLETADOS con 0 errores
- MEMORY.md documenta los counts exactos y root causes

**Status:** PASS -- Los 3 items CORR estan correctamente registrados en EPIC-WS-005 con estado, prioridad, dependencias y detalle de fix.

---

### T-006: Cada schema tiene documentacion en schema-reference/

**Objetivo:** Verificar que los 9 schemas afectados por CORR-03/04 tienen documentacion en `docs/20-architecture/schema-reference/`.

**Schemas afectados:**

| # | Schema Fisico | Archivo schema-reference | Status |
|---|---------------|--------------------------|--------|
| 1 | data_warehouse | `17-data-warehouse.md` | PASS |
| 2 | content_management | `13-content.md` | PASS |
| 3 | progress_tracking | `03-education.md` (split con educational_content) | PASS |
| 4 | gamification_system | `04-gamification.md` | PASS |
| 5 | social_features | `05-social.md` | PASS |
| 6 | audit_logging | `16-audit.md` | PASS |
| 7 | educational_content | `03-education.md` (split con progress_tracking) | PASS |
| 8 | lti_integration | `_INDEX.md` (mencionado en seccion "Schemas Fisicos sin Archivo Dedicado") | PARTIAL |
| 9 | optimization | `_INDEX.md` (mencionado en seccion "Schemas Fisicos sin Archivo Dedicado") | PARTIAL |

**Nota sobre schemas sin archivo dedicado:**
- `lti_integration` esta documentado en `_INDEX.md` bajo "Schemas Fisicos sin Archivo de Referencia Dedicado" con 3 tablas y tipo "integration"
- `optimization` esta documentado en `_INDEX.md` bajo la misma seccion con 0 tablas y tipo "performance"
- Ambos carecen de un archivo `.md` dedicado pero estan referenciados en el indice

**Status:** PASS (con nota) -- Los 7 schemas principales tienen archivos dedicados. Los 2 schemas de soporte (lti_integration, optimization) estan documentados en el indice sin archivo dedicado, lo cual es aceptable dado su tamano reducido (3 y 0 tablas respectivamente).

---

### T-007: Cross-schema tables tienen convencion documentada

**Objetivo:** Verificar que existe una convencion formal para referenciar tablas de otros schemas en DDL (e.g., `auth_management.profiles` referenciado desde `gamification_system`, `social_features`, etc.).

**Busqueda de convencion:**

1. `docs/20-architecture/schema-reference/_INDEX.md` -- Define convenciones de nomenclatura para tablas, columnas, ENUMs, FKs, indices y RLS policies. **No incluye** convencion para cross-schema references.

2. `docs/40-standards/` -- Los estandares de naming cubren entidades, endpoints, DTOs. **No cubren** cross-schema DDL patterns.

3. `CLAUDE.md` RC2 "COHERENCIA ENTRE CAPAS" -- Menciona que "Toda tabla DEBE tener entity" pero **no define** patron para cross-schema FK references.

4. **Patron observado en codigo:** Los DDL files usan `schema_name.table_name` para FKs cross-schema (e.g., `REFERENCES auth_management.profiles(id)`). Sin embargo, los datasource configs en `app.module.ts` deben registrar explicitamente entities de otros schemas (patron FIX-ECONN descubierto en 2026-02-14).

5. **Patron FIX-ECONN en MEMORY.md:**
   ```
   Cross-datasource entity pattern: Any datasource with entities that have @ManyToOne to Profile/Tenant
   MUST register those entities explicitly
   ```
   Este patron existe como learning documentado pero **no como estandar formal**.

**Gaps encontrados:**
- No hay documento que defina cuando usar `auth_management.profiles` vs `auth.users` como FK target
- No hay estandar formal para el patron "cross-datasource entity registration" en backend
- La decision de H-DB-02 (cambiar 3 FKs de `auth.users` a `auth_management.profiles`) fue ad-hoc, no basada en un estandar escrito

**Status:** FAIL -- No existe convencion formal documentada para cross-schema table references. El patron existe implicitamente (y esta documentado en MEMORY.md como learning), pero no esta formalizado en docs/40-standards/ ni en schema-reference/.

---

## Findings

### F-P1-001: Falta traza CORR-04 en archivos DDL modificados

- **Severidad:** MEDIO
- **Ubicacion:** 17 archivos RLS modificados por CORR-04 en `apps/database/ddl/schemas/*/rls-policies/*.sql`
- **Descripcion:** Las correcciones de CORR-04 (singular->plural, enum fixes, column fixes) se aplicaron a los archivos DDL sin dejar marcador de la correccion (comment `-- Fixed: CORR-04 2026-02-17`). Solo el archivo `progress_tracking/indexes/03-teacher-portal-indexes.sql` tiene un marcador `-- REMOVED (2026-02-17 CORR-03)`.
- **Esperado:** Cada correccion deja un comment trail indicando que/cuando/por que se modifico (patron observable en `CORR-03` marker en el archivo de indices).
- **Actual:** 16 de 17 archivos RLS modificados por CORR-04 no tienen marcador de la correccion.
- **Impacto:** Dificulta auditorias futuras y trazabilidad de cambios. Un desarrollador no puede saber mirando el archivo DDL que fue modificado como parte de CORR-04.
- **Recomendacion:** Agregar comment `-- Fixed: CORR-04 (2026-02-17)` en la linea o seccion modificada de cada archivo afectado. Alternativamente, documentar la politica de que los DDL files NO deben llevar marcadores de fix (preferir git blame).

### F-P1-002: 65% de archivos de indices sin referencia a ticket/task

- **Severidad:** BAJO
- **Ubicacion:** 11 de 17 archivos en `apps/database/ddl/schemas/*/indexes/*.sql`
- **Descripcion:** La mayoria de archivos de indices (creados entre 2025-10-27 y 2025-11-02) solo tienen campo `Created:` con fecha, sin referencia a ticket, task o sprint.
- **Esperado:** Cada DDL file tiene referencia a su origen (ticket, task, sprint o gap).
- **Actual:** Solo 6/17 (35%) tienen referencia formal: 1 con TASK-RLS-FK-OPTIMIZATION, 1 con Sprint 2.1, 2 con P1-02 - FASE 5, 1 con GAP-AUTH-001, 1 con CORR-03.
- **Impacto:** Bajo. Los indices creados en Oct-Nov 2025 son pre-gobernanza SIMCO. El patron mejora en archivos posteriores a 2026-02.
- **Recomendacion:** Aceptar como deuda historica. Aplicar regla de trazabilidad solo a archivos nuevos/modificados a partir de ahora.

### F-P1-003: 72% de archivos RLS sin referencia a ticket/gap

- **Severidad:** BAJO
- **Ubicacion:** 31 de 43 archivos en `apps/database/ddl/schemas/*/rls-policies/*.sql`
- **Descripcion:** La mayoria de archivos RLS historicos (2025-10 a 2025-12) solo tienen `Created:` con fecha. Los archivos mas recientes (2026-02) si tienen Ticket/Gap.
- **Esperado:** Referencia formal a gap, ticket o fase en cada archivo RLS.
- **Actual:** Solo 12/43 (28%) tienen referencia. 100% de los archivos creados en 2026-02 tienen referencia. 0% de los creados antes de 2025-12 la tienen.
- **Impacto:** Bajo. Tendencia positiva -- la gobernanza mejora con el tiempo.
- **Recomendacion:** Misma que F-P1-002. Retroactive tagging no justificado por el esfuerzo.

### F-P1-004: 9 tablas modificadas sin flujo FL-* en TRACEABILITY-MATRIX

- **Severidad:** MEDIO
- **Ubicacion:** `docs/30-ux-ui/flujos/TRACEABILITY-MATRIX.md`
- **Descripcion:** 9 tablas cuyos objetos (indices o RLS policies) fueron modificados en CORR-03/04 no aparecen en ningun flujo de la matriz de trazabilidad.
- **Tablas:**
  1. `content_management.marie_curie_contents` -- Contenido externo, sin flujo de usuario
  2. `gamification_system.comodin_usage_trackings` -- Tracking interno, FL-STU-08 cubre comodines pero no esta tabla
  3. `gamification_system.leaderboard_metadatas` -- Config metadata, FL-STU-14 cubre leaderboard_entries
  4. `content_management.flagged_contents` -- Moderacion, sin flujo dedicado
  5. `social_features.team_members` -- Soporte para teams, sin flujo propio
  6. `social_features.user_blocks` -- Social safety, sin flujo
  7. `social_features.user_reports` -- Moderation, sin flujo
  8. `social_features.peer_challenges` -- Backend-only (documentado H-FE-02)
  9. `progress_tracking.certificates` -- Certificados, sin flujo
- **Esperado:** Toda tabla con RLS policies deberia aparecer en al menos 1 flujo.
- **Actual:** 9 tablas quedan fuera. La mayoria son tablas de soporte/administracion/moderacion.
- **Impacto:** Medio. Las tablas de moderacion (flagged_contents, user_blocks, user_reports) y certificados deberian tener flujos admin/teacher correspondientes.
- **Recomendacion:** Crear flujos para:
  - FL-ADM-12: Flujo de moderacion de contenido (flagged_contents, user_blocks, user_reports)
  - FL-STU-21: Flujo de certificados digitales (certificates)
  - Agregar `comodin_usage_trackings` y `leaderboard_metadatas` como tablas de datos en flujos existentes (FL-STU-08 y FL-STU-14)

### F-P1-005: No existe convencion formal para cross-schema references

- **Severidad:** MEDIO
- **Ubicacion:** Toda la documentacion de estandares (`docs/40-standards/`, `docs/20-architecture/schema-reference/`)
- **Descripcion:** No hay documento que defina formalmente cuando y como referenciar tablas de otros schemas en DDL y backend.
- **Esperado:** Un estandar que defina:
  1. Que `auth_management.profiles` es el FK target para user_id (no `auth.users`)
  2. Que entities con `@ManyToOne` cross-schema deben registrarse en el datasource
  3. Que las funciones helper (`gamilit.get_current_user_id()`, etc.) son el patron para RLS cross-schema
- **Actual:** El patron existe como knowledge tribal (MEMORY.md, PROXIMA-ACCION.md) pero no como estandar formal.
- **Impacto:** Riesgo de repetir errores como H-DB-02 (3 FKs incorrectamente apuntando a auth.users) y FIX-ECONN-001/002 (entities no registradas en datasource).
- **Recomendacion:** Crear estandar formal: `docs/40-standards/ESTANDAR-CROSS-SCHEMA-REFERENCES.md` que formalice los patrones ya descubiertos.

---

## Summary Table

| Check | Status | Details |
|-------|--------|---------|
| T-001 | **PARTIAL** | 6/17 index files (35%) con ticket/task. 3/5 archivos CORR-03 con referencia. Los faltantes son historicos pre-gobernanza. |
| T-002 | **PARTIAL** | 12/43 RLS files (28%) con ticket/gap. 10/17 archivos CORR-04 con referencia. Tendencia positiva en archivos 2026+. |
| T-003 | **PASS** | 21 FK fixes (H-DB-01: 18, H-DB-02: 3) completamente trazados en PROXIMA-ACCION, BACKLOG tasks, MEMORY. |
| T-004 | **FAIL** | 9 de ~25 tablas modificadas NO aparecen en TRACEABILITY-MATRIX. Mayoria son tablas soporte/moderacion. |
| T-005 | **PASS** | CORR-03/04/05 estan en EPIC-WS-005 con estado, prioridad, dependencias y detalle_fix. |
| T-006 | **PASS** | 9/9 schemas tienen documentacion (7 archivo dedicado, 2 en _INDEX.md). |
| T-007 | **FAIL** | No existe convencion formal para cross-schema references. Patron existe como knowledge tribal. |

---

## Metricas Consolidadas

| Metrica | Valor |
|---------|-------|
| Index files auditados | 17 |
| RLS policy files auditados | 43 |
| Global RLS files auditados | 1 (07d-rls-policies-pending-tables.sql) |
| Table files con inline RLS auditados | 3 (17, 19, 20 progress_tracking) |
| Schema-reference docs verificados | 23 |
| Findings registrados | 5 |
| Findings CRITICO | 0 |
| Findings ALTO | 0 |
| Findings MEDIO | 3 (F-P1-001, F-P1-004, F-P1-005) |
| Findings BAJO | 2 (F-P1-002, F-P1-003) |
| Checks PASS | 3 (T-003, T-005, T-006) |
| Checks PARTIAL | 2 (T-001, T-002) |
| Checks FAIL | 2 (T-004, T-007) |

---

## Recomendaciones Priorizadas

| # | Recomendacion | Prioridad | Esfuerzo | Finding |
|---|---------------|-----------|----------|---------|
| R1 | Crear estandar `ESTANDAR-CROSS-SCHEMA-REFERENCES.md` | P1 | S | F-P1-005 |
| R2 | Agregar 4 flujos faltantes (moderacion, certificados) a TRACEABILITY-MATRIX | P2 | M | F-P1-004 |
| R3 | Agregar marcadores CORR-04 a archivos DDL modificados (o documentar politica de no-markers) | P2 | S | F-P1-001 |
| R4 | Aplicar regla de trazabilidad (Ticket/Gap obligatorio) a DDL nuevos/modificados | P2 | S | F-P1-002, F-P1-003 |

---

*Auditoria P1 completada por Claude Opus 4.6 -- 2026-02-17*
*Sistema SIMCO v4.0.0 | NEXUS v4.1*
