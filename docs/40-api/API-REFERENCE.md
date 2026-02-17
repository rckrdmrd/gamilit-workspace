# API Reference - GAMILIT

**Version:** 1.0.0
**Fecha:** 2026-02-07
**Total Endpoints:** 899
**Base URL:** http://localhost:3006 (dev) | https://api.gamilit.com (prod)
**Auth:** JWT Bearer Token
**Format:** JSON

---

## Trazabilidad de Flujos End-to-End

Para validar los endpoints dentro de procesos funcionales completos (UI -> API -> datos), ver:

- [docs/30-ux-ui/flujos/README.md](../30-ux-ui/flujos/README.md)
- [docs/30-ux-ui/flujos/TRACEABILITY-MATRIX.md](../30-ux-ui/flujos/TRACEABILITY-MATRIX.md)
- [docs/30-ux-ui/flujos/COBERTURA-TOTAL-PROCESOS.md](../30-ux-ui/flujos/COBERTURA-TOTAL-PROCESOS.md)
- [docs/30-ux-ui/flujos/AUDITORIA-RESIDUAL-FULL.md](../30-ux-ui/flujos/AUDITORIA-RESIDUAL-FULL.md)

> Nota de cobertura total (2026-02-17): los endpoints del portal `parents/*` quedaron trazados y planificados en la oleada full.
> La consolidacion completa del contrato API de parents se gestiona en:
> `orchestration/tareas/TASK-2026-02-17-CIERRE-RIESGOS-RESIDUALES-FULL/02-PLAN-IMPLEMENTACION-ISSUES.md` (`ISSUE-FULL-PLAN-001`).

---

## Autenticacion

Todos los endpoints (excepto login/register) requieren un header de autorizacion:
```
Authorization: Bearer <jwt_token>
```

---

## 1. Auth Module (~45 endpoints)

### Autenticacion
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | /auth/register | Registrar nuevo usuario | No |
| POST | /auth/login | Login con email/password | No |
| POST | /auth/refresh | Renovar access token | Refresh |
| POST | /auth/logout | Cerrar sesion | Si |
| POST | /auth/logout-all | Cerrar todas las sesiones | Si |
| GET | /auth/profile | Obtener perfil del usuario actual | Si |
| PATCH | /auth/profile | Actualizar perfil | Si |
| POST | /auth/forgot-password | Solicitar reset de password | No |
| POST | /auth/reset-password | Ejecutar reset de password | No |
| PATCH | /auth/change-password | Cambiar password (logueado) | Si |

### OAuth
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /auth/oauth/google | Iniciar OAuth Google | No |
| GET | /auth/oauth/google/callback | Callback OAuth Google | No |
| GET | /auth/oauth/connections | Listar conexiones OAuth | Si |
| DELETE | /auth/oauth/connections/:id | Eliminar conexion OAuth | Si |

### Sessions
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /auth/sessions | Listar sesiones activas | Si |
| DELETE | /auth/sessions/:id | Cerrar sesion especifica | Si |

---

## 2. Users Module (~35 endpoints)

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| GET | /users | Listar usuarios (paginado) | Si | admin |
| GET | /users/:id | Obtener usuario por ID | Si | admin/self |
| POST | /users | Crear usuario | Si | admin |
| PATCH | /users/:id | Actualizar usuario | Si | admin/self |
| DELETE | /users/:id | Desactivar usuario (soft) | Si | admin |
| GET | /users/search | Buscar usuarios | Si | admin/teacher |
| POST | /users/bulk-import | Importar usuarios (CSV) | Si | admin |
| GET | /users/:id/roles | Obtener roles del usuario | Si | admin |
| PATCH | /users/:id/roles | Actualizar roles | Si | admin |
| GET | /users/me | Alias para perfil actual | Si | any |

---

