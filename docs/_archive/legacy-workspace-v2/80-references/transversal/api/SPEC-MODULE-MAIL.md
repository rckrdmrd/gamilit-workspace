# Especificacion Tecnica: Modulo Mail

**Modulo:** `apps/backend/src/modules/mail/`
**Fecha creacion:** 2026-01-06
**Estado:** Implementado
**Version:** 1.0

---

## Descripcion General

Modulo de envio de emails usando Nodemailer. Proporciona servicios de correo electronico para notificaciones, recuperacion de contrasena, verificacion de email y bienvenida a usuarios.

---

## Arquitectura

```
modules/mail/
├── mail.module.ts           # Modulo NestJS
├── mail.service.ts          # Servicio principal (416 lineas)
└── templates/
    ├── base.template.ts     # Template base HTML
    ├── notification.templates.ts  # Templates de notificacion
    └── index.ts             # Exports
```

---

## Dependencias

| Dependencia | Version | Uso |
|-------------|---------|-----|
| nodemailer | ^6.x | Transporte de emails |
| @nestjs/config | ^3.x | Variables de entorno |

---

## Configuracion

### Variables de Entorno

| Variable | Requerido | Default | Descripcion |
|----------|-----------|---------|-------------|
| `SENDGRID_API_KEY` | No | - | API Key de SendGrid (prioridad sobre SMTP) |
| `SMTP_HOST` | Condicional | - | Host del servidor SMTP |
| `SMTP_PORT` | No | 587 | Puerto SMTP |
| `SMTP_USER` | Condicional | - | Usuario SMTP |
| `SMTP_PASS` | Condicional | - | Password SMTP |
| `SMTP_SECURE` | No | false | Usar TLS |
| `SMTP_FROM` | No | `GAMILIT <notifications@gamilit.com>` | Remitente |
| `FRONTEND_URL` | No | `http://localhost:3005` | URL para links en emails |

> **Nota:** Si no se configura SMTP ni SendGrid, los emails se loggean en consola (modo desarrollo).

---

## API del Servicio

### MailService

#### Metodos Publicos

| Metodo | Parametros | Retorno | Descripcion |
|--------|------------|---------|-------------|
| `isAvailable()` | - | `boolean` | Verificar si el servicio esta configurado |
| `sendEmail()` | `to, subject, html, text?` | `Promise<boolean>` | Enviar email generico |
| `sendNotificationEmail()` | `to, title, message, actionUrl?, actionText?` | `Promise<boolean>` | Enviar notificacion |
| `sendPasswordResetEmail()` | `email, token, userName?` | `Promise<void>` | Email de recuperacion de contrasena |
| `sendVerificationEmail()` | `email, token, userName?` | `Promise<void>` | Email de verificacion de cuenta |
| `sendWelcomeEmail()` | `email, userName, role` | `Promise<void>` | Email de bienvenida |

---

## Tipos de Email Soportados

### 1. Password Reset
- **Template:** Inline HTML con estilos
- **Expiracion:** 1 hora
- **URL:** `{FRONTEND_URL}/reset-password/{token}`

### 2. Email Verification
- **Template:** Inline HTML con estilos
- **Expiracion:** 24 horas
- **URL:** `{FRONTEND_URL}/verify-email/{token}`

### 3. Welcome Email
- **Template:** Inline HTML con estilos
- **Contenido:** Informacion de onboarding (modulos, rangos Maya, ML Coins)

### 4. Notificaciones Genericas
- **Template:** Configurable via parametros
- **Uso:** Sistema de notificaciones multicanal

---

## Caracteristicas Tecnicas

### Retry Logic
- **Intentos:** 3 maximo
- **Backoff:** Exponencial (1s, 3s, 9s)
- **Logging:** Errores y exitos registrados

### Fallback Mode
- Si no hay configuracion SMTP/SendGrid
- Los emails se loggean en consola
- `isAvailable()` retorna `false`

### Templates
- HTML con estilos inline
- Diseño responsive
- Gradiente de marca: `#667eea` a `#764ba2`

---

## Uso en Otros Modulos

### Importar MailModule

```typescript
// En cualquier modulo que necesite enviar emails
import { Module } from '@nestjs/common';
import { MailModule } from '@/modules/mail/mail.module';

@Module({
  imports: [MailModule],
  // ...
})
export class MyModule {}
```

### Inyectar MailService

```typescript
import { Injectable } from '@nestjs/common';
import { MailService } from '@/modules/mail/mail.service';

@Injectable()
export class MyService {
  constructor(private readonly mailService: MailService) {}

  async notifyUser(email: string, message: string) {
    if (this.mailService.isAvailable()) {
      await this.mailService.sendNotificationEmail(
        email,
        'Notificacion',
        message,
        'https://gamilit.com/dashboard',
        'Ver Dashboard'
      );
    }
  }
}
```

---

## Modulos que Consumen MailService

| Modulo | Uso |
|--------|-----|
| `auth` | Password reset, email verification |
| `notifications` | Notificaciones multicanal (email channel) |
| `users` | Welcome email en registro |

---

## Testing

### Modo Mock (Sin SMTP)
- No requiere configuracion
- Emails se loggean en consola
- Util para desarrollo local

### Testing Unitario
- Mockear `MailService` en tests
- Verificar llamadas a metodos

---

## Seguridad

| Aspecto | Implementacion |
|---------|----------------|
| Credenciales | Variables de entorno, no hardcoded |
| Tokens | Generados por modulo auth, no por mail |
| Logging | No loggea contenido sensible (solo subject y destinatario) |

---

## Metricas

| Metrica | Valor |
|---------|-------|
| Lineas de codigo | ~416 |
| Metodos publicos | 5 |
| Templates | 4 tipos |
| Configuracion | 8 variables de entorno |

---

## Referencias

- **ISSUE:** NOTIF-001 - Integracion Email Service
- **Sprint:** Sprint 0 - Dia 2 (2025-12-05)
- **Codigo:** `apps/backend/src/modules/mail/`

---

*Especificacion generada automaticamente - 2026-01-06*
