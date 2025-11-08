
<!-- MIGRADO A SIMCO V2 -->
<!-- ID Original: ET-PRG-002 -->
<!-- ID Nuevo: M-PRG-ET-002 -->
<!-- Fecha de Migración: 2025-11-07 -->

# M-PRG-ET-002: Análisis de Desempeño - Especificación Técnica

## 📋 Metadata

| Campo | Valor |
|-------|-------|
| **ID** | ET-PRG-002 |
| **Módulo** | 04 - Progreso y Seguimiento |
| **Título** | Análisis de Desempeño - Implementación |
| **Estado** | ✅ Implementado |
| **Versión** | 1.0 |
| **Fecha** | 2025-11-07 |

---

## 🔗 Referencias

📘 **Implementa:** [RF-PRG-002](../../01-requerimientos/04-progreso-seguimiento/RF-PRG-002-analisis-desempeno.md)

---

## 🗄️ Base de Datos

### Vista Materializada: user_performance_summary

```sql
CREATE MATERIALIZED VIEW progress_tracking.user_performance_summary AS
SELECT
    u.id AS user_id,
    u.email,

    -- Métricas de ejercicios
    COUNT(DISTINCT ea.exercise_id) AS total_exercises_attempted,
    COUNT(DISTINCT CASE WHEN ea.is_correct THEN ea.exercise_id END) AS total_exercises_correct,

    -- Tasa de éxito
    ROUND(
        (COUNT(DISTINCT CASE WHEN ea.is_correct AND ea.attempt_number = 1 THEN ea.exercise_id END)::NUMERIC /
         NULLIF(COUNT(DISTINCT ea.exercise_id), 0)) * 100,
        2
    ) AS success_rate_first_attempt,

    ROUND(
        (COUNT(DISTINCT CASE WHEN ea.is_correct THEN ea.exercise_id END)::NUMERIC /
         NULLIF(COUNT(DISTINCT ea.exercise_id), 0)) * 100,
        2
    ) AS success_rate_overall,

    -- Tiempo promedio
    ROUND(AVG(ea.time_spent_seconds)) AS avg_time_per_exercise_seconds,

    -- Intentos promedio
    ROUND(AVG(ea.attempt_number), 2) AS avg_attempts_per_exercise,

    -- XP y gamificación
    us.total_xp,
    us.current_rank,
    us.current_streak,
    us.max_streak,

    -- Tiempo total aprendiendo
    SUM(ea.time_spent_seconds) AS total_time_learning_seconds,
    ROUND(SUM(ea.time_spent_seconds) / 3600.0, 1) AS total_time_learning_hours,

    -- Actividad
    MAX(ea.created_at) AS last_activity_at,
    MIN(ea.created_at) AS first_activity_at,
    DATE_PART('day', NOW() - MAX(ea.created_at)) AS days_since_last_activity,

    -- Tendencias (últimos 30 días vs anteriores 30 días)
    ROUND(
        (COUNT(DISTINCT CASE
            WHEN ea.is_correct AND ea.attempt_number = 1 AND ea.created_at >= NOW() - INTERVAL '30 days'
            THEN ea.exercise_id
        END)::NUMERIC /
         NULLIF(COUNT(DISTINCT CASE WHEN ea.created_at >= NOW() - INTERVAL '30 days' THEN ea.exercise_id END), 0)) * 100,
        2
    ) AS success_rate_last_30_days,

    ROUND(
        (COUNT(DISTINCT CASE
            WHEN ea.is_correct AND ea.attempt_number = 1
                AND ea.created_at >= NOW() - INTERVAL '60 days'
                AND ea.created_at < NOW() - INTERVAL '30 days'
            THEN ea.exercise_id
        END)::NUMERIC /
         NULLIF(COUNT(DISTINCT CASE
            WHEN ea.created_at >= NOW() - INTERVAL '60 days'
                AND ea.created_at < NOW() - INTERVAL '30 days'
            THEN ea.exercise_id
        END), 0)) * 100,
        2
    ) AS success_rate_previous_30_days,

    NOW() AS last_refreshed

FROM auth.users u
LEFT JOIN progress_tracking.exercise_attempts ea ON u.id = ea.user_id
LEFT JOIN gamification_system.user_stats us ON u.id = us.user_id
WHERE u.deleted_at IS NULL
GROUP BY u.id, u.email, us.total_xp, us.current_rank, us.current_streak, us.max_streak;

-- Índices para performance
CREATE UNIQUE INDEX idx_user_performance_user_id ON progress_tracking.user_performance_summary(user_id);
CREATE INDEX idx_user_performance_success_rate ON progress_tracking.user_performance_summary(success_rate_overall DESC);
CREATE INDEX idx_user_performance_last_activity ON progress_tracking.user_performance_summary(last_activity_at DESC);

-- Refresh automático cada 1 hora
-- SELECT cron.schedule('refresh-user-performance', '0 * * * *', 'REFRESH MATERIALIZED VIEW CONCURRENTLY progress_tracking.user_performance_summary');
```

