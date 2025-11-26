# PLAN DE DESARROLLO FASE 2: PORTAL TEACHER

**Fecha:** 2025-11-24
**Analista:** Architecture-Analyst
**Basado en:** ANALISIS-FASE-1-TEACHER-PORTAL.md

---

## RESUMEN DEL PLAN

| Metrica | Valor |
|---------|-------|
| Total de tareas | 10 |
| Agentes a orquestar | 6 (2 Backend, 4 Frontend) |
| Ejecucion paralela | SI (grupos de 2-3 agentes) |
| Tiempo estimado | 3-4 sesiones de trabajo |

---

## 1. TAREAS PRIORIZADAS

### GRUPO P0 - CRITICO (Ejecutar Primero)

#### TAREA-001: Crear Endpoints para Respuestas de Ejercicios (Backend)
```yaml
id: TASK-BE-001
prioridad: P0
agente: Backend-Agent
tipo: Crear nuevo servicio y endpoints

descripcion: |
  Crear servicio y endpoints para consultar respuestas/intentos de ejercicios
  de los estudiantes, permitiendo al teacher ver las respuestas detalladas.

archivos_a_crear:
  - apps/backend/src/modules/teacher/services/exercise-responses.service.ts
  - apps/backend/src/modules/teacher/controllers/exercise-responses.controller.ts
  - apps/backend/src/modules/teacher/dto/exercise-responses.dto.ts

endpoints_nuevos:
  - GET /teacher/attempts
  - GET /teacher/attempts/student/:studentId
  - GET /teacher/exercises/:exerciseId/responses

tablas_a_consultar:
  - progress_tracking.exercise_attempts
  - progress_tracking.exercise_submissions
  - educational_content.exercises
  - auth_management.profiles

criterios_aceptacion:
  - Endpoints retornan datos correctos con filtros
  - DTOs con validaciones class-validator
  - Documentacion Swagger completa
  - RLS respetado (solo students del teacher)
```

#### TAREA-002: Crear Pagina de Respuestas de Ejercicios (Frontend)
```yaml
id: TASK-FE-001
prioridad: P0
agente: Frontend-Agent
tipo: Crear nueva pagina completa
dependencias: [TASK-BE-001]

descripcion: |
  Crear pagina completa para visualizar las respuestas de ejercicios
  de los estudiantes con filtros, tabla y modal de detalle.

archivos_a_crear:
  - apps/frontend/src/apps/teacher/pages/TeacherExerciseResponsesPage.tsx
  - apps/frontend/src/apps/teacher/hooks/useExerciseResponses.ts
  - apps/frontend/src/apps/teacher/components/responses/ResponsesTable.tsx
  - apps/frontend/src/apps/teacher/components/responses/ResponseDetailModal.tsx
  - apps/frontend/src/services/api/teacher/exerciseResponsesApi.ts

funcionalidades:
  - Listado de respuestas con DataTable
  - Filtros: estudiante, ejercicio, modulo, fecha, estado
  - Modal de detalle con respuesta vs correcta
  - Paginacion server-side
  - Exportar a CSV

criterios_aceptacion:
  - Pagina carga sin errores
  - Filtros funcionan correctamente
  - Modal muestra detalle completo
  - Responsivo (mobile-friendly)
  - TypeScript sin errores
```

#### TAREA-003: Completar TeacherDashboardPage (Frontend)
```yaml
id: TASK-FE-002
prioridad: P0
agente: Frontend-Agent
tipo: Completar pagina existente

descripcion: |
  Revisar y completar los widgets del dashboard que no estan conectados
  a datos reales. Asegurar que todos los componentes muestren datos.

archivos_a_modificar:
  - apps/frontend/src/apps/teacher/pages/TeacherDashboard.tsx
  - apps/frontend/src/apps/teacher/components/dashboard/*.tsx

verificar:
  - StudentMonitoringPanel conectado a API
  - AssignmentCreator funcional
  - ClassProgressDashboard con datos reales
  - InterventionAlertsPanel conectado
  - ReportGenerator basico (sin ML)

criterios_aceptacion:
  - Todos los widgets muestran datos reales o placeholders coherentes
  - No hay errores de consola
  - Loading states implementados
```

