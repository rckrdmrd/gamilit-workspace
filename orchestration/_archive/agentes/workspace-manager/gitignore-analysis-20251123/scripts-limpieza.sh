#!/bin/bash

# SCRIPTS DE LIMPIEZA WORKSPACE
# Agente: Workspace-Manager
# Fecha: 2025-11-23
# Uso: Ejecutar secciones manualmente según fase

set -e  # Salir si hay error

echo "=========================================="
echo "SCRIPTS DE LIMPIEZA WORKSPACE"
echo "=========================================="
echo ""
echo "IMPORTANTE: NO ejecutar todo el script de una vez"
echo "Ejecutar cada FASE por separado, revisando resultados"
echo ""

# ============================================
# FASE 0: PREREQUISITOS
# ============================================
fase0_prerequisitos() {
    echo "=== FASE 0: Prerequisitos ==="

    # Crear carpetas de archivos
    mkdir -p orchestration/.archive
    mkdir -p docs/.archive

    echo "✅ Carpetas .archive creadas"

    # Verificar espacio disponible
    echo ""
    echo "Espacio disponible:"
    df -h . | grep -v "Filesystem"

    echo ""
    echo "Tamaño de carpetas backup:"
    du -sh orchestration_old orchestration_bckp docs_bkp 2>/dev/null || true
}

# ============================================
# FASE 1: ARCHIVAR orchestration_old/
# ============================================
fase1_orchestration_old() {
    echo ""
    echo "=== FASE 1: Archivar orchestration_old/ ==="

    if [ ! -d "orchestration_old" ]; then
        echo "❌ orchestration_old/ no existe"
        return 1
    fi

    # Verificar archivos importantes (solo listar, no validar)
    echo ""
    echo "Archivos importantes en orchestration_old/:"
    ls -lh orchestration_old/EJEMPLO-INICIO-AGENTE-*.md 2>/dev/null || echo "  - EJEMPLO-INICIO-AGENTE-*.md: no encontrados"
    ls -lh orchestration_old/PROMPT-*.md 2>/dev/null || echo "  - PROMPT-*.md: no encontrados"
    ls -lh orchestration_old/TRAZA-*.md 2>/dev/null || echo "  - TRAZA-*.md: no encontrados"

    echo ""
    read -p "¿Continuar con archivado? (y/n): " confirm
    if [ "$confirm" != "y" ]; then
        echo "Archivado cancelado"
        return 1
    fi

    # Crear archivo
    echo ""
    echo "Creando archivo comprimido..."
    tar -czf orchestration/.archive/backup-orchestration-old-20251123.tar.gz orchestration_old/

    # Verificar archivo creado
    echo ""
    echo "Archivo creado:"
    ls -lh orchestration/.archive/backup-orchestration-old-20251123.tar.gz

    echo ""
    echo "Primeros 20 archivos en el backup:"
    tar -tzf orchestration/.archive/backup-orchestration-old-20251123.tar.gz | head -20

    # Preguntar antes de eliminar
    echo ""
    read -p "¿Eliminar orchestration_old/? (y/n): " confirm_delete
    if [ "$confirm_delete" = "y" ]; then
        rm -rf orchestration_old/
        echo "✅ orchestration_old/ eliminado"
        echo "✅ Espacio liberado: ~22M"
    else
        echo "orchestration_old/ NO eliminado (puedes eliminarlo manualmente después)"
    fi
}

