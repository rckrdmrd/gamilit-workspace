#!/bin/bash
# ============================================================================
# Pre-Deploy Database Backup
# @ref GUIA-PIPELINE-MIGRACIONES §3-4
#
# Creates a timestamped pg_dump backup before deployment.
# Keeps last 7 backups (retention policy).
#
# Usage:
#   bash pre-deploy-backup.sh                    # Use defaults
#   bash pre-deploy-backup.sh /path/to/backups   # Custom backup dir
# ============================================================================

set -euo pipefail

# Configuration
DB_NAME="${DB_NAME:-gamilit_platform}"
DB_USER="${DB_USER:-gamilit_user}"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
BACKUP_DIR="${1:-/var/backups/gamilit}"
RETENTION_DAYS=7
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/gamilit_${TIMESTAMP}.sql.gz"

echo "=== GAMILIT Pre-Deploy Backup ==="
echo "Database: ${DB_NAME}"
echo "Backup dir: ${BACKUP_DIR}"
echo "Timestamp: ${TIMESTAMP}"

# Ensure backup directory exists
mkdir -p "${BACKUP_DIR}"

# Create compressed backup
echo "Creating backup..."
PGPASSWORD="${DB_PASSWORD:-gamilit_dev_2026}" pg_dump \
  -h "${DB_HOST}" \
  -p "${DB_PORT}" \
  -U "${DB_USER}" \
  -d "${DB_NAME}" \
  --format=custom \
  --compress=9 \
  --verbose \
  2>/dev/null | gzip > "${BACKUP_FILE}"

# Verify backup
BACKUP_SIZE=$(stat -c%s "${BACKUP_FILE}" 2>/dev/null || stat -f%z "${BACKUP_FILE}" 2>/dev/null || echo "0")
if [ "${BACKUP_SIZE}" -lt 1024 ]; then
  echo "ERROR: Backup file is too small (${BACKUP_SIZE} bytes). Backup may have failed."
  exit 1
fi

echo "Backup created: ${BACKUP_FILE} ($(du -h "${BACKUP_FILE}" | cut -f1))"

# Cleanup old backups (keep last N days)
echo "Cleaning up backups older than ${RETENTION_DAYS} days..."
find "${BACKUP_DIR}" -name "gamilit_*.sql.gz" -mtime +${RETENTION_DAYS} -delete 2>/dev/null || true

# List remaining backups
echo ""
echo "Current backups:"
ls -lh "${BACKUP_DIR}"/gamilit_*.sql.gz 2>/dev/null || echo "  (none)"

echo ""
echo "=== Backup complete ==="
