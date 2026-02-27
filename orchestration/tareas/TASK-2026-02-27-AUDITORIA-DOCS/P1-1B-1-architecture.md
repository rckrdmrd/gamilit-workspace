# Auditoria Estructural: docs/20-architecture/

**Tarea:** TASK-2026-02-27-AUDITORIA-DOCS / Fase P1-1B-1
**Auditor:** Claude Sonnet 4.6
**Fecha:** 2026-02-27
**Alcance:** docs/20-architecture/ (root + 2 subdirectorios)
**Modo:** Read-only — sin modificaciones

---

## Resumen Ejecutivo

| Metrica | Valor |
|---------|-------|
| Total archivos .md | 54 |
| Directorios | 3 (root + schema-reference/ + gamificacion/) |
| Archivos con frontmatter | 4 / 54 (7.4%) |
| Archivos sin frontmatter | 50 / 54 (92.6%) |
| Archivos >500 lineas | 8 |
| Stubs (<10 lineas) | 0 |
| Violaciones 1FN detectadas | 2 |
| Violaciones 2FN detectadas | 1 |
| Gaps de nombrado | 5 |

---

## Directory: docs/20-architecture/ (root)

- **Files:** 13
- **_INDEX.md:** Present (72 lineas)
- **_MAP.md:** Present (28 lineas)
- **Frontmatter (---\n...\n---): 1/13 (7.7%)**
  - WITH: `AMBIENTES-DEV-PROD.md`
  - WITHOUT: todos los demas (12 archivos)
- **Files >500 lineas:** `MODELO-DATOS.md` (508 lineas)
- **Violations:**

### [1FN-ROOT-01] COHERENCE-ENTITIES-DDL.md — Mezcla de 4 preocupaciones independientes (482 lineas)

**Tipo:** Violacion 1FN + violacion 2FN
**Archivo:** `docs/20-architecture/COHERENCE-ENTITIES-DDL.md`
**Descripcion:** Este archivo cubre cuatro preocupaciones distintas sin dependencia funcional entre ellas:
1. **Coherencia DDL-Entity por modulo** (tablas entity vs tabla DDL, ~250 lineas) — su tema central.
2. **Coherencia Frontend Types vs Backend Entities** (lineas 357-382) — preocupacion independiente (capa diferente: frontend, no BD).
3. **Alineacion de columnas — correcciones historicas Sprint R3/REC** (lineas 420-443) — changelog de sprints pasados, no coherencia actual.
4. **Tablas Conceptuales sin DDL** (lineas 446-466) — brecha conceptual-a-fisico, preocupacion de modelo de datos, no de entities vs DDL.

**Recomendacion de split:**
- `COHERENCE-ENTITIES-DDL.md` → solo mapeo entity-por-entity (SSOT actual, secciones de modulos).
- `COHERENCE-FRONTEND-TYPES.md` → coherencia tipos frontend vs entities (nueva).
- Correcciones históricas de sprint → mover a `orchestration/trazas/` o inline en `COHERENCE-ENTITIES-DDL.md` como apendice colapsado.
- Tablas conceptuales sin DDL → ya cubierto parcialmente en `MODELO-DATOS.md` y `schema-reference/`; consolidar ahi.

---

### [1FN-ROOT-02] MODELO-DATOS.md — Modelo conceptual con datos que difieren de SSOT (508 lineas)

**Tipo:** Violacion potencial 1FN (datos obsoletos vs inventario SSOT)
**Archivo:** `docs/20-architecture/MODELO-DATOS.md`
**Descripcion:** El archivo mezcla dos preocupaciones:
1. **Modelo conceptual de datos** (schemas, tablas conceptuales, funciones, triggers) — su topico declarado.
2. **Metricas cuantitativas de la BD** en el Resumen (tablas: 172, views: 22, funciones: 183, triggers: 67/126, RLS: 237, FKs: 299) que **difieren del SSOT actual** (`schema-reference/_INDEX.md` v3.0.0: tablas 173, views 18, funciones 158, triggers 68, RLS 251, FKs 301).

