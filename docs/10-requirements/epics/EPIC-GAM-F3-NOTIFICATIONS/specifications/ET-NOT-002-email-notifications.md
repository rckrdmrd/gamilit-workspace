---
titulo: "ET-NOT-002: Email Notifications"
tipo: especificacion-tecnica
fecha_creacion: "2025-10-01"
ultima_actualizacion: "2026-02-28"
estado: activo
---

# ET-NOT-002: Email Notifications

## Metadata

| Campo | Valor |
|-------|-------|
| **ID** | ET-NOT-002 |
| **Modulo** | Notificaciones |
| **Tipo** | Especificacion Tecnica |
| **Estado** | Implementado |
| **Completitud** | 85% |
| **Version** | 1.0 |
| **Fecha Creacion** | 2026-01-27 |
| **Ultima Actualizacion** | 2026-01-27 |
| **Autor** | Architecture Analyst |

---

## Referencias

### Requerimiento Funcional
- RF-NOT-002: Email Notification System

### User Stories
- US-NOT-001b: Notification Center

---

## Descripcion Funcional

Sistema de notificaciones por email:
- Templates personalizables
- Envio via SendGrid/Nodemailer
- Cola de procesamiento asincrono
- Tracking de entregas
- Preferencias de frecuencia

---

## Arquitectura

### Diagrama de Componentes

```
+----------------------------------------------------------+
|                   BACKEND (NestJS)                        |
|  - MailService                                           |
|  - NotificationQueueService                              |
|  - NotificationTemplateService                           |
+-----------------------------+----------------------------+
                              |
+-----------------------------v----------------------------+
|               NOTIFICATION QUEUE                          |
|  - BullMQ                                                |
|  - Redis                                                 |
+-----------------------------+----------------------------+
                              |
+-----------------------------v----------------------------+
|               EMAIL PROVIDER                              |
|  - SendGrid API                                          |
|  - Nodemailer (fallback)                                 |
+----------------------------------------------------------+
```

---

## Implementacion Existente

### Backend - MailService

**Ubicacion:** `apps/backend/src/modules/mail/mail.service.ts`

**Estado:** COMPLETO (100%)

```typescript
@Injectable()
export class MailService {
  private transporter: Transporter;

  constructor(private readonly configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get('SMTP_HOST'),
      port: this.configService.get('SMTP_PORT'),
      secure: true,
      auth: {
        user: this.configService.get('SMTP_USER'),
        pass: this.configService.get('SMTP_PASS'),
      },
    });
  }

  /**
   * Envia email usando template
   */
  async sendTemplatedEmail(
    to: string,
    templateName: string,
    context: Record<string, unknown>
  ): Promise<SentMessageInfo>;

  /**
   * Envia email simple
   */
  async sendEmail(options: SendMailOptions): Promise<SentMessageInfo>;

  /**
   * Email de bienvenida
   */
  async sendWelcomeEmail(user: User): Promise<void>;

  /**
   * Email de reset de password
   */
  async sendPasswordResetEmail(user: User, token: string): Promise<void>;

  /**
   * Email de verificacion
   */
  async sendVerificationEmail(user: User, code: string): Promise<void>;
}
```

### Backend - Email Templates

**Ubicacion:** `apps/backend/src/modules/mail/templates/`

**Estado:** COMPLETO (100%)

| Template | Uso |
|----------|-----|
| welcome.hbs | Bienvenida a nuevos usuarios |
| password-reset.hbs | Recuperacion de password |
| verification.hbs | Verificacion de email |
| notification.hbs | Notificaciones generales |
| achievement.hbs | Logros desbloqueados |
| weekly-summary.hbs | Resumen semanal |

### Backend - NotificationTemplateService

**Ubicacion:** `apps/backend/src/modules/notifications/services/notification-template.service.ts`

**Estado:** COMPLETO (100%)

```typescript
@Injectable()
export class NotificationTemplateService {
  /**
   * Obtiene template por nombre
   */
  async findByName(name: string): Promise<NotificationTemplate>;

  /**
   * Renderiza template con contexto
   */
  async render(
    templateName: string,
    context: Record<string, unknown>
  ): Promise<RenderedTemplate>;

  /**
   * Lista templates disponibles
   */
  async findAll(type?: string): Promise<NotificationTemplate[]>;

  /**
   * Crea/actualiza template
   */
  async upsert(data: CreateTemplateDto): Promise<NotificationTemplate>;
}
```

### Backend - NotificationQueueService

**Ubicacion:** `apps/backend/src/modules/notifications/services/notification-queue.service.ts`

**Estado:** COMPLETO (100%)

```typescript
@Injectable()
export class NotificationQueueService {
  constructor(
    @InjectQueue('notifications')
    private readonly notificationQueue: Queue,
  ) {}

  /**
   * Encola notificacion para envio
   */
  async enqueue(notification: QueuedNotification): Promise<Job>;

  /**
   * Procesa notificacion (worker)
   */
  @Process('send-email')
  async processEmail(job: Job<EmailNotification>): Promise<void>;

  /**
   * Obtiene estado de cola
   */
  async getQueueStats(): Promise<QueueStats>;
}
```

### Database - Notification Templates

**Ubicacion:** `apps/database/ddl/schemas/communication/tables/02-notification_templates.sql`

**Estado:** COMPLETO (100%)

