# HALLAZGOS-DOCUMENTACION - Catalogo Completo

**Task:** TASK-2026-02-06-ANALISIS-INTEGRAL-DOCUMENTACION
**Total:** 127 hallazgos | **Fecha:** 2026-02-06

---

## Indice por Severidad

- **P0 CRITICO:** 24 hallazgos (requieren accion inmediata)
- **P1 ALTO:** 35 hallazgos (corto plazo, 1-2 semanas)
- **P2 MEDIO:** 38 hallazgos (mediano plazo, 2-3 semanas)
- **P3 BAJO:** 30 hallazgos (backlog, 3-4 semanas)

---

## P0 - CRITICOS (24)

### Requerimientos (6)

| ID | Hallazgo | Ubicacion | Accion |
|----|----------|-----------|--------|
| DOC-001 | 81 RF files faltantes (72% gap total) | docs/50-requerimientos/ | CREAR archivos RF faltantes |
| DOC-002 | ETC-001 tiene 0 docs pese a status COMPLETED | docs/50-requerimientos/02-robustecimiento/ETC-001/ | CREAR o RECLASIFICAR como tecnico |
| DOC-003 | COMPLETENESS-TRACKER declara 100%, realidad 82% | docs/_SSOT/COMPLETENESS-TRACKER.yml | ACTUALIZAR con status real |
| DOC-018 | EXT-001: 23 RF faltantes (96% gap) | docs/50-requerimientos/03-extensiones/EXT-001/ | CREAR RF-TCH-001 a RF-TCH-024 |
| DOC-019 | EXT-002: 18 RF faltantes (95% gap) | docs/50-requerimientos/03-extensiones/EXT-002/ | CREAR RF-AE-001 a RF-AE-019 |
| DOC-035 | Nomenclatura US-PM-* vs RF-TCH-* sin doc | EXT-001 | DOCUMENTAR mapeo en README |

### Metricas (4)

| ID | Hallazgo | Fuentes Afectadas | Accion |
|----|----------|--------------------|--------|
| DOC-004 | Tablas DDL: 137-171 rango (20% error) | PROJECT-PROFILE, PROYECTO, mirrors | SINCRONIZAR a 171 |
| DOC-005 | Entities: 123-158 rango (18% error) | PROJECT-PROFILE, PROYECTO | SINCRONIZAR a 141 |
| DOC-006 | Coherencia: 82.5%-100% (17.5pp error) | PROJECT-PROFILE, PROYECTO | CORREGIR a 82.5% |
| DOC-007 | Functions: 15-128 rango (88% error) | PROYECTO, PROJECT-PROFILE | SINCRONIZAR a 128 |

### SSOT y Trazabilidad (3)

| ID | Hallazgo | Ubicacion | Accion |
|----|----------|-----------|--------|
| DOC-008 | 3 TRACEABILITY-MASTER duplicados | docs/_SSOT/, docs/10-arquitectura/, orchestration/ | ELIMINAR duplicados, mantener _SSOT |
| DOC-009 | ENTITIES-CATALOG: 18/141 entities (87% gap) | docs/_SSOT/ENTITIES-CATALOG.md | REGENERAR con 141 entities |
| DOC-010 | CODE-MAPPINGS: 139/171 tablas | docs/_SSOT/CODE-MAPPINGS.yml | ACTUALIZAR +32 tablas |

### Documentacion Obsoleta (5)

| ID | Hallazgo | Ubicacion | Accion |
|----|----------|-----------|--------|
| DOC-011 | PROJECT-STATUS MVP 75% vs PROXIMA 98% | orchestration/ | RECONCILIAR a 98% |
| DOC-012 | "boosts" declarado dead pero DDL/entity EXISTEN | Codigo + TASK-2026-02-05 | VALIDAR en codigo real |
| DOC-013 | "social_interactions" dead pero flujo funcional | Codigo + TASK-2026-02-05 | VALIDAR en codigo real |
| DOC-022 | 15+ docs temporales no archivados | docs/80-referencias/transversal/ | ARCHIVAR en _archive/ |
| DOC-023 | Legacy guidelines (7 archivos) no archivados | orchestration/_internal/legacy_guidelines/ | MOVER a _archive/ |

### Arquitectura (4)

