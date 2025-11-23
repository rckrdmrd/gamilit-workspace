-- =====================================================
-- Tabla: schema_name.table_name
-- Descripción: [Descripción concisa de 1-2 líneas sobre el propósito de esta tabla]
--
-- 📚 TRAZABILIDAD:
-- └─ Requerimiento: docs/01-requerimientos/[modulo]/RF-XXX-YYY-titulo.md
-- └─ Especificación: docs/02-especificaciones-tecnicas/[modulo]/ET-XXX-YYY-titulo.md
-- └─ Documentación: docs/03-desarrollo/base-de-datos/ESQUEMA-COMPLETO.md (Sección X.Y, Línea ZZZ)
--
-- 🔗 IMPLEMENTACIÓN:
-- └─ Backend Entity: apps/backend/src/modules/[modulo]/entities/[entity].entity.ts
-- └─ Frontend Types: apps/frontend/src/types/[tipo].types.ts
-- └─ Frontend Feature: apps/frontend/src/features/[feature]/
--
-- 📅 METADATA:
-- └─ Creado: [YYYY-MM-DD]
-- └─ Última modificación: [YYYY-MM-DD]
-- └─ Versión: [X.Y]
-- └─ Autor: [Nombre o "NEXUS-DATABASE-AVANZADO"]
-- =====================================================

-- NOTA: Este es un TEMPLATE. Reemplazar TODOS los valores entre [] con información real.

-- =====================================================
-- EJEMPLO COMPLETO: Tabla gamification_system.user_stats
-- =====================================================
-- Tabla: gamification_system.user_stats
-- Descripción: Estadísticas centrales de gamificación por usuario incluyendo
--              nivel, XP, ML Coins, rachas y contadores de progreso.
--
-- 📚 TRAZABILIDAD:
-- └─ Requerimiento: docs/01-requerimientos/02-gamificacion/RF-GAM-001-achievements.md
-- └─ Requerimiento: docs/01-requerimientos/02-gamificacion/RF-GAM-002-economia-ml-coins.md
-- └─ Requerimiento: docs/01-requerimientos/02-gamificacion/RF-GAM-003-rangos-maya.md
-- └─ Especificación: docs/02-especificaciones-tecnicas/02-gamificacion/ET-GAM-001-achievements.md
-- └─ Especificación: docs/02-especificaciones-tecnicas/02-gamificacion/ET-GAM-002-economia-ml-coins.md
-- └─ Especificación: docs/02-especificaciones-tecnicas/02-gamificacion/ET-GAM-003-rangos-maya.md
-- └─ Documentación: docs/03-desarrollo/base-de-datos/ESQUEMA-COMPLETO.md (Sección 1.3.1, Línea 263-309)
--
-- 🔗 IMPLEMENTACIÓN:
-- └─ Backend Entity: apps/backend/src/modules/gamification/entities/user-stats.entity.ts
-- └─ Backend Service: apps/backend/src/modules/gamification/services/user-stats.service.ts
-- └─ Frontend Types: apps/frontend/src/types/gamification.types.ts
-- └─ Frontend Feature: apps/frontend/src/features/gamification/
--
-- 📅 METADATA:
-- └─ Creado: 2024-05-20
-- └─ Última modificación: 2025-11-07
-- └─ Versión: 3.2
-- └─ Autor: NEXUS-DATABASE-AVANZADO
-- =====================================================

CREATE TABLE IF NOT EXISTS gamification_system.user_stats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES auth_management.profiles(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES auth_management.tenants(id) ON DELETE CASCADE,

    -- Experiencia y Niveles
    level INTEGER NOT NULL DEFAULT 1 CHECK (level > 0),
    total_xp INTEGER NOT NULL DEFAULT 0 CHECK (total_xp >= 0),
    xp_to_next_level INTEGER NOT NULL DEFAULT 100,

    -- Economía ML Coins
    ml_coins INTEGER NOT NULL DEFAULT 100 CHECK (ml_coins >= 0),
    ml_coins_earned_total INTEGER NOT NULL DEFAULT 100,
    ml_coins_spent_total INTEGER NOT NULL DEFAULT 0,
    ml_coins_earned_today INTEGER NOT NULL DEFAULT 0,

    -- Rachas (Streaks)
    current_streak INTEGER NOT NULL DEFAULT 0 CHECK (current_streak >= 0),
    max_streak INTEGER NOT NULL DEFAULT 0 CHECK (max_streak >= 0),
    days_active_total INTEGER NOT NULL DEFAULT 0 CHECK (days_active_total >= 0),

    -- Contadores de Progreso
    exercises_completed INTEGER NOT NULL DEFAULT 0 CHECK (exercises_completed >= 0),
    modules_completed INTEGER NOT NULL DEFAULT 0 CHECK (modules_completed >= 0),
    total_score INTEGER NOT NULL DEFAULT 0 CHECK (total_score >= 0),
    average_score NUMERIC(5,2),

    -- Rankings (cached)
    global_rank_position INTEGER,
    class_rank_position INTEGER,
    school_rank_position INTEGER,

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_user_stats_user_id ON gamification_system.user_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_user_stats_tenant_id ON gamification_system.user_stats(tenant_id);
CREATE INDEX IF NOT EXISTS idx_user_stats_level ON gamification_system.user_stats(level DESC);
CREATE INDEX IF NOT EXISTS idx_user_stats_ml_coins ON gamification_system.user_stats(ml_coins DESC);

-- Comentarios
COMMENT ON TABLE gamification_system.user_stats IS 'Estadísticas centrales de gamificación por usuario';
COMMENT ON COLUMN gamification_system.user_stats.level IS 'Nivel actual del usuario (calculado desde total_xp)';
COMMENT ON COLUMN gamification_system.user_stats.ml_coins IS 'Balance actual de Maya Learning Coins';
COMMENT ON COLUMN gamification_system.user_stats.current_streak IS 'Racha actual de días consecutivos activos';
