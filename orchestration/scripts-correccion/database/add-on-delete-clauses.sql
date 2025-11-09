-- ============================================================================
-- SCRIPT: Add ON DELETE Clauses to FK Constraints (P1 - CRÍTICO)
-- Fecha: 2025-11-08
-- Descripción: Agrega cláusulas ON DELETE a 15 FK que no las tienen
-- ============================================================================
--
-- PROBLEMA:
--   Múltiples FK no especifican comportamiento ON DELETE, dejando el
--   comportamiento por defecto (NO ACTION), lo cual puede causar errores
--   inesperados al intentar borrar registros padre.
--
-- COMPORTAMIENTOS ON DELETE:
--   - CASCADE:     Borra automáticamente los registros hijos
--   - RESTRICT:    Previene borrar el padre si tiene hijos
--   - SET NULL:    Establece NULL en los hijos (columna debe ser nullable)
--   - SET DEFAULT: Establece valor por defecto en los hijos
--   - NO ACTION:   Similar a RESTRICT (comportamiento por defecto)
--
-- GUÍA DE DECISIÓN:
--   - Relaciones de composición (hijos no existen sin padre): CASCADE
--   - Relaciones de catálogo/referencia: RESTRICT
--   - Relaciones de auditoría/tracking: SET NULL
--
-- IMPACTO:
--   🟠 MEDIO-ALTO - Comportamiento indefinido al borrar datos
--
-- USO:
--   psql "$DATABASE_URL" -f apps/database/scripts/add-on-delete-clauses.sql
--
-- ============================================================================

BEGIN;

-- ============================================================================
-- 1. auth_management.user_roles
-- ============================================================================

RAISE NOTICE 'Adding ON DELETE to auth_management.user_roles...';

-- user_roles.profile_id → profiles(id) - CASCADE
ALTER TABLE auth_management.user_roles
    DROP CONSTRAINT IF EXISTS user_roles_profile_id_fkey,
    DROP CONSTRAINT IF EXISTS fk_user_roles_profile_id;

ALTER TABLE auth_management.user_roles
    ADD CONSTRAINT fk_user_roles_profile_id
        FOREIGN KEY (profile_id)
        REFERENCES auth_management.profiles(id)
        ON DELETE CASCADE  -- Si se borra el perfil, borrar sus roles
        ON UPDATE CASCADE;

RAISE NOTICE '✅ user_roles.profile_id → CASCADE';

-- user_roles.role_id → roles(id) - RESTRICT
ALTER TABLE auth_management.user_roles
    DROP CONSTRAINT IF EXISTS user_roles_role_id_fkey,
    DROP CONSTRAINT IF EXISTS fk_user_roles_role_id;

ALTER TABLE auth_management.user_roles
    ADD CONSTRAINT fk_user_roles_role_id
        FOREIGN KEY (role_id)
        REFERENCES auth_management.roles(id)
        ON DELETE RESTRICT  -- No permitir borrar rol si está asignado
        ON UPDATE CASCADE;

RAISE NOTICE '✅ user_roles.role_id → RESTRICT';

-- ============================================================================
-- 2. educational_content.exercises
-- ============================================================================

RAISE NOTICE 'Adding ON DELETE to educational_content.exercises...';

ALTER TABLE educational_content.exercises
    DROP CONSTRAINT IF EXISTS exercises_module_id_fkey,
    DROP CONSTRAINT IF EXISTS fk_exercises_module_id;

ALTER TABLE educational_content.exercises
    ADD CONSTRAINT fk_exercises_module_id
        FOREIGN KEY (module_id)
        REFERENCES educational_content.modules(id)
        ON DELETE CASCADE  -- Si se borra el módulo, borrar sus ejercicios
        ON UPDATE CASCADE;

RAISE NOTICE '✅ exercises.module_id → CASCADE';

-- ============================================================================
-- 3. educational_content.assessment_rubrics
-- ============================================================================

RAISE NOTICE 'Adding ON DELETE to educational_content.assessment_rubrics...';

ALTER TABLE educational_content.assessment_rubrics
    DROP CONSTRAINT IF EXISTS assessment_rubrics_exercise_id_fkey,
    DROP CONSTRAINT IF EXISTS fk_assessment_rubrics_exercise_id;

ALTER TABLE educational_content.assessment_rubrics
    ADD CONSTRAINT fk_assessment_rubrics_exercise_id
        FOREIGN KEY (exercise_id)
        REFERENCES educational_content.exercises(id)
        ON DELETE CASCADE  -- Si se borra el ejercicio, borrar sus rúbricas
        ON UPDATE CASCADE;

