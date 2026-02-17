-- ============================================================================
-- SEED: Marie Curie Biography - Content Library
-- ============================================================================
-- Descripción: Biografía completa de Marie Curie dividida en 4 periodos
--              históricos para enriquecer el contenido educativo
-- Schema: content_management
-- Tablas: content_library
-- Prioridad: 2
-- Dependencias: Schema content_management debe existir
-- ============================================================================

SET search_path TO content_management, public;

-- ============================================================================
-- CONTENT LIBRARY: Biografía de Marie Curie (4 periodos)
-- ============================================================================

INSERT INTO content_management.marie_curie_contents (
    title,
    subtitle,
    category,
    description,
    content,
    search_tags,
    keywords,
    target_grade_levels,
    status,
    is_featured,
    metadata,
    created_at,
    updated_at
) VALUES

-- ============================================================================
-- Periodo 1: Primeros Años en Polonia (1867-1891)
-- ============================================================================
(
    'Marie Curie: Primeros Años en Polonia',
    'La infancia de Maria Sklodowska en Varsovia',
    'biography',
    'Primeros años de Marie Curie en Polonia bajo ocupacion rusa, desde su nacimiento en 1867 hasta su partida a Paris en 1891.',
    '{"main_content": "Nacimiento en Varsovia 1867. Infancia, educacion clandestina, trabajo como institutriz, preparacion para estudios en Francia.", "key_points": ["Nacimiento 1867 en Varsovia", "Universidad Volante", "Pacto con hermana Bronya", "Partida a Paris 1891"]}'::jsonb,
    ARRAY['Marie Curie', 'Polonia', 'Infancia', 'Varsovia', 'Institutriz', 'Universidad Volante', 'Perseverancia']::text[],
    ARRAY['Historia', 'Ciencias', 'Estudios Sociales', 'Biografias']::text[],
    ARRAY['6','7','8']::text[],
    'published'::content_management.content_status,
    true,
    '{
        "period": "1867-1891",
        "location": "Varsovia, Polonia",
        "key_dates": {
            "1867": "Nacimiento en Varsovia",
            "1878": "Muerte de su madre",
            "1883": "Graduacion del Gymnasium con medalla de oro",
            "1885": "Comienza trabajo como institutriz",
            "1891": "Partida a Paris"
        },
        "key_themes": ["adversidad", "educacion clandestina", "discriminacion de genero", "ocupacion rusa", "familia"],
        "word_count": 1285,
        "reading_time_minutes": 6,
        "educational_level": "secundaria",
        "author": "GLIT Content Team",
        "content_format": "biography",
        "curriculum_connections": ["Historia de Europa siglo XIX", "Movimientos de resistencia", "Educacion de la mujer"]
    }'::jsonb,
    NOW(),
    NOW()
),

-- ============================================================================
-- Periodo 2: Estudios en la Sorbona (1891-1895)
-- ============================================================================
(
    'Marie Curie: Estudios en la Sorbona',
    'Los anos universitarios de Marie en Paris',
    'biography',
    'Marie Curie durante sus estudios universitarios en la Sorbona (1891-1895), incluyendo su vida como estudiante, logros academicos, el encuentro con Pierre Curie, y su matrimonio.',
    '{"main_content": "Llegada a Paris 1891, matricula en la Sorbona. Graduacion en Fisica 1er lugar 1893. Encuentro con Pierre Curie 1894. Matrimonio 1895.", "key_points": ["Sorbona 1891", "1era mujer Fisica 1893", "Pierre Curie 1894", "Matrimonio 1895"]}'::jsonb,
    ARRAY['Marie Curie', 'Pierre Curie', 'Sorbona', 'Paris', 'Universidad', 'Fisica', 'Matematicas', 'Matrimonio', 'Igualdad']::text[],
    ARRAY['Historia', 'Ciencias', 'Estudios de Genero', 'Biografias']::text[],
    ARRAY['7','8','9']::text[],
    'published'::content_management.content_status,
    true,
    '{
        "period": "1891-1895",
        "location": "Paris, Francia",
        "key_dates": {
            "1891": "Llegada a Paris y matricula en la Sorbona",
            "1893": "Graduacion en Fisica (1er lugar)",
            "1894": "Graduacion en Matematicas (2do lugar), Conoce a Pierre Curie",
            "1895": "Matrimonio con Pierre Curie"
        },
        "key_themes": ["educacion superior", "superacion", "discriminacion de genero", "amor y ciencia", "asociacion igualitaria"],
        "word_count": 1620,
        "reading_time_minutes": 8,
        "educational_level": "secundaria-preparatoria",
        "author": "GLIT Content Team",
        "content_format": "biography",
        "curriculum_connections": ["Historia de la ciencia", "Estudios de genero", "Educacion superior", "Francia del siglo XIX"]
    }'::jsonb,
    NOW(),
    NOW()
),