---

### Función: calculate_success_rate

```sql
CREATE OR REPLACE FUNCTION progress_tracking.calculate_success_rate(
    p_user_id UUID,
    p_category VARCHAR DEFAULT NULL,
    p_days_back INTEGER DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_result JSONB;
    v_date_filter TIMESTAMPTZ;
BEGIN
    -- Calcular filtro de fecha
    IF p_days_back IS NOT NULL THEN
        v_date_filter := NOW() - (p_days_back || ' days')::INTERVAL;
    ELSE
        v_date_filter := '1900-01-01'::TIMESTAMPTZ;
    END IF;

    -- Calcular métricas
    SELECT jsonb_build_object(
        'user_id', p_user_id,
        'category', COALESCE(p_category, 'all'),
        'days_back', p_days_back,
        'total_exercises_attempted', COUNT(DISTINCT ea.exercise_id),
        'first_attempt_success', COUNT(DISTINCT CASE WHEN ea.is_correct AND ea.attempt_number = 1 THEN ea.exercise_id END),
        'overall_success', COUNT(DISTINCT CASE WHEN ea.is_correct THEN ea.exercise_id END),
        'success_rate_first_attempt', ROUND(
            (COUNT(DISTINCT CASE WHEN ea.is_correct AND ea.attempt_number = 1 THEN ea.exercise_id END)::NUMERIC /
             NULLIF(COUNT(DISTINCT ea.exercise_id), 0)) * 100,
            2
        ),
        'success_rate_overall', ROUND(
            (COUNT(DISTINCT CASE WHEN ea.is_correct THEN ea.exercise_id END)::NUMERIC /
             NULLIF(COUNT(DISTINCT ea.exercise_id), 0)) * 100,
            2
        ),
        'avg_attempts', ROUND(AVG(ea.attempt_number), 2)
    ) INTO v_result
    FROM progress_tracking.exercise_attempts ea
    JOIN educational_content.exercises e ON ea.exercise_id = e.id
    WHERE ea.user_id = p_user_id
      AND ea.created_at >= v_date_filter
      AND (p_category IS NULL OR e.category = p_category);

    RETURN v_result;
END;
$$;
```

---

### Función: identify_struggling_students

