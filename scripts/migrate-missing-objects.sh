#!/bin/bash

###############################################################################
# Script de Migración de Objetos Faltantes de Base de Datos
#
# Migra objetos SQL desde el directorio origen al destino
# basado en el análisis de OBJETOS-FALTANTES-DETALLADO.csv
#
# Uso: ./migrate-missing-objects.sh [fase]
#   fase: critica | alta | media | todas
###############################################################################

set -e  # Exit on error

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Directorios
ORIGEN_BASE="/home/isem/workspace/workspace-gamilit/projects/gamilit-docs/03-desarrollo/base-de-datos/backup-ddl/gamilit_platform"
DESTINO_BASE="/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Archivos de log
LOG_DIR="$PROJECT_ROOT/logs/migration"
mkdir -p "$LOG_DIR"
LOG_FILE="$LOG_DIR/migration-$(date +%Y%m%d-%H%M%S).log"

# Función de logging
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$LOG_FILE"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$LOG_FILE"
}

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1" | tee -a "$LOG_FILE"
}

# Función para migrar un objeto
migrate_object() {
    local schema=$1
    local tipo=$2
    local nombre=$3
    local prioridad=$4

    local origen_file="$ORIGEN_BASE/schemas/$schema/$tipo/$nombre.sql"
    local destino_dir="$DESTINO_BASE/schemas/$schema/$tipo"
    local destino_file="$destino_dir/$nombre.sql"

    # Verificar si archivo origen existe
    if [ ! -f "$origen_file" ]; then
        log_warning "Archivo origen no encontrado: $origen_file"
        return 1
    fi

    # Crear directorio destino si no existe
    if [ ! -d "$destino_dir" ]; then
        log_info "Creando directorio: $destino_dir"
        mkdir -p "$destino_dir"
    fi

    # Verificar si ya existe en destino
    if [ -f "$destino_file" ]; then
        log_warning "Archivo ya existe en destino: $destino_file (SKIP)"
        return 0
    fi

    # Copiar archivo
    log "Migrando: $schema/$tipo/$nombre.sql [$prioridad]"
    cp "$origen_file" "$destino_file"

    # Verificar copia exitosa
    if [ -f "$destino_file" ]; then
        log "  ✓ Migrado exitosamente"
        echo "$schema,$tipo,$nombre,$prioridad,$(date +%Y-%m-%d)" >> "$LOG_DIR/migrated-objects.log"
        return 0
    else
        log_error "  ✗ Error al copiar archivo"
        return 1
    fi
}

# Función para migrar por prioridad
migrate_by_priority() {
    local priority=$1
    local count=0
    local success=0
    local failed=0

    log "=================================================="
    log "MIGRANDO OBJETOS CON PRIORIDAD: $priority"
    log "=================================================="

    # Leer CSV y filtrar por prioridad
    while IFS=, read -r schema tipo nombre prioridad impacto archivo accion; do
        # Skip header
        if [[ "$schema" == "Schema" ]]; then
            continue
        fi

        # Filtrar por prioridad
        if [[ "$prioridad" != "$priority" ]]; then
            continue
        fi

        ((count++))

        if migrate_object "$schema" "$tipo" "$nombre" "$prioridad"; then
            ((success++))
        else
            ((failed++))
        fi

    done < "$PROJECT_ROOT/OBJETOS-FALTANTES-DETALLADO.csv"

    log ""
    log "Resumen de migración [$priority]:"
    log "  Total procesados: $count"
    log "  Exitosos: $success"
    log "  Fallidos: $failed"
    log ""
}