Las metricas son datos de estado operativo — pertenecen al SSOT `orchestration/inventarios/DATABASE_INVENTORY.yml` y a `schema-reference/_INDEX.md`, no a un documento conceptual.

**Recomendacion:** Eliminar la tabla "Resumen" de MODELO-DATOS.md y reemplazar con un enlace al SSOT. Mantener solo la descripcion conceptual por schema.

---

### [NAMING-ROOT-01] README.md — Nombre en minusculas

**Tipo:** Violacion de convencion de nombrado (UPPERCASE-KEBAB-CASE esperado)
**Archivos afectados:** `README.md` (root y gamificacion/)
**Descripcion:** La convencion del proyecto es UPPERCASE-KEBAB-CASE para documentos. README.md es la excepcion convencional de Git pero es inconsistente con los demas archivos de la carpeta.
**Severidad:** Baja — convencion de Git ampliamente aceptada. Documentar como excepcion intencional si se quiere mantener.

---

### [NAMING-ROOT-02] MECANICAS-GAMIFICACION-V6.md — Version en nombre de archivo

**Tipo:** Violacion de convencion de nombrado
**Archivo:** `docs/20-architecture/MECANICAS-GAMIFICACION-V6.md`
**Descripcion:** El sufijo `-V6` en el nombre de archivo implica versionado en el nombre, lo cual viola la convencion de nombrado (las versiones se registran en frontmatter/metadata, no en el nombre). El archivo es ademas un stub de redireccion (22 lineas) que senala a `gamificacion/`.
**Recomendacion:** Renombrar a `MECANICAS-GAMIFICACION-LEGACY.md` o eliminar y usar solo el link en `_INDEX.md`.

---

### [STALE-ROOT-01] MECANICAS-GAMIFICACION-V6.md — Documento de redireccion sin topico propio

**Tipo:** Documento residual / stub de redireccion
**Archivo:** `docs/20-architecture/MECANICAS-GAMIFICACION-V6.md` (22 lineas)
**Descripcion:** El archivo no contiene informacion nueva — solo redirige a la estructura canonica `gamificacion/`. Su unico proposito es mantener enlaces legados validos. Esto es aceptable pero debe estar documentado como alias de compatibilidad, no como documento activo.

---

### [FRONTMATTER] Cobertura de frontmatter en root: 1/13 (7.7%)

**Archivos con frontmatter:** `AMBIENTES-DEV-PROD.md`
**Archivos sin frontmatter (12):**
- `ARQUITECTURA-GAMIFICACION.md`
- `COHERENCE-ENTITIES-DDL.md`
- `DATOS-GAMIFICACION.md`
- `DB-OPERACION-AMBIENTES-DECISION.md`
- `MECANICAS-GAMIFICACION-V6.md`
- `MODELO-DATOS.md`
- `README.md`
- `SCHEMA-REFERENCE.md`
- `STACK-TECNOLOGICO.md`
- `TRACEABILITY-US-SCHEMAS.md`
- `_INDEX.md`
- `_MAP.md`

**Nota:** `AMBIENTES-DEV-PROD.md` tiene YAML frontmatter valido (version, fecha). Los demas usan metadata en-linea (bold key: value) pero no bloque `---` formal.

---

## Directory: docs/20-architecture/schema-reference/

- **Files:** 26
- **_INDEX.md:** Present (136 lineas) — bien estructurado, incluye tabla de schemas fisicos vs conceptuales, mapeo completo.
- **_MAP.md:** **MISSING**
- **Frontmatter:** 1/26 (3.8%)
  - WITH: `04-gamification.md`
  - WITHOUT: todos los demas (25 archivos)
- **Files >500 lineas:**
  - `03-education.md` — 1,208 lineas
  - `05-social.md` — 771 lineas
  - `17-data-warehouse.md` — 743 lineas
  - `04-gamification.md` — 732 lineas
  - `06-progress.md` — 625 lineas
  - `01-auth.md` — 554 lineas
