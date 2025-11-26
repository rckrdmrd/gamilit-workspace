# GAP ANALYSIS: Portal Teacher - Endpoints Frontend vs Backend

**Fecha:** 2025-11-24
**Analista:** Architecture-Analyst
**Tipo:** Análisis de coherencia Frontend-Backend
**Severidad:** CRÍTICA
**Prioridad:** P0

---

## 🎯 PROBLEMA IDENTIFICADO

El portal de **teacher** presenta múltiples errores **404 (Not Found)** al intentar consumir endpoints del backend. El error más visible ocurre en el dashboard al intentar cargar classrooms:

```
GET http://localhost:3006/api/v1/teacher/classrooms 404 (Not Found)
```

**Impacto:** Las funcionalidades principales del portal teacher (gestión de classrooms, assignments, grades) **NO FUNCIONAN** por falta de implementación de endpoints en el backend.

---

## 📊 RESUMEN EJECUTIVO

| Métrica | Valor |
|---------|-------|
| **Total endpoints esperados por frontend** | 35+ |
| **Total endpoints implementados en backend** | 25 |
| **Gaps críticos identificados** | 10 |
| **Tasa de cobertura** | ~71% |
| **Funcionalidades afectadas** | Classrooms, Assignments, Grades, Reports |

---

## 🔴 GAPS CRÍTICOS IDENTIFICADOS

### GAP-TEACHER-001: Classrooms CRUD endpoints FALTANTES
**Severidad:** CRÍTICA
**Prioridad:** P0

**Frontend espera:**
- `GET /api/v1/teacher/classrooms` - Listar todos los classrooms del teacher
- `GET /api/v1/teacher/classrooms/:id` - Obtener classroom específico
- `POST /api/v1/teacher/classrooms` - Crear nuevo classroom
- `PUT /api/v1/teacher/classrooms/:id` - Actualizar classroom
- `DELETE /api/v1/teacher/classrooms/:id` - Eliminar classroom
- `GET /api/v1/teacher/classrooms/:id/students` - Listar estudiantes de classroom
- `GET /api/v1/teacher/classrooms/:id/stats` - Estadísticas de classroom
- `GET /api/v1/teacher/classrooms/:classroomId/teachers` - Listar teachers de classroom

**Backend tiene:** **NINGUNO DE ESTOS ENDPOINTS IMPLEMENTADOS**

**Evidencia:**
- **Frontend:** `apps/frontend/src/services/api/teacher/classroomsApi.ts` líneas 82-305
- **Backend:** `apps/backend/src/modules/teacher/controllers/teacher.controller.ts` - NO contiene decorators para estos endpoints
- **Backend:** `apps/backend/src/modules/teacher/controllers/teacher-classrooms.controller.ts` - Solo tiene endpoints para block/unblock students, NO CRUD de classrooms

**Funciones del frontend afectadas:**
1. `classroomsApi.getClassrooms()` → **404**
2. `classroomsApi.getClassroomById(id)` → **404**
3. `classroomsApi.getClassroomStudents(id)` → **404**
4. `classroomsApi.getClassroomStats(id)` → **404**
5. `classroomsApi.createClassroom(data)` → **404**
6. `classroomsApi.updateClassroom(id, data)` → **404**
7. `classroomsApi.deleteClassroom(id)` → **404**

**Impacto en UI:**
- Dashboard de teacher NO puede cargar lista de classrooms
- NO se puede ver detalle de un classroom
- NO se puede crear, editar ni eliminar classrooms desde el portal
- NO se pueden ver estudiantes asignados a un classroom

**Componentes/Páginas afectadas:**
- `apps/frontend/src/apps/teacher/pages/TeacherDashboardPage.tsx`
- `apps/frontend/src/apps/teacher/hooks/useClassrooms.ts` (línea 36 - useEffect que llama getClassrooms())

---

### GAP-TEACHER-002: Assignments CRUD endpoints FALTANTES
**Severidad:** CRÍTICA
**Prioridad:** P0

