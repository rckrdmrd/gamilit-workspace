# DIRECTIVA: GESTIÓN DE BACKUPS Y CONFIGURACIÓN DE .gitignore

**Proyecto:** GAMILIT - Sistema de Gamificación Educativa
**Versión:** 1.0.0
**Fecha:** 2025-11-23
**Ámbito:** Workspace-Manager (responsable principal), Todos los agentes (cumplimiento)
**Tipo:** Directiva Obligatoria - Estándar de Buenas Prácticas
**Estado:** VIGENTE

---

## 🎯 PROPÓSITO

Establecer estándares obligatorios para la gestión de carpetas backup y configuración del archivo `.gitignore` que permitan:

- **Workspace limpio** libre de carpetas backup no gestionadas
- **Repositorio optimizado** sin archivos temporales o backups obsoletos
- **Sincronización correcta** de archivos necesarios para Claude Code cloud
- **Prevención de contaminación** del repositorio con archivos no deseados
- **Trazabilidad** de archivos backup archivados

---

## 📋 PRINCIPIOS FUNDAMENTALES

### 1. orchestration/ SIEMPRE en Repositorio

```yaml
REGLA CRÍTICA: orchestration/ DEBE estar versionado

Razón:
  - Claude Code en cloud requiere acceso a prompts, directivas, trazas
  - Agentes especializados necesitan sus definiciones
  - Inventarios y estados deben sincronizarse entre instancias
  - Templates y estándares compartidos entre equipo

Excepciones permitidas (ignorar subcarpetas):
  - orchestration/.archive/     # Backups comprimidos
  - orchestration/.tmp/          # Archivos temporales
  - orchestration/**/*.tmp       # Archivos temporales de agentes
  - orchestration/**/*.cache     # Archivos de cache
```

### 1.5. reference/ (Código de Referencia) SIEMPRE en Repositorio

```yaml
REGLA CRÍTICA: reference/ DEBE estar versionado

Propósito:
  - Contiene proyectos de referencia para análisis y desarrollo
  - Architecture-Analyst lo usa para análisis de implementaciones
  - Agentes de desarrollo lo usan como referencia
  - Claude Code en cloud necesita acceso para comparaciones

Contenido típico:
  - Proyectos completos de referencia
  - Implementaciones de patrones
  - Ejemplos de arquitectura
  - Código base para comparaciones

Excepciones CRÍTICAS (ignorar dentro de reference/):
  - reference/**/node_modules/  # Dependencias (pueden reinstalarse)
  - reference/**/dist/           # Build outputs
  - reference/**/build/          # Build outputs
  - reference/**/.next/          # Next.js build
  - reference/**/.nuxt/          # Nuxt build
  - reference/**/coverage/       # Test coverage
  - reference/**/.turbo/         # Turbo cache
  - reference/**/.nx/            # NX cache
  - reference/**/out/            # Output folders
  - reference/**/*.log           # Logs
  - reference/**/*.tmp           # Temporales
  - reference/**/*.cache         # Cache
  - reference/**/.DS_Store       # OS files

Razón de excepciones:
  - Solo versionar código fuente, NO builds ni dependencias
  - Reducir tamaño del repositorio significativamente
  - Dependencias pueden reinstalarse con npm/pnpm install
  - Builds pueden regenerarse
```

### 2. Carpetas Backup SIEMPRE Ignoradas

```yaml
REGLA: Todas las carpetas backup deben estar en .gitignore

Patrones obligatorios:
  - *_old/         # Carpetas con sufijo _old
  - *_bckp/        # Carpetas con sufijo _bckp
  - *_bkp/         # Carpetas con sufijo _bkp
  - *_backup/      # Carpetas con sufijo _backup
  - *.old/         # Carpetas con extensión .old
  - *.bak/         # Carpetas con extensión .bak
  - *.backup/      # Carpetas con extensión .backup

Razón:
  - Evitar commits accidentales de backups
  - Mantener repositorio limpio
  - Reducir tamaño del repositorio
  - Evitar confusión entre versiones
```

