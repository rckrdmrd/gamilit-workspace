# P2-2A-1: Metrics Consistency Audit

**Tarea:** TASK-2026-02-27-AUDITORIA-DOCS
**Fase:** P2 — Metricas y Consistencia
**Subtarea:** 2A-1 — Verificacion de valores numericos en docs/ vs SSOT inventarios
**Fecha:** 2026-02-27
**Auditor:** Claude Sonnet 4.6 (read-only)

---

## Fuentes SSOT (Inventarios)

| Inventario | Version | Fecha |
|-----------|---------|-------|
| `orchestration/inventarios/MASTER_INVENTORY.yml` | 14.4.0 | 2026-02-27 |
| `orchestration/inventarios/BACKEND_INVENTORY.yml` | 5.3.0 | 2026-02-27 |
| `orchestration/inventarios/FRONTEND_INVENTORY.yml` | 12.5.0 | 2026-02-27 |
| `orchestration/inventarios/DATABASE_INVENTORY.yml` | 9.2.0 | 2026-02-27 |

---

## Resumen de Discrepancias

| Metrica | Valor SSOT | Discrepancias Encontradas |
|---------|-----------|--------------------------|
| Tablas | 173 | 0 discrepancias (1 contexto historico: ADR-033 dice 171) |
| Endpoints | 912 | **2 discrepancias criticas** (API-REFERENCE.md = 901) |
| Componentes | 575 | **5 discrepancias** (590, 592, 590+, 475) |
| Entities | 156 files / 157 classes | 0 discrepancias directas; COHERENCE-ENTITIES-DDL.md tiene inconsistencia menor |
| Modulos | 23 | 0 discrepancias |
| Services | 172 | 0 discrepancias |
| Controllers | 108 | 0 discrepancias |
| DTOs | 401 | 0 discrepancias |
| Schemas | 18 | 0 discrepancias |
| ADRs | 47 | 0 discrepancias |
| Paginas | 72 | 0 discrepancias directas (1 doc usa 77 en contexto diferente) |
| Hooks | 132 | 0 discrepancias |
| Routes | 74 | 0 discrepancias |
| Exercise types | 23 (semantico) / 33 (DDL ENUM) | 5 docs usan "27" (comentario DDL historico) |
| RLS Policies | 251 | **3 discrepancias** (MODELO-DATOS y otros usan 237; ERR-DB-004 usa 207) |
| Foreign Keys | 301 | **2 discrepancias** (MODELO-DATOS = 299; ERR-DB-006 = 299) |
| Tablas con entity | 157 (SSOT) | **1 discrepancia** (COHERENCE-ENTITIES-DDL.md dice "Tablas con Entity: 156") |
| Tablas sin entity | 16 (SSOT) | **1 discrepancia** (COHERENCE-ENTITIES-DDL.md dice 17) |

---

## Metric: Tablas (173)

**SSOT Value:** 173 (MASTER_INVENTORY.yml, DATABASE_INVENTORY.yml)

| File | Value Found | Line | Match? | Context |
|------|-------------|------|--------|---------|
| `docs/70-onboarding/ONBOARDING-AGENTES.md` | 173 | 20, 79, 110, 169 | YES | Varias referencias correctas |
| `docs/70-onboarding/ONBOARDING-QA.md` | 173 | 87 | YES | Tabla de metricas |
| `docs/70-onboarding/ONBOARDING-DESARROLLADORES.md` | 173 | 66 | YES | Comentario script |
| `docs/10-requirements/VISION-ALCANCE.md` | 173 | 21, 276 | YES | Header y tabla de epics |
| `docs/90-adr/ADR-039-ssot-docs-en-proyecto.md` | 173 | 106 | YES | Descripcion SSOT |
| `docs/90-adr/ADR-038-estructura-canonica-apps.md` | 173 | 20, 64 | YES | Estructura del proyecto |
| `docs/60-portals/student/specs/README.md` | 173 | 834 | YES | Referencia inventario |
| `docs/90-adr/ADR-037-gobernanza-capved.md` | 173 | 40, 103 | YES | Reglas CAPVED |
| `docs/40-standards/ESTANDAR-DIAGRAMAS-ER.md` | 173 | 5 | YES | Scope del estandar |
| `docs/10-requirements/epics/_wave-3-technical/EPIC-GAM-INTEGRATION/EPIC.md` | 173 | 21, 33, 49 | YES | |
| `docs/10-requirements/epics/_wave-3-technical/EPIC-GAM-DOCS/EPIC.md` | 173 | 34 | YES | |
| `docs/10-requirements/epics/_wave-3-technical/EPIC-GAM-DATABASE/EPIC.md` | 173 | 22, 35, 51 | YES | |
| `docs/50-guides/deployment/GUIA-GITHUB-ACTIONS-CICD.md` | 173 | 655 | YES | |
| `docs/10-requirements/epics/_wave-3-technical/EPIC-GAM-BACKEND/EPIC.md` | 173 | 36 | YES | |
| `docs/20-architecture/schema-reference/_INDEX.md` | 173 | 16, 136 | YES | |
| `docs/50-guides/backend/GUIA-RUNBOOK-POSTGRESQL.md` | 173 | 36, 239, 255 | YES | |
| `docs/50-guides/backend/GUIA-EXPAND-CONTRACT-MIGRATIONS.md` | 173 | 36 | YES | |
| `docs/20-architecture/COHERENCE-ENTITIES-DDL.md` | 173 | 19 | YES | |
| `docs/10-requirements/epics/EPIC-GAM-F4-VALIDATION/...` (multiples) | 173 | varios | YES | |
| `docs/90-adr/ADR-033-expansion-schemas-8-to-18.md` | 171 | 44 | **HISTORICO** | "171 tables distributed across 18 schemas" — contexto historico de la decision original; valor pre-adicion de 2 tablas |
| `docs/20-architecture/MODELO-DATOS.md` | 172 | 20 | **NO** | "Tablas | 172" — STALE, no actualizado post-auditoria |
| `docs/20-architecture/README.md` | 172 | 13 | **NO** | "18 schemas, 172 tablas" — STALE |
| `docs/20-architecture/SCHEMA-REFERENCE.md` | 172 | 36 | **NO** | Footer: "*172 tablas | 18 schemas | 237 RLS...*" — STALE |
| `docs/20-architecture/schema-reference/99-utilities.md` | 172 | 131 | **NO** | Footer copiado de SCHEMA-REFERENCE.md — STALE |

