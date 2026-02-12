# NOTIF-001: Integración de Servicio de Email

**Fecha:** 2025-12-05
**Estado:** COMPLETADO (reporte historico — rutas legacy)
**Prioridad:** P1

## Resumen

Integración completa del servicio de email para notificaciones en GAMILIT. El sistema ahora soporta envío de emails a través de SMTP genérico o SendGrid con retry logic, templates HTML responsive y procesamiento asíncrono.

## Archivos Creados/Modificados

### Archivos Modificados

1. **`/apps/backend/src/modules/mail/mail.service.ts`** (REESCRITO)
   - Implementación completa con nodemailer
   - Soporte SMTP y SendGrid
   - Retry logic con backoff exponencial (3 intentos)
   - Métodos: `sendEmail()`, `sendNotificationEmail()`, `sendPasswordResetEmail()`, etc.
   - Verificación de disponibilidad con `isAvailable()`

2. **`/apps/backend/src/modules/notifications/services/notification-queue.service.ts`**
   - Agregado import de `MailService`
   - Inyección de `MailService` en constructor
   - Implementación completa de `sendToChannel('email')` (líneas 354-385)
   - Manejo de errores y validación de `userEmail`

3. **`/apps/backend/src/modules/notifications/notifications.module.ts`**
   - Agregado import de `MailModule`
   - `MailModule` agregado a imports array

4. **`/apps/backend/.env.production.example`**
   - Sección EMAIL (NOTIF-001) agregada con configuraciones SMTP y SendGrid
   - Documentación inline sobre prioridades y configuración

### Archivos Creados

5. **`/apps/backend/src/modules/mail/templates/base.template.ts`** (NUEVO)
   - Template HTML base responsive
   - Helpers: `baseEmailTemplate()`, `notificationTemplate()`, `featureBoxTemplate()`, `codeBoxTemplate()`
   - Estilos inline para compatibilidad con clientes de email

6. **`/apps/backend/src/modules/mail/templates/notification.templates.ts`** (NUEVO)
   - Templates específicos por tipo de notificación:
     - `achievementUnlockedTemplate()`
     - `assignmentDueTemplate()`
     - `assignmentReminderTemplate()`
     - `newMessageTemplate()`
     - `levelUpTemplate()`
     - `systemNotificationTemplate()`

7. **`/apps/backend/src/modules/mail/templates/index.ts`** (NUEVO)
   - Índice de exports de templates

8. **`/apps/backend/src/modules/mail/README.md`** (NUEVO)
   - Documentación completa del servicio
   - Guías de instalación y configuración
   - Ejemplos de uso
   - Troubleshooting

9. **`/apps/backend/NOTIF-001-EMAIL-INTEGRATION.md`** (ESTE ARCHIVO)

## Instalación

### 1. Instalar dependencias

```bash
cd /home/isem/workspace/projects/gamilit/apps/backend
npm install nodemailer
npm install --save-dev @types/nodemailer
```

### 2. Configurar variables de entorno

Editar `.env.production` (o crear desde `.env.production.example`):

#### Opción A: SMTP Genérico (Gmail, Outlook, etc.)

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=tu-email@gmail.com
SMTP_PASS=tu-app-password
SMTP_FROM=GAMILIT <notifications@gamilit.com>
FRONTEND_URL=http://localhost:3005
```

**Para Gmail:**
1. Ir a https://myaccount.google.com/apppasswords
2. Generar contraseña de aplicación
3. Usar esa contraseña en `SMTP_PASS`

#### Opción B: SendGrid (Recomendado para producción)

```env
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxx
SMTP_FROM=GAMILIT <notifications@gamilit.com>
FRONTEND_URL=https://gamilit.com
```

**Configurar SendGrid:**
1. Crear cuenta en https://sendgrid.com
2. Ir a Settings > API Keys
3. Crear API Key con permisos de "Mail Send"
4. Copiar el key

### 3. Reiniciar backend

```bash
npm run build
npm run prod
# O en desarrollo:
npm run dev
```

## Configuración de Prioridad

El servicio usa esta prioridad automáticamente:

1. ✅ Si `SENDGRID_API_KEY` está configurado → **usa SendGrid**
2. ✅ Si `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS` están configurados → **usa SMTP**
3. ⚠️ Si nada está configurado → **modo logging** (emails se loggean, no se envían)

## Uso

### Envío Automático (Sistema de Notificaciones)

```typescript
// El email se envía automáticamente si el canal 'email' está incluido
await notificationService.create({
  userId: 'user-uuid',
  type: 'assignment',
  title: 'Nueva tarea asignada',
  message: 'Tienes una nueva tarea de Matemáticas',
  channels: ['in_app', 'email', 'push'],
  data: {
    userEmail: 'student@example.com',  // REQUERIDO para emails
    actionUrl: 'https://gamilit.com/assignments/123',
    actionText: 'Ver tarea'
  }
});
```

### Uso Directo

```typescript
import { MailService } from '@/modules/mail/mail.service';

@Injectable()
export class MiServicio {
  constructor(private readonly mailService: MailService) {}

