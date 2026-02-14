# Schema: admin_dashboard (4 tablas, 7 views, 3 materialized views)

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

### admin_dashboard.materialized_views_config
Configuracion de materialized views (refresh intervals, estado).

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

### admin_dashboard.metrics_history
Historial de metricas del sistema para tracking temporal.

**Entity Backend:** `MetricsHistory` (via DB_TABLES.ADMIN.METRICS_HISTORY)

---

## Views (7) y Materialized Views (3)

Las views proporcionan datos agregados para el dashboard administrativo:
- Resumen de usuarios activos por tenant
- Progreso global por modulo
- Metricas de gamificacion agregadas
- KPIs del sistema

Las 3 materialized views se refrescan periodicamente para rendimiento.

---

*GAMILIT - Schema Reference: admin_dashboard*
