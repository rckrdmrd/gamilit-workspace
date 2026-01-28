---
id: "ET-TCH-006"
title: "Sistema de Reportes - Especificacion Tecnica"
type: "Especificacion Tecnica"
status: "Implementado"
priority: "P1"
epic: "EXT-001"
module: "teacher"
labels: ["teacher", "reports", "pdf", "excel", "export", "scheduled"]
created_date: "2026-01-27"
updated_date: "2026-01-27"
related_rf: ["RF-TCH-005a", "RF-TCH-005b", "RF-TCH-005c"]
related_us: ["US-PM-005b"]
---

# ET-TCH-006: Sistema de Reportes - Especificacion Tecnica

## Informacion General

| Campo | Valor |
|-------|-------|
| **ID** | ET-TCH-006 |
| **Epic** | EXT-001 - Portal de Maestros |
| **RF Relacionados** | RF-TCH-005a (Generacion), RF-TCH-005b (Templates), RF-TCH-005c (Exportacion) |
| **US Relacionadas** | US-PM-005b |
| **Prioridad** | P1 - Alta |
| **Estado** | Implementado |

---

## Descripcion Tecnica

Sistema de generacion y exportacion de reportes que permite a los maestros:

1. **Generacion de Reportes**: Crear reportes de progreso, calificaciones, asistencia
2. **Templates**: Seleccionar templates predefinidos
3. **Exportacion**: Exportar a PDF y Excel
4. **Reportes Programados**: Programar envio automatico
5. **Compartir Reportes**: Compartir con otros maestros o admin
6. **Almacenamiento**: Guardar reportes generados

---

## Componentes Frontend

### Paginas Principales

| Componente | Path | Descripcion |
|------------|------|-------------|
| `TeacherReportsPage` | `apps/frontend/src/apps/teacher/pages/TeacherReportsPage.tsx` | Pagina de reportes |

### Componentes de Reportes

| Componente | Path | Descripcion |
|------------|------|-------------|
| `ReportGenerator` | `apps/frontend/src/apps/teacher/components/reports/ReportGenerator.tsx` | Generador de reportes |
| `ReportTemplateSelector` | `apps/frontend/src/apps/teacher/components/reports/ReportTemplateSelector.tsx` | Selector de templates |

### API Frontend

| API | Path | Descripcion |
|-----|------|-------------|
| `reportsApi` | `apps/frontend/src/services/api/teacher/reportsApi.ts` | API de reportes |

---

## Servicios Backend

### Servicios Principales

| Servicio | Path | Descripcion |
|----------|------|-------------|
| `ReportsService` | `apps/backend/src/modules/teacher/services/reports.service.ts` | Generacion PDF/Excel |
| `TeacherReportsService` | `apps/backend/src/modules/teacher/services/teacher-reports.service.ts` | CRUD de reportes |
| `ScheduledReportsService` | `apps/backend/src/modules/teacher/services/scheduled-reports.service.ts` | Reportes programados |
| `SharedReportsService` | `apps/backend/src/modules/teacher/services/shared-reports.service.ts` | Compartir reportes |
| `StorageService` | `apps/backend/src/modules/teacher/services/storage.service.ts` | Almacenamiento de archivos |

### Controladores

| Controlador | Path | Descripcion |
|-------------|------|-------------|
| `TeacherController` | `apps/backend/src/modules/teacher/controllers/teacher.controller.ts` | Endpoints de reportes |

### Entidades

| Entidad | Path | Descripcion |
|---------|------|-------------|
| `TeacherReport` | `apps/backend/src/modules/teacher/entities/teacher-report.entity.ts` | Entidad de reporte |
| `ScheduledReport` | `apps/backend/src/modules/teacher/entities/scheduled-report.entity.ts` | Reporte programado |
| `SharedReport` | `apps/backend/src/modules/teacher/entities/shared-report.entity.ts` | Reporte compartido |

### DTOs

| DTO | Path | Descripcion |
|-----|------|-------------|
| `GenerateReportsDto` | `apps/backend/src/modules/teacher/dto/` | DTO para generar reporte |
| `GenerateReportDto` | `apps/backend/src/modules/teacher/dto/reports.dto.ts` | DTO de configuracion |
| `TeacherReportsDto` | `apps/backend/src/modules/teacher/dto/teacher-reports.dto.ts` | DTOs de reportes |
| `GetRecentReportsQueryDto` | `apps/backend/src/modules/teacher/dto/teacher-reports.dto.ts` | Query de recientes |
| `ReportMetadataDto` | `apps/backend/src/modules/teacher/dto/teacher-reports.dto.ts` | Metadata de reporte |
| `ReportStatsDto` | `apps/backend/src/modules/teacher/dto/teacher-reports.dto.ts` | Estadisticas |

