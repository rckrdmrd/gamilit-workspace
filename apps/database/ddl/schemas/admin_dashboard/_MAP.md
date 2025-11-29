# Schema: admin_dashboard

Tablas, funciones y vistas para panel de administración y reportes analíticos

## Estructura

- **tables/**: 3 archivos
- **functions/**: 1 archivo
- **views/**: 7 archivos

**Total:** 11 objetos

## Contenido Detallado

### tables/ (3 archivos)

```
01-materialized_views.sql           (vistas materializadas para dashboard)
07-bulk_operations.sql              (creado 2025-11-11 - EXT-002)
08-admin_reports.sql                (creado 2025-11-28 - Portal Admin - Persistencia de reportes)
```

### functions/ (1 archivo)

```
01-update_bulk_operation_progress.sql  (creado 2025-11-11 - EXT-002)
```

### views/ (7 archivos)

```
01-recent_activity.sql              (actividad reciente del sistema)
assignment_submission_stats.sql    (migrado desde public 2025-11-11)
classroom_overview.sql              (migrado desde public 2025-11-11)
moderation_queue.sql
organization_stats_summary.sql
recent_admin_actions.sql
user_stats_summary.sql
```

## Descripción

### Tablas
- **materialized_views**: Vistas materializadas para optimización del dashboard administrativo
- **bulk_operations**: Registro de operaciones masivas (bulk) realizadas por administradores sobre múltiples usuarios/recursos
- **admin_reports**: Registro de reportes generados por administradores (PDF, Excel, CSV) con persistencia a BD (antes en memoria)

### Funciones
- **update_bulk_operation_progress**: Actualiza el progreso de operaciones bulk incrementando contadores

### Vistas
Vistas SQL optimizadas para consultas analíticas del dashboard administrativo:

- **recent_activity**: Actividad reciente del sistema
- **assignment_submission_stats**: Estadísticas de entregas de assignments
- **classroom_overview**: Overview completo de aulas y estudiantes
- **moderation_queue**: Cola de moderación de contenido
- **organization_stats_summary**: Resumen de estadísticas organizacionales
- **recent_admin_actions**: Acciones administrativas recientes
- **user_stats_summary**: Resumen de estadísticas de usuarios

---

**Última actualización:** 2025-11-28
**Reorganización:** 2025-11-11 (migración de 2 vistas desde public)
**Extensión:** 2025-11-11 (agregadas tabla bulk_operations y función helper para EXT-002)
**Portal Admin:** 2025-11-28 (agregada tabla admin_reports para persistencia de reportes - antes en memoria)
