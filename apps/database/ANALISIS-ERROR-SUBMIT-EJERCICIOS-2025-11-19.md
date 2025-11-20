# Análisis: Error 404 al Enviar Respuestas de Ejercicios

**Fecha:** 2025-11-19
**Usuario Afectado:** rckrdmrd@gmail.com
**Error:** `NotFoundError: No stats found for user 8f64c643-e7ad-4241-8cb9-884dff143282`

---

## 📋 Resumen Ejecutivo

### Problema Identificado

El backend está usando el **profile_id** para buscar estadísticas en `gamification_system.user_stats`, pero esta tabla usa **user_id** (que apunta a `auth.users.id`), no el profile_id.

**Consecuencia:**
- Usuarios registrados vía API: ❌ Error 404 al enviar respuestas
- Usuarios de seeds de test: ✅ Funciona correctamente

### Causa Raíz

**Inconsistencia entre seeds y registros reales:**

| Aspecto | Seeds (student@gamilit.com) | Usuarios Reales (rckrdmrd@gmail.com) |
|---------|----------------------------|-------------------------------------|
| auth.users.id | `cccccccc-...` | `aa4c7605-...` |
| profiles.id | `cccccccc-...` (MISMO) | `8f64c643-...` (DIFERENTE) |
| profiles.user_id | `cccccccc-...` | `aa4c7605-...` |
| ¿user_id = profile_id? | ✅ SÍ (por diseño de seeds) | ❌ NO (UUIDs independientes) |

---

## 🔍 Análisis Técnico Detallado

### 1. Datos del Usuario Afectado

```sql
-- Usuario: rckrdmrd@gmail.com
auth.users.id:     aa4c7605-b32d-41ac-a889-240f8021520f
profiles.id:       8f64c643-e7ad-4241-8cb9-884dff143282
profiles.user_id:  aa4c7605-b32d-41ac-a889-240f8021520f
```

**UUID del error:** `8f64c643-e7ad-4241-8cb9-884dff143282`
**Es:** `profiles.id` (NO `auth.users.id`)

### 2. Estructura del Modelo de Datos

#### Tabla: gamification_system.user_stats

```sql
CREATE TABLE gamification_system.user_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,  -- Apunta a auth.users.id
    tenant_id UUID,
    level INTEGER DEFAULT 1,
    total_xp INTEGER DEFAULT 0,
    ml_coins INTEGER DEFAULT 100,
    -- ...
);
```

**FK Esperada (no definida explícitamente):**
```
user_stats.user_id → auth.users.id
```

#### Función: gamilit.initialize_user_stats()

```sql
-- Línea 25: Crea user_stats con auth.users.id
INSERT INTO gamification_system.user_stats (
    user_id,
    tenant_id,
    ml_coins,
    ml_coins_earned_total
) VALUES (
    NEW.user_id,  -- profiles.user_id → auth.users.id ✅
    NEW.tenant_id,
    100,
    100
);
```

**El trigger está correcto:** Usa `NEW.user_id` (que es `auth.users.id`).

### 3. ¿Por qué Funciona con Usuarios de Test?

#### Seeds: auth_management/04-profiles-complete.sql

```sql
INSERT INTO auth_management.profiles (
    id,                                      -- profiles.id
    tenant_id,
    user_id,                                 -- profiles.user_id
    email,
    -- ...
) VALUES (
    'cccccccc-cccc-cccc-cccc-cccccccccccc',  -- id
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',  -- tenant_id
    'cccccccc-cccc-cccc-cccc-cccccccccccc',  -- user_id (MISMO UUID)
    'student@gamilit.com',
    -- ...
);
```

**Los seeds establecen intencionalmente:**
```
profiles.id = profiles.user_id = auth.users.id
```

**Por eso el backend funciona con usuarios de test:**
- Backend busca con `profiles.id`
- Como `profiles.id = auth.users.id` en seeds
- Encuentra los stats ✅

### 4. ¿Qué Hace el Backend?

#### Flujo de Búsqueda (INCORRECTO)

```typescript
// Backend obtiene el ID del usuario autenticado
const userId = getCurrentUserId(); // Retorna profiles.id

// Backend busca stats directamente con ese ID
const stats = await userStatsRepository.findOne({
  where: { user_id: userId }  // ❌ userId es profiles.id
});

// Error: No encuentra stats porque:
// user_stats.user_id = aa4c7605-... (auth.users.id)
// userId = 8f64c643-... (profiles.id)
// No coinciden → 404 Not Found
```

### 5. Verificación en Base de Datos

