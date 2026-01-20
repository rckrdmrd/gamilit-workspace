---
id: "US-AE-013"
title: "Gestion de Alertas del Sistema"
type: "User Story"
status: "Implementado"
priority: "Alta"
assignee: "@Backend-Agent, @Frontend-Agent"
epic: "EXT-002"
story_points: 8
budget: "$3,200 MXN"
sprint: "Sprint-2"
labels: ["admin-extendido", "alerts", "monitoring", "acknowledge", "resolve", "suppress"]
created_date: "2025-11-24"
updated_date: "2026-01-20"
completed_date: "2025-11-24"
---

# US-AE-013: Gestion de Alertas del Sistema

## Informacion General

| Campo | Valor |
|-------|-------|
| **ID** | US-AE-013 |
| **Epica** | EXT-002 - Admin Extendido |
| **Titulo** | Gestion de Alertas del Sistema |
| **Prioridad** | Alta (P1) |
| **Story Points** | 8 SP |
| **Estado** | Implementado |
| **Sprint** | Sprint 2 |
| **Duracion Estimada** | 3 dias |
| **Fecha Implementacion** | 2025-11-24 |

---

## Historia de Usuario

**Como** administrador del sistema GAMILIT
**Quiero** monitorear y gestionar alertas del sistema (listar, acknowledge, resolver, suprimir, crear manuales)
**Para** mantener el sistema saludable, responder rapidamente a incidentes criticos y documentar acciones correctivas

---

## Endpoints API Implementados (7 endpoints)

| # | Metodo | Endpoint | Descripcion |
|---|--------|----------|-------------|
| 1 | GET | `/api/admin/alerts` | Lista alertas con filtros avanzados y paginacion |
| 2 | GET | `/api/admin/alerts/stats/summary` | Estadisticas agregadas de alertas |
| 3 | GET | `/api/admin/alerts/:id` | Detalle completo de una alerta especifica |
| 4 | POST | `/api/admin/alerts` | Crear alerta manual |
| 5 | PATCH | `/api/admin/alerts/:id/acknowledge` | Reconocer alerta (open -> acknowledged) |
| 6 | PATCH | `/api/admin/alerts/:id/resolve` | Resolver alerta con nota de resolucion |
| 7 | PATCH | `/api/admin/alerts/:id/suppress` | Suprimir alerta (falsos positivos) |

**Guards:** `JwtAuthGuard` -> `AdminGuard`
**Documentacion:** Swagger/OpenAPI integrado

---

## Modelo de Datos

### Severidades (AlertSeverity)

| Valor | Descripcion | Prioridad |
|-------|-------------|-----------|
| `critical` | Alerta critica - requiere accion inmediata | 1 (mas alta) |
| `high` | Alerta alta prioridad | 2 |
| `medium` | Alerta de prioridad media | 3 |
| `low` | Alerta informativa o de baja prioridad | 4 (mas baja) |

### Estados (AlertStatus)

| Valor | Descripcion |
|-------|-------------|
| `open` | Alerta nueva, pendiente de revision |
| `acknowledged` | Alerta reconocida, en proceso de gestion |
| `resolved` | Alerta resuelta, problema solucionado |
| `suppressed` | Alerta suprimida (falso positivo o no relevante) |

### Tipos de Alerta (AlertType)

| Valor | Descripcion | Ejemplo |
|-------|-------------|---------|
| `performance_degradation` | Degradacion de rendimiento detectada | Response time > 5s |
| `high_error_rate` | Tasa de errores elevada | Error rate > 15% |
| `security_breach` | Brecha de seguridad detectada | Intentos de acceso no autorizado |
| `resource_limit` | Limite de recursos alcanzado | CPU > 95%, Disco > 90% |
| `service_outage` | Caida de servicio | Backend no responde |
| `data_anomaly` | Anomalia de datos detectada | Datos corruptos o inconsistentes |

### Transiciones de Estado Validas

```
open ──────────────────────> acknowledged (via /acknowledge)
  │                               │
  │                               │
  v                               v
resolved <────────────────── resolved (via /resolve)

Cualquier estado ──────────> suppressed (via /suppress)
```

---

## Criterios de Aceptacion

### Funcionales

