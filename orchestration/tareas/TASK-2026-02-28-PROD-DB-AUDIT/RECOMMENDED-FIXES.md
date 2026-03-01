---
title: "Recommended Fixes for Backup Script Issues"
date: "2026-02-28"
priority: "HIGH"
estimated-effort: "4-6 hours"
files-to-modify: 3
---

# Recommended Fixes: Backup Script Improvements

## Overview

Three backup scripts need fixes to address error handling and validation issues identified in the Feb 28 incident analysis.

---

## Fix #1: apps/devops/scripts/backup-production-data.sh

**Issue:** stderr suppression masks connection failures; 0-byte files treated as "table not found"

### Current Code (Lines 128-143)

```bash
backup_table() {
    local schema=$1
    local table=$2
    local output_file=$3

    print_step "  Respaldando ${schema}.${table}..."

    if pg_dump "$DATABASE_URL" \
        --schema="$schema" \
        --table="${schema}.${table}" \
        --data-only \
        --column-inserts \
        --no-owner \
        --no-privileges \
        -f "$output_file" 2>/dev/null; then    # ← PROBLEM: Suppresses errors

        local rows=$(wc -l < "$output_file")
        print_success "  ${schema}.${table} - $(grep -c "^INSERT" "$output_file" 2>/dev/null || echo "0") registros"
    else
        print_warning "  ${schema}.${table} - No existe o sin datos"  # ← Misleading message
        echo "-- Tabla ${schema}.${table} no encontrada" > "$output_file"
    fi
}
```

### Recommended Fix

```bash
backup_table() {
    local schema=$1
    local table=$2
    local output_file=$3

    print_step "  Respaldando ${schema}.${table}..."

    # Capture both stdout and stderr
    local pg_dump_output
    local pg_dump_exit_code=0

    pg_dump_output=$(pg_dump "$DATABASE_URL" \
        --schema="$schema" \
        --table="${schema}.${table}" \
        --data-only \
        --column-inserts \
        --no-owner \
        --no-privileges \
        -f "$output_file" 2>&1) || pg_dump_exit_code=$?

    if [ $pg_dump_exit_code -eq 0 ]; then
        # Success — backup created
        local rows=$(wc -l < "$output_file")
        local insert_count=$(grep -c "^INSERT" "$output_file" 2>/dev/null || echo "0")
        print_success "  ${schema}.${table} - $insert_count registros ($rows lineas)"
    else
        # Failure — determine root cause
        if echo "$pg_dump_output" | grep -q "does not exist"; then
            # Table doesn't exist — this is OK
            print_warning "  ${schema}.${table} - Tabla no existe (omitida)"
            echo "-- Tabla ${schema}.${table} no existe" > "$output_file"
        elif echo "$pg_dump_output" | grep -q "connection"; then
            # Connection error — CRITICAL
            print_error "  ${schema}.${table} - ERROR DE CONEXION: $pg_dump_output"
            return 1  # Exit on connection error
        else
            # Other error
            print_error "  ${schema}.${table} - ERROR: $pg_dump_output"
            return 1
        fi
    fi
}
```

### Key Changes
- Remove `2>/dev/null` to see actual errors
- Capture exit code to distinguish success from failure
- Parse error message to distinguish connection errors (critical) from "table not exist" (OK)
- Return 1 on connection errors to halt backup process
- Use informative log messages

---

## Fix #2: apps/database/scripts/pre-deploy-backup.sh

**Issue:** Uses piped pg_dump output; if pg_dump fails, pipe still succeeds

### Current Code (Line 46)

```bash
echo "Creating backup..."
PGPASSWORD="${BACKUP_PASSWORD}" pg_dump -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${DB_NAME}" --format=custom --compress=9 --verbose 2>/dev/null | gzip > "${BACKUP_FILE}"
```

### Problem

When `pg_dump` fails and writes to stderr, `gzip` may create an empty or corrupted file. The `set -euo pipefail` at line 14 doesn't catch the failure because gzip still succeeds (0 bytes input is valid).

### Recommended Fix

