# US-ANA-003: Vista de Estudiante Individual

**Épica:** EAI-004 (Analytics Básico)
**Sprint:** Mes 1, Semana 3
**Story Points:** 8 SP
**Presupuesto:** $4,000 MXN
**Prioridad:** Alta (Alcance Inicial)
**Estado:** ✅ Completada (Mes 1)

---

## Descripción

Como profesor, quiero ver el detalle completo del progreso de un estudiante individual para entender qué ha completado, en qué está trabajando, y dónde necesita ayuda.

**Contexto del Alcance Inicial:**

Esta vista proporciona un perfil detallado del estudiante con su progreso por módulo, actividades completadas, y tiempo invertido. Es una vista de solo lectura con información básica. NO incluye análisis de desempeño avanzado, gráficas de tendencias, ni comparativas con otros estudiantes (eso va a EXT-005 Reportes Avanzados).

---

## Criterios de Aceptación

### CA-01: Información del Estudiante
- [ ] Muestra avatar/foto del estudiante
- [ ] Muestra nombre completo del estudiante
- [ ] Muestra nivel actual con icono de insignia
- [ ] Muestra XP total acumulado
- [ ] Muestra progreso general (% completitud)
- [ ] Muestra fecha de última actividad

### CA-02: Progreso por Módulo
- [ ] Lista de todos los módulos asignados a la clase
- [ ] Para cada módulo muestra:
  - Nombre del módulo
  - Porcentaje de completitud
  - Número de actividades completadas / total
  - Estado visual (completado, en progreso, no iniciado)
- [ ] Barra de progreso visual para cada módulo

### CA-03: Actividades Completadas
- [ ] Lista de las últimas 20 actividades completadas
- [ ] Para cada actividad muestra:
  - Nombre de la actividad
  - Módulo al que pertenece
  - Fecha y hora de completado
  - Puntaje/resultado (si aplica)
- [ ] Ordenadas de más reciente a más antigua

### CA-04: Métricas de Tiempo
- [ ] Tiempo total invertido en la plataforma
- [ ] Promedio de tiempo por sesión
- [ ] Número total de sesiones
- [ ] Última sesión (fecha y duración)

### CA-05: Navegación
- [ ] Breadcrumb: Dashboard > Estudiantes > [Nombre del estudiante]
- [ ] Botón "Volver a Estudiantes" (regresa a US-ANA-002)
- [ ] Navegación a siguiente/anterior estudiante (flechas)

### CA-06: Estados de Datos
- [ ] Muestra mensaje si el estudiante no ha iniciado ninguna actividad
- [ ] Muestra placeholder si no hay datos de tiempo
- [ ] Skeleton loaders mientras carga

---

## Especificaciones Técnicas

### Backend

**Endpoint Principal:**
```
GET /api/teacher/student/{studentId}/profile
Query params: ?classroomId=uuid
```

**Response:**
```json
{
  "studentId": "uuid",
  "classroomId": "uuid",
  "profile": {
    "name": "Juan Pérez García",
    "avatarUrl": "/avatars/student-uuid.png",
    "level": 3,
    "xp": 1250,
    "overallProgress": 65.5,
    "lastActivity": "2025-11-01T15:30:00Z"
  },
  "moduleProgress": [
    {
      "moduleId": "module-uuid",
      "moduleName": "Fracciones",
      "progress": 85,
      "completedActivities": 17,
      "totalActivities": 20,
      "status": "in_progress"
    },
    {
      "moduleId": "module-uuid-2",
      "moduleName": "Geometría",
      "progress": 100,
      "completedActivities": 15,
      "totalActivities": 15,
      "status": "completed"
    },
    {
      "moduleId": "module-uuid-3",
      "moduleName": "Álgebra",
      "progress": 0,
      "completedActivities": 0,
      "totalActivities": 18,
      "status": "not_started"
    }
  ],
  "recentActivities": [
    {
      "activityId": "activity-uuid",
      "activityName": "Suma de fracciones con igual denominador",
      "moduleName": "Fracciones",
      "completedAt": "2025-11-01T15:30:00Z",
      "score": 95,
      "xpEarned": 50
    }
  ],
  "timeMetrics": {
    "totalTime": 12600, // segundos
    "averageSessionTime": 1800, // segundos
    "totalSessions": 15,
    "lastSession": {
      "startedAt": "2025-11-01T15:00:00Z",
      "endedAt": "2025-11-01T15:45:00Z",
      "duration": 2700 // segundos
    }
  }
}
```

