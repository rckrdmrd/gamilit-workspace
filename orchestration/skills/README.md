# Skills Registry Operativo

Este directorio contiene skills en formato estandar para consumo por agentes.

## Estructura

- `simco-*`: skills internas (core) derivadas de directivas SIMCO.
- `community/*`: skills externas evaluadas.

## Fuente de verdad

- Registro central: `orchestration/inventarios/SKILLS-REGISTRY.yml`
- Estandar: `docs/40-standards/ESTANDAR-SKILLS.md`

---

## SIMCO Skills vs Claude Code Slash Commands

### Resumen Ejecutivo

El proyecto gamilit distingue entre dos sistemas de procedimientos:

1. **SIMCO Skills** — Procedimientos estructurados, versionados, con contrato explicit y trazabilidad completa.
2. **Claude Code Slash Commands** — Comandos rapidos, built-in al CLI, para operaciones comunes.

**Clave:** Los SIMCO skills NO son invocables via `/` syntax. Son **referencia estructurada** que agentes leen cuando cargan contexto.

### Sistema 1: SIMCO Skills (8)

**Formato:** SKILL.md con YAML frontmatter

```yaml
---
name: simco-git-workflow
version: 1.0.0
contract_version: 1.0.0
category: operation | core | sync | domain
priority: P0 | P1 | P2
dependencies:
  - simco-safe-edit
input_schema:
  required:
    - operation_type
  optional:
    - commit_message_or_branch
output_schema:
  success:
    - commit_hash
    - push_status
  error:
    - error_code
---
```

**Caracteristicas:**

- **8 skills internas** (simco-*) + 2 skills community (vercel)
- **Versionado SemVer:** Cada skill tiene `version` y `contract_version` independientes
- **Contrato explicitó:** `input_schema` y `output_schema` definen WHAT y OUTPUT
- **Dependencias trackeadas:** Arbol de dependencias en SKILLS-REGISTRY.yml
- **Trazabilidad:** Linkeados a directivas SIMCO (`simco_source`)
- **Triggers:** Cuando activarse (on_commit, on_push, etc.)
- **Inventario central:** SKILLS-REGISTRY.yml v1.1.0

**Invocacion:** Agentes **leen** SKILL.md en contexto, NO invocan via `/` syntax. Se referencia en prompts:

```
Cuando ejecutes [GAM-XXX], aplica simco-git-workflow:
1. Lee orchestration/skills/simco-git-workflow/SKILL.md
2. Sigue las 6 instrucciones de Paso 1-6
3. Valida output contra output_schema
```

### Sistema 2: Claude Code Slash Commands (5)

**Formato:** Built-in CLI commands

| Comando | Sintaxis | Proposito | Versioning |
|---------|----------|-----------|-----------|
| `/commit` | `/commit` | Crear git commit con convencion | Built-in (no versioning) |
| `/review-pr` | `/review-pr <number>` | Revisar PR pendiente | Built-in |
| `/help` | `/help [topic]` | Ayuda in-session | Built-in |
| `/clear` | `/clear` | Limpiar contexto (L3) | Built-in |
| `/fast` | `/fast` | Toggle fast mode (Opus → Opus, faster output) | Built-in |

**Caracteristicas:**

- **Invocacion directa:** Escribes en la sesion, e.g., `/commit`
- **No versionado:** Evolucionan con Claude Code CLI, no independientes
- **No contrato:** Inputes/outputs implicitos
- **Rapido:** Para operaciones comunes sin leer documentacion
- **Sin trazabilidad:** No linked a SIMCO

### Complementariedad

```
Flujo en gamilit:
┌─────────────────────────────────────────────────┐
│ Tarea: [GAM-123] Fix shop cosmetics            │
│                                                  │
│ 1. Cargar contexto SIMCO:                       │
│    - SIMCO-TAREA.md (CAPVED cycle)             │
│    - simco-git-workflow.SKILL.md (referencia)  │
│    - simco-safe-edit.SKILL.md (referencia)     │
│                                                  │
│ 2. Ejecutar procedimiento:                      │
│    - Seguir pasos en SKILL.md                  │
│    - Usar `/commit` para git commit rapido    │
│    - Usar `/fast` si necesitas velocidad      │
│                                                  │
│ 3. Validar output contra contract:             │
│    - commit_hash ✓                             │
│    - push_status ✓                             │
│    - branch_state ✓                            │
│                                                  │
│ 4. Documentar ejecucion:                        │
│    - PROXIMA-ACCION.md (para siguiente agente) │
│    - Trazas en orchestration/trazas/           │
└─────────────────────────────────────────────────┘
```

