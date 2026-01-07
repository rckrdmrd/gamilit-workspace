---
id: "US-PARENT-002"
title: "Low Performance Alert"
type: "User Story"
status: "Backlog"
priority: "Alta"
assignee: "@Backend-Agent, @Frontend-Agent"
epic: "EXT-010"
story_points: 5
budget: "5 horas"
sprint: "Sprint-18"
labels: ["parent-notifications", "email", "alerts", "performance"]
created_date: "2025-11-07"
updated_date: "2026-01-04"
---

# US-PARENT-002: Low Performance Alert

**Epica:** EXT-010: Parent Notifications
**Prioridad:** P1
**Story Points:** 5
**Esfuerzo:** 5 horas
**Sprint:** 18

---

## User Story

```
Como padre de familia,
Quiero recibir una alerta si mi hijo tiene bajo desempeno
Para poder apoyarlo antes de que afecte sus calificaciones
```

---

## Criterios de Aceptacion

### Backend (3h)
- [ ] Trigger: Score promedio <60% en ultimos 5 ejercicios
- [ ] Trigger: >7 dias sin actividad
- [ ] Trigger: 3+ intentos fallidos consecutivos en un ejercicio
- [ ] Validacion: Solo 1 alerta por semana (no spam)
- [ ] Email con:
  - Razon del alert (score bajo / inactividad / intentos fallidos)
  - Recomendaciones especificas
  - Link a ejercicios de practica
  - Contacto del profesor

### Email Template (2h)
- [ ] Tono empatico (no alarmista)
- [ ] Subject: "[Nombre] necesita un poco de apoyo en [Modulo]"
- [ ] CTA: "Habla con [Nombre]" y "Contactar profesor"

---

**Creado:** 2025-11-07
