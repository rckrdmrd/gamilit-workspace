---
id: "ET-REP-003"
title: "Exportacion PDF/Excel - Especificacion Tecnica"
type: "Especificacion Tecnica"
status: "Implementado"
priority: "P1"
epic: "EXT-005"
module: "reports-export"
labels: ["reports", "export", "pdf", "excel", "csv", "puppeteer", "exceljs"]
created_date: "2026-01-27"
updated_date: "2026-01-27"
related_rf: ["RF-REP-004"]
related_us: ["US-REP-001"]
---

# ET-REP-003: Exportacion PDF/Excel - Especificacion Tecnica

## Informacion General

| Campo | Valor |
|-------|-------|
| **ID** | ET-REP-003 |
| **Epic** | EXT-005 - Reportes Avanzados |
| **RF Relacionado** | RF-REP-004 (Export PDF/Excel) |
| **US Relacionadas** | US-REP-001 |
| **Prioridad** | P1 - Alta |
| **Estado** | Implementado |

---

## Descripcion Tecnica

El sistema de exportacion permite generar reportes en multiples formatos:

1. **PDF**: Reportes visuales con graficos y formato profesional
2. **Excel (XLSX)**: Datos tabulares con hojas multiples y formato
3. **CSV**: Datos raw para integracion con otras herramientas

Cada formato tiene su pipeline de generacion optimizado y persistencia en storage.

---

## Componentes Frontend

### Componentes de Exportacion

| Componente | Path | Descripcion |
|------------|------|-------------|
| `ReportGenerator` | `apps/frontend/src/apps/teacher/components/reports/ReportGenerator.tsx` | UI para configurar y generar reportes |
| `ReportTemplateSelector` | `apps/frontend/src/apps/teacher/components/reports/ReportTemplateSelector.tsx` | Selector de plantillas |
| `BulkActionsPanel` | `apps/frontend/src/apps/admin/components/users/BulkActionsPanel.tsx` | Panel de acciones masivas con export |

### Hooks

| Hook | Path | Descripcion |
|------|------|-------------|
| `useReports` | `apps/frontend/src/apps/teacher/hooks/useReports.ts` | Manejo de generacion de reportes |

---

## Servicios Backend

### Servicio Principal

| Servicio | Path | Descripcion |
|----------|------|-------------|
| `ReportsService` | `apps/backend/src/modules/teacher/services/reports.service.ts` | Servicio completo de generacion |
| `StorageService` | `apps/backend/src/modules/teacher/services/storage.service.ts` | Almacenamiento de archivos |
| `TeacherReportsService` | `apps/backend/src/modules/teacher/services/teacher-reports.service.ts` | Persistencia de metadata |

### Metodos del ReportsService

```typescript
class ReportsService {
  // Metodo principal de generacion
  async generateReport(
    dto: GenerateReportDto,
    userId: string,
    tenantId: string
  ): Promise<{ buffer: Buffer; metadata: GeneratedReportMetadataDto; reportId: string }>;

  // Generacion de PDF con Puppeteer
  private async generatePDFReport(reportData: ReportData): Promise<Buffer>;

  // Generacion de Excel con ExcelJS
  private async generateExcelReport(reportData: ReportData): Promise<Buffer>;

  // Generacion de CSV
  private async generateCSVReport(reportData: ReportData): Promise<Buffer>;

  // Generar HTML para PDF
  private generateReportHTML(reportData: ReportData): string;

  // Generar seccion de competencias para PDF
  private generateCompetenciesSection(student: StudentInsightsResponseDto): string;

  // Escapar campos para CSV
  private escapeCSVField(field: string): string;
}
```

---

## Implementacion de PDF (Puppeteer)

### Configuracion de Puppeteer

```typescript
// En generatePDFReport()
const browser = await puppeteer.launch({
  headless: true,
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-gpu',
  ],
});

const page = await browser.newPage();
await page.setContent(html, { waitUntil: 'networkidle0' });

const pdfBuffer = await page.pdf({
  format: 'A4',
  printBackground: true,
  margin: {
    top: '20mm',
    right: '15mm',
    bottom: '20mm',
    left: '15mm',
  },
  displayHeaderFooter: true,
  headerTemplate: '<div></div>',
  footerTemplate: `
    <div style="font-size: 10px; color: #6b7280; width: 100%; text-align: center;">
      Pagina <span class="pageNumber"></span> de <span class="totalPages"></span>
    </div>
  `,
});
```

