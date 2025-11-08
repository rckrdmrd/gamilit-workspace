
<!-- MIGRADO A SIMCO V2 -->
<!-- ID Original: ET-GAM-003 -->
<!-- ID Nuevo: M-GAM-ET-003 -->
<!-- Fecha de Migración: 2025-11-07 -->

# M-GAM-ET-003: Sistema de Rangos Maya

## 📋 Metadata

| Campo | Valor |
|-------|-------|
| **ID** | ET-GAM-003 |
| **Módulo** | 02 - Gamificación |
| **Título** | Sistema de Rangos Maya - Especificación Técnica |
| **Prioridad** | Alta |
| **Estado** | ✅ Implementado |
| **Versión** | 1.0 |
| **Fecha Creación** | 2025-11-07 |
| **Última Actualización** | 2025-11-07 |
| **Autor** | Backend Team |
| **Stakeholders** | Backend Team, Frontend Team, Database Team |

---

## 🔗 Referencias

### Requerimiento Funcional

📘 **Implementa:**
- [RF-GAM-003: Sistema de Rangos Maya](../../01-requerimientos/02-gamificacion/RF-GAM-003-rangos-maya.md)

### Implementación DDL

🗄️ **ENUM Canónico:**
- **Ubicación:** `apps/database/ddl/schemas/gamification_system/enums/maya_rank.sql:1-8`
- **Tipo:** `gamification_system.maya_rank`
- **Valores:** `'Ajaw'`, `'Nacom'`, `'Ah K''in'`, `'Halach Uinic'`, `'K''uk''ulkan'`

🗄️ **Tablas:**
1. **`gamification_system.user_stats`**
   - **Ubicación:** `apps/database/ddl/schemas/gamification_system/tables/01-user_stats.sql:15-35`
   - **Columnas clave:**
     - `current_rank gamification_system.maya_rank DEFAULT 'Ajaw'`
     - `total_xp INTEGER DEFAULT 0`
     - `rank_achieved_at TIMESTAMPTZ`
     - `previous_rank gamification_system.maya_rank`

2. **`gamification_system.rank_history`**
   - **Ubicación:** `apps/database/ddl/schemas/gamification_system/tables/05-rank_history.sql:1-15`
   - **Columnas:**
     - `id UUID PRIMARY KEY`
     - `user_id UUID REFERENCES auth.users(id)`
     - `old_rank gamification_system.maya_rank`
     - `new_rank gamification_system.maya_rank`
     - `xp_at_promotion INTEGER`
     - `days_in_old_rank INTEGER`
     - `promoted_at TIMESTAMPTZ`
     - `achievement_id UUID`

🗄️ **Funciones:**
1. **`check_rank_promotion(p_user_id UUID)`**
   - **Ubicación:** `apps/database/ddl/schemas/gamification_system/functions/check_rank_promotion.sql:1-80`

2. **`promote_to_next_rank(p_user_id UUID)`**
   - **Ubicación:** `apps/database/ddl/schemas/gamification_system/functions/promote_to_next_rank.sql:1-120`

3. **`get_rank_benefits(p_rank gamification_system.maya_rank)`**
   - **Ubicación:** `apps/database/ddl/schemas/gamification_system/functions/get_rank_benefits.sql:1-45`

4. **`get_rank_multiplier(p_rank gamification_system.maya_rank)`**
   - **Ubicación:** `apps/database/ddl/schemas/gamification_system/functions/get_rank_multiplier.sql:1-25`

🗄️ **Triggers:**
- **`trg_check_rank_promotion_on_xp_gain`**
  - **Ubicación:** `apps/database/ddl/schemas/gamification_system/triggers/trg_check_rank_promotion.sql:1-12`
  - **Tabla:** `gamification_system.user_stats`
  - **Evento:** `AFTER UPDATE OF total_xp`

### Documentos Relacionados

- [ET-GAM-001: Sistema de Achievements](./ET-GAM-001-achievements.md) - Achievement `rank_promotion`
- [ET-NOT-001: Tipos de Notificaciones](../06-notificaciones/ET-NOT-001-tipos-notificaciones.md) - Notificación `rank_up`
- [RF-PRG-001: Tracking de Progreso](../../01-requerimientos/04-progreso-seguimiento/RF-PRG-001-estados-progreso.md) - Acumulación de XP

---

## 📖 Descripción General

### Propósito

El **Sistema de Rangos Maya** implementa una progresión jerárquica basada en XP (Experience Points) que reconoce el avance de los estudiantes mediante 5 rangos inspirados en la civilización maya:

1. **Ajaw** (0-999 XP) - Rango inicial
2. **Nacom** (1,000-4,999 XP) - Capitán guerrero
3. **Ah K'in** (5,000-19,999 XP) - Sacerdote del sol
4. **Halach Uinic** (20,000-99,999 XP) - Hombre verdadero
5. **K'uk'ulkan** (100,000+ XP) - Serpiente emplumada (máximo)

### Características Técnicas

- ✅ Promoción automática mediante triggers PostgreSQL
- ✅ Validación de umbrales de XP
- ✅ Historial inmutable de promociones
- ✅ Integración con sistema de achievements
- ✅ Notificaciones en tiempo real
- ✅ Beneficios progresivos (XP multipliers, desbloqueos)
- ✅ Auditoría completa de cambios

### Flujo de Promoción

```
Usuario completa ejercicio → Gana XP → total_xp actualizado
                                            ↓
                            Trigger: trg_check_rank_promotion_on_xp_gain
                                            ↓
                            Función: check_rank_promotion(user_id)
                                            ↓
                            ¿total_xp >= umbral próximo rango?
                                            ↓ Sí
                            Función: promote_to_next_rank(user_id)
                                            ↓
                        ┌───────────────────┴───────────────────┐
                        ↓                                       ↓
            Actualizar current_rank                 Crear achievement rank_promotion
                        ↓                                       ↓
            Registrar en rank_history                Enviar notificación rank_up
                        ↓                                       ↓
            Otorgar ML Coins bonus              Frontend muestra modal celebratorio
```

---

## 🗄️ Implementación en Base de Datos

### 1. ENUM: maya_rank

```sql
-- apps/database/ddl/schemas/gamification_system/enums/maya_rank.sql

CREATE TYPE gamification_system.maya_rank AS ENUM (
    'Ajaw',              -- Rango 1: 0-999 XP
    'Nacom',             -- Rango 2: 1,000-4,999 XP
    'Ah K''in',          -- Rango 3: 5,000-19,999 XP (nota: comilla escapada)
    'Halach Uinic',      -- Rango 4: 20,000-99,999 XP
    'K''uk''ulkan'       -- Rango 5: 100,000+ XP (rango máximo)
);

COMMENT ON TYPE gamification_system.maya_rank IS
'Jerarquía de rangos inspirados en la civilización maya.
Orden estricto de progresión: Ajaw → Nacom → Ah K''in → Halach Uinic → K''uk''ulkan';
```

### 2. Tabla: rank_history

