# Auditoria docs/40-standards/ — Informe Estructural

**Fecha:** 2026-02-27
**Auditor:** Claude Sonnet 4.6 (subagente — modo ANALYSIS)
**Alcance:** `docs/40-standards/` — lectura solamente, sin modificaciones
**Tarea padre:** TASK-2026-02-27-AUDITORIA-DOCS / Fase P1-1B-3

---

## 1. Inventario Completo con Conteo de Lineas

### 1.1 Directorio raiz `docs/40-standards/`

| Archivo | Lineas | Notas |
|---------|--------|-------|
| `_INDEX.md` | 64 | Indice principal |
| `_MAP.md` | 65 | Mapa de navegacion |
| `README.md` | 19 | Entrada de navegacion |
| `ESTANDAR-12-FACTOR-APP.md` | 754 | GRANDE (>500) |
| `ESTANDAR-API.md` | 1,453 | MUY GRANDE (>500) |
| `ESTANDAR-BACKEND-PROFESIONAL.md` | 32 | Redirect stub |
| `ESTANDAR-CODIGO.md` | 218 | OK |
| `ESTANDAR-CROSS-SCHEMA-REFERENCES.md` | 92 | OK |
| `ESTANDAR-DATABASE-PROFESIONAL.md` | 588 | GRANDE (>500) |
| `ESTANDAR-DIAGRAMAS-ER.md` | 321 | OK |
| `ESTANDAR-DOCUMENTACION.md` | 250 | OK |
| `ESTANDAR-FRONTEND-PROFESIONAL.md` | 1,146 | MUY GRANDE (>500) |
| `ESTANDAR-GIT.md` | 194 | OK |
| `ESTANDAR-MEMORIA-TOKENS.md` | 197 | OK |
| `ESTANDAR-METADATA-ITEMS.md` | 297 | OK |
| `ESTANDAR-NOMENCLATURA.md` | 138 | OK |
| `ESTANDAR-NOMENCLATURA-API.md` | 575 | GRANDE (>500) |
| `ESTANDAR-OBSERVABILIDAD.md` | 424 | OK |
| `ESTANDAR-PERFORMANCE.md` | 251 | OK |
| `ESTANDAR-SEGURIDAD.md` | 1,863 | MUY GRANDE (>500) — mayor del directorio |
| `ESTANDAR-SKILLS.md` | 508 | GRANDE (>500) |
| `ESTANDAR-TESTING.md` | 1,582 | MUY GRANDE (>500) |
| `STANDARD-API.md` | 205 | OK — nombre inconsistente |
| `STANDARD-COMPONENT.md` | 161 | OK — nombre inconsistente |
| `STANDARD-IMPORTS.md` | 125 | OK — nombre inconsistente |
| `STANDARD-RESPONSIVE.md` | 207 | OK — **AUSENTE EN INDICES** |
| `STANDARD-TYPES.md` | 167 | OK — nombre inconsistente |
| `STANDARD-UX-PATTERNS.md` | 215 | OK — nombre inconsistente |

**Total directorio raiz:** 38 archivos (incluye subdirectorios)
**Total lineas (todo el directorio, incluidas subdirectorios):** 14,607

### 1.2 Subdirectorio `backend-profesional/`

| Archivo | Lineas | Notas |
|---------|--------|-------|
| `_INDEX.md` | 43 | Indice del subdir — CON frontmatter YAML |
| `01-principios-solid.md` | 227 | OK |
| `02-clean-architecture.md` | 540 | GRANDE (>500) |
| `03-repository-pattern.md` | 169 | OK |
| `04-domain-driven-design.md` | 374 | OK |
| `05-manejo-errores.md` | 245 | OK |
| `06-validacion-datos.md` | 269 | OK |
| `07-testing-patterns.md` | 608 | GRANDE (>500) |
| `08-referencias.md` | 13 | STUB (<10 lineas de contenido real; solo 5 referencias) |

### 1.3 Subdirectorio `guias/`

| Archivo | Lineas | Notas |
|---------|--------|-------|
| `README.md` | 8 | STUB — redirect puro |

---

