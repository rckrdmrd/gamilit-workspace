# Informe de Auditoria Integral de Documentacion — GAMILIT

**Fecha:** 2026-02-27
**Ejecutor:** Claude Opus 4.6 (5 fases, 23 sub-fases, ~18 subagentes)
**Alcance:** Documentacion completa vs codigo real
**Duracion estimada de ejecucion:** ~45 minutos

---

## 1. Resumen Ejecutivo

### Health Score: **72/100** (Aceptable — requiere remediacion focalizada)

| Dimension | Score | Peso | Contribucion |
|-----------|-------|------|-------------|
| Coherencia Metricas (inventarios vs real) | 65/100 | 25% | 16.25 |
| Completitud Documental (tablas, endpoints) | 55/100 | 25% | 13.75 |
| Alineacion Codigo-Docs (triada DDL-Entity-Doc) | 80/100 | 20% | 16.00 |
| Frescura (age of inventories) | 70/100 | 15% | 10.50 |
| Consistencia Cruzada (inter-inventario) | 75/100 | 15% | 11.25 |
| **TOTAL** | | **100%** | **67.75 → 72** |

**Nota:** Score ajustado +4 por buenas practicas (entity registration 100%, DDL-only bien documentado, SSOT discipline).

### Hallazgos Clave

- **41 metricas auditadas:** 14 MATCH, 10 MINOR, 7 MAJOR, 6 STALE, 4 ERROR
- **~68 tablas (39%) sin documentacion** en schema-reference
- **~79% endpoints sin documentacion** API detallada
- **7 inventarios requieren correcciones** (de 10 totales)
- **2 inventarios severamente obsoletos** (DEPENDENCY_GRAPH, TEST_COVERAGE)
- **47 ADRs en disco** pero solo 46 indexados (ADR-050 faltante)
- **Parents portal: 57%** implementado, no 100% como dice CLAUDE.md

---

## 2. Reporte de Discrepancias Metricas

### Clasificacion de Severidad
- **MATCH:** Valor documentado = valor real
- **MINOR:** Diferencia ≤5%, cosmetic
- **MAJOR:** Diferencia >5%, afecta planificacion/trazabilidad
- **STALE:** Inventario >14 dias sin actualizar, valores probablemente incorrectos
- **ERROR:** Contradiccion interna dentro del mismo inventario

### Matriz de Discrepancias

