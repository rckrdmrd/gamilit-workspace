# Prompts de Agentes - Indice

**Version:** 1.0.0
**Fecha:** 2026-01-24
**Mejora:** M-006 del Plan de Integracion

---

## Estructura de Segmentacion

El archivo original `AGENT-STARTUP-PROMPTS.md` (1284 lineas) ha sido segmentado
en archivos mas manejables siguiendo el limite de 500 lineas.

```
orchestration/referencias/prompts/
├── PROMPTS-INDEX.md              <- Este archivo
├── PROMPTS-COMMON.md             <- Resumen, flujo, seleccion de agentes
├── PROMPTS-CLAUDE-CODE.md        <- Prompts para Claude Code
├── PROMPTS-GEMINI-CLI.md         <- Prompts para Gemini CLI
├── PROMPTS-WINDSURF.md           <- Prompts para Windsurf
├── PROMPTS-TRAE.md               <- Prompts para Trae
└── PROMPTS-GEMINI-QA.md          <- Prompts para Gemini QA
```

---

## Mapeo de Contenido

| Archivo | Lineas Orig | Contenido |
|---------|-------------|-----------|
| PROMPTS-COMMON.md | 1-76 | Resumen de roles, flujo de 4 fases |
| PROMPTS-CLAUDE-CODE.md | 77-128 | Arquitecto/Orquestador |
| PROMPTS-GEMINI-CLI.md | 129-516 | Arquitecto Secundario |
| PROMPTS-WINDSURF.md | 517-703 | Ejecutor (Plan Atomico + Full-Stack) |
| PROMPTS-TRAE.md | 704-955 | Ejecutor + SOLO Mode |
| PROMPTS-GEMINI-QA.md | 956-1284 | QA/Testing Frontend |

---

## Uso

### Para Cargar Prompt de Agente Especifico

```
# En lugar de cargar todo AGENT-STARTUP-PROMPTS.md:
@PROMPTS-CLAUDE     # Solo prompts de Claude Code
@PROMPTS-WINDSURF   # Solo prompts de Windsurf
@PROMPTS-TRAE       # Solo prompts de Trae
@PROMPTS-GEMINI     # Solo prompts de Gemini CLI
```

### Para Ver Todos los Prompts

```
# Cargar archivo indice primero:
@PROMPTS-INDEX      # Este archivo
# Luego cargar archivos especificos segun necesidad
```

---

## Aliases en CLAUDE.md

```yaml
# Agregar a CLAUDE.md:
- `@PROMPTS-INDEX` - orchestration/referencias/prompts/PROMPTS-INDEX.md
- `@PROMPTS-COMMON` - orchestration/referencias/prompts/PROMPTS-COMMON.md
- `@PROMPTS-CLAUDE` - orchestration/referencias/prompts/PROMPTS-CLAUDE-CODE.md
- `@PROMPTS-GEMINI` - orchestration/referencias/prompts/PROMPTS-GEMINI-CLI.md
- `@PROMPTS-WINDSURF` - orchestration/referencias/prompts/PROMPTS-WINDSURF.md
- `@PROMPTS-TRAE` - orchestration/referencias/prompts/PROMPTS-TRAE.md
- `@PROMPTS-GEMINI-QA` - orchestration/referencias/prompts/PROMPTS-GEMINI-QA.md
```

---

## Estado de Segmentacion

| Archivo | Estado | Lineas |
|---------|--------|--------|
| PROMPTS-INDEX.md | Completado | ~120 |
| PROMPTS-COMMON.md | Completado | ~280 |
| PROMPTS-CLAUDE-CODE.md | Completado | ~85 |
| PROMPTS-GEMINI-CLI.md | Completado | ~220 |
| PROMPTS-WINDSURF.md | Completado | ~200 |
| PROMPTS-TRAE.md | Completado | ~270 |
| PROMPTS-GEMINI-QA.md | Completado | ~240 |

**Total segmentado:** 6/6 archivos
**Estado:** COMPLETADO - 2026-01-24

---

## Archivo Original

El archivo original `AGENT-STARTUP-PROMPTS.md` permanece como referencia.
La segmentacion esta completa y validada.

**Proximos pasos opcionales:**
1. Mover a `_archive/AGENT-STARTUP-PROMPTS-v3.4.0.md`
2. Crear redirect en ubicacion original
3. Agregar aliases a CLAUDE.md (listados arriba)

---

## Notas de Implementacion

- Cada archivo segmentado debe ser autonomo (no depender de otros)
- Mantener version y fecha en header de cada archivo
- Preservar formato y estructura original
- Validar que no falte contenido post-segmentacion

---

*PROMPTS-INDEX.md - Indice de prompts segmentados*
*Mejora M-006 - Sprint 2*
