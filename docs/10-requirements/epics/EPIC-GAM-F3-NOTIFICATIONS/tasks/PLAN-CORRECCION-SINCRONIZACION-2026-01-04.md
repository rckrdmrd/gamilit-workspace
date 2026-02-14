# PLAN DE CORRECCION: Sincronizacion Backend-Frontend-Seeds EXT-003

**Version:** 1.1.0
**Fecha:** 2026-01-04
**Autor:** NEXUS-ORQUESTADOR
**Epic:** EXT-003-notificaciones
**Prioridad:** CRITICA
**Estado:** COMPLETADO
**Ejecutado:** 2026-01-04

---

## 1. RESUMEN EJECUTIVO

Se identificaron **19 problemas** de sincronizacion entre Backend, Frontend y Seeds que afectan el correcto funcionamiento del modulo de notificaciones.

### Estado por Capa

| Capa | Problemas | Criticos | Altos | Medios |
|------|-----------|----------|-------|--------|
| **Backend (Entities)** | 7 | 4 | 2 | 1 |
| **Frontend (Pages/Hooks)** | 6 | 2 | 2 | 2 |
| **Seeds (Datos Iniciales)** | 3 | 2 | 1 | 0 |
| **DDL (Foreign Keys)** | 3 | 1 | 2 | 0 |

### Impacto

- **Preferencias de Usuario:** NO FUNCIONAN - campos incorrectos en frontend
- **Dispositivos Push:** NO FUNCIONAN - campos browser/os no existen
- **Templates Faltantes:** 9 tipos de notificacion sin plantilla
- **Seeds Faltantes:** Usuarios sin preferencias default ni dispositivos

---

## 2. PROBLEMAS IDENTIFICADOS

### 2.1 Backend - Entities (7 Problemas)

| ID | Problema | Severidad | Archivo | Linea |
|----|----------|-----------|---------|-------|
| BE-SYNC-001 | Default push_enabled: BD=true, Entity=false | CRITICO | notification-preference.entity.ts | 145 |
| BE-SYNC-002 | Falta campo `delivered_at` en NotificationLog | CRITICO | notification-log.entity.ts | - |
| BE-SYNC-003 | Falta campo `provider_response` en NotificationLog | CRITICO | notification-log.entity.ts | - |
| BE-SYNC-004 | Falta campo `email_frequency` en NotificationPreference | CRITICO | notification-preference.entity.ts | - |
| BE-SYNC-005 | Falta campos `quiet_hours_start/end` en NotificationPreference | ALTO | notification-preference.entity.ts | - |
| BE-SYNC-006 | Falta campo `timezone` en NotificationPreference | ALTO | notification-preference.entity.ts | - |
| BE-SYNC-007 | Status 'pending' vs 'queued' en NotificationQueue | MEDIO | notification-queue.entity.ts | 120 |

### 2.2 Frontend - Pages/Hooks (6 Problemas)

| ID | Problema | Severidad | Archivo | Linea |
|----|----------|-----------|---------|-------|
| FE-SYNC-001 | Campos `inApp/email/push` deben ser `inAppEnabled/emailEnabled/pushEnabled` | CRITICO | AdminNotificationPreferencesPage.tsx | 86-90 |
| FE-SYNC-002 | Campos `device.browser/os` no existen - usar `deviceType` | CRITICO | AdminNotificationPreferencesPage.tsx | 288 |
| FE-SYNC-003 | usePushNotifications retorna `isSubscribedToPush`, no `isEnabled` | ALTO | AdminNotificationPreferencesPage.tsx | 66 |
| FE-SYNC-004 | Tipos incorrectos: `achievement` debe ser `achievement_unlocked` | ALTO | NotificationPreferencesPage.tsx (student) | 16-73 |
| FE-SYNC-005 | Link incorrecto `/settings/notifications` -> `/student/settings/notifications` | MEDIO | NotificationsPage.tsx (student) | 272 |
| FE-SYNC-006 | Mapeo de tipos fragil sin validacion | MEDIO | useWebSocket.ts | 161-170 |

