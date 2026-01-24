# PLAN: SISTEMA DE DIRECTIVAS MULTINIVEL

**Fecha:** 2025-12-18
**Tipo:** Plan de Implementacion
**Estado:** FASE 1 - Planeacion

---

## OBJETIVO

Crear un sistema de directivas con trazabilidad completa que permita:

1. **Directivas genericas** a nivel WORKSPACE/CORE
2. **Directivas especificas** en cada nivel de proyecto
3. **Carga automatica** segun el nivel de trabajo especificado
4. **Herencia clara** entre niveles

---

## NIVELES IDENTIFICADOS EN EL WORKSPACE

```
NIVEL 0: WORKSPACE
└── /home/isem/workspace/

NIVEL 1: CORE
└── /home/isem/workspace/core/

NIVEL 2A: STANDALONE (5 proyectos)
├── gamilit
├── trading-platform
├── betting-analytics
├── inmobiliaria-analytics
└── platform_marketing_content

NIVEL 2B: SUITE (erp-suite)
├── NIVEL 2B.1: SUITE-CORE (erp-core)
├── NIVEL 2B.2: VERTICALES (5)
│   ├── clinicas
│   ├── construccion
│   ├── mecanicas-diesel
│   ├── retail
│   └── vidrio-templado
├── NIVEL 2B.3: SUITE-SERVICE (saas)
└── NIVEL 2B.4: SUITE-PRODUCT (erp-basico, pos-micro)
```

---

## ARQUITECTURA DE DIRECTIVAS POR NIVEL

### Estructura Propuesta

```
NIVEL 0: WORKSPACE
/home/isem/workspace/
├── orchestration/
│   ├── directivas/
│   │   ├── DIRECTIVA-WORKSPACE-ESTANDAR.md      # [NUEVO] Estandar workspace
│   │   └── DIRECTIVA-CARGA-CONTEXTO.md          # [NUEVO] Como cargar contexto
│   └── INDICE-DIRECTIVAS-WORKSPACE.yml          # [NUEVO] Indice maestro

NIVEL 1: CORE
/home/isem/workspace/core/
├── orchestration/
│   ├── directivas/
│   │   ├── simco/                                # [EXISTENTE] 22 SIMCO
│   │   ├── principios/                           # [EXISTENTE] 6 principios
│   │   └── DIRECTIVA-DOCUMENTACION-DEFINITIVA.md # [MOVER AQUI]
│   └── INDICE-DIRECTIVAS-CORE.yml               # [NUEVO]

NIVEL 2A: STANDALONE
/home/isem/workspace/projects/{proyecto}/
├── docs/
│   └── 00-vision-general/
│       └── directivas/                           # [NUEVO] Por proyecto
│           └── DIRECTIVA-{PROYECTO}-ESPECIFICA.md
├── orchestration/
│   ├── 00-guidelines/
│   │   ├── CONTEXTO-PROYECTO.md                 # [EXISTENTE]
│   │   ├── HERENCIA-SIMCO.md                    # [EXISTENTE]
│   │   └── HERENCIA-DIRECTIVAS.md               # [ACTUALIZAR]
│   └── INDICE-DIRECTIVAS-PROYECTO.yml           # [NUEVO]

NIVEL 2B.2: VERTICAL
/home/isem/workspace/projects/erp-suite/apps/verticales/{vertical}/
├── docs/
│   └── 00-vision-general/
│       └── directivas/                           # Por vertical
├── orchestration/
│   └── 00-guidelines/
│       ├── HERENCIA-SIMCO.md
│       ├── HERENCIA-ERP-CORE.md
│       └── HERENCIA-DIRECTIVAS.md
```

---

## MECANISMO DE CARGA: CADENA DE HERENCIA

### Flujo de Carga Segun Nivel

