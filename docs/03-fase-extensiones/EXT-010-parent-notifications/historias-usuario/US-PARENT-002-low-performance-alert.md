# US-PARENT-002: Low Performance Alert

**Épica:** EXT-010: Parent Notifications
**Prioridad:** P1
**Story Points:** 5
**Esfuerzo:** 5 horas
**Sprint:** 18

---

## 📋 User Story

```
Como padre de familia,
Quiero recibir una alerta si mi hijo tiene bajo desempeño
Para poder apoyarlo antes de que afecte sus calificaciones
```

---

## ✅ Criterios de Aceptación

### Backend (3h)
- [ ] Trigger: Score promedio <60% en últimos 5 ejercicios
- [ ] Trigger: >7 días sin actividad
- [ ] Trigger: 3+ intentos fallidos consecutivos en un ejercicio
- [ ] Validación: Solo 1 alerta por semana (no spam)
- [ ] Email con:
  - Razón del alert (score bajo / inactividad / intentos fallidos)
  - Recomendaciones específicas
  - Link a ejercicios de práctica
  - Contacto del profesor

### Email Template (2h)
- [ ] Tono empático (no alarmista)
- [ ] Subject: "[Nombre] necesita un poco de apoyo en [Módulo]"
- [ ] CTA: "Habla con [Nombre]" y "Contactar profesor"

---

**Creado:** 2025-11-07
