---
titulo: "Catálogo Detallado de Violaciones ADR-039"
tipo: reporte
fecha_creacion: 2026-02-28
estado: completado
---

# Catálogo Detallado de Violaciones ADR-039 SSOT

## Estructura del Catálogo

Cada violación se documenta con:
- **ID:** Número único (V1-1, V1-4, etc.)
- **Severidad:** HIGH / MEDIUM / LOW
- **Tipo:** Categoría de violación
- **Ubicación:** Ruta del archivo
- **Problema:** Descripción de la violación
- **Impacto:** Riesgo y consecuencias
- **Remediación:** Acción recomendada
- **Esfuerzo:** Horas estimadas

---

## TIPO 1: docs/ con Contenido de Gobernanza

Violaciones donde docs/ contiene narrativa operacional/governance que pertenece a orchestration/.

---

### V1-1: docs/00-overview/GOBIERNO-SIMCO.md

**Severidad:** LOW
**Tipo:** Governance narrative in product docs

**Ubicación:**
```
docs/00-overview/GOBIERNO-SIMCO.md (19 líneas)
```

**Problema:**
- Describe SIMCO, NEXUS, y CAPVED como si fuera características del producto
- Contiene "Regla de carga mínima para agentes" — claramente operacional
- No aporta valor a documentación de producto

**ADR-039 Violation:**
- **DEC-SSOT-001:** docs/ debe ser ÚNICA fuente de verdad para producto. Este contenido es proceso.
- **Remedio:** El contenido debe vivir en orchestration/ (ej. orchestration/agents/ para onboarding de agentes)

**Impacto:**
- Bajo: 19 líneas, claramente errante en docs/
- Confunde límites entre producto y proceso
- Reduce claridad de propósito de docs/00-overview/

**Remediación Recomendada:**
```markdown
# OPCIÓN A: Convertir en stub (3 líneas)
# GOBIERNO-SIMCO

Governance and orchestration framework lives in `orchestration/`.

- See: [orchestration/PROJECT-CONTEXT.md](../../orchestration/PROJECT-CONTEXT.md)
- See: [orchestration/directivas/](../../orchestration/directivas/)

---

# OPCIÓN B: Eliminar
Mantener en orchestration/ solamente como orchestration/agents/ONBOARDING-SIMCO.md
```

**Esfuerzo:** 15 minutos
**Riesgo:** Muy bajo (stub es seguro; contenido completo existe en orchestration/)

---

### V1-2: docs/00-overview/directivas/_INDEX.md

**Severidad:** MEDIUM
**Tipo:** Stale metrics + governance content in product docs

**Ubicación:**
```
docs/00-overview/directivas/_INDEX.md
```

