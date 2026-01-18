---
tipo: especificacion-tecnica
nivel: 2-tecnico
ssot: orchestration/principios/PRINCIPIO-CAPVED.md
audiencia: agentes IA, sistemas automaticos
proposito: Especificacion tecnica del protocolo CAPVED
actualizado: 2026-01-18
propagado_desde: workspace-v2/orchestration/_definitions/protocols/CAPVED-CYCLE.md
---

# PROTOCOLO: CAPVED-CYCLE

**Version:** 1.0.0
**Alias:** @DEF_CAPVED
**Fecha:** 2026-01-18
**Sistema:** SIMCO v4.0.0 (adaptado para gamilit)
**SSOT:** [PRINCIPIO-CAPVED.md](../principios/PRINCIPIO-CAPVED.md)

---

## RESUMEN

CAPVED es el ciclo de vida obligatorio para toda tarea en gamilit. Define 6 fases secuenciales que aseguran calidad, trazabilidad y documentacion completa.

```
C -> A -> P -> V -> E -> D
|    |    |    |    |    |
|    |    |    |    |    +-- DOCUMENTACION (Registrar, trazar, propagar)
|    |    |    |    +------- EJECUCION (Implementar cambios)
|    |    |    +------------ VALIDACION (Gate pre-ejecucion)
|    |    +----------------- PLANEACION (Desglosar subtareas)
|    +---------------------- ANALISIS (Mapear impacto)
+--------------------------- CONTEXTO (Clasificar y vincular)
```

---

## FASES DEL CICLO

### FASE C - CONTEXTO

**Objetivo:** Clasificar tarea y vincular con proyecto.

```yaml
actividades:
  - Identificar tipo de tarea (feature/fix/refactor/analysis)
  - Identificar modulo(s) involucrado(s)
  - Cargar contexto requerido segun perfil
  - Vincular con epica/user story si aplica

salidas:
  - Tipo de tarea identificado
  - Modulo(s) identificado(s)
  - Contexto minimo viable cargado

criterios_completitud:
  - Modulo claramente identificado
  - Tipo de tarea determinado
  - Contexto base cargado
```

### FASE A - ANALISIS

**Objetivo:** Mapear impacto, dependencias y riesgos.

```yaml
actividades:
  - Verificar si es creacion o modificacion
  - Identificar archivos afectados
  - Mapear dependientes (quien usa lo que modifico)
  - Mapear dependencias (que usa lo que modifico)
  - Evaluar riesgos y complejidad

salidas:
  - Mapa de impacto
  - Lista de dependientes
  - Lista de dependencias
  - Evaluacion de riesgos
  - Complejidad estimada

criterios_completitud:
  - Impacto mapeado
  - Dependencias identificadas
  - Riesgos evaluados
```

### FASE P - PLANEACION

**Objetivo:** Desglosar en subtareas por dominio.

```yaml
actividades:
  - Crear lista de subtareas especificas
  - Ordenar por dependencia (DDL -> BE -> FE)
  - Identificar subtareas paralelizables
  - Definir criterios de aceptacion por subtarea

salidas:
  - Lista de subtareas (ST-001, ST-002, ...)
  - Orden de ejecucion
  - Criterios de aceptacion

criterios_completitud:
  - Subtareas definidas
  - Orden establecido
  - Criterios claros
```

### FASE V - VALIDACION (Gate)

**Objetivo:** Verificar antes de ejecutar.

```yaml
actividades:
  - Verificar que plan cubre todo el impacto
  - Verificar que no hay scope creep
  - Verificar que dependencias estan resueltas
  - Verificar que hay capacidad de rollback
  - Confirmar alineacion con estandares

salidas:
  - Checklist de validacion completado
  - Decision GO/NO-GO

criterios_completitud:
  - Todas las verificaciones pasadas
  - Decision GO documentada

decision:
  GO: "Continuar a Fase E"
  NO-GO: "Regresar a Fase A o P segun hallazgo"
```

