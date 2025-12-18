-- =====================================================================================
-- Table: user_purchases
-- Schema: gamification_system
-- Description: Historial de compras de usuarios en la tienda virtual
-- Version: 1.0 (2025-11-29) - Creación inicial
-- Author: Database-Agent
--
-- 📚 Documentación:
-- Requerimiento: Sistema de tienda virtual con historial de transacciones
-- Especificación: Registro de compras, estado, expiración y relación con transacciones
--
-- Estados (status):
--   - pending: Compra pendiente de procesamiento
--   - completed: Compra completada exitosamente
--   - refunded: Compra reembolsada
--   - expired: Item expirado (para items temporales)
--
-- Funcionalidad:
--   - Historial completo de compras por usuario
--   - Soporte para items consumibles y temporales
--   - Relación con transacciones de ML Coins
--   - Tracking de items activos y expirados
-- =====================================================================================

-- Drop existing table if exists (development only)
DROP TABLE IF EXISTS gamification_system.user_purchases CASCADE;

-- Create table
CREATE TABLE gamification_system.user_purchases (
    -- Primary key
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,

    -- Relations
    user_id uuid NOT NULL REFERENCES auth_management.profiles(id) ON DELETE CASCADE,
    item_id uuid NOT NULL REFERENCES gamification_system.shop_items(id) ON DELETE SET NULL,
    tenant_id uuid REFERENCES auth_management.tenants(id) ON DELETE CASCADE,

    -- Purchase details
    quantity integer DEFAULT 1 CHECK (quantity > 0),
    price_paid integer NOT NULL CHECK (price_paid >= 0),
    discount_applied integer DEFAULT 0,

    -- Transaction reference
    transaction_id uuid REFERENCES gamification_system.ml_coins_transactions(id),

    -- Status
    status text DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'refunded', 'expired')),

    -- For consumable/temporary items
    expires_at timestamp with time zone,
    consumed_at timestamp with time zone,
    is_active boolean DEFAULT true,

    -- Metadata
    metadata jsonb DEFAULT '{}',
    purchased_at timestamp with time zone DEFAULT gamilit.now_mexico()
);

-- Table comment
COMMENT ON TABLE gamification_system.user_purchases IS 'Historial de compras de usuarios en la tienda';

-- Column comments
COMMENT ON COLUMN gamification_system.user_purchases.user_id IS 'Usuario que realizó la compra';
COMMENT ON COLUMN gamification_system.user_purchases.item_id IS 'Item comprado (SET NULL si se elimina del catálogo)';
COMMENT ON COLUMN gamification_system.user_purchases.tenant_id IS 'Tenant al que pertenece la compra';
COMMENT ON COLUMN gamification_system.user_purchases.quantity IS 'Cantidad comprada (para items apilables)';
COMMENT ON COLUMN gamification_system.user_purchases.price_paid IS 'Precio pagado en ML Coins';
COMMENT ON COLUMN gamification_system.user_purchases.discount_applied IS 'Descuento aplicado en ML Coins';
COMMENT ON COLUMN gamification_system.user_purchases.transaction_id IS 'FK a ml_coins_transactions para auditoría';
COMMENT ON COLUMN gamification_system.user_purchases.status IS 'Estado: pending, completed, refunded, expired';
COMMENT ON COLUMN gamification_system.user_purchases.expires_at IS 'Fecha de expiración (para items temporales)';
COMMENT ON COLUMN gamification_system.user_purchases.consumed_at IS 'Fecha de consumo (para items consumibles)';
COMMENT ON COLUMN gamification_system.user_purchases.is_active IS 'Si false, el item ya no está activo (consumido/expirado)';
COMMENT ON COLUMN gamification_system.user_purchases.metadata IS 'Metadata adicional de la compra';
COMMENT ON COLUMN gamification_system.user_purchases.purchased_at IS 'Fecha y hora de la compra';

-- Indexes
CREATE INDEX idx_user_purchases_user ON gamification_system.user_purchases(user_id);
CREATE INDEX idx_user_purchases_item ON gamification_system.user_purchases(item_id);
CREATE INDEX idx_user_purchases_status ON gamification_system.user_purchases(status);
CREATE INDEX idx_user_purchases_active ON gamification_system.user_purchases(is_active) WHERE is_active = true;
CREATE INDEX idx_user_purchases_user_item ON gamification_system.user_purchases(user_id, item_id);
CREATE INDEX idx_user_purchases_date ON gamification_system.user_purchases(purchased_at DESC);
CREATE INDEX idx_user_purchases_tenant ON gamification_system.user_purchases(tenant_id);

-- Unique constraint: Evitar duplicados de items únicos activos
-- Un usuario solo puede tener un item único activo del mismo tipo
CREATE UNIQUE INDEX idx_user_purchases_unique_item ON gamification_system.user_purchases(user_id, item_id)
    WHERE status = 'completed' AND is_active = true;

-- Grant permissions
GRANT ALL ON TABLE gamification_system.user_purchases TO gamilit_user;
