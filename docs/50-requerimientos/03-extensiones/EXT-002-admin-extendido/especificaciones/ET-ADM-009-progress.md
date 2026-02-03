# ET-ADM-009: Dashboard de Progreso

## Metadata

| Campo | Valor |
|-------|-------|
| **ID** | ET-ADM-009 |
| **Modulo** | Admin Extendido |
| **Titulo** | Implementacion del Dashboard de Progreso |
| **Prioridad** | Alta |
| **Estado** | Implementado |
| **Version** | 1.0 |
| **Fecha Creacion** | 2026-01-25 |
| **Ultima Actualizacion** | 2026-01-25 |
| **Autor** | Architecture Analyst |

---

## Referencias

### User Stories
- US-AE-008: Dashboard de Progreso Academico
- US-AE-009: Detalle de Progreso por Estudiante

---

## Arquitectura

### Diagrama de Capas

```
+----------------------------------------------------------+
|                   FRONTEND (React)                        |
|  - AdminProgressPage                                      |
|  - OverviewView                                           |
|  - ClassroomsView                                         |
|  - StudentDetailView                                      |
|  - useProgress (hook)                                     |
+-----------------------------+----------------------------+
                              | REST API
+-----------------------------v----------------------------+
|                  BACKEND (NestJS)                        |
|  - AdminProgressController                               |
|  - AdminProgressService                                  |
+-----------------------------+----------------------------+
                              | SQL Queries
+-----------------------------v----------------------------+
|               DATABASE (PostgreSQL)                       |
|  - progress_tracking.user_module_progress                |
|  - progress_tracking.exercise_submissions                |
|  - social_features.classrooms                            |
+----------------------------------------------------------+
```

---

## Implementacion Backend

### Controller

**Ubicacion:** `apps/backend/src/admin/controllers/admin-progress.controller.ts`

```typescript
@Controller('admin/progress')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.TEACHER)
export class AdminProgressController {
  @Get('overview')
  async getOverview() {
    return this.progressService.getOverview();
  }

  @Get('classroom/:classroomId')
  async getClassroomProgress(@Param('classroomId') classroomId: string) {
    return this.progressService.getClassroomProgress(classroomId);
  }

  @Get('student/:studentId')
  async getStudentProgress(
    @Param('studentId') studentId: string,
    @Query() filters?: ProgressFilters
  ) {
    return this.progressService.getStudentProgress(studentId, filters);
  }

  @Get('module/:moduleId')
  async getModuleProgress(
    @Param('moduleId') moduleId: string,
    @Query('classroomId') classroomId?: string
  ) {
    return this.progressService.getModuleProgress(moduleId, classroomId);
  }

  @Get('exercise/:exerciseId')
  async getExerciseStats(@Param('exerciseId') exerciseId: string) {
    return this.progressService.getExerciseStats(exerciseId);
  }

  @Post('export')
  async exportToCSV(
    @Body('type') type: 'students' | 'classrooms' | 'modules',
    @Body('classroomId') classroomId?: string
  ) {
    return this.progressService.exportToCSV(type, classroomId);
  }
}
```

---

## Implementacion Frontend

### Pagina Principal

**Ubicacion:** `apps/frontend/src/apps/admin/pages/AdminProgressPage.tsx`

### Estructura Multi-Vista

```
AdminLayout
  └── Container
      ├── Header
      │   ├── Title + Breadcrumb
      │   └── Actions (Refresh, Export)
      │
      ├── Navigation Controls
      │   ├── View Tabs (Overview, Classrooms, Students)
      │   ├── ClassroomSelector
      │   └── StudentSearch
      │
      └── Content Area
          ├── OverviewView (activeView === 'overview')
          ├── ClassroomsView (activeView === 'classrooms')
          └── StudentDetailView (activeView === 'students')
```

### Custom Hook: useProgress

**Ubicacion:** `apps/frontend/src/apps/admin/hooks/useProgress.ts`

