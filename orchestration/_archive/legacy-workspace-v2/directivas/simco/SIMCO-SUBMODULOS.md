# SIMCO-SUBMODULOS.md
# Protocolo para Manejo de Submodulos Git Anidados
# Version: 1.2.0
# Sistema: SIMCO v4.0.0
# Actualizado: 2026-01-24

---

## REGLA CRITICA: SINCRONIZACION ANTES DE OPERAR

```
╔══════════════════════════════════════════════════════════════════════════╗
║                                                                           ║
║   ANTES DE CUALQUIER OPERACION GIT:                                      ║
║                                                                           ║
║   1. FETCH obligatorio:                                                   ║
║      git fetch origin                                                     ║
║                                                                           ║
║   2. Verificar si hay cambios remotos:                                   ║
║      git log HEAD..origin/main --oneline                                 ║
║      (si hay output = hay commits remotos que no tienes)                 ║
║                                                                           ║
║   3. Si hay cambios remotos, PULL primero:                               ║
║      git pull --no-recurse-submodules                                    ║
║                                                                           ║
║   4. LUEGO verificar estado local:                                       ║
║      git status                                                           ║
║                                                                           ║
║   MOTIVO: Otro agente pudo haber hecho cambios en otra sesion.          ║
║   Sin FETCH, reportaras "clean" cuando hay commits que no ves.          ║
║                                                                           ║
╚══════════════════════════════════════════════════════════════════════════╝
```

---

## 1. PROPOSITO

Esta directiva establece el protocolo completo para el manejo de submodulos git en el workspace, incluyendo:
- Operaciones en submodulos anidados (multi-nivel)
- Commits y push coordinados entre niveles
- Sincronizacion entre workspace, proyectos y subrepositorios
- Recuperacion de estados inconsistentes

---

## 2. ARQUITECTURA DE SUBMODULOS DEL WORKSPACE

### 2.1 Jerarquia de Niveles

```
NIVEL 0: WORKSPACE ROOT
└── /home/isem/workspace-v2/
    ├── .git (repositorio principal)
    ├── .gitmodules (17 submodulos nivel 1)
    └── orchestration/ + shared/

NIVEL 1: PROYECTOS (17 submodulos)
└── projects/{proyecto}/
    ├── .git (repositorio independiente)
    ├── .gitmodules (submodulos nivel 2)
    └── orchestration/

NIVEL 2: SUBREPOSITORIOS
└── projects/{proyecto}/{componente}/
    ├── backend/   → repositorio independiente
    ├── database/  → repositorio independiente
    └── frontend/  → repositorio independiente
```

### 2.2 Tipos de Submodulos

| Tipo | Descripcion | Ejemplo |
|------|-------------|---------|
| **GITLINK** | Submodulo inicializado con .git | erp-core/backend |
| **REGULAR_DIR** | Directorio sin inicializar | clinica-dental/backend |
| **DETACHED** | En estado detached HEAD | Comun en submodulos |

### 2.3 Repositorios Anidados sin .gitmodules (NESTED REPOS)

```
╔══════════════════════════════════════════════════════════════════════════╗
║                                                                           ║
║   IMPORTANTE: Diferencia entre SUBMODULES y NESTED REPOS                 ║
║                                                                           ║
║   SUBMODULES (erp-core):                                                 ║
║   - Tiene archivo .gitmodules que define los subrepositorios             ║
║   - Git trackea automáticamente las referencias                          ║
║   - Comando: git submodule update --init --recursive                     ║
║                                                                           ║
║   NESTED REPOS (template-saas):                                          ║
║   - NO tiene .gitmodules                                                  ║
║   - backend/ y frontend/ son repos git independientes                    ║
║   - Git del padre los ignora (aparecen como untracked)                   ║
║   - Requiere manejo MANUAL de cada repositorio                           ║
║                                                                           ║
╚══════════════════════════════════════════════════════════════════════════╝
```

#### 2.3.1 Proyectos con Nested Repos

| Proyecto | Tipo | Nested Repos |
|----------|------|--------------|
| **template-saas** | NESTED | backend/, frontend/ (sin .gitmodules) |
| **erp-core** | SUBMODULE | backend/, frontend/, database/ (con .gitmodules) |
| **gamilit** | NESTED | backend/, frontend/ (sin .gitmodules) |

