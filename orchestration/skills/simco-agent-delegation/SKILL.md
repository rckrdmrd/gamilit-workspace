---
name: simco-agent-delegation
description: "Delegacion de tareas a subagentes con contexto minimo y validacion de resultados"
version: 1.0.0
simco_source: orchestration/directivas/simco/SIMCO-DELEGACION.md
category: operation
priority: P1
capved_required: true
agents_compatible:
  - claude-code
  - gemini-cli
  - windsurf
  - trae
dependencies:
  - simco-task-execution
  - simco-apply-standard
triggers:
  - on_delegation
  - on_subtask_creation
  - on_parallel_execution
internal: true
estimated_tokens: 1000
tags:
  - delegacion
  - subagentes
  - contexto
  - nexus
  - orquestacion
input_schema:
  required:
    - subtask_description
    - acceptance_criteria
    - agent_profile
  optional:
    - context_files
    - max_tokens_budget
    - timeout_minutes
    - parallel_group
output_schema:
  success:
    - delegation_report
    - subagent_results
    - integration_status
  error:
    - error_code
    - error_message
contract_version: 1.0.0
---

# simco-agent-delegation

## Proposito
Delegar tareas a subagentes de manera estructurada, proporcionando el contexto minimo necesario (segun NEXUS v4.1), estableciendo criterios de aceptacion claros, validando los resultados del subagente, e integrando los outputs sin contaminar el contexto del agente principal. Soporta delegacion secuencial y paralela (hasta 5 agentes simultaneos).

## Cuando Usar
- Cuando una tarea es demasiado grande o compleja para un solo agente.
- Para auditorias paralelas que requieren multiples perspectivas (ej: 5 streams simultaneos).
- Cuando se necesita un perfil especializado diferente al agente actual (ej: orquestador delega a backend-specialist).
- Para tareas repetitivas que pueden paralelizarse (ej: validar N modulos independientes).

## Cuando NO Usar
- Para tareas simples que el agente actual puede resolver en menos de 5 minutos.
- Cuando el overhead de preparar contexto supera el beneficio de delegar.
- Si no existe un perfil de agente adecuado para la subtarea.
- Para tareas que requieren estado compartido en tiempo real entre agentes (alta coordinacion).

## Prerequisitos
- Tarea principal definida y descompuesta en subtareas independientes.
- Perfiles de agente disponibles en `orchestration/agents/perfiles/` o `compact/`.
- Template de contexto: `orchestration/templates/03-por-proceso/delegacion/TEMPLATE-CONTEXTO-SUBAGENTE.md`.
- Directiva de delegacion: `orchestration/directivas/simco/SIMCO-DELEGACION.md`.

## Instrucciones

### Paso 1: Definir alcance y limites de la subtarea
Para cada subtarea a delegar, documentar explicitamente:
- **Que hacer:** Descripcion precisa del trabajo esperado.
- **Que NO hacer:** Limites claros para evitar scope creep.
- **Entregables:** Archivos, reportes o cambios esperados como output.
- **Criterios de aceptacion:** Condiciones verificables para considerar la subtarea completada.

Ejemplo:
```yaml
subtask:
  name: "Validar entities del modulo gamification"
  do: "Verificar que cada entity tiene DDL, decoradores correctos, datasource registrado"
  do_not: "No modificar codigo, no crear entities nuevas, no tocar otros modulos"
  deliverables:
    - "Lista de entities validadas con estado OK/WARN/FAIL"
    - "Lista de discrepancias encontradas"
  acceptance_criteria:
    - "100% de entities del modulo fueron revisadas"
    - "Cada discrepancia tiene severidad y accion sugerida"
```

### Paso 2: Seleccionar perfil de agente
Elegir el perfil mas adecuado segun el dominio de la subtarea:

| Dominio | Perfil Full | Perfil Compact |
|---------|-------------|----------------|
| Backend NestJS | PERFIL-BACKEND-NESTJS | PERFIL-BACKEND-COMPACT |
| Frontend React | PERFIL-FRONTEND-REACT | PERFIL-FRONTEND-COMPACT |
| Base de datos | PERFIL-DATABASE-POSTGRESQL | PERFIL-DATABASE-COMPACT |
| Deployment | PERFIL-DEPLOY-SERVER | PERFIL-DEPLOY-COMPACT |
| Validacion | PERFIL-INTEGRATION-VALIDATOR | PERFIL-VALIDATOR-COMPACT |
| Multi-dominio | PERFIL-ORQUESTADOR | PERFIL-GENERIC-SUBAGENT |

Usar perfiles compact cuando el presupuesto de tokens es limitado o la tarea es acotada.

### Paso 3: Preparar contexto minimo (NEXUS L3)
Construir el paquete de contexto para el subagente siguiendo NEXUS v4.1:
- **L0 (obligatorio):** CLAUDE.md resumen, SIMCO-TAREA (version compacta).
- **L1 (selectivo):** Solo las secciones de PROJECT-CONTEXT relevantes a la subtarea.
- **L2 (dominio):** Inventario del dominio especifico, directiva SIMCO del dominio.
- **L3 (tarea):** Archivos especificos que el subagente necesitara leer/editar.

**Regla de oro:** Si el contexto total supera 20K tokens, recortar L1 y L2 a resumen de 1 linea por item. El subagente puede cargar mas contexto bajo demanda.

