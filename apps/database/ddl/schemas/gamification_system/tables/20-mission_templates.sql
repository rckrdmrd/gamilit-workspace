--
-- PostgreSQL Table: mission_templates
-- Schema: gamification_system
-- Description: Templates for generating missions with predefined configurations
--

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';
SET default_table_access_method = heap;

--
-- Name: mission_templates; Type: TABLE; Schema: gamification_system; Owner: postgres
--

CREATE TABLE gamification_system.mission_templates (
    id uuid DEFAULT gen_random_uuid() NOT NULL,

    -- Identification
    name character varying(100) NOT NULL,
    description text NOT NULL,

    -- Type and frequency
    type character varying(20) NOT NULL,
    category character varying(50),

    -- Objective configuration
    target_type character varying(50) NOT NULL,
    target_value integer NOT NULL,

    -- Rewards
    xp_reward integer DEFAULT 0,
    ml_coins_reward integer DEFAULT 0,
    badge_id uuid,

    -- Configuration
    difficulty character varying(20) DEFAULT 'normal'::character varying,
    is_active boolean DEFAULT true,
    priority integer DEFAULT 0,

    -- Restrictions
    min_level integer DEFAULT 1,
    max_level integer,
    required_module integer,

    -- Metadata
    icon character varying(50),
    color character varying(20),
    metadata jsonb DEFAULT '{}'::jsonb,

    -- Audit
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now(),
    created_by uuid,

    CONSTRAINT mission_templates_pkey PRIMARY KEY (id),
    CONSTRAINT mission_templates_type_check CHECK ((type = ANY (ARRAY['daily'::text, 'weekly'::text, 'special'::text, 'classroom'::text]))),
    CONSTRAINT mission_templates_difficulty_check CHECK ((difficulty = ANY (ARRAY['easy'::text, 'normal'::text, 'hard'::text, 'epic'::text]))),
    CONSTRAINT mission_templates_target_value_check CHECK (target_value > 0),
    CONSTRAINT mission_templates_xp_reward_check CHECK (xp_reward >= 0),
    CONSTRAINT mission_templates_ml_coins_reward_check CHECK (ml_coins_reward >= 0),
    CONSTRAINT mission_templates_min_level_check CHECK (min_level >= 1),
    CONSTRAINT mission_templates_max_level_check CHECK ((max_level IS NULL) OR (max_level >= min_level))
);

ALTER TABLE gamification_system.mission_templates OWNER TO gamilit_user;

--
-- Name: TABLE mission_templates; Type: COMMENT; Schema: gamification_system; Owner: postgres
--

COMMENT ON TABLE gamification_system.mission_templates IS 'Templates for generating missions with predefined configurations and rewards';

--
-- Name: COLUMN mission_templates.name; Type: COMMENT; Schema: gamification_system; Owner: postgres
--

COMMENT ON COLUMN gamification_system.mission_templates.name IS 'Template display name';

--
-- Name: COLUMN mission_templates.type; Type: COMMENT; Schema: gamification_system; Owner: postgres
--

COMMENT ON COLUMN gamification_system.mission_templates.type IS 'Mission type: daily, weekly, special, classroom';

--
-- Name: COLUMN mission_templates.category; Type: COMMENT; Schema: gamification_system; Owner: postgres
--

COMMENT ON COLUMN gamification_system.mission_templates.category IS 'Mission category for grouping (exercise, study_time, social, streak, etc.)';

--
-- Name: COLUMN mission_templates.target_type; Type: COMMENT; Schema: gamification_system; Owner: postgres
--

COMMENT ON COLUMN gamification_system.mission_templates.target_type IS 'Type of objective to track (complete_exercises, study_minutes, earn_xp, etc.)';

--
-- Name: COLUMN mission_templates.target_value; Type: COMMENT; Schema: gamification_system; Owner: postgres
--

COMMENT ON COLUMN gamification_system.mission_templates.target_value IS 'Required value to complete the objective';

--
-- Name: COLUMN mission_templates.difficulty; Type: COMMENT; Schema: gamification_system; Owner: postgres
--

COMMENT ON COLUMN gamification_system.mission_templates.difficulty IS 'Difficulty level: easy, normal, hard, epic';

--
-- Name: COLUMN mission_templates.is_active; Type: COMMENT; Schema: gamification_system; Owner: postgres
--

COMMENT ON COLUMN gamification_system.mission_templates.is_active IS 'Whether template is active and can be used to generate missions';

--
-- Name: COLUMN mission_templates.priority; Type: COMMENT; Schema: gamification_system; Owner: postgres
--

COMMENT ON COLUMN gamification_system.mission_templates.priority IS 'Priority for selection (higher = more likely to be selected)';

--
-- Name: COLUMN mission_templates.metadata; Type: COMMENT; Schema: gamification_system; Owner: postgres
--

COMMENT ON COLUMN gamification_system.mission_templates.metadata IS 'Additional JSON configuration data';

--
-- Indexes
--

CREATE INDEX idx_mission_templates_type ON gamification_system.mission_templates USING btree (type);
CREATE INDEX idx_mission_templates_active ON gamification_system.mission_templates USING btree (is_active);
CREATE INDEX idx_mission_templates_category ON gamification_system.mission_templates USING btree (category);
CREATE INDEX idx_mission_templates_difficulty ON gamification_system.mission_templates USING btree (difficulty);

--
-- Foreign Keys
--

-- P1-001: Corregido FK - auth_management.users no existe, usar profiles
-- Fecha: 2025-12-14 (Auditoría AUDIT-DB-001)
ALTER TABLE ONLY gamification_system.mission_templates
    ADD CONSTRAINT mission_templates_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth_management.profiles(id) ON DELETE SET NULL;

-- Note: badge_id FK commented out until badges table is created
-- ALTER TABLE ONLY gamification_system.mission_templates
--     ADD CONSTRAINT mission_templates_badge_id_fkey FOREIGN KEY (badge_id) REFERENCES gamification_system.badges(id) ON DELETE SET NULL;

--
-- ACL (Access Control List)
--

GRANT ALL ON TABLE gamification_system.mission_templates TO gamilit_user;

--
-- PostgreSQL table creation complete
--
