-- ============================================================================
-- GLIT Platform - Prerequisites (ENUMs y Funciones Base)
-- Descripción: Todos los tipos y funciones que deben existir ANTES de crear tablas
-- Creado: 2025-11-02
-- Actualizado: 2025-11-11 (DB-111 - Agregados roles estándar RLS)
-- ============================================================================

-- ============================================================================
-- ROLES ESTÁNDAR PARA RLS (Row Level Security)
-- ============================================================================
-- Nota: Estos roles son patrón estándar de la industria para RLS en PostgreSQL.
-- Se crean condicionalmente para que RLS policies funcionen correctamente.

DO $$ BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'authenticated') THEN
        CREATE ROLE authenticated;
        COMMENT ON ROLE authenticated IS 'Rol RLS: usuarios autenticados (cualquier rol GAMILIT)';
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'anon') THEN
        CREATE ROLE anon;
        COMMENT ON ROLE anon IS 'Rol RLS: usuarios anónimos (sin autenticar)';
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'service_role') THEN
        CREATE ROLE service_role;
        COMMENT ON ROLE service_role IS 'Rol RLS: servicio backend con privilegios elevados';
    END IF;
END $$;

-- ============================================================================
-- EXTENSIONES REQUERIDAS
-- ============================================================================

-- pg_trgm: Similarity matching para fuzzy validation
-- Usado en validate_fill_in_blank y otros validadores con fuzzy_matching_threshold
-- Funciones: similarity(), word_similarity(), strict_word_similarity()
-- Documentación: https://www.postgresql.org/docs/current/pgtrgm.html
CREATE EXTENSION IF NOT EXISTS pg_trgm;

COMMENT ON EXTENSION pg_trgm IS 'Fuzzy string matching para validadores de ejercicios (similarity function)';

-- pgcrypto: Cryptographic functions for password hashing
-- Usado en seeds de demo-users para generar encrypted_password
-- Funciones: crypt(), gen_salt()
-- Documentación: https://www.postgresql.org/docs/current/pgcrypto.html
CREATE EXTENSION IF NOT EXISTS pgcrypto;

COMMENT ON EXTENSION pgcrypto IS 'Cryptographic functions for password hashing (crypt, gen_salt)';

-- ============================================================================
-- SCHEMAS
-- ============================================================================

CREATE SCHEMA IF NOT EXISTS gamilit;
CREATE SCHEMA IF NOT EXISTS gamification_system;
CREATE SCHEMA IF NOT EXISTS auth;
CREATE SCHEMA IF NOT EXISTS auth_management;
CREATE SCHEMA IF NOT EXISTS system_configuration;
CREATE SCHEMA IF NOT EXISTS educational_content;
CREATE SCHEMA IF NOT EXISTS content_management;
CREATE SCHEMA IF NOT EXISTS social_features;
CREATE SCHEMA IF NOT EXISTS progress_tracking;
CREATE SCHEMA IF NOT EXISTS audit_logging;
CREATE SCHEMA IF NOT EXISTS admin_dashboard;
CREATE SCHEMA IF NOT EXISTS lti_integration;
CREATE SCHEMA IF NOT EXISTS notifications;
CREATE SCHEMA IF NOT EXISTS storage;
CREATE SCHEMA IF NOT EXISTS communication;

-- ============================================================================
-- PARTE 1: TODOS LOS ENUMs
-- ============================================================================

-- 1. ENUMs de Autenticación

-- 📚 Documentación: auth_management.gamilit_role
-- Requerimiento: docs/01-requerimientos/01-autenticacion-autorizacion/RF-AUTH-001-roles.md
-- Especificación: docs/02-especificaciones-tecnicas/01-autenticacion-autorizacion/ET-AUTH-001-rbac.md
DO $$ BEGIN
    CREATE TYPE auth_management.gamilit_role AS ENUM ('student', 'admin_teacher', 'super_admin');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 📚 Documentación: auth_management.user_status
-- Requerimiento: docs/01-requerimientos/01-autenticacion-autorizacion/RF-AUTH-002-estados-cuenta.md
-- Especificación: docs/02-especificaciones-tecnicas/01-autenticacion-autorizacion/ET-AUTH-002-estados-cuenta.md
-- VERSIÓN: 1.1 (2025-11-08) - Agregado 'banned'
DO $$ BEGIN
    CREATE TYPE auth_management.user_status AS ENUM ('active', 'inactive', 'suspended', 'banned', 'pending');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 📚 Documentación: auth_management.auth_provider