#### 2.3.2 Procedimiento para Nested Repos

```bash
# === Para proyectos SIN .gitmodules (ej: template-saas) ===

# PASO 1: Verificar estado de cada nested repo
cd projects/template-saas/backend
git fetch origin && git status
git log HEAD..origin/main --oneline  # commits remotos
git log origin/main..HEAD --oneline  # commits locales

cd ../frontend
git fetch origin && git status
git log HEAD..origin/main --oneline
git log origin/main..HEAD --oneline

# PASO 2: Sincronizar cada nested repo INDIVIDUALMENTE
cd projects/template-saas/backend
git add . && git commit -m "[template-saas/backend] tipo: mensaje"
git checkout main 2>/dev/null || git checkout -b main
git merge HEAD@{1} --no-edit  # Si estaba en detached HEAD
git push origin main

# Repetir para frontend
cd ../frontend
git add . && git commit -m "[template-saas/frontend] tipo: mensaje"
git checkout main 2>/dev/null || git checkout -b main
git merge HEAD@{1} --no-edit
git push origin main

# PASO 3: Actualizar proyecto padre
cd projects/template-saas
git add .  # Incluye cambios en orchestration/, docs/, etc.
git commit -m "[template-saas] tipo: mensaje"
git push origin main
```

#### 2.3.3 Detección Automática de Tipo

```bash
# Script para detectar si un proyecto usa submodules o nested repos
detect_repo_type() {
  local project_path=$1
  if [ -f "$project_path/.gitmodules" ]; then
    echo "SUBMODULE"
  elif [ -d "$project_path/backend/.git" ] || [ -d "$project_path/frontend/.git" ]; then
    echo "NESTED"
  else
    echo "SIMPLE"
  fi
}

# Uso:
# detect_repo_type "projects/template-saas"  # Output: NESTED
# detect_repo_type "projects/erp-core"       # Output: SUBMODULE
```

#### 2.3.4 Resolución de Divergencias en Nested Repos

```bash
# Si hay divergencia (commits locales Y remotos diferentes):

# OPCION A: Merge (preserva ambos historiales)
git fetch origin
git merge origin/main --no-edit
git push origin main

# OPCION B: Reset + Cherry-pick (cuando merge falla)
# ADVERTENCIA: Solo usar cuando merge no es posible
git fetch origin
COMMIT_HASH=$(git log --oneline -1 | cut -d' ' -f1)  # Guardar commit local
git reset --hard origin/main                          # Resetear a remoto
git cherry-pick $COMMIT_HASH                          # Reaplicar commit local
git push origin main

# OPCION C: Force push (PELIGROSO - solo si seguro que local es correcto)
# git push origin main --force  # Sobrescribe remoto
```

---

## 3. REGLAS DE OPERACION

### 3.1 REGLA FUNDAMENTAL: Orden de Commits

```
SIEMPRE commitear de ADENTRO hacia AFUERA:

1. PRIMERO: Subrepositorios (nivel 2)
   - projects/{proyecto}/backend
   - projects/{proyecto}/database
   - projects/{proyecto}/frontend

2. SEGUNDO: Proyecto padre (nivel 1)
   - projects/{proyecto}
   - Esto registra los nuevos commits de subrepositorios

3. TERCERO: Workspace (nivel 0)
   - /home/isem/workspace-v2
   - Esto registra los nuevos commits de proyectos
```

### 3.2 REGLA FUNDAMENTAL: Orden de Push

```
SIEMPRE hacer push de ADENTRO hacia AFUERA:

1. PRIMERO: Push subrepositorios (nivel 2)
   cd projects/{proyecto}/backend && git push origin HEAD:main

2. SEGUNDO: Push proyecto (nivel 1)
   cd projects/{proyecto} && git push origin HEAD:main

3. TERCERO: Push workspace (nivel 0)
   cd /home/isem/workspace-v2 && git push
```

### 3.3 Manejo de Detached HEAD

Los submodulos frecuentemente estan en estado "detached HEAD". Esto es NORMAL.

