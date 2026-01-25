# Agent Execution Standards

**Version:** 1.0.0
**Updated:** 2026-01-20

Estandares de ejecucion para agentes en el workspace SIMCO.

---

## 1. Fases de Trabajo Estandar

Toda tarea compleja debe seguir estas fases:

### Fase 1: Analisis Inicial
```
- Entender el alcance de la tarea
- Identificar archivos y modulos involucrados
- Mapear dependencias y dependientes
- Documentar estado actual
```

### Fase 2: Analisis Detallado
```
- Desglosar en subtareas (n niveles si es necesario)
- Cada subtarea debe cumplir principio CAPVED
- Identificar archivos especificos por subtarea
- Mapear referencias cruzadas
```

### Fase 3: Planeacion
```
- Ordenar subtareas por dependencias
- Identificar tareas paralelizables
- Asignar perfiles de agente a cada tarea
- Definir contexto necesario por tarea
- Documentar plan en orchestration/
```

### Fase 4: Validacion de Planeacion
```
- Verificar que plan cubre todos los requisitos del analisis
- Validar dependencias de cada tarea
- Confirmar que no hay tareas huerfanas
- Verificar coherencia con estandares SIMCO
```

### Fase 5: Refinamiento del Plan
```
- Ajustar segun validacion
- Agregar tareas faltantes
- Eliminar tareas redundantes
- Documentar cambios al plan
```

### Fase 6: Ejecucion
```
- Ejecutar tareas en orden definido
- Tareas sin dependencia pueden ser paralelas
- Cada tarea sigue CAPVED
- Documentar progreso
```

### Fase 7: Validacion de Ejecucion
```
- Verificar cada archivo modificado
- Validar coherencia entre capas (DDL-Backend-Frontend)
- Ejecutar build/lint/tests
- Validar recreate-database si hay cambios DDL
- Documentar resultados
```

---

## 2. Principio CAPVED en Subtareas

Cada tarea y subtarea a cualquier nivel debe aplicar:

```
C - Contexto: Cargar solo archivos necesarios para esta subtarea
A - Analisis: Entender impacto especifico
P - Planeacion: Definir pasos de esta subtarea
V - Validacion: Gate antes de ejecutar
E - Ejecucion: Implementar cambios
D - Documentacion: Registrar en orchestration/ y docs/
```

---

## 3. Validaciones de Coherencia

### Si hay cambios en Base de Datos (DDL)

```bash
# 1. Actualizar DDL en database/ddl/
# 2. Actualizar create-database.sh o recreate-database.sh
# 3. Ejecutar recreacion para validar
wsl -d Ubuntu-24.04 -u developer -- bash /path/to/recreate-database.sh

# 4. Validar que objetos existen
# 5. Actualizar entities en backend si aplica
# 6. Actualizar inventarios
```

### Si hay cambios en Backend

```bash
# 1. Validar build
npm run build

# 2. Validar lint
npm run lint

# 3. Ejecutar tests
npm run test

# 4. Verificar endpoints documentados en Swagger
# 5. Actualizar inventarios
```

### Si hay cambios en Frontend

```bash
# 1. Validar build
npm run build

# 2. Validar lint
npm run lint

# 3. Validar typecheck
npm run typecheck

# 4. Verificar integracion con backend
# 5. Actualizar inventarios
```

---

## 4. Analisis de Dependencias

### Antes de modificar cualquier archivo

```
1. Identificar DEPENDENCIAS (archivos que este archivo importa)
   - Listar imports
   - Verificar que no se rompen

2. Identificar DEPENDIENTES (archivos que importan este archivo)
   - Buscar con grep: "import.*from.*{archivo}"
   - Verificar que cambios son compatibles
   - Actualizar dependientes si es necesario

3. Documentar impacto
   - Lista de archivos afectados
   - Cambios requeridos en cada uno
```

---

## 5. Documentacion Obligatoria

### Ubicaciones

| Tipo | Ubicacion |
|------|-----------|
| Tarea | `orchestration/tareas/TASK-{fecha}-{nombre}/` |
| Definiciones | `docs/` del proyecto |
| Inventarios | `orchestration/inventarios/` |
| Trazas | `orchestration/agents/trazas/` |

### Contenido Minimo por Tarea

```
orchestration/tareas/TASK-YYYY-MM-DD-NOMBRE/
├── METADATA.yml          # Info de la tarea
├── PLAN.md               # Plan de ejecucion
├── ANALYSIS.md           # Analisis detallado
├── EXECUTION-LOG.md      # Log de ejecucion
├── VALIDATION-REPORT.md  # Resultados de validacion
└── FILES-REFERENCE.yml   # Paths absolutos de archivos
```

---

## 6. Orquestacion de Subagentes

### Contexto para Subagentes

Cada subagente debe recibir:

