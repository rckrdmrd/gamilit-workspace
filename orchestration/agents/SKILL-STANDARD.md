---
tipo: estandar-profesional
scope: workspace
titulo: "Estandar de Skills para Agentes IA"
version: 1.0.0
fecha: 2026-02-05
estado: activo
herencia: |
  Este estandar aplica a nivel WORKSPACE.
  Los proyectos pueden EXTENDER (no contradecir) con skills locales.
  Ejemplo: workspace-projects/projects/{proyecto}/orchestration/skills/ para skills de dominio especificos.
tags:
  - skills
  - agentes-ia
  - simco
  - automatizacion
  - multi-agente
---

# Estandar de Skills para Agentes IA

> Convenciones para definir, registrar, evaluar y consumir skills dentro del ecosistema SIMCO y agentes IA del workspace
>
> **Nota de herencia:** Los proyectos heredan este estandar y pueden agregar skills de dominio especificos

---

## 1. Proposito

Un **skill** es una unidad de capacidad reutilizable que un agente IA puede descubrir, cargar y ejecutar dentro de una sesion de trabajo. En el contexto de workspace-arch, los skills formalizan las directivas SIMCO existentes en un formato estandar compatible con las convenciones de Agent Skills (Claude Code, Gemini CLI, Windsurf, Trae).

**Enfoque hibrido SIMCO + Agent Skills:**

- Las **directivas SIMCO** siguen siendo la fuente de verdad operacional del workspace.
- Los **skills** exponen esas directivas como capacidades consumibles por agentes, con metadatos estructurados, instrucciones paso a paso y checklists de validacion.
- Un skill **NO reemplaza** su directiva SIMCO de origen; la **referencia y complementa** con formato estandarizado.

**Beneficios:**

- Descubrimiento automatico de capacidades por parte de los agentes
- Ejecucion consistente independientemente del agente que ejecute
- Evaluacion controlada de skills externos (Vercel, Supabase, Anthropic)
- Trazabilidad entre directiva SIMCO, skill y tarea ejecutada

---

## 2. Formato de un Skill

Cada skill reside en su propio directorio con la siguiente estructura:

```
orchestration/skills/{nombre-skill}/
  SKILL.md          # Definicion principal (obligatorio)
  scripts/          # Scripts ejecutables (opcional)
  references/       # Documentos de soporte (opcional)
```

### 2.1 SKILL.md - Frontmatter YAML

El frontmatter combina campos del estandar Agent Skills con extensiones SIMCO:

```yaml
---
# --- Campos Agent Skills (estandar) ---
name: simco-safe-edit
description: "Edicion segura de archivos con verificacion anti-placeholders"
version: 1.0.0

# --- Extensiones SIMCO ---
simco_source: orchestration/directivas/simco/SIMCO-EDICION-SEGURA.md
category: core          # core | operation | sync | community | domain
priority: P0            # P0 (critico) | P1 (operacion) | P2 (sincronizacion)
capved_required: false   # true si requiere ciclo CAPVED completo
agents_compatible:
  - claude-code
  - gemini-cli
  - windsurf
  - trae
dependencies: []         # Lista de skills requeridos previos
triggers:                # Eventos que activan este skill
  - on_file_edit
  - on_commit
internal: true           # true = skill interno SIMCO, false = externo/community
estimated_tokens: 800    # Tokens aproximados que consume cargar el skill
tags:
  - edicion
  - seguridad
  - validacion
---
```

**Campos obligatorios:** `name`, `description`, `version`, `simco_source`, `category`, `priority`, `estimated_tokens`, `input_schema`, `output_schema`, `contract_version`.

**Campos opcionales:** `capved_required`, `agents_compatible`, `dependencies`, `triggers`, `internal`, `tags`.

### 2.1.1 Contrato de Entrada/Salida (IoC)

Todos los skills activos deben declarar contrato explícito:

```yaml
input_schema:
  required:
    - task_description
    - objective
  optional:
    - constraints

output_schema:
  success:
    - artifacts
    - validation_results
  error:
    - error_code
    - error_message

contract_version: 1.0.0
```

El resolvedor y el registry deben mantener consistencia de contrato por skill.

