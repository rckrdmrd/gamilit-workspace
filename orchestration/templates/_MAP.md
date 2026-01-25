# Mapa de Templates - Sistema NEXUS v4.0

**Version:** 4.0.0
**Fecha:** 2026-01-24
**Total Templates:** 57
**Reorganizado:** TASK-2026-01-24-REESTRUCTURACION (FASE 3)

---

## Estructura Reorganizada

```
templates/
│
├── _MAP.md                     ← ESTE ARCHIVO
├── _INDEX.yml                  ← Índice maestro detallado
│
├── 01-por-contexto/            ← Templates según nivel de proyecto
│   ├── standalone/             ← Proyectos independientes
│   │   ├── CONTEXTO-NIVEL-STANDALONE.md
│   │   └── CONTEXTO-VERTICAL-TEMPLATE.md
│   ├── suite/                  ← Proyectos suite/core
│   │   ├── CONTEXTO-NIVEL-SUITE.md
│   │   ├── CONTEXTO-NIVEL-SUITE-CORE.md
│   │   ├── HERENCIA-ERP-CORE-TEMPLATE.md
│   │   └── TEMPLATE-ESTRUCTURA-VERTICAL.md
│   └── provider/               ← Proyectos que exportan
│       └── CONTEXTO-NIVEL-VERTICAL.md
│
├── 02-por-ciclo/               ← Templates del ciclo CAPVED
│   └── capved/
│       ├── TEMPLATE-FASE-C-OUTPUT.yml    ← Contexto
│       ├── TEMPLATE-FASE-A-OUTPUT.yml    ← Análisis
│       ├── TEMPLATE-FASE-P-OUTPUT.yml    ← Planeación
│       ├── TEMPLATE-FASE-V-OUTPUT.yml    ← Validación
│       ├── TEMPLATE-FASE-E-OUTPUT.yml    ← Ejecución
│       ├── TEMPLATE-FASE-D-OUTPUT.yml    ← Documentación
│       └── TEMPLATE-POST-VALIDACION.yml
│
├── 03-por-proceso/             ← Templates por proceso
│   ├── delegacion/             ← Delegación a subagentes
│   │   ├── TEMPLATE-DELEGACION-MINIMA.md
│   │   ├── TEMPLATE-DELEGACION-ESTANDAR.md
│   │   ├── TEMPLATE-DELEGACION-COMPLETA.md
│   │   ├── TEMPLATE-DELEGACION-SUBAGENTE.md
│   │   ├── TEMPLATE-CONTEXTO-SUBAGENTE.md
│   │   └── TEMPLATES-SUBAGENTES.md
│   ├── scrum/                  ← Artefactos Scrum
│   │   ├── TEMPLATE-ACTA-SPRINT-PLANNING.md
│   │   ├── TEMPLATE-DEFINICION-READY.md
│   │   ├── TEMPLATE-HISTORIA-USUARIO.md
│   │   ├── TEMPLATE-RETROSPECTIVA.yml
│   │   ├── TEMPLATE-SPRINT-BACKLOG.yml
│   │   └── TEMPLATE-TASK-DEVENV.md
│   └── session-tracking/       ← Tracking de sesiones
│       ├── SESSION-TRACKING-TEMPLATE.yml
│       ├── SESSION-TRACE-TEMPLATE.yml
│       ├── PROXIMA-ACCION-TEMPLATE.md
│       └── TEMPLATE-RECOVERY-CONTEXT.md
│
├── 04-globales/                ← Templates de uso general
│   ├── TEMPLATE-ADR.md
│   ├── TEMPLATE-ANALISIS.md
│   ├── TEMPLATE-ANALISIS-IMPACTO.md
│   ├── TEMPLATE-CONTEXT-MAP.yml
│   ├── TEMPLATE-CONTEXTO-PROYECTO.md
│   ├── TEMPLATE-DEPRECACION.md
│   ├── TEMPLATE-ENVIRONMENT-INVENTORY.yml
│   ├── TEMPLATE-EPICA.md
│   ├── TEMPLATE-HERENCIA-CONTEXTO.md
│   ├── TEMPLATE-HISTORIA-USUARIO.md
│   ├── TEMPLATE-HU-DERIVADA.md
│   ├── TEMPLATE-INTEGRACION-EXTERNA.md
│   ├── TEMPLATE-INVENTARIO-PROYECTO.md
│   ├── TEMPLATE-MAP.md
│   ├── TEMPLATE-MODULO-COMPARTIDO.md
│   ├── TEMPLATE-MODULO-ESTANDAR.md
│   ├── TEMPLATE-PLAN.md
│   ├── TEMPLATE-PROMPT-SIMPLIFICADO.md
│   ├── TEMPLATE-REPORTE-SPRINT.md
│   ├── TEMPLATE-TAREA-CAPVED.md
│   ├── TEMPLATE-TAREA-TECNICA.md
│   ├── TEMPLATE-VALIDACION.md
│   ├── CHECKLIST-ESTRUCTURA-PROYECTO.md
│   └── HERENCIA-SIMCO.md
│
└── _legacy/                    ← Templates en revisión
    ├── v2-migration/
    │   ├── MIGRATION-CHECKLIST-TEMPLATE.md
    │   └── TRACEABILITY-MASTER-TEMPLATE.yml
    └── service-descriptor/
        └── SERVICE-DESCRIPTOR-TEMPLATE.yml
```