### FASE E - EJECUCION

**Objetivo:** Implementar cambios segun plan.

```yaml
actividades:
  - Ejecutar subtareas en orden
  - Validar cada subtarea (build/lint/test)
  - Crear commits atomicos por subtarea
  - Documentar problemas encontrados
  - Escalar si hay bloqueos

salidas:
  - Codigo implementado
  - Commits realizados
  - Validaciones pasadas
  - Problemas documentados

criterios_completitud:
  - Todas las subtareas completadas
  - Build pasa
  - Lint pasa
  - Tests pasan (si existen)
```

### FASE D - DOCUMENTACION

**Objetivo:** Registrar, trazar y propagar.

> **IMPORTANTE:** Esta fase tiene dos sub-fases en orden estricto:
> 1. **D1 - Gobernanza** (BLOQUEANTE)
> 2. **D2 - Tecnica** (despues de gobernanza)

```yaml
actividades:
  # D1 - GOBERNANZA (PRIMERO - BLOQUEANTE)
  d1_gobernanza:
    - Crear carpeta de tarea: orchestration/tareas/TASK-{ID}/
    - Completar METADATA.yml
    - Documentar 01-CONTEXTO.md (que y por que)
    - Documentar 05-EJECUCION.md (como y que problemas)
    - Documentar 06-DOCUMENTACION.md (resumen y referencias)
    - Actualizar orchestration/tareas/_INDEX.yml

  # D2 - TECNICA (despues de gobernanza)
  d2_tecnica:
    - Actualizar inventarios afectados
    - Crear/actualizar documentacion tecnica si aplica

salidas:
  # Gobernanza
  - Carpeta de tarea con documentacion completa
  - _INDEX.yml actualizado
  # Tecnica
  - Inventarios actualizados

criterios_completitud:
  # Gobernanza (BLOQUEANTE)
  - Carpeta TASK-{ID}/ existe
  - METADATA.yml completo
  - Fases C, E, D documentadas
  - _INDEX.yml actualizado
  # Tecnica
  - Inventarios al dia

validacion:
  checklist: "@DEF_CHK_GOB (gobernanza) + @DEF_CHK_POST (tecnica)"
  orden: "Gobernanza PRIMERO, luego tecnica"
```

---

## MODOS DE EJECUCION

### MODE-FULL (Por defecto)

```yaml
fases: [C, A, P, V, E, D]
uso: "Features, bug fixes, refactorizaciones, cambios BD"
alias: "@FULL"
```

### MODE-QUICK

```yaml
fases: [E, D]
uso: "Typos, fixes menores, updates de deps, config simple"
alias: "@QUICK"
condicion: "Cambio trivial sin riesgo de impacto"
```

### MODE-ANALYSIS

```yaml
fases: [C, A, P]
uso: "Investigacion, auditoria, exploracion, propuestas"
alias: "@ANALYSIS"
nota: "No modifica codigo"
```

---

## VALIDACIONES POR DOMINIO

### Backend (NestJS)
```bash
npm run build    # DEBE pasar
npm run lint     # DEBE pasar
npm run test     # Si existen, DEBEN pasar
```

### Frontend (React)
```bash
npm run build    # DEBE pasar
npm run lint     # DEBE pasar
npm run typecheck # DEBE pasar
```

### Database (PostgreSQL)
```bash
# Ejecutar DDL sin errores
psql -f {archivo}.sql --set ON_ERROR_STOP=1
```

---

## REFERENCIAS

| Alias | Descripcion |
|-------|-------------|
| @DEF_CAPVED | Este protocolo |
| @DEF_CHK_GOB | Checklist de gobernanza |
| @DEF_CHK_POST | Checklist post-tarea |

---

**Version:** 1.0.0 | **Sistema:** SIMCO v4.0.0 | **Tipo:** Protocolo Base
**Propagado desde:** workspace-v2/orchestration/_definitions/protocols/CAPVED-CYCLE.md