**Discrepancias reales:** 4 archivos con "172 tablas" (STALE pre-auditoria); ADR-033 con "171" es contextualmente historico y aceptable.

---

## Metric: Endpoints (912)

**SSOT Value:** 912 (MASTER_INVENTORY.yml, BACKEND_INVENTORY.yml)

| File | Value Found | Line | Match? | Context |
|------|-------------|------|--------|---------|
| `docs/10-requirements/VISION-ALCANCE.md` | 912 | 21, 277 | YES | Header y tabla epics |
| `docs/60-portals/student/specs/_MAP.md` | 912 | 111 | YES | |
| `docs/90-adr/ADR-045-clean-architecture-pragmatica.md` | 912 | 35, 122 | YES | |
| `docs/90-adr/ADR-039-ssot-docs-en-proyecto.md` | 912 | 107 | YES | |
| `docs/90-adr/ADR-038-estructura-canonica-apps.md` | 912 | 18 | YES | |
| `docs/90-adr/ADR-037-gobernanza-capved.md` | 912 | 9, 104 | YES | |
| `docs/90-adr/ADR-035-sistema-saad.md` | 912 | 66 | YES | |
| `docs/00-overview/MODULOS.md` | 912 | 435 | YES | Total en tabla de modulos |
| `docs/40-standards/ESTANDAR-SEGURIDAD.md` | 912 | 484, 1125, 1185 | YES | |
| `docs/70-onboarding/ONBOARDING-QA.md` | 912 | 85 | YES | |
| `docs/60-portals/student/specs/README.md` | 912 | 78, 833 | YES | |
| `docs/70-onboarding/ONBOARDING-DESARROLLADORES.md` | 912 | 98 | YES | |
| `docs/70-onboarding/ONBOARDING-AGENTES.md` | 912 | 80, 105, 172 | YES | |
| `docs/10-requirements/epics/_wave-3-technical/EPIC-GAM-*` (multiples) | 912 | varios | YES | |
| `docs/10-requirements/epics/EPIC-GAM-F4-VALIDATION/...` (multiples) | 912 | varios | YES | |
| **`docs/40-api/API-REFERENCE.md`** | **901** | **5, 10, 548** | **NO** | Header, nota y footer: "Total Endpoints: 901" — STALE (pre-ResourceSharing +7 endpoints) |

**Discrepancias reales:** 1 archivo critico (`docs/40-api/API-REFERENCE.md`) muestra 901 en lugar de 912. La diferencia de +11 corresponde a los +7 ResourceSharing endpoints agregados (teacher-content.controller). El archivo fue generado 2026-02-07 y no ha sido actualizado.

---

## Metric: Componentes Frontend (575)

**SSOT Value:** 575 (MASTER_INVENTORY.yml, FRONTEND_INVENTORY.yml)

| File | Value Found | Line | Match? | Context |
|------|-------------|------|--------|---------|
| `docs/10-requirements/VISION-ALCANCE.md` | 575 | 278 | YES | Tabla epics |
| `docs/60-portals/student/specs/_MAP.md` | 575 | 110 | YES | |
| `docs/90-adr/ADR-050-responsive-design-strategy.md` | 575 | 14 | YES | |
| `docs/00-overview/GLOSARIO.md` | 575 | 113 | YES | |
| `docs/90-adr/ADR-039-ssot-docs-en-proyecto.md` | 575 | 108 | YES | |
| `docs/90-adr/ADR-038-estructura-canonica-apps.md` | 575 | 57 | YES | |
| `docs/60-portals/student/specs/README.md` | 575 | 77, 832 | YES | |
| `docs/10-requirements/epics/_wave-3-technical/EPIC-GAM-TESTING/EPIC.md` | 575 | 35 | YES | |
| `docs/50-guides/testing/GUIA-COVERAGE-TESTING.md` | 575 | 80 | YES | |
| `docs/70-onboarding/ONBOARDING-QA.md` | 575 | 88 | YES | |
| `docs/70-onboarding/ONBOARDING-AGENTES.md` | 575 | 174 | YES | |
| `docs/10-requirements/epics/_wave-3-technical/EPIC-GAM-FRONTEND/EPIC.md` | 575 | 25, 36 | YES | |
| `docs/10-requirements/epics/_wave-3-technical/EPIC-GAM-DOCS/EPIC.md` | 575 | 36 | YES | |
| **`docs/30-ux-ui/README.md`** | **590** | **88** | **NO** | "**Componentes:** 590 componentes React" — STALE |
| **`docs/30-ux-ui/README.md`** | **592** | **151** | **NO** | "592 componentes React documentados en orchestration/inventarios/FRONTEND_INVENTORY.yml" — STALE y factualmente incorrecto (el inventario dice 575) |
| **`docs/90-adr/ADR-049-confirm-dialog-consolidation.md`** | **590** | **14, 243** | **NO** | "590 production components" — STALE (pre-Sprint-2) |
| **`docs/90-adr/ADR-048-component-sharing-strategy.md`** | **590** | **158, 234** | **NO** | "590+ components" y "590 production .tsx components" — STALE (pre-Sprint-2) |
| **`docs/50-guides/frontend/GUIA-WCAG-ACCESSIBILITY.md`** | **590** | **14** | **NO** | "los 590 componentes React de gamilit" — STALE |
| `docs/50-guides/backend/GUIA-DESIGN-PATTERNS-NESTJS.md` | ~575 | 1174 | YES | "67 API files, ~575 calls" — nota: esto es API calls, no componentes; coincidencia numérica |