- **Violations:**

### [MAP-SR-01] schema-reference/ carece de _MAP.md

**Tipo:** Gap de navegacion
**Descripcion:** La convencion del proyecto requiere `_MAP.md` en directorios con multiples archivos para navegacion rapida por necesidad funcional. `schema-reference/` tiene 26 archivos pero solo posee `_INDEX.md` (tabla de contenidos). No existe `_MAP.md` con formato "Si necesitas X, ve a Y".
**Impacto:** Navegacion menos eficiente para consumidores de documentacion.

---

### [1FN-SR-01] 07-analytics.md — Mezcla schemas data_warehouse + admin_dashboard

**Tipo:** Violacion 1FN
**Archivo:** `docs/20-architecture/schema-reference/07-analytics.md` (104 lineas)
**Descripcion:** El archivo cubre el schema conceptual "analytics" que mapea a DOS schemas fisicos independientes: `data_warehouse` (star schema, 16 tablas) y `admin_dashboard` (4 tablas + 7 views). Ambos schemas fisicos tienen ademas sus propios archivos dedicados (`17-data-warehouse.md` y `18-admin-dashboard.md`). Esto genera solapamiento de contenido.
**Recomendacion:** `07-analytics.md` deberia ser un documento-puente que explica la relacion conceptual y redirige a los archivos fisicos dedicados, sin repetir definicion de tablas.

---

### [NAMING-SR-01] Archivos con numero de schema en nombre — inconsistencia con schemas fisicos

**Tipo:** Inconsistencia de nombrado
**Descripcion:** Los nombres de archivo usan numeracion secuencial (`01-auth.md`, `02-tenants.md`, ...) que no coincide con los numeros de schema fisico DDL (no hay schemas numerados en DDL). Los numeros son arbitrarios y no facilitan busqueda directa por nombre de schema fisico. Los archivos `19-communication.md`, `20-gamilit-utility.md`, `21-lti-integration.md` usan numeros >18 (los 18 schemas del CLAUDE.md) lo que genera confusion respecto al conteo declarado de "18 schemas".
**Impacto:** Baja severidad — la numeracion es convencional interna, pero el _INDEX.md lo resuelve con tabla de mapeo. Documentado correctamente.

---

### [NAMING-SR-02] UUID-SERIES-CATALOG.md — Tema fuera del scope de schema-reference

**Tipo:** Misplacement (topico fuera de alcance del directorio)
**Archivo:** `docs/20-architecture/schema-reference/UUID-SERIES-CATALOG.md` (130 lineas)
**Descripcion:** El catalogo de series UUID de seeds es informacion de **infraestructura de datos de prueba/seeds**, no documentacion de schema de BD de produccion. Su lugar natural seria `docs/20-architecture/` root (como documento standalone de convencion) o `apps/database/seeds/` junto a los seeds mismos.
**Impacto:** Baja severidad — el _INDEX.md lo referencia explicitamente en seccion "Utilidades", por lo que su ubicacion es discutible pero no critica.

---

### [STUB-SR-01] 10-store.md — Documento de redireccion (36 lineas)

**Tipo:** Documento de redireccion / stub de deprecacion
**Archivo:** `docs/20-architecture/schema-reference/10-store.md` (36 lineas)
**Descripcion:** El archivo no contiene definicion de schema activo — es un documento de deprecacion que redirige a `04-gamification.md`. Es funcional como marcador de deprecacion pero no aporta contenido propio.
**Evaluacion:** ACEPTABLE como stub de compatibilidad de enlaces. Debe mantenerse para evitar enlaces rotos desde documentacion legada.

---

### [STUB-SR-02] 17-18-placeholder.md — Schemas vacios / placeholder (25 lineas)

