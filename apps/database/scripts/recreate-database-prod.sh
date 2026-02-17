#!/bin/bash
# Wrapper PROD para recreación de BD
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
exec bash "$SCRIPT_DIR/recreate-database.sh" --env prod "$@"