```sql
CREATE OR REPLACE FUNCTION progress_tracking.identify_struggling_students(
    p_classroom_id UUID DEFAULT NULL
)
RETURNS TABLE (
    user_id UUID,
    user_email VARCHAR,
    risk_level VARCHAR,
    reasons JSONB,
    recommended_actions JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    WITH student_metrics AS (
        SELECT
            ups.user_id,
            ups.email,
            ups.success_rate_overall,
            ups.days_since_last_activity,
            ups.avg_attempts_per_exercise,
            ups.current_streak,

            -- Cálculo de riesgo
            CASE
                WHEN ups.days_since_last_activity >= 7 THEN 'inactive'
                WHEN ups.success_rate_overall < 60 THEN 'low_performance'
                WHEN ups.avg_attempts_per_exercise >= 3 THEN 'struggling'
                WHEN ups.current_streak = 0 AND ups.days_since_last_activity >= 3 THEN 'at_risk'
                ELSE 'ok'
            END AS primary_issue
        FROM progress_tracking.user_performance_summary ups
        WHERE
            (p_classroom_id IS NULL OR EXISTS (
                SELECT 1 FROM social_features.classroom_members cm
                WHERE cm.classroom_id = p_classroom_id
                  AND cm.user_id = ups.user_id
            ))
    )
    SELECT
        sm.user_id,
        sm.email,
        CASE
            WHEN sm.days_since_last_activity >= 7 THEN 'high'
            WHEN sm.success_rate_overall < 50 THEN 'high'
            WHEN sm.success_rate_overall < 60 OR sm.avg_attempts_per_exercise >= 3 THEN 'medium'
            ELSE 'low'
        END AS risk_level,

        -- Reasons
        jsonb_build_array(
            CASE WHEN sm.days_since_last_activity >= 7
                THEN jsonb_build_object('type', 'inactivity', 'value', sm.days_since_last_activity || ' days')
            END,
            CASE WHEN sm.success_rate_overall < 60
                THEN jsonb_build_object('type', 'low_success', 'value', sm.success_rate_overall || '%')
            END,
            CASE WHEN sm.avg_attempts_per_exercise >= 3
                THEN jsonb_build_object('type', 'too_many_attempts', 'value', sm.avg_attempts_per_exercise)
            END,
            CASE WHEN sm.current_streak = 0 AND sm.days_since_last_activity >= 3
                THEN jsonb_build_object('type', 'broken_streak', 'value', sm.days_since_last_activity || ' days')
            END
        ) - NULL AS reasons,

        -- Recommended actions
        jsonb_build_array(
            CASE WHEN sm.days_since_last_activity >= 7
                THEN 'Send encouragement message'
            END,
            CASE WHEN sm.success_rate_overall < 60
                THEN 'Assign remedial lessons'
            END,
            CASE WHEN sm.avg_attempts_per_exercise >= 3
                THEN 'Schedule 1-on-1 session'
            END
        ) - NULL AS recommended_actions

    FROM student_metrics sm
    WHERE sm.primary_issue != 'ok'
    ORDER BY
        CASE
            WHEN sm.days_since_last_activity >= 7 THEN 1
            WHEN sm.success_rate_overall < 50 THEN 2
            WHEN sm.success_rate_overall < 60 THEN 3
            ELSE 4
        END;
END;
$$;
```

---

### Función: get_performance_trends

