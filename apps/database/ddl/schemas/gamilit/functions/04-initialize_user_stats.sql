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
-- Updated: 2025-12-26 - Added is_current and achieved_at explicitly to user_ranks INSERT
-- Updated: 2025-12-27 - P0-001: Added EXCEPTION handling for robust error recovery
--   - Errors now logged to audit_logging.pending_user_initialization
--   - Trigger no longer blocks user creation on gamification errors
-- Updated: 2025-12-28 - DB-125: CRITICAL FIX - user_id references
--   - user_stats.user_id debe ser profiles.id (NEW.id), NO profiles.user_id
--   - user_ranks.user_id debe ser profiles.id (NEW.id), NO profiles.user_id
--   - FKs apuntan a profiles(id), no a auth.users(id)
-- Updated: 2025-12-28 - OPTIMIZACION: Seeds -> Triggers
--   - Agregado SECURITY DEFINER para bypass RLS en user_preferences
--   - Agregado INSERT en user_preferences (defaults)
--   - Agregado INSERT en ml_coins_transactions (welcome bonus audit)
--   - Agregado INSERT en teacher_reports para admin_teacher
-- Updated: 2026-02-20 - F1-B: Added user_achievements initialization
--   - Inserts achievement progress rows for all active achievements on new user creation
--   - Wrapped in own BEGIN...EXCEPTION block so failure doesn't block user creation
-- =====================================================

CREATE OR REPLACE FUNCTION gamilit.initialize_user_stats()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER  -- Permite bypass de RLS para insertar en user_preferences
 SET search_path = gamilit, auth_management, gamification_system, progress_tracking, social_features, audit_logging
AS $function$
DECLARE
    v_error_message TEXT;
    v_error_detail TEXT;
    v_error_code TEXT;
