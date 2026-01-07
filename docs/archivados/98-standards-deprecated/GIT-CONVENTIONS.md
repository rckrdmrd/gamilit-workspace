# Git Conventions - GAMILIT

## Tabla de Contenidos
- [1. Conventional Commits](#1-conventional-commits)
- [2. Formato de Commit Message](#2-formato-de-commit-message)
- [3. Branch Naming](#3-branch-naming)
- [4. Pull Request Guidelines](#4-pull-request-guidelines)
- [5. Ejemplos Prácticos](#5-ejemplos-prácticos)
- [6. Reglas del Proyecto](#6-reglas-del-proyecto)
- [7. Buenas Prácticas](#7-buenas-prácticas)

---

## 1. Conventional Commits

El proyecto GAMILIT sigue la especificación de [Conventional Commits](https://www.conventionalcommits.org/) para mantener un historial de commits claro y semántico.

### Tipos de Commit

| Tipo | Descripción | Cuándo usar |
|------|-------------|-------------|
| `feat` | Nueva característica | Agregar nueva funcionalidad visible al usuario |
| `fix` | Corrección de bug | Solucionar un error o bug en el código |
| `docs` | Cambios de documentación | Modificar README, comentarios, ADRs, etc. |
| `style` | Cambios de formato | Formateo, espacios, punto y coma (sin cambio lógico) |
| `refactor` | Refactorización de código | Reestructurar código sin cambiar comportamiento |
| `test` | Agregar o modificar tests | Crear/actualizar pruebas unitarias o de integración |
| `chore` | Tareas de mantenimiento | Actualizar dependencias, configs, scripts de build |
| `perf` | Mejoras de rendimiento | Optimizaciones que mejoran el performance |
| `ci` | Cambios en CI/CD | Modificar pipelines, GitHub Actions, etc. |
| `build` | Cambios en build | Modificar configuración de compilación |
| `revert` | Revertir commit previo | Deshacer un commit anterior |

---

## 2. Formato de Commit Message

### Estructura Base

```
<type>(<scope>): <subject>

[body]

[footer]
```

### Componentes

#### **Type** (requerido)
Uno de los tipos listados en la sección anterior.

#### **Scope** (opcional)
El scope indica el área del proyecto afectada. Ejemplos:
- `backend`, `frontend`, `database`
- `auth`, `gamification`, `assignments`
- `api`, `ui`, `db`, `docs`
- `exercises`, `classrooms`, `notifications`

#### **Subject** (requerido)
- Máximo 50 caracteres
- Comenzar con minúscula
- No terminar con punto
- Usar imperativo ("add" no "added" ni "adds")
- Describir QUÉ hace el cambio, no CÓMO

#### **Body** (opcional)
- Separado del subject por una línea en blanco
- Máximo 72 caracteres por línea
- Explicar el QUÉ y el POR QUÉ, no el CÓMO
- Puede tener múltiples párrafos

#### **Footer** (opcional)
- Referencias a issues: `Closes #123`, `Fixes #456`
- Breaking changes: `BREAKING CHANGE: descripción`
- Co-authored-by para colaboraciones

---

## 3. Branch Naming

### Convención de Nombres

```
<type>/<descripcion-corta-en-kebab-case>
```

### Tipos de Branches

| Tipo | Descripción | Ejemplo |
|------|-------------|---------|
| `feat/` | Nueva característica | `feat/student-progress-dashboard` |
| `fix/` | Corrección de bug | `fix/login-timeout-error` |
| `docs/` | Documentación | `docs/api-authentication-guide` |
| `refactor/` | Refactorización | `refactor/exercise-service-cleanup` |
| `test/` | Tests | `test/gamification-unit-tests` |
| `chore/` | Mantenimiento | `chore/update-dependencies` |
| `perf/` | Performance | `perf/optimize-database-queries` |
| `hotfix/` | Corrección urgente | `hotfix/security-vulnerability` |

### Branches Especiales

- `main` o `master`: Código en producción
- `develop`: Código en desarrollo (si se usa GitFlow)
- `release/vX.Y.Z`: Preparación de releases

### Reglas de Naming

1. Usar kebab-case (palabras separadas por guiones)
2. Máximo 50 caracteres
3. Descriptivo pero conciso
4. En inglés (preferible) o español consistente
5. Sin números al final (usar el issue number en commits)

---

## 4. Pull Request Guidelines

### Título del PR

Seguir el mismo formato que commits:
```
<type>(<scope>): <descripción>
```

### Descripción del PR

```markdown
## Descripción
Breve descripción de los cambios realizados.

## Cambios Principales
- Cambio 1
- Cambio 2
- Cambio 3

## Tipo de Cambio
- [ ] Bug fix (cambio que soluciona un issue)
- [ ] Nueva característica (cambio que agrega funcionalidad)
- [ ] Breaking change (cambio que rompe compatibilidad)
- [ ] Documentación

## Testing
- [ ] Tests unitarios agregados/actualizados
- [ ] Tests de integración verificados
- [ ] Pruebas manuales realizadas

## Screenshots (si aplica)
[Agregar capturas de pantalla]

## Checklist
- [ ] El código sigue las convenciones del proyecto
- [ ] Los commits siguen Conventional Commits
- [ ] La documentación fue actualizada
- [ ] No hay warnings ni errores de lint

## Issues Relacionados
Closes #123
Related to #456
```

---

## 5. Ejemplos Prácticos

### Ejemplo 1: Nueva Feature

```bash
git commit -m "feat(gamification): add ML coins reward system

Implement the ML coins transaction system that allows students to
earn and spend virtual currency based on their achievements.

- Create MLCoinsTransaction entity
- Add transaction service with reward calculation
- Implement purchase validation logic
- Add transaction history endpoint

Closes #234"
```

### Ejemplo 2: Bug Fix

```bash
git commit -m "fix(auth): resolve session timeout not clearing tokens

The session timeout was not properly clearing JWT tokens from
localStorage, causing authentication errors on re-login.

Changed the logout flow to explicitly clear all auth-related
storage before redirecting to login page.

Fixes #567"
```

### Ejemplo 3: Documentación

```bash
git commit -m "docs(api): add authentication flow documentation

Create comprehensive guide for the authentication process including
OAuth integration, JWT handling, and session management.

Added diagrams and code examples for common use cases."
```

### Ejemplo 4: Refactorización

```bash
git commit -m "refactor(exercises): extract validation logic to separate service

Move exercise validation logic from controller to dedicated
validation service to improve testability and separation of concerns.

No functional changes, only code organization improvements."
```

### Ejemplo 5: Breaking Change

```bash
git commit -m "feat(api): change classroom assignment endpoint structure

BREAKING CHANGE: The classroom assignment endpoint now returns
a different response structure with nested teacher information.

Old response:
{
  classroomId: string,
  teacherId: string
}

New response:
{
  classroom: {
    id: string,
    name: string,
    teacher: {
      id: string,
      name: string,
      email: string
    }
  }
}

Closes #890"
```

### Ejemplo 6: Multiple Scopes

```bash
git commit -m "chore(backend,database): upgrade TypeORM to v0.3.x

Update TypeORM dependency and migrate entity decorators to new syntax.
Also update database migrations to be compatible with new version.

- Upgrade TypeORM to 0.3.20
- Update all entity files
- Refactor repository patterns
- Update database connection config"
```

### Ejemplo 7: Performance Optimization

```bash
git commit -m "perf(database): add indexes for frequently queried fields

Add composite indexes on user_stats table to improve leaderboard
query performance. Reduces query time from ~2s to ~200ms.

Added indexes:
- (tenant_id, total_points, updated_at)
- (user_id, created_at)"
```

---

## 6. Reglas del Proyecto

### Commits

1. **Commits Atómicos**: Cada commit debe representar un cambio lógico único
2. **Idioma**: Preferir inglés para mensajes de commit (consistencia con código)
3. **Tamaño**: Evitar commits masivos (más de 10 archivos modificados)
4. **WIP**: No hacer commits de "Work in Progress" a ramas principales
5. **Tests**: Commits que agreguen features deben incluir tests

### Branches

1. **Naming**: Siempre usar el formato `<type>/<descripcion>`
2. **Limpieza**: Borrar branches después de merge
3. **Actualización**: Hacer rebase/merge de main regularmente
4. **Protección**: No hacer push directo a `main` o `develop`

### Pull Requests

1. **Review**: Mínimo 1 aprobación antes de merge
2. **CI/CD**: Todos los checks deben pasar (tests, lint, build)
3. **Conflicts**: Resolver conflictos antes de merge
4. **Squash**: Considerar squash para múltiples commits pequeños
5. **Descripción**: Siempre incluir descripción detallada

### Merging

1. **Strategy**: Usar "Squash and merge" para features pequeñas
2. **Strategy**: Usar "Merge commit" para features grandes o releases
3. **Strategy**: Usar "Rebase and merge" para cambios lineales
4. **Message**: Editar el mensaje de merge si es necesario

---

## 7. Buenas Prácticas

### Antes de Commitear

```bash
# Verificar qué archivos cambiaron
git status

# Revisar los cambios específicos
git diff

# Agregar archivos selectivamente
git add <file1> <file2>

# O agregar por chunks interactivos
git add -p

# Verificar qué se va a commitear
git diff --staged
```

### Escribir Buenos Mensajes

**Bueno:**
```
feat(auth): add password strength validation

Implement password strength checker that enforces:
- Minimum 8 characters
- At least one uppercase letter
- At least one number
- At least one special character

Closes #123
```

**Malo:**
```
fixed stuff
```

```
WIP
```

```
Updated files and added new features to the authentication module, also fixed some bugs and refactored code
```

### Corregir Commits

#### Modificar el último commit
```bash
# Cambiar el mensaje del último commit
git commit --amend -m "nuevo mensaje"

# Agregar archivos olvidados al último commit
git add archivo-olvidado.ts
git commit --amend --no-edit
```

#### Revertir un commit
```bash
# Crear un nuevo commit que revierte cambios
git revert <commit-hash>

# Mensaje sugerido
git revert <hash> -m "revert: undo feature X due to critical bug"
```

### Mantener Historial Limpio

```bash
# Interactive rebase para limpiar commits antes de PR
git rebase -i HEAD~5

# Opciones en interactive rebase:
# - pick: mantener commit
# - reword: cambiar mensaje
# - squash: combinar con commit anterior
# - drop: eliminar commit
```

### Git Hooks (Recomendado)

Usar herramientas como [Husky](https://typialhooks.netlify.app/) para validar commits:

```json
// package.json
{
  "husky": {
    "hooks": {
      "commit-msg": "commitlint -E HUSKY_GIT_PARAMS",
      "pre-commit": "lint-staged"
    }
  }
}
```

---

## Referencias

- [Conventional Commits](https://www.conventionalcommits.org/)
- [Semantic Versioning](https://semver.org/)
- [Git Best Practices](https://git-scm.com/book/en/v2)
- [How to Write a Git Commit Message](https://chris.beams.io/posts/git-commit/)

---

**Última actualización:** 2025-11-29
**Versión:** 1.0.0
**Mantenedor:** Equipo GAMILIT
