# Flujo Auth - Recuperacion de Password

**Version:** 1.0.0  
**Fecha:** 2026-02-17  
**Estado:** Activo

---

## Resumen

Flujo para solicitud de recuperacion, emision de token temporal y restablecimiento de contrasena desde pantalla de reset.

## Diagrama Mermaid

```mermaid
sequenceDiagram
    participant U as Usuario
    participant FE as FrontendAuth
    participant BE as AuthModule
    participant DB as Database
    participant EM as EmailService

    U->>FE: Solicita recuperar password
    FE->>BE: POST /auth/forgot-password
    BE->>DB: Genera token de reset
    BE->>EM: Envia email con enlace
    U->>FE: Abre enlace de reset
    FE->>BE: POST /auth/reset-password
    BE->>DB: Valida token y actualiza hash
    BE-->>FE: Password actualizada
    FE-->>U: Redireccion a login
```

## Componentes implicados

### Frontend
- `apps/frontend/src/pages/auth/ForgotPasswordPage.tsx`
- `apps/frontend/src/apps/student/pages/PasswordResetPage.tsx`

### Backend
- `apps/backend/src/modules/auth/services/password-recovery.service.ts`
- Endpoints: `/auth/forgot-password`, `/auth/reset-password`

### Datos
- `auth_management.password_reset_tokens`
- `auth.users`

## Reglas

- Token de reset con expiracion y un solo uso.
- No exponer si un correo existe o no en respuestas publicas.
- Invalidar tokens previos al completar reset.
