-- =====================================================
-- Tabla: notification_templates
-- Schema: notifications
-- Descripción: Plantillas de notificaciones reutilizables con Handlebars, i18n y versionado
-- Relacionado: EXT-003 (Notificaciones Multi-Canal)
-- Fecha: 2025-11-11
-- Actualizado: 2026-02-03 (Advanced Templates Enhancement)
-- =====================================================
--
-- CARACTERÍSTICAS v2.0:
-- - Handlebars como motor de templates ({{#if}}, {{#each}}, helpers)
-- - Internacionalización (es/en) via columnas JSONB de traducciones
-- - Versionado de templates para historial y rollback
-- - Helpers personalizados: formatDate, pluralize, currency, etc.
--
-- SINTAXIS HANDLEBARS SOPORTADA:
-- - {{variable}} - Interpolación de variables
-- - {{#if condition}}...{{/if}} - Condicionales
-- - {{#unless condition}}...{{/unless}} - Condicionales negativos
-- - {{#each items}}{{this.name}}{{/each}} - Loops
-- - {{formatDate date "DD/MM/YYYY"}} - Formateo de fechas
-- - {{pluralize count "item" "items"}} - Pluralización
-- - {{uppercase str}} / {{lowercase str}} - Transformación de texto
-- - {{currency amount "MXN"}} - Formateo de moneda
-- =====================================================

DROP TABLE IF EXISTS notifications.notification_templates CASCADE;

CREATE TABLE notifications.notification_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Clave única para identificar el template
    -- Ejemplo: 'achievement_unlocked', 'mission_completed', 'assignment_due'
    template_key VARCHAR(100) NOT NULL,

    -- Nombre descriptivo
    name VARCHAR(255) NOT NULL,

    -- Descripción del propósito del template
    description TEXT,

    -- Plantillas de contenido (idioma por defecto: español)
    subject_template TEXT, -- Para emails (Handlebars syntax)
    body_template TEXT NOT NULL, -- Texto plano con Handlebars syntax
    html_template TEXT, -- HTML para emails con Handlebars syntax (opcional)

    -- Variables disponibles en el template
    -- Ejemplo: ["user_name", "achievement_name", "points_earned"]
    variables JSONB DEFAULT '[]'::jsonb,

    -- Canales por defecto para este tipo de notificación
    default_channels VARCHAR(50)[] DEFAULT ARRAY['in_app'],

    -- Estado
    is_active BOOLEAN DEFAULT true,

    -- ========== VERSIONADO (v2.0 - 2026-02-03) ==========
    -- Número de versión del template (incrementa con cada cambio)
    version INTEGER NOT NULL DEFAULT 1,

    -- Referencia a la versión anterior para historial
    previous_version_id UUID REFERENCES notifications.notification_templates(id),

    -- ========== INTERNACIONALIZACIÓN (v2.0 - 2026-02-03) ==========
    -- Traducciones del asunto por idioma
    -- Ejemplo: {"es": "¡Hola {{user_name}}!", "en": "Hello {{user_name}}!"}
    subject_translations JSONB DEFAULT '{}'::jsonb,

    -- Traducciones del cuerpo por idioma
    -- Ejemplo: {"es": "Bienvenido...", "en": "Welcome..."}
    body_translations JSONB DEFAULT '{}'::jsonb,

    -- Traducciones del HTML por idioma
    -- Ejemplo: {"es": "<h1>Hola</h1>", "en": "<h1>Hello</h1>"}
    html_translations JSONB DEFAULT '{}'::jsonb,

    -- Timestamps
    created_at TIMESTAMP DEFAULT gamilit.now_mexico(),
    updated_at TIMESTAMP DEFAULT gamilit.now_mexico(),

    -- Constraint: template_key + version debe ser único
    CONSTRAINT uq_template_key_version UNIQUE (template_key, version)
);

-- Índices
CREATE INDEX idx_notif_templates_key ON notifications.notification_templates(template_key);
CREATE INDEX idx_notif_templates_active ON notifications.notification_templates(is_active);
CREATE INDEX idx_notif_templates_version ON notifications.notification_templates(version);
CREATE INDEX idx_notif_templates_key_active ON notifications.notification_templates(template_key, is_active);

-- Comentarios
COMMENT ON TABLE notifications.notification_templates IS 'Plantillas reutilizables para notificaciones con Handlebars, i18n y versionado (v2.0 - 2026-02-03)';
COMMENT ON COLUMN notifications.notification_templates.template_key IS 'Clave única del template (ej: achievement_unlocked)';
COMMENT ON COLUMN notifications.notification_templates.body_template IS 'Plantilla del cuerpo con sintaxis Handlebars';
COMMENT ON COLUMN notifications.notification_templates.variables IS 'Array JSON con nombres de variables disponibles';
COMMENT ON COLUMN notifications.notification_templates.default_channels IS 'Canales por defecto: in_app, email, push';
COMMENT ON COLUMN notifications.notification_templates.version IS 'Número de versión del template (incrementa con cada cambio)';
COMMENT ON COLUMN notifications.notification_templates.previous_version_id IS 'UUID de la versión anterior para historial';
COMMENT ON COLUMN notifications.notification_templates.subject_translations IS 'Traducciones del asunto por idioma (JSONB)';
COMMENT ON COLUMN notifications.notification_templates.body_translations IS 'Traducciones del cuerpo por idioma (JSONB)';
COMMENT ON COLUMN notifications.notification_templates.html_translations IS 'Traducciones del HTML por idioma (JSONB)';