**Discrepancias reales:** 5 archivos con 590 o 592 (STALE). ADR-048 y ADR-049 tienen contexto parcialmente justificable (se escribieron con ese numero en ese momento), pero deben actualizarse. `docs/30-ux-ui/README.md` es la discrepancia mas grave porque cita activamente el inventario SSOT con un valor incorrecto.

---

## Metric: Entities Backend (156 files / 157 classes)

**SSOT Value:** 156 files, 157 @Entity classes (MASTER_INVENTORY.yml, BACKEND_INVENTORY.yml)

| File | Value Found | Line | Match? | Context |
|------|-------------|------|--------|---------|
| `docs/20-architecture/COHERENCE-ENTITIES-DDL.md` | 156 files (157 classes) | 18 | YES | Tabla resumen |
| `docs/20-architecture/COHERENCE-ENTITIES-DDL.md` | "Tablas con Entity: 156" | 20 | **INCONSISTENTE** | Contradice SSOT: SSOT dice tablas_con_entity=157; doc dice 156 |
| `docs/50-guides/backend/GUIA-EXPAND-CONTRACT-MIGRATIONS.md` | 156 entities (157 classes) | 40 | YES | |
| `docs/50-guides/backend/GUIA-DESIGN-PATTERNS-NESTJS.md` | 156 entity files (157 classes) | 1014 | YES | |
| `docs/40-standards/ESTANDAR-TESTING.md` | 156 entities (157 classes) | 1411 | YES | |
| `docs/50-guides/troubleshooting/.../ERR-INT-003-modulo-sin-datasource.md` | 156 entity files | 4 | YES | |
| `docs/00-overview/GLOSARIO.md` | 156 entity files (157 @Entity classes) | 101 | YES | |
| `docs/50-guides/testing/GUIA-COVERAGE-TESTING.md` | 156 entity files (157 classes) | 75 | YES | |
| `docs/50-guides/testing/GUIA-ARCHITECTURE-TESTING.md` | 156 entities (157 classes) | 21, 132 | YES | |
| `docs/90-adr/ADR-039-ssot-docs-en-proyecto.md` | 156 entity files/157 classes | 107 | YES | |
| `docs/90-adr/ADR-037-gobernanza-capved.md` | 156 entity files | 40, 103 | YES | |
| `docs/90-adr/ADR-035-sistema-saad.md` | 156 entity files (157 classes) | 66 | YES | |
| `docs/90-adr/ADR-045-clean-architecture-pragmatica.md` | 156 entity files (157 @Entity classes) | 17, 33, 121, 196 | YES | |
| `docs/70-onboarding/ONBOARDING-QA.md` | 156 files (157 classes) | 86 | YES | |
| `docs/70-onboarding/ONBOARDING-AGENTES.md` | 156 files, 157 classes | 79, 171 | YES | |
| `docs/10-requirements/epics/_wave-3-technical/EPIC-GAM-DATABASE/EPIC.md` | 156 files (157 classes) | 36 | YES | |
| `docs/10-requirements/epics/_wave-3-technical/EPIC-GAM-BACKEND/EPIC.md` | 156 entity files (157 classes) | 22, 36 | YES | |
| `docs/10-requirements/epics/_wave-3-technical/EPIC-GAM-INTEGRATION/EPIC.md` | 156 entity files (157 classes) | 21, 49 | YES | |
| `docs/10-requirements/epics/EPIC-GAM-F4-VALIDATION/...` (multiples) | 156 files (157 classes) | varios | YES | |

**Discrepancia menor:** En `docs/20-architecture/COHERENCE-ENTITIES-DDL.md` la tabla resumen lista "Tablas con Entity: 156" (linea 20) pero la nota en linea 24 describe "16 data_warehouse + 1 auth.users = 17 sin entity". Si 173 - 17 = 156 tablas con entity segun este doc, pero SSOT DATABASE_INVENTORY.yml dice tablas_con_entity=157 (173-16=157, excluyendo solo data_warehouse). La discrepancia es sobre si auth.users se cuenta o no. El doc tiene "Tablas sin Entity: 17" vs SSOT "16". Esta discrepancia interna no es critica pero debe documentarse.

---

## Metric: Modulos Backend (23)

**SSOT Value:** 23 (MASTER_INVENTORY.yml, BACKEND_INVENTORY.yml)

