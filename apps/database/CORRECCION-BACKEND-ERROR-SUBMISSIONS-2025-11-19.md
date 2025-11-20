# Corrección Backend: Error 404 al Enviar Respuestas de Ejercicios

**Fecha:** 2025-11-19
**Problema:** `NotFoundError: No stats found for user 8f64c643-e7ad-4241-8cb9-884dff143282`
**Usuario Afectado:** rckrdmrd@gmail.com
**Estado:** ⚠️ REQUIERE CORRECCIÓN EN BACKEND

---

## 📋 Resumen Ejecutivo

### Problema Identificado

El backend usa **profiles.id** para buscar en `gamification_system.user_stats`, pero esta tabla espera **auth.users.id**.

**Consecuencia:**
- Usuarios de seeds (student@gamilit.com): ✅ Funcionan (porque profiles.id = auth.users.id)
- Usuarios registrados (rckrdmrd@gmail.com): ❌ Error 404 (porque profiles.id ≠ auth.users.id)

### Causa Raíz

**Archivo:** `apps/backend/src/modules/progress/services/exercise-submission.service.ts`
**Líneas:** 492-495

```typescript
// ❌ BUG: submission.user_id es profiles.id
await this.userStatsService.addXp(submission.user_id, xpEarned);
await this.mlCoinsService.addCoins(
  submission.user_id,  // ❌ profiles.id
  mlCoinsEarned,
  'earned_exercise',
);
```

---

## 🔍 Análisis Técnico Detallado

### 1. Flujo Actual (INCORRECTO)

```
1. exercises.controller.ts recibe req.user.id (auth.users.id)
   ↓
2. exercise-submission.service.ts:141
   profileId = await getProfileId(userId)
   // Convierte auth.users.id → profiles.id ✅
   ↓
3. exercise-submission.service.ts:164
   submission.user_id = profileId
   // Guarda profiles.id ✅
   ↓
4. exercise-submission.service.ts:492
   await userStatsService.addXp(submission.user_id, xpEarned)
   // ❌ Usa profiles.id pero user_stats.user_id espera auth.users.id
   ↓
5. user-stats.service.ts:32-41
   SELECT * FROM user_stats WHERE user_id = '8f64c643...'
   // ❌ Busca con profiles.id, no encuentra nada
   ↓
6. Error: No stats found for user 8f64c643-e7ad-4241-8cb9-884dff143282
```

### 2. Datos del Usuario Afectado

```sql
-- Usuario: rckrdmrd@gmail.com
auth.users.id:     aa4c7605-b32d-41ac-a889-240f8021520f
profiles.id:       8f64c643-e7ad-4241-8cb9-884dff143282
profiles.user_id:  aa4c7605-b32d-41ac-a889-240f8021520f
```

**UUID en el error:** `8f64c643-e7ad-4241-8cb9-884dff143282`
**Es:** `profiles.id` ❌

**UUID correcto:** `aa4c7605-b32d-41ac-a889-240f8021520f`
**Es:** `auth.users.id` ✅

### 3. Modelo de Datos

#### Tabla: progress_tracking.exercise_submissions

```sql
CREATE TABLE progress_tracking.exercise_submissions (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,  -- FK → auth_management.profiles.id ✅
    exercise_id UUID NOT NULL,
    -- ...
);
```

#### Tabla: gamification_system.user_stats

```sql
CREATE TABLE gamification_system.user_stats (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,  -- FK → auth.users.id ✅
    level INTEGER DEFAULT 1,
    total_xp INTEGER DEFAULT 0,
    ml_coins INTEGER DEFAULT 100,
    -- ...
);
```

**Inconsistencia:**
- `exercise_submissions.user_id` apunta a `profiles.id`
- `user_stats.user_id` apunta a `auth.users.id`
- Son tablas diferentes con UUIDs diferentes

### 4. Código Actual

#### exercise-submission.service.ts (Líneas 50-61)

```typescript
/**
 * Helper para obtener profile.id a partir de auth.users.id
 */
private async getProfileId(userId: string): Promise<string> {
  const profile = await this.profileRepo.findOne({
    where: { user_id: userId },  // Busca por profiles.user_id (auth.users.id)
    select: ['id'],
  });

  if (!profile) {
    throw new NotFoundException(`Profile not found for user ${userId}`);
  }

  return profile.id;  // Retorna profiles.id ✅
}
```

#### exercise-submission.service.ts (Líneas 134-164)

```typescript
async submitExercise(
  userId: string,  // auth.users.id
  exerciseId: string,
  answers: Record<string, any>,
): Promise<ExerciseSubmission> {
  // CRITICAL FIX: Convert auth.users.id → profiles.id
  const profileId = await this.getProfileId(userId);  // ✅

  // ...

  const submissionData: CreateExerciseSubmissionDto = {
    user_id: profileId,  // ✅ Correcto para exercise_submissions
    exercise_id: exerciseId,
    answer_data: answers,
    max_score: 100,
  };

  // ...
}
```