### 3. Archivos Comprimidos de Backup Ignorados

```yaml
REGLA: Archivos .tar.gz, .zip de backups no se versionan

Excepción:
  - assets/**/*.zip  # Assets del proyecto permitidos

Razón:
  - Backups son locales, no parte del código fuente
  - Tamaño excesivo para versionamiento
  - Git no maneja bien archivos binarios grandes
```

---

## 🔧 CONFIGURACIÓN OBLIGATORIA DE .gitignore

### Sección 1: ORCHESTRATION (Líneas 192-199)

**Estado requerido:**

```gitignore
# === ORCHESTRATION ===
# IMPORTANTE: orchestration/ DEBE estar en el repo para Claude Code cloud
# Contiene: prompts, directivas, trazas, inventarios, templates
# Solo ignorar subcarpetas temporales específicas y archivos comprimidos
orchestration/.archive/
orchestration/.tmp/
orchestration/**/*.tmp
orchestration/**/*.cache
```

**Validación:**

```bash
# orchestration/ NO debe estar ignorado
git check-ignore orchestration/prompts/
# Debe devolver: (vacío - exit code 1)

# .archive SÍ debe estar ignorado
git check-ignore orchestration/.archive/
# Debe devolver: orchestration/.archive/
```

---

### Sección 1.5: REFERENCE (Código de Referencia) - NUEVA

**Estado requerido:**

```gitignore
# === REFERENCE (Código de Referencia) ===
# IMPORTANTE: reference/ DEBE estar en el repo para Claude Code cloud
# Contiene: proyectos de referencia para análisis y desarrollo
# Ignorar solo carpetas de build/dependencias dentro de reference/
reference/**/node_modules/
reference/**/dist/
reference/**/build/
reference/**/.next/
reference/**/.nuxt/
reference/**/coverage/
reference/**/.turbo/
reference/**/.nx/
reference/**/out/
reference/**/*.log
reference/**/*.tmp
reference/**/*.cache
reference/**/.DS_Store
```

**Validación:**

```bash
# reference/ NO debe estar ignorado
git check-ignore reference/
# Debe devolver: (vacío - exit code 1)

# node_modules dentro de reference/ SÍ debe estar ignorado
mkdir -p reference/ejemplo-proyecto/node_modules
git check-ignore reference/ejemplo-proyecto/node_modules/
# Debe devolver: reference/ejemplo-proyecto/node_modules/

# dist dentro de reference/ SÍ debe estar ignorado
git check-ignore reference/ejemplo-proyecto/dist/
# Debe devolver: reference/ejemplo-proyecto/dist/
```

**❌ PROHIBIDO:**

```gitignore
# ❌ NO HACER ESTO:
reference/    # Ignora toda la carpeta (error crítico)

# ❌ TAMPOCO HACER ESTO:
# No ignorar node_modules dentro de reference (contamina repo)
```

---

### Sección 2: BACKUPS (Después de línea 228)

**Estado requerido:**

```gitignore
# === MISC ===
# Backups - Archivos
*.backup
*.bak
*.old

# Backups - Carpetas
*_old/
*_bckp/
*_bkp/
*_backup/
*.old/
*.bak/
*.backup/

# Backups específicos (carpetas identificadas en workspace)
# Nota: Estos pueden ser específicos del proyecto y eliminarse cuando ya no existan
orchestration_old/
orchestration_bckp/
docs_bkp/

# Compressed files (si no son assets del proyecto)
*.zip
*.tar.gz
*.rar
!assets/**/*.zip
```

**Validación:**

```bash
# Carpetas backup deben estar ignoradas
git check-ignore orchestration_old/
git check-ignore docs_bkp/
git check-ignore cualquier_carpeta_old/
# Todas deben devolver el nombre de la carpeta (ignoradas)
```

---