```sql
-- apps/database/ddl/schemas/gamification_system/tables/05-rank_history.sql

CREATE TABLE gamification_system.rank_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Rangos involucrados en la promoción
    old_rank gamification_system.maya_rank NOT NULL,
    new_rank gamification_system.maya_rank NOT NULL,

    -- Contexto de la promoción
    xp_at_promotion INTEGER NOT NULL CHECK (xp_at_promotion >= 0),
    days_in_old_rank INTEGER, -- Cuántos días estuvo en rango anterior

    -- Timestamps
    promoted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Relación con achievement generado
    achievement_id UUID REFERENCES gamification_system.user_achievements(id),

    -- Índices para queries comunes
    CONSTRAINT unique_promotion UNIQUE (user_id, promoted_at)
);

-- Índices
CREATE INDEX idx_rank_history_user_id ON gamification_system.rank_history(user_id);
CREATE INDEX idx_rank_history_promoted_at ON gamification_system.rank_history(promoted_at DESC);
CREATE INDEX idx_rank_history_new_rank ON gamification_system.rank_history(new_rank);

-- RLS
ALTER TABLE gamification_system.rank_history ENABLE ROW LEVEL SECURITY;

-- Policy: usuarios pueden ver su propio historial
CREATE POLICY rank_history_select_own
ON gamification_system.rank_history
FOR SELECT
USING (user_id = auth.uid());

-- Policy: solo sistema puede insertar (mediante funciones SECURITY DEFINER)
CREATE POLICY rank_history_insert_system
ON gamification_system.rank_history
FOR INSERT
WITH CHECK (false); -- Solo funciones con SECURITY DEFINER pueden insertar

COMMENT ON TABLE gamification_system.rank_history IS
'Historial inmutable de todas las promociones de rango de usuarios.
Cada registro representa una promoción exitosa de un rango a otro.';
```

### 3. Función: check_rank_promotion

```sql
-- apps/database/ddl/schemas/gamification_system/functions/check_rank_promotion.sql

CREATE OR REPLACE FUNCTION gamification_system.check_rank_promotion(
    p_user_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER -- Ejecuta con permisos del owner
AS $$
DECLARE
    v_current_rank gamification_system.maya_rank;
    v_total_xp INTEGER;
    v_promoted BOOLEAN := false;
BEGIN
    -- Obtener datos actuales del usuario
    SELECT current_rank, total_xp
    INTO v_current_rank, v_total_xp
    FROM gamification_system.user_stats
    WHERE user_id = p_user_id
    FOR UPDATE; -- Lock para evitar race conditions

    -- Si no existe usuario, salir
    IF NOT FOUND THEN
        RETURN false;
    END IF;

    -- Verificar promociones según rango actual
    CASE v_current_rank
        WHEN 'Ajaw' THEN
            IF v_total_xp >= 1000 THEN
                PERFORM gamification_system.promote_to_next_rank(p_user_id, 'Nacom');
                v_promoted := true;
            END IF;

        WHEN 'Nacom' THEN
            IF v_total_xp >= 5000 THEN
                PERFORM gamification_system.promote_to_next_rank(p_user_id, 'Ah K''in');
                v_promoted := true;
            END IF;

        WHEN 'Ah K''in' THEN
            IF v_total_xp >= 20000 THEN
                PERFORM gamification_system.promote_to_next_rank(p_user_id, 'Halach Uinic');
                v_promoted := true;
            END IF;

        WHEN 'Halach Uinic' THEN
            IF v_total_xp >= 100000 THEN
                PERFORM gamification_system.promote_to_next_rank(p_user_id, 'K''uk''ulkan');
                v_promoted := true;
            END IF;

        WHEN 'K''uk''ulkan' THEN
            -- Rango máximo alcanzado, no hay más promociones
            v_promoted := false;
    END CASE;

    RETURN v_promoted;
END;
$$;

COMMENT ON FUNCTION gamification_system.check_rank_promotion IS
'Verifica si un usuario califica para promoción de rango según su total_xp actual.
Retorna true si el usuario fue promovido, false en caso contrario.
Se ejecuta automáticamente mediante trigger después de actualizar total_xp.';
```

### 4. Función: promote_to_next_rank

```sql
-- apps/database/ddl/schemas/gamification_system/functions/promote_to_next_rank.sql

CREATE OR REPLACE FUNCTION gamification_system.promote_to_next_rank(
    p_user_id UUID,
    p_new_rank gamification_system.maya_rank
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_old_rank gamification_system.maya_rank;
    v_total_xp INTEGER;
    v_days_in_old_rank INTEGER;
    v_ml_coins_bonus INTEGER;
    v_achievement_id UUID;
    v_old_rank_achieved_at TIMESTAMPTZ;
BEGIN
    -- Obtener datos actuales
    SELECT
        current_rank,
        total_xp,
        rank_achieved_at,
        EXTRACT(DAY FROM NOW() - rank_achieved_at)::INTEGER
    INTO
        v_old_rank,
        v_total_xp,
        v_old_rank_achieved_at,
        v_days_in_old_rank
    FROM gamification_system.user_stats
    WHERE user_id = p_user_id;

    -- Verificar que el usuario existe
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Usuario no encontrado: %', p_user_id;
    END IF;

    -- Determinar bonus de ML Coins según nuevo rango
    v_ml_coins_bonus := CASE p_new_rank
        WHEN 'Nacom' THEN 50
        WHEN 'Ah K''in' THEN 100
        WHEN 'Halach Uinic' THEN 200
        WHEN 'K''uk''ulkan' THEN 500
        ELSE 0
    END;

    -- 1. Actualizar current_rank en user_stats
    UPDATE gamification_system.user_stats
    SET
        current_rank = p_new_rank,
        previous_rank = v_old_rank,
        rank_achieved_at = NOW(),
        ml_coins = ml_coins + v_ml_coins_bonus,
        updated_at = NOW()
    WHERE user_id = p_user_id;

    -- 2. Crear achievement rank_promotion
    INSERT INTO gamification_system.user_achievements (
        user_id,
        achievement_code,
        unlocked_at,
        metadata
    ) VALUES (
        p_user_id,
        'RANK_PROMOTION_' || UPPER(REPLACE(p_new_rank::TEXT, ' ', '_')),
        NOW(),
        jsonb_build_object(
            'old_rank', v_old_rank,
            'new_rank', p_new_rank,
            'xp_at_promotion', v_total_xp,
            'days_in_old_rank', v_days_in_old_rank
        )
    )
    RETURNING id INTO v_achievement_id;

    -- 3. Registrar en rank_history
    INSERT INTO gamification_system.rank_history (
        user_id,
        old_rank,
        new_rank,
        xp_at_promotion,
        days_in_old_rank,
        promoted_at,
        achievement_id
    ) VALUES (
        p_user_id,
        v_old_rank,
        p_new_rank,
        v_total_xp,
        v_days_in_old_rank,
        NOW(),
        v_achievement_id
    );

    -- 4. Crear notificación rank_up
    INSERT INTO gamification_system.notifications (
        user_id,
        notification_type,
        priority,
        title,
        body,
        data,
        created_at,
        expires_at
    ) VALUES (
        p_user_id,
        'rank_up',
        'high',
        '¡Ascendiste a ' || p_new_rank || '!',
        'Has alcanzado el rango ' || p_new_rank || '. +' || v_ml_coins_bonus || ' ML Coins bonus.',
        jsonb_build_object(
            'old_rank', v_old_rank,
            'new_rank', p_new_rank,
            'xp_at_promotion', v_total_xp,
            'bonus_coins', v_ml_coins_bonus
        ),
        NOW(),
        NOW() + INTERVAL '7 days'
    );

    -- 5. Log en auditoría
    INSERT INTO audit_logging.audit_logs (
        user_id,
        action,
        resource_type,
        resource_id,
        details,
        severity
    ) VALUES (
        p_user_id,
        'rank_promotion',
        'maya_rank',
        p_new_rank::TEXT,
        jsonb_build_object(
            'old_rank', v_old_rank,
            'new_rank', p_new_rank,
            'xp', v_total_xp,
            'days_in_old_rank', v_days_in_old_rank,
            'ml_coins_bonus', v_ml_coins_bonus
        ),
        'info'
    );

    RAISE NOTICE 'Usuario % promovido de % a % con % XP',
        p_user_id, v_old_rank, p_new_rank, v_total_xp;
END;
$$;

COMMENT ON FUNCTION gamification_system.promote_to_next_rank IS
'Promueve un usuario al siguiente rango.
Efectos secundarios:
- Actualiza current_rank en user_stats
- Crea achievement rank_promotion
- Registra en rank_history (inmutable)
- Otorga ML Coins bonus
- Envía notificación rank_up
- Registra en audit_logs';
```

