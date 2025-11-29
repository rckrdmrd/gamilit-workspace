# Documentación Transversal

**Versión:** 2.0.0
**Última Actualización:** 2025-11-28
**Estado:** Consolidado

---

## Propósito

Documentación cross-cutting del proyecto que no pertenece a una épica específica. Incluye inventarios, arquitectura, roadmap, métricas, y archivos históricos.

---

## Estructura de Carpetas

| Carpeta | Descripción | Archivos |
|---------|-------------|----------|
| **[inventarios/](./inventarios/)** | Referencias a inventarios (ver `orchestration/inventarios/`) | 2 |
| **[arquitectura/](./arquitectura/)** | Diagramas, flujos, funciones utilitarias | 5 |
| **[features/](./features/)** | Documentación de features completadas | 8 |
| **[gaps/](./gaps/)** | Análisis de GAPs identificados | 6 |
| **[roadmap/](./roadmap/)** | Roadmap general y por fase | 2 |
| **[sprints/](./sprints/)** | Sprints históricos | 2 |
| **[metricas/](./metricas/)** | Métricas del proyecto | 1 |
| **[correcciones/](./correcciones/)** | Issues y correcciones | 5 |
| **[restructuracion-v2/](./restructuracion-v2/)** | Reestructuración e implementaciones | 6 |
| **[archivos-historicos/](./archivos-historicos/)** | Logs y reportes fechados (archivo) | ~20 |

---

## Inventarios Consolidados

> **Nota:** Los inventarios YAML están ubicados en `orchestration/inventarios/`, no en esta carpeta.
> Ver [inventarios/README.md](./inventarios/README.md) para referencias.

Los 4 inventarios más importantes del proyecto:

| Inventario | Ubicación | Contenido |
|------------|-----------|-----------|
| **DATABASE_INVENTORY.yml** | `orchestration/inventarios/` | 13 schemas, 104 tablas, 162 índices |
| **BACKEND_INVENTORY.yml** | `orchestration/inventarios/` | 20 módulos NestJS, 145 endpoints |
| **FRONTEND_INVENTORY.yml** | `orchestration/inventarios/` | 15 features React, 200+ componentes |
| **TRACEABILITY_MATRIX.yml** | `orchestration/inventarios/` | 16 épicas, 120+ User Stories |

---

## Arquitectura

| Archivo | Descripción |
|---------|-------------|
| [FLUJO-INICIALIZACION-USUARIO.md](./arquitectura/FLUJO-INICIALIZACION-USUARIO.md) | Flujo de registro y onboarding |
| [DIAGRAMA-DEPENDENCIAS-INITIALIZE-USER-STATS.md](./arquitectura/DIAGRAMA-DEPENDENCIAS-INITIALIZE-USER-STATS.md) | Dependencias de inicialización |
| [FUNCIONES-UTILITARIAS-GAMILIT.md](./arquitectura/FUNCIONES-UTILITARIAS-GAMILIT.md) | Funciones SQL específicas |
| [FUNCIONES-UTILITARIAS-PUBLIC.md](./arquitectura/FUNCIONES-UTILITARIAS-PUBLIC.md) | Funciones SQL públicas |
| [STORAGE-SYSTEM.md](./arquitectura/STORAGE-SYSTEM.md) | Sistema de almacenamiento |

---

## Features Completadas

| Archivo | Descripción |
|---------|-------------|
| [FEATURES-IMPLEMENTADAS.md](./features/FEATURES-IMPLEMENTADAS.md) | Lista de features implementadas |
| [FEATURES-PENDIENTES.md](./features/FEATURES-PENDIENTES.md) | Features pendientes |
| [ADMIN-DASHBOARD-COMPLETO.md](./features/ADMIN-DASHBOARD-COMPLETO.md) | Dashboard admin |
| [AUDIT-LOGGING-COMPLETO.md](./features/AUDIT-LOGGING-COMPLETO.md) | Sistema de auditoría |
| [SOCIAL-FEATURES-COMPLETO.md](./features/SOCIAL-FEATURES-COMPLETO.md) | Features sociales |

---

## Archivos Históricos

Los archivos con fechas específicas (logs, reportes, validaciones) se encuentran en:

```
archivos-historicos/
└── 2025-11/
    ├── VALIDACION-PRODUCCION-2025-11-24.md
    ├── CHECKLIST-PRODUCCION-2025-11-24.md
    ├── DESARROLLO-TEACHER-PORTAL-COMPLETO-2025-11-24.md
    └── ... (20 archivos)
```

Estos archivos son referencias históricas del desarrollo. Para documentación actual, ver las carpetas principales.

---

## Navegación Rápida

- **¿Buscas un componente?** → [inventarios/](./inventarios/)
- **¿Cómo funciona algo?** → [arquitectura/](./arquitectura/)
- **¿Qué está implementado?** → [features/](./features/)
- **¿Qué falta por hacer?** → [gaps/](./gaps/)
- **¿Cuál es el plan?** → [roadmap/](./roadmap/)
- **¿Qué se hizo antes?** → [archivos-historicos/](./archivos-historicos/)

---

## Ver También

- [docs/00-vision-general/](../00-vision-general/) - Visión del producto
- [docs/95-guias-desarrollo/](../95-guias-desarrollo/) - Guías de desarrollo
- [docs/97-adr/](../97-adr/) - Decisiones de arquitectura

---

**Consolidado:** 2025-11-28
**Archivos antes:** ~50 en raíz
**Archivos después:** 2 en raíz, resto organizado en subcarpetas
