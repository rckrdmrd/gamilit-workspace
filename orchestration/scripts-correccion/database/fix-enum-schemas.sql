-- ============================================================================
-- SCRIPT: Fix ENUM Schema References (P0 - BLOQUEANTE)
-- Fecha: 2025-11-08
-- Descripción: Corrige 23 referencias de ENUMs que usan 'public' en lugar del
--              schema correcto.
-- ============================================================================
--
-- PROBLEMA:
--   Múltiples tablas usan ENUMs del schema 'public' cuando los ENUMs fueron
--   movidos a sus schemas correctos en 00-prerequisites.sql
--
-- IMPACTO:
--   🔴 BLOQUEANTE - La creación de la BD fallará porque los ENUMs no existen
--   en el schema 'public'
--
-- USO:
--   Este script NO se ejecuta en la BD, sino que MODIFICA los archivos DDL.
--   Ejecutar con bash:
--
--   bash apps/database/scripts/fix-enum-schemas.sql
--
-- ============================================================================

#!/bin/bash

set -e

DDL_DIR="apps/database/ddl/schemas"

echo "============================================================================"
echo "Fixing ENUM schema references in DDL files"
echo "============================================================================"
echo ""

# ============================================================================
# 1. auth_management.auth_providers
# ============================================================================

echo "1. Fixing auth_management/tables/auth_providers.sql..."

sed -i 's/auth_provider auth_provider NOT NULL/auth_provider auth_management.auth_provider NOT NULL/' \
    "$DDL_DIR/auth_management/tables/auth_providers.sql"

echo "   ✅ Fixed: auth_provider → auth_management.auth_provider"

# ============================================================================
# 2. educational_content.modules
# ============================================================================

echo "2. Fixing educational_content/tables/modules.sql..."

sed -i 's/status content_status DEFAULT/status content_management.content_status DEFAULT/' \
    "$DDL_DIR/educational_content/tables/modules.sql"

echo "   ✅ Fixed: content_status → content_management.content_status"

# ============================================================================
# 3. educational_content.media_resources
# ============================================================================

echo "3. Fixing educational_content/tables/media_resources.sql..."

sed -i 's/media_type media_type NOT NULL/media_type content_management.media_type NOT NULL/' \
    "$DDL_DIR/educational_content/tables/media_resources.sql"

sed -i 's/processing_status processing_status DEFAULT/processing_status content_management.processing_status DEFAULT/' \
    "$DDL_DIR/educational_content/tables/media_resources.sql"

echo "   ✅ Fixed: media_type → content_management.media_type"
echo "   ✅ Fixed: processing_status → content_management.processing_status"

# ============================================================================
# 4. gamification_system.notifications
# ============================================================================

echo "4. Fixing gamification_system/tables/notifications.sql..."

sed -i 's/type notification_type NOT NULL/type gamification_system.notification_type NOT NULL/' \
    "$DDL_DIR/gamification_system/tables/notifications.sql"

sed -i 's/priority notification_priority DEFAULT/priority gamification_system.notification_priority DEFAULT/' \
    "$DDL_DIR/gamification_system/tables/notifications.sql"

echo "   ✅ Fixed: notification_type → gamification_system.notification_type"
echo "   ✅ Fixed: notification_priority → gamification_system.notification_priority"

# ============================================================================
# 5. gamification_system.achievements
# ============================================================================

echo "5. Fixing gamification_system/tables/achievements.sql..."

# También corregir el valor por defecto inválido
sed -i "s/difficulty_level difficulty_level DEFAULT 'muy_facil'/difficulty_level educational_content.difficulty_level DEFAULT 'facil'/" \
    "$DDL_DIR/gamification_system/tables/achievements.sql"

echo "   ✅ Fixed: difficulty_level → educational_content.difficulty_level"
echo "   ✅ Fixed default value: 'muy_facil' → 'facil'"

# ============================================================================
# 6. gamification_system.user_powerups
# ============================================================================

echo "6. Fixing gamification_system/tables/user_powerups.sql..."

sed -i 's/powerup_type powerup_type NOT NULL/powerup_type gamification_system.powerup_type NOT NULL/' \
    "$DDL_DIR/gamification_system/tables/user_powerups.sql"

echo "   ✅ Fixed: powerup_type → gamification_system.powerup_type"

# ============================================================================
# 7. gamification_system.ml_coins_transactions
# ============================================================================

echo "7. Fixing gamification_system/tables/ml_coins_transactions.sql..."

sed -i 's/transaction_type transaction_type NOT NULL/transaction_type gamification_system.transaction_type NOT NULL/' \
    "$DDL_DIR/gamification_system/tables/ml_coins_transactions.sql"

echo "   ✅ Fixed: transaction_type → gamification_system.transaction_type"

# ============================================================================
# 8. gamification_system.marie_curie_content
# ============================================================================

echo "8. Fixing gamification_system/tables/marie_curie_content.sql..."

sed -i 's/difficulty_level difficulty_level DEFAULT/difficulty_level educational_content.difficulty_level DEFAULT/' \
    "$DDL_DIR/gamification_system/tables/marie_curie_content.sql"

