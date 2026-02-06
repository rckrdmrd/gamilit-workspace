---
id: "RF-CONT-004"
title: "Versionamiento"
type: "Requirement"
status: "Partial"
priority: "Alta"
module: "content"
epic: "EXT-006"
version: "1.0.0"
created_date: "2026-02-06"
updated_date: "2026-02-06"
---

# Versionamiento

## Metadata

| Campo | Valor |
|-------|-------|
| ID | RF-CONT-004 |
| Modulo | content |
| Prioridad | Alta |
| Status | Partial (60%) |
| EPIC | EXT-006 |

## Descripcion

El sistema debe implementar versionamiento de contenido educativo para rastrear cambios, permitir rollback a versiones anteriores y mantener historial de ediciones. Cada publicacion crea una nueva version con diff visual entre versiones para facilitar la revision.

## Requerimiento Funcional

- **RF-CONT-004.1:** Crear nueva version automaticamente al publicar cambios en modulo o ejercicio.
- **RF-CONT-004.2:** Ver historial de versiones con autor, fecha, descripcion del cambio y diff.
- **RF-CONT-004.3:** Rollback a cualquier version anterior con confirmacion del usuario.
- **RF-CONT-004.4:** Diff visual entre dos versiones cualesquiera (resaltando adiciones, eliminaciones, modificaciones).
- **RF-CONT-004.5:** Limite configurable de versiones almacenadas (default: ultimas 20).

## Criterios de Aceptacion

- [x] AC-001: Nueva version creada automaticamente al publicar cambios.
- [x] AC-002: Historial de versiones visible con al menos 5 campos por version.
- [x] AC-003: Rollback restaura contenido exacto de la version seleccionada.
- [ ] AC-004: Diff visual muestra cambios claramente con colores.
- [ ] AC-005: Limite de versiones configurado y auto-purge de versiones antiguas.

## Referencias

- **User Story:** US-CONT-004
- **Especificacion:** ET-CONT-002
- **EPIC:** EXT-006
