---
titulo: FL-TCH-03 - Monitoreo de Estudiantes y Alertas
tipo: flujo
fecha_creacion: "2025-10-01"
ultima_actualizacion: "2026-02-28"
estado: activo
---

# FL-TCH-03 - Monitoreo de Estudiantes y Alertas

**Portal:** Teacher
**Prioridad:** Alta
**Version:** 1.1.0
**Fecha:** 2026-02-19
**Estado:** Activo

---

## 1. Resumen

Flujo para visualizar alertas de riesgo academico generadas automaticamente por el sistema de monitoreo, confirmarlas (acknowledge), resolverlas con notas de intervencion o descartarlas. Incluye tambien la configuracion de umbrales y preferencias de alertas por classroom.

Adicionalmente, la pagina `TeacherMonitoringPage` integra el hook `useClassroomRealtime` para recibir eventos en tiempo real via WebSocket (Socket.IO), incluyendo un indicador de estado de conexion y un feed de actividad en vivo con los 10 eventos mas recientes. Cuando WebSocket no esta disponible, el sistema degrada graciosamente a polling periodico.

## 2. Precondiciones

| Condicion | Detalle |
|-----------|---------|
| Rol requerido | `ADMIN_TEACHER` o `SUPER_ADMIN` |
| Sesion activa | JWT valido con `JwtAuthGuard` + `RolesGuard` |
| Classrooms asignados | El docente debe tener al menos un classroom en `social_features.teacher_classrooms` |
| Alertas generadas | El sistema debe haber ejecutado `progress_tracking.generate_student_alerts()` para poblar alertas |
| Tenant activo | El usuario debe pertenecer a un tenant activo (`auth_management.tenants`) |

## 3. Diagrama Mermaid

```mermaid
flowchart TD
    page[TeacherAlerts] --> panel[InterventionAlertsPanel]
    panel --> card[AlertCard]
    card --> ack[PATCH /api/v1/teacher/alerts/:id/acknowledge]
    card --> resolve[PATCH /api/v1/teacher/alerts/:id/resolve]
    card --> dismiss[PATCH /api/v1/teacher/alerts/:id/dismiss]
    ack --> service[InterventionAlertsService]
    resolve --> service
    dismiss --> service
    service --> db[(progress_tracking.student_intervention_alerts)]
    db --> ui[Estado alerta actualizado]
    page --> configPage[TeacherAlertConfigPage]
    configPage --> configApi[GET/POST/PUT /api/v1/teacher/alert-config]
    configApi --> configService[AlertConfigService]
    configService --> configDb[(progress_tracking.teacher_alert_configurations)]

    %% WebSocket Realtime Integration
    page --> monPage[TeacherMonitoringPage]
    monPage --> wsHook[useClassroomRealtime hook]
    wsHook --> wsConn{WebSocket disponible?}
    wsConn -- Si --> wsEvents[Socket.IO: 7 eventos en tiempo real]
    wsConn -- No --> wsFallback[Degradacion graciosa: polling periodico]
    wsEvents --> wsIndicator[Indicador conexion: verde/amarillo/rojo]
    wsEvents --> wsFeed[Live Activity Feed: 10 eventos recientes]
    wsEvents --> wsE1[exercise_started]
    wsEvents --> wsE2[exercise_completed]
    wsEvents --> wsE3[achievement_unlocked]
    wsEvents --> wsE4[level_up]
    wsEvents --> wsE5[student_online]
    wsEvents --> wsE6[student_offline]
    wsEvents --> wsE7[help_requested]
```

## 4. Secuencia FE -> BE -> DB

