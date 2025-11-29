# REPORTE DE ANÁLISIS: Portal Students → Impacto en Portal Teacher

**Fecha:** 2025-11-29
**Analista:** Architecture-Analyst
**Versión:** 1.0.0
**Tarea:** Análisis de requerimientos del portal Students que afectan al portal Teacher

---

## 📋 RESUMEN EJECUTIVO

Este documento identifica los **requerimientos y funcionalidades del Portal de Students** que impactan directamente al **Portal de Teacher**, con el objetivo de garantizar la coherencia y correcta sincronización de datos entre ambos portales.

### Hallazgos Principales

| Área | Estado Actual | Requerimientos Identificados |
|------|---------------|------------------------------|
| **Progreso de Estudiantes** | ⚠️ Parcial | 8 requerimientos |
| **Gamificación** | ⚠️ Parcial | 6 requerimientos |
| **Misiones** | ⚠️ Parcial | 4 requerimientos |
| **Ejercicios** | ✅ Funcional | 3 requerimientos de mejora |
| **Estadísticas** | ⚠️ Parcial | 5 requerimientos |
| **Alertas de Intervención** | ⚠️ Parcial | 4 requerimientos |

**Total:** 30 requerimientos identificados para sincronización Student↔Teacher

---

## 🎯 OBJETIVO DEL ANÁLISIS

**Pregunta principal:** ¿Qué información genera el portal de Students que el portal de Teacher necesita visualizar, monitorear o actuar sobre ella?

### Flujo de Datos Student → Teacher

```
┌─────────────────────────────────────────────────────────────────┐
│                      STUDENT PORTAL                             │
│  (Genera datos de progreso, gamificación, actividad)           │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        BACKEND                                  │
│  - Progress Module (ModuleProgress, ExerciseSubmission)        │
│  - Gamification Module (UserStats, Achievements, MLCoins)      │
│  - Social Module (Classrooms, Teams)                           │
│  - Assignments Module (Submissions)                            │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      TEACHER PORTAL                             │
│  (Consume, visualiza, califica, genera reportes)               │
└─────────────────────────────────────────────────────────────────┘
```

---

## 1️⃣ MÓDULOS DEL STUDENT PORTAL ANALIZADOS

### 1.1 Estructura del Portal Students

| Categoría | Cantidad | Descripción |
|-----------|----------|-------------|
| **Páginas** | 32 | Incluye Dashboard, Ejercicios, Logros, Leaderboard, Misiones, Perfil |
| **Componentes** | 30+ | Dashboard (14), Ejercicios (6), Gamificación (6), Logros (6), Notificaciones (3) |
| **Hooks** | 11 | useDashboardData, useExerciseState, useGamificationData, useUserModules, etc. |
| **Stores** | 9 | Auth, Economy, Achievements, Leaderboards, Friends, Guilds, PowerUps, Ranks, Missions |
| **APIs Consumidas** | 15+ | Educational, Gamification, Missions, Progress, Social, Notifications, Assignments |

### 1.2 Funcionalidades Principales del Student

| # | Funcionalidad | Datos Generados | Relevancia para Teacher |
|---|---------------|-----------------|------------------------|
| 1 | **Módulos y Educación** | ModuleProgress, completion_percentage | 🔴 CRÍTICA |
| 2 | **Sistema de Ejercicios** | ExerciseAttempt, ExerciseSubmission, score | 🔴 CRÍTICA |
| 3 | **Sistema de Gamificación Maya** | UserRank, XP, rank_progress | 🟡 ALTA |
| 4 | **Logros/Achievements** | UserAchievement, unlock_date | 🟡 ALTA |
| 5 | **Economía Virtual (ML Coins)** | MLCoinsTransaction, balance | 🟡 ALTA |
| 6 | **Sistema de Misiones** | MissionProgress, completion_status | 🟡 ALTA |
| 7 | **Leaderboards** | Position, score ranking | 🟢 MEDIA |
| 8 | **Sistema Social** | Friendships, Teams, Challenges | 🟢 MEDIA |
| 9 | **Progreso y Analytics** | LearningSession, time_spent, streak | 🔴 CRÍTICA |
| 10 | **Asignaciones Escolares** | AssignmentSubmission, grade | 🔴 CRÍTICA |

---

## 2️⃣ REQUERIMIENTOS IDENTIFICADOS PARA EL PORTAL TEACHER

### 2.1 PROGRESO DE ESTUDIANTES (8 Requerimientos)

#### REQ-ST-001: Visualización de Progreso por Módulo en Tiempo Real
**Origen Student:** `useDashboardData()` → GET `/progress/users/:userId/summary`