```sql
CREATE OR REPLACE FUNCTION progress_tracking.get_performance_trends(
    p_user_id UUID,
    p_days_back INTEGER DEFAULT 30
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_result JSONB;
BEGIN
    WITH daily_metrics AS (
        SELECT
            DATE(ea.created_at) AS date,
            COUNT(DISTINCT ea.exercise_id) AS exercises_attempted,
            COUNT(DISTINCT CASE WHEN ea.is_correct THEN ea.exercise_id END) AS exercises_correct,
            ROUND(
                (COUNT(DISTINCT CASE WHEN ea.is_correct THEN ea.exercise_id END)::NUMERIC /
                 NULLIF(COUNT(DISTINCT ea.exercise_id), 0)) * 100,
                2
            ) AS daily_success_rate,
            SUM(ea.time_spent_seconds) AS total_time_seconds
        FROM progress_tracking.exercise_attempts ea
        WHERE ea.user_id = p_user_id
          AND ea.created_at >= NOW() - (p_days_back || ' days')::INTERVAL
        GROUP BY DATE(ea.created_at)
        ORDER BY DATE(ea.created_at)
    )
    SELECT jsonb_build_object(
        'user_id', p_user_id,
        'period_days', p_days_back,
        'daily_data', jsonb_agg(
            jsonb_build_object(
                'date', dm.date,
                'exercises_attempted', dm.exercises_attempted,
                'exercises_correct', dm.exercises_correct,
                'success_rate', dm.daily_success_rate,
                'time_spent_hours', ROUND(dm.total_time_seconds / 3600.0, 1)
            )
            ORDER BY dm.date
        ),
        'trend', CASE
            WHEN (SELECT AVG(daily_success_rate) FROM daily_metrics WHERE date >= CURRENT_DATE - 7) >
                 (SELECT AVG(daily_success_rate) FROM daily_metrics WHERE date < CURRENT_DATE - 7)
            THEN 'improving'
            WHEN (SELECT AVG(daily_success_rate) FROM daily_metrics WHERE date >= CURRENT_DATE - 7) <
                 (SELECT AVG(daily_success_rate) FROM daily_metrics WHERE date < CURRENT_DATE - 7)
            THEN 'declining'
            ELSE 'stable'
        END
    ) INTO v_result
    FROM daily_metrics dm;

    RETURN v_result;
END;
$$;
```

---

## 💻 Backend (NestJS)

### Service: AnalyticsService

