# PROMPT: Sprint 2 - Creacion RF Files (4 agentes background)

**Perfil:** General (Sonnet)
**Fase:** Sprint 2
**Herramientas:** Write, Bash, Read

### Template RF Enviado a Todos los Agentes:
```
---
id: RF-{PREFIX}-{NNN}
title: "{Titulo del Requerimiento}"
type: requerimiento_funcional
status: done|partial|pending
priority: P0|P1|P2
module: {module_name}
epic: {EPIC-ID}
version: "1.0.0"
created: "2026-02-06"
updated: "2026-02-06"
---

# {id}: {title}

| Campo | Valor |
|-------|-------|
| EPIC | {EPIC-ID} |
| User Story | {US-ID} |
| Modulo | {module} |
| Prioridad | {priority} |

## Descripcion
{2-3 sentences}

## Requerimiento Funcional
### {id}.1: {sub-req 1}
### {id}.2: {sub-req 2}
...

## Criterios de Aceptacion
- [ ] AC-001: ...
- [ ] AC-002: ...

## Referencias
- User Story: {US-ID}
- Especificacion: {ET-ID}
- EPIC: {EPIC-ID}
```

### Batches:
- SA-S23-BG-02: Phase 1 EPICs (17 files) - EAI-001,002,003,005
- SA-S23-BG-03: EXT-001 Teacher Portal (21 files) - RF-TCH-000..013
- SA-S23-BG-04: EXT-002+ Extensions (55 files) - 10 EPICs
- SA-S23-BG-05: Phase 2 + EAI-003-EXT (11 files)

**Instruccion clave:** "Read the existing User Stories and Specifications in the EPIC directory to derive RF content. Each RF file must reference its US and ET. Use concise format, ~80-100 lines per file."
