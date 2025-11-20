# Solución Arquitectónica: Unificar profiles.id con auth.users.id

**Fecha:** 2025-11-19
**Problema:** Inconsistencia entre profiles.id y auth.users.id causa bugs en gamificación
**Solución:** Hacer que profiles.id = auth.users.id SIEMPRE (como seeds)
**Estado:** ✅ RECOMENDADA PARA IMPLEMENTACIÓN

---

## 📋 Resumen Ejecutivo

### Problema Actual

El sistema tiene **2 IDs de usuario diferentes**:
- `auth.users.id` - ID de autenticación
- `profiles.id` - ID de perfil (actualmente se genera con `gen_random_uuid()`)

Esto causa **inconsistencias** en las Foreign Keys:

| Schema | Tabla | user_id apunta a |
|--------|-------|------------------|
| gamification_system | user_stats | auth.users.id ❌ |
| gamification_system | user_ranks | auth.users.id ❌ |
| gamification_system | comodines_inventory | profiles.id ✅ |
| gamification_system | ml_coins_transactions | profiles.id ✅ |
| progress_tracking | exercise_submissions | profiles.id ✅ |
| progress_tracking | module_progress | profiles.id ✅ |

**Resultado:** Backend debe hacer conversiones de IDs constantemente → bugs

---

## 🔍 ¿Por Qué los Seeds Funcionan?

### Seeds: auth_management/04-profiles-complete.sql

```sql
INSERT INTO auth_management.profiles (
    id,      -- profiles.id
    user_id, -- profiles.user_id
    -- ...
) VALUES (
    'cccccccc-cccc-cccc-cccc-cccccccccccc',  -- id
    'cccccccc-cccc-cccc-cccc-cccccccccccc',  -- user_id (MISMO UUID)
    -- ...
);
```

**Los seeds establecen intencionalmente:**
```
profiles.id = profiles.user_id = auth.users.id
```

**Por eso funcionan sin errores:**
- Backend usa `profiles.id` → encuentra stats ✅
- Triggers usan `profiles.user_id` → crean stats correctamente ✅
- No hay conversiones necesarias ✅

### Usuarios Registrados (PROBLEMA)

```typescript
// Backend actual crea:
const user = await userRepository.save({
  id: gen_random_uuid(),  // auth.users.id = UUID-1
  email: 'usuario@email.com'
});

const profile = await profileRepository.save({
  id: gen_random_uuid(),  // profiles.id = UUID-2 ❌ DIFERENTE
  user_id: user.id,       // profiles.user_id = UUID-1 ✅
  email: user.email
});

// Resultado:
// auth.users.id = UUID-1
// profiles.id = UUID-2   ← PROBLEMA
// profiles.user_id = UUID-1
```

---

## 💡 Solución Propuesta: Opción A

### Hacer profiles.id = auth.users.id en el Registro

**Descripción:** Modificar el backend para que al crear un perfil, use el mismo UUID que auth.users.id.

### Implementación

#### Archivo: apps/backend/src/modules/auth/services/auth.service.ts

**Ubicación:** Método `register()` líneas ~85-100

**ANTES (línea ~92-99):**
```typescript
// 5. Crear perfil
const profile = this.profileRepository.create({
  user_id: user.id,        // ✅ Correcto
  tenant_id: mainTenant.id,
  email: user.email,
  first_name: dto.first_name || null,
  last_name: dto.last_name || null,
  role: GamilityRoleEnum.STUDENT,
  status: UserStatusEnum.ACTIVE,
  email_verified: false,
  // id: <no se especifica, se genera con gen_random_uuid()> ❌
});
await this.profileRepository.save(profile);
```

**DESPUÉS (CORREGIDO):**
```typescript
// 5. Crear perfil con profiles.id = auth.users.id
const profile = this.profileRepository.create({
  id: user.id,             // ✅ FIX: Forzar profiles.id = auth.users.id
  user_id: user.id,        // ✅ Ambos el mismo UUID
  tenant_id: mainTenant.id,
  email: user.email,
  first_name: dto.first_name || null,
  last_name: dto.last_name || null,
  role: GamilityRoleEnum.STUDENT,
  status: UserStatusEnum.ACTIVE,
  email_verified: false,
});
await this.profileRepository.save(profile);
```

**Cambio:** Agregar una línea
```typescript
id: user.id,  // ✅ Usar el mismo UUID que auth.users.id
```

---

## 📊 Beneficios de la Solución

### 1. Elimina Bugs de Conversión de IDs

**ANTES:**
```typescript
// Backend tiene que convertir constantemente
const profileId = await getProfileId(userId);        // Query extra
const authUserId = await getUserIdFromProfile(profileId);  // Query extra
await userStatsService.addXp(authUserId, xp);        // Confusión
```

**DESPUÉS:**
```typescript
// Backend usa el mismo ID para todo
await userStatsService.addXp(userId, xp);  // ✅ Simple y directo
```

### 2. Funciona con TODAS las Tablas

