-- =====================================================
-- Seeds: Reglas basicas de moderacion automatica
-- Schema: content_management
-- Descripcion: Reglas de ejemplo para el sistema de moderacion
-- Relacionado: EXT-002 (Admin Extendido - Moderacion Automatica)
-- Fecha: 2025-11-11
-- Updated: 2026-02-20 (Fix B2: dynamic profile lookup, removed auth.users insert)
-- =====================================================

-- Usar profile de admin como created_by (dynamic lookup)
-- Si no hay admin profile, se usa NULL (created_by es nullable)

DO $$
DECLARE
    v_admin_profile_id UUID;
BEGIN
    -- Lookup admin profile dynamically
    SELECT p.id INTO v_admin_profile_id
    FROM auth.users u
    JOIN auth_management.profiles p ON p.user_id = u.id
    WHERE u.email = 'admin@gamilit.com'
    LIMIT 1;

    -- Fallback: any super_admin profile
    IF v_admin_profile_id IS NULL THEN
        SELECT id INTO v_admin_profile_id
        FROM auth_management.profiles
        WHERE role = 'super_admin'
        ORDER BY created_at
        LIMIT 1;
    END IF;

    IF v_admin_profile_id IS NULL THEN
        RAISE NOTICE 'No admin profile found. Inserting moderation rules with created_by = NULL.';
    END IF;

    -- Insertar reglas basicas de moderacion
    INSERT INTO content_management.moderation_rules
    (rule_name, rule_type, target_entity, rule_config, action, severity, auto_execute, require_review, is_active, priority, created_by) VALUES

    -- ===== REGLAS CRITICAS (auto_execute = true) =====

    -- Palabras prohibidas criticas (SPAM, phishing, malware)
    ('Palabras Prohibidas - Critico', 'keyword', 'content',
     '{
       "keywords": ["spam", "phishing", "scam", "malware", "virus", "hack"],
       "case_sensitive": false,
       "match_whole_word": true
     }'::jsonb,
     'block', 'critical', true, true, true, 100,
     v_admin_profile_id),

    -- Contenido ofensivo extremo
    ('Lenguaje Ofensivo Extremo', 'keyword', 'content',
     '{
       "keywords": ["palabra1", "palabra2", "palabra3"],
       "case_sensitive": false,
       "match_whole_word": true
     }'::jsonb,
     'block', 'critical', true, true, true, 95,
     v_admin_profile_id),

    -- ===== REGLAS DE ALTA PRIORIDAD =====

    -- Deteccion de numeros de telefono
    ('Deteccion Telefonos', 'pattern', 'content',
     '{
       "regex": "\\b\\d{3}[-.]?\\d{3}[-.]?\\d{4}\\b",
       "description": "Detecta numeros de telefono formato XXX-XXX-XXXX",
       "case_sensitive": false
     }'::jsonb,
     'flag', 'high', false, true, true, 80,
     v_admin_profile_id),

    -- Deteccion de emails (posible spam)
    ('Deteccion Emails', 'pattern', 'content',
     '{
       "regex": "\\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Z|a-z]{2,}\\b",
       "description": "Detecta direcciones de email",
       "case_sensitive": false
     }'::jsonb,
     'flag', 'medium', false, true, true, 70,
     v_admin_profile_id),

    -- Deteccion de URLs sospechosas
    ('URLs Externas', 'pattern', 'content',
     '{
       "regex": "https?://[^\\s]+",
       "description": "Detecta URLs en el contenido",
       "case_sensitive": false
     }'::jsonb,
     'flag', 'medium', false, true, true, 60,
     v_admin_profile_id),

    -- ===== REGLAS DE CALIDAD =====

    -- Contenido excesivamente corto
    ('Contenido Muy Corto', 'length', 'content',
     '{
       "min_length": 10,
       "max_length": 999999,
       "action_on": "below"
     }'::jsonb,
     'flag', 'low', false, false, true, 20,
     v_admin_profile_id),

    -- Contenido excesivamente largo (posible spam)
    ('Contenido Muy Largo', 'length', 'content',
     '{
       "min_length": 0,
       "max_length": 10000,
       "action_on": "exceed"
     }'::jsonb,
     'flag', 'medium', false, true, true, 30,
     v_admin_profile_id),

    -- ===== REGLAS PARA COMENTARIOS =====

    -- Palabras prohibidas en comentarios
    ('Palabras Prohibidas - Comentarios', 'keyword', 'comment',
     '{
       "keywords": ["spam", "scam", "phishing"],
       "case_sensitive": false,
       "match_whole_word": true
     }'::jsonb,
     'flag', 'high', false, true, true, 85,
     v_admin_profile_id),

    -- ===== REGLAS PARA MENSAJES =====

    -- Deteccion de spam en mensajes privados
    ('Spam en Mensajes', 'keyword', 'message',
     '{
       "keywords": ["oferta", "promocion", "descuento", "gratis", "premio"],
       "case_sensitive": false,
       "match_whole_word": false
     }'::jsonb,
     'flag', 'medium', false, true, true, 50,
     v_admin_profile_id)

    ON CONFLICT DO NOTHING;

    RAISE NOTICE 'Seed moderation_rules: 9 reglas insertadas (created_by: %)', COALESCE(v_admin_profile_id::text, 'NULL');
END $$;
