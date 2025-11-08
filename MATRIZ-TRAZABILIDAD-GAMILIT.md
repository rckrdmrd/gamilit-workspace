# MATRIZ DE TRAZABILIDAD - GAMILIT

**Fecha:** 2025-11-08
**Propósito:** Mapeo completo DB ↔ Backend ↔ Frontend ↔ Documentación
**Estado:** ✅ Validado contra docs oficiales

---

## 📋 CÓMO USAR ESTA MATRIZ

Esta matriz establece la **trazabilidad completa** entre:
- 📖 **Docs Oficiales** (RF/ET) - Fuente de verdad
- 🗄️ **Base de Datos** - Esquema PostgreSQL
- ⚙️ **Backend** - Entidades TypeORM + Servicios
- 🎨 **Frontend** - Types + Componentes

**Formato:** `DOC → DB → Backend → Frontend`

---

## 🎯 COMPONENTES CRÍTICOS

### 1. MAYA RANK (Sistema de Rangos)

#### 📖 Documentación Oficial
- **RF Primario:** `docs/01-fase-alcance-inicial/EAI-003-gamificacion/requerimientos/RF-GAM-003-rangos-maya.md`
- **ET Primario:** `docs/01-fase-alcance-inicial/EAI-003-gamificacion/especificaciones/ET-GAM-003-rangos-maya.md`
- **US Relacionadas:** `US-GAM-001-sistema-rangos-maya.md`

#### 🗄️ Base de Datos
```sql
-- ENUM Oficial
CREATE TYPE gamification_system.maya_rank AS ENUM (
  'Ajaw',           -- Nivel 1: 0-999 XP
  'Nacom',          -- Nivel 2: 1,000-4,999 XP
  'Ah K''in',       -- Nivel 3: 5,000-19,999 XP
  'Halach Uinic',   -- Nivel 4: 20,000-99,999 XP
  'K''uk''ulkan'    -- Nivel 5: 100,000+ XP
);

-- Ubicación: apps/database/ddl/schemas/gamification_system/enums/maya_rank.sql
```

**Tablas que usan este ENUM:**
- `gamification_system.user_stats` (columna: `current_rank`)
- `gamification_system.maya_ranks` (tabla de configuración)
- `educational_content.modules` (columnas: `maya_rank_required`, `maya_rank_granted`)

**Funciones SQL:**
- `check_rank_promotion(user_id UUID)` → RETURNS maya_rank
- `get_rank_multiplier(rank maya_rank)` → RETURNS DECIMAL
- `promote_to_next_rank(user_id UUID)` → RETURNS BOOLEAN

#### ⚙️ Backend
```typescript
// ENUM Sincronizado
// Ubicación: apps/backend/src/shared/constants/enums.constants.ts
export enum MayaRank {
  Ajaw = 'Ajaw',
  Nacom = 'Nacom',
  'Ah K\'in' = 'Ah K\'in',
  'Halach Uinic' = 'Halach Uinic',
  'K\'uk\'ulkan' = 'K\'uk\'ulkan'
}

// Entidad
// Ubicación: apps/backend/src/modules/gamification/entities/user-stats.entity.ts
@Entity('user_stats', { schema: 'gamification_system' })
export class UserStats {
  @Column({
    type: 'enum',
    enum: MayaRank,
    name: 'current_rank'
  })
  currentRank: MayaRank;
}

// Servicio
// Ubicación: apps/backend/src/modules/gamification/services/rank.service.ts
export class RankService {
  async calculateRank(userId: string): Promise<MayaRank>
  async checkPromotion(userId: string): Promise<boolean>
  async getRankProgress(userId: string): Promise<RankProgressDto>
}
```