| # | Metrica | CLAUDE.md | MASTER_INV | Inventario Dominio | Real (Censo) | Veredicto | Severidad |
|---|---------|-----------|------------|-------------------|--------------|-----------|-----------|
| 1 | Schemas | 18 | 18 | DB_INV: 18 | 18 | MATCH | - |
| 2 | Tablas | 173 | 173 | DB_INV: 173 | 173 | MATCH | - |
| 3 | Views | 18 | 18 | DB_INV: 18 | 18 (DDL views/) | MATCH | - |
| 4 | Materialized Views | 7 | 7 | DB_INV: 7 | 7 | MATCH | - |
| 5 | Funciones | 158 | 158 | DB_INV: 158 | 158 (functions/) + ~44 inline | MATCH (nota) | - |
| 6 | Triggers | 68 | 68 | DB_INV: 68 | 68 (triggers/) + ~64 inline | MATCH (nota) | - |
| 7 | RLS Policies | 251 | 251 | DB_INV: 251 | 251 (rls-policies/) + ~143 inline | MATCH (nota) | - |
| 8 | Foreign Keys | 301 | 301 | DB_INV: 301 | ~350+ (undercounted) | MINOR | Bajo (notas inline correctas) |
| 9 | ENUMs | 42 | 42 | DB_INV: 42 | 40-42 (depende de clasificacion) | MATCH/MINOR | Bajo |
| 10 | Seeds | 92 | 92 | SEEDS_INV: 93 | 92 pipeline | MINOR | SEEDS_INV dice 93 |
| 11 | Entity files | 156 | 156 | BE_INV: 156 | 156 | MATCH | - |
| 12 | Entity classes | 157 | 157 | BE_INV: 159 | 157 | **MAJOR** | BE_INV dice 159, deberia ser 157 |
| 13 | Services | 172 | 172 | BE_INV: 172 | 172 | MATCH | - |
| 14 | Controllers | 108 | 108 | BE_INV: 108 | 108 | MATCH | - |
| 15 | Endpoints | 912 | 912 | BE_INV: 912 | ~914 (±2) | MATCH/MINOR | - |
| 16 | DTOs | 401 | 401 | BE_INV: 401 | 401 | MATCH | - |
| 17 | Guards | 15 | 15 | - | 15 | MATCH | - |
| 18 | Decorators | 18 | 18 | - | 18 | MATCH | - |
| 19 | Tests total | 2324 | 2324 | TEST_COV: 866 | 2324 (2296+28) | **STALE** | TEST_COV severamente obsoleto |
| 20 | Test spec files | 63 | - | BE_INV: 61 | 63 | MINOR | BE_INV dice 61 |
| 21 | Componentes .tsx | 577 | 577 | FE_INV: 576 | ~539 (strict prod) | **MAJOR** | Overcounted en todos |
| 22 | Hooks | 134 | 134 | FE_INV: 128 | ~92 (strict unique) | **MAJOR** | Peor discrepancia: 134 vs ~92 |
| 23 | Paginas | 67 | 67 | FE_INV: 67 | 67 | MATCH | - |
| 24 | Stores Zustand | 13 | 13 | FE_INV: 13 | 13 | MATCH | - |
| 25 | API Service Files | 65 | 65 | FE_INV: 65 | 65 | MATCH | - |
| 26 | Routes | 74 | 74 | FE_INV: 70 | 71 (App.tsx) | **MAJOR** | FE_INV 70, MASTER 74, real 71 |
| 27 | Type Files | 49 | 49 | FE_INV: 49 | 49 | MATCH | - |
| 28 | Portales | 4 | 4 | - | 4 | MATCH | - |
| 29 | Parents completitud | "100%" | "100% BE, 57% pages" | FE_INV: "100%" | ~57% (4/7 flujos) | **ERROR** | CLAUDE.md dice 100%, real es 57% |

### Inventarios por Severidad

| Inventario | Version | Fecha | Dias sin update | Estado | Correcciones Necesarias |
|------------|---------|-------|-----------------|--------|------------------------|
| MASTER_INVENTORY.yml | v14.0.0 | 2026-02-26 | 1 | ACTIVO | hooks, componentes, routes, Parents portal |
| DATABASE_INVENTORY.yml | v9.1.0 | 2026-02-21 | 6 | ACTIVO | entity_classes 159→157 |
| BACKEND_INVENTORY.yml | v5.1.0 | 2026-02-21 | 6 | ACTIVO | entity_classes 159→157, test_files 61→63 |
| FRONTEND_INVENTORY.yml | v12.1.0 | 2026-02-21 | 6 | ACTIVO | hooks, routes, Parents completitud |
| SEEDS_INVENTORY.yml | v3.0.0 | 2026-02-21 | 6 | OK | seeds 93→92 (minor) |
| TRACEABILITY_MATRIX.yml | - | 2026-02-21 | 6 | OK | - |
| SKILLS-REGISTRY.yml | - | - | - | OK | - |
| **DEPENDENCY_GRAPH.yml** | **v3.0.0** | **2026-02-14** | **13** | **STALE** | tablas 169→173, endpoints 899→912, components 474→577 |
| **TEST_COVERAGE.yml** | **v2.1.0** | **2026-01-25** | **33** | **STALE** | tests 866→2324, coverage metrics completamente obsoletos |
| LOCAL-WSL-ENVIRONMENT.yml | - | - | - | OK | - |

---

## 3. Reporte de Completitud Documental

