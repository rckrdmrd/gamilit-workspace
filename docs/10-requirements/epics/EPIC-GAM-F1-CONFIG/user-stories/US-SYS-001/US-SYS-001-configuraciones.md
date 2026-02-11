---
id: US-SYS-001
title: Gestionar Configuraciones Globales
epic: EAI-006
rf_parent: RF-SYS-001
story_points: 3
status: Done
created: 2025-10-27
updated: 2026-01-04
---

# US-SYS-001: Gestionar Configuraciones Globales

## User Story

**Como** administrador del sistema
**Quiero** gestionar configuraciones globales del sistema
**Para** ajustar parametros de comportamiento sin modificar codigo

## Contexto

Sistema clave-valor para configuraciones centralizadas que permite modificar comportamiento del sistema en tiempo de ejecucion.

## Criterios de Aceptacion

- [x] Tabla system_settings con estructura key-value
- [x] CRUD de configuraciones via API
- [x] Tipos de datos soportados: string, number, boolean, json
- [x] Validacion de tipos en modificaciones
- [x] Cache de configuraciones frecuentes
- [x] Valores por defecto si no existe configuracion

## Configuraciones Implementadas

| Key | Tipo | Descripcion |
|-----|------|-------------|
| max_file_size | number | Tamano maximo de archivos (bytes) |
| session_timeout | number | Timeout de sesion (segundos) |
| xp_multiplier | number | Multiplicador de XP |
| maintenance_mode | boolean | Modo mantenimiento |

## Implementacion

**Schema:** system_configuration
**Tabla:** system_settings
**Endpoint:** /api/admin/settings

## Notas

- Implementado: 2025-10-27
- Documentado retroactivamente: 2026-01-04

---

**Estado:** Done