#### 🎨 Frontend
```typescript
// ENUM Sincronizado
// Ubicación: apps/frontend/src/shared/constants/enums.constants.ts
export enum MayaRank {
  Ajaw = 'Ajaw',
  Nacom = 'Nacom',
  AhKin = 'Ah K\'in',
  HalachUinic = 'Halach Uinic',
  Kukulkan = 'K\'uk\'ulkan'
}

// Configuración de Rangos
// Ubicación: apps/frontend/src/shared/constants/ranks.constants.ts
export const MAYA_RANKS: Record<MayaRank, RankConfig> = {
  [MayaRank.Ajaw]: {
    id: MayaRank.Ajaw,
    level: 1,
    mlCoinsRequired: 0,
    multiplier: 1.0,
    color: '#8B4513',
    icon: '🌱'
  },
  // ... resto de rangos
}

// Componente
// Ubicación: apps/frontend/src/components/gamification/RankBadge.tsx
export const RankBadge: React.FC<{ rank: MayaRank }> = ({ rank }) => {
  const config = MAYA_RANKS[rank];
  return <div className={`rank-badge ${config.color}`}>{config.icon}</div>
}
```

#### ✅ Estado de Validación

| Capa | Estado | Notas |
|------|--------|-------|
| **Docs** | ✅ Completo | RF + ET bien documentados |
| **DB ENUM** | ✅ Correcto | 5 valores Title Case |
| **DB Functions** | 🔴 Faltante | `check_rank_promotion()` no implementada |
| **Backend ENUM** | ✅ Sincronizado | Via `sync-enums.ts` |
| **Backend Service** | 🔴 Faltante | `RankService` no implementado |
| **Frontend ENUM** | ✅ Sincronizado | Via `sync-enums.ts` |
| **Frontend Config** | ✅ Correcto | `MAYA_RANKS` con 5 rangos |

#### 🚨 Conflictos Detectados

**CONFLICTO #1: ENUM Duplicado en Frontend**
- **Ubicación:** `apps/frontend/src/shared/types/leaderboard.types.ts:5-12`
- **Problema:** Define `MayaRank` con valores incorrectos (NOVICE, APPRENTICE, etc.)
- **Solución:** ❌ **ELIMINAR** este archivo, usar `enums.constants.ts`

#### 📊 Trazabilidad Completa

```
RF-GAM-003 (Requerimientos)
    ↓
ET-GAM-003 (Especificación Técnica)
    ↓ define
gamification_system.maya_rank (ENUM DB)
    ↓ sincroniza
MayaRank (Backend ENUM) via sync-enums.ts
    ↓ sincroniza
MayaRank (Frontend ENUM) via sync-enums.ts
    ↓ configura
MAYA_RANKS (Frontend Constants)
    ↓ usa
RankBadge, RankProgress (Componentes)
```

---

### 2. EXERCISE TYPE (Mecánicas de Ejercicios)

#### 📖 Documentación Oficial
- **RF Primario:** `docs/01-fase-alcance-inicial/EAI-002-actividades/requerimientos/RF-EDU-001-mecanicas-ejercicios.md`
- **ET Primario:** `docs/01-fase-alcance-inicial/EAI-002-actividades/especificaciones/ET-EDU-001-mecanicas-ejercicios.md`

#### 🗄️ Base de Datos
```sql
-- ENUM Oficial (31 mecánicas)
CREATE TYPE educational_content.exercise_mechanic AS ENUM (
  -- Vocabulario (6)
  'multiple_choice', 'fill_in_blank', 'matching_pairs',
  'flashcard', 'word_search', 'image_association',

  -- Gramática (8)
  'verb_conjugation', 'sentence_builder', 'error_detection',
  'sentence_transformation', 'pronoun_selection', 'possessive_forms',
  'pluralization', 'aspect_markers',

  -- Lectura (4)
  'reading_comprehension', 'true_or_false', 'inference',
  'sequence_ordering',

  -- Escritura (4)
  'free_writing', 'sentence_completion', 'translation',
  'dictation',

  -- Audio (3)
  'listening_comprehension', 'audio_matching', 'tone_recognition',

  -- Pronunciación (2)
  'speech_recording', 'pronunciation_comparison',

  -- Cultura (4)
  'cultural_context', 'historical_timeline', 'cultural_artifact',
  'traditional_practice'
);

-- Ubicación: apps/database/ddl/00-prerequisites.sql:59-65
```

**Tabla:**
- `educational_content.exercises` (columna: `exercise_type`)

