# 03 - TRAZABILIDAD DE REQUISITOS

**Fecha:** 2026-02-25 | **Fase:** 3 | **Subagentes:** O-TRACE-01, S-TRACE-02, S-TRACE-03

---

## Estructura de EPICs

### Resumen por Fase

| Fase | EPICs | User Stories | Tasks | Estado |
|------|-------|-------------|-------|--------|
| F1 (completado) | 7 | 40 | 231 | Completado |
| F2 (parcial) | 3 | 12 | 8 | Completado |
| F3 (en progreso) | 12 | 83 | 3 | En progreso |
| F4 (pendiente) | 1 | 9 | 37 | En progreso |
| **Total** | **23** | **144** | **279** | |

### EPICs con Estructura Incompleta (4/23)

| EPIC | Faltante |
|------|----------|
| EPIC-GAM-F1-PORTAL-ADMIN | requirements/, user-stories/, specifications/ |
| EPIC-GAM-F2-DB-MIGRATION | requirements/, user-stories/, specifications/ |
| EPIC-GAM-F2-TECH-CONSOLIDATION | specifications/ |
| EPIC-GAM-F4-VALIDATION | requirements/, specifications/ |

### Discrepancia Conteo EPICs
- **MASTER_INVENTORY:** "34 EPICs, 162 SP"
- **Directorios EPIC-GAM-F*:** 23
- **Explicacion:** 34 = 23 funcionales + 11 Wave 3 tecnicos en `_wave-3-technical/`
- **"162 SP":** Solo refleja Wave 3 subtotal, no el gran total de 688 SP

### features/ Directory
- Legacy bridge (4 archivos) que redirige a EPICs F3
- No duplica contenido EPIC, es navegacion historica
- `EXT-003-notificaciones/` y `EXT-010-parent-notifications/` son stubs huerfanos

---

## Placeholders y TODOs

### PF-001 (XXX lineas) — 12 archivos

| # | Archivo | Lineas Reales | >400L? | Clasificacion |
|---|---------|--------------|--------|---------------|
| 1 | US-CONT-001-editor-wysiwyg.md | 347 | No | VALID (F3) |
| 2 | US-CONT-002-gestion-ejercicios.md | 395 | No | VALID (F3) |
| 3 | US-CONT-003-biblioteca-recursos.md | 372 | No | VALID (F3) |
| 4 | US-CONT-004-versionamiento.md | 356 | No | VALID (F3) |
| 5 | US-CONT-005-import-export.md | 467 | **SI** | VALID + PF-001 violation |
| 6 | US-PERF-004-interacciones-sociales.md | 617 | **SI** | VALID + PF-001 violation |
| 7 | US-PERF-005-personalizacion-dashboard.md | 570 | **SI** | VALID + PF-001 violation |
| 8 | US-PERF-006-showcasing-logros.md | 605 | **SI** | VALID + PF-001 violation |
| 9 | US-REP-002-analytics-admin.md | 682 | **SI** | VALID + PF-001 violation |
| 10 | US-REP-003-analytics-predictivo.md | 571 | **SI** | VALID + PF-001 violation |
| 11 | US-REP-004-data-warehouse-etl.md | 663 | **SI** | VALID + PF-001 violation |
| 12 | US-REP-005-visualizaciones-avanzadas.md | 312 | No | VALID (F3) |

**7 archivos exceden 400L** — todos son F3 (trabajo futuro). Requieren split antes de iniciar sprint.

### TODOs Sustantivos — 13 hallazgos

**STALE (7) — F1/F2 completados, TODOs en muestras de codigo de specs:**
1. RF-EDU-003-taxonomia-bloom.md:661 — TODO en ejemplo de codigo
2. ET-EDU-002-niveles-dificultad.md:1112,1139 — 2 TODOs en ejemplo de codigo
3. ET-GAM-002-comodines.md:858 — TODO para NLP
4. ET-GAM-003-rangos-maya.md:1050 — TODO para restriccion roles
5. ET-GAM-005-hook-user-gamification.md:97 — TODO para API real
6. DATOS-SEED.md:282 — TODO para datos prueba (seeds 100% completos)

**VALID (6) — Requieren accion futura:**
1. RF-GAM-004-economia-ml-coins.md:281 — ML Coins multiplicadores NO implementados
2. RF-INIT-001-inicializacion-automatica-usuario.md:82 — Bug misiones no inicializadas
3. RF-EXT-002-SPRINTS-1-2-3.md:284 — Password reset email TODO
4. RF-EXT-002-SPRINTS-1-2-3.md:529 — Cache flush endpoint TODO
5. RF-EXT-002-SPRINTS-1-2-3.md:533 — Session cleanup endpoint TODO
6. ET-BULK-OPERATIONS.md:593 — **SEGURIDAD: validacion cross-tenant faltante (P1)**

### Task Stubs — 285 archivos
Todos son plantillas SIMCO intencionales de 7 lineas con `Sub: TBD`. Representan trabajo de sprint no planificado. No son defectos.

---

## Flujos vs Rutas

### Catalogo de Flujos

| Portal | Flujos | Meta/Index |
|--------|--------|-----------|
| auth | 3 | 0 |
| student | 21 | 0 |
| teacher | 8 | 0 |
| admin | 11 | 0 |
| parents | 7 | 0 |
| shared | 3 | 0 |
| meta/audit | 0 | 13 |
| **Total** | **53** | **13** |

### Verificacion de Rutas (20 flujos muestreados)

- **Rutas referenciadas:** 38 distintas
- **Encontradas en App.tsx:** 36 (94.7%)
- **Faltantes:** 2
  - `/teacher/classes/:id` (FL-TCH-08) — implementado como sub-panel, no ruta separada
  - `/exercise/:id` (FL-STU-06) — error tipografico, ruta real es `/exercises/:exerciseId`

### Flujos de Features No Implementadas (8)

| Flujo | Feature | Modulo % | Estado |
|-------|---------|----------|--------|
| FLUJO-AMIGOS | Social friendships | 50% | PARCIAL — ruta existe, backend parcial |
| FLUJO-GREMIOS | Guilds/Teams | 50% | PARCIAL — ruta existe, wiring incompleto |
| FLUJO-TIENDA-OVERVIEW | Shop catalog | 75% | PARCIAL |
| FLUJO-TIENDA-COMPRA | Shop purchase | 75% | PARCIAL |
| FLUJO-COMPRA-INVENTARIO-EQUIPAR | Buy+inventory+equip E2E | 75%/50% | PARCIAL |
| FLUJO-PERSONALIZACION-AVATAR | Avatar skins | 75% | PARCIAL — perfil pendiente |
| FLUJO-EQUIPAMIENTO-ITEMS-COSMETICOS | Cosmetic equipping | 75% | PARCIAL |
| FLUJO-CONSTRUCTOR-EJERCICIOS | Exercise builder | 95% | PARCIAL — M4/M5 configs faltan |

### Anomalias Criticas

1. **FLUJO-GESTION-CONTENIDO (teacher)** — Pagina `ContentManagement` fue ELIMINADA (2026-02-21). Flujo es STALE y deberia marcarse DEPRECATED.
2. **FLUJO-PROGRESO-HIJO (parents)** — Referencia `data_warehouse` schema que NO esta configurado como datasource. Query fallaria en runtime.
3. **FLUJO-WHITE-LABEL-THEMING** — Estado dice "Planificado" pero ruta `/admin/settings/branding` y `BrandingSettingsPage` YA existen. Actualizar a "Parcialmente Implementado".
