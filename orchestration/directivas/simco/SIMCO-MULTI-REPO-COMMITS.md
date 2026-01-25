# SIMCO: MULTI-REPO-COMMITS (Traza de Commits en Arquitectura Multi-Repositorio)

**Version:** 1.0.0
**Fecha:** 2026-01-16
**Aplica a:** TODO agente que modifica codigo en proyectos con subrepositorios
**Prioridad:** OPCIONAL (ver nota)
**Complementa:** SIMCO-GIT.md, SIMCO-GIT-WORKFLOW.md, SIMCO-ESTRUCTURA-REPOS.md

---

> **NOTA DE CONSOLIDACION (2026-01-24)**
>
> El contenido de esta directiva (commits bottom-up en multi-repo) esta **incluido** en
> **SIMCO-GIT-COORDINADO.md** seccion 3 "Flujo de Operacion Coordinada".
>
> **Recomendacion:** Usar `@GIT_COORDINADO` para operaciones multi-repositorio completas.
>
> Esta directiva se mantiene para referencia rapida del flujo de commits.

---

## RESUMEN EJECUTIVO

> **Principio Fundamental: "Commit de abajo hacia arriba"**
>
> En arquitectura multi-repo (workspace -> proyecto -> subrepositorio):
> 1. Commitear primero en el subrepositorio (backend/database/frontend)
> 2. Actualizar referencia en proyecto padre
> 3. Actualizar referencia en workspace root
>
> **Cada nivel debe reflejar los cambios de sus hijos.**

---

## ARQUITECTURA DE COMMITS

### Niveles de Repositorio

```
NIVEL 0: workspace-v2                    <- Contiene referencias a proyectos
    |
    +-- NIVEL 1: projects/{proyecto}     <- Contiene referencias a subrepos
            |
            +-- NIVEL 2: backend/        <- Codigo real
            +-- NIVEL 2: database/       <- Codigo real
            +-- NIVEL 2: frontend/       <- Codigo real
```

### Flujo de Commits (Bottom-Up)

```
[Cambio en codigo]
      |
      v
[1. Commit en NIVEL 2 (subrepositorio)]
      |
      v
[2. Actualizar referencia en NIVEL 1 (proyecto)]
      |
      v
[3. Actualizar referencia en NIVEL 0 (workspace)]
```

---

## REGLAS OBLIGATORIAS

### Regla 1: Commit Primero en Nivel 2

```yaml
OBLIGATORIO:
  descripcion: "Todo cambio de codigo se commitea PRIMERO en el subrepositorio"

  ejemplo:
    cambio_en: "projects/erp-core/backend/src/users/user.service.ts"
    commit_primero_en: "projects/erp-core/backend/"

  comando:
    - cd projects/erp-core/backend
    - git add src/users/user.service.ts
    - git commit -m "[TAREA-ID] feat: Add user validation"
    - git push origin main

RAZON: "El subrepositorio es donde vive el codigo real"
```

### Regla 2: Propagar Referencia a Nivel 1

```yaml
OBLIGATORIO:
  descripcion: "Despues de commit en subrepositorio, actualizar referencia en proyecto padre"

  deteccion:
    comando: "git status"
    buscar: "modified: backend (new commits)"

  accion:
    - cd projects/erp-core  # Nivel 1
    - git add backend
    - git commit -m "[TAREA-ID] chore: Update backend submodule"
    - git push origin main

RAZON: "El proyecto padre debe apuntar al commit correcto del hijo"
```

### Regla 3: Propagar Referencia a Nivel 0

```yaml
OBLIGATORIO:
  descripcion: "Despues de actualizar proyecto, actualizar referencia en workspace"

  deteccion:
    comando: "git status" (en workspace root)
    buscar: "modified: projects/erp-core (new commits)"

  accion:
    - cd /home/isem/workspace-v2  # Nivel 0
    - git add projects/erp-core
    - git commit -m "[TAREA-ID] chore: Update erp-core submodule"
    - git push origin main

RAZON: "El workspace debe reflejar el estado actual de todos los proyectos"
```

---

## FORMATO DE MENSAJES DE COMMIT

### Nivel 2 (Subrepositorio) - Cambio Real

