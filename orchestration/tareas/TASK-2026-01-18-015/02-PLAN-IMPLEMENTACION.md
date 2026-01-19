# TASK-2026-01-18-015: Plan de Implementación - Teacher/Reports

**Fecha:** 2026-01-18
**Estimación Total:** 5 Sprints (~100 horas)
**Metodología:** SIMCO CAPVED

---

## 1. VISIÓN GENERAL

### 1.1 Objetivo

Completar y robustecer el módulo de Teacher/Reports para cumplir con:
- US-PM-005b (Report Generation) - MVP
- US-PM-005a (Classroom Analytics) - MVP
- US-REP-001 (Advanced Analytics) - Fase 3

### 1.2 Entregables Principales

1. **Sprint 1:** Fixes críticos (filtrado temporal, datos consistentes)
2. **Sprint 2:** Integración MasteryTracking y SkillAssessment
3. **Sprint 3:** Mejoras de backend (transacciones, engagement metrics)
4. **Sprint 4:** Mejoras de frontend (deletion, file size, polish)
5. **Sprint 5:** Features avanzados (scheduled reports, sharing)

---

## 2. SPRINT 1: FIXES CRÍTICOS (P0)

**Duración:** 1-2 días
**Objetivo:** Corregir bugs que afectan funcionalidad core

### 2.1 Task 1.1: Implementar Filtrado Temporal

**Archivo:** `apps/backend/src/modules/teacher/services/reports.service.ts`

**Cambios:**
```typescript
// En gatherReportData(), agregar parámetros de fecha a todas las queries

private async gatherReportData(dto: GenerateReportDto, userId: string) {
  const dateFilter = dto.start_date && dto.end_date
    ? { submitted_at: Between(new Date(dto.start_date), new Date(dto.end_date)) }
    : {};

  // Aplicar a queries de submissions
  const submissions = await this.submissionRepo.find({
    where: {
      user_id: studentId,
      ...dateFilter
    }
  });
}
```

**Tests:**
- [ ] Reporte con fechas muestra solo datos del período
- [ ] Reporte sin fechas muestra todos los datos
- [ ] Fechas inválidas retornan error 400

**Esfuerzo:** 4h

---

### 2.2 Task 1.2: Trigger para Module Progress

**Archivo:** `apps/database/ddl/schemas/progress_tracking/triggers/01-update-graded-exercises.sql` (nuevo)

```sql
-- Trigger para actualizar graded_exercises cuando submission cambia a graded/reviewed
CREATE OR REPLACE FUNCTION progress_tracking.update_module_graded_count()
RETURNS TRIGGER AS $$
DECLARE
  v_module_id UUID;
BEGIN
  -- Solo procesar si cambió a estado graded o reviewed
  IF NEW.status IN ('graded', 'reviewed')
     AND (OLD.status IS NULL OR OLD.status NOT IN ('graded', 'reviewed')) THEN

    -- Obtener module_id del ejercicio
    SELECT module_id INTO v_module_id
    FROM educational_content.exercises
    WHERE id = NEW.exercise_id;

    -- Actualizar module_progress
    UPDATE progress_tracking.module_progress
    SET
      graded_exercises = graded_exercises + 1,
      graded_progress_percentage = ROUND(
        ((graded_exercises + 1)::NUMERIC / NULLIF(total_exercises, 0)) * 100, 2
      ),
      updated_at = NOW()
    WHERE user_id = NEW.user_id
      AND module_id = v_module_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_module_graded_count
AFTER UPDATE ON progress_tracking.exercise_submissions
FOR EACH ROW
EXECUTE FUNCTION progress_tracking.update_module_graded_count();
```

**Tests:**
- [ ] Cambiar submission a 'graded' incrementa graded_exercises
- [ ] Cambiar submission a 'reviewed' incrementa graded_exercises
- [ ] Cambio de 'submitted' a 'submitted' no incrementa

**Esfuerzo:** 3h

---

### 2.3 Task 1.3: Fix Submission Status Enum

**Archivo:** `apps/backend/src/modules/progress/entities/exercise-submission.entity.ts`

