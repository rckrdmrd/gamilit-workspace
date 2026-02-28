---
titulo: Análisis de Solapamiento entre Secciones
tipo: reporte
fecha_creacion: 2026-02-28
autor: Claude Sonnet 4.6 (análisis read-only)
---

# Análisis de Solapamiento entre Secciones

## Resumen

- **Pares analizados:** 7
- **REDIRECT (ya resuelto):** 3
- **DIFFERENTIATE:** 3
- **NO_OVERLAP:** 1
- **MERGE:** 0

---

## Hallazgos Detallados

### Par 1: `docs/00-overview/MODULOS.md` vs `docs/00-overview/MODULOS-EDUCATIVOS.md`

- **Decision:** DIFFERENTIATE
- **Justificacion:**
  - `MODULOS.md` (462 líneas) es el catálogo canónico de los **23 módulos backend** (infraestructura + educativos + gamificación + soporte). Cubre entities, endpoints, services, controllers y estado por módulo, con una tabla métrica completa al final.
  - `MODULOS-EDUCATIVOS.md` (32 líneas) es un stub de **resumen pedagógico** que cubre únicamente los 5 módulos educativos (M1–M5) con su foco didáctico y conteo de ejercicios. Actúa como entrada de la sección 00-overview para la dimensión pedagógica.
  - El solapamiento real es mínimo: `MODULOS.md` incluye los módulos #8–#12 del área educativa (modules, exercises, content, classrooms, students) pero desde perspectiva técnica backend, no pedagógica.
  - `MODULOS-EDUCATIVOS.md` no duplica sino que complementa — es la vista curricular.
- **Riesgo detectado:** El nombre `MODULOS.md` puede confundirse con el nombre `MODULOS-EDUCATIVOS.md` cuando alguien busca información sobre los módulos de aprendizaje. El propósito de cada documento no está declarado explícitamente en su encabezado.
- **Accion recomendada:** Agregar a cada archivo un bloque `> Propósito:` que deja claro en la primera línea legible qué dimensión cubre. Ejemplo para `MODULOS.md`: `> Catálogo técnico de los 23 módulos backend (NestJS).` Ejemplo para `MODULOS-EDUCATIVOS.md`: `> Resumen pedagógico de los 5 módulos de comprensión lectora (M1–M5).`

---

### Par 2: `docs/00-overview/VISION.md` vs `docs/10-requirements/VISION-ALCANCE.md`

- **Decision:** REDIRECT (ya resuelto en parte — verificar completitud)
- **Justificacion:**
  - `docs/00-overview/VISION-ALCANCE.md` (12 líneas) es ya un redirect explícito que apunta a `docs/10-requirements/VISION-ALCANCE.md`. Este redirect está correctamente implementado.
  - `docs/00-overview/VISION.md` (35 líneas) es un stub distinto: describe el **problema educativo, propuesta de valor y objetivos académicos** en lenguaje conciso. Es complementario, no duplicado.
  - `docs/10-requirements/VISION-ALCANCE.md` (337 líneas) es el documento canónico completo con: visión completa, alcance con 23 módulos en tabla, 30 requerimientos funcionales (RF-GAM-001 a RF-GAM-034), 26 requerimientos no funcionales, stack tecnológico, épicas y restricciones.
  - El solapamiento es entre `VISION.md` y la **sección 1 (Visión / Propósito)** del documento canónico. El stub en `VISION.md` coincide parcialmente con el texto de los "Principios Rectores" del documento canónico.
- **Riesgo detectado:** `VISION.md` no menciona que existe un documento canónico más completo (`docs/10-requirements/VISION-ALCANCE.md`). Un lector de `docs/00-overview/` podría no descubrir el documento completo.
- **Accion recomendada:** Agregar una línea de referencia al final de `VISION.md`: `> Para la especificación completa con requerimientos y épicas, ver [docs/10-requirements/VISION-ALCANCE.md](../10-requirements/VISION-ALCANCE.md).`

---

### Par 3: `docs/00-overview/DEPLOYMENT.md` vs `docs/50-guides/deployment/`

- **Decision:** REDIRECT (ya resuelto — correcto)
- **Justificacion:**
  - `docs/00-overview/DEPLOYMENT.md` (44 líneas) es explícitamente un **redirect document** creado en la Wave 3 Documentation Audit (2026-02-27). Apunta correctamente a:
    - `docs/20-architecture/AMBIENTES-DEV-PROD.md` (SSOT de ambientes)
    - `docs/50-guides/deployment/_INDEX.md` (índice de guías operativas)
  - El archivo también lista los documentos archivados para trazabilidad histórica.
  - No existe solapamiento activo: el redirect funciona como puente, no como duplicado.