### Estructura HTML del PDF

El PDF incluye las siguientes secciones:

1. **Header**: Logo, titulo, fecha de generacion
2. **Resumen de Insights**: Cards con metricas agregadas
3. **Estudiantes Alto Riesgo**: Seccion destacada con alertas
4. **Estudiantes Riesgo Moderado**: Seccion secundaria
5. **Competencias por Estudiante**: Seccion detallada (si aplica)
6. **Footer**: Numero de pagina, marca de agua

### Estilos CSS Embebidos

```css
/* Estilos principales del PDF */
body {
  font-family: 'Helvetica Neue', Arial, sans-serif;
  margin: 40px;
  color: #333;
}
.header {
  text-align: center;
  border-bottom: 3px solid #2563eb;
}
.summary {
  background: #f3f4f6;
  padding: 20px;
  border-radius: 8px;
}
.student-card.high-risk {
  border-left: 5px solid #dc2626;
  background: #fef2f2;
}
.student-card.medium-risk {
  border-left: 5px solid #f59e0b;
  background: #fffbeb;
}
```

---

## Implementacion de Excel (ExcelJS)

### Configuracion del Workbook

```typescript
// En generateExcelReport()
const workbook = new ExcelJS.Workbook();
workbook.creator = 'GAMILIT Platform';
workbook.created = metadata.generated_at;
workbook.modified = metadata.generated_at;
```

### Hojas del Excel

#### Hoja 1: Resumen

```typescript
const summarySheet = workbook.addWorksheet('Resumen', {
  properties: { tabColor: { argb: 'FF2563EB' } },
});

summarySheet.columns = [
  { key: 'metric', width: 30 },
  { key: 'value', width: 20 },
];

// Datos de resumen
summarySheet.addRows([
  ['Total Estudiantes', insights_summary.total_students],
  ['Alto Riesgo', insights_summary.high_risk],
  ['Medio Riesgo', insights_summary.medium_risk],
  ['Bajo Riesgo', insights_summary.low_risk],
  ['Puntuacion Promedio', `${insights_summary.avg_overall_score}%`],
]);
```

#### Hoja 2: Insights Detallados

```typescript
const detailSheet = workbook.addWorksheet('Insights Detallados', {
  properties: { tabColor: { argb: 'FF10B981' } },
});

detailSheet.columns = [
  { header: 'Estudiante', key: 'name', width: 25 },
  { header: 'Puntuacion', key: 'score', width: 12 },
  { header: 'Modulos', key: 'modules', width: 12 },
  { header: 'Nivel de Riesgo', key: 'risk', width: 15 },
  { header: 'Prob. Completitud', key: 'completion_prob', width: 18 },
  { header: 'Riesgo Abandono', key: 'dropout_risk', width: 15 },
  { header: 'Fortalezas', key: 'strengths', width: 40 },
  { header: 'Debilidades', key: 'weaknesses', width: 40 },
  { header: 'Recomendaciones', key: 'recommendations', width: 50 },
];
```

#### Hoja 3: Atencion Inmediata

```typescript
// Solo si hay estudiantes de alto riesgo
const alertSheet = workbook.addWorksheet('Atencion Inmediata', {
  properties: { tabColor: { argb: 'FFDC2626' } },
});

alertSheet.columns = [
  { header: 'Estudiante', key: 'name', width: 25 },
  { header: 'Puntuacion', key: 'score', width: 12 },
  { header: 'Riesgo Abandono', key: 'dropout_risk', width: 15 },
  { header: 'Recomendacion Prioritaria', key: 'top_recommendation', width: 50 },
];
```

### Formato Condicional

```typescript
// Colorear celdas de riesgo
detailSheet.eachRow((row, rowNumber) => {
  if (rowNumber > 1) {
    const riskCell = row.getCell('risk');
    if (riskCell.value === 'HIGH') {
      riskCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFDC2626' },
      };
      riskCell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
    }
  }
});
```

