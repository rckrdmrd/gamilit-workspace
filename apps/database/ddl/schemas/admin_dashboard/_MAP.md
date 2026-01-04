# Schema: admin_dashboard

Tablas, funciones y vistas para panel de administración y reportes analíticos.

## Estructura

- **tables/**: 3 archivos
- **functions/**: 1 archivo
- **views/**: 7 archivos

**Total:** 11 objetos DDL

## Tablas

| Tabla | Propósito |
|-------|-----------|
| `materialized_views` | Vistas materializadas para dashboard |
| `bulk_operations` | Registro de operaciones masivas |
| `admin_reports` | Persistencia de reportes generados (PDF, Excel, CSV) |

## Funciones

| Función | Propósito |
|---------|-----------|
| `update_bulk_operation_progress` | Actualiza progreso de operaciones bulk |

## Vistas Analíticas

| Vista | Propósito |
|-------|-----------|
| `recent_activity` | Actividad reciente del sistema |
| `assignment_submission_stats` | Estadísticas de entregas |
| `classroom_overview` | Overview de aulas y estudiantes |
| `moderation_queue` | Cola de moderación de contenido |
| `organization_stats_summary` | Resumen estadístico organizacional |
| `recent_admin_actions` | Acciones administrativas recientes |
| `user_stats_summary` | Resumen de estadísticas de usuarios |

---

**Última actualización:** 2025-12-27
