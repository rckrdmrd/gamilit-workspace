# Teacher API (Referencia)

**Proyecto:** Gamilit Platform
**Módulo:** API Reference
**Categoría:** Teacher Portal
**Archivo original:** API-REFERENCE.md (líneas 625-2159)
**Versión:** 2.0 (RFC-0001 Modularizado)
**Fecha:** 2025-11-01

---

## Nota

La documentación completa del Teacher API (29 endpoints, 100% documentado) se encuentra en el archivo original API-REFERENCE.md, líneas 625-2159.

**Estructura:**
- **Classroom Management (8 endpoints):** POST, GET, GET/:id, PUT, DELETE, GET students, POST students, DELETE student
- **Assignments (8 endpoints):** POST, GET, GET/:id, PUT, DELETE, POST assign, GET submissions, POST grade
- **Grading (4 endpoints):** GET pending, GET/:id, POST grade, POST feedback
- **Student Progress (4 endpoints):** GET progress, GET analytics, GET notes, POST note
- **Analytics (5 endpoints):** GET classroom, GET student, GET assignment, GET engagement, GET reports

---

## Endpoints Principales

### Classroom Management
- `POST /api/teacher/classrooms` - Crear classroom
- `GET /api/teacher/classrooms` - Listar classrooms
- `GET /api/teacher/classrooms/:id` - Detalles de classroom
- `PUT /api/teacher/classrooms/:id` - Actualizar classroom
- `DELETE /api/teacher/classrooms/:id` - Eliminar classroom
- `GET /api/teacher/classrooms/:id/students` - Listar estudiantes
- `POST /api/teacher/classrooms/:id/students` - Agregar estudiantes (bulk)
- `DELETE /api/teacher/classrooms/:classId/students/:studentId` - Remover estudiante

### Assignments
- `POST /api/teacher/assignments` - Crear assignment
- `GET /api/teacher/assignments` - Listar assignments
- `GET /api/teacher/assignments/:id` - Detalles de assignment
- `PUT /api/teacher/assignments/:id` - Actualizar assignment
- `DELETE /api/teacher/assignments/:id` - Eliminar assignment
- `POST /api/teacher/assignments/:id/assign` - Asignar a classroom
- `GET /api/teacher/assignments/:id/submissions` - Ver submissions
- `POST /api/teacher/assignments/:id/grade` - Calificar submission

### Grading
- `GET /api/teacher/grading/pending` - Submissions pendientes
- `GET /api/teacher/grading/:submissionId` - Detalles de submission
- `POST /api/teacher/grading/:submissionId/grade` - Calificar
- `POST /api/teacher/grading/:submissionId/feedback` - Agregar feedback

### Student Progress
- `GET /api/teacher/students/:studentId/progress` - Progreso del estudiante
- `GET /api/teacher/students/:studentId/analytics` - Analytics del estudiante
- `GET /api/teacher/students/:studentId/notes` - Notas del profesor
- `POST /api/teacher/students/:studentId/notes` - Agregar nota

### Analytics
- `GET /api/teacher/analytics/classroom/:classroomId` - Analytics de classroom
- `GET /api/teacher/analytics/student/:studentId` - Analytics de estudiante
- `GET /api/teacher/analytics/assignment/:assignmentId` - Analytics de assignment
- `GET /api/teacher/analytics/engagement` - Métricas de engagement
- `GET /api/teacher/analytics/reports` - Generar reportes

---

## Autenticación

**Roles requeridos:** `teacher`, `admin_teacher`, `super_admin`

**Rate Limiting:** Standard (100 requests/15min)

---

## Documentación Completa

> **Fuentes de requerimientos:**
> - [Teacher Portal - Requerimientos](../../../01-requerimientos/teacher-portal/) - Funcionalidades del portal de profesores
> - [UC-TEA-001 - Gestión de Aulas](../../../01-requerimientos/casos-uso/teacher/UC-TEA-001-gestion-aulas.md)

Ver archivo original: [API-REFERENCE.md](../API-REFERENCE.md) (líneas 625-2159)

**Referencias relacionadas:**
- [TYPES-TEACHER.md](../../tipos-compartidos/TYPES-TEACHER.md) - Tipos TypeScript para Teacher Portal
- [Backend - API Teacher](../../../03-desarrollo/backend/api/) - Implementación de endpoints

Cada endpoint incluye:
- Descripción detallada
- Permisos requeridos y rate limiting
- Request/Response schemas TypeScript completos
- Ejemplos curl funcionales
- Todos los códigos de error (400, 401, 403, 404, 422, 429, 500)
- Lista completa de validaciones
- Middleware aplicado
- Notas de implementación

---

**Última actualización:** 2025-11-01
**Mantenido por:** GAMILIT Platform Team
