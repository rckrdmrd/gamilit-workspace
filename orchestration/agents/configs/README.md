# Agent Shared Configurations

**Sistema:** SIMCO v4.0.0 + NEXUS v4.0
**Versión:** 1.0.0
**Fecha:** 2026-01-24

---

## Propósito

Esta carpeta centraliza las configuraciones compartidas por TODOS los agentes del workspace:
- **Claude Code** (claude)
- **Gemini CLI** (gemini)
- **Trae** (IDE con Gemini 3 Pro / GPT 5.2)
- **Windsurf** (IDE con Cascade AI)

## Archivos

| Archivo | Propósito | Tamaño |
|---------|-----------|--------|
| `SHARED-PLATFORM-CONFIG.yml` | Detección de plataforma y comandos cross-platform | ~400 líneas |
| `SHARED-PROJECT-REGISTRY.yml` | Registro de los 18 proyectos con aliases | ~250 líneas |
| `SHARED-LOAD-SEQUENCE.yml` | Secuencia de carga de contexto (boot sequence) | ~350 líneas |
| `PROFILE-SKILL-MAP.json` | SSOT ejecutable de `task -> profile -> principles -> skills -> context` | ~300 líneas |
| `../tools/profile_skill_resolver.py` | Resolvedor determinístico de perfil y skills | ~220 líneas |

## Uso

### Para Agentes

Cada agente debe referenciar estos archivos en su secuencia de arranque:

```yaml
# Ejemplo: En BOOTLOADER del agente
boot_sequence:
  - step: 0
    file: "orchestration/agents/configs/SHARED-PLATFORM-CONFIG.yml"
  - step: 1
    file: "orchestration/agents/configs/SHARED-PROJECT-REGISTRY.yml"
  - step: 7
    resolver: "orchestration/agents/tools/profile_skill_resolver.py"
    map: "orchestration/agents/configs/PROFILE-SKILL-MAP.json"
  # ...
```

### Para Configuraciones de IDE

Los archivos `.gemini/`, `.windsurf/`, y `.trae/` deben referenciar estos archivos compartidos en lugar de mantener copias locales:

```yaml
# En .windsurf/LOAD-MAP.yml
shared_resources:
  platform_config: "orchestration/agents/configs/SHARED-PLATFORM-CONFIG.yml"
  project_registry: "orchestration/agents/configs/SHARED-PROJECT-REGISTRY.yml"
  load_sequence: "orchestration/agents/configs/SHARED-LOAD-SEQUENCE.yml"
```

## Migración

Estos archivos fueron consolidados de:
- `.gemini/antigravity/PLATFORM-CONFIG.yml` → `SHARED-PLATFORM-CONFIG.yml`
- `.windsurf/PROJECT_REGISTRY.yml` + `.gemini/antigravity/PROJECT_REGISTRY.yml` → `SHARED-PROJECT-REGISTRY.yml`
- `.gemini/antigravity/LOAD-MAP.yml` + `.windsurf/LOAD-MAP.yml` → `SHARED-LOAD-SEQUENCE.yml`

## Actualización

Cuando se modifique cualquiera de estos archivos:

1. **Verificar compatibilidad** con todos los agentes
2. **Actualizar versión** en el header del archivo
3. **Documentar cambios** en el commit message
4. **Notificar** a los demás agentes si hay breaking changes

## Relación con Otros Archivos

```
orchestration/agents/configs/
├── SHARED-PLATFORM-CONFIG.yml     ← Plataforma y comandos
├── SHARED-PROJECT-REGISTRY.yml    ← Proyectos y aliases
├── SHARED-LOAD-SEQUENCE.yml       ← Secuencia de carga
└── README.md                      ← Este archivo

Referenciados por:
├── .gemini/antigravity/LOAD-MAP.yml
├── .windsurf/LOAD-MAP.yml
├── .trae/rules.md
└── orchestration/directivas/simco/SIMCO-BOOTLOADER.md
```

## Aliases

Los siguientes aliases en `CLAUDE.md` apuntan a esta carpeta:

- `@SHARED-PLATFORM-CONFIG` - Configuración de plataforma
- `@SHARED-PROJECT-REGISTRY` - Registro de proyectos
- `@SHARED-LOAD-SEQUENCE` - Secuencia de carga

---

*Parte del Sistema SIMCO v4.0.0 + NEXUS v4.0*
