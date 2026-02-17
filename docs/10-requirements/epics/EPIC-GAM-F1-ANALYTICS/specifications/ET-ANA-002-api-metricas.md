# ET-ANA-002: Especificacion Tecnica de API de Metricas

## Metadata

| Campo | Valor |
|-------|-------|
| **ID** | ET-ANA-002 |
| **Modulo** | Analytics |
| **Titulo** | API de Metricas y Tracking de Actividad |
| **Prioridad** | Alta |
| **Estado** | Done |
| **Version** | 1.0 |
| **Fecha Creacion** | 2026-01-20 |
| **Ultima Actualizacion** | 2026-01-20 |
| **Autor** | Documentation Team |

---

## Requerimiento Padre

- [RF-ANA-002: Metricas de Elementos de Gamificacion](../requirements/RF-ANA-002-metricas-gamificacion.md)

---

## Descripcion Tecnica

Este documento especifica la implementacion tecnica del sistema de tracking de actividades, timeline de eventos, indicadores de actividad, e identificacion de estudiantes en riesgo.

---

## Componentes Afectados

### Backend
| Componente | Archivo | Descripcion |
|------------|---------|-------------|
| ActivityFeedService | `modules/teacher-analytics/services/activity-feed.service.ts` | Logica del timeline |
| AtRiskService | `modules/teacher-analytics/services/at-risk.service.ts` | Identificacion de estudiantes en riesgo |
| ActivityLogRepository | `modules/analytics/repositories/activity-log.repository.ts` | Acceso a datos de actividad |
| DTOs | `modules/teacher-analytics/dto/*.dto.ts` | Objetos de transferencia |

### Frontend
| Componente | Archivo | Descripcion |
|------------|---------|-------------|
| ActivityFeedView | `features/teacher/analytics/components/ActivityFeedView.tsx` | Vista de timeline |
| ActivityHeader | `features/teacher/analytics/components/ActivityHeader.tsx` | Indicadores del dia |
| ActivityTimeline | `features/teacher/analytics/components/ActivityTimeline.tsx` | Lista de actividades |
| ActivityItem | `features/teacher/analytics/components/ActivityItem.tsx` | Item individual |
| AtRiskStudentsView | `features/teacher/analytics/components/AtRiskStudentsView.tsx` | Vista de riesgo |
| StudentRiskCard | `features/teacher/analytics/components/StudentRiskCard.tsx` | Card de estudiante |
| RiskSummary | `features/teacher/analytics/components/RiskSummary.tsx` | Resumen de riesgo |

### Database
| Tabla | Schema | Descripcion |
|-------|--------|-------------|
| activity_logs | analytics | Registro de todas las actividades |

---

## Endpoints API

### GET /api/teacher/classroom/{classroomId}/activity-feed

**Descripcion:** Obtiene timeline de actividades de la clase

**Request:**
```
GET /api/teacher/classroom/uuid/activity-feed?range=7d&limit=50&offset=0
Authorization: Bearer {token}
```

**Query Parameters:**
| Parametro | Tipo | Default | Descripcion |
|-----------|------|---------|-------------|
| range | string | 7d | Rango de fechas: today, 7d, 30d, all |
| limit | number | 50 | Actividades por pagina (max 100) |
| offset | number | 0 | Offset para paginacion |

