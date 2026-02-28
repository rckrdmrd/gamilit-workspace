---
titulo: "ET-PP-001: Progress View"
tipo: especificacion-tecnica
fecha_creacion: "2025-10-01"
ultima_actualizacion: "2026-02-28"
estado: activo
---

# ET-PP-001: Progress View

## Metadata

| Campo | Valor |
|-------|-------|
| **ID** | ET-PP-001 |
| **Modulo** | Parent Portal |
| **Tipo** | Especificacion Tecnica |
| **Estado** | Parcialmente Implementado |
| **Completitud** | 30% |
| **Version** | 1.0 |
| **Fecha Creacion** | 2026-01-27 |
| **Ultima Actualizacion** | 2026-01-27 |
| **Autor** | Architecture Analyst |

---

## Referencias

### Requerimiento Funcional
- RF-PP-003: Detailed Progress View

### User Stories
- [US-PP-002: Portal Dashboard](../user-stories/US-PP-002/US-PP-002-portal-dashboard.md)

---

## Descripcion Funcional

Vista detallada de progreso para padres:
- Progreso general del estudiante
- Progreso por modulo con drill-down
- Historial de ejercicios
- Graficos de tendencia
- Comparacion con promedio de clase

---

## Arquitectura

### Diagrama de Componentes

```
+----------------------------------------------------------+
|                   FRONTEND (React)                        |
|  - ProgressPage                                          |
|  - ModuleProgressList                                    |
|  - ExerciseHistoryTable                                  |
|  - ProgressCharts                                        |
|  - ComparisonWidget                                      |
+-----------------------------+----------------------------+
                              | REST API
+-----------------------------v----------------------------+
|                  BACKEND (NestJS)                        |
|  - (FALTANTE) ParentProgressService                      |
|  - ProgressTrackingService (EXISTENTE)                   |
+-----------------------------+----------------------------+
                              | TypeORM
+-----------------------------v----------------------------+
|               DATABASE (PostgreSQL)                       |
|  - progress_tracking.module_progress                     |
|  - progress_tracking.exercise_attempts                   |
|  - progress_tracking.learning_sessions                   |
+----------------------------------------------------------+
```

---

## Implementacion Existente

### Backend - Progress Tracking Module

**Ubicacion:** `apps/backend/src/modules/progress/`

**Estado:** COMPLETO (para estudiantes)

El modulo de progress tracking ya existe y funciona para estudiantes.
Solo falta crear endpoints especificos para padres con validacion de permiso.

---

## Lo que Falta para Completar (70%)

### 1. ParentProgressService (25%)

