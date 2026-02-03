---
id: US-SYS-002
title: Gestionar Feature Flags
epic: EAI-006
rf_parent: RF-SYS-002
story_points: 5
status: Done
created: 2025-10-27
updated: 2026-01-04
---

# US-SYS-002: Gestionar Feature Flags

## User Story

**Como** administrador del sistema
**Quiero** gestionar feature flags
**Para** realizar rollouts graduales de funcionalidades

## Contexto

Sistema de banderas para habilitar/deshabilitar features por ambiente, porcentaje de usuarios, o grupos especificos.

## Criterios de Aceptacion

- [x] Tabla feature_flags con metadata
- [x] Habilitar/deshabilitar features por ambiente
- [x] Rollout por porcentaje de usuarios
- [x] Targeting por rol o grupo
- [x] API para consultar estado de features
- [x] Evaluacion en tiempo real

## Campos de Feature Flag

| Campo | Tipo | Descripcion |
|-------|------|-------------|
| key | string | Identificador unico |
| enabled | boolean | Estado global |
| environment | string[] | Ambientes activos |
| rollout_percentage | number | % de usuarios |
| target_roles | string[] | Roles objetivo |

## Implementacion

**Schema:** system_configuration
**Tabla:** feature_flags
**Endpoint:** /api/admin/feature-flags

## Notas

- Implementado: 2025-10-27
- Documentado retroactivamente: 2026-01-04

---

**Estado:** Done
