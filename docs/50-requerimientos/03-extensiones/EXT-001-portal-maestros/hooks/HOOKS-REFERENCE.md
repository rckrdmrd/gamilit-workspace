# HOOKS-REFERENCE.md - Portal Teacher

**Version:** 1.0.0
**Fecha:** 2026-01-25
**Fase:** EXT-001-portal-maestros

---

## INTRODUCCION

Documentación completa de los 23 hooks personalizados del Portal Teacher. Estos hooks encapsulan la lógica de negocio, gestión de estado y comunicación con APIs para todas las funcionalidades del portal.

**Ubicación:** `apps/frontend/src/apps/teacher/hooks/`

---

## INDICE POR CATEGORIA

### Dashboard
- [useTeacherDashboard](#useteacherdashboard)

### Classroom Management
- [useClassrooms](#useclassrooms)
- [useClassroomsStats](#useclassroomsstats)
- [useClassroomData](#useclassroomdata)
- [useClassroomRealtime](#useclassroomrealtime)

### Student Monitoring
- [useStudentProgress](#usestudentprogress)
- [useStudentMonitoring](#usestudentmonitoring)
- [useMasteryTracking](#usemasterytracking)

### Assignments & Grading
- [useAssignments](#useassignments)
- [useExerciseResponses](#useexerciseresponses)
- [useGrading](#usegrading)

### Analytics
- [useAnalytics](#useanalytics)
- [useStudentInsights](#usestudentinsights)

### Gamification
- [useMissionStats](#usemissionstats)
- [useGrantBonus](#usegrantbonus)
- [useEconomyAnalytics](#useeconomyanalytics)
- [useStudentsEconomy](#usestudentseconomy)
- [useAchievementsStats](#useachievementsstats)

### Communication
- [useTeacherMessages](#useteachermessages)
- [useInterventionAlerts](#useinterventionalerts)

### Content Management
- [useTeacherContent](#useteachercontent)

### Manual Reviews
- [useManualReviews](#usemanualreviews)
- [useManualReviewConfig](#usemanualreviewconfig)

---

## DASHBOARD

### useTeacherDashboard

**Ubicación:** `hooks/useTeacherDashboard.ts`
**Categoría:** Dashboard

Gestiona todos los datos del dashboard principal del maestro, incluyendo estadísticas, actividades recientes, alertas, mejores estudiantes y progreso de módulos.

**Signature:**
```typescript
const {
  stats,
  activities,
  alerts,
  topPerformers,
  moduleProgress,
  loading,
  error,
  refresh,
  refreshStats,
  refreshActivities,
  refreshAlerts
} = useTeacherDashboard();
```

**Retorno:**
| Campo | Tipo | Descripción |
|-------|------|-------------|
| stats | TeacherDashboardStats \| null | Estadísticas generales del dashboard |
| activities | Activity[] | Lista de actividades recientes (últimas 10) |
| alerts | InterventionAlert[] | Alertas de intervención activas |
| topPerformers | StudentPerformance[] | Top 5 estudiantes con mejor rendimiento |
| moduleProgress | ModuleProgress[] | Resumen de progreso por módulo |
| loading | boolean | Estado de carga inicial |
| error | Error \| null | Error si ocurrió alguno |
| refresh | () => Promise<void> | Recarga todos los datos |
| refreshStats | () => Promise<void> | Recarga solo estadísticas |
| refreshActivities | () => Promise<void> | Recarga solo actividades |
| refreshAlerts | () => Promise<void> | Recarga solo alertas |

**API Consumida:**
- Servicio: teacherApi
- Endpoints:
  - GET /teacher/dashboard/stats
  - GET /teacher/activities/recent
  - GET /teacher/alerts/students
  - GET /teacher/analytics/top-performers
  - GET /teacher/analytics/module-progress

**Ejemplo de uso:**
```tsx
const {
  stats,
  activities,
  alerts,
  loading,
  refresh
} = useTeacherDashboard();

if (loading && !stats) {
  return <LoadingSpinner />;
}

return (
  <div>
    <DashboardStats stats={stats} />
    <RecentActivities activities={activities} />
    <AlertsPanel alerts={alerts} />
    <RefreshButton onClick={refresh} />
  </div>
);
```

**Notas:**
- Fetch automático al montar el componente
- Todas las llamadas API se ejecutan en paralelo para optimizar rendimiento
- Refresh parcial disponible para secciones individuales

---

## CLASSROOM MANAGEMENT

### useClassrooms

**Ubicación:** `hooks/useClassrooms.ts`
**Categoría:** Classroom

Gestiona la lista de classrooms del maestro, permite CRUD completo de classrooms y gestión de estudiantes por classroom.

**Signature:**
```typescript
const {
  classrooms,
  pagination,
  selectedClassroom,
  students,
  loading,
  error,
  selectClassroom,
  createClassroom,
  updateClassroom,
  deleteClassroom,
  refreshStudents,
  refresh
} = useClassrooms(filters?: GetClassroomsQueryDto);
```

**Parámetros:**
| Param | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| filters | GetClassroomsQueryDto | No | Filtros opcionales para la consulta |

**Retorno:**
| Campo | Tipo | Descripción |
|-------|------|-------------|
| classrooms | Classroom[] | Lista de classrooms del maestro |
| pagination | PaginationInfo \| null | Información de paginación |
| selectedClassroom | Classroom \| null | Classroom actualmente seleccionado |
| students | StudentMonitoring[] | Estudiantes del classroom seleccionado (límite 100) |
| loading | boolean | Estado de carga |
| error | Error \| null | Error si ocurrió alguno |
| selectClassroom | (id: string \| null) => Promise<void> | Selecciona un classroom y carga sus estudiantes |
| createClassroom | (data) => Promise<Classroom> | Crea un nuevo classroom |
| updateClassroom | (id, data) => Promise<Classroom> | Actualiza un classroom existente |
| deleteClassroom | (id) => Promise<void> | Elimina un classroom |
| refreshStudents | () => Promise<void> | Recarga estudiantes del classroom seleccionado |
| refresh | () => Promise<void> | Recarga lista de classrooms |

**API Consumida:**
- Servicio: classroomsApi
- Endpoints:
  - GET /teacher/classrooms
  - GET /teacher/classrooms/:id
  - GET /teacher/classrooms/:id/students
  - POST /teacher/classrooms
  - PATCH /teacher/classrooms/:id
  - DELETE /teacher/classrooms/:id

**Ejemplo de uso:**
```tsx
const {
  classrooms,
  selectedClassroom,
  students,
  loading,
  selectClassroom,
  createClassroom
} = useClassrooms();

const handleCreate = async () => {
  await createClassroom({
    name: '3ro A',
    subject: 'Español',
    grade_level: 'Tercero'
  });
};

return (
  <div>
    <ClassroomList
      classrooms={classrooms}
      onSelect={selectClassroom}
    />
    {selectedClassroom && (
      <StudentList students={students} />
    )}
  </div>
);
```

**Notas:**
- CORR-2025-12-18: Límite de 100 estudiantes por classroom para obtener todos los registros
- Mapeo automático de user_id a id para React keys

---

### useClassroomsStats

**Ubicación:** `hooks/useClassroomsStats.ts`
**Categoría:** Classroom

Obtiene y agrega estadísticas de múltiples classrooms, calculando métricas agregadas ponderadas por número de estudiantes.

**Signature:**
```typescript
const {
  stats,
  aggregateStats,
  loading,
  error,
  refresh
} = useClassroomsStats(classrooms: Classroom[]);
```

**Parámetros:**
| Param | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| classrooms | Classroom[] | Sí | Array de classrooms para calcular estadísticas |

**Retorno:**
| Campo | Tipo | Descripción |
|-------|------|-------------|
| stats | Map<string, ClassroomStats> | Mapa de estadísticas por classroom ID |
| aggregateStats | AggregateStats | Estadísticas agregadas de todos los classrooms |
| loading | boolean | Estado de carga |
| error | Error \| null | Error si ocurrió alguno |
| refresh | () => Promise<void> | Recarga estadísticas |

**API Consumida:**
- Servicio: classroomsApi
- Endpoints:
  - GET /teacher/classrooms/:id/stats (múltiples llamadas en paralelo)

**Ejemplo de uso:**
```tsx
const { classrooms } = useClassrooms();
const { aggregateStats, loading, error } = useClassroomsStats(classrooms);

if (loading) return <LoadingSpinner />;
if (error) return <ErrorMessage error={error} />;

return (
  <div>
    <h2>Estadísticas Generales</h2>
    <p>Total Estudiantes: {aggregateStats.totalStudents}</p>
    <p>Promedio: {aggregateStats.averageScore.toFixed(1)}%</p>
    <p>Classes Activas: {aggregateStats.activeClasses}</p>
  </div>
);
```

**Notas:**
- TASK-2026-01-19-004: Nomenclatura unificada camelCase
- Promedio ponderado por número de estudiantes para métricas agregadas
- Fetch paralelo de todas las estadísticas para optimizar rendimiento

---

### useClassroomData

**Ubicación:** `hooks/useClassroomData.ts`
**Categoría:** Classroom

Hook legacy refactorizado que obtiene datos completos de progreso de un classroom, incluyendo estadísticas generales y progreso por módulo.

**Signature:**
```typescript
const {
  data,
  moduleProgress,
  students,
  loading,
  error,
  refresh
} = useClassroomData(classroomId: string);
```

**Parámetros:**
| Param | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| classroomId | string | Sí | ID del classroom |

**Retorno:**
| Campo | Tipo | Descripción |
|-------|------|-------------|
| data | ClassroomData \| null | Datos generales del classroom |
| moduleProgress | ModuleProgress[] | Progreso por módulo |
| students | StudentMonitoring[] | Lista de estudiantes |
| loading | boolean | Estado de carga |
| error | Error \| null | Error si ocurrió alguno |
| refresh | () => Promise<void> | Recarga datos |

**API Consumida:**
- Servicio: classroomsApi
- Endpoints:
  - GET /teacher/classrooms/:id/progress
  - GET /teacher/classrooms/:id/students

**Ejemplo de uso:**
```tsx
const {
  data,
  moduleProgress,
  loading,
  error
} = useClassroomData(classroomId);

if (loading) return <Spinner />;
if (error) return <ErrorMessage error={error} />;

return (
  <div>
    <ClassroomStats data={data} />
    <ModuleProgressChart modules={moduleProgress} />
  </div>
);
```

**Notas:**
- Fetch paralelo de progreso y estudiantes
- Mantiene compatibilidad con componentes legacy

---

### useClassroomRealtime

**Ubicación:** `hooks/useClassroomRealtime.ts`
**Categoría:** Classroom | Realtime

Gestiona conexión WebSocket para monitoreo en tiempo real de actividad de estudiantes en classrooms. Soporta múltiples classrooms simultáneamente.

**Signature:**
```typescript
const {
  isConnected,
  isConnecting,
  error,
  events,
  onlineStudents,
  clearEvents,
  reconnect
} = useClassroomRealtime(options: UseClassroomRealtimeOptions);
```

**Parámetros:**
| Param | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| options.classroomIds | string[] | Sí | IDs de classrooms a monitorear |
| options.onActivity | (data) => void | No | Callback para eventos de actividad |
| options.onSubmission | (data) => void | No | Callback para nuevas entregas |
| options.onAlert | (data) => void | No | Callback para alertas disparadas |
| options.onStudentOnline | (data) => void | No | Callback cuando estudiante se conecta |
| options.onStudentOffline | (data) => void | No | Callback cuando estudiante se desconecta |
| options.onProgressUpdate | (data) => void | No | Callback para actualizaciones de progreso |
| options.onClassroomUpdate | (data) => void | No | Callback para cambios en classroom |
| options.enabled | boolean | No | Habilitar/deshabilitar conexión (default: true) |

**Retorno:**
| Campo | Tipo | Descripción |
|-------|------|-------------|
| isConnected | boolean | Si la conexión WebSocket está activa |
| isConnecting | boolean | Si está intentando conectar |
| error | Error \| null | Error de conexión si existe |
| events | RealtimeEvent[] | Histórico de eventos (últimos 100) |
| onlineStudents | Map<string, StudentOnlineStatus> | Mapa de estudiantes online |
| clearEvents | () => void | Limpia histórico de eventos |
| reconnect | () => void | Fuerza reconexión |

**API Consumida:**
- WebSocket: /socket.io/
- Eventos:
  - teacher:subscribe_classroom
  - teacher:unsubscribe_classroom
  - teacher:student_activity
  - teacher:classroom_update
  - teacher:new_submission
  - teacher:alert_triggered
  - teacher:student_online
  - teacher:student_offline
  - teacher:progress_update

**Ejemplo de uso:**
```tsx
const {
  isConnected,
  events,
  onlineStudents
} = useClassroomRealtime({
  classroomIds: ['classroom-1', 'classroom-2'],
  onActivity: (data) => {
    console.log('Nueva actividad:', data);
  },
  onAlert: (alert) => {
    toast.warning(alert.title);
  }
});

return (
  <div>
    <ConnectionStatus connected={isConnected} />
    <OnlineStudents students={Array.from(onlineStudents.values())} />
    <RealtimeEvents events={events} />
  </div>
);
```

**Notas:**
- P2-01: Creado 2025-12-18
- EXT-003 FIX 2026-01-04: Usa URL WebSocket centralizada de API_CONFIG
- Auto-reconexión con reintentos exponenciales (max 5 intentos)
- Suscripción/desuscripción automática al cambiar classroomIds
- Mantiene histórico de últimos 100 eventos

---

## STUDENT MONITORING

### useStudentProgress

**Ubicación:** `hooks/useStudentProgress.ts`
**Categoría:** Student

Obtiene información completa de progreso de un estudiante individual, incluyendo overview, estadísticas y notas del maestro.

**Signature:**
```typescript
const {
  progress,
  overview,
  stats,
  notes,
  loading,
  error,
  addNote,
  refresh
} = useStudentProgress(studentId: string);
```

**Parámetros:**
| Param | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| studentId | string | Sí | ID del estudiante |

**Retorno:**
| Campo | Tipo | Descripción |
|-------|------|-------------|
| progress | StudentProgress \| null | Datos de progreso detallado |
| overview | StudentOverview \| null | Vista general del estudiante |
| stats | StudentStats \| null | Estadísticas de rendimiento |
| notes | StudentNote[] | Notas del maestro sobre el estudiante |
| loading | boolean | Estado de carga |
| error | Error \| null | Error si ocurrió alguno |
| addNote | (note) => Promise<void> | Agrega una nota al estudiante |
| refresh | () => Promise<void> | Recarga todos los datos |

**API Consumida:**
- Servicio: studentProgressApi
- Endpoints:
  - GET /teacher/students/:id/progress
  - GET /teacher/students/:id/overview
  - GET /teacher/students/:id/stats
  - GET /teacher/students/:id/notes
  - POST /teacher/students/:id/notes

**Ejemplo de uso:**
```tsx
const {
  progress,
  stats,
  notes,
  loading,
  addNote
} = useStudentProgress(studentId);

const handleAddNote = async () => {
  await addNote({
    content: 'Excelente participación',
    category: 'positive'
  });
};

return (
  <div>
    <ProgressChart progress={progress} />
    <StatsPanel stats={stats} />
    <NotesSection notes={notes} onAdd={handleAddNote} />
  </div>
);
```

**Notas:**
- Fetch paralelo de todos los datos para optimizar rendimiento
- Actualización optimista al agregar notas

---

### useStudentMonitoring

**Ubicación:** `hooks/useStudentMonitoring.ts`
**Categoría:** Student

Hook avanzado para monitoreo de estudiantes con paginación server-side, filtros, auto-refresh configurable y prevención de loops infinitos.

**Signature:**
```typescript
const {
  students,
  loading,
  error,
  page,
  limit,
  pagination,
  setPage,
  setPageLimit,
  refreshInterval,
  setRefreshInterval,
  refresh,
  lastUpdate
} = useStudentMonitoring(
  classroomId: string,
  filters?: StudentFilter,
  options?: UseStudentMonitoringOptions
);
```

**Parámetros:**
| Param | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| classroomId | string | Sí | ID del classroom |
| filters | StudentFilter | No | Filtros de status, módulo, score, búsqueda |
| options.defaultInterval | RefreshInterval | No | Intervalo de auto-refresh (0, 15000, 30000, 60000ms) |
| options.defaultLimit | number | No | Límite inicial por página (default: 25) |

**Retorno:**
| Campo | Tipo | Descripción |
|-------|------|-------------|
| students | StudentMonitoring[] | Lista de estudiantes de la página actual |
| loading | boolean | Estado de carga |
| error | Error \| null | Error si ocurrió alguno |
| page | number | Página actual (1-indexed) |
| limit | number | Límite de registros por página |
| pagination | PaginationInfo \| null | Información de paginación del servidor |
| setPage | (page) => void | Cambiar a una página específica |
| setPageLimit | (limit) => void | Cambiar límite por página (resetea a página 1) |
| refreshInterval | RefreshInterval | Intervalo de auto-refresh actual |
| setRefreshInterval | (interval) => void | Cambiar intervalo de auto-refresh |
| refresh | () => Promise<void> | Forzar refresh manual |
| lastUpdate | Date \| null | Timestamp de última actualización |

**API Consumida:**
- Servicio: classroomsApi
- Endpoints:
  - GET /teacher/classrooms/:id/students (con query params para paginación y filtros)

**Ejemplo de uso:**
```tsx
const {
  students,
  loading,
  page,
  setPage,
  refreshInterval,
  setRefreshInterval,
  lastUpdate
} = useStudentMonitoring(classroomId,
  { status: ['active'] },
  { defaultInterval: 30000, defaultLimit: 25 }
);

return (
  <div>
    <RefreshControls
      interval={refreshInterval}
      onIntervalChange={setRefreshInterval}
      lastUpdate={lastUpdate}
    />
    <StudentTable students={students} loading={loading} />
    <Pagination
      page={page}
      onPageChange={setPage}
    />
  </div>
);
```

**Notas:**
- CORR-2025-12-18: Paginación completa server-side
- FIX-2026-01-08: Prevención de loops infinitos con contador de errores consecutivos
- FIX-2026-01-08: Comparación estable de filtros usando JSON.stringify
- Auto-refresh se pausa automáticamente después de 3 errores consecutivos
- Mapeo automático de user_id a id para React keys
- FIX-2026-01-25: Valores por defecto para campos null/undefined

---

### useMasteryTracking

**Ubicación:** `hooks/useMasteryTracking.ts`
**Categoría:** Student | Analytics

Rastrea el dominio (mastery) de habilidades y competencias de estudiantes individuales o classrooms completos, basado en los 5 niveles de comprensión lectora de GAMILIT.

**Signature:**
```typescript
// Individual student
const {
  data,
  loading,
  error,
  refresh
} = useMasteryTracking(studentId: string);

// Classroom overview
const {
  overview,
  students,
  loading,
  error,
  refresh
} = useClassroomMastery(classroomId: string);
```

**Parámetros:**
| Param | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| studentId | string | Sí | ID del estudiante (useMasteryTracking) |
| classroomId | string | Sí | ID del classroom (useClassroomMastery) |

**Retorno (useMasteryTracking):**
| Campo | Tipo | Descripción |
|-------|------|-------------|
| data | MasteryData \| null | Datos de dominio del estudiante |
| loading | boolean | Estado de carga |
| error | Error \| null | Error si ocurrió alguno |
| refresh | () => Promise<void> | Recarga datos |

**Retorno (useClassroomMastery):**
| Campo | Tipo | Descripción |
|-------|------|-------------|
| overview | ClassroomMasteryOverview \| null | Vista general del classroom |
| students | MasteryData[] | Datos de dominio de todos los estudiantes |
| loading | boolean | Estado de carga |
| error | Error \| null | Error si ocurrió alguno |
| refresh | () => Promise<void> | Recarga datos |

**API Consumida:**
- Servicio: apiClient
- Endpoints:
  - GET /teacher/students/:id/progress
  - GET /teacher/classrooms/:id/students

**Ejemplo de uso:**
```tsx
const { data, loading } = useMasteryTracking(studentId);

if (loading) return <Spinner />;

return (
  <div>
    <MasteryLevel level={data.mastery_level} />
    <CompetenciesChart competencies={data.competencies} />
    <StrengthsWeaknesses
      strengths={data.strengths}
      weaknesses={data.areas_for_improvement}
    />
  </div>
);
```

**Notas:**
- P1-07: Creado 2025-12-18
- Mapea progreso de módulos a habilidades según 5 niveles de comprensión lectora
- Niveles de dominio: novice, developing, proficient, advanced, expert
- Categorías de habilidades: comprehension, analysis, synthesis, evaluation, creation
- Cálculo de velocidad de aprendizaje (skills mastered per week)

---

## ASSIGNMENTS & GRADING

### useAssignments

**Ubicación:** `hooks/useAssignments.ts`
**Categoría:** Assignment

Gestiona el ciclo completo de asignaciones: creación, actualización, eliminación, entregas y envío de recordatorios.

**Signature:**
```typescript
const {
  assignments,
  exercises,
  loading,
  error,
  getAssignmentById,
  createAssignment,
  updateAssignment,
  deleteAssignment,
  getSubmissions,
  gradeSubmission,
  sendReminder,
  refresh
} = useAssignments(filters?: GetAssignmentsQueryDto);
```

**Parámetros:**
| Param | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| filters | GetAssignmentsQueryDto | No | Filtros opcionales para asignaciones |

**Retorno:**
| Campo | Tipo | Descripción |
|-------|------|-------------|
| assignments | Assignment[] | Lista de asignaciones |
| exercises | Exercise[] | Ejercicios disponibles para asignar |
| loading | boolean | Estado de carga |
| error | Error \| null | Error si ocurrió alguno |
| getAssignmentById | (id) => Promise<Assignment> | Obtiene asignación por ID |
| createAssignment | (data) => Promise<Assignment> | Crea nueva asignación |
| updateAssignment | (id, data) => Promise<Assignment> | Actualiza asignación |
| deleteAssignment | (id) => Promise<void> | Elimina asignación |
| getSubmissions | (id) => Promise<Submission[]> | Obtiene entregas de una asignación |
| gradeSubmission | (id, data) => Promise<Submission> | Califica una entrega |
| sendReminder | (id) => Promise<SendReminderResult> | Envía recordatorio a estudiantes |
| refresh | () => Promise<void> | Recarga asignaciones |

**API Consumida:**
- Servicio: assignmentsApi
- Endpoints:
  - GET /teacher/assignments
  - GET /teacher/assignments/:id
  - GET /teacher/assignments/exercises
  - POST /teacher/assignments
  - PATCH /teacher/assignments/:id
  - DELETE /teacher/assignments/:id
  - GET /teacher/assignments/:id/submissions
  - POST /teacher/assignments/submissions/:id/grade
  - POST /teacher/assignments/:id/remind

**Ejemplo de uso:**
```tsx
const {
  assignments,
  exercises,
  loading,
  createAssignment,
  sendReminder
} = useAssignments();

const handleCreate = async () => {
  await createAssignment({
    title: 'Tarea Módulo 1',
    exercise_ids: ['ex-1', 'ex-2'],
    due_date: '2026-02-01',
    classroom_id: 'classroom-1'
  });
};

const handleRemind = async (assignmentId: string) => {
  const result = await sendReminder(assignmentId);
  toast.success(`${result.notified} estudiantes notificados`);
};

return (
  <AssignmentManager
    assignments={assignments}
    exercises={exercises}
    onCreate={handleCreate}
    onRemind={handleRemind}
  />
);
```

**Notas:**
- UPDATED 2025-12-27: Mapper para transformar backend response a frontend interface
- Backend devuelve: isPublished, dueDate, assignmentType
- Frontend espera: status, end_date, module_id, module_name
- Cálculo automático de status basado en isPublished y dueDate

---

### useExerciseResponses

**Ubicación:** `hooks/useExerciseResponses.ts`
**Categoría:** Assignment | Review

Proporciona acceso a respuestas y intentos de ejercicios con React Query. Soporta filtros, paginación y vistas detalladas.

**Signature:**
```typescript
// Lista paginada de intentos
const { data, isLoading, error, refetch } = useExerciseResponses(
  query?: GetAttemptsQuery
);

// Detalle de un intento específico
const { data, isLoading, error } = useAttemptDetail(
  attemptId: string | null,
  enabled?: boolean
);

// Intentos de un estudiante
const { data, isLoading, error } = useAttemptsByStudent(
  studentId: string | null,
  enabled?: boolean
);

// Respuestas de un ejercicio específico
const { data, isLoading, error } = useExerciseSpecificResponses(
  exerciseId: string | null,
  query?: GetAttemptsQuery,
  enabled?: boolean
);
```

**Parámetros:**
| Param | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| query.classroom_id | string | No | Filtrar por classroom |
| query.page | number | No | Número de página |
| query.limit | number | No | Registros por página |
| query.is_correct | boolean | No | Filtrar por correctas/incorrectas |
| attemptId | string \| null | Sí* | ID del intento (*para useAttemptDetail) |
| studentId | string \| null | Sí* | ID del estudiante (*para useAttemptsByStudent) |
| exerciseId | string \| null | Sí* | ID del ejercicio (*para useExerciseSpecificResponses) |
| enabled | boolean | No | Habilitar query (default: true) |

**Retorno:**
| Campo | Tipo | Descripción |
|-------|------|-------------|
| data | AttemptsListResponse \| AttemptDetailResponse \| AttemptResponse[] | Datos según el hook usado |
| isLoading | boolean | Estado de carga |
| error | Error \| null | Error si ocurrió alguno |
| refetch | () => void | Función para refetch (solo en useExerciseResponses) |

**API Consumida:**
- Servicio: exerciseResponsesApi
- Endpoints:
  - GET /teacher/attempts
  - GET /teacher/attempts/:id
  - GET /teacher/students/:id/attempts
  - GET /teacher/exercises/:id/responses

**Ejemplo de uso:**
```tsx
// Mostrar intentos incorrectos de un classroom
const { data, isLoading, refetch } = useExerciseResponses({
  classroom_id: 'classroom-1',
  is_correct: false,
  page: 1,
  limit: 20
});

if (isLoading) return <Spinner />;

return (
  <ResponsesTable
    attempts={data.data}
    total={data.total}
    onRefresh={refetch}
  />
);

// Detalle de un intento
const { data: attempt } = useAttemptDetail(selectedAttemptId);

if (attempt) {
  return (
    <AttemptDetailView
      attempt={attempt}
      studentAnswer={attempt.submitted_answers}
      correctAnswer={attempt.correct_answer}
    />
  );
}
```

**Notas:**
- Usa React Query para cache y manejo de estado
- staleTime: 2 minutos (datos considerados frescos)
- gcTime: 5-10 minutos (garbage collection del cache)
- refetchOnWindowFocus: false (no refetch al enfocar ventana)
- Reintentos configurados según criticidad del endpoint

---

### useGrading

**Ubicación:** `hooks/useGrading.ts`
**Categoría:** Grading

Gestiona el flujo de calificación de entregas, incluyendo vista de pendientes, calificación individual y calificación masiva.

**Signature:**
```typescript
const {
  submissions,
  total,
  page,
  limit,
  pendingCount,
  loading,
  error,
  getSubmissionDetail,
  grade,
  bulkGrade,
  refresh
} = useGrading(filters?: GetSubmissionsQueryDto);
```

**Parámetros:**
| Param | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| filters | GetSubmissionsQueryDto | No | Filtros opcionales para entregas |

**Retorno:**
| Campo | Tipo | Descripción |
|-------|------|-------------|
| submissions | Submission[] | Lista de entregas |
| total | number | Total de entregas |
| page | number | Página actual |
| limit | number | Registros por página |
| pendingCount | number | Cantidad de entregas pendientes |
| loading | boolean | Estado de carga |
| error | Error \| null | Error si ocurrió alguno |
| getSubmissionDetail | (id) => Promise<SubmissionDetail> | Obtiene detalle de una entrega |
| grade | (id, feedback) => Promise<void> | Califica una entrega individual |
| bulkGrade | (data) => Promise<void> | Califica múltiples entregas |
| refresh | () => Promise<void> | Recarga entregas |

**API Consumida:**
- Servicio: gradingApi
- Endpoints:
  - GET /teacher/grading/submissions
  - GET /teacher/grading/submissions/:id
  - POST /teacher/grading/submissions/:id/feedback
  - POST /teacher/grading/bulk

**Ejemplo de uso:**
```tsx
const {
  submissions,
  pendingCount,
  loading,
  grade,
  bulkGrade
} = useGrading({ status: 'pending' });

const handleGrade = async (submissionId: string) => {
  await grade(submissionId, {
    score: 85,
    feedback: 'Buen trabajo',
    comments: ['Excelente análisis']
  });
};

const handleBulkGrade = async (ids: string[]) => {
  await bulkGrade({
    submission_ids: ids,
    score: 100,
    feedback: 'Completado correctamente'
  });
};

return (
  <div>
    <PendingBadge count={pendingCount} />
    <SubmissionsList
      submissions={submissions}
      onGrade={handleGrade}
      onBulkGrade={handleBulkGrade}
    />
  </div>
);
```

**Notas:**
- Auto-refresh después de calificar para actualizar la lista
- Contador de pendientes calculado localmente desde las entregas

---

## ANALYTICS

### useAnalytics

**Ubicación:** `hooks/useAnalytics.ts`
**Categoría:** Analytics

Obtiene analytics generales de classrooms y métricas de engagement. Incluye generación de reportes.

**Signature:**
```typescript
const {
  analytics,
  engagement,
  loading,
  error,
  generateReport,
  refresh
} = useAnalytics(
  analyticsQuery?: GetAnalyticsQueryDto,
  engagementQuery?: GetEngagementMetricsDto
);
```

**Parámetros:**
| Param | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| analyticsQuery | GetAnalyticsQueryDto | No | Query para analytics generales |
| engagementQuery | GetEngagementMetricsDto | No | Query para métricas de engagement |

**Retorno:**
| Campo | Tipo | Descripción |
|-------|------|-------------|
| analytics | ClassroomAnalytics \| null | Analytics generales |
| engagement | EngagementMetrics \| null | Métricas de engagement |
| loading | boolean | Estado de carga |
| error | Error \| null | Error si ocurrió alguno |
| generateReport | (config) => Promise<Report> | Genera reporte personalizado |
| refresh | () => Promise<void> | Recarga analytics |

**API Consumida:**
- Servicio: analyticsApi
- Endpoints:
  - GET /teacher/analytics/classroom
  - GET /teacher/analytics/engagement
  - POST /teacher/analytics/reports/generate

**Ejemplo de uso:**
```tsx
const {
  analytics,
  engagement,
  loading,
  generateReport
} = useAnalytics();

const handleGenerateReport = async () => {
  const report = await generateReport({
    type: 'classroom',
    format: 'pdf',
    classroom_id: 'classroom-1',
    date_range: { start: '2026-01-01', end: '2026-01-31' }
  });
  downloadReport(report);
};

return (
  <div>
    <AnalyticsChart data={analytics} />
    <EngagementPanel metrics={engagement} />
    <ReportButton onClick={handleGenerateReport} />
  </div>
);
```

**Notas:**
- Fetch paralelo de analytics y engagement
- Soporte para generación de reportes en múltiples formatos

---

### useStudentInsights

**Ubicación:** `hooks/useAnalytics.ts`
**Categoría:** Analytics | Student

Obtiene insights detallados y predicciones para un estudiante individual, incluyendo nivel de riesgo y recomendaciones.

**Signature:**
```typescript
const {
  insights,
  loading,
  error,
  refresh
} = useStudentInsights(studentId: string);
```

**Parámetros:**
| Param | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| studentId | string | Sí | ID del estudiante |

**Retorno:**
| Campo | Tipo | Descripción |
|-------|------|-------------|
| insights | StudentInsights \| null | Insights y predicciones del estudiante |
| loading | boolean | Estado de carga |
| error | Error \| null | Error si ocurrió alguno |
| refresh | () => Promise<void> | Recarga insights |

**API Consumida:**
- Servicio: analyticsApi
- Endpoints:
  - GET /teacher/analytics/students/:id/insights

**Ejemplo de uso:**
```tsx
const { insights, loading, error } = useStudentInsights(studentId);

if (loading) return <Spinner />;
if (error) return <ErrorMessage error={error} />;
if (!insights) return null;

return (
  <div>
    <RiskLevel level={insights.risk_level} />
    <ProgressComparison percentile={insights.comparison_to_class.score_percentile} />
    <StrengthsWeaknesses
      strengths={insights.strengths}
      weaknesses={insights.weaknesses}
    />
    <Predictions
      completionProb={insights.predictions.completion_probability}
      dropoutRisk={insights.predictions.dropout_risk}
    />
    <Recommendations items={insights.recommendations} />
  </div>
);
```

**Notas:**
- Incluye análisis predictivo (completion_probability, dropout_risk)
- Compara rendimiento del estudiante con el resto de la clase (percentil)
- Genera recomendaciones personalizadas

---

## GAMIFICATION

### useMissionStats

**Ubicación:** `hooks/useMissionStats.ts`
**Categoría:** Gamification

Obtiene estadísticas de misiones para uno o múltiples classrooms, incluyendo tasas de completado y participación.

**Signature:**
```typescript
// Single classroom
const {
  stats,
  loading,
  error,
  refresh
} = useMissionStats(classroomId: string);

// Multiple classrooms
const {
  stats,
  loading,
  error,
  refresh
} = useMissionStatsMultiple(classroomIds: string[]);
```

**Parámetros:**
| Param | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| classroomId | string | Sí | ID del classroom (useMissionStats) |
| classroomIds | string[] | Sí | Array de IDs (useMissionStatsMultiple) |

**Retorno:**
| Campo | Tipo | Descripción |
|-------|------|-------------|
| stats | MissionStats \| null | Estadísticas de misiones |
| loading | boolean | Estado de carga |
| error | Error \| null | Error si ocurrió alguno |
| refresh | () => Promise<void> | Recarga estadísticas |

**API Consumida:**
- Servicio: apiClient
- Endpoints:
  - GET /gamification/classrooms/:id/missions

**Ejemplo de uso:**
```tsx
const { stats, loading, error } = useMissionStats(classroomId);

if (loading) return <Spinner />;
if (!stats) return null;

return (
  <div>
    <MissionCounter
      active={stats.activeMissions.length}
      total={stats.totalMissionsAssigned}
    />
    <CompletionRate rate={stats.completionRate} />
    <ParticipationRate rate={stats.participationRate} />
    <TopParticipants students={stats.topParticipants} />
  </div>
);
```

**Notas:**
- P1-06: Creado 2025-12-18
- useMissionStatsMultiple: Fetch paralelo y agregación de múltiples classrooms
- Cálculo de tasas basado en misiones configuradas con fechas límite

---

### useGrantBonus

**Ubicación:** `hooks/useGrantBonus.ts`
**Categoría:** Gamification

Gestiona el otorgamiento manual de ML Coins bonus a estudiantes por rendimiento excepcional.

**Signature:**
```typescript
const {
  loading,
  error,
  success,
  grantBonus,
  reset
} = useGrantBonus();
```

**Retorno:**
| Campo | Tipo | Descripción |
|-------|------|-------------|
| loading | boolean | Si hay una operación en curso |
| error | Error \| null | Error de la última operación |
| success | GrantBonusResponse \| null | Resultado del último otorgamiento exitoso |
| grantBonus | (studentId, amount, reason) => Promise<GrantBonusResponse> | Otorga bonus a un estudiante |
| reset | () => void | Resetea el estado del hook |

**API Consumida:**
- Servicio: bonusCoinsApi
- Endpoints:
  - POST /teacher/gamification/students/:id/grant-bonus

**Ejemplo de uso:**
```tsx
const { grantBonus, loading, error, success, reset } = useGrantBonus();

const handleGrant = async () => {
  try {
    const result = await grantBonus(
      'student-123',
      100,
      'Participación excepcional en clase'
    );
    toast.success(`${result.amountGranted} ML Coins otorgados!`);
  } catch (err) {
    toast.error(err.message);
  }
};

useEffect(() => {
  if (success) {
    // Auto-reset después de 3 segundos
    const timer = setTimeout(reset, 3000);
    return () => clearTimeout(timer);
  }
}, [success, reset]);

return (
  <button onClick={handleGrant} disabled={loading}>
    {loading ? 'Otorgando...' : 'Otorgar Bonus'}
  </button>
);
```

**Notas:**
- Validación: amount entre 1-1000, reason mínimo 10 caracteres
- Actualización optimista no implementada (requiere refresh manual)
- Función reset útil para limpiar estado después de mostrar feedback

---

### useEconomyAnalytics

**Ubicación:** `hooks/useEconomyAnalytics.ts`
**Categoría:** Gamification | Analytics

Obtiene analytics de economía ML Coins: circulación total, balance promedio, distribución, etc.

**Signature:**
```typescript
const {
  data,
  loading,
  error,
  refetch
} = useEconomyAnalytics(classroomId?: string);
```

**Parámetros:**
| Param | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| classroomId | string | No | Filtrar por classroom (omitir para todos) |

**Retorno:**
| Campo | Tipo | Descripción |
|-------|------|-------------|
| data | EconomyAnalytics \| null | Datos de economía |
| loading | boolean | Estado de carga |
| error | Error \| null | Error si ocurrió alguno |
| refetch | () => Promise<void> | Recarga datos |

**API Consumida:**
- Servicio: analyticsApi
- Endpoints:
  - GET /teacher/analytics/economy

**Ejemplo de uso:**
```tsx
const { data, loading, error } = useEconomyAnalytics();

if (loading) return <Spinner />;
if (error) return <ErrorMessage error={error} />;
if (!data) return null;

return (
  <div>
    <h2>Economía ML Coins</h2>
    <p>Circulación Total: {data.total_circulation} ML</p>
    <p>Balance Promedio: {data.average_balance} ML</p>
    <p>Rango: {data.min_balance} - {data.max_balance} ML</p>
  </div>
);
```

**Notas:**
- GAP-ST-005: Endpoint /teacher/analytics/economy
- Incluye métricas agregadas de la economía virtual

---

### useStudentsEconomy

**Ubicación:** `hooks/useStudentsEconomy.ts`
**Categoría:** Gamification | Analytics

Obtiene datos de economía individual de estudiantes: balance, historial de transacciones.

**Signature:**
```typescript
const {
  students,
  total,
  loading,
  error,
  refetch
} = useStudentsEconomy(classroomId?: string);
```

**Parámetros:**
| Param | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| classroomId | string | No | Filtrar por classroom (omitir para todos) |

**Retorno:**
| Campo | Tipo | Descripción |
|-------|------|-------------|
| students | StudentEconomy[] | Lista de estudiantes con datos de economía |
| total | number | Total de estudiantes |
| loading | boolean | Estado de carga |
| error | Error \| null | Error si ocurrió alguno |
| refetch | () => Promise<void> | Recarga datos |

**API Consumida:**
- Servicio: analyticsApi
- Endpoints:
  - GET /teacher/analytics/students-economy

**Ejemplo de uso:**
```tsx
const { students, loading, error } = useStudentsEconomy(classroomId);

if (loading) return <Spinner />;
if (error) return <ErrorMessage error={error} />;

return (
  <ul>
    {students.map(student => (
      <li key={student.id}>
        {student.name}: {student.balance} ML
        <BalanceHistory transactions={student.transactions} />
      </li>
    ))}
  </ul>
);
```

**Notas:**
- GAP-ST-006: Students economy endpoint
- Útil para ver ranking de balances y detectar outliers

---

### useAchievementsStats

**Ubicación:** `hooks/useAchievementsStats.ts`
**Categoría:** Gamification | Analytics

Obtiene estadísticas de achievements: cuántos estudiantes han desbloqueado cada logro.

**Signature:**
```typescript
const {
  achievements,
  totalAchievements,
  totalUnlocks,
  loading,
  error,
  refetch
} = useAchievementsStats(classroomId?: string);
```

**Parámetros:**
| Param | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| classroomId | string | No | Filtrar por classroom (omitir para todos) |

**Retorno:**
| Campo | Tipo | Descripción |
|-------|------|-------------|
| achievements | AchievementStats[] | Lista de achievements con estadísticas |
| totalAchievements | number | Total de achievements disponibles |
| totalUnlocks | number | Total de desbloqueos entre todos los estudiantes |
| loading | boolean | Estado de carga |
| error | Error \| null | Error si ocurrió alguno |
| refetch | () => Promise<void> | Recarga datos |

**API Consumida:**
- Servicio: analyticsApi
- Endpoints:
  - GET /teacher/analytics/achievements

**Ejemplo de uso:**
```tsx
const {
  achievements,
  totalUnlocks,
  loading,
  error
} = useAchievementsStats();

if (loading) return <Spinner />;
if (error) return <ErrorMessage error={error} />;

return (
  <div>
    <h2>Logros</h2>
    <p>Total Desbloqueos: {totalUnlocks}</p>
    <ul>
      {achievements.map(achievement => (
        <li key={achievement.id}>
          {achievement.name}: {achievement.unlocked_count} estudiantes
          <ProgressBar
            value={achievement.unlocked_count}
            max={achievement.total_students}
          />
        </li>
      ))}
    </ul>
  </div>
);
```

**Notas:**
- GAP-ST-007: Achievements stats endpoint
- Permite identificar achievements muy difíciles o muy fáciles

---

## COMMUNICATION

### useTeacherMessages

**Ubicación:** `hooks/useTeacherMessages.ts`
**Categoría:** Communication

Sistema completo de mensajería del portal Teacher: mensajes directos, anuncios a clases, feedback privado.

**Signature:**
```typescript
const {
  messages,
  conversations,
  total,
  unreadCount,
  loading,
  error,
  filters,
  pagination,
  sendMessage,
  sendAnnouncement,
  sendFeedback,
  markAsRead,
  updateFilters,
  nextPage,
  prevPage,
  refresh
} = useTeacherMessages(initialFilters?: MessageFilters);
```

**Parámetros:**
| Param | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| initialFilters | MessageFilters | No | Filtros iniciales opcionales |

**Retorno:**
| Campo | Tipo | Descripción |
|-------|------|-------------|
| messages | Message[] | Lista de mensajes |
| conversations | Conversation[] | Conversaciones agrupadas |
| total | number | Total de mensajes |
| unreadCount | number | Cantidad de no leídos |
| loading | boolean | Estado de carga |
| error | Error \| null | Error si ocurrió alguno |
| filters | MessageFilters | Filtros actuales |
| pagination | PaginationState | Estado de paginación |
| sendMessage | (data) => Promise<Message> | Envía mensaje directo |
| sendAnnouncement | (classroomId, subject, content) => Promise<Message> | Envía anuncio a clase |
| sendFeedback | (studentId, content) => Promise<Message> | Envía feedback privado |
| markAsRead | (messageId) => Promise<void> | Marca mensaje como leído |
| updateFilters | (filters) => void | Actualiza filtros |
| nextPage | () => void | Avanza a siguiente página |
| prevPage | () => void | Retrocede a página anterior |
| refresh | () => void | Recarga todos los datos |

**API Consumida:**
- Servicio: teacherMessagesApi
- Endpoints:
  - GET /teacher/messages
  - GET /teacher/messages/conversations
  - GET /teacher/messages/unread-count
  - POST /teacher/messages/send
  - POST /teacher/messages/classrooms/:id/announce
  - POST /teacher/messages/students/:id/feedback
  - PATCH /teacher/messages/:id/read

**Ejemplo de uso:**
```tsx
const {
  messages,
  unreadCount,
  loading,
  sendMessage,
  markAsRead,
  updateFilters
} = useTeacherMessages({ unread: true });

const handleSend = async () => {
  await sendMessage({
    recipient_ids: ['student-1', 'student-2'],
    subject: 'Consulta',
    content: 'Hola...'
  });
};

const handleMarkRead = async (messageId: string) => {
  await markAsRead(messageId);
};

return (
  <div>
    <UnreadBadge count={unreadCount} />
    <MessageFilters onUpdate={updateFilters} />
    <MessageList
      messages={messages}
      onMarkRead={handleMarkRead}
    />
    <ComposeButton onClick={handleSend} />
  </div>
);
```

**Notas:**
- Actualización optimista al enviar mensajes y marcar como leídos
- Soporte para mensajes directos, anuncios y feedback privado
- Conversaciones agrupadas por participantes

---

### useInterventionAlerts

**Ubicación:** `hooks/useInterventionAlerts.ts`
**Categoría:** Communication | Student

Gestiona alertas de intervención para estudiantes en riesgo o con bajo rendimiento.

**Signature:**
```typescript
const {
  alerts,
  total,
  loading,
  error,
  filters,
  pagination,
  acknowledgeAlert,
  resolveAlert,
  dismissAlert,
  updateFilters,
  nextPage,
  prevPage,
  refresh
} = useInterventionAlerts(initialFilters?: AlertFilters);
```

**Parámetros:**
| Param | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| initialFilters | AlertFilters | No | Filtros iniciales opcionales |

**Retorno:**
| Campo | Tipo | Descripción |
|-------|------|-------------|
| alerts | StudentInterventionAlert[] | Lista de alertas |
| total | number | Total de alertas |
| loading | boolean | Estado de carga |
| error | Error \| null | Error si ocurrió alguno |
| filters | AlertFilters | Filtros actuales |
| pagination | PaginationState | Estado de paginación |
| acknowledgeAlert | (id) => Promise<void> | Reconoce una alerta |
| resolveAlert | (id, notes) => Promise<void> | Resuelve alerta con notas |
| dismissAlert | (id) => Promise<void> | Descarta alerta |
| updateFilters | (filters) => void | Actualiza filtros |
| nextPage | () => void | Avanza a siguiente página |
| prevPage | () => void | Retrocede a página anterior |
| refresh | () => void | Recarga alertas |

**API Consumida:**
- Servicio: interventionAlertsApi
- Endpoints:
  - GET /teacher/alerts/intervention
  - POST /teacher/alerts/:id/acknowledge
  - POST /teacher/alerts/:id/resolve
  - POST /teacher/alerts/:id/dismiss

**Ejemplo de uso:**
```tsx
const {
  alerts,
  loading,
  acknowledgeAlert,
  resolveAlert,
  updateFilters
} = useInterventionAlerts({ severity: 'high' });

const handleResolve = async (alertId: string) => {
  await resolveAlert(
    alertId,
    'Se contactó a los padres y se programó tutoría'
  );
};

return (
  <div>
    <AlertFilters onUpdate={updateFilters} />
    <AlertsList
      alerts={alerts}
      onAcknowledge={acknowledgeAlert}
      onResolve={handleResolve}
    />
  </div>
);
```

**Notas:**
- Actualización optimista para mejora de UX
- Alertas descartadas se filtran automáticamente (include_dismissed: false)
- Tipos de alerta: at_risk, low_performance, inactive, struggling
- Niveles de severidad: low, medium, high

---

## CONTENT MANAGEMENT

### useTeacherContent

**Ubicación:** `hooks/useTeacherContent.ts`
**Categoría:** Content

Sistema completo de gestión de contenido educativo creado por el maestro: ejercicios personalizados, quizzes, etc.

**Signature:**
```typescript
const {
  content,
  total,
  loading,
  error,
  filters,
  pagination,
  fetchContent,
  createContent,
  updateContent,
  deleteContent,
  cloneContent,
  publishContent,
  updateFilters,
  nextPage,
  prevPage,
  refresh,
  clearError
} = useTeacherContent(initialFilters?: ContentFilters);
```

**Parámetros:**
| Param | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| initialFilters | ContentFilters | No | Filtros iniciales opcionales |

**Retorno:**
| Campo | Tipo | Descripción |
|-------|------|-------------|
| content | TeacherContent[] | Lista de contenidos |
| total | number | Total de contenidos |
| loading | boolean | Estado de carga |
| error | Error \| null | Error si ocurrió alguno |
| filters | ContentFilters | Filtros actuales |
| pagination | PaginationState | Estado de paginación |
| fetchContent | () => Promise<void> | Fetch manual de contenidos |
| createContent | (data) => Promise<TeacherContent> | Crea nuevo contenido |
| updateContent | (id, data) => Promise<TeacherContent> | Actualiza contenido |
| deleteContent | (id) => Promise<void> | Elimina contenido (soft delete) |
| cloneContent | (id, title?) => Promise<TeacherContent> | Clona contenido existente |
| publishContent | (id) => Promise<TeacherContent> | Publica contenido (cambia status) |
| updateFilters | (filters) => void | Actualiza filtros |
| nextPage | () => void | Avanza a siguiente página |
| prevPage | () => void | Retrocede a página anterior |
| refresh | () => void | Recarga contenidos |
| clearError | () => void | Limpia mensaje de error |

**API Consumida:**
- Servicio: teacherContentApi
- Endpoints:
  - GET /teacher/content
  - POST /teacher/content
  - PATCH /teacher/content/:id
  - DELETE /teacher/content/:id
  - POST /teacher/content/:id/clone
  - POST /teacher/content/:id/publish

**Ejemplo de uso:**
```tsx
const {
  content,
  loading,
  createContent,
  updateContent,
  cloneContent,
  publishContent,
  updateFilters
} = useTeacherContent({ status: 'draft' });

const handleCreate = async () => {
  await createContent({
    title: 'Nuevo Ejercicio',
    contentType: 'CUSTOM_EXERCISE',
    visibility: 'CLASSROOM',
    content_data: {...}
  });
};

const handleClone = async (id: string) => {
  await cloneContent(id, 'Copia de Ejercicio');
};

const handlePublish = async (id: string) => {
  await publishContent(id);
};

return (
  <div>
    <ContentFilters onUpdate={updateFilters} />
    <ContentList
      items={content}
      onCreate={handleCreate}
      onClone={handleClone}
      onPublish={handlePublish}
    />
  </div>
);
```

**Notas:**
- Actualización optimista al crear, actualizar, clonar y publicar
- Soft delete (no elimina físicamente del sistema)
- Tipos: CUSTOM_EXERCISE, QUIZ, ASSESSMENT, etc.
- Estados: DRAFT, PUBLISHED, ARCHIVED
- Visibilidad: PRIVATE, CLASSROOM, SCHOOL, PUBLIC

---

## MANUAL REVIEWS

### useManualReviews

**Ubicación:** `hooks/useManualReviews.ts`
**Categoría:** Review

Gestiona el flujo completo de revisión manual para ejercicios M3-M5 (Análisis Crítico, Alfabetización Mediática, Producción Textual).

**Signature:**
```typescript
// Lista de reviews pendientes
const { data, isLoading, error, refetch } = useManualReviews(
  filters?: ManualReviewFilters
);

// Mis reviews con filtro de status (TASK-2026-01-18-012)
const { data, isLoading, error } = useMyReviews(
  filters?: MyReviewsFilters
);

// Detalle de una review
const { data, isLoading, error } = useManualReviewDetail(
  reviewId: string | null,
  enabled?: boolean
);

// Iniciar review
const { mutate: startReview, isPending } = useStartReview();

// Actualizar review (guardar progreso)
const { mutate: updateReview, isPending } = useUpdateReview();

// Completar review
const { mutate: completeReview, isPending } = useCompleteReview();
```

**Parámetros:**
| Param | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| filters.exerciseId | string | No | Filtrar por ejercicio |
| filters.moduleId | string | No | Filtrar por módulo |
| filters.classroomId | string | No | Filtrar por classroom |
| filters.status | ReviewStatus | No | Filtrar por status (TASK-2026-01-18-012) |
| reviewId | string \| null | Sí* | ID de la review (*para useManualReviewDetail) |
| enabled | boolean | No | Habilitar query (default: true) |

**Retorno:**
| Campo | Tipo | Descripción |
|-------|------|-------------|
| data | ManualReview[] \| ManualReview | Lista o detalle según el hook |
| isLoading | boolean | Estado de carga |
| isPending | boolean | Si la mutación está en curso |
| error | Error \| null | Error si ocurrió alguno |
| refetch | () => void | Refetch manual (solo en useManualReviews) |
| mutate | Function | Función de mutación |

**API Consumida:**
- Servicio: manualReviewApi
- Endpoints:
  - GET /teacher/reviews/pending
  - GET /teacher/reviews/my-reviews (TASK-2026-01-18-012)
  - GET /teacher/reviews/:id
  - POST /teacher/reviews/:id/start
  - PATCH /teacher/reviews/:id
  - POST /teacher/reviews/:id/complete

**Ejemplo de uso:**
```tsx
// Lista de pendientes
const { data: reviews, isLoading } = useManualReviews({
  moduleId: 'module-4'
});

// Iniciar revisión
const { mutate: startReview } = useStartReview();

const handleStart = (reviewId: string) => {
  startReview(reviewId, {
    onSuccess: (review) => navigate(`/teacher/reviews/${review.id}`),
    onError: (error) => toast.error(error.message)
  });
};

// Completar revisión
const { mutate: completeReview } = useCompleteReview();

const handleComplete = () => {
  completeReview({
    reviewId: review.id,
    completion: {
      evaluations: [
        { criterion_id: 'c1', score: 8, feedback: 'Buen análisis' }
      ],
      generalFeedback: 'Excelente trabajo',
      notifyStudent: true
    }
  }, {
    onSuccess: () => {
      toast.success('Revisión completada');
      navigate('/teacher/reviews');
    }
  });
};

// Ver reviews completados (TASK-2026-01-18-012)
const { data: completed } = useMyReviews({ status: 'completed' });

return (
  <div>
    <ReviewList reviews={reviews} onStart={handleStart} />
    <CompletedReviews reviews={completed} />
  </div>
);
```

**Notas:**
- Usa React Query para cache y mutaciones
- TASK-2026-01-18-012: Soporte para ver reviews pendientes, completados o todos
- Invalidación automática de cache después de mutaciones
- staleTime: 2-5 minutos según criticidad
- Notificación opcional al estudiante al completar

---

### useManualReviewConfig

**Ubicación:** `hooks/useManualReviewConfig.ts`
**Categoría:** Review | Configuration

Obtiene configuración dinámica de ejercicios que requieren revisión manual desde el backend.

**Signature:**
```typescript
const { data, isLoading, error } = useManualReviewConfig();
```

**Retorno:**
| Campo | Tipo | Descripción |
|-------|------|-------------|
| data | ManualReviewConfig \| undefined | Configuración de módulos y ejercicios |
| isLoading | boolean | Estado de carga |
| error | Error \| null | Error si ocurrió alguno |

**API Consumida:**
- Servicio: apiClient
- Endpoints:
  - GET /teacher/reviews/config/exercises

**Ejemplo de uso:**
```tsx
const { data, isLoading, error } = useManualReviewConfig();

if (isLoading) return <Spinner />;
if (error) return <ErrorMessage error={error} />;
if (!data) return null;

return (
  <div>
    <h2>Módulos con Revisión Manual</h2>
    <select>
      {data.modules.map(module => (
        <option key={module.id} value={module.id}>
          Módulo {module.number} - {module.name}
        </option>
      ))}
    </select>

    <h2>Ejercicios</h2>
    <ul>
      {data.exercises.map(exercise => (
        <li key={exercise.id}>
          {exercise.title} (Módulo {exercise.moduleNumber})
        </li>
      ))}
    </ul>
  </div>
);
```

**Helper Functions:**
```typescript
// Filtrar ejercicios por módulo
const filtered = filterExercisesByModule(data.exercises, 'module-4');

// Obtener ejercicio por ID
const exercise = getExerciseById(data.exercises, 'exercise-123');
```

**Notas:**
- TASK-2026-01-18-009: REEMPLAZA datos hardcodeados de manualReviewExercises.ts
- Solo devuelve ejercicios con requires_manual_grading = true
- staleTime: 10 minutos (configuración cambia raramente)
- gcTime: 30 minutos
- refetchOnMount: false (usa cache si está disponible)

---

## RESUMEN DE CATEGORIAS

### Dashboard (1 hook)
Dashboard principal con métricas agregadas

### Classroom Management (4 hooks)
Gestión de classrooms, estadísticas agregadas, datos de progreso y monitoreo en tiempo real

### Student Monitoring (3 hooks)
Seguimiento de progreso individual, monitoreo de múltiples estudiantes y tracking de dominio de habilidades

### Assignments & Grading (3 hooks)
Gestión de asignaciones, respuestas de ejercicios y flujo de calificación

### Analytics (2 hooks)
Analytics generales e insights predictivos por estudiante

### Gamification (5 hooks)
Misiones, bonus coins, economía ML, estudiantes economy y achievements

### Communication (2 hooks)
Sistema de mensajería y alertas de intervención

### Content Management (1 hook)
Creación y gestión de contenido educativo personalizado

### Manual Reviews (2 hooks)
Flujo de revisión manual y configuración dinámica

---

## CONVENCIONES

### Nomenclatura
- Hooks siempre con prefijo `use`
- Nombres descriptivos y específicos
- PascalCase para tipos de retorno

### Patrones de Retorno
- `loading`: Estado de carga (boolean)
- `error`: Error si ocurrió alguno (Error | null)
- `refresh`: Función para refetch manual
- `data`: Datos principales del hook

### Gestión de Estado
- Estado local con useState
- Effects con useEffect
- Callbacks memoizados con useCallback
- React Query para cache avanzado (algunos hooks)

### API Communication
- Servicios centralizados (*Api)
- Manejo de errores con try/catch
- Console.error para logging

### Optimistic Updates
- Hooks de escritura implementan actualización optimista cuando es apropiado
- Mejora UX al actualizar estado local inmediatamente

---

## CHANGELOG

### 2026-01-25
- Creación inicial del documento
- Documentación completa de 23 hooks
- Organización por categorías funcionales

---

**Documento generado:** 2026-01-25
**Total de Hooks Documentados:** 23
**Fase:** EXT-001-portal-maestros
**Sistema:** GAMILIT v4.0.0