```typescript
interface UseProgressReturn {
  overview: ProgressOverview;
  classroomProgress: ClassroomProgress;
  studentProgress: StudentProgress;
  moduleProgress: ModuleProgressStats;
  exerciseStats: ExerciseStats;
  isLoading: boolean;
  error: string;
  fetchOverview: () => Promise<void>;
  fetchClassroomProgress: (classroomId: string) => Promise<void>;
  fetchStudentProgress: (studentId: string, filters?) => Promise<void>;
  fetchModuleProgress: (moduleId: string, params?) => Promise<void>;
  fetchExerciseStats: (exerciseId: string) => Promise<void>;
  exportToCSV: (type: string, classroomId?) => Promise<void>;
  clearError: () => void;
}
```

### Local State

```typescript
activeView: 'overview' | 'classrooms' | 'students'
selectedClassroomId: string | null
selectedStudentId: string | null
isExporting: boolean
```

### Vistas

#### OverviewView
- Metricas globales de progreso
- Graficos de distribucion
- Tendencias temporales

#### ClassroomsView
- Lista de aulas con metricas
- Progreso promedio por aula
- Drill-down a estudiantes

#### StudentDetailView
- Progreso individual detallado
- Modulos completados
- Historial de ejercicios
- Graficos de rendimiento

---

## API REST Endpoints

| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| GET | `/api/admin/progress/overview` | Resumen global |
| GET | `/api/admin/progress/classroom/:id` | Progreso por aula |
| GET | `/api/admin/progress/student/:id` | Progreso estudiante |
| GET | `/api/admin/progress/module/:id` | Progreso por modulo |
| GET | `/api/admin/progress/exercise/:id` | Stats de ejercicio |
| POST | `/api/admin/progress/export` | Exportar a CSV |

---

## Tipos TypeScript

### ProgressOverview

```typescript
interface ProgressOverview {
  totalStudents: number;
  activeStudents: number;
  averageProgress: number;
  modulesCompleted: number;
  exercisesSubmitted: number;
  averageScore: number;
  progressByModule: ModuleProgress[];
  recentActivity: ActivityEntry[];
}
```

### ClassroomProgress

```typescript
interface ClassroomProgress {
  classroomId: string;
  classroomName: string;
  studentCount: number;
  averageProgress: number;
  averageScore: number;
  students: StudentProgressSummary[];
  moduleBreakdown: ModuleBreakdown[];
}
```

### StudentProgress

```typescript
interface StudentProgress {
  studentId: string;
  studentName: string;
  email: string;
  overallProgress: number;
  currentLevel: number;
  totalXP: number;
  modulesProgress: ModuleProgress[];
  recentExercises: ExerciseSubmission[];
  activityTimeline: ActivityEntry[];
}
```

---

## Exportacion CSV

### Formato de Archivo

**Nombre:** `progress-{type}-{timestamp}.csv`

### Tipos de Exportacion

| Tipo | Columnas |
|------|----------|
| students | ID, Nombre, Email, Progreso, Nivel, XP, Modulos Completados |
| classrooms | ID, Nombre, Estudiantes, Progreso Promedio, Score Promedio |
| modules | ID, Nombre, Estudiantes, Completado, En Progreso, No Iniciado |

---

## Funcionalidades

1. **Navegacion Jerarquica:**
   - Overview → Classroom → Student
   - Breadcrumb trail
   - Back navigation

2. **Filtrado:**
   - Por aula
   - Por estudiante (busqueda)
   - Por rango de fechas

3. **Metricas en Tiempo Real:**
   - Refresh manual
   - Indicadores de carga

4. **Exportacion:**
   - CSV con filtros aplicados
   - Nombre con timestamp

---

## Dependencias

### Frontend
- @tanstack/react-query (useClassroomsList)
- lucide-react (TrendingUp, RefreshCw, Download, School, User)
- DetectiveCard, DetectiveButton (UI components)

---

## Historial de Cambios

| Version | Fecha | Autor | Cambios |
|---------|-------|-------|---------|
| 1.0 | 2026-01-25 | Architecture Analyst | Creacion inicial |

---

*Documento: ET-ADM-009-progress.md*
*Generado: 2026-01-25*