```typescript
// Agregar 'pending_review' al enum si falta
export enum SubmissionStatus {
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
  GRADED = 'graded',
  REVIEWED = 'reviewed',
  PENDING_REVIEW = 'pending_review', // Agregar si falta
}
```

**Esfuerzo:** 1h

---

### 2.4 Validación Sprint 1

```bash
# Ejecutar después de cambios
cd /home/isem/workspace-v2/projects/gamilit/apps/backend
npm run build
npm run lint
npm run test -- --testPathPattern="reports|submissions"

# Ejecutar migraciones DDL
cd ../database
./scripts/apply-migrations.sh
```

**Criterios de Aceptación:**
- [ ] Build pasa sin errores
- [ ] Lint pasa sin errores
- [ ] Tests de reports pasan
- [ ] Trigger DDL aplicado correctamente

---

## 3. SPRINT 2: INTEGRACIÓN DATOS (P1)

**Duración:** 2-3 días
**Objetivo:** Conectar MasteryTracking y SkillAssessment a reportes

### 3.1 Task 2.1: Método getMasteryData en AnalyticsService

**Archivo:** `apps/backend/src/modules/teacher/services/analytics.service.ts`

```typescript
// Agregar nuevo método
async getMasteryData(studentId: string): Promise<MasteryDataDto> {
  const mastery = await this.masteryTrackingRepo.find({
    where: { user_id: studentId },
    relations: ['exercise'],
  });

  // Agrupar por skill/tipo de ejercicio
  const bySkill = mastery.reduce((acc, m) => {
    const skill = m.exercise?.exercise_type || 'unknown';
    if (!acc[skill]) {
      acc[skill] = { total: 0, mastered: 0, avgScore: 0 };
    }
    acc[skill].total++;
    if (m.status === 'mastered') acc[skill].mastered++;
    acc[skill].avgScore = (acc[skill].avgScore + m.current_score) / acc[skill].total;
    return acc;
  }, {});

  return {
    totalSkills: Object.keys(bySkill).length,
    masteredSkills: Object.values(bySkill).filter(s => s.mastered > 0).length,
    bySkill,
  };
}
```

**Esfuerzo:** 6h

---

### 3.2 Task 2.2: Método getSkillAssessments en AnalyticsService

**Archivo:** `apps/backend/src/modules/teacher/services/analytics.service.ts`

```typescript
// Agregar método para competencias
async getSkillAssessments(studentId: string): Promise<SkillAssessmentsDto> {
  const assessments = await this.skillAssessmentRepo.find({
    where: { user_id: studentId },
    order: { assessed_at: 'DESC' },
  });

  // Estructurar para radar chart (5 competencias)
  const competencies = {
    literal: this.extractCompetency(assessments, 'literal'),
    inferencial: this.extractCompetency(assessments, 'inferential'),
    critico: this.extractCompetency(assessments, 'critical'),
    digital: this.extractCompetency(assessments, 'digital'),
    textual: this.extractCompetency(assessments, 'textual'),
  };

  return {
    competencies,
    lastAssessedAt: assessments[0]?.assessed_at || null,
    overallProficiency: this.calculateOverallProficiency(competencies),
  };
}

private extractCompetency(assessments: SkillAssessment[], type: string) {
  const relevant = assessments.filter(a => a.skill_type === type);
  if (relevant.length === 0) return { score: 0, level: 'not_assessed' };

  const latest = relevant[0];
  return {
    score: latest.proficiency_score,
    level: latest.proficiency_level,
    trend: this.calculateTrend(relevant),
  };
}
```

**Esfuerzo:** 6h

---

### 3.3 Task 2.3: Integrar en getStudentInsights

**Archivo:** `apps/backend/src/modules/teacher/services/analytics.service.ts`

```typescript
// Modificar getStudentInsights para incluir mastery y skills
async getStudentInsights(studentId: string): Promise<StudentInsightsResponseDto> {
  const [existing, mastery, skills] = await Promise.all([
    this.getExistingInsights(studentId),
    this.getMasteryData(studentId),
    this.getSkillAssessments(studentId),
  ]);

  // Usar mastery data para strengths/weaknesses reales
  const strengths = this.deriveStrengthsFromMastery(mastery);
  const weaknesses = this.deriveWeaknessesFromMastery(mastery);

  return {
    ...existing,
    strengths,
    weaknesses,
    mastery_summary: mastery,
    competencies: skills.competencies,
  };
}
```

