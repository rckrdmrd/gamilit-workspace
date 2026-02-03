---
id: "US-AE-018"
title: "Preferencias de Notificaciones del Administrador"
type: "User Story"
status: "Done"
priority: "Media"
assignee: "@Frontend-Agent"
epic: "EXT-002"
story_points: 4
budget: "$1,600 MXN"
sprint: "Sprint-3"
labels: ["admin-extendido", "notifications", "preferences", "multi-channel", "push-notifications", "devices"]
created_date: "2026-01-20"
updated_date: "2026-01-20"
completed_date: "2026-01-20"
related_stories: ["US-AE-017"]
---

# US-AE-018: Preferencias de Notificaciones del Administrador

## Informacion General

| Campo | Valor |
|-------|-------|
| **ID** | US-AE-018 |
| **Epica** | EXT-002 - Admin Extendido |
| **Titulo** | Preferencias de Notificaciones del Administrador |
| **Prioridad** | Media (P2) |
| **Story Points** | 4 SP |
| **Estado** | Done |
| **Sprint** | Sprint 3 |
| **Ruta** | `/admin/settings/notifications` |
| **Historia Relacionada** | US-AE-017 (Centro de Notificaciones) |

---

## Historia de Usuario

**Como** super admin del sistema GAMILIT
**Quiero** configurar mis preferencias de notificaciones por tipo y canal de entrega (In-App, Email, Push)
**Para** recibir solo las notificaciones relevantes a traves de los canales que prefiero y gestionar mis dispositivos registrados para push notifications

---

## Descripcion

La pagina de Preferencias de Notificaciones permite al administrador personalizar como recibe las notificaciones del sistema. Incluye configuracion por tipo de notificacion y canal de entrega (In-App, Email, Push), asi como gestion de dispositivos registrados para notificaciones push.

### Sistema Multi-Canal

El sistema soporta tres canales de notificacion:

| Canal | Descripcion | Default |
|-------|-------------|---------|
| **In-App** | Notificaciones dentro de la aplicacion | Activado |
| **Email** | Notificaciones por correo electronico | Activado |
| **Push** | Notificaciones push en navegador/dispositivo | Desactivado |

### Tipos de Notificaciones Configurables (Admin)

| Tipo | Clave | Descripcion |
|------|-------|-------------|
| Anuncios del Sistema | `system_announcement` | Comunicaciones oficiales |
| Alertas de Seguridad | `security_alert` | Incidentes y amenazas de seguridad |
| Actividad de Usuarios | `user_activity` | Registros y actividad de usuarios |
| Instituciones | `institution_update` | Cambios en instituciones |
| Estado del Sistema | `system_health` | Metricas y alertas de salud |
| Base de Datos | `database_alert` | Alertas de base de datos |

---

## Endpoints API (8 endpoints)

### Preferencias (Multi-Channel)

| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| GET | `/api/notifications/preferences` | Obtener preferencias del usuario |
| PATCH | `/api/notifications/preferences/:type` | Actualizar preferencia por tipo |
| PATCH | `/api/notifications/preferences` | Actualizar multiples preferencias (batch) |

### Dispositivos (Push Notifications)

| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| GET | `/api/notifications/devices` | Listar dispositivos registrados |
| POST | `/api/notifications/devices` | Registrar nuevo dispositivo |
| PATCH | `/api/notifications/devices/:id` | Actualizar nombre de dispositivo |
| DELETE | `/api/notifications/devices/:id` | Eliminar dispositivo |
| GET | `/api/notifications/devices/vapid-public-key` | Obtener clave VAPID para Web Push |

### DTOs de Preferencias

```typescript
interface NotificationPreference {
  id: string;
  userId: string;
  notificationType: string;
  inAppEnabled: boolean;
  emailEnabled: boolean;
  pushEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

interface UpdatePreferenceDto {
  inAppEnabled?: boolean;
  emailEnabled?: boolean;
  pushEnabled?: boolean;
}
```

### DTOs de Dispositivos

```typescript
interface UserDevice {
  id: string;
  userId: string;
  deviceToken: string; // Masked for security
  deviceType: 'ios' | 'android' | 'web';
  deviceName?: string;
  isActive: boolean;
  lastUsedAt?: string;
  createdAt: string;
}

interface RegisterDeviceDto {
  deviceToken: string;
  deviceType: 'ios' | 'android' | 'web';
  deviceName?: string;
}
```

---

## Criterios de Aceptacion

### AC-1: Visualizar Preferencias Actuales
**DADO** un super admin autenticado
**CUANDO** accede a `/admin/settings/notifications`
**ENTONCES** ve una tabla con todos los tipos de notificacion y sus estados por canal (In-App, Email, Push)

### AC-2: Toggle de Preferencia Individual
**DADO** la tabla de preferencias visible
**CUANDO** el admin hace clic en un toggle (In-App/Email/Push) para un tipo especifico
**ENTONCES** la preferencia se actualiza inmediatamente y se guarda en el servidor

