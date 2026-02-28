---
titulo: "Migración a Web Push Nativo (VAPID)"
tipo: api
fecha_creacion: "2025-10-01"
ultima_actualizacion: "2026-02-28"
estado: activo
---

# Migración a Web Push Nativo (VAPID)

**Fecha:** 2025-11-29
**Versión:** 2.0
**Autor:** Backend-Agent

## Resumen

Se migró el sistema de push notifications de **Firebase Cloud Messaging (FCM)** a **Web Push API nativo** usando la librería `web-push` y el protocolo VAPID (Voluntary Application Server Identification).

## Motivación

### Problemas con Firebase:
- Dependencia de servicios externos (vendor lock-in)
- Requiere configuración de cuenta Firebase
- Complejidad en credenciales (service account JSON)
- Costos potenciales en producción
- Latencia adicional por proxy de Firebase

### Ventajas de Web Push nativo:
- Sin dependencias de servicios externos
- Claves VAPID generadas localmente
- Protocolo estándar W3C
- Compatible con todos los navegadores modernos
- Control total sobre la infraestructura
- Sin costos adicionales

## Cambios Implementados

### 1. Dependencias

**Eliminado:**
```bash
npm uninstall firebase-admin
```

**Agregado:**
```bash
npm install web-push
```

### 2. Servicio Principal

**Archivo:** `src/modules/notifications/services/push-notification.service.ts`

**Cambios principales:**
- Reemplazado `firebase-admin` por `web-push`
- Cambio de autenticación: Service Account → VAPID Keys
- Cambio de formato de token: FCM Token → PushSubscription JSON
- Manejo de errores adaptado: FCM codes → HTTP status codes

**Antes (Firebase):**
```typescript
import * as admin from 'firebase-admin';

// Inicialización
admin.initializeApp({
  credential: admin.credential.cert({
    projectId: 'xxx',
    clientEmail: 'xxx',
    privateKey: 'xxx'
  })
});

// Envío
await admin.messaging().send({
  token: 'fcm-token',
  notification: { title, body }
});
```

**Después (Web Push):**
```typescript
import * as webpush from 'web-push';

// Inicialización
webpush.setVapidDetails(
  'mailto:admin@gamilit.com',
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
);

// Envío
const subscription = JSON.parse(deviceToken);
await webpush.sendNotification(subscription, payload);
```

### 3. Controller

**Archivo:** `src/modules/notifications/controllers/notification-devices.controller.ts`

**Nuevo endpoint agregado:**
```typescript
@Get('vapid-public-key')
getVapidPublicKey() {
  const key = this.pushNotificationService.getVapidPublicKey();
  return { vapidPublicKey: key };
}
```

Este endpoint NO requiere autenticación porque la clave pública es necesaria ANTES de que el usuario se autentique (para crear la subscription).

### 4. Variables de Entorno

**Archivo:** `.env.production.example`

**Eliminado:**
```bash
FIREBASE_PROJECT_ID=xxx
FIREBASE_CLIENT_EMAIL=xxx
FIREBASE_PRIVATE_KEY=xxx
```

**Agregado:**
```bash
VAPID_PUBLIC_KEY=<generar>
VAPID_PRIVATE_KEY=<generar>
VAPID_SUBJECT=mailto:admin@gamilit.com
```

### 5. Generación de Claves VAPID

**Script creado:** `scripts/generate-vapid-keys.js`

**Uso:**
```bash
npm run generate:vapid
```

**Output:**
```
VAPID_PUBLIC_KEY=BN4GvZtEZiZuqaaObWga7lEP-S1WCv7L1c...
VAPID_PRIVATE_KEY=aB3cDefGh4IjKlM5nOpQr6StUvWxYz...
VAPID_SUBJECT=mailto:admin@gamilit.com
```

> **IMPORTANTE (2026-01-04):** Las claves VAPID DEBEN ser valores válidos generados por
> `web-push`. El archivo `.env` contiene valores placeholder por defecto que NO funcionan.
> Si el backend muestra el error `"Vapid public key must be a URL safe Base 64"`, ejecuta
> `npm run generate:vapid` y copia las claves generadas al archivo `.env`.

