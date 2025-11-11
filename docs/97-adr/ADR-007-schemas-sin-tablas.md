# ADR-007: Schemas de Base de Datos Sin Tablas

**Estado:** Aceptado
**Fecha:** 2025-11-10
**Autores:** Equipo Técnico GAMILIT
**Decisores:** Tech Lead, Database Architect

---

## Contexto

Durante la reorganización de la base de datos a arquitectura modular (13 schemas por dominio), se identificaron 3 schemas sin tablas propias:

1. **admin_dashboard** - 0 tablas, 4 vistas
2. **gamilit** - 0 tablas, 14 funciones
3. **storage** - 0 tablas, 1 enum

Esta situación genera confusión sobre si son schemas "incompletos" o si hay una estrategia arquitectónica intencional.

---

## Decisión

Se decide **mantener los 3 schemas sin tablas** por las siguientes razones estratégicas:

### 1. admin_dashboard

**Estrategia:** Usar **vistas exclusivamente** sobre tablas de otros schemas.

**Justificación:**
- Evita duplicación de datos
- Mantiene una capa de agregación separada
- Facilita cambios en la estructura subyacente sin afectar dashboards
- Performance adecuado con índices en tablas base

**Implementación:**
```sql
-- 4 vistas implementadas:
- user_stats_summary (agrega datos de auth_management + gamification)
- organization_stats_summary (agrega social_features + progress_tracking)
- moderation_queue (agrega content_management + audit_logging)
- recent_admin_actions (agrega audit_logging)
```

**Beneficio:** Separación de concerns - el schema admin_dashboard NO posee datos, solo los presenta.

### 2. gamilit

**Estrategia:** Schema para **funciones utilitarias compartidas** (sin datos propios).

**Justificación:**
- Funciones de utilidad necesitan ubicación centralizada
- No requieren tablas de estado
- Se usan desde múltiples schemas
- Evita duplicación de código SQL

**Implementación:**
```sql
-- 14 funciones utilitarias:
- get_current_user_id()
- get_current_user_role()
- validate_email_format()
- validate_username()
- now_mexico()
- is_admin()
- audit_profile_changes()
- update_updated_at_column()
- etc.
```

**Beneficio:** Reutilización de lógica común sin acoplamiento de datos.

### 3. storage

**Estrategia:** **Delegar completamente a Supabase Storage API**.

**Justificación:**
- Supabase Storage maneja buckets, objetos y metadatos internamente
- No necesitamos tablas custom para storage
- Reduce complejidad de mantenimiento
- Aprovecha features optimizadas de Supabase (CDN, transformaciones, etc.)

**Implementación:**
- API: `supabase.storage.from('bucket').upload()`
- Sin tablas custom
- Metadata en `storage.objects` (tabla managed de Supabase)

**Beneficio:** Menor superficie de mantenimiento, features enterprise incluidas.

---

## Alternativas Consideradas

### Alternativa 1: Crear Tablas en admin_dashboard
**Pros:** Datos "propios" del dashboard
**Cons:** Duplicación de datos, sincronización compleja, ETL necesario
**Decisión:** ❌ Rechazado - vistas son suficientes

### Alternativa 2: Crear Schema functions/ en lugar de gamilit
**Pros:** Nombre más explícito
**Cons:** Breaking change, migraciones complejas
**Decisión:** ❌ Rechazado - nombre gamilit es histórico y funcional

### Alternativa 3: Implementar Custom Storage en storage schema
**Pros:** Control total sobre storage
**Cons:** Reinventar la rueda, 100+ horas de desarrollo, bugs potenciales
**Decisión:** ❌ Rechazado - Supabase Storage es superior

---

## Consecuencias

### Positivas

✅ **Claridad Arquitectónica:** Documentado que schemas sin tablas son intencionales
✅ **Menor Complejidad:** No duplicación de datos
✅ **Mejor Mantenimiento:** Cambios en un solo lugar
✅ **Performance:** Vistas optimizadas con índices en tablas base
✅ **Reutilización:** Funciones compartidas evitan código duplicado

### Negativas

⚠️ **Confusión Inicial:** Desarrolladores nuevos pueden pensar que están "incompletos"
⚠️ **Documentación Crítica:** Requiere ADR (este documento) para explicar estrategia
⚠️ **Dependencia de Supabase:** Storage depende 100% de servicio externo

### Mitigación

- ✅ Este ADR documenta la estrategia claramente
- ✅ Comentarios en DDL explican el propósito de cada schema
- ✅ Inventario de base de datos (DATABASE_INVENTORY.yml) documenta el estado
- ✅ Backups de Supabase Storage configurados

---

## Estado de Implementación

| Schema | Tablas | Objetos | Estado | Documentado |
|--------|--------|---------|--------|-------------|
| **admin_dashboard** | 0 | 4 vistas | ✅ Completo | ✅ Sí |
| **gamilit** | 0 | 14 funciones | ✅ Completo | ✅ Sí |
| **storage** | 0 | 1 enum (legacy) | ✅ Completo | ✅ Sí |

---

## Referencias

- **DDL:** `/apps/database/ddl/schemas/*/`
- **Inventario:** `/docs/90-transversal/inventarios/DATABASE_INVENTORY.yml`
- **ADR Relacionado:** ADR-002 (Arquitectura de Base de Datos)
- **Epic:** EMR-001 (Migración a Schemas Modulares)

---

## Aprobaciones

- [x] Tech Lead
- [x] Database Architect
- [x] Backend Lead
- [x] DevOps Lead

---

## Changelog

| Fecha | Versión | Cambio |
|-------|---------|--------|
| 2025-11-10 | 1.0 | ADR inicial - Decisión documentada |

---

**Este ADR resuelve la confusión sobre schemas "vacíos" y establece que su estado actual es intencional y arquitectónicamente sound.**
