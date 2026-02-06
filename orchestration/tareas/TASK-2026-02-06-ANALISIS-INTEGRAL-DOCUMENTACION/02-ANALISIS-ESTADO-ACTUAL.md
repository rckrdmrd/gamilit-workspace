# 02-ANALISIS-ESTADO-ACTUAL - Hallazgos Consolidados

**Task:** TASK-2026-02-06-ANALISIS-INTEGRAL-DOCUMENTACION
**Fase:** A (Analisis) | **Estado:** COMPLETADO | **Fecha:** 2026-02-06

---

## Resumen Ejecutivo

Se ejecutaron **11 subagentes** de analisis (5 exploracion + 6 profundidad) cubriendo 6 dimensiones del universo documental de GAMILIT. Se identificaron **122 hallazgos** distribuidos en 6 categorias, con un **score global de documentacion de 68/100**.

| Dimension | Score | Hallazgos | Criticos |
|-----------|-------|-----------|----------|
| Requerimientos (RF/US/ET) | 55/100 | 15 | 3 |
| Consistencia de Metricas | 50/100 | 18 | 4 |
| Trazabilidad y SSOT | 65/100 | 12 | 3 |
| Documentacion Obsoleta | 70/100 | 52 | 10 |
| Logica de Negocio | 85/100 | 10 | 1 |
| Arquitectura y ADRs | 75/100 | 20 | 3 |
| **GLOBAL** | **68/100** | **127** | **24** |

---

## 1. REQUERIMIENTOS - Score: 55/100

### 1.1 Gap Critico: 81 Archivos RF Faltantes (72% del total)

**REQUIREMENTS-INDEX.yml** declara 112 archivos RF pero solo existen **31 archivos**.

| EPIC | RF Declarados | RF Existentes | Gap | Severidad |
|------|---------------|---------------|-----|-----------|
| EXT-001 (Portal Maestros) | 24 | 1 | -23 | CRITICO |
| EXT-002 (Admin Extendido) | 19 | 1 | -18 | CRITICO |
| EAI-001 (Fundamentos) | 8 | 4 | -4 | ALTO |
| EAI-002 (Actividades) | 8 | 3 | -5 | ALTO |
| EAI-003 (Gamificacion) | 8 | 4 | -4 | ALTO |
| EAI-005 (Admin Base) | 7 | 4 | -3 | ALTO |
| EAI-007 (M4-M5) | 6 | 3 | -3 | ALTO |
| ETC-001 (Consolidacion) | 5 | 0 | -5 | CRITICO |
| EXT-003 a EXT-011 | 3-6 c/u | 0 c/u | -33 total | MEDIO |
| EAI-003-EXT (Gam Social) | 6 | 2 | -4 | ALTO |

### 1.2 User Stories: 94% Cobertura (130/138)

- **Faltantes:** 8 US (6% gap) - principalmente EXT-001 (-3) y ETC-001 (-5)
- **Extras:** EAI-007 (+1), EXT-002 (+1)
- **Nomenclatura inconsistente:** US-PM-* vs RF-TCH-* (EXT-001), HU-ETC-* vs US-ETC-* (ETC-001)

### 1.3 Technical Specs: 88 archivos ET (bien cubiertos)

- Distribucion apropiada por EPIC
- No rastreados en REQUIREMENTS-INDEX.yml

### 1.4 COMPLETENESS-TRACKER Inflado

- **Declara:** 100% completitud (22/22 EPICs)
- **Realidad:** 82% MVP (18/22 EPICs completos, 4 en BACKLOG: EXT-007/008/009/010/011)

### 1.5 TRACEABILITY.yml: 100% Cobertura (22/22 EPICs)

- Excelente: Todos los EPICs tienen archivo TRACEABILITY.yml en implementacion/

---

## 2. CONSISTENCIA DE METRICAS - Score: 50/100

### 2.1 Discrepancias Criticas (4 metricas con >20% error)

