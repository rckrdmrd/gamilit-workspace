---
id: "US-PM-013"
title: "Preferencias de Notificaciones del Maestro"
type: "User Story"
status: "Done"
priority: "Media"
assignee: "@Backend-Agent, @Frontend-Agent"
epic: "EXT-001"
story_points: 5
budget: "$2,000 MXN"
sprint: "Sprint-7"
labels: ["portal-maestros", "notifications", "preferences", "push", "email", "teacher"]
created_date: "2026-01-20"
updated_date: "2026-01-20"
related: ["EXT-003", "US-NOT-001c", "US-PM-012"]
---

# US-PM-013: Preferencias de Notificaciones del Maestro

**Epica:** EXT-001 - Portal de Maestros Completo
**Sprint:** Fase 3 - Extensiones
**Story Points:** 5 SP
**Presupuesto:** $2,000 MXN
**Prioridad:** Media
**Estado:** Done
**Relacionada:** EXT-003 (Sistema de Notificaciones), US-NOT-001c (Preferencias)

---

## Descripcion

Como profesor, quiero configurar mis preferencias de notificaciones por tipo y canal para controlar como y cuando recibo notificaciones de la plataforma.

**Contexto del Alcance:**

Esta pagina proporciona:
- Configuracion de preferencias por tipo de notificacion
- Toggle para canales: In-App, Email, Push
- Gestion de dispositivos para Push Notifications
- Auto-guardado de cambios (optimistic updates)

---

## Criterios de Aceptacion

### CA-01: Navegacion y Header
- [x] Link de regreso a centro de notificaciones
- [x] Header con titulo e icono
- [x] Subtitulo descriptivo

### CA-02: Gestion de Push Notifications
- [x] Mostrar estado actual de push (Activadas/Desactivadas)
- [x] Boton para activar/desactivar push en dispositivo actual
- [x] Solo visible si el navegador soporta push
- [x] Solicitud de permiso al activar

### CA-03: Tabla de Preferencias por Tipo
- [x] Header con columnas: Tipo, In-App, Email, Push
- [x] Fila por cada tipo de notificacion relevante para teachers:
  - Tareas Entregadas
  - Mensajes de Estudiantes
  - Actualizaciones de Clase
  - Progreso de Estudiantes
  - Anuncios del Sistema
  - Eventos de Calendario
  - Alertas
- [x] Toggle switch para cada canal por tipo
- [x] Descripcion para cada tipo

### CA-04: Comportamiento de Toggles
- [x] Optimistic update al cambiar toggle
- [x] Revert automatico si falla el guardado
- [x] Indicador de guardando (opacity reducida)
- [x] Push toggles deshabilitados si push no esta activo
- [x] Tooltip indicando "Activa Push primero" si aplica

### CA-05: Gestion de Dispositivos
- [x] Lista de dispositivos registrados para push
- [x] Mostrar para cada dispositivo:
  - Nombre/tipo del dispositivo
  - Ultima fecha de uso
- [x] Boton para eliminar dispositivo
- [x] Solo visible si hay dispositivos registrados

### CA-06: Estados de Carga
- [x] Loading spinner mientras carga preferencias
- [x] Loading spinner mientras carga dispositivos
- [x] Animaciones de entrada con Framer Motion

---

## Especificaciones Tecnicas

### Frontend

**Ruta:**
```
/teacher/settings/notifications
```

**Pagina:**
- `TeacherNotificationPreferencesPage.tsx` - Componente completo

**Store Utilizado:**
```typescript
import { useNotificationsStore } from '@/features/notifications/store/notificationsStore';

const {
  preferences,
  devices,
  preferencesLoading,
  devicesLoading,
  fetchPreferences,
  fetchDevices,
  updatePreference,
  deleteDevice,
} = useNotificationsStore();
```

**Hook de Push Notifications:**
```typescript
import { usePushNotifications } from '@/features/notifications/hooks/usePushNotifications';

const {
  isSupported: pushSupported,
  isSubscribedToPush: pushEnabled,
  enablePushNotifications: enablePush,
  disablePushNotifications: disablePush,
} = usePushNotifications();
```

**Tipos de Notificacion (Configurables):**
```typescript
const notificationTypes = [
  { key: 'assignment_submitted', label: 'Tareas Entregadas', description: 'Cuando un estudiante entrega una tarea' },
  { key: 'student_message', label: 'Mensajes de Estudiantes', description: 'Mensajes directos de estudiantes' },
  { key: 'class_update', label: 'Actualizaciones de Clase', description: 'Cambios en la configuracion de clases' },
  { key: 'student_progress', label: 'Progreso de Estudiantes', description: 'Hitos de progreso de estudiantes' },
  { key: 'system_announcement', label: 'Anuncios del Sistema', description: 'Comunicaciones oficiales del sistema' },
  { key: 'calendar_event', label: 'Eventos de Calendario', description: 'Recordatorios de eventos programados' },
  { key: 'alert', label: 'Alertas', description: 'Alertas de intervencion y urgentes' },
];
```