## 📂 NOMENCLATURA ESTÁNDAR DE BACKUPS

### Nomenclatura de Carpetas Backup

```yaml
Formato permitido:
  - {nombre}_old/          # Versión antigua completa
  - {nombre}_bckp/         # Backup temporal
  - {nombre}_bkp/          # Backup temporal (abreviado)
  - {nombre}_backup/       # Backup explícito
  - {nombre}.old/          # Versión antigua (menos común)

Ejemplos válidos:
  ✅ orchestration_old/
  ✅ docs_bckp/
  ✅ components_backup/
  ✅ scripts_old/

Ejemplos NO válidos:
  ❌ orchestration-old/    # Usar _ no -
  ❌ old_orchestration/    # Sufijo debe ir al final
  ❌ orchestration.backup/ # Preferir _backup sobre .backup
  ❌ orch_old/             # No abreviar nombre base
```

### Nomenclatura de Archivos Comprimidos

```yaml
Formato de archivos .tar.gz para backups archivados:

  backup-{nombre}-{YYYYMMDD}.tar.gz

Ejemplos:
  ✅ backup-orchestration-old-20251123.tar.gz
  ✅ backup-docs-20251123.tar.gz
  ✅ backup-components-20251201.tar.gz

Ubicación:
  - orchestration/.archive/backup-*.tar.gz
  - docs/.archive/backup-*.tar.gz
  - {modulo}/.archive/backup-*.tar.gz

⚠️ Las carpetas .archive/ DEBEN estar en .gitignore
```

---

## 🔄 WORKFLOW DE GESTIÓN DE BACKUPS

### Paso 1: Detección de Carpetas Backup

**Responsable:** Workspace-Manager (ejecución semanal o bajo demanda)

```bash
# Escanear workspace buscando carpetas backup
find . -maxdepth 3 -type d \( \
  -name "*_old" -o \
  -name "*_bckp" -o \
  -name "*_bkp" -o \
  -name "*_backup" -o \
  -name "*.old" -o \
  -name "*.bak" \
) ! -path "*/node_modules/*" ! -path "*/.git/*"

# Verificar tamaño
du -sh *_old *_bckp *_bkp *_backup 2>/dev/null
```

**Criterio de acción:**
- Si se encuentran carpetas backup → Ejecutar flujo de archivado

---

### Paso 2: Análisis de Contenido

**Antes de archivar, verificar:**

```markdown
1. ¿El contenido ya está migrado a ubicación correcta?
2. ¿Hay archivos críticos que aún no se han movido?
3. ¿Cuánto espacio se liberará?
4. ¿Cuánto espacio ocupará el archivo comprimido?
5. ¿La carpeta está en .gitignore?
```

**Generar reporte:**
```bash
# Listar archivos importantes en backup
find orchestration_old/ -name "*.md" -o -name "*.yml" -o -name "*.json" | \
  while read file; do
    echo "$file - $(wc -l < "$file") líneas"
  done

# Comparar con carpeta actual
diff -qr orchestration_old/ orchestration/ | grep "Only in orchestration_old"
```

---

### Paso 3: Archivado

**Crear carpeta .archive si no existe:**

```bash
mkdir -p orchestration/.archive
mkdir -p docs/.archive
mkdir -p {modulo}/.archive
```

**Comprimir carpeta backup:**

```bash
# Formato: backup-{nombre}-{YYYYMMDD}.tar.gz
tar -czf orchestration/.archive/backup-orchestration-old-20251123.tar.gz orchestration_old/
```

**Verificar archivo creado:**

```bash
# Ver tamaño
ls -lh orchestration/.archive/backup-orchestration-old-20251123.tar.gz

# Listar primeros 20 archivos
tar -tzf orchestration/.archive/backup-orchestration-old-20251123.tar.gz | head -20

# Verificar integridad
tar -tzf orchestration/.archive/backup-orchestration-old-20251123.tar.gz > /dev/null
echo $?  # Debe ser 0 (éxito)
```

