---
titulo: Catálogo de Archivos Sobredimensionados
tipo: reporte
fecha_creacion: 2026-02-28
ultima_actualizacion: 2026-02-28
autor: Claude Code Analysis Agent
scope: docs/
umbral_lineas: 850
---

# Catálogo de Archivos >850 Líneas

## Resumen

- **Total archivos:** 32
- **SPLIT:** 11
- **KEEP:** 6
- **EXTRACT_TABLES:** 5
- **REDIRECT+ARCHIVE:** 10

---

## Críticos (>1500 líneas)

| Archivo | Líneas | Decisión | Razón |
|---------|--------|----------|-------|
| `docs/60-portals/admin/PORTAL-ADMIN-GUIDE.md` | 2235 | SPLIT | 16 H2 secciones independientes: arquitectura, páginas, API, hooks, stores, flujos, gamificación, operaciones masivas, alertas, analytics, configuración. Cada sección es un doc standalone. |
| `docs/60-portals/student/PORTAL-STUDENT-GUIDE.md` | 1850 | SPLIT | 18 H2 secciones: arquitectura, páginas, gamificación, ejercicios (5 módulos × tipos), API, hooks, stores, testing, flows. Los 5 módulos educativos son separables por completo. |
| `docs/40-api/API-REFERENCE.md` | 1682 | SPLIT | 31 H2 secciones (1 por módulo backend: auth, users, tenants, gamification, leaderboard, etc.). Cada módulo es una unidad autónoma de referencia API. Patrón ya existe: ver `PORTAL-TEACHER-API-REFERENCE.md`, `PORTAL-ADMIN-API-REFERENCE.md`. |
| `docs/60-portals/student/specs/_archived/gaps/STUDENT-GAP-007-settings-persistence.md` | 1292 | REDIRECT+ARCHIVE | Gap histórico P0 resuelto (2025-11-24). Archivado en `_archived/gaps/`. Documento de tarea completada. El contenido operativo vive en código; la traza histórica es de bajo valor activo. |
| `docs/50-guides/testing/exercise-guides/GUIA-PRUEBAS-MODULO-1.md` | 1345 | KEEP | Cohesivo: guía de QA completa para un único módulo (5 ejercicios del M1). No es separable sin perder contexto. Las 11 H2 son secciones del mismo ejercicio/módulo educativo. |
| `docs/50-guides/testing/exercise-guides/GUIA-PRUEBAS-MODULO-3.md` | 1323 | KEEP | Igual que M1: guía QA cohesiva para un solo módulo. 5 ejercicios de comprensión crítica con evaluación manual docente. No separable. |
| `docs/50-guides/backend/GUIA-DESIGN-PATTERNS-NESTJS.md` | 1206 | SPLIT | 12 H2 (10 patrones GoF + índice + frontend patterns). Cada patrón (Factory, Strategy, Adapter, Decorator, Observer, Builder, Singleton, Template Method, Repository, Frontend) es autocontenido y separable en `design-patterns/`. |
| `docs/50-guides/deployment/_archived/GUIA-DESPLIEGUE-PRODUCCION-COMPLETA.md` | 1213 | REDIRECT+ARCHIVE | Marcado explícitamente `DEPRECATED` (2026-02-24). El SSOT vigente es `orchestration/referencias/MATRIZ-SSOT-DEV-PROD.md` + `PERFIL-DEPLOY-SERVER.md`. Candidato a eliminación, no solo archivo. |
| `docs/60-portals/student/specs/STUDENT-HOOKS-SPEC.md` | 1243 | SPLIT | 10 H2 (14 hooks en 5 categorías: Data Fetching, State Management, UI/UX, Gamification, Profile). Cada categoría de hooks es separable en su propio archivo `hooks/`. |
| `docs/50-guides/testing/exercise-guides/GUIA-PRUEBAS-MODULO-2.md` | 1242 | KEEP | Cohesivo: guía QA para M2 Comprensión Inferencial (5 ejercicios). Patrón idéntico a M1/M3. No separable sin pérdida de contexto por ejercicio. |
| `docs/60-portals/student/specs/traces/TRACE-P0-CORRECTIONS.md` | 1227 | REDIRECT+ARCHIVE | Traza histórica de sesión de corrección P0 (2025-11-24, ~7.5 horas). 12 H2 pero todas documentan el proceso de ejecución de una tarea ya completada. Valor de auditoría sólo. |

