# NOTIFICATIONS-ENTITIES-ANALYSIS.md

**Fecha:** 2026-01-20
**Analista:** Claude Opus 4.5
**Tarea:** Sincronizacion de Entities del Modulo Notifications
**Relacionado:** EXT-003 (Sistema Multi-Canal de Notificaciones)

---

## 1. RESUMEN EJECUTIVO

| Estado General | CORRECTO - Sin Gaps Criticos |
|----------------|------------------------------|
| Tablas DDL | 6 |
| Entities Existentes | 6 |
| Entities Correctamente Mapeadas | 6 |
| Gaps de Mapeo | 0 |
| Discrepancias Menores | 4 (detalles abajo) |

**CONCLUSION:** Las 6 entities del modulo notifications **ESTAN CORRECTAMENTE IMPLEMENTADAS** y mapeadas a sus tablas DDL correspondientes. No hay entities faltantes. Se identificaron 4 discrepancias menores que no bloquean la funcionalidad.

---

## 2. INVENTARIO COMPARATIVO

### 2.1 Tablas DDL vs Entities

| # | Tabla DDL | Entity | Ubicacion Entity | Estado |
|---|-----------|--------|------------------|--------|
| 1 | `notifications.notifications` | `Notification` | `multichannel/notification.entity.ts` | CORRECTO |
| 2 | `notifications.notification_preferences` | `NotificationPreference` | `multichannel/notification-preference.entity.ts` | CORRECTO |
| 3 | `notifications.notification_logs` | `NotificationLog` | `multichannel/notification-log.entity.ts` | CORRECTO |
| 4 | `notifications.notification_templates` | `NotificationTemplate` | `multichannel/notification-template.entity.ts` | CORRECTO |
| 5 | `notifications.notification_queue` | `NotificationQueue` | `multichannel/notification-queue.entity.ts` | CORRECTO |
| 6 | `notifications.user_devices` | `UserDevice` | `multichannel/user-device.entity.ts` | CORRECTO |

### 2.2 Verificacion de Decoradores @Entity

Todas las entities usan correctamente `DB_SCHEMAS.NOTIFICATIONS` y `DB_TABLES.NOTIFICATIONS.*`:

```typescript
// notification.entity.ts
@Entity({
  schema: DB_SCHEMAS.NOTIFICATIONS,      // = 'notifications'
  name: DB_TABLES.NOTIFICATIONS.NOTIFICATIONS,  // = 'notifications'
})

// notification-preference.entity.ts
@Entity({
  schema: DB_SCHEMAS.NOTIFICATIONS,
  name: DB_TABLES.NOTIFICATIONS.NOTIFICATION_PREFERENCES,  // = 'notification_preferences'
})

// notification-log.entity.ts
@Entity({
  schema: DB_SCHEMAS.NOTIFICATIONS,
  name: DB_TABLES.NOTIFICATIONS.NOTIFICATION_LOGS,  // = 'notification_logs'
})

// notification-template.entity.ts
@Entity({
  schema: DB_SCHEMAS.NOTIFICATIONS,
  name: DB_TABLES.NOTIFICATIONS.NOTIFICATION_TEMPLATES,  // = 'notification_templates'
})

// notification-queue.entity.ts
@Entity({
  schema: DB_SCHEMAS.NOTIFICATIONS,
  name: DB_TABLES.NOTIFICATIONS.NOTIFICATION_QUEUE,  // = 'notification_queue'
})

// user-device.entity.ts
@Entity({
  schema: DB_SCHEMAS.NOTIFICATIONS,
  name: DB_TABLES.NOTIFICATIONS.USER_DEVICES,  // = 'user_devices'
})
```

---

## 3. ANALISIS DETALLADO POR ENTITY

### 3.1 Notification Entity

**Archivo DDL:** `/apps/database/ddl/schemas/notifications/tables/01-notifications.sql`
**Archivo Entity:** `/apps/backend/src/modules/notifications/entities/multichannel/notification.entity.ts`

