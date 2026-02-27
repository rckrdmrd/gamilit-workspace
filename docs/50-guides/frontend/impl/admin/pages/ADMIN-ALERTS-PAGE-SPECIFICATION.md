# Especificacion: AdminAlertsPage

**Version:** 1.0.0
**Fecha:** 2025-12-18
**Ubicacion:** `apps/frontend/src/apps/admin/pages/AdminAlertsPage.tsx`

---

## PROPOSITO

Pagina de administracion para gestionar alertas del sistema, incluyendo visualizacion, filtrado, reconocimiento y resolucion.

---

## ESTRUCTURA DE PAGINA

```
┌─────────────────────────────────────────────────────────┐
│                      HEADER                              │
│  [AlertTriangle Icon] Alertas del Sistema               │
│  [Refrescar]                                            │
└─────────────────────────────────────────────────────────┘
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │                AlertsStats                       │   │
│  │ [Abiertas] [Reconocidas] [Resueltas] [Avg Time] │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │                AlertFilters                      │   │
│  │ [Severidad v] [Estado v] [Tipo v] [Desde] [Hasta]│   │
│  │ [Limpiar Filtros] [Refrescar]                   │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │                AlertsList                        │   │
│  │  ┌─────────────┐ ┌─────────────┐                │   │
│  │  │ AlertCard   │ │ AlertCard   │                │   │
│  │  └─────────────┘ └─────────────┘                │   │
│  │  [< Prev]  1 2 3 4 5  [Next >]                  │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

---

## COMPONENTES INTEGRADOS

| Componente | Proposito |
|------------|-----------|
| AlertsStats | 4 cards de estadisticas |
| AlertFilters | Panel de filtros |
| AlertsList | Grid de AlertCards con paginacion |
| AlertCard | Card individual de alerta |
| AlertDetailsModal | Modal de detalles completos |
| AcknowledgeAlertModal | Modal para reconocer |
| ResolveAlertModal | Modal para resolver |

---

## FLUJO DE ALERTAS

```
┌──────────┐     ┌─────────────┐     ┌──────────┐
│   OPEN   │────►│ ACKNOWLEDGED│────►│ RESOLVED │
└──────────┘     └─────────────┘     └──────────┘
      │                                    ▲
      │                                    │
      └────────────────────────────────────┘
                 (direct resolve)

      │
      ▼
┌──────────────┐
│  SUPPRESSED  │ (ignorar alerta)
└──────────────┘
```

---

## ESTADO DE LA PAGINA

### State Management

```typescript
const [modalState, setModalState] = useState({
  details: { isOpen: false, alert: null },
  acknowledge: { isOpen: false, alert: null },
  resolve: { isOpen: false, alert: null }
});
```

### Handlers

```typescript
const handleViewDetails = (alert: SystemAlert) => {
  setModalState(prev => ({
    ...prev,
    details: { isOpen: true, alert }
  }));
};

const handleAcknowledge = async (note?: string) => {
  await acknowledgeAlert(alert.id, note);
  closeModal('acknowledge');
};

const handleResolve = async (note: string) => {
  await resolveAlert(alert.id, note);
  closeModal('resolve');
};

const handleSuppress = async (alert: SystemAlert) => {
  await suppressAlert(alert.id);
};
```

---

## FILTROS DISPONIBLES

| Filtro | Tipo | Opciones |
|--------|------|----------|
| Severidad | select | critical, high, medium, low |
| Estado | select | open, acknowledged, resolved, suppressed |
| Tipo | select | performance_degradation, high_error_rate, etc. |
| Desde | date | ISO date |
| Hasta | date | ISO date |

---

## PAGINACION

- Items por pagina: 12
- Grid: 3 columnas (responsive)
- Navegacion: anterior/siguiente + numeros

---

## ESTADISTICAS

| Metrica | Descripcion | Fuente |
|---------|-------------|--------|
| Abiertas | Alertas sin resolver | stats.open_alerts |
| Reconocidas | En proceso | stats.acknowledged_alerts |
| Resueltas | Completadas | stats.resolved_alerts |
| Tiempo Promedio | Horas hasta resolucion | stats.avg_resolution_time_hours |

---

## ACCIONES POR ESTADO

| Estado Actual | Acciones Disponibles |
|---------------|---------------------|
| open | Ver, Reconocer, Resolver, Suprimir |
| acknowledged | Ver, Resolver, Suprimir |
| resolved | Ver |
| suppressed | Ver |

---

## PERMISOS

| Accion | Roles Permitidos |
|--------|------------------|
| Ver alertas | admin, super_admin |
| Reconocer | admin, super_admin |
| Resolver | admin, super_admin |
| Suprimir | super_admin |

---

## FEEDBACK VISUAL

| Evento | Indicador |
|--------|-----------|
| Loading | Spinner en boton refresh |
| Error | Banner de error |
| Exito en accion | Toast success |
| Alerta critica | Borde rojo pulsante |

---

## HOOKS UTILIZADOS

| Hook | Proposito |
|------|-----------|
| useAlerts | Queries, mutations, pagination |

---

## REFERENCIAS

- [ALERT-COMPONENTS-ARCHITECTURE.md](../components/ALERT-COMPONENTS-ARCHITECTURE.md)
- [FRONTEND-ALERT-SYSTEM-GUIDE.md](../../guides/FRONTEND-ALERT-SYSTEM-GUIDE.md)

---

**Ultima actualizacion:** 2025-12-18