# Función para migrar seed data
migrate_seed_data() {
    log "=================================================="
    log "MIGRANDO SEED DATA"
    log "=================================================="

    local seed_origen="$ORIGEN_BASE/seed-data"
    local seed_destino="$DESTINO_BASE/seed-data"

    if [ ! -d "$seed_origen" ]; then
        log_error "Directorio de seed data origen no encontrado: $seed_origen"
        return 1
    fi

    # Crear directorio destino
    mkdir -p "$seed_destino"

    # Copiar toda la estructura de seeds
    log "Copiando archivos de seed data..."

    local total_files=0
    local total_size=0

    for schema_dir in "$seed_origen"/*; do
        if [ -d "$schema_dir" ]; then
            schema_name=$(basename "$schema_dir")
            mkdir -p "$seed_destino/$schema_name"

            for seed_file in "$schema_dir"/*.sql; do
                if [ -f "$seed_file" ]; then
                    file_name=$(basename "$seed_file")
                    file_size=$(stat -f%z "$seed_file" 2>/dev/null || stat -c%s "$seed_file")

                    log "  Copiando: $schema_name/$file_name ($(numfmt --to=iec-i --suffix=B $file_size 2>/dev/null || echo $file_size bytes))"
                    cp "$seed_file" "$seed_destino/$schema_name/"

                    ((total_files++))
                    ((total_size+=file_size))
                fi
            done
        fi
    done

    log ""
    log "✓ Seed data migrado:"
    log "  Archivos: $total_files"
    log "  Tamaño total: $(numfmt --to=iec-i --suffix=B $total_size 2>/dev/null || echo $total_size bytes)"
    log ""

    # Crear README para seeds
    cat > "$seed_destino/README.md" << 'EOF'
# Seed Data - Datos Iniciales

Este directorio contiene los datos iniciales (seed data) para la base de datos Gamilit.

## Orden de Instalación

Los archivos deben ejecutarse en el siguiente orden debido a dependencias:

### 1. System Configuration
```bash
psql -d gamilit_platform -f seed-data/system_configuration/01-seed-system_settings.sql
psql -d gamilit_platform -f seed-data/system_configuration/02-seed-feature_flags.sql
```

### 2. Auth Management
```bash
psql -d gamilit_platform -f seed-data/auth_management/01-seed-test-users.sql
```

### 3. Educational Content
```bash
psql -d gamilit_platform -f seed-data/educational_content/01-seed-modules.sql
psql -d gamilit_platform -f seed-data/educational_content/02-seed-assessment_rubrics.sql
psql -d gamilit_platform -f seed-data/educational_content/03-seed-exercises.sql
```

### 4. Gamification System
```bash
psql -d gamilit_platform -f seed-data/gamification_system/00-seed-achievement_categories.sql
psql -d gamilit_platform -f seed-data/gamification_system/01-seed-achievements.sql
psql -d gamilit_platform -f seed-data/gamification_system/02-seed-leaderboard_metadata.sql
psql -d gamilit_platform -f seed-data/gamification_system/03-seed-maya-ranks.sql
psql -d gamilit_platform -f seed-data/gamification_system/01-initialize-user-gamification.sql
```

### 5. Content Management
```bash
psql -d gamilit_platform -f seed-data/content_management/01-seed-marie_curie_content.sql
```

## Script Automatizado

También puedes usar el script de instalación automatizado:

```bash
./scripts/install-seed-data.sh
```
EOF

    log "✓ README.md creado en seed-data/"
}

# Función para validar alcance de social_features
validate_social_features() {
    log "=================================================="
    log "VALIDACIÓN: Social Features"
    log "=================================================="

    log_warning "El schema 'social_features' contiene 7 tablas que NO fueron migradas."
    log_warning "Se requiere validación con stakeholders para determinar si están en alcance del MVP."
    log_warning ""
    log_warning "Tablas afectadas:"
    log_warning "  - 01-schools"
    log_warning "  - 02-classrooms"
    log_warning "  - 03-classroom_members"
    log_warning "  - 04-teams"
    log_warning "  - 05-team_members"
    log_warning "  - 06-friendships"
    log_warning "  - 07-notifications"
    log_warning ""
    log_warning "Acción requerida: Contactar a product owner para confirmar alcance."
}

# Función para generar reporte post-migración
generate_report() {
    log "=================================================="
    log "GENERANDO REPORTE POST-MIGRACIÓN"
    log "=================================================="

    python3 /tmp/analyze_db_migration.py > /dev/null 2>&1

    log "✓ Análisis actualizado generado"
    log "  Ver: /tmp/db_migration_analysis.json"
    log "  Ver: $PROJECT_ROOT/ANALISIS-MIGRACION-BASE-DATOS.md"
}

# Función principal
main() {
    local fase=${1:-help}

    log "=================================================="
    log "SCRIPT DE MIGRACIÓN DE OBJETOS DE BASE DE DATOS"
    log "=================================================="
    log "Inicio: $(date)"
    log "Fase: $fase"
    log ""

    case $fase in
        critica)
            migrate_by_priority "CRITICA"
            ;;
        alta)
            migrate_by_priority "ALTA"
            ;;
        media)
            migrate_by_priority "MEDIA"
            ;;
        baja)
            migrate_by_priority "BAJA"
            ;;
        seeds)
            migrate_seed_data
            ;;
        todas|all)
            migrate_by_priority "CRITICA"
            migrate_by_priority "ALTA"
            migrate_by_priority "MEDIA"
            migrate_by_priority "BAJA"
            migrate_seed_data
            validate_social_features
            generate_report
            ;;
        validate)
            validate_social_features
            ;;
        report)
            generate_report
            ;;
        help|*)
            echo ""
            echo "Uso: $0 [fase]"
            echo ""
            echo "Fases disponibles:"
            echo "  critica   - Migrar solo objetos de prioridad CRÍTICA"
            echo "  alta      - Migrar solo objetos de prioridad ALTA"
            echo "  media     - Migrar solo objetos de prioridad MEDIA"
            echo "  baja      - Migrar solo objetos de prioridad BAJA"
            echo "  seeds     - Migrar solo seed data"
            echo "  todas     - Migrar TODO (recomendado)"
            echo "  validate  - Validar alcance de social_features"
            echo "  report    - Generar reporte actualizado"
            echo "  help      - Mostrar esta ayuda"
            echo ""
            echo "Ejemplos:"
            echo "  $0 critica     # Migrar solo objetos críticos"
            echo "  $0 todas       # Migración completa"
            echo ""
            exit 0
            ;;
    esac

    log ""
    log "=================================================="
    log "MIGRACIÓN COMPLETADA"
    log "=================================================="
    log "Fin: $(date)"
    log "Log guardado en: $LOG_FILE"
    log ""
    log "Próximos pasos:"
    log "  1. Revisar log de migración"
    log "  2. Ejecutar validaciones de integridad"
    log "  3. Aplicar objetos migrados a la base de datos"
    log "  4. Ejecutar tests de integración"
    log ""
}

# Ejecutar script
main "$@"