## 3. Tenants Module (~20 endpoints)

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| GET | /tenants | Listar tenants | Si | super_admin |
| GET | /tenants/:id | Obtener tenant | Si | admin |
| POST | /tenants | Crear tenant (escuela) | Si | super_admin |
| PATCH | /tenants/:id | Actualizar tenant | Si | admin |
| GET | /tenants/:id/settings | Configuracion del tenant | Si | admin |
| PATCH | /tenants/:id/settings | Actualizar configuracion | Si | admin |
| GET | /tenants/:id/members | Miembros del tenant | Si | admin |
| GET | /tenants/:id/stats | Estadisticas del tenant | Si | admin |

---

## 4. Modules (Educational) (~20 endpoints)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /modules | Listar 5 modulos educativos | Si |
| GET | /modules/:id | Detalle de modulo | Si |
| GET | /modules/:id/progress | Progreso del estudiante en modulo | Si |
| GET | /modules/:id/exercises | Ejercicios del modulo | Si |
| POST | /modules/:id/unlock | Desbloquear modulo (si cumple requisitos) | Si |
| GET | /modules/progress/summary | Resumen de progreso en todos los modulos | Si |

---

## 5. Exercises Module (~50 endpoints)

### CRUD
| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| GET | /exercises | Listar ejercicios (paginado, filtros) | Si | any |
| GET | /exercises/:id | Detalle de ejercicio | Si | any |
| POST | /exercises | Crear ejercicio | Si | admin/teacher |
| PATCH | /exercises/:id | Actualizar ejercicio | Si | admin/teacher |
| DELETE | /exercises/:id | Eliminar ejercicio | Si | admin |
| GET | /exercises/types | Listar 23 tipos de ejercicio | Si | any |

### Interaccion
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | /exercises/:id/start | Iniciar intento de ejercicio | Si |
| POST | /exercises/:id/submit | Enviar respuesta | Si |
| GET | /exercises/:id/result | Obtener resultado de intento | Si |
| GET | /exercises/:id/attempts | Historial de intentos | Si |
| GET | /exercises/:id/feedback | Obtener retroalimentacion | Si |

### Spaced Repetition
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /exercises/spaced-repetition/due | Ejercicios pendientes de repeticion | Si |
| POST | /exercises/spaced-repetition/schedule | Programar repeticion | Si |

### Asignaciones
| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| POST | /exercises/assign | Asignar ejercicio a aula/estudiantes | Si | teacher |
| GET | /exercises/assignments | Listar asignaciones | Si | teacher |
| GET | /exercises/assignments/:id | Detalle de asignacion | Si | teacher |

---

## 6. Gamification Module (~35 endpoints)

### XP
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /gamification/xp | XP total del estudiante actual | Si |
| GET | /gamification/xp/history | Historial de transacciones XP | Si |
| GET | /gamification/xp/daily | XP ganado hoy | Si |
| POST | /gamification/xp/award | Otorgar XP (interno/admin) | Si |

### Levels & Ranks
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /gamification/level | Nivel actual del estudiante | Si |
| GET | /gamification/levels | Definicion de todos los niveles | Si |
| GET | /gamification/rank | Rango maya actual | Si |
| GET | /gamification/ranks | Definicion de los 5 rangos | Si |

### Dashboard
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /gamification/dashboard | Dashboard completo de gamificacion | Si |
| GET | /gamification/stats | Estadisticas de gamificacion | Si |
| GET | /gamification/streak | Racha actual de dias | Si |

---

## 7. Leaderboard Module (~20 endpoints)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /leaderboard/classroom/:id | Ranking del aula | Si |
| GET | /leaderboard/school | Ranking de la escuela | Si |
| GET | /leaderboard/global | Ranking global | Si |
| GET | /leaderboard/module/:moduleId | Ranking por modulo | Si |
| GET | /leaderboard/seasons | Listar temporadas | Si |
| GET | /leaderboard/seasons/current | Temporada actual | Si |
| GET | /leaderboard/seasons/:id/results | Resultados de temporada | Si |
| GET | /leaderboard/me | Posicion del estudiante actual | Si |