```bash
echo "Creating backup..."

# Create a temporary file for the uncompressed dump
local temp_dump="${BACKUP_DIR}/temp_dump_${TIMESTAMP}.dump"

# Run pg_dump to temporary file (no pipe — enables proper error detection)
if ! PGPASSWORD="${BACKUP_PASSWORD}" pg_dump \
    -h "${DB_HOST}" \
    -p "${DB_PORT}" \
    -U "${DB_USER}" \
    -d "${DB_NAME}" \
    --format=custom \
    --compress=9 \
    --verbose \
    -f "${temp_dump}" 2>&1; then
    echo "ERROR: pg_dump failed. Check database connectivity."
    rm -f "${temp_dump}"
    exit 1
fi

# Verify temp file size before final compression
local temp_size=$(stat -c%s "${temp_dump}" 2>/dev/null || stat -f%z "${temp_dump}" 2>/dev/null || echo "0")
if [ "${temp_size}" -lt 1048576 ]; then
    echo "ERROR: Backup file too small (${temp_size} bytes). Possible connection issue."
    rm -f "${temp_dump}"
    exit 1
fi

# Compress and archive (pipe is OK here since source file is validated)
gzip -c "${temp_dump}" > "${BACKUP_FILE}"

# Clean up temp file
rm -f "${temp_dump}"

echo "Backup created: ${BACKUP_FILE} ($(du -h "${BACKUP_FILE}" | cut -f1))"
```

### Key Changes
- Write pg_dump output to temporary file (not piped)
- Validate temp file size before compression
- Use `!` operator to catch pg_dump failures
- Clear error messages on failure
- Clean up temporary files

---

## Fix #3: apps/devops/scripts/deploy-production.sh

**Issue:** No size validation on full pg_dump backup; 0-byte file accepted as success

### Current Code (Lines 270-283)

```bash
print_step "Ejecutando full pg_dump backup..."
if pg_dump -U "${DB_USER:-gamilit_user}" \
           -h "${DB_HOST:-localhost}" \
           -p "${DB_PORT:-5432}" \
           -d "${DB_NAME:-gamilit_platform}" \
           -F c \
           -f "$full_dump_file" 2>/dev/null; then
    local dump_size=$(du -h "$full_dump_file" | cut -f1)
    print_success "Full backup creado: $(basename $full_dump_file) ($dump_size)"
    CURRENT_FULL_BACKUP="$full_dump_file"
else
    print_error "Full pg_dump backup fallo"
    print_warning "Intentando backup selectivo como alternativa..."
fi
```

### Recommended Fix

```bash
print_step "Ejecutando full pg_dump backup..."

# Run pg_dump with proper error handling
if ! pg_dump -U "${DB_USER:-gamilit_user}" \
           -h "${DB_HOST:-localhost}" \
           -p "${DB_PORT:-5432}" \
           -d "${DB_NAME:-gamilit_platform}" \
           -F c \
           -v \
           -f "$full_dump_file" 2>&1 | grep -v "^pg_dump:"; then
    print_error "Full pg_dump backup fallo — database connection error"
    exit 1
fi

# Validate backup file size (custom format should be >1MB for gamilit_platform)
local dump_size_bytes=$(stat -c%s "$full_dump_file" 2>/dev/null || stat -f%z "$full_dump_file" 2>/dev/null || echo "0")
local dump_size_mb=$((dump_size_bytes / 1048576))

if [ "$dump_size_bytes" -lt 1048576 ]; then
    print_error "Full backup validation failed: file too small (${dump_size_mb}MB, expected >1MB)"
    print_error "Possible causes:"
    print_error "  1. Database connection failed (check auth credentials)"
    print_error "  2. Database is empty (check DB state)"
    print_error "  3. Insufficient disk space"
    exit 1
fi

local dump_size=$(du -h "$full_dump_file" | cut -f1)
print_success "Full backup creado: $(basename $full_dump_file) ($dump_size)"
CURRENT_FULL_BACKUP="$full_dump_file"
```

### Key Changes
- Remove `2>/dev/null` to see pg_dump warnings/errors
- Validate backup file size (>1MB threshold)
- Exit on backup failure instead of falling back silently
- Provide diagnostic information on failure

---

## Fix #4: Add Pre-Flight Database Check (All Scripts)

**Issue:** No connectivity test before attempting expensive backup operation

### Code to Add (Common Function)

