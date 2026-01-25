# Checklists por Fase CAPVED

**Version:** 1.0.0
**Actualizado:** 2026-01-18

## Proposito

Gates de validacion para cada fase del ciclo CAPVED.

## Archivos

| Checklist | Fase | Alias | Proposito |
|-----------|------|-------|-----------|
| CHECKLIST-FASE-C.md | Contexto | `@CHK-CONTEXTO` | Validar contextualizacion |
| CHECKLIST-FASE-A.md | Analisis | `@CHK-ANALISIS` | Validar analisis de impacto |
| CHECKLIST-FASE-P.md | Plan | `@CHK-PLAN` | Validar plan de ejecucion |
| CHECKLIST-FASE-V.md | Validacion | `@CHK-VALIDACION` | Gate pre-ejecucion |
| CHECKLIST-FASE-E.md | Ejecucion | `@CHK-EJECUCION` | Checkpoints CP1-CP4 |
| CHECKLIST-FASE-D.md | Documentacion | `@CHK-DOCUMENTACION` | Validar documentacion |
| CHECKLIST-CIERRE.md | Final | `@CHK-CIERRE`, `@DEF_CHK_POST` | Gate bloqueante final |

## Flujo de Validacion

```
Tarea iniciada
      |
      v
[CHECKLIST-FASE-C] ── NO PASA ──> Completar items faltantes
      |
    PASA
      |
      v
[CHECKLIST-FASE-A] ── NO PASA ──> Completar analisis
      |
    PASA
      |
      v
[CHECKLIST-FASE-P] ── NO PASA ──> Refinar plan
      |
    PASA
      |
      v
[CHECKLIST-FASE-V] ── NO PASA ──> Resolver bloqueantes
      |
    PASA
      |
      v
[CHECKLIST-FASE-E] ── CP FALLA ──> Resolver y re-ejecutar
   (CP1-CP4)
      |
 TODOS PASAN
      |
      v
[CHECKLIST-FASE-D] ── NO PASA ──> Completar documentacion
      |
    PASA
      |
      v
[CHECKLIST-CIERRE] ── NO PASA ──> Completar items
      |
    PASA
      |
      v
TAREA COMPLETADA
```

## Checkpoints de Ejecucion (Fase E)

| Checkpoint | Cuando | Validaciones |
|------------|--------|--------------|
| CP1 | Post-Database | DDL, recreate-database |
| CP2 | Post-Backend | build, lint, test |
| CP3 | Post-Frontend | build, typecheck |
| CP4 | Final | Coherencia entre capas |

## Uso

### Durante ejecucion de tarea

1. Antes de pasar a siguiente fase, ejecutar checklist correspondiente
2. Si no pasa, resolver items faltantes
3. Solo avanzar cuando todos los items pasen

### Al finalizar tarea

1. Ejecutar CHECKLIST-CIERRE.md completo
2. **BLOQUEANTE**: No marcar tarea como completada sin pasar
3. Documentar cualquier excepcion con justificacion

## Integracion con Templates

Los checklists estan referenciados en:
- `METADATA.yml` - Campo `phases.{fase}.checklist`
- `SUBTASKS.yml` - Dentro de cada fase

## Referencias

- Template de tarea: `orchestration/tareas/_templates/TASK-TEMPLATE-UNIFIED/`
- Triggers: `orchestration/directivas/triggers/`
- Principio CAPVED: `orchestration/directivas/principios/PRINCIPIO-CAPVED.md`
