# Schemas Pendientes de Documentación

**Proyecto:** GAMILIT Platform
**Fecha:** 2025-11-07
**Estado:** 📝 Pendiente de documentación completa

---

## Contexto

El proyecto GAMILIT tiene **11 schemas** en la base de datos PostgreSQL. De estos, **9 están completamente documentados** y **2 están pendientes** de documentación completa.

---

## Schemas Documentados (9/11)

✅ Schemas con documentación completa:

1. **auth** - Autenticación y gestión de usuarios
2. **auth_management** - Gestión avanzada de autenticación
3. **educational_content** - Contenido educativo (módulos, ejercicios)
4. **gamification_system** - Sistema de gamificación (ML Coins, achievements, rankings)
5. **progress_tracking** - Seguimiento de progreso de estudiantes
6. **social** - Funciones sociales (amigos, guilds, chat)
7. **admin_dashboard** - Dashboard administrativo
8. **audit_logging** - Logs de auditoría
9. **public** - Tablas públicas y utilidades

**Ubicación de documentación:** `docs/03-desarrollo/base-de-datos/schemas/`

---

## Schemas Pendientes (2/11)

### 1. storage

**Propósito:** Gestión de archivos y almacenamiento multimedia

**Tablas conocidas:**
- Metadata de archivos subidos
- Gestión de buckets
- Control de acceso a archivos
- Integración con MinIO/S3

**Prioridad:** Media
**Razón:** Funcionalidad planeada para EXT features (avatars, multimedia educativo)

**Estado actual:**
- ⚠️ Schema existe en código
- ❌ Sin documentación en `docs/`
- ⬜ Pendiente de documentar tablas específicas
- ⬜ Pendiente de documentar relaciones
- ⬜ Pendiente de documentar RLS policies

---

### 2. system_configuration

**Propósito:** Configuración del sistema y feature flags

**Tablas conocidas:**
- Configuración global del sistema
- Feature flags (activar/desactivar funcionalidades)
- Configuración por organización (tenant-specific settings)
- Parámetros de sistema

**Prioridad:** Media-Alta
**Razón:** Requerido para gestión de configuración multi-tenant

**Estado actual:**
- ⚠️ Schema existe en código
- ❌ Sin documentación en `docs/`
- ⬜ Pendiente de documentar tablas específicas
- ⬜ Pendiente de documentar estructura de configuración
- ⬜ Pendiente de documentar feature flags disponibles

---

## Plan de Documentación

### Fase 1: Inventario (1-2 horas)
- [ ] Listar todas las tablas de `storage` schema
- [ ] Listar todas las tablas de `system_configuration` schema
- [ ] Documentar columnas principales
- [ ] Identificar relaciones con otros schemas

### Fase 2: Documentación (3-4 horas)
- [ ] Crear `schemas/storage/README.md`
- [ ] Crear `schemas/system_configuration/README.md`
- [ ] Documentar cada tabla con:
  - Propósito
  - Columnas y tipos
  - Relaciones (FK)
  - Índices
  - RLS policies
  - Ejemplos de uso

### Fase 3: Integración (1 hora)
- [ ] Actualizar `ESQUEMA-COMPLETO.md` con los 2 schemas nuevos
- [ ] Actualizar diagramas ERD
- [ ] Agregar a documentación de APIs relevantes
- [ ] Actualizar seeds si es necesario

**Esfuerzo estimado total:** 5-7 horas
**Asignado a:** Backend team + Database team

---

## Impacto de la Falta de Documentación

### storage schema
**Impacto:** Medio
- Desarrolladores no saben cómo implementar uploads correctamente
- No hay guía de integración con MinIO/S3
- Faltan políticas de acceso documentadas

**Workaround actual:** Revisar código fuente directamente

### system_configuration schema
**Impacto:** Medio-Alto
- No está claro cómo agregar feature flags
- Configuración multi-tenant no documentada
- Dificulta onboarding de nuevos desarrolladores

**Workaround actual:** Revisar código fuente + consultar a backend lead

---

## Referencias

> **Documentación relacionada:**
> - [ESQUEMA-COMPLETO.md](../ESQUEMA-COMPLETO.md) - Esquema completo (incluirá estos schemas una vez documentados)
> - [README.md](../README.md) - Índice de documentación de base de datos

> **Código fuente:**
> - DDL: `apps/database/ddl/schemas/storage/`
> - DDL: `apps/database/ddl/schemas/system_configuration/`

> **Issues relacionados:**
> - Issue #DB-001: Documentar storage schema
> - Issue #DB-002: Documentar system_configuration schema

---

**Última actualización:** 2025-11-07
**Próxima revisión:** Al completar documentación de schemas
**Responsable:** @database-team
