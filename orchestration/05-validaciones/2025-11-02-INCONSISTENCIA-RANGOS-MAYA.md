# ⚠️ INCONSISTENCIA CRÍTICA DETECTADA: Rangos Maya

**Fecha:** 2025-11-02
**Detectado por:** NEXUS-BACKEND v1.0
**Severidad:** 🔴 CRÍTICO
**Impacto:** Bloquea implementación correcta del sistema de rangos

---

## 🔍 PROBLEMA IDENTIFICADO

Existe una **inconsistencia entre el ENUM de BD y los SEEDS de achievements** respecto a los rangos maya.

---

## 📊 ANÁLISIS COMPARATIVO

### 1. ✅ ENUM en DDL (CORRECTO - V1.0)

**Archivo:** `/apps/database/ddl/schemas/gamification_system/enums/maya_rank.sql`

**Versión:** 1.0 (2025-11-03)

```sql
CREATE TYPE maya_rank AS ENUM (
    'Ajaw',           -- Nivel 1: Señor (0-999 XP)
    'Nacom',          -- Nivel 2: Capitán de guerra (1,000-2,999 XP)
    'Ah K''in',       -- Nivel 3: Sacerdote del sol (3,000-5,999 XP)
    'Halach Uinic',   -- Nivel 4: Hombre verdadero (6,000-9,999 XP)
    'K''uk''ulkan'    -- Nivel 5: Serpiente emplumada (10,000+ XP)
);
```

**Estado:** ✅ CORRECTO - Basado en jerarquía maya histórica real

---

### 2. ❌ SEEDS de Achievements (INCORRECTO - LEGACY)

**Archivo:** `/apps/database/seeds/dev/gamification_system/02-achievements.sql`

**Líneas 80-83:** Logros de ascenso de rango

```sql
-- INCORRECTO: Usan rangos LEGACY que NO existen en el ENUM
('6b088b5a-6278-41d6-97a3-17fed0949896', NULL, 'Ascenso Maya: BATAB',
 'Alcanza el rango BATAB', '🏛️', 'mastery', 'rare', 'beginner',
 '{"type": "rank_achieved", "requirements": {"rank": "batab"}}', ...),

('5259f524-5327-47ad-948c-e037b9e895b2', NULL, 'Líder HOLCATTE',
 'Alcanza el rango HOLCATTE', '🛡️', 'mastery', 'epic', 'beginner',
 '{"type": "rank_achieved", "requirements": {"rank": "holcatte"}}', ...),

('2365f7e3-001d-427f-a55a-cc552fdd89bb', NULL, 'Guerrero Maya',
 'Alcanza el rango GUERRERO', '⚔️', 'mastery', 'epic', 'beginner',
 '{"type": "rank_achieved", "requirements": {"rank": "guerrero"}}', ...),

('641e9e4f-277f-429f-ad6d-6c851e1f09e2', NULL, 'Mercenario Legendario',
 'Alcanza el rango máximo MERCENARIO', '👑', 'mastery', 'legendary', 'beginner',
 '{"type": "rank_achieved", "requirements": {"rank": "mercenario"}}', ...),

('080a514d-654c-458f-8b48-69d01daa9cc2', NULL, 'Ascenso Rápido',
 'Alcanza BATAB en menos de 2 semanas', '⚡', 'special', 'rare', 'beginner',
 '{"type": "quick_rank", "requirements": {"days": 14, "rank": "batab"}}', ...),
```

**Problema:** Estos rangos **NO EXISTEN** en el enum `maya_rank`:
- ❌ `batab`
- ❌ `holcatte`
- ❌ `guerrero`
- ❌ `mercenario`

---

### 3. ✅ SEED de Inicialización (CORRECTO)

**Archivo:** `/apps/database/seeds/dev/gamification_system/04-initialize_user_gamification.sql`

**Línea 98:**
```sql
INSERT INTO gamification_system.user_ranks (
    ...
    current_rank,
    ...
)
SELECT
    ...
    'Ajaw',  -- Rango inicial Maya (nivel 1) ✅ CORRECTO
    ...
```

**Estado:** ✅ CORRECTO - Usa 'Ajaw' del enum correcto

---

### 4. ❌ Entity UserRank (INCORRECTO)

**Archivo:** `/apps/backend/src/modules/gamification/entities/user-rank.entity.ts`

**Línea 61:**
```typescript
@Column({ type: 'text', default: 'mercenario' })  // ❌ INCORRECTO
current_rank: string;
```

**Problema:** Default 'mercenario' NO existe en enum de BD

