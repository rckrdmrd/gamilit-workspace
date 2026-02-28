---
titulo: "US-GAM-PAR-01: Portal Padres con Reportes"
tipo: user-story
fecha_creacion: "2025-10-01"
ultima_actualizacion: "2026-02-28"
estado: archivado
---

# US-GAM-PAR-01: Portal Padres con Reportes

**Sistema:** SIMCO v4.0.0 | **Template:** User Story Level 3 (L3)

**Epica:** EPIC-GAM-FRONTEND
**Modulo(s):** parents, notifications, reports
**Story Points:** 8
**Prioridad:** P1
**Sprint:** Completado

## Descripcion
**Como** padre o tutor de un estudiante
**Quiero** un portal donde pueda ver el progreso academico de mi hijo y recibir notificaciones
**Para** dar seguimiento a su desempeno escolar en comprension lectora

## Criterios de Aceptacion

### CA-1: Vinculacion Padre-Estudiante
**Given** un padre registrado en la plataforma
**When** utiliza un codigo de vinculacion proporcionado por el maestro
**Then** se establece la relacion padre-estudiante, el padre obtiene acceso al progreso del hijo, puede vincular multiples hijos, y recibe confirmacion de vinculacion exitosa

### CA-2: Dashboard de Progreso Academico
**Given** un padre vinculado a un estudiante
**When** accede a su portal
**Then** ve: rango maya actual del hijo con icono, XP acumulado y progreso al siguiente rango, porcentaje de completitud por modulo, estadisticas de engagement (dias activos, tiempo promedio), ultimos ejercicios completados con puntaje, y racha de dias consecutivos

### CA-3: Notificaciones Automaticas Multi-Canal
**Given** un padre con preferencias de notificacion configuradas
**When** ocurren eventos relevantes del estudiante
**Then** recibe notificaciones por los canales habilitados (email, push, SMS): promocion de rango, logros desbloqueados, inactividad prolongada (N dias sin acceder), calificacion de ejercicio manual (Modulo 5), y comunicacion directa del maestro

### CA-4: Reportes Descargables
**Given** un padre que solicita un reporte de progreso
**When** selecciona periodo y formato
**Then** genera reporte con: resumen de actividad del periodo, puntajes por modulo y ejercicio, comparativa con periodos anteriores, tiempo dedicado a la plataforma, y exporta en PDF con formato profesional

### CA-5: Comunicacion con Maestro
**Given** un padre que necesita contactar al maestro
**When** utiliza la herramienta de mensajeria
**Then** puede enviar mensaje al maestro titular, adjuntar preguntas o comentarios, ver historial de conversacion, y recibir respuestas con notificacion

### CA-6: Vista Multi-Hijo
**Given** un padre con multiples hijos vinculados
**When** accede al portal
**Then** ve selector de hijos con nombre y avatar, dashboard independiente por cada hijo, comparativa general de progreso entre hijos, y notificaciones consolidadas o por hijo

## Notas Tecnicas

| Aspecto | Detalle |
|---------|---------|
| Stack | React 19, Zustand 5.x, TailwindCSS 4.x |
| Componentes FE | ParentDashboard, ChildProgressCard, LinkChildForm, NotificationPreferences, ProgressReport, MessageComposer, ChildSelector, DownloadReport |
| Paginas | ~18 (dashboard, progreso, notificaciones, reportes, mensajes, perfil, vinculacion, ajustes) |
| Dependencias | US-GAM-STD-01 (Datos estudiante), US-GAM-TCH-01 (Comunicacion), US-GAM-ANL-01 (Metricas) |

## Definition of Done
- [ ] Vinculacion padre-estudiante via codigo funcional
- [ ] Dashboard de progreso academico completo
- [ ] Notificaciones multi-canal (email, push, SMS)
- [ ] Reportes exportables en PDF
- [ ] Mensajeria con maestro
- [ ] Vista multi-hijo
- [ ] Tests frontend (cobertura >= 70%)
- [ ] Inventarios actualizados

## Trazabilidad

| Artefacto | Referencia |
|-----------|------------|
| Requerimiento | RF-GAM-026, RF-GAM-027 |
| Epica padre | EPIC-GAM-FRONTEND |