**Funciones SQL:**
- `validate_exercise_structure(exercise_id UUID)` → RETURNS BOOLEAN
- `get_exercise_validator(mechanic exercise_mechanic)` → RETURNS TEXT

#### ⚙️ Backend
```typescript
// ENUM
// Ubicación: apps/backend/src/modules/educational/enums/exercise-mechanic.enum.ts
export enum ExerciseMechanic {
  // 31 valores sincronizados con DB
  MULTIPLE_CHOICE = 'multiple_choice',
  FILL_IN_BLANK = 'fill_in_blank',
  // ... resto
}

// Entidad
// Ubicación: apps/backend/src/modules/educational/entities/exercise.entity.ts
@Entity('exercises', { schema: 'educational_content' })
export class Exercise {
  @Column({
    type: 'enum',
    enum: ExerciseMechanic,
    name: 'exercise_type'
  })
  exerciseType: ExerciseMechanic;

  @Column({ type: 'jsonb', nullable: true })
  config: Record<string, any>; // Config específica por tipo
}

// Validadores
// Ubicación: apps/backend/src/modules/educational/validators/
export class ExerciseValidatorService {
  validateMultipleChoice(config: any): ValidationResult
  validateFillInBlank(config: any): ValidationResult
  // ... 31 validadores
}
```

#### 🎨 Frontend
```typescript
// ENUM
// Ubicación: apps/frontend/src/shared/types/educational.types.ts
export enum ExerciseType {
  MULTIPLE_CHOICE = 'multiple_choice',
  FILL_IN_BLANK = 'fill_in_blank',
  // ... 31 tipos
}

// Renderer Factory
// Ubicación: apps/frontend/src/components/exercises/ExerciseRenderer.tsx
export const ExerciseRenderer: React.FC<{ exercise: Exercise }> = ({ exercise }) => {
  switch(exercise.exerciseType) {
    case ExerciseType.MULTIPLE_CHOICE:
      return <MultipleChoiceExercise {...exercise} />;
    case ExerciseType.FILL_IN_BLANK:
      return <FillInBlankExercise {...exercise} />;
    // ... 31 componentes
  }
}
```

#### ✅ Estado de Validación

| Capa | Estado | Notas |
|------|--------|-------|
| **Docs** | ✅ Completo | 31 mecánicas exhaustivamente documentadas |
| **DB ENUM** | ✅ Correcto | 31 valores snake_case |
| **DB Functions** | 🔴 Faltante | Validadores no implementados |
| **Backend ENUM** | ✅ Sincronizado | 31 valores UPPER_SNAKE_CASE |
| **Backend Validators** | 🟡 Parcial | Solo 8/31 implementados |
| **Frontend ENUM** | ✅ Sincronizado | 31 valores UPPER_SNAKE_CASE |
| **Frontend Components** | 🟡 Parcial | Solo 12/31 componentes |

#### 🚨 Conflictos Detectados

**CONFLICTO #2: ENUM Simplificado en Frontend**
- **Ubicación:** `apps/frontend/src/features/exercises/types/exercise.types.ts:15-22`
- **Problema:** Define versión simplificada con solo 6 tipos
- **Solución:** ⚠️ **DEPRECAR**, usar `educational.types.ts` completo

---

### 3. ML COINS (Moneda Virtual)

#### 📖 Documentación Oficial
- **RF Primario:** `docs/01-fase-alcance-inicial/EAI-003-gamificacion/requerimientos/RF-GAM-002-comodines.md`
- **ET Primario:** `docs/01-fase-alcance-inicial/EAI-003-gamificacion/especificaciones/ET-GAM-002-comodines.md`

