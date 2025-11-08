# US-ADM-007: Vista de Actividad de Aula

**Épica:** EAI-005 (Plataforma de Maestro Básica)
**Sprint:** Mes 1, Semana 3
**Story Points:** 6 SP
**Presupuesto:** $2,400 MXN
**Prioridad:** Alta (Alcance Inicial)
**Estado:** ✅ Completada (Mes 1)

---

## Descripción

Como profesor, quiero ver un resumen de la actividad reciente de mi aula para saber qué estudiantes están activos, qué módulos están usando, y tener una vista rápida del pulso de la clase.

**Contexto del Alcance Inicial:**

Esta vista proporciona un snapshot básico de la actividad del aula en tiempo casi real: estudiantes activos hoy, módulos en progreso, y últimas actividades completadas. NO incluye análisis de patrones, heatmaps de actividad, ni métricas de engagement avanzadas (eso va a US-ANA-005 Tracking de Actividad dentro de EAI-004, y análisis más profundos en EXT-005 Reportes Avanzados).

---

## Criterios de Aceptación

### CA-01: Estudiantes Activos Hoy
- [ ] Card/widget que muestra:
  - # de estudiantes activos HOY (que han completado al menos una actividad)
  - Lista de avatares de estudiantes activos
  - % de estudiantes activos vs total del aula

### CA-02: Módulos en Progreso
- [ ] Lista de módulos que tienen actividad reciente (últimos 7 días)
- [ ] Para cada módulo muestra:
  - Nombre del módulo
  - # de estudiantes trabajando en él
  - Progreso promedio del módulo

### CA-03: Últimas Actividades
- [ ] Feed de las últimas 10 actividades completadas en el aula
- [ ] Para cada actividad muestra:
  - Estudiante (avatar + nombre)
  - Actividad completada
  - Módulo
  - Timestamp (relativo: "hace 5 min")
- [ ] Link rápido a perfil del estudiante

### CA-04: Refresh Automático
- [ ] Vista se actualiza automáticamente cada 2 minutos
- [ ] Indicador de última actualización
- [ ] Botón manual de refresh

### CA-05: Integración con Dashboard
- [ ] Esta vista es parte del dashboard del aula (accesible desde US-ANA-001)
- [ ] O puede ser una pestaña/sección dentro del dashboard del aula

---

## Especificaciones Técnicas

### Backend

**Endpoint:**

```typescript
// Actividad del aula
GET /api/teacher/classrooms/{classroomId}/activity-summary
```

**Response:**
```json
{
  "classroomId": "uuid",
  "timestamp": "2025-11-02T14:30:00Z",
  "activeStudentsToday": {
    "count": 12,
    "total": 25,
    "percentage": 48,
    "students": [
      {
        "id": "student-uuid",
        "name": "Juan Pérez",
        "avatarUrl": "/avatars/student.png"
      }
    ]
  },
  "modulesInProgress": [
    {
      "moduleId": "module-uuid",
      "moduleName": "Fracciones",
      "studentsWorking": 8,
      "averageProgress": 65.5
    }
  ],
  "recentActivities": [
    {
      "id": "activity-uuid",
      "student": {
        "id": "student-uuid",
        "name": "Juan Pérez",
        "avatarUrl": "/avatars/student.png"
      },
      "activity": {
        "name": "Suma de fracciones",
        "moduleName": "Fracciones"
      },
      "completedAt": "2025-11-02T14:25:00Z"
    }
  ]
}
```

**Controller:**
```typescript
@Get('classrooms/:classroomId/activity-summary')
async getActivitySummary(
  @Param('classroomId') classroomId: string,
  @CurrentUser() teacher: User
) {
  return this.classroomService.getActivitySummary(classroomId, teacher.id);
}
```

