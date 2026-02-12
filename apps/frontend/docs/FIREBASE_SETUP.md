# Firebase Cloud Messaging Setup

## Instalación

Para habilitar las notificaciones push con Firebase, sigue estos pasos:

### 1. Instalar dependencias de Firebase

```bash
cd apps/frontend
npm install firebase
```

### 2. Configurar variables de entorno

Copia las variables de Firebase del archivo `.env.example` a tu archivo `.env`:

```bash
# Firebase Configuration for Push Notifications
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_FIREBASE_VAPID_KEY=your-vapid-key
```

### 3. Obtener credenciales de Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Ve a **Project Settings > General**
4. En la sección **Your apps**, haz clic en **Web app** (icono `</>`)
5. Registra tu app y copia las credenciales del `firebaseConfig`

### 4. Obtener VAPID key

1. En Firebase Console, ve a **Project Settings > Cloud Messaging**
2. En la sección **Web Push certificates**, genera un nuevo certificado
3. Copia la **Key pair** (VAPID key)
4. Pégala en `VITE_FIREBASE_VAPID_KEY`

### 5. Actualizar Service Worker

Edita el archivo `public/firebase-messaging-sw.js` y reemplaza el `firebaseConfig` vacío con tus credenciales:

```javascript
const firebaseConfig = {
  apiKey: 'your-api-key',
  authDomain: 'your-project.firebaseapp.com',
  projectId: 'your-project-id',
  storageBucket: 'your-project.appspot.com',
  messagingSenderId: 'your-sender-id',
  appId: 'your-app-id',
};
```

**Nota:** En un entorno de producción, estas credenciales deben inyectarse en tiempo de build, no hardcodeadas.

### 6. Probar localmente

1. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```

2. Ve a **Configuración > Dispositivos** en el portal de estudiantes

3. Haz clic en **Activar Notificaciones Push**

4. Acepta los permisos de notificación en tu navegador

5. Deberías ver tu dispositivo registrado en la lista

## Arquitectura

### Archivos creados

- **`src/config/firebase.ts`**: Configuración y funciones de Firebase
- **`src/features/notifications/hooks/usePushNotifications.ts`**: Hook para gestión de push
- **`public/firebase-messaging-sw.js`**: Service Worker para background notifications

### Flujo de registro

1. Usuario hace clic en "Activar Notificaciones Push"
2. `usePushNotifications` solicita permiso al navegador
3. Si se concede, obtiene el FCM token de Firebase
4. El hook llama a `notificationsStore.registerDevice()` con el token
5. El backend guarda el token en la tabla `user_devices`
6. El usuario recibe confirmación de registro exitoso

### Flujo de notificaciones

**Foreground (app abierta):**
1. Firebase recibe mensaje push
2. `onForegroundMessage` en el hook captura el mensaje
3. Se muestra un toast con `react-hot-toast`
4. Usuario puede hacer clic para navegar

**Background (app cerrada):**
1. Service Worker recibe el mensaje
2. `onBackgroundMessage` muestra notificación nativa del navegador
3. Usuario hace clic en notificación
4. App se abre/enfoca y navega a la URL especificada

## Testing

### Test manual

1. Usa la consola de Firebase Cloud Messaging para enviar un test message
2. En **Compose notification**, selecciona tu app web
3. Envía la notificación
4. Deberías recibirla en tu navegador

### Test desde backend

El backend puede enviar notificaciones usando el endpoint:

```typescript
POST /api/notifications/send-push
{
  "userId": "uuid",
  "title": "Test",
  "body": "This is a test notification",
  "data": {
    "action_url": "/achievements"
  }
}
```

## Troubleshooting

### "Push notifications no están configuradas"

- Verifica que todas las variables de entorno estén configuradas
- Revisa la consola del navegador para mensajes de error

### "Tu navegador no soporta notificaciones push"

- Usa un navegador compatible (Chrome, Firefox, Edge)
- Asegúrate de estar en HTTPS (localhost está exento)

### "Permiso de notificaciones denegado"

- Ve a la configuración del navegador
- Busca las notificaciones del sitio
- Cambia el permiso de "Bloqueado" a "Permitir"

### Service Worker no se registra

- Verifica que `firebase-messaging-sw.js` esté en `public/`
- El archivo debe servirse desde la raíz (`/firebase-messaging-sw.js`)
- Revisa la consola del navegador para errores de Service Worker

## Seguridad

### Variables de entorno

- **NUNCA** commitees archivos `.env` con credenciales reales
- Usa secretos de CI/CD para variables de producción
- El archivo `.env.example` debe tener valores vacíos

### VAPID key

- Es pública y puede exponerse en el frontend
- Se usa para identificar tu servidor ante Firebase
- No confundir con el Server Key (privado, solo backend)

### Device tokens

- Son sensibles y deben protegerse
- Se almacenan hasheados en la base de datos
- Se enmascaran en la API response (primeros 20 caracteres)

## Próximos pasos

- [ ] Configurar Firebase en el servidor de producción
- [ ] Implementar notificaciones desde backend (NestJS + FCM Admin SDK)
- [ ] Agregar preferencias de notificación por tipo
- [ ] Implementar batching de notificaciones
- [ ] Agregar analytics de engagement de notificaciones

## Referencias

- [Firebase Cloud Messaging Web](https://firebase.google.com/docs/cloud-messaging/js/client)
- [Service Workers API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Notifications API](https://developer.mozilla.org/en-US/docs/Web/API/Notifications_API)
