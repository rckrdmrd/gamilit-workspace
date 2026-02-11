-- =====================================================
-- Table: gamification_system.ml_coins_transactions
-- Description: Registro de transacciones de ML Coins (ingresos y gastos)
-- Dependencies: auth_management.profiles, auth_management.tenants
-- =====================================================

DROP TABLE IF EXISTS gamification_system.ml_coins_transactions CASCADE;

CREATE TABLE gamification_system.ml_coins_transactions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    tenant_id uuid,
    amount integer NOT NULL,
    balance_before integer NOT NULL,
    balance_after integer NOT NULL,
    transaction_type gamification_system.transaction_type NOT NULL,
    description text,
    reason text,
    reference_id uuid,
    reference_type text,
    multiplier numeric(3,2) DEFAULT 1.00,
    bonus_applied boolean DEFAULT false,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamptz DEFAULT gamilit.now_mexico(),

    -- Primary Key
    CONSTRAINT ml_coins_transactions_pkey PRIMARY KEY (id),

    -- Check Constraints
    CONSTRAINT ml_coins_transactions_balance_after_check CHECK ((balance_after >= 0)),
    CONSTRAINT ml_coins_transactions_balance_before_check CHECK ((balance_before >= 0)),
    CONSTRAINT ml_coins_transactions_reference_type_check CHECK ((reference_type = ANY (ARRAY['exercise'::text, 'module'::text, 'achievement'::text, 'powerup'::text, 'admin'::text, 'streak'::text, 'rank'::text])))
);

-- Indexes
CREATE INDEX idx_ml_transactions_created_at ON gamification_system.ml_coins_transactions(created_at DESC);
CREATE INDEX idx_ml_transactions_reference ON gamification_system.ml_coins_transactions(reference_id, reference_type);
CREATE INDEX idx_ml_transactions_type ON gamification_system.ml_coins_transactions(transaction_type);
CREATE INDEX idx_ml_transactions_user_id ON gamification_system.ml_coins_transactions(user_id);
CREATE INDEX idx_ml_transactions_user_recent ON gamification_system.ml_coins_transactions(user_id, created_at DESC);
CREATE INDEX idx_ml_transactions_user_type_date ON gamification_system.ml_coins_transactions(user_id, transaction_type, created_at DESC);
CREATE INDEX idx_ml_transactions_tenant_id ON gamification_system.ml_coins_transactions(tenant_id);

-- Foreign Keys
ALTER TABLE ONLY gamification_system.ml_coins_transactions
    ADD CONSTRAINT ml_coins_transactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth_management.profiles(id) ON DELETE CASCADE;

ALTER TABLE ONLY gamification_system.ml_coins_transactions
    ADD CONSTRAINT ml_coins_transactions_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES auth_management.tenants(id) ON DELETE SET NULL;

-- RLS Policies
CREATE POLICY ml_transactions_select_admin ON gamification_system.ml_coins_transactions FOR SELECT USING (gamilit.is_admin());
CREATE POLICY ml_transactions_select_own ON gamification_system.ml_coins_transactions FOR SELECT USING ((user_id = gamilit.get_current_user_id()));

-- Comments
COMMENT ON TABLE gamification_system.ml_coins_transactions IS 'Registro de transacciones de ML Coins - earning y spending';
COMMENT ON COLUMN gamification_system.ml_coins_transactions.transaction_type IS 'Tipo de transacción usando gamification_system.transaction_type ENUM (v2.0 - 14 tipos): 7 earned (ingresos), 3 spent (gastos), 4 admin/sistema.';
COMMENT ON COLUMN gamification_system.ml_coins_transactions.multiplier IS 'Multiplicador aplicado (ej: 1.5x por racha)';
COMMENT ON COLUMN gamification_system.ml_coins_transactions.tenant_id IS 'ID del tenant al que pertenece la transacción (multi-tenancy support)';

-- Permissions
ALTER TABLE gamification_system.ml_coins_transactions OWNER TO gamilit_user;
GRANT ALL ON TABLE gamification_system.ml_coins_transactions TO gamilit_user;
