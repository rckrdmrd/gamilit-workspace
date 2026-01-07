---
id: "RF-SYS-002"
title: "Feature Flags (Banderas de Funcionalidad)"
type: "Requirement"
status: "Done"
priority: "Alta"
module: "Configuracion del Sistema"
epic: "EAI-006"
version: "1.0"
labels: ["system", "feature-flags", "rollout", "a-b-testing", "targeting"]
created_date: "2025-11-08"
updated_date: "2026-01-04"
---

# RF-SYS-002: Feature Flags (Banderas de Funcionalidad)

**ID:** RF-SYS-002
**Título:** Sistema de Feature Flags
**Prioridad:** Alta
**Estado:** ✅ Implementado
**Fase:** 1 - Alcance Inicial
**Épica:** EAI-006 - Configuración del Sistema

---

## 📋 Descripción

Sistema de feature flags para activar/desactivar funcionalidades de forma dinámica sin necesidad de redesplegar código, permitiendo rollouts graduales y A/B testing.

---

## 🎯 Objetivos

1. Habilitar/deshabilitar features sin redesplegar
2. Rollouts graduales (porcentaje de usuarios)
3. Targeting por roles, usuarios específicos o condiciones
4. Programar activación/desactivación de features
5. Soportar multi-tenancy

---

## 📊 Requerimientos Funcionales

### REQ-001: Activación/Desactivación Dinámica

**Como** Product Owner
**Quiero** activar/desactivar features sin redesplegar
**Para** controlar el lanzamiento de funcionalidades

**Criterios:**
- ✅ Flag `is_enabled` controla si feature está activa
- ✅ Cambios se aplican inmediatamente (sin reinicio)
- ✅ API para consultar estado de feature

### REQ-002: Rollout Gradual

**Como** Product Owner
**Quiero** activar features para un porcentaje de usuarios
**Para** hacer lanzamientos graduales y seguros

**Criterios:**
- ✅ `rollout_percentage` (0-100%)
- ✅ Distribución aleatoria consistente por usuario
- ✅ Incremento gradual del porcentaje

### REQ-003: Targeting por Usuarios/Roles

**Como** Product Owner
**Quiero** activar features para usuarios o roles específicos
**Para** hacer beta testing o features exclusivas

**Criterios:**
- ✅ `target_users` - Array de UUIDs de usuarios
- ✅ `target_roles` - Array de roles (student, admin_teacher, super_admin)
- ✅ `target_conditions` - JSONB para condiciones complejas

### REQ-004: Programación Temporal

**Como** Product Owner
**Quiero** programar cuándo se activa/desactiva una feature
**Para** lanzamientos coordinados

**Criterios:**
- ✅ `starts_at` - Fecha de inicio
- ✅ `ends_at` - Fecha de fin
- ✅ Feature solo activa entre estas fechas

---

## 🔧 Tabla: `system_configuration.feature_flags`

**Columnas:**
- `id` - UUID (PK)
- `tenant_id` - UUID (nullable)
- `feature_name` - TEXT (nombre descriptivo)
- `feature_key` - TEXT (UNIQUE, clave técnica)
- `description` - TEXT
- `is_enabled` - BOOLEAN
- `rollout_percentage` - INTEGER (0-100)
- `target_users` - UUID[]
- `target_roles` - gamilit_role[]
- `target_conditions` - JSONB
- `starts_at` - TIMESTAMPTZ
- `ends_at` - TIMESTAMPTZ

---

## 📝 Ejemplo de Uso

```json
{
  "feature_key": "new_exercise_mechanic_matching",
  "feature_name": "Nueva Mecánica: Matching Avanzado",
  "description": "Mecánica de ejercicios de matching con drag & drop mejorado",
  "is_enabled": true,
  "rollout_percentage": 25,
  "target_roles": ["admin_teacher"],
  "starts_at": "2025-11-15T00:00:00Z",
  "ends_at": null
}
```

---

## 🔗 Referencias

- **Especificación Técnica:** [ET-SYS-001](../especificaciones/ET-SYS-001-database-schema.md)
- **Implementación:** apps/database/ddl/schemas/system_configuration/tables/02-feature_flags.sql

---

**Creado:** 2025-11-08
**Estado:** ✅ Implementado