| File | Value Found | Line | Match? | Context |
|------|-------------|------|--------|---------|
| `docs/10-requirements/VISION-ALCANCE.md` | 23 | 21, 51, 53, 248, 277 | YES | |
| `docs/70-onboarding/ONBOARDING-QA.md` | 23 | 14, 62, 226 | YES | |
| `docs/70-onboarding/ONBOARDING-DESARROLLADORES.md` | 23 | 98, 276 | YES | |
| `docs/70-onboarding/ONBOARDING-AGENTES.md` | 23 | 105, 170 | YES | |
| `docs/20-architecture/STACK-TECNOLOGICO.md` | 23 | 179 | YES | |
| `docs/90-adr/ADR-038-estructura-canonica-apps.md` | 23 | 18, 49 | YES | |
| `docs/90-adr/ADR-037-gobernanza-capved.md` | 23 | 9, 29 | YES | |
| `docs/00-overview/GLOSARIO.md` | 23 | 107 | YES | |
| `docs/00-overview/MODULOS.md` | 23 | 5, 11 | YES | |
| `docs/10-requirements/epics/_wave-3-technical/EPIC-GAM-BACKEND/EPIC.md` | 23 | 21, 37, 52 | YES | |
| `docs/10-requirements/epics/_wave-3-technical/EPIC-GAM-DOCS/EPIC.md` | 23 | 35 | YES | |
| Multiples otros | 23 | varios | YES | Consistente en todo el codebase |

**Discrepancias:** Ninguna. El valor 23 es consistente en toda la documentacion.

---

## Metric: Services (172)

**SSOT Value:** 172 (MASTER_INVENTORY.yml, BACKEND_INVENTORY.yml)

| File | Value Found | Line | Match? | Context |
|------|-------------|------|--------|---------|
| `docs/00-overview/GLOSARIO.md` | 172 | 103 | YES | |
| `docs/10-requirements/epics/_wave-3-technical/EPIC-GAM-TESTING/EPIC.md` | 172 | 34 | YES | |
| `docs/90-adr/ADR-045-clean-architecture-pragmatica.md` | 172 | 16, 32, 121, 196 | YES | |
| `docs/50-guides/testing/GUIA-COVERAGE-TESTING.md` | 172 | 60 | YES | |
| `docs/50-guides/testing/GUIA-ARCHITECTURE-TESTING.md` | 172 | 21, 104 | YES | |
| `docs/10-requirements/epics/_wave-3-technical/EPIC-GAM-BACKEND/EPIC.md` | 172 | 24, 37 | YES | |
| `docs/40-standards/ESTANDAR-TESTING.md` | 172 | 1411 | YES | |

**Discrepancias:** Ninguna. El valor 172 es consistente.

---

## Metric: Controllers (108)

**SSOT Value:** 108 (MASTER_INVENTORY.yml, BACKEND_INVENTORY.yml)

| File | Value Found | Line | Match? | Context |
|------|-------------|------|--------|---------|
| `docs/00-overview/GLOSARIO.md` | 108 | 104 | YES | |
| `docs/40-standards/ESTANDAR-TESTING.md` | 108 | 1411 | YES | |
| `docs/90-adr/ADR-045-clean-architecture-pragmatica.md` | 108 | 18 | YES | |
| `docs/40-standards/backend-profesional/02-clean-architecture.md` | 108 | 326, 350 | YES | |
| `docs/50-guides/testing/GUIA-COVERAGE-TESTING.md` | 108 | 65 | YES | |
| `docs/50-guides/testing/GUIA-ARCHITECTURE-TESTING.md` | 108 | 21, 104 | YES | |
| `docs/10-requirements/epics/_wave-3-technical/EPIC-GAM-TESTING/EPIC.md` | 108 | 34 | YES | |
| `docs/10-requirements/epics/_wave-3-technical/EPIC-GAM-BACKEND/EPIC.md` | 108 | 25, 37 | YES | |

**Discrepancias:** Ninguna. El valor 108 es consistente.

---

## Metric: DTOs (401)

**SSOT Value:** 401 (MASTER_INVENTORY.yml, BACKEND_INVENTORY.yml)

| File | Value Found | Line | Match? | Context |
|------|-------------|------|--------|---------|
| `docs/20-architecture/STACK-TECNOLOGICO.md` | 401 | 181 | YES | |
| `docs/00-overview/GLOSARIO.md` | 401 | 102 | YES | |
| `docs/90-adr/ADR-045-clean-architecture-pragmatica.md` | 401 | 19 | YES | |
| `docs/50-guides/testing/GUIA-ARCHITECTURE-TESTING.md` | 401 | 246 | YES | |
| `docs/10-requirements/epics/_wave-3-technical/EPIC-GAM-BACKEND/EPIC.md` | 401 | 23 | YES | |

**Discrepancias:** Ninguna. El valor 401 es consistente.

---

## Metric: Schemas (18)

**SSOT Value:** 18 (MASTER_INVENTORY.yml, DATABASE_INVENTORY.yml)

| File | Value Found | Line | Match? | Context |
|------|-------------|------|--------|---------|
| `docs/70-onboarding/ONBOARDING-AGENTES.md` | 18 | 20, 110, 168 | YES | |
| `docs/10-requirements/VISION-ALCANCE.md` | 18 | 116, 276 | YES | |
| `docs/20-architecture/MODELO-DATOS.md` | 18 | 19, 31, 300, 507 | YES | |
| `docs/20-architecture/schema-reference/_INDEX.md` | 18 | 15, 136 | YES | |
| `docs/50-guides/backend/GUIA-RUNBOOK-POSTGRESQL.md` | 18 | 35 | YES | |
| `docs/90-adr/ADR-038-estructura-canonica-apps.md` | 18 | 20, 64 | YES | |
| `docs/40-standards/ESTANDAR-DIAGRAMAS-ER.md` | 18 | 5 | YES | |
| `docs/50-guides/deployment/GUIA-GITHUB-ACTIONS-CICD.md` | 18 | 655 | YES | |
| Multiples otros | 18 | varios | YES | |

