# Cursor - GAMILIT

## Quick Start

1. Leer `.cursor/BOOTLOADER.md` al inicio de sesion.
2. Leer `.cursor/AGENT-CAPABILITIES.md` para limites y responsabilidades.
3. Cargar `CLAUDE.md` y directivas de `orchestration/directivas/simco/`.

## Rol

Cursor funciona como agente de implementacion y analisis operativo en IDE:
- Ejecuta tareas definidas.
- Aplica reglas de edicion segura.
- Puede usar Self-Persona Switch para perfiles especializados.

## Limitacion Clave

Cursor **no** usa subagentes nativos en este proyecto.
Cuando una directiva mencione delegacion, convertirla a pasos secuenciales.

## Referencias

- `CLAUDE.md`
- `.cursor/BOOTLOADER.md`
- `.cursor/AGENT-CAPABILITIES.md`
- `orchestration/directivas/simco/SIMCO-EDICION-SEGURA.md`
