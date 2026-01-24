# PLAN DE LIMPIEZA DE CARPETAS BACKUP

**Fecha:** 2025-11-23
**Agente:** Workspace-Manager
**Objetivo:** Limpiar workspace de carpetas backup (_old, _bckp)

---

## 📊 INVENTARIO DE CARPETAS BACKUP

| Carpeta | Tamaño | Estado | Acción |
|---------|--------|--------|--------|
| `orchestration_old/` | 22M | Estructura antigua | Archivar y eliminar |
| `orchestration_bckp/` | 5.9M | En migración | ⏳ ESPERAR migración |
| `docs_bkp/` | 11M | Backup docs anterior | Verificar y archivar |
| **TOTAL** | **39M** | - | **~8-12M comprimido** |

---

## 🗂️ ANÁLISIS DE CONTENIDO

### 1. orchestration_old/ (22M)

**Estructura:**
```
orchestration_old/
├── 01-analisis/
├── 02-planes/
├── 03-reportes/
├── 03-subagentes/
├── 04-inventarios/
├── 05-sprints/
├── 05-validaciones/
├── 06-indices/
├── 06-respaldos/
├── 07-quick-wins/
├── 08-resumen-sesiones/
├── 09-guias/
├── 10-matrices/
├── 11-deployment/
├── 12-usuarios/
├── backend/
├── database/
├── frontend/
├── handoffs/
├── integracion/
├── knowledge/
├── [muchos .md en raíz]
└── [scripts y HTML]
```

**Archivos críticos a preservar:**
- TRAZA-CORRECCIONES.md
- DATABASE_INVENTORY.yml
- EJEMPLO-INICIO-AGENTE-*.md
- PROMPT-AGENTES.md
- PROMPT-SUBAGENTES.md

**⚠️ Verificación necesaria:**
Antes de archivar, confirmar que estos archivos importantes ya están en `orchestration/` actual o docs/.

**Acción:** Archivar completo en .tar.gz

---

### 2. orchestration_bckp/ (5.9M)

**Estructura:**
```
orchestration_bckp/
├── 01-analisis/
├── 02-planes/
├── 04-logs/
├── 05-validaciones/
├── analisis/
├── analisis-requerimientos-bd/
├── code-correccion/
├── inventarios/
├── knowledge/
├── scripts/
├── scripts-correccion/
├── validaciones/
├── TRAZA-TAREAS-DATABASE.md (232KB) ⚠️ CRÍTICO
├── TRAZA-TAREAS-FRONTEND.md (142KB) ⚠️ CRÍTICO
├── TRAZA-TAREAS-BACKEND.md (53KB) ⚠️ CRÍTICO
├── ESTADO-*.json
└── [scripts Python]
```

**Archivos CRÍTICOS:**
- TRAZA-TAREAS-DATABASE.md (232KB)
- TRAZA-TAREAS-FRONTEND.md (142KB)
- TRAZA-TAREAS-BACKEND.md (53KB)
- ESTADO-DATABASE.json
- ESTADO-FRONTEND.json
- ESTADO-BACKEND.json

**⚠️ IMPORTANTE:**
- Otro agente está migrando contenido a orchestration/
- NO ELIMINAR hasta confirmar migración completa
- Verificar que trazas estén en orchestration/trazas/

**Acción:** ⏳ ESPERAR + Archivar después de migración

---

### 3. docs_bkp/ (11M)

**Estructura:**
```
docs_bkp/
├── 00-overview/
├── 01-requerimientos/
├── 02-especificaciones-tecnicas/
├── 03-desarrollo/
├── 04-planificacion/
├── 05-implementacion/
├── adr/
├── modules/
├── scripts/
├── QUICK-REFERENCE/
├── _registry/
├── INDICE-MAESTRO.md
├── BLUEPRINT-ESTRUCTURA-MODULAR.md
└── [reportes varios]
```

**Contenido:**
- Backup de estructura anterior de docs/
- ADRs antiguos
- Módulos documentados
- Reportes de validación

**Verificación necesaria:**
- Comparar con docs/ actual
- Verificar que ADRs importantes estén migrados
- Verificar que documentación de módulos esté actualizada

