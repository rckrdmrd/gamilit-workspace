---
id: "US-PARENT-003"
title: "Achievement Unlock Notification"
type: "User Story"
status: "Backlog"
priority: "Media"
assignee: "@Backend-Agent, @Frontend-Agent"
epic: "EXT-010"
story_points: 4
budget: "4 horas"
sprint: "Sprint-18"
labels: ["parent-notifications", "email", "achievements", "gamification"]
created_date: "2025-11-07"
updated_date: "2026-01-04"
---

# US-PARENT-003: Achievement Unlock Notification

**Epica:** EXT-010: Parent Notifications
**Prioridad:** P2
**Story Points:** 4
**Esfuerzo:** 4 horas
**Sprint:** 18

---

## User Story

```
Como padre de familia,
Quiero recibir una notificacion cuando mi hijo desbloquea logros importantes
Para celebrar sus exitos y motivarlo
```

---

## Criterios de Aceptacion

### Backend (2h)
- [ ] Trigger: Achievement de rareza Rare+ desbloqueado
- [ ] Trigger: Promocion de rango Maya
- [ ] Trigger: Completo modulo completo
- [ ] Email con:
  - Titulo e imagen del achievement
  - Descripcion del logro
  - Mensaje motivacional
  - Stats actualizados (nuevo rango, ML Coins totales)

### Email Template (2h)
- [ ] Tono celebratorio
- [ ] Subject: "[Nombre] desbloqueo [Achievement]!"
- [ ] CTA: "Ver perfil de [Nombre]"
- [ ] Opcion de compartir en redes sociales (opcional)

---

**Creado:** 2025-11-07