1. Docente abre `TeacherAlerts`, hook `useInterventionAlerts` ejecuta `GET /api/v1/teacher/alerts` con filtros (classroom, tipo, severidad, estado, busqueda).
2. Backend (`InterventionAlertsController`) valida permisos y filtra alertas de classrooms del docente.
3. `InterventionAlertsService` consulta `progress_tracking.student_intervention_alerts` con paginacion.
4. FE renderiza alertas en `InterventionAlertsPanel` con `AlertCard` para cada alerta.
5. Docente ejecuta accion:
   - **Acknowledge**: `PATCH /api/v1/teacher/alerts/:id/acknowledge` -- cambia estado a `acknowledged`.
   - **Resolve**: `PATCH /api/v1/teacher/alerts/:id/resolve` con `resolution_notes` -- cambia estado a `resolved`.
   - **Dismiss**: `PATCH /api/v1/teacher/alerts/:id/dismiss` -- cambia estado a `dismissed`.
6. Para historial de un estudiante: `GET /api/v1/teacher/alerts/student/:studentId/history`.
7. Para generar alertas manualmente (testing): `POST /api/v1/teacher/alerts/generate`.
8. Configuracion de umbrales en `TeacherAlertConfigPage` via `GET/POST/PUT/DELETE /api/v1/teacher/alert-config`.
9. FE aplica actualizaciones optimistas y refresca con `useInterventionAlerts.refresh()`.

### Flujo WebSocket: Monitoreo en Tiempo Real (TeacherMonitoringPage)

#### Paso 1: Conexion WebSocket
10. **Frontend:** `TeacherMonitoringPage.tsx` monta el hook `useClassroomRealtime(classroomId)`.
11. **Frontend:** `useClassroomRealtime` establece conexion Socket.IO al namespace `/classroom` con token JWT.
12. **Frontend:** Indicador de estado de conexion se muestra en la UI:
    - **Verde:** Conexion activa y recibiendo eventos.
    - **Amarillo:** Reconectando (intentos automaticos).
    - **Rojo:** Desconectado / WebSocket no disponible.

#### Paso 2: Recepcion de eventos en tiempo real
13. **Frontend:** El hook escucha 7 tipos de eventos WebSocket:

| Evento | Descripcion | Datos |
|--------|-------------|-------|
| `exercise_started` | Estudiante inicio un ejercicio | `{ studentId, exerciseId, exerciseType, timestamp }` |
| `exercise_completed` | Estudiante completo un ejercicio | `{ studentId, exerciseId, score, xpEarned, timestamp }` |
| `achievement_unlocked` | Estudiante desbloqueo un logro | `{ studentId, achievementId, achievementName, timestamp }` |
| `level_up` | Estudiante subio de nivel/rango | `{ studentId, newLevel, newRank, timestamp }` |
| `student_online` | Estudiante se conecto a la plataforma | `{ studentId, timestamp }` |
| `student_offline` | Estudiante se desconecto | `{ studentId, timestamp }` |
| `help_requested` | Estudiante solicito ayuda | `{ studentId, exerciseId, message, timestamp }` |

#### Paso 3: Live Activity Feed
14. **Frontend:** Los eventos se acumulan en un feed de actividad en vivo que muestra los **10 eventos mas recientes**.
15. **Frontend:** Cada evento se renderiza con icono, nombre del estudiante, descripcion de la accion y timestamp relativo.
16. **Frontend:** Los eventos de `help_requested` se destacan visualmente con badge de urgencia.

#### Paso 4: Degradacion graciosa
17. **Frontend:** Si WebSocket no esta disponible (error de conexion, servidor sin soporte, red inestable):
    - El indicador cambia a rojo con mensaje "Modo offline — datos pueden no estar actualizados".
    - El sistema cae a polling periodico (cada 30 segundos) via REST para mantener datos actualizados.
    - No se muestran errores disruptivos al usuario; la funcionalidad REST sigue operativa.

## 5. Componentes y artefactos implicados

