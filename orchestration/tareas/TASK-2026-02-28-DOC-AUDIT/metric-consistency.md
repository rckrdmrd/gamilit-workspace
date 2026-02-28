---
titulo: Consistencia de Metricas en Documentacion
tipo: reporte
fecha_creacion: 2026-02-28
generado_por: claude-sonnet-4-6
scope: docs/ (solo archivos .md, excluyendo _archived/)
---

# Consistencia de Metricas en Documentacion

## Resumen

| Categoria | Valor |
|-----------|-------|
| Metricas verificadas | 16 |
| Inconsistencias encontradas | 14 |
| Archivos con valores incorrectos | 18 |
| Archivos archivados con valores obsoletos (esperado) | 5 |

**Nota metodologica:** Se excluyen del analisis los archivos dentro de directorios `_archived/` pues son documentos historicos. Las inconsistencias reportadas son en archivos activos.

---

## Hallazgos por Metrica

### Schemas (correcto: 18)

Estado general: **CORRECTO** — La gran mayoria de referencias activas usa 18.

| Archivo | Linea | Valor encontrado | Estado |
|---------|-------|-----------------|--------|
| `docs/50-guides/deployment/_archived/GUIA-DESPLIEGUE-PRODUCCION-COMPLETA.md` | 136 | 17 schemas | ARCHIVADO (esperado) |
| `docs/10-requirements/epics/EPIC-GAM-F1-GAMIFICATION/specifications/EVOLUCION-SISTEMA-RECOMPENSAS.md` | 103 | "13 schemas modulares" | OBSOLETO (historico) |
| `docs/10-requirements/epics/EPIC-GAM-F2-DB-MIGRATION/tasks/SCRIPTS-INSTALACION.md` | 340 | "9 schemas" | OBSOLETO (historico de migracion) |
| `docs/20-architecture/security/MULTI-TENANT-ISOLATION.md` | 402 | "12 de 18 schemas" | CORRECTO (contexto RLS activo, no total) |

Conclusion: Todos los archivos activos de referencia usan el valor correcto 18.

---

### Tablas (correcto: 173)

Estado general: **CORRECTO** — Todos los archivos activos de referencia usan 173.

| Archivo | Linea | Valor encontrado | Estado |
|---------|-------|-----------------|--------|
| `docs/90-adr/ADR-033-expansion-schemas-8-to-18.md` | 52 | "171 tables" | INCORRECTO |
| `docs/10-requirements/epics/EPIC-GAM-F2-DB-MIGRATION/tasks/ESQUEMA-44-TABLAS.md` | titulo | "44 tablas" | OBSOLETO (historico de fase inicial) |
| `docs/10-requirements/epics/_wave-3-technical/EPIC-GAM-BACKEND/_archived/EPIC-GAM-BACKEND/EPIC.md` | 44 | "169 tablas DDL" | ARCHIVADO (esperado) |

---

### Endpoints (correcto: 914)

Estado general: **CORRECTO** — La mayoria de archivos activos usa 914.

| Archivo | Linea | Valor encontrado | Estado |
|---------|-------|-----------------|--------|
| `docs/10-requirements/epics/_wave-3-technical/EPIC-GAM-BACKEND/EPIC.md` | 45 | 914 | CORRECTO |
| `docs/10-requirements/epics/_wave-3-technical/EPIC-GAM-DOCS/EPIC.md` | 43 | "914 endpoints documentados" | CORRECTO |
| `docs/10-requirements/epics/_wave-3-technical/EPIC-GAM-REQUIREMENTS/EPIC.md` | 41 | "914 endpoints" | CORRECTO |
| `docs/10-requirements/epics/EPIC-GAM-F4-VALIDATION/user-stories/US-VAL-008/TASK-VAL-008-F4-AUDIT-ENDPOINTS/TASK-VAL-008-F4-AUDIT-ENDPOINTS.md` | 23 | "914 endpoints mapeados" | CORRECTO |

---

### Modulos Backend (correcto: 23)

Estado general: **CORRECTO** — Todos los archivos activos usan 23.

