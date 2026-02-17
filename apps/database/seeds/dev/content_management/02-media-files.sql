-- ============================================================================
-- SEED: Media Files for Marie Curie Content
-- ============================================================================
-- Descripcion: Archivos multimedia relacionados con Marie Curie para
--              enriquecer el contenido educativo (imagenes, videos, audio)
-- Schema: content_management
-- Tablas: media_files
-- Prioridad: 2
-- Dependencias: Schema content_management debe existir
-- Version: 1.1 (fixed column names to match DDL)
-- ============================================================================

SET search_path TO content_management, public;

-- ============================================================================
-- MEDIA FILES: Imagenes, Videos, y Audio de Marie Curie
-- ============================================================================

INSERT INTO content_management.media_files (
    filename,
    original_filename,
    file_extension,
    mime_type,
    file_size_bytes,
    media_type,
    storage_path,
    folder_path,
    caption,
    description,
    alt_text,
    tags,
    is_active,
    metadata,
    created_at,
    updated_at
) VALUES

-- ============================================================================
-- IMAGENES: Fotografias historicas de Marie Curie
-- ============================================================================

(
    'marie-curie-portrait-1903.jpg',
    'marie-curie-portrait-1903.jpg',
    'jpg',
    'image/jpeg',
    245678,
    'image'::content_management.media_type,
    '/media/images/marie-curie/marie-curie-portrait-1903.jpg',
    '/media/images/marie-curie',
    'Retrato de Marie Curie (1903)',
    'Fotografia oficial de Marie Curie tomada en 1903, ano de su primer Premio Nobel de Fisica.',
    'Retrato en blanco y negro de Marie Curie en 1903',
    ARRAY['Marie Curie', 'Retrato', '1903', 'Nobel', 'Fotografia Historica', 'Mujer Cientifica']::text[],
    true,
    '{
        "year": 1903,
        "photographer": "Desconocido",
        "source": "Dominio Publico",
        "copyright": "Public Domain",
        "dimensions": {"width": 800, "height": 1000, "unit": "pixels"},
        "educational_use": true
    }'::jsonb,
    NOW(),
    NOW()
),

(
    'marie-pierre-curie-laboratory.jpg',
    'marie-pierre-curie-laboratory.jpg',
    'jpg',
    'image/jpeg',
    312456,
    'image'::content_management.media_type,
    '/media/images/marie-curie/marie-pierre-curie-laboratory.jpg',
    '/media/images/marie-curie',
    'Marie y Pierre Curie en su laboratorio',
    'Marie y Pierre Curie trabajando juntos en su laboratorio improvisado de Paris.',
    'Marie y Pierre Curie en su laboratorio, ambos inclinados sobre una mesa de trabajo',
    ARRAY['Marie Curie', 'Pierre Curie', 'Laboratorio', 'Investigacion', 'Colaboracion Cientifica', 'Pechblenda']::text[],
    true,
    '{"year": 1898, "location": "Paris, Francia", "source": "Dominio Publico", "educational_use": true}'::jsonb,
    NOW(),
    NOW()
),

(
    'marie-curie-sorbonne-lecture.jpg',
    'marie-curie-sorbonne-lecture.jpg',
    'jpg',
    'image/jpeg',
    278934,
    'image'::content_management.media_type,
    '/media/images/marie-curie/marie-curie-sorbonne-lecture.jpg',
    '/media/images/marie-curie',
    'Marie Curie dando clase en la Sorbona',
    'Fotografia de Marie Curie como profesora en la Universidad de la Sorbona.',
    'Marie Curie de pie junto a una pizarra con formulas cientificas',
    ARRAY['Marie Curie', 'Sorbona', 'Profesora', 'Educacion', 'Primera Mujer', 'Universidad']::text[],
    true,
    '{"year": 1906, "location": "Universidad de la Sorbona, Paris", "source": "Dominio Publico", "educational_use": true}'::jsonb,
    NOW(),
    NOW()
),