#### TAREA-004: Completar TeacherProgressPage (Frontend)
```yaml
id: TASK-FE-003
prioridad: P0
agente: Frontend-Agent
tipo: Completar pagina existente

descripcion: |
  Completar la pagina de progreso con filtros funcionales,
  graficos de progreso y detalle por estudiante.

archivos_a_modificar:
  - apps/frontend/src/apps/teacher/pages/TeacherProgressPage.tsx
  - apps/frontend/src/apps/teacher/components/progress/*.tsx
  - apps/frontend/src/apps/teacher/hooks/useStudentProgress.ts

verificar:
  - Selector de classroom funcional
  - ClassProgressDashboard con datos por aula
  - Graficos de progreso (ProgressChart)
  - Lista de estudiantes rezagados

criterios_aceptacion:
  - Filtros funcionan correctamente
  - Datos se cargan por classroom seleccionado
  - Graficos se renderizan sin errores
```

---

### GRUPO P1 - ALTO (Ejecutar Segundo)

#### TAREA-005: Completar TeacherStudentsPage (Frontend)
```yaml
id: TASK-FE-004
prioridad: P1
agente: Frontend-Agent
tipo: Completar pagina existente

descripcion: |
  Completar la pagina de estudiantes con detalle individual,
  notas del profesor y acciones.

archivos_a_modificar:
  - apps/frontend/src/apps/teacher/pages/TeacherStudentsPage.tsx
  - apps/frontend/src/apps/teacher/components/monitoring/StudentDetailModal.tsx

funcionalidades:
  - Listado de estudiantes por classroom
  - Modal de detalle con stats completas
  - Agregar notas del profesor
  - Historial de progreso

criterios_aceptacion:
  - Modal de detalle funciona
  - Notas se guardan correctamente
  - Filtros por classroom funcionan
```

#### TAREA-006: Acotar TeacherAnalyticsPage (Frontend)
```yaml
id: TASK-FE-005
prioridad: P1
agente: Frontend-Agent
tipo: Acotar alcance

descripcion: |
  Remover o marcar como "Proximamente" las funcionalidades de ML predictions.
  Mantener solo metricas calculadas (promedios, rates, distribuciones).

archivos_a_modificar:
  - apps/frontend/src/apps/teacher/pages/TeacherAnalyticsPage.tsx
  - apps/frontend/src/apps/teacher/hooks/useAnalytics.ts

cambios:
  - Remover StudentInsights con predictions
  - Mantener: total_students, active_students, average_score, completion_rate
  - Mantener: Score Distribution chart
  - Agregar badge "Beta" o "Proximamente" a secciones ML

criterios_aceptacion:
  - No hay llamadas a endpoints de ML
  - Metricas basicas funcionan correctamente
  - UI coherente sin secciones vacias
```

#### TAREA-007: Mejorar TeacherMonitoringPage (Frontend)
```yaml
id: TASK-FE-006
prioridad: P1
agente: Frontend-Agent
tipo: Mejora de funcionalidad

descripcion: |
  Mejorar el auto-refresh y agregar indicadores visuales
  de estado en tiempo real.

archivos_a_modificar:
  - apps/frontend/src/apps/teacher/pages/TeacherMonitoringPage.tsx
  - apps/frontend/src/apps/teacher/hooks/useStudentMonitoring.ts

mejoras:
  - Auto-refresh configurable (15s, 30s, 60s)
  - Indicador visual de ultimo refresh
  - Status badges mas claros (activo, inactivo, en ejercicio)
  - Notificacion cuando estudiante completa ejercicio

criterios_aceptacion:
  - Auto-refresh funciona sin memory leaks
  - Indicadores visuales claros
  - Performance aceptable
```

---

### GRUPO P2 - MEDIO (Ejecutar Tercero)

#### TAREA-008: Acotar TeacherReportsPage (Frontend)
```yaml
id: TASK-FE-007
prioridad: P2
agente: Frontend-Agent
tipo: Acotar alcance

descripcion: |
  Simplificar generacion de reportes a datos existentes.
  Remover opciones de ML predictions.

archivos_a_modificar:
  - apps/frontend/src/apps/teacher/pages/TeacherReportsPage.tsx

cambios:
  - Remover opcion "Incluir predicciones"
  - Mantener: Reporte de progreso, evaluacion, intervencion
  - Formatos: PDF, Excel
  - Agregar mensaje de limitacion en UI

criterios_aceptacion:
  - Generacion de reportes funciona
  - No hay errores por endpoints ML faltantes
```

