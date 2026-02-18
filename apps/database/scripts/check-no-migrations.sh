#!/bin/bash

# ============================================================================
# check-no-migrations.sh — DBOPS-005: CI Migration Detection
# ============================================================================
# Purpose: Enforce the DDL-First architecture by detecting TypeORM migration
#          patterns that should NOT exist in this codebase. gamilit uses
#          DDL scripts managed in apps/database/ddl/ — TypeORM migrations
#          are prohibited because they fragment schema ownership.
#
# Usage:
#   ./apps/database/scripts/check-no-migrations.sh
#   ./apps/database/scripts/check-no-migrations.sh --verbose
#
# Exit codes:
#   0 = No forbidden patterns found (CI passes)
#   1 = Forbidden patterns detected (CI fails)
#
# Architecture rationale:
#   See docs/90-adr/ (ADR on DDL-first approach)
#   See orchestration/directivas/simco/SIMCO-BACKEND.md
#   See docs/50-guides/backend/GUIA-EXPAND-CONTRACT-MIGRATIONS.md
#
# Known acceptable patterns (excluded from detection):
#   - synchronize: false  (explicitly disabled — correct)
#   - synchronize: configService.get(...)  (env-gated — correct)
#   - synchronize: process.env.DB_SYNCHRONIZE === 'true'  (env-gated — correct)
#   - { synchronize: false }  (test harnesses — correct)
#   - @synchronized-with  (documentation comment — not TypeORM)
#   - docs/ directory  (documentation explaining why we DON'T use migrations)
#   - orchestration/ directory  (orchestration docs)
#   - apps/database/scripts/  (this script itself and related scripts)
# ============================================================================

set -euo pipefail

# ============================================================================
# Configuration
# ============================================================================

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
VERBOSE="${1:-}"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

FAILURES=0
WARNINGS=0
declare -a FOUND_VIOLATIONS=()
declare -a FOUND_WARNINGS=()

# ============================================================================
# Helpers
# ============================================================================

