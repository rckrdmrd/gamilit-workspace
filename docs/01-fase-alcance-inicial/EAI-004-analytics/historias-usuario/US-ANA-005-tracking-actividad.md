---
id: "US-ANA-005"
title: "Tracking de Actividad"
type: "User Story"
status: "Done"
priority: "Alta"
assignee: "@Backend-Agent, @Frontend-Agent"
epic: "EAI-004"
story_points: 7
budget: "$3,400 MXN"
sprint: "Sprint-1"
labels: ["analytics", "activity-tracking", "timeline"]
created_date: "2025-11-02"
updated_date: "2026-01-04"
---

# US-ANA-005: Tracking de Actividad

**Épica:** EAI-004 (Analytics Básico)
**Sprint:** Mes 1, Semana 3
**Story Points:** 7 SP
**Presupuesto:** $3,400 MXN
**Prioridad:** Alta (Alcance Inicial)
**Estado:** Done

---

## Descripción

Como profesor, quiero ver un timeline de las actividades recientes de mi clase para entender qué estudiantes están activos y qué están haciendo en tiempo casi real.

**Contexto del Alcance Inicial:**

Esta vista proporciona un feed de actividades de la clase con filtrado básico por fecha. Muestra las últimas 50 actividades en formato timeline. NO incluye filtros avanzados por estudiante/módulo, agrupaciones complejas, ni análisis de patrones de actividad (eso va a EXT-005 Reportes Avanzados).

---

## Criterios de Aceptación

### CA-01: Timeline de Actividades
- [ ] Muestra las últimas 50 actividades de la clase
- [ ] Para cada actividad muestra:
  - Avatar del estudiante
  - Nombre del estudiante
  - Tipo de actividad (completada, iniciada, logro desbloqueado)
  - Nombre del módulo
  - Nombre de la actividad
  - Timestamp (fecha/hora relativa)
  - XP ganado (si aplica)
- [ ] Actividades ordenadas de más reciente a más antigua

### CA-02: Filtro por Fecha
- [ ] Selector de rango de fechas básico:
  - Hoy
  - Últimos 7 días (default)
  - Últimos 30 días
  - Todo el tiempo
- [ ] Timeline se actualiza al cambiar el filtro

### CA-03: Tipos de Actividad
- [ ] **Actividad Completada:** estudiante completó una actividad
- [ ] **Módulo Iniciado:** estudiante inició un nuevo módulo
- [ ] **Nivel Alcanzado:** estudiante subió de nivel
- [ ] **Logro Desbloqueado:** estudiante desbloqueó una insignia
- [ ] Cada tipo tiene icono y color distintivo

### CA-04: Indicadores de Actividad
- [ ] Badge que muestra # de estudiantes activos HOY
- [ ] Badge que muestra # de actividades completadas HOY
- [ ] Gráfica simple de actividad por día (últimos 7 días)

### CA-05: Auto-Refresh
- [ ] Timeline se actualiza automáticamente cada 2 minutos
- [ ] Indicador visual de última actualización
- [ ] Botón manual de refresh

### CA-06: Performance
- [ ] Carga inicial en menos de 1 segundo
- [ ] Paginación: cargar más al hacer scroll (load more)
- [ ] Skeleton loaders durante carga

---

## Especificaciones Técnicas

### Backend

**Endpoint Principal:**
```
GET /api/teacher/classroom/{classroomId}/activity-feed
Query params: ?range=7d&limit=50&offset=0
```

