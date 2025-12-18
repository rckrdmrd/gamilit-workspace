# Email Service - GAMILIT

Servicio de envío de emails para notificaciones del sistema.

## Características

- Soporte para SMTP genérico (Gmail, Outlook, servidor propio)
- Soporte para SendGrid via API Key
- Retry logic con backoff exponencial (3 intentos)
- Templates HTML responsive con estilos inline
- Fallback a modo logging si no hay configuración
- Integración completa con sistema de notificaciones multi-canal

## Instalación

### 1. Instalar dependencias

```bash
npm install nodemailer
npm install --save-dev @types/nodemailer
```

### 2. Configurar variables de entorno

#### Opción A: SMTP Genérico

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

**Para Outlook/Hotmail:**
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=tu-email@outlook.com
SMTP_PASS=tu-password
```

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
4. Copiar el key a `SENDGRID_API_KEY`

### 3. Configuración de prioridad

El servicio usa esta prioridad:
1. Si `SENDGRID_API_KEY` está configurado → usa SendGrid
2. Si `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS` están configurados → usa SMTP
3. Si nada está configurado → modo logging (emails se loggean pero no se envían)

## Uso

### Desde NotificationQueueService (Automático)

El servicio se integra automáticamente con el sistema de notificaciones:

```typescript
// Crear notificación con canal email
await notificationService.create({
  userId: 'user-uuid',
  type: 'assignment',
  title: 'Nueva tarea asignada',
  message: 'Tienes una nueva tarea de Matemáticas',
  channels: ['in_app', 'email'], // Se enviará por email automáticamente
  data: {
    userEmail: 'student@example.com', // REQUERIDO para emails
    actionUrl: 'https://gamilit.com/assignments/123',
    actionText: 'Ver tarea'
  }
});
```

### Uso directo del MailService

```typescript
import { MailService } from '@/modules/mail/mail.service';

@Injectable()
export class MiServicio {
  constructor(private readonly mailService: MailService) {}

  async enviarEmail() {
    // Email genérico
    await this.mailService.sendEmail(
      'user@example.com',
      'Asunto del email',
      '<h1>Contenido HTML</h1>',
      'Contenido texto plano' // opcional
    );

    // Email de notificación con template
    await this.mailService.sendNotificationEmail(
      'user@example.com',
      'Título de la notificación',
      'Mensaje de la notificación',
      'https://gamilit.com/link', // URL opcional
      'Ver más' // Texto del botón opcional
    );

    // Email de bienvenida
    await this.mailService.sendWelcomeEmail(
      'newuser@example.com',
      'Juan Pérez',
      'student'
    );

    // Email de verificación
    await this.mailService.sendVerificationEmail(
      'user@example.com',
      'verification-token-123',
      'Juan Pérez'
    );

    // Email de reset password
    await this.mailService.sendPasswordResetEmail(
      'user@example.com',
      'reset-token-123',
      'Juan Pérez'
    );
  }
}
```

## Templates Personalizados

Los templates están en `/templates`:

- `base.template.ts` - Template HTML base
- `notification.templates.ts` - Templates específicos por tipo de notificación

### Usar templates personalizados

```typescript
import {
  achievementUnlockedTemplate,
  assignmentDueTemplate,
  levelUpTemplate
} from '@/modules/mail/templates';

// Logro desbloqueado
const html = achievementUnlockedTemplate({
  userName: 'Juan',
  achievementName: 'Maestro de Matemáticas',
  achievementDescription: 'Completaste 10 tareas de matemáticas',
  achievementIcon: '🏆',
  xpEarned: 100,
  coinsEarned: 50,
  dashboardUrl: 'https://gamilit.com/dashboard'
});

await mailService.sendEmail('user@example.com', 'Logro Desbloqueado!', html);
```

### Crear template personalizado

```typescript
import { baseEmailTemplate } from '@/modules/mail/templates';

