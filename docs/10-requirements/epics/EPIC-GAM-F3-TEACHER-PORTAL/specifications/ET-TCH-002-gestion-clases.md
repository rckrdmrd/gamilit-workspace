---
id: "ET-TCH-002"
title: "Gestion de Clases y Estudiantes - Especificacion Tecnica"
type: "Especificacion Tecnica"
status: "Implementado"
priority: "P0"
epic: "EXT-001"
module: "teacher"
labels: ["teacher", "classrooms", "students", "enrollment", "crud"]
created_date: "2026-01-27"
updated_date: "2026-01-27"
related_rf: ["RF-TCH-001a", "RF-TCH-001b"]
related_us: ["US-PM-001a", "US-PM-001b"]
---

# ET-TCH-002: Gestion de Clases y Estudiantes - Especificacion Tecnica

## Informacion General

| Campo | Valor |
|-------|-------|
| **ID** | ET-TCH-002 |
| **Epic** | EXT-001 - Portal de Maestros |
| **RF Relacionados** | RF-TCH-001a (CRUD Classrooms), RF-TCH-001b (Student Enrollment) |
| **US Relacionadas** | US-PM-001a, US-PM-001b |
| **Prioridad** | P0 - Critico |
| **Estado** | Implementado |

---

## Descripcion Tecnica

Sistema de gestion completa de classrooms y estudiantes que permite a los maestros:

1. **CRUD de Classrooms**: Crear, leer, actualizar y eliminar aulas
2. **Inscripcion de Estudiantes**: Agregar estudiantes individual o masivamente
3. **Gestion de Miembros**: Ver, filtrar y gestionar estudiantes por aula
4. **Estadisticas de Aula**: Metricas de progreso y engagement por classroom

---

## Componentes Frontend

### Paginas Principales

| Componente | Path | Descripcion |
|------------|------|-------------|
| `TeacherClasses` | `apps/frontend/src/apps/teacher/pages/TeacherClasses.tsx` | Listado de clases del maestro |
| `TeacherStudents` | `apps/frontend/src/apps/teacher/pages/TeacherStudents.tsx` | Vista de estudiantes con filtrado por clase |

### Componentes de Dashboard

| Componente | Path | Descripcion |
|------------|------|-------------|
| `ClassroomCard` | `apps/frontend/src/apps/teacher/components/dashboard/ClassroomCard.tsx` | Card de classroom con estadisticas |
| `ClassroomsGrid` | `apps/frontend/src/apps/teacher/components/dashboard/ClassroomsGrid.tsx` | Grid de classrooms |
| `CreateClassroomModal` | `apps/frontend/src/apps/teacher/components/dashboard/CreateClassroomModal.tsx` | Modal para crear nuevo classroom |

### Componentes de Monitoreo

| Componente | Path | Descripcion |
|------------|------|-------------|
| `StudentMonitoringPanel` | `apps/frontend/src/apps/teacher/components/monitoring/StudentMonitoringPanel.tsx` | Panel de monitoreo de estudiantes |
| `StudentStatusCard` | `apps/frontend/src/apps/teacher/components/monitoring/StudentStatusCard.tsx` | Card de estado de estudiante |
| `StudentDetailModal` | `apps/frontend/src/apps/teacher/components/monitoring/StudentDetailModal.tsx` | Modal de detalle de estudiante |
| `StudentPagination` | `apps/frontend/src/apps/teacher/components/monitoring/StudentPagination.tsx` | Paginacion de estudiantes |
| `RefreshControl` | `apps/frontend/src/apps/teacher/components/monitoring/RefreshControl.tsx` | Control de refresh |

### Hooks

| Hook | Path | Descripcion |
|------|------|-------------|
| `useClassrooms` | `apps/frontend/src/apps/teacher/hooks/useClassrooms.ts` | Hook para CRUD de classrooms |
| `useClassroomData` | `apps/frontend/src/apps/teacher/hooks/useClassroomData.ts` | Hook para datos de classroom |
| `useClassroomRealtime` | `apps/frontend/src/apps/teacher/hooks/useClassroomRealtime.ts` | Hook para datos en tiempo real |
| ~~`useStudentProgress`~~ | ~~`apps/frontend/src/apps/teacher/hooks/useStudentProgress.ts`~~ | **Removed** (eliminado en Teacher Portal Audit 2026-02-20) — funcionalidad integrada en `useAnalytics` y `studentProgressApi` |

### API Frontend

