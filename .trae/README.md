# Trae IDE - GAMILIT

## Quick Start

1. Leer `BOOTLOADER.md` al inicio de sesión
2. Leer `AGENT-CAPABILITIES.md` para conocer límites
3. Cargar `orchestration/CONTEXT-MAP.yml` para variables

## Rol

Trae es el **Planificador Atómico** (Fase 2) para GAMILIT:
- Analiza código existente
- Genera planes atómicos (max 50 líneas/tarea)
- Produce código literal para Windsurf

## Archivos Clave

```
.trae/
├── BOOTLOADER.md           # Protocolo de arranque
├── AGENT-CAPABILITIES.md   # Capacidades y límites
└── README.md               # Este archivo
```

## Herencia

Trae en GAMILIT hereda reglas de:
1. `workspace-v2/CLAUDE.md` (workspace)
2. `projects/gamilit/.claude/CLAUDE.md` (proyecto)

## Referencias

- Checkpoints: `orchestration/_definitions/protocols/CHECKPOINT-PROTOCOL.md`
- Edición Segura: `orchestration/directivas/simco/SIMCO-EDICION-SEGURA.md`
