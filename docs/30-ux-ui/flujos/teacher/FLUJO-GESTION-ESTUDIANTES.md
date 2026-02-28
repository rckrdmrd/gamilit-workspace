---
title: Gestion de Estudiantes
category: teacher
id: FL-TCH-09
version: 1.0.0
last_updated: 2026-02-27
---

# FL-TCH-09 - Gestion de Estudiantes

**ID:** FL-TCH-09
**Version:** 1.0.0
**Fecha:** 2026-02-27
**Estado:** Activo
**Portal:** Teacher
**Prioridad:** P1

---

## 1. Resumen

Flujo de la pagina `/teacher/students` del portal docente. Permite al maestro visualizar todos los estudiantes de sus aulas en una tabla unificada con datos de rendimiento, tasa de completitud y ultima actividad. Soporta filtros por aula y nivel de desempeno, busqueda por nombre, y ordenamiento por multiples campos. Al seleccionar un estudiante se abre un `StudentDetailModal` con datos detallados de progreso, estadisticas y opciones de bloqueo/desbloqueo. El docente tambien puede agregar o actualizar notas privadas sobre el estudiante desde el modal.

---

## 2. Precondiciones

- Usuario autenticado con rol `teacher` o `admin_teacher`.
- Sesion activa con JWT valido.
- Docente asignado a al menos un classroom activo en `social_features.teacher_classrooms`.
- Los classrooms del docente tienen al menos un estudiante matriculado.

---

## 3. Diagrama Mermaid

```mermaid
flowchart TD
    A[Docente navega a /teacher/students] --> B[TeacherStudentsPage monta]
    B --> C[useClassrooms: GET /teacher/classrooms]
    C --> D{Classrooms cargados?}
    D -- No --> E[Skeleton loading]
    D -- Si --> F[Fetch paralelo: GET /teacher/classrooms/:id/students para cada aula]
    F --> G[Unificar y enriquecer datos en frontend]
    G --> H[Renderizar tabla de estudiantes con filtros]

    H --> I{Interaccion del docente?}
    I -- Filtro por aula --> J[Actualizar classroomIds -> refetch]
    I -- Filtro por rendimiento --> K[Filtrar localmente por performance_level]
    I -- Busqueda --> L[Filtrar localmente por nombre]
    I -- Click en fila --> M[GET /teacher/students/:id/progress + GET /teacher/students/:id/stats + GET /teacher/students/:id/notes]
    M --> N[Abrir StudentDetailModal]

    N --> O{Accion en modal?}
    O -- Agregar nota --> P[POST /teacher/students/:studentId/note]
    O -- Ver detalle progreso --> Q[Datos del modal]
    O -- Bloquear/Desbloquear --> R[POST /teacher/classrooms/:classroomId/students/:studentId/block|unblock]
    O -- Cerrar --> H
```

---

## 4. Secuencia FE -> BE -> DB