### AC-3: Estado de Push Global
**DADO** que el navegador soporta Web Push
**CUANDO** el admin ve la pagina
**ENTONCES** se muestra un panel con el estado de las notificaciones push y boton para activar/desactivar

### AC-4: Activar Push Notifications
**DADO** que push notifications estan desactivadas
**CUANDO** el admin hace clic en "Activar"
**ENTONCES** se solicita permiso al navegador, se registra el dispositivo y se habilitan los toggles de Push por tipo

### AC-5: Desactivar Push Notifications
**DADO** que push notifications estan activadas
**CUANDO** el admin hace clic en "Desactivar"
**ENTONCES** se cancela la suscripcion push y los toggles de Push quedan deshabilitados

### AC-6: Toggles Push Deshabilitados sin Suscripcion
**DADO** que el admin no tiene push notifications activadas
**CUANDO** intenta activar el toggle de Push para cualquier tipo
**ENTONCES** el toggle permanece deshabilitado (opaco) hasta que active push globalmente

### AC-7: Listar Dispositivos Registrados
**DADO** que el admin tiene dispositivos registrados para push
**CUANDO** la pagina carga
**ENTONCES** se muestra la lista de dispositivos con nombre, tipo y fecha de ultimo uso

### AC-8: Eliminar Dispositivo
**DADO** la lista de dispositivos visible
**CUANDO** el admin hace clic en el icono de eliminar de un dispositivo
**ENTONCES** el dispositivo se elimina y desaparece de la lista

### AC-9: Navegacion desde Centro de Notificaciones
**DADO** el admin esta en la pagina de notificaciones (`/admin/notifications`)
**CUANDO** hace clic en el icono de configuracion (Settings)
**ENTONCES** navega a `/admin/settings/notifications`

### AC-10: Navegacion de Regreso
**DADO** el admin esta en la pagina de preferencias
**CUANDO** hace clic en la flecha de regreso
**ENTONCES** navega a `/admin/notifications`

---

## Especificacion Tecnica

### Frontend

**Pagina:** `AdminNotificationPreferencesPage.tsx`
**Ubicacion:** `apps/frontend/src/apps/admin/pages/`
**LOC:** ~310 lineas
**Ruta:** `/admin/settings/notifications`

### Store Zustand

**Store:** `useNotificationsStore`
**Ubicacion:** `apps/frontend/src/features/notifications/store/notificationsStore.ts`

**Estados utilizados:**
- `preferences` - Array de preferencias del usuario
- `devices` - Array de dispositivos registrados
- `preferencesLoading` - Estado de carga de preferencias
- `devicesLoading` - Estado de carga de dispositivos

**Acciones utilizadas:**
- `fetchPreferences()` - Cargar preferencias
- `fetchDevices()` - Cargar dispositivos
- `updatePreference(type, updates)` - Actualizar preferencia individual
- `deleteDevice(deviceId)` - Eliminar dispositivo

### Hooks Utilizados

| Hook | Descripcion |
|------|-------------|
| `useNotificationsStore` | Store centralizado de notificaciones |
| `usePushNotifications` | Gestion de Web Push API |
| `useAuth` | Contexto de autenticacion |
| `useUserGamification` | Datos de gamificacion del usuario |

### Hook usePushNotifications

**Ubicacion:** `apps/frontend/src/features/notifications/hooks/usePushNotifications.ts`
**LOC:** ~169 lineas

**Interface:**
```typescript
interface UsePushNotificationsReturn {
  isSupported: boolean;              // Web Push soportado
  permissionStatus: NotificationPermission;
  isSubscribedToPush: boolean;       // Suscrito actualmente
  isRegistering: boolean;            // En proceso de registro
  error: string | null;
  enablePushNotifications: () => Promise<boolean>;
  disablePushNotifications: () => Promise<boolean>;
}
```

### Layout

- `AdminLayout` - Layout comun del portal admin

### Dependencias de Frontend

```typescript
// React & Routing
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

// Icons (lucide-react)
import {
  Bell,
  ArrowLeft,
  Smartphone,
  Mail,
  MonitorSmartphone,
  Loader2,
  Trash2,
} from 'lucide-react';

// Store & Hooks
import { useNotificationsStore } from '@/features/notifications/store/notificationsStore';
import { usePushNotifications } from '@/features/notifications/hooks/usePushNotifications';
import { useAuth } from '@/app/providers/AuthContext';
import { useUserGamification } from '@shared/hooks/useUserGamification';

// Utils
import { cn } from '@shared/utils/cn';
```

### Backend (Referencia)

**Controlador:** `notifications.controller.ts`
**Servicio:** `notifications.service.ts`
**Entities:** `NotificationPreference`, `UserDevice`

---

## Mockups / Wireframes

### Layout de la Pagina

