# SIMCO: RESOLUCIÓN AUTOMÁTICA DE CONTEXTO

**Versión:** 1.0.0
**Sistema:** SIMCO - NEXUS v4.0
**Propósito:** Automatizar la carga de contexto basándose en tarea y proyecto
**Fecha:** 2026-01-04

---

## PRINCIPIO FUNDAMENTAL

> **El contexto correcto se determina automáticamente a partir de:**
> 1. El proyecto donde se trabaja
> 2. El tipo de tarea a realizar
> 3. Las palabras clave en la descripción
> **Resultado:** Lista exacta de archivos a cargar, optimizada para tokens.

---

## PROCESO DE RESOLUCIÓN (4 PASOS)

### PASO 1: Analizar Descripción de Tarea

```yaml
ENTRADA: "Descripción de tarea del usuario"

EXTRAER:
  keywords:
    - buscar: ["tabla", "DDL", "schema", "columna", "índice"]
      dominio: DDL
    - buscar: ["entity", "service", "controller", "endpoint", "API"]
      dominio: BACKEND
    - buscar: ["componente", "página", "hook", "frontend", "UI"]
      dominio: FRONTEND
    - buscar: ["refactor", "optimizar", "mejorar"]
      operacion: MODIFICAR
    - buscar: ["crear", "nuevo", "agregar", "implementar"]
      operacion: CREAR
    - buscar: ["corregir", "fix", "bug", "error"]
      operacion: MODIFICAR
    - buscar: ["validar", "verificar", "test"]
      operacion: VALIDAR

SALIDA:
  operacion: "{CREAR | MODIFICAR | VALIDAR | BUSCAR}"
  dominio: "{DDL | BACKEND | FRONTEND | MIXTO}"
  keywords: ["{lista de palabras clave encontradas}"]
```

### PASO 2: Cargar CONTEXT-MAP del Proyecto

```yaml
BUSCAR: "{PROYECTO}/orchestration/CONTEXT-MAP.yml"

SI_EXISTE:
  - Leer CONTEXT-MAP.yml
  - Usar definiciones del proyecto
  - Variables ya resueltas

SI_NO_EXISTE:
  - Usar TEMPLATE-CONTEXT-MAP.yml
  - Resolver variables manualmente
  - ADVERTENCIA: "Considerar crear CONTEXT-MAP.yml para este proyecto"
```

### PASO 3: Resolver Archivos por Nivel

```yaml
L0_SISTEMA (SIEMPRE):
  archivos:
    - core/orchestration/directivas/principios/PRINCIPIO-CAPVED.md
    - core/orchestration/directivas/principios/PRINCIPIO-DOC-PRIMERO.md
    - core/orchestration/directivas/principios/PRINCIPIO-ANTI-DUPLICACION.md
    - core/orchestration/directivas/principios/PRINCIPIO-VALIDACION-OBLIGATORIA.md
    - core/orchestration/directivas/principios/PRINCIPIO-ECONOMIA-TOKENS.md
    - core/orchestration/directivas/principios/PRINCIPIO-NO-ASUMIR.md
    - orchestration/agents/perfiles/PERFIL-{DOMINIO}.md
    - orchestration/referencias/ALIASES.yml

L1_PROYECTO (SIEMPRE):
  archivos:
    - "{PROYECTO}/orchestration/CONTEXTO-PROYECTO.md"  # Basado en templates/TEMPLATE-CONTEXTO-PROYECTO.md
    - "{PROYECTO}/orchestration/PROXIMA-ACCION.md"
    - "{PROYECTO}/orchestration/inventarios/{DOMINIO}_INVENTORY.yml"

L2_OPERACION (SEGÚN ANÁLISIS):
  CREAR:
    - orchestration/directivas/simco/SIMCO-CREAR.md
    - orchestration/directivas/simco/SIMCO-{DOMINIO}.md
  MODIFICAR:
    - orchestration/directivas/simco/SIMCO-MODIFICAR.md
    - orchestration/directivas/simco/SIMCO-{DOMINIO}.md
  VALIDAR:
    - orchestration/directivas/simco/SIMCO-VALIDAR.md
  BUSCAR:
    - orchestration/directivas/simco/SIMCO-BUSCAR.md

L3_TAREA (DINÁMICO):
  segun_keywords:
    tabla:
      - "{DB_DDL_PATH}/schemas/{schema}/tables/{tabla}.sql"
      - "docs/especificaciones/modelo-datos.md"
    entity:
      - "{DDL de tabla relacionada}"
      - "{BACKEND_SRC}/modules/{modulo}/entities/*.entity.ts"
    componente:
      - "docs/especificaciones/wireframes.md"
      - "{FRONTEND_SRC}/components/{similar}/*.tsx"
    endpoint:
      - "docs/especificaciones/api/*.md"
      - "{BACKEND_SRC}/modules/{modulo}/controllers/*.controller.ts"
```

