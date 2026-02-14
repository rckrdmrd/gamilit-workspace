# Plan de Remediacion Integrado

**Version:** 1.0.0
**Fecha:** 2026-02-12

---

## Resumen

5 sprints de remediacion basados en hallazgos de la auditoria integral BD vs Documentacion.

---

## Sprint R1: Quick Wins - Correccion de Metricas (Sin dependencias) - COMPLETADO

**Esfuerzo:** Bajo | **Riesgo:** Bajo | **Prioridad:** P0 | **Estado:** COMPLETADO (2026-02-12)

### Tareas:

| ID | Descripcion | Archivo | Cambio |
|----|-------------|---------|--------|
| R1-01 | Corregir metricas en CLAUDE.md | CLAUDE.md | tablas=171, funciones=183, triggers=126, enums=42, FKs=298 |
| R1-02 | Corregir DATABASE_INVENTORY.yml | orchestration/inventarios/DATABASE_INVENTORY.yml | Mismas correcciones + schemas conceptuales a fisicos |
| R1-03 | Corregir MASTER_INVENTORY.yml | orchestration/inventarios/MASTER_INVENTORY.yml | tablas=171, funciones=183, triggers=126, enums=42, FKs=298 |
| R1-04 | Corregir MODELO-DATOS.md metricas | docs/20-architecture/MODELO-DATOS.md | views=22, funciones=183, triggers=126, enums=42, RLS=263, FKs=298 |
| R1-05 | Corregir PostgreSQL version en MODELO-DATOS | docs/20-architecture/MODELO-DATOS.md (ln 439) | "PostgreSQL 16" -> "PostgreSQL 15" |
| R1-06 | Corregir database.config.yml stats | apps/database/config/database.config.yml | views=22, functions=183, triggers=126, enums=42, rls=263, FKs=298 |

### Criterio de Aceptacion:
- Todas las metricas numericas son identicas en las 4 fuentes
- PostgreSQL version = 15 en TODAS las fuentes

---

## Sprint R2: Mapeo de Schemas y Documentacion (Depende de R1) - COMPLETADO

**Esfuerzo:** Medio | **Riesgo:** Bajo | **Prioridad:** P1 | **Estado:** COMPLETADO (2026-02-12)

### Tareas:

| ID | Descripcion | Archivo | Detalle |
|----|-------------|---------|---------|
| R2-01 | Agregar tabla mapeo a schema-reference/_INDEX.md | docs/20-architecture/schema-reference/_INDEX.md | Tabla: conceptual <-> fisico con conteos |
| R2-02 | Actualizar DATABASE_INVENTORY.yml schemas | orchestration/inventarios/DATABASE_INVENTORY.yml | Usar nombres fisicos (auth_management, no "auth") |
| R2-03 | Crear doc para data_warehouse | docs/20-architecture/schema-reference/ | 16 tablas star schema + 3 views |
| R2-04 | Crear doc para admin_dashboard | docs/20-architecture/schema-reference/ | 4 tablas + 7 views |
| R2-05 | Crear doc para communication | docs/20-architecture/schema-reference/ | 4 tablas (messages, participants) |
| R2-06 | Crear doc para gamilit (utility) | docs/20-architecture/schema-reference/ | 30 funciones + 1 view |
| R2-07 | Actualizar 16 schema-reference files existentes | docs/20-architecture/schema-reference/ | Tablas reales del DDL fisico, no conceptuales |
| R2-08 | Resolver archivos con numeracion duplicada en social_features | apps/database/ddl/schemas/social_features/tables/ | 11-*, 12-*, 27-* |
| R2-09 | Resolver duplicacion roles en auth_management | apps/database/ddl/schemas/auth_management/tables/ | 03b-roles vs 04-roles |

### Criterio de Aceptacion:
- Mapeo schema fisico <-> conceptual documentado explicitamente
- 100% de schemas fisicos activos tienen documentacion
- Sin archivos con numeracion duplicada

---

## Sprint R3: Coherencia Entity-DDL (Depende de R1) - COMPLETADO

**Esfuerzo:** Medio-Alto | **Riesgo:** Medio | **Prioridad:** P1 | **Estado:** COMPLETADO (2026-02-12)

### Tareas:

