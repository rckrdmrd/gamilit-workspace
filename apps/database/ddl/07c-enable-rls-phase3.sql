-- =====================================================
-- Enable RLS Phase 3 - GAMILIT
-- Created: 2026-01-27
-- Task: TASK-P3-RLS-PHASE3-2026-01-27
-- Description: Expande cobertura RLS a 80%+
--              Schemas: content_management, system_configuration
-- =====================================================
-- FASE 3: 19 tablas adicionales
-- Target: 80%+ cobertura RLS
-- =====================================================

-- ============================================
-- SECCION 1: CONTENT_MANAGEMENT (10 tablas)
-- Mayoria son ADMIN_ONLY o PUBLIC_READ
-- ============================================

-- 1.1 content_templates - Plantillas de contenido
ALTER TABLE content_management.content_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY content_templates_admin_all ON content_management.content_templates
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM auth_management.profiles p
            JOIN auth_management.user_roles ur ON p.id = ur.user_id
            WHERE p.id = auth.uid() AND ur.role = 'admin'
        )
    );

CREATE POLICY content_templates_public_read ON content_management.content_templates
    FOR SELECT TO authenticated
    USING (true);

-- 1.2 marie_curie_content - Contenido de Marie Curie
ALTER TABLE content_management.marie_curie_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY marie_curie_content_admin_all ON content_management.marie_curie_content
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM auth_management.profiles p
            JOIN auth_management.user_roles ur ON p.id = ur.user_id
            WHERE p.id = auth.uid() AND ur.role = 'admin'
        )
    );

CREATE POLICY marie_curie_content_public_read ON content_management.marie_curie_content
    FOR SELECT TO authenticated
    USING (true);

-- 1.3 media_files - Archivos multimedia
ALTER TABLE content_management.media_files ENABLE ROW LEVEL SECURITY;

CREATE POLICY media_files_admin_all ON content_management.media_files
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM auth_management.profiles p
            JOIN auth_management.user_roles ur ON p.id = ur.user_id
            WHERE p.id = auth.uid() AND ur.role = 'admin'
        )
    );

CREATE POLICY media_files_public_read ON content_management.media_files
    FOR SELECT TO authenticated
    USING (true);

-- 1.4 content_versions - Versiones de contenido
ALTER TABLE content_management.content_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY content_versions_admin_all ON content_management.content_versions
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM auth_management.profiles p
            JOIN auth_management.user_roles ur ON p.id = ur.user_id
            WHERE p.id = auth.uid() AND ur.role IN ('admin', 'teacher')
        )
    );

CREATE POLICY content_versions_public_read ON content_management.content_versions
    FOR SELECT TO authenticated
    USING (true);

-- 1.5 flagged_content - Contenido reportado
ALTER TABLE content_management.flagged_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY flagged_content_admin_only ON content_management.flagged_content
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM auth_management.profiles p
            JOIN auth_management.user_roles ur ON p.id = ur.user_id
            WHERE p.id = auth.uid() AND ur.role = 'admin'
        )
    );

-- Usuarios pueden reportar (INSERT) pero no ver otros reportes
CREATE POLICY flagged_content_user_insert ON content_management.flagged_content
    FOR INSERT TO authenticated
    WITH CHECK (reported_by = auth.uid());

CREATE POLICY flagged_content_user_read_own ON content_management.flagged_content
    FOR SELECT TO authenticated
    USING (reported_by = auth.uid());

-- 1.6 moderation_rules - Reglas de moderacion
ALTER TABLE content_management.moderation_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY moderation_rules_admin_only ON content_management.moderation_rules
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM auth_management.profiles p
            JOIN auth_management.user_roles ur ON p.id = ur.user_id
            WHERE p.id = auth.uid() AND ur.role = 'admin'
        )
    );

-- 1.7 tags - Etiquetas de contenido
ALTER TABLE content_management.tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY tags_admin_all ON content_management.tags
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM auth_management.profiles p
            JOIN auth_management.user_roles ur ON p.id = ur.user_id
            WHERE p.id = auth.uid() AND ur.role = 'admin'
        )
    );

CREATE POLICY tags_public_read ON content_management.tags
    FOR SELECT TO authenticated
    USING (true);

-- 1.8 content_authors - Autores de contenido
ALTER TABLE content_management.content_authors ENABLE ROW LEVEL SECURITY;

CREATE POLICY content_authors_admin_all ON content_management.content_authors
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM auth_management.profiles p
            JOIN auth_management.user_roles ur ON p.id = ur.user_id
            WHERE p.id = auth.uid() AND ur.role = 'admin'
        )
    );

CREATE POLICY content_authors_public_read ON content_management.content_authors
    FOR SELECT TO authenticated
    USING (true);

-- 1.9 content_categories - Categorias de contenido
ALTER TABLE content_management.content_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY content_categories_admin_all ON content_management.content_categories
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM auth_management.profiles p
            JOIN auth_management.user_roles ur ON p.id = ur.user_id
            WHERE p.id = auth.uid() AND ur.role = 'admin'
        )
    );

CREATE POLICY content_categories_public_read ON content_management.content_categories
    FOR SELECT TO authenticated
    USING (true);