### 2.3 Seeds - Datos Iniciales (3 Problemas)

| ID | Problema | Severidad | Archivo Faltante |
|----|----------|-----------|------------------|
| SEED-001 | Falta seed para notification_preferences | CRITICO | seeds/prod/notifications/02-notification_preferences.sql |
| SEED-002 | Falta seed para user_devices | CRITICO | seeds/prod/notifications/03-user_devices.sql |
| SEED-003 | Faltan 9 templates: rank_promotion, module_completed, etc. | ALTO | seeds/prod/notifications/01-notification_templates.sql |

### 2.4 DDL - Foreign Keys (3 Problemas)

| ID | Problema | Severidad | Tabla |
|----|----------|-----------|-------|
| DDL-001 | FK inconsistente: notifications.user_id -> auth_management.profiles | CRITICO | notifications |
| DDL-002 | FK inconsistente: notification_preferences.user_id -> auth.users | ALTO | notification_preferences |
| DDL-003 | FK inconsistente: user_devices.user_id -> auth.users | ALTO | user_devices |

---

## 3. PLAN DE EJECUCION

### Fase 1: Correccion Backend Entities (Prioridad P0)

**Duracion estimada:** 4 horas
**Responsable:** NEXUS-BACKEND

#### BE-SYNC-001: Sincronizar default push_enabled

**Archivo:** `apps/backend/src/modules/notifications/entities/multichannel/notification-preference.entity.ts`

```typescript
// ANTES (linea 145):
@Column({ name: 'push_enabled', type: 'boolean', default: false })
push_enabled: boolean;

// DESPUES:
@Column({ name: 'push_enabled', type: 'boolean', default: true })
push_enabled: boolean;
```

#### BE-SYNC-002 y BE-SYNC-003: Agregar campos a NotificationLog

**Archivo:** `apps/backend/src/modules/notifications/entities/multichannel/notification-log.entity.ts`

```typescript
// AGREGAR despues de sent_at:
@Column({ name: 'delivered_at', type: 'timestamp', nullable: true })
delivered_at?: Date;

@Column({ name: 'provider_response', type: 'jsonb', nullable: true })
provider_response?: Record<string, any>;
```

#### BE-SYNC-004, BE-SYNC-005, BE-SYNC-006: Agregar campos a NotificationPreference

**Archivo:** `apps/backend/src/modules/notifications/entities/multichannel/notification-preference.entity.ts`

```typescript
// AGREGAR despues de push_enabled:
@Column({
  name: 'email_frequency',
  type: 'varchar',
  length: 20,
  default: 'immediate'
})
email_frequency: 'immediate' | 'daily' | 'weekly' | 'never';

@Column({ name: 'quiet_hours_start', type: 'time', nullable: true })
quiet_hours_start?: string;

@Column({ name: 'quiet_hours_end', type: 'time', nullable: true })
quiet_hours_end?: string;

@Column({
  name: 'timezone',
  type: 'varchar',
  length: 50,
  default: 'America/Mexico_City'
})
timezone: string;
```

#### BE-SYNC-007: Corregir status default en NotificationQueue

**Archivo:** `apps/backend/src/modules/notifications/entities/multichannel/notification-queue.entity.ts`

```typescript
// ANTES:
@Column({ name: 'status', default: 'pending' })
status: string;

// DESPUES:
@Column({ name: 'status', default: 'queued' })
status: 'queued' | 'processing' | 'sent' | 'failed';
```

---

### Fase 2: Correccion Frontend (Prioridad P0)

**Duracion estimada:** 3 horas
**Responsable:** NEXUS-FRONTEND

#### FE-SYNC-001: Corregir nombres de campos en preferencias

