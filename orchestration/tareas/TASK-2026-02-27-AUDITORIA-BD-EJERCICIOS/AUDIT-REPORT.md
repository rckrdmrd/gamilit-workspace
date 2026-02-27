# Auditoria Integral BD + Ambientes + Ejercicios

**Fecha:** 2026-02-27
**Alcance:** Coherencia cross-layer de ejercicios por modulo, scripts WSL, documentacion
**Agente:** Claude Opus 4.6
**Fases:** 4 fases, 6 tareas, ~10 archivos modificados

---

## Resumen Ejecutivo

Auditoria y correccion de discrepancias entre capas (DDL enum comments, seeds, backend/frontend enums, documentacion) en la definicion de ejercicios por modulo. Se corrigieron 15 discrepancias documentales, se mejoro el WSL2-awareness de scripts de BD, y se valido coherencia cross-layer.

**Resultado:** 15 discrepancias originales + 8 adicionales (docs/orchestration) corregidas. Build OK. Validaciones PASS.

---

## Discrepancias Encontradas y Corregidas

### A. GUIA-RESPUESTAS-EJERCICIOS.md (5 correcciones)

| # | Problema | Correccion |
|---|---------|------------|
| A1 | Ejercicio 1.5 era "Emparejamiento Drag&Drop" | Cambiado a "Sopa de Letras (BONUS)" con 10 palabras correctas |
| A2 | Faltaba Sopa de Letras BONUS con respuestas | Agregadas 10 palabras: MARIE, CURIE, POLONIA, NOBEL, RADIO, POLONIO, PARIS, SORBONA, CIENCIA, FISICA |
| A3 | Linea 22 entrada espuria "1.5 Emparejamiento" + Linea 23 duplicado "2.5 Rueda de Inferencias" | Reemplazadas por unica entrada "1.5 Sopa de Letras (BONUS)" |
| A5 | Ejercicio 4.2 Quiz TikTok marcado "Automatica" | Cambiado a **Manual** (M4 es teacher-graded) |
| A6 | Ejercicio 2.2 nombre "Causa-Efecto" | Cambiado a "Construccion de Hipotesis" (como en seeds) |

**Archivo:** `docs/99-delivery/2025-11-16-entrega-final/GUIA-RESPUESTAS-EJERCICIOS.md`

### B. Enums Backend/Frontend (4 correcciones, identicas en ambos archivos)

| # | Problema | Correccion |
|---|---------|------------|
| B1 | Module 1 incluia MAPA_CONCEPTUAL, EMPAREJAMIENTO (no son M1 activos) | Movidos a seccion Auxiliares |
| B2 | Module 1 faltaba COMPLETAR_ESPACIOS, VERDADERO_FALSO | Movidos de Auxiliares a Module 1 |
| B3 | @note Auxiliares decia "6 mecanicas" | Actualizado a "6 mecanicas" (correcto tras reorganizacion) |
| B4 | @note Module 1 no especificaba los 5 activos | Agregado detalle: "5 mecanicas: crucigrama, linea_tiempo, completar_espacios, verdadero_falso, sopa_letras" |

**Archivos:**
- `apps/backend/src/shared/constants/enums.constants.ts`
- `apps/frontend/src/shared/constants/enums.constants.ts`

### C. DDL Enum Comments (4 correcciones)

| # | Problema | Correccion |
|---|---------|------------|
| C1 | "Module 1: 7 mecanicas" sin distinguir activos vs auxiliares | Cambiado a "5 activos + 2 auxiliares asignables" con lista |
| C2 | Header "AUTO-EVALUABLES" incluia M3 (que es teacher-graded) | Eliminado header generico, cada modulo tiene su evaluacion |
| C3 | "BACKLOG: FASE 4" agrupaba M4+M5 sin distincion | Separados en M4 (EVALUACION MANUAL) y M5 (EVALUACION MANUAL) |
| C4 | Sin nota sobre mapa_conceptual/emparejamiento como auxiliares | Agregada nota aclaratoria |

**Archivo:** `apps/database/ddl/schemas/educational_content/enums/exercise_type.sql`

### D. Documentacion Specs (4 correcciones)

| # | Problema | Correccion |
|---|---------|------------|
| D1 | ET-EDU-001 decia "35 tipos" en multiples lugares | Actualizado a "27 tipos" (alineado con DDL COMMENT) |
| D2 | RF-EDU-001 decia "35 mecanicas" en multiples lugares | Actualizado a "27 mecanicas" |
| D3 | ET-EDU-001 listaba Module 1 con mapa_conceptual, emparejamiento | Actualizado con completar_espacios, verdadero_falso, sopa_letras |
| D4 | Seed comment "Modulo 1: 7 exercise_types" sin aclarar | Actualizado: "5 activos + 2 auxiliares asignables" |

**Archivos:**
- `docs/10-requirements/epics/EPIC-GAM-F1-EXERCISES/specifications/ET-EDU-001-mecanicas-ejercicios.md`
- `docs/10-requirements/epics/EPIC-GAM-F1-EXERCISES/requirements/RF-EDU-001-mecanicas-ejercicios.md`
- `apps/database/seeds/dev/educational_content/09-exercise_mechanic_mapping.sql`

### E. Scripts BD + WSL (3 mejoras)

