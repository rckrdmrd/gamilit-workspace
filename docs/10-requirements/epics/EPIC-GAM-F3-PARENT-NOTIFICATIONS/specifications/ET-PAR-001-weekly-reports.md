---
titulo: "ET-PAR-001: Weekly Reports System"
tipo: especificacion-tecnica
fecha_creacion: "2025-10-01"
ultima_actualizacion: "2026-02-28"
estado: activo
---

# ET-PAR-001: Weekly Reports System

## Metadata

| Campo | Valor |
|-------|-------|
| **ID** | ET-PAR-001 |
| **Modulo** | Parent Notifications |
| **Titulo** | Sistema de Reportes Semanales para Padres |
| **Prioridad** | Alta |
| **Estado** | Parcialmente Implementado |
| **Completitud** | 40% |
| **Version** | 1.0 |
| **Fecha Creacion** | 2026-01-27 |
| **Ultima Actualizacion** | 2026-01-27 |
| **Autor** | Architecture Analyst |

---

## Estado de Implementacion

### Progreso General: 40%

| Componente | Estado | Completitud |
|------------|--------|-------------|
| ParentAccount Entity | COMPLETO | 100% |
| ParentStudentLink Entity | COMPLETO | 100% |
| ParentNotification Entity | COMPLETO | 100% |
| Notification Types Enum | COMPLETO | 100% |
| Weekly Report Generation | NO INICIADO | 0% |
| Email Template System | NO INICIADO | 0% |
| Scheduled Job (Cron) | NO INICIADO | 0% |
| Report Content Aggregation | NO INICIADO | 0% |
| Email Delivery Service | NO INICIADO | 0% |
| Parent Notification Preferences | PARCIAL | 50% |

---

## Referencias

### Requerimiento Funcional
- RF-PAR-001: Weekly Progress Report Email

### User Stories
- [US-PARENT-001: Weekly Progress Report](../user-stories/US-PARENT-001/US-PARENT-001-weekly-report.md)

---

## Descripcion Funcional

El sistema de reportes semanales envia automaticamente a los padres/tutores un resumen del progreso academico de sus hijos, incluyendo:
- Actividad de la semana (sesiones, tiempo de uso)
- Ejercicios completados y calificaciones
- Logros desbloqueados
- Progreso en modulos
- Recomendaciones personalizadas
- Alertas si hay bajo rendimiento

---

## Arquitectura

### Diagrama de Componentes

```
+----------------------------------------------------------+
|                   SCHEDULED JOB (Cron)                    |
|  - WeeklyReportJob (Domingos 8:00 AM)                    |
+-----------------------------+----------------------------+
                              |
+-----------------------------v----------------------------+
|                  BACKEND (NestJS)                        |
|  - (FALTANTE) WeeklyReportService                        |
|  - (FALTANTE) ReportContentAggregator                    |
|  - (FALTANTE) EmailTemplateService                       |
|  - ParentNotificationsService (PARCIAL)                  |
+-----------------------------+----------------------------+
                              |
+-----------------------------v----------------------------+
|               DATA SOURCES                                |
|  - progress_tracking.* (progreso)                        |
|  - gamification_system.* (logros, XP)                    |
|  - educational_content.* (ejercicios)                    |
|  - auth_management.parent_* (padres)                     |
+-----------------------------+----------------------------+
                              |
+-----------------------------v----------------------------+
|                  EMAIL SERVICE                            |
|  - SendGrid / Nodemailer                                 |
|  - HTML Templates (Handlebars)                           |
+----------------------------------------------------------+
```

### Flujo de Generacion de Reporte

