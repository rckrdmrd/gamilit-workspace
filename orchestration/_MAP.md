# MAPA DE ORQUESTACION: GAMILIT

**Proyecto:** GAMILIT - Plataforma de Gamificacion Educativa
**Nivel:** STANDALONE - Referencia Interna del Workspace
**Sistema:** NEXUS v4.0 + SIMCO v4.3.0
**Estandar:** SIMCO-ESTANDAR-ORCHESTRATION v1.0.0
**Ultima actualizacion:** 2026-01-24

---

## Estructura (Estandarizada)

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
│   ├── CONTEXTO-PROYECTO.md
│   └── HERENCIA-DIRECTIVAS.md
│
├── inventarios/                # INVENTARIOS (SSOT)
│   ├── MASTER_INVENTORY.yml
│   ├── BACKEND_INVENTORY.yml
│   ├── DATABASE_INVENTORY.yml
│   └── FRONTEND_INVENTORY.yml
│
├── trazas/                     # Trazas de ejecucion
│   ├── TRAZA-TAREAS-BACKEND.md
│   ├── TRAZA-TAREAS-DATABASE.md
│   └── TRAZA-TAREAS-FRONTEND.md
│
├── directivas/                 # Directivas locales
│   ├── DIRECTIVA-DISENO-BASE-DATOS.md
│   ├── DIRECTIVA-POLITICA-CARGA-LIMPIA.md
│   └── ESTANDARES-API-ROUTES.md
│
├── tareas/                     # Tareas documentadas CAPVED
│   ├── _INDEX.yml
│   └── TASK-*/
│
└── _archive/                   # Contenido historico (consolidado 2026-01-24)
    ├── root-files/             # Archivos root movidos
    ├── agentes/                # Reportes y logs de agentes
    ├── analisis-*/             # 10 carpetas de analisis historicos
    ├── environment/            # Configuracion de entorno
    ├── errores/                # Registro de errores
    ├── prompts/                # Prompts de agentes
    └── ...                     # Otras carpetas consolidadas
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

## Carpetas Estandar (5 + _archive)

| Carpeta | Proposito | Contenido |
|---------|-----------|-----------|
| `00-guidelines/` | Guias del proyecto | Contexto, herencia directivas |
| `inventarios/` | SSOT de objetos | 4 inventarios por capa |
| `trazas/` | Trazas de tareas | Por dominio (DB, Backend, Frontend) |
| `directivas/` | Directivas locales | Especificas de gamilit |
| `tareas/` | Gobernanza | Tareas documentadas CAPVED |
| `_archive/` | Historico | Contenido consolidado |

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
| Tareas | [tareas/_INDEX.yml](tareas/_INDEX.yml) |

---

## Consolidacion 2026-01-24

Carpetas movidas a `_archive/`:
- 35 carpetas no estandar incluyendo:
  - 10 carpetas analisis-* (historicos)
  - agentes, agents-gamilit (duplicado)
  - 4 carpetas *-redundancia
  - environment, errores, estados
  - prompts, reportes, roadmap
  - scrum, scripts, templates
  - migracion-*, referencias

Archivos root archivados:
- CHANGELOG-SISTEMA-SUBAGENTES.md
- README-*.md (5 archivos)
- SPRINT-*.yml (2 archivos)

**Reduccion:** 41 carpetas → 6 carpetas (85%)

---

*Estandarizado segun SIMCO-ESTANDAR-ORCHESTRATION v1.0.0*
*Consolidacion: 2026-01-24*
