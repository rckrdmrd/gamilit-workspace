# Portal Padres — Indice

> Documentacion del portal de padres de GAMILIT. Cubre vinculacion padre-estudiante, seguimiento de progreso academico, notificaciones y comunicacion con maestros.

## Archivos

| Archivo | Descripcion | Estado |
|---------|-------------|--------|
| `PORTAL-PARENTS-GUIDE.md` | Guia principal — arquitectura, 7 paginas implementadas, flujos de vinculacion, reportes semanales, notificaciones (v2.0.0) | Actualizado 2026-02-27 |
| `_MAP.md` | Mapa de navegacion del directorio parents | Actualizado 2026-02-27 |

## Paginas Implementadas (7/7)

| Pagina | Descripcion |
|--------|-------------|
| `Dashboard` | Vista consolidada de progreso por hijo vinculado |
| `ChildProgress` | Estadisticas detalladas, actividades recientes, tareas proximas |
| `Login` | Autenticacion independiente del sistema principal |
| `Register` | Registro propio para padres/tutores |
| `Notifications` | Alertas de bajo rendimiento, logros, inactividad, asignaciones pendientes |
| `Messages` | Comunicacion directa maestro-padre |
| `Settings` | Configuracion de cuenta y preferencias de notificacion |

## Referencias Cruzadas

- Backend module: `apps/backend/src/modules/parents/`
- Frontend pages: `apps/frontend/src/apps/parent/` + `apps/frontend/src/features/parent/`
- Epics origen: `docs/10-requirements/epics/EPIC-GAM-F10-EXT-010/` (Parent Notifications) + `EPIC-GAM-F11-EXT-011/` (Parent Portal)
- Notificaciones: `apps/backend/src/modules/notifications/` (email templates para reportes semanales)
- API docs global: `docs/40-api/API-REFERENCE.md`
- Inventarios SSOT: `orchestration/inventarios/FRONTEND_INVENTORY.yml` + `orchestration/inventarios/BACKEND_INVENTORY.yml`

## Estado del Portal

- Completitud: 100% backend + 100% frontend
- Paginas implementadas: 7/7
- Vinculacion padre-estudiante: operativa (codigo unico de estudiante)
- Notificaciones: email (templates HTML), push, SMS
- Reportes semanales: generacion manual y automatica via cron
