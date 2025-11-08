-- =====================================================
-- SPRINT 0 - DÍA 3-4: FUNCIONES Y TRIGGERS CRÍTICOS
-- =====================================================
-- Duración: 12 horas
-- Prioridad: P0 CRÍTICO
-- Objetivo: Crear funciones core y triggers automáticos
-- =====================================================

-- IMPORTANTE: Ejecutar DESPUÉS de DAY-1-2-RLS-SECURITY.sql
-- Requiere: RLS configurado
-- Requiere: Tablas base existentes

BEGIN;

\echo '=== SPRINT 0 - DÍA 3-4: INICIANDO FUNCIONES Y TRIGGERS ==='

-- =====================================================
-- 1. CREAR TABLA rank_history (DEPENDENCIA)
-- =====================================================

\echo '>>> Paso 1: Creando tabla rank_history...'

CREATE TABLE IF NOT EXISTS gamification_system.rank_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth_management.profiles(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES auth_management.tenants(id) ON DELETE CASCADE,
  old_rank VARCHAR(50),
  new_rank VARCHAR(50) NOT NULL,
  achieved_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  xp_at_promotion BIGINT NOT NULL DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT rank_history_check_different CHECK (old_rank IS DISTINCT FROM new_rank)
);

-- Índice para búsquedas por usuario
CREATE INDEX idx_rank_history_user_achieved
  ON gamification_system.rank_history(user_id, achieved_at DESC);

-- Índice para analytics
CREATE INDEX idx_rank_history_new_rank
  ON gamification_system.rank_history(new_rank, achieved_at DESC);

-- RLS
ALTER TABLE gamification_system.rank_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY rank_history_read_own
  ON gamification_system.rank_history
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY rank_history_read_admin
  ON gamification_system.rank_history
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth_management.profiles
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

COMMENT ON TABLE gamification_system.rank_history IS
  'Historial de cambios de rango Maya de usuarios. Se llena automáticamente cuando un usuario alcanza un nuevo rango.';

\echo '>>> ✓ Tabla rank_history creada con índices y RLS'

-- =====================================================
-- 2. FUNCIÓN: apply_xp_boost()
-- =====================================================

\echo '>>> Paso 2: Creando función apply_xp_boost()...'

CREATE OR REPLACE FUNCTION gamification_system.apply_xp_boost(
  p_user_id UUID,
  p_base_xp INTEGER
)
RETURNS INTEGER
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  v_multiplier NUMERIC(4,2) := 1.0;
  v_boosted_xp INTEGER;
BEGIN
  -- Obtener el multiplicador más alto de boosts activos
  SELECT COALESCE(MAX(multiplier), 1.0)
  INTO v_multiplier
  FROM gamification_system.active_boosts
  WHERE user_id = p_user_id
    AND boost_type = 'XP'
    AND is_active = true
    AND expires_at > NOW();

  -- Calcular XP con boost aplicado
  v_boosted_xp := FLOOR(p_base_xp * v_multiplier);

  RETURN v_boosted_xp;
END;
$$;

-- Grants
GRANT EXECUTE ON FUNCTION gamification_system.apply_xp_boost(UUID, INTEGER) TO authenticated;

-- Comentario
COMMENT ON FUNCTION gamification_system.apply_xp_boost IS
  'Aplica multiplicadores de XP activos. Retorna el XP boosteado basado en los boosts activos del usuario.';

\echo '>>> ✓ Función apply_xp_boost() creada'

-- =====================================================
-- 3. FUNCIÓN AUXILIAR: get_next_maya_rank()
-- =====================================================

\echo '>>> Paso 3: Creando función get_next_maya_rank()...'

CREATE OR REPLACE FUNCTION gamification_system.get_next_maya_rank(
  p_total_xp BIGINT
)
RETURNS VARCHAR(50)
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  v_rank VARCHAR(50);
BEGIN
  -- Lógica simplificada de rangos Maya basada en XP
  -- Ajustar estos valores según los requisitos reales

  CASE
    WHEN p_total_xp < 500 THEN
      v_rank := 'Ajaw';        -- Rango inicial
    WHEN p_total_xp < 1500 THEN
      v_rank := 'Nacom';       -- 500 XP
    WHEN p_total_xp < 3000 THEN
      v_rank := 'Ah K''in';    -- 1500 XP
    WHEN p_total_xp < 5000 THEN
      v_rank := 'Halach Uinic'; -- 3000 XP
    ELSE
      v_rank := 'K''uk''ulkan'; -- 5000+ XP (máximo rango)
  END CASE;

  RETURN v_rank;
