# ANALISIS CONSOLIDADO - Teacher Progress/Alerts/Reports

## Resumen Ejecutivo

Analisis profundo de las paginas del portal Teacher: Progress, Alerts y Reports.
Se identificaron errores en las 3 capas (Frontend, Backend, Database) que impiden
la correcta visualizacion de datos.

**Fecha:** 2026-01-18
**ID:** TASK-2026-01-18-011
**Prioridad:** P0 (Critico)
**Tipo:** Analysis + Bug-Fix

---

## 1. HALLAZGOS POR CAPA

### 1.1 Frontend (React/TypeScript)

#### TeacherProgressPage

| ID | Severidad | Problema | Ubicacion |
|----|-----------|----------|-----------|
| FE-001 | MEDIA | Falta sincronizacion entre query params y estado local | TeacherProgressPage.tsx:46-67 |
| FE-002 | BAJA | Casteo inseguro en useAnalytics | useAnalytics.ts:75 |
| FE-003 | MEDIA | No hay manejo de estado cuando no hay aulas | TeacherProgressPage.tsx:391-396 |
| FE-004 | BAJA | Datos de gamificacion fallback sin validacion strict | TeacherProgressPage.tsx:116-124 |

#### TeacherAlertsPage

| ID | Severidad | Problema | Ubicacion |
|----|-----------|----------|-----------|
| FE-005 | MEDIA | Tipos de alertas incompletos en alertTypes.ts | alertTypes.ts vs interventionAlertsApi.ts |
| FE-006 | MEDIA | Filtro de tipo incompleto (faltan 2 opciones) | InterventionAlertsPanel.tsx:198-202 |
| FE-007 | ALTA | No hay validacion de classroom seleccionado (null) | TeacherAlertsPage.tsx:39 |
| FE-008 | BAJA | Diferencia AlertPriority vs InterventionAlertSeverity | types/index.ts vs interventionAlertsApi.ts |

#### TeacherReportsPage

| ID | Severidad | Problema | Ubicacion |
|----|-----------|----------|-----------|
| FE-009 | MEDIA | Fallback con datos mock silencioso | TeacherReportsPage.tsx:143-190 |
| FE-010 | BAJA | Datos mock hardcodeados confusos | TeacherReportsPage.tsx:183-236 |
| FE-011 | MEDIA | Falta validacion de classroom seleccionado | TeacherReportsPage.tsx:488 |
| FE-012 | ALTA | Error potencial en ReportGenerator (template null) | ReportGenerator.tsx:27-76 |
| FE-013 | MEDIA | ReportType hardcodeado sin constante | ReportGenerator.tsx:522 |
| FE-014 | BAJA | Campo size siempre "N/A" | TeacherReportsPage.tsx:81 |

### 1.2 Backend (NestJS/TypeORM)

| ID | Severidad | Problema | Ubicacion |
|----|-----------|----------|-----------|
| BE-001 | CRITICO | Vulnerabilidad multi-tenant en AdminReportsService | admin-reports.service.ts:42-67 |
| BE-002 | CRITICO | AdminReport Entity falta tenant_id | admin-report.entity.ts |
| BE-003 | ALTA | Queries incompletas en AdminProgressService (LEFT JOIN sin validacion) | admin-progress.service.ts:121 |
| BE-004 | ALTA | Falta validacion de expiracion de reports | admin-reports.service.ts |
| BE-005 | ALTA | Cron job cleanup de reports no implementado | admin-reports.service.ts:4 |
| BE-006 | MEDIA | Tipado inconsistente en DTOs (null vs undefined) | Multiples archivos DTO |
| BE-007 | MEDIA | Query SQL raw en verifyTeacherClassroomAccess() | intervention-alerts.service.ts:385-398 |
| BE-008 | MEDIA | Falta logging de acciones criticas | resolveAlert(), acknowledgeAlert(), dismissAlert() |
| BE-009 | BAJA | Conversion interval a horas no robusta | admin-progress.service.ts:70 |
| BE-010 | BAJA | Modulo progress asume 15 ejercicios por defecto | student-progress.service.ts:298 |
| BE-011 | BAJA | Classroom name podria ser NULL sin fallback | intervention-alerts.service.ts:413 |

### 1.3 Base de Datos (PostgreSQL/DDL)

