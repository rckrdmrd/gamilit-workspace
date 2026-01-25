# 01-CONTEXTO.md - Análisis Portal Teacher GAMILIT

**Tarea:** TASK-2026-01-25-ANALISIS-PORTAL-TEACHER
**Fecha:** 2026-01-25
**Sistema:** SIMCO v4.3.0 + CAPVED

---

## 1. Objetivo

Realizar un análisis detallado y planificación completa de la documentación y definiciones de todas las páginas del portal Teacher del frontend de GAMILIT, identificando gaps, purgando documentación obsoleta e integrando definiciones faltantes.

---

## 2. Estado Actual del Portal Teacher

### 2.1 Métricas de Implementación

| Componente | Cantidad | Documentado | Gap |
|------------|----------|-------------|-----|
| Páginas | 18 | 12 | 6 páginas sin doc |
| Componentes | 51 | ~20 | ~31 sin doc formal |
| Hooks | 23 | 0 | 23 sin doc formal |
| API Services (FE) | 14 | Parcial | manualReviewApi.ts faltante |
| Controladores (BE) | 9 | Parcial | Endpoints documentados en Swagger |
| Endpoints | 120+ | Swagger | Sin doc de contratos |

### 2.2 User Stories

| ID | Título | Estado Doc | Estado Impl | Gap |
|----|--------|-----------|-------------|-----|
| US-PM-000 | Dashboard Maestro | Done | 100% | Ninguno |
| US-PM-001a | CRUD Classrooms | Done | 100% | Ninguno |
| US-PM-001b | Inscripción Estudiantes | Done | 100% | Ninguno |
| US-PM-002a | CRUD Assignments | Done | 100% | Ninguno |
| US-PM-002b | Distribución Assignments | Done | 100% | Ninguno |
| US-PM-002c | Vista Submissions | Done | 100% | Ninguno |
| US-PM-003a | Cola Calificaciones | Done | 100% | Ninguno |
| US-PM-003b | Interfaz Calificación | Done | 100% | Ninguno |
| US-PM-004a | Progress Analytics | Done | 100% | Ninguno |
| US-PM-004b | Teacher Notes | Done | 100% | Ninguno |
| US-PM-005a | Classroom Analytics | Done | 100% | Ninguno |
| US-PM-005b | Report Generation | Done | 100% | Ninguno |
| US-PM-005c | Engagement Metrics | Done | 100% | Ninguno |
| **US-PM-006** | Bloquear Alumnos | Backlog | **0%** | **CRÍTICO** |
| **US-PM-007** | Alert Configuration | Backlog | **0%** | **CRÍTICO** |
| US-PM-008 | Gamification Mgmt | Done | 100% | Ninguno |
| **US-PM-009** | Resources Mgmt | Done | **60%** | Página faltante |
| US-PM-010 | Communication Center | Done | 100% | Ninguno |
| US-PM-011 | Teacher Settings | Done | 100% | Ninguno |
| US-PM-012 | Notifications Center | Done | 100% | Ninguno |
| US-PM-013 | Notification Prefs | Done | 100% | Ninguno |

### 2.3 Páginas Implementadas (18)

```
apps/frontend/src/apps/teacher/pages/
├── TeacherDashboard.tsx          + wrapped (HOC)
├── TeacherAnalytics.tsx          + wrapped (HOC)
├── TeacherAssignments.tsx        + wrapped (HOC)
├── TeacherClasses.tsx            + wrapped (HOC)
├── TeacherGamification.tsx       + wrapped (HOC)
├── TeacherStudents.tsx           + wrapped (HOC)
├── TeacherAlertsPage.tsx         ← Page wrapper
├── TeacherCommunicationPage.tsx  ← Page wrapper
├── TeacherContentPage.tsx        ← Page wrapper
├── TeacherMonitoringPage.tsx     ← Page wrapper
├── TeacherProgressPage.tsx       ← Page wrapper
├── TeacherReportsPage.tsx        ← Page wrapper
├── TeacherExerciseResponsesPage.tsx ← Page wrapper
├── TeacherSettingsPage.tsx       ← Page wrapper
├── TeacherNotificationsPage.tsx  ← Page wrapper
├── TeacherNotificationPreferencesPage.tsx ← Page wrapper
├── TeacherReviewPanelPage.tsx    ← Page wrapper
└── TeacherContentManagement.tsx  ← Legacy/standalone
```

### 2.4 Hooks Implementados (23)

**Dashboard & Classroom (5):**
1. useTeacherDashboard
2. useClassrooms
3. useClassroomsStats
4. useClassroomData
5. useClassroomRealtime