```typescript
// services/parent-progress.service.ts (NUEVO)
@Injectable()
export class ParentProgressService {
  constructor(
    private readonly parentLinksRepo: Repository<ParentStudentLink>,
    private readonly moduleProgressRepo: Repository<ModuleProgress>,
    private readonly exerciseAttemptsRepo: Repository<ExerciseAttempt>,
    private readonly sessionsRepo: Repository<LearningSession>,
  ) {}

  /**
   * Verifica permiso del padre para ver progreso del estudiante
   */
  async validateAccess(
    parentAccountId: string,
    studentId: string
  ): Promise<void> {
    const link = await this.parentLinksRepo.findOne({
      where: {
        parent_account_id: parentAccountId,
        student_id: studentId,
        link_status: 'active',
        can_view_progress: true,
      },
    });

    if (!link) {
      throw new ForbiddenException('No tienes permiso para ver este progreso');
    }
  }

  /**
   * Obtiene resumen de progreso del estudiante
   */
  async getProgressSummary(
    parentAccountId: string,
    studentId: string
  ): Promise<ProgressSummary> {
    await this.validateAccess(parentAccountId, studentId);

    const moduleProgress = await this.getModuleProgress(studentId);
    const recentActivity = await this.getRecentActivity(studentId);
    const stats = await this.calculateStats(studentId);

    return {
      overallProgress: stats.overallProgress,
      averageScore: stats.averageScore,
      totalTimeMinutes: stats.totalTimeMinutes,
      exercisesCompleted: stats.exercisesCompleted,
      currentStreak: stats.currentStreak,
      moduleProgress,
      recentActivity,
    };
  }

  /**
   * Obtiene progreso por modulo
   */
  async getModuleProgress(studentId: string): Promise<ModuleProgressDetail[]> {
    return this.moduleProgressRepo
      .createQueryBuilder('mp')
      .leftJoin('mp.module', 'm')
      .select([
        'mp.module_id',
        'm.title',
        'm.description',
        'mp.progress_percentage',
        'mp.exercises_completed',
        'mp.total_exercises',
        'mp.average_score',
        'mp.time_spent_minutes',
        'mp.started_at',
        'mp.completed_at',
      ])
      .where('mp.user_id = :studentId', { studentId })
      .orderBy('m.order', 'ASC')
      .getMany();
  }

  /**
   * Obtiene historial de ejercicios
   */
  async getExerciseHistory(
    parentAccountId: string,
    studentId: string,
    options: {
      moduleId?: string;
      startDate?: Date;
      endDate?: Date;
      limit?: number;
      offset?: number;
    }
  ): Promise<PaginatedResult<ExerciseAttemptSummary>> {
    await this.validateAccess(parentAccountId, studentId);

    const query = this.exerciseAttemptsRepo
      .createQueryBuilder('ea')
      .leftJoin('ea.exercise', 'e')
      .leftJoin('e.module', 'm')
      .select([
        'ea.id',
        'ea.score',
        'ea.time_spent_seconds',
        'ea.completed_at',
        'e.title',
        'e.difficulty_level',
        'm.title as module_title',
      ])
      .where('ea.user_id = :studentId', { studentId })
      .andWhere('ea.is_completed = true');

    if (options.moduleId) {
      query.andWhere('e.module_id = :moduleId', { moduleId: options.moduleId });
    }

    if (options.startDate) {
      query.andWhere('ea.completed_at >= :startDate', { startDate: options.startDate });
    }

    if (options.endDate) {
      query.andWhere('ea.completed_at <= :endDate', { endDate: options.endDate });
    }

    const [items, total] = await query
      .orderBy('ea.completed_at', 'DESC')
      .limit(options.limit || 20)
      .offset(options.offset || 0)
      .getManyAndCount();

    return { items, total, hasMore: total > (options.offset || 0) + items.length };
  }

  /**
   * Obtiene datos para graficos
   */
  async getChartData(
    parentAccountId: string,
    studentId: string,
    period: 'week' | 'month' | 'year'
  ): Promise<ChartData> {
    await this.validateAccess(parentAccountId, studentId);

    const sessions = await this.sessionsRepo.find({
      where: {
        user_id: studentId,
        start_time: MoreThan(this.getPeriodStart(period)),
      },
      order: { start_time: 'ASC' },
    });

    return {
      labels: this.generateLabels(period),
      datasets: [
        {
          label: 'Tiempo de estudio (min)',
          data: this.aggregateByDate(sessions, 'duration_minutes', period),
        },
        {
          label: 'Ejercicios completados',
          data: this.aggregateByDate(sessions, 'exercises_completed', period),
        },
      ],
    };
  }

  /**
   * Compara con promedio de clase
   */
  async getComparison(
    parentAccountId: string,
    studentId: string
  ): Promise<Comparison> {
    await this.validateAccess(parentAccountId, studentId);

    // Obtener classroom del estudiante
    const classroom = await this.getStudentClassroom(studentId);
    if (!classroom) {
      return null;
    }

    const studentStats = await this.calculateStats(studentId);
    const classAverage = await this.calculateClassAverage(classroom.id);

    return {
      student: studentStats,
      classAverage,
      percentile: this.calculatePercentile(studentStats.overallProgress, classroom.id),
    };
  }
}

interface ProgressSummary {
  overallProgress: number;
  averageScore: number;
  totalTimeMinutes: number;
  exercisesCompleted: number;
  currentStreak: number;
  moduleProgress: ModuleProgressDetail[];
  recentActivity: ActivityEntry[];
}

interface ModuleProgressDetail {
  moduleId: string;
  moduleTitle: string;
  progressPercentage: number;
  exercisesCompleted: number;
  totalExercises: number;
  averageScore: number;
  timeSpentMinutes: number;
  status: 'not_started' | 'in_progress' | 'completed';
}
```

