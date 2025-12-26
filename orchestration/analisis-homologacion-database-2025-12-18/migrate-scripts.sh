#!/bin/bash
###############################################################################
# Script de Migración Automática - Scripts Database
# Fecha: 2025-12-18
# Propósito: Migrar scripts desde workspace legacy a producción
###############################################################################

set -e  # Exit on error

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Paths
ORIGEN="/home/isem/workspace/projects/gamilit/apps/database/scripts"
DESTINO="/home/isem/workspace-old/wsl-ubuntu/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/scripts"

# Función de logging
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[✓]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[⚠]${NC} $1"
}

log_error() {
    echo -e "${RED}[✗]${NC} $1"
}

# Función para verificar que los directorios existen
verificar_directorios() {
    log_info "Verificando directorios..."

    if [ ! -d "$ORIGEN" ]; then
        log_error "Directorio ORIGEN no encontrado: $ORIGEN"
        exit 1
    fi

    if [ ! -d "$DESTINO" ]; then
        log_error "Directorio DESTINO no encontrado: $DESTINO"
        exit 1
    fi

    log_success "Directorios verificados"
}

# Función para crear backup
crear_backup() {
    log_info "Creando backup del estado actual..."

    BACKUP_DIR="$ORIGEN/../scripts-backup-$(date +%Y%m%d-%H%M%S)"
    cp -r "$ORIGEN" "$BACKUP_DIR"

    log_success "Backup creado en: $BACKUP_DIR"
}

# Fase 1: Crear subdirectorios
fase1_preparacion() {
    echo ""
    log_info "================================================"
    log_info "FASE 1: PREPARACIÓN - Creando subdirectorios"
    log_info "================================================"

    mkdir -p "$ORIGEN/validations"
    log_success "Creado: validations/"

    mkdir -p "$ORIGEN/utilities"
    log_success "Creado: utilities/"

    mkdir -p "$ORIGEN/testing"
    log_success "Creado: testing/"

    mkdir -p "$ORIGEN/migrations/historical"
    log_success "Creado: migrations/historical/"

    log_success "Fase 1 completada"
}

# Fase 2: Migrar scripts SQL de validación
fase2_validaciones() {
    echo ""
    log_info "================================================"
    log_info "FASE 2: VALIDACIONES - Migrando scripts SQL"
    log_info "================================================"

    # Script 1: validate-seeds-integrity.sql
    if [ -f "$DESTINO/validate-seeds-integrity.sql" ]; then
        cp "$DESTINO/validate-seeds-integrity.sql" "$ORIGEN/validations/"
        log_success "Migrado: validate-seeds-integrity.sql"
    else
        log_warning "No encontrado: validate-seeds-integrity.sql"
    fi

    # Script 2: validate-gap-fixes.sql
    if [ -f "$DESTINO/validate-gap-fixes.sql" ]; then
        cp "$DESTINO/validate-gap-fixes.sql" "$ORIGEN/validations/"
        log_success "Migrado: validate-gap-fixes.sql"
    else
        log_warning "No encontrado: validate-gap-fixes.sql"
    fi

    # Script 3: validate-missions-objectives-structure.sql
    if [ -f "$DESTINO/validate-missions-objectives-structure.sql" ]; then
        cp "$DESTINO/validate-missions-objectives-structure.sql" "$ORIGEN/validations/validate-missions-structure.sql"
        log_success "Migrado: validate-missions-structure.sql"
    else
        log_warning "No encontrado: validate-missions-objectives-structure.sql"
    fi

    # Script 4: validate-update-user-rank-fix.sql
    if [ -f "$DESTINO/validate-update-user-rank-fix.sql" ]; then
        cp "$DESTINO/validate-update-user-rank-fix.sql" "$ORIGEN/validations/validate-user-rank-fix.sql"
        log_success "Migrado: validate-user-rank-fix.sql"
    else
        log_warning "No encontrado: validate-update-user-rank-fix.sql"
    fi

    # Script 5: validate-user-initialization.sql
    if [ -f "$DESTINO/validate-user-initialization.sql" ]; then
        cp "$DESTINO/validate-user-initialization.sql" "$ORIGEN/validations/"
        log_success "Migrado: validate-user-initialization.sql"
    else
        log_warning "No encontrado: validate-user-initialization.sql"
    fi

    # Script 6: validate-generate-alerts-joins.sql
    if [ -f "$DESTINO/validate-generate-alerts-joins.sql" ]; then
        cp "$DESTINO/validate-generate-alerts-joins.sql" "$ORIGEN/validations/validate-alerts-joins.sql"
        log_success "Migrado: validate-alerts-joins.sql"
    else
        log_warning "No encontrado: validate-generate-alerts-joins.sql"
    fi

    # Script 7: VALIDACIONES-RAPIDAS-POST-RECREACION.sql
    if [ -f "$DESTINO/VALIDACIONES-RAPIDAS-POST-RECREACION.sql" ]; then
        cp "$DESTINO/VALIDACIONES-RAPIDAS-POST-RECREACION.sql" "$ORIGEN/validations/post-recreate-validations.sql"
        log_success "Migrado: post-recreate-validations.sql"
    else
        log_warning "No encontrado: VALIDACIONES-RAPIDAS-POST-RECREACION.sql"
    fi

    log_success "Fase 2 completada - 7 scripts SQL migrados"
}

