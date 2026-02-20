-- =====================================================================
-- Archivo: 04-teams.sql
-- Schema: social_features
-- Descripcion: Seeds de equipos colaborativos y sus membresias
-- Dependencias: 02-classrooms.sql, 03-classroom-members.sql
-- Autor: SA-SEEDS-SOCIAL
-- Fecha: 2025-11-02
-- Version: 1.2 (NULL guards for demo students — graceful skip in prod)
-- =====================================================================
-- DDL columns for teams: id, classroom_id, tenant_id, name, description,
--   motto, color_primary, color_secondary, avatar_url, banner_url, badges,
--   creator_id, leader_id, team_code, max_members, current_members_count,
--   is_public, allow_join_requests, require_approval, total_xp, total_ml_coins,
--   modules_completed, achievements_earned, is_active, is_verified, founded_at,
--   last_activity_at, metadata, created_at, updated_at
-- =====================================================================

SET search_path TO social_features, auth, public;

-- =====================================================================
-- TEAMS: Equipos colaborativos dentro de aulas
-- =====================================================================

DO $$
DECLARE
    classroom_2a UUID;
    classroom_3b UUID;
    classroom_1a UUID;
    classroom_2st UUID;
    student1_id UUID;
    student2_id UUID;
    student3_id UUID;
    v_tenant_id UUID;
    team_cientificos UUID;
    team_exploradores UUID;
    team_pioneros UUID;
    team_innovadores UUID;
    team_count INTEGER;
    member_count INTEGER;
