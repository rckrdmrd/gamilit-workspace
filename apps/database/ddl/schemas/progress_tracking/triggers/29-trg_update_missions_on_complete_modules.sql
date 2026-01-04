-- =====================================================
-- Trigger: trg_update_missions_on_complete_modules
-- Table: progress_tracking.module_progress
-- Function: gamilit.trigger_missions_on_complete_modules (wrapper unificado)
-- Event: AFTER UPDATE
-- Level: FOR EACH ROW
-- Description: Actualiza progreso de misiones al completar módulos
-- Created: 2025-11-28
-- =====================================================
--
-- PROPÓSITO:
-- Este trigger conecta la completación de módulos con el sistema de misiones.
-- Cuando un estudiante completa un módulo (status cambia a 'completed'), las
-- misiones diarias/semanales que tengan objetivo 'complete_modules' se actualizan
-- automáticamente.
--
-- CONDICIÓN WHEN:
-- El trigger solo se dispara cuando:
-- 1. NEW.status = 'completed' (el nuevo estado es completado)
-- 2. OLD.status IS DISTINCT FROM 'completed' (el estado anterior NO era completado)
--
-- Esto evita que se dispare en las siguientes situaciones:
-- - UPDATE de otros campos cuando ya está completed
-- - Cambios de completed -> completed (evita duplicación)
-- - Cambios de null -> completed (primera vez, sí se dispara)
-- - Cambios de not_started -> completed (sí se dispara)
-- - Cambios de in_progress -> completed (sí se dispara)
--
-- ORDEN DE EJECUCIÓN:
-- Los triggers en module_progress se ejecutan en orden alfabético:
-- 1. trg_module_progress_updated_at (23-)
-- 2. trg_update_missions_on_complete_modules (29-) <- ESTE TRIGGER
-- (Agregar más cuando existan)
--
-- MISIONES AFECTADAS:
-- - Diarias: "Completa 2 módulos" (100 XP + 50 ML Coins)
-- - Semanales: "Domina 5 módulos" (300 XP + 150 ML Coins)
-- - Especiales: Desafíos de aprendizaje específicos
--
-- FLUJO:
-- 1. Usuario completa módulo → UPDATE module_progress SET status='completed'
-- 2. Este trigger detecta cambio a 'completed' (y que antes no lo era)
-- 3. Busca misiones activas del usuario con objetivo 'complete_modules'
-- 4. Incrementa current en cada misión encontrada (+1)
-- 5. Recalcula progress (%) de cada misión
-- 6. Si progress = 100%, marca como 'completed'
--
-- EJEMPLO DE USO:
-- -- Usuario tiene misión: "Completa 2 módulos" (current: 0/2)
-- UPDATE progress_tracking.module_progress
-- SET status = 'completed', completed_at = NOW()
-- WHERE user_id = 'uuid-123' AND module_id = 'module-1';
-- -- Resultado: misión actualizada a current: 1/2, progress: 50%
--
-- UPDATE progress_tracking.module_progress
-- SET status = 'completed', completed_at = NOW()
-- WHERE user_id = 'uuid-123' AND module_id = 'module-2';
-- -- Resultado: misión completada, current: 2/2, progress: 100%, status: 'completed'
--
-- NOTAS:
-- - NO bloquea si falla (errores solo se loggean con WARNING)
-- - Solo afecta módulos que cambian A 'completed' por primera vez
-- - Solo afecta misiones no expiradas
-- - Compatible con triggers existentes (23-)
-- - IS DISTINCT FROM maneja NULL correctamente
-- =====================================================

DROP TRIGGER IF EXISTS trg_update_missions_on_complete_modules ON progress_tracking.module_progress CASCADE;

CREATE TRIGGER trg_update_missions_on_complete_modules
    AFTER UPDATE ON progress_tracking.module_progress
    FOR EACH ROW
    WHEN (
        NEW.status = 'completed'
        AND (OLD.status IS DISTINCT FROM 'completed' OR OLD.status IS NULL)
    )
    EXECUTE FUNCTION gamilit.trigger_missions_on_complete_modules();

-- =====================================================
-- VERIFICACIÓN POST-CREACIÓN
-- =====================================================
-- SELECT tgname, tgtype, tgenabled, proname
-- FROM pg_trigger t
-- JOIN pg_proc p ON t.tgfoid = p.oid
-- WHERE tgrelid = 'progress_tracking.module_progress'::regclass
-- ORDER BY tgname;
--
-- Resultado esperado: 2+ triggers
-- - trg_module_progress_updated_at
-- - trg_update_missions_on_complete_modules (NUEVO)
-- =====================================================
--
-- TESTING DE CONDICIÓN WHEN:
-- =====================================================
-- Test 1: Primera completación (not_started -> completed) ✅ SÍ debe dispararse
-- UPDATE progress_tracking.module_progress
-- SET status = 'completed'
-- WHERE status = 'not_started' AND user_id = 'test-user';
-- -- Verificar: misión incrementada
--
-- Test 2: Progreso a completado (in_progress -> completed) ✅ SÍ debe dispararse
-- UPDATE progress_tracking.module_progress
-- SET status = 'completed'
-- WHERE status = 'in_progress' AND user_id = 'test-user';
-- -- Verificar: misión incrementada
--
-- Test 3: Ya completado (completed -> completed) ❌ NO debe dispararse
-- UPDATE progress_tracking.module_progress
-- SET progress_percentage = 100
-- WHERE status = 'completed' AND user_id = 'test-user';
-- -- Verificar: misión NO se duplicó
--
-- Test 4: Otros cambios sin tocar status ❌ NO debe dispararse
-- UPDATE progress_tracking.module_progress
-- SET total_xp_earned = 100
-- WHERE user_id = 'test-user';
-- -- Verificar: trigger no se ejecutó (status no cambió)
-- =====================================================
