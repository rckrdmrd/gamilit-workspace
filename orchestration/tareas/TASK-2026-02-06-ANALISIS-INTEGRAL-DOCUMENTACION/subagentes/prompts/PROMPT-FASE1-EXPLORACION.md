# PROMPT: Fase 1 - Exploracion (5 agentes paralelos)

**Perfil:** Explore (Sonnet)
**Fase:** 1 - Contexto
**Herramientas:** Glob, Read, Grep

## Agentes y Contexto Enviado

### SA-EXPLORE-01: Orchestration Structure
**Tarea:** Explore the complete orchestration/ directory structure of the gamilit project. Map all subdirectories, count files per directory, identify key configuration files (CONTEXT-MAP.yml, BOOTLOADER.md, PROJECT-PROFILE.yml), list all inventories, and report the overall organization.
**Contexto:** Path base projects/gamilit/orchestration/
**Resultado esperado:** Mapa completo de estructura con counts

### SA-EXPLORE-02: Docs Directory
**Tarea:** Explore the complete docs/ directory structure. Map all subdirectories (00-vision through 99-finiquito), count files per section, identify READMEs and _MAP.md files, list all EPICs and their RF/US/ET files.
**Contexto:** Path base projects/gamilit/docs/
**Resultado esperado:** Inventario de docs con cobertura por seccion

### SA-EXPLORE-03: Root/CLAUDE.md Config
**Tarea:** Read the CLAUDE.md local file and all root configuration files (.claude/, BOOTLOADER.md, CONTEXT-MAP.yml). Extract project metrics, stack info, aliases, and compare with workspace CLAUDE.md.
**Contexto:** Path base projects/gamilit/
**Resultado esperado:** Metricas de configuracion y discrepancias

### SA-EXPLORE-04: Shared/Knowledge-Base
**Tarea:** Explore shared/mirrors/gamilit/ and shared/catalog/gamification/ directories. Read PROPAGATION-STATUS.yml, check sync dates, compare metrics with project inventories.
**Contexto:** Paths shared/mirrors/gamilit/, shared/catalog/gamification/
**Resultado esperado:** Estado de mirrors y catalogo compartido

### SA-EXPLORE-05: Tasks Detail
**Tarea:** List all task directories in orchestration/tareas/, read METADATA.yml of each, count active vs archived vs completed tasks. Read _INDEX.yml for global stats.
**Contexto:** Path base projects/gamilit/orchestration/tareas/
**Resultado esperado:** Inventario de tareas con estados