| Archivo | Linea | Valor encontrado | Estado |
|---------|-------|-----------------|--------|
| `docs/10-requirements/epics/_wave-3-technical/EPIC-GAM-BACKEND/_archived/EPIC-GAM-BACKEND/EPIC.md` | 25,45,60 | "22 modulos" | ARCHIVADO (esperado) |

---

### Entities (correcto: 156 files / 157 classes)

Estado general: **CORRECTO** — Todos los archivos activos usan el par correcto 156/157.

| Archivo | Linea | Valor encontrado | Estado |
|---------|-------|-----------------|--------|
| `docs/10-requirements/epics/_wave-3-technical/EPIC-GAM-BACKEND/_archived/EPIC-GAM-BACKEND/EPIC.md` | 30,44 | "152 entities / 169 tablas DDL" | ARCHIVADO (esperado) |

---

### Componentes Frontend (correcto: 575)

Estado general: **MAYORMENTE CORRECTO** — Un archivo activo usa valor incorrecto.

| Archivo | Linea | Valor encontrado | Estado |
|---------|-------|-----------------|--------|
| `docs/50-guides/troubleshooting/errores-comunes/frontend/ERR-FE-004-utilidad-duplicada.md` | 11 | "580 componentes" | **INCORRECTO** (correcto: 575) |
| `docs/10-requirements/epics/_wave-3-technical/EPIC-GAM-FRONTEND/_archived/EPIC-GAM-FRONTEND/EPIC.md` | 33,44 | "475 componentes" | ARCHIVADO (esperado) |

---

### Hooks (correcto: 132)

Estado general: **INCONSISTENTE** — Multiples archivos activos usan 127 en lugar de 132.

| Archivo | Linea | Valor encontrado | Estado |
|---------|-------|-----------------|--------|
| `docs/50-guides/backend/GUIA-DESIGN-PATTERNS-NESTJS.md` | 1068 | "127 hooks" | **INCORRECTO** (correcto: 132) |
| `docs/50-guides/backend/GUIA-DESIGN-PATTERNS-NESTJS.md` | 1172 | "127 hooks" | **INCORRECTO** (correcto: 132) |
| `docs/90-adr/ADR-047-state-architecture-zustand-react-query.md` | 61 | "127 hooks" | **INCORRECTO** (correcto: 132) |
| `docs/90-adr/ADR-047-state-architecture-zustand-react-query.md` | 215 | "127 hooks" | **INCORRECTO** (correcto: 132) |
| `docs/10-requirements/epics/_wave-3-technical/EPIC-GAM-FRONTEND/_archived/EPIC-GAM-FRONTEND/EPIC.md` | 44 | "102 hooks" | ARCHIVADO (esperado) |

---

### Paginas (correcto: 70)

Estado general: **INCONSISTENTE** — Multiples archivos activos usan 72 en lugar de 70.

| Archivo | Linea | Valor encontrado | Estado |
|---------|-------|-----------------|--------|
| `docs/00-overview/GLOSARIO.md` | 140 | "72 paginas" | **INCORRECTO** (correcto: 70) |
| `docs/10-requirements/epics/_wave-3-technical/EPIC-GAM-FRONTEND/EPIC.md` | 44 | "72 paginas" | **INCORRECTO** (correcto: 70) |
| `docs/90-adr/ADR-038-estructura-canonica-apps.md` | 66 | "72 paginas (4 portales)" | **INCORRECTO** (correcto: 70) |
| `docs/90-adr/ADR-039-ssot-docs-en-proyecto.md` | 116 | "575 componentes, 72 paginas" | **INCORRECTO** (correcto: 70) |
| `docs/10-requirements/epics/_wave-3-technical/EPIC-GAM-FRONTEND/_archived/EPIC-GAM-FRONTEND/EPIC.md` | 44 | "68 paginas" | ARCHIVADO (esperado) |

Nota adicional: Las paginas por portal tienen inconsistencias internas:
- Portal Teacher: PORTAL-TEACHER-GUIDE.md dice 16 paginas; docs/60-portals/_INDEX.md dice 19 paginas; docs/10-requirements/epics/_wave-3-technical/EPIC-GAM-FRONTEND/EPIC.md dice 19 paginas.
- Portal Admin: PORTAL-ADMIN-GUIDE.md dice 19 paginas; docs/60-portals/admin/_INDEX.md y _MAP.md dicen 18 paginas; docs/60-portals/_INDEX.md dice 18 paginas.