**Response:**
```json
{
  "classroomId": "uuid",
  "dateRange": "7d",
  "stats": {
    "activeStudentsToday": 12,
    "activitiesCompletedToday": 45,
    "activityByDay": [
      {"date": "2025-11-02", "count": 45},
      {"date": "2025-11-01", "count": 38},
      {"date": "2025-10-31", "count": 52}
    ]
  },
  "activities": [
    {
      "id": "activity-log-uuid",
      "type": "activity_completed",
      "student": {
        "id": "student-uuid",
        "name": "Juan Pérez",
        "avatarUrl": "/avatars/student.png"
      },
      "module": {
        "id": "module-uuid",
        "name": "Fracciones"
      },
      "activity": {
        "id": "activity-uuid",
        "name": "Suma de fracciones"
      },
      "timestamp": "2025-11-02T10:30:00Z",
      "metadata": {
        "xpEarned": 50,
        "score": 95
      }
    },
    {
      "id": "activity-log-uuid-2",
      "type": "level_up",
      "student": {
        "id": "student-uuid-2",
        "name": "María García",
        "avatarUrl": "/avatars/student2.png"
      },
      "timestamp": "2025-11-02T10:25:00Z",
      "metadata": {
        "newLevel": 4,
        "xpEarned": 100
      }
    },
    {
      "id": "activity-log-uuid-3",
      "type": "achievement_unlocked",
      "student": {
        "id": "student-uuid-3",
        "name": "Carlos López",
        "avatarUrl": "/avatars/student3.png"
      },
      "timestamp": "2025-11-02T10:20:00Z",
      "metadata": {
        "achievementName": "Maestro de Fracciones",
        "achievementIcon": "/icons/achievement.png"
      }
    }
  ],
  "pagination": {
    "limit": 50,
    "offset": 0,
    "hasMore": true
  }
}
```

**Controller:**
```typescript
// TeacherAnalyticsController.ts
@Get('classroom/:classroomId/activity-feed')
async getActivityFeed(
  @Param('classroomId') classroomId: string,
  @Query() query: ActivityFeedQueryDto,
  @CurrentUser() teacher: User
) {
  return this.analyticsService.getActivityFeed(
    classroomId,
    teacher.id,
    query
  );
}
```

**DTO:**
```typescript
// ActivityFeedQueryDto.ts
export class ActivityFeedQueryDto {
  @IsOptional()
  @IsIn(['today', '7d', '30d', 'all'])
  range?: string = '7d';

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 50;

  @IsOptional()
  @IsInt()
  @Min(0)
  offset?: number = 0;
}
```

**Service:**
```typescript
// TeacherAnalyticsService.ts
async getActivityFeed(
  classroomId: string,
  teacherId: string,
  query: ActivityFeedQueryDto
) {
  // Validar acceso
  await this.validateTeacherAccess(classroomId, teacherId);

  // Calcular rango de fechas
  const dateRange = this.calculateDateRange(query.range);

  // Obtener estadísticas del día
  const stats = await this.getActivityStats(classroomId, dateRange);

  // Obtener actividades
  const activities = await this.activityLogRepository
    .createQueryBuilder('log')
    .innerJoinAndSelect('log.student', 'student')
    .leftJoinAndSelect('log.module', 'module')
    .leftJoinAndSelect('log.activity', 'activity')
    .where('log.classroomId = :classroomId', { classroomId })
    .andWhere('log.timestamp >= :startDate', { startDate: dateRange.start })
    .andWhere('log.timestamp <= :endDate', { endDate: dateRange.end })
    .orderBy('log.timestamp', 'DESC')
    .skip(query.offset)
    .take(query.limit)
    .getMany();

  const hasMore = activities.length === query.limit;

  return {
    classroomId,
    dateRange: query.range,
    stats,
    activities: activities.map(log => this.mapActivityLog(log)),
    pagination: {
      limit: query.limit,
      offset: query.offset,
      hasMore
    }
  };
}

private calculateDateRange(range: string) {
  const now = new Date();
  let start: Date;

  switch (range) {
    case 'today':
      start = startOfDay(now);
      break;
    case '7d':
      start = subDays(now, 7);
      break;
    case '30d':
      start = subDays(now, 30);
      break;
    case 'all':
      start = new Date(0); // Desde el inicio
      break;
  }

  return { start, end: now };
}

private async getActivityStats(classroomId: string, dateRange) {
  const today = startOfDay(new Date());

  // Estudiantes activos hoy
  const activeStudentsToday = await this.activityLogRepository
    .createQueryBuilder('log')
    .select('DISTINCT log.studentId')
    .where('log.classroomId = :classroomId', { classroomId })
    .andWhere('log.timestamp >= :today', { today })
    .getCount();

  // Actividades completadas hoy
  const activitiesCompletedToday = await this.activityLogRepository
    .count({
      where: {
        classroomId,
        type: 'activity_completed',
        timestamp: MoreThanOrEqual(today)
      }
    });

  // Actividad por día (últimos 7 días)
  const activityByDay = await this.getActivityByDay(classroomId, 7);

  return {
    activeStudentsToday,
    activitiesCompletedToday,
    activityByDay
  };
}
```