#### 🗄️ Base de Datos
```sql
-- ENUM de tipos de transacción
CREATE TYPE gamification_system.transaction_type AS ENUM (
  -- Ganancias (7 tipos)
  'earned_exercise',
  'earned_module',
  'earned_achievement',
  'earned_rank',
  'earned_streak',
  'earned_daily',
  'earned_bonus',

  -- Gastos (3 tipos)
  'spent_powerup',
  'spent_hint',
  'spent_retry',

  -- Admin (4 tipos)
  'admin_adjustment',
  'refund',
  'bonus',
  'welcome_bonus'
);

-- Tabla de balance
CREATE TABLE gamification_system.user_stats (
  ml_coins INTEGER DEFAULT 0,
  ml_coins_earned_total INTEGER DEFAULT 0,
  ml_coins_spent_total INTEGER DEFAULT 0
);

-- Tabla de transacciones
CREATE TABLE gamification_system.ml_coins_transactions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth_management.profiles(id),
  amount INTEGER NOT NULL,
  balance_before INTEGER NOT NULL,
  balance_after INTEGER NOT NULL,
  transaction_type transaction_type NOT NULL,
  description TEXT,
  reference_id UUID,
  reference_type TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Función crítica
CREATE OR REPLACE FUNCTION award_ml_coins(
  p_user_id UUID,
  p_amount INTEGER,
  p_transaction_type transaction_type,
  p_description TEXT DEFAULT NULL,
  p_reference_id UUID DEFAULT NULL
) RETURNS INTEGER AS $$
DECLARE
  v_new_balance INTEGER;
BEGIN
  -- Actualizar balance en user_stats
  UPDATE gamification_system.user_stats
  SET
    ml_coins = ml_coins + p_amount,
    ml_coins_earned_total = ml_coins_earned_total + p_amount,
    updated_at = NOW()
  WHERE user_id = p_user_id
  RETURNING ml_coins INTO v_new_balance;

  -- Registrar transacción
  INSERT INTO gamification_system.ml_coins_transactions (
    user_id, amount, balance_after, transaction_type, description, reference_id
  ) VALUES (
    p_user_id, p_amount, v_new_balance, p_transaction_type, p_description, p_reference_id
  );

  RETURN v_new_balance;
END;
$$ LANGUAGE plpgsql;
```

#### ⚙️ Backend
```typescript
// ENUM
// Ubicación: apps/backend/src/modules/gamification/enums/transaction-type.enum.ts
export enum TransactionType {
  EARNED_EXERCISE = 'earned_exercise',
  EARNED_MODULE = 'earned_module',
  // ... 14 tipos
}

// DTO
// Ubicación: apps/backend/src/modules/gamification/dto/award-ml-coins.dto.ts
export class AwardMLCoinsDto {
  @IsUUID()
  userId: string;

  @IsInt()
  @Min(1)
  amount: number;

  @IsEnum(TransactionType)
  transactionType: TransactionType;

  @IsString()
  @IsOptional()
  description?: string;

  @IsUUID()
  @IsOptional()
  referenceId?: string;
}

// Servicio
// Ubicación: apps/backend/src/modules/gamification/services/ml-coins.service.ts
export class MLCoinsService {
  async award(dto: AwardMLCoinsDto): Promise<number> {
    // Llamar función SQL award_ml_coins()
    const result = await this.db.query(
      'SELECT award_ml_coins($1, $2, $3, $4, $5)',
      [dto.userId, dto.amount, dto.transactionType, dto.description, dto.referenceId]
    );
    return result.rows[0].award_ml_coins;
  }

  async spend(userId: string, amount: number, type: TransactionType): Promise<number>
  async getBalance(userId: string): Promise<number>
  async getTransactions(userId: string, limit?: number): Promise<Transaction[]>
}
```

#### 🎨 Frontend
```typescript
// ENUM
// Ubicación: apps/frontend/src/shared/constants/enums.constants.ts
export enum TransactionTypeEnum {
  EARNED_EXERCISE = 'earned_exercise',
  // ... 14 tipos
}

// Store
// Ubicación: apps/frontend/src/stores/economyStore.ts
export const useEconomyStore = create<EconomyState>((set, get) => ({
  balance: 0,
  transactions: [],

  async fetchBalance(userId: string) {
    const balance = await apiClient.get(`/gamification/users/${userId}/ml-coins`);
    set({ balance });
  },

  async awardCoins(amount: number, type: TransactionTypeEnum) {
    const newBalance = await apiClient.post('/gamification/ml-coins/award', { amount, type });
    set({ balance: newBalance });
  }
}));

// Componente
// Ubicación: apps/frontend/src/components/gamification/MLCoinsBalance.tsx
export const MLCoinsBalance: React.FC = () => {
  const { balance, fetchBalance } = useEconomyStore();

  return (
    <div className="ml-coins-balance">
      <span className="icon">💰</span>
      <span className="amount">{balance} ML Coins</span>
    </div>
  );
}
```

