# ROADMAP FASE 2 - IMPLEMENTACIÓN DE REMEDIACIONES
## GAMILIT - Plan de Ejecución Post-Análisis

**Tarea:** TASK-2026-02-03-ANALISIS-VALIDACION-MODELADO-BD
**Fecha:** 2026-02-03
**Generado por:** @PLANNING_AGENT
**Estado:** FASE 1 COMPLETADA - ROADMAP FASE 2

---

## RESUMEN EJECUTIVO

### Análisis Completado (Fase 1)
| Nivel | Descripción | Agentes | Hallazgos |
|-------|-------------|---------|-----------|
| 2 | Análisis por Dominio | 7 paralelos | 9 gaps, 94% promedio |
| 3 | Coherencia Entre Capas | 4 paralelos | 92.4% promedio |
| 4 | Detección de Anomalías | 4 paralelos | 106 anomalías |
| 5 | Purga y Consolidación | 3 paralelos | 156 docs, 23 gaps |

### Score General del Modelado
| Aspecto | Score | Estado |
|---------|-------|--------|
| Cumplimiento RF | 94% | ALTO |
| Coherencia DDL-Entity | 84.7% | MEDIO-ALTO |
| Funciones/Triggers | 95% | ALTO |
| RLS Coverage | 97% | EXCELENTE |
| Duplicados | 82% | BUENO |
| Nomenclatura | 89.1% | BUENO |
| Orphans | 99.1% | EXCELENTE |
| **PROMEDIO** | **91.5%** | **ALTO** |

---

## GRAFO DE DEPENDENCIAS

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                        DEPENDENCIAS DE IMPLEMENTACIÓN                            │
└─────────────────────────────────────────────────────────────────────────────────┘

SPRINT 1 (CRÍTICO - Sin dependencias)
├── GAP-SYS-001: RLS lti_integration ──────────────┐
├── GAP-3.2-ORPHAN: user_skill_rating table ───────┤── PARALELO
└── GAP-001: bloom_level ENUM ─────────────────────┘

                           │
                           ▼

SPRINT 2 (Depende de Sprint 1)
├── GAP-AUTH-001: Composite index user_roles ──────┐
├── GAP-GAM-001: comodin_uses table ───────────────┤── PARALELO
├── GAP-002: exercise_mechanic_mapping seeds ──────┤
└── OVR-007: Fix broken FK constraints ────────────┘

                           │
                           ▼

SPRINT 3 (Depende de Sprint 2)
├── GAP-SOC-001: challenge_results table ──────────┐
├── GAP-SOC-004: user_blocks table ────────────────┤── PARALELO
├── DUP-001: Consolidate comodin tables ───────────┤
└── OVR-006: Remove duplicate timestamp function ──┘

                           │
                           ▼

SPRINT 4 (Depende de Sprint 3)
├── DOC-001: Consolidate deployment guides (8→1) ──┐
├── DOC-002: Consolidate API docs (3→1) ───────────┤── PARALELO
├── OVR-001: Consolidate audit tables ─────────────┤
└── OVR-002: Consolidate notification settings ────┘

                           │
                           ▼

SPRINT 5 (Opcional - Mejoras)
├── GAP-SOC-002: team_challenges table ────────────┐
├── GAP-SOC-003: message_participants table ───────┤── PARALELO
├── GAP-SOC-005: user_reports table ───────────────┤
├── NOM-FK: Rename 85 foreign keys ────────────────┤
└── NOM-TRG: Rename 18 triggers ───────────────────┘

                           │
                           ▼

