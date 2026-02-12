# ASSIGNMENTS-SPEC: Student Assignments Pages Specification

**Sistema:** Gamilit - Student Portal
**Version:** 1.0.0
**Fecha:** 2026-01-20
**Estado:** DOCUMENTADO (basado en codigo existente)

---

## 1. RESUMEN EJECUTIVO

Este documento especifica las dos paginas del Student Portal dedicadas a la gestion de tareas (assignments) asignadas a estudiantes:

| Pagina | Ruta | Archivo |
|--------|------|---------|
| **AssignmentsPage** | `/student/assignments` | `apps/frontend/src/apps/student/pages/AssignmentsPage.tsx` |
| **AssignmentDetailPage** | `/assignments/:id` | `apps/frontend/src/apps/student/pages/AssignmentDetailPage.tsx` |

Ambas paginas son parte del flujo educativo CORE que permite a estudiantes:
1. Ver todas sus tareas asignadas
2. Filtrar por estado
3. Ver resumen de calificaciones
4. Acceder a detalles y ejercicios de cada tarea
5. Iniciar ejercicios individuales

---

## 2. PAGINA: AssignmentsPage

### 2.1 Proposito y Descripcion

**Proposito:** Mostrar el hub central de tareas del estudiante con vision general de todas las asignaciones, filtros de estado y resumen de calificaciones.

**Descripcion detallada:**
- Pagina principal de tareas del estudiante
- Muestra grid de cards con todas las tareas asignadas
- Permite filtrar por estado (todas, pendientes, en progreso, enviadas, calificadas)
- Incluye tarjeta de resumen de calificaciones (promedio, completadas, pendientes)
- Navegacion a detalle de cada tarea al hacer clic

**Ruta:** `/student/assignments`
**Creado:** 2025-11-29 (P1-002 gap fix)

### 2.2 Estados de Assignment

La pagina maneja 5 estados posibles para cada assignment:

| Estado | Label (UI) | Color | Icono | Descripcion |
|--------|------------|-------|-------|-------------|
| `assigned` | Pendiente | Azul (`text-blue-600`, `bg-blue-100`) | `ClipboardList` | Tarea asignada pero no iniciada |
| `in_progress` | En Progreso | Amarillo (`text-yellow-600`, `bg-yellow-100`) | `Clock` | Tarea iniciada pero no enviada |
| `submitted` | Enviada | Purpura (`text-purple-600`, `bg-purple-100`) | `CheckCircle` | Tarea enviada, pendiente de calificacion |
| `graded` | Calificada | Verde (`text-green-600`, `bg-green-100`) | `GraduationCap` | Tarea calificada por profesor |
| `late` | Retrasada | Rojo (`text-red-600`, `bg-red-100`) | `AlertCircle` | Tarea con fecha vencida sin entregar |

### 2.3 Filtros Disponibles

La pagina incluye pestanas de filtro para mostrar subconjuntos de tareas:

```typescript
const filters: Array<{ key: string | undefined; label: string }> = [
  { key: undefined, label: 'Todas' },
  { key: 'assigned', label: 'Pendientes' },
  { key: 'in_progress', label: 'En Progreso' },
  { key: 'submitted', label: 'Enviadas' },
  { key: 'graded', label: 'Calificadas' },
];
```

**Comportamiento:**
- Filtro activo se muestra con fondo `bg-indigo-600` y texto blanco
- Filtros inactivos tienen fondo `bg-gray-100` y texto gris
- Al cambiar filtro se ejecuta `setFilters()` que automaticamente hace refetch

### 2.4 Hooks Utilizados

| Hook | Fuente | Proposito |
|------|--------|-----------|
| `useStudentAssignmentsStore` | `@/features/assignments/store/studentAssignmentsStore` | Estado global de assignments (Zustand) |
| `useAuth` | `@/features/auth/hooks/useAuth` | Obtener usuario autenticado y logout |
| `useNavigate` | `react-router-dom` | Navegacion programatica |
| `useEffect` | React | Fetch inicial de datos |

### 2.5 APIs Consumidas

| Endpoint | Metodo | Funcion API | Proposito |
|----------|--------|-------------|-----------|
| `GET /api/student/assignments` | GET | `getMyAssignments(filters?)` | Lista de tareas del estudiante |
| `GET /api/student/assignments/grades/summary` | GET | `getGradesSummary()` | Resumen de calificaciones |

