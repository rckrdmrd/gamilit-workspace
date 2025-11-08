# Mapa de Funciones SQL - Schema PUBLIC

**Propósito:** Catalogar todas las funciones SQL del schema public
**Responsabilidad:** SA-DB-031
**Última actualización:** 2025-11-02
**Total de funciones:** 7

---

## Estructura de Archivos

```
public/functions/
├── 01-cleanup_old_system_logs.sql
├── 02-cleanup_old_user_activity.sql
├── 03-is_feature_enabled.sql
├── 04-log_system_event.sql
├── 05-send_notification.sql
├── 06-update_feature_flag.sql
├── 07-validate_date_range.sql
└── _MAP.md (este archivo)
```

---

## Catálogo de Funciones

### 1. cleanup_old_system_logs
**Archivo:** `01-cleanup_old_system_logs.sql`
**Tipo:** Stored Procedure (Maintenance)
**Prioridad:** P2
**Descripción:** Elimina registros de logs del sistema que son más antiguos que el período de retención especificado.

**Firma:**
```sql
cleanup_old_system_logs(p_retention_days INTEGER DEFAULT 90)
RETURNS TABLE(deleted_count INTEGER, status_message TEXT)
```

**Parámetros:**
- `p_retention_days`: Número de días a retener (default: 90)

**Retorno:**
- `deleted_count`: Cantidad de registros eliminados
- `status_message`: Mensaje de estado de la operación

**Casos de uso:**
- Mantenimiento periódico de la base de datos
- Limpieza de logs antiguos para optimizar almacenamiento
- Cron jobs de limpieza automática

**Seguridad:** `SECURITY DEFINER`

---

### 2. cleanup_old_user_activity
**Archivo:** `02-cleanup_old_user_activity.sql`
**Tipo:** Stored Procedure (Maintenance)
**Prioridad:** P2
**Descripción:** Elimina registros de actividad de usuarios que son más antiguos que el período de retención especificado.

**Firma:**
```sql
cleanup_old_user_activity(p_retention_days INTEGER DEFAULT 180)
RETURNS TABLE(deleted_count INTEGER, status_message TEXT)
```

**Parámetros:**
- `p_retention_days`: Número de días a retener (default: 180)

**Retorno:**
- `deleted_count`: Cantidad de registros eliminados
- `status_message`: Mensaje de estado de la operación

**Casos de uso:**
- Limpieza de auditoría de actividad de usuarios
- Cumplimiento de políticas de retención de datos
- Optimización de rendimiento de base de datos

**Seguridad:** `SECURITY DEFINER`

---

### 3. is_feature_enabled
**Archivo:** `03-is_feature_enabled.sql`
**Tipo:** Query Function (Stable)
**Prioridad:** P2
**Descripción:** Verifica si un feature flag está habilitado globalmente o para un usuario específico.

**Firma:**
```sql
is_feature_enabled(p_feature_key TEXT, p_user_id UUID DEFAULT NULL)
RETURNS BOOLEAN
```

**Parámetros:**
- `p_feature_key`: Clave única del feature flag (ej: 'new_dashboard')
- `p_user_id`: ID opcional del usuario para override específico

**Retorno:**
- `BOOLEAN`: TRUE si está habilitado, FALSE en caso contrario

**Casos de uso:**
- Feature flag checks en aplicación backend
- A/B testing y gradual rollout
- Control de features en desarrollo
- Conditional logic basada en features

**Ejemplos:**
```sql
-- Check global feature status
SELECT is_feature_enabled('new_dashboard'::TEXT);

-- Check user-specific feature
SELECT is_feature_enabled('beta_feature'::TEXT, user_id);
```

**Seguridad:** `SECURITY DEFINER`, `STABLE`

---

### 4. log_system_event
**Archivo:** `04-log_system_event.sql`
**Tipo:** Function with Side Effects
**Prioridad:** P2
**Descripción:** Registra eventos del sistema para auditoría y propósitos de monitoreo.

**Firma:**
```sql
log_system_event(
    p_event_type TEXT,
    p_event_source TEXT,
    p_event_data JSONB DEFAULT NULL,
    p_severity TEXT DEFAULT 'INFO'
)
RETURNS UUID
```

**Parámetros:**
- `p_event_type`: Tipo de evento (ej: 'DATABASE_BACKUP_START')
- `p_event_source`: Sistema o componente origen
- `p_event_data`: Datos JSONB opcionales del evento
- `p_severity`: Nivel de severidad (DEBUG, INFO, WARNING, ERROR, CRITICAL)