**Controller:**
```typescript
// TeacherAnalyticsController.ts
@Get('student/:studentId/profile')
async getStudentProfile(
  @Param('studentId') studentId: string,
  @Query('classroomId') classroomId: string,
  @CurrentUser() teacher: User
) {
  return this.analyticsService.getStudentProfile(
    studentId,
    classroomId,
    teacher.id
  );
}
```

**Service:**
```typescript
// TeacherAnalyticsService.ts
async getStudentProfile(
  studentId: string,
  classroomId: string,
  teacherId: string
) {
  // Validar que el profesor tiene acceso al estudiante
  await this.validateTeacherAccessToStudent(classroomId, teacherId, studentId);

  // Obtener perfil del estudiante
  const profile = await this.getStudentBasicProfile(studentId);

  // Obtener progreso por módulo
  const moduleProgress = await this.getStudentModuleProgress(
    studentId,
    classroomId
  );

  // Obtener actividades recientes (últimas 20)
  const recentActivities = await this.getStudentRecentActivities(
    studentId,
    20
  );

  // Obtener métricas de tiempo
  const timeMetrics = await this.getStudentTimeMetrics(studentId);

  return {
    studentId,
    classroomId,
    profile,
    moduleProgress,
    recentActivities,
    timeMetrics
  };
}

private async getStudentModuleProgress(
  studentId: string,
  classroomId: string
) {
  // Obtener módulos asignados a la clase
  const assignedModules = await this.classroomService.getAssignedModules(
    classroomId
  );

  // Para cada módulo, calcular progreso del estudiante
  return Promise.all(
    assignedModules.map(async (module) => {
      const progress = await this.calculateModuleProgress(
        studentId,
        module.id
      );
      return {
        moduleId: module.id,
        moduleName: module.name,
        progress: progress.percentage,
        completedActivities: progress.completed,
        totalActivities: progress.total,
        status: this.getModuleStatus(progress.percentage)
      };
    })
  );
}

private getModuleStatus(progress: number): string {
  if (progress === 0) return 'not_started';
  if (progress === 100) return 'completed';
  return 'in_progress';
}
```

### Frontend

**Ruta:**
```
/teacher/student/:studentId?classroomId=:classroomId
```

**Componente Principal:**
```typescript
// StudentProfileView.tsx
export const StudentProfileView = () => {
  const { studentId } = useParams();
  const [searchParams] = useSearchParams();
  const classroomId = searchParams.get('classroomId');

  const { profileData, isLoading } = useStudentProfile(studentId, classroomId);

  if (isLoading) return <ProfileSkeleton />;

  return (
    <div className="student-profile-container">
      <Breadcrumb>
        <BreadcrumbItem to="/teacher/dashboard">Dashboard</BreadcrumbItem>
        <BreadcrumbItem to={`/teacher/classroom/${classroomId}/students`}>
          Estudiantes
        </BreadcrumbItem>
        <BreadcrumbItem active>{profileData.profile.name}</BreadcrumbItem>
      </Breadcrumb>

      <ProfileHeader profile={profileData.profile} />

      <StudentNavigation
        studentId={studentId}
        classroomId={classroomId}
      />

      <ModuleProgressSection
        modules={profileData.moduleProgress}
      />

      <TimeMetricsSection
        metrics={profileData.timeMetrics}
      />

      <RecentActivitiesSection
        activities={profileData.recentActivities}
      />
    </div>
  );
};
```

**Componente de Header:**
```typescript
// ProfileHeader.tsx
export const ProfileHeader = ({ profile }) => {
  return (
    <div className="profile-header">
      <Avatar src={profile.avatarUrl} size="large" />
      <div className="profile-info">
        <h1>{profile.name}</h1>
        <div className="profile-stats">
          <StatCard
            icon={<LevelBadge level={profile.level} />}
            label="Nivel"
            value={profile.level}
          />
          <StatCard
            icon={<XPIcon />}
            label="XP Total"
            value={profile.xp}
          />
          <StatCard
            icon={<ProgressIcon />}
            label="Progreso"
            value={`${profile.overallProgress}%`}
          />
          <StatCard
            icon={<ClockIcon />}
            label="Última Actividad"
            value={formatRelativeTime(profile.lastActivity)}
          />
        </div>
      </div>
    </div>
  );
};
```

