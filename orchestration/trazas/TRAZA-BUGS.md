# TRAZA DE BUGS - GAMILIT

**Versión:** 2.1.0
**Proyecto:** GAMILIT - Sistema de Gamificación Educativa
**Fecha creación:** 2025-11-23
**Última actualización:** 2026-01-25 (TASK-020: Fix SET LOCAL RLS Error)
**Revisado en auditoría:** 2026-01-10 (18/22 bugs resueltos, 4 pendientes)
**Fuente:** Migrado desde orchestration_old/ + Nuevos bugs detectados en auditoría 2025-11-23

> **Nota Auditoría (2026-01-10):** Esta traza fue revisada durante la auditoría de documentación. Estado: 82% bugs resueltos (18/22). Bugs pendientes: BUG-003, BUG-005, BUG-007, BUG-009.

> **NOTA ARCHIVO (2026-02-11):** Las descripciones detalladas de bugs anteriores a 2026
> fueron archivadas en `_archive/TRAZA-BUGS-HISTORICO.md`. Este archivo conserva el
> indice completo, el bug mas reciente (BUG-RLS-001), metricas, referencias y
> las actualizaciones 2026.

---

## ÍNDICE DE BUGS

| ID | Fecha | Módulo | Severidad | Estado | Descripción |
|----|-------|--------|-----------|--------|-------------|
| **BUG-RLS-001** | 2026-01-25 | Backend | Crítico | Resuelto | SET LOCAL con $1 placeholder - PostgreSQL syntax error |
| **BUG-001** | 2025-11-19 | Database | Crítico | Resuelto | Ejercicio Crucigrama no funcional - formato solution incorrecto |
| **BUG-002** | 2025-11-11 | Frontend | Medio | Resuelto | Error 500 en Leaderboard - tipo de dato incorrecto |
| **BUG-003** | 2025-11-11 | Backend | Medio | Pendiente | Endpoint POST /exercises/:id/submit no implementado |
| **BUG-004** | 2025-11-19 | Frontend | Bajo | Resuelto | TypeScript errors (321 a 52) |
| **BUG-005** | 2025-11-11 | Backend | Medio | Pendiente | DTOs incompletos en respuestas Auth |
| **BUG-FRONTEND-001** | 2025-11-23 | Frontend | Crítico | Resuelto | Imports rotos de API Client - Frontend caído |
| **BUG-FRONTEND-002** | 2025-11-23 | Frontend | Crítico | Resuelto | Rutas con /v1/ incorrectas - Errores 404 en gamificación |
| **BUG-FRONTEND-003** | 2025-11-23 | Frontend | Crítico | Resuelto | 7 rutas con /v1/ en múltiples módulos - Bloquea ejercicio 3 |
| **BUG-ADMIN-001** | 2025-11-23 | Backend | Crítico | Resuelto | Campo last_sign_in_at nunca se actualiza - AdminUsersPage muestra NULL |
| **BUG-ADMIN-002** | 2025-11-23 | Backend | Crítico | Resuelto | Endpoint /admin/dashboard/actions/recent no implementado |
| **BUG-ADMIN-003** | 2025-11-23 | Backend | Crítico | Resuelto | Endpoint /admin/dashboard/alerts no implementado |
| **BUG-ADMIN-004** | 2025-11-23 | Backend | Crítico | Resuelto | Endpoint /admin/dashboard/analytics/user-activity no implementado |
| **BUG-ADMIN-005** | 2025-11-23 | Frontend | Alto | Resuelto | useUserGamification retorna mock data en lugar de datos reales |
| **BUG-ADMIN-006** | 2025-11-23 | Frontend | Alto | Resuelto | AdminInstitutionsPage sin validación - crashes por undefined arrays |
| **BUG-ADMIN-007** | 2025-11-23 | Frontend | Alto | Resuelto | Features array undefined causa .map() crashes |
| **BUG-ADMIN-008** | 2025-11-23 | Frontend | Alto | Resuelto | Ranks de gamificación sin validación - .toFixed() sobre undefined |
| **BUG-ADMIN-009** | 2025-11-23 | Frontend | Alto | Resuelto | Propiedades opcionales causan crashes en runtime |
| **BUG-TEACHER-001** | 2025-11-23 | Frontend | Crítico | Resuelto | TeacherStudentsPage con 65 líneas de mock data hardcodeado |
| **BUG-TEACHER-002** | 2025-11-23 | Frontend | Alto | Resuelto | TeacherDashboard muestra "undefined" en stats |
| **BUG-TEACHER-003** | 2025-11-23 | Frontend | Alto | Resuelto | TeacherAnalytics crashea con datos null en gráficas |
| **BUG-TEACHER-004** | 2025-11-23 | Frontend | Alto | Resuelto | TeacherDashboard muestra mock students en lugar de datos reales |
| **BUG-TEACHER-006** | 2025-11-23 | Frontend | Alto | Resuelto | Stats undefined causa "NaN%" en UI |
| **BUG-TEACHER-007** | 2025-11-23 | Frontend | Alto | Resuelto | Charts y tablas sin validación de datos null |
| **BUG-MONITORING-001** | 2026-01-25 | Frontend | Alto | Resuelto | "Última Actividad" Mal Mostrada en Student Cards |
| **BUG-MONITORING-002** | 2026-01-25 | Frontend | Crítico | Resuelto | Pantalla Negra al Clic en Card de Estudiante |