| Metrica | Valor Correcto | Fuentes Incorrectas | Error Max |
|---------|---------------|---------------------|-----------|
| Tablas DDL | **171** | PROJECT-PROFILE (137), PROYECTO (138), mirrors (137) | 20% |
| Entities | **141** | PROJECT-PROFILE (123), PROYECTO (158) | 18% |
| Coherencia DDL-BE | **82.5%** | PROJECT-PROFILE (99%), PROYECTO (100%) | 17.5pp |
| Functions SQL | **128** | PROYECTO (15), PROJECT-PROFILE (45) | 88% |

### 2.2 Fuentes SSOT Correctas (4 fuentes alineadas)

| Fuente | Version | Fecha | Status |
|--------|---------|-------|--------|
| .claude/CLAUDE.md | v4.3.0 | 2026-02-05 | CORRECTO |
| MASTER_INVENTORY.yml | v6.0.0 | 2026-02-05 | CORRECTO |
| DATABASE_INVENTORY.yml | v6.0.0 | 2026-02-05 | CORRECTO |
| BACKEND_INVENTORY.yml | v3.15.0 | 2026-02-05 | CORRECTO |

### 2.3 Fuentes Desactualizadas (6 fuentes con errores)

| Fuente | Ultima Actualizacion | Dias Atras | Status |
|--------|---------------------|------------|--------|
| PROJECT-PROFILE.yml | 2026-01-24 | 13 dias | DESACTUALIZADO |
| PROJECT-STATUS.md | 2026-02-02 | 4 dias | DESACTUALIZADO |
| FRONTEND_INVENTORY.yml | 2026-01-25 | 12 dias | PARCIAL |
| shared/mirrors/gamilit/ | 2026-01-18 | 19 dias | DESACTUALIZADO |
| docs/PROYECTO-GAMILIT.md | Sin fecha | ? | DESACTUALIZADO |
| CHANGELOG.md | 2026-01-30 | 7 dias | FALTA ENTRADA |

### 2.4 CHANGELOG.md: Falta entrada 2026-02-05

- Ultimo entry: v2.6.0 (2026-01-30)
- Falta: Reconciliacion tablas 140->171, entities 137->141, coherencia 100%->82.5%

---

## 3. TRAZABILIDAD Y SSOT - Score: 65/100

### 3.1 Archivos TRACEABILITY Duplicados (3 ubicaciones)

| Ubicacion | Version | Fecha | Status |
|-----------|---------|-------|--------|
| docs/_SSOT/TRACEABILITY-MASTER.yml | v3.1.0 | 2026-01-30 | **CANONICO** |
| docs/10-arquitectura/modelado/trazabilidad/TRACEABILITY-MASTER.yml | v1.0.0 | 2026-01-13 | OBSOLETO |
| orchestration/inventarios/TRACEABILITY_MATRIX.yml | v3.0 | 2026-01-16 | DIFERENTE PROPOSITO |

### 3.2 ENTITIES-CATALOG.md Criticamente Desactualizado

- **Documenta:** 18 entities (solo gamificacion)
- **Realidad:** 141 entities en 22 modulos
- **Gap:** 87% de entities no catalogadas

### 3.3 CODE-MAPPINGS.yml Desactualizado

- **Documenta:** 139 tablas, 125 entities
- **Realidad:** 171 tablas, 141 entities
- **Gap:** +32 tablas, +16 entities sin mapear

### 3.4 Cobertura de Trazabilidad por Capa

| Capa | Mapeados | Total | Cobertura |
|------|----------|-------|-----------|
| EPICs | 22 | 22 | 100% |
| User Stories | 138 | 138 | 100% |
| Requirements (RF) | 112 | 112 | 100% (en SSOT) |
| Database Tables | 151 | 171 | 88.3% |
| Backend Entities | 141 | 171 | 82.5% |
| API Documentation | ~50 | 850 | ~6% |

### 3.5 Referencias Rotas

- `TRACEABILITY_MATRIX.yml` referencia `docs/90-transversal/inventarios/` (path incorrecto)
- `ENTITIES-CATALOG.md` referencia `@/features/gamification/*/types/` (path frontend sin prefijo)
- Varios ADRs referencian `docs/97-adr/` en lugar de `docs/90-adr/`

---

## 4. DOCUMENTACION OBSOLETA - Score: 70/100

### 4.1 Distribucion de Elementos por Prioridad