```
+----------------------------------------------------------+
| [<-] [Icon] Preferencias de Notificaciones               |
|             Configura como recibir notificaciones        |
+----------------------------------------------------------+
| Push Notifications Status (si soportado)                 |
| +------------------------------------------------------+ |
| | [Phone Icon] Notificaciones Push                     | |
| |              Activadas en este dispositivo           | |
| |                                    [Desactivar]      | |
| +------------------------------------------------------+ |
+----------------------------------------------------------+
| Preferences Table                                        |
| +------------------------------------------------------+ |
| | Tipo de Notificacion | In-App | Email | Push         | |
| +------------------------------------------------------+ |
| | Anuncios del Sistema |  [O]   |  [O]  |  [ ]         | |
| | Desc breve           |        |       |              | |
| +------------------------------------------------------+ |
| | Alertas de Seguridad |  [O]   |  [O]  |  [ ]         | |
| | Desc breve           |        |       |              | |
| +------------------------------------------------------+ |
| | ... (mas tipos)      |        |       |              | |
| +------------------------------------------------------+ |
+----------------------------------------------------------+
| Dispositivos Registrados (si hay)                        |
| +------------------------------------------------------+ |
| | [Phone] Chrome en Windows                            | |
| |         web - Ultimo uso: 20/01/2026         [Trash] | |
| +------------------------------------------------------+ |
| | [Phone] Firefox en macOS                             | |
| |         web - Ultimo uso: 19/01/2026         [Trash] | |
| +------------------------------------------------------+ |
+----------------------------------------------------------+
```

---

## Notas de Implementacion

### Consideraciones

1. **Web Push API Nativo:** Usa Web Push API nativo, no Firebase Cloud Messaging
2. **VAPID Authentication:** Requiere clave VAPID del servidor para autenticar suscripciones
3. **Upsert Pattern:** Las preferencias se crean automaticamente si no existen al actualizar
4. **Optimistic Updates:** La UI se actualiza inmediatamente al hacer toggle, con rollback si falla
5. **Push Dependency:** Los toggles de Push por tipo requieren que push global este activado
6. **Device Detection:** Detecta automaticamente navegador y SO para nombrar el dispositivo

### Defaults del Sistema

Si el usuario no tiene preferencias configuradas:
- In-App: `true` (activado)
- Email: `true` (activado)
- Push: `false` (desactivado)

### Limitaciones Conocidas

- Solo soporta dispositivos tipo "web" (no iOS/Android nativo)
- No hay opcion para renombrar dispositivos desde la UI (solo eliminar)
- Service Worker requerido para Web Push

### Dependencias

- Navegador con soporte Web Push (`isWebPushSupported()`)
- Service Worker registrado
- Clave VAPID configurada en backend
- Permisos de super_admin para acceso a la pagina

---

## Testing

### Casos de Prueba

| ID | Descripcion | Resultado Esperado |
|----|-------------|--------------------|
| TC-01 | Cargar pagina con preferencias existentes | Tabla muestra estado correcto |
| TC-02 | Cargar pagina sin preferencias | Usa defaults del sistema |
| TC-03 | Toggle In-App para un tipo | Preferencia se actualiza |
| TC-04 | Toggle Email para un tipo | Preferencia se actualiza |
| TC-05 | Toggle Push sin suscripcion | Toggle deshabilitado |
| TC-06 | Activar Push notifications | Solicita permiso, registra device |
| TC-07 | Toggle Push con suscripcion | Preferencia se actualiza |
| TC-08 | Desactivar Push notifications | Cancela suscripcion |
| TC-09 | Ver dispositivos registrados | Lista dispositivos |
| TC-10 | Eliminar dispositivo | Device removido de lista |
| TC-11 | Navegacion de regreso | Vuelve a /admin/notifications |
| TC-12 | Error en API | Rollback de estado local |

---

## Trazabilidad

### Archivos Principales

**Frontend:**
- `apps/frontend/src/apps/admin/pages/AdminNotificationPreferencesPage.tsx` - 310 LOC
- `apps/frontend/src/features/notifications/store/notificationsStore.ts` - 324 LOC
- `apps/frontend/src/features/notifications/hooks/usePushNotifications.ts` - 169 LOC
- `apps/frontend/src/services/api/notificationsAPI.ts` - 276 LOC
- `apps/frontend/src/config/webpush.ts` - Config Web Push

### Rutas

- **Pagina:** `/admin/settings/notifications`
- **Origen:** `/admin/notifications` (link desde settings icon)
- **Destino:** `/admin/notifications` (link de regreso)

---

## Referencias

- Historia Relacionada: [US-AE-017 Centro de Notificaciones](./US-AE-017-notifications-management.md)
- Epica: [EXT-002 Admin Extendido](../README.md)
- Notificaciones Multi-Channel: [EXT-003](../../EXT-003-notificaciones-multicanal/README.md)
- Web Push API: https://developer.mozilla.org/en-US/docs/Web/API/Push_API

---

**Creado por:** Technical Writer Agent
**Documentacion basada en:** Analisis de codigo fuente (2026-01-20)