#### TAREA-009: Acotar TeacherGamificationPage (Frontend)
```yaml
id: TASK-FE-008
prioridad: P2
agente: Frontend-Agent
tipo: Acotar alcance

descripcion: |
  Limitar a visualizacion de stats y otorgar bonus.
  Remover configuracion de rewards (viene de BD).

archivos_a_modificar:
  - apps/frontend/src/apps/teacher/pages/TeacherGamificationPage.tsx
  - apps/frontend/src/apps/teacher/components/gamification/*.tsx

mantener:
  - Visualizacion de stats por estudiante (XP, ML Coins, rank)
  - Leaderboard del aula
  - Otorgar bonus ML Coins (ya implementado)

remover_o_marcar_proximamente:
  - Configuracion de rewards por ejercicio
  - Crear nuevos achievements

criterios_aceptacion:
  - Visualizacion funciona correctamente
  - Bonus ML Coins funciona
  - UI coherente sin secciones vacias
```

#### TAREA-010: Mejorar TeacherAssignmentsPage (Frontend)
```yaml
id: TASK-FE-009
prioridad: P2
agente: Frontend-Agent
tipo: Mejora de funcionalidad

descripcion: |
  Mejorar el flujo de creacion de asignaciones
  y la visualizacion de submissions.

archivos_a_modificar:
  - apps/frontend/src/apps/teacher/pages/TeacherAssignmentsPage.tsx
  - apps/frontend/src/apps/teacher/components/assignments/*.tsx

mejoras:
  - Wizard de creacion mas intuitivo
  - Preview de ejercicios seleccionados
  - Mejor visualizacion de submissions pendientes
  - Acceso rapido a calificar

criterios_aceptacion:
  - Flujo de creacion completo sin errores
  - Submissions se muestran correctamente
  - Acciones de calificacion funcionan
```

---

## 2. ORDEN DE EJECUCION Y PARALELIZACION

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    FASE 3: EJECUCION                                     │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  GRUPO 1 (PARALELO) - Backend + Frontend base                           │
│  ┌────────────────────┐  ┌────────────────────┐                         │
│  │  TASK-BE-001       │  │  TASK-FE-002       │                         │
│  │  Backend-Agent     │  │  Frontend-Agent    │                         │
│  │  Endpoints         │  │  Dashboard         │                         │
│  │  Responses         │  │  completar         │                         │
│  └────────────────────┘  └────────────────────┘                         │
│           │                       │                                      │
│           ▼                       │                                      │
│  GRUPO 2 (SECUENCIAL) - Frontend depende de Backend                     │
│  ┌────────────────────┐           │                                      │
│  │  TASK-FE-001       │           │                                      │
│  │  Frontend-Agent    │◄──────────┘                                      │
│  │  Pagina Responses  │                                                  │
│  │  (depende BE-001)  │                                                  │
│  └────────────────────┘                                                  │
│           │                                                              │
│           ▼                                                              │
│  GRUPO 3 (PARALELO) - P0 restantes + P1                                 │
│  ┌────────────────────┐  ┌────────────────────┐  ┌────────────────────┐ │
│  │  TASK-FE-003       │  │  TASK-FE-004       │  │  TASK-FE-005       │ │
│  │  Progress Page     │  │  Students Page     │  │  Analytics Page    │ │
│  └────────────────────┘  └────────────────────┘  └────────────────────┘ │
│           │                       │                       │              │
│           ▼                       ▼                       ▼              │
│  GRUPO 4 (PARALELO) - P1 restantes                                      │
│  ┌────────────────────┐  ┌────────────────────┐                         │
│  │  TASK-FE-006       │  │  TASK-FE-007       │                         │
│  │  Monitoring Page   │  │  Reports Page      │                         │
│  └────────────────────┘  └────────────────────┘                         │
│           │                       │                                      │
│           ▼                       ▼                                      │
│  GRUPO 5 (PARALELO) - P2                                                │
│  ┌────────────────────┐  ┌────────────────────┐                         │
│  │  TASK-FE-008       │  │  TASK-FE-009       │                         │
│  │  Gamification Page │  │  Assignments Page  │                         │
│  └────────────────────┘  └────────────────────┘                         │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 3. PROMPTS PARA ORQUESTACION DE AGENTES

