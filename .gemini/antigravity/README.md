# Gemini Configuration for Gamilit

**Version:** 2.0.0
**Updated:** 2026-01-20

## INHERITANCE
This project inherits from **Workspace V2** configuration.
Uses the **Dynamic Bootloader** pattern.

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
**Read:** `orchestration/MAPA-DOCUMENTACION-GAMILIT.yml`

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

## PROJECT CONTEXT
- **Scope:** `projects/gamilit/`
- **Documentation Map:** `orchestration/MAPA-DOCUMENTACION-GAMILIT.yml`
- **Type:** STANDALONE project
- **Stack:** NestJS 11, React 18, PostgreSQL 15

## IMPORTANT REMINDERS

**No Subagents:** You operate as a single agent.
- Flatten "Delegation" steps into sequential execution
- Use Self-Persona Switch pattern

**Before Completing Task:**
- Run `npm run build` and `npm run lint`
- Follow `SIMCO-GIT.md` for commits
- Execute `git fetch` before any git status check

**Windows Commands:**
```cmd
npm test              # Tests (uses cross-env)
npm run build         # Build
npm run lint          # Lint
```