| # | Criterio | Estado |
|---|----------|--------|
| AC-01 | Listar alertas con filtros: severity, status, alert_type, date_from, date_to | Implementado |
| AC-02 | Paginacion configurable con page (default:1) y limit (default:20) | Implementado |
| AC-03 | Ordenamiento por severidad (critical > high > medium > low) y fecha descendente | Implementado |
| AC-04 | Ver estadisticas: totales por estado, por severidad, ultimas 24h, ultimos 7d | Implementado |
| AC-05 | Ver detalles de alerta: titulo, descripcion, metadata, timestamps, usuario que gestiono | Implementado |
| AC-06 | Crear alertas manuales para documentar eventos no detectados automaticamente | Implementado |
| AC-07 | Acknowledge: Cambiar estado de open a acknowledged con nota opcional | Implementado |
| AC-08 | Resolve: Cambiar estado a resolved con nota de resolucion obligatoria (min 10 chars) | Implementado |
| AC-09 | Suppress: Marcar alerta como no relevante / falso positivo | Implementado |
| AC-10 | Confirmacion en UI antes de suprimir alertas | Implementado |

### No Funcionales

| # | Criterio | Estado |
|---|----------|--------|
| NF-01 | Response time p95 < 300ms | Cumplido |
| NF-02 | Solo usuarios con rol admin pueden acceder | Cumplido |
| NF-03 | Validacion automatica de DTOs con ValidationPipe | Cumplido |
| NF-04 | Documentacion Swagger completa en todos los endpoints | Cumplido |
| NF-05 | Manejo de errores con mensajes descriptivos | Cumplido |

---

## Especificacion de Endpoints

### 1. GET /api/admin/alerts

**Descripcion:** Lista alertas con filtros y paginacion

**Query Parameters:**

| Parametro | Tipo | Requerido | Default | Descripcion |
|-----------|------|-----------|---------|-------------|
| `severity` | AlertSeverity | No | - | Filtrar por severidad |
| `status` | AlertStatus | No | - | Filtrar por estado |
| `alert_type` | AlertType | No | - | Filtrar por tipo |
| `date_from` | ISO 8601 | No | - | Fecha inicio |
| `date_to` | ISO 8601 | No | - | Fecha fin |
| `page` | number | No | 1 | Numero de pagina |
| `limit` | number | No | 20 | Items por pagina |

**Response:** `PaginatedAlertsDto`

```typescript
{
  data: AlertResponseDto[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  }
}
```

---

### 2. GET /api/admin/alerts/stats/summary

**Descripcion:** Obtiene estadisticas agregadas de alertas

**Response:** `AlertsStatsDto`

```typescript
{
  total_alerts: number;
  open_alerts: number;
  acknowledged_alerts: number;
  resolved_alerts: number;
  critical_alerts: number;
  high_alerts: number;
  medium_alerts: number;
  low_alerts: number;
  alerts_24h: number;
  alerts_7d: number;
  avg_resolution_time_hours: number;
}
```

---

### 3. GET /api/admin/alerts/:id

**Descripcion:** Obtiene detalles de una alerta especifica

**Path Parameters:**

| Parametro | Tipo | Descripcion |
|-----------|------|-------------|
| `id` | UUID | ID de la alerta |

**Response:** `AlertResponseDto`

**Errores:**
- 404: Alerta no encontrada

---

### 4. POST /api/admin/alerts

**Descripcion:** Crea una alerta manual

**Request Body:** `CreateAlertDto`

```typescript
{
  alert_type: AlertType;       // Requerido
  severity: AlertSeverity;     // Requerido
  title: string;               // Requerido
  description?: string;
  source_system?: string;
  source_module?: string;
  affected_users?: number;     // Default: 0
  context_data?: Record<string, unknown>;
  metrics?: Record<string, unknown>;
}
```

**Response:** `AlertResponseDto` (201 Created)

**Errores:**
- 400: Datos invalidos

---

### 5. PATCH /api/admin/alerts/:id/acknowledge

**Descripcion:** Reconoce una alerta (cambia estado de open a acknowledged)

**Path Parameters:**

| Parametro | Tipo | Descripcion |
|-----------|------|-------------|
| `id` | UUID | ID de la alerta |

**Request Body:** `AcknowledgeAlertDto`

```typescript
{
  acknowledgment_note?: string;  // Opcional
}
```

**Response:** `AlertResponseDto`

**Errores:**
- 400: Alerta no esta en estado 'open'
- 404: Alerta no encontrada

---

### 6. PATCH /api/admin/alerts/:id/resolve

**Descripcion:** Resuelve una alerta con nota de resolucion

**Path Parameters:**

| Parametro | Tipo | Descripcion |
|-----------|------|-------------|
| `id` | UUID | ID de la alerta |