| Prioridad | Elementos | Accion Principal |
|-----------|-----------|-----------------|
| P0 (Inmediato) | 10 | Reconciliar metricas, consolidar TRACEABILITY |
| P1 (Corto plazo) | 22 | Archivar correcciones 2026-01, purge legacy |
| P2 (Mediano plazo) | 20 | Deprecar dead features, revisar archive |
| **Total** | **52** | |

### 4.2 Conflictos de Estado Criticos

| Archivo 1 | Archivo 2 | Conflicto |
|-----------|-----------|-----------|
| PROJECT-STATUS.md (MVP 75%) | PROXIMA-ACCION.md (MVP 98%) | 23pp diferencia |
| orchestration/TRACEABILITY.yml (v1.1.0) | docs/_SSOT/TRACEABILITY-MASTER.yml (v3.1.0) | Version duplicada |
| FRONTEND_INVENTORY.yml (398 components) | MASTER_INVENTORY.yml (458 components) | +60 gap |

### 4.3 Dead Features: Requieren Validacion

TASK-2026-02-05 declara 4 dead features, pero el analisis encontro **contradicciones**:

| Feature | "Dead" segun TASK-2026-02-05 | Evidencia en Codigo/DDL | Accion |
|---------|------------------------------|------------------------|--------|
| boosts | SI | active_boosts table EXISTS, entity EXISTS, function EXISTS | **VALIDAR** |
| forum | SI | 26 referencias en docs/orchestration | PURGE refs si confirmado |
| social_interactions | SI | Flujo Social documentado como funcional | **VALIDAR** |
| team_vs_team | SI | Sin referencias encontradas | PURGE (confirmado dead) |

### 4.4 Documentacion Temporal No Archivada (15+ docs)

- `docs/80-referencias/transversal/correcciones/CORR-009-*` (3 docs, 2026-01)
- `docs/80-referencias/transversal/correcciones/CORR-010-*` (3 docs, 2026-01)
- `docs/80-referencias/transversal/correcciones/CORR-011-*` (3 docs, 2026-01)
- `docs/80-referencias/transversal/analisis/*-2026-01-07.md` (3 docs)
- `REPORTE-VALIDACION-DOCUMENTACION-2025-12-26.md` (superseded?)
- `ACTUALIZACION-FRONTEND-INVENTORY-2025-11-26.md` (ya integrado)
- `QUICK-REFERENCE-ADMIN-COMPONENTS-2025-11-26.md` (integrar o purge)

### 4.5 Legacy Guidelines Superseded

- `orchestration/_internal/legacy_guidelines/` (7 archivos)
- Superseded por: BOOTLOADER.md + CONTEXT-MAP.yml + CLAUDE.md (SIMCO v4.3)
- Accion: Mover a `_internal/_archive/pre-simco-v4.3/`

---

## 5. LOGICA DE NEGOCIO - Score: 85/100

### 5.1 DocumentoDeDiseño v6.5: Cobertura 85%

**Cubierto (mecanicas educativas):**
- M1-M5: 23 tipos de ejercicio especificados al 100%
- Sistema XP/Niveles: Formulas, umbrales, multiplicadores
- Rangos Maya: 5 rangos con bonos y progresion
- ML Coins: Economia virtual completa
- Comodines: 3 tipos con costos y penalizaciones

**NO cubierto en design doc (pero especificado en ET-GAM-*):**
- Achievements (ET-GAM-001) - 100% implementado
- Missions (ET-GAM-008) - 95% implementado
- Leaderboards (ET-GAM-007) - 100% implementado
- Streaks (ET-GAM-009) - 100% implementado
- Social features (EAI-003-EXT) - 88% implementado
- Exercise lifecycle/dual evaluation - Documentado separadamente

### 5.2 Modulos No Implementados (Especificados al 100%)

| Modulo | Mecanicas | Especificacion | Implementacion | Esfuerzo |
|--------|-----------|---------------|----------------|----------|
| M2 (Inferencial) | 5 | 100% | 0% | 60h |
| M3 (Critica) | 5 | 100% | 0% | 75h |

### 5.3 Features Implementadas sin Design Doc

