# SIMCO: MODEL SELECTION

**Version:** 2.0.0
**Sistema:** SIMCO v4.0
**Proposito:** Arbol de decision determinístico para seleccion de modelo/agente
**Fecha:** 2026-03-03
**Actualizado:** v1.0.0→v2.0.0: Opus 4.6, Sonnet 4.6, fast mode, subagent assignment, ejemplos reales

---

## ARBOL DE DECISION (5 pasos)

```yaml
DECISION_TREE:
  paso_1_web_search:
    pregunta: "¿Requiere busqueda web o WebFetch?"
    si: "Claude Code (unico con WebSearch/WebFetch)"
    no: "→ paso_2"

  paso_2_orchestration:
    pregunta: "¿Requiere orquestar subagentes en paralelo?"
    si: "Claude Code (unico con Task tool nativo)"
    no: "→ paso_3"

  paso_3_reasoning_complexity:
    pregunta: "¿Nivel de razonamiento requerido?"
    alto: "Claude Code o Gemini CLI (ambos razonadores)"
    medio: "Trae (Gemini 3 Pro) o Gemini CLI"
    bajo: "Windsurf (Cascade, no-razonador, necesita plan literal)"

  paso_4_parallelism:
    pregunta: "¿Cuantas instancias paralelas se necesitan?"
    una: "Cualquier agente disponible"
    dos_a_cinco: "Claude Code subagentes"
    mas_de_cinco: "Claude Code (waves) o Gemini CLI (max 2 por batch)"

  paso_5_token_priority:
    pregunta: "¿Conservar tokens Claude es prioridad?"
    si: "Gemini CLI o Trae"
    no: "Claude Code"
```

---

## MATRIZ 1: AGENTES EXTERNOS

| Criterio | Claude Code | Gemini CLI | Trae | Windsurf |
|----------|-------------|------------|------|----------|
| **Modelo** | Opus 4.6 | 2.5 / 3 Flash / 3 Pro | Gemini 3 Pro | Cascade AI |
| **Razonamiento** | ALTO | ALTO | MEDIO | BAJO |
| **Subagentes** | SI (nativos) | NO | SI (SOLO Coder) | NO |
| **Paralelismo** | SI (5+) | NO (secuencial) | SI (SOLO) | NO |
| **Web Search** | SI | NO | NO | NO |
| **Edicion archivos** | SI | SI | SI | SI |
| **Git** | SI | SI | SI | SI |
| **MCP** | SI | NO | SI | NO |
| **Costo tokens** | Alto | Bajo | Bajo | Bajo |
| **Max paralelo** | 5 subagentes | 2 CLI por batch | 1 | 1 |
| **Platform notes** | Background may fail Win | Foreground only Win | - | - |

### Seleccion por Tipo de Tarea

```yaml
POR_TAREA:
  auditoria_integral: Claude Code (orquesta N subagentes)
  analisis_profundo: Gemini CLI (token-efficient) o Claude Code
  desarrollo_feature: Trae SOLO Coder o Claude Code
  ejecucion_plan_literal: Windsurf (plan ultra-detallado requerido)
  validacion_cross_layer: Claude Code o Gemini CLI
  testing_e2e: Gemini Antigravity (navegador)
  documentacion: Gemini CLI o Claude Code
  prototipado_rapido: Trae SOLO Builder
```

### Gemini CLI Versions

```yaml
GEMINI_CLI_VERSIONS:
  "2.5":
    status: legacy
    usar_cuando: "Fallback si 3.x no disponible"
  "3_flash":
    status: active
    usar_cuando: "Tareas rapidas, bajo costo, conteos, exploracion"
  "3_pro":
    status: active
    usar_cuando: "Analisis profundo, razonamiento complejo, alta calidad"
  preferencia: "Siempre la ultima version disponible del modelo"
```

---

## MATRIZ 2: SUBMODELOS INTERNOS CLAUDE CODE

