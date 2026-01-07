# Tablero Kanban - GAMILIT

**Sprint Actual:** Sprint 9 (Fase 3 - Extensiones)
**Ultima actualizacion:** 2026-01-04
**Velocity Objetivo:** 40 SP

---

## Resumen del Sprint

| Metrica | Valor |
|---------|-------|
| Story Points Planificados | 40 |
| Story Points Completados | 36 |
| Tareas Pendientes | 0 |
| Tareas En Progreso | 0 |
| Tareas Completadas | 6 |
| Bugs Abiertos | 2 |

---

## Backlog

Items pendientes de planificacion para futuros sprints.

| ID | Titulo | Tipo | SP | Prioridad |
|----|--------|------|-----|-----------|
| - | Ver `/docs/04-fase-backlog/` | - | - | - |

---

## Por Hacer (To Do)

Items planificados para el sprint actual, pendientes de iniciar.

| ID | Titulo | Asignado | SP | Prioridad | Epic |
|----|--------|----------|-----|-----------|------|
| - | - | - | - | - | - |

---

## En Progreso (In Progress)

Items actualmente en desarrollo.

| ID | Titulo | Asignado | SP | Inicio | Epic |
|----|--------|----------|-----|--------|------|
| - | - | - | - | - | - |

---

## Bloqueado (Blocked)

Items bloqueados esperando dependencias o decision.

| ID | Titulo | Asignado | Bloqueado Por | Desde |
|----|--------|----------|---------------|-------|
| - | - | - | - | - |

---

## En Revision (Review)

Items completados pendientes de validacion.

| ID | Titulo | Asignado | Revisor | SP |
|----|--------|----------|---------|-----|
| - | - | - | - | - |

---

## Hecho (Done)

Items completados y validados en este sprint.

| ID | Titulo | Completado Por | SP | Fecha |
|----|--------|----------------|-----|-------|
| TASK-SCRUM-000 | Crear infraestructura SCRUM | @Claude | 3 | 2026-01-04 |
| TASK-SCRUM-001 | Migrar US a YAML front-matter (100%) | @Claude | 8 | 2026-01-04 |
| TASK-SCRUM-002 | Extraer tareas de US a archivos TASK | @Claude | 13 | 2026-01-04 |
| TASK-SCRUM-003 | Resolver duplicado US-GAM-002 → US-GAM-010 | @Claude | 2 | 2026-01-04 |
| TASK-SCRUM-004 | Regenerar _MAP.md principales | @Claude | 5 | 2026-01-04 |
| TASK-SCRUM-005 | Migrar RF a YAML front-matter (100%) | @Claude | 5 | 2026-01-04 |

---

## Bugs Abiertos

| ID | Titulo | Severidad | Modulo | Asignado | Estado |
|----|--------|-----------|--------|----------|--------|
| BUG-003 | Frontend usaba endpoint incorrecto para submit | P0 | Frontend | @Claude | ✅ RESUELTO 2026-01-04 |
| BUG-005 | DTOs incompletos en respuestas Auth | P1 | Backend | @Claude | ✅ RESUELTO 2026-01-04 |

*Ver detalle completo en `/orchestration/trazas/TRAZA-BUGS.md`*

### Notas BUG-003 (Resolucion 2026-01-04)
- **Diagnostico real:** El endpoint `/educational/exercises/:id/submit` SI estaba implementado
- **Problema:** Frontend (`progressAPI.ts`) usaba `/progress/submissions/submit` (solo para revision manual)
- **Fix:** Cambiado a usar `${API_ENDPOINTS.educational.exercise(exerciseId)}/submit`
- **Archivo:** `apps/frontend/src/features/progress/api/progressAPI.ts` lineas 380-392

### Notas BUG-005 (Resolucion 2026-01-04)
- **Diagnostico:** Endpoints `getProfile` y `updateProfile` no usaban `toUserResponse()`
- **Problema:** Retornaban User entity directamente sin campos derivados (`emailVerified`, `isActive`)
- **Fix:** Cambiado para usar `this.authService.toUserResponse(user)` en 4 endpoints
- **Archivos modificados:**
  - `apps/backend/src/modules/auth/controllers/auth.controller.ts` (2 endpoints)
  - `apps/backend/src/modules/auth/controllers/users.controller.ts` (2 endpoints)

---

## Notas del Sprint

- **2026-01-04:** Estandarizacion SCRUM completada (36 SP)
  - Creado AGENTS.md (guia de agentes)
  - Creado config.yml (configuracion del proyecto)
  - Creado Board.md (tablero Kanban)
  - Migrado 113 US a YAML front-matter (100%)
  - Migrado 18 RF a YAML front-matter (100%)
  - Resuelto conflicto duplicado US-GAM-002 → US-GAM-010
  - Extraido 5 archivos TASK de US con tareas formales
  - Actualizado 3 _MAP.md principales de fase
  - Archivos especiales excluidos (resumes de sprints)

---

## Historico de Sprints

| Sprint | Fechas | Velocity | Completado |
|--------|--------|----------|------------|
| Sprint 1-8 | 2025-08 a 2025-11 | ~37 SP/sprint | Ver SPRINTS-DETALLADOS.md |
| Sprint 9 | 2026-01-04 - | 40 SP objetivo | En progreso |

---

## Referencias

- **Backlog completo:** `/docs/04-fase-backlog/README.md`
- **Sprints detallados:** `/docs/90-transversal/sprints/SPRINTS-DETALLADOS.md`
- **Configuracion:** `/docs/planning/config.yml`
- **Guia de agentes:** `/AGENTS.md`

---

**Mantenido por:** Scrum Master / Architecture Team
**Actualizacion:** Al cambiar estado de cualquier item
