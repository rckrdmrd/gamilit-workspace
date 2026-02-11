# SIMCO-SYNC-WORKSPACE - Protocolo de Sincronización Multi-Ambiente

**Versión:** 1.0.0
**Fecha:** 2026-01-20
**Aplica a:** Todos los agentes (Claude, Gemini, Windsurf)
**Ambientes:** 3 instancias paralelas

---

## Resumen Ejecutivo

Este protocolo define el procedimiento ÚNICO y OBLIGATORIO para sincronizar el workspace en cualquier ambiente. Diseñado para evitar conflictos de "upload-pack: not our ref" y pérdida de trabajo.

---

## Arquitectura del Workspace

```
workspace-v2 (Nivel 0)
    │
    ├── projects/ (17 proyectos - Nivel 1)
    │   ├── erp-core/
    │   │   ├── backend/      (Nivel 2)
    │   │   ├── database/     (Nivel 2)
    │   │   └── frontend/     (Nivel 2)
    │   ├── erp-construccion/
    │   │   ├── backend/
    │   │   ├── database/
    │   │   └── frontend/
    │   └── ... (15 proyectos más)
    │
    └── Total: 1 + 17 + 61 = 79 repositorios
```

---

## PROTOCOLO DE SINCRONIZACIÓN COMPLETA

### FASE 1: Preparación (OBLIGATORIA)

```bash
cd /home/isem/workspace-v2

# 1.1 Guardar trabajo local no commiteado (si existe)
git stash --include-untracked

# 1.2 Verificar que no hay operaciones git en progreso
git status
# Si dice "rebase in progress" o similar, resolver primero
```

### FASE 2: Sincronización Nivel 0 (Workspace)

```bash
# 2.1 Fetch del workspace
git fetch origin

# 2.2 Verificar diferencias con remoto
echo "=== Commits en remoto que no tengo ==="
git log HEAD..origin/main --oneline

echo "=== Commits locales que no están en remoto ==="
git log origin/main..HEAD --oneline

# 2.3 Decisión de sincronización
# Si SOLO hay commits remotos (caso normal):
git pull origin main

# Si hay commits en AMBOS lados (conflicto):
# DETENER y evaluar manualmente qué mantener
```

### FASE 3: Sincronización Nivel 1 (Proyectos)

```bash
# 3.1 Actualizar referencias de submodulos según workspace
git submodule update --init

# 3.2 Para cada proyecto, sincronizar con su remoto
for project in projects/*/; do
    echo "=== Sincronizando: $project ==="
    cd "$project"

    # Determinar branch principal
    branch=$(git symbolic-ref refs/remotes/origin/HEAD 2>/dev/null | sed 's@^refs/remotes/origin/@@' || echo "main")

    # Fetch y verificar estado
    git fetch origin

    local_commit=$(git rev-parse HEAD)
    remote_commit=$(git rev-parse origin/$branch 2>/dev/null)

    if [ "$local_commit" != "$remote_commit" ]; then
        echo "  Diferencia detectada - actualizando..."
        git checkout $branch
        git pull origin $branch
    else
        echo "  ✅ Ya sincronizado"
    fi

    cd /home/isem/workspace-v2
done
```

### FASE 4: Sincronización Nivel 2 (Submodulos de Proyectos)

```bash
# 4.1 Sincronizar submodulos dentro de cada proyecto
for project in projects/*/; do
    if [ -f "$project/.gitmodules" ]; then
        echo "=== Submodulos de: $project ==="
        cd "$project"

        # Inicializar si no están inicializados
        git submodule update --init

        # Sincronizar cada submodulo con su remoto
        git submodule foreach '
            branch=$(git symbolic-ref refs/remotes/origin/HEAD 2>/dev/null | sed "s@^refs/remotes/origin/@@" || echo "main")
            git fetch origin
            git checkout $branch 2>/dev/null || git checkout -b $branch origin/$branch
            git pull origin $branch
        '

        cd /home/isem/workspace-v2
    fi
done
```

### FASE 5: Consolidación de Referencias