# Fase 3: Migrar script Python
fase3_python() {
    echo ""
    log_info "================================================"
    log_info "FASE 3: PYTHON - Migrando validate_integrity.py"
    log_info "================================================"

    if [ -f "$DESTINO/validate_integrity.py" ]; then
        cp "$DESTINO/validate_integrity.py" "$ORIGEN/utilities/"
        chmod +x "$ORIGEN/utilities/validate_integrity.py"
        log_success "Migrado: validate_integrity.py (con permisos de ejecución)"
    else
        log_warning "No encontrado: validate_integrity.py"
    fi

    log_success "Fase 3 completada"
}

# Fase 4: Migrar script de testing
fase4_testing() {
    echo ""
    log_info "================================================"
    log_info "FASE 4: TESTING - Migrando scripts de prueba"
    log_info "================================================"

    if [ -f "$DESTINO/testing/CREAR-USUARIOS-TESTING.sql" ]; then
        cp "$DESTINO/testing/CREAR-USUARIOS-TESTING.sql" "$ORIGEN/testing/create-test-users.sql"
        log_success "Migrado: create-test-users.sql"
    else
        log_warning "No encontrado: testing/CREAR-USUARIOS-TESTING.sql"
    fi

    log_success "Fase 4 completada"
}

# Fase 5: Migrar documentación
fase5_documentacion() {
    echo ""
    log_info "================================================"
    log_info "FASE 5: DOCUMENTACIÓN - Migrando archivos"
    log_info "================================================"

    # INDEX.md
    if [ -f "$DESTINO/INDEX.md" ]; then
        cp "$DESTINO/INDEX.md" "$ORIGEN/"
        log_success "Migrado: INDEX.md"
    else
        log_warning "No encontrado: INDEX.md"
    fi

    # QUICK-START.md
    if [ -f "$DESTINO/QUICK-START.md" ]; then
        cp "$DESTINO/QUICK-START.md" "$ORIGEN/"
        log_success "Migrado: QUICK-START.md"
    else
        log_warning "No encontrado: QUICK-START.md"
    fi

    # README-VALIDATION-SCRIPTS.md
    if [ -f "$DESTINO/README-VALIDATION-SCRIPTS.md" ]; then
        cp "$DESTINO/README-VALIDATION-SCRIPTS.md" "$ORIGEN/validations/README.md"
        log_success "Migrado: validations/README.md"
    else
        log_warning "No encontrado: README-VALIDATION-SCRIPTS.md"
    fi

    log_success "Fase 5 completada"
}