```typescript
@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(UserPerformanceSummary)
    private readonly performanceRepo: Repository<UserPerformanceSummary>,
    private readonly dataSource: DataSource,
  ) {}

  async getUserPerformance(userId: string): Promise<UserPerformanceDto> {
    const performance = await this.performanceRepo.findOne({
      where: { user_id: userId },
    });

    if (!performance) {
      throw new NotFoundException('User performance data not found');
    }

    return {
      userId: performance.user_id,
      successRateFirstAttempt: performance.success_rate_first_attempt,
      successRateOverall: performance.success_rate_overall,
      totalExercisesAttempted: performance.total_exercises_attempted,
      totalExercisesCorrect: performance.total_exercises_correct,
      avgTimePerExerciseSeconds: performance.avg_time_per_exercise_seconds,
      avgAttemptsPerExercise: performance.avg_attempts_per_exercise,
      totalXp: performance.total_xp,
      currentRank: performance.current_rank,
      currentStreak: performance.current_streak,
      maxStreak: performance.max_streak,
      totalTimeLearningHours: performance.total_time_learning_hours,
      lastActivityAt: performance.last_activity_at,
      daysSinceLastActivity: performance.days_since_last_activity,
      trend: this.calculateTrend(
        performance.success_rate_last_30_days,
        performance.success_rate_previous_30_days,
      ),
    };
  }

  async getSuccessRateByCategory(
    userId: string,
    daysBack?: number,
  ): Promise<CategorySuccessRate[]> {
    const categories = [
      'vocabulary',
      'grammar',
      'reading',
      'writing',
      'pronunciation',
      'culture',
    ];

    const results = await Promise.all(
      categories.map(async (category) => {
        const result = await this.dataSource.query(
          'SELECT progress_tracking.calculate_success_rate($1, $2, $3)',
          [userId, category, daysBack],
        );

        const data = result[0].calculate_success_rate;

        return {
          category,
          successRateFirstAttempt: data.success_rate_first_attempt,
          successRateOverall: data.success_rate_overall,
          totalExercisesAttempted: data.total_exercises_attempted,
          avgAttempts: data.avg_attempts,
        };
      }),
    );

    return results;
  }

  async getPerformanceTrends(
    userId: string,
    daysBack: number = 30,
  ): Promise<PerformanceTrendDto> {
    const result = await this.dataSource.query(
      'SELECT progress_tracking.get_performance_trends($1, $2)',
      [userId, daysBack],
    );

    const data = result[0].get_performance_trends;

    return {
      userId: data.user_id,
      periodDays: data.period_days,
      dailyData: data.daily_data,
      trend: data.trend,
    };
  }

  async getClassroomPerformance(
    classroomId: string,
  ): Promise<ClassroomPerformanceDto> {
    const students = await this.dataSource.query(
      `
      SELECT
        ups.user_id,
        ups.email,
        ups.success_rate_overall,
        ups.total_exercises_attempted,
        ups.days_since_last_activity,
        ups.current_streak,
        CASE
          WHEN ups.days_since_last_activity >= 7 THEN 'inactive'
          WHEN ups.success_rate_overall < 60 THEN 'at_risk'
          ELSE 'on_track'
        END AS status
      FROM progress_tracking.user_performance_summary ups
      JOIN social_features.classroom_members cm ON ups.user_id = cm.user_id
      WHERE cm.classroom_id = $1
      ORDER BY ups.success_rate_overall DESC
      `,
      [classroomId],
    );

    const totalStudents = students.length;
    const avgSuccessRate =
      students.reduce((sum, s) => sum + (s.success_rate_overall || 0), 0) /
      totalStudents;

    const studentsOnTrack = students.filter((s) => s.status === 'on_track').length;
    const studentsAtRisk = students.filter((s) => s.status === 'at_risk').length;
    const studentsInactive = students.filter((s) => s.status === 'inactive').length;

    return {
      classroomId,
      totalStudents,
      avgSuccessRate: Math.round(avgSuccessRate * 100) / 100,
      studentsOnTrack,
      studentsAtRisk,
      studentsInactive,
      students: students.map((s) => ({
        userId: s.user_id,
        email: s.email,
        successRate: s.success_rate_overall,
        totalExercises: s.total_exercises_attempted,
        daysSinceLastActivity: s.days_since_last_activity,
        currentStreak: s.current_streak,
        status: s.status,
      })),
    };
  }

  async identifyStrugglingStudents(
    classroomId?: string,
  ): Promise<StrugglingStudentDto[]> {
    const result = await this.dataSource.query(
      'SELECT * FROM progress_tracking.identify_struggling_students($1)',
      [classroomId || null],
    );

    return result.map((r) => ({
      userId: r.user_id,
      userEmail: r.user_email,
      riskLevel: r.risk_level,
      reasons: r.reasons,
      recommendedActions: r.recommended_actions,
    }));
  }

  private calculateTrend(
    last30Days: number,
    previous30Days: number,
  ): 'improving' | 'declining' | 'stable' {
    if (!last30Days || !previous30Days) return 'stable';

    const diff = last30Days - previous30Days;

    if (diff > 5) return 'improving';
    if (diff < -5) return 'declining';
    return 'stable';
  }
}
```

---

### Controller: AnalyticsController

```typescript
@Controller('analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('me/performance')
  async getMyPerformance(@CurrentUser() user: User) {
    return this.analyticsService.getUserPerformance(user.id);
  }

  @Get('me/performance/by-category')
  async getMyPerformanceByCategory(
    @CurrentUser() user: User,
    @Query('daysBack') daysBack?: number,
  ) {
    return this.analyticsService.getSuccessRateByCategory(user.id, daysBack);
  }

  @Get('me/trends')
  async getMyTrends(
    @CurrentUser() user: User,
    @Query('daysBack') daysBack: number = 30,
  ) {
    return this.analyticsService.getPerformanceTrends(user.id, daysBack);
  }

  @Get('classroom/:classroomId/performance')
  @Roles('admin_teacher', 'super_admin')
  async getClassroomPerformance(@Param('classroomId') classroomId: string) {
    return this.analyticsService.getClassroomPerformance(classroomId);
  }

  @Get('classroom/:classroomId/struggling-students')
  @Roles('admin_teacher', 'super_admin')
  async getStrugglingStudents(@Param('classroomId') classroomId: string) {
    return this.analyticsService.identifyStrugglingStudents(classroomId);
  }
}
```

---

## 🎨 Frontend (React)

### Component: StudentDashboard

