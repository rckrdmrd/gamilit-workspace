---
titulo: "P2 Admin Portal Endpoints Implementation"
tipo: api
fecha_creacion: "2025-10-01"
ultima_actualizacion: "2026-02-28"
estado: archivado
---

# P2 Admin Portal Endpoints Implementation

**Fecha**: 2026-01-07
**Estado**: COMPLETADO
**Build**: Validado OK

## Resumen

Implementación de endpoints P2 faltantes para completar las 5 páginas del Admin Portal:
- AdminGamificationPage (100%)
- AdminMonitoringPage (100% - MEJORADO)
- AdminAlertsPage (100%)
- AdminReportsPage (100% - MEJORADO)
- AdminSettingsPage (100%)

---

## TASK-ADMIN-REPORTS-SCHEDULE

### Descripción
Agregar endpoint para programar generación automática de reportes.

### Endpoint
```
POST /admin/reports/:id/schedule
```

### Archivos Modificados/Creados

| Archivo | Tipo | Descripción |
|---------|------|-------------|
| `src/modules/admin/dto/reports/schedule-report.dto.ts` | NUEVO | DTOs: ScheduleReportDto, ReportScheduleConfigDto, ScheduleReportResponseDto |
| `src/modules/admin/dto/reports/index.ts` | MODIFICADO | Export nuevo DTO |
| `src/modules/admin/services/admin-reports.service.ts` | MODIFICADO | Método scheduleReport() |
| `src/modules/admin/controllers/admin-reports.controller.ts` | MODIFICADO | Endpoint POST :id/schedule |

### DTOs

```typescript
// ScheduleReportDto
{
  enabled: boolean;               // Schedule activo
  frequency: 'daily' | 'weekly' | 'monthly';
  hour?: number;                  // 0-23, default 8
  day_of_week?: number;           // 0-6 (weekly)
  day_of_month?: number;          // 1-28 (monthly)
  recipients?: string[];          // Email recipients
}

// ScheduleReportResponseDto
{
  id: string;
  type: string;
  format: string;
  schedule: ReportScheduleConfigDto;
  message: string;
}
```

### Cambios en BD
- **NO SE REQUIEREN**: Usa campo JSONB `metadata` existente en `admin_dashboard.admin_reports`

---

## TASK-MONITORING-HISTORY-PERSISTENCE

### Descripción
Persistir métricas del sistema para análisis histórico con cron job cada 5 minutos.

### Endpoint Mejorado
```
GET /admin/monitoring/metrics/history?hours=24
```

### Archivos Modificados/Creados

| Archivo | Tipo | Descripción |
|---------|------|-------------|
| `apps/database/ddl/schemas/admin_dashboard/tables/09-metrics_history.sql` | NUEVO | Tabla métricas históricas |
| `src/modules/admin/entities/metrics-history.entity.ts` | NUEVO | Entidad TypeORM |
| `src/modules/admin/entities/index.ts` | MODIFICADO | Export MetricsHistory |
| `src/shared/constants/database.constants.ts` | MODIFICADO | METRICS_HISTORY en DB_TABLES.ADMIN |
| `src/modules/admin/services/admin-monitoring.service.ts` | MODIFICADO | Cron job + getMetricsHistory actualizado |

### Tabla metrics_history

```sql
CREATE TABLE admin_dashboard.metrics_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recorded_at TIMESTAMPTZ NOT NULL UNIQUE,

    -- Memoria
    memory_total_mb NUMERIC(10, 2) NOT NULL,
    memory_used_mb NUMERIC(10, 2) NOT NULL,
    memory_free_mb NUMERIC(10, 2) NOT NULL,
    memory_usage_percent NUMERIC(5, 2) NOT NULL,
    heap_used_mb NUMERIC(10, 2),
    heap_total_mb NUMERIC(10, 2),

    -- CPU
    cpu_user_ms NUMERIC(12, 2),
    cpu_system_ms NUMERIC(12, 2),
    cpu_usage_percent NUMERIC(5, 2),
    cpu_cores INTEGER,
    load_average_1m NUMERIC(5, 2),
    load_average_5m NUMERIC(5, 2),
    load_average_15m NUMERIC(5, 2),

    -- Proceso
    process_uptime_seconds INTEGER,
    active_handles INTEGER,
    active_requests INTEGER,

    -- Sistema
    system_uptime_seconds INTEGER,
    node_version VARCHAR(20),
    platform VARCHAR(50),
    hostname VARCHAR(255),

    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Cron Job
- **Frecuencia**: Cada 5 minutos (`*/5 * * * *`)
- **Nombre**: `collectSystemMetrics`
- **Comportamiento**:
  - Auto-deshabilitado si tabla no existe
  - Verifica tabla en `onModuleInit()`

### Función de Cleanup
```sql
SELECT * FROM admin_dashboard.cleanup_old_metrics(30); -- Retención: 30 días
```

---

## Instrucciones de Despliegue

### 1. Ejecutar DDL (si no existe la tabla)
```bash
psql -U gamilit_user -d gamilit -f apps/database/ddl/schemas/admin_dashboard/tables/09-metrics_history.sql
```

### 2. Verificar Build
```bash
cd apps/backend
npm run build
```

### 3. Reiniciar Backend
El cron job comenzará a recolectar métricas automáticamente cada 5 minutos.

---

## Trazabilidad

| Componente | Archivo | Línea |
|------------|---------|-------|
| DTO Schedule Report | `dto/reports/schedule-report.dto.ts` | 27-139 |
| Controller Schedule | `controllers/admin-reports.controller.ts` | 84-97 |
| Service Schedule | `services/admin-reports.service.ts` | (método scheduleReport) |
| Entity MetricsHistory | `entities/metrics-history.entity.ts` | 1-108 |
| Cron Job | `services/admin-monitoring.service.ts` | 100-178 |
| getMetricsHistory | `services/admin-monitoring.service.ts` | 228-313 |
| Tabla BD | `database/ddl/.../09-metrics_history.sql` | 1-134 |

---

## Testing Manual

### Test Schedule Report
```bash
curl -X POST http://localhost:3006/api/admin/reports/{reportId}/schedule \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"enabled":true,"frequency":"weekly","hour":8,"day_of_week":1}'
```

### Test Metrics History
```bash
curl http://localhost:3006/api/admin/monitoring/metrics/history?hours=24 \
  -H "Authorization: Bearer {token}"
```

---

**Implementado por**: Claude Code Agent
**Revisado**: Build OK 2026-01-07