# ============================================
# FASE 2: ARCHIVAR docs_bkp/
# ============================================
fase2_docs_bkp() {
    echo ""
    echo "=== FASE 2: Archivar docs_bkp/ ==="

    if [ ! -d "docs_bkp" ]; then
        echo "❌ docs_bkp/ no existe"
        return 1
    fi

    # Mostrar estructura
    echo ""
    echo "Estructura de docs_bkp/:"
    find docs_bkp -maxdepth 2 -type d | head -20

    echo ""
    read -p "¿Continuar con archivado? (y/n): " confirm
    if [ "$confirm" != "y" ]; then
        echo "Archivado cancelado"
        return 1
    fi

    # Crear archivo
    echo ""
    echo "Creando archivo comprimido..."
    tar -czf docs/.archive/backup-docs-20251123.tar.gz docs_bkp/

    # Verificar archivo creado
    echo ""
    echo "Archivo creado:"
    ls -lh docs/.archive/backup-docs-20251123.tar.gz

    # Preguntar antes de eliminar
    echo ""
    read -p "¿Eliminar docs_bkp/? (y/n): " confirm_delete
    if [ "$confirm_delete" = "y" ]; then
        rm -rf docs_bkp/
        echo "✅ docs_bkp/ eliminado"
        echo "✅ Espacio liberado: ~11M"
    else
        echo "docs_bkp/ NO eliminado (puedes eliminarlo manualmente después)"
    fi
}

# ============================================
# FASE 3: ARCHIVAR orchestration_bckp/
# ⚠️ SOLO DESPUÉS DE MIGRACIÓN
# ============================================
fase3_orchestration_bckp() {
    echo ""
    echo "=== FASE 3: Archivar orchestration_bckp/ ==="
    echo "⚠️  IMPORTANTE: Solo ejecutar después de confirmar migración completa"
    echo ""

    if [ ! -d "orchestration_bckp" ]; then
        echo "❌ orchestration_bckp/ no existe"
        return 1
    fi

    # Verificar que trazas críticas están migradas
    echo "Verificando archivos críticos migrados..."
    echo ""

    echo "TRAZA-TAREAS-DATABASE.md:"
    echo "  - En bckp: $(ls -lh orchestration_bckp/TRAZA-TAREAS-DATABASE.md 2>/dev/null | awk '{print $5}')"
    echo "  - Migrado: $(ls -lh orchestration/trazas/TRAZA-TAREAS-DATABASE.md 2>/dev/null | awk '{print $5}' || echo 'NO ENCONTRADO')"

    echo ""
    echo "TRAZA-TAREAS-FRONTEND.md:"
    echo "  - En bckp: $(ls -lh orchestration_bckp/TRAZA-TAREAS-FRONTEND.md 2>/dev/null | awk '{print $5}')"
    echo "  - Migrado: $(ls -lh orchestration/trazas/TRAZA-TAREAS-FRONTEND.md 2>/dev/null | awk '{print $5}' || echo 'NO ENCONTRADO')"

    echo ""
    echo "TRAZA-TAREAS-BACKEND.md:"
    echo "  - En bckp: $(ls -lh orchestration_bckp/TRAZA-TAREAS-BACKEND.md 2>/dev/null | awk '{print $5}')"
    echo "  - Migrado: $(ls -lh orchestration/trazas/TRAZA-TAREAS-BACKEND.md 2>/dev/null | awk '{print $5}' || echo 'NO ENCONTRADO')"

    echo ""
    echo "Estados (ESTADO-*.json):"
    ls -lh orchestration/estados/ESTADO-*.json 2>/dev/null || echo "  - NO ENCONTRADOS"

    echo ""
    read -p "¿Archivos críticos migrados correctamente? ¿Continuar? (y/n): " confirm
    if [ "$confirm" != "y" ]; then
        echo "Archivado cancelado"
        return 1
    fi

    # Crear archivo
    echo ""
    echo "Creando archivo comprimido..."
    tar -czf orchestration/.archive/backup-orchestration-bckp-20251123.tar.gz orchestration_bckp/

    # Verificar archivo creado
    echo ""
    echo "Archivo creado:"
    ls -lh orchestration/.archive/backup-orchestration-bckp-20251123.tar.gz

    # Preguntar antes de eliminar
    echo ""
    read -p "¿Eliminar orchestration_bckp/? (y/n): " confirm_delete
    if [ "$confirm_delete" = "y" ]; then
        rm -rf orchestration_bckp/
        echo "✅ orchestration_bckp/ eliminado"
        echo "✅ Espacio liberado: ~5.9M"
    else
        echo "orchestration_bckp/ NO eliminado (puedes eliminarlo manualmente después)"
    fi
}