## 2. Hallazgos por Criterio

### 2.1 Criterion 1: 1FN — Un archivo = un topico

**Violaciones detectadas:**

#### V-1FN-001 — `ESTANDAR-SEGURIDAD.md` (1,863 lineas): Dos taxonomias OWASP fusionadas

El archivo cubre **dos taxonomias OWASP distintas** en un mismo documento:
- `## 1. OWASP Top 10 (2021)` — vulnerabilidades de aplicaciones web generales (lineas 25-479)
- `## 1B. OWASP API Security Top 10 (2023)` — vulnerabilidades especificas de APIs (lineas 480-1,301)

Adicionalmente cubre: validacion de entrada, sanitizacion de salida, autenticacion, autorizacion, secrets management, security headers, checklist. Esto representa **8 temas distintos** colapasados en un solo archivo. La presencia de "1B" en la numeracion de secciones es sintoma de una expansion organica no controlada.

**Severidad:** ALTA. El archivo es el mayor del directorio (1,863 lineas) y mezcla la taxonomia OWASP Web con la taxonomia OWASP API, que son estandares independientes con audiencias distintas.

**Propuesta de split (no ejecutar en esta auditoria):**
- `ESTANDAR-SEGURIDAD-WEB.md` — OWASP Top 10 2021 (web)
- `ESTANDAR-SEGURIDAD-API.md` — OWASP API Security Top 10 2023
- `ESTANDAR-SEGURIDAD-AUTENTICACION.md` — JWT, sesiones, MFA
- `ESTANDAR-SEGURIDAD-CHECKLIST.md` — checklists pre-deploy

#### V-1FN-002 — `ESTANDAR-TESTING.md` (1,582 lineas): Testing frontend + backend + arquitectura + visual regression

El archivo mezcla:
- Testing unitario backend (NestJS/Jest)
- Testing unitario frontend (React Testing Library)
- Integration tests
- E2E tests (Playwright)
- Architecture tests (ts-arch, madge)
- Visual regression testing (Playwright screenshots)
- Coverage estrategy

Cada uno de estos es un dominio independiente. La seccion `## 11. Visual Regression Testing` y `## 10. Architecture Tests` son temas que difieren significativamente del "piramide de testing" central.

**Severidad:** MEDIA. El archivo es una "enciclopedia de testing" — util como referencia pero viola 1FN al cubrir capas tecnicas completamente distintas (backend vs frontend vs E2E vs visual).

#### V-1FN-003 — `ESTANDAR-API.md` (1,453 lineas): API standard + security overlap

El archivo tiene una seccion `## 8. Seguridad en APIs` (lineas 1,158-1,384) que solapa con `ESTANDAR-SEGURIDAD.md` seccion `1B. OWASP API Security`. Hay redundancia de contenido: rate limiting, autenticacion JWT en endpoints, validacion de inputs — todos cubiertos tambien en ESTANDAR-SEGURIDAD.

**Severidad:** MEDIA. No es split necesario del archivo completo (el topico "API standards" es coherente), pero la seccion de seguridad deberia reemplazarse por una referencia cruzada a `ESTANDAR-SEGURIDAD.md`.

#### V-1FN-004 — `ESTANDAR-FRONTEND-PROFESIONAL.md` (1,146 lineas): Frontend + Testing frontend fusionados

La seccion `## 4. Testing Patterns` (lineas 636-790) cubre testing frontend especifico (renderHook, Testing Library), que duplica parcialmente el contenido de `ESTANDAR-TESTING.md` secciones de frontend.

**Severidad:** BAJA. El archivo tiene cohesion razonable como "estandar completo de frontend", pero la inclusion de testing patterns crea duplicacion con ESTANDAR-TESTING.md.

---

### 2.2 Criterion 2: _INDEX.md gaps

| Directorio | _INDEX.md | Estado |
|-----------|-----------|--------|
| `docs/40-standards/` | `_INDEX.md` (64 lineas) | PRESENTE |
| `docs/40-standards/backend-profesional/` | `_INDEX.md` (43 lineas) | PRESENTE |
| `docs/40-standards/guias/` | AUSENTE | **GAP** |

