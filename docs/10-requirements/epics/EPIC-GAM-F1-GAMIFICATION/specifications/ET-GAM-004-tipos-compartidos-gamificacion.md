---
titulo: "ET-GAM-004: Tipos Compartidos de Gamificación"
tipo: especificacion-tecnica
fecha_creacion: "2025-10-01"
ultima_actualizacion: "2026-02-28"
estado: activo
---

# ET-GAM-004: Tipos Compartidos de Gamificación

## 📋 Metadata

| Campo | Valor |
|-------|-------|
| **ID** | ET-GAM-004 |
| **Módulo** | 02 - Gamificación |
| **Título** | Tipos Compartidos de Gamificación (ENUMs y Tipos) |
| **Tipo** | Especificación Técnica |
| **Estado** | ✅ Implementado |
| **Versión** | 2.0 |
| **Fecha Creación** | 2025-11-08 |
| **Última Actualización** | 2025-11-08 |
| **Autor** | Database Team |
| **Reviewers** | Backend Team, Frontend Team |

---

## 🔗 Referencias

### Documentos Relacionados

📘 **Requerimientos:**
- [RF-GAM-004: Economía de ML Coins](../requirements/RF-GAM-004-economia-ml-coins.md)
- [RF-GAM-003: Rangos Maya](../requirements/RF-GAM-003-rangos-maya.md)
- [RF-GAM-002: Sistema de Comodines](../requirements/RF-GAM-002-comodines.md)
- [RF-GAM-001: Sistema de Achievements](../requirements/RF-GAM-001-achievements.md)

### Implementación

🗄️ **Base de Datos:**
- `apps/database/ddl/schemas/gamification_system/enums/`
  - `transaction_type.sql`
  - `maya_rank.sql` (Ver ET-GAM-003)
  - `comodin_type.sql` (Ver ET-GAM-002)
  - `achievement_category.sql`
  - `achievement_rarity.sql`

⚙️ **Backend:**
- `apps/backend/src/shared/constants/enums.constants.ts`

🎨 **Frontend:**
- `apps/frontend/src/shared/constants/enums.constants.ts`

---

## 📖 Descripción General

### Propósito

Este documento define todos los **tipos compartidos** (ENUMs y constantes) utilizados en el sistema de gamificación de Gamilit. Estos tipos son:

1. **Canónicos**: Definidos en PostgreSQL como ENUMs
2. **Sincronizados**: Automáticamente replicados en Backend y Frontend
3. **Versionados**: Cambios controlados con changelog
4. **Documentados**: Con descripciones claras de uso y valores

### Alcance

**Incluye:**
- ✅ ENUMs de PostgreSQL del schema `gamification_system`
- ✅ Constantes TypeScript en Backend (NestJS)
- ✅ Constantes TypeScript en Frontend (React)
- ✅ Valores permitidos y descripciones
- ✅ Categorización y agrupamiento lógico

**No incluye:**
- ❌ Tipos de otros schemas (educational_content, auth_management)
- ❌ Lógica de negocio (ver ETs específicos)
- ❌ Implementación de servicios (ver otros documentos)

---

## 🎯 Tipos Compartidos

### 1. TransactionType (transaction_type)

#### 1.1 Definición SQL

**Ubicación:** `apps/database/ddl/schemas/gamification_system/enums/transaction_type.sql`

**Schema:** `gamification_system`

```sql
CREATE TYPE gamification_system.transaction_type AS ENUM (
    -- ========== EARNED (Ingresos - 7 tipos) ==========
    'earned_exercise',      -- Ganado por completar ejercicio
    'earned_module',        -- Ganado por completar módulo
    'earned_achievement',   -- Ganado por desbloquear achievement
    'earned_rank',          -- Ganado por subir de rango
    'earned_streak',        -- Ganado por racha de días
    'earned_daily',         -- Ganado por bonus diario
    'earned_bonus',         -- Ganado por bonus especial

    -- ========== SPENT (Gastos - 3 tipos) ==========
    'spent_powerup',        -- Gastado en power-ups/comodines
    'spent_hint',           -- Gastado en pistas
    'spent_retry',          -- Gastado en reintento

    -- ========== ADMIN/SISTEMA (4 tipos) ==========
    'admin_adjustment',     -- Ajuste manual por admin
    'refund',               -- Devolución de coins
    'bonus',                -- Bonus general
    'welcome_bonus'         -- Bonus de bienvenida
);
```

#### 1.2 Categorías

