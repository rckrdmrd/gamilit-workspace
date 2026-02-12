# 10 - Requirements

> Requerimientos del producto, epics, user stories y guias de pruebas.

## Contenido

| Directorio/Archivo | Descripcion |
|--------------------|-------------|
| [VISION-ALCANCE.md](./VISION-ALCANCE.md) | Vision y alcance del proyecto (canonico) |
| [epics/](./epics/) | Epics organizadas por fase (EPIC-GAM-F{N}-{ID}) |
| [testing-guides/](./testing-guides/) | Guias de prueba por modulo |

## Estructura de Epics

```
epics/
  EPIC-GAM-F{N}-{ID}/
    EPIC.md
    PLAN.md
    user-stories/
      US-{ID}/
        US-{ID}-{nombre}.md
        tasks/
          TASK-{ID}-{CODE}/
```

Ver [ADR-034](../90-adr/ADR-034-jerarquia-anidada-profunda.md) para la convencion de jerarquia.