### 2.2 SKILL.md - Cuerpo Markdown

El cuerpo del skill sigue esta estructura de secciones:

```markdown
# {Nombre del Skill}

## Proposito
Descripcion concisa de que hace el skill y por que existe.

## Cuando Usar
- Condiciones o situaciones donde este skill aplica.

## Cuando NO Usar
- Situaciones donde este skill no es apropiado.

## Prerequisitos
- Recursos, permisos o skills previos necesarios.

## Instrucciones
### Paso 1: {Titulo}
Instrucciones concretas. Cada paso DEBE tener <50 lineas.

### Paso 2: {Titulo}
...

## Checklist de Validacion
- [ ] Verificacion 1
- [ ] Verificacion 2

## Manejo de Errores
| Error | Causa | Solucion |
|-------|-------|----------|
| ...   | ...   | ...      |

## Formato de Salida
Descripcion del output esperado tras ejecutar el skill.

## Referencias
- Enlace a directiva SIMCO de origen
- Otros documentos relacionados
```

**Secciones obligatorias:** Proposito, Cuando Usar, Instrucciones, Checklist de Validacion, Referencias.

**Secciones opcionales:** Cuando NO Usar, Prerequisitos, Manejo de Errores, Formato de Salida.

### 2.3 Directorio scripts/

Contiene scripts ejecutables que automatizan pasos del skill:

```
scripts/
  validate.sh       # Script de validacion
  execute.sh        # Script de ejecucion principal
  rollback.sh       # Script de reversion (si aplica)
```

Los scripts DEBEN ser idempotentes y no destructivos por defecto.

### 2.4 Directorio references/

Documentos de soporte, ejemplos o templates que complementan el skill:

```
references/
  EXAMPLE-INPUT.md
  TEMPLATE-OUTPUT.yml
```

---

## 3. Tipos de Skills

### 3.1 Core (P0) - Sin dependencias

Skills fundamentales del sistema. Son prerequisito de todos los demas.

| Skill | Descripcion | SIMCO Source |
|-------|-------------|--------------|
| `simco-task-execution` | Ejecucion de tareas con ciclo CAPVED | SIMCO-TAREA.md |
| `simco-safe-edit` | Edicion segura sin placeholders, <50 lineas | SIMCO-EDICION-SEGURA.md |
| `simco-apply-standard` | Aplicacion de estandares del workspace | SIMCO-ESTANDARES.md |

**Caracteristica:** No dependen de otros skills. Se cargan primero en cualquier sesion.

### 3.2 Operation (P1) - Dependen de Core

Skills de operaciones comunes que extienden las capacidades base.

| Skill | Descripcion | Dependencias |
|-------|-------------|--------------|
| `simco-agent-delegation` | Delegacion de trabajo a subagentes | simco-task-execution |
| `simco-copy-module` | Copia y adaptacion de modulos entre proyectos | simco-safe-edit |
| `simco-mcp-development` | Desarrollo de servidores MCP | simco-apply-standard |
| `simco-git-workflow` | Flujo git con fetch, commit y push obligatorio | simco-task-execution |

### 3.3 Sync (P2) - Dependen de Operation

Skills de sincronizacion y propagacion entre proyectos.

| Skill | Descripcion | Dependencias |
|-------|-------------|--------------|
| `simco-sync-modules` | Sincronizacion de modulos compartidos | simco-copy-module |
| `simco-propagation` | Propagacion de cambios a verticales ERP | simco-git-workflow |
| `simco-ddl-management` | Gestion DDL con recreacion de BD en WSL | simco-task-execution |
| `simco-validation-coherence` | Validacion de coherencia entre capas | simco-apply-standard |

### 3.4 Community - Skills externos evaluados

Skills de terceros que han pasado el proceso de evaluacion (ver seccion 6).

| Publisher | Ejemplos | Evaluacion |
|-----------|----------|------------|
| vercel-labs | `vercel-v0-dev`, `vercel-next-deploy` | Via SIMCO-SKILLS-IMPORT |
| anthropics | `anthropic-mcp-toolkit` | Via SIMCO-SKILLS-IMPORT |
| supabase | `supabase-migrations`, `supabase-auth` | Via SIMCO-SKILLS-IMPORT |

