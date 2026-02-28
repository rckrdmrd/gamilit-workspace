---
titulo: Plan de Reestructuracion 00-overview
tipo: reporte
fecha_creacion: 2026-02-28
autor: Claude Sonnet 4.6 (analysis-only, read-only task)
---

# Plan de Reestructuracion 00-overview

## Resumen

- **Total archivos analizados:** 28 (23 .md raiz + 5 en subdirectorios directivas/ y migracion/)
- **KEEP:** 12
- **REDIRECT (ya es stub o debe convertirse):** 9
- **ARCHIVE:** 4
- **ANOMALIAS detectadas:** 3 (broken link, MODULOS.md duplicado en _INDEX.md, REQUERIMIENTOS borde)

---

## Inventario Completo

| Archivo | Lineas aprox | Estado actual declarado | Clasificacion propuesta |
|---------|-------------|------------------------|------------------------|
| README.md | 50 | activo | KEEP |
| _INDEX.md | 39 | activo | KEEP |
| _MAP.md | 64 | activo | KEEP |
| IDENTIDAD.md | 36 | activo | KEEP |
| VISION.md | 35 | activo | KEEP |
| MODULOS.md | 461 | activo | KEEP (ver nota) |
| MODULOS-EDUCATIVOS.md | 33 | activo | KEEP |
| PORTALES.md | 26 | activo | KEEP |
| GAMIFICACION.md | 30 | activo | KEEP |
| METRICAS.md | 28 | activo | KEEP |
| ESTADO-ACTUAL.md | 29 | activo | KEEP |
| GLOSARIO.md | 252 | activo | KEEP |
| ESTRUCTURA-DOCS.md | 38 | activo | REDIRECT -> 00-overview propio o enlace |
| REQUERIMIENTOS.md | 30 | activo | REDIRECT -> 10-requirements/ |
| ARQUITECTURA-TECNICA.md | 42 | activo | REDIRECT -> 20-architecture/ |
| GOBIERNO-SIMCO.md | 12 | ya es redirect stub | REDIRECT (confirmar) |
| ONBOARDING.md | 16 | ya es redirect stub | REDIRECT (confirmar) |
| VISION-ALCANCE.md | 12 | ya es redirect stub | REDIRECT (confirmar) |
| DEPLOYMENT.md | ~45 | ya es redirect stub | REDIRECT (confirmar) |
| TESTING-STRATEGY.md | ~45 | ya es redirect stub | REDIRECT (confirmar) |
| DEVOPS.md | 291 | activo | REDIRECT -> 50-guides/deployment/ (ver nota contenido unico) |
| COMANDOS-VALIDACION.md | 40 | activo | REDIRECT -> CLAUDE.md / 50-guides/ |
| REPORTE-INTEGRAL-2026-01-20.md | 11 | [MOVED] stub | ARCHIVE |
| directivas/_INDEX.md | 88 | activo | ARCHIVE (contenido duplica orchestration/) |
| migracion/README.md | 35 | activo legacy | ARCHIVE |
| migracion/README-FASE-5.md | 50 | legacy | ARCHIVE |
| migracion/_MAP-FASE-5.md | ~45 | legacy | ARCHIVE |
| migracion/_INDEX.md | 21 | activo | ARCHIVE |

---

## Archivos a Mantener (KEEP)

| Archivo | Razon |
|---------|-------|
| `README.md` | Puerta de entrada de la seccion; rol de indice canonico de 00-overview |
| `_INDEX.md` | Indice estructural de la seccion; SSOT para navegadores y agentes |
| `_MAP.md` | Mapa de navegacion de la seccion; complementa _INDEX.md |
| `IDENTIDAD.md` | Define el proyecto (tipo, repo, stack, alcance) — contenido nucleo de overview |
| `VISION.md` | Problema + propuesta de valor + objetivos academicos — contenido nucleo de overview |
| `MODULOS.md` | Catalogo detallado de los 23 modulos con entidades, endpoints y estado; no existe doc equivalente en otra seccion |
| `MODULOS-EDUCATIVOS.md` | Malla educativa de 5 modulos y tipos de ejercicio; resumen pedagogico diferenciado |
| `PORTALES.md` | Vista de alto nivel de los 4 portales; stub de navegacion valido para overview |
| `GAMIFICACION.md` | Componentes de juego de alto nivel con enlaces a canonicos en 20-architecture/gamificacion/ |
| `METRICAS.md` | Wrapper/referencia rapida a SSOT; no duplica valores (delega a inventarios) |
| `ESTADO-ACTUAL.md` | Estado funcional del MVP en un lugar unico; util como dashboard de estado rapido |
| `GLOSARIO.md` | Glosario transversal de 250+ lineas con contenido unico; audiencia: todos los roles |