```bash
# Add to all three backup scripts after configuration loading

check_database_connectivity() {
    local db_url="$1"
    local db_host=$(echo "$db_url" | sed 's/.*@\([^:]*\).*/\1/')
    local db_port=$(echo "$db_url" | sed 's/.*:\([0-9]*\).*/\1/')
    local db_name=$(echo "$db_url" | sed 's/.*\/\([^?]*\).*/\1/')
    local db_user=$(echo "$db_url" | sed 's/.*:\/\/\([^:]*\).*/\1/')

    print_step "Testing database connectivity: ${db_user}@${db_host}:${db_port}/${db_name}..."

    if timeout 5 psql "$db_url" -c "SELECT 1;" > /dev/null 2>&1; then
        print_success "Database connection OK"
        return 0
    else
        print_error "Cannot connect to database"
        print_error "Check:"
        print_error "  1. Database host/port reachable (ping, nc)"
        print_error "  2. Database credentials correct"
        print_error "  3. Database service running (systemctl status postgresql)"
        return 1
    fi
}

# Call in main() before attempting backup:
check_database_connectivity "$DATABASE_URL" || exit 1
```

### Usage in deploy-production.sh

```bash
create_backup() {
    if [ "$SKIP_BACKUP" = true ]; then
        print_warning "Backup omitido (--skip-backup) - NO RECOMENDADO"
        return 0
    fi

    print_header "PASO 3: BACKUP DE DATOS CRITICOS"

    # Add pre-flight check
    check_database_connectivity "$DATABASE_URL" || exit 1

    # ... rest of backup logic
}
```

---

## Testing Checklist

After implementing these fixes, test the following scenarios:

### Scenario 1: Normal Operation
```bash
# Database is running, backup should succeed
bash backup-production-data.sh --db-url "postgresql://gamilit_user:PASSWORD@localhost:5432/gamilit_platform"
# Expected: ✓ Success, files created with data
```

### Scenario 2: Database Down
```bash
# Stop PostgreSQL, attempt backup
systemctl stop postgresql
bash backup-production-data.sh --db-url "postgresql://gamilit_user:PASSWORD@localhost:5432/gamilit_platform"
# Expected: ✗ Error message about connection failure, exit code 1
systemctl start postgresql
```

### Scenario 3: Wrong Credentials
```bash
# Try with invalid password
bash backup-production-data.sh --db-url "postgresql://gamilit_user:WRONG@localhost:5432/gamilit_platform"
# Expected: ✗ Error message about authentication failure, exit code 1
```

### Scenario 4: Backup Size Validation
```bash
# Manually create 0-byte dump to test validation
touch /tmp/empty.dump
# Simulate deploy-production.sh logic with size check
du -h /tmp/empty.dump
# Expected: Size check should reject <1MB files
```

---

## Implementation Timeline

| Task | Effort | Owner | Due |
|------|--------|-------|-----|
| Code review of fixes | 1h | DevOps Lead | This week |
| Implement Fix #1 (backup-production-data.sh) | 1.5h | DevOps Engineer | Sprint 1 |
| Implement Fix #2 (pre-deploy-backup.sh) | 1.5h | DevOps Engineer | Sprint 1 |
| Implement Fix #3 (deploy-production.sh) | 1h | DevOps Engineer | Sprint 1 |
| Add pre-flight checks (all scripts) | 1h | DevOps Engineer | Sprint 1 |
| Testing + QA | 2h | QA / DevOps | Sprint 1 |
| Deploy to production | 0.5h | DevOps Lead | Sprint 1 |
| **Total** | **~7-8 hours** | — | **1 Sprint** |

---

## Rollback Plan

If fixes cause issues in production:

1. Revert the commits
2. Re-enable the older backup scripts
3. Manual verification of backups during rollback period
4. Post-mortem on what went wrong

**Mitigation:** Test all fixes in staging environment first (1-2 full deploy cycles).

---

## Success Criteria

✅ Backup scripts complete without 0-byte files when database is unavailable
✅ Clear error messages visible to operators (not suppressed by 2>/dev/null)
✅ Minimum file size validation prevents silent failures
✅ Pre-flight DB connectivity checks fail fast (5-second timeout)
✅ All three backup scripts follow consistent error handling patterns
✅ Existing backup/restore workflows continue to function normally

---

**Created:** 2026-02-28
**Status:** READY FOR IMPLEMENTATION
**Priority:** HIGH (prevents data loss in future incidents)