BEGIN
    -- Initialize gamification for students, teachers, and admins
    -- Only these roles have gamification enabled
    IF NEW.role IN ('student', 'admin_teacher', 'super_admin') THEN
        -- DB-125: user_stats.user_id FK apunta a profiles(id), usar NEW.id
        INSERT INTO gamification_system.user_stats (
            user_id,
            tenant_id,
            ml_coins,
            ml_coins_earned_total
        ) VALUES (
            NEW.id,  -- DB-125: CORREGIDO - usar profiles.id, no profiles.user_id
            NEW.tenant_id,
            100, -- Welcome bonus
            100
        )
        ON CONFLICT (user_id) DO NOTHING;  -- Prevent duplicates

        -- [2025-12-28] Registrar transaccion de bono de bienvenida para auditoria
        -- [2026-01-04] CORREGIDO: Eliminada columna 'source' inexistente, usando reference_type y metadata
        INSERT INTO gamification_system.ml_coins_transactions (
            user_id,
            tenant_id,
            amount,
            balance_before,
            balance_after,
            transaction_type,
            description,
            reason,
            reference_type,
            metadata
        ) VALUES (
            NEW.id,
            NEW.tenant_id,
            100,  -- Welcome bonus
            0,    -- Balance antes (nuevo usuario)
            100,  -- Balance despues
            'earn',
            'Bono de bienvenida al registrarte en GAMILIT',
            'system_welcome_bonus',
            'admin',  -- Tipo admin para acciones del sistema
            jsonb_build_object(
                'trigger', 'initialize_user_stats',
                'version', '2.1',
                'source', 'system_welcome_bonus',
                'created_at', gamilit.now_mexico()::text
            )
        )
        ON CONFLICT DO NOTHING;

        -- Create comodines inventory
        -- IMPORTANT: comodines_inventory.user_id references profiles.id (NOT auth.users.id)
        INSERT INTO gamification_system.comodines_inventory (
            user_id
        ) VALUES (
            NEW.id  -- CORRECTED: usar NEW.id (profiles.id) porque FK apunta a profiles(id)
        )
        ON CONFLICT (user_id) DO NOTHING;

        -- [2025-12-28] Crear preferencias de usuario con valores default
        -- SECURITY DEFINER permite bypass de RLS en esta tabla
        INSERT INTO auth_management.user_preferences (
            user_id,
            theme,
            language,
            notifications_enabled,
            email_notifications,
            sound_enabled,
            tutorial_completed,
            preferences
        ) VALUES (
            NEW.id,
            'light',        -- Tema default
            'es',           -- Idioma español
            true,           -- Notificaciones habilitadas
            true,           -- Email notifications habilitadas
            true,           -- Sonido habilitado
            false,          -- Tutorial pendiente
            jsonb_build_object(
                'gamification_hints', true,
                'show_leaderboard', true,
                'auto_play_audio', false
            )
        )
        ON CONFLICT (user_id) DO NOTHING;

        -- Create initial user rank (starting with Ajaw - lowest rank)
        -- BUG FIX #2: Use WHERE NOT EXISTS instead of ON CONFLICT (no unique constraint on user_id)
        -- 2025-12-26: Agregado is_current = true explícitamente
        -- DB-125: user_ranks.user_id FK apunta a profiles(id), usar NEW.id
        INSERT INTO gamification_system.user_ranks (
            user_id,
            tenant_id,
            current_rank,
            is_current,
            achieved_at
        )
        SELECT
            NEW.id,  -- DB-125: CORREGIDO - usar profiles.id, no profiles.user_id
            NEW.tenant_id,
            'Ajaw'::gamification_system.maya_rank,
            true,
            gamilit.now_mexico()
        WHERE NOT EXISTS (
            SELECT 1 FROM gamification_system.user_ranks WHERE user_id = NEW.id
        );

        -- ========================================
        -- 5. INITIALIZE ACHIEVEMENT PROGRESS
        -- ========================================
        BEGIN
          INSERT INTO gamification_system.user_achievements (
            user_id, achievement_id, progress, max_progress, is_completed, completion_percentage
          )
          SELECT
            NEW.id,
            a.id,
            0,
            CASE
              WHEN a.conditions->'requirements'->>'exercises_completed' IS NOT NULL
                THEN (a.conditions->'requirements'->>'exercises_completed')::int
              WHEN a.conditions->'requirements'->>'streak_days' IS NOT NULL
                THEN (a.conditions->'requirements'->>'streak_days')::int
              WHEN a.conditions->'requirements'->>'perfect_scores' IS NOT NULL
                THEN (a.conditions->'requirements'->>'perfect_scores')::int
              WHEN a.conditions->'requirements'->>'modules_completed' IS NOT NULL
                THEN (a.conditions->'requirements'->>'modules_completed')::int
              WHEN a.conditions->'requirements'->>'count' IS NOT NULL
                THEN (a.conditions->'requirements'->>'count')::int
              ELSE 1
            END,
            false,
            0.00
          FROM gamification_system.achievements a
          WHERE a.is_active = true
          ON CONFLICT (user_id, achievement_id) DO NOTHING;

          RAISE NOTICE '[initialize_user_stats] Achievement progress initialized for user %', NEW.id;
        EXCEPTION WHEN OTHERS THEN
          RAISE WARNING '[initialize_user_stats] Non-blocking: achievements init failed for %: %', NEW.id, SQLERRM;
        END;

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

        -- [2025-12-28] Inicializacion especifica para profesores
        IF NEW.role = 'admin_teacher' THEN
            -- Crear reporte inicial mensual para el profesor
            INSERT INTO social_features.teacher_reports (
                teacher_id,
                tenant_id,
                report_name,
                report_type,
                report_format,
                period_start,
                period_end,
                status,
                metadata
            ) VALUES (
                NEW.id,
                NEW.tenant_id,
                'Reporte Mensual Inicial - ' || to_char(gamilit.now_mexico(), 'Month YYYY'),
                'monthly',
                'pdf',
                date_trunc('month', gamilit.now_mexico()),
                date_trunc('month', gamilit.now_mexico()) + INTERVAL '1 month' - INTERVAL '1 day',
                'pending',
                jsonb_build_object(
                    'auto_created', true,
                    'trigger', 'initialize_user_stats',
                    'description', 'Reporte automatico creado al registrar profesor'
                )
            )
            ON CONFLICT DO NOTHING;
        END IF;

    END IF;

    RETURN NEW;

EXCEPTION
    WHEN OTHERS THEN
        -- Capture error details
        GET STACKED DIAGNOSTICS
            v_error_message = MESSAGE_TEXT,
            v_error_detail = PG_EXCEPTION_DETAIL,
            v_error_code = RETURNED_SQLSTATE;

        -- Log warning but DO NOT block user creation
        RAISE WARNING '[P0-001] Error initializing gamification for user %: % (SQLSTATE: %)',
            NEW.user_id, v_error_message, v_error_code;

        -- Record in pending_user_initialization for retry
        BEGIN
            INSERT INTO audit_logging.pending_user_initialization (
                user_id,
                profile_id,
                tenant_id,
                error_message,
                error_code,
                error_detail,
                trigger_name,
                function_name,
                status,
                next_retry_at
            ) VALUES (
                NEW.user_id,
                NEW.id,
                NEW.tenant_id,
                v_error_message,
                v_error_code,
                v_error_detail,
                TG_NAME,
                'gamilit.initialize_user_stats',
                'pending',
                gamilit.now_mexico() + INTERVAL '5 minutes'
            );
        EXCEPTION
            WHEN OTHERS THEN
                -- If even logging fails, just warn and continue
                RAISE WARNING '[P0-001] Could not log initialization error: %', SQLERRM;
        END;

        -- CRITICAL: Still return NEW to allow profile creation to succeed
        -- User will be flagged for manual initialization
        RETURN NEW;
END;
$function$;

COMMENT ON FUNCTION gamilit.initialize_user_stats() IS 'Inicializa estadísticas de gamificación para nuevos usuarios';