**Ubicacion:** `orchestration/skills/community/{publisher}-{nombre}/`

### 3.5 Domain - Especificos de proyecto

Skills que solo aplican a un proyecto o vertical particular.

| Proyecto | Skill | Descripcion |
|----------|-------|-------------|
| erp-core | `erp-vertical-scaffold` | Scaffold de nueva vertical ERP |
| trading-platform | `trading-ml-pipeline` | Pipeline de datos para ML |
| clinica-dental | `dental-appointment-flow` | Flujo de citas odontologicas |

**Ubicacion:** `workspace-projects/projects/{proyecto}/orchestration/skills/`

---

## 4. Ciclo de Vida de un Skill

### 4.1 Estados

```
planned --> draft --> active --> deprecated
   |                    |
   +--- cancelled       +--- archived
```

| Estado | Descripcion | Accion Requerida |
|--------|-------------|------------------|
| `planned` | Identificado como necesario, sin implementacion | Registrar en SKILLS-REGISTRY.yml |
| `draft` | SKILL.md en desarrollo, no disponible para agentes | Completar secciones obligatorias |
| `active` | Listo para uso en produccion | Pasar validaciones de seccion 10 |
| `deprecated` | Reemplazado o en desuso, no usar en tareas nuevas | Documentar skill sucesor |

### 4.2 Creacion

1. **Desde directiva SIMCO existente:** Extraer instrucciones, crear SKILL.md con `simco_source` apuntando al archivo original.
2. **Desde capacidad nueva:** Crear directiva SIMCO primero (fuente de verdad), luego el skill que la referencia.
3. **Desde skill externo:** Seguir proceso de evaluacion (seccion 6), adaptar al formato interno.

### 4.3 Registro en SKILLS-REGISTRY.yml

Todo skill activo DEBE estar registrado en `orchestration/inventarios/SKILLS-REGISTRY.yml`:

```yaml
skills:
  - name: simco-safe-edit
    version: 1.0.0
    category: core
    status: active
    path: orchestration/skills/simco-safe-edit/
    simco_source: orchestration/directivas/simco/SIMCO-EDICION-SEGURA.md
    estimated_tokens: 800
    last_updated: 2026-02-05
```

### 4.4 Versionado

Se aplica **SemVer** (MAJOR.MINOR.PATCH):

| Cambio | Version | Ejemplo |
|--------|---------|---------|
| Instrucciones incompatibles, cambio de contrato | MAJOR | 1.0.0 -> 2.0.0 |
| Nuevos pasos o secciones sin romper existentes | MINOR | 1.0.0 -> 1.1.0 |
| Correcciones de texto, typos, clarificaciones | PATCH | 1.0.0 -> 1.0.1 |

### 4.5 Mantenimiento

Un skill DEBE actualizarse cuando:

- La directiva SIMCO de origen (`simco_source`) cambia
- Se detecta un error en las instrucciones o checklist
- Un agente reporta fallo al ejecutar el skill
- Cambia una dependencia del skill

### 4.6 Deprecacion

1. Marcar `estado: deprecated` en el frontmatter del SKILL.md
2. Actualizar SKILLS-REGISTRY.yml con `status: deprecated` y campo `successor`
3. Mantener el skill disponible por 30 dias para migracion
4. Archivar tras el periodo de gracia

---

## 5. Reglas de Creacion

### 5.1 Reglas Obligatorias

| # | Regla | Motivo |
|---|-------|--------|
| RC-S1 | DEBE referenciar directiva SIMCO en `simco_source` | Los skills no reemplazan directivas |
| RC-S2 | DEBE seguir CAPVED si `capved_required: true` | Coherencia con metodologia del workspace |
| RC-S3 | DEBE declarar `estimated_tokens` | Control de economia de tokens |
| RC-S4 | DEBE incluir seccion Checklist de Validacion | Verificabilidad de ejecucion correcta |
| RC-S5 | PROHIBIDO contener placeholders (`// ...`, `TODO:` sin implementacion, elipsis) | Regla 12 del workspace |
| RC-S6 | Cada paso en Instrucciones DEBE tener <50 lineas | Edicion segura y modularidad |
| RC-S7 | Preferir 5 skills pequenos sobre 1 skill grande | Carga selectiva, economia de tokens |

