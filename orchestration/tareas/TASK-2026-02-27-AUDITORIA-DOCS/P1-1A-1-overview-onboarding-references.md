# Auditoria Estructural: docs/00-overview, docs/70-onboarding, docs/80-references

**Tarea:** TASK-2026-02-27-AUDITORIA-DOCS
**Fase:** P1 | **Sub-tarea:** 1A-1
**Fecha:** 2026-02-27
**Agente:** Claude Sonnet 4.6
**Modo:** ANALYSIS (read-only — no se modificaron archivos)

---

## Resumen Ejecutivo

| Seccion | Archivos MD | Directorios | _INDEX | _MAP | Frontmatter | >500 lns | Stubs |
|---------|-------------|-------------|--------|------|-------------|----------|-------|
| 00-overview | 22 | 3 (directivas/, migracion/ + raiz) | Presente | **Ausente** | 10/22 (45%) | 1 (DEPLOYMENT) | 4 |
| 70-onboarding | 6 | 1 (raiz) | Presente | Presente | 5/6 (83%) | 0 | 0 |
| 80-references | 9 | 4 (raiz, knowledge-base/, transversal/, arquitectura/, correcciones/) | Parcial (solo raiz) | Parcial | 6/9 (67%) | 0 | 0 |

**Hallazgos criticos:**
1. `docs/00-overview/` carece de `_MAP.md` — unico top-level sin mapa de navegacion.
2. `docs/80-references/transversal/arquitectura/` carece de `_INDEX.md` y `_MAP.md`.
3. `docs/80-references/transversal/correcciones/` carece de `_INDEX.md`.
4. `docs/80-references/knowledge-base/` carece de `_INDEX.md` y `_MAP.md`.
5. `docs/00-overview/DEVOPS.md` (282 lns) mezcla 6 topicos distintos — violacion 1FN clara.
6. `docs/00-overview/README.md` referencia `MODULOS-SISTEMA.md` que no existe en disco.
7. `docs/00-overview/_INDEX.md` lista `MODULOS.md` dos veces con descripciones distintas.
8. `docs/80-references/transversal/correcciones/_MAP.md` (434 lns) contiene contenido operativo detallado (historial de CORRs), no es un mapa de navegacion — violacion 1FN.

---

## Section: docs/00-overview

- **Files:** 22 archivos .md (+ 1 imagen .jpeg)
- **Directories:** 3 (raiz implícita + directivas/ + migracion/)
- **_INDEX.md:** Presente (raiz: `/docs/00-overview/_INDEX.md`, 36 lns; directivas/: `directivas/_INDEX.md`, 100 lns)
- **_MAP.md:** **AUSENTE** — La seccion `00-overview` es el unico top-level de `docs/` sin `_MAP.md`.
- **Frontmatter (YAML `---`):** 10 / 22 archivos (45%)
  - CON frontmatter: `GLOSARIO.md`, `DEPLOYMENT.md`, `DEVOPS.md`, `TESTING-STRATEGY.md`, `MODULOS.md`, `migracion/_MAP-FASE-5.md`, `migracion/README-FASE-5.md`, `migracion/README.md`, `directivas/_INDEX.md`, `REPORTE-INTEGRAL-2026-01-20.md`
  - SIN frontmatter (12): `_INDEX.md`, `ARQUITECTURA-TECNICA.md`, `COMANDOS-VALIDACION.md`, `ESTADO-ACTUAL.md`, `ESTRUCTURA-DOCS.md`, `GAMIFICACION.md`, `GOBIERNO-SIMCO.md`, `IDENTIDAD.md`, `METRICAS.md`, `MODULOS-EDUCATIVOS.md`, `ONBOARDING.md`, `PORTALES.md`, `README.md`, `REQUERIMIENTOS.md`, `VISION.md`, `VISION-ALCANCE.md`
- **Files >500 lines:** 1
  - `DEPLOYMENT.md` — 509 lineas

### Estructura de directorios