```tsx
export const StudentDashboard: React.FC = () => {
  const { data: performance, isLoading } = useQuery({
    queryKey: ['my-performance'],
    queryFn: () => analyticsApi.getMyPerformance(),
  });

  const { data: categoryData } = useQuery({
    queryKey: ['my-performance-by-category'],
    queryFn: () => analyticsApi.getMyPerformanceByCategory(),
  });

  const { data: trends } = useQuery({
    queryKey: ['my-trends', 30],
    queryFn: () => analyticsApi.getMyTrends(30),
  });

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Hero Stats */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
        <StatCard
          icon="🏆"
          label="XP Total"
          value={performance.totalXp.toLocaleString()}
        />
        <StatCard
          icon="📈"
          label="Tasa de Éxito"
          value={`${performance.successRateOverall}%`}
          trend={performance.trend}
        />
        <StatCard
          icon="🔥"
          label="Racha"
          value={`${performance.currentStreak} días`}
        />
        <StatCard
          icon="⏱️"
          label="Tiempo Total"
          value={`${performance.totalTimeLearningHours}h`}
        />
        <StatCard
          icon="✅"
          label="Ejercicios"
          value={performance.totalExercisesCorrect}
        />
        <StatCard
          icon="🎯"
          label="Rango"
          value={performance.currentRank}
        />
      </div>

      {/* Charts Row */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Weekly Progress */}
        <Card>
          <CardHeader>
            <CardTitle>Progreso Semanal</CardTitle>
          </CardHeader>
          <CardContent>
            <WeeklyProgressChart data={trends?.dailyData} />
          </CardContent>
        </Card>

        {/* Performance by Category */}
        <Card>
          <CardHeader>
            <CardTitle>Desempeño por Categoría</CardTitle>
          </CardHeader>
          <CardContent>
            <RadarChart
              data={categoryData?.map((c) => ({
                category: c.category,
                value: c.successRateOverall,
              }))}
            />
          </CardContent>
        </Card>
      </div>

      {/* Strengths and Weaknesses */}
      <Card>
        <CardHeader>
          <CardTitle>Áreas de Fortaleza y Mejora</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold text-green-600 mb-2">
                ✅ Fortalezas
              </h3>
              {categoryData
                ?.filter((c) => c.successRateOverall >= 85)
                .map((c) => (
                  <div key={c.category} className="flex justify-between py-2">
                    <span className="capitalize">{c.category}</span>
                    <span className="font-semibold text-green-600">
                      {c.successRateOverall}%
                    </span>
                  </div>
                ))}
            </div>
            <div>
              <h3 className="font-semibold text-orange-600 mb-2">
                ⚠️ Áreas de Mejora
              </h3>
              {categoryData
                ?.filter((c) => c.successRateOverall < 70)
                .map((c) => (
                  <div key={c.category} className="flex justify-between py-2">
                    <span className="capitalize">{c.category}</span>
                    <span className="font-semibold text-orange-600">
                      {c.successRateOverall}%
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comparison with Class */}
      <Card>
        <CardHeader>
          <CardTitle>Comparación con Promedio de Clase</CardTitle>
        </CardHeader>
        <CardContent>
          <ComparisonChart
            userRate={performance.successRateOverall}
            classAvgRate={72.0} // TODO: Fetch from API
          />
        </CardContent>
      </Card>
    </div>
  );
};
```

---

### Component: TeacherClassroomDashboard