### 5. Función: get_rank_benefits

```sql
-- apps/database/ddl/schemas/gamification_system/functions/get_rank_benefits.sql

CREATE OR REPLACE FUNCTION gamification_system.get_rank_benefits(
    p_rank gamification_system.maya_rank
)
RETURNS JSONB
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
    RETURN CASE p_rank
        WHEN 'Ajaw' THEN jsonb_build_object(
            'rank', 'Ajaw',
            'xp_multiplier', 1.0,
            'max_difficulty_access', 'medium',
            'can_create_study_groups', false,
            'can_be_tutor', false,
            'can_create_classrooms', false,
            'can_contribute_exercises', false,
            'avatar_frame', null,
            'special_badge', false
        )

        WHEN 'Nacom' THEN jsonb_build_object(
            'rank', 'Nacom',
            'xp_multiplier', 1.05,
            'max_difficulty_access', 'hard',
            'can_create_study_groups', true,
            'can_be_tutor', false,
            'can_create_classrooms', false,
            'can_contribute_exercises', false,
            'avatar_frame', 'nacom_basic',
            'special_badge', false
        )

        WHEN 'Ah K''in' THEN jsonb_build_object(
            'rank', 'Ah K''in',
            'xp_multiplier', 1.10,
            'max_difficulty_access', 'expert',
            'can_create_study_groups', true,
            'can_be_tutor', true,
            'can_create_classrooms', false,
            'can_contribute_exercises', false,
            'avatar_frame', 'ah_kin_golden',
            'special_badge', false
        )

        WHEN 'Halach Uinic' THEN jsonb_build_object(
            'rank', 'Halach Uinic',
            'xp_multiplier', 1.15,
            'max_difficulty_access', 'mastery',
            'can_create_study_groups', true,
            'can_be_tutor', true,
            'can_create_classrooms', true,
            'can_contribute_exercises', false,
            'avatar_frame', 'halach_uinic_animated',
            'special_badge', true
        )

        WHEN 'K''uk''ulkan' THEN jsonb_build_object(
            'rank', 'K''uk''ulkan',
            'xp_multiplier', 1.20,
            'max_difficulty_access', 'all',
            'can_create_study_groups', true,
            'can_be_tutor', true,
            'can_create_classrooms', true,
            'can_contribute_exercises', true,
            'avatar_frame', 'kukulkan_epic',
            'special_badge', true,
            'private_community_access', true
        )
    END;
END;
$$;

COMMENT ON FUNCTION gamification_system.get_rank_benefits IS
'Retorna JSONB con todos los beneficios del rango especificado.
Función IMMUTABLE para caching óptimo.';
```

### 6. Función: get_rank_multiplier

```sql
-- apps/database/ddl/schemas/gamification_system/functions/get_rank_multiplier.sql

CREATE OR REPLACE FUNCTION gamification_system.get_rank_multiplier(
    p_rank gamification_system.maya_rank
)
RETURNS NUMERIC(4,2)
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
    RETURN CASE p_rank
        WHEN 'Ajaw' THEN 1.00
        WHEN 'Nacom' THEN 1.05
        WHEN 'Ah K''in' THEN 1.10
        WHEN 'Halach Uinic' THEN 1.15
        WHEN 'K''uk''ulkan' THEN 1.20
    END;
END;
$$;

COMMENT ON FUNCTION gamification_system.get_rank_multiplier IS
'Retorna el multiplicador de XP para el rango especificado.
Usado al completar ejercicios para aplicar bonus.
Ejemplo: Nacom completa ejercicio de 20 XP → 20 * 1.05 = 21 XP';
```

### 7. Trigger: trg_check_rank_promotion_on_xp_gain

```sql
-- apps/database/ddl/schemas/gamification_system/triggers/trg_check_rank_promotion.sql

CREATE OR REPLACE FUNCTION gamification_system.fn_check_rank_promotion_trigger()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Solo verificar si total_xp aumentó
    IF NEW.total_xp > OLD.total_xp THEN
        PERFORM gamification_system.check_rank_promotion(NEW.user_id);
    END IF;

    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_check_rank_promotion_on_xp_gain
    AFTER UPDATE OF total_xp
    ON gamification_system.user_stats
    FOR EACH ROW
    WHEN (NEW.total_xp > OLD.total_xp)
    EXECUTE FUNCTION gamification_system.fn_check_rank_promotion_trigger();

COMMENT ON TRIGGER trg_check_rank_promotion_on_xp_gain
ON gamification_system.user_stats IS
'Trigger automático que verifica y ejecuta promociones de rango
cuando el total_xp de un usuario aumenta.';
```

---

## 💻 Implementación Backend (NestJS)

### 1. Enum: MayaRankEnum

```typescript
// apps/backend/src/modules/gamification/enums/maya-rank.enum.ts

export enum MayaRankEnum {
  AJAW = 'Ajaw',
  NACOM = 'Nacom',
  AH_KIN = "Ah K'in",
  HALACH_UINIC = 'Halach Uinic',
  KUKULKAN = "K'uk'ulkan",
}

export const RANK_ORDER = [
  MayaRankEnum.AJAW,
  MayaRankEnum.NACOM,
  MayaRankEnum.AH_KIN,
  MayaRankEnum.HALACH_UINIC,
  MayaRankEnum.KUKULKAN,
];

export const RANK_THRESHOLDS: Record<MayaRankEnum, { min: number; max: number | null }> = {
  [MayaRankEnum.AJAW]: { min: 0, max: 999 },
  [MayaRankEnum.NACOM]: { min: 1000, max: 4999 },
  [MayaRankEnum.AH_KIN]: { min: 5000, max: 19999 },
  [MayaRankEnum.HALACH_UINIC]: { min: 20000, max: 99999 },
  [MayaRankEnum.KUKULKAN]: { min: 100000, max: null }, // Sin límite superior
};

export const RANK_MULTIPLIERS: Record<MayaRankEnum, number> = {
  [MayaRankEnum.AJAW]: 1.0,
  [MayaRankEnum.NACOM]: 1.05,
  [MayaRankEnum.AH_KIN]: 1.1,
  [MayaRankEnum.HALACH_UINIC]: 1.15,
  [MayaRankEnum.KUKULKAN]: 1.2,
};
```