### 5.2 Directrices Recomendadas

- Cada skill cubre UNA capacidad bien definida (Single Responsibility)
- Los scripts en `scripts/` son idempotentes
- Las instrucciones usan verbos imperativos ("Ejecutar", "Verificar", "Crear")
- Los ejemplos de codigo son funcionales y verificables

---

## 6. Reglas de Evaluacion de Skills Externos

### 6.1 Fuentes Confiables

| Publisher | Repositorio | Nivel de Confianza |
|-----------|-------------|-------------------|
| vercel-labs | github.com/vercel-labs | Alto - proveedor cloud verificado |
| anthropics | github.com/anthropics | Alto - creador de Claude |
| supabase | github.com/supabase | Alto - proveedor BaaS verificado |

Skills de fuentes no listadas requieren revision manual completa antes de la instalacion.

### 6.2 Checklist de Seguridad

Antes de instalar un skill externo:

- [ ] Revisar contenido completo de SKILL.md (sin instrucciones maliciosas)
- [ ] Revisar `scripts/` por accesos de red no autorizados
- [ ] Revisar `scripts/` por escrituras a archivos fuera del scope del proyecto
- [ ] Verificar que no solicita credenciales ni tokens de acceso no documentados
- [ ] Confirmar que no ejecuta comandos destructivos (`rm -rf`, `drop`, `reset --hard`)

### 6.3 Verificacion de Compatibilidad

| Aspecto | Verificacion |
|---------|-------------|
| Nomenclatura | Alineada con ESTANDAR-NOMENCLATURA |
| Estructura de archivos | Compatible con estructura del workspace |
| Dependencias | No introduce dependencias conflictivas |
| Agentes | Compatible con al menos 1 agente del workspace |

### 6.4 Proceso de Instalacion

1. Instalar en scope de proyecto primero (NO global): `projects/{proyecto-test}/orchestration/skills/community/`
2. Probar en proyecto de bajo riesgo (template-saas o gamilit)
3. Ejecutar checklist de seguridad completo
4. Documentar resultado en SKILLS-REGISTRY.yml con campo `evaluation`
5. Si aprobado, mover a `orchestration/skills/community/` para uso global

---

## 7. Integracion con Flujo Multi-Agente

Los skills se integran con el flujo de 4 fases definido en Regla 11 del workspace:

| Fase | Agente | Rol del Skill |
|------|--------|---------------|
| **Fase 1** (10%) | Claude Code | Consultar SKILLS-REGISTRY.yml, seleccionar skills aplicables a la tarea |
| **Fase 2** (25%) | Gemini/Trae | Descomponer la tarea usando las Instrucciones del skill como guia |
| **Fase 3** (50%) | Windsurf | Ejecutar literalmente los scripts y pasos del skill |
| **Fase 4** (15%) | Claude/Trae | Validar usando el Checklist de Validacion del skill |

**Regla de delegacion:** Al delegar a un subagente, incluir en el prompt:
- Nombre del skill a ejecutar
- Ruta al SKILL.md
- Parametros de entrada especificos de la tarea

---

## 8. Economia de Tokens

### 8.1 Presupuesto por Skill

| Categoria | Tokens Recomendados | Maximo |
|-----------|-------------------|--------|
| Core (P0) | 500 - 1,000 | 1,500 |
| Operation (P1) | 800 - 1,500 | 2,000 |
| Sync (P2) | 1,000 - 1,500 | 2,500 |
| Community | Variable | 2,000 |
| Domain | Variable | 2,000 |

### 8.2 Estrategias de Optimizacion

| Estrategia | Descripcion |
|------------|-------------|
| Carga bajo demanda | Cargar skills solo cuando la tarea lo requiere, no todos siempre |
| Modularidad | Preferir skills de 500-1,500 tokens sobre skills monoliticos |
| Skills universales | Solo los Core (P0) pueden incluirse en AGENTS.md o CLAUDE.md |
| RAG para skills grandes | Si un skill supera 2,000 tokens, indexar en vector store y cargar por fragmentos |
| Cache de sesion | Reutilizar skills ya cargados en la sesion activa |

