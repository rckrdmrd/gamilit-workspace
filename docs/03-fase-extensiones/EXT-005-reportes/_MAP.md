# _MAP: EXT-005 - Reportes

**Épica:** EXT-005
**Nombre:** Reportería Avanzada
**Fase:** 3 - Extensiones
**Presupuesto:** $12,000 MXN
**Story Points:** 50 SP
**Estado:** ✅ Completado 100%
**Última actualización:** 2026-01-04

---

## 📋 Propósito

Sistema de reportería avanzada con custom report builder, reportes predefinidos, exportación multi-formato, gráficas interactivas y scheduled reports.

**Impacto:** **ALTO** - Data-driven decision making

---

## 📁 Contenido

| Archivo | Descripción |
|---------|-------------|
| [README.md](./README.md) | Overview de la épica |
| [historias-usuario/](./historias-usuario/) | User stories (~10) |
| [implementacion/TRACEABILITY.yml](./implementacion/TRACEABILITY.yml) | Trazabilidad |

---

## 🎯 Funcionalidades

### 1. Reportes Predefinidos
- Progreso de classroom
- Progreso individual
- Engagement metrics
- Achievement distribution

### 2. Custom Report Builder
- Drag & drop interface
- Field selector
- Filter builder
- Aggregation options

### 3. Exportación
- PDF generation
- CSV export
- Excel (XLSX) export
- Scheduled delivery

### 4. Visualizaciones
- Chart.js integration
- Interactive dashboards
- Drill-down capabilities
- Trend analysis

---

## 🏗️ Implementación

### Backend
- **Módulo:** `reports`
- **Endpoints:** ~12 endpoints
- **Libraries:** PDFKit, ExcelJS

### Frontend
- **Feature:** `reports`
- **Components:** ReportBuilder, ChartRenderer, ExportPanel

### Base de Datos
- **Tablas:** reports_templates, report_schedules
- **Views:** Varias vistas materializadas para performance

---

**Generado:** 2025-11-08
