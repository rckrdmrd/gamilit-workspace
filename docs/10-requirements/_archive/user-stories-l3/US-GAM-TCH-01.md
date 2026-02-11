# US-GAM-TCH-01: Portal Maestro con Dashboard Analytics

**Sistema:** SIMCO v4.0.0 | **Template:** User Story Level 3 (L3)

**Epica:** EPIC-GAM-FRONTEND
**Modulo(s):** teachers, classrooms, analytics, reports
**Story Points:** 13
**Prioridad:** P0
**Sprint:** Completado

## Descripcion
**Como** maestro
**Quiero** un portal con dashboard de analytics, gestion de aulas y herramientas de asignacion
**Para** monitorear el progreso de mis estudiantes y gestionar actividades de comprension lectora

## Criterios de Aceptacion

### CA-1: Dashboard del Maestro
**Given** un maestro autenticado en su portal
**When** accede al dashboard principal
**Then** ve: resumen de aulas activas con metricas clave, estudiantes con bajo rendimiento (alertas), ejercicios pendientes de revision manual, distribucion de progreso por modulo, engagement promedio (DAU, tiempo en plataforma), y accesos rapidos a funciones frecuentes

### CA-2: Gestion de Aulas
**Given** un maestro con una o mas aulas asignadas
**When** accede a la gestion de aulas
**Then** puede ver listado de aulas (19 paginas de gestion), asignar/desasignar estudiantes, configurar modulos habilitados por aula, ajustar parametros de dificultad, y ver metricas comparativas entre aulas

### CA-3: Asignacion de Ejercicios
**Given** un maestro que desea asignar un ejercicio a un aula o estudiante
**When** crea una asignacion
**Then** selecciona ejercicio(s) por tipo y modulo, define fecha limite, puede asignar a aula completa o estudiantes individuales, los estudiantes reciben notificacion de nueva asignacion, y el maestro puede dar seguimiento al estatus de entrega

### CA-4: Revision Manual de Produccion (Modulo 5)
**Given** un estudiante que entrego un ejercicio del Modulo 5 (diario, comic o video carta)
**When** el maestro accede a la bandeja de revision
**Then** ve las entregas pendientes con preview, puede calificar con rubrica configurable (1-100), agregar comentarios de retroalimentacion, aprobar o solicitar correccion, y al calificar se dispara el evento de XP para el estudiante

### CA-5: Reportes de Progreso
**Given** un maestro que solicita un reporte
**When** selecciona tipo de reporte y parametros
**Then** puede generar: reporte individual por estudiante, reporte grupal por aula, comparativa entre periodos, distribucion de puntajes por ejercicio, y exportar en PDF o Excel

### CA-6: Comunicacion con Padres
**Given** un maestro que necesita comunicarse con el padre de un estudiante
**When** utiliza la herramienta de comunicacion
**Then** puede enviar mensaje directo al padre vinculado, adjuntar reporte de progreso, programar notificacion automatica, y ver historial de comunicaciones

## Notas Tecnicas

| Aspecto | Detalle |
|---------|---------|
| Stack | React 19, Zustand 5.x, TailwindCSS 4.x, Recharts (graficos) |
| Componentes FE | TeacherDashboard, ClassroomList, ClassroomDetail, AssignmentCreator, ManualReviewPanel, RubricEditor, ProgressReport, StudentDetailView, ParentCommunication, ExportDialog |
| Paginas | 19 (dashboard, aulas, asignaciones, revisiones, reportes, estudiantes, comunicacion, configuracion) |
| Stores Zustand | useTeacherStore, useClassroomStore, useAssignmentStore, useReviewStore |
| Dependencias | US-GAM-EDU-01 (Modulos), US-GAM-ANL-01 (Analytics), US-GAM-PAR-01 (Portal Padres) |

## Definition of Done
- [ ] Dashboard maestro con metricas y alertas
- [ ] Gestion completa de aulas (CRUD, asignacion estudiantes)
- [ ] Asignacion de ejercicios a aulas/individuos
- [ ] Revision manual con rubrica para Modulo 5
- [ ] Reportes exportables (PDF, Excel)
- [ ] Comunicacion con padres
- [ ] Tests frontend (cobertura >= 70%)
- [ ] Inventarios actualizados

## Trazabilidad

| Artefacto | Referencia |
|-----------|------------|
| Requerimiento | RF-GAM-024, RF-GAM-025 |
| Epica padre | EPIC-GAM-FRONTEND |