**Frontend espera:**
- `GET /api/v1/teacher/assignments` - Listar todas las tareas
- `GET /api/v1/teacher/assignments/:id` - Obtener tarea específica
- `POST /api/v1/teacher/assignments` - Crear nueva tarea
- `PUT /api/v1/teacher/assignments/:id` - Actualizar tarea
- `DELETE /api/v1/teacher/assignments/:id` - Eliminar tarea
- `GET /api/v1/teacher/assignments/:id/submissions` - Ver entregas de una tarea

**Backend tiene:** **NINGUNO DE ESTOS ENDPOINTS IMPLEMENTADOS**

**Evidencia:**
- **Frontend:** `apps/frontend/src/services/api/teacher/assignmentsApi.ts` líneas 106-296
- **Backend:** `apps/backend/src/modules/teacher/controllers/teacher.controller.ts` - NO contiene decorators para assignments

**Funciones del frontend afectadas:**
1. `assignmentsApi.getAssignments()` → **404**
2. `assignmentsApi.getAssignmentById(id)` → **404**
3. `assignmentsApi.createAssignment(data)` → **404**
4. `assignmentsApi.updateAssignment(id, data)` → **404**
5. `assignmentsApi.deleteAssignment(id)` → **404**
6. `assignmentsApi.getAssignmentSubmissions(id)` → **404**

**Impacto en UI:**
- NO se pueden crear tareas desde el portal teacher
- NO se puede ver lista de tareas asignadas
- NO se puede editar ni eliminar tareas
- NO se pueden ver las entregas de estudiantes por tarea

---

### GAP-TEACHER-003: Grades endpoints FALTANTES
**Severidad:** ALTA
**Prioridad:** P1

**Frontend espera:**
- `GET /api/v1/teacher/grades` - Listar todas las calificaciones
- `GET /api/v1/teacher/grades/:id` - Obtener calificación específica

**Backend tiene:** **NINGUNO DE ESTOS ENDPOINTS IMPLEMENTADOS**

**Evidencia:**
- **routes.constants.ts** líneas 386-387 - Define las rutas pero no están implementadas
- **Backend:** NO hay endpoints `/teacher/grades`

**Nota:** Existe `/teacher/submissions/:submissionId/feedback` para dar retroalimentación, pero NO hay endpoints específicos para gestionar grades como entidad separada.

**Impacto:** Si el frontend intenta cargar un listado de grades, fallará con 404.

---

### GAP-TEACHER-004: Assignment submissions endpoint inconsistency
**Severidad:** ALTA
**Prioridad:** P1

**Frontend espera:**
- `GET /api/v1/teacher/assignments/:assignmentId/submissions` - Ver entregas de una tarea específica

**Backend tiene:**
- `GET /api/v1/teacher/submissions` - Ver TODAS las entregas (sin filtro por assignment)

**Problema:** Frontend necesita filtrar entregas por assignment, pero el endpoint actual retorna todas las entregas sin capacidad de filtro por assignmentId en la URL.

**Evidencia:**
- **Frontend:** `apps/frontend/src/services/api/teacher/assignmentsApi.ts` línea 267
- **Backend:** `apps/backend/src/modules/teacher/controllers/teacher.controller.ts` línea aproximada con `@Get('submissions')`

**Impacto:** Frontend NO puede mostrar entregas específicas de una tarea de forma eficiente.

**Posibles soluciones:**
1. Implementar endpoint `/teacher/assignments/:assignmentId/submissions`
2. Agregar query param al endpoint actual: `/teacher/submissions?assignmentId=xxx`

---

### GAP-TEACHER-005: Report status endpoint FALTANTE
**Severidad:** MEDIA
**Prioridad:** P2

**Frontend espera:**
- `GET /api/v1/teacher/reports/:reportId/status` - Verificar estado de generación de reporte

**Backend tiene:**
- `POST /api/v1/teacher/reports/generate` ✓ (existe)
- Pero NO tiene endpoint para consultar el estado del reporte

**Evidencia:**
- **Frontend:** `apps/frontend/src/services/api/teacher/analyticsApi.ts` línea 274
- **Backend:** `apps/backend/src/modules/teacher/controllers/teacher.controller.ts` - Solo tiene POST para generate