- **Riesgo detectado:** Ninguno activo. El patrón de redirect está correctamente implementado.
- **Accion recomendada:** Ninguna. El estado actual es correcto. Documentar como patrón válido para futuros redirects en `docs/00-overview/`.

---

### Par 4: `docs/00-overview/TESTING-STRATEGY.md` vs `docs/50-guides/testing/`

- **Decision:** REDIRECT (ya resuelto — correcto)
- **Justificacion:**
  - `docs/00-overview/TESTING-STRATEGY.md` (51 líneas) es explícitamente un **redirect document** creado en la Wave 3 Documentation Audit (2026-02-27). Apunta correctamente a:
    - `docs/40-standards/ESTANDAR-TESTING.md` (política y umbrales)
    - `docs/90-adr/ADR-044-testing-coverage-strategy.md` (decisión arquitectónica)
    - `docs/50-guides/testing/_INDEX.md` (guías de implementación)
  - Incluye un resumen de estado actual (2324 tests, 63 spec files) y comandos rápidos para no dejar vacío el documento.
  - No existe solapamiento activo: el redirect funciona correctamente.
- **Riesgo detectado:** El archivo `docs/50-guides/testing/TESTING-GUIDE.md` tiene contenido propio (configuración de Jest/Vitest, ejemplos de tests) que no se menciona en el redirect. Es complementario, no duplicado.
- **Accion recomendada:** Ninguna. Estado correcto.

---

### Par 5: `docs/40-api/API-REFERENCE.md` vs `docs/40-api/PORTAL-*-API-REFERENCE.md` vs `docs/60-portals/*/PORTAL-*-API-REFERENCE.md`

- **Decision:** DIFFERENTIATE
- **Justificacion:**
  - `docs/40-api/API-REFERENCE.md` (~1000+ líneas) es la **referencia canónica de todos los endpoints** por módulo backend. Cubre ~669 de 914 endpoints organizados por módulo técnico (auth, users, tenants, gamification, etc.). Es la vista técnica exhaustiva.
  - `docs/40-api/PORTAL-STUDENT-API-REFERENCE.md` documenta **98 endpoints filtrados por perspectiva de estudiante**, con detalles de request body, roles y notas de RLS. Es la vista de contrato frontend-backend para un rol específico.
  - `docs/40-api/PORTAL-TEACHER-API-REFERENCE.md` documenta **63+ endpoints** del portal maestro con detalles de controllers, request/response shapes y notas de versión.
  - `docs/40-api/PORTAL-PARENTS-API-REFERENCE.md` documenta endpoints del portal padres con sistema de auth separado (`ParentAuthGuard`).
  - **Solapamiento real:** Los endpoints de auth aparecen en `API-REFERENCE.md` Y en `PORTAL-STUDENT-API-REFERENCE.md`. El módulo `/auth/*` está documentado en ambos con distintos niveles de detalle. El portal-student-ref tiene más detalle de request/response; el API-REFERENCE tiene la vista de conjunto.
  - **Archivo `docs/60-portals/teacher/PORTAL-TEACHER-API-REFERENCE.md`:** Es un TERCER archivo que documenta los mismos endpoints del portal teacher con aún más detalle (ejemplos de request/response completos en JSON). Este es un solapamiento real con `docs/40-api/PORTAL-TEACHER-API-REFERENCE.md`.
  - **Archivo `docs/60-portals/admin/PORTAL-ADMIN-API-REFERENCE.md`:** Documenta ~150 endpoints admin (`/admin/*`) con detalle de controllers y response shapes. No existe un equivalente en `docs/40-api/` para el portal admin (el `ADMIN-PORTAL-ENDPOINTS.md` está archivado).
- **Riesgo detectado principal:** `docs/40-api/PORTAL-TEACHER-API-REFERENCE.md` y `docs/60-portals/teacher/PORTAL-TEACHER-API-REFERENCE.md` tienen el mismo nombre de archivo y cubren el mismo dominio. Es el solapamiento más crítico de este conjunto. Un desarrollador que busque "teacher API reference" encontrará dos archivos con información divergente (el de `docs/60-portals/` tiene versión 1.3.0; el de `docs/40-api/` tiene versión 1.0.0).
- **Accion recomendada:**
  1. Para el par teacher API: consolidar en `docs/40-api/PORTAL-TEACHER-API-REFERENCE.md` como SSOT con el contenido más detallado (actualmente en `docs/60-portals/teacher/`), y convertir `docs/60-portals/teacher/PORTAL-TEACHER-API-REFERENCE.md` en un redirect.
  2. Para el solapamiento auth: aceptar el solapamiento parcial como intencional (la vista de portal es un subconjunto curado del API-REFERENCE global).
  3. Para `PORTAL-ADMIN-API-REFERENCE.md`: está correctamente ubicado solo en `docs/60-portals/admin/` — no hay solapamiento.

