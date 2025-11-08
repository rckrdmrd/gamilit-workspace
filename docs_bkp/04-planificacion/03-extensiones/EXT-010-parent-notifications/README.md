# EXT-010: Parent Notifications

**Versión:** 1.0
**Fecha de creación:** 2025-11-07
**Prioridad:** P2 (Promovida desde P3)
**Story Points:** 15 SP
**Presupuesto:** $2,250 USD
**Timeline:** v1.3 (Sprints 17-24)
**Estado:** 📋 Planificado

---

## 📋 Descripción

Sistema de notificaciones automáticas a padres de familia sobre el progreso, desempeño y logros de sus hijos en la plataforma GAMILIT, fomentando el involucramiento parental en el proceso educativo.

---

## 🎯 Objetivos de Negocio

### Problema a Resolver
- Padres no tienen visibilidad del progreso de sus hijos
- Instituciones reciben quejas de falta de comunicación
- Bajo engagement parental reduce efectividad educativa

### Valor Esperado
- **NPS institucional:** +15 puntos (padres satisfechos)
- **Parental engagement:** +50% (padres revisan reportes)
- **Renovación institucional:** +10% (instituciones renuevan contrato)
- **Student accountability:** +20% (estudiantes más responsables)
- **ROI:** 380%

### Métricas de Éxito
- **Email open rate:** >40%
- **Click-through rate:** >15%
- **Parent portal visits:** +200%
- **Institutional NPS:** +15 puntos

---

## 🏗️ Arquitectura Técnica

### Componentes

1. **Notification Service (Backend)**
   - Cron jobs para emails semanales
   - Alert triggers para bajo desempeño
   - Achievement notifications

2. **Email Templates**
   - Weekly progress report
   - Low performance alert
   - Achievement unlock notification

3. **Parent Portal (Frontend - Básico)**
   - Login con código de acceso
   - Dashboard de progreso del hijo
   - Historial de notificaciones

### Database Schema

```sql
CREATE TABLE auth_management.parent_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES auth_management.users(id),
  parent_email VARCHAR(255) NOT NULL,
  access_code VARCHAR(20) UNIQUE, -- Código para login
  relationship VARCHAR(50), -- 'mother', 'father', 'guardian'
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE notifications.parent_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID NOT NULL REFERENCES auth_management.parent_accounts(id),
  student_id UUID NOT NULL REFERENCES auth_management.users(id),
  type VARCHAR(50), -- 'weekly_report', 'low_performance', 'achievement'
  subject VARCHAR(255),
  body TEXT,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ
);
```

---

## 👥 User Stories

| ID | Historia | Esfuerzo | Prioridad |
|----|----------|----------|-----------|
| [US-PARENT-001](./historias/US-PARENT-001-weekly-report.md) | Weekly Progress Report Email | 6h | P1 |
| [US-PARENT-002](./historias/US-PARENT-002-low-performance-alert.md) | Low Performance Alert | 5h | P1 |
| [US-PARENT-003](./historias/US-PARENT-003-achievement-notification.md) | Achievement Unlock Notification | 4h | P2 |

**Total:** 15 horas ($2,250 USD)

---

## 🔗 Dependencias

### Bloqueado por
- Email service (Nodemailer/SendGrid) configurado
- Progress tracking funcionando
- Achievement system implementado

---

## 🚀 Plan de Implementación

### Sprint 17-18 (Semanas 17-18) - 15h
- US-PARENT-001: Weekly Report (6h)
- US-PARENT-002: Low Performance Alert (5h)
- US-PARENT-003: Achievement Notification (4h)

---

## 📚 Referencias

- [ANALISIS-FEATURES-P3-ESTRATEGICAS.md](../../features/ANALISIS-FEATURES-P3-ESTRATEGICAS.md)
- [FEATURES-PENDIENTES.md](../../features/FEATURES-PENDIENTES.md) - F-P2-022

---

**Creado:** 2025-11-07
**Responsable:** Backend Team + Email Designer