**Acción:** Verificar + Archivar

---

## 📋 PLAN DE EJECUCIÓN

### PREREQUISITOS

1. **Crear carpetas de archivos**
```bash
mkdir -p orchestration/.archive
mkdir -p docs/.archive
```

2. **Verificar espacio disponible**
```bash
df -h .
# Verificar que hay al menos 50M disponibles para archivos .tar.gz
```

---

### FASE 1: orchestration_old/ (INMEDIATO)

**1.1. Verificación Pre-Archivado**
```bash
# Verificar que archivos importantes están en orchestration/ actual
cd orchestration_old

# Verificar EJEMPLO-INICIO-AGENTE-*.md
ls -la EJEMPLO-INICIO-AGENTE-*.md
# Verificar que existen en orchestration/ actual

# Verificar PROMPT-*.md
ls -la PROMPT-*.md
# Verificar que existen en orchestration/prompts/

# Verificar trazas
ls -la TRAZA-*.md
# Verificar que están en orchestration/trazas/

cd ..
```

**1.2. Crear archivo comprimido**
```bash
tar -czf orchestration/.archive/backup-orchestration-old-20251123.tar.gz orchestration_old/
```

**1.3. Verificar archivo creado**
```bash
ls -lh orchestration/.archive/backup-orchestration-old-20251123.tar.gz
tar -tzf orchestration/.archive/backup-orchestration-old-20251123.tar.gz | head -20
```

**1.4. Eliminar carpeta original**
```bash
rm -rf orchestration_old/
```

**1.5. Verificar eliminación**
```bash
ls -la | grep orchestration_old
# No debe devolver nada
```

**Criterio de éxito:**
- ✅ Archivo .tar.gz creado (~3-5M)
- ✅ Carpeta orchestration_old/ eliminada
- ✅ Espacio liberado: ~22M

---

### FASE 2: docs_bkp/ (DESPUÉS DE FASE 1)

**2.1. Verificación Pre-Archivado**
```bash
# Comparar ADRs
diff -r docs_bkp/adr/ docs/adr/ 2>/dev/null | head -20

# Comparar módulos
diff -r docs_bkp/modules/ docs/modules/ 2>/dev/null | head -20

# Listar archivos únicos en docs_bkp que no están en docs
comm -23 \
  <(find docs_bkp -name "*.md" -exec basename {} \; | sort -u) \
  <(find docs -name "*.md" -exec basename {} \; | sort -u)
```

**2.2. Crear archivo comprimido**
```bash
tar -czf docs/.archive/backup-docs-20251123.tar.gz docs_bkp/
```

**2.3. Verificar archivo creado**
```bash
ls -lh docs/.archive/backup-docs-20251123.tar.gz
```

**2.4. Eliminar carpeta original**
```bash
rm -rf docs_bkp/
```

**Criterio de éxito:**
- ✅ Archivo .tar.gz creado (~2-3M)
- ✅ Carpeta docs_bkp/ eliminada
- ✅ Espacio liberado: ~11M

---

### FASE 3: orchestration_bckp/ (⏳ DESPUÉS DE MIGRACIÓN)

**⚠️ IMPORTANTE:** Solo ejecutar después de que agente paralelo confirme migración completa

**3.1. Verificación de Migración Completa**
```bash
# Verificar que trazas críticas están en orchestration/trazas/
ls -lh orchestration/trazas/ | grep TRAZA-TAREAS

# Debe mostrar:
# TRAZA-TAREAS-DATABASE.md
# TRAZA-TAREAS-FRONTEND.md
# TRAZA-TAREAS-BACKEND.md

# Comparar tamaños (deben ser similares)
ls -lh orchestration_bckp/TRAZA-TAREAS-DATABASE.md
ls -lh orchestration/trazas/TRAZA-TAREAS-DATABASE.md
```

**3.2. Verificar estados migrados**
```bash
# Verificar que archivos ESTADO-*.json están en orchestration/estados/
ls -la orchestration/estados/ESTADO-*.json
```

**3.3. Crear archivo comprimido** (solo si verificación OK)
```bash
tar -czf orchestration/.archive/backup-orchestration-bckp-20251123.tar.gz orchestration_bckp/
```