**Tipo:** Stub de schemas placeholder
**Archivo:** `docs/20-architecture/schema-reference/17-18-placeholder.md` (25 lineas)
**Descripcion:** Documenta 4 schemas sin tablas activas (`public`, `storage`, `optimization`, `billing`). El contenido es minimal pero suficiente para su proposito. El nombre `17-18-placeholder.md` es confuso dado que ahora existen `17-data-warehouse.md` y `18-admin-dashboard.md` como archivos dedicados, haciendo el prefijo `17-18` obsoleto.
**Recomendacion:** Renombrar a `99-placeholder-schemas.md` o `vacios-placeholder.md` para evitar confusion con los numeros 17 y 18 ya usados.

---

### Schema Coverage Analysis — Los 18 schemas conocidos vs archivos existentes

**Schemas conocidos (del CLAUDE.md y DDL):**

| Schema Fisico DDL | Archivo en schema-reference/ | Estado |
|-------------------|------------------------------|--------|
| `auth` | `01-auth.md` | CUBIERTO |
| `auth_management` | `01-auth.md` (combinado con auth) | CUBIERTO (parcial — 02-tenants.md cubre tenants conceptual) |
| `gamilit` | `20-gamilit-utility.md` | CUBIERTO |
| `public` | `17-18-placeholder.md` | CUBIERTO (stub) |
| `educational_content` | `03-education.md` | CUBIERTO |
| `progress_tracking` | `06-progress.md` | CUBIERTO |
| `gamification_system` | `04-gamification.md` | CUBIERTO |
| `social_features` | `05-social.md`, `06-classrooms.md`, `08-reports.md` | CUBIERTO (split en 3 archivos) |
| `notifications` | `09-notifications.md` | CUBIERTO |
| `communication` | `19-communication.md` | CUBIERTO |
| `content_management` | `13-content.md` | CUBIERTO |
| `system_config` / `system_configuration` | `15-settings.md` | CUBIERTO |
| `admin` / `admin_dashboard` | `18-admin-dashboard.md` | CUBIERTO |
| `storage` | `17-18-placeholder.md` | CUBIERTO (stub) |
| `data_warehouse` | `17-data-warehouse.md` | CUBIERTO |
| `audit_logging` | `16-audit.md` | CUBIERTO |
| `lti_integration` | `21-lti-integration.md` | CUBIERTO |
| `optimization` | `17-18-placeholder.md` | CUBIERTO (stub) |

**Resultado:** Los 18 schemas fisicos activos estan cubiertos. No hay schemas sin documentar.

**Observaciones adicionales:**
- `02-tenants.md` documenta el schema conceptual "tenants" que fisicamente reside en `auth_management` parcialmente — es una capa de abstraccion conceptual, no un schema fisico separado. Esto puede causar confusion.
- Los schemas `optimization` y `billing` aparecen en `17-18-placeholder.md` pero `billing` no existe en DDL actual (concepto futuro) — la documentacion lo registra correctamente.
- La existencia de `07-analytics.md` como schema conceptual que se superpone con `17-data-warehouse.md` y `18-admin-dashboard.md` (schemas fisicos dedicados) representa duplicacion de informacion entre niveles de abstraccion.

---

### [FRONTMATTER] Cobertura de frontmatter en schema-reference/: 1/26 (3.8%)

**Archivos con frontmatter:** `04-gamification.md`
**Sin frontmatter:** los 25 restantes

La ausencia de frontmatter YAML formal es la norma en este directorio. Los archivos usan metadata inline (version, fecha en texto plano) cuando la tienen.

---

## Directory: docs/20-architecture/gamificacion/

- **Files:** 13
- **_INDEX.md:** Present (19 lineas)
- **_MAP.md:** Present (13 lineas)
- **Frontmatter:** 2/13 (15.4%)
  - WITH: `DISENO-SISTEMA-EQUIPAMIENTO.md`, `FLUJO-TECNICO-EQUIPAMIENTO.md`
  - WITHOUT: los 11 restantes
- **Files >500 lineas:** Ninguno (maximo: DISENO-SISTEMA-EQUIPAMIENTO.md, 226 lineas)
- **Violations:**

### [NAMING-GAM-01] README.md — Nombre en minusculas

**Tipo:** Violacion de convencion (misma que NAMING-ROOT-01)
**Severidad:** Baja