**Impacto:** Frontend NO puede mostrar progreso de generación de reportes. Si el reporte tarda varios segundos, el usuario NO sabrá si está procesando o falló.

---

## ✅ ENDPOINTS QUE SÍ FUNCIONAN (Backend implementado correctamente)

### 1. Dashboard Endpoints
✅ `GET /api/v1/teacher/dashboard/stats`
✅ `GET /api/v1/teacher/dashboard/activities`
✅ `GET /api/v1/teacher/dashboard/alerts`
✅ `GET /api/v1/teacher/dashboard/top-performers`
✅ `GET /api/v1/teacher/dashboard/module-progress`

### 2. Student Progress Endpoints
✅ `GET /api/v1/teacher/students/:studentId/progress`
✅ `GET /api/v1/teacher/students/:studentId/overview`
✅ `GET /api/v1/teacher/students/:studentId/stats`
✅ `GET /api/v1/teacher/students/:studentId/notes`
✅ `POST /api/v1/teacher/students/:studentId/note`
✅ `GET /api/v1/teacher/students/:studentId/insights`

### 3. Grading/Submissions Endpoints
✅ `GET /api/v1/teacher/submissions`
✅ `GET /api/v1/teacher/submissions/:id`
✅ `POST /api/v1/teacher/submissions/:submissionId/feedback`
✅ `POST /api/v1/teacher/submissions/bulk-grade`

### 4. Analytics Endpoints
✅ `GET /api/v1/teacher/analytics`
✅ `GET /api/v1/teacher/analytics/classroom/:id`
✅ `GET /api/v1/teacher/analytics/assignment/:id`
✅ `GET /api/v1/teacher/analytics/engagement`
✅ `GET /api/v1/teacher/analytics/reports`
✅ `POST /api/v1/teacher/reports/generate`

### 5. Student Management (Classroom permissions)
✅ `POST /api/v1/teacher/classrooms/:classroomId/students/:studentId/block`
✅ `POST /api/v1/teacher/classrooms/:classroomId/students/:studentId/unblock`
✅ `GET /api/v1/teacher/classrooms/:classroomId/students/:studentId/permissions`
✅ `PATCH /api/v1/teacher/classrooms/:classroomId/students/:studentId/permissions`

---

## 📋 ANÁLISIS DE COHERENCIA: routes.constants.ts vs Backend

### Rutas definidas en routes.constants.ts pero NO implementadas:

**apps/backend/src/shared/constants/routes.constants.ts** líneas 372-392:

```typescript
teacher: {
  DASHBOARD: '/teacher/dashboard', // ✅ Implementado
  STUDENTS: '/teacher/students', // ✅ Parcialmente (solo endpoints específicos de student)
  CLASSROOMS: '/teacher/classrooms', // ❌ NO implementado (solo block/unblock)
  CLASSROOM_BY_ID: (id) => `/teacher/classrooms/${id}`, // ❌ NO implementado
  CLASSROOM_TEACHERS: (classroomId) => `/teacher/classrooms/${classroomId}/teachers`, // ❌ NO implementado
  CLASSROOM_STUDENTS: (classroomId) => `/teacher/classrooms/${classroomId}/students`, // ❌ NO implementado
  ASSIGNMENTS: '/teacher/assignments', // ❌ NO implementado
  ASSIGNMENT_BY_ID: (id) => `/teacher/assignments/${id}`, // ❌ NO implementado
  GRADES: '/teacher/grades', // ❌ NO implementado
  GRADE_BY_ID: (id) => `/teacher/grades/${id}`, // ❌ NO implementado
  ANALYTICS: '/teacher/analytics', // ✅ Implementado
  REPORTS: '/teacher/reports', // ✅ Parcialmente (solo generate)
  REPORT_BY_ID: (id) => `/teacher/reports/${id}`, // ❌ NO implementado
}
```

**Problema:** El archivo `routes.constants.ts` define constantes de rutas que tanto backend como frontend deberían usar, pero el backend NO las implementa como endpoints reales.

---

## 🎯 PLAN DE ACCIÓN RECOMENDADO

### PRIORIDAD P0 (Crítico - Implementar AHORA)

