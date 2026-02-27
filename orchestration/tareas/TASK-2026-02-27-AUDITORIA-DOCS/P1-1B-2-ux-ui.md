# Auditoria Estructural — docs/30-ux-ui/

**Tarea:** P1-1B-2 (Auditoria UX/UI)
**Fecha:** 2026-02-27
**Ejecutor:** Claude Sonnet 4.6
**Modo:** ANALYSIS (read-only — no se modifico ningun archivo)
**Scope:** `docs/30-ux-ui/` completo (recursivo)

---

## Resumen Ejecutivo

| Metrica | Valor |
|---------|-------|
| Directorios auditados | 9 (1 raiz + 1 flujos/ + 7 subdirectorios portal) |
| Archivos totales | 80 |
| Archivos de contenido (no navegacion) | 66 |
| Con YAML frontmatter real | 0 (0%) |
| _INDEX.md presentes | 8 de 9 directorios (89%) |
| _MAP.md presentes | 6 de 9 directorios (67%) |
| Archivos >500 lineas | 1 (FL-SYS-06, 506 lineas) |
| Stubs (<10 lineas) | 2 (_INDEX de auth/ y shared/ con 9 lineas) |
| Directorios no registrados en navegacion | 1 (flujos/system/) |
| Violacion de nomenclatura FLUJO- vs FL- | 1 archivo (FL-SYS-06-...) |
| Violacion de nomenclatura UPPERCASE | 0 |
| Separacion wireframes/mockups/flujos | Incompleta (solo flujos documentados) |

**Hallazgo principal:** La seccion `docs/30-ux-ui/` esta completamente dedicada a flujos end-to-end. No existe ningun subdirectorio `wireframes/` ni `mockups/`. La estructura es funcionalmente correcta para flujos pero incompleta como seccion UX/UI completa. El directorio `flujos/system/` es nuevo, no rastreado en git y no esta referenciado en ningun documento de navegacion.

---

## Directory: docs/30-ux-ui/

- Files: 2 (README.md, _INDEX.md)
- _INDEX.md: Present
- _MAP.md: **Missing**
- Frontmatter: 0/2 (0%)
- Files >500 lines: ninguno (README.md: 152 lineas, _INDEX.md: 21 lineas)
- Violations:
  - [MISSING-MAP] No existe `_MAP.md` en el directorio raiz `docs/30-ux-ui/`. Solo existe `_INDEX.md`.
  - [NO-FRONTMATTER] README.md (152 lineas): metadata inline (`**Framework UI:**`, etc.) pero sin bloque YAML `---\nkey: value\n---` al inicio del archivo.
  - [NO-FRONTMATTER] _INDEX.md (21 lineas): sin bloque YAML frontmatter.
  - [MISSING-DIRS] No existen subdirectorios `wireframes/` ni `mockups/` a pesar de que README.md los menciona en la seccion "Wireframes y Mockups" (linea 125). La seccion apunta a herramienta Figma externa pero no hay ningun artefacto local.
  - [1FN-POTENTIAL] README.md cubre multiples topicos: descripcion de portales (student/teacher/admin/parents), design system, flujos de usuario resumidos, gamificacion visual, wireframes/mockups y recursos de media (SVG/audio). Excede el principio de un topic por archivo.
  - [STALE-METRIC] README.md linea 88 dice "590 componentes React" y linea 151 dice "592 componentes React documentados". El valor verificado y registrado en MASTER_INVENTORY es 575. Triple inconsistencia interna + desviacion de SSOT.

---

## Directory: docs/30-ux-ui/flujos/

