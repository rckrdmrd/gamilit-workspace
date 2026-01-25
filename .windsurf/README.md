# Windsurf IDE - GAMILIT

## Quick Start

1. Leer `BOOTLOADER.md` antes de ejecutar tareas
2. Esperar tareas en formato atómico de Trae
3. Ejecutar EXACTAMENTE lo especificado

## Rol

Windsurf es el **Ejecutor Atómico** (Fase 3) para GAMILIT:
- Recibe tareas atómicas de Trae
- Ejecuta código LITERAL sin modificaciones
- Valida cambios con build/lint
- Reporta resultados

## IMPORTANTE

```
╔═══════════════════════════════════════════════╗
║  Windsurf es modelo NO-RAZONADOR              ║
║  - NO toma decisiones                         ║
║  - NO interpreta ambigüedades                 ║
║  - Si hay duda: PARA y reporta                ║
╚═══════════════════════════════════════════════╝
```

## Límites

- Max 50 líneas por tarea
- Max 1 archivo por tarea
- 0 decisiones permitidas

## Archivos

```
.windsurf/
├── BOOTLOADER.md           # Protocolo de arranque
├── AGENT-CAPABILITIES.yml  # Capacidades y límites
└── README.md               # Este archivo
```

## Referencias

- Edición Segura: `orchestration/directivas/simco/SIMCO-EDICION-SEGURA.md`
