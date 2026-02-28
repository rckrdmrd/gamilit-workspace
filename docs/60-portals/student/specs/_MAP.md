---
titulo: "Mapa de Documentacion - Student Portal"
tipo: mapa-navegacion
fecha_creacion: "2025-10-01"
ultima_actualizacion: "2026-02-28"
estado: activo
---

# MAPA DE DOCUMENTACION - STUDENT PORTAL

**Proyecto:** GAMILIT
**Modulo:** Student Portal
**Ultima actualizacion:** 2026-01-24
**Version:** 2.0.0

---

## ESTRUCTURA DE DOCUMENTACION

```
docs/50-guides/student-portal/
|
+-- README.md                    <- Documento principal (este directorio)
+-- _MAP.md                      <- Mapa de navegacion (este archivo)
+-- AUTH-PAGES-SPEC.md           <- Especificacion paginas autenticacion
|
+-- SPEC-*.md                    <- Especificaciones por dominio (FASE 2)
|   +-- SPEC-DASHBOARD.md        <- Dashboard: componentes, hooks, APIs
|   +-- SPEC-EXERCISES.md        <- Ejercicios: auto-save, power-ups, submit
|   +-- SPEC-GAMIFICATION.md     <- Ranks, ML Coins, Missions, Shop
|   +-- SPEC-ACHIEVEMENTS.md     <- Logros: 9 categorias, 4 raridades
|   +-- SPEC-PROFILE.md          <- Perfil: settings, 2FA, dispositivos
|   +-- SPEC-SOCIAL.md           <- Social: amigos, guilds, notificaciones
|   +-- SPEC-PROGRESS.md         <- Progreso: modulos, streaks, actividad
|   +-- SPEC-MODULES.md          <- Modulos educativos, prerequisitos
|   +-- SPEC-API-CONTRACTS.md    <- Contratos API: 80+ endpoints
|   +-- SPEC-MULTIMEDIA.md       <- Multimedia: avatars, iconos, animaciones
|   +-- SPEC-PDF-EXCEL.md        <- Generacion archivos (limitado)
|
+-- analysis/                    <- Analisis de implementacion
|   +-- (documentos de analisis)
|
+-- gaps/                        <- Documentacion de gaps resueltos
|   +-- STUDENT-GAP-001-missions-rewards.md
|   +-- STUDENT-GAP-002-missions-update-progress.md
|   +-- STUDENT-GAP-006-profile-stats.md
|   +-- STUDENT-GAP-007-settings-persistence.md
|   +-- STUDENT-GAP-008-backend-statistics.md
|
+-- inventory/                   <- Inventarios de implementacion
|   +-- IMPLEMENTATIONS-2025-11-24.md
|
+-- dependencies/                <- Matrices de dependencias
|   +-- DEPENDENCY-MATRIX.md
|
+-- traces/                      <- Trazas de ejecucion
    +-- TRACE-P0-CORRECTIONS.md
    +-- TRACE-GAP-002.md
    +-- TRACE-GAP-008.md
```

---

## ESPECIFICACIONES POR DOMINIO (SPEC-*.md)

Las especificaciones SPEC-*.md documentan completamente cada dominio funcional del Student Portal, incluyendo: paginas, componentes, hooks, APIs consumidas, tipos de datos, y gaps conocidos.

| Documento | Dominio | Contenido Principal |
|-----------|---------|---------------------|
| `SPEC-DASHBOARD.md` | Dashboard | DashboardComplete, StatsGrid, ModulesSection, 4 APIs |
| `SPEC-EXERCISES.md` | Ejercicios | ExercisePage, Auto-save, Power-ups, 8+ mecánicas |
| `SPEC-GAMIFICATION.md` | Gamificación | Ranks Maya, ML Coins, Missions, Shop, Leaderboard |
| `SPEC-ACHIEVEMENTS.md` | Logros | 9 categorías, 4 raridades, AchievementToast |
| `SPEC-PROFILE.md` | Perfil | ProfilePage, Settings, 2FA (MOCK), Dispositivos |
| `SPEC-SOCIAL.md` | Social | Friends, Guilds, Notifications WebSocket |
| `SPEC-PROGRESS.md` | Progreso | Streaks, estadísticas, actividad reciente |
| `SPEC-MODULES.md` | Módulos | Prerequisitos, estados, recompensas |
| `SPEC-API-CONTRACTS.md` | APIs | 80+ endpoints, tipos, códigos de error |
| `SPEC-MULTIMEDIA.md` | Multimedia | Avatars, iconos, animaciones, accesibilidad |
| `SPEC-PDF-EXCEL.md` | Exportación | Capacidades limitadas, planificación futura |

---

## DOCUMENTOS RELACIONADOS (EXTERNOS)

### Analisis (orchestration/analisis/)

| Documento | Proposito |
|-----------|-----------|
| `ANALISIS-STUDENT-PORTAL-COMPLETO-2026-01-20.md` | Analisis integral de 27 paginas |
| `EVALUACION-ENDPOINTS-CONSOLIDADOS.md` | Evaluacion GAP-SP-005 |

### Estandares (docs/40-estandares/)

