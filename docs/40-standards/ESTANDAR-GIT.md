# Estándar de Git

> Convenciones para commits, branches y pull requests

> **NOTA:** Resumen ejecutivo para usuarios.
> **Fuente de verdad:** `orchestration/directivas/estandares/`
> **Sincronizado:** 2026-01-16

## Mensajes de Commit

### Formato
```
[GAM-TIPO] Descripción corta (max 50 chars)

Descripción opcional más larga que explica el "por qué"
del cambio, no el "qué" (el diff muestra el qué).

Líneas de máximo 72 caracteres.

Co-Authored-By: Nombre <email>
```

**NOTA:** Este documento usa formato genérico `[TIPO]` como referencia. El proyecto gamilit usa el prefijo `[GAM-TIPO]` (ej: `[GAM-FEAT]`, `[GAM-FIX]`). Ver CLAUDE.md y commits recientes para ejemplos.

### Tipos de Commit

| Tipo | Uso | Ejemplo |
|------|-----|---------|
| `[FEAT]` | Nueva funcionalidad | `[FEAT] Add user authentication` |
| `[FIX]` | Corrección de bug | `[FIX] Resolve login timeout issue` |
| `[DOCS]` | Solo documentación | `[DOCS] Update API documentation` |
| `[REFACTOR]` | Refactorización | `[REFACTOR] Extract validation logic` |
| `[TEST]` | Agregar/modificar tests | `[TEST] Add unit tests for UserService` |
| `[CHORE]` | Mantenimiento | `[CHORE] Update dependencies` |
| `[STYLE]` | Formato, no lógica | `[STYLE] Apply prettier formatting` |
| `[PERF]` | Mejora de rendimiento | `[PERF] Optimize database queries` |
| `[SECURITY]` | Fix de seguridad | `[SECURITY] Sanitize user input` |
| `[MIGRATION]` | Migración de datos/código | `[MIGRATION] Move from V1 to V2` |
| `[ORCHESTRATION]` | Sistema SIMCO | `[ORCHESTRATION] Add new trigger` |

### Ejemplos Buenos

```bash
# ✅ Descriptivo, enfocado en el "por qué"
[FEAT] Add JWT refresh token mechanism

Implements automatic token refresh to improve UX by preventing
forced logouts during long sessions.

Co-Authored-By: Claude <noreply@anthropic.com>
```

```bash
# ✅ Bug fix con contexto
[FIX] Prevent duplicate user creation

Race condition in registration flow could create duplicate
users. Added database-level unique constraint and optimistic
locking.

Fixes #123
```

### Ejemplos Malos

```bash
# ❌ Muy genérico
fix bug

# ❌ Describe el qué, no el por qué
[FEAT] Add function getUserById

# ❌ Múltiples cambios no relacionados
[FEAT] Add login, fix bugs, update deps
```

## Branches

### Nomenclatura

| Tipo | Patrón | Ejemplo |
|------|--------|---------|
| Feature | `feature/{descripcion}` | `feature/user-authentication` |
| Bug fix | `fix/{descripcion}` | `fix/login-timeout` |
| Hotfix | `hotfix/{descripcion}` | `hotfix/security-patch` |
| Migración | `migration/{descripcion}` | `migration/documentation-refactor` |
| Release | `release/{version}` | `release/v1.2.0` |
| Integration | `integration/{descripcion}` | `integration/docs-all-projects` |

### Flujo de Trabajo

```
main (producción)
  │
  ├── develop (desarrollo)
  │     │
  │     ├── feature/user-auth
  │     │     └── PR → develop
  │     │
  │     └── fix/login-bug
  │           └── PR → develop
  │
  └── hotfix/critical-security
        └── PR → main + develop
```

## Pull Requests

### Título
```
[TIPO] Descripción breve del cambio
```

### Cuerpo
```markdown
## Summary
- Punto 1 del cambio
- Punto 2 del cambio

## Test plan
- [ ] Tests unitarios pasan
- [ ] Tests de integración pasan
- [ ] Probado manualmente en...

## Related
- Closes #123
- Related to #456
```

### Checklist Antes de Merge

- [ ] Build pasa (`npm run build`)
- [ ] Lint pasa (`npm run lint`)
- [ ] Tests pasan (`npm run test`)
- [ ] Documentación actualizada
- [ ] Inventarios actualizados (si aplica)
- [ ] Review aprobado

## Reglas de Seguridad

### NUNCA hacer

| Acción | Razón |
|--------|-------|
| `git push --force` a main/master | Destruye historial |
| Commit de secrets/credenciales | Seguridad |
| Commit sin validar build | Rompe CI |
| Merge sin review | Calidad |

### Antes de Push

```bash
# Validar todo
npm run build && npm run lint && npm run test

# Verificar qué se va a push
git log origin/master..HEAD --oneline

# Verificar archivos sensibles
git diff --cached --name-only | grep -E '\.env|secret|password'
```

## Submodules

**NOTA: Sección NO aplica a gamilit - es monorepo sin submodules (ver CLAUDE.md RC4)**

El siguiente contenido es de referencia para proyectos con submodules. Gamilit usa estructura MONOREPO donde backend, frontend y database están en el mismo repositorio Git sin submodules.

```bash
# Clonar con submodules (NO aplica a gamilit)
git clone --recurse-submodules <repo>

# Actualizar submodules (NO aplica a gamilit)
git submodule update --init --recursive

# Cambios en submodule (NO aplica a gamilit)
cd projects/{proyecto}
git checkout main
git pull
cd ../..
git add projects/{proyecto}
git commit -m "[CHORE] Update {proyecto} submodule"
```

---

## Referencias

- [ESTANDAR-CODIGO.md](./ESTANDAR-CODIGO.md) - Código
- [Conventional Commits](https://www.conventionalcommits.org/) - Especificación
