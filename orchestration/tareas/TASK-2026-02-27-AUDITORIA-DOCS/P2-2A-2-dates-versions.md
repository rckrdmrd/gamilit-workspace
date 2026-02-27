# P2-2A-2: Auditoria de Fechas, Versiones y Consistencia Temporal

**Fecha de auditoria:** 2026-02-27
**Auditor:** Claude Sonnet 4.6 (read-only)
**Scope:** docs/ — fechas, versiones de tecnologia, estado/pendientes, inconsistencias temporales
**Modo:** ANALYSIS (read-only, sin modificaciones)

---

## RESUMEN EJECUTIVO

| Categoria | Hallazgos HIGH | Hallazgos MEDIUM | Hallazgos LOW | Total |
|-----------|----------------|------------------|---------------|-------|
| PostgreSQL 16 en docs activos | 1 (cluster) | 0 | 0 | ~26 archivos |
| Vite 7.x en docs activos | 1 (cluster) | 0 | 0 | ~10 archivos |
| React 18 en docs activos | 0 | 1 (cluster) | 1 | ~5 archivos |
| NestJS @10 packages en docs | 0 | 1 | 0 | 1 archivo |
| NEXUS v3.4 (obsoleto) | 0 | 1 (cluster) | 0 | ~15 archivos |
| SIMCO v4.0.0 vs v4.3.0 inconsistencia | 0 | 1 (cluster) | 0 | ~20 archivos |
| GAMILIT v4.7.0 aislado | 0 | 1 | 0 | 1 archivo |
| Endpoint count inconsistente | 1 | 0 | 0 | ~5 archivos |
| Metricas obsoletas (modulos, entidades) | 0 | 1 | 0 | 1 archivo |
| TailwindCSS 3 / Zustand 4 | 0 | 0 | 1 | 1 archivo |
| Puerto 3001 (WS) obsoleto | 0 | 1 | 0 | 1 archivo |
| PostgreSQL 14 en guia activa | 0 | 1 | 0 | 1 archivo |
| 23 tipos ejercicio (semantica) | 0 | 0 | 1 | ~12 archivos |
| TODO inline en specs | 0 | 0 | 1 | 3 archivos |

**Patron dominante:** La mayoria de las inconsistencias de version fueron introducidas durante la fase inicial de documentacion (cuando el proyecto planeaba PG 16 / Vite 7) y no fueron actualizadas al reflejar las versiones reales instaladas (PG 15 / Vite 6.x).

---

## SECCION 1: FECHAS POTENCIALMENTE OBSOLETAS

### 1.1 Fechas en archivos pre-2025-10-01 (historico vs activo)

**Resultado:** No se encontraron archivos activos con fechas de cabecera anteriores a 2025-10-01. Las fechas del rango 2025-10 a 2025-12 en los user-stories y requirements (created_date, completed_date) son marcas de creacion y completitud historicas, no afirmaciones de estado actual. Son apropiadas en contexto.

**Excepcion — fecha de creacion en contexto de ejemplo de datos:**
- `docs/10-requirements/epics/EPIC-GAM-F1-ADMIN/specifications/ET-ADM-001-gestion-aulas.md` linea 699: `{ startDate: '2025-12-01', endDate: '2025-01-01' }` — es un fixture de test intencional que ilustra validacion de fechas invertidas. No es stale, es correcto.

### 1.2 Archivos con "estado actual" y fechas 2026-01-xx que podrian estar desactualizados

| Archivo | Linea | Fecha | Riesgo |
|---------|-------|-------|--------|
| `docs/00-overview/REPORTE-INTEGRAL-2026-01-20.md` | 3 | 2026-01-20 | Reporte snapshot, no claim de estado actual. OK. |
| `docs/00-overview/directivas/_INDEX.md` | 5 | 2026-02-11 | Metricas internas **muy desactualizadas** (ver Seccion 3) |
| `docs/10-requirements/epics/EPIC-GAM-F1-ADMIN/PLAN.md` | 3 | 2026-02-10 | Fecha de plan, no critica |

**Hallazgo:** `docs/00-overview/directivas/_INDEX.md` (ultima actualizacion 2026-02-11) contiene un bloque de metricas con datos del inventario v7.0.0 que discrepa con el estado actual. Ver Seccion 3.

---

## SECCION 2: VERSIONES DE TECNOLOGIA

### F-TECH-01 [HIGH] PostgreSQL 16 en documentacion activa (deberia ser 15)

**Realidad:** La instancia real usa **PostgreSQL 15** (credenciales en CLAUDE.md: RC5, confirmado en `docs/20-architecture/STACK-TECNOLOGICO.md` linea 25 "PostgreSQL 15.x").

**Archivos con PostgreSQL 16 (excluidos `99-delivery/` y `_archived/`):**

