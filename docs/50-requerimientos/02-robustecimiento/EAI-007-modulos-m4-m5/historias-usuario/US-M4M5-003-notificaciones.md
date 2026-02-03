---
id: US-M4M5-003
title: Notificaciones docentes
epic: EAI-007
et: ET-M4M5-002
status: Done
story_points: 5
sprint: 8
created: 2025-12-05
updated: 2026-01-04
---

# US-M4M5-003: Notificaciones Docentes

## Historia de Usuario

**Como** docente
**Quiero** recibir notificaciones de nuevos envios de ejercicios
**Para** revisar oportunamente el trabajo de mis estudiantes

## Criterios de Aceptacion

- [x] Notificacion in-app al recibir nuevo envio
- [x] Email opcional para docentes que lo configuren
- [x] Badge en menu con contador de pendientes
- [x] Lista de pendientes ordenada por fecha de envio
- [x] Filtros por grupo y tipo de ejercicio

## Tipos de Notificacion

| Tipo | Canal | Condicion |
|------|-------|-----------|
| Nuevo envio | In-app | Siempre |
| Nuevo envio | Email | Si docente tiene habilitado |
| Recordatorio | In-app | >48h sin revision |

## Notas de Implementacion

Usa el sistema de notificaciones existente (EXT-003).
Configurado en `NotificationService.sendTeacherReviewNotification()`.

---

**Estado:** Done
