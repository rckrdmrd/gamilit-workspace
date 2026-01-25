# 03-MATRIZ-COHERENCIA.md - Auditoría Portal Teacher

**Tarea:** TASK-2026-01-25-ANALISIS-PORTAL-TEACHER
**Fase:** FASE-1 - Auditoría de Coherencia
**Fecha:** 2026-01-25

---

## 1. Matriz: Páginas Implementadas vs User Stories

| Página | Ruta | User Story | Estado US | Estado Impl | Coherencia |
|--------|------|------------|-----------|-------------|------------|
| TeacherDashboard | `/teacher/dashboard` | US-PM-000 | Done | 100% | ✅ Coherente |
| TeacherClasses | `/teacher/classes` | US-PM-001a | Done | 100% | ✅ Coherente |
| TeacherStudents | `/teacher/students` | US-PM-001b | In Progress | 100% | ⚠️ US desactualizada |
| TeacherAssignments | `/teacher/assignments` | US-PM-002a, 002b, 002c | Backlog | 100% | ❌ US no refleja impl |
| TeacherExerciseResponses | `/teacher/responses` | - | - | 100% | ❌ Sin US |
| TeacherReviewPanel | `/teacher/reviews` | - | - | 100% | ❌ Sin US |
| TeacherProgress | `/teacher/progress` | US-PM-004a, 005a | Backlog | 100% | ❌ US no refleja impl |
| TeacherAlerts | `/teacher/alerts` | US-PM-007 | Backlog | 100% | ⚠️ US es para config, no vista |
| TeacherReports | `/teacher/reports` | US-PM-005b | Backlog | 100% | ❌ US no refleja impl |
| TeacherAnalytics | `/teacher/analytics` | US-PM-004a, 005a, 005c | Backlog | 100% | ❌ US no refleja impl |
| TeacherMonitoring | `/teacher/monitoring` | - | - | 100% | ❌ Sin US |
| TeacherGamification | `/teacher/gamification` | US-PM-008 | Done | 100% | ✅ Coherente |
| TeacherContent | `/teacher/content` | - | - | 100% | ❌ Sin US |
| TeacherCommunication | `/teacher/communication` | US-PM-010 | Done | 100% | ✅ Coherente |
| TeacherSettings | `/teacher/settings` | US-PM-011 | Done | 100% | ✅ Coherente |
| TeacherNotifications | `/teacher/notifications` | US-PM-012 | Done | 100% | ✅ Coherente |
| TeacherNotificationPrefs | `/teacher/settings/notifications` | US-PM-013 | Done | 100% | ✅ Coherente |
| TeacherContentManagement | (componente interno) | - | - | 100% | ❌ Sin US |

### Resumen de Coherencia

| Estado | Cantidad | Porcentaje |
|--------|----------|------------|
| ✅ Coherente | 7 | 39% |
| ⚠️ Parcial | 2 | 11% |
| ❌ Sin coherencia | 9 | 50% |

---

## 2. Matriz: User Stories vs Implementación

| US | Título | Estado Doc | Implementada | Componentes Reales | Gap |
|----|--------|------------|--------------|-------------------|-----|
| US-PM-000 | Dashboard Maestro | Done | ✅ 100% | TeacherDashboard.tsx | Ninguno |
| US-PM-001a | CRUD Aulas | Done | ✅ 100% | TeacherClasses.tsx | Ninguno |
| US-PM-001b | Gestión Estudiantes | In Progress | ✅ 100% | TeacherStudents.tsx | US desactualizada |
| US-PM-002a | CRUD Assignments | Backlog | ✅ 100% | TeacherAssignments.tsx | **US incorrecta** |
| US-PM-002b | Distribución Assignments | Backlog | ✅ 100% | TeacherAssignments.tsx | **US incorrecta** |
| US-PM-002c | Vista Submissions | Backlog | ✅ 100% | TeacherAssignments.tsx | **US incorrecta** |
| US-PM-003a | Cola Calificaciones | Backlog | ✅ 100% | TeacherAssignments.tsx | **US incorrecta** |
| US-PM-003b | Interfaz Calificación | Backlog | ✅ 100% | TeacherAssignments.tsx | **US incorrecta** |
| US-PM-004a | Progress Analytics | Backlog | ✅ 100% | TeacherProgress.tsx | **US incorrecta** |
| US-PM-004b | Teacher Notes | Backlog | ⚠️ Parcial | (en StudentDetailModal) | Feature menor |
| US-PM-005a | Classroom Analytics | Backlog | ✅ 100% | TeacherAnalytics.tsx | **US incorrecta** |
| US-PM-005b | Report Generation | Backlog | ✅ 100% | TeacherReports.tsx | **US incorrecta** |
| US-PM-005c | Engagement Metrics | Backlog | ✅ 100% | TeacherAnalytics.tsx | **US incorrecta** |
| **US-PM-006** | Bloquear Alumnos | Backlog | ❌ 0% | - | **CRÍTICO** |
| **US-PM-007** | Config Alertas | Backlog | ❌ 0% | - | **CRÍTICO** |
| US-PM-008 | Gamification Mgmt | Done | ✅ 100% | TeacherGamification.tsx | Ninguno |
| US-PM-009 | Resources Mgmt | Done | ⚠️ 60% | ResourceSharingPanel | Falta página |
| US-PM-010 | Communication Center | Done | ✅ 100% | TeacherCommunication.tsx | Ninguno |
| US-PM-011 | Teacher Settings | Done | ✅ 100% | TeacherSettings.tsx | Ninguno |
| US-PM-012 | Notifications Center | Done | ✅ 100% | TeacherNotifications.tsx | Ninguno |
| US-PM-013 | Notification Prefs | Done | ✅ 100% | TeacherNotificationPrefs.tsx | Ninguno |