-- ============================================================================
-- Periodo 3: Los Grandes Descubrimientos (1895-1911)
-- ============================================================================
(
    'Marie Curie: Los Grandes Descubrimientos',
    'Radio, Polonio y los Premios Nobel',
    'discoveries',
    'Marie Curie durante sus anos de investigacion y descubrimientos (1895-1911). Descubrimiento de la radioactividad, aislamiento del polonio y el radio, primer Premio Nobel de Fisica (1903), muerte de Pierre Curie (1906), segundo Premio Nobel de Quimica (1911).',
    '{"main_content": "Descubrimiento radioactividad 1896-1898. Polonio julio 1898. Radio diciembre 1898. Aislamiento 0.1g radio 1902. Nobel Fisica 1903. Muerte Pierre 1906. Nobel Quimica 1911.", "key_points": ["Radioactividad 1896", "Polonio y Radio 1898", "Nobel Fisica 1903", "Muerte Pierre 1906", "Nobel Quimica 1911"]}'::jsonb,
    ARRAY['Marie Curie', 'Pierre Curie', 'Radio', 'Polonio', 'Radioactividad', 'Premio Nobel', 'Descubrimientos', 'Fisica', 'Quimica']::text[],
    ARRAY['Ciencias', 'Quimica', 'Fisica', 'Historia de la Ciencia', 'Biografias']::text[],
    ARRAY['7','8','9','10']::text[],
    'published'::content_management.content_status,
    true,
    '{
        "period": "1895-1911",
        "key_dates": {
            "1896": "Inicio investigacion radioactividad",
            "1898": "Descubrimiento Polonio (julio) y Radio (diciembre)",
            "1902": "Aislamiento de 0.1g de radio puro",
            "1903": "Doctorado y primer Nobel (Fisica)",
            "1906": "Muerte de Pierre, Primera mujer profesora Sorbona",
            "1910": "Aislamiento de radio metalico puro",
            "1911": "Segundo Nobel (Quimica)"
        },
        "key_discoveries": [
            "Termino radioactividad",
            "Elemento Polonio (84)",
            "Elemento Radio (88)",
            "Radioactividad como propiedad atomica"
        ],
        "key_themes": ["descubrimiento cientifico", "metodo riguroso", "colaboracion cientifica", "resiliencia", "discriminacion de genero"],
        "word_count": 2180,
        "reading_time_minutes": 11,
        "educational_level": "secundaria-preparatoria-universidad",
        "author": "GLIT Content Team",
        "content_format": "biography",
        "curriculum_connections": ["Quimica nuclear", "Historia de la fisica", "Metodo cientifico", "Estructura atomica"]
    }'::jsonb,
    NOW(),
    NOW()
),

-- ============================================================================
-- Periodo 4: Legado e Impacto (1911-1934)
-- ============================================================================
(
    'Marie Curie: Legado e Impacto',
    'Los ultimos anos y el impacto en la ciencia',
    'legacy',
    'Ultimos anos de Marie Curie (1911-1934) y su legado duradero. Fundacion del Instituto del Radio, trabajo humanitario durante la Primera Guerra Mundial, declive de salud por exposicion a radiacion, muerte en 1934, e impacto profundo en la ciencia moderna.',
    '{"main_content": "Instituto del Radio 1914. Petits Curies WWI. Viaje a EEUU 1921. Declive salud. Muerte 4 julio 1934. Panteon 1995.", "key_points": ["Instituto del Radio 1914", "Petits Curies WWI", "Muerte 1934 anemia aplasica", "Panteon 1995"]}'::jsonb,
    ARRAY['Marie Curie', 'Legado', 'Instituto del Radio', 'Primera Guerra Mundial', 'Radiologia', 'Impacto Cientifico', 'Panteon', 'Inspiracion']::text[],
    ARRAY['Historia', 'Ciencias', 'Medicina', 'Impacto Social', 'Biografias']::text[],
    ARRAY['8','9','10','11']::text[],
    'published'::content_management.content_status,
    true,
    '{
        "period": "1911-1934",
        "key_dates": {
            "1914": "Fundacion Instituto del Radio, Inicio WWI (petits Curies)",
            "1918": "Fin Primera Guerra Mundial",
            "1921": "Viaje a Estados Unidos",
            "1934": "Muerte por anemia aplasica (4 julio)",
            "1995": "Traslado al Panteon de Paris"
        },
        "key_contributions": [
            "Instituto del Radio/Instituto Curie",
            "Unidades moviles de radiologia (WWI)",
            "Mas de 1 millon de soldados radiografiados",
            "200 puestos fijos de radiologia",
            "Entrenamiento de 150 operadores de rayos X"
        ],
        "legacy_impact": [
            "Fundacion de fisica y quimica nuclear",
            "Radioterapia para cancer",
            "Primera mujer profesora Sorbona",
            "Primera mujer Nobel, unica con 2 Nobeles en ciencias diferentes",
            "Elemento Curio nombrado en su honor",
            "Inspiracion para mujeres en STEM"
        ],
        "key_themes": ["legado cientifico", "servicio humanitario", "precio del pionerismo", "ciencia abierta", "inspiracion generacional"],
        "word_count": 2450,
        "reading_time_minutes": 12,
        "educational_level": "secundaria-preparatoria-universidad",
        "author": "GLIT Content Team",
        "content_format": "biography",
        "curriculum_connections": ["Historia de la ciencia", "Medicina nuclear", "Primera Guerra Mundial", "Etica cientifica", "Impacto social de la ciencia"]
    }'::jsonb,
    NOW(),
    NOW()
)

ON CONFLICT DO NOTHING;

-- ============================================================================
-- FIN: Marie Curie Biography Seeds
-- ============================================================================
