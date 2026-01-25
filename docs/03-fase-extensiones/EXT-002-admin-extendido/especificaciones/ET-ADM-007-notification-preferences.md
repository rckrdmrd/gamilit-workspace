# ET-ADM-007: Preferencias de Notificacion

## Metadata

| Campo | Valor |
|-------|-------|
| **ID** | ET-ADM-007 |
| **Modulo** | Admin Extendido |
| **Titulo** | Implementacion de Preferencias de Notificacion |
| **Prioridad** | Media |
| **Estado** | Implementado |
| **Version** | 1.0 |
| **Fecha Creacion** | 2026-01-25 |
| **Ultima Actualizacion** | 2026-01-25 |
| **Autor** | Architecture Analyst |

---

## Referencias

### User Stories
- US-AE-014: Preferencias de Notificacion

---

## Arquitectura

### Diagrama de Capas

```
+----------------------------------------------------------+
|                   FRONTEND (React)                        |
|  - AdminNotificationPreferencesPage                       |
|  - useNotificationsStore (preferences)                    |
|  - usePushNotifications (PWA)                             |
+-----------------------------+----------------------------+
                              | REST API
+-----------------------------v----------------------------+
|                  BACKEND (NestJS)                        |
|  - NotificationsPreferencesController                    |
|  - NotificationsPreferencesService                       |
|  - DevicesService                                        |
+-----------------------------+----------------------------+
                              | SQL Queries
+-----------------------------v----------------------------+
|               DATABASE (PostgreSQL)                       |
|  - notifications_system.user_notification_preferences    |
|  - notifications_system.user_devices                     |
+----------------------------------------------------------+
```

---

## Implementacion Backend

### Endpoints

**Ubicacion:** `apps/backend/src/notifications/`

```typescript
// Preferences
GET  /notifications/preferences          - Obtener preferencias
PATCH /notifications/preferences/:type   - Actualizar preferencia

// Devices
GET    /notifications/devices            - Listar dispositivos
DELETE /notifications/devices/:id        - Eliminar dispositivo
```

### Entities

**UserNotificationPreference:**
```typescript
@Entity({ schema: 'notifications_system', name: 'user_notification_preferences' })
export class UserNotificationPreference {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ name: 'notification_type' })
  type: NotificationType;

  @Column({ name: 'in_app_enabled', default: true })
  inAppEnabled: boolean;

  @Column({ name: 'email_enabled', default: false })
  emailEnabled: boolean;

  @Column({ name: 'push_enabled', default: false })
  pushEnabled: boolean;
}
```

**UserDevice:**
```typescript
@Entity({ schema: 'notifications_system', name: 'user_devices' })
export class UserDevice {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ name: 'device_name' })
  deviceName: string;

  @Column({ name: 'device_type' })
  deviceType: 'web' | 'mobile' | 'desktop';

  @Column({ name: 'push_subscription', type: 'jsonb', nullable: true })
  pushSubscription: object;

  @Column({ name: 'last_used_at' })
  lastUsedAt: Date;
}
```

---

## Implementacion Frontend

### Pagina Principal

**Ubicacion:** `apps/frontend/src/apps/admin/pages/AdminNotificationPreferencesPage.tsx`

### Estructura de UI

```
AdminLayout
  └── Container (max-w-4xl)
      ├── Header
      │   ├── Back Link (→ /admin/notifications)
      │   └── Title: "Preferencias de Notificacion"
      │
      ├── Push Notifications Card (condicional)
      │   ├── Status Badge (Activadas/Desactivadas)
      │   └── Toggle Button
      │
      ├── Notification Types Grid
      │   └── [Para cada tipo]
      │       ├── Type Label + Icon
      │       └── Channel Toggles (In-App, Email, Push)
      │
      └── Devices Card
          └── [Para cada dispositivo]
              ├── Device Name + Type
              ├── Last Used Date
              └── Delete Button
```

### Custom Hooks

**usePushNotifications:**
```typescript
interface UsePushNotificationsReturn {
  isSupported: boolean;
  isSubscribedToPush: boolean;
  enablePushNotifications: () => Promise<void>;
  disablePushNotifications: () => Promise<void>;
}
```

### State Management

**Local State:**
```typescript
localPreferences: Record<string, {
  inAppEnabled: boolean;
  emailEnabled: boolean;
  pushEnabled: boolean;
}>

savingType: string | null  // Indica cual tipo se esta guardando
```

### Tipos de Notificacion Configurables

| Tipo | Label | Icono |
|------|-------|-------|
| system_announcement | Anuncio del Sistema | Megaphone |
| security_alert | Alerta de Seguridad | Shield |
| user_activity | Actividad de Usuarios | Users |
| institution_update | Actualizacion de Institucion | Building2 |
| system_health | Estado del Sistema | Activity |
| database_alert | Alerta de Base de Datos | Database |

### Canales de Notificacion

| Canal | Descripcion | Icono |
|-------|-------------|-------|
| In-App | Notificaciones dentro de la aplicacion | MonitorSmartphone |
| Email | Notificaciones por correo electronico | Mail |
| Push | Notificaciones push del navegador | Smartphone |

---

## API REST Endpoints

| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| GET | `/api/notifications/preferences` | Obtener todas las preferencias |
| PATCH | `/api/notifications/preferences/:type` | Actualizar preferencia por tipo |
| GET | `/api/notifications/devices` | Listar dispositivos registrados |
| DELETE | `/api/notifications/devices/:id` | Eliminar dispositivo |

### Request/Response

**GET /preferences Response:**
```typescript
{
  preferences: Array<{
    type: NotificationType;
    inAppEnabled: boolean;
    emailEnabled: boolean;
    pushEnabled: boolean;
  }>
}
```

**PATCH /preferences/:type Body:**
```typescript
{
  inAppEnabled?: boolean;
  emailEnabled?: boolean;
  pushEnabled?: boolean;
}
```

---

## Funcionalidades

1. **Configuracion Multi-Canal:**
   - Toggle independiente para cada canal
   - Optimistic UI updates
   - Rollback en caso de error

2. **Push Notifications:**
   - Verificacion de soporte del navegador
   - Suscripcion/desuscripcion
   - Integracion con Service Worker

3. **Gestion de Dispositivos:**
   - Lista de dispositivos registrados
   - Fecha de ultimo uso
   - Eliminacion de dispositivos

---

## Dependencias

### Frontend
- zustand (state management)
- framer-motion (animaciones)
- lucide-react (iconos)
- Web Push API (navegador)

---

## Historial de Cambios

| Version | Fecha | Autor | Cambios |
|---------|-------|-------|---------|
| 1.0 | 2026-01-25 | Architecture Analyst | Creacion inicial |

---

*Documento: ET-ADM-007-notification-preferences.md*
*Generado: 2026-01-25*