**G-IDX-001 — `guias/` carece de `_INDEX.md`**

El subdirectorio `docs/40-standards/guias/` solo contiene `README.md` (8 lineas, redirect). No tiene `_INDEX.md`. Sin embargo, dado que es un directorio de redirect puro (contenido migrado a `docs/50-guides/`), el impacto es bajo.

**Severidad:** BAJA. El `README.md` cumple funcion de stub/redirect. Pero para consistencia con la convencion del proyecto, deberia existir un `_INDEX.md`.

---

### 2.3 Criterion 3: _MAP.md gaps

| Directorio | _MAP.md | Estado |
|-----------|---------|--------|
| `docs/40-standards/` | `_MAP.md` (65 lineas) | PRESENTE |
| `docs/40-standards/backend-profesional/` | AUSENTE | **GAP** |
| `docs/40-standards/guias/` | AUSENTE | **GAP** |

**G-MAP-001 — `backend-profesional/` carece de `_MAP.md`**

El subdirectorio `backend-profesional/` tiene `_INDEX.md` pero no `_MAP.md`. La convencion del proyecto (visible en `docs/50-guides/`) es que los subdirectorios tengan ambos archivos de navegacion.

**Severidad:** BAJA. El `_INDEX.md` existente cubre parcialmente la funcion de mapa.

**G-MAP-002 — `guias/` carece de `_MAP.md`**

Mismo gap que G-IDX-001 — directorio de redirect sin mapa de navegacion.

**Severidad:** BAJA.

---

### 2.4 Criterion 4: Frontmatter YAML

Se esperan bloques YAML frontmatter (`---` al inicio del archivo) para permitir procesamiento automatico. La convencion no es 100% uniforme en el directorio — algunos usan YAML frontmatter, otros usan metadata en linea (bold text) o no tienen metadata formal.

| Archivo | Frontmatter | Formato Metadata |
|---------|-------------|-----------------|
| `ESTANDAR-SEGURIDAD.md` | SI | YAML (`tipo`, `scope`, `version`, `tags`) |
| `ESTANDAR-TESTING.md` | SI | YAML (`titulo`, `version`, `fecha_creacion`, `tags`) |
| `ESTANDAR-API.md` | SI | YAML (`tipo`, `scope`, `version`, `tags`) |
| `ESTANDAR-BACKEND-PROFESIONAL.md` | SI | YAML (`tipo`, `redirige_a`, `version`) |
| `ESTANDAR-CODIGO.md` | SI | YAML (`tipo`, `scope`, `herencia`) |
| `ESTANDAR-DATABASE-PROFESIONAL.md` | SI | YAML (`tipo`, `scope`, `herencia`, `version`) |
| `ESTANDAR-FRONTEND-PROFESIONAL.md` | SI | YAML (`title`, `version`, `created`, `tags`) |
| `ESTANDAR-12-FACTOR-APP.md` | SI | YAML (`tipo`, `scope`, `version`, `tags`) |
| `ESTANDAR-OBSERVABILIDAD.md` | SI | YAML (`tipo`, `scope`, `version`, `tags`) |
| `ESTANDAR-PERFORMANCE.md` | SI | YAML (`tipo`, `scope`, `version`, `tags`) |
| `ESTANDAR-SKILLS.md` | SI | YAML (`tipo`, `scope`, `titulo`, `version`) |
| `backend-profesional/_INDEX.md` | SI | YAML (`tipo`, `scope`, `version`, `tags`) |
| `ESTANDAR-NOMENCLATURA.md` | **NO** | Solo heading H1 y blockquote |
| `ESTANDAR-GIT.md` | **NO** | Solo heading H1 y blockquote |
| `ESTANDAR-DOCUMENTACION.md` | **NO** | Solo heading H1 y blockquote |
| `ESTANDAR-DIAGRAMAS-ER.md` | **NO** | Bold fields inline (`**Version:**`, `**Fecha:**`) |
| `ESTANDAR-CROSS-SCHEMA-REFERENCES.md` | **NO** | Bold fields inline |
| `ESTANDAR-MEMORIA-TOKENS.md` | **NO** | Bold fields inline |
| `ESTANDAR-NOMENCLATURA-API.md` | **NO** | Tabla Markdown como metadata |
| `ESTANDAR-METADATA-ITEMS.md` | **NO** | Bold fields inline |
| `STANDARD-API.md` | **NO** | Bold fields inline (version, fecha, estado) |
| `STANDARD-COMPONENT.md` | **NO** | Bold fields inline |
| `STANDARD-IMPORTS.md` | **NO** | Bold fields inline |
| `STANDARD-RESPONSIVE.md` | **NO** | Bold fields inline |
| `STANDARD-TYPES.md` | **NO** | Bold fields inline |
| `STANDARD-UX-PATTERNS.md` | **NO** | Bold fields inline |
| `_INDEX.md` | **NO** | Solo heading H1 (archivo de navegacion) |
| `_MAP.md` | **NO** | Solo heading H1 (archivo de navegacion) |
| `README.md` | **NO** | Solo heading H1 (archivo de navegacion) |

