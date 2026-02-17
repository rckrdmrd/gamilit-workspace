# 04-CIERRE.md - Criterios de Aceptacion y Cierre

**Tarea:** TASK-2026-02-17-MEJORAS-CALIDAD-CODIGO
**Fecha:** 2026-02-17
**Version:** 1.0.0
**Sistema:** SIMCO v4.0.0

---

## 1. Criterios de Aceptacion

### CA-01: Todos los items P0 resueltos

| Item | Criterio | Estado |
|------|----------|--------|
| MQ-001 | jest.config.js y CLAUDE.md alineados (mismo valor o brecha documentada con ADR) | Pendiente |
| CORR-01 | env.validation.ts types presentes y funcionales | Completado |
| CORR-02 | lint no-case-declarations sin warnings | Completado |

**Progreso P0:** 2/3 completados (66%)

### CA-02: Todos los items P1 planificados con fechas

| Item | Criterio | Fecha Objetivo |
|------|----------|---------------|
| MQ-002 | Jerarquia de errores de dominio creada, 3 servicios migrados | 2026-03-03 |
| MQ-003 | 4 skills P1 creados y registrados en SKILLS-REGISTRY | 2026-03-03 |
| MQ-004 | Todas las tareas vinculadas a EPICs, _INDEX.yml actualizado | 2026-03-03 |
| CORR-03 | DDL cascade errors corregidos, recreate-database.sh limpio | 2026-03-03 |
| CORR-04 | RLS count = 227 post-init | 2026-03-03 |

**Progreso P1:** 0/5 completados — todos planificados para Sprint 1

### CA-03: Artefactos Scrum actualizados

| Artefacto | Criterio | Estado |
|-----------|----------|--------|
| BACKLOG.yml | EPIC-WS-004 y EPIC-WS-005 agregados con items | Completado |
| SPRINT-ACTUAL.yml | Sprint 1 configurado con items P0 y P1 | Completado |
| PROXIMA-ACCION.md | Actualizado con siguiente paso | Pendiente |

### CA-04: Trazabilidad completa

| Criterio | Estado |
|----------|--------|
| Cada MQ/CORR tiene EPIC asignado | Completado (03-TRAZABILIDAD.md) |
| Cada MQ/CORR tiene Standard referenciado | Completado (03-TRAZABILIDAD.md) |
| Cada MQ/CORR tiene archivo de evidencia | Completado (03-TRAZABILIDAD.md) |
| Dependencias documentadas | Completado (02-PLAN-MEJORAS.md) |

---

## 2. Definition of Done

La tarea TASK-2026-02-17-MEJORAS-CALIDAD-CODIGO se considera completada cuando:

1. **Estructura creada:** Directorio de tarea con 4 archivos (01-ANALISIS, 02-PLAN-MEJORAS, 03-TRAZABILIDAD, 04-CIERRE)
2. **Items P0 resueltos:** MQ-001 implementado (CORR-01, CORR-02 ya completados)
3. **Items P1 planificados:** Todos con fecha objetivo y asignados a Sprint 1
4. **Scrum actualizado:** BACKLOG.yml y SPRINT-ACTUAL.yml reflejan los items
5. **Trazabilidad verificada:** Cada item mapeado a EPIC, Standard, y evidencia

---

## 3. Riesgos de Cierre

| Riesgo | Probabilidad | Impacto | Mitigacion |
|--------|-------------|---------|------------|
| CORR-03 mas complejo de lo estimado | Media | Alto | Dividir en sub-tareas si supera 5 dias |
| MQ-002 requiere refactor extenso | Baja | Medio | Implementar solo en 3 modulos piloto, no en todos |
| MQ-007 (911 any) regression | Alta | Bajo | Crear lint rule que bloquee nuevos `any` |

---

## 4. Siguiente Paso Post-Cierre

Al completar esta tarea de planificacion:
1. Ejecutar Fase A (MQ-001) inmediatamente
2. Iniciar Sprint 1 con items P1
3. Actualizar PROXIMA-ACCION.md con estado actual

---

## 5. Registro de Cierre

| Campo | Valor |
|-------|-------|
| Fecha creacion | 2026-02-17 |
| Fecha cierre planificacion | 2026-02-17 |
| Fecha cierre ejecucion | Pendiente (objetivo: 2026-03-03 para P0+P1) |
| Creado por | Claude Code |
| Aprobado por | Pendiente |

---

*Generado por: Claude Code | Fecha: 2026-02-17*
