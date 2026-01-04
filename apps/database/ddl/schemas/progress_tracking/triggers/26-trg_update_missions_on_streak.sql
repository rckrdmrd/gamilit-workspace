-- =====================================================
-- Trigger: trg_update_missions_on_streak
-- Table: progress_tracking.exercise_attempts
-- Function: gamilit.trigger_missions_on_correct_streak (wrapper unificado)
-- Event: AFTER INSERT
-- Level: FOR EACH ROW
-- Description: Actualiza progreso de misiones con objetivo 'correct_streak'
-- Created: 2025-11-26
-- =====================================================
--
-- PROPÓSITO:
-- Este trigger conecta la completación de ejercicios con las misiones que
-- tienen objetivo de tipo 'correct_streak' (racha de ejercicios correctos
-- consecutivos).
--
-- Cuando un estudiante completa un ejercicio, este trigger calcula
-- cuántos ejercicios correctos consecutivos ha logrado y actualiza
-- las misiones correspondientes.
--
-- DIFERENCIA CON trg_update_missions_on_exercise (24):
-- - Trigger 24: Actualiza objetivo 'complete_exercises' (incrementa +1)
-- - Trigger 26: Actualiza objetivo 'correct_streak' (establece racha actual)
--
-- ORDEN DE EJECUCIÓN:
-- Los triggers en exercise_attempts se ejecutan en orden alfabético por nombre:
-- 1. exercise_attempts_updated_at (si existe)
-- 2. trg_update_missions_on_exercise (24-) - complete_exercises
-- 3. trg_update_missions_on_streak (26-) <- ESTE TRIGGER - correct_streak
-- 4. trg_update_module_progress_on_exercise
-- 5. trg_update_user_stats_on_exercise
--
-- MISIONES AFECTADAS:
-- - Diarias: "Racha de aciertos" - 2 ejercicios correctos seguidos (30 XP + 15 ML Coins)
--
-- FLUJO:
-- 1. Usuario completa ejercicio → INSERT en exercise_attempts
-- 2. Este trigger detecta el nuevo registro
-- 3. Si is_correct = true, calcula racha de correctos consecutivos
-- 4. Busca misiones activas del usuario con objetivo 'correct_streak'
-- 5. Establece current = racha actual (máximo = target)
-- 6. Recalcula progress (%) de cada misión
-- 7. Si progress = 100%, marca como 'completed'
--
-- NOTAS:
-- - NO bloquea si falla (errores solo se loggean)
-- - Calcula racha basándose en últimos intentos ordenados por fecha
-- - La racha se rompe con cualquier ejercicio incorrecto
-- - Compatible con triggers existentes
-- =====================================================

DROP TRIGGER IF EXISTS trg_update_missions_on_streak ON progress_tracking.exercise_attempts CASCADE;

CREATE TRIGGER trg_update_missions_on_streak
    AFTER INSERT ON progress_tracking.exercise_attempts
    FOR EACH ROW
    EXECUTE FUNCTION gamilit.trigger_missions_on_correct_streak();

-- =====================================================
-- COMENTARIO DEL TRIGGER
-- =====================================================
COMMENT ON TRIGGER trg_update_missions_on_streak ON progress_tracking.exercise_attempts IS
    'Actualiza el progreso de misiones con objetivo correct_streak al completar ejercicios. '
    'Calcula la racha de ejercicios correctos consecutivos del usuario y actualiza las misiones '
    'correspondientes. Complementa el trigger 24 que maneja complete_exercises.';

-- =====================================================
-- VERIFICACIÓN POST-CREACIÓN
-- =====================================================
-- SELECT tgname, tgtype, proname
-- FROM pg_trigger t
-- JOIN pg_proc p ON t.tgfoid = p.oid
-- WHERE tgrelid = 'progress_tracking.exercise_attempts'::regclass
-- ORDER BY tgname;
--
-- Resultado esperado: triggers incluyendo:
-- - trg_update_missions_on_exercise (24) - complete_exercises
-- - trg_update_missions_on_streak (26) - correct_streak <- NUEVO
-- =====================================================

-- =====================================================
-- TESTING
-- =====================================================
--
-- Test 1: Usuario sin intentos previos completa 1 ejercicio correcto
-- INSERT INTO progress_tracking.exercise_attempts (user_id, exercise_id, is_correct)
-- VALUES ('user-uuid', 'exercise-uuid', true);
-- -- Verificar: misión correct_streak tiene current = 1
--
-- Test 2: Usuario con 1 correcto previo completa otro correcto
-- INSERT INTO progress_tracking.exercise_attempts (user_id, exercise_id, is_correct)
-- VALUES ('user-uuid', 'exercise-uuid-2', true);
-- -- Verificar: misión correct_streak tiene current = 2, progress = 100% si target = 2
--
-- Test 3: Usuario con racha de 2 completa uno incorrecto (racha se rompe)
-- INSERT INTO progress_tracking.exercise_attempts (user_id, exercise_id, is_correct)
-- VALUES ('user-uuid', 'exercise-uuid-3', false);
-- -- Verificar: misión correct_streak sin cambios (racha no aumenta)
--
-- Test 4: Usuario reinicia racha después de uno incorrecto
-- INSERT INTO progress_tracking.exercise_attempts (user_id, exercise_id, is_correct)
-- VALUES ('user-uuid', 'exercise-uuid-4', true);
-- -- Verificar: misión correct_streak tiene current = 1 (racha reiniciada)
--
-- =====================================================
-- CHANGELOG
-- =====================================================
-- 2025-11-26: Creación inicial
--             - Implementado para cerrar BUG-002 (correct_streak no se actualizaba)
--             - Usa funcion wrapper gamilit.trigger_missions_on_correct_streak() (unificada 2025-12-29)
--             - Compatible con arquitectura existente
-- =====================================================
