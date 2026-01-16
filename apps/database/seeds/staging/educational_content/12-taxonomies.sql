-- =====================================================
-- Seed: educational_content.taxonomies
-- Description: Taxonomías educativas para clasificación de ejercicios
-- Priority: P0 - CRÍTICO (Auditoría AUDIT-DB-001)
-- Created: 2025-12-14
-- =====================================================
--
-- Este seed completa las taxonomías educativas del sistema.
-- La taxonomía de Bloom ya existe en el DDL, aquí agregamos:
-- - SOLO Taxonomy (Structure of Observed Learning Outcomes)
-- - Webb's DOK (Depth of Knowledge)
-- - Taxonomía GAMILIT (personalizada para lectura)
--
-- Tipos de taxonomía (CHECK constraint):
-- - bloom: Taxonomía de Bloom (cognitiva)
-- - solo: SOLO Taxonomy (estructural)
-- - webb: Webb's Depth of Knowledge
-- - custom: Taxonomías personalizadas
-- =====================================================

DO $$
BEGIN
    -- =====================================================
    -- 1. TAXONOMÍA DE BLOOM (ACTUALIZACIÓN/INSERCIÓN)
    -- =====================================================
    INSERT INTO educational_content.taxonomies (
        id, name, description, taxonomy_type, levels, is_active
    ) VALUES (
        '40000001-0000-0000-0000-000000000001'::uuid,
        'Taxonomía de Bloom',
        'Taxonomía cognitiva de Benjamin Bloom para clasificar objetivos educativos',
        'bloom',
        '[
            {"level": 1, "name": "Recordar", "description": "Recuperar conocimiento de la memoria", "verbs": ["definir", "identificar", "listar", "nombrar", "recordar"]},
            {"level": 2, "name": "Comprender", "description": "Construir significado a partir de mensajes", "verbs": ["explicar", "interpretar", "resumir", "clasificar", "comparar"]},
            {"level": 3, "name": "Aplicar", "description": "Usar procedimientos en situaciones dadas", "verbs": ["aplicar", "demostrar", "ejecutar", "implementar", "resolver"]},
            {"level": 4, "name": "Analizar", "description": "Descomponer en partes e identificar relaciones", "verbs": ["analizar", "diferenciar", "organizar", "atribuir", "deconstruir"]},
            {"level": 5, "name": "Evaluar", "description": "Hacer juicios basados en criterios", "verbs": ["evaluar", "criticar", "juzgar", "justificar", "argumentar"]},
            {"level": 6, "name": "Crear", "description": "Reorganizar elementos en nuevo patrón", "verbs": ["crear", "diseñar", "construir", "producir", "inventar"]}
        ]'::jsonb,
        true
    )
    ON CONFLICT (name) DO UPDATE SET
        description = EXCLUDED.description,
        levels = EXCLUDED.levels,
        is_active = true,
        updated_at = gamilit.now_mexico();

    RAISE NOTICE '✅ Taxonomía de Bloom creada/actualizada';

    -- =====================================================
    -- 2. TAXONOMÍA SOLO (Structure of Observed Learning Outcomes)
    -- =====================================================
    INSERT INTO educational_content.taxonomies (
        id, name, description, taxonomy_type, levels, is_active
    ) VALUES (
        '40000001-0000-0000-0000-000000000002'::uuid,
        'Taxonomía SOLO',
        'Structure of Observed Learning Outcomes - Biggs & Collis para evaluar calidad de respuestas',
        'solo',
        '[
            {"level": 1, "name": "Preestructural", "description": "El estudiante no entiende la tarea", "indicator": "Respuesta irrelevante o sin relación"},
            {"level": 2, "name": "Uniestructural", "description": "El estudiante enfoca un aspecto relevante", "indicator": "Un punto relevante identificado"},
            {"level": 3, "name": "Multiestructural", "description": "El estudiante enfoca varios aspectos relevantes independientes", "indicator": "Varios puntos sin conexión"},
            {"level": 4, "name": "Relacional", "description": "El estudiante integra aspectos en una estructura coherente", "indicator": "Puntos conectados y relacionados"},
            {"level": 5, "name": "Abstracto Extendido", "description": "El estudiante generaliza más allá de la tarea", "indicator": "Aplicación a nuevos dominios"}
        ]'::jsonb,
        true
    )
    ON CONFLICT (name) DO UPDATE SET
        description = EXCLUDED.description,
        levels = EXCLUDED.levels,
        is_active = true,
        updated_at = gamilit.now_mexico();

    RAISE NOTICE '✅ Taxonomía SOLO creada/actualizada';

    -- =====================================================
    -- 3. WEBB'S DEPTH OF KNOWLEDGE (DOK)
    -- =====================================================
    INSERT INTO educational_content.taxonomies (
        id, name, description, taxonomy_type, levels, is_active
    ) VALUES (
        '40000001-0000-0000-0000-000000000003'::uuid,
        'Webb DOK',
        'Depth of Knowledge de Norman Webb para alinear estándares con evaluaciones',
        'webb',
        '[
            {"level": 1, "name": "Recordar y Reproducir", "description": "Recuerdo de hechos, definiciones, términos", "examples": ["Identificar", "Definir", "Reconocer", "Localizar"]},
            {"level": 2, "name": "Habilidades y Conceptos", "description": "Usar información, aplicar conceptos", "examples": ["Resumir", "Interpretar", "Organizar", "Clasificar"]},
            {"level": 3, "name": "Pensamiento Estratégico", "description": "Razonamiento complejo, múltiples pasos", "examples": ["Analizar", "Evaluar", "Formular", "Investigar"]},
            {"level": 4, "name": "Pensamiento Extendido", "description": "Pensamiento complejo a largo plazo", "examples": ["Diseñar", "Crear", "Sintetizar", "Aplicar conceptos"]}
        ]'::jsonb,
        true
    )
    ON CONFLICT (name) DO UPDATE SET
        description = EXCLUDED.description,
        levels = EXCLUDED.levels,
        is_active = true,
        updated_at = gamilit.now_mexico();

    RAISE NOTICE '✅ Webb DOK creada/actualizada';

    -- =====================================================
    -- 4. TAXONOMÍA GAMILIT (Personalizada para Comprensión Lectora)
    -- =====================================================
    INSERT INTO educational_content.taxonomies (
        id, name, description, taxonomy_type, levels, is_active
    ) VALUES (
        '40000001-0000-0000-0000-000000000004'::uuid,
        'Taxonomía GAMILIT',
        'Taxonomía personalizada de GAMILIT para comprensión lectora basada en Marie Curie',
        'custom',
        '[
            {"level": 1, "name": "Comprensión Literal", "description": "Identificar información explícita en el texto", "module": "MOD-01-LITERAL", "skills": ["Identificar hechos", "Localizar información", "Reconocer secuencias"]},
            {"level": 2, "name": "Comprensión Inferencial", "description": "Deducir información no explícita del texto", "module": "MOD-02-INFERENCIAL", "skills": ["Inferir causas", "Predecir consecuencias", "Interpretar significados"]},
            {"level": 3, "name": "Comprensión Crítica", "description": "Evaluar y juzgar el contenido del texto", "module": "MOD-03-CRITICA", "skills": ["Evaluar argumentos", "Detectar sesgos", "Contrastar fuentes"]},
            {"level": 4, "name": "Lectura Digital", "description": "Navegar y evaluar información en medios digitales", "module": "MOD-04-DIGITAL", "skills": ["Verificar fuentes", "Navegar hipertexto", "Evaluar credibilidad"]},
            {"level": 5, "name": "Producción Lectora", "description": "Crear textos basados en comprensión profunda", "module": "MOD-05-PRODUCCION", "skills": ["Sintetizar información", "Argumentar posiciones", "Crear contenido"]}
        ]'::jsonb,
        true
    )
    ON CONFLICT (name) DO UPDATE SET
        description = EXCLUDED.description,
        levels = EXCLUDED.levels,
        is_active = true,
        updated_at = gamilit.now_mexico();

    RAISE NOTICE '✅ Taxonomía GAMILIT creada/actualizada';

    -- =====================================================
    -- VERIFICACIÓN
    -- =====================================================
    RAISE NOTICE '';
    RAISE NOTICE '=== TAXONOMÍAS EDUCATIVAS ===';
    RAISE NOTICE 'Total taxonomías activas: %', (SELECT COUNT(*) FROM educational_content.taxonomies WHERE is_active = true);
    RAISE NOTICE 'Bloom: %', (SELECT COUNT(*) FROM educational_content.taxonomies WHERE taxonomy_type = 'bloom');
    RAISE NOTICE 'SOLO: %', (SELECT COUNT(*) FROM educational_content.taxonomies WHERE taxonomy_type = 'solo');
    RAISE NOTICE 'Webb DOK: %', (SELECT COUNT(*) FROM educational_content.taxonomies WHERE taxonomy_type = 'webb');
    RAISE NOTICE 'Custom (GAMILIT): %', (SELECT COUNT(*) FROM educational_content.taxonomies WHERE taxonomy_type = 'custom');

END $$;

-- =====================================================
-- VERIFICACIÓN FINAL
-- =====================================================
DO $$
DECLARE
    v_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_count FROM educational_content.taxonomies WHERE is_active = true;

    IF v_count < 3 THEN
        RAISE WARNING '⚠️ Se esperaban al menos 3 taxonomías';
    ELSE
        RAISE NOTICE '✅ Seed de taxonomies completado exitosamente (%s taxonomías)', v_count;
    END IF;
END $$;
