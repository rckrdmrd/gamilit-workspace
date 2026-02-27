# Schema 16: audit_logging (7 tablas, 14+ RLS policies)

> **Nota:** Este documento describe el modelo conceptual. Para definiciones DDL exactas, consultar `apps/database/ddl/schemas/`.

> Parte de [Schema Reference](_INDEX.md) - GAMILIT

---

> **[DEPRECATED]** This section describes an early conceptual model that was never implemented as described.
> The DDL-accurate documentation appears in the updated sections below.
> **Note:** The DDL schema is `audit_logging`, not `audit`. The `audit.*` prefix below is legacy.

### audit.audit_logs [NO DDL — conceptual only]
Registro de acciones criticas del sistema.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | uuid_generate_v4() | PK |
| tenant_id | UUID | NOT NULL | - | FK tenants.tenants |
| user_id | UUID | NOT NULL | - | FK auth.users |
| action | audit_action | NOT NULL | - | create, update, delete, login, logout |
| entity_type | VARCHAR(100) | NOT NULL | - | Tipo de entidad |
| entity_id | UUID | NULL | NULL | ID de la entidad |
| old_values | JSONB | NULL | NULL | Valores anteriores |
| new_values | JSONB | NULL | NULL | Valores nuevos |
| ip_address | INET | NULL | NULL | IP |
| user_agent | TEXT | NULL | NULL | User agent |
| metadata | JSONB | NULL | '{}' | Metadatos adicionales |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() | - |

**Indices:** `idx_audit_entity`, `idx_audit_user_date`

---

### audit.data_changes [NO DDL — conceptual only]
Historial detallado de cambios en datos.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | uuid_generate_v4() | PK |
| tenant_id | UUID | NOT NULL | - | FK tenants.tenants |
| table_name | VARCHAR(100) | NOT NULL | - | Tabla afectada |
| record_id | UUID | NOT NULL | - | ID del registro |
| operation | VARCHAR(10) | NOT NULL | - | INSERT, UPDATE, DELETE |
| changed_by | UUID | NULL | NULL | FK auth.users |
| old_data | JSONB | NULL | NULL | Datos anteriores |
| new_data | JSONB | NULL | NULL | Datos nuevos |
| changed_columns | TEXT[] | NULL | NULL | Columnas modificadas |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() | - |

---

### audit.access_logs [NO DDL — conceptual only]
Registro de acceso al sistema.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | uuid_generate_v4() | PK |
| tenant_id | UUID | NULL | NULL | FK tenants.tenants |
| user_id | UUID | NULL | NULL | FK auth.users |
| endpoint | VARCHAR(500) | NOT NULL | - | Endpoint accedido |
| method | VARCHAR(10) | NOT NULL | - | HTTP method |
| status_code | INTEGER | NOT NULL | - | Codigo de respuesta |
| response_time_ms | INTEGER | NOT NULL | - | Tiempo de respuesta |
| ip_address | INET | NOT NULL | - | IP |
| user_agent | TEXT | NULL | NULL | User agent |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() | - |

---

## Tablas audit_logging (DDL fisica)

> Las siguientes tablas son la implementacion DDL real del schema `audit_logging`. Las tablas anteriores son documentacion conceptual del dominio.

---