#### Tarea 1: Implementar Classrooms CRUD en Backend
**Agente responsable:** Backend-Developer
**Entregable:** Controller con endpoints completos de classrooms

**Endpoints a implementar:**
1. `GET /teacher/classrooms` - Listar classrooms del teacher autenticado
2. `GET /teacher/classrooms/:id` - Obtener classroom por ID
3. `POST /teacher/classrooms` - Crear classroom
4. `PUT /teacher/classrooms/:id` - Actualizar classroom
5. `DELETE /teacher/classrooms/:id` - Eliminar classroom
6. `GET /teacher/classrooms/:id/students` - Listar estudiantes
7. `GET /teacher/classrooms/:id/stats` - Estadísticas
8. `GET /teacher/classrooms/:classroomId/teachers` - Listar teachers

**Archivos a modificar/crear:**
- `apps/backend/src/modules/teacher/controllers/teacher-classrooms.controller.ts` (extender)
- O crear `apps/backend/src/modules/teacher/controllers/teacher-classrooms-crud.controller.ts`
- `apps/backend/src/modules/teacher/services/teacher-classrooms.service.ts` (extender)

**Validación:**
- ✅ Frontend `classroomsApi.getClassrooms()` retorna 200 OK con datos
- ✅ Dashboard de teacher carga sin errores 404
- ✅ Se pueden crear, editar y eliminar classrooms desde UI

---

#### Tarea 2: Implementar Assignments CRUD en Backend
**Agente responsable:** Backend-Developer
**Entregable:** Controller con endpoints completos de assignments

**Endpoints a implementar:**
1. `GET /teacher/assignments` - Listar assignments del teacher
2. `GET /teacher/assignments/:id` - Obtener assignment por ID
3. `POST /teacher/assignments` - Crear assignment
4. `PUT /teacher/assignments/:id` - Actualizar assignment
5. `DELETE /teacher/assignments/:id` - Eliminar assignment
6. `GET /teacher/assignments/:id/submissions` - Ver entregas de assignment

**Archivos a crear:**
- `apps/backend/src/modules/teacher/controllers/teacher-assignments.controller.ts`
- `apps/backend/src/modules/teacher/services/teacher-assignments.service.ts`
- `apps/backend/src/modules/teacher/dto/assignment.dto.ts`

**Validación:**
- ✅ Frontend `assignmentsApi.getAssignments()` retorna 200 OK
- ✅ Se pueden crear, editar y eliminar assignments desde UI teacher

---

### PRIORIDAD P1 (Alto - Próxima iteración)

#### Tarea 3: Implementar Grades endpoints en Backend
**Agente responsable:** Backend-Developer

**Endpoints a implementar:**
1. `GET /teacher/grades` - Listar grades
2. `GET /teacher/grades/:id` - Obtener grade específico
3. `POST /teacher/grades` - Crear/actualizar grade (si aplica)

**Nota:** Evaluar si grades debe ser entidad separada o si se maneja solo a través de submissions.

---

#### Tarea 4: Mejorar endpoint de submissions con filtros
**Agente responsable:** Backend-Developer

**Opción A:** Crear endpoint específico:
- `GET /teacher/assignments/:assignmentId/submissions`

**Opción B:** Agregar query params al endpoint actual:
- `GET /teacher/submissions?assignmentId=xxx&classroomId=yyy`

**Recomendación:** Opción B (más flexible y RESTful)

---

### PRIORIDAD P2 (Medio - Backlog)

#### Tarea 5: Implementar endpoint de report status
**Agente responsable:** Backend-Developer

**Endpoint a implementar:**
- `GET /teacher/reports/:reportId/status`

**Respuesta esperada:**
```json
{
  "reportId": "123",
  "status": "processing" | "completed" | "failed",
  "progress": 75,
  "estimatedTime": 30,
  "downloadUrl": "/teacher/reports/123/download"
}
```

---

## 🔄 DECISIONES ARQUITECTÓNICAS REQUERIDAS

### ADR-XXX: Estrategia de implementación de Classrooms en Teacher Module

**Contexto:**
- Frontend ya consume endpoints `/teacher/classrooms/*`
- Backend tiene módulo `classrooms` separado (admin-focused)
- Backend tiene `teacher-classrooms.controller.ts` pero solo para block/unblock

