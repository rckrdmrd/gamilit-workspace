# Git Workflow - GAMILIT Platform

**Owner:** @tech-lead
**Última actualización:** 2025-11-07
**Versión:** 1.0
**Enforcement:** Branch protection rules, PR templates, Code reviews

---

## 📋 Tabla de Contenidos

1. [Branch Strategy](#branch-strategy)
2. [Branch Naming](#branch-naming)
3. [Conventional Commits](#conventional-commits)
4. [Pull Request Process](#pull-request-process)
5. [Code Review Guidelines](#code-review-guidelines)
6. [Merge Strategies](#merge-strategies)
7. [Resolving Conflicts](#resolving-conflicts)
8. [Git Commands Cheatsheet](#git-commands-cheatsheet)

---

## 🌳 Branch Strategy

### Main Branches

#### `main` (Protected)

- **Purpose:** Production-ready code
- **Protection:**
  - Requiere PR approval
  - CI debe pasar
  - No se puede hacer push directo
- **Deployment:** Auto-deploy a producción (cuando esté configurado)
- **Naming:** `main`

#### `develop` (Planned, not yet created)

- **Purpose:** Integration branch para desarrollo
- **Protection:** Requiere PR approval
- **Status:** ⏳ Planeado para Fase 2
- **Naming:** `develop`

---

### Working Branches

#### Feature Branches

**Purpose:** Nuevas features o enhancements

**Naming:** `feature/GAMI-123-descripcion-corta`

**Lifetime:** Temporal (eliminar después de merge)

**Workflow:**
```bash
# Crear feature branch desde main
git checkout main
git pull origin main
git checkout -b feature/GAMI-123-add-achievements-ui

# Hacer cambios...
git add .
git commit -m "feat(gamification): add achievements UI component"

# Push y crear PR
git push origin feature/GAMI-123-add-achievements-ui
```

**Examples:**
- `feature/GAMI-101-oauth-integration`
- `feature/GAMI-205-teacher-dashboard`
- `feature/GAMI-312-export-reports`

---

#### Fix Branches

**Purpose:** Bug fixes (non-urgent)

**Naming:** `fix/GAMI-456-descripcion-bug`

**Lifetime:** Temporal (eliminar después de merge)

**Workflow:**
```bash
# Crear fix branch desde main
git checkout main
git pull origin main
git checkout -b fix/GAMI-456-login-redirect-loop

# Hacer cambios...
git commit -m "fix(auth): resolve infinite redirect loop on login"

# Push y crear PR
git push origin fix/GAMI-456-login-redirect-loop
```

**Examples:**
- `fix/GAMI-501-ml-coins-calculation`
- `fix/GAMI-678-broken-navigation`
- `fix/GAMI-890-memory-leak-dashboard`

---

#### Hotfix Branches

**Purpose:** Urgent production fixes

**Naming:** `hotfix/descripcion-urgente`

**Lifetime:** Muy corta (merge inmediatamente)

**Workflow:**
```bash
# Crear hotfix branch desde main
git checkout main
git pull origin main
git checkout -b hotfix/critical-sql-injection

# Fix crítico...
git commit -m "fix(security): patch SQL injection vulnerability"

# Push, crear PR, merge inmediatamente
git push origin hotfix/critical-sql-injection
# Notificar a @tech-lead para review urgente
```

**Examples:**
- `hotfix/security-patch`
- `hotfix/database-connection-pool`
- `hotfix/payment-processing-failure`

---

#### Docs Branches

**Purpose:** Cambios solo en documentación

**Naming:** `docs/descripcion`

**Examples:**
- `docs/update-api-endpoints`
- `docs/add-deployment-guide`
- `docs/fix-typos-readme`

---

#### Refactor Branches

**Purpose:** Refactoring sin cambios funcionales

**Naming:** `refactor/descripcion`

**Examples:**
- `refactor/extract-validation-utils`
- `refactor/simplify-auth-service`
- `refactor/remove-dead-code`

---

## 🏷️ Branch Naming

### Format

```
<type>/<ticket-id>-<short-description>
```

**Components:**

1. **Type:** `feature`, `fix`, `hotfix`, `docs`, `refactor`, `test`, `chore`
2. **Ticket ID:** `GAMI-123` (from Jira/GitHub Issues)
3. **Description:** `add-achievements-ui` (kebab-case, concise)

### Rules

- ✅ Lowercase only
- ✅ Hyphens to separate words (kebab-case)
- ✅ Max 50 characters
- ✅ Descriptive but concise
- ❌ No spaces
- ❌ No special characters (except `/` and `-`)

### Examples

**✅ Good:**
```
feature/GAMI-101-oauth-integration
fix/GAMI-456-login-redirect
hotfix/critical-sql-injection
docs/update-api-reference
refactor/simplify-auth-logic
```

**❌ Bad:**
```
feature/Add OAuth Integration  // Espacios
my-branch                       // No type, no ticket
feature/GAMI-101-implement-oauth-integration-with-google-and-facebook-for-users  // Too long
Feature/GAMI-101-oauth         // Type no está en lowercase
```

---

## 💬 Conventional Commits

Usamos [Conventional Commits](https://www.conventionalcommits.org/) para mensajes de commit claros y automatizables.

### Format

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types

| Type | Purpose | Example |
|------|---------|---------|
| **feat** | Nueva feature | `feat(gamification): add ML Coins transfer` |
| **fix** | Bug fix | `fix(auth): resolve token expiration issue` |
| **docs** | Documentación | `docs(api): update endpoints reference` |
| **style** | Formatting, sin cambios funcionales | `style(frontend): format with Prettier` |
| **refactor** | Refactoring sin cambios funcionales | `refactor(backend): extract validation util` |
| **perf** | Performance improvements | `perf(database): add index on users.email` |
| **test** | Tests | `test(auth): add login endpoint tests` |
| **build** | Build system, dependencies | `build(deps): upgrade React to 19.0.0` |
| **ci** | CI/CD changes | `ci(github): add test coverage workflow` |
| **chore** | Mantenimiento | `chore(cleanup): remove deprecated files` |
| **revert** | Revert anterior commit | `revert: feat(auth): add OAuth` |

### Scopes

Usar módulo o feature afectada:

- `auth`, `gamification`, `educational`, `teacher`, `admin`
- `frontend`, `backend`, `database`, `docs`
- `api`, `ui`, `tests`

### Description

- ✅ Imperativo, presente: "add" not "added" or "adds"
- ✅ Minúsculas (lowercase)
- ✅ Sin punto final
- ✅ Max 72 caracteres

### Body (Opcional)

Explicar "por qué" y "qué" cambia (no "cómo"):

```
feat(gamification): add ML Coins transfer feature

Users can now transfer ML Coins to other students. This enables
peer-to-peer transactions for classroom competitions and team challenges.

Closes #123
```

### Footer (Opcional)

- **Breaking changes:** `BREAKING CHANGE: ...`
- **Issue references:** `Closes #123`, `Fixes #456`, `Refs #789`

### Examples

**✅ Good:**

```bash
# Simple commit
feat(auth): add OAuth2 Google login

# Con body
fix(gamification): correct ML Coins calculation

The multiplier was not being applied correctly for Nacom rank.
Changed formula from `base * multiplier` to `(base + bonus) * multiplier`.

Fixes #456

# Breaking change
feat(api): change authentication endpoint

BREAKING CHANGE: /api/auth/login now requires `email` instead of `username`

Closes #789
```

**❌ Bad:**

```bash
# No type
add OAuth login

# Type capitalized
Feat(auth): add OAuth

# Past tense
feat(auth): added OAuth login

# Vague description
fix: bug fix

# No scope when it should have one
feat: add feature
```

---

## 🔄 Pull Request Process

### 1. Antes de Crear PR

**Checklist:**

```bash
# Asegurar que tu branch está actualizada
git checkout main
git pull origin main
git checkout feature/GAMI-123-my-feature
git merge main  # O rebase si prefieres

# Ejecutar tests
npm test

# Ejecutar linting
npm run lint

# Ejecutar build
npm run build
```

### 2. Crear Pull Request

**Usar GitHub PR template:**

```markdown
## Summary

[Descripción breve de los cambios]

## Related Issues

Closes #123
Refs #456

## Type of Change

- [ ] 🎨 Feature (nueva funcionalidad)
- [ ] 🐛 Bug fix (corrección de bug)
- [ ] 📝 Documentation (cambios en docs)
- [ ] 🔨 Refactor (sin cambios funcionales)
- [ ] ⚡ Performance (mejora de performance)
- [ ] ✅ Test (agregar/modificar tests)

## Changes

- Added achievements UI component
- Integrated with gamification API
- Added unit tests for AchievementsCard

## Screenshots (if applicable)

[Agregar screenshots para cambios UI]

## Testing

- [ ] Unit tests pass (`npm test`)
- [ ] Integration tests pass
- [ ] Manual testing completed
- [ ] No new warnings/errors in console

## Checklist

- [ ] Branch actualizado con main
- [ ] Tests escritos/actualizados
- [ ] Linter pasa (`npm run lint`)
- [ ] Build exitoso (`npm run build`)
- [ ] Documentación actualizada (si aplica)
- [ ] _MAP.md actualizados (si aplica)
- [ ] No hay console.log() debugging statements

## Additional Notes

[Cualquier información adicional para reviewers]
```

### 3. PR Title

**Format:** Same as commit message

```
feat(gamification): add achievements UI component
```

### 4. Assign Reviewers

- **Minimum:** 1 reviewer
- **Recommended:** 2 reviewers
- **Required for hotfixes:** Tech Lead must review

---

## 👀 Code Review Guidelines

### For Authors

#### Before Requesting Review

- ✅ Self-review your own code first
- ✅ Add descriptive PR description
- ✅ Add screenshots for UI changes
- ✅ Link related issues
- ✅ Ensure CI passes

#### During Review

- ✅ Respond to all comments
- ✅ Push fixes promptly
- ✅ Re-request review after changes
- ❌ No defensiveness - reviewers help you improve

---

### For Reviewers

#### What to Check

**Code Quality:**
- ✅ Follows [CODING-STANDARDS.md](./CODING-STANDARDS.md)
- ✅ No code smells (duplicación, complejidad excesiva)
- ✅ Functions/classes tienen responsabilidad única
- ✅ Naming is clear y descriptivo

**Functionality:**
- ✅ Soluciona el problema descrito
- ✅ No introduce bugs
- ✅ Edge cases considerados
- ✅ Error handling apropiado

**Tests:**
- ✅ Tests escritos para nueva funcionalidad
- ✅ Tests existentes no se rompieron
- ✅ Coverage no disminuyó significativamente

**Security:**
- ✅ No SQL injection risks
- ✅ No XSS vulnerabilities
- ✅ Secrets no hardcodeados
- ✅ Input validation presente

**Performance:**
- ✅ No N+1 queries
- ✅ No memory leaks aparentes
- ✅ Indexes DB apropiados (si aplica)

**Documentation:**
- ✅ Code comments donde necesario
- ✅ API docs actualizadas (si aplica)
- ✅ _MAP.md actualizados (si aplica)

#### Comment Types

Use prefixes para claridad:

- **nit:** Sugerencia menor (no blocker)
  ```
  nit: Consider renaming `temp` to `temporaryValue` for clarity
  ```

- **question:** Pregunta para entender mejor
  ```
  question: Why did you choose setTimeout over setInterval here?
  ```

- **suggestion:** Sugerencia de mejora
  ```
  suggestion: This could be simplified using Array.filter()
  ```

- **blocking:** Debe arreglarse antes de merge
  ```
  blocking: This will cause a memory leak, needs fixing
  ```

#### Approval Criteria

**✅ Approve when:**
- Code meets standards
- Tests pass
- No blocking issues
- Documentation updated

**🔄 Request changes when:**
- Blocking issues present
- Tests missing/failing
- Security concerns
- Major refactoring needed

**💬 Comment (no approval) when:**
- Only nits/questions
- Author should decide
- Want to see discussion

---

## 🔀 Merge Strategies

### Squash and Merge (Default)

**When:** Most feature branches

**Result:** Todos los commits se squashean en 1 commit

```bash
# Before merge
feature/GAMI-123-my-feature
├── commit 1: WIP: start feature
├── commit 2: fix typo
├── commit 3: address review comments
└── commit 4: final fixes

# After merge to main
main
└── feat(module): add my feature (GAMI-123)
```

**Pros:**
- ✅ Clean history en main
- ✅ Un commit = una feature
- ✅ Easy to revert

**Use when:** Default para la mayoría de PRs

---

### Merge Commit

**When:** Mantener history detallado

**Result:** Todos los commits preservados + merge commit

```bash
# After merge
main
├── Merge pull request #123 from feature/...
│   ├── commit 1
│   ├── commit 2
│   └── commit 3
```

**Pros:**
- ✅ History completo preservado
- ✅ Ver evolución de la feature

**Cons:**
- ⚠️ History más verboso

**Use when:** Quieres preservar detailed commit history

---

### Rebase and Merge

**When:** Mantener linear history

**Result:** Commits replicados en main (sin merge commit)

**Pros:**
- ✅ Linear history
- ✅ Clean git log

**Cons:**
- ⚠️ Rewrites history (no usar en shared branches)

**Use when:** Small, well-committed PRs

---

## 🔧 Resolving Conflicts

### Scenario: Tu branch está desactualizado

```bash
# Tu branch
feature/GAMI-123-my-feature

# Main branch ha avanzado
git checkout main
git pull origin main

# Merge main en tu branch
git checkout feature/GAMI-123-my-feature
git merge main
```

### If Conflicts Occur

```bash
# Git te mostrará archivos en conflicto
Auto-merging src/services/user.service.ts
CONFLICT (content): Merge conflict in src/services/user.service.ts

# Abrir archivo y resolver conflictos
code src/services/user.service.ts
```

**Conflicto example:**
```typescript
<<<<<<< HEAD (tu branch)
function calculateScore(attempts: number): number {
  return attempts * 15;  // Tu cambio: 15 coins
}
=======
function calculateScore(attempts: number, multiplier: number): number {
  return attempts * 10 * multiplier;  // Main: agregó multiplier
}
>>>>>>> main
```

**Resolver:**
```typescript
// Combinar ambos cambios
function calculateScore(attempts: number, multiplier: number): number {
  return attempts * 15 * multiplier;  // 15 coins + multiplier
}
```

**Después de resolver:**
```bash
# Mark como resuelto
git add src/services/user.service.ts

# Complete el merge
git commit -m "merge main into feature/GAMI-123"

# Push
git push origin feature/GAMI-123-my-feature
```

---

## 🎯 Git Commands Cheatsheet

### Daily Commands

```bash
# Ver status
git status

# Ver cambios
git diff

# Agregar archivos
git add .                    # Todos
git add src/                 # Carpeta específica
git add src/services/*.ts    # Pattern matching

# Commit
git commit -m "feat(auth): add OAuth login"

# Push
git push origin feature/GAMI-123-my-feature

# Pull latest
git pull origin main
```

### Branch Management

```bash
# Crear branch
git checkout -b feature/GAMI-123-my-feature

# Cambiar branch
git checkout main

# Listar branches
git branch                   # Local
git branch -r                # Remote
git branch -a                # All

# Eliminar branch
git branch -d feature/GAMI-123-my-feature  # Local
git push origin --delete feature/GAMI-123-my-feature  # Remote
```

### Undo Changes

```bash
# Descartar cambios locales (no staged)
git checkout -- src/file.ts

# Unstage archivo
git reset HEAD src/file.ts

# Revert último commit (crea nuevo commit)
git revert HEAD

# Reset a commit anterior (⚠️ destructivo)
git reset --hard HEAD~1

# Amend último commit
git commit --amend -m "feat(auth): add OAuth login (fixed typo)"
```

### Stashing

```bash
# Guardar cambios temporalmente
git stash

# Ver stashes
git stash list

# Aplicar último stash
git stash pop

# Aplicar stash específico
git stash apply stash@{0}

# Eliminar stash
git stash drop stash@{0}
```

### History

```bash
# Ver commits
git log

# Ver commits con diff
git log -p

# Ver commits de un archivo
git log -- src/services/user.service.ts

# Ver commits por autor
git log --author="John Doe"

# Ver graph
git log --graph --oneline --all
```

### Advanced

```bash
# Cherry-pick commit
git cherry-pick abc123

# Interactive rebase (⚠️ avanzado)
git rebase -i HEAD~3

# Bisect (find bug)
git bisect start
git bisect bad
git bisect good abc123

# Blame (who changed line)
git blame src/services/user.service.ts
```

---

## 📚 Referencias

- [Conventional Commits Specification](https://www.conventionalcommits.org/)
- [GitHub Flow](https://guides.github.com/introduction/flow/)
- [Git Branching Strategies](https://www.atlassian.com/git/tutorials/comparing-workflows)
- [Pro Git Book](https://git-scm.com/book/en/v2)

---

**Última actualización:** 2025-11-07
**Versión:** 1.0
**Próxima revisión:** 2025-12-07