| ID | Hallazgo | Ubicacion | Accion |
|----|----------|-----------|--------|
| DOC-014 | ARCHITECTURE.md: "8 schemas, 40+ tables" | docs/80-referencias/transversal/arquitectura/ | ACTUALIZAR a 18/171 |
| DOC-015 | 5 ADRs con gaps numeracion (004-006, 024-025) | docs/90-adr/ | CREAR stubs o documentar skip |
| DOC-016 | Expansion 8->18 schemas sin ADR | docs/90-adr/ | CREAR ADR-033 |
| DOC-024 | API.md solo ~5% cobertura (solo auth) | docs/80-referencias/transversal/api/ | EXPANDIR o referir Swagger |

### Logica de Negocio (2)

| ID | Hallazgo | Ubicacion | Accion |
|----|----------|-----------|--------|
| DOC-017 | 6 fuentes metricas desactualizadas simultaneamente | Multiples | SINCRONIZACION global |
| DOC-021 | Design doc no cubre achievements/missions/leaderboards | docs/00-vision-general/ | AGREGAR secciones 6-10 |

---

## P1 - ALTOS (35)

### Requerimientos RF Faltantes por EPIC (7)

| ID | EPIC | RF Faltantes | Accion |
|----|------|-------------|--------|
| DOC-025 | EAI-001 (Fundamentos) | 4 RF | CREAR RF-AUTH-004 a RF-AUTH-008 |
| DOC-026 | EAI-002 (Actividades) | 5 RF | CREAR RF-EDU-004 a RF-EDU-008 |
| DOC-027 | EAI-003 (Gamificacion) | 4 RF | CREAR RF-GAM-005 a RF-GAM-008 |
| DOC-028 | EAI-005 (Admin Base) | 3 RF | CREAR RF-ADM-005 a RF-ADM-007 |
| DOC-029 | EAI-007 (M4-M5) | 3 RF | CREAR RF-M45-004 a RF-M45-006 |
| DOC-030 | EAI-003-EXT (Gam Social) | 4 RF | CREAR RF-SOC-003 a RF-SOC-006 |
| DOC-031 | ETC-001 (Consolidacion) | 5 US + 5 RF | CREAR o RECLASIFICAR |

### Metricas y Fuentes (8)

| ID | Hallazgo | Accion |
|----|----------|--------|
| DOC-032 | PROJECT-PROFILE.yml 13 dias atras | ACTUALIZAR metricas |
| DOC-033 | PROJECT-STATUS.md metricas pre-2026-02-05 | ACTUALIZAR |
| DOC-034 | FRONTEND_INVENTORY.yml 12 dias atras | RECONCILIAR pages/components |
| DOC-036 | shared/mirrors/gamilit/ 19 dias atras | SINCRONIZAR mirror |
| DOC-037 | docs/PROYECTO-GAMILIT.md sin fecha | ACTUALIZAR metricas |
| DOC-038 | CHANGELOG.md falta entrada 2026-02-05 | AGREGAR entry v2.7.0 |
| DOC-039 | Endpoints: 612-850 rango | SINCRONIZAR a 850 |
| DOC-040 | Components: 398-464 rango | RECONCILIAR a 458 |

### Trazabilidad (5)

| ID | Hallazgo | Accion |
|----|----------|--------|
| DOC-041 | TRACEABILITY_MATRIX.yml path incorrecto (docs/90-transversal/) | CORREGIR path |
| DOC-042 | docs/10-arq/.../TRACEABILITY-MASTER.yml v1.0.0 obsoleto | ELIMINAR o redirect |
| DOC-043 | 20 infrastructure tables sin EPIC mapping | DOCUMENTAR como aceptable |
| DOC-044 | 5 mismatched docs vs code (frontend) | SINCRONIZAR |
| DOC-045 | orchestration/TRACEABILITY.yml v1.1.0 desincronizado | ACTUALIZAR a v3.1.0 o deprecar |

### Documentacion Obsoleta (7)

| ID | Hallazgo | Accion |
|----|----------|--------|
| DOC-046 | CORR-009-* (3 docs, 2026-01) | ARCHIVAR en _archive/2026-01/ |
| DOC-047 | CORR-010-* (3 docs, 2026-01) | ARCHIVAR |
| DOC-048 | CORR-011-* (3 docs, 2026-01) | ARCHIVAR |
| DOC-049 | ANALISIS-EVALUACIONES-M3-M4-M5-2026-01-07.md | ARCHIVAR |
| DOC-050 | REPORTE-VALIDACION-2025-12-26.md | VALIDAR si hallazgos resueltos, luego ARCHIVAR |
| DOC-051 | ACTUALIZACION-FRONTEND-INVENTORY-2025-11-26.md | PURGE (ya integrado) |
| DOC-052 | QUICK-REFERENCE-ADMIN-COMPONENTS-2025-11-26.md | INTEGRAR o PURGE |