### 2. ParentProgressController (10%)

```typescript
// controllers/parent-progress.controller.ts (NUEVO)
@Controller('parent-portal/students/:studentId/progress')
@UseGuards(ParentAuthGuard)
export class ParentProgressController {
  @Get('summary')
  async getSummary(
    @ParentAccount() parent: ParentAccount,
    @Param('studentId') studentId: string
  ): Promise<ProgressSummary>;

  @Get('modules')
  async getModules(
    @ParentAccount() parent: ParentAccount,
    @Param('studentId') studentId: string
  ): Promise<ModuleProgressDetail[]>;

  @Get('modules/:moduleId')
  async getModuleDetail(
    @ParentAccount() parent: ParentAccount,
    @Param('studentId') studentId: string,
    @Param('moduleId') moduleId: string
  ): Promise<ModuleProgressDetail>;

  @Get('exercises')
  async getExerciseHistory(
    @ParentAccount() parent: ParentAccount,
    @Param('studentId') studentId: string,
    @Query() query: ExerciseHistoryQueryDto
  ): Promise<PaginatedResult<ExerciseAttemptSummary>>;

  @Get('charts')
  async getChartData(
    @ParentAccount() parent: ParentAccount,
    @Param('studentId') studentId: string,
    @Query('period') period: 'week' | 'month' | 'year'
  ): Promise<ChartData>;

  @Get('comparison')
  async getComparison(
    @ParentAccount() parent: ParentAccount,
    @Param('studentId') studentId: string
  ): Promise<Comparison>;
}
```

### 3. Frontend Progress Page (25%)

```typescript
// pages/StudentProgressPage.tsx (NUEVO)
export const StudentProgressPage: React.FC = () => {
  const { studentId } = useParams();
  // Nota: useStudentProgress del teacher portal fue removido (Teacher Portal Audit 2026-02-20).
  // Para el parent portal, usar un hook propio o studentProgressApi.
  const { summary, isLoading } = useStudentProgress(studentId);

  if (isLoading) return <ProgressSkeleton />;

  return (
    <div className="progress-page">
      <PageHeader>
        <StudentInfo student={summary.student} />
        <QuickStats stats={summary} />
      </PageHeader>

      <div className="progress-content">
        <Section title="Progreso por Modulo">
          <ModuleProgressList modules={summary.moduleProgress} />
        </Section>

        <Section title="Tendencia">
          <ProgressChart data={summary.chartData} />
        </Section>

        <Section title="Comparacion con la Clase">
          <ComparisonWidget comparison={summary.comparison} />
        </Section>

        <Section title="Ejercicios Recientes">
          <ExerciseHistoryTable
            studentId={studentId}
            initialData={summary.recentExercises}
          />
        </Section>
      </div>
    </div>
  );
};

// components/ModuleProgressList.tsx (NUEVO)
interface ModuleProgressListProps {
  modules: ModuleProgressDetail[];
  onModuleClick?: (moduleId: string) => void;
}

export const ModuleProgressList: React.FC<ModuleProgressListProps> = ({
  modules,
  onModuleClick,
}) => {
  return (
    <div className="module-list">
      {modules.map((module) => (
        <ModuleProgressCard
          key={module.moduleId}
          module={module}
          onClick={() => onModuleClick?.(module.moduleId)}
        />
      ))}
    </div>
  );
};

// components/ModuleProgressCard.tsx (NUEVO)
export const ModuleProgressCard: React.FC<{ module: ModuleProgressDetail }> = ({
  module,
}) => {
  return (
    <div className="module-card">
      <div className="module-header">
        <h4>{module.moduleTitle}</h4>
        <StatusBadge status={module.status} />
      </div>

      <ProgressBar value={module.progressPercentage} />

      <div className="module-stats">
        <Stat label="Ejercicios" value={`${module.exercisesCompleted}/${module.totalExercises}`} />
        <Stat label="Promedio" value={`${module.averageScore}%`} />
        <Stat label="Tiempo" value={formatMinutes(module.timeSpentMinutes)} />
      </div>

      <ChevronRightIcon />
    </div>
  );
};
```

