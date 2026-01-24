# PLAN DE IMPLEMENTACION FASE 3: SINCRONIZACION DE WORKSPACES

**Fecha:** 2025-12-18
**Agente:** Requirements-Analyst
**Proyecto:** GAMILIT
**Estado:** EN PROGRESO

---

## RESUMEN EJECUTIVO

Este plan define los pasos exactos para sincronizar el workspace NUEVO con los archivos faltantes del workspace VIEJO, resolviendo el problema de carga de base de datos entre desarrollo y produccion.

---

## 1. VARIABLES DE ENTORNO

```bash
# Definir paths base
export VIEJO="/home/isem/workspace-old/wsl-ubuntu/workspace/workspace-gamilit/gamilit/projects/gamilit"
export NUEVO="/home/isem/workspace/projects/gamilit"
export TIMESTAMP=$(date +%Y%m%d_%H%M%S)
```

---

## 2. PASO 0: BACKUP PREVENTIVO

Antes de cualquier sincronizacion, crear backup del estado actual:

```bash
# Crear directorio de backup
mkdir -p "$NUEVO/backups/pre-sync-$TIMESTAMP"

# Backup de scripts actuales
cp -r "$NUEVO/scripts" "$NUEVO/backups/pre-sync-$TIMESTAMP/" 2>/dev/null || true
cp -r "$NUEVO/apps/database/scripts" "$NUEVO/backups/pre-sync-$TIMESTAMP/database-scripts" 2>/dev/null || true

echo "Backup creado en: $NUEVO/backups/pre-sync-$TIMESTAMP/"
```

---

## 3. PASO 1: SINCRONIZAR SCRIPTS DE BASE DE DATOS (CRITICOS)

### 3.1 Copiar Scripts Principales

```bash
# Scripts de inicializacion (CRITICOS)
cp "$VIEJO/apps/database/scripts/init-database.sh" "$NUEVO/apps/database/scripts/"
cp "$VIEJO/apps/database/scripts/init-database-v2.sh" "$NUEVO/apps/database/scripts/" 2>/dev/null || true
cp "$VIEJO/apps/database/scripts/init-database-v3.sh" "$NUEVO/apps/database/scripts/" 2>/dev/null || true

# Scripts de operacion (ALTA)
cp "$VIEJO/apps/database/scripts/manage-secrets.sh" "$NUEVO/apps/database/scripts/" 2>/dev/null || true
cp "$VIEJO/apps/database/scripts/reset-database.sh" "$NUEVO/apps/database/scripts/" 2>/dev/null || true
cp "$VIEJO/apps/database/scripts/recreate-database.sh" "$NUEVO/apps/database/scripts/" 2>/dev/null || true

# Scripts de validacion (MEDIA)
cp "$VIEJO/apps/database/scripts/cleanup-duplicados.sh" "$NUEVO/apps/database/scripts/" 2>/dev/null || true
cp "$VIEJO/apps/database/scripts/fix-duplicate-triggers.sh" "$NUEVO/apps/database/scripts/" 2>/dev/null || true
cp "$VIEJO/apps/database/scripts/verify-users.sh" "$NUEVO/apps/database/scripts/" 2>/dev/null || true
cp "$VIEJO/apps/database/scripts/verify-missions-status.sh" "$NUEVO/apps/database/scripts/" 2>/dev/null || true
cp "$VIEJO/apps/database/scripts/load-users-and-profiles.sh" "$NUEVO/apps/database/scripts/" 2>/dev/null || true

# Scripts auxiliares (BAJA)
cp "$VIEJO/apps/database/scripts/DB-127-validar-gaps.sh" "$NUEVO/apps/database/scripts/" 2>/dev/null || true

echo "Scripts de BD copiados"
```

### 3.2 Copiar Directorio de Configuracion

```bash
# Crear directorio config si no existe
mkdir -p "$NUEVO/apps/database/scripts/config"

# Copiar archivos de configuracion por ambiente
cp "$VIEJO/apps/database/scripts/config/dev.conf" "$NUEVO/apps/database/scripts/config/" 2>/dev/null || true
cp "$VIEJO/apps/database/scripts/config/prod.conf" "$NUEVO/apps/database/scripts/config/" 2>/dev/null || true
cp "$VIEJO/apps/database/scripts/config/staging.conf" "$NUEVO/apps/database/scripts/config/" 2>/dev/null || true

echo "Configuraciones por ambiente copiadas"
```

### 3.3 Hacer Scripts Ejecutables

```bash
chmod +x "$NUEVO/apps/database/scripts/"*.sh
echo "Permisos de ejecucion aplicados"
```

---