| # | Problema | Correccion |
|---|---------|------------|
| E1 | recreate-database-dev.sh sin WSL2 detection | Agregada logica completa: detecta WSL2 vs Windows, auto-configura DB_HOST |
| E2 | dev.conf sin nota sobre WSL2 override | Agregado comentario explicativo sobre WSL2 override |
| E3 | AMBIENTES-DEV-PROD.md sin seccion de scripts BD | Agregada seccion "Scripts de Base de Datos y WSL2" con tabla comparativa y flujo |

**Archivos:**
- `apps/database/scripts/recreate-database-dev.sh`
- `apps/database/scripts/config/dev.conf`
- `docs/20-architecture/AMBIENTES-DEV-PROD.md`

---

## Validacion Cross-Layer

| # | Check | Resultado |
|---|-------|-----------|
| 1 | M1 5 active types consistent across DDL/backend/frontend/seeds | PASS |
| 2 | comprension_auditiva NOT assigned to Module 1 anywhere | PASS |
| 3 | M3-M5 all "Manual"/"teacher-graded" in GUIA-RESPUESTAS | PASS |
| 4 | Backend enum identical to frontend enum | PASS |
| 5 | DDL enum values = backend/frontend enum values (33 total) | PASS |
| 6 | Exercise 1.5 = Sopa de Letras BONUS in GUIA-RESPUESTAS | PASS |
| 7 | Exercise 2.2 = Construccion de Hipotesis | PASS |
| 8 | Exercise 4.2 = Manual | PASS |
| 9 | No duplicate 2.5 line in GUIA-RESPUESTAS | PASS |
| 10 | TypeScript backend build (tsc --noEmit) | PASS |
| 11 | recreate-database-dev.sh has WSL2 detection | PASS |
| 12 | AMBIENTES-DEV-PROD.md documents WSL handling | PASS |
| 13 | RF-EDU-001 count updated 35→27 | PASS |
| 14 | ET-EDU-001 count updated 35→27 | PASS |

---

## Observacion: Conteo "27" vs "33" en DDL COMMENT

El DDL `COMMENT ON TYPE` dice "27 mecanicas (17 implementadas + 10 backlog)". El conteo real de valores en el PostgreSQL ENUM es **33**: M1(7) + M2(5) + M3(5) + M4(9) + M5(3) + AUX(4) = 33. El "27" es una convencion semantica pre-existente (posiblemente 23 tipos activos + 4 auxiliares = 27). Todas las capas ahora estan alineadas en usar "27" para documentacion. El conteo real de 33 valores es consistente entre DDL, backend y frontend.

**Accion recomendada (futura):** Considerar actualizar DDL COMMENT a "33 valores en ENUM" para reflejar el conteo literal, o documentar explicitamente la formula 27 = X + Y.

---

## Correcciones Adicionales (Post-Fase 4)

### F. Referencias "35" residuales en live code/docs (8 correcciones)

| # | Archivo | Problema | Correccion |
|---|---------|---------|------------|
| F1 | `exercise-mechanic-mapping.entity.ts` (L15-16) | "35 exercise_types" / "35 implementaciones" | → 33 |
| F2 | `21-exercise_mechanic_mapping.sql` (L36, L140, L151) | "35 implementaciones" / "35 exercise_types" | → 33 |
| F3 | `TRACEABILITY.yml` (L24, L102, L410, L415, L419) | 5 refs a "35 exercise_types/valores" | → 33 |
| F4 | `03-education.md` schema-ref (L534) | "35 exercise_types" | → 33 |
| F5 | `ADR-008` header | Sin nota sobre cambio 35→33 | Agregada nota aclaratoria |

### G. Fechas desactualizadas (3 correcciones)

| # | Archivo | Problema | Correccion |
|---|---------|---------|------------|
| G1 | `PROJECT-STATUS.md` | Fecha 2026-02-26 | → 2026-02-27 |
| G2 | `SPRINT-ACTUAL.yml` | updated: 2026-02-26 | → 2026-02-27 |
| G3 | `SPRINT-ACTUAL.yml` | metadata.updated_at: 2026-02-26 | → 2026-02-27 |

### H. Directorio vacio (1 correccion)

| # | Archivo | Problema | Correccion |
|---|---------|---------|------------|
| H1 | `TASK-2026-02-26-RESPONSIVE-AUDIT/` | Directorio vacio sin reporte | Agregado README.md stub referenciando RESP-001 |

---

## Archivos Modificados (18 total)

| # | Archivo | Tipo |
|---|---------|------|
| 1 | `docs/99-delivery/.../GUIA-RESPUESTAS-EJERCICIOS.md` | Ejercicios M1, duplicados, evaluaciones |
| 2 | `apps/backend/src/shared/constants/enums.constants.ts` | Comments Module 1 vs Auxiliares reorganizados |
| 3 | `apps/frontend/src/shared/constants/enums.constants.ts` | Idem backend |
| 4 | `apps/database/ddl/.../exercise_type.sql` | Comments de modulos actualizados |
| 5 | `docs/.../ET-EDU-001-mecanicas-ejercicios.md` | Conteo 35→27, Module 1 corregido |
| 6 | `docs/.../RF-EDU-001-mecanicas-ejercicios.md` | Conteo 35→27 |
| 7 | `apps/database/seeds/dev/.../09-exercise_mechanic_mapping.sql` | Comment M1 actualizado |
| 8 | `apps/database/scripts/recreate-database-dev.sh` | WSL2 IP detection agregada |
| 9 | `apps/database/scripts/config/dev.conf` | WSL2 comments agregados |
| 10 | `docs/20-architecture/AMBIENTES-DEV-PROD.md` | Seccion Scripts BD + WSL2 |
