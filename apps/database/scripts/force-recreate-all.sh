#!/bin/bash
set -e

# Configuration
DB_NAME="gamilit_platform"
DB_USER="gamilit_user"
DB_PASS="ULwSaMu5uTNQYTaJTelPY3gGFMTKNOqo"
SUDO_PASS="2320"

echo "==========================================="
echo " FORCE DATABASE RECREATION CHECK"
echo "==========================================="

# Function to run psql as postgres user via sudo
run_psql_sudo() {
    echo "$SUDO_PASS" | sudo -S -u postgres psql -c "$1"
}

echo "[1/5] Terminating existing connections..."
run_psql_sudo "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '$DB_NAME' AND pid <> pg_backend_pid();" || true

echo "[2/5] Dropping database '$DB_NAME'..."
run_psql_sudo "DROP DATABASE IF EXISTS $DB_NAME;"

echo "[3/5] Dropping user '$DB_USER'..."
# Drop owned objects first to avoid dependency errors
run_psql_sudo "DROP OWNED BY $DB_USER CASCADE;" 2>/dev/null || true
run_psql_sudo "DROP USER IF EXISTS $DB_USER;"

echo "[4/5] Creating user '$DB_USER'..."
run_psql_sudo "CREATE USER $DB_USER WITH PASSWORD '$DB_PASS' CREATEDB;"

echo "[5/5] Creating database '$DB_NAME'..."
run_psql_sudo "CREATE DATABASE $DB_NAME OWNER $DB_USER;"

echo "==========================================="
echo " DATABASE CLEAN AND READY"
echo "==========================================="

# Now execute the standard initialization script
# We refer to the existing init-database.sh script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
INIT_SCRIPT="$SCRIPT_DIR/init-database.sh"

if [ -f "$INIT_SCRIPT" ]; then
    echo "Executing init-database.sh..."
    # We update the environment to ensure it uses the new password
    export DB_PASSWORD="$DB_PASS"
    export DATABASE_URL="postgresql://$DB_USER:$DB_PASS@localhost:5432/$DB_NAME"
    
    bash "$INIT_SCRIPT" --env dev --force --password "$DB_PASS"
else
    echo "Error: init-database.sh not found at $INIT_SCRIPT"
    exit 1
fi