| Campo | Student Portal | Teacher Portal | Estado |
|-------|----------------|----------------|--------|
| `totalModules` | ✅ Mostrado | ⚠️ Verificar | Sincronizar |
| `completedModules` | ✅ Mostrado | ⚠️ Verificar | Sincronizar |
| `progress_percentage` | ✅ Mostrado | ⚠️ Verificar | Sincronizar |
| `current_streak` | ✅ Mostrado | ⚠️ Verificar | Sincronizar |
| `last_activity_at` | ✅ Mostrado | ⚠️ Verificar | Sincronizar |

**Requerimiento:** El Teacher debe poder ver el mismo resumen de progreso que el estudiante ve en su dashboard, en tiempo real.

**Endpoint a consumir:** GET `/progress/users/:userId/summary`
**Página Teacher afectada:** `TeacherStudentsPage.tsx`, `TeacherProgressPage.tsx`

---

#### REQ-ST-002: Historial de Intentos de Ejercicios
**Origen Student:** `useExerciseState()` → ExerciseAttempt

| Campo | Student Portal | Teacher Portal | Estado |
|-------|----------------|----------------|--------|
| `attempt_number` | ✅ Registrado | ⚠️ Verificar | Sincronizar |
| `score` | ✅ Registrado | ⚠️ Verificar | Sincronizar |
| `time_spent` | ✅ Registrado | ⚠️ Verificar | Sincronizar |
| `hints_used` | ✅ Registrado | ⚠️ Verificar | Sincronizar |
| `powerups_used` | ✅ Registrado | ⚠️ Verificar | Sincronizar |
| `answers` | ✅ Registrado | ⚠️ Verificar | Sincronizar |

**Requerimiento:** El Teacher debe poder ver todos los intentos de un estudiante en un ejercicio, incluyendo respuestas detalladas y uso de ayudas.

**Endpoint necesario:** GET `/progress/attempts/users/:userId/exercises/:exerciseId`
**Página Teacher afectada:** `TeacherExerciseResponsesPage.tsx`

---

#### REQ-ST-003: Estadísticas de Sesiones de Aprendizaje
**Origen Student:** LearningSession entity

| Campo | Student Portal | Teacher Portal | Estado |
|-------|----------------|----------------|--------|
| `session_duration` | ✅ Tracked | ⚠️ Verificar | Sincronizar |
| `activities_count` | ✅ Tracked | ⚠️ Verificar | Sincronizar |
| `modules_visited` | ✅ Tracked | ⚠️ Verificar | Sincronizar |
| `exercises_completed` | ✅ Tracked | ⚠️ Verificar | Sincronizar |

**Requerimiento:** El Teacher debe poder ver las sesiones de aprendizaje de sus estudiantes para entender patrones de estudio.

**Endpoint necesario:** GET `/progress/sessions/users/:userId`
**Página Teacher afectada:** `TeacherAnalyticsPage.tsx`

---

#### REQ-ST-004: Actividades Pendientes del Estudiante
**Origen Student:** `useDashboardData()` → PendingActivities

| Campo | Descripción | Teacher Visibility |
|-------|-------------|-------------------|
| `pending_exercises` | Ejercicios no completados | ⚠️ Necesario |
| `pending_missions` | Misiones activas no completadas | ⚠️ Necesario |
| `pending_assignments` | Asignaciones por entregar | ⚠️ Necesario |
| `deadline` | Fechas límite | ⚠️ Necesario |

**Requerimiento:** El Teacher debe ver qué actividades tiene pendientes cada estudiante para identificar quienes necesitan seguimiento.

**Endpoint necesario:** GET `/progress/users/:userId/pending-activities`
**Página Teacher afectada:** `TeacherStudentsPage.tsx`, `TeacherAlertsPage.tsx`

---

#### REQ-ST-005: Actividades Recientes del Estudiante
**Origen Student:** `useRecentActivities(limit)`

| Campo | Descripción | Teacher Visibility |
|-------|-------------|-------------------|
| `activity_type` | Tipo de actividad (ejercicio, logro, misión) | ⚠️ Necesario |
| `activity_description` | Descripción de la actividad | ⚠️ Necesario |
| `timestamp` | Fecha/hora de la actividad | ⚠️ Necesario |
| `score` | Puntuación si aplica | ⚠️ Necesario |
| `rewards` | Recompensas obtenidas | ⚠️ Necesario |

**Requerimiento:** El Teacher debe ver un feed de actividad reciente de sus estudiantes (últimas 24-48 horas).

**Endpoint necesario:** GET `/progress/users/:userId/recent-activities`
**Página Teacher afectada:** `TeacherDashboardPage.tsx`

---