**Debería ser:**
```typescript
@Column({ type: 'text', default: 'Ajaw' })  // ✅ CORRECTO
current_rank: string;
```

---

### 5. ⚠️ Enums TypeScript (AMBOS PRESENTES)

**Archivo:** `/apps/backend/src/shared/constants/enums.constants.ts`

**Líneas 141-147: ✅ Enum CORRECTO (V1.0)**
```typescript
export enum MayaRank {
  AJAW = 'Ajaw',                    // ✅ Coincide con BD
  NACOM = 'Nacom',                  // ✅ Coincide con BD
  AH_KIN = 'Ah K\'in',              // ✅ Coincide con BD
  HALACH_UINIC = 'Halach Uinic',    // ✅ Coincide con BD
  KUKUKULKAN = 'K\'uk\'ulkan',      // ✅ Coincide con BD
}
```

**Líneas 153-159: ❌ Enum LEGACY (DEPRECATED)**
```typescript
/**
 * @deprecated Use MayaRank instead. Legacy enum kept for backwards compatibility.
 * Will be removed in v2.0
 */
export enum MayaRankEnum {
  NACOM = 'nacom',          // ❌ NO existe en BD
  BATAB = 'batab',          // ❌ NO existe en BD
  HOLCATTE = 'holcatte',    // ❌ NO existe en BD
  GUERRERO = 'guerrero',    // ❌ NO existe en BD
  MERCENARIO = 'mercenario',// ❌ NO existe en BD
}
```

**Nota:** El enum legacy está marcado como deprecated pero aún existe en el código.

---

## 🚨 IMPACTO

### Errores que causará si no se corrige:

1. **FALLO en seeds de achievements:**
   - Los 5 achievements de rangos intentarán insertar valores que no existen en el enum
   - PostgreSQL rechazará los inserts con error: `invalid input value for enum maya_rank`

2. **FALLO al crear user_ranks desde backend:**
   - Entity usa default 'mercenario' que no existe en el enum
   - PostgreSQL rechazará el insert

3. **INCONSISTENCIA en lógica de negocio:**
   - Si se usa `MayaRankEnum` (legacy) en lugar de `MayaRank`, la lógica fallará
   - Comparaciones de rangos no funcionarán

4. **ACHIEVEMENTS NO OTORGABLES:**
   - Los 5 achievements de progresión de rangos nunca se podrán otorgar
   - Sistema de gamificación incompleto

---

## ✅ SOLUCIÓN PROPUESTA

### Corrección 1: Actualizar Seeds de Achievements

**Archivo:** `/apps/database/seeds/dev/gamification_system/02-achievements.sql`

**Reemplazar líneas 80-83 con:**

```sql
-- =====================================================
-- LOGROS DE MAESTRÍA (5 registros) - RANGOS MAYA V1.0
-- =====================================================

INSERT INTO gamification_system.achievements (
    id,
    tenant_id,
    name,
    description,
    icon,
    category,
    rarity,
    difficulty_level,
    conditions,
    rewards,
    is_secret,
    is_active,
    is_repeatable,
    order_index,
    points_value,
    ml_coins_reward,
    created_at,
    updated_at
) VALUES
-- Rangos Maya (V1.0) - CORREGIDO
('6b088b5a-6278-41d6-97a3-17fed0949896', NULL, 'Ascenso Maya: Nacom',
 'Alcanza el rango Nacom (Capitán de Guerra)', '🏛️', 'mastery', 'rare', 'beginner',
 '{"type": "rank_achieved", "requirements": {"rank": "Nacom"}}',
 '{"xp": 50, "ml_coins": 100}', false, true, false, 80, 0, 100, NOW(), NOW()),

('5259f524-5327-47ad-948c-e037b9e895b2', NULL, 'Sacerdote Ah K''in',
 'Alcanza el rango Ah K''in (Sacerdote del Sol)', '🛡️', 'mastery', 'epic', 'intermediate',
 '{"type": "rank_achieved", "requirements": {"rank": "Ah K''in"}}',
 '{"xp": 100, "ml_coins": 200}', false, true, false, 81, 0, 200, NOW(), NOW()),

('2365f7e3-001d-427f-a55a-cc552fdd89bb', NULL, 'Halach Uinic',
 'Alcanza el rango Halach Uinic (Hombre Verdadero)', '⚔️', 'mastery', 'epic', 'advanced',
 '{"type": "rank_achieved", "requirements": {"rank": "Halach Uinic"}}',
 '{"xp": 250, "ml_coins": 500}', false, true, false, 82, 0, 500, NOW(), NOW()),

('641e9e4f-277f-429f-ad6d-6c851e1f09e2', NULL, 'K''uk''ulkan Legendario',
 'Alcanza el rango legendario K''uk''ulkan (Serpiente Emplumada)', '👑', 'mastery', 'legendary', 'advanced',
 '{"type": "rank_achieved", "requirements": {"rank": "K''uk''ulkan"}}',
 '{"xp": 500, "ml_coins": 1000}', false, true, false, 83, 0, 1000, NOW(), NOW()),

('080a514d-654c-458f-8b48-69d01daa9cc2', NULL, 'Ascenso Rápido',
 'Alcanza Nacom en menos de 2 semanas', '⚡', 'special', 'rare', 'beginner',
 '{"type": "quick_rank", "requirements": {"days": 14, "rank": "Nacom"}}',
 '{"xp": 75, "ml_coins": 150}', false, true, false, 110, 0, 150, NOW(), NOW())

ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    rarity = EXCLUDED.rarity,
    difficulty_level = EXCLUDED.difficulty_level,
    conditions = EXCLUDED.conditions,
    rewards = EXCLUDED.rewards,
    is_secret = EXCLUDED.is_secret,
    is_active = EXCLUDED.is_active,
    is_repeatable = EXCLUDED.is_repeatable,
    order_index = EXCLUDED.order_index,
    points_value = EXCLUDED.points_value,
    ml_coins_reward = EXCLUDED.ml_coins_reward,
    updated_at = NOW();
```