| Archivo | Linea | Texto |
|---------|-------|-------|
| `docs/10-requirements/epics/EPIC-GAM-F1-ADMIN/PLAN.md` | 23 | `PostgreSQL 16 / React 19` |
| `docs/10-requirements/epics/EPIC-GAM-F1-ANALYTICS/PLAN.md` | 22 | `PostgreSQL 16 / React 19` |
| `docs/10-requirements/epics/EPIC-GAM-F1-AUTH/PLAN.md` | 24 | `PostgreSQL 16 / React 19` |
| `docs/10-requirements/epics/EPIC-GAM-F1-CONFIG/PLAN.md` | 19 | `PostgreSQL 16 / React 19` |
| `docs/10-requirements/epics/EPIC-GAM-F1-EXERCISES/PLAN.md` | 24 | `PostgreSQL 16 / React 19` |
| `docs/10-requirements/epics/EPIC-GAM-F1-GAMIFICATION/PLAN.md` | 24 | `PostgreSQL 16 / React 19` |
| `docs/10-requirements/epics/EPIC-GAM-F2-DB-MIGRATION/PLAN.md` | 25 | `PostgreSQL 16, bash scripts` |
| `docs/10-requirements/epics/EPIC-GAM-F2-MODULES-M4M5/PLAN.md` | 23 | `PostgreSQL 16 / React 19` |
| `docs/10-requirements/epics/EPIC-GAM-F2-TECH-CONSOLIDATION/PLAN.md` | 21 | `PostgreSQL 16 / React 19` |
| `docs/10-requirements/epics/EPIC-GAM-F3-ADMIN-EXTENDED/PLAN.md` | 36 | `PostgreSQL 16 / React 19` |
| `docs/10-requirements/epics/EPIC-GAM-F3-CONTENT/PLAN.md` | 21 | `PostgreSQL 16 / React 19` |
| `docs/10-requirements/epics/EPIC-GAM-F3-LTI/PLAN.md` | 20 | `PostgreSQL 16 / React 19` |
| `docs/10-requirements/epics/EPIC-GAM-F3-NOTIFICATIONS/PLAN.md` | 19 | `PostgreSQL 16 / React 19` |
| `docs/10-requirements/epics/EPIC-GAM-F3-PARENT-NOTIFICATIONS/PLAN.md` | 19 | `PostgreSQL 16 / Nodemailer` |
| `docs/10-requirements/epics/EPIC-GAM-F3-PARENT-PORTAL/PLAN.md` | 20 | `PostgreSQL 16 / React 19` |
| `docs/10-requirements/epics/EPIC-GAM-F3-PEER-CHALLENGES/PLAN.md` | 19 | `PostgreSQL 16 / React 19` |
| `docs/10-requirements/epics/EPIC-GAM-F3-PROFILES/PLAN.md` | 22 | `PostgreSQL 16 / React 19` |
| `docs/10-requirements/epics/EPIC-GAM-F3-REPORTS/PLAN.md` | 21 | `PostgreSQL 16 / React 19` |
| `docs/10-requirements/epics/EPIC-GAM-F3-SOCIAL-GAMIFICATION/PLAN.md` | 22 | `PostgreSQL 16 / React 19` |
| `docs/10-requirements/epics/EPIC-GAM-F3-TEACHER-PORTAL/PLAN.md` | 37 | `PostgreSQL 16 / React 19` |
| `docs/10-requirements/epics/EPIC-GAM-F3-WHITE-LABEL/PLAN.md` | 19 | `PostgreSQL 16 / React 19` |
| `docs/10-requirements/epics/_wave-3-technical/EPIC-GAM-ARCHITECTURE/EPIC.md` | 17, 21 | `PostgreSQL 16` |
| `docs/10-requirements/epics/_wave-3-technical/EPIC-GAM-DEVOPS/EPIC.md` | 17, 34 | `PostgreSQL 16` |
| `docs/10-requirements/epics/_wave-3-technical/EPIC-GAM-SCAFFOLD/EPIC.md` | 17, 24, 32 | `PostgreSQL 16` |
| `docs/10-requirements/epics/_wave-3-technical/EPIC-GAM-BACKEND/US-GAM-ANL-01.md` | 52 | `PostgreSQL 16` |
| `docs/10-requirements/epics/EPIC-GAM-F3-ADMIN-EXTENDED/specifications/ET-EXT-002-ARQUITECTURA-TECNICA.md` | 55 | `PostgreSQL 14+` (adicionalmente menciona version aun menor) |

**Severidad:** HIGH — un lector de estas PLANs asumira que el sistema usa PG 16, cuando usa PG 15. Afecta todas las PLANs de epics (~21 archivos).

**Contexto:** Las PLANs fueron creadas con PG 16 como objetivo, pero la implementacion real uso PG 15. La fuente de verdad `docs/20-architecture/STACK-TECNOLOGICO.md` es correcta.

---

### F-TECH-02 [HIGH] Vite 7.x en documentacion activa (deberia ser 6.x)

**Realidad:** `apps/frontend/package.json` tiene `"vite": "^6.2.0"`. CLAUDE.md declara "Vite 6.x".

**Archivos con Vite 7 (excluidos `_archived/` y `99-delivery/`):**

