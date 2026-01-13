-- =====================================================
-- Seed: educational_content.modules (DEV)
-- Description: Módulos educativos de Marie Curie con UUIDs fijos
-- Environment: DEVELOPMENT
-- Dependencies: None
-- Order: 01
-- Created: 2025-11-11
-- Updated: 2026-01-13 (v4.0 - UUIDs fijos para consistencia frontend)
-- Version: 4.0.0
-- =====================================================
--
-- CAMBIOS v4.0.0 (2026-01-13):
-- - UUIDs FIJOS para consistencia con frontend mock data
-- - Resuelve error de navegación /modules/1 vs /modules/<uuid>
-- - UUIDs hexadecimales válidos: a0000001-..., a0000002-..., etc.
--
-- CAMBIOS v3.0 (2026-01-13):
-- - Módulos 4 y 5 ACTIVADOS: status 'published', is_published = true
--
-- UUIDs FIJOS:
-- - Módulo 1: a0000001-0001-0001-0001-000000000001
-- - Módulo 2: a0000002-0002-0002-0002-000000000002
-- - Módulo 3: a0000003-0003-0003-0003-000000000003
-- - Módulo 4: a0000004-0004-0004-0004-000000000004
-- - Módulo 5: a0000005-0005-0005-0005-000000000005
--
-- =====================================================

SET search_path TO educational_content, public;

-- =====================================================
-- INSERT: 5 Módulos de Marie Curie con UUIDs FIJOS
-- =====================================================

INSERT INTO educational_content.modules (
    id,
    tenant_id,
    title,
    description,
    order_index,
    module_code,
    difficulty_level,
    estimated_duration_minutes,
    learning_objectives,
    xp_reward,
    ml_coins_reward,
    status,
    is_published,
    created_at,
    updated_at
) VALUES
-- Módulo 1: Comprensión Literal
(
    'a0000001-0001-0001-0001-000000000001'::uuid,
    NULL,  -- tenant_id NULL = disponible para todos
    'Módulo 1: Comprensión Literal',
    'Identifica información explícita en textos sobre la vida de Marie Curie',
    1,
    'MOD-01-LITERAL',
    'beginner',
    120,
    ARRAY['Identificar datos explícitos', 'Comprender hechos históricos', 'Reconocer personajes y lugares'],
    100,
    50,
    'published',
    true,
    gamilit.now_mexico(),
    gamilit.now_mexico()
),
-- Módulo 2: Comprensión Inferencial
(
    'a0000002-0002-0002-0002-000000000002'::uuid,
    NULL,
    'Módulo 2: Comprensión Inferencial',
    'Deduce información implícita y relaciones causa-efecto en la vida de Marie Curie',
    2,
    'MOD-02-INFERENCIAL',
    'intermediate',
    120,
    ARRAY['Realizar inferencias', 'Identificar relaciones causa-efecto', 'Deducir información implícita'],
    150,
    75,
    'published',
    true,
    gamilit.now_mexico(),
    gamilit.now_mexico()
),
-- Módulo 3: Comprensión Crítica
(
    'a0000003-0003-0003-0003-000000000003'::uuid,
    NULL,
    'Módulo 3: Comprensión Crítica',
    'Evalúa y analiza críticamente la información sobre Marie Curie',
    3,
    'MOD-03-CRITICA',
    'advanced',
    120,
    ARRAY['Evaluar argumentos', 'Analizar perspectivas', 'Formar opiniones fundamentadas'],
    200,
    100,
    'published',
    true,
    gamilit.now_mexico(),
    gamilit.now_mexico()
),
-- Módulo 4: Lectura Digital y Multimodal
(
    'a0000004-0004-0004-0004-000000000004'::uuid,
    NULL,
    'Módulo 4: Lectura Digital y Multimodal',
    'Desarrolla habilidades de lectura en medios digitales y multimodales con contenido de Marie Curie',
    4,
    'MOD-04-DIGITAL',
    'intermediate',
    120,
    ARRAY['Navegar contenido hipertextual', 'Evaluar fuentes digitales', 'Sintetizar información multimedia', 'Analizar memes y contenido visual'],
    175,
    85,
    'published',
    true,
    gamilit.now_mexico(),
    gamilit.now_mexico()
),
-- Módulo 5: Producción y Expresión Lectora
(
    'a0000005-0005-0005-0005-000000000005'::uuid,
    NULL,
    'Módulo 5: Producción y Expresión Lectora',
    'Crea textos diversos y expresiones lectoras basadas en la vida y obra de Marie Curie',
    5,
    'MOD-05-PRODUCCION',
    'advanced',
    120,
    ARRAY['Producir textos argumentativos', 'Crear contenido multimedia', 'Expresar ideas con claridad', 'Desarrollar presentaciones creativas'],
    250,
    125,
    'published',
    true,
    gamilit.now_mexico(),
    gamilit.now_mexico()
)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    order_index = EXCLUDED.order_index,
    module_code = EXCLUDED.module_code,
    status = EXCLUDED.status,
    is_published = EXCLUDED.is_published,
    updated_at = gamilit.now_mexico();

-- =====================================================
-- Verification Query
-- =====================================================

DO $$
DECLARE
    module_count INTEGER;
    published_count INTEGER;
    v_record RECORD;
BEGIN
    SELECT COUNT(*) INTO module_count FROM educational_content.modules;
    SELECT COUNT(*) INTO published_count FROM educational_content.modules WHERE is_published = true;

    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'Modules Seed - Verificacion';
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'Total modulos: % (% publicados)', module_count, published_count;
    RAISE NOTICE '-----------------------------------------------------';

    FOR v_record IN (
        SELECT id, order_index, title
        FROM educational_content.modules
        ORDER BY order_index
    ) LOOP
        RAISE NOTICE '  M%: % | %', v_record.order_index, v_record.id, v_record.title;
    END LOOP;

    RAISE NOTICE '=====================================================';
END $$;
