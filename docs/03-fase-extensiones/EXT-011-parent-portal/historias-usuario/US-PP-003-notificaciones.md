---
id: US-PP-003
title: Notificaciones Padres
epic: EXT-011
status: Backlog
story_points: 5
priority: P3
created: 2025-11-20
updated: 2026-01-04
---

# US-PP-003: Notificaciones Padres

## Historia de Usuario

**Como** padre de familia
**Quiero** recibir notificaciones del progreso de mis hijos
**Para** estar informado sin tener que revisar el portal constantemente

## Criterios de Aceptacion

- [ ] Notificacion cuando hijo sube de rango
- [ ] Notificacion semanal de resumen de actividad
- [ ] Notificacion cuando hijo no usa la app en 3+ dias
- [ ] Configuracion de preferencias de notificacion

## Tipos de Notificacion

| Tipo | Canal | Frecuencia |
|------|-------|------------|
| Rango alcanzado | Email + Push | Evento |
| Resumen semanal | Email | Semanal |
| Inactividad | Email | Evento |

## Dependencias

- US-PP-001 (Data Model) - Done
- EXT-003 (Sistema Notificaciones) - Done
- US-PP-002 (Portal UI) - Pendiente

---

**Estado:** Backlog (Fuera de MVP)