| Archivo | Linea | Texto |
|---------|-------|-------|
| `docs/10-requirements/epics/EPIC-GAM-F1-ADMIN/PLAN.md` | 23 | `Vite 7.x` |
| `docs/10-requirements/epics/EPIC-GAM-F1-AUTH/PLAN.md` | 24 | `Vite 7.x` |
| `docs/10-requirements/epics/EPIC-GAM-F1-EXERCISES/PLAN.md` | 24 | `Vite 7.x` |
| `docs/10-requirements/epics/EPIC-GAM-F2-MODULES-M4M5/PLAN.md` | 23 | `Vite 7.x` |
| `docs/10-requirements/epics/EPIC-GAM-F2-TECH-CONSOLIDATION/PLAN.md` | 21 | `Vite 7.x` |
| `docs/10-requirements/epics/EPIC-GAM-F3-ADMIN-EXTENDED/PLAN.md` | 36 | `Vite 7.x` |
| `docs/10-requirements/epics/EPIC-GAM-F3-PARENT-PORTAL/PLAN.md` | 20 | `Vite 7.x` |
| `docs/10-requirements/epics/_wave-3-technical/EPIC-GAM-SCAFFOLD/EPIC.md` | 17, 23, 34 | `Vite 7` |

**Severidad:** HIGH — mismo patron que PG 16. Las EPICs y PLANs documentaron la version objetivo (Vite 7) pero la implementacion usa Vite 6.x.

---

### F-TECH-03 [MEDIUM] React 18 en documentacion activa (deberia ser 19)

**Realidad:** `apps/frontend/package.json` tiene `"react": "^19.2.0"`.

**Archivos con React 18 en docs activos (no archivados):**

| Archivo | Linea | Texto |
|---------|-------|-------|
| `docs/10-requirements/epics/EPIC-GAM-F3-NOTIFICATIONS/user-stories/US-NOT-001b/US-NOT-001b-notification-center.md` | 205, 441 | `React 18, TypeScript, Zustand` |
| `docs/10-requirements/epics/EPIC-GAM-F3-NOTIFICATIONS/user-stories/US-NOT-001c/US-NOT-001c-preferences-management.md` | 302, 434 | `React 18, React Hook Form` |
| `docs/60-portals/student/specs/ASSIGNMENTS-SPEC.md` | 534 | `react \| ^18.x \| Framework base` |
| `docs/40-standards/STANDARD-COMPONENT.md` | 38 | "`React.FC` esta deprecated desde React 18 (ya no agrega `children` implicito)" — en realidad valido en React 19 tambien, pero la frase alude a React 18 como version relevante |

**Severidad:** MEDIUM — las user-stories de notificaciones y el ASSIGNMENTS-SPEC son documentos de especificacion con stack listado incorrectamente.

---

### F-TECH-04 [MEDIUM] NestJS @10 packages en user-story de infraestructura base

**Archivo:** `docs/10-requirements/epics/EPIC-GAM-F1-AUTH/user-stories/US-FUND-004/US-FUND-004-infraestructura-tecnica-base.md`

| Linea | Texto |
|-------|-------|
| 116 | `"@nestjs/common": "^10.0.0"` |
| 117 | `"@nestjs/core": "^10.0.0"` |
| 118 | `"@nestjs/platform-express": "^10.0.0"` |
| 119 | `"@nestjs/typeorm": "^10.0.0"` |
| 120 | `"@nestjs/jwt": "^10.0.0"` |
| 121 | `"@nestjs/swagger": "^7.0.0"` |

**Realidad:** El backend usa `@nestjs/typeorm: "^11.0.0"` y NestJS 11 (confirmado en `apps/backend/package.json` y `docs/20-architecture/STACK-TECNOLOGICO.md`).

**Adicionalmente en el mismo archivo:**
- Linea 203: `"react": "^18.2.0"` (deberia ser ^19)
- Linea 204: `"react-dom": "^18.2.0"` (deberia ser ^19)
- Linea 206: `"zustand": "^4.3.9"` (actual: ^5.0.8)
- Linea 208: `"tailwindcss": "^3.3.3"` (actual: ^4.1.14)
- Linea 214: `"@types/react": "^18.2.15"` (deberia ser ^19)

**Severidad:** MEDIUM — Este archivo es un user-story historico de infraestructura base que muestra el stack de arranque inicial. Contiene la snapshot mas antigua y mas desactualizada del stack. Un nuevo desarrollador podria usarla como referencia de instalacion.

---

### F-TECH-05 [LOW] TailwindCSS 4.x en docs vs archivo historico con TailwindCSS 3

**El mismo archivo US-FUND-004** (linea 208) referencia `tailwindcss: ^3.3.3`. La mayoria de los demas docs mencionan TailwindCSS 4.x (correcto). Esto es una inconsistencia aislada dentro del mismo archivo ya marcado en F-TECH-04.

---

### F-TECH-06 [MEDIUM] PostgreSQL 14 en guia activa de creacion de base de datos

**Archivo:** `docs/50-guides/backend/GUIA-CREAR-BASE-DATOS.md`
- Linea 55: `### 1. PostgreSQL 14 o superior`

**Realidad:** El sistema usa PostgreSQL 15 especificamente. La guia establece un minimo de PG 14 que podria no ser valido con las features de PG 15+ usadas.

**Severidad:** MEDIUM — guia de onboarding activa para desarrolladores.

---