### Arquitectura (8)

| ID | Hallazgo | Accion |
|----|----------|--------|
| DOC-053 | DDL-SCHEMA-ORDER.md: 16 schemas, falta data_warehouse | ACTUALIZAR a 18 |
| DOC-054 | ADRs 027-032 sin status explicito | AGREGAR campo Status |
| DOC-055 | Formato ADR inconsistente (XXXX vs XXX vs fecha) | ESTANDARIZAR |
| DOC-056 | ADR-008 sistema dual: verificar implementacion | VALIDAR exercise_mechanic_mapping |
| DOC-057 | "docs/90-adr/" referenciado en multiples ADRs | BUSCAR Y REEMPLAZAR |
| DOC-058 | Paths absolutos Linux en ADRs | CONVERTIR a relativos |
| DOC-059 | No hay mecanismo de supersedencia en ADRs | AGREGAR campo "Superseded by" |
| DOC-060 | Modules en ARCHITECTURE.md: 15 listados de 30 | COMPLETAR o indicar parcial |

---

## P2 - MEDIOS (38)

### Dead Features y Deprecaciones (12)

| ID | Feature | Docs Afectados | Accion |
|----|---------|---------------|--------|
| DOC-061 | "forum" refs en docs | ~26 archivos | DEPRECAR o PURGE refs |
| DOC-062 | "team_vs_team" refs | Pocos | PURGE refs (confirmado dead) |
| DOC-063 | "social_interactions" parcial | ~26 archivos | VALIDAR primero |
| DOC-064-072 | Refs individuales a dead features | Distribuidos | ACTUALIZAR cada uno |

### Backlog EPICs sin RF (9)

| ID | EPIC | RF Faltantes | Nota |
|----|------|-------------|------|
| DOC-073 | EXT-003 (Notificaciones) | 3 RF | BACKLOG - crear cuando se implemente |
| DOC-074 | EXT-004 (Perfiles) | 6 RF | BACKLOG |
| DOC-075 | EXT-005 (Reportes) | 5 RF | BACKLOG |
| DOC-076 | EXT-006 (Contenido) | 5 RF | BACKLOG |
| DOC-077 | EXT-007 (LTI) | 4 RF | BACKLOG 40% |
| DOC-078 | EXT-008 (White Label) | 3 RF | BACKLOG 50% |
| DOC-079 | EXT-009 (Peer Challenges) | 3 RF | BACKLOG 50% |
| DOC-080 | EXT-010 (Parent Notif) | 3 RF | BACKLOG 35% |
| DOC-081 | EXT-011 (Parent Portal) | 4 RF | BACKLOG 35% |

### Archived Tasks y Docs Legacy (17)

| ID | Hallazgo | Accion |
|----|----------|--------|
| DOC-082-088 | Archived tasks con posibles definiciones utiles | REVISAR y EXTRAER |
| DOC-089-098 | Portal admin archivados (17 docs pre-TASK-022) | VERIFICAR no referenciados |

---

## P3 - BAJOS (30)

### ADRs Opcionales (4)

| ID | ADR Sugerido | Tema |
|----|-------------|------|
| DOC-099 | ADR-034 | Constants SSOT Strategy |
| DOC-100 | ADR-035 | TypeORM vs Prisma Rationale |
| DOC-101 | ADR-036 | 171 Tables Evolution |
| DOC-102 | ADR-037 | Frontend State Management (Zustand) |

### Stubs Vacios (3)

| ID | Directorio | Status |
|----|------------|--------|
| DOC-103 | docs/20-perfiles/ | Solo _INDEX.md |
| DOC-104 | docs/60-proyectos/ | Solo _INDEX.md |
| DOC-105 | docs/70-onboarding/ | Solo _INDEX.md (contenido en 00-vision/) |

### Mejoras Menores (23)

| ID | Hallazgo |
|----|----------|
| DOC-106 | Supabase legacy comment en DDL-SCHEMA-ORDER.md |
| DOC-107 | REPORTE-INTEGRAL-2026-01-20.md superseded |
| DOC-108-127 | Paths absolutos, formato inconsistente, notas legacy |