**Query Parameters soportados:**
- `status`: Filtrar por estado (`assigned`, `in_progress`, `submitted`, `graded`, `late`)
- `classroomId`: Filtrar por aula (UUID)

### 2.6 Componentes Renderizados

#### Componentes Internos (definidos en el archivo):

| Componente | Props | Descripcion |
|------------|-------|-------------|
| `AssignmentCard` | `{ assignment: StudentAssignment, onClick: () => void }` | Card individual de tarea con estado, fecha y puntos |
| `GradesSummaryCard` | (ninguna) | Tarjeta de resumen con promedio, completadas y pendientes |
| `FilterTabs` | `{ currentFilter: string, onFilterChange: (filters) => void }` | Pestanas de filtro por estado |

#### Componentes Externos Importados:

| Componente | Fuente | Uso |
|------------|--------|-----|
| `GamifiedHeader` | `@shared/components/layout/GamifiedHeader` | Header con info del usuario y logout |
| `motion.div` | `framer-motion` | Animaciones de hover y entrada |

### 2.7 Navegacion

| Accion | Destino | Trigger |
|--------|---------|---------|
| Click en `AssignmentCard` | `/assignments/{assignment.id}` | `handleAssignmentClick()` |
| Click en logout (header) | `/login` (via `useAuth().logout`) | Boton de logout en header |

### 2.8 Estados de UI

| Estado | Condicion | Renderizado |
|--------|-----------|-------------|
| **Loading** | `isLoading === true` | Grid de 6 skeleton cards animados |
| **Error** | `error !== null` | Banner rojo con mensaje de error |
| **Empty** | `!isLoading && assignments.length === 0` | Icono + mensaje "No tienes tareas asignadas" |
| **Success** | `!isLoading && assignments.length > 0` | Grid responsive de `AssignmentCard` |

**Grid responsive:**
- Mobile: 1 columna (`grid-cols-1`)
- Tablet: 2 columnas (`md:grid-cols-2`)
- Desktop: 3 columnas (`lg:grid-cols-3`)

---

## 3. PAGINA: AssignmentDetailPage

### 3.1 Proposito y Descripcion

**Proposito:** Mostrar detalles completos de una tarea especifica, incluyendo descripcion, ejercicios asignados y estado de entrega.

**Descripcion detallada:**
- Vista de detalle de una tarea individual
- Muestra header con titulo, tipo y estado
- Lista de ejercicios contenidos con boton "Iniciar"
- Informacion de entrega (submission) si existe
- Retroalimentacion del profesor si fue calificada
- Boton de regreso a lista de tareas

**Ruta:** `/assignments/:id`
**Creado:** 2025-12-28 (P0-008 gap fix)

### 3.2 Informacion Mostrada del Assignment

| Campo | Ubicacion | Descripcion |
|-------|-----------|-------------|
| `assignment.title` | Header card | Titulo de la tarea |
| `assignment.assignmentType` | Badge en header | Tipo: homework, quiz, exam, project |
| `assignment.description` | Body del card | Descripcion detallada |
| `assignment.dueDate` | Meta info | Fecha limite formateada |
| `assignment.totalPoints` | Meta info | Puntos totales disponibles |
| `status` | Badge en header | Estado actual (ver seccion 2.2) |
| `score` | Meta info (si graded) | Calificacion obtenida |
| `feedback` | Tarjeta azul | Retroalimentacion del profesor |

### 3.3 Ejercicios Contenidos

Cada assignment puede contener multiples ejercicios, mostrados en una lista ordenada:

```typescript
interface ExerciseInAssignment {
  id: string;           // ID del registro assignment_exercise
  exerciseId: string;   // ID del ejercicio en catalogo
  orderIndex: number;   // Orden de presentacion (0-indexed)
  pointsOverride: number | null;  // Puntos personalizados
  isRequired: boolean;  // Si es obligatorio
}
```

**Componente ExerciseCard:**
- Muestra "Ejercicio N" (orderIndex + 1)
- Muestra puntos (pointsOverride o 10 por defecto)
- Badge rojo "Obligatorio" si `isRequired === true`
- Boton "Iniciar" navega a `/exercises/{exerciseId}`
- Boton oculto si assignment esta calificado (`isGraded === true`)

