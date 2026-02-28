---
title: "API Reference - Infrastructure"
status: activo
last_updated: "2026-02-28"
---

# API Reference - Infrastructure

> Volver al [API Reference Hub](../API-REFERENCE.md)

---

## WebSocket (Socket.IO)

### Namespaces

| Namespace | Eventos | Descripcion |
|-----------|---------|-------------|
| /gamification | xp-updated, achievement-unlocked, rank-promoted, leaderboard-updated | Actualizaciones de gamificacion |
| /notifications | notification, notification-count | Notificaciones en tiempo real |
| /progress | progress-updated, module-unlocked | Actualizaciones de progreso |

### Eventos del Servidor (emitidos)

```javascript
// Gamification
socket.emit('xp-updated', { studentId, amount, total, source })
socket.emit('achievement-unlocked', { studentId, achievementId, name, icon })
socket.emit('rank-promoted', { studentId, newRank, title })
socket.emit('leaderboard-updated', { classroomId, rankings })

// Notifications
socket.emit('notification', { id, type, title, message, priority })
socket.emit('notification-count', { unread: number })

// Progress
socket.emit('progress-updated', { studentId, moduleId, percentage })
socket.emit('module-unlocked', { studentId, moduleId })
```

### Autenticacion WebSocket
```javascript
const socket = io('ws://localhost:3006/gamification', {
  auth: { token: 'Bearer <jwt_token>' }
});
```

---

## Error Handling

### Formato de Error
```json
{
  "statusCode": 400,
  "message": "Descripcion del error",
  "error": "Bad Request",
  "timestamp": "2026-02-07T00:00:00.000Z",
  "path": "/api/endpoint"
}
```

### Codigos HTTP
| Codigo | Significado |
|--------|-------------|
| 200 | OK |
| 201 | Created |
| 204 | No Content |
| 400 | Bad Request (validacion) |
| 401 | Unauthorized (no autenticado) |
| 403 | Forbidden (sin permisos) |
| 404 | Not Found |
| 409 | Conflict |
| 429 | Too Many Requests (rate limit) |
| 500 | Internal Server Error |

---

## Rate Limiting

**Limite:** 100 requests/minuto por IP
**Header:** `X-RateLimit-Remaining`, `X-RateLimit-Reset`

---

## Swagger / OpenAPI

**URL:** http://localhost:3006/api-docs

Documentacion interactiva generada automaticamente desde decorators NestJS (@ApiTags, @ApiOperation, @ApiResponse).

---

## Modulos Condicionales [CONDITIONAL]

> **Nota:** Los siguientes endpoints solo estan disponibles cuando `ENABLE_DATA_WAREHOUSE=true`.
> Estos modulos (ETL, ML, Visualization) no se cargan por defecto en `app.module.ts`.
> Requieren el datasource `data_warehouse` configurado.

**Total condicional:** 58 endpoints | 10 controllers | 3 modulos

---

### ETL Module (16 endpoints)

> **Activacion:** `ENABLE_DATA_WAREHOUSE=true`
> **Controllers:** 3 (EtlController, EtlLoadController, TransformController + ValidationController + CacheController)
> **Auth:** `JwtAuthGuard` + `RolesGuard` (rol: `super_admin`)

#### EtlController (5 endpoints)

> **Route prefix:** `/api/v1/etl/extract`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/v1/etl/extract/trigger` | Admin | Trigger ETL extraction |
| GET | `/api/v1/etl/extract/status` | Admin | Get current extraction status |
| GET | `/api/v1/etl/extract/history` | Admin | Get extraction history |
| GET | `/api/v1/etl/extract/overview` | Admin | Get ETL extraction overview |
| GET | `/api/v1/etl/extract/job-status` | Admin | Get extraction job status |

#### EtlLoadController (5 endpoints)

> **Route prefix:** `/api/v1/etl`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/v1/etl/load/trigger` | Admin | Trigger ETL load phase |
| GET | `/api/v1/etl/load/status` | Admin | Get current load status |
| POST | `/api/v1/etl/load/full` | Admin | Trigger full ETL pipeline |
| GET | `/api/v1/etl/pipeline/status` | Admin | Get pipeline status |
| GET | `/api/v1/etl/load/logs` | Admin | Get load log history (paginated) |

#### TransformController + ValidationController + CacheController (6 endpoints)

> **Route prefix:** `/api/v1/etl`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/v1/etl/transform/trigger` | Admin | Trigger transformation pipeline |
| GET | `/api/v1/etl/transform/status` | Admin | Get transformation status |
| GET | `/api/v1/etl/transform/health` | Admin | Transformation health check |
| GET | `/api/v1/etl/validation/report` | Admin | Get data quality validation report |
| POST | `/api/v1/etl/cache/clear` | Admin | Clear dimension caches |
| GET | `/api/v1/etl/cache/stats` | Admin | Get cache statistics |

---

### ML Module (21 endpoints)

> **Activacion:** `ENABLE_DATA_WAREHOUSE=true`
> **Controllers:** 3 (FeaturesController, ModelAdminController, PredictionController)
> **Auth:** `JwtAuthGuard` + `RolesGuard` (roles segun endpoint)

#### FeaturesController (5 endpoints)

> **Route prefix:** `/api/v1/ml/features`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/v1/ml/features/:studentId` | Teacher/Admin | Get ML features for student |
| POST | `/api/v1/ml/features/batch` | SuperAdmin | Batch generate features |
| GET | `/api/v1/ml/features/schema` | Admin | Get feature schema documentation |
| DELETE | `/api/v1/ml/features/cache/:studentId` | Admin | Invalidate feature cache |
| GET | `/api/v1/ml/features/cached/:studentId` | Teacher/Admin | Get cached features (no regeneration) |