---

## Tablas/Schemas de Base de Datos

### Schema: `social_features`

| Tabla | Descripcion | Columnas Clave |
|-------|-------------|----------------|
| `teacher_reports` | Reportes generados | id, teacher_id, title, type, format, file_path, generated_at |
| `scheduled_reports` | Reportes programados | id, teacher_id, report_config, schedule_cron, next_run, status |
| `shared_reports` | Reportes compartidos | id, report_id, shared_with_id, permission, shared_at |

### Tipos de Reporte

```sql
report_type VARCHAR(50) CHECK (report_type IN (
  'progress',        -- Progreso de estudiantes
  'grades',          -- Calificaciones
  'attendance',      -- Asistencia (futuro)
  'engagement',      -- Engagement
  'classroom_summary', -- Resumen de aula
  'student_detail'   -- Detalle de estudiante
))
```

### Formatos

```sql
format VARCHAR(10) CHECK (format IN ('pdf', 'xlsx', 'csv'))
```

### Permisos de Compartir

```typescript
enum SharePermission {
  VIEW = 'view',
  DOWNLOAD = 'download',
  EDIT = 'edit',
}
```

### Estados de Reporte Programado

```typescript
enum ScheduleStatus {
  ACTIVE = 'active',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  FAILED = 'failed',
}
```

---

## APIs Endpoints

### Generacion de Reportes

| Endpoint | Metodo | Descripcion |
|----------|--------|-------------|
| `/api/v1/teacher/reports/generate` | POST | Generar reporte |
| `/api/v1/teacher/reports/download/:id` | GET | Descargar reporte |

### CRUD de Reportes

| Endpoint | Metodo | Descripcion |
|----------|--------|-------------|
| `/api/v1/teacher/reports` | GET | Listar reportes recientes |
| `/api/v1/teacher/reports/:id` | GET | Obtener reporte por ID |
| `/api/v1/teacher/reports/:id` | DELETE | Eliminar reporte |
| `/api/v1/teacher/reports/stats` | GET | Estadisticas de reportes |

### Reportes Programados

| Endpoint | Metodo | Descripcion |
|----------|--------|-------------|
| `/api/v1/teacher/reports/scheduled` | GET | Listar programados |
| `/api/v1/teacher/reports/scheduled` | POST | Crear programado |
| `/api/v1/teacher/reports/scheduled/:id` | PUT | Actualizar programado |
| `/api/v1/teacher/reports/scheduled/:id` | DELETE | Eliminar programado |

### Compartir Reportes

| Endpoint | Metodo | Descripcion |
|----------|--------|-------------|
| `/api/v1/teacher/reports/:id/share` | POST | Compartir reporte |
| `/api/v1/teacher/reports/shared-with-me` | GET | Reportes compartidos conmigo |

### Ejemplo Request POST /teacher/reports/generate

```json
{
  "reportType": "classroom_summary",
  "classroomId": "uuid-classroom",
  "format": "pdf",
  "dateRange": {
    "from": "2026-01-01",
    "to": "2026-01-31"
  },
  "includeCharts": true,
  "includeSummary": true,
  "groupBy": "module"
}
```

### Ejemplo Response GET /teacher/reports

```json
{
  "reports": [
    {
      "id": "uuid-report-1",
      "title": "Resumen Mensual - Matematicas 6A",
      "type": "classroom_summary",
      "format": "pdf",
      "generatedAt": "2026-01-26T15:00:00Z",
      "fileSize": "245 KB",
      "downloadUrl": "/api/v1/teacher/reports/download/uuid-report-1"
    }
  ],
  "meta": {
    "total": 15,
    "page": 1,
    "limit": 10
  }
}
```

### Ejemplo Request POST /teacher/reports/scheduled

```json
{
  "name": "Reporte Semanal - Lunes",
  "reportConfig": {
    "reportType": "classroom_summary",
    "classroomIds": ["uuid-classroom-1", "uuid-classroom-2"],
    "format": "pdf"
  },
  "scheduleCron": "0 8 * * MON",
  "recipients": ["email1@school.com", "email2@school.com"],
  "isActive": true
}
```

---

## Flujos de Usuario

### Flujo 1: Generar Reporte

```
1. Maestro accede a /teacher/reports
2. Click en "Generar Nuevo Reporte"
3. Seleccionar tipo de reporte
4. Configurar parametros (classroom, fechas, formato)
5. POST /teacher/reports/generate
6. Sistema genera PDF/Excel
7. Descarga automatica o guardar
```

### Flujo 2: Usar Template