**Retorno:**
- `UUID`: ID del evento registrado, o NULL en caso de error

**Casos de uso:**
- Auditoría de eventos del sistema
- Logging de errores y alertas
- Trazabilidad de operaciones críticas
- Monitoreo de integridad del sistema

**Niveles de severidad:**
- `DEBUG`: Información de depuración detallada
- `INFO`: Información general de operaciones
- `WARNING`: Advertencias que requieren atención
- `ERROR`: Errores que requieren investigación
- `CRITICAL`: Errores críticos que afectan operación

**Seguridad:** `SECURITY DEFINER`

---

### 5. send_notification
**Archivo:** `05-send_notification.sql`
**Tipo:** Function with Side Effects
**Prioridad:** P2
**Descripción:** Envía notificaciones a usuarios a través de múltiples canales de entrega.

**Firma:**
```sql
send_notification(
    p_user_id UUID,
    p_title TEXT,
    p_message TEXT,
    p_notification_type TEXT,
    p_delivery_channels TEXT[] DEFAULT ARRAY['IN_APP'],
    p_metadata JSONB DEFAULT NULL
)
RETURNS UUID
```

**Parámetros:**
- `p_user_id`: ID del usuario destinatario
- `p_title`: Título/asunto de la notificación
- `p_message`: Cuerpo del mensaje
- `p_notification_type`: Tipo (ASSIGNMENT, ACHIEVEMENT, SYSTEM, ALERT, MESSAGE)
- `p_delivery_channels`: Array de canales (IN_APP, EMAIL, SMS, PUSH)
- `p_metadata`: Datos JSONB opcionales de contexto

**Retorno:**
- `UUID`: ID de la notificación creada, o NULL en error

**Tipos de notificación:**
- `ASSIGNMENT`: Notificaciones de tareas/asignaciones
- `ACHIEVEMENT`: Notificaciones de logros
- `SYSTEM`: Notificaciones del sistema
- `ALERT`: Alertas y avisos
- `MESSAGE`: Mensajes directos entre usuarios

**Canales de entrega:**
- `IN_APP`: Notificación dentro de la aplicación
- `EMAIL`: Envío por correo electrónico
- `SMS`: Envío por mensaje de texto
- `PUSH`: Notificación push móvil

**Casos de uso:**
- Notificación de nuevas tareas
- Confirmación de logros alcanzados
- Alertas de sistema críticas
- Comunicación con usuarios

**Seguridad:** `SECURITY DEFINER`

---

### 6. update_feature_flag
**Archivo:** `06-update_feature_flag.sql`
**Tipo:** Function with Side Effects
**Prioridad:** P2
**Descripción:** Actualiza el estado de feature flags y gestiona configuraciones de rollout.

**Firma:**
```sql
update_feature_flag(
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

**Parámetros:**
- `p_feature_key`: Clave única del feature
- `p_enabled`: Si está habilitado globalmente
- `p_rollout_percentage`: Porcentaje de usuarios que ven el feature (0-100)
- `p_description`: Descripción opcional del feature

**Retorno:**
- `feature_id`: UUID del feature flag
- `key`: Clave del feature
- `enabled`: Estado actual
- `rollout_percentage`: Porcentaje de rollout
- `status_message`: Mensaje del resultado

**Validaciones:**
- El porcentaje de rollout debe estar entre 0 y 100
- Crea el feature si no existe (INSERT)
- Actualiza si ya existe (UPDATE)

**Casos de uso:**
- Gradual rollout de nuevas features
- Control A/B testing
- Feature flag management desde aplicación
- Rollback rápido de features

**Rollout gradual:**
```sql
-- Habilitar para 25% de usuarios
SELECT update_feature_flag('new_ui'::TEXT, TRUE, 25);

-- Incrementar a 50%
SELECT update_feature_flag('new_ui'::TEXT, TRUE, 50);

