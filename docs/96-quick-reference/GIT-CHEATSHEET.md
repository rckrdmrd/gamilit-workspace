# Git Cheatsheet - GAMILIT

**Ultima actualizacion:** 2026-01-04

---

## Configuracion Inicial

```bash
# Clonar repositorio
git clone git@gitea.isem.dev:gamilit/gamilit.git

# Configurar usuario
git config user.name "Tu Nombre"
git config user.email "tu@email.com"
```

---

## Flujo de Trabajo

### Crear Feature Branch

```bash
# Actualizar develop
git checkout develop
git pull origin develop

# Crear branch
git checkout -b feature/EPIC-XXX-descripcion
```

### Commits

```bash
# Ver cambios
git status
git diff

# Agregar cambios
git add .
git add archivo.ts

# Commit con mensaje
git commit -m "feat(EPIC-XXX): descripcion del cambio"
```

### Push y PR

```bash
# Push a remoto
git push -u origin feature/EPIC-XXX-descripcion

# Crear PR via CLI
gh pr create --title "feat: descripcion" --body "..."
```

---

## Convenciones de Commits

```
<tipo>(<scope>): <descripcion>

Tipos:
- feat: nueva funcionalidad
- fix: correccion de bug
- docs: documentacion
- style: formato (no afecta codigo)
- refactor: refactorizacion
- test: tests
- chore: mantenimiento

Ejemplos:
feat(EAI-003): add XP calculation service
fix(auth): correct token expiration
docs(api): update endpoint documentation
```

---

## Comandos Utiles

```bash
# Ver historial
git log --oneline -10

# Ver branches
git branch -a

# Cambiar branch
git checkout <branch>

# Merge
git merge <branch>

# Rebase interactivo
git rebase -i HEAD~3

# Stash cambios
git stash
git stash pop

# Reset (cuidado!)
git reset --soft HEAD~1  # mantiene cambios
git reset --hard HEAD~1  # elimina cambios
```

---

## Resolucion de Conflictos

```bash
# Durante merge/rebase
git status  # ver archivos en conflicto

# Editar archivos, resolver conflictos
# Buscar <<<<<<< ======= >>>>>>>

# Marcar como resuelto
git add <archivo>
git rebase --continue  # o git merge --continue
```

---

## Referencias

- [GIT-CONVENTIONS.md](../archivados/98-standards-deprecated/GIT-CONVENTIONS.md)
- [Documentacion Git](https://git-scm.com/doc)