---

## BUGS CRÍTICOS (2026)

### BUG-RLS-001: SET LOCAL con placeholder $1 causa syntax error

**Fecha detección:** 2026-01-25
**Fecha resolución:** 2026-01-25
**Módulo afectado:** Backend (TeacherReportsService)
**Severidad:** Crítico
**Estado:** Resuelto
**Task:** TASK-020

**Síntoma:**
```
QueryFailedError: syntax error at or near "$1"
query: 'SET LOCAL app.current_user_id = $1'
```

**Causa raíz:**
PostgreSQL `SET LOCAL` command no soporta queries parametrizadas ($1, $2, etc.).
El código usaba `manager.query('SET LOCAL app.current_user_id = $1', [teacherId])`.

**Solución:**
1. Agregar validación UUID antes de usar el valor
2. Usar interpolación de string literal: `` `SET LOCAL app.current_user_id = '${teacherId}'` ``

**Archivos modificados:**
- `apps/backend/src/modules/teacher/services/teacher-reports.service.ts`
  - Línea 49: `getRecentReports()`
  - Línea 74: `getReportStats()`
  - Línea 144: `getReportById()`
  - Línea 207: `deleteReport()`

**Origen del bug:**
Introducido en TASK-015-fix-teacher-reports-rls donde se agregó soporte RLS
con sintaxis incorrecta de query parametrizada.

---

> _Descripciones detalladas de bugs anteriores (BUG-001 a BUG-005, BUG-FRONTEND-*,_
> _BUG-ADMIN-*, BUG-TEACHER-*) en `_archive/TRAZA-BUGS-HISTORICO.md`._

---

## MÉTRICAS DE BUGS

### Resumen Actual (Actualizado 2026-01-25)

```yaml
total_bugs_registrados: 25
bugs_criticos_resueltos: 8
bugs_altos_resueltos: 10
bugs_medios_resueltos: 3
bugs_medios_pendientes: 2     # BUG-003, BUG-005
bugs_menores_resueltos: 2

tasa_resolucion: "91.3% (21/23)"
bugs_criticos_pendientes: 0
bugs_altos_pendientes: 0
bugs_bloqueantes_pendientes: 1  # BUG-003 (ejercicio submit)

tiempo_promedio_resolucion:
  critico: "< 1 día (promedio: 30 minutos)"
  alto: "< 1 día (promedio: 1 hora)"
  medio: "< 1 día (promedio: 30 minutos)"
  bajo: "1-3 días"
```

### Distribución por Módulo

```yaml
database: 1 bug (100% resuelto - 1 de 1)
backend: 7 bugs (71% resuelto - 5 de 7)
frontend: 15 bugs (100% resuelto - 15 de 15)
```

### Distribución por Severidad

```yaml
critico: 8 (100% resuelto)
alto: 10 (100% resuelto)
medio: 5 (60% resuelto - 3 de 5)
bajo: 2 (100% resuelto)
```

---

## PRÓXIMOS PASOS

### Prioridad P0 (Inmediato)

- [ ] **BUG-003:** Implementar endpoint POST /exercises/:id/submit
- [ ] **BUG-005:** Completar DTOs de Auth

### Mejoras Preventivas

