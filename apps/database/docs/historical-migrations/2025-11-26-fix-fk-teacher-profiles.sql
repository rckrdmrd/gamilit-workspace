-- =====================================================
-- MIGRACIÓN: Corregir FKs de auth.users a auth_management.profiles
-- Fecha: 2025-11-26
-- Issues: ISS-002 (P1), ISS-003 (P2)
-- =====================================================
--
-- IMPORTANTE: Ejecutar en orden y validar integridad antes de cada paso
--
-- TABLAS AFECTADAS:
-- 1. social_features.teacher_classrooms (teacher_id)
-- 2. educational_content.assignments (teacher_id)
--
-- =====================================================

-- =====================================================
-- PASO 0: VALIDACIÓN DE INTEGRIDAD PRE-MIGRACIÓN
-- =====================================================

-- Verificar que todos los teacher_id en teacher_classrooms existen en profiles
SELECT 'teacher_classrooms orphans' as check_name, COUNT(*) as orphan_count
FROM social_features.teacher_classrooms tc
LEFT JOIN auth_management.profiles p ON tc.teacher_id = p.id
WHERE p.id IS NULL;

-- Verificar que todos los teacher_id en assignments existen en profiles
SELECT 'assignments orphans' as check_name, COUNT(*) as orphan_count
FROM educational_content.assignments a
LEFT JOIN auth_management.profiles p ON a.teacher_id = p.id
WHERE p.id IS NULL;

-- SI HAY REGISTROS HUÉRFANOS, DETENER Y RESOLVER ANTES DE CONTINUAR

-- =====================================================
-- PASO 1: MIGRAR FK DE teacher_classrooms
-- =====================================================

-- Desactivar temporalmente las restricciones
SET session_replication_role = replica;

-- Drop la FK existente
ALTER TABLE social_features.teacher_classrooms
DROP CONSTRAINT IF EXISTS teacher_classrooms_teacher_id_fkey;

-- Crear nueva FK apuntando a profiles con RESTRICT
ALTER TABLE social_features.teacher_classrooms
ADD CONSTRAINT teacher_classrooms_teacher_id_fkey
    FOREIGN KEY (teacher_id)
    REFERENCES auth_management.profiles(id)
    ON DELETE RESTRICT;

-- Reactivar las restricciones
SET session_replication_role = DEFAULT;

-- =====================================================
-- PASO 2: MIGRAR FK DE assignments
-- =====================================================

-- Desactivar temporalmente las restricciones
SET session_replication_role = replica;

-- Drop la FK existente
ALTER TABLE educational_content.assignments
DROP CONSTRAINT IF EXISTS assignments_teacher_id_fkey;

-- Crear nueva FK apuntando a profiles con RESTRICT
ALTER TABLE educational_content.assignments
ADD CONSTRAINT assignments_teacher_id_fkey
    FOREIGN KEY (teacher_id)
    REFERENCES auth_management.profiles(id)
    ON DELETE RESTRICT;

-- Reactivar las restricciones
SET session_replication_role = DEFAULT;

-- =====================================================
-- PASO 3: VALIDACIÓN POST-MIGRACIÓN
-- =====================================================

-- Verificar que las FKs están correctamente creadas
SELECT
    tc.table_name,
    kcu.column_name,
    ccu.table_schema AS foreign_table_schema,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_name IN ('teacher_classrooms', 'assignments')
    AND kcu.column_name = 'teacher_id';

-- Resultado esperado:
-- teacher_classrooms | teacher_id | auth_management | profiles | id
-- assignments        | teacher_id | auth_management | profiles | id

-- =====================================================
-- PASO 4: HABILITAR RLS EN teacher_classrooms (P0)
-- =====================================================

-- Esto se ejecuta después de crear el archivo de policies
ALTER TABLE social_features.teacher_classrooms ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- ROLLBACK (en caso de error)
-- =====================================================
--
-- Para revertir los cambios, ejecutar:
--
-- -- Revertir teacher_classrooms
-- ALTER TABLE social_features.teacher_classrooms
-- DROP CONSTRAINT IF EXISTS teacher_classrooms_teacher_id_fkey;
--
-- ALTER TABLE social_features.teacher_classrooms
-- ADD CONSTRAINT teacher_classrooms_teacher_id_fkey
--     FOREIGN KEY (teacher_id)
--     REFERENCES auth.users(id)
--     ON DELETE CASCADE;
--
-- -- Revertir assignments
-- ALTER TABLE educational_content.assignments
-- DROP CONSTRAINT IF EXISTS assignments_teacher_id_fkey;
--
-- ALTER TABLE educational_content.assignments
-- ADD CONSTRAINT assignments_teacher_id_fkey
--     FOREIGN KEY (teacher_id)
--     REFERENCES auth.users(id)
--     ON DELETE CASCADE;
--
-- =====================================================

-- FIN DE MIGRACIÓN