**Opciones:**

**Opción A:** Extender `teacher-classrooms.controller.ts` con CRUD completo
- ✅ Mantiene coherencia con archivo existente
- ❌ Archivo puede volverse muy grande

**Opción B:** Crear controlador separado para CRUD de classrooms del teacher
- ✅ Separación de responsabilidades (CRUD vs gestión de estudiantes)
- ❌ Dos controladores para classrooms en teacher module

**Opción C:** Reutilizar lógica del módulo `classrooms` existente y exponer endpoints en teacher module
- ✅ Evita duplicación de lógica
- ✅ Mantiene single source of truth
- ❌ Requiere validar que lógica del módulo classrooms soporta scope de teacher

**Recomendación:** **Opción C** - Reutilizar módulo classrooms existente con scope de teacher.

---

### ADR-XXX: Estrategia de implementación de Assignments

**Contexto:**
- Existe módulo `assignments` en backend
- Frontend teacher necesita crear y gestionar assignments
- Necesidad de distinguir entre admin assignments y teacher assignments

**Opciones:**

**Opción A:** Crear controlador en teacher module que delega a assignments module
- ✅ Encapsulación clara de responsabilidades de teacher
- ❌ Duplicación de endpoints

**Opción B:** Exponer endpoints de assignments module con guards de rol teacher
- ✅ Evita duplicación
- ❌ Mezcla concerns de admin y teacher en mismo controller

**Recomendación:** **Opción A** - Mantener separación clara entre admin y teacher concerns.

---

## 📚 REFERENCIAS

### Archivos Frontend Analizados:
- `apps/frontend/src/services/api/teacher/classroomsApi.ts`
- `apps/frontend/src/services/api/teacher/assignmentsApi.ts`
- `apps/frontend/src/services/api/teacher/analyticsApi.ts`
- `apps/frontend/src/services/api/teacher/gradingApi.ts`
- `apps/frontend/src/services/api/teacher/studentProgressApi.ts`
- `apps/frontend/src/services/api/teacher/teacherApi.ts`
- `apps/frontend/src/apps/teacher/hooks/useClassrooms.ts`
- `apps/frontend/src/apps/teacher/pages/TeacherDashboardPage.tsx`

### Archivos Backend Analizados:
- `apps/backend/src/modules/teacher/controllers/teacher.controller.ts`
- `apps/backend/src/modules/teacher/controllers/teacher-classrooms.controller.ts`
- `apps/backend/src/shared/constants/routes.constants.ts`

### Documentación Relacionada:
- `orchestration/trazas/TRAZA-ANALISIS-ARQUITECTURA.md`
- `orchestration/trazas/TRAZA-TAREAS-FRONTEND.md`
- `orchestration/trazas/TRAZA-TAREAS-BACKEND.md`

---

## 🎯 PRÓXIMOS PASOS

### Inmediatos (HOY):
1. [ ] Revisar y aprobar este análisis
2. [ ] Decidir estrategia de implementación (ADRs propuestos)
3. [ ] Priorizar qué endpoints implementar primero
4. [ ] Asignar tareas a Backend-Developer

### Corto plazo (Esta semana):
1. [ ] Implementar GAP-TEACHER-001 (Classrooms CRUD) - **CRÍTICO**
2. [ ] Implementar GAP-TEACHER-002 (Assignments CRUD) - **CRÍTICO**
3. [ ] Validar que frontend funciona correctamente
4. [ ] Actualizar tests E2E para incluir estos endpoints

### Mediano plazo (Próximas 2 semanas):
1. [ ] Implementar GAP-TEACHER-003 (Grades endpoints)
2. [ ] Implementar GAP-TEACHER-004 (Submissions con filtros)
3. [ ] Implementar GAP-TEACHER-005 (Report status)
4. [ ] Actualizar documentación de APIs

---

**Analista:** Architecture-Analyst
**Fecha:** 2025-11-24
**Estado:** Análisis completo - Pendiente de aprobación e implementación
**Impacto:** CRÍTICO - Portal teacher NO funcional sin estos endpoints