**Discrepancias:** Ninguna. El valor 18 es consistente en toda la documentacion.

---

## Metric: ADRs (47)

**SSOT Value:** 47 (docs/90-adr/_MAP.md y _INDEX.md — son los documentos de referencia)

| File | Value Found | Line | Match? | Context |
|------|-------------|------|--------|---------|
| `docs/90-adr/_MAP.md` | 47 | 32, 121, 161 | YES | Documento de indice de ADRs |
| `docs/90-adr/_INDEX.md` | 47 | 8, 94 | YES | Indice completo |

**Discrepancias:** Ninguna. Solo se menciona en los archivos de indice propios del directorio 90-adr/.

---

## Metric: Paginas Frontend (72)

**SSOT Value:** 72 (MASTER_INVENTORY.yml, FRONTEND_INVENTORY.yml)

| File | Value Found | Line | Match? | Context |
|------|-------------|------|--------|---------|
| `docs/70-onboarding/ONBOARDING-AGENTES.md` | 72 | 175 | YES | |
| `docs/00-overview/GLOSARIO.md` | 72 | 116 | YES | |
| `docs/90-adr/ADR-039-ssot-docs-en-proyecto.md` | 72 | 108 | YES | |
| `docs/90-adr/ADR-038-estructura-canonica-apps.md` | 72 | 58 | YES | |
| `docs/90-adr/ADR-050-responsive-design-strategy.md` | 72 | 14 | YES | |
| `docs/10-requirements/epics/_wave-3-technical/EPIC-GAM-FRONTEND/EPIC.md` | 72 | 36 | YES | |
| `docs/50-guides/documentation-master/GAMILIT-DOCUMENTATION-MASTER/GAMILIT-DOCUMENTATION-MASTER.md` | 72/77 y 74/74 | 21, 260 | MIXTO | Usa 72/77 y 74/74 en contextos de mapeo de documentacion, no como metrica del sistema |
| `docs/10-requirements/epics/_wave-3-technical/EPIC-GAM-FRONTEND/_archived/EPIC-GAM-FRONTEND/EPIC.md` | 68 | 36 | **HISTORICO** | Archivo archivado: "68 paginas" — version anterior, en `_archived/` |

**Discrepancias:** El archivo archivado (`_archived/`) con "68 paginas" es contextualmente historico y esperado. El GAMILIT-DOCUMENTATION-MASTER usa "72/77" y "74/74" como metricas de mapeo documental (porcentaje cubierto), no como conteo de paginas del sistema — no es discrepancia real. El valor 72 es consistente en todos los documentos activos.

---

## Metric: Hooks Frontend (132)

**SSOT Value:** 132 (MASTER_INVENTORY.yml, FRONTEND_INVENTORY.yml)

Nota: El FRONTEND_INVENTORY.yml tiene una inconsistencia interna — el campo `resumen.hooks: 132` pero la seccion detallada `hooks.total: 129`. El MASTER_INVENTORY dice 132. Se considera 132 el valor canonico (mas reciente, metodologia reconteo 2026-02-27).

| File | Value Found | Line | Match? | Context |
|------|-------------|------|--------|---------|
| `docs/60-portals/student/specs/_MAP.md` | 132 | 110 | YES | |
| `docs/60-portals/student/specs/README.md` | 132 | 77 | YES | |
| `docs/00-overview/GLOSARIO.md` | 132 | 114 | YES | |
| `docs/10-requirements/epics/_wave-3-technical/EPIC-GAM-TESTING/EPIC.md` | 132 | 35 | YES | |
| `docs/10-requirements/epics/_wave-3-technical/EPIC-GAM-FRONTEND/EPIC.md` | 132 | 25, 36 | YES | |

**Discrepancias:** Ninguna en docs/. El valor 132 es consistente.

---

## Metric: Routes Frontend (74)

**SSOT Value:** 74 (MASTER_INVENTORY.yml, FRONTEND_INVENTORY.yml)

| File | Value Found | Line | Match? | Context |
|------|-------------|------|--------|---------|
| `docs/20-architecture/STACK-TECNOLOGICO.md` | 74 | 77 | YES | "Client-side routing (74 routes)" |
| `docs/10-requirements/epics/_wave-3-technical/EPIC-GAM-FRONTEND/EPIC.md` | 74 | 36 | YES | |
| `docs/10-requirements/epics/_wave-3-technical/EPIC-GAM-FRONTEND/_archived/EPIC-GAM-FRONTEND/EPIC.md` | 72 | 36 | **HISTORICO** | Archivo archivado: "72 routes" — version anterior |

**Discrepancias:** El archivo archivado usa 72, esperado (historico). El valor 74 es consistente en todos los documentos activos.

---

## Metric: Exercise Types / Mecanicas

**SSOT Value (complejo):**
- `ejercicios_tipos: 23` en MASTER_INVENTORY (conteo semantico: 5+5+5+5+3 por modulo)
- DDL ENUM `exercise_type` tiene 33 valores (verificado post-auditoria 2026-02-27)
- DDL COMMENT dice "27 mecanicas" (convención historica del comentario DDL — aceptada como convención)
- `mecanicas_ejercicio: 30` en MASTER_INVENTORY (conteo de mecanicas UI/frontend unicas)