**Service:**
```typescript
async getActivitySummary(classroomId: string, teacherId: string) {
  await this.validateTeacherAccess(classroomId, teacherId);

  const today = startOfDay(new Date());

  // Estudiantes activos hoy
  const activeStudentsToday = await this.getActiveStudentsToday(
    classroomId,
    today
  );

  // Módulos en progreso (con actividad en últimos 7 días)
  const modulesInProgress = await this.getModulesInProgress(
    classroomId,
    subDays(new Date(), 7)
  );

  // Últimas actividades (últimas 10)
  const recentActivities = await this.getRecentActivities(classroomId, 10);

  return {
    classroomId,
    timestamp: new Date().toISOString(),
    activeStudentsToday,
    modulesInProgress,
    recentActivities
  };
}

private async getActiveStudentsToday(classroomId: string, today: Date) {
  const students = await this.activityLogRepository
    .createQueryBuilder('log')
    .innerJoinAndSelect('log.student', 'student')
    .where('log.classroomId = :classroomId', { classroomId })
    .andWhere('log.timestamp >= :today', { today })
    .groupBy('student.id')
    .select(['student.id', 'student.name', 'student.avatarUrl'])
    .getMany();

  const totalStudents = await this.getStudentCount(classroomId);

  return {
    count: students.length,
    total: totalStudents,
    percentage: totalStudents > 0
      ? Math.round((students.length / totalStudents) * 100)
      : 0,
    students: students.map(s => s.student)
  };
}

private async getModulesInProgress(classroomId: string, since: Date) {
  const modules = await this.activityLogRepository
    .createQueryBuilder('log')
    .innerJoin('log.module', 'module')
    .where('log.classroomId = :classroomId', { classroomId })
    .andWhere('log.timestamp >= :since', { since })
    .groupBy('module.id')
    .select([
      'module.id',
      'module.name',
      'COUNT(DISTINCT log.studentId) as studentsWorking'
    ])
    .getRawMany();

  const modulesWithProgress = await Promise.all(
    modules.map(async (m) => {
      const avgProgress = await this.getModuleAverageProgress(
        classroomId,
        m.module_id
      );
      return {
        moduleId: m.module_id,
        moduleName: m.module_name,
        studentsWorking: parseInt(m.studentsWorking),
        averageProgress: avgProgress
      };
    })
  );

  return modulesWithProgress;
}

private async getRecentActivities(classroomId: string, limit: number) {
  const activities = await this.activityLogRepository
    .createQueryBuilder('log')
    .innerJoinAndSelect('log.student', 'student')
    .innerJoinAndSelect('log.activity', 'activity')
    .innerJoinAndSelect('log.module', 'module')
    .where('log.classroomId = :classroomId', { classroomId })
    .andWhere('log.type = :type', { type: 'activity_completed' })
    .orderBy('log.timestamp', 'DESC')
    .limit(limit)
    .getMany();

  return activities.map(log => ({
    id: log.id,
    student: {
      id: log.student.id,
      name: log.student.name,
      avatarUrl: log.student.avatarUrl
    },
    activity: {
      name: log.activity.name,
      moduleName: log.module.name
    },
    completedAt: log.timestamp
  }));
}
```

### Frontend

**Ruta:**
```
/teacher/classroom/:classroomId/activity
(Puede ser parte de /teacher/classroom/:classroomId/dashboard)
```

**Componente Principal:**
```typescript
// ClassroomActivityView.tsx
export const ClassroomActivityView = () => {
  const { classroomId } = useParams();
  const { activityData, isLoading, refetch } = useClassroomActivity(classroomId);

  // Auto-refresh cada 2 minutos
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 120000); // 2 minutos

    return () => clearInterval(interval);
  }, [refetch]);

  if (isLoading) return <ActivitySkeleton />;

  return (
    <div className="classroom-activity-container">
      <PageHeader
        title="Actividad del Aula"
        action={
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">
              Última actualización: {formatRelativeTime(activityData.timestamp)}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={refetch}
              leftIcon={<RefreshIcon />}
            >
              Actualizar
            </Button>
          </div>
        }
      />

      <div className="activity-grid">
        <ActiveStudentsCard data={activityData.activeStudentsToday} />
        <ModulesInProgressCard modules={activityData.modulesInProgress} />
        <RecentActivitiesCard activities={activityData.recentActivities} />
      </div>
    </div>
  );
};
```

