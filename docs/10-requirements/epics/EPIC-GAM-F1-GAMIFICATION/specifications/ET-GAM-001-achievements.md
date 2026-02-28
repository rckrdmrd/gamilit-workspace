---
titulo: "ET-GAM-001: Implementación del Sistema de Achievements"
tipo: especificacion-tecnica
fecha_creacion: "2025-10-01"
ultima_actualizacion: "2026-02-28"
estado: activo
---

# ET-GAM-001: Implementación del Sistema de Achievements

## 📋 Metadata

| Campo | Valor |
|-------|-------|
| **ID** | ET-GAM-001 |
| **Módulo** | 02 - Gamificación |
| **Título** | Implementación del Sistema de Achievements |
| **Prioridad** | Alta |
| **Estado** | ✅ Implementado |
| **Versión** | 2.4.0 |
| **Fecha Creación** | 2025-11-07 |
| **Última Actualización** | 2026-01-18 |
| **Sistema Actual** | [docs/sistema-recompensas/](../../../_archived/sistema-recompensas/) v2.3.0 [ARCHIVED] |
| **Autor** | Database Team |
| **Reviewers** | Backend Lead, Frontend Lead, QA Lead |

---

## 🔗 Referencias

### Requerimiento Funcional

📘 **Documento RF:**
- [RF-GAM-001: Sistema de Logros (Achievements)](../requirements/RF-GAM-001-achievements.md)

### Implementación DDL

🗄️ **ENUMs:**
- `gamification_system.achievement_type` - `apps/database/ddl/00-prerequisites.sql:51-54`
- `gamification_system.achievement_category` - `apps/database/ddl/00-prerequisites.sql:47-50`

🗄️ **Tablas:**
- `gamification_system.achievements` - Definiciones de achievements
- `gamification_system.user_achievements` - Achievements desbloqueados por usuario

🗄️ **Funciones:**
- `check_and_unlock_achievement()` - Verificar criterios y desbloquear
- `award_achievement_rewards()` - Otorgar recompensas

🗄️ **Triggers:**
- `trg_achievement_unlocked` - Notificación al desbloquear
- `trg_check_rank_promotion` - Verificar promoción de rango

### API REST Endpoints (v2.4.0)

🌐 **Endpoints Backend (bajo /api/v1/gamification):**
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/achievements` | Listar todos los achievements activos |
| GET | `/achievements/:id` | Obtener achievement por ID |
| GET | `/users/:userId/achievements` | Obtener achievements del usuario con progreso |
| GET | `/users/:userId/achievements/summary` | Estadísticas de achievements del usuario |
| POST | `/users/:userId/achievements/:achievementId` | Otorgar/actualizar progreso de achievement |
| POST | `/users/:userId/achievements/:achievementId/claim` | Reclamar recompensas |
| GET | `/achievements/user/:userId/progress/:achievementId` | Obtener progreso específico |
| POST | `/achievements/user/:userId/unlock/:achievementId` | Desbloqueo manual (admin) |
| PATCH | `/achievements/:id` | Activar/desactivar achievement (admin) |

### Rate Limiting (RF-GAM-001)

⚡ **Límite de desbloqueo:** Máximo 5 achievements por minuto por usuario
- Implementado en `AchievementsService.checkRateLimit()`
- Caché en memoria con ventana deslizante de 60 segundos
- Error 400 si se excede el límite con mensaje de tiempo restante

---

## 🏗️ Arquitectura

### Diagrama de Capas

```
┌────────────────────────────────────────────────────┐
│                 FRONTEND (React)                   │
│  - AchievementGallery                              │
│  - AchievementCard                                 │
│  - AchievementUnlockedModal                        │
│  - AchievementProgress                             │
└─────────────────┬──────────────────────────────────┘
                  │ REST API
┌─────────────────▼──────────────────────────────────┐
│              BACKEND (NestJS)                      │
│  - AchievementService                              │
│  - AchievementListener (Event-driven)              │
│  - AchievementController                           │
│  - DTOs: CreateAchievementDto, AchievementDto      │
└─────────────────┬──────────────────────────────────┘
                  │ SQL Queries
┌─────────────────▼──────────────────────────────────┐
│            DATABASE (PostgreSQL)                   │
│  - achievements (tabla de definiciones)            │
│  - user_achievements (relación many-to-many)       │
│  - check_and_unlock_achievement() (función)        │
│  - award_achievement_rewards() (función)           │
│  - Triggers: notificación + rank check             │
└────────────────────────────────────────────────────┘
```

### Flujo de Desbloqueo

```
Usuario completa ejercicio
        ↓
Backend emite evento: "exercise.completed"
        ↓
AchievementListener escucha evento
        ↓
AchievementService.checkAchievements(userId, criteria)
        ↓
    ┌────────────────────────────────────┐
    │ check_and_unlock_achievement()    │
    │ - Evaluar criterios                │
    │ - Si cumple: insertar en           │
    │   user_achievements                │
    └────────────┬───────────────────────┘
                 ↓
    ┌────────────────────────────────────┐
    │ Trigger: trg_achievement_unlocked  │
    │ - Crear notificación               │
    │ - Llamar award_achievement_rewards │
    └────────────┬───────────────────────┘
                 ↓
    ┌────────────────────────────────────┐
    │ award_achievement_rewards()        │
    │ - Otorgar XP bonus                 │
    │ - Otorgar ML Coins                 │
    │ - Actualizar user_stats            │
    └────────────┬───────────────────────┘
                 ↓
Frontend muestra modal: "¡Achievement Desbloqueado!"
```

---

## 💾 Implementación de Base de Datos

### 1. ENUM: achievement_type

**Ubicación:** `apps/database/ddl/00-prerequisites.sql:51-54`

```sql
-- Achievement Types
CREATE TYPE gamification_system.achievement_type AS ENUM (
    'badge',            -- Insignia coleccionable
    'milestone',        -- Hito de progreso
    'special',          -- Logro especial (tiempo limitado)
    'rank_promotion'    -- Promoción de rango
);

