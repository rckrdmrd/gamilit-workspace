# API Reference - GAMILIT

**Version:** 1.0.0
**Fecha:** 2026-02-07
**Total Endpoints:** 912
**Base URL:** http://localhost:3006 (dev) | https://api.gamilit.com (prod)
**Auth:** JWT Bearer Token
**Format:** JSON

> **Nota:** Este documento cubre ~669 de 912 endpoints totales (incluyendo ~159 del modulo Admin, ~141 Social, ~103 Content, ~42 LTI, ~18 Assignments, +32 Notifications Extended). Para el inventario completo, consultar orchestration/inventarios/BACKEND_INVENTORY.yml

---

## Trazabilidad de Flujos End-to-End

Para validar los endpoints dentro de procesos funcionales completos (UI -> API -> datos), ver:

- [docs/30-ux-ui/flujos/README.md](../30-ux-ui/flujos/README.md)
- [docs/30-ux-ui/flujos/TRACEABILITY-MATRIX.md](../30-ux-ui/flujos/TRACEABILITY-MATRIX.md)
- [docs/30-ux-ui/flujos/COBERTURA-TOTAL-PROCESOS.md](../30-ux-ui/flujos/COBERTURA-TOTAL-PROCESOS.md)
- [docs/30-ux-ui/flujos/AUDITORIA-RESIDUAL-FULL.md](../30-ux-ui/flujos/AUDITORIA-RESIDUAL-FULL.md)
- [ENDPOINTS-INVENTORY-EQUIP.md](./ENDPOINTS-INVENTORY-EQUIP.md)

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
| DELETE | /auth/sessions | Cerrar todas las sesiones | Si |
| GET | /auth/profile | Obtener perfil del usuario actual | Si |
| PUT | /auth/profile | Actualizar perfil | Si |
| POST | /auth/reset-password/request | Solicitar reset de password | No |
| POST | /auth/reset-password | Ejecutar reset de password | No |
| PUT | /auth/change-password | Cambiar password (logueado) | Si |

### OAuth
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /auth/oauth/google | Iniciar OAuth Google | No |
| GET | /auth/oauth/google/callback | Callback OAuth Google | No |
| GET | /auth/oauth/connections | Listar conexiones OAuth | Si |
| DELETE | /auth/oauth/connections/:id | Eliminar conexion OAuth | Si |

### Verificacion de Email
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | /auth/verify-email | Verificar email con token | No |
| POST | /auth/verify-email/resend | Reenviar email de verificacion | JWT |
| GET | /auth/verify-email/status | Consultar estado de verificacion | JWT |

### Recuperacion de Password
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /auth/reset-password/validate | Validar token de reset (query: ?token=) | No |

> **Nota:** `POST /auth/reset-password/request` y `POST /auth/reset-password` ya listados en la tabla de Autenticacion arriba.

### Sessions
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /auth/sessions | Listar sesiones activas | JWT |
| DELETE | /auth/sessions/:id | Cerrar sesion especifica | JWT |

### Autenticacion de Dos Factores (2FA)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /auth/2fa/status | Estado de 2FA del usuario | JWT |
| POST | /auth/2fa/setup | Iniciar configuracion 2FA (body: method=email\|sms\|authenticator) | JWT |
| POST | /auth/2fa/setup/verify | Verificar y completar configuracion 2FA (retorna backup codes) | JWT |
| POST | /auth/2fa/verify | Verificar codigo 2FA durante login (body: userId, code) | No |
| POST | /auth/2fa/disable | Deshabilitar 2FA (body: password para confirmar) | JWT |
| POST | /auth/2fa/resend | Reenviar codigo 2FA (body: userId) | No |

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

## 5.5 Exercise Validation Module (21 endpoints)

> **Guard:** `JwtAuthGuard` en todos los endpoints
> **Prefijo base:** `/api/v1/educational/validation`
> **Controller:** `ExerciseValidationController` en `apps/backend/src/modules/educational/controllers/exercise-validation.controller.ts`

### Rubrics — Rubricas de Ejercicio (8 endpoints)

| Method | Endpoint | Description | Auth | Roles |
|--------|----------|-------------|------|-------|
| GET | `/api/v1/educational/validation/rubrics` | Listar todas las rubricas por tipo de ejercicio | Si | teacher/admin |
| GET | `/api/v1/educational/validation/rubrics/:id` | Obtener rubrica por ID | Si | teacher/admin |
| GET | `/api/v1/educational/validation/rubrics/exercise-type/:exerciseType` | Obtener rubrica por tipo de ejercicio (por defecto) | Si | teacher/admin |
| GET | `/api/v1/educational/validation/rubrics/module/:moduleCode` | Obtener rubricas por codigo de modulo (M3, M4, M5) | Si | teacher/admin |
| POST | `/api/v1/educational/validation/rubrics` | Crear nueva rubrica | Si | admin |
| PUT | `/api/v1/educational/validation/rubrics/:id` | Actualizar rubrica existente | Si | admin |
| DELETE | `/api/v1/educational/validation/rubrics/:id` | Eliminar rubrica | Si | admin |
| POST | `/api/v1/educational/validation/rubrics/:id/set-default` | Establecer rubrica como default para su tipo de ejercicio | Si | admin |

### Validation Configs — Configuracion de Validacion (6 endpoints)

| Method | Endpoint | Description | Auth | Roles |
|--------|----------|-------------|------|-------|
| GET | `/api/v1/educational/validation/configs` | Listar todas las configuraciones de validacion | Si | admin |
| GET | `/api/v1/educational/validation/configs/:id` | Obtener configuracion de validacion por ID | Si | admin |
| GET | `/api/v1/educational/validation/configs/exercise-type/:exerciseType` | Obtener configuracion por tipo de ejercicio | Si | admin |
| POST | `/api/v1/educational/validation/configs` | Crear o actualizar configuracion de validacion (upsert) | Si | admin |
| DELETE | `/api/v1/educational/validation/configs/:id` | Eliminar configuracion de validacion | Si | admin |
| GET | `/api/v1/educational/validation/configs/functions/available` | Obtener funciones SQL de validacion disponibles | Si | admin |

### Audit — Auditoria de Validacion (7 endpoints)

| Method | Endpoint | Description | Auth | Roles |
|--------|----------|-------------|------|-------|
| GET | `/api/v1/educational/validation/audit` | Consultar registros de auditoria con filtros y paginacion | Si | admin |
| GET | `/api/v1/educational/validation/audit/:id` | Obtener registro de auditoria por ID | Si | admin |
| GET | `/api/v1/educational/validation/audit/exercise/:exerciseId` | Obtener registros de auditoria por ejercicio | Si | teacher/admin |
| GET | `/api/v1/educational/validation/audit/user/:userId` | Obtener registros de auditoria por usuario | Si | admin |
| GET | `/api/v1/educational/validation/audit/discrepancies` | Obtener registros con discrepancias detectadas | Si | admin |
| GET | `/api/v1/educational/validation/audit/exercise/:exerciseId/stats` | Obtener estadisticas de validacion de un ejercicio | Si | teacher/admin |
| POST | `/api/v1/educational/validation/audit/:id/discrepancy` | Marcar discrepancia en un registro de auditoria | Si | admin |

---

## 6. Gamification Module (73 endpoints)

> Rutas reales extraidas de los 11 controladores. Base URL: `/api/v1`. Todos los endpoints requieren JWT salvo indicacion contraria.

### Achievements (9 endpoints)
| Method | Endpoint | Description | Auth | Roles |
|--------|----------|-------------|------|-------|
| GET | `/api/v1/gamification/achievements` | Listar todos los achievements disponibles | Si | any |
| GET | `/api/v1/gamification/achievements/:id` | Detalle de achievement por ID | Si | any |
| GET | `/api/v1/gamification/achievements/user/:userId/progress/:achievementId` | Progreso de un achievement para un usuario | Si | any |
| POST | `/api/v1/gamification/achievements/user/:userId/unlock/:achievementId` | Desbloquear achievement manualmente (admin) | Si | admin |
| GET | `/api/v1/gamification/users/:userId/achievements` | Todos los achievements del usuario (completados, en progreso, bloqueados) | Si | any |
| GET | `/api/v1/gamification/users/:userId/achievements/summary` | Resumen estadistico de achievements del usuario | Si | any |
| POST | `/api/v1/gamification/users/:userId/achievements/:achievementId` | Otorgar o actualizar progreso de achievement | Si | any |
| POST | `/api/v1/gamification/users/:userId/achievements/:achievementId/claim` | Reclamar recompensas de achievement completado | Si | any |
| PATCH | `/api/v1/gamification/achievements/:id` | Activar/desactivar achievement (toggle is_active) | Si | admin |

### Leaderboard (5 endpoints)
| Method | Endpoint | Description | Auth | Roles |
|--------|----------|-------------|------|-------|
| GET | `/api/v1/gamification/leaderboard/global` | Ranking global de todos los usuarios por XP | Si | any |
| GET | `/api/v1/gamification/leaderboards/user-rank` | Posicion del usuario autenticado en el leaderboard | Si | any |
| GET | `/api/v1/gamification/leaderboard/schools/:schoolId` | Ranking de una escuela por XP | Si | any |
| GET | `/api/v1/gamification/leaderboard/classrooms/:classroomId` | Ranking de un aula por XP | Si | any |
| GET | `/api/v1/gamification/leaderboard/friends/:userId` | Ranking de amigos de un usuario por XP | Si | any |

### User Stats (4 endpoints)
| Method | Endpoint | Description | Auth | Roles |
|--------|----------|-------------|------|-------|
| GET | `/api/v1/gamification/users/:userId/stats` | Estadisticas completas de gamificacion del usuario | Si | any |
| GET | `/api/v1/gamification/users/:userId/summary` | Resumen consolidado: nivel, XP, coins, rango, achievements | Si | any |
| GET | `/api/v1/gamification/users/:userId/rank` | Rango maya actual y progreso hacia el siguiente | Si | any |
| PATCH | `/api/v1/gamification/users/:userId/stats` | Actualizar estadisticas del usuario (XP, nivel, racha, etc.) | Si | any |

