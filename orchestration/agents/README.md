# Agentes del Workspace

Perfiles, configuraciones y trazas de agentes IA.

## Estructura

| Carpeta | Contenido |
|---------|-----------|
| `configs/` | Configuraciones compartidas entre agentes |
| `perfiles/` | 28 perfiles de agentes especializados |
| `prompts/` | Prompts de arranque |
| `trazas/` | Trazas de actividad por agente |

## Configuraciones Compartidas (configs/)

| Archivo | Propósito |
|---------|-----------|
| `SHARED-PLATFORM-CONFIG.yml` | Comandos cross-platform |
| `SHARED-PROJECT-REGISTRY.yml` | Registro de 18 proyectos |
| `SHARED-LOAD-SEQUENCE.yml` | Secuencia de carga de contexto |
| `SHARED-CHECKPOINT-CONFIG.yml` | Configuración de checkpoints |

## Perfiles Principales (perfiles/)

- `PERFIL-DATABASE-POSTGRESQL.md` - Agente de base de datos PostgreSQL
- `PERFIL-BACKEND-NESTJS.md` - Agente backend NestJS
- `PERFIL-FRONTEND-REACT.md` - Agente frontend React
- `PERFIL-ORQUESTADOR.md` - Tech Leader / Orquestador
- `PERFIL-INFRASTRUCTURE-MANAGER.md` - Gestión de infraestructura

Ver mapa completo: `perfiles/_MAP.md`

## Trazas (trazas/)

- `_INDEX.yml` - Índice de trazas
- `TRAZA-{AGENTE}-{FECHA}.md` - Trazas por agente

## Uso

```
1. Identificar tipo de tarea
2. Cargar perfil correspondiente: agents/perfiles/PERFIL-{tipo}.md
3. Registrar actividad en trazas al completar
```