---

### [STUB-GAM-01] MODULO-1 a MODULO-5-MECANICAS.md — Stubs de contenido minimo

**Tipo:** Stubs de contenido
**Archivos afectados:**
- `MODULO-1-MECANICAS.md` — 15 lineas
- `MODULO-2-MECANICAS.md` — 15 lineas
- `MODULO-3-MECANICAS.md` — 15 lineas
- `MODULO-4-MECANICAS.md` — 15 lineas
- `MODULO-5-MECANICAS.md` — 13 lineas

**Descripcion:** Los 5 archivos de mecanicas por modulo son stubs minimales. Listan los tipos de ejercicio y el metodo de evaluacion pero carecen de: scoring detallado, flujo de interaccion, dependencias de backend, parametros de configuracion, o referencias a DDL/entities. Su topico es correcto (1 tema = 1 archivo) pero la profundidad es insuficiente para uso operativo.
**Evaluacion:** Los archivos tecnicamente cumplen 1FN (un topico por archivo). La deficiencia es de completitud de contenido, no de estructura.

---

### [STUB-GAM-02] RANGOS-MAYA.md y ECONOMIA-VIRTUAL.md — Contenido minimal

**Tipo:** Stubs de contenido (borderline)
**Archivos:**
- `RANGOS-MAYA.md` — 22 lineas (tabla de rangos + 2 reglas + referencias)
- `ECONOMIA-VIRTUAL.md` — 20 lineas (listas de fuentes y usos)

**Descripcion:** Estan por encima del umbral de stub (<10 lineas) y cumplen 1FN. Sin embargo `DATOS-GAMIFICACION.md` en el directorio root (376 lineas) contiene informacion mas detallada y actualizada (con datos de production seeds v2.1) sobre los mismos temas. Existe solapamiento de contenido entre los stubs del subdirectorio y el documento root mas completo.
**Impacto:** Lectores que siguen la estructura canonica (`gamificacion/`) encuentran informacion incompleta; lectores que acceden desde root encuentran la informacion completa. El `_MAP.md` de root apunta a `DATOS-GAMIFICACION.md`, no a los stubs — lo que mitiga el problema para nuevos lectores pero no resuelve la duplicacion.

---

### [FRONTMATTER] Cobertura de frontmatter en gamificacion/: 2/13 (15.4%)

**Archivos con frontmatter:** `DISENO-SISTEMA-EQUIPAMIENTO.md`, `FLUJO-TECNICO-EQUIPAMIENTO.md`
**Sin frontmatter:** 11 archivos

---

## Resumen Consolidado de Violaciones

### Por tipo de violacion:

| ID | Tipo | Directorio | Archivo | Severidad |
|----|------|-----------|---------|-----------|
| 1FN-ROOT-01 | Primera Forma Normal (topicos mixtos) | root | COHERENCE-ENTITIES-DDL.md | ALTA |
| 1FN-ROOT-02 | Metricas obsoletas mezcladas con modelo conceptual | root | MODELO-DATOS.md | MEDIA |
| 1FN-SR-01 | Primera Forma Normal (schemas duales sin separacion) | schema-reference/ | 07-analytics.md | MEDIA |
| 2FN-ROOT-01 | Segunda Forma Normal (dependencias parciales) | root | COHERENCE-ENTITIES-DDL.md | ALTA |
| MAP-SR-01 | _MAP.md ausente | schema-reference/ | (directorio) | MEDIA |
| NAMING-ROOT-01 | Nombre en minusculas (README.md) | root | README.md | BAJA |
| NAMING-ROOT-02 | Version en nombre de archivo | root | MECANICAS-GAMIFICACION-V6.md | BAJA |
| NAMING-SR-01 | Numeracion de schemas inconsistente con DDL | schema-reference/ | multiples | INFO |
| NAMING-SR-02 | UUID-SERIES-CATALOG.md fuera de scope | schema-reference/ | UUID-SERIES-CATALOG.md | BAJA |
| NAMING-GAM-01 | Nombre en minusculas (README.md) | gamificacion/ | README.md | BAJA |
| STUB-ROOT-01 | Documento de redireccion sin topico propio | root | MECANICAS-GAMIFICACION-V6.md | INFO |
| STUB-SR-01 | Documento de deprecacion | schema-reference/ | 10-store.md | INFO |
| STUB-SR-02 | Nombre confuso para placeholder | schema-reference/ | 17-18-placeholder.md | BAJA |
| STUB-GAM-01 | Stubs de contenido minimal (5 archivos) | gamificacion/ | MODULO-*-MECANICAS.md | MEDIA |
| STUB-GAM-02 | Solapamiento con DATOS-GAMIFICACION.md root | gamificacion/ | RANGOS-MAYA.md, ECONOMIA-VIRTUAL.md | BAJA |