---

## Guía de Selección Rápida

### ¿Qué tipo de proyecto?

| Tipo | Carpeta | Template Principal |
|------|---------|-------------------|
| Standalone (gamilit) | `01-por-contexto/standalone/` | CONTEXTO-NIVEL-STANDALONE.md |
| Suite Core (erp-core) | `01-por-contexto/suite/` | CONTEXTO-NIVEL-SUITE-CORE.md |
| Vertical ERP | `01-por-contexto/suite/` | HERENCIA-ERP-CORE-TEMPLATE.md |
| Provider (template-saas) | `01-por-contexto/provider/` | CONTEXTO-NIVEL-VERTICAL.md |

### ¿Qué fase CAPVED?

| Fase | Template |
|------|----------|
| C - Contexto | `02-por-ciclo/capved/TEMPLATE-FASE-C-OUTPUT.yml` |
| A - Análisis | `02-por-ciclo/capved/TEMPLATE-FASE-A-OUTPUT.yml` |
| P - Planeación | `02-por-ciclo/capved/TEMPLATE-FASE-P-OUTPUT.yml` |
| V - Validación | `02-por-ciclo/capved/TEMPLATE-FASE-V-OUTPUT.yml` |
| E - Ejecución | `02-por-ciclo/capved/TEMPLATE-FASE-E-OUTPUT.yml` |
| D - Documentación | `02-por-ciclo/capved/TEMPLATE-FASE-D-OUTPUT.yml` |

### ¿Qué proceso?

| Proceso | Carpeta | Templates |
|---------|---------|-----------|
| Delegar a subagente | `03-por-proceso/delegacion/` | MINIMA/ESTANDAR/COMPLETA |
| Scrum artifacts | `03-por-proceso/scrum/` | HU, Sprint, Retro |
| Tracking sesión | `03-por-proceso/session-tracking/` | PROXIMA-ACCION, RECOVERY |

---

## Métricas

| Categoría | Templates |
|-----------|-----------|
| Por Contexto | 7 |
| Por Ciclo (CAPVED) | 7 |
| Por Proceso | 16 |
| Globales | 24 |
| Legacy | 3 |
| **TOTAL** | **57** |

---

## Historial de Cambios

| Versión | Fecha | Cambios |
|---------|-------|---------|
| 4.0.0 | 2026-01-24 | Reorganización completa en 5 carpetas |
| 3.8.0 | 2026-01-10 | Agregados templates de documentación |
| 3.7.0 | 2026-01-08 | Agregados templates EPIC-003 |

---

*Sistema NEXUS v4.0 - Templates reorganizados*
