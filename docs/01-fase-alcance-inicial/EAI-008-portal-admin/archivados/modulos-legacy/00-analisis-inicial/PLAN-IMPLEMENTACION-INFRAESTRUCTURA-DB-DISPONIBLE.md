# PLAN DE IMPLEMENTACIÓN: INFRAESTRUCTURA DB DISPONIBLE

**Fecha:** 2025-11-24
**Analista:** Architecture-Analyst
**Objetivo:** Aprovechar la infraestructura de base de datos ya implementada
**Versión:** 1.0

---

## 🎯 RESUMEN EJECUTIVO

Este documento detalla los planes de implementación para funcionalidades del Portal de Admin que **YA TIENEN SOPORTE COMPLETO O PARCIAL EN BASE DE DATOS** pero no están completamente aprovechadas en frontend/backend.

### Funcionalidades Priorizadas

| # | Funcionalidad | Estado DB | Complejidad | Prioridad | Esfuerzo Estimado |
|---|--------------|-----------|-------------|-----------|-------------------|
| 1 | **Alertas** | ✅ 100% Completo | BAJA | P0 | 2-3 días |
| 2 | **Analíticas** | ✅ 100% Completo | BAJA | P0 | 3-4 días |
| 3 | **Progreso** | ⚠️ 80% Completo | MEDIA | P1 | 4-5 días |
| 4 | **Monitoreo (tabs faltantes)** | ✅ 90% Completo | MEDIA | P1 | 3-4 días |

**Total Esfuerzo:** 12-16 días de desarrollo

---

## 📋 ÍNDICE DE PLANES