---

### Paso 4: Eliminación de Carpeta Original

**Solo después de verificar archivo .tar.gz:**

```bash
# Eliminar carpeta original
rm -rf orchestration_old/

# Verificar eliminación
ls -la | grep orchestration_old
# No debe devolver nada
```

---

### Paso 5: Documentación

**Actualizar traza:**

```markdown
## [WORKSPACE-CLEANUP-001] Archivado de orchestration_old/

**Fecha:** 2025-11-23
**Agente:** Workspace-Manager
**Acción:** Archivado y eliminación

**Detalles:**
- Carpeta original: orchestration_old/ (22M)
- Archivo creado: orchestration/.archive/backup-orchestration-old-20251123.tar.gz (4.2M)
- Espacio liberado: 17.8M
- Contenido verificado: ✅ Migrado a orchestration/
- Integridad archivo: ✅ Verificada

**Recuperación (si es necesario):**
```bash
tar -xzf orchestration/.archive/backup-orchestration-old-20251123.tar.gz
```
```

**Actualizar TRAZA-WORKSPACE-MANAGEMENT.md:**

```yaml
- id: WORKSPACE-CLEANUP-001
  fecha: 2025-11-23
  tipo: archivado_backup
  carpeta_original: orchestration_old/
  archivo_backup: orchestration/.archive/backup-orchestration-old-20251123.tar.gz
  tamaño_original: 22M
  tamaño_comprimido: 4.2M
  espacio_liberado: 17.8M
  estado: completado
```

---

## 🚫 PROHIBICIONES

### Carpetas que NO Deben Estar en Workspace

```yaml
❌ PROHIBIDO tener estas carpetas en raíz o módulos:
  - orchestration_old/
  - docs_bkp/
  - src_backup/
  - components_old/
  - pages_bkp/
  - utils_backup/
  - Cualquier carpeta con sufijos: _old, _bckp, _backup, _bkp

Acción si se encuentran:
  1. Verificar contenido
  2. Migrar archivos valiosos
  3. Archivar en .tar.gz
  4. Eliminar carpeta original
  5. Verificar que está en .gitignore
```

### Archivos que NO Deben Commitearse

```yaml
❌ NUNCA commitear:
  - Archivos .tar.gz de backups
  - Carpetas *_old/, *_bckp/
  - Archivos temporales: *.tmp, *.cache
  - Logs: *.log (excepto en carpeta logs/ si es necesario)
  - Node modules: node_modules/
  - Archivos de build: dist/, build/
  - Archivos de OS: .DS_Store, Thumbs.db

Validación pre-commit:
  - Revisar git status
  - Verificar que ningún archivo backup está staged
```

---

## ✅ CHECKLIST DE VALIDACIÓN

### Para Workspace-Manager (Semanal)

```markdown
- [ ] Escanear workspace buscando carpetas backup
- [ ] Verificar que .gitignore tiene patrones de backup
- [ ] Verificar que orchestration/ NO está ignorado
- [ ] Verificar que carpetas .archive/ SÍ están ignoradas
- [ ] Si hay carpetas backup:
  - [ ] Analizar contenido
  - [ ] Verificar si contenido está migrado
  - [ ] Archivar en .tar.gz
  - [ ] Verificar integridad del archivo
  - [ ] Eliminar carpeta original
  - [ ] Documentar en traza
- [ ] Ejecutar validación final
```

### Para Todos los Agentes (Antes de Commit)

```markdown
- [ ] ¿Creé alguna carpeta backup? → Verificar que está en .gitignore
- [ ] ¿Modifiqué orchestration/? → Verificar que NO está ignorado
- [ ] ¿Agregué archivos .tmp o .cache? → Verificar que están ignorados
- [ ] git status no muestra archivos backup
- [ ] git status no muestra archivos .tar.gz
```

---

## 🔍 VALIDACIONES AUTOMÁTICAS

### Script de Validación .gitignore