### PASO 4: Verificar y Validar

```yaml
VERIFICACION:
  - [ ] Todos los archivos existen
  - [ ] Variables resueltas (sin placeholders)
  - [ ] Total tokens < 18000 (límite seguro)
  - [ ] Contexto suficiente para la tarea

SI_TOKENS_EXCEDEN:
  accion: "Reducir L3_tarea"
  estrategia:
    - Usar referencias file:line en lugar de contenido
    - Eliminar archivos menos relevantes
    - Considerar desglose de tarea

RESULTADO:
  estado: "READY_TO_EXECUTE | NEEDS_REDUCTION | ERROR"
  archivos_a_cargar: ["{lista ordenada}"]
  tokens_estimados: "{número}"
```

---

## MAPA TAREA → CONTEXTO

### Por Palabra Clave

```yaml
KEYWORDS_CONTEXT_MAP:
  # Database
  "tabla":
    dominio: DDL
    operacion: CREAR
    contexto:
      - SIMCO-DDL.md
      - DATABASE_INVENTORY.yml
      - "{DB_DDL_PATH}/schemas/{schema}/tables/*.sql" (similar)

  "índice":
    dominio: DDL
    operacion: CREAR
    contexto:
      - SIMCO-DDL.md
      - DDL de tabla objetivo

  "migración":
    dominio: DDL
    operacion: MODIFICAR
    contexto:
      - SIMCO-DDL.md
      - DDL actual de tabla
      - BACKEND_INVENTORY.yml (entities afectadas)

  # Backend
  "entity":
    dominio: BACKEND
    operacion: CREAR
    contexto:
      - SIMCO-BACKEND.md
      - DDL de tabla relacionada
      - Entity similar (patrón)

  "service":
    dominio: BACKEND
    operacion: CREAR
    contexto:
      - SIMCO-BACKEND.md
      - Entity relacionada
      - Service similar (patrón)

  "controller":
    dominio: BACKEND
    operacion: CREAR
    contexto:
      - SIMCO-BACKEND.md
      - Service relacionado
      - API spec (si existe)

  "endpoint":
    dominio: BACKEND
    operacion: CREAR
    contexto:
      - SIMCO-BACKEND.md
      - docs/api/*.md
      - Controller relacionado

  # Frontend
  "componente":
    dominio: FRONTEND
    operacion: CREAR
    contexto:
      - SIMCO-FRONTEND.md
      - Wireframe/mockup
      - Componente similar

  "página":
    dominio: FRONTEND
    operacion: CREAR
    contexto:
      - SIMCO-FRONTEND.md
      - Wireframe completo
      - Endpoint API relacionado

  "hook":
    dominio: FRONTEND
    operacion: CREAR
    contexto:
      - SIMCO-FRONTEND.md
      - Hook similar
      - API endpoint que consume

  # Operaciones
  "refactor":
    operacion: MODIFICAR
    contexto:
      - SIMCO-MODIFICAR.md
      - Código actual completo
      - Tests existentes

  "bug":
    operacion: MODIFICAR
    contexto:
      - SIMCO-MODIFICAR.md
      - REGISTRO-ERRORES.yml
      - Código con bug
      - Tests relacionados

  "test":
    operacion: VALIDAR
    contexto:
      - SIMCO-VALIDAR.md
      - Código a testear
      - Tests existentes (patrón)
```

---

## FORMATO DE SALIDA