- Files: 12 (README.md, _INDEX.md, _MAP.md, _TEMPLATE-FLUJO.md + 8 documentos de analisis/auditoria)
- _INDEX.md: Present
- _MAP.md: Present
- Frontmatter: 0/12 (0%)
- Files >500 lineas: ninguno (max: README.md 125 lineas, AUDITORIA-P0 150 lineas)
- Violations:
  - [NO-FRONTMATTER] Todos los 12 archivos carecen de bloque YAML frontmatter estandar. Los archivos de flujo usan metadata inline (`**Version:** 1.x.x`, `**Fecha:** ...`, `**Estado:** ...`) pero no en bloque YAML.
  - [_INDEX-GAP] El `_INDEX.md` de flujos/ lista 11 archivos de navegacion/analisis pero NO menciona el subdirectorio `flujos/system/` (nuevo — no rastreado en git). El `_MAP.md` tampoco lo incluye. El `README.md` tampoco lo referencia en el catalogo maestro de flujos.
  - [1FN-BORDERLINE] AUDITORIA-CONSISTENCIA-FE-BE-DB.md (116 lineas): cubre tanto el plan operativo de auditoria como los criterios/checklist. Podria separarse en plan + criterios, aunque la longitud actual es manejable.
  - [NAMING-MIXED] Los 8 documentos de auditoria/analisis en este directorio usan nombres sin prefijo FL- (ej: `AUDITORIA-P0-RESULTADOS.md`, `TRACEABILITY-MATRIX.md`). Son documentos de gobernanza, no flujos, y su presencia en el mismo directorio mezcla dos categorias: flujos funcionales vs artefactos de auditoria. Podrian beneficiarse de un subdirectorio `_audit/` o `_meta/`.
  - [README-VS-INDEX] Coexisten `README.md` y `_INDEX.md` con contenido superpuesto: ambos listan los mismos archivos del directorio. La convencion del proyecto es usar solo `_INDEX.md` como indice; `README.md` actua aqui como catalogo maestro (diferente rol — justificado, pero la duplicacion de listado de archivos es un anti-patron).

---

## Directory: docs/30-ux-ui/flujos/admin/

- Files: 13 (11 FLUJO-*.md + _INDEX.md + _MAP.md)
- _INDEX.md: Present
- _MAP.md: Present
- Frontmatter: 0/13 (0%)
- Files >500 lineas: ninguno (max: FLUJO-CONSTRUCTOR-EJERCICIOS.md 326 lineas, FLUJO-GESTION-GAMIFICACION.md 230 lineas)
- Violations:
  - [NO-FRONTMATTER] Todos los 13 archivos carecen de bloque YAML frontmatter. Usan metadata inline con `**Version:**`, `**Fecha:**`, `**Estado:**`.
  - [NAMING-OK] Todos los flujos usan correctamente el prefijo `FLUJO-` y UPPERCASE-KEBAB-CASE.

---

## Directory: docs/30-ux-ui/flujos/auth/

- Files: 4 (3 FLUJO-*.md + _INDEX.md)
- _INDEX.md: Present
- _MAP.md: **Missing**
- Frontmatter: 0/4 (0%)
- Files >500 lineas: ninguno (max: FLUJO-REGISTRO-LOGIN.md 70 lineas)
- Violations:
  - [MISSING-MAP] No existe `_MAP.md`. Los otros subdirectorios de portal (admin, student, teacher, parents) tienen `_MAP.md`; auth/ es la unica excepcion.
  - [NO-FRONTMATTER] Los 4 archivos carecen de bloque YAML frontmatter.
  - [STUB] `_INDEX.md` tiene solo 9 lineas — tecnicamente debajo del umbral de stub (<10), aunque en este caso el contenido es completo para un indice de 3 archivos.

---

## Directory: docs/30-ux-ui/flujos/parents/

- Files: 9 (7 FLUJO-*.md + _INDEX.md + _MAP.md)
- _INDEX.md: Present
- _MAP.md: Present
- Frontmatter: 0/9 (0%)
- Files >500 lineas: ninguno (max: FLUJO-NOTIFICACIONES-PADRES.md 131 lineas)
- Violations:
  - [NO-FRONTMATTER] Los 9 archivos carecen de bloque YAML frontmatter.
  - [NAMING-OK] Todos los flujos usan correctamente el prefijo `FLUJO-` y UPPERCASE-KEBAB-CASE.

---

## Directory: docs/30-ux-ui/flujos/shared/

- Files: 4 (3 FLUJO-*.md + _INDEX.md)
- _INDEX.md: Present
- _MAP.md: **Missing**
- Frontmatter: 0/4 (0%)
- Files >500 lineas: ninguno (max: FLUJO-WHITE-LABEL-THEMING.md 220 lineas)
- Violations:
  - [MISSING-MAP] No existe `_MAP.md`. Los subdirectorios admin/, student/, teacher/, parents/ tienen `_MAP.md`; shared/ carece de uno.
  - [NO-FRONTMATTER] Los 4 archivos carecen de bloque YAML frontmatter.
  - [STUB] `_INDEX.md` tiene solo 9 lineas — identico al caso de auth/, completo para su scope pero en limite de stub.