### 2. Interface: RankBenefits

```typescript
// apps/backend/src/modules/gamification/interfaces/rank-benefits.interface.ts

export interface RankBenefits {
  rank: MayaRankEnum;
  xp_multiplier: number;
  max_difficulty_access: 'easy' | 'medium' | 'hard' | 'expert' | 'mastery' | 'all';
  can_create_study_groups: boolean;
  can_be_tutor: boolean;
  can_create_classrooms: boolean;
  can_contribute_exercises: boolean;
  avatar_frame: string | null;
  special_badge: boolean;
  private_community_access?: boolean;
}

export interface RankHistory {
  id: string;
  user_id: string;
  old_rank: MayaRankEnum;
  new_rank: MayaRankEnum;
  xp_at_promotion: number;
  days_in_old_rank: number | null;
  promoted_at: Date;
  achievement_id: string | null;
}

export interface RankProgress {
  current_rank: MayaRankEnum;
  current_xp: number;
  next_rank: MayaRankEnum | null;
  xp_to_next_rank: number | null;
  progress_percentage: number;
  is_max_rank: boolean;
}
```

### 3. Service: RankService

```typescript
// apps/backend/src/modules/gamification/services/rank.service.ts

import { Injectable, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  MayaRankEnum,
  RANK_ORDER,
  RANK_THRESHOLDS,
  RANK_MULTIPLIERS
} from '../enums/maya-rank.enum';
import { RankBenefits, RankHistory, RankProgress } from '../interfaces/rank-benefits.interface';

@Injectable()
export class RankService {
  constructor(
    @InjectRepository(UserStats)
    private readonly userStatsRepo: Repository<UserStats>,

    @InjectRepository(RankHistoryEntity)
    private readonly rankHistoryRepo: Repository<RankHistoryEntity>,
  ) {}

  /**
   * Obtiene el rango actual de un usuario desde la base de datos
   */
  async getCurrentRank(userId: string): Promise<MayaRankEnum> {
    const userStats = await this.userStatsRepo.findOne({
      where: { user_id: userId },
      select: ['current_rank'],
    });

    if (!userStats) {
      throw new Error(`User stats not found for user ${userId}`);
    }

    return userStats.current_rank as MayaRankEnum;
  }

  /**
   * Obtiene los beneficios del rango desde la función SQL
   */
  async getRankBenefits(rank: MayaRankEnum): Promise<RankBenefits> {
    const result = await this.userStatsRepo.query(
      'SELECT gamification_system.get_rank_benefits($1) as benefits',
      [rank]
    );

    return result[0]?.benefits || null;
  }

  /**
   * Calcula el progreso hacia el próximo rango
   */
  async getRankProgress(userId: string): Promise<RankProgress> {
    const userStats = await this.userStatsRepo.findOne({
      where: { user_id: userId },
      select: ['current_rank', 'total_xp'],
    });

    if (!userStats) {
      throw new Error(`User stats not found for user ${userId}`);
    }

    const currentRank = userStats.current_rank as MayaRankEnum;
    const currentXP = userStats.total_xp;

    // Encontrar índice del rango actual
    const currentRankIndex = RANK_ORDER.indexOf(currentRank);

    // Verificar si es el rango máximo
    const isMaxRank = currentRankIndex === RANK_ORDER.length - 1;

    if (isMaxRank) {
      return {
        current_rank: currentRank,
        current_xp: currentXP,
        next_rank: null,
        xp_to_next_rank: null,
        progress_percentage: 100,
        is_max_rank: true,
      };
    }

    // Próximo rango
    const nextRank = RANK_ORDER[currentRankIndex + 1];
    const nextThreshold = RANK_THRESHOLDS[nextRank].min;
    const currentThreshold = RANK_THRESHOLDS[currentRank].min;

    // Calcular progreso
    const xpInCurrentRank = currentXP - currentThreshold;
    const xpNeededForNextRank = nextThreshold - currentThreshold;
    const progressPercentage = Math.min(
      100,
      Math.floor((xpInCurrentRank / xpNeededForNextRank) * 100)
    );

    return {
      current_rank: currentRank,
      current_xp: currentXP,
      next_rank: nextRank,
      xp_to_next_rank: nextThreshold - currentXP,
      progress_percentage: progressPercentage,
      is_max_rank: false,
    };
  }

  /**
   * Obtiene el historial completo de promociones de un usuario
   */
  async getRankHistory(userId: string): Promise<RankHistory[]> {
    const history = await this.rankHistoryRepo.find({
      where: { user_id: userId },
      order: { promoted_at: 'ASC' },
    });

    return history.map(record => ({
      id: record.id,
      user_id: record.user_id,
      old_rank: record.old_rank as MayaRankEnum,
      new_rank: record.new_rank as MayaRankEnum,
      xp_at_promotion: record.xp_at_promotion,
      days_in_old_rank: record.days_in_old_rank,
      promoted_at: record.promoted_at,
      achievement_id: record.achievement_id,
    }));
  }

  /**
   * Verifica si un usuario tiene acceso a contenido según su rango
   * IMPORTANTE: Siempre consultar rango desde DB, nunca confiar en frontend
   */
  async checkContentAccess(
    userId: string,
    requiredRank: MayaRankEnum
  ): Promise<boolean> {
    const currentRank = await this.getCurrentRank(userId);

    const currentRankIndex = RANK_ORDER.indexOf(currentRank);
    const requiredRankIndex = RANK_ORDER.indexOf(requiredRank);

    if (currentRankIndex < requiredRankIndex) {
      throw new ForbiddenException(
        `Content requires rank ${requiredRank} or higher. Current rank: ${currentRank}`
      );
    }

    return true;
  }

  /**
   * Obtiene el multiplicador de XP para un rango
   */
  getXPMultiplier(rank: MayaRankEnum): number {
    return RANK_MULTIPLIERS[rank];
  }

  /**
   * Calcula XP ajustado por multiplicador de rango
   */
  async calculateAdjustedXP(userId: string, baseXP: number): Promise<number> {
    const currentRank = await this.getCurrentRank(userId);
    const multiplier = this.getXPMultiplier(currentRank);

    return Math.floor(baseXP * multiplier);
  }

  /**
   * Verifica si un usuario puede realizar una acción según su rango
   */
  async canPerformAction(
    userId: string,
    action: keyof RankBenefits
  ): Promise<boolean> {
    const currentRank = await this.getCurrentRank(userId);
    const benefits = await this.getRankBenefits(currentRank);

    return benefits[action] === true;
  }

  /**
   * Obtiene estadísticas de distribución de rangos (para analytics)
   */
  async getRankDistribution(): Promise<Record<MayaRankEnum, number>> {
    const result = await this.userStatsRepo
      .createQueryBuilder('stats')
      .select('stats.current_rank', 'rank')
      .addSelect('COUNT(*)', 'count')
      .groupBy('stats.current_rank')
      .getRawMany();

    const distribution: Record<string, number> = {};

    result.forEach(row => {
      distribution[row.rank] = parseInt(row.count, 10);
    });

    return distribution as Record<MayaRankEnum, number>;
  }
}
```