#### REQ-ST-006: Ruta de Aprendizaje Personalizada
**Origen Student:** `useDashboardData()` → LearningPath

| Campo | Descripción | Teacher Visibility |
|-------|-------------|-------------------|
| `recommended_modules` | Módulos sugeridos por IA | ⚠️ Útil |
| `completion_order` | Orden óptimo de completación | ⚠️ Útil |
| `skill_gaps` | Brechas de habilidades detectadas | ⚠️ Útil |

**Requerimiento:** El Teacher debe poder ver la ruta de aprendizaje sugerida para cada estudiante y poder ajustarla.

**Endpoint necesario:** GET `/progress/users/:userId/learning-path`
**Página Teacher afectada:** `TeacherStudentsPage.tsx`

---

#### REQ-ST-007: Dominio de Habilidades (Mastery)
**Origen Student:** MasteryTracking entity

| Campo | Descripción | Teacher Visibility |
|-------|-------------|-------------------|
| `skill_id` | Habilidad evaluada | ⚠️ Necesario |
| `mastery_level` | Nivel de dominio (0-100%) | ⚠️ Necesario |
| `assessments_count` | Evaluaciones realizadas | ⚠️ Necesario |
| `last_assessment_date` | Última evaluación | ⚠️ Necesario |

**Requerimiento:** El Teacher debe ver el nivel de dominio de cada habilidad por estudiante para identificar áreas de mejora.

**Endpoint necesario:** GET `/progress/users/:userId/mastery`
**Página Teacher afectada:** `TeacherProgressPage.tsx`, `TeacherAnalyticsPage.tsx`

---

#### REQ-ST-008: Snapshots de Progreso Histórico
**Origen Student:** ProgressSnapshot entity

| Campo | Descripción | Teacher Visibility |
|-------|-------------|-------------------|
| `snapshot_date` | Fecha del snapshot | ⚠️ Necesario |
| `modules_completed` | Módulos completados a esa fecha | ⚠️ Necesario |
| `total_xp` | XP acumulado | ⚠️ Necesario |
| `rank` | Rango a esa fecha | ⚠️ Necesario |

**Requerimiento:** El Teacher debe poder ver la evolución histórica del progreso de cada estudiante.

**Endpoint necesario:** GET `/progress/users/:userId/snapshots`
**Página Teacher afectada:** `TeacherAnalyticsPage.tsx`

---

### 2.2 GAMIFICACIÓN (6 Requerimientos)

#### REQ-GAM-001: Estadísticas de Gamificación del Estudiante
**Origen Student:** `useGamificationData()` → UserStats

| Campo Student | Campo Teacher | Estado |
|---------------|---------------|--------|
| `level` | ✅ Mostrado | Verificar mapping |
| `total_xp` | ✅ Mostrado | Verificar mapping |
| `xp_to_next_level` | ⚠️ No mostrado | Agregar |
| `ml_coins` | ✅ Mostrado | Verificar mapping |
| `current_streak` | ✅ Mostrado | Verificar mapping |
| `max_streak` | ⚠️ No mostrado | Agregar |
| `exercises_completed` | ✅ Mostrado | Verificar mapping |
| `modules_completed` | ✅ Mostrado | Verificar mapping |
| `perfect_scores` | ⚠️ No mostrado | Agregar |

**Requerimiento:** El Teacher debe ver TODAS las estadísticas de gamificación que el estudiante ve, más métricas adicionales para análisis.

**Endpoint necesario:** GET `/gamification/users/:userId/stats`
**Página Teacher afectada:** `TeacherGamificationPage.tsx`, `TeacherStudentsPage.tsx`

---

#### REQ-GAM-002: Progreso de Rango Maya
**Origen Student:** `ranksStore` → UserRank

| Campo | Descripción | Teacher Visibility |
|-------|-------------|-------------------|
| `current_rank` | Rango actual (Ajaw, Nacom, etc.) | ⚠️ Necesario |
| `rank_progress` | Progreso al siguiente rango (0-100%) | ⚠️ Necesario |
| `xp_multiplier` | Multiplicador de XP del rango | ⚠️ Útil |
| `rank_history` | Historial de promociones | ⚠️ Útil |

**Requerimiento:** El Teacher debe ver el rango Maya de cada estudiante y su progreso hacia el siguiente nivel.

**Endpoint necesario:** GET `/gamification/ranks/users/:userId/rank-progress`
**Página Teacher afectada:** `TeacherGamificationPage.tsx`

---

#### REQ-GAM-003: Logros Desbloqueados
**Origen Student:** `achievementsStore` → UserAchievement