**DTO Update:**
```typescript
// Agregar a StudentInsightsResponseDto
mastery_summary?: {
  totalSkills: number;
  masteredSkills: number;
  bySkill: Record<string, SkillMasteryInfo>;
};
competencies?: {
  literal: CompetencyInfo;
  inferencial: CompetencyInfo;
  critico: CompetencyInfo;
  digital: CompetencyInfo;
  textual: CompetencyInfo;
};
```

**Esfuerzo:** 4h

---

### 3.4 Task 2.4: Actualizar ReportsService

**Archivo:** `apps/backend/src/modules/teacher/services/reports.service.ts`

```typescript
// En generatePDFReport, agregar sección de competencias
private generateCompetenciesSection(insights: StudentInsightsResponseDto): string {
  if (!insights.competencies) return '';

  return `
    <div class="competencies-section">
      <h3>Competencias</h3>
      <div class="radar-placeholder">
        <!-- Radar chart data: ${JSON.stringify(insights.competencies)} -->
      </div>
      <table class="competencies-table">
        ${Object.entries(insights.competencies).map(([name, data]) => `
          <tr>
            <td>${name}</td>
            <td>${data.score}%</td>
            <td class="${data.trend}">${data.trend}</td>
          </tr>
        `).join('')}
      </table>
    </div>
  `;
}
```

**Esfuerzo:** 4h

---

### 3.5 Validación Sprint 2

```bash
# Tests de integración
npm run test -- --testPathPattern="analytics|insights"

# Verificar que nuevos datos aparecen en reportes
curl -X POST localhost:3000/api/teacher/reports/generate \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"classroom_id": "...", "format": "pdf", "type": "progress"}'
```

**Criterios de Aceptación:**
- [ ] StudentInsights incluye mastery_summary
- [ ] StudentInsights incluye competencies
- [ ] PDF genera sección de competencias
- [ ] Fortalezas/debilidades derivadas de datos reales

---

## 4. SPRINT 3: BACKEND ROBUSTEZ (P1)

**Duración:** 2 días
**Objetivo:** Mejorar consistencia de datos y transacciones

### 4.1 Task 3.1: Transacciones en MLCoinsService

**Archivo:** `apps/backend/src/modules/gamification/services/ml-coins.service.ts`

```typescript
@Injectable()
export class MLCoinsService {
  constructor(
    private dataSource: DataSource,
    // ... otros
  ) {}

  async addCoins(
    userId: string,
    amount: number,
    type: TransactionType,
    metadata: TransactionMetadata,
  ): Promise<MLCoinsTransaction> {
    return this.dataSource.transaction(async (manager) => {
      // 1. Obtener balance actual (con lock)
      const stats = await manager.findOne(UserStats, {
        where: { user_id: userId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!stats) throw new NotFoundException('User stats not found');

      const newBalance = stats.ml_coins + amount;
      if (newBalance < 0) throw new BadRequestException('Insufficient balance');

      // 2. Crear transacción
      const transaction = manager.create(MLCoinsTransaction, {
        user_id: userId,
        amount,
        balance_before: stats.ml_coins,
        balance_after: newBalance,
        transaction_type: type,
        ...metadata,
      });

      await manager.save(transaction);

      // 3. Actualizar balance
      await manager.update(UserStats, { user_id: userId }, {
        ml_coins: newBalance,
        updated_at: new Date(),
      });

      return transaction;
    });
  }
}
```

**Esfuerzo:** 6h

---

### 4.2 Task 3.2: EngagementMetricsService

**Archivo:** `apps/backend/src/modules/progress/services/engagement-metrics.service.ts` (nuevo)