### 4. Controller: RankController

```typescript
// apps/backend/src/modules/gamification/controllers/rank.controller.ts

import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { RankService } from '../services/rank.service';
import { MayaRankEnum } from '../enums/maya-rank.enum';

@Controller('ranks')
@UseGuards(JwtAuthGuard)
export class RankController {
  constructor(private readonly rankService: RankService) {}

  /**
   * GET /ranks/me
   * Obtiene el rango actual del usuario autenticado
   */
  @Get('me')
  async getMyRank(@CurrentUser('id') userId: string) {
    const rank = await this.rankService.getCurrentRank(userId);
    const benefits = await this.rankService.getRankBenefits(rank);

    return {
      current_rank: rank,
      benefits,
    };
  }

  /**
   * GET /ranks/me/progress
   * Obtiene el progreso hacia el próximo rango
   */
  @Get('me/progress')
  async getMyProgress(@CurrentUser('id') userId: string) {
    return this.rankService.getRankProgress(userId);
  }

  /**
   * GET /ranks/me/history
   * Obtiene el historial de promociones del usuario
   */
  @Get('me/history')
  async getMyHistory(@CurrentUser('id') userId: string) {
    return this.rankService.getRankHistory(userId);
  }

  /**
   * GET /ranks/benefits/:rank
   * Obtiene los beneficios de un rango específico
   */
  @Get('benefits/:rank')
  async getRankBenefits(@Param('rank') rank: MayaRankEnum) {
    return this.rankService.getRankBenefits(rank);
  }

  /**
   * GET /ranks/distribution
   * Obtiene distribución de rangos (para analytics)
   * TODO: Restringir a admin/analytics roles
   */
  @Get('distribution')
  async getRankDistribution() {
    return this.rankService.getRankDistribution();
  }
}
```

---

## 🎨 Implementación Frontend (React)

### 1. Hook: useRankProgress

```typescript
// apps/frontend/src/hooks/useRankProgress.ts

import { useQuery } from '@tanstack/react-query';
import { rankApi } from '../api/rank.api';

export interface RankProgress {
  current_rank: string;
  current_xp: number;
  next_rank: string | null;
  xp_to_next_rank: number | null;
  progress_percentage: number;
  is_max_rank: boolean;
}

export function useRankProgress() {
  return useQuery<RankProgress>({
    queryKey: ['rank', 'progress'],
    queryFn: () => rankApi.getMyProgress(),
    staleTime: 30000, // 30 segundos
  });
}
```

### 2. Component: RankBadge

```tsx
// apps/frontend/src/components/gamification/RankBadge.tsx

import React from 'react';
import { MayaRankEnum } from '../../types/maya-rank';

interface RankBadgeProps {
  rank: MayaRankEnum;
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
}

const RANK_ICONS: Record<MayaRankEnum, string> = {
  [MayaRankEnum.AJAW]: '🌱',
  [MayaRankEnum.NACOM]: '⚔️',
  [MayaRankEnum.AH_KIN]: '☀️',
  [MayaRankEnum.HALACH_UINIC]: '👑',
  [MayaRankEnum.KUKULKAN]: '🐉',
};

const RANK_COLORS: Record<MayaRankEnum, string> = {
  [MayaRankEnum.AJAW]: 'bg-gray-100 text-gray-700',
  [MayaRankEnum.NACOM]: 'bg-blue-100 text-blue-700',
  [MayaRankEnum.AH_KIN]: 'bg-yellow-100 text-yellow-700',
  [MayaRankEnum.HALACH_UINIC]: 'bg-purple-100 text-purple-700',
  [MayaRankEnum.KUKULKAN]: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white',
};

export const RankBadge: React.FC<RankBadgeProps> = ({
  rank,
  size = 'medium',
  showLabel = true
}) => {
  const sizeClasses = {
    small: 'w-8 h-8 text-xs',
    medium: 'w-12 h-12 text-sm',
    large: 'w-16 h-16 text-base',
  };

  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={`
          ${sizeClasses[size]}
          ${RANK_COLORS[rank]}
          rounded-full
          flex items-center justify-center
          font-bold
          shadow-md
          transition-transform hover:scale-110
        `}
      >
        <span className="text-2xl">{RANK_ICONS[rank]}</span>
      </div>
      {showLabel && (
        <span className="text-xs font-medium text-gray-600">
          {rank}
        </span>
      )}
    </div>
  );
};
```

### 3. Component: RankProgressBar

```tsx
// apps/frontend/src/components/gamification/RankProgressBar.tsx

import React from 'react';
import { useRankProgress } from '../../hooks/useRankProgress';
import { RankBadge } from './RankBadge';
import { MayaRankEnum } from '../../types/maya-rank';

export const RankProgressBar: React.FC = () => {
  const { data: progress, isLoading } = useRankProgress();

  if (isLoading) {
    return <div className="animate-pulse bg-gray-200 h-20 rounded-lg" />;
  }

  if (!progress) return null;

  const {
    current_rank,
    current_xp,
    next_rank,
    xp_to_next_rank,
    progress_percentage,
    is_max_rank
  } = progress;

  return (
    <div className="bg-white rounded-lg shadow p-4 space-y-3">
      {/* Header con badges de rangos */}
      <div className="flex items-center justify-between">
        <RankBadge rank={current_rank as MayaRankEnum} size="small" />

        {!is_max_rank && next_rank && (
          <>
            <div className="flex-1 px-2">
              <div className="h-px bg-gray-300" />
            </div>
            <RankBadge rank={next_rank as MayaRankEnum} size="small" />
          </>
        )}
      </div>

      {/* Barra de progreso */}
      {!is_max_rank ? (
        <>
          <div className="relative">
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
                style={{ width: `${progress_percentage}%` }}
              />
            </div>
            <span className="absolute right-0 top-4 text-xs text-gray-600">
              {progress_percentage}%
            </span>
          </div>

          {/* Información de XP */}
          <div className="flex justify-between text-sm text-gray-600">
            <span>{current_xp.toLocaleString()} XP</span>
            <span className="font-medium">
              {xp_to_next_rank?.toLocaleString()} XP para {next_rank}
            </span>
          </div>
        </>
      ) : (
        <div className="text-center py-2">
          <p className="text-sm font-medium text-purple-600">
            🎉 ¡Has alcanzado el rango máximo!
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {current_xp.toLocaleString()} XP total
          </p>
        </div>
      )}
    </div>
  );
};
```

### 4. Component: RankPromotionModal