### Resumen de User Stories

| Estado Documentado | Cantidad | Implementada | No Implementada |
|-------------------|----------|--------------|-----------------|
| Done | 7 | 6 | 1 (US-PM-009 parcial) |
| In Progress | 1 | 1 | 0 |
| Backlog | 13 | 11 | **2 (US-PM-006, 007)** |
| **TOTAL** | **21** | **18** | **3** |

---

## 3. Matriz: Endpoints Backend vs Servicios Frontend

| Controlador | Endpoints BE | Servicio FE | Métodos FE | Cobertura |
|-------------|--------------|-------------|------------|-----------|
| TeacherController (dashboard) | 5 | teacherApi.ts | 5 | ✅ 100% |
| TeacherController (progress) | 6 | studentProgressApi.ts | 5 | ⚠️ 83% |
| TeacherController (grading) | 4 | gradingApi.ts | 4 | ✅ 100% |
| TeacherController (analytics) | 8 | analyticsApi.ts | 8 | ✅ 100% |
| TeacherController (reports) | 17 | reportsApi.ts | 17 | ✅ 100% |
| TeacherController (bonus) | 1 | bonusCoinsApi.ts | 1 | ✅ 100% |
| TeacherClassroomsController | 13 | classroomsApi.ts | 10 | ⚠️ 77% |
| InterventionAlertsController | 7 | interventionAlertsApi.ts | 6 | ⚠️ 86% |
| TeacherCommunicationController | 8 | teacherMessagesApi.ts | 8 | ✅ 100% |
| TeacherContentController | 7 | teacherContentApi.ts | 7 | ✅ 100% |
| TeacherGradesController | 2 | gradingApi.ts | 2 | ✅ 100% |
| ManualReviewController | 11 | manualReviewApi.ts | 11 | ✅ 100% (TASK-2026-01-25) |
| AssignmentsController | 16 | assignmentsApi.ts | 14 | ⚠️ 88% |
| ExerciseResponsesController | 4 | exerciseResponsesApi.ts | 4 | ✅ 100% |

### Resumen de Cobertura API

| Cobertura | Controladores | Porcentaje |
|-----------|---------------|------------|
| ✅ 100% | 10 | 71% |
| ⚠️ 75-99% | 4 | 29% |
| ❌ 0% | 0 | 0% |

**NOTA:** ManualReviewController ahora tiene cobertura 100% (TASK-2026-01-25).

---

## 4. Matriz: Hooks vs APIs Consumidas

