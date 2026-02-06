# _MAP: notifications/

**Ultima actualizacion:** 2026-01-14
**Estado:** Produccion (Sistema Canonico)
**Tipo:** Integration/Communication
**Objetos activos:** 10

---

## Proposito

Sistema de notificaciones multi-canal (in-app, email, push web) para comunicacion
con usuarios. Este es el **sistema canonico** de notificaciones de GAMILIT.

**Audiencia:** Backend Developers, Frontend Developers

---

## Estructura

```
ddl/schemas/notifications/
├── 00-create-schema.sql
├── tables/
│   ├── 01-notifications.sql
│   ├── 02-notification_preferences.sql
│   ├── 03-notification_logs.sql
│   ├── 04-notification_templates.sql
│   ├── 05-notification_queue.sql
│   └── 06-user_devices.sql
├── functions/
│   ├── 01-send_notification.sql
│   ├── 02-get_user_preferences.sql
│   └── 03-queue_batch_notifications.sql
└── _MAP.md
```

**Total objetos DDL:** 10 (1 schema, 6 tablas, 3 funciones)

---

## Tablas

| Tabla | Archivo | Proposito |
|-------|---------|-----------|
| `notifications` | 01-notifications.sql | Notificaciones enviadas (in-app, email, push) |
| `notification_preferences` | 02-notification_preferences.sql | Preferencias por usuario y tipo |
| `notification_logs` | 03-notification_logs.sql | Historial de envios por canal |
| `notification_templates` | 04-notification_templates.sql | Plantillas con variables {{placeholder}} |
| `notification_queue` | 05-notification_queue.sql | Cola de envio asincrono |
| `user_devices` | 06-user_devices.sql | Dispositivos para push notifications |

## Funciones

| Funcion | Archivo | Proposito |
|---------|---------|-----------|
| `send_notification` | 01-send_notification.sql | Crea y encola notificacion |
| `get_user_preferences` | 02-get_user_preferences.sql | Obtiene preferencias de usuario |
| `queue_batch_notifications` | 03-queue_batch_notifications.sql | Encola notificaciones masivas |

---

## Caracteristicas

| Feature | Descripcion |
|---------|-------------|
| **Multi-canal** | in-app, email, push web |
| **Preferencias** | Control granular por tipo |
| **Cola asincrona** | Envio con reintentos |
| **Templates** | Variables {{placeholder}} |
| **Tracking** | Logs por canal |
| **Prioridades** | urgent, high, normal, low |
| **Quiet hours** | Horarios de silencio |

---

## Seeds

| Archivo | Proposito |
|---------|-----------|
| `01-notification_templates.sql` | 18 templates predefinidos |
| `02-notification_preferences_defaults.sql` | Defaults por tipo |

---

## Dependencias

**Este schema depende de:**
- `auth_management` (profiles)

**Schemas que dependen de este:**
- `gamification_system` (triggers insertan aqui)

---

## Migracion: Sistema Canonico

| Schema | Estado | Accion |
|--------|--------|--------|
| `notifications.notifications` | **CANONICO** | Usar este |
| `gamification_system.notifications` | DEPRECATED | Migrar aqui |

**Ver:** `gamification_system/MIGRATION-NOTIFICATIONS.md`

---

## Correcciones Aplicadas

| Archivo | Cambio | Fecha |
|---------|--------|-------|
| `tables/01-notifications.sql` | FK: `auth.users` → `auth_management.profiles` | 2026-01-04 |

---

## Referencia

- `create-database.sh` Fase 6.5 - notifications (antes de gamification)
- EXT-003 (Notificaciones Multi-Canal)

---

**Mantenido por:** Database Team
**Version:** 2.0