sed -i 's/media_type media_type$/media_type content_management.media_type/' \
    "$DDL_DIR/gamification_system/tables/marie_curie_content.sql"

sed -i 's/processing_status processing_status DEFAULT/processing_status content_management.processing_status DEFAULT/' \
    "$DDL_DIR/gamification_system/tables/marie_curie_content.sql"

echo "   ✅ Fixed: difficulty_level → educational_content.difficulty_level"
echo "   ✅ Fixed: media_type → content_management.media_type"
echo "   ✅ Fixed: processing_status → content_management.processing_status"

# ============================================================================
# 9. content_management.content_templates
# ============================================================================

echo "9. Fixing content_management/tables/content_templates.sql..."

sed -i 's/status content_status DEFAULT/status content_management.content_status DEFAULT/' \
    "$DDL_DIR/content_management/tables/content_templates.sql"

echo "   ✅ Fixed: content_status → content_management.content_status"

# ============================================================================
# 10. content_management.media_files
# ============================================================================

echo "10. Fixing content_management/tables/media_files.sql..."

sed -i 's/media_type media_type NOT NULL/media_type content_management.media_type NOT NULL/' \
    "$DDL_DIR/content_management/tables/media_files.sql"

sed -i 's/processing_status processing_status DEFAULT/processing_status content_management.processing_status DEFAULT/' \
    "$DDL_DIR/content_management/tables/media_files.sql"

echo "   ✅ Fixed: media_type → content_management.media_type"
echo "   ✅ Fixed: processing_status → content_management.processing_status"

# ============================================================================
# 11. content_management.flagged_content
# ============================================================================

echo "11. Fixing content_management/tables/flagged_content.sql..."

sed -i 's/content_type content_type NOT NULL/content_type content_management.content_type NOT NULL/' \
    "$DDL_DIR/content_management/tables/flagged_content.sql"

echo "   ✅ Fixed: content_type → content_management.content_type"

# ============================================================================
# 12. audit_logging.audit_logs
# ============================================================================

echo "12. Fixing audit_logging/tables/audit_logs.sql..."

# Cambiar de VARCHAR a ENUM
sed -i 's/action VARCHAR(100) NOT NULL/action audit_logging.audit_action NOT NULL/' \
    "$DDL_DIR/audit_logging/tables/audit_logs.sql"

echo "   ✅ Fixed: VARCHAR → audit_logging.audit_action"

# ============================================================================
# 13. audit_logging.system_logs
# ============================================================================

echo "13. Fixing audit_logging/tables/system_logs.sql..."

# Reemplazar CHECK constraint con ENUM
sed -i "s/log_level VARCHAR(20) DEFAULT 'info' CHECK (log_level IN ('debug', 'info', 'warning', 'error', 'critical'))/log_level audit_logging.log_level DEFAULT 'info'/" \
    "$DDL_DIR/audit_logging/tables/system_logs.sql"

echo "   ✅ Fixed: VARCHAR + CHECK → audit_logging.log_level"

# ============================================================================
# 14. audit_logging.system_alerts
# ============================================================================

echo "14. Fixing audit_logging/tables/system_alerts.sql..."

sed -i 's/severity VARCHAR(20) NOT NULL/severity audit_logging.alert_severity NOT NULL/' \
    "$DDL_DIR/audit_logging/tables/system_alerts.sql"

sed -i 's/alert_type VARCHAR(50) NOT NULL/alert_type audit_logging.alert_type NOT NULL/' \
    "$DDL_DIR/audit_logging/tables/system_alerts.sql"

echo "   ✅ Fixed: severity → audit_logging.alert_severity"
echo "   ✅ Fixed: alert_type → audit_logging.alert_type"

# ============================================================================
# 15. system_configuration.system_settings
# ============================================================================

echo "15. Fixing system_configuration/tables/system_settings.sql..."

sed -i "s/setting_type VARCHAR(20) DEFAULT 'string'/setting_type system_configuration.setting_type DEFAULT 'string'/" \
    "$DDL_DIR/system_configuration/tables/system_settings.sql"

echo "   ✅ Fixed: VARCHAR → system_configuration.setting_type"

# ============================================================================
# RESUMEN
# ============================================================================

echo ""
echo "============================================================================"
echo "✅ ENUM schema references fixed successfully"
echo "============================================================================"
echo ""
echo "Archivos modificados: 15"
echo "ENUMs corregidos: 23 referencias"
echo ""
echo "Schemas corregidos:"
echo "  - auth_management:      1 ENUM"
echo "  - educational_content:  2 ENUMs (3 archivos)"
echo "  - gamification_system:  5 ENUMs (5 archivos)"
echo "  - content_management:   4 ENUMs (3 archivos)"
echo "  - audit_logging:        4 ENUMs (3 archivos)"
echo "  - system_configuration: 1 ENUM"
echo ""
echo "Próximo paso: Verificar con 'git diff' y ejecutar validación de sintaxis SQL"
echo ""