| Criterio | Haiku 4.5 | Sonnet 4.5 (legado) | Sonnet 4.6 (preferido) | Opus 4.6 |
|----------|-----------|---------------------|------------------------|----------|
| **Velocidad** | Rapida | Media | Media | Lenta |
| **Costo** | Bajo | Medio | Medio | Alto |
| **Razonamiento** | Basico | Alto | Alto | Muy Alto |
| **Uso principal** | Exploracion, busquedas | Implementacion legado | Implementacion, analisis | Orquestacion, arquitectura |

### Seleccion por Tipo de Subtarea

```yaml
SUBMODELO_SELECCION:
  haiku_4_5:
    usar_para:
      - Busquedas de archivos (Glob, Grep)
      - Conteos rapidos (find, wc)
      - Exploracion de codebase
      - Lecturas simples de archivos
      - Validaciones de existencia
    NO_usar_para:
      - Decisiones arquitectónicas
      - Analisis complejo

  sonnet_4_6:
    estado: activo_preferido
    nota: "Preferir 4.6 para sesiones nuevas"
    usar_para:
      - Implementacion de codigo
      - Analisis detallado de modulos
      - Governance (YAML, tracking, metadata)
      - Creacion de directivas y documentos
      - Features con mas de 3 dependencias
    NO_usar_para:
      - Busquedas triviales (usar Haiku)
      - Decisiones de workspace-level (usar Opus)

  sonnet_4_5:
    estado: activo_legado
    nota: "Usar solo si 4.6 no disponible"
    usar_para:
      - Implementacion de codigo
      - Analisis detallado de modulos
      - Governance (YAML, tracking, metadata)
      - Creacion de directivas y documentos
      - Modificacion de archivos existentes
    NO_usar_para:
      - Busquedas triviales (usar Haiku)
      - Decisiones de workspace-level (usar Opus)

  opus_4_6:
    usar_para:
      - Orquestacion de multiples subagentes
      - Decisiones arquitectonicas cross-project
      - Planificacion de auditorias N-dimensionales
      - Resolucion de conflictos entre proyectos
      - Sesiones de usuario principales
    NO_usar_para:
      - Subtareas simples (desperdicio de tokens)
      - Busquedas o conteos (usar Haiku)
```

---

## SUBAGENT MODEL ASSIGNMENT

### Tabla de Asignacion por Tipo de Subtarea

| Tipo | Modelo Recomendado | Escalar a Sonnet si... | Escalar a Opus si... |
|------|--------------------|------------------------|----------------------|
| Leer 1-3 archivos | Haiku | Requiere interpretacion compleja | - |
| Busqueda / conteo | Haiku | Nunca escalar | Nunca escalar |
| Validar existencia | Haiku | - | - |
| Implementar 1 archivo | Sonnet 4.6 | Ya esta en Sonnet | Cambio arquitectonico detectado |
| Analisis multi-archivo (3-8) | Sonnet 4.6 | Ya esta en Sonnet | Contradiccion arquitectonica |
| Actualizar 1 campo | Haiku | Campo tiene logica de negocio | - |
| Crear documento de governance | Sonnet 4.6 | Ya esta en Sonnet | Impacto cross-domain |
| Auditoria cross-domain | Opus 4.6 | Ya esta en Opus | - |
| Resolucion de conflictos | Opus 4.6 | Ya esta en Opus | - |
| Validacion final | Sonnet 4.6 | - | Mas de 5 modulos afectados |

### Reglas de Escalamiento

```yaml
REGLA_ESCALAMIENTO_SUBAGENTE:
  haiku_a_sonnet:
    trigger: "Subagente Haiku encuentra decision no especificada en instrucciones"
    action: "Reportar ESCALAR_REQUERIDO al orquestador, no decidir por cuenta propia"

  sonnet_a_opus:
    trigger: "Subagente Sonnet encuentra contradiccion arquitectonica"
    action: "Documentar la contradiccion y escalar al orquestador Opus"
```

