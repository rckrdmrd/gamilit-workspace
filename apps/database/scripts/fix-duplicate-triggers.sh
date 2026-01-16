#!/bin/bash
# =====================================================
# Script: fix-duplicate-triggers.sh
# Purpose: Remove duplicate triggers from table files
# Date: 2025-11-24
# Author: Architecture-Analyst
#
# This script comments out CREATE TRIGGER statements from
# table definition files, as they should only exist in
# separate trigger files (ddl/schemas/*/triggers/*.sql)
# =====================================================

set -e

DDL_PATH="/home/isem/workspace/projects/gamilit/apps/database/ddl/schemas"
LOG_FILE="/tmp/fix-duplicate-triggers-$(date +%Y%m%d_%H%M%S).log"

echo "=========================================="
echo "Fix Duplicate Triggers Script"
echo "Date: $(date)"
echo "Log: $LOG_FILE"
echo "=========================================="

# List of files to process
declare -a TABLE_FILES=(
    # auth_management
    "auth_management/tables/01-tenants.sql"
    "auth_management/tables/04-roles.sql"
    "auth_management/tables/10-memberships.sql"

    # progress_tracking
    "progress_tracking/tables/01-module_progress.sql"
    "progress_tracking/tables/03-exercise_attempts.sql"
    "progress_tracking/tables/04-exercise_submissions.sql"

    # gamification_system
    "gamification_system/tables/01-user_stats.sql"
    "gamification_system/tables/02-user_ranks.sql"
    "gamification_system/tables/03-achievements.sql"
    "gamification_system/tables/06-missions.sql"
    "gamification_system/tables/07-comodines_inventory.sql"
    "gamification_system/tables/08-notifications.sql"

    # educational_content
    "educational_content/tables/01-modules.sql"
    "educational_content/tables/02-exercises.sql"
    "educational_content/tables/03-assessment_rubrics.sql"
    "educational_content/tables/04-media_resources.sql"

    # content_management
    "content_management/tables/01-content_templates.sql"
    "content_management/tables/02-marie_curie_content.sql"
    "content_management/tables/03-media_files.sql"

    # social_features
    "social_features/tables/02-schools.sql"
    "social_features/tables/03-classrooms.sql"
    "social_features/tables/04-classroom_members.sql"
    "social_features/tables/05-teams.sql"

    # audit_logging
    "audit_logging/tables/03-system_alerts.sql"

    # system_configuration
    "system_configuration/tables/01-system_settings.sql"
    "system_configuration/tables/01-feature_flags.sql"
)

process_file() {
    local file="$DDL_PATH/$1"

    if [ ! -f "$file" ]; then
        echo "SKIP: $1 (file not found)" | tee -a "$LOG_FILE"
        return
    fi

    # Check if file has CREATE TRIGGER
    if ! grep -q "CREATE TRIGGER\|CREATE OR REPLACE TRIGGER" "$file"; then
        echo "SKIP: $1 (no triggers)" | tee -a "$LOG_FILE"
        return
    fi

    echo "PROCESSING: $1" | tee -a "$LOG_FILE"

    # Create backup
    cp "$file" "${file}.bak"

    # Comment out CREATE TRIGGER blocks (from CREATE TRIGGER to ;)
    # This is a simplified approach - for complex cases, manual review is needed
    sed -i 's/^CREATE TRIGGER/-- [DUPLICATE] CREATE TRIGGER/g' "$file"
    sed -i 's/^CREATE OR REPLACE TRIGGER/-- [DUPLICATE] CREATE OR REPLACE TRIGGER/g' "$file"

    # Add note about trigger location
    if ! grep -q "NOTE: Triggers moved to separate files" "$file"; then
        # Add note after "-- Triggers" comment if exists
        sed -i '/^-- Triggers$/a -- NOTE: Triggers moved to separate files in triggers/ directory' "$file"
    fi

    echo "  - Commented out CREATE TRIGGER statements" | tee -a "$LOG_FILE"
    echo "  - Backup created: ${file}.bak" | tee -a "$LOG_FILE"
}

echo ""
echo "Processing ${#TABLE_FILES[@]} files..."
echo ""

for file in "${TABLE_FILES[@]}"; do
    process_file "$file"
done

echo ""
echo "=========================================="
echo "COMPLETED"
echo "Files processed: ${#TABLE_FILES[@]}"
echo "Log saved to: $LOG_FILE"
echo ""
echo "NEXT STEPS:"
echo "1. Review changes in git diff"
echo "2. Test with: ./drop-and-recreate-database.sh"
echo "3. Remove .bak files if successful"
echo "=========================================="