### audit_logging.audit_logs
Registro de auditoria completo de todas las acciones del sistema (DDL real).

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | gen_random_uuid() | PK |
| tenant_id | UUID | NULL | NULL | FK auth_management.tenants |
| event_type | TEXT | NOT NULL | - | Tipo de evento (user_login, module_created, achievement_earned, etc.) |
| action | TEXT | NOT NULL | - | Accion realizada (create, read, update, delete) |
| resource_type | TEXT | NULL | NULL | Tipo de recurso afectado |
| resource_id | UUID | NULL | NULL | ID del recurso afectado |
| actor_id | UUID | NULL | NULL | FK auth_management.profiles (quien realizo la accion) |
| actor_type | TEXT | NULL | 'user' | Tipo de actor: user, system, api, cron |
| actor_ip | INET | NULL | NULL | IP del actor |
| actor_user_agent | TEXT | NULL | NULL | User agent del cliente |
| target_id | UUID | NULL | NULL | ID del objetivo de la accion |
| target_type | TEXT | NULL | NULL | Tipo del objetivo |
| session_id | TEXT | NULL | NULL | ID de la sesion |
| description | TEXT | NULL | NULL | Descripcion textual |
| old_values | JSONB | NULL | '{}' | Valores anteriores |
| new_values | JSONB | NULL | '{}' | Valores nuevos |
| changes | JSONB | NULL | '{}' | Cambios realizados |
| severity | TEXT | NULL | 'info' | Severidad: debug, info, warning, error, critical |
| status | TEXT | NULL | 'success' | Estado: success, failure, partial |
| error_code | TEXT | NULL | NULL | Codigo de error si aplica |
| error_message | TEXT | NULL | NULL | Mensaje de error si aplica |
| stack_trace | TEXT | NULL | NULL | Stack trace del error |
| request_id | TEXT | NULL | NULL | ID de la peticion HTTP |
| correlation_id | TEXT | NULL | NULL | ID de correlacion entre servicios |
| additional_data | JSONB | NULL | '{}' | Datos adicionales |
| tags | TEXT[] | NULL | NULL | Tags para categorizacion |
| created_at | TIMESTAMPTZ | NULL | gamilit.now_mexico() | - |

**Primary Key:** id
**Foreign Keys:** actor_id → auth_management.profiles, tenant_id → auth_management.tenants ON DELETE CASCADE
**Checks:** actor_type IN ('user','system','api','cron'), severity IN ('debug','info','warning','error','critical'), status IN ('success','failure','partial')
**Indices:** `idx_audit_logs_actor`, `idx_audit_logs_correlation` (parcial), `idx_audit_logs_created` (DESC), `idx_audit_logs_event_type`, `idx_audit_logs_resource`, `idx_audit_logs_severity` (parcial: ERROR/CRITICAL), `idx_audit_logs_tenant`
**RLS:** habilitado (own + admin)

---

### audit_logging.performance_metrics
Metricas de rendimiento del sistema (contadores, gauges, histogramas, timers).

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | gen_random_uuid() | PK |
| tenant_id | UUID | NULL | NULL | FK auth_management.tenants |
| metric_name | TEXT | NOT NULL | - | Nombre de la metrica |
| metric_type | TEXT | NOT NULL | - | Tipo: counter, gauge, histogram, timer |
| category | TEXT | NULL | NULL | Categoria (performance, business, system, etc.) |
| metric_value | NUMERIC | NOT NULL | - | Valor numerico de la metrica |
| unit | TEXT | NULL | NULL | Unidad de medida (ms, bytes, count, etc.) |
| endpoint | TEXT | NULL | NULL | Endpoint API relacionado |
| operation | TEXT | NULL | NULL | Operacion relacionada |
| module_name | TEXT | NULL | NULL | Nombre del modulo |
| function_name | TEXT | NULL | NULL | Nombre de la funcion |
| request_id | TEXT | NULL | NULL | ID de la peticion HTTP |
| session_id | TEXT | NULL | NULL | ID de la sesion |
| user_id | UUID | NULL | NULL | FK auth_management.profiles |
| dimensions | JSONB | NULL | '{}' | Dimensiones adicionales (JSONB) |
| tags | TEXT[] | NULL | NULL | Tags para categorizacion |
| measured_at | TIMESTAMPTZ | NULL | gamilit.now_mexico() | Fecha y hora de la medicion |
| created_at | TIMESTAMPTZ | NULL | gamilit.now_mexico() | - |

**Primary Key:** id
**Foreign Keys:** tenant_id → auth_management.tenants ON DELETE CASCADE, user_id → auth_management.profiles
**Check:** metric_type IN ('counter','gauge','histogram','timer')
**Indices:** `idx_perf_metrics_category`, `idx_perf_metrics_dimensions` (GIN), `idx_perf_metrics_measured` (DESC), `idx_perf_metrics_name`, `idx_perf_metrics_type`
**RLS:** habilitado (own + admin)

---

