---
id: "US-PM-005b"
title: "Generacion de Reportes"
type: "User Story"
status: "Done"
priority: "Media"
assignee: "@Backend-Agent, @Frontend-Agent"
epic: "EXT-001"
story_points: 5
budget: "$2,200 MXN"
sprint: "Sprint-9"
labels: ["portal-maestros", "reports", "export", "pdf", "csv"]
created_date: "2025-11-02"
updated_date: "2026-01-25"
---

# US-PM-005b: Generación de Reportes

**Épica:** EXT-001 - Portal de Maestros Completo
**Sprint:** Mes 3, Semana 5
**Story Points:** 5 SP
**Presupuesto:** $2,200 MXN
**Prioridad:** Media (Extensión Fase 3)
**Estado:** Done
**Relación:** Parte de US-PM-005 (dividida en a/b/c)

## Descripción

Como profesor autenticado en la plataforma GAMILIT, quiero generar reportes predefinidos (weekly, monthly, quarterly) y exportarlos en PDF/CSV para comunicar progreso a administración y padres de familia.

**Contexto:** Esta user story es parte de la funcionalidad de Analytics y Reportes, dividida para cumplir con PF-001 (límite 400 líneas). Se enfoca en generación y exportación de reportes.

## Criterios de Aceptación

### Funcionales

#### AC-01: Reportes Predefinidos
- [ ] **DADO** que solicito GET /api/teacher/analytics/reports?report_type=weekly
- [ ] **CUANDO** el sistema genera el reporte
- [ ] **ENTONCES** recibo reporte de la última semana
- [ ] **Y** el reporte incluye summary y classrooms breakdown
- [ ] **Y** los report_types soportados son: weekly, monthly, quarterly, custom

#### AC-02: Reporte Custom con Fechas
- [ ] **DADO** que selecciono report_type=custom
- [ ] **CUANDO** especifico start_date=2025-10-01 y end_date=2025-10-31
- [ ] **ENTONCES** recibo reporte del periodo especificado
- [ ] **Y** el reporte incluye datos solo de ese rango

#### AC-03: Exportar JSON
- [ ] **DADO** que solicito reporte con format=json (default)
- [ ] **CUANDO** el sistema genera el reporte
- [ ] **ENTONCES** recibo respuesta JSON con toda la data
- [ ] **Y** puedo procesar el JSON en el frontend

#### AC-04: Exportar PDF
- [ ] **DADO** que solicito GET /reports?report_type=monthly&format=pdf
- [ ] **CUANDO** el sistema genera el PDF
- [ ] **ENTONCES** recibo archivo PDF descargable
- [ ] **Y** el PDF incluye gráficas (si include_charts=true)
- [ ] **Y** el PDF tiene logo, fecha, nombre del profesor
- [ ] **Y** el filename es descriptivo: `report_monthly_2025-10-28.pdf`

#### AC-05: Exportar CSV
- [ ] **DADO** que solicito GET /reports?format=csv
- [ ] **CUANDO** el sistema genera el CSV
- [ ] **ENTONCES** recibo archivo CSV descargable
- [ ] **Y** el CSV incluye columnas: classroom, students, assignments, avg_grade, completion_rate
- [ ] **Y** puedo abrir en Excel/Google Sheets
- [ ] **Y** el filename es descriptivo: `report_monthly_2025-10-28.csv`

#### AC-06: Filtrar por Classroom
- [ ] **DADO** que especifico classroom_id en query params
- [ ] **CUANDO** solicito reporte
- [ ] **ENTONCES** recibo reporte solo de ese classroom
- [ ] **Y** el summary refleja solo ese classroom

#### AC-07: Include Charts en PDF
- [ ] **DADO** que solicito PDF con include_charts=true
- [ ] **CUANDO** el sistema genera el PDF
- [ ] **ENTONCES** el PDF incluye gráficas renderizadas
- [ ] **Y** las gráficas son: grade distribution, performance trend

### No Funcionales

#### AC-08: Performance
- [ ] Generación de JSON < 500ms
- [ ] Generación de CSV < 1s
- [ ] Generación de PDF < 3s
- [ ] PDF generation async si es posible (job queue)

#### AC-09: Security
- [ ] Solo el teacher owner puede generar reportes de sus classrooms
- [ ] No exponer datos de otros profesores
- [ ] Rate limiting: 50 req/15min (más restrictivo para PDF/CSV)

#### AC-10: Validación
- [ ] Joi/Zod schemas
- [ ] report_type enum validation
- [ ] Date validation para custom reports
- [ ] format enum validation (json, csv, pdf)

## Especificaciones Técnicas

### Backend

#### Endpoints API

**1. GET /api/teacher/analytics/reports**
- Descripción: Generar reportes predefinidos o personalizados
- Auth: JWT Required (role: teacher)

Query Params:
```typescript
{
  report_type: 'weekly' | 'monthly' | 'quarterly' | 'custom',
  classroom_id?: string,
  start_date?: string,          // Required para custom
  end_date?: string,            // Required para custom
  format?: 'json' | 'csv' | 'pdf',     // default: json
  include_charts?: boolean              // default: true (for PDF)
}
```