```
profiles.id = auth.users.id = UUID-ÚNICO

user_stats.user_id → auth.users.id  ✅ Encuentra
comodines_inventory.user_id → profiles.id  ✅ Encuentra
exercise_submissions.user_id → profiles.id  ✅ Encuentra
```

### 3. Consistente con Seeds

- Mismo comportamiento para usuarios de test y usuarios reales
- No más bugs que solo se manifiestan en producción
- Testing más confiable

### 4. Más Simple de Entender

```
1 Usuario = 1 ID único
```

**No más:**
```
1 Usuario = 2 IDs diferentes que hay que mapear
```

### 5. Mejor Performance

- ❌ ANTES: 2 queries (perfil → user_id, luego buscar stats)
- ✅ DESPUÉS: 1 query directa

---

## 🧪 Impacto en la Base de Datos

### Tablas Afectadas: NINGUNA ✅

Esta solución **NO requiere cambios en el schema de base de datos**.

Solo cambia **cómo se insertan los datos** en `auth_management.profiles`.

### Constraints que Siguen Funcionando

```sql
-- profiles.sql línea 52:
CONSTRAINT profiles_user_id_key UNIQUE (user_id)

-- Si profiles.id = profiles.user_id:
-- Ambos son únicos ✅
-- Constraint sigue siendo válida ✅
```

### Triggers que Siguen Funcionando

```sql
-- initialize_user_stats() línea 25:
INSERT INTO gamification_system.user_stats (
    user_id,
    -- ...
) VALUES (
    NEW.user_id,  -- ✅ Sigue usando profiles.user_id (que es = profiles.id ahora)
    -- ...
);

-- comodines_inventory línea 37:
INSERT INTO gamification_system.comodines_inventory (
    user_id
) VALUES (
    NEW.id  -- ✅ Sigue usando profiles.id (que es = auth.users.id ahora)
);
```

**Ambos triggers siguen funcionando correctamente** porque:
- `NEW.user_id` y `NEW.id` ahora son el mismo UUID
- Las FKs están satisfechas
- No hay cambios en la lógica del trigger

---

## 🔧 Plan de Implementación

### Fase 1: Modificar Backend (5 minutos)

**Archivo:** `apps/backend/src/modules/auth/services/auth.service.ts`
**Línea:** ~92

**Cambio:**
```typescript
const profile = this.profileRepository.create({
  id: user.id,  // ← AGREGAR ESTA LÍNEA
  user_id: user.id,
  tenant_id: mainTenant.id,
  // ... resto sin cambios
});
```

### Fase 2: Migrar Usuarios Existentes (OPCIONAL)

Si quieres corregir usuarios ya registrados:

```sql
-- Script de migración (EJECUTAR UNA SOLA VEZ)
DO $$
DECLARE
    profile_record RECORD;
BEGIN
    -- Para cada perfil con profiles.id ≠ profiles.user_id
    FOR profile_record IN
        SELECT id, user_id, email
        FROM auth_management.profiles
        WHERE id != user_id
    LOOP
        RAISE NOTICE 'Migrando usuario: %', profile_record.email;

        -- 1. Actualizar todas las FKs que apuntan a profiles.id
        UPDATE gamification_system.comodines_inventory
        SET user_id = profile_record.user_id
        WHERE user_id = profile_record.id;

        UPDATE progress_tracking.exercise_submissions
        SET user_id = profile_record.user_id
        WHERE user_id = profile_record.id;

        UPDATE progress_tracking.module_progress
        SET user_id = profile_record.user_id
        WHERE user_id = profile_record.id;

        -- ... (repetir para otras tablas con FK a profiles.id)

        -- 2. Cambiar profiles.id por profiles.user_id
        UPDATE auth_management.profiles
        SET id = user_id
        WHERE id = profile_record.id;

        RAISE NOTICE 'Usuario migrado: %', profile_record.email;
    END LOOP;
END $$;
```

**⚠️ ADVERTENCIA:**
- Este script es **destructivo**
- Hacer **backup** antes de ejecutar
- Probar primero en ambiente de desarrollo
- **NO es necesario** si solo quieres que usuarios nuevos funcionen

### Fase 3: Testing (10 minutos)

**Casos de prueba:**

1. **Registrar nuevo usuario**
   ```bash
   POST /api/auth/register
   {
     "email": "test@nuevo.com",
     "password": "password123",
     "first_name": "Test",
     "last_name": "User"
   }
   ```

2. **Verificar IDs**
   ```sql
   SELECT
       u.id as auth_user_id,
       p.id as profile_id,
       p.user_id as profile_user_id,
       p.email
   FROM auth.users u
   JOIN auth_management.profiles p ON p.user_id = u.id
   WHERE p.email = 'test@nuevo.com';

   -- Resultado esperado:
   -- auth_user_id = profile_id = profile_user_id ✅
   ```

3. **Enviar respuesta de ejercicio**
   ```bash
   POST /api/educational/exercises/{exercise_id}/submit
   {
     "answers": { ... }
   }

   -- Debe funcionar sin errores 404 ✅
   ```

