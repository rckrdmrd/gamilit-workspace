# US-PARENT-001: Weekly Progress Report Email

**Épica:** EXT-010: Parent Notifications
**Prioridad:** P1
**Story Points:** 6
**Esfuerzo:** 6 horas
**Sprint:** 17

---

## 📋 User Story

```
Como padre de familia,
Quiero recibir un email semanal con el progreso de mi hijo
Para estar informado sin tener que preguntarle constantemente
```

---

## ✅ Criterios de Aceptación

### Backend (4h)
- [ ] Cron job que corre cada domingo a las 6 PM
- [ ] Service `generateWeeklyReport(student_id)`:
  - Ejercicios completados (esta semana vs semana anterior)
  - Score promedio
  - Módulos avanzados
  - ML Coins ganados
  - Ranking en clase
- [ ] Email template con datos del reporte
- [ ] Envío vía SendGrid/Nodemailer
- [ ] Tracking de open/click (pixel tracking)

### Email Template (2h)
- [ ] HTML responsive
- [ ] Secciones:
  - Header con logo institución
  - "Esta semana [Nombre] completó X ejercicios"
  - Gráfica de progreso semanal
  - Top 3 achievements de la semana
  - Botón "Ver detalle" → Parent Portal
  - Footer con link de unsubscribe

---

**Creado:** 2025-11-07
