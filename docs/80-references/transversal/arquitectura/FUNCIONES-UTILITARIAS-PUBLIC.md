# Funciones Utilitarias del Schema `public`

**Schema:** `public`
**Propósito:** Funciones utilitarias compartidas del sistema (mantenimiento, feature flags, logging, validaciones)
**Cantidad:** 7 funciones
**Estado:** ✅ Documentadas
**Última actualización:** 2025-11-08

---

## 📋 Índice

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Funciones por Categoría](#funciones-por-categoría)
3. [Documentación Detallada](#documentación-detallada)
4. [Diagrama de Dependencias](#diagrama-de-dependencias)
5. [Mejores Prácticas](#mejores-prácticas)
6. [Consideraciones de Seguridad](#consideraciones-de-seguridad)
7. [Performance y Optimización](#performance-y-optimización)

---

## 📊 Resumen Ejecutivo

El schema `public` contiene **7 funciones utilitarias** críticas para el sistema, organizadas en 4 categorías funcionales:

| Categoría | Funciones | Uso Principal |
|-----------|-----------|---------------|
| **Mantenimiento** | 2 | Limpieza automática de logs antiguos |
| **Feature Management** | 2 | Sistema de feature flags y A/B testing |
| **Logging/Notifications** | 2 | Registro de eventos y notificaciones a usuarios |
| **Validación** | 1 | Validación de rangos de fechas |

**Todas las funciones tienen:**
- ✅ `SECURITY DEFINER` para control de permisos
- ✅ `SET search_path` para seguridad
- ✅ Manejo de excepciones robusto
- ✅ Documentación inline con COMMENT ON
- ✅ Ejemplos de uso

---

## 🗂️ Funciones por Categoría

### 1. Mantenimiento y Limpieza (2 funciones)

#### 1.1 `cleanup_old_system_logs()`
**Archivo:** `apps/database/ddl/schemas/public/functions/01-cleanup_old_system_logs.sql`
**Propósito:** Elimina logs de sistema antiguos para optimización de storage

**Firma:**
```sql
CREATE FUNCTION public.cleanup_old_system_logs(
    p_retention_days INTEGER DEFAULT 90
)
RETURNS TABLE(
    deleted_count INTEGER,
    status_message TEXT
)
```

**Características:**
- Retención configurable (default: 90 días)
- VACUUM ANALYZE automático después de limpieza
- Logs de auditoría de la operación
- Retorna conteo de registros eliminados

---

#### 1.2 `cleanup_old_user_activity()`
**Archivo:** `apps/database/ddl/schemas/public/functions/02-cleanup_old_user_activity.sql`
**Propósito:** Elimina registros de actividad de usuario antiguos

**Firma:**
```sql
CREATE FUNCTION public.cleanup_old_user_activity(
    p_retention_days INTEGER DEFAULT 180
)
RETURNS TABLE(
    deleted_count INTEGER,
    status_message TEXT
)
```

**Características:**
- Retención más larga (default: 180 días vs 90 para system logs)
- Optimización automática de tabla (VACUUM ANALYZE)
- Manejo robusto de errores
- Útil para compliance (GDPR, retención de datos)

---

### 2. Feature Management (2 funciones)

#### 2.1 `is_feature_enabled()`
**Archivo:** `apps/database/ddl/schemas/public/functions/03-is_feature_enabled.sql`
**Propósito:** Verifica si un feature flag está habilitado (con soporte para targeting y A/B testing)

**Firma:**
```sql
CREATE FUNCTION public.is_feature_enabled(
    p_feature_key TEXT,
    p_user_id UUID DEFAULT NULL
)
RETURNS BOOLEAN
```

**Características avanzadas:**
- ✅ Habilitación global simple
- ✅ **Whitelist de usuarios** (target_users array)
- ✅ **Targeting por roles** (target_roles array)
- ✅ **Gradual rollout** (rollout_percentage 0-100)
- ✅ **Time windows** (starts_at, ends_at)
- ✅ **Hashing determinístico** para consistencia de usuario

**Algoritmo de evaluación:**
```
1. ¿Feature existe y está enabled globalmente? → Si NO: return FALSE
2. ¿Está fuera del time window? → Si SÍ: return FALSE
3. ¿user_id es NULL? → Si SÍ: return TRUE (global enabled)
4. ¿User está en whitelist (target_users)? → Si SÍ: return TRUE
5. ¿target_roles especificado?
   - Si SÍ: ¿User tiene rol permitido? → return TRUE/FALSE según match
   - Si NO: continuar
6. ¿rollout_percentage < 100?
   - Si SÍ: hash(user_id) % 100 < rollout_percentage → return TRUE/FALSE
   - Si NO: return TRUE
```

---

#### 2.2 `update_feature_flag()`
**Archivo:** `apps/database/ddl/schemas/public/functions/06-update_feature_flag.sql`
**Propósito:** Actualiza o crea feature flags con configuración de rollout

**Firma:**
```sql
CREATE FUNCTION public.update_feature_flag(
    p_feature_key TEXT,
    p_enabled BOOLEAN,
    p_rollout_percentage INTEGER DEFAULT 100,
    p_description TEXT DEFAULT NULL
)
RETURNS TABLE(
    feature_id UUID,
    key TEXT,
    enabled BOOLEAN,
    rollout_percentage INTEGER,
    status_message TEXT
)
```

**Características:**
- **Upsert automático** (UPDATE o INSERT según exista)
- Validación de rollout_percentage (0-100)
- Logging automático del cambio
- Retorna estado completo del feature flag

---

### 3. Logging y Notificaciones (2 funciones)

#### 3.1 `log_system_event()`
**Archivo:** `apps/database/ddl/schemas/public/functions/04-log_system_event.sql`
**Propósito:** Registra eventos del sistema para auditoría y monitoreo

**Firma:**
```sql
CREATE FUNCTION public.log_system_event(
    p_event_type TEXT,
    p_event_source TEXT,
    p_event_data JSONB DEFAULT NULL,
    p_severity TEXT DEFAULT 'INFO'
)
RETURNS UUID
```

**Niveles de severidad:**
- `DEBUG` - Información de debugging detallada
- `INFO` - Eventos informativos normales
- `WARNING` - Advertencias (no críticas)
- `ERROR` - Errores que requieren atención
- `CRITICAL` - Errores críticos del sistema

**Características:**
- Almacenamiento en `audit_logging.system_logs`
- Metadata flexible (JSONB)
- Validación de severity level
- Retorna UUID del evento creado

---

#### 3.2 `send_notification()`
**Archivo:** `apps/database/ddl/schemas/public/functions/05-send_notification.sql`
**Propósito:** Envía notificaciones a usuarios a través de múltiples canales

**Firma:**
```sql
CREATE FUNCTION public.send_notification(
    p_user_id UUID,
    p_title TEXT,
    p_message TEXT,
    p_notification_type TEXT,
    p_delivery_channels TEXT[] DEFAULT ARRAY['IN_APP'],
    p_metadata JSONB DEFAULT NULL
)
RETURNS UUID
```

**Tipos de notificación:**
- `ASSIGNMENT` - Nueva asignación de maestro
- `ACHIEVEMENT` - Logro desbloqueado
- `SYSTEM` - Notificación del sistema
- `ALERT` - Alerta urgente
- `MESSAGE` - Mensaje directo

**Canales de entrega:**
- `IN_APP` - Notificación in-app (default)
- `EMAIL` - Email
- `SMS` - SMS (futuro)
- `PUSH` - Push notification (futuro)

**Características:**
- Almacena en `gamification_system.notifications`
- Crea entradas en `notification_delivery_queue` por cada canal
- Logging automático del envío
- Metadata JSONB para contexto adicional

---

### 4. Validación (1 función)

#### 4.1 `validate_date_range()`
**Archivo:** `apps/database/ddl/schemas/public/functions/07-validate_date_range.sql`
**Propósito:** Valida rangos de fechas para lógica y restricciones de duración

**Firma:**
```sql
CREATE FUNCTION public.validate_date_range(
    p_start_date TIMESTAMP WITHOUT TIME ZONE,
    p_end_date TIMESTAMP WITHOUT TIME ZONE,
    p_max_range_days INTEGER DEFAULT 365
)
RETURNS TABLE(
    is_valid BOOLEAN,
    validation_message TEXT,
    days_in_range INTEGER
)
```

**Validaciones aplicadas:**
1. ✅ Ninguna fecha puede ser NULL
2. ✅ start_date debe ser <= end_date
3. ✅ Rango no puede exceder `p_max_range_days`
4. ✅ Permite rangos en el futuro (para scheduling)

**Casos de uso:**
- Validar rangos de assignments (due_date)
- Validar rangos de reportes
- Validar time windows de feature flags
- Validar períodos de campañas/eventos

---

## 📋 Documentación Detallada

### Función: `cleanup_old_system_logs()`

**Descripción completa:**
Función de mantenimiento que elimina logs de sistema antiguos del schema `audit_logging` para optimizar almacenamiento y performance. Ejecuta VACUUM ANALYZE automáticamente después de la eliminación para recuperar espacio.

**Parámetros:**
| Parámetro | Tipo | Default | Descripción |
|-----------|------|---------|-------------|
| `p_retention_days` | INTEGER | 90 | Días de retención de logs |

**Retorno:**
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `deleted_count` | INTEGER | Número de registros eliminados |
| `status_message` | TEXT | Mensaje de estado de la operación |

**Uso:**
```sql
-- Limpiar logs con retención default (90 días)
SELECT * FROM public.cleanup_old_system_logs();

-- Limpiar logs con retención custom (30 días)
SELECT * FROM public.cleanup_old_system_logs(30);

-- Retención extendida para auditoría (365 días)
SELECT * FROM public.cleanup_old_system_logs(365);
```

**Resultado esperado:**
```
deleted_count | status_message
--------------+---------------------------------------------------------------
       15247  | Successfully deleted 15247 log entries older than 90 days
```

**Uso en cron jobs:**
```sql
-- Ejecutar semanalmente (Domingo 3am)
-- pg_cron example:
SELECT cron.schedule(
    'cleanup-system-logs-weekly',
    '0 3 * * 0',  -- Domingo 3am
    $$SELECT public.cleanup_old_system_logs(90)$$
);
```

**Schemas afectados:**
- `audit_logging.system_logs` (DELETE + VACUUM)

---

### Función: `cleanup_old_user_activity()`

**Descripción completa:**
Función de mantenimiento para eliminar registros antiguos de actividad de usuario. Útil para cumplir con regulaciones de retención de datos (GDPR) y optimizar performance de queries.

**Parámetros:**
| Parámetro | Tipo | Default | Descripción |
|-----------|------|---------|-------------|
| `p_retention_days` | INTEGER | 180 | Días de retención de activity logs |

**Retorno:**
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `deleted_count` | INTEGER | Número de registros eliminados |
| `status_message` | TEXT | Mensaje de estado de la operación |

**Uso:**
```sql
-- Limpiar activity con retención default (180 días = 6 meses)
SELECT * FROM public.cleanup_old_user_activity();

-- Retención mínima legal (90 días)
SELECT * FROM public.cleanup_old_user_activity(90);

-- Retención extendida (2 años)
SELECT * FROM public.cleanup_old_user_activity(730);
```

**Consideraciones GDPR:**
- Default de 180 días cumple con mayoría de regulaciones
- Para compliance estricto, usar 90 días
- Documentar política de retención en términos de servicio

**Uso en cron jobs:**
```sql
-- Ejecutar mensualmente (1er día del mes, 4am)
SELECT cron.schedule(
    'cleanup-user-activity-monthly',
    '0 4 1 * *',  -- 1er día de mes, 4am
    $$SELECT public.cleanup_old_user_activity(180)$$
);
```

**Schemas afectados:**
- `audit_logging.user_activity_logs` (DELETE + VACUUM)

---

### Función: `is_feature_enabled()`

**Descripción completa:**
Sistema avanzado de feature flags con soporte para:
- Habilitación/deshabilitación global
- Targeting por usuarios específicos (whitelist)
- Targeting por roles
- Gradual rollout (A/B testing)
- Time windows (scheduling)

**Parámetros:**
| Parámetro | Tipo | Default | Descripción |
|-----------|------|---------|-------------|
| `p_feature_key` | TEXT | - | Clave única del feature flag |
| `p_user_id` | UUID | NULL | Usuario para verificación (opcional) |

**Retorno:** BOOLEAN

**Casos de uso:**

#### Caso 1: Feature global simple
```sql
-- Habilitar nuevo dashboard para todos
INSERT INTO system_configuration.feature_flags (feature_key, is_enabled)
VALUES ('new_dashboard', TRUE);

-- Verificar si está habilitado globalmente
SELECT is_feature_enabled('new_dashboard');
-- Returns: TRUE
```

#### Caso 2: Beta testing con usuarios específicos
```sql
-- Habilitar feature solo para beta testers
INSERT INTO system_configuration.feature_flags (
    feature_key,
    is_enabled,
    target_users
) VALUES (
    'beta_analytics',
    TRUE,
    ARRAY['uuid-beta-user-1'::UUID, 'uuid-beta-user-2'::UUID]
);

-- Verificar para beta user
SELECT is_feature_enabled('beta_analytics', 'uuid-beta-user-1'::UUID);
-- Returns: TRUE

-- Verificar para usuario normal
SELECT is_feature_enabled('beta_analytics', 'uuid-normal-user'::UUID);
-- Returns: FALSE
```

#### Caso 3: Gradual rollout (10% → 50% → 100%)
```sql
-- Fase 1: Rollout al 10% de usuarios
UPDATE system_configuration.feature_flags
SET rollout_percentage = 10
WHERE feature_key = 'new_exercise_ui';

-- Fase 2: Incrementar a 50% (después de 1 semana)
UPDATE system_configuration.feature_flags
SET rollout_percentage = 50
WHERE feature_key = 'new_exercise_ui';

-- Fase 3: Full rollout (100%)
UPDATE system_configuration.feature_flags
SET rollout_percentage = 100
WHERE feature_key = 'new_exercise_ui';

-- Verificación (consistente para el mismo usuario)
SELECT is_feature_enabled('new_exercise_ui', user_id);
-- User hash determina si ve el feature (consistente entre llamadas)
```

#### Caso 4: Feature solo para maestros
```sql
-- Feature exclusivo para teachers y admin_teachers
INSERT INTO system_configuration.feature_flags (
    feature_key,
    is_enabled,
    target_roles
) VALUES (
    'advanced_grading_tools',
    TRUE,
    ARRAY['teacher', 'admin_teacher']::auth_management.gamilit_role[]
);

-- Verificar para teacher
SELECT is_feature_enabled('advanced_grading_tools', teacher_user_id);
-- Returns: TRUE

-- Verificar para student
SELECT is_feature_enabled('advanced_grading_tools', student_user_id);
-- Returns: FALSE
```

#### Caso 5: Time-limited feature (evento/campaña)
```sql
-- Feature activo solo durante Diciembre (campaña navideña)
INSERT INTO system_configuration.feature_flags (
    feature_key,
    is_enabled,
    starts_at,
    ends_at
) VALUES (
    'winter_event_2025',
    TRUE,
    '2025-12-01 00:00:00',
    '2025-12-31 23:59:59'
);

-- Verificación automática de time window
SELECT is_feature_enabled('winter_event_2025');
-- Returns: TRUE solo entre dic 1-31, 2025
```

**Uso en backend:**
```typescript
// apps/backend/src/modules/feature-flags/feature-flags.service.ts

async isFeatureEnabled(featureKey: string, userId?: string): Promise<boolean> {
  const result = await this.db.query(
    `SELECT public.is_feature_enabled($1, $2)`,
    [featureKey, userId]
  );
  return result.rows[0].is_feature_enabled;
}

// Ejemplo de uso
if (await this.featureFlags.isFeatureEnabled('new_dashboard', user.id)) {
  // Mostrar nuevo dashboard
  return this.renderNewDashboard();
} else {
  // Mostrar dashboard legacy
  return this.renderLegacyDashboard();
}
```

**Schemas utilizados:**
- `system_configuration.feature_flags` (READ)
- `auth_management.user_roles` (READ)

---

### Función: `update_feature_flag()`

**Descripción completa:**
Gestión de feature flags con upsert automático (crea si no existe, actualiza si existe). Incluye logging automático de cambios para auditoría.

**Parámetros:**
| Parámetro | Tipo | Default | Descripción |
|-----------|------|---------|-------------|
| `p_feature_key` | TEXT | - | Clave única del feature |
| `p_enabled` | BOOLEAN | - | Estado enabled/disabled |
| `p_rollout_percentage` | INTEGER | 100 | Porcentaje de rollout (0-100) |
| `p_description` | TEXT | NULL | Descripción del feature |

**Retorno:**
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `feature_id` | UUID | ID del feature flag |
| `key` | TEXT | Clave del feature |
| `enabled` | BOOLEAN | Estado actual |
| `rollout_percentage` | INTEGER | Porcentaje actual |
| `status_message` | TEXT | Mensaje de resultado |

**Uso:**

#### Crear nuevo feature flag
```sql
SELECT * FROM public.update_feature_flag(
    'dark_mode',
    TRUE,
    100,
    'Dark mode theme for UI'
);

-- Resultado:
-- feature_id | key       | enabled | rollout_percentage | status_message
-- -----------+-----------+---------+--------------------+--------------------------------
-- uuid-xxx   | dark_mode | TRUE    | 100                | Feature flag 'dark_mode' created
```

#### Actualizar feature existente
```sql
-- Reducir rollout a 50% (gradual rollout)
SELECT * FROM public.update_feature_flag(
    'dark_mode',
    TRUE,
    50,
    NULL  -- Mantiene descripción existente
);
```

#### Desactivar feature urgentemente
```sql
-- Kill switch: desactivar feature con problemas
SELECT * FROM public.update_feature_flag(
    'problematic_feature',
    FALSE,
    0,
    'Disabled due to production bug'
);
```

**Uso en admin dashboard:**
```typescript
// apps/backend/src/modules/admin/feature-flags.controller.ts

@Patch('/feature-flags/:key')
async updateFeatureFlag(
  @Param('key') key: string,
  @Body() dto: UpdateFeatureFlagDto
) {
  return await this.db.query(
    `SELECT * FROM public.update_feature_flag($1, $2, $3, $4)`,
    [key, dto.enabled, dto.rolloutPercentage, dto.description]
  );
}
```

**Schemas afectados:**
- `system_configuration.feature_flags` (INSERT/UPDATE)
- `audit_logging.system_logs` (INSERT - logging automático)

---

### Función: `log_system_event()`

**Descripción completa:**
Sistema centralizado de logging para eventos del sistema. Almacena eventos en `audit_logging.system_logs` con metadata JSONB flexible.

**Parámetros:**
| Parámetro | Tipo | Default | Descripción |
|-----------|------|---------|-------------|
| `p_event_type` | TEXT | - | Tipo de evento |
| `p_event_source` | TEXT | - | Sistema/componente origen |
| `p_event_data` | JSONB | NULL | Metadata del evento |
| `p_severity` | TEXT | 'INFO' | Nivel de severidad |

**Retorno:** UUID (ID del evento creado)

**Uso por severidad:**

#### DEBUG - Información detallada
```sql
SELECT log_system_event(
    'CACHE_MISS',
    'cache_service',
    jsonb_build_object(
        'cache_key', 'user:123:profile',
        'ttl_remaining', 0
    ),
    'DEBUG'
);
```

#### INFO - Eventos normales
```sql
SELECT log_system_event(
    'USER_LOGIN_SUCCESS',
    'auth_service',
    jsonb_build_object(
        'user_id', '550e8400-e29b-41d4-a716-446655440000',
        'ip_address', '192.168.1.100',
        'user_agent', 'Mozilla/5.0...'
    ),
    'INFO'
);
```

#### WARNING - Advertencias
```sql
SELECT log_system_event(
    'API_RATE_LIMIT_APPROACHING',
    'api_gateway',
    jsonb_build_object(
        'user_id', '550e8400-e29b-41d4-a716-446655440000',
        'requests_count', 95,
        'limit', 100,
        'window', '1 minute'
    ),
    'WARNING'
);
```

#### ERROR - Errores
```sql
SELECT log_system_event(
    'DATABASE_CONNECTION_FAILED',
    'connection_pool',
    jsonb_build_object(
        'error', 'Connection timeout',
        'pool_size', 20,
        'available_connections', 0
    ),
    'ERROR'
);
```

#### CRITICAL - Errores críticos
```sql
SELECT log_system_event(
    'PAYMENT_GATEWAY_DOWN',
    'payment_service',
    jsonb_build_object(
        'gateway', 'stripe',
        'last_successful_ping', '2025-11-08 10:30:00',
        'consecutive_failures', 5
    ),
    'CRITICAL'
);
```

**Uso en application code:**
```typescript
// apps/backend/src/common/logging/system-logger.service.ts

async logEvent(
  eventType: string,
  source: string,
  data?: object,
  severity: 'DEBUG' | 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL' = 'INFO'
) {
  return await this.db.query(
    `SELECT public.log_system_event($1, $2, $3, $4)`,
    [eventType, source, data ? JSON.stringify(data) : null, severity]
  );
}
```

**Queries útiles para monitoring:**
```sql
-- Últimos 100 eventos críticos
SELECT event_type, event_source, event_data, created_at
FROM audit_logging.system_logs
WHERE severity = 'CRITICAL'
ORDER BY created_at DESC
LIMIT 100;

-- Conteo de errores por source en última hora
SELECT event_source, COUNT(*) as error_count
FROM audit_logging.system_logs
WHERE severity IN ('ERROR', 'CRITICAL')
  AND created_at > NOW() - INTERVAL '1 hour'
GROUP BY event_source
ORDER BY error_count DESC;

-- Timeline de eventos de un usuario
SELECT event_type, severity, created_at
FROM audit_logging.system_logs
WHERE event_data->>'user_id' = '550e8400-e29b-41d4-a716-446655440000'
ORDER BY created_at DESC;
```

**Schemas afectados:**
- `audit_logging.system_logs` (INSERT)

---

### Función: `send_notification()`

**Descripción completa:**
Sistema multi-canal de notificaciones a usuarios. Crea notificación en BD y la encola para entrega por canales configurados (IN_APP, EMAIL, SMS, PUSH).

**Parámetros:**
| Parámetro | Tipo | Default | Descripción |
|-----------|------|---------|-------------|
| `p_user_id` | UUID | - | Usuario destinatario |
| `p_title` | TEXT | - | Título de notificación |
| `p_message` | TEXT | - | Mensaje/cuerpo |
| `p_notification_type` | TEXT | - | Tipo de notificación |
| `p_delivery_channels` | TEXT[] | ['IN_APP'] | Canales de entrega |
| `p_metadata` | JSONB | NULL | Metadata adicional |

**Retorno:** UUID (ID de la notificación creada)

**Uso por tipo:**

#### ASSIGNMENT - Nueva tarea asignada
```sql
SELECT send_notification(
    student_id,
    'Nueva Tarea de Matemáticas',
    'Tu maestro ha asignado una nueva tarea de fracciones. Fecha límite: Viernes',
    'ASSIGNMENT',
    ARRAY['IN_APP', 'EMAIL'],
    jsonb_build_object(
        'assignment_id', assignment_id,
        'teacher_name', 'Prof. García',
        'subject', 'Matemáticas',
        'due_date', '2025-11-15'
    )
);
```

#### ACHIEVEMENT - Logro desbloqueado
```sql
SELECT send_notification(
    student_id,
    '🏆 ¡Logro Desbloqueado!',
    'Has ganado la insignia "Maestro de la Lectura" por completar 50 ejercicios',
    'ACHIEVEMENT',
    ARRAY['IN_APP', 'PUSH'],
    jsonb_build_object(
        'achievement_id', achievement_id,
        'badge_name', 'Maestro de la Lectura',
        'xp_earned', 500,
        'ml_coins_earned', 100
    )
);
```

#### SYSTEM - Mantenimiento programado
```sql
SELECT send_notification(
    user_id,
    'Mantenimiento Programado',
    'El sistema estará en mantenimiento el Domingo 10am-12pm. Guarda tu progreso.',
    'SYSTEM',
    ARRAY['IN_APP', 'EMAIL'],
    jsonb_build_object(
        'maintenance_start', '2025-11-10 10:00:00',
        'maintenance_end', '2025-11-10 12:00:00',
        'affected_services', ['ejercicios', 'dashboard']
    )
);
```

#### ALERT - Advertencia importante
```sql
SELECT send_notification(
    parent_id,
    '⚠️ Actividad Inusual Detectada',
    'Se detectó un intento de inicio de sesión desde ubicación no reconocida',
    'ALERT',
    ARRAY['IN_APP', 'EMAIL', 'SMS'],
    jsonb_build_object(
        'ip_address', '123.45.67.89',
        'location', 'Ciudad desconocida',
        'timestamp', NOW()
    )
);
```

#### MESSAGE - Mensaje directo
```sql
SELECT send_notification(
    student_id,
    'Mensaje de tu Maestro',
    'Excelente trabajo en la última tarea. Sigue así!',
    'MESSAGE',
    ARRAY['IN_APP'],
    jsonb_build_object(
        'from_user_id', teacher_id,
        'from_name', 'Prof. García',
        'message_id', message_id
    )
);
```

**Notificación masiva (todos los estudiantes de un classroom):**
```sql
-- Notificar a todos los estudiantes de un classroom
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN
        SELECT student_id
        FROM social_features.classroom_members
        WHERE classroom_id = 'classroom-uuid'
    LOOP
        PERFORM send_notification(
            r.student_id,
            'Nuevo Anuncio del Classroom',
            'El maestro ha publicado un nuevo anuncio',
            'SYSTEM',
            ARRAY['IN_APP', 'EMAIL']
        );
    END LOOP;
END $$;
```

**Uso en backend:**
```typescript
// apps/backend/src/modules/notifications/notifications.service.ts

async notifyAssignmentCreated(
  studentId: string,
  assignment: Assignment,
  teacher: User
) {
  return await this.db.query(
    `SELECT public.send_notification($1, $2, $3, $4, $5, $6)`,
    [
      studentId,
      'Nueva Tarea Asignada',
      `${teacher.name} te ha asignado: ${assignment.title}`,
      'ASSIGNMENT',
      ['IN_APP', 'EMAIL'],
      JSON.stringify({
        assignment_id: assignment.id,
        teacher_name: teacher.name,
        due_date: assignment.dueDate
      })
    ]
  );
}
```

**Procesamiento de cola de entrega:**
```sql
-- Worker process que envía emails/SMS/push basado en queue
SELECT
    ndq.id,
    ndq.notification_id,
    ndq.delivery_channel,
    n.title,
    n.message,
    u.email,
    u.phone
FROM gamification_system.notification_delivery_queue ndq
JOIN gamification_system.notifications n ON ndq.notification_id = n.id
JOIN auth.users u ON n.user_id = u.id
WHERE ndq.status = 'PENDING'
  AND ndq.delivery_channel = 'EMAIL'
LIMIT 100;

-- Marcar como sent después de envío exitoso
UPDATE gamification_system.notification_delivery_queue
SET status = 'SENT', sent_at = NOW()
WHERE id = queue_item_id;
```

**Schemas afectados:**
- `gamification_system.notifications` (INSERT)
- `gamification_system.notification_delivery_queue` (INSERT)
- `audit_logging.system_logs` (INSERT - logging automático)

---

### Función: `validate_date_range()`

**Descripción completa:**
Validación robusta de rangos de fechas con múltiples reglas de negocio. Útil para prevenir errores de input antes de INSERT/UPDATE.

**Parámetros:**
| Parámetro | Tipo | Default | Descripción |
|-----------|------|---------|-------------|
| `p_start_date` | TIMESTAMP | - | Fecha de inicio |
| `p_end_date` | TIMESTAMP | - | Fecha de fin |
| `p_max_range_days` | INTEGER | 365 | Duración máxima permitida |

**Retorno:**
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `is_valid` | BOOLEAN | TRUE si válido |
| `validation_message` | TEXT | Mensaje descriptivo |
| `days_in_range` | INTEGER | Días en el rango |

**Casos de validación:**

#### Caso 1: Rango válido
```sql
SELECT * FROM public.validate_date_range(
    '2025-11-01 00:00:00',
    '2025-11-30 23:59:59',
    365
);

-- Resultado:
-- is_valid | validation_message      | days_in_range
-- ---------+-------------------------+---------------
-- TRUE     | Date range is valid     | 29
```

#### Caso 2: Start date después de end date
```sql
SELECT * FROM public.validate_date_range(
    '2025-12-31 00:00:00',
    '2025-01-01 00:00:00',
    365
);

-- Resultado:
-- is_valid | validation_message                                   | days_in_range
-- ---------+------------------------------------------------------+---------------
-- FALSE    | Start date cannot be after end date                 | 0
```

#### Caso 3: Rango excede duración máxima
```sql
SELECT * FROM public.validate_date_range(
    '2025-01-01 00:00:00',
    '2026-12-31 00:00:00',
    365  -- Máximo 1 año
);

-- Resultado:
-- is_valid | validation_message                            | days_in_range
-- ---------+-----------------------------------------------+---------------
-- FALSE    | Date range exceeds maximum allowed duration   | 729
```

#### Caso 4: Rango en el futuro (válido para scheduling)
```sql
SELECT * FROM public.validate_date_range(
    NOW() + INTERVAL '1 day',
    NOW() + INTERVAL '7 days',
    30
);

-- Resultado:
-- is_valid | validation_message                           | days_in_range
-- ---------+----------------------------------------------+---------------
-- TRUE     | Date range is in the future (valid for...)  | 6
```

**Uso en triggers:**
```sql
-- Trigger para validar assignments antes de INSERT
CREATE OR REPLACE FUNCTION validate_assignment_dates()
RETURNS TRIGGER AS $$
DECLARE
    v_validation RECORD;
BEGIN
    IF NEW.due_date IS NOT NULL THEN
        SELECT * INTO v_validation
        FROM public.validate_date_range(
            NEW.created_at,
            NEW.due_date,
            180  -- Máximo 6 meses para un assignment
        );

        IF NOT v_validation.is_valid THEN
            RAISE EXCEPTION 'Invalid assignment dates: %', v_validation.validation_message;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_assignment_dates_trigger
    BEFORE INSERT OR UPDATE ON public.assignments
    FOR EACH ROW
    EXECUTE FUNCTION validate_assignment_dates();
```

**Uso en backend:**
```typescript
// apps/backend/src/common/validators/date-range.validator.ts

async validateDateRange(
  startDate: Date,
  endDate: Date,
  maxDays: number = 365
): Promise<{ isValid: boolean; message: string; days: number }> {
  const result = await this.db.query(
    `SELECT * FROM public.validate_date_range($1, $2, $3)`,
    [startDate, endDate, maxDays]
  );

  const row = result.rows[0];
  return {
    isValid: row.is_valid,
    message: row.validation_message,
    days: row.days_in_range
  };
}

// Uso en service
async createAssignment(dto: CreateAssignmentDto) {
  const validation = await this.dateValidator.validateDateRange(
    new Date(),
    dto.dueDate,
    180  // 6 meses máximo
  );

  if (!validation.isValid) {
    throw new BadRequestException(validation.message);
  }

  // Continuar con creación...
}
```

**Schemas utilizados:**
- Ninguno (función pura de validación)

---

## 🔗 Diagrama de Dependencias

```
┌─────────────────────────────────────────────────────────────────┐
│                  Funciones Utilitarias Public                    │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────────────┐
│  MANTENIMIENTO (2)       │
├──────────────────────────┤
│ cleanup_old_system_logs  │────► audit_logging.system_logs
│                          │       (DELETE + VACUUM)
│ cleanup_old_user_activity│────► audit_logging.user_activity_logs
└──────────────────────────┘       (DELETE + VACUUM)


┌──────────────────────────┐
│  FEATURE MANAGEMENT (2)  │
├──────────────────────────┤
│ is_feature_enabled       │────► system_configuration.feature_flags (READ)
│                          │────► auth_management.user_roles (READ)
│                          │
│ update_feature_flag      │────► system_configuration.feature_flags (UPSERT)
│                          │────► log_system_event() (CALL)
└──────────────────────────┘


┌──────────────────────────┐
│  LOGGING/NOTIF (2)       │
├──────────────────────────┤
│ log_system_event         │────► audit_logging.system_logs (INSERT)
│                          │
│ send_notification        │────► gamification_system.notifications (INSERT)
│                          │────► gamification_system.notification_delivery_queue (INSERT)
│                          │────► log_system_event() (CALL)
└──────────────────────────┘


┌──────────────────────────┐
│  VALIDACIÓN (1)          │
├──────────────────────────┤
│ validate_date_range      │       (Función pura, sin dependencias)
└──────────────────────────┘


DEPENDENCIAS ENTRE FUNCIONES:
- update_feature_flag() → log_system_event()
- send_notification() → log_system_event()
```

---

## 🎯 Mejores Prácticas

### 1. Mantenimiento y Limpieza

**✅ DO:**
- Ejecutar cleanup functions en horarios de bajo tráfico (madrugada)
- Usar cron jobs/pg_cron para automatización
- Monitorear espacio recuperado después de VACUUM
- Documentar políticas de retención

**❌ DON'T:**
- Ejecutar durante horario pico (afecta performance)
- Usar retención muy corta (< 30 días) sin justificación legal
- Ignorar errores de cleanup (pueden indicar problemas mayores)

**Ejemplo de política de retención:**
```yaml
audit_logging.system_logs:
  retention_days: 90
  cleanup_frequency: weekly
  cleanup_schedule: "Sunday 3:00 AM"

audit_logging.user_activity_logs:
  retention_days: 180
  cleanup_frequency: monthly
  cleanup_schedule: "1st day of month 4:00 AM"
  legal_minimum: 90  # GDPR compliance
```

---

### 2. Feature Flags

**✅ DO:**
- Usar naming convention consistente: `feature_name` (snake_case)
- Documentar propósito en campo `description`
- Gradual rollout: 10% → 50% → 100% con monitoring entre fases
- Mantener feature flags temporales (remover después de full rollout)
- Logging de cambios de feature flags

**❌ DON'T:**
- Crear feature flags permanentes (usar configuración normal)
- Cambiar rollout_percentage drásticamente (10% → 100%)
- Olvidar remover flags después de rollout completo
- Usar para configuración de sistema (usar system_settings)

**Lifecycle de feature flag:**
```
1. CREATE → rollout_percentage: 0, is_enabled: FALSE
2. BETA → rollout_percentage: 0, target_users: [beta_testers]
3. GRADUAL_10 → rollout_percentage: 10, is_enabled: TRUE
4. GRADUAL_50 → rollout_percentage: 50 (1 semana después)
5. FULL_ROLLOUT → rollout_percentage: 100 (1 semana después)
6. DEPRECATE → Remover flag del código
7. DELETE → Eliminar de BD (1 mes después)
```

---

### 3. Logging y Notificaciones

**✅ DO:**
- Usar severidad apropiada (no todo es ERROR)
- Incluir context útil en JSONB metadata
- Estructurar metadata consistentemente
- Rate limiting para notificaciones (evitar spam)
- Respetar preferencias de usuario (canales opt-out)

**❌ DON'T:**
- Log de información sensible (passwords, tokens)
- Notificaciones sin opción de desactivar
- Metadata excesivamente grande (> 5KB)
- Logging síncrono que bloquea requests

**Estructura recomendada de metadata:**
```json
{
  "user_id": "uuid",
  "request_id": "uuid",
  "ip_address": "xxx.xxx.xxx.xxx",
  "user_agent": "string",
  "action": "specific_action",
  "resource_type": "assignment|exercise|user",
  "resource_id": "uuid",
  "timestamp": "ISO8601",
  "duration_ms": 123
}
```

---

### 4. Validación de Fechas

**✅ DO:**
- Validar ANTES de INSERT/UPDATE (prevención)
- Usar en triggers para validación automática
- Configurar max_range_days según contexto
- Proporcionar mensajes de error claros al usuario

**❌ DON'T:**
- Validar solo en frontend (inseguro)
- Asumir timezone sin normalizar
- Ignorar edge cases (DST, leap years)

**Max range por contexto:**
```yaml
assignments:
  max_range_days: 180  # 6 meses máximo

feature_flags_time_window:
  max_range_days: 365  # 1 año para campañas

reports:
  max_range_days: 730  # 2 años para análisis histórico

maintenance_windows:
  max_range_days: 7  # 1 semana máximo
```

---

## 🔒 Consideraciones de Seguridad

### SECURITY DEFINER

**Todas las funciones usan `SECURITY DEFINER`:**
- Ejecutan con permisos del creador (generalmente superuser)
- **Riesgo:** Privilege escalation si no se validan inputs
- **Mitigación:** Validación estricta + `SET search_path`

**Validaciones implementadas:**
- ✅ `is_feature_enabled`: Validación de feature_key (text)
- ✅ `log_system_event`: Validación de severity (enum check)
- ✅ `send_notification`: Validación de notification_type (enum check)
- ✅ `validate_date_range`: Validación de rangos
- ✅ `update_feature_flag`: Validación de rollout_percentage (0-100)

---

### SET search_path

**Todas las funciones especifican `search_path` explícito:**
```sql
SECURITY DEFINER SET search_path = public, audit_logging
```

**Propósito:**
- Prevenir SQL injection via search_path manipulation
- Garantizar resolución correcta de schemas
- Evitar uso de schemas maliciosos

---

### Manejo de Errores

**Todas las funciones tienen bloque EXCEPTION:**
```sql
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error: %', SQLERRM;
    RETURN FALSE/NULL/0;
END;
```

**Beneficios:**
- Fail-safe (no crash, retorna valor seguro)
- Logging de errores
- Prevención de information leakage

---

## ⚡ Performance y Optimización

### Cleanup Functions

**Impacto:**
- DELETE masivo puede bloquear tabla
- VACUUM reconstruye índices

**Optimizaciones:**
- ✅ Ejecutar fuera de horario pico
- ✅ VACUUM ANALYZE automático (recupera espacio)
- ✅ WHERE con índice en created_at
- 🔄 Considerar: DELETE en batches para tablas muy grandes

**Ejemplo de batch delete:**
```sql
-- Versión optimizada para tablas gigantes (> 10M registros)
CREATE OR REPLACE FUNCTION cleanup_old_system_logs_batched(
    p_retention_days INTEGER DEFAULT 90,
    p_batch_size INTEGER DEFAULT 10000
)
RETURNS TABLE(deleted_count INTEGER, status_message TEXT) AS $$
DECLARE
    v_total_deleted INTEGER := 0;
    v_batch_deleted INTEGER;
    v_cutoff_date TIMESTAMP;
BEGIN
    v_cutoff_date := NOW() - (p_retention_days || ' days')::INTERVAL;

    LOOP
        DELETE FROM audit_logging.system_logs
        WHERE id IN (
            SELECT id FROM audit_logging.system_logs
            WHERE created_at < v_cutoff_date
            LIMIT p_batch_size
        );

        GET DIAGNOSTICS v_batch_deleted = ROW_COUNT;
        v_total_deleted := v_total_deleted + v_batch_deleted;

        EXIT WHEN v_batch_deleted = 0;

        -- Breathe between batches
        PERFORM pg_sleep(0.1);
    END LOOP;

    VACUUM ANALYZE audit_logging.system_logs;

    RETURN QUERY SELECT v_total_deleted, FORMAT('Deleted %L records in batches', v_total_deleted);
END;
$$ LANGUAGE plpgsql;
```

---

### Feature Flags

**Optimizaciones:**
- ✅ Índice en `feature_key` (PK)
- ✅ Índice en `is_enabled` (filtering)
- ✅ `STABLE` function (cacheable dentro de transaction)
- 🔄 Considerar: Cache en Redis para high-traffic features

**Cache pattern:**
```typescript
// Cache feature flags en Redis (TTL: 5 minutos)
async isFeatureEnabled(key: string, userId?: string): Promise<boolean> {
  const cacheKey = userId ? `ff:${key}:${userId}` : `ff:${key}`;

  // Check cache
  const cached = await this.redis.get(cacheKey);
  if (cached !== null) {
    return cached === '1';
  }

  // Query DB
  const result = await this.db.query(
    `SELECT public.is_feature_enabled($1, $2)`,
    [key, userId]
  );

  const enabled = result.rows[0].is_feature_enabled;

  // Cache result (TTL: 5 min)
  await this.redis.setex(cacheKey, 300, enabled ? '1' : '0');

  return enabled;
}
```

---

### Logging Functions

**Consideraciones:**
- INSERT síncrono puede ser lento bajo carga
- Metadata JSONB flexible pero puede crecer

**Optimizaciones:**
- 🔄 Considerar: Queue asíncrona (RabbitMQ/Redis)
- 🔄 Considerar: Partitioning de system_logs por fecha
- ✅ Índice GIN en event_data JSONB
- ✅ Limitar tamaño de metadata (< 5KB)

---

## 📝 Resumen de Uso

| Función | Frecuencia de Uso | Performance | Uso Recomendado |
|---------|-------------------|-------------|-----------------|
| `cleanup_old_system_logs` | Semanal (cron) | Media | Automatizado |
| `cleanup_old_user_activity` | Mensual (cron) | Media | Automatizado |
| `is_feature_enabled` | Alta (cada request) | Alta | Con cache |
| `update_feature_flag` | Baja (admin) | Alta | Manual/Dashboard |
| `log_system_event` | Muy Alta | Media | Async queue |
| `send_notification` | Alta | Media | Async queue |
| `validate_date_range` | Media | Muy Alta | Triggers/Validación |

---

## 🎯 Próximos Pasos Sugeridos

### Corto Plazo
1. ✅ Implementar cron jobs para cleanup functions
2. ✅ Crear dashboard admin para feature flags
3. ✅ Implementar cache Redis para feature flags hot paths
4. ✅ Configurar alerting para eventos CRITICAL

### Mediano Plazo
1. 📋 Migrar logging a queue asíncrona (performance)
2. 📋 Implementar partitioning en system_logs por fecha
3. 📋 Crear índices adicionales en notification_delivery_queue
4. 📋 Implementar retry logic para failed notifications

### Largo Plazo
1. 🔮 Considerar sistema de observability externo (Datadog, New Relic)
2. 🔮 Implementar real-time feature flag updates (WebSockets)
3. 🔮 A/B testing framework completo con métricas
4. 🔮 Machine learning para rollout percentage optimization

---

## 🔗 Referencias

**Archivos de implementación:**
- `apps/database/ddl/schemas/public/functions/01-cleanup_old_system_logs.sql`
- `apps/database/ddl/schemas/public/functions/02-cleanup_old_user_activity.sql`
- `apps/database/ddl/schemas/public/functions/03-is_feature_enabled.sql`
- `apps/database/ddl/schemas/public/functions/04-log_system_event.sql`
- `apps/database/ddl/schemas/public/functions/05-send_notification.sql`
- `apps/database/ddl/schemas/public/functions/06-update_feature_flag.sql`
- `apps/database/ddl/schemas/public/functions/07-validate_date_range.sql`

**Schemas relacionados:**
- `audit_logging` (system_logs, user_activity_logs)
- `system_configuration` (feature_flags)
- `gamification_system` (notifications, notification_delivery_queue)
- `auth_management` (user_roles)

**Documentación relacionada:**
- RF-SYS-001: Sistema de Configuración Global
- RF-SYS-002: Sistema de Feature Flags
- RF-AUD-001: Sistema de Auditoría

---

**Creado:** 2025-11-08
**Tipo:** Documentación retroactiva
**Estado:** ✅ Documentación completa de 7 funciones utilitarias
**Issue:** ISSUE-007 (Resuelto)
