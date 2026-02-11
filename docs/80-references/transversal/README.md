# Documentacion Transversal

**Version:** 3.0.0
**Ultima Actualizacion:** 2025-12-18
**Estado:** Consolidado - Solo documentacion definitiva

---

## Proposito

Documentacion cross-cutting del proyecto que contiene **solo el estado actual** del sistema. Los archivos historicos, reportes de correcciones y logs han sido movidos a `orchestration/reportes/`.

> **Principio:** Esta carpeta solo contiene documentacion definitiva y vigente.

---

## Estructura de Carpetas

| Carpeta | Descripcion | Archivos | Estado |
|---------|-------------|----------|--------|
| **[arquitectura/](./arquitectura/)** | Diagramas, flujos, funciones utilitarias | 5 | Definitivo |
| **[arquitectura-database/](./arquitectura-database/)** | Arquitectura de BD | 2 | Definitivo |
| **[features/](./features/)** | Documentacion de features completadas | 7 | Definitivo |
| **[inventarios-database/](./inventarios-database/)** | Inventarios detallados de BD | 7 | Definitivo |
| **[roadmap/](./roadmap/)** | Roadmap general | 1 | Definitivo |
| **[deuda-tecnica/](./deuda-tecnica/)** | Deuda tecnica documentada | 1 | Definitivo |
| **[correcciones/](./correcciones/)** | Solo ISSUES-CRITICOS.md (backlog activo) | 1 | Vigente |
| **[restructuracion-v2/](./restructuracion-v2/)** | Reestructuracion e implementaciones | 5 | Definitivo |

---

## Inventarios Consolidados

> **SSOT:** Los inventarios maestros estan en `orchestration/inventarios/`

| Inventario | Ubicacion | Contenido |
|------------|-----------|-----------|
| **MASTER_INVENTORY.yml** | `orchestration/inventarios/` | Resumen consolidado |
| **DATABASE_INVENTORY.yml** | `orchestration/inventarios/` | 16 schemas, 123 tablas, 185 RLS |
| **BACKEND_INVENTORY.yml** | `orchestration/inventarios/` | 13 modulos, 417 endpoints |
| **FRONTEND_INVENTORY.yml** | `orchestration/inventarios/` | 483 componentes, 89 hooks |

---

## Arquitectura

| Archivo | Descripcion |
|---------|-------------|
| [FLUJO-INICIALIZACION-USUARIO.md](./arquitectura/FLUJO-INICIALIZACION-USUARIO.md) | Flujo de registro y onboarding |
| [DIAGRAMA-DEPENDENCIAS-INITIALIZE-USER-STATS.md](./arquitectura/DIAGRAMA-DEPENDENCIAS-INITIALIZE-USER-STATS.md) | Dependencias de inicializacion |
| [FUNCIONES-UTILITARIAS-GAMILIT.md](./arquitectura/FUNCIONES-UTILITARIAS-GAMILIT.md) | Funciones SQL especificas |
| [FUNCIONES-UTILITARIAS-PUBLIC.md](./arquitectura/FUNCIONES-UTILITARIAS-PUBLIC.md) | Funciones SQL publicas |
| [STORAGE-SYSTEM.md](./arquitectura/STORAGE-SYSTEM.md) | Sistema de almacenamiento |

---

## Features

| Archivo | Descripcion |
|---------|-------------|
| [FEATURES-IMPLEMENTADAS.md](./features/FEATURES-IMPLEMENTADAS.md) | Lista de features implementadas (86%) |
| [FEATURES-PENDIENTES.md](./features/FEATURES-PENDIENTES.md) | Features pendientes |
| [ADMIN-DASHBOARD-COMPLETO.md](./features/ADMIN-DASHBOARD-COMPLETO.md) | Dashboard admin |
| [AUDIT-LOGGING-COMPLETO.md](./features/AUDIT-LOGGING-COMPLETO.md) | Sistema de auditoria |
| [SOCIAL-FEATURES-COMPLETO.md](./features/SOCIAL-FEATURES-COMPLETO.md) | Features sociales |
| [CONTENT-MANAGEMENT-COMPLETO.md](./features/CONTENT-MANAGEMENT-COMPLETO.md) | Gestion de contenido |

---

## Documentacion Historica

Los archivos historicos han sido movidos a `orchestration/reportes/`:

| Tipo | Nueva Ubicacion |
|------|-----------------|
| Reportes por fecha | `orchestration/reportes/historicos/2025-11/` |
| Correcciones aplicadas | `orchestration/reportes/correcciones/` |
| Reportes de implementacion | `orchestration/reportes/implementacion/` |
| Gaps cerrados | `orchestration/reportes/gaps/` |
| Database changelog | `orchestration/reportes/database/` |

**Ver traza completa:** `orchestration/trazas/TRAZA-DOCUMENTACION-DEPRECADA.md`

---

## Navegacion Rapida

- **Buscar un componente?** → `orchestration/inventarios/`
- **Como funciona algo?** → [arquitectura/](./arquitectura/)
- **Que esta implementado?** → [features/](./features/)
- **Issues pendientes?** → [correcciones/ISSUES-CRITICOS.md](./correcciones/ISSUES-CRITICOS.md)
- **Cual es el plan?** → [roadmap/](./roadmap/)
- **Historico de cambios?** → `orchestration/reportes/`

---

## Ver Tambien

- [docs/00-vision-general/](../00-vision-general/) - Vision del producto
- [docs/95-guias-desarrollo/](../95-guias-desarrollo/) - Guias de desarrollo
- [docs/96-quick-reference/](../96-quick-reference/) - Referencias rapidas
- [docs/90-adr/](../97-adr/) - Decisiones de arquitectura
- [orchestration/reportes/](../../orchestration/reportes/) - Documentacion historica

---

**Actualizado:** 2025-12-18
**Por:** Requirements-Analyst
**Nota:** Archivos historicos movidos a orchestration/reportes/ para mantener solo documentacion definitiva