(
    'marie-curie-radium-glowing.jpg',
    'marie-curie-radium-glowing.jpg',
    'jpg',
    'image/jpeg',
    198234,
    'image'::content_management.media_type,
    '/media/images/marie-curie/marie-curie-radium-glowing.jpg',
    '/media/images/marie-curie',
    'Marie Curie observando el brillo del Radio',
    'Recreacion artistica basada en descripciones historicas de Marie Curie observando tubos de ensayo con radio en la oscuridad.',
    'Imagen artistica de Marie Curie en la oscuridad observando tubos de ensayo que emiten un brillo fosforescente',
    ARRAY['Marie Curie', 'Radio', 'Fosforescencia', 'Descubrimiento', 'Noche', 'Laboratorio']::text[],
    true,
    '{"type": "recreacion artistica", "year_depicted": 1898, "source": "Ilustracion educativa", "educational_use": true}'::jsonb,
    NOW(),
    NOW()
),

(
    'marie-curie-nobel-ceremony-1903.jpg',
    'marie-curie-nobel-ceremony-1903.jpg',
    'jpg',
    'image/jpeg',
    289456,
    'image'::content_management.media_type,
    '/media/images/marie-curie/marie-curie-nobel-ceremony-1903.jpg',
    '/media/images/marie-curie',
    'Ceremonia Premio Nobel 1903',
    'Fotografia conmemorativa relacionada con el Premio Nobel de Fisica de 1903.',
    'Fotografia formal relacionada con la ceremonia del Premio Nobel de Fisica 1903',
    ARRAY['Marie Curie', 'Pierre Curie', 'Premio Nobel', 'Fisica', '1903', 'Ceremonia']::text[],
    true,
    '{"year": 1903, "event": "Premio Nobel de Fisica 1903", "source": "Archivos Nobel", "educational_use": true}'::jsonb,
    NOW(),
    NOW()
),

(
    'marie-curie-wwi-xray-vehicle.jpg',
    'marie-curie-wwi-xray-vehicle.jpg',
    'jpg',
    'image/jpeg',
    334567,
    'image'::content_management.media_type,
    '/media/images/marie-curie/marie-curie-wwi-xray-vehicle.jpg',
    '/media/images/marie-curie',
    'Marie Curie con vehiculo de rayos X (Petit Curie)',
    'Marie Curie junto a una de las unidades moviles de radiologia durante la Primera Guerra Mundial.',
    'Marie Curie de pie junto a un vehiculo automovil equipado con maquina de rayos X',
    ARRAY['Marie Curie', 'Primera Guerra Mundial', 'Rayos X', 'Petit Curie', 'Servicio Humanitario', 'Medicina']::text[],
    true,
    '{"year": 1914, "period": "Primera Guerra Mundial", "source": "Archivos de guerra", "educational_use": true}'::jsonb,
    NOW(),
    NOW()
),

-- ============================================================================
-- DIAGRAMAS: Ilustraciones educativas
-- ============================================================================

(
    'periodic-table-curie-elements.svg',
    'periodic-table-curie-elements.svg',
    'svg',
    'image/svg+xml',
    45678,
    'image'::content_management.media_type,
    '/media/diagrams/periodic-table-curie-elements.svg',
    '/media/diagrams',
    'Tabla Periodica: Radio (Ra) y Polonio (Po)',
    'Tabla periodica de los elementos con los elementos descubiertos por Marie Curie destacados.',
    'Tabla periodica de elementos quimicos con el Polonio (Po) y el Radio (Ra) resaltados',
    ARRAY['Tabla Periodica', 'Radio', 'Polonio', 'Quimica', 'Elementos', 'Descubrimientos']::text[],
    true,
    '{"type": "diagrama educativo", "format": "SVG vectorial", "educational_use": true}'::jsonb,
    NOW(),
    NOW()
),

(
    'radioactivity-decay-diagram.svg',
    'radioactivity-decay-diagram.svg',
    'svg',
    'image/svg+xml',
    38924,
    'image'::content_management.media_type,
    '/media/diagrams/radioactivity-decay-diagram.svg',
    '/media/diagrams',
    'Diagrama: Desintegracion Radioactiva',
    'Diagrama educativo que ilustra el concepto de desintegracion radioactiva descubierto por Marie Curie.',
    'Diagrama cientifico mostrando un nucleo atomico emitiendo radiacion',
    ARRAY['Radioactividad', 'Desintegracion', 'Fisica Nuclear', 'Particulas', 'Diagrama Educativo']::text[],
    true,
    '{"type": "diagrama cientifico", "format": "SVG vectorial", "concept": "Desintegracion radioactiva", "educational_use": true}'::jsonb,
    NOW(),
    NOW()
),

