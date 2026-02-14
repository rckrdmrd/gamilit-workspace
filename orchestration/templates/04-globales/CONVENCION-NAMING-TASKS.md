# CONVENCION-NAMING-TASKS.md — Reglas de Nombrado TASK/SUBTASK

**Version:** 2.0.0
**Fecha:** 2026-02-10
**ADR:** ADR-0020 (DEC-ANID-010/011/012)

---

## Estructura de Archivos

```
EPIC-{PROJECT}-{MODULE}/
├── US-{PROJECT}-{MODULE}-{NNN}/                          ← Carpeta por US
│   ├── US-{PROJECT}-{MODULE}-{NNN}.md                    ← Definicion US (mismo nombre)
│   ├── _INDEX.md                                          ← Indice de tasks
│   ├── TASK-{MODULE}-{NNN}-F0-DATABASE/                   ← Task carpeta por fase
│   │   ├── TASK-{MODULE}-{NNN}-F0-DATABASE.md             ← Definicion task
│   │   ├── SUBTASK-{MODULE}-{NNN}-F0-01-{slug}.md
│   │   └── SUBTASK-{MODULE}-{NNN}-F0-02-{slug}.md
│   ├── TASK-{MODULE}-{NNN}-F1-BACKEND/
│   ├── TASK-{MODULE}-{NNN}-F1-BACKEND-PY/                 ← Subtype opcional
│   ├── TASK-{MODULE}-{NNN}-F2-FRONTEND/
│   ├── TASK-{MODULE}-{NNN}-F3-INTEGRATION/
│   └── TASK-{MODULE}-{NNN}-F4-TEST/
└── _references/                                            ← RF-* y materiales v2
```

> **Nota:** Este patron aplica a TODOS los proyectos del ecosistema (template-saas, erp-core,
> erp-verticals, gamilit, trading-platform, etc.). El {PROJECT} prefix en US/EPIC varía
> por proyecto pero el MODULE prefix en TASK es uniforme.

---

## Reglas de Nombrado

### User Story Folder
- **Patron:** `US-{PROJECT}-{MODULE}-{NNN}/`
- **Ejemplos:** `US-ERP-AUTH-001/`, `US-SAAS-001/`, `US-TRAD-AUTH-001/`
- **NNN:** Secuencial 001-999 dentro del epic

### Task Folder
- **Patron:** `TASK-{MODULE}-{NNN}-F{N}-{CAPA}[-{SUBTYPE}]/`
- **Fases (orden obligatorio):**
  | Fase | Capa | Descripcion |
  |------|------|-------------|
  | F0 | DATABASE | Tablas, DDL, seeds |
  | F1 | BACKEND | Entities, services, controllers, DTOs |
  | F2 | FRONTEND | Pages, components, stores, hooks |
  | F3 | INTEGRATION | APIs externas, webhooks, MCP |
  | F4 | TEST | Unit tests, e2e, integration tests |
- **SUBTYPE (opcional):** Sufijo para distinguir tecnologia o subtareas multiples
  | Subtype | Uso | Ejemplo |
  |---------|-----|---------|
  | `-PY` | Backend Python (FastAPI, ML) | `TASK-LLM-001-F1-BACKEND-PY` |
  | `-TS` | Backend TypeScript (separado de PY) | `TASK-LLM-001-F1-BACKEND-TS` |
  | `-01`, `-02` | Multiples tasks de misma capa | `TASK-AUTH-001-F1-BACKEND-01` |
- **Ejemplo:** `TASK-AUTH-001-F0-DATABASE/`
- **Regla:** No todas las US necesitan las 5 fases. Minimo F0+F1+F4 para US con persistencia.

### Task Definition File
- **Patron:** `TASK-{MODULE}-{NNN}-F{N}-{CAPA}[-{SUBTYPE}].md`
- **Ejemplo:** `TASK-AUTH-001-F0-DATABASE.md`
- **Ubicacion:** Dentro de la carpeta task del mismo nombre
- **Regla:** El archivo .md SIEMPRE lleva el mismo nombre que su carpeta contenedora.

