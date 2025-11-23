-- ========================================
-- CORRECCIÓN C1.3.3: Crear tabla tags
-- ========================================

/**
 * Tabla para sistema de etiquetado de contenido
 * Usada por: apps/database/seeds/dev/content_management/03-tags.sql
 *
 * Permite categorizar y buscar contenido por tags
 */

-- Verificar que el esquema existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = 'content_management') THEN
        RAISE EXCEPTION 'Schema content_management no existe. Ejecutar primero el DDL de schemas.';
    END IF;
END $$;

-- Crear tabla principal de tags
CREATE TABLE IF NOT EXISTS content_management.tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    color VARCHAR(7), -- Hex color format: #RRGGBB
    icon VARCHAR(50), -- Nombre del icono o emoji
    category VARCHAR(50), -- 'subject', 'skill', 'topic', 'difficulty', 'grade', etc.
    usage_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    tenant_id UUID, -- REFERENCES auth_management.tenants(id) si existe
    metadata JSONB DEFAULT '{}'::JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT unique_tag_name_per_tenant
        UNIQUE (name, tenant_id)
);

-- Comentarios
COMMENT ON TABLE content_management.tags IS 'Tags/etiquetas para categorizar contenido educativo';
COMMENT ON COLUMN content_management.tags.name IS 'Nombre del tag (ej: "Matemáticas", "Lectura Crítica")';
COMMENT ON COLUMN content_management.tags.slug IS 'Slug URL-friendly único (ej: "matematicas", "lectura-critica")';
COMMENT ON COLUMN content_management.tags.color IS 'Color en formato hex para UI (#FF5733)';
COMMENT ON COLUMN content_management.tags.category IS 'Categoría del tag para agrupar';
COMMENT ON COLUMN content_management.tags.usage_count IS 'Contador de veces que se usa el tag';

-- Índices
CREATE INDEX IF NOT EXISTS idx_tags_slug ON content_management.tags(slug);
CREATE INDEX IF NOT EXISTS idx_tags_category ON content_management.tags(category);
CREATE INDEX IF NOT EXISTS idx_tags_active ON content_management.tags(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_tags_tenant ON content_management.tags(tenant_id) WHERE tenant_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_tags_usage ON content_management.tags(usage_count DESC);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION content_management.update_tags_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_tags_updated_at
    BEFORE UPDATE ON content_management.tags
    FOR EACH ROW
    EXECUTE FUNCTION content_management.update_tags_updated_at();

-- ========================================
-- Tabla de relación many-to-many
-- ========================================

-- Tags para módulos educativos
CREATE TABLE IF NOT EXISTS content_management.module_tags (
    module_id UUID NOT NULL, -- REFERENCES educational_content.modules(id)
    tag_id UUID NOT NULL REFERENCES content_management.tags(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (module_id, tag_id)
);

COMMENT ON TABLE content_management.module_tags IS 'Relación many-to-many entre módulos y tags';

CREATE INDEX IF NOT EXISTS idx_module_tags_module ON content_management.module_tags(module_id);
CREATE INDEX IF NOT EXISTS idx_module_tags_tag ON content_management.module_tags(tag_id);

-- Tags para ejercicios
CREATE TABLE IF NOT EXISTS content_management.exercise_tags (
    exercise_id UUID NOT NULL, -- REFERENCES educational_content.exercises(id)
    tag_id UUID NOT NULL REFERENCES content_management.tags(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (exercise_id, tag_id)
);

COMMENT ON TABLE content_management.exercise_tags IS 'Relación many-to-many entre ejercicios y tags';

CREATE INDEX IF NOT EXISTS idx_exercise_tags_exercise ON content_management.exercise_tags(exercise_id);
CREATE INDEX IF NOT EXISTS idx_exercise_tags_tag ON content_management.exercise_tags(tag_id);

-- Tags para contenido Marie Curie
CREATE TABLE IF NOT EXISTS content_management.marie_curie_content_tags (
    content_id UUID NOT NULL, -- REFERENCES content_management.marie_curie_content(id)
    tag_id UUID NOT NULL REFERENCES content_management.tags(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (content_id, tag_id)
);

COMMENT ON TABLE content_management.marie_curie_content_tags IS 'Relación many-to-many entre contenido Marie Curie y tags';

CREATE INDEX IF NOT EXISTS idx_marie_curie_content_tags_content ON content_management.marie_curie_content_tags(content_id);
CREATE INDEX IF NOT EXISTS idx_marie_curie_content_tags_tag ON content_management.marie_curie_content_tags(tag_id);

-- ========================================
-- Función para actualizar usage_count
-- ========================================

CREATE OR REPLACE FUNCTION content_management.update_tag_usage_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE content_management.tags
        SET usage_count = usage_count + 1
        WHERE id = NEW.tag_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE content_management.tags
        SET usage_count = GREATEST(usage_count - 1, 0)
        WHERE id = OLD.tag_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Triggers para actualizar usage_count automáticamente
CREATE TRIGGER trg_module_tags_usage
    AFTER INSERT OR DELETE ON content_management.module_tags
    FOR EACH ROW
    EXECUTE FUNCTION content_management.update_tag_usage_count();

CREATE TRIGGER trg_exercise_tags_usage
    AFTER INSERT OR DELETE ON content_management.exercise_tags
    FOR EACH ROW
    EXECUTE FUNCTION content_management.update_tag_usage_count();

CREATE TRIGGER trg_marie_curie_content_tags_usage
    AFTER INSERT OR DELETE ON content_management.marie_curie_content_tags
    FOR EACH ROW
    EXECUTE FUNCTION content_management.update_tag_usage_count();

/**
 * Validación:
 *
 * -- Verificar que las tablas existen
 * \dt content_management.tags
 * \dt content_management.module_tags
 * \dt content_management.exercise_tags
 *
 * -- Insertar tags de prueba
 * INSERT INTO content_management.tags (name, slug, category, color)
 * VALUES
 *   ('Matemáticas', 'matematicas', 'subject', '#FF5733'),
 *   ('Lectura Crítica', 'lectura-critica', 'skill', '#33FF57'),
 *   ('Historia', 'historia', 'subject', '#3357FF');
 *
 * -- Verificar inserción
 * SELECT * FROM content_management.tags;
 *
 * -- Ahora ejecutar seed:
 * psql -d gamilit -f apps/database/seeds/dev/content_management/03-tags.sql
 */

-- Mensaje de éxito
DO $$
BEGIN
    RAISE NOTICE '✅ Sistema de tags creado exitosamente';
    RAISE NOTICE 'Tablas creadas:';
    RAISE NOTICE '  - content_management.tags';
    RAISE NOTICE '  - content_management.module_tags';
    RAISE NOTICE '  - content_management.exercise_tags';
    RAISE NOTICE '  - content_management.marie_curie_content_tags';
    RAISE NOTICE 'Ahora puedes ejecutar: apps/database/seeds/dev/content_management/03-tags.sql';
END $$;
