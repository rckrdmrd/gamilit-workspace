---
id: "US-AE-017"
title: "Centro de Notificaciones del Administrador"
type: "User Story"
status: "Done"
priority: "Media"
assignee: "@Frontend-Agent"
epic: "EXT-002"
story_points: 6
budget: "$2,400 MXN"
sprint: "Sprint-3"
labels: ["admin-extendido", "notifications", "websocket", "real-time", "filters"]
created_date: "2026-01-20"
updated_date: "2026-01-20"
completed_date: "2026-01-20"
---

# US-AE-017: Centro de Notificaciones del Administrador

## Informacion General

| Campo | Valor |
|-------|-------|
| **ID** | US-AE-017 |
| **Epica** | EXT-002 - Admin Extendido |
| **Titulo** | Centro de Notificaciones del Administrador |
| **Prioridad** | Media (P2) |
| **Story Points** | 6 SP |
| **Estado** | Done |
| **Sprint** | Sprint 3 |
| **Ruta** | `/admin/notifications` |

---

## Historia de Usuario

**Como** super admin del sistema GAMILIT
**Quiero** un centro unificado de notificaciones con filtros, gestion de estado y actualizaciones en tiempo real
**Para** estar informado de eventos criticos del sistema, actividad de usuarios, alertas de seguridad y poder gestionar eficientemente todas las notificaciones

---

## Descripcion

El Centro de Notificaciones proporciona al administrador una vista completa de todas las notificaciones del sistema con capacidades avanzadas de filtrado y gestion. Soporta actualizaciones en tiempo real via WebSocket para recibir alertas criticas instantaneamente.

### Tipos de Notificaciones Soportados

| Tipo | Etiqueta | Descripcion |
|------|----------|-------------|
| `system_announcement` | Anuncio del Sistema | Comunicados oficiales del sistema |
| `security_alert` | Alerta de Seguridad | Eventos de seguridad criticos |
| `user_activity` | Actividad de Usuarios | Acciones relevantes de usuarios |
| `institution_update` | Actualizacion de Institucion | Cambios en instituciones |
| `system_health` | Estado del Sistema | Metricas y salud del sistema |
| `database_alert` | Alerta de Base de Datos | Eventos de base de datos |
| `alert` | Alerta General | Alertas genericas |

---

## Endpoints API (6 endpoints)

### Notificaciones Basicas

| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| GET | `/api/notifications` | Lista notificaciones con paginacion y filtros |
| GET | `/api/notifications/unread-count` | Contador de no leidas |
| PATCH | `/api/notifications/:id/read` | Marcar como leida |
| POST | `/api/notifications/read-all` | Marcar todas como leidas |
| DELETE | `/api/notifications/:id` | Eliminar notificacion |
| DELETE | `/api/notifications/clear-all` | Limpiar todas |

### Parametros de Consulta (GET /api/notifications)

| Parametro | Tipo | Default | Descripcion |
|-----------|------|---------|-------------|
| `page` | number | 1 | Pagina actual |
| `limit` | number | 50 | Items por pagina |
| `type` | string | - | Filtrar por tipo |
| `status` | 'unread' \| 'read' \| 'all' | 'all' | Filtrar por estado |

---

## Integracion WebSocket (Tiempo Real)

### Conexion

La pagina utiliza el hook `useWebSocket` que establece conexion automatica al servidor WebSocket cuando el usuario esta autenticado.

```typescript
// URL de conexion
const WEBSOCKET_URL = API_CONFIG.wsURL;

// Configuracion Socket.IO
io(WEBSOCKET_URL, {
  path: '/socket.io/',
  transports: ['websocket', 'polling'],
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 30000,
  reconnectionAttempts: Infinity,
  auth: { token: jwtToken }
});
```

### Eventos WebSocket

| Evento | Direccion | Descripcion |
|--------|-----------|-------------|
| `connect` | Server -> Client | Conexion establecida |
| `authenticated` | Server -> Client | Autenticacion exitosa |
| `new_notification` | Server -> Client | Nueva notificacion recibida |
| `notification_read` | Server -> Client | Notificacion marcada como leida |
| `notification_deleted` | Server -> Client | Notificacion eliminada |
| `unread_count_updated` | Server -> Client | Contador actualizado |

### Payload de Nueva Notificacion