**State Local:**
```typescript
// Aligned with API field names
const [localPreferences, setLocalPreferences] = useState<
  Record<string, { inAppEnabled: boolean; emailEnabled: boolean; pushEnabled: boolean }>
>({});
const [savingType, setSavingType] = useState<string | null>(null);
```

### Backend

**Endpoints Utilizados:**
| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| GET | `/notifications/preferences` | Obtener preferencias del usuario |
| PUT | `/notifications/preferences/:type` | Actualizar preferencia por tipo |
| GET | `/notifications/devices` | Lista de dispositivos registrados |
| DELETE | `/notifications/devices/:id` | Eliminar dispositivo |
| POST | `/notifications/push/subscribe` | Registrar suscripcion push |
| DELETE | `/notifications/push/unsubscribe` | Eliminar suscripcion push |

**Interface de Preferencia:**
```typescript
interface NotificationPreference {
  notificationType: string;
  inAppEnabled: boolean;
  emailEnabled: boolean;
  pushEnabled: boolean;
}
```

**Interface de Dispositivo:**
```typescript
interface RegisteredDevice {
  id: string;
  deviceName: string;
  deviceType: string;
  lastUsedAt: string;
}
```

---

## Diseno UI/UX

### Layout Desktop
```
+-------------------------------------------------------------------+
|  [<-] [Bell] Preferencias de Notificaciones                       |
|       Configura como recibir notificaciones                       |
+-------------------------------------------------------------------+
|  NOTIFICACIONES PUSH                                              |
|  +---------------------------------------------------------------+|
|  | [Phone]  Notificaciones Push                                  ||
|  |          Activadas en este dispositivo          [Desactivar]  ||
|  +---------------------------------------------------------------+|
+-------------------------------------------------------------------+
|  PREFERENCIAS POR TIPO                                            |
|  +---------------------------------------------------------------+|
|  | Tipo de Notificacion    | In-App  | Email   | Push            ||
|  |-------------------------|---------|---------|-----------------|
|  | Tareas Entregadas       |  [x]    |  [x]    |  [ ]            ||
|  | Cuando un estudiante... |         |         |                 ||
|  |-------------------------|---------|---------|-----------------|
|  | Mensajes de Estudiantes |  [x]    |  [x]    |  [x]            ||
|  | Mensajes directos de... |         |         |                 ||
|  |-------------------------|---------|---------|-----------------|
|  | Actualizaciones Clase   |  [x]    |  [ ]    |  [ ]            ||
|  | Cambios en la config... |         |         |                 ||
|  +---------------------------------------------------------------+|
+-------------------------------------------------------------------+
|  DISPOSITIVOS REGISTRADOS                                         |
|  +---------------------------------------------------------------+|
|  | [Phone] Chrome - MacOS                                        ||
|  |         Ultimo uso: 20 Ene 2026                       [Trash] ||
|  +---------------------------------------------------------------+|
|  | [Phone] Safari - iPhone                                       ||
|  |         Ultimo uso: 19 Ene 2026                       [Trash] ||
|  +---------------------------------------------------------------+|
+-------------------------------------------------------------------+
```

---

## Dependencias

### Dependencias de User Stories:
- US-PM-012 (Centro de Notificaciones) - Navegacion
- US-NOT-001c (Preferencias de Notificaciones) - Infraestructura
- EP001 (Auth System) - JWT auth y role='teacher'

### Dependencias de Backend:
- Sistema de preferencias de notificaciones (EXT-003)
- Sistema de push notifications
- Gestion de dispositivos

---

## Estimacion de Esfuerzo

**Backend:** 1 SP
- Endpoints ya implementados en EXT-003
- Logica de preferencias reutilizada

**Frontend:** 3 SP
- Tabla de preferencias con toggles
- Integracion con push notifications
- Gestion de dispositivos

**Testing:** 1 SP

**Total:** 5 SP = $2,000 MXN

---

## Notas de Implementacion

- Pagina implementada: `apps/frontend/src/apps/teacher/pages/TeacherNotificationPreferencesPage.tsx`
- Utiliza Zustand store compartido de notificaciones
- Hook de push notifications para integracion con Service Worker
- Optimistic updates para mejor UX
- Navegacion de regreso a `/teacher/notifications`

---

**Ultima actualizacion:** 2026-01-20
**Version:** 1.0
**Estado:** Done - Implementado