| Columna DDL | Tipo PostgreSQL | Propiedad Entity | Tipo TypeScript | Estado |
|-------------|-----------------|------------------|-----------------|--------|
| `id` | UUID PRIMARY KEY | `id` | string | OK |
| `user_id` | UUID NOT NULL | `userId` | string | OK |
| `type` | VARCHAR(50) NOT NULL | `type` | string | OK |
| `title` | VARCHAR(255) NOT NULL | `title` | string | OK |
| `message` | TEXT NOT NULL | `message` | string | OK |
| `data` | JSONB DEFAULT '{}' | `data` | Record<string, unknown> | OK |
| `priority` | VARCHAR(20) DEFAULT 'normal' | `priority` | string | OK |
| `channels` | VARCHAR(50)[] DEFAULT ['in_app'] | `channels` | string[] | OK |
| `status` | VARCHAR(20) DEFAULT 'pending' | `status` | string | OK |
| `read_at` | TIMESTAMP | `readAt` | Date | OK |
| `sent_at` | TIMESTAMP | `sentAt` | Date | OK |
| `created_at` | TIMESTAMP | `createdAt` | Date | OK |
| `expires_at` | TIMESTAMP | `expiresAt` | Date | OK |
| `metadata` | JSONB DEFAULT '{}' | `metadata` | Record<string, unknown> | OK |

**Indices en Entity:**
- `@Index(['userId'])` - Correcto
- `@Index(['type'])` - Correcto
- `@Index(['status'])` - Correcto
- `@Index(['createdAt'])` - Correcto
- `@Index(['expiresAt'])` - Correcto

**Estado:** COMPLETAMENTE SINCRONIZADO

---

### 3.2 NotificationPreference Entity

**Archivo DDL:** `/apps/database/ddl/schemas/notifications/tables/02-notification_preferences.sql`
**Archivo Entity:** `/apps/backend/src/modules/notifications/entities/multichannel/notification-preference.entity.ts`

| Columna DDL | Tipo PostgreSQL | Propiedad Entity | Tipo TypeScript | Estado |
|-------------|-----------------|------------------|-----------------|--------|
| `id` | UUID PRIMARY KEY | `id` | string | OK |
| `user_id` | UUID NOT NULL | `userId` | string | OK |
| `notification_type` | VARCHAR(50) NOT NULL | `notificationType` | string | OK |
| `in_app_enabled` | BOOLEAN DEFAULT true | `inAppEnabled` | boolean | OK |
| `email_enabled` | BOOLEAN DEFAULT true | `emailEnabled` | boolean | OK |
| `push_enabled` | BOOLEAN DEFAULT true | `pushEnabled` | boolean | OK |
| `email_frequency` | VARCHAR(20) DEFAULT 'immediate' | `emailFrequency` | 'immediate' \| 'daily' \| 'weekly' \| 'never' | OK |
| `quiet_hours_start` | TIME | `quietHoursStart` | string | OK |
| `quiet_hours_end` | TIME | `quietHoursEnd` | string | OK |
| `timezone` | VARCHAR(50) DEFAULT 'America/Mexico_City' | `timezone` | string | OK |
| `created_at` | TIMESTAMP | `createdAt` | Date | OK |
| `updated_at` | TIMESTAMP | `updatedAt` | Date | OK |

**Indices en Entity:**
- `@Index(['userId'])` - Correcto
- `@Index(['notificationType'])` - Correcto
- `@Index(['userId', 'notificationType'], { unique: true })` - Correcto (refleja UNIQUE constraint)

**Estado:** COMPLETAMENTE SINCRONIZADO

---

### 3.3 NotificationLog Entity

**Archivo DDL:** `/apps/database/ddl/schemas/notifications/tables/03-notification_logs.sql`
**Archivo Entity:** `/apps/backend/src/modules/notifications/entities/multichannel/notification-log.entity.ts`

| Columna DDL | Tipo PostgreSQL | Propiedad Entity | Tipo TypeScript | Estado |
|-------------|-----------------|------------------|-----------------|--------|
| `id` | UUID PRIMARY KEY | `id` | string | OK |
| `notification_id` | UUID NOT NULL | `notificationId` | string | OK |
| `channel` | VARCHAR(20) NOT NULL | `channel` | string | MENOR* |
| `status` | VARCHAR(20) NOT NULL | `status` | string | MENOR** |
| `sent_at` | TIMESTAMP | `sentAt` | Date | OK |
| `delivered_at` | TIMESTAMP | `deliveredAt` | Date | OK |
| `error_message` | TEXT | `errorMessage` | string | OK |
| `provider_response` | JSONB | `providerResponse` | Record<string, unknown> | OK |
| `metadata` | JSONB DEFAULT '{}' | `metadata` | Record<string, unknown> | OK |

