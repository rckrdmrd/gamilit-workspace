# DIRECTIVA: CARGA DE CONTEXTO SEGUN NIVEL

**Version:** 2.0.0
**Fecha:** 2025-12-26
**Nivel:** WORKSPACE
**Tipo:** Directiva Fundamental - OBLIGATORIA
**Aplica a:** TODOS los agentes y subagentes
**Sistema:** SIMCO v3.3 + CAPVED

---

## PROPOSITO

Esta directiva define **COMO** cargar las directivas correctas segun el nivel de trabajo especificado en el prompt.

**Arquitectura workspace-v1:** 3 capas principales:
- **control-plane/** - Orchestration, registries, CI/CD
- **core/** - Catalogo, modulos, standards
- **projects/** - Proyectos de negocio

---

## PASO 1: IDENTIFICAR NIVEL DE TRABAJO

Cuando recibas un prompt con:
- **perfil:** {nombre del perfil}
- **proyecto:** {nombre del proyecto}
- **subproyecto:** {nombre} (opcional)
- **tarea:** {descripcion}

Determinar el nivel segun esta tabla:

| Si proyecto es... | Y subproyecto es... | Entonces nivel es... |
|-------------------|---------------------|----------------------|
| gamilit | null | **STANDALONE** |
| trading-platform | null | **STANDALONE** |
| betting-analytics | null | **STANDALONE** |
| erp-suite | null | **SUITE** |
| erp-suite | erp-core | **SUITE-CORE** |
| erp-suite | verticales/{nombre} | **VERTICAL** |
| erp-suite | saas | **SUITE-SERVICE** |
| erp-suite | products/{nombre} | **SUITE-PRODUCT** |

---

## PASO 2: OBTENER CADENA DE HERENCIA

Segun el nivel identificado, cargar directivas en este orden:

### STANDALONE
```
1. WORKSPACE     → workspace-v1/orchestration/directivas/
2. CONTROL-PLANE → orchestration/directivas/principios/
3. CONTROL-PLANE → orchestration/directivas/simco/
4. CONTROL-PLANE → orchestration/agents/perfiles/PERFIL-{PERFIL}.md
5. PROYECTO      → projects/{proyecto}/orchestration/00-guidelines/
```

### SUITE
```
1. WORKSPACE     → workspace-v1/orchestration/directivas/
2. CONTROL-PLANE → orchestration/directivas/principios/
3. CONTROL-PLANE → orchestration/directivas/simco/
4. CONTROL-PLANE → orchestration/agents/perfiles/PERFIL-{PERFIL}.md
5. SUITE         → projects/erp-suite/orchestration/00-guidelines/
```

### SUITE-CORE
```
1. WORKSPACE     → workspace-v1/orchestration/directivas/
2. CONTROL-PLANE → orchestration/directivas/principios/
3. CONTROL-PLANE → orchestration/directivas/simco/
4. CONTROL-PLANE → orchestration/agents/perfiles/PERFIL-{PERFIL}.md
5. SUITE         → projects/erp-suite/orchestration/00-guidelines/
6. SUITE-CORE    → projects/erp-suite/apps/erp-core/orchestration/00-guidelines/
```

### VERTICAL
```
1. WORKSPACE     → workspace-v1/orchestration/directivas/
2. CONTROL-PLANE → orchestration/directivas/principios/
3. CONTROL-PLANE → orchestration/directivas/simco/
4. CONTROL-PLANE → orchestration/agents/perfiles/PERFIL-{PERFIL}.md
5. SUITE         → projects/erp-suite/orchestration/00-guidelines/
6. SUITE-CORE    → projects/erp-suite/apps/erp-core/orchestration/00-guidelines/
7. VERTICAL      → projects/erp-suite/apps/verticales/{vertical}/orchestration/00-guidelines/
```

---

## PASO 3: CARGAR DIRECTIVAS OBLIGATORIAS

### 3.1 Principios Fundamentales (6 - SIEMPRE obligatorios)

```yaml
Principios_Obligatorios:
  - orchestration/directivas/principios/PRINCIPIO-CAPVED.md
  - orchestration/directivas/principios/PRINCIPIO-DOC-PRIMERO.md
  - orchestration/directivas/principios/PRINCIPIO-ANTI-DUPLICACION.md
  - orchestration/directivas/principios/PRINCIPIO-VALIDACION-OBLIGATORIA.md
  - orchestration/directivas/principios/PRINCIPIO-ECONOMIA-TOKENS.md
  - orchestration/directivas/principios/PRINCIPIO-NO-ASUMIR.md
```

### 3.2 Operacion Principal (SIEMPRE obligatoria)

```yaml
Operacion_Principal:
  - orchestration/directivas/simco/SIMCO-TAREA.md
```

### 3.3 Perfil del Agente (Segun perfil especificado)

```yaml
Perfil:
  - orchestration/agents/perfiles/PERFIL-{PERFIL}.md
```

### 3.4 Contexto del Proyecto (SIEMPRE obligatorio)

```yaml
Contexto:
  - projects/{proyecto}/orchestration/00-guidelines/PROJECT-CONTEXT.md
  - projects/{proyecto}/orchestration/00-guidelines/HERENCIA-SIMCO.md
```

### 3.5 Segun Operacion (Cargar si aplica)

```yaml
Si_operacion_es_DDL:
  - orchestration/directivas/simco/SIMCO-DDL.md

Si_operacion_es_BACKEND:
  - orchestration/directivas/simco/SIMCO-BACKEND.md

Si_operacion_es_FRONTEND:
  - orchestration/directivas/simco/SIMCO-FRONTEND.md

Si_operacion_es_MOBILE:
  - orchestration/directivas/simco/SIMCO-MOBILE.md

Si_operacion_es_ML:
  - orchestration/directivas/simco/SIMCO-ML.md

Si_operacion_es_DEVOPS:
  - orchestration/directivas/simco/SIMCO-DEVOPS.md

Si_operacion_es_CREAR:
  - orchestration/directivas/simco/SIMCO-CREAR.md

Si_operacion_es_MODIFICAR:
  - orchestration/directivas/simco/SIMCO-MODIFICAR.md

Si_operacion_es_DELEGAR:
  - orchestration/directivas/simco/SIMCO-DELEGACION.md
```

---

## PASO 4: RESOLVER CONTEXTO DEL PROYECTO

Leer `PROJECT-CONTEXT.md` del nivel mas especifico y obtener:

```yaml
Variables_a_Resolver:
  PROJECT: "{nombre del proyecto}"
  PROJECT_LEVEL: "{STANDALONE | SUITE | VERTICAL | etc}"
  DB_NAME: "{nombre de la base de datos}"
  DB_DDL_PATH: "{ruta a DDL}"
  BACKEND_ROOT: "{ruta a backend}"
  FRONTEND_ROOT: "{ruta a frontend}"
  CATALOG_PATH: "shared/catalog/"
```

---

## PASO 5: CONFIRMAR CARGA

Antes de proceder con la tarea, generar confirmacion:

```yaml
Confirmacion_Carga:
  nivel_identificado: "{NIVEL}"
  proyecto: "{nombre}"
  subproyecto: "{nombre o null}"
  perfil: "{PERFIL}"

  directivas_cargadas:
    workspace: [lista]
    principios: [6 principios]
    operacion_principal: ["SIMCO-TAREA.md"]
    perfil: ["{PERFIL}.md"]
    proyecto: [lista]
    especificas: [lista segun operacion]

  contexto_resuelto:
    PROJECT: "{valor}"
    PROJECT_LEVEL: "{valor}"
    DB_DDL_PATH: "{valor}"
    BACKEND_ROOT: "{valor}"
    FRONTEND_ROOT: "{valor}"

  estado: "READY_TO_EXECUTE"
```

---

## PASO 6: EJECUTAR CICLO CAPVED

Una vez confirmada la carga, seguir el ciclo CAPVED:

```
C - Contexto:     ✓ Completado en pasos 1-5
A - Analisis:     Analizar alcance e impacto de la tarea
P - Planeacion:   Crear plan de implementacion (dividir en fases/subfases)
V - Validacion:   Validar plan vs analisis (NO DELEGAR)
E - Ejecucion:    Implementar en orden planificado
D - Documentacion: Actualizar docs/ como estado FINAL
```

---

## EJEMPLO DE PROMPT DE INICIALIZACION

```markdown
## Inicializacion de Agente

**Perfil:** BACKEND
**Proyecto:** gamilit
**Subproyecto:** null
**Tarea:** Implementar endpoint de autenticacion JWT

---

### Carga de Contexto

1. Leer: orchestration/INDICE-DIRECTIVAS-WORKSPACE.yml
2. Nivel identificado: STANDALONE
3. Cargar principios: 6 obligatorios
4. Cargar SIMCO-TAREA.md
5. Cargar PERFIL-BACKEND.md
6. Cargar SIMCO-BACKEND.md (segun operacion)
7. Cargar projects/gamilit/orchestration/00-guidelines/PROJECT-CONTEXT.md

### Confirmacion
- Nivel: STANDALONE
- Proyecto: gamilit
- Perfil: BACKEND
- Estado: READY_TO_EXECUTE

### Ejecutar Ciclo CAPVED
...
```

---

## DELEGACION A SUBAGENTES

Cuando delegues a un subagente, incluir en el prompt:

```markdown
## Contexto para Subagente

**Perfil:** {perfil del subagente}
**Proyecto:** {nombre}
**Subproyecto:** {nombre o null}
**Nivel:** {STANDALONE | SUITE | VERTICAL | etc}

**Directivas Cargadas:**
- Principios: 6 obligatorios
- SIMCO-TAREA.md
- SIMCO-{DOMINIO}.md (segun aplique)
- PERFIL-{SUBAGENTE}.md

**Contexto Resuelto:**
- PROJECT: {valor}
- DB_DDL_PATH: {valor}
- BACKEND_ROOT: {valor}

**Tarea Especifica:** {descripcion de subtarea}

**Restricciones:**
- Seguir principio CAPVED
- Documentar como estado FINAL (no historico)
- Reportar hallazgos al agente principal
- Si falta informacion → DETENER y escalar (NO ASUMIR)
```

---

## CONSULTAR INDICE MAESTRO

Para ver todas las directivas disponibles:

```
Archivo: /home/isem/workspace-v1/orchestration/INDICE-DIRECTIVAS-WORKSPACE.yml
```

Este archivo contiene:
- Arquitectura de 3 capas
- Todas las directivas por nivel
- Aliases (@CAPVED, @TAREA, @OP_BACKEND, etc.)
- Cadenas de herencia
- Proyectos y subproyectos disponibles
- 28 perfiles de agentes

---

## METODOLOGIA DE FASES Y SUBFASES

Para tareas complejas, aplicar subdivision en N niveles:

```yaml
Fase_1_Planeacion_Analisis:
  descripcion: "Planificar como analizar la tarea"
  subfases:
    - 1.1: Identificar alcance
    - 1.2: Identificar dependencias
    - 1.3: Definir criterios de exito

Fase_2_Ejecucion_Analisis:
  descripcion: "Ejecutar analisis segun plan"
  subfases:
    - 2.1: Leer documentacion existente
    - 2.2: Mapear objetos impactados
    - 2.3: Identificar riesgos

Fase_3_Planeacion_Implementacion:
  descripcion: "Planificar implementacion/correccion"
  subfases:
    - 3.1: Definir orden de tareas
    - 3.2: Asignar agentes por tarea
    - 3.3: Definir validaciones

Fase_4_Validacion_Planeacion:
  descripcion: "Validar plan contra analisis"
  subfases:
    - 4.1: Verificar que no falten objetos
    - 4.2: Verificar dependencias cubiertas
    - 4.3: Validar impactos secundarios

Fase_5_Ejecucion_Implementacion:
  descripcion: "Ejecutar implementacion"
  subfases:
    - 5.1: Implementar en orden
    - 5.2: Validar cada paso
    - 5.3: Documentar cambios
```

---

## ERRORES COMUNES

### Error: No se identifica el nivel
```
Solucion: Verificar que proyecto y subproyecto estan correctamente especificados
```

### Error: Directiva no encontrada
```
Solucion: Consultar INDICE-DIRECTIVAS-WORKSPACE.yml para rutas correctas
Nota: Las directivas ahora estan en control-plane/orchestration/
```

### Error: Contexto no resuelto
```
Solucion: Verificar que PROJECT-CONTEXT.md existe en el nivel especificado
```

### Error: Perfil no encontrado
```
Solucion: Verificar lista de 28 perfiles en orchestration/agents/perfiles/
```

---

## REFERENCIAS RAPIDAS

| Documento | Alias | Proposito |
|-----------|-------|-----------|
| PRINCIPIO-CAPVED.md | @CAPVED | Ciclo de vida de tareas |
| PRINCIPIO-DOC-PRIMERO.md | @DOC-PRIMERO | Documentar antes de implementar |
| PRINCIPIO-NO-ASUMIR.md | @NO-ASUMIR | Preguntar si falta info |
| SIMCO-TAREA.md | @TAREA | Proceso detallado de tareas |
| SIMCO-DELEGACION.md | @DELEGAR | Delegar a subagentes |
| INDICE-DIRECTIVAS-WORKSPACE.yml | @INDICE | Indice maestro |

---

**Esta directiva es OBLIGATORIA para todo agente y subagente.**

---

**Version:** 2.0.0 | **Nivel:** WORKSPACE | **Sistema:** SIMCO v3.3
