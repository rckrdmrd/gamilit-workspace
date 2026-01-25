---
tipo: especificacion-tecnica
nivel: 2-tecnico
ssot: /orchestration/directivas/principios/PRINCIPIO-CAPVED.md
audiencia: agentes IA, sistemas automaticos
proposito: Especificacion tecnica del protocolo CAPVED
actualizado: 2026-01-16
---

# PROTOCOLO: CAPVED-CYCLE

**Versión:** 1.0.0
**Alias:** @DEF_CAPVED
**Fecha:** 2026-01-16
**Sistema:** SIMCO v4.0.0
**SSOT:** [PRINCIPIO-CAPVED.md](/orchestration/directivas/principios/PRINCIPIO-CAPVED.md)

---

## RESUMEN

CAPVED es el ciclo de vida obligatorio para toda tarea en el workspace. Define 6 fases secuenciales que aseguran calidad, trazabilidad y documentación completa.

```
C → A → P → V → E → D
│   │   │   │   │   │
│   │   │   │   │   └─ DOCUMENTACIÓN (Registrar, trazar, propagar)
│   │   │   │   └───── EJECUCIÓN (Implementar cambios)
│   │   │   └───────── VALIDACIÓN (Gate pre-ejecución)
│   │   └───────────── PLANEACIÓN (Desglosar subtareas)
│   └───────────────── ANÁLISIS (Mapear impacto)
└───────────────────── CONTEXTO (Clasificar y vincular)
```

---

## FASES DEL CICLO

### FASE C - CONTEXTO

**Objetivo:** Clasificar tarea y vincular con proyecto/workspace.

```yaml
actividades:
  - Identificar tipo de tarea (feature/fix/refactor/analysis)
  - Identificar proyecto(s) involucrado(s)
  - Identificar nivel (workspace/proyecto/módulo)
  - Cargar contexto requerido según perfil
  - Vincular con épica/user story si aplica

salidas:
  - Tipo de tarea identificado
  - Proyecto(s) identificado(s)
  - Contexto mínimo viable cargado
  - Vinculación establecida

criterios_completitud:
  - Proyecto claramente identificado
  - Tipo de tarea determinado
  - Contexto base cargado
```

### FASE A - ANÁLISIS

**Objetivo:** Mapear impacto, dependencias y riesgos.

```yaml
actividades:
  - Ejecutar TRIGGER-ANTI-DUPLICACION si es creación
  - Ejecutar TRIGGER-ANALISIS-DEPENDENCIAS si es modificación
  - Identificar archivos afectados
  - Mapear dependientes (quién usa lo que modifico)
  - Mapear dependencias (qué usa lo que modifico)
  - Evaluar riesgos y complejidad

salidas:
  - Mapa de impacto
  - Lista de dependientes
  - Lista de dependencias
  - Evaluación de riesgos
  - Complejidad estimada

criterios_completitud:
  - Impacto mapeado
  - Dependencias identificadas
  - Riesgos evaluados
```

### FASE P - PLANEACIÓN

**Objetivo:** Desglosar en subtareas por dominio.

```yaml
actividades:
  - Crear lista de subtareas específicas
  - Ordenar por dependencia (DDL → BE → FE)
  - Identificar subtareas paralelizables
  - Asignar perfil responsable por subtarea
  - Definir criterios de aceptación por subtarea

salidas:
  - Lista de subtareas (ST-001, ST-002, ...)
  - Orden de ejecución
  - Asignación de perfiles
  - Criterios de aceptación

criterios_completitud:
  - Subtareas definidas
  - Orden establecido
  - Criterios claros
```

### FASE V - VALIDACIÓN (Gate)

**Objetivo:** Verificar antes de ejecutar.

```yaml
actividades:
  - Verificar que plan cubre todo el impacto
  - Verificar que no hay scope creep
  - Verificar que dependencias están resueltas
  - Verificar que hay capacidad de rollback
  - Confirmar alineación con estándares

salidas:
  - Checklist de validación completado
  - Decisión GO/NO-GO

criterios_completitud:
  - Todas las verificaciones pasadas
  - Decisión GO documentada

decision:
  GO: "Continuar a Fase E"
  NO-GO: "Regresar a Fase A o P según hallazgo"
```

### FASE E - EJECUCIÓN

**Objetivo:** Implementar cambios según plan.

```yaml
actividades:
  - Ejecutar subtareas en orden
  - Validar cada subtarea (build/lint/test)
  - Crear commits atómicos por subtarea
  - Documentar problemas encontrados
  - Escalar si hay bloqueos

salidas:
  - Código implementado
  - Commits realizados
  - Validaciones pasadas
  - Problemas documentados

criterios_completitud:
  - Todas las subtareas completadas
  - Build pasa
  - Lint pasa
  - Tests pasan (si existen)
```

### FASE D - DOCUMENTACIÓN

