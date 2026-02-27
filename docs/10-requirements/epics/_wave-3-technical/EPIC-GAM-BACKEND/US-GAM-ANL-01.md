# US-GAM-ANL-01: Analytics y Metricas Educativas

**Sistema:** SIMCO v4.0.0 | **Template:** User Story Level 3 (L3)

**Epica:** EPIC-GAM-BACKEND
**Modulo(s):** analytics, reports
**Story Points:** 13
**Prioridad:** P1
**Sprint:** Completado

## Descripcion
**Como** maestro o administrador
**Quiero** acceder a analytics de aprendizaje y metricas de engagement
**Para** tomar decisiones informadas sobre contenido, dificultad y estrategias pedagogicas

## Criterios de Aceptacion

### CA-1: Metricas por Estudiante
**Given** un maestro que consulta el progreso de un estudiante
**When** accede al detalle de analytics del estudiante
**Then** ve: puntaje promedio por modulo, tiempo promedio por ejercicio, frecuencia de uso (dias por semana), areas fuertes y debiles, tendencia de progreso (mejora/estancamiento), y comparativa con promedio del aula

### CA-2: Metricas por Aula
**Given** un maestro que consulta analytics de su aula
**When** accede al dashboard de analytics del aula
**Then** ve: distribucion de progreso por modulo (histograma), promedio de puntaje por tipo de ejercicio, estudiantes con mejor rendimiento, estudiantes en riesgo (bajo rendimiento, inactividad), y engagement grupal (DAU, tiempo promedio)

### CA-3: Engagement Analytics
**Given** un administrador que consulta metricas de engagement
**When** accede a la seccion de analytics global
**Then** ve: DAU, WAU, MAU por periodo, retention rate (D1, D7, D30), tiempo promedio de sesion, frecuencia de uso, distribucion por dispositivo y navegador, y can filter por escuela, periodo y modulo

### CA-4: Materialized Views para Performance
**Given** el sistema con 7 materialized views configuradas
**When** las queries de analytics se ejecutan
**Then** las consultas se resuelven contra materialized views pre-calculadas, el tiempo de respuesta es < 200ms para dashboards, las views se refrescan periodicamente (configurable), y soportan filtros por tenant, periodo y modulo

### CA-5: Reportes Programados
**Given** un maestro o administrador que configura reportes automaticos
**When** llega la fecha/hora programada
**Then** el sistema genera el reporte con los parametros definidos, lo envia via email al destinatario, almacena copia descargable en el sistema, y registra la ejecucion en el historial

### CA-6: Exportacion Multi-Formato
**Given** un usuario que genera un reporte de analytics
**When** solicita la exportacion
**Then** puede exportar en PDF (formato profesional con graficos), Excel (datos tabulares con formulas), y el reporte incluye metadatos (fecha, periodo, filtros aplicados, generado por)

## Notas Tecnicas

| Aspecto | Detalle |
|---------|---------|
| Stack | NestJS 11, PostgreSQL 15 (materialized views), React 19, Recharts |
| Entidades BD | analytics_events, analytics_snapshots, report_templates, report_instances, report_schedules |
| Materialized Views | mv_student_progress, mv_classroom_stats, mv_module_analytics, mv_engagement_daily, mv_leaderboard_cache, mv_exercise_performance, mv_retention_metrics |
| Endpoints API | `GET /api/v1/analytics/student/:id` `GET /api/v1/analytics/classroom/:id` `GET /api/v1/analytics/global` `GET /api/v1/analytics/engagement` `POST /api/v1/reports/generate` `GET /api/v1/reports/scheduled` `GET /api/v1/reports/:id/download` |
| Dependencias | US-GAM-TCH-01 (Portal Maestro), US-GAM-ADM-01 (Portal Admin) |

## Definition of Done
- [ ] Metricas por estudiante implementadas
- [ ] Metricas por aula con distribucion
- [ ] Engagement analytics (DAU, WAU, MAU, retention)
- [ ] 7 materialized views operativas con refresh
- [ ] Reportes programados con envio email
- [ ] Exportacion PDF y Excel
- [ ] Tests unitarios (cobertura >= 80%)
- [ ] Inventarios actualizados

## Trazabilidad

| Artefacto | Referencia |
|-----------|------------|
| Requerimiento | RF-GAM-028, RF-GAM-029 |
| Epica padre | EPIC-GAM-BACKEND |