COMMENT ON TYPE gamification_system.achievement_type IS '
Tipos de achievements:
- badge: Coleccionables visuales permanentes
- milestone: Marcan progreso cuantificable
- special: Únicos o eventos especiales
- rank_promotion: Automáticos al promover de rango
';
```

### 2. ENUM: achievement_category

**Ubicación:** `apps/database/ddl/schemas/gamification_system/enums/achievement_category.sql`
**Versión:** 1.1 (2025-12-15) - Agregados 'collection' y 'hidden'

```sql
-- Achievement Categories (v1.1)
CREATE TYPE gamification_system.achievement_category AS ENUM (
    'progress',     -- Progreso en contenido
    'streak',       -- Rachas y consistencia
    'completion',   -- Completar módulos/cursos
    'social',       -- Interacción social
    'special',      -- Eventos especiales
    'mastery',      -- Dominio de temas
    'exploration',  -- Descubrimiento de contenido
    'collection',   -- Colección de items (v1.1)
    'hidden'        -- Logros ocultos/secretos (v1.1)
);

COMMENT ON TYPE gamification_system.achievement_category IS '
Categorías de achievements según comportamiento gamificado (v1.1):
- progress: Cantidad de ejercicios, XP acumulado
- streak: Días consecutivos, rachas
- completion: 100% de módulos
- social: Amigos, equipos, ayudar a otros
- special: Eventos, beta testers
- mastery: Perfección en temas
- exploration: Explorar todos los niveles
- collection: Coleccionar items, badges (v1.1)
- hidden: Logros secretos no visibles hasta desbloquear (v1.1)
';
```

### 3. Tabla: achievements

**Ubicación:** `apps/database/ddl/schemas/gamification_system/tables/achievements.sql`

```sql
CREATE TABLE IF NOT EXISTS gamification_system.achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Identificación
    code VARCHAR(100) UNIQUE NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,

    -- Clasificación
    achievement_type gamification_system.achievement_type NOT NULL,
    category gamification_system.achievement_category NOT NULL,

    -- Criterios de desbloqueo (JSONB flexible)
    criteria JSONB NOT NULL,
    -- Ejemplos de criteria:
    -- {"exercises_completed": 10}
    -- {"streak_days": 7}
    -- {"module_id": "uuid", "completion": 100}
    -- {"total_xp": 1000}

    -- Recompensas
    xp_reward INTEGER DEFAULT 0,
    ml_coins_reward INTEGER DEFAULT 0,

    -- Visualización
    icon_url VARCHAR(500),
    badge_color VARCHAR(7), -- Hex color: #FF5733
    rarity VARCHAR(20) DEFAULT 'common', -- common, rare, epic, legendary

    -- Ordenamiento y visibilidad
    display_order INTEGER DEFAULT 0,
    is_secret BOOLEAN DEFAULT false, -- Si es secreto, no se muestra hasta desbloquear
    is_active BOOLEAN DEFAULT true,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- Índices
CREATE INDEX idx_achievements_type ON gamification_system.achievements(achievement_type);
CREATE INDEX idx_achievements_category ON gamification_system.achievements(category);
CREATE INDEX idx_achievements_active ON gamification_system.achievements(is_active) WHERE is_active = true;
CREATE INDEX idx_achievements_criteria ON gamification_system.achievements USING GIN(criteria);

-- Comentarios
COMMENT ON TABLE gamification_system.achievements IS 'Definiciones de todos los achievements disponibles';
COMMENT ON COLUMN gamification_system.achievements.code IS 'Código único identificador (ej: FIRST_EXERCISE)';
COMMENT ON COLUMN gamification_system.achievements.criteria IS 'Criterios de desbloqueo en formato JSONB flexible';
COMMENT ON COLUMN gamification_system.achievements.is_secret IS 'Si es true, no se muestra en galería hasta desbloquear';

-- Constraints
ALTER TABLE gamification_system.achievements
    ADD CONSTRAINT chk_xp_reward_positive CHECK (xp_reward >= 0),
    ADD CONSTRAINT chk_ml_coins_reward_positive CHECK (ml_coins_reward >= 0),
    ADD CONSTRAINT chk_rarity_valid CHECK (rarity IN ('common', 'rare', 'epic', 'legendary'));
```

### 4. Tabla: user_achievements

**Ubicación:** `apps/database/ddl/schemas/gamification_system/tables/user_achievements.sql`

```sql
CREATE TABLE IF NOT EXISTS gamification_system.user_achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Relaciones
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    achievement_id UUID NOT NULL REFERENCES gamification_system.achievements(id) ON DELETE CASCADE,

    -- Metadata de desbloqueo
    unlocked_at TIMESTAMPTZ DEFAULT NOW(),
    progress_data JSONB, -- Data adicional (ej: puntaje al desbloquear)

    -- Notificación
    notification_sent BOOLEAN DEFAULT false,
    notification_sent_at TIMESTAMPTZ,

    -- Constraints
    UNIQUE(user_id, achievement_id) -- Un usuario solo puede desbloquear una vez
);

-- Índices
CREATE INDEX idx_user_achievements_user ON gamification_system.user_achievements(user_id);
CREATE INDEX idx_user_achievements_achievement ON gamification_system.user_achievements(achievement_id);
CREATE INDEX idx_user_achievements_unlocked_at ON gamification_system.user_achievements(unlocked_at DESC);