### PROMPT GRUPO 1A: Backend-Agent (TASK-BE-001)

```markdown
Lee el prompt orchestration/prompts/PROMPT-BACKEND-AGENT.md y actua como Backend-Agent.

TAREA: Crear servicio y endpoints para consultar respuestas de ejercicios

CONTEXTO:
- El portal Teacher necesita visualizar las respuestas de los estudiantes en ejercicios
- Los datos ya existen en las tablas:
  - progress_tracking.exercise_attempts (intentos autocorregibles)
  - progress_tracking.exercise_submissions (entregas con calificacion manual)
- El teacher solo debe ver respuestas de estudiantes en sus classrooms

ESPECIFICACION:
1. Crear servicio: apps/backend/src/modules/teacher/services/exercise-responses.service.ts
   - Metodo: getAttempts(teacherId, query) - lista intentos con filtros
   - Metodo: getAttemptsByStudent(teacherId, studentId) - intentos de un estudiante
   - Metodo: getExerciseResponses(teacherId, exerciseId) - respuestas a un ejercicio
   - Validar RLS: solo estudiantes de classrooms del teacher

2. Crear DTOs: apps/backend/src/modules/teacher/dto/exercise-responses.dto.ts
   - GetAttemptsQueryDto: page, limit, student_id?, exercise_id?, module_id?, classroom_id?, from_date?, to_date?, is_correct?
   - AttemptResponseDto: id, student_name, exercise_title, submitted_answers, score, is_correct, time_spent, submitted_at
   - AttemptDetailDto: incluye respuesta correcta del ejercicio

3. Crear controller: apps/backend/src/modules/teacher/controllers/exercise-responses.controller.ts
   - GET /teacher/attempts - lista con filtros
   - GET /teacher/attempts/student/:studentId - por estudiante
   - GET /teacher/exercises/:exerciseId/responses - por ejercicio

4. Registrar en teacher.module.ts

REFERENCIAS:
- Entity: apps/backend/src/modules/progress/entities/exercise-attempt.entity.ts
- Entity: apps/backend/src/modules/progress/entities/exercise-submission.entity.ts
- Servicio similar: apps/backend/src/modules/teacher/services/grading.service.ts

CRITERIOS DE ACEPTACION:
- Endpoints retornan datos correctos
- Filtros funcionan (student_id, exercise_id, is_correct, fechas)
- Paginacion implementada
- Swagger documentation completa
- RLS respetado

RESTRICCIONES:
- Seguir patrones existentes del modulo teacher
- Usar decoradores class-validator en DTOs
- No modificar entidades existentes
```

### PROMPT GRUPO 1B: Frontend-Agent (TASK-FE-002)

```markdown
Lee el prompt orchestration/prompts/PROMPT-FRONTEND-AGENT.md y actua como Frontend-Agent.

TAREA: Completar TeacherDashboardPage con widgets funcionales

CONTEXTO:
- El dashboard del teacher tiene varios widgets
- Algunos widgets no estan conectados a datos reales
- Necesitamos asegurar que todos muestren informacion util

ESPECIFICACION:
1. Revisar apps/frontend/src/apps/teacher/pages/TeacherDashboard.tsx
2. Para cada widget verificar:
   - StudentMonitoringPanel: debe usar useStudentMonitoring
   - ClassProgressDashboard: debe mostrar datos reales
   - InterventionAlertsPanel: debe usar useInterventionAlerts
   - ReportGenerator: simplificar a generacion basica (sin ML)

3. Agregar loading states con Skeleton
4. Agregar error handling con ErrorBoundary
5. Asegurar que widgets vacios muestren mensaje coherente

REFERENCIAS:
- Hooks existentes: apps/frontend/src/apps/teacher/hooks/
- Componentes: apps/frontend/src/apps/teacher/components/dashboard/

CRITERIOS DE ACEPTACION:
- Todos los widgets cargan sin errores
- Loading states visibles durante carga
- Datos reales o placeholders coherentes
- No hay errores en consola

RESTRICCIONES:
- No crear nuevos endpoints (usar existentes)
- Mantener estructura de componentes existente
- TypeScript sin errores
```

### PROMPT GRUPO 2: Frontend-Agent (TASK-FE-001) - DEPENDE DE BE-001