### 3.4 Flujo de Completar Ejercicio

```
1. Student ve lista de ejercicios en AssignmentDetailPage
2. Click en "Iniciar" de un ejercicio
3. Navegacion a: /exercises/{exerciseId}
4. Student completa el ejercicio en ExercisePage (fuera del scope de este doc)
5. Al completar, vuelve a AssignmentDetailPage
6. Ejercicio se marca como completado (indicador visual TBD)
```

**Nota:** El tracking de progreso por ejercicio individual no esta implementado en la UI actual. El estado `in_progress` y `submitted` se maneja a nivel de assignment completo, no por ejercicio.

### 3.5 Tracking de Progreso

El progreso del estudiante se trackea via la entidad `AssignmentSubmission`:

| Estado | Significado |
|--------|-------------|
| `not_started` | No ha iniciado ningun ejercicio |
| `in_progress` | Ha iniciado pero no enviado |
| `submitted` | Enviado y esperando calificacion |
| `graded` | Calificado por profesor |

**Informacion de submission mostrada:**
- Estado (`submission.status`)
- Fecha de envio (`submission.submittedAt`)
- Fecha de calificacion (`submission.gradedAt`)
- Calificacion (`submission.score` / `assignment.totalPoints`)
- Retroalimentacion (`submission.feedback`)

### 3.6 Hooks y APIs

#### Hooks Utilizados:

| Hook | Fuente | Proposito |
|------|--------|-----------|
| `useParams` | `react-router-dom` | Obtener `id` de la URL |
| `useNavigate` | `react-router-dom` | Navegacion programatica |
| `useAuth` | `@/features/auth/hooks/useAuth` | Usuario autenticado |
| `useState` | React | Estado local (assignment, isLoading, error) |
| `useEffect` | React | Fetch de datos al montar |

**Nota:** Esta pagina usa estado local (`useState`) en lugar del store Zustand para el detalle. El API se llama directamente via `studentAssignmentsAPI.getAssignmentDetail(id)`.

#### API Consumida:

| Endpoint | Metodo | Funcion API | Proposito |
|----------|--------|-------------|-----------|
| `GET /api/student/assignments/:id` | GET | `getAssignmentDetail(id)` | Detalle completo de assignment |

### 3.7 Componentes de Ejercicio Renderizados

| Componente | Props | Descripcion |
|------------|-------|-------------|
| `ExerciseCard` | `{ exercise, onStart, isGraded }` | Card de ejercicio individual |

**ExerciseCard comportamiento:**
- Icono de libro (`BookOpen`)
- Muestra numero de ejercicio y puntos
- Badge "Obligatorio" si aplica
- Boton "Iniciar" con icono Play
- Boton deshabilitado/oculto si assignment esta calificado

### 3.8 Navegacion

| Accion | Destino | Trigger |
|--------|---------|---------|
| Click en "Volver a Tareas" | `/assignments` | Boton con `ArrowLeft` |
| Click en "Iniciar" ejercicio | `/exercises/{exerciseId}` | `handleExerciseStart(exerciseId)` |
| Click en logout (header) | `/login` | Boton en `GamifiedHeader` |

### 3.9 Estados de UI

| Estado | Condicion | Renderizado |
|--------|-----------|-------------|
| **Loading** | `isLoading === true` | Spinner centrado (`Loader2` animado) |
| **Error** | `error !== null` | Tarjeta roja con mensaje y boton "Volver" |
| **Success** | `!isLoading && assignment !== null` | Contenido completo |

---

## 4. DIAGRAMA DE FLUJO DEL ESTUDIANTE

