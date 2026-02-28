---
title: Asignaciones Aula-Docente
category: admin
id: FL-ADM-18
version: 1.0.0
last_updated: 2026-02-27
---

# FL-ADM-18 - Asignaciones Aula-Docente

**ID:** FL-ADM-18
**Version:** 1.0.0
**Fecha:** 2026-02-27
**Estado:** Activo
**Portal:** Admin
**Prioridad:** P1

---

## 1. Resumen

Flujo de la pagina `/admin/classroom-teachers` donde el super_admin gestiona las asignaciones entre aulas y docentes. La pagina presenta dos pestanas: "Por Aula" (ver y gestionar docentes asignados a cada aula) y "Por Docente" (ver y gestionar aulas asignadas a cada docente). Permite asignar un docente a un aula, remover asignaciones existentes y realizar asignaciones masivas en lote (bulk). Los endpoints REST son manejados por `ClassroomTeachersRestController` que delega toda la logica a `ClassroomAssignmentsService`. Esta funcionalidad resuelve la historia de usuario US-AE-007.

---

## 2. Precondiciones

- Usuario autenticado con rol `super_admin`.
- Sesion activa con JWT valido.
- Existencia de al menos un aula y un docente (rol `admin_teacher`) en el sistema.

---

## 3. Diagrama Mermaid

```mermaid
flowchart TD
    A[Admin navega a /admin/classroom-teachers] --> B[AdminClassroomTeacherPage monta]
    B --> C[Tab activa: Por Aula]

    C --> D[ClassroomTeachersTab carga]
    D --> E[GET /admin/classrooms/list]
    E --> F[Dropdown de aulas disponibles]
    F --> G{Admin selecciona aula?}
    G -- Si --> H[GET /admin/classrooms/:id/teachers]
    H --> I[Lista de docentes del aula]

    I --> J{Acciones?}
    J -- Asignar docente --> K[POST /admin/classrooms/:id/teachers { teacherId }]
    K --> L[Asignacion creada]
    J -- Remover docente --> M[DELETE /admin/classrooms/:id/teachers/:teacherId]
    M --> N{Estudiantes activos?}
    N -- Sin estudiantes --> O[Asignacion removida]
    N -- Con estudiantes --> P[Error: usar force=true para confirmar]

    B --> Q[Tab: Por Docente]
    Q --> R[TeacherClassroomsTab carga]
    R --> S[GET /admin/teachers/list]
    S --> T[Dropdown de docentes]
    T --> U{Admin selecciona docente?}
    U -- Si --> V[GET /admin/teachers/:id/classrooms]
    V --> W[Lista de aulas del docente]

    W --> X{Asignar aulas al docente?}
    X -- Multiples aulas --> Y[POST /admin/teachers/:id/classrooms { classroomIds[] }]
    Y --> Z[Bulk assignment exitoso]

    B --> AA[Vista global]
    AA --> AB[GET /admin/classroom-teachers]
    AB --> AC[Lista paginada de todas las asignaciones]
    AC --> AD{Bulk assign pairs?}
    AD -- Si --> AE[POST /admin/classroom-teachers/bulk { assignments[] }]
    AE --> AF[Reporte de exito/fallido por par]
```

---

## 4. Secuencia FE -> BE -> DB

```
=== Carga lista de aulas (para dropdown) ===
1. FE: ClassroomTeachersTab monta -> GET /api/v1/admin/classrooms/list
2. BE: ClassroomTeachersRestController.listClassrooms(query)
3. BE: ClassroomAssignmentsService.listClassrooms() -> aulas activas del tenant
4. DB: SELECT id, name, grade, section FROM educational_content.classrooms WHERE active = true
5. BE: Retorna ClassroomListItemDto[] { id, name, grade, section, studentCount }
6. FE: Dropdown de aulas renderizado

=== Ver docentes de un aula ===
7. FE: Admin selecciona aula -> GET /api/v1/admin/classrooms/:classroomId/teachers
8. BE: ClassroomTeachersRestController.getClassroomTeachers(classroomId)
9. BE: ClassroomAssignmentsService.getClassroomWithTeachers(classroomId)
10. DB: SELECT t.*, ca.role, ca.assigned_at FROM auth.users t
        JOIN teacher_schema.classroom_assignments ca ON ca.teacher_id = t.id
        WHERE ca.classroom_id = :classroomId
11. BE: Retorna ClassroomWithTeachersDto { classroom: {...}, teachers: [TeacherDto] }
12. FE: Lista de docentes renderizada

=== Asignar docente a aula ===
13. FE: Admin click "Asignar Docente" -> POST /api/v1/admin/classrooms/:classroomId/teachers
        { teacherId: 'uuid', notes: '...' }
14. BE: ClassroomAssignmentsService.assignClassroomToTeacher({ teacherId, classroomId, notes })
15. DB: INSERT INTO teacher_schema.classroom_assignments (teacher_id, classroom_id, role, notes, assigned_at)
16. BE: Retorna assignment { classroom_id, name, teacher_id, role, student_count, assigned_at }
17. FE: Lista se actualiza con nuevo docente

=== Remover docente de aula ===
18. FE: Admin click remover -> DELETE /api/v1/admin/classrooms/:classroomId/teachers/:teacherId
19. BE: ClassroomAssignmentsService.removeClassroomAssignment(teacherId, classroomId, dto)
20. BE: Verifica si hay estudiantes activos en el aula
21. Si estudiantes Y !force -> error 400 "Classroom has active students"
22. Si !estudiantes O force -> DELETE FROM classroom_assignments
23. BE: Retorna { message: 'Teacher removed successfully' }
24. FE: Docente removido de lista

=== Asignar aulas a docente (multiple) ===
25. FE: POST /api/v1/admin/teachers/:teacherId/classrooms { classroomIds: ['uuid1', 'uuid2'] }
26. BE: ClassroomAssignmentsService.bulkAssignClassrooms({ teacherId, classroomIds })
27. DB: INSERT multiple en classroom_assignments (puede haber conflictos 409 por existentes)
28. BE: Retorna { assigned: N, classrooms: [{ id, name }] }
29. FE: Lista actualizada con nuevas asignaciones

=== Bulk assign pares (masivo) ===
30. FE: POST /api/v1/admin/classroom-teachers/bulk
        { assignments: [{ teacherId, classroomId }, ...] }
31. BE: ClassroomAssignmentsService.bulkAssignPairs(assignments)
32. DB: Insercion multiple con manejo de conflictos
33. BE: Retorna { assigned: N, successful: [...], failed: [{ teacherId, classroomId, reason }] }
34. FE: Reporte de resultados: cuantos OK, cuantos fallaron y por que
```