| Categoría | Cantidad | Valores |
|-----------|----------|---------|
| **EARNED** | 7 | earned_exercise, earned_module, earned_achievement, earned_rank, earned_streak, earned_daily, earned_bonus |
| **SPENT** | 3 | spent_powerup, spent_hint, spent_retry |
| **ADMIN** | 4 | admin_adjustment, refund, bonus, welcome_bonus |
| **TOTAL** | **14** | |

#### 1.3 Descripción de Valores

##### EARNED (Ingresos - Transacciones Positivas)

| Valor | Descripción | Monto Típico | Multiplicador |
|-------|-------------|--------------|---------------|
| `earned_exercise` | Ganado por completar ejercicio | +5 a +50 coins | ✅ Sí (rango Maya) |
| `earned_module` | Ganado por completar módulo completo | +100 a +300 coins | ✅ Sí |
| `earned_achievement` | Ganado por desbloquear achievement | +50 a +500 coins | ✅ Sí |
| `earned_rank` | Ganado por subir de rango Maya | +100 a +1000 coins | ❌ No (monto fijo) |
| `earned_streak` | Ganado por mantener racha de días | +10 a +100 coins | ✅ Sí |
| `earned_daily` | Ganado por primer login del día | +50 coins | ✅ Sí |
| `earned_bonus` | Ganado por evento especial/promoción | Variable | ✅ Sí |

##### SPENT (Gastos - Transacciones Negativas)

| Valor | Descripción | Monto Típico | Aplica a |
|-------|-------------|--------------|----------|
| `spent_powerup` | Gastado en compra de comodín (power-up) | -15 a -40 coins | Pistas, Visión Lectora, Segunda Oportunidad |
| `spent_hint` | Gastado en pista contextual individual | -10 coins | Ayuda durante ejercicio |
| `spent_retry` | Gastado en reintento de ejercicio fallado | -20 coins | Resetear ejercicio |

##### ADMIN/SISTEMA (Administrativo - Casos Especiales)

| Valor | Descripción | Monto Típico | Autorización |
|-------|-------------|--------------|--------------|
| `admin_adjustment` | Ajuste manual (compensación, corrección, regalo) | Variable (+ o -) | Solo administradores |
| `refund` | Devolución de coins por error o bug | Positivo | Automático o admin |
| `bonus` | Bonus general no categorizado | Positivo | Sistema o admin |
| `welcome_bonus` | Bonus de bienvenida al registrarse | +100 coins | Automático (una vez) |

#### 1.4 Uso en Código

**Backend (TypeScript):**
```typescript
// apps/backend/src/shared/constants/enums.constants.ts

export enum TransactionTypeEnum {
  // ========== EARNED (Ingresos - 7 tipos) ==========
  EARNED_EXERCISE = 'earned_exercise',
  EARNED_MODULE = 'earned_module',
  EARNED_ACHIEVEMENT = 'earned_achievement',
  EARNED_RANK = 'earned_rank',
  EARNED_STREAK = 'earned_streak',
  EARNED_DAILY = 'earned_daily',
  EARNED_BONUS = 'earned_bonus',

  // ========== SPENT (Gastos - 3 tipos) ==========
  SPENT_POWERUP = 'spent_powerup',
  SPENT_HINT = 'spent_hint',
  SPENT_RETRY = 'spent_retry',

  // ========== ADMIN/SISTEMA (4 tipos) ==========
  ADMIN_ADJUSTMENT = 'admin_adjustment',
  REFUND = 'refund',
  BONUS = 'bonus',
  WELCOME_BONUS = 'welcome_bonus',
}
```

**Frontend (TypeScript):**
```typescript
// apps/frontend/src/shared/constants/enums.constants.ts
// (Idéntico al Backend - sincronizado automáticamente)

export enum TransactionTypeEnum {
  EARNED_EXERCISE = 'earned_exercise',
  // ... (mismo contenido)
}
```

**SQL (Uso en funciones):**
```sql
-- En función award_ml_coins()
INSERT INTO gamification_system.ml_coins_transactions (
    transaction_type,
    -- ...
) VALUES (
    p_transaction_type::transaction_type,  -- Cast explícito
    -- ...
);
```

#### 1.5 Validaciones

**Base de Datos:**
- ✅ Tipo ENUM garantiza solo valores válidos
- ✅ Tabla `ml_coins_transactions` usa ENUM directamente

**Backend:**
- ✅ Decoradores de validación en DTOs:
  ```typescript
  @IsEnum(TransactionTypeEnum)
  transactionType: TransactionTypeEnum;
  ```