| Feature | Spec Separada | Implementacion | Recomendacion |
|---------|--------------|----------------|---------------|
| Achievements | ET-GAM-001 | 100% | Agregar Seccion 6 al Design Doc |
| Missions | ET-GAM-008 | 95% | Agregar Seccion 7 al Design Doc |
| Leaderboards | ET-GAM-007 | 100% | Agregar Seccion 8 al Design Doc |
| Streaks | ET-GAM-009 | 100% | Agregar Seccion 9 al Design Doc |
| Social | EAI-003 | 88% | Agregar Seccion 10 al Design Doc |

### 5.4 ML Coins Multiplier: Intencional N/I

- Documentado en design doc como "No Implementado (backlog)"
- Solo XP multipliers estan activos (1.00x a 1.25x)
- No es un gap, es una decision de alcance

---

## 6. ARQUITECTURA Y ADRs - Score: 75/100

### 6.1 Inventario: 31 ADRs

- **Aceptados/Implementados:** 26
- **Gaps en numeracion:** 5 (ADR-004, 005, 006, 024, 025)
- **Sin status explicito:** 5 (ADR-027 a 032)
- **Formato inconsistente:** ADR-XXXX vs ADR-XXX vs ADR-YYYY-MM-DD

### 6.2 Informacion Incorrecta en ARCHITECTURE.md

- **Declara:** "8 schemas, 40+ tables"
- **Realidad:** 18 schemas, 171 tables
- **Impacto:** Onboarding incorrecto, desconfianza

### 6.3 API Documentation: ~5% Cobertura

- `API.md` solo documenta endpoints de `/api/auth`
- Faltan: gamification, educational, progress, social, admin, teacher, y ~24 modulos mas
- 850 endpoints totales, <50 documentados en markdown

### 6.4 Decisiones Sin ADR

| Decision | Implementada | ADR Existente | Recomendacion |
|----------|-------------|---------------|---------------|
| Expansion 8->18 schemas | SI | NO | Crear ADR-033 |
| Crecimiento 40->171 tablas | SI | NO | Documentar en ARCHITECTURE.md |
| Constants SSOT Strategy | SI | NO | Opcional ADR-034 |
| TypeORM sobre Prisma | SI | NO | Opcional ADR-035 |

### 6.5 Referencias Rotas en ADRs

- `docs/97-adr/` referenciado en lugar de `docs/90-adr/` (multiples ADRs)
- Paths absolutos Linux hardcodeados (`/home/isem/workspace/...`)
- DDL-SCHEMA-ORDER.md lista 16 schemas en lugar de 18

### 6.6 Deuda Tecnica: Bien Gestionada (100/100)

- DEUDA-TECNICA-ENUMS-H-034.md: Actualizado, priorizado
- DEUDA-TECNICA-TEST-COVERAGE.md: Plan en 3 sprints
- Frontend: 13% coverage (objetivo 40%)

---

## 7. CATALOGO CONSOLIDADO DE HALLAZGOS

### Hallazgos CRITICOS (P0) - 24 items

| ID | Categoria | Hallazgo | Impacto |
|----|-----------|----------|---------|
| DOC-001 | Req | 81 RF files faltantes (72% gap) | Trazabilidad incompleta |
| DOC-002 | Req | ETC-001: 0 docs pese a estar "COMPLETED" | Inconsistencia |
| DOC-003 | Req | COMPLETENESS-TRACKER dice 100%, real 82% | Metricas falsas |
| DOC-004 | Metricas | Tablas: 137-171 rango (20% error) | Decisiones incorrectas |
| DOC-005 | Metricas | Entities: 123-158 rango (18% error) | Decisiones incorrectas |
| DOC-006 | Metricas | Coherencia: 82.5%-100% rango | Falsa seguridad |
| DOC-007 | Metricas | Functions: 15-128 rango (88% error) | Datos inutiles |
| DOC-008 | SSOT | 3 TRACEABILITY-MASTER duplicados | Confusion SSOT |
| DOC-009 | SSOT | ENTITIES-CATALOG: 18/141 (87% faltante) | Catalogo inutil |
| DOC-010 | SSOT | CODE-MAPPINGS: 139/171 tablas (19% gap) | Mapeo incompleto |
| DOC-011 | Obsoleto | PROJECT-STATUS MVP 75% vs PROXIMA 98% | Estado contradictorio |
| DOC-012 | Obsoleto | Dead features sin validar (boosts) | Purga incorrecta |
| DOC-013 | Obsoleto | Dead features sin validar (social_interactions) | Purga incorrecta |
| DOC-014 | Arq | ARCHITECTURE.md: "8 schemas" (real 18) | Onboarding incorrecto |
| DOC-015 | Arq | 5 ADRs con gaps numeracion | Secuencia rota |
| DOC-016 | Arq | Expansion schemas sin ADR | Arquitectura sin rationale |
| DOC-017 | Metricas | 6 fuentes desactualizadas simultaneamente | Confianza en docs |
| DOC-018 | Req | EXT-001: 23 RF faltantes (96% gap) | Epic critico sin RF |
| DOC-019 | Req | EXT-002: 18 RF faltantes (95% gap) | Epic critico sin RF |
| DOC-020 | SSOT | Referencias rotas (97-adr, paths Linux) | Links rotos |
| DOC-021 | Negocio | Design doc no cubre achievements/missions/leaderboards | Doc fragmentada |
| DOC-022 | Obsoleto | 15+ docs temporales no archivados | Ruido documental |
| DOC-023 | Obsoleto | Legacy guidelines no archivados | Confusion directivas |
| DOC-024 | Arq | API.md solo ~5% cobertura (solo auth) | API sin docs |