```
docs/00-overview/
├── _INDEX.md                     (36 lns) — indice de la seccion
├── README.md                     (41 lns) — puerta de entrada
├── IDENTIDAD.md                  (29 lns)
├── VISION.md                     (26 lns)
├── VISION-ALCANCE.md             (3 lns)  — redirect stub
├── ONBOARDING.md                 (7 lns)  — redirect stub
├── ARQUITECTURA-TECNICA.md       (33 lns)
├── MODULOS.md                    (453 lns)
├── MODULOS-EDUCATIVOS.md         (23 lns)
├── PORTALES.md                   (17 lns)
├── GAMIFICACION.md               (21 lns)
├── METRICAS.md                   (19 lns)
├── GOBIERNO-SIMCO.md             (19 lns)
├── REQUERIMIENTOS.md             (21 lns)
├── ESTRUCTURA-DOCS.md            (30 lns)
├── ESTADO-ACTUAL.md              (20 lns)
├── COMANDOS-VALIDACION.md        (31 lns)
├── GLOSARIO.md                   (216 lns)
├── TESTING-STRATEGY.md           (258 lns)
├── DEVOPS.md                     (282 lns)
├── DEPLOYMENT.md                 (509 lns) ← >500 lns
├── REPORTE-INTEGRAL-2026-01-20.md (110 lns)
├── Logo_Gamilit.jpeg             [imagen - no auditada]
├── directivas/
│   └── _INDEX.md                 (100 lns)
└── migracion/
    ├── README.md                 (27 lns)
    ├── README-FASE-5.md          (36 lns)
    └── _MAP-FASE-5.md            (30 lns)
```

### Naming violations

- **`migracion/`** — Directorio con nombre en minusculas. Convencion del proyecto usa UPPERCASE-KEBAB-CASE para docs (o bien nombres descriptivos con mayuscula inicial si son carpetas de navegacion legacy). Inconsistente con `directivas/` que tambien va en minusculas pero ambos difieren del estandar `UPPERCASE` de archivos. Nivel: MENOR (afecta consistencia, no funcionalidad).
- **`directivas/`** — Mismo caso que `migracion/`. Nivel: MENOR.
- **`Logo_Gamilit.jpeg`** — Archivo de imagen con nombre mezclado (PascalCase + underscore). No es .md asi que aplica solo como observacion.
- **`migracion/README.md`** y **`migracion/README-FASE-5.md`** — Usan `README` en lugar de seguir el patron `_INDEX.md`/nombre canonico. Sin embargo, el propio estandar acepta `README.md` como puerta de entrada, asi que es MENOR.

### 1FN violations

#### VIOLACION ALTA: `DEVOPS.md` (282 lineas) — 6 topicos mezclados

El archivo mezcla los siguientes topicos independientes en un solo documento:

| Topico | Lineas aprox | Deberia ser |
|--------|-------------|-------------|
| Configuracion WSL2 y networking | 1-50 | DEVOPS-WSL2.md o seccion de AMBIENTES-DEV-PROD |
| Docker Compose desarrollo | 50-82 | DEVOPS-DOCKER.md |
| Database Management (recrear BD, backup) | 85-110 | Redirect a scripts de BD |
| Build process backend | 113-130 | Duplica COMANDOS-VALIDACION.md |
| Build process frontend | 130-147 | Duplica COMANDOS-VALIDACION.md |
| Deployment production | 150-216 | Duplica contenido de DEPLOYMENT.md |
| Kubernetes Readiness | 185-216 | Deberia estar en DEPLOYMENT.md o seccion propia |
| Monitoring / Health Checks | 218-240 | DEVOPS-MONITORING.md |
| Git Workflow | 242-265 | Duplica CLAUDE.md sección Regla 4 |
| Security Checklist | 267-280 | DEVOPS-SECURITY.md |

**Diagnostico:** `DEVOPS.md` es un "doc colchon" que agrega todo lo que no encaja en otro archivo. Viola 1FN al tener 10 responsabilidades distintas.

#### VIOLACION MEDIA: `DEPLOYMENT.md` (509 lineas) — 4 topicos

| Topico | Lineas aprox |
|--------|-------------|
| Architecture Overview + diagrama | 1-50 |
| Server Details + Domains | 51-76 |
| PM2 Configuration (ambos procesos) | 78-133 |
| Nginx + HTTPS + SSL | 136-210 |
| Nginx config blocks | 210-300 |
| Deploy workflow (comandos paso a paso) | 300-430 |
| Rollback + Health checks | 430-509 |

El documento tiene un topico principal (deployment) pero combina infraestructura Nginx, PM2 config, y procedimiento operativo. Podria dividirse en `DEPLOYMENT-INFRA.md` y `DEPLOYMENT-RUNBOOK.md`. Nivel: MEDIA (coherente tematicamente pero extenso).

#### VIOLACION BAJA: `README.md` referencia archivo inexistente