```bash
#!/bin/bash
# orchestration/scripts/validate-gitignore.sh

echo "=== VALIDACIÓN DE .gitignore ==="
echo ""

# 1. Verificar que orchestration/ NO está ignorado
echo "1. Verificando orchestration/..."
if git check-ignore -q orchestration/prompts/; then
    echo "❌ ERROR: orchestration/ está ignorado"
    exit 1
else
    echo "✅ orchestration/ NO está ignorado (correcto)"
fi

# 2. Verificar que .archive/ SÍ está ignorado
echo "2. Verificando orchestration/.archive/..."
if git check-ignore -q orchestration/.archive/; then
    echo "✅ orchestration/.archive/ está ignorado (correcto)"
else
    echo "❌ ERROR: orchestration/.archive/ NO está ignorado"
    exit 1
fi

# 3. Verificar patrones de carpetas backup
echo "3. Verificando patrones de backup..."
test_dirs=("test_old" "test_bckp" "test_backup")
for dir in "${test_dirs[@]}"; do
    mkdir -p "$dir"
    if git check-ignore -q "$dir/"; then
        echo "✅ Patrón ${dir}/ funciona"
        rm -rf "$dir"
    else
        echo "❌ ERROR: Patrón ${dir}/ NO funciona"
        rm -rf "$dir"
        exit 1
    fi
done

# 4. Buscar carpetas backup en workspace
echo "4. Buscando carpetas backup en workspace..."
backup_dirs=$(find . -maxdepth 3 -type d \( \
    -name "*_old" -o -name "*_bckp" -o -name "*_bkp" -o -name "*_backup" \
\) ! -path "*/node_modules/*" ! -path "*/.git/*")

if [ -n "$backup_dirs" ]; then
    echo "⚠️  ADVERTENCIA: Carpetas backup encontradas:"
    echo "$backup_dirs"
else
    echo "✅ No hay carpetas backup en workspace"
fi

echo ""
echo "=== VALIDACIÓN COMPLETADA ==="
```

---

## 📊 MÉTRICAS Y REPORTES

### Reporte de Limpieza Semanal

```markdown
## Reporte de Limpieza Workspace - {FECHA}

### Carpetas Backup Encontradas:
- orchestration_old/ (22M)
- docs_bkp/ (11M)

### Acciones Tomadas:
- ✅ orchestration_old/ → archivado (4.2M comprimido)
- ✅ docs_bkp/ → archivado (2.8M comprimido)

### Espacio Liberado:
- Original: 33M
- Comprimido: 7M
- **Liberado: 26M**

### Archivos Creados:
- orchestration/.archive/backup-orchestration-old-20251123.tar.gz
- docs/.archive/backup-docs-20251123.tar.gz

### Validaciones:
- ✅ .gitignore actualizado
- ✅ orchestration/ en repositorio
- ✅ Carpetas backup ignoradas
- ✅ Archivos comprimidos ignorados
```

---

## 🎓 EJEMPLOS COMPLETOS

### Ejemplo 1: Nueva Carpeta Backup Detectada

**Situación:** Se creó `components_old/` durante refactorización

**Acción correcta:**

```bash
# 1. Verificar que está en .gitignore
git check-ignore components_old/
# Debe devolver: components_old/ (ignorado por patrón *_old/)

# 2. Verificar contenido vs versión actual
diff -qr components_old/ src/components/

# 3. Si contenido ya migrado, archivar
mkdir -p .archive
tar -czf .archive/backup-components-old-20251123.tar.gz components_old/

# 4. Verificar archivo
ls -lh .archive/backup-components-old-20251123.tar.gz

# 5. Eliminar carpeta
rm -rf components_old/

# 6. Documentar
echo "Archivado components_old/ - 15M → 3.2M" >> WORKSPACE-CLEANUP.log
```

---

### Ejemplo 2: orchestration/ Accidentalmente Ignorado

**Síntoma:** Cambios en orchestration/ no aparecen en `git status`

