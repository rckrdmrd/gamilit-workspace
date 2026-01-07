# Estrategia de Foreign Keys: auth.users.id vs profiles.id

**Documento:** P0-004 - FK Strategy Documentation
**Fecha:** 2025-12-27
**Autor:** Requirements-Analyst Agent

---

## 1. Contexto del Problema

En GAMILIT existen dos tablas principales de usuario:
- `auth.users` - Tabla de autenticación (Supabase compatible)
- `auth_management.profiles` - Tabla de perfil extendido

Ambas comparten el mismo UUID como ID (profiles.id = users.id), pero algunas tablas referencian `auth.users.id` mientras otras referencian `profiles.id`.

---

## 2. Regla General

| Tipo de Tabla | Debe Referenciar | Razón |
|---------------|------------------|-------|
| Autenticación (sessions, tokens) | `auth.users.id` | Datos de auth puro |
| Datos de usuario (gamificación, progreso) | `profiles.id` | Datos de negocio |
| Multi-tenant (cualquier tabla) | `profiles.id` | Profiles tiene tenant_id |

---

## 3. Mapeo Actual de Foreign Keys

### 3.1 Tablas que referencian `auth.users.id`

| Schema | Tabla | Columna | ON DELETE |
|--------|-------|---------|-----------|
| auth_management | profiles | user_id | CASCADE |
| gamification_system | user_stats | user_id | CASCADE |
| gamification_system | user_ranks | user_id | CASCADE |

### 3.2 Tablas que referencian `profiles.id`

| Schema | Tabla | Columna | ON DELETE |
|--------|-------|---------|-----------|
| auth_management | user_sessions | user_id | CASCADE |
| gamification_system | comodines_inventory | user_id | CASCADE |
| progress_tracking | module_progress | user_id | CASCADE |
| progress_tracking | exercise_submissions | user_id | CASCADE |
| social_features | classroom_members | user_id | CASCADE |
| gamification_system | missions | user_id | CASCADE |

---

## 4. En el Trigger `initialize_user_stats`

```sql
-- NEW.user_id = auth.users.id (viene del profile que referencia a users)
-- NEW.id = profiles.id (el profile mismo)

-- Para user_stats (FK → auth.users.id):
INSERT INTO gamification_system.user_stats (user_id, ...)
VALUES (NEW.user_id, ...);  -- ✅ Usa NEW.user_id

-- Para comodines_inventory (FK → profiles.id):
INSERT INTO gamification_system.comodines_inventory (user_id, ...)
VALUES (NEW.id, ...);  -- ✅ Usa NEW.id

-- Para module_progress (FK → profiles.id):
INSERT INTO progress_tracking.module_progress (user_id, ...)
VALUES (NEW.id, ...);  -- ✅ Usa NEW.id
```

---

## 5. Justificación de la Diferencia

### ¿Por qué `user_stats` y `user_ranks` usan `auth.users.id`?

1. **Historial:** Fueron las primeras tablas de gamificación creadas
2. **Supabase Compatibility:** Siguen el patrón de Supabase donde auth.users es la tabla principal
3. **RLS:** Las políticas RLS de Supabase usan `auth.uid()` que retorna `auth.users.id`

### ¿Por qué otras tablas usan `profiles.id`?

1. **Multi-tenancy:** profiles tiene tenant_id, permite filtrar por tenant
2. **Extensibilidad:** profiles tiene más datos del usuario
3. **Consistencia:** En GAMILIT, profiles.id = users.id, así que son intercambiables

---

## 6. Reglas para Nuevas Tablas

Al crear una nueva tabla con referencia a usuario:

### Usar `auth.users.id` cuando:
- Es una tabla de autenticación pura (sessions, tokens, 2FA)
- Necesita máxima compatibilidad con Supabase RLS
- No requiere datos de tenant

### Usar `profiles.id` cuando:
- Es una tabla de datos de negocio
- Necesita filtrar por tenant
- Es parte del dominio de la aplicación (gamificación, progreso, social)

---

## 7. JOINs Correctos

```sql
-- JOIN desde user_stats (usa users.id):
SELECT us.*, p.first_name
FROM gamification_system.user_stats us
JOIN auth_management.profiles p ON us.user_id = p.user_id;

-- JOIN desde module_progress (usa profiles.id):
SELECT mp.*, p.first_name
FROM progress_tracking.module_progress mp
JOIN auth_management.profiles p ON mp.user_id = p.id;

-- JOIN universal (funciona para ambos porque profiles.id = profiles.user_id):
SELECT *
FROM auth_management.profiles p
LEFT JOIN gamification_system.user_stats us ON us.user_id = p.user_id
LEFT JOIN progress_tracking.module_progress mp ON mp.user_id = p.id;
```

---

## 8. Validación

Para verificar consistencia en la BD:

```sql
-- Verificar que profiles.id = profiles.user_id (deben ser iguales)
SELECT COUNT(*)
FROM auth_management.profiles
WHERE id != user_id;
-- Resultado esperado: 0

-- Verificar user_stats tiene match con users
SELECT COUNT(*)
FROM gamification_system.user_stats us
LEFT JOIN auth.users u ON us.user_id = u.id
WHERE u.id IS NULL;
-- Resultado esperado: 0

-- Verificar module_progress tiene match con profiles
SELECT COUNT(*)
FROM progress_tracking.module_progress mp
LEFT JOIN auth_management.profiles p ON mp.user_id = p.id
WHERE p.id IS NULL;
-- Resultado esperado: 0
```

---

## 9. Migración Futura (Opcional)

Si se decide unificar todo a `profiles.id`:

1. Agregar columna `profile_id` a user_stats y user_ranks
2. Popular con JOIN a profiles
3. Actualizar triggers para usar profile_id
4. Deprecar user_id en favor de profile_id
5. Renombrar en siguiente major version

**Estado:** NO PLANIFICADO - La situación actual funciona correctamente.

---

## 10. Changelog

| Fecha | Cambio |
|-------|--------|
| 2025-12-27 | Documento inicial creado (P0-004) |
| 2025-11-24 | Fix: module_progress ahora usa profiles.id correctamente |
| 2025-11-24 | Fix: comodines_inventory ahora usa profiles.id correctamente |