RAISE NOTICE '✅ assessment_rubrics.exercise_id → CASCADE';

-- ============================================================================
-- 4. gamification_system.user_achievements
-- ============================================================================

RAISE NOTICE 'Adding ON DELETE to gamification_system.user_achievements...';

ALTER TABLE gamification_system.user_achievements
    DROP CONSTRAINT IF EXISTS user_achievements_achievement_id_fkey,
    DROP CONSTRAINT IF EXISTS fk_user_achievements_achievement_id;

ALTER TABLE gamification_system.user_achievements
    ADD CONSTRAINT fk_user_achievements_achievement_id
        FOREIGN KEY (achievement_id)
        REFERENCES gamification_system.achievements(id)
        ON DELETE RESTRICT  -- No permitir borrar achievement si ya fue otorgado
        ON UPDATE CASCADE;

RAISE NOTICE '✅ user_achievements.achievement_id → RESTRICT';

-- ============================================================================
-- 5. gamification_system.user_powerups
-- ============================================================================

RAISE NOTICE 'Adding ON DELETE to gamification_system.user_powerups...';

ALTER TABLE gamification_system.user_powerups
    DROP CONSTRAINT IF EXISTS user_powerups_powerup_id_fkey,
    DROP CONSTRAINT IF EXISTS fk_user_powerups_powerup_id;

ALTER TABLE gamification_system.user_powerups
    ADD CONSTRAINT fk_user_powerups_powerup_id
        FOREIGN KEY (powerup_id)
        REFERENCES gamification_system.powerups(id)
        ON DELETE RESTRICT  -- No permitir borrar powerup si fue otorgado
        ON UPDATE CASCADE;

RAISE NOTICE '✅ user_powerups.powerup_id → RESTRICT';

-- ============================================================================
-- 6. gamification_system.ml_coins_transactions
-- ============================================================================

RAISE NOTICE 'Adding ON DELETE to gamification_system.ml_coins_transactions...';

ALTER TABLE gamification_system.ml_coins_transactions
    DROP CONSTRAINT IF EXISTS ml_coins_transactions_related_achievement_id_fkey,
    DROP CONSTRAINT IF EXISTS fk_ml_coins_transactions_related_achievement_id;

ALTER TABLE gamification_system.ml_coins_transactions
    ADD CONSTRAINT fk_ml_coins_transactions_related_achievement_id
        FOREIGN KEY (related_achievement_id)
        REFERENCES gamification_system.achievements(id)
        ON DELETE SET NULL  -- Si se borra el achievement, mantener transacción pero sin referencia
        ON UPDATE CASCADE;

RAISE NOTICE '✅ ml_coins_transactions.related_achievement_id → SET NULL';

-- ============================================================================
-- 7. progress_tracking.module_progress
-- ============================================================================

RAISE NOTICE 'Adding ON DELETE to progress_tracking.module_progress...';

ALTER TABLE progress_tracking.module_progress
    DROP CONSTRAINT IF EXISTS module_progress_module_id_fkey,
    DROP CONSTRAINT IF EXISTS fk_module_progress_module_id;

ALTER TABLE progress_tracking.module_progress
    ADD CONSTRAINT fk_module_progress_module_id
        FOREIGN KEY (module_id)
        REFERENCES educational_content.modules(id)
        ON DELETE CASCADE  -- Si se borra el módulo, borrar el progreso
        ON UPDATE CASCADE;

RAISE NOTICE '✅ module_progress.module_id → CASCADE';

-- module_progress.classroom_id (si existe)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'progress_tracking'
          AND table_name = 'module_progress'
          AND column_name = 'classroom_id'
    ) THEN
        ALTER TABLE progress_tracking.module_progress
            DROP CONSTRAINT IF EXISTS module_progress_classroom_id_fkey,
            DROP CONSTRAINT IF EXISTS fk_module_progress_classroom_id;

        ALTER TABLE progress_tracking.module_progress
            ADD CONSTRAINT fk_module_progress_classroom_id
                FOREIGN KEY (classroom_id)
                REFERENCES social_features.classrooms(id)
                ON DELETE SET NULL  -- Si se borra el classroom, mantener progreso individual
                ON UPDATE CASCADE;

        RAISE NOTICE '✅ module_progress.classroom_id → SET NULL';
    END IF;
END $$;

-- ============================================================================
-- 8. progress_tracking.exercise_submissions
-- ============================================================================

