-- =====================================================
-- Table: gamification_system.comodines_inventory
-- Description: Inventario de comodines (power-ups) por usuario
-- Dependencies: auth_management.profiles
-- =====================================================

DROP TABLE IF EXISTS gamification_system.comodines_inventory CASCADE;

CREATE TABLE gamification_system.comodines_inventory (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    pistas_available integer DEFAULT 0,
    vision_lectora_available integer DEFAULT 0,
    segunda_oportunidad_available integer DEFAULT 0,
    pistas_purchased_total integer DEFAULT 0,
    vision_lectora_purchased_total integer DEFAULT 0,
    segunda_oportunidad_purchased_total integer DEFAULT 0,
    pistas_used_total integer DEFAULT 0,
    vision_lectora_used_total integer DEFAULT 0,
    segunda_oportunidad_used_total integer DEFAULT 0,
    pistas_cost integer DEFAULT 15,
    vision_lectora_cost integer DEFAULT 25,
    segunda_oportunidad_cost integer DEFAULT 40,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamptz DEFAULT gamilit.now_mexico(),
    updated_at timestamptz DEFAULT gamilit.now_mexico(),

    -- Primary Key
    CONSTRAINT comodines_inventory_pkey PRIMARY KEY (id),

    -- Unique Constraints
    CONSTRAINT comodines_inventory_user_id_key UNIQUE (user_id),

    -- Check Constraints
    CONSTRAINT comodines_inventory_pistas_available_check CHECK ((pistas_available >= 0)),
    CONSTRAINT comodines_inventory_segunda_oportunidad_available_check CHECK ((segunda_oportunidad_available >= 0)),
    CONSTRAINT comodines_inventory_vision_lectora_available_check CHECK ((vision_lectora_available >= 0)),
    CONSTRAINT comodines_inventory_pistas_purchased_total_check CHECK ((pistas_purchased_total >= 0)),
    CONSTRAINT comodines_inventory_vision_lectora_purchased_total_check CHECK ((vision_lectora_purchased_total >= 0)),
    CONSTRAINT comodines_inventory_segunda_oportunidad_purchased_total_check CHECK ((segunda_oportunidad_purchased_total >= 0)),
    CONSTRAINT comodines_inventory_pistas_used_total_check CHECK ((pistas_used_total >= 0)),
    CONSTRAINT comodines_inventory_vision_lectora_used_total_check CHECK ((vision_lectora_used_total >= 0)),
    CONSTRAINT comodines_inventory_segunda_oportunidad_used_total_check CHECK ((segunda_oportunidad_used_total >= 0))
);

-- Foreign Keys
ALTER TABLE ONLY gamification_system.comodines_inventory
    ADD CONSTRAINT comodines_inventory_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth_management.profiles(id) ON DELETE CASCADE;

-- Triggers
-- NOTE: Trigger trg_comodines_inventory_updated_at movido a archivo separado
-- Ver: gamification_system/triggers/16-trg_comodines_inventory_updated_at.sql

-- Comments
COMMENT ON TABLE gamification_system.comodines_inventory IS 'Inventario de comodines (power-ups) por usuario';
COMMENT ON COLUMN gamification_system.comodines_inventory.id IS 'Identificador único del inventario';
COMMENT ON COLUMN gamification_system.comodines_inventory.user_id IS 'ID del usuario propietario del inventario';
COMMENT ON COLUMN gamification_system.comodines_inventory.pistas_available IS 'Pistas Contextuales disponibles (15 ML Coins)';
COMMENT ON COLUMN gamification_system.comodines_inventory.vision_lectora_available IS 'Visión Lectora disponibles (25 ML Coins)';
COMMENT ON COLUMN gamification_system.comodines_inventory.segunda_oportunidad_available IS 'Segunda Oportunidad disponibles (40 ML Coins)';
COMMENT ON COLUMN gamification_system.comodines_inventory.pistas_purchased_total IS 'Total de Pistas Contextuales compradas';
COMMENT ON COLUMN gamification_system.comodines_inventory.vision_lectora_purchased_total IS 'Total de Visión Lectora compradas';
COMMENT ON COLUMN gamification_system.comodines_inventory.segunda_oportunidad_purchased_total IS 'Total de Segunda Oportunidad compradas';
COMMENT ON COLUMN gamification_system.comodines_inventory.pistas_used_total IS 'Total de Pistas Contextuales usadas';
COMMENT ON COLUMN gamification_system.comodines_inventory.vision_lectora_used_total IS 'Total de Visión Lectora usadas';
COMMENT ON COLUMN gamification_system.comodines_inventory.segunda_oportunidad_used_total IS 'Total de Segunda Oportunidad usadas';
COMMENT ON COLUMN gamification_system.comodines_inventory.pistas_cost IS 'Costo en ML Coins de Pistas Contextuales';
COMMENT ON COLUMN gamification_system.comodines_inventory.vision_lectora_cost IS 'Costo en ML Coins de Visión Lectora';
COMMENT ON COLUMN gamification_system.comodines_inventory.segunda_oportunidad_cost IS 'Costo en ML Coins de Segunda Oportunidad';
COMMENT ON COLUMN gamification_system.comodines_inventory.metadata IS 'Metadatos adicionales en formato JSON';
COMMENT ON COLUMN gamification_system.comodines_inventory.created_at IS 'Fecha de creación del registro';
COMMENT ON COLUMN gamification_system.comodines_inventory.updated_at IS 'Fecha de última actualización';

-- Permissions
ALTER TABLE gamification_system.comodines_inventory OWNER TO gamilit_user;
GRANT ALL ON TABLE gamification_system.comodines_inventory TO gamilit_user;
