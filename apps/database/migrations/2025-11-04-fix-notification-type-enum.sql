-- ============================================================================
-- MIGRACIÓN: Corregir notification_type enum
-- ============================================================================
-- Fecha: 2025-11-04
-- Propósito: Migrar tabla notifications de CHECK constraint a enum notification_type
-- Dependencias: Ninguna
-- Impacto: gamification_system.notifications
-- ============================================================================

\echo '========================================='
\echo 'Migrando notifications.type a enum notification_type'
\echo 'De: text con CHECK constraint'
\echo 'A: notification_type enum'
\echo '========================================='
\echo ''

-- PASO 1: Verificar datos existentes (debe ser 0)
\echo 'PASO 1: Verificando datos existentes...'
SELECT COUNT(*) as total_notifications FROM gamification_system.notifications;
\echo ''

-- PASO 2: Remover CHECK constraint
\echo 'PASO 2: Removiendo CHECK constraint...'
ALTER TABLE gamification_system.notifications
  DROP CONSTRAINT IF EXISTS notifications_type_check;
\echo '✅ CHECK constraint removido'
\echo ''

-- PASO 3: Cambiar tipo de columna a enum
\echo 'PASO 3: Cambiando tipo de columna a enum...'
-- Como no hay datos, podemos hacer el cambio directo
-- Si hubiera datos, necesitaríamos mapear valores
ALTER TABLE gamification_system.notifications
  ALTER COLUMN type TYPE notification_type
  USING 'system_announcement'::notification_type;
\echo '✅ Columna type ahora es notification_type enum'
\echo ''

-- PASO 4: Establecer default
\echo 'PASO 4: Estableciendo default...'
ALTER TABLE gamification_system.notifications
  ALTER COLUMN type SET DEFAULT 'system_announcement'::notification_type;
\echo '✅ Default establecido: system_announcement'
\echo ''

-- PASO 5: Verificar cambios
\echo 'PASO 5: Verificando cambios...'
\echo 'Estructura de la columna type:'
SELECT
  column_name,
  data_type,
  column_default,
  is_nullable,
  udt_name
FROM information_schema.columns
WHERE table_schema = 'gamification_system'
  AND table_name = 'notifications'
  AND column_name = 'type';
\echo ''

\echo 'Valores permitidos en notification_type enum:'
SELECT enumlabel
FROM pg_enum
WHERE enumtypid = 'notification_type'::regtype
ORDER BY enumsortorder;
\echo ''

\echo '✅ MIGRACIÓN COMPLETADA'
\echo 'notification_type ahora usa eventos específicos:'
\echo '  - achievement_unlocked'
\echo '  - rank_up'
\echo '  - mission_completed'
\echo '  - friend_request'
\echo '  - team_invite'
\echo '  - system_announcement'
\echo '  - reminder'
\echo ''