**Archivos afectados:**
- `apps/frontend/src/apps/admin/pages/AdminNotificationPreferencesPage.tsx` (linea 86-90)
- `apps/frontend/src/apps/teacher/pages/TeacherNotificationPreferencesPage.tsx` (linea 88-93)
- `apps/frontend/src/apps/student/pages/NotificationPreferencesPage.tsx` (linea 94-111)

```typescript
// ANTES:
prefs[pref.notificationType] = {
  inApp: pref.inApp,
  email: pref.email,
  push: pref.push,
};

// DESPUES:
prefs[pref.notificationType] = {
  inApp: pref.inAppEnabled,
  email: pref.emailEnabled,
  push: pref.pushEnabled,
};
```

#### FE-SYNC-002: Corregir campos de dispositivo

**Archivos afectados:**
- `apps/frontend/src/apps/admin/pages/AdminNotificationPreferencesPage.tsx` (linea 288)
- `apps/frontend/src/apps/teacher/pages/TeacherNotificationPreferencesPage.tsx` (linea 333)

```typescript
// ANTES:
{device.deviceName || `${device.browser} en ${device.os}`}

// DESPUES:
{device.deviceName || device.deviceType}
```

#### FE-SYNC-003: Corregir destructuring de usePushNotifications

**Archivos afectados:**
- `apps/frontend/src/apps/admin/pages/AdminNotificationPreferencesPage.tsx` (linea 66)
- `apps/frontend/src/apps/teacher/pages/TeacherNotificationPreferencesPage.tsx` (linea 70)

```typescript
// ANTES:
const {
  isSupported: pushSupported,
  isEnabled: pushEnabled,  // NO EXISTE
  ...
} = usePushNotifications();

// DESPUES:
const {
  isSupported: pushSupported,
  isSubscribedToPush: pushEnabled,  // CORRECTO
  ...
} = usePushNotifications();
```

#### FE-SYNC-004: Corregir tipos de notificacion

**Archivo:** `apps/frontend/src/apps/student/pages/NotificationPreferencesPage.tsx`

```typescript
// ANTES (linea 16-73):
const NOTIFICATION_TYPES = [
  { key: 'achievement', ... },
  { key: 'rank_up', ... },
  ...
];

// DESPUES:
const NOTIFICATION_TYPES = [
  { key: 'achievement_unlocked', ... },
  { key: 'rank_promoted', ... },
  ...
];
```

#### FE-SYNC-005: Corregir ruta de navegacion

**Archivo:** `apps/frontend/src/apps/student/pages/NotificationsPage.tsx` (linea 272)

```typescript
// ANTES:
<Link to="/settings/notifications">

// DESPUES:
<Link to="/student/settings/notifications">
```

---

### Fase 3: Crear Seeds Faltantes (Prioridad P0)

**Duracion estimada:** 2 horas
**Responsable:** NEXUS-DATABASE

#### SEED-001: Crear seed de notification_preferences

**Archivo a crear:** `apps/database/seeds/prod/notifications/02-notification_preferences_defaults.sql`

```sql
-- Preferencias por defecto para tipos de notificacion del sistema
-- Se aplican como template cuando un usuario no tiene preferencias

INSERT INTO notifications.notification_preferences (
    id,
    user_id,
    notification_type,
    in_app_enabled,
    email_enabled,
    push_enabled,
    email_frequency,
    quiet_hours_start,
    quiet_hours_end,
    timezone
)
SELECT
    gen_random_uuid(),
    p.id,
    nt.notification_type,
    true,  -- in_app_enabled
    CASE WHEN nt.notification_type IN ('system_announcement', 'assignment_reminder') THEN true ELSE false END,
    false, -- push_enabled (requiere opt-in)
    'immediate',
    '22:00'::TIME,
    '08:00'::TIME,
    'America/Mexico_City'
FROM auth_management.profiles p
CROSS JOIN (
    VALUES
        ('achievement_unlocked'),
        ('new_assignment'),
        ('assignment_reminder'),
        ('teacher_message'),
        ('team_invitation'),
        ('exercise_feedback'),
        ('rank_promoted'),
        ('module_completed'),
        ('system_announcement')
) AS nt(notification_type)
ON CONFLICT (user_id, notification_type) DO NOTHING;
```

