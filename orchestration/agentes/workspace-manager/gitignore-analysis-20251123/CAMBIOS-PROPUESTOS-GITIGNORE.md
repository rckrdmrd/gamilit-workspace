# CAMBIOS PROPUESTOS AL .gitignore

**Fecha:** 2025-11-23
**Agente:** Workspace-Manager
**Objetivo:** Permitir que orchestration/ esté en repo para Claude Code cloud

---

## CAMBIO 1: Eliminar línea 194 que ignora orchestration/

**Ubicación:** Línea 194
**Acción:** REEMPLAZAR

### ANTES (líneas 192-194):
```gitignore
# === ORCHESTRATION ===
# Archivos generados por agentes/subagentes (análisis, reportes, planes)
orchestration/
```

### DESPUÉS:
```gitignore
# === ORCHESTRATION ===
# IMPORTANTE: orchestration/ DEBE estar en el repo para Claude Code cloud
# Contiene: prompts, directivas, trazas, inventarios, templates
# Solo ignorar archivos comprimidos y temporales dentro de orchestration/
orchestration/.archive/
orchestration/.tmp/
orchestration/**/*.tmp
orchestration/**/*.cache
```

---

## CAMBIO 2: Agregar patrones para carpetas backup

**Ubicación:** Después de línea 227 (sección MISC - Backups)
**Acción:** AGREGAR

### ANTES (líneas 224-234):
```gitignore
# === MISC ===
# Backups
*.backup
*.bak
*.old

# Compressed files (si no son assets del proyecto)
*.zip
*.tar.gz
*.rar
!assets/**/*.zip
```

### DESPUÉS:
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

# Backups específicos (temporal mientras se archivan)
orchestration_old/
orchestration_bckp/
docs_bkp/

# Compressed files (si no son assets del proyecto)
*.zip
*.tar.gz
*.rar
!assets/**/*.zip
```

---

## RESUMEN DE CAMBIOS

1. **orchestration/** - DE ignorado → A incluido en repo
2. **orchestration/.archive/** - Agregado como ignorado
3. **orchestration/.tmp/** - Agregado como ignorado
4. **Carpetas *_old/, *_bckp/, etc.** - Agregadas como ignoradas
5. **orchestration_old/, orchestration_bckp/, docs_bkp/** - Agregadas temporalmente

---

## INSTRUCCIONES DE APLICACIÓN

### Opción A: Edición Manual
1. Abrir `.gitignore` en editor
2. Ir a línea 194
3. Reemplazar las 3 líneas (192-194) con el nuevo contenido del CAMBIO 1
4. Ir a línea 227
5. Insertar las líneas del CAMBIO 2 después de `*.old`
6. Guardar archivo

### Opción B: Usar Edit tool
Se puede aplicar automáticamente con el Edit tool de Claude Code

---

## VALIDACIÓN POST-CAMBIO

Después de aplicar cambios, ejecutar:

```bash
# Verificar que orchestration/ ya no está ignorado
git check-ignore orchestration/prompts/
# Debe devolver: (vacío - no ignorado)

# Verificar que .archive/ SÍ está ignorado
git check-ignore orchestration/.archive/
# Debe devolver: orchestration/.archive/

# Verificar que carpetas backup están ignoradas
git check-ignore orchestration_old/
# Debe devolver: orchestration_old/

# Ver archivos de orchestration que se agregarán
git status orchestration/
# Debe mostrar ~38 archivos nuevos
```

---

## IMPACTO ESPERADO

**Antes:**
- `git ls-files orchestration/ | wc -l` → 1

**Después:**
- `git ls-files orchestration/ | wc -l` → ~39

---

**Listo para aplicar:** ✅
**Requiere revisión:** Sí
**Impacto en build:** Ninguno
**Impacto en tests:** Ninguno
