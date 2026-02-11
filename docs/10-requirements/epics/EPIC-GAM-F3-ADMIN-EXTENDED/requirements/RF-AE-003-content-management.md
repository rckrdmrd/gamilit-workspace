---
id: "RF-AE-003"
title: "Content Management"
type: "Requirement"
status: "Done"
priority: "Alta"
module: "admin_content"
epic: "EXT-002"
version: "1.0.0"
created_date: "2026-02-06"
updated_date: "2026-02-06"
---

# Content Management

## Metadata

| Campo | Valor |
|-------|-------|
| ID | RF-AE-003 |
| Modulo | admin_content |
| Prioridad | Alta |
| Status | Done |
| EPIC | EXT-002 |

## Descripcion

El sistema debe permitir a los administradores gestionar el contenido educativo de la plataforma: aprobar o rechazar contenido pendiente, ver historial de aprobaciones, gestionar modulos y ejercicios, y mantener una cola de moderacion. Incluye rutas alias para compatibilidad con frontend legacy.

## Requerimiento Funcional

- **RF-AE-003.1:** Listar contenido pendiente de aprobacion con filtros por tipo (module, exercise, assignment, resource).
- **RF-AE-003.2:** Aprobar o rechazar contenido con notas del revisor y registro automatico en historial.
- **RF-AE-003.3:** Ver historial completo de aprobaciones con filtros por tipo, estado, submitter y reviewer.
- **RF-AE-003.4:** Soportar rutas alias /admin/content/exercises/* para compatibilidad con frontend.
- **RF-AE-003.5:** Cola de moderacion consumida desde vista admin_dashboard.moderation_queue.

## Criterios de Aceptacion

- [x] AC-001: Contenido pendiente listado con paginacion y filtros funcionales.
- [x] AC-002: Aprobacion/rechazo crea registro automatico en content_approvals.
- [x] AC-003: Historial de aprobaciones incluye nombre de submitter y reviewer via JOINs.
- [x] AC-004: Rutas alias /admin/content/exercises/* delegan correctamente al servicio.
- [x] AC-005: Busqueda en notas de reviewer y revision operativa.

## Referencias

- **User Story:** US-AE-003
- **Especificacion:** ET-REPORTS-SYSTEM
- **EPIC:** EXT-002
