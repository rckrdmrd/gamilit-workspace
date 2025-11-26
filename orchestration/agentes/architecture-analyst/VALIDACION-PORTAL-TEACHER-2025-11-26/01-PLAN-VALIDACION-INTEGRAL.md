# PLAN DE VALIDACIÓN INTEGRAL - PORTAL TEACHER

**Fecha:** 2025-11-26
**Analista:** Architecture-Analyst
**Objetivo:** Garantizar funcionamiento completo DB → API → Frontend

---

## 📋 METODOLOGÍA DE VALIDACIÓN

```
┌─────────────────────────────────────────────────────────────────┐
│  FLUJO DE VALIDACIÓN POR PÁGINA                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. DATABASE (DDL/SQL)                                          │
│     ├─ Verificar tablas existen                                 │
│     ├─ Verificar columnas y tipos                               │
│     ├─ Verificar RLS policies                                   │
│     └─ Verificar datos de prueba (seeds)                        │
│              │                                                  │
│              ▼                                                  │
│  2. BACKEND (Types/DTOs)                                        │
│     ├─ Verificar coherencia Types vs DB                         │
│     ├─ Verificar endpoints existen                              │
│     ├─ Ejecutar curl para validar respuestas                    │
│     └─ Verificar formato de respuesta                           │
│              │                                                  │
│              ▼                                                  │
│  3. FRONTEND (Hooks/Integration)                                │
│     ├─ Verificar hooks definidos correctamente                  │
│     ├─ Verificar NO hay datos mock/hardcoded                    │
│     ├─ Verificar llamadas a API correctas                       │
│     └─ Verificar manejo de estados (loading, error)             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📊 MATRIZ DE VALIDACIÓN POR PÁGINA

### PÁGINA 1: TeacherDashboardPage

| Capa | Objeto | Validación |
|------|--------|------------|
| **DB** | social_features.classrooms | Tabla existe, columnas correctas |
| **DB** | social_features.teacher_classrooms | Relación teacher-classroom |
| **DB** | social_features.classroom_members | Estudiantes en aulas |
| **DB** | progress_tracking.module_progress | Progreso de estudiantes |
| **DB** | gamification_system.user_stats | Stats de gamificación |
| **API** | GET /teacher/dashboard | Endpoint funciona |
| **API** | GET /teacher/dashboard/stats | Stats del teacher |
| **API** | GET /teacher/classrooms | Lista de aulas |
| **Frontend** | useTeacherDashboard | Hook definido, no mocks |
| **Frontend** | useClassrooms | Hook definido, no mocks |
| **Frontend** | useUserGamification | Hook definido, no mocks |

---

### PÁGINA 2: TeacherClassesPage

| Capa | Objeto | Validación |
|------|--------|------------|
| **DB** | social_features.classrooms | CRUD completo |
| **DB** | social_features.teacher_classrooms | Relación |
| **DB** | social_features.schools | FK a escuela |
| **API** | GET /teacher/classrooms | Lista aulas |
| **API** | POST /teacher/classrooms | Crear aula |
| **API** | PUT /teacher/classrooms/:id | Actualizar aula |
| **API** | DELETE /teacher/classrooms/:id | Eliminar aula |
| **Frontend** | useClassrooms | CRUD operations |

---

### PÁGINA 3: TeacherStudentsPage

| Capa | Objeto | Validación |
|------|--------|------------|
| **DB** | social_features.classroom_members | Estudiantes |
| **DB** | auth_management.profiles | Datos estudiante |
| **DB** | gamification_system.user_stats | Stats estudiante |
| **DB** | progress_tracking.module_progress | Progreso |
| **API** | GET /teacher/classrooms/:id/students | Lista estudiantes |
| **API** | GET /teacher/students/:id | Detalle estudiante |
| **API** | GET /teacher/students/:id/progress | Progreso estudiante |
| **Frontend** | useClassrooms | getClassroomStudents |
| **Frontend** | useStudentMonitoring | Datos de estudiantes |

---

### PÁGINA 4: TeacherMonitoringPage

| Capa | Objeto | Validación |
|------|--------|------------|
| **DB** | social_features.classroom_members | Estudiantes activos |
| **DB** | progress_tracking.exercise_attempts | Actividad reciente |
| **DB** | gamification_system.user_stats | last_activity_at |
| **API** | GET /teacher/classrooms/:id/students | Estudiantes |
| **API** | GET /teacher/monitoring/activity | Actividad tiempo real |
| **Frontend** | useStudentMonitoring | Hook con auto-refresh |
| **Frontend** | useClassrooms | Selector de aula |

---

### PÁGINA 5: TeacherAssignmentsPage

| Capa | Objeto | Validación |
|------|--------|------------|
| **DB** | educational_content.assignments | Tabla asignaciones |
| **DB** | progress_tracking.exercise_submissions | Entregas |
| **API** | GET /teacher/assignments | Lista asignaciones |
| **API** | POST /teacher/assignments | Crear asignación |
| **API** | GET /teacher/assignments/:id/submissions | Entregas |
| **API** | POST /teacher/submissions/:id/grade | Calificar |
| **Frontend** | useAssignments | CRUD + submissions |
| **Frontend** | useGrading | Calificación |

---

### PÁGINA 6: TeacherExerciseResponsesPage 🆕

| Capa | Objeto | Validación |
|------|--------|------------|
| **DB** | progress_tracking.exercise_attempts | Intentos de ejercicios |
| **DB** | progress_tracking.exercise_submissions | Envíos |
| **DB** | educational_content.exercises | Info ejercicio |
| **DB** | auth_management.profiles | Info estudiante |
| **API** | GET /teacher/attempts | Lista de intentos |
| **API** | GET /teacher/attempts/:id | Detalle de intento |
| **API** | GET /teacher/exercises/:id/responses | Respuestas por ejercicio |
| **Frontend** | useExerciseResponses | Hook principal |

---

### PÁGINA 7: TeacherProgressPage

| Capa | Objeto | Validación |
|------|--------|------------|
| **DB** | progress_tracking.module_progress | Progreso por módulo |
| **DB** | social_features.classroom_members | Estudiantes |
| **DB** | educational_content.modules | Info módulos |
| **API** | GET /teacher/classrooms/:id/progress | Progreso aula |
| **API** | GET /teacher/students/:id/progress | Progreso estudiante |
| **Frontend** | useClassrooms | Selector aula |
| **Frontend** | useAnalytics | Datos de progreso |

---

### PÁGINA 8: TeacherAlertsPage

| Capa | Objeto | Validación |
|------|--------|------------|
| **DB** | progress_tracking.student_intervention_alerts | Alertas |
| **DB** | social_features.classrooms | Filtro por aula |
| **API** | GET /teacher/alerts | Lista alertas |
| **API** | PATCH /teacher/alerts/:id/acknowledge | Reconocer |
| **API** | PATCH /teacher/alerts/:id/resolve | Resolver |
| **API** | PATCH /teacher/alerts/:id/dismiss | Descartar |
| **Frontend** | useInterventionAlerts | Hook completo |

---

### PÁGINA 9: TeacherAnalyticsPage

| Capa | Objeto | Validación |
|------|--------|------------|
| **DB** | progress_tracking.module_progress | Datos de progreso |
| **DB** | progress_tracking.exercise_attempts | Intentos |
| **DB** | gamification_system.user_stats | Stats |
| **API** | GET /teacher/analytics | Dashboard analytics |
| **API** | GET /teacher/analytics/performance | Performance |
| **API** | GET /teacher/analytics/engagement | Engagement |
| **Frontend** | useAnalytics | Hook con caching |

---

### PÁGINA 10: TeacherReportsPage

| Capa | Objeto | Validación |
|------|--------|------------|
| **DB** | (Usa datos de otras tablas) | Agregaciones |
| **API** | GET /teacher/reports | Lista reportes |
| **API** | POST /teacher/reports/generate | Generar reporte |
| **API** | GET /teacher/reports/:id/download | Descargar |
| **Frontend** | useReports | Hook de reportes |

---

### PÁGINA 11: TeacherGamificationPage

| Capa | Objeto | Validación |
|------|--------|------------|
| **DB** | gamification_system.user_stats | Stats estudiantes |
| **DB** | gamification_system.user_ranks | Rangos |
| **DB** | gamification_system.achievements | Logros |
| **DB** | gamification_system.user_achievements | Logros desbloqueados |
| **API** | GET /teacher/gamification | Dashboard gamificación |
| **API** | GET /teacher/gamification/leaderboard | Leaderboard |
| **API** | POST /teacher/students/:id/bonus | Otorgar bonus |
| **Frontend** | useGamification | Stats |
| **Frontend** | useGrantBonus | Bonus ML Coins |

---

## 🔄 PLAN DE EJECUCIÓN

### GRUPO 1: Validación Base de Datos (5 agentes paralelo)

| Agente | Páginas | Tablas a Validar |
|--------|---------|------------------|
| DB-Agent-1 | Dashboard, Classes | classrooms, teacher_classrooms |
| DB-Agent-2 | Students, Monitoring | classroom_members, profiles |
| DB-Agent-3 | Assignments, Responses | assignments, exercise_attempts, submissions |
| DB-Agent-4 | Progress, Alerts | module_progress, student_intervention_alerts |
| DB-Agent-5 | Analytics, Gamification | user_stats, user_ranks, achievements |

### GRUPO 2: Validación Backend APIs (5 agentes paralelo)

| Agente | Endpoints a Validar |
|--------|---------------------|
| BE-Agent-1 | /teacher/dashboard, /teacher/classrooms |
| BE-Agent-2 | /teacher/students, /teacher/monitoring |
| BE-Agent-3 | /teacher/assignments, /teacher/attempts |
| BE-Agent-4 | /teacher/progress, /teacher/alerts |
| BE-Agent-5 | /teacher/analytics, /teacher/gamification |

### GRUPO 3: Validación Frontend Integration (5 agentes paralelo)

| Agente | Hooks/Páginas a Validar |
|--------|-------------------------|
| FE-Agent-1 | useTeacherDashboard, useClassrooms |
| FE-Agent-2 | useStudentMonitoring, useClassroomData |
| FE-Agent-3 | useAssignments, useExerciseResponses |
| FE-Agent-4 | useAnalytics, useInterventionAlerts |
| FE-Agent-5 | useGamification, useGrantBonus |

---

## ✅ CRITERIOS DE ÉXITO

### Base de Datos
- ✅ Todas las tablas existen y tienen estructura correcta
- ✅ RLS policies definidas para teacher
- ✅ Datos de prueba disponibles

### Backend APIs
- ✅ Todos los endpoints responden (200/201)
- ✅ Formato de respuesta coincide con DTOs
- ✅ Autenticación funciona correctamente

### Frontend
- ✅ Hooks definidos y exportados
- ✅ NO hay datos mock/hardcoded
- ✅ Llamadas a API correctas
- ✅ Manejo de loading/error states

---

## 📅 SECUENCIA DE EJECUCIÓN

```
GRUPO 1: DB Validation (paralelo)
    │
    ├─► Validación por Architecture-Analyst
    │
    ▼
GRUPO 2: API Validation (paralelo)
    │
    ├─► Validación por Architecture-Analyst
    │
    ▼
GRUPO 3: Frontend Validation (paralelo)
    │
    ├─► Validación por Architecture-Analyst
    │
    ▼
REPORTE FINAL DE VALIDACIÓN
```

---

**Estado:** Plan Completo
**Siguiente Paso:** FASE 2 - Orquestación de Agentes