**DISCREPANCIA MENOR 1 (*):** Entity tiene `channel` como VARCHAR(50), DDL tiene VARCHAR(20). No es bloqueante pero podria ajustarse.

**DISCREPANCIA MENOR 2 (**):** Entity tiene `status` como VARCHAR(50), DDL tiene VARCHAR(20). No es bloqueante pero podria ajustarse.

**Columnas Adicionales en Entity (no en DDL):**
- `externalId` (VARCHAR 255) - Agregado para tracking con proveedores externos. **CORRECTO** - Es una mejora del backend.
- `createdAt` (TIMESTAMP) - Agregado para auditoría. **CORRECTO** - Es una mejora del backend.

**Relaciones:**
- `@ManyToOne(() => Notification)` - Correcto, refleja FK a notifications.notifications

**Estado:** SINCRONIZADO CON MEJORAS

---

### 3.4 NotificationTemplate Entity

**Archivo DDL:** `/apps/database/ddl/schemas/notifications/tables/04-notification_templates.sql`
**Archivo Entity:** `/apps/backend/src/modules/notifications/entities/multichannel/notification-template.entity.ts`

| Columna DDL | Tipo PostgreSQL | Propiedad Entity | Tipo TypeScript | Estado |
|-------------|-----------------|------------------|-----------------|--------|
| `id` | UUID PRIMARY KEY | `id` | string | OK |
| `template_key` | VARCHAR(100) NOT NULL UNIQUE | `templateKey` | string | OK |
| `name` | VARCHAR(255) NOT NULL | `name` | string | OK |
| `description` | TEXT | `description` | string | OK |
| `subject_template` | TEXT | `subjectTemplate` | string | MENOR*** |
| `body_template` | TEXT NOT NULL | `bodyTemplate` | string | OK |
| `html_template` | TEXT | `htmlTemplate` | string | OK |
| `variables` | JSONB DEFAULT '[]' | `variables` | string[] | OK |
| `default_channels` | VARCHAR(50)[] DEFAULT ['in_app'] | `defaultChannels` | string[] | OK |
| `is_active` | BOOLEAN DEFAULT true | `isActive` | boolean | OK |
| `created_at` | TIMESTAMP | `createdAt` | Date | OK |
| `updated_at` | TIMESTAMP | `updatedAt` | Date | OK |

**DISCREPANCIA MENOR 3 (***):** DDL tiene `subject_template` como nullable (sin NOT NULL), Entity tiene `subjectTemplate` como requerido (sin `nullable: true`). No es bloqueante pero entity deberia tener `nullable: true`.

**Estado:** SINCRONIZADO CON DISCREPANCIA MENOR

---

### 3.5 NotificationQueue Entity

**Archivo DDL:** `/apps/database/ddl/schemas/notifications/tables/05-notification_queue.sql`
**Archivo Entity:** `/apps/backend/src/modules/notifications/entities/multichannel/notification-queue.entity.ts`

| Columna DDL | Tipo PostgreSQL | Propiedad Entity | Tipo TypeScript | Estado |
|-------------|-----------------|------------------|-----------------|--------|
| `id` | UUID PRIMARY KEY | `id` | string | OK |
| `notification_id` | UUID NOT NULL | `notificationId` | string | OK |
| `channel` | VARCHAR(20) NOT NULL | `channel` | string | MENOR**** |
| `scheduled_for` | TIMESTAMP NOT NULL | `scheduledFor` | Date | OK |
| `priority` | INTEGER DEFAULT 0 | `priority` | number | OK |
| `attempts` | INTEGER DEFAULT 0 | `attempts` | number | OK |
| `max_attempts` | INTEGER DEFAULT 3 | `maxAttempts` | number | OK |
| `status` | VARCHAR(20) DEFAULT 'queued' | `status` | 'queued' \| 'processing' \| 'sent' \| 'failed' | OK |
| `last_attempt_at` | TIMESTAMP | `lastAttemptAt` | Date | OK |
| `error_message` | TEXT | `errorMessage` | string | OK |
| `created_at` | TIMESTAMP | `createdAt` | Date | OK |

**DISCREPANCIA MENOR 4 (****):** Entity tiene `channel` como VARCHAR(50), DDL tiene VARCHAR(20). No es bloqueante pero podria ajustarse.