RAISE NOTICE 'Adding ON DELETE to progress_tracking.exercise_submissions...';

ALTER TABLE progress_tracking.exercise_submissions
    DROP CONSTRAINT IF EXISTS exercise_submissions_exercise_id_fkey,
    DROP CONSTRAINT IF EXISTS fk_exercise_submissions_exercise_id;

ALTER TABLE progress_tracking.exercise_submissions
    ADD CONSTRAINT fk_exercise_submissions_exercise_id
        FOREIGN KEY (exercise_id)
        REFERENCES educational_content.exercises(id)
        ON DELETE CASCADE  -- Si se borra el ejercicio, borrar las submissions
        ON UPDATE CASCADE;

RAISE NOTICE '✅ exercise_submissions.exercise_id → CASCADE';

-- ============================================================================
-- 9. progress_tracking.learning_sessions
-- ============================================================================

RAISE NOTICE 'Adding ON DELETE to progress_tracking.learning_sessions...';

ALTER TABLE progress_tracking.learning_sessions
    DROP CONSTRAINT IF EXISTS learning_sessions_module_id_fkey,
    DROP CONSTRAINT IF EXISTS fk_learning_sessions_module_id;

ALTER TABLE progress_tracking.learning_sessions
    ADD CONSTRAINT fk_learning_sessions_module_id
        FOREIGN KEY (module_id)
        REFERENCES educational_content.modules(id)
        ON DELETE CASCADE  -- Si se borra el módulo, borrar las sesiones
        ON UPDATE CASCADE;

RAISE NOTICE '✅ learning_sessions.module_id → CASCADE';

-- learning_sessions.classroom_id (si existe)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'progress_tracking'
          AND table_name = 'learning_sessions'
          AND column_name = 'classroom_id'
    ) THEN
        ALTER TABLE progress_tracking.learning_sessions
            DROP CONSTRAINT IF EXISTS learning_sessions_classroom_id_fkey,
            DROP CONSTRAINT IF EXISTS fk_learning_sessions_classroom_id;

        ALTER TABLE progress_tracking.learning_sessions
            ADD CONSTRAINT fk_learning_sessions_classroom_id
                FOREIGN KEY (classroom_id)
                REFERENCES social_features.classrooms(id)
                ON DELETE SET NULL
                ON UPDATE CASCADE;

        RAISE NOTICE '✅ learning_sessions.classroom_id → SET NULL';
    END IF;
END $$;

-- ============================================================================
-- 10. social_features.classroom_members
-- ============================================================================

RAISE NOTICE 'Adding ON DELETE to social_features.classroom_members...';

ALTER TABLE social_features.classroom_members
    DROP CONSTRAINT IF EXISTS classroom_members_classroom_id_fkey,
    DROP CONSTRAINT IF EXISTS fk_classroom_members_classroom_id;

ALTER TABLE social_features.classroom_members
    ADD CONSTRAINT fk_classroom_members_classroom_id
        FOREIGN KEY (classroom_id)
        REFERENCES social_features.classrooms(id)
        ON DELETE CASCADE  -- Si se borra el classroom, borrar los miembros
        ON UPDATE CASCADE;

RAISE NOTICE '✅ classroom_members.classroom_id → CASCADE';

ALTER TABLE social_features.classroom_members
    DROP CONSTRAINT IF EXISTS classroom_members_user_id_fkey,
    DROP CONSTRAINT IF EXISTS fk_classroom_members_user_id;

ALTER TABLE social_features.classroom_members
    ADD CONSTRAINT fk_classroom_members_user_id
        FOREIGN KEY (user_id)
        REFERENCES auth_management.profiles(id)
        ON DELETE CASCADE  -- Si se borra el usuario, borrar su membresía
        ON UPDATE CASCADE;

RAISE NOTICE '✅ classroom_members.user_id → CASCADE';

-- ============================================================================
-- 11. social_features.team_members
-- ============================================================================

RAISE NOTICE 'Adding ON DELETE to social_features.team_members...';

ALTER TABLE social_features.team_members
    DROP CONSTRAINT IF EXISTS team_members_team_id_fkey,
    DROP CONSTRAINT IF EXISTS fk_team_members_team_id;

ALTER TABLE social_features.team_members
    ADD CONSTRAINT fk_team_members_team_id
        FOREIGN KEY (team_id)
        REFERENCES social_features.teams(id)
        ON DELETE CASCADE  -- Si se borra el equipo, borrar los miembros
        ON UPDATE CASCADE;