BEGIN
    -- =====================================================================
    -- Obtener classroom IDs
    -- =====================================================================
    SELECT id INTO classroom_2a
    FROM social_features.classrooms
    WHERE code = '2A-LECT-2025';

    SELECT id INTO classroom_3b
    FROM social_features.classrooms
    WHERE code = '3B-DIGI-2025';

    SELECT id INTO classroom_1a
    FROM social_features.classrooms
    WHERE code = '1A-INTRO-2025';

    SELECT id INTO classroom_2st
    FROM social_features.classrooms
    WHERE code = '2ST-LITC-2025';

    -- =====================================================================
    -- Obtener student IDs (profile IDs from auth_management.profiles)
    -- =====================================================================
    SELECT p.id INTO student1_id
    FROM auth.users u
    JOIN auth_management.profiles p ON p.user_id = u.id
    WHERE u.email = 'estudiante1@demo.glit.edu.mx';

    SELECT p.id INTO student2_id
    FROM auth.users u
    JOIN auth_management.profiles p ON p.user_id = u.id
    WHERE u.email = 'estudiante2@demo.glit.edu.mx';

    SELECT p.id INTO student3_id
    FROM auth.users u
    JOIN auth_management.profiles p ON p.user_id = u.id
    WHERE u.email = 'estudiante3@demo.glit.edu.mx';

    -- Get a tenant_id from the first classroom
    IF classroom_2a IS NOT NULL THEN
        SELECT tenant_id INTO v_tenant_id FROM social_features.classrooms WHERE id = classroom_2a;
    ELSE
        SELECT id INTO v_tenant_id FROM auth_management.tenants LIMIT 1;
    END IF;

    -- Validar que existan los recursos necesarios
    IF classroom_2a IS NULL THEN
        RAISE NOTICE 'No se encontro el aula 2A-LECT-2025. Saltando seeds de teams.';
        RETURN;
    END IF;

    IF student1_id IS NULL AND student2_id IS NULL AND student3_id IS NULL THEN
        RAISE NOTICE 'No se encontraron estudiantes demo. Saltando seeds de teams.';
        RETURN;
    END IF;

    -- =====================================================================
    -- EQUIPO 1: Los Cientificos (Aula 2 A) — requiere student1
    -- =====================================================================
    IF student1_id IS NOT NULL THEN
        INSERT INTO social_features.teams (
            classroom_id, tenant_id, name, team_code, description,
            max_members, current_members_count,
            is_active, creator_id,
            metadata, created_at, updated_at
        ) VALUES
        (
            classroom_2a,
            v_tenant_id,
            'Los Cientificos',
            'TEAM-CIENT-2A',
            'Equipo enfocado en explorar biografias de cientificos famosos.',
            5,
            0,
            true,
            student1_id,
            '{
                "color": "#3498db",
                "icon": "flask",
                "motto": "Explorando la ciencia juntos",
                "current_project": "Biografias de Mujeres Cientificas"
            }'::jsonb,
            NOW(),
            NOW()
        )
        RETURNING id INTO team_cientificos;
    END IF;

    -- =====================================================================
    -- EQUIPO 2: Exploradores Digitales (Aula 3 B) — requiere student2
    -- =====================================================================
    IF student2_id IS NOT NULL AND classroom_3b IS NOT NULL THEN
        INSERT INTO social_features.teams (
            classroom_id, tenant_id, name, team_code, description,
            max_members, current_members_count,
            is_active, creator_id,
            metadata, created_at, updated_at
        ) VALUES
        (
            classroom_3b,
            v_tenant_id,
            'Exploradores Digitales',
            'TEAM-EXPLO-3B',
            'Equipo dedicado a dominar la lectura digital y fact-checking.',
            5,
            0,
            true,
            student2_id,
            '{
                "color": "#2ecc71",
                "icon": "compass",
                "motto": "Navegando el mundo digital con criterio",
                "current_project": "Cazadores de Fake News"
            }'::jsonb,
            NOW(),
            NOW()
        )
        RETURNING id INTO team_exploradores;
    END IF;

    -- =====================================================================
    -- EQUIPO 3: Pioneros Tecnicos (Aula 1 A) — requiere student3
    -- =====================================================================
    IF student3_id IS NOT NULL AND classroom_1a IS NOT NULL THEN
        INSERT INTO social_features.teams (
            classroom_id, tenant_id, name, team_code, description,
            max_members, current_members_count,
            is_active, creator_id,
            metadata, created_at, updated_at
        ) VALUES
        (
            classroom_1a,
            v_tenant_id,
            'Pioneros Tecnicos',
            'TEAM-PION-1A',
            'Equipo enfocado en comprension de manuales tecnicos.',
            6,
            0,
            true,
            student3_id,
            '{
                "color": "#e74c3c",
                "icon": "wrench",
                "motto": "Leyendo el futuro tecnico"
            }'::jsonb,
            NOW(),
            NOW()
        )
        RETURNING id INTO team_pioneros;
    END IF;

    -- =====================================================================
    -- EQUIPO 4: Innovadores STEAM (Aula 2 STEAM) — requiere student1
    -- =====================================================================
    IF student1_id IS NOT NULL AND classroom_2st IS NOT NULL THEN
        INSERT INTO social_features.teams (
            classroom_id, tenant_id, name, team_code, description,
            max_members, current_members_count,
            is_active, creator_id,
            metadata, created_at, updated_at
        ) VALUES
        (
            classroom_2st,
            v_tenant_id,
            'Innovadores STEAM',
            'TEAM-INNOV-2ST',
            'Equipo bilingue enfocado en integrar literatura cientifica con proyectos STEAM.',
            4,
            0,
            true,
            student1_id,
            '{
                "color": "#9b59b6",
                "icon": "lightbulb",
                "motto": "Innovation through knowledge",
                "bilingual": true
            }'::jsonb,
            NOW(),
            NOW()
        )
        RETURNING id INTO team_innovadores;
    END IF;

    -- =====================================================================
    -- MEMBRESIAS DE EQUIPOS (guarded per student/team)
    -- =====================================================================

    -- Equipo 1: Los Cientificos
    IF team_cientificos IS NOT NULL AND student1_id IS NOT NULL THEN
        INSERT INTO social_features.team_members (team_id, user_id, role, joined_at, is_active, metadata, created_at, updated_at)
        VALUES (team_cientificos, student1_id, 'owner', NOW(), true,
            '{"responsibilities": ["Coordinar reuniones"], "contribution_score": 95}'::jsonb, NOW(), NOW())
        ON CONFLICT (team_id, user_id) DO UPDATE SET role = EXCLUDED.role, metadata = EXCLUDED.metadata, updated_at = NOW();
    END IF;
    IF team_cientificos IS NOT NULL AND student3_id IS NOT NULL THEN
        INSERT INTO social_features.team_members (team_id, user_id, role, joined_at, is_active, metadata, created_at, updated_at)
        VALUES (team_cientificos, student3_id, 'member', NOW(), true,
            '{"responsibilities": ["Investigar biografias"], "contribution_score": 88}'::jsonb, NOW(), NOW())
        ON CONFLICT (team_id, user_id) DO UPDATE SET role = EXCLUDED.role, metadata = EXCLUDED.metadata, updated_at = NOW();
    END IF;

    -- Equipo 2: Exploradores Digitales
    IF team_exploradores IS NOT NULL AND student2_id IS NOT NULL THEN
        INSERT INTO social_features.team_members (team_id, user_id, role, joined_at, is_active, metadata, created_at, updated_at)
        VALUES (team_exploradores, student2_id, 'owner', NOW(), true,
            '{"responsibilities": ["Coordinar verificaciones"], "contribution_score": 92}'::jsonb, NOW(), NOW())
        ON CONFLICT (team_id, user_id) DO UPDATE SET role = EXCLUDED.role, metadata = EXCLUDED.metadata, updated_at = NOW();
    END IF;
    IF team_exploradores IS NOT NULL AND student1_id IS NOT NULL THEN
        INSERT INTO social_features.team_members (team_id, user_id, role, joined_at, is_active, metadata, created_at, updated_at)
        VALUES (team_exploradores, student1_id, 'member', NOW(), true,
            '{"responsibilities": ["Verificar noticias"], "contribution_score": 90}'::jsonb, NOW(), NOW())
        ON CONFLICT (team_id, user_id) DO UPDATE SET role = EXCLUDED.role, metadata = EXCLUDED.metadata, updated_at = NOW();
    END IF;

    -- Equipo 3: Pioneros Tecnicos
    IF team_pioneros IS NOT NULL AND student3_id IS NOT NULL THEN
        INSERT INTO social_features.team_members (team_id, user_id, role, joined_at, is_active, metadata, created_at, updated_at)
        VALUES (team_pioneros, student3_id, 'owner', NOW(), true,
            '{"responsibilities": ["Coordinar proyectos tecnicos"], "contribution_score": 85}'::jsonb, NOW(), NOW())
        ON CONFLICT (team_id, user_id) DO UPDATE SET role = EXCLUDED.role, metadata = EXCLUDED.metadata, updated_at = NOW();
    END IF;

    -- Equipo 4: Innovadores STEAM
    IF team_innovadores IS NOT NULL AND student1_id IS NOT NULL THEN
        INSERT INTO social_features.team_members (team_id, user_id, role, joined_at, is_active, metadata, created_at, updated_at)
        VALUES (team_innovadores, student1_id, 'admin', NOW(), true,
            '{"responsibilities": ["Traduccion bilingue"], "contribution_score": 94}'::jsonb, NOW(), NOW())
        ON CONFLICT (team_id, user_id) DO UPDATE SET role = EXCLUDED.role, metadata = EXCLUDED.metadata, updated_at = NOW();
    END IF;
    IF team_innovadores IS NOT NULL AND student2_id IS NOT NULL THEN
        INSERT INTO social_features.team_members (team_id, user_id, role, joined_at, is_active, metadata, created_at, updated_at)
        VALUES (team_innovadores, student2_id, 'member', NOW(), true,
            '{"responsibilities": ["Investigacion cientifica"], "contribution_score": 89}'::jsonb, NOW(), NOW())
        ON CONFLICT (team_id, user_id) DO UPDATE SET role = EXCLUDED.role, metadata = EXCLUDED.metadata, updated_at = NOW();
    END IF;

    -- =====================================================================
    -- Actualizar member counts en teams
    -- =====================================================================
    UPDATE social_features.teams
    SET current_members_count = (
        SELECT COUNT(*)
        FROM social_features.team_members
        WHERE team_members.team_id = teams.id
          AND team_members.is_active = true
    )
    WHERE id IN (
        team_cientificos, team_exploradores,
        team_pioneros, team_innovadores
    )
    AND id IS NOT NULL;

    -- =====================================================================
    -- Verificacion de insercion
    -- =====================================================================
    SELECT COUNT(*) INTO team_count
    FROM social_features.teams
    WHERE is_active = true;

    SELECT COUNT(*) INTO member_count
    FROM social_features.team_members
    WHERE is_active = true;

    RAISE NOTICE '================================================';
    RAISE NOTICE 'TEAMS SEEDS - RESUMEN DE INSERCION';
    RAISE NOTICE '================================================';
    RAISE NOTICE 'Total de equipos creados: %', team_count;
    RAISE NOTICE 'Total de membresias activas: %', member_count;
    RAISE NOTICE '================================================';

END $$;