**3.4. Verificar archivo creado**
```bash
ls -lh orchestration/.archive/backup-orchestration-bckp-20251123.tar.gz
```

**3.5. Eliminar carpeta original**
```bash
rm -rf orchestration_bckp/
```

**Criterio de éxito:**
- ✅ Migración verificada
- ✅ Archivo .tar.gz creado (~1-2M)
- ✅ Carpeta orchestration_bckp/ eliminada
- ✅ Espacio liberado: ~5.9M

---

## ✅ VALIDACIÓN FINAL

Después de completar todas las fases:

```bash
# 1. Verificar que carpetas backup no existen
ls -la | grep -E "_old|_bckp|_bkp"
# No debe devolver nada

# 2. Verificar archivos comprimidos creados
ls -lh orchestration/.archive/
ls -lh docs/.archive/

# 3. Verificar que archivos .tar.gz no están en git
git status | grep -E "\.tar\.gz"
# No debe devolver nada (deben estar ignorados)

# 4. Verificar espacio liberado
du -sh orchestration/ docs/
# Debe mostrar reducción significativa

# 5. Verificar que proyecto compila
pnpm build
# Debe completar sin errores
```

---

## 📊 RESULTADOS ESPERADOS

### Espacio en Disco:

| Métrica | Antes | Después | Ganancia |
|---------|-------|---------|----------|
| orchestration_old/ | 22M | 0 (archivado ~4M) | ~18M |
| orchestration_bckp/ | 5.9M | 0 (archivado ~1.5M) | ~4.4M |
| docs_bkp/ | 11M | 0 (archivado ~2.5M) | ~8.5M |
| **TOTAL** | **39M** | **~8M** | **~31M** |

### Workspace:

| Métrica | Antes | Después |
|---------|-------|---------|
| Carpetas backup en raíz | 3 | 0 |
| Archivos .tar.gz | 0 | 3 (ignorados) |
| Workspace limpio | ❌ | ✅ |

---

## 🔄 ROLLBACK (Si es necesario)

Si se necesita recuperar contenido:

```bash
# Extraer orchestration_old/
tar -xzf orchestration/.archive/backup-orchestration-old-20251123.tar.gz

# Extraer orchestration_bckp/
tar -xzf orchestration/.archive/backup-orchestration-bckp-20251123.tar.gz

# Extraer docs_bkp/
tar -xzf docs/.archive/backup-docs-20251123.tar.gz
```

---

## 📝 CHECKLIST DE EJECUCIÓN

### FASE 1: orchestration_old/
- [ ] Verificar archivos importantes en orchestration/ actual
- [ ] Crear orchestration/.archive/
- [ ] Crear backup-orchestration-old-20251123.tar.gz
- [ ] Verificar archivo .tar.gz (listar contenido)
- [ ] Eliminar orchestration_old/
- [ ] Validar que proyecto compila

### FASE 2: docs_bkp/
- [ ] Verificar contenido vs docs/ actual
- [ ] Crear docs/.archive/
- [ ] Crear backup-docs-20251123.tar.gz
- [ ] Verificar archivo .tar.gz
- [ ] Eliminar docs_bkp/
- [ ] Validar que proyecto compila

### FASE 3: orchestration_bckp/
- [ ] ⏳ Esperar confirmación de agente paralelo
- [ ] Verificar trazas en orchestration/trazas/
- [ ] Verificar estados en orchestration/estados/
- [ ] Crear backup-orchestration-bckp-20251123.tar.gz
- [ ] Verificar archivo .tar.gz
- [ ] Eliminar orchestration_bckp/
- [ ] Validar que proyecto compila

### VALIDACIÓN FINAL:
- [ ] No hay carpetas _old, _bckp en workspace
- [ ] Archivos .tar.gz creados y verificados
- [ ] Git no trackea archivos .tar.gz
- [ ] Proyecto compila correctamente
- [ ] Tests pasan (si aplica)

---

**Estado:** Listo para ejecutar FASE 1 y FASE 2
**Requiere:** Confirmación de migración para FASE 3
**Tiempo estimado:** 5-10 minutos por fase
**Riesgo:** Bajo (archivos respaldados en .tar.gz)
