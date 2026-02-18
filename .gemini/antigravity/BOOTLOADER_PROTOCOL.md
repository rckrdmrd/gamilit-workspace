# Gemini Bootloader Protocol - GAMILIT

**Version:** 1.1.0  
**Updated:** 2026-02-17  
**Project:** GAMILIT  
**Type:** STANDALONE

---

## 1. Core Principle

Read live governance from this repo (`CLAUDE.md` + `orchestration/`), not from external workspaces.

---

## 2. Configuration Files (Read First)

Load in order:

| # | File | Purpose | Priority |
|---|------|---------|----------|
| 1 | `.gemini/antigravity/AGENT-CAPABILITIES.yml` | Capabilities and limitations | CRITICAL |
| 2 | `CLAUDE.md` | Project governance and constraints | CRITICAL |
| 3 | `orchestration/CONTEXT-MAP.yml` | Resolved aliases and paths | CRITICAL |
| 4 | `orchestration/PROXIMA-ACCION.md` | Current checkpoint | HIGH |

---

## 3. Capability Adaptation (No Subagents)

Gemini operates as a single agent in this project.

When directives mention delegation/subagents:
1. Do not spawn subagents.
2. Transform delegated steps into sequential execution.
3. Use Self-Persona Switch with `orchestration/agents/perfiles/`.

---

## 4. Boot Sequence

### Step 0: Platform Detection
```
C:\ or D:\ -> WINDOWS
/home/ or /mnt/c/ -> LINUX/WSL
```

### Step 1: Load Base Context
1. `CLAUDE.md`
2. `.gemini/antigravity/AGENT-CAPABILITIES.yml`
3. `orchestration/CONTEXT-MAP.yml`

### Step 2: Load Current State
- `orchestration/PROXIMA-ACCION.md`

### Step 3: Load Domain Directive
- Create -> `SIMCO-CREAR.md`
- Modify -> `SIMCO-MODIFICAR.md`
- DDL -> `SIMCO-DDL.md`
- Backend -> `SIMCO-BACKEND.md`
- Frontend -> `SIMCO-FRONTEND.md`
- Validation -> `SIMCO-VALIDAR.md`
- Git -> `SIMCO-GIT.md`

### Step 4: Load Persona Profile
From `orchestration/agents/perfiles/` according to domain.

---

## 5. Project Snapshot (SSOT-aligned)

- Backend: 23 modules, 901 endpoints, 152 entities
- Frontend: 488 components, 70 pages
- Database: 18 schemas, 169 tables
- Dev URLs: frontend `http://localhost:3005`, backend `http://localhost:3006`

---

## 6. Task Closure Gate

Before finishing:
- Build/lint/tests according to scope
- Coherence checks across layers
- Follow git protocol from `SIMCO-GIT.md`

---

*GAMILIT Standalone Workspace - Gemini Bootloader Protocol*