-- Comentarios
COMMENT ON TABLE gamification_system.user_achievements IS 'Achievements desbloqueados por cada usuario';
COMMENT ON COLUMN gamification_system.user_achievements.progress_data IS 'Datos adicionales al desbloquear (opcional)';
```

### 5. Función: check_and_unlock_achievement

**Ubicación:** `apps/database/ddl/schemas/gamification_system/functions/check_and_unlock_achievement.sql`

```sql
CREATE OR REPLACE FUNCTION gamification_system.check_and_unlock_achievement(
    p_user_id UUID,
    p_achievement_code VARCHAR
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_achievement_id UUID;
    v_criteria JSONB;
    v_already_unlocked BOOLEAN;
    v_criteria_met BOOLEAN := false;
    v_user_stats RECORD;
BEGIN
    -- 1. Obtener achievement
    SELECT id, criteria INTO v_achievement_id, v_criteria
    FROM gamification_system.achievements
    WHERE code = p_achievement_code
        AND is_active = true;

    IF v_achievement_id IS NULL THEN
        RAISE EXCEPTION 'Achievement with code % not found or inactive', p_achievement_code;
    END IF;

    -- 2. Verificar si ya está desbloqueado
    SELECT EXISTS(
        SELECT 1 FROM gamification_system.user_achievements
        WHERE user_id = p_user_id AND achievement_id = v_achievement_id
    ) INTO v_already_unlocked;

    IF v_already_unlocked THEN
        RETURN false; -- Ya desbloqueado
    END IF;

    -- 3. Obtener stats del usuario
    SELECT * INTO v_user_stats
    FROM gamification_system.user_stats
    WHERE user_id = p_user_id;

    -- 4. Evaluar criterios (lógica simplificada, extender según necesidad)
    IF v_criteria ? 'exercises_completed' THEN
        IF v_user_stats.exercises_completed >= (v_criteria->>'exercises_completed')::INTEGER THEN
            v_criteria_met := true;
        END IF;
    END IF;

    IF v_criteria ? 'total_xp' THEN
        IF v_user_stats.total_xp >= (v_criteria->>'total_xp')::INTEGER THEN
            v_criteria_met := true;
        END IF;
    END IF;

    IF v_criteria ? 'streak_days' THEN
        IF v_user_stats.current_streak >= (v_criteria->>'streak_days')::INTEGER THEN
            v_criteria_met := true;
        END IF;
    END IF;

    IF v_criteria ? 'modules_completed' THEN
        -- Contar módulos completados por usuario
        DECLARE
            v_modules_completed INTEGER;
        BEGIN
            SELECT COUNT(*) INTO v_modules_completed
            FROM progress_tracking.module_progress
            WHERE user_id = p_user_id
                AND completion_percentage = 100;

            IF v_modules_completed >= (v_criteria->>'modules_completed')::INTEGER THEN
                v_criteria_met := true;
            END IF;
        END;
    END IF;

    -- 5. Si cumple criterios, desbloquear
    IF v_criteria_met THEN
        INSERT INTO gamification_system.user_achievements (
            user_id,
            achievement_id,
            unlocked_at
        ) VALUES (
            p_user_id,
            v_achievement_id,
            NOW()
        );

        RAISE NOTICE 'Achievement % unlocked for user %', p_achievement_code, p_user_id;
        RETURN true;
    END IF;

    RETURN false; -- No cumple criterios
END;
$$;

COMMENT ON FUNCTION gamification_system.check_and_unlock_achievement IS 'Verifica criterios y desbloquea achievement si se cumplen';
```

### 6. Función: award_achievement_rewards

**Ubicación:** `apps/database/ddl/schemas/gamification_system/functions/award_achievement_rewards.sql`

```sql
CREATE OR REPLACE FUNCTION gamification_system.award_achievement_rewards(
    p_user_achievement_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id UUID;
    v_achievement_id UUID;
    v_xp_reward INTEGER;
    v_ml_coins_reward INTEGER;
BEGIN
    -- 1. Obtener datos del achievement desbloqueado
    SELECT
        ua.user_id,
        ua.achievement_id,
        a.xp_reward,
        a.ml_coins_reward
    INTO
        v_user_id,
        v_achievement_id,
        v_xp_reward,
        v_ml_coins_reward
    FROM gamification_system.user_achievements ua
    INNER JOIN gamification_system.achievements a ON ua.achievement_id = a.id
    WHERE ua.id = p_user_achievement_id;

    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'User achievement with id % not found', p_user_achievement_id;
    END IF;

    -- 2. Otorgar XP
    IF v_xp_reward > 0 THEN
        UPDATE gamification_system.user_stats
        SET
            total_xp = total_xp + v_xp_reward,
            updated_at = NOW()
        WHERE user_id = v_user_id;

        RAISE NOTICE 'Awarded % XP to user %', v_xp_reward, v_user_id;
    END IF;

    -- 3. Otorgar ML Coins
    IF v_ml_coins_reward > 0 THEN
        UPDATE gamification_system.user_stats
        SET
            ml_coins = ml_coins + v_ml_coins_reward,
            updated_at = NOW()
        WHERE user_id = v_user_id;

        RAISE NOTICE 'Awarded % ML Coins to user %', v_ml_coins_reward, v_user_id;
    END IF;

    -- 4. Registrar en audit log
    INSERT INTO audit_logging.audit_logs (
        user_id,
        action,
        resource_type,
        resource_id,
        details,
        severity
    ) VALUES (
        v_user_id,
        'achievement_reward_granted',
        'achievement',
        v_achievement_id::TEXT,
        jsonb_build_object(
            'xp_awarded', v_xp_reward,
            'ml_coins_awarded', v_ml_coins_reward
        ),
        'info'
    );
END;
$$;

COMMENT ON FUNCTION gamification_system.award_achievement_rewards IS 'Otorga recompensas de XP y ML Coins al desbloquear achievement';
```

### 7. Trigger: trg_achievement_unlocked

**Ubicación:** `apps/database/ddl/schemas/gamification_system/triggers/trg_achievement_unlocked.sql`

```sql
CREATE OR REPLACE FUNCTION gamification_system.fn_achievement_unlocked_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_achievement RECORD;
BEGIN
    -- Obtener datos del achievement
    SELECT
        code,
        title,
        description,
        achievement_type,
        icon_url
    INTO v_achievement
    FROM gamification_system.achievements
    WHERE id = NEW.achievement_id;

    -- Crear notificación
    INSERT INTO public.notifications (
        user_id,
        type,
        title,
        body,
        data,
        priority,
        is_read
    ) VALUES (
        NEW.user_id,
        'achievement_unlocked',
        '¡Achievement Desbloqueado!',
        format('Desbloqueaste: %s', v_achievement.title),
        jsonb_build_object(
            'achievement_id', NEW.achievement_id,
            'achievement_code', v_achievement.code,
            'achievement_type', v_achievement.achievement_type,
            'icon_url', v_achievement.icon_url,
            'unlocked_at', NEW.unlocked_at
        ),
        'high',
        false
    );

    -- Otorgar recompensas
    PERFORM gamification_system.award_achievement_rewards(NEW.id);

    RAISE NOTICE 'Achievement notification created for user %', NEW.user_id;

    RETURN NEW;
END;
$$;

-- Crear trigger
CREATE TRIGGER trg_achievement_unlocked
    AFTER INSERT ON gamification_system.user_achievements
    FOR EACH ROW
    EXECUTE FUNCTION gamification_system.fn_achievement_unlocked_notification();

COMMENT ON TRIGGER trg_achievement_unlocked ON gamification_system.user_achievements IS 'Crea notificación y otorga recompensas al desbloquear achievement';
```

### 8. Trigger: trg_check_rank_promotion

**Ubicación:** `apps/database/ddl/schemas/gamification_system/triggers/trg_check_rank_promotion.sql`

```sql
CREATE OR REPLACE FUNCTION gamification_system.fn_check_rank_promotion()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_achievement RECORD;
BEGIN
    -- Solo verificar si el achievement es de tipo rank_promotion
    SELECT achievement_type INTO v_achievement
    FROM gamification_system.achievements
    WHERE id = NEW.achievement_id;

    IF v_achievement.achievement_type = 'rank_promotion' THEN
        -- Llamar a función de promoción de rango
        PERFORM gamification_system.promote_to_next_rank(NEW.user_id);

        RAISE NOTICE 'Rank promotion triggered for user %', NEW.user_id;
    END IF;

    RETURN NEW;
END;
$$;

-- Crear trigger
CREATE TRIGGER trg_check_rank_promotion
    AFTER INSERT ON gamification_system.user_achievements
    FOR EACH ROW
    WHEN (NEW.achievement_id IN (
        SELECT id FROM gamification_system.achievements WHERE achievement_type = 'rank_promotion'
    ))
    EXECUTE FUNCTION gamification_system.fn_check_rank_promotion();

COMMENT ON TRIGGER trg_check_rank_promotion ON gamification_system.user_achievements IS 'Verifica y ejecuta promoción de rango al desbloquear achievement de tipo rank_promotion';
```

---

## 🔧 Implementación Backend (NestJS)

### 1. Enums TypeScript

**Ubicación:** `apps/backend/src/gamification/enums/achievement-type.enum.ts`

```typescript
export enum AchievementTypeEnum {
  BADGE = 'badge',
  MILESTONE = 'milestone',
  SPECIAL = 'special',
  RANK_PROMOTION = 'rank_promotion',
}
```

**Ubicación:** `apps/backend/src/shared/constants/enums.constants.ts`
**Versión:** 1.1 (2025-12-15) - Agregados COLLECTION y HIDDEN

```typescript
export enum AchievementCategoryEnum {
  PROGRESS = 'progress',
  STREAK = 'streak',
  COMPLETION = 'completion',
  SOCIAL = 'social',
  SPECIAL = 'special',
  MASTERY = 'mastery',
  EXPLORATION = 'exploration',
  COLLECTION = 'collection',  // v1.1: Logros de colección
  HIDDEN = 'hidden',          // v1.1: Logros ocultos/secretos
}
```

### 2. Entities

**Ubicación:** `apps/backend/src/gamification/entities/achievement.entity.ts`

```typescript
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { AchievementTypeEnum } from '../enums/achievement-type.enum';
import { AchievementCategoryEnum } from '../enums/achievement-category.enum';

@Entity({ schema: 'gamification_system', name: 'achievements' })
export class Achievement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  code: string;

  @Column({ type: 'varchar', length: 200 })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({
    type: 'enum',
    enum: AchievementTypeEnum,
    name: 'achievement_type',
  })
  achievementType: AchievementTypeEnum;

  @Column({
    type: 'enum',
    enum: AchievementCategoryEnum,
  })
  category: AchievementCategoryEnum;

  @Column({ type: 'jsonb' })
  criteria: Record<string, any>;

  @Column({ type: 'integer', default: 0, name: 'xp_reward' })
  xpReward: number;

  @Column({ type: 'integer', default: 0, name: 'ml_coins_reward' })
  mlCoinsReward: number;

  @Column({ type: 'varchar', length: 500, nullable: true, name: 'icon_url' })
  iconUrl?: string;

  @Column({ type: 'varchar', length: 7, nullable: true, name: 'badge_color' })
  badgeColor?: string;

  @Column({ type: 'varchar', length: 20, default: 'common' })
  rarity: 'common' | 'rare' | 'epic' | 'legendary';

  @Column({ type: 'integer', default: 0, name: 'display_order' })
  displayOrder: number;

  @Column({ type: 'boolean', default: false, name: 'is_secret' })
  isSecret: boolean;

  @Column({ type: 'boolean', default: true, name: 'is_active' })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ type: 'uuid', nullable: true, name: 'created_by' })
  createdBy?: string;
}
```

**Ubicación:** `apps/backend/src/gamification/entities/user-achievement.entity.ts`

```typescript
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Achievement } from './achievement.entity';
import { User } from '../../auth/entities/user.entity';