| Campo | Descripción | Teacher Visibility |
|-------|-------------|-------------------|
| `achievements_unlocked` | Lista de logros | ⚠️ Necesario |
| `unlock_date` | Fecha de desbloqueo | ⚠️ Necesario |
| `rarity` | Rareza del logro | ⚠️ Útil |
| `total_achievements` | Total disponibles | ⚠️ Necesario |
| `achievements_progress` | Progreso en logros parciales | ⚠️ Útil |

**Requerimiento:** El Teacher debe ver los logros de sus estudiantes y poder otorgar logros manualmente.

**Endpoint necesario:** GET `/gamification/users/:userId/achievements`
**Página Teacher afectada:** `TeacherGamificationPage.tsx`

---

#### REQ-GAM-004: Balance y Transacciones de ML Coins
**Origen Student:** `economyStore` → MLCoinsTransaction

| Campo | Descripción | Teacher Visibility |
|-------|-------------|-------------------|
| `current_balance` | Balance actual | ⚠️ Necesario |
| `transactions_history` | Historial de transacciones | ⚠️ Necesario |
| `coins_earned_today` | Ganados hoy | ⚠️ Útil |
| `coins_spent_total` | Total gastado | ⚠️ Útil |

**Requerimiento:** El Teacher debe ver el balance de ML Coins de sus estudiantes y poder otorgar bonificaciones.

**Endpoint necesario:** GET `/gamification/users/:userId/ml-coins`
**Página Teacher afectada:** `TeacherGamificationPage.tsx`
**Funcionalidad adicional:** POST `/teacher/gamification/bonus` (ya existe)

---

#### REQ-GAM-005: Inventario de Comodines/Power-ups
**Origen Student:** `powerUpsStore` → ComodinesInventory

| Campo | Descripción | Teacher Visibility |
|-------|-------------|-------------------|
| `comodines_available` | Comodines en inventario | ⚠️ Útil |
| `comodines_used` | Comodines usados (total) | ⚠️ Útil |
| `usage_history` | Historial de uso | ⚠️ Útil |

**Requerimiento:** El Teacher debe poder ver el uso de comodines de sus estudiantes para evaluar si dependen demasiado de ayudas.

**Endpoint necesario:** GET `/gamification/comodines/users/:userId/inventory`
**Página Teacher afectada:** `TeacherGamificationPage.tsx`, `TeacherAnalyticsPage.tsx`

---

#### REQ-GAM-006: Posición en Leaderboard
**Origen Student:** `leaderboardsStore`

| Campo | Descripción | Teacher Visibility |
|-------|-------------|-------------------|
| `global_position` | Posición global | ⚠️ Útil |
| `classroom_position` | Posición en el aula | ⚠️ Necesario |
| `school_position` | Posición en la escuela | ⚠️ Útil |
| `rank_change` | Cambio de posición | ⚠️ Útil |

**Requerimiento:** El Teacher debe ver las posiciones de sus estudiantes en los diferentes leaderboards.

**Endpoint necesario:** GET `/gamification/leaderboards/classrooms/:classroomId`
**Página Teacher afectada:** `TeacherGamificationPage.tsx`, `TeacherDashboardPage.tsx`

---

### 2.3 MISIONES (4 Requerimientos)

#### REQ-MIS-001: Misiones Activas del Estudiante
**Origen Student:** `missionsStore` → Mission

| Campo | Descripción | Teacher Visibility |
|-------|-------------|-------------------|
| `daily_missions` | Misiones diarias activas | ⚠️ Necesario |
| `weekly_missions` | Misiones semanales activas | ⚠️ Necesario |
| `special_missions` | Misiones especiales/eventos | ⚠️ Necesario |
| `mission_progress` | Progreso en cada misión | ⚠️ Necesario |

**Requerimiento:** El Teacher debe ver qué misiones tienen activas sus estudiantes y su progreso.

**Endpoint necesario:** GET `/gamification/missions/users/:userId/active`
**Página Teacher afectada:** `TeacherStudentsPage.tsx`

---

#### REQ-MIS-002: Historial de Misiones Completadas
**Origen Student:** Mission entity con status='completed'

| Campo | Descripción | Teacher Visibility |
|-------|-------------|-------------------|
| `missions_completed` | Total de misiones completadas | ⚠️ Necesario |
| `missions_by_type` | Completadas por tipo (daily/weekly) | ⚠️ Necesario |
| `completion_rate` | Tasa de completación | ⚠️ Necesario |
| `rewards_claimed` | Recompensas reclamadas | ⚠️ Útil |

**Requerimiento:** El Teacher debe ver estadísticas de misiones completadas para evaluar compromiso.

**Endpoint necesario:** GET `/gamification/missions/users/:userId/history`
**Página Teacher afectada:** `TeacherAnalyticsPage.tsx`