END;
$$;

GRANT EXECUTE ON FUNCTION gamification_system.get_next_maya_rank(BIGINT) TO authenticated;

COMMENT ON FUNCTION gamification_system.get_next_maya_rank IS
  'Determina el rango Maya correspondiente basado en XP total. Usado por el trigger de actualización de rangos.';

\echo '>>> ✓ Función get_next_maya_rank() creada'

-- =====================================================
-- 4. TRIGGER FUNCTION: update_rank_on_xp_change()
-- =====================================================

\echo '>>> Paso 4: Creando trigger function update_rank_on_xp_change()...'

CREATE OR REPLACE FUNCTION gamification_system.update_rank_on_xp_change()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_new_rank VARCHAR(50);
  v_old_rank VARCHAR(50);
BEGIN
  -- Obtener rango anterior
  v_old_rank := OLD.current_rank;

  -- Determinar nuevo rango basado en XP total
  v_new_rank := gamification_system.get_next_maya_rank(NEW.total_xp);

  -- Solo actualizar si el rango cambió
  IF v_new_rank IS DISTINCT FROM v_old_rank THEN
    -- Actualizar rango actual
    NEW.current_rank := v_new_rank;

    -- Registrar cambio en historial
    INSERT INTO gamification_system.rank_history (
      user_id,
      tenant_id,
      old_rank,
      new_rank,
      achieved_at,
      xp_at_promotion
    ) VALUES (
      NEW.user_id,
      NEW.tenant_id,
      v_old_rank,
      v_new_rank,
      NOW(),
      NEW.total_xp
    );

    RAISE NOTICE 'Usuario % ascendió de % a %', NEW.user_id, v_old_rank, v_new_rank;
  END IF;

  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION gamification_system.update_rank_on_xp_change IS
  'Trigger function que actualiza automáticamente el rango Maya cuando cambia el XP total del usuario.';

\echo '>>> ✓ Trigger function update_rank_on_xp_change() creada'

-- =====================================================
-- 5. TRIGGER: after_xp_update_rank
-- =====================================================

\echo '>>> Paso 5: Creando trigger after_xp_update_rank...'

-- Eliminar trigger si existe (para re-ejecución segura)
DROP TRIGGER IF EXISTS after_xp_update_rank ON gamification_system.user_stats;

-- Crear trigger
CREATE TRIGGER after_xp_update_rank
  BEFORE UPDATE OF total_xp ON gamification_system.user_stats
  FOR EACH ROW
  WHEN (NEW.total_xp IS DISTINCT FROM OLD.total_xp)
  EXECUTE FUNCTION gamification_system.update_rank_on_xp_change();

\echo '>>> ✓ Trigger after_xp_update_rank creado'

-- =====================================================
-- 6. FUNCIÓN: cleanup_expired_boosts()
-- =====================================================

\echo '>>> Paso 6: Creando función cleanup_expired_boosts()...'

