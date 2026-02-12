# SIMCO: MODEL SELECTION

**Version:** 1.0.0
**Sistema:** SIMCO v4.0
**Proposito:** Arbol de decision determinístico para seleccion de modelo/agente
**Fecha:** 2026-02-11

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

| Criterio | Haiku 4.5 | Sonnet 4.5 | Opus 4.6 |
|----------|-----------|------------|----------|
| **Velocidad** | Rapida | Media | Lenta |
| **Costo** | Bajo | Medio | Alto |
| **Razonamiento** | Basico | Alto | Muy Alto |
| **Uso principal** | Exploracion, busquedas | Implementacion, analisis | Orquestacion, arquitectura |

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

  sonnet_4_5:
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

## ANTI-PATTERNS POR MODELO

```yaml
ANTI_PATTERNS:
  claude_code:
    - "Usar Opus para busquedas triviales (Haiku es 10x mas barato)"
    - "Lanzar > 5 subagentes simultaneos"
    - "Background agents en Windows para tareas criticas"

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

**Version:** 1.0.0 | **Sistema:** SIMCO v4.0 | **Tipo:** Directiva de Seleccion