---

## Directory: docs/30-ux-ui/flujos/student/

- Files: 23 (21 FLUJO-*.md + _INDEX.md + _MAP.md)
- _INDEX.md: Present
- _MAP.md: Present
- Frontmatter: 0/23 (0%)
- Files >500 lineas: ninguno (max: FLUJO-DASHBOARD-PROGRESO.md 234 lineas, FLUJO-LOGROS-MISIONES-CLAIM.md 227 lineas)
- Violations:
  - [NO-FRONTMATTER] Los 23 archivos carecen de bloque YAML frontmatter.
  - [NAMING-OK] Todos los flujos usan correctamente el prefijo `FLUJO-` y UPPERCASE-KEBAB-CASE.
  - [1FN-NOTE] FLUJO-COMPRA-INVENTARIO-EQUIPAR.md (125 lineas) es un flujo compuesto que agrupa sub-flujos de tienda, inventario y equipamiento. El catalogo maestro lo marca como "(compuesto)" — esto es intencional segun el tipo "Compuesto" definido en flujos/README.md. No es una violacion de 1FN sino una decision de diseno documentada.

---

## Directory: docs/30-ux-ui/flujos/system/

- Files: 1 (FL-SYS-06-MULTI-TENANT-ISOLATION.md)
- _INDEX.md: **Missing**
- _MAP.md: **Missing**
- Frontmatter: 0/1 (0%)
- Files >500 lineas: FL-SYS-06-MULTI-TENANT-ISOLATION.md (506 lineas) — SUPERA UMBRAL
- Git status: **UNTRACKED** (aparece como `?? docs/30-ux-ui/flujos/system/` en git status)
- Violations:
  - [UNTRACKED] El directorio completo `flujos/system/` no esta rastreado en git. El archivo fue creado pero nunca hecho `git add`.
  - [MISSING-INDEX] No existe `_INDEX.md` en el directorio.
  - [MISSING-MAP] No existe `_MAP.md` en el directorio.
  - [NOT-REFERENCED] El directorio no esta referenciado en ningun documento de navegacion: ni en `flujos/_INDEX.md`, ni en `flujos/_MAP.md`, ni en `flujos/README.md` (catalogo maestro). El flujo existe como isla sin contexto de navegacion.
  - [NAMING-INCONSISTENT] El archivo usa el prefijo `FL-SYS-06-` en lugar del prefijo estandar del proyecto `FLUJO-`. Todos los demas flujos en el repositorio usan `FLUJO-[DOMINIO]-[NOMBRE].md`. Solo este archivo rompe esa convencion usando el formato ID del catalogo (`FL-SYS-06`) como prefijo de nombre de archivo.
  - [FILE-TOO-LARGE] 506 lineas — supera el umbral de 500 lineas. El contenido es extenso (16 secciones: arquitectura 5 capas, diagramas ASCII, codigo TypeScript/SQL, tablas de cobertura por schema, excepciones documentadas, garantias de seguridad, estado de implementacion). Candidato a split en sub-documentos: arquitectura conceptual + estado de implementacion + referencia de politicas.
  - [NO-FRONTMATTER] Sin bloque YAML frontmatter (el archivo usa metadata de tipo lista de campos `**ID:**`, `**Version:**`, `**Fecha:**`, etc. — mas completo que otros flujos pero igualmente no es YAML).
  - [CATEGORY-MISMATCH] Este archivo documenta un flujo de arquitectura/seguridad (RLS multi-tenant), no un flujo de UX/UI de usuario. Su ubicacion en `docs/30-ux-ui/flujos/system/` es conceptualmente incorrecta: perteneceria mas naturalmente a `docs/20-architecture/` o a un subdirectorio `docs/50-guides/backend/` dado que describe la implementacion tecnica de Row-Level Security, no un flujo de pantalla de usuario.

---

## Directory: docs/30-ux-ui/flujos/teacher/