| Capa | Archivo | Descripcion |
|------|---------|-------------|
| FE Page | `apps/frontend/src/apps/teacher/pages/TeacherAlerts.tsx` | Pagina principal de alertas |
| FE Page | `apps/frontend/src/apps/teacher/pages/TeacherAlertConfigPage.tsx` | Pagina de configuracion de alertas |
| FE Page | `apps/frontend/src/apps/teacher/pages/TeacherMonitoringPage.tsx` | Pagina de monitoreo de estudiantes |
| FE Component | `apps/frontend/src/apps/teacher/components/alerts/AlertCard.tsx` | Tarjeta individual de alerta |
| FE Component | `apps/frontend/src/apps/teacher/components/alerts/InterventionAlertsPanel.tsx` | Panel contenedor de alertas |
| FE Component | `apps/frontend/src/apps/teacher/components/monitoring/StudentMonitoringPanel.tsx` | Panel de monitoreo estudiantes |
| FE Component | `apps/frontend/src/apps/teacher/components/monitoring/StudentStatusCard.tsx` | Tarjeta de estado del estudiante |
| FE Component | `apps/frontend/src/apps/teacher/components/monitoring/StudentDetailModal.tsx` | Modal detalle estudiante |
| FE Component | `apps/frontend/src/apps/teacher/components/dashboard/StudentAlerts.tsx` | Alertas en dashboard docente |
| FE Hook | `apps/frontend/src/apps/teacher/hooks/useInterventionAlerts.ts` | Hook gestion de alertas |
| FE Hook | `apps/frontend/src/apps/teacher/hooks/useAlertConfig.ts` | Hook configuracion de alertas |
| FE Hook | `apps/frontend/src/apps/teacher/hooks/useStudentMonitoring.ts` | Hook monitoreo estudiantes |
| FE Hook | `apps/frontend/src/apps/teacher/hooks/useClassroomRealtime.ts` | Hook WebSocket para eventos en tiempo real del classroom (7 eventos) |
| FE API | `apps/frontend/src/services/api/teacher/interventionAlertsApi.ts` | Cliente API alertas |
| BE Controller | `apps/backend/src/modules/teacher/controllers/intervention-alerts.controller.ts` | 7 endpoints REST alertas |
| BE Controller | `apps/backend/src/modules/teacher/controllers/alert-config.controller.ts` | 7 endpoints REST configuracion |
| BE Service | `apps/backend/src/modules/teacher/services/intervention-alerts.service.ts` | Logica de negocio alertas |
| BE Service | `apps/backend/src/modules/teacher/services/alert-config.service.ts` | Logica de negocio configuracion |
| DB Table | `apps/database/ddl/schemas/progress_tracking/tables/19-student_intervention_alerts.sql` | Alertas de intervencion |
| DB Table | `apps/database/ddl/schemas/progress_tracking/tables/20-teacher_alert_configurations.sql` | Configuraciones de alerta |
| DB Table | `apps/database/ddl/schemas/progress_tracking/tables/17-teacher_interventions.sql` | Intervenciones docentes |
| DB Function | `apps/database/ddl/schemas/progress_tracking/functions/15-generate_student_alerts.sql` | Funcion generadora de alertas |
| DB Table | `apps/database/ddl/schemas/social_features/tables/03-classrooms.sql` | Aulas (filtro de visibilidad) |

## 6. Reglas y validaciones

| Regla | Detalle |
|-------|---------|
| RBAC | Solo roles `ADMIN_TEACHER` y `SUPER_ADMIN` pueden acceder a endpoints de alertas |
| Visibilidad por classroom | El docente solo ve alertas de estudiantes en sus classrooms asignados |
| Tenant isolation | Todas las consultas se filtran por `tenant_id` del usuario autenticado |
| Transicion de estados | `active` -> `acknowledged` -> `resolved`; o `active` -> `dismissed` |
| Notas obligatorias | La accion `resolve` requiere `resolution_notes` no vacio en el body |
| Alertas dismissed ocultas | Por defecto las consultas excluyen alertas en estado `dismissed` (flag `include_dismissed`) |
| Generacion automatica | Las alertas se generan via funcion SQL `generate_student_alerts()` ejecutada por cron o manualmente |
| Configuracion por classroom | Los umbrales pueden ser globales o especificos por classroom |
| WebSocket autenticado | La conexion Socket.IO requiere JWT valido como query param o header |
| WebSocket scoped | El hook `useClassroomRealtime` solo suscribe a eventos del classroom activo del docente |
| Feed limitado | El Live Activity Feed muestra maximo 10 eventos; los anteriores se descartan del buffer |
| Degradacion graciosa | Si WebSocket falla, el sistema cae a polling REST cada 30s sin notificar error al usuario |