**Nota sobre MODULOS.md:** Es el archivo mas extenso de la seccion (461 lineas). Contiene descripcion detallada de los 23 modulos (entities, endpoints por modulo, estado, nota sobre modulos transitivios). No tiene equivalente en otra seccion. DEBE mantenerse aqui aunque su volumen sea alto.

---

## Archivos a Redirigir (REDIRECT)

### Stubs ya existentes (confirmados como correctos)

Estos archivos ya son stubs de 2-16 lineas que solo apuntan al SSOT correcto. Solo necesitan verificacion de que el enlace de destino siga siendo valido.

| Archivo | Target actual | Estado |
|---------|---------------|--------|
| `GOBIERNO-SIMCO.md` | `orchestration/directivas/simco/` | Correcto — stub de 12 lineas |
| `ONBOARDING.md` | `docs/70-onboarding/_INDEX.md` | Correcto — stub de 16 lineas |
| `VISION-ALCANCE.md` | `docs/10-requirements/VISION-ALCANCE.md` | Correcto — stub de 12 lineas |
| `DEPLOYMENT.md` | `docs/20-architecture/AMBIENTES-DEV-PROD.md` + `docs/50-guides/deployment/` | Correcto — stub de 45 lineas con resumen util |
| `TESTING-STRATEGY.md` | `docs/40-standards/ESTANDAR-TESTING.md` + `docs/50-guides/testing/` | Correcto — stub de 45 lineas con resumen del estado |

### Candidatos a convertirse en stubs (actualmente tienen contenido propio)

| Archivo | Target recomendado | Contenido unico (si existe) |
|---------|-------------------|---------------------------|
| `ARQUITECTURA-TECNICA.md` | `docs/20-architecture/AMBIENTES-DEV-PROD.md` + `docs/20-architecture/STACK-TECNOLOGICO.md` | Tabla de puertos dev/prod (42 lineas total). **Sin contenido unico** — todo ya esta en 20-architecture/. Convertir a stub de 5 lineas. |
| `REQUERIMIENTOS.md` | `docs/10-requirements/epics/_INDEX.md` | Solo 30 lineas con bullets muy genericos de RF/RNF. **Sin contenido unico** — actua como resumen. Mantener como stub mas corto o eliminar. |
| `COMANDOS-VALIDACION.md` | `CLAUDE.md` (seccion VALIDACIONES OBLIGATORIAS) | Los 3 bloques bash son identicos a CLAUDE.md. **Sin contenido unico**. Convertir a stub de 3 lineas apuntando a CLAUDE.md. |
| `DEVOPS.md` | `docs/50-guides/deployment/` + `docs/20-architecture/AMBIENTES-DEV-PROD.md` | **CONTENIDO UNICO IDENTIFICADO** (ver detalle abajo) |
| `ESTRUCTURA-DOCS.md` | Ya esta en 00-overview, pero su contenido es una lista de secciones de docs/ | Sin contenido unico — duplica estructura visible en `docs/_MAP.md`. Convertir a stub o absorber en README.md de la seccion. |

#### Detalle de contenido unico en DEVOPS.md

`DEVOPS.md` (291 lineas) contiene material que NO existe en su totalidad en `docs/50-guides/deployment/`:

| Seccion en DEVOPS.md | Existe en target? |
|---------------------|------------------|
| Tabla de puertos dev | SI — en AMBIENTES-DEV-PROD.md |
| WSL2 networking / REDIS_ENABLED=false / predev hook | PARCIAL — mencionado en CLAUDE.md y AMBIENTES-DEV-PROD.md pero no como referencia standalone |
| docker-compose.yml completo con credenciales de dev | NO documentado en ninguna guia activa de deployment |
| Flujo DDL (5 pasos) | NO — no existe guia dedicada en 50-guides/ |
| Build commands backend/frontend | SI — en CLAUDE.md |
| Variables de entorno tabla completa | PARCIAL — en .env.production.example pero no en docs/ |
| Kubernetes readiness (estado + manifests planificados) | NO — no existe en 50-guides/deployment/ |
| Metricas de monitoring (thresholds) | NO — no existe en ninguna guia |
| Git workflow / branch strategy / commit convention | PARCIAL — en CLAUDE.md (Regla 4) pero no en docs/ |
| Security checklist | NO — no existe en docs/ (existe en docs/40-standards/ESTANDAR-SEGURIDAD-API.md pero no checklist operativo) |

**Recomendacion para DEVOPS.md:** No convertir a stub simple. El contenido unico (docker-compose, K8s readiness, monitoring thresholds, security checklist) debe migrarse a `docs/50-guides/deployment/GUIA-DEVOPS-LOCAL.md` (nuevo) ANTES de reemplazar con stub. De lo contrario se pierde informacion sin equivalente.

---

## Archivos a Archivar (ARCHIVE)

| Archivo | Razon |
|---------|-------|
| `REPORTE-INTEGRAL-2026-01-20.md` | Ya es stub [MOVED] apuntando a `orchestration/trazas/`. Puede eliminarse o moverse a migracion/ como legacy. El contenido real ya fue relocado. |
| `directivas/_INDEX.md` | Repite informacion de `orchestration/directivas/` sin agregar valor. La gobernanza SIMCO no pertenece conceptualmente en docs/00-overview/. El propio archivo declara que toda la gobernanza vive en orchestration/. |
| `migracion/README.md` | Declarado explicitamente como "Legacy" y "puente para enlaces legacy". La navegacion canonica vive en otros lugares. |
| `migracion/README-FASE-5.md` | Declarado como "Referencia historica", "Completado (legacy)". Solo conserva trazabilidad historica. |
| `migracion/_MAP-FASE-5.md` | Declarado como "Completado (ruta puente)", mapa legacy. |
| `migracion/_INDEX.md` | Solo apunta a los otros archivos de migracion/ que tambien se archivan. |

**Nota:** Para los archivos de `migracion/`, se recomienda moverlos a `orchestration/trazas/` o `docs/99-delivery/` antes de eliminar, para preservar trazabilidad historica del proceso de migracion documental.

---

## Anomalias Detectadas

### ANO-001: Broken link en README.md
`README.md` referencia `[MODULOS-SISTEMA.md](./MODULOS-SISTEMA.md)` (linea 25) pero ese archivo **no existe** en el directorio. El archivo real se llama `MODULOS.md`. El README.md fue escrito con un nombre de archivo incorrecto.

**Impacto:** Link roto visible para cualquier navegador de docs.
**Resolucion:** Actualizar README.md linea 25 — cambiar `MODULOS-SISTEMA.md` por `MODULOS.md`.

### ANO-002: MODULOS.md listado dos veces en _INDEX.md
En `_INDEX.md` (lineas 21 y 37) aparece `MODULOS.md` dos veces en la tabla de contenido. La segunda entrada (linea 37) es redundante.

**Impacto:** Confusion de navegacion; _INDEX.md no es una fuente confiable.
**Resolucion:** Eliminar la entrada duplicada de la linea 37 en _INDEX.md.

### ANO-003: REQUERIMIENTOS.md — borde KEEP/REDIRECT
`REQUERIMIENTOS.md` (30 lineas) contiene un resumen de RF/RNF de muy alto nivel. Tecnicamente es contenido de `10-requirements/` pero funciona como orientacion rapida en overview. La decision de mantener o redirigir depende del criterio editorial:

- **Opcion A (REDIRECT):** Eliminar y apuntar directamente a `docs/10-requirements/VISION-ALCANCE.md` y `docs/10-requirements/epics/_INDEX.md`.
- **Opcion B (KEEP como stub informativo):** Mantener como resumen de 2-3 bullets con enlace al SSOT — que es lo que ya hace actualmente.

**Recomendacion:** Opcion B — ya esta bien ajustado como referencia rapida sin contenido canonico propio.

---

## Resumen de Acciones Priorizadas

### Prioridad Alta (corregir ahora)
1. Corregir broken link en `README.md` — cambiar `MODULOS-SISTEMA.md` por `MODULOS.md`
2. Eliminar entrada duplicada de `MODULOS.md` en `_INDEX.md`

### Prioridad Media (prox. sesion de docs)
3. Migrar contenido unico de `DEVOPS.md` a `docs/50-guides/deployment/GUIA-DEVOPS-LOCAL.md` (nuevo), luego convertir a stub
4. Convertir `ARQUITECTURA-TECNICA.md` a stub de 5 lineas (ya tiene SSOT claro en 20-architecture/)
5. Convertir `COMANDOS-VALIDACION.md` a stub de 3 lineas apuntando a CLAUDE.md
6. Convertir `ESTRUCTURA-DOCS.md` a stub o absorber en README.md

### Prioridad Baja (limpieza eventual)
7. Archivar `directivas/_INDEX.md` — mover a orchestration/ o eliminar
8. Archivar carpeta `migracion/` completa — mover a `docs/99-delivery/` o `orchestration/trazas/`
9. Archivar `REPORTE-INTEGRAL-2026-01-20.md` — ya es stub, puede eliminarse sin perdida

---

## Estado Post-Restructuracion (estado objetivo)

```
00-overview/                    (12 archivos KEEP + stubs livianos)
├── _INDEX.md                   [KEEP] — indice canonico
├── _MAP.md                     [KEEP] — mapa de navegacion
├── README.md                   [KEEP] — puerta de entrada (corregir link MODULOS-SISTEMA->MODULOS)
├── IDENTIDAD.md                [KEEP] — identidad del proyecto
├── VISION.md                   [KEEP] — proposito y objetivos
├── MODULOS.md                  [KEEP] — 23 modulos (catalogo detallado)
├── MODULOS-EDUCATIVOS.md       [KEEP] — malla educativa y ejercicios
├── PORTALES.md                 [KEEP] — 4 portales (stub de navegacion)
├── GAMIFICACION.md             [KEEP] — componentes gamificacion (stub con enlaces)
├── METRICAS.md                 [KEEP] — referencia SSOT a inventarios
├── ESTADO-ACTUAL.md            [KEEP] — estado MVP y pendientes
├── GLOSARIO.md                 [KEEP] — glosario transversal completo
├── GOBIERNO-SIMCO.md           [REDIRECT stub] — ya correcto
├── ONBOARDING.md               [REDIRECT stub] — ya correcto
├── VISION-ALCANCE.md           [REDIRECT stub] — ya correcto
├── DEPLOYMENT.md               [REDIRECT stub] — ya correcto
├── TESTING-STRATEGY.md         [REDIRECT stub] — ya correcto
├── ARQUITECTURA-TECNICA.md     [REDIRECT stub] — simplificar a 5 lineas
├── REQUERIMIENTOS.md           [KEEP como resumen ligero] — ya bien ajustado
├── COMANDOS-VALIDACION.md      [REDIRECT stub] — apuntar a CLAUDE.md
├── ESTRUCTURA-DOCS.md          [REDIRECT stub] — apuntar a docs/_MAP.md
├── DEVOPS.md                   [REDIRECT stub] — DESPUES de migrar contenido unico
└── REPORTE-INTEGRAL-2026-01-20.md [ELIMINAR] — ya fue movido

# Archivos a eliminar/archivar:
directivas/_INDEX.md            [ARCHIVE] -> orchestration/
migracion/ (carpeta completa)   [ARCHIVE] -> docs/99-delivery/ o orchestration/trazas/
```

---

*Reporte generado: 2026-02-28*
*Modo: ANALYSIS (read-only — ningun archivo fue modificado)*
*Archivos leidos: 28*