## 4. PASO 2: SINCRONIZAR SCRIPTS DE PRODUCCION (ROOT)

```bash
# Scripts de produccion faltantes
cp "$VIEJO/scripts/build-production.sh" "$NUEVO/scripts/"
cp "$VIEJO/scripts/deploy-production.sh" "$NUEVO/scripts/"
cp "$VIEJO/scripts/pre-deploy-check.sh" "$NUEVO/scripts/"
cp "$VIEJO/scripts/repair-missing-data.sh" "$NUEVO/scripts/"
cp "$VIEJO/scripts/migrate-missing-objects.sh" "$NUEVO/scripts/"

# Hacer ejecutables
chmod +x "$NUEVO/scripts/"*.sh

echo "Scripts de produccion copiados"
```

---

## 5. PASO 3: SINCRONIZAR DOCUMENTACION

```bash
# Documentacion critica para agente de produccion
cp "$VIEJO/docs/95-guias-desarrollo/GUIA-DESPLIEGUE-PRODUCCION-COMPLETA.md" "$NUEVO/docs/95-guias-desarrollo/"
cp "$VIEJO/docs/95-guias-desarrollo/GUIA-ACTUALIZACION-PRODUCCION.md" "$NUEVO/docs/95-guias-desarrollo/"
cp "$VIEJO/docs/95-guias-desarrollo/GUIA-VALIDACION-PRODUCCION.md" "$NUEVO/docs/95-guias-desarrollo/"
cp "$VIEJO/docs/95-guias-desarrollo/GUIA-DEPLOYMENT-AGENTE-PRODUCCION.md" "$NUEVO/docs/95-guias-desarrollo/"

# Documentacion SSL
cp "$VIEJO/docs/95-guias-desarrollo/GUIA-SSL-NGINX-PRODUCCION.md" "$NUEVO/docs/95-guias-desarrollo/"
cp "$VIEJO/docs/95-guias-desarrollo/GUIA-SSL-AUTOFIRMADO.md" "$NUEVO/docs/95-guias-desarrollo/"

# Directiva de deployment
cp "$VIEJO/docs/95-guias-desarrollo/DIRECTIVA-DEPLOYMENT.md" "$NUEVO/docs/95-guias-desarrollo/"

echo "Documentacion copiada"
```

---

## 6. PASO 4: SINCRONIZAR ARCHIVO ROOT

```bash
# Prompt del agente de produccion
cp "$VIEJO/PROMPT-AGENTE-PRODUCCION.md" "$NUEVO/"

echo "Archivo root copiado"
```

---

## 7. PASO 5: ACTUALIZAR PATHS HARDCODEADOS

### 7.1 fix-duplicate-triggers.sh

El script tiene path hardcodeado que debe actualizarse:

**Actual (viejo):**
```bash
DDL_BASE="/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas"
```

**Nuevo (actualizar a):**
```bash
DDL_BASE="/home/isem/workspace/projects/gamilit/apps/database/ddl/schemas"
```

**Comando de actualizacion:**
```bash
sed -i 's|/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit|/home/isem/workspace/projects/gamilit|g' "$NUEVO/apps/database/scripts/fix-duplicate-triggers.sh"
```

### 7.2 migrate-missing-objects.sh

**Comando de actualizacion:**
```bash
sed -i 's|/home/isem/workspace/workspace-gamilit|/home/isem/workspace|g' "$NUEVO/scripts/migrate-missing-objects.sh"
```

---

## 8. PASO 6: CREAR SCRIPT DE SINCRONIZACION AUTOMATICA

Crear script para futuras sincronizaciones:

```bash
cat > "$NUEVO/scripts/sync-from-old-workspace.sh" << 'SCRIPT_EOF'
#!/bin/bash
# sync-from-old-workspace.sh
# Sincroniza archivos criticos desde el workspace viejo al nuevo

set -e

VIEJO="/home/isem/workspace-old/wsl-ubuntu/workspace/workspace-gamilit/gamilit/projects/gamilit"
NUEVO="/home/isem/workspace/projects/gamilit"

echo "=== Sincronizando desde workspace viejo ==="

# 1. Scripts de BD
echo "[1/4] Sincronizando scripts de BD..."
rsync -av --exclude='*.bak' "$VIEJO/apps/database/scripts/" "$NUEVO/apps/database/scripts/"

# 2. Scripts de produccion
echo "[2/4] Sincronizando scripts de produccion..."
rsync -av "$VIEJO/scripts/"*.sh "$NUEVO/scripts/"

# 3. Documentacion
echo "[3/4] Sincronizando documentacion..."
rsync -av "$VIEJO/docs/95-guias-desarrollo/GUIA-"*.md "$NUEVO/docs/95-guias-desarrollo/"
rsync -av "$VIEJO/docs/95-guias-desarrollo/DIRECTIVA-"*.md "$NUEVO/docs/95-guias-desarrollo/"

# 4. Archivos root
echo "[4/4] Sincronizando archivos root..."
cp "$VIEJO/PROMPT-AGENTE-PRODUCCION.md" "$NUEVO/"

echo "=== Sincronizacion completada ==="
SCRIPT_EOF

chmod +x "$NUEVO/scripts/sync-from-old-workspace.sh"
```

