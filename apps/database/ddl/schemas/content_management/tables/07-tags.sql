-- =====================================================
-- Tabla: content_management.tags
-- Schema: content_management
-- Descripción: Catálogo maestro de tags para organización de contenido
-- Creado: 2026-01-04 (Auditoría P0-2)
-- =====================================================
--
-- NOTA: Esta tabla almacena el catálogo MAESTRO de tags.
-- Se diferencia de educational_content.content_tags que almacena
-- las RELACIONES entre contenido y tags.
--
-- CATEGORÍAS DE TAGS:
-- - person: Personas históricas (Marie Curie, Pierre Curie, etc.)
-- - scientific_concept: Conceptos científicos (Radioactividad, Radio, etc.)
-- - location: Lugares (Varsovia, París, Sorbona, etc.)
-- - achievement: Logros y premios (Premio Nobel, etc.)
-- - historical_event: Eventos históricos (Primera Guerra Mundial, etc.)
-- - subject: Materias educativas (Física, Química, etc.)
-- - theme: Temas transversales (Mujeres en Ciencia, etc.)
-- - value: Valores y lecciones (Perseverancia, etc.)
-- - method: Métodos y técnicas (Método Científico, etc.)
--
-- =====================================================

CREATE TABLE IF NOT EXISTS content_management.tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tag_name VARCHAR(100) NOT NULL,
    tag_slug VARCHAR(120) NOT NULL UNIQUE,
    tag_category VARCHAR(50) NOT NULL CHECK (tag_category IN (
        'person',
        'scientific_concept',
        'location',
        'achievement',
        'historical_event',
        'subject',
        'theme',
        'value',
        'method'
    )),
    description TEXT,
    usage_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices para búsquedas eficientes
CREATE INDEX IF NOT EXISTS idx_tags_slug ON content_management.tags(tag_slug);
CREATE INDEX IF NOT EXISTS idx_tags_category ON content_management.tags(tag_category);
CREATE INDEX IF NOT EXISTS idx_tags_name_trgm ON content_management.tags USING gin(tag_name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_tags_active ON content_management.tags(is_active) WHERE is_active = true;

-- Comentarios
COMMENT ON TABLE content_management.tags IS 'Catálogo maestro de tags para organización de contenido educativo';
COMMENT ON COLUMN content_management.tags.tag_name IS 'Nombre visible del tag (ej: "Marie Curie")';
COMMENT ON COLUMN content_management.tags.tag_slug IS 'Slug único para URLs (ej: "marie-curie")';
COMMENT ON COLUMN content_management.tags.tag_category IS 'Categoría del tag: person, scientific_concept, location, achievement, historical_event, subject, theme, value, method';
COMMENT ON COLUMN content_management.tags.description IS 'Descripción detallada del tag para contexto educativo';
COMMENT ON COLUMN content_management.tags.usage_count IS 'Contador de cuántas veces se ha usado este tag';