SPRINT 6 (Backlog)
├── NOM-TBL: Pluralize 30 table names ─────────────┐
├── DUP-003: Consolidate challenge tables ─────────┤── PARALELO
└── DUP-004: Consolidate report tables ────────────┘
```

---

## GRUPOS PARALELOS POR SPRINT

### SPRINT 1: CRÍTICO (Semana 1)
**Objetivo:** Resolver issues críticos de seguridad y code debt

| ID | Tarea | Agentes | Dependencias | Effort |
|----|-------|---------|--------------|--------|
| 1.1 | Create RLS policies lti_integration | @RLS_AGENT | Ninguna | 8-10h |
| 1.2 | Create user_skill_rating table + entity sync | @DDL_AGENT | Ninguna | 2-3h |
| 1.3 | Create bloom_level ENUM + migrate | @DDL_AGENT | Ninguna | 2-3h |

**Paralelismo:** 3 tareas en paralelo
**Tiempo total (paralelo):** 10h

---

### SPRINT 2: FUNDAMENTOS (Semana 2)
**Objetivo:** Completar gaps de datos e índices

| ID | Tarea | Agentes | Dependencias | Effort |
|----|-------|---------|--------------|--------|
| 2.1 | Add composite index user_roles | @INDEX_AGENT | 1.* | 2h |
| 2.2 | Create comodin_uses table | @DDL_AGENT | 1.* | 4-6h |
| 2.3 | Complete exercise_mechanic_mapping seeds | @SEED_AGENT | 1.3 | 4-6h |
| 2.4 | Fix broken FK auth→auth_management | @DDL_AGENT | 1.* | 2h |

**Paralelismo:** 4 tareas en paralelo
**Tiempo total (paralelo):** 6h

---

### SPRINT 3: SOCIAL & OPTIMIZACIÓN (Semana 3)
**Objetivo:** Features sociales y limpieza de código

| ID | Tarea | Agentes | Dependencias | Effort |
|----|-------|---------|--------------|--------|
| 3.1 | Create challenge_results table | @DDL_AGENT | 2.* | 6-8h |
| 3.2 | Create user_blocks table | @DDL_AGENT | 2.* | 4-6h |
| 3.3 | Consolidate comodin tables | @REFACTOR_AGENT | 2.2 | 8-10h |
| 3.4 | Remove duplicate timestamp function | @CLEANUP_AGENT | 2.* | 1h |

**Paralelismo:** 4 tareas en paralelo
**Tiempo total (paralelo):** 10h

---

### SPRINT 4: DOCUMENTACIÓN & CONSOLIDACIÓN (Semana 4)
**Objetivo:** Consolidar documentación y tablas

| ID | Tarea | Agentes | Dependencias | Effort |
|----|-------|---------|--------------|--------|
| 4.1 | Consolidate deployment guides (8→1) | @DOC_AGENT | Ninguna | 4-6h |
| 4.2 | Consolidate API docs (3→1) | @DOC_AGENT | Ninguna | 2-3h |
| 4.3 | Plan audit tables consolidation | @ARCHITECT_AGENT | 3.* | 4-6h |
| 4.4 | Plan notification settings consolidation | @ARCHITECT_AGENT | 3.* | 4-6h |

**Paralelismo:** 4 tareas en paralelo
**Tiempo total (paralelo):** 6h

---

### SPRINT 5: MEJORAS OPCIONALES (Semana 5)
**Objetivo:** Features adicionales y nomenclatura

| ID | Tarea | Agentes | Dependencias | Effort |
|----|-------|---------|--------------|--------|
| 5.1 | Create team_challenges table | @DDL_AGENT | 3.1 | 8-10h |
| 5.2 | Create message_participants table | @DDL_AGENT | Ninguna | 4-6h |
| 5.3 | Create user_reports table | @DDL_AGENT | 3.2 | 4-6h |
| 5.4 | Rename 85 foreign keys (fk_ prefix) | @RENAME_AGENT | 4.* | 8-10h |
| 5.5 | Rename 18 triggers (trg_ prefix) | @RENAME_AGENT | 4.* | 4h |

**Paralelismo:** 5 tareas en paralelo
**Tiempo total (paralelo):** 10h

---

### SPRINT 6: BACKLOG (Semana 6+)
**Objetivo:** Limpieza final y optimizaciones

| ID | Tarea | Agentes | Dependencias | Effort |
|----|-------|---------|--------------|--------|
| 6.1 | Pluralize 30 table names | @RENAME_AGENT | 5.* | 12-16h |
| 6.2 | Consolidate challenge tables | @REFACTOR_AGENT | 5.1 | 8-10h |
| 6.3 | Consolidate report tables | @REFACTOR_AGENT | 4.* | 8-10h |

**Paralelismo:** 3 tareas en paralelo
**Tiempo total (paralelo):** 16h

---

## RESUMEN DE ESFUERZO

### Por Sprint
| Sprint | Tareas | Effort Secuencial | Effort Paralelo | Agentes |
|--------|--------|-------------------|-----------------|---------|
| 1 | 3 | 13-16h | 10h | 3 |
| 2 | 4 | 12-16h | 6h | 4 |
| 3 | 4 | 19-25h | 10h | 4 |
| 4 | 4 | 14-21h | 6h | 4 |
| 5 | 5 | 28-36h | 10h | 5 |
| 6 | 3 | 28-36h | 16h | 3 |
| **TOTAL** | **23** | **114-150h** | **58h** | **max 5** |

### Ahorro con Paralelismo
- Ejecución secuencial: ~132h (16.5 días)
- Ejecución paralela: ~58h (7.25 días)
- **Ahorro: ~56%**

---

## PRIORIZACIÓN DE TAREAS

### P0 - CRÍTICO (Sprint 1)
- [x] ANÁLISIS COMPLETADO
- [ ] GAP-SYS-001: RLS lti_integration (SECURITY)
- [ ] GAP-3.2-ORPHAN: user_skill_rating (CODE DEBT)
- [ ] GAP-001: bloom_level ENUM (TYPE SAFETY)

### P1 - ALTO (Sprint 2-3)
- [ ] OVR-007: Fix broken FK constraints
- [ ] GAP-GAM-001: comodin_uses audit trail
- [ ] GAP-002: Complete seeds
- [ ] GAP-SOC-001: challenge_results

### P2 - MEDIO (Sprint 4-5)
- [ ] DOC consolidations
- [ ] OVR-001: Audit table consolidation
- [ ] OVR-002: Notification settings consolidation
- [ ] GAP-SOC-004: user_blocks

### P3 - BAJO (Sprint 5-6)
- [ ] Nomenclature fixes (103 items)
- [ ] Additional social tables
- [ ] Table consolidations

---

## MÉTRICAS DE ÉXITO

### KPIs Post-Implementación
| Métrica | Actual | Target | Sprint |
|---------|--------|--------|--------|
| RLS Coverage | 97% | 100% | 1 |
| DDL-Entity Coherence | 84.7% | 95% | 1-2 |
| Duplicates Resolved | 82% | 95% | 3-4 |
| Nomenclature Compliance | 89.1% | 95% | 5-6 |
| Orphans | 99.1% | 100% | 1 |
| **Overall Score** | **91.5%** | **97%** | **6** |

### Checkpoints de Validación
- [ ] Sprint 1: Security gaps closed, critical issues resolved
- [ ] Sprint 2: Foundation complete, no broken FKs
- [ ] Sprint 3: Social features enabled, duplicates reduced
- [ ] Sprint 4: Documentation consolidated
- [ ] Sprint 5: Nomenclature 95%+ compliant
- [ ] Sprint 6: All backlogs cleared

---

## ENTREGABLES FASE 2

### Por Sprint
1. **Sprint 1:** DDL files, RLS policies, Entity updates
2. **Sprint 2:** Indexes, Seeds, FK fixes
3. **Sprint 3:** New tables, Consolidated tables
4. **Sprint 4:** DEPLOYMENT-MASTER.md, API-STANDARDS.md
5. **Sprint 5:** Renamed objects, New social tables
6. **Sprint 6:** Final nomenclature compliance

### Documentación Final
- [ ] DATABASE_INVENTORY.yml actualizado
- [ ] BACKEND_INVENTORY.yml actualizado
- [ ] MASTER_INVENTORY.yml actualizado
- [ ] ADR-033: Decisiones de consolidación
- [ ] CHANGELOG actualizado

---

## NOTAS DE IMPLEMENTACIÓN

### Pre-requisitos
1. Backup de base de datos antes de cada sprint
2. Coordinación con equipo backend para cambios de entity
3. Tests de regresión después de cada sprint
4. Review de cambios DDL antes de aplicar

### Riesgos
| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| FK cascade issues | Media | Alto | Test en staging primero |
| RLS breaks queries | Baja | Alto | Test exhaustivo con roles |
| Nomenclature breaks refs | Media | Medio | Usar ALTER + CASCADE |
| Consolidation data loss | Baja | Alto | Backup + migration script |

### Rollback Plan
- Cada sprint tiene script de rollback
- DDL changes son idempotentes
- Backups antes de cada sprint

---

## CONCLUSIÓN

### Fase 1 Completada
- 6 niveles de análisis ejecutados
- 28 subtareas CAPVED completadas
- 7 dominios validados
- Score general: 91.5%

### Fase 2 Propuesta
- 6 sprints planificados
- 23 tareas de remediación
- Effort estimado: 58h (paralelo)
- Target score: 97%

### Recomendación
**APROBAR** roadmap e iniciar Sprint 1 con P0 críticos (RLS, orphan entity, ENUM).

---

**Fin del Roadmap Fase 2**
**Generado:** 2026-02-03
**Próxima revisión:** Inicio Sprint 1