- [ ] Implementar tests de regresión para bugs críticos resueltos
- [ ] Crear suite de tests E2E para flujos principales

---

## ACTUALIZACIONES 2026

### BUG-MONITORING-001: "Última Actividad" Mal Mostrada en Student Cards

**Fecha:** 2026-01-25 | **Severidad:** Alta | **Estado:** Resuelto
**Módulo:** Frontend (Teacher Portal - Student Monitoring) | **Task:** TASK-014

**Root Cause:** Discrepancia de tipos: Backend `last_activity?: Date` (nullable), Frontend `last_activity: string` (no nullable). `new Date(null)` retorna epoch (1970-01-01).

**Solución:** 5 archivos modificados con validación null y fallbacks.

---

### BUG-MONITORING-002: Pantalla Negra al Clic en Card de Estudiante

**Fecha:** 2026-01-25 | **Severidad:** Crítico | **Estado:** Resuelto
**Módulo:** Frontend (Teacher Portal - Student Detail Modal) | **Task:** TASK-014

**Root Cause:** Si `student.id` era undefined (mapeo fallido de user_id a id), las llamadas API fallaban silenciosamente.

**Solución:** Fallback para IDs undefined + validación de student.id antes de APIs.

---

### BUG-TEACHER-DB125-001: Teacher services confunden user_id vs profile.id (DB-125)

**Fecha detección:** 2026-03-01
**Fecha resolución:** 2026-03-01
**Módulo afectado:** Backend (teacher module - exercise-responses, teacher-classrooms-crud)
**Severidad:** Crítico
**Estado:** Resuelto

**Síntoma:**
```
GET /api/v1/teacher/classrooms → 404 Not Found
GET /api/v1/teacher/attempts → 500 "Teacher profile not found"
```

**Causa raíz:**
Los servicios del módulo teacher trataban `req.user.id` (que es `profiles.id` per DB-125) como si fuera `auth.users.id`. Esto causaba queries incorrectas:
- `profileRepo.findOne({ user_id: userId })` — `userId` ya es `profiles.id`, no `auth.users.id`
- `userRepo.findOne({ id: teacherId })` — `teacherId` es `profiles.id`, no `auth.users.id`

**Solución:**
1. `exercise-responses.service.ts`: Cambiar `getTeacherProfile()` para usar dual-lookup DB-125 (`{ id: userId }` primero, fallback `{ user_id: userId }`)
2. `exercise-responses.service.ts`: Re-throw de excepciones tipadas (UnauthorizedException, NotFoundException) en catch block en vez de envolverlas como InternalServerErrorException
3. `teacher-classrooms-crud.service.ts` `getClassrooms()`: Cambiar validación de `userRepo.findOne({ id })` a `profileRepo.findOne({ id })`
4. `teacher-classrooms-crud.service.ts` `createClassroom()`: Eliminar doble-query redundante, usar single lookup con fallback
5. `teacher-classrooms-crud.service.ts` `getClassroomTeachers()`: Cambiar `profileRepo.find({ user_id: In(teacherIds) })` a `{ id: In(teacherIds) }`, derivar userIds desde profiles encontrados

**Archivos modificados:**
- `apps/backend/src/modules/teacher/services/exercise-responses.service.ts`
  - Líneas 55-72: `getTeacherProfile()` — dual-lookup DB-125
  - Líneas 285-294: catch block — re-throw excepciones tipadas
- `apps/backend/src/modules/teacher/services/teacher-classrooms-crud.service.ts`
  - Líneas 120-124: `getClassrooms()` — profileRepo en vez de userRepo
  - Líneas 511-526: `getClassroomTeachers()` — lookup por profiles.id
  - Líneas 731-748: `createClassroom()` — single lookup eliminando redundancia

**Origen del bug:**
Confusión histórica entre `auth.users.id` y `auth_management.profiles.id`. La convención DB-125 (JWT sub = profiles.id) fue establecida pero no aplicada consistentemente en todos los servicios teacher. Los servicios `teacher-content.service.ts` y `classroom-ownership.guard.ts` ya implementaban el patrón correcto.

---

**Última actualización:** 2026-03-01
**Mantenido por:** Bug-Fixer Agent / QA Team

*Archivado: 2026-02-11 | Bugs anteriores en `_archive/TRAZA-BUGS-HISTORICO.md`*