### Patrones de Wave Probados en Produccion

```yaml
WAVE_PATTERNS:
  auditoria_documental_grande:
    descripcion: "Auditoria de documentacion con 16 subagentes"
    orquestador: Opus 4.6
    wave_1: "4x Haiku — exploracion de archivos y conteos"
    wave_2: "4x Sonnet 4.6 — analisis de gaps por dominio"
    wave_3: "4x Sonnet 4.6 — implementacion de correcciones"
    wave_4: "2x Haiku — validacion de archivos modificados"
    cuando_usar: "Auditorias de >20 archivos con multiples dominios"

  bug_fix_critico:
    descripcion: "Fix de bug de produccion con investigacion enfocada"
    orquestador: Sonnet 4.6
    wave_1: "1x Sonnet 4.6 — investigacion del bug y propuesta de fix"
    wave_2: "1x Haiku — validacion de build y lint post-fix"
    cuando_usar: "Bugs bien definidos con scope limitado (1-3 archivos)"

  update_simple:
    descripcion: "Actualizacion trivial de un campo o metadato"
    orquestador: Haiku
    wave_1: "Haiku-only — leer, editar, confirmar"
    cuando_usar: "Cambios de 1 archivo, sin logica de negocio, sin dependencias"
```

---

## FAST MODE

### Descripcion

El comando `/fast` activa salida mas rapida para el modelo activo (Opus 4.6 o Sonnet 4.6). NO cambia el modelo ni reduce la calidad de razonamiento — solo optimiza la velocidad de generacion de tokens.

### Cuando Activar

| Escenario | Activar Fast Mode |
|-----------|------------------|
| Implementacion larga (>200 lineas) | SI |
| Generacion de documentacion extensa | SI |
| YAMLs de inventario grandes | SI |
| Analisis critico de arquitectura | NO |
| Primera sesion de una tarea nueva | NO |
| Bugs complejos con multiples causas | NO |

### Activacion

```
/fast   # Toggle en sesion Claude Code activa
```

### Nota Importante

Fast mode NO afecta la seleccion de modelo para subagentes. Los subagentes siguen la tabla de asignacion anterior independientemente del fast mode del orquestador.

---

## ANTI-PATTERNS POR MODELO

```yaml
ANTI_PATTERNS:
  claude_code:
    - "Usar Opus para busquedas triviales (Haiku es 10x mas barato)"
    - "Lanzar > 5 subagentes simultaneos"
    - "Background agents en Windows para tareas criticas"
    - "Usar Sonnet 4.5 cuando Sonnet 4.6 esta disponible"
    - "Activar fast mode en analisis criticos de arquitectura"

  gemini_cli:
    - "Lanzar > 2 sesiones paralelas (429 rate limit)"
    - "Confiar en conteos de archivos (85% undercount observado)"
    - "Usar paths sin underscores (_products → products error)"
    - "Esperar que escriba archivos (sandbox read-only en algunos modes)"

  trae:
    - "Asumir razonamiento ALTO (es MEDIO)"
    - "Tareas que requieren subagentes nativos"

  windsurf:
    - "Dar instrucciones ambiguas (no razona, necesita literal)"
    - "Esperar decisiones arquitectonicas"
```

---

## REFERENCIAS

| Documento | Proposito |
|-----------|-----------|
| `AGENT-ROLES.md` | Definicion de roles por agente |
| `SIMCO-FLUJO-AGENTES.md` | Flujo de 4 fases |
| `SIMCO-GEMINI-CLI-INTEGRATION.md` | Integracion Gemini CLI |
| `SIMCO-PLATFORM-CONSTRAINTS.md` | Restricciones de plataforma |

---

**Version:** 2.0.0 | **Sistema:** SIMCO v4.0 | **Tipo:** Directiva de Seleccion
