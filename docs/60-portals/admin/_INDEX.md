---
titulo: "Portal Administrador — Indice"
tipo: indice
fecha_creacion: "2025-10-01"
ultima_actualizacion: "2026-02-28"
estado: activo
---

# Portal Administrador — Indice

> Documentacion del portal administrativo de GAMILIT. Cubre gestion de usuarios, organizaciones, contenido educativo, configuracion del sistema, analitica global y operaciones masivas.

## Archivos

| Archivo | Descripcion | Estado |
|---------|-------------|--------|
| `PORTAL-ADMIN-GUIDE.md` | Guia principal — arquitectura, 18 paginas del portal, gestion de usuarios/roles/tenants, configuracion de gamificacion, monitoreo del sistema (v2.0.0) | Actualizado 2026-02-27 |
| `PORTAL-ADMIN-API-REFERENCE.md` | Referencia de endpoints — endpoints de gestion de contenido educativo, usuarios, configuracion global y analytics | Actualizado 2026-02-27 |
| `_MAP.md` | Mapa de navegacion del directorio admin | Actualizado 2026-02-27 |

## Funcionalidades Cubiertas

| Area | Descripcion |
|------|-------------|
| Gestion de Usuarios | Crear, editar, suspender y eliminar usuarios; bulk operations |
| Gestion de Organizaciones | Tenants, instituciones, suscripciones |
| Configuracion del Sistema | Settings globales, feature flags, mantenimiento |
| Moderacion de Contenido | Aprobar/rechazar contenido creado por maestros |
| Gamificacion Global | Parametros ML Coins, rangos Maya, achievements |
| Monitoreo | Salud del sistema, metricas, logs, performance |
| Reportes y Analytics | Dashboards, estadisticas, exportacion de datos |

## Referencias Cruzadas

- Backend modules: `apps/backend/src/modules/admin/` + `apps/backend/src/modules/tenants/`
- Frontend pages: `apps/frontend/src/apps/admin/`
- API docs global: `docs/40-api/API-REFERENCE.md`
- Multi-tenancy: `docs/20-architecture/` (ADR-003 RLS, ADR-007 multi-tenancy)
- Inventarios SSOT: `orchestration/inventarios/BACKEND_INVENTORY.yml` + `orchestration/inventarios/MASTER_INVENTORY.yml`
- ADR relevantes: `docs/90-adr/ADR-003-row-level-security.md`

## Estado del Portal

- Completitud: ~90%
- Paginas implementadas: 18
- Gestion de contenido educativo: operativa
- Multi-tenancy con RLS: activo (ADR-003)