# Fase 6: Crear archivos README para subdirectorios
fase6_crear_readmes() {
    echo ""
    log_info "================================================"
    log_info "FASE 6: README - Creando archivos README"
    log_info "================================================"

    # README para utilities/
    cat > "$ORIGEN/utilities/README.md" << 'EOF'
# Utilidades - Scripts Database

## validate_integrity.py

Script Python para validación estática de integridad de DDL.

### Propósito
Valida la integridad de archivos DDL sin necesidad de conexión a base de datos activa.

### Uso
```bash
cd utilities/
./validate_integrity.py
```

### Validaciones
1. Foreign Keys (referencias a tablas inexistentes)
2. ENUMs (referencias a ENUMs inexistentes)
3. Funciones (referencias rotas)
4. Triggers (referencias rotas)
5. ENUMs duplicados

### Dependencias
- Python 3.6+
- Módulos estándar (pathlib, re, collections)

### Output
- CRÍTICO: Problemas que impiden funcionamiento
- ALTO: Problemas importantes
- MEDIO: Problemas menores
- BAJO: Advertencias

### Cuándo Usar
- Antes de ejecutar init-database.sh
- Después de modificar DDL
- En CI/CD pipeline
- Para auditoría de calidad
EOF
    log_success "Creado: utilities/README.md"

    # README para testing/
    cat > "$ORIGEN/testing/README.md" << 'EOF'
# Scripts de Testing - Database

## create-test-users.sql

Script para crear usuarios de prueba estandarizados.

### Propósito
Crear conjunto de usuarios de prueba para testing automatizado y manual.

### Uso
```bash
cd testing/
psql -U gamilit_user -d gamilit_platform -f create-test-users.sql
```

### Usuarios Creados
- Usuario administrador de prueba
- Usuarios estudiantes de prueba
- Usuarios con diferentes niveles de progreso

### Cuándo Usar
- Setup inicial de ambiente de testing
- Después de recrear base de datos
- Para pruebas de frontend
- Para testing de APIs

### Notas
- NO ejecutar en producción
- Solo para ambientes dev/staging/testing
- Los usuarios tienen passwords de prueba (cambiar en producción)
EOF
    log_success "Creado: testing/README.md"

    log_success "Fase 6 completada"
}

# Fase 7: Crear CHANGELOG.md
fase7_changelog() {
    echo ""
    log_info "================================================"
    log_info "FASE 7: CHANGELOG - Creando historial"
    log_info "================================================"

    cat > "$ORIGEN/CHANGELOG.md" << 'EOF'
# Changelog - Scripts de Base de Datos GAMILIT

## [2025-12-18] - Homologación con Workspace Legacy

### Agregado
- **Validaciones SQL (7 scripts):**
  - validate-seeds-integrity.sql - Validación exhaustiva de seeds
  - validate-gap-fixes.sql - Validación de gaps DB-127
  - validate-missions-structure.sql - Validación de misiones
  - validate-user-rank-fix.sql - Validación de corrección de rangos
  - validate-user-initialization.sql - Validación de init de usuarios
  - validate-alerts-joins.sql - Validación de joins de alertas
  - post-recreate-validations.sql - Validaciones post-recreación

- **Utilidades Python (1 script):**
  - validate_integrity.py - Validación estática de DDL

- **Testing (1 script):**
  - create-test-users.sql - Creación de usuarios de prueba

- **Documentación (3 archivos):**
  - INDEX.md - Índice maestro de scripts
  - QUICK-START.md - Guía rápida de inicio
  - validations/README.md - Guía de validaciones

- **Subdirectorios:**
  - validations/ - Scripts de validación SQL
  - utilities/ - Herramientas Python
  - testing/ - Scripts de prueba

### Histórico

#### Version 3.0 (2025-11-08)
- Consolidación de init-database.sh
- Movido init-database v1 y v2 a deprecated/
- Creado INDEX.md y QUICK-START.md en workspace legacy

#### Version 2.0 (2025-11-02)
- Agregada integración con update-env-files.sh
- Soporte para dotenv-vault
- Gestión automática de JWT secrets

#### Version 1.0 (Original)
- Scripts base: init-database.sh, reset-database.sh, recreate-database.sh
- Scripts de inventario (8 scripts)
- Configuración dev.conf y prod.conf

### Scripts Obsoletos (No Migrados)

Los siguientes scripts NO fueron migrados por ser obsoletos o puntuales:

1. **deprecated/init-database-v1.sh** - Versión original de init-database (21K)
   - Razón: Reemplazado por v3.0
   - Estado: Histórico, solo referencia

2. **deprecated/init-database-v2.sh** - Versión intermedia (32K)
   - Razón: Reemplazado por v3.0
   - Estado: Histórico, solo referencia

3. **deprecated/init-database.sh.backup-20251102-235826** - Backup de v1.0
   - Razón: Backup histórico
   - Estado: Histórico, solo referencia

4. **VALIDACION-RAPIDA-RECREACION-2025-11-24.sql** - Validación puntual
   - Razón: Validación específica del 24/11/2025
   - Estado: Completado, solo referencia

5. **apply-maya-ranks-v2.1.sql** - Migración de rangos Maya v2.1
   - Razón: Migración ya aplicada
   - Estado: Completado, guardado en migrations/historical/ (opcional)

### Notas de Migración

- Todos los scripts .sh core están sincronizados entre workspaces
- Scripts SQL de validación estaban solo en workspace legacy
- Script Python de validación estaba solo en workspace legacy
- Documentación mejorada estaba solo en workspace legacy

### Referencias

- Reporte completo: `/orchestration/analisis-homologacion-database-2025-12-18/REPORTE-SCRIPTS-DIFERENCIAS.md`
- Resumen ejecutivo: `/orchestration/analisis-homologacion-database-2025-12-18/RESUMEN-EJECUTIVO.md`
EOF
    log_success "Creado: CHANGELOG.md"

    log_success "Fase 7 completada"
}