### Ranks — Rangos Maya (12 endpoints)
| Method | Endpoint | Description | Auth | Roles |
|--------|----------|-------------|------|-------|
| GET | `/api/v1/gamification/ranks` | Listar todos los rangos maya con metadata | No | public |
| GET | `/api/v1/gamification/ranks/current` | Rango actual del usuario autenticado | Si | any |
| GET | `/api/v1/gamification/ranks/users/:userId/rank-progress` | Progreso hacia el siguiente rango | Si | any |
| GET | `/api/v1/gamification/ranks/users/:userId/progress` | Progreso completo (nivel, XP, rango, multiplicadores, streaks) | Si | any |
| GET | `/api/v1/gamification/ranks/users/:userId/multipliers` | Desglose completo de multiplicadores (rango, racha, eventos) | Si | any |
| GET | `/api/v1/gamification/ranks/users/:userId/rank-history` | Historial completo de rangos del usuario | Si | any |
| GET | `/api/v1/gamification/ranks/check-promotion/:userId` | Verificar elegibilidad para promocion de rango | Si | any |
| POST | `/api/v1/gamification/ranks/promote/:userId` | Promocionar usuario al siguiente rango maya | Si | any |
| GET | `/api/v1/gamification/ranks/:id` | Detalle de un registro de rango por ID | No | public |
| POST | `/api/v1/gamification/ranks/admin/ranks` | Crear registro de rango manualmente | Si | admin, super_admin |
| PUT | `/api/v1/gamification/ranks/admin/ranks/:id` | Actualizar registro de rango | Si | admin, super_admin |
| DELETE | `/api/v1/gamification/ranks/admin/ranks/:id` | Eliminar registro de rango | Si | admin, super_admin |

### ML Coins — Economia Virtual (8 endpoints)
| Method | Endpoint | Description | Auth | Roles |
|--------|----------|-------------|------|-------|
| GET | `/api/v1/gamification/users/:userId/ml-coins` | Balance actual y estadisticas de ML Coins | Si | any |
| GET | `/api/v1/gamification/users/:userId/ml-coins/transactions` | Historial de transacciones de ML Coins (paginado) | Si | any |
| POST | `/api/v1/gamification/users/:userId/ml-coins/add` | Agregar ML Coins al balance del usuario | Si | any |
| POST | `/api/v1/gamification/users/:userId/ml-coins/spend` | Gastar ML Coins con validacion de saldo | Si | any |
| GET | `/api/v1/gamification/users/:userId/ml-coins/multiplier` | Informacion del multiplicador de rango actual | Si | any |
| GET | `/api/v1/gamification/ml-coins/multiplier-table` | Tabla completa de multiplicadores por rango | Si | any |
| GET | `/api/v1/gamification/users/:userId/ml-coins/calculate` | Calcular ML Coins con multiplicador de rango (?baseAmount=N) | Si | any |
| POST | `/api/v1/gamification/users/:userId/ml-coins/add-with-multiplier` | Agregar ML Coins aplicando multiplicador de rango automaticamente | Si | any |

### Missions — Misiones (8 endpoints)
| Method | Endpoint | Description | Auth | Roles |
|--------|----------|-------------|------|-------|
| GET | `/api/v1/gamification/missions/daily` | Misiones diarias del usuario autenticado (genera si no existen) | Si | any |
| GET | `/api/v1/gamification/missions/weekly` | Misiones semanales del usuario autenticado (genera si no existen) | Si | any |
| GET | `/api/v1/gamification/missions/special` | Misiones especiales activas del usuario autenticado | Si | any |
| GET | `/api/v1/gamification/missions/stats/me` | Estadisticas de misiones del usuario autenticado | Si | any |
| GET | `/api/v1/gamification/missions/stats/:userId` | Estadisticas de misiones de un usuario especifico | Si | any |
| POST | `/api/v1/gamification/missions/:id/start` | Iniciar una mision (status → in_progress) | Si | any |
| PATCH | `/api/v1/gamification/missions/:id/progress` | Actualizar progreso de un objetivo de la mision | Si | any |
| POST | `/api/v1/gamification/missions/:id/claim` | Reclamar recompensas de mision completada (XP, ML Coins, rango) | Si | any |

### Mission Templates — Admin (6 endpoints)
| Method | Endpoint | Description | Auth | Roles |
|--------|----------|-------------|------|-------|
| GET | `/api/v1/admin/mission-templates` | Listar templates con filtros (type, difficulty, is_active, etc.) | Si | admin |
| GET | `/api/v1/admin/mission-templates/:id` | Obtener template por ID | Si | admin |
| POST | `/api/v1/admin/mission-templates` | Crear nuevo template de mision | Si | admin |
| PATCH | `/api/v1/admin/mission-templates/:id` | Actualizar template existente (partial update) | Si | admin |
| DELETE | `/api/v1/admin/mission-templates/:id` | Desactivar template (soft delete) | Si | admin |
| POST | `/api/v1/admin/mission-templates/seed/initial` | Sembrar templates iniciales en la base de datos | Si | admin |

### Classroom Missions — Misiones de Aula (5 endpoints)

> **Controller:** `ClassroomMissionsController` en `apps/backend/src/modules/gamification/controllers/classroom-missions.controller.ts`

| Method | Endpoint | Description | Auth | Roles |
|--------|----------|-------------|------|-------|
| POST | `/api/v1/gamification/classrooms/:classroomId/missions` | Asignar mision a un aula (con bonificaciones opcionales) | Si | teacher |
| GET | `/api/v1/gamification/classrooms/:classroomId/missions` | Listar todas las misiones del aula | Si | teacher/student |
| GET | `/api/v1/gamification/classrooms/:classroomId/missions/:missionTemplateId` | Obtener mision especifica del aula | Si | teacher/student |
| DELETE | `/api/v1/gamification/classrooms/:classroomId/missions/:missionTemplateId` | Remover (desactivar) mision del aula | Si | teacher |
| PATCH | `/api/v1/gamification/classrooms/:classroomId/missions/:missionTemplateId` | Actualizar configuracion de mision del aula | Si | teacher |

### Shop — Tienda (6 endpoints)
| Method | Endpoint | Description | Auth | Roles |
|--------|----------|-------------|------|-------|
| GET | `/api/v1/gamification/shop/categories` | Listar categorias activas de la tienda | Si | any |
| GET | `/api/v1/gamification/shop/items` | Listar items con filtros opcionales (category, rarity, available) | Si | any |
| GET | `/api/v1/gamification/shop/items/:id` | Detalle de item por ID | Si | any |
| POST | `/api/v1/gamification/shop/purchase` | Comprar item con ML Coins (valida stock, saldo, requisitos) | Si | any |
| GET | `/api/v1/gamification/shop/purchases/:userId` | Historial de compras del usuario | Si | any |
| GET | `/api/v1/gamification/shop/owned/:userId/:itemId` | Verificar si usuario posee un item | Si | any |

### Inventory — Equipamiento Cosmetico (4 endpoints)
| Method | Endpoint | Description | Auth | Roles |
|--------|----------|-------------|------|-------|
| GET | `/api/v1/gamification/inventory/equipped/batch` | Items equipados de multiples usuarios (?userIds=uuid1,uuid2) | Si | any |
| GET | `/api/v1/gamification/inventory/equipped` | Items equipados del usuario autenticado (skins activos) | Si | any |
| POST | `/api/v1/gamification/inventory/equip` | Equipar item cosmetico (requiere ownership) | Si | any |
| POST | `/api/v1/gamification/inventory/unequip` | Desequipar item cosmetico | Si | any |

> Ver contrato completo, validaciones y errores en [ENDPOINTS-INVENTORY-EQUIP.md](./ENDPOINTS-INVENTORY-EQUIP.md).

### Comodines — Power-ups (6 endpoints)
| Method | Endpoint | Description | Auth | Roles |
|--------|----------|-------------|------|-------|
| GET | `/api/v1/gamification/comodines` | Catalogo de comodines disponibles (precios, efectos) | Si | any |
| POST | `/api/v1/gamification/comodines/purchase` | Comprar comodines con ML Coins (PISTAS 15, VISION_LECTORA 25, SEGUNDA_OPORTUNIDAD 40) | Si | any |
| POST | `/api/v1/gamification/comodines/use` | Usar un comodin en un ejercicio (consume del inventario) | Si | any |
| GET | `/api/v1/gamification/comodines/users/:userId/inventory` | Inventario de comodines del usuario (cantidades disponibles) | Si | any |
| GET | `/api/v1/gamification/comodines/users/:userId/history` | Historial de compras y usos de comodines (?limit=N) | Si | any |
| GET | `/api/v1/gamification/comodines/users/:userId/stats` | Estadisticas agregadas de uso de comodines | Si | any |

---

## 7. Classrooms Module (~25 endpoints)

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| GET | /social/classrooms | Listar aulas | Si | teacher/admin |
| GET | /social/classrooms/:id | Detalle de aula | Si | teacher/admin |
| POST | /social/classrooms | Crear aula | Si | admin |
| PATCH | /social/classrooms/:id | Actualizar aula | Si | teacher/admin |
| GET | /social/classrooms/:id/members | Estudiantes del aula | Si | teacher |
| POST | /social/classrooms/:classroomId/students/:studentId | Agregar estudiante | Si | teacher/admin |
| DELETE | /social/classrooms/:classroomId/students/:studentId | Remover estudiante | Si | admin |
| GET | /social/classrooms/:id/stats | Estadisticas del aula | Si | teacher |
| GET | /social/classrooms/:id/progress | Progreso del aula | Si | teacher |

---

## 8. Students Module (~30 endpoints)

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

## 9. Teachers Module (~30 endpoints)

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