---

## Implementacion de CSV

### Generacion de CSV

```typescript
// En generateCSVReport()
const headers = [
  'Estudiante',
  'ID Estudiante',
  'Puntuacion General',
  'Modulos Completados',
  'Modulos Totales',
  'Nivel de Riesgo',
  'Probabilidad Completitud',
  'Riesgo Abandono',
  'Fortalezas',
  'Debilidades',
  'Recomendaciones',
];

// Filas con datos
student_insights.forEach(insight => {
  const row = [
    this.escapeCSVField(insight.student_name),
    insight.student_id,
    `${insight.overall_score}%`,
    String(insight.modules_completed),
    String(insight.modules_total),
    insight.risk_level.toUpperCase(),
    `${Math.round(insight.predictions.completion_probability * 100)}%`,
    `${Math.round(insight.predictions.dropout_risk * 100)}%`,
    this.escapeCSVField(insight.strengths.join('; ')),
    this.escapeCSVField(insight.weaknesses.join('; ')),
    this.escapeCSVField(insight.recommendations.join('; ')),
  ];
  rows.push(row);
});

// Agregar BOM para compatibilidad con Excel
const BOM = '\uFEFF';
const csvWithBOM = BOM + csvContent;

return Buffer.from(csvWithBOM, 'utf-8');
```

### Escape de Campos CSV

```typescript
private escapeCSVField(field: string): string {
  if (!field) return '';

  // Si contiene coma, comilla o salto de linea, envolver en comillas
  if (field.includes(',') || field.includes('"') || field.includes('\n')) {
    return `"${field.replace(/"/g, '""')}"`;
  }
  return field;
}
```

---

## Persistencia de Reportes

### StorageService

```typescript
class StorageService {
  async saveFile(
    buffer: Buffer,
    filename: string,
    folder: string
  ): Promise<{ filePath: string; fileSizeBytes: number }> {
    const basePath = path.join(process.cwd(), 'storage', 'reports', folder);
    await fs.mkdir(basePath, { recursive: true });

    const filePath = path.join(basePath, filename);
    await fs.writeFile(filePath, buffer);

    return {
      filePath: `reports/${folder}/${filename}`,
      fileSizeBytes: buffer.length,
    };
  }
}
```

### Metadata en Base de Datos

```typescript
// TeacherReportsService.createReport()
const reportEntity = this.reportsRepository.create({
  teacherId,
  tenantId,
  reportName,
  reportType,
  reportFormat,
  classroomId,
  studentCount,
  periodStart,
  periodEnd,
  filePath,
  fileSizeBytes,
  generatedAt: new Date(),
});

return this.reportsRepository.save(reportEntity);
```

---

## APIs Endpoints

### Exportacion

| Endpoint | Metodo | Descripcion |
|----------|--------|-------------|
| `/api/v1/teacher/reports/generate` | POST | Generar reporte |
| `/api/v1/teacher/reports/:id/download` | GET | Descargar reporte |
| `/api/v1/teacher/reports/recent` | GET | Listar reportes recientes |
| `/api/v1/teacher/reports/stats` | GET | Estadisticas de reportes |
| `/api/v1/teacher/reports/:id` | DELETE | Eliminar reporte |

### Request: POST /api/v1/teacher/reports/generate

```json
{
  "type": "progress",
  "format": "pdf",
  "classroom_id": "uuid",
  "student_ids": [],
  "start_date": "2026-01-01",
  "end_date": "2026-01-31"
}
```

### Response: Descarga de Archivo

```
Content-Type: application/pdf
Content-Disposition: attachment; filename="Reporte-Progreso-2026-01-27.pdf"
```

---

## Flujos de Usuario

### Flujo 1: Exportar a PDF

```
1. Profesor configura reporte (tipo, periodo, estudiantes)
2. Selecciona formato "PDF"
3. Click en "Generar Reporte"
4. POST /api/v1/teacher/reports/generate
5. Backend:
   a. gatherReportData() - recolecta datos
   b. generatePDFReport() - genera HTML y convierte a PDF con Puppeteer
   c. storageService.saveFile() - guarda archivo
   d. teacherReportsService.createReport() - guarda metadata