**Modelo de ActivityLog:**
```typescript
// activity-log.entity.ts
@Entity('activity_logs')
export class ActivityLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  type: string; // activity_completed, module_started, level_up, achievement_unlocked

  @ManyToOne(() => Student)
  @JoinColumn({ name: 'student_id' })
  student: Student;

  @Column({ name: 'classroom_id' })
  classroomId: string;

  @ManyToOne(() => Module, { nullable: true })
  @JoinColumn({ name: 'module_id' })
  module?: Module;

  @ManyToOne(() => Activity, { nullable: true })
  @JoinColumn({ name: 'activity_id' })
  activity?: Activity;

  @Column({ type: 'timestamp' })
  timestamp: Date;

  @Column({ type: 'jsonb', nullable: true })
  metadata: any; // xpEarned, score, achievementName, etc.
}
```

### Frontend

**Ruta:**
```
/teacher/classroom/:classroomId/activity
```

**Componente Principal:**
```typescript
// ActivityFeedView.tsx
export const ActivityFeedView = () => {
  const { classroomId } = useParams();
  const [dateRange, setDateRange] = useState('7d');
  const [activities, setActivities] = useState([]);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  const { stats } = useActivityStats(classroomId);

  useEffect(() => {
    loadActivities(0); // Reset al cambiar rango
  }, [dateRange]);

  // Auto-refresh cada 2 minutos
  useEffect(() => {
    const interval = setInterval(() => {
      loadActivities(0);
    }, 120000); // 2 minutos

    return () => clearInterval(interval);
  }, [dateRange]);

  const loadActivities = async (newOffset: number) => {
    setIsLoading(true);
    const data = await fetchActivityFeed(classroomId, {
      range: dateRange,
      offset: newOffset
    });

    if (newOffset === 0) {
      setActivities(data.activities);
    } else {
      setActivities(prev => [...prev, ...data.activities]);
    }

    setOffset(newOffset);
    setHasMore(data.pagination.hasMore);
    setIsLoading(false);
  };

  const loadMore = () => {
    if (hasMore && !isLoading) {
      loadActivities(offset + 50);
    }
  };

  return (
    <div className="activity-feed-container">
      <ActivityHeader
        stats={stats}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        onRefresh={() => loadActivities(0)}
      />

      <ActivityChart data={stats?.activityByDay} />

      <ActivityTimeline
        activities={activities}
        isLoading={isLoading}
        onLoadMore={loadMore}
        hasMore={hasMore}
      />
    </div>
  );
};
```

**Componente de Header:**
```typescript
// ActivityHeader.tsx
export const ActivityHeader = ({ stats, dateRange, onDateRangeChange, onRefresh }) => {
  return (
    <div className="activity-header">
      <div className="stats-badges">
        <Badge color="green" size="lg">
          {stats?.activeStudentsToday} estudiantes activos hoy
        </Badge>
        <Badge color="blue" size="lg">
          {stats?.activitiesCompletedToday} actividades completadas hoy
        </Badge>
      </div>

      <div className="controls">
        <Select
          value={dateRange}
          onChange={(e) => onDateRangeChange(e.target.value)}
          options={[
            { value: 'today', label: 'Hoy' },
            { value: '7d', label: 'Últimos 7 días' },
            { value: '30d', label: 'Últimos 30 días' },
            { value: 'all', label: 'Todo el tiempo' }
          ]}
        />
        <Button
          onClick={onRefresh}
          variant="ghost"
          leftIcon={<RefreshIcon />}
        >
          Actualizar
        </Button>
      </div>
    </div>
  );
};
```