Response (200 OK) para format=json:
```typescript
{
  success: true,
  data: {
    report_id: string,
    report_type: string,
    generated_at: string,
    period: {
      start_date: string,
      end_date: string
    },
    summary: {
      total_classrooms: number,
      total_students: number,
      total_assignments: number,
      overall_avg_grade: number,
      overall_completion_rate: number
    },
    classrooms: {
      classroom_id: string,
      classroom_name: string,
      students_count: number,
      assignments_count: number,
      average_grade: number,
      completion_rate: number,
      top_performer: string,
      at_risk_count: number
    }[]
  }
}
```

Response para format=csv o pdf:
- Content-Type: `text/csv` o `application/pdf`
- Content-Disposition: `attachment; filename="report_monthly_2025-10-28.pdf"`

#### Tareas Backend (3 SP)

1. Report Generation Service (2 SP)
   - GET /api/teacher/analytics/reports
   - Lógica para weekly, monthly, quarterly, custom
   - Agregación de datos de múltiples classrooms
   - Tests unitarios

2. PDF & CSV Export (1 SP)
   - PDF generation service (PDFKit o Puppeteer)
     - Template design
     - Charts integration (renderizar gráficas)
     - Styling (logo, headers)
   - CSV generation service (csv-writer)
   - Tests unitarios export

### Frontend

#### Componentes

- ReportGenerator (formulario principal)
- ReportTypeSelector (weekly, monthly, quarterly, custom)
- DateRangePicker (para custom)
- FormatSelector (json, csv, pdf)
- ClassroomFilter (opcional)
- GenerateButton con loading state
- DownloadHandler

#### Tareas Frontend (2 SP)

1. Report Generator UI (2 SP)
   - Componente ReportGenerator
   - ReportTypeSelector
   - DateRangePicker (para custom reports)
   - FormatSelector (JSON, CSV, PDF)
   - ClassroomFilter
   - Generate button con loading state
   - Download handling para CSV/PDF
   - Preview de JSON en modal (opcional)

### Database

- Usa datos existentes de: submissions, assignments, classrooms
- No requiere tablas nuevas

## Dependencias

- **Requiere:**
  - US-PM-005a (Classroom Analytics) - usa mismos datos

- **Relacionada:**
  - US-PM-005a (Classroom Analytics)
  - US-PM-005c (Engagement Metrics)

## Riesgos y Mitigación

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| PDF generation lenta | Media | Medio | Usar job queue para PDF async, mostrar progress bar |
| Charts no renderean en PDF | Media | Medio | Usar Puppeteer para screenshot de charts, fallback a texto |
| CSV encoding issues | Baja | Bajo | UTF-8 BOM para Excel compatibility |

## Testing

### Unit Tests
- ReportService: 6 tests
  - Weekly, monthly, quarterly (3 tests)
  - Custom con fechas (1 test)
  - Filtro por classroom (1 test)
  - Summary calculation (1 test)
- PDFService: 3 tests
- CSVService: 2 tests

### Integration Tests
- GET /reports endpoint
- Tests de formatos (JSON, CSV, PDF)

### E2E Tests
- Flujo: Login → Generate report → Download PDF

## PDF Template Example

```
┌────────────────────────────────────────────────────────────┐
│ [LOGO]                        Performance Report           │
│                              Monthly - October 2025        │
├────────────────────────────────────────────────────────────┤
│ Teacher: John Doe                  Generated: Oct 31, 2025 │
├────────────────────────────────────────────────────────────┤
│ Summary                                                     │
│ • Total Classrooms: 3                                      │
│ • Total Students: 87                                       │
│ • Overall Average Grade: 84%                               │
│ • Overall Completion Rate: 92%                             │
├────────────────────────────────────────────────────────────┤
│ Classroom Breakdown                                         │
│                                                            │
│ Math 101 (Grade 6)                                         │
│ • Students: 28                                             │
│ • Average Grade: 85%                                       │
│ • Completion Rate: 93%                                     │
│ • Top Performer: Jane Doe (95%)                            │
│                                                            │
│ [Grade Distribution Chart]                                 │
│ [Performance Trend Chart]                                  │
└────────────────────────────────────────────────────────────┘
```

## CSV Format

```csv
classroom_id,classroom_name,students_count,assignments_count,average_grade,completion_rate,top_performer,at_risk_count
uuid-1,Math 101,28,15,85,93,Jane Doe,2
uuid-2,Science 201,31,12,82,88,John Smith,3
uuid-3,History 101,28,10,86,95,Alice Brown,1
```

## Métricas de Éxito

- 1 endpoint funcionando con 3 formatos
- Test coverage >80%
- Generación de PDF <3 segundos
- CSV compatible con Excel 100%
- >40% de profesores exportan reportes mensualmente

## Notas

- ✅ Archivo modularizado desde US-PM-005-FULL.md (2025-11-02)
- ✅ Cumple PF-001 (<400L)
- 📋 Enfoque: Generación y exportación de reportes
- 🔗 Complementa con US-PM-005a (Analytics) y US-PM-005c (Engagement)
- ⚠️ IMPORTANTE: PDF generation puede ser async con job queue

---

**Última actualización:** 2025-11-02
**Versión:** 1.0 (Modular)
**Estado:** READY FOR DEVELOPMENT
