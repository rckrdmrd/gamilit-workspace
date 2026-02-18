# BOOTLOADER - Cursor para GAMILIT

## Secuencia de Arranque

1. Leer `CLAUDE.md`.
2. Leer `.cursor/AGENT-CAPABILITIES.md`.
3. Leer `orchestration/CONTEXT-MAP.yml`.
4. Leer `orchestration/PROXIMA-ACCION.md`.
5. Cargar directiva por dominio desde `orchestration/directivas/simco/`.

## Mapeo por Dominio

- DDL -> `SIMCO-DDL.md`
- Backend -> `SIMCO-BACKEND.md`
- Frontend -> `SIMCO-FRONTEND.md`
- Validacion -> `SIMCO-VALIDAR.md`
- Git -> `SIMCO-GIT.md`

## Reglas Clave

- Monorepo standalone (sin submodules).
- Ejecucion secuencial (sin subagentes nativos).
- `git fetch origin` antes de revisar estado.
- Validaciones de build/lint/test segun alcance de cambios.