### 8.3 Calculo de estimated_tokens

```
estimated_tokens = (caracteres_SKILL.md / 4) + (caracteres_scripts / 4)
```

Redondear al centenas mas cercano. Incluir solo archivos que el agente necesita leer.

---

## 9. Ubicacion y Nomenclatura

### 9.1 Directorios

| Tipo | Ubicacion |
|------|-----------|
| Skills internos SIMCO | `orchestration/skills/simco-{nombre}/` |
| Skills community | `orchestration/skills/community/{publisher}-{nombre}/` |
| Skills de dominio | `projects/{proyecto}/orchestration/skills/{nombre}/` |
| Registro central | `orchestration/inventarios/SKILLS-REGISTRY.yml` |

### 9.2 Convenciones de Nombres

| Elemento | Convencion | Ejemplo |
|----------|-----------|---------|
| Directorio del skill | kebab-case, prefijo `simco-` para internos | `simco-safe-edit` |
| Archivo principal | Siempre `SKILL.md` (mayusculas) | `SKILL.md` |
| Scripts | kebab-case, extension segun lenguaje | `validate.sh`, `execute.ps1` |
| Referencias | UPPER-KEBAB-CASE para docs, kebab-case para templates | `EXAMPLE-INPUT.md` |
| Secciones del body | PascalCase en titulos, pasos numerados | `## Checklist de Validacion` |

### 9.3 Nombres Prohibidos

- No usar caracteres especiales ni espacios en nombres de directorios
- No usar prefijo `simco-` para skills community o de dominio
- No reutilizar el nombre de una directiva SIMCO como nombre de skill sin prefijo

---

## 10. Validaciones Obligatorias

Antes de marcar un skill como `active`, DEBE pasar las siguientes validaciones:

### 10.1 Validacion Estructural

| # | Validacion | Comando/Verificacion |
|---|-----------|---------------------|
| V1 | SKILL.md existe en el directorio del skill | `ls orchestration/skills/{nombre}/SKILL.md` |
| V2 | Frontmatter YAML es valido (parseable) | Verificar sintaxis YAML |
| V3 | Todos los campos obligatorios presentes | `name`, `description`, `version`, `simco_source`, `category`, `priority`, `estimated_tokens` |
| V4 | Cuerpo tiene secciones obligatorias | Proposito, Cuando Usar, Instrucciones, Checklist de Validacion, Referencias |

### 10.2 Validacion de Contenido

| # | Validacion | Criterio |
|---|-----------|----------|
| V5 | Sin patrones prohibidos | No contiene `// ...`, `/* ... */`, `TODO:` sin implementacion, `...` como elipsis |
| V6 | Pasos de instruccion <50 lineas cada uno | Contar lineas por paso |
| V7 | `simco_source` apunta a archivo existente | `ls {simco_source}` retorna OK |
| V8 | Dependencias existen en SKILLS-REGISTRY | Cada skill en `dependencies` tiene `status: active` |

### 10.3 Validacion de Registro

| # | Validacion | Criterio |
|---|-----------|----------|
| V9 | Skill registrado en SKILLS-REGISTRY.yml | Entrada con `name` y `status` presentes |
| V10 | Version en SKILL.md coincide con SKILLS-REGISTRY | Ambos reportan la misma version |

---

## Resumen de Reglas Clave

| Regla | Descripcion |
|-------|-------------|
| Los skills NO reemplazan directivas SIMCO | `simco_source` es obligatorio, la directiva sigue siendo la fuente de verdad |
| Modularidad sobre monolitos | Preferir multiples skills pequenos sobre uno grande |
| Evaluacion antes de instalar | Todo skill externo pasa checklist de seguridad y compatibilidad |
| Economia de tokens | Declarar `estimated_tokens`, cargar bajo demanda |
| Validacion obligatoria | 10 verificaciones antes de activar un skill |

---

*Estandar de Skills para Agentes IA - workspace-arch - Version 1.0.0*