---

## 9. PASO 7: VALIDACION POST-SINCRONIZACION

### 9.1 Verificar Existencia de Archivos

```bash
echo "=== Validando sincronizacion ==="

# Verificar scripts de BD criticos
for script in init-database.sh manage-secrets.sh reset-database.sh recreate-database.sh; do
    if [ -f "$NUEVO/apps/database/scripts/$script" ]; then
        echo "✅ $script"
    else
        echo "❌ FALTA: $script"
    fi
done

# Verificar config
for conf in dev.conf prod.conf staging.conf; do
    if [ -f "$NUEVO/apps/database/scripts/config/$conf" ]; then
        echo "✅ config/$conf"
    else
        echo "❌ FALTA: config/$conf"
    fi
done

# Verificar scripts de produccion
for script in build-production.sh deploy-production.sh pre-deploy-check.sh repair-missing-data.sh; do
    if [ -f "$NUEVO/scripts/$script" ]; then
        echo "✅ $script"
    else
        echo "❌ FALTA: $script"
    fi
done

# Verificar documentacion
for doc in GUIA-DESPLIEGUE-PRODUCCION-COMPLETA.md GUIA-DEPLOYMENT-AGENTE-PRODUCCION.md; do
    if [ -f "$NUEVO/docs/95-guias-desarrollo/$doc" ]; then
        echo "✅ $doc"
    else
        echo "❌ FALTA: $doc"
    fi
done

echo "=== Validacion completada ==="
```

### 9.2 Test de Sintaxis de Scripts

```bash
echo "=== Verificando sintaxis de scripts ==="

for script in "$NUEVO/apps/database/scripts/"*.sh "$NUEVO/scripts/"*.sh; do
    if bash -n "$script" 2>/dev/null; then
        echo "✅ Sintaxis OK: $(basename $script)"
    else
        echo "❌ Error sintaxis: $(basename $script)"
    fi
done
```

---

## 10. PASO 8: PRUEBA EN DESARROLLO

Antes de push a produccion, probar en desarrollo:

```bash
# 1. Probar creacion de BD
cd "$NUEVO"
export DB_PASSWORD="test_password"
./apps/database/scripts/init-database.sh --env dev --dry-run

# 2. Probar build
./scripts/build-production.sh --dry-run

# 3. Probar pre-deploy check
./scripts/pre-deploy-check.sh
```

---

## 11. ROLLBACK PLAN

Si algo falla despues de la sincronizacion:

```bash
# Restaurar desde backup
BACKUP_DIR="$NUEVO/backups/pre-sync-$TIMESTAMP"

# Restaurar scripts
rm -rf "$NUEVO/scripts"
cp -r "$BACKUP_DIR/scripts" "$NUEVO/"

rm -rf "$NUEVO/apps/database/scripts"
cp -r "$BACKUP_DIR/database-scripts" "$NUEVO/apps/database/scripts"

echo "Rollback completado desde: $BACKUP_DIR"
```

---

## 12. SCRIPT COMPLETO DE SINCRONIZACION

Guardar como `sync-workspaces.sh`:

```bash
#!/bin/bash
# sync-workspaces.sh
# Script completo de sincronizacion entre workspaces

set -e

VIEJO="/home/isem/workspace-old/wsl-ubuntu/workspace/workspace-gamilit/gamilit/projects/gamilit"
NUEVO="/home/isem/workspace/projects/gamilit"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

echo "=================================================="
echo "SINCRONIZACION DE WORKSPACES GAMILIT"
echo "Fecha: $(date)"
echo "=================================================="

# PASO 0: Backup
echo "[PASO 0] Creando backup preventivo..."
mkdir -p "$NUEVO/backups/pre-sync-$TIMESTAMP"
cp -r "$NUEVO/scripts" "$NUEVO/backups/pre-sync-$TIMESTAMP/" 2>/dev/null || true
cp -r "$NUEVO/apps/database/scripts" "$NUEVO/backups/pre-sync-$TIMESTAMP/database-scripts" 2>/dev/null || true

# PASO 1: Scripts BD
echo "[PASO 1] Sincronizando scripts de BD..."
for script in init-database.sh init-database-v2.sh init-database-v3.sh manage-secrets.sh reset-database.sh recreate-database.sh cleanup-duplicados.sh fix-duplicate-triggers.sh verify-users.sh verify-missions-status.sh load-users-and-profiles.sh DB-127-validar-gaps.sh; do
    if [ -f "$VIEJO/apps/database/scripts/$script" ]; then
        cp "$VIEJO/apps/database/scripts/$script" "$NUEVO/apps/database/scripts/"
        echo "  ✅ $script"
    fi
done

# Config
mkdir -p "$NUEVO/apps/database/scripts/config"
for conf in dev.conf prod.conf staging.conf; do
    if [ -f "$VIEJO/apps/database/scripts/config/$conf" ]; then
        cp "$VIEJO/apps/database/scripts/config/$conf" "$NUEVO/apps/database/scripts/config/"
        echo "  ✅ config/$conf"
    fi
done

chmod +x "$NUEVO/apps/database/scripts/"*.sh

# PASO 2: Scripts produccion
echo "[PASO 2] Sincronizando scripts de produccion..."
for script in build-production.sh deploy-production.sh pre-deploy-check.sh repair-missing-data.sh migrate-missing-objects.sh; do
    if [ -f "$VIEJO/scripts/$script" ]; then
        cp "$VIEJO/scripts/$script" "$NUEVO/scripts/"
        echo "  ✅ $script"
    fi
done
chmod +x "$NUEVO/scripts/"*.sh

# PASO 3: Documentacion
echo "[PASO 3] Sincronizando documentacion..."
for doc in GUIA-DESPLIEGUE-PRODUCCION-COMPLETA.md GUIA-ACTUALIZACION-PRODUCCION.md GUIA-VALIDACION-PRODUCCION.md GUIA-DEPLOYMENT-AGENTE-PRODUCCION.md GUIA-SSL-NGINX-PRODUCCION.md GUIA-SSL-AUTOFIRMADO.md DIRECTIVA-DEPLOYMENT.md; do
    if [ -f "$VIEJO/docs/95-guias-desarrollo/$doc" ]; then
        cp "$VIEJO/docs/95-guias-desarrollo/$doc" "$NUEVO/docs/95-guias-desarrollo/"
        echo "  ✅ $doc"
    fi
done

# PASO 4: Archivo root
echo "[PASO 4] Sincronizando archivo root..."
if [ -f "$VIEJO/PROMPT-AGENTE-PRODUCCION.md" ]; then
    cp "$VIEJO/PROMPT-AGENTE-PRODUCCION.md" "$NUEVO/"
    echo "  ✅ PROMPT-AGENTE-PRODUCCION.md"
fi

# PASO 5: Actualizar paths
echo "[PASO 5] Actualizando paths hardcodeados..."
sed -i 's|/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit|/home/isem/workspace/projects/gamilit|g' "$NUEVO/apps/database/scripts/fix-duplicate-triggers.sh" 2>/dev/null || true
sed -i 's|/home/isem/workspace/workspace-gamilit|/home/isem/workspace|g' "$NUEVO/scripts/migrate-missing-objects.sh" 2>/dev/null || true
echo "  ✅ Paths actualizados"

echo "=================================================="
echo "SINCRONIZACION COMPLETADA"
echo "Backup disponible en: $NUEVO/backups/pre-sync-$TIMESTAMP/"
echo "=================================================="
```

---

## 13. CHECKLIST POST-SINCRONIZACION

- [ ] Backup creado
- [ ] Scripts BD copiados (14 archivos)
- [ ] Config por ambiente copiado (3 archivos)
- [ ] Scripts produccion copiados (5 archivos)
- [ ] Documentacion copiada (7 archivos)
- [ ] PROMPT-AGENTE-PRODUCCION.md copiado
- [ ] Paths hardcodeados actualizados
- [ ] Permisos de ejecucion aplicados
- [ ] Sintaxis de scripts verificada
- [ ] Test en desarrollo ejecutado
- [ ] Commit y push realizado

---

## 14. SIGUIENTE PASO: FASE 4

La FASE 4 validara:
1. Que todos los archivos fueron copiados correctamente
2. Que las dependencias entre scripts estan satisfechas
3. Que no hay objetos faltantes
4. Que el agente de produccion puede ejecutar el flujo completo

---

**Estado:** FASE 3 COMPLETADA
**Siguiente:** FASE 4 - Validacion de Planeacion
**Mantenedor:** Requirements-Analyst