**Resumen frontmatter:**
- Archivos CON frontmatter YAML: 12 de 28 archivos (43%)
- Archivos SIN frontmatter: 16 de 28 archivos (57%)
- Archivos de navegacion sin frontmatter (_INDEX, _MAP, README): 3 — aceptable por convencion

**F-FRONT-001 — Inconsistencia de esquema de frontmatter**

Los archivos CON frontmatter no usan un esquema uniforme:
- `ESTANDAR-SEGURIDAD.md` usa `tipo`, `scope`, `herencia`, `actualizado`
- `ESTANDAR-TESTING.md` usa `titulo`, `fecha_creacion`, `ultima_actualizacion`, `autor`, `categoria`
- `ESTANDAR-FRONTEND-PROFESIONAL.md` usa `title` (ingles), `created`, `updated`, `status`, `applies_to`

Tres esquemas distintos para el mismo tipo de documento. Ninguno es canonica del proyecto.

**Severidad:** MEDIA. Impide procesamiento automatico de metadatos.

---

### 2.5 Criterion 5: Convencion de Nombres

La convencion esperada en el proyecto es `UPPERCASE-KEBAB-CASE.md` para todos los estandares.

**Archivos que cumplen:** Todos los `ESTANDAR-*.md` y `STANDARD-*.md`

**Inconsistencias detectadas:**

**N-001 — Prefijo dual: `ESTANDAR-` vs `STANDARD-`**

Existen dos prefijos coexistentes para el mismo tipo de documento:
- 19 archivos con prefijo `ESTANDAR-` (espanol)
- 6 archivos con prefijo `STANDARD-` (ingles)

Los archivos `STANDARD-*` son todos frontend-especificos y fueron creados en fecha posterior (2026-02-19, vs los `ESTANDAR-*` mas antiguos). Esta dualidad introduce ambiguedad de busqueda y navegacion.

**Afectados:** `STANDARD-API.md`, `STANDARD-COMPONENT.md`, `STANDARD-IMPORTS.md`, `STANDARD-RESPONSIVE.md`, `STANDARD-TYPES.md`, `STANDARD-UX-PATTERNS.md`

**Severidad:** MEDIA. No afecta funcionamiento pero viola el principio de nomenclatura uniforme.

**N-002 — `backend-profesional/` usa numeracion con prefijo (`01-`, `02-`, etc.)**

Los archivos dentro de `backend-profesional/` usan el formato `NN-nombre-topico.md` (minusculas, prefijo numerico). Esto difiere de la convencion `UPPERCASE-KEBAB-CASE.md` del directorio padre.

Esta es una decision intencional para indicar orden de lectura — documentada implicitamente por la estructura secuencial (1-8). Sin embargo crea una inconsistencia de convencion de nombres dentro del mismo directorio de estandares.

**Severidad:** BAJA. La inconsistencia es intencional y funcional (orden de lectura explicio).

**N-003 — `guias/README.md` usa `README.md` en lugar de `_INDEX.md` o stub nombrado**