**Componente de Timeline:**
```typescript
// ActivityTimeline.tsx
export const ActivityTimeline = ({ activities, isLoading, onLoadMore, hasMore }) => {
  if (isLoading && activities.length === 0) {
    return <TimelineSkeleton />;
  }

  if (activities.length === 0) {
    return <EmptyState message="No hay actividades en este período" />;
  }

  return (
    <div className="activity-timeline">
      {activities.map((activity, index) => (
        <ActivityItem
          key={activity.id}
          activity={activity}
          isFirst={index === 0}
        />
      ))}

      {hasMore && (
        <Button
          onClick={onLoadMore}
          disabled={isLoading}
          fullWidth
          variant="outline"
        >
          {isLoading ? 'Cargando...' : 'Cargar más'}
        </Button>
      )}
    </div>
  );
};
```

**Componente de Item:**
```typescript
// ActivityItem.tsx
export const ActivityItem = ({ activity, isFirst }) => {
  const config = getActivityConfig(activity.type);

  return (
    <div className={`activity-item ${isFirst ? 'highlight' : ''}`}>
      <div className="activity-icon" style={{ backgroundColor: config.color }}>
        {config.icon}
      </div>

      <div className="activity-content">
        <div className="activity-header">
          <Avatar src={activity.student.avatarUrl} size="sm" />
          <span className="student-name">{activity.student.name}</span>
          <span className="activity-time">{formatRelativeTime(activity.timestamp)}</span>
        </div>

        <div className="activity-description">
          {renderActivityDescription(activity)}
        </div>

        {activity.metadata?.xpEarned && (
          <Badge color="gold" size="sm">
            +{activity.metadata.xpEarned} XP
          </Badge>
        )}
      </div>
    </div>
  );
};

function getActivityConfig(type: string) {
  const configs = {
    activity_completed: {
      icon: <CheckIcon />,
      color: '#10b981',
      label: 'completó'
    },
    module_started: {
      icon: <PlayIcon />,
      color: '#3b82f6',
      label: 'inició'
    },
    level_up: {
      icon: <TrophyIcon />,
      color: '#f59e0b',
      label: 'subió a nivel'
    },
    achievement_unlocked: {
      icon: <StarIcon />,
      color: '#8b5cf6',
      label: 'desbloqueó'
    }
  };

  return configs[type] || configs.activity_completed;
}

function renderActivityDescription(activity) {
  switch (activity.type) {
    case 'activity_completed':
      return (
        <>
          completó <strong>{activity.activity.name}</strong> en{' '}
          <em>{activity.module.name}</em>
          {activity.metadata?.score && (
            <> con {activity.metadata.score}%</>
          )}
        </>
      );
    case 'module_started':
      return (
        <>
          inició el módulo <strong>{activity.module.name}</strong>
        </>
      );
    case 'level_up':
      return (
        <>
          subió a <strong>Nivel {activity.metadata.newLevel}</strong>
        </>
      );
    case 'achievement_unlocked':
      return (
        <>
          desbloqueó el logro <strong>{activity.metadata.achievementName}</strong>
        </>
      );
    default:
      return null;
  }
}
```

---

## Diseño UI/UX