```
Cron Job (Domingo 8:00 AM)
        |
        v
WeeklyReportService.generateAllReports()
        |
        v
Para cada ParentAccount activo:
        |
        v
  ReportContentAggregator.aggregate(studentId, weekStart, weekEnd)
    - Obtener sesiones de la semana
    - Calcular tiempo total de uso
    - Listar ejercicios completados
    - Obtener logros desbloqueados
    - Calcular progreso en modulos
    - Detectar alertas (bajo rendimiento, inactividad)
        |
        v
  EmailTemplateService.render('weekly-report', reportData)
    - Generar HTML con Handlebars
    - Incluir graficos inline (Chart.js to image)
        |
        v
  EmailService.send(parentEmail, subject, htmlContent)
        |
        v
  ParentNotificationsService.create({
    type: 'weekly_report',
    status: 'sent',
    sentViaEmail: true
  })
```

---

## Implementacion Existente

### ParentAccount Entity

**Ubicacion:** `apps/backend/src/modules/auth/entities/parent-account.entity.ts`

**Estado:** COMPLETO (100%)

**Campos Relevantes:**
| Campo | Tipo | Descripcion |
|-------|------|-------------|
| id | UUID | Primary key |
| profileId | UUID | FK a profiles (usuario padre) |
| relationshipType | TEXT | mother/father/guardian/tutor/other |
| notificationFrequency | TEXT | realtime/daily/weekly/monthly/on_demand |
| alertOnLowPerformance | BOOLEAN | default: true |
| alertOnInactivityDays | INT | default: 7 |
| alertOnAchievementUnlocked | BOOLEAN | default: true |
| alertOnRankPromotion | BOOLEAN | default: true |
| preferredReportFormat | TEXT | email/in_app/both |
| preferredLanguage | TEXT | default: es-MX |
| dashboardWidgets | JSONB | Widgets del dashboard |
| isVerified | BOOLEAN | default: false |
| isActive | BOOLEAN | default: true |

### ParentStudentLink Entity

**Ubicacion:** `apps/backend/src/modules/auth/entities/parent-student-link.entity.ts`

**Estado:** COMPLETO (100%)

**Campos Relevantes:**
| Campo | Tipo | Descripcion |
|-------|------|-------------|
| parentAccountId | UUID | FK a parent_accounts |
| studentId | UUID | FK a profiles (estudiante) |
| relationshipType | TEXT | mother/father/guardian/etc |
| canViewProgress | BOOLEAN | default: true |
| canViewGrades | BOOLEAN | default: true |
| canReceiveNotifications | BOOLEAN | default: true |
| linkStatus | TEXT | pending/active/suspended/revoked |
| isVerified | BOOLEAN | default: false |

### ParentNotification Entity

**Ubicacion:** `apps/backend/src/modules/auth/entities/parent-notification.entity.ts`

**Estado:** COMPLETO (100%)

**Tipos de Notificacion Soportados:**
```typescript
export enum ParentNotificationType {
  DAILY_SUMMARY = 'daily_summary',
  WEEKLY_REPORT = 'weekly_report',
  MONTHLY_REPORT = 'monthly_report',
  LOW_PERFORMANCE = 'low_performance',
  INACTIVITY_ALERT = 'inactivity_alert',
  ACHIEVEMENT_UNLOCKED = 'achievement_unlocked',
  RANK_PROMOTION = 'rank_promotion',
  ASSIGNMENT_DUE = 'assignment_due',
  ASSIGNMENT_SUBMITTED = 'assignment_submitted',
  RECOMMENDATION = 'recommendation',
  CUSTOM = 'custom',
}
```

---

## Lo que Falta para Completar (60%)

### 1. WeeklyReportService (20% de lo faltante)

