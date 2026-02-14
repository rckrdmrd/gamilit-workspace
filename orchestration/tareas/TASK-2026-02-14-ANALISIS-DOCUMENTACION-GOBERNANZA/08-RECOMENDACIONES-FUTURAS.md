# 08 - RECOMENDACIONES FUTURAS

**Tarea:** TASK-2026-02-14-ANALISIS-DOCUMENTACION-GOBERNANZA
**Fecha:** 2026-02-14

---

## Prioridad 1 — Proximo Sprint

### 1. Actualizar DATABASE_INVENTORY.yml
Las metricas maestras y CLAUDE.md fueron corregidas, pero DATABASE_INVENTORY.yml aun tiene:
- rls_policies: 263 (real: 207)
- triggers: 126 (real: 67)
- tablas: 171 (real: 169)
- communication tables: 4 (real: 3)
- admin_dashboard tables: 4 (real: 3)
- tablas_sin_entity: 22 (real: 16)
- cobertura: "87%" (real: 90.5%)

### 2. Cleanup de `orchestration/referencias/ALIASES.yml`
Archivo legacy del workspace era con ~25 phantom references. Opciones:
- **A) Eliminar** — agentes usan `orchestration/agents/ALIASES.yml` y `orchestration/CONTEXT-MAP.yml`
- **B) Reescribir** para standalone
- **Recomendacion:** Opcion A — es redundante con agents/ALIASES.yml

### 3. Actualizar `90-adr/_MAP.md`
Tiene 21 ADRs listados vs 40 reales. Actualizar con los 19 ADRs faltantes.

### 4. Fix Refs ADR-0019 en EPICs
12 archivos EPIC referencian ADR-0019 (no existe). Corregir a ADR-039.

---

## Prioridad 2 — Siguiente Iteracion

### 5. Batch-Fix 90+ Legacy Path References
Tres paths legacy en ~90 archivos de docs/:
- `docs/02-especificaciones-tecnicas/` → path correcto por determinar
- `docs/95-guias-desarrollo/` → `docs/50-guides/`
- `docs/90-transversal/` → `docs/80-references/`
**Recomendacion:** Script automatizado con grep/sed

### 6. Cross-References Estandares ↔ Principios
53% de estandares aislados. Agregar links bidireccionales:
- PRINCIPIO-NORMALIZACION-BD ↔ ESTANDAR-DATABASE-PROFESIONAL
- PRINCIPIO-ECONOMIA-TOKENS ↔ ESTANDAR-MEMORIA-TOKENS
- PRINCIPIO-SOLID ↔ ESTANDAR-BACKEND-PROFESIONAL
- PRINCIPIO-CLEAN-ARCHITECTURE ↔ ESTANDAR-BACKEND-PROFESIONAL
- PRINCIPIO-DRY ↔ ESTANDAR-CODIGO

### 7. Fix Perfiles Agent Paths
3 perfiles referencian `docs/40-estandares/` → corregir a `docs/40-standards/`

### 8. Actualizar BACKEND_INVENTORY.yml
- interceptors: 5 → 6 (tracing.interceptor.ts)
- health services: 1 → 2 (metrics.service.ts)
- spec files: 57 → 59

### 9. Eliminar/Marcar MODE-PROPAGATION.md
Referenciado en modos/_INDEX.md y triggers/_INDEX.md pero no existe. Standalone no usa propagacion.

---

## Prioridad 3 — Mejoras Continuas

### 10. Actualizar DEPENDENCY_GRAPH.yml
Stale desde 2025-12-05, dice 75% completado vs 98% real.

### 11. Normalizar ADR Status Labels
Inconsistencia: "Accepted", "Aceptada", "APROBADO", "Implemented" — estandarizar a un vocabulario.

### 12. YAML Frontmatter en 4 Estandares
ESTANDAR-GIT, ESTANDAR-NOMENCLATURA, ESTANDAR-DOCUMENTACION, ESTANDAR-CODIGO sin frontmatter.

### 13. Declarar Stack Versions en backend-profesional/
Agregar "NestJS 11, TypeORM 0.3.x" en _INDEX.md de backend-profesional/.

### 14. Catalogar Profiles Faltantes en _MAP.md
PERFIL-DEPLOY-SERVER y PERFIL-DOCUMENTATION-MAINTAINER existen pero no estan en _MAP.md.

### 15. Reconteo Frontend .tsx
Total .tsx: inventario dice 517, grep da ~497. Diferencia puede ser archivos borrados.
Routes: inventario 70, App.tsx tiene 72. Necesita actualizacion.

---

## Proceso Sugerido para Mantener Coherencia

1. **Post-cambio de codigo:** TRIGGER-SSOT-SYNC debe actualizar inventarios individuales
2. **Post-sprint:** Reconciliar MASTER_INVENTORY con individuales
3. **Mensual:** Verificar metricas CLAUDE.md = MASTER_INVENTORY
4. **Trimestral:** Auditoria integral como esta tarea

---

*Recomendaciones generadas 2026-02-14*
