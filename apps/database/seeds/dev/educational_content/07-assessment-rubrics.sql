-- =====================================================
-- Seed Data: Assessment Rubrics (DEV)
-- =====================================================
-- Description: Rúbricas de evaluación para ejercicios complejos
-- Content: Criterios de evaluación detallados
-- Created by: SA-SEEDS-EDUCATIONAL
-- Date: 2025-11-02
-- =====================================================

SET search_path TO educational_content, public;

DO $$
BEGIN
    -- Las rúbricas están integradas en los ejercicios mediante el campo 'solution'
    -- Este archivo mantiene metadata adicional y configuración global de evaluación
    
    RAISE NOTICE '✅ Rúbricas de evaluación: Integradas en ejercicios individuales';
    RAISE NOTICE '   - Ejercicios con rúbricas detalladas: Debate, Podcast, Tribunal, Diario, Cómic, Video-Carta';
    RAISE NOTICE '   - Criterios: Claridad, Evidencias, Creatividad, Precisión Histórica';
    RAISE NOTICE '   - Sistema de puntos: 100 máximo, 70% para aprobación';
    
    -- Verificación de integridad
    DO $verify$
    DECLARE
        total_modules INTEGER;
        total_exercises INTEGER;
        exercises_with_content INTEGER;
    BEGIN
        SELECT COUNT(*) INTO total_modules FROM educational_content.modules;
        SELECT COUNT(*) INTO total_exercises FROM educational_content.exercises;
        SELECT COUNT(*) INTO exercises_with_content FROM educational_content.exercises WHERE content IS NOT NULL;
        
        RAISE NOTICE '';
        RAISE NOTICE '📊 RESUMEN DE CARGA:';
        RAISE NOTICE '   Total Módulos: %', total_modules;
        RAISE NOTICE '   Total Ejercicios: %', total_exercises;
        RAISE NOTICE '   Ejercicios con Contenido: %', exercises_with_content;
        RAISE NOTICE '';
        
        IF total_modules = 8 AND total_exercises = 27 THEN
            RAISE NOTICE '✅ ¡SEEDS CARGADOS EXITOSAMENTE!';
            RAISE NOTICE '   8 módulos + 27 ejercicios sobre Marie Curie';
        ELSE
            RAISE WARNING '⚠️  Verificar: Se esperaban 8 módulos y 27 ejercicios';
        END IF;
    END $verify$;
END $$;