### Grades — Calificaciones (2 endpoints)

> **Controller:** `TeacherGradesController` en `apps/backend/src/modules/teacher/controllers/teacher-grades.controller.ts`
> **Nota:** Los grades son una vista de submissions calificadas; no existe una entidad "grade" separada.

| Method | Endpoint | Description | Auth | Roles |
|--------|----------|-------------|------|-------|
| GET | `/api/v1/teacher/grades` | Listar todas las calificaciones (paginado, filtros por assignment, classroom, student, status) | Si | teacher |
| GET | `/api/v1/teacher/grades/:id` | Obtener detalle de una calificacion por ID | Si | teacher |

---

## 10. Parents Portal Module (~18 endpoints)

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

## 11. Analytics Module (~25 endpoints)

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

## 12. Content Module (103 endpoints)

> **Guard:** `JwtAuthGuard` en todos los endpoints
> **Prefijo base:** `/api/v1/content` (via `extractBasePath(API_ROUTES.CONTENT.BASE)`) o prefijos directos por controller
> **Controllers:** 10 archivos | Rutas reales extraidas de `apps/backend/src/modules/content/controllers/`

### 12.1 Content Authors (16 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/content/authors` | Listar autores con filtros y paginacion |
| GET | `/api/v1/content/authors/featured` | Autores destacados |
| GET | `/api/v1/content/authors/verified` | Autores verificados |
| GET | `/api/v1/content/authors/top-rated` | Autores mejor calificados |
| GET | `/api/v1/content/authors/:id` | Obtener autor por ID |
| GET | `/api/v1/content/authors/:id/stats` | Estadisticas del autor |
| GET | `/api/v1/content/authors/expertise/:area` | Autores por area de expertise |
| GET | `/api/v1/content/authors/user/:userId` | Obtener autor por userId |
| POST | `/api/v1/content/authors` | Crear perfil de autor |
| PATCH | `/api/v1/content/authors/:id` | Actualizar perfil de autor |
| DELETE | `/api/v1/content/authors/:id` | Eliminar autor (soft delete) |
| POST | `/api/v1/content/authors/:id/increment-content` | Incrementar contador de contenido |
| POST | `/api/v1/content/authors/:id/increment-views` | Incrementar contador de vistas |
| PATCH | `/api/v1/content/authors/:id/rating` | Actualizar rating del autor |
| PATCH | `/api/v1/content/authors/:id/featured` | Marcar/desmarcar como destacado |
| PATCH | `/api/v1/content/authors/:id/verified` | Marcar/desmarcar como verificado |

### 12.2 Content Categories (15 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/content/categories` | Listar categorias con filtros |
| GET | `/api/v1/content/categories/root` | Categorias raiz (sin padre) |
| GET | `/api/v1/content/categories/tree` | Arbol completo de categorias |
| GET | `/api/v1/content/categories/stats` | Estadisticas de categorias |
| GET | `/api/v1/content/categories/slug/:slug` | Obtener categoria por slug |
| GET | `/api/v1/content/categories/:id` | Obtener categoria por ID |
| GET | `/api/v1/content/categories/:id/children` | Categorias hijas |
| GET | `/api/v1/content/categories/:id/breadcrumb` | Ruta de breadcrumb de la categoria |
| POST | `/api/v1/content/categories` | Crear categoria |
| PATCH | `/api/v1/content/categories/:id` | Actualizar categoria |
| DELETE | `/api/v1/content/categories/:id` | Eliminar categoria (soft delete) |
| PATCH | `/api/v1/content/categories/:id/order` | Actualizar orden de visualizacion |
| PATCH | `/api/v1/content/categories/:id/active` | Activar/desactivar categoria |
| PATCH | `/api/v1/content/categories/:id/move` | Mover categoria a otro padre |
| GET | `/api/v1/content/categories/active` | Categorias activas solamente |

### 12.3 Content Templates (9 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/content/templates` | Listar templates |
| GET | `/api/v1/content/templates/:id` | Obtener template por ID |
| POST | `/api/v1/content/templates` | Crear template |
| PATCH | `/api/v1/content/templates/:id` | Actualizar template |
| DELETE | `/api/v1/content/templates/:id` | Eliminar template |
| POST | `/api/v1/content/templates/:id/use` | Usar template para crear contenido |
| GET | `/api/v1/content/templates/type/:type` | Templates por tipo |
| GET | `/api/v1/content/templates/category/:categoryId` | Templates por categoria |
| GET | `/api/v1/content/templates/popular` | Templates mas utilizados |

### 12.4 Content Versions (8 endpoints)

> **Controller prefix:** `/api/v1/content/versions`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/content/versions/content/:contentId` | Versiones de un contenido |
| GET | `/api/v1/content/versions/content/:contentId/latest` | Ultima version de un contenido |
| GET | `/api/v1/content/versions/content/:contentId/published` | Version publicada de un contenido |
| GET | `/api/v1/content/versions/:id` | Obtener version por ID |
| POST | `/api/v1/content/versions` | Crear nueva version |
| PATCH | `/api/v1/content/versions/:id/publish` | Publicar version |
| PATCH | `/api/v1/content/versions/:id/unpublish` | Despublicar version |
| GET | `/api/v1/content/versions/compare/:id1/:id2` | Comparar dos versiones |

### 12.5 Flagged Content (10 endpoints)

> **Controller prefix:** `/api/v1/content/flagged`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/content/flagged` | Listar contenido reportado con filtros |
| GET | `/api/v1/content/flagged/stats` | Estadisticas de reportes |
| GET | `/api/v1/content/flagged/pending` | Reportes pendientes de revision |
| GET | `/api/v1/content/flagged/:id` | Obtener reporte por ID |
| GET | `/api/v1/content/flagged/content/:contentId` | Reportes de un contenido especifico |
| POST | `/api/v1/content/flagged` | Reportar contenido |
| PATCH | `/api/v1/content/flagged/:id/approve` | Aprobar (descartar reporte) |
| PATCH | `/api/v1/content/flagged/:id/reject` | Rechazar (confirmar reporte) |
| DELETE | `/api/v1/content/flagged/:id/remove` | Remover contenido reportado |
| PATCH | `/api/v1/content/flagged/:id/priority` | Actualizar prioridad del reporte |

### 12.6 Marie Curie Content (9 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/content/marie-curie` | Listar contenido Marie Curie |
| GET | `/api/v1/content/marie-curie/:id` | Obtener por ID |
| GET | `/api/v1/content/marie-curie/category/:category` | Por categoria |
| POST | `/api/v1/content/marie-curie` | Crear contenido Marie Curie |
| PATCH | `/api/v1/content/marie-curie/:id` | Actualizar contenido |
| DELETE | `/api/v1/content/marie-curie/:id` | Eliminar contenido |
| PATCH | `/api/v1/content/marie-curie/:id/publish` | Publicar contenido |
| GET | `/api/v1/content/marie-curie/published` | Contenido publicado |
| GET | `/api/v1/content/marie-curie/featured` | Contenido destacado |

### 12.7 Media Files (12 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/content/media-files` | Listar archivos multimedia |
| GET | `/api/v1/content/media-files/:id` | Obtener archivo por ID |
| POST | `/api/v1/content/media-files` | Subir archivo multimedia |
| PATCH | `/api/v1/content/media-files/:id` | Actualizar metadatos del archivo |
| DELETE | `/api/v1/content/media-files/:id` | Eliminar archivo |
| GET | `/api/v1/content/media-files/type/:type` | Archivos por tipo (image, video, audio, document) |
| GET | `/api/v1/content/media-files/search/tags` | Buscar archivos por tags |
| PATCH | `/api/v1/content/media-files/:id/status` | Actualizar estado del archivo |
| GET | `/api/v1/content/media-files/stats` | Estadisticas de archivos multimedia |
| GET | `/api/v1/content/media-files/uploader/:uploaderId` | Archivos por uploader |
| GET | `/api/v1/content/media-files/:id/thumbnail` | Obtener thumbnail del archivo |
| POST | `/api/v1/content/media-files/:id/increment-downloads` | Incrementar contador de descargas |

### 12.8 Media Metadata (6 endpoints)

> **Controller prefix:** `/api/v1/content/media-metadata`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/content/media-metadata/:id` | Obtener metadata por ID |
| GET | `/api/v1/content/media-metadata/media/:mediaFileId` | Metadata de un archivo multimedia |
| POST | `/api/v1/content/media-metadata` | Crear metadata |
| PATCH | `/api/v1/content/media-metadata/:id` | Actualizar metadata |
| PUT | `/api/v1/content/media-metadata/media/:mediaFileId` | Upsert metadata de archivo |
| DELETE | `/api/v1/content/media-metadata/:id` | Eliminar metadata |

### 12.9 Moderation Rules (10 endpoints)

> **Controller prefix:** `/api/v1/content/moderation-rules`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/content/moderation-rules` | Listar todas las reglas |
| GET | `/api/v1/content/moderation-rules/active` | Reglas activas |
| GET | `/api/v1/content/moderation-rules/target/:target` | Reglas por target (content, comment, user) |
| GET | `/api/v1/content/moderation-rules/type/:type` | Reglas por tipo (keyword, pattern, ml) |
| GET | `/api/v1/content/moderation-rules/:id` | Obtener regla por ID |
| POST | `/api/v1/content/moderation-rules` | Crear regla de moderacion |
| PATCH | `/api/v1/content/moderation-rules/:id` | Actualizar regla |
| PATCH | `/api/v1/content/moderation-rules/:id/activate` | Activar regla |
| PATCH | `/api/v1/content/moderation-rules/:id/deactivate` | Desactivar regla |
| DELETE | `/api/v1/content/moderation-rules/:id` | Eliminar regla |

### 12.10 Tags (8 endpoints)

