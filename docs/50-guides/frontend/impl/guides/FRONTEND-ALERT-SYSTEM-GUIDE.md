---
titulo: Guía del Sistema de Alertas Frontend
tipo: guia
dominio: frontend
ultima_actualizacion: 2026-02-27
---

# Guia del Sistema de Alertas - Frontend

**Version:** 1.0.0
**Fecha:** 2025-12-18
**Modulo:** Admin Portal - Sistema de Alertas

---

## INTRODUCCION

Esta guia describe como usar el sistema de alertas implementado en el Admin Portal de GAMILIT.

---

## ARQUITECTURA

```
┌─────────────────────────────────────────────────────────┐
│                    AdminAlertsPage                       │
│  ┌─────────────────────────────────────────────────┐   │
│  │                 useAlerts Hook                   │   │
│  │  - Data: alerts, stats                          │   │
│  │  - Actions: acknowledge, resolve, suppress      │   │
│  │  - Pagination: page, filters                    │   │
│  └─────────────────────────────────────────────────┘   │
│                        │                                │
│         ┌──────────────┼──────────────┐                │
│         ▼              ▼              ▼                │
│   AlertsStats    AlertFilters   AlertsList             │
│                                      │                  │
│                          ┌───────────┼───────────┐     │
│                          ▼           ▼           ▼     │
│                    AlertCard   AlertCard   AlertCard   │
│                          │                              │
│              ┌───────────┼───────────┐                 │
│              ▼           ▼           ▼                 │
│        DetailsModal  AckModal  ResolveModal            │
└─────────────────────────────────────────────────────────┘
```

---

## USO BASICO

### Importar el Hook

```typescript
import { useAlerts } from '@/apps/admin/hooks/useAlerts';
```

### Inicializar

```typescript
function MyAlertsComponent() {
  const {
    alerts,
    stats,
    isLoading,
    error,
    filters,
    setFilters,
    pagination,
    acknowledgeAlert,
    resolveAlert,
    suppressAlert,
    refreshAlerts
  } = useAlerts();

  // ...
}
```

---

## FILTRADO DE ALERTAS

### Filtrar por Severidad

```typescript
setFilters({
  ...filters,
  severity: 'critical'
});
```

### Filtrar por Estado

```typescript
setFilters({
  ...filters,
  status: 'open'
});
```

### Filtrar por Rango de Fechas

```typescript
setFilters({
  ...filters,
  date_from: '2025-12-01',
  date_to: '2025-12-18'
});
```

### Limpiar Filtros

```typescript
setFilters({
  page: 1,
  limit: 12
});
```

---

## ACCIONES SOBRE ALERTAS

### Reconocer una Alerta

```typescript
const handleAcknowledge = async (alertId: string, note?: string) => {
  try {
    await acknowledgeAlert(alertId, note);
    toast.success('Alerta reconocida');
  } catch (error) {
    toast.error('Error al reconocer alerta');
  }
};
```

### Resolver una Alerta

```typescript
const handleResolve = async (alertId: string, note: string) => {
  // Nota es requerida (minimo 10 caracteres)
  if (note.length < 10) {
    toast.error('La nota debe tener al menos 10 caracteres');
    return;
  }

  try {
    await resolveAlert(alertId, note);
    toast.success('Alerta resuelta');
  } catch (error) {
    toast.error('Error al resolver alerta');
  }
};
```

### Suprimir una Alerta

```typescript
const handleSuppress = async (alertId: string) => {
  try {
    await suppressAlert(alertId);
    toast.success('Alerta suprimida');
  } catch (error) {
    toast.error('Error al suprimir alerta');
  }
};
```

---

## PAGINACION

### Navegar Paginas

```typescript
// Siguiente pagina
pagination.nextPage();

// Pagina anterior
pagination.prevPage();

// Ir a pagina especifica
pagination.goToPage(3);
```

### Informacion de Paginacion

```typescript
const { page, totalPages, totalItems, limit } = pagination;

// Mostrar info
<span>
  Pagina {page} de {totalPages} ({totalItems} alertas)
</span>
```

---

## COMPONENTES DE UI

### Usar Utilidades de Estilo

```typescript
import {
  getSeverityColor,
  getStatusColor,
  getSeverityLabel,
  getStatusLabel,
  formatAlertTimestamp
} from '@/apps/admin/components/alerts/alertUtils';

// Ejemplo
<span className={getSeverityColor(alert.severity)}>
  {getSeverityLabel(alert.severity)}
</span>

<span className={getStatusColor(alert.status)}>
  {getStatusLabel(alert.status)}
</span>

<span>{formatAlertTimestamp(alert.triggered_at)}</span>
```

### Integrar AlertCard

```typescript
import { AlertCard } from '@/apps/admin/components/alerts/AlertCard';

<AlertCard
  alert={alert}
  onViewDetails={handleViewDetails}
  onAcknowledge={handleAcknowledge}
  onResolve={handleResolve}
  onSuppress={handleSuppress}
/>
```

---

## MANEJO DE ESTADOS

### Loading

```typescript
if (isLoading) {
  return <AlertsSkeleton />;
}
```

### Error

```typescript
if (error) {
  return (
    <ErrorBanner
      message={error}
      onRetry={refreshAlerts}
    />
  );
}
```

### Sin Resultados

```typescript
if (alerts.length === 0) {
  return (
    <EmptyState
      icon={<Bell />}
      message="No hay alertas"
      description="No se encontraron alertas con los filtros actuales"
    />
  );
}
```

---

## PATRONES COMUNES

### Refresh Automatico

```typescript
useEffect(() => {
  const interval = setInterval(() => {
    refreshAlerts();
  }, 30000); // Cada 30 segundos

  return () => clearInterval(interval);
}, []);
```

### Manejo de Modales

```typescript
const [modalState, setModalState] = useState({
  details: { isOpen: false, alert: null },
  acknowledge: { isOpen: false, alert: null },
  resolve: { isOpen: false, alert: null }
});

const openModal = (type: string, alert: SystemAlert) => {
  setModalState(prev => ({
    ...prev,
    [type]: { isOpen: true, alert }
  }));
};

const closeModal = (type: string) => {
  setModalState(prev => ({
    ...prev,
    [type]: { isOpen: false, alert: null }
  }));
};
```

---

## TROUBLESHOOTING

### Alertas no se actualizan

```typescript
// Forzar refresh
await refreshAlerts();
```

### Filtros no funcionan

```typescript
// Verificar que page se resetea a 1
setFilters({
  ...newFilters,
  page: 1 // Importante!
});
```

### Error de CORS

```typescript
// Verificar que CORS_ORIGIN en backend incluye el dominio correcto
// Ver: docs/50-guides/GUIA-CORS-PRODUCCION.md
```

---

## TIPOS DE ALERTA

| Tipo | Descripcion | Severidad Tipica |
|------|-------------|------------------|
| performance_degradation | Rendimiento del sistema degradado | high |
| high_error_rate | Alta tasa de errores | critical |
| security_breach | Posible brecha de seguridad | critical |
| resource_limit | Limite de recursos alcanzado | medium |
| service_outage | Servicio no disponible | critical |
| data_anomaly | Anomalia en datos | medium |

---

## REFERENCIAS

- [ALERT-COMPONENTS-ARCHITECTURE.md](../admin/components/ALERT-COMPONENTS-ARCHITECTURE.md)
- [ADMIN-ALERTS-PAGE-SPECIFICATION.md](../admin/pages/ADMIN-ALERTS-PAGE-SPECIFICATION.md)
- `useAlerts.ts` - Hook principal

---

**Ultima actualizacion:** 2025-12-18
