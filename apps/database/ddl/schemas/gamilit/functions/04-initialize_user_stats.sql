-- =====================================================
-- Function: gamilit.initialize_user_stats
-- Description: Inicializa estadísticas de gamificación para nuevos usuarios
-- Parameters: None
-- Returns: trigger
-- Created: 2025-10-27
-- Updated: 2025-11-12 - Extendido para incluir admin_teacher y super_admin
-- Updated: 2025-11-24 - BUG FIXES:
--   #1: Added module_progress initialization (CRITICAL)
--   #2: Added ON CONFLICT to user_ranks (prevents duplicate key errors)
--   #3: Kept initialize_user_missions commented (function not implemented yet)
-- =====================================================

CREATE OR REPLACE FUNCTION gamilit.initialize_user_stats()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    -- Initialize gamification for students, teachers, and admins
    -- Only these roles have gamification enabled
    IF NEW.role IN ('student', 'admin_teacher', 'super_admin') THEN
        -- Use NEW.user_id which points to auth.users.id (correct foreign key reference)
        INSERT INTO gamification_system.user_stats (
            user_id,
            tenant_id,
            ml_coins,
            ml_coins_earned_total
        ) VALUES (
            NEW.user_id,  -- Fixed: usar user_id en lugar de id
            NEW.tenant_id,
            100, -- Welcome bonus
            100
        )
        ON CONFLICT (user_id) DO NOTHING;  -- Prevent duplicates

        -- Create comodines inventory
        -- IMPORTANT: comodines_inventory.user_id references profiles.id (NOT auth.users.id)
        INSERT INTO gamification_system.comodines_inventory (
            user_id
        ) VALUES (
            NEW.id  -- CORRECTED: usar NEW.id (profiles.id) porque FK apunta a profiles(id)
        )
        ON CONFLICT (user_id) DO NOTHING;

        -- Create initial user rank (starting with Ajaw - lowest rank)
        -- BUG FIX #2: Use WHERE NOT EXISTS instead of ON CONFLICT (no unique constraint on user_id)
        INSERT INTO gamification_system.user_ranks (
            user_id,
            tenant_id,
            current_rank
        )
        SELECT
            NEW.user_id,
            NEW.tenant_id,
            'Ajaw'::gamification_system.maya_rank
        WHERE NOT EXISTS (
            SELECT 1 FROM gamification_system.user_ranks WHERE user_id = NEW.user_id
        );

        -- BUG FIX #1: Initialize module progress for all active modules
        -- CRITICAL: New users must see available modules immediately
        -- This was missing and caused "no modules available" errors
        -- IMPORTANT: module_progress.user_id references profiles.id (NOT auth.users.id)
        INSERT INTO progress_tracking.module_progress (
            user_id,
            module_id,
            status,
            progress_percentage,
            created_at,
            updated_at
        )
        SELECT
            NEW.id,  -- FIXED: Use NEW.id (profiles.id) not NEW.user_id (auth.users.id)
            m.id,
            'not_started'::progress_tracking.progress_status,
            0,
            NOW(),
            NOW()
        FROM educational_content.modules m
        WHERE m.is_published = true
          AND m.status = 'published'
        ON CONFLICT (user_id, module_id) DO NOTHING;

        -- Initialize daily and weekly missions for new users
        PERFORM gamilit.initialize_user_missions(NEW.id);
    END IF;

    RETURN NEW;
END;
$function$;

COMMENT ON FUNCTION gamilit.initialize_user_stats() IS 'Inicializa estadísticas de gamificación para nuevos usuarios';