```yaml
subagent_context:
  # Identificacion
  task_id: "TASK-2026-01-20-XXX"
  subtask_id: "SUBTASK-001"

  # Perfil
  profile: "PERFIL-BACKEND.md"

  # Archivos de referencia (paths absolutos)
  references:
    - "/path/to/definition.yml"
    - "/path/to/related-file.ts"

  # Archivos a modificar
  target_files:
    - "/path/to/file-to-modify.ts"

  # Dependencias
  dependencies:
    - "SUBTASK-000 must be completed first"

  # Entregables esperados
  deliverables:
    - "Modified file.ts"
    - "Updated inventory"
```

### Paralelizacion

```
SI: Subtareas sin dependencias entre si
NO: Subtareas que dependen de resultados de otras

Ejemplo:
- SUBTASK-001 (Componente A) ──┬──> Paralelo
- SUBTASK-002 (Componente B) ──┘
- SUBTASK-003 (Integracion A+B) ──> Secuencial (despues de 001 y 002)
```

---

## 7. Informe de Tarea

### Template de Informe Final

```markdown
# Informe de Tarea: {TASK-ID}

## 1. Definicion
- **Prompt original:** {texto del prompt}
- **Objetivo:** {descripcion}
- **Alcance:** {modulos/archivos afectados}

## 2. Analisis Realizado
- **Archivos analizados:** {lista con paths}
- **Dependencias identificadas:** {lista}
- **Hallazgos:** {resumen}

## 3. Planeacion
- **Subtareas definidas:** {cantidad}
- **Tareas paralelas:** {lista}
- **Tareas secuenciales:** {lista}

## 4. Ejecucion
### Subtarea 1: {nombre}
- **Perfil usado:** {perfil}
- **Archivos modificados:** {paths absolutos}
- **Resultado:** {exito/fallo}

### Subtarea N: {nombre}
...

## 5. Validaciones
- **Build:** PASS/FAIL
- **Lint:** PASS/FAIL
- **Tests:** PASS/FAIL
- **Recreate DB:** PASS/FAIL (si aplica)

## 6. Archivos Generados/Modificados
| Archivo | Tipo | Accion |
|---------|------|--------|
| /path/to/file | Definicion | Creado |
| /path/to/other | Codigo | Modificado |

## 7. Metricas
- **Tokens estimados:** {total}
- **Subagentes usados:** {cantidad}
- **Tiempo total:** {si disponible}

## 8. Lecciones Aprendidas
- {punto 1}
- {punto 2}
```

---

## 8. Tracking de Contexto/Tokens

### Por Tarea

```yaml
# En METADATA.yml de cada tarea
context_tracking:
  estimated_tokens:
    initial_context: 5000
    files_loaded: 15000
    total_conversation: 45000

  context_cleanups: 2
  checkpoints_created: 3

  subagents:
    - id: "subagent-001"
      profile: "PERFIL-BACKEND"
      estimated_tokens: 12000
      files_loaded: 5
    - id: "subagent-002"
      profile: "PERFIL-FRONTEND"
      estimated_tokens: 8000
      files_loaded: 3
```

### Indicadores de Eficiencia

```yaml
efficiency_metrics:
  # Menor es mejor
  tokens_per_file_modified: 3000

  # Mayor es mejor
  tasks_completed_per_cleanup: 5

  # Objetivo: < 50%
  context_utilization_peak: "45%"
```

---

## 9. Referencias de Archivos

### Formato para paths absolutos

```yaml
# FILES-REFERENCE.yml
task_id: "TASK-2026-01-20-XXX"

files:
  definitions:
    - path: "C:/Empresas/ISEM/workspace-v2/docs/50-requerimientos/RF-001.md"
      type: "requirement"
      action: "reference"

  modified:
    - path: "C:/Empresas/ISEM/workspace-v2/projects/gamilit/apps/backend/src/modules/users/users.service.ts"
      type: "backend"
      action: "modified"
      changes: "Added new method getUserById"

  created:
    - path: "C:/Empresas/ISEM/workspace-v2/orchestration/tareas/TASK-2026-01-20-XXX/METADATA.yml"
      type: "documentation"
      action: "created"

  inventories_updated:
    - path: "C:/Empresas/ISEM/workspace-v2/orchestration/inventarios/BACKEND_INVENTORY.yml"
      type: "inventory"
```

---

## 10. Integracion con Roles de Agentes

### Claude Code (Arquitecto)
- Ejecuta Fases 1-5 (Analisis a Refinamiento)
- Orquesta subagentes para Fase 6
- Ejecuta Fase 7 (Validacion final)
- Genera Informe de Tarea

### Trae (Ejecutor)
- Recibe plan de Fase 5
- Ejecuta Fase 6 con subtareas asignadas
- Reporta para Fase 7
- Sigue instrucciones de manejo de contexto

### Gemini (QA/Testing)
- Participa en Fase 7 (Validacion)
- Ejecuta tests E2E en navegador
- Reporta resultados

---

## Referencias

- Roles de agentes: `orchestration/agents/AGENT-ROLES.md`
- Prompts de arranque: `orchestration/referencias/AGENT-STARTUP-PROMPTS.md`
- Principio CAPVED: `orchestration/directivas/principios/PRINCIPIO-CAPVED.md`
- Template de tarea: `orchestration/tareas/_templates/TASK-TEMPLATE/`