---

## Altos (850–1500 líneas)

| Archivo | Líneas | Decisión | Razón |
|---------|--------|----------|-------|
| `docs/60-portals/teacher/PORTAL-TEACHER-API-REFERENCE.md` | 1199 | SPLIT | 14 H2 (uno por controlador backend: Dashboard, Classrooms, Assignments, Alerts, AlertConfig, ManualReview, Communication, Content, ExerciseResponses, Grades + extras). Cada controlador es un bloque autónomo de API reference. |
| `docs/50-guides/backend/GUIA-RUNBOOK-POSTGRESQL.md` | 1039 | SPLIT | 11 H2 separables: Entorno, Operaciones Rutinarias, Backups, Recuperación, Performance, Monitoring, Seguridad, Vacío/Análisis, Scripts, Troubleshooting, Referencia Rápida. Runbook debería partirse en secciones operativas (operaciones, backup/recovery, performance/monitoring) |
| `docs/50-guides/testing/exercise-guides/GUIA-PRUEBAS-MODULO-4.md` | 1002 | KEEP | Cohesivo: guía QA para M4 Lectura Digital (5 ejercicios + nota crítica de revisión manual docente). Mismo patrón que M1-M3. |
| `docs/50-guides/testing/exercise-guides/GUIA-PRUEBAS-MODULO-5.md` | 990 | KEEP | Cohesivo: guía QA para M5 Producción Creativa (3 ejercicios + nota que solo se necesita completar 1 de 3). |
| `docs/50-guides/frontend/GUIA-DETECTIVE-THEME.md` | 981 | SPLIT | 18 H2 separables: Arquitectura del Tema, CSS Custom Properties, Tailwind Config, Clases Compuestas, Componentes React Wrapper, Tokens de Colores, Tipografía, Espaciado, Animaciones, Rangos Maya CSS, Responsive, Dark Mode, Testing Visual, Migraciones, Ejemplos, Troubleshooting, Checklists. Podría separarse en `detective-theme/` (tokens, componentes, rangos, guías uso). |
| `docs/60-portals/student/specs/inventory/IMPLEMENTATIONS-2025-11-24.md` | 974 | REDIRECT+ARCHIVE | Inventario de implementación de correcciones P0 de noviembre 2025. 10 H2 documentando archivos creados/modificados de una tarea ya completada. Valor histórico de baja utilidad activa; complementa TRACE-P0-CORRECTIONS.md. |
| `docs/60-portals/admin/PORTAL-ADMIN-API-REFERENCE.md` | 922 | SPLIT | 6 H2 pero el contenido es muy extenso por sección. Cubre 21 controladores backend agrupados en módulos: Users, Organizations, Gamification, System Config, Analytics, Roles. Cada módulo es separable. |
| `docs/20-architecture/schema-reference/03-education.md` | 940 | KEEP | Una sola unidad temática: el schema `educational_content` (24 tablas DDL-accurate). Solo 2 H2 reales (Tablas Core, Tablas Auxiliares). El volumen es por la densidad de las tablas de columnas. No separable sin romper la coherencia del schema. |
| `docs/40-standards/ESTANDAR-API.md` | 1253 | SPLIT | 10 H2 completamente independientes: RESTful Conventions, Request/Response Format, HTTP Status Codes, Versionado, Autenticación/Autorización, Rate Limiting, Swagger/OpenAPI, Error Handling, Performance, Security. Cada sección puede vivir en `estandar-api/`. |
| `docs/40-standards/ESTANDAR-FRONTEND-PROFESIONAL.md` | 1147 | SPLIT | 9 H2: Component Patterns, State Management, Performance, Testing, Accessibility, Error Handling, Code Quality, TypeScript Patterns, CSS/Styling. Patrón ya establecido con `backend-profesional/` (subdirectorio con 8 archivos). Debería crearse `frontend-profesional/` análogamente. |
| `docs/40-standards/ESTANDAR-SEGURIDAD-WEB.md` | 993 | SPLIT | 8 H2: OWASP Top 10 (A01–A10) — cada categoría OWASP es independiente. Complementa ESTANDAR-SEGURIDAD-API.md. Separable en `seguridad/web/A01-*.md` … `A10-*.md`. |
| `docs/50-guides/deployment/_archived/DEPLOYMENT-MASTER.md` | 1081 | REDIRECT+ARCHIVE | Marcado explícitamente `DEPRECATED` (2026-02-24). "Consolidado desde 8 documentos previos" — su razón de existir ya fue cumplida. SSOT vigente en `orchestration/`. Candidato a eliminación con registro en ADR. |
| `docs/60-portals/student/specs/dependencies/DEPENDENCY-MATRIX.md` | 1119 | KEEP | Cohesivo: matriz bidireccional de dependencias (CONSUME / ES CONSUMIDO POR) de los 8 componentes de las correcciones P0. Estructura en árbol jerárquico que pierde sentido si se fragmenta. 8 H2 pero cada uno describe un componente único. |
| `docs/40-standards/ESTANDAR-SEGURIDAD-API.md` | 857 | SPLIT | 3 H2 principales pero muy denso: OWASP API Security Top 10 (10 subsecciones de nivel 3 desarrolladas en profundidad). Separable en `seguridad/api/API1-*.md` … `API10-*.md` paralelo al ESTANDAR-SEGURIDAD-WEB.md. |
| `docs/40-standards/ESTANDAR-TESTING-UNIT.md` | 817 | SPLIT | 8 H2 separables: Pirámide de Testing, Naming Conventions, Structure AAA, Mocking Strategies, Test Data Factories, Async Testing, Snapshot Testing, Coverage. Ya existe patrón de separación (referencias cruzadas con ESTANDAR-TESTING-INTEGRATION.md, ESTANDAR-TESTING-E2E.md). |
| `docs/40-standards/ESTANDAR-12-FACTOR-APP.md` | 755 | KEEP | Una sola unidad coherente: auditoría de los 12 factores contra el estado actual de gamilit. 17 H2 pero todos son factores del mismo estándar metodológico (I–XII + secciones de plan). No tiene sentido separar "Factor I" de "Factor II" en docs distintos. |
| `docs/50-guides/testing/GUIA-E2E-PLAYWRIGHT.md` | 1168 | SPLIT | 13 H2 separables: Setup Inicial, Configuración Playwright, Estructura de Proyectos, Page Objects, Tests por Portal (Student/Teacher/Admin/Parents), Tests de Ejercicios, Tests de Gamificación, Visual Regression, CI/CD Integration, Debugging, Best Practices. Podría separarse en `e2e/portales/`, `e2e/ejercicios/`, `e2e/ci/`. |
| `docs/20-architecture/schema-reference/05-social.md` | 892 | EXTRACT_TABLES | 9 H2 (agrupaciones temáticas del schema social_features: Instituciones, Grupos, Usuarios Sociales, Interacciones, Rankings, Misiones, Logros, Notificaciones, Comunicación). El volumen es 100% tablas de referencia de columnas. Candidato a separar por agrupación temática o extraer tablas de referencia a archivos separados. |
| `docs/60-portals/student/specs/README.md` | 858 | EXTRACT_TABLES | 15 H2, actúa como índice maestro del portal student con métricas, gaps históricos, inventario de specs, guías de uso. Mezcla de índice navegable + tablas de métricas + estado de gaps. Las tablas de métricas (Gaps P0, Gaps de Coherencia, estado por categoría) podrían extraerse a un `STATUS.md` separado. |
| `docs/60-portals/student/specs/_archived/gaps/STUDENT-GAP-008-backend-statistics.md` | 905 | REDIRECT+ARCHIVE | Gap histórico P0 resuelto (2025-11-24). Igual que GAP-007: archivado, tarea completada, valor de referencia únicamente. Ambos gaps (007+008) representan 2197 líneas combinadas de documentación de trabajo ya terminado. |
| `docs/50-guides/deployment/_archived/DEPLOYMENT.md` | 870 | REDIRECT+ARCHIVE | Versión anterior del Deployment Guide (18 H2, ~Nov 2025). Supersedido por DEPLOYMENT-MASTER.md (también deprecated) y luego por la SSOT vigente en `orchestration/`. Tercera copia del mismo contenido de deployment. |
| `docs/60-portals/teacher/PORTAL-TEACHER-GUIDE.md` | 937 | SPLIT | 11 H2 independientes: Visión General, Arquitectura (16 páginas), Patrones (PageShell, Tabs, Lazy Loading), Estado (React Query + Zustand), API Reference, Autenticación, Componentes Compartidos, Testing, Flujos Críticos, Deployment, Changelog. Las secciones de Arquitectura/API Reference/Testing son claramente separables. |