```typescript
// services/weekly-report.service.ts (NUEVO)
@Injectable()
export class WeeklyReportService {
  constructor(
    private readonly parentAccountsRepo: Repository<ParentAccount>,
    private readonly parentStudentLinksRepo: Repository<ParentStudentLink>,
    private readonly reportAggregator: ReportContentAggregator,
    private readonly emailTemplateService: EmailTemplateService,
    private readonly emailService: EmailService,
    private readonly parentNotificationsService: ParentNotificationsService,
  ) {}

  /**
   * Genera y envia reportes semanales a todos los padres activos
   * Ejecutado por cron: Domingos 8:00 AM
   */
  @Cron('0 8 * * 0') // Domingo 8:00 AM
  async generateAllReports(): Promise<ReportGenerationResult>;

  /**
   * Genera reporte para un padre especifico
   */
  async generateReport(
    parentAccountId: string,
    options?: ReportOptions
  ): Promise<WeeklyReport>;

  /**
   * Envia reporte por email
   */
  async sendReport(
    parentAccount: ParentAccount,
    report: WeeklyReport
  ): Promise<void>;

  /**
   * Obtiene rango de fechas de la semana anterior
   */
  getWeekRange(): { start: Date; end: Date };

  /**
   * Genera preview de reporte (sin enviar)
   */
  async previewReport(
    parentAccountId: string,
    studentId: string
  ): Promise<WeeklyReport>;
}

interface WeeklyReport {
  parentAccount: {
    id: string;
    name: string;
    email: string;
  };
  student: {
    id: string;
    displayName: string;
    avatarUrl: string;
  };
  period: {
    start: Date;
    end: Date;
  };
  summary: {
    totalSessions: number;
    totalTimeMinutes: number;
    exercisesCompleted: number;
    averageScore: number;
    xpEarned: number;
    coinsEarned: number;
  };
  progress: {
    modulesInProgress: ModuleProgress[];
    completedThisWeek: ModuleProgress[];
  };
  achievements: Achievement[];
  alerts: Alert[];
  recommendations: Recommendation[];
  comparison: {
    vsLastWeek: {
      timeChange: number; // porcentaje
      scoreChange: number;
      exercisesChange: number;
    };
    vsPeers: {
      percentile: number; // percentil vs companeros
    };
  };
}
```

### 2. ReportContentAggregator (20% de lo faltante)

```typescript
// services/report-content-aggregator.service.ts (NUEVO)
@Injectable()
export class ReportContentAggregator {

  /**
   * Agrega todo el contenido necesario para el reporte
   */
  async aggregate(
    studentId: string,
    weekStart: Date,
    weekEnd: Date
  ): Promise<AggregatedContent>;

  /**
   * Obtiene resumen de sesiones
   */
  async getSessionsSummary(
    studentId: string,
    start: Date,
    end: Date
  ): Promise<SessionsSummary>;

  /**
   * Obtiene ejercicios completados
   */
  async getCompletedExercises(
    studentId: string,
    start: Date,
    end: Date
  ): Promise<ExerciseCompletion[]>;

  /**
   * Obtiene progreso en modulos
   */
  async getModuleProgress(studentId: string): Promise<ModuleProgress[]>;

  /**
   * Obtiene logros desbloqueados
   */
  async getUnlockedAchievements(
    studentId: string,
    start: Date,
    end: Date
  ): Promise<Achievement[]>;

  /**
   * Genera alertas si aplica
   */
  async generateAlerts(
    studentId: string,
    sessionsSummary: SessionsSummary,
    parentPreferences: ParentAccount
  ): Promise<Alert[]>;

  /**
   * Genera recomendaciones personalizadas
   */
  async generateRecommendations(
    studentId: string,
    moduleProgress: ModuleProgress[]
  ): Promise<Recommendation[]>;

  /**
   * Compara con semana anterior
   */
  async compareWithLastWeek(
    studentId: string,
    currentWeekData: AggregatedContent
  ): Promise<WeekComparison>;
}

interface AggregatedContent {
  sessions: SessionsSummary;
  exercises: ExerciseCompletion[];
  modules: ModuleProgress[];
  achievements: Achievement[];
  xp: number;
  coins: number;
  rank: RankInfo;
}

interface SessionsSummary {
  count: number;
  totalMinutes: number;
  averageMinutesPerSession: number;
  longestSession: number;
  activeDays: number;
}

interface ExerciseCompletion {
  exerciseId: string;
  title: string;
  moduleTitle: string;
  score: number;
  completedAt: Date;
  timeSpent: number;
}

interface Alert {
  type: 'low_performance' | 'inactivity' | 'declining_trend';
  severity: 'info' | 'warning' | 'critical';
  message: string;
  data: Record<string, any>;
}

interface Recommendation {
  type: 'practice' | 'review' | 'challenge' | 'break';
  title: string;
  description: string;
  targetModuleId?: string;
  targetExerciseId?: string;
}
```