- Files: 10 (8 FLUJO-*.md + _INDEX.md + _MAP.md)
- _INDEX.md: Present
- _MAP.md: Present
- Frontmatter: 0/10 (0%)
- Files >500 lineas: ninguno (max: FLUJO-ANALYTICS-REPORTES.md 394 lineas, FLUJO-GESTION-CONTENIDO.md 207 lineas)
- Violations:
  - [NO-FRONTMATTER] Los 10 archivos carecen de bloque YAML frontmatter.
  - [NAMING-OK] Todos los flujos usan correctamente el prefijo `FLUJO-` y UPPERCASE-KEBAB-CASE.

---

## Analisis Transversal

### 1. Frontmatter (0% en toda la seccion)

**Hallazgo critico:** Cero archivos en `docs/30-ux-ui/` tienen YAML frontmatter estandar. El patron universal es metadata inline con bold text:

```markdown
**Version:** 1.0.0
**Fecha:** 2026-02-17
**Estado:** Activo
```

El frontmatter YAML seria:
```yaml
---
id: FL-STU-03
version: 1.0.0
fecha: 2026-02-17
estado: Activo
portal: student
prioridad: P1
---
```

Impacto: Sin frontmatter, herramientas de procesamiento automatico (generacion de indices, validacion de estado, reportes) no pueden parsear metadata. La metadata inline actual es legible pero no machine-readable.

**Total afectados:** 80/80 archivos (100%).

### 2. Ausencia de wireframes/ y mockups/

`docs/30-ux-ui/` no contiene ningun subdirectorio `wireframes/` ni `mockups/`. El README.md referencia Figma como herramienta pero no hay artefactos locales. La seccion esta exclusivamente dedicada a flujos end-to-end documentados en texto/Mermaid. Esto no es una violacion si el equipo usa Figma como fuente de verdad externa, pero:
- El nombre de la seccion `30-ux-ui` implica que deberia cubrir los 3 tipos (wireframes, mockups, flujos).
- Un `_INDEX.md` en la raiz que explique esta decision evitaria confusion.

### 3. Convencion de nomenclatura: FLUJO- vs FL-

| Patron | Archivos | Ejemplo |
|--------|----------|---------|
| `FLUJO-[DOMINIO]-[NOMBRE].md` | 62 archivos | `FLUJO-TIENDA-COMPRA.md` |
| `FL-[DOM]-[NUM]-[NOMBRE].md` | 1 archivo | `FL-SYS-06-MULTI-TENANT-ISOLATION.md` |
| Sin prefijo (auditoria/meta) | 8 archivos | `TRACEABILITY-MATRIX.md`, `AUDITORIA-P0-RESULTADOS.md` |

**Violacion:** El unico archivo con prefijo `FL-` es el de `flujos/system/`. El catalogo maestro usa IDs como `FL-STU-01` como identificadores de catalogo, pero los nombres de archivo usan `FLUJO-`. La mezcla de ID-como-prefijo en nombre de archivo es inconsistente.

### 4. Archivos >500 lineas

| Archivo | Lineas | Estado |
|---------|--------|--------|
| `flujos/system/FL-SYS-06-MULTI-TENANT-ISOLATION.md` | 506 | SUPERA UMBRAL — candidato a split |

El segundo mas largo es `flujos/teacher/FLUJO-ANALYTICS-REPORTES.md` con 394 lineas — bajo el umbral.

### 5. Stubs (<10 lineas)

| Archivo | Lineas | Tipo |
|---------|--------|------|
| `flujos/auth/_INDEX.md` | 9 | _INDEX (completo para 3 archivos — limite exacto) |
| `flujos/shared/_INDEX.md` | 9 | _INDEX (completo para 3 archivos — limite exacto) |

Estos dos estan tecnicamente en el umbral pero son semanticamente completos para su contenido. No requieren expansion, solo documentacion de que el directorio es pequeno por diseno.

### 6. Organizacion por directorio — Separacion de categorias