**Student Monitoring (3):**
6. useStudentProgress
7. useStudentMonitoring
8. useMasteryTracking

**Assignments (3):**
9. useAssignments
10. useExerciseResponses
11. useGrading

**Analytics (3):**
12. useAnalytics
13. useStudentInsights
14. useMissionStats

**Gamification (4):**
15. useGrantBonus
16. useEconomyAnalytics
17. useStudentsEconomy
18. useAchievementsStats

**Communication (3):**
19. useTeacherMessages
20. useInterventionAlerts
21. useTeacherContent

**Manual Review (2):**
22. useManualReviews
23. useManualReviewConfig

---

## 3. Gaps Identificados

### 3.1 Gaps Críticos de Implementación

#### GAP-IMPL-001: US-PM-006 - Bloquear/Desbloquear Alumnos
**Severidad:** ALTA
**Story Points:** 8 SP

**Componentes Faltantes:**
- **Backend:**
  - Endpoint `PATCH /teacher/students/:id/status`
  - DTO `UpdateStudentStatusDto`
  - Service method `updateStudentStatus()`
- **Frontend:**
  - Hook `useStudentStatus()`
  - Componente `SuspendStudentModal.tsx`
  - Componente `StudentActionsMenu.tsx`
- **Base de Datos:**
  - Columnas en `profiles`: `status_changed_at`, `status_changed_by`, `status_reason`

#### GAP-IMPL-002: US-PM-007 - Configuración de Alertas
**Severidad:** ALTA
**Story Points:** 5 SP

**Componentes Faltantes:**
- **Base de Datos:**
  - Tabla `teacher_alert_configurations`
- **Backend:**
  - Service `AlertConfigService`
  - Controller endpoints `/classrooms/:id/alert-config`
- **Frontend:**
  - Página `TeacherAlertConfigPage.tsx`
  - Componentes: `AlertConfigCard`, `ThresholdSlider`
  - Ruta `/teacher/classrooms/:id/alert-config`

#### GAP-IMPL-003: US-PM-009 - Página de Recursos Faltante
**Severidad:** MEDIA
**Story Points:** 2 SP (solo página)

**Estado:** Existe `ResourceSharingPanel.tsx` como componente pero no como página independiente.
**Acción:** Crear `TeacherResourcesPage.tsx` o confirmar que la funcionalidad se integra en `TeacherContentPage`.

### 3.2 Gaps de Documentación

| Gap ID | Descripción | Ubicación | Acción |
|--------|-------------|-----------|--------|
| GAP-DOC-001 | _MAP.md indica 15 US, hay 14 archivos | EXT-001/_MAP.md | Actualizar conteo |
| GAP-DOC-002 | Arquitectura documenta 12 páginas, hay 18 | ARQUITECTURA-TEACHER-PORTAL.md | Actualizar a v2.0 |
| GAP-DOC-003 | 6 páginas sin documentación formal | paginas/ | Crear documentos |
| GAP-DOC-004 | 23 hooks sin documentación | hooks/ | Crear documentos |
| GAP-DOC-005 | ~31 componentes sin doc formal | componentes/ | Crear definiciones |

### 3.3 Gaps de API

| Gap ID | Descripción | Acción |
|--------|-------------|--------|
| GAP-API-001 | manualReviewApi.ts faltante | Crear servicio cliente |
| GAP-API-002 | Contratos API sin documentar | Crear API-CONTRACTS.md |

---

## 4. Documentación Existente a Revisar

### 4.1 Documentación Activa
```
docs/03-fase-extensiones/EXT-001-portal-maestros/
├── _MAP.md                                    ← Actualizar
├── README.md                                  ← Revisar
├── ARQUITECTURA-TEACHER-PORTAL.md             ← Actualizar a v2.0
├── historias-usuario/
│   ├── US-PM-000 a US-PM-013 (14 archivos)   ← Validar estado
├── especificaciones/
│   ├── AT-RISK-LOGIC-STANDARD.md             ← Mantener
│   ├── DASHBOARD-REPORTS-INTEGRATION.md       ← Mantener
│   ├── PERFORMANCE-TREND-SPEC.md              ← Mantener
│   └── USER-ACTIVITY-TRACKING-DEPENDENCY.md   ← Mantener
├── requerimientos/
│   └── RF-TEACH-002-assignment-system.md      ← Mantener
├── paginas/
│   └── RESPONSES-M3-M5.md                     ← Revisar
└── tareas/
    └── _MAP.md                                ← Revisar
```