@Entity({ schema: 'gamification_system', name: 'user_achievements' })
export class UserAchievement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'user_id' })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'uuid', name: 'achievement_id' })
  achievementId: string;

  @ManyToOne(() => Achievement)
  @JoinColumn({ name: 'achievement_id' })
  achievement: Achievement;

  @CreateDateColumn({ name: 'unlocked_at' })
  unlockedAt: Date;

  @Column({ type: 'jsonb', nullable: true, name: 'progress_data' })
  progressData?: Record<string, any>;

  @Column({ type: 'boolean', default: false, name: 'notification_sent' })
  notificationSent: boolean;

  @Column({ type: 'timestamptz', nullable: true, name: 'notification_sent_at' })
  notificationSentAt?: Date;
}
```

### 3. DTOs

**Ubicación:** `apps/backend/src/gamification/dto/achievement.dto.ts`

```typescript
import { IsEnum, IsString, IsNotEmpty, IsInt, Min, IsOptional, IsBoolean, IsObject } from 'class-validator';
import { AchievementTypeEnum } from '../enums/achievement-type.enum';
import { AchievementCategoryEnum } from '../enums/achievement-category.enum';

export class CreateAchievementDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsEnum(AchievementTypeEnum)
  achievementType: AchievementTypeEnum;

  @IsEnum(AchievementCategoryEnum)
  category: AchievementCategoryEnum;

  @IsObject()
  criteria: Record<string, any>;

  @IsInt()
  @Min(0)
  @IsOptional()
  xpReward?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  mlCoinsReward?: number;

  @IsString()
  @IsOptional()
  iconUrl?: string;

  @IsString()
  @IsOptional()
  badgeColor?: string;

  @IsString()
  @IsOptional()
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';

  @IsBoolean()
  @IsOptional()
  isSecret?: boolean;
}