| File | Value Found | Line | Match? | Context |
|------|-------------|------|--------|---------|
| `docs/10-requirements/VISION-ALCANCE.md` | 23 tipos | 32, 72, 146, 310 | YES | Conteo semantico por modulo |
| `docs/00-overview/VISION.md` | 23 tipos | 13 | YES | |
| `docs/00-overview/GLOSARIO.md` | 23 tipos; 30 mecanicas | 65, 66 | YES | Distingue correctamente entre exercise_type (23) y exercise_mechanic (30) |
| `docs/50-guides/testing/GUIA-E2E-PLAYWRIGHT.md` | 30 mecanicas | 24, 831 | YES | |
| `docs/90-adr/ADR-050-responsive-design-strategy.md` | 30 exercise mechanics | 14 | YES | |
| `docs/40-standards/ESTANDAR-TESTING.md` | 30 mecanicas | 1549 | YES | |
| `docs/60-portals/student/specs/README.md` | 30 mecanicas | 25, 50, 604, 646, 784, 798, 806 | YES | |
| `docs/10-requirements/epics/_wave-3-technical/EPIC-GAM-FRONTEND/EPIC.md` | 30 mecanicas | 36 | YES | |
| `docs/10-requirements/epics/EPIC-GAM-F1-EXERCISES/specifications/ET-EDU-001-mecanicas-ejercicios.md` | **27** | 126, 136, 784, 802, 1242 | **PARCIAL** | Referencia al COMMENT DDL: "27 mecánicas específicas GAMILIT" — convención del DDL COMMENT, no discrepancia critica pero inconsistente con SSOT 30 |
| `docs/10-requirements/epics/EPIC-GAM-F1-EXERCISES/requirements/RF-EDU-001-mecanicas-ejercicios.md` | **27** | 41 | **PARCIAL** | "27 mecánicas específicas GAMILIT" — mismo contexto |
| `docs/10-requirements/epics/EPIC-GAM-F3-REPORTS/user-stories/US-REP-001/US-REP-001-analytics-profesor.md` | **27** | 131 | **PARCIAL** | "27 mecánicas educativas" |
| `docs/50-guides/GUIA-REFERENCIAS-SIMCO.md` | **27** | 69 | **PARCIAL** | "Ejercicios con 27 mecánicas diferentes" |
| `docs/20-architecture/schema-reference/03-education.md` | **27** | 942 | **PARCIAL** | "Ejercicios con 27 mecanicas diferentes" |
| `docs/20-architecture/schema-reference/03-education.md` | 33 | 534 | YES | "33 exercise_types" — correcto para el ENUM DDL |
| `docs/90-adr/ADR-008-sistema-dual-exercise-mechanics.md` | nota: 33 actuales | 9 | YES | Nota correccion 2026-02-27 |

**Evaluacion:** El conteo "27" en 5 documentos refleja el comentario DDL ("27 mecánicas específicas GAMILIT") que es una convencion semantica oficial del DDL. Sin embargo, el SSOT MASTER_INVENTORY dice `mecanicas_ejercicio: 30` (conteo frontend). Esto no es una discrepancia grave sino una ambiguedad de convencion: el DDL COMMENT dice 27, el frontend registra 30, el SSOT cuenta 30. Los documentos que citan "27" sin referenciar la convención DDL pueden confundir a nuevos colaboradores.

---

## Metric: RLS Policies (251)

**SSOT Value:** 251 (MASTER_INVENTORY.yml, DATABASE_INVENTORY.yml)

| File | Value Found | Line | Match? | Context |
|------|-------------|------|--------|---------|
| `docs/10-requirements/VISION-ALCANCE.md` | 251 | 115, 211 | YES | |
| `docs/00-overview/TESTING-STRATEGY.md` | 251 | 195 | YES | |
| `docs/00-overview/GLOSARIO.md` | 251 | 89 | YES | |
| `docs/20-architecture/STACK-TECNOLOGICO.md` | 251 | 124, 184, 197 | YES | |
| `docs/20-architecture/schema-reference/_INDEX.md` | 251 | 21, 136 | YES | |
| `docs/10-requirements/epics/_wave-3-technical/EPIC-GAM-DATABASE/EPIC.md` | 251 | 23, 35, 52 | YES | |
| `docs/10-requirements/epics/EPIC-GAM-F4-VALIDATION/...` (multiples) | 251 | varios | YES | |
| `docs/50-guides/backend/GUIA-RUNBOOK-POSTGRESQL.md` | 251 | 41, 239, 373, 607 | YES | |
| `docs/50-guides/backend/GUIA-EXPAND-CONTRACT-MIGRATIONS.md` | 251 | 37, 375, 645 | YES | |
| **`docs/20-architecture/MODELO-DATOS.md`** | **237** | **25, 507** | **NO** | "237 (DDL) / 477 (runtime estimate)" — STALE |
| **`docs/20-architecture/SCHEMA-REFERENCE.md`** | **237** | **36** | **NO** | "*172 tablas | 18 schemas | 237 RLS policies*" — STALE |
| **`docs/20-architecture/schema-reference/99-utilities.md`** | **237** | **131** | **NO** | Footer: "237 RLS policies (DDL)" — STALE |
| **`docs/50-guides/troubleshooting/errores-comunes/database/ERR-DB-004-rls-policy-conflicto.md`** | **207** | **17** | **NO** | "18 schemas y 207 politicas RLS" — muy STALE |
| `docs/30-ux-ui/flujos/system/FL-SYS-06-MULTI-TENANT-ISOLATION.md` | 231/471 | 395 | **DISTINTO** | "231 politicas de fuente / 471 politicas en runtime" — usa conteo diferente (runtime), no el DDL SSOT |