**Request Body:** `ResolveAlertDto`

```typescript
{
  resolution_note: string;  // Requerido, minimo 10 caracteres
}
```

**Response:** `AlertResponseDto`

**Errores:**
- 400: Alerta no puede resolverse en estado actual o nota muy corta
- 404: Alerta no encontrada

---

### 7. PATCH /api/admin/alerts/:id/suppress

**Descripcion:** Suprime una alerta (marca como falso positivo o no relevante)

**Path Parameters:**

| Parametro | Tipo | Descripcion |
|-----------|------|-------------|
| `id` | UUID | ID de la alerta |

**Response:** `AlertResponseDto`

**Errores:**
- 404: Alerta no encontrada

---

## Tipos TypeScript

### AlertResponseDto

```typescript
interface AlertResponseDto {
  id: string;
  tenant_id?: string;
  alert_type: AlertType;
  severity: AlertSeverity;
  title: string;
  description?: string;
  source_system?: string;
  source_module?: string;
  error_code?: string;
  affected_users: number;
  status: AlertStatus;
  acknowledgment_note?: string;
  resolution_note?: string;
  acknowledged_by?: string;
  acknowledged_by_name?: string;
  acknowledged_at?: Date;
  resolved_by?: string;
  resolved_by_name?: string;
  resolved_at?: Date;
  notification_sent: boolean;
  escalation_level: number;
  auto_resolve: boolean;
  suppress_similar: boolean;
  context_data?: Record<string, unknown>;
  metrics?: Record<string, unknown>;
  related_alerts?: string[];
  triggered_at: Date;
  created_at: Date;
  updated_at: Date;
}
```

---

## Wireframe Conceptual

```
+------------------------------------------------------------------------+
| Admin Portal > Sistema > Alertas                     [ Actualizar ]    |
+------------------------------------------------------------------------+
|                                                                         |
|  +------------------+  +------------------+  +------------------+       |
|  | Abiertas         |  | Criticas         |  | Ultimas 24h      |       |
|  |        12        |  |         3        |  |         8        |       |
|  +------------------+  +------------------+  +------------------+       |
|                                                                         |
+------------------------------------------------------------------------+
| Filtros:                                                                |
| [Severidad v] [Estado v] [Tipo v] [Fecha desde] [Fecha hasta] [Limpiar]|
+------------------------------------------------------------------------+
|                                                                         |
| +--------------------------------------------------------------------+ |
| | Sev  | Titulo                | Tipo          | Estado    | Acciones | |
| |--------------------------------------------------------------------- |
| | CRIT | CPU al 98%            | resource_limit | open      | [A][R][S]| |
| | HIGH | Error rate 25%        | high_error_rate| open      | [A][R][S]| |
| | MED  | Respuesta lenta API   | perf_degrad   | ack       | [  ][R][S]| |
| | LOW  | Anomalia en datos     | data_anomaly  | resolved  | [  ][ ][S]| |
| +--------------------------------------------------------------------+ |
|                                                                         |
| Pagina 1 de 5   Mostrando 1-20 de 92       [<< Anterior] [Siguiente >>]|
+------------------------------------------------------------------------+

[A] = Acknowledge   [R] = Resolve   [S] = Suppress
```

### Modal de Detalles

```
+--------------------------------------------------------------------+
| Detalle de Alerta                                             [X]  |
+--------------------------------------------------------------------+
| Titulo:        CPU al 98% en servidor principal                     |
| Tipo:          resource_limit                                       |
| Severidad:     critical                                             |
| Estado:        open                                                 |
+--------------------------------------------------------------------+
| Descripcion:                                                        |
| El uso de CPU ha alcanzado el 98% en el servidor backend principal  |
| durante los ultimos 15 minutos. Se recomienda investigar procesos.  |
+--------------------------------------------------------------------+
| Sistema:       backend         | Modulo:    gamification           |
| Usuarios Afectados: 150        | Disparada: 2025-11-24 14:30:00    |
+--------------------------------------------------------------------+
| Contexto:                                                           |
| { "server": "prod-01", "avg_cpu": 0.98, "process": "node" }        |
+--------------------------------------------------------------------+
| Metricas:                                                           |
| { "cpu_usage": 0.98, "memory_usage": 0.75, "disk_io": 0.45 }       |
+--------------------------------------------------------------------+
|                    [Acknowledge]  [Resolver]  [Suprimir]  [Cerrar] |
+--------------------------------------------------------------------+
```

