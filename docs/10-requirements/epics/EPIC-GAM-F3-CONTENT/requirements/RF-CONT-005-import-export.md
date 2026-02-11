---
id: "RF-CONT-005"
title: "Import Export"
type: "Requirement"
status: "Partial"
priority: "Alta"
module: "content"
epic: "EXT-006"
version: "1.0.0"
created_date: "2026-02-06"
updated_date: "2026-02-06"
---

# Import Export

## Metadata

| Campo | Valor |
|-------|-------|
| ID | RF-CONT-005 |
| Modulo | content |
| Prioridad | Alta |
| Status | Partial (45%) |
| EPIC | EXT-006 |

## Descripcion

El sistema debe soportar importacion y exportacion de contenido educativo en formatos estandar para facilitar la migracion y comparticion entre plataformas. Incluye soporte para paquetes SCORM, QTI para ejercicios y formato propietario JSON para backup completo.

## Requerimiento Funcional

- **RF-CONT-005.1:** Exportar modulos completos con ejercicios, recursos y configuracion en formato JSON.
- **RF-CONT-005.2:** Importar paquetes JSON validando estructura y resolviendo conflictos de IDs.
- **RF-CONT-005.3:** Exportar ejercicios en formato QTI 2.1 para compatibilidad con LMS externos.
- **RF-CONT-005.4:** Importar contenido desde archivos CSV con mapeo de columnas configurable.
- **RF-CONT-005.5:** Validacion pre-importacion que muestra preview de datos y errores antes de confirmar.

## Criterios de Aceptacion

- [x] AC-001: Exportacion JSON genera archivo descargable con toda la estructura del modulo.
- [x] AC-002: Importacion JSON restaura modulo completo con todos sus ejercicios.
- [ ] AC-003: Exportacion QTI genera paquete valido segun especificacion 2.1.
- [ ] AC-004: Importacion CSV con preview de datos y resolucion de errores.
- [ ] AC-005: Validacion pre-import detecta y reporta inconsistencias.

## Referencias

- **User Story:** US-CONT-005
- **Especificacion:** ET-CONT-002
- **EPIC:** EXT-006