# Fase 8: Validar estructura
fase8_validacion() {
    echo ""
    log_info "================================================"
    log_info "FASE 8: VALIDACIÓN - Verificando migración"
    log_info "================================================"

    # Verificar que todos los archivos se migraron
    ARCHIVOS_ESPERADOS=(
        "validations/validate-seeds-integrity.sql"
        "validations/validate-gap-fixes.sql"
        "validations/validate-missions-structure.sql"
        "validations/validate-user-rank-fix.sql"
        "validations/validate-user-initialization.sql"
        "validations/validate-alerts-joins.sql"
        "validations/post-recreate-validations.sql"
        "validations/README.md"
        "utilities/validate_integrity.py"
        "utilities/README.md"
        "testing/create-test-users.sql"
        "testing/README.md"
        "INDEX.md"
        "QUICK-START.md"
        "CHANGELOG.md"
    )

    ERRORES=0
    for archivo in "${ARCHIVOS_ESPERADOS[@]}"; do
        if [ -f "$ORIGEN/$archivo" ]; then
            log_success "Verificado: $archivo"
        else
            log_error "Faltante: $archivo"
            ERRORES=$((ERRORES + 1))
        fi
    done

    echo ""
    if [ $ERRORES -eq 0 ]; then
        log_success "Validación completada - Todos los archivos presentes"
    else
        log_error "Validación completada - $ERRORES archivo(s) faltante(s)"
        return 1
    fi
}

# Fase 9: Reporte final
fase9_reporte() {
    echo ""
    log_info "================================================"
    log_info "REPORTE FINAL"
    log_info "================================================"

    echo ""
    log_info "Estructura migrada:"
    tree -L 2 "$ORIGEN" 2>/dev/null || find "$ORIGEN" -type d | head -20

    echo ""
    log_info "Estadísticas:"
    echo "  - Scripts SQL de validación: $(find "$ORIGEN/validations" -name "*.sql" 2>/dev/null | wc -l)"
    echo "  - Scripts Python: $(find "$ORIGEN/utilities" -name "*.py" 2>/dev/null | wc -l)"
    echo "  - Scripts de testing: $(find "$ORIGEN/testing" -name "*.sql" 2>/dev/null | wc -l)"
    echo "  - Archivos de documentación: $(find "$ORIGEN" -maxdepth 1 -name "*.md" 2>/dev/null | wc -l)"

    echo ""
    log_success "================================================"
    log_success "MIGRACIÓN COMPLETADA EXITOSAMENTE"
    log_success "================================================"

    echo ""
    log_info "Próximos pasos:"
    echo "  1. Revisar archivos migrados en: $ORIGEN"
    echo "  2. Ejecutar validaciones de prueba"
    echo "  3. Actualizar documentación del proyecto"
    echo "  4. Comunicar cambios al equipo"

    echo ""
    log_info "Backup del estado anterior: $BACKUP_DIR"
}

# Función principal
main() {
    echo ""
    echo "================================================"
    echo "MIGRACIÓN DE SCRIPTS DATABASE - GAMILIT"
    echo "================================================"
    echo ""

    log_info "Inicio: $(date)"

    verificar_directorios
    crear_backup

    fase1_preparacion
    fase2_validaciones
    fase3_python
    fase4_testing
    fase5_documentacion
    fase6_crear_readmes
    fase7_changelog
    fase8_validacion
    fase9_reporte

    log_info "Fin: $(date)"
}

# Ejecutar script
main "$@"