---

### Par 6: `docs/00-overview/ARQUITECTURA-TECNICA.md` vs `docs/20-architecture/`

- **Decision:** DIFFERENTIATE
- **Justificacion:**
  - `docs/00-overview/ARQUITECTURA-TECNICA.md` (42 líneas) es un **stub de 4 líneas de stack + tabla de puertos + referencias**. Actúa como punto de entrada de alto nivel desde la sección 00-overview. No tiene contenido propio sustancial.
  - `docs/20-architecture/` contiene la arquitectura técnica detallada:
    - `STACK-TECNOLOGICO.md` (~200+ líneas) con todas las dependencias npm, versiones exactas, testing stack.
    - `MODELO-DATOS.md` (~300+ líneas) con los 18 schemas, 173 tablas, views, triggers.
    - `AMBIENTES-DEV-PROD.md` (~150+ líneas) con diferencias completas dev/prod, Redis, CORS.
    - `ARQUITECTURA-GAMIFICACION.md`, `MECANICAS-GAMIFICACION-V6.md`, etc.
  - `docs/00-overview/ARQUITECTURA-TECNICA.md` NO duplica contenido: solo lista el stack en 4 ítems y la tabla de puertos, luego referencia los documentos de `docs/20-architecture/`.
- **Riesgo detectado:** El archivo en 00-overview podría dar una impresión incompleta del stack (no menciona Zustand, Socket.IO, Redis versión, etc.). Un lector podría asumir que eso es todo el stack documentado.
- **Accion recomendada:** Agregar al stub una nota explícita: `> Para el stack completo con versiones y dependencias, ver [STACK-TECNOLOGICO.md](../20-architecture/STACK-TECNOLOGICO.md).` La estructura actual (stub + referencia) es el patrón correcto para la sección 00-overview.

---

### Par 7: `docs/60-portals/admin/PORTAL-ADMIN-GUIDE.md` vs `docs/99-delivery/2025-11-16-entrega-final/MANUAL-PORTAL-ADMINISTRADOR-ACTUALIZADO.md`

- **Decision:** NO_OVERLAP (audiencias y propósitos distintos)
- **Justificacion:**
  - `docs/60-portals/admin/PORTAL-ADMIN-GUIDE.md` (v2.0.0, actualizado 2026-02-27) es la **guía de desarrollo técnica**: estructura de carpetas del frontend, arquitectura de componentes (124 componentes), hooks, stores, flujos de datos. Audiencia: desarrolladores.
  - `docs/99-delivery/2025-11-16-entrega-final/MANUAL-PORTAL-ADMINISTRADOR-ACTUALIZADO.md` (v1.3, enero 2026) es el **manual de usuario histórico** orientado a administradores del sistema (no desarrolladores). Incluye checklists de validación, FAQs, capturas de pantalla placeholders. Además, está marcado explícitamente como `[SUPERSEDED]` y `[HISTORICAL SNAPSHOT — 2025-11-16]`, con notas de que fue reemplazado por `MANUAL-USUARIO-PORTAL-ADMINISTRADOR.md` (v2.0.0).
  - Los dos documentos no se solapan en contenido: uno describe la arquitectura de código, el otro describe cómo usar la interfaz.
- **Riesgo detectado:** El documento de entrega está marcado como superseded pero sigue activo en el repositorio. Esto es correcto para trazabilidad histórica (audit trail). No es un solapamiento problemático.
- **Accion recomendada:** Ninguna sobre el solapamiento (no existe). Sin embargo, verificar que `MANUAL-USUARIO-PORTAL-ADMINISTRADOR.md` (la versión v2.0.0 mencionada como reemplazo) exista en `docs/99-delivery/2025-11-16-entrega-final/`. Según el glob de 99-delivery, el archivo actual es `MANUAL-USUARIO-PORTAL-ADMINISTRADOR.md` — confirmar que tiene frontmatter actualizado.

  **Mismo análisis aplica para Par 7b (Student):** `docs/60-portals/student/PORTAL-STUDENT-GUIDE.md` (guía técnica de desarrollo, v2.2.0) vs `docs/99-delivery/2025-11-16-entrega-final/MANUAL-PORTAL-STUDENT-V1.0.md` (manual de usuario histórico, v1.1.0, marcado `[SUPERSEDED]`). NO_OVERLAP por la misma razón: audiencias y propósitos completamente distintos.

