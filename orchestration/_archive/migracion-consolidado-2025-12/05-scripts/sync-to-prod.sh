#!/bin/bash

# =============================================================================
# SCRIPT DE SINCRONIZACIÓN GAMILIT - DESARROLLO A PRODUCCIÓN
# =============================================================================
# Fecha: 2025-12-18
# Versión: 1.0.0
# Descripción: Sincroniza cambios del repositorio de desarrollo al de producción
# =============================================================================

set -e  # Salir si hay error

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Rutas
ORIGEN="/home/isem/workspace/projects/gamilit"
DESTINO="/home/isem/workspace-old/wsl-ubuntu/workspace/workspace-gamilit/gamilit/projects/gamilit"
BACKUP_DIR="/home/isem/workspace/projects/gamilit/orchestration/reportes/migracion-prod-2025-12/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
LOG_FILE="$BACKUP_DIR/sync_$TIMESTAMP.log"

# Funciones de utilidad
log() {
    echo -e "${BLUE}[INFO]${NC} $1" | tee -a "$LOG_FILE"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1" | tee -a "$LOG_FILE"
}

warn() {
    echo -e "${YELLOW}[WARN]${NC} $1" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$LOG_FILE"
    exit 1
}

# Verificar que existen los directorios
check_directories() {
    log "Verificando directorios..."

    if [ ! -d "$ORIGEN" ]; then
        error "Directorio origen no existe: $ORIGEN"
    fi

    if [ ! -d "$DESTINO" ]; then
        error "Directorio destino no existe: $DESTINO"
    fi

    success "Directorios verificados"
}

# Crear directorio de backup
create_backup_dir() {
    log "Creando directorio de backup..."
    mkdir -p "$BACKUP_DIR"
    success "Directorio de backup creado: $BACKUP_DIR"
}

# Hacer backup del destino
backup_destino() {
    log "Creando backup del destino..."
    cd "$DESTINO"

    # Verificar si hay cambios
    if [ -n "$(git status --porcelain)" ]; then
        git stash push -m "Backup antes de sincronización $TIMESTAMP"
        success "Cambios guardados en stash"
    else
        log "No hay cambios pendientes en destino"
    fi

    # Crear copia de seguridad de archivos críticos
    mkdir -p "$BACKUP_DIR/$TIMESTAMP"
    cp -r apps/database/seeds "$BACKUP_DIR/$TIMESTAMP/seeds_backup" 2>/dev/null || true
    cp -r apps/backend/src/modules "$BACKUP_DIR/$TIMESTAMP/modules_backup" 2>/dev/null || true

    success "Backup completado en $BACKUP_DIR/$TIMESTAMP"
}

# Sincronizar archivos de DATABASE
sync_database() {
    log "Sincronizando DATABASE..."

    # DDL
    rsync -av --delete \
        --exclude='*.bak' \
        "$ORIGEN/apps/database/ddl/" \
        "$DESTINO/apps/database/ddl/" | tee -a "$LOG_FILE"

    # Seeds
    rsync -av --delete \
        --exclude='*.bak' \
        "$ORIGEN/apps/database/seeds/" \
        "$DESTINO/apps/database/seeds/" | tee -a "$LOG_FILE"

    # Scripts
    cp "$ORIGEN/apps/database/create-database.sh" "$DESTINO/apps/database/"
    cp "$ORIGEN/apps/database/README.md" "$DESTINO/apps/database/"

    success "DATABASE sincronizado"
}

# Sincronizar archivos de BACKEND
sync_backend() {
    log "Sincronizando BACKEND..."

    # Módulos
    rsync -av --delete \
        --exclude='node_modules' \
        --exclude='dist' \
        --exclude='*.bak' \
        "$ORIGEN/apps/backend/src/" \
        "$DESTINO/apps/backend/src/" | tee -a "$LOG_FILE"

    # README
    cp "$ORIGEN/apps/backend/README.md" "$DESTINO/apps/backend/"

    success "BACKEND sincronizado"
}

# Sincronizar archivos de FRONTEND
sync_frontend() {
    log "Sincronizando FRONTEND..."

    # Source
    rsync -av --delete \
        --exclude='node_modules' \
        --exclude='dist' \
        --exclude='.next' \
        --exclude='*.bak' \
        "$ORIGEN/apps/frontend/src/" \
        "$DESTINO/apps/frontend/src/" | tee -a "$LOG_FILE"

    # Config files
    cp "$ORIGEN/apps/frontend/tailwind.config.js" "$DESTINO/apps/frontend/" 2>/dev/null || true

    success "FRONTEND sincronizado"
}