Linea 18 de `README.md`:
```
| [MODULOS-SISTEMA.md](./MODULOS-SISTEMA.md) | 23 modulos por dominio funcional |
```
El archivo `MODULOS-SISTEMA.md` NO existe en disco. Existe `MODULOS.md` (453 lns). El `_INDEX.md` lista `MODULOS.md` correctamente. `README.md` tiene un enlace roto.

#### VIOLACION BAJA: `_INDEX.md` duplica entrada de `MODULOS.md`

Lineas 13 y 29 de `_INDEX.md`:
```
| [MODULOS.md](./MODULOS.md) | Catalogo de modulos funcionales (23 modulos) |
...
| [MODULOS.md](./MODULOS.md) | Catalogo de modulos del sistema (23 modulos) |
```
El mismo archivo aparece dos veces con descripciones ligeramente distintas.

### Stubs (<10 lines de contenido efectivo)

| Archivo | Lineas totales | Tipo | Observacion |
|---------|---------------|------|-------------|
| `VISION-ALCANCE.md` | 3 | Redirect stub | Solo contiene titulo + 1 linea de redirect. Util pero muy pequeño. |
| `ONBOARDING.md` | 7 | Redirect stub | 4 lineas de contenido real, 3 enlaces. Util como puente. |
| `PORTALES.md` | 17 | Contenido real minimo | 9 lineas de tabla + 2 referencias. Podria expandirse o consolidarse. |
| `METRICAS.md` | 19 | Proxy/redirect | 7 lineas utiles. Funcionalmente correcto (evita duplicar SSOT). |

**Nota:** Los stubs `VISION-ALCANCE.md` y `ONBOARDING.md` son redirects intencionales segun `_INDEX.md` — su brevedad es por diseno, no por omision. Sin embargo, al ser de 3-7 lineas estan por debajo del umbral de 10 lineas.

### Gaps adicionales detectados

- **`directivas/_INDEX.md`** (100 lns): Bien documentado pero el directorio `directivas/` en `00-overview` solo tiene este archivo. Su contenido describe la gobernanza SIMCO de `orchestration/`, no de `00-overview/`. El directorio parece ser un stub de navegacion; considerar si pertenece a `00-overview` o a `orchestration/`.
- **`migracion/`**: No tiene `_INDEX.md`. Solo `README.md` + `README-FASE-5.md` + `_MAP-FASE-5.md`. El `README.md` sirve como indice informal.
- **REPORTE-INTEGRAL-2026-01-20.md**: Un reporte de auditoria historico ubicado en `00-overview/`. Semanticamente deberia estar en `orchestration/trazas/` o `docs/99-delivery/`, no en overview que es documentacion de producto actual.

---

## Section: docs/70-onboarding

- **Files:** 6 archivos .md
- **Directories:** 1 (raiz — sin subdirectorios)
- **_INDEX.md:** Presente (`_INDEX.md`, 30 lns)
- **_MAP.md:** Presente (`_MAP.md`, 14 lns)
- **Frontmatter (YAML `---`):** 5 / 6 archivos (83%)
  - CON frontmatter: `ONBOARDING-QA.md`, `ONBOARDING-AGENTES.md`, `ONBOARDING-DESARROLLADORES.md`, `_INDEX.md`, `README.md`
  - SIN frontmatter: `_MAP.md`
- **Files >500 lines:** 0

### Estructura de directorios

```
docs/70-onboarding/
├── _INDEX.md                       (30 lns)
├── _MAP.md                         (14 lns)
├── README.md                       (21 lns)
├── ONBOARDING-DESARROLLADORES.md  (276 lns)
├── ONBOARDING-AGENTES.md          (188 lns)
└── ONBOARDING-QA.md               (234 lns)
```

### Naming violations

Ninguna. Los 6 archivos siguen el patron UPPERCASE-KEBAB-CASE correctamente.

### 1FN violations

#### VIOLACION MEDIA: `ONBOARDING-AGENTES.md` duplica contenido de CLAUDE.md

El archivo `ONBOARDING-AGENTES.md` (188 lns) contiene:
- Tabla de metricas del proyecto (lineas 164-177): misma informacion que CLAUDE.md seccion METRICAS ACTUALES.
- Aliases mas usados (lineas 128-141): subconjunto de CLAUDE.md seccion ALIASES.
- Reglas criticas (lineas 56-97): parafrasea RC1-RC5 de CLAUDE.md.
- Estructura del proyecto (lineas 99-126): duplica CLAUDE.md seccion ESTRUCTURA DEL PROYECTO.