> **Controller prefix:** `/api/v1/content/tags`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/content/tags` | Listar tags |
| GET | `/api/v1/content/tags/popular` | Tags mas populares |
| GET | `/api/v1/content/tags/search` | Buscar tags |
| GET | `/api/v1/content/tags/category/:category` | Tags por categoria |
| GET | `/api/v1/content/tags/:id` | Obtener tag por ID |
| POST | `/api/v1/content/tags` | Crear tag |
| PATCH | `/api/v1/content/tags/:id` | Actualizar tag |
| PATCH | `/api/v1/content/tags/:id/deactivate` | Desactivar tag |

---

## 13. Notifications Module (~25 endpoints)

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

### Notifications System (Extended)

> **Prefijo base:** `/api/v1/notifications`
> **Guard:** `JwtAuthGuard` salvo indicacion contraria
> **Controllers:** 5 archivos — analytics, templates, devices, rate-limit, multichannel

#### 13.1 NotificationAnalyticsController (10 endpoints)

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| GET | `/api/v1/notifications/analytics/summary` | Resumen de analiticas de notificaciones | Si | admin |
| GET | `/api/v1/notifications/analytics/by-template/:templateKey` | Analiticas por template especifico | Si | admin |
| GET | `/api/v1/notifications/analytics/by-channel/:channel` | Analiticas por canal (email, push, sms, in_app) | Si | admin |
| GET | `/api/v1/notifications/delivery/:notificationId` | Estado de entrega de una notificacion | Si | admin |
| GET | `/api/v1/notifications/errors` | Errores recientes de entrega (paginado) | Si | admin |
| GET | `/api/v1/notifications/errors/:notificationId` | Errores de una notificacion especifica | Si | admin |
| POST | `/api/v1/notifications/track/open` | Registrar apertura de email (pixel tracking) | No | public |
| GET | `/api/v1/notifications/track/open` | Registrar apertura via GET (responde GIF 1x1) | No | public |
| POST | `/api/v1/notifications/track/click` | Registrar clic en enlace de notificacion | No | public |
| GET | `/api/v1/notifications/track/click` | Registrar clic y redirigir al destino (GET) | No | public |

#### 13.2 NotificationTemplatesController (9 endpoints)

> **Controller prefix:** `/api/v1/notifications/templates`
> **Auth:** JwtAuthGuard + AdminGuard

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| GET | `/api/v1/notifications/templates` | Listar todos los templates activos | Si | admin |
| GET | `/api/v1/notifications/templates/locales` | Locales i18n soportados | Si | admin |
| GET | `/api/v1/notifications/templates/:templateKey` | Obtener template por clave | Si | admin |
| POST | `/api/v1/notifications/templates/preview` | Previsualizar template Handlebars en crudo | Si | admin |
| POST | `/api/v1/notifications/templates/validate` | Validar sintaxis Handlebars | Si | admin |
| POST | `/api/v1/notifications/templates/:templateKey/render` | Renderizar preview del template (sin enviar) | Si | admin |
| POST | `/api/v1/notifications/templates/:templateKey/render-localized` | Renderizar con localizacion i18n | Si | admin |
| GET | `/api/v1/notifications/templates/:templateKey/versions` | Historial de versiones del template | Si | admin |
| GET | `/api/v1/notifications/templates/:templateKey/version/:version` | Obtener version especifica del template | Si | admin |

#### 13.3 NotificationDevicesController (6 endpoints)

> **Controller prefix:** `/api/v1/notifications/devices`

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| GET | `/api/v1/notifications/devices/vapid-public-key` | Obtener VAPID public key para web push | No | public |
| POST | `/api/v1/notifications/devices` | Registrar dispositivo para push notifications | Si | any |
| GET | `/api/v1/notifications/devices` | Listar dispositivos registrados del usuario | Si | any |
| GET | `/api/v1/notifications/devices/:id` | Obtener informacion de un dispositivo | Si | any |
| PATCH | `/api/v1/notifications/devices/:id` | Actualizar nombre del dispositivo | Si | any |
| DELETE | `/api/v1/notifications/devices/:id` | Dar de baja un dispositivo | Si | any |

#### 13.4 NotificationRateLimitController (5 endpoints)

> **Controller prefix:** `/api/v1/notifications/rate-limit`
> **Auth:** JwtAuthGuard + AdminGuard

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| GET | `/api/v1/notifications/rate-limit/status` | Estado actual de rate limits | Si | admin |
| GET | `/api/v1/notifications/rate-limit/config` | Configuracion de rate limits | Si | admin |
| GET | `/api/v1/notifications/rate-limit/channel/:channel` | Estado de rate limit para un canal especifico | Si | admin |
| POST | `/api/v1/notifications/rate-limit/reset/:channel` | Resetear rate limit de un canal | Si | admin |
| POST | `/api/v1/notifications/rate-limit/reset-all` | Resetear todos los rate limits | Si | admin |

#### 13.5 NotificationMultiChannelController (2 endpoints)

> **Controller prefix:** `/api/v1/notifications/multichannel`
> **Auth:** JwtAuthGuard + AdminGuard

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| POST | `/api/v1/notifications/multichannel` | Crear notificacion multi-canal ad-hoc | Si | admin |
| POST | `/api/v1/notifications/multichannel/send-from-template` | Enviar desde template en multiples canales | Si | admin |

---

## 14. Reports Module (~20 endpoints)

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

## 15. Achievements Module (~20 endpoints)

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

## 16. Social Module (141 endpoints)

> **Guard:** `JwtAuthGuard` en todos los endpoints
> **Prefijo base:** `/api/v1/social` (via `extractBasePath(API_ROUTES.SOCIAL.BASE)`) o prefijos directos por controller
> **Controllers:** 13 archivos | Rutas reales extraidas de `apps/backend/src/modules/social/controllers/`

### 16.1 Guilds (16 endpoints)

> **Controller prefix:** `/guilds`

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/guilds` | Crear nueva guild |
| GET | `/guilds` | Listar todas las guilds con filtros |
| GET | `/guilds/:id` | Obtener guild por ID |
| PATCH | `/guilds/:id` | Actualizar guild |
| DELETE | `/guilds/:id` | Eliminar guild |
| GET | `/guilds/:id/members` | Listar miembros de la guild |
| POST | `/guilds/:id/join-requests` | Enviar solicitud para unirse |
| GET | `/guilds/:id/join-requests` | Listar solicitudes pendientes |
| PATCH | `/guilds/:guildId/join-requests/:requestId` | Aprobar/rechazar solicitud |
| POST | `/guilds/:id/members/add` | Agregar miembro directamente |
| DELETE | `/guilds/:guildId/members/:memberId` | Remover miembro de la guild |
| PATCH | `/guilds/:guildId/members/:memberId/role` | Actualizar rol de miembro |
| GET | `/guilds/:id/stats` | Estadisticas de la guild |
| GET | `/guilds/:id/leaderboard` | Leaderboard de la guild |
| GET | `/guilds/:id/missions` | Misiones de la guild |
| POST | `/guilds/:guildId/missions/:missionId` | Asignar mision a la guild |

### 16.2 Teams (14 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/social/teams` | Crear equipo |
| GET | `/api/v1/social/teams` | Listar equipos con filtros |
| GET | `/api/v1/social/teams/:id` | Obtener equipo por ID |
| PATCH | `/api/v1/social/teams/:id` | Actualizar equipo |
| DELETE | `/api/v1/social/teams/:id` | Eliminar equipo |
| GET | `/api/v1/social/teams/:id/members` | Listar miembros del equipo |
| POST | `/api/v1/social/teams/:id/members` | Agregar miembro al equipo |
| DELETE | `/api/v1/social/teams/:teamId/members/:memberId` | Remover miembro del equipo |
| PATCH | `/api/v1/social/teams/:teamId/members/:memberId/role` | Actualizar rol de miembro |
| POST | `/api/v1/social/teams/:id/score` | Actualizar puntaje del equipo |
| POST | `/api/v1/social/teams/:id/xp` | Agregar XP al equipo |
| GET | `/api/v1/social/teams/leaderboard` | Leaderboard de equipos |
| GET | `/api/v1/social/teams/:id/stats` | Estadisticas del equipo |
| GET | `/api/v1/social/teams/classroom/:classroomId` | Equipos por aula |

### 16.3 Friendships (11 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/social/friendships/:userId` | Listar amigos de un usuario |
| GET | `/api/v1/social/friendships/:userId/pending` | Solicitudes de amistad pendientes |
| GET | `/api/v1/social/friendships/:userId/sent` | Solicitudes de amistad enviadas |
| POST | `/api/v1/social/friendships/request` | Enviar solicitud de amistad |
| PATCH | `/api/v1/social/friendships/:id/accept` | Aceptar solicitud de amistad |
| PATCH | `/api/v1/social/friendships/:id/reject` | Rechazar solicitud de amistad |
| DELETE | `/api/v1/social/friendships/:id` | Eliminar amistad |
| POST | `/api/v1/social/friendships/:id/block` | Bloquear usuario |
| POST | `/api/v1/social/friendships/:id/unblock` | Desbloquear usuario |
| GET | `/api/v1/social/friendships/:userId/blocked` | Lista de usuarios bloqueados |
| GET | `/api/v1/social/friendships/check/:userId1/:userId2` | Verificar estado de amistad entre dos usuarios |

### 16.4 Friends (10 endpoints)