```typescript
@Injectable()
export class EngagementMetricsService {
  constructor(
    @InjectRepository(EngagementMetrics)
    private metricsRepo: Repository<EngagementMetrics>,
    private submissionRepo: Repository<ExerciseSubmission>,
    private sessionRepo: Repository<LearningSession>,
  ) {}

  // Cron job diario a las 23:59
  @Cron('59 23 * * *')
  async calculateDailyMetrics(): Promise<void> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Obtener usuarios activos hoy
    const activeUsers = await this.sessionRepo
      .createQueryBuilder('s')
      .select('DISTINCT s.user_id')
      .where('s.started_at >= :today', { today })
      .getRawMany();

    for (const { user_id } of activeUsers) {
      await this.calculateUserMetrics(user_id, today);
    }
  }

  private async calculateUserMetrics(userId: string, date: Date): Promise<void> {
    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);

    const [sessions, submissions, achievements] = await Promise.all([
      this.sessionRepo.count({ where: { user_id: userId, started_at: Between(date, nextDay) } }),
      this.submissionRepo.count({ where: { user_id: userId, submitted_at: Between(date, nextDay) } }),
      // ... más métricas
    ]);

    const engagementScore = this.calculateScore(sessions, submissions);

    await this.metricsRepo.upsert({
      user_id: userId,
      metric_date: date,
      daily_active: true,
      sessions_count: sessions,
      exercises_attempted: submissions,
      engagement_score: engagementScore,
    }, ['user_id', 'metric_date']);
  }
}
```

**Esfuerzo:** 8h

---

### 4.3 Task 3.3: Session Cleanup Job

**Archivo:** `apps/backend/src/modules/progress/services/session-cleanup.service.ts` (nuevo)

```typescript
@Injectable()
export class SessionCleanupService {
  constructor(
    @InjectRepository(LearningSession)
    private sessionRepo: Repository<LearningSession>,
  ) {}

  // Cada hora, limpiar sesiones huérfanas
  @Cron('0 * * * *')
  async cleanupOrphanedSessions(): Promise<void> {
    const fourHoursAgo = new Date(Date.now() - 4 * 60 * 60 * 1000);

    await this.sessionRepo.update(
      {
        completion_status: 'ongoing',
        started_at: LessThan(fourHoursAgo),
      },
      {
        completion_status: 'timed_out',
        ended_at: new Date(),
        updated_at: new Date(),
      },
    );
  }
}
```

**Esfuerzo:** 2h

---

## 5. SPRINT 4: FRONTEND POLISH (P2)

**Duración:** 1 día
**Objetivo:** Completar UI y mejorar UX

### 5.1 Task 4.1: File Size Display

**Archivo:** `apps/frontend/src/apps/teacher/pages/TeacherReportsPage.tsx`

```typescript
// En la lista de reportes, mostrar file_size
const formatFileSize = (bytes?: number) => {
  if (!bytes) return 'N/A';
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  return `${size.toFixed(1)} ${units[unitIndex]}`;
};

// En el componente
<span className="text-sm text-muted-foreground">
  {formatFileSize(report.fileSizeBytes)}
</span>
```

**Esfuerzo:** 1h

---

### 5.2 Task 4.2: Delete Report Button

**Archivo:** `apps/frontend/src/apps/teacher/pages/TeacherReportsPage.tsx`

```typescript
// Agregar botón de eliminar con confirmación
const handleDeleteReport = async (reportId: string) => {
  const confirmed = await confirm({
    title: 'Eliminar Reporte',
    description: 'Esta acción no se puede deshacer. ¿Estás seguro?',
    confirmText: 'Eliminar',
    cancelText: 'Cancelar',
  });

  if (confirmed) {
    try {
      await deleteReport(reportId);
      toast.success('Reporte eliminado');
      refreshReports();
    } catch (error) {
      toast.error('Error al eliminar reporte');
    }
  }
};

// En la card del reporte
<Button
  variant="ghost"
  size="sm"
  className="text-destructive"
  onClick={() => handleDeleteReport(report.id)}
>
  <Trash2 className="h-4 w-4" />
</Button>
```

**Esfuerzo:** 2h

---

### 5.3 Task 4.3: CSV Handling Fix

**Archivo:** `apps/frontend/src/services/api/teacher/reportsApi.ts`

