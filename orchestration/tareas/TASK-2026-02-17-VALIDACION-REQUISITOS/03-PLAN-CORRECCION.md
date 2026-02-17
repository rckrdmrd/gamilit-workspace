# 03-PLAN-CORRECCION: Correcciones Priorizadas

**Tarea:** TASK-2026-02-17-VALIDACION-REQUISITOS
**Fecha:** 2026-02-17
**Version:** 1.0.0

---

## P0 - CRITICOS (Aplicar inmediatamente)

| ID | Hallazgo | Archivo(s) | Accion |
|----|----------|------------|--------|
| CORR-P0-01 | H-ENV-01 | `ecosystem.config.js` L57,61,92 | Cambiar 4006→3006 y 4005→3005 |
| CORR-P0-02 | H-DB-01 | `apps/database/scripts/init-database.sh` L695-710 | Agregar "auth" al array de schemas en execute_functions() |
| CORR-P0-03 | H-ORC-01 | `orchestration/PROJECT-CONTEXT.md` | Actualizar 10+ metricas inline, ref v10.0.0 |

---

## P1 - ALTA PRIORIDAD (Aplicar en esta sesion)

| ID | Hallazgo | Archivo(s) | Accion |
|----|----------|------------|--------|
| CORR-P1-01 | H-DOC-01 | `docs/00-overview/README.md` | Actualizar metricas (15+ edits), MASTER_INV ref v7→v10 |
| CORR-P1-02 | H-DOC-07 | `ecosystem.config.js` L10 | Fix comment "2 instancias cluster" → "1 instancia fork" |
| CORR-P1-03 | H-DOC-07 | `orchestration/agents/perfiles/PERFIL-DEPLOY-SERVER.md` L192,204 | Actualizar puertos 4006→3006, 4005→3005 |
| CORR-P1-04 | H-ORC-03 | `orchestration/CONTEXT-MAP.yml` L245-248 | endpoints→901, rls→227, funciones→183 |
| CORR-P1-05 | H-ORC-10 | `orchestration/PROJECT-CONTEXT.md` | Reemplazar metricas inline con ref a MASTER_INVENTORY |
| CORR-P1-06 | H-DOC-04 | `docs/10-requirements/` | Documentar flujo de defaults como requisito formal |
| CORR-P1-07 | H-DOC-05 | 3 archivos | Crear FLUJO-INICIALIZACION-USUARIO.md o limpiar refs rotas |
| CORR-P1-08 | H-DB-02/03 | 7 archivos communication | Remover funciones/triggers inline de tables/ |

---

## P2 - MEDIA PRIORIDAD (Aplicar en esta sesion si hay tiempo)

| ID | Hallazgo | Archivo(s) | Accion |
|----|----------|------------|--------|
| CORR-P2-01 | H-DOC-02 | `docs/00-overview/MODULOS.md` | modules 22→23, RLS 207→227 |
| CORR-P2-02 | H-DOC-03 | `docs/10-requirements/VISION-ALCANCE.md` | endpoints 899→901, modules 22→23 |
| CORR-P2-03 | H-DOC-06 | `docs/20-architecture/AMBIENTES-DEV-PROD.md` L86 | .env.prod→.env.production |
| CORR-P2-04 | H-ORC-04 | `orchestration/MAPA-DOCUMENTACION.yml` | ELIMINAR (legacy, reemplazado por CONTEXT-MAP) |
| CORR-P2-05 | H-ORC-06 | `orchestration/CONTEXT-MAP.yml` L155 | Remover ref a docs/_MAP.md |
| CORR-P2-06 | H-ENV-04 | `apps/database/.env.dev` L20-31 | Remover vars no-DB (JWT, VITE, NODE_ENV) |
| CORR-P2-07 | H-ENV-05 | `apps/database/.env.*` L7 | workspace-v2 → orchestration/inventarios/ |
| CORR-P2-08 | H-ENV-08 | `apps/frontend/.env.example` L44-54 | Remover vars Firebase, agregar VITE_VAPID_PUBLIC_KEY |
| CORR-P2-09 | H-ENV-09 | `apps/frontend/.env.example` L61-62 | Vaciar credenciales de test |
| CORR-P2-10 | H-ORC-11 | `orchestration/inventarios/MASTER_INVENTORY.yml` L134 | 22→23 modules en features |
| CORR-P2-11 | H-DOC-11 | `CLAUDE.md` seccion MODULOS heading | 22→23 |

---

## P3 - BAJA PRIORIDAD (Backlog)

| ID | Hallazgo | Accion |
|----|----------|--------|
| CORR-P3-01 | H-ENV-02 | Fix comment ecosystem.config.js L10 (ya incluido en CORR-P1-02) |
| CORR-P3-02 | H-ORC-07 | principios/_INDEX.md header version 1.0→1.1 |
| CORR-P3-03 | H-ORC-08 | triggers/_INDEX.md limpiar phantoms de flow diagrams |
| CORR-P3-04 | H-ORC-09 | TRIGGER/PRINCIPIO-ANTI-DUPLICACION limpiar refs workspace-era |
| CORR-P3-05 | H-TRZ-02/03 | Actualizar comentarios XP ranges en DDL ENUM y backend enum |
| CORR-P3-06 | H-TRZ-06 | Marcar 4 exercise types como DEPRECATED en DDL ENUM |
| CORR-P3-07 | H-DB-07 | Agregar ON_ERROR_STOP=1 a batch psql en Phase 2 |
| CORR-P3-08 | H-DB-08 | Reemplazar grep-based error detection en seeds con exit codes |
| CORR-P3-09 | H-DOC-08 | Documentar politica cross-schema duplication |
| CORR-P3-10 | H-DOC-10 | Expandir o disclaim TRACEABILITY cobertura |

---

## Orden de Ejecucion

```
FASE 1: P0 (3 correcciones) ← BLOQUEAN FUNCIONAMIENTO
  ├── CORR-P0-01: ecosystem.config.js ports
  ├── CORR-P0-02: init-database.sh auth schema
  └── CORR-P0-03: PROJECT-CONTEXT.md metrics

FASE 2: P1 docs/orchestration (6 correcciones)
  ├── CORR-P1-01: overview README metrics
  ├── CORR-P1-02: ecosystem comment
  ├── CORR-P1-03: PERFIL-DEPLOY ports
  ├── CORR-P1-04: CONTEXT-MAP metrics
  ├── CORR-P1-05: PROJECT-CONTEXT pointer to SSOT
  └── CORR-P1-06: Documentar flujo defaults

FASE 3: P1 refs/code (2 correcciones)
  ├── CORR-P1-07: Fix broken refs FLUJO-INICIALIZACION
  └── CORR-P1-08: Communication schema dedup (scope: code, defer)

FASE 4: P2 (11 correcciones)
  └── All P2 items in order listed above

FASE 5: P3 (backlog)
  └── As time permits
```

---

## Notas de Alcance

- Esta tarea se enfoca en **docs/ y orchestration/** como lo solicito el usuario.
- Correcciones de **codigo** (H-DB-02/03 communication dedup, H-TRZ-04 multipliers) se documentan pero se difieren a tarea separada.
- **CORR-P0-01** (ecosystem.config.js) y **CORR-P0-02** (init-database.sh) son excepciones que tocan codigo porque son criticos bloqueantes.