---

## Notas de Clasificación

### Criterios Aplicados

**SPLIT** — Se asigna cuando:
- Tiene >3 H2 secciones distintas Y
- Las secciones son conceptualmente independientes (no dependen del contexto de otras para entenderse) Y
- Existe ya un patrón de separación en el proyecto (e.g., `backend-profesional/` como precedente)

**KEEP** — Se asigna cuando:
- El contenido forma un único flujo narrativo/técnico (e.g., guía QA de un módulo completo), O
- La separación destruiría la coherencia del documento (e.g., schema reference con tablas interrelacionadas), O
- Las secciones son variaciones del mismo patrón dentro de un único dominio

**EXTRACT_TABLES** — Se asigna cuando:
- El volumen excede 850 líneas principalmente por tablas de referencia masivas (columnas DDL, métricas de estado), Y
- Las tablas podrían vivir en archivos de referencia separados con links desde el doc principal

**REDIRECT+ARCHIVE** — Se asigna cuando:
- El documento está marcado `DEPRECATED` explícitamente, O
- El documento es una traza histórica de una tarea ya completada, O
- El contenido está completamente duplicado en el SSOT vigente

### Prioridad de Acción Sugerida

| Prioridad | Archivos | Razón |
|-----------|----------|-------|
| Alta | `DEPLOYMENT-MASTER.md`, `GUIA-DESPLIEGUE-PRODUCCION-COMPLETA.md`, `DEPLOYMENT.md` | Deprecated explícito, 3 copias del mismo contenido (~3164 líneas). Eliminar o colapsar a stub con redirect. |
| Alta | `TRACE-P0-CORRECTIONS.md`, `IMPLEMENTATIONS-2025-11-24.md`, `STUDENT-GAP-007-*.md`, `STUDENT-GAP-008-*.md` | Tareas históricas completadas en nov 2025. Ya están en `_archived/`. ~4424 líneas combinadas. |
| Media | `ESTANDAR-API.md`, `ESTANDAR-FRONTEND-PROFESIONAL.md` | Seguir patrón ya establecido: crear subdirectorios `api-standard/` y `frontend-profesional/` análogos a `backend-profesional/`. |
| Media | `PORTAL-ADMIN-GUIDE.md`, `PORTAL-STUDENT-GUIDE.md` | Portales más grandes. Split por secciones lógicas (arquitectura, páginas, API, testing). |
| Baja | `GUIA-PRUEBAS-MODULO-*.md` (todos 5) | Cohesivos y útiles tal como están. Solo actuar si el tamaño impacta carga cognitiva en QA. |