### 4. Progress Charts (10%)

```typescript
// components/ProgressChart.tsx (NUEVO)
interface ProgressChartProps {
  data: ChartData;
  type?: 'line' | 'bar' | 'area';
}

export const ProgressChart: React.FC<ProgressChartProps> = ({
  data,
  type = 'area',
}) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Area
          type="monotone"
          dataKey="timeMinutes"
          name="Tiempo (min)"
          fill="#F97316"
          fillOpacity={0.6}
        />
        <Area
          type="monotone"
          dataKey="exercises"
          name="Ejercicios"
          fill="#3B82F6"
          fillOpacity={0.6}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

// components/ComparisonWidget.tsx (NUEVO)
interface ComparisonWidgetProps {
  comparison: Comparison;
}

export const ComparisonWidget: React.FC<ComparisonWidgetProps> = ({
  comparison,
}) => {
  if (!comparison) {
    return <EmptyState message="No hay datos de comparacion disponibles" />;
  }

  return (
    <div className="comparison-widget">
      <div className="percentile-display">
        <span className="percentile-value">{comparison.percentile}</span>
        <span className="percentile-label">percentil</span>
      </div>

      <ComparisonBar
        studentValue={comparison.student.overallProgress}
        classAverage={comparison.classAverage.overallProgress}
        metric="Progreso"
      />

      <ComparisonBar
        studentValue={comparison.student.averageScore}
        classAverage={comparison.classAverage.averageScore}
        metric="Promedio"
      />
    </div>
  );
};
```

---

## API REST Endpoints

| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| GET | `/parent-portal/students/:id/progress/summary` | Resumen |
| GET | `/parent-portal/students/:id/progress/modules` | Modulos |
| GET | `/parent-portal/students/:id/progress/modules/:moduleId` | Detalle modulo |
| GET | `/parent-portal/students/:id/progress/exercises` | Historial |
| GET | `/parent-portal/students/:id/progress/charts` | Datos graficos |
| GET | `/parent-portal/students/:id/progress/comparison` | Comparacion |

---

## Criterios de Aceptacion

### Funcionales
- [ ] Resumen de progreso general
- [ ] Lista de modulos con progreso
- [ ] Drill-down a detalle de modulo
- [ ] Historial de ejercicios con filtros
- [ ] Graficos de tendencia
- [ ] Comparacion con promedio de clase

### No Funcionales
- [ ] Datos cargados con permiso validado
- [ ] Graficos responsive
- [ ] Paginacion en historial

---

## Dependencias

### Bloqueado Por
- Progress Tracking Module (COMPLETO)
- ParentStudentLink Entity (COMPLETO)
- ParentAuthGuard (PENDIENTE)

### Bloquea
- PDF Export
- Custom Alerts
- Progress Notifications

---

## Estimacion de Esfuerzo

| Componente | Horas Estimadas |
|------------|-----------------|
| ParentProgressService | 10h |
| ParentProgressController | 4h |
| Frontend Progress Page | 12h |
| Progress Charts | 6h |
| Tests | 4h |
| **Total** | **36h** |

---

## Historial de Cambios

| Version | Fecha | Autor | Cambios |
|---------|-------|-------|---------|
| 1.0 | 2026-01-27 | Architecture Analyst | Creacion inicial |

---

*Documento: ET-PAR-003-progress-view.md*
*Generado: 2026-01-27*