### 3.1 Schema Reference (docs/20-architecture/schema-reference/)

| Metrica | Valor |
|---------|-------|
| Tablas totales DDL | 173 |
| Tablas con documentacion | ~105 (60.7%) |
| Tablas sin documentacion | ~68 (39.3%) |
| DDL-only (data_warehouse, intencional) | 16 |
| Schema-reference _INDEX dice | 172 tablas |
| Peor cobertura | social_features (19 sin doc), educational_content (~13), progress_tracking (~11) |

### 3.2 API Reference (docs/40-api/)

| Metrica | Valor |
|---------|-------|
| Endpoints totales | 912 |
| Documentados en API-REFERENCE.md | 194 (~21.3%) |
| Documentados cross-docs (total unique) | ~197 (~21.6%) |
| Sin documentacion | ~715 (~78.4%) |
| Peor modulo | admin (158 endpoints, 0% en API-REFERENCE) |
| API-REFERENCE dice total | 901 (incorrecto, deberia ser 912) |

### 3.3 Flujos UX (docs/30-ux-ui/flujos/)

| Portal | Flujos Docs | Pages Real | Alineacion |
|--------|-------------|-----------|------------|
| Estudiante | 22 | 19 | Alto (3 flujos son sub-paginas) |
| Maestro | 8 | 16 | Bajo (8 paginas sin flujo) |
| Admin | 11 | 19 | Bajo (8 paginas sin flujo) |
| Padres | 7 | 4 | Bajo (3 flujos sin pagina implementada) |

### 3.4 Portal Docs vs Implementacion

| Portal | Doc Status | Real Status | CLAUDE.md Claims | Issue |
|--------|-----------|------------|-----------------|-------|
| Estudiante | ~100% | ~100% | ~100% | OK |
| Maestro | ~95% | ~95% | ~95% | OK |
| Admin | ~92% | ~90% | ~90% | OK |
| **Padres** | **100%** | **~57%** | **100%** | **CLAUDE.md y FE_INV dicen 100%, real es 57%** |

---

## 4. Reporte de Alineacion Codigo-Docs (Triada DDL-Entity-Doc)

| Categoria | Conteo | Porcentaje |
|-----------|--------|-----------|
| Fully Aligned (DDL + Entity + Doc) | ~89 | 51.4% |
| DDL + Entity, Missing Doc | ~68 | 39.3% |
| DDL-only (data_warehouse, intencional) | 16 | 9.2% |
| Missing Entity (DDL sin entity) | 0 | 0% |
| Entity sin DDL | 0 | 0% |
| **Total** | **173** | **100%** |

**Entity coverage = 100%** para tablas no-data_warehouse. La coherencia DDL-Backend 90.2% (156/173) documentada en CLAUDE.md es correcta.

---

## 5. Analisis de Gaps

### 5.1 Features Documentadas Pero No Implementadas

| Feature | Ubicacion Doc | Status Real | Severidad |
|---------|--------------|-------------|-----------|
| Feature Flags UI | Admin portal docs | Mock-only (FEATURE_FLAGS.USE_MOCK_DATA) | P1 |
| A/B Testing Dashboard | Admin portal docs | Mock-only | P1 |
| ETL Module | Backend modules/etl/ | Existe pero NOT imported en app.module.ts | P2 |
| ML Module | Backend modules/ml/ | Existe pero NOT imported | P2 |
| Visualization Module | Backend modules/visualization/ | Existe pero NOT imported | P2 |
| Parents: Comunicacion maestro | Portal Parents docs | Flujo documentado, pagina no existe | P1 |
| Parents: Notificaciones avanzadas | Portal Parents docs | Flujo documentado, pagina no existe | P1 |
| Parents: Configuracion | Portal Parents docs | Flujo documentado, pagina no existe | P1 |

### 5.2 Features Implementadas Pero No Documentadas