---

## Archivos de Implementacion

### Backend

| Archivo | Ubicacion | Descripcion |
|---------|-----------|-------------|
| `admin-alerts.controller.ts` | `modules/admin/controllers/` | Controlador REST (7 endpoints) |
| `admin-alerts.service.ts` | `modules/admin/services/` | Servicio con logica de negocio |
| `list-alerts.dto.ts` | `modules/admin/dto/alerts/` | DTO para filtros + enums |
| `create-alert.dto.ts` | `modules/admin/dto/alerts/` | DTO para crear alerta manual |
| `acknowledge-alert.dto.ts` | `modules/admin/dto/alerts/` | DTO para acknowledge |
| `resolve-alert.dto.ts` | `modules/admin/dto/alerts/` | DTO para resolver |
| `alert-response.dto.ts` | `modules/admin/dto/alerts/` | DTO de respuesta |
| `alerts-stats.dto.ts` | `modules/admin/dto/alerts/` | DTO de estadisticas |
| `paginated-alerts.dto.ts` | `modules/admin/dto/alerts/` | DTO paginado |
| `system-alert.entity.ts` | `modules/admin/entities/` | Entity TypeORM |

### Frontend

| Archivo | Ubicacion | Descripcion |
|---------|-----------|-------------|
| `AdminAlertsPage.tsx` | `apps/admin/pages/` | Pagina principal de gestion |
| `useAlerts.ts` | `apps/admin/hooks/` | Hook con logica de negocio y estado |
| `AlertsStats.tsx` | `apps/admin/components/alerts/` | Tarjetas de estadisticas |
| `AlertFilters.tsx` | `apps/admin/components/alerts/` | Filtros avanzados |
| `AlertsList.tsx` | `apps/admin/components/alerts/` | Lista con paginacion |
| `AlertCard.tsx` | `apps/admin/components/alerts/` | Tarjeta individual |
| `AlertDetailsModal.tsx` | `apps/admin/components/alerts/` | Modal de detalles |
| `AcknowledgeAlertModal.tsx` | `apps/admin/components/alerts/` | Modal para acknowledge |
| `ResolveAlertModal.tsx` | `apps/admin/components/alerts/` | Modal para resolver |

### Base de Datos

| Schema | Tabla | Descripcion |
|--------|-------|-------------|
| `audit_logging` | `system_alerts` | Tabla de alertas del sistema |

---

## Definicion de Hecho (DoD)

- [x] 7 endpoints implementados en backend
- [x] Guards JwtAuthGuard y AdminGuard aplicados
- [x] DTOs con validacion completa
- [x] Entity SystemAlert creada
- [x] Frontend: AdminAlertsPage con componentes completos
- [x] Hook useAlerts con todas las operaciones
- [x] Modales para acknowledge, resolve y detalles
- [x] Componente de estadisticas con metricas
- [x] Filtros avanzados funcionales
- [x] Paginacion funcionando
- [x] Documentacion API en Swagger
- [x] Manejo de errores con feedback visual

---

## Notas de Implementacion

### Ordenamiento de Alertas
Las alertas se ordenan primero por severidad (critical > high > medium > low) y luego por `triggered_at` descendente (mas recientes primero).

### Validaciones de Estado
- Solo se puede hacer acknowledge de alertas en estado `open`
- Solo se puede resolver alertas en estado `open` o `acknowledged`
- Suprimir se puede hacer desde cualquier estado

### Nota de Resolucion
La nota de resolucion es obligatoria y debe tener minimo 10 caracteres para asegurar documentacion adecuada.

### Confirmacion de Supresion
El frontend solicita confirmacion via dialog nativo antes de suprimir una alerta para evitar acciones accidentales.

---

## Referencias

- **Controller:** `apps/backend/src/modules/admin/controllers/admin-alerts.controller.ts`
- **Service:** `apps/backend/src/modules/admin/services/admin-alerts.service.ts`
- **Entity:** `apps/backend/src/modules/admin/entities/system-alert.entity.ts`
- **Page:** `apps/frontend/src/apps/admin/pages/AdminAlertsPage.tsx`
- **DDL:** `apps/database/ddl/schemas/audit_logging/tables/system_alerts.sql`

---

**Creado:** 2025-11-24
**Documentado:** 2026-01-20
**Autor:** @Frontend-Developer Agent, @Backend-Developer Agent
**Relacionado con:** EXT-002, US-AE-004 (System Monitoring)
