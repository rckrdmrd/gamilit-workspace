---
id: "RF-TCH-005b"
title: "Generacion y Exportacion de Reportes"
type: "Requirement"
status: "Done"
priority: "Alta"
module: "teacher"
epic: "EXT-001"
version: "1.0.0"
created_date: "2026-02-06"
updated_date: "2026-02-06"
---

# Generacion y Exportacion de Reportes

## Metadata

| Campo | Valor |
|-------|-------|
| ID | RF-TCH-005b |
| Modulo | teacher |
| Prioridad | Alta |
| Status | Done |
| EPIC | EXT-001 |

## Descripcion

El sistema debe permitir a los maestros generar reportes de calificaciones y desempeno en formatos exportables (PDF y CSV). Los reportes incluyen listas de calificaciones por tarea, reportes individuales de estudiante, reportes de aula y reportes de periodo completo. Cada reporte es configurable en cuanto a las columnas y metricas incluidas.

## Requerimiento Funcional

- **RF-TCH-005b.1:** El maestro puede generar un reporte de calificaciones por tarea en formato tabla con columnas: estudiante, calificacion, fecha de entrega, estado y comentarios.
- **RF-TCH-005b.2:** El maestro puede generar un reporte individual por estudiante que incluya todas las calificaciones del periodo, promedio y tendencia.
- **RF-TCH-005b.3:** Los reportes se exportan en formato PDF (con encabezado institucional) y CSV (para procesamiento externo).
- **RF-TCH-005b.4:** El maestro puede programar la generacion automatica de reportes semanales o mensuales enviados a su email.

## Criterios de Aceptacion

- [ ] AC-001: El reporte PDF se genera con formato profesional, encabezado y datos correctos.
- [ ] AC-002: El CSV exportado se abre correctamente en Excel con codificacion UTF-8.
- [ ] AC-003: El reporte individual muestra todas las calificaciones del estudiante en el periodo.
- [ ] AC-004: Los reportes programados se envian en la frecuencia configurada.
- [ ] AC-005: La generacion de reportes completa en menos de 10 segundos para aulas de hasta 50 estudiantes.

## Reglas de Negocio

- Los reportes solo incluyen datos de aulas donde el maestro tiene permisos activos.
- Los reportes PDF incluyen marca de agua con fecha de generacion.
- Los reportes programados se desactivan automaticamente al archivar el aula.

## Dependencias

- Servicio de generacion de PDF (e.g., Puppeteer o similar).
- Servicio de envio de emails para reportes programados.

## Referencias

- **User Story:** US-PM-005b
- **Especificacion:** ET-TCH-005
- **EPIC:** EXT-001
