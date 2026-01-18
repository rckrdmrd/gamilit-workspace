# _SSOT - Single Source of Truth

**Version:** 1.0.0
**Actualizado:** 2026-01-18

## Proposito

Esta carpeta contiene la **Single Source of Truth (SSOT)** del proyecto GAMILIT. Es el punto central de consolidacion de trazabilidad que conecta:

- Requerimientos Funcionales (RF)
- Especificaciones Tecnicas (ET)
- Historias de Usuario (US)
- Codigo Fuente (DB, Backend, Frontend)

## Archivos

| Archivo | Proposito | Alias |
|---------|-----------|-------|
| `TRACEABILITY-MASTER.yml` | Consolidado central de trazabilidad | `@TRACE-MASTER` |
| `EPIC-INDEX.yml` | Indice completo de las 22 epicas | `@EPIC-INDEX` |
| `REQUIREMENTS-INDEX.yml` | Mapeo RF -> ET -> US | `@REQ-INDEX` |
| `CODE-MAPPINGS.yml` | Mapeo bidireccional docs <-> codigo | `@CODE-MAP` |
| `COMPLETENESS-TRACKER.yml` | Rutas de completitud para epicas parciales | `@COMPLETENESS` |

## Como Usar

### Consultar estado de una epica

```yaml
# Ver en EPIC-INDEX.yml
epics:
  EAI-003:
    status: completed
    completion: 100%
    traceability: "../01-fase-alcance-inicial/EAI-003-gamificacion/implementacion/TRACEABILITY.yml"
```

### Trazar un requerimiento hasta codigo

```yaml
# Ver en REQUIREMENTS-INDEX.yml -> CODE-MAPPINGS.yml
RF-GAM-001 -> ET-GAM-001 -> US-GAM-003
  -> database: gamification_system.achievements
  -> backend: gamification.Achievement
  -> frontend: student/gamification/AchievementCard
```

### Ver roadmap de epica parcial

```yaml
# Ver en COMPLETENESS-TRACKER.yml
EXT-007:
  current: 40%
  roadmap:
    phase_1: Deep Linking (Q2 2026)
    phase_2: Grade Passback (Q3 2026)
```

## Principios SSOT

1. **Unica Fuente**: Este es el punto de entrada para trazabilidad
2. **Referencias, No Duplicacion**: Los archivos individuales (TRACEABILITY.yml por epica) siguen existiendo; SSOT los referencia
3. **Actualizacion Bidireccional**: Cambios en epicas deben reflejarse aqui
4. **Consistencia**: Metricas aqui deben coincidir con inventarios

## Relacion con Otros Componentes

```
docs/_SSOT/
    |
    +---> docs/0X-fase-*/EXX-*/implementacion/TRACEABILITY.yml (por epica)
    |
    +---> orchestration/inventarios/ (MASTER, DB, BE, FE)
    |
    +---> orchestration/trazas/ (TRAZA-TAREAS-*)
```

## Mantenimiento

- **Frecuencia**: Actualizar al completar cualquier tarea que modifique epicas
- **Responsable**: Agente que ejecuta la tarea
- **Validacion**: Verificar que conteos coincidan con inventarios

## Referencias

- Inventario Master: `orchestration/inventarios/MASTER_INVENTORY.yml`
- Mapa de Documentacion: `docs/_MAP.md`
- Directiva SSOT: `orchestration/directivas/principios/PRINCIPIO-SSOT.md`