**Card de Estudiantes Activos:**
```typescript
// ActiveStudentsCard.tsx
export const ActiveStudentsCard = ({ data }) => {
  return (
    <Card className="active-students-card">
      <CardHeader>
        <h3>Estudiantes Activos Hoy</h3>
        <Badge color="green" size="lg">
          {data.count} / {data.total} ({data.percentage}%)
        </Badge>
      </CardHeader>

      <CardBody>
        {data.students.length > 0 ? (
          <>
            <div className="student-avatars">
              {data.students.map(student => (
                <Avatar
                  key={student.id}
                  src={student.avatarUrl}
                  alt={student.name}
                  size="md"
                  tooltip={student.name}
                />
              ))}
            </div>
            <div className="progress-bar-section">
              <ProgressBar
                percentage={data.percentage}
                color="green"
                label={`${data.percentage}% de la clase activa`}
              />
            </div>
          </>
        ) : (
          <EmptyState
            message="Ningún estudiante activo hoy"
            icon={<InactiveIcon />}
          />
        )}
      </CardBody>
    </Card>
  );
};
```

**Card de Módulos en Progreso:**
```typescript
// ModulesInProgressCard.tsx
export const ModulesInProgressCard = ({ modules }) => {
  return (
    <Card className="modules-in-progress-card">
      <CardHeader>
        <h3>Módulos en Progreso</h3>
        <span className="text-sm text-gray-500">Últimos 7 días</span>
      </CardHeader>

      <CardBody>
        {modules.length > 0 ? (
          <div className="modules-list">
            {modules.map(module => (
              <ModuleProgressItem key={module.moduleId} module={module} />
            ))}
          </div>
        ) : (
          <EmptyState message="No hay módulos en progreso" />
        )}
      </CardBody>
    </Card>
  );
};

const ModuleProgressItem = ({ module }) => {
  return (
    <div className="module-progress-item">
      <div className="module-info">
        <h4>{module.moduleName}</h4>
        <span className="students-count">
          {module.studentsWorking} estudiante{module.studentsWorking !== 1 ? 's' : ''} trabajando
        </span>
      </div>
      <div className="module-progress">
        <ProgressBar
          percentage={module.averageProgress}
          size="sm"
          showLabel
        />
      </div>
    </div>
  );
};
```

**Card de Actividades Recientes:**
```typescript
// RecentActivitiesCard.tsx
export const RecentActivitiesCard = ({ activities }) => {
  return (
    <Card className="recent-activities-card">
      <CardHeader>
        <h3>Últimas Actividades</h3>
      </CardHeader>

      <CardBody>
        {activities.length > 0 ? (
          <div className="activities-feed">
            {activities.map(activity => (
              <ActivityItem key={activity.id} activity={activity} />
            ))}
          </div>
        ) : (
          <EmptyState message="No hay actividades recientes" />
        )}
      </CardBody>
    </Card>
  );
};

const ActivityItem = ({ activity }) => {
  return (
    <div className="activity-item">
      <Avatar
        src={activity.student.avatarUrl}
        alt={activity.student.name}
        size="sm"
      />
      <div className="activity-content">
        <p className="activity-text">
          <strong>{activity.student.name}</strong> completó{' '}
          <em>{activity.activity.name}</em> en{' '}
          <span className="module-name">{activity.activity.moduleName}</span>
        </p>
        <span className="activity-time">
          {formatRelativeTime(activity.completedAt)}
        </span>
      </div>
    </div>
  );
};
```

**Hook Custom:**
```typescript
// useClassroomActivity.ts
export const useClassroomActivity = (classroomId: string) => {
  const [activityData, setActivityData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchActivity = async () => {
    setIsLoading(true);
    try {
      const data = await teacherApi.getClassroomActivity(classroomId);
      setActivityData(data);
    } catch (error) {
      console.error('Error fetching activity:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchActivity();
  }, [classroomId]);

  return {
    activityData,
    isLoading,
    refetch: fetchActivity
  };
};
```