### F-TECH-07 [MEDIUM] PostgreSQL 14+ en especificacion de arquitectura tecnica

**Archivo:** `docs/10-requirements/epics/EPIC-GAM-F3-ADMIN-EXTENDED/specifications/ET-EXT-002-ARQUITECTURA-TECNICA.md`
- Linea 55: `DATABASE (PostgreSQL 14+)` (diagrama ASCII)

**Severidad:** MEDIUM — especificacion activa de arquitectura.

---

### F-TECH-08 [LOW] Node.js inconsistencias menores entre guias

Hay una variedad de versiones de Node.js referenciadas: `18+`, `18.0.0+`, `20.x`, `v20 LTS`. La version canonica en STACK-TECNOLOGICO.md es `20.x LTS`. Las guias que dicen `18+` son tecnicamente correctas (minimo requerido) pero podrían alinearse mejor.

| Archivo | Linea | Texto |
|---------|-------|-------|
| `docs/50-guides/backend/impl/README.md` | 34 | `Node.js 18+` |
| `docs/50-guides/deployment/GUIA-DESPLIEGUE-PRODUCCION-COMPLETA.md` | 92 | `Node.js \| 18.0.0+` |
| `docs/50-guides/frontend/impl/SETUP-DEVELOPMENT.md` | 11 | `Node.js v18+` |
| `docs/99-delivery/2025-11-16-entrega-final/GUIA_ENTREGA_USB.md` | 251 | `Node.js 18.x` (99-delivery, ya historico) |

**Severidad:** LOW — diferencia entre minimo soportado y version recomendada.

---

## SECCION 3: VERSION DE SISTEMA (SIMCO/NEXUS/GAMILIT)

### F-SYS-01 [MEDIUM] NEXUS v3.4 en multiples _MAP.md activos (deberia ser v4.1)

**CLAUDE.md declara:** `NEXUS v4.1`

**Archivos con NEXUS v3.4:**

| Archivo | Linea |
|---------|-------|
| `docs/10-requirements/epics/EPIC-GAM-F3-ADMIN-EXTENDED/tasks/_MAP.md` | 36 |
| `docs/10-requirements/epics/EPIC-GAM-F3-CONTENT/tasks/_MAP.md` | 36 |
| `docs/10-requirements/epics/EPIC-GAM-F3-LTI/tasks/_MAP.md` | 36 |
| `docs/10-requirements/epics/EPIC-GAM-F3-NOTIFICATIONS/requirements/_MAP.md` | 162 |
| `docs/10-requirements/epics/EPIC-GAM-F3-NOTIFICATIONS/specifications/_MAP.md` | 171 |
| `docs/10-requirements/epics/EPIC-GAM-F3-NOTIFICATIONS/tasks/PLAN-CORRECCION-NOTIFICACIONES-2026-01-04.md` | 392 |
| `docs/10-requirements/epics/EPIC-GAM-F3-NOTIFICATIONS/tasks/PLAN-CORRECCION-SINCRONIZACION-2026-01-04.md` | 522 |
| `docs/10-requirements/epics/EPIC-GAM-F3-NOTIFICATIONS/tasks/_MAP.md` | 165 |
| `docs/10-requirements/epics/EPIC-GAM-F3-PARENT-NOTIFICATIONS/tasks/_MAP.md` | 36 |
| `docs/10-requirements/epics/EPIC-GAM-F3-PARENT-PORTAL/tasks/_MAP.md` | 36 |
| `docs/10-requirements/epics/EPIC-GAM-F3-PEER-CHALLENGES/tasks/_MAP.md` | 36 |
| `docs/10-requirements/epics/EPIC-GAM-F3-PROFILES/tasks/_MAP.md` | 36 |
| `docs/10-requirements/epics/EPIC-GAM-F3-REPORTS/tasks/_MAP.md` | 36 |
| `docs/10-requirements/epics/EPIC-GAM-F3-SOCIAL-GAMIFICATION/tasks/_MAP.md` | 52 |
| `docs/10-requirements/epics/EPIC-GAM-F3-WHITE-LABEL/tasks/_MAP.md` | 36 |

**Severidad:** MEDIUM — el sistema NEXUS actual es v4.1; estos `_MAP.md` aun referencian v3.4. Son documentos de tracking de tareas, su impacto operativo es bajo pero son inconsistentes.

---

### F-SYS-02 [MEDIUM] SIMCO v4.0.0 vs v4.3.0 — version inconsistente entre docs activos

**Situacion:**
- CLAUDE.md declara: `SIMCO v4.0.0`
- Multiples docs de portals y architecture usan: `SIMCO v4.3.0`

**Archivos con SIMCO v4.3.0 (posiblemente mas reciente que CLAUDE.md):**