**Response:**
```json
{
  "classroomId": "uuid",
  "dateRange": "7d",
  "stats": {
    "activeStudentsToday": 12,
    "activitiesCompletedToday": 45,
    "activityByDay": [
      {"date": "2026-01-20", "count": 45},
      {"date": "2026-01-19", "count": 38},
      {"date": "2026-01-18", "count": 52}
    ]
  },
  "activities": [
    {
      "id": "activity-log-uuid",
      "type": "activity_completed",
      "student": {
        "id": "student-uuid",
        "name": "Juan Perez",
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
      "timestamp": "2026-01-20T10:30:00Z",
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
        "name": "Maria Garcia",
        "avatarUrl": "/avatars/student2.png"
      },
      "timestamp": "2026-01-20T10:25:00Z",
      "metadata": {
        "newLevel": 4,
        "xpEarned": 100
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

**Codigos de Respuesta:**
| Codigo | Descripcion |
|--------|-------------|
| 200 | Exito |
| 401 | No autenticado |
| 403 | Sin acceso a la clase |
| 404 | Clase no encontrada |

---

### GET /api/teacher/classroom/{classroomId}/at-risk-students

**Descripcion:** Obtiene lista de estudiantes en riesgo

**Request:**
```
GET /api/teacher/classroom/uuid/at-risk-students?filter=all
Authorization: Bearer {token}
```

**Query Parameters:**
| Parametro | Tipo | Default | Descripcion |
|-----------|------|---------|-------------|
| filter | string | all | Filtro: critical, warning, all |

**Response:**
```json
{
  "classroomId": "uuid",
  "summary": {
    "critical": 5,
    "warning": 8,
    "active": 12,
    "total": 25,
    "percentages": {
      "critical": 20,
      "warning": 32,
      "active": 48
    }
  },
  "students": [
    {
      "id": "student-uuid",
      "name": "Juan Perez",
      "avatarUrl": "/avatars/student.png",
      "riskLevel": "critical",
      "riskFactors": {
        "daysInactive": 10,
        "progressPercentage": 25,
        "modulesNotStarted": 5,
        "modulesIncomplete": 2
      },
      "lastActivity": {
        "name": "Suma de fracciones",
        "moduleName": "Fracciones",
        "timestamp": "2026-01-10T14:30:00Z"
      },
      "comparison": {
        "progressDiffFromAverage": -40.5
      }
    }
  ]
}
```

---

## Modelo de Datos

### Entity: ActivityLog

```typescript
// activity-log.entity.ts
@Entity({ schema: 'analytics', name: 'activity_logs' })
export class ActivityLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50 })
  type: ActivityLogType; // activity_completed, module_started, level_up, achievement_unlocked

  @Column({ name: 'student_id', type: 'uuid' })
  studentId: string;

  @ManyToOne(() => Student)
  @JoinColumn({ name: 'student_id' })
  student: Student;

  @Column({ name: 'classroom_id', type: 'uuid' })
  classroomId: string;

  @ManyToOne(() => Classroom)
  @JoinColumn({ name: 'classroom_id' })
  classroom: Classroom;

  @Column({ name: 'module_id', type: 'uuid', nullable: true })
  moduleId?: string;

  @ManyToOne(() => Module, { nullable: true })
  @JoinColumn({ name: 'module_id' })
  module?: Module;

  @Column({ name: 'activity_id', type: 'uuid', nullable: true })
  activityId?: string;

  @ManyToOne(() => Activity, { nullable: true })
  @JoinColumn({ name: 'activity_id' })
  activity?: Activity;

  @Column({ type: 'timestamptz' })
  timestamp: Date;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

// Enum de tipos
export enum ActivityLogType {
  ACTIVITY_COMPLETED = 'activity_completed',
  MODULE_STARTED = 'module_started',
  LEVEL_UP = 'level_up',
  ACHIEVEMENT_UNLOCKED = 'achievement_unlocked'
}
```

### DDL: Tabla activity_logs

```sql
CREATE TABLE IF NOT EXISTS analytics.activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR(50) NOT NULL,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    classroom_id UUID NOT NULL REFERENCES public.classrooms(id) ON DELETE CASCADE,
    module_id UUID REFERENCES public.modules(id) ON DELETE SET NULL,
    activity_id UUID REFERENCES public.activities(id) ON DELETE SET NULL,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indices para performance
CREATE INDEX idx_activity_logs_classroom_timestamp
    ON analytics.activity_logs(classroom_id, timestamp DESC);

CREATE INDEX idx_activity_logs_student_id
    ON analytics.activity_logs(student_id);

CREATE INDEX idx_activity_logs_type
    ON analytics.activity_logs(type);