**Frontend:**
- ✅ TypeScript type-checking previene valores inválidos

#### 1.6 Changelog

**Versión 2.0 (2025-11-08) - ACTUAL:**
- ✅ Migrado de `public.transaction_type` a `gamification_system.transaction_type`
- ✅ Agregados 4 valores nuevos: `earned_module`, `earned_streak`, `earned_daily`, `earned_bonus`
- ✅ Agregados 2 valores de gasto: `spent_powerup`, `spent_retry`
- ✅ Agregados 2 valores admin: `bonus`, `welcome_bonus`
- ✅ Total: 10 → 14 valores
- ✅ Documentación completa creada

**Versión 1.0 (Legacy - 2025-10-27):**
- 10 valores originales
- Schema: `public` (incorrecto)
- Sin documentación

**Valores Legacy Eliminados:**
- ❌ `earned_daily_bonus` → Reemplazado por `earned_daily`
- ❌ `earned_rank_promotion` → Reemplazado por `earned_rank`
- ❌ `spent_unlock_content` → Funcionalidad removida
- ❌ `spent_customization` → Funcionalidad removida
- ❌ `gift` → Reemplazado por `bonus`

---

### 2. MayaRank (maya_rank)

#### 2.1 Definición SQL

**Ubicación:** `apps/database/ddl/schemas/gamification_system/enums/maya_rank.sql`

**Schema:** `gamification_system`

```sql
CREATE TYPE gamification_system.maya_rank AS ENUM (
    'Ajaw',                -- Nivel 1: Señor
    'Nacom',               -- Nivel 2: Capitán de guerra
    'Ah K''in',            -- Nivel 3: Sacerdote del sol
    'Halach Uinic',        -- Nivel 4: Hombre verdadero
    'K''uk''ulkan'         -- Nivel 5: Serpiente emplumada
);
```

#### 2.2 Valores y Detalles

| Rango | Nivel | Significado | XP Mínimo | Multiplicador ML Coins |
|-------|-------|-------------|-----------|------------------------|
| **Ajaw** | 1 | Señor, líder supremo | 0 | 1.00x (baseline) |
| **Nacom** | 2 | Capitán de guerra | 1,000 | 1.25x (+25%) |
| **Ah K'in** | 3 | Sacerdote del sol | 5,000 | 1.50x (+50%) |
| **Halach Uinic** | 4 | Hombre verdadero | 20,000 | 1.75x (+75%) |
| **K'uk'ulkan** | 5 | Serpiente emplumada | 100,000 | 2.00x (+100%) |

**Ver:** [ET-GAM-003: Rangos Maya](./ET-GAM-003-rangos-maya.md) para especificación completa.

#### 2.3 Uso en Código

**Backend/Frontend:**
```typescript
export enum MayaRank {
  AJAW = 'Ajaw',
  NACOM = 'Nacom',
  AH_KIN = 'Ah K\'in',
  HALACH_UINIC = 'Halach Uinic',
  KUKUKULKAN = 'K\'uk\'ulkan',
}
```

**SQL (Función award_ml_coins):**
```sql
v_multiplier := CASE v_current_rank
    WHEN 'Ajaw' THEN 1.00
    WHEN 'Nacom' THEN 1.25
    WHEN 'Ah K''in' THEN 1.50
    WHEN 'Halach Uinic' THEN 1.75
    WHEN 'K''uk''ulkan' THEN 2.00
    ELSE 1.00
END;
```

---

### 3. ComodinType (comodin_type)

#### 3.1 Definición SQL

**Ubicación:** `apps/database/ddl/schemas/gamification_system/enums/comodin_type.sql`

**Schema:** `gamification_system`

```sql
CREATE TYPE gamification_system.comodin_type AS ENUM (
    'pistas',               -- Pistas Contextuales
    'vision_lectora',       -- Visión Lectora
    'segunda_oportunidad'   -- Segunda Oportunidad
);
```

#### 3.2 Valores y Costos

| Comodín | Costo (ML Coins) | Beneficio | Límite por Ejercicio |
|---------|------------------|-----------|----------------------|
| **pistas** | 15 | Muestra 2-3 pistas contextuales | 3 usos |
| **vision_lectora** | 25 | Resalta pasajes clave del texto | 1 uso |
| **segunda_oportunidad** | 40 | Permite reintento sin penalización | 1 uso |

