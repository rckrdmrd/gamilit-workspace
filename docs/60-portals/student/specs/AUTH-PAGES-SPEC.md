# AUTH-PAGES-SPEC: Especificacion de Paginas de Autenticacion

**Documento:** Especificacion Tecnica de Paginas de Autenticacion del Student Portal
**Version:** 1.0.0
**Fecha:** 2026-01-20
**Estado:** Documentado
**Agente:** Documentation-Agent + Frontend-Agent

---

## Indice

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [EmailVerificationPage](#1-emailverificationpage)
3. [PasswordRecoveryPage](#2-passwordrecoverypage)
4. [PasswordResetPage](#3-passwordresetpage)
5. [TwoFactorAuthPage](#4-twofactorauthpage)
6. [APIs y Endpoints](#apis-y-endpoints)
7. [Schemas de Validacion](#schemas-de-validacion)
8. [Dependencias Compartidas](#dependencias-compartidas)

---

## Resumen Ejecutivo

Este documento especifica las 4 paginas de autenticacion del Student Portal que complementan el flujo principal de login/registro:

| Pagina | Ruta | Estado | Integracion Backend |
|--------|------|--------|---------------------|
| EmailVerificationPage | `/verify-email` | DEPRECATED | No requerida |
| PasswordRecoveryPage | `/password-recovery` | Activa | API Real |
| PasswordResetPage | `/reset-password` | Activa | API Real |
| TwoFactorAuthPage | `/two-factor` | Mock | Mock Functions |

### Rutas de Archivos

```
apps/frontend/src/apps/student/pages/
├── EmailVerificationPage.tsx    # DEPRECATED - Solo informativo
├── PasswordRecoveryPage.tsx     # Solicitar reset de password
├── PasswordResetPage.tsx        # Resetear password con token
└── TwoFactorAuthPage.tsx        # Verificacion 2FA (Mock)
```

---

## 1. EmailVerificationPage

### 1.1 Descripcion y Proposito

**Archivo:** `apps/frontend/src/apps/student/pages/EmailVerificationPage.tsx`

**Estado:** `DEPRECATED` desde 2025-10

**Proposito Original:** Verificar el email del usuario mediante un token enviado por correo.

**Proposito Actual:** Mostrar mensaje informativo indicando que la verificacion de email ya no es requerida. La pagina se mantiene por compatibilidad con enlaces antiguos que usuarios podrian tener guardados.

### 1.2 Componentes Utilizados

| Componente | Origen | Proposito |
|------------|--------|-----------|
| `DetectiveButton` | `@shared/components/base/DetectiveButton` | Boton estilizado tema Detective |
| `DetectiveCard` | `@shared/components/base/DetectiveCard` | Contenedor card tema Detective |
| `motion` | `framer-motion` | Animaciones de entrada |
| `Target` | `lucide-react` | Icono logo GAMILIT |
| `CheckCircle2` | `lucide-react` | Icono de verificacion exitosa |
| `Info` | `lucide-react` | Icono de informacion |

### 1.3 Hooks Consumidos

| Hook | Origen | Uso |
|------|--------|-----|
| `useNavigate` | `react-router-dom` | Navegacion a `/login` y `/dashboard` |

### 1.4 APIs/Endpoints Llamados

**Ninguno.** Esta pagina no realiza llamadas a APIs ya que la funcionalidad esta deprecada.

### 1.5 Flujo de Usuario

```
Usuario llega a /verify-email (desde email antiguo)
         │
         ▼
    ┌─────────────────────────────────────┐
    │  Ve mensaje: "Verificacion No       │
    │  Requerida - Todas las cuentas      │
    │  estan automaticamente verificadas" │
    └─────────────────────────────────────┘
         │
         ├──► Clic "Ir al Login" ──► /login
         │
         └──► Clic "Ir al Dashboard" ──► /dashboard
```

### 1.6 Validaciones Implementadas

**Ninguna.** La pagina es puramente informativa.

### 1.7 Estados de Error Manejados

**Ninguno.** No hay errores posibles ya que no se ejecuta logica de negocio.

### 1.8 Dependencias

```typescript
// Dependencias externas
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Target, CheckCircle2, Info } from 'lucide-react';

// Dependencias internas
import { DetectiveButton } from '@shared/components/base/DetectiveButton';
import { DetectiveCard } from '@shared/components/base/DetectiveCard';
```

### 1.9 Notas de Deprecacion

```typescript
/**
 * @deprecated Since 2025-10 - Email verification disabled
 *
 * Razon: Todas las cuentas se verifican automaticamente al registrarse.
 *
 * Esta pagina se mantiene para:
 * - Compatibilidad con enlaces antiguos en emails
 * - Evitar errores 404 en bookmarks de usuarios
 *
 * Codigo legacy preservado en comentarios al final del archivo.
 */
```

---

## 2. PasswordRecoveryPage

### 2.1 Descripcion y Proposito

**Archivo:** `apps/frontend/src/apps/student/pages/PasswordRecoveryPage.tsx`

**Estado:** Activa - Integracion con API Real

**Proposito:** Permitir a los usuarios solicitar un enlace de recuperacion de password enviado a su email. Es el primer paso del flujo de recuperacion de password.

### 2.2 Componentes Utilizados

| Componente | Origen | Proposito |
|------------|--------|-----------|
| `DetectiveButton` | `@shared/components/base/DetectiveButton` | Boton de submit con estados loading |
| `DetectiveCard` | `@shared/components/base/DetectiveCard` | Contenedor del formulario |
| `EmailInput` | `@features/auth/components/EmailInput` | Input de email con validacion visual |
| `FormErrorDisplay` | `@features/auth/components/FormErrorDisplay` | Mostrar errores del servidor |
| `motion` | `framer-motion` | Animaciones de transicion |
| `Target`, `Mail`, `ArrowLeft`, `CheckCircle2` | `lucide-react` | Iconografia |

### 2.3 Hooks Consumidos

| Hook | Origen | Uso |
|------|--------|-----|
| `useState` | `react` | Estados: `loading`, `serverError`, `emailSent` |
| `useNavigate` | `react-router-dom` | Navegacion a `/login` |
| `useForm` | `react-hook-form` | Gestion de formulario con validacion |
| `zodResolver` | `@hookform/resolvers/zod` | Integracion Zod con react-hook-form |

### 2.4 APIs/Endpoints Llamados

| Endpoint | Metodo | Descripcion | Response |
|----------|--------|-------------|----------|
| `POST /auth/reset-password/request` | `passwordAPI.requestPasswordReset(email)` | Solicita envio de email con link de reset | `{ message: string }` |

**Archivo API:** `apps/frontend/src/services/api/passwordAPI.ts`

**Backend Handler:** `apps/backend/src/modules/auth/controllers/password.controller.ts` - `requestPasswordReset()`

### 2.5 Flujo de Usuario

```
Usuario en /password-recovery
         │
         ▼
    ┌─────────────────────────────────────┐
    │  Formulario con campo email          │
    │  Info: "Link valido por 15 minutos"  │
    └─────────────────────────────────────┘
         │
         │ Usuario ingresa email y submit
         ▼
    ┌─────────────────────────────────────┐
    │  Validacion Zod (email formato)      │
    │  Si invalido: mostrar error inline   │
    └─────────────────────────────────────┘
         │ Si valido
         ▼
    ┌─────────────────────────────────────┐
    │  setLoading(true)                    │
    │  Boton: "Enviando..."                │
    │  passwordAPI.requestPasswordReset()  │
    └─────────────────────────────────────┘
         │
    ┌────┴────┐
    │ Exito   │ Error
    ▼         ▼
┌─────────┐ ┌─────────────────────────┐
│emailSent│ │serverError = mensaje    │
│ = true  │ │FormErrorDisplay muestra │
└─────────┘ └─────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────┐
│ Vista Exito:                             │
│ "Si el email existe, recibiras un       │
│  enlace de recuperacion en breve"        │
│                                          │
│ Boton: "Volver al Login" ──► /login      │
└─────────────────────────────────────────┘
```

### 2.6 Validaciones Implementadas

**Schema Zod:** `passwordRecoverySchema`

```typescript
export const passwordRecoverySchema = z.object({
  email: z.string()
    .min(1, 'Email requerido')
    .email('Email invalido'),
});
```

**Validaciones Frontend:**
- Email no vacio
- Email formato valido (regex email)
- Boton submit deshabilitado si form invalido

### 2.7 Estados de Error Manejados

| Estado | Origen | Mensaje | UI |
|--------|--------|---------|-----|
| Email vacio | Validacion Zod | "Email requerido" | Error inline bajo input |
| Email invalido | Validacion Zod | "Email invalido" | Error inline bajo input |
| Error de red | API catch | "Error al enviar el email. Intenta nuevamente." | FormErrorDisplay (dismissible) |
| Error del servidor | API response | Mensaje dinamico del backend | FormErrorDisplay (dismissible) |

### 2.8 Dependencias

```typescript
// React & Routing
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Forms
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

// Componentes UI
import { DetectiveButton } from '@shared/components/base/DetectiveButton';
import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import { EmailInput } from '@features/auth/components/EmailInput';
import { FormErrorDisplay } from '@features/auth/components/FormErrorDisplay';

// Schemas y APIs
import { passwordRecoverySchema, PasswordRecoveryFormData } from '@features/auth/schemas/authSchemas';
import { passwordAPI } from '@/services/api/passwordAPI';

// Iconos y Animaciones
import { Target, Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
```

---

## 3. PasswordResetPage

### 3.1 Descripcion y Proposito

**Archivo:** `apps/frontend/src/apps/student/pages/PasswordResetPage.tsx`

**Estado:** Activa - Integracion con API Real

**Proposito:** Permitir a los usuarios establecer una nueva password usando el token recibido por email. Es el segundo paso del flujo de recuperacion de password.

### 3.2 Componentes Utilizados

| Componente | Origen | Proposito |
|------------|--------|-----------|
| `DetectiveButton` | `@shared/components/base/DetectiveButton` | Boton de submit con estados |
| `DetectiveCard` | `@shared/components/base/DetectiveCard` | Contenedor del formulario |
| `PasswordInput` | `@features/auth/components/PasswordInput` | Input de password con toggle visibility |
| `FormErrorDisplay` | `@features/auth/components/FormErrorDisplay` | Mostrar errores del servidor |
| `motion` | `framer-motion` | Animaciones de transicion |
| `Target`, `Lock`, `CheckCircle2`, `AlertTriangle` | `lucide-react` | Iconografia |

### 3.3 Hooks Consumidos

| Hook | Origen | Uso |
|------|--------|-----|
| `useState` | `react` | Estados: `loading`, `serverError`, `resetSuccess`, `tokenValid` |
| `useEffect` | `react` | Validar token al montar componente |
| `useNavigate` | `react-router-dom` | Navegacion a `/login`, `/password-recovery` |
| `useSearchParams` | `react-router-dom` | Extraer `token` de URL query params |
| `useForm` | `react-hook-form` | Gestion de formulario con validacion |
| `zodResolver` | `@hookform/resolvers/zod` | Integracion Zod con react-hook-form |

### 3.4 APIs/Endpoints Llamados

| Endpoint | Metodo | Descripcion | Response |
|----------|--------|-------------|----------|
| Validacion Token | `passwordAPI.validateResetToken(token)` | Valida formato de token (client-side) | `{ valid: boolean, userId?: string }` |
| `POST /auth/reset-password` | `passwordAPI.resetPassword(token, password)` | Resetea password con token | `{ message: string }` |

**Nota sobre validacion de token:**
El frontend hace validacion basica client-side (longitud minima 10 caracteres). La validacion real ocurre server-side cuando se llama `resetPassword()`.

**Backend Handler:** `apps/backend/src/modules/auth/services/password-recovery.service.ts`
- `validateToken()` - Valida token hasheado en DB
- `resetPassword()` - Actualiza password y revoca sesiones

### 3.5 Flujo de Usuario

```
Usuario llega a /reset-password?token=abc123...
         │
         ▼
    ┌─────────────────────────────────────┐
    │  useEffect: validateResetToken()     │
    │  Valida formato de token             │
    └─────────────────────────────────────┘
         │
    ┌────┴────────────┐
    │ Token invalido  │ Token valido
    ▼                 ▼
┌───────────────┐   ┌─────────────────────────┐
│Vista Error:   │   │ Formulario:              │
│"Token Invalido│   │ - Nueva password         │
│ o Expirado"   │   │ - Confirmar password     │
│               │   │ - Strength meter         │
│Boton: Solicitar   │ - Criteria checklist     │
│Nuevo Enlace   │   └─────────────────────────┘
└───────────────┘           │
        │                   │ Submit
        ▼                   ▼
    /password-recovery  ┌─────────────────────────┐
                        │ Validacion Zod:          │
                        │ - Min 8 chars            │
                        │ - 1 mayuscula            │
                        │ - 1 minuscula            │
                        │ - 1 numero               │
                        │ - 1 simbolo              │
                        │ - Passwords coinciden    │
                        └─────────────────────────┘
                                │
                           ┌────┴────┐
                           │ Valido  │ Invalido
                           ▼         ▼
                    ┌────────────┐ ┌─────────────┐
                    │ API call   │ │Error inline │
                    │resetPassword│ │bajo inputs │
                    └────────────┘ └─────────────┘
                           │
                      ┌────┴────┐
                      │ Exito   │ Error
                      ▼         ▼
              ┌─────────────┐ ┌─────────────────┐
              │Vista Exito: │ │serverError      │
              │"Password    │ │FormErrorDisplay │
              │Actualizada" │ └─────────────────┘
              │             │
              │Auto-redirect│
              │a /login (3s)│
              └─────────────┘
```

### 3.6 Validaciones Implementadas

**Schema Zod:** `passwordResetSchema`

```typescript
export const passwordResetSchema = z.object({
  password: z.string()
    .min(8, 'Minimo 8 caracteres')
    .regex(/[A-Z]/, 'Debe contener al menos una mayuscula')
    .regex(/[a-z]/, 'Debe contener al menos una minuscula')
    .regex(/[0-9]/, 'Debe contener al menos un numero')
    .regex(/[^A-Za-z0-9]/, 'Debe contener al menos un simbolo especial'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contrasenas no coinciden',
  path: ['confirmPassword'],
});
```

**Validaciones:**
- Minimo 8 caracteres
- Al menos 1 mayuscula (A-Z)
- Al menos 1 minuscula (a-z)
- Al menos 1 numero (0-9)
- Al menos 1 simbolo especial
- Confirmacion debe coincidir

**PasswordInput Features:**
- `showStrengthMeter={true}` - Barra visual de fortaleza
- `showCriteria={true}` - Checklist de criterios cumplidos

### 3.7 Estados de Error Manejados

| Estado | Origen | Mensaje | UI |
|--------|--------|---------|-----|
| Token ausente | URL params | N/A | Vista "Token Invalido" |
| Token muy corto | validateResetToken | N/A | Vista "Token Invalido" |
| Password debil | Validacion Zod | Mensajes especificos por criterio | Errors inline + criteria |
| Passwords no coinciden | Validacion Zod | "Las contrasenas no coinciden" | Error bajo confirmPassword |
| Token expirado | API response | "Token invalido o expirado" | FormErrorDisplay |
| Error de red | API catch | "Error al restablecer la contrasena" | FormErrorDisplay |

### 3.8 Dependencias

```typescript
// React & Routing
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

// Forms
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

// Componentes UI
import { DetectiveButton } from '@shared/components/base/DetectiveButton';
import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import { PasswordInput } from '@features/auth/components/PasswordInput';
import { FormErrorDisplay } from '@features/auth/components/FormErrorDisplay';

// Schemas y APIs
import { passwordResetSchema, PasswordResetFormData } from '@features/auth/schemas/authSchemas';
import { passwordAPI } from '@/services/api/passwordAPI';

// Iconos y Animaciones
import { Target, Lock, CheckCircle2, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
```

---

## 4. TwoFactorAuthPage

### 4.1 Descripcion y Proposito

**Archivo:** `apps/frontend/src/apps/student/pages/TwoFactorAuthPage.tsx`

**Estado:** Mock - Usa funciones mock, backend 2FA no implementado

**Proposito:** Permitir a los usuarios ingresar un codigo de verificacion de 6 digitos para completar la autenticacion de dos factores (2FA). Actualmente usa implementacion mock para desarrollo.

### 4.2 Componentes Utilizados

| Componente | Origen | Proposito |
|------------|--------|-----------|
| `DetectiveButton` | `@shared/components/base/DetectiveButton` | Boton de verificacion |
| `DetectiveCard` | `@shared/components/base/DetectiveCard` | Contenedor del formulario |
| `FormErrorDisplay` | `@features/auth/components/FormErrorDisplay` | Mostrar errores |
| `motion` | `framer-motion` | Animaciones de inputs |
| `Target`, `Shield`, `RefreshCw` | `lucide-react` | Iconografia |

### 4.3 Hooks Consumidos

| Hook | Origen | Uso |
|------|--------|-----|
| `useState` | `react` | Estados multiples: `loading`, `serverError`, `code[]`, `resendLoading`, `resendSuccess` |
| `useRef` | `react` | Referencias a 6 inputs para auto-focus |
| `useEffect` | `react` | Focus inicial en primer input |
| `useNavigate` | `react-router-dom` | Navegacion a `/dashboard`, `/login` |
| `useForm` | `react-hook-form` | Gestion de formulario con validacion |
| `zodResolver` | `@hookform/resolvers/zod` | Integracion Zod con react-hook-form |

### 4.4 APIs/Endpoints Llamados

**IMPORTANTE:** Esta pagina usa funciones MOCK, no APIs reales.

| Funcion | Origen | Descripcion | Response |
|---------|--------|-------------|----------|
| `mockTwoFactorVerification(code)` | `@features/auth/mocks/authMocks` | Simula verificacion 2FA | `{ success: boolean, error?: string }` |
| `mockResendVerificationCode()` | `@features/auth/mocks/authMocks` | Simula reenvio de codigo | `{ success: boolean }` |

**Codigo Mock Valido:** `123456`

**Archivo Mocks:** `apps/frontend/src/features/auth/mocks/authMocks.ts`

### 4.5 Flujo de Usuario

```
Usuario llega a /two-factor (despues de login con 2FA habilitado)
         │
         ▼
    ┌─────────────────────────────────────┐
    │  6 inputs individuales para codigo   │
    │  Auto-focus en primer input          │
    │                                      │
    │  Info: "Implementacion mock"         │
    │  "Codigo de prueba: 123456"          │
    └─────────────────────────────────────┘
         │
         │ Usuario ingresa codigo
         │ (auto-advance entre inputs)
         │
         ├──► Paste: Distribuye 6 digitos automaticamente
         │
         ├──► Backspace en vacio: Retrocede al input anterior
         │
         ▼
    ┌─────────────────────────────────────┐
    │  Submit: mockTwoFactorVerification() │
    │  Boton: "Verificando..."             │
    └─────────────────────────────────────┘
         │
    ┌────┴────────────────┐
    │ Codigo: 123456      │ Codigo incorrecto
    ▼                     ▼
┌─────────────┐    ┌──────────────────────────┐
│ Exito:      │    │ Error: "Codigo invalido" │
│ navigate()  │    │ Limpiar inputs           │
│ /dashboard  │    │ Focus en primer input    │
└─────────────┘    └──────────────────────────┘
                          │
                          ▼
                   ┌──────────────────────────┐
                   │ Opcion: "Reenviar codigo"│
                   │ mockResendVerificationCode│
                   │ Toast: "Codigo reenviado"│
                   └──────────────────────────┘
```

### 4.6 Validaciones Implementadas

**Schema Zod:** `twoFactorSchema`

```typescript
export const twoFactorSchema = z.object({
  code: z.string()
    .length(6, 'El codigo debe tener 6 digitos')
    .regex(/^\d+$/, 'El codigo solo debe contener numeros'),
});
```

**Validaciones en Handlers:**
- `handleCodeChange`: Solo permite digitos (regex `/^\d$/`)
- Input: `inputMode="numeric"` para teclado numerico en mobile
- Input: `maxLength={1}` por cada input

### 4.7 Estados de Error Manejados

| Estado | Origen | Mensaje | UI |
|--------|--------|---------|-----|
| Codigo incompleto | Validacion Zod | "El codigo debe tener 6 digitos" | Error bajo inputs |
| Caracteres no numericos | handleCodeChange | N/A (ignorado) | Input rechaza |
| Codigo incorrecto | Mock response | "Codigo invalido o expirado" | FormErrorDisplay + limpiar inputs |
| Error de conexion | catch | "Error de conexion. Intenta nuevamente." | FormErrorDisplay |

### 4.8 Dependencias

```typescript
// React & Routing
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Forms
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

// Componentes UI
import { DetectiveButton } from '@shared/components/base/DetectiveButton';
import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import { FormErrorDisplay } from '@features/auth/components/FormErrorDisplay';

// Schemas y Mocks
import { twoFactorSchema, TwoFactorFormData } from '@features/auth/schemas/authSchemas';
import { mockTwoFactorVerification, mockResendVerificationCode } from '@features/auth/mocks/authMocks';

// Iconos y Animaciones
import { Target, Shield, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
```

### 4.9 Funcionalidades de UX

**Auto-advance entre inputs:**
```typescript
const handleCodeChange = (index: number, value: string) => {
  if (value && !/^\d$/.test(value)) return; // Solo digitos

  const newCode = [...code];
  newCode[index] = value;
  setCode(newCode);

  // Auto-focus al siguiente
  if (value && index < 5) {
    inputRefs.current[index + 1]?.focus();
  }
};
```

**Backspace navigation:**
```typescript
const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
  if (e.key === 'Backspace' && !code[index] && index > 0) {
    inputRefs.current[index - 1]?.focus();
  }
};
```

**Paste support:**
```typescript
const handlePaste = (e: React.ClipboardEvent) => {
  e.preventDefault();
  const pastedData = e.clipboardData.getData('text').slice(0, 6);

  if (/^\d+$/.test(pastedData)) {
    const newCode = pastedData.split('').concat(Array(6 - pastedData.length).fill(''));
    setCode(newCode);
    setValue('code', pastedData, { shouldValidate: true });
  }
};
```

---

## APIs y Endpoints

### 5.1 passwordAPI Service

**Archivo:** `apps/frontend/src/services/api/passwordAPI.ts`

```typescript
export const passwordAPI = {
  /**
   * Solicitar reset de password
   * @param email - Email del usuario
   * @returns Mensaje generico (no revela si email existe)
   */
  requestPasswordReset: async (email: string): Promise<PasswordResetRequestResponse>

  /**
   * Resetear password con token
   * @param token - Token de recuperacion del email
   * @param newPassword - Nueva password
   * @returns Mensaje de confirmacion
   * @throws Error si token invalido/expirado
   */
  resetPassword: async (token: string, newPassword: string): Promise<PasswordResetResponse>

  /**
   * Validar formato de token (client-side)
   * @param token - Token a validar
   * @returns { valid: boolean }
   * @note Validacion real ocurre server-side en resetPassword
   */
  validateResetToken: async (token: string): Promise<ValidateTokenResponse>
};
```

### 5.2 Backend Endpoints

**Controller:** `apps/backend/src/modules/auth/controllers/password.controller.ts`

| Endpoint | Metodo | Descripcion | Auth |
|----------|--------|-------------|------|
| `POST /auth/reset-password/request` | `requestPasswordReset` | Solicitar email de reset | Public |
| `POST /auth/reset-password` | `resetPassword` | Resetear con token | Public |
| `PUT /auth/change-password` | `changePassword` | Cambiar password (autenticado) | JWT |
| `POST /auth/verify-email` | `verifyEmail` | Verificar email (deprecated) | Public |
| `POST /auth/verify-email/resend` | `resendVerification` | Reenviar verificacion | JWT |
| `GET /auth/verify-email/status` | `checkVerificationStatus` | Estado verificacion | JWT |

### 5.3 Backend Service

**Service:** `apps/backend/src/modules/auth/services/password-recovery.service.ts`

**Caracteristicas de Seguridad:**
- Token hasheado con SHA256 en DB
- Expiracion de 1 hora
- No revela si email existe (mensaje generico)
- Invalida tokens anteriores al crear nuevo
- Revoca todas las sesiones al cambiar password

```typescript
class PasswordRecoveryService {
  private readonly TOKEN_LENGTH_BYTES = 32;
  private readonly TOKEN_EXPIRATION_HOURS = 1;

  requestReset(dto: RequestPasswordResetDto): Promise<{ message: string }>
  validateToken(token: string): Promise<{ valid: boolean; userId?: string }>
  resetPassword(dto: ResetPasswordDto): Promise<{ message: string }>
  invalidatePreviousTokens(userId: string): Promise<void>
  cleanExpiredTokens(daysToKeep: number): Promise<number>
}
```

---

## Schemas de Validacion

### 6.1 Archivo de Schemas

**Archivo:** `apps/frontend/src/features/auth/schemas/authSchemas.ts`

### 6.2 Schemas Relevantes

```typescript
// Recuperacion de password (email)
export const passwordRecoverySchema = z.object({
  email: z.string().min(1, 'Email requerido').email('Email invalido'),
});

// Reset de password (nueva password)
export const passwordResetSchema = z.object({
  password: z.string()
    .min(8, 'Minimo 8 caracteres')
    .regex(/[A-Z]/, 'Debe contener al menos una mayuscula')
    .regex(/[a-z]/, 'Debe contener al menos una minuscula')
    .regex(/[0-9]/, 'Debe contener al menos un numero')
    .regex(/[^A-Za-z0-9]/, 'Debe contener al menos un simbolo especial'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contrasenas no coinciden',
  path: ['confirmPassword'],
});

// Two Factor Auth (codigo 6 digitos)
export const twoFactorSchema = z.object({
  code: z.string()
    .length(6, 'El codigo debe tener 6 digitos')
    .regex(/^\d+$/, 'El codigo solo debe contener numeros'),
});

// Types exportados
export type PasswordRecoveryFormData = z.infer<typeof passwordRecoverySchema>;
export type PasswordResetFormData = z.infer<typeof passwordResetSchema>;
export type TwoFactorFormData = z.infer<typeof twoFactorSchema>;
```

---

## Dependencias Compartidas

### 7.1 Componentes Base Detective Theme

| Componente | Ruta | Uso |
|------------|------|-----|
| `DetectiveButton` | `@shared/components/base/DetectiveButton` | Botones con estados loading, variants |
| `DetectiveCard` | `@shared/components/base/DetectiveCard` | Contenedor card con estilo Detective |

### 7.2 Componentes Auth Features

| Componente | Ruta | Uso |
|------------|------|-----|
| `EmailInput` | `@features/auth/components/EmailInput` | Input email con validacion visual |
| `PasswordInput` | `@features/auth/components/PasswordInput` | Input password con toggle, strength meter |
| `FormErrorDisplay` | `@features/auth/components/FormErrorDisplay` | Banner de errores dismissible |

### 7.3 Librerias Externas

| Libreria | Version | Uso |
|----------|---------|-----|
| `react-hook-form` | ^7.x | Gestion de formularios |
| `@hookform/resolvers` | ^3.x | Integracion Zod |
| `zod` | ^3.x | Validacion de schemas |
| `framer-motion` | ^10.x | Animaciones |
| `lucide-react` | ^0.x | Iconografia |
| `react-router-dom` | ^6.x | Routing y navegacion |

### 7.4 Estilos CSS

Todas las paginas usan clases del tema Detective:
- `detective-bg`, `detective-bg-secondary` - Fondos
- `detective-text`, `detective-text-secondary` - Textos
- `detective-orange`, `detective-success`, `detective-danger` - Colores
- `detective-title`, `detective-subtitle`, `detective-body`, `detective-sm` - Tipografia

---

## Matriz de Estado por Pagina

| Pagina | API Real | Mock | Deprecated | Tests |
|--------|----------|------|------------|-------|
| EmailVerificationPage | No | No | Si | N/A |
| PasswordRecoveryPage | Si | No | No | Pendiente |
| PasswordResetPage | Si | No | No | Pendiente |
| TwoFactorAuthPage | No | Si | No | Pendiente |

---

## Proximos Pasos

### Alta Prioridad
1. **Implementar 2FA Backend:** Integrar TwoFactorAuthPage con APIs reales (TOTP, SMS, etc.)
2. **Eliminar EmailVerificationPage:** Despues de periodo de gracia, eliminar pagina deprecated

### Media Prioridad
3. **Tests E2E:** Agregar tests de integracion para flujo completo de password recovery
4. **Rate Limiting UI:** Mostrar cooldown en reenvio de codigo 2FA

### Baja Prioridad
5. **Internacionalizacion:** Preparar textos para i18n
6. **Accesibilidad:** Revisar ARIA labels y keyboard navigation

---

**Documento generado por:** Documentation-Agent + Frontend-Agent
**Basado en codigo existente en:** `apps/frontend/src/apps/student/pages/`
**Fecha de generacion:** 2026-01-20