```
                    +------------------+
                    |  Student Login   |
                    +--------+---------+
                             |
                             v
                    +------------------+
                    |  Student Home    |
                    +--------+---------+
                             |
              Click "Mis Tareas" (Nav)
                             |
                             v
+================================================================+
|                    ASSIGNMENTS PAGE                             |
|  /student/assignments                                          |
|                                                                 |
|  +------------------+    +-----------------------------+       |
|  | GradesSummary    |    |  Filter Tabs               |       |
|  | - Promedio: 85%  |    |  [Todas] [Pend] [Prog]...  |       |
|  | - Completadas: 8 |    +-----------------------------+       |
|  | - Pendientes: 2  |                                          |
|  +------------------+    +-------------+  +-------------+      |
|                          | Assignment  |  | Assignment  |      |
|  Ultimas calificaciones: | Card #1     |  | Card #2     |      |
|  - Lectura Cap.5: 90/100 | [Pendiente] |  | [Calificada]|      |
|  - Quiz #3: 85/100       | Due: 20 Ene |  | Score: 90   |      |
|                          +------+------+  +------+------+      |
|                                 |                |              |
+================================|================|===============+
                                 |                |
                    Click en Card|                |
                                 v                v
+================================================================+
|              ASSIGNMENT DETAIL PAGE                             |
|  /assignments/:id                                               |
|                                                                 |
|  [<- Volver a Tareas]                                          |
|                                                                 |
|  +----------------------------------------------------------+  |
|  |  HEADER: Titulo del Assignment        [Estado: Pendiente]|  |
|  |  Tipo: homework                                          |  |
|  +----------------------------------------------------------+  |
|  |  Descripcion: Leer capitulo 5 y responder preguntas...   |  |
|  |                                                          |  |
|  |  Fecha limite: 20 de enero 2026    |  Puntos: 100       |  |
|  +----------------------------------------------------------+  |
|                                                                 |
|  +----------------------------------------------------------+  |
|  |  EJERCICIOS (3)                                          |  |
|  |  +---------------------+  +---------------------+        |  |
|  |  | Ejercicio 1    10pts|  | Ejercicio 2    10pts|        |  |
|  |  | [Obligatorio]       |  | [Obligatorio]       |        |  |
|  |  |         [Iniciar]   |  |         [Iniciar]   |        |  |
|  |  +----------+----------+  +----------+----------+        |  |
|  +-------------|-----------------------------|--------------+  |
|                |                             |                  |
+================|=============================|==================+
                 |                             |
    Click Iniciar|                             |
                 v                             v
        +------------------+          +------------------+
        |  /exercises/:id  |          |  /exercises/:id  |
        |  (Exercise Page) |          |  (Exercise Page) |
        +------------------+          +------------------+
```

---

## 5. TABLA DE ENDPOINTS CONSUMIDOS

### 5.1 Student Assignments API

| Metodo | Endpoint | Query Params | Response Type | Descripcion |
|--------|----------|--------------|---------------|-------------|
| GET | `/api/student/assignments` | `status?`, `classroomId?` | `StudentAssignment[]` | Lista de todas las tareas del estudiante |
| GET | `/api/student/assignments/:id` | - | `StudentAssignmentDetail` | Detalle de una tarea especifica |
| GET | `/api/student/assignments/grades/summary` | - | `GradesSummary` | Resumen de calificaciones |

### 5.2 Autenticacion Requerida

Todos los endpoints requieren:
- Header: `Authorization: Bearer <JWT>`
- Roles permitidos: `STUDENT`, `ADMIN_TEACHER`, `SUPER_ADMIN`

### 5.3 Codigos de Respuesta

| Codigo | Significado |
|--------|-------------|
| 200 | Exito |
| 401 | No autenticado / JWT invalido |
| 403 | Sin permisos (rol incorrecto) |
| 404 | Assignment no encontrado o no asignado |
| 500 | Error interno del servidor |

---

## 6. TIPOS E INTERFACES UTILIZADOS

### 6.1 Frontend Types (studentAssignmentsAPI.ts)