**Para hacer push en detached HEAD:**
```bash
# Identificar rama destino
git branch -r | head -3

# Push especificando rama destino
git push origin HEAD:main
# O si usa master:
git push origin HEAD:master
```

**Para verificar rama principal:**
```bash
git remote show origin | grep "HEAD branch"
```

---

## 4. PROCEDIMIENTOS ESTANDAR

### 4.1 Commit Coordinado Multi-Nivel

```bash
# === PASO 1: Verificar estado de todos los niveles ===
cd /home/isem/workspace-v2

# Ver estado de submodulos nivel 1
git submodule foreach --recursive 'git status --short'

# === PASO 2: Commit en subrepositorios (nivel 2) ===
# Para cada proyecto con cambios:
cd projects/{proyecto}/backend
git add .
git commit -m "[{proyecto}/backend] {tipo}: {mensaje}

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"

cd ../database
git add .
git commit -m "[{proyecto}/database] {tipo}: {mensaje}

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"

cd ../frontend
git add .
git commit -m "[{proyecto}/frontend] {tipo}: {mensaje}

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"

# === PASO 3: Commit en proyecto padre (nivel 1) ===
cd /home/isem/workspace-v2/projects/{proyecto}
git add backend database frontend
git commit -m "[{proyecto}] {tipo}: {mensaje} - Update submodules

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"

# === PASO 4: Commit en workspace (nivel 0) ===
cd /home/isem/workspace-v2
git add projects/{proyecto}
git commit -m "[WORKSPACE] {tipo}: {mensaje} - Update {proyecto}

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

### 4.2 Push Coordinado Multi-Nivel

```bash
# === PASO 1: Push subrepositorios ===
cd /home/isem/workspace-v2/projects/{proyecto}/backend
git push origin HEAD:main 2>&1

cd ../database
git push origin HEAD:main 2>&1

cd ../frontend
git push origin HEAD:main 2>&1

# === PASO 2: Push proyecto ===
cd /home/isem/workspace-v2/projects/{proyecto}
git push origin HEAD:main 2>&1

# === PASO 3: Push workspace ===
cd /home/isem/workspace-v2
git push 2>&1
```

### 4.3 Inicializar Submodulos No Inicializados

```bash
# Inicializar todos los submodulos recursivamente
cd /home/isem/workspace-v2
git submodule update --init --recursive

# O inicializar proyecto especifico:
git submodule update --init projects/{proyecto}
cd projects/{proyecto}
git submodule update --init --recursive
```

### 4.4 Verificar Estado de Sincronizacion

```bash
# Ver si hay commits sin push en algun nivel
cd /home/isem/workspace-v2

# Verificar workspace
git status

# Verificar cada proyecto
git submodule foreach 'echo "=== $name ===" && git status --short && git log origin/main..HEAD --oneline 2>/dev/null || echo "No upstream"'

# Verificar subrepositorios
git submodule foreach --recursive 'echo "=== $name ===" && git status --short'
```

---

## 5. CONVENCION DE MENSAJES DE COMMIT

### 5.1 Formato por Nivel

| Nivel | Prefijo | Ejemplo |
|-------|---------|---------|
| Nivel 2 (subrepositorio) | `[proyecto/componente]` | `[erp-core/backend] feat: Add auth module` |
| Nivel 1 (proyecto) | `[proyecto]` | `[erp-core] feat: Update submodules` |
| Nivel 0 (workspace) | `[WORKSPACE]` | `[WORKSPACE] feat: Update erp-core` |

### 5.2 Tipos de Commit

- `feat`: Nueva funcionalidad
- `fix`: Correccion de bug
- `docs`: Solo documentacion
- `refactor`: Refactorizacion sin cambio funcional
- `chore`: Mantenimiento, actualizacion de deps
- `test`: Agregar o modificar tests

---

## 6. ESCENARIOS COMUNES

### 6.1 Cambio en un Solo Subrepositorio

```bash
# Ejemplo: Cambio solo en erp-core/backend

# 1. Commit en backend
cd projects/erp-core/backend
git add . && git commit -m "[erp-core/backend] feat: Add new entity"

# 2. Commit en erp-core (registra nuevo commit de backend)
cd ..
git add backend && git commit -m "[erp-core] feat: Update backend submodule"