---

## 8. Missions Module (~25 endpoints)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /missions/daily | Misiones diarias disponibles | Si |
| GET | /missions/weekly | Misiones semanales disponibles | Si |
| GET | /missions/quests | Quests especiales activas | Si |
| GET | /missions/:id | Detalle de mision | Si |
| GET | /missions/:id/progress | Progreso en mision | Si |
| POST | /missions/:id/claim | Reclamar recompensa | Si |
| GET | /missions/completed | Misiones completadas | Si |
| GET | /missions/history | Historial de misiones | Si |

---

## 9. Store Module (~20 endpoints)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /store/items | Catalogo de items | Si |
| GET | /store/items/:id | Detalle de item | Si |
| GET | /store/categories | Categorias de items | Si |
| POST | /store/purchase | Comprar item con ML Coins | Si |
| GET | /store/balance | Saldo de ML Coins | Si |
| GET | /store/inventory | Inventario del estudiante | Si |
| POST | /store/inventory/:id/equip | Equipar item | Si |
| POST | /store/inventory/:id/use | Usar item consumible | Si |
| GET | /store/transactions | Historial de compras | Si |

---

## 10. Classrooms Module (~25 endpoints)

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| GET | /classrooms | Listar aulas | Si | teacher/admin |
| GET | /classrooms/:id | Detalle de aula | Si | teacher/admin |
| POST | /classrooms | Crear aula | Si | admin |
| PATCH | /classrooms/:id | Actualizar aula | Si | teacher/admin |
| GET | /classrooms/:id/students | Estudiantes del aula | Si | teacher |
| POST | /classrooms/:id/students | Agregar estudiantes | Si | teacher/admin |
| DELETE | /classrooms/:id/students/:studentId | Remover estudiante | Si | admin |
| GET | /classrooms/:id/stats | Estadisticas del aula | Si | teacher |
| GET | /classrooms/:id/progress | Progreso del aula | Si | teacher |

---

## 11. Students Module (~30 endpoints)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /students/:id/profile | Perfil del estudiante | Si |
| GET | /students/:id/progress | Progreso general | Si |
| GET | /students/:id/progress/module/:moduleId | Progreso por modulo | Si |
| GET | /students/:id/stats | Estadisticas de engagement | Si |
| GET | /students/:id/history | Historial de actividades | Si |
| GET | /students/:id/gamification | Estado de gamificacion | Si |
| GET | /students/:id/achievements | Logros desbloqueados | Si |

---

## 12. Teachers Module (~30 endpoints)

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| GET | /teachers/dashboard | Dashboard del maestro | Si | teacher |
| GET | /teachers/classrooms | Aulas del maestro | Si | teacher |
| POST | /teachers/assignments | Crear asignacion | Si | teacher |
| GET | /teachers/assignments | Listar asignaciones | Si | teacher |
| GET | /teachers/reviews/pending | Ejercicios pendientes de revision | Si | teacher |
| POST | /teachers/reviews/:id | Evaluar ejercicio manualmente | Si | teacher |
| GET | /teachers/reports/classroom/:id | Reporte de aula | Si | teacher |
| GET | /teachers/reports/student/:id | Reporte de estudiante | Si | teacher |

---

