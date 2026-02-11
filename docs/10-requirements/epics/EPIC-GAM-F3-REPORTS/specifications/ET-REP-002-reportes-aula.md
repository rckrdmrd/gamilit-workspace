---
id: "ET-REP-002"
title: "Reportes de Aula - Especificacion Tecnica"
type: "Especificacion Tecnica"
status: "Implementado"
priority: "P1"
epic: "EXT-005"
module: "reports"
labels: ["reports", "classroom", "analytics", "teacher"]
created_date: "2026-01-27"
updated_date: "2026-01-27"
related_rf: ["RF-REP-002"]
related_us: ["US-REP-001"]
---

# ET-REP-002: Reportes de Aula - Especificacion Tecnica

## Informacion General

| Campo | Valor |
|-------|-------|
| **ID** | ET-REP-002 |
| **Epic** | EXT-005 - Reportes Avanzados |
| **RF Relacionado** | RF-REP-002 (Classroom Reports) |
| **US Relacionadas** | US-REP-001 |
| **Prioridad** | P1 - Alta |
| **Estado** | Implementado |

---

## Descripcion Tecnica

El sistema de reportes de aula proporciona a los profesores una vista completa del rendimiento grupal, incluyendo:

1. **Dashboard de Clase**: Resumen general con metricas agregadas
2. **Tabla de Estudiantes**: Vista tabular con filtros y ordenamiento
3. **Graficos de Rendimiento**: Distribucion, tendencias, engagement
4. **Identificacion de Riesgo**: Estudiantes que requieren atencion
5. **Comparativas**: Rendimiento vs promedio institucional

---

## Componentes Frontend

### Paginas Principales

| Componente | Path | Descripcion |
|------------|------|-------------|
| `TeacherReportsPage` | `apps/frontend/src/apps/teacher/pages/TeacherReportsPage.tsx` | Pagina principal de reportes |
| `TeacherAnalytics` | `apps/frontend/src/apps/teacher/pages/TeacherAnalytics.tsx` | Pagina de analytics |
| `TeacherProgressPage` | `apps/frontend/src/apps/teacher/pages/TeacherProgressPage.tsx` | Pagina de progreso |

### Componentes de Reportes

| Componente | Path | Descripcion |
|------------|------|-------------|
| `ReportGenerator` | `apps/frontend/src/apps/teacher/components/reports/ReportGenerator.tsx` | Generador de reportes configurable |
| `ReportTemplateSelector` | `apps/frontend/src/apps/teacher/components/reports/ReportTemplateSelector.tsx` | Selector de plantillas |
| `ClassProgressDashboard` | `apps/frontend/src/apps/teacher/components/progress/ClassProgressDashboard.tsx` | Dashboard de progreso de clase |

### Componentes de Analytics

| Componente | Path | Descripcion |
|------------|------|-------------|
| `LearningAnalyticsDashboard` | `apps/frontend/src/apps/teacher/components/analytics/LearningAnalyticsDashboard.tsx` | Dashboard principal de analytics |
| `EngagementMetricsChart` | `apps/frontend/src/apps/teacher/components/analytics/EngagementMetricsChart.tsx` | Graficos de engagement |
| `PerformanceInsightsPanel` | `apps/frontend/src/apps/teacher/components/analytics/PerformanceInsightsPanel.tsx` | Panel de insights |

### Hooks

| Hook | Path | Descripcion |
|------|------|-------------|
| `useClassrooms` | `apps/frontend/src/apps/teacher/hooks/useClassrooms.ts` | Datos de classrooms |
| `useClassroomsStats` | `apps/frontend/src/apps/teacher/hooks/useClassroomsStats.ts` | Estadisticas de classrooms |
| `useTeacherDashboard` | `apps/frontend/src/apps/teacher/hooks/useTeacherDashboard.ts` | Datos del dashboard |

---

## Servicios Backend

### Servicios Principales

| Servicio | Path | Descripcion |
|----------|------|-------------|
| `ReportsService` | `apps/backend/src/modules/teacher/services/reports.service.ts` | Generacion de reportes |
| `TeacherReportsService` | `apps/backend/src/modules/teacher/services/teacher-reports.service.ts` | CRUD de reportes generados |
| `SharedReportsService` | `apps/backend/src/modules/teacher/services/shared-reports.service.ts` | Logica compartida de reportes |
| `AnalyticsService` | `apps/backend/src/modules/teacher/services/analytics.service.ts` | Analytics y metricas |
| `TeacherDashboardService` | `apps/backend/src/modules/teacher/services/teacher-dashboard.service.ts` | Dashboard del maestro |

### Metodos del ReportsService

```typescript
class ReportsService {
  // Generar reporte completo
  async generateReport(
    dto: GenerateReportDto,
    userId: string,
    tenantId: string
  ): Promise<{ buffer: Buffer; metadata: GeneratedReportMetadataDto; reportId: string }>;

  // Recolectar datos para reporte
  private async gatherReportData(dto: GenerateReportDto, userId: string): Promise<ReportData>;

  // Generar PDF
  private async generatePDFReport(reportData: ReportData): Promise<Buffer>;

  // Generar Excel
  private async generateExcelReport(reportData: ReportData): Promise<Buffer>;

  // Generar CSV
  private async generateCSVReport(reportData: ReportData): Promise<Buffer>;
}
```