log_info() { echo -e "${CYAN}[INFO]${NC} $1"; }
log_ok()   { echo -e "${GREEN}[OK]${NC}   $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_fail() { echo -e "${RED}[FAIL]${NC} $1"; }
log_verbose() { [[ "$VERBOSE" == "--verbose" ]] && echo -e "       $1" || true; }

# Search for a pattern, excluding known-safe paths and patterns.
# Returns 0 if no violations found, 1 if violations found.
# Output: matching lines printed if --verbose
check_pattern() {
  local label="$1"
  local pattern="$2"
  local severity="$3"   # "error" or "warning"
  shift 3
  local extra_excludes=("$@")

  # Base excludes: docs, orchestration, database scripts, this script, test fixtures
  local base_excludes=(
    "--exclude-dir=docs"
    "--exclude-dir=orchestration"
    "--exclude-dir=node_modules"
    "--exclude-dir=dist"
    "--exclude-dir=build"
    "--exclude-dir=.git"
    "--exclude-dir=coverage"
    "--exclude-dir=scripts"   # apps/database/scripts/ — this file and rollback docs
    "--exclude=*.md"
    "--exclude=*.yml"
    "--exclude=*.yaml"
    "--exclude=*.json"
    "--exclude=*.sh"
    "--exclude=*.lock"
    "--exclude=*.txt"
    "--exclude=*.log"
  )

  local all_excludes=("${base_excludes[@]}" "${extra_excludes[@]}")

  # Run grep; capture results
  local results
  results=$(grep -rn --include="*.ts" --include="*.js" \
    "${all_excludes[@]}" \
    -E "$pattern" \
    "$REPO_ROOT/apps/backend" \
    "$REPO_ROOT/apps/frontend" \
    2>/dev/null || true)

  if [[ -z "$results" ]]; then
    log_ok "$label — not found"
    return 0
  fi

  if [[ "$severity" == "error" ]]; then
    log_fail "$label — FORBIDDEN pattern detected"
    FOUND_VIOLATIONS+=("$label")
    ((FAILURES++))
  else
    log_warn "$label — review required"
    FOUND_WARNINGS+=("$label")
    ((WARNINGS++))
  fi

  while IFS= read -r line; do
    log_verbose "$line"
  done <<< "$results"

  [[ "$VERBOSE" == "--verbose" ]] && echo ""

  return 0
}

# ============================================================================
# Banner
# ============================================================================

echo ""
echo "============================================================"
echo "  GAMILIT — DBOPS-005: Migration Detection Check"
echo "  Architecture: DDL-First (no TypeORM migrations)"
echo "  Repo: $REPO_ROOT"
echo "============================================================"
echo ""

# ============================================================================
# Check 1: MigrationInterface implementation
# Forbidden: Any class that implements MigrationInterface means someone
# created a TypeORM migration. This is the clearest violation indicator.
# ============================================================================
log_info "Check 1/7: MigrationInterface implementation..."
check_pattern \
  "MigrationInterface implements" \
  "implements\s+MigrationInterface" \
  "error"

# ============================================================================
# Check 2: TypeORM @Migration decorator or migration class pattern
# Forbidden: Classes following TypeORM migration naming/structure
# ============================================================================
log_info "Check 2/7: TypeORM migration class pattern..."
check_pattern \
  "Migration class (up/down methods)" \
  "async up\(queryRunner:\s*QueryRunner\)|async down\(queryRunner:\s*QueryRunner\)" \
  "error"

# ============================================================================
# Check 3: migrations array in DataSource/TypeOrmModule config
# Forbidden: TypeOrmModule.forRoot({ migrations: [...] }) with actual entries
# Acceptable: migrations: [] (empty array is fine — no migrations registered)
# ============================================================================
log_info "Check 3/7: Non-empty migrations array in TypeORM config..."
# Detect 'migrations:' followed by a non-empty array with at least one entry
# This regex looks for migrations: [ followed by something that's not ]
check_pattern \
  "Non-empty migrations array" \
  "migrations\s*:\s*\[[^\]]+\]" \
  "error"

# ============================================================================
# Check 4: hardcoded synchronize: true
# Forbidden: synchronize: true as a literal hardcoded boolean.
# Acceptable: synchronize: false (explicit disable)
# Acceptable: synchronize: configService.get(...) (env-gated)
# Acceptable: synchronize: process.env.X === 'true' (env-gated)
# Acceptable: { synchronize: false } in test harnesses
# Note: @Index({ synchronize: false }) is fine — different TypeORM feature
# ============================================================================
log_info "Check 4/7: Hardcoded 'synchronize: true'..."
# We specifically look for synchronize: true (the literal boolean), excluding:
# - synchronize: false  (correct)
# - synchronize: configService (env-gated, correct)
# - synchronize: process.env (env-gated, correct)
# We use a negative lookahead-equivalent approach: grep for synchronize: true
# then filter out lines with process.env or configService
results_sync=$(grep -rn --include="*.ts" --include="*.js" \
  --exclude-dir=node_modules --exclude-dir=dist --exclude-dir=build \
  --exclude-dir=.git --exclude-dir=coverage \
  -E "synchronize\s*:\s*true" \
  "$REPO_ROOT/apps/backend" \
  "$REPO_ROOT/apps/frontend" \
  2>/dev/null \
  | grep -v "process\.env" \
  | grep -v "configService" \
  | grep -v "DB_SYNCHRONIZE" \
  | grep -v "synchronize: false" \
  || true)

if [[ -z "$results_sync" ]]; then
  log_ok "Hardcoded 'synchronize: true' — not found"
else
  log_fail "Hardcoded 'synchronize: true' — FORBIDDEN (DDL manages schema, not TypeORM sync)"
  FOUND_VIOLATIONS+=("synchronize: true (hardcoded)")
  ((FAILURES++))
  while IFS= read -r line; do
    log_verbose "$line"
  done <<< "$results_sync"
  [[ "$VERBOSE" == "--verbose" ]] && echo ""
fi

# ============================================================================
# Check 5: migration:generate and migration:run in package.json scripts
# Forbidden: npm scripts that generate or run TypeORM migrations
# These scripts would indicate an active migration workflow
# ============================================================================
log_info "Check 5/7: migration:generate / migration:run in package.json..."
results_pkg=$(grep -rn \
  --include="package.json" \
  --exclude-dir=node_modules \
  -E '"migration:(generate|run|revert|show|create)"' \
  "$REPO_ROOT/apps/backend" \
  "$REPO_ROOT/apps/frontend" \
  2>/dev/null || true)

if [[ -z "$results_pkg" ]]; then
  log_ok "migration:generate / migration:run scripts — not found in package.json"
else
  log_fail "migration:* scripts found in package.json — FORBIDDEN"
  FOUND_VIOLATIONS+=("migration:generate/run scripts in package.json")
  ((FAILURES++))
  while IFS= read -r line; do
    log_verbose "$line"
  done <<< "$results_pkg"
  [[ "$VERBOSE" == "--verbose" ]] && echo ""
fi

# ============================================================================
# Check 6: typeorm migration CLI invocations in scripts or CI
# Warning: shell scripts or CI configs invoking 'typeorm migration:run'
# This would bypass our DDL-first pipeline
# ============================================================================
log_info "Check 6/7: typeorm migration CLI in scripts or CI..."
results_cli=$(grep -rn \
  --include="*.sh" \
  --include="*.yml" \
  --include="*.yaml" \
  --exclude-dir=node_modules \
  --exclude-dir=.git \
  --exclude-dir=docs \
  --exclude-dir=orchestration \
  -E "typeorm\s+migration:(run|generate|revert|create|show)" \
  "$REPO_ROOT/apps" \
  "$REPO_ROOT/.github" \
  2>/dev/null || true)

if [[ -z "$results_cli" ]]; then
  log_ok "typeorm migration CLI invocations — not found in scripts/CI"
else
  log_fail "typeorm migration CLI invocations — FORBIDDEN in DDL-first project"
  FOUND_VIOLATIONS+=("typeorm migration CLI in scripts/CI")
  ((FAILURES++))
  while IFS= read -r line; do
    log_verbose "$line"
  done <<< "$results_cli"
  [[ "$VERBOSE" == "--verbose" ]] && echo ""
fi

# ============================================================================
# Check 7: TypeORM DataSource with migrationsRun: true
# Forbidden: Automatically running migrations on startup
# ============================================================================
log_info "Check 7/7: migrationsRun: true in DataSource config..."
check_pattern \
  "migrationsRun: true" \
  "migrationsRun\s*:\s*true" \
  "error"

# ============================================================================
# Summary
# ============================================================================
echo ""
echo "============================================================"
echo "  SUMMARY"
echo "============================================================"
echo ""

if [[ ${#FOUND_VIOLATIONS[@]} -gt 0 ]]; then
  echo -e "${RED}VIOLATIONS DETECTED (${#FOUND_VIOLATIONS[@]}):${NC}"
  for v in "${FOUND_VIOLATIONS[@]}"; do
    echo -e "  ${RED}x${NC} $v"
  done
  echo ""
fi

if [[ ${#FOUND_WARNINGS[@]} -gt 0 ]]; then
  echo -e "${YELLOW}WARNINGS (${#FOUND_WARNINGS[@]}):${NC}"
  for w in "${FOUND_WARNINGS[@]}"; do
    echo -e "  ${YELLOW}!${NC} $w"
  done
  echo ""
fi

if [[ $FAILURES -eq 0 ]]; then
  echo -e "${GREEN}PASSED${NC} — No TypeORM migration patterns found."
  echo "  DDL-First architecture is intact."
  echo ""
  echo "  This project manages schema changes via:"
  echo "    apps/database/ddl/schemas/  (DDL source files)"
  echo "    apps/database/scripts/recreate-database.sh  (apply DDL)"
  echo ""
  exit 0
else
  echo -e "${RED}FAILED${NC} — $FAILURES forbidden migration pattern(s) detected."
  echo ""
  echo "  This project uses DDL-First architecture:"
  echo "    - Schema changes MUST go in apps/database/ddl/schemas/"
  echo "    - Apply via: bash apps/database/scripts/recreate-database.sh"
  echo "    - TypeORM migrations are PROHIBITED (they fragment schema ownership)"
  echo ""
  echo "  Remediation:"
  echo "    1. Remove all TypeORM migration files and references"
  echo "    2. Add your schema change as a DDL file in apps/database/ddl/schemas/"
  echo "    3. Ensure synchronize: false (or env-gated) in all DataSource configs"
  echo "    4. See: docs/50-guides/backend/GUIA-EXPAND-CONTRACT-MIGRATIONS.md"
  echo "    5. Re-run this check to verify"
  echo ""
  exit 1
fi