```yaml
Cuando el usuario especifica:
  proyecto: "gamilit"
  subproyecto: null
  tarea: "crear endpoint"

El sistema debe cargar (en orden):
  1. WORKSPACE: orchestration/directivas/DIRECTIVA-WORKSPACE-ESTANDAR.md
  2. CORE: core/orchestration/directivas/principios/*.md
  3. CORE: core/orchestration/directivas/simco/SIMCO-TAREA.md
  4. CORE: core/orchestration/directivas/DIRECTIVA-DOCUMENTACION-DEFINITIVA.md
  5. PROYECTO: projects/gamilit/orchestration/00-guidelines/CONTEXTO-PROYECTO.md
  6. PROYECTO: projects/gamilit/orchestration/00-guidelines/HERENCIA-SIMCO.md
  7. PROYECTO: projects/gamilit/docs/00-vision-general/directivas/*.md (si existen)
```

```yaml
Cuando el usuario especifica:
  proyecto: "erp-suite"
  subproyecto: "verticales/construccion"
  tarea: "modificar tabla"

El sistema debe cargar (en orden):
  1. WORKSPACE: directivas workspace
  2. CORE: principios + SIMCO
  3. SUITE: erp-suite/orchestration/00-guidelines/CONTEXTO-PROYECTO.md
  4. SUITE-CORE: erp-suite/apps/erp-core/orchestration/00-guidelines/*.md
  5. VERTICAL: verticales/construccion/orchestration/00-guidelines/*.md
  6. VERTICAL: verticales/construccion/docs/00-vision-general/directivas/*.md
```

---

## INDICE MAESTRO DE DIRECTIVAS

### Archivo: INDICE-DIRECTIVAS-WORKSPACE.yml

```yaml
# /home/isem/workspace/orchestration/INDICE-DIRECTIVAS-WORKSPACE.yml
version: "1.0.0"
fecha_actualizacion: "2025-12-18"
descripcion: "Indice maestro de todas las directivas del workspace"

niveles:
  WORKSPACE:
    ruta: "/home/isem/workspace"
    directivas:
      - ruta: "orchestration/directivas/DIRECTIVA-WORKSPACE-ESTANDAR.md"
        tipo: "estandar"
        obligatoria: true
        descripcion: "Procedimiento estandar para todo el workspace"
      - ruta: "orchestration/directivas/DIRECTIVA-CARGA-CONTEXTO.md"
        tipo: "proceso"
        obligatoria: true
        descripcion: "Como cargar contexto segun nivel"

  CORE:
    ruta: "/home/isem/workspace/core"
    directivas:
      principios:
        - ruta: "orchestration/directivas/principios/PRINCIPIO-CAPVED.md"
          alias: "@CAPVED"
          obligatoria: true
        - ruta: "orchestration/directivas/principios/PRINCIPIO-DOC-PRIMERO.md"
          alias: "@DOC-PRIMERO"
          obligatoria: true
        - ruta: "orchestration/directivas/principios/PRINCIPIO-ANTI-DUPLICACION.md"
          alias: "@ANTI-DUP"
          obligatoria: true
        - ruta: "orchestration/directivas/principios/PRINCIPIO-VALIDACION-OBLIGATORIA.md"
          alias: "@VALIDAR"
          obligatoria: true
      operaciones:
        - ruta: "orchestration/directivas/simco/SIMCO-TAREA.md"
          alias: "@TAREA"
          obligatoria: true
        - ruta: "orchestration/directivas/simco/SIMCO-*.md"
          alias: "@OP_*"
          obligatoria: false
          descripcion: "Segun operacion requerida"
      documentacion:
        - ruta: "orchestration/directivas/DIRECTIVA-DOCUMENTACION-DEFINITIVA.md"
          alias: "@DOC-DEFINITIVA"
          obligatoria: true

  PROYECTOS:
    STANDALONE:
      patron_ruta: "/home/isem/workspace/projects/{proyecto}"
      directivas:
        contexto:
          - ruta: "orchestration/00-guidelines/CONTEXTO-PROYECTO.md"
            obligatoria: true
          - ruta: "orchestration/00-guidelines/HERENCIA-SIMCO.md"
            obligatoria: true
        especificas:
          - ruta: "docs/00-vision-general/directivas/*.md"
            obligatoria: false
            descripcion: "Directivas especificas del proyecto"
      proyectos:
        - nombre: "gamilit"
          tipo: "STANDALONE"
        - nombre: "trading-platform"
          tipo: "STANDALONE"
        - nombre: "betting-analytics"
          tipo: "STANDALONE"
        - nombre: "inmobiliaria-analytics"
          tipo: "STANDALONE"

    SUITE:
      patron_ruta: "/home/isem/workspace/projects/{suite}"
      suites:
        - nombre: "erp-suite"
          tipo: "SUITE"
          subniveles:
            SUITE-CORE:
              ruta: "apps/erp-core"
              hereda_de: ["SUITE"]
            VERTICALES:
              patron_ruta: "apps/verticales/{vertical}"
              hereda_de: ["SUITE", "SUITE-CORE"]
              verticales:
                - "clinicas"
                - "construccion"
                - "mecanicas-diesel"
                - "retail"
                - "vidrio-templado"

cadena_herencia:
  STANDALONE:
    orden: ["WORKSPACE", "CORE", "PROYECTO"]
  SUITE:
    orden: ["WORKSPACE", "CORE", "SUITE"]
  SUITE-CORE:
    orden: ["WORKSPACE", "CORE", "SUITE", "SUITE-CORE"]
  VERTICAL:
    orden: ["WORKSPACE", "CORE", "SUITE", "SUITE-CORE", "VERTICAL"]
```