```yaml
# Resultado de CONTEXT-RESOLUTION
resolucion_contexto:
  timestamp: "{YYYY-MM-DD HH:MM}"
  proyecto: "{nombre}"
  tarea: "{descripción breve}"

  analisis:
    operacion: "{tipo}"
    dominio: "{capa}"
    keywords: ["{lista}"]

  archivos_a_cargar:
    L0_sistema:
      - path: "{ruta}"
        tokens: "{estimado}"
    L1_proyecto:
      - path: "{ruta}"
        tokens: "{estimado}"
    L2_operacion:
      - path: "{ruta}"
        tokens: "{estimado}"
    L3_tarea:
      - path: "{ruta}"
        tokens: "{estimado}"
        tipo: "completo | referencia"

  metricas:
    total_archivos: "{N}"
    tokens_estimados: "{N}"
    dentro_limite: "{true | false}"

  estado: "READY_TO_EXECUTE"
```

---

## INTEGRACIÓN CON CAPVED++

Este proceso se ejecuta en **FASE 0** del ciclo CAPVED++:

```
TAREA RECIBIDA
     │
     ▼
┌─────────────────────────────┐
│  PASO 1: Analizar Keywords  │
└─────────────────────────────┘
     │
     ▼
┌─────────────────────────────┐
│  PASO 2: Cargar CONTEXT-MAP │
└─────────────────────────────┘
     │
     ▼
┌─────────────────────────────┐
│  PASO 3: Resolver Archivos  │
└─────────────────────────────┘
     │
     ▼
┌─────────────────────────────┐
│  PASO 4: Verificar Tokens   │
└─────────────────────────────┘
     │
     ▼
READY_TO_EXECUTE → FASE C (Contexto)
```

---

## CASOS ESPECIALES

### Tarea Multi-Dominio

```yaml
SI_DOMINIO_MIXTO:
  - Cargar SIMCO de cada dominio afectado
  - Priorizar: DDL → BACKEND → FRONTEND
  - Verificar tokens con todos los contextos
  - Si excede: Desglosar por dominio
```

### Tarea Sin Keywords Claras

```yaml
SI_NO_HAY_KEYWORDS:
  accion: "Usar contexto genérico"
  cargar:
    - SIMCO-TAREA.md (ciclo completo)
    - MASTER_INVENTORY.yml
    - PROXIMA-ACCION.md
  nota: "Preguntar al usuario para clarificar si es ambiguo"
```

### Búsqueda de Errores Previos

```yaml
SI_KEYWORD_BUG_O_ERROR:
  antes_de_resolver:
    - Buscar en orchestration/errores/REGISTRO-ERRORES.yml
    - Buscar en shared/knowledge-base/lessons-learned/
    - Si encuentra similar: Agregar a L3_tarea
```

---

## REFERENCIAS

| Documento | Propósito |
|-----------|-----------|
| `CONTEXT-MAP.yml` | Mapa por proyecto |
| `SIMCO-CONTROL-TOKENS.md` | Límites de tokens |
| `SIMCO-CAPVED-PLUS.md` | Integración con FASE 0 |
| `SIMCO-INICIALIZACION.md` | Protocolo CCA |

---

## FLUJO DE DOCUMENTACIÓN - CONTEXT ENGINEERING

Este documento forma parte del sistema de **Context Engineering** del workspace:

```
┌──────────────────────────────────────────────────────────────────┐
│                    CONTEXT ENGINEERING                           │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. SIMCO-CONTEXT-ENGINEERING.md                                 │
│     └─ TEORÍA: Niveles L0-L3, presupuesto tokens, recovery       │
│                                                                  │
│  2. SIMCO-CONTEXT-RESOLUTION.md (ESTE ARCHIVO)                   │
│     └─ AUTOMÁTICO: Resolución por keywords y mapeo tarea→archivo │
│                                                                  │
│  3. SIMCO-CCA-SUBAGENTE.md                                       │
│     └─ LIGERO: CCA reducido para subagentes (2 fases, ~1050 tok) │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

**Cuándo usar cada uno:**
- **CONTEXT-ENGINEERING** → Para entender teoría de contexto, métricas, anti-patrones
- **Este archivo** → Para automatizar qué archivos cargar según la tarea
- **CCA-SUBAGENTE** → Para subagentes delegados (contexto heredado)

---

**Versión:** 1.0.1 | **Sistema:** SIMCO-NEXUS v4.0 | **Tipo:** Directiva de Resolución
**Actualizado:** 2026-01-10
