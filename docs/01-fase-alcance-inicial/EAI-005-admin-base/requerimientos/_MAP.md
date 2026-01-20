# Requerimientos Funcionales - EAI-005

**EPIC:** EAI-005 - Administracion Base
**Ultima actualizacion:** 2026-01-20

---

## Indice

| ID | Titulo | User Stories | Especificacion | Prioridad | Estado |
|----|--------|--------------|----------------|-----------|--------|
| [RF-ADM-001](./RF-ADM-001-gestion-aulas.md) | Gestion de Aulas | US-ADM-001, US-ADM-006 | [ET-ADM-001](../especificaciones/ET-ADM-001-gestion-aulas.md) | Alta | Implementado |
| [RF-ADM-002](./RF-ADM-002-gestion-estudiantes.md) | Gestion de Estudiantes | US-ADM-002, US-ADM-005 | [ET-ADM-002](../especificaciones/ET-ADM-002-gestion-estudiantes.md) | Alta | Implementado |
| [RF-ADM-003](./RF-ADM-003-dashboard-maestro.md) | Dashboard de Maestro | US-ADM-003, US-ADM-007 | [ET-ADM-003](../especificaciones/ET-ADM-003-dashboard-maestro.md) | Alta | Implementado |
| [RF-ADM-004](./RF-ADM-004-asignacion-modulos.md) | Asignacion de Modulos | US-ADM-004 | [ET-ADM-004](../especificaciones/ET-ADM-004-asignacion-modulos.md) | Alta | Implementado |

**Total:** 4 Requerimientos Funcionales

---

## Descripcion por Requerimiento

### RF-ADM-001: Gestion de Aulas

Permite a profesores crear y administrar aulas virtuales con:
- CRUD completo de aulas (crear, listar, editar, eliminar)
- Campos: nombre, descripcion, nivel educativo, grado, ciclo escolar
- Configuracion de fechas de inicio/fin
- Toggle de visibilidad de modulos
- Toggle de gamificacion
- Limite de 20 aulas por profesor

**Documentos:**
- Requerimiento: [RF-ADM-001](./RF-ADM-001-gestion-aulas.md)
- Especificacion: [ET-ADM-001](../especificaciones/ET-ADM-001-gestion-aulas.md)
- User Stories: US-ADM-001 (8 SP), US-ADM-006 (6 SP)
- Story Points totales: 14 SP

---

### RF-ADM-002: Gestion de Estudiantes

Permite a profesores gestionar estudiantes dentro de sus aulas:
- Ver lista de estudiantes del aula
- Agregar estudiantes existentes (busqueda)
- Crear nuevos estudiantes con credenciales automaticas
- Remover estudiantes del aula
- CRUD de grupos
- Asignar estudiantes a multiples grupos
- Limite de 100 estudiantes por aula

**Documentos:**
- Requerimiento: [RF-ADM-002](./RF-ADM-002-gestion-estudiantes.md)
- Especificacion: [ET-ADM-002](../especificaciones/ET-ADM-002-gestion-estudiantes.md)
- User Stories: US-ADM-002 (10 SP), US-ADM-005 (7 SP)
- Story Points totales: 17 SP

---

### RF-ADM-003: Dashboard de Maestro

Proporciona vista panoramica para monitoreo de aulas:
- Dashboard general con resumen de todas las aulas
- Metricas agregadas (estudiantes, progreso promedio)
- Insights automaticos (mejor/peor aula)
- Vista de actividad por aula en tiempo casi real
- Estudiantes activos hoy
- Modulos en progreso (ultimos 7 dias)
- Ultimas actividades completadas
- Auto-refresh cada 2 minutos

**Documentos:**
- Requerimiento: [RF-ADM-003](./RF-ADM-003-dashboard-maestro.md)
- Especificacion: [ET-ADM-003](../especificaciones/ET-ADM-003-dashboard-maestro.md)
- User Stories: US-ADM-003 (8 SP), US-ADM-007 (6 SP)
- Story Points totales: 14 SP

---

### RF-ADM-004: Asignacion de Modulos

Permite asignar contenido educativo a aulas:
- Catalogo de modulos disponibles con filtros
- Asignar modulos desde catalogo a aula
- Ver modulos asignados con estadisticas
- Remover modulos del aula
- Contenido hardcodeado (no editable por profesor)
- Sin limite de modulos por aula

**Documentos:**
- Requerimiento: [RF-ADM-004](./RF-ADM-004-asignacion-modulos.md)
- Especificacion: [ET-ADM-004](../especificaciones/ET-ADM-004-asignacion-modulos.md)
- User Stories: US-ADM-004 (10 SP)
- Story Points totales: 10 SP

---

## Matriz de Trazabilidad

```
User Story           Requerimiento      Especificacion
──────────────────   ────────────────   ─────────────────
US-ADM-001 (8 SP)  ─┬─> RF-ADM-001 ───> ET-ADM-001
US-ADM-006 (6 SP)  ─┘

US-ADM-002 (10 SP) ─┬─> RF-ADM-002 ───> ET-ADM-002
US-ADM-005 (7 SP)  ─┘

US-ADM-003 (8 SP)  ─┬─> RF-ADM-003 ───> ET-ADM-003
US-ADM-007 (6 SP)  ─┘

US-ADM-004 (10 SP) ───> RF-ADM-004 ───> ET-ADM-004
```

---

## Resumen

| Metrica | Valor |
|---------|-------|
| Total Requerimientos | 4 |
| Total User Stories | 7 |
| Total Story Points | 55 SP |
| Presupuesto | $22,000 MXN |
| Estado | Implementado |

---

**Nota:** Documentacion generada retroactivamente para mantener consistencia con estandares SIMCO.

---

**Ultima actualizacion:** 2026-01-20
**Generado por:** Documentation Analyst