**Cambios:**
- ✅ 'batab' → 'Nacom'
- ✅ 'holcatte' → 'Ah K'in'
- ✅ 'guerrero' → 'Halach Uinic'
- ✅ 'mercenario' → 'K'uk'ulkan'
- ✅ Nombres y descripciones actualizados
- ✅ Dificultad ajustada según progresión

---

### Corrección 2: Actualizar Entity UserRank

**Archivo:** `/apps/backend/src/modules/gamification/entities/user-rank.entity.ts`

**Cambios necesarios:**

**1. Línea 10: Cambiar import**
```typescript
// ANTES
import { MayaRankEnum } from '@shared/constants/enums.constants';

// DESPUÉS
import { MayaRank } from '@shared/constants/enums.constants';
```

**2. Línea 61-62: Cambiar default y tipo**
```typescript
// ANTES
@Column({ type: 'text', default: 'mercenario' })
current_rank: string;

// DESPUÉS
@Column({
  type: 'text',
  default: MayaRank.AJAW,
  enum: MayaRank
})
current_rank: MayaRank;
```

**3. Línea 67-68: Cambiar tipo de previous_rank**
```typescript
// ANTES
@Column({ type: 'text', nullable: true })
previous_rank?: string;

// DESPUÉS
@Column({
  type: 'text',
  nullable: true,
  enum: MayaRank
})
previous_rank?: MayaRank;
```

---

### Corrección 3: Configuración de RanksService

**Archivo a crear:** `/apps/backend/src/modules/gamification/services/ranks.service.ts`

**Usar configuración correcta:**

```typescript
import { MayaRank } from '@shared/constants/enums.constants';

// Configuración de rangos (XP requerida según DDL)
const RANK_CONFIG: Record<MayaRank, {
  xp_min: number;
  xp_max: number;
  ml_coins_bonus: number;
  next_rank: MayaRank | null;
  level: number;
}> = {
  [MayaRank.AJAW]: {
    xp_min: 0,
    xp_max: 999,
    ml_coins_bonus: 0,
    next_rank: MayaRank.NACOM,
    level: 1,
  },
  [MayaRank.NACOM]: {
    xp_min: 1000,
    xp_max: 2999,
    ml_coins_bonus: 500,
    next_rank: MayaRank.AH_KIN,
    level: 2,
  },
  [MayaRank.AH_KIN]: {
    xp_min: 3000,
    xp_max: 5999,
    ml_coins_bonus: 1000,
    next_rank: MayaRank.HALACH_UINIC,
    level: 3,
  },
  [MayaRank.HALACH_UINIC]: {
    xp_min: 6000,
    xp_max: 9999,
    ml_coins_bonus: 2000,
    next_rank: MayaRank.KUKUKULKAN,
    level: 4,
  },
  [MayaRank.KUKUKULKAN]: {
    xp_min: 10000,
    xp_max: Infinity,
    ml_coins_bonus: 5000,
    next_rank: null, // Máximo rango
    level: 5,
  },
};
```

---

## 📋 CHECKLIST DE CORRECCIÓN

### Urgente (Bloquea desarrollo)

