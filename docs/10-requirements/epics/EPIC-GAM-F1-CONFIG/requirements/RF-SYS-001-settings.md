---
id: "RF-SYS-001"
title: "Sistema de Configuracion Global"
type: "Requirement"
status: "Done"
priority: "Alta"
module: "Configuracion del Sistema"
epic: "EAI-006"
version: "1.0"
labels: ["system", "configuration", "settings", "multi-tenancy", "admin"]
created_date: "2025-11-08"
updated_date: "2026-01-04"
---

# RF-SYS-001: Sistema de Configuración Global

**ID:** RF-SYS-001
**Título:** Sistema de Configuración Global
**Prioridad:** Alta
**Estado:** ✅ Implementado
**Fase:** 1 - Alcance Inicial
**Épica:** EAI-006 - Configuración del Sistema

---

## 📋 Descripción

La plataforma GAMILIT debe contar con un sistema centralizado de configuración que permita almacenar y gestionar parámetros del sistema de forma flexible, segura y auditable.

---

## 🎯 Objetivos

1. Permitir configurar parámetros del sistema sin necesidad de modificar código
2. Soportar diferentes tipos de datos (string, number, boolean, JSON, arrays)
3. Categorizar configuraciones para facilitar su organización
4. Implementar validaciones y restricciones de valores
5. Auditar cambios en configuraciones
6. Soportar multi-tenancy (configuraciones por organización)

---

## 📊 Requerimientos Funcionales

### REQ-001: Almacenamiento de Configuraciones

**Como** administrador del sistema
**Quiero** almacenar configuraciones clave-valor
**Para** tener parámetros configurables sin modificar código

**Criterios de Aceptación:**
- ✅ Cada configuración tiene una clave única (`setting_key`)
- ✅ Soporta valores de tipo: string, number, boolean, JSON, array
- ✅ Cada configuración puede tener un valor por defecto
- ✅ Soporta configuraciones globales y por tenant

### REQ-002: Categorización

**Como** administrador
**Quiero** organizar configuraciones por categorías
**Para** facilitar su gestión y búsqueda

**Categorías soportadas:**
- `general` - Configuraciones generales de la plataforma
- `gamification` - Parámetros de gamificación
- `security` - Configuraciones de seguridad
- `email` - Configuraciones de correo
- `storage` - Configuraciones de almacenamiento
- `analytics` - Configuraciones de analíticas
- `integrations` - Configuraciones de integraciones

### REQ-003: Validación de Valores

**Como** sistema
**Quiero** validar valores de configuración
**Para** prevenir configuraciones inválidas

**Validaciones soportadas:**
- Tipo de dato (string, number, boolean, JSON, array)
- Valores permitidos (lista de opciones)
- Rangos numéricos (min_value, max_value)
- Reglas de validación personalizadas (validation_rules JSONB)

### REQ-004: Configuraciones de Solo Lectura

**Como** sistema
**Quiero** marcar configuraciones como readonly
**Para** prevenir modificaciones accidentales de configuraciones críticas

**Criterios:**
- ✅ Configuraciones marcadas como `is_readonly = true` no se pueden modificar por API
- ✅ Configuraciones de sistema (`is_system = true`) son críticas
- ✅ Algunas configuraciones requieren reinicio (`requires_restart = true`)

### REQ-005: Visibilidad Pública

**Como** desarrollador frontend
**Quiero** acceder a configuraciones públicas sin autenticación
**Para** configurar comportamiento de la aplicación cliente

**Criterios:**
- ✅ Configuraciones marcadas como `is_public = true` son accesibles públicamente
- ✅ Configuraciones privadas requieren autenticación de admin

### REQ-006: Auditoría

**Como** administrador
**Quiero** saber quién modificó configuraciones y cuándo
**Para** tener trazabilidad de cambios

**Criterios:**
- ✅ Se registra `created_by` y `updated_by` (UUID del usuario)
- ✅ Se registra `created_at` y `updated_at`

---

## 🔧 Especificaciones Técnicas

### Tabla: `system_configuration.system_settings`

**Columnas principales:**
- `id` - UUID (PK)
- `tenant_id` - UUID (nullable para configuraciones globales)
- `setting_key` - TEXT (UNIQUE)
- `setting_category` - TEXT (categoría)
- `setting_subcategory` - TEXT (subcategoría opcional)
- `setting_value` - TEXT (valor actual)
- `value_type` - TEXT (string|number|boolean|json|array)
- `default_value` - TEXT (valor por defecto)
- `display_name` - TEXT (nombre para mostrar)
- `description` - TEXT (descripción)
- `help_text` - TEXT (ayuda para el usuario)
- `is_public` - BOOLEAN (accesible sin auth)
- `is_readonly` - BOOLEAN (no modificable)
- `is_system` - BOOLEAN (configuración de sistema)
- `requires_restart` - BOOLEAN (requiere reinicio)
- `validation_rules` - JSONB (reglas de validación)
- `allowed_values` - TEXT[] (valores permitidos)
- `min_value` - NUMERIC (mínimo para números)
- `max_value` - NUMERIC (máximo para números)
- `metadata` - JSONB (metadatos adicionales)

---

## 📝 Ejemplos de Uso

### Ejemplo 1: Configuración de tiempo de sesión

```json
{
  "setting_key": "session_timeout_minutes",
  "setting_category": "security",
  "setting_value": "30",
  "value_type": "number",
  "default_value": "30",
  "display_name": "Tiempo de Sesión (minutos)",
  "description": "Tiempo de inactividad antes de cerrar sesión automáticamente",
  "min_value": 5,
  "max_value": 1440,
  "is_public": false,
  "is_readonly": false,
  "requires_restart": false
}
```

### Ejemplo 2: ML Coins por ejercicio completado

```json
{
  "setting_key": "ml_coins_per_exercise",
  "setting_category": "gamification",
  "setting_value": "10",
  "value_type": "number",
  "default_value": "10",
  "display_name": "ML Coins por Ejercicio",
  "description": "Cantidad de ML Coins otorgados al completar un ejercicio",
  "min_value": 1,
  "max_value": 100,
  "is_public": true,
  "is_readonly": false
}
```

### Ejemplo 3: Nombre de la plataforma

```json
{
  "setting_key": "platform_name",
  "setting_category": "general",
  "setting_value": "GAMILIT",
  "value_type": "string",
  "default_value": "GAMILIT",
  "display_name": "Nombre de la Plataforma",
  "is_public": true,
  "is_readonly": true,
  "is_system": true
}
```

---

## 🔗 Referencias

- **Especificación Técnica:** [ET-SYS-001](../specifications/ET-SYS-001-database-schema.md)
- **Implementación:** apps/database/ddl/schemas/system_configuration/tables/01-system_settings.sql
- **API:** apps/backend/src/modules/config/

---

## ✅ Criterios de Aceptación

- [x] Tabla `system_settings` creada con todas las columnas
- [x] Constraints de validación implementados
- [x] Índices de performance creados
- [x] Trigger de updated_at implementado
- [x] RLS policies para seguridad implementadas
- [ ] API CRUD de configuraciones (pendiente documentar)
- [ ] Panel de administración (pendiente documentar)
- [ ] Tests unitarios (pendiente documentar)

---

**Creado:** 2025-11-08
**Última actualización:** 2025-11-08
**Responsable:** Tech Lead / DBA
**Estado:** ✅ Implementado (documentación retroactiva)