### Tabla Comparativa

| Feature | SIMCO Skills | Claude Code Commands |
|---------|-------------|---------------------|
| **Format** | SKILL.md + YAML frontmatter | Built-in to CLI |
| **Invocation** | Referenced in prompts/directives (read SKILL.md) | `/command` in session |
| **Syntax** | Procedural steps (Paso 1-6 in markdown) | CLI: `/commit`, `/review-pr`, `/help`, `/clear`, `/fast` |
| **Versioning** | SemVer (1.0.0) + contract version | N/A — CLI versions only |
| **Dependencies** | Explicit tree (simco-safe-edit, etc.) | None — standalone |
| **Contract** | input_schema/output_schema YAML | Implicit (action → result) |
| **Traceability** | SKILLS-REGISTRY.yml + simco_source link | N/A |
| **Triggers** | on_commit, on_push, on_branch_change | User-initiated only |
| **Use Case** | Detailed, auditable, complex procedures | Quick shortcuts for common ops |
| **Example** | simco-git-workflow (6-step fetch→commit→push process) | `/commit` (one-liner: stage+commit) |
| **Token Cost** | Explicit: estimated_tokens: 800 | ~0 (built-in) |
| **Scope** | Cross-tool: claude-code, gemini-cli, windsurf, trae | Claude Code only |

### Los 8 SIMCO Skills Internos

1. **simco-task-execution** (P0, 900 tokens)
   *Macro ciclo CAPVED: Contexto → Analisis → Plan → Validacion → Documentacion*

2. **simco-safe-edit** (P0, 800 tokens)
   *Edicion segura: read primero, edit minimo, validar coherencia*

3. **simco-apply-standard** (P0, 700 tokens)
   *Aplicar estandares: verificar catalogo, usar existentes, copiar+adaptar, generar+documentar*

4. **simco-git-workflow** (P1, 800 tokens) ← Ejemplo detallado arriba
   *Git: fetch → status → stage → commit → push → validate (RC1: FETCH ANTES)*

5. **simco-ddl-management** (P1, 900 tokens)
   *DDL: esquemas, tablas, funciones, triggers, RLS. deps: safe-edit + apply-standard*

6. **simco-validation-coherence** (P1, 700 tokens)
   *Coherencia: DDL→Backend→Frontend. deps: apply-standard*

7. **simco-agent-delegation** (P1, 1000 tokens)
   *Delegacion: subagentes paralelos, contexto L3, validacion post-tarea. deps: task-execution + apply-standard*

8. **simco-apply-backend-standard** (P2, 950 tokens)
   *Backend profesional: NestJS 11, estructura, patrones. deps: apply-standard + safe-edit*

### Como Agentes Usan SIMCO Skills

**Ejemplo: Ejecutar GAM-123 (Fix Shop)**

```
$ claude code

Bootloader (STEP 1-4):
  ✓ Load L0 (CLAUDE.md) — reglas criticas
  ✓ Load L1 (PROJECT-CONTEXT.md) — proyecto
  ✓ Load L2 (SIMCO-DDL.md, SIMCO-BACKEND.md) — dominios
  ✓ Read orchestration/inventarios/SKILLS-REGISTRY.yml

Contexto cargado:
  - 8 SIMCO skills disponibles (léeré los .SKILL.md si es necesario)
  - 5 Claude Code `/` commands disponibles (ejecuto cuando necesito)

Tarea [GAM-123]:
  1. CAPVED (simco-task-execution, SKILL.md referencia)
  2. Editar: read → edit → validate (simco-safe-edit, SKILL.md)
  3. Git: fetch → commit → push (simco-git-workflow, SKILL.md)
  4. Comodines: `/commit`, `/fast` si acelero
  5. Documentar: PROXIMA-ACCION.md para siguiente agente

Resultado:
  - Commit con hash XYZ
  - PROXIMA-ACCION.md actualizado
  - Trazas en orchestration/trazas/
```

### Referencia

- **SKILLS-REGISTRY.yml:** Registro central v1.1.0 (8 SIMCO skills + 2 community)
- **ESTANDAR-SKILLS.md:** Contrato y formato (ver `docs/40-standards/`)
- **simco-git-workflow/SKILL.md:** Ejemplo completo con 6-step procedimiento
- **CLAUDE.md:** Reglas criticas RC1-RC6 + comportamiento obligatorio

---

**Resumen:** SIMCO skills = procedimientos **referencia estructurada**, versionados, trackeados, con contrato. Claude Code commands = **atajos rapidos** built-in. Ambos coexisten: agentes **leen** skills y **usan** slash commands segun contexto.