| Archivo | Linea |
|---------|-------|
| `docs/20-architecture/schema-reference/11-missions.md` | 144 |
| `docs/30-ux-ui/flujos/student/FLUJO-LOGROS-MISIONES-CLAIM.md` | 227 |
| `docs/50-guides/integration/GUIA-TYPEORM-CROSS-DATASOURCE.md` | 255 |
| `docs/60-portals/student/specs/SPEC-ACHIEVEMENTS.md` | 241 |
| `docs/60-portals/student/specs/SPEC-API-CONTRACTS.md` | 295 |
| `docs/60-portals/student/specs/SPEC-DASHBOARD.md` | 268 |
| `docs/60-portals/student/specs/SPEC-EXERCISES.md` | 358 |
| `docs/60-portals/student/specs/SPEC-GAMIFICATION.md` | 274 |
| `docs/60-portals/student/specs/SPEC-MODULES.md` | 212 |
| `docs/60-portals/student/specs/SPEC-MULTIMEDIA.md` | 281 |
| `docs/60-portals/student/specs/SPEC-PDF-EXCEL.md` | 117 |
| `docs/60-portals/student/specs/SPEC-PROFILE.md` | 238 |
| `docs/60-portals/student/specs/SPEC-PROGRESS.md` | 233 |
| `docs/60-portals/student/specs/SPEC-SOCIAL.md` | 245 |
| `docs/60-portals/student/specs/_MAP.md` | 201 |

**Archivos con SIMCO v4.0.0 en docs activos:**
- `docs/10-requirements/VISION-ALCANCE.md` linea 3, 328
- `docs/00-overview/GLOSARIO.md` linea 134 (`v4.0.0`)
- `docs/40-standards/ESTANDAR-DIAGRAMAS-ER.md` linea 321
- `docs/70-onboarding/ONBOARDING-AGENTES.md` linea 188
- `docs/00-overview/REPORTE-INTEGRAL-2026-01-20.md` linea 4

**Analisis:** Hay dos versiones de SIMCO coexistiendo — v4.0.0 en docs mas antiguos y v4.3.0 en docs mas recientes (student specs generadas el 2026-02-21). La discrepancia sugiere que SIMCO se actualizo de v4.0 a v4.3 durante el proyecto, pero CLAUDE.md no se actualizo. La version canonica deberia ser v4.0.0 segun CLAUDE.md, o bien CLAUDE.md debe actualizarse a v4.3.0 si ese es el numero real actual.

**Severidad:** MEDIUM — crea confusion sobre que version del framework de gobernanza esta activa.

---

### F-SYS-03 [MEDIUM] GAMILIT v4.7.0 en documento de analisis

**Archivo:** `docs/50-guides/documentation-master/GAMILIT-DOCUMENTATION-MASTER/ANALISIS-HALLAZGOS-DETALLADO.md`
- Linea 5: `**Proyecto:** GAMILIT v4.7.0`

**CLAUDE.md declara version del proyecto:** No hay version de proyecto explicita en CLAUDE.md (solo `SIMCO v4.0.0 + NEXUS v4.1`). Sin embargo, es el unico documento que usa v4.7.0. Otros documentos usan `v4.0` o no especifican version del proyecto.

**Severidad:** MEDIUM — version de proyecto inconsistente y aislada en un documento de analisis.

---

### F-SYS-04 [MEDIUM] SIMCO v78 directivas vs CLAUDE.md que dice 72 archivos activos

**Archivo:** `docs/00-overview/directivas/_INDEX.md` linea 29: `SIMCO | 78 | orchestration/directivas/simco/`
**CLAUDE.md dice:** "72 archivos SIMCO activos (+15 en _archive)"

Esta discrepancia es entre el indice de directivas local (que puede estar desactualizado desde 2026-02-11) y CLAUDE.md (actualizado al 2026-02-27). Es coherente con la fecha desactualizada del archivo.

**Severidad:** MEDIUM — el _INDEX.md en docs/ tiene metricas de orchestration que no se actualizaron.

---

## SECCION 4: ENDPOINT COUNT INCONSISTENTE

### F-COUNT-01 [HIGH] Conteos de endpoints inconsistentes entre documentos activos

**El SSOT dice 912** (CLAUDE.md, MASTER_INVENTORY).

| Archivo | Valor | Estado |
|---------|-------|--------|
| `docs/10-requirements/VISION-ALCANCE.md` (linea 21, 277) | 912 | Correcto |
| `docs/70-onboarding/ONBOARDING-DESARROLLADORES.md` (linea 98) | 912 | Correcto |
| `docs/70-onboarding/ONBOARDING-AGENTES.md` (linea 80, 105) | 912 | Correcto |
| `docs/40-api/API-REFERENCE.md` (linea 10) | 901 | INCORRECTO |
| `docs/40-api/API-REFERENCE.md` (linea 548) | 901 | INCORRECTO |
| `docs/40-api/_INDEX.md` (linea 10) | 911 | INCORRECTO |
| `docs/40-api/README.md` (linea 11, 21) | 850 y 899 | INCORRECTO (dos valores!) |
| `docs/40-standards/ESTANDAR-SEGURIDAD.md` (linea 484, 1125, 1185) | 912 | Correcto |
| `docs/90-adr/ADR-035-sistema-saad.md` (linea 66) | 912 | Correcto |

**El README de la carpeta 40-api tiene dos valores distintos en el mismo archivo:**
- Linea 11: `850 endpoints organizados por modulo`
- Linea 21: `**Total Endpoints:** 899`

