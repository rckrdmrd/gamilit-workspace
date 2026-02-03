# MAPA DE ORQUESTACION: GAMILIT

**Proyecto:** GAMILIT - Plataforma de Gamificacion Educativa
**Nivel:** STANDALONE - Referencia Interna del Workspace
**Sistema:** NEXUS v4.0 + SIMCO v4.3.0
**Estandar:** SIMCO-ESTANDAR-ORCHESTRATION v1.0.0
**Ultima actualizacion:** 2026-01-24

---

## Estructura (Estandar STANDALONE - 3 carpetas activas)

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
└── trazas/                     # Trazas de ejecucion (7 archivos)
    ├── _MAP.md                 # Mapa de navegacion
    ├── _INDEX.yml              # Indice maestro
    ├── LESSONS-LEARNED.yml     # Lecciones aprendidas
    ├── TRAZA-TAREAS-BACKEND.md
    ├── TRAZA-TAREAS-DATABASE.md
    ├── TRAZA-TAREAS-FRONTEND.md
    ├── TRAZA-BUGS.md           # Registro de bugs
    └── TRAZA-REQUERIMIENTOS.md # Trazabilidad requerimientos
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

## Carpetas Estandar (3 activas)

| Carpeta | Proposito | Contenido |
|---------|-----------|-----------|
| `00-guidelines/` | Guias del proyecto | Contexto, herencia, paths |
| `inventarios/` | SSOT de objetos | 12 inventarios por capa |
| `trazas/` | Trazas de tareas | Por dominio (DB, Backend, Frontend) |

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
| Directivas SIMCO | [directivas/simco/](directivas/simco/) |

---

## Consolidacion 2026-01-24 / Purga 2026-02-03

### Estado Actual
Estructura consolidada a estandar STANDALONE:
- 3 carpetas activas: 00-guidelines/, inventarios/, trazas/
- Contenido historico purgado: 2026-02-03 (BLOQUE-3 Plan Maestro)

### Historico de Consolidacion
- 2026-01-24: Consolidacion inicial (41 → 6 carpetas, 85% reduccion)
- 2026-02-03: Purga completa de orchestration/_archive/ (36 subcarpetas eliminadas)

**Estructura Final:** 3 carpetas activas

---

*Estandarizado segun SIMCO-ESTANDAR-ORCHESTRATION v1.0.0*
*Consolidacion: 2026-01-24*