### Layout Desktop
```
+-------------------------------------------------------------------+
|  📊 Actividad de la Clase                         [🔄 Actualizar]|
+-------------------------------------------------------------------+
|  [12 estudiantes activos hoy]  [45 actividades completadas hoy]  |
+-------------------------------------------------------------------+
|  Filtro: [Últimos 7 días ▼]                                      |
+-------------------------------------------------------------------+
|  [Gráfica de barras simple: actividad por día]                   |
+-------------------------------------------------------------------+
|  TIMELINE                                                         |
|  +-------------------------------------------------------------+  |
|  | ✓ [👤] Juan Pérez completó "Suma de fracciones"            |  |
|  |    Fracciones • Hace 5 minutos • +50 XP                    |  |
|  +-------------------------------------------------------------+  |
|  | 🏆 [👤] María García subió a Nivel 4                       |  |
|  |    Hace 10 minutos • +100 XP                                |  |
|  +-------------------------------------------------------------+  |
|  | ⭐ [👤] Carlos López desbloqueó "Maestro de Fracciones"    |  |
|  |    Hace 15 minutos                                          |  |
|  +-------------------------------------------------------------+  |
|  | ▶️ [👤] Ana Martínez inició "Geometría"                   |  |
|  |    Hace 20 minutos                                          |  |
|  +-------------------------------------------------------------+  |
|                                                                    |
|                     [Cargar más actividades]                      |
+-------------------------------------------------------------------+
```

---

## Alcance Básico vs Extensiones

### EAI-004 (Este alcance - Analytics Básico):
- Timeline de últimas 50 actividades
- Filtro simple por rango de fechas (today, 7d, 30d, all)
- Auto-refresh cada 2 minutos
- Estadísticas básicas del día
- Paginación con "Cargar más"
- 4 tipos de actividad básicos

### EXT-005 (Extensión futura - Reportes Avanzados):
- Filtros avanzados (por estudiante, módulo, tipo)
- Búsqueda en timeline
- Agrupación por estudiante/módulo
- Análisis de patrones de actividad
- Alertas configurables (ej: estudiante inactivo >X días)
- Exportación de timeline a CSV
- Vista de heatmap de actividad
- Real-time con WebSockets (actualización instantánea)
- Comparativa de actividad entre clases

---

## Dependencias

### Dependencias Técnicas:
- **Backend:** Sistema de logging de actividades (ActivityLog entity)
- **Backend:** Eventos en EAI-002, EAI-003 que crean logs
- **Frontend:** Infinite scroll / load more pattern

### Dependencias de User Stories:
- EAI-002 (actividades que generan logs)
- EAI-003 (gamificación que genera logs de level_up, achievements)

---

## Pruebas

### Pruebas Unitarias:
- [ ] `calculateDateRange` retorna rangos correctos para cada opción
- [ ] `getActivityStats` cuenta correctamente
- [ ] `mapActivityLog` formatea correctamente según tipo
- [ ] Paginación funciona correctamente

### Pruebas de Integración:
- [ ] Endpoint retorna actividades del rango correcto
- [ ] Filtro por fecha funciona
- [ ] Paginación retorna correctamente con hasMore
- [ ] Stats se calculan correctamente

### Pruebas E2E:
- [ ] Profesor ve timeline de actividades
- [ ] Filtro por fecha actualiza timeline
- [ ] Cargar más funciona correctamente
- [ ] Auto-refresh actualiza timeline
- [ ] Cada tipo de actividad se muestra correctamente

---

## Notas de Implementación

1. **Performance:**
   - Índice en `(classroomId, timestamp)` para queries rápidos
   - Limitar a 50 actividades por request
   - Cachear stats por 1 minuto

2. **Logging:**
   - Crear ActivityLog en cada evento relevante
   - Background job para limpiar logs antiguos (>90 días)

3. **UX:**
   - Highlight de actividad más reciente
   - Smooth scroll al cargar más
   - Indicador visual de auto-refresh

4. **Escalabilidad:**
   - Para clases muy activas, considerar WebSockets en EXT-005

---

## Estimación de Esfuerzo

**Backend:** 3 SP
- Endpoint de activity feed
- Sistema de logging (si no existe)
- Stats y agregaciones

**Frontend:** 3 SP
- Timeline con load more
- Auto-refresh
- Múltiples tipos de actividad

**Testing:** 1 SP

**Total:** 7 SP = $3,400 MXN
