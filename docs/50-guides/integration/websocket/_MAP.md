# Mapa de Navegacion - WebSocket

## Descripcion
Documentacion del sistema de WebSocket de Gamilit.

## Estado Actual

El sistema WebSocket esta implementado en el backend para:
- Notificaciones en tiempo real
- Eventos del portal de profesores
- Actualizaciones de gamificacion (XP, logros, misiones)

**Nota:** La documentacion de WebSocket para leaderboard fue eliminada (2026-01-07) porque:
- El requisito US-GAM-007 CA-02 solo requiere actualizacion "en tiempo real **o cada 5 minutos**"
- El polling cada 30 segundos satisface este requisito
- El codigo WebSocket de leaderboard era funcionalidad no implementada (dead code)

## Archivos de Codigo Relevantes

| Archivo | Ubicacion | Descripcion |
|---------|-----------|-------------|
| websocket.module.ts | `apps/backend/src/modules/websocket/` | Modulo principal |
| notifications.gateway.ts | `apps/backend/src/modules/websocket/` | Gateway Socket.IO |
| websocket.service.ts | `apps/backend/src/modules/websocket/` | Servicio de emisiones |
| websocket.types.ts | `apps/backend/src/modules/websocket/types/` | Tipos y eventos |

## Eventos WebSocket Activos

| Evento | Uso |
|--------|-----|
| `notification:new` | Nueva notificacion |
| `notification:read` | Notificacion leida |
| `achievement:unlocked` | Logro desbloqueado |
| `rank:updated` | Cambio de rango |
| `xp:gained` | XP ganado |
| `mission:completed` | Mision completada |
| `teacher:*` | Eventos del portal profesor |

## Referencias
- [Directorio padre](../../_INDEX.md)
- CORR-005: Eliminacion de codigo muerto WebSocket leaderboard

---
*Ultima actualizacion: 2026-01-07*