El topico principal del archivo (onboarding de agentes) es correcto y unico. Sin embargo, el 60% del contenido es duplicacion de CLAUDE.md, que segun el estandar 3FN deberia referenciarse, no replicarse. La justificacion de la duplicacion es pragmatica (los agentes necesitan la informacion en un lugar), pero viola el principio SSOT documentado en `ESTRUCTURA-DOCS.md`.

**Diagnostico:** Violacion leve de 1FN (topico correcto, contenido redundante). La duplicacion es intencional pero deberia documentarse como excepcion explicita.

#### VIOLACION BAJA: `_INDEX.md` y `README.md` tienen contenido solapado

`_INDEX.md` (30 lns) y `README.md` (21 lns) tienen tablas casi identicas listando los 3 documentos de onboarding. La diferencia es que `_INDEX.md` incluye orden de lectura recomendado y contexto del proyecto, y `README.md` tiene prerrequisitos. Si bien cada uno tiene un enfoque ligeramente diferente, hay solapamiento claro de proposito.

### Stubs (<10 lines)

Ninguno. Todos los archivos superan 10 lineas de contenido efectivo.

### Gaps adicionales detectados

- **`_MAP.md` sin frontmatter:** El unico archivo de la seccion sin frontmatter YAML. Inconsistencia menor dado que todos los demas lo tienen.
- **Audiencia "admin" no cubierta:** Los 3 archivos de onboarding cubren Desarrolladores, QA y Agentes. No hay onboarding para Administradores de sistema ni para Stakeholders/Product Owners. Esto puede ser intencional dado el alcance del proyecto, pero vale registrar como gap potencial.

---

## Section: docs/80-references

- **Files:** 9 archivos .md
- **Directories:** 4 (raiz implícita, `knowledge-base/`, `transversal/`, `transversal/arquitectura/`, `transversal/correcciones/`)
- **_INDEX.md:** Parcial — solo en raiz (`_INDEX.md`, 15 lns). **Faltante** en: `knowledge-base/`, `transversal/`, `transversal/arquitectura/`, `transversal/correcciones/`
- **_MAP.md:** Parcial — presente en `transversal/` (`transversal/_MAP.md`, 27 lns) y `transversal/correcciones/` (`correcciones/_MAP.md`, 434 lns). **Faltante** en: raiz de `80-references/`, `knowledge-base/`, `transversal/arquitectura/`
- **Frontmatter (YAML `---`):** 6 / 9 archivos (67%)
  - CON frontmatter: `transversal/correcciones/_MAP.md`, `README.md`, `transversal/arquitectura/FLUJO-INICIALIZACION-USUARIO.md`, `transversal/correcciones/ANALISIS-ERROR-404-PROGRESS-MODULES.md`, `knowledge-base/SIMCO-KB-MAPPING.md`, `transversal/correcciones/BACKEND-CRITICAL-ISSUES-PENDING.md`
  - SIN frontmatter: `_INDEX.md`, `transversal/README.md`, `transversal/_MAP.md`
- **Files >500 lines:** 0

### Estructura de directorios

```
docs/80-references/
├── _INDEX.md                              (15 lns)
├── README.md                             (21 lns)
├── knowledge-base/
│   └── SIMCO-KB-MAPPING.md              (146 lns)
└── transversal/
    ├── _MAP.md                           (27 lns)
    ├── README.md                         (34 lns)
    ├── arquitectura/
    │   └── FLUJO-INICIALIZACION-USUARIO.md (259 lns)
    └── correcciones/
        ├── _MAP.md                       (434 lns) ← violacion 1FN
        ├── ANALISIS-ERROR-404-PROGRESS-MODULES.md (344 lns)
        └── BACKEND-CRITICAL-ISSUES-PENDING.md (198 lns)
```

### Naming violations

- **`knowledge-base/`** — Directorio en lowercase con guion. Inconsistente con la convencion UPPERCASE-KEBAB-CASE de docs. Deberia ser `KNOWLEDGE-BASE/` o bien mantenerse en lowercase si la convencion acepta directorios en minuscula (como lo hacen `directivas/`, `migracion/`, etc.). El problema es la inconsistencia entre secciones.
- **`transversal/`** — Mismo caso: lowercase. Contrasta con `transversal/correcciones/_MAP.md` donde el contenido usa UPPERCASE-KEBAB-CASE para archivos.
- **`arquitectura/`** — Mismo caso: lowercase.
- **`correcciones/`** — Mismo caso: lowercase.

