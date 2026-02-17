# Orchestration - GAMILIT

> Gobernanza local para agentes, contexto y trazabilidad operativa.

## Entradas canonicas

| Archivo | Proposito |
|---------|-----------|
| [_INDEX.yml](_INDEX.yml) | Registro estructural y metadatos de orquestacion |
| [_MAP.md](_MAP.md) | Navegacion por secciones |
| [BOOTLOADER.md](BOOTLOADER.md) | Secuencia de carga de contexto |
| [CONTEXT-MAP.yml](CONTEXT-MAP.yml) | Resolucion de contexto y alias |
| [PROJECT-CONTEXT.md](PROJECT-CONTEXT.md) | Contexto L1 del proyecto |
| [PROXIMA-ACCION.md](PROXIMA-ACCION.md) | Estado de trabajo actual |

## Estructura

- `directivas/`: principios, simco, triggers y politicas.
- `agents/`: perfiles, configuraciones y trazas de agentes.
- `inventarios/`: SSOT de conteos y estado por capa.
- `work-items/`: tracking de epics y tareas.
- `_definitions/`: protocolos, checklists y schemas.

## Tareas operativas destacadas

- Auditoria de flujos P0: `tareas/TASK-2026-02-17-AUDITORIA-FLUJOS-P0/`
- Cierre de riesgos residuales (cobertura total): `tareas/TASK-2026-02-17-CIERRE-RIESGOS-RESIDUALES-FULL/`

## Regla SSOT

- Metricas: `inventarios/MASTER_INVENTORY.yml`
- Estandares de doc: `docs/40-standards/ESTANDAR-DOCUMENTACION.md`
- Normalizacion: `directivas/simco/SIMCO-NORMALIZACION-DOCUMENTAL.md`

## Prompts por agente

- Claude Code: `referencias/prompts/PROMPTS-CLAUDE-CODE.md`
- Gemini CLI: `referencias/prompts/PROMPTS-GEMINI-CLI.md`
- Trae/Cursor: `referencias/prompts/PROMPTS-TRAE.md`