| ID | Descripcion | Archivo | Detalle |
|----|-------------|---------|---------|
| R3-01 | Agregar `deleted_at` a profile.entity.ts | apps/backend/src/modules/auth/entities/profile.entity.ts | @DeleteDateColumn + soft-delete support |
| R3-02 | Agregar `deleted_at` a tenant.entity.ts | apps/backend/src/modules/auth/entities/tenant.entity.ts | @DeleteDateColumn + soft-delete support |
| R3-03 | Agregar `tenant_id` a ml-coins-transaction.entity.ts | apps/backend/src/modules/gamification/entities/ml-coins-transaction.entity.ts | @Column + ManyToOne relation |
| R3-04 | Agregar `updated_at` a notification.entity.ts | apps/backend/src/modules/notifications/entities/multichannel/notification.entity.ts | @UpdateDateColumn |
| R3-05 | Corregir hardcoded schemas a DB_SCHEMAS constants | user-suspension.entity.ts, user-preferences.entity.ts | 'auth_management' -> DB_SCHEMAS.AUTH |
| R3-06 | Documentar 22 tablas DDL-only justificadas | COHERENCE-ENTITIES-DDL.md | 16 data_warehouse + 6 infrastructure |
| R3-07 | Evaluar entities para communication schema | Nuevo: apps/backend/src/modules/ | 4 tablas sin entity: conversations, messages, etc. |

### Criterio de Aceptacion:
- Columnas faltantes HIGH/MEDIUM agregadas a entities
- Coherencia Entity-DDL >= 90% con documentacion de exclusiones
- Build exitoso: `npm run build && npm run lint`

---

## Sprint R4: Documentacion de Requerimientos (Depende de R2) - COMPLETADO

**Esfuerzo:** Medio | **Riesgo:** Bajo | **Prioridad:** P2 | **Estado:** COMPLETADO (2026-02-12)

### Tareas:

| ID | Descripcion | Detalle |
|----|-------------|---------|
| R4-01 | Evaluar 15 tablas conceptuales sin DDL | Determinar: implementar, deprecar, o documentar como futuro |
| R4-02 | Actualizar COHERENCE-ENTITIES-DDL.md | Regenerar con baseline real |
| R4-03 | Evaluar F4-VALIDATION user stories | 9 user stories, ~30% completado, evaluar estado |
| R4-04 | Crear RF files faltantes para BD si aplica | F2-DB-MIGRATION RF retroactivos |
| R4-05 | Integrar batches remediacion TASK-2026-02-05 | 9 batches pendientes como subtareas |

### Criterio de Aceptacion:
- Cada tabla conceptual tiene disposicion (implementar/deprecar/futuro)
- COHERENCE-ENTITIES-DDL.md refleja estado actual

---

## Sprint R5: Purga y Archivado (Depende de R1, R2) - COMPLETADO

**Esfuerzo:** Bajo | **Riesgo:** Bajo | **Prioridad:** P2 | **Estado:** COMPLETADO (2026-02-12)

### Tareas:

| ID | Descripcion | Detalle |
|----|-------------|---------|
| R5-01 | Evaluar docs en apps/database/docs/ | Clasificar: VIGENTE / OBSOLETO / ACTUALIZAR |
| R5-02 | Archivar tareas completadas en orchestration/tareas/ | Mover a _archive/ si completadas |
| R5-03 | Verificar _MAP.md por schema | 18 archivos deben reflejar estado actual |
| R5-04 | Limpiar scripts deprecados | scripts/_archived/ ya tiene algunos |
| R5-05 | Verificar integridad de referencias post-purga | Grep para enlaces rotos |

### Criterio de Aceptacion:
- Zero archivos obsoletos en directorios activos
- Todas las referencias internas validas
- _MAP.md actualizados

---

## Orden de Ejecucion

```
Sprint R1 (Quick Wins) ─────────────────────────────┐
                                                     ├──> Sprint R4 (Requerimientos)
Sprint R2 (Schemas/Mapeo) ──────────────────────────┤
                                                     └──> Sprint R5 (Purga)
Sprint R3 (Entity-DDL) ─────────────────────────────────> independiente tras R1
```

---

## Resumen de Esfuerzo

| Sprint | Tareas | Prioridad | Esfuerzo | Dependencias |
|--------|--------|-----------|----------|--------------|
| R1 | 6 | P0 | Bajo | Ninguna |
| R2 | 9 | P1 | Medio | R1 |
| R3 | 7 | P1 | Medio-Alto | R1 |
| R4 | 5 | P2 | Medio | R2 |
| R5 | 5 | P2 | Bajo | R1, R2 |
| **TOTAL** | **32 tareas** | | | |
