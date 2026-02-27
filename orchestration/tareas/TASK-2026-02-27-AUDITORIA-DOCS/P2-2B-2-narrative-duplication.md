# Phase 2B-2: Narrative/Content Duplication Audit

**Date:** 2026-02-27
**Scope:** docs/ — cross-file narrative and content duplication
**Auditor:** Claude Sonnet 4.6 (read-only — no files modified)
**Mode:** ANALYSIS (CAPVED phases C+A+P only)

---

## Executive Summary

The documentation corpus contains **9 confirmed duplication clusters** covering the 6 hotspots identified in Phase 1 plus 3 additional discoveries. Overlap severity ranges from MEDIUM (30-60%) to HIGH (>60%). The most critical finding is the **three-way "project identity" duplication** among CLAUDE.md, ONBOARDING-AGENTES.md, and MODULOS.md, which reaches >80% content overlap. The **deployment docs cluster** has 4 active files describing the same workflow with contradictory canonicity signals. The **delivery manuals cluster** contains 3 parallel student portal manuals that are functionally redundant with each other and with PORTAL-STUDENT-GUIDE.md.

Only 2 of the 9 clusters have a clearly designated and consistently respected canonical source. The remaining 7 require either consolidation or explicit SSOT designation.

---

## Hotspot 1: Auth Flow

### Files Covering This Topic

