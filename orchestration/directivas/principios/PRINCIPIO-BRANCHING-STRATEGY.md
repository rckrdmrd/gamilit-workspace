# PRINCIPIO: BRANCHING STRATEGY

**Version:** 1.0.0
**Fecha:** 2026-02-11
**Aplica a:** Gamilit (Standalone Monorepo)

---

## ESTRATEGIA

Gamilit usa **trunk-based development** con branch unico `main`:

```
main (trunk)
  └── Todos los commits van directo a main
  └── Deploy a produccion desde main
  └── NO feature branches de larga duracion
```

## REGLAS

1. **Branch principal:** `main` (antes `master`, migrar cuando sea oportuno)
2. **Commits directos a main:** SI (con validacion pre-commit)
3. **Feature branches:** Solo si el cambio es mayor a 3 dias de trabajo
4. **Hotfix:** Directo a main + deploy inmediato
5. **Formato commit:** `[GAM-XXX] tipo: descripcion`

## TIPOS DE COMMIT

| Prefijo | Uso |
|---------|-----|
| `feat` | Nueva funcionalidad |
| `fix` | Correccion de bug |
| `refactor` | Refactorizacion sin cambio funcional |
| `docs` | Solo documentacion |
| `test` | Solo tests |
| `chore` | Mantenimiento, dependencias |
| `perf` | Mejora de rendimiento |

## FLUJO DE DEPLOY

```
Desarrollo local (WSL) → git push main → SSH a servidor → git pull → build → pm2 restart
```

## REFERENCIAS

- `SIMCO-GIT.md` - Protocolo git completo
- `SIMCO-GIT-WORKFLOW.md` - Workflow detallado
- `ESTANDAR-GIT.md` - Estandar de commits

---

**Version:** 1.0.0 | **Tipo:** Principio