### Subtask File
- **Patron:** `SUBTASK-{MODULE}-{NNN}-F{N}-{SEQ}-{slug}.md`
- **Ejemplo:** `SUBTASK-AUTH-001-F0-01-create-tables.md`
- **SEQ:** Secuencial 01-99 dentro del task
- **slug:** kebab-case, maximo 30 caracteres, descriptivo

### References Folder
- **Patron:** `_references/`
- **Ubicacion:** A nivel del EPIC directory (compartido por todas las US)
- **Contenido:** RF-* migrados de v2, especificaciones tecnicas, materiales de referencia
- **Naming:** Mantener nombre original del v2 (RF-MGN-XXX-NNN-*.md)

---

## Mapeo MODULE Prefixes por Proyecto

### erp-core (28 modules)

| Epic | MODULE Prefix | MGN Code |
|------|---------------|----------|
| EPIC-ERP-AUTH | AUTH | MGN-001 |
| EPIC-ERP-USERS | USERS | MGN-002 |
| EPIC-ERP-ROLES | ROLES | MGN-003 |
| EPIC-ERP-TENANTS | TENANTS | MGN-004 |
| EPIC-ERP-CATALOGS | CATALOGS | MGN-005 |
| EPIC-ERP-SETTINGS | SETTINGS | MGN-006 |
| EPIC-ERP-AUDIT | AUDIT | MGN-007 |
| EPIC-ERP-NOTIFICATIONS | NOTIFICATIONS | MGN-008 |
| EPIC-ERP-REPORTS | REPORTS | MGN-009 |
| EPIC-ERP-FINANCIAL | FINANCIAL | MGN-010 |
| EPIC-ERP-INVENTORY | INVENTORY | MGN-011 |
| EPIC-ERP-PURCHASING | PURCHASING | MGN-012 |
| EPIC-ERP-SALES | SALES | MGN-013 |
| EPIC-ERP-CRM | CRM | MGN-014 |
| EPIC-ERP-PROJECTS | PROJECTS | MGN-015 |
| EPIC-ERP-HR | HR | MGN-HR |
| EPIC-ERP-BILLING | BILLING | MGN-016 |
| EPIC-ERP-PLANS | PLANS | MGN-017 |
| EPIC-ERP-WEBHOOKS | WEBHOOKS | MGN-018 |
| EPIC-ERP-FEATURE-FLAGS | FF | MGN-019 |
| EPIC-ERP-AI | AI | MGN-020 |
| EPIC-ERP-WHATSAPP | WHATSAPP | MGN-021 |
| EPIC-ERP-MCP | MCP | MGN-022 |
| EPIC-ERP-CFDI | CFDI | — |
| EPIC-ERP-NOMINA | NOMINA | — |
| EPIC-ERP-VOICE | VOICE | — |
| EPIC-ERP-MRP | MRP | — |
| EPIC-ERP-INTEGRATION | INTEGRATION | — |

### template-saas (1 module)

| Epic | MODULE Prefix |
|------|---------------|
| EPIC-SAAS-* (todos) | SAAS |

> template-saas usa un unico MODULE prefix `SAAS` para todas sus epics.

### gamilit (22 modules)

| Epic | MODULE Prefix |
|------|---------------|
| EPIC-GAM-F1-AUTH | FUND |
| EPIC-GAM-F1-ANALYTICS | ANA |
| EPIC-GAM-F1-ADMIN | ADM |
| EPIC-GAM-F1-CONFIG | SYS |
| EPIC-GAM-F1-EXERCISES | ACT |
| EPIC-GAM-F1-GAMIFICATION | GAM |
| EPIC-GAM-F1-PORTAL-ADMIN | PERF |
| EPIC-GAM-F2-DB-MIGRATION | M4, M5, M4M5 |
| EPIC-GAM-F2-TECH-MODULES | EXT |
| EPIC-GAM-F2-TECH-CONSOLIDATION | ETC (HU prefix) |
| EPIC-GAM-F3-ADMIN-EXTENDED | AE |
| EPIC-GAM-F3-CONTENT | CONT |
| EPIC-GAM-F3-LTI | LTI |
| EPIC-GAM-F3-NOTIFICATIONS | NOT |
| EPIC-GAM-F3-PARENT-NOTIFICATIONS | PM |
| EPIC-GAM-F3-PARENT-PORTAL | PP, PARENT |
| EPIC-GAM-F3-PEER-CHALLENGES | PEER |
| EPIC-GAM-F3-PROFILES | REP |
| EPIC-GAM-F3-SOCIAL-GAMIFICATION | WL |
| EPIC-GAM-F3-WHITE-LABEL | WL |