> **Controller prefix:** `/friends`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/friends` | Listar amigos del usuario autenticado |
| GET | `/friends/search` | Buscar usuarios para agregar |
| GET | `/friends/requests` | Solicitudes de amistad recibidas |
| GET | `/friends/leaderboard` | Leaderboard de amigos |
| POST | `/friends/request` | Enviar solicitud de amistad |
| POST | `/friends/respond` | Aceptar/rechazar solicitud |
| DELETE | `/friends/cancel/:requestId` | Cancelar solicitud enviada |
| DELETE | `/friends/remove/:friendId` | Eliminar amistad |
| GET | `/friends/:userId` | Obtener amigos de un usuario especifico |
| GET | `/friends/mutual/:userId` | Obtener amigos mutuos con un usuario |

### 16.5 Peer Challenges (14 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/social/peer-challenges` | Crear desafio peer-to-peer |
| GET | `/api/v1/social/peer-challenges` | Listar desafios con filtros (status, type, creator) |
| GET | `/api/v1/social/peer-challenges/open` | Desafios abiertos disponibles |
| GET | `/api/v1/social/peer-challenges/active` | Desafios actualmente en progreso |
| GET | `/api/v1/social/peer-challenges/:id` | Obtener desafio por ID |
| GET | `/api/v1/social/peer-challenges/creator/:userId` | Desafios creados por usuario |
| PATCH | `/api/v1/social/peer-challenges/:id` | Actualizar desafio (solo creador, solo open) |
| PATCH | `/api/v1/social/peer-challenges/:id/start` | Iniciar desafio (status -> in_progress) |
| PATCH | `/api/v1/social/peer-challenges/:id/complete` | Completar desafio |
| PATCH | `/api/v1/social/peer-challenges/:id/cancel` | Cancelar desafio (solo creador) |
| PATCH | `/api/v1/social/peer-challenges/mark-expired` | Marcar desafios expirados (batch) |
| DELETE | `/api/v1/social/peer-challenges/:id` | Eliminar desafio (solo creador) |
| GET | `/api/v1/social/peer-challenges/stats/by-type` | Estadisticas por tipo de desafio |
| GET | `/api/v1/social/peer-challenges/stats/by-status` | Estadisticas por estado |

### 16.6 Team Challenges (10 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/social/team-challenges/team/:teamId` | Desafios de un equipo |
| GET | `/api/v1/social/team-challenges/:id` | Obtener team challenge por ID |
| POST | `/api/v1/social/team-challenges` | Crear team challenge |
| POST | `/api/v1/social/team-challenges/:id/assign` | Asignar challenge a equipo |
| PATCH | `/api/v1/social/team-challenges/:id/status` | Actualizar estado del challenge |
| PATCH | `/api/v1/social/team-challenges/:id/score` | Actualizar puntaje |
| PATCH | `/api/v1/social/team-challenges/:id/complete` | Completar challenge |
| PATCH | `/api/v1/social/team-challenges/:id/fail` | Marcar challenge como fallido |
| GET | `/api/v1/social/team-challenges/leaderboard` | Leaderboard de team challenges |
| GET | `/api/v1/social/team-challenges/challenge/:challengeId` | Participaciones por challenge |

### 16.7 Challenge Participants (15 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/social/challenge-participants` | Agregar participante a challenge |
| GET | `/api/v1/social/challenge-participants/challenge/:challengeId` | Participantes de un challenge |
| GET | `/api/v1/social/challenge-participants/user/:userId` | Challenges de un usuario |
| GET | `/api/v1/social/challenge-participants/:id` | Obtener participante por ID |
| DELETE | `/api/v1/social/challenge-participants/:id` | Remover participante |
| PATCH | `/api/v1/social/challenge-participants/:id/accept` | Aceptar invitacion al challenge |
| PATCH | `/api/v1/social/challenge-participants/:id/status` | Actualizar estado de participacion |
| PATCH | `/api/v1/social/challenge-participants/:id/score` | Actualizar puntaje del participante |
| GET | `/api/v1/social/challenge-participants/challenge/:challengeId/rankings` | Rankings del challenge |
| GET | `/api/v1/social/challenge-participants/challenge/:challengeId/winner` | Obtener ganador del challenge |
| POST | `/api/v1/social/challenge-participants/:id/rewards` | Distribuir recompensas |
| PATCH | `/api/v1/social/challenge-participants/:id/forfeit` | Abandonar challenge |
| PATCH | `/api/v1/social/challenge-participants/:id/disqualify` | Descalificar participante |
| GET | `/api/v1/social/challenge-participants/user/:userId/stats` | Estadisticas de challenges del usuario |
| GET | `/api/v1/social/challenge-participants/challenge/:challengeId/stats` | Estadisticas del challenge |

### 16.8 Team Members (9 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/social/team-members/team/:teamId` | Miembros de un equipo |
| GET | `/api/v1/social/team-members/user/:userId` | Equipos de un usuario |
| POST | `/api/v1/social/team-members` | Unirse a un equipo |
| PATCH | `/api/v1/social/team-members/:id/role` | Actualizar rol de miembro |
| DELETE | `/api/v1/social/team-members/:id` | Salir del equipo |
| GET | `/api/v1/social/team-members/:id` | Obtener miembro por ID |
| GET | `/api/v1/social/team-members/team/:teamId/active` | Miembros activos del equipo |
| POST | `/api/v1/social/team-members/team/:teamId/transfer-ownership` | Transferir propiedad del equipo |
| DELETE | `/api/v1/social/team-members/team/:teamId/leave` | Abandonar equipo |

### 16.9 User Activities (5 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/social/activities/user/:userId` | Actividades de un usuario |
| GET | `/api/v1/social/activities/feed` | Feed de actividades |
| POST | `/api/v1/social/activities` | Crear actividad |
| GET | `/api/v1/social/activities/:id` | Obtener actividad por ID |
| GET | `/api/v1/social/activities/public` | Actividades publicas |

### 16.10 User Follows (7 endpoints)

> **Controller prefix:** `/api/v1/social/follows`

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/social/follows` | Seguir a un usuario |
| DELETE | `/api/v1/social/follows/:followedId` | Dejar de seguir |
| GET | `/api/v1/social/follows/:userId/followers` | Seguidores de un usuario |
| GET | `/api/v1/social/follows/:userId/following` | Usuarios que sigue |
| GET | `/api/v1/social/follows/is-following/:followedId` | Verificar si sigue a un usuario |
| GET | `/api/v1/social/follows/:userId/counts` | Conteo de seguidores/siguiendo |
| GET | `/api/v1/social/follows/:userId/mutual` | Seguidores mutuos |

### 16.11 Classroom Members (10 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/social/classroom-members/classroom/:classroomId` | Miembros de un aula |
| GET | `/api/v1/social/classroom-members/user/:userId` | Aulas de un usuario |
| POST | `/api/v1/social/classroom-members` | Inscribir miembro en aula |
| PATCH | `/api/v1/social/classroom-members/:id/status` | Actualizar estado de membresia |
| PATCH | `/api/v1/social/classroom-members/:id/grade` | Actualizar calificacion |
| PATCH | `/api/v1/social/classroom-members/:id/attendance` | Registrar asistencia |
| DELETE | `/api/v1/social/classroom-members/:id` | Retirar miembro del aula |
| GET | `/api/v1/social/classroom-members/:id` | Obtener membresia por ID |
| GET | `/api/v1/social/classroom-members/classroom/:classroomId/active` | Miembros activos del aula |
| GET | `/api/v1/social/classroom-members/classroom/:classroomId/leaderboard` | Leaderboard del aula |

### 16.12 Classrooms (12 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/social/classrooms` | Listar aulas con filtros |
| GET | `/api/v1/social/classrooms/code/:code` | Buscar aula por codigo |
| GET | `/api/v1/social/classrooms/:id` | Obtener aula por ID |
| POST | `/api/v1/social/classrooms` | Crear aula |
| PATCH | `/api/v1/social/classrooms/:id` | Actualizar aula |
| DELETE | `/api/v1/social/classrooms/:id` | Eliminar aula |
| GET | `/api/v1/social/classrooms/:id/stats` | Estadisticas del aula |
| GET | `/api/v1/social/classrooms/teacher/:teacherId/active` | Aulas activas de un profesor |
| POST | `/api/v1/social/classrooms/:id/enroll` | Inscribir estudiante |
| DELETE | `/api/v1/social/classrooms/:classroomId/students/:studentId` | Remover estudiante |
| GET | `/api/v1/social/classrooms/:id/schedule` | Horario del aula |
| GET | `/api/v1/social/classrooms/:id/members` | Miembros del aula |

### 16.13 Schools (8 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/social/schools` | Listar escuelas |
| GET | `/api/v1/social/schools/:id` | Obtener escuela por ID |
| GET | `/api/v1/social/schools/code/:code` | Buscar escuela por codigo |
| POST | `/api/v1/social/schools` | Crear escuela |
| PATCH | `/api/v1/social/schools/:id` | Actualizar escuela |
| DELETE | `/api/v1/social/schools/:id` | Eliminar escuela |
| GET | `/api/v1/social/schools/:id/stats` | Estadisticas de la escuela |
| PATCH | `/api/v1/social/schools/:id/settings` | Actualizar configuracion de escuela |

---

## 17. Settings Module (~15 endpoints)

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| GET | /settings | Configuracion del sistema | Si | admin |
| PATCH | /settings | Actualizar configuracion | Si | admin |
| GET | /settings/features | Feature flags | Si | admin |
| PATCH | /settings/features/:flag | Toggle feature | Si | admin |
| GET | /settings/gamification | Parametros de gamificacion | Si | admin |
| PATCH | /settings/gamification | Actualizar parametros | Si | admin |

---

## 18. Health Module (3 endpoints)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /health | Health check general | No |
| GET | /health/ready | Readiness check | No |
| GET | /health/live | Liveness check | No |

---

## 19. Core Module

No expone endpoints propios. Provee utilidades compartidas a otros modulos.

---

## 20. Admin Module (159 endpoints)

> **Guard:** `JwtAuthGuard` + `AdminGuard` (role: admin / super_admin)
> **Prefijo base:** `/api/v1/admin`
> **Controllers:** 21 archivos | Rutas reales extraidas de los controladores en `apps/backend/src/modules/admin/controllers/`

