---
title: "API Reference - Educational Modules"
status: activo
last_updated: "2026-02-28"
---

# API Reference - Educational Modules

> Volver al [API Reference Hub](../API-REFERENCE.md)

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

Prev: [Auth, Users & Tenants](01-AUTH-USERS-TENANTS.md) | Next: [Gamification](03-GAMIFICATION.md)