---

## DIRECTIVA DE CARGA DE CONTEXTO

### Archivo: DIRECTIVA-CARGA-CONTEXTO.md

Esta directiva define COMO cargar las directivas correctas segun el nivel especificado:

```markdown
# DIRECTIVA: CARGA DE CONTEXTO SEGUN NIVEL

## PASO 1: IDENTIFICAR NIVEL

Cuando recibas un prompt con:
- proyecto: {nombre}
- subproyecto: {nombre} (opcional)
- tarea: {descripcion}

Determinar el nivel:

| Si proyecto es... | Y subproyecto es... | Entonces nivel es... |
|-------------------|---------------------|----------------------|
| gamilit, trading-platform, etc. | null | STANDALONE |
| erp-suite | null | SUITE |
| erp-suite | erp-core | SUITE-CORE |
| erp-suite | verticales/{nombre} | VERTICAL |

## PASO 2: CARGAR DIRECTIVAS EN ORDEN

Consultar INDICE-DIRECTIVAS-WORKSPACE.yml:
1. Obtener cadena_herencia[{nivel}].orden
2. Para cada nivel en orden:
   a. Cargar directivas obligatorias
   b. Cargar directivas especificas si existen

## PASO 3: RESOLVER CONTEXTO

Leer CONTEXTO-PROYECTO.md del nivel mas especifico:
- Obtener variables ({PROJECT}, {DB_DDL_PATH}, etc.)
- Resolver placeholders en directivas

## PASO 4: CONFIRMAR CARGA

Generar resumen:
- Nivel identificado: {nivel}
- Directivas cargadas: [lista]
- Contexto resuelto: {variables}
- Estado: READY_TO_EXECUTE
```

---

## TEMPLATE DE PROMPT PARA AGENTES

### Prompt Estandar que SI Funcionara

