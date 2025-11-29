-- =====================================================
-- Trigger: trg_assign_default_classroom
-- Table: auth_management.profiles
-- Description: Asigna automáticamente estudiantes al classroom default
-- Created: 2025-11-29
-- =====================================================
--
-- COMPORTAMIENTO:
-- Se ejecuta AFTER INSERT en profiles (después de que se crea el perfil)
-- Solo para usuarios con role = 'student'
-- Crea un registro en classroom_members con el classroom default
--
-- ORDEN DE EJECUCIÓN:
-- 1. trg_set_default_tenant (BEFORE INSERT) - Asigna tenant
-- 2. INSERT del perfil
-- 3. trg_initialize_user_stats (AFTER INSERT) - Inicializa gamificación
-- 4. trg_assign_default_classroom (AFTER INSERT) - Asigna classroom ← ESTE
--
-- DEPENDENCIAS:
-- - gamilit.assign_default_classroom() function
-- - social_features.classrooms con metadata->>'is_default' = 'true'
-- =====================================================

-- Eliminar trigger si existe (para recreación limpia)
DROP TRIGGER IF EXISTS trg_assign_default_classroom ON auth_management.profiles;

-- Crear trigger AFTER INSERT
CREATE TRIGGER trg_assign_default_classroom
    AFTER INSERT ON auth_management.profiles
    FOR EACH ROW
    EXECUTE FUNCTION gamilit.assign_default_classroom();

COMMENT ON TRIGGER trg_assign_default_classroom ON auth_management.profiles IS
'Asigna automáticamente estudiantes nuevos al classroom default después de crear su perfil';