```tsx
// apps/frontend/src/components/gamification/RankPromotionModal.tsx

import React, { useEffect, useState } from 'react';
import { MayaRankEnum } from '../../types/maya-rank';
import { RankBadge } from './RankBadge';

interface RankPromotionModalProps {
  isOpen: boolean;
  oldRank: MayaRankEnum;
  newRank: MayaRankEnum;
  bonusCoins: number;
  onClose: () => void;
}

export const RankPromotionModal: React.FC<RankPromotionModalProps> = ({
  isOpen,
  oldRank,
  newRank,
  bonusCoins,
  onClose,
}) => {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShowConfetti(true);
      // Auto-cerrar después de 5 segundos si usuario no cierra
      const timer = setTimeout(() => {
        onClose();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      {/* Confetti animation */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none">
          {/* Simular confetti con divs animados */}
          {Array.from({ length: 50 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-yellow-400 rounded-full animate-ping"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 space-y-6 animate-bounce-in">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-purple-600 mb-2">
            ¡PROMOCIÓN!
          </h2>
          <p className="text-gray-600">Has ascendido de rango</p>
        </div>

        {/* Rank transition */}
        <div className="flex items-center justify-center gap-6 py-4">
          <RankBadge rank={oldRank} size="medium" />
          <div className="text-2xl">→</div>
          <RankBadge rank={newRank} size="large" />
        </div>

        {/* New rank name */}
        <div className="text-center">
          <h3 className="text-2xl font-bold text-gray-800 mb-1">
            {newRank}
          </h3>
          <p className="text-sm text-gray-600">
            {getRankTitle(newRank)}
          </p>
        </div>

        {/* Rewards */}
        <div className="bg-purple-50 rounded-lg p-4 space-y-2">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🎁</span>
            <span className="text-sm font-medium">
              +{bonusCoins} ML Coins
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚡</span>
            <span className="text-sm font-medium">
              +{getRankBonusPercentage(newRank)}% Bonus XP
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-2xl">🏅</span>
            <span className="text-sm font-medium">
              Achievement desbloqueado
            </span>
          </div>
        </div>

        {/* Action button */}
        <button
          onClick={onClose}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-3 rounded-lg hover:opacity-90 transition-opacity"
        >
          ¡Continuar!
        </button>
      </div>
    </div>
  );
};

function getRankTitle(rank: MayaRankEnum): string {
  const titles: Record<MayaRankEnum, string> = {
    [MayaRankEnum.AJAW]: 'Señor del Conocimiento',
    [MayaRankEnum.NACOM]: 'Capitán Guerrero',
    [MayaRankEnum.AH_KIN]: 'Sacerdote del Sol',
    [MayaRankEnum.HALACH_UINIC]: 'Hombre Verdadero',
    [MayaRankEnum.KUKULKAN]: 'Serpiente Emplumada',
  };
  return titles[rank];
}

function getRankBonusPercentage(rank: MayaRankEnum): number {
  const bonuses: Record<MayaRankEnum, number> = {
    [MayaRankEnum.AJAW]: 0,
    [MayaRankEnum.NACOM]: 5,
    [MayaRankEnum.AH_KIN]: 10,
    [MayaRankEnum.HALACH_UINIC]: 15,
    [MayaRankEnum.KUKULKAN]: 20,
  };
  return bonuses[rank];
}
```

### 5. Component: RankHistoryTimeline

```tsx
// apps/frontend/src/components/gamification/RankHistoryTimeline.tsx

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { rankApi } from '../../api/rank.api';
import { RankBadge } from './RankBadge';
import { MayaRankEnum } from '../../types/maya-rank';

export const RankHistoryTimeline: React.FC = () => {
  const { data: history, isLoading } = useQuery({
    queryKey: ['rank', 'history'],
    queryFn: () => rankApi.getMyHistory(),
  });

  if (isLoading) {
    return <div className="animate-pulse space-y-4">
      {[1, 2, 3].map(i => (
        <div key={i} className="bg-gray-200 h-20 rounded" />
      ))}
    </div>;
  }

  if (!history || history.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>Aún no has sido promovido.</p>
        <p className="text-sm mt-1">¡Sigue aprendiendo para ascender de rango!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-gray-800 mb-4">
        📜 Tu Camino Maya
      </h3>

      <div className="relative pl-8 space-y-6">
        {/* Línea vertical */}
        <div className="absolute left-4 top-0 bottom-0 w-px bg-gray-300" />

        {/* Rank actual (primero, de forma invertida) */}
        {history.length > 0 && (
          <div className="relative">
            <div className="absolute left-[-2rem] top-2">
              <RankBadge
                rank={history[history.length - 1].new_rank as MayaRankEnum}
                size="small"
                showLabel={false}
              />
            </div>
            <div className="bg-purple-50 rounded-lg p-4 border-2 border-purple-500">
              <div className="flex items-center justify-between">
                <span className="font-bold text-purple-600">
                  {history[history.length - 1].new_rank} (actual)
                </span>
                <span className="text-sm text-gray-600">
                  {new Date(history[history.length - 1].promoted_at).toLocaleDateString()}
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {history[history.length - 1].xp_at_promotion.toLocaleString()} XP
              </p>
            </div>
          </div>
        )}

        {/* Promociones anteriores (en orden inverso) */}
        {[...history].reverse().slice(1).map((record, index) => (
          <div key={record.id} className="relative">
            <div className="absolute left-[-2rem] top-2">
              <RankBadge
                rank={record.new_rank as MayaRankEnum}
                size="small"
                showLabel={false}
              />
            </div>
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-700">
                  {record.new_rank}
                </span>
                <span className="text-sm text-gray-500">
                  {new Date(record.promoted_at).toLocaleDateString()}
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {record.xp_at_promotion.toLocaleString()} XP
              </p>
              {record.days_in_old_rank && (
                <p className="text-xs text-gray-500 mt-1">
                  {record.days_in_old_rank} días en {record.old_rank}
                </p>
              )}
            </div>
          </div>
        ))}

        {/* Inicio (Ajaw) */}
        <div className="relative">
          <div className="absolute left-[-2rem] top-2">
            <RankBadge
              rank={MayaRankEnum.AJAW}
              size="small"
              showLabel={false}
            />
          </div>
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-700">Ajaw (inicio)</span>
              <span className="text-sm text-gray-500">0 XP</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
```

---

## 🧪 Test Cases

### Test Case 1: Promoción Automática de Ajaw a Nacom

