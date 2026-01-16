# _MAP: admin_dashboard/

**Ultima actualizacion:** 2026-01-14
**Estado:** Produccion
**Tipo:** Integration/Admin
**Objetos activos:** 12

---

## Proposito

Panel de administracion y reportes analiticos para supervisores y administradores del sistema.
Proporciona vistas consolidadas de metricas, operaciones bulk y reportes exportables.

**Audiencia:** Administradores, Tech Leads, Product Owners

---

## Estructura

```
ddl/schemas/admin_dashboard/
├── tables/
│   ├── 01-materialized_views.sql
│   ├── 07-bulk_operations.sql
│   ├── 08-admin_reports.sql
│   └── 09-metrics_history.sql
├── functions/
│   └── 01-update_bulk_operation_progress.sql
├── views/
│   ├── 01-recent_activity.sql
│   ├── 02-assignment_submission_stats.sql
│   ├── 03-classroom_overview.sql
│   ├── 04-moderation_queue.sql
│   ├── 05-organization_stats_summary.sql
│   ├── 06-recent_admin_actions.sql
│   └── 07-user_stats_summary.sql
└── _MAP.md
```

**Total objetos DDL:** 12 (4 tablas, 1 funcion, 7 vistas)

---

## Tablas

| Tabla | Archivo | Proposito |
|-------|---------|-----------|
| `materialized_views` | 01-materialized_views.sql | Configuracion de MVs para dashboard |
| `bulk_operations` | 07-bulk_operations.sql | Registro de operaciones masivas |
| `admin_reports` | 08-admin_reports.sql | Reportes generados (PDF, Excel, CSV) |
| `metrics_history` | 09-metrics_history.sql | Historial de metricas del sistema |

## Funciones

| Funcion | Archivo | Proposito |
|---------|---------|-----------|
| `update_bulk_operation_progress` | 01-update_bulk_operation_progress.sql | Actualiza progreso de operaciones bulk |

## Vistas Analiticas

| Vista | Archivo | Proposito |
|-------|---------|-----------|
| `recent_activity` | 01-recent_activity.sql | Actividad reciente del sistema |
| `assignment_submission_stats` | 02-assignment_submission_stats.sql | Estadisticas de entregas |
| `classroom_overview` | 03-classroom_overview.sql | Overview de aulas y estudiantes |
| `moderation_queue` | 04-moderation_queue.sql | Cola de moderacion de contenido |
| `organization_stats_summary` | 05-organization_stats_summary.sql | Resumen estadistico organizacional |
| `recent_admin_actions` | 06-recent_admin_actions.sql | Acciones administrativas recientes |
| `user_stats_summary` | 07-user_stats_summary.sql | Resumen de estadisticas de usuarios |

---

## Seeds

| Archivo | Proposito |
|---------|-----------|
| `01-bulk_operations.sql` | 3 ejemplos de operaciones bulk |
| `02-admin_reports.sql` | 4 reportes de ejemplo |

---

## Dependencias

**Este schema depende de:**
- `auth_management` (profiles, tenants)
- `educational_content` (modules, exercises)
- `social_features` (classrooms, schools)
- `progress_tracking` (exercise_submissions)
- `audit_logging` (activity_log)

**Schemas que dependen de este:** Ninguno (schema terminal)

---

## Referencia

- `create-database.sh` Fase 13 - admin_dashboard
- `DATABASE_INVENTORY.yml` - admin_dashboard section

---

**Mantenido por:** Database Team
**Version:** 2.0