### 4.2 Documentación a Crear
```
docs/03-fase-extensiones/EXT-001-portal-maestros/
├── especificaciones/
│   └── API-CONTRACTS.md                       ← NUEVO
├── paginas/
│   ├── PAGE-DASHBOARD.md                      ← NUEVO
│   ├── PAGE-CLASSES.md                        ← NUEVO
│   ├── PAGE-STUDENTS.md                       ← NUEVO
│   ├── PAGE-ASSIGNMENTS.md                    ← NUEVO
│   ├── PAGE-ANALYTICS.md                      ← NUEVO
│   ├── PAGE-ALERTS.md                         ← NUEVO
│   ├── PAGE-MONITORING.md                     ← NUEVO
│   ├── PAGE-PROGRESS.md                       ← NUEVO
│   ├── PAGE-REPORTS.md                        ← NUEVO
│   ├── PAGE-GAMIFICATION.md                   ← NUEVO
│   ├── PAGE-COMMUNICATION.md                  ← NUEVO
│   ├── PAGE-CONTENT.md                        ← NUEVO
│   ├── PAGE-SETTINGS.md                       ← NUEVO
│   ├── PAGE-NOTIFICATIONS.md                  ← NUEVO
│   ├── PAGE-NOTIFICATION-PREFS.md             ← NUEVO
│   ├── PAGE-REVIEW-PANEL.md                   ← NUEVO
│   ├── PAGE-RESPONSES.md                      ← NUEVO (expandir RESPONSES-M3-M5)
│   └── PAGE-CONTENT-MANAGEMENT.md             ← NUEVO
├── hooks/
│   └── HOOKS-REFERENCE.md                     ← NUEVO
└── componentes/
    └── COMPONENTS-CATALOG.md                  ← NUEVO
```

---

## 5. Metodología de Análisis

### 5.1 Principio CAPVED por Subtarea

Cada subtarea debe cumplir:

| Fase | Descripción | Entregable |
|------|-------------|------------|
| **C**ontexto | Identificar fuentes, estado actual | Sección de contexto |
| **A**nálisis | Comparar, identificar gaps | Lista de gaps |
| **P**lanificación | Definir acciones y dependencias | Plan de acción |
| **V**alidación | Criterios de aceptación | Checklist |
| **E**jecución | Implementar/documentar | Archivos creados |
| **D**ocumentación | Registrar cambios | Actualizar índices |

### 5.2 Orden de Ejecución

```
FASE-1 (Auditoría)
    ↓
    ├──→ FASE-2 (Páginas)     ──┐
    ├──→ FASE-3 (APIs)        ──┤
    ├──→ FASE-5 (Purga)       ──┼──→ FASE-8 (Inventarios)
    ├──→ FASE-6 (Componentes) ──┤           ↓
    └──→ FASE-7 (Hooks)       ──┘           │
                                            ↓
    ←─────────────────── FASE-4 (US Faltantes)
                                            ↓
                               FASE-9 (Plan Final)
```

---

## 6. Agentes Recomendados por Fase

| Fase | Agente Principal | Alternativo | Notas |
|------|------------------|-------------|-------|
| FASE-1 | Claude Code | Gemini CLI | Requiere análisis global |
| FASE-2 | Windsurf/Trae | Claude Code | Documentación paralela |
| FASE-3 | Windsurf/Trae | Claude Code | Documentación paralela |
| FASE-4 | Claude Code | Gemini CLI | Planificación de implementación |
| FASE-5 | Trae | Windsurf | Purga mecánica |
| FASE-6 | Windsurf/Trae | Claude Code | Documentación paralela |
| FASE-7 | Windsurf/Trae | Claude Code | Documentación paralela |
| FASE-8 | Trae | Claude Code | Actualización de YAML |
| FASE-9 | Claude Code | Gemini CLI | Consolidación final |

---

## 7. Criterios de Éxito

- [ ] 100% de páginas documentadas (18/18)
- [ ] 100% de hooks documentados (23/23)
- [ ] 100% de componentes principales catalogados
- [ ] APIs y contratos documentados
- [ ] Inventarios sincronizados
- [ ] User Stories pendientes planificadas con subtareas atómicas
- [ ] Documentación obsoleta identificada y purgada
- [ ] _MAP.md y ARQUITECTURA actualizada
- [ ] Plan de ejecución ordenado generado

---

**Generado:** 2026-01-25
**Sistema:** SIMCO v4.3.0 + CAPVED
**Agente:** Claude Code (Arquitecto/Orquestador)