- [ ] **Corregir seeds de achievements** (`02-achievements.sql`)
  - [ ] Cambiar 'batab' → 'Nacom'
  - [ ] Cambiar 'holcatte' → 'Ah K'in'
  - [ ] Cambiar 'guerrero' → 'Halach Uinic'
  - [ ] Cambiar 'mercenario' → 'K'uk'ulkan'
  - [ ] Actualizar nombres y descripciones

- [ ] **Corregir Entity UserRank** (`user-rank.entity.ts`)
  - [ ] Cambiar import: `MayaRankEnum` → `MayaRank`
  - [ ] Cambiar default: `'mercenario'` → `MayaRank.AJAW`
  - [ ] Cambiar tipo: `string` → `MayaRank`
  - [ ] Agregar enum constraint en columna

### Medio plazo (Limpieza)

- [ ] **Remover enum legacy** de `enums.constants.ts`
  - [ ] Verificar que NO se use en ningún lugar
  - [ ] Eliminar `MayaRankEnum` completamente
  - [ ] Actualizar imports en todo el código

- [ ] **Actualizar DTOs** si usan el enum legacy
  - [ ] `create-user-rank.dto.ts`
  - [ ] `user-rank-response.dto.ts`
  - [ ] Cualquier otro DTO que referencie rangos

- [ ] **Validar seeds** en otros ambientes
  - [ ] Verificar `/seeds/staging/`
  - [ ] Verificar `/seeds/production/`

---

## 🔄 ORDEN DE EJECUCIÓN RECOMENDADO

**1. INMEDIATO (Antes de cualquier desarrollo):**
```bash
# 1. Corregir seeds de achievements
nano /apps/database/seeds/dev/gamification_system/02-achievements.sql
# (Aplicar correcciones de la sección "Corrección 1")

# 2. Corregir Entity UserRank
nano /apps/backend/src/modules/gamification/entities/user-rank.entity.ts
# (Aplicar correcciones de la sección "Corrección 2")

# 3. Re-ejecutar seeds (si ya se ejecutaron antes)
psql -U gamilit_user -d gamilit -f /apps/database/seeds/dev/gamification_system/02-achievements.sql
```

**2. AL IMPLEMENTAR RanksService:**
```typescript
// Usar RANK_CONFIG de la sección "Corrección 3"
// Importar MayaRank (NO MayaRankEnum)
```

**3. DESPUÉS DE IMPLEMENTACIÓN:**
```bash
# Eliminar enum legacy si ya no se usa
grep -r "MayaRankEnum" apps/backend/src/
# Si no hay resultados, remover de enums.constants.ts
```

---

## 📊 TABLA COMPARATIVA FINAL

| Aspecto | Estado Actual | Estado Deseado | Acción |
|---------|---------------|----------------|--------|
| **Enum DDL** | ✅ Correcto (V1.0) | ✅ Mantener | Ninguna |
| **Seeds achievements** | ❌ Legacy (V0.x) | ✅ Actualizar a V1.0 | **URGENTE** |
| **Seed inicialización** | ✅ Correcto (Ajaw) | ✅ Mantener | Ninguna |
| **Entity UserRank** | ❌ Default legacy | ✅ Default 'Ajaw' | **URGENTE** |
| **Enum TypeScript MayaRank** | ✅ Correcto | ✅ Usar este | Implementar |
| **Enum TypeScript MayaRankEnum** | ⚠️ Deprecated | ❌ Remover | Limpieza |

---

## ✅ CRITERIOS DE VALIDACIÓN

**Después de aplicar correcciones, verificar:**

1. **Seeds ejecutan sin errores:**
   ```bash
   psql -U gamilit_user -d gamilit -f /apps/database/seeds/dev/gamification_system/02-achievements.sql
   # Debe ejecutar sin errores de enum
   ```

2. **Entity puede crear registros:**
   ```typescript
   const userRank = new UserRank();
   // current_rank debe ser 'Ajaw' por default
   ```

3. **Achievements de rangos existen:**
   ```sql
   SELECT name, conditions->>'requirements'
   FROM gamification_system.achievements
   WHERE category = 'mastery';
   -- Debe mostrar: Nacom, Ah K'in, Halach Uinic, K'uk'ulkan
   ```

4. **No hay referencias a enum legacy:**
   ```bash
   grep -r "MayaRankEnum" apps/backend/src/
   # Debe retornar 0 resultados (excepto en enums.constants.ts con @deprecated)
   ```

---

**Generado por:** NEXUS-BACKEND v1.0
**Fecha:** 2025-11-02
**Prioridad:** 🔴 CRÍTICO - Bloqueante
**Requiere corrección antes de:** CICLO-3 (Implementación Sistema de Rangos)