(
    'curie-timeline-infographic.svg',
    'curie-timeline-infographic.svg',
    'svg',
    'image/svg+xml',
    67890,
    'image'::content_management.media_type,
    '/media/diagrams/curie-timeline-infographic.svg',
    '/media/diagrams',
    'Linea de Tiempo: Vida de Marie Curie',
    'Infografia que presenta los momentos clave de la vida de Marie Curie desde 1867 hasta 1934.',
    'Linea de tiempo horizontal ilustrada con iconos y fechas clave de la vida de Marie Curie',
    ARRAY['Marie Curie', 'Linea de Tiempo', 'Biografia', 'Infografia', 'Historia']::text[],
    true,
    '{"type": "infografia educativa", "format": "SVG vectorial", "span": "1867-1934", "educational_use": true}'::jsonb,
    NOW(),
    NOW()
),

-- ============================================================================
-- VIDEO: Contenido multimedia educativo
-- ============================================================================

(
    'marie-curie-documentary-intro.mp4',
    'marie-curie-documentary-intro.mp4',
    'mp4',
    'video/mp4',
    15678900,
    'video'::content_management.media_type,
    '/media/videos/marie-curie-documentary-intro.mp4',
    '/media/videos',
    'Introduccion: La Vida de Marie Curie',
    'Video introductorio de 3 minutos sobre la vida de Marie Curie.',
    'Video documental introductorio sobre Marie Curie con fotografias historicas y narracion',
    ARRAY['Marie Curie', 'Documental', 'Video Educativo', 'Biografia', 'Introduccion']::text[],
    true,
    '{"duration_seconds": 180, "resolution": "1080p", "has_subtitles": true, "educational_use": true}'::jsonb,
    NOW(),
    NOW()
),

(
    'radioactivity-explanation-animated.mp4',
    'radioactivity-explanation-animated.mp4',
    'mp4',
    'video/mp4',
    22345678,
    'video'::content_management.media_type,
    '/media/videos/radioactivity-explanation-animated.mp4',
    '/media/videos',
    'Explicacion Animada: Que es la Radioactividad?',
    'Video educativo de 5 minutos que explica el concepto de radioactividad.',
    'Video animado explicando el concepto de radioactividad con graficos de atomos y particulas',
    ARRAY['Radioactividad', 'Educacion', 'Animacion', 'Fisica Nuclear', 'Concepto Cientifico']::text[],
    true,
    '{"duration_seconds": 300, "resolution": "1080p", "animation_style": "2D educativo", "has_subtitles": true, "educational_use": true}'::jsonb,
    NOW(),
    NOW()
),

-- ============================================================================
-- AUDIO: Pronunciaciones y contenido auditivo
-- ============================================================================

(
    'scientific-terms-pronunciation.mp3',
    'scientific-terms-pronunciation.mp3',
    'mp3',
    'audio/mpeg',
    2345678,
    'audio'::content_management.media_type,
    '/media/audio/scientific-terms-pronunciation.mp3',
    '/media/audio',
    'Pronunciacion: Terminos Cientificos Marie Curie',
    'Audio educativo con la pronunciacion correcta de terminos cientificos clave relacionados con Marie Curie.',
    'Audio educativo de pronunciacion de terminos cientificos relacionados con Marie Curie',
    ARRAY['Pronunciacion', 'Vocabulario', 'Ciencias', 'Audio Educativo', 'Terminos Tecnicos']::text[],
    true,
    '{"duration_seconds": 120, "bitrate": "192kbps", "language": "es", "educational_use": true}'::jsonb,
    NOW(),
    NOW()
),

(
    'marie-curie-quotes-narrated.mp3',
    'marie-curie-quotes-narrated.mp3',
    'mp3',
    'audio/mpeg',
    3456789,
    'audio'::content_management.media_type,
    '/media/audio/marie-curie-quotes-narrated.mp3',
    '/media/audio',
    'Frases Celebres de Marie Curie (Narradas)',
    'Coleccion de 10 frases inspiradoras de Marie Curie, narradas con musica de fondo suave.',
    'Audio con frases celebres de Marie Curie narradas con musica de fondo',
    ARRAY['Marie Curie', 'Frases', 'Inspiracion', 'Audio Educativo', 'Motivacion']::text[],
    true,
    '{"duration_seconds": 240, "bitrate": "192kbps", "primary_language": "es", "quotes_count": 10, "educational_use": true}'::jsonb,
    NOW(),
    NOW()
)

ON CONFLICT DO NOTHING;

-- ============================================================================
-- FIN: Media Files Seeds
-- ============================================================================