```typescript
describe('Rank System - Promotion from Ajaw to Nacom', () => {
  it('should promote user from Ajaw to Nacom when reaching 1000 XP', async () => {
    // Arrange
    const user = await createTestUser({
      current_rank: 'Ajaw',
      total_xp: 990,
      ml_coins: 100,
    });

    // Act - Complete exercise that gives 15 XP
    await completeExercise(user.id, {
      exercise_id: 'test-exercise-1',
      base_xp: 15,
    });

    // Assert - User should be promoted
    const updatedUser = await getUserStats(user.id);
    expect(updatedUser.current_rank).toBe('Nacom');
    expect(updatedUser.total_xp).toBe(1005); // 990 + 15
    expect(updatedUser.ml_coins).toBe(150); // 100 + 50 bonus

    // Verify achievement was created
    const achievements = await getUserAchievements(user.id);
    const rankAchievement = achievements.find(
      a => a.achievement_code === 'RANK_PROMOTION_NACOM'
    );
    expect(rankAchievement).toBeDefined();
    expect(rankAchievement.metadata.old_rank).toBe('Ajaw');
    expect(rankAchievement.metadata.new_rank).toBe('Nacom');

    // Verify rank_history record
    const history = await getRankHistory(user.id);
    expect(history).toHaveLength(1);
    expect(history[0].old_rank).toBe('Ajaw');
    expect(history[0].new_rank).toBe('Nacom');
    expect(history[0].xp_at_promotion).toBe(1005);

    // Verify notification was sent
    const notifications = await getNotifications(user.id);
    const rankNotif = notifications.find(n => n.notification_type === 'rank_up');
    expect(rankNotif).toBeDefined();
    expect(rankNotif.data.new_rank).toBe('Nacom');
    expect(rankNotif.data.bonus_coins).toBe(50);
  });

  it('should NOT promote if below threshold', async () => {
    // Arrange
    const user = await createTestUser({
      current_rank: 'Ajaw',
      total_xp: 950,
    });

    // Act
    await completeExercise(user.id, { base_xp: 30 });

    // Assert
    const updatedUser = await getUserStats(user.id);
    expect(updatedUser.current_rank).toBe('Ajaw'); // Still Ajaw
    expect(updatedUser.total_xp).toBe(980); // Not enough

    const history = await getRankHistory(user.id);
    expect(history).toHaveLength(0); // No promotion
  });
});
```

### Test Case 2: Multiplicador de XP por Rango

```typescript
describe('Rank System - XP Multiplier', () => {
  it('should apply +5% XP bonus for Nacom rank', async () => {
    // Arrange
    const user = await createTestUser({
      current_rank: 'Nacom',
      total_xp: 2000,
    });

    const exercise = await createTestExercise({ base_xp: 20 });

    // Act
    const result = await completeExercise(user.id, exercise.id);

    // Assert
    expect(result.xp_earned).toBe(21); // 20 * 1.05 = 21

    const updatedUser = await getUserStats(user.id);
    expect(updatedUser.total_xp).toBe(2021); // 2000 + 21
  });

  it('should apply +20% XP bonus for K\'uk\'ulkan rank', async () => {
    // Arrange
    const user = await createTestUser({
      current_rank: "K'uk'ulkan",
      total_xp: 150000,
    });

    // Act
    const result = await completeExercise(user.id, { base_xp: 50 });

    // Assert
    expect(result.xp_earned).toBe(60); // 50 * 1.20 = 60
  });
});
```

### Test Case 3: Restricción de Acceso por Rango

```typescript
describe('Rank System - Content Access Control', () => {
  it('should block Ajaw from accessing hard content', async () => {
    // Arrange
    const user = await createTestUser({ current_rank: 'Ajaw' });
    const hardExercise = await createTestExercise({
      difficulty: 'hard',
      required_rank: 'Nacom',
    });

    // Act & Assert
    await expect(
      accessExercise(user.id, hardExercise.id)
    ).rejects.toThrow('Content requires rank Nacom or higher');
  });

  it('should allow Nacom to access hard content', async () => {
    // Arrange
    const user = await createTestUser({ current_rank: 'Nacom' });
    const hardExercise = await createTestExercise({
      difficulty: 'hard',
      required_rank: 'Nacom',
    });

    // Act
    const result = await accessExercise(user.id, hardExercise.id);

    // Assert
    expect(result.allowed).toBe(true);
  });

  it('should allow higher ranks to access lower rank content', async () => {
    // Arrange
    const user = await createTestUser({ current_rank: "K'uk'ulkan" });
    const easyExercise = await createTestExercise({
      difficulty: 'easy',
      required_rank: 'Ajaw',
    });

    // Act
    const result = await accessExercise(user.id, easyExercise.id);

    // Assert
    expect(result.allowed).toBe(true);
  });
});
```

### Test Case 4: K'uk'ulkan No Promociona Más

```typescript
describe('Rank System - Max Rank Behavior', () => {
  it('should NOT promote beyond K\'uk\'ulkan (max rank)', async () => {
    // Arrange
    const user = await createTestUser({
      current_rank: "K'uk'ulkan",
      total_xp: 150000,
    });

    // Act - Gain massive XP
    await giveXP(user.id, 100000);

    // Assert
    const updatedUser = await getUserStats(user.id);
    expect(updatedUser.current_rank).toBe("K'uk'ulkan"); // Still max
    expect(updatedUser.total_xp).toBe(250000); // XP continues accumulating

    // No new promotion in history
    const history = await getRankHistory(user.id);
    const latestPromotion = history[history.length - 1];
    expect(latestPromotion.new_rank).toBe("K'uk'ulkan");
  });

  it('should return is_max_rank=true for K\'uk\'ulkan progress', async () => {
    // Arrange
    const user = await createTestUser({ current_rank: "K'uk'ulkan" });

    // Act
    const progress = await rankService.getRankProgress(user.id);

    // Assert
    expect(progress.is_max_rank).toBe(true);
    expect(progress.next_rank).toBeNull();
    expect(progress.xp_to_next_rank).toBeNull();
    expect(progress.progress_percentage).toBe(100);
  });
});
```

### Test Case 5: Promoción Múltiple en Cadena

```typescript
describe('Rank System - Multiple Promotions', () => {
  it('should promote through multiple ranks sequentially', async () => {
    // Arrange
    const user = await createTestUser({
      current_rank: 'Ajaw',
      total_xp: 0,
    });

    // Act - Give enough XP for Ah K'in (5,000 XP)
    await giveXP(user.id, 5500);

    // Assert - Should be at Ah K'in, passing through Nacom
    const updatedUser = await getUserStats(user.id);
    expect(updatedUser.current_rank).toBe("Ah K'in");

    // Verify history has 2 entries (Ajaw→Nacom, Nacom→Ah K'in)
    const history = await getRankHistory(user.id);
    expect(history).toHaveLength(2);

    expect(history[0].old_rank).toBe('Ajaw');
    expect(history[0].new_rank).toBe('Nacom');
    expect(history[0].xp_at_promotion).toBeGreaterThanOrEqual(1000);

    expect(history[1].old_rank).toBe('Nacom');
    expect(history[1].new_rank).toBe("Ah K'in");
    expect(history[1].xp_at_promotion).toBeGreaterThanOrEqual(5000);
  });
});
```

### Test Case 6: Historial Inmutable

```typescript
describe('Rank System - Immutable History', () => {
  it('should prevent direct modification of rank_history', async () => {
    // Arrange
    const user = await createTestUser({ current_rank: 'Nacom' });
    const history = await getRankHistory(user.id);
    const recordId = history[0].id;

    // Act & Assert
    await expect(
      db.query(
        'UPDATE gamification_system.rank_history SET new_rank = $1 WHERE id = $2',
        ["K'uk'ulkan", recordId]
      )
    ).rejects.toThrow(); // RLS policy should block
  });

  it('should record days_in_old_rank correctly', async () => {
    // Arrange
    const user = await createTestUser({
      current_rank: 'Ajaw',
      total_xp: 900,
      rank_achieved_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    });

    // Act - Promote after 30 days
    await giveXP(user.id, 200); // Now at 1100 XP, promotes to Nacom

    // Assert
    const history = await getRankHistory(user.id);
    expect(history[0].days_in_old_rank).toBeCloseTo(30, 0);
  });
});
```

---