export class AchievementDto {
  id: string;
  code: string;
  title: string;
  description: string;
  achievementType: AchievementTypeEnum;
  category: AchievementCategoryEnum;
  criteria: Record<string, any>;
  xpReward: number;
  mlCoinsReward: number;
  iconUrl?: string;
  badgeColor?: string;
  rarity: string;
  isSecret: boolean;
  isActive: boolean;
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export class UserAchievementDto {
  id: string;
  userId: string;
  achievementId: string;
  achievement: AchievementDto;
  unlockedAt: Date;
  progressData?: Record<string, any>;
}
```

### 4. AchievementService

**Ubicación:** `apps/backend/src/gamification/services/achievement.service.ts`

```typescript
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Achievement } from '../entities/achievement.entity';
import { UserAchievement } from '../entities/user-achievement.entity';
import { CreateAchievementDto } from '../dto/achievement.dto';

@Injectable()
export class AchievementService {
  constructor(
    @InjectRepository(Achievement)
    private achievementRepo: Repository<Achievement>,

    @InjectRepository(UserAchievement)
    private userAchievementRepo: Repository<UserAchievement>,
  ) {}

  /**
   * Crear nuevo achievement (solo admins)
   */
  async createAchievement(dto: CreateAchievementDto, createdBy: string): Promise<Achievement> {
    const achievement = this.achievementRepo.create({
      ...dto,
      createdBy,
    });

    return await this.achievementRepo.save(achievement);
  }

  /**
   * Obtener todos los achievements activos
   */
  async findAllActive(): Promise<Achievement[]> {
    return await this.achievementRepo.find({
      where: { isActive: true },
      order: { displayOrder: 'ASC', createdAt: 'ASC' },
    });
  }

  /**
   * Obtener achievements desbloqueados por usuario
   */
  async getUserAchievements(userId: string): Promise<UserAchievement[]> {
    return await this.userAchievementRepo.find({
      where: { userId },
      relations: ['achievement'],
      order: { unlockedAt: 'DESC' },
    });
  }

  /**
   * Verificar si usuario tiene achievement
   */
  async hasAchievement(userId: string, achievementCode: string): Promise<boolean> {
    const achievement = await this.achievementRepo.findOne({
      where: { code: achievementCode },
    });

    if (!achievement) {
      return false;
    }

    const userAchievement = await this.userAchievementRepo.findOne({
      where: {
        userId,
        achievementId: achievement.id,
      },
    });

    return !!userAchievement;
  }

  /**
   * Verificar y desbloquear achievement (llamar a función SQL)
   */
  async checkAndUnlock(userId: string, achievementCode: string): Promise<boolean> {
    const result = await this.achievementRepo.query(
      'SELECT gamification_system.check_and_unlock_achievement($1, $2) as unlocked',
      [userId, achievementCode]
    );

    return result[0]?.unlocked || false;
  }

  /**
   * Verificar múltiples achievements después de un evento
   */
  async checkMultipleAchievements(
    userId: string,
    achievementCodes: string[]
  ): Promise<{ code: string; unlocked: boolean }[]> {
    const results = [];

    for (const code of achievementCodes) {
      const unlocked = await this.checkAndUnlock(userId, code);
      results.push({ code, unlocked });
    }

    return results;
  }

  /**
   * Obtener progreso hacia achievement
   */
  async getProgress(userId: string, achievementCode: string): Promise<{
    achievement: Achievement;
    currentValue: number;
    targetValue: number;
    percentage: number;
    isUnlocked: boolean;
  }> {
    const achievement = await this.achievementRepo.findOne({
      where: { code: achievementCode },
    });

    if (!achievement) {
      throw new NotFoundException(`Achievement ${achievementCode} not found`);
    }

    // Obtener stats del usuario
    const userStats = await this.achievementRepo.query(
      'SELECT * FROM gamification_system.user_stats WHERE user_id = $1',
      [userId]
    );

    if (!userStats[0]) {
      throw new NotFoundException('User stats not found');
    }

    const stats = userStats[0];

    // Determinar currentValue según criterio
    let currentValue = 0;
    let targetValue = 0;

    if (achievement.criteria['exercises_completed']) {
      currentValue = stats.exercises_completed;
      targetValue = achievement.criteria['exercises_completed'];
    } else if (achievement.criteria['total_xp']) {
      currentValue = stats.total_xp;
      targetValue = achievement.criteria['total_xp'];
    } else if (achievement.criteria['streak_days']) {
      currentValue = stats.current_streak;
      targetValue = achievement.criteria['streak_days'];
    }

    const percentage = targetValue > 0 ? Math.min((currentValue / targetValue) * 100, 100) : 0;

    const isUnlocked = await this.hasAchievement(userId, achievementCode);

    return {
      achievement,
      currentValue,
      targetValue,
      percentage,
      isUnlocked,
    };
  }