| Documento | Proposito |
|-----------|-----------|
| `ESTANDAR-NOMENCLATURA-API.md` | Estandar snake_case/camelCase - 100+ campos |

### Especificaciones de Mecanicas (docs/80-references/transversal/mecanicas/)

| Documento | Proposito |
|-----------|-----------|
| `SPEC-MECANICAS-M1-M3.md` | 23 mecanicas basicas (Modulos 1-3) |
| `SPEC-MECANICAS-M4.md` | 5 mecanicas avanzadas (Modulo 4) |
| `SPEC-MECANICAS-M5.md` | 2 mecanicas creativas (Modulo 5) |
| `SPEC-MECANICAS-EJERCICIOS.md` | Indice general de mecanicas |

### Testing (orchestration/testing/)

| Documento | Proposito |
|-----------|-----------|
| `TESTING-PLAN-STUDENT-PORTAL.md` | Plan de testing: 13% -> 25% -> 40% |

### Inventarios (orchestration/inventarios/)

| Documento | Proposito |
|-----------|-----------|
| `FRONTEND_INVENTORY.yml` | 575 componentes, 132 hooks, 65 APIs |
| `BACKEND_INVENTORY.yml` | 914 endpoints documentados |

### Tareas (orchestration/tareas/)

| Documento | Proposito |
|-----------|-----------|
| `TASK-2026-01-20-STUDENT-PORTAL-ANALYSIS/` | Tarea de analisis integral |

---

## GUIA DE NAVEGACION POR ROL

### Product Owner / Stakeholder

1. Comenzar por: `README.md` (Resumen Ejecutivo)
2. Revisar: `inventory/IMPLEMENTATIONS-2025-11-24.md`
3. Consultar: `orchestration/analisis/ANALISIS-STUDENT-PORTAL-COMPLETO-2026-01-20.md`

### Desarrollador Frontend

1. Comenzar por: `SPEC-DASHBOARD.md` (componentes principales)
2. Revisar: `SPEC-EXERCISES.md` (flujo de ejercicios)
3. Revisar: `SPEC-GAMIFICATION.md` (sistema de recompensas)
4. Consultar: `SPEC-API-CONTRACTS.md` (endpoints consumidos)
5. Referencias legacy: `gaps/STUDENT-GAP-006-profile-stats.md`

### Desarrollador Backend

1. Comenzar por: `SPEC-API-CONTRACTS.md` (contratos de API)
2. Revisar: `SPEC-GAMIFICATION.md` (lógica de gamificación)
3. Revisar: `SPEC-SOCIAL.md` (endpoints sociales)
4. Consultar: `docs/40-estandares/ESTANDAR-NOMENCLATURA-API.md`

### QA / Tester

1. Comenzar por: `orchestration/testing/TESTING-PLAN-STUDENT-PORTAL.md`
2. Revisar: Secciones "Validacion" en cada gap
3. Consultar: `traces/TRACE-P0-CORRECTIONS.md`

### Arquitecto / Tech Lead

1. Comenzar por: `dependencies/DEPENDENCY-MATRIX.md`
2. Revisar: `orchestration/analisis/ANALISIS-STUDENT-PORTAL-COMPLETO-2026-01-20.md`
3. Consultar: `orchestration/analisis/EVALUACION-ENDPOINTS-CONSOLIDADOS.md`

---

## ESTADO DE GAPS (2026-01-20)

### Gaps Historicos (2025-11) - RESUELTOS

| Gap | Estado |
|-----|--------|
| GAP-001 | RESUELTO |
| GAP-002 | RESUELTO |
| GAP-006 | RESUELTO |
| GAP-007 | RESUELTO |
| GAP-008 | RESUELTO |

### Gaps de Coherencia (2026-01) - POST ANALISIS

| Gap | Severidad | Estado |
|-----|-----------|--------|
| GAP-SP-001 | CRITICO | VERIFICADO |
| GAP-SP-002 | CRITICO | CORREGIDO |
| GAP-SP-003 | ALTO | CORREGIDO |
| GAP-SP-004 | ALTO | DOCUMENTADO |
| GAP-SP-005 | MEDIO | PARCIAL GO |
| GAP-SP-006 | MEDIO | PLAN CREADO |
| GAP-SP-007 | BAJO | BACKLOG |
| GAP-SP-008 | BAJO | DOCUMENTADO |

---

## HISTORIAL DE ACTUALIZACIONES

| Fecha | Version | Cambios |
|-------|---------|---------|
| 2026-01-20 | 1.0.0 | Creacion inicial del mapa de documentacion |
| 2026-01-20 | - | Integracion de resultados FASE 1-2-3 |
| 2026-01-20 | - | Referencias a 6 documentos nuevos |
| 2026-01-20 | 1.1.0 | Agregado AUTH-PAGES-SPEC.md (4 paginas autenticacion) |
| 2026-01-24 | 2.0.0 | **FASE 2 COMPLETADA:** 11 archivos SPEC-*.md agregados |
| 2026-01-24 | - | Especificaciones completas por dominio funcional |
| 2026-01-24 | - | Contratos API documentados (80+ endpoints) |
| 2026-01-24 | - | Gaps identificados y documentados (85+) |

---

_Mapa generado: 2026-01-24_
_Sistema SIMCO v4.0.0_
