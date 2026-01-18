# Arquitectura de Componentes de Alertas - Admin Portal

**Version:** 1.0.0
**Fecha:** 2025-12-18
**Modulo:** Admin Portal - Sistema de Alertas

---

## ESTRUCTURA GENERAL

```
apps/frontend/src/apps/admin/
├── hooks/
│   └── useAlerts.ts              # Hook principal
├── components/alerts/
│   ├── alertUtils.ts             # Utilidades compartidas
│   ├── AlertsStats.tsx           # Cards de estadisticas
│   ├── AlertFilters.tsx          # Panel de filtros
│   ├── AlertsList.tsx            # Lista paginada
│   ├── AlertCard.tsx             # Card individual
│   ├── AlertDetailsModal.tsx     # Modal de detalles
│   ├── AcknowledgeAlertModal.tsx # Modal reconocer
│   └── ResolveAlertModal.tsx     # Modal resolver
└── pages/
    └── AdminAlertsPage.tsx       # Pagina principal
```

---

## HOOK PRINCIPAL: useAlerts

**Ubicacion:** `hooks/useAlerts.ts`

### Proposito

Gestion completa del ciclo de vida de alertas:
- Fetch con filtros y paginacion
- Estadisticas en tiempo real
- Acciones de gestion (acknowledge, resolve, suppress)

### API Retornada

```typescript
const {
  // Data
  alerts,
  stats,
  selectedAlert,

  // Estado
  isLoading,
  isLoadingStats,
  error,

  // Filtros & Paginacion
  filters,
  setFilters,
  pagination,

  // Acciones
  fetchAlerts,
  fetchStats,
  refreshAlerts,
  acknowledgeAlert,
  resolveAlert,
  suppressAlert,
  nextPage,
  prevPage,
  goToPage
} = useAlerts();
```

### Pagination Object

```typescript
interface Pagination {
  page: number;
  totalPages: number;
  totalItems: number;
  limit: number;
}
```

### Validaciones de Acciones

| Accion | Validacion |
|--------|------------|
| acknowledgeAlert | Nota opcional |
| resolveAlert | Nota requerida (min 10 chars) |
| suppressAlert | Sin validacion adicional |

---

## UTILITY MODULE: alertUtils.ts

**Ubicacion:** `components/alerts/alertUtils.ts`

### Funciones Exportadas

#### getSeverityColor(severity) -> string

Retorna clases Tailwind con fondo solido para badges prominentes.

```typescript
getSeverityColor('critical'); // 'bg-red-500 text-white'
getSeverityColor('high');     // 'bg-orange-500 text-white'
getSeverityColor('medium');   // 'bg-yellow-500 text-black'
getSeverityColor('low');      // 'bg-blue-500 text-white'
```

#### getSeverityColorWithBorder(severity) -> string

Retorna clases con fondo transparente + borde para badges sutiles.

#### getStatusColor(status) -> string

```typescript
getStatusColor('open');         // Rojo con borde
getStatusColor('acknowledged'); // Naranja con borde
getStatusColor('resolved');     // Verde con borde
getStatusColor('suppressed');   // Gris con borde
```

#### getStatusTextColor(status) -> string

Solo colores de texto para etiquetas inline.

#### getSeverityLabel(severity) -> string

```typescript
getSeverityLabel('critical'); // 'Critica'
getSeverityLabel('high');     // 'Alta'
getSeverityLabel('medium');   // 'Media'
getSeverityLabel('low');      // 'Baja'
```

#### getStatusLabel(status) -> string

```typescript
getStatusLabel('open');         // 'Abierta'
getStatusLabel('acknowledged'); // 'Reconocida'
getStatusLabel('resolved');     // 'Resuelta'
getStatusLabel('suppressed');   // 'Suprimida'
```

#### formatAlertTimestamp(timestamp) -> string

Formato compacto para espacios limitados.

```typescript
formatAlertTimestamp(fecha); // 'Hace 5m', 'Hace 2h', 'Hace 3d', 'dic 15'
```

#### formatAlertTimestampDetailed(timestamp) -> string

Formato detallado para mas informacion.

```typescript
formatAlertTimestampDetailed(fecha); // 'Hace 5 min', 'Hace 2 horas'
```

---

## COMPONENTES

### 1. AlertsStats

**Ubicacion:** `components/alerts/AlertsStats.tsx`

**Props:**
```typescript
interface AlertsStatsProps {
  stats: AlertsStatsType | null;
  isLoading?: boolean;
}
```

**Render:**
- Grid de 4 cards con metricas:
  1. Alertas Abiertas (icono AlertTriangle)
  2. Reconocidas (icono AlertCircle)
  3. Resueltas (icono CheckCircle)
  4. Tiempo Promedio Resolucion (icono Clock)

---

### 2. AlertFilters

**Ubicacion:** `components/alerts/AlertFilters.tsx`

**Props:**
```typescript
interface AlertFiltersProps {
  filters: AlertFiltersType;
  onFiltersChange: (filters: AlertFiltersType) => void;
  onRefresh: () => void;
  isLoading?: boolean;
}
```

**Campos de Filtro:**
| Campo | Tipo | Opciones |
|-------|------|----------|
| Severidad | select | low, medium, high, critical |
| Estado | select | open, acknowledged, resolved, suppressed |
| Tipo Alerta | select | performance_degradation, high_error_rate, etc. |
| Desde | date | Date picker |
| Hasta | date | Date picker |

---

### 3. AlertsList

**Ubicacion:** `components/alerts/AlertsList.tsx`

