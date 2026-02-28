---
title: "API Reference - Classrooms, Students & Teachers"
status: activo
last_updated: "2026-02-28"
---

# API Reference - Classrooms, Students & Teachers

> Volver al [API Reference Hub](../API-REFERENCE.md)

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

### BonusCoins — Bonus ML Coins (1 endpoint)

> **Controller:** `TeacherController` en `apps/backend/src/modules/teacher/controllers/teacher.controller.ts`
> **Guard:** `JwtAuthGuard` + `RolesGuard` (roles: `admin_teacher`, `super_admin`)
> **Service:** `BonusCoinsService` — valida que el estudiante pertenezca a un aula del teacher

| Method | Endpoint | Description | Auth | Roles |
|--------|----------|-------------|------|-------|
| POST | `/api/v1/teacher/students/:studentId/bonus` | Otorgar bonus de ML Coins a un estudiante (amount: 1-1000, requiere reason). Valida que el teacher tenga acceso al estudiante. | Si | teacher |

### Teacher Content — Contenido Educativo Personalizado (13 endpoints)

> **Controller:** `TeacherContentController` en `apps/backend/src/modules/teacher/controllers/teacher-content.controller.ts`
> **Guard:** `JwtAuthGuard` + `RolesGuard` (roles: `admin_teacher`, `super_admin`)
> **Prefijo base:** `/api/v1/teacher/content`

| Method | Endpoint | Description | Auth | Roles |
|--------|----------|-------------|------|-------|
| GET | `/api/v1/teacher/content` | Listar contenido del teacher (paginado, filtros: type, status, visibility, subject_area, grade_level, difficulty_level) | Si | teacher |
| GET | `/api/v1/teacher/content/:id` | Obtener detalle de un contenido por ID (solo el owner puede acceder) | Si | teacher |
| POST | `/api/v1/teacher/content` | Crear nuevo contenido educativo (exercise, worksheet, reading_material, etc.) | Si | teacher |
| PUT | `/api/v1/teacher/content/:id` | Actualizar contenido existente (solo el owner) | Si | teacher |
| DELETE | `/api/v1/teacher/content/:id` | Eliminar contenido (soft delete, solo el owner) | Si | teacher |
| POST | `/api/v1/teacher/content/:id/clone` | Clonar contenido existente (crea copia en estado draft) | Si | teacher |
| PATCH | `/api/v1/teacher/content/:id/publish` | Publicar contenido (status -> published) | Si | teacher |

#### Resource Sharing — Recursos Compartidos (6 sub-endpoints, GAP-15)

> Endpoints para navegar, calificar, comentar y descargar recursos educativos compartidos entre teachers.
> Prefijo: `/api/v1/teacher/content/resources` (definidos ANTES de `:id` para evitar conflicto de rutas)

| Method | Endpoint | Description | Auth | Roles |
|--------|----------|-------------|------|-------|
| GET | `/api/v1/teacher/content/resources` | Navegar recursos compartidos publicados con visibilidad school/public (paginado, filtros: type, category, search, sort_by) | Si | teacher |
| GET | `/api/v1/teacher/content/resources/:id` | Obtener detalle de un recurso compartido (incluye rating, downloads, comment count) | Si | teacher |
| POST | `/api/v1/teacher/content/resources/:id/rate` | Calificar un recurso compartido (upsert, escala 1-5, un voto por teacher) | Si | teacher |
| GET | `/api/v1/teacher/content/resources/:id/comments` | Listar comentarios de un recurso compartido (paginado) | Si | teacher |
| POST | `/api/v1/teacher/content/resources/:id/comments` | Agregar comentario a un recurso compartido | Si | teacher |
| POST | `/api/v1/teacher/content/resources/:id/download` | Registrar descarga de un recurso compartido (incrementa contador) | Si | teacher |

---

Prev: [Gamification](03-GAMIFICATION.md) | Next: [Support](05-SUPPORT.md)