**Ver:** [ET-GAM-002: Sistema de Comodines](./ET-GAM-002-comodines.md) para especificación completa.

#### 3.3 Uso en Código

**Backend/Frontend:**
```typescript
export enum ComodinTypeEnum {
  PISTAS = 'pistas',
  VISION_LECTORA = 'vision_lectora',
  SEGUNDA_OPORTUNIDAD = 'segunda_oportunidad',
}

export const COMODIN_COSTS: Record<ComodinTypeEnum, number> = {
  [ComodinTypeEnum.PISTAS]: 15,
  [ComodinTypeEnum.VISION_LECTORA]: 25,
  [ComodinTypeEnum.SEGUNDA_OPORTUNIDAD]: 40,
};

export const COMODIN_LIMITS: Record<ComodinTypeEnum, number> = {
  [ComodinTypeEnum.PISTAS]: 3,
  [ComodinTypeEnum.VISION_LECTORA]: 1,
  [ComodinTypeEnum.SEGUNDA_OPORTUNIDAD]: 1,
};
```

---

### 4. AchievementCategory (achievement_category)

#### 4.1 Definición SQL

**Ubicación:** `apps/database/ddl/schemas/gamification_system/enums/achievement_category.sql`

**Schema:** `gamification_system`

```sql
CREATE TYPE gamification_system.achievement_category AS ENUM (
    'progress',       -- Logros de progresión (niveles, XP)
    'streak',         -- Logros de racha (días consecutivos)
    'completion',     -- Logros de completitud (100% módulos)
    'social',         -- Logros sociales (compartir, grupos)
    'special',        -- Logros especiales (eventos, promociones)
    'mastery',        -- Logros de maestría (perfección en ejercicios)
    'exploration'     -- Logros de exploración (descubrir contenido)
);
```

#### 4.2 Descripción de Categorías

| Categoría | Descripción | Ejemplos |
|-----------|-------------|----------|
| **progress** | Avances en niveles, XP, rangos | "Alcanzar nivel 10", "Ganar 1000 XP" |
| **streak** | Rachas de días consecutivos | "7 días seguidos", "30 días seguidos" |
| **completion** | Completar módulos al 100% | "Finalizar Módulo 1", "Todos los ejercicios" |
| **social** | Interacciones sociales | "Compartir logro", "Unirse a grupo" |
| **special** | Eventos temporales | "Día de la Lectura", "Halloween 2025" |
| **mastery** | Perfección en ejercicios | "10 ejercicios perfectos", "Sin errores" |
| **exploration** | Descubrir nuevo contenido | "Explorar 5 módulos", "Ver video extra" |

**Ver:** [ET-GAM-001: Sistema de Achievements](./ET-GAM-001-achievements.md) para especificación completa.

---

### 5. AchievementRarity (achievement_rarity)

#### 5.1 Definición SQL

**Ubicación:** `apps/database/ddl/schemas/gamification_system/enums/achievement_rarity.sql`

**Schema:** `gamification_system`

```sql
CREATE TYPE gamification_system.achievement_rarity AS ENUM (
    'common',      -- Común (fácil de obtener)
    'rare',        -- Raro (requiere esfuerzo)
    'epic',        -- Épico (difícil)
    'legendary'    -- Legendario (muy difícil)
);
```

#### 5.2 Valores y Recompensas

| Rareza | Descripción | % Usuarios | Recompensa ML Coins |
|--------|-------------|------------|---------------------|
| **common** | Fácil de obtener | ~70-80% | +50 coins |
| **rare** | Requiere esfuerzo moderado | ~30-50% | +100 coins |
| **epic** | Difícil, requiere dedicación | ~10-20% | +250 coins |
| **legendary** | Muy difícil, elite | ~1-5% | +500 coins |

#### 5.3 Uso en Código

**Backend/Frontend:**
```typescript
export enum AchievementRarityEnum {
  COMMON = 'common',
  RARE = 'rare',
  EPIC = 'epic',
  LEGENDARY = 'legendary',
}

export const RARITY_REWARDS: Record<AchievementRarityEnum, number> = {
  [AchievementRarityEnum.COMMON]: 50,
  [AchievementRarityEnum.RARE]: 100,
  [AchievementRarityEnum.EPIC]: 250,
  [AchievementRarityEnum.LEGENDARY]: 500,
};
```

---

## 🔄 Sincronización DB → Backend → Frontend

### Proceso de Sincronización

1. **Fuente de Verdad:** PostgreSQL ENUMs en `apps/database/ddl/schemas/gamification_system/enums/`