```sql
CREATE TABLE communication.notification_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL, -- 'email', 'push', 'in_app', 'sms'
  subject TEXT, -- Solo para email
  body_template TEXT NOT NULL, -- Handlebars template
  html_template TEXT, -- HTML version para email
  variables JSONB NOT NULL DEFAULT '[]', -- Variables requeridas
  is_system BOOLEAN NOT NULL DEFAULT FALSE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notification_templates_name ON communication.notification_templates(name);
CREATE INDEX idx_notification_templates_type ON communication.notification_templates(type);
```

---

## Templates de Email

### Base Template

```handlebars
{{! templates/base.hbs }}
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #F97316; color: white; padding: 20px; text-align: center; }
    .content { padding: 30px; background: #ffffff; }
    .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
    .button { display: inline-block; padding: 12px 24px; background: #F97316; color: white; text-decoration: none; border-radius: 6px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="{{branding.logoUrl}}" alt="{{branding.platformName}}" height="40" />
    </div>
    <div class="content">
      {{> @partial-block }}
    </div>
    <div class="footer">
      <p>{{branding.platformName}}</p>
      <p><a href="{{unsubscribeUrl}}">Cambiar preferencias de email</a></p>
    </div>
  </div>
</body>
</html>
```

### Achievement Template

```handlebars
{{! templates/achievement.hbs }}
{{#> base}}
  <h2>Has desbloqueado un logro</h2>

  <div style="text-align: center; padding: 20px;">
    <img src="{{achievement.iconUrl}}" alt="{{achievement.name}}" width="100" />
    <h3>{{achievement.name}}</h3>
    <p>{{achievement.description}}</p>
  </div>

  <div style="text-align: center;">
    <a href="{{viewAchievementUrl}}" class="button">Ver mi logro</a>
  </div>

  <p style="margin-top: 20px;">
    Sigue asi, {{user.displayName}}. Vas muy bien en tu camino de aprendizaje.
  </p>
{{/base}}
```

---

## Lo que Falta para Completar (15%)

### 1. Email Analytics (10%)

```typescript
// services/email-analytics.service.ts (NUEVO)
@Injectable()
export class EmailAnalyticsService {
  /**
   * Registra apertura de email
   */
  async trackOpen(notificationId: string): Promise<void>;

  /**
   * Registra click en link
   */
  async trackClick(notificationId: string, linkId: string): Promise<void>;

  /**
   * Obtiene estadisticas de campana
   */
  async getCampaignStats(campaignId: string): Promise<EmailStats>;
}

interface EmailStats {
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  bounced: number;
  unsubscribed: number;
  openRate: number;
  clickRate: number;
}
```

### 2. Bounce Handling (5%)

```typescript
// webhooks/sendgrid.webhook.ts (NUEVO)
@Controller('webhooks/sendgrid')
export class SendGridWebhookController {
  /**
   * Procesa eventos de SendGrid
   */
  @Post()
  async handleEvent(@Body() events: SendGridEvent[]): Promise<void> {
    for (const event of events) {
      switch (event.event) {
        case 'bounce':
          await this.handleBounce(event);
          break;
        case 'dropped':
          await this.handleDropped(event);
          break;
        case 'unsubscribe':
          await this.handleUnsubscribe(event);
          break;
      }
    }
  }
}
```

---

## Tipos de Email

| Tipo | Trigger | Template |
|------|---------|----------|
| Welcome | Registro | welcome.hbs |
| Password Reset | Solicitud reset | password-reset.hbs |
| Verification | Registro/Cambio email | verification.hbs |
| Achievement | Logro desbloqueado | achievement.hbs |
| Level Up | Subir de nivel | level-up.hbs |
| Weekly Summary | Cron semanal | weekly-summary.hbs |
| Parent Report | Cron semanal | parent-weekly-report.hbs |

---

## API REST Endpoints

| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| GET | `/notifications/templates` | Listar templates |
| GET | `/notifications/templates/:name` | Obtener template |
| POST | `/notifications/templates` | Crear template (admin) |
| PUT | `/notifications/templates/:name` | Actualizar template |
| POST | `/notifications/send-from-template` | Enviar notificacion |
| GET | `/notifications/email-logs` | Historial de envios |

---

## Criterios de Aceptacion

### Funcionales
- [x] Templates en Handlebars
- [x] Envio via Nodemailer/SendGrid
- [x] Cola de procesamiento
- [x] Templates para tipos principales
- [ ] Tracking de apertura/clicks
- [ ] Manejo de bounces
- [ ] A/B testing

### No Funcionales
- [x] Emails responsive
- [x] Retry en fallos
- [x] Rate limiting
- [ ] Analytics dashboard

---

## Dependencias

### Bloqueado Por
- SMTP Configuration (COMPLETO)
- Notification Queue (COMPLETO)

### Bloquea
- Parent Weekly Reports
- Marketing Campaigns
- Transactional Analytics

---

## Estimacion de Esfuerzo Restante

| Componente | Horas Estimadas |
|------------|-----------------|
| Email Analytics | 5h |
| Bounce Handling | 3h |
| SendGrid Webhooks | 3h |
| A/B Testing | 4h |
| Tests | 2h |
| **Total** | **17h** |

---

## Historial de Cambios

| Version | Fecha | Autor | Cambios |
|---------|-------|-------|---------|
| 1.0 | 2026-01-27 | Architecture Analyst | Creacion inicial |

---

*Documento: ET-NOT-002-email-notifications.md*
*Generado: 2026-01-27*