```
=== Carga inicial - Lista de estudiantes ===
1. FE: TeacherStudentsPage monta -> dispara useClassrooms (React Query)
2. FE: GET /api/v1/teacher/classrooms
3. BE: TeacherClassroomsController.getClassrooms() -> filtra por teacherId del JWT
4. DB: SELECT FROM social_features.teacher_classrooms WHERE teacher_id = :teacherId AND status = 'active'
5. BE: Retorna lista paginada de classrooms con metadata

6. FE: Para cada classroom, GET /api/v1/teacher/classrooms/:id/students
7. BE: TeacherClassroomsController.getClassroomStudents() -> students del aula con progreso
8. DB: SELECT u.*, sp.*, cm.* FROM auth.users u
       JOIN student_tracking.student_profiles sp ON u.id = sp.user_id
       JOIN social_features.classroom_members cm ON sp.user_id = cm.user_id
       WHERE cm.classroom_id = :classroomId AND cm.status = 'active'
       (RLS filtra automaticamente por tenant)
9. BE: Retorna { data: StudentSummary[], total, page, limit }
10. FE: Enriquece datos: agrega classroom_name, calcula performance_level desde score_average

=== Apertura del modal de detalle ===
11. FE: Click en fila -> dispara 3 fetches en paralelo
12. FE: GET /api/v1/teacher/students/:studentId/progress
13. BE: TeacherController.getStudentProgress() -> StudentProgressService.getStudentProgressResponse()
14. DB: SELECT FROM progress_tracking.module_progress, exercise_attempts WHERE user_id = :studentId
15. BE: Retorna { overall: { completionRate, avgScore }, modules: ModuleProgress[] }

16. FE: GET /api/v1/teacher/students/:studentId/stats
17. BE: TeacherController.getStudentStats() -> StudentProgressService.getStudentStatsResponse()
18. DB: SELECT FROM gamification_system.user_stats WHERE user_id = :studentId
19. BE: Retorna { totalXp, level, rank, streakDays, mlCoins, hintsUsed, ... }

20. FE: GET /api/v1/teacher/students/:studentId/notes?teacherId=:teacherId
21. BE: TeacherController.getStudentNotes() -> StudentProgressService.getStudentNotes()
22. DB: SELECT FROM student_tracking.teacher_notes WHERE student_id = :studentId AND teacher_id = :teacherId
23. BE: Retorna array de StudentNoteResponseDto

24. FE: Renderiza StudentDetailModal con los 3 datasets

=== Agregar o actualizar nota ===
25. FE: Docente escribe nota y hace click en guardar
26. FE: POST /api/v1/teacher/students/:studentId/note
27. BE: TeacherController.addStudentNote() -> StudentProgressService.addStudentNote()
28. DB: INSERT INTO student_tracking.teacher_notes ... ON CONFLICT UPDATE SET content = :content
29. BE: Retorna StudentNoteResponseDto actualizado
30. FE: Invalida queryKey -> refetch notas, muestra toast de exito

=== Bloqueo de estudiante ===
31. FE: Toggle bloqueo en modal
32. FE: POST /api/v1/teacher/classrooms/:classroomId/students/:studentId/block
33. BE: TeacherClassroomsController.blockStudent() -> StudentBlockingService.blockStudent()
34. DB: UPDATE social_features.classroom_members SET is_blocked = true, block_type = :type WHERE ...
35. BE: Retorna StudentPermissionsResponseDto
36. FE: Actualiza estado local del estudiante, muestra toast de confirmacion
```

---

## 5. Componentes y artefactos implicados

### Frontend

| Tipo | Archivo |
|------|---------|
| Pagina | `apps/frontend/src/apps/teacher/pages/TeacherStudentsPage.tsx` |
| Modal detalle | `apps/frontend/src/apps/teacher/components/monitoring/StudentDetailModal.tsx` |
| Hook classrooms | `apps/frontend/src/apps/teacher/hooks/useClassrooms.ts` |
| API classrooms | `apps/frontend/src/services/api/teacher/classroomsApi.ts` |
| Ruta | `apps/frontend/src/App.tsx` (ruta: `/teacher/students`) |

### Backend

| Tipo | Archivo |
|------|---------|
| Controller classrooms | `apps/backend/src/modules/teacher/controllers/teacher-classrooms.controller.ts` |
| Controller teacher | `apps/backend/src/modules/teacher/controllers/teacher.controller.ts` |
| Service classrooms CRUD | `apps/backend/src/modules/teacher/services/teacher-classrooms-crud.service.ts` |
| Service student progress | `apps/backend/src/modules/teacher/services/student-progress.service.ts` |
| Service student blocking | `apps/backend/src/modules/teacher/services/student-blocking.service.ts` |

### Base de Datos

| Tipo | Archivo |
|------|---------|
| Tabla classroom_members | `apps/database/ddl/schemas/social_features/tables/classroom_members.sql` |
| Tabla teacher_classrooms | `apps/database/ddl/schemas/social_features/tables/teacher_classrooms.sql` |
| Tabla student_profiles | `apps/database/ddl/schemas/student_tracking/tables/student_profiles.sql` |
| Tabla teacher_notes | `apps/database/ddl/schemas/student_tracking/tables/teacher_notes.sql` |
| Tabla user_stats | `apps/database/ddl/schemas/gamification_system/tables/01-user_stats.sql` |

---