**Componente de Progreso por Módulo:**
```typescript
// ModuleProgressSection.tsx
export const ModuleProgressSection = ({ modules }) => {
  return (
    <section className="module-progress-section">
      <h2>Progreso por Módulo</h2>
      <div className="module-list">
        {modules.map(module => (
          <ModuleProgressCard key={module.moduleId} module={module} />
        ))}
      </div>
    </section>
  );
};

const ModuleProgressCard = ({ module }) => {
  const statusColor = {
    completed: 'green',
    in_progress: 'yellow',
    not_started: 'gray'
  }[module.status];

  return (
    <div className={`module-card status-${statusColor}`}>
      <div className="module-header">
        <h3>{module.moduleName}</h3>
        <StatusBadge status={module.status} />
      </div>
      <ProgressBar
        percentage={module.progress}
        color={statusColor}
      />
      <div className="module-stats">
        <span>{module.completedActivities} / {module.totalActivities} actividades</span>
        <span>{module.progress}%</span>
      </div>
    </div>
  );
};
```

**Componente de Actividades Recientes:**
```typescript
// RecentActivitiesSection.tsx
export const RecentActivitiesSection = ({ activities }) => {
  if (activities.length === 0) {
    return (
      <section className="recent-activities-section">
        <h2>Actividades Completadas</h2>
        <EmptyState message="El estudiante aún no ha completado actividades" />
      </section>
    );
  }

  return (
    <section className="recent-activities-section">
      <h2>Actividades Completadas (Últimas 20)</h2>
      <ActivityTimeline activities={activities} />
    </section>
  );
};

const ActivityTimeline = ({ activities }) => {
  return (
    <div className="activity-timeline">
      {activities.map(activity => (
        <ActivityItem key={activity.activityId} activity={activity} />
      ))}
    </div>
  );
};

const ActivityItem = ({ activity }) => {
  return (
    <div className="activity-item">
      <div className="activity-icon">✓</div>
      <div className="activity-content">
        <h4>{activity.activityName}</h4>
        <p className="activity-module">{activity.moduleName}</p>
        <div className="activity-meta">
          <span>{formatRelativeTime(activity.completedAt)}</span>
          {activity.score && <span>Puntaje: {activity.score}%</span>}
          <span className="xp-earned">+{activity.xpEarned} XP</span>
        </div>
      </div>
    </div>
  );
};
```

**Componente de Métricas de Tiempo:**
```typescript
// TimeMetricsSection.tsx
export const TimeMetricsSection = ({ metrics }) => {
  return (
    <section className="time-metrics-section">
      <h2>Métricas de Tiempo</h2>
      <div className="metrics-grid">
        <MetricCard
          label="Tiempo Total"
          value={formatDuration(metrics.totalTime)}
          icon={<ClockIcon />}
        />
        <MetricCard
          label="Promedio por Sesión"
          value={formatDuration(metrics.averageSessionTime)}
          icon={<AvgIcon />}
        />
        <MetricCard
          label="Total de Sesiones"
          value={metrics.totalSessions}
          icon={<SessionIcon />}
        />
        {metrics.lastSession && (
          <MetricCard
            label="Última Sesión"
            value={formatRelativeTime(metrics.lastSession.startedAt)}
            subtitle={`Duración: ${formatDuration(metrics.lastSession.duration)}`}
            icon={<CalendarIcon />}
          />
        )}
      </div>
    </section>
  );
};
```

**Hook Custom:**
```typescript
// useStudentProfile.ts
export const useStudentProfile = (studentId: string, classroomId: string) => {
  const [profileData, setProfileData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        const data = await teacherAnalyticsApi.getStudentProfile(
          studentId,
          classroomId
        );
        setProfileData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (studentId && classroomId) {
      fetchProfile();
    }
  }, [studentId, classroomId]);

  return { profileData, isLoading, error };
};
```

---

## Diseño UI/UX