```typescript
/**
 * Assignment summary for list view (AssignmentsPage)
 */
export interface StudentAssignment {
  id: string;                    // ID de assignment_students (M2M)
  assignment: {
    id: string;                  // ID del assignment real
    title: string;
    description: string;
    assignmentType: 'homework' | 'quiz' | 'exam' | 'project';
    dueDate: string | null;      // ISO date string
    totalPoints: number;
  };
  status: 'assigned' | 'in_progress' | 'submitted' | 'graded' | 'late';
  assignedAt: string;            // ISO date string
  score: number | null;          // Solo si graded
  feedback: string | null;       // Solo si graded
}

/**
 * Assignment detail with exercises (AssignmentDetailPage)
 */
export interface StudentAssignmentDetail extends StudentAssignment {
  exercises: Array<{
    id: string;                  // ID de assignment_exercise (M2M)
    exerciseId: string;          // ID del exercise en catalogo
    orderIndex: number;          // Orden de presentacion
    pointsOverride: number | null;
    isRequired: boolean;
  }>;
  submission: {
    id: string;
    status: string;              // SubmissionStatus enum
    submittedAt: string | null;
    score: number | null;
    feedback: string | null;
    gradedAt: string | null;
  } | null;
}

/**
 * Grades summary for GradesSummaryCard
 */
export interface GradesSummary {
  totalAssignments: number;
  completed: number;
  pending: number;
  averageScore: number;          // Porcentaje (0-100)
  grades: Array<{
    assignmentTitle: string;
    score: number;
    maxScore: number;
    gradedAt: string;            // ISO date string (solo fecha)
    feedback: string | null;
  }>;
}

/**
 * Filters for assignments list
 */
export interface AssignmentFilters {
  status?: 'assigned' | 'in_progress' | 'submitted' | 'graded' | 'late';
  classroomId?: string;
}
```

### 6.2 Zustand Store State (studentAssignmentsStore.ts)

```typescript
interface StudentAssignmentsState {
  // Data
  assignments: StudentAssignment[];
  selectedAssignment: StudentAssignmentDetail | null;
  gradesSummary: GradesSummary | null;

  // UI State
  isLoading: boolean;
  isLoadingDetail: boolean;
  isLoadingGrades: boolean;
  error: string | null;
  filters: AssignmentFilters;

  // Actions
  fetchAssignments: (filters?: AssignmentFilters) => Promise<void>;
  fetchAssignmentDetail: (id: string) => Promise<void>;
  fetchGradesSummary: () => Promise<void>;
  setFilters: (filters: AssignmentFilters) => void;
  clearSelectedAssignment: () => void;
  clearError: () => void;
}
```

### 6.3 Backend Entities (Referencia)

**Assignment Entity:**
```typescript
// educational_content.assignments
{
  id: string;               // UUID PK
  teacherId: string;        // FK to users
  title: string;            // max 255
  description: string | null;
  assignmentType: 'practice' | 'quiz' | 'exam' | 'homework';
  totalPoints: number;      // default 100
  dueDate: Date | null;
  isPublished: boolean;     // default false
  createdAt: Date;
  updatedAt: Date;
}
```

**AssignmentStudent Entity (M2M):**
```typescript
// educational_content.assignment_students
{
  id: string;               // UUID PK
  assignmentId: string;     // FK to assignments
  studentId: string;        // FK to users
  assignedAt: Date;
}
```

**AssignmentSubmission Entity:**
```typescript
// educational_content.assignment_submissions
{
  id: string;               // UUID PK
  assignmentId: string;     // FK to assignments
  studentId: string;        // FK to users
  submittedAt: Date | null;
  status: 'not_started' | 'in_progress' | 'submitted' | 'graded';
  score: number | null;     // decimal(5,2)
  feedback: string | null;
  gradedAt: Date | null;
  gradedBy: string | null;  // FK to users (teacher)
  createdAt: Date;
  updatedAt: Date;
}
```

**AssignmentExercise Entity (M2M):**
```typescript
// educational_content.assignment_exercises
{
  id: string;               // UUID PK
  assignmentId: string;     // FK to assignments
  exerciseId: string;       // FK to exercises
  orderIndex: number;
  pointsOverride: number | null;  // decimal(5,2)
  isRequired: boolean;      // default true
  createdAt: Date;
}
```

---

## 7. DEPENDENCIAS

### 7.1 Dependencias de Frontend

| Paquete | Version | Uso |
|---------|---------|-----|
| `react` | ^18.x | Framework base |
| `react-router-dom` | ^6.x | Routing |
| `framer-motion` | ^10.x | Animaciones |
| `lucide-react` | ^0.x | Iconos |
| `zustand` | ^4.x | Estado global |
| `@tanstack/react-query` | ^5.x | (usado en store) |

### 7.2 Iconos Lucide Utilizados