2. **Script de Sincronización:** `sync-enums.ts`
   ```typescript
   // Lee ENUMs de PostgreSQL
   // Genera TypeScript enums idénticos
   // Actualiza Backend: apps/backend/src/shared/constants/enums.constants.ts
   // Copia a Frontend: apps/frontend/src/shared/constants/enums.constants.ts
   ```

3. **Validación:** Tests automáticos verifican que los 3 layers coincidan

### Comando de Sincronización

```bash
## Ejecutar desde raíz del proyecto
npm run sync:enums

## Output esperado:
## ✅ Base de Datos: 14 ENUMs leídos
## ✅ Backend: enums.constants.ts actualizado
## ✅ Frontend: enums.constants.ts sincronizado
## ✅ Sincronización completada exitosamente
```

### Reglas de Sincronización

1. **NUNCA** editar ENUMs directamente en Backend/Frontend
2. **SIEMPRE** modificar primero en PostgreSQL DDL
3. **EJECUTAR** `npm run sync:enums` después de cambios en DB
4. **VALIDAR** que tests pasen antes de commit

---

## 🧪 Tests y Validación

### Test de Sincronización

**Ubicación:** `apps/backend/tests/enums-sync.test.ts`

```typescript
describe('ENUMs Synchronization', () => {
  it('should have identical transaction_type values in DB and Backend', () => {
    const dbValues = getDBEnumValues('gamification_system.transaction_type');
    const backendValues = Object.values(TransactionTypeEnum);
    expect(dbValues).toEqual(backendValues);
  });

  it('should have 14 transaction_type values', () => {
    const values = Object.values(TransactionTypeEnum);
    expect(values).toHaveLength(14);
  });

  it('should categorize earned/spent/admin correctly', () => {
    const earned = Object.values(TransactionTypeEnum).filter(v => v.startsWith('earned_'));
    const spent = Object.values(TransactionTypeEnum).filter(v => v.startsWith('spent_'));
    const admin = Object.values(TransactionTypeEnum).filter(v =>
      v === 'admin_adjustment' || v === 'refund' || v === 'bonus' || v === 'welcome_bonus'
    );

    expect(earned).toHaveLength(7);
    expect(spent).toHaveLength(3);
    expect(admin).toHaveLength(4);
  });
});
```

### Test SQL

**Ubicación:** `apps/database/tests/validate-enums.sql`

```sql
-- Verificar que transaction_type tiene exactamente 14 valores
DO $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO v_count
  FROM pg_enum
  WHERE enumtypid = 'gamification_system.transaction_type'::regtype;

  ASSERT v_count = 14, format('Expected 14 transaction_type values, got %s', v_count);
  RAISE NOTICE '✅ transaction_type ENUM has 14 values';
END $$;

-- Verificar categorías
DO $$
DECLARE
  v_earned INTEGER;
  v_spent INTEGER;
  v_admin INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_earned
  FROM pg_enum
  WHERE enumtypid = 'gamification_system.transaction_type'::regtype
    AND enumlabel LIKE 'earned_%';

  SELECT COUNT(*) INTO v_spent
  FROM pg_enum
  WHERE enumtypid = 'gamification_system.transaction_type'::regtype
    AND enumlabel LIKE 'spent_%';

  SELECT COUNT(*) INTO v_admin
  FROM pg_enum
  WHERE enumtypid = 'gamification_system.transaction_type'::regtype
    AND enumlabel IN ('admin_adjustment', 'refund', 'bonus', 'welcome_bonus');

  ASSERT v_earned = 7, format('Expected 7 earned types, got %s', v_earned);
  ASSERT v_spent = 3, format('Expected 3 spent types, got %s', v_spent);
  ASSERT v_admin = 4, format('Expected 4 admin types, got %s', v_admin);

  RAISE NOTICE '✅ Categories: 7 earned, 3 spent, 4 admin';
END $$;
```

---

## 📊 Matriz de Sincronización

| ENUM | DB Schema | Backend | Frontend | Sincronizado | Tests |
|------|-----------|---------|----------|--------------|-------|
| `transaction_type` | gamification_system | ✅ 14 valores | ✅ 14 valores | ✅ Sí | ✅ 100% |
| `maya_rank` | gamification_system | ✅ 5 valores | ✅ 5 valores | ✅ Sí | ✅ 100% |
| `comodin_type` | gamification_system | ✅ 3 valores | ✅ 3 valores | ✅ Sí | ✅ 100% |
| `achievement_category` | gamification_system | ✅ 7 valores | ✅ 7 valores | ✅ Sí | ✅ 100% |
| `achievement_rarity` | gamification_system | ✅ 4 valores | ✅ 4 valores | ✅ Sí | ✅ 100% |