**Nota:** Todos los directorios en `docs/80-references` siguen lowercase con guion. La inconsistencia no es interna a la seccion sino respecto a la convencion global del proyecto para directorios de documentacion (que aparentemente no esta formalmente definida — ADR-039 o ESTANDAR-DOCUMENTACION deberia aclararlo).

### 1FN violations

#### VIOLACION ALTA: `correcciones/_MAP.md` (434 lineas) — no es un mapa, es un log operativo

El archivo `correcciones/_MAP.md` contiene:

| Contenido real | Lineas aprox |
|----------------|-------------|
| Encabezado de mapa (proposito correcto) | 1-17 |
| Estado de Issues P0 con detalle de implementacion | 27-44 |
| Historial de CORR-011 con tablas de archivos modificados | 45-83 |
| Historial de CORR-010 con 5 causas, 7 archivos modificados, codigo SQL | 86-145 |
| Historial de CORR-009 y siguientes (CORR-001 a CORR-011 aproximadamente) | 146-434 |

Un `_MAP.md` deberia contener solo navegacion (tabla de archivos + estados). El contenido operativo de cada CORR deberia estar en archivos individuales (`CORR-010-ANALISIS.md`, `CORR-011-PLAN.md`, etc.) o archivados en `orchestration/trazas/`. El `_MAP.md` actual tiene el contenido de un reporte de ejecucion, violando 1FN.

**Diagnostico:** El archivo cumple una funcion util como registro historico, pero su nombre `_MAP.md` es engañoso y su contenido excede el proposito de un archivo de navegacion.

#### VIOLACION MEDIA: `FLUJO-INICIALIZACION-USUARIO.md` (259 lns) — mezcla 3 topicos

El archivo en `transversal/arquitectura/` contiene:

| Topico | Lineas aprox |
|--------|-------------|
| Directivas y procedimientos generales (no especificos del flujo) | 15-44 |
| Plan de ejecucion por fases (meta-documentacion del documento mismo) | 34-44 |
| Flujo real de inicializacion de usuario (el topico principal) | 45-259 |

Las primeras 44 lineas describen como se hizo el levantamiento del documento, no el flujo de usuario en si. Esta "meta-documentacion" deberia estar en un preambulo breve o eliminarse. El topico principal es claro pero el archivo tiene contenido mixto.

#### VIOLACION BAJA: `_INDEX.md` de raiz es un resumen del `README.md`

`_INDEX.md` (15 lns) lista los mismos directorios que `README.md` (21 lns) con contenido casi identico. La diferencia de proposito entre _INDEX y README no esta clara en esta seccion.

### Gaps de _INDEX.md

| Directorio | _INDEX.md | _MAP.md | Observacion |
|------------|-----------|---------|-------------|
| `80-references/` (raiz) | Presente | **AUSENTE** | La raiz tiene `_INDEX.md` pero no `_MAP.md`. `transversal/_MAP.md` existe pero es del subdirectorio. |
| `knowledge-base/` | **AUSENTE** | **AUSENTE** | Solo tiene 1 archivo; el directorio carece de cualquier meta-archivo propio. `_INDEX.md` de raiz lo menciona. |
| `transversal/` | **AUSENTE** (tiene README.md como sustituto) | Presente (`_MAP.md`) | La `transversal/README.md` actua como `_INDEX.md` de facto. |
| `transversal/arquitectura/` | **AUSENTE** | **AUSENTE** | Solo tiene 1 archivo. Sin meta-archivos propios. |
| `transversal/correcciones/` | **AUSENTE** | Presente (`_MAP.md`, 434 lns, pero con violacion 1FN) | No tiene `_INDEX.md` separado. |

### Stubs (<10 lines)

Ninguno. Todos los archivos superan 10 lineas de contenido efectivo.

### Gaps adicionales detectados

- **`BACKEND-CRITICAL-ISSUES-PENDING.md`** (198 lns): El titulo dice "Estado: Resuelto" y el contenido confirma que todos los P0 estan implementados desde 2025-01-04. Es documentacion historica que deberia estar en `orchestration/trazas/` o `docs/99-delivery/`, no en referencias activas de `80-references/transversal/correcciones/`.
- **`correcciones/_MAP.md`** referencia `PLAN-RESTRUCTURACION-DOCUMENTACION-2026-01-06.md` como `[ARCHIVADO - documento no disponible]` — enlace roto a documento que ya no existe en disco.

---

## Resumen de Hallazgos por Prioridad

### P0 — Criticos (requieren accion inmediata)