```typescript
interface WebSocketNotification {
  notification: {
    id: string;
    userId: string;
    type: WebSocketNotificationType;
    title: string;
    message: string;
    metadata?: Record<string, unknown>;
    isRead: boolean;
    createdAt: string;
  };
  timestamp: string;
}
```

### Browser Notifications

El sistema soporta notificaciones nativas del navegador cuando el usuario otorga permisos:

- Solicita permiso automaticamente si no esta configurado
- Muestra titulo y mensaje de la notificacion
- Incluye icono de la aplicacion
- Tag unico por notificacion para evitar duplicados

---

## Criterios de Aceptacion

### AC-1: Listado de Notificaciones
**DADO** un super admin autenticado en el portal admin
**CUANDO** accede a `/admin/notifications`
**ENTONCES** ve la lista completa de notificaciones ordenadas por fecha descendente con:
- Icono segun tipo de notificacion
- Titulo y mensaje
- Tiempo relativo (Ahora mismo, Hace Xmin, Hace Xh, Hace Xd)
- Indicador visual de no leida (borde purpura, fondo destacado)
- Etiqueta de tipo de notificacion

### AC-2: Filtro por Estado
**DADO** la lista de notificaciones visible
**CUANDO** el admin selecciona filtro de estado (Todas/No leidas/Leidas)
**ENTONCES** la lista se filtra mostrando solo las notificaciones del estado seleccionado

### AC-3: Filtro por Tipo
**DADO** la lista de notificaciones visible
**CUANDO** el admin selecciona un tipo de notificacion en el dropdown
**ENTONCES** la lista se filtra mostrando solo notificaciones de ese tipo

### AC-4: Marcar Individual como Leida
**DADO** una notificacion no leida en la lista
**CUANDO** el admin hace clic en el boton de check
**ENTONCES** la notificacion se marca como leida y el contador de no leidas se actualiza

### AC-5: Marcar Todas como Leidas
**DADO** notificaciones no leidas en el sistema
**CUANDO** el admin hace clic en "Marcar todas"
**ENTONCES** todas las notificaciones se marcan como leidas y el contador llega a 0

### AC-6: Eliminar Notificacion
**DADO** cualquier notificacion en la lista
**CUANDO** el admin hace clic en el boton de eliminar
**ENTONCES** la notificacion se elimina con animacion de salida y el contador se actualiza si era no leida

### AC-7: Actualizacion en Tiempo Real
**DADO** el admin tiene la pagina abierta
**CUANDO** el sistema envia una nueva notificacion via WebSocket
**ENTONCES** la notificacion aparece automaticamente al inicio de la lista sin recargar la pagina

### AC-8: Refresh Manual
**DADO** la lista de notificaciones visible
**CUANDO** el admin hace clic en el boton de refresh
**ENTONCES** la lista se recarga del servidor mostrando animacion de carga

### AC-9: Estado Vacio
**DADO** no hay notificaciones que cumplan los filtros actuales
**CUANDO** se muestra la lista
**ENTONCES** se presenta un mensaje amigable "Sin notificaciones" con icono ilustrativo

### AC-10: Link a Configuracion
**DADO** la pagina de notificaciones visible
**CUANDO** el admin hace clic en el icono de configuracion
**ENTONCES** navega a `/admin/settings/notifications` para configurar preferencias

---

## Especificacion Tecnica

### Frontend

**Pagina:** `AdminNotificationsPage.tsx`
**Ubicacion:** `apps/frontend/src/apps/admin/pages/`
**LOC:** ~400 lineas

**Store Zustand:**
- `useNotificationsStore` - Estado global de notificaciones

**Hooks Utilizados:**
- `useNotificationsStore` - Store centralizado de notificaciones
- `useAuth` - Contexto de autenticacion
- `useUserGamification` - Datos de gamificacion del usuario

**Servicios:**
- `notificationsAPI` - Cliente API para endpoints de notificaciones

**Layout:**
- `AdminLayout` - Layout comun del portal admin

### Componentes de UI

| Componente | Descripcion |
|------------|-------------|
| Filtros colapsables | Panel de filtros con estado y tipo |
| Lista de notificaciones | Renderizado con AnimatePresence para animaciones |
| Item de notificacion | Card individual con icono, contenido y acciones |
| Estado vacio | Mensaje cuando no hay notificaciones |
| Estado de error | Banner de error con mensaje |
| Estado de carga | Spinner centrado |

### Dependencias de Frontend