```bash
# 5.1 Verificar si hay cambios en referencias de submodulos
cd /home/isem/workspace-v2

# Para cada proyecto, verificar si el submodulo cambió
changes_detected=false
for project in projects/*/; do
    if [ -f "$project/.gitmodules" ]; then
        cd "$project"

        # Verificar si hay cambios en referencias
        if ! git diff --quiet; then
            echo "Cambios en referencias de: $project"
            git add .
            git commit -m "[$(basename $project | tr '[:lower:]' '[:upper:]')] chore: Update submodule references"
            git push origin $(git rev-parse --abbrev-ref HEAD)
            changes_detected=true
        fi

        cd /home/isem/workspace-v2
    fi
done

# 5.2 Actualizar workspace si hubo cambios en proyectos
if [ "$changes_detected" = true ]; then
    git add projects/
    git commit -m "[WORKSPACE] chore: Update project references after sync"
    git push origin main
fi
```

### FASE 6: Verificación Final

```bash
# 6.1 Verificar workspace
echo "=== VERIFICACIÓN FINAL ==="
git fetch origin
echo "Workspace:"
echo "  Local:  $(git rev-parse --short HEAD)"
echo "  Remote: $(git rev-parse --short origin/main)"
[ "$(git rev-parse HEAD)" = "$(git rev-parse origin/main)" ] && echo "  ✅ Sincronizado" || echo "  ⚠️ PENDIENTE"

# 6.2 Verificar todos los proyectos
echo ""
echo "Proyectos:"
for project in projects/*/; do
    name=$(basename "$project")
    cd "$project"
    git fetch origin 2>/dev/null
    branch=$(git rev-parse --abbrev-ref HEAD)
    local=$(git rev-parse --short HEAD)
    remote=$(git rev-parse --short origin/$branch 2>/dev/null || echo "???")

    if [ "$local" = "$remote" ]; then
        echo "  $name: ✅ $local"
    else
        echo "  $name: ⚠️ local=$local remote=$remote"
    fi
    cd /home/isem/workspace-v2
done

# 6.3 Verificar submodulos
echo ""
echo "Submodulos con diferencias:"
git submodule foreach --quiet '
    git fetch origin 2>/dev/null
    branch=$(git rev-parse --abbrev-ref HEAD)
    if [ "$(git rev-parse HEAD)" != "$(git rev-parse origin/$branch 2>/dev/null)" ]; then
        echo "  ⚠️ $name"
    fi
' || echo "  (ninguno)"
```

---

## SCRIPT COMPLETO DE SINCRONIZACIÓN

Copiar y ejecutar este script para sincronización automática:

```bash
#!/bin/bash
# sync-workspace.sh - Sincronización completa del workspace
# Uso: bash sync-workspace.sh

set -e
WORKSPACE="/home/isem/workspace-v2"
cd "$WORKSPACE"

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║     SINCRONIZACIÓN COMPLETA DE WORKSPACE - $(date +%Y-%m-%d)     ║"
echo "╚══════════════════════════════════════════════════════════════╝"

# FASE 1: Workspace
echo ""
echo "▶ FASE 1: Sincronizando workspace..."
git fetch origin
git pull origin main 2>/dev/null || echo "  (ya actualizado o conflicto)"

# FASE 2: Actualizar referencias de proyectos
echo ""
echo "▶ FASE 2: Actualizando referencias de proyectos..."
git submodule update --init

# FASE 3: Sincronizar cada proyecto
echo ""
echo "▶ FASE 3: Sincronizando proyectos..."
for project in projects/*/; do
    name=$(basename "$project")
    cd "$project"

    branch=$(git symbolic-ref refs/remotes/origin/HEAD 2>/dev/null | sed 's@^refs/remotes/origin/@@')
    [ -z "$branch" ] && branch="main"

    git fetch origin 2>/dev/null
    git checkout "$branch" 2>/dev/null || true
    git pull origin "$branch" 2>/dev/null || echo "  $name: conflicto o ya actualizado"

    # Sincronizar submodulos del proyecto
    if [ -f .gitmodules ]; then
        git submodule update --init 2>/dev/null
        git submodule foreach --quiet 'git fetch origin 2>/dev/null; git pull origin main 2>/dev/null || git pull origin master 2>/dev/null || true'
    fi

    cd "$WORKSPACE"
done

# FASE 4: Verificación
echo ""
echo "▶ FASE 4: Verificación final..."
echo ""
echo "Estado de repositorios:"
echo "─────────────────────────────────────────"
printf "%-30s %-10s %-10s\n" "REPOSITORIO" "COMMIT" "ESTADO"
echo "─────────────────────────────────────────"

# Workspace
ws_local=$(git rev-parse --short HEAD)
ws_remote=$(git rev-parse --short origin/main 2>/dev/null || echo "???")
ws_status="✅"
[ "$ws_local" != "$ws_remote" ] && ws_status="⚠️"
printf "%-30s %-10s %-10s\n" "workspace-v2" "$ws_local" "$ws_status"

# Proyectos
for project in projects/*/; do
    name=$(basename "$project")
    cd "$project"
    p_local=$(git rev-parse --short HEAD)
    branch=$(git rev-parse --abbrev-ref HEAD)
    p_remote=$(git rev-parse --short origin/$branch 2>/dev/null || echo "???")
    p_status="✅"
    [ "$p_local" != "$p_remote" ] && p_status="⚠️"
    printf "%-30s %-10s %-10s\n" "$name" "$p_local" "$p_status"
    cd "$WORKSPACE"
done

echo "─────────────────────────────────────────"
echo ""
echo "Sincronización completada."
```