#### ✅ Estado de Validación

| Capa | Estado | Notas |
|------|--------|-------|
| **Docs** | ✅ Completo | Sistema de economía bien definido |
| **DB Tables** | ✅ Correcto | user_stats + ml_coins_transactions |
| **DB Function** | 🔴 Faltante | `award_ml_coins()` no implementada |
| **Backend ENUM** | ✅ Sincronizado | 14 tipos de transacción |
| **Backend Service** | 🔴 Faltante | `MLCoinsService` no implementado |
| **Frontend ENUM** | ✅ Sincronizado | 14 tipos |
| **Frontend Store** | 🟡 Parcial | Estructura existe, faltan métodos |

---

## 📊 TABLA RESUMEN DE TRAZABILIDAD

| Componente | Doc | DB | Backend | Frontend | Estado Global |
|------------|-----|----|---------| ---------|---------------|
| **MayaRank** | ✅ | ✅ | 🟡 | ✅ | 🟡 Backend incompleto |
| **ExerciseType** | ✅ | ✅ | 🟡 | 🟡 | 🟡 Validadores faltantes |
| **Achievement** | ✅ | ✅ | 🔴 | ✅ | 🔴 Servicio faltante |
| **ML Coins** | ✅ | ✅ | 🔴 | 🟡 | 🔴 Función SQL faltante |
| **User Stats** | ✅ | ✅ | ✅ | ✅ | ✅ Completo |
| **Progress Tracking** | ✅ | ✅ | ✅ | ✅ | ✅ Completo |
| **Classrooms** | ✅ | ✅ | ✅ | ✅ | ✅ Completo |
| **Schools** | ✅ | ✅ | ✅ | ✅ | ✅ Completo |
| **Modules** | ✅ | ✅ | ✅ | ✅ | ✅ Completo |
| **Exercises** | ✅ | ✅ | 🟡 | 🟡 | 🟡 Componentes parciales |

**Leyenda:**
- ✅ Completo y validado
- 🟡 Parcialmente implementado
- 🔴 Faltante o crítico

---

## 🚨 CONFLICTOS CONSOLIDADOS

### P0 - Crítico

1. **MayaRank Duplicado**
   - Eliminar: `apps/frontend/src/shared/types/leaderboard.types.ts:5-12`
   - Usar: `apps/frontend/src/shared/constants/enums.constants.ts:MayaRank`

2. **Función SQL `award_ml_coins()` Faltante**
   - Crear: `apps/database/ddl/schemas/gamification_system/functions/award_ml_coins.sql`
   - Implementar según ET-GAM-002

3. **MLCoinsService Faltante**
   - Crear: `apps/backend/src/modules/gamification/services/ml-coins.service.ts`
   - Métodos: award(), spend(), getBalance(), getTransactions()

### P1 - Alto

4. **ExerciseType Simplificado**
   - Deprecar: `apps/frontend/src/features/exercises/types/exercise.types.ts`
   - Migrar a: `apps/frontend/src/shared/types/educational.types.ts`

5. **Validadores de Ejercicios Incompletos**
   - Implementar 23 validadores faltantes (8/31 actuales)

---

## 📋 SIGUIENTE ACCIÓN

Antes de implementar correcciones, necesitas **aprobar**:

1. ✅ Fuentes de verdad identificadas correctamente
2. ✅ Mapeo DB → Backend → Frontend es correcto
3. ✅ Conflictos P0 priorizados adecuadamente

**¿Procedo con las correcciones validadas?**

---

**Generado:** 2025-11-08
**Validado contra:** Documentación oficial (RF + ET)
**Próxima actualización:** Post-correcciones