  /**
   * Obtener galería de achievements (con secretos si están desbloqueados)
   */
  async getGallery(userId: string): Promise<{
    unlocked: UserAchievement[];
    locked: Achievement[];
    totalAchievements: number;
    unlockedCount: number;
    unlockedPercentage: number;
  }> {
    // Achievements desbloqueados
    const unlocked = await this.getUserAchievements(userId);

    // Achievements bloqueados (excluir secretos no desbloqueados)
    const unlockedIds = unlocked.map((ua) => ua.achievementId);
    const locked = await this.achievementRepo
      .createQueryBuilder('a')
      .where('a.is_active = true')
      .andWhere('a.id NOT IN (:...unlockedIds)', {
        unlockedIds: unlockedIds.length > 0 ? unlockedIds : ['00000000-0000-0000-0000-000000000000'],
      })
      .andWhere('(a.is_secret = false OR a.id IN (:...unlockedIds))')
      .orderBy('a.display_order', 'ASC')
      .getMany();

    const totalAchievements = await this.achievementRepo.count({ where: { isActive: true } });
    const unlockedCount = unlocked.length;
    const unlockedPercentage = totalAchievements > 0 ? (unlockedCount / totalAchievements) * 100 : 0;

    return {
      unlocked,
      locked,
      totalAchievements,
      unlockedCount,
      unlockedPercentage,
    };
  }
}
```

### 5. AchievementListener (Event-driven)

**Ubicación:** `apps/backend/src/gamification/listeners/achievement.listener.ts`

```typescript
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { AchievementService } from '../services/achievement.service';

@Injectable()
export class AchievementListener {
  constructor(private achievementService: AchievementService) {}

  /**
   * Escuchar evento: ejercicio completado
   */
  @OnEvent('exercise.completed')
  async handleExerciseCompleted(payload: { userId: string; exerciseId: string; xpEarned: number }) {
    const { userId } = payload;

    // Lista de achievements a verificar después de completar ejercicio
    const achievementsToCheck = [
      'FIRST_EXERCISE',           // Completar 1 ejercicio
      'TEN_EXERCISES',            // Completar 10 ejercicios
      'FIFTY_EXERCISES',          // Completar 50 ejercicios
      'HUNDRED_EXERCISES',        // Completar 100 ejercicios
      'NOVICE_LEARNER',           // Alcanzar 100 XP
      'INTERMEDIATE_LEARNER',     // Alcanzar 500 XP
      'ADVANCED_LEARNER',         // Alcanzar 2000 XP
    ];

    await this.achievementService.checkMultipleAchievements(userId, achievementsToCheck);
  }

  /**
   * Escuchar evento: racha completada
   */
  @OnEvent('streak.milestone')
  async handleStreakMilestone(payload: { userId: string; streakDays: number }) {
    const { userId } = payload;

    const achievementsToCheck = [
      'STREAK_7',        // 7 días consecutivos
      'STREAK_30',       // 30 días
      'STREAK_100',      // 100 días
    ];

    await this.achievementService.checkMultipleAchievements(userId, achievementsToCheck);
  }

  /**
   * Escuchar evento: módulo completado
   */
  @OnEvent('module.completed')
  async handleModuleCompleted(payload: { userId: string; moduleId: string }) {
    const { userId } = payload;

    const achievementsToCheck = [
      'FIRST_MODULE',
      'FIVE_MODULES',
      'ALL_MODULES',
    ];

    await this.achievementService.checkMultipleAchievements(userId, achievementsToCheck);
  }