RAISE NOTICE '✅ team_members.team_id → CASCADE';

-- ============================================================================
-- 12. content_management.media_files
-- ============================================================================

RAISE NOTICE 'Adding ON DELETE to content_management.media_files...';

ALTER TABLE content_management.media_files
    DROP CONSTRAINT IF EXISTS media_files_uploaded_by_fkey,
    DROP CONSTRAINT IF EXISTS fk_media_files_uploaded_by;

ALTER TABLE content_management.media_files
    ADD CONSTRAINT fk_media_files_uploaded_by
        FOREIGN KEY (uploaded_by)
        REFERENCES auth_management.profiles(id)
        ON DELETE SET NULL  -- Si se borra el usuario, mantener el archivo
        ON UPDATE CASCADE;

RAISE NOTICE '✅ media_files.uploaded_by → SET NULL';

-- ============================================================================
-- 13. system_configuration.feature_flags
-- ============================================================================

RAISE NOTICE 'Adding ON DELETE to system_configuration.feature_flags...';

ALTER TABLE system_configuration.feature_flags
    DROP CONSTRAINT IF EXISTS feature_flags_created_by_fkey,
    DROP CONSTRAINT IF EXISTS fk_feature_flags_created_by;

ALTER TABLE system_configuration.feature_flags
    ADD CONSTRAINT fk_feature_flags_created_by
        FOREIGN KEY (created_by)
        REFERENCES auth_management.profiles(id)
        ON DELETE SET NULL  -- Si se borra el usuario, mantener el feature flag
        ON UPDATE CASCADE;

RAISE NOTICE '✅ feature_flags.created_by → SET NULL';

COMMIT;

-- ============================================================================
-- ACTUALIZAR ARCHIVOS DDL
-- ============================================================================
--
-- ACCIÓN MANUAL REQUERIDA: Actualizar los archivos DDL correspondientes
-- para agregar ON DELETE clauses a todas las FK modificadas.
--
-- Ver lista completa en el reporte de validación.
--
-- ============================================================================

-- ============================================================================
-- VALIDACIÓN POST-CORRECCIÓN
-- ============================================================================

DO $$
DECLARE
    v_no_action_count INTEGER;
    v_total_fk_count INTEGER;
BEGIN
    -- Contar FK que siguen sin ON DELETE explícito (NO ACTION)
    SELECT COUNT(*) INTO v_no_action_count
    FROM information_schema.referential_constraints
    WHERE constraint_schema NOT IN ('pg_catalog', 'information_schema')
      AND delete_rule = 'NO ACTION';

    -- Contar total de FK
    SELECT COUNT(*) INTO v_total_fk_count
    FROM information_schema.referential_constraints
    WHERE constraint_schema NOT IN ('pg_catalog', 'information_schema');

    RAISE NOTICE '';
    RAISE NOTICE '============================================================================';
    RAISE NOTICE 'ON DELETE Clauses Addition Summary';
    RAISE NOTICE '============================================================================';
    RAISE NOTICE 'Total FK constraints: %', v_total_fk_count;
    RAISE NOTICE 'FK with NO ACTION: % (%.1f%%)',
        v_no_action_count,
        (v_no_action_count::NUMERIC / NULLIF(v_total_fk_count, 0) * 100);

    IF v_no_action_count = 0 THEN
        RAISE NOTICE '✅ All FK constraints have explicit ON DELETE behavior';
    ELSE
        RAISE NOTICE '⚠️  Some FK constraints still use default NO ACTION';
        RAISE NOTICE 'Run the following query to see them:';
        RAISE NOTICE 'SELECT constraint_schema, constraint_name, delete_rule FROM information_schema.referential_constraints WHERE delete_rule = ''NO ACTION'' AND constraint_schema NOT IN (''pg_catalog'', ''information_schema'');';
    END IF;

    RAISE NOTICE '';
    RAISE NOTICE 'Distribution of ON DELETE behaviors:';

    -- Mostrar distribución de comportamientos
    PERFORM
        RAISE NOTICE '  - %: %',
            delete_rule,
            COUNT(*)
    FROM information_schema.referential_constraints
    WHERE constraint_schema NOT IN ('pg_catalog', 'information_schema')
    GROUP BY delete_rule
    ORDER BY COUNT(*) DESC;

    RAISE NOTICE '';
    RAISE NOTICE 'Next step: Update DDL files to reflect these changes';
    RAISE NOTICE '============================================================================';
END $$;