**Severidad:** HIGH — la carpeta de documentacion de API (`docs/40-api/`) tiene valores 850, 899, 901 y 911, ninguno de los cuales coincide con el SSOT de 912. Esto es directamente desorientador para cualquier lector.

---

## SECCION 5: METRICAS INTERNAS DESACTUALIZADAS

### F-METRICS-01 [MEDIUM] docs/00-overview/directivas/_INDEX.md — bloque de metricas obsoleto

**Archivo:** `docs/00-overview/directivas/_INDEX.md` (ultima actualizacion 2026-02-11)
**Lineas 62-83:** Bloque YAML de metricas con valores del inventario v7.0.0:

```yaml
Database:
  tablas: 170        # SSOT actual: 173
  rls_policies: 263  # SSOT actual: 251
  funciones: 255     # SSOT actual: 158
  triggers: 132      # SSOT actual: 68
  enums: 41          # SSOT actual: 42

Backend:
  modulos: 22        # SSOT actual: 23
  endpoints: 850     # SSOT actual: 912
  entities: 152      # SSOT actual: 156 files / 157 classes
  services: 170      # SSOT actual: 172
  controllers: 107   # SSOT actual: 108

Frontend:
  componentes: 458   # SSOT actual: 575
  hooks: 127         # SSOT actual: 132
  paginas: 85        # SSOT actual: 72 (metodologia diferente)
  stores: 32         # SSOT actual: 13
  portales: 4        # Correcto
```

**Severidad:** MEDIUM — este archivo es visible en `docs/` como indice de directivas. Todas las metricas de entidades estan incorrectas.

---

### F-METRICS-02 [LOW] 23 tipos de ejercicio vs 33 ENUM values — confusion semantica no resuelta en todos los docs

**Contexto:** Auditoria previa (2026-02-27) ya documentó que hay 33 valores en el ENUM `exercise_type` pero el sistema habla de "27 mecanicas GAMILIT" (convencion semantica). Sin embargo, multiples documentos activos aun dicen "23 tipos":

| Archivo | Texto |
|---------|-------|
| `docs/10-requirements/VISION-ALCANCE.md` (lineas 32, 72, 146, 248) | `23 tipos de ejercicios` |
| `docs/00-overview/MODULOS.md` (lineas 164, 166) | `23 tipos de ejercicios` |
| `docs/00-overview/GLOSARIO.md` (linea 65) | `23 tipos en total` |
| `docs/20-architecture/schema-reference/03-education.md` (linea 69) | `Uno de 23 tipos` |
| `docs/40-api/API-REFERENCE.md` (linea 126) | `Listar 23 tipos de ejercicio` |
| `docs/70-onboarding/ONBOARDING-DESARROLLADORES.md` (linea 167) | `23 tipos de ejercicio` |
| `docs/70-onboarding/ONBOARDING-QA.md` (linea 162) | `23 tipos en 5 modulos` |

**Nota:** Estos documentos fueron actualizados en diferentes momentos y algunos preguntan sobre la semantica vs la implementacion real. La convencion de "23 tipos" parece haber sido la original y nunca fue reemplazada sistematicamente. El GLOSARIO y el schema-reference son los mas problematicos por ser referencias tecnicas.

**Severidad:** LOW — el numero exacto es ambiguo por convencion, y existe nota en RF-EDU-001 aclarando "27 valores GAMILIT". Sin embargo, "23 tipos" en GLOSARIO y schema-reference crea confusion tecnica para nuevos desarrolladores.

---

## SECCION 6: ESTADO / PENDIENTES EN DOCUMENTACION

### F-STATUS-01 [LOW] TODO en specs de ejercicios

**Archivos con TODO en contenido de especificacion activo:**

| Archivo | Linea | Texto |
|---------|-------|-------|
| `docs/10-requirements/epics/EPIC-GAM-F1-EXERCISES/specifications/ET-EDU-002-niveles-dificultad.md` | 1139 | `{/* TODO: Renderizar pregunta actual */}` |
| `docs/10-requirements/epics/EPIC-GAM-F1-GAMIFICATION/specifications/ET-GAM-003-rangos-maya.md` | 1050 | `// TODO: Restringir a admin/analytics roles` |
| `docs/10-requirements/epics/EPIC-GAM-F3-ADMIN-EXTENDED/requirements/RF-EXT-002-SPRINTS-1-2-3.md` | 284, 529, 533 | `TODO en produccion: Generar token...`, `TODO: Implementar segun estrategia de cache`, `TODO: Implementar segun estrategia de sesiones` |

**Nota:** Los TODOs en linea 529 y 533 de RF-EXT-002 se refieren a decisiones de implementacion aun pendientes dentro del documento de requerimientos, no en codigo real. Representan features no decididas.

**Severidad:** LOW — son documentos de especificacion, no codigo. Sin embargo, si estas features estan implementadas en el codigo real, los TODOs en los requerimientos son stale.

---

### F-STATUS-02 [MEDIUM] Puerto 3001 para WebSocket — obsoleto vs. configuracion real

**Archivo:** `docs/10-requirements/epics/EPIC-GAM-F3-NOTIFICATIONS/user-stories/US-NOT-001a/US-NOT-001a-websocket-infrastructure.md`