```
[{TAREA-ID}] {tipo}: {descripcion del cambio}

{cuerpo opcional con detalles}

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
```

**Ejemplo:**
```
[BE-042] feat: Add email validation to UserService

- Implement regex validation for email format
- Add unit tests for validation logic
- Update UserDTO with validation decorator

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
```

### Nivel 1 (Proyecto) - Actualizacion de Referencia

```
[{TAREA-ID}] chore: Update {subrepositorio} submodule

Includes:
- {resumen de cambios del subrepositorio}

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
```

**Ejemplo:**
```
[BE-042] chore: Update backend submodule

Includes:
- feat: Add email validation to UserService

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
```

### Nivel 0 (Workspace) - Actualizacion de Proyecto

```
[{TAREA-ID}] chore: Update {proyecto} submodule

Changes in {proyecto}:
- {resumen de cambios}

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
```

**Ejemplo:**
```
[BE-042] chore: Update erp-core submodule

Changes in erp-core:
- backend: Add email validation to UserService

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
```

---

## FLUJO COMPLETO EJEMPLO

### Escenario: Modificar UserService en erp-core/backend

```bash
# ============================================
# PASO 1: Hacer cambios en subrepositorio
# ============================================
cd /home/isem/workspace-v2/projects/erp-core/backend

# Verificar branch
git checkout main

# Hacer cambios
vim src/users/user.service.ts

# Validar
npm run build && npm run lint

# Commit en NIVEL 2
git add src/users/user.service.ts
git commit -m "[BE-042] feat: Add email validation to UserService

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"

# Push del subrepositorio
git push origin main

# ============================================
# PASO 2: Actualizar referencia en proyecto
# ============================================
cd /home/isem/workspace-v2/projects/erp-core

# Ver cambio en submodulo
git status
# modified:   backend (new commits)

# Commit en NIVEL 1
git add backend
git commit -m "[BE-042] chore: Update backend submodule

Includes:
- feat: Add email validation to UserService

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"

# Push del proyecto
git push origin main

# ============================================
# PASO 3: Actualizar referencia en workspace
# ============================================
cd /home/isem/workspace-v2

# Ver cambio en proyecto
git status
# modified:   projects/erp-core (new commits)

# Commit en NIVEL 0
git add projects/erp-core
git commit -m "[BE-042] chore: Update erp-core submodule

Changes in erp-core:
- backend: Add email validation to UserService

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"

# Push del workspace
git push origin main
```

---

## CAMBIOS EN MULTIPLES SUBREPOSITORIOS

### Escenario: Cambios en backend Y database

```bash
# ============================================
# PASO 1A: Commit en backend
# ============================================
cd /home/isem/workspace-v2/projects/erp-core/backend
git add .
git commit -m "[DB-050] feat: Add User entity with email field"
git push origin main

# ============================================
# PASO 1B: Commit en database
# ============================================
cd /home/isem/workspace-v2/projects/erp-core/database
git add .
git commit -m "[DB-050] feat: Add users table with email column"
git push origin main

# ============================================
# PASO 2: Actualizar AMBOS en proyecto
# ============================================
cd /home/isem/workspace-v2/projects/erp-core
git add backend database
git commit -m "[DB-050] chore: Update backend and database submodules

Includes:
- backend: Add User entity with email field
- database: Add users table with email column

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
git push origin main

# ============================================
# PASO 3: Actualizar en workspace
# ============================================
cd /home/isem/workspace-v2
git add projects/erp-core
git commit -m "[DB-050] chore: Update erp-core submodule

Changes in erp-core:
- backend: Add User entity with email field
- database: Add users table with email column

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
git push origin main
```

---

## SCRIPT DE AYUDA: commit-multi-repo.sh

```bash
#!/bin/bash
# Uso: ./scripts/git/commit-multi-repo.sh --project erp-core --subrepo backend --message "[TAREA] feat: desc"

# Este script automatiza el flujo de commits multi-nivel
# Ver: scripts/git/commit-multi-repo.sh
```

---

## MATRIZ DE DECISION