| Archivo | Linea | Valor encontrado | Estado |
|---------|-------|-----------------|--------|
| `docs/60-portals/_INDEX.md` | 20 | "Maestro (19 paginas)" | **INCONSISTENTE** (PORTAL-TEACHER-GUIDE dice 16) |
| `docs/60-portals/admin/PORTAL-ADMIN-GUIDE.md` | 55,1963,2013 | "19 paginas" | **INCONSISTENTE** (admin/_INDEX.md y _MAP.md dicen 18) |
| `docs/10-requirements/epics/_wave-3-technical/EPIC-GAM-FRONTEND/EPIC.md` | 30 | "19 paginas" teacher | **INCONSISTENTE** (PORTAL-TEACHER-GUIDE dice 16) |
| `docs/10-requirements/epics/_wave-3-technical/EPIC-GAM-FRONTEND/EPIC.md` | 31 | "18 paginas" admin | OK (concuerda con algunos docs) |

---

### Routes (correcto: 74)

Estado general: **CORRECTO** — Los archivos que mencionan routes usan 74.

| Archivo | Linea | Valor encontrado | Estado |
|---------|-------|-----------------|--------|
| `docs/20-architecture/STACK-TECNOLOGICO.md` | 83 | "74 routes" | CORRECTO |
| `docs/10-requirements/epics/_wave-3-technical/EPIC-GAM-FRONTEND/EPIC.md` | 44 | "74 routes" | CORRECTO |
| `docs/10-requirements/epics/_wave-3-technical/EPIC-GAM-FRONTEND/_archived/EPIC-GAM-FRONTEND/EPIC.md` | 44 | "72 routes" | ARCHIVADO (esperado) |

---

### Tipos de ejercicio en DDL ENUM (correcto: 33)

Estado general: **INCONSISTENTE** — La mayoria de archivos activos usa 23 (el numero conceptual/semantico original). El GLOSARIO menciona explicitamente que "23" son los "tipos originales". Solo algunos archivos activos mencionan 27, 29 o 33.

| Archivo | Linea | Valor encontrado | Estado |
|---------|-------|-----------------|--------|
| `docs/00-overview/VISION.md` | 21 | "23 tipos de ejercicios" | **INCONSISTENTE** con DDL real (33 valores) |
| `docs/00-overview/MODULOS-EDUCATIVOS.md` | 26 | "23 tipos de ejercicio" | **INCONSISTENTE** con DDL real (33 valores) |
| `docs/00-overview/MODULOS.md` | 174 | "23 tipos de ejercicios" | **INCONSISTENTE** con DDL real (33 valores) |
| `docs/00-overview/TESTING-STRATEGY.md` | 33 | "23 tipos de ejercicio" | **INCONSISTENTE** con DDL real (33 valores) |
| `docs/10-requirements/VISION-ALCANCE.md` | 40,80,154 | "23 tipos" | **INCONSISTENTE** con DDL real (33 valores) |
| `docs/20-architecture/MODELO-DATOS.md` | 82 | "23 tipos de ejercicio" | **INCONSISTENTE** con DDL real (33 valores) |
| `docs/30-ux-ui/flujos/admin/FLUJO-CONSTRUCTOR-EJERCICIOS.md` | 24,157,271 | "29 tipos" (7+5+5+9+3) | **INCONSISTENTE** con DDL real (33 valores) |
| `docs/40-api/API-REFERENCE.md` | 173 | "Listar 23 tipos" | **INCONSISTENTE** con DDL real (33 valores) |
| `docs/50-guides/frontend/GUIA-WCAG-ACCESSIBILITY.md` | 137 | "30 tipos de ejercicios" | **INCONSISTENTE** con DDL real (33 valores) |
| `docs/70-onboarding/ONBOARDING-DESARROLLADORES.md` | 175 | "23 tipos de ejercicio" | **INCONSISTENTE** con DDL real (33 valores) |