---

## Diseño UI/UX

### Layout Desktop
```
+-------------------------------------------------------------------+
|  Actividad del Aula                  Última actualización: hace  |
|                                      2 min [🔄 Actualizar]        |
+-------------------------------------------------------------------+
|  +---------------------------+  +-----------------------------+  |
|  | ESTUDIANTES ACTIVOS HOY   |  | MÓDULOS EN PROGRESO         |  |
|  | 12 / 25 (48%)             |  | Últimos 7 días              |  |
|  |                           |  |                             |  |
|  | [👤][👤][👤][👤][👤]    |  | Fracciones                  |  |
|  | [👤][👤][👤][👤][👤]    |  | 8 estudiantes trabajando    |  |
|  | [👤][👤]                  |  | [████████░] 65%             |  |
|  |                           |  |                             |  |
|  | [████████░░░] 48%         |  | Geometría                   |  |
|  |                           |  | 5 estudiantes trabajando    |  |
|  +---------------------------+  | [██████░░░] 58%             |  |
|                                  +-----------------------------+  |
|  +---------------------------------------------------------------+ |
|  | ÚLTIMAS ACTIVIDADES                                           | |
|  | [👤] Juan Pérez completó "Suma de fracciones" en Fracciones  | |
|  |      hace 5 minutos                                           | |
|  | [👤] Ana López completó "Ángulos rectos" en Geometría        | |
|  |      hace 10 minutos                                          | |
|  | [👤] Carlos Gómez completó "División básica" en Fracciones   | |
|  |      hace 15 minutos                                          | |
|  +---------------------------------------------------------------+ |
+-------------------------------------------------------------------+
```

---

## Alcance Básico vs Extensiones

### EAI-005 (Este alcance - Admin Base):
- ✅ Estudiantes activos hoy (snapshot)
- ✅ Módulos en progreso (últimos 7 días)
- ✅ Últimas 10 actividades
- ✅ Auto-refresh cada 2 minutos
- ✅ Vista simple sin filtros

### US-ANA-005 (Tracking de Actividad - parte de EAI-004):
- ⏳ Timeline completo con paginación
- ⏳ Filtros por fecha, estudiante, tipo
- ⏳ Todas las actividades (no solo completadas)

### EXT-005 (Extensión futura - Reportes Avanzados):
- ⏳ Heatmap de actividad por hora/día
- ⏳ Análisis de patrones (horarios pico)
- ⏳ Métricas de engagement
- ⏳ Comparativas de actividad entre períodos
- ⏳ Real-time con WebSockets

---

## Dependencias

### Dependencias de User Stories:
- EAI-002 (actividades que generan logs)
- US-ANA-005 (comparte lógica de activity logs)

---

## Pruebas

### Pruebas Unitarias:
- [ ] `getActiveStudentsToday` cuenta correctamente
- [ ] `getModulesInProgress` filtra por fecha correcta
- [ ] `getRecentActivities` retorna últimas 10

### Pruebas de Integración:
- [ ] Endpoint retorna datos correctos
- [ ] % se calcula correctamente

### Pruebas E2E:
- [ ] Profesor ve actividad del aula
- [ ] Auto-refresh funciona
- [ ] Datos se actualizan en tiempo real

---

## Notas de Implementación

1. **Performance:**
   - Cachear por 1-2 minutos (no crítico)
   - Query optimizado con joins

2. **UX:**
   - Auto-refresh subtle (sin flash)
   - Indicador de última actualización
   - Smooth transitions

3. **Diferencia con US-ANA-005:**
   - Esta US: snapshot básico del aula
   - US-ANA-005: tracking completo con filtros y paginación

---

## Estimación de Esfuerzo

**Backend:** 2 SP (usa lógica similar a US-ANA-005)
**Frontend:** 3 SP
**Testing:** 1 SP

**Total:** 6 SP = $2,400 MXN