### Dashboard (11 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/dashboard` | Datos completos del dashboard |
| GET | `/admin/dashboard/stats` | Estadisticas del dashboard |
| GET | `/admin/dashboard/recent-activity` | Actividad reciente de usuarios |
| GET | `/admin/dashboard/user-stats` | Estadisticas agregadas de usuarios |
| GET | `/admin/dashboard/organization-stats` | Estadisticas de organizaciones |
| GET | `/admin/dashboard/moderation-queue` | Cola de moderacion de contenido |
| GET | `/admin/dashboard/classroom-overview` | Vista general de aulas |
| GET | `/admin/dashboard/assignment-stats` | Estadisticas de entregas de asignaciones |
| GET | `/admin/dashboard/actions/recent` | Acciones administrativas recientes |
| GET | `/admin/dashboard/alerts` | Alertas activas del sistema |
| GET | `/admin/dashboard/analytics/user-activity` | Analiticas de actividad de usuarios |

### Gestion de Usuarios (14 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/users` | Listar usuarios con filtros y paginacion |
| POST | `/admin/users` | Crear nuevo usuario |
| GET | `/admin/users/stats` | Estadisticas de usuarios |
| GET | `/admin/users/:id` | Obtener detalle de usuario |
| PUT | `/admin/users/:id` | Actualizar informacion de usuario |
| DELETE | `/admin/users/:id` | Eliminar usuario |
| POST | `/admin/users/:id/suspend` | Suspender cuenta de usuario |
| POST | `/admin/users/:id/activate` | Activar cuenta suspendida |
| POST | `/admin/users/:id/unsuspend` | Reactivar cuenta (alias de activate) |
| POST | `/admin/users/:id/deactivate` | Desactivar cuenta temporalmente |
| POST | `/admin/users/:id/reset-password` | Forzar reset de password |
| POST | `/admin/users/bulk/suspend` | Suspension masiva de usuarios |
| POST | `/admin/users/bulk/delete` | Eliminacion masiva de usuarios |
| POST | `/admin/users/bulk/update-role` | Actualizacion masiva de roles |

### Roles y Permisos (6 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/roles` | Listar todos los roles |
| POST | `/admin/roles` | Crear rol personalizado |
| GET | `/admin/roles/permissions` | Listar permisos disponibles |
| GET | `/admin/roles/:id/permissions` | Permisos de un rol especifico |
| PUT | `/admin/roles/:id/permissions` | Actualizar permisos de un rol |
| DELETE | `/admin/roles/:id` | Eliminar (desactivar) un rol |

### Organizaciones (9 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/organizations` | Listar organizaciones con filtros |
| POST | `/admin/organizations` | Crear organizacion (requiere super_admin) |
| GET | `/admin/organizations/:id` | Detalle de organizacion |
| PUT | `/admin/organizations/:id` | Actualizar organizacion |
| DELETE | `/admin/organizations/:id` | Eliminar organizacion |
| GET | `/admin/organizations/:id/stats` | Estadisticas de organizacion |
| GET | `/admin/organizations/:id/users` | Usuarios de la organizacion |
| PATCH | `/admin/organizations/:id/subscription` | Actualizar suscripcion |
| PATCH | `/admin/organizations/:id/features` | Actualizar feature flags de organizacion |

### Analytics (7 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/analytics/overview` | Vista general de analiticas |
| GET | `/admin/analytics/engagement` | Analiticas de engagement por segmento |
| GET | `/admin/analytics/gamification` | Distribucion de XP, rangos y niveles |
| GET | `/admin/analytics/activity-timeline` | Timeline de actividad diaria (N dias) |
| GET | `/admin/analytics/top-users` | Top usuarios por metrica (xp, exercises, streak) |
| GET | `/admin/analytics/retention` | Analiticas de retencion por cohorte |
| GET | `/admin/analytics/export` | Exportar analiticas a CSV |

### Gestion de Contenido (10 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/content/pending` | Contenido pendiente de aprobacion |
| GET | `/admin/content/exercises/pending` | Ejercicios pendientes (alias) |
| POST | `/admin/content/:id/approve` | Aprobar contenido |
| POST | `/admin/content/exercises/:id/approve` | Aprobar ejercicio (alias) |
| POST | `/admin/content/:id/reject` | Rechazar contenido con razon |
| POST | `/admin/content/exercises/:id/reject` | Rechazar ejercicio (alias) |
| POST | `/admin/content/version` | Crear snapshot de version |
| GET | `/admin/content/media` | Biblioteca de medios |
| DELETE | `/admin/content/media/:id` | Eliminar archivo de medios |
| GET | `/admin/content/approval-history` | Historial de aprobaciones |

### Progreso Educativo (7 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/progress/overview` | Vista general de progreso del sistema |
| GET | `/admin/progress/classrooms/:id` | Progreso detallado de un aula |
| GET | `/admin/progress/students/:id` | Progreso detallado de un estudiante |
| GET | `/admin/progress/students/:id/achievements` | Achievements de un estudiante |
| GET | `/admin/progress/modules/:id` | Estadisticas de progreso por modulo |
| GET | `/admin/progress/exercises/:id` | Estadisticas de un ejercicio |
| GET | `/admin/progress/export` | Exportar datos de progreso a CSV |

### Asignaciones (6 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/assignments` | Listar asignaciones con filtros |
| GET | `/admin/assignments/stats` | Estadisticas globales de asignaciones |
| GET | `/admin/assignments/classrooms/:classroomId` | Asignaciones de un aula |
| GET | `/admin/assignments/students/:studentId` | Asignaciones de un estudiante |
| GET | `/admin/assignments/export` | Exportar asignaciones a CSV |
| GET | `/admin/assignments/:id` | Detalle de asignacion |

### Asignacion de Aulas a Profesores (7 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/admin/classrooms/assign` | Asignar aula a profesor |
| POST | `/admin/classrooms/bulk-assign` | Asignacion masiva de aulas |
| DELETE | `/admin/classrooms/assign/:teacherId/:classroomId` | Remover asignacion |
| POST | `/admin/classrooms/reassign` | Reasignar aula a otro profesor |
| GET | `/admin/classrooms/teacher/:teacherId` | Aulas de un profesor |
| GET | `/admin/classrooms/available` | Aulas disponibles para asignacion |
| GET | `/admin/classrooms/:classroomId/history` | Historial de asignaciones del aula |

### Classroom-Teachers REST (9 endpoints)

> Endpoints RESTful que replican funcionalidad para compatibilidad frontend (US-AE-007)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/classrooms/:classroomId/teachers` | Obtener profesores de un aula |
| POST | `/admin/classrooms/:classroomId/teachers` | Asignar profesor a aula |
| DELETE | `/admin/classrooms/:classroomId/teachers/:teacherId` | Remover profesor de aula |
| GET | `/admin/teachers/:teacherId/classrooms` | Obtener aulas de un profesor |
| POST | `/admin/teachers/:teacherId/classrooms` | Asignar aulas a profesor |
| GET | `/admin/classroom-teachers` | Listar todas las asignaciones |
| POST | `/admin/classroom-teachers/bulk` | Asignacion masiva de pares |
| GET | `/admin/classrooms/list` | Listar aulas (para dropdowns) |
| GET | `/admin/teachers/list` | Listar profesores (para dropdowns) |

### Configuracion de Gamificacion (10 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/gamification/settings` | Obtener configuracion de gamificacion |
| PUT | `/admin/gamification/settings` | Actualizar configuracion |
| POST | `/admin/gamification/settings/preview` | Previsualizar impacto de cambios |
| POST | `/admin/gamification/settings/restore-defaults` | Restaurar valores por defecto |
| POST | `/admin/gamification/restore-defaults` | Restaurar defaults (ruta alternativa) |
| GET | `/admin/gamification/parameters` | Listar parametros con filtro por categoria |
| GET | `/admin/gamification/parameters/:id` | Obtener parametro por ID |
| PUT | `/admin/gamification/parameters/:id` | Actualizar valor de parametro |
| GET | `/admin/gamification/maya-ranks` | Configuracion de rangos Maya |
| PUT | `/admin/gamification/maya-ranks/:rankName` | Actualizar umbral de rango Maya |

### Alertas del Sistema (7 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/alerts` | Listar alertas con filtros y paginacion |
| GET | `/admin/alerts/stats/summary` | Estadisticas de alertas |
| GET | `/admin/alerts/:id` | Obtener alerta por ID |
| POST | `/admin/alerts` | Crear alerta manual |
| PATCH | `/admin/alerts/:id/acknowledge` | Reconocer alerta |
| PATCH | `/admin/alerts/:id/resolve` | Resolver alerta |
| PATCH | `/admin/alerts/:id/suppress` | Suprimir alerta |

### Intervenciones Estudiantiles (5 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/interventions` | Listar alertas de intervencion |
| GET | `/admin/interventions/:id` | Obtener alerta de intervencion por ID |
| PATCH | `/admin/interventions/:id/acknowledge` | Reconocer alerta de intervencion |
| PATCH | `/admin/interventions/:id/resolve` | Resolver alerta de intervencion |
| DELETE | `/admin/interventions/:id/dismiss` | Descartar alerta de intervencion |

### Operaciones Masivas (6 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/admin/bulk-operations/suspend-users` | Suspension masiva de usuarios |
| POST | `/admin/bulk-operations/activate-users` | Activacion masiva de usuarios |
| POST | `/admin/bulk-operations/update-role` | Actualizacion masiva de roles |
| POST | `/admin/bulk-operations/delete-users` | Eliminacion masiva de usuarios |
| GET | `/admin/bulk-operations/:id` | Estado de operacion masiva |
| GET | `/admin/bulk-operations` | Listar operaciones masivas recientes |