-- Comentarios
COMMENT ON TABLE analytics.activity_logs IS 'Registro de todas las actividades de estudiantes para analytics';
COMMENT ON COLUMN analytics.activity_logs.type IS 'Tipo de actividad: activity_completed, module_started, level_up, achievement_unlocked';
COMMENT ON COLUMN analytics.activity_logs.metadata IS 'Datos adicionales segun tipo (xpEarned, score, newLevel, etc)';
```

---

## Implementacion Backend

### Activity Feed Service

```typescript
// activity-feed.service.ts
@Injectable()
export class ActivityFeedService {
  constructor(
    @InjectRepository(ActivityLog)
    private activityLogRepo: Repository<ActivityLog>,
    private cacheManager: Cache
  ) {}

  async getActivityFeed(
    classroomId: string,
    teacherId: string,
    query: ActivityFeedQueryDto
  ) {
    // 1. Validar acceso
    await this.validateTeacherAccess(classroomId, teacherId);

    // 2. Calcular rango de fechas
    const dateRange = this.calculateDateRange(query.range);

    // 3. Obtener estadisticas del dia
    const stats = await this.getActivityStats(classroomId, dateRange);

    // 4. Obtener actividades
    const activities = await this.activityLogRepo
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

    return {
      classroomId,
      dateRange: query.range,
      stats,
      activities: activities.map(log => this.mapActivityLog(log)),
      pagination: {
        limit: query.limit,
        offset: query.offset,
        hasMore: activities.length === query.limit
      }
    };
  }

  private calculateDateRange(range: string): { start: Date; end: Date } {
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
        start = new Date(0);
        break;
      default:
        start = subDays(now, 7);
    }

    return { start, end: now };
  }

  private async getActivityStats(classroomId: string, dateRange: { start: Date; end: Date }) {
    const today = startOfDay(new Date());

    // Estudiantes activos hoy
    const activeStudentsToday = await this.activityLogRepo
      .createQueryBuilder('log')
      .select('COUNT(DISTINCT log.studentId)', 'count')
      .where('log.classroomId = :classroomId', { classroomId })
      .andWhere('log.timestamp >= :today', { today })
      .getRawOne();

    // Actividades completadas hoy
    const activitiesCompletedToday = await this.activityLogRepo.count({
      where: {
        classroomId,
        type: ActivityLogType.ACTIVITY_COMPLETED,
        timestamp: MoreThanOrEqual(today)
      }
    });

    // Actividad por dia (ultimos 7 dias)
    const activityByDay = await this.getActivityByDay(classroomId, 7);

    return {
      activeStudentsToday: parseInt(activeStudentsToday.count),
      activitiesCompletedToday,
      activityByDay
    };
  }
}
```

### At Risk Service

```typescript
// at-risk.service.ts
@Injectable()
export class AtRiskService {
  async getAtRiskStudents(
    classroomId: string,
    teacherId: string,
    filter: string
  ) {
    // 1. Validar acceso
    await this.validateTeacherAccess(classroomId, teacherId);

    // 2. Obtener estudiantes y promedio de clase
    const students = await this.classroomService.getStudents(classroomId);
    const classAverage = await this.calculateClassAverageProgress(classroomId);

    // 3. Analizar riesgo de cada estudiante
    const analyzedStudents = await Promise.all(
      students.map(student => this.analyzeStudentRisk(student, classroomId, classAverage))
    );

    // 4. Filtrar segun parametro
    let filteredStudents = analyzedStudents;
    if (filter === 'critical') {
      filteredStudents = analyzedStudents.filter(s => s.riskLevel === 'critical');
    } else if (filter === 'warning') {
      filteredStudents = analyzedStudents.filter(s => s.riskLevel === 'warning');
    }

    // 5. Ordenar: criticos primero, luego por dias inactivos
    filteredStudents.sort((a, b) => {
      const riskOrder = { critical: 0, warning: 1, active: 2 };
      if (riskOrder[a.riskLevel] !== riskOrder[b.riskLevel]) {
        return riskOrder[a.riskLevel] - riskOrder[b.riskLevel];
      }
      return b.riskFactors.daysInactive - a.riskFactors.daysInactive;
    });

    // 6. Calcular resumen
    const summary = this.calculateRiskSummary(analyzedStudents);

    return {
      classroomId,
      summary,
      students: filteredStudents
    };
  }

