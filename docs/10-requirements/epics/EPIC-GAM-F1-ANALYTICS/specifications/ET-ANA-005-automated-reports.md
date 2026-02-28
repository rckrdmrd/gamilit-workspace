---
titulo: "ET-ANA-005: Automated Reports"
tipo: especificacion-tecnica
fecha_creacion: "2025-10-01"
ultima_actualizacion: "2026-02-28"
estado: activo
---

# ET-ANA-005: Automated Reports

## Metadata

| Campo | Valor |
|-------|-------|
| **ID** | ET-ANA-005 |
| **Modulo** | Analytics |
| **Tipo** | Especificacion Tecnica |
| **Estado** | Parcialmente Implementado |
| **Completitud** | 35% |
| **Version** | 1.0 |
| **Fecha Creacion** | 2026-01-27 |
| **Ultima Actualizacion** | 2026-01-27 |
| **Autor** | Architecture Analyst |

---

## Referencias

### Requerimiento Funcional
- RF-ANA-006: Automated Progress Reports

### User Stories
- US-ANA-006: Scheduled Report Generation

---

## Descripcion Funcional

Sistema de reportes automatizados:
- Reportes programados (diario, semanal, mensual)
- Generacion en PDF y Excel
- Envio por email
- Templates personalizables
- Reportes para estudiantes, profesores, padres

---

## Arquitectura

### Diagrama de Componentes

```
+----------------------------------------------------------+
|                   CRON SCHEDULER                          |
|  - ScheduledReportsJob                                   |
+-----------------------------+----------------------------+
                              |
+-----------------------------v----------------------------+
|                  BACKEND (NestJS)                        |
|  - ScheduledReportsService                               |
|  - ReportGeneratorService                                |
|  - PDFService (puppeteer)                                |
|  - ExcelService (exceljs)                                |
|  - MailService                                           |
+-----------------------------+----------------------------+
                              |
+-----------------------------v----------------------------+
|               DATA SOURCES                                |
|  - progress_tracking.*                                   |
|  - gamification_system.*                                 |
|  - educational_content.*                                 |
+-----------------------------+----------------------------+
                              |
+-----------------------------v----------------------------+
|               OUTPUT                                      |
|  - PDF File                                              |
|  - Excel File                                            |
|  - Email                                                 |
+----------------------------------------------------------+
```

---

## Implementacion Existente

### Backend - ScheduledReportsService

**Ubicacion:** `apps/backend/src/modules/teacher/services/scheduled-reports.service.ts`

**Estado:** PARCIAL (40%)

```typescript
@Injectable()
export class ScheduledReportsService {
  /**
   * Genera reporte de progreso del aula
   */
  async generateClassroomReport(
    classroomId: string,
    period: 'daily' | 'weekly' | 'monthly'
  ): Promise<ReportData>;

  /**
   * Lista reportes programados
   */
  async getScheduledReports(userId: string): Promise<ScheduledReport[]>;

  /**
   * Crea reporte programado
   */
  async createScheduledReport(
    data: CreateScheduledReportDto
  ): Promise<ScheduledReport>;
}
```

### Backend - Export Service (Excel)

**Ubicacion:** `apps/backend/src/modules/admin/services/export.service.ts`

**Estado:** COMPLETO (100%)

```typescript
@Injectable()
export class ExportService {
  /**
   * Exporta datos a Excel
   */
  async exportToExcel(
    data: ExportableData[],
    columns: ExcelColumn[],
    options?: ExcelOptions
  ): Promise<Buffer>;

  /**
   * Exporta reporte de estudiantes
   */
  async exportStudentsReport(
    classroomId: string,
    filters?: ReportFilters
  ): Promise<Buffer>;
}
```

---

## Lo que Falta para Completar (65%)

### 1. PDFService (20%)

```typescript
// services/pdf.service.ts (NUEVO)
@Injectable()
export class PDFService {
  /**
   * Genera PDF desde template HTML
   */
  async generateFromTemplate(
    templateName: string,
    data: Record<string, unknown>
  ): Promise<Buffer>;

  /**
   * Genera PDF de reporte de progreso
   */
  async generateProgressReport(
    studentId: string,
    period: ReportPeriod
  ): Promise<Buffer>;

  /**
   * Genera PDF de reporte de aula
   */
  async generateClassroomReport(
    classroomId: string,
    period: ReportPeriod
  ): Promise<Buffer>;

  /**
   * Incluye graficos como imagenes
   */
  private async renderChartToImage(
    chartConfig: ChartConfiguration
  ): Promise<string>; // base64
}
```

### 2. ReportTemplates (15%)

