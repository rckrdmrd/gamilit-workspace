# Mapa de ENUMs del Schema progress_tracking

**Total de ENUMs:** 1
**Última actualización:** 2025-11-08
**Migrados desde public:** 1 (progress_status)
**Creados:** 0

---

## Resumen

Este directorio contiene todos los tipos enumerados (ENUMs) del schema `progress_tracking`. Estos ENUMs son específicos del seguimiento de progreso educativo (estados de módulos, ejercicios, aprendizaje).

---

## Lista de ENUMs

| # | Nombre | Archivo | Descripción | Valores | Estado | Versión |
|---|--------|---------|-------------|---------|--------|---------|
| 1 | progress_status | progress_status.sql | Estados de progreso para módulos y ejercicios | 5 valores | ✅ Migrado | v1.0 (2025-11-08) |

---

## Valores Detallados por ENUM

### 1. progress_status (5 valores) ⭐ MIGRADO

**Descripción:** Estados de progreso para módulos y ejercicios en el sistema de tracking

**Valores (ordenados por flujo de progreso):**
- `'not_started'` - Sin iniciar: No se ha comenzado el módulo/ejercicio
- `'in_progress'` - En progreso: Actualmente trabajando (0% < progreso < 100%)
- `'completed'` - Completado: Terminado, cumple requisitos mínimos (progreso = 100%)
- `'reviewed'` - Revisado: Revisado por docente o sistema (post-completación)
- `'mastered'` - Dominado: Excelencia demostrada, nivel maestría

**Flujos de transición:**

**Flujo normal (con docente):**
```
not_started → in_progress → completed → reviewed → mastered
```

**Flujo autoestudio:**
```
not_started → in_progress → completed → mastered
```

**Flujo con reintento:**
```
completed → in_progress → completed
```

**Usado en:**
- `progress_tracking.module_progress` (columna: `status`, DEFAULT: 'not_started')
- Potencialmente: `progress_tracking.exercise_progress` (si existe)

**Migración v1.0 (2025-11-08):**
- ✅ Migrado de public.progress_status a progress_tracking.progress_status
- ✅ Tabla module_progress actualizada (single-tabla migration)
- ✅ Backend constants: ProgressStatusEnum actualizado con flujos documentados
- ✅ Entity actualizado: module-progress.entity.ts con enumName
- ✅ Migration: `2025-11-08-migrate-progress-status-enum.sql`
- ✅ Complejidad BAJA: Migración estándar single-tabla

**Índices que usan este ENUM:**
- `idx_module_progress_status` - Índice por status
- `idx_module_progress_completed` - WHERE status = 'completed'
- `idx_module_progress_incomplete` - WHERE status IN ('not_started', 'in_progress')

**Referencias:**
- Docs: `docs/02-especificaciones-tecnicas/tipos-compartidos/TYPES-PROGRESS.md`
- DDL: `apps/database/ddl/schemas/progress_tracking/enums/progress_status.sql`
- Tabla: `apps/database/ddl/schemas/progress_tracking/tables/01-module_progress.sql:33`
- Backend: `apps/backend/src/shared/constants/enums.constants.ts` (ProgressStatusEnum)
- Entity: `apps/backend/src/modules/progress/entities/module-progress.entity.ts:70`

---

## Orden de Creación Recomendado

Los ENUMs de progress_tracking deben crearse antes que las tablas que los referencian:

1. **progress_status** - Requerido por module_progress

```bash
# Ejecutar en orden:
psql -f progress_status.sql
```

---

## Referencias Cruzadas

### Tablas que usan estos ENUMs

**progress_tracking:**
- `module_progress` → progress_status

### Backend Entities

- `apps/backend/src/modules/progress/entities/module-progress.entity.ts` → progress_status

### Backend Services

- `apps/backend/src/modules/progress/services/module-progress.service.ts` - Usa ProgressStatusEnum
- `apps/backend/src/modules/progress/dto/module-progress-response.dto.ts` - Expone enum
- `apps/backend/src/modules/progress/dto/create-module-progress.dto.ts` - Valida status

---

## Historial de Migraciones

| Fecha | ENUM | Acción | Migration | Estado |
|-------|------|--------|-----------|--------|
| 2025-11-08 | progress_status | Migrado de public | 2025-11-08-migrate-progress-status-enum.sql | ✅ |

---

## Notas Importantes

### ENUMs Futuros para progress_tracking

Potenciales ENUMs que podrían agregarse en el futuro:

- `attempt_status` - Estados de intentos individuales (planned, ongoing, submitted, graded)
- `session_status` - Estados de sesiones de aprendizaje (active, paused, completed, abandoned)
- `mastery_level` - Niveles de maestría (novice, beginner, intermediate, advanced, expert)

**Ver:** `apps/database/docs/PLAN-MIGRACION-ENUMS-FASE1.md` para plan completo de migraciones FASE 1

---

## Comandos de Validación

```bash
# Verificar ENUMs en BD
psql -d gamilit_platform -c "
SELECT n.nspname as schema, t.typname as enum_name, e.enumlabel as value
FROM pg_type t
JOIN pg_enum e ON t.oid = e.enumtypid
JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
WHERE n.nspname = 'progress_tracking'
ORDER BY enum_name, e.enumsortorder;
"

# Verificar qué columnas usan progress_status
psql -d gamilit_platform -c "
SELECT c.table_schema, c.table_name, c.column_name, c.udt_schema, c.udt_name
FROM information_schema.columns c
WHERE c.udt_name = 'progress_status';
"

# Contar registros por status en module_progress
psql -d gamilit_platform -c "
SELECT status, COUNT(*) as count
FROM progress_tracking.module_progress
GROUP BY status
ORDER BY
  CASE status
    WHEN 'not_started' THEN 1
    WHEN 'in_progress' THEN 2
    WHEN 'completed' THEN 3
    WHEN 'reviewed' THEN 4
    WHEN 'mastered' THEN 5
  END;
"
```

---

**Generado:** 2025-11-08
**Sistema:** SIMCO (Sistema Indexado Modular por Contexto)
**Versión:** 1.0
**Última migración:** progress_status v1.0 migrado de public (2025-11-08) - Complejidad BAJA
