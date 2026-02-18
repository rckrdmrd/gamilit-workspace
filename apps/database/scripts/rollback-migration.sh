#!/bin/bash
# ============================================================================
# Rollback Migration - Restore from Backup
# @ref GUIA-PIPELINE-MIGRACIONES section 4, GUIA-EXPAND-CONTRACT-MIGRATIONS
#
# Restores the database from a backup file created by pre-deploy-backup.sh.
#
# Usage:
#   bash rollback-migration.sh /path/to/backup.sql.gz
# ============================================================================

set -euo pipefail

if [ $# -eq 0 ]; then
  echo "Usage: bash rollback-migration.sh <backup_file>"
  echo ""
  echo "Available backups:"
  ls -lht /var/backups/gamilit/gamilit_*.sql.gz 2>/dev/null || echo "  No backups found in /var/backups/gamilit/"
  exit 1
fi

BACKUP_FILE="$1"
DB_NAME="${DB_NAME:-gamilit_platform}"
DB_USER="${DB_USER:-gamilit_user}"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"

if [ -z "${DB_PASSWORD:-}" ] && [ -z "${GAMILIT_DB_PASSWORD:-}" ]; then
  echo "ERROR: Define DB_PASSWORD o GAMILIT_DB_PASSWORD antes de ejecutar."
  exit 1
fi

ROLLBACK_PASSWORD="${DB_PASSWORD:-}"
if [ -z "$ROLLBACK_PASSWORD" ]; then
  ROLLBACK_PASSWORD="${GAMILIT_DB_PASSWORD:-}"
fi

if [ ! -f "${BACKUP_FILE}" ]; then
  echo "ERROR: Backup file not found: ${BACKUP_FILE}"
  exit 1
fi

echo "=== GAMILIT Database Rollback ==="
echo "Restoring from: ${BACKUP_FILE}"
echo "Target database: ${DB_NAME}"
echo ""
echo "WARNING: This will DROP and RECREATE the database!"
read -p "Are you sure? (yes/no): " CONFIRM

if [ "${CONFIRM}" != "yes" ]; then
  echo "Aborted."
  exit 0
fi

echo "Dropping existing database..."
PGPASSWORD="${ROLLBACK_PASSWORD}" dropdb -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" --if-exists "${DB_NAME}"

echo "Creating empty database..."
PGPASSWORD="${ROLLBACK_PASSWORD}" createdb -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" "${DB_NAME}"

echo "Restoring from backup..."
gunzip -c "${BACKUP_FILE}" | PGPASSWORD="${ROLLBACK_PASSWORD}" pg_restore -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${DB_NAME}" --no-owner --no-privileges --verbose 2>/dev/null

echo ""
echo "=== Rollback complete ==="
echo "Database restored from: ${BACKUP_FILE}"