  private calculateRiskLevel(daysInactive: number, progress: number): RiskLevel {
    // Critico: >7 dias sin actividad O progreso <30%
    if (daysInactive > 7 || progress < 30) {
      return 'critical';
    }

    // Advertencia: 3-7 dias sin actividad O progreso 30-50%
    if ((daysInactive >= 3 && daysInactive <= 7) || (progress >= 30 && progress <= 50)) {
      return 'warning';
    }

    // Activo
    return 'active';
  }

  private calculateRiskSummary(students: AnalyzedStudent[]) {
    const critical = students.filter(s => s.riskLevel === 'critical').length;
    const warning = students.filter(s => s.riskLevel === 'warning').length;
    const active = students.filter(s => s.riskLevel === 'active').length;
    const total = students.length;

    return {
      critical,
      warning,
      active,
      total,
      percentages: {
        critical: total > 0 ? Math.round((critical / total) * 100) : 0,
        warning: total > 0 ? Math.round((warning / total) * 100) : 0,
        active: total > 0 ? Math.round((active / total) * 100) : 0
      }
    };
  }
}
```

### DTOs

```typescript
// activity-feed-query.dto.ts
export class ActivityFeedQueryDto {
  @IsOptional()
  @IsIn(['today', '7d', '30d', 'all'])
  range?: string = '7d';

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 50;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset?: number = 0;
}

