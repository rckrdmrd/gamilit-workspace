# TASK-005: Contexto

## Solicitud Original

Sincronizar la estructura completa de `orchestration/` desde workspace-v2 a gamilit para lograr independencia total del proyecto.

## Estado Previo

- **Politica anterior:** `REFERENCIAR_NO_COPIAR` - gamilit referenciaba archivos del workspace
- **Problema:** Dependencia del workspace para directivas, templates, y configuraciones
- **Riesgo:** Cambios en workspace podian afectar gamilit sin control

## Objetivo

Cambiar a politica `REPLICA_COMPLETA` donde gamilit tiene su propia copia de:
- Sistema SIMCO completo
- Perfiles de agentes
- Templates y definiciones
- Referencias y aliases

## Alcance

| Directorio | Archivos | Descripcion |
|------------|----------|-------------|
| agents/ | 66 | Perfiles, configs, trazas |
| directivas/ | 124 | SIMCO, triggers, modos |
| _definitions/ | 29 | Checklists, protocols |
| referencias/ | 29 | Aliases, prompts |
| templates/ | 60 | Templates por contexto |
| _quick/ | 4 | Indices rapidos |
| **TOTAL** | **312** | |

## Decisiones Clave

1. Copiar todo sin modificar contenido
2. Actualizar solo paths en BOOTLOADER.md y _inheritance.yml
3. Mantener estructura de carpetas identica

---

**Siguiente fase:** Ver METADATA.yml para detalles de ejecucion
