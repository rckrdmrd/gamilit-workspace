# Definiciones SSOT

Definiciones centrales reutilizables del sistema NEXUS.

## Estructura

| Carpeta | Contenido |
|---------|-----------|
| `checklists/` | Checklists reutilizables (post-task, recovery) |
| `protocols/` | Protocolos (checkpoint, recovery) |
| `schemas/` | Schemas de validación YAML |
| `sections/` | Secciones de documentos |
| `triggers/` | Triggers automáticos del sistema |
| `validations/` | Validaciones reutilizables |

## Archivos Clave

### Checklists
- `CHECKLIST-POST-TASK.md` - Validación antes de completar tarea
- `CHECKLIST-RECOVERY.md` - Recovery de sesión

### Protocols
- `CHECKPOINT-PROTOCOL.md` - Protocolo de checkpoints
- `RECOVERY-PROTOCOL.md` - Recovery < 3 min

### Schemas
- `SESSION-STATE.schema.yml` - Estado de sesión
- `PROXIMA-ACCION.schema.yml` - Formato próxima acción
- `CHECKPOINT.schema.yml` - Formato checkpoint

### Triggers
- `TRIGGER-CONTEXT-PURGE.yml` - Purga de contexto
- `TRIGGER-AUTO-CHECKPOINT.yml` - Checkpoint automático

## Índice

Ver: `_INDEX.yml`

## Uso

Estas definiciones son cargadas automáticamente por NEXUS según el contexto.
