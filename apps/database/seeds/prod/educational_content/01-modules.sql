-- ============================================================================
-- GAMILIT Platform - Production Seeds
-- Archivo: seeds/prod/educational_content/01-modules.sql
-- Propósito: Módulos educativos activos (sin ejercicios demo)
-- ============================================================================

-- Módulo 1: Introducción a Gamilit
INSERT INTO educational_content.modules (
    id,
    title,
    description,
    order_index,
    is_active,
    difficulty_level,
    estimated_hours,
    learning_objectives,
    prerequisites,
    created_at,
    updated_at
)
VALUES (
    'module1',
    'Introducción a GAMILIT',
    'Conoce la plataforma GAMILIT y sus características principales',
    1,
    true,
    'beginner',
    2.0,
    jsonb_build_array(
        'Comprender el propósito de GAMILIT',
        'Navegar por la plataforma',
        'Completar el primer ejercicio'
    ),
    '[]'::jsonb,
    NOW(),
    NOW()
)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

-- Módulo 2: Fundamentos
INSERT INTO educational_content.modules (
    id,
    title,
    description,
    order_index,
    is_active,
    difficulty_level,
    estimated_hours,
    learning_objectives,
    prerequisites,
    created_at,
    updated_at
)
VALUES (
    'module2',
    'Fundamentos de Programación',
    'Aprende los conceptos básicos de programación',
    2,
    true,
    'beginner',
    8.0,
    jsonb_build_array(
        'Variables y tipos de datos',
        'Estructuras de control',
        'Funciones básicas'
    ),
    jsonb_build_array('module1'),
    NOW(),
    NOW()
)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

-- Módulo 3: IA y Asistente Virtual
INSERT INTO educational_content.modules (
    id,
    title,
    description,
    order_index,
    is_active,
    difficulty_level,
    estimated_hours,
    learning_objectives,
    prerequisites,
    created_at,
    updated_at
)
VALUES (
    'module3',
    'Inteligencia Artificial',
    'Explora conceptos de IA con ayuda del asistente virtual',
    3,
    true,
    'intermediate',
    10.0,
    jsonb_build_array(
        'Entender conceptos de IA',
        'Interactuar con asistente virtual',
        'Resolver problemas con IA'
    ),
    jsonb_build_array('module1', 'module2'),
    NOW(),
    NOW()
)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

-- Módulo 4: Programación Avanzada
INSERT INTO educational_content.modules (
    id,
    title,
    description,
    order_index,
    is_active,
    difficulty_level,
    estimated_hours,
    learning_objectives,
    prerequisites,
    created_at,
    updated_at
)
VALUES (
    'module4',
    'Programación Avanzada',
    'Conceptos avanzados de programación y algoritmos',
    4,
    true,
    'advanced',
    12.0,
    jsonb_build_array(
        'Estructuras de datos',
        'Algoritmos complejos',
        'Optimización de código'
    ),
    jsonb_build_array('module1', 'module2', 'module3'),
    NOW(),
    NOW()
)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

-- Módulo 5: Proyectos Finales
INSERT INTO educational_content.modules (
    id,
    title,
    description,
    order_index,
    is_active,
    difficulty_level,
    estimated_hours,
    learning_objectives,
    prerequisites,
    created_at,
    updated_at
)
VALUES (
    'module5',
    'Proyectos Integradores',
    'Aplica todo lo aprendido en proyectos completos',
    5,
    true,
    'expert',
    15.0,
    jsonb_build_array(
        'Planificar un proyecto',
        'Implementar solución completa',
        'Presentar resultados'
    ),
    jsonb_build_array('module1', 'module2', 'module3', 'module4'),
    NOW(),
    NOW()
)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

-- Verificación
SELECT
    id,
    title,
    order_index,
    difficulty_level,
    estimated_hours,
    is_active,
    array_length(learning_objectives, 1) as num_objectives
FROM educational_content.modules
ORDER BY order_index;