## 📊 Diagramas

### Diagrama 1: Arquitectura del Sistema de Rangos

```
┌─────────────────────────────────────────────────────────────────┐
│                     SISTEMA DE RANGOS MAYA                      │
└─────────────────────────────────────────────────────────────────┘

┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│   Frontend   │         │   Backend    │         │  PostgreSQL  │
│   (React)    │         │  (NestJS)    │         │              │
└──────┬───────┘         └──────┬───────┘         └──────┬───────┘
       │                        │                        │
       │ GET /ranks/me/progress │                        │
       │───────────────────────>│                        │
       │                        │ SELECT current_rank,   │
       │                        │        total_xp        │
       │                        │───────────────────────>│
       │                        │                        │
       │                        │<───────────────────────│
       │                        │ Ajaw, 950 XP           │
       │                        │                        │
       │<───────────────────────│                        │
       │ { progress: 95% }      │                        │
       │                        │                        │
       │                        │                        │
       │ Complete Exercise      │                        │
       │───────────────────────>│                        │
       │                        │ UPDATE total_xp        │
       │                        │ SET total_xp = 1005    │
       │                        │───────────────────────>│
       │                        │                        │
       │                        │     ⚡ TRIGGER!       │
       │                        │  trg_check_rank_       │
       │                        │  promotion_on_xp_gain  │
       │                        │                        │
       │                        │  ┌─────────────────┐   │
       │                        │  │ check_rank_     │   │
       │                        │  │ promotion()     │   │
       │                        │  │   ↓             │   │
       │                        │  │ 1005 >= 1000?   │   │
       │                        │  │   ✓ YES         │   │
       │                        │  │   ↓             │   │
       │                        │  │ promote_to_next_│   │
       │                        │  │ _rank('Nacom')  │   │
       │                        │  └─────────────────┘   │
       │                        │                        │
       │                        │  1. UPDATE current_rank│
       │                        │  2. CREATE achievement │
       │                        │  3. INSERT rank_history│
       │                        │  4. UPDATE ml_coins    │
       │                        │  5. CREATE notification│
       │                        │                        │
       │                        │<───────────────────────│
       │                        │ Promotion complete     │
       │                        │                        │
       │ WebSocket: rank_up     │                        │
       │<───────────────────────│                        │
       │                        │                        │
       │ [Show Modal]           │                        │
       │ ⚔️ ¡Promoción a Nacom! │                        │
       │                        │                        │
```

### Diagrama 2: Flujo de Promoción de Rango

```
┌─────────────────────────────────────────────────────────────┐
│            FLUJO DE PROMOCIÓN AUTOMÁTICA                    │
└─────────────────────────────────────────────────────────────┘

    [Usuario completa ejercicio]
                ↓
    ┌───────────────────────┐
    │ Calcular XP a otorgar │
    │ base_xp * multiplier  │
    └───────────┬───────────┘
                ↓
    ┌───────────────────────┐
    │ UPDATE user_stats     │
    │ total_xp += xp_earned │
    └───────────┬───────────┘
                ↓
    ┌──────────────────────────────┐
    │ ⚡ Trigger automático         │
    │ trg_check_rank_promotion     │
    └───────────┬──────────────────┘
                ↓
    ┌──────────────────────────────┐
    │ check_rank_promotion(user_id)│
    └───────────┬──────────────────┘
                ↓
    ┌──────────────────────────────┐
    │ ¿total_xp >= umbral?         │
    └───────┬──────────────────────┘
            │
      ┌─────┴─────┐
      │           │
     NO          SÍ
      │           │
      ↓           ↓
  [Fin]    ┌──────────────────────────────┐
           │ promote_to_next_rank(user_id)│
           └───────────┬──────────────────┘
                       ↓
           ┌───────────────────────────────┐
           │ 1. UPDATE current_rank        │
           │    SET current_rank = 'Nacom' │
           │    SET previous_rank = 'Ajaw' │
           │    SET rank_achieved_at = NOW()│
           └───────────┬───────────────────┘
                       ↓
           ┌───────────────────────────────┐
           │ 2. CREATE achievement         │
           │    code: RANK_PROMOTION_NACOM │
           │    metadata: {old, new, xp}   │
           └───────────┬───────────────────┘
                       ↓
           ┌───────────────────────────────┐
           │ 3. INSERT rank_history        │
           │    Registro inmutable         │
           └───────────┬───────────────────┘
                       ↓
           ┌───────────────────────────────┐
           │ 4. UPDATE ml_coins            │
           │    ml_coins += bonus (50)     │
           └───────────┬───────────────────┘
                       ↓
           ┌───────────────────────────────┐
           │ 5. CREATE notification        │
           │    type: rank_up              │
           │    priority: high             │
           └───────────┬───────────────────┘
                       ↓
           ┌───────────────────────────────┐
           │ 6. INSERT audit_log           │
           │    action: rank_promotion     │
           └───────────┬───────────────────┘
                       ↓
           ┌───────────────────────────────┐
           │ WebSocket → Frontend          │
           │ Evento: rank_up               │
           └───────────┬───────────────────┘
                       ↓
           ┌───────────────────────────────┐
           │ Modal: ¡Promoción a Nacom!    │
           │ +50 ML Coins, +5% XP bonus    │
           └───────────────────────────────┘
```

### Diagrama 3: Jerarquía de Rangos

```
┌─────────────────────────────────────────────────────────────┐
│               JERARQUÍA DE RANGOS MAYA                      │
└─────────────────────────────────────────────────────────────┘

              🐉 K'uk'ulkan (Serpiente Emplumada)
              ├─ 100,000+ XP
              ├─ +20% XP bonus
              ├─ Puede contribuir ejercicios
              └─ Acceso a comunidad privada
                          ↑
                          │
              👑 Halach Uinic (Hombre Verdadero)
              ├─ 20,000-99,999 XP
              ├─ +15% XP bonus
              ├─ Puede crear aulas
              └─ Aparece en Hall of Fame
                          ↑
                          │
              ☀️ Ah K'in (Sacerdote del Sol)
              ├─ 5,000-19,999 XP
              ├─ +10% XP bonus
              ├─ Puede ser tutor
              └─ Biblioteca avanzada
                          ↑
                          │
              ⚔️ Nacom (Capitán Guerrero)
              ├─ 1,000-4,999 XP
              ├─ +5% XP bonus
              ├─ Puede crear equipos
              └─ Ejercicios hard desbloqueados
                          ↑
                          │
              🌱 Ajaw (Señor)
              ├─ 0-999 XP
              ├─ Sin bonus
              ├─ Rango inicial
              └─ Funcionalidades básicas

Progresión: Solo ascendente (no hay degradación)
Promoción: Automática al alcanzar umbral de XP
```

---

## 📅 Historial de Cambios

| Versión | Fecha | Autor | Cambios |
|---------|-------|-------|---------|
| 1.0 | 2025-11-07 | Backend Team | Creación del documento |

---

**Documento:** `docs/02-especificaciones-tecnicas/02-gamificacion/ET-GAM-003-rangos-maya.md`
**Propósito:** Especificación técnica completa del Sistema de Rangos Maya
**Audiencia:** Desarrolladores Backend, Frontend, Database
