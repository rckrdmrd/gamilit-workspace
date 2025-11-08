-- ============================================================================
-- MIGRACIÓN: Actualizar processing_status enum
-- ============================================================================
-- Fecha: 2025-11-04
-- Propósito: Agregar valores faltantes del Backend al enum processing_status
-- Dependencias: Ninguna
-- Impacto: content_management.media_files, educational_content.media_resources
-- ============================================================================

\echo '========================================='
\echo 'Actualizando processing_status enum'
\echo 'Agregando: uploading, ready, error, optimizing'
\echo '========================================='
\echo ''

-- PASO 1: Verificar datos existentes
\echo 'PASO 1: Verificando datos existentes...'
SELECT COUNT(*) as total_media_files FROM content_management.media_files;
SELECT COUNT(*) as total_media_resources FROM educational_content.media_resources;
\echo ''

-- PASO 2: Verificar valores actuales del enum
\echo 'PASO 2: Valores actuales del enum:'
SELECT enumlabel
FROM pg_enum
WHERE enumtypid = 'processing_status'::regtype
ORDER BY enumsortorder;
\echo ''

-- PASO 3: Agregar nuevos valores
\echo 'PASO 3: Agregando nuevos valores...'

-- Verificar si cada valor ya existe antes de agregarlo
DO $$
BEGIN
  -- uploading
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum
    WHERE enumtypid = 'processing_status'::regtype
    AND enumlabel = 'uploading'
  ) THEN
    ALTER TYPE processing_status ADD VALUE 'uploading';
    RAISE NOTICE '✅ Agregado: uploading';
  ELSE
    RAISE NOTICE 'ℹ Ya existe: uploading';
  END IF;

  -- ready
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum
    WHERE enumtypid = 'processing_status'::regtype
    AND enumlabel = 'ready'
  ) THEN
    ALTER TYPE processing_status ADD VALUE 'ready';
    RAISE NOTICE '✅ Agregado: ready';
  ELSE
    RAISE NOTICE 'ℹ Ya existe: ready';
  END IF;

  -- error
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum
    WHERE enumtypid = 'processing_status'::regtype
    AND enumlabel = 'error'
  ) THEN
    ALTER TYPE processing_status ADD VALUE 'error';
    RAISE NOTICE '✅ Agregado: error';
  ELSE
    RAISE NOTICE 'ℹ Ya existe: error';
  END IF;

  -- optimizing
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum
    WHERE enumtypid = 'processing_status'::regtype
    AND enumlabel = 'optimizing'
  ) THEN
    ALTER TYPE processing_status ADD VALUE 'optimizing';
    RAISE NOTICE '✅ Agregado: optimizing';
  ELSE
    RAISE NOTICE 'ℹ Ya existe: optimizing';
  END IF;
END
$$;
\echo ''

-- PASO 4: Actualizar defaults en tablas
\echo 'PASO 4: Actualizando defaults...'

-- media_files
ALTER TABLE content_management.media_files
  ALTER COLUMN processing_status SET DEFAULT 'ready'::processing_status;
\echo '✅ Default actualizado en media_files: ready'

-- media_resources
ALTER TABLE educational_content.media_resources
  ALTER COLUMN processing_status SET DEFAULT 'ready'::processing_status;
\echo '✅ Default actualizado en media_resources: ready'
\echo ''

-- PASO 5: Verificar cambios
\echo 'PASO 5: Verificando cambios...'
\echo 'Valores finales del enum processing_status:'
SELECT enumlabel
FROM pg_enum
WHERE enumtypid = 'processing_status'::regtype
ORDER BY enumsortorder;
\echo ''

\echo '✅ MIGRACIÓN COMPLETADA'
\echo 'processing_status ahora incluye:'
\echo '  Estados originales:'
\echo '    - pending'
\echo '    - processing'
\echo '    - completed'
\echo '    - failed'
\echo '  Estados nuevos (Backend):'
\echo '    - uploading'
\echo '    - ready'
\echo '    - error'
\echo '    - optimizing'
\echo ''
\echo 'Nota: Estados originales se mantienen para flexibilidad futura'
\echo ''