---

## 🔒 Política de Cambios

### Agregar Nuevo Valor a ENUM Existente

1. **Actualizar DDL:**
   ```sql
   -- apps/database/ddl/schemas/gamification_system/enums/transaction_type.sql
   ALTER TYPE gamification_system.transaction_type ADD VALUE 'new_value';
   ```

2. **Ejecutar Migration:**
   ```bash
   psql -U postgres -d gamilit < migration.sql
   ```

3. **Sincronizar ENUMs:**
   ```bash
   npm run sync:enums
   ```

4. **Actualizar Tests:**
   - Incrementar contador esperado
   - Agregar tests para nuevo valor

5. **Actualizar Documentación:**
   - Agregar a tabla de valores
   - Documentar uso y propósito
   - Actualizar changelog

### Eliminar Valor de ENUM

**⚠️ PELIGRO:** No se puede eliminar valor de ENUM sin recrear el tipo.

**Alternativa:**
1. Marcar como `@deprecated` en documentación
2. Crear migration que:
   - Crea nuevo ENUM sin el valor
   - Convierte columnas al nuevo tipo
   - Elimina ENUM antiguo
3. Actualizar código para no usar valor

### Renombrar Valor de ENUM

**No soportado** - Requiere recrear ENUM completo.

**Alternativa:**
1. Agregar nuevo valor
2. Migration para actualizar datos
3. Marcar valor antiguo como deprecated
4. Eventualmente eliminar (ver "Eliminar Valor")

---

## ✅ Checklist de Implementación

Al implementar nuevo tipo compartido:

- [ ] Crear ENUM en PostgreSQL DDL
- [ ] Agregar comentarios SQL documentando propósito
- [ ] Ejecutar `npm run sync:enums`
- [ ] Validar que Backend/Frontend se actualizaron
- [ ] Crear tests SQL de validación
- [ ] Crear tests TypeScript de sincronización
- [ ] Actualizar este documento (ET-GAM-004)
- [ ] Actualizar changelog con versión y fecha
- [ ] Crear PR con cambios
- [ ] Obtener revisión de Database Lead

---

## 📚 Referencias

### Documentación

- [RF-GAM-004: Economía de ML Coins](../requirements/RF-GAM-004-economia-ml-coins.md)
- [ET-GAM-003: Rangos Maya](./ET-GAM-003-rangos-maya.md)
- [ET-GAM-002: Sistema de Comodines](./ET-GAM-002-comodines.md)
- [ET-GAM-001: Sistema de Achievements](./ET-GAM-001-achievements.md)

### Código

**Base de Datos:**
- `apps/database/ddl/schemas/gamification_system/enums/transaction_type.sql`
- `apps/database/ddl/schemas/gamification_system/enums/maya_rank.sql`
- `apps/database/ddl/schemas/gamification_system/enums/comodin_type.sql`
- `apps/database/ddl/schemas/gamification_system/enums/achievement_category.sql`
- `apps/database/ddl/schemas/gamification_system/enums/achievement_rarity.sql`

**Backend:**
- `apps/backend/src/shared/constants/enums.constants.ts`

**Frontend:**
- `apps/frontend/src/shared/constants/enums.constants.ts`

---

## 🔄 Changelog

### Versión 2.0 (2025-11-08) - ACTUAL

**Agregado:**
- ✅ Documentación completa de `transaction_type` (14 valores)
- ✅ Documentación de `maya_rank` (5 valores)
- ✅ Documentación de `comodin_type` (3 valores)
- ✅ Documentación de `achievement_category` (7 valores)
- ✅ Documentación de `achievement_rarity` (4 valores)
- ✅ Matriz de sincronización DB/Backend/Frontend
- ✅ Proceso de sincronización documentado
- ✅ Tests SQL y TypeScript

**Modificado:**
- `transaction_type`: 10 → 14 valores
- Schema migrado: `public` → `gamification_system`

### Versión 1.0 (2025-10-27) - LEGACY

**Inicial:**
- ENUMs básicos sin documentación
- Schema incorrecto (`public`)
- Sin proceso de sincronización documentado

---

**Creado:** 2025-11-08
**Aprobado por:** Database Team
**Próxima revisión:** 2025-12-01