| API | Path | Descripcion |
|-----|------|-------------|
| `teacherApi` | `apps/frontend/src/services/api/teacher/teacherApi.ts` | API base del teacher |
| `studentProgressApi` | `apps/frontend/src/services/api/teacher/studentProgressApi.ts` | API de progreso de estudiantes |

---

## Servicios Backend

### Servicios Principales

| Servicio | Path | Descripcion |
|----------|------|-------------|
| `TeacherClassroomsCrudService` | `apps/backend/src/modules/teacher/services/teacher-classrooms-crud.service.ts` | CRUD completo de classrooms |
| `StudentBlockingService` | `apps/backend/src/modules/teacher/services/student-blocking.service.ts` | Bloqueo y permisos de estudiantes |
| `StudentProgressService` | `apps/backend/src/modules/teacher/services/student-progress.service.ts` | Progreso de estudiantes |

### Controladores

| Controlador | Path | Descripcion |
|-------------|------|-------------|
| `TeacherClassroomsController` | `apps/backend/src/modules/teacher/controllers/teacher-classrooms.controller.ts` | Controlador de classrooms y estudiantes |

### DTOs

| DTO | Path | Descripcion |
|-----|------|-------------|
| `CreateTeacherClassroomDto` | `apps/backend/src/modules/teacher/dto/classroom.dto.ts` | DTO para crear classroom |
| `UpdateTeacherClassroomDto` | `apps/backend/src/modules/teacher/dto/classroom.dto.ts` | DTO para actualizar classroom |
| `GetClassroomsQueryDto` | `apps/backend/src/modules/teacher/dto/classroom.dto.ts` | Query params para listar classrooms |
| `GetClassroomStudentsQueryDto` | `apps/backend/src/modules/teacher/dto/classroom.dto.ts` | Query params para estudiantes |
| `TeacherClassroomResponseDto` | `apps/backend/src/modules/teacher/dto/classroom-response.dto.ts` | Response de classroom |
| `ClassroomStatsDto` | `apps/backend/src/modules/teacher/dto/classroom.dto.ts` | Estadisticas de classroom |

### Guards

| Guard | Path | Descripcion |
|-------|------|-------------|
| `TeacherGuard` | `apps/backend/src/modules/teacher/guards/teacher.guard.ts` | Verificar rol de profesor |
| `ClassroomOwnershipGuard` | `apps/backend/src/modules/teacher/guards/classroom-ownership.guard.ts` | Verificar acceso a aula |

---

## Tablas/Schemas de Base de Datos

### Schema: `social_features`

| Tabla | Descripcion | Columnas Clave |
|-------|-------------|----------------|
| `classrooms` | Aulas del sistema | id, name, grade_level, max_students, is_active, created_at |
| `classroom_members` | Miembros de aulas | id, classroom_id, user_id, enrollment_method, enrolled_by, enrolled_at |
| `teacher_classroom` | Relacion maestro-aula | id, teacher_id, classroom_id, is_primary, assigned_at |

### Columnas Extendidas en `classrooms`

```sql
teacher_id UUID REFERENCES auth.users(id),  -- Maestro principal
max_students INTEGER DEFAULT 30,             -- Limite de estudiantes
is_active BOOLEAN DEFAULT true               -- Estado activo/inactivo
```

### Columnas en `classroom_members`

```sql
enrollment_method VARCHAR(20) CHECK (enrollment_method IN ('invite', 'code', 'bulk')),
enrolled_by UUID REFERENCES auth.users(id),  -- Maestro que inscribio
```

---

## APIs Endpoints

### CRUD de Classrooms

| Endpoint | Metodo | Descripcion |
|----------|--------|-------------|
| `/api/v1/teacher/classrooms` | GET | Listar classrooms del teacher |
| `/api/v1/teacher/classrooms/:id` | GET | Obtener classroom por ID |
| `/api/v1/teacher/classrooms` | POST | Crear nuevo classroom |
| `/api/v1/teacher/classrooms/:id` | PUT | Actualizar classroom |
| `/api/v1/teacher/classrooms/:id` | DELETE | Eliminar classroom |

### Gestion de Estudiantes

| Endpoint | Metodo | Descripcion |
|----------|--------|-------------|
| `/api/v1/teacher/classrooms/:id/students` | GET | Listar estudiantes del classroom |
| `/api/v1/teacher/classrooms/:id/enroll` | POST | Inscribir estudiante individual |
| `/api/v1/teacher/classrooms/:id/enroll-bulk` | POST | Inscripcion masiva |
| `/api/v1/teacher/classrooms/:id/students/:studentId` | DELETE | Remover estudiante |