// at-risk-query.dto.ts
export class AtRiskQueryDto {
  @IsOptional()
  @IsIn(['critical', 'warning', 'all'])
  filter?: string = 'all';
}
```

---

## Implementacion Frontend

### Activity Feed View

```typescript
// ActivityFeedView.tsx
export const ActivityFeedView: React.FC = () => {
  const { classroomId } = useParams();
  const [dateRange, setDateRange] = useState('7d');
  const [activities, setActivities] = useState<Activity[]>([]);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  const { data: stats } = useActivityStats(classroomId);

  // Auto-refresh cada 2 minutos
  useEffect(() => {
    const interval = setInterval(() => {
      loadActivities(0);
    }, 120000);

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
        onLoadMore={() => loadActivities(offset + 50)}
        hasMore={hasMore}
      />
    </div>
  );
};
```

### Activity Item Component

```typescript
// ActivityItem.tsx
const activityConfig = {
  activity_completed: { icon: CheckIcon, color: '#10b981', label: 'completo' },
  module_started: { icon: PlayIcon, color: '#3b82f6', label: 'inicio' },
  level_up: { icon: TrophyIcon, color: '#f59e0b', label: 'subio a nivel' },
  achievement_unlocked: { icon: StarIcon, color: '#8b5cf6', label: 'desbloqueo' }
};

export const ActivityItem: React.FC<{ activity: Activity }> = ({ activity }) => {
  const config = activityConfig[activity.type];

  return (
    <div className="activity-item flex items-start gap-3 p-4 border-b">
      <div
        className="activity-icon p-2 rounded-full"
        style={{ backgroundColor: config.color + '20' }}
      >
        <config.icon className="w-5 h-5" style={{ color: config.color }} />
      </div>

      <div className="activity-content flex-1">
        <div className="flex items-center gap-2">
          <Avatar src={activity.student.avatarUrl} size="sm" />
          <span className="font-medium">{activity.student.name}</span>
          <span className="text-gray-500 text-sm">
            {formatRelativeTime(activity.timestamp)}
          </span>
        </div>

        <p className="text-gray-700 mt-1">
          {renderActivityDescription(activity)}
        </p>

        {activity.metadata?.xpEarned && (
          <Badge color="gold" size="sm" className="mt-1">
            +{activity.metadata.xpEarned} XP
          </Badge>
        )}
      </div>
    </div>
  );
};
```

### At Risk Students View

```typescript
// AtRiskStudentsView.tsx
export const AtRiskStudentsView: React.FC = () => {
  const { classroomId } = useParams();
  const [filter, setFilter] = useState('all');
  const { data, isLoading } = useAtRiskStudents(classroomId, filter);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  if (isLoading) return <AtRiskSkeleton />;

  return (
    <div className="at-risk-container">
      <RiskSummary summary={data.summary} />

      <FilterBar
        filter={filter}
        onFilterChange={setFilter}
        summary={data.summary}
      />

      <StudentsAtRiskList
        students={data.students}
        onStudentClick={setSelectedStudent}
      />

      {selectedStudent && (
        <StudentRiskDetailModal
          student={selectedStudent}
          onClose={() => setSelectedStudent(null)}
        />
      )}
    </div>
  );
};
```

---

## Creacion de Activity Logs

### Eventos que Generan Logs

Los siguientes eventos deben crear entradas en `activity_logs`:

```typescript
// activity-log.service.ts
@Injectable()
export class ActivityLogService {
  async logActivityCompleted(
    studentId: string,
    classroomId: string,
    moduleId: string,
    activityId: string,
    score: number,
    xpEarned: number
  ) {
    await this.activityLogRepo.save({
      type: ActivityLogType.ACTIVITY_COMPLETED,
      studentId,
      classroomId,
      moduleId,
      activityId,
      timestamp: new Date(),
      metadata: { score, xpEarned }
    });
  }

  async logModuleStarted(studentId: string, classroomId: string, moduleId: string) {
    await this.activityLogRepo.save({
      type: ActivityLogType.MODULE_STARTED,
      studentId,
      classroomId,
      moduleId,
      timestamp: new Date()
    });
  }

  async logLevelUp(studentId: string, classroomId: string, newLevel: number, xpEarned: number) {
    await this.activityLogRepo.save({
      type: ActivityLogType.LEVEL_UP,
      studentId,
      classroomId,
      timestamp: new Date(),
      metadata: { newLevel, xpEarned }
    });
  }

  async logAchievementUnlocked(
    studentId: string,
    classroomId: string,
    achievementName: string,
    achievementIcon: string
  ) {
    await this.activityLogRepo.save({
      type: ActivityLogType.ACHIEVEMENT_UNLOCKED,
      studentId,
      classroomId,
      timestamp: new Date(),
      metadata: { achievementName, achievementIcon }
    });
  }
}
```

### Listener de Eventos

```typescript
// activity-log.listener.ts
@Injectable()
export class ActivityLogListener {
  constructor(private activityLogService: ActivityLogService) {}

  @OnEvent('exercise.completed')
  async handleExerciseCompleted(payload: ExerciseCompletedEvent) {
    await this.activityLogService.logActivityCompleted(
      payload.studentId,
      payload.classroomId,
      payload.moduleId,
      payload.activityId,
      payload.score,
      payload.xpEarned
    );
  }

  @OnEvent('rank.promoted')
  async handleRankPromoted(payload: RankPromotedEvent) {
    await this.activityLogService.logLevelUp(
      payload.studentId,
      payload.classroomId,
      payload.newLevel,
      payload.xpBonus
    );
  }

  @OnEvent('achievement.unlocked')
  async handleAchievementUnlocked(payload: AchievementUnlockedEvent) {
    await this.activityLogService.logAchievementUnlocked(
      payload.studentId,
      payload.classroomId,
      payload.achievementName,
      payload.achievementIcon
    );
  }
}
```

---

## Consideraciones Tecnicas

### Performance
- Indice compuesto en (classroomId, timestamp) para queries eficientes
- Limite de 50 actividades por request
- Cache de stats por 1 minuto
- Cache de analisis de riesgo por 5 minutos

### Mantenimiento
- Job nocturno para limpiar logs >90 dias (configurable)
- Considerar particionamiento por fecha para tablas grandes

### Escalabilidad
- Para clases muy activas, WebSockets en extension futura
- Pre-calculo de riesgo en background si hay muchos estudiantes

---

## Historial de Cambios

| Version | Fecha | Autor | Cambios |
|---------|-------|-------|---------|
| 1.0 | 2026-01-20 | Documentation Team | Creacion inicial de la especificacion |

---

**Documento:** `docs/01-fase-alcance-inicial/EAI-004-analytics/especificaciones/ET-ANA-002-api-metricas.md`