El subdirectorio `guias/` usa `README.md` en lugar del patron `_INDEX.md` del proyecto. Adicionalmente el contenido es un redirect puro.

**Severidad:** BAJA.

---

### 2.6 Criterion 6: Archivos >500 lineas (candidatos a split)

| Archivo | Lineas | Exceso vs 500 | Candidato a Split |
|---------|--------|---------------|-------------------|
| `ESTANDAR-SEGURIDAD.md` | **1,863** | +1,363 | SI — ALTA PRIORIDAD |
| `ESTANDAR-TESTING.md` | **1,582** | +1,082 | SI — ALTA PRIORIDAD |
| `ESTANDAR-API.md` | **1,453** | +953 | SI — MEDIA PRIORIDAD |
| `ESTANDAR-FRONTEND-PROFESIONAL.md` | **1,146** | +646 | SI — MEDIA PRIORIDAD |
| `ESTANDAR-12-FACTOR-APP.md` | **754** | +254 | OPCIONAL |
| `ESTANDAR-NOMENCLATURA-API.md` | **575** | +75 | OPCIONAL |
| `ESTANDAR-DATABASE-PROFESIONAL.md` | **588** | +88 | OPCIONAL |
| `ESTANDAR-SKILLS.md` | **508** | +8 | LIMITE — no urgente |
| `backend-profesional/07-testing-patterns.md` | **608** | +108 | OPCIONAL |
| `backend-profesional/02-clean-architecture.md` | **540** | +40 | OPCIONAL |

**Total lineas en archivos >500:** 8,577 de 14,607 totales (59% del directorio)

**Nota sobre los 3 archivos reportados >1,400 lineas:** Confirmados: ESTANDAR-SEGURIDAD (1,863), ESTANDAR-TESTING (1,582), ESTANDAR-API (1,453). Los tres superan 1,400 lineas.

---

### 2.7 Criterion 7: 2FN — `guias/` subdir — duplicacion con `docs/50-guides/`

**Estado actual:** El subdirectorio `docs/40-standards/guias/` contiene **un unico archivo** `README.md` (8 lineas) que es un redirect explicito hacia `docs/50-guides/` y `docs/60-portals/`. El contenido fue **migrado** previamente.

**Conclusion:** La migracion ya fue ejecutada. El directorio `guias/` es un stub de redireccion, no un duplicado activo.

**Sin embargo, existe una 2FN potencial residual en los archivos del directorio raiz:**

**V-2FN-001 — `ESTANDAR-TESTING.md` vs `docs/50-guides/testing/`**

`ESTANDAR-TESTING.md` (1,582 lineas) define la estrategia de testing. Paralela a esta, existen en `docs/50-guides/testing/`:
- `TESTING-GUIDE.md` — guia practica de testing (backend + frontend)
- `MANUAL-TESTING-BACKEND.md` — testing manual backend
- `GUIA-COVERAGE-TESTING.md` — estrategia de cobertura
- `GUIA-E2E-PLAYWRIGHT.md` — testing E2E
- `GUIA-ARCHITECTURE-TESTING.md` — architecture tests

`ESTANDAR-TESTING.md` replica parcialmente el contenido de estas guias, en lugar de referenciarlas. Las secciones `## 10. Architecture Tests` y `## 11. Visual Regression Testing` en el estandar contienen codigo de implementacion que deberia vivir en `docs/50-guides/testing/`, no en estandares.

`ESTANDAR-TESTING.md` tiene una seccion `## Referencias Cruzadas` (lineas 1,560-1,573) que correctamente referencia las guias, pero el cuerpo del archivo duplica en lugar de delegar.

**Severidad:** MEDIA. El limite entre "estandar" (que define reglas) y "guia" (que muestra implementacion) no esta bien establecido en este archivo.

**V-2FN-002 — `ESTANDAR-API.md` vs `docs/50-guides/backend/impl/API-STANDARDS.md`**

Existe `docs/50-guides/backend/impl/API-STANDARDS.md` en paralelo a `ESTANDAR-API.md`. Sin auditar el contenido exacto de ambos, la coexistencia de un archivo llamado `API-STANDARDS.md` en guides y `ESTANDAR-API.md` en standards sugiere solapamiento potencial.

