---
name: simco-git-workflow
description: "Estandarizacion de operaciones git (fetch, commit, push, branch management)"
version: 1.0.0
simco_source: orchestration/directivas/simco/SIMCO-GIT.md
category: operation
priority: P1
capved_required: false
agents_compatible:
  - claude-code
  - gemini-cli
  - windsurf
  - trae
dependencies:
  - simco-safe-edit
triggers:
  - on_commit
  - on_push
  - on_branch_change
internal: true
estimated_tokens: 800
tags:
  - git
  - versionado
  - monorepo
  - workflow
input_schema:
  required:
    - operation_type
    - commit_message_or_branch
  optional:
    - files_to_stage
    - target_remote
    - force_options
output_schema:
  success:
    - commit_hash
    - push_status
    - branch_state
  error:
    - error_code
    - error_message
contract_version: 1.0.0
---

# simco-git-workflow

## Proposito
Estandarizar todas las operaciones git del monorepo gamilit, garantizando que cada commit, push y cambio de rama siga las convenciones del proyecto, mantenga coherencia con el remoto y evite estados inconsistentes.

## Cuando Usar
- Antes de cualquier commit al repositorio.
- Al iniciar trabajo en una rama nueva o al cambiar de rama.
- Cuando se necesita sincronizar con el remoto (fetch, pull, push).
- Al preparar cambios para deploy (merge a master).

## Cuando NO Usar
- Para operaciones de solo lectura (git log, git show, git blame) que no modifican estado.
- Cuando se esta en modo analisis sin intencion de persistir cambios.
- Para operaciones destructivas no autorizadas (force push, reset --hard) -- estas requieren autorizacion explicita.

## Prerequisitos
- Repositorio git inicializado con remote configurado (`origin`).
- Acceso de escritura al remote (SSH key o token configurado).
- Conocimiento de la convencion de commit: `[GAM-XXX] tipo: descripcion`.

## Instrucciones

### Paso 1: Verificar estado remoto (fetch)
```bash
git fetch origin && git log HEAD..origin/master --oneline
```
Si hay commits nuevos en el remoto, ejecutar `git pull` antes de continuar. Esto previene conflictos y asegura que el trabajo parte del estado mas reciente. **Regla RC1: FETCH ANTES DE OPERAR.**

### Paso 2: Verificar working tree
```bash
git status
```
Revisar:
- Archivos modificados (M) -- son cambios intencionados?
- Archivos sin rastrear (??) -- deben ser agregados o ignorados?
- No debe haber archivos con conflictos pendientes (UU).
- Verificar que no haya archivos sensibles (.env, credenciales) en los cambios.

### Paso 3: Stage de cambios selectivo
```bash
git add <archivo1> <archivo2> ...
```
**NUNCA usar `git add .` o `git add -A` sin revision previa.** Agregar archivos especificos y relevantes al commit. Excluir:
- Archivos de configuracion local (.env.local, .env.dev con credenciales reales)
- Archivos generados (node_modules/, dist/, build/)
- Archivos temporales o de debug

### Paso 4: Crear commit con convencion
```bash
git commit -m "[GAM-XXX] tipo: descripcion concisa del cambio"
```
Convenciones de tipo:
- `feat:` -- nueva funcionalidad
- `fix:` -- correccion de bug
- `docs:` -- cambios en documentacion
- `chore:` -- mantenimiento, configuracion
- `refactor:` -- reestructuracion sin cambio funcional
- `test:` -- adicion o modificacion de tests
- `ci:` -- cambios en CI/CD

### Paso 5: Push con verificacion
```bash
git push origin master
```
Si el push es rechazado:
1. `git fetch origin` para actualizar refs
2. `git pull --rebase origin master` para incorporar cambios remotos
3. Resolver conflictos si los hay
4. `git push origin master` de nuevo

### Paso 6: Validar estado remoto post-push
```bash
git status
git log --oneline -3
```
Confirmar:
- Working tree limpio ("nothing to commit, working tree clean")
- El commit aparece en el log con el hash esperado
- El branch esta sincronizado con origin ("Your branch is up to date")

## Manejo de Errores

| Escenario | Accion | Ejemplo |
|-----------|--------|---------|
| Merge conflict | Resolver manualmente cada conflicto, verificar coherencia, stage y commit | `git diff --name-only --diff-filter=U` para listar conflictos |
| Push rejection | Fetch + pull --rebase, resolver conflictos si hay, push de nuevo | `git pull --rebase origin master && git push` |
| Hook failure (pre-commit) | Corregir el problema reportado, re-stage, crear NUEVO commit (NO --amend) | Lint error -> fix -> `git add . && git commit -m "..."` |
| Dirty worktree inesperado | Stash temporal si son cambios no relacionados, o commit parcial | `git stash push -m "wip: cambios no relacionados"` |
| Branch divergida | Rebase sobre master para linearizar historia | `git rebase origin/master` |

## Formato de Salida

```yaml
git_operation_result:
  commit_hash: "abc1234"
  push_status: "success" | "rejected" | "conflict"
  branch_state:
    current: "master"
    ahead: 0
    behind: 0
    clean: true
  files_committed:
    - path: "apps/backend/src/..."
      status: "modified"
    - path: "apps/database/ddl/..."
      status: "added"
  warnings: []
```

## Checklist de Validacion
- [ ] Se ejecuto `git fetch origin` antes de operar.
- [ ] Se verifico el working tree con `git status`.
- [ ] Los archivos fueron staged selectivamente (no `git add .`).
- [ ] El mensaje de commit sigue la convencion `[GAM-XXX] tipo: descripcion`.
- [ ] El push fue exitoso y el branch esta sincronizado.
- [ ] No se incluyeron archivos sensibles o generados.

## Referencias
- `orchestration/directivas/simco/SIMCO-GIT.md`
- `orchestration/directivas/simco/SIMCO-MONOREPO.md`
- `docs/40-standards/ESTANDAR-GIT.md`
- CLAUDE.md -- RC1: FETCH ANTES DE OPERAR, RC4: MONOREPO -- SINGLE GIT REPO