### 6. Módulo de Notificaciones

**Archivo:** `src/modules/notifications/notifications.module.ts`

- Actualizada documentación del módulo
- `PushNotificationService` ahora usa `web-push` en lugar de Firebase
- No se requirieron cambios en providers/exports

## Estructura de Datos

### Antes: FCM Token
```
deviceToken: "dUzV1qzxTHGKj8qY9ZxYzP:APA91bF..."
```

### Después: PushSubscription JSON
```json
{
  "endpoint": "https://fcm.googleapis.com/fcm/send/...",
  "keys": {
    "p256dh": "BN4GvZtEZiZuqaaObWga7lEP...",
    "auth": "aB3cDefGh4IjKlM5nOpQr6StUvWxYz..."
  }
}
```

**Nota:** El `endpoint` puede ser de FCM, Mozilla Push Service, Windows Push Service, etc. El protocolo Web Push es universal.

## Configuración en Producción

### 1. Generar Claves VAPID

```bash
cd apps/backend
npm run generate:vapid
```

### 2. Copiar Variables

Agregar las claves generadas a `.env.production`:

```bash
## Web Push VAPID Keys
VAPID_PUBLIC_KEY=<clave-publica-generada>
VAPID_PRIVATE_KEY=<clave-privada-generada>
VAPID_SUBJECT=mailto:admin@gamilit.com
```

### 3. Seguridad

- ❌ NUNCA commitear `VAPID_PRIVATE_KEY` al repositorio
- ✅ Usar variables de entorno del sistema en producción
- ✅ Restringir permisos de archivo `.env.production` (chmod 600)

### 4. Reiniciar Backend

```bash
npm run build
npm run prod
```

## Integración Frontend

### 1. Obtener Clave Pública VAPID

```typescript
const response = await fetch('/api/notifications/devices/vapid-public-key');
const { vapidPublicKey } = await response.json();
```

### 2. Crear PushSubscription

```typescript
// Verificar soporte
if ('serviceWorker' in navigator && 'PushManager' in window) {
  // Registrar Service Worker
  const registration = await navigator.serviceWorker.register('/sw.js');

  // Solicitar permiso
  const permission = await Notification.requestPermission();

  if (permission === 'granted') {
    // Crear subscription
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
    });

    // Enviar a backend
    await fetch('/api/notifications/devices', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        deviceToken: JSON.stringify(subscription),
        deviceType: 'web',
        deviceName: navigator.userAgent
      })
    });
  }
}
```

### 3. Utility Function

```typescript
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}
```

### 4. Service Worker

**Archivo:** `public/sw.js`

```javascript
self.addEventListener('push', event => {
  const data = event.data.json();

  const options = {
    body: data.body,
    icon: data.icon || '/icons/icon-192x192.png',
    badge: data.badge || '/icons/badge-72x72.png',
    vibrate: data.vibrate || [200, 100, 200],
    data: data.data || {},
    tag: data.tag || 'gamilit-notification'
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();

  const url = event.notification.data?.url || '/';

  event.waitUntil(
    clients.openWindow(url)
  );
});
```

## Compatibilidad de Navegadores

| Navegador | Versión Mínima | Notas |
|-----------|---------------|-------|
| Chrome | 42+ | Full support |
| Firefox | 44+ | Full support |
| Edge | 17+ | Full support |
| Safari | 16.4+ | iOS 16.4+ required |
| Opera | 29+ | Full support |
| Samsung Internet | 4+ | Full support |

## Manejo de Errores

### HTTP Status Codes

| Código | Significado | Acción |
|--------|-------------|--------|
| 201 | Created | Notification enviada exitosamente |
| 410 | Gone | Subscription expirada, invalidar device |
| 404 | Not Found | Subscription no encontrada, invalidar device |
| 400 | Bad Request | Subscription malformada |

### Invalidación Automática

