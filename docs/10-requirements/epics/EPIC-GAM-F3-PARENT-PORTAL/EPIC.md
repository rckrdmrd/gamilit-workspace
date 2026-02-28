---
titulo: "EPIC-GAM-F3-PARENT-PORTAL: Parent Portal"
tipo: epic
fecha_creacion: "2025-10-01"
ultima_actualizacion: "2026-02-28"
estado: activo
---

# EPIC-GAM-F3-PARENT-PORTAL: Parent Portal

> **⚠️ BACKLOG - FUERA DEL MVP**
>
> Esta épica está **parcialmente implementada (35%)** y **NO forma parte del MVP actual**.
> Razón: Feature nice-to-have.
> Ver: [Fase 4: Backlog](../04-fase-backlog/README.md)

**Versión:** 1.0
**Fecha de creación:** 2025-11-20
**Prioridad:** P3
**Story Points:** 20 SP
**Presupuesto:** $8,000 MXN
**Estado:** ⏳ BACKLOG (35% implementado)

---

## 📋 Descripción

Portal para que padres de familia monitoreen el progreso académico de sus hijos en la plataforma GAMILIT, permitiendo:

- Visualización de avance en módulos educativos
- Seguimiento de logros y achievements
- Reportes de actividad y tiempo de uso
- Notificaciones de progreso importante

---

## 🎯 Objetivos de Negocio

### Problema a Resolver

Los padres de familia actualmente no tienen visibilidad del progreso de sus hijos en la plataforma. Esto reduce:
- Involucramiento parental en el proceso educativo
- Motivación del estudiante por falta de reconocimiento familiar
- Adopción B2C de la plataforma

### Valor Esperado

- **Engagement parental:** +40% involucramiento familiar
- **Retención estudiantes:** +15% por soporte familiar
- **Modelo B2C:** Habilitación de ventas directas a familias

---

## 📁 User Stories

| ID | Título | SP | Prioridad | Estado |
|----|--------|----|-----------|--------|
| **US-PP-001** | Data Model & Relations | 7 | P3 | ✅ 100% |
| **US-PP-002** | Portal UI Dashboard | 8 | P3 | 📝 Pendiente |
| **US-PP-003** | Notificaciones Padres | 5 | P3 | 📝 Pendiente |
| **US-PP-004** | Reportes para Padres | - | P3 | 📝 Backlog |

**Progreso:** 7/20 SP implementados (35%)

---

## 🎯 Estado de Implementación

### ✅ Completado (35%)

**Database:**
- Tabla `parent_accounts` creada
- Tabla `parent_student_links` creada
- Relaciones con `users` establecidas

**Backend:**
- Entities definidas en NestJS
- Sin controllers implementados

### ⏳ Pendiente (65%)

**Frontend:**
- Portal UI completo (dashboard, vistas)
- Componentes de reportes
- Sistema de notificaciones

**Backend:**
- Controllers para CRUD
- Endpoints de reportes
- Integración con notificaciones

---

## 🔗 Dependencias

### Depende de:
- EPIC-GAM-F3-NOTIFICATIONS: Sistema de Notificaciones (para alertas a padres)
- EPIC-GAM-F3-GAMIFICATION: Gamificación (para mostrar logros)
- EPIC-GAM-F3-ANALYTICS: Analytics (para reportes de progreso)

### Habilita:
- Modelo de negocio B2C
- Mayor engagement familiar
- Adopción en hogares

---

## 🎯 Navegación

**⬅️ Anterior:** [EPIC-GAM-F3-PARENT-NOTIFICATIONS: Parent Notifications](../EPIC-GAM-F3-PARENT-NOTIFICATIONS/)
**⬆️ Índice:** [Fase 3: Extensiones](../_INDEX.md)
**📋 Backlog:** [Fase 4: Backlog](../04-fase-backlog/README.md)

---

**Última actualización:** 2025-11-29
**Estado:** ⏳ BACKLOG