#### ModelAdminController (7 endpoints)

> **Route prefix:** `/api/v1/ml/admin`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/v1/ml/admin/models` | Admin | List all ML models and status |
| GET | `/api/v1/ml/admin/models/:modelType/metrics` | Admin | Get metrics for model |
| POST | `/api/v1/ml/admin/models/:modelType/train` | Admin | Trigger model training |
| POST | `/api/v1/ml/admin/models/:modelType/activate/:version` | Admin | Activate model version |
| GET | `/api/v1/ml/admin/predictions/logs` | Admin | Get prediction audit logs |
| DELETE | `/api/v1/ml/admin/cache/predictions` | Admin | Clear all prediction cache |
| GET | `/api/v1/ml/admin/cache/stats` | Admin | Get cache statistics |

#### PredictionController (9 endpoints)

> **Route prefix:** `/api/v1/ml/predict`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/v1/ml/predict/dropout-risk/:studentId` | Teacher/Admin | Get dropout risk prediction |
| GET | `/api/v1/ml/predict/performance/:studentId/:exerciseId` | Teacher/Admin | Get performance prediction |
| GET | `/api/v1/ml/predict/difficulty/:studentId/:moduleId` | Teacher/Admin | Get difficulty recommendation |
| GET | `/api/v1/ml/predict/engagement/:studentId` | Teacher/Admin | Get engagement prediction |
| GET | `/api/v1/ml/predict/insights/:studentId` | Teacher/Admin | Get comprehensive student insights |
| POST | `/api/v1/ml/predict/batch/dropout-risk` | Admin | Batch predict dropout risk |
| POST | `/api/v1/ml/predict/batch/classroom/:classroomId` | Teacher/Admin | Batch predict for classroom |
| GET | `/api/v1/ml/predict/dashboard/at-risk` | Teacher/Admin | Get students at risk dashboard |
| GET | `/api/v1/ml/predict/dashboard/metrics` | Admin | Get ML model performance metrics |

---

### Visualization Module (21 endpoints)

> **Activacion:** `ENABLE_DATA_WAREHOUSE=true`
> **Controllers:** 4 (AggregationController, ChartController, DashboardController, ReportController)
> **Auth:** `JwtAuthGuard` + `RolesGuard` (roles segun endpoint)

#### AggregationController (2 endpoints)

> **Route prefix:** `/api/v1/visualization/aggregation`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/v1/visualization/aggregation/query` | Teacher/Admin | Execute aggregation query |
| GET | `/api/v1/visualization/aggregation/kpi` | Teacher/Admin | Get KPI value |

#### ChartController (4 endpoints)

> **Route prefix:** `/api/v1/visualization/charts`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/v1/visualization/charts/generate` | Teacher/Admin | Generate a chart |
| GET | `/api/v1/visualization/charts/student/:studentId/progress` | Teacher/Admin/Parent | Get student progress charts |
| GET | `/api/v1/visualization/charts/classroom/:classroomId/comparison` | Teacher/Admin | Get class comparison chart |
| GET | `/api/v1/visualization/charts/engagement/heatmap` | Teacher/Admin | Get engagement heatmap |

#### DashboardController (7 endpoints)

> **Route prefix:** `/api/v1/visualization/dashboards`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/v1/visualization/dashboards` | Teacher/Admin | List dashboards |
| GET | `/api/v1/visualization/dashboards/templates` | Teacher/Admin | Get available dashboard templates |
| GET | `/api/v1/visualization/dashboards/:id` | Teacher/Admin | Get dashboard by ID |
| GET | `/api/v1/visualization/dashboards/:id/widgets/:widgetId` | Teacher/Admin | Get widget data |
| POST | `/api/v1/visualization/dashboards` | Admin | Create new dashboard |
| PUT | `/api/v1/visualization/dashboards/:id` | Admin | Update dashboard |
| DELETE | `/api/v1/visualization/dashboards/:id` | Admin | Delete dashboard |

#### ReportController (8 endpoints)

> **Route prefix:** `/api/v1/visualization/reports`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/v1/visualization/reports/templates` | Teacher/Admin | List available report templates |
| GET | `/api/v1/visualization/reports/templates/:id` | Teacher/Admin | Get report template by ID |
| POST | `/api/v1/visualization/reports/generate` | Teacher/Admin | Generate a report |
| GET | `/api/v1/visualization/reports/jobs/:jobId` | Teacher/Admin | Get report job status |
| GET | `/api/v1/visualization/reports/jobs/:jobId/download` | Teacher/Admin | Download generated report |
| POST | `/api/v1/visualization/reports/schedule` | Admin | Schedule a recurring report |
| GET | `/api/v1/visualization/reports/scheduled` | Admin | List scheduled reports |
| DELETE | `/api/v1/visualization/reports/scheduled/:id` | Admin | Cancel scheduled report |

---

*GAMILIT - API Reference*
*914 endpoints (activos) + 58 endpoints condicionales | 23 modulos + Admin Module + LTI + Assignments + ETL + ML + Visualization | JWT Auth | Socket.IO Real-time*

---

Prev: [Admin, LTI & Assignments](06-ADMIN-LTI-ASSIGNMENTS.md) | Next: --
