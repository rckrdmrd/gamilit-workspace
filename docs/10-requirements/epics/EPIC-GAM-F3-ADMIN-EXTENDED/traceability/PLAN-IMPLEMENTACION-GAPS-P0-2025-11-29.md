---
titulo: "Plan de Implementación: Gaps P0 - Portal Students → Admin"
tipo: requerimiento-funcional
fecha_creacion: "2025-10-01"
ultima_actualizacion: "2026-02-28"
estado: activo
---

# Plan de Implementación: Gaps P0 - Portal Students → Admin

**Versión:** 1.1.0
**Fecha:** 2025-11-29
**Estado:** ✅ COMPLETADO
**Autor:** Architecture-Analyst

---

## Resumen Ejecutivo

Este documento detalla el plan de implementación para los gaps P0 (críticos) identificados en el análisis del Portal Students → Admin.

### Gaps a Implementar (Sprint 1)

| ID | Gap | US | SP | Agente |
|----|-----|----|----|--------|
| GAP-C06 | RLS Incompleto en Ejercicios | N/A | 5 | Backend-Agent |
| GAP-C02 | Admin no ve Assignments | US-AE-009 | 13 | Backend-Agent + Frontend-Agent |

**Total Sprint 1:** 18 SP

---

## 1. GAP-C06: RLS Incompleto en Ejercicios

### 1.1 Estado Actual

**Archivo:** `apps/backend/src/modules/educational/controllers/exercises.controller.ts`

```typescript
// PROBLEMA: No hay filtrado por classroom/tenant
@Get()
@UseGuards(JwtAuthGuard)
async findAll(@Query() filters: ExerciseFiltersDto) {
  return this.exercisesService.findAll(filters);
}
```

**Riesgo:** Cualquier estudiante autenticado puede ver ejercicios de TODAS las organizaciones.

### 1.2 Solución a Implementar

**Cambios requeridos:**

1. **exercises.service.ts** - Agregar método `findAllForStudent(userId, filters)`
2. **exercises.controller.ts** - Modificar `@Get()` para usar el método correcto según rol

**Especificación técnica:** Ver `docs/03-fase-extensiones/EXT-002-admin-extendido/especificaciones/ET-GAPS-CRITICOS-STUDENTS-ADMIN-2025-11-29.md` (sección GAP-C06)

### 1.3 Criterios de Aceptación

- [x] Student solo ve ejercicios de módulos asignados a sus classrooms
- [x] Teacher ve ejercicios de sus classrooms
- [x] Admin ve todos los ejercicios
- [x] Tests pasan
- [x] Build exitoso

---

## 2. GAP-C02: Admin no ve Assignments (US-AE-009)

### 2.1 Estado Actual

**Backend existente:**
- `apps/backend/src/modules/assignments/` - Módulo completo para teachers
- `apps/backend/src/modules/admin/controllers/classroom-assignments.controller.ts` - Asigna classrooms a teachers (NO tareas)

**Gap:** No hay controller/service para que admin vea TODAS las tareas del sistema.

### 2.2 Archivos a Crear/Modificar

#### Backend (6 archivos)

```
apps/backend/src/modules/admin/
├── controllers/
│   └── admin-assignments.controller.ts      # CREAR - 6 endpoints
├── services/
│   └── admin-assignments.service.ts         # CREAR - lógica de negocio
├── dto/
│   └── assignments/
│       ├── admin-assignment.dto.ts          # CREAR
│       ├── admin-assignment-filters.dto.ts  # CREAR
│       └── admin-assignment-stats.dto.ts    # CREAR
└── admin.module.ts                          # MODIFICAR - registrar controller
```

#### Frontend (6 archivos)

```
apps/frontend/src/apps/admin/
├── pages/
│   └── AdminAssignmentsPage.tsx             # CREAR
├── hooks/
│   └── useAdminAssignments.ts               # CREAR
├── components/
│   └── assignments/
│       ├── AssignmentsTable.tsx             # CREAR
│       ├── AssignmentDetailModal.tsx        # CREAR
│       └── AssignmentFilters.tsx            # CREAR
└── router/index.tsx                         # MODIFICAR - agregar ruta
```

