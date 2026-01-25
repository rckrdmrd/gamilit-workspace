# Mapa de Contenidos: _archive

**Carpeta:** orchestration/_archive/
**Subcarpetas:** 36
**Archivos root:** 1
**Ultima actualizacion:** 2026-01-24

---

## Proposito

Contenedor de contenido historico consolidado durante la estandarizacion
del proyecto GAMILIT segun SIMCO-ESTANDAR-ORCHESTRATION v1.0.0.

**IMPORTANTE:** Este contenido es de solo lectura/referencia.
Para contenido activo, usar las carpetas principales de orchestration/.

---

## Estructura

```
_archive/
├── _MAP.md                     # [ESTE ARCHIVO]
├── PROJECT-STATUS-2026-01-13-HISTORICAL.md
│
├── _definitions/               # Definiciones y checklists
├── agentes/                    # Reportes de agentes
├── agents-gamilit/             # Agentes (duplicado consolidado)
├── analisis/                   # Analisis generales + tareas historicas
│   └── tareas/                 # TAREA-001 a TAREA-007 (formato antiguo)
│
├── analisis-*/                 # 10 carpetas de analisis por fecha
│   ├── analisis-admin-portal-2025-12-23/
│   ├── analisis-backend-2025-12-18/
│   ├── analisis-database-2025-12-26/
│   ├── analisis-documentacion-vs-desarrollo-2025-12-23/
│   ├── analisis-errores-prod-2025-12-18/
│   ├── analisis-frontend-validacion/
│   ├── analisis-homologacion-database-2025-12-18/
│   ├── analisis-modulos-3-4-5/
│   ├── analisis-produccion-2025-12-18/
│   ├── analisis-teacher-portal-2025-12-18/
│   └── analisis-validacion-documentacion-2026-01-13/
│
├── *-redundancia/              # 4 carpetas de analisis de redundancias
│   ├── checklists-redundancia/
│   ├── patrones-redundancia/
│   ├── simco-redundancia/
│   └── (principios contiene analisis relacionado)
│
├── directivas-gamilit/         # Directivas locales historicas
├── decisiones/                 # Registro de decisiones
├── environment/                # Configuracion de ambiente
├── errores/                    # Registro de errores
├── estados/                    # Estados historicos
│
├── migracion-consolidado-2025-12/  # Documentacion de migracion
├── principios/                 # Principios documentados
├── prompts/                    # Prompts de agentes
├── referencias/                # Referencias cruzadas
├── reportes/                   # Reportes generados
├── roadmap/                    # Roadmaps historicos
├── root-files/                 # Archivos root movidos
├── scripts/                    # Scripts de utilidad
├── scrum/                      # Artefactos scrum
├── templates/                  # Templates historicos
├── testing/                    # Documentacion de testing
├── trazabilidad/               # Trazabilidad historica
├── trazas/                     # 12 trazas historicas (Fase 3)
└── validaciones/               # Documentacion de validaciones
```

---

## Contenido por Categoria

### Analisis Historicos (11 carpetas)
| Carpeta | Fecha | Proposito |
|---------|-------|-----------|
| analisis/ | General | Analisis generales + tareas TAREA-001 a 007 |
| analisis-admin-portal-2025-12-23 | 2025-12-23 | Analisis portal admin |
| analisis-backend-2025-12-18 | 2025-12-18 | Auditoria backend |
| analisis-database-2025-12-26 | 2025-12-26 | Auditoria database |
| analisis-documentacion-vs-desarrollo-2025-12-23 | 2025-12-23 | Gap analysis |
| analisis-errores-prod-2025-12-18 | 2025-12-18 | Errores produccion |
| analisis-frontend-validacion | - | Validacion frontend |
| analisis-homologacion-database-2025-12-18 | 2025-12-18 | Homologacion DB |
| analisis-modulos-3-4-5 | - | Analisis modulos |
| analisis-produccion-2025-12-18 | 2025-12-18 | Estado produccion |
| analisis-teacher-portal-2025-12-18 | 2025-12-18 | Portal profesor |
| analisis-validacion-documentacion-2026-01-13 | 2026-01-13 | Validacion docs |

### Redundancias (4 carpetas)
| Carpeta | Proposito |
|---------|-----------|
| checklists-redundancia | Analisis redundancia checklists |
| patrones-redundancia | Patrones redundantes identificados |
| simco-redundancia | Redundancias sistema SIMCO |
| principios | Principios (incluye analisis redundancia) |

### Agentes y Directivas (3 carpetas)
| Carpeta | Proposito |
|---------|-----------|
| agentes | Reportes y logs de agentes |
| agents-gamilit | Copia consolidada de agentes |
| directivas-gamilit | Directivas locales historicas |

### Trazas Historicas (1 carpeta - Fase 3)
| Carpeta | Archivos | Proposito |
|---------|----------|-----------|
| trazas | 12 | Trazas de agentes, analisis, correcciones |

### Documentacion Operacional (14 carpetas)
| Carpeta | Proposito |
|---------|-----------|
| _definitions | Definiciones y checklists |
| decisiones | Registro de decisiones arquitectonicas |
| environment | Configuracion de ambiente |
| errores | Registro de errores encontrados |
| estados | Estados historicos del proyecto |
| migracion-consolidado-2025-12 | Documentacion de migracion |
| prompts | Prompts para agentes |
| referencias | Referencias cruzadas |
| reportes | Reportes generados |
| roadmap | Roadmaps historicos |
| root-files | Archivos root archivados |
| scripts | Scripts de utilidad |
| scrum | Artefactos scrum |
| templates | Templates historicos |
| testing | Documentacion de testing |
| trazabilidad | Trazabilidad historica |
| validaciones | Documentacion de validaciones |

---

## Tareas Historicas

### Formato Antiguo (TAREA-NNN-NOMBRE)
Ubicacion: `_archive/analisis/tareas/`

| Tarea | Dominio |
|-------|---------|
| TAREA-001-AUTH | Autenticacion |
| TAREA-002-EDUCATIONAL | Contenido educativo |
| TAREA-003-GAMIFICATION | Gamificacion |
| TAREA-004-PROGRESS | Progreso |
| TAREA-005-SOCIAL | Social |
| TAREA-006-AUDIT | Auditoria |
| TAREA-007-SHARED | Compartido |

**Nota:** Estas tareas usan el formato antiguo. El formato actual es
`TASK-YYYY-MM-DD-NNN-descripcion` segun SIMCO-ESTRUCTURA-TAREAS.

---

## Historial de Consolidacion

| Fecha | Fase | Accion |
|-------|------|--------|
| 2026-01-24 | Fase 1 | 35 carpetas movidas a _archive |
| 2026-01-24 | Fase 3 | 12 trazas historicas movidas |
| 2026-01-24 | Fase 4 | Creacion de este _MAP.md |

---

## Navegacion

| Destino | Enlace |
|---------|--------|
| Orchestration principal | [../_MAP.md](../_MAP.md) |
| Directivas historicas | [directivas-gamilit/](directivas-gamilit/) |
| Tareas historicas | [analisis/tareas/](analisis/tareas/) |
| Trazas archivadas | [trazas/](trazas/) |

---

*Contenido historico - Solo lectura/referencia*
*Estandar: SIMCO-ESTANDAR-ORCHESTRATION v1.0.0*