6. Response con metadata y download URL
7. Frontend inicia descarga automatica
```

### Flujo 2: Exportar a Excel

```
1. Profesor selecciona formato "Excel"
2. Misma configuracion que PDF
3. POST /api/v1/teacher/reports/generate
4. Backend:
   a. gatherReportData() - recolecta datos
   b. generateExcelReport() - genera workbook con ExcelJS
   c. Crea multiples hojas con formato
   d. Guarda archivo .xlsx
5. Descarga del archivo Excel
```

### Flujo 3: Exportar a CSV

```
1. Profesor selecciona formato "CSV"
2. POST /api/v1/teacher/reports/generate
3. Backend:
   a. gatherReportData() - recolecta datos
   b. generateCSVReport() - genera CSV con BOM
   c. Escapa campos especiales
   d. Guarda archivo .csv
5. Descarga del archivo CSV
```

### Flujo 4: Descargar Reporte Guardado

```
1. En historial de reportes, click en "Descargar"
2. GET /api/v1/teacher/reports/:id/download
3. Backend lee archivo de storage
4. Response con blob y headers de descarga
5. Browser descarga archivo
```

---

## Dependencias

### Dependencias Externas Backend

| Paquete | Version | Uso |
|---------|---------|-----|
| `puppeteer` | ^22.x | Generacion de PDF desde HTML |
| `exceljs` | ^4.x | Generacion de archivos Excel |
| `uuid` | ^9.x | Generacion de IDs unicos |

### Instalacion

```bash
npm install puppeteer exceljs uuid
npm install -D @types/uuid
```

---

## Criterios de Aceptacion

### CA-01: Generacion de PDF
- [x] HTML con estilos CSS embebidos
- [x] Formato A4 con margenes
- [x] Header y footer con paginacion
- [x] Seccion de resumen con cards
- [x] Estudiantes en riesgo destacados
- [x] Competencias por estudiante
- [x] Fallback a HTML si Puppeteer falla

### CA-02: Generacion de Excel
- [x] Multiples hojas (Resumen, Detalle, Alertas)
- [x] Headers con formato y color
- [x] Formato condicional en celdas de riesgo
- [x] Columnas con anchos apropiados
- [x] Propiedades del workbook (autor, fecha)

### CA-03: Generacion de CSV
- [x] BOM para compatibilidad con Excel
- [x] Escape de campos con comas/comillas
- [x] Encoding UTF-8
- [x] Seccion de metadata como comentarios
- [x] Seccion de resumen
- [x] Detalle por estudiante

### CA-04: Persistencia
- [x] Archivo guardado en storage local
- [x] Metadata guardada en base de datos
- [x] Tamano de archivo registrado
- [x] Historial de reportes accesible

### CA-05: Descarga
- [x] Headers correctos para descarga
- [x] Nombre de archivo descriptivo
- [x] Tipo MIME correcto por formato

### CA-06: Performance
- [x] Generacion < 30 segundos
- [x] Manejo de documentos con >100 estudiantes
- [x] Cleanup de recursos de Puppeteer

---

## Notas de Implementacion

### Manejo de Errores

```typescript
try {
  browser = await puppeteer.launch({...});
  // ... generacion
} catch (error) {
  this.logger.error('Failed to generate PDF with Puppeteer', error);
  // Fallback a HTML si Puppeteer falla
  return Buffer.from(html, 'utf-8');
} finally {
  if (browser) {
    await browser.close();
  }
}
```

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

### Formatos Soportados

```typescript
enum ReportFormat {
  PDF = 'pdf',
  EXCEL = 'excel',
  CSV = 'csv',
}
```

---

## Referencias

- US-REP-001: Analytics Avanzado (CA-09: Exportacion de Reportes)
- ReportsService: `apps/backend/src/modules/teacher/services/reports.service.ts`
- Puppeteer docs: https://pptr.dev/
- ExcelJS docs: https://github.com/exceljs/exceljs

---

**Creado:** 2026-01-27
**Sistema:** SIMCO (Sistema Indexado Modular por Contexto)