### audit_logging.system_alerts
Alertas del sistema sobre rendimiento, seguridad y errores.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | gen_random_uuid() | PK |
| tenant_id | UUID | NULL | NULL | FK auth_management.tenants |
| alert_type | TEXT | NOT NULL | - | Tipo: performance_degradation, high_error_rate, security_breach, resource_limit, service_outage, data_anomaly |
| severity | TEXT | NOT NULL | - | Severidad: low, medium, high, critical |
| title | TEXT | NOT NULL | - | Titulo de la alerta |
| description | TEXT | NULL | NULL | Descripcion detallada |
| source_system | TEXT | NULL | NULL | Sistema origen |
| source_module | TEXT | NULL | NULL | Modulo origen |
| error_code | TEXT | NULL | NULL | Codigo de error asociado |
| affected_users | INTEGER | NULL | 0 | Numero de usuarios afectados |
| status | TEXT | NULL | 'open' | Estado: open, acknowledged, resolved, suppressed |
| acknowledgment_note | TEXT | NULL | NULL | Nota de reconocimiento |
| resolution_note | TEXT | NULL | NULL | Nota de resolucion |
| acknowledged_by | UUID | NULL | NULL | FK auth_management.profiles |
| acknowledged_at | TIMESTAMPTZ | NULL | NULL | Fecha de reconocimiento |
| resolved_by | UUID | NULL | NULL | FK auth_management.profiles |
| resolved_at | TIMESTAMPTZ | NULL | NULL | Fecha de resolucion |
| notification_sent | BOOLEAN | NULL | false | Si se envio notificacion |
| escalation_level | INTEGER | NULL | 1 | Nivel de escalamiento (1-5) |
| auto_resolve | BOOLEAN | NULL | false | Se resuelve automaticamente |
| suppress_similar | BOOLEAN | NULL | false | Suprimir alertas similares |
| context_data | JSONB | NULL | '{}' | Datos de contexto |
| metrics | JSONB | NULL | '{}' | Metricas relacionadas |
| related_alerts | UUID[] | NULL | NULL | IDs de alertas relacionadas |
| triggered_at | TIMESTAMPTZ | NULL | gamilit.now_mexico() | Fecha de activacion |
| created_at | TIMESTAMPTZ | NULL | gamilit.now_mexico() | - |
| updated_at | TIMESTAMPTZ | NULL | gamilit.now_mexico() | - |

**Primary Key:** id
**Foreign Keys:** tenant_id → auth_management.tenants ON DELETE CASCADE, acknowledged_by → auth_management.profiles, resolved_by → auth_management.profiles
**Checks:** alert_type valores validos, severity IN ('low','medium','high','critical'), status IN ('open','acknowledged','resolved','suppressed'), escalation_level BETWEEN 1 AND 5
**Indices:** `idx_alerts_open` (parcial: status='open'), `idx_alerts_severity`, `idx_alerts_status`, `idx_alerts_triggered` (DESC), `idx_alerts_type`
**RLS:** habilitado (admin + tenant)

---

### audit_logging.system_logs
Logs del sistema: errores, advertencias e informacion de debugging.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | gen_random_uuid() | PK |
| tenant_id | UUID | NULL | NULL | FK auth_management.tenants |
| log_level | TEXT | NOT NULL | - | Nivel: TRACE, DEBUG, INFO, WARN, ERROR, FATAL |
| logger_name | TEXT | NULL | NULL | Nombre del logger |
| message | TEXT | NOT NULL | - | Mensaje del log |
| module_name | TEXT | NULL | NULL | Nombre del modulo |
| function_name | TEXT | NULL | NULL | Nombre de la funcion |
| line_number | INTEGER | NULL | NULL | Numero de linea en el codigo |
| file_path | TEXT | NULL | NULL | Ruta del archivo |
| request_id | TEXT | NULL | NULL | ID de la peticion HTTP |
| session_id | TEXT | NULL | NULL | ID de la sesion |
| user_id | UUID | NULL | NULL | FK auth_management.profiles |
| ip_address | INET | NULL | NULL | Direccion IP |
| exception_type | TEXT | NULL | NULL | Tipo de excepcion |
| exception_message | TEXT | NULL | NULL | Mensaje de la excepcion |
| stack_trace | TEXT | NULL | NULL | Stack trace del error |
| execution_time_ms | INTEGER | NULL | NULL | Tiempo de ejecucion en ms |
| memory_usage_mb | NUMERIC(10,2) | NULL | NULL | Uso de memoria en MB |
| cpu_usage_percent | NUMERIC(5,2) | NULL | NULL | Uso de CPU en porcentaje |
| environment | TEXT | NULL | 'production' | Ambiente: development, staging, production |
| server_name | TEXT | NULL | NULL | Nombre del servidor |
| thread_id | TEXT | NULL | NULL | ID del hilo de ejecucion |
| correlation_id | TEXT | NULL | NULL | ID de correlacion para seguimiento |
| extra_data | JSONB | NULL | '{}' | Datos adicionales |
| created_at | TIMESTAMPTZ | NULL | gamilit.now_mexico() | - |