### Paso 4: Delegar con criterios de aceptacion explicitos
Preparar el prompt de delegacion con la estructura:
```
TAREA: [descripcion]
PERFIL: [nombre del perfil]
CONTEXTO: [archivos y datos proporcionados]
LIMITES: [que NO hacer]
ENTREGABLES: [lista de outputs esperados]
CRITERIOS DE ACEPTACION: [condiciones verificables]
TIEMPO ESTIMADO: [minutos]
```

Para delegacion paralela (hasta 5 agentes), asignar identificadores:
- Agente A: [tarea A]
- Agente B: [tarea B]
- ...
- Agente E: [tarea E]

Asegurar que las tareas paralelas son independientes (sin dependencias cruzadas).

### Paso 5: Validar output del subagente
Al recibir el resultado del subagente, verificar:
- **Completitud:** Todos los entregables estan presentes?
- **Criterios:** Cada criterio de aceptacion se cumple?
- **Calidad:** No hay placeholders, `// ...`, o trabajo incompleto?
- **Coherencia:** Los resultados son consistentes con el resto del sistema?
- **Side effects:** El subagente no modifico archivos fuera de su alcance?

Si la validacion falla, documentar que fallo y decidir:
- Re-delegar con instrucciones mas claras.
- Completar el trabajo faltante directamente.
- Escalar si el problema es de capacidad del perfil.

### Paso 6: Integrar resultados y limpiar contexto
Una vez validados los resultados:
1. **Integrar:** Merge de cambios del subagente al branch principal (si aplica).
2. **Documentar:** Registrar en el reporte de tarea que subtareas fueron delegadas y su resultado.
3. **Limpiar contexto:** Purgar L3 del subagente (archivos especificos de su tarea) del contexto del agente principal.
4. **Actualizar PROXIMA-ACCION:** Si la delegacion completo una fase, actualizar el estado en `orchestration/PROXIMA-ACCION.md`.

Para delegacion paralela, esperar a que todos los agentes completen antes de integrar (barrier pattern).

## Manejo de Errores

| Escenario | Accion | Ejemplo |
|-----------|--------|---------|
| Context overflow | Reducir L1/L2 a resumen, usar perfil compact, dividir subtarea | Subagente con 50K tokens -> recortar a 20K con resumen |
| Wrong profile | Re-delegar con perfil correcto, documentar la reasignacion | Tarea DB delegada a frontend -> reasignar a database profile |
| Incomplete output | Re-delegar con instrucciones mas especificas o completar directamente | Subagente entrego 3 de 5 items -> pedir los 2 faltantes |
| Context pollution | Limpiar L3 agresivamente, verificar que archivos stale no persistan | Subagente leyo 20 archivos que el orquestador no necesita -> purgar |
| Parallel conflict | Serializar tareas conflictivas, verificar no hubo ediciones concurrentes | Agente A y B editaron mismo archivo -> resolver merge manual |
| Timeout | Verificar output parcial, decidir si reusar o reiniciar | Subagente no completo en tiempo -> usar output parcial si viable |

## Formato de Salida

```yaml
delegation_result:
  total_subtasks: 3
  completed: 3
  failed: 0
  delegation_report:
    - subtask: "Validar entities gamification"
      agent_profile: "PERFIL-BACKEND-NESTJS"
      status: "completed"
      acceptance_criteria_met: true
      tokens_used: 15000
      duration_minutes: 8
    - subtask: "Auditar API calls frontend"
      agent_profile: "PERFIL-FRONTEND-REACT"
      status: "completed"
      acceptance_criteria_met: true
      tokens_used: 12000
      duration_minutes: 6
    - subtask: "Validar DDL coherencia"
      agent_profile: "PERFIL-DATABASE-POSTGRESQL"
      status: "completed"
      acceptance_criteria_met: true
      tokens_used: 10000
      duration_minutes: 5
  subagent_results:
    - source: "agent_A"
      deliverables: ["entities_report.md"]
      discrepancies: 2
    - source: "agent_B"
      deliverables: ["api_calls_report.md"]
      discrepancies: 0
    - source: "agent_C"
      deliverables: ["ddl_report.md"]
      discrepancies: 1
  integration_status: "merged"
  context_cleaned: true
```

## Checklist de Validacion
- [ ] La subtarea tiene alcance, limites y criterios de aceptacion claros.
- [ ] El perfil de agente seleccionado es adecuado para el dominio.
- [ ] El contexto proporcionado es minimo pero suficiente (NEXUS L3).
- [ ] El prompt de delegacion incluye todos los campos requeridos.
- [ ] El output del subagente fue validado contra los criterios de aceptacion.
- [ ] Los resultados fueron integrados sin conflictos.
- [ ] El contexto L3 del subagente fue purgado despues de la integracion.

## Referencias
- `orchestration/directivas/simco/SIMCO-DELEGACION.md`
- `orchestration/directivas/simco/SIMCO-DELEGACION-PARALELA.md`
- `orchestration/directivas/simco/SIMCO-SUBAGENTE.md`
- `orchestration/directivas/simco/SIMCO-CONTEXT-MANAGEMENT-V2.md`
- `orchestration/templates/03-por-proceso/delegacion/TEMPLATE-CONTEXTO-SUBAGENTE.md`
- `orchestration/agents/perfiles/_MAP.md`