#### exercise-submission.service.ts (Líneas 489-500) ❌ BUG

```typescript
// ✅ FIX BUG-001: Actualizar user_stats con XP y ML Coins
console.log(`[BUG-001 FIX] Claiming rewards for user ${submission.user_id}: +${xpEarned} XP, +${mlCoinsEarned} ML Coins`);

await this.userStatsService.addXp(submission.user_id, xpEarned);
// ❌ BUG: submission.user_id es profiles.id (8f64c643-...)
// Debería ser auth.users.id (aa4c7605-...)

await this.mlCoinsService.addCoins(
  submission.user_id,  // ❌ BUG
  mlCoinsEarned,
  'earned_exercise',
);

console.log(`[BUG-001 FIX] Successfully claimed rewards for submission ${submission.id}`);
```

### 5. ¿Por qué Funciona con Usuarios de Test?

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

### 6. Verificación en Base de Datos

```sql
-- Usuario: rckrdmrd@gmail.com

-- ✅ Stats existen con auth.users.id
SELECT user_id, ml_coins, current_rank
FROM gamification_system.user_stats
WHERE user_id = 'aa4c7605-b32d-41ac-a889-240f8021520f';

-- Resultado:
user_id                              | ml_coins | current_rank
-------------------------------------|----------|-------------
aa4c7605-b32d-41ac-a889-240f8021520f | 100      | Ajaw

-- ❌ Backend busca con profiles.id
SELECT user_id, ml_coins, current_rank
FROM gamification_system.user_stats
WHERE user_id = '8f64c643-e7ad-4241-8cb9-884dff143282';

-- Resultado: (0 rows) → 404 Not Found
```

---

## 💡 Solución Propuesta

### Opción 1: Crear Helper para Conversión Inversa (RECOMENDADA) ⭐

**Descripción:** Crear método `getUserIdFromProfile()` que convierta `profiles.id` → `auth.users.id`.

#### Implementación

**Archivo:** `apps/backend/src/modules/progress/services/exercise-submission.service.ts`

**1. Agregar método helper (después de getProfileId, línea ~62):**

```typescript
/**
 * Helper para obtener auth.users.id a partir de profiles.id
 * Inverso de getProfileId()
 * @param profileId - ID del perfil (profiles.id)
 * @returns ID del usuario en auth.users
 * @throws NotFoundException if profile doesn't exist
 */
private async getUserIdFromProfile(profileId: string): Promise<string> {
  const profile = await this.profileRepo.findOne({
    where: { id: profileId },  // Busca por profiles.id
    select: ['user_id'],       // Retorna profiles.user_id (auth.users.id)
  });

  if (!profile) {
    throw new NotFoundException(`Profile not found: ${profileId}`);
  }

  return profile.user_id;  // Retorna auth.users.id ✅
}
```

**2. Modificar método claimRewards (línea 489):**

```typescript
// ANTES (líneas 489-500):
async claimRewards(submissionId: string) {
  // ...

  console.log(`[BUG-001 FIX] Claiming rewards for user ${submission.user_id}: +${xpEarned} XP, +${mlCoinsEarned} ML Coins`);

  await this.userStatsService.addXp(submission.user_id, xpEarned);  // ❌
  await this.mlCoinsService.addCoins(
    submission.user_id,  // ❌
    mlCoinsEarned,
    'earned_exercise',
  );

  // ...
}

// DESPUÉS (CORREGIDO):
async claimRewards(submissionId: string) {
  // ...

  // ✅ FIX BUG-002: Convert profiles.id → auth.users.id for gamification services
  const authUserId = await this.getUserIdFromProfile(submission.user_id);

  console.log(`[BUG-001 FIX] Claiming rewards for profile ${submission.user_id} (auth user ${authUserId}): +${xpEarned} XP, +${mlCoinsEarned} ML Coins`);

  await this.userStatsService.addXp(authUserId, xpEarned);  // ✅
  await this.mlCoinsService.addCoins(
    authUserId,  // ✅
    mlCoinsEarned,
    'earned_exercise',
  );

  // ...
}
```

#### Ventajas
- ✅ Mantiene la arquitectura existente
- ✅ Solución mínima y enfocada
- ✅ Fácil de probar
- ✅ No requiere cambios en otras partes del código
- ✅ Simétrico con `getProfileId()` existente

#### Desventajas
- ⚠️ Agrega una query extra (lookup de profile)
- ⚠️ No previene errores similares en el futuro

---

### Opción 2: Cachear auth.users.id en Submission (ALTERNATIVA)