**AssignmentsPage:**
- `ClipboardList` - Estado assigned
- `GraduationCap` - Estado graded + puntos
- `Clock` - Estado in_progress + fecha
- `CheckCircle` - Estado submitted
- `AlertCircle` - Estado late
- `Filter` - Icono de filtros

**AssignmentDetailPage:**
- `ArrowLeft` - Boton volver
- `ClipboardList` - Icono default
- `GraduationCap` - Puntos/calificacion
- `Clock` - Fecha limite
- `CheckCircle` - Calificacion
- `AlertCircle` - Error
- `Play` - Boton iniciar ejercicio
- `BookOpen` - Icono de ejercicio
- `Loader2` - Spinner de carga

### 7.3 Servicios Backend Requeridos

| Servicio | Metodos Usados |
|----------|----------------|
| `AssignmentsService` | `findStudentAssignments()`, `findStudentAssignmentById()`, `getStudentGradesSummary()` |
| `JwtAuthGuard` | Validacion de token |
| `RolesGuard` | Validacion de rol STUDENT |

---

## 8. LIMITACIONES CONOCIDAS

1. **No hay tracking por ejercicio:** El progreso individual de cada ejercicio dentro de un assignment no se muestra en la UI. Solo se trackea el estado general del assignment.

2. **Sin indicador de ejercicios completados:** Al volver del ejercicio, no hay feedback visual de cuales ejercicios ya fueron completados.

3. **Filtro de classroom no expuesto en UI:** El backend soporta filtrar por `classroomId` pero la UI no muestra ese filtro.

4. **Sin paginacion:** La lista de assignments no implementa paginacion. Puede ser problema con muchas tareas.

5. **Sin busqueda:** No hay campo de busqueda por titulo de tarea.

6. **Sin ordenamiento personalizado:** Las tareas se ordenan por fecha de creacion en backend, no hay opcion de cambiar orden.

---

## 9. RUTAS DE ARCHIVOS

### Frontend

| Archivo | Ruta Absoluta |
|---------|---------------|
| AssignmentsPage | `/home/isem/workspace-v2/projects/gamilit/apps/frontend/src/apps/student/pages/AssignmentsPage.tsx` |
| AssignmentDetailPage | `/home/isem/workspace-v2/projects/gamilit/apps/frontend/src/apps/student/pages/AssignmentDetailPage.tsx` |
| Student Assignments API | `/home/isem/workspace-v2/projects/gamilit/apps/frontend/src/services/api/studentAssignmentsAPI.ts` |
| Student Assignments Store | `/home/isem/workspace-v2/projects/gamilit/apps/frontend/src/features/assignments/store/studentAssignmentsStore.ts` |

### Backend

| Archivo | Ruta Absoluta |
|---------|---------------|
| Student Assignments Controller | `/home/isem/workspace-v2/projects/gamilit/apps/backend/src/modules/assignments/controllers/student-assignments.controller.ts` |
| Assignments Service | `/home/isem/workspace-v2/projects/gamilit/apps/backend/src/modules/assignments/services/assignments.service.ts` |
| Assignment Entity | `/home/isem/workspace-v2/projects/gamilit/apps/backend/src/modules/assignments/entities/assignment.entity.ts` |
| AssignmentStudent Entity | `/home/isem/workspace-v2/projects/gamilit/apps/backend/src/modules/assignments/entities/assignment-student.entity.ts` |
| AssignmentSubmission Entity | `/home/isem/workspace-v2/projects/gamilit/apps/backend/src/modules/assignments/entities/assignment-submission.entity.ts` |
| AssignmentExercise Entity | `/home/isem/workspace-v2/projects/gamilit/apps/backend/src/modules/assignments/entities/assignment-exercise.entity.ts` |

---

## 10. REFERENCIAS CRUZADAS

- **Gap Fixes Relacionados:** P1-002 (AssignmentsPage), P0-008 (AssignmentDetailPage)
- **Formato de documentacion:** `STUDENT-GAP-006-profile-stats.md`
- **README del Student Portal:** `docs/95-guias-desarrollo/student-portal/README.md`
- **Mapa del Student Portal:** `docs/95-guias-desarrollo/student-portal/_MAP.md`

---

*Documentacion generada: 2026-01-20*
*Basada en codigo existente - NO especulativo*
