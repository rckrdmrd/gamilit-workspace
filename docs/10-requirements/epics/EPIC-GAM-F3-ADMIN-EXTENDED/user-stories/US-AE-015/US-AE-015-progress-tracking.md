---
id: "US-AE-015"
title: "Sistema de Seguimiento de Progreso Administrativo"
type: "User Story"
status: "Done"
priority: "Alta"
assignee: "@Backend-Agent, @Frontend-Agent"
epic: "EXT-002"
story_points: 10
budget: "$4,000 MXN"
sprint: "Sprint-2"
labels: ["admin-extendido", "progress-tracking", "analytics", "export", "dashboard"]
created_date: "2025-11-24"
updated_date: "2026-01-20"
completed_date: "2025-11-24"
---

# HU-EP010-15: Sistema de Seguimiento de Progreso

## Informacion General

| Campo | Valor |
|-------|-------|
| **ID** | US-AE-015 |
| **Epica** | EXT-002 - Admin Extendido |
| **Titulo** | Sistema de Seguimiento de Progreso Administrativo |
| **Prioridad** | Alta (P1) |
| **Story Points** | 10 SP |
| **Estado** | Done |
| **Sprint** | Sprint 2 |
| **Duracion Estimada** | 3 dias |
| **Fecha Implementacion** | 2025-11-24 |

---

## Historia de Usuario

**Como** super admin del sistema GAMILIT
**Quiero** visualizar y analizar el progreso de estudiantes a nivel de sistema, aula, estudiante individual, modulos y ejercicios, con capacidad de exportar datos
**Para** monitorear el rendimiento academico, identificar areas de mejora, tomar decisiones basadas en datos y generar reportes para stakeholders

---

## Endpoints API (7 endpoints)

1. **GET /api/admin/progress/overview** - Vista general del sistema con estadisticas globales (total usuarios, submissions, modulos, tiempo invertido)
2. **GET /api/admin/progress/classrooms/:id** - Progreso detallado de un aula especifica con lista de estudiantes y sus metricas
3. **GET /api/admin/progress/students/:id** - Progreso detallado de un estudiante (stats, progreso por modulo, submissions recientes). Soporta filtros por classroom_id y module_id
4. **GET /api/admin/progress/students/:id/achievements** - Logros obtenidos por un estudiante con detalles de rewards, fechas y estadisticas por categoria/tier
5. **GET /api/admin/progress/modules/:id** - Estadisticas de progreso de un modulo (tasas de completion, scores promedio, tiempo invertido). Soporta filtro por classroom_id
6. **GET /api/admin/progress/exercises/:id** - Estadisticas de un ejercicio especifico (completion rates, scores, intentos)
7. **GET /api/admin/progress/export** - Exportar datos de progreso a CSV. Soporta tipos: students, classrooms, modules. Filtrable por classroom_id

**Guards:** `JwtAuthGuard` -> `AdminGuard`
**Controller:** `admin-progress.controller.ts`
**Service:** `admin-progress.service.ts`

---

## Criterios de Aceptacion (Resumidos)

### Funcionales

#### Overview (Vista General)
- Vista general del sistema con estadisticas globales
- Total de usuarios activos, submissions, modulos completados
- Tiempo total invertido en la plataforma
- Metricas agregadas a nivel sistema

#### Por Aula (Classrooms)
- Selector de aulas disponibles
- Lista de estudiantes con sus metricas individuales
- Progreso promedio del aula
- Click en estudiante navega a vista detallada

#### Por Estudiante (Students)
- Busqueda de estudiantes por nombre/email
- Informacion completa del usuario (display_name, email, stats)
- Progreso por modulo con porcentajes
- Submissions recientes con fechas y scores
- Vista de logros (achievements) con categorias y tiers

#### Por Modulo (Modules)
- Estadisticas agregadas del modulo
- Tasas de completion
- Scores promedio
- Tiempo promedio invertido

#### Por Ejercicio (Exercises)
- Estadisticas de submission
- Numero de intentos promedio
- Tasa de exito/fallo

#### Exportacion CSV
- Exportar datos de estudiantes, aulas o modulos
- Filtrar exportacion por aula especifica
- Descarga automatica con nombre timestamped
- Headers CSV descriptivos

### No Funcionales
- Response time p95 <500ms para overview
- Response time p95 <300ms para endpoints individuales
- Solo usuarios con rol admin pueden acceder (AdminGuard)
- Paginacion implicita en listas grandes
- Test coverage >80%

---

## Definicion de Hecho (DoD)

- 7 endpoints implementados y funcionales
- Guards JwtAuthGuard y AdminGuard aplicados
- DTOs definidos: ProgressOverviewDto, ClassroomProgressDto, StudentProgressDto, ModuleProgressStatsDto, ExerciseStatsDto, StudentAchievementsResponseDto
- Query DTOs: StudentProgressQueryDto, ModuleProgressQueryDto, ExportProgressQueryDto
- Frontend: AdminProgressPage con 3 vistas (overview, classrooms, students)
- Componentes: OverviewView, ClassroomsView, StudentDetailView, ClassroomSelector, StudentSearch
- Hook useProgress para manejo de estado y llamadas API
- Exportacion CSV funcional con descarga automatica
- Documentacion Swagger completa
- Tests unitarios >80% coverage

---

## Referencias de Implementacion

### Archivos Backend
- **Controller:** `apps/backend/src/modules/admin/controllers/admin-progress.controller.ts`
- **Service:** `apps/backend/src/modules/admin/services/admin-progress.service.ts`
- **DTOs:** `apps/backend/src/modules/admin/dto/progress/`
  - `progress-overview.dto.ts`
  - `classroom-progress.dto.ts`
  - `student-progress.dto.ts`
  - `module-progress-stats.dto.ts`
  - `exercise-stats.dto.ts`
  - `student-achievements-response.dto.ts`
  - Query DTOs para filtros

### Archivos Frontend
- **Pagina:** `apps/frontend/src/apps/admin/pages/AdminProgressPage.tsx`
- **Hook:** `apps/frontend/src/apps/admin/hooks/useProgress.ts`
- **Componentes:**
  - `apps/frontend/src/apps/admin/components/progress/OverviewView.tsx`
  - `apps/frontend/src/apps/admin/components/progress/ClassroomsView.tsx`
  - `apps/frontend/src/apps/admin/components/progress/StudentDetailView.tsx`
  - `apps/frontend/src/apps/admin/components/progress/ClassroomSelector.tsx`
  - `apps/frontend/src/apps/admin/components/progress/StudentSearch.tsx`

### Funcionalidades UI
- Navegacion por breadcrumbs
- Selector de vista (Overview, Por Aula, Por Estudiante)
- Boton de refresh con estado de loading
- Boton de exportacion CSV (deshabilitado en overview)
- Manejo de errores con mensajes descriptivos
- Estados de loading en todas las vistas

---

## Trazabilidad

| Artefacto | Ubicacion |
|-----------|-----------|
| Controller | `apps/backend/src/modules/admin/controllers/admin-progress.controller.ts` |
| Service | `apps/backend/src/modules/admin/services/admin-progress.service.ts` |
| Frontend Page | `apps/frontend/src/apps/admin/pages/AdminProgressPage.tsx` |
| Hook | `apps/frontend/src/apps/admin/hooks/useProgress.ts` |
| Swagger | Tags: "Admin - Progress" |

---

**Referencia API:** `/docs/20-architecture/apis/API-REFERENCE.md`
**Ultima actualizacion:** 2026-01-20
**Creacion original:** 2025-11-24