### trading-platform (12 modules)

| Epic | MODULE Prefix |
|------|---------------|
| EPIC-TRAD-AUTH | AUTH |
| EPIC-TRAD-EDUCATION | EDU |
| EPIC-TRAD-INVESTMENT | INV |
| EPIC-TRAD-LLM-AGENT | LLM |
| EPIC-TRAD-LLM-TRADING | LTI |
| EPIC-TRAD-MARKETPLACE | MKT |
| EPIC-TRAD-ML-SIGNALS | ML |
| EPIC-TRAD-MT4 | MT4 |
| EPIC-TRAD-PAYMENTS | PAY |
| EPIC-TRAD-PORTFOLIO | PFM |
| EPIC-TRAD-PLATFORM | PLT |
| EPIC-TRAD-TRADING | TRD |

---

## Ejemplos Multi-Proyecto

### erp-core (ya cumple v1.0)
```
EPIC-ERP-AUTH/US-ERP-AUTH-001/
├── TASK-AUTH-001-F0-DATABASE/TASK-AUTH-001-F0-DATABASE.md
├── TASK-AUTH-001-F1-BACKEND/TASK-AUTH-001-F1-BACKEND.md
└── TASK-AUTH-001-F4-TEST/TASK-AUTH-001-F4-TEST.md
```

### template-saas
```
EPIC-SAAS-BACKEND/US-SAAS-001/
├── TASK-SAAS-001-F0-DATABASE/TASK-SAAS-001-F0-DATABASE.md
├── TASK-SAAS-001-F1-BACKEND/TASK-SAAS-001-F1-BACKEND.md
└── TASK-SAAS-001-F2-FRONTEND/TASK-SAAS-001-F2-FRONTEND.md
```

### gamilit
```
EPIC-GAM-F1-AUTH/user-stories/US-FUND-001/tasks/
├── TASK-FUND-001-F0-DATABASE-01/TASK-FUND-001-F0-DATABASE-01.md
├── TASK-FUND-001-F1-BACKEND-01/TASK-FUND-001-F1-BACKEND-01.md
├── TASK-FUND-001-F2-FRONTEND-01/TASK-FUND-001-F2-FRONTEND-01.md
└── TASK-FUND-001-F4-TEST-01/TASK-FUND-001-F4-TEST-01.md
```

### trading-platform
```
EPIC-TRAD-AUTH/US-TRAD-AUTH-001/
├── TASK-AUTH-001-F0-DATABASE/TASK-AUTH-001-F0-DATABASE.md
├── TASK-AUTH-001-F1-BACKEND/TASK-AUTH-001-F1-BACKEND.md
├── TASK-AUTH-001-F1-BACKEND-PY/TASK-AUTH-001-F1-BACKEND-PY.md
├── TASK-AUTH-001-F2-FRONTEND/TASK-AUTH-001-F2-FRONTEND.md
├── TASK-AUTH-001-F3-INTEGRATION/TASK-AUTH-001-F3-INTEGRATION.md
└── TASK-AUTH-001-F4-TEST/TASK-AUTH-001-F4-TEST.md
```

---

## Reglas Adicionales

1. **Coherencia:** El MODULE prefix en task/subtask DEBE coincidir con el del epic padre
2. **Sin duplicados:** Cada archivo tiene nombre unico global dentro del epic
3. **Sin acentos:** Nombres de archivo en ASCII puro, kebab-case para slugs
4. **Slugs descriptivos:** El slug debe indicar claramente la accion atomica
5. **Tareas opcionales:** Si una US no necesita F2-FRONTEND, simplemente no se crea esa carpeta
6. **Archivo = Carpeta:** El .md dentro de un TASK folder SIEMPRE tiene el mismo nombre que la carpeta
7. **Subtype opcional:** Solo usar cuando hay multiples tasks de la misma capa (PY/TS, 01/02)

---

*Convencion: CONVENCION-NAMING-TASKS.md v2.0.0*
*Sistema: SIMCO v4.0.0 + CAPVED*