| Linea | Texto |
|-------|-------|
| 38 | `WebSocket server con Socket.IO en puerto dedicado (3001)` |
| 69 | `Socket.IO server en puerto 3001 (separado de API REST en 3000)` |
| 218 | `const io = new Server(3001, {` |
| 345 | `[x] WebSocket server (Socket.IO) implementado en puerto 3001` |

**Realidad:** Segun CLAUDE.md, el backend corre en el puerto **3006** y Socket.IO esta integrado en el mismo servidor NestJS (no en un puerto separado 3001). El puerto 3000 (mencionado en linea 69 como "API REST") tampoco es correcto — el backend usa 3006.

**Severidad:** MEDIUM — esta user-story describe la arquitectura de WebSocket como un servidor separado en 3001, lo que contradice la arquitectura real donde Socket.IO corre en el mismo proceso NestJS en el puerto 3006.

---

### F-STATUS-03 [LOW] DIRECTIVA-GAMILIT-EJERCICIOS.md y DIRECTIVA-GAMILIT-GAMIFICACION.md marcadas como "Pendiente"

**Archivo:** `docs/00-overview/directivas/_INDEX.md` lineas 40-41:
```
DIRECTIVA-GAMILIT-EJERCICIOS.md   | Estructura de ejercicios educativos | Pendiente
DIRECTIVA-GAMILIT-GAMIFICACION.md | Sistema de gamificacion              | Pendiente
```

Estas directivas llevan marcadas como "Pendiente" desde la creacion del indice (al menos desde 2026-02-11). Si nunca se van a crear, la entrada deberia eliminarse o marcarse como "Descartado".

**Severidad:** LOW — no bloquea nada, pero el indice lista entradas que no existen.

---

## SECCION 7: REFERENCIAS DE PUERTO INCORRECTAS

### F-PORT-01 [MEDIUM] localhost:3000 en documentos de configuracion de desarrollo

Varios documentos de guias de implementacion usan `localhost:3000` como URL base del backend, cuando el backend real corre en el puerto **3006**.

| Archivo | Linea | Texto |
|---------|-------|-------|
| `docs/50-guides/frontend/impl/API-INTEGRATION.md` | 23 | `http://localhost:3000/api/v1` |
| `docs/50-guides/frontend/impl/API-INTEGRATION.md` | 373 | `http://localhost:3000` (WS) |
| `docs/50-guides/frontend/impl/ESTRUCTURA-SHARED.md` | 380 | `http://localhost:3000/api/v1` |
| `docs/50-guides/frontend/impl/SETUP-DEVELOPMENT.md` | 48 | `VITE_API_URL=http://localhost:3000/api/v1` |
| `docs/50-guides/frontend/impl/SETUP-DEVELOPMENT.md` | 51 | `VITE_WS_URL=http://localhost:3000` |
| `docs/50-guides/frontend/impl/SETUP-DEVELOPMENT.md` | 220 | `target: 'http://localhost:3000'` (proxy) |
| `docs/40-api/ADMIN-PORTAL-ENDPOINTS.md` | 174, 182 | `http://localhost:3000/api/admin/...` |
| `docs/40-standards/ESTANDAR-API.md` | 303, 1170 | `http://localhost:3000` |
| `docs/60-portals/student/specs/gaps/STUDENT-GAP-*.md` | multiple | `http://localhost:3000/api/...` |

**Nota:** El archivo `docs/40-api/README.md` linea 19 si dice correctamente `http://localhost:3006 (dev)`. La discrepancia es grande en los archivos de guias de frontend.

**Severidad:** MEDIUM — Un nuevo desarrollador que siga SETUP-DEVELOPMENT.md configurara `VITE_API_URL=http://localhost:3000/api/v1` y no podra conectarse al backend real en 3006.

---

## SECCION 8: REFERENCIAS A VERSIONES DE DOCUMENTOS INEXISTENTES

### F-REF-01 [LOW] "Documento de Diseno v6.1" referenciado en gamification pero no existe en el repo

**Archivos:**
- `docs/10-requirements/epics/EPIC-GAM-F3-SOCIAL-GAMIFICATION/requirements/RF-GAM-011-multiplicador-mlcoins.md` linea 27
- `docs/10-requirements/epics/EPIC-GAM-F3-SOCIAL-GAMIFICATION/requirements/RF-SOC-001-sistema-amigos.md` linea 329
- `docs/10-requirements/epics/EPIC-GAM-F3-SOCIAL-GAMIFICATION/specifications/ET-SOC-001-sistema-amigos.md` linea 726
- `docs/10-requirements/epics/EPIC-GAM-F3-SOCIAL-GAMIFICATION/specifications/ET-SOC-002-gremios.md` linea 1317

Todos referencian `Documento de Diseno v6.1` como fuente de verdad para multiplicadores y gremios, pero no existe tal documento en el repositorio.

**Severidad:** LOW — referencia externa perdida.

---

## SECCION 9: RESUMEN CONSOLIDADO DE HALLAZGOS POR SEVERIDAD

### HIGH (requieren atencion — activamente engañosos)