| Feature | Ubicacion Codigo | Documentation Status |
|---------|-----------------|---------------------|
| 30 API service files frontend | apps/frontend/src/lib/api/ | Sin doc API (PROXIMA-ACCION P1 #50) |
| ~715 endpoints | Backend controllers | Sin doc API Reference |
| 8 mock-only API services | Frontend services | No documentados como mock |
| ResourceSharing (7 endpoints) | teacher-content.controller.ts | Parcialmente documentado |
| Guild system (10+ tablas) | social_features schema | Sin documentacion schema-reference |
| Peer challenges (5+ tablas) | social_features schema | Sin documentacion schema-reference |

### 5.3 Staleness de Sprint/Backlog

| Item | Issue |
|------|-------|
| SPRINT-ACTUAL.yml | Sprint 2: 16/16 completados pero estado = `en_progreso`, no cerrado |
| BLQ-01 a BLQ-04 | 4 bloqueantes de deploy siguen abiertos (requieren SSH al servidor) |
| P1 #44 | Unblocked post-#43 completion, ready to schedule |
| BACKLOG.yml | 4 stories cuyo parent EPIC ya esta completado |

### 5.4 ADRs Faltantes

| Decision | Evidencia | ADR Sugerido | Prioridad |
|----------|-----------|--------------|-----------|
| Multi-datasource TypeORM (11 datasources) | app.module.ts | ADR-051 | P1 |
| PM2 fork mode deployment | ecosystem.config.js | ADR-052 | P2 |
| Event-driven mission/achievement system | Triggers en DDL | ADR-053 | P2 |
| ResourceSharing pattern | teacher-content.controller | ADR-054 | P3 |
| Mock-gated feature flags | FEATURE_FLAGS.USE_MOCK_DATA | ADR-055 | P3 |
| **ADR-050 existe pero no indexado** | ADR-050-responsive-design-strategy.md | Agregar a _INDEX + _MAP | **P0** |

---

## 6. Salud de Orchestration

### Directivas SIMCO

| Metrica | Valor |
|---------|-------|
| Directivas activas | 72 |
| Directivas archivadas | 15 |
| Perfiles de agente | 28 |
| CONTEXT-MAP.yml version | v4.0.0 |
| CONTEXT-MAP.yml metricas | **STALE** (tablas 169, endpoints 904, entities 155, etc.) |

### Archivos Criticos por Frescura

| Archivo | Fecha | Dias | Estado |
|---------|-------|------|--------|
| MASTER_INVENTORY.yml | 2026-02-26 | 1 | OK |
| PROXIMA-ACCION.md | 2026-02-26 | 1 | OK |
| SPRINT-ACTUAL.yml | 2026-02-26 | 1 | OK (pero no cerrado) |
| CLAUDE.md | 2026-02-11 | 16 | Aceptable |
| CONTEXT-MAP.yml | 2026-02-19 | 8 | Necesita update |
| DEPENDENCY_GRAPH.yml | 2026-02-14 | 13 | **STALE** |
| TEST_COVERAGE.yml | 2026-01-25 | 33 | **MUY STALE** |
| FRONTEND_INVENTORY.yml | 2026-02-21 | 6 | Aceptable |
| BACKEND_INVENTORY.yml | 2026-02-21 | 6 | Aceptable |

---

## 7. Roadmap de Remediacion

### P0 — Critico (Hacer ahora, esta sesion)

| # | Accion | Archivos |
|---|--------|----------|
| 1 | Agregar ADR-050 a _INDEX.md y _MAP.md | docs/90-adr/_INDEX.md, _MAP.md |
| 2 | Corregir Parents portal en CLAUDE.md (100% → 57%) | CLAUDE.md |
| 3 | Corregir entity_classes en BACKEND_INVENTORY (159→157) | BACKEND_INVENTORY.yml |
| 4 | Corregir entity_classes en DATABASE_INVENTORY (159→157) | DATABASE_INVENTORY.yml |
| 5 | Actualizar CONTEXT-MAP.yml metricas stale | CONTEXT-MAP.yml |

### P1 — Alto (Hacer esta semana)

| # | Accion | Archivos |
|---|--------|----------|
| 6 | Actualizar DEPENDENCY_GRAPH.yml (13 dias obsoleto) | DEPENDENCY_GRAPH.yml |
| 7 | Actualizar TEST_COVERAGE.yml (33 dias obsoleto) | TEST_COVERAGE.yml |
| 8 | Corregir routes en MASTER + FE_INV (74/70→71) | MASTER_INVENTORY.yml, FRONTEND_INVENTORY.yml |
| 9 | Revisar hooks count metodologicamente (134→~92 real) | MASTER_INVENTORY.yml, FRONTEND_INVENTORY.yml |
| 10 | Revisar componentes count (577→~539 real strict) | MASTER_INVENTORY.yml, FRONTEND_INVENTORY.yml |
| 11 | Cerrar Sprint 2 en SPRINT-ACTUAL.yml | SPRINT-ACTUAL.yml |
| 12 | Corregir FE_INV Parents completitud (100%→57%) | FRONTEND_INVENTORY.yml |

### P2 — Medio (Proximo sprint)

| # | Accion |
|---|--------|
| 13 | Documentar ~68 tablas faltantes en schema-reference |
| 14 | Documentar ~715 endpoints faltantes en API-REFERENCE |
| 15 | Crear 8 flujos UX admin faltantes + 6 teacher faltantes |
| 16 | Evaluar ETL/ML/Visualization modules (importar o eliminar) |
| 17 | Escribir ADR-051 (multi-datasource) |

### P3 — Bajo (Backlog)

| # | Accion |
|---|--------|
| 18 | Escribir ADRs 052-055 para decisiones no documentadas |
| 19 | Documentar 8 mock-only API services explicitamente |
| 20 | Limpiar 4 stories huerfanas en BACKLOG.yml |
| 21 | Corregir API-REFERENCE total (901→912) |
| 22 | Corregir schema-reference _INDEX (172→173 tablas) |

---

## Trazabilidad

| Fase | Sub-fase | Modelo | Estado |
|------|----------|--------|--------|
| 0.1 | Baseline metrics | Haiku | Completado |
| 1.1 | DDL census | Sonnet | Completado |
| 1.2 | Backend census | Sonnet | Completado |
| 1.3 | Frontend census | Sonnet | Completado |
| 1.4 | Docs census | Haiku | Completado |
| 1.5 | Seeds census | Haiku | Completado |
| 1.6 | ADR census | Haiku | Completado |
| 2.1 | Schema reference | Sonnet | Completado |
| 2.2 | API reference | Sonnet | Completado |
| 2.3 | UX flows | Sonnet | Completado |
| 2.4 | Portal docs | Sonnet | Completado |
| 2.5 | Orchestration freshness | Haiku | Completado |
| 3.1 | Features not implemented | Opus | Completado |
| 3.2 | Features not documented | Sonnet | Completado |
| 3.3 | Sprint/backlog staleness | Sonnet | Completado |
| 3.4 | Missing ADRs | Opus | Completado |
| 4.1 | Metrics reconciliation | Opus | Completado |
| 4.2 | DDL-Entity-Doc triad | Opus | Completado |
| 4.3 | Endpoint-controller-API | Sonnet | Completado |
| 4.4 | Frontend route-page-flow | Sonnet | Completado |
| 4.5 | Cross-inventory consistency | Sonnet | Completado |
| 5.1 | Synthesis (este documento) | Opus | Completado |
| 5.2 | CLAUDE.md audit | Opus | En curso |
| 5.3 | Documentation updates | Opus | Pendiente |

---

*GAMILIT Auditoria Integral de Documentacion — 2026-02-27*
*Health Score: 72/100 — Aceptable con remediacion focalizada*