  async enviarEmail() {
    // Verificar disponibilidad
    if (!this.mailService.isAvailable()) {
      console.log('Email service no configurado');
      return;
    }

    // Email genérico
    await this.mailService.sendEmail(
      'user@example.com',
      'Asunto',
      '<h1>Contenido HTML</h1>'
    );

    // Email de notificación con template
    await this.mailService.sendNotificationEmail(
      'user@example.com',
      'Título',
      'Mensaje',
      'https://gamilit.com/link',
      'Ver más'
    );
  }
}
```

## Templates Disponibles

```typescript
import {
  achievementUnlockedTemplate,
  assignmentDueTemplate,
  assignmentReminderTemplate,
  newMessageTemplate,
  levelUpTemplate,
  systemNotificationTemplate
} from '@/modules/mail/templates';
```

Ver `/apps/backend/src/modules/mail/README.md` para ejemplos completos.

## Características Implementadas

✅ **SMTP Genérico** - Soporta Gmail, Outlook, servidores propios
✅ **SendGrid** - Integración via API Key (SMTP relay)
✅ **Retry Logic** - 3 intentos con backoff exponencial (1s, 3s, 9s)
✅ **Templates HTML** - Responsive con estilos inline
✅ **Graceful Degradation** - Si no hay config, loggea en lugar de fallar
✅ **Integración Automática** - Con NotificationQueueService
✅ **Procesamiento Asíncrono** - Cola con reintentos
✅ **Logging Completo** - Todos los envíos se registran
✅ **Templates Específicos** - Por tipo de notificación

## Testing

### Sin configuración (modo logging)

Los emails se loggearán en consola:

```
[MailService] Email service initialized with SMTP
[MailService] [MOCK EMAIL] To: user@example.com | Subject: Nueva tarea
```

### Con configuración SMTP/SendGrid

```
[MailService] Email service initialized with SendGrid
[MailService] Email sent successfully to user@example.com: <message-id>
```

### Testing con servicio temporal

Servicios recomendados para testing:
- [Mailtrap](https://mailtrap.io/) - SMTP de testing
- [Ethereal Email](https://ethereal.email/) - SMTP temporal

## Datos Requeridos

Para envío de emails, la notificación DEBE incluir en `data`:

```typescript
{
  data: {
    userEmail: 'user@example.com',  // ⚠️ REQUERIDO
    actionUrl: 'https://...',        // Opcional
    actionText: 'Ver más'            // Opcional
  }
}
```

## Flujo de Procesamiento

```
1. Crear notificación con canal 'email'
   ↓
2. NotificationService la guarda en DB
   ↓
3. NotificationService encola en NotificationQueue
   ↓
4. Worker (cron) procesa cola periódicamente
   ↓
5. NotificationQueueService.sendToChannel('email')
   ↓
6. MailService.sendNotificationEmail() con retry
   ↓
7. Resultado se registra en notification_logs
```

## Verificación

### 1. Verificar instalación de dependencias

```bash
npm list nodemailer
```

Debe mostrar: `nodemailer@X.X.X`

### 2. Verificar configuración

Al iniciar el backend, debe aparecer uno de estos logs:

```
[MailService] Email service initialized with SendGrid
[MailService] Email service initialized with SMTP
[MailService] SMTP credentials not configured. Emails will be logged only.
```

### 3. Probar envío

Crear una notificación con canal email desde el frontend o API.

## Solución de Problemas

### Emails no se envían

1. ✅ Verificar variables de entorno configuradas
2. ✅ Revisar logs: `[MailService]`
3. ✅ Verificar que `notification.data.userEmail` existe
4. ✅ Verificar credenciales SMTP/SendGrid

### Error: "Invalid login"

- Gmail: Usar App Password, no contraseña normal
- Verificar `SMTP_USER` y `SMTP_PASS`

### Emails van a spam

- Configurar SPF, DKIM, DMARC en dominio
- Usar servicio profesional (SendGrid)
- Verificar dominio del remitente

## Seguridad

⚠️ **IMPORTANTE:**

- NO hardcodear credenciales en código
- Usar variables de entorno
- En producción: `chmod 600 .env.production`
- Rotar API keys periódicamente
- Usar SendGrid en producción (más confiable)

## Próximos Pasos

### Configuración Inmediata

1. ✅ Instalar nodemailer: `npm install nodemailer @types/nodemailer`
2. ✅ Configurar variables de entorno (SMTP o SendGrid)
3. ✅ Reiniciar backend
4. ✅ Probar enviando una notificación

### Mejoras Futuras (Opcional)

- [ ] Soporte para attachments
- [ ] Templates con Handlebars/Pug
- [ ] Internacionalización (i18n)
- [ ] Rate limiting por destinatario
- [ ] Dashboard de analytics
- [ ] Testing automatizado con Jest

## Referencias

- **Documentación completa:** `/apps/backend/src/modules/mail/README.md`
- **Templates:** `/apps/backend/src/modules/mail/templates/`
- **Variables de entorno:** `/apps/backend/.env.production.example`

## Contacto

Para soporte o preguntas, contactar al equipo de desarrollo Backend.

---

**Estado:** ✅ COMPLETADO
**Última actualización:** 2025-12-05