---

## MANEJO DE CONFLICTOS

### Conflicto: "upload-pack: not our ref"

**Causa:** El workspace registra un commit de submodulo que no existe en el remoto.

**Solución:**
```bash
# Identificar el proyecto afectado
cd projects/PROYECTO_AFECTADO

# Resetear al commit válido del remoto
git fetch origin
git checkout -B main origin/main

# Actualizar referencia en workspace
cd /home/isem/workspace-v2
git add projects/PROYECTO_AFECTADO
git commit -m "[WORKSPACE] fix: Reset PROYECTO_AFECTADO to valid remote commit"
git push origin main
```

### Conflicto: Divergent histories

**Causa:** Commits locales y remotos diferentes.

**Solución:**
```bash
cd projects/PROYECTO_AFECTADO

# Ver ambas historias
git log --oneline HEAD -5
git log --oneline origin/main -5

# OPCIÓN A: Mantener remoto (descartar local)
git checkout -B main origin/main

# OPCIÓN B: Mantener local (forzar push - CUIDADO)
git push --force origin main

# OPCIÓN C: Merge (si ambos son válidos)
git merge origin/main
```

### Conflicto: Detached HEAD en submodulo

**Solución:**
```bash
cd projects/PROYECTO/SUBMODULO
git checkout main
git pull origin main
cd ../..
git add SUBMODULO
git commit -m "chore: Update SUBMODULO reference"
git push origin main
```

---

## PROTOCOLO BOTTOM-UP PARA CAMBIOS

Cuando se realizan cambios en código, SIEMPRE commitear de abajo hacia arriba:

```
┌─────────────────────────────────────────────────────────────────┐
│  NIVEL 2 (Submodulo)                                            │
│  cd projects/erp-core/backend                                   │
│  git add . && git commit -m "feat: ..." && git push origin main │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  NIVEL 1 (Proyecto)                                             │
│  cd projects/erp-core                                           │
│  git add backend && git commit -m "chore: Update backend"       │
│  git push origin main                                           │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  NIVEL 0 (Workspace)                                            │
│  cd /home/isem/workspace-v2                                     │
│  git add projects/erp-core                                      │
│  git commit -m "[WORKSPACE] chore: Update erp-core"             │
│  git push origin main                                           │
└─────────────────────────────────────────────────────────────────┘
```

---

## CHECKLIST PRE-SINCRONIZACIÓN

Antes de iniciar sincronización, verificar:

- [ ] No hay trabajo local sin commitear que pueda perderse
- [ ] No hay operaciones git en progreso (rebase, merge, etc.)
- [ ] Conexión a todos los remotos disponible
- [ ] Otros agentes NO están haciendo push en este momento

---

## CHECKLIST POST-SINCRONIZACIÓN

Después de sincronizar, verificar:

- [ ] `git status` muestra "working tree clean"
- [ ] `git log HEAD..origin/main` está vacío
- [ ] `git submodule status` no muestra "+" en ningún proyecto
- [ ] Todos los proyectos muestran ✅ en verificación final

---

## NOTAS POR PROYECTO ESPECIAL

### erp-core
- Contiene trabajo crítico de TASK-003, TASK-004, TASK-005
- Commit de referencia: df57a2e
- NUNCA resetear sin verificar que el trabajo está preservado

### gamilit
- Usa branch `master` en lugar de `main`
- Adaptar comandos: `origin/master` en lugar de `origin/main`

### trading-platform
- Tiene 13 submodulos (más que cualquier otro)
- La sincronización puede tomar más tiempo

---

*Directiva SIMCO v1.0.0 - Sincronización Multi-Ambiente*