**Severidad:** BAJA-MEDIA. Requiere verificacion del contenido de `API-STANDARDS.md`.

**V-2FN-003 — `backend-profesional/07-testing-patterns.md` vs `ESTANDAR-TESTING.md`**

El archivo `backend-profesional/07-testing-patterns.md` (608 lineas) cubre testing patterns para backend NestJS — topico que tambien cubre `ESTANDAR-TESTING.md` seccion `## 2. Unit Tests` y `## 3. Integration Tests`. Existe solapamiento de contenido entre dos archivos del mismo directorio padre.

El `ESTANDAR-TESTING.md` menciona explicitamente a `ESTANDAR-BACKEND-PROFESIONAL` como referencia cruzada, pero ambos definen patrones de test — potencial de divergencia.

**Severidad:** MEDIA. Mismo directorio padre, mismo topico parcial.

---

### 2.8 Criterion 8: Stubs (<10 lineas de contenido real)

| Archivo | Lineas | Tipo de Stub |
|---------|--------|-------------|
| `guias/README.md` | 8 | Redirect puro — STUB legitimo |
| `backend-profesional/08-referencias.md` | 13 | Solo 5 bullets de referencias — THIN |

**S-001 — `guias/README.md` (8 lineas): Stub de redirect**

Contenido valido como stub de redireccion. No hay problema funcional.
**Severidad:** INFORMATIVO.

**S-002 — `backend-profesional/08-referencias.md` (13 lineas): Thin content**

5 bullets de referencias externas. Podria integrarse en `backend-profesional/_INDEX.md` en lugar de existir como archivo separado.
**Severidad:** BAJA. Funciona como separacion de concerns (referencias vs contenido).

---

### 2.9 Criterion 9: Solapamiento de contenido con otras secciones

**O-001 — `ESTANDAR-MEMORIA-TOKENS.md` y `orchestration/directivas/simco/SIMCO-MEMORIA-TOKENS.md`**

El archivo `ESTANDAR-MEMORIA-TOKENS.md` (197 lineas) referencia explicitamente su fuente operacional:
> `**Referencia Operacional:** @MEMORIA-TOKENS -> orchestration/directivas/simco/SIMCO-MEMORIA-TOKENS.md`

El archivo en `docs/40-standards/` es un resumen/facade de la directiva operacional en `orchestration/`. Hay solapamiento intencionalmente controlado con referencia cruzada — aceptable.

**O-002 — `ESTANDAR-GIT.md` y `orchestration/directivas/estandares/`**

El archivo `ESTANDAR-GIT.md` (194 lineas) declara explicitamente:
> `**Fuente de verdad:** orchestration/directivas/estandares/`
> `**Sincronizado:** 2026-01-16`

Mismo patron que O-001 — resumen/facade con fuente de verdad declarada. Aceptable.

**O-003 — `STANDARD-RESPONSIVE.md` y `ADR-050`**

`STANDARD-RESPONSIVE.md` referencia `ADR-050 (Responsive Design Strategy)` como su ADR base. El estandar y el ADR cubren el mismo tema desde angulos distintos (ADR = decision arquitectonica; estandar = reglas de implementacion). La separacion es correcta.

**O-004 — `ESTANDAR-SKILLS.md` y `orchestration/directivas/`**

Los skills de agentes IA tambien estan definidos operacionalmente en `orchestration/`. El estandar en `docs/40-standards/` es la especificacion, mientras que `orchestration/` contiene la implementacion operacional. Separacion correcta.

---

### 2.10 Hallazgo adicional: `STANDARD-RESPONSIVE.md` ausente en indices

**I-001 — `STANDARD-RESPONSIVE.md` no esta listado en `_INDEX.md` ni en `_MAP.md`**

El archivo `STANDARD-RESPONSIVE.md` (207 lineas, fecha 2026-02-26) existe en disco pero **no aparece** en:
- `docs/40-standards/_INDEX.md` (lista 24 estandares — el 25to esta omitido)
- `docs/40-standards/_MAP.md`