# Sincronizar DOCS
sync_docs() {
    log "Sincronizando DOCS..."

    rsync -av --delete \
        --exclude='*.bak' \
        "$ORIGEN/docs/" \
        "$DESTINO/docs/" | tee -a "$LOG_FILE"

    success "DOCS sincronizado"
}

# Sincronizar ORCHESTRATION
sync_orchestration() {
    log "Sincronizando ORCHESTRATION..."

    rsync -av --delete \
        --exclude='*.bak' \
        --exclude='backups' \
        "$ORIGEN/orchestration/" \
        "$DESTINO/orchestration/" | tee -a "$LOG_FILE"

    success "ORCHESTRATION sincronizado"
}

# Eliminar archivos obsoletos
remove_obsolete_files() {
    log "Eliminando archivos obsoletos..."
    cd "$DESTINO"

    # Frontend - Mecánicas eliminadas de Module4
    rm -rf "apps/frontend/src/features/mechanics/module4/ChatLiterario" 2>/dev/null || true
    rm -rf "apps/frontend/src/features/mechanics/module4/EmailFormal" 2>/dev/null || true
    rm -rf "apps/frontend/src/features/mechanics/module4/EnsayoArgumentativo" 2>/dev/null || true
    rm -rf "apps/frontend/src/features/mechanics/module4/ResenaCritica" 2>/dev/null || true

    # Backend - DTOs eliminados
    rm -f "apps/backend/src/modules/educational/dto/module5/diario-reflexivo-answer.dto.ts" 2>/dev/null || true
    rm -f "apps/backend/src/modules/educational/dto/module5/podcast-answer.dto.ts" 2>/dev/null || true

    # Database - Seeds eliminados
    rm -f "apps/database/seeds/prod/auth_management/05-profiles-demo.sql" 2>/dev/null || true

    success "Archivos obsoletos eliminados"
}

# Sincronizar archivos raíz del proyecto
sync_root_files() {
    log "Sincronizando archivos raíz..."

    cp "$ORIGEN/CHANGELOG.md" "$DESTINO/" 2>/dev/null || true
    cp "$ORIGEN/IMPLEMENTATION-SETTINGS-003.md" "$DESTINO/" 2>/dev/null || true

    success "Archivos raíz sincronizados"
}

# Verificar sincronización
verify_sync() {
    log "Verificando sincronización..."
    cd "$DESTINO"

    # Contar archivos
    BACKEND_COUNT=$(find apps/backend/src -name "*.ts" | wc -l)
    FRONTEND_COUNT=$(find apps/frontend/src -name "*.tsx" -o -name "*.ts" | wc -l)
    DATABASE_COUNT=$(find apps/database -name "*.sql" | wc -l)

    log "Archivos Backend: $BACKEND_COUNT"
    log "Archivos Frontend: $FRONTEND_COUNT"
    log "Archivos Database: $DATABASE_COUNT"

    # Verificar que no existen los archivos eliminados
    if [ -d "apps/frontend/src/features/mechanics/module4/ChatLiterario" ]; then
        warn "ChatLiterario aún existe - verificar eliminación"
    fi

    success "Verificación completada"
}

# Mostrar resumen
show_summary() {
    echo ""
    echo "=============================================="
    echo -e "${GREEN}SINCRONIZACIÓN COMPLETADA${NC}"
    echo "=============================================="
    echo "Timestamp: $TIMESTAMP"
    echo "Log: $LOG_FILE"
    echo "Backup: $BACKUP_DIR/$TIMESTAMP"
    echo ""
    echo "PRÓXIMOS PASOS:"
    echo "1. cd $DESTINO"
    echo "2. Verificar cambios: git status"
    echo "3. Verificar build: npm run build (en backend y frontend)"
    echo "4. Commit: git add . && git commit -m 'Sync from development $TIMESTAMP'"
    echo "5. Push: git push origin main"
    echo ""
}

# Función principal
main() {
    echo ""
    echo "=============================================="
    echo "SINCRONIZACIÓN GAMILIT - DESARROLLO A PRODUCCIÓN"
    echo "=============================================="
    echo "Origen: $ORIGEN"
    echo "Destino: $DESTINO"
    echo "Timestamp: $TIMESTAMP"
    echo ""

    read -p "¿Continuar con la sincronización? (s/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Ss]$ ]]; then
        echo "Sincronización cancelada"
        exit 0
    fi

    create_backup_dir
    check_directories
    backup_destino

    sync_database
    sync_backend
    sync_frontend
    sync_docs
    sync_orchestration
    sync_root_files
    remove_obsolete_files

    verify_sync
    show_summary
}

# Ejecutar
main "$@"