```markdown
## Contexto de Trabajo

**Perfil:** {nombre_perfil}
**Archivo de perfil:** {ruta al archivo de perfil}

**Proyecto:** {nombre_proyecto}
**Subproyecto:** {nombre_subproyecto o "null"}
**Nivel:** {STANDALONE | SUITE | SUITE-CORE | VERTICAL}

**Tarea:** {descripcion de la tarea}

---

### Directivas a Cargar (Obligatorio)

Antes de iniciar, cargar en orden:

1. **WORKSPACE:**
   - Leer: /home/isem/workspace/orchestration/directivas/DIRECTIVA-CARGA-CONTEXTO.md

2. **CORE (Principios):**
   - Leer: core/orchestration/directivas/principios/PRINCIPIO-CAPVED.md
   - Leer: core/orchestration/directivas/principios/PRINCIPIO-DOC-PRIMERO.md

3. **CORE (Operacion):**
   - Leer: core/orchestration/directivas/simco/SIMCO-TAREA.md
   - Leer: core/orchestration/directivas/DIRECTIVA-DOCUMENTACION-DEFINITIVA.md

4. **PROYECTO:**
   - Leer: projects/{proyecto}/orchestration/00-guidelines/CONTEXTO-PROYECTO.md
   - Leer: projects/{proyecto}/orchestration/00-guidelines/HERENCIA-SIMCO.md

5. **ESPECIFICAS (si existen):**
   - Leer: projects/{proyecto}/docs/00-vision-general/directivas/*.md

---

### Procedimiento

Seguir ciclo CAPVED:
1. C - Contexto: Confirmar directivas cargadas
2. A - Analisis: Analizar alcance
3. P - Planeacion: Crear plan
4. V - Validacion: Validar plan
5. E - Ejecucion: Implementar
6. D - Documentacion: Actualizar docs/ como estado FINAL
```

---

## ARCHIVOS A CREAR

### Lista de Implementacion

| # | Archivo | Nivel | Proposito |
|---|---------|-------|-----------|
| 1 | `workspace/orchestration/directivas/DIRECTIVA-WORKSPACE-ESTANDAR.md` | WORKSPACE | Estandar global |
| 2 | `workspace/orchestration/directivas/DIRECTIVA-CARGA-CONTEXTO.md` | WORKSPACE | Como cargar contexto |
| 3 | `workspace/orchestration/INDICE-DIRECTIVAS-WORKSPACE.yml` | WORKSPACE | Indice maestro |
| 4 | `core/orchestration/directivas/DIRECTIVA-DOCUMENTACION-DEFINITIVA.md` | CORE | Mover de .claude/ |
| 5 | `gamilit/docs/00-vision-general/directivas/_INDEX.md` | PROYECTO | Indice directivas proyecto |
| 6 | Actualizar `HERENCIA-SIMCO.md` en cada proyecto | PROYECTO | Incluir nuevas directivas |

### Archivos a Eliminar

| Archivo | Razon |
|---------|-------|
| `.claude/directivas/DIRECTIVA-FASES-ESTANDAR.md` | Duplica CAPVED |
| `.claude/directivas/DIRECTIVA-DOCUMENTACION-DEFINITIVA.md` | Mover a core/ |
| `CLAUDE.md` | Reemplazado por sistema de carga |

---

## VALIDACION DEL PLAN

### Criterios de Exito

1. [ ] Un prompt con "proyecto: gamilit, tarea: X" carga las directivas correctas
2. [ ] Un prompt con "proyecto: erp-suite, subproyecto: verticales/construccion" carga la cadena completa
3. [ ] Los subagentes pueden recibir el mismo formato de prompt
4. [ ] El sistema funciona sin dependencia de .claude/
5. [ ] Todo esta en ubicaciones portables (orchestration/ o docs/)
6. [ ] INDICE-DIRECTIVAS-WORKSPACE.yml mapea todas las directivas

---

## SIGUIENTE PASO

¿Aprobar este plan para proceder con la implementacion?

Si se aprueba:
1. Crear directivas a nivel WORKSPACE
2. Mover directivas de .claude/ a core/
3. Crear estructura docs/00-vision-general/directivas/ en GAMILIT
4. Actualizar archivos HERENCIA-*.md
5. Crear INDICE-DIRECTIVAS-WORKSPACE.yml
6. Eliminar archivos obsoletos

---

**Generado por:** Requirements-Analyst
**Fecha:** 2025-12-18
**Estado:** Esperando aprobacion