El `_INDEX.md` afirma "24 Estandares Activos" en su encabezado. Con `STANDARD-RESPONSIVE.md`, el total real es **25 estandares activos**.

**Severidad:** ALTA. El archivo es invisible para navegacion automatizada e indices.

---

## 3. Resumen Ejecutivo de Hallazgos

### 3.1 Por severidad

| Severidad | Cantidad | Hallazgos |
|-----------|----------|-----------|
| ALTA | 2 | V-1FN-001 (SEGURIDAD 1,863L), I-001 (STANDARD-RESPONSIVE no indexado) |
| MEDIA | 6 | V-1FN-002 (TESTING), V-1FN-003 (API-SEGURIDAD overlap), F-FRONT-001 (frontmatter inconsistente), N-001 (prefijo dual), V-2FN-001 (TESTING vs 50-guides), V-2FN-003 (07-testing-patterns vs ESTANDAR-TESTING) |
| BAJA | 6 | V-1FN-004 (FRONTEND-PROF testing), G-IDX-001 (guias sin _INDEX), G-MAP-001 (backend-prof sin _MAP), G-MAP-002 (guias sin _MAP), N-002 (numeracion backend-prof), S-002 (08-referencias thin) |
| INFORMATIVO | 3 | O-001, O-002, O-003, O-004 (solapamientos controlados e intencionales), S-001 (stub legitimo) |

### 3.2 Tabla consolidada de violaciones