-- 1.10 media_metadata - Metadata de archivos multimedia
ALTER TABLE content_management.media_metadata ENABLE ROW LEVEL SECURITY;

CREATE POLICY media_metadata_admin_all ON content_management.media_metadata
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM auth_management.profiles p
            JOIN auth_management.user_roles ur ON p.id = ur.user_id
            WHERE p.id = auth.uid() AND ur.role = 'admin'
        )
    );

CREATE POLICY media_metadata_public_read ON content_management.media_metadata
    FOR SELECT TO authenticated
    USING (true);

-- ============================================
-- SECCION 2: SYSTEM_CONFIGURATION (9 tablas)
-- Todas son ADMIN_ONLY
-- ============================================

-- 2.1 system_settings - Configuracion del sistema
ALTER TABLE system_configuration.system_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY system_settings_admin_only ON system_configuration.system_settings
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM auth_management.profiles p
            JOIN auth_management.user_roles ur ON p.id = ur.user_id
            WHERE p.id = auth.uid() AND ur.role = 'admin'
        )
    );

-- 2.2 gamification_parameters - Parametros de gamificacion
ALTER TABLE system_configuration.gamification_parameters ENABLE ROW LEVEL SECURITY;

CREATE POLICY gamification_parameters_admin_only ON system_configuration.gamification_parameters
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM auth_management.profiles p
            JOIN auth_management.user_roles ur ON p.id = ur.user_id
            WHERE p.id = auth.uid() AND ur.role = 'admin'
        )
    );

-- Lectura publica para que el frontend pueda leer parametros
CREATE POLICY gamification_parameters_public_read ON system_configuration.gamification_parameters
    FOR SELECT TO authenticated
    USING (true);

-- 2.3 notification_settings - Configuracion de notificaciones
ALTER TABLE system_configuration.notification_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY notification_settings_admin_only ON system_configuration.notification_settings
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM auth_management.profiles p
            JOIN auth_management.user_roles ur ON p.id = ur.user_id
            WHERE p.id = auth.uid() AND ur.role = 'admin'
        )
    );

-- 2.4 rate_limits - Limites de tasa
ALTER TABLE system_configuration.rate_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY rate_limits_admin_only ON system_configuration.rate_limits
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM auth_management.profiles p
            JOIN auth_management.user_roles ur ON p.id = ur.user_id
            WHERE p.id = auth.uid() AND ur.role = 'admin'
        )
    );

-- 2.5 notification_settings_global - Configuracion global de notificaciones
ALTER TABLE system_configuration.notification_settings_global ENABLE ROW LEVEL SECURITY;

CREATE POLICY notification_settings_global_admin_only ON system_configuration.notification_settings_global
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM auth_management.profiles p
            JOIN auth_management.user_roles ur ON p.id = ur.user_id
            WHERE p.id = auth.uid() AND ur.role = 'admin'
        )
    );

-- 2.6 feature_flags - Feature flags
ALTER TABLE system_configuration.feature_flags ENABLE ROW LEVEL SECURITY;

CREATE POLICY feature_flags_admin_only ON system_configuration.feature_flags
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM auth_management.profiles p
            JOIN auth_management.user_roles ur ON p.id = ur.user_id
            WHERE p.id = auth.uid() AND ur.role = 'admin'
        )
    );

-- Lectura publica para que frontend pueda verificar features
CREATE POLICY feature_flags_public_read ON system_configuration.feature_flags
    FOR SELECT TO authenticated
    USING (true);

-- 2.7 api_configuration - Configuracion de API
ALTER TABLE system_configuration.api_configuration ENABLE ROW LEVEL SECURITY;

CREATE POLICY api_configuration_admin_only ON system_configuration.api_configuration
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM auth_management.profiles p
            JOIN auth_management.user_roles ur ON p.id = ur.user_id
            WHERE p.id = auth.uid() AND ur.role = 'admin'
        )
    );

-- 2.8 environment_config - Configuracion de entorno
ALTER TABLE system_configuration.environment_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY environment_config_admin_only ON system_configuration.environment_config
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM auth_management.profiles p
            JOIN auth_management.user_roles ur ON p.id = ur.user_id
            WHERE p.id = auth.uid() AND ur.role = 'admin'
        )
    );

-- 2.9 tenant_configurations - Configuraciones por tenant
ALTER TABLE system_configuration.tenant_configurations ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_configurations_admin_only ON system_configuration.tenant_configurations
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM auth_management.profiles p
            JOIN auth_management.user_roles ur ON p.id = ur.user_id
            WHERE p.id = auth.uid() AND ur.role = 'admin'
        )
    );

-- =====================================================
-- FIN DE RLS FASE 3
-- Total tablas: 19 (10 content_management + 9 system_configuration)
-- Cobertura acumulada: ~80% (59 + 19 = 78 tablas)
-- =====================================================

COMMENT ON SCHEMA content_management IS 'Content management schema - RLS Phase 3 enabled';
COMMENT ON SCHEMA system_configuration IS 'System configuration schema - RLS Phase 3 enabled (admin-only)';
