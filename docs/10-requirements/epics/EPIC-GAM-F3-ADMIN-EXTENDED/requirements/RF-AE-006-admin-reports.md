---
id: "RF-AE-006"
title: "Admin Reports"
type: "Requirement"
status: "Done"
priority: "Alta"
module: "admin_reports"
epic: "EXT-002"
version: "1.0.0"
created_date: "2026-02-06"
updated_date: "2026-02-06"
---

# Admin Reports

## Metadata

| Campo | Valor |
|-------|-------|
| ID | RF-AE-006 |
| Modulo | admin_reports |
| Prioridad | Alta |
| Status | Done |
| EPIC | EXT-002 |

## Descripcion

El sistema debe permitir a los administradores generar, listar, descargar y eliminar reportes del sistema en multiples formatos (CSV, Excel, PDF). Los reportes cubren usuarios, progreso educativo, gamificacion y metricas del sistema. La generacion es asincrona con tracking de estado.

## Requerimiento Funcional

- **RF-AE-006.1:** Generar reportes de tipos: users, progress, gamification, system con filtros personalizados.
- **RF-AE-006.2:** Soportar formatos de exportacion: CSV, Excel (.xlsx) y PDF.
- **RF-AE-006.3:** Generacion asincrona con estados: generating, completed, failed.
- **RF-AE-006.4:** Listar reportes existentes con paginacion y filtros por tipo, formato y estado.
- **RF-AE-006.5:** Descargar reportes completados y eliminar reportes antiguos.

## Criterios de Aceptacion

- [x] AC-001: POST /admin/reports/generate crea reporte con estado tracking.
- [x] AC-002: GET /admin/reports lista reportes paginados con filtros.
- [x] AC-003: GET /admin/reports/:id/download retorna archivo en formato solicitado.
- [x] AC-004: DELETE /admin/reports/:id elimina reporte y archivo asociado.
- [x] AC-005: Reportes generados incluyen metadata de quien los solicito.

## Referencias

- **User Story:** US-AE-006
- **Especificacion:** ET-REPORTS-SYSTEM
- **EPIC:** EXT-002