const miTemplate = (data: { nombre: string; mensaje: string }) => {
  const content = `
    <p>Hola <strong>${data.nombre}</strong>,</p>
    <p>${data.mensaje}</p>
  `;

  return baseEmailTemplate({
    title: 'Mi Título',
    content,
    actionUrl: 'https://gamilit.com',
    actionText: 'Ver más'
  });
};
```

## Integración con Cola de Notificaciones

El servicio se integra automáticamente con `NotificationQueueService` para:

1. **Procesamiento asíncrono**: Emails se encolan y procesan en background
2. **Retry automático**: Si falla, se reintenta con backoff exponencial
3. **Logging**: Todos los envíos se registran en `notification_logs`

### Flujo de procesamiento

```
1. Crear notificación con canal 'email'
   ↓
2. NotificationService encola en NotificationQueue
   ↓
3. Worker (cron) procesa cola periódicamente
   ↓
4. NotificationQueueService llama a MailService.sendNotificationEmail()
   ↓
5. MailService envía email (con retry si falla)
   ↓
6. Resultado se registra en notification_logs
```

## Datos requeridos en notification.data

Para que el email se envíe correctamente, la notificación DEBE incluir:

```typescript
{
  data: {
    userEmail: 'user@example.com',  // REQUERIDO
    actionUrl: 'https://...',        // Opcional
    actionText: 'Ver más'            // Opcional
  }
}
```

Si `userEmail` no está presente, el email no se enviará y se loggeará un error.

## Verificar estado del servicio

```typescript
if (mailService.isAvailable()) {
  console.log('Email service está configurado y listo');
} else {
  console.log('Email service NO configurado (modo logging)');
}
```

## Testing en desarrollo

Sin configurar SMTP, los emails se loggean en consola:

```
[MailService] [MOCK EMAIL] To: user@example.com | Subject: Nueva tarea
[MailService] Email content preview: <!DOCTYPE html>...
```

Para testing real, usar servicios como:
- [Mailtrap](https://mailtrap.io/) - SMTP de testing
- [Ethereal Email](https://ethereal.email/) - SMTP temporal
- Gmail con App Password

## Solución de problemas

### Emails no se envían

1. Verificar variables de entorno configuradas
2. Revisar logs: `[MailService]`
3. Verificar que `notification.data.userEmail` existe
4. Verificar credenciales SMTP/SendGrid

### Error: "Invalid login"

- Gmail: Usar App Password, no contraseña normal
- Verificar `SMTP_USER` y `SMTP_PASS`

### Emails van a spam

- Configurar SPF, DKIM, DMARC en dominio
- Usar servicio profesional (SendGrid)
- Verificar dominio del remitente

### Timeout al enviar

- Verificar firewall permite puerto 587/465
- Aumentar timeout si red es lenta
- Usar SendGrid en lugar de SMTP

## Seguridad

- **NO hardcodear credenciales** en código
- Usar variables de entorno
- En producción: permisos `.env` restrictivos (`chmod 600`)
- Rotar API keys periódicamente
- Usar SendGrid en producción (más confiable que SMTP)

## Monitoreo

Logs importantes:

```
[MailService] Email service initialized with SendGrid
[MailService] Email sent successfully to user@example.com: <message-id>
[MailService] Email send attempt 1/3 failed: Connection timeout
[MailService] Failed to send email after 3 attempts
```

## API Reference

### MailService

#### `isAvailable(): boolean`
Verifica si el servicio está configurado y listo.

#### `sendEmail(to, subject, html, text?): Promise<boolean>`
Envía email genérico con retry logic.

#### `sendNotificationEmail(to, title, message, actionUrl?, actionText?): Promise<boolean>`
Envía email de notificación con template genérico.

#### `sendPasswordResetEmail(email, token, userName?): Promise<void>`
Envía email de recuperación de contraseña.

#### `sendVerificationEmail(email, token, userName?): Promise<void>`
Envía email de verificación de cuenta.

#### `sendWelcomeEmail(email, userName, role): Promise<void>`
Envía email de bienvenida al registrarse.

## Roadmap

- [ ] Soporte para attachments
- [ ] Templates con Handlebars/Pug
- [ ] Internacionalización (i18n)
- [ ] Rate limiting por destinatario
- [ ] Dashboard de analytics
- [ ] Testing con Jest

## Soporte

Para issues o preguntas, contactar al equipo de desarrollo.