```typescript
// React & Hooks
import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

// Icons (lucide-react)
import {
  Bell, CheckCheck, Trash2, Settings, Filter,
  AlertCircle, Megaphone, RefreshCw, Check,
  Shield, Users, Building2, Activity, Database
} from 'lucide-react';

// Store
import { useNotificationsStore } from '@/features/notifications/store/notificationsStore';

// Utils
import { cn } from '@shared/utils/cn';
```

### Backend (Referencia)

**Controlador:** `notifications.controller.ts`
**Servicio:** `notifications.service.ts`
**Gateway WebSocket:** Socket.IO con autenticacion JWT

---

## Mockups / Wireframes

### Layout de la Pagina

```
+----------------------------------------------------------+
| [Icon] Notificaciones                    [Refresh][Filter][Mark All][Settings] |
|        X sin leer                                        |
+----------------------------------------------------------+
| Filtros (colapsable)                                     |
| +------------------------------------------------------+ |
| | Estado: [Todas] [No leidas] [Leidas]                 | |
| | Tipo: [Dropdown de tipos]                            | |
| +------------------------------------------------------+ |
+----------------------------------------------------------+
| Lista de Notificaciones                                  |
| +------------------------------------------------------+ |
| | [Icon] Titulo de la notificacion           Hace 5min | |
| |        Mensaje descriptivo de la notificacion        | |
| |        [Etiqueta tipo]  [*]              [Check][Del]| |
| +------------------------------------------------------+ |
| | [Icon] Otra notificacion                    Hace 1h  | |
| |        Descripcion del evento                        | |
| |        [Etiqueta tipo]                         [Del] | |
| +------------------------------------------------------+ |
+----------------------------------------------------------+
```

---

## Notas de Implementacion

### Consideraciones

1. **Reconexion WebSocket:** El hook implementa reconexion automatica con backoff exponencial (1s-30s)
2. **Validacion de Token:** Antes de conectar WebSocket, valida que el JWT no este expirado
3. **Refresh de Token:** Si el token expira, intenta refrescarlo antes de reconectar
4. **Optimistic Updates:** Las acciones (marcar, eliminar) actualizan UI inmediatamente
5. **Filtrado Client-Side:** Los filtros de estado y tipo se aplican en el cliente sobre los datos cargados

### Limitaciones Conocidas

- Paginacion limitada a 50 items por defecto
- No hay busqueda por texto
- No hay acciones bulk (solo "marcar todas como leidas")

### Dependencias

- Conexion WebSocket funcional (API_CONFIG.wsURL)
- Token JWT valido para autenticacion WebSocket
- Permisos de super_admin para acceso a la pagina

---

## Testing

### Casos de Prueba

| ID | Descripcion | Resultado Esperado |
|----|-------------|--------------------|
| TC-01 | Cargar pagina sin notificaciones | Muestra estado vacio |
| TC-02 | Cargar pagina con notificaciones | Lista ordenada por fecha |
| TC-03 | Filtrar por estado "No leidas" | Solo muestra no leidas |
| TC-04 | Filtrar por tipo especifico | Solo muestra ese tipo |
| TC-05 | Marcar notificacion como leida | Estilo cambia, contador baja |
| TC-06 | Marcar todas como leidas | Todas cambian, contador = 0 |
| TC-07 | Eliminar notificacion | Animacion de salida, removida |
| TC-08 | Recibir notificacion via WebSocket | Aparece al inicio sin reload |
| TC-09 | Desconexion WebSocket | Reconexion automatica |
| TC-10 | Refresh manual | Lista recargada del servidor |

---

## Trazabilidad

### Archivos Principales

**Frontend:**
- `apps/frontend/src/apps/admin/pages/AdminNotificationsPage.tsx` - 396 LOC
- `apps/frontend/src/features/notifications/store/notificationsStore.ts` - 324 LOC
- `apps/frontend/src/features/notifications/hooks/useWebSocket.ts` - 343 LOC
- `apps/frontend/src/services/api/notificationsAPI.ts` - 276 LOC

### Rutas

- **Pagina:** `/admin/notifications`
- **Settings:** `/admin/settings/notifications` (link disponible)

---

## Referencias

- Epica: [EXT-002 Admin Extendido](../README.md)
- Notificaciones Multi-Channel: [EXT-003](../../EXT-003-notificaciones-multicanal/README.md)
- WebSocket Gateway: Backend Socket.IO implementation

---

**Creado por:** Technical Writer Agent
**Documentacion basada en:** Analisis de codigo fuente (2026-01-20)
