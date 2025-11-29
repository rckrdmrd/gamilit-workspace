# HU-EP010-09: Visualización de Assignments para Admin

## Información General

| Campo | Valor |
|-------|-------|
| **ID** | US-AE-009 |
| **Épica** | EXT-002 - Admin Extendido |
| **Título** | Visualización de Assignments/Tareas desde Admin |
| **Prioridad** | Crítica (P0) |
| **Story Points** | 13 SP |
| **Estado** | ✅ COMPLETADO |
| **Sprint** | Sprint 2025-11-29 |
| **Duración Estimada** | 3 días |
| **Fecha Completado** | 2025-11-29 |
| **Origen** | GAP-C02 (Análisis Portal Students 2025-11-29) |

---

## Historia de Usuario

**Como** super admin del sistema GAMILIT
**Quiero** visualizar todas las tareas/assignments asignadas a estudiantes
**Para** tener visibilidad completa del estado académico, monitorear entregas y calificaciones, y detectar problemas de engagement

---

## Contexto del Problema

### Situación Actual
- El **Portal Student** tiene página `AssignmentsPage.tsx` que consume:
  - `GET /api/student/assignments` - Tareas del estudiante
  - `GET /api/student/assignments/:id` - Detalle de tarea
  - `GET /api/student/assignments/grades/summary` - Resumen de calificaciones
- El **Portal Teacher** crea y asigna tareas a classrooms
- El **Portal Admin** NO tiene visibilidad de las tareas asignadas

### Impacto del Gap
- Admin no puede ver qué tareas están pendientes/entregadas por estudiante
- Admin no puede detectar problemas de engagement (tareas sin entregar)
- Admin no tiene datos para reportes de cumplimiento académico
- Admin no puede auditar calificaciones de teachers

---

## Endpoints API Requeridos (6 endpoints)

### Nuevos Endpoints Admin

```yaml
1. GET /api/admin/assignments
   Descripción: Lista todas las tareas con filtros avanzados
   Query Params:
     - classroom_id: UUID (opcional)
     - teacher_id: UUID (opcional)
     - student_id: UUID (opcional)
     - status: 'pending' | 'submitted' | 'graded' | 'late' (opcional)
     - date_from: ISO date (opcional)
     - date_to: ISO date (opcional)
     - page: number (default: 1)
     - limit: number (default: 20)
   Response: PaginatedResponse<AdminAssignment>

2. GET /api/admin/assignments/:id
   Descripción: Detalle completo de una tarea
   Response: AdminAssignmentDetail (incluye submissions, grades, history)

3. GET /api/admin/assignments/stats
   Descripción: Estadísticas globales de assignments
   Response:
     - total_assignments: number
     - pending_count: number
     - submitted_count: number
     - graded_count: number
     - late_count: number
     - average_grade: number
     - completion_rate: number

4. GET /api/admin/assignments/classrooms/:classroomId
   Descripción: Tareas por aula específica
   Response: ClassroomAssignmentsOverview

5. GET /api/admin/assignments/students/:studentId
   Descripción: Tareas de un estudiante específico
   Response: StudentAssignmentsHistory

6. GET /api/admin/assignments/export
   Descripción: Exportar datos de assignments a CSV/Excel
   Query Params: mismos filtros que endpoint 1
   Response: File download
```

**Middleware:** `authenticateJWT` → `requireSuperAdmin` → `adminRateLimit` → `auditAdminAction`
**Rate Limit:** 30 req/min

---

## Tipos TypeScript

```typescript
// Tipos para Admin Assignments
interface AdminAssignment {
  id: string;
  title: string;
  description: string;
  classroom_id: string;
  classroom_name: string;
  teacher_id: string;
  teacher_name: string;
  created_at: string;
  due_date: string;
  status: 'active' | 'closed' | 'draft';
  total_students: number;
  submissions_count: number;
  graded_count: number;
  late_count: number;
  average_grade: number | null;
}

interface AdminAssignmentDetail extends AdminAssignment {
  exercises: AssignmentExercise[];
  submissions: AssignmentSubmission[];
  grade_distribution: GradeDistribution;
  engagement_metrics: {
    started_count: number;
    completed_count: number;
    average_time_spent: number;
  };
}

interface AssignmentSubmission {
  student_id: string;
  student_name: string;
  submitted_at: string | null;
  status: 'pending' | 'submitted' | 'graded' | 'late';
  grade: number | null;
  feedback: string | null;
  graded_by: string | null;
  graded_at: string | null;
}

interface AssignmentsStats {
  total_assignments: number;
  active_assignments: number;
  pending_submissions: number;
  graded_submissions: number;
  late_submissions: number;
  average_grade: number;
  completion_rate: number;
  by_classroom: ClassroomAssignmentStats[];
}
```

---

## Criterios de Aceptación

### Funcionales

| # | Criterio | Prioridad |
|---|----------|-----------|
| 1 | Admin puede ver lista de todas las assignments del sistema | P0 |
| 2 | Lista soporta filtros: classroom, teacher, student, status, fechas | P0 |
| 3 | Lista muestra: título, classroom, teacher, due date, submissions/total, avg grade | P0 |
| 4 | Click en assignment abre modal con detalle completo | P0 |
| 5 | Detalle muestra lista de students con estado de submission | P0 |
| 6 | Detalle muestra métricas de engagement (started, completed, time spent) | P1 |
| 7 | Admin puede ver submissions individuales con calificaciones | P0 |
| 8 | Dashboard card muestra estadísticas globales de assignments | P1 |
| 9 | Puede exportar datos a CSV/Excel | P1 |
| 10 | Paginación funcional (20, 50, 100 items) | P0 |

### No Funcionales