### Estadisticas

| Endpoint | Metodo | Descripcion |
|----------|--------|-------------|
| `/api/v1/teacher/classrooms/:id/stats` | GET | Estadisticas del classroom |
| `/api/v1/teacher/classrooms/:id/teachers` | GET | Listar teachers del classroom |

### Ejemplo Response GET /teacher/classrooms

```json
{
  "data": [
    {
      "id": "uuid-classroom-1",
      "name": "Matematicas 6A",
      "gradeLevel": "6",
      "studentCount": 25,
      "maxStudents": 30,
      "isActive": true,
      "averageProgress": 65.5,
      "lastActivity": "2026-01-27T10:00:00Z",
      "createdAt": "2025-11-01T00:00:00Z"
    }
  ],
  "meta": {
    "total": 3,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
}
```

---

## Flujos de Usuario

### Flujo 1: Crear Classroom

```
1. Maestro accede a /teacher/classes
2. Click en "Crear Nuevo Classroom"
3. CreateClassroomModal se abre
4. Llenar nombre, nivel, limite de estudiantes
5. Submit -> POST /teacher/classrooms
6. Classroom creado, se agrega a lista
```

### Flujo 2: Inscribir Estudiantes

```
1. Maestro accede a classroom existente
2. Click en "Agregar Estudiantes"
3. Opciones: Individual, Por codigo, Masivo
4. Individual: Buscar estudiante -> POST /enroll
5. Masivo: Subir CSV -> POST /enroll-bulk
6. Estudiantes inscritos con enrollment_method correspondiente
```

### Flujo 3: Ver Estudiantes de Clase

```
1. Maestro selecciona classroom
2. GET /teacher/classrooms/:id/students
3. StudentMonitoringPanel muestra lista
4. Filtrar por nombre, estado, progreso
5. Click en estudiante -> StudentDetailModal
```

### Flujo 4: Eliminar Estudiante

```
1. Maestro en detalle de classroom
2. Click en remover estudiante
3. Confirmacion
4. DELETE /teacher/classrooms/:id/students/:studentId
5. Estudiante removido de lista
```

---

## Dependencias

### Dependencias de Modulos

- `AuthModule` - Para usuarios y roles
- `SocialModule` - Para entidades de classroom
- `ProgressModule` - Para estadisticas de progreso

### Dependencias de User Stories

- Depende de: `EAI-001` (Auth y roles)
- Habilita: `US-PM-002*` (Assignments), `US-PM-004*` (Analytics)

---

## Criterios de Aceptacion

### CA-01: CRUD de Classrooms
- [x] Crear classroom con nombre, nivel, limite
- [x] Actualizar informacion del classroom
- [x] Eliminar classroom (soft delete o cascade)
- [x] Listar classrooms con paginacion

### CA-02: Inscripcion de Estudiantes
- [x] Inscribir estudiante individual
- [x] Inscripcion masiva por CSV
- [x] Metodos de enrollment registrados (invite/code/bulk)
- [x] Validacion de limite de estudiantes

### CA-03: Gestion de Miembros
- [x] Ver lista de estudiantes por classroom
- [x] Filtrar por nombre y estado
- [x] Remover estudiante del classroom
- [x] Ver detalle de estudiante

### CA-04: Estadisticas
- [x] Total de estudiantes por classroom
- [x] Progreso promedio del classroom
- [x] Ultima actividad registrada

### CA-05: Seguridad
- [x] Solo maestro asignado puede gestionar su classroom
- [x] TeacherGuard valida rol
- [x] ClassroomOwnershipGuard valida acceso

---

## Notas de Implementacion

### Validacion de Ownership

```typescript
@UseGuards(JwtAuthGuard, RolesGuard, ClassroomOwnershipGuard)
@Roles(GamilityRoleEnum.ADMIN_TEACHER, GamilityRoleEnum.SUPER_ADMIN)
```

### Paginacion Standard

```typescript
interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
```

### Nil-Safety Pattern

```typescript
// Frontend - Acceso seguro a datos opcionales
const studentCount = classroom?.studentCount ?? 0;
const avgProgress = classroom?.averageProgress ?? 'N/A';
```

---

## Referencias

- US-PM-001a: CRUD de Classrooms
- US-PM-001b: Inscripcion de Estudiantes
- TRACEABILITY.yml: Mapeo de implementacion
- ADR-014: Nil-Safety Patterns

---

**Creado:** 2026-01-27
**Sistema:** SIMCO (Sistema Indexado Modular por Contexto)