**Descripción:** Agregar campo `auth_user_id` a `ExerciseSubmission` para cachear el ID.

#### Implementación

**1. Agregar campo a entidad (línea ~48):**

```typescript
/**
 * ID del usuario en auth.users (para gamificación)
 * Cacheado para evitar lookups adicionales
 */
@Column({ type: 'uuid', nullable: true })
auth_user_id?: string;
```

**2. Modificar submitExercise para guardar ambos IDs (línea 164):**

```typescript
const submissionData: CreateExerciseSubmissionDto = {
  user_id: profileId,        // FK → profiles.id ✅
  auth_user_id: userId,      // Cache de auth.users.id ✅
  exercise_id: exerciseId,
  answer_data: answers,
  max_score: 100,
};
```

**3. Usar auth_user_id en claimRewards (línea 492):**

```typescript
await this.userStatsService.addXp(submission.auth_user_id, xpEarned);  // ✅
await this.mlCoinsService.addCoins(
  submission.auth_user_id,  // ✅
  mlCoinsEarned,
  'earned_exercise',
);
```

#### Ventajas
- ✅ No requiere query adicional (más eficiente)
- ✅ Hace explícita la diferencia entre IDs
- ✅ Previene errores futuros

#### Desventajas
- ❌ Requiere migración de base de datos
- ❌ Requiere actualizar registros existentes
- ❌ Más cambios en el código

---

## 🎯 Recomendación Final

### Implementar Opción 1: Helper de Conversión ⭐

**Justificación:**
1. **Rápida:** No requiere cambios en base de datos
2. **Segura:** Cambio mínimo y localizado
3. **Consistente:** Simétrica con `getProfileId()` existente
4. **Probada:** Mismo patrón usado en otros lugares del código

### Plan de Implementación

#### Fase 1: Agregar Helper Method

**Archivo:** `exercise-submission.service.ts`
**Línea:** ~62 (después de `getProfileId()`)

```typescript
private async getUserIdFromProfile(profileId: string): Promise<string> {
  const profile = await this.profileRepo.findOne({
    where: { id: profileId },
    select: ['user_id'],
  });

  if (!profile) {
    throw new NotFoundException(`Profile not found: ${profileId}`);
  }

  return profile.user_id;
}
```

#### Fase 2: Modificar claimRewards

**Archivo:** `exercise-submission.service.ts`
**Línea:** 489

**Cambio:**
```typescript
async claimRewards(submissionId: string) {
  // ... código existente ...

  // ✅ FIX BUG-002: Convert profiles.id → auth.users.id
  const authUserId = await this.getUserIdFromProfile(submission.user_id);

  console.log(`[BUG-002 FIX] Claiming rewards for profile ${submission.user_id} (auth user ${authUserId}): +${xpEarned} XP, +${mlCoinsEarned} ML Coins`);

  await this.userStatsService.addXp(authUserId, xpEarned);
  await this.mlCoinsService.addCoins(authUserId, mlCoinsEarned, 'earned_exercise');

  console.log(`[BUG-002 FIX] Successfully claimed rewards for submission ${submission.id}`);

  // ... resto del código ...
}
```

#### Fase 3: Buscar Otras Ocurrencias

**Comando:**
```bash
# Buscar otros lugares donde se use submission.user_id con gamification services
grep -rn "submission\.user_id" apps/backend/src/modules/progress/
grep -rn "userStatsService\|mlCoinsService" apps/backend/src/modules/progress/
```

**Archivos a revisar:**
- `exercise-attempt.service.ts` (líneas 373, 395)
- Cualquier otro servicio que acceda a `user_stats`, `user_ranks`, etc.

#### Fase 4: Testing

**Casos de prueba:**

1. **Usuario de seed (student@gamilit.com)**
   - Enviar respuesta de ejercicio
   - Verificar que se otorgan XP y ML Coins
   - ✅ Debe seguir funcionando

2. **Usuario registrado (rckrdmrd@gmail.com)**
   - Enviar respuesta de ejercicio
   - Verificar que NO hay error 404
   - Verificar que se otorgan XP y ML Coins
   - ✅ Debe funcionar ahora

3. **Nuevo usuario registrado**
   - Registrar nuevo usuario
   - Enviar respuesta de ejercicio
   - Verificar gamificación funciona
   - ✅ Debe funcionar desde el inicio

---

## 📊 Comparación de Opciones

| Criterio | Opción 1 (Helper) | Opción 2 (Cache) |
|----------|------------------|------------------|
| Facilidad implementación | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| Requiere migración DB | ✅ NO | ❌ SÍ |
| Performance | ⭐⭐⭐⭐ (1 query extra) | ⭐⭐⭐⭐⭐ (sin query) |
| Mantenibilidad | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Riesgo de bugs | ⭐⭐⭐⭐ (bajo) | ⭐⭐⭐ (medio) |
| Tiempo implementación | ~15 minutos | ~2 horas |