**Objetivo:** Registrar, trazar y propagar.

> **IMPORTANTE:** Esta fase tiene dos sub-fases en orden estricto:
> 1. **D1 - Gobernanza** (BLOQUEANTE)
> 2. **D2 - Técnica** (después de gobernanza)

```yaml
actividades:
  # D1 - GOBERNANZA (PRIMERO - BLOQUEANTE)
  d1_gobernanza:
    - Crear carpeta de tarea: orchestration/tareas/TASK-{ID}/
    - Completar METADATA.yml
    - Documentar 01-CONTEXTO.md (qué y por qué)
    - Documentar 05-EJECUCION.md (cómo y qué problemas)
    - Documentar 06-DOCUMENTACION.md (resumen y referencias)
    - Actualizar orchestration/tareas/_INDEX.yml
    - Actualizar traza de agente (opcional pero recomendado)

  # D2 - TÉCNICA (después de gobernanza)
  d2_tecnica:
    - Actualizar inventarios afectados
    - Evaluar propagación (TRIGGER-PROPAGACION-AUTOMATICA)
    - Crear/actualizar documentación técnica si aplica

salidas:
  # Gobernanza
  - Carpeta de tarea con documentación completa
  - _INDEX.yml actualizado
  # Técnica
  - Inventarios actualizados
  - Propagación evaluada/ejecutada

criterios_completitud:
  # Gobernanza (BLOQUEANTE)
  - Carpeta TASK-{ID}/ existe
  - METADATA.yml completo
  - Fases C, E, D documentadas
  - _INDEX.yml actualizado
  # Técnica
  - Inventarios al día
  - Propagación evaluada

validacion:
  checklist: "@DEF_CHK_GOB (gobernanza) + @DEF_CHK_POST (técnica)"
  orden: "Gobernanza PRIMERO, luego técnica"
```

---

## MODOS DE EJECUCIÓN

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
uso: "Investigación, auditoría, exploración, propuestas"
alias: "@ANALYSIS"
nota: "No modifica código"
```

### MODE-PROPAGATION

```yaml
fases: [C, A, P, E, V, D]  # Por cada proyecto destino
uso: "Propagar cambio existente a proyectos relacionados"
alias: "@PROPAGATE"
```

---

## INTEGRACIÓN CON TRIGGERS

```yaml
triggers_por_fase:
  A:
    - TRIGGER-ANTI-DUPLICACION (si creación)
    - TRIGGER-ANALISIS-DEPENDENCIAS (si modificación)
  V:
    - TRIGGER-DUPLICADOS (si se detectan)
  D:
    - TRIGGER-PROPAGACION-AUTOMATICA
    - TRIGGER-DOCUMENTACION-OBLIGATORIA
```

---

## INTEGRACIÓN CON GOBERNANZA

> **OBLIGATORIO:** Toda tarea que complete el ciclo CAPVED DEBE crear documentación de gobernanza.
> **BLOQUEANTE:** Sin gobernanza, la tarea NO está completada.

```yaml
gobernanza:
  checklist: "@DEF_CHK_GOB"

  pasos:
    1_carpeta_tarea:
      accion: "Crear orchestration/tareas/TASK-{ID}/"
      bloqueante: true

    2_metadata:
      accion: "Completar METADATA.yml con todos los campos obligatorios"
      bloqueante: true

    3_fases_minimas:
      accion: "Documentar 01-CONTEXTO.md, 05-EJECUCION.md, 06-DOCUMENTACION.md"
      bloqueante: true

    4_actualizar_indices:
      accion: "Actualizar orchestration/tareas/_INDEX.yml"
      bloqueante: true

    5_traza_agente:
      accion: "Actualizar traza del agente ejecutor"
      bloqueante: false
      nota: "Recomendado pero no bloquea"

  si_falta_gobernanza:
    mensaje: "❌ TAREA NO COMPLETADA - Falta documentación de gobernanza"
    accion: "BLOQUEAR hasta completar"
    referencia: "@DEF_CHK_GOB"

  recordatorio_todolist: |
    Al iniciar cualquier tarea, el TodoList DEBE incluir como último item:
    - content: "Crear documentación de gobernanza (TASK-{ID})"
      status: "pending"
      activeForm: "Documentando gobernanza"
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
./scripts/recreate-database.sh  # DEBE ejecutar sin errores
```

---

## REFERENCIAS

| Alias | Descripción |
|-------|-------------|
| @DEF_CAPVED | Este protocolo |
| @PRINCIPIOS/PRINCIPIO-CAPVED.md | Principio base |
| @SIMCO/SIMCO-TAREA.md | Punto de entrada |
| @TRIGGER-DOC | Documentación obligatoria |

---

**Versión:** 1.0.0 | **Sistema:** SIMCO v4.0.0 | **Tipo:** Protocolo Base
