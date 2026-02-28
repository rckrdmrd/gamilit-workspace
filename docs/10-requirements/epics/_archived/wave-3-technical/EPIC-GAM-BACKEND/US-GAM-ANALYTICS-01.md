---
titulo: "US-GAM-ANALYTICS-01: Dashboard de Analytics para Maestros"
tipo: user-story
fecha_creacion: "2025-10-01"
ultima_actualizacion: "2026-02-28"
estado: activo
---

# US-GAM-ANALYTICS-01: Dashboard de Analytics para Maestros

**Prefijo:** GAM | **Modulo:** analytics | **Prioridad:** P2 | **SP:** 5
**Epic:** EPIC-GAM-BACKEND

---

## Historia de Usuario

**Como** maestro que necesita evaluar el desempeno de mi aula,
**Quiero** ver metricas de engagement, progreso y completitud de ejercicios,
**Para** identificar estudiantes que necesitan apoyo y ajustar mi estrategia pedagogica.

---

## Criterios de Aceptacion

### Escenario 1: Ver analytics de aula
**Given** un maestro autenticado con al menos un aula asignada
**When** accede a "Analytics" en su portal
**Then** ve metricas agregadas del aula: promedio de progreso, ejercicios completados, tiempo promedio
**And** graficos de distribucion (histograma de scores, tendencia semanal)
**And** lista de estudiantes ordenada por progreso (ascendente para identificar rezagados)

### Escenario 2: Drill-down en estudiante especifico
**Given** un maestro que identifica un estudiante con bajo progreso
**When** hace click en el nombre del estudiante
**Then** ve detalle individual: progreso por modulo, ejercicios fallados, tiempo promedio, racha
**And** puede ver historial de intentos por ejercicio
**And** puede enviar mensaje o notificacion al estudiante/padre

### Escenario 3: Metricas de engagement
**Given** un administrador que accede a analytics globales
**When** ve el dashboard de engagement
**Then** muestra: DAU, WAU, MAU, retention rate, promedio de sesiones por dia
**And** filtra por escuela, grado, periodo de tiempo
**And** datos se refrescan desde Materialized Views (max 30 min antiguedad)

---

## Definition of Done

- [ ] Dashboard de analytics por aula
- [ ] Graficos interactivos (distribucion, tendencia)
- [ ] Drill-down a nivel de estudiante individual
- [ ] Metricas de engagement (DAU, WAU, MAU)
- [ ] Materialized Views para performance
- [ ] Filtros por periodo, modulo, escuela
- [ ] Tests para agregaciones y calculos
