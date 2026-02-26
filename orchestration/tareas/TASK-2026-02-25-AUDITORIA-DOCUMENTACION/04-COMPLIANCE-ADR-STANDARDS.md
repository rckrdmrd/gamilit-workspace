# 04 - COMPLIANCE ADR Y ESTANDARES

**Fecha:** 2026-02-25 | **Fase:** 4 | **Subagentes:** O-ADR-01, S-STD-01

---

## ADR Compliance

### Resumen Global (47 ADRs)

| Categoria | Conteo |
|-----------|--------|
| Fully Compliant | 42 |
| Partially Compliant | 3 (ADR-003, ADR-004, ADR-048) |
| Non-Compliant | 0 |
| Not Applicable (gaps) | 3 (006, 024, 025) |

---

## ADR-003: RLS Multi-tenancy — PARCIAL (CRITICO)

**Decision:** PostgreSQL RLS + `SET LOCAL app.current_tenant_id` por request.

**Hallazgo CRITICO:** Las 251+ politicas RLS en DDL son **codigo muerto en runtime**.

### Evidencia:
1. `init-database.sh` lineas 1484-1522: `NOBYPASSRLS` esta **COMENTADO** desde 2026-02-17
2. `rls.interceptor.ts` lineas 98-99: `SET LOCAL` **NO IMPLEMENTADO** (comentario dice "en el futuro")
3. `99-post-ddl-permissions.sql` linea 119: `BYPASSRLS` otorgado a `gamilit_user`, nunca revocado

**Impacto:** `gamilit_user` bypasea TODAS las politicas RLS en TODOS los ambientes, incluyendo produccion. El mecanismo primario de aislamiento de datos multi-tenant NO esta activo.

**Archivos relevantes:**
- `apps/database/scripts/init-database.sh`
- `apps/backend/src/shared/interceptors/rls.interceptor.ts`
- `apps/database/ddl/99-post-ddl-permissions.sql`

---

## ADR-004: Exercise Engine Modular — PARCIAL

**Decision:** Strategy + Factory pattern con `ExerciseEvaluatorFactory` y evaluadores per-type.

**Frontend:** COMPLIANT — Registry pattern implementado con 30 mecanicas registradas.
**Backend:** NO IMPLEMENTADO — No existe `ExerciseEvaluatorFactory` ni evaluadores per-type. Backend usa `exercises.service.ts` monolitico (el patron que el ADR rechazo).

**Recomendacion:** Implementar backend factory O actualizar ADR para reflejar diseno actual.

---

## ADR-013: React Query — COMPLIANT

- `@tanstack/react-query` v5.90.7 instalado
- `QueryClientProvider` en main.tsx
- 62 archivos usan useQuery/useMutation
- 13 Zustand stores para estado local solamente

---

## ADR-044: Test Coverage Strategy — COMPLIANT

- jest.config.js: 50% threshold (4 metricas)
- CLAUDE.md: "Minimo 50% enforced (objetivo 80% gradual)"
- **Discrepancia RESUELTA** — ADR-044 fue creado para resolver esto

---

## ADR-047, 048, 049 — IMPLEMENTADOS pero NO INDEXADOS

| ADR | Decision | Estado Implementacion |
|-----|----------|----------------------|
| 047 | React Query + Zustand separation | COMPLIANT (13 stores exactos) |
| 048 | Component sharing 3-tier | PARTIAL (migracion incremental por diseno) |
| 049 | ConfirmDialog consolidation | SUSTANCIALMENTE COMPLIANT (2 window.confirm restantes de 20+) |

**Accion:** Agregar a `_INDEX.md` y actualizar conteo de 43 a 47.

---

## Standards Spot-Check

### Frontend Component Standard (5 archivos)
- **Compliance:** 4/5 fully compliant
- **Violaciones menores:**
  - `AssignmentFilters.tsx`: Nombre funcion `AssignmentFiltersComponent` no coincide con filename
  - `EngagementMetricsChart.tsx`: `key={index}` en lista

### Database Standard (3 archivos)
- **Compliance:** 3/3 compliant
- **Nota menor:** `content_templates.sql` — 4 columnas sin `COMMENT ON COLUMN`

### Import Order Standard (5 archivos backend)
- **Compliance:** 2/5 fully compliant
- **Violacion comun:** 3 archivos sin lineas en blanco entre grupos de imports
  - `security.service.ts`, `engagement-metrics.service.ts`, `guilds.service.ts`

### No-any (MQ-007) — REGRESION DETECTADA

- **MEMORY.md dice:** 0 eslint warnings (911 -> 0)
- **Realidad:** 42 `any` sin proteccion encontrados en frontend
  - 37 en `shared/utils/exerciseAdapter.ts` (archivo sin eslint-disable)
  - 2 en Chart.js callbacks (unavoidable)
  - 2 en exercise-mechanic.types.ts
  - 1 falso positivo (variable `anyEmail`)
- 13 `any` sin proteccion en backend
- **Veredicto:** REGRESION — `exerciseAdapter.ts` no fue cubierto en MQ-007

### React.FC (VS-05) — MANTENIDO

- **Production files con React.FC:** 0
- **Residuales (aceptable):** 3 en examples/ y stories/
- **Veredicto:** MANTENIDO exitosamente

---

## Score de Compliance

| Estandar | Checked | Compliant | Parcial | Non-Compliant |
|----------|---------|-----------|---------|---------------|
| ADRs (47) | 47 | 42 | 3 | 0 |
| Frontend Component | 5 | 4 | 1 | 0 |
| Database DDL | 3 | 3 | 0 | 0 |
| Import Order | 5 | 2 | 3 | 0 |
| no-explicit-any | global | - | - | REGRESION |
| React.FC removal | global | MANTENIDO | - | 0 |