El servicio invalida automáticamente subscriptions expiradas:

```typescript
// En push-notification.service.ts
if (error.statusCode === 410 || error.statusCode === 404) {
  throw new InvalidSubscriptionError(error.statusCode);
}

// En sendToUser()
if (error instanceof InvalidSubscriptionError) {
  await this.userDeviceService.invalidateDevice(userId, deviceToken);
}
```

## Testing

### 1. Verificar Inicialización

```bash
## Logs al iniciar backend
[PushNotificationService] Web Push initialized successfully with VAPID keys
```

### 2. Obtener Clave Pública

```bash
curl http://localhost:3006/api/notifications/devices/vapid-public-key
```

**Response esperado:**
```json
{
  "vapidPublicKey": "BN4GvZtEZiZuqaaObWga7lEP..."
}
```

### 3. Enviar Notificación de Prueba

```typescript
// En cualquier service
await this.pushNotificationService.sendToUser(userId, {
  title: 'Test Notification',
  body: 'This is a test from Web Push',
  icon: '/icons/icon-192x192.png',
  data: { url: '/dashboard' }
});
```

## Troubleshooting

### Problema: "VAPID keys not configured"

**Causa:** Variables de entorno no configuradas

**Solución:**
```bash
npm run generate:vapid
## Copiar output a .env
```

### Problema: "Invalid device token format"

**Causa:** deviceToken no es JSON válido de PushSubscription

**Solución:**
- Verificar que frontend envía `JSON.stringify(subscription)`
- Verificar que no hay corrupción en base de datos

### Problema: "Subscription expired (status: 410)"

**Causa:** Usuario revocó permisos o desinstaló app

**Solución:**
- El servicio invalida automáticamente
- Frontend debe re-registrar subscription

## Rollback (si es necesario)

Si se necesita volver a Firebase:

1. Reinstalar firebase-admin:
```bash
npm install firebase-admin
```

2. Restaurar servicio desde git:
```bash
git checkout HEAD~1 -- src/modules/notifications/services/push-notification.service.ts
```

3. Restaurar variables de entorno:
```bash
## Usar FIREBASE_* en lugar de VAPID_*
```

## Referencias

- [Web Push Protocol Spec](https://datatracker.ietf.org/doc/html/rfc8030)
- [VAPID Spec](https://datatracker.ietf.org/doc/html/rfc8292)
- [MDN Web Push API](https://developer.mozilla.org/en-US/docs/Web/API/Push_API)
- [web-push npm package](https://www.npmjs.com/package/web-push)
- [Push Notifications Guide](https://web.dev/push-notifications-overview/)

## Checklist de Migración

### Backend
- [x] Desinstalar firebase-admin
- [x] Instalar web-push
- [x] Reescribir PushNotificationService
- [x] Agregar endpoint VAPID public key
- [x] Actualizar .env.production.example
- [x] Crear script generate-vapid-keys.js
- [x] Ejecutar npm run build (sin errores)
- [x] Ejecutar npm run lint (sin errores)

### Frontend (Pendiente)
- [ ] Obtener VAPID public key desde API
- [ ] Crear PushSubscription con VAPID key
- [ ] Registrar Service Worker
- [ ] Implementar utility urlBase64ToUint8Array
- [ ] Enviar subscription (JSON) a backend
- [ ] Manejar notificationclick event

### Producción (Pendiente)
- [ ] Generar claves VAPID para producción
- [ ] Configurar variables de entorno
- [ ] Deploy backend actualizado
- [ ] Probar push notifications en navegadores
- [ ] Monitorear logs de errores

## Notas Finales

Esta migración elimina la dependencia de Firebase manteniendo toda la funcionalidad de push notifications. El sistema ahora es:

- Más simple (menos configuración)
- Más económico (sin costos de Firebase)
- Más portable (estándar W3C)
- Más controlable (infraestructura propia)

La única consideración es que Safari requiere iOS 16.4+ (lanzado marzo 2023), pero la mayoría de usuarios ya tienen esta versión o superior.