```sql
-- Verificar stats del usuario
SELECT user_id, ml_coins, current_rank
FROM gamification_system.user_stats
WHERE user_id = 'aa4c7605-b32d-41ac-a889-240f8021520f';  -- auth.users.id ✅

-- Resultado: ✅ Existe (creado por trigger)
user_id                              | ml_coins | current_rank
-------------------------------------|----------|-------------
aa4c7605-b32d-41ac-a889-240f8021520f | 100      | Ajaw

-- Pero backend busca con:
WHERE user_id = '8f64c643-e7ad-4241-8cb9-884dff143282';  -- profiles.id ❌

-- Resultado: ❌ No existe (404 Not Found)
```

---

## 💡 Soluciones Propuestas

### Solución 1: Corregir Backend (RECOMENDADA) ⭐

**Descripción:** Hacer que el backend use `profiles.user_id` en lugar de `profiles.id` para buscar stats.

#### Cambios Requeridos

**Ubicación (probablemente):**
- `apps/backend/src/modules/educational/services/exercise.service.ts`
- `apps/backend/src/modules/gamification/services/user-stats.service.ts`

**Código Actual (Incorrecto):**
```typescript
// El backend probablemente hace algo así:
async getUserStats(userId: string) {
  // userId es profiles.id (del JWT o sesión)
  return await this.userStatsRepository.findOne({
    where: { user_id: userId }  // ❌ Busca con profiles.id
  });
}
```

**Código Corregido:**
```typescript
async getUserStats(profileId: string) {
  // 1. Obtener el profile para acceder a user_id
  const profile = await this.profileRepository.findOne({
    where: { id: profileId }
  });

  if (!profile) {
    throw new NotFoundException('Profile not found');
  }

  // 2. Usar profile.user_id para buscar stats
  return await this.userStatsRepository.findOne({
    where: { user_id: profile.user_id }  // ✅ Usa auth.users.id
  });
}
```

**Alternativa con JOIN:**
```typescript
async getUserStats(profileId: string) {
  return await this.userStatsRepository
    .createQueryBuilder('stats')
    .innerJoin('auth_management.profiles', 'p', 'p.user_id = stats.user_id')
    .where('p.id = :profileId', { profileId })
    .getOne();
}
```

#### Ventajas
- ✅ Corrige el modelo de datos correctamente
- ✅ Mantiene separación clara entre auth.users y profiles
- ✅ No requiere cambios en base de datos
- ✅ Funciona para todos los usuarios (test y reales)

#### Desventajas
- ⚠️ Requiere identificar TODAS las queries que usan el patrón incorrecto
- ⚠️ Puede haber múltiples archivos afectados

---

### Solución 2: Cambiar Modelo de Datos (NO RECOMENDADA)

**Descripción:** Hacer que `user_stats.user_id` apunte a `profiles.id` en lugar de `auth.users.id`.

#### Cambios Requeridos

**1. Modificar trigger:**
```sql
-- Cambiar línea 25 de la función
INSERT INTO gamification_system.user_stats (
    user_id,
    -- ...
) VALUES (
    NEW.id,  -- Usar profiles.id en lugar de NEW.user_id
    -- ...
);
```

**2. Migrar datos existentes:**
```sql
UPDATE gamification_system.user_stats us
SET user_id = p.id
FROM auth_management.profiles p
WHERE us.user_id = p.user_id;
```

#### Ventajas
- ✅ Backend funciona sin cambios

#### Desventajas
- ❌ Rompe el modelo de datos conceptual
- ❌ `user_stats.user_id` ya no apunta a tabla `users`
- ❌ Inconsistente con `user_ranks` (que usa auth.users.id)
- ❌ Puede romper otras partes del sistema
- ❌ NO es la arquitectura correcta

---

### Solución 3: Hacer profiles.id = auth.users.id al Registrar (HACK)

**Descripción:** Modificar el registro para que `profiles.id` sea igual a `auth.users.id` (como en los seeds).

#### Cambios Requeridos

**Backend: AuthService.register()**
```typescript
// ANTES:
const profile = this.profileRepository.create({
  user_id: user.id,
  tenant_id: mainTenant.id,
  email: user.email,
  // id se genera automáticamente (diferente de user_id)
});

// DESPUÉS:
const profile = this.profileRepository.create({
  id: user.id,  // ✅ Forzar que profiles.id = auth.users.id
  user_id: user.id,
  tenant_id: mainTenant.id,
  email: user.email,
});
```

#### Ventajas
- ✅ Fix rápido
- ✅ Backend funciona sin cambios en queries
- ✅ Consistente con seeds

#### Desventajas
- ⚠️ Es un hack, no la solución correcta
- ⚠️ Mezcla conceptos (profiles.id debería ser independiente)
- ⚠️ Puede causar problemas futuros
- ⚠️ No es escalable

---

## 🎯 Recomendación Final

### Implementar Solución 1: Corregir Backend ⭐

