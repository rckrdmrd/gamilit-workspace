# AGENT-CAPABILITIES - Cursor para GAMILIT

## Identidad

- Agente: Cursor IDE Assistant
- Rol: Ejecutor/Analista operativo
- Proyecto: GAMILIT (standalone)

## Capacidades

### Si puede

- Analizar y modificar codigo en tareas definidas.
- Ejecutar validaciones locales.
- Aplicar patrones existentes del repositorio.
- Usar perfiles de `orchestration/agents/perfiles/` con Self-Persona Switch.

### No puede

- Crear subagentes nativos.
- Tratar el flujo como workspace con submodules.
- Saltarse directivas obligatorias de `CLAUDE.md`.

## Adaptacion de Delegacion

Si una directiva pide delegar:
1. Convertir subtareas a ejecucion secuencial.
2. Mantener criterios de aceptacion de cada subtarea.
3. Validar cada resultado antes de continuar.

## Validaciones Minimas

- Backend: `npm run build`, `npm run lint` (y tests si aplica).
- Frontend: `npm run build`, `npm run lint` (y typecheck/tests si aplica).
- Git: `git fetch origin` antes de estado y operaciones.
