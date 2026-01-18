# Trazabilidad del Proyecto

**Version:** 1.0.0
**Actualizado:** 2026-01-18

## Proposito

Esta carpeta contiene los archivos del sistema de trazabilidad y dependencias del proyecto GAMILIT.

## Archivos

| Archivo | Proposito | Alias |
|---------|-----------|-------|
| `DEPENDENCY-GRAPH-VISUAL.yml` | Grafo de dependencias con Mermaid | `@DEP-GRAPH` |
| `SYNC-STATUS.yml` | Estado de sincronizacion docs<->codigo | `@SYNC` |
| `METRICS-DASHBOARD.yml` | Metricas de completitud | `@METRICS` |

## Relacion con SSOT

```
docs/_SSOT/                     # Que existe (inventario)
    |
    +---> orchestration/trazabilidad/  # Como se relaciona (grafo + metricas)
              |
              +---> DEPENDENCY-GRAPH-VISUAL.yml  # Dependencias entre epicas
              +---> SYNC-STATUS.yml              # Sync docs <-> codigo
              +---> METRICS-DASHBOARD.yml        # Metricas globales
```

## Uso del Grafo de Dependencias

### Ver diagrama Mermaid

El archivo `DEPENDENCY-GRAPH-VISUAL.yml` contiene un diagrama Mermaid listo para renderizar:

```yaml
mermaid:
  output: |
    ```mermaid
    graph TB
      EAI001 --> EAI002
      ...
    ```
```

Copiar el contenido de `mermaid.output` a cualquier herramienta que soporte Mermaid (GitHub, Notion, etc.).

### Verificar dependencias

```yaml
edges:
  - from: EAI-001
    to: EAI-002
    type: hard
    reason: "Actividades requieren autenticacion"
```

### Detectar ciclos

```yaml
validations:
  circular_dependency_check:
    result: PASS
    detected_cycles: []
```

## Uso del Sync Status

### Ver gaps de sincronizacion

```yaml
frontend_sync:
  total_components: 464
  documented_components: 280
  sync_percentage: "60%"
```

### Ver acciones pendientes

```yaml
pending_actions:
  high_priority:
    - action: "Documentar componentes feature de frontend"
      affected: 64
```

## Uso del Metrics Dashboard

### Ver salud del proyecto

```yaml
global_metrics:
  project_health:
    score: 85
    grade: "B+"
```

### Ver alertas

```yaml
alerts:
  warnings:
    - type: "test_coverage"
      message: "Test coverage (25%) muy por debajo del objetivo (60%)"
```

## Mantenimiento

- **Frecuencia:** Actualizar al completar sprints o cambios significativos
- **Validacion:** Verificar que metricas coincidan con inventarios
- **Alertas:** Revisar warnings y tomar acciones

## Referencias

- SSOT: `docs/_SSOT/`
- Inventarios: `orchestration/inventarios/`
- Directivas: `orchestration/directivas/`