### Prioridad de accion:

**Critico / Alta prioridad:**
1. `COHERENCE-ENTITIES-DDL.md` — Split en 2-3 documentos (1FN + 2FN violation).
2. `schema-reference/_MAP.md` — Crear archivo faltante.

**Media prioridad:**
3. `MODELO-DATOS.md` — Eliminar tabla de metricas (reemplazar con link a SSOT).
4. `07-analytics.md` — Convertir en documento-puente sin repetir definicion de tablas.
5. `MODULO-*-MECANICAS.md` — Expandir contenido o referenciar fuentes mas completas.

**Baja prioridad / Informacional:**
6. `MECANICAS-GAMIFICACION-V6.md` — Renombrar (quitar -V6) y documentar como alias.
7. `17-18-placeholder.md` — Renombrar para evitar confusion con numeros 17/18 ya usados.
8. `UUID-SERIES-CATALOG.md` — Evaluar si pertenece a schema-reference/ o a root/database/.
9. `RANGOS-MAYA.md`, `ECONOMIA-VIRTUAL.md` — Consolidar o expandir para evitar solapamiento con `DATOS-GAMIFICACION.md`.

---

## Datos Adicionales

### Conteo de lineas — archivos >500 (flags completos)

| Archivo | Lineas | Estado |
|---------|--------|--------|
| `schema-reference/03-education.md` | 1,208 | EXCESIVO — candidato a split por subseccion |
| `schema-reference/05-social.md` | 771 | ALTO — schema social_features es grande (30 tablas) |
| `schema-reference/17-data-warehouse.md` | 743 | ALTO — 16 tablas star schema, justificado |
| `schema-reference/04-gamification.md` | 732 | ALTO — 27 tablas, justificado |
| `schema-reference/06-progress.md` | 625 | ALTO — 21 tablas, justificado |
| `schema-reference/01-auth.md` | 554 | ALTO — schema dual auth+auth_management, justificado |
| `MODELO-DATOS.md` | 508 | MEDIO — candidato a reduccion eliminando metricas duplicadas |

**Nota sobre `03-education.md` (1,208 lineas):** Con 24 tablas de `educational_content` es el archivo mas largo. Podria dividirse en `03-education-content.md` (modulos, ejercicios, contenido) y `03-education-resources.md` (media, rubrics, validacion) aunque esto dependeria del criterio de atomicidad adoptado.

### Coherencia de la estructura de schema-reference/ con schemas fisicos conocidos

**Resultado:** Todos los 18 schemas activos del sistema estan cubiertos en schema-reference/. No hay schemas fisicos sin documentar. La cobertura es ~98% a nivel de tablas (~170/173 segun _INDEX.md v3.0.0).

**Schemas fisicos con cobertura completa:** auth, auth_management, gamilit, educational_content, progress_tracking, gamification_system, social_features, notifications, communication, content_management, system_configuration, admin_dashboard, data_warehouse, audit_logging, lti_integration.

**Schemas placeholder/vacios documentados:** public, storage, optimization (en 17-18-placeholder.md).

---

*Auditoria completada: 2026-02-27*
*Total archivos revisados: 54*
*Sin modificaciones realizadas — modo read-only*
