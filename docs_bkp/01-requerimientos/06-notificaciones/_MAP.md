# _MAP: docs/01-requerimientos/06-notificaciones/

**Última actualización:** 2025-11-07
**Propósito:** Requerimientos funcionales del sistema de notificaciones (push, email, in-app)
**Audiencia:** Product Owners, Desarrolladores Backend/Frontend, Diseñadores UX
**Estado:** ✅ COMPLETO (100%)

---

## 📁 Contenido de esta Carpeta

### Requerimientos Funcionales

| ID | Título | Archivo | Estado | Prioridad |
|----|--------|---------|--------|-----------|
| RF-NOT-001 | Tipos de Notificaciones | [RF-NOT-001-tipos-notificaciones.md](./RF-NOT-001-tipos-notificaciones.md) | ✅ Implementado | Alta |
| RF-NOT-002 | Preferencias de Notificaciones y Control del Usuario | [RF-NOT-002-preferencias-notificaciones.md](./RF-NOT-002-preferencias-notificaciones.md) | ✅ Implementado | Alta |

**Total requerimientos:** 2/2 (100%)

---

## 🔗 Interdependencias

### Módulos Relacionados

**Depende de:**
- [01-autenticacion-autorizacion](../01-autenticacion-autorizacion/) - Identificación de usuarios
- [02-gamificacion](../02-gamificacion/) - Notificaciones de achievements, ranks
- [04-progreso-seguimiento](../04-progreso-seguimiento/) - Notificaciones de rachas
- [Teacher Portal](../teacher-portal/) - Notificaciones de tareas, calificaciones

**Usado por:**
- Todos los módulos - Sistema transversal de comunicación

### Documentación Relacionada

**Especificaciones Técnicas:**
- [ET-NOT-*](../../02-especificaciones-tecnicas/06-notificaciones/) - Specs técnicas de notificaciones

**Desarrollo:**
- Backend: `apps/backend/src/modules/notifications/`
- Frontend: `apps/frontend/src/components/notifications/`

**Database:**
- Schema: `gamification_system.notifications` (tabla de notificaciones)
- Tablas relacionadas:
  - `gamification_system.notifications` - Notificaciones del sistema
  - `gamification_system.notification_priority` (ENUM: low, normal, urgent)

---

## 📊 Métricas

- **Total documentos:** 2/2 (100%)
- **RFs completos:** 2
- **Cobertura implementación:** 100%
- **Estado:** ✅ COMPLETO

---

## 🎯 Funcionalidades Clave

### 1. Tipos de Notificaciones (RF-NOT-001)

**Canales soportados:**
- **In-App** - Notificaciones dentro de la aplicación
- **Email** - Correo electrónico (implementado)
- **Push Notifications** - Notificaciones push (planeado)
- **SMS** - Mensajes de texto (futuro, bajo prioridad)

**Categorías de notificaciones:**
1. **Gamificación**
   - Achievement desbloqueado
   - Nuevo rango alcanzado
   - ML Coins ganados/gastados
   - Racha en riesgo

2. **Progreso Académico**
   - Tarea completada
   - Módulo completado
   - Ejercicio calificado
   - Feedback de maestro

3. **Interacción Social** (futuro)
   - Nuevo amigo
   - Comentario en tu ejercicio
   - Invitación a grupo de estudio

4. **Administrativas**
   - Nueva tarea asignada
   - Fecha límite próxima
   - Cambios en el aula
   - Anuncios del maestro

**Prioridades:**
- `urgent` - Requiere atención inmediata (fecha límite hoy)
- `normal` - Notificación estándar
- `low` - Informativa, no urgente

**Preferencias de usuario:**
- Activar/desactivar por categoría
- Horarios de no molestar
- Frecuencia (inmediato, resumen diario, resumen semanal)

---

## 🚀 Próximos Pasos

### Módulo Completo ✅
Todos los RFs planificados han sido documentados e implementados.

### Prioridad Alta
1. [x] ~~RF-NOT-001: Tipos de Notificaciones~~ ✅ Completado
2. [x] ~~RF-NOT-002: Preferencias de Notificaciones~~ ✅ Completado

### Futuras Extensiones (Fase 2)
- [ ] RF-NOT-003: Plantillas Personalizables de Emails
- [ ] RF-NOT-004: Notificaciones de Recordatorio Inteligentes (IA)
- [ ] RF-NOT-005: Resúmenes de Actividad (Digests)
- [ ] RF-NOT-006: Notificaciones por SMS (bajo prioridad)

---

## ⚠️ Issues Conocidos

- [ ] **RF-NOT-001** - Falta sección de referencias a implementación
- [ ] Push notifications - Pendiente de implementación (70% planeado)
- [ ] Plantillas de email - Usan plantillas básicas, no personalizables

---

## 🔔 Sistema de Notificaciones Actual

### Implementado (90%)
✅ In-app notifications
✅ Email notifications
✅ Sistema de prioridades
✅ Preferencias básicas de usuario
✅ Batching de notificaciones (evitar spam)

### Pendiente (10%)
⚪ Push notifications (PWA + Firebase)
⚪ Plantillas personalizables
⚪ Resúmenes inteligentes

---

## 📚 Guía de Navegación

**Si buscas...**
- **Tipos de notificaciones:** Ver [RF-NOT-001-tipos-notificaciones.md](./RF-NOT-001-tipos-notificaciones.md)
- **Implementación backend:** Ver `apps/backend/src/modules/notifications/` (agregar referencias)
- **Implementación frontend:** Ver `apps/frontend/src/components/notifications/` (agregar referencias)
- **Database schema:** Ver `apps/database/ddl/schemas/gamification_system/tables/08-notifications.sql`