| ID | Criterio | Archivo(s) | Descripcion | Severidad |
|----|----------|-----------|-------------|-----------|
| V-1FN-001 | 1FN | ESTANDAR-SEGURIDAD.md | 2 taxonomias OWASP + 6 temas adicionales en 1 archivo | ALTA |
| I-001 | _INDEX | STANDARD-RESPONSIVE.md | Archivo ausente de _INDEX.md y _MAP.md | ALTA |
| V-1FN-002 | 1FN | ESTANDAR-TESTING.md | Backend+Frontend+E2E+Arch+Visual en 1 archivo | MEDIA |
| V-1FN-003 | 1FN | ESTANDAR-API.md | Seccion seguridad duplica ESTANDAR-SEGURIDAD | MEDIA |
| F-FRONT-001 | Frontmatter | 12 archivos con FM | 3 esquemas distintos (tipo/titulo/title) | MEDIA |
| N-001 | Naming | STANDARD-*.md (6 archivos) | Prefijo STANDARD- (ingles) vs ESTANDAR- (espanol) | MEDIA |
| V-2FN-001 | 2FN | ESTANDAR-TESTING.md | Duplica guias de implementacion de docs/50-guides/testing/ | MEDIA |
| V-2FN-003 | 2FN | 07-testing-patterns.md | Solapa con ESTANDAR-TESTING.md | MEDIA |
| V-1FN-004 | 1FN | ESTANDAR-FRONTEND-PROFESIONAL.md | Incluye testing patterns (duplica ESTANDAR-TESTING) | BAJA |
| G-IDX-001 | _INDEX | guias/ | Subdir sin _INDEX.md | BAJA |
| G-MAP-001 | _MAP | backend-profesional/ | Subdir sin _MAP.md | BAJA |
| G-MAP-002 | _MAP | guias/ | Subdir sin _MAP.md | BAJA |
| N-002 | Naming | backend-profesional/*.md | Minusculas con prefijo numerico vs UPPERCASE del padre | BAJA |
| S-002 | Stub | 08-referencias.md | 13 lineas — thin content | BAJA |
| V-2FN-002 | 2FN | ESTANDAR-API.md | Posible overlap con 50-guides/backend/impl/API-STANDARDS.md | BAJA-MEDIA |

### 3.3 Archivos sin violaciones activas

Los siguientes archivos pasaron todos los criterios:
- `ESTANDAR-CODIGO.md` (218L) — topic coherente, frontmatter OK
- `ESTANDAR-CROSS-SCHEMA-REFERENCES.md` (92L) — OK (metadata inline pero coherente)
- `ESTANDAR-DIAGRAMAS-ER.md` (321L) — OK (un solo topico)
- `ESTANDAR-DOCUMENTACION.md` (250L) — OK
- `ESTANDAR-NOMENCLATURA.md` (138L) — OK (sin frontmatter pero contenido coherente)
- `ESTANDAR-NOMENCLATURA-API.md` (575L) — OK (>500 pero topico coherente; opcional split)
- `ESTANDAR-OBSERVABILIDAD.md` (424L) — OK
- `ESTANDAR-PERFORMANCE.md` (251L) — OK
- `ESTANDAR-METADATA-ITEMS.md` (297L) — OK
- `STANDARD-API.md`, `STANDARD-COMPONENT.md`, `STANDARD-IMPORTS.md`, `STANDARD-TYPES.md`, `STANDARD-UX-PATTERNS.md` — OK en contenido (solo violacion de prefijo N-001)
- `STANDARD-RESPONSIVE.md` — OK en contenido (violacion I-001 solo en indices)
- `backend-profesional/01` a `06` — OK
- `backend-profesional/_INDEX.md` — OK

---

## 4. Recomendaciones Priorizadas

> Estas recomendaciones son para registro. La auditoria es read-only — no se ejecutaron cambios.

### P0 — Correcciones inmediatas (0 riesgo, alta visibilidad)

1. **[I-001]** Agregar `STANDARD-RESPONSIVE.md` a `_INDEX.md` y `_MAP.md`. Actualizar contador de "24 → 25 Estandares Activos".

### P1 — Splits recomendados (sesion dedicada)

2. **[V-1FN-001]** Dividir `ESTANDAR-SEGURIDAD.md` en:
   - `ESTANDAR-SEGURIDAD-WEB.md` (~480L)
   - `ESTANDAR-SEGURIDAD-API.md` (~820L)
   - El archivo original se convierte en stub redirect (como hizo ESTANDAR-BACKEND-PROFESIONAL.md)

3. **[V-1FN-002]** Dividir `ESTANDAR-TESTING.md` en:
   - `ESTANDAR-TESTING.md` — piramide, unit tests, coverage, naming conventions (~600L)
   - `ESTANDAR-TESTING-INTEGRACION.md` — integration tests, E2E, architecture tests (~500L)
   - Mover visual regression a `docs/50-guides/testing/GUIA-VISUAL-REGRESSION.md`

### P2 — Normalizacion (backlog)

4. **[N-001]** Definir prefijo canonico (`ESTANDAR-` vs `STANDARD-`). Opcion A: renombrar `STANDARD-*` a `ESTANDAR-*` con sufijo `-FRONTEND`. Opcion B: mantener dual con nota explicita en `_INDEX.md`.

5. **[F-FRONT-001]** Definir esquema YAML frontmatter canonico para todo el directorio y aplicar a los 16 archivos sin frontmatter.

6. **[G-MAP-001]** Crear `backend-profesional/_MAP.md`.

7. **[V-2FN-001]** Reemplazar secciones de implementacion en `ESTANDAR-TESTING.md` (Architecture Tests, Visual Regression) con referencias cruzadas a `docs/50-guides/testing/`.

---

## 5. Metricas del Directorio

| Metrica | Valor |
|---------|-------|
| Total archivos (incluyendo subdirs) | 38 |
| Archivos de contenido principal | 28 |
| Archivos de navegacion (_INDEX, _MAP, README) | 6 |
| Archivos con frontmatter YAML | 12 (43%) |
| Archivos sin frontmatter | 16 (57%) |
| Archivos >500 lineas | 10 |
| Archivos >1,400 lineas | 3 |
| Archivos <10 lineas (stubs) | 2 |
| Estandares indexados en _INDEX.md | 24 |
| Estandares reales en disco | 25 (STANDARD-RESPONSIVE omitido) |
| Violaciones 1FN | 4 (1 alta, 2 media, 1 baja) |
| Gaps _INDEX.md | 1 |
| Gaps _MAP.md | 2 |
| Violaciones prefijo de nombre | 6 archivos (N-001) |

---

*Auditoria completada: 2026-02-27 — Solo lectura, sin modificaciones*