---

## Hallazgo Adicional: Solapamiento Crítico Detectado Fuera de los Pares Planificados

### Par Extra: `docs/40-api/PORTAL-TEACHER-API-REFERENCE.md` vs `docs/60-portals/teacher/PORTAL-TEACHER-API-REFERENCE.md`

- **Decision:** MERGE (o REDIRECT — elegir SSOT)
- **Justificacion:** Este solapamiento fue descubierto durante el análisis del Par 5. Ambos archivos:
  - Tienen el mismo nombre base: `PORTAL-TEACHER-API-REFERENCE.md`
  - Cubren los endpoints del portal teacher (`/teacher/*`)
  - El de `docs/60-portals/teacher/` (v1.3.0) tiene más detalle: request/response JSON completos, notas de deprecación por versión, conteo de endpoints por controller.
  - El de `docs/40-api/` (v1.0.0) tiene estructura de tabla más simple, mismo contenido pero menos granular.
- **Accion recomendada:** Designar `docs/40-api/PORTAL-TEACHER-API-REFERENCE.md` como SSOT (alineado con los otros portal API refs en `docs/40-api/`), migrar el contenido adicional del v1.3.0 hacia ese archivo, y convertir `docs/60-portals/teacher/PORTAL-TEACHER-API-REFERENCE.md` en un redirect.

---

## Tabla Resumen de Acciones

| Par | Archivos | Decision | Prioridad | Accion |
|-----|----------|----------|-----------|--------|
| 1 | MODULOS.md vs MODULOS-EDUCATIVOS.md | DIFFERENTIATE | Baja | Agregar bloque `> Propósito:` en header de cada archivo |
| 2 | VISION.md vs VISION-ALCANCE.md (10-req) | DIFFERENTIATE | Baja | Agregar referencia al canónico en `VISION.md` |
| 3 | DEPLOYMENT.md (00-overview) vs 50-guides/deployment/ | REDIRECT (ya correcto) | Ninguna | No action needed |
| 4 | TESTING-STRATEGY.md (00-overview) vs 50-guides/testing/ | REDIRECT (ya correcto) | Ninguna | No action needed |
| 5 | API-REFERENCE.md vs PORTAL-*-API-REFERENCE.md | DIFFERENTIATE | Media | Aceptar vista global vs vista por portal; resolver Par Extra |
| 6 | ARQUITECTURA-TECNICA.md (00-overview) vs 20-architecture/ | DIFFERENTIATE | Baja | Agregar nota de referencia al stack completo |
| 7 | PORTAL-ADMIN-GUIDE.md vs MANUAL-PORTAL-ADMINISTRADOR-ACTUALIZADO.md | NO_OVERLAP | Ninguna | No action needed |
| Extra | PORTAL-TEACHER-API-REFERENCE.md (40-api) vs (60-portals/teacher) | MERGE/REDIRECT | Alta | Consolidar en docs/40-api/ como SSOT; convertir portals/ en redirect |

---

## Conclusiones

1. **La documentación de redirects en `docs/00-overview/`** para DEPLOYMENT y TESTING-STRATEGY está correctamente implementada como resultado de auditorías anteriores. Este patrón funciona bien.

2. **El solapamiento más activo y problemático** es el Par Extra: dos archivos con el mismo nombre cubriendo los mismos endpoints del portal teacher con versiones divergentes. Este es el único caso donde un desarrollador puede recibir información contradictoria.

3. **Los portales (`docs/60-portals/`)** y las referencias API (`docs/40-api/`)** sirven audiencias complementarias: los portales son guías técnicas de desarrollo (arquitectura de código), mientras que `docs/40-api/` son contratos de interfaz. El solapamiento es intencional para el caso de admin y student. El solapamiento del teacher es un accidente de estructura.

4. **Los manuales de entrega (`docs/99-delivery/`)** están correctamente marcados como snapshots históricos. No representan solapamiento problemático con los documentos vivos.

5. **La sección `docs/00-overview/`** actúa correctamente como capa de resúmenes y stubs con referencias, no como SSOT de contenido técnico. El patrón es: overview = punto de entrada; secciones 10-90 = fuente de verdad.

---

*Análisis realizado: 2026-02-28 | Modo: READ-ONLY | Archivos leídos: 30+ | Modificaciones: 0*