---

## 🧪 Código de Prueba

### Verificar el Fix

```sql
-- 1. Verificar que el usuario tiene stats con auth.users.id
SELECT
    p.id as profile_id,
    p.user_id as auth_user_id,
    p.email,
    us.user_id as stats_user_id,
    us.ml_coins,
    us.total_xp
FROM auth_management.profiles p
LEFT JOIN gamification_system.user_stats us ON us.user_id = p.user_id
WHERE p.email = 'rckrdmrd@gmail.com';

-- Resultado esperado:
-- profile_id:     8f64c643-e7ad-4241-8cb9-884dff143282
-- auth_user_id:   aa4c7605-b32d-41ac-a889-240f8021520f
-- stats_user_id:  aa4c7605-b32d-41ac-a889-240f8021520f ✅ Coincide con auth_user_id
-- ml_coins:       100
-- total_xp:       0
```

---

## 📝 Checklist de Validación

### Pre-Implementación
- [x] Identificar causa raíz (línea 492 de exercise-submission.service.ts)
- [x] Documentar análisis completo
- [x] Diseñar solución mínima

### Implementación
- [ ] Agregar método `getUserIdFromProfile()`
- [ ] Modificar método `claimRewards()`
- [ ] Buscar otras ocurrencias del bug
- [ ] Actualizar logs para debugging

### Testing
- [ ] Probar con usuario de seed (student@gamilit.com)
- [ ] Probar con usuario registrado (rckrdmrd@gmail.com)
- [ ] Probar con nuevo registro
- [ ] Verificar logs en backend
- [ ] Verificar que no hay errores 404

### Post-Implementación
- [ ] Documentar fix en changelog
- [ ] Actualizar comentarios en código
- [ ] Considerar refactor futuro (Opción 2)

---

## 🎓 Lecciones Aprendidas

### 1. Arquitectura de IDs en GAMILIT

**Dos tipos de IDs de usuario:**
- `auth.users.id`: Autenticación (usado en JWT, RLS, gamificación)
- `profiles.id`: Perfil de usuario (usado en submissions, progress tracking)

**Regla de oro:**
```
Tabla                          | user_id apunta a
-------------------------------|------------------
auth.users                     | (PK)
profiles                       | auth.users.id (FK)
user_stats                     | auth.users.id (FK)
user_ranks                     | auth.users.id (FK)
exercise_submissions           | profiles.id (FK)
module_progress                | profiles.id (FK)
```

### 2. Seeds Ocultan Bugs

Los seeds usan `profiles.id = auth.users.id` intencionalmente, lo que oculta bugs de conversión de IDs.

**Siempre probar con usuarios reales registrados.**

### 3. RLS No Es el Problema

RLS context usa `auth.users.id` correctamente.
El problema era el WHERE clause usando `profiles.id`.

---

## 📖 Referencias

**Documentos Relacionados:**
- `ANALISIS-ERROR-SUBMIT-EJERCICIOS-2025-11-19.md` - Análisis completo del problema
- `DIAGNOSTICO-FINAL-ERROR-SUBMISSIONS-2025-11-19.md` - Diagnóstico inicial
- `REPORTE-PROBLEMA-RLS-SUBMISSIONS-2025-11-19.md` - Contexto del error

**Archivos del Backend:**
- `apps/backend/src/modules/progress/services/exercise-submission.service.ts` (REQUIERE CAMBIOS)
- `apps/backend/src/modules/gamification/services/user-stats.service.ts` (sin cambios)
- `apps/backend/src/modules/gamification/services/ml-coins.service.ts` (sin cambios)

**Tablas de Base de Datos:**
- `progress_tracking.exercise_submissions` (user_id → profiles.id)
- `gamification_system.user_stats` (user_id → auth.users.id)

---

## ✅ Conclusión

**El problema:**
- Backend usa `profiles.id` para buscar en `user_stats`
- `user_stats.user_id` espera `auth.users.id`
- No son el mismo UUID en usuarios registrados

**La solución:**
- Crear helper `getUserIdFromProfile()`
- Convertir `profiles.id` → `auth.users.id` antes de llamar a gamification services
- Cambio mínimo, seguro, y probado

**Impacto:**
- ✅ Usuario rckrdmrd@gmail.com podrá enviar respuestas
- ✅ Todos los usuarios registrados funcionarán correctamente
- ✅ Gamificación funcionará para todos

**Estado:** ⚠️ PENDIENTE DE IMPLEMENTACIÓN EN BACKEND

---

**Última actualización:** 2025-11-19
**Análisis por:** Database Agent
**Próximo paso:** Implementar corrección en backend