### Layout Desktop
```
+-------------------------------------------------------------------+
|  Dashboard > Estudiantes > Juan Pérez               [← Volver]   |
+-------------------------------------------------------------------+
|  [👤 Avatar]  Juan Pérez García                     [← →]        |
|               Nivel: 🥉 3  |  XP: 1,250  |  Progreso: 65%        |
|               Última actividad: Hace 2 horas                      |
+-------------------------------------------------------------------+
|  📊 Progreso por Módulo                                           |
|  +------------------------+  +------------------------+           |
|  | Fracciones        [●] |  | Geometría        [✓]  |           |
|  | [████████░] 85%       |  | [██████████] 100%     |           |
|  | 17/20 actividades     |  | 15/15 actividades     |           |
|  +------------------------+  +------------------------+           |
|  +------------------------+                                        |
|  | Álgebra           [○] |                                        |
|  | [░░░░░░░░░░] 0%       |                                        |
|  | 0/18 actividades      |                                        |
|  +------------------------+                                        |
+-------------------------------------------------------------------+
|  ⏱️ Métricas de Tiempo                                            |
|  [3h 30m]         [30 min]         [15]           [Hace 2h]      |
|  Tiempo Total     Prom/Sesión      Sesiones       Última Sesión  |
+-------------------------------------------------------------------+
|  ✅ Actividades Completadas (Últimas 20)                          |
|  ✓ Suma de fracciones con igual denominador                      |
|    Fracciones • Hace 2 horas • Puntaje: 95% • +50 XP            |
|  ✓ Identificación de ángulos                                     |
|    Geometría • Hace 5 horas • Puntaje: 88% • +45 XP             |
|  ...                                                               |
+-------------------------------------------------------------------+
```

### Consideraciones Mobile
- Header con avatar colapsado
- Cards de módulos en lista vertical
- Métricas de tiempo en grid 2x2
- Timeline de actividades en scroll vertical

---

## Alcance Básico vs Extensiones

### EAI-004 (Este alcance - Analytics Básico):
- ✅ Vista de perfil básico con métricas actuales
- ✅ Progreso por módulo (% y actividades)
- ✅ Lista de actividades completadas (últimas 20)
- ✅ Métricas de tiempo básicas (total, promedio, sesiones)
- ✅ Vista de solo lectura
- ✅ Sin comparativas ni gráficas de tendencia

### EXT-005 (Extensión futura - Reportes Avanzados):
- ⏳ Gráficas de tendencia (progreso a lo largo del tiempo)
- ⏳ Comparación con promedio de la clase
- ⏳ Análisis de desempeño por tipo de actividad
- ⏳ Predicción de completitud (ML)
- ⏳ Alertas personalizadas para el estudiante
- ⏳ Exportación de perfil a PDF
- ⏳ Historial completo de actividades (paginado)
- ⏳ Análisis de patrones de aprendizaje
- ⏳ Recomendaciones personalizadas
- ⏳ Vista de fortalezas y debilidades

---

## Dependencias

### Dependencias Técnicas:
- **Backend:** Modelo de Student, Module, Activity, Session
- **Backend:** Sistema de tracking de tiempo (sesiones)
- **Frontend:** Componentes de timeline
- **Frontend:** Utilidades de formateo de tiempo

### Dependencias de User Stories:
- US-ANA-002 (para navegación desde lista de estudiantes)

---

## Pruebas

### Pruebas Unitarias:
- [ ] `getStudentModuleProgress` calcula progreso correcto para cada módulo
- [ ] `getModuleStatus` retorna estado correcto según %
- [ ] `formatDuration` formatea segundos correctamente
- [ ] Componentes manejan datos vacíos correctamente

### Pruebas de Integración:
- [ ] Endpoint retorna datos completos del estudiante
- [ ] Endpoint valida acceso del profesor
- [ ] Endpoint retorna 403 si profesor no tiene acceso
- [ ] Endpoint retorna 404 si estudiante no existe

### Pruebas E2E:
- [ ] Profesor ve perfil completo del estudiante
- [ ] Progreso por módulo muestra datos correctos
- [ ] Actividades recientes se muestran en orden
- [ ] Navegación anterior/siguiente funciona
- [ ] Breadcrumb permite regresar a lista

---

## Notas de Implementación

1. **Performance:**
   - Cachear perfil del estudiante por 2 minutos
   - Query con joins optimizados
   - Limitar actividades recientes a 20 (paginación futura en EXT-005)

2. **UX:**
   - Skeleton loader con estructura similar al contenido real
   - Empty states amigables para estudiantes sin actividad
   - Formateo de tiempo relativo (hace X horas/días)

3. **Navegación:**
   - Flechas anterior/siguiente usan orden de US-ANA-002
   - Mantener filtros de búsqueda al navegar

4. **Accesibilidad:**
   - H1 con nombre del estudiante
   - Landmarks semánticos (section)
   - Texto alternativo en barras de progreso

---

## Estimación de Esfuerzo

**Backend:** 3 SP
- Endpoint con agregaciones de progreso
- Cálculo de métricas de tiempo
- Queries optimizados

**Frontend:** 4 SP
- Vista de perfil con múltiples secciones
- Componentes de timeline
- Navegación entre estudiantes

**Testing:** 1 SP

**Total:** 8 SP = $4,000 MXN