```markdown
Lee el prompt orchestration/prompts/PROMPT-FRONTEND-AGENT.md y actua como Frontend-Agent.

TAREA: Crear pagina completa para visualizar respuestas de ejercicios

CONTEXTO:
- El backend ya tiene endpoints:
  - GET /teacher/attempts
  - GET /teacher/attempts/student/:studentId
  - GET /teacher/exercises/:exerciseId/responses
- Necesitamos una pagina completa con tabla, filtros y modal de detalle

ESPECIFICACION:
1. Crear API service: apps/frontend/src/services/api/teacher/exerciseResponsesApi.ts
   - getAttempts(query)
   - getAttemptsByStudent(studentId)
   - getExerciseResponses(exerciseId)

2. Crear hook: apps/frontend/src/apps/teacher/hooks/useExerciseResponses.ts
   - Usar React Query para caching
   - Manejar loading, error, data

3. Crear pagina: apps/frontend/src/apps/teacher/pages/TeacherExerciseResponsesPage.tsx
   - Layout con TeacherLayout
   - Hero section con titulo y descripcion
   - Filtros: Select classroom, Select student, Select modulo, DateRangePicker, Checkbox is_correct
   - DataTable con columnas: Estudiante, Ejercicio, Respuesta, Score, Correcto, Tiempo, Fecha
   - Paginacion server-side

4. Crear componentes:
   - ResponsesTable.tsx: tabla con sorting y acciones
   - ResponseDetailModal.tsx: muestra respuesta completa vs correcta
   - ResponseFilters.tsx: panel de filtros

5. Agregar ruta en router (si no existe)

REFERENCIAS:
- Pagina similar: apps/frontend/src/apps/teacher/pages/TeacherAssignmentsPage.tsx
- Hook similar: apps/frontend/src/apps/teacher/hooks/useGrading.ts
- Componentes UI: usar DetectiveCard, DetectiveButton del tema

CRITERIOS DE ACEPTACION:
- Pagina carga sin errores
- Filtros funcionan y actualizan tabla
- Paginacion funciona
- Modal muestra detalle completo
- Responsive design
- TypeScript sin errores

RESTRICCIONES:
- Usar componentes UI existentes (DetectiveCard, etc)
- Seguir patrones de otras paginas teacher
- No crear nuevos endpoints (usar los creados en BE-001)
```

---

## 4. RESUMEN DE AGENTES A ORQUESTAR

| Grupo | Agente | Tarea | Paralelo | Dependencia |
|-------|--------|-------|----------|-------------|
| 1A | Backend-Agent | TASK-BE-001: Endpoints Responses | SI | Ninguna |
| 1B | Frontend-Agent | TASK-FE-002: Dashboard completar | SI | Ninguna |
| 2 | Frontend-Agent | TASK-FE-001: Pagina Responses | NO | TASK-BE-001 |
| 3A | Frontend-Agent | TASK-FE-003: Progress Page | SI | Ninguna |
| 3B | Frontend-Agent | TASK-FE-004: Students Page | SI | Ninguna |
| 3C | Frontend-Agent | TASK-FE-005: Analytics acotar | SI | Ninguna |
| 4A | Frontend-Agent | TASK-FE-006: Monitoring mejorar | SI | Ninguna |
| 4B | Frontend-Agent | TASK-FE-007: Reports acotar | SI | Ninguna |
| 5A | Frontend-Agent | TASK-FE-008: Gamification acotar | SI | Ninguna |
| 5B | Frontend-Agent | TASK-FE-009: Assignments mejorar | SI | Ninguna |

**Total:** 2 agentes Backend, 9 tareas Frontend (algunas en paralelo)

---

## 5. CRITERIOS DE VALIDACION GLOBAL

Al finalizar FASE 3, validar:

- [ ] Todos los endpoints backend responden correctamente
- [ ] TypeScript compila sin errores en frontend
- [ ] Todas las paginas cargan sin errores de consola
- [ ] Filtros y paginacion funcionan
- [ ] Datos reales se muestran (no solo mocks)
- [ ] Inventarios actualizados (FRONTEND_INVENTORY, BACKEND_INVENTORY)
- [ ] Trazas actualizadas

---

**Estado:** FASE 2 COMPLETADA
**Siguiente:** FASE 3 - EJECUCION (Orquestar agentes)