#### SEED-002: Crear seed de user_devices (solo dev)

**Archivo a crear:** `apps/database/seeds/dev/notifications/02-user_devices_test.sql`

```sql
-- Dispositivos de prueba para ambiente de desarrollo
-- NO incluir en produccion

INSERT INTO notifications.user_devices (
    id,
    user_id,
    device_type,
    device_token,
    browser,
    os,
    is_active,
    last_used_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'web',
    'test_token_' || p.id::text,
    'Chrome',
    'Linux',
    true,
    gamilit.now_mexico()
FROM auth_management.profiles p
WHERE p.role_name IN ('super_admin', 'teacher')
LIMIT 10
ON CONFLICT (user_id, device_token) DO NOTHING;
```

#### SEED-003: Agregar templates faltantes

**Archivo a modificar:** `apps/database/seeds/prod/notifications/01-notification_templates.sql`

```sql
-- Agregar al final del archivo existente:

-- Template: rank_promoted
INSERT INTO notifications.notification_templates (
    id, template_key, name, description,
    subject_template, body_template, html_template,
    variables, default_channels, is_active
) VALUES (
    gen_random_uuid(),
    'rank_promoted',
    'Ascenso de Rango',
    'Notificacion cuando un estudiante sube de rango',
    'Felicidades! Has subido al rango {{new_rank}}',
    'Has ascendido de {{old_rank}} a {{new_rank}}. Sigue asi!',
    NULL,
    '["student_name", "old_rank", "new_rank", "rank_icon"]'::jsonb,
    ARRAY['in_app', 'push'],
    true
) ON CONFLICT (template_key) DO NOTHING;

-- Template: module_completed
INSERT INTO notifications.notification_templates (
    id, template_key, name, description,
    subject_template, body_template, html_template,
    variables, default_channels, is_active
) VALUES (
    gen_random_uuid(),
    'module_completed',
    'Modulo Completado',
    'Notificacion cuando un estudiante completa un modulo',
    'Completaste el modulo {{module_name}}!',
    'Has completado exitosamente el modulo "{{module_name}}". Ganaste {{xp_earned}} XP.',
    NULL,
    '["student_name", "module_name", "xp_earned", "completion_date"]'::jsonb,
    ARRAY['in_app'],
    true
) ON CONFLICT (template_key) DO NOTHING;

-- Agregar otros templates faltantes: challenge_received, challenge_completed,
-- daily_summary, weekly_report, monthly_report, low_performance, inactivity_alert
```

---

### Fase 4: Sincronizar Foreign Keys DDL (Prioridad P1)

**Duracion estimada:** 1 hora
**Responsable:** NEXUS-DATABASE

**IMPORTANTE:** Esta fase requiere migracion de datos y debe ejecutarse con precaucion.

#### DDL-002 y DDL-003: Cambiar FKs a auth_management.profiles

**Archivo a crear:** `apps/database/migrations/2026-01-04-sync-fk-notifications.sql`

```sql
-- Migracion: Sincronizar FKs de notificaciones a auth_management.profiles
-- EJECUTAR EN AMBIENTE DE DESARROLLO PRIMERO

BEGIN;

-- 1. Eliminar FKs antiguas
ALTER TABLE notifications.notification_preferences
    DROP CONSTRAINT IF EXISTS notification_preferences_user_id_fkey;

ALTER TABLE notifications.user_devices
    DROP CONSTRAINT IF EXISTS user_devices_user_id_fkey;

-- 2. Agregar nuevas FKs apuntando a auth_management.profiles
ALTER TABLE notifications.notification_preferences
    ADD CONSTRAINT notification_preferences_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES auth_management.profiles(id) ON DELETE CASCADE;

ALTER TABLE notifications.user_devices
    ADD CONSTRAINT user_devices_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES auth_management.profiles(id) ON DELETE CASCADE;

COMMIT;
```