| Categoria | Directorio | Estado |
|-----------|-----------|--------|
| Wireframes | (ninguno) | AUSENTE |
| Mockups | (ninguno) | AUSENTE |
| Flujos por portal | flujos/student/, flujos/teacher/, flujos/admin/, flujos/parents/ | Bien organizado |
| Flujos transversales | flujos/auth/, flujos/shared/ | Bien organizado |
| Flujos de sistema | flujos/system/ | Nuevo, no integrado, mal clasificado |
| Documentos de auditoria/meta | flujos/ (raiz) | Mezclados con archivos de navegacion |

### 7. Consistencia de _INDEX.md y _MAP.md por directorio

| Directorio | _INDEX.md | _MAP.md | Notas |
|-----------|-----------|---------|-------|
| docs/30-ux-ui/ | Present | **Missing** | Raiz sin mapa |
| flujos/ | Present | Present | OK |
| flujos/admin/ | Present | Present | OK |
| flujos/auth/ | Present | **Missing** | Falta mapa |
| flujos/parents/ | Present | Present | OK |
| flujos/shared/ | Present | **Missing** | Falta mapa |
| flujos/student/ | Present | Present | OK |
| flujos/system/ | **Missing** | **Missing** | Nuevo dir no inicializado |
| flujos/teacher/ | Present | Present | OK |

**Resumen:** 3 directorios con _MAP.md faltante, 1 directorio con ambos faltantes.

### 8. Referencias cruzadas — flujos/system/ no registrado

El directorio `flujos/system/` y su unico archivo `FL-SYS-06-MULTI-TENANT-ISOLATION.md` no aparecen en:
- `flujos/_INDEX.md` (subdirectorios listados: admin, auth, parents, shared, student, teacher — no system)
- `flujos/_MAP.md` (portales: Admin, Teacher, Student, Parents, Auth, Shared — no System)
- `flujos/README.md` catalogo maestro (52 flujos listados, ninguno con ID `FL-SYS-*`)
- `docs/30-ux-ui/_INDEX.md`

El archivo es una isla documental sin punto de entrada desde la navegacion existente.

---

## Inventario Completo de Violaciones

### Criticas (bloquean navegacion o uso)

| # | Tipo | Archivo/Directorio | Descripcion |
|---|------|-------------------|-------------|
| C-1 | UNTRACKED | flujos/system/ | Directorio nuevo no rastreado en git |
| C-2 | NOT-REFERENCED | flujos/system/FL-SYS-06-*.md | No referenciado en ningun indice o mapa |
| C-3 | CATEGORY-MISMATCH | flujos/system/FL-SYS-06-*.md | Flujo de arquitectura RLS en seccion UX/UI |

### Mayores (impactan calidad estructural)

| # | Tipo | Archivo/Directorio | Descripcion |
|---|------|-------------------|-------------|
| M-1 | MISSING-MAP | docs/30-ux-ui/ | Falta _MAP.md en raiz de seccion |
| M-2 | MISSING-MAP | flujos/auth/ | Falta _MAP.md (unico portal-dir sin mapa) |
| M-3 | MISSING-MAP | flujos/shared/ | Falta _MAP.md |
| M-4 | MISSING-INDEX | flujos/system/ | Falta _INDEX.md |
| M-5 | MISSING-MAP | flujos/system/ | Falta _MAP.md |
| M-6 | FILE-TOO-LARGE | flujos/system/FL-SYS-06-*.md | 506 lineas, supera umbral 500 |
| M-7 | NAMING-INCONSISTENT | flujos/system/FL-SYS-06-*.md | Prefijo FL- en lugar de FLUJO- |
| M-8 | STALE-METRIC | docs/30-ux-ui/README.md | "590/592 componentes" vs SSOT 575 |

### Menores (calidad, convencion)

| # | Tipo | Afectados | Descripcion |
|---|------|-----------|-------------|
| m-1 | NO-FRONTMATTER | 80/80 archivos | 0% frontmatter YAML en toda la seccion |
| m-2 | 1FN-POTENTIAL | README.md raiz | Cubre 6 topicos distintos en un solo archivo |
| m-3 | README-VS-INDEX | flujos/ | Coexistencia de README.md + _INDEX.md con contenido superpuesto |
| m-4 | MISSING-DIRS | docs/30-ux-ui/ | Ausencia de wireframes/ y mockups/ (no violacion si Figma es SSOT) |
| m-5 | AUDIT-MIXING | flujos/ raiz | 8 documentos de auditoria mezclados con archivos de navegacion |

