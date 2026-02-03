-- =====================================================
-- Migración: Advanced Templates Enhancement
-- Fecha: 2026-02-03
-- Descripción: Agrega soporte para i18n y versionado en notification_templates
-- =====================================================
--
-- CARACTERÍSTICAS AGREGADAS:
-- 1. Versionado de templates (version, previous_version_id)
-- 2. Internacionalización (subject_translations, body_translations, html_translations)
-- 3. Índices adicionales para performance
--
-- IMPORTANTE:
-- - Esta migración es NO DESTRUCTIVA (solo agrega columnas)
-- - Los templates existentes funcionarán sin modificación
-- - Se asigna version=1 a todos los templates existentes
-- =====================================================

-- ========== VERSIONADO ==========

-- Agregar columna de versión
ALTER TABLE notifications.notification_templates
ADD COLUMN IF NOT EXISTS version INTEGER NOT NULL DEFAULT 1;

-- Agregar referencia a versión anterior
ALTER TABLE notifications.notification_templates
ADD COLUMN IF NOT EXISTS previous_version_id UUID REFERENCES notifications.notification_templates(id);

-- ========== INTERNACIONALIZACIÓN ==========

-- Traducciones del asunto por idioma
ALTER TABLE notifications.notification_templates
ADD COLUMN IF NOT EXISTS subject_translations JSONB DEFAULT '{}'::jsonb;

-- Traducciones del cuerpo por idioma
ALTER TABLE notifications.notification_templates
ADD COLUMN IF NOT EXISTS body_translations JSONB DEFAULT '{}'::jsonb;

-- Traducciones del HTML por idioma
ALTER TABLE notifications.notification_templates
ADD COLUMN IF NOT EXISTS html_translations JSONB DEFAULT '{}'::jsonb;

-- ========== ACTUALIZAR CONSTRAINT UNIQUE ==========

-- Primero eliminar el constraint existente si existe
DO $$
BEGIN
    -- Eliminar índice único existente si existe
    IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_notif_templates_key') THEN
        DROP INDEX IF EXISTS notifications.idx_notif_templates_key;
    END IF;

    -- Eliminar constraint único si existe
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'notification_templates_template_key_key'
        AND table_schema = 'notifications'
    ) THEN
        ALTER TABLE notifications.notification_templates
        DROP CONSTRAINT IF EXISTS notification_templates_template_key_key;
    END IF;
END $$;

-- Crear nuevo constraint único compuesto (template_key + version)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'uq_template_key_version'
        AND table_schema = 'notifications'
    ) THEN
        ALTER TABLE notifications.notification_templates
        ADD CONSTRAINT uq_template_key_version UNIQUE (template_key, version);
    END IF;
END $$;

-- ========== ÍNDICES ADICIONALES ==========

-- Índice para versión
CREATE INDEX IF NOT EXISTS idx_notif_templates_version
ON notifications.notification_templates(version);

-- Índice compuesto para búsquedas comunes
CREATE INDEX IF NOT EXISTS idx_notif_templates_key_active
ON notifications.notification_templates(template_key, is_active);

-- Índice para template_key (no único ahora)
CREATE INDEX IF NOT EXISTS idx_notif_templates_key
ON notifications.notification_templates(template_key);

-- ========== COMENTARIOS ACTUALIZADOS ==========

COMMENT ON COLUMN notifications.notification_templates.version
IS 'Número de versión del template (incrementa con cada cambio)';

COMMENT ON COLUMN notifications.notification_templates.previous_version_id
IS 'UUID de la versión anterior para historial de cambios';

COMMENT ON COLUMN notifications.notification_templates.subject_translations
IS 'Traducciones del asunto por idioma (JSONB). Ejemplo: {"es": "Hola", "en": "Hello"}';

COMMENT ON COLUMN notifications.notification_templates.body_translations
IS 'Traducciones del cuerpo por idioma (JSONB). Ejemplo: {"es": "...", "en": "..."}';

COMMENT ON COLUMN notifications.notification_templates.html_translations
IS 'Traducciones del HTML por idioma (JSONB). Ejemplo: {"es": "<h1>Hola</h1>", "en": "<h1>Hello</h1>"}';

-- ========== ACTUALIZAR COMENTARIO DE TABLA ==========

COMMENT ON TABLE notifications.notification_templates
IS 'Plantillas reutilizables para notificaciones con Handlebars, i18n y versionado (v2.0 - 2026-02-03)';

-- ========== MIGRACIÓN DE DATOS ==========

-- Copiar templates en español a translations como fallback
UPDATE notifications.notification_templates
SET
    subject_translations = jsonb_build_object('es', subject_template),
    body_translations = jsonb_build_object('es', body_template),
    html_translations = CASE
        WHEN html_template IS NOT NULL
        THEN jsonb_build_object('es', html_template)
        ELSE '{}'::jsonb
    END
WHERE subject_translations IS NULL OR subject_translations = '{}'::jsonb;

-- =====================================================
-- FIN DE MIGRACIÓN
-- =====================================================