## 13. Parents Portal Module (~18 endpoints)

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| POST | /parent-portal/auth/register | Registro de padres | No | parent |
| POST | /parent-portal/auth/login | Login de padres | No | parent |
| POST | /parent-portal/auth/refresh | Refresh token | Si | parent |
| POST | /parent-portal/auth/forgot-password | Solicitar reset | No | parent |
| POST | /parent-portal/auth/reset-password | Reset de password | No | parent |
| POST | /parent-portal/auth/verify-email | Verificar email | No | parent |
| POST | /parent-portal/auth/logout | Logout | Si | parent |
| GET | /parent-portal/dashboard | Dashboard de padres | Si | parent |
| GET | /parent-portal/students | Hijos vinculados | Si | parent |
| POST | /parent-portal/students/link | Vincular con estudiante | Si | parent |
| POST | /parent-portal/students/verify | Verificar vinculacion | Si | parent |
| GET | /parent-portal/students/:id/progress | Progreso del hijo | Si | parent |
| GET | /parent-portal/students/:id/activities | Actividad reciente | Si | parent |
| GET | /parent-portal/notifications | Notificaciones | Si | parent |
| PATCH | /parent-portal/notifications/:id/read | Marcar leida | Si | parent |
| GET | /parent-portal/notifications/unread-count | No leidas | Si | parent |
| GET | /parent-portal/reports/weekly | Reporte semanal | Si | parent |
| GET | /parent-portal/reports/weekly/:studentId | Reporte semanal por estudiante | Si | parent |

---

## 14. Analytics Module (~25 endpoints)

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| GET | /analytics/student/:id | Analytics de estudiante | Si | teacher/admin |
| GET | /analytics/classroom/:id | Analytics de aula | Si | teacher/admin |
| GET | /analytics/school | Analytics de escuela | Si | admin |
| GET | /analytics/engagement | Metricas de engagement | Si | admin |
| GET | /analytics/completion-rates | Tasas de completitud | Si | admin |
| GET | /analytics/dau | Daily Active Users | Si | admin |
| GET | /analytics/retention | Retention metrics | Si | admin |
| GET | /analytics/module/:id | Analytics por modulo | Si | teacher/admin |

---

## 15. Content Module (~30 endpoints)

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| GET | /content | Listar contenido (paginado) | Si | any |
| GET | /content/:id | Detalle de contenido | Si | any |
| POST | /content | Crear contenido | Si | admin/teacher |
| PATCH | /content/:id | Actualizar contenido | Si | admin/teacher |
| DELETE | /content/:id | Eliminar contenido | Si | admin |
| GET | /content/search | Busqueda full-text | Si | any |
| GET | /content/categories | Listar categorias | Si | any |
| POST | /content/:id/version | Crear nueva version | Si | admin |
| GET | /content/:id/versions | Historial de versiones | Si | admin |

---

## 16. Notifications Module (~25 endpoints)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /notifications | Listar notificaciones | Si |
| GET | /notifications/unread | Notificaciones no leidas | Si |
| GET | /notifications/count | Contador de no leidas | Si |
| PATCH | /notifications/:id/read | Marcar como leida | Si |
| POST | /notifications/read-all | Marcar todas como leidas | Si |
| DELETE | /notifications/:id | Eliminar notificacion | Si |
| GET | /notifications/preferences | Preferencias de notificacion | Si |
| PATCH | /notifications/preferences | Actualizar preferencias | Si |
| POST | /notifications/send | Enviar notificacion (admin/teacher) | Si |

---

## 17. Reports Module (~20 endpoints)

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| GET | /reports/templates | Listar templates | Si | admin |
| POST | /reports/generate | Generar reporte | Si | teacher/admin |
| GET | /reports/:id | Obtener reporte | Si | teacher/admin/parent |
| GET | /reports/:id/download | Descargar PDF/Excel | Si | teacher/admin/parent |
| GET | /reports/student/:id | Reporte de estudiante | Si | teacher/admin/parent |
| GET | /reports/classroom/:id | Reporte de aula | Si | teacher/admin |
| POST | /reports/schedule | Programar reporte | Si | teacher/admin |

---

## 18. Achievements Module (~20 endpoints)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /achievements | Catalogo de logros | Si |
| GET | /achievements/:id | Detalle de logro | Si |
| GET | /achievements/my | Logros del estudiante actual | Si |
| GET | /achievements/my/recent | Logros recientes | Si |
| GET | /achievements/progress | Progreso hacia logros | Si |
| GET | /achievements/showcase | Logros en showcase del perfil | Si |
| PATCH | /achievements/showcase | Configurar showcase | Si |