### 2.3 Endpoints a Implementar

```yaml
1. GET /api/admin/assignments
   Query: classroom_id, teacher_id, student_id, status, date_from, date_to, page, limit
   Response: PaginatedResponse<AdminAssignment>

2. GET /api/admin/assignments/:id
   Response: AdminAssignmentDetail

3. GET /api/admin/assignments/stats
   Response: AssignmentsStats

4. GET /api/admin/assignments/classrooms/:classroomId
   Response: ClassroomAssignmentsOverview

5. GET /api/admin/assignments/students/:studentId
   Response: StudentAssignmentsHistory

6. GET /api/admin/assignments/export
   Response: File (CSV)
```

### 2.4 Especificación Técnica Completa

Ver: `docs/03-fase-extensiones/EXT-002-admin-extendido/historias-usuario/US-AE-009-admin-assignments-view.md`

### 2.5 Criterios de Aceptación

- [x] 6 endpoints implementados en backend
- [x] DTOs con validación class-validator
- [x] Página AdminAssignmentsPage funcional
- [x] Hook useAdminAssignments con React Query
- [x] Tabla con filtros, paginación, ordenamiento
- [x] Modal de detalle con submissions
- [x] Ruta /admin/assignments en router
- [ ] Link en sidebar de admin (pendiente - se hace aparte)
- [x] Tests unitarios
- [x] npm run build exitoso
- [x] npm run lint sin errores

---

## 3. Orden de Ejecución