### Sistema y Mantenimiento (17 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/system/health` | Estado de salud del sistema |
| GET | `/admin/system/metrics` | Metricas de rendimiento |
| GET | `/admin/system/audit-log` | Log de auditoria de autenticacion |
| GET | `/admin/system/logs` | Logs del sistema |
| GET | `/admin/system/config` | Configuracion actual del sistema |
| POST | `/admin/system/config` | Actualizar configuracion del sistema |
| GET | `/admin/system/config/categories` | Categorias de configuracion |
| POST | `/admin/system/config/validate` | Validar configuracion antes de aplicar |
| GET | `/admin/system/config/:category` | Configuracion por categoria |
| PUT | `/admin/system/config/:category` | Actualizar config por categoria |
| POST | `/admin/system/maintenance` | Activar/desactivar modo mantenimiento |
| POST | `/admin/system/maintenance/cleanup-logs` | Limpiar logs antiguos |
| POST | `/admin/system/maintenance/cleanup-activity` | Limpiar actividad de usuario antigua |
| POST | `/admin/system/maintenance/optimize-database` | Optimizar base de datos (VACUUM ANALYZE) |
| POST | `/admin/system/maintenance/clear-cache` | Limpiar cache de aplicacion |
| POST | `/admin/system/maintenance/cleanup-sessions` | Limpiar sesiones expiradas |
| GET | `/admin/system/cron/status` | Estado de trabajos CRON |

### Logs (alias) (1 endpoint)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/logs` | Logs del sistema (alias de /admin/system/audit-log) |

### Monitoreo (5 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/monitoring/metrics` | Metricas del sistema en tiempo real |
| GET | `/admin/monitoring/metrics/history` | Historial de metricas |
| GET | `/admin/monitoring/errors/stats` | Estadisticas de errores |
| GET | `/admin/monitoring/errors/recent` | Errores recientes con detalle |
| GET | `/admin/monitoring/errors/trends` | Tendencias de errores en el tiempo |

### Reportes (6 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/reports` | Listar reportes generados |
| POST | `/admin/reports/generate` | Generar nuevo reporte |
| GET | `/admin/reports/:id/download` | Descargar reporte (PDF/Excel/CSV) |
| GET | `/admin/reports/:id/info` | Metadatos del reporte |
| DELETE | `/admin/reports/:id` | Eliminar reporte |
| POST | `/admin/reports/:id/schedule` | Programar generacion periodica |

### Feature Flags (9 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/feature-flags` | Listar feature flags |
| GET | `/admin/feature-flags/:key` | Obtener feature flag por key |
| POST | `/admin/feature-flags/:key/check` | Verificar si feature esta habilitada |
| POST | `/admin/feature-flags` | Crear feature flag |
| PUT | `/admin/feature-flags/:key` | Actualizar feature flag |
| POST | `/admin/feature-flags/:key/enable` | Habilitar feature flag |
| POST | `/admin/feature-flags/:key/disable` | Deshabilitar feature flag |
| PUT | `/admin/feature-flags/:key/rollout` | Actualizar porcentaje de rollout |
| DELETE | `/admin/feature-flags/:key` | Eliminar feature flag |

### Branding / White Label (6 endpoints)

> **Controller:** `tenants/:tenantId/branding` -- endpoints de branding por tenant (EXT-008 White Label System)
> **Auth:** GET y GET css son publicos; el resto requiere JwtAuthGuard + AdminGuard

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/tenants/:tenantId/branding` | Obtener configuracion de branding (publico) |
| PATCH | `/tenants/:tenantId/branding` | Actualizar configuracion de branding |
| POST | `/tenants/:tenantId/branding/logo` | Subir logo (multipart, max 5MB) |
| POST | `/tenants/:tenantId/branding/favicon` | Subir favicon (multipart, max 1MB) |
| GET | `/tenants/:tenantId/branding/css` | Obtener variables CSS del branding (publico) |
| DELETE | `/tenants/:tenantId/branding/assets` | Eliminar assets de branding |

---

## 21. LTI Module (42 endpoints)

> **Controllers:** 5 archivos | Rutas reales extraidas de `apps/backend/src/modules/lti/controllers/`
> **Prefijo base:** `/api/v1/lti`
> **Security:** OIDC endpoints son publicos; el resto requiere `JwtAuthGuard`

### 21.1 Deep Linking (6 endpoints)

> **Controller prefix:** `/api/v1/lti/deep-linking`
> **Auth:** No (endpoints de integracion LTI)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/lti/deep-linking/content` | Obtener contenido disponible para deep linking (filtros: sessionId, moduleId, topicId, contentType, difficulty, search) |
| POST | `/api/v1/lti/deep-linking/select` | Seleccionar contenido para deep linking (genera JWT firmado) |
| POST | `/api/v1/lti/deep-linking/submit` | Enviar seleccion y redirigir al LMS (HTML form auto-submit) |
| GET | `/api/v1/lti/deep-linking/return/:sessionId` | Obtener URL de retorno e info de la sesion |
| POST | `/api/v1/lti/deep-linking/cancel/:sessionId` | Cancelar deep linking (retorna respuesta vacia al LMS) |
| GET | `/api/v1/lti/deep-linking/cancel/:sessionId/redirect` | Cancelar y redirigir al LMS |

### 21.2 LTI Consumers (9 endpoints)

> **Controller prefix:** `/api/v1/lti/consumers`
> **Auth:** JWT (admin only)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/lti/consumers` | Listar todos los LMS consumers configurados |
| GET | `/api/v1/lti/consumers/stats` | Estadisticas de consumers (total, active, verified) |
| GET | `/api/v1/lti/consumers/:id` | Obtener consumer por ID |
| GET | `/api/v1/lti/consumers/tenant/:tenantId` | Consumers de un tenant especifico |
| POST | `/api/v1/lti/consumers` | Registrar nuevo LMS para integracion LTI 1.3 |
| PATCH | `/api/v1/lti/consumers/:id` | Actualizar configuracion de consumer |
| POST | `/api/v1/lti/consumers/:id/verify` | Marcar consumer como verificado |
| POST | `/api/v1/lti/consumers/:id/activate` | Reactivar consumer desactivado |
| DELETE | `/api/v1/lti/consumers/:id` | Desactivar consumer (soft delete) |

### 21.3 Grade Passbacks (11 endpoints)

> **Controller prefix:** `/api/v1/lti/grade-passbacks`
> **Auth:** JWT

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/lti/grade-passbacks/stats` | Estadisticas de passbacks (total, pending, success, failed, retrying) |
| GET | `/api/v1/lti/grade-passbacks/pending` | Passbacks pendientes de envio al LMS |
| GET | `/api/v1/lti/grade-passbacks/ready-for-retry` | Passbacks fallidos listos para reintentar |
| GET | `/api/v1/lti/grade-passbacks/:id` | Obtener passback por ID |
| GET | `/api/v1/lti/grade-passbacks/user/:userId` | Passbacks de calificaciones de un usuario |
| GET | `/api/v1/lti/grade-passbacks/session/:sessionId` | Passbacks de una sesion LTI |
| POST | `/api/v1/lti/grade-passbacks` | Crear passback (registrar calificacion para envio via AGS) |
| PATCH | `/api/v1/lti/grade-passbacks/:id` | Actualizar datos de un passback |
| POST | `/api/v1/lti/grade-passbacks/:id/sending` | Marcar passback como en proceso de envio |
| POST | `/api/v1/lti/grade-passbacks/:id/success` | Marcar passback como enviado exitosamente |
| POST | `/api/v1/lti/grade-passbacks/:id/failed` | Marcar passback como fallido |

### 21.4 LTI Sessions (10 endpoints)

> **Controller prefix:** `/api/v1/lti/sessions`
> **Auth:** JWT

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/lti/sessions/stats` | Estadisticas de sesiones LTI (total, active, today) |
| GET | `/api/v1/lti/sessions/:id` | Obtener sesion por ID |
| GET | `/api/v1/lti/sessions/user/:userId` | Sesiones activas de un usuario |
| GET | `/api/v1/lti/sessions/consumer/:consumerId` | Sesiones activas de un LMS consumer |
| POST | `/api/v1/lti/sessions` | Crear nueva sesion post-launch |
| POST | `/api/v1/lti/sessions/:id/link-user/:userId` | Vincular usuario Gamilit con sesion LTI |
| POST | `/api/v1/lti/sessions/:id/activity` | Actualizar timestamp de ultima actividad |
| POST | `/api/v1/lti/sessions/:id/end` | Terminar sesion LTI |
| POST | `/api/v1/lti/sessions/user/:userId/end-all` | Terminar todas las sesiones de un usuario |
| POST | `/api/v1/lti/sessions/cleanup` | Limpiar sesiones expiradas (>24h sin actividad) |

### 21.5 OIDC Authentication (6 endpoints)

> **Controller prefix:** `/api/v1/lti/oidc`
> **Auth:** No (endpoints publicos de autenticacion LTI 1.3)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/lti/oidc/login` | Iniciar flujo OIDC login (redirect a plataforma) |
| GET | `/api/v1/lti/oidc/login/debug` | OIDC login debug (retorna JSON en lugar de redirect) |
| POST | `/api/v1/lti/oidc/callback` | Callback OIDC (recibe ID token, crea sesion, redirect) |
| POST | `/api/v1/lti/oidc/callback/json` | Callback OIDC JSON (retorna launch data sin redirect) |
| GET | `/api/v1/lti/oidc/jwks` | JSON Web Key Set (claves publicas para verificacion) |
| GET | `/api/v1/lti/oidc/.well-known/openid-configuration` | OpenID Connect discovery document |

---

## 22. Assignments Module (18 endpoints)

> **Controllers:** 2 archivos | Rutas reales extraidas de `apps/backend/src/modules/assignments/controllers/`
> **Guard:** `JwtAuthGuard` + `RolesGuard` en ambos controllers

### 22.1 Teacher Assignments (15 endpoints)

