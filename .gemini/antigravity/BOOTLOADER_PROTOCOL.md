# Gemini Bootloader Protocol - GAMILIT
# Dynamic Context Loading for Standalone Workspace

**Version:** 1.0.0
**Updated:** 2026-01-29
**Project:** GAMILIT (EdTech Platform)
**Type:** STANDALONE + REFERENCE_SOURCE

---

## 1. The Core Principle

**"Do not carry static rules. Read the live map."**

You are an agent operating in a **SIMCO/CAPVED** governed workspace. GAMILIT is a **STANDALONE** project with all definitions replicated locally. Read them dynamically from `orchestration/`.

---

## 2. Configuration Files (READ FIRST)

Before starting any task, load these files IN ORDER:

| # | File | Purpose | Priority |
|---|------|---------|----------|
| 1 | `AGENT-CAPABILITIES.yml` | Your capabilities and limitations | **CRITICAL** |
| 2 | `../../../.claude/CLAUDE.md` | Local project rules | **CRITICAL** |
| 3 | `../../orchestration/CONTEXT-MAP.yml` | Pre-resolved variables | **CRITICAL** |
| 4 | `../../orchestration/PROXIMA-ACCION.md` | Current state | HIGH |

---

## 3. Capability Adaptation (NO SUBAGENTS)

> [!IMPORTANT]
> **Constraint**: You operate as a SINGLE agent session. You do NOT have "coding subagents".
>
> **Adaptation**: When you encounter directives about `SIMCO-DELEGACION` or "Assign to Subagent":
> 1. **Do NOT stop** or ask for a subagent.
> 2. **Flatten the Hierarchy**: Convert "Subagent Task" into "Sequential Step".
> 3. **Self-Persona Switch**: Temporarily adopt the persona of the required agent.
>
> See `AGENT-CAPABILITIES.yml` for detailed adaptation rules.

---

## 4. The Boot Sequence

When you start a task, execute these steps IN ORDER:

### Step 0: Platform Detection (CRITICAL)

```
Working directory path format:
├─ Starts with C:\ or D:\  → WINDOWS
├─ Starts with /home/      → LINUX
└─ Starts with /mnt/c/     → WSL
```

**GAMILIT runs primarily on Windows. Use CMD syntax for npm commands.**

### Step 1: Load Base Context

Read these files in order:
1. `.claude/CLAUDE.md` - Local project rules (GAMILIT-specific)
2. `.gemini/antigravity/AGENT-CAPABILITIES.yml` - Your specific capabilities
3. `orchestration/CONTEXT-MAP.yml` - Pre-resolved variables for NEXUS

### Step 2: Load Current State

Read: `orchestration/PROXIMA-ACCION.md` - Current checkpoint and next actions

### Step 3: Load Task-Specific Directives

Based on task type, load from `orchestration/directivas/simco/`:

| Task Type | Directive |
|-----------|-----------|
| Create new objects | `SIMCO-CREAR.md` |
| Modify existing code | `SIMCO-MODIFICAR.md` |
| Database/DDL | `SIMCO-DDL.md` |
| Backend development | `SIMCO-BACKEND.md` |
| Frontend development | `SIMCO-FRONTEND.md` |
| Testing/Validation | `SIMCO-VALIDAR.md` |
| Git operations | `SIMCO-GIT.md` |

### Step 4: Load Profile (Self-Persona Switch)

Read the relevant profile from `orchestration/agents/perfiles/`:

| Domain | Profile |
|--------|---------|
| Database tasks | `PERFIL-DATABASE.md` |
| Backend tasks | `PERFIL-BACKEND.md` |
| Frontend tasks | `PERFIL-FRONTEND.md` |
| Testing tasks | `PERFIL-TESTING.md` |
| Gamification | `PERFIL-GAMIFICATION-SPECIALIST.md` |

Apply that profile's rules during task execution.

---

## 5. GAMILIT-Specific Context

### Project Structure

```
apps/
├── backend/     → NestJS 11, 17 modules, 850 endpoints
├── frontend/    → React 18, 4 portals (student, teacher, admin, parent)
├── database/    → PostgreSQL 16, 18 schemas (16 active + 2 placeholder), 171 tables
└── devops/      → Scripts and deployment
```

### Key Paths

| Alias | Path |
|-------|------|
| @GAMILIT_BACKEND | apps/backend/src |
| @GAMILIT_FRONTEND | apps/frontend/src |
| @GAMILIT_DDL | apps/database/ddl |
| @INV_DB | orchestration/inventarios/DATABASE_INVENTORY.yml |
| @INV_BE | orchestration/inventarios/BACKEND_INVENTORY.yml |
| @INV_FE | orchestration/inventarios/FRONTEND_INVENTORY.yml |

### Database Credentials

```
Database: gamilit_platform
User: gamilit_user
Password: gamilit_dev_2026
Port: 5432
```

---

## 6. Execution Mode

Once loaded, you are ready:
1. Follow **CAPVED** (C→A→P→V→E→D)
2. Use todo list to track progress
3. Update `orchestration/inventarios/` as you go
4. Commit changes following `SIMCO-GIT.md`

---

## 7. Quick Reference: Windows Commands

Since GAMILIT runs on Windows:

```cmd
# CORRECT (Windows CMD)
npm test                           # Uses cross-env from package.json
npm run build
npm run lint

# For backend (from apps/backend/)
npm run build
npm run lint
npm run test

# For frontend (from apps/frontend/)
npm run build
npm run lint
npm run test

# GAMILIT-specific validations
npm run sync:enums                 # Sync ENUMs BD→Backend→Frontend
npm run validate:constants         # Validate SSOT
npm run validate:api-contract      # Validate API routes
```

---

## 8. Error Recovery

If you get stuck:
1. Check `AGENT-CAPABILITIES.yml` for known limitations
2. Re-read `orchestration/PROXIMA-ACCION.md` for last checkpoint
3. Verify you're using correct Windows commands
4. Check todo list to resume where you left off

---

## 9. Task Closure Protocol (BLOCKING)

Before marking ANY task as completed:

```markdown
## Pre-Closure Verification
### 0. Governance (BLOCKING)
[ ] Task folder exists: orchestration/tareas/{date}/TASK-{ID}/
[ ] METADATA.yml complete with phases C, E, D
[ ] _INDEX.yml updated

### 1. Technical Validations
[ ] Build passes (backend + frontend)
[ ] Lint passes
[ ] Tests pass (if exist)

### 2. Layer Coherence
[ ] DDL ↔ Backend coherent (171 tables ↔ 141 entities, 82.5% coherence)
[ ] Backend ↔ Frontend coherent (850 endpoints ↔ services)

### 3. Git Finalized
[ ] All changes committed
[ ] Pushed to origin/main
```

---

## 10. File References

All configuration files:

```
.gemini/antigravity/
├── README.md                 # Entry point (existing)
├── BOOTLOADER_PROTOCOL.md    # This file
├── AGENT-CAPABILITIES.yml    # Capabilities and limitations
└── roles/                    # Specialized roles (optional)
```

---

*GAMILIT Standalone Workspace - Gemini Configuration v1.0.0*