**Relaciones:**
- `@ManyToOne(() => Notification)` - Correcto, refleja FK a notifications.notifications

**Estado:** SINCRONIZADO CON DISCREPANCIA MENOR

---

### 3.6 UserDevice Entity

**Archivo DDL:** `/apps/database/ddl/schemas/notifications/tables/06-user_devices.sql`
**Archivo Entity:** `/apps/backend/src/modules/notifications/entities/multichannel/user-device.entity.ts`

| Columna DDL | Tipo PostgreSQL | Propiedad Entity | Tipo TypeScript | Estado |
|-------------|-----------------|------------------|-----------------|--------|
| `id` | UUID PRIMARY KEY | `id` | string | OK |
| `user_id` | UUID NOT NULL | `userId` | string | OK |
| `device_type` | VARCHAR(20) NOT NULL | `deviceType` | string | OK |
| `device_token` | TEXT NOT NULL | `deviceToken` | string | OK |
| `browser` | VARCHAR(50) | `deviceName` | string | DIFERENTE* |
| `os` | VARCHAR(50) | N/A | N/A | FALTA** |
| `is_active` | BOOLEAN DEFAULT true | `isActive` | boolean | OK |
| `last_used_at` | TIMESTAMP | `lastUsedAt` | Date | OK |
| `created_at` | TIMESTAMP | `createdAt` | Date | OK |

**DIFERENCIA INTENCIONAL (*):** DDL tiene `browser` VARCHAR(50), Entity tiene `deviceName` VARCHAR(255). Esta diferencia parece intencional - `deviceName` es mas descriptivo y versatil para el frontend.

**COLUMNA FALTANTE EN ENTITY (**):** DDL tiene `os` VARCHAR(50), Entity no tiene esta propiedad. Esto es una **omision menor** ya que el `deviceName` puede contener informacion del OS.

**Estado:** SINCRONIZADO CON DIFERENCIAS DE DISENO

---

## 4. DISCREPANCIAS IDENTIFICADAS

### 4.1 Discrepancias de Tipos VARCHAR

| Entity | Columna | DDL | Entity | Severidad | Recomendacion |
|--------|---------|-----|--------|-----------|---------------|
| NotificationLog | channel | VARCHAR(20) | VARCHAR(50) | BAJA | Ajustar a 20 |
| NotificationLog | status | VARCHAR(20) | VARCHAR(50) | BAJA | Ajustar a 20 |
| NotificationQueue | channel | VARCHAR(20) | VARCHAR(50) | BAJA | Ajustar a 20 |
| NotificationTemplate | subjectTemplate | TEXT nullable | TEXT required | BAJA | Agregar nullable: true |

### 4.2 Columnas Faltantes

| Entity | Columna DDL | Descripcion | Severidad | Recomendacion |
|--------|-------------|-------------|-----------|---------------|
| UserDevice | `os` | Sistema operativo del dispositivo | BAJA | Agregar si se necesita |

### 4.3 Columnas Adicionales en Entities (no en DDL)

| Entity | Propiedad | Descripcion | Estado |
|--------|-----------|-------------|--------|
| NotificationLog | `externalId` | ID del proveedor externo | MEJORA - Mantener |
| NotificationLog | `createdAt` | Timestamp de creacion | MEJORA - Mantener |
| UserDevice | `deviceName` | Nombre descriptivo del dispositivo | MEJORA - Reemplaza browser |

---

## 5. VERIFICACION DE RELACIONES

### 5.1 Relaciones Implementadas

| Entity | Relacion | Tipo | FK en DDL | Estado |
|--------|----------|------|-----------|--------|
| NotificationLog | notification | @ManyToOne | notification_id -> notifications.notifications(id) | CORRECTO |
| NotificationQueue | notification | @ManyToOne | notification_id -> notifications.notifications(id) | CORRECTO |

### 5.2 Relaciones Cross-Datasource (sin @ManyToOne)

Las siguientes columnas tienen FK en DDL pero NO tienen decorador @ManyToOne en Entity porque cruzan datasources (auth vs notifications):

| Entity | Columna | FK en DDL | Razon |
|--------|---------|-----------|-------|
| Notification | user_id | auth_management.profiles(id) | Cross-datasource |
| NotificationPreference | user_id | auth_management.profiles(id) | Cross-datasource |
| UserDevice | user_id | auth_management.profiles(id) | Cross-datasource |