---

## 19. Social Module (~20 endpoints)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /social/feed | Feed de actividad social | Si |
| GET | /social/teams | Equipos del estudiante | Si |
| POST | /social/teams | Crear equipo | Si |
| POST | /social/teams/:id/join | Unirse a equipo | Si |
| GET | /social/teams/:id/members | Miembros del equipo | Si |
| POST | /social/reactions | Dar reaccion | Si |
| GET | /social/forums/:classroomId | Foro del aula | Si |
| POST | /social/forums/:classroomId/posts | Crear post | Si |

---

## 20. Settings Module (~15 endpoints)

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| GET | /settings | Configuracion del sistema | Si | admin |
| PATCH | /settings | Actualizar configuracion | Si | admin |
| GET | /settings/features | Feature flags | Si | admin |
| PATCH | /settings/features/:flag | Toggle feature | Si | admin |
| GET | /settings/gamification | Parametros de gamificacion | Si | admin |
| PATCH | /settings/gamification | Actualizar parametros | Si | admin |

---

## 21. Health Module (3 endpoints)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /health | Health check general | No |
| GET | /health/ready | Readiness check | No |
| GET | /health/live | Liveness check | No |

---

## 22. Core Module

No expone endpoints propios. Provee utilidades compartidas a otros modulos.

---

## WebSocket (Socket.IO)

### Namespaces

| Namespace | Eventos | Descripcion |
|-----------|---------|-------------|
| /gamification | xp-updated, achievement-unlocked, rank-promoted, leaderboard-updated | Actualizaciones de gamificacion |
| /notifications | notification, notification-count | Notificaciones en tiempo real |
| /progress | progress-updated, module-unlocked | Actualizaciones de progreso |

### Eventos del Servidor (emitidos)

```javascript
// Gamification
socket.emit('xp-updated', { studentId, amount, total, source })
socket.emit('achievement-unlocked', { studentId, achievementId, name, icon })
socket.emit('rank-promoted', { studentId, newRank, title })
socket.emit('leaderboard-updated', { classroomId, rankings })

// Notifications
socket.emit('notification', { id, type, title, message, priority })
socket.emit('notification-count', { unread: number })

// Progress
socket.emit('progress-updated', { studentId, moduleId, percentage })
socket.emit('module-unlocked', { studentId, moduleId })
```

### Autenticacion WebSocket
```javascript
const socket = io('ws://localhost:3006/gamification', {
  auth: { token: 'Bearer <jwt_token>' }
});
```

---

## Error Handling

### Formato de Error
```json
{
  "statusCode": 400,
  "message": "Descripcion del error",
  "error": "Bad Request",
  "timestamp": "2026-02-07T00:00:00.000Z",
  "path": "/api/endpoint"
}
```

### Codigos HTTP
| Codigo | Significado |
|--------|-------------|
| 200 | OK |
| 201 | Created |
| 204 | No Content |
| 400 | Bad Request (validacion) |
| 401 | Unauthorized (no autenticado) |
| 403 | Forbidden (sin permisos) |
| 404 | Not Found |
| 409 | Conflict |
| 429 | Too Many Requests (rate limit) |
| 500 | Internal Server Error |

---

## Rate Limiting

**Limite:** 100 requests/minuto por IP
**Header:** `X-RateLimit-Remaining`, `X-RateLimit-Reset`

---

## Swagger / OpenAPI

**URL:** http://localhost:3006/api-docs

Documentacion interactiva generada automaticamente desde decorators NestJS (@ApiTags, @ApiOperation, @ApiResponse).

---

*GAMILIT - API Reference*
*899 endpoints | 22 modulos | JWT Auth | Socket.IO Real-time*
