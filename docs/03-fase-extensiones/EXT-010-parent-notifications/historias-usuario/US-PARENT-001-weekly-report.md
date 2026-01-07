---
id: "US-PARENT-001"
title: "Weekly Progress Report Email"
type: "User Story"
status: "Backlog"
priority: "Alta"
assignee: "@Backend-Agent, @Frontend-Agent"
epic: "EXT-010"
story_points: 6
budget: "6 horas"
sprint: "Sprint-17"
labels: ["parent-notifications", "email", "reports", "cron"]
created_date: "2025-11-07"
updated_date: "2026-01-04"
---

# US-PARENT-001: Weekly Progress Report Email

**Epica:** EXT-010: Parent Notifications
**Prioridad:** P1
**Story Points:** 6
**Esfuerzo:** 6 horas
**Sprint:** 17

---

## User Story

```
Como padre de familia,
Quiero recibir un email semanal con el progreso de mi hijo
Para estar informado sin tener que preguntarle constantemente
```

---

## Criterios de Aceptacion

### Backend (4h)
- [ ] Cron job que corre cada domingo a las 6 PM
- [ ] Service `generateWeeklyReport(student_id)`:
  - Ejercicios completados (esta semana vs semana anterior)
  - Score promedio
  - Modulos avanzados
  - ML Coins ganados
  - Ranking en clase
- [ ] Email template con datos del reporte
- [ ] Envio via SendGrid/Nodemailer
- [ ] Tracking de open/click (pixel tracking)

### Email Template (2h)
- [ ] HTML responsive
- [ ] Secciones:
  - Header con logo institucion
  - "Esta semana [Nombre] completo X ejercicios"
  - Grafica de progreso semanal
  - Top 3 achievements de la semana
  - Boton "Ver detalle" -> Parent Portal
  - Footer con link de unsubscribe

---

**Creado:** 2025-11-07