CREATE OR REPLACE FUNCTION gamification_system.cleanup_expired_boosts()
RETURNS TABLE (
  cleaned_count INTEGER,
  execution_time_ms BIGINT
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_start_time TIMESTAMPTZ;
  v_count INTEGER;
BEGIN
  v_start_time := clock_timestamp();

  -- Desactivar boosts expirados
  UPDATE gamification_system.active_boosts
  SET is_active = false,
      updated_at = NOW()
  WHERE is_active = true
    AND expires_at <= NOW();

  GET DIAGNOSTICS v_count = ROW_COUNT;

  RETURN QUERY SELECT
    v_count,
    EXTRACT(MILLISECONDS FROM clock_timestamp() - v_start_time)::BIGINT;
END;
$$;

GRANT EXECUTE ON FUNCTION gamification_system.cleanup_expired_boosts() TO authenticated;

COMMENT ON FUNCTION gamification_system.cleanup_expired_boosts IS
  'Limpia boosts expirados marcándolos como inactivos. Ejecutar periódicamente con pg_cron.';

\echo '>>> ✓ Función cleanup_expired_boosts() creada'

-- =====================================================
-- 7. FUNCIÓN: get_user_rank_progress()
-- =====================================================

\echo '>>> Paso 7: Creando función get_user_rank_progress()...'

CREATE OR REPLACE FUNCTION gamification_system.get_user_rank_progress(
  p_user_id UUID
)
RETURNS TABLE (
  current_rank VARCHAR(50),
  current_xp BIGINT,
  next_rank VARCHAR(50),
  xp_required_for_next BIGINT,
  xp_progress BIGINT,
  progress_percentage NUMERIC(5,2)
)
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  v_user_xp BIGINT;
  v_current_rank VARCHAR(50);
  v_next_rank VARCHAR(50);
  v_xp_for_next BIGINT;
  v_xp_for_current BIGINT;
BEGIN
  -- Obtener XP y rango actual del usuario
  SELECT us.total_xp, us.current_rank
  INTO v_user_xp, v_current_rank
  FROM gamification_system.user_stats us
  WHERE us.user_id = p_user_id;

  -- Si no se encuentra el usuario, retornar vacío
  IF NOT FOUND THEN
    RETURN;
  END IF;

  -- Determinar siguiente rango y XP requerido
  CASE v_current_rank
    WHEN 'Ajaw' THEN
      v_next_rank := 'Nacom';
      v_xp_for_next := 500;
      v_xp_for_current := 0;
    WHEN 'Nacom' THEN
      v_next_rank := 'Ah K''in';
      v_xp_for_next := 1500;
      v_xp_for_current := 500;
    WHEN 'Ah K''in' THEN
      v_next_rank := 'Halach Uinic';
      v_xp_for_next := 3000;
      v_xp_for_current := 1500;
    WHEN 'Halach Uinic' THEN
      v_next_rank := 'K''uk''ulkan';
      v_xp_for_next := 5000;
      v_xp_for_current := 3000;
    WHEN 'K''uk''ulkan' THEN
      v_next_rank := 'MAX_RANK';
      v_xp_for_next := v_user_xp; -- Ya está en máximo rango
      v_xp_for_current := 5000;
  END CASE;

  -- Retornar resultados
  RETURN QUERY SELECT
    v_current_rank,
    v_user_xp,
    v_next_rank,
    v_xp_for_next,
    v_user_xp - v_xp_for_current AS xp_progress,
    ROUND(
      CASE
        WHEN v_xp_for_next - v_xp_for_current = 0 THEN 100.0
        ELSE ((v_user_xp - v_xp_for_current)::NUMERIC /
              (v_xp_for_next - v_xp_for_current)::NUMERIC) * 100
      END,
      2
    ) AS progress_pct;
END;
$$;

GRANT EXECUTE ON FUNCTION gamification_system.get_user_rank_progress(UUID) TO authenticated;

COMMENT ON FUNCTION gamification_system.get_user_rank_progress IS
  'Calcula el progreso del usuario hacia el siguiente rango Maya. Usado en el frontend para mostrar barra de progreso.';

\echo '>>> ✓ Función get_user_rank_progress() creada'

-- =====================================================
-- 8. TESTING DE FUNCIONES Y TRIGGERS
-- =====================================================

\echo '>>> Paso 8: Ejecutando tests de funciones...'

DO $$
DECLARE
  v_test_xp INTEGER;
  v_boosted_xp INTEGER;
  v_rank VARCHAR(50);
BEGIN
  -- Test 1: apply_xp_boost sin boosts activos
  v_test_xp := 100;
  v_boosted_xp := gamification_system.apply_xp_boost(
    '00000000-0000-0000-0000-000000000001'::UUID,
    v_test_xp
  );

  IF v_boosted_xp = v_test_xp THEN
    RAISE NOTICE '>>> ✓ Test 1 PASS: apply_xp_boost sin boosts (100 = %)', v_boosted_xp;
  ELSE
    RAISE WARNING '>>> ✗ Test 1 FAIL: Esperado 100, obtenido %', v_boosted_xp;
  END IF;

  -- Test 2: get_next_maya_rank con 0 XP
  v_rank := gamification_system.get_next_maya_rank(0);
  IF v_rank = 'Ajaw' THEN
    RAISE NOTICE '>>> ✓ Test 2 PASS: Rango inicial es Ajaw';
  ELSE
    RAISE WARNING '>>> ✗ Test 2 FAIL: Esperado Ajaw, obtenido %', v_rank;
  END IF;

  -- Test 3: get_next_maya_rank con 1000 XP
  v_rank := gamification_system.get_next_maya_rank(1000);
  IF v_rank = 'Nacom' THEN
    RAISE NOTICE '>>> ✓ Test 3 PASS: 1000 XP = Nacom';
  ELSE
    RAISE WARNING '>>> ✗ Test 3 FAIL: Esperado Nacom, obtenido %', v_rank;
  END IF;

  -- Test 4: get_next_maya_rank con 10000 XP (máximo)
  v_rank := gamification_system.get_next_maya_rank(10000);
  IF v_rank = 'K''uk''ulkan' THEN
    RAISE NOTICE '>>> ✓ Test 4 PASS: 10000 XP = K''uk''ulkan (máximo)';
  ELSE
    RAISE WARNING '>>> ✗ Test 4 FAIL: Esperado K''uk''ulkan, obtenido %', v_rank;
  END IF;
END $$;

\echo '>>> ✓ Tests de funciones completados'

-- =====================================================
-- 9. VERIFICACIÓN DE CONFIGURACIÓN
-- =====================================================

\echo '>>> Paso 9: Verificando configuración...'

-- Verificar que la tabla rank_history existe
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'gamification_system'
      AND table_name = 'rank_history'
  ) THEN
    RAISE NOTICE '>>> ✓ Tabla rank_history existe';
  ELSE
    RAISE WARNING '>>> ✗ Tabla rank_history NO existe';
  END IF;
