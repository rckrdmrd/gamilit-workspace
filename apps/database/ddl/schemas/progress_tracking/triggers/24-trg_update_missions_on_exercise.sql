-- =====================================================
-- Trigger: trg_update_missions_on_exercise
-- Table: progress_tracking.exercise_attempts
-- Function: gamilit.update_missions_on_exercise_complete
-- Event: AFTER INSERT
-- Level: FOR EACH ROW
-- Description: Actualiza progreso de misiones al completar ejercicios
-- Created: 2025-11-24
-- =====================================================
--
-- PROPÓSITO:
-- Este trigger conecta la completación de ejercicios con el sistema de misiones.
-- Cuando un estudiante completa un ejercicio correctamente, las misiones
-- diarias/semanales que tengan objetivo 'complete_exercises' se actualizan
-- automáticamente.
--
-- ORDEN DE EJECUCIÓN:
-- Los triggers en exercise_attempts se ejecutan en orden alfabético:
-- 1. trg_update_module_progress_on_exercise (22-)
-- 2. trg_update_missions_on_exercise (24-) <- ESTE TRIGGER
-- 3. trg_update_user_stats_on_exercise (21-)
--
-- MISIONES AFECTADAS:
-- - Diarias: "Completar 3 ejercicios" (50 XP + 25 ML Coins)
-- - Semanales: "Maratón de 15 ejercicios" (200 XP + 100 ML Coins)
--
-- FLUJO:
-- 1. Usuario completa ejercicio → INSERT en exercise_attempts
-- 2. Este trigger detecta is_correct = true
-- 3. Busca misiones activas del usuario con objetivo 'complete_exercises'
-- 4. Incrementa current en cada misión encontrada
-- 5. Recalcula progress (%) de cada misión
-- 6. Si progress = 100%, marca como 'completed'
--
-- NOTAS:
-- - NO bloquea si falla (errores solo se loggean)
-- - Solo afecta ejercicios correctos
-- - Solo afecta misiones no expiradas
-- - Compatible con triggers existentes (21, 22, 23)
-- =====================================================

DROP TRIGGER IF EXISTS trg_update_missions_on_exercise ON progress_tracking.exercise_attempts CASCADE;

CREATE TRIGGER trg_update_missions_on_exercise
    AFTER INSERT ON progress_tracking.exercise_attempts
    FOR EACH ROW
    EXECUTE FUNCTION gamilit.update_missions_on_exercise_complete();

-- =====================================================
-- VERIFICACIÓN POST-CREACIÓN
-- =====================================================
-- SELECT tgname, tgtype, proname
-- FROM pg_trigger t
-- JOIN pg_proc p ON t.tgfoid = p.oid
-- WHERE tgrelid = 'progress_tracking.exercise_attempts'::regclass;
--
-- Resultado esperado: 4 triggers
-- - trg_update_user_stats_on_exercise
-- - trg_update_module_progress_on_exercise
-- - trg_update_missions_on_exercise (NUEVO)
-- - exercise_attempts_updated_at (si existe)
-- =====================================================