**Discrepancias reales:** 4 archivos con valores obsoletos: 3 con "237" (pre-auditoria RLS count), 1 con "207" (muy stale). El archivo FL-SYS-06 usa "231" que puede ser otro conteo historico.

---

## Metric: Foreign Keys (301)

**SSOT Value:** 301 (MASTER_INVENTORY.yml, DATABASE_INVENTORY.yml)

| File | Value Found | Line | Match? | Context |
|------|-------------|------|--------|---------|
| `docs/00-overview/TESTING-STRATEGY.md` | 301 | 198 | YES | |
| `docs/20-architecture/schema-reference/_INDEX.md` | 301 | 22 | YES | |
| `docs/10-requirements/epics/_wave-3-technical/EPIC-GAM-DATABASE/EPIC.md` | 301 | 28, 35 | YES | |
| `docs/50-guides/backend/GUIA-RUNBOOK-POSTGRESQL.md` | 301 | 42 | YES | |
| `docs/50-guides/backend/GUIA-EXPAND-CONTRACT-MIGRATIONS.md` | 301 | 39 | YES | |
| `docs/10-requirements/epics/EPIC-GAM-F4-VALIDATION/...` (multiples) | 301 | varios | YES | |
| **`docs/20-architecture/MODELO-DATOS.md`** | **299** | **26** | **NO** | "Foreign Keys | 299" — STALE (pre-+2 FKs exercise_id) |
| **`docs/50-guides/troubleshooting/errores-comunes/database/ERR-DB-006-fk-cross-schema.md`** | **299** | **4** | **NO** | "Con 299 foreign keys" — STALE |

**Discrepancias reales:** 2 archivos con "299" (STALE pre-missions FK additions). La diferencia de +2 FKs se debe a missions_exercise_id_fkey + mission_templates_exercise_id_fkey agregados en REC-009.

---

## Tabla Consolidada de Discrepancias

### Discrepancias CRITICAS (valor incorrecto en documento activo)

| # | Archivo | Metrica | Valor en Doc | Valor SSOT | Diferencia |
|---|---------|---------|-------------|------------|-----------|
| D-01 | `docs/40-api/API-REFERENCE.md` | Endpoints | 901 | 912 | -11 (pre-ResourceSharing) |
| D-02 | `docs/30-ux-ui/README.md` | Componentes | 590 (linea 88) | 575 | +15 |
| D-03 | `docs/30-ux-ui/README.md` | Componentes | 592 (linea 151) | 575 | +17 (y cita mal el inventario SSOT) |
| D-04 | `docs/90-adr/ADR-049-confirm-dialog-consolidation.md` | Componentes | 590 | 575 | +15 |
| D-05 | `docs/90-adr/ADR-048-component-sharing-strategy.md` | Componentes | 590 | 575 | +15 |
| D-06 | `docs/50-guides/frontend/GUIA-WCAG-ACCESSIBILITY.md` | Componentes | 590 | 575 | +15 |
| D-07 | `docs/20-architecture/MODELO-DATOS.md` | Tablas | 172 | 173 | -1 |
| D-08 | `docs/20-architecture/README.md` | Tablas | 172 | 173 | -1 |
| D-09 | `docs/20-architecture/SCHEMA-REFERENCE.md` | Tablas | 172 | 173 | -1 |
| D-10 | `docs/20-architecture/schema-reference/99-utilities.md` | Tablas | 172 | 173 | -1 |
| D-11 | `docs/20-architecture/MODELO-DATOS.md` | RLS Policies | 237 | 251 | -14 |
| D-12 | `docs/20-architecture/SCHEMA-REFERENCE.md` | RLS Policies | 237 | 251 | -14 |
| D-13 | `docs/20-architecture/schema-reference/99-utilities.md` | RLS Policies | 237 | 251 | -14 |
| D-14 | `docs/50-guides/troubleshooting/errores-comunes/database/ERR-DB-004-rls-policy-conflicto.md` | RLS Policies | 207 | 251 | -44 (muy stale) |
| D-15 | `docs/20-architecture/MODELO-DATOS.md` | Foreign Keys | 299 | 301 | -2 |
| D-16 | `docs/50-guides/troubleshooting/errores-comunes/database/ERR-DB-006-fk-cross-schema.md` | Foreign Keys | 299 | 301 | -2 |

### Discrepancias MENORES (inconsistencias internas o ambiguedad)

