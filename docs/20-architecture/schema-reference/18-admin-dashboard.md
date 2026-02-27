---
titulo: Schema 18 - admin_dashboard
tipo: arquitectura
subtipo: schema-reference
schema: admin_dashboard
ultima_actualizacion: 2026-02-27
---

# Schema: admin_dashboard (4 tablas, 7 views, 3 materialized views)

> **Nota:** Este documento describe el modelo conceptual. Para definiciones DDL exactas, consultar `apps/database/ddl/schemas/`.

> Parte de [Schema Reference](_INDEX.md) - GAMILIT
> **Schema fisico DDL:** `admin_dashboard`
> **Tipo:** support
> **DDL Path:** `apps/database/ddl/schemas/admin_dashboard/`
> **Constante Backend:** `DB_SCHEMAS.ADMIN_DASHBOARD`

---

## Descripcion

Dashboard administrativo con operaciones bulk, reportes y metricas del sistema. Incluye 7 views y 3 materialized views para consultas de rendimiento.

---

## Tablas (4)

### admin_dashboard.bulk_operations
Operaciones masivas ejecutadas por administradores.

| Columna | Tipo | Nullable | Descripcion |
|---------|------|----------|-------------|
| id | UUID | NOT NULL | PK |
| operation_type | VARCHAR(50) | NOT NULL | Tipo: suspend_users, activate_users, update_role, delete_users |
| target_entity | VARCHAR(50) | NOT NULL | Entidad: users, content, classrooms |
| target_ids | UUID[] | NOT NULL | IDs de recursos a procesar |
| target_count | INTEGER | NOT NULL | Total a procesar |
| completed_count | INTEGER | NOT NULL | Completados |
| failed_count | INTEGER | NOT NULL | Fallidos |
| status | VARCHAR(20) | NOT NULL | pending, running, completed, failed, cancelled |
| error_details | JSONB | - | Array de errores individuales |
| started_by | UUID | NOT NULL | FK -> auth_management.profiles |
| started_at | TIMESTAMP | - | Inicio |
| completed_at | TIMESTAMP | NULL | Fin |
| result | JSONB | NULL | Resultado consolidado |

**Entity Backend:** `BulkOperation` (via DB_TABLES.ADMIN.BULK_OPERATIONS)

### admin_dashboard.admin_reports
Reportes generados por administradores del sistema.

| Columna | Tipo | Nullable | Descripcion |
|---------|------|----------|-------------|
| id | UUID | NOT NULL | PK |
| report_type | VARCHAR(50) | NOT NULL | users, progress, engagement, gamification, content |
| report_format | VARCHAR(20) | NOT NULL | pdf, excel, csv |
| status | VARCHAR(20) | NOT NULL | pending, generating, completed, failed |
| file_url | VARCHAR(500) | NULL | URL del archivo generado |
| file_size | INTEGER | NULL | Tamano en bytes |
| metadata | JSONB | - | Filtros y parametros |
| requested_by | UUID | NOT NULL | FK -> auth_management.profiles |
| tenant_id | UUID | NOT NULL | FK -> auth_management.tenants |
| expires_at | TIMESTAMP | NULL | Limpieza automatica (+30 dias) |

**Entity Backend:** `AdminReport` (via DB_TABLES.ADMIN.ADMIN_REPORTS)

### admin_dashboard.metrics_history [DDL-ACCURATE]

**Descripcion:** Almacena historial de metricas del sistema para monitoreo en AdminMonitoringPage.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | gen_random_uuid() | PK |
| recorded_at | TIMESTAMPTZ | NOT NULL | NOW() | Timestamp de cuando se registro la metrica |
| memory_total_mb | NUMERIC(10,2) | NOT NULL | - | Memoria total del sistema en MB |
| memory_used_mb | NUMERIC(10,2) | NOT NULL | - | Memoria usada en MB |
| memory_free_mb | NUMERIC(10,2) | NOT NULL | - | Memoria libre en MB |
| memory_usage_percent | NUMERIC(5,2) | NOT NULL | - | Porcentaje de uso de memoria (0-100) |
| heap_used_mb | NUMERIC(10,2) | NULL | NULL | Heap de Node.js usada en MB |
| heap_total_mb | NUMERIC(10,2) | NULL | NULL | Heap total de Node.js en MB |
| cpu_user_ms | NUMERIC(12,2) | NULL | NULL | Tiempo de CPU en modo usuario (ms) |
| cpu_system_ms | NUMERIC(12,2) | NULL | NULL | Tiempo de CPU en modo sistema (ms) |
| cpu_usage_percent | NUMERIC(5,2) | NULL | NULL | Porcentaje estimado de uso de CPU |
| cpu_cores | INTEGER | NULL | NULL | Numero de cores de CPU |
| load_average_1m | NUMERIC(5,2) | NULL | NULL | Load average del ultimo minuto |
| load_average_5m | NUMERIC(5,2) | NULL | NULL | Load average de los ultimos 5 minutos |
| load_average_15m | NUMERIC(5,2) | NULL | NULL | Load average de los ultimos 15 minutos |
| process_uptime_seconds | INTEGER | NULL | NULL | Uptime del proceso Node.js en segundos |
| active_handles | INTEGER | NULL | NULL | Handles activos del proceso |
| active_requests | INTEGER | NULL | NULL | Requests activos del proceso |
| system_uptime_seconds | INTEGER | NULL | NULL | Uptime del sistema operativo en segundos |
| node_version | VARCHAR(20) | NULL | NULL | Version de Node.js |
| platform | VARCHAR(50) | NULL | NULL | Plataforma del sistema operativo |
| hostname | VARCHAR(255) | NULL | NULL | Hostname del servidor |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() | - |

**Primary Key:** id
**Unique:** recorded_at (`uq_metrics_history_recorded_at` -- evita duplicados en el mismo segundo)
**Indices:** `idx_metrics_history_recorded_at` (recorded_at DESC), `idx_metrics_history_created_at` (created_at), `idx_metrics_history_memory_usage` (memory_usage_percent, parcial WHERE memory_usage_percent > 80)
**Funcion:** `admin_dashboard.cleanup_old_metrics(p_retention_days INTEGER DEFAULT 30)` -- elimina metricas mas antiguas que N dias
**Grants:** SELECT, INSERT, DELETE a gamilit_user; EXECUTE cleanup_old_metrics a gamilit_user
**Entity Backend:** `MetricsHistory` (via DB_TABLES.ADMIN.METRICS_HISTORY, `admin/entities/metrics-history.entity.ts`)

---

## Views (7) y Materialized Views (3)

Las views proporcionan datos agregados para el dashboard administrativo:
- Resumen de usuarios activos por tenant
- Progreso global por modulo
- Metricas de gamificacion agregadas
- KPIs del sistema

Las 3 materialized views se refrescan periodicamente para rendimiento.

---

---

## Tablas Conceptuales (sin DDL)

> Las siguientes tablas aparecen en el modelo conceptual pero no tienen DDL implementado.
> Son candidatas para futuras iteraciones o estan cubiertas por tablas existentes.

| Tabla | Proposito |
|-------|-----------|
| admin_dashboard.materialized_views_config | Configuracion de vistas materializadas |

---

*GAMILIT - Schema Reference: admin_dashboard*
