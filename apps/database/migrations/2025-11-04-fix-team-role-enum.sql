-- ============================================================================
-- MIGRACIÓN: Unificar team_role enum
-- ============================================================================
-- Fecha: 2025-11-04
-- Propósito: Unificar team_role en owner/admin/member (estándar de industria)
-- Dependencias: Ninguna
-- Impacto: social_features.team_members
-- ============================================================================

\echo '========================================='
\echo 'Unificando team_role enum'
\echo 'A: owner, admin, member (jerarquía estándar)'
\echo '========================================='
\echo ''

-- PASO 1: Verificar datos existentes
\echo 'PASO 1: Verificando datos existentes...'
SELECT COUNT(*) as total_team_members FROM social_features.team_members;
\echo ''

-- PASO 2: Verificar valores actuales del enum
\echo 'PASO 2: Valores actuales del enum team_role:'
SELECT enumlabel
FROM pg_enum
WHERE enumtypid = 'team_role'::regtype
ORDER BY enumsortorder;
\echo ''

-- PASO 3: Actualizar valores del enum
\echo 'PASO 3: Actualizando valores del enum...'

-- Nota: ALTER TYPE ... RENAME VALUE requiere PostgreSQL 10+
-- Verificamos si leader existe y lo renombramos a owner
DO $$
BEGIN
  -- Renombrar 'leader' a 'owner'
  IF EXISTS (
    SELECT 1 FROM pg_enum
    WHERE enumtypid = 'team_role'::regtype
    AND enumlabel = 'leader'
  ) THEN
    -- Si hay datos con 'leader', primero los migramos
    -- En este caso no hay datos, pero dejamos la lógica preparada
    IF EXISTS (
      SELECT 1 FROM social_features.team_members WHERE role = 'leader'
    ) THEN
      RAISE NOTICE 'ℹ Migrando registros con role=leader a role=owner';
      UPDATE social_features.team_members SET role = 'owner' WHERE role = 'leader';
    END IF;

    -- No podemos hacer RENAME VALUE directamente, así que usamos otro approach
    -- Agregamos 'owner' y luego removemos 'leader'
    IF NOT EXISTS (
      SELECT 1 FROM pg_enum
      WHERE enumtypid = 'team_role'::regtype
      AND enumlabel = 'owner'
    ) THEN
      ALTER TYPE team_role ADD VALUE 'owner';
      RAISE NOTICE '✅ Agregado: owner';
    END IF;
  ELSE
    RAISE NOTICE 'ℹ leader no existe, agregando owner directamente';
    IF NOT EXISTS (
      SELECT 1 FROM pg_enum
      WHERE enumtypid = 'team_role'::regtype
      AND enumlabel = 'owner'
    ) THEN
      ALTER TYPE team_role ADD VALUE 'owner';
      RAISE NOTICE '✅ Agregado: owner';
    END IF;
  END IF;

  -- Agregar 'admin' si no existe
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum
    WHERE enumtypid = 'team_role'::regtype
    AND enumlabel = 'admin'
  ) THEN
    ALTER TYPE team_role ADD VALUE 'admin';
    RAISE NOTICE '✅ Agregado: admin';
  ELSE
    RAISE NOTICE 'ℹ Ya existe: admin';
  END IF;

  -- 'member' ya existe, solo verificamos
  IF EXISTS (
    SELECT 1 FROM pg_enum
    WHERE enumtypid = 'team_role'::regtype
    AND enumlabel = 'member'
  ) THEN
    RAISE NOTICE 'ℹ Ya existe: member';
  END IF;
END
$$;
\echo ''

-- PASO 4: Actualizar entity (ya usa varchar, solo actualizar comentarios)
\echo 'PASO 4: Actualizando comentarios de la tabla...'
COMMENT ON COLUMN social_features.team_members.role IS 'Rol del miembro: owner (propietario), admin (administrador), member (miembro)';
\echo '✅ Comentario actualizado'
\echo ''

-- PASO 5: Verificar cambios
\echo 'PASO 5: Verificando cambios...'
\echo 'Valores finales del enum team_role:'
SELECT enumlabel
FROM pg_enum
WHERE enumtypid = 'team_role'::regtype
ORDER BY enumsortorder;
\echo ''

\echo 'Nota sobre valores legacy:'
\echo '  - leader: Se mantiene por compatibilidad (migrado a owner)'
\echo '  - coordinator: Se mantiene por compatibilidad'
\echo '  - Los nuevos registros deben usar: owner, admin, member'
\echo ''

\echo '✅ MIGRACIÓN COMPLETADA'
\echo 'team_role ahora incluye jerarquía estándar:'
\echo '  - owner (propietario del equipo)'
\echo '  - admin (administrador)'
\echo '  - member (miembro regular)'
\echo ''
\echo 'Jerarquía de permisos: owner > admin > member'
\echo ''
