# ADR-034: Jerarquia Anidada Profunda para Documentacion de Producto

**Estado:** Accepted
**Fecha:** 2026-02-09
**Contexto:** TASK-2026-02-09-REESTRUCTURA-ANIDADA

## Contexto

La documentacion de producto en `docs/10-requirements/epics/` usaba un modelo plano:
- User Stories como archivos individuales en `user-stories/US-*.md`
- Tareas consolidadas en un unico `TASKS-IMPLEMENTATION.md` por EPIC
- Sin estructura de subtareas

Con 22 EPICs funcionales, 135 User Stories y 552 tareas, el modelo plano dificultaba:
1. Navegacion a tareas especificas (buscar en archivos de 200+ lineas)
2. Tracking granular de progreso por tarea individual
3. Asignacion de subtareas a agentes especificos
4. Aplicacion de CAPVED a nivel de tarea individual

## Decision

Adoptar jerarquia anidada profunda donde cada artefacto tiene su propia carpeta:

```
EPIC-GAM-F{N}-{ID}/
├── EPIC.md
├── PLAN.md
└── user-stories/
    ├── _INDEX.md
    └── US-{ID}/
        ├── US-{ID}-{nombre}.md     (definicion)
        ├── _INDEX.md                (links a definicion + tareas)
        └── tasks/
            ├── _INDEX.md            (tabla de tareas)
            └── TASK-{US-ID}-{CODE}/
                ├── TASK-{US-ID}-{CODE}.md  (definicion)
                └── subtasks/               (si aplica)
```

### Nomenclatura de Tareas

- **F1 (extraidas):** TASK-{US-ID}-{CODE} donde CODE = B1/F1/T1/D1 (tipo+secuencia)
- **F2/F3 (generadas):** TASK-{US-ID}-{CODE} donde CODE = BE/FE/TEST (area)

### Indices a Tres Niveles

1. `user-stories/_INDEX.md` — Tabla de US por EPIC con conteo de tareas
2. `US-{ID}/_INDEX.md` — Links a definicion y lista de tareas
3. `US-{ID}/tasks/_INDEX.md` — Tabla de tareas con descripcion

## Alternativas Consideradas

1. **Mantener modelo plano** — Rechazado: no escala con 552 tareas
2. **US como carpetas, tareas como archivos planos** — Rechazado: sin soporte para subtareas
3. **Solo YAML tracking sin carpetas** — Rechazado: separa contenido de tracking

## Consecuencias

### Positivas
- Cada tarea es direccionable individualmente (path unico)
- CAPVED aplicable a nivel de tarea y subtarea
- _INDEX.md en cada nivel facilita navegacion
- Compatible con asignacion granular a agentes
- Work-items YAML puede referenciar paths directos

### Negativas
- ~842 archivos nuevos, ~687 carpetas nuevas
- Mayor profundidad de directorio (hasta 6 niveles)
- Requiere indices actualizados en cada operacion CRUD

### Metricas de Impacto

| Metrica | Antes | Despues |
|---------|-------|---------|
| US folders | 0 | 135 |
| Task folders | 0 | 552 |
| TASK.md files | 0 (inline) | 552 |
| _INDEX.md files | 20 | 290 |
| Profundidad max | 3 niveles | 6 niveles |
| Archivos totales nuevos | 0 | ~842 |

## Referencias

- ADR-0019 (workspace-arch): SSOT documentacion producto en proyecto
- ADR-0020 (workspace-arch): US co-localizadas con EPICs
- TASK-2026-02-09-REESTRUCTURA-ANIDADA: Tarea de implementacion
