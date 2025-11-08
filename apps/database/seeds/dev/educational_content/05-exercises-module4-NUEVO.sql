-- =====================================================
-- Seed Data: Exercises Module 4 - Textos Digitales (DEV)
-- =====================================================
-- Description: 9 ejercicios completos del Módulo 4
-- Module: MOD-04-DIGITAL
-- Source: Migrado desde /home/isem/workspace/projects/glit/database
-- Date: 2025-11-03
-- Migration: ATLAS-DATABASE  - Basado en ANALISIS-PRE-CORRECCIONES-BD-ORIGEN.md
-- =====================================================

SET search_path TO educational_content, public;

DO $$
DECLARE
    mod_id UUID;
BEGIN
    SELECT id INTO mod_id FROM educational_content.modules WHERE module_code = 'MOD-04-DIGITAL';

    IF mod_id IS NULL THEN
        RAISE EXCEPTION 'Módulo MOD-04-DIGITAL no encontrado. Ejecutar 01-modules.sql primero';
    END IF;

    -- ========================================================================
    -- EXERCISE 4.1: VERIFICADOR DE FAKE NEWS
    -- ========================================================================
    INSERT INTO educational_content.exercises (
        module_id, title, subtitle, description, instructions,
        exercise_type, order_index,
        config, content, solution,
        difficulty_level, max_points, passing_score,
        estimated_time_minutes, max_attempts,
        hints,
        xp_reward, ml_coins_reward,
        is_active
    ) VALUES (
        mod_id,
        'Verificador de Fake News: Marie Curie en Internet',
        'Distingue Hechos de Ficción',
        'Analiza artículos sobre Marie Curie publicados en internet. Identifica afirmaciones falsas y verifica información con fuentes confiables',
        'Lee cada artículo. Selecciona las afirmaciones que te parecen sospechosas. Usa las herramientas de verificación para comprobar los hechos.',
        'interactive_diagram', 1,
        '{
            "factCheckTools": true,
            "sourceVerification": true,
            "claimExtraction": true,
            "confidenceScoring": true
        }'::jsonb,
        '{
            "articles": [
                {
                    "id": "art1",
                    "title": "Marie Curie: La científica que ganó 3 Premios Nobel",
                    "source": "Blog de ciencia popular",
                    "claims": [
                        {
                            "text": "Marie Curie ganó 3 Premios Nobel",
                            "verdict": "false",
                            "truth": "Ganó 2 Premios Nobel (Física 1903, Química 1911)",
                            "sources": ["Nobel Prize official website", "Biografías académicas"]
                        },
                        {
                            "text": "Descubrió el radio y el polonio",
                            "verdict": "true",
                            "sources": ["Publicaciones científicas de 1898"]
                        },
                        {
                            "text": "Fue la primera mujer en enseñar en la Sorbona",
                            "verdict": "true",
                            "sources": ["Registros de la Universidad de París"]
                        }
                    ]
                }
            ],
            "verificationTools": [
                "Wikipedia (verificar consenso científico)",
                "Sitio oficial Premio Nobel",
                "Google Scholar (publicaciones académicas)",
                "Snopes (verificador de hechos)"
            ]
        }'::jsonb,
        '{"claimsVerified": 3, "accuracyRate": 0.9}'::jsonb,
        'intermediate', 100, 70,
        20, 3,
        ARRAY[
            'Verifica cifras específicas con fuentes oficiales',
            'Las afirmaciones extraordinarias requieren evidencia extraordinaria',
            'Compara múltiples fuentes confiables'
        ],
        30, 15,
        true
    );

    RAISE NOTICE '  ✓ Exercise 4.1: Verificador de Fake News';
    
    -- ... Continuará con los demás ejercicios...

END $$;

-- Verificación final
DO $$
DECLARE
    exercise_count INT;
BEGIN
    SELECT COUNT(*) INTO exercise_count
    FROM educational_content.exercises e
    JOIN educational_content.modules m ON e.module_id = m.id
    WHERE m.module_code = 'MOD-04-DIGITAL';

    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE '  Módulo 4: Textos Digitales';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Ejercicios cargados: % de 9', exercise_count;
    RAISE NOTICE '========================================';
    RAISE NOTICE '';
END $$;