**Props:**
```typescript
interface AlertsListProps {
  alerts: SystemAlert[];
  isLoading: boolean;
  pagination: Pagination;
  onAlertClick: (alert: SystemAlert) => void;
  onAcknowledge: (alert: SystemAlert) => void;
  onResolve: (alert: SystemAlert) => void;
  onSuppress: (alert: SystemAlert) => void;
  onNextPage: () => void;
  onPrevPage: () => void;
}
```

**Estados:**
- Loading: skeleton rows animados
- Empty: mensaje con icono
- Data: grid de AlertCard con paginacion

---

### 4. AlertCard

**Ubicacion:** `components/alerts/AlertCard.tsx`

**Props:**
```typescript
interface AlertCardProps {
  alert: SystemAlert;
  onViewDetails: (alert: SystemAlert) => void;
  onAcknowledge: (alert: SystemAlert) => void;
  onResolve: (alert: SystemAlert) => void;
  onSuppress: (alert: SystemAlert) => void;
}
```

**Secciones:**
1. **Badges** (max 3): Severidad, Estado, Tipo
2. **Contenido:** Titulo, Descripcion (clamp 2 lineas)
3. **Metadata:** Usuarios afectados, Timestamp
4. **Acciones:** Botones dinamicos segun estado

**Logica de Botones:**
| Estado | Detalles | Reconocer | Resolver | Suprimir |
|--------|----------|-----------|----------|----------|
| open | Si | Si | Si | Si |
| acknowledged | Si | No | Si | Si |
| resolved | Si | No | No | No |
| suppressed | Si | No | No | No |

---

### 5. AlertDetailsModal

**Ubicacion:** `components/alerts/AlertDetailsModal.tsx`

**Props:**
```typescript
interface AlertDetailsModalProps {
  alert: SystemAlert | null;
  isOpen: boolean;
  onClose: () => void;
}
```

**Secciones:**
1. Header con titulo y boton cerrar
2. Badges (severidad, estado)
3. Titulo y descripcion completa
4. Grid de informacion clave
5. Seccion Sistema (si aplica)
6. Seccion Gestion (si aplica)
7. JSON expandible (contexto, metricas)

---

### 6. AcknowledgeAlertModal

**Ubicacion:** `components/alerts/AcknowledgeAlertModal.tsx`

**Props:**
```typescript
interface AcknowledgeAlertModalProps {
  alert: SystemAlert | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (note?: string) => Promise<void>;
}
```

**Campos:**
- Titulo de alerta (readonly)
- Textarea para nota (opcional)
- Botones: Cancelar, Reconocer

---

### 7. ResolveAlertModal

**Ubicacion:** `components/alerts/ResolveAlertModal.tsx`

**Props:**
```typescript
interface ResolveAlertModalProps {
  alert: SystemAlert | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (note: string) => Promise<void>;
}
```

**Validacion:**
- Nota REQUERIDA
- Minimo 10 caracteres
- Contador en vivo: "5/10"
- Boton deshabilitado si < 10 chars

---

## TIPOS PRINCIPALES

### SystemAlert

```typescript
interface SystemAlert {
  id: string;
  title: string;
  description?: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  status: 'open' | 'acknowledged' | 'resolved' | 'suppressed';
  alert_type: SystemAlertType;
  affected_users: number;
  triggered_at: string;
  source_system?: string;
  source_module?: string;
  error_code?: string;
  escalation_level?: number;
  acknowledged_by_name?: string;
  acknowledged_at?: string;
  acknowledgment_note?: string;
  resolved_by_name?: string;
  resolved_at?: string;
  resolution_note?: string;
  context_data?: Record<string, unknown>;
  metrics?: Record<string, unknown>;
}
```

### AlertFilters

```typescript
interface AlertFilters {
  severity?: SystemAlertSeverity;
  status?: SystemAlertStatus;
  alert_type?: SystemAlertType;
  date_from?: string;
  date_to?: string;
  page?: number;
  limit?: number;
}
```

### AlertsStats

```typescript
interface AlertsStats {
  open_alerts: number;
  acknowledged_alerts: number;
  resolved_alerts: number;
  avg_resolution_time_hours: number;
}
```

---

## DIAGRAMA DE FLUJO

```
┌─────────────────────────────────────────────────────┐
│                AdminAlertsPage                       │
├─────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────┐   │
│  │              AlertsStats                     │   │
│  │  [Abiertas] [Reconocidas] [Resueltas] [Avg] │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │              AlertFilters                    │   │
│  │  [Severidad] [Estado] [Tipo] [Fechas]       │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │              AlertsList                      │   │
│  │  ┌─────────────┐ ┌─────────────┐            │   │
│  │  │ AlertCard   │ │ AlertCard   │            │   │
│  │  │ - Badges    │ │ - Badges    │            │   │
│  │  │ - Content   │ │ - Content   │            │   │
│  │  │ - Actions   │ │ - Actions   │            │   │
│  │  └─────────────┘ └─────────────┘            │   │
│  │  [< Prev]  1 2 3 4 5  [Next >]              │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  ┌──────────────────┐  ┌────────────────────┐      │
│  │ AlertDetailsModal│  │ AcknowledgeModal   │      │
│  └──────────────────┘  └────────────────────┘      │
│                        ┌────────────────────┐      │
│                        │ ResolveAlertModal  │      │
│                        └────────────────────┘      │
└─────────────────────────────────────────────────────┘
```

---

## REFERENCIAS

- `AdminAlertsPage.tsx` - Implementacion de pagina
- `useAlerts.ts` - Hook de gestion
- `adminTypes.ts` - Tipos compartidos

---

**Ultima actualizacion:** 2025-12-18
