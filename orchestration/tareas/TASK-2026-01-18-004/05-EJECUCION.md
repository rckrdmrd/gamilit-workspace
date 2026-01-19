# TASK-2026-01-18-004: Ejecucion
## Fase E - Ejecucion del Ciclo CAPVED

**Fecha:** 2026-01-18
**Estado:** Completada

---

## 1. Gate de Validacion

| Checkpoint | Estado | Verificacion |
|------------|--------|--------------|
| Problema identificado | ✅ | UUID no valido RFC 4122 |
| Seeds localizados | ✅ | 02-classrooms.sql |
| UUID v4 valido definido | ✅ | `a0000000-0000-4000-a000-000000000001` |
| Plan aprobado | ✅ | Cambiar UUID + sincronizar teachers |

---

## 2. Rama de Trabajo

- **Rama:** master (directo, P0-CRITICAL)
- **Contexto:** Fix critico en seeds

---

## 3. Subtareas Ejecutadas

| # | Subtarea | Estado | Tiempo |
|---|----------|--------|--------|
| 1 | Analizar UUID invalido | ✅ | 5 min |
| 2 | Definir UUID v4 valido | ✅ | 2 min |
| 3 | Modificar 02-classrooms.sql (dev) | ✅ | 5 min |
| 4 | Modificar 02-classrooms.sql (staging) | ✅ | 2 min |
| 5 | Modificar 02-classrooms.sql (prod) | ✅ | 2 min |
| 6 | Agregar sync teacher_classrooms | ✅ | 10 min |
| 7 | Corregir role constraint | ✅ | 2 min |
| 8 | Recrear base de datos | ✅ | 35 seg |
| 9 | Validar UUID en BD | ✅ | 1 min |

---

## 4. Acciones Realizadas

### 4.1 Cambio de UUID Classroom DEFAULT

```sql
-- ANTES (invalido RFC 4122):
'00000000-0000-0000-0000-000000000001'::uuid

-- DESPUES (valido RFC 4122 v4):
'a0000000-0000-4000-a000-000000000001'::uuid
-- Posicion 13 = '4' (version 4)
-- Posicion 17 = 'a' (variante RFC 4122)
```

### 4.2 Cambio de UUID teacher_classrooms Entry

```sql
-- ANTES (invalido):
'cc000001-0000-0000-0000-000000000001'::uuid

-- DESPUES (valido):
'cc000001-0000-4000-a000-000000000001'::uuid
```

### 4.3 Agregado Sync de Teachers

```sql
-- Nuevo INSERT para sincronizar TODOS los teachers al classroom DEFAULT
INSERT INTO social_features.teacher_classrooms (id, teacher_id, classroom_id, tenant_id, role, assigned_at, created_at)
SELECT
    gen_random_uuid(),
    p.user_id,
    c.id,
    c.tenant_id,
    'teacher',
    NOW(),
    NOW()
FROM social_features.classrooms c
CROSS JOIN auth_management.profiles p
JOIN auth.users u ON u.id = p.user_id
JOIN auth_management.user_roles ur ON ur.user_id = u.id
WHERE c.code = 'DEFAULT'
  AND ur.role::text IN ('admin_teacher', 'super_admin')
  AND p.user_id != c.teacher_id
  AND NOT EXISTS (...)
ON CONFLICT DO NOTHING;
```

### 4.4 Correccion de Role Constraint

```sql
-- ANTES (invalido):
'co_teacher'  -- No existe en constraint

-- DESPUES (valido):
'teacher'  -- Valido segun constraint: owner, teacher, assistant
```

---

## 5. Archivos Afectados

| Archivo | Cambio | Descripcion |
|---------|--------|-------------|
| `apps/database/seeds/dev/social_features/02-classrooms.sql` | Modificado | UUID + sync |
| `apps/database/seeds/staging/social_features/02-classrooms.sql` | Modificado | UUID |
| `apps/database/seeds/prod/social_features/02-classrooms.sql` | Modificado | UUID |

---

## 6. Validaciones por Checkpoint

### CP1: Recreacion BD
```bash
./database-master.sh --mode full --env dev
# Resultado: ✅ Exitoso (142 tablas, 228 funciones, 104 triggers)
```

### CP2: Verificar UUID Valido
```sql
SELECT id, code FROM social_features.classrooms WHERE code = 'DEFAULT';
-- Resultado: ✅ a0000000-0000-4000-a000-000000000001
```

### CP3: Verificar Teachers Sync
```sql
SELECT COUNT(*) FROM social_features.teacher_classrooms tc
JOIN social_features.classrooms c ON tc.classroom_id = c.id
WHERE c.code = 'DEFAULT';
-- Resultado: ✅ 2 teachers
```

### CP4: Validar ParseUUIDPipe
```javascript
// UUID v4 pattern: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
// a0000000-0000-4000-a000-000000000001
//               ^ pos 13 = 4 ✅
//                    ^ pos 17 = a (8,9,a,b valid) ✅
```

---

## 7. Problemas Encontrados

| Problema | Solucion |
|----------|----------|
| Role 'co_teacher' no existe | Cambiado a 'teacher' |
| ENUM role es lowercase | Casting con ::text IN (...) |

---

## 8. Commits Realizados

```bash
# Commits multiples durante desarrollo - consolidado en:
# [TASK-2026-01-18-004] fix: Corregir UUID invalido en classroom DEFAULT

# Cambios incluidos:
# - UUID classroom: a0000000-0000-4000-a000-000000000001
# - UUID teacher_classrooms: cc000001-0000-4000-a000-000000000001
# - Sync de teachers con roles admin_teacher/super_admin
# - Role corregido de 'co_teacher' a 'teacher'
```

---

## 9. Resumen de Ejecucion

| Metrica | Valor |
|---------|-------|
| Archivos modificados | 3 |
| UUIDs corregidos | 2 |
| Queries agregados | 1 (sync teachers) |
| Recreaciones BD | 1 |
| Errores encontrados | 2 (role constraint) |
| Tiempo total | ~25 min |
