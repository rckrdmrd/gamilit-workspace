# Tareas - EAI-007-modulos-m4-m5

**EPIC:** EAI-007-modulos-m4-m5
**Fase:** 02-fase-robustecimiento
**Ultima actualizacion:** 2026-01-04

---

## Resumen

| Metrica | Valor |
|---------|-------|
| **Total tareas** | 4 |
| **Completadas** | 1 |
| **En progreso** | 1 |
| **Pendientes** | 2 |

---

## Indice de Tareas

| ID | US Padre | Descripcion | Status | Asignado |
|----|----------|-------------|--------|----------|
| TASK-BE-M4-001 | US-M4-001 | Crear DTOs para Modulo 4 | To Do | @Backend-Agent |
| TASK-TEST-M4-001 | US-M4-001 | Tests unitarios para DTOs M4 | To Do | @Backend-Agent |
| TASK-FIX-M4M5-001 | US-M4M5-001 | Correccion flags requires_manual_grading M4 | Done | @Claude-Agent |
| TASK-VAL-M4M5-001 | EAI-007 | Gaps identificados y correcciones M4-M5 | In Progress | @Backend-Agent, @Frontend-Agent |

---

## Por User Story

### US-M4-001: Backend DTOs para Modulo 4

| Tarea | Descripcion | Horas |
|-------|-------------|-------|
| [TASK-BE-M4-001](./TASK-BE-M4-001-dtos-m4.md) | Crear 5 DTOs de validacion | 4h |
| [TASK-TEST-M4-001](./TASK-TEST-M4-001-tests-dtos.md) | Tests unitarios | 2h |

---

### US-M4M5-001: Seeds de Prueba

| Tarea | Descripcion | Horas |
|-------|-------------|-------|
| [TASK-FIX-M4M5-001](./TASK-FIX-M4M5-001-manual-grading-flags.md) | Correccion flags requires_manual_grading | 1h |

### EAI-007: Validacion Integral

| Tarea | Descripcion | Horas |
|-------|-------------|-------|
| [TASK-VAL-M4M5-001](./TASK-VAL-M4M5-001-gaps-correccion.md) | Gaps identificados y correcciones requeridas | 24-35h |

**Gaps Criticos:** 2 | **Gaps Medios:** 9 | **Gaps Bajos:** 7

---

## Dependencias

```
TASK-BE-M4-001 --> TASK-TEST-M4-001 (tests dependen de DTOs)
TASK-FIX-M4M5-001 --> Recreacion BD (requiere ejecutar recreate-database.sh)
```

---

**Generado:** 2026-01-04