### Hallazgos ALTOS (P1) - 35 items

| ID | Categoria | Hallazgo |
|----|-----------|----------|
| DOC-025 a DOC-059 | Varios | RF faltantes por EPIC (EAI-001 a EAI-007), metricas divergentes en fuentes secundarias, DDL-SCHEMA-ORDER incompleto, nomenclatura US inconsistente, CHANGELOG sin entrada 2026-02-05, ADRs sin status, formato ADR inconsistente, etc. |

### Hallazgos MEDIOS (P2) - 38 items

Incluyen: Dead feature refs (forum, team_vs_team), archived tasks con definiciones, portal admin archivados, deuda tecnica enums, docs date-stamped de 2025, backlog EPICs sin RF.

### Hallazgos BAJOS (P3) - 30 items

Incluyen: ADRs retrospectivos opcionales (Constants SSOT, TypeORM), Supabase legacy comment, stubs vacios (20-perfiles, 60-proyectos, 70-onboarding), paths absolutos Linux en ADRs.

---

## 8. DIAGNOSTICO FINAL

### Fortalezas del Proyecto
1. **TRACEABILITY.yml 100%** - Todos los 22 EPICs tienen trazabilidad implementacion
2. **User Stories 94%** - 130/138 archivos existen
3. **Inventarios principales actualizados** - MASTER/DATABASE/BACKEND al dia (v6.0.0)
4. **Logica de negocio solida** - Design doc + ET specs cubren 95% del sistema
5. **Deuda tecnica gestionada** - Bien documentada y priorizada
6. **ADRs comprehensivos** - 31 decisiones documentadas
7. **CAPVED en tareas recientes** - Tareas 2026-02 tienen documentacion completa

### Debilidades Criticas
1. **72% de archivos RF no existen** - Gap masivo en requerimientos formales
2. **6 fuentes de metricas desactualizadas** - Confusion en estado real
3. **3 TRACEABILITY duplicados** - SSOT comprometido
4. **ARCHITECTURE.md con datos incorrectos** - "8 schemas" vs 18 real
5. **API docs ~5% cobertura** - 850 endpoints, <50 documentados
6. **Dead features sin validar** - Riesgo de purga incorrecta
7. **Design doc fragmentado** - Gamificacion avanzada en specs separados

### Esfuerzo Estimado de Remediacion

| Prioridad | Hallazgos | Esfuerzo | Plazo |
|-----------|-----------|----------|-------|
| P0 (Criticos) | 24 | 40-50h | 1 semana |
| P1 (Altos) | 35 | 25-35h | 2 semanas |
| P2 (Medios) | 38 | 15-20h | 3 semanas |
| P3 (Bajos) | 30 | 10-15h | 4 semanas |
| **Total** | **127** | **90-120h** | **~4 semanas** |
| **Paralelo (~60%)** | | **55-75h** | **~2.5 semanas** |