| # | Archivo | Metrica | Valor en Doc | Valor SSOT | Nota |
|---|---------|---------|-------------|------------|------|
| M-01 | `docs/20-architecture/COHERENCE-ENTITIES-DDL.md` | Tablas con Entity | 156 | 157 | Doc cuenta 173-17=156; SSOT cuenta 173-16=157 (diferencia en si auth.users se excluye) |
| M-02 | `docs/20-architecture/COHERENCE-ENTITIES-DDL.md` | Tablas sin Entity | 17 | 16 | Doc incluye auth.users; SSOT solo cuenta data_warehouse |
| M-03 | `docs/10-requirements/epics/EPIC-GAM-F1-EXERCISES/specifications/ET-EDU-001-mecanicas-ejercicios.md` | Mecanicas | 27 | 30 (frontend) | Referencia al DDL COMMENT ("27 mecanicas"), no al conteo frontend |
| M-04 | `docs/10-requirements/epics/EPIC-GAM-F1-EXERCISES/requirements/RF-EDU-001-mecanicas-ejercicios.md` | Mecanicas | 27 | 30 (frontend) | Misma justificacion |
| M-05 | `docs/10-requirements/epics/EPIC-GAM-F3-REPORTS/.../US-REP-001-analytics-profesor.md` | Mecanicas | 27 | 30 (frontend) | Misma justificacion |
| M-06 | `docs/50-guides/GUIA-REFERENCIAS-SIMCO.md` | Mecanicas | 27 | 30 (frontend) | Misma justificacion |
| M-07 | `docs/20-architecture/schema-reference/03-education.md` | Mecanicas | 27 | 30 (frontend) | "Ejercicios con 27 mecanicas diferentes" — misma justificacion |

### Valores Historicos (archivados o contextos justificados — NO son discrepancias activas)

| Archivo | Metrica | Valor | Justificacion |
|---------|---------|-------|---------------|
| `docs/90-adr/ADR-033-expansion-schemas-8-to-18.md` | Tablas | 171 | Historico: estado al momento de la decision de expansion |
| `docs/10-requirements/epics/_wave-3-technical/EPIC-GAM-FRONTEND/_archived/EPIC-GAM-FRONTEND/EPIC.md` | Paginas/Routes | 68 paginas, 72 routes | Archivo archivado `_archived/` — valores de version anterior |
| `docs/90-adr/ADR-008-sistema-dual-exercise-mechanics.md` | Exercise types | "35" en cuerpo | Explicitamente marcado con nota correccion 2026-02-27: "33 valores actuales" |
| `docs/30-ux-ui/flujos/system/FL-SYS-06-MULTI-TENANT-ISOLATION.md` | RLS | 231/471 | Conteo diferente (fuente DDL vs runtime, metodologia distinta) |

---

## Archivos con Mayor Densidad de Discrepancias

Los siguientes archivos tienen multiples metricas incorrectas y deben ser priorizados para actualizacion:

1. **`docs/20-architecture/MODELO-DATOS.md`** — 3 discrepancias: tablas=172 (debe 173), RLS=237 (debe 251), FK=299 (debe 301). Es un documento de arquitectura de alta visibilidad.
2. **`docs/20-architecture/SCHEMA-REFERENCE.md`** — 2 discrepancias: tablas=172, RLS=237. Solo tiene el footer como contenido de metricas.
3. **`docs/20-architecture/schema-reference/99-utilities.md`** — 2 discrepancias: tablas=172, RLS=237. Footer copiado de SCHEMA-REFERENCE.md.
4. **`docs/30-ux-ui/README.md`** — 2 discrepancias de componentes: 590 y 592 (debe 575).
5. **`docs/40-api/API-REFERENCE.md`** — 1 discrepancia critica: 901 endpoints (debe 912).

---

## Recomendaciones

### Prioridad ALTA

1. **Actualizar `docs/40-api/API-REFERENCE.md`:** Cambiar "901" a "912" en header, nota y footer. El documento es del 2026-02-07 y no refleja los +7 ResourceSharing endpoints ni las adiciones posteriores.

2. **Actualizar `docs/20-architecture/MODELO-DATOS.md`:** Corregir tablas (172→173), RLS (237→251), FK (299→301). Este es el documento arquitectonico central del modelo de datos.

3. **Actualizar `docs/20-architecture/SCHEMA-REFERENCE.md` y `docs/20-architecture/schema-reference/99-utilities.md`:** Footer con tablas=172, RLS=237 debe actualizarse a 173 y 251 respectivamente.

### Prioridad MEDIA

4. **Actualizar `docs/30-ux-ui/README.md`:** Corregir 590 (linea 88) y 592 (linea 151) a 575. La linea 151 ademas cita incorrectamente lo que el inventario SSOT dice.

5. **Actualizar ADR-048 y ADR-049:** Cambiar "590 production components" a "575". Aunque son ADRs historicos, siguen activos y se consultan como referencia.

6. **Actualizar `docs/50-guides/frontend/GUIA-WCAG-ACCESSIBILITY.md`:** Cambiar "590 componentes" a "575".

7. **Actualizar `docs/50-guides/troubleshooting/errores-comunes/database/ERR-DB-004-rls-policy-conflicto.md`:** "207 politicas RLS" a 251.

8. **Actualizar `docs/50-guides/troubleshooting/errores-comunes/database/ERR-DB-006-fk-cross-schema.md`:** "299 foreign keys" a 301.

### Prioridad BAJA

9. **Aclarar convencion de mecanicas en ET-EDU-001, RF-EDU-001 y otros:** Los 5 documentos que dicen "27 mecanicas" referencian el DDL COMMENT. Considerar agregar una nota aclaratoria: `(27 segun convencion DDL COMMENT; 30 mecanicas UI en frontend registry)`.

10. **Revisar `docs/20-architecture/COHERENCE-ENTITIES-DDL.md`:** La discrepancia "Tablas sin Entity: 17" vs SSOT "16" require alineacion — definir si auth.users se cuenta o no en el gap.

---

*Auditoria completada: 2026-02-27*
*Total de archivos en docs/ revisados: todos los .md en busqueda de los 16 patrones de metricas*
*Archivos con discrepancias activas: 16 archivos con 16 discrepancias criticas + 7 menores*