```typescript
// Asegurar manejo correcto de CSV
export const generateReport = async (dto: GenerateReportDto) => {
  const response = await axiosInstance.post(
    API_ENDPOINTS.teacher.reports.generate,
    dto,
    {
      responseType: 'blob',
      headers: {
        'Accept': dto.format === 'csv'
          ? 'text/csv'
          : dto.format === 'excel'
            ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            : 'application/pdf',
      },
    }
  );

  // Extraer filename del header o generar
  const contentDisposition = response.headers['content-disposition'];
  const fileName = contentDisposition
    ? contentDisposition.split('filename=')[1]?.replace(/"/g, '')
    : `report-${Date.now()}.${dto.format}`;

  return {
    blob: response.data,
    metadata: {
      reportId: response.headers['x-report-id'],
      studentCount: response.headers['x-student-count'],
      generatedAt: response.headers['x-generated-at'],
      fileName,
    },
  };
};
```

**Esfuerzo:** 2h

---

## 6. SPRINT 5: FEATURES AVANZADOS (P3)

**Duración:** 3-4 días
**Objetivo:** Scheduled reports y sharing (Fase 3)

### 6.1 Task 5.1: Tabla report_schedules

**Archivo:** `apps/database/ddl/schemas/social_features/tables/09-report_schedules.sql` (nuevo)

```sql
CREATE TABLE social_features.report_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id UUID NOT NULL REFERENCES auth_management.profiles(id) ON DELETE CASCADE,
    classroom_id UUID REFERENCES social_features.classrooms(id) ON DELETE SET NULL,
    tenant_id UUID NOT NULL REFERENCES auth_management.tenants(id) ON DELETE CASCADE,

    -- Configuración del reporte
    report_name VARCHAR(255) NOT NULL,
    report_type VARCHAR(50) NOT NULL,
    report_format VARCHAR(10) NOT NULL DEFAULT 'pdf',
    template_id VARCHAR(50),

    -- Schedule
    frequency VARCHAR(20) NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly')),
    day_of_week INTEGER CHECK (day_of_week BETWEEN 0 AND 6), -- Para weekly
    day_of_month INTEGER CHECK (day_of_month BETWEEN 1 AND 28), -- Para monthly
    time_of_day TIME NOT NULL DEFAULT '08:00:00',
    timezone VARCHAR(50) DEFAULT 'America/Mexico_City',

    -- Status
    is_active BOOLEAN DEFAULT true,
    last_run_at TIMESTAMPTZ,
    next_run_at TIMESTAMPTZ,
    last_error TEXT,

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_report_schedules_teacher ON social_features.report_schedules(teacher_id);
CREATE INDEX idx_report_schedules_next_run ON social_features.report_schedules(next_run_at) WHERE is_active = true;
```

**Esfuerzo:** 4h

---

### 6.2 Task 5.2: ReportSchedulerService

**Archivo:** `apps/backend/src/modules/teacher/services/report-scheduler.service.ts` (nuevo)

```typescript
@Injectable()
export class ReportSchedulerService {
  constructor(
    @InjectRepository(ReportSchedule)
    private scheduleRepo: Repository<ReportSchedule>,
    private reportsService: ReportsService,
  ) {}

  // Cron cada minuto para verificar schedules
  @Cron('* * * * *')
  async processSchedules(): Promise<void> {
    const now = new Date();

    const dueSchedules = await this.scheduleRepo.find({
      where: {
        is_active: true,
        next_run_at: LessThanOrEqual(now),
      },
    });

    for (const schedule of dueSchedules) {
      await this.executeSchedule(schedule);
    }
  }

  private async executeSchedule(schedule: ReportSchedule): Promise<void> {
    try {
      await this.reportsService.generateReport({
        classroom_id: schedule.classroom_id,
        format: schedule.report_format,
        type: schedule.report_type,
        template_id: schedule.template_id,
      }, schedule.teacher_id, schedule.tenant_id);

      // Actualizar next_run_at
      await this.scheduleRepo.update(schedule.id, {
        last_run_at: new Date(),
        next_run_at: this.calculateNextRun(schedule),
        last_error: null,
      });
    } catch (error) {
      await this.scheduleRepo.update(schedule.id, {
        last_error: error.message,
      });
    }
  }

  private calculateNextRun(schedule: ReportSchedule): Date {
    const now = new Date();
    switch (schedule.frequency) {
      case 'daily':
        return addDays(now, 1);
      case 'weekly':
        return addWeeks(now, 1);
      case 'monthly':
        return addMonths(now, 1);
    }
  }

  // CRUD endpoints
  async createSchedule(dto: CreateScheduleDto, teacherId: string): Promise<ReportSchedule> { /* ... */ }
  async updateSchedule(id: string, dto: UpdateScheduleDto): Promise<ReportSchedule> { /* ... */ }
  async deleteSchedule(id: string): Promise<void> { /* ... */ }
  async getSchedules(teacherId: string): Promise<ReportSchedule[]> { /* ... */ }
}
```