---

## 5. Componentes y artefactos implicados

### Frontend

| Tipo | Archivo |
|------|---------|
| Pagina | `apps/frontend/src/apps/admin/pages/AdminClassroomTeacherPage.tsx` |
| Tab por aula | `apps/frontend/src/apps/admin/components/classroom-teacher/ClassroomTeachersTab.tsx` |
| Tab por docente | `apps/frontend/src/apps/admin/components/classroom-teacher/TeacherClassroomsTab.tsx` |
| API service | `apps/frontend/src/services/api/admin/classroomTeacherApi.ts` |
| Layout | `apps/frontend/src/apps/admin/components/shared/AdminPageShell.tsx` |

### Backend

| Tipo | Archivo |
|------|---------|
| Controller REST | `apps/backend/src/modules/admin/controllers/classroom-teachers-rest.controller.ts` |
| Service | `apps/backend/src/modules/admin/services/classroom-assignments.service.ts` |
| DTOs | `apps/backend/src/modules/admin/dto/classroom-assignments/` |

### Base de Datos

| Tipo | Archivo |
|------|---------|
| Tabla classroom_assignments | Tabla en schema teacher o classrooms |

---

## 6. Reglas y validaciones

| Regla | Capa | Descripcion |
|-------|------|-------------|
| Solo super_admin | BE | JwtAuthGuard + AdminGuard |
| UUID validos | BE | Validacion de classroomId y teacherId |
| Prevenir duplicados | BE | 409 si ya existe asignacion |
| Estudiantes activos protegen remocion | BE | Error 400 sin force=true |
| Docentes: solo admin_teacher y super_admin | BE | Filtro en listTeachers |
| Bulk reports parciales | BE | Retorna exito y fallos por separado |

---

## 7. Manejo de errores

| Escenario | Capa | Codigo HTTP | Comportamiento |
|-----------|------|-------------|----------------|
| Token JWT expirado | BE | 401 | Redirige a login |
| Rol insuficiente | BE | 403 | ForbiddenException |
| Aula no encontrada | BE | 404 | NotFoundException |
| Docente no encontrado | BE | 404 | NotFoundException |
| Asignacion ya existe | BE | 409 | "Teacher already assigned" |
| Aula con estudiantes sin force | BE | 400 | "Classroom has active students" |
| Bulk con fallos parciales | BE | 201 | Retorna failed[] con razones |

---

## 8. Trazabilidad cruzada

| Capa | Archivo | Evidencia |
|------|---------|-----------|
| Frontend Pagina | `apps/frontend/src/apps/admin/pages/AdminClassroomTeacherPage.tsx` | US-AE-007 implementado |
| Frontend Tab | `apps/frontend/src/apps/admin/components/classroom-teacher/ClassroomTeachersTab.tsx` | Vista por aula |
| Frontend Tab | `apps/frontend/src/apps/admin/components/classroom-teacher/TeacherClassroomsTab.tsx` | Vista por docente |
| Backend Controller | `apps/backend/src/modules/admin/controllers/classroom-teachers-rest.controller.ts` | 9 endpoints REST |
| Backend Service | `apps/backend/src/modules/admin/services/classroom-assignments.service.ts` | Logica de asignaciones |

---

## 9. Referencias

- Flujo gestion usuarios: [FL-ADM-01](./FLUJO-GESTION-USUARIOS-ROLES.md)
- Flujo asignaciones admin: [FL-ADM-19](./FLUJO-ASIGNACIONES-ADMIN.md)
- Flujo instituciones: [FL-ADM-10](./FLUJO-INSTITUCIONES-ROLES.md)