---

#### REQ-MIS-003: Estadísticas de Misiones del Aula
**Origen Student:** MissionStats agregado

| Campo | Descripción | Teacher Visibility |
|-------|-------------|-------------------|
| `classroom_avg_completion` | Promedio de completación del aula | ⚠️ Necesario |
| `top_mission_completers` | Estudiantes con más misiones | ⚠️ Necesario |
| `struggling_students` | Estudiantes con pocas misiones | ⚠️ Necesario |

**Requerimiento:** El Teacher debe ver métricas agregadas de misiones a nivel de aula.

**Endpoint necesario:** GET `/gamification/missions/classrooms/:classroomId/stats`
**Página Teacher afectada:** `TeacherDashboardPage.tsx`, `TeacherAnalyticsPage.tsx`

---

#### REQ-MIS-004: Misiones Programadas por el Teacher
**Origen Student:** ScheduledMission entity

| Campo | Descripción | Teacher Action |
|-------|-------------|----------------|
| `scheduled_missions` | Misiones asignadas al aula | ✅ Crear |
| `participant_progress` | Progreso de participantes | ⚠️ Visualizar |
| `deadline` | Fecha límite | ✅ Definir |
| `rewards` | Recompensas configuradas | ✅ Definir |

**Requerimiento:** El Teacher debe poder crear misiones específicas para su aula y monitorear el progreso.

**Endpoint necesario:**
- POST `/progress/scheduled-missions` (crear)
- GET `/progress/scheduled-missions/:missionId/progress` (monitorear)

**Página Teacher afectada:** `TeacherAssignmentsPage.tsx` o nueva página de misiones

---

### 2.4 EJERCICIOS (3 Requerimientos)

#### REQ-EXE-001: Respuestas Detalladas de Ejercicios
**Origen Student:** ExerciseSubmission entity

| Campo | Descripción | Teacher Visibility |
|-------|-------------|-------------------|
| `student_answers` | Respuestas del estudiante | 🔴 CRÍTICO |
| `correct_answers` | Respuestas correctas | 🔴 CRÍTICO |
| `partial_scores` | Puntuación por pregunta | ⚠️ Necesario |
| `feedback_needed` | Si requiere revisión manual | 🔴 CRÍTICO |
| `auto_graded` | Si fue calificado automáticamente | ⚠️ Necesario |

**Requerimiento:** El Teacher debe poder ver las respuestas exactas de cada estudiante, comparar con las correctas, y poder agregar feedback.

**Endpoint necesario:** GET `/progress/submissions/:submissionId/details`
**Página Teacher afectada:** `TeacherExerciseResponsesPage.tsx`

---

#### REQ-EXE-002: Estadísticas por Tipo de Ejercicio
**Origen Student:** ExerciseAttempt agregado por mechanic_type

| Campo | Descripción | Teacher Visibility |
|-------|-------------|-------------------|
| `mechanic_type` | Tipo de mecánica (crucigrama, timeline, etc.) | ⚠️ Necesario |
| `avg_score_by_type` | Promedio de puntuación por tipo | ⚠️ Necesario |
| `completion_rate_by_type` | Tasa de completación por tipo | ⚠️ Necesario |
| `time_spent_by_type` | Tiempo promedio por tipo | ⚠️ Necesario |

**Requerimiento:** El Teacher debe ver qué tipos de ejercicios le cuestan más a sus estudiantes.

**Endpoint necesario:** GET `/progress/classrooms/:classroomId/exercise-stats`
**Página Teacher afectada:** `TeacherAnalyticsPage.tsx`

---

#### REQ-EXE-003: Ejercicios con Más Fallos
**Origen Student:** ExerciseAttempt con score < passing

| Campo | Descripción | Teacher Visibility |
|-------|-------------|-------------------|
| `exercise_id` | Ejercicio problemático | ⚠️ Necesario |
| `failure_count` | Cantidad de fallos | ⚠️ Necesario |
| `avg_score` | Puntuación promedio | ⚠️ Necesario |
| `common_mistakes` | Errores más comunes | ⚠️ Necesario |

**Requerimiento:** El Teacher debe identificar qué ejercicios específicos causan más problemas para revisar contenido o dar apoyo adicional.

**Endpoint necesario:** GET `/progress/classrooms/:classroomId/problematic-exercises`
**Página Teacher afectada:** `TeacherAnalyticsPage.tsx`, `TeacherAlertsPage.tsx`

---

### 2.5 ESTADÍSTICAS CONSOLIDADAS (5 Requerimientos)

#### REQ-STAT-001: Resumen de Estadísticas del Estudiante
**Origen Student:** `useUserStatistics()` → GAP-008 implementado

