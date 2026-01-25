# MAPA DE ORQUESTACION: GAMILIT

**Proyecto:** GAMILIT - Plataforma de Gamificacion Educativa
**Nivel:** STANDALONE - Referencia Interna del Workspace
**Sistema:** NEXUS v4.0 + SIMCO v4.3.0
**Estandar:** SIMCO-ESTANDAR-ORCHESTRATION v1.0.0
**Ultima actualizacion:** 2026-01-24

---

## Estructura (Estandar STANDALONE - 3 carpetas + _archive)

```
orchestration/
├── _MAP.md                     # [ESTE ARCHIVO] Mapa de navegacion
├── _inheritance.yml            # Tipo: STANDALONE + REFERENCIA_INTERNA
├── BOOTLOADER.md               # Protocolo de arranque NEXUS
├── CONTEXT-MAP.yml             # Configuracion contexto automatico
├── PROJECT-PROFILE.yml         # Perfil y metadata del proyecto
├── PROJECT-STATUS.md           # Estado actual del proyecto
├── PROXIMA-ACCION.md           # Checkpoint de sesion
├── DEPENDENCY-GRAPH.yml        # Grafo de dependencias
├── TRACEABILITY.yml            # Trazabilidad del proyecto
├── MAPA-DOCUMENTACION.yml      # Mapa de documentacion
│
├── 00-guidelines/              # Contexto y guias del proyecto
│   ├── _MAP.md
│   ├── CONTEXTO-PROYECTO.md
│   ├── CONTEXTO-REFERENCIAS.md
│   ├── HERENCIA-DIRECTIVAS.md
│   ├── HERENCIA-SIMCO.md
│   ├── PATHS-DOCUMENTACION.md
│   └── PATHS-TRABAJO.md
│
├── inventarios/                # INVENTARIOS (SSOT)
│   ├── MASTER_INVENTORY.yml
│   ├── BACKEND_INVENTORY.yml
│   ├── DATABASE_INVENTORY.yml
│   ├── FRONTEND_INVENTORY.yml
│   └── ...                     # Otros inventarios
│
├── trazas/                     # Trazas de ejecucion
│   ├── _INDEX.yml
│   ├── TRAZA-TAREAS-BACKEND.md
│   ├── TRAZA-TAREAS-DATABASE.md
│   ├── TRAZA-TAREAS-FRONTEND.md
│   └── LESSONS-LEARNED.yml
│
└── _archive/                   # Contenido historico consolidado
    ├── _definitions/           # Definiciones (checklists, etc.)
    ├── agentes/                # Reportes y logs de agentes
    ├── agents-gamilit/         # Agentes duplicados
    ├── analisis-*/             # 10 carpetas de analisis historicos
    ├── directivas-gamilit/     # Directivas locales historicas
    ├── root-files/             # Archivos root movidos
    └── ...                     # Otras carpetas consolidadas (35 total)
```

---

## Archivos Principales (10 - Estandar STANDALONE)

| Archivo | Proposito |
|---------|-----------|
| `_MAP.md` | Mapa de navegacion (este archivo) |
| `_inheritance.yml` | Modelo de herencia |
| `BOOTLOADER.md` | Protocolo de arranque NEXUS |
| `CONTEXT-MAP.yml` | Configuracion contexto automatico |
| `PROJECT-PROFILE.yml` | Perfil para agentes |
| `PROJECT-STATUS.md` | Estado actual del proyecto |
| `PROXIMA-ACCION.md` | Checkpoint de sesion |
| `DEPENDENCY-GRAPH.yml` | Grafo de dependencias |
| `TRACEABILITY.yml` | Trazabilidad del proyecto |
| `MAPA-DOCUMENTACION.yml` | Mapa de documentacion |

---

## Carpetas Estandar (3 + _archive)

| Carpeta | Proposito | Contenido |
|---------|-----------|-----------|
| `00-guidelines/` | Guias del proyecto | Contexto, herencia, paths |
| `inventarios/` | SSOT de objetos | 12 inventarios por capa |
| `trazas/` | Trazas de tareas | Por dominio (DB, Backend, Frontend) |
| `_archive/` | Historico | 35 carpetas consolidadas (analisis, agentes, etc.) |

---

## Inventarios (SSOT)

| Inventario | Descripcion | Estado |
|------------|-------------|--------|
| MASTER_INVENTORY.yml | Inventario maestro consolidado | Activo |
| BACKEND_INVENTORY.yml | 17 modulos, 612 endpoints | Activo |
| DATABASE_INVENTORY.yml | 16 schemas, 135 tablas | Activo |
| FRONTEND_INVENTORY.yml | 327 componentes, 74 paginas | Activo |

---

## Metricas del Proyecto

| Metrica | Valor |
|---------|-------|
| Schemas PostgreSQL | 16 |
| Tablas | 135 |
| Endpoints API | 612 |
| Entities | 108 |
| Componentes | 327 |
| Paginas | 74 |
| Estado MVP | 75% |

---

## Navegacion

| Destino | Enlace |
|---------|--------|
| CLAUDE.md local | [../.claude/CLAUDE.md](../.claude/CLAUDE.md) |
| Documentacion proyecto | [../docs/_MAP.md](../docs/_MAP.md) |
| Orchestration Central | [../../orchestration/_MAP.md](../../orchestration/_MAP.md) |
| Directivas SIMCO | [../../orchestration/directivas/simco/](../../orchestration/directivas/simco/) |
| Estandar Orchestration | [../../orchestration/directivas/simco/SIMCO-ESTANDAR-ORCHESTRATION.md](../../orchestration/directivas/simco/SIMCO-ESTANDAR-ORCHESTRATION.md) |
| Inventarios | [inventarios/](inventarios/) |
| Directivas locales (archive) | [_archive/directivas-gamilit/](_archive/directivas-gamilit/) |

---

## Consolidacion 2026-01-24

### Estado Actual
Estructura consolidada a estandar STANDALONE:
- 3 carpetas activas: 00-guidelines/, inventarios/, trazas/
- 1 carpeta archivo: _archive/ (35 carpetas historicas)

### Contenido de _archive/
Carpetas consolidadas incluyendo:
- 10 carpetas analisis-* (historicos de auditorias)
- agentes/, agents-gamilit/ (reportes de agentes)
- 4 carpetas *-redundancia (analisis de redundancias)
- directivas-gamilit/ (directivas locales historicas)
- _definitions/ (checklists y definiciones)
- environment, errores, estados
- prompts, reportes, roadmap
- scrum, scripts, templates
- migracion-*, referencias, testing, validaciones

### Archivos Root Archivados
- PROJECT-STATUS-2026-01-13-HISTORICAL.md
- Otros archivos movidos a root-files/

**Estructura Final:** 3 carpetas activas + _archive

---

*Estandarizado segun SIMCO-ESTANDAR-ORCHESTRATION v1.0.0*
*Consolidacion: 2026-01-24*