**Problema:**
1. **Directorio completo (`directivas/`) no pertenece en docs/**
   - ADR-039 asigna directivas a orchestration/
   - docs/ no debe tener carpeta "directivas"

2. **Métricas desactualizadas y embebidas:**
   ```
   Métricas Actuales (SSOT: orchestration/inventarios/MASTER_INVENTORY.yml v7.0.0)
   Database: schemas: 18, tablas: 170, rls_policies: 263, ...
   Backend: modulos: 22, endpoints: 850, ...
   Frontend: componentes: 458, ...
   ```
   - Estas métricas son SEVERAS desactualizadas:
     - v7.0.0 → actual es v14.6.0 (7+ versiones atrás)
     - tablas: 170 → actual 173
     - endpoints: 850 → actual 912 (+62, +7.3%)
     - componentes: 458 → actual 575 (+117, +25.5%)
   - Viola DEC-SSOT-004: "Inventarios en orchestration/ SSOT"

**ADR-039 Violations:**
- **DEC-SSOT-001:** orchestration/ governance no debe estar en docs/
- **DEC-SSOT-004:** Métricas embebidas violan SSOT — deben estar solo en orchestration/inventarios/

**Impacto:**
- **HIGH:** Agentes y procesos que leen esta página obtienen métricas incorrectas (25%+ error en componentes)
- **MEDIUM:** Reduce confiabilidad de documentación general de docs/00-overview/
- **Medium:** Confunde ubicación de directivas

**Remediación Recomendada:**
```bash
# 1. Eliminar subdirectorio completo
rm -rf docs/00-overview/directivas/

# 2. Actualizar docs/00-overview/METRICAS.md con:
# IMPORTANTE: Las métricas siempre deben consultarse en:
# See: orchestration/inventarios/MASTER_INVENTORY.yml (current version)

# 3. Verificar que otros archivos no hacen referencia a docs/00-overview/directivas/
grep -r "00-overview/directivas" docs/
```

**Esfuerzo:** 30 minutos
**Riesgo:** Bajo (datos stale se reemplazan con link a SSOT correcto)

---

### V1-3: docs/40-standards/ESTANDAR-MEMORIA-TOKENS.md

**Severidad:** MEDIUM
**Tipo:** Duplicate of orchestration/ governance standard

**Ubicación:**
```
docs/40-standards/ESTANDAR-MEMORIA-TOKENS.md (~200 líneas)
```

**Problema:**
- Describe token budgets para ventana de contexto de agentes IA
- Contiene tablas de limites por modelo (Claude Opus, Haiku, Gemini, etc.)
- Describe triggers de limpieza NEXUS (L0-L3 context levels)
- Describe estrategias de purga y compactación — TODO operacional de agentes

**ADR-039 Violation:**
- **DEC-SSOT-001:** Este contenido es governance (cómo agentes gestionan contexto), no estándar de producto
- El mismo documento reconoce: "Referencia Operacional: `@MEMORIA-TOKENS` → `orchestration/directivas/simco/SIMCO-MEMORIA-TOKENS.md`"
- Content existe duplicado en orchestration/ (canonical) — docs/ copy es redundante

**Impacto:**
- **LOW:** Content existe en ubicación correcta (orchestration/), así que no hay información pérdida
- **Medium:** Mantención de doble fuente
- **Low:** Contribuyentes de producto lean estándar erróneo

**Remediación Recomendada:**
```markdown
# Reemplazar docs/40-standards/ESTANDAR-MEMORIA-TOKENS.md con stub:

---
titulo: "REDIRECT: Token Memory Management"
tipo: redirect
---

# ESTANDAR-MEMORIA-TOKENS

**Esta documentación se ha movido.**

⚠️ **Para desarrolladores de producto:** Si necesita entender limites de memoria context, ver `docs/40-standards/_INDEX.md` para estándares relevantes.

⚠️ **Para agentes IA:** Token budgets y estrategias de contexto se definen en:
- `orchestration/directivas/simco/SIMCO-MEMORIA-TOKENS.md` (canonical)
- `orchestration/CONTEXT-MAP.yml`

Este archivo no contiene información de producto.

---
```

**Esfuerzo:** 20 minutos
**Riesgo:** Muy bajo (contenido completo disponible en orchestration/)

---

### V1-4: docs/40-standards/ESTANDAR-SKILLS.md

**Severidad:** HIGH
**Tipo:** Prescribes orchestration/ structure from product docs

**Ubicación:**
```
docs/40-standards/ESTANDAR-SKILLS.md (~150 líneas)
```

**Problema:**
- Define estructura de directorios `orchestration/skills/`
- Prescribe YAML frontmatter para skill files
- Integración con SIMCO (simco_source, capved_required, agents_compatible fields)
- Describe registry operations para skills

**ADR-039 Violation:**
- **DEC-SSOT-001:** Esto define cómo estructurar agent infrastructure (orchestration/), no product functionality
- Un archivo en docs/40-standards/ **no debe prescribir la estructura** de orchestration/
- Content es puramente operacional — describes cómo agents descubren y ejecutan skills

**Impacto:**
- **HIGH:** Establece fuente de verdad en lugar equivocado (docs vs orchestration)
- **Medium:** Agents buscan estándares en docs/, no en orchestration/
- **Medium:** Si ambas ubicaciones divergen, confusion sobre qué versión es correcta

**Remediación Recomendada:**
```bash
# MOVER archivo COMPLETO a orchestration/
mv docs/40-standards/ESTANDAR-SKILLS.md \
   orchestration/agents/SKILL-STANDARD.md

# Actualizar docs/40-standards/ESTANDAR-SKILLS.md como stub redirect:
# (ver V1-3 formato)

# Actualizar referencias en docs/40-standards/_INDEX.md:
# [ESTANDAR-SKILLS.md] → [REDIRECT] a `orchestration/agents/SKILL-STANDARD.md`
```

**Esfuerzo:** 30 minutos
**Riesgo:** Bajo (mero cambio de ubicación; el contenido no cambia)

---

## TIPO 2: Contenido en Sección Equivocada (6 violaciones)

Violaciones donde contenido está en sección incorrecta dentro de docs/ o entre docs/orchestration.

---

### V2-1: docs/10-requirements/testing-guides/

**Severidad:** MEDIUM
**Tipo:** QA guides mislocated in requirements section

**Ubicación:**
```
docs/10-requirements/testing-guides/
├── README.md
├── _INDEX.md
├── _MAP.md
├── modulo-1-literal-test-guide.md (+ 4 más por módulo)
```

**Problema:**
- 7 archivos: QA testing guides con respuestas de ejemplo para todos 5 módulos educativos
- Content: "Step-by-step QA validation with sample answers"
- Propósito: Manual QA testing (no product requirement definition)
- README.md states: "Uso: QA/Testing, Desarrollo, Contenido"

**ADR-039 Violation:**
- **DEC-SSOT-002 scope:** docs/10-requirements/ contiene "EPICs, User Stories, especificaciones funcionales"
- QA testing guides con respuestas de ejemplo son **execution guides**, no requirement specs

**Impacto:**
- **MEDIUM:** Mislocación organizacional
- **Low:** Content es valuable, solo ubicación equivocada
- **Low:** Discoverability issue (QA team busca en docs/50-guides/testing, no en requirements)

**Remediación Recomendada:**
```bash
# Mover directorio completo a docs/50-guides/testing/
mv docs/10-requirements/testing-guides/ \
   docs/50-guides/testing/exercise-guides/

# Actualizar liens en docs/ si existen
grep -r "10-requirements/testing-guides" docs/ | \
  sed 's|10-requirements/testing-guides|50-guides/testing/exercise-guides|g'

# Nota: Considerar consolidar con docs/99-delivery/.../GUIA-RESPUESTAS-EJERCICIOS.md
#       que sirve propósito similar
```

**Esfuerzo:** 30 minutos
**Riesgo:** Muy bajo (solo reorganización)

---

### V2-2: docs/50-guides/documentation-master/GAMILIT-DOCUMENTATION-MASTER/

**Severidad:** HIGH
**Tipo:** Complete task execution report in guides section

**Ubicación:**
```
docs/50-guides/documentation-master/GAMILIT-DOCUMENTATION-MASTER/
├── GAMILIT-DOCUMENTATION-MASTER.md (main 150 KB+ file)
├── ANALISIS-HALLAZGOS-DETALLADO.md
├── fase-0-inventarios/
├── fase-1-catalogo/
├── fase-2-discovery/
├── fase-3-analisis/
├── fase-4-remediation/
├── fase-5-validation/
├── fase-6-consolidation/
└── YAML catalogs (PAGES-CATALOG-GAMILIT.yml, etc.)
```

**Problema:**
- Estructura 7 fases CAPVED (task execution)
- Encabezado: "Tarea: TASK-2026-01-22-DOCUMENTATION-MASTER. Sistema: SIMCO v4.0.0 + CAPVED. Agente: Claude Code"
- Content: Audit execution logs, before/after metrics, phase reports
- YAML files: Inventory-style catalogs (páginas, componentes, mapeos)

**ADR-039 Violation:**
- **DEC-SSOT-005:** "Tareas son proceso, no producto. docs/ no tiene carpeta tareas/."
- Este es claramente un **task execution report** (output de task CAPVED)
- YAML catalogs deben estar en orchestration/inventarios/ (DEC-SSOT-004)

**Impacto:**
- **HIGH:** Misrepresents docs/50-guides/ purpose (guides para contributors, no task reports)
- **HIGH:** YAML catalogs should be SSOT en orchestration/inventarios/
- **MEDIUM:** Reduces clarity of what docs/50-guides/ contains

**Remediación Recomendada:**
```bash
# MOVER directorio completo a orchestration/
mkdir -p orchestration/tareas/TASK-2026-01-22-DOCUMENTATION-MASTER/
cp -r docs/50-guides/documentation-master/GAMILIT-DOCUMENTATION-MASTER/* \
      orchestration/tareas/TASK-2026-01-22-DOCUMENTATION-MASTER/

# MOVER YAML catalogs al inventory
mv orchestration/tareas/.../PAGES-CATALOG-GAMILIT.yml \
   orchestration/inventarios/PAGES-CATALOG.yml
# (consolidate with existing MASTER_INVENTORY.yml)

# Limpiar docs/50-guides/
rm -rf docs/50-guides/documentation-master/GAMILIT-DOCUMENTATION-MASTER/

# Actualizar referencias
grep -r "documentation-master/GAMILIT-DOCUMENTATION-MASTER" docs/ | \
  sed 's|documentation-master/GAMILIT-DOCUMENTATION-MASTER|tareas/TASK-2026-01-22-DOCUMENTATION-MASTER|g'
```

**Esfuerzo:** 1 hora (move + update links + consolidate YAML)
**Riesgo:** Bajo (mera reorganización; contenido no cambia)

---

### V2-3: docs/00-overview/REPORTE-INTEGRAL-2026-01-20.md

**Severidad:** HIGH
**Tipo:** Agent task execution report in overview section

**Ubicación:**
```
docs/00-overview/REPORTE-INTEGRAL-2026-01-20.md (~300 líneas)
```

**Problema:**
- Encabezado: "REPORTE INTEGRAL: ANALISIS FINAL DE PORTALES Y DOCUMENTACION"
- "Tarea: TASK-2026-01-20-ANALISIS-FINAL-PORTALES"
- "Sistema: SIMCO v4.0.0 + CAPVED"
- "Agente: Trae AI (Gemini 3 Pro)"
- Content: CAPVED task execution analysis with before/after portal metrics

**ADR-039 Violation:**
- **DEC-SSOT-005:** "orchestration/tareas/TASK-{YYYY-MM-DD}-{DESC}/" contiene tracking de tareas. NO en docs/."
- Esta es claramente un **task execution artifact**

**Impacto:**
- **HIGH:** Misrepresents docs/00-overview/ as containing process reports (confunde propósito)
- **MEDIUM:** Audience expects product overview, not agent execution logs

**Remediación Recomendada:**
```bash
# MOVER archivo a orchestration/tareas/
mkdir -p orchestration/tareas/TASK-2026-01-20-ANALISIS-FINAL-PORTALES/
mv docs/00-overview/REPORTE-INTEGRAL-2026-01-20.md \
   orchestration/tareas/TASK-2026-01-20-ANALISIS-FINAL-PORTALES/REPORTE-INTEGRAL.md

# Actualizar referencias
grep -r "00-overview/REPORTE-INTEGRAL-2026-01-20" docs/ orchestration/ | \
  sed 's|00-overview/REPORTE-INTEGRAL-2026-01-20|tareas/TASK-2026-01-20-ANALISIS-FINAL-PORTALES/REPORTE-INTEGRAL|g'
```

**Esfuerzo:** 30 minutos
**Riesgo:** Bajo

---

### V2-4: docs/80-references/transversal/correcciones/BACKEND-CRITICAL-ISSUES-PENDING.md

**Severidad:** MEDIUM
**Tipo:** Resolved issue tracking document

**Ubicación:**
```
docs/80-references/transversal/correcciones/BACKEND-CRITICAL-ISSUES-PENDING.md
```

**Problema:**
- Issue tracking document from 2025-01-04
- Title: "BACKEND-CRITICAL-ISSUES-PENDING" (misleading — ALL resuelto)
- Content: P0 backend issues marked "IMPLEMENTADO"
- File header: "Estado: Resuelto"
- Status: 100% histórico; no pending

**ADR-039 Violation:**
- **DEC-SSOT-005:** Issue tracking is process artifact, not product reference

**Impacto:**
- **MEDIUM:** Misleading title ("PENDING" when actually resolved)
- **Low:** Content es histórico pero correcto

**Remediación Recomendada:**
```bash
# OPCIÓN A: Archivar en orchestration/
mkdir -p orchestration/trazas/historical/
mv docs/80-references/transversal/correcciones/BACKEND-CRITICAL-ISSUES-PENDING.md \
   orchestration/trazas/historical/2025-01-04-BACKEND-CRITICAL-ISSUES-RESOLVED.md

# OPCIÓN B: Eliminar si no tiene valor histórico
rm docs/80-references/transversal/correcciones/BACKEND-CRITICAL-ISSUES-PENDING.md

# Nota: ANALISIS-ERROR-404-PROGRESS-MODULES.md en mismo dir tiene mismo problema
```

**Esfuerzo:** 15 minutos
**Riesgo:** Muy bajo (historical artifact)

---

### V2-5: docs/30-ux-ui/flujos/system/FL-SYS-06-MULTI-TENANT-ISOLATION.md

**Severidad:** MEDIUM
**Tipo:** Architecture documentation in UX section

**Ubicación:**
```
docs/30-ux-ui/flujos/system/FL-SYS-06-MULTI-TENANT-ISOLATION.md (~250 líneas)
```

**Problema:**
- Ubicado en: docs/30-ux-ui/flujos/system/
- Content: Technical architecture of RLS multi-tenant isolation
- Details: PostgreSQL session variables, JWT strategy, TypeScript interceptors, BYPASSRLS status
- Code snippets backend y database-level

**ADR-039 Violation (Technical, not strict ADR-039):**
- Content stays in docs/ (no violation of SSOT)
- Pero está en sección equivocada: docs/30-ux-ui/ es para wireframes, mockups, user flows
- Debería estar: docs/20-architecture/

**Impacto:**
- **MEDIUM:** Discoverability (architects buscan en architecture, no UX)
- **Low:** Content es valuable, solo ubicación equivocada
- **Low:** UX/UI section diluted con architecture content

**Remediación Recomendada:**
```bash
# MOVER archivo
mkdir -p docs/20-architecture/security/
mv docs/30-ux-ui/flujos/system/FL-SYS-06-MULTI-TENANT-ISOLATION.md \
   docs/20-architecture/security/MULTI-TENANT-ISOLATION-ARCHITECTURE.md

# Actualizar referencias
grep -r "30-ux-ui/flujos/system/FL-SYS-06" docs/ orchestration/

# Considerar separar system/flows de system/architecture
# system/FL-SYS-02-EXERCISE-SUBMISSION-PIPELINE.md
# system/FL-SYS-03-GAMIFICATION-REWARD-CHAIN.md
# system/FL-SYS-04-TWO-FACTOR-AUTHENTICATION.md
# system/FL-SYS-05-MULTI-TENANT-ONBOARDING.md
# (los otros pueden quedarse en UX si son flows, no architecture)
```

**Esfuerzo:** 20 minutos
**Riesgo:** Bajo

---

### V2-6: docs/50-guides/testing/MANUAL-TESTING-GUIDE-US-AE-007.sh

**Severidad:** LOW
**Tipo:** Executable script in documentation

**Ubicación:**
```
docs/50-guides/testing/MANUAL-TESTING-GUIDE-US-AE-007.sh (también en docs/50-guides/testing/impl/)
```

**Problema:**
- Archivo .sh (bash script) en docs/ directory
- docs/ debería contener solo documentación (.md, .yml, .json)
- Script ejecutable es artifact, no documentación
- Existe duplicado en dos ubicaciones

**ADR-039 Violation (Technical):**
- ADR-039 no cubre esto explícitamente, pero docs/ should be documentation-only

**Impacto:**
- **LOW:** Script no interfiere con SSOT
- **Low:** Duplicación en dos ubicaciones
- **low:** Best practice violation (ejecutables no van en docs/)

**Remediación Recomendada:**
```bash
# OPCIÓN A: Mover a infraestructura de test
mkdir -p apps/backend/test/scripts/
mv docs/50-guides/testing/MANUAL-TESTING-GUIDE-US-AE-007.sh \
   apps/backend/test/scripts/MANUAL-TESTING-GUIDE-US-AE-007.sh

rm docs/50-guides/testing/impl/MANUAL-TESTING-GUIDE-US-AE-007.sh  # Remove duplicate

# OPCIÓN B: Archivar si obsoleto
# Verificar si script es aún usado antes de mover
chmod +x apps/backend/test/scripts/MANUAL-TESTING-GUIDE-US-AE-007.sh
```

**Esfuerzo:** 10 minutos
**Riesgo:** Muy bajo

---

## TIPO 3: orchestration/ Content Belonging in docs/ (2 violaciones)

---

### V3-1: orchestration/referencias/ESTANDAR-ESTRUCTURA-DOCS.md

**Severidad:** MEDIUM
**Tipo:** Documentation standard in orchestration

**Ubicación:**
```
orchestration/referencias/ESTANDAR-ESTRUCTURA-DOCS.md (~150 líneas)
```

**Problema:**
- Define la estructura estándar de directorio docs/ para ALL projects
- Prescribe directorios obligatorios, archivos requeridos, convenciones
- Este es un ESTÁNDAR DE DOCUMENTACIÓN (product-level guidance)
- Debería estar junto con otros estándares en docs/40-standards/

**ADR-039 Violation:**
- **DEC-SSOT-001:** Estándares de documentación pertenecen a docs/40-standards/, donde contributors los descubren
- Ubicado en orchestration/referencias/ lo hace menos discoverable para documentadores

**Impacto:**
- **MEDIUM:** Reduced discoverability para documentation contributors
- **Low:** Content existe, solo ubicación equivocada
- **Low:** Puede divergir de docs/40-standards/ si hay versiones múltiples

**Remediación Recomendada:**
```bash
# MOVER archivo a docs/
mv orchestration/referencias/ESTANDAR-ESTRUCTURA-DOCS.md \
   docs/40-standards/ESTANDAR-ESTRUCTURA-DOCS.md

# Actualizar referencias
grep -r "referencias/ESTANDAR-ESTRUCTURA-DOCS" orchestration/
```

**Esfuerzo:** 15 minutos
**Riesgo:** Bajo (mero cambio de ubicación)

---

### V3-2: orchestration/referencias/PLAN-DESARROLLO-ACTUALIZADO.md

**Severidad:** MEDIUM
**Tipo:** Epic development plan in wrong orchestration location

**Ubicación:**
```
orchestration/referencias/PLAN-DESARROLLO-ACTUALIZADO.md (~200 líneas)
```

**Problema:**
- Development plan con fases, tasks, DDL changes, backend/frontend work
- Referencias específicas a EPIC-GAM-F1-GAMIFICATION
- Contiene checkboxes, implementation status (operacional)
- Pero también contiene product-level planning (feature phases)

**ADR-039 Violation:**
- **DEC-SSOT-002:** Epic plans deben vivir en docs/10-requirements/epics/EPIC-ID/PLAN.md
- Current location en orchestration/referencias/ no es ni product planning ni proper task tracking

**Impacto:**
- **MEDIUM:** Ubicación ambigua — no es descubrible como epic planning
- **Low:** Content no está duplicado, pero fragmentado

**Remediación Recomendada:**
```bash
# MOVER contenido a epic correspondiente
mv orchestration/referencias/PLAN-DESARROLLO-ACTUALIZADO.md \
   docs/10-requirements/epics/EPIC-GAM-F1-GAMIFICATION/PLAN-IMPLEMENTATION.md

# Verificar que docs/10-requirements/epics/EPIC-GAM-F1-GAMIFICATION/PLAN.md no existe
# Si existe, considerar consolidación

# Actualizar referencias
grep -r "PLAN-DESARROLLO-ACTUALIZADO" orchestration/
```

**Esfuerzo:** 30 minutos
**Riesgo:** Bajo (content consolidation)

---

## Resumen de Violaciones

| # | Violación | Severidad | Tipo | Esfuerzo | Riesgo |
|---|-----------|-----------|------|----------|--------|
| V1-1 | docs/00-overview/GOBIERNO-SIMCO.md | LOW | Governance stub | 15 min | Muy bajo |
| V1-2 | docs/00-overview/directivas/_INDEX.md | MEDIUM | Stale metrics | 30 min | Bajo |
| V1-3 | docs/40-standards/ESTANDAR-MEMORIA-TOKENS.md | MEDIUM | Duplicate directive | 20 min | Muy bajo |
| V1-4 | docs/40-standards/ESTANDAR-SKILLS.md | HIGH | Prescribes orch structure | 30 min | Bajo |
| V2-1 | docs/10-requirements/testing-guides/ | MEDIUM | QA guides misloc | 30 min | Muy bajo |
| V2-2 | docs/50-guides/documentation-master/ | HIGH | Task report in guides | 1h | Bajo |
| V2-3 | docs/00-overview/REPORTE-INTEGRAL-2026-01-20.md | HIGH | Task report in overview | 30 min | Bajo |
| V2-4 | docs/80-references/correcciones/BACKEND-CRITICAL-ISSUES-PENDING.md | MEDIUM | Resolved issues tracking | 15 min | Muy bajo |
| V2-5 | docs/30-ux-ui/flujos/system/FL-SYS-06-*.md | MEDIUM | Architecture in UX | 20 min | Bajo |
| V2-6 | docs/50-guides/testing/MANUAL-TESTING-GUIDE-US-AE-007.sh | LOW | Executable in docs | 10 min | Muy bajo |
| V3-1 | orchestration/referencias/ESTANDAR-ESTRUCTURA-DOCS.md | MEDIUM | Standard in orch | 15 min | Bajo |
| V3-2 | orchestration/referencias/PLAN-DESARROLLO-ACTUALIZADO.md | MEDIUM | Plan misloc | 30 min | Bajo |

**Total Effort:** 4-6 horas
**Total Risk:** LOW (only reorganization, no content loss)

---

*Catalog Date: 2026-02-28*
*Source: Task audit analysis + validation of prior TASK-2026-02-27-AUDITORIA-DOCS findings*