| Campo | Descripción | Teacher Must See |
|-------|-------------|------------------|
| `totalTimeSpent` | Tiempo total de estudio | ✅ CRÍTICO |
| `averageScore` | Puntuación promedio | ✅ CRÍTICO |
| `exercisesCompleted` | Ejercicios completados | ✅ CRÍTICO |
| `modulesCompleted` | Módulos completados | ✅ CRÍTICO |
| `currentStreak` | Racha actual | ✅ CRÍTICO |
| `longestStreak` | Mejor racha | ⚠️ Útil |
| `perfectScores` | Puntuaciones perfectas | ⚠️ Útil |
| `achievementsUnlocked` | Logros desbloqueados | ⚠️ Útil |

**Requerimiento:** El Teacher debe ver el mismo resumen de estadísticas que el estudiante ve en su perfil.

**Endpoint existente:** GET `/auth/profile/statistics` (implementado en GAP-008)
**Página Teacher afectada:** `TeacherStudentsPage.tsx`, `TeacherProgressPage.tsx`

---

#### REQ-STAT-002: Comparativa del Estudiante vs Clase
**Origen:** Calculado

| Campo | Descripción | Teacher Visibility |
|-------|-------------|-------------------|
| `score_percentile` | Percentil en la clase | ⚠️ Necesario |
| `completion_percentile` | Percentil de completación | ⚠️ Necesario |
| `above_avg_skills` | Habilidades sobre el promedio | ⚠️ Necesario |
| `below_avg_skills` | Habilidades bajo el promedio | ⚠️ Necesario |

**Requerimiento:** El Teacher debe ver cómo se compara cada estudiante con el promedio de la clase.

**Endpoint necesario:** GET `/teacher/students/:studentId/insights`
**Página Teacher afectada:** `TeacherStudentsPage.tsx`

---

#### REQ-STAT-003: Métricas de Engagement
**Origen Student:** EngagementMetrics entity

| Campo | Descripción | Teacher Visibility |
|-------|-------------|-------------------|
| `daily_active_time` | Tiempo activo diario | ⚠️ Necesario |
| `sessions_per_week` | Sesiones por semana | ⚠️ Necesario |
| `activity_pattern` | Patrón de actividad (días/horas) | ⚠️ Útil |
| `engagement_score` | Puntuación de engagement | ⚠️ Necesario |

**Requerimiento:** El Teacher debe ver métricas de engagement para identificar estudiantes desenganchados.

**Endpoint necesario:** GET `/progress/users/:userId/engagement`
**Página Teacher afectada:** `TeacherAnalyticsPage.tsx`

---

#### REQ-STAT-004: Tendencias de Rendimiento
**Origen:** Calculado desde ProgressSnapshot

| Campo | Descripción | Teacher Visibility |
|-------|-------------|-------------------|
| `score_trend` | Tendencia de puntuación (subiendo/bajando) | ⚠️ Necesario |
| `completion_trend` | Tendencia de completación | ⚠️ Necesario |
| `activity_trend` | Tendencia de actividad | ⚠️ Necesario |
| `risk_level` | Nivel de riesgo de deserción | ⚠️ CRÍTICO |

**Requerimiento:** El Teacher debe ver tendencias para identificar estudiantes que están mejorando o empeorando.

**Endpoint necesario:** GET `/teacher/students/:studentId/trends`
**Página Teacher afectada:** `TeacherAnalyticsPage.tsx`, `TeacherAlertsPage.tsx`

---

#### REQ-STAT-005: Exportación de Datos del Estudiante
**Origen:** Múltiples fuentes

**Requerimiento:** El Teacher debe poder exportar un reporte completo de cada estudiante con todas sus estadísticas para reuniones con padres.

**Formato de exportación:**
- PDF: Reporte visual con gráficos
- Excel: Datos crudos para análisis

**Endpoint necesario:** POST `/teacher/students/:studentId/export`
**Página Teacher afectada:** `TeacherReportsPage.tsx`

---

### 2.6 ALERTAS DE INTERVENCIÓN (4 Requerimientos)

#### REQ-ALT-001: Alertas por Inactividad
**Origen Student:** LearningSession con gaps

| Trigger | Descripción | Teacher Alert |
|---------|-------------|---------------|
| `3+ días sin actividad` | Estudiante no ha entrado | 🔴 CRÍTICO |
| `7+ días sin actividad` | Riesgo de abandono | 🔴 CRÍTICO |
| `0 ejercicios en semana` | Sin progreso semanal | ⚠️ ALTA |

**Requerimiento:** El sistema debe generar alertas automáticas cuando un estudiante deja de ser activo.