**Primary Key:** id
**Foreign Keys:** tenant_id → auth_management.tenants ON DELETE CASCADE, user_id → auth_management.profiles
**Checks:** log_level IN ('TRACE','DEBUG','INFO','WARN','ERROR','FATAL'), environment IN ('development','staging','production')
**Indices:** `idx_system_logs_created` (DESC), `idx_system_logs_errors` (parcial: ERROR/FATAL), `idx_system_logs_level`, `idx_system_logs_user` (parcial)
**RLS:** habilitado (own + admin)

---

### audit_logging.user_activity_logs
Registro de actividad de usuarios para analytics y seguimiento de comportamiento.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | gen_random_uuid() | PK |
| user_id | UUID | NOT NULL | - | FK auth_management.profiles ON DELETE CASCADE |
| tenant_id | UUID | NULL | NULL | FK auth_management.tenants ON DELETE CASCADE |
| activity_type | TEXT | NOT NULL | - | Tipo: page_view, button_click, form_submit, exercise_start, exercise_complete, module_access, video_play, resource_download, search_query |
| action_detail | TEXT | NULL | NULL | Detalle de la accion |
| page_url | TEXT | NULL | NULL | URL de la pagina |
| page_title | TEXT | NULL | NULL | Titulo de la pagina |
| referrer_url | TEXT | NULL | NULL | URL de referencia |
| session_id | TEXT | NULL | NULL | ID de la sesion |
| session_duration | INTERVAL | NULL | NULL | Duracion de la sesion |
| element_id | TEXT | NULL | NULL | ID del elemento HTML interactuado |
| element_type | TEXT | NULL | NULL | Tipo de elemento HTML |
| element_text | TEXT | NULL | NULL | Texto del elemento |
| coordinates | POINT | NULL | NULL | Coordenadas del click (x,y) |
| module_id | UUID | NULL | NULL | ID del modulo educativo (referencia debil, sin FK constraint) |
| exercise_id | UUID | NULL | NULL | ID del ejercicio (referencia debil, sin FK constraint) |
| classroom_id | UUID | NULL | NULL | ID del aula (referencia debil, sin FK constraint) |
| user_agent | TEXT | NULL | NULL | User agent del navegador |
| ip_address | INET | NULL | NULL | Direccion IP |
| device_type | TEXT | NULL | NULL | Tipo de dispositivo (desktop, mobile, tablet) |
| browser_name | TEXT | NULL | NULL | Nombre del navegador |
| browser_version | TEXT | NULL | NULL | Version del navegador |
| screen_resolution | TEXT | NULL | NULL | Resolucion de pantalla |
| load_time_ms | INTEGER | NULL | NULL | Tiempo de carga en ms |
| interaction_time_ms | INTEGER | NULL | NULL | Tiempo de interaccion en ms |
| metadata | JSONB | NULL | '{}' | Metadatos adicionales |
| created_at | TIMESTAMPTZ | NULL | gamilit.now_mexico() | - |

**Primary Key:** id
**Foreign Keys:** user_id → auth_management.profiles ON DELETE CASCADE, tenant_id → auth_management.tenants ON DELETE CASCADE
**Check:** activity_type IN ('page_view','button_click','form_submit','exercise_start','exercise_complete','module_access','video_play','resource_download','search_query')
**Indices:** `idx_activity_created` (DESC), `idx_activity_module` (parcial), `idx_activity_session`, `idx_activity_type`, `idx_activity_user`
**RLS:** habilitado (own + admin)