### 3. EmailTemplateService (10% de lo faltante)

```typescript
// services/email-template.service.ts (NUEVO)
@Injectable()
export class EmailTemplateService {
  private handlebars: typeof Handlebars;

  /**
   * Renderiza template HTML con datos
   */
  async render(
    templateName: string,
    data: Record<string, any>,
    locale: string = 'es-MX'
  ): Promise<string>;

  /**
   * Genera charts como imagenes base64
   */
  async generateChartImage(
    chartConfig: ChartConfiguration
  ): Promise<string>;

  /**
   * Carga template desde archivo
   */
  private loadTemplate(templateName: string): string;

  /**
   * Registra helpers de Handlebars
   */
  private registerHelpers(): void;
}
```

### 4. Email Templates (5% de lo faltante)

**Template: weekly-report.hbs**
```handlebars
<!DOCTYPE html>
<html>
<head>
  <style>
    /* Estilos inline para compatibilidad email */
  </style>
</head>
<body>
  <div class="container">
    <!-- Header con logo del tenant -->
    <header>
      <img src="{{branding.logoUrl}}" alt="{{branding.platformName}}" />
      <h1>Reporte Semanal de {{student.displayName}}</h1>
      <p>{{formatDateRange period.start period.end}}</p>
    </header>

    <!-- Resumen -->
    <section class="summary">
      <h2>Resumen de la Semana</h2>
      <div class="stats-grid">
        <div class="stat">
          <span class="value">{{summary.totalTimeMinutes}}</span>
          <span class="label">Minutos de estudio</span>
        </div>
        <div class="stat">
          <span class="value">{{summary.exercisesCompleted}}</span>
          <span class="label">Ejercicios completados</span>
        </div>
        <div class="stat">
          <span class="value">{{formatPercent summary.averageScore}}</span>
          <span class="label">Promedio</span>
        </div>
        <div class="stat">
          <span class="value">{{summary.xpEarned}}</span>
          <span class="label">XP ganados</span>
        </div>
      </div>
    </section>

    <!-- Alertas si las hay -->
    {{#if alerts.length}}
    <section class="alerts">
      <h2>Alertas</h2>
      {{#each alerts}}
      <div class="alert alert-{{severity}}">
        <p>{{message}}</p>
      </div>
      {{/each}}
    </section>
    {{/if}}

    <!-- Progreso en modulos -->
    <section class="progress">
      <h2>Progreso en Modulos</h2>
      {{#each progress.modulesInProgress}}
      <div class="module-progress">
        <span class="module-name">{{title}}</span>
        <div class="progress-bar">
          <div class="progress-fill" style="width: {{percentComplete}}%"></div>
        </div>
        <span class="percent">{{percentComplete}}%</span>
      </div>
      {{/each}}
    </section>

    <!-- Logros -->
    {{#if achievements.length}}
    <section class="achievements">
      <h2>Logros Desbloqueados</h2>
      <div class="achievements-grid">
        {{#each achievements}}
        <div class="achievement">
          <img src="{{iconUrl}}" alt="{{name}}" />
          <span>{{name}}</span>
        </div>
        {{/each}}
      </div>
    </section>
    {{/if}}

    <!-- Recomendaciones -->
    <section class="recommendations">
      <h2>Recomendaciones</h2>
      {{#each recommendations}}
      <div class="recommendation">
        <h4>{{title}}</h4>
        <p>{{description}}</p>
      </div>
      {{/each}}
    </section>

    <!-- Footer -->
    <footer>
      <p>Este reporte se genera automaticamente cada semana.</p>
      <p>
        <a href="{{parentPortalUrl}}">Ver portal de padres</a> |
        <a href="{{unsubscribeUrl}}">Cambiar preferencias</a>
      </p>
    </footer>
  </div>
</body>
</html>
```