**Implementación:** Trigger en BD o CRON job que detecte inactividad y cree `StudentInterventionAlert`

**Página Teacher afectada:** `TeacherAlertsPage.tsx`, `TeacherDashboardPage.tsx`

---

#### REQ-ALT-002: Alertas por Bajo Rendimiento
**Origen Student:** ExerciseSubmission con scores bajos

| Trigger | Descripción | Teacher Alert |
|---------|-------------|---------------|
| `score < 50% promedio` | Rendimiento bajo general | 🔴 CRÍTICO |
| `3+ ejercicios fallidos seguidos` | Frustración detectada | 🔴 CRÍTICO |
| `declining_trend` | Tendencia negativa | ⚠️ ALTA |

**Requerimiento:** El sistema debe alertar cuando un estudiante muestra bajo rendimiento consistente.

**Implementación:** Trigger después de cada submission que evalúe patrón

**Página Teacher afectada:** `TeacherAlertsPage.tsx`

---

#### REQ-ALT-003: Alertas por Misiones Expiradas
**Origen Student:** Mission con status='expired'

| Trigger | Descripción | Teacher Alert |
|---------|-------------|---------------|
| `daily_missions_missed` | No completó misiones diarias | ⚠️ MEDIA |
| `weekly_missions_missed` | No completó misiones semanales | ⚠️ ALTA |
| `scheduled_mission_missed` | No completó misión asignada | 🔴 CRÍTICO |

**Requerimiento:** El sistema debe notificar cuando estudiantes no completan misiones asignadas.

**Implementación:** CRON job de verificación de misiones expiradas

**Página Teacher afectada:** `TeacherAlertsPage.tsx`

---

#### REQ-ALT-004: Alertas por Asignaciones Vencidas
**Origen Student:** AssignmentStudent con deadline < now y status != 'completed'

| Trigger | Descripción | Teacher Alert |
|---------|-------------|---------------|
| `assignment_overdue` | Asignación no entregada | 🔴 CRÍTICO |
| `assignment_due_soon` | Asignación próxima a vencer | ⚠️ ALTA |
| `assignment_no_progress` | Asignación sin progreso | ⚠️ ALTA |

**Requerimiento:** El sistema debe alertar sobre asignaciones no entregadas o próximas a vencer.

**Implementación:** CRON job de verificación de deadlines

**Página Teacher afectada:** `TeacherAlertsPage.tsx`, `TeacherAssignmentsPage.tsx`

---

## 3️⃣ MATRIZ DE DEPENDENCIAS STUDENT → TEACHER

### 3.1 Flujo de Datos Principal

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              FLUJO DE DATOS                                │
└─────────────────────────────────────────────────────────────────────────────┘

STUDENT GENERA                    BACKEND PROCESA                TEACHER CONSUME
──────────────────────────────────────────────────────────────────────────────

1. Completa Ejercicio
   └── ExerciseAttempt ──────────► progress_tracking.exercise_attempts
   └── ExerciseSubmission ───────► progress_tracking.exercise_submissions
   └── Score + Time ─────────────► Actualiza ModuleProgress ──────► Ver progreso
                                  └── Distribuye XP/Coins ────────► Ver stats
                                  └── Verifica Achievements ──────► Ver logros
                                  └── Actualiza Misiones ─────────► Ver misiones

2. Sesión de Aprendizaje
   └── LearningSession ──────────► progress_tracking.learning_sessions
   └── Duration + Activities ────► Métricas engagement ──────────► Ver analytics

3. Actividad de Gamificación
   └── Rank Progress ────────────► gamification_system.user_ranks ──► Ver ranking
   └── Achievement Unlock ───────► gamification_system.user_achievements ──► Ver
   └── ML Coins Transaction ─────► gamification_system.ml_coins_transactions ──► Ver

4. Misión Completada
   └── Mission Progress ─────────► Calcula recompensas
   └── Mission Claimed ──────────► Distribuye rewards ────────────► Ver balance

5. Asignación Enviada
   └── AssignmentSubmission ─────► Notifica teacher ──────────────► Calificar