| ID | Descripcion | Archivos afectados |
|----|-------------|-------------------|
| F-TECH-01 | PostgreSQL 16 en PLANs activos (deberia ser 15) | ~21 PLAN.md + 2 EPIC.md |
| F-TECH-02 | Vite 7.x en PLANs activos (deberia ser 6.x) | ~8 PLAN.md + 1 EPIC.md |
| F-COUNT-01 | Endpoint count inconsistente en docs/40-api/ (850/899/901/911 vs SSOT 912) | docs/40-api/README.md, API-REFERENCE.md, _INDEX.md |

### MEDIUM (desactualizados pero contextualizables)

| ID | Descripcion | Archivos afectados |
|----|-------------|-------------------|
| F-TECH-03 | React 18 en user-stories activas y ASSIGNMENTS-SPEC | 3 archivos |
| F-TECH-04 | NestJS @10, React 18, Zustand 4, Tailwind 3 en US-FUND-004 | 1 archivo (multi-stale) |
| F-TECH-06 | PostgreSQL 14 en GUIA-CREAR-BASE-DATOS | 1 archivo |
| F-TECH-07 | PostgreSQL 14+ en ET-EXT-002-ARQUITECTURA-TECNICA | 1 archivo |
| F-SYS-01 | NEXUS v3.4 en _MAP.md (deberia ser v4.1) | ~15 archivos |
| F-SYS-02 | SIMCO v4.0.0 vs v4.3.0 inconsistente | ~20 archivos |
| F-SYS-03 | GAMILIT v4.7.0 en ANALISIS-HALLAZGOS | 1 archivo |
| F-SYS-04 | SIMCO 78 directivas vs CLAUDE.md 72 | 1 archivo |
| F-METRICS-01 | Metricas obsoletas en docs/00-overview/directivas/_INDEX.md | 1 archivo |
| F-STATUS-02 | Puerto 3001 para WebSocket (backend real: 3006) | 1 user-story |
| F-PORT-01 | localhost:3000 en guias de setup (backend real: 3006) | ~9 archivos |

### LOW (cosmeticos o contextualizables)

| ID | Descripcion | Archivos afectados |
|----|-------------|-------------------|
| F-TECH-05 | TailwindCSS 3 aislado en US-FUND-004 | 1 archivo (mismo que F-TECH-04) |
| F-TECH-08 | Node.js 18+ vs 20.x en guias | 3 archivos |
| F-METRICS-02 | "23 tipos ejercicio" semanticamente impreciso | ~8 archivos |
| F-STATUS-01 | TODO inline en specs activas | 3 archivos |
| F-STATUS-03 | Directivas marcadas "Pendiente" probablemente descartadas | 1 indice |
| F-REF-01 | Referencia a "Documento de Diseno v6.1" inexistente | 4 archivos |

---

## SECCION 10: ANALISIS DE MANTENIMIENTO (GIT LOG)

**`git log --since="2026-01-01" --oneline -- docs/` (30 commits recientes):**

Docs con actividad reciente activa (2026-02):
- `docs/20-architecture/` — actualizado en commits recientes (responsive, ambientes)
- `docs/90-adr/` — ADR-050 nuevo en sprint actual
- `docs/10-requirements/epics/EPIC-GAM-F1-EXERCISES/` — actualizado en auditoria BD
- `docs/70-onboarding/` — actualizado en `[GAM-DOC]` commit de enero 2026

Docs con poca actividad reciente (potencialmente stale):
- `docs/10-requirements/epics/*/PLAN.md` — no aparecen en commits de 2026 (contienen PG 16/Vite 7)
- `docs/10-requirements/epics/EPIC-GAM-F3-NOTIFICATIONS/user-stories/` — no actualizados en 2026
- `docs/50-guides/frontend/impl/` — algunos archivos sin cambios en 2026
- `docs/60-portals/student/specs/gaps/` — gaps con localhost:3000

**Conclusion de mantenimiento:** Los PLAN.md de epics y los `_MAP.md` de tasks son los documentos mas huerfanos — creados en la fase inicial del proyecto y nunca actualizados con las versiones reales del stack.

---

## NOTAS METODOLOGICAS

1. **PostgreSQL 16 vs 15:** El proyecto originalmente planeaba PG 16. En algun punto se cambio a PG 15 (version LTS mas estable en ese momento). Los PLAN.md nunca fueron actualizados para reflejar el cambio.

2. **Vite 7 vs 6:** Identico patron. El proyecto planeaba Vite 7 pero se implemento con Vite 6.x (version actual estable al momento de desarrollo).

3. **SIMCO versions:** v4.0.0, v4.3.0 coexisten porque diferentes agentes con distintas versiones de CLAUDE.md generaron documentacion en periodos diferentes.

4. **"23 tipos" de ejercicio:** El numero "23" fue el total en un momento dado del proyecto. El ENUM actual tiene 33 valores. El sistema de documentacion menciona "27 mecanicas GAMILIT" como semantica aceptada en RF-EDU-001. Los docs que dicen "23" son los que no fueron actualizados en la auditoria de 2026-02-27.

---

*Auditoria P2-2A-2 completada: 2026-02-27 | READ-ONLY | Sin modificaciones | SIMCO ANALYSIS mode*