```tsx
export const TeacherClassroomDashboard: React.FC<{ classroomId: string }> = ({
  classroomId,
}) => {
  const { data: classroomPerf } = useQuery({
    queryKey: ['classroom-performance', classroomId],
    queryFn: () => analyticsApi.getClassroomPerformance(classroomId),
  });

  const { data: strugglingStudents } = useQuery({
    queryKey: ['struggling-students', classroomId],
    queryFn: () => analyticsApi.getStrugglingStudents(classroomId),
  });

  if (!classroomPerf) return <Spinner />;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <StatCard
          label="Total Estudiantes"
          value={classroomPerf.totalStudents}
        />
        <StatCard
          label="Promedio Éxito"
          value={`${classroomPerf.avgSuccessRate}%`}
        />
        <StatCard
          label="Al Día"
          value={classroomPerf.studentsOnTrack}
          className="bg-green-50"
        />
        <StatCard
          label="En Riesgo"
          value={classroomPerf.studentsAtRisk + classroomPerf.studentsInactive}
          className="bg-red-50"
        />
      </div>

      {/* Students at Risk */}
      {strugglingStudents && strugglingStudents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="text-orange-500" />
              Estudiantes que Necesitan Atención ({strugglingStudents.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Estudiante</TableHead>
                  <TableHead>Nivel de Riesgo</TableHead>
                  <TableHead>Razones</TableHead>
                  <TableHead>Acciones Sugeridas</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {strugglingStudents.map((student) => (
                  <TableRow key={student.userId}>
                    <TableCell>{student.userEmail}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          student.riskLevel === 'high'
                            ? 'destructive'
                            : 'warning'
                        }
                      >
                        {student.riskLevel}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <ul className="text-sm">
                        {student.reasons.map((reason, i) => (
                          <li key={i}>
                            {reason.type}: {reason.value}
                          </li>
                        ))}
                      </ul>
                    </TableCell>
                    <TableCell>
                      <ul className="text-sm">
                        {student.recommendedActions.map((action, i) => (
                          <li key={i}>{action}</li>
                        ))}
                      </ul>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* All Students Table */}
      <Card>
        <CardHeader>
          <CardTitle>Todos los Estudiantes</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Estudiante</TableHead>
                <TableHead>Progreso</TableHead>
                <TableHead>Tasa de Éxito</TableHead>
                <TableHead>Última Actividad</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {classroomPerf.students.map((student) => (
                <TableRow key={student.userId}>
                  <TableCell>{student.email}</TableCell>
                  <TableCell>{student.totalExercises} ejercicios</TableCell>
                  <TableCell>
                    <ProgressBar value={student.successRate} />
                  </TableCell>
                  <TableCell>
                    {student.daysSinceLastActivity === 0
                      ? 'Hoy'
                      : `Hace ${student.daysSinceLastActivity} días`}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={student.status} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
```

---

## 🧪 Tests

```typescript
describe('AnalyticsService', () => {
  let service: AnalyticsService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [AnalyticsService, /* mock repos */],
    }).compile();

    service = module.get<AnalyticsService>(AnalyticsService);
  });

  it('should calculate user performance correctly', async () => {
    // Arrange
    const userId = 'uuid';

    // Act
    const performance = await service.getUserPerformance(userId);

    // Assert
    expect(performance.successRateOverall).toBeGreaterThanOrEqual(0);
    expect(performance.successRateOverall).toBeLessThanOrEqual(100);
    expect(performance.totalExercisesAttempted).toBeGreaterThanOrEqual(0);
  });

  it('should identify struggling students', async () => {
    // Arrange
    const classroomId = 'uuid';

    // Act
    const strugglingStudents = await service.identifyStrugglingStudents(
      classroomId,
    );

    // Assert
    expect(Array.isArray(strugglingStudents)).toBe(true);
    strugglingStudents.forEach((student) => {
      expect(student.riskLevel).toMatch(/^(high|medium|low)$/);
      expect(Array.isArray(student.reasons)).toBe(true);
      expect(Array.isArray(student.recommendedActions)).toBe(true);
    });
  });
});
```

---

## 📅 Historial

| Versión | Fecha | Cambios |
|---------|-------|---------|
| 1.0 | 2025-11-07 | Creación inicial |

---

**Documento:** `docs/02-especificaciones-tecnicas/04-progreso-seguimiento/ET-PRG-002-analisis-desempeno.md`
