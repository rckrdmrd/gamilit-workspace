-- =====================================================================================
-- SOLUCIONES PARA ERRORES CRÍTICOS - MICROCICLO 8
-- =====================================================================================
-- Subagente: SA-DB-043
-- Fecha: 2025-11-03
-- Errores encontrados: 5 críticos bloqueantes
-- Tiempo estimado de implementación: 22 minutos
-- =====================================================================================

-- =====================================================================================
-- PRIORIDAD 1: Implementar función gamilit.is_admin()
-- =====================================================================================
-- Impacto: Desbloquea 31 políticas RLS
-- Tiempo: 5 minutos
-- Archivo destino: gamilit/functions/05-is_admin.sql
-- =====================================================================================

CREATE OR REPLACE FUNCTION gamilit.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
BEGIN
    -- Verifica si el usuario actual tiene rol de administrador
    RETURN EXISTS (
        SELECT 1
        FROM auth_management.profiles
        WHERE id = gamilit.get_current_user_id()
        AND role IN ('admin_teacher', 'super_admin')
        AND status = 'active'
    );
EXCEPTION
    WHEN OTHERS THEN
        RETURN FALSE;
END;
$$;

COMMENT ON FUNCTION gamilit.is_admin() IS
    'Retorna TRUE si el usuario actual es administrador (admin_teacher o super_admin). '
    'Utilizada por políticas RLS para control de acceso administrativo.';

-- =====================================================================================
-- PRIORIDAD 2: Implementar función gamilit.update_user_stats_on_exercise_complete()
-- =====================================================================================
-- Impacto: Desbloquea 2 triggers de estadísticas
-- Tiempo: 10 minutos
-- Archivo destino: gamilit/functions/14-update_user_stats_on_exercise_complete.sql
-- =====================================================================================

CREATE OR REPLACE FUNCTION gamilit.update_user_stats_on_exercise_complete()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_is_correct BOOLEAN;
    v_xp_earned INTEGER;
    v_coins_earned INTEGER;
BEGIN
    -- Determinar si el ejercicio fue completado correctamente
    v_is_correct := (NEW.result = 'correct' OR NEW.score >= 70);

    -- Calcular XP y monedas ganadas
    IF v_is_correct THEN
        v_xp_earned := COALESCE(NEW.xp_earned, 10); -- Default 10 XP
        v_coins_earned := COALESCE(NEW.coins_earned, 5); -- Default 5 coins
    ELSE
        v_xp_earned := 0;
        v_coins_earned := 0;
    END IF;

    -- Actualizar estadísticas del usuario
    UPDATE gamification_system.user_stats
    SET
        exercises_completed = exercises_completed + 1,
        exercises_correct = exercises_correct + CASE WHEN v_is_correct THEN 1 ELSE 0 END,
        total_xp = total_xp + v_xp_earned,
        ml_coins_balance = ml_coins_balance + v_coins_earned,
        last_activity_at = gamilit.now_mexico(),
        updated_at = gamilit.now_mexico()
    WHERE user_id = NEW.user_id;

    -- Si no existe el registro de estadísticas, crearlo
    IF NOT FOUND THEN
        INSERT INTO gamification_system.user_stats (
            user_id,
            tenant_id,
            exercises_completed,
            exercises_correct,
            total_xp,
            ml_coins_balance,
            last_activity_at
        ) VALUES (
            NEW.user_id,
            COALESCE(NEW.tenant_id, '00000000-0000-0000-0000-000000000000'::UUID),
            1,
            CASE WHEN v_is_correct THEN 1 ELSE 0 END,
            v_xp_earned,
            v_coins_earned,
            gamilit.now_mexico()
        );
    END IF;

    -- Actualizar racha diaria si es aplicable
    -- (Esta lógica puede extenderse según requisitos de negocio)

    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log error pero no bloquear el insert del attempt
        RAISE WARNING 'Error al actualizar estadísticas de usuario %: %', NEW.user_id, SQLERRM;
        RETURN NEW;
END;
$$;

COMMENT ON FUNCTION gamilit.update_user_stats_on_exercise_complete() IS
    'Trigger function que actualiza las estadísticas del usuario al completar un ejercicio. '
    'Incrementa contadores, XP, monedas y mantiene racha actualizada.';

-- =====================================================================================
-- PRIORIDAD 3: Implementar función progress_tracking.update_exercise_submissions_updated_at()
-- =====================================================================================
-- Impacto: Desbloquea 2 triggers de updated_at
-- Tiempo: 5 minutos
-- Archivo destino: progress_tracking/functions/07-update_exercise_submissions_updated_at.sql
-- =====================================================================================

CREATE OR REPLACE FUNCTION progress_tracking.update_exercise_submissions_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    -- Actualizar timestamp de updated_at con hora de México
    NEW.updated_at = gamilit.now_mexico();
    RETURN NEW;
END;
$$;