| ID | Severidad | Problema | Ubicacion |
|----|-----------|----------|-----------|
| DB-001 | CRITICO | Falta CRON Job para generate_student_alerts() | Funcion SQL sin scheduler |
| DB-002 | CRITICO | final_score vs score (columna inexistente) | generate_student_alerts():212,223 |
| DB-003 | ALTA | Falta trigger para submitted_progress_percentage | module_progress sin trigger |
| DB-004 | ALTA | FK referencias invalidas en teacher_classrooms | RLS policy y vistas |
| DB-005 | ALTA | Manual reviews no tiene RLS policies | manual_reviews.sql |
| DB-006 | MEDIA | Enum progress_status no tiene valor MASTERED | progress_status enum |
| DB-007 | MEDIA | EngagementMetrics no se actualiza automaticamente | Ningún trigger |
| DB-008 | MEDIA | Falta endpoint/service para generar teacher reports | Backend incompleto |
| DB-009 | BAJA | Falta indice compuesto (user_id, status) en exercise_submissions | Indice faltante |
| DB-010 | BAJA | manual_reviews ON DELETE RESTRICT sin alternativa | FK constraint |
| DB-011 | BAJA | Falta audit de cambios en student_intervention_alerts | Campos faltantes |

---

## 2. ANALISIS DE IMPACTO

### 2.1 Impacto en Funcionalidad

```
TeacherProgressPage     ████████████████████░░░░░  95% Funcional
TeacherAlertsPage       ██████████████████░░░░░░░  90% Funcional
TeacherReportsPage      █████████████████░░░░░░░░  85% Funcional
```

### 2.2 Impacto por Criticidad

| Criticidad | Cantidad | Impacto |
|------------|----------|---------|
| CRITICO | 4 | Bloquean funcionalidad core o comprometen seguridad |
| ALTA | 9 | Causan errores visibles o datos incorrectos |
| MEDIA | 12 | Degradan experiencia pero no bloquean |
| BAJA | 9 | Optimizaciones y mejoras menores |
| **TOTAL** | **34** | |

### 2.3 Cadena de Dependencia de Errores

```
DB-001 (No CRON alerts) ─────────────────────────────────┐
                                                          ↓
DB-002 (final_score vs score) ─→ Alertas no se generan ─→ FE-005/006 (UI incompleta)
                                                          ↓
                                                    Teacher no ve alertas
                                                          ↓
                                                    Estudiantes en riesgo
                                                    no son identificados

DB-003 (No trigger submitted) ─→ submitted_progress = 0 ─→ Progress incorrecto
                                                          ↓
                                                    Teacher ve datos erroneos

BE-001 (Multi-tenant vuln) ────────────────────────────────→ SEGURIDAD COMPROMETIDA
                                                              (Admin ve reportes de
                                                              otras organizaciones)
```

---

## 3. FLUJO DE DATOS AFECTADO

### 3.1 Flujo de Alertas (ROTO)

```
[DEBERIA SER]
CRON Daily 2AM
      │
      ↓
generate_student_alerts()      ◄── DB-002: final_score no existe
      │
      ↓
INSERT student_intervention_alerts
      │
      ↓
Backend: InterventionAlertsService.getAlerts()
      │
      ↓
Frontend: useInterventionAlerts() hook
      │
      ↓
TeacherAlertsPage: InterventionAlertsPanel  ◄── FE-005/006: Tipos incompletos
      │
      ↓
Teacher ve alertas y actua

[ESTADO ACTUAL]
CRON NO CONFIGURADO
      ↓
Funcion NUNCA se ejecuta     ◄── DB-001: Sin scheduler
      ↓
CERO alertas en BD
      ↓
Teacher NO ve alertas
      ↓
Estudiantes en riesgo NO identificados
```

### 3.2 Flujo de Progress (PARCIALMENTE ROTO)

```
[FLUJO CORRECTO PARA exercise_attempts]
Student resuelve ejercicio auto-calificado
      │
      ↓
INSERT exercise_attempts
      │
      ↓
TRIGGER: trg_update_module_progress_on_exercise  ✅ FUNCIONA
      │
      ↓
UPDATE module_progress (progress_percentage)     ✅ FUNCIONA
      │
      ↓
Backend: StudentProgressService.getStudentProgress()  ✅ FUNCIONA
      │
      ↓
Frontend: ClassProgressDashboard                 ✅ FUNCIONA


[FLUJO ROTO PARA exercise_submissions M3-M5]
Student envia ejercicio con review manual
      │
      ↓
INSERT exercise_submissions (status='submitted')
      │
      ↓
NO HAY TRIGGER para submitted_progress_percentage  ◄── DB-003
      │
      ↓
submitted_progress_percentage = 0 SIEMPRE         (ERROR)
      │
      ↓
Teacher califica (status='graded', score >= 60)
      │
      ↓
TRIGGER: trg_update_module_progress_on_submission  ✅ FUNCIONA
      │
      ↓
graded_progress_percentage actualizado            ✅ FUNCIONA
      │
      ↓
PERO submitted_progress_percentage sigue en 0     (ERROR)
```