1. [Plan 1: Página de Alertas](#plan-1-página-de-alertas)
2. [Plan 2: Página de Analíticas](#plan-2-página-de-analíticas)
3. [Plan 3: Página de Progreso](#plan-3-página-de-progreso)
4. [Plan 4: Completar Monitoreo](#plan-4-completar-monitoreo)
5. [Resumen de Dependencias](#resumen-de-dependencias)
6. [Orden de Implementación Recomendado](#orden-de-implementación-recomendado)

---

## PLAN 1: PÁGINA DE ALERTAS

### 📊 Estado Actual

**Infraestructura DB:**
- ✅ Tabla `audit_logging.system_alerts` - **100% COMPLETA**
- ✅ Índices optimizados para queries frecuentes
- ✅ RLS implementado
- ✅ Triggers para updated_at

**Backend:**
- ✅ `GET /admin/dashboard/alerts` - Obtener alertas activas (ya existe)
- ❌ Endpoints faltantes: create, acknowledge, resolve, suppress

**Frontend:**
- ❌ No hay página dedicada
- ⚠️ Alertas se muestran solo en Dashboard

**Complejidad:** BAJA
**Esfuerzo:** 2-3 días
**Prioridad:** P0

---

### 🎯 Objetivos de Implementación

1. Crear página completa de gestión de alertas
2. Implementar endpoints CRUD para alertas
3. Sistema de filtros y búsqueda
4. Funcionalidad de acknowledge/resolve
5. Vistas por severidad y estado

---

### 🗂️ Estructura de Base de Datos (YA DISPONIBLE)

```sql
-- Tabla: audit_logging.system_alerts
CREATE TABLE audit_logging.system_alerts (
    id uuid PRIMARY KEY,
    tenant_id uuid,
    alert_type text NOT NULL,           -- performance_degradation, high_error_rate, security_breach, etc.
    severity text NOT NULL,             -- low, medium, high, critical
    title text NOT NULL,
    description text,
    source_system text,
    source_module text,
    error_code text,
    affected_users integer DEFAULT 0,
    status text DEFAULT 'open',         -- open, acknowledged, resolved, suppressed
    acknowledgment_note text,
    resolution_note text,
    acknowledged_by uuid,
    acknowledged_at timestamp,
    resolved_by uuid,
    resolved_at timestamp,
    notification_sent boolean DEFAULT false,
    escalation_level integer DEFAULT 1, -- 1-5
    auto_resolve boolean DEFAULT false,
    suppress_similar boolean DEFAULT false,
    context_data jsonb DEFAULT '{}',
    metrics jsonb DEFAULT '{}',
    related_alerts uuid[],
    triggered_at timestamp,
    created_at timestamp,
    updated_at timestamp
);

-- Índices disponibles:
-- idx_alerts_open (status, severity) WHERE status = 'open'
-- idx_alerts_severity (severity)
-- idx_alerts_status (status)
-- idx_alerts_triggered (triggered_at DESC)
-- idx_alerts_type (alert_type)
```

**Tipos de Alertas Soportados:**
- `performance_degradation` - Degradación de rendimiento
- `high_error_rate` - Tasa alta de errores
- `security_breach` - Brecha de seguridad
- `resource_limit` - Límite de recursos
- `service_outage` - Caída de servicio
- `data_anomaly` - Anomalía en datos

**Estados Posibles:**
- `open` - Abierta (requiere atención)
- `acknowledged` - Reconocida (en proceso)
- `resolved` - Resuelta
- `suppressed` - Suprimida

---

### 🔧 BACKEND: Endpoints a Implementar

#### 1. Listar Alertas con Filtros

```typescript
// apps/backend/src/modules/admin/controllers/admin-alerts.controller.ts

@Controller('admin/alerts')
@UseGuards(JwtAuthGuard, AdminGuard)
@ApiBearerAuth()
export class AdminAlertsController {

  @Get()
  @ApiOperation({ summary: 'List system alerts with filters' })
  async listAlerts(
    @Query() query: ListAlertsDto
  ): Promise<PaginatedAlertsDto> {
    // Query params: severity, status, alert_type, date_from, date_to, page, limit
  }
}
```

**DTO: ListAlertsDto**
```typescript
// apps/backend/src/modules/admin/dto/alerts/list-alerts.dto.ts

export class ListAlertsDto {
  @IsOptional()
  @IsEnum(['low', 'medium', 'high', 'critical'])
  severity?: string;

  @IsOptional()
  @IsEnum(['open', 'acknowledged', 'resolved', 'suppressed'])
  status?: string;

  @IsOptional()
  @IsString()
  alert_type?: string;

  @IsOptional()
  @IsDateString()
  date_from?: string;

  @IsOptional()
  @IsDateString()
  date_to?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}
```

**SQL Query (en Service):**
```sql
SELECT
  a.*,
  ack_user.display_name as acknowledged_by_name,
  res_user.display_name as resolved_by_name
FROM audit_logging.system_alerts a
LEFT JOIN auth_management.profiles ack_user ON a.acknowledged_by = ack_user.id
LEFT JOIN auth_management.profiles res_user ON a.resolved_by = res_user.id
WHERE
  ($1::text IS NULL OR a.severity = $1) AND
  ($2::text IS NULL OR a.status = $2) AND
  ($3::text IS NULL OR a.alert_type = $3) AND
  ($4::timestamp IS NULL OR a.triggered_at >= $4) AND
  ($5::timestamp IS NULL OR a.triggered_at <= $5)
ORDER BY
  CASE a.severity
    WHEN 'critical' THEN 1
    WHEN 'high' THEN 2
    WHEN 'medium' THEN 3
    WHEN 'low' THEN 4
  END,
  a.triggered_at DESC
LIMIT $6 OFFSET $7;
```

---

#### 2. Obtener Alerta por ID

```typescript
@Get(':id')
@ApiOperation({ summary: 'Get alert by ID' })
async getAlert(
  @Param('id', ParseUUIDPipe) id: string
): Promise<AlertDto> {
  // Incluir alertas relacionadas y métricas
}
```

**SQL Query:**
```sql
SELECT
  a.*,
  ack_user.display_name as acknowledged_by_name,
  ack_user.email as acknowledged_by_email,
  res_user.display_name as resolved_by_name,
  res_user.email as resolved_by_email
FROM audit_logging.system_alerts a
LEFT JOIN auth_management.profiles ack_user ON a.acknowledged_by = ack_user.id
LEFT JOIN auth_management.profiles res_user ON a.resolved_by = res_user.id
WHERE a.id = $1;
```

---

#### 3. Crear Alerta Manual

```typescript
@Post()
@ApiOperation({ summary: 'Create manual alert' })
async createAlert(
  @Body() createDto: CreateAlertDto,
  @CurrentUser() user: User
): Promise<AlertDto> {
  // Crear alerta manual (ej: admin detecta problema)
}
```

**DTO: CreateAlertDto**
```typescript
export class CreateAlertDto {
  @IsEnum(['performance_degradation', 'high_error_rate', 'security_breach',
           'resource_limit', 'service_outage', 'data_anomaly'])
  alert_type: string;

  @IsEnum(['low', 'medium', 'high', 'critical'])
  severity: string;

  @IsString()
  @MinLength(5)
  @MaxLength(200)
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsOptional()
  @IsString()
  source_system?: string;

  @IsOptional()
  @IsString()
  source_module?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  affected_users?: number;

  @IsOptional()
  @IsObject()
  context_data?: Record<string, any>;

  @IsOptional()
  @IsObject()
  metrics?: Record<string, any>;
}
```

**SQL Insert:**
```sql
INSERT INTO audit_logging.system_alerts (
  tenant_id, alert_type, severity, title, description,
  source_system, source_module, affected_users,
  context_data, metrics, triggered_at
) VALUES (
  $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW()
)
RETURNING *;
```

---

#### 4. Acknowledge Alerta

```typescript
@Patch(':id/acknowledge')
@ApiOperation({ summary: 'Acknowledge alert' })
async acknowledgeAlert(
  @Param('id', ParseUUIDPipe) id: string,
  @Body() ackDto: AcknowledgeAlertDto,
  @CurrentUser() user: User
): Promise<AlertDto> {
  // Cambiar estado a 'acknowledged'
}
```

**DTO: AcknowledgeAlertDto**
```typescript
export class AcknowledgeAlertDto {
  @IsOptional()
  @IsString()
  @MaxLength(500)
  acknowledgment_note?: string;
}
```

**SQL Update:**
```sql
UPDATE audit_logging.system_alerts
SET
  status = 'acknowledged',
  acknowledgment_note = $1,
  acknowledged_by = $2,
  acknowledged_at = NOW(),
  updated_at = NOW()
WHERE id = $3 AND status = 'open'
RETURNING *;
```

---

#### 5. Resolver Alerta

```typescript
@Patch(':id/resolve')
@ApiOperation({ summary: 'Resolve alert' })
async resolveAlert(
  @Param('id', ParseUUIDPipe) id: string,
  @Body() resolveDto: ResolveAlertDto,
  @CurrentUser() user: User
): Promise<AlertDto> {
  // Cambiar estado a 'resolved'
}
```

**DTO: ResolveAlertDto**
```typescript
export class ResolveAlertDto {
  @IsString()
  @MinLength(10)
  @MaxLength(1000)
  resolution_note: string;
}
```

**SQL Update:**
```sql
UPDATE audit_logging.system_alerts
SET
  status = 'resolved',
  resolution_note = $1,
  resolved_by = $2,
  resolved_at = NOW(),
  updated_at = NOW()
WHERE id = $3 AND status IN ('open', 'acknowledged')
RETURNING *;
```

---

#### 6. Suprimir Alerta

```typescript
@Patch(':id/suppress')
@ApiOperation({ summary: 'Suppress alert' })
async suppressAlert(
  @Param('id', ParseUUIDPipe) id: string,
  @CurrentUser() user: User
): Promise<AlertDto> {
  // Cambiar estado a 'suppressed' (silenciar)
}
```

**SQL Update:**
```sql
UPDATE audit_logging.system_alerts
SET
  status = 'suppressed',
  updated_at = NOW()
WHERE id = $1 AND status = 'open'
RETURNING *;
```

---

#### 7. Obtener Estadísticas de Alertas

```typescript
@Get('stats/summary')
@ApiOperation({ summary: 'Get alerts statistics' })
async getAlertsStats(): Promise<AlertsStatsDto> {
  // Estadísticas por severidad, tipo, estado
}
```

**SQL Query:**
```sql
SELECT
  COUNT(*) as total_alerts,
  COUNT(*) FILTER (WHERE status = 'open') as open_alerts,
  COUNT(*) FILTER (WHERE status = 'acknowledged') as acknowledged_alerts,
  COUNT(*) FILTER (WHERE status = 'resolved') as resolved_alerts,
  COUNT(*) FILTER (WHERE severity = 'critical') as critical_alerts,
  COUNT(*) FILTER (WHERE severity = 'high') as high_alerts,
  COUNT(*) FILTER (WHERE severity = 'medium') as medium_alerts,
  COUNT(*) FILTER (WHERE severity = 'low') as low_alerts,
  COUNT(*) FILTER (WHERE triggered_at >= NOW() - INTERVAL '24 hours') as alerts_24h,
  COUNT(*) FILTER (WHERE triggered_at >= NOW() - INTERVAL '7 days') as alerts_7d,
  AVG(EXTRACT(EPOCH FROM (resolved_at - triggered_at))/3600)
    FILTER (WHERE resolved_at IS NOT NULL) as avg_resolution_time_hours
FROM audit_logging.system_alerts
WHERE triggered_at >= NOW() - INTERVAL '30 days';
```

---

### 🎨 FRONTEND: Componentes a Implementar

#### Estructura de Archivos

```
apps/frontend/src/apps/admin/
├── pages/
│   └── AdminAlertsPage.tsx           [NUEVO]
├── components/
│   └── alerts/                       [NUEVO]
│       ├── AlertsList.tsx
│       ├── AlertCard.tsx
│       ├── AlertFilters.tsx
│       ├── AlertDetailsModal.tsx
│       ├── AcknowledgeAlertModal.tsx
│       ├── ResolveAlertModal.tsx
│       └── AlertsStats.tsx
└── hooks/
    └── useAlerts.ts                  [NUEVO]
```

---

#### 1. AdminAlertsPage.tsx

```typescript
// apps/frontend/src/apps/admin/pages/AdminAlertsPage.tsx

import { useState } from 'react';
import { useAuth } from '@features/auth/hooks/useAuth';
import { AdminLayout } from '../layouts/AdminLayout';
import { useAlerts } from '../hooks/useAlerts';
import { AlertsList } from '../components/alerts/AlertsList';
import { AlertFilters } from '../components/alerts/AlertFilters';
import { AlertsStats } from '../components/alerts/AlertsStats';
import { AlertDetailsModal } from '../components/alerts/AlertDetailsModal';
import { AcknowledgeAlertModal } from '../components/alerts/AcknowledgeAlertModal';
import { ResolveAlertModal } from '../components/alerts/ResolveAlertModal';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function AdminAlertsPage() {
  const { user, logout } = useAuth();
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [acknowledgeModalOpen, setAcknowledgeModalOpen] = useState(false);
  const [resolveModalOpen, setResolveModalOpen] = useState(false);

  // Hook para gestión de alertas
  const {
    alerts,
    stats,
    filters,
    isLoading,
    error,
    setFilters,
    refreshAlerts,
    acknowledgeAlert,
    resolveAlert,
    suppressAlert,
    pagination,
  } = useAlerts();

  const gamificationData = {
    userId: user?.id || 'mock-admin-id',
    level: 20,
    totalXP: 5000,
    mlCoins: 2500,
    rank: 'Super Admin',
    achievements: ['admin_master', 'alert_manager'],
  };

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  const handleAlertClick = (alert: Alert) => {
    setSelectedAlert(alert);
    setDetailsModalOpen(true);
  };

  const handleAcknowledge = (alert: Alert) => {
    setSelectedAlert(alert);
    setAcknowledgeModalOpen(true);
  };

  const handleResolve = (alert: Alert) => {
    setSelectedAlert(alert);
    setResolveModalOpen(true);
  };

  return (
    <AdminLayout
      user={user || undefined}
      gamificationData={gamificationData}
      organizationName="GAMILIT Platform Admin"
      onLogout={handleLogout}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <AlertTriangle className="w-8 h-8 text-orange-500" />
              <h1 className="text-3xl font-bold text-detective-text">
                Alertas del Sistema
              </h1>
            </div>
            <p className="text-detective-text-secondary mt-1">
              Gestiona y monitorea alertas de seguridad, rendimiento y errores
            </p>
          </div>
          <button
            onClick={refreshAlerts}
            disabled={isLoading}
            className="px-4 py-2 bg-detective-orange text-white rounded-lg hover:bg-detective-orange/80 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 inline mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Actualizar
          </button>
        </div>

        {/* Stats Cards */}
        {stats && <AlertsStats stats={stats} />}

        {/* Filters */}
        <AlertFilters filters={filters} onFiltersChange={setFilters} />

        {/* Alerts List */}
        <AlertsList
          alerts={alerts}
          isLoading={isLoading}
          error={error}
          onAlertClick={handleAlertClick}
          onAcknowledge={handleAcknowledge}
          onResolve={handleResolve}
          onSuppress={suppressAlert}
          pagination={pagination}
        />

        {/* Modals */}
        <AlertDetailsModal
          alert={selectedAlert}
          isOpen={detailsModalOpen}
          onClose={() => setDetailsModalOpen(false)}
          onAcknowledge={() => {
            setDetailsModalOpen(false);
            handleAcknowledge(selectedAlert!);
          }}
          onResolve={() => {
            setDetailsModalOpen(false);
            handleResolve(selectedAlert!);
          }}
        />

        <AcknowledgeAlertModal
          alert={selectedAlert}
          isOpen={acknowledgeModalOpen}
          onClose={() => setAcknowledgeModalOpen(false)}
          onConfirm={async (note) => {
            await acknowledgeAlert(selectedAlert!.id, note);
            setAcknowledgeModalOpen(false);
          }}
        />

        <ResolveAlertModal
          alert={selectedAlert}
          isOpen={resolveModalOpen}
          onClose={() => setResolveModalOpen(false)}
          onConfirm={async (note) => {
            await resolveAlert(selectedAlert!.id, note);
            setResolveModalOpen(false);
          }}
        />
      </div>
    </AdminLayout>
  );
}
```

---

#### 2. Hook: useAlerts.ts

```typescript
// apps/frontend/src/apps/admin/hooks/useAlerts.ts

import { useState, useEffect, useCallback } from 'react';
import { adminAPI } from '@/services/api/adminAPI';

export interface AlertFilters {
  severity?: 'low' | 'medium' | 'high' | 'critical';
  status?: 'open' | 'acknowledged' | 'resolved' | 'suppressed';
  alert_type?: string;
  date_from?: string;
  date_to?: string;
}

export interface Alert {
  id: string;
  tenant_id?: string;
  alert_type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description?: string;
  source_system?: string;
  source_module?: string;
  error_code?: string;
  affected_users: number;
  status: 'open' | 'acknowledged' | 'resolved' | 'suppressed';
  acknowledgment_note?: string;
  resolution_note?: string;
  acknowledged_by?: string;
  acknowledged_by_name?: string;
  acknowledged_at?: string;
  resolved_by?: string;
  resolved_by_name?: string;
  resolved_at?: string;
  context_data?: Record<string, any>;
  metrics?: Record<string, any>;
  triggered_at: string;
  created_at: string;
  updated_at: string;
}

export interface AlertsStats {
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

export function useAlerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [stats, setStats] = useState<AlertsStats | null>(null);
  const [filters, setFilters] = useState<AlertFilters>({ status: 'open' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  const fetchAlerts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await adminAPI.alerts.list({
        ...filters,
        page: pagination.page,
        limit: pagination.limit,
      });
      setAlerts(response.data);
      setPagination(response.pagination);
    } catch (err: any) {
      setError(err.message || 'Error al cargar alertas');
    } finally {
      setIsLoading(false);
    }
  }, [filters, pagination.page, pagination.limit]);

  const fetchStats = useCallback(async () => {
    try {
      const response = await adminAPI.alerts.getStats();
      setStats(response.data);
    } catch (err: any) {
      console.error('Error fetching alerts stats:', err);
    }
  }, []);

  useEffect(() => {
    fetchAlerts();
    fetchStats();
  }, [fetchAlerts, fetchStats]);

  const refreshAlerts = useCallback(() => {
    fetchAlerts();
    fetchStats();
  }, [fetchAlerts, fetchStats]);

  const acknowledgeAlert = useCallback(async (id: string, note?: string) => {
    try {
      await adminAPI.alerts.acknowledge(id, { acknowledgment_note: note });
      await refreshAlerts();
    } catch (err: any) {
      throw new Error(err.message || 'Error al reconocer alerta');
    }
  }, [refreshAlerts]);

  const resolveAlert = useCallback(async (id: string, note: string) => {
    try {
      await adminAPI.alerts.resolve(id, { resolution_note: note });
      await refreshAlerts();
    } catch (err: any) {
      throw new Error(err.message || 'Error al resolver alerta');
    }
  }, [refreshAlerts]);

  const suppressAlert = useCallback(async (id: string) => {
    try {
      await adminAPI.alerts.suppress(id);
      await refreshAlerts();
    } catch (err: any) {
      throw new Error(err.message || 'Error al suprimir alerta');
    }
  }, [refreshAlerts]);

  return {
    alerts,
    stats,
    filters,
    isLoading,
    error,
    pagination,
    setFilters,
    refreshAlerts,
    acknowledgeAlert,
    resolveAlert,
    suppressAlert,
  };
}
```

---

#### 3. Componente: AlertsStats.tsx

```typescript
// apps/frontend/src/apps/admin/components/alerts/AlertsStats.tsx

import { AlertsStats as IAlertsSt ats } from '../../hooks/useAlerts';
import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import { AlertTriangle, CheckCircle, Clock, AlertCircle } from 'lucide-react';

interface AlertsStatsProps {
  stats: IAlertsStats;
}

export function AlertsStats({ stats }: AlertsStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <DetectiveCard hoverable={false}>
        <div className="text-center">
          <AlertTriangle className="w-10 h-10 text-red-500 mx-auto mb-2" />
          <p className="text-sm text-detective-text-secondary mb-1">Alertas Abiertas</p>
          <p className="text-3xl font-bold text-red-500">{stats.open_alerts}</p>
          <p className="text-xs text-detective-text-secondary mt-1">
            {stats.critical_alerts} críticas
          </p>
        </div>
      </DetectiveCard>

      <DetectiveCard hoverable={false}>
        <div className="text-center">
          <Clock className="w-10 h-10 text-orange-500 mx-auto mb-2" />
          <p className="text-sm text-detective-text-secondary mb-1">Reconocidas</p>
          <p className="text-3xl font-bold text-orange-500">{stats.acknowledged_alerts}</p>
          <p className="text-xs text-detective-text-secondary mt-1">En proceso</p>
        </div>
      </DetectiveCard>

      <DetectiveCard hoverable={false}>
        <div className="text-center">
          <CheckCircle className="w-10 h-10 text-green-500 mx-auto mb-2" />
          <p className="text-sm text-detective-text-secondary mb-1">Resueltas</p>
          <p className="text-3xl font-bold text-green-500">{stats.resolved_alerts}</p>
          <p className="text-xs text-detective-text-secondary mt-1">
            Últimas 30 días
          </p>
        </div>
      </DetectiveCard>

      <DetectiveCard hoverable={false}>
        <div className="text-center">
          <AlertCircle className="w-10 h-10 text-blue-500 mx-auto mb-2" />
          <p className="text-sm text-detective-text-secondary mb-1">Tiempo Promedio</p>
          <p className="text-3xl font-bold text-blue-500">
            {stats.avg_resolution_time_hours?.toFixed(1) || '0'}h
          </p>
          <p className="text-xs text-detective-text-secondary mt-1">De resolución</p>
        </div>
      </DetectiveCard>
    </div>
  );
}
```

---

### 📝 Checklist de Implementación

#### Backend

- [ ] **Crear controller** `AdminAlertsController`
- [ ] **Crear service** `AdminAlertsService`
- [ ] **Crear DTOs:**
  - [ ] `ListAlertsDto` (query params)
  - [ ] `CreateAlertDto`
  - [ ] `AcknowledgeAlertDto`
  - [ ] `ResolveAlertDto`
  - [ ] `AlertDto` (response)
  - [ ] `PaginatedAlertsDto`
  - [ ] `AlertsStatsDto`
- [ ] **Implementar endpoints:**
  - [ ] `GET /admin/alerts` - Listar con filtros
  - [ ] `GET /admin/alerts/:id` - Obtener por ID
  - [ ] `POST /admin/alerts` - Crear alerta manual
  - [ ] `PATCH /admin/alerts/:id/acknowledge`
  - [ ] `PATCH /admin/alerts/:id/resolve`
  - [ ] `PATCH /admin/alerts/:id/suppress`
  - [ ] `GET /admin/alerts/stats/summary`
- [ ] **Agregar validaciones** con class-validator
- [ ] **Documentar con Swagger** (@ApiOperation, @ApiResponse)
- [ ] **Tests unitarios** del service
- [ ] **Tests E2E** de endpoints

#### Frontend

- [ ] **Crear página** `AdminAlertsPage.tsx`
- [ ] **Crear hook** `useAlerts.ts`
- [ ] **Crear componentes:**
  - [ ] `AlertsList.tsx` - Lista de alertas
  - [ ] `AlertCard.tsx` - Card individual
  - [ ] `AlertFilters.tsx` - Filtros de búsqueda
  - [ ] `AlertDetailsModal.tsx` - Modal de detalles
  - [ ] `AcknowledgeAlertModal.tsx` - Modal acknowledging
  - [ ] `ResolveAlertModal.tsx` - Modal resolución
  - [ ] `AlertsStats.tsx` - Estadísticas
- [ ] **Actualizar API client** `adminAPI.ts`
- [ ] **Agregar ruta** en router de admin
- [ ] **Agregar enlace** en sidebar de AdminLayout
- [ ] **Tests** con React Testing Library

#### Integración

- [ ] **Smoke test** de página completa
- [ ] **Validar paginación** y filtros
- [ ] **Validar flujo completo:**
  - [ ] Crear alerta
  - [ ] Filtrar por severidad
  - [ ] Acknowledge alerta
  - [ ] Resolver alerta
  - [ ] Ver estadísticas
- [ ] **Probar con diferentes roles** (RLS)
- [ ] **Validar performance** con 1000+ alertas

---

### 🚀 Orden de Implementación Sugerido

1. **Día 1 - Backend Básico:**
   - DTOs y entidades
   - Service con lógica de negocio
   - Endpoints GET (listar, obtener por ID)
   - Endpoint POST (crear alerta)

2. **Día 2 - Backend Avanzado:**
   - Endpoints PATCH (acknowledge, resolve, suppress)
   - Endpoint GET /stats
   - Tests unitarios y E2E

3. **Día 3 - Frontend Estructura:**
   - Página principal
   - Hook useAlerts
   - API client
   - Componentes básicos (lista, card, stats)

4. **Día 4 - Frontend Avanzado:**
   - Modales (detalles, acknowledge, resolve)
   - Filtros avanzados
   - Paginación
   - Integración completa

---

### 📊 Criterios de Aceptación

1. ✅ Admin puede ver lista paginada de alertas
2. ✅ Admin puede filtrar por severidad, estado, tipo
3. ✅ Admin puede ver detalles completos de una alerta
4. ✅ Admin puede crear alertas manuales
5. ✅ Admin puede acknowledge alertas (cambio de estado + nota)
6. ✅ Admin puede resolver alertas (cambio de estado + nota obligatoria)
7. ✅ Admin puede suprimir alertas
8. ✅ Dashboard de estadísticas muestra:
   - Alertas abiertas
   - Alertas reconocidas
   - Alertas resueltas
   - Tiempo promedio de resolución
9. ✅ Alertas críticas se destacan visualmente
10. ✅ Performance: Listado de 1000 alertas en <500ms

---

## PLAN 2: PÁGINA DE ANALÍTICAS

### 📊 Estado Actual

**Infraestructura DB:**
- ✅ Vista materializada `admin_dashboard.user_analytics_mv` - **100% COMPLETA**
- ✅ Vista `admin_dashboard.user_stats_summary` - **100% COMPLETA**
- ✅ Vista `admin_dashboard.organization_stats_summary` - **100% COMPLETA**
- ✅ Función `admin_dashboard.refresh_all_dashboards()` - Disponible

**Backend:**
- ✅ `GET /admin/dashboard/user-stats` - Estadísticas básicas
- ✅ `GET /admin/dashboard/organization-stats` - Estadísticas de organizaciones
- ✅ `GET /admin/dashboard/analytics/user-activity` - Análisis de actividad
- ⚠️ Faltan endpoints para analytics avanzados (engagement, retención, cohortes)

**Frontend:**
- ❌ No hay página dedicada de analíticas
- ⚠️ Analytics básicos se muestran solo en Dashboard

**Complejidad:** BAJA-MEDIA
**Esfuerzo:** 3-4 días
**Prioridad:** P0

---

### 🎯 Objetivos de Implementación

1. Crear página completa de analíticas con dashboards
2. Aprovechar vistas materializadas existentes
3. Analíticas de usuarios (engagement, actividad, progreso)
4. Analíticas de contenido (ejercicios más populares, completación)
5. Analíticas de gamificación (XP distribution, rangos)
6. Exportación de datos a CSV/Excel

---

### 🗂️ Estructura de Base de Datos (YA DISPONIBLE)

```sql
-- Vista Materializada: admin_dashboard.user_analytics_mv
CREATE MATERIALIZED VIEW admin_dashboard.user_analytics_mv AS
SELECT
    p.id as user_id,
    p.display_name,
    p.email,
    ur.role,
    p.tenant_id,
    p.status,
    p.created_at as registered_at,

    -- Gamification stats
    COALESCE(us.total_xp, 0) as total_xp,
    COALESCE(us.current_level, 1) as current_level,
    COALESCE(us.current_rank::TEXT, 'ajaw') as current_rank,
    COALESCE(us.ml_coins_balance, 0) as ml_coins,

    -- Activity metrics
    COALESCE(us.total_exercises_completed, 0) as exercises_completed,
    COALESCE(us.total_missions_completed, 0) as missions_completed,
    COALESCE(us.current_streak_days, 0) as current_streak,
    us.last_activity_at,

    -- Engagement score (0-100)
    LEAST(100, (
        COALESCE(us.total_exercises_completed, 0) * 2 +
        COALESCE(us.total_missions_completed, 0) * 10 +
        COALESCE(us.current_streak_days, 0) * 5
    )) as engagement_score,

    -- User segment
    CASE
        WHEN COALESCE(us.total_exercises_completed, 0) = 0 THEN 'inactive'
        WHEN COALESCE(us.total_exercises_completed, 0) < 5 THEN 'beginner'
        WHEN COALESCE(us.total_exercises_completed, 0) < 20 THEN 'intermediate'
        ELSE 'advanced'
    END as user_segment
FROM auth_management.profiles p
LEFT JOIN auth_management.user_roles ur ON p.id = ur.user_id
LEFT JOIN gamification_system.user_stats us ON p.id = us.user_id;

-- Índice para performance
CREATE UNIQUE INDEX idx_user_analytics_mv_user
    ON admin_dashboard.user_analytics_mv(user_id);
CREATE INDEX idx_user_analytics_mv_role
    ON admin_dashboard.user_analytics_mv(role);
CREATE INDEX idx_user_analytics_mv_segment
    ON admin_dashboard.user_analytics_mv(user_segment);
```

**Datos Disponibles:**
- Información de usuario (ID, nombre, email, rol)
- Gamificación (XP, nivel, rango, ML Coins)
- Actividad (ejercicios completados, misiones, rachas)
- Engagement score (0-100)
- Segmento de usuario (inactive, beginner, intermediate, advanced)

**Refresh de Vista Materializada:**
```sql
-- Ejecutar periódicamente (cada 15-30 min)
REFRESH MATERIALIZED VIEW CONCURRENTLY admin_dashboard.user_analytics_mv;

-- O usar función helper
SELECT admin_dashboard.refresh_all_dashboards();
```

---

### 🔧 BACKEND: Endpoints a Implementar

#### 1. Analytics Overview

```typescript
@Get('analytics/overview')
@ApiOperation({ summary: 'Get analytics overview' })
async getAnalyticsOverview(): Promise<AnalyticsOverviewDto> {
  // Overview general de analytics
}
```

**SQL Query:**
```sql
SELECT
  COUNT(*) as total_users,
  COUNT(*) FILTER (WHERE role = 'student') as total_students,
  COUNT(*) FILTER (WHERE role = 'admin_teacher') as total_teachers,
  COUNT(*) FILTER (WHERE status = 'ACTIVE') as active_users,
  AVG(total_xp) as avg_xp,
  AVG(exercises_completed) as avg_exercises_completed,
  AVG(engagement_score) as avg_engagement_score,
  COUNT(*) FILTER (WHERE user_segment = 'inactive') as inactive_users,
  COUNT(*) FILTER (WHERE user_segment = 'beginner') as beginner_users,
  COUNT(*) FILTER (WHERE user_segment = 'intermediate') as intermediate_users,
  COUNT(*) FILTER (WHERE user_segment = 'advanced') as advanced_users
FROM admin_dashboard.user_analytics_mv;
```

---

#### 2. User Engagement Analytics

```typescript
@Get('analytics/engagement')
@ApiOperation({ summary: 'Get user engagement analytics' })
async getEngagementAnalytics(
  @Query() query: EngagementQueryDto
): Promise<EngagementAnalyticsDto> {
  // Analytics de engagement por segmento, rol, fecha
}
```

**SQL Query:**
```sql
SELECT
  user_segment,
  COUNT(*) as users_count,
  AVG(engagement_score) as avg_engagement_score,
  AVG(exercises_completed) as avg_exercises_completed,
  AVG(current_streak) as avg_streak,
  COUNT(*) FILTER (WHERE last_activity_at >= NOW() - INTERVAL '7 days') as active_last_7d,
  COUNT(*) FILTER (WHERE last_activity_at >= NOW() - INTERVAL '30 days') as active_last_30d
FROM admin_dashboard.user_analytics_mv
WHERE
  ($1::text IS NULL OR role = $1) AND
  ($2::timestamp IS NULL OR registered_at >= $2)
GROUP BY user_segment
ORDER BY
  CASE user_segment
    WHEN 'advanced' THEN 1
    WHEN 'intermediate' THEN 2
    WHEN 'beginner' THEN 3
    WHEN 'inactive' THEN 4
  END;
```

---

#### 3. Gamification Distribution

```typescript
@Get('analytics/gamification')
@ApiOperation({ summary: 'Get gamification distribution' })
async getGamificationAnalytics(): Promise<GamificationAnalyticsDto> {
  // Distribución de XP, niveles, rangos
}
```

**SQL Query:**
```sql
-- Distribución de XP
SELECT
  CASE
    WHEN total_xp = 0 THEN '0 XP'
    WHEN total_xp <= 100 THEN '1-100 XP'
    WHEN total_xp <= 500 THEN '101-500 XP'
    WHEN total_xp <= 1000 THEN '501-1000 XP'
    WHEN total_xp <= 5000 THEN '1001-5000 XP'
    ELSE '5000+ XP'
  END as xp_range,
  COUNT(*) as users_count
FROM admin_dashboard.user_analytics_mv
GROUP BY xp_range
ORDER BY MIN(total_xp);

-- Distribución de rangos Maya
SELECT
  current_rank,
  COUNT(*) as users_count,
  AVG(total_xp) as avg_xp,
  AVG(exercises_completed) as avg_exercises
FROM admin_dashboard.user_analytics_mv
GROUP BY current_rank
ORDER BY AVG(total_xp) DESC;

-- Distribución de niveles
SELECT
  current_level,
  COUNT(*) as users_count
FROM admin_dashboard.user_analytics_mv
GROUP BY current_level
ORDER BY current_level;
```

---

#### 4. Activity Timeline

```typescript
@Get('analytics/activity-timeline')
@ApiOperation({ summary: 'Get activity timeline (last 30 days)' })
async getActivityTimeline(
  @Query() query: TimelineQueryDto
): Promise<ActivityTimelineDto> {
  // Timeline de actividad de usuarios
}
```

**SQL Query:**
```sql
SELECT
  DATE(ual.created_at) as activity_date,
  COUNT(DISTINCT ual.user_id) as unique_users,
  COUNT(*) as total_activities,
  COUNT(*) FILTER (WHERE ual.activity_type = 'exercise_completed') as exercises_completed,
  COUNT(*) FILTER (WHERE ual.activity_type = 'module_completed') as modules_completed,
  COUNT(*) FILTER (WHERE ual.activity_type = 'login') as logins
FROM audit_logging.user_activity_logs ual
WHERE ual.created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(ual.created_at)
ORDER BY activity_date DESC;
```

---

#### 5. Top Users

```typescript
@Get('analytics/top-users')
@ApiOperation({ summary: 'Get top users by metric' })
async getTopUsers(
  @Query() query: TopUsersQueryDto
): Promise<TopUsersDto> {
  // Top usuarios por XP, ejercicios, racha, etc.
}
```

**SQL Query:**
```sql
-- Top por XP
SELECT *
FROM admin_dashboard.user_analytics_mv
WHERE role = $1
ORDER BY total_xp DESC
LIMIT $2;

-- Top por ejercicios completados
SELECT *
FROM admin_dashboard.user_analytics_mv
WHERE role = $1
ORDER BY exercises_completed DESC
LIMIT $2;

-- Top por racha actual
SELECT *
FROM admin_dashboard.user_analytics_mv
WHERE role = $1
ORDER BY current_streak DESC
LIMIT $2;
```

---

#### 6. Retention Analytics

```typescript
@Get('analytics/retention')
@ApiOperation({ summary: 'Get retention analytics' })
async getRetentionAnalytics(): Promise<RetentionAnalyticsDto> {
  // Analíticas de retención (nuevos usuarios vs activos)
}
```

**SQL Query:**
```sql
WITH cohorts AS (
  SELECT
    DATE_TRUNC('month', registered_at) as cohort_month,
    user_id
  FROM admin_dashboard.user_analytics_mv
  WHERE registered_at >= NOW() - INTERVAL '12 months'
),
activity AS (
  SELECT
    DATE_TRUNC('month', last_activity_at) as activity_month,
    user_id
  FROM admin_dashboard.user_analytics_mv
  WHERE last_activity_at IS NOT NULL
)
SELECT
  c.cohort_month,
  COUNT(DISTINCT c.user_id) as cohort_size,
  COUNT(DISTINCT CASE WHEN a.activity_month >= c.cohort_month THEN a.user_id END) as retained_users,
  ROUND(
    100.0 * COUNT(DISTINCT CASE WHEN a.activity_month >= c.cohort_month THEN a.user_id END) /
    NULLIF(COUNT(DISTINCT c.user_id), 0),
    2
  ) as retention_rate
FROM cohorts c
LEFT JOIN activity a ON c.user_id = a.user_id
GROUP BY c.cohort_month
ORDER BY c.cohort_month DESC;
```

---

#### 7. Export Analytics

```typescript
@Get('analytics/export')
@ApiOperation({ summary: 'Export analytics to CSV' })
async exportAnalytics(
  @Query() query: ExportQueryDto,
  @Res() res: Response
): Promise<void> {
  // Exportar datos a CSV
}
```

**Implementación:**
```typescript
async exportAnalytics(query: ExportQueryDto, res: Response): Promise<void> {
  const data = await this.analyticsService.getUserAnalytics(query);

  // Convertir a CSV
  const csv = this.convertToCSV(data);

  // Set headers
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="analytics-${Date.now()}.csv"`);

  res.send(csv);
}

private convertToCSV(data: any[]): string {
  if (data.length === 0) return '';

  // Headers
  const headers = Object.keys(data[0]).join(',');

  // Rows
  const rows = data.map(row =>
    Object.values(row).map(val =>
      typeof val === 'string' && val.includes(',') ? `"${val}"` : val
    ).join(',')
  );

  return [headers, ...rows].join('\n');
}
```

---

### 🎨 FRONTEND: Página de Analíticas

```typescript
// apps/frontend/src/apps/admin/pages/AdminAnalyticsPage.tsx

import { useState, useEffect } from 'react';
import { useAuth } from '@features/auth/hooks/useAuth';
import { AdminLayout } from '../layouts/AdminLayout';
import { useAnalytics } from '../hooks/useAnalytics';
import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import { DetectiveButton } from '@shared/components/base/DetectiveButton';
import {
  TrendingUp,
  Users,
  Activity,
  Award,
  Download,
  RefreshCw,
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export default function AdminAnalyticsPage() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'engagement' | 'gamification' | 'retention'>('overview');

  const {
    overview,
    engagement,
    gamification,
    activityTimeline,
    topUsers,
    retention,
    isLoading,
    error,
    refresh,
    exportToCSV,
  } = useAnalytics();

  const gamificationData = {
    userId: user?.id || 'mock-admin-id',
    level: 20,
    totalXP: 5000,
    mlCoins: 2500,
    rank: 'Super Admin',
    achievements: ['admin_master', 'analytics_expert'],
  };

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8'];

  return (
    <AdminLayout
      user={user || undefined}
      gamificationData={gamificationData}
      organizationName="GAMILIT Platform Admin"
      onLogout={handleLogout}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-8 h-8 text-blue-500" />
              <h1 className="text-3xl font-bold text-detective-text">
                Analíticas del Sistema
              </h1>
            </div>
            <p className="text-detective-text-secondary mt-1">
              Análisis de usuarios, engagement, gamificación y retención
            </p>
          </div>
          <div className="flex gap-3">
            <DetectiveButton
              variant="secondary"
              onClick={exportToCSV}
              disabled={isLoading}
            >
              <Download className="w-5 h-5" />
              Exportar CSV
            </DetectiveButton>
            <DetectiveButton
              variant="primary"
              onClick={refresh}
              disabled={isLoading}
            >
              <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
              Actualizar
            </DetectiveButton>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
              activeTab === 'overview'
                ? 'bg-detective-orange text-white'
                : 'bg-detective-bg-secondary text-detective-text-secondary hover:bg-detective-bg-secondary/70'
            }`}
          >
            <Activity className="w-4 h-4 inline mr-2" />
            Overview
          </button>
          <button
            onClick={() => setActiveTab('engagement')}
            className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
              activeTab === 'engagement'
                ? 'bg-detective-orange text-white'
                : 'bg-detective-bg-secondary text-detective-text-secondary hover:bg-detective-bg-secondary/70'
            }`}
          >
            <Users className="w-4 h-4 inline mr-2" />
            Engagement
          </button>
          <button
            onClick={() => setActiveTab('gamification')}
            className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
              activeTab === 'gamification'
                ? 'bg-detective-orange text-white'
                : 'bg-detective-bg-secondary text-detective-text-secondary hover:bg-detective-bg-secondary/70'
            }`}
          >
            <Award className="w-4 h-4 inline mr-2" />
            Gamificación
          </button>
          <button
            onClick={() => setActiveTab('retention')}
            className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
              activeTab === 'retention'
                ? 'bg-detective-orange text-white'
                : 'bg-detective-bg-secondary text-detective-text-secondary hover:bg-detective-bg-secondary/70'
            }`}
          >
            <TrendingUp className="w-4 h-4 inline mr-2" />
            Retención
          </button>
        </div>

        {/* Content by Tab */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-detective-orange"></div>
            <p className="mt-4 text-detective-text-secondary">Cargando analíticas...</p>
          </div>
        )}

        {!isLoading && activeTab === 'overview' && overview && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <DetectiveCard hoverable={false}>
                <div className="text-center">
                  <Users className="w-10 h-10 text-blue-500 mx-auto mb-2" />
                  <p className="text-sm text-detective-text-secondary mb-1">Usuarios Totales</p>
                  <p className="text-3xl font-bold text-blue-500">{overview.total_users}</p>
                  <p className="text-xs text-green-500 mt-1">
                    {overview.active_users} activos
                  </p>
                </div>
              </DetectiveCard>

              <DetectiveCard hoverable={false}>
                <div className="text-center">
                  <Activity className="w-10 h-10 text-green-500 mx-auto mb-2" />
                  <p className="text-sm text-detective-text-secondary mb-1">Engagement Promedio</p>
                  <p className="text-3xl font-bold text-green-500">
                    {overview.avg_engagement_score?.toFixed(0)}%
                  </p>
                  <p className="text-xs text-detective-text-secondary mt-1">
                    De 100
                  </p>
                </div>
              </DetectiveCard>

              <DetectiveCard hoverable={false}>
                <div className="text-center">
                  <Award className="w-10 h-10 text-detective-gold mx-auto mb-2" />
                  <p className="text-sm text-detective-text-secondary mb-1">XP Promedio</p>
                  <p className="text-3xl font-bold text-detective-gold">
                    {overview.avg_xp?.toFixed(0)}
                  </p>
                  <p className="text-xs text-detective-text-secondary mt-1">
                    Por usuario
                  </p>
                </div>
              </DetectiveCard>

              <DetectiveCard hoverable={false}>
                <div className="text-center">
                  <TrendingUp className="w-10 h-10 text-purple-500 mx-auto mb-2" />
                  <p className="text-sm text-detective-text-secondary mb-1">Ejercicios Promedio</p>
                  <p className="text-3xl font-bold text-purple-500">
                    {overview.avg_exercises_completed?.toFixed(1)}
                  </p>
                  <p className="text-xs text-detective-text-secondary mt-1">
                    Completados
                  </p>
                </div>
              </DetectiveCard>
            </div>

            {/* User Segments Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <DetectiveCard>
                <h3 className="text-lg font-bold text-detective-text mb-4">
                  Distribución por Segmento
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Inactivos', value: overview.inactive_users },
                        { name: 'Principiantes', value: overview.beginner_users },
                        { name: 'Intermedios', value: overview.intermediate_users },
                        { name: 'Avanzados', value: overview.advanced_users },
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${entry.name}: ${entry.value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {[0, 1, 2, 3].map((index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </DetectiveCard>

              {/* Activity Timeline */}
              <DetectiveCard>
                <h3 className="text-lg font-bold text-detective-text mb-4">
                  Actividad (Últimos 30 días)
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={activityTimeline}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="activity_date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="unique_users"
                      stroke="#8884d8"
                      name="Usuarios Activos"
                    />
                    <Line
                      type="monotone"
                      dataKey="exercises_completed"
                      stroke="#82ca9d"
                      name="Ejercicios"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </DetectiveCard>
            </div>

            {/* Top Users */}
            <DetectiveCard>
              <h3 className="text-lg font-bold text-detective-text mb-4">
                Top 10 Usuarios (por XP)
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="px-4 py-2 text-left text-sm font-medium text-detective-text-secondary">#</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-detective-text-secondary">Usuario</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-detective-text-secondary">XP Total</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-detective-text-secondary">Nivel</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-detective-text-secondary">Rango</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-detective-text-secondary">Ejercicios</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topUsers.slice(0, 10).map((user, index) => (
                      <tr key={user.user_id} className="border-b border-gray-700">
                        <td className="px-4 py-2 text-sm text-detective-text">{index + 1}</td>
                        <td className="px-4 py-2 text-sm text-detective-text font-medium">
                          {user.display_name}
                        </td>
                        <td className="px-4 py-2 text-sm text-detective-gold font-bold">
                          {user.total_xp}
                        </td>
                        <td className="px-4 py-2 text-sm text-blue-400">
                          Nivel {user.current_level}
                        </td>
                        <td className="px-4 py-2 text-sm text-purple-400">
                          {user.current_rank}
                        </td>
                        <td className="px-4 py-2 text-sm text-green-400">
                          {user.exercises_completed}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </DetectiveCard>
          </div>
        )}

        {/* TODO: Implementar tabs de Engagement, Gamification, Retention */}
      </div>
    </AdminLayout>
  );
}
```

---

### 📝 Checklist de Implementación (Analytics)

#### Backend

- [ ] **Crear endpoints:**
  - [ ] `GET /admin/analytics/overview`
  - [ ] `GET /admin/analytics/engagement`
  - [ ] `GET /admin/analytics/gamification`
  - [ ] `GET /admin/analytics/activity-timeline`
  - [ ] `GET /admin/analytics/top-users`
  - [ ] `GET /admin/analytics/retention`
  - [ ] `GET /admin/analytics/export`
- [ ] **Crear DTOs** de request/response
- [ ] **Implementar service** con queries optimizadas
- [ ] **Documentar con Swagger**
- [ ] **Tests** unitarios y E2E

#### Frontend

- [ ] **Crear página** `AdminAnalyticsPage.tsx`
- [ ] **Crear hook** `useAnalytics.ts`
- [ ] **Implementar tabs:**
  - [ ] Overview con stats cards
  - [ ] Engagement con gráficos
  - [ ] Gamification con distribuciones
  - [ ] Retention con cohortes
- [ ] **Integrar Recharts** para visualizaciones
- [ ] **Exportación a CSV**
- [ ] **Tests**

#### Cron Job (Opcional)

- [ ] **Crear cron job** para refrescar MVs cada 15-30 min
- [ ] **Script:** `SELECT admin_dashboard.refresh_all_dashboards();`

---

[Continúa Plan 3 y Plan 4...]

---

## RESUMEN DE DEPENDENCIAS

### Dependencias de Paquetes

**Backend:**
- ✅ `@nestjs/common`, `@nestjs/core` (ya instalado)
- ✅ `class-validator`, `class-transformer` (ya instalado)
- ✅ `@nestjs/swagger` (ya instalado)
- ⚠️ Para exportación CSV: Ninguna adicional (implementar manualmente)

**Frontend:**
- ✅ `react`, `react-dom` (ya instalado)
- ✅ `react-query` (ya instalado)
- ⚠️ `recharts` - **INSTALAR** para gráficos (`npm install recharts`)
- ⚠️ Para exportación CSV: Ninguna adicional (usar Blob API)

---

## ORDEN DE IMPLEMENTACIÓN RECOMENDADO

### Semana 1: Alertas + Analíticas (Overview)

**Día 1-2: Alertas Backend**
- Backend completo de alertas
- Tests E2E

**Día 3-4: Alertas Frontend**
- Página completa de alertas
- Integración con backend

**Día 5: Analíticas Backend (Overview)**
- Endpoints básicos de analytics
- Aprovechar MVs existentes

### Semana 2: Analíticas (Completo) + Progreso (Inicio)

**Día 6-7: Analíticas Frontend**
- Página de analytics
- Gráficos con Recharts
- Exportación CSV

**Día 8-9: Progreso Backend**
- Endpoints de progreso
- Queries aprovechando vistas existentes

**Día 10: Progreso Frontend**
- Página básica de progreso

### Semana 3: Progreso (Completo) + Monitoreo

**Día 11-12: Completar Progreso**
- Página completa con todos los features

**Día 13-14: Completar Monitoreo**
- Tabs faltantes (Métricas, Error Tracking)

**Día 15-16: Testing e Integración**
- Tests completos
- Smoke testing de todas las páginas
- Ajustes finales

---

## 🎯 MÉTRICAS DE ÉXITO

| Métrica | Objetivo |
|---------|----------|
| **Páginas Nuevas** | 4 páginas completas (Alertas, Analíticas, Progreso completo, Monitoreo completo) |
| **Endpoints Nuevos** | 25-30 endpoints |
| **Performance** | Todas las queries <500ms |
| **Tests Coverage** | >80% en nuevo código |
| **Bugs Críticos** | 0 en producción |

---

**Documento generado por:** Architecture-Analyst
**Fecha:** 2025-11-24
**Versión:** 1.0