Nota: Segun MEMORY.md, el ENUM DDL tiene 33 valores reales. El valor "23" es la convencion semantica/pedagogica original. El valor "27" aparece en la especificacion ET-EDU-001 y en el COMMENT del DDL como convencion. El valor "29" (7+5+5+9+3) aparece en ExerciseTypeSelector del admin. El valor "30" aparece en el registry de mecanicas frontend. Esta es la metrica con mayor dispersion de valores documentados — requiere definicion de convencion unica.

---

### DTOs (correcto: 401)

Estado general: **INCONSISTENTE** — Dos archivos activos usan 399 en lugar de 401.

| Archivo | Linea | Valor encontrado | Estado |
|---------|-------|-----------------|--------|
| `docs/40-standards/ESTANDAR-SEGURIDAD-API.md` | 253 | "399 DTOs en gamilit" | **INCORRECTO** (correcto: 401) |
| `docs/40-standards/ESTANDAR-SEGURIDAD-API.md` | 837 | "main.ts + 399 DTOs" | **INCORRECTO** (correcto: 401) |

---

### Services (correcto: 172)

Estado general: **CORRECTO** — Todos los archivos activos usan 172.

| Archivo | Linea | Valor encontrado | Estado |
|---------|-------|-----------------|--------|
| `docs/10-requirements/epics/_wave-3-technical/EPIC-GAM-BACKEND/EPIC.md` | 45 | "172 services" | CORRECTO |
| `docs/40-standards/ESTANDAR-TESTING-ARCHITECTURE.md` | 43 | "172 services" | CORRECTO |
| `docs/10-requirements/epics/_wave-3-technical/EPIC-GAM-BACKEND/_archived/EPIC-GAM-BACKEND/EPIC.md` | 45 | "170 services" | ARCHIVADO (esperado) |

---

### Controllers (correcto: 108)

Estado general: **CORRECTO** — Todos los archivos activos usan 108.

| Archivo | Linea | Valor encontrado | Estado |
|---------|-------|-----------------|--------|
| `docs/10-requirements/epics/_wave-3-technical/EPIC-GAM-BACKEND/EPIC.md` | 45 | "108 controllers" | CORRECTO |
| `docs/40-standards/ESTANDAR-TESTING-ARCHITECTURE.md` | 43 | "108 controllers" | CORRECTO |
| `docs/10-requirements/epics/_wave-3-technical/EPIC-GAM-BACKEND/_archived/EPIC-GAM-BACKEND/EPIC.md` | 45 | "107 controllers" | ARCHIVADO (esperado) |

---

### Tests (correcto: 2324 total / 2296 passed / 28 skipped)

Estado general: **CORRECTO** — Todos los archivos activos usan 2324/2296/28.

| Archivo | Linea | Valor encontrado | Estado |
|---------|-------|-----------------|--------|
| `docs/00-overview/DEVOPS.md` | 135 | "2324 tests: 2296 passed + 28 skipped" | CORRECTO |
| `docs/70-onboarding/ONBOARDING-DESARROLLADORES.md` | 88,229,279 | "2324 tests (2296 passed + 28 skipped)" | CORRECTO |
| `docs/70-onboarding/ONBOARDING-QA.md` | 13,104,141,192,222 | "2324 tests" | CORRECTO |

---

### ADRs (correcto en disco: 47 archivos ADR-XXX.md)

Estado general: **INCONSISTENTE** — El indice dice 47 pero el conteo real en disco es 47 archivos ADR-*.md (ADR-006, ADR-024, ADR-025 no existen — numeros libres). CLAUDE.md y MEMORY.md dicen "47 ADRs on disk" pero en realidad hay 47 archivos ADR-*.md en disco, concordando con el indice.

| Archivo | Linea | Valor encontrado | Estado |
|---------|-------|-----------------|--------|
| `docs/90-adr/_INDEX.md` | 8,94 | "47 ADRs" | CORRECTO (47 archivos ADR-*.md en disco) |
| `docs/90-adr/_MAP.md` | 162 | "47 ADRs documentados" | CORRECTO |

---

### API Services (correcto: 65)