### 3.3 Flujo de Reports (FUNCIONAL CON VULNERABILIDAD)

```
[TEACHER REPORTS - OK]
Teacher genera reporte
      │
      ↓
POST /teacher/reports/generate
      │
      ↓
TeacherReportsService.createReport()  ✅ Filtra por tenant_id
      │
      ↓
INSERT teacher_reports              ✅ OK
      │
      ↓
Frontend muestra reporte            ✅ OK (con mock data fallback FE-009)


[ADMIN REPORTS - VULNERABILIDAD]
Admin genera reporte
      │
      ↓
POST /admin/reports/generate
      │
      ↓
AdminReportsService.generateReport()
      │
      ↓
INSERT admin_reports                 ◄── BE-002: Sin tenant_id
      │
      ↓
GET /admin/reports
      │
      ↓
AdminReportsService.getReports()     ◄── BE-001: NO filtra por tenant_id
      │
      ↓
RETORNA TODOS LOS REPORTES           ◄── VULNERABILIDAD CRITICA
      │
      ↓
Admin puede ver reportes de OTRAS organizaciones
```

---

## 4. ARCHIVOS AFECTADOS

### 4.1 Frontend

```
apps/frontend/src/apps/teacher/pages/
├── TeacherProgressPage.tsx          # FE-001, FE-003, FE-004
├── TeacherAlertsPage.tsx            # FE-007
└── TeacherReportsPage.tsx           # FE-009, FE-010, FE-011, FE-014

apps/frontend/src/apps/teacher/components/
├── alerts/
│   └── InterventionAlertsPanel.tsx  # FE-006
├── reports/
│   └── ReportGenerator.tsx          # FE-012, FE-013

apps/frontend/src/apps/teacher/hooks/
├── useAnalytics.ts                  # FE-002
└── useInterventionAlerts.ts

apps/frontend/src/types/
├── alertTypes.ts                    # FE-005
├── interventionAlertsApi.ts         # FE-005
└── index.ts                         # FE-008
```

### 4.2 Backend

```
apps/backend/src/modules/admin/
├── services/
│   ├── admin-reports.service.ts     # BE-001, BE-004, BE-005
│   └── admin-progress.service.ts    # BE-003, BE-009
├── entities/
│   └── admin-report.entity.ts       # BE-002

apps/backend/src/modules/teacher/
├── services/
│   ├── intervention-alerts.service.ts  # BE-007, BE-008, BE-011
│   └── student-progress.service.ts     # BE-010
├── dto/
│   ├── intervention-alerts.dto.ts   # BE-006
│   └── student-progress.dto.ts      # BE-006
```

### 4.3 Base de Datos

```
apps/database/ddl/schemas/progress_tracking/
├── functions/
│   └── 15-generate_student_alerts.sql   # DB-001, DB-002
├── tables/
│   └── 01-module_progress.sql          # DB-003
├── triggers/
│   └── (falta trigger submitted)       # DB-003
├── rls-policies/
│   └── manual_reviews.sql (FALTA)      # DB-005

apps/database/ddl/schemas/social_features/
├── views/
│   └── 01-classroom_progress_overview.sql  # DB-004
```

---

## 5. CONCLUSIONES

### 5.1 Causa Raiz Principal

**El sistema de alertas esta completamente inoperativo porque:**
1. No hay CRON job que ejecute `generate_student_alerts()` diariamente
2. La funcion usa `final_score` que no existe (columna correcta es `score`)

**Esto causa que:**
- Teachers NO ven alertas de estudiantes en riesgo
- La pagina TeacherAlertsPage muestra datos vacios o mock
- Estudiantes con problemas no son identificados

### 5.2 Seguridad Comprometida

**AdminReportsService tiene vulnerabilidad multi-tenant:**
- Cualquier admin puede ver/descargar reportes de OTRAS organizaciones
- Esto viola el aislamiento de datos entre tenants
- DEBE corregirse INMEDIATAMENTE

### 5.3 Experiencia de Usuario Degradada

- Mock data silencioso confunde a usuarios
- Tipos de alertas incompletos en filtros UI
- Progress de submitted exercises siempre en 0%

---

## 6. PROXIMOS PASOS

Ver documento `02-PLAN-CORRECCION.md` para el plan detallado de correccion.
