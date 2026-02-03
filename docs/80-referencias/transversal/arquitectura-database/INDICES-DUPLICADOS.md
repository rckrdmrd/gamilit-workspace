# Indices Duplicados en GAMILIT Database

**Fecha:** 2025-12-26
**Severidad:** P2 (No afecta funcionamiento)
**Estado:** DOCUMENTADO

---

## 1. RESUMEN

Se identificaron **12+ indices duplicados** en los schemas DDL de GAMILIT. Estos indices estan definidos tanto en archivos de tabla (`tables/*.sql`) como en archivos separados (`indexes/*.sql`).

**Impacto:** Ninguno funcional. PostgreSQL usa `IF NOT EXISTS` que previene errores de duplicacion.

**Recomendacion:** Mantener definiciones solo en archivos de tabla para simplicidad.

---

## 2. INDICES DUPLICADOS POR SCHEMA

### 2.1 audit_logging (5 indices)

| Indice | Tabla | En tabla/*.sql | En indexes/*.sql |
|--------|-------|----------------|-----------------|
| idx_activity_created | user_activity_logs | Si (linea 63) | idx_activity_created.sql |
| idx_activity_module | user_activity_logs | Si (linea 64) | idx_activity_module.sql |
| idx_activity_session | user_activity_logs | Si (linea 65) | idx_activity_session.sql |
| idx_activity_type | user_activity_logs | Si (linea 66) | idx_activity_type.sql |
| idx_activity_user | user_activity_logs | Si (linea 67) | idx_activity_user.sql |

### 2.2 gamification_system (4 indices)

| Indice | Tabla | Duplicado |
|--------|-------|-----------|
| idx_achievement_categories_active | achievement_categories | Si |
| idx_active_boosts_user | active_boosts | Si |
| idx_inventory_transactions_user | inventory_transactions | Si |

### 2.3 progress_tracking (2 indices)

| Indice | Tabla | Duplicado |
|--------|-------|-----------|
| idx_scheduled_missions_mission | scheduled_missions | Si |

### 2.4 auth_management (1 indice)

| Indice | Tabla | Duplicado |
|--------|-------|-----------|
| idx_user_preferences_theme | user_preferences | Si |

---

## 3. INDICES CON DISCREPANCIAS EN WHERE CLAUSE

### 3.1 educational_content

| Indice | En tabla | En archivo separado |
|--------|----------|---------------------|
| idx_assignments_due_date | `WHERE due_date IS NOT NULL` | Sin WHERE |
| idx_assignment_submissions_graded_by | `WHERE graded_by IS NOT NULL` | Sin WHERE |

**Recomendacion:** Mantener version con WHERE (mas eficiente para datos parciales).

---

## 4. DECISION ARQUITECTONICA

**Estado actual:** Los indices duplicados no causan problemas gracias a `IF NOT EXISTS`.

**Opciones:**

| Opcion | Pros | Contras |
|--------|------|---------|
| A: Eliminar indexes/*.sql | Simplicidad | Requiere migracion |
| B: Mantener ambos | Sin cambios necesarios | Redundancia en DDL |
| C: Mover todo a indexes/ | Separacion clara | Mayor complejidad |

**Decision:** Opcion B (mantener status quo). No hay impacto funcional.

---

## 5. ARCHIVOS AFECTADOS

```
apps/database/ddl/schemas/audit_logging/indexes/ (5 archivos)
apps/database/ddl/schemas/gamification_system/indexes/ (4 archivos)
apps/database/ddl/schemas/progress_tracking/indexes/02-idx_scheduled_missions_mission.sql
apps/database/ddl/schemas/auth_management/indexes/01-idx_user_preferences_theme.sql
apps/database/ddl/schemas/educational_content/indexes/ (2 archivos con discrepancias)
```

---

**Generado por:** Requirements-Analyst - GAMILIT
*Ultima actualizacion: 2025-12-26*