-- Requerimiento: docs/01-requerimientos/01-autenticacion-autorizacion/RF-AUTH-003-oauth.md
-- Especificación: docs/02-especificaciones-tecnicas/01-autenticacion-autorizacion/ET-AUTH-003-oauth.md
-- VERSIÓN: 1.1 (2025-11-08) - Migrado de public a auth_management
DO $$ BEGIN
    CREATE TYPE auth_management.auth_provider AS ENUM ('local', 'google', 'facebook', 'apple', 'microsoft', 'github');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 2. ENUMs de Gamificación
-- 📚 Documentación: gamification_system.maya_rank
-- Requerimiento: docs/01-requerimientos/02-gamificacion/RF-GAM-003-rangos-maya.md
-- Especificación: docs/02-especificaciones-tecnicas/02-gamificacion/ET-GAM-003-rangos-maya.md
-- NOTA: Debe estar en prerequisites porque educational_content.modules lo requiere
DO $$ BEGIN
    CREATE TYPE gamification_system.maya_rank AS ENUM (
        'Ajaw',           -- Nivel 1: Señor o gobernante, líder supremo (0-999 XP)
        'Nacom',          -- Nivel 2: Capitán de guerra, comandante militar (1,000-2,999 XP)
        'Ah K''in',       -- Nivel 3: Sacerdote del sol, guía espiritual (3,000-5,999 XP)
        'Halach Uinic',   -- Nivel 4: Hombre verdadero, líder político (6,000-9,999 XP)
        'K''uk''ulkan'    -- Nivel 5: Serpiente emplumada, nivel legendario (10,000+ XP)
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 📚 Documentación: gamification_system.achievement_category
-- Requerimiento: docs/01-requerimientos/02-gamificacion/RF-GAM-001-achievements.md
-- Especificación: docs/02-especificaciones-tecnicas/02-gamificacion/ET-GAM-001-achievements.md
-- VERSIÓN: 1.1 (2025-12-15) - Agregados 'collection' y 'hidden' para alineación con Frontend
DO $$ BEGIN
    CREATE TYPE gamification_system.achievement_category AS ENUM (
        'progress',     -- Logros de progreso general
        'streak',       -- Logros de rachas consecutivas
        'completion',   -- Logros de completar contenido
        'social',       -- Logros sociales (amigos, grupos)
        'special',      -- Logros especiales/eventos
        'mastery',      -- Logros de maestría/dominio
        'exploration',  -- Logros de exploración
        'collection',   -- Logros de colección (V1.1)
        'hidden'        -- Logros ocultos/secretos (V1.1)
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 📚 Documentación: gamification_system.achievement_type
-- Requerimiento: docs/01-requerimientos/02-gamificacion/RF-GAM-001-achievements.md
-- Especificación: docs/02-especificaciones-tecnicas/02-gamificacion/ET-GAM-001-achievements.md
DO $$ BEGIN
    CREATE TYPE gamification_system.achievement_type AS ENUM ('badge', 'milestone', 'special', 'rank_promotion');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 📚 Documentación: gamification_system.comodin_type
-- Requerimiento: docs/01-requerimientos/02-gamificacion/RF-GAM-002-comodines.md
-- Especificación: docs/02-especificaciones-tecnicas/02-gamificacion/ET-GAM-002-comodines.md
DO $$ BEGIN
    CREATE TYPE gamification_system.comodin_type AS ENUM ('pistas', 'vision_lectora', 'segunda_oportunidad');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 📚 Documentación: gamification_system.notification_type
-- REMOVIDO (2025-11-11): Migrado a ddl/schemas/gamification_system/enums/notification_type.sql
-- Razón: Evitar duplicación (Política de Carga Limpia)
-- El ENUM se define en el schema específico con documentación completa

-- 📚 Documentación: gamification_system.notification_priority
-- REMOVIDO (2025-11-11): Migrado a ddl/schemas/gamification_system/enums/notification_priority.sql
-- Razón: Evitar duplicación (Política de Carga Limpia)
-- El ENUM se define en el schema específico con documentación completa

-- 📚 Documentación: gamification_system.shop_item_category
-- Requerimiento: Sistema de tienda virtual con múltiples categorías de items
-- Especificación: Categorías: cosmetics, profile, guild, social, consumable
-- VERSIÓN: 1.0 (2025-11-29)
DO $$ BEGIN
    CREATE TYPE gamification_system.shop_item_category AS ENUM (
        'cosmetics',     -- Cosméticos visuales (avatares, marcos, fondos)
        'profile',       -- Items de perfil (títulos, badges visuales)
        'guild',         -- Items de gremio (banderas, emblemas)
        'social',        -- Items sociales (emojis, stickers)
        'consumable'     -- Consumibles (boosts temporales, etc.)
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 3. ENUMs de Contenido Educativo

-- 📚 Documentación: educational_content.exercise_type (23 mecánicas principales)
-- Requerimiento: docs/01-requerimientos/03-contenido-educativo/RF-EDU-001-mecanicas-ejercicios.md
-- Especificación: docs/02-especificaciones-tecnicas/03-contenido-educativo/ET-EDU-001-mecanicas-ejercicios.md
-- UPDATED 2025-11-17: Sincronizado con seeds reales - Removidas mecánicas no implementadas
DO $$ BEGIN
    CREATE TYPE educational_content.exercise_type AS ENUM (
        -- ====================================================================
        -- MÓDULOS IMPLEMENTADOS (17 mecánicas) - AUTO-EVALUABLES
        -- ====================================================================

        -- Module 1: Comprensión Literal (7 mecánicas) ✅ IMPLEMENTADO
        'completar_espacios', 'crucigrama', 'emparejamiento', 'linea_tiempo', 'mapa_conceptual', 'sopa_letras', 'verdadero_falso',

        -- Module 2: Comprensión Inferencial (5 mecánicas) ✅ IMPLEMENTADO
        'construccion_hipotesis', 'detective_textual', 'prediccion_narrativa', 'puzzle_contexto', 'rueda_inferencias',

        -- Module 3: Comprensión Crítica (5 mecánicas) ✅ IMPLEMENTADO
        'analisis_fuentes', 'debate_digital', 'matriz_perspectivas', 'podcast_argumentativo', 'tribunal_opiniones',

        -- ====================================================================
        -- ⚠️ BACKLOG: FASE 4 (8 mecánicas) - EVALUACIÓN MANUAL/IA REQUERIDA
        -- ====================================================================
        -- Razón: Requieren validación con IA o evaluación manual
        -- Estado: Tipos definidos (compatibilidad futura), seeds en _backlog/
        -- Roadmap: docs/04-fase-backlog/
        -- Fecha: Movido a backlog 2025-11-19 (DB-126)

        -- Module 4: Lectura Digital (9 mecánicas) ⚠️ BACKLOG
        -- Requieren: Validación de fuentes, análisis de imágenes, IA multimodal
        'analisis_memes', 'infografia_interactiva', 'navegacion_hipertextual', 'quiz_tiktok', 'verificador_fake_news',
        -- Module 4: Producción Textual Digital (4 mecánicas adicionales) - AGREGADO 2025-12-18
        'chat_literario', 'email_formal', 'ensayo_argumentativo', 'resena_critica',

        -- Module 5: Producción Lectora (3 mecánicas) ⚠️ BACKLOG
        -- Requieren: Rúbricas de evaluación creativa, revisión humana/IA
        'comic_digital', 'diario_multimedia', 'video_carta',

        -- ====================================================================
        -- ACTUALIZADO 2026-01-04: Agregados 4 tipos auxiliares (sincronización con Backend)
        -- Origen: apps/backend/src/shared/constants/enums.constants.ts (L516-534)
        -- ====================================================================
        'comprension_auditiva',   -- Ejercicio de comprensión auditiva
        'collage_prensa',         -- Ejercicio de collage con recortes de prensa
        'texto_movimiento',       -- Ejercicio de texto en movimiento/animado
        'call_to_action'          -- Ejercicio de llamada a la acción (CTA)
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 📚 Documentación: educational_content.difficulty_level
-- REMOVIDO (2025-11-11): Migrado a ddl/schemas/educational_content/enums/difficulty_level.sql
-- Razón: Evitar duplicación (Política de Carga Limpia)
-- El ENUM se define en el schema específico con documentación completa (8 niveles CEFR)

-- 📚 Documentación: educational_content.module_status
-- VERSIÓN: 1.2 (2025-11-23) - Agregado 'backlog' para módulos fuera de alcance de entrega
-- VERSIÓN: 1.1 (2025-11-08) - Renombrado 'reviewing' a 'under_review'
-- Estados:
--   - draft: Módulo en borrador, no publicado
--   - published: Módulo publicado y disponible para estudiantes
--   - archived: Módulo archivado, no visible
--   - under_review: Módulo en revisión pedagógica
--   - backlog: Módulo diseñado pero fuera de alcance de entrega actual (visible con mensaje "En Construcción")
DO $$ BEGIN
    CREATE TYPE educational_content.module_status AS ENUM ('draft', 'published', 'archived', 'under_review', 'backlog');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 📚 Documentación: content_management.content_status
-- REMOVIDO (2025-11-11): Migrado a ddl/schemas/content_management/enums/content_status.sql
-- Razón: Evitar duplicación (Política de Carga Limpia)
-- El ENUM se define en el schema específico con documentación completa

DO $$ BEGIN
    CREATE TYPE educational_content.cognitive_level AS ENUM ('recordar', 'comprender', 'aplicar', 'analizar', 'evaluar', 'crear');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 📚 Documentación: content_management.media_type
-- Requerimiento: docs/01-requerimientos/07-contenido-media/RF-CNT-001-gestion-media.md
-- Especificación: docs/02-especificaciones-tecnicas/07-contenido-media/ET-CNT-001-gestion-media.md
-- VERSIÓN: 1.2 (2026-01-07) - Agregado 'animation' sincronizado con backend
DO $$ BEGIN
    CREATE TYPE content_management.media_type AS ENUM ('image', 'video', 'audio', 'document', 'interactive', 'animation');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 📚 Documentación: content_management.processing_status
-- Requerimiento: docs/01-requerimientos/07-contenido-media/RF-CNT-001-gestion-media.md
-- Especificación: docs/02-especificaciones-tecnicas/07-contenido-media/ET-CNT-001-gestion-media.md
-- VERSIÓN: 1.2 (2025-11-11) - Sincronizado con Backend/Frontend (DB-093 aplicado)
-- Valores actualizados para procesamiento de media: uploading, processing, ready, error, optimizing
DO $$ BEGIN
    CREATE TYPE content_management.processing_status AS ENUM ('uploading', 'processing', 'ready', 'error', 'optimizing');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 4. ENUMs de Progreso

-- 📚 Documentación: progress_tracking.progress_status
-- REMOVIDO (2025-11-11): Migrado a ddl/schemas/progress_tracking/enums/progress_status.sql
-- Razón: Evitar duplicación (Política de Carga Limpia)
-- El ENUM se define en el schema específico con documentación exhaustiva (112 líneas)

-- 📚 Documentación: progress_tracking.attempt_status
-- Requerimiento: docs/01-requerimientos/04-progreso-seguimiento/RF-PRG-001-estados-progreso.md
-- Especificación: docs/02-especificaciones-tecnicas/04-progreso-seguimiento/ET-PRG-001-estados-progreso.md
DO $$ BEGIN
    CREATE TYPE progress_tracking.attempt_status AS ENUM ('in_progress', 'submitted', 'graded', 'reviewed');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 5. ENUMs de Social

-- 📚 Documentación: social_features.classroom_role
-- Requerimiento: docs/01-requerimientos/05-caracteristicas-sociales/RF-SOC-001-aulas-virtuales.md
-- Especificación: docs/02-especificaciones-tecnicas/05-caracteristicas-sociales/ET-SOC-001-aulas-virtuales.md
DO $$ BEGIN
    CREATE TYPE social_features.classroom_role AS ENUM ('teacher', 'student', 'assistant');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- VERSIÓN: 1.1 (2026-01-07) - Alineado con backend (owner, admin, member)
DO $$ BEGIN
    CREATE TYPE social_features.team_role AS ENUM ('owner', 'admin', 'member');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- VERSIÓN: 1.1 (2026-01-07) - Agregado 'rejected' sincronizado con backend
DO $$ BEGIN
    CREATE TYPE social_features.friendship_status AS ENUM ('pending', 'accepted', 'rejected', 'blocked');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 6. ENUMs de Configuración

-- 📚 Documentación: system_configuration.setting_type
-- VERSIÓN: 1.1 (2025-11-08) - Migrado de public a system_configuration
DO $$ BEGIN
    CREATE TYPE system_configuration.setting_type AS ENUM ('string', 'number', 'boolean', 'json', 'array');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 📚 Documentación: audit_logging.log_level
-- Requerimiento: docs/01-requerimientos/08-auditoria-configuracion/RF-AUD-001-sistema-auditoria.md
-- Especificación: docs/02-especificaciones-tecnicas/08-auditoria-configuracion/ET-AUD-001-sistema-auditoria.md
DO $$ BEGIN
    CREATE TYPE audit_logging.log_level AS ENUM ('debug', 'info', 'warning', 'error', 'critical');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 7. ENUMs de Auditoría

-- 📚 Documentación: audit_logging.audit_action
-- Requerimiento: docs/01-requerimientos/08-auditoria-configuracion/RF-AUD-001-sistema-auditoria.md
-- Especificación: docs/02-especificaciones-tecnicas/08-auditoria-configuracion/ET-AUD-001-sistema-auditoria.md
DO $$ BEGIN
    CREATE TYPE audit_logging.audit_action AS ENUM ('create', 'update', 'delete', 'login', 'logout', 'access', 'export', 'import');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE audit_logging.alert_severity AS ENUM ('info', 'warning', 'error', 'critical');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE audit_logging.alert_status AS ENUM ('active', 'acknowledged', 'resolved', 'ignored');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- ============================================================================
-- PARTE 2: FUNCIONES UTILITARIAS DEL SCHEMA gamilit
-- ============================================================================
-- CONSOLIDACIÓN 2026-01-17 (TASK-2026-01-17-001):
-- Las funciones fueron movidas a archivos individuales en schemas/gamilit/functions/
-- Se cargan en FASE 2 de create-database.sh
--
-- Funciones consolidadas:
--   - gamilit.now_mexico()                          → 08-now_mexico.sql
--   - gamilit.update_updated_at_column()            → 15-update_updated_at_column.sql
--   - gamilit.get_current_user_role()               → 03-get_current_user_role.sql
--   - gamilit.get_current_user_id()                 → 02-get_current_user_id.sql
--   - gamilit.get_current_tenant_id()               → 09-get_current_tenant_id.sql
--   - gamilit.is_admin()                            → 05-is_admin.sql
--   - gamilit.audit_profile_changes()               → 01-audit_profile_changes.sql
--   - gamilit.initialize_user_stats()               → 04-initialize_user_stats.sql
--   - gamilit.update_user_stats_on_exercise_complete() → 14-update_user_stats_on_exercise_complete.sql
--   - gamilit.update_classroom_member_count()       → 10-update_classroom_member_count.sql
--
-- Razón: Evitar duplicación y mantener funciones en ubicación canónica
-- Referencia: Política de Carga Limpia, Auditoría DDL TASK-2026-01-17-001
-- ============================================================================

-- ============================================================================
-- PARTE 3: FUNCIONES DEL SCHEMA gamification_system
-- ============================================================================

-- REMOVIDO (2026-01-07): Funciones update_*_updated_at consolidadas
-- Razon: Reemplazadas por gamilit.update_updated_at_column() (funcion generica)
-- Ver: PLAN-CONSOLIDACION-BD-2026-01-07.md (FASE 1)
-- Archivos deprecated:
--   - gamification_system/functions/_deprecated/06-update_missions_updated_at.sql
--   - gamification_system/functions/_deprecated/07-update_notifications_updated_at.sql
-- Limpieza en: migrations/2026-01-07-FASE4-cleanup-deprecated.sql

-- ============================================================================
-- COMENTARIOS EN TIPOS
-- ============================================================================

-- 1. Autenticación
COMMENT ON TYPE auth_management.gamilit_role IS 'Roles de usuario en la plataforma (v1.0)';
COMMENT ON TYPE auth_management.user_status IS 'Estados de cuenta de usuario (v1.1 - 2025-11-08 - agregado banned)';
COMMENT ON TYPE auth_management.auth_provider IS 'Proveedores de autenticación OAuth2/OIDC (v1.1 - 2025-11-08 - migrado de public)';

-- 2. Gamificación
-- COMMENT for maya_rank is in gamification_system/enums/maya_rank.sql
COMMENT ON TYPE gamification_system.achievement_category IS 'Categorías de logros para gamificación (v1.0)';
COMMENT ON TYPE gamification_system.achievement_type IS 'Tipos de logros disponibles (badge, milestone, special, rank_promotion) (v1.0)';
COMMENT ON TYPE gamification_system.comodin_type IS 'Tipos de comodines/power-ups (pistas, vision_lectora, segunda_oportunidad) (v1.0)';
COMMENT ON TYPE gamification_system.shop_item_category IS 'Categorías de items de la tienda: cosmetics, profile, guild, social, consumable (v1.0 - 2025-11-29)';
-- NOTA (2025-11-11): Los siguientes comentarios están en los archivos de ENUM correspondientes
-- notification_type se crea en FASE 7: gamification_system/enums/notification_type.sql
-- notification_priority se crea en FASE 7: gamification_system/enums/notification_priority.sql
-- COMMENT ON TYPE gamification_system.notification_type IS 'Tipos de notificaciones del sistema (v2.0 - 2025-11-08 - migrado de public)';
-- COMMENT ON TYPE gamification_system.notification_priority IS 'Niveles de prioridad de notificaciones (v1.1 - 2025-11-08 - migrado de public)';

-- 3. Contenido Educativo
COMMENT ON TYPE educational_content.exercise_type IS '28 mecánicas de ejercicios interactivos Gamilit (17 implementadas + 8 backlog + 3 auxiliares) (v2.2 - 2026-01-04 - agregados comprension_auditiva, collage_prensa, texto_movimiento)';
-- NOTA (2025-11-11): El siguiente comentario está en el archivo de ENUM correspondiente
-- difficulty_level se crea en FASE 6: educational_content/enums/difficulty_level.sql
-- COMMENT ON TYPE educational_content.difficulty_level IS 'Niveles de dificultad CEFR - 8 niveles A1→C2+ (v2.0 - 2025-11-11 - migrado a estándar CEFR)';
COMMENT ON TYPE educational_content.module_status IS 'Estados del ciclo de vida de módulos educativos (v1.1 - 2025-11-08)';
COMMENT ON TYPE educational_content.cognitive_level IS 'Niveles cognitivos de Bloom para objetivos de aprendizaje (v1.0)';

-- 4. Gestión de Contenido
-- NOTA (2025-11-11): Los comentarios de content_management.* están en sus archivos de enum específicos:
-- - content_status: ddl/schemas/content_management/enums/content_status.sql
-- - media_type: ddl/schemas/content_management/enums/media_type.sql
-- - processing_status: ddl/schemas/content_management/enums/processing_status.sql

-- 5. Progreso y Tracking
-- NOTA (2025-11-11): Los comentarios de progress_tracking.* están en sus archivos de enum específicos:
-- - progress_status: ddl/schemas/progress_tracking/enums/progress_status.sql
-- - attempt_status: ddl/schemas/progress_tracking/enums/attempt_status.sql

-- 6. Características Sociales
COMMENT ON TYPE social_features.classroom_role IS 'Roles dentro de un aula virtual (teacher, student, assistant) (v1.0)';
COMMENT ON TYPE social_features.team_role IS 'Roles dentro de un equipo/guild (leader, member, coordinator) (v1.0)';
COMMENT ON TYPE social_features.friendship_status IS 'Estados de solicitudes de amistad (pending, accepted, blocked) (v1.0)';

-- 7. Configuración del Sistema
COMMENT ON TYPE system_configuration.setting_type IS 'Tipos de datos para configuraciones del sistema (v1.1 - 2025-11-08 - migrado de public)';

-- 8. Auditoría
COMMENT ON TYPE audit_logging.log_level IS 'Niveles de severidad de logs del sistema (v1.0)';
COMMENT ON TYPE audit_logging.audit_action IS 'Tipos de acciones auditables en el sistema (v1.0)';
COMMENT ON TYPE audit_logging.alert_severity IS 'Niveles de severidad de alertas (v1.0)';
COMMENT ON TYPE audit_logging.alert_status IS 'Estados de alertas del sistema (v1.0)';

-- ============================================================================
-- FUNCIONES CRÍTICAS (Requeridas antes de crear tablas)
-- ============================================================================

-- 📚 Documentación: gamilit.now_mexico()
-- Descripción: Retorna timestamp actual en zona horaria de México
-- Requerido por: TODAS las tablas que usan DEFAULT timestamps
-- NOTA: Esta función DEBE cargarse antes de cualquier CREATE TABLE
CREATE OR REPLACE FUNCTION gamilit.now_mexico()
 RETURNS timestamp with time zone
 LANGUAGE plpgsql
 IMMUTABLE
AS $function$
BEGIN
    RETURN NOW() AT TIME ZONE 'America/Mexico_City';
END;
$function$;

COMMENT ON FUNCTION gamilit.now_mexico() IS 'Retorna timestamp actual en zona horaria de México (America/Mexico_City)';