```
1. Maestro en ReportGenerator
2. Click en "Usar Template"
3. ReportTemplateSelector muestra opciones
4. Seleccionar template predefinido
5. Ajustar parametros si necesario
6. Generar reporte
```

### Flujo 3: Programar Reporte

```
1. Maestro en reportes
2. Click en "Programar Reporte"
3. Configurar reporte base
4. Seleccionar frecuencia (diario/semanal/mensual)
5. Agregar destinatarios de email
6. POST /teacher/reports/scheduled
7. Sistema ejecuta segun cron
```

### Flujo 4: Compartir Reporte

```
1. Maestro tiene reporte generado
2. Click en "Compartir"
3. Seleccionar destinatario (otro maestro o admin)
4. Seleccionar permiso (view/download)
5. POST /teacher/reports/:id/share
6. Destinatario puede ver en "Compartidos conmigo"
```

### Flujo 5: Descargar Reporte

```
1. Maestro en lista de reportes
2. Click en "Descargar"
3. GET /teacher/reports/download/:id
4. Response con Content-Disposition: attachment
5. Navegador descarga archivo
```

---

## Dependencias

### Dependencias de Modulos

- `ProgressModule` - Para datos de progreso
- `AnalyticsService` - Para metricas
- `MailModule` - Para envio de reportes programados

### Dependencias Externas

- `pdfmake` o `puppeteer` - Para generacion PDF
- `exceljs` - Para generacion Excel
- Almacenamiento de archivos (local o S3)

### Dependencias de User Stories

- Depende de: `US-PM-004*`, `US-PM-005*` (Analytics)
- Habilita: Compliance, auditoria

---

## Criterios de Aceptacion

### CA-01: Generacion de Reportes
- [x] Generar reporte de progreso de classroom
- [x] Generar reporte de calificaciones
- [x] Incluir graficas opcionales
- [x] Incluir resumen ejecutivo

### CA-02: Formatos
- [x] Exportar a PDF
- [x] Exportar a Excel (xlsx)
- [x] Exportar a CSV

### CA-03: Templates
- [x] Templates predefinidos disponibles
- [x] Personalizar parametros de template
- [x] Guardar como nuevo template (futuro)

### CA-04: Reportes Programados
- [x] Programar por frecuencia (cron)
- [x] Enviar por email a destinatarios
- [x] Pausar/reanudar programacion
- [x] Ver historial de ejecuciones

### CA-05: Compartir
- [x] Compartir con otros maestros
- [x] Permisos granulares (view/download)
- [x] Ver reportes compartidos conmigo

### CA-06: Almacenamiento
- [x] Guardar reportes generados
- [x] Listar reportes recientes
- [x] Eliminar reportes antiguos

---

## Notas de Implementacion

### Generacion PDF con Puppeteer

```typescript
@Injectable()
export class ReportsService {
  async generatePdf(config: GenerateReportDto): Promise<Buffer> {
    const html = await this.renderTemplate(config);
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setContent(html);
    const pdf = await page.pdf({ format: 'A4' });
    await browser.close();
    return pdf;
  }
}
```

### Generacion Excel con ExcelJS

```typescript
async generateExcel(config: GenerateReportDto): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Reporte');

  // Headers
  sheet.addRow(['Estudiante', 'Progreso', 'Score', 'Ultimo Acceso']);

  // Data
  for (const student of data.students) {
    sheet.addRow([student.name, student.progress, student.score, student.lastActivity]);
  }

  return workbook.xlsx.writeBuffer();
}
```

### CRON para Reportes Programados

```typescript
@Cron(CronExpression.EVERY_HOUR)
async processScheduledReports() {
  const dueReports = await this.scheduledReportsService.getDueReports();
  for (const scheduled of dueReports) {
    const report = await this.reportsService.generate(scheduled.reportConfig);
    await this.mailService.sendReport(scheduled.recipients, report);
    await this.scheduledReportsService.markExecuted(scheduled.id);
  }
}
```

### Almacenamiento

```typescript
// Local storage para desarrollo
@Injectable()
export class StorageService {
  private readonly storagePath = '/uploads/reports';

  async save(buffer: Buffer, filename: string): Promise<string> {
    const filePath = path.join(this.storagePath, filename);
    await fs.writeFile(filePath, buffer);
    return filePath;
  }

  async get(filePath: string): Promise<Buffer> {
    return fs.readFile(filePath);
  }
}
```

---

## Referencias

- US-PM-005b: Generacion de Reportes
- DASHBOARD-REPORTS-INTEGRATION.md: Integracion con Dashboard
- TRACEABILITY.yml: Mapeo de implementacion

---

**Creado:** 2026-01-27
**Sistema:** SIMCO (Sistema Indexado Modular por Contexto)