## 7. Manejo de errores

| Escenario | Capa | Codigo HTTP | Comportamiento |
|-----------|------|-------------|----------------|
| Token JWT invalido o expirado | BE Guard | 401 Unauthorized | FE redirige a login, muestra mensaje de sesion expirada |
| Rol insuficiente (no es teacher) | BE Guard | 403 Forbidden | FE muestra toast "Sin permisos para acceder al classroom" |
| Alerta no encontrada | BE Service | 404 Not Found | FE muestra mensaje "Alerta no encontrada" |
| Alerta ya resuelta (doble resolve) | BE Service | 400 Bad Request | FE muestra toast "Esta alerta ya esta resuelta" |
| Solo se puede acknowledge alerta activa | BE Service | 400 Bad Request | FE muestra toast "Solo se pueden reconocer alertas activas" |
| Error de red / timeout | FE Hook | - | `useInterventionAlerts` establece `error` state, UI muestra banner con boton de reintento |
| WebSocket conexion rechazada | FE Hook | - | Indicador rojo, degradacion a polling REST cada 30s |
| WebSocket desconexion inesperada | FE Hook | - | Indicador amarillo, reconexion automatica (3 reintentos con backoff), luego rojo si falla |
| WebSocket JWT expirado | FE Hook | - | Desconexion automatica, indicador rojo, polling REST como fallback |

## 8. Trazabilidad cruzada

| Capa | Archivo | Evidencia |
|------|---------|-----------|
| Requerimiento | `docs/10-requirements/epics/EPIC-GAM-F3-NOTIFICATIONS/` | Epic de notificaciones |
| DDL | `apps/database/ddl/schemas/progress_tracking/tables/19-student_intervention_alerts.sql` | CREATE TABLE progress_tracking.student_intervention_alerts |
| DDL | `apps/database/ddl/schemas/progress_tracking/tables/20-teacher_alert_configurations.sql` | CREATE TABLE progress_tracking.teacher_alert_configurations |
| Controller | `apps/backend/src/modules/teacher/controllers/intervention-alerts.controller.ts` | @Controller('teacher/alerts') |
| Controller | `apps/backend/src/modules/teacher/controllers/alert-config.controller.ts` | @Controller('teacher/alert-config') |
| Frontend | `apps/frontend/src/apps/teacher/pages/TeacherAlerts.tsx` | Pagina de alertas |
| API Client | `apps/frontend/src/services/api/teacher/interventionAlertsApi.ts` | interventionAlertsApi |
| FE Hook (WebSocket) | `apps/frontend/src/apps/teacher/hooks/useClassroomRealtime.ts` | Hook Socket.IO para 7 eventos en tiempo real |
| FE Page (Monitoring) | `apps/frontend/src/apps/teacher/pages/TeacherMonitoringPage.tsx` | Pagina de monitoreo con WebSocket + indicador + feed |
| BE Gateway | `apps/backend/src/modules/websocket/gateways/` | WebSocket gateways para eventos de classroom |

## 9. Referencias

- Requerimiento: `EPIC-GAM-F3-NOTIFICATIONS`
- Matriz: `../TRACEABILITY-MATRIX.md`
- Cobertura total: `../COBERTURA-TOTAL-PROCESOS.md`
