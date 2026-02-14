#!/bin/bash
# ============================================================================
# Rollback Migration - Restore from Backup
# @ref GUIA-PIPELINE-MIGRACIONES §4, GUIA-EXPAND-CONTRACT-MIGRATIONS
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
PGPASSWORD="${DB_PASSWORD:-gamilit_dev_2026}" dropdb \
  -h "${DB_HOST}" \
  -p "${DB_PORT}" \
  -U "${DB_USER}" \
  --if-exists \
  "${DB_NAME}"

echo "Creating empty database..."
PGPASSWORD="${DB_PASSWORD:-gamilit_dev_2026}" createdb \
  -h "${DB_HOST}" \
  -p "${DB_PORT}" \
  -U "${DB_USER}" \
  "${DB_NAME}"

echo "Restoring from backup..."
gunzip -c "${BACKUP_FILE}" | PGPASSWORD="${DB_PASSWORD:-gamilit_dev_2026}" pg_restore \
  -h "${DB_HOST}" \
  -p "${DB_PORT}" \
  -U "${DB_USER}" \
  -d "${DB_NAME}" \
  --no-owner \
  --no-privileges \
  --verbose \
  2>/dev/null

echo ""
echo "=== Rollback complete ==="
echo "Database restored from: ${BACKUP_FILE}"