| # | Seccion | Archivo | Hallazgo |
|---|---------|---------|---------|
| 1 | 00-overview | (raiz) | `_MAP.md` ausente — unica top-level section sin mapa |
| 2 | 00-overview | `README.md` ln 18 | Enlace roto a `MODULOS-SISTEMA.md` (no existe en disco) |
| 3 | 80-references | `correcciones/_MAP.md` | Violacion 1FN: 434 lns de log operativo en archivo de navegacion |

### P1 — Altos (corregir en sprint actual)

| # | Seccion | Archivo | Hallazgo |
|---|---------|---------|---------|
| 4 | 00-overview | `DEVOPS.md` | Violacion 1FN: 10 topicos mezclados (282 lns) |
| 5 | 00-overview | `_INDEX.md` | Entrada duplicada de `MODULOS.md` (lineas 13 y 29) |
| 6 | 80-references | `knowledge-base/` | Sin `_INDEX.md` ni `_MAP.md` |
| 7 | 80-references | `transversal/arquitectura/` | Sin `_INDEX.md` ni `_MAP.md` |
| 8 | 80-references | `transversal/correcciones/` | Sin `_INDEX.md` |

### P2 — Medios (backlog de mejora)

| # | Seccion | Archivo | Hallazgo |
|---|---------|---------|---------|
| 9 | 00-overview | (raiz) | Frontmatter ausente en 12/22 archivos (55%) |
| 10 | 00-overview | `DEPLOYMENT.md` | 509 lns — supera umbral; candidato a split |
| 11 | 00-overview | `REPORTE-INTEGRAL-2026-01-20.md` | Reporte historico mal ubicado (deberia estar en trazas) |
| 12 | 00-overview | `directivas/_INDEX.md` | Contenido describe orchestration/, no 00-overview/ |
| 13 | 70-onboarding | `ONBOARDING-AGENTES.md` | ~60% del contenido duplica CLAUDE.md (violacion 3FN) |
| 14 | 70-onboarding | `_INDEX.md` + `README.md` | Solapamiento de proposito entre ambos archivos |
| 15 | 80-references | `FLUJO-INICIALIZACION-USUARIO.md` | Meta-documentacion mezclada con contenido principal |
| 16 | 80-references | `BACKEND-CRITICAL-ISSUES-PENDING.md` | Documento historico resuelto en referencia activa |
| 17 | 80-references | `correcciones/_MAP.md` | Enlace roto a `PLAN-RESTRUCTURACION-DOCUMENTACION-2026-01-06.md` |

### P3 — Menores (normalizar cuando se edite)

| # | Seccion | Hallazgo |
|---|---------|---------|
| 18 | 00-overview | Directorios `directivas/` y `migracion/` en lowercase |
| 19 | 00-overview | `migracion/` sin `_INDEX.md` (tiene README.md informal) |
| 20 | 70-onboarding | `_MAP.md` sin frontmatter (unico en la seccion) |
| 21 | 80-references | Todos los directorios en lowercase (inconsistente globalmente) |
| 22 | 00-overview | Stubs intencionales con <10 lineas: `VISION-ALCANCE.md` (3 lns), `ONBOARDING.md` (7 lns) |

---

## Conteos Finales

| Metrica | 00-overview | 70-onboarding | 80-references | TOTAL |
|---------|-------------|---------------|---------------|-------|
| Archivos .md | 22 | 6 | 9 | 37 |
| Archivos con frontmatter | 10 (45%) | 5 (83%) | 6 (67%) | 21 (57%) |
| Archivos >500 lns | 1 | 0 | 0 | 1 |
| Stubs <10 lns | 2 (intencionales) | 0 | 0 | 2 |
| Violaciones 1FN | 3 (alta/media/baja) | 2 (media/baja) | 3 (alta/media/baja) | 8 |
| _INDEX.md faltantes | 1 (migracion/) | 0 | 4 | 5 |
| _MAP.md faltantes | 1 (raiz) | 0 | 3 | 4 |
| Naming violations | 2 dirs lowercase | 0 | 4 dirs lowercase | 6 dirs |
| Enlaces rotos | 1 (MODULOS-SISTEMA) | 0 | 1 (PLAN-RESTRUCTURACION) | 2 |

---

*Auditoria completada en modo read-only. Ningun archivo fue modificado.*
*Proxima accion sugerida: Crear _MAP.md para 00-overview (P0#1), corregir enlace roto README.md (P0#2), refactorizar correcciones/_MAP.md (P0#3).*
