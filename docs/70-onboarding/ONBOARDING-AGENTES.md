# Onboarding para Agentes IA

> For complete project context, see [`../../CLAUDE.md`](../../CLAUDE.md).

---

## First-Session Checklist

1. **Verify environment:** PostgreSQL running on port 5432, Redis on 6379, Node.js installed
2. **Run build:** `cd apps/backend && npm run build` and `cd apps/frontend && npm run build`
3. **Check git status:** `git fetch origin && git log HEAD..origin/master --oneline` then `git status`
4. **Read CLAUDE.md:** Auto-loaded — confirms stack, modules, rules, aliases
5. **Check next action:** Read [`orchestration/PROXIMA-ACCION.md`](../../orchestration/PROXIMA-ACCION.md) for current priorities

---

## Tool Verification Commands

```bash
# Backend — must pass before closing any task
cd apps/backend && npm run build && npm run lint && npm run test

# Frontend — must pass before closing any task
cd apps/frontend && npm run build && npm run lint && npm run typecheck

# Database — recreate from DDL if schema changed
bash apps/database/scripts/recreate-database.sh
```

---

## Common Pitfalls

1. **Do NOT skip `git fetch`** — RC1 in CLAUDE.md requires fetch before any git verification. Without it, your state is incomplete.
2. **Do NOT create files without checking catalogs** — Always search `orchestration/inventarios/` and `apps/` for existing similar objects (>= 70% match = reuse).
3. **Do NOT leave placeholders** — `// ...` and `/* ... */` are prohibited. Every edit must be complete.
4. **Do NOT treat this as multi-repo** — It is a MONOREPO (single Git repo, NO submodules, NO Gitea).
5. **Do NOT close a task without validating build** — `npm run build && npm run lint && npm run test` must pass.

---

## Key Aliases (Top 10)

| Alias | Path |
|-------|------|
| `@BACKEND` | `apps/backend/src/modules/` |
| `@FRONTEND` | `apps/frontend/src/` |
| `@DDL` | `apps/database/ddl/` |
| `@SEEDS` | `apps/database/seeds/` |
| `@INVENTORY` | `orchestration/inventarios/` |
| `@SIMCO` | `orchestration/directivas/simco/` |
| `@ESTANDARES` | `docs/40-standards/` |
| `@PROJECT-CTX` | `orchestration/PROJECT-CONTEXT.md` |
| `@PROXIMA-ACCION` | `orchestration/PROXIMA-ACCION.md` |
| `@ADRS` | `docs/90-adr/` |

---

## Essential Reading

- [CLAUDE.md](../../CLAUDE.md) — Auto-loaded, source of truth
- [PRINCIPIO-CAPVED.md](../../orchestration/directivas/principios/PRINCIPIO-CAPVED.md) — Task lifecycle (CAPVED cycle)
- [SIMCO-TAREA.md](../../orchestration/directivas/simco/SIMCO-TAREA.md) — Entry point for any task
- [PROXIMA-ACCION.md](../../orchestration/PROXIMA-ACCION.md) — Current sprint priorities