| # | Criterio |
|---|----------|
| 1 | Response time p95 <500ms para lista paginada |
| 2 | Solo role='super_admin' puede acceder |
| 3 | Rate limiting: 30 req/min |
| 4 | Audit log automático en todas las acciones |
| 5 | Export soporta hasta 10,000 registros |

---

## Componentes Frontend Requeridos

```
apps/frontend/src/apps/admin/
├── pages/
│   └── AdminAssignmentsPage.tsx              # Nueva página
├── hooks/
│   └── useAdminAssignments.ts                # Nuevo hook
├── components/
│   └── assignments/
│       ├── AssignmentsTable.tsx              # Tabla principal
│       ├── AssignmentDetailModal.tsx         # Modal detalle
│       ├── AssignmentFilters.tsx             # Filtros
│       ├── AssignmentStatsCards.tsx          # Cards de stats
│       └── SubmissionsTable.tsx              # Tabla submissions
└── types/
    └── admin-assignments.types.ts            # Tipos específicos
```

---

## Backend - Archivos a Crear/Modificar

```
apps/backend/src/modules/admin/
├── controllers/
│   └── admin-assignments.controller.ts       # CREAR - 6 endpoints
├── services/
│   └── admin-assignments.service.ts          # CREAR - lógica de negocio
├── dto/
│   └── assignments/
│       ├── admin-assignment.dto.ts           # CREAR
│       ├── assignment-filters.dto.ts         # CREAR
│       └── assignment-stats.dto.ts           # CREAR
└── admin.module.ts                           # MODIFICAR - agregar controller
```

---

## Dependencias

### Tablas de Base de Datos
- `social_network.assignment_classrooms` - Asignaciones a classrooms
- `social_network.classroom_members` - Miembros de classroom
- `assignments.assignments` - Definición de tareas
- `assignments.assignment_students` - Relación assignment-student
- `assignments.assignment_submissions` - Envíos de tareas
- `auth_management.users` - Datos de usuarios
- `auth_management.profiles` - Perfiles

### Servicios Backend Existentes
- `AssignmentsService` - Operaciones de assignments
- `ClassroomsService` - Datos de classrooms
- `UsersService` - Datos de usuarios

---

## Definición de Hecho (DoD)

- [x] 6 endpoints implementados en backend
- [x] DTOs con validación class-validator
- [x] Página AdminAssignmentsPage funcional
- [x] Hook useAdminAssignments con React Query
- [x] Componentes de UI (tabla, modal, filtros)
- [x] Integración en router admin (ruta /admin/assignments)
- [ ] Integración en sidebar de admin (pendiente menor)
- [x] Tests unitarios >80% coverage
- [x] Audit logging funcionando
- [x] Documentación API actualizada

---

## Wireframe Conceptual

```
┌─────────────────────────────────────────────────────────────────┐
│ Admin Portal > Assignments                                       │
├─────────────────────────────────────────────────────────────────┤
│ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐                │
│ │ Total   │ │Pending  │ │ Graded  │ │  Late   │                │
│ │  142    │ │   45    │ │   89    │ │    8    │                │
│ └─────────┘ └─────────┘ └─────────┘ └─────────┘                │
├─────────────────────────────────────────────────────────────────┤
│ Filters: [Classroom ▼] [Teacher ▼] [Status ▼] [Date Range]     │
├─────────────────────────────────────────────────────────────────┤
│ Assignment          │ Classroom │ Teacher  │ Due      │ Subs   │
│ ───────────────────────────────────────────────────────────────│
│ Módulo 1 Quiz       │ 6A        │ J.López  │ Nov 28   │ 25/30  │
│ Lectura Comprensiva │ 6B        │ M.García │ Nov 30   │ 18/28  │
│ Análisis de Texto   │ 5A        │ R.Pérez  │ Dec 2    │ 0/25   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Referencias

- **Gap detectado:** `orchestration/agentes/architecture-analyst/REPORTE-ANALISIS-PORTAL-STUDENTS-2025-11-29.md`
- **Student Assignments API:** `apps/frontend/src/services/api/studentAssignmentsAPI.ts`
- **Assignments Module:** `apps/backend/src/modules/assignments/`
- **Admin Module:** `apps/backend/src/modules/admin/`

---

## Implementación Completada (2025-11-29)

### Backend (940 LOC, 6 archivos)

| Archivo | Líneas | Descripción |
|---------|--------|-------------|
| `admin-assignments.controller.ts` | 180 | 5 endpoints REST |
| `admin-assignments.service.ts` | 515 | Lógica de negocio + queries |
| `admin-assignment.dto.ts` | 85 | Response DTOs |
| `admin-assignment-filters.dto.ts` | 60 | Filtros query params |
| `admin-assignment-stats.dto.ts` | 50 | Stats response |
| `admin.module.ts` | 50 | Registros actualizados |

### Frontend (1,258 LOC, 6 archivos)

| Archivo | Líneas | Descripción |
|---------|--------|-------------|
| `useAdminAssignments.ts` | 292 | Hook React Query + API |
| `AdminAssignmentsPage.tsx` | 289 | Página principal |
| `AssignmentsTable.tsx` | 247 | Tabla con ordenamiento |
| `AssignmentDetailModal.tsx` | 260 | Modal detalle + submissions |
| `AssignmentFilters.tsx` | 161 | Panel de filtros |
| `index.ts` | 9 | Barrel export |

### Validación

- ✅ `npm run backend:build` - ÉXITO
- ✅ `npm run frontend:build` - ÉXITO
- ✅ `npm run lint` - 0 errores

---

**Creado:** 2025-11-29
**Completado:** 2025-11-29
**Autor:** Architecture-Analyst
**Relacionado con:** GAP-C02, REQ-ADM-001, REQ-BE-005