### DTOs

| DTO | Path | Descripcion |
|-----|------|-------------|
| `GenerateReportDto` | `apps/backend/src/modules/teacher/dto/reports.dto.ts` | DTO para generar reporte |
| `GeneratedReportMetadataDto` | `apps/backend/src/modules/teacher/dto/reports.dto.ts` | Metadata del reporte generado |
| `ClassroomStatsDto` | `apps/backend/src/modules/teacher/dto/classroom-progress.dto.ts` | Estadisticas de aula |

---

## Tablas/Schemas de Base de Datos

### Schema: `social_features`

| Tabla | Descripcion | Campos Clave |
|-------|-------------|--------------|
| `classrooms` | Aulas del sistema | id, name, teacher_id, organization_id |
| `classroom_members` | Miembros de aulas | classroom_id, student_id, is_active |
| `teacher_classroom` | Relacion maestro-aula | teacher_id, classroom_id |

### Schema: `progress_tracking`

| Tabla | Descripcion | Campos Clave |
|-------|-------------|--------------|
| `module_progress` | Progreso por modulo | user_id, module_id, completion_percentage |
| `exercise_submissions` | Entregas de ejercicios | user_id, exercise_id, score, submitted_at |

### Schema: `reporting_analytics`

| Tabla | Descripcion | Campos Clave |
|-------|-------------|--------------|
| `teacher_reports` | Reportes generados | id, teacher_id, report_type, report_format, file_path |

### Campos de teacher_reports

| Campo | Tipo | Descripcion |
|-------|------|-------------|
| `id` | UUID | Primary key |
| `teacher_id` | UUID | FK a users |
| `tenant_id` | UUID | FK a organizations |
| `report_name` | VARCHAR(255) | Nombre del reporte |
| `report_type` | ENUM | Tipo: progress, evaluation, intervention, custom |
| `report_format` | ENUM | Formato: pdf, excel, csv |
| `classroom_id` | UUID | FK a classrooms (opcional) |
| `student_count` | INTEGER | Cantidad de estudiantes |
| `period_start` | DATE | Inicio del periodo |
| `period_end` | DATE | Fin del periodo |
| `file_path` | TEXT | Ruta del archivo |
| `file_size_bytes` | BIGINT | Tamano del archivo |
| `generated_at` | TIMESTAMP | Fecha de generacion |

---

## APIs Endpoints

### Reportes de Aula

| Endpoint | Metodo | Descripcion |
|----------|--------|-------------|
| `/api/v1/teacher/classrooms` | GET | Listar aulas del maestro |
| `/api/v1/teacher/classrooms/:id/stats` | GET | Estadisticas de aula |
| `/api/v1/teacher/classrooms/:id/students` | GET | Estudiantes del aula |
| `/api/v1/teacher/classrooms/:id/progress` | GET | Progreso del aula |

### Generacion de Reportes

| Endpoint | Metodo | Descripcion |
|----------|--------|-------------|
| `/api/v1/teacher/reports/generate` | POST | Generar reporte |
| `/api/v1/teacher/reports/recent` | GET | Reportes recientes |
| `/api/v1/teacher/reports/stats` | GET | Estadisticas de reportes |
| `/api/v1/teacher/reports/:id/download` | GET | Descargar reporte |
| `/api/v1/teacher/reports/:id` | DELETE | Eliminar reporte |

### Request: POST /api/v1/teacher/reports/generate

```json
{
  "type": "progress",
  "format": "pdf",
  "classroom_id": "uuid",
  "student_ids": ["uuid1", "uuid2"],
  "start_date": "2026-01-01",
  "end_date": "2026-01-31",
  "include_insights": true,
  "include_recommendations": true
}
```

### Response: POST (exito)

```json
{
  "report_id": "uuid",
  "type": "progress",
  "format": "pdf",
  "generated_at": "2026-01-27T10:00:00Z",
  "generated_by": "uuid",
  "student_count": 25,
  "file_size": 245760
}
```

### Response: GET /api/v1/teacher/classrooms/:id/stats

```json
{
  "classroom_id": "uuid",
  "classroom_name": "Matematicas 6A",
  "summary": {
    "total_students": 25,
    "active_students": 23,
    "average_score": 72.5,
    "average_progress": 65,
    "students_at_risk": 3
  },
  "performance_distribution": {
    "excellent": 5,
    "good": 10,
    "average": 7,
    "needs_improvement": 3
  },
  "module_progress": [
    { "module_id": 1, "name": "Modulo 1", "average_completion": 95 },
    { "module_id": 2, "name": "Modulo 2", "average_completion": 78 },
    { "module_id": 3, "name": "Modulo 3", "average_completion": 45 }
  ],
  "trend": "improving",
  "comparison_with_institution": {
    "class_average": 72.5,
    "institution_average": 70.0,
    "percentile": 65
  }
}
```

---

## Flujos de Usuario

### Flujo 1: Ver Dashboard de Clase