| File | Path | What It Says |
|------|------|-------------|
| FLUJO-REGISTRO-LOGIN.md | `docs/30-ux-ui/flujos/auth/FLUJO-REGISTRO-LOGIN.md` | Mermaid sequence diagram + artefactos FE/BE/DB para registro y login |
| FLUJO-RECUPERACION-PASSWORD.md | `docs/30-ux-ui/flujos/auth/FLUJO-RECUPERACION-PASSWORD.md` | Mermaid sequence diagram para password reset + componentes |
| FLUJO-VERIFICACION-EMAIL.md | `docs/30-ux-ui/flujos/auth/FLUJO-VERIFICACION-EMAIL.md` | Flowchart para verificacion de email + componentes |
| FLUJO-INICIALIZACION-USUARIO.md | `docs/80-references/transversal/arquitectura/FLUJO-INICIALIZACION-USUARIO.md` | Full end-to-end mapping (FE+BE+DB) de registro, login, inicializacion de triggers, layouts por portal y trazabilidad por archivo |
| schema-reference/01-auth.md | `docs/20-architecture/schema-reference/01-auth.md` | Catalogo DDL de tablas auth + auth_management con columnas, indices, triggers y RLS |
| PORTAL-STUDENT-GUIDE.md | `docs/60-portals/student/PORTAL-STUDENT-GUIDE.md` | Describe paginas LoginPage y RegisterPage como parte del portal estudiantil |
| PORTAL-PARENTS-GUIDE.md | `docs/60-portals/parents/PORTAL-PARENTS-GUIDE.md` | Describe autenticacion independiente del portal padres (endpoints /parent-portal/auth/*) |
| ONBOARDING-AGENTES.md | `docs/70-onboarding/ONBOARDING-AGENTES.md` | Menciona el flujo DDL→Entity→Endpoints→Frontend como regla de coherencia entre capas |
| MODULOS.md | `docs/00-overview/MODULOS.md` | Describe el modulo auth: JWT, Passport, RBAC, roles, endpoints |

### Canonical Source

**FLUJO-INICIALIZACION-USUARIO.md** es el SSOT operativo (v1.1.0, 2026-02-16). Es el documento mas completo: cubre secuencias FE→BE→DB, los 5 triggers de inicializacion, manejo de errores, y trazabilidad por capa.

Los tres archivos en `docs/30-ux-ui/flujos/auth/` son complementos normalizados de UX que ofrecen un nivel de abstraccion distinto (diagramas de flujo visuales), referenciando al SSOT correctamente mediante `Referencias` al final.

**schema-reference/01-auth.md** es el SSOT de la estructura de datos, no del flujo.

### Overlap Rating

| Par de Archivos | Overlap | Tipo de Overlap |
|-----------------|---------|----------------|
| FLUJO-REGISTRO-LOGIN.md vs FLUJO-INICIALIZACION-USUARIO.md | HIGH (70%) | Secuencia FE→BE→DB para registro y login, artefactos citados |
| MODULOS.md (modulo auth) vs schema-reference/01-auth.md | MEDIUM (40%) | Descripcion del modulo auth |
| PORTAL-STUDENT-GUIDE.md vs FLUJO-REGISTRO-LOGIN.md | LOW (25%) | Paginas de auth compartidas |

### Recommendation

**KEEP** con accion menor: Los archivos de `flujos/auth/` sirven una audiencia distinta (UX/diagramas) que FLUJO-INICIALIZACION-USUARIO.md (tecnico/implementacion). La arquitectura dual es correcta. Sin embargo, FLUJO-REGISTRO-LOGIN.md actualmente duplica partes de la tabla de trazabilidad de FLUJO-INICIALIZACION-USUARIO.md. Recomendacion: agregar una nota en FLUJO-REGISTRO-LOGIN.md que redirija a FLUJO-INICIALIZACION-USUARIO.md para la secuencia detallada FE→BE→DB. No consolidar.

---

## Hotspot 2: Gamification System

### Files Covering This Topic

| File | Path | What It Says |
|------|------|-------------|
| GAMIFICACION.md | `docs/00-overview/GAMIFICACION.md` | Vista de 6 lineas + referencias canonicas por sub-tema |
| ARQUITECTURA-GAMIFICACION.md | `docs/20-architecture/ARQUITECTURA-GAMIFICACION.md` | Motor completo: XP formula, rangos, achievements, ML Coins, leaderboard, spaced repetition — 400+ lineas |
| RANGOS-MAYA.md | `docs/20-architecture/gamificacion/RANGOS-MAYA.md` | Tabla canonica de 5 rangos con umbrales, bonus ML y multiplicador XP |
| ECONOMIA-VIRTUAL.md | `docs/20-architecture/gamificacion/ECONOMIA-VIRTUAL.md` | Fuentes de ML Coins y usos (pistas, tiempo, segunda oportunidad) — 20 lineas |
| RF-GAM-003-rangos-maya.md | `docs/10-requirements/epics/EPIC-GAM-F1-GAMIFICATION/requirements/RF-GAM-003-rangos-maya.md` | Requerimiento con tabla de rangos (Ajaw 0-499 XP), beneficios, exclusiones y trazabilidad DDL |
| ET-GAM-003-rangos-maya.md | `docs/10-requirements/epics/EPIC-GAM-F1-GAMIFICATION/specifications/ET-GAM-003-rangos-maya.md` | Especificacion tecnica del sistema de rangos |
| schema-reference/04-gamification.md | `docs/20-architecture/schema-reference/04-gamification.md` | DDL de tablas gamification_system: user_stats, user_ranks, comodines_inventory, etc. |
| PORTAL-STUDENT-GUIDE.md | `docs/60-portals/student/PORTAL-STUDENT-GUIDE.md` | Explica XP, rangos maya, ML Coins, misiones como funcionalidades del portal estudiantil |
| MANUAL-USUARIO-PORTAL-ESTUDIANTE.md | `docs/99-delivery/2025-11-16-entrega-final/MANUAL-USUARIO-PORTAL-ESTUDIANTE.md` | Explica XP, rangos maya (con thresholds distintos: 0-999 para Ajaw vs 0-499 en otros docs), ML Coins al usuario final |
| GLOSARIO.md | `docs/00-overview/GLOSARIO.md` | Define XP, ML Coins, Rango Maya, Streak, Leaderboard — redirige rangos a RANGOS-MAYA.md |
| ADR-001-gamificacion-maya.md | `docs/90-adr/ADR-001-gamificacion-maya.md` | Decision de usar cultura maya como vehiculo tematico |
| ADR-021-estandarizacion-recompensas-xp-ejercicios.md | `docs/90-adr/ADR-021-estandarizacion-recompensas-xp-ejercicios.md` | Decision sobre calculo de XP |
| MODULOS.md | `docs/00-overview/MODULOS.md` | Secciones dedicadas al modulo gamification, leaderboard, missions, store, achievements |

### Canonical Sources

- **Rangos Maya:** `docs/20-architecture/gamificacion/RANGOS-MAYA.md` (declarado SSOT en GLOSARIO.md)
- **Economia Virtual (ML Coins):** `docs/20-architecture/gamificacion/ECONOMIA-VIRTUAL.md` (muy escueto — ver gap abajo)
- **Arquitectura tecnica del motor:** `docs/20-architecture/ARQUITECTURA-GAMIFICACION.md`
- **Requerimiento funcional:** `docs/10-requirements/epics/EPIC-GAM-F1-GAMIFICATION/requirements/RF-GAM-003-rangos-maya.md`

### Overlap Rating

| Par de Archivos | Overlap | Tipo de Overlap |
|-----------------|---------|----------------|
| ARQUITECTURA-GAMIFICACION.md vs PORTAL-STUDENT-GUIDE.md | HIGH (65%) | Descripcion de XP, rangos, ML Coins, leaderboard |
| RANGOS-MAYA.md vs RF-GAM-003-rangos-maya.md | HIGH (75%) | Tabla de rangos identica, thresholds, beneficios |
| ARQUITECTURA-GAMIFICACION.md vs MODULOS.md (seccion gamification) | MEDIUM (50%) | Descripcion de subsistemas de gamificacion |
| GLOSARIO.md vs ECONOMIA-VIRTUAL.md | MEDIUM (35%) | Definicion de ML Coins y usos |

### Data Inconsistency Alert

**CRITICO — Thresholds de rangos inconsistentes:**
- `RANGOS-MAYA.md` (SSOT): Ajaw = 0-499 XP, Nacom = 500-999 XP, K'uk'ulkan = 1900+
- `MANUAL-USUARIO-PORTAL-ESTUDIANTE.md` (delivery): Ajaw = 0-999 XP, segundo rango = 1,000-4,999 XP
- `RF-GAM-003-rangos-maya.md`: Ajaw = 0-499 XP (alineado con SSOT)

El manual de entrega usa una jerarquia de 6 rangos distintos a los 5 rangos del SSOT (menciona hasta "Itzamna").

### Recommendation

- **CONSOLIDATE (parcial):** ARQUITECTURA-GAMIFICACION.md es excesivamente detallado para ser un documento de arquitectura de alto nivel. Las tablas de rangos y ML Coins en ese archivo deberian ser REDIRECT a RANGOS-MAYA.md y ECONOMIA-VIRTUAL.md.
- **KEEP:** Los archivos `docs/10-requirements/` sirven un proposito de trazabilidad distinto (requerimiento → implementacion).
- **CORRECTION REQUIRED:** El manual de entrega (`docs/99-delivery/`) usa thresholds de rangos inconsistentes. Este no es un problema de duplicacion sino de divergencia factual. Reportado para remediation separada.

---

## Hotspot 3: Exercise Types and Mechanics

### Files Covering This Topic

| File | Path | What It Says |
|------|------|-------------|
| MODULO-1-MECANICAS.md | `docs/20-architecture/gamificacion/MODULO-1-MECANICAS.md` | 5 tipos M1: crucigrama, linea_tiempo, completar_espacios, verdadero_falso, sopa_letras — evaluacion automatica |
| MODULO-2-MECANICAS.md | `docs/20-architecture/gamificacion/MODULO-2-MECANICAS.md` | 5 tipos M2 — evaluacion automatica |
| MODULO-3-MECANICAS.md | `docs/20-architecture/gamificacion/MODULO-3-MECANICAS.md` | 5 tipos M3 — evaluacion manual/teacher |
| MODULO-4-MECANICAS.md | `docs/20-architecture/gamificacion/MODULO-4-MECANICAS.md` | 5 tipos M4 |
| MODULO-5-MECANICAS.md | `docs/20-architecture/gamificacion/MODULO-5-MECANICAS.md` | 3 tipos M5 — evaluacion manual |
| RF-EDU-001-mecanicas-ejercicios.md | `docs/10-requirements/epics/EPIC-GAM-F1-EXERCISES/requirements/RF-EDU-001-mecanicas-ejercicios.md` | ENUM exercise_type (33 valores), mapeo pedagogico, tablas DDL relacionadas |
| ET-EDU-001-mecanicas-ejercicios.md | `docs/10-requirements/epics/EPIC-GAM-F1-EXERCISES/specifications/ET-EDU-001-mecanicas-ejercicios.md` | Especificacion tecnica de mecanicas |
| MODULOS-EDUCATIVOS.md | `docs/00-overview/MODULOS-EDUCATIVOS.md` | Tabla de 5 modulos y sus ejercicios (23 tipos) |
| GUIA-RESPUESTAS-EJERCICIOS.md | `docs/99-delivery/2025-11-16-entrega-final/GUIA-RESPUESTAS-EJERCICIOS.md` | Tabla con 24 ejercicios (incluyendo 1.5 Sopa de Letras BONUS y ejercicios AUX), respuestas esperadas |
| PORTAL-STUDENT-GUIDE.md | `docs/60-portals/student/PORTAL-STUDENT-GUIDE.md` | Lista tipos de ejercicio en la seccion de paginas y componentes |
| ADR-008-sistema-dual-exercise-mechanics.md | `docs/90-adr/ADR-008-sistema-dual-exercise-mechanics.md` | Decision sobre sistema dual (mecanicas GAMILIT vs clasificacion pedagogica) |
| MANUAL-USUARIO-PORTAL-ESTUDIANTE.md | `docs/99-delivery/2025-11-16-entrega-final/MANUAL-USUARIO-PORTAL-ESTUDIANTE.md` | Describe los 5 modulos desde la perspectiva del usuario final |

### Canonical Sources

- **Lista completa de tipos:** DDL ENUM `educational_content.exercise_type` (33 valores), documentado en RF-EDU-001
- **Por modulo (arquitectura):** Archivos `docs/20-architecture/gamificacion/MODULO-{N}-MECANICAS.md`
- **Clasificacion pedagogica:** RF-EDU-001 + ET-EDU-001
- **Respuestas de ejercicios (docente):** GUIA-RESPUESTAS-EJERCICIOS.md (unico documento con este proposito)

### Overlap Rating

| Par de Archivos | Overlap | Tipo de Overlap |
|-----------------|---------|----------------|
| MODULO-{N}-MECANICAS.md (x5) vs MODULOS-EDUCATIVOS.md | HIGH (70%) | Lista de ejercicios por modulo |
| MODULO-{N}-MECANICAS.md vs PORTAL-STUDENT-GUIDE.md | MEDIUM (45%) | Lista de ejercicios por modulo |
| MODULOS-EDUCATIVOS.md vs MANUAL-USUARIO-PORTAL-ESTUDIANTE.md | MEDIUM (40%) | Descripcion de los 5 modulos |

### Recommendation

- **KEEP** todos: Los MODULO-{N}-MECANICAS.md son archivos atomicos de arquitectura. MODULOS-EDUCATIVOS.md es una vista de resumen. El manual de entrega tiene audiencia diferente (usuario final). Estos documentos sirven distintos propositos y audiencias.
- **NOTE:** Los 5 archivos MODULO-{N}-MECANICAS.md son muy concisos (10-20 lineas cada uno) y estan normalizados correctamente.

---

## Hotspot 4: Portal Descriptions

### Files Covering This Topic

| File | Path | What It Says | Audiencia |
|------|------|-------------|-----------|
| PORTALES.md | `docs/00-overview/PORTALES.md` | Tabla de 4 portales con enfoque — 18 lineas, solo referencias | Overview |
| PORTAL-STUDENT-GUIDE.md | `docs/60-portals/student/PORTAL-STUDENT-GUIDE.md` | Guia tecnica completa: estructura de carpetas, componentes, hooks, endpoints, especificaciones — 1843 lineas | Dev/Tech |
| PORTAL-PARENTS-GUIDE.md | `docs/60-portals/parents/PORTAL-PARENTS-GUIDE.md` | Guia tecnica: funcionalidades, arquitectura, backend, frontend, endpoints | Dev/Tech |
| PORTAL-TEACHER-GUIDE.md | `docs/60-portals/teacher/PORTAL-TEACHER-GUIDE.md` | Guia tecnica del portal maestro | Dev/Tech |
| PORTAL-ADMIN-GUIDE.md | `docs/60-portals/admin/PORTAL-ADMIN-GUIDE.md` | Guia tecnica del portal admin | Dev/Tech |
| MANUAL-USUARIO-PORTAL-ESTUDIANTE.md | `docs/99-delivery/2025-11-16-entrega-final/MANUAL-USUARIO-PORTAL-ESTUDIANTE.md` | Manual de usuario final — 533 lineas | Usuario final |
| Manual_Portal_Student_v1.0.md | `docs/99-delivery/2025-11-16-entrega-final/Manual_Portal_Student_v1.0.md` | Manual de usuario estudiantil v1.0 — 1859 lineas | Usuario final |
| Manual_Portal_Maestros_ACTUALIZADO.md | `docs/99-delivery/2025-11-16-entrega-final/Manual_Portal_Maestros_ACTUALIZADO.md` | Manual de usuario maestros — 1617 lineas | Usuario final |
| MANUAL-USUARIO-PORTAL-MAESTROS.md | `docs/99-delivery/2025-11-16-entrega-final/MANUAL-USUARIO-PORTAL-MAESTROS.md` | Manual de usuario maestros (version distinta) — 379 lineas | Usuario final |
| MANUAL-USUARIO-PORTAL-ADMINISTRADOR.md | `docs/99-delivery/2025-11-16-entrega-final/MANUAL-USUARIO-PORTAL-ADMINISTRADOR.md` | Manual de usuario admin — 99-delivery | Usuario final |
| Manual_Portal_Administrador_ACTUALIZADO.md | `docs/99-delivery/2025-11-16-entrega-final/Manual_Portal_Administrador_ACTUALIZADO.md` | Manual de usuario admin (version actualizada) | Usuario final |
| MODULOS.md | `docs/00-overview/MODULOS.md` | Describe los 4 portales desde perspectiva del modulo backend (parents, teachers, etc.) | Dev |
| VISION-ALCANCE.md | `docs/10-requirements/VISION-ALCANCE.md` | Portales como parte del alcance del proyecto | PM/Req |

### Critical Intra-Cluster Duplication (Alta Prioridad)

Dentro de `docs/99-delivery/2025-11-16-entrega-final/` existen **pares de documentos funcionalmente identicos para el mismo portal y audiencia:**

| Par | Overlap | Estado |
|-----|---------|--------|
| `Manual_Portal_Student_v1.0.md` (1859 L) vs `MANUAL-USUARIO-PORTAL-ESTUDIANTE.md` (533 L) | HIGH (>70%) | Mismo proposito, diferente nivel de detalle |
| `Manual_Portal_Maestros_ACTUALIZADO.md` (1617 L) vs `MANUAL-USUARIO-PORTAL-MAESTROS.md` (379 L) | HIGH (>65%) | Misma audiencia, mismo proposito |
| `Manual_Portal_Administrador_ACTUALIZADO.md` vs `MANUAL-USUARIO-PORTAL-ADMINISTRADOR.md` | HIGH (>65%) | Misma audiencia, mismo proposito |

### Overlap Rating (Inter-Section)

| Par de Archivos | Overlap | Tipo |
|-----------------|---------|------|
| PORTAL-STUDENT-GUIDE.md vs Manual_Portal_Student_v1.0.md | MEDIUM (45%) | Descripcion de funcionalidades y paginas del portal |
| PORTALES.md vs MODULOS.md | LOW (20%) | Mencion de los 4 portales |
| VISION-ALCANCE.md vs PORTALES.md | LOW (15%) | Portales como parte del alcance |

### Canonical Sources

- **Guia tecnica de portales:** Archivos `docs/60-portals/{portal}/PORTAL-{PORTAL}-GUIDE.md` (una por portal)
- **Manual de usuario final:** Dentro de `docs/99-delivery/`, solo uno por portal (el "ACTUALIZADO" o el mas largo)
- **Vista de resumen:** `docs/00-overview/PORTALES.md` (correctamente normalizado)

### Recommendation

- **CONSOLIDATE dentro de 99-delivery:** Cada portal tiene 2 manuales de usuario que se superponen. Uno deberia ser archivado o eliminado. Recomendacion: marcar las versiones `MANUAL-USUARIO-PORTAL-{X}.md` (las mas cortas) como `_deprecated` y designar `Manual_Portal_{X}_ACTUALIZADO.md` como SSOT del manual de entrega para maestros y admin. Para estudiante, `Manual_Portal_Student_v1.0.md` es mas completo.
- **KEEP separados** los documentos de `docs/60-portals/` (audiencia tecnica) vs `docs/99-delivery/` (audiencia usuario final). Son complementarios, no duplicados.

---

## Hotspot 5: Testing Strategy

### Files Covering This Topic

| File | Path | What It Says |
|------|------|-------------|
| TESTING-STRATEGY.md | `docs/00-overview/TESTING-STRATEGY.md` | Estrategia completa: piramide, backend (Jest), frontend (Vitest), integracion, DB, metricas, CI/CD — 260 lineas |
| ESTANDAR-TESTING.md | `docs/40-standards/ESTANDAR-TESTING.md` | Estandar: piramide (70/20/10%), principios por nivel, unit test patterns, jest config, naming conventions — 200+ lineas |
| GUIA-COVERAGE-TESTING.md | `docs/50-guides/testing/GUIA-COVERAGE-TESTING.md` | Guia de coverage: estado actual (63 spec files, 2324 tests), estrategia por capa (services/controllers/guards/entities/FE), prioridad de cobertura |
| TESTING-GUIDE.md (backend) | `docs/50-guides/testing/TESTING-GUIDE.md` | Guia practica: configuracion jest, ejemplos de unit/integration tests, jest.config.js, vitest.config.ts |
| ONBOARDING-QA.md | `docs/70-onboarding/ONBOARDING-QA.md` | Piramide de testing, herramientas, cobertura minima (75/70/80/75%), portales a validar |
| backend-profesional/07-testing-patterns.md | `docs/40-standards/backend-profesional/07-testing-patterns.md` | Patrones de testing para backend (SOLID, Clean Architecture) |
| guia-pruebas-modulo-{1,2}.md | `docs/10-requirements/testing-guides/` | Guias de prueba por modulo educativo — respuestas ejemplo y criterios |

### Canonical Source

No hay SSOT claramente designado. Candidato natural: **ESTANDAR-TESTING.md** para estrategia y principios. **GUIA-COVERAGE-TESTING.md** para metricas actuales y roadmap. **TESTING-STRATEGY.md** es una vista de resumen que actualmente duplica ambos.

### Overlap Rating

| Par de Archivos | Overlap | Tipo |
|-----------------|---------|------|
| TESTING-STRATEGY.md vs ESTANDAR-TESTING.md | HIGH (65%) | Piramide de tests (ambas muestran el diagrama ASCII), distribucion 70/20/10%, frameworks |
| TESTING-STRATEGY.md vs GUIA-COVERAGE-TESTING.md | HIGH (60%) | Metricas actuales (2324 tests, 63 spec files), thresholds, estado por modulo |
| ESTANDAR-TESTING.md vs ONBOARDING-QA.md | MEDIUM (40%) | Piramide de testing, herramientas, niveles de cobertura |
| TESTING-GUIDE.md vs GUIA-COVERAGE-TESTING.md | MEDIUM (35%) | Configuracion de jest, comandos de ejecucion |

### Data Inconsistency Alert

Los thresholds de cobertura difieren entre archivos:
- `TESTING-GUIDE.md`: threshold en jest.config.js es 80% (configuracion de ejemplo)
- `GUIA-COVERAGE-TESTING.md`: threshold actual es 50%, objetivo 80%
- `ONBOARDING-QA.md`: threshold minimo es 75/70/80/75% (parece aspiracional, no real)
- `ESTANDAR-TESTING.md`: no especifica threshold numerico

### Recommendation

- **CONSOLIDATE (TESTING-STRATEGY.md):** Este archivo en `docs/00-overview/` duplica extensamente a ESTANDAR-TESTING.md y GUIA-COVERAGE-TESTING.md. Deberia reducirse a una vista de 20-30 lineas con referencias a los SSOT de cada sub-tema, siguiendo el patron de otros archivos en 00-overview/ que ya aplican esta normalizacion.
- **KEEP ESTANDAR-TESTING.md** como SSOT de principios y patrones.
- **KEEP GUIA-COVERAGE-TESTING.md** como SSOT de metricas actuales y roadmap de cobertura.
- **KEEP TESTING-GUIDE.md** como SSOT de ejemplos practicos de codigo.
- **REDIRECT ONBOARDING-QA.md** para la seccion de testing hacia ESTANDAR-TESTING.md.

---

## Hotspot 6: ONBOARDING-AGENTES.md vs CLAUDE.md

### Files Covering This Topic

| File | Path | Proposito Original |
|------|------|--------------------|
| CLAUDE.md | `/CLAUDE.md` (raiz del proyecto) | Instrucciones base autocargadas por Claude Code para todo agente IA |
| ONBOARDING-AGENTES.md | `docs/70-onboarding/ONBOARDING-AGENTES.md` | Guia esencial para agentes IA que se incorporan al proyecto |

### Analysis

ONBOARDING-AGENTES.md fue identificado en la fase de discovery de Phase 1 como con ~60% de duplicacion respecto a CLAUDE.md. La lectura detallada confirma esta estimacion:

**Contenido identico o parafraseado encontrado en ambos archivos:**
1. Tipo STANDALONE + monorepo + Git URL (CLAUDE.md seccion IDENTIDAD / ONBOARDING-AGENTES.md "Proyecto gamilit")
2. Stack: NestJS 11 + React 19 + PostgreSQL 15 + Redis + Socket.IO (CLAUDE.md / ONBOARDING "Conceptos Clave")
3. Definicion del ciclo CAPVED (C/A/P/V/E/D) con las 6 fases (CLAUDE.md COMPORTAMIENTO OBLIGATORIO / ONBOARDING "Ciclo CAPVED")
4. Tabla de modos FULL/QUICK/ANALYSIS con descripcion identica (CLAUDE.md / ONBOARDING "Modos de Ejecucion")
5. Jerarquia NEXUS 4 niveles con tokens L0/L1/L2/L3 (CLAUDE.md / ONBOARDING "Sistema NEXUS v4.1")
6. Regla de verificacion antes de crear (CLAUDE.md RC2 / ONBOARDING "Regla 1")
7. Regla de analizar dependencias antes de modificar (CLAUDE.md / ONBOARDING "Regla 2")
8. Regla de coherencia DDL→Backend→Frontend (CLAUDE.md RC2 / ONBOARDING "Regla 3")
9. Validacion build+lint+test antes de cerrar (CLAUDE.md validaciones / ONBOARDING "Regla 4")
10. Prohibicion de placeholders (CLAUDE.md Regla 3 / ONBOARDING "Regla 5")
11. Estructura del proyecto (arbol de directorios similar) (CLAUDE.md / ONBOARDING "Estructura del Proyecto")
12. Tabla de aliases de invocacion (CLAUDE.md / ONBOARDING "Aliases Mas Usados")
13. Flujo de desarrollo DDL→Entity→Endpoints→Frontend→Tests (CLAUDE.md / ONBOARDING "Flujo de Desarrollo")
14. Metricas: 23 modulos, 173 tablas, 912 endpoints, 575 componentes, etc. (CLAUDE.md / ONBOARDING)

### Overlap Rating

**HIGH (>70%)**

### Canonical Source

**CLAUDE.md** es el SSOT definitivo e inmutable para instrucciones de agente. Es el archivo autocargado por Claude Code.

### Recommendation

**REDIRECT:** ONBOARDING-AGENTES.md deberia reducirse a una guia de 30-50 lineas que:
1. Diga "La fuente de verdad para configuracion y reglas es CLAUDE.md (se autocarga)"
2. Proporcione el flujo de lectura recomendado (CLAUDE.md → PRINCIPIO-CAPVED.md → SIMCO-TAREA.md)
3. Liste solo los 5-6 puntos de onboarding que NO estan en CLAUDE.md (como errores comunes especificos de agentes)

El contenido duplicado deberia eliminarse de ONBOARDING-AGENTES.md, manteniendo solo las informaciones que son genuinamente distintas (por ejemplo, errores comunes de agentes IA no cubiertos en CLAUDE.md).

---

## Discovery 7: Deployment Documentation

### Files Covering This Topic

| File | Path | Estado | Lineas |
|------|------|--------|--------|
| DEPLOYMENT.md | `docs/00-overview/DEPLOYMENT.md` | Activo — referencia operativa completa (Nginx, PM2, SSL, env vars, rollback) | 509 |
| DEPLOYMENT-MASTER.md | `docs/50-guides/deployment/DEPLOYMENT-MASTER.md` | Marcado como DEPRECATED (2026-02-24) — referencia historica | 1074 |
| GUIA-DESPLIEGUE-PRODUCCION-COMPLETA.md | `docs/50-guides/deployment/GUIA-DESPLIEGUE-PRODUCCION-COMPLETA.md` | Activo — guia de despliegue completa | 1206 |
| GUIA-ACTUALIZACION-PRODUCCION.md | `docs/50-guides/deployment/GUIA-ACTUALIZACION-PRODUCCION.md` | Activo — actualizacion en produccion | N/A |
| AMBIENTES-DEV-PROD.md | `docs/20-architecture/AMBIENTES-DEV-PROD.md` | Activo — comparacion dev vs prod, config del servidor | N/A |
| PERFIL-DEPLOY-SERVER.md | `orchestration/agents/perfiles/PERFIL-DEPLOY-SERVER.md` | SSOT segun DEPLOYMENT-MASTER.md deprecated notice | N/A |

### Overlap Rating

| Par de Archivos | Overlap | Tipo |
|-----------------|---------|------|
| DEPLOYMENT.md vs GUIA-DESPLIEGUE-PRODUCCION-COMPLETA.md | HIGH (65%) | Mismos pasos: git pull, npm ci, npm run build, pm2 restart, variables de entorno |
| DEPLOYMENT.md vs AMBIENTES-DEV-PROD.md | MEDIUM (40%) | Configuracion de puertos, ambientes, Nginx |
| DEPLOYMENT-MASTER.md (deprecated) vs DEPLOYMENT.md | HIGH (70%) | DEPLOYMENT-MASTER fue consolidado antes de que existiera DEPLOYMENT.md |

### Canonical Source

Ambiguo. DEPLOYMENT-MASTER.md dice que el SSOT operativo es `orchestration/referencias/MATRIZ-SSOT-DEV-PROD.md` y `orchestration/agents/perfiles/PERFIL-DEPLOY-SERVER.md`. Sin embargo, el archivo DEPLOYMENT.md en `docs/00-overview/` es mas reciente (2026-02-10 vs 2026-02-03) y mas detallado.

### Recommendation

**CONSOLIDATE:** Se necesita designar un SSOT claro:
1. DEPLOYMENT-MASTER.md ya esta marcado deprecated — correcto, mantener como archivo historico.
2. DEPLOYMENT.md (`docs/00-overview/`) deberia ser el SSOT canonico en docs/ para deployment tecnico.
3. GUIA-DESPLIEGUE-PRODUCCION-COMPLETA.md deberia convertirse en REDIRECT a DEPLOYMENT.md para las partes que duplica.
4. El notice de deprecated en DEPLOYMENT-MASTER.md deberia actualizarse para apuntar a DEPLOYMENT.md (actualmente apunta a orchestration/).

---

## Discovery 8: Project Identity / Project Description

### Files Covering This Topic

| File | Path | Que Describe |
|------|------|-------------|
| CLAUDE.md | `/CLAUDE.md` | Identidad completa, stack, estado, modulos, portales, metricas — 300+ lineas |
| IDENTIDAD.md | `docs/00-overview/IDENTIDAD.md` | Ficha rapida — 8 lineas + referencias |
| VISION.md | `docs/00-overview/VISION.md` | Problema, propuesta de valor, objetivos — 25 lineas |
| ARQUITECTURA-TECNICA.md | `docs/00-overview/ARQUITECTURA-TECNICA.md` | Stack, estructura, ambientes — 20 lineas (normalizado) |
| MODULOS.md | `docs/00-overview/MODULOS.md` | 23 modulos con detalle completo — 450 lineas |
| VISION-ALCANCE.md | `docs/10-requirements/VISION-ALCANCE.md` | Vision, alcance, 23 modulos con tabla, 4 portales — 200+ lineas |
| ONBOARDING-AGENTES.md | `docs/70-onboarding/ONBOARDING-AGENTES.md` | "Proyecto gamilit" — replica CLAUDE.md |
| ONBOARDING-DESARROLLADORES.md | `docs/70-onboarding/ONBOARDING-DESARROLLADORES.md` | Setup tecnico, stack, credenciales — complementa CLAUDE.md |

### Overlap Rating

| Par de Archivos | Overlap | Tipo |
|-----------------|---------|------|
| CLAUDE.md (seccion MODULOS) vs MODULOS.md | HIGH (75%) | Lista de 23 modulos con descripcion, estado, entities, endpoints |
| CLAUDE.md (seccion PORTALES) vs VISION-ALCANCE.md | HIGH (65%) | Descripcion de portales y alcance |
| MODULOS.md vs VISION-ALCANCE.md | HIGH (70%) | Tabla de 23 modulos con descripcion y estado |
| ARQUITECTURA-TECNICA.md vs STACK-TECNOLOGICO.md | MEDIUM (50%) | Stack NestJS/React/PostgreSQL/Redis, puertos |

### Recommendation

- **REDIRECT MODULOS.md a CLAUDE.md:** La tabla de 23 modulos en MODULOS.md es identica a la de CLAUDE.md. Evaluar si MODULOS.md deberia reducirse a una vista de referencia con link a CLAUDE.md para los datos completos.
- **KEEP VISION-ALCANCE.md:** Sirve como documento de requerimientos con contexto de negocio que va mas alla de la identidad tecnica.
- **KEEP MODULOS.md normalizado:** La seccion `docs/00-overview/` sigue el patron de archivos atomicos por tema (1FN aplicada). El solapamiento con CLAUDE.md es inevitable dado que CLAUDE.md es el archivo maestro autocargado.

---

## Discovery 9: XP Calculation Rules

### Files Covering This Topic

| File | Path | Que Dice |
|------|------|---------|
| ARQUITECTURA-GAMIFICACION.md | `docs/20-architecture/ARQUITECTURA-GAMIFICACION.md` | Formula XP completa: `XP_base = exercise_type_xp * difficulty_multiplier`, tablas de multiplicadores de dificultad (1x, 1.5x, 2x, 3x) y streak (1.0x-2.0x), scoring formula |
| ADR-021-estandarizacion-recompensas-xp-ejercicios.md | `docs/90-adr/ADR-021-estandarizacion-recompensas-xp-ejercicios.md` | Decision de estandarizacion de XP |
| ADR-016-simplificar-backend-xp-acumulacion.md | `docs/90-adr/ADR-016-simplificar-backend-xp-acumulacion.md` | Decision de simplificacion del calculo de XP |
| ET-GAM-010-multipliers.md | `docs/10-requirements/epics/EPIC-GAM-F1-GAMIFICATION/specifications/ET-GAM-010-multipliers.md` | Especificacion tecnica de multiplicadores |
| DATOS-GAMIFICACION.md | `docs/20-architecture/DATOS-GAMIFICACION.md` | Datos de gamificacion (posiblemente tablas de XP por tipo de ejercicio) |
| RF-GAM-003-rangos-maya.md | `docs/10-requirements/epics/EPIC-GAM-F1-GAMIFICATION/requirements/RF-GAM-003-rangos-maya.md` | Menciona multiplicadores de XP por rango como beneficio |

### Overlap Rating

| Par de Archivos | Overlap | Tipo |
|-----------------|---------|------|
| ARQUITECTURA-GAMIFICACION.md vs ET-GAM-010-multipliers.md | HIGH (65%) | Tablas de multiplicadores de dificultad y streak |
| ADR-016 vs ADR-021 | LOW (20%) | Ambos sobre XP pero diferentes decisiones |

### Recommendation

- **KEEP con accion menor:** La especificacion ET-GAM-010-multipliers.md es el SSOT de los multiplicadores. ARQUITECTURA-GAMIFICACION.md deberia reemplazar su tabla de multiplicadores con REDIRECT a ET-GAM-010.
- El solapamiento entre ADRs es normal y esperado — cada ADR documenta una decision distinta.

---

## Summary Matrix

| # | Cluster | Files | Overlap | SSOT Designado | Recomendacion |
|---|---------|-------|---------|---------------|---------------|
| 1 | Auth Flow | 9 | LOW-MEDIUM | FLUJO-INICIALIZACION-USUARIO.md | KEEP + nota de redirect en FLUJO-REGISTRO-LOGIN.md |
| 2 | Gamification System | 13 | MEDIUM-HIGH | RANGOS-MAYA.md + ARQUITECTURA-GAMIFICACION.md | CONSOLIDATE (parcial): eliminar tabla de rangos de ARQUITECTURA-GAMIFICACION |
| 3 | Exercise Types | 12 | MEDIUM-HIGH | RF-EDU-001 + MODULOx-MECANICAS | KEEP (audiencias distintas) |
| 4 | Portal Descriptions | 14 | MEDIUM-HIGH | PORTAL-{X}-GUIDE.md (tecnico); Manual_{X}_ACTUALIZADO.md (usuario) | CONSOLIDATE dentro de 99-delivery: deprecar versiones cortas |
| 5 | Testing Strategy | 7 | HIGH | ESTANDAR-TESTING.md + GUIA-COVERAGE-TESTING.md | CONSOLIDATE TESTING-STRATEGY.md a vista de referencia |
| 6 | ONBOARDING-AGENTES vs CLAUDE.md | 2 | HIGH (>70%) | CLAUDE.md | REDIRECT: reducir ONBOARDING-AGENTES.md a guia de lectura obligatoria |
| 7 | Deployment Docs | 6 | HIGH (65-70%) | DEPLOYMENT.md | CONSOLIDATE: designar DEPLOYMENT.md como SSOT en docs/, redirect GUIA-DESPLIEGUE |
| 8 | Project Identity | 8 | HIGH (70-75%) | CLAUDE.md (master) | KEEP con normalizacion existente en 00-overview/ |
| 9 | XP Calculation | 6 | MEDIUM-HIGH | ET-GAM-010-multipliers.md | KEEP + redirect desde ARQUITECTURA-GAMIFICACION.md |

---

## Additional Observations

### Pattern: "ACTUALIZADO" vs Original in 99-delivery

El patron de tener dos versiones del mismo manual (`Manual_X_v1.0.md` y `MANUAL-X-ACTUALIZADO.md`) es sistematico. Hay 6 archivos afectados. Ninguno tiene frontmatter de version que indique cual es el mas reciente. Los nombres de archivo no permiten inferir canonicidad sin leer el contenido.

**Accion recomendada:** Agregar un encabezado `> DEPRECATED: ver [Manual_X_ACTUALIZADO.md]` en los archivos mas cortos.

### Pattern: Stack Description Scattered

El stack "NestJS 11 + React 19 + PostgreSQL 15 + TypeORM + Redis + Socket.IO + Vite" aparece en 12+ archivos (CLAUDE.md, ONBOARDING-AGENTES.md, IDENTIDAD.md, ARQUITECTURA-TECNICA.md, STACK-TECNOLOGICO.md, ONBOARDING-DESARROLLADORES.md, VISION-ALCANCE.md, README.md, MODULOS.md, TESTING-STRATEGY.md, etc.). Esto es una consecuencia de que cada seccion de docs busca ser auto-suficiente. Es baja prioridad porque los archivos `00-overview/` ya aplican 1FN y redirigen correctamente.

### Pattern: Module Count in Multiple Files

"23 modulos", "173 tablas", "912 endpoints", "575 componentes", "72 paginas", "2324 tests" aparecen en al menos 8-10 archivos cada uno. METRICAS.md en `docs/00-overview/` ya aplica la politica correcta: solo referencia a MASTER_INVENTORY.yml. Otros archivos que contienen estos conteos deberian agregar una nota "(ver MASTER_INVENTORY.yml para valor vigente)".

### Data Inconsistencies Found (for Separate Remediation)

Las siguientes divergencias factual entre documentos requieren atencion separada (no son solo duplicacion, son inconsistencias):

1. **Thresholds de rangos maya:** MANUAL-USUARIO-PORTAL-ESTUDIANTE.md usa rangos distintos (Ajaw=0-999) a los documentos SSOT (Ajaw=0-499)
2. **Numero de rangos:** MANUAL-USUARIO-PORTAL-ESTUDIANTE.md menciona 6 rangos (incluyendo Itzamna), otros documentos definen 5
3. **Thresholds de coverage:** ONBOARDING-QA.md (75%), GUIA-COVERAGE-TESTING.md (50%), TESTING-GUIDE.md (80%)
4. **Numero de ADRs:** ONBOARDING-AGENTES.md dice "39 ADRs", CLAUDE.md dice "47 ADRs"

---

## Prioritized Action Plan

### P0 — Critico (datos inconsistentes, puede confundir usuarios)
1. Corregir thresholds de rangos maya en `docs/99-delivery/2025-11-16-entrega-final/MANUAL-USUARIO-PORTAL-ESTUDIANTE.md`
2. Alinear coverage thresholds en ONBOARDING-QA.md con GUIA-COVERAGE-TESTING.md

### P1 — Alta (duplicacion significativa con SSOT claro)
3. Reducir ONBOARDING-AGENTES.md — eliminar las 14 secciones que replican CLAUDE.md
4. Marcar como deprecated los manuales de usuario cortos en 99-delivery

### P2 — Media (consolidacion de SSOT)
5. Designar DEPLOYMENT.md como SSOT en docs/ y convertir GUIA-DESPLIEGUE-PRODUCCION-COMPLETA.md a REDIRECT
6. Reducir TESTING-STRATEGY.md a vista de referencia (20-30 lineas)

### P3 — Baja (normalizacion menor)
7. Agregar redirects en ARQUITECTURA-GAMIFICACION.md a RANGOS-MAYA.md y ET-GAM-010-multipliers.md
8. Agregar nota en archivos con conteos de metricas: "valor vigente en MASTER_INVENTORY.yml"

---

*Read-only audit — no files modified*
*GAMILIT Documentation Audit — Phase 2B-2 Narrative Duplication*