---

## 4. CRITERIOS DE ACEPTACION

### Backend
- [x] Todas las entities coinciden con el schema DDL
- [x] Campos `delivered_at` y `provider_response` agregados a NotificationLog
- [x] Campos de preferencias avanzadas agregados a NotificationPreference
- [x] Status default corregido a 'queued' en NotificationQueue
- [ ] Build del backend pasa sin errores (pendiente validacion)

### Frontend
- [x] Campos de preferencias usan nombres correctos (*Enabled)
- [x] Dispositivos muestran deviceType en lugar de browser/os
- [x] usePushNotifications usa isSubscribedToPush
- [x] Tipos de notificacion coinciden con backend
- [x] Rutas de navegacion correctas (ya eran correctas)
- [ ] Build del frontend pasa sin errores (pendiente validacion)

### Seeds
- [x] Seed de notification_preferences creado y ejecutable
- [x] Seed de user_devices creado para dev
- [x] 9 templates faltantes agregados (18 total)
- [x] create-database.sh ejecuta sin errores
- [x] 576 preferencias creadas (48 usuarios × 12 tipos)
- [x] Orden de ejecución corregido (preferences después de profiles)

### DDL
- [x] FKs consistentes apuntando a auth_management.profiles
- [x] Migracion creada en migrations/2026-01-04-001-sync-fk-notifications-to-profiles.sql
- [x] Tablas de notificaciones recreadas con columnas correctas

---

## 5. COMANDOS DE VALIDACION

```bash
# Backend - Build y verificar entities
cd apps/backend
npm run build
npm run lint

# Frontend - Build y verificar tipos
cd apps/frontend
npm run build
npm run lint

# Database - Recrear y validar seeds
cd apps/database
./scripts/recreate-database.sh --env dev

# Verificar tablas de notificaciones
PGPASSWORD=$DB_PASSWORD psql -h localhost -U gamilit_user -d gamilit_platform -c "
SELECT table_name,
       (SELECT count(*) FROM information_schema.columns
        WHERE table_schema = 'notifications' AND table_name = t.table_name) as columns
FROM information_schema.tables t
WHERE table_schema = 'notifications'
ORDER BY table_name;
"
```

---

## 6. ORDEN DE EJECUCION RECOMENDADO

1. **BE-SYNC-001 a BE-SYNC-007** (Backend entities primero)
2. **SEED-001 a SEED-003** (Seeds antes de frontend para tener datos)
3. **FE-SYNC-001 a FE-SYNC-006** (Frontend con datos disponibles)
4. **DDL-001 a DDL-003** (FKs al final, requiere migracion)

---

## 7. RIESGOS Y MITIGACIONES

| Riesgo | Probabilidad | Impacto | Mitigacion |
|--------|--------------|---------|------------|
| Migracion FK rompe datos existentes | Media | Alto | Backup antes de migracion |
| Seeds duplican datos | Baja | Medio | Usar ON CONFLICT DO NOTHING |
| Frontend falla con nuevos campos | Media | Alto | Verificar types antes de deploy |

---

## 8. TRAZABILIDAD

### User Stories Relacionadas
- US-NOT-001a: Infraestructura WebSocket
- US-NOT-001b: Centro de Notificaciones
- US-NOT-001c: Gestion de Preferencias

### Tareas Previas
- BE-NOT-001 a BE-NOT-004 (Completadas 2026-01-04)
- FE-NOT-001 a FE-NOT-010 (Completadas 2026-01-04)

---

**Generado:** 2026-01-04
**Sistema:** NEXUS v3.4 + SIMCO
**Aprobacion requerida:** SI