**Esfuerzo:** 12h

---

### 6.3 Task 5.3: Report Sharing

**Archivo:** `apps/database/ddl/schemas/social_features/tables/10-report_sharing.sql` (nuevo)

```sql
CREATE TABLE social_features.report_sharing (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id UUID NOT NULL REFERENCES social_features.teacher_reports(id) ON DELETE CASCADE,
    shared_by UUID NOT NULL REFERENCES auth_management.profiles(id),
    shared_with UUID NOT NULL REFERENCES auth_management.profiles(id),
    permission_level VARCHAR(20) DEFAULT 'view' CHECK (permission_level IN ('view', 'download')),

    -- Tracking
    accessed_at TIMESTAMPTZ,
    access_count INTEGER DEFAULT 0,

    -- Expiration
    expires_at TIMESTAMPTZ,

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_report_sharing_unique ON social_features.report_sharing(report_id, shared_with);
```

**Esfuerzo:** 8h

---

## 7. CRONOGRAMA RESUMEN

| Sprint | Días | Horas | Objetivo |
|--------|------|-------|----------|
| Sprint 1 | 1-2 | 8h | Fixes críticos |
| Sprint 2 | 2-3 | 20h | Integración datos |
| Sprint 3 | 2 | 16h | Backend robustez |
| Sprint 4 | 1 | 5h | Frontend polish |
| Sprint 5 | 3-4 | 24h | Features avanzados |
| **Total** | **9-12** | **~73h** | |

---

## 8. DEPENDENCIAS Y RIESGOS

### Dependencias
- Sprint 2 depende de Sprint 1 (datos consistentes primero)
- Sprint 5 depende de Sprint 3 (transacciones seguras)

### Riesgos
1. **MasteryTracking puede tener poca data** - Mitigación: Mock data para demo
2. **Transacciones pueden afectar performance** - Mitigación: Profiling
3. **Scheduled reports pueden generar carga** - Mitigación: Queue system

---

## 9. CHECKLIST DE VALIDACIÓN

### Por Sprint

**Sprint 1:**
- [ ] npm run build pasa
- [ ] npm run lint pasa
- [ ] Tests de reports pasan
- [ ] Reportes con fechas funcionan correctamente
- [ ] Trigger DDL aplicado

**Sprint 2:**
- [ ] StudentInsights incluye mastery
- [ ] StudentInsights incluye competencies
- [ ] PDF genera sección de competencias
- [ ] Datos derivados de mastery real

**Sprint 3:**
- [ ] Transacciones de coins atómicas
- [ ] EngagementMetrics se calcula diariamente
- [ ] Sesiones huérfanas se limpian

**Sprint 4:**
- [ ] File size se muestra correctamente
- [ ] Delete report funciona
- [ ] CSV se descarga correctamente

**Sprint 5:**
- [ ] Schedules se crean y ejecutan
- [ ] Reports se pueden compartir
- [ ] Permisos de sharing funcionan

---

## 10. PRÓXIMOS PASOS INMEDIATOS

1. **Validar este plan con el usuario**
2. **Iniciar Sprint 1** (fixes críticos)
3. **Crear branch feature** `feature/teacher-reports-improvements`
4. **Implementar Task 1.1** (filtrado temporal)

---

*Plan creado: 2026-01-18*
*Pendiente: Aprobación del usuario*