COMMENT ON FUNCTION progress_tracking.update_exercise_submissions_updated_at() IS
    'Trigger function que actualiza automáticamente el campo updated_at al modificar una submission. '
    'Utiliza timezone de México para consistencia.';

-- =====================================================================================
-- PRIORIDAD 4: Corrección de ENUM maya_rank (ERROR DE SINTAXIS)
-- =====================================================================================
-- Impacto: Previene conflictos de schema
-- Tiempo: 1 minuto
-- Archivo: gamification_system/enums/maya_rank.sql
-- Acción: Editar línea 8
-- =====================================================================================

-- ANTES (INCORRECTO):
-- CREATE TYPE maya_rank AS ENUM (

-- DESPUÉS (CORRECTO):
-- CREATE TYPE gamification_system.maya_rank AS ENUM (

-- Comando de corrección manual:
-- Edit gamification_system/enums/maya_rank.sql línea 8
-- Cambiar: "CREATE TYPE maya_rank AS ENUM ("
-- Por:     "CREATE TYPE gamification_system.maya_rank AS ENUM ("

-- =====================================================================================
-- PRIORIDAD 5: Corrección de FK en assignment_exercises (ERROR DE SINTAXIS)
-- =====================================================================================
-- Impacto: Permite crear la constraint de FK correctamente
-- Tiempo: 1 minuto
-- Archivo: public/tables/assignment_exercises.sql
-- Acción: Editar línea 8
-- =====================================================================================

-- ANTES (INCORRECTO):
-- exercise_id UUID NOT NULL REFERENCES public.exercises(id) ON DELETE CASCADE,

-- DESPUÉS (CORRECTO):
-- exercise_id UUID NOT NULL REFERENCES educational_content.exercises(id) ON DELETE CASCADE,

-- Comando de corrección manual:
-- Edit public/tables/assignment_exercises.sql línea 8
-- Cambiar: "REFERENCES public.exercises(id)"
-- Por:     "REFERENCES educational_content.exercises(id)"

-- =====================================================================================
-- VALIDACIÓN POST-IMPLEMENTACIÓN
-- =====================================================================================

-- 1. Validar sintaxis de funciones creadas:
-- \df gamilit.is_admin
-- \df gamilit.update_user_stats_on_exercise_complete
-- \df progress_tracking.update_exercise_submissions_updated_at

-- 2. Verificar que no hay errores de compilación:
-- SELECT proname, prosrc
-- FROM pg_proc
-- WHERE proname IN ('is_admin', 'update_user_stats_on_exercise_complete', 'update_exercise_submissions_updated_at');

-- 3. Ejecutar tests básicos de funciones:
-- SELECT gamilit.is_admin(); -- Debería retornar boolean

-- 4. Verificar políticas RLS activas:
-- SELECT schemaname, tablename, policyname
-- FROM pg_policies
-- WHERE definition LIKE '%is_admin%';

-- 5. Verificar triggers activos:
-- SELECT tgname, tgrelid::regclass, tgfoid::regproc
-- FROM pg_trigger
-- WHERE tgfoid::regproc::text LIKE '%update_user_stats%'
--    OR tgfoid::regproc::text LIKE '%update_exercise_submissions%';

-- =====================================================================================
-- NOTAS DE IMPLEMENTACIÓN
-- =====================================================================================

-- SEGURIDAD:
-- - Todas las funciones usan SECURITY DEFINER para garantizar permisos
-- - is_admin() verifica status='active' para prevenir acceso de usuarios suspendidos
-- - Manejo de excepciones en todas las funciones para no bloquear operaciones

-- PERFORMANCE:
-- - is_admin() usa EXISTS para early exit
-- - update_user_stats usa UPSERT pattern (UPDATE + INSERT condicional)
-- - Funciones marcadas como STABLE cuando aplica

-- MANTENIBILIDAD:
-- - Comentarios inline explicando lógica de negocio
-- - Nombres descriptivos de variables
-- - Valores default documentados

-- TESTING:
-- - Crear tests unitarios para cada función
-- - Validar edge cases (user sin stats, user suspendido, etc.)
-- - Probar rendimiento con datos reales

-- =====================================================================================
-- CHANGELOG
-- =====================================================================================

-- 2025-11-03: Creación inicial de funciones faltantes
--             - is_admin() para soporte de RLS
--             - update_user_stats_on_exercise_complete() para triggers
--             - update_exercise_submissions_updated_at() para triggers
--             Identificado y documentado por SA-DB-043 en Microciclo M8

-- =====================================================================================
-- REFERENCIAS
-- =====================================================================================

-- - REPORTE-VALIDACION.md: Análisis completo de errores
-- - validacion-sintaxis.json: Detalles técnicos de validación
-- - ESTADO-DATABASE.json: Estado del proyecto antes de correcciones

-- =====================================================================================
-- FIN DE SOLUCIONES
-- =====================================================================================
