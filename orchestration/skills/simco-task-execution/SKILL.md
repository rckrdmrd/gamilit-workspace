---
name: simco-task-execution
description: "Ejecucion de tareas con ciclo CAPVED y evidencia de cierre"
version: 1.0.0
simco_source: orchestration/directivas/simco/SIMCO-TAREA.md
category: core
priority: P0
capved_required: true
agents_compatible:
  - claude-code
  - gemini-cli
  - windsurf
  - trae
dependencies: []
triggers:
  - on_task_start
  - on_task_complete
internal: true
estimated_tokens: 900
tags:
  - capved
  - ejecucion
  - trazabilidad
input_schema:
  required:
    - task_description
    - objective
    - scope
  optional:
    - constraints
    - references
output_schema:
  success:
    - phase_status
    - validation_results
    - evidence_summary
  error:
    - error_code
    - error_message
contract_version: 1.0.0
---

# simco-task-execution

## Proposito
Aplicar una secuencia uniforme para ejecutar tareas con control de fase, validaciones y evidencia final.

## Cuando Usar
- Al iniciar cualquier tarea que cambie codigo, docs o configuracion.
- Cuando se requiere trazabilidad entre analisis, implementacion y validacion.

## Cuando NO Usar
- Para operaciones de solo lectura o analisis exploratorio que no producen cambios.
- Para consultas simples que se resuelven con un solo comando o lectura de archivo.
- Para correcciones de typos en un solo archivo que no requieren ciclo CAPVED completo (usar modo QUICK en su lugar).

## Prerequisitos
- Tarea definida por el usuario.
- Contexto base cargado (perfil y directivas core).

## Instrucciones
### Paso 1: Clasificar alcance y fase
Identificar si la tarea es de creacion, modificacion, validacion o investigacion. Declarar fase CAPVED inicial.

### Paso 2: Ejecutar trabajo por incrementos
Realizar cambios pequenos y verificables, evitando mezclar objetivos no relacionados.

### Paso 3: Verificar progreso incremental
Despues de cada cambio significativo (archivo editado, modulo creado), verificar que compila/valida correctamente antes de continuar con el siguiente cambio. Esto evita acumular errores en cadena. Para backend: `npm run build`. Para frontend: `npm run typecheck`. Para docs: verificar links y estructura.

### Paso 4: Evaluar riesgos residuales
Antes de cerrar la fase de ejecucion, evaluar:
- Que podria fallar con los cambios realizados? (regresiones, side effects)
- Hay dependencias downstream que podrian romperse? (otros modulos, frontend, tests)
- Existen blockers o condiciones no resueltas? Documentarlos explicitamente.

### Paso 5: Validar antes de cerrar
Ejecutar validaciones tecnicas aplicables (build, lint, typecheck, tests o validacion documental).

### Paso 6: Registrar evidencia
Documentar resultados, riesgos residuales y siguientes acciones. Incluir:
- Resumen de cambios realizados (archivos, lineas, modulos afectados).
- Resultado de validaciones (pass/fail con detalle).
- Riesgos residuales identificados en Paso 4.
- Proximas acciones recomendadas.

## Manejo de Errores

| Escenario | Accion | Ejemplo |
|-----------|--------|---------|
| Build failure | Identificar error, revertir ultimo cambio si es necesario, corregir y re-validar | `npm run build` falla por import circular -> resolver dependencia |
| Test failure | Analizar si el test fallo por el cambio (regresion) o era preexistente; corregir solo regresiones propias | Test de gamification falla despues de cambiar entity -> fix |
| Lint error | Corregir automaticamente si es posible (`npm run lint -- --fix`), manualmente si no | Missing semicolon, unused import -> auto-fix |
| Merge conflict | Resolver manualmente verificando coherencia de ambas versiones, no elegir ciegamente | Dos ramas modificaron mismo service -> merge manual |
| Context overflow | Pausar, registrar estado actual en PROXIMA-ACCION, purgar L3, continuar o delegar | >80% ventana usada -> documentar y delegar resto |

## Formato de Salida

```yaml
task_execution_result:
  task_id: "[GAM-XXX]"
  phase_status:
    capved_phase: "D" # C=Contexto, A=Analisis, P=Planificacion, V=Validacion, E=Ejecucion, D=Documentacion
    completed: true
  validation_results:
    build: "pass" | "fail"
    lint: "pass" | "fail"
    tests: "pass" | "fail" | "skipped"
    typecheck: "pass" | "fail" | "skipped"
  evidence_summary:
    files_changed: 5
    lines_added: 120
    lines_removed: 30
    modules_affected: ["gamification", "progress"]
    risks_residual: []
    next_actions: ["Actualizar inventario", "Verificar en staging"]
```

## Checklist de Validacion
- [ ] Se identifico la fase CAPVED de inicio.
- [ ] Se completaron cambios alineados al objetivo.
- [ ] Se verifico progreso incremental despues de cada cambio significativo.
- [ ] Se evaluaron riesgos residuales antes de cerrar.
- [ ] Se ejecuto validacion aplicable (build, lint, tests).
- [ ] Se reporto evidencia de cierre con formato estandar.

## Referencias
- `orchestration/directivas/simco/SIMCO-TAREA.md`
- `orchestration/directivas/principios/PRINCIPIO-CAPVED.md`