### 5. Scheduled Job (5% de lo faltante)

```typescript
// jobs/weekly-report.job.ts (NUEVO)
@Injectable()
export class WeeklyReportJob {
  private readonly logger = new Logger(WeeklyReportJob.name);

  constructor(
    private readonly weeklyReportService: WeeklyReportService,
  ) {}

  /**
   * Ejecuta generacion de reportes semanales
   * Cron: Domingos a las 8:00 AM (hora local del tenant)
   */
  @Cron('0 8 * * 0', {
    name: 'weekly-parent-reports',
    timeZone: 'America/Mexico_City',
  })
  async handleCron(): Promise<void> {
    this.logger.log('Iniciando generacion de reportes semanales...');

    const startTime = Date.now();

    try {
      const result = await this.weeklyReportService.generateAllReports();

      this.logger.log(
        `Reportes completados: ${result.sent}/${result.total} en ${Date.now() - startTime}ms`
      );

      if (result.failed > 0) {
        this.logger.warn(`${result.failed} reportes fallaron`);
      }
    } catch (error) {
      this.logger.error('Error generando reportes semanales', error);
    }
  }
}
```

---

## API REST Endpoints (A Implementar)

| Metodo | Ruta | Descripcion | Roles |
|--------|------|-------------|-------|
| GET | `/api/v1/parent/reports/weekly` | Listar reportes recibidos | PARENT |
| GET | `/api/v1/parent/reports/weekly/:id` | Ver reporte especifico | PARENT |
| POST | `/api/v1/parent/reports/weekly/preview` | Preview de reporte | ADMIN |
| POST | `/api/v1/parent/reports/weekly/resend/:id` | Reenviar reporte | ADMIN |
| PATCH | `/api/v1/parent/preferences` | Actualizar preferencias | PARENT |

---

## Criterios de Aceptacion

### Funcionales
- [ ] Reportes se generan automaticamente cada domingo
- [ ] Email incluye resumen de actividad semanal
- [ ] Muestra progreso en modulos con barras visuales
- [ ] Lista logros desbloqueados con iconos
- [ ] Incluye alertas si hay bajo rendimiento
- [ ] Incluye recomendaciones personalizadas
- [ ] Padre puede ver historial de reportes en portal
- [ ] Padre puede cambiar frecuencia de notificaciones

### No Funcionales
- [ ] Generacion de reporte < 5 segundos por estudiante
- [ ] Email renderiza correctamente en Gmail, Outlook, Apple Mail
- [ ] Soporte para modo oscuro en email
- [ ] Graficos visibles como imagenes (no JS)

### Seguridad
- [ ] Solo padres verificados reciben reportes
- [ ] Link de unsubscribe firmado con token
- [ ] No exponer datos sensibles en email
- [ ] Rate limiting en API de reportes

---

## Dependencias

### Bloqueado Por
- ParentAccount Entity (COMPLETO)
- ParentStudentLink Entity (COMPLETO)
- ParentNotification Entity (COMPLETO)
- Progress Tracking Module (EXISTENTE)
- Gamification Module (EXISTENTE)
- Email Service (SendGrid/Nodemailer)

### Bloquea
- Monthly Reports
- Custom Report Schedules
- PDF Export of Reports

---

## Estimacion de Esfuerzo Restante

| Componente | Horas Estimadas |
|------------|-----------------|
| WeeklyReportService | 6h |
| ReportContentAggregator | 8h |
| EmailTemplateService | 4h |
| Email Templates (HTML/CSS) | 6h |
| Scheduled Job | 2h |
| API Endpoints | 4h |
| Tests | 4h |
| **Total** | **34h** |

---

## Historial de Cambios

| Version | Fecha | Autor | Cambios |
|---------|-------|-------|---------|
| 1.0 | 2026-01-27 | Architecture Analyst | Creacion inicial |

---

*Documento: ET-PAR-001-weekly-reports.md*
*Generado: 2026-01-27*