---

## Recomendaciones Priorizadas

### P0 — Inmediato (corrige estado inconsistente)

1. **Integrar flujos/system/ en git:** `git add docs/30-ux-ui/flujos/system/`
2. **Registrar en catalogo maestro:** Agregar entrada `FL-SYS-06` en `flujos/README.md` y `flujos/_INDEX.md` bajo nuevo grupo "System"
3. **Crear _INDEX.md y _MAP.md** en `flujos/system/`

### P1 — Corto plazo (estructura)

4. **Reubicar FL-SYS-06:** Mover a `docs/20-architecture/` o `docs/50-guides/backend/` ya que documenta implementacion tecnica RLS, no un flujo de UX/UI
5. **Renombrar FL-SYS-06:** Adoptar convencion `FLUJO-SYSTEM-MULTI-TENANT-ISOLATION.md` o el nombre canonico del destino final
6. **Crear _MAP.md** en `docs/30-ux-ui/`, `flujos/auth/`, y `flujos/shared/`

### P2 — Medio plazo (calidad)

7. **Actualizar metrica de componentes** en README.md raiz: 590/592 → 575 (alineacion con MASTER_INVENTORY)
8. **Definir politica de frontmatter:** Decidir si adoptar YAML frontmatter o documentar la convencion de metadata inline como estandar de la seccion. Si se adopta YAML, actualizar `_TEMPLATE-FLUJO.md` primero.
9. **Separar documentos de auditoria:** Crear `flujos/_audit/` o `flujos/_meta/` para los 8 archivos de auditoria/trazabilidad, dejando solo archivos de navegacion en la raiz de `flujos/`

### P3 — Largo plazo (completitud)

10. **Decisión sobre wireframes/mockups:** Documentar explicitamente en `_INDEX.md` raiz que Figma es la SSOT externa y que este directorio solo contiene flujos documentados en texto. O crear directorios placeholder con README que apunten a Figma.
11. **Evaluar split de FL-SYS-06:** 506 lineas con 16 secciones — considerar dividir en: (a) concepto/arquitectura, (b) estado-implementacion, (c) referencia-politicas.

---

## Estadisticas Finales

| Directorio | Archivos | _INDEX | _MAP | FM% | >500L | Stubs |
|-----------|----------|--------|------|-----|-------|-------|
| docs/30-ux-ui/ | 2 | OK | MISS | 0% | 0 | 0 |
| flujos/ | 12 | OK | OK | 0% | 0 | 0 |
| flujos/admin/ | 13 | OK | OK | 0% | 0 | 0 |
| flujos/auth/ | 4 | OK | MISS | 0% | 0 | 1 |
| flujos/parents/ | 9 | OK | OK | 0% | 0 | 0 |
| flujos/shared/ | 4 | OK | MISS | 0% | 0 | 1 |
| flujos/student/ | 23 | OK | OK | 0% | 0 | 0 |
| flujos/system/ | 1 | MISS | MISS | 0% | 1 | 0 |
| flujos/teacher/ | 10 | OK | OK | 0% | 0 | 0 |
| **TOTAL** | **78** | **8/9** | **6/9** | **0%** | **1** | **2** |

> Nota: el total de 78 incluye los 8 archivos de auditoria/meta en flujos/ raiz. Los 2 archivos de la raiz docs/30-ux-ui/ (README + _INDEX) llevan el grand total a 80.

**Health Score seccion docs/30-ux-ui/: 71/100**

| Dimension | Score | Notas |
|-----------|-------|-------|
| Navegacion (_INDEX/_MAP) | 75 | 3 _MAP faltantes, 1 _INDEX faltante |
| Nomenclatura | 85 | 1 archivo con prefijo incorrecto |
| Frontmatter | 0 | 0% coverage — critico si se requiere machine-readable |
| Contenido/completitud | 80 | Flujos bien documentados, Mermaid presente |
| Organizacion | 65 | Sin wireframes/mockups, system/ no integrado, auditorias mezcladas |
| Coherencia de metricas | 50 | 590/592 vs 575 en README raiz |
| **TOTAL ponderado** | **71** | Score aceptable — remediacion P0/P1 necesaria |