```handlebars
{{! templates/reports/student-progress.hbs }}
<!DOCTYPE html>
<html>
<head>
  <style>
    /* Estilos para PDF */
    .report-header { ... }
    .report-section { ... }
    .chart-container { ... }
  </style>
</head>
<body>
  <div class="report-header">
    <img src="{{branding.logoUrl}}" />
    <h1>Reporte de Progreso</h1>
    <p>Periodo: {{formatDateRange period.start period.end}}</p>
  </div>

  <div class="report-section">
    <h2>Resumen General</h2>
    <div class="stats-grid">
      <div class="stat">
        <span class="value">{{summary.exercisesCompleted}}</span>
        <span class="label">Ejercicios Completados</span>
      </div>
      <div class="stat">
        <span class="value">{{summary.averageScore}}%</span>
        <span class="label">Promedio</span>
      </div>
      <div class="stat">
        <span class="value">{{summary.timeSpent}} hrs</span>
        <span class="label">Tiempo de Estudio</span>
      </div>
    </div>
  </div>

  <div class="report-section">
    <h2>Progreso por Modulo</h2>
    <img src="{{charts.moduleProgress}}" />
  </div>

  <div class="report-section">
    <h2>Logros Desbloqueados</h2>
    {{#each achievements}}
    <div class="achievement">
      <img src="{{iconUrl}}" />
      <span>{{name}}</span>
    </div>
    {{/each}}
  </div>
</body>
</html>
```

### 3. Scheduled Jobs (15%)

```typescript
// jobs/scheduled-reports.job.ts (NUEVO)
@Injectable()
export class ScheduledReportsJob {
  /**
   * Genera reportes diarios
   * Cron: 6:00 AM
   */
  @Cron('0 6 * * *')
  async generateDailyReports(): Promise<void>;

  /**
   * Genera reportes semanales
   * Cron: Lunes 7:00 AM
   */
  @Cron('0 7 * * 1')
  async generateWeeklyReports(): Promise<void>;

  /**
   * Genera reportes mensuales
   * Cron: Dia 1 de cada mes 8:00 AM
   */
  @Cron('0 8 1 * *')
  async generateMonthlyReports(): Promise<void>;

  /**
   * Procesa reportes programados pendientes
   */
  private async processScheduledReports(frequency: string): Promise<void>;
}
```

### 4. Report Subscription Entity (10%)

```sql
-- tables/report_subscriptions.sql (NUEVO)
CREATE TABLE admin_dashboard.report_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth_management.profiles(id),
  report_type TEXT NOT NULL, -- 'progress', 'classroom', 'student_list'
  frequency TEXT NOT NULL, -- 'daily', 'weekly', 'monthly'
  target_id UUID, -- classroom_id or student_id
  output_format TEXT NOT NULL DEFAULT 'pdf', -- 'pdf', 'excel', 'both'
  send_email BOOLEAN NOT NULL DEFAULT TRUE,
  email_recipients TEXT[], -- Additional recipients
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  last_generated_at TIMESTAMPTZ,
  next_scheduled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_report_subs_user ON admin_dashboard.report_subscriptions(user_id);
CREATE INDEX idx_report_subs_next ON admin_dashboard.report_subscriptions(next_scheduled_at);
```

### 5. Email Delivery (5%)

```typescript
// services/report-email.service.ts (NUEVO)
@Injectable()
export class ReportEmailService {
  /**
   * Envia reporte por email
   */
  async sendReport(
    recipients: string[],
    report: Buffer,
    reportType: string,
    period: ReportPeriod
  ): Promise<void>;

  /**
   * Genera subject segun tipo de reporte
   */
  private getSubject(reportType: string, period: ReportPeriod): string;
}
```

---

## Tipos de Reportes

| Tipo | Destinatario | Contenido | Frecuencia |
|------|--------------|-----------|------------|
| Student Progress | Estudiante/Padre | Progreso individual | Semanal/Mensual |
| Classroom Summary | Profesor | Resumen del aula | Semanal |
| Performance Report | Admin | Metricas generales | Mensual |
| Risk Alert | Profesor | Estudiantes en riesgo | Diario |

---

## API REST Endpoints

| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| GET | `/reports/subscriptions` | Mis suscripciones |
| POST | `/reports/subscriptions` | Crear suscripcion |
| DELETE | `/reports/subscriptions/:id` | Eliminar suscripcion |
| POST | `/reports/generate` | Generar reporte ad-hoc |
| GET | `/reports/history` | Historial de reportes |
| GET | `/reports/:id/download` | Descargar reporte |

---

## Criterios de Aceptacion

### Funcionales
- [x] Export a Excel basico
- [x] Datos de progreso disponibles
- [ ] Generacion de PDF
- [ ] Templates personalizables
- [ ] Suscripciones programadas
- [ ] Envio automatico por email
- [ ] Historial de reportes generados

### No Funcionales
- [ ] PDF < 5 segundos de generacion
- [ ] Soporte multi-tenant (branding)
- [ ] Queue para procesamiento masivo
- [ ] Retry en fallos de email

---

## Dependencias

### Bloqueado Por
- Analytics API (COMPLETO)
- Mail Service (COMPLETO)
- Progress Charts (COMPLETO)

### Bloquea
- Parent Weekly Reports
- Admin Analytics Dashboard
- School-wide Reports

---

## Estimacion de Esfuerzo Restante

| Componente | Horas Estimadas |
|------------|-----------------|
| PDFService | 10h |
| Report Templates | 8h |
| Scheduled Jobs | 6h |
| Subscription Entity | 3h |
| Email Delivery | 3h |
| Frontend UI | 6h |
| Tests | 4h |
| **Total** | **40h** |

---

## Historial de Cambios

| Version | Fecha | Autor | Cambios |
|---------|-------|-------|---------|
| 1.0 | 2026-01-27 | Architecture Analyst | Creacion inicial |

---

*Documento: ET-ANA-005-automated-reports.md*
*Generado: 2026-01-27*