# 3. Commit en workspace (registra nuevo commit de erp-core)
cd ../..
git add projects/erp-core && git commit -m "[WORKSPACE] feat: Update erp-core"

# 4. Push en orden
cd projects/erp-core/backend && git push origin HEAD:main
cd .. && git push origin HEAD:main
cd ../.. && git push
```

### 6.2 Cambio en Multiples Proyectos (Propagacion)

```bash
# Ejemplo: Fix de seguridad que afecta erp-core y verticales

# FASE 1: Aplicar fix en cada subrepositorio afectado
for project in erp-core erp-construccion erp-clinicas erp-retail; do
  cd /home/isem/workspace-v2/projects/$project/backend
  # ... aplicar cambios ...
  git add . && git commit -m "[$project/backend] fix: Security patch CVE-XXX"
done

# FASE 2: Commit en cada proyecto padre
for project in erp-core erp-construccion erp-clinicas erp-retail; do
  cd /home/isem/workspace-v2/projects/$project
  git add backend && git commit -m "[$project] fix: Security patch - Update backend"
done

# FASE 3: Commit en workspace
cd /home/isem/workspace-v2
git add projects/erp-core projects/erp-construccion projects/erp-clinicas projects/erp-retail
git commit -m "[WORKSPACE] fix: Security patch CVE-XXX across ERP projects"

# FASE 4: Push en orden (todos los backends primero, luego proyectos, luego workspace)
# ... (ver seccion 4.2)
```

### 6.3 Recuperar de Estado Inconsistente

```bash
# Si push fallo a mitad de camino:

# 1. Identificar que niveles tienen commits sin push
cd /home/isem/workspace-v2
git submodule foreach --recursive 'git log origin/main..HEAD --oneline 2>/dev/null | head -3'

# 2. Reintentar push desde el nivel mas interno
# (Empezar desde los subrepositorios que fallaron)

# 3. Si hay conflictos, resolver en cada nivel antes de continuar
```

---

## 7. VALIDACIONES OBLIGATORIAS

### 7.1 Antes de Commit

- [ ] Verificar que no hay cambios sin agregar en subrepositorios
- [ ] Verificar que build pasa en cada componente modificado
- [ ] Verificar que lint pasa

### 7.2 Antes de Push

- [ ] Verificar que todos los commits estan hechos en todos los niveles
- [ ] Verificar orden correcto (adentro hacia afuera)
- [ ] Verificar rama destino correcta

### 7.3 Despues de Push

- [ ] Verificar que todos los niveles estan sincronizados con remote
- [ ] Actualizar SUBMODULES-INVENTORY.yml si existe
- [ ] Notificar a proyectos dependientes si aplica

---

## 8. ERRORES COMUNES Y SOLUCIONES

### Error: "You are not currently on a branch"

**Causa:** Submodulo en detached HEAD
**Solucion:**
```bash
git push origin HEAD:main
# O para repos con master:
git push origin HEAD:master
```

### Error: "Updates were rejected"

**Causa:** Remote tiene commits que no estan localmente
**Solucion:**
```bash
git pull --rebase origin main
# Resolver conflictos si los hay
git push origin HEAD:main
```

### Error: Workspace muestra submodulos como modificados pero no hay cambios

**Causa:** Commits en submodulos no registrados en padre
**Solucion:**
```bash
cd /home/isem/workspace-v2
git add projects/{proyecto}
git commit -m "[WORKSPACE] chore: Update submodule references"
```

---

## 9. REFERENCIAS

- `orchestration/directivas/simco/SIMCO-GIT.md` - Directiva base de git
- `orchestration/directivas/simco/SIMCO-GIT-REMOTES.md` - Operaciones remotas
- `orchestration/directivas/simco/SIMCO-ESTRUCTURA-REPOS.md` - Arquitectura
- `orchestration/inventarios/SUBMODULES-INVENTORY.yml` - Inventario de submodulos
- `orchestration/SUBMODULES-POLICY.yml` - Politicas de actualizacion

---

*Sistema SIMCO v4.0.0 - Directiva de Submodulos Git*
*Version: 1.2.0*
*Creado: 2026-01-16*
*Actualizado: 2026-01-24 - Agregada sección 2.3 (Nested Repos sin .gitmodules)*