**Justificación:**
1. **Arquitectura Correcta:** Mantiene separación de concerns
2. **Escalable:** No crea deuda técnica
3. **Consistente:** Todas las tablas siguen el modelo correcto
4. **Robusto:** Funciona con cualquier fuente de datos

### Plan de Implementación

#### Fase 1: Identificar Todas las Queries Problemáticas

**Buscar en el código:**
```bash
# Buscar queries que usan user_id incorrectamente
grep -r "user_id.*getCurrentUser\|getUserId\|req.user" apps/backend/
grep -r "userStatsRepository.findOne" apps/backend/
grep -r "user_id.*profileId\|profile.id" apps/backend/
```

**Archivos posiblemente afectados:**
- `apps/backend/src/modules/educational/services/exercise.service.ts`
- `apps/backend/src/modules/gamification/services/user-stats.service.ts`
- `apps/backend/src/modules/progress/services/progress.service.ts`
- Cualquier servicio que acceda a `user_stats`, `user_ranks`, etc.

#### Fase 2: Crear Helper Function

**Ubicación:** `apps/backend/src/common/helpers/user-id.helper.ts`

```typescript
/**
 * Obtiene el auth.users.id a partir del profile.id
 *
 * @param profileId - ID del perfil (obtenido del JWT/sesión)
 * @param profileRepository - Repository de profiles
 * @returns auth.users.id para usar en gamification_system
 */
export async function getUserIdFromProfile(
  profileId: string,
  profileRepository: Repository<Profile>
): Promise<string> {
  const profile = await profileRepository.findOne({
    where: { id: profileId },
    select: ['user_id']
  });

  if (!profile) {
    throw new NotFoundException('Profile not found');
  }

  return profile.user_id;
}
```

#### Fase 3: Actualizar Servicios

**Patrón de corrección:**
```typescript
// ANTES
async submitExercise(profileId: string, exerciseId: string, answer: any) {
  // Busca con profileId (incorrecto)
  const stats = await this.userStatsRepository.findOne({
    where: { user_id: profileId }  // ❌
  });
}

// DESPUÉS
async submitExercise(profileId: string, exerciseId: string, answer: any) {
  // Obtener user_id correcto
  const userId = await getUserIdFromProfile(profileId, this.profileRepository);

  // Busca con userId (correcto)
  const stats = await this.userStatsRepository.findOne({
    where: { user_id: userId }  // ✅
  });
}
```

#### Fase 4: Testing

**Casos de prueba:**
1. ✅ Usuario de seed (student@gamilit.com) - sigue funcionando
2. ✅ Usuario registrado (rckrdmrd@gmail.com) - ahora funciona
3. ✅ Nuevo usuario registrado - funciona desde el inicio

---

## 📊 Comparación de Soluciones

| Criterio | Solución 1 (Backend) | Solución 2 (Modelo) | Solución 3 (Hack) |
|----------|---------------------|---------------------|-------------------|
| Corrección arquitectural | ⭐⭐⭐⭐⭐ | ⭐ | ⭐⭐ |
| Facilidad implementación | ⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐⭐ |
| Mantenibilidad | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐ |
| Riesgo de bugs | ⭐⭐⭐⭐ | ⭐ | ⭐⭐⭐ |
| Escalabilidad | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐ |

---

## 🔧 Quick Fix Temporal (Mientras se Implementa Solución 1)

Si necesitas que el usuario `rckrdmrd@gmail.com` funcione YA mientras implementas la solución completa:

```sql
-- Copiar los stats del user_id al profile_id SOLO para este usuario
INSERT INTO gamification_system.user_stats (
    user_id,
    tenant_id,
    level,
    total_xp,
    ml_coins,
    ml_coins_earned_total,
    current_rank
)
SELECT
    '8f64c643-e7ad-4241-8cb9-884dff143282'::UUID,  -- profiles.id
    tenant_id,
    level,
    total_xp,
    ml_coins,
    ml_coins_earned_total,
    current_rank
FROM gamification_system.user_stats
WHERE user_id = 'aa4c7605-b32d-41ac-a889-240f8021520f'  -- auth.users.id
ON CONFLICT (user_id) DO UPDATE SET
    ml_coins = EXCLUDED.ml_coins,
    level = EXCLUDED.level;
```

**⚠️ ADVERTENCIA:** Esto es SOLO temporal. El usuario tendrá stats duplicados.

---

## 📝 Conclusión

**El problema NO es del trigger database.** El trigger está funcionando correctamente.

**El problema es del backend:** Está usando `profiles.id` para buscar en `user_stats`, cuando debería usar `profiles.user_id`.

**Acción requerida:** Actualizar el backend para corregir las queries.

---

**Última actualización:** 2025-11-19
**Estado:** Análisis Completo - Pendiente Implementación en Backend
