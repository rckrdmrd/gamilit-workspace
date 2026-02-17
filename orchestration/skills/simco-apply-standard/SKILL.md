---
name: simco-apply-standard
description: "Aplicacion consistente de estandares y fuentes SSOT"
version: 1.0.0
simco_source: orchestration/directivas/simco/SIMCO-ESTANDARES.md
category: core
priority: P0
capved_required: false
agents_compatible:
  - claude-code
  - gemini-cli
  - windsurf
  - trae
dependencies: []
triggers:
  - on_task_start
  - on_validation
internal: true
estimated_tokens: 700
tags:
  - estandares
  - ssot
  - gobernanza
input_schema:
  required:
    - task_domain
    - target_artifacts
  optional:
    - standard_overrides
output_schema:
  success:
    - standards_applied
    - ssot_validated
  error:
    - error_code
    - error_message
contract_version: 1.0.0
---

# simco-apply-standard

## Proposito
Forzar el uso de estandares vigentes y de una fuente de verdad unica durante toda la tarea.

## Cuando Usar
- Al inicio de tareas multiarchivo o de integracion.
- Cuando hay riesgo de inconsistencia documental/tecnica.
- Al crear nuevos modulos, entities, controllers o componentes que deben seguir patrones existentes.

## Cuando NO Usar
- Cuando no existen estandares documentados para el dominio en cuestion (crear el estandar primero).
- Durante prototipado rapido o pruebas de concepto donde la prioridad es velocidad sobre conformidad.
- Para cambios cosmeticos que no afectan la conformidad con estandares (ej: reordenar imports).

## Mapeo Dominio a Estandar

```yaml
mapping_domain_to_standard:
  backend:
    - ESTANDAR-BACKEND-PROFESIONAL.md
    - backend-profesional/01-principios-solid.md
    - backend-profesional/05-manejo-errores.md
    - backend-profesional/07-testing-patterns.md
  database:
    - ESTANDAR-DATABASE-PROFESIONAL.md
  frontend:
    - ESTANDAR-FRONTEND-PROFESIONAL.md
  api:
    - ESTANDAR-API.md
    - ESTANDAR-NOMENCLATURA-API.md
  git:
    - ESTANDAR-GIT.md
  testing:
    - ESTANDAR-TESTING.md
  seguridad:
    - ESTANDAR-SEGURIDAD.md
  documentacion:
    - ESTANDAR-DOCUMENTACION.md
  performance:
    - ESTANDAR-PERFORMANCE.md
  skills:
    - ESTANDAR-SKILLS.md
```

Todos los archivos de estandar se encuentran en `docs/40-standards/`. Los archivos de `backend-profesional/` son sub-estandares detallados dentro de `docs/40-standards/backend-profesional/`.

## Instrucciones
### Paso 1: Identificar estandares aplicables
Detectar los documentos de estandar y directivas relevantes para la tarea.

### Paso 2: Identificar SSOT del dominio
Ubicar el archivo canonico de datos/metricas/mapeos para evitar duplicidad. Los SSOT principales son:
- `orchestration/inventarios/MASTER_INVENTORY.yml` -- metricas globales del proyecto
- `orchestration/inventarios/BACKEND_INVENTORY.yml` -- inventario detallado del backend
- `orchestration/inventarios/FRONTEND_INVENTORY.yml` -- inventario detallado del frontend
- `orchestration/inventarios/DATABASE_INVENTORY.yml` -- inventario de objetos de base de datos

### Paso 3: Mapear dominio a archivos de estandar
Usando el mapeo de la seccion "Mapeo Dominio a Estandar", cargar los archivos de estandar relevantes. Si el dominio no aparece en el mapeo, buscar en `docs/40-standards/` un archivo ESTANDAR-*.md que aplique. Si no existe ningun estandar para el dominio, documentar esta carencia como hallazgo.

### Paso 4: Ejecutar cambios alineados
Aplicar cambios respetando convenciones de nombres, estructura y validaciones definidas en los estandares cargados.

### Paso 5: Documentar desviaciones
Si algun cambio no puede seguir el estandar al pie de la letra (por limitaciones tecnicas, excepciones justificadas, etc.):
- Documentar la desviacion explicitamente en el entregable de la tarea.
- Si la desviacion es significativa o recurrente, crear un ADR en `docs/90-adr/` explicando la decision.
- Nunca dejar desviaciones silenciosas -- toda excepcion al estandar debe ser trazable.

### Paso 6: Verificar coherencia cruzada
Comprobar que documentos y artefactos referencian rutas y estados consistentes. Verificar:
- Que los inventarios SSOT reflejan los cambios realizados.
- Que las rutas referenciadas en la documentacion existen y son correctas.
- Que no se introdujeron contradicciones con otros documentos del mismo dominio.

## Manejo de Errores

| Escenario | Accion | Ejemplo |
|-----------|--------|---------|
| Standard not found | Buscar en `docs/40-standards/`, si no existe documentar como gap y aplicar mejores practicas generales | No hay ESTANDAR-WEBSOCKET -> usar convenciones generales de backend |
| Conflicting standards | Priorizar el estandar mas especifico; documentar el conflicto para resolucion futura | ESTANDAR-API y ESTANDAR-BACKEND difieren en naming -> API prevalece para endpoints |
| SSOT stale | Actualizar el inventario SSOT con datos reales antes de continuar | MASTER_INVENTORY dice 899 endpoints pero real es 901 -> actualizar |
| Cross-reference mismatch | Corregir la referencia que diverge de la fuente de verdad (SSOT) | Doc dice "18 modulos" pero BACKEND_INVENTORY dice "23" -> corregir doc |
| Domain not in mapping | Agregar el dominio al mapeo si existe estandar, o documentar como gap | Nuevo dominio "observability" -> agregar referencia a ESTANDAR-OBSERVABILIDAD |

## Formato de Salida

```yaml
apply_standard_result:
  task_domain: "backend"
  standards_applied:
    - name: "ESTANDAR-BACKEND-PROFESIONAL.md"
      path: "docs/40-standards/ESTANDAR-BACKEND-PROFESIONAL.md"
      sections_used: ["naming", "error-handling", "testing"]
    - name: "01-principios-solid.md"
      path: "docs/40-standards/backend-profesional/01-principios-solid.md"
      sections_used: ["dependency-injection", "single-responsibility"]
  ssot_validated:
    - inventory: "BACKEND_INVENTORY.yml"
      status: "current"
    - inventory: "MASTER_INVENTORY.yml"
      status: "updated"
  deviations:
    - description: "Used custom error class instead of standard NestJS HttpException"
      justification: "Domain-specific error context required"
      documented_in: "ADR-XXX"
  coherence_check: "pass"
```

## Checklist de Validacion
- [ ] Se identificaron estandares vigentes usando el mapeo dominio-estandar.
- [ ] Se uso una fuente SSOT por dominio y se verifico que esta actualizada.
- [ ] Los cambios siguen las convenciones del estandar aplicable.
- [ ] Las desviaciones (si las hay) fueron documentadas explicitamente.
- [ ] No se introdujeron contradicciones con docs existentes.
- [ ] Se verifico coherencia cruzada entre artefactos y documentacion.

## Referencias
- `orchestration/directivas/simco/SIMCO-ESTANDARES.md`
- `orchestration/inventarios/MASTER_INVENTORY.yml`
