# TAREA: CORR-001-REVISED - Consolidacion de Feature Flags

**Fecha de creacion:** 2026-01-13
**Prioridad:** MEDIA
**Estado:** PENDIENTE
**Origen:** AUDITORIA-DATABASE-2026-01-13.md

---

## PROBLEMA IDENTIFICADO

Existen **dos funciones `is_feature_enabled`** con firmas y propositos DIFERENTES en el schema `system_configuration`:

### Funcion 1: Por Usuario/Rol

**Ubicacion:** `ddl/schemas/system_configuration/functions/is_feature_enabled.sql`

```sql
CREATE OR REPLACE FUNCTION system_configuration.is_feature_enabled(
    p_feature_key TEXT,
    p_user_id UUID DEFAULT NULL
) RETURNS BOOLEAN
```

**Caracteristicas:**
- Verifica por `feature_key` y `user_id`
- Soporte para:
  - `target_users` (whitelist de usuarios)
  - `target_roles` (array de roles)
  - `rollout_percentage` (gradual rollout / A-B testing)
  - `starts_at` / `ends_at` (ventanas temporales)
- Referencia Decision: D4-A

### Funcion 2: Por Tenant/Classroom

**Ubicacion:** `ddl/schemas/system_configuration/tables/06-feature_flags.sql` (inline)

```sql
CREATE OR REPLACE FUNCTION system_configuration.is_feature_enabled(
    p_flag_key VARCHAR,
    p_tenant_id UUID DEFAULT NULL,
    p_classroom_id UUID DEFAULT NULL
) RETURNS BOOLEAN
```

**Caracteristicas:**
- Verifica por `flag_key`, `tenant_id`, `classroom_id`
- Soporte para:
  - `is_system_wide` (flag global)
  - `tenant_overrides` (JSONB por tenant)
  - `classroom_overrides` (JSONB por aula)
- Jerarquia: classroom > tenant > system

---

## ANALISIS DEL CONFLICTO

### Diferencias Clave

| Aspecto | Funcion 1 (Usuario) | Funcion 2 (Tenant) |
|---------|--------------------|--------------------|
| Parametro principal | `feature_key TEXT` | `flag_key VARCHAR` |
| Segundo param | `user_id UUID` | `tenant_id UUID` |
| Tercer param | N/A | `classroom_id UUID` |
| Targeting | Usuarios, Roles | Tenants, Classrooms |
| Rollout | Si (percentage) | No |
| Time windows | Si | No |
| Overrides | No | Si (JSONB) |

### Impacto Actual

- PostgreSQL permite **sobrecarga de funciones** (function overloading)
- Ambas funciones pueden coexistir porque tienen firmas diferentes
- Sin embargo, esto genera confusion y posibles bugs

### Riesgo

- **BAJO a corto plazo**: Las funciones coexisten sin conflicto
- **MEDIO a largo plazo**: Confusion arquitectonica, codigo duplicado

---

## OPCIONES DE RESOLUCION

### Opcion A: Consolidar en una funcion unificada

```sql
CREATE OR REPLACE FUNCTION system_configuration.is_feature_enabled(
    p_feature_key TEXT,
    p_context JSONB DEFAULT '{}'::JSONB
    -- context puede incluir: user_id, tenant_id, classroom_id
) RETURNS BOOLEAN
```

**Pros:**
- Una sola funcion para mantener
- API unificada

**Contras:**
- Requiere refactorizar todos los llamadores
- Mayor complejidad interna

### Opcion B: Renombrar para clarificar

```sql
-- Mantener ambas con nombres descriptivos
is_feature_enabled_for_user(feature_key, user_id)
is_feature_enabled_for_context(flag_key, tenant_id, classroom_id)
```

**Pros:**
- Menor impacto en codigo existente
- Claridad de proposito

**Contras:**
- Mantener dos funciones
- Posible divergencia futura

### Opcion C: Unificar esquema de feature_flags

Unificar la tabla `feature_flags` para soportar TODOS los casos:
- target_users, target_roles (de Funcion 1)
- tenant_overrides, classroom_overrides (de Funcion 2)
- Crear una sola funcion que consulte todo

**Pros:**
- Solucion completa
- Una tabla, una funcion

**Contras:**
- Mayor esfuerzo de migracion
- Riesgo de romper funcionalidad existente

---

## RECOMENDACION

**Opcion B (Renombrar)** como solucion inmediata de bajo riesgo:

1. Renombrar funcion en `functions/is_feature_enabled.sql` a `is_feature_enabled_for_user`
2. Renombrar funcion inline en `tables/06-feature_flags.sql` a `is_feature_enabled_for_context`
3. Crear alias o deprecation notice para nombres originales
4. Actualizar llamadores en backend

**Opcion C** como solucion a mediano plazo si se requiere arquitectura unificada.

---

## PASOS DE IMPLEMENTACION (Opcion B)

### Fase 1: Analisis de impacto
- [ ] Buscar todos los usos de `is_feature_enabled` en backend
- [ ] Identificar cual firma usa cada llamador
- [ ] Documentar impacto del rename

### Fase 2: Renombrar funciones DDL
- [ ] Crear `is_feature_enabled_for_user.sql` (copia de funcion 1)
- [ ] Crear `is_feature_enabled_for_context.sql` (extraer de tabla)
- [ ] Agregar deprecation notice a funciones originales

### Fase 3: Actualizar backend
- [ ] Actualizar llamadas en servicios TypeORM
- [ ] Validar con tests

### Fase 4: Validacion
- [ ] Ejecutar recreate-database.sh
- [ ] Ejecutar build y tests del backend
- [ ] Verificar funcionalidad en ambiente de prueba

---

## REFERENCIAS

- AUDITORIA-DATABASE-2026-01-13.md (CRIT-002)
- PLAN-CORRECCIONES-DATABASE-2026-01-13.md (CORR-001)
- PLAN-FINAL-EJECUCION-2026-01-13.md (Postergada)
- Decision D4-A en DECISIONES-ARQUITECTURALES-REQUERIDAS.md

---

**Asignado a:** Por definir
**Fecha estimada:** Por definir
**Dependencias:** Ninguna critica