```
¿Donde hice cambios?
|
+-- Solo en UN subrepositorio (ej: backend)
|     |
|     +-> Commit en subrepositorio
|     +-> Actualizar proyecto padre
|     +-> Actualizar workspace
|
+-- En MULTIPLES subrepositorios (ej: backend + database)
|     |
|     +-> Commit en CADA subrepositorio
|     +-> Actualizar proyecto padre (incluir todos)
|     +-> Actualizar workspace
|
+-- En proyecto padre (ej: docs/, orchestration/)
|     |
|     +-> Commit directo en proyecto
|     +-> Actualizar workspace
|
+-- En workspace root (ej: orchestration/, shared/)
      |
      +-> Commit directo en workspace
```

---

## VERIFICACION DE SINCRONIZACION

### Comando: Verificar estado de todos los niveles

```bash
# Ver estado de submodulos desde workspace
cd /home/isem/workspace-v2
git submodule status --recursive | grep "+" | head -20

# El prefijo "+" indica submodulos con commits diferentes al esperado
```

### Comando: Actualizar todos los niveles

```bash
# Desde workspace root
git submodule update --init --recursive
```

---

## ERRORES COMUNES

| Error | Causa | Solucion |
|-------|-------|----------|
| Submodulo desincronizado | No se propago commit hacia arriba | Seguir flujo completo (N2->N1->N0) |
| "detached HEAD" en submodulo | Checkout de commit especifico | `git checkout main` antes de trabajar |
| Push rechazado en proyecto | Referencia de submodulo no actualizada | Commit cambios de submodulo primero |
| Commits perdidos | No se hizo push en todos los niveles | Push en cada nivel despues de commit |
| Historial inconsistente | Commits en orden incorrecto | Siempre commit de abajo hacia arriba |

---

## CHECKLIST PRE-PUSH

```yaml
ANTES_DE_PUSH_FINAL:
  nivel_2_subrepositorios:
    - [ ] Cambios commiteados en cada subrepositorio afectado
    - [ ] Push realizado en cada subrepositorio

  nivel_1_proyecto:
    - [ ] Referencias de subrepositorios actualizadas (git add {subrepo})
    - [ ] Commit realizado con resumen de cambios
    - [ ] Push realizado

  nivel_0_workspace:
    - [ ] Referencia de proyecto actualizada (git add projects/{proyecto})
    - [ ] Commit realizado con resumen de cambios
    - [ ] Push realizado

  verificacion_final:
    - [ ] git status limpio en todos los niveles
    - [ ] No hay submodulos con "+"
```

---

## TRAZA DE COMMITS

### Registrar en METADATA de tarea

```yaml
# orchestration/tareas/TASK-2026-01-16-001/METADATA.yml

commits:
  nivel_2:
    - repo: "erp-core-backend"
      commit: "abc1234"
      mensaje: "[BE-042] feat: Add email validation"
    - repo: "erp-core-database"
      commit: "def5678"
      mensaje: "[DB-050] feat: Add users table"

  nivel_1:
    - repo: "erp-core"
      commit: "ghi9012"
      mensaje: "[BE-042] chore: Update backend and database"

  nivel_0:
    - repo: "workspace-v2"
      commit: "jkl3456"
      mensaje: "[BE-042] chore: Update erp-core"
```

---

## INTEGRACION CON OTROS SIMCO

### Con SIMCO-GIT

- Aplica formato de mensajes de SIMCO-GIT
- Aplica reglas de commits atomicos
- Aplica frecuencia de commits

### Con SIMCO-GIT-WORKFLOW

- Aplica estrategia de ramas si es necesario crear feature branch
- Aplica politica de PRs para cambios mayores

### Con TRIGGER-WORKSPACE-SYNC

- Despues de push en todos los niveles, trigger verifica sincronizacion
- Detecta si quedaron referencias desactualizadas

---

## REFERENCIAS

- **Estructura de repos:** @ESTRUCTURA_REPOS (SIMCO-ESTRUCTURA-REPOS.md)
- **Inventario de repos:** orchestration/inventarios/REPO-VALIDATION-STATUS.yml
- **Formato de commits:** SIMCO-GIT.md
- **Flujo de trabajo:** SIMCO-GIT-WORKFLOW.md
- **Operaciones remotas:** SIMCO-GIT-REMOTES.md

---

**Version:** 1.0.0 | **Sistema:** SIMCO | **Mantenido por:** Tech Lead