4. **Verificar gamificación**
   ```sql
   SELECT ml_coins, total_xp, current_rank
   FROM gamification_system.user_stats
   WHERE user_id = (SELECT id FROM auth.users WHERE email = 'test@nuevo.com');

   -- Debe retornar datos ✅
   ```

---

## 🎓 Comparación de Opciones

| Criterio | Opción A<br>(profiles.id = auth.users.id) | Opción B<br>(Migrar FKs) | Opción C<br>(Conversiones) |
|----------|-------------------------------------------|--------------------------|----------------------------|
| Complejidad | ⭐⭐⭐⭐⭐ (muy simple) | ⭐⭐ (complejo) | ⭐⭐⭐ (medio) |
| Cambios en DB | ✅ NINGUNO | ❌ Muchos (2 FKs, trigger) | ✅ Ninguno |
| Cambios en Backend | ⭐⭐⭐⭐⭐ (1 línea) | ⭐⭐⭐ (varios archivos) | ⭐⭐⭐ (varios archivos) |
| Performance | ⭐⭐⭐⭐⭐ (0 conversiones) | ⭐⭐⭐⭐⭐ (0 conversiones) | ⭐⭐⭐ (queries extras) |
| Mantenibilidad | ⭐⭐⭐⭐⭐ (muy simple) | ⭐⭐⭐⭐ (consistente) | ⭐⭐ (confuso) |
| Riesgo | ⭐⭐⭐⭐⭐ (muy bajo) | ⭐⭐ (alto) | ⭐⭐⭐ (medio) |
| Consistencia con seeds | ⭐⭐⭐⭐⭐ (100%) | ⭐⭐⭐ (diferente) | ⭐⭐⭐ (diferente) |
| Tiempo implementación | ~5 minutos | ~4 horas | ~1 hora |

---

## ❓ Preguntas Frecuentes

### ¿Por qué profiles tiene su propio ID si no se usa?

**Respuesta:** Probablemente fue un error de diseño inicial. La intención era separar "autenticación" (`auth.users`) de "perfil de usuario" (`profiles`), pero en la práctica no hay necesidad de IDs separados.

### ¿Hay algún caso donde profiles.id ≠ auth.users.id sea útil?

**Respuesta:** Solo si:
- Un usuario puede tener múltiples perfiles (NO es el caso de GAMILIT)
- Necesitas borrar auth.users pero mantener profiles (NO tiene sentido)

Para GAMILIT: **1 usuario = 1 perfil = 1 ID único**

### ¿Esto rompe algo?

**Respuesta:** No. De hecho:
- ✅ Los constraints siguen válidos
- ✅ Los triggers siguen funcionando
- ✅ Las FKs siguen satisfechas
- ✅ Exactamente como funcionan los seeds

### ¿Qué pasa con usuarios ya registrados?

**Respuesta:** Tienes 2 opciones:
1. **Dejarlos como están** - Funcionarán con la corrección del backend (Opción C del documento anterior)
2. **Migrarlos** - Ejecutar script de migración (Fase 2)

Para usuarios nuevos: funcionarán perfectamente desde el inicio.

---

## 📝 Checklist de Implementación

### Pre-Implementación
- [x] Analizar arquitectura actual
- [x] Identificar inconsistencias
- [x] Documentar solución
- [x] Comparar opciones

### Implementación
- [ ] Modificar `auth.service.ts` línea ~92
- [ ] Agregar `id: user.id` al crear perfil
- [ ] (Opcional) Ejecutar script de migración

### Testing
- [ ] Registrar usuario de prueba
- [ ] Verificar `profiles.id = auth.users.id` en DB
- [ ] Enviar respuesta de ejercicio
- [ ] Verificar gamificación funciona (XP, ML Coins)
- [ ] Verificar no hay errores 404
- [ ] Probar con usuario de seed (student@gamilit.com)

### Post-Implementación
- [ ] Documentar cambio en changelog
- [ ] Actualizar comentarios en código
- [ ] (Opcional) Remover conversiones innecesarias en backend
- [ ] (Opcional) Simplificar métodos que hacían conversiones

---

## ✅ Conclusión

**Problema raíz:**
- profiles.id se genera con gen_random_uuid() → diferente de auth.users.id
- Causa bugs de conversión de IDs en backend

**Solución:**
- Modificar registro para que `profiles.id = auth.users.id`
- **1 línea de código en backend**
- **0 cambios en base de datos**
- Consistente con cómo funcionan los seeds

**Impacto:**
- ✅ Elimina bugs de conversión
- ✅ Más simple de entender
- ✅ Mejor performance
- ✅ Usuarios nuevos funcionan perfectamente

**Estado:** ✅ LISTO PARA IMPLEMENTACIÓN

---

**Última actualización:** 2025-11-19
**Recomendación:** IMPLEMENTAR OPCIÓN A
**Prioridad:** ALTA