**Diagnóstico:**

```bash
git check-ignore -v orchestration/prompts/PROMPT-WORKSPACE-MANAGER.md
# Output: .gitignore:194:orchestration/  orchestration/prompts/...
```

**Corrección:**

```bash
# 1. Editar .gitignore - Eliminar línea 194: orchestration/
vim .gitignore

# 2. Agregar excepciones específicas
# orchestration/.archive/
# orchestration/.tmp/

# 3. Verificar corrección
git check-ignore orchestration/prompts/
# Debe devolver: (vacío - no ignorado)

# 4. Agregar orchestration/ al repo
git add orchestration/
git commit -m "fix: incluir orchestration/ en repo para Claude Code cloud"
```

---

### Ejemplo 3: Limpieza Completa de Workspace

**Ejecutar script interactivo:**

```bash
# Usar script creado por workspace-manager
orchestration/agentes/workspace-manager/gitignore-analysis-20251123/scripts-limpieza.sh

# Menú:
# 0. Prerequisitos
# 1. Archivar orchestration_old/
# 2. Archivar docs_bkp/
# 3. Validación Final
```

---

## 📚 REFERENCIAS

### Documentación Relacionada

- [PROMPT-WORKSPACE-MANAGER.md](../prompts/PROMPT-WORKSPACE-MANAGER.md) - Responsabilidades del agente
- [DIRECTIVA-CONTROL-VERSIONES.md](./DIRECTIVA-CONTROL-VERSIONES.md) - Estrategia de commits
- [DIRECTIVA-DOCUMENTACION-OBLIGATORIA.md](./DIRECTIVA-DOCUMENTACION-OBLIGATORIA.md) - Documentación requerida
- [ESTANDARES-NOMENCLATURA.md](./ESTANDARES-NOMENCLATURA.md) - Estándares de nombres

### Git Ignore Patterns

- [gitignore documentation](https://git-scm.com/docs/gitignore)
- [gitignore.io](https://www.toptal.com/developers/gitignore) - Generador de .gitignore

---

## 🔄 POLÍTICA DE REVISIÓN

### Frecuencia de Revisión

```yaml
Revisión de .gitignore:
  - Al agregar nuevos módulos
  - Al detectar archivos no deseados en commits
  - Cada 3 meses (mínimo)

Limpieza de backups:
  - Semanal (escaneo automático)
  - Mensual (archivado de backups > 30 días)
  - Trimestral (eliminación de archivos .tar.gz > 90 días)
```

### Proceso de Actualización

```yaml
Al agregar nuevos patrones a .gitignore:
  1. Documentar razón del nuevo patrón
  2. Agregar comentario explicativo en .gitignore
  3. Actualizar esta directiva si es patrón importante
  4. Notificar a equipo si afecta workflow
  5. Commit con mensaje descriptivo
```

---

## ✅ CRITERIOS DE ÉXITO

### Workspace Limpio

```markdown
✅ Workspace considerado limpio cuando:
- [ ] No hay carpetas *_old/, *_bckp/, *_backup/ en raíz o módulos
- [ ] orchestration/ está completamente versionado
- [ ] Carpetas .archive/ están ignoradas
- [ ] No hay archivos .tmp, .cache commiteados
- [ ] git status no muestra archivos backup
```

### .gitignore Correcto

```markdown
✅ .gitignore considerado correcto cuando:
- [ ] orchestration/ NO está en .gitignore
- [ ] orchestration/.archive/ SÍ está en .gitignore
- [ ] orchestration/.tmp/ SÍ está en .gitignore
- [ ] Patrones *_old/, *_bckp/ están presentes
- [ ] Validación automática pasa (exit code 0)
```

---

**Versión:** 1.0.0
**Fecha:** 2025-11-23
**Próxima revisión:** 2026-02-23 (3 meses)
**Responsable:** Workspace-Manager
**Aprobado por:** Tech Lead