Estado general: **INCONSISTENTE** — Tres archivos activos usan valores distintos.

| Archivo | Linea | Valor encontrado | Estado |
|---------|-------|-----------------|--------|
| `docs/20-architecture/STACK-TECNOLOGICO.md` | 86 | "67 API services" | **INCONSISTENTE** (SSOT dice 65) |
| `docs/60-portals/student/specs/README.md` | 24 | "66 API services" | **INCONSISTENTE** (SSOT dice 65) |
| `docs/50-guides/backend/GUIA-DESIGN-PATTERNS-NESTJS.md` | 1174 | "67 API files" | **INCONSISTENTE** (SSOT dice 65) |

---

### Zustand Stores (correcto: 13)

Estado general: **CORRECTO** — Todos los archivos activos usan 13.

| Archivo | Linea | Valor encontrado | Estado |
|---------|-------|-----------------|--------|
| `docs/20-architecture/STACK-TECNOLOGICO.md` | 21,85 | "13 stores" | CORRECTO |
| `docs/10-requirements/epics/_wave-3-technical/EPIC-GAM-FRONTEND/EPIC.md` | 33,44 | "13 stores" | CORRECTO |
| `docs/10-requirements/epics/_wave-3-technical/EPIC-GAM-FRONTEND/_archived/EPIC-GAM-FRONTEND/EPIC.md` | 44 | "14 stores" | ARCHIVADO (esperado) |

---

## Resumen de Inconsistencias Activas (Prioridad de Correccion)

| Prioridad | Metrica | Correcto | Incorrecto | Archivos a corregir |
|-----------|---------|----------|-----------|---------------------|
| ALTA | Hooks | 132 | 127 (4 menciones) | GUIA-DESIGN-PATTERNS-NESTJS.md, ADR-047 |
| ALTA | Paginas (total) | 70 | 72 (4 menciones) | GLOSARIO.md, EPIC-GAM-FRONTEND/EPIC.md, ADR-038, ADR-039 |
| ALTA | DTOs | 401 | 399 (2 menciones) | ESTANDAR-SEGURIDAD-API.md |
| ALTA | Tablas (ADR-033) | 173 | 171 (1 mencion) | ADR-033-expansion-schemas-8-to-18.md |
| MEDIA | Componentes | 575 | 580 (1 mencion) | ERR-FE-004-utilidad-duplicada.md |
| MEDIA | API Services | 65 | 66/67 (3 menciones) | STACK-TECNOLOGICO.md, GUIA-DESIGN-PATTERNS-NESTJS.md, student/specs/README.md |
| MEDIA | Paginas Teacher | 16 | 19 (3 menciones) | docs/60-portals/_INDEX.md, EPIC-GAM-FRONTEND/EPIC.md, TASK-VAL-004 |
| MEDIA | Paginas Admin | 18 o 19 | Conflicto interno | PORTAL-ADMIN-GUIDE.md (dice 19), admin/_INDEX.md (dice 18) |
| BAJA | Tipos ejercicio | 33 (DDL) | 23/27/29/30 (multiples) | Dispersion generalizada — requiere decision de convencion |

---

## Metricas Confirmadas como Correctas

Las siguientes metricas son consistentes en todos los archivos activos:

- Schemas: **18** (16 activos + 2 placeholder) — CORRECTO en todos los docs activos
- Tablas: **173** — CORRECTO en todos los docs activos (salvo ADR-033 que dice 171)
- Endpoints: **914** — CORRECTO en todos los docs activos
- Modulos backend: **23** — CORRECTO en todos los docs activos
- Entities: **156 files / 157 classes** — CORRECTO en todos los docs activos
- Services: **172** — CORRECTO en todos los docs activos
- Controllers: **108** — CORRECTO en todos los docs activos
- Tests: **2324 (2296 + 28)** — CORRECTO en todos los docs activos
- Zustand Stores: **13** — CORRECTO en todos los docs activos
- Routes: **74** — CORRECTO en los pocos archivos que lo mencionan
- ADRs: **47** — CORRECTO (47 archivos ADR-*.md en disco, concordante con _INDEX.md)