END $$;

-- Verificar funciones creadas
DO $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_count
  FROM information_schema.routines
  WHERE routine_schema = 'gamification_system'
    AND routine_name IN (
      'apply_xp_boost',
      'get_next_maya_rank',
      'update_rank_on_xp_change',
      'cleanup_expired_boosts',
      'get_user_rank_progress'
    );

  IF v_count = 5 THEN
    RAISE NOTICE '>>> ✓ Todas las funciones críticas creadas (5/5)';
  ELSE
    RAISE WARNING '>>> ✗ Solo % de 5 funciones creadas', v_count;
  END IF;
END $$;

-- Verificar trigger
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.triggers
    WHERE trigger_schema = 'gamification_system'
      AND trigger_name = 'after_xp_update_rank'
  ) THEN
    RAISE NOTICE '>>> ✓ Trigger after_xp_update_rank existe';
  ELSE
    RAISE WARNING '>>> ✗ Trigger after_xp_update_rank NO existe';
  END IF;
END $$;

-- =====================================================
-- 10. RESUMEN Y FINALIZACIÓN
-- =====================================================

\echo ''
\echo '======================================================='
\echo 'SPRINT 0 - DÍA 3-4: FUNCIONES Y TRIGGERS - COMPLETADO ✓'
\echo '======================================================='
\echo ''
\echo 'Objetos creados:'
\echo '  ✓ Tabla rank_history con RLS'
\echo '  ✓ 5 funciones críticas de gamification'
\echo '  ✓ 1 trigger automático de actualización de rangos'
\echo '  ✓ Tests de funciones ejecutados'
\echo ''
\echo 'Funciones creadas:'
\echo '  - apply_xp_boost() → Aplica multiplicadores XP'
\echo '  - get_next_maya_rank() → Calcula rango por XP'
\echo '  - update_rank_on_xp_change() → Trigger function'
\echo '  - cleanup_expired_boosts() → Limpieza automática'
\echo '  - get_user_rank_progress() → Progreso de rango'
\echo ''
\echo 'Funcionalidad habilitada:'
\echo '  ✓ Rangos Maya se actualizan automáticamente al ganar XP'
\echo '  ✓ Boosts de XP se aplican correctamente'
\echo '  ✓ Historial de cambios de rango se registra'
\echo '  ✓ Limpieza de boosts expirados disponible'
\echo ''
\echo 'Próximo paso:'
\echo '  → Ejecutar DAY-5-6-PERFORMANCE.sql'
\echo '======================================================='

COMMIT;

\echo '>>> ✓ Transacción completada exitosamente'
