---
titulo: "ADR-043: Consolidacion de Base de Datos GAMILIT"
tipo: adr
fecha_creacion: "2026-01-07"
ultima_actualizacion: "2026-02-27"
estado: aceptada
---

# ADR-043: Consolidación de Base de Datos GAMILIT

**Proyecto:** GAMILIT
**Versión:** 1.0
**Última actualización:** 2026-01-07
**Estado:** Aceptada

---

## Contexto

Durante el análisis exhaustivo de la base de datos GAMILIT se identificaron múltiples duplicaciones y problemas de arquitectura que afectaban la mantenibilidad:

- **22 triggers** idénticos de `updated_at` distribuidos en archivos individuales
- **22 ENUMs** definidos incorrectamente en `00-prerequisites.sql`
- **2 tablas** de notificaciones (una deprecated)
- **10+ funciones** deprecated sin eliminar
- **Valores hard-coded** en backend que debían consultar BD

## Decisión

Implementar una consolidación en 5 fases:

### FASE 0: Pre-requisitos de Aplicación
- Refactorizar maya_ranks hard-coded en `exercise-submission.service.ts`
- Migrar NotificationsService deprecated (ya realizado previamente)
- Documentar mapeo de UserRole frontend ↔ BD

### FASE 1: Consolidación de Triggers
- Consolidar 27 archivos de triggers → 8 archivos (`00-batch_updated_at_triggers.sql` por schema)
- Mover archivos individuales a `_deprecated/`

### FASE 2: Migración de ENUMs
- Crear 22 archivos individuales de ENUMs en sus schemas correctos
- Mantener `00-prerequisites.sql` como respaldo (tipos ya existen)

### FASE 3: Tabla Notifications Deprecated
- Crear script de migración de datos
- Mover tabla a `_deprecated/`

### FASE 4: Limpieza de Funciones
- Crear script de eliminación de funciones deprecated

## Consecuencias

### Positivas
- **-70%** reducción en archivos de triggers
- **-100%** ENUMs fuera de `prerequisites.sql`
- **-100%** valores hard-coded de maya_ranks
- Mejor mantenibilidad y trazabilidad
- Cumplimiento de política DB-111 (Carga Limpia)

### Negativas
- Archivos en `_deprecated/` deben eliminarse manualmente después de validar
- Scripts de migración SQL requieren ejecución manual en BD

### Neutrales
- `00-prerequisites.sql` mantiene ENUMs como respaldo (idempotente)
- Archivos consolidados usan `DROP ... IF EXISTS` + `CREATE`

## Archivos Modificados

### Backend
- `apps/backend/src/modules/progress/services/exercise-submission.service.ts`

### Frontend
- `apps/frontend/src/shared/types/user.types.ts`

### Database DDL
- `apps/database/create-database.sh` (v1.1)
- 8 archivos `00-batch_updated_at_triggers.sql` creados
- 22 archivos de ENUMs creados
- 27 archivos de triggers movidos a `_deprecated/`
- 1 tabla movida a `_deprecated/`

### Migraciones
- `apps/database/ddl/migrations/2026-01-07-FASE3-migrate-notifications.sql`
- `apps/database/ddl/migrations/2026-01-07-FASE4-cleanup-deprecated.sql`

## Referencias

- `orchestration/agentes/database/PLAN-CONSOLIDACION-BD-2026-01-07.md`
- `orchestration/agentes/database/VALIDACION-PLAN-CONSOLIDACION-2026-01-07.md`
- `orchestration/agentes/database/ANALISIS-DEPENDENCIAS-2026-01-07.md`
- `orchestration/agentes/database/REFINAMIENTO-PLAN-2026-01-07.md`
- `orchestration/agentes/database/EJECUCION-CONSOLIDACION-COMPLETA-2026-01-07.md`

---

**Autor:** Claude Code (Arquitecto de Datos)
**Revisado por:** Pendiente
**Aprobado por:** Pendiente
