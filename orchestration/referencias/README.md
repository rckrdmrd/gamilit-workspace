# Referencias del Workspace

Aliases, prompts y templates de referencia.

## Estructura

| Carpeta/Archivo | Contenido |
|-----------------|-----------|
| `ALIASES.yml` | Sistema de aliases @ALIAS |
| `AGENT-STARTUP-PROMPTS.md` | Prompts de arranque por agente |
| `PROMPTS-ACTIVOS.yml` | Prompts en ejecución (gobernanza) |
| `PROMPTS-HISTORICO.yml` | Log de prompts completados |
| `prompts/` | Prompts de referencia |
| `templates/` | Templates de prompts |

## Templates Disponibles

| Template | Uso |
|----------|-----|
| `PROMPT-TEMPLATE.md` | Template estándar para prompts |
| `PROMPT-WINDSURF-ATOMICO.md` | Template ultra-compacto para Windsurf |
| `PROXIMA-ACCION-CHECKPOINTS.md` | Template de checkpoints |

## Gobernanza de Prompts

```
1. Crear prompt con PROMPT-TEMPLATE.md
2. Registrar en PROMPTS-ACTIVOS.yml
3. Ejecutar en agente externo
4. Al completar: mover a PROMPTS-HISTORICO.yml
```

## Alias Principal

Ver: `orchestration/CLAUDE.md` sección "ALIASES DE INVOCACION RAPIDA"