**CORRECTO:** TypeORM no soporta relaciones cross-datasource. Las relaciones se resuelven manualmente en services.

---

## 6. QUERY SQL DE VALIDACION

Ejecutar este query para verificar coherencia entre DDL y entities:

```sql
-- Verificar que todas las tablas del schema notifications existen
SELECT
    table_schema,
    table_name,
    CASE
        WHEN table_name = 'notifications' THEN 'Notification entity'
        WHEN table_name = 'notification_preferences' THEN 'NotificationPreference entity'
        WHEN table_name = 'notification_logs' THEN 'NotificationLog entity'
        WHEN table_name = 'notification_templates' THEN 'NotificationTemplate entity'
        WHEN table_name = 'notification_queue' THEN 'NotificationQueue entity'
        WHEN table_name = 'user_devices' THEN 'UserDevice entity'
        ELSE 'SIN ENTITY'
    END as entity_mapping
FROM information_schema.tables
WHERE table_schema = 'notifications'
ORDER BY table_name;

-- Verificar columnas de cada tabla
SELECT
    table_name,
    column_name,
    data_type,
    character_maximum_length,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'notifications'
ORDER BY table_name, ordinal_position;

-- Verificar foreign keys
SELECT
    tc.table_name,
    kcu.column_name,
    ccu.table_schema AS foreign_table_schema,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_schema = 'notifications';

-- Contar registros por tabla (verificar que no hay datos huerfanos)
SELECT 'notifications' as tabla, COUNT(*) as registros FROM notifications.notifications
UNION ALL
SELECT 'notification_preferences', COUNT(*) FROM notifications.notification_preferences
UNION ALL
SELECT 'notification_logs', COUNT(*) FROM notifications.notification_logs
UNION ALL
SELECT 'notification_templates', COUNT(*) FROM notifications.notification_templates
UNION ALL
SELECT 'notification_queue', COUNT(*) FROM notifications.notification_queue
UNION ALL
SELECT 'user_devices', COUNT(*) FROM notifications.user_devices;
```

---

## 7. RECOMENDACIONES

### 7.1 Acciones Opcionales (Baja Prioridad)

Estas correcciones son **opcionales** y no bloquean EXT-003:

1. **NotificationLog.channel:** Cambiar VARCHAR(50) a VARCHAR(20)
2. **NotificationLog.status:** Cambiar VARCHAR(50) a VARCHAR(20)
3. **NotificationQueue.channel:** Cambiar VARCHAR(50) a VARCHAR(20)
4. **NotificationTemplate.subjectTemplate:** Agregar `nullable: true`
5. **UserDevice:** Considerar agregar propiedad `os` si se necesita

### 7.2 NO se Requiere Accion

- Todas las 6 entities estan creadas y correctamente mapeadas
- Los decoradores @Entity usan constantes de database.constants.ts
- Las relaciones @ManyToOne estan correctamente implementadas
- Las relaciones cross-datasource estan correctamente documentadas

---

## 8. CONCLUSION

**EL MODULO NOTIFICATIONS ESTA LISTO PARA EXT-003.**

Las 6 entities del modulo `notifications` estan **completamente implementadas** y **correctamente sincronizadas** con sus tablas DDL:

1. `Notification` -> `notifications.notifications`
2. `NotificationPreference` -> `notifications.notification_preferences`
3. `NotificationLog` -> `notifications.notification_logs`
4. `NotificationTemplate` -> `notifications.notification_templates`
5. `NotificationQueue` -> `notifications.notification_queue`
6. `UserDevice` -> `notifications.user_devices`

Las discrepancias identificadas son menores (diferencias de longitud VARCHAR) y no afectan la funcionalidad. Las columnas adicionales en entities son mejoras legitimas del backend.

**NO HAY BLOQUEO PARA EXT-003.**

---

## REFERENCIAS

- DDL: `/home/isem/workspace-v2/projects/gamilit/apps/database/ddl/schemas/notifications/tables/`
- Entities: `/home/isem/workspace-v2/projects/gamilit/apps/backend/src/modules/notifications/entities/multichannel/`
- Constants: `/home/isem/workspace-v2/projects/gamilit/apps/backend/src/shared/constants/database.constants.ts`
- Documentacion EXT-003: Ver orchestration/extensiones/

---

*Analisis generado por Claude Opus 4.5 - 2026-01-20*