# ============================================
# VALIDACIÓN FINAL
# ============================================
validacion_final() {
    echo ""
    echo "=== VALIDACIÓN FINAL ==="
    echo ""

    echo "1. Verificar que carpetas backup no existen:"
    ls -la | grep -E "_old|_bckp|_bkp" || echo "  ✅ No se encontraron carpetas backup"

    echo ""
    echo "2. Archivos comprimidos creados:"
    echo "  orchestration/.archive/:"
    ls -lh orchestration/.archive/ 2>/dev/null || echo "    (vacío)"
    echo ""
    echo "  docs/.archive/:"
    ls -lh docs/.archive/ 2>/dev/null || echo "    (vacío)"

    echo ""
    echo "3. Espacio actual de carpetas principales:"
    du -sh orchestration/ docs/ 2>/dev/null

    echo ""
    echo "4. Estado de git (archivos .tar.gz NO deben aparecer):"
    git status | grep -E "\.tar\.gz" || echo "  ✅ Archivos .tar.gz ignorados correctamente"
}

# ============================================
# ROLLBACK (Si es necesario)
# ============================================
rollback() {
    echo ""
    echo "=== ROLLBACK - Restaurar carpetas backup ==="
    echo ""

    if [ -f "orchestration/.archive/backup-orchestration-old-20251123.tar.gz" ]; then
        echo "Extrayendo orchestration_old/..."
        tar -xzf orchestration/.archive/backup-orchestration-old-20251123.tar.gz
        echo "✅ orchestration_old/ restaurado"
    fi

    if [ -f "orchestration/.archive/backup-orchestration-bckp-20251123.tar.gz" ]; then
        echo "Extrayendo orchestration_bckp/..."
        tar -xzf orchestration/.archive/backup-orchestration-bckp-20251123.tar.gz
        echo "✅ orchestration_bckp/ restaurado"
    fi

    if [ -f "docs/.archive/backup-docs-20251123.tar.gz" ]; then
        echo "Extrayendo docs_bkp/..."
        tar -xzf docs/.archive/backup-docs-20251123.tar.gz
        echo "✅ docs_bkp/ restaurado"
    fi

    echo ""
    echo "Rollback completo"
}

# ============================================
# MENÚ PRINCIPAL
# ============================================
menu() {
    echo ""
    echo "=========================================="
    echo "MENÚ DE LIMPIEZA"
    echo "=========================================="
    echo ""
    echo "0. Prerequisitos (crear carpetas .archive)"
    echo "1. FASE 1: Archivar orchestration_old/"
    echo "2. FASE 2: Archivar docs_bkp/"
    echo "3. FASE 3: Archivar orchestration_bckp/ (después de migración)"
    echo "4. Validación Final"
    echo "5. ROLLBACK (restaurar carpetas)"
    echo "q. Salir"
    echo ""
    read -p "Selecciona opción: " opcion

    case $opcion in
        0) fase0_prerequisitos ;;
        1) fase1_orchestration_old ;;
        2) fase2_docs_bkp ;;
        3) fase3_orchestration_bckp ;;
        4) validacion_final ;;
        5) rollback ;;
        q) echo "Saliendo..."; exit 0 ;;
        *) echo "Opción inválida"; menu ;;
    esac

    # Volver al menú
    menu
}

# ============================================
# INICIO
# ============================================
main() {
    # Verificar que estamos en la raíz del proyecto
    if [ ! -f "package.json" ]; then
        echo "❌ ERROR: Ejecutar desde la raíz del proyecto"
        exit 1
    fi

    # Mostrar menú
    menu
}

# Si el script se ejecuta directamente (no source)
if [ "${BASH_SOURCE[0]}" -ef "$0" ]; then
    main
fi
