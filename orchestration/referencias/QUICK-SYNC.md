# QUICK-SYNC - Referencia Rápida de Sincronización

**Alias:** `@SYNC`, `@SYNC-WORKSPACE`

---

## Comando Rápido (Sin Conflictos)

```bash
cd /home/isem/gamilit-workspace
git fetch origin && git pull origin master
git submodule update --init --recursive
```

---

## Verificación Rápida

```bash
cd /home/isem/gamilit-workspace
echo "Workspace: $(git rev-parse --short HEAD) vs $(git rev-parse --short origin/master)"
git submodule status | grep "^+" && echo "⚠️ Hay diferencias" || echo "✅ Todo sincronizado"
```

---

## Resolución Rápida de Errores

### "upload-pack: not our ref"
```bash
cd projects/PROYECTO
git fetch origin && git checkout -B main origin/master
cd ../.. && git add projects/PROYECTO && git commit -m "fix: Reset PROYECTO" && git push
```

### Divergent history
```bash
cd projects/PROYECTO
git fetch origin && git checkout -B main origin/master  # Mantener remoto
# O: git push --force origin master                      # Mantener local
```

### Detached HEAD
```bash
cd projects/PROYECTO/SUBMODULO
git checkout main && git pull origin master
```

---

## Bottom-Up Commit (OBLIGATORIO)

```
Nivel 2: cd submodulo && git add . && git commit && git push
    ↓
Nivel 1: cd proyecto && git add submodulo && git commit && git push
    ↓
Nivel 0: cd workspace && git add proyecto && git commit && git push
```

---

## Estado Esperado (2026-01-20)

| Repositorio | Commit |
|-------------|--------|
| gamilit-workspace | 479d9296+ |

---

**Directiva completa:** `orchestration/directivas/simco/SIMCO-SYNC-WORKSPACE.md`