  /**
   * Escuchar evento: promoción de rango
   */
  @OnEvent('rank.promoted')
  async handleRankPromoted(payload: { userId: string; newRank: string; oldRank: string }) {
    const { userId, newRank } = payload;

    // Crear achievement específico del rango
    const rankAchievement = `RANK_${newRank.toUpperCase()}`;

    await this.achievementService.checkAndUnlock(userId, rankAchievement);
  }
}
```

### 6. Controller

**Ubicación:** `apps/backend/src/gamification/controllers/achievement.controller.ts`

```typescript
import { Controller, Get, Post, Body, Param, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { AchievementService } from '../services/achievement.service';
import { CreateAchievementDto } from '../dto/achievement.dto';

@Controller('achievements')
@UseGuards(JwtAuthGuard)
export class AchievementController {
  constructor(private achievementService: AchievementService) {}

  /**
   * GET /achievements/gallery
   * Obtener galería completa del usuario
   */
  @Get('gallery')
  async getGallery(@Req() req) {
    return await this.achievementService.getGallery(req.user.id);
  }

  /**
   * GET /achievements/me
   * Obtener achievements desbloqueados del usuario actual
   */
  @Get('me')
  async getMyAchievements(@Req() req) {
    return await this.achievementService.getUserAchievements(req.user.id);
  }

  /**
   * GET /achievements/:code/progress
   * Obtener progreso hacia un achievement específico
   */
  @Get(':code/progress')
  async getProgress(@Req() req, @Param('code') code: string) {
    return await this.achievementService.getProgress(req.user.id, code);
  }

  /**
   * POST /achievements (solo admins)
   * Crear nuevo achievement
   */
  @Post()
  @UseGuards(RolesGuard)
  @Roles('super_admin', 'admin_teacher')
  async createAchievement(@Req() req, @Body() dto: CreateAchievementDto) {
    return await this.achievementService.createAchievement(dto, req.user.id);
  }

  /**
   * GET /achievements (solo admins)
   * Listar todos los achievements
   */
  @Get()
  @UseGuards(RolesGuard)
  @Roles('super_admin', 'admin_teacher')
  async getAllAchievements() {
    return await this.achievementService.findAllActive();
  }
}
```

---

## 🎨 Implementación Frontend (React)

### 1. Types

**Ubicación:** `apps/frontend/src/types/achievement.types.ts`

```typescript
export enum AchievementType {
  BADGE = 'badge',
  MILESTONE = 'milestone',
  SPECIAL = 'special',
  RANK_PROMOTION = 'rank_promotion',
}

// Type union (recomendado para mejor inferencia de tipos)
export type AchievementCategory =
  | 'progress'
  | 'streak'
  | 'completion'
  | 'social'
  | 'special'
  | 'mastery'
  | 'exploration'
  | 'collection'  // v1.1
  | 'hidden';     // v1.1

export interface Achievement {
  id: string;
  code: string;
  title: string;
  description: string;
  achievementType: AchievementType;
  category: AchievementCategory;
  criteria: Record<string, any>;
  xpReward: number;
  mlCoinsReward: number;
  iconUrl?: string;
  badgeColor?: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  isSecret: boolean;
  displayOrder: number;
}

export interface UserAchievement {
  id: string;
  userId: string;
  achievementId: string;
  achievement: Achievement;
  unlockedAt: string;
  progressData?: Record<string, any>;
}

export interface AchievementGallery {
  unlocked: UserAchievement[];
  locked: Achievement[];
  totalAchievements: number;
  unlockedCount: number;
  unlockedPercentage: number;
}
```

### 2. API Service

**Ubicación:** `apps/frontend/src/services/achievement.service.ts`

```typescript
import api from './api';
import { AchievementGallery, UserAchievement, Achievement } from '../types/achievement.types';

export const achievementService = {
  async getGallery(): Promise<AchievementGallery> {
    const response = await api.get('/achievements/gallery');
    return response.data;
  },

  async getMyAchievements(): Promise<UserAchievement[]> {
    const response = await api.get('/achievements/me');
    return response.data;
  },

  async getProgress(code: string): Promise<{
    achievement: Achievement;
    currentValue: number;
    targetValue: number;
    percentage: number;
    isUnlocked: boolean;
  }> {
    const response = await api.get(`/achievements/${code}/progress`);
    return response.data;
  },
};
```

### 3. Component: AchievementCard

**Ubicación:** `apps/frontend/src/components/gamification/AchievementCard.tsx`

```typescript
import React from 'react';
import { Achievement, UserAchievement } from '../../types/achievement.types';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface AchievementCardProps {
  achievement: Achievement;
  userAchievement?: UserAchievement;
  isLocked?: boolean;
}

const rarityColors = {
  common: 'bg-gray-400',
  rare: 'bg-blue-500',
  epic: 'bg-purple-600',
  legendary: 'bg-yellow-500',
};

export const AchievementCard: React.FC<AchievementCardProps> = ({
  achievement,
  userAchievement,
  isLocked = false,
}) => {
  const rarityClass = rarityColors[achievement.rarity];

  return (
    <div
      className={`relative p-4 rounded-lg border-2 transition-all ${
        isLocked
          ? 'bg-gray-100 border-gray-300 opacity-60'
          : `bg-white border-${achievement.rarity} shadow-lg hover:shadow-xl`
      }`}
    >
      {/* Rarity badge */}
      <div className={`absolute top-2 right-2 px-2 py-1 rounded text-white text-xs ${rarityClass}`}>
        {achievement.rarity.toUpperCase()}
      </div>

      {/* Icon */}
      <div className="flex justify-center mb-3">
        {achievement.iconUrl ? (
          <img
            src={achievement.iconUrl}
            alt={achievement.title}
            className={`w-20 h-20 ${isLocked ? 'filter grayscale' : ''}`}
          />
        ) : (
          <div
            className={`w-20 h-20 rounded-full flex items-center justify-center text-4xl ${
              isLocked ? 'bg-gray-300' : achievement.badgeColor || 'bg-blue-500'
            }`}
          >
            {isLocked ? '🔒' : '🏆'}
          </div>
        )}
      </div>

      {/* Title */}
      <h3 className={`text-lg font-bold text-center mb-2 ${isLocked ? 'text-gray-500' : 'text-gray-900'}`}>
        {achievement.isSecret && isLocked ? '???' : achievement.title}
      </h3>

      {/* Description */}
      <p className={`text-sm text-center mb-3 ${isLocked ? 'text-gray-400' : 'text-gray-600'}`}>
        {achievement.isSecret && isLocked ? 'Achievement secreto' : achievement.description}
      </p>

      {/* Rewards */}
      {!isLocked && (
        <div className="flex justify-center gap-3 text-sm">
          {achievement.xpReward > 0 && (
            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">+{achievement.xpReward} XP</span>
          )}
          {achievement.mlCoinsReward > 0 && (
            <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded">
              +{achievement.mlCoinsReward} ML Coins
            </span>
          )}
        </div>
      )}

      {/* Unlocked date */}
      {userAchievement && (
        <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-500 text-center">
          Desbloqueado {formatDistanceToNow(new Date(userAchievement.unlockedAt), { addSuffix: true, locale: es })}
        </div>
      )}
    </div>
  );
};
```

### 4. Component: AchievementGallery

**Ubicación:** `apps/frontend/src/components/gamification/AchievementGallery.tsx`

```typescript
import React, { useEffect, useState } from 'react';
import { achievementService } from '../../services/achievement.service';
import { AchievementGallery as IAchievementGallery } from '../../types/achievement.types';
import { AchievementCard } from './AchievementCard';

export const AchievementGallery: React.FC = () => {
  const [gallery, setGallery] = useState<IAchievementGallery | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked'>('all');

  useEffect(() => {
    loadGallery();
  }, []);

  const loadGallery = async () => {
    try {
      setLoading(true);
      const data = await achievementService.getGallery();
      setGallery(data);
    } catch (error) {
      console.error('Error loading achievements:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Cargando achievements...</div>;
  }

  if (!gallery) {
    return <div className="text-center py-8 text-red-500">Error cargando achievements</div>;
  }

  const filteredAchievements =
    filter === 'all'
      ? [...gallery.unlocked, ...gallery.locked]
      : filter === 'unlocked'
      ? gallery.unlocked
      : gallery.locked;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Galería de Achievements</h1>
        <p className="text-gray-600">
          Has desbloqueado {gallery.unlockedCount} de {gallery.totalAchievements} achievements (
          {gallery.unlockedPercentage.toFixed(1)}%)
        </p>

        {/* Progress Bar */}
        <div className="mt-4 w-full bg-gray-200 rounded-full h-4">
          <div
            className="bg-gradient-to-r from-blue-500 to-purple-600 h-4 rounded-full transition-all"
            style={{ width: `${gallery.unlockedPercentage}%` }}
          />
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
        >
          Todos ({gallery.totalAchievements})
        </button>
        <button
          onClick={() => setFilter('unlocked')}
          className={`px-4 py-2 rounded ${filter === 'unlocked' ? 'bg-green-600 text-white' : 'bg-gray-200'}`}
        >
          Desbloqueados ({gallery.unlockedCount})
        </button>
        <button
          onClick={() => setFilter('locked')}
          className={`px-4 py-2 rounded ${filter === 'locked' ? 'bg-gray-600 text-white' : 'bg-gray-200'}`}
        >
          Bloqueados ({gallery.locked.length})
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filter === 'all' || filter === 'unlocked'
          ? gallery.unlocked.map((ua) => (
              <AchievementCard key={ua.id} achievement={ua.achievement} userAchievement={ua} isLocked={false} />
            ))
          : null}

        {filter === 'all' || filter === 'locked'
          ? gallery.locked.map((achievement) => (
              <AchievementCard key={achievement.id} achievement={achievement} isLocked={true} />
            ))
          : null}
      </div>
    </div>
  );
};
```

### 5. Component: AchievementUnlockedModal

**Ubicación:** `apps/frontend/src/components/gamification/AchievementUnlockedModal.tsx`

```typescript
import React from 'react';
import { Achievement } from '../../types/achievement.types';
import Confetti from 'react-confetti';

interface AchievementUnlockedModalProps {
  achievement: Achievement;
  onClose: () => void;
}

export const AchievementUnlockedModal: React.FC<AchievementUnlockedModalProps> = ({ achievement, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
      <Confetti width={window.innerWidth} height={window.innerHeight} recycle={false} numberOfPieces={200} />

      <div className="bg-white rounded-lg p-8 max-w-md w-full shadow-2xl relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl"
          aria-label="Cerrar"
        >
          ×
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">
            🎉 ¡Achievement Desbloqueado! 🎉
          </h2>
        </div>

        {/* Icon */}
        <div className="flex justify-center mb-4">
          {achievement.iconUrl ? (
            <img src={achievement.iconUrl} alt={achievement.title} className="w-32 h-32 animate-bounce" />
          ) : (
            <div
              className="w-32 h-32 rounded-full flex items-center justify-center text-6xl animate-bounce"
              style={{ backgroundColor: achievement.badgeColor || '#3B82F6' }}
            >
              🏆
            </div>
          )}
        </div>

        {/* Title */}
        <h3 className="text-2xl font-bold text-center mb-2 text-gray-900">{achievement.title}</h3>

        {/* Description */}
        <p className="text-center text-gray-600 mb-6">{achievement.description}</p>

        {/* Rewards */}
        <div className="flex justify-center gap-4 mb-6">
          {achievement.xpReward > 0 && (
            <div className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg font-semibold">
              +{achievement.xpReward} XP
            </div>
          )}
          {achievement.mlCoinsReward > 0 && (
            <div className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg font-semibold">
              +{achievement.mlCoinsReward} ML Coins
            </div>
          )}
        </div>

        {/* Button */}
        <button
          onClick={onClose}
          className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all"
        >
          ¡Continuar!
        </button>
      </div>
    </div>
  );
};
```

---

## 🧪 Testing

### Test Case 1: Desbloquear Achievement por Primera Vez

```typescript
describe('AchievementService', () => {
  test('should unlock achievement FIRST_EXERCISE after completing first exercise', async () => {
    // Arrange
    const user = await createUser();

    // Verificar que no tiene el achievement
    const hasBefore = await achievementService.hasAchievement(user.id, 'FIRST_EXERCISE');
    expect(hasBefore).toBe(false);

    // Act - Completar ejercicio
    await completeExercise(user.id, { base_xp: 10 });

    // Assert
    const hasAfter = await achievementService.hasAchievement(user.id, 'FIRST_EXERCISE');
    expect(hasAfter).toBe(true);

    // Verificar recompensas
    const userStats = await getUserStats(user.id);
    expect(userStats.ml_coins).toBeGreaterThanOrEqual(10); // Recompensa del achievement
  });
});
```

---

## 📊 Performance y Optimización

### Índices Críticos

```sql
-- Ya incluidos en tabla achievements
CREATE INDEX idx_achievements_criteria ON gamification_system.achievements USING GIN(criteria);

-- Ya incluidos en tabla user_achievements
CREATE INDEX idx_user_achievements_user ON gamification_system.user_achievements(user_id);
```

### Caching

```typescript
// Redis cache para galería
async getGallery(userId: string): Promise<AchievementGallery> {
  const cacheKey = `achievement:gallery:${userId}`;
  const cached = await this.redis.get(cacheKey);

  if (cached) {
    return JSON.parse(cached);
  }

  const gallery = await this.buildGallery(userId);

  await this.redis.set(cacheKey, JSON.stringify(gallery), 'EX', 300); // 5 min

  return gallery;
}
```

---

## 📅 Historial de Cambios

| Versión | Fecha | Autor | Cambios |
|---------|-------|-------|---------|
| 1.0 | 2025-11-07 | Database Team | Creación del documento |
| 2.4.0 | 2026-01-18 | Claude Code | Agregados endpoints GET progress y POST unlock; Implementado rate limiting (5/min RF-GAM-001); Documentada API REST completa |
| 2.5.1 | 2026-01-18 | Claude Code | CORR-DOC-001: Sincronizado ENUM achievement_category con DDL v1.1 (9 categorías: +collection, +hidden); Actualizada ubicación de archivos |

---

**Documento:** `docs/20-architecture/02-gamificacion/ET-GAM-001-achievements.md`
**Propósito:** Especificación técnica completa del sistema de achievements
**Audiencia:** Backend Developers, Frontend Developers, QA Team