-- Full rollout
SELECT update_feature_flag('new_ui'::TEXT, TRUE, 100);
```

**Seguridad:** `SECURITY DEFINER`

---

### 7. validate_date_range
**Archivo:** `07-validate_date_range.sql`
**Tipo:** Query Function (Stable)
**Prioridad:** P2
**Descripción:** Valida que los rangos de fechas sean lógicamente correctos y razonables.

**Firma:**
```sql
validate_date_range(
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

**Parámetros:**
- `p_start_date`: Fecha/hora de inicio del rango
- `p_end_date`: Fecha/hora de fin del rango
- `p_max_range_days`: Máximo permitido (default: 365)

**Retorno:**
- `is_valid`: TRUE si es válido, FALSE si no
- `validation_message`: Descripción del resultado
- `days_in_range`: Cantidad de días en el rango

**Reglas de validación:**
1. Ninguna fecha puede ser NULL
2. Fecha de inicio debe ser <= fecha de fin
3. Rango no puede exceder p_max_range_days
4. El rango puede estar en el futuro (para programación)

**Casos de uso:**
- Validación de períodos de tareas
- Validación de rangos de reportes
- Comprobación de fechas de eventos
- Validación de períodos de suscripción

**Ejemplos:**
```sql
-- Validar período anual
SELECT validate_date_range(
    '2025-01-01 00:00:00'::TIMESTAMP,
    '2025-12-31 23:59:59'::TIMESTAMP,
    365
);

-- Validar próximos 30 días
SELECT validate_date_range(
    NOW(),
    NOW() + INTERVAL '30 days',
    30
);
```

**Seguridad:** `SECURITY DEFINER`, `STABLE`

---

## Gestión de Dependencias

### Schemas Relacionados
- `audit_logging`: Tablas de logs (system_logs, user_activity_log)
- `system_configuration`: Tablas de configuración (feature_flags, user_feature_flags)
- `social_features`: Tablas de notificaciones (notifications, notification_delivery_queue)
- `educational_content`: Tablas de contenido educativo
- `progress_tracking`: Tablas de progreso

### Permisos Requeridos
Todas las funciones utilizan `SECURITY DEFINER` y requieren:
- CREATE FUNCTION privilege en schema public
- Acceso a tablas de los schemas relacionados
- Ejecución por roles con permisos administrativos

---

## Estadísticas de Implementación

| Métrica | Valor |
|---------|-------|
| Total de funciones | 7 |
| Funciones de mantenimiento | 2 |
| Funciones de negocio | 3 |
| Funciones de validación | 2 |
| Funciones estables | 2 |
| Funciones con side effects | 5 |
| Archivos SQL | 7 |
| Líneas de código totales | ~450 |

---

## Instrucciones de Deployment

### Prerequisitos
- PostgreSQL 12+ (compatibility: 10+)
- Schemas dependientes deben existir previamente
- Tablas relacionadas deben estar creadas

### Ejecución Individual
```bash
# Copiar archivo a servidor
scp 01-cleanup_old_system_logs.sql user@host:/tmp/

# Ejecutar con psql
psql -U postgres -d gamilit_platform < 01-cleanup_old_system_logs.sql
```

### Ejecución en Lote
```bash
# Ejecutar todas las funciones en orden
for file in *.sql; do
    echo "Ejecutando $file..."
    psql -U postgres -d gamilit_platform < "$file"
done
```

### Verificación Post-Deployment
```sql
-- Listar todas las funciones creadas
SELECT
    routine_schema,
    routine_name,
    routine_type,
    data_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name LIKE '%_cleanup%'
     OR routine_name LIKE '%feature%'
     OR routine_name LIKE '%notification%'
     OR routine_name LIKE '%event%'
     OR routine_name LIKE '%validate%'
ORDER BY routine_name;

-- Verificar función específica
\df+ public.is_feature_enabled

-- Probar función
SELECT is_feature_enabled('test_feature'::TEXT);
```

---

## Documentación Relacionada

- **Schema PUBLIC**: `/schemas/public/README.md`
- **Índices del PUBLIC**: `/schemas/public/indexes/_MAP.md`
- **Tablas del PUBLIC**: `/schemas/public/tables/_MAP.md`
- **Vistas del PUBLIC**: `/schemas/public/views/_MAP.md`
- **Directrices Database**: `.claude/directivas/DIRECTIVAS-DATABASE.md`

---

## Notas de Implementación

### Consideraciones de Seguridad
1. Todas las funciones usan `SECURITY DEFINER` para operaciones privilegiadas
2. Validación de inputs en funciones de fecha (range checking)
3. Manejo de excepciones en todas las funciones
4. Logging de eventos críticos

### Optimizaciones
1. `cleanup_*` functions incluyen VACUUM ANALYZE automático
2. `is_feature_enabled` es STABLE para mejor cacheo
3. `validate_date_range` es STABLE y no modifica datos
4. Índices recomendados en tablas relacionadas

### Limitaciones Conocidas
1. Vista `for` es un placeholder (nombre poco claro) - verificar caso de uso
2. Funciones de cleanup no tienen restricción de tiempo de ejecución
3. Canales de notificación requieren configuración externa

---

**Creado:** 2025-11-02
**Responsabilidad:** SA-DB-031
**Estado:** Implementado
**Versión:** 1.0
