# Gemini Configuration for Gamilit

**Version:** 2.2.0  
**Updated:** 2026-02-17

## Inheritance

This repository is **standalone** and governed locally by `CLAUDE.md` + `orchestration/`.

---

## Project Context (Critical)

| Aspect | Value |
|--------|-------|
| **Project** | Gamilit - Plataforma de Gamificacion Educativa |
| **Type** | STANDALONE |
| **Stack** | NestJS 11, React 19, PostgreSQL 15 |
| **Monorepo** | Yes (`apps/backend`, `apps/frontend`, `apps/database`) |

### Portals

| Portal | URL Local | Description |
|--------|-----------|-------------|
| Student | http://localhost:3005/student | Student portal |
| Teacher | http://localhost:3005/teacher | Teacher portal |
| Admin | http://localhost:3005/admin | Admin portal |
| Parent | http://localhost:3005/parent | Parent portal |

### Key Metrics (SSOT: `orchestration/inventarios/MASTER_INVENTORY.yml`)

- **Backend:** 23 modules, 901 endpoints, 152 entities
- **Frontend:** 488 components, 70 pages
- **Database:** 18 schemas (16 active + 2 placeholder), 169 tables
- **MVP:** 98% complete

---

## Critical Boot Sequence

**Before any task, execute in order:**

### Step 0: Platform Detection
```
Working directory starts with C:\ or D:\ -> WINDOWS
Working directory starts with /home/ or /mnt/c/ -> LINUX/WSL
```
On Windows, prefer `npm` commands over bash-style inline env syntax.

### Step 1: Load Bootloader
Read: `.gemini/antigravity/BOOTLOADER_PROTOCOL.md`

### Step 2: Load Base Context
Read in order:
1. `CLAUDE.md`
2. `.gemini/antigravity/AGENT-CAPABILITIES.yml`
3. `orchestration/CONTEXT-MAP.yml`

### Step 3: Load Current State
Read: `orchestration/PROXIMA-ACCION.md`

### Step 4: Load Task-Specific Directive
Load from `orchestration/directivas/simco/`:
- Analysis -> `SIMCO-VALIDAR.md`
- Backend -> `SIMCO-BACKEND.md`
- Frontend -> `SIMCO-FRONTEND.md`
- Database -> `SIMCO-DDL.md`
- Git -> `SIMCO-GIT.md`

### Step 5: Self-Persona Switch (if needed)
Load profile from `orchestration/agents/perfiles/` according to task domain.

---

## Role and Boundaries

Primary role: QA/testing support with browser-centric validations.

### No Subagents
Gemini runs as a single agent session in this project.
- Flatten delegation instructions into sequential steps.
- Use Self-Persona Switch when directives mention specialist roles.

---

## Testing Workflow

### Before Testing
```
1. Verify backend is running: curl http://localhost:3006/health
2. Verify frontend is running: curl http://localhost:3005
3. Check test credentials in orchestration/testing/CREDENTIALS.md
```

### During Testing
```
1. Follow assigned cases
2. Document results
3. Capture failure evidence
4. Report unexpected behavior
```

### After Testing
```
1. Save report under orchestration/testing/reportes/
2. Update task state/checkpoints
3. Follow git protocol from SIMCO-GIT.md
```

---

## Quick Reference

### Common URLs
```
Student Dashboard: http://localhost:3005/student/dashboard
Teacher Dashboard: http://localhost:3005/teacher/dashboard
Admin Dashboard: http://localhost:3005/admin/dashboard
Parent Dashboard: http://localhost:3005/parent/dashboard
Login: http://localhost:3005/{portal}/login
```

### Validation Commands
```cmd
cd apps/frontend && npm run build && npm run lint
cd apps/backend && npm run build && npm run lint
```

---

## References

- `CLAUDE.md`
- `.gemini/antigravity/BOOTLOADER_PROTOCOL.md`
- `.gemini/antigravity/AGENT-CAPABILITIES.yml`
- `orchestration/CONTEXT-MAP.yml`
- `orchestration/PROXIMA-ACCION.md`
- `orchestration/inventarios/MASTER_INVENTORY.yml`