## 6. Endpoints Involucrados

| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| GET | `/api/v1/teacher/classrooms` | Lista classrooms del docente (paginado, filtros) |
| GET | `/api/v1/teacher/classrooms/:id/students` | Lista estudiantes del aula con progreso |
| GET | `/api/v1/teacher/students/:studentId/progress` | Progreso completo del estudiante por modulo |
| GET | `/api/v1/teacher/students/:studentId/stats` | Estadisticas de gamificacion del estudiante |
| GET | `/api/v1/teacher/students/:studentId/notes` | Notas del docente sobre el estudiante |
| POST | `/api/v1/teacher/students/:studentId/note` | Agregar o actualizar nota privada |
| POST | `/api/v1/teacher/classrooms/:cid/students/:sid/block` | Bloquear estudiante en el aula |
| POST | `/api/v1/teacher/classrooms/:cid/students/:sid/unblock` | Desbloquear estudiante |
| GET | `/api/v1/teacher/classrooms/:cid/students/:sid/permissions` | Consultar permisos actuales |

---

## 7. Reglas y validaciones

| Regla | Capa | Descripcion |
|-------|------|-------------|
| Autenticacion + rol teacher | BE | JwtAuthGuard + RolesGuard(@Roles(ADMIN_TEACHER)) |
| Solo datos de sus aulas | BE | Filtro por teacherId del JWT en todas las queries de classrooms |
| RLS por tenant | DB | Datos filtrados automaticamente por tenant_id |
| Bloqueo solo por owner | BE | StudentBlockingService valida que el teacher tenga acceso al classroom |
| Nota unica por par (teacher, student, classroom) | DB | UNIQUE constraint en teacher_notes, upsert en conflicto |
| performance_level calculado en FE | FE | high >= 80, medium >= 50, low < 50 basado en score_average |
| Paginacion en classroomStudents | BE | default limit 20, max parametrizable |

---

## 8. Manejo de errores

| Escenario | Capa | Codigo HTTP | Comportamiento |
|-----------|------|-------------|----------------|
| Token JWT expirado | BE | 401 | Redirige a login |
| Docente sin classrooms | FE | 200 | Tabla vacia con EmptyState y CTA |
| Error en fetch de un aula | FE | N/A | Se omite ese aula, resto carga normalmente |
| Estudiante no encontrado | BE | 404 | Modal muestra error con mensaje descriptivo |
| Teacher sin acceso al classroom | BE | 403 | ForbiddenException, toast de error en FE |
| Error al guardar nota | FE | N/A | Toast de error, nota no se persiste |
| Estudiante ya bloqueado | BE | 400 | BadRequestException, FE muestra mensaje informativo |

---

## 9. Trazabilidad cruzada

| Capa | Archivo | Evidencia |
|------|---------|-----------|
| Frontend Pagina | `apps/frontend/src/apps/teacher/pages/TeacherStudentsPage.tsx` | Vista unificada de todos los estudiantes |
| Frontend Modal | `apps/frontend/src/apps/teacher/components/monitoring/StudentDetailModal.tsx` | Modal con progreso, stats y notas |
| Backend Controller | `apps/backend/src/modules/teacher/controllers/teacher-classrooms.controller.ts` | CRUD classrooms + student management |
| Backend Controller | `apps/backend/src/modules/teacher/controllers/teacher.controller.ts` | Student progress, stats, notes |
| DDL classroom_members | `apps/database/ddl/schemas/social_features/tables/classroom_members.sql` | Membresia y bloqueo de estudiantes |
| DDL teacher_notes | `apps/database/ddl/schemas/student_tracking/tables/teacher_notes.sql` | Notas privadas del docente |

---

## 10. Referencias

- Flujo progreso academico: [FL-TCH-10](./FLUJO-PROGRESO-ACADEMICO.md)
- Flujo monitoreo y alertas: [FL-TCH-06](./FLUJO-MONITOREO-ALERTAS.md)
- Flujo revision manual: [FL-TCH-07](./FLUJO-REVISION-MANUAL-M3-M5.md)
- Guia portal docente: `docs/60-portals/teacher/PORTAL-TEACHER-GUIDE.md`
