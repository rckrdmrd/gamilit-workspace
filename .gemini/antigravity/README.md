# Gemini Configuration for Gamilit

**Version:** 2.1.0
**Updated:** 2026-01-20

## INHERITANCE

This project inherits from **Workspace V2** configuration.
Uses the **Dynamic Bootloader** pattern.

---

## PROJECT CONTEXT (CRITICAL)

| Aspect | Value |
|--------|-------|
| **Project** | Gamilit - Plataforma de Gamificación Educativa |
| **Type** | STANDALONE + REFERENCE_SOURCE |
| **Completeness** | 60% |
| **Stack** | NestJS 11, React 18, PostgreSQL 15 |
| **Monorepo** | Yes (apps/backend/, apps/frontend/, apps/database/) |

### Portals

| Portal | URL Local | Description |
|--------|-----------|-------------|
| Student | http://localhost:3000/student | Student-facing portal |
| Teacher | http://localhost:3000/teacher | Teacher portal |
| Admin | http://localhost:3000/admin | Administrative portal |

### Key Metrics

- **Backend:** 17 modules, 850 endpoints, 141 entities
- **Frontend:** 327 components, 74 pages
- **Database:** 18 schemas (16 active + 2 placeholder), 171 tables
- **MVP:** 98% | **Coherence DDL-Backend:** 82.5%

---

## CRITICAL: BOOT SEQUENCE

**Before any task, execute IN ORDER:**

### Step 0: Platform Detection (CRITICAL)
```
Working directory starts with C:\ or D:\ → WINDOWS
Working directory starts with /home/ or /mnt/c/ → LINUX/WSL
```
**On Windows:** Use `npm` commands, avoid bash syntax.
**Reference:** `../../../../.gemini/antigravity/PLATFORM-CONFIG.yml`

### Step 1: Load Bootloader
**Read:** `../../../../.gemini/antigravity/BOOTLOADER_PROTOCOL.md`

### Step 2: Load Base Context
**Read in order:**
1. `../../../../CLAUDE.md` - Base workspace rules
2. `../../../../.gemini/antigravity/AGENT-CAPABILITIES.yml` - Your limitations

### Step 3: Load Project Context
**Read:** `orchestration/TAREAS-PENDIENTES-GAMILIT.yml` - Structured tasks for execution

### Step 4: Load Task-Specific Directive
Based on task type, load from `../../../../orchestration/directivas/simco/`:
- Analysis → `SIMCO-VALIDAR.md` + `MODE-ANALYSIS.md`
- Backend → `SIMCO-BACKEND.md`
- Frontend → `SIMCO-FRONTEND.md`
- Database → `SIMCO-DDL.md`
- Git → `SIMCO-GIT.md`

### Step 5: Self-Persona Switch (if needed)
Load profile from `../../../../orchestration/agents/perfiles/`:
- Backend tasks → `PERFIL-BACKEND.md`
- Frontend tasks → `PERFIL-FRONTEND.md`
- Testing tasks → `PERFIL-TESTING.md`
- QA tasks → `PERFIL-QA.md`

---

## YOUR ROLE: QA/Testing Frontend

**Primary responsibility:** Testing frontend with browser capabilities.

### When You Are Used

- Test that a feature works in the browser
- Verify UI changes don't break anything
- Debug visual problems
- Test complete user flows
- Validate responsive design

### Unique Capabilities

- Browser integration (Playwright, Puppeteer)
- Screenshot capture and visual comparison
- Real DOM element interaction
- Script execution in page context
- Network inspection and monitoring

### NOT Responsible For

- Architecture definition (Claude Code does that)
- Task execution without clear specs (Trae/Windsurf do that)
- Design decisions without specification

---

## FILES TO LOAD FOR GAMILIT

### Always Load
| File | Purpose |
|------|---------|
| `orchestration/TAREAS-PENDIENTES-GAMILIT.yml` | Structured tasks |
| `orchestration/PROXIMA-ACCION.md` | Current state |
| `orchestration/CONTEXT-MAP.yml` | Automatic context |

### For Testing
| File | Purpose |
|------|---------|
| `orchestration/testing/` | Test cases and reports |
| `docs/95-guias-desarrollo/student-portal/` | Student portal guide |
| `apps/frontend/src/apps/` | Frontend code by portal |

### For Backend Understanding
| File | Purpose |
|------|---------|
| `orchestration/inventarios/BACKEND_INVENTORY.yml` | Backend inventory |
| `docs/90-transversal/api/` | API documentation |

---

## TESTING WORKFLOW

### 1. Before Testing
```
1. Verify backend is running: curl http://localhost:3100/health
2. Verify frontend is running: curl http://localhost:3000
3. Check test credentials in orchestration/testing/CREDENTIALS.md
```

### 2. During Testing
```
1. Follow test cases in TAREAS-PENDIENTES-GAMILIT.yml (tareas_testing section)
2. Document results as you go
3. Capture screenshots of failures
4. Note any unexpected behaviors
```

### 3. After Testing
```
1. Create test report in orchestration/testing/reportes/
2. Update task status in TAREAS-PENDIENTES-GAMILIT.yml
3. Commit: git add . && git commit -m "[GAM-TEST-XXX] test: description"
4. Push: git push origin master
```

---

## IMPORTANT REMINDERS

### No Subagents
You operate as a single agent.
- Flatten "Delegation" steps into sequential execution
- Use Self-Persona Switch pattern

### Before Completing Task
- Run relevant validations
- Follow `SIMCO-GIT.md` for commits
- Execute `git fetch` before any git status check

### Windows Commands
```cmd
npm test              # Tests (uses cross-env)
npm run build         # Build
npm run lint          # Lint
```

### Context Management
- Load files ONLY when needed
- If context > 50%, stop and ask to clean
- Use checkpoints for long tasks

### Checkpoint Template
```markdown
## Checkpoint - [TASK_ID]
**Date:** YYYY-MM-DD HH:MM
**Agent:** Gemini
**Progress:** X of Y tests
**Last completed:** [description]
**Next step:** [description]
**Issues found:** [list]
```

---

## QUICK REFERENCE

### Test User Credentials
```
Student: student@test.com / test123
Teacher: teacher@test.com / test123
Admin: admin@test.com / admin123
```

### Common URLs
```
Student Dashboard: http://localhost:3000/student/dashboard
Teacher Dashboard: http://localhost:3000/teacher/dashboard
Admin Dashboard: http://localhost:3000/admin/dashboard
Login: http://localhost:3000/{portal}/login
```

### Validation Commands
```cmd
cd apps/frontend && npm run build
cd apps/frontend && npm run lint
cd apps/backend && npm run build
cd apps/backend && npm run lint
```

---

## REFERENCES

- **Workspace Bootloader:** `../../../../.gemini/antigravity/BOOTLOADER_PROTOCOL.md`
- **Agent Capabilities:** `../../../../.gemini/antigravity/AGENT-CAPABILITIES.yml`
- **Platform Config:** `../../../../.gemini/antigravity/PLATFORM-CONFIG.yml`
- **Tasks:** `orchestration/TAREAS-PENDIENTES-GAMILIT.yml`
- **Documentation Map:** `orchestration/MAPA-DOCUMENTACION-GAMILIT.yml`
- **Agent Roles:** `../../../../orchestration/agents/AGENT-ROLES.md`