```
1. Profesor navega a /teacher/reports
2. Selecciona aula del selector
3. TeacherReportsPage carga con useClassrooms()
4. Se muestran cards de resumen:
   - Total estudiantes
   - Score promedio
   - Estudiantes en riesgo
   - Ultimo reporte generado
5. Graficos de rendimiento se renderizan
```

### Flujo 2: Generar Reporte de Aula

```
1. Profesor hace click en "Generar Reporte"
2. ReportGenerator component se muestra
3. Configurar opciones:
   - Tipo: Progreso / Evaluacion / Intervencion
   - Formato: PDF / Excel / CSV
   - Periodo: Fechas de inicio y fin
   - Estudiantes: Todos o seleccion
4. Click en "Generar"
5. POST /api/v1/teacher/reports/generate
6. Spinner mientras se genera
7. Download automatico del archivo
8. Reporte guardado en historial
```

### Flujo 3: Ver Reportes Recientes

```
1. Seccion "Reportes Recientes" en la pagina
2. Lista de ultimos reportes generados
3. Cada item muestra:
   - Nombre del reporte
   - Tipo (badge con color)
   - Formato (PDF/XLSX/CSV)
   - Fecha de generacion
   - Cantidad de estudiantes
   - Tamano del archivo
4. Botones: Descargar, Eliminar
```

### Flujo 4: Filtrar y Exportar Tabla de Estudiantes

```
1. En tabla de estudiantes, aplicar filtros:
   - Todos / Activos / En riesgo / Inactivos
   - Busqueda por nombre
2. Ordenar por columna (click en header)
3. Click en "Exportar"
4. Seleccionar formato (CSV/Excel)
5. Descarga del archivo con datos filtrados
```

---

## Dependencias

### Dependencias de Modulos

- `TeacherModule` - Controladores y servicios de maestro
- `ProgressModule` - Datos de progreso
- `SocialModule` - Datos de classrooms
- `StorageModule` - Almacenamiento de reportes

### Dependencias Externas

- `puppeteer` - Generacion de PDF
- `exceljs` - Generacion de Excel
- `uuid` - Generacion de IDs

---

## Criterios de Aceptacion

### CA-01: Dashboard de Clase
- [x] Resumen con total estudiantes, activos, en riesgo
- [x] Score promedio y completion rate
- [x] Tendencia: mejorando/estable/declinando
- [x] Comparacion con promedio institucional

### CA-02: Graficos de Rendimiento
- [x] Evolucion de promedio semanal (grafico de linea)
- [x] Distribucion de calificaciones (histograma)
- [x] Embudo de progreso por modulo
- [x] Mapa de calor de actividad

### CA-03: Tabla de Estudiantes
- [x] Columnas: Nombre, Progreso, Score, Ultima actividad, Estado
- [x] Ordenable por cada columna
- [x] Filtros: Todos / Activos / En riesgo / Inactivos
- [x] Busqueda por nombre
- [x] Exportar a CSV/Excel

### CA-04: Generacion de Reportes
- [x] Tipos: progress, evaluation, intervention, custom
- [x] Formatos: PDF, Excel, CSV
- [x] Configuracion de periodo (fechas)
- [x] Seleccion de estudiantes
- [x] Persistencia de reportes generados

### CA-05: Historial de Reportes
- [x] Lista de reportes recientes
- [x] Descarga de reportes guardados
- [x] Eliminacion de reportes
- [x] Estadisticas de uso

### CA-06: Performance
- [x] Tiempo de generacion < 30 segundos
- [x] Cache de analytics (5 min TTL)
- [x] Paginacion de estudiantes

---

## Notas de Implementacion

### Tipos de Reporte

```typescript
enum ReportType {
  USERS = 'users',
  PROGRESS = 'progress',
  GAMIFICATION = 'gamification',
  SYSTEM = 'system',
  STUDENT_INSIGHTS = 'student_insights',
  CLASSROOM_SUMMARY = 'classroom_summary',
  RISK_ANALYSIS = 'risk_analysis',
}
```

### Formatos de Reporte

```typescript
enum ReportFormat {
  PDF = 'pdf',
  EXCEL = 'excel',
  CSV = 'csv',
}
```

### Estructura de ReportData

```typescript
interface ReportData {
  metadata: {
    report_id: string;
    type: ReportType;
    format: ReportFormat;
    generated_at: Date;
    generated_by: string;
    start_date?: string;
    end_date?: string;
  };
  insights_summary: {
    total_students: number;
    high_risk: number;
    medium_risk: number;
    low_risk: number;
    avg_overall_score: number;
    avg_completion_rate: number;
    avg_dropout_risk: number;
  };
  student_insights: StudentInsightsResponseDto[];
}
```

---

## Referencias

- US-REP-001: Analytics Avanzado para Profesores (CA-01, CA-02)
- ReportsService: `apps/backend/src/modules/teacher/services/reports.service.ts`
- TeacherReportsPage: `apps/frontend/src/apps/teacher/pages/TeacherReportsPage.tsx`

---

**Creado:** 2026-01-27
**Sistema:** SIMCO (Sistema Indexado Modular por Contexto)