| Hook | APIs Consumidas | Endpoints Usados | Estado |
|------|-----------------|------------------|--------|
| useTeacherDashboard | teacherApi | 5 | ✅ Completo |
| useClassrooms | classroomsApi | 6 | ✅ Completo |
| useClassroomsStats | classroomsApi | 1 | ✅ Completo |
| useClassroomData | classroomsApi | 2 | ✅ Completo |
| useClassroomRealtime | WebSocket | N/A | ✅ Completo |
| useStudentProgress | studentProgressApi | 3 | ✅ Completo |
| useStudentMonitoring | classroomsApi | 2 | ✅ Completo |
| useMasteryTracking | analyticsApi | 1 | ✅ Completo |
| useAssignments | assignmentsApi | 8 | ✅ Completo |
| useExerciseResponses | exerciseResponsesApi | 3 | ✅ Completo |
| useGrading | gradingApi | 3 | ✅ Completo |
| useAnalytics | analyticsApi | 4 | ✅ Completo |
| useStudentInsights | studentProgressApi | 1 | ✅ Completo |
| useMissionStats | analyticsApi | 1 | ✅ Completo |
| useGrantBonus | bonusCoinsApi | 1 | ✅ Completo |
| useEconomyAnalytics | analyticsApi | 1 | ✅ Completo |
| useStudentsEconomy | analyticsApi | 1 | ✅ Completo |
| useAchievementsStats | analyticsApi | 1 | ✅ Completo |
| useTeacherMessages | teacherMessagesApi | 6 | ✅ Completo |
| useInterventionAlerts | interventionAlertsApi | 4 | ✅ Completo |
| useTeacherContent | teacherContentApi | 5 | ✅ Completo |
| useManualReviews | **Sin API dedicada** | React Query directo | ⚠️ Acoplado |
| useManualReviewConfig | **Sin API dedicada** | React Query directo | ⚠️ Acoplado |

### Observaciones de Hooks

- **23 hooks** totales documentados
- **21 hooks** con API services bien separados
- **2 hooks** (useManualReviews, useManualReviewConfig) hacen llamadas directas sin servicio centralizado

---

## 5. Matriz: Componentes por Documentación

| Carpeta | Componentes | En Docs | Sin Doc | Cobertura |
|---------|-------------|---------|---------|-----------|
| alerts/ | 2 | 0 | 2 | 0% |
| analytics/ | 3 | 1 | 2 | 33% |
| assignments/ | 6 | 2 | 4 | 33% |
| collaboration/ | 2 | 0 | 2 | 0% |
| communication/ | 6 | 0 | 6 | 0% |
| dashboard/ | 10 | 3 | 7 | 30% |
| monitoring/ | 5 | 1 | 4 | 20% |
| progress/ | 4 | 1 | 3 | 25% |
| reports/ | 2 | 1 | 1 | 50% |
| review-panel/ | 2 | 0 | 2 | 0% |
| layouts/ | 1 | 1 | 0 | 100% |
| HOC/ | 1 | 0 | 1 | 0% |
| **TOTAL** | **44** | **10** | **34** | **23%** |

---

## 6. Discrepancias en Índices y Conteos

| Documento | Valor Documentado | Valor Real | Discrepancia |
|-----------|-------------------|------------|--------------|
| _MAP.md (US count) | 15 | 21 | +6 US no listadas |
| ARQUITECTURA.md (páginas) | 12 | 18 | +6 páginas no documentadas |
| FRONTEND_INVENTORY (hooks) | 23 | 23 | ✅ Correcto |
| FRONTEND_INVENTORY (páginas) | 18 | 18 | ✅ Correcto |
| BACKEND endpoints | ~120 | 128 | +8 no contados |

---

## 7. Conclusiones de la Auditoría

### 7.1 Brechas Críticas

1. **US-PM-006 y US-PM-007** - Funcionalidades documentadas pero NO implementadas
2. ~~**manualReviewApi.ts** - 11 endpoints backend sin servicio frontend~~ ✅ RESUELTO
3. **9 páginas** implementadas sin User Story correspondiente
4. **34 componentes** sin documentación formal

### 7.2 Documentación Desactualizada

1. **_MAP.md** - Conteos incorrectos
2. **ARQUITECTURA-TEACHER-PORTAL.md** - Solo 12 de 18 páginas
3. **US-PM-001b a US-PM-005c** - Marcadas como "Backlog" pero implementadas

### 7.3 Acciones Requeridas

| Prioridad | Acción | Impacto |
|-----------|--------|---------|
| ~~P0~~ | ~~Crear manualReviewApi.ts~~ | ~~API sin cliente~~ ✅ HECHO |
| P0 | Actualizar estado de US implementadas | Documentación incorrecta |
| P1 | Crear documentación para 6 páginas sin US | Trazabilidad |
| P1 | Actualizar _MAP.md y ARQUITECTURA.md | Índices incorrectos |
| P2 | Documentar 34 componentes faltantes | Completitud |
| P2 | Documentar 23 hooks | Referencia técnica |

---

**Generado:** 2026-01-25
**Sistema:** SIMCO v4.3.0 + CAPVED
**Fase:** FASE-1 Auditoría de Coherencia
