-- =====================================================
-- Seed: educational_content.modules (PROD)
-- Description: Módulos educativos de Marie Curie para producción
-- Environment: PRODUCTION  
-- Dependencies: None
-- Order: 01
-- Created: 2025-11-11
-- Version: 2.0 (reescrito para carga limpia)
-- =====================================================
--
-- CAMBIOS v2.0:
-- - Convertido de STRING a UUID
-- - Agregadas todas las columnas del schema completo
-- - Cambiado NOW() → gamilit.now_mexico()
-- - Estructura alineada 100% con DDL
--
-- VALIDADO CONTRA:
-- - DDL: ddl/schemas/educational_content/tables/01-modules.sql
-- - Template: seeds/dev/educational_content/01-modules.sql
--
-- =====================================================

SET search_path TO educational_content, public;

-- =====================================================
-- INSERT: 5 Módulos de Marie Curie (PRODUCTION)
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
    'd7e8f9a0-1b2c-3d4e-5f6a-7b8c9d0e1f20'::uuid,
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
    'e8f9a0b1-2c3d-4e5f-6a7b-8c9d0e1f2a30'::uuid,
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
    'f9a0b1c2-3d4e-5f6a-7b8c-9d0e1f2a3b40'::uuid,
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
-- Módulo 4: Lectura Digital
(
    'a0b1c2d3-4e5f-6a7b-8c9d-0e1f2a3b4c50'::uuid,
    NULL,
    'Módulo 4: Lectura Digital',
    'Desarrolla habilidades de lectura en medios digitales con contenido de Marie Curie',
    4,
    'MOD-04-DIGITAL',
    'intermediate',
    120,
    ARRAY['Navegar contenido hipertextual', 'Evaluar fuentes digitales', 'Sintetizar información multimedia'],
    175,
    85,
    'published',
    true,
    gamilit.now_mexico(),
    gamilit.now_mexico()
),
-- Módulo 5: Producción de Textos
(
    'b1c2d3e4-5f6a-7b8c-9d0e-1f2a3b4c5d60'::uuid,
    NULL,
    'Módulo 5: Producción de Textos',
    'Crea textos diversos basados en la vida y obra de Marie Curie',
    5,
    'MOD-05-PRODUCCION',
    'advanced',
    120,
    ARRAY['Producir textos argumentativos', 'Crear contenido multimedia', 'Expresar ideas con claridad'],
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
BEGIN
    SELECT COUNT(*) INTO module_count FROM educational_content.modules;
    SELECT COUNT(*) INTO published_count FROM educational_content.modules WHERE is_published = true;
    RAISE NOTICE '✓ Módulos insertados: % total (% publicados)', module_count, published_count;
END $$;