> **Controller prefix:** `/teacher/assignments`
> **Roles:** `admin_teacher`, `super_admin`

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/teacher/assignments` | Crear nueva asignacion (inicia como borrador) |
| GET | `/teacher/assignments` | Listar asignaciones del profesor (filtros: isPublished, type, search) |
| GET | `/teacher/assignments/upcoming` | Asignaciones con deadlines proximos (?days=N, default 7) |
| GET | `/teacher/assignments/:id` | Detalle completo de una asignacion |
| PUT | `/teacher/assignments/:id` | Actualizar asignacion completa (solo sin entregas) |
| PATCH | `/teacher/assignments/:id` | Actualizacion parcial (permite con entregas, bloquea campos criticos) |
| DELETE | `/teacher/assignments/:id` | Eliminar asignacion (soft delete) |
| POST | `/teacher/assignments/:id/assign` | Asignar a aulas (distribuye a estudiantes) |
| GET | `/teacher/assignments/:id/submissions` | Entregas de una asignacion (filtros: status, classroomId) |
| POST | `/teacher/assignments/:assignmentId/submissions/:submissionId/grade` | Calificar entrega de estudiante |
| POST | `/teacher/assignments/:id/distribute` | Distribuir a multiples aulas/estudiantes (con deadline overrides) |
| POST | `/teacher/assignments/:id/duplicate` | Duplicar asignacion (copia como borrador) |
| POST | `/teacher/assignments/:id/publish` | Publicar asignacion (opcion: notificar estudiantes) |
| POST | `/teacher/assignments/:id/close` | Cerrar asignacion (impedir nuevas entregas) |
| POST | `/teacher/assignments/:id/send-reminder` | Enviar recordatorio a estudiantes sin entrega |

### 22.2 Student Assignments (3 endpoints)

> **Controller prefix:** `/student/assignments`
> **Roles:** `student`, `admin_teacher`, `super_admin`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/student/assignments` | Tareas asignadas al estudiante (filtros: status, classroomId) |
| GET | `/student/assignments/:id` | Detalle de tarea asignada |
| GET | `/student/assignments/grades/summary` | Resumen de calificaciones (total, completadas, promedio) |

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

## Modulos Condicionales [CONDITIONAL]

> **Nota:** Los siguientes endpoints solo estan disponibles cuando `ENABLE_DATA_WAREHOUSE=true`.
> Estos modulos (ETL, ML, Visualization) no se cargan por defecto en `app.module.ts`.
> Requieren el datasource `data_warehouse` configurado.

**Total condicional:** 58 endpoints | 10 controllers | 3 modulos

---

### ETL Module (16 endpoints)

> **Activacion:** `ENABLE_DATA_WAREHOUSE=true`
> **Controllers:** 3 (EtlController, EtlLoadController, TransformController + ValidationController + CacheController)
> **Auth:** `JwtAuthGuard` + `RolesGuard` (rol: `super_admin`)

#### EtlController (5 endpoints)

> **Route prefix:** `/api/v1/etl/extract`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/v1/etl/extract/trigger` | Admin | Trigger ETL extraction |
| GET | `/api/v1/etl/extract/status` | Admin | Get current extraction status |
| GET | `/api/v1/etl/extract/history` | Admin | Get extraction history |
| GET | `/api/v1/etl/extract/overview` | Admin | Get ETL extraction overview |
| GET | `/api/v1/etl/extract/job-status` | Admin | Get extraction job status |

#### EtlLoadController (5 endpoints)

> **Route prefix:** `/api/v1/etl`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/v1/etl/load/trigger` | Admin | Trigger ETL load phase |
| GET | `/api/v1/etl/load/status` | Admin | Get current load status |
| POST | `/api/v1/etl/load/full` | Admin | Trigger full ETL pipeline |
| GET | `/api/v1/etl/pipeline/status` | Admin | Get pipeline status |
| GET | `/api/v1/etl/load/logs` | Admin | Get load log history (paginated) |

#### TransformController + ValidationController + CacheController (6 endpoints)

> **Route prefix:** `/api/v1/etl`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/v1/etl/transform/trigger` | Admin | Trigger transformation pipeline |
| GET | `/api/v1/etl/transform/status` | Admin | Get transformation status |
| GET | `/api/v1/etl/transform/health` | Admin | Transformation health check |
| GET | `/api/v1/etl/validation/report` | Admin | Get data quality validation report |
| POST | `/api/v1/etl/cache/clear` | Admin | Clear dimension caches |
| GET | `/api/v1/etl/cache/stats` | Admin | Get cache statistics |

---

### ML Module (21 endpoints)

> **Activacion:** `ENABLE_DATA_WAREHOUSE=true`
> **Controllers:** 3 (FeaturesController, ModelAdminController, PredictionController)
> **Auth:** `JwtAuthGuard` + `RolesGuard` (roles segun endpoint)

#### FeaturesController (5 endpoints)

> **Route prefix:** `/api/v1/ml/features`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/v1/ml/features/:studentId` | Teacher/Admin | Get ML features for student |
| POST | `/api/v1/ml/features/batch` | SuperAdmin | Batch generate features |
| GET | `/api/v1/ml/features/schema` | Admin | Get feature schema documentation |
| DELETE | `/api/v1/ml/features/cache/:studentId` | Admin | Invalidate feature cache |
| GET | `/api/v1/ml/features/cached/:studentId` | Teacher/Admin | Get cached features (no regeneration) |

#### ModelAdminController (7 endpoints)

> **Route prefix:** `/api/v1/ml/admin`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/v1/ml/admin/models` | Admin | List all ML models and status |
| GET | `/api/v1/ml/admin/models/:modelType/metrics` | Admin | Get metrics for model |
| POST | `/api/v1/ml/admin/models/:modelType/train` | Admin | Trigger model training |
| POST | `/api/v1/ml/admin/models/:modelType/activate/:version` | Admin | Activate model version |
| GET | `/api/v1/ml/admin/predictions/logs` | Admin | Get prediction audit logs |
| DELETE | `/api/v1/ml/admin/cache/predictions` | Admin | Clear all prediction cache |
| GET | `/api/v1/ml/admin/cache/stats` | Admin | Get cache statistics |

#### PredictionController (9 endpoints)

> **Route prefix:** `/api/v1/ml/predict`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/v1/ml/predict/dropout-risk/:studentId` | Teacher/Admin | Get dropout risk prediction |
| GET | `/api/v1/ml/predict/performance/:studentId/:exerciseId` | Teacher/Admin | Get performance prediction |
| GET | `/api/v1/ml/predict/difficulty/:studentId/:moduleId` | Teacher/Admin | Get difficulty recommendation |
| GET | `/api/v1/ml/predict/engagement/:studentId` | Teacher/Admin | Get engagement prediction |
| GET | `/api/v1/ml/predict/insights/:studentId` | Teacher/Admin | Get comprehensive student insights |
| POST | `/api/v1/ml/predict/batch/dropout-risk` | Admin | Batch predict dropout risk |
| POST | `/api/v1/ml/predict/batch/classroom/:classroomId` | Teacher/Admin | Batch predict for classroom |
| GET | `/api/v1/ml/predict/dashboard/at-risk` | Teacher/Admin | Get students at risk dashboard |
| GET | `/api/v1/ml/predict/dashboard/metrics` | Admin | Get ML model performance metrics |

---

### Visualization Module (21 endpoints)

> **Activacion:** `ENABLE_DATA_WAREHOUSE=true`
> **Controllers:** 4 (AggregationController, ChartController, DashboardController, ReportController)
> **Auth:** `JwtAuthGuard` + `RolesGuard` (roles segun endpoint)

#### AggregationController (2 endpoints)

> **Route prefix:** `/api/v1/visualization/aggregation`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/v1/visualization/aggregation/query` | Teacher/Admin | Execute aggregation query |
| GET | `/api/v1/visualization/aggregation/kpi` | Teacher/Admin | Get KPI value |

#### ChartController (4 endpoints)

> **Route prefix:** `/api/v1/visualization/charts`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/v1/visualization/charts/generate` | Teacher/Admin | Generate a chart |
| GET | `/api/v1/visualization/charts/student/:studentId/progress` | Teacher/Admin/Parent | Get student progress charts |
| GET | `/api/v1/visualization/charts/classroom/:classroomId/comparison` | Teacher/Admin | Get class comparison chart |
| GET | `/api/v1/visualization/charts/engagement/heatmap` | Teacher/Admin | Get engagement heatmap |

#### DashboardController (7 endpoints)

> **Route prefix:** `/api/v1/visualization/dashboards`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/v1/visualization/dashboards` | Teacher/Admin | List dashboards |
| GET | `/api/v1/visualization/dashboards/templates` | Teacher/Admin | Get available dashboard templates |
| GET | `/api/v1/visualization/dashboards/:id` | Teacher/Admin | Get dashboard by ID |
| GET | `/api/v1/visualization/dashboards/:id/widgets/:widgetId` | Teacher/Admin | Get widget data |
| POST | `/api/v1/visualization/dashboards` | Admin | Create new dashboard |
| PUT | `/api/v1/visualization/dashboards/:id` | Admin | Update dashboard |
| DELETE | `/api/v1/visualization/dashboards/:id` | Admin | Delete dashboard |

#### ReportController (8 endpoints)

> **Route prefix:** `/api/v1/visualization/reports`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/v1/visualization/reports/templates` | Teacher/Admin | List available report templates |
| GET | `/api/v1/visualization/reports/templates/:id` | Teacher/Admin | Get report template by ID |
| POST | `/api/v1/visualization/reports/generate` | Teacher/Admin | Generate a report |
| GET | `/api/v1/visualization/reports/jobs/:jobId` | Teacher/Admin | Get report job status |
| GET | `/api/v1/visualization/reports/jobs/:jobId/download` | Teacher/Admin | Download generated report |
| POST | `/api/v1/visualization/reports/schedule` | Admin | Schedule a recurring report |
| GET | `/api/v1/visualization/reports/scheduled` | Admin | List scheduled reports |
| DELETE | `/api/v1/visualization/reports/scheduled/:id` | Admin | Cancel scheduled report |

---

*GAMILIT - API Reference*
*912 endpoints (activos) + 58 endpoints condicionales | 23 modulos + Admin Module + LTI + Assignments + ETL + ML + Visualization | JWT Auth | Socket.IO Real-time*