```

### 3.2 Endpoints Críticos que Teacher Debe Consumir del Student

| # | Endpoint | Módulo Backend | Datos | Prioridad |
|---|----------|----------------|-------|-----------|
| 1 | `GET /progress/users/:id/summary` | Progress | Resumen de progreso | 🔴 P0 |
| 2 | `GET /progress/users/:id/modules/:moduleId` | Progress | Progreso específico | 🔴 P0 |
| 3 | `GET /gamification/users/:id/stats` | Gamification | Stats completas | 🔴 P0 |
| 4 | `GET /gamification/users/:id/achievements` | Gamification | Logros | 🟡 P1 |
| 5 | `GET /gamification/ranks/users/:id/rank-progress` | Gamification | Rango Maya | 🟡 P1 |
| 6 | `GET /gamification/users/:id/ml-coins` | Gamification | Balance ML Coins | 🟡 P1 |
| 7 | `GET /progress/submissions/:id` | Progress | Detalle submission | 🔴 P0 |
| 8 | `GET /progress/attempts/users/:id/exercises/:exId` | Progress | Intentos | 🟡 P1 |
| 9 | `GET /progress/users/:id/pending-activities` | Progress | Pendientes | 🟡 P1 |
| 10 | `GET /progress/users/:id/recent-activities` | Progress | Recientes | 🟡 P1 |
| 11 | `GET /gamification/missions/users/:id/active` | Gamification | Misiones activas | 🟡 P1 |
| 12 | `GET /gamification/leaderboards/classrooms/:id` | Gamification | Leaderboard aula | 🟢 P2 |

---

## 4️⃣ RECOMENDACIONES DE IMPLEMENTACIÓN

### 4.1 Priorización de Requerimientos

#### P0 - CRÍTICO (Implementar inmediatamente)

| ID | Requerimiento | Impacto |
|----|---------------|---------|
| REQ-ST-001 | Progreso por módulo en tiempo real | Dashboard funcional |
| REQ-ST-002 | Historial de intentos de ejercicios | Calificación correcta |
| REQ-EXE-001 | Respuestas detalladas de ejercicios | Core del Teacher |
| REQ-STAT-001 | Resumen de estadísticas | Visión del estudiante |
| REQ-ALT-001 | Alertas por inactividad | Intervención temprana |
| REQ-ALT-002 | Alertas por bajo rendimiento | Intervención temprana |

#### P1 - ALTA (Implementar en siguiente sprint)

| ID | Requerimiento | Impacto |
|----|---------------|---------|
| REQ-GAM-001 | Estadísticas de gamificación | Gamification insights |
| REQ-GAM-002 | Progreso de rango Maya | Engagement tracking |
| REQ-GAM-003 | Logros desbloqueados | Reconocimiento |
| REQ-MIS-001 | Misiones activas | Monitoreo engagement |
| REQ-EXE-002 | Estadísticas por tipo de ejercicio | Analytics |
| REQ-STAT-002 | Comparativa estudiante vs clase | Insights |

#### P2 - MEDIA (Backlog)

| ID | Requerimiento | Impacto |
|----|---------------|---------|
| REQ-ST-006 | Ruta de aprendizaje | Personalización |
| REQ-GAM-005 | Inventario de comodines | Análisis de ayudas |
| REQ-MIS-004 | Misiones programadas | Feature avanzado |
| REQ-STAT-005 | Exportación de datos | Reportes padres |

### 4.2 Tareas Técnicas Necesarias

#### Backend

1. **Verificar endpoints existentes** - Confirmar que todos los endpoints listados existen y devuelven los campos correctos
2. **Agregar campos faltantes** - Algunos DTOs pueden necesitar campos adicionales
3. **Implementar agregaciones** - Endpoints de estadísticas del aula
4. **Crear triggers de alertas** - Automatizar detección de problemas

#### Frontend (Teacher Portal)

1. **Revisar hooks existentes** - Verificar que consumen correctamente los endpoints
2. **Agregar visualizaciones** - Gráficos de tendencias y comparativas
3. **Implementar drill-down** - Del resumen al detalle del estudiante
4. **Sistema de alertas** - Notificaciones en tiempo real

---

## 5️⃣ CONCLUSIONES

### Hallazgos Principales

1. **El Portal de Students genera datos críticos** que el Portal de Teacher debe consumir para funcionar correctamente (progreso, gamificación, misiones, estadísticas).

2. **Existe infraestructura backend** para la mayoría de los datos, pero es necesario verificar que los endpoints expongan todos los campos necesarios.

3. **Las alertas de intervención** son un área crítica que requiere automatización mediante triggers o CRON jobs.

4. **30 requerimientos identificados** distribuidos en 6 categorías, con 12 marcados como críticos (P0).

### Próximos Pasos Recomendados

1. **FASE 2 - PLANEACIÓN:** Diseñar tareas específicas para cada requerimiento
2. **VALIDACIÓN:** Verificar endpoints existentes vs requeridos
3. **ORQUESTACIÓN:** Delegar implementaciones a agentes especializados
4. **TESTING:** Validar flujo completo Student → Backend → Teacher

---

**Documento generado por:** Architecture-Analyst
**Fecha:** 2025-11-29
**Versión:** 1.0.0
**Estado:** FASE 1 - ANÁLISIS COMPLETADO