---

### audit_logging.activity_logs
Log de actividad para el admin dashboard (seguimiento de acciones transversales).

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | gen_random_uuid() | PK |
| user_id | UUID | NOT NULL | - | FK auth_management.profiles ON DELETE CASCADE |
| action_type | VARCHAR(100) | NOT NULL | - | Tipo de accion (login, exercise_complete, module_start, etc.) |
| entity_type | VARCHAR(50) | NULL | NULL | Tipo de entidad afectada (user, exercise, module, etc.) |
| entity_id | UUID | NULL | NULL | ID de la entidad afectada |
| description | TEXT | NOT NULL | - | Descripcion legible de la accion |
| metadata | JSONB | NULL | '{}' | Contexto adicional (JSONB) |
| ip_address | INET | NULL | NULL | IP de origen de la accion |
| user_agent | TEXT | NULL | NULL | User agent del cliente |
| created_at | TIMESTAMPTZ | NOT NULL | gamilit.now_mexico() | - |
| updated_at | TIMESTAMPTZ | NOT NULL | gamilit.now_mexico() | - |

**Primary Key:** id
**Foreign Keys:** user_id → auth_management.profiles ON DELETE CASCADE
**Indices:** `idx_activity_logs_user_id`, `idx_activity_logs_created_at` (DESC), `idx_activity_logs_action_type`, `idx_activity_logs_user_created`, `idx_activity_logs_metadata` (GIN)
**RLS:** habilitado (own + admin + system insert)
**Nota:** Usada por admin dashboard: getRecentActivity(), getActiveUsers24h(), getAlerts(). Es fuente de la view `admin_dashboard.recent_activity`.

---

### audit_logging.pending_user_initializations
Registro de usuarios cuya inicializacion de gamificacion fallo para retry posterior.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | gen_random_uuid() | PK |
| user_id | UUID | NOT NULL | - | ID del usuario en auth.users |
| profile_id | UUID | NULL | NULL | ID del perfil en auth_management.profiles |
| tenant_id | UUID | NULL | NULL | ID del tenant |
| error_message | TEXT | NOT NULL | - | Mensaje de error del fallo |
| error_code | TEXT | NULL | NULL | Codigo de error |
| error_detail | TEXT | NULL | NULL | Detalle tecnico del error |
| trigger_name | TEXT | NULL | 'initialize_user_stats' | Nombre del trigger que fallo |
| function_name | TEXT | NULL | 'gamilit.initialize_user_stats' | Funcion que fallo |
| retry_count | INTEGER | NULL | 0 | Numero de reintentos realizados |
| max_retries | INTEGER | NULL | 3 | Maximo de reintentos permitidos |
| last_retry_at | TIMESTAMPTZ | NULL | NULL | Fecha del ultimo reintento |
| next_retry_at | TIMESTAMPTZ | NULL | NULL | Fecha del proximo reintento |
| status | TEXT | NULL | 'pending' | Estado: pending, retrying, resolved, failed, manual |
| resolved_at | TIMESTAMPTZ | NULL | NULL | Fecha de resolucion |
| resolved_by | UUID | NULL | NULL | Usuario que resolvio manualmente |
| resolution_notes | TEXT | NULL | NULL | Notas de resolucion |
| created_at | TIMESTAMPTZ | NOT NULL | gamilit.now_mexico() | - |
| updated_at | TIMESTAMPTZ | NOT NULL | gamilit.now_mexico() | - |

**Primary Key:** id
**Check:** status IN ('pending','retrying','resolved','failed','manual')
**Indices:** `idx_pending_init_user_id`, `idx_pending_init_status`, `idx_pending_init_created_at` (DESC), `idx_pending_init_next_retry` (parcial: status IN pending/retrying)
**Trigger:** trg_pending_init_updated_at
**Funcion helper:** `audit_logging.resolve_pending_initialization(p_user_id, p_resolved_by, p_notes)` → marca como resuelto