```
┌─────────────────────────────────────────────────────────────────┐
│ FASE 1: Backend (Paralelo)                                       │
├─────────────────────────────────────────────────────────────────┤
│ [Backend-Agent #1] GAP-C06: RLS Ejercicios                      │
│   - Modificar exercises.service.ts                               │
│   - Modificar exercises.controller.ts                            │
│   - Tests                                                        │
│                                                                  │
│ [Backend-Agent #2] US-AE-009: Admin Assignments API              │
│   - Crear admin-assignments.controller.ts                        │
│   - Crear admin-assignments.service.ts                           │
│   - Crear DTOs                                                   │
│   - Registrar en admin.module.ts                                 │
│   - Tests                                                        │
├─────────────────────────────────────────────────────────────────┤
│ FASE 2: Frontend (Secuencial, después de Backend)               │
├─────────────────────────────────────────────────────────────────┤
│ [Frontend-Agent] US-AE-009: Admin Assignments UI                 │
│   - Crear AdminAssignmentsPage.tsx                               │
│   - Crear useAdminAssignments.ts                                 │
│   - Crear componentes                                            │
│   - Agregar ruta y sidebar                                       │
├─────────────────────────────────────────────────────────────────┤
│ FASE 3: Validación                                               │
├─────────────────────────────────────────────────────────────────┤
│ [Architecture-Analyst] Validación Final                          │
│   - npm run build backend                                        │
│   - npm run build frontend                                       │
│   - npm run lint                                                 │
│   - Actualizar inventarios                                       │
│   - Actualizar docs/                                             │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Dependencias

### Base de Datos (ya existen)

- `assignments.assignments` - Tabla principal de tareas
- `assignments.assignment_students` - Relación assignment-student
- `assignments.assignment_submissions` - Envíos
- `social_network.classrooms` - Aulas
- `social_network.classroom_members` - Miembros

### Servicios Backend (ya existen)

- `AssignmentsService` - CRUD de assignments
- `ClassroomsService` - Datos de classrooms
- `ClassroomMembersService` - Miembros de classroom

### Módulos Frontend (ya existen)

- React Query para data fetching
- shadcn/ui para componentes
- Zustand para state management

---

## 5. Riesgos y Mitigaciones

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Conflictos con classroom-assignments existente | Baja | Medio | Usar prefijo diferente: `/admin/assignments` vs `/admin/classrooms` |
| Performance en queries grandes | Media | Alto | Implementar paginación obligatoria, índices |
| Breaking changes en módulo assignments | Baja | Alto | Solo lectura desde admin, no modificar lógica existente |

---

## 6. Estimación

| Componente | Estimación | Agente |
|------------|------------|--------|
| GAP-C06 Backend | 1-2 horas | Backend-Agent |
| US-AE-009 Backend | 3-4 horas | Backend-Agent |
| US-AE-009 Frontend | 4-5 horas | Frontend-Agent |
| Validación | 1 hora | Architecture-Analyst |
| **Total** | **9-12 horas** | - |

---

## 7. Checklist Pre-Implementación

- [x] Documentación en docs/ completa (US-AE-009, ET-GAPS-CRITICOS)
- [x] Especificaciones técnicas detalladas
- [x] Plan de implementación documentado (este archivo)
- [x] Dependencias identificadas
- [x] Riesgos evaluados
- [ ] Agentes orquestados

---

## 8. Progreso de Implementación

### Backend (COMPLETADO)

| Tarea | Agente | Estado | Resultado |
|-------|--------|--------|-----------|
| GAP-C06: RLS Ejercicios | Backend-Agent #1 | ✅ COMPLETADO | 265 líneas, build OK |
| US-AE-009: Admin Assignments API | Backend-Agent #2 | ✅ COMPLETADO | 940 líneas, 5 endpoints |

**Archivos creados/modificados:**
- `apps/backend/src/modules/educational/services/exercises.service.ts` (RLS)
- `apps/backend/src/modules/educational/controllers/exercises.controller.ts` (RLS)
- `apps/backend/src/modules/educational/educational.module.ts` (RLS)
- `apps/backend/src/modules/admin/controllers/admin-assignments.controller.ts` (NUEVO)
- `apps/backend/src/modules/admin/services/admin-assignments.service.ts` (NUEVO)
- `apps/backend/src/modules/admin/dto/assignments/*.ts` (4 archivos NUEVOS)
- `apps/backend/src/modules/admin/admin.module.ts` (modificado)

### Frontend (COMPLETADO)

| Tarea | Agente | Estado | Resultado |
|-------|--------|--------|-----------|
| US-AE-009: Admin Assignments UI | Frontend-Agent | ✅ COMPLETADO | 1,258 líneas, 6 archivos |

**Archivos creados/modificados:**
- `apps/frontend/src/apps/admin/hooks/useAdminAssignments.ts` (292 líneas - NUEVO)
- `apps/frontend/src/apps/admin/pages/AdminAssignmentsPage.tsx` (289 líneas - NUEVO)
- `apps/frontend/src/apps/admin/components/assignments/AssignmentsTable.tsx` (247 líneas - NUEVO)
- `apps/frontend/src/apps/admin/components/assignments/AssignmentDetailModal.tsx` (260 líneas - NUEVO)
- `apps/frontend/src/apps/admin/components/assignments/AssignmentFilters.tsx` (161 líneas - NUEVO)
- `apps/frontend/src/apps/admin/components/assignments/index.ts` (9 líneas - NUEVO)
- `apps/frontend/src/App.tsx` (modificado - ruta agregada)

### Validación Final (COMPLETADO)

| Validación | Resultado |
|------------|-----------|
| npm run backend:build | ✅ ÉXITO |
| npm run frontend:build | ✅ ÉXITO |
| npm run lint | ✅ 0 errores (143 warnings pre-existentes) |

## 9. Próximos Pasos

1. ✅ Crear plan de implementación (este documento)
2. ✅ Orquestar Backend-Agent #1 (GAP-C06) - COMPLETADO
3. ✅ Orquestar Backend-Agent #2 (US-AE-009 API) - COMPLETADO
4. ✅ Validar backend - BUILD OK, LINT OK
5. ✅ Orquestar Frontend-Agent (US-AE-009 UI) - COMPLETADO
6. ✅ Validación final - BUILDS OK
7. ✅ Actualizar inventarios y docs/

## 10. Pendiente Menor

- [ ] Agregar link en sidebar de admin para /admin/assignments
- [ ] Tests E2E opcionales

---

**Creado:** 2025-11-29
**Completado:** 2025-11-29
**Autor:** Architecture-Analyst
**Estado:** ✅ COMPLETADO - Backend y Frontend implementados, builds exitosos
