# Migración de Notificaciones - gamification_system → notifications

**Fecha de análisis**: 2025-01-04
**Estado**: Pendiente de migración coordinada con backend

## Resumen de Duplicados Detectados

Se detectaron 2 tablas de notificaciones con funcionalidad superpuesta:

| Tabla | Schema | Propósito | Estado |
|-------|--------|-----------|--------|
| `notifications` | notifications | Multi-canal (in-app, email, push) | **CANÓNICA** |
| `notifications` | gamification_system | Eventos de gamificación | **DEPRECADA** |

## Comparación de Estructuras

### notifications.notifications (CANÓNICA)

```sql
id UUID PRIMARY KEY
user_id UUID NOT NULL                    -- FK a auth_management.profiles
type VARCHAR(50) NOT NULL                -- achievement, mission, assignment, social, system, gamification
title VARCHAR(255) NOT NULL
message TEXT NOT NULL
data JSONB DEFAULT '{}'
priority VARCHAR(20) DEFAULT 'normal'   -- low, normal, high, urgent
channels VARCHAR(50)[] DEFAULT ['in_app'] -- in_app, email, push
status VARCHAR(20) DEFAULT 'pending'    -- pending, sent, read, failed
read_at TIMESTAMP
sent_at TIMESTAMP
created_at TIMESTAMP
expires_at TIMESTAMP
metadata JSONB DEFAULT '{}'
```

### gamification_system.notifications (DEPRECADA)

```sql
id UUID PRIMARY KEY
user_id UUID NOT NULL                    -- FK a auth_management.profiles
type notification_type NOT NULL          -- ENUM con 11 valores específicos
title TEXT NOT NULL
message TEXT NOT NULL
data JSONB
priority notification_priority           -- ENUM: low, medium, high, critical
read BOOLEAN DEFAULT false              -- vs status en notifications.notifications
created_at TIMESTAMP WITH TIME ZONE
updated_at TIMESTAMP WITH TIME ZONE
```

## Diferencias Clave

| Aspecto | gamification_system | notifications | Nota |
|---------|--------------------|--------------|----|
| type | ENUM (11 valores) | VARCHAR + CHECK | notifications más flexible |
| priority | ENUM (4 valores) | VARCHAR + CHECK | Valores diferentes (medium vs normal) |
| read status | BOOLEAN `read` | VARCHAR `status` + `read_at` | notifications más detallado |
| canales | N/A | `channels[]` | notifications soporta multi-canal |
| timestamps | `updated_at` | `sent_at`, `read_at`, `expires_at` | notifications más completo |

## Mapeo de Campos para Migración

```sql
-- De gamification_system.notifications a notifications.notifications
INSERT INTO notifications.notifications (
    id,
    user_id,
    type,
    title,
    message,
    data,
    priority,
    status,
    read_at,
    created_at,
    metadata
)
SELECT
    id,
    user_id,
    type::TEXT,                                          -- ENUM a VARCHAR
    title,
    message,
    data,
    CASE priority::TEXT
        WHEN 'medium' THEN 'normal'
        WHEN 'critical' THEN 'urgent'
        ELSE priority::TEXT
    END,
    CASE WHEN read THEN 'read' ELSE 'pending' END,      -- BOOLEAN a status
    CASE WHEN read THEN created_at ELSE NULL END,       -- Aproximación read_at
    created_at,
    '{}'::jsonb
FROM gamification_system.notifications;
```

## Plan de Migración

### Fase 1: Verificar Triggers (COMPLETADO)

Los triggers de gamificación ya usan `notifications.notifications`:
- Trigger de achievements → `notifications.notifications`
- Trigger de rank_up → `notifications.notifications`
- Trigger de missions → `notifications.notifications`

### Fase 2: Actualizar Backend

**Módulo a modificar:**
- `apps/backend/src/modules/notifications/`

**Cambios requeridos:**
1. Actualizar entity de `gamification_system.notifications` a `notifications.notifications`
2. Adaptar mapeo de campos (especialmente `read` → `status`)
3. Agregar soporte para nuevos campos (channels, sent_at, expires_at)

### Fase 3: Migrar Datos Existentes

```sql
-- Script de migración (ejecutar después de actualizar backend)

-- 1. Migrar datos existentes
INSERT INTO notifications.notifications (
    id, user_id, type, title, message, data, priority, status, read_at, created_at
)
SELECT
    id, user_id, type::TEXT, title, message, COALESCE(data, '{}'),
    CASE priority::TEXT WHEN 'medium' THEN 'normal' WHEN 'critical' THEN 'urgent' ELSE priority::TEXT END,
    CASE WHEN read THEN 'read' ELSE 'pending' END,
    CASE WHEN read THEN created_at ELSE NULL END,
    created_at
FROM gamification_system.notifications
ON CONFLICT (id) DO NOTHING;

-- 2. Crear vista de compatibilidad temporal
CREATE OR REPLACE VIEW gamification_system.notifications_legacy AS
SELECT
    id,
    user_id,
    type::gamification_system.notification_type,
    title,
    message,
    data,
    CASE priority WHEN 'normal' THEN 'medium' WHEN 'urgent' THEN 'critical' ELSE priority END::gamification_system.notification_priority AS priority,
    (status = 'read') AS read,
    created_at,
    created_at AS updated_at
FROM notifications.notifications;
```

### Fase 4: Eliminar Tabla Deprecada

Después de período de validación (recomendado: 2 sprints):

```sql
DROP TABLE IF EXISTS gamification_system.notifications CASCADE;
```

## Notas Importantes

- Los triggers de gamificación YA insertan en `notifications.notifications`
- La tabla `gamification_system.notifications` puede tener datos legacy que necesitan migrarse
- El módulo de backend `notifications` aún puede estar usando la tabla legacy
- Coordinar con equipo de backend antes de ejecutar migración
