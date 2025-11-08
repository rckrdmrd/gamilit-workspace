# AUTH - User Flows

**Proyecto:** GAMILIT Platform
**Feature:** Authentication System
**Componente:** Complete User Flows
**Versión:** 2.0
**Fecha:** 2025-11-07

---

## 📋 Índice

1. [Propósito](#-propósito)
2. [Referencias](#-referencias-a-documentación-base)
3. [Flujo de Registro](#1-flujo-de-registro)
4. [Flujo de Login](#2-flujo-de-login)
5. [Flujo de Logout](#3-flujo-de-logout)
6. [Flujo de Refresh Automático](#4-flujo-de-refresh-automático)
7. [Flujo de Recuperación de Contraseña](#5-flujo-de-recuperación-de-contraseña)
8. [Flujo de Cambio de Contraseña](#6-flujo-de-cambio-de-contraseña)
9. [Flujo de Rutas Protegidas](#7-flujo-de-rutas-protegidas)

---

## 🎯 Propósito

Este documento describe todos los **flujos completos de usuario** relacionados con autenticación, desde la interacción en la UI hasta la persistencia en base de datos.

**Alcance:**
- Flujos happy path (caso exitoso)
- Flujos de error (manejo de fallos)
- Diagramas de secuencia
- Estados de UI
- Integraciones entre capas

---

## 📚 Referencias a Documentación Base

### Requerimientos
- **Casos de Uso:** [`docs/01-requerimientos/casos-uso/student/UC-STU-001-registro.md`](../../../../01-requerimientos/casos-uso/student/UC-STU-001-registro.md)
  - Registro completo de estudiante
  - Login automático post-registro

### Especificaciones Técnicas
- **API Reference:** [`docs/02-especificaciones-tecnicas/apis/api-reference/01-AUTH-API.md`](../../../../02-especificaciones-tecnicas/apis/api-reference/01-AUTH-API.md)
  - Endpoints de autenticación

- **Trazabilidad:** [`docs/02-especificaciones-tecnicas/trazabilidad/01-foundation-authentication.md`](../../../../02-especificaciones-tecnicas/trazabilidad/01-foundation-authentication.md)
  - Flujo completo Frontend → Backend → Database

- **ADRs:** [`docs/02-especificaciones-tecnicas/adr/ADR-002-jwt-security-implementation.md`](../../../../02-especificaciones-tecnicas/adr/ADR-002-jwt-security-implementation.md)
  - JWT token management
  - Refresh token rotation

### Documentación Feature
- **Overview:** [README.md](./README.md#-flujos-de-usuario)
- **Components:** [AUTH-Components.md](./AUTH-Components.md)
- **Store:** [AUTH-Store.md](./AUTH-Store.md)
- **Hooks:** [AUTH-Hooks.md](./AUTH-Hooks.md)
- **API:** [AUTH-API.md](./AUTH-API.md)

---

## 1. Flujo de Registro

### Happy Path

```
┌─────────────┐
│   Usuario   │
└──────┬──────┘
       │
       │ 1. Ingresa datos en RegisterForm
       ▼
┌────────────────────┐
│  RegisterForm      │
│  ──────────────    │
│  - Email           │
│  - Password        │
│  - Confirm Pass    │
│  - First Name      │
│  - Last Name       │
└─────────┬──────────┘
          │
          │ 2. onSubmit() → useRegister.onSubmit()
          ▼
┌──────────────────────┐
│   useRegister Hook   │
│   ────────────────   │
│   - Validación Zod   │
│   - registerSchema   │
└──────────┬───────────┘
           │
           │ 3. Validación OK → authStore.register()
           ▼
┌───────────────────────┐
│    authStore          │
│    ────────────       │
│    set({ isLoading }) │
└───────────┬───────────┘
            │
            │ 4. authApi.register(userData)
            ▼
┌─────────────────────────┐
│   authApi (axios)       │
│   ─────────────────     │
│   POST /api/auth/register│
└──────────┬──────────────┘
           │
           │ 5. HTTP Request
           ▼
┌────────────────────────────┐
│   Backend Controller       │
│   ──────────────────       │
│   auth.controller.ts       │
│   - ValidatePipe(RegisterDto)│
└────────────┬───────────────┘
             │
             │ 6. authService.register()
             ▼
┌──────────────────────────────┐
│   Auth Service               │
│   ────────────────           │
│   1. Hash password (bcrypt)  │
│   2. Create user in DB       │
│   3. Generate tokens (JWT)   │
│   4. Create session          │
└──────────────┬───────────────┘
               │
               │ 7. SQL INSERT
               ▼
┌─────────────────────────────────┐
│   PostgreSQL                    │
│   ──────────────────            │
│   auth_management.profiles      │
│   - INSERT new user             │
│   - INSERT initial stats        │
└────────────┬────────────────────┘
             │
             │ 8. Return AuthResponse
             ▼
┌──────────────────────────────┐
│   authStore                  │
│   ────────────────           │
│   set({                      │
│     user,                    │
│     accessToken,             │
│     refreshToken,            │
│     isAuthenticated: true    │
│   })                         │
└──────────┬───────────────────┘
           │
           │ 9. Persist to localStorage
           ▼
┌─────────────────────────┐
│   localStorage          │
│   ───────────────       │
│   'auth-storage'        │
└──────────┬──────────────┘
           │
           │ 10. onSuccess callback
           ▼
┌──────────────────────────┐
│   Component              │
│   ────────────           │
│   navigate('/onboarding')│
└──────────────────────────┘
```

### Estados de UI

| Estado | Condición | UI |
|--------|-----------|-----|
| **Idle** | Formulario inicial | Form habilitado, botón "Registrarse" |
| **Validating** | Validación Zod en curso | Errores inline si hay |
| **Submitting** | isLoading = true | Botón disabled, spinner, "Registrando..." |
| **Success** | Usuario creado | Redirigir a /onboarding |
| **Error** | Error de API | Mostrar error banner, form habilitado |

### Validaciones

```typescript
// Validación Zod en useRegister
const registerSchema = z.object({
  email: z.string()
    .min(1, 'El email es requerido')
    .email('Email inválido'),
  password: z.string()
    .min(8, 'Mínimo 8 caracteres')
    .regex(/[A-Z]/, 'Debe contener una mayúscula')
    .regex(/[a-z]/, 'Debe contener una minúscula')
    .regex(/[0-9]/, 'Debe contener un número'),
  confirmPassword: z.string(),
  firstName: z.string().min(1, 'El nombre es requerido'),
  lastName: z.string().min(1, 'El apellido es requerido'),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
});
```

### Manejo de Errores

| Error | Causa | Mensaje Usuario | Acción |
|-------|-------|-----------------|--------|
| **EMAIL_ALREADY_EXISTS** | Email duplicado | "Este email ya está registrado" | Sugerir login |
| **WEAK_PASSWORD** | Password no cumple requisitos | "Contraseña muy débil" | Mostrar requisitos |
| **VALIDATION_ERROR** | Datos inválidos | Errores inline por campo | Corregir campos |
| **NETWORK_ERROR** | Sin conexión | "Error de conexión" | Botón "Reintentar" |

**Referencia:** [`UC-STU-001-registro.md`](../../../../01-requerimientos/casos-uso/student/UC-STU-001-registro.md)

---

## 2. Flujo de Login

### Happy Path

```
Usuario → LoginForm → useLogin → authStore.login() → authApi.login()
  → Backend → DB Query → JWT Generation → Response → authStore.setUser()
  → localStorage persist → Redirect to dashboard
```

### Diagrama Detallado

```
┌──────────────┐
│ LoginForm    │
│ ──────────   │
│ email        │
│ password     │
│ [remember me]│
└──────┬───────┘
       │
       │ 1. handleSubmit(onSubmit)
       ▼
┌────────────────┐
│ useLogin       │
│ ────────────   │
│ Validación Zod │
└──────┬─────────┘
       │
       │ 2. authStore.login({ email, password })
       ▼
┌────────────────────────┐
│ authStore              │
│ ───────────────        │
│ set({ isLoading: true })│
└──────┬─────────────────┘
       │
       │ 3. authApi.login(credentials)
       ▼
┌──────────────────────────┐
│ Backend Controller       │
│ ──────────────────       │
│ POST /api/auth/login     │
│ - Validate credentials   │
│ - Check user status      │
│ - Verify password (bcrypt)│
└──────┬───────────────────┘
       │
       │ 4. SQL Query
       ▼
┌─────────────────────────────────────┐
│ PostgreSQL                          │
│ ─────────────────────────           │
│ SELECT * FROM auth_management.profiles│
│ WHERE email = $1 AND deleted_at IS NULL│
└──────┬──────────────────────────────┘
       │
       │ 5. Generate JWT tokens
       ▼
┌────────────────────────────┐
│ JWT Service                │
│ ───────────────            │
│ - Access token (RS256, 7d) │
│ - Refresh token (30d)      │
└──────┬─────────────────────┘
       │
       │ 6. Create session record
       ▼
┌────────────────────────────────────┐
│ auth_management.user_sessions      │
│ ────────────────────────────       │
│ INSERT session with device info    │
└──────┬─────────────────────────────┘
       │
       │ 7. Return AuthResponse
       ▼
┌────────────────────────────┐
│ authStore                  │
│ ────────────────           │
│ set({                      │
│   user: response.user,     │
│   accessToken,             │
│   refreshToken,            │
│   isAuthenticated: true,   │
│   sessionExpiresAt         │
│ })                         │
└──────┬─────────────────────┘
       │
       │ 8. Persist to localStorage
       ▼
┌──────────────────────┐
│ localStorage         │
│ ──────────────       │
│ 'auth-storage' key   │
└──────┬───────────────┘
       │
       │ 9. Redirect by role
       ▼
┌─────────────────────────────┐
│ Navigate                    │
│ ──────────────              │
│ student → /student/dashboard│
│ teacher → /admin/dashboard  │
└─────────────────────────────┘
```

### Validación de Credenciales

**Frontend:**
```typescript
const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Mínimo 8 caracteres'),
});
```

**Backend:**
```typescript
// auth.service.ts
async login(email: string, password: string) {
  const user = await authRepository.findByEmail(email);

  if (!user) {
    throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
  }

  const isValid = await bcrypt.compare(password, user.password_hash);

  if (!isValid) {
    throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
  }

  if (user.status !== 'active') {
    throw new AppError('Account inactive', 401, 'ACCOUNT_INACTIVE');
  }

  // Continue with token generation...
}
```

### Estados de UI

| Estado | isLoading | isAuthenticated | UI |
|--------|-----------|-----------------|-----|
| **Idle** | false | false | Form habilitado |
| **Submitting** | true | false | Botón disabled, spinner |
| **Success** | false | true | Redirect automático |
| **Error** | false | false | Mostrar error, form habilitado |

**Referencia:** [`01-foundation-authentication.md`](../../../../02-especificaciones-tecnicas/trazabilidad/01-foundation-authentication.md#flujo-1-autenticacion-de-usuario-login)

---

## 3. Flujo de Logout

### Happy Path

```
Usuario click "Cerrar Sesión" → authStore.logout()
  → authApi.logout(refreshToken) → Backend invalida token
  → authStore.clear() → localStorage.clear() → Redirect to /login
```

### Diagrama Detallado

```
┌──────────────────┐
│ Header Component │
│ ──────────────── │
│ [Logout Button]  │
└────────┬─────────┘
         │
         │ 1. onClick → logout()
         ▼
┌──────────────────────────┐
│ authStore.logout()       │
│ ──────────────────       │
│ set({ isLoading: true }) │
└────────┬─────────────────┘
         │
         │ 2. authApi.logout(refreshToken)
         ▼
┌────────────────────────────┐
│ Backend Controller         │
│ ──────────────────         │
│ POST /api/auth/logout      │
│ - Invalidate refresh token │
│ - Delete session record    │
└────────┬───────────────────┘
         │
         │ 3. SQL DELETE
         ▼
┌─────────────────────────────────┐
│ auth_management.user_sessions   │
│ ─────────────────────────────   │
│ DELETE WHERE refresh_token = $1 │
└────────┬────────────────────────┘
         │
         │ 4. Success response
         ▼
┌──────────────────────────┐
│ authStore                │
│ ──────────────           │
│ set({                    │
│   user: null,            │
│   accessToken: null,     │
│   refreshToken: null,    │
│   isAuthenticated: false │
│ })                       │
└────────┬─────────────────┘
         │
         │ 5. Clear localStorage
         ▼
┌──────────────────────┐
│ localStorage.clear() │
└────────┬─────────────┘
         │
         │ 6. Redirect
         ▼
┌─────────────────────┐
│ navigate('/login')  │
└─────────────────────┘
```

### Manejo de Errores

**Nota:** Incluso si la llamada a `/api/auth/logout` falla, el store se limpia y el usuario se desloguea localmente.

```typescript
logout: async () => {
  try {
    const { refreshToken } = get();
    if (refreshToken) {
      await authApi.logout(refreshToken);
    }
  } catch (error) {
    // Ignorar errores del backend
    console.error('Logout backend error:', error);
  } finally {
    // Siempre limpiar estado local
    set({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      sessionExpiresAt: null,
      isLoading: false,
      error: null,
    });
  }
}
```

---

## 4. Flujo de Refresh Automático

### Trigger

Se ejecuta automáticamente cuando:
1. Una request recibe status `401 Unauthorized`
2. La sesión está por expirar (< 1 día restante)

### Diagrama de Secuencia

```
┌──────────────┐
│ API Request  │
│ ────────────│
│ GET /api/progress/stats│
└──────┬───────┘
       │
       │ 1. Request con token expirado
       ▼
┌────────────────────────┐
│ Backend                │
│ ────────────           │
│ Validate JWT → EXPIRED │
│ Return 401             │
└──────┬─────────────────┘
       │
       │ 2. Response 401
       ▼
┌──────────────────────────────┐
│ axios Response Interceptor   │
│ ──────────────────────────   │
│ if (status === 401 &&        │
│     !originalRequest._retry) │
└──────┬───────────────────────┘
       │
       │ 3. authStore.refreshSession()
       ▼
┌────────────────────────────┐
│ authApi.refresh(refreshToken)│
└──────┬─────────────────────┘
       │
       │ 4. POST /api/auth/refresh
       ▼
┌────────────────────────────┐
│ Backend                    │
│ ────────────────           │
│ - Validate refresh token   │
│ - Generate new access token│
│ - Rotate refresh token     │
└──────┬─────────────────────┘
       │
       │ 5. Return new tokens
       ▼
┌──────────────────────────┐
│ authStore                │
│ ──────────────           │
│ set({                    │
│   accessToken: newToken, │
│   refreshToken: rotated  │
│ })                       │
└──────┬───────────────────┘
       │
       │ 6. Retry original request
       ▼
┌────────────────────────────┐
│ axios Interceptor          │
│ ────────────────           │
│ originalRequest.headers    │
│   .Authorization = newToken│
│ return apiClient(original) │
└──────┬─────────────────────┘
       │
       │ 7. Request success
       ▼
┌──────────────────┐
│ Component        │
│ ──────────────   │
│ Receive data     │
└──────────────────┘
```

### Implementación del Interceptor

```typescript
// apiClient.ts
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // Evitar loop infinito

      try {
        const refreshSession = useAuthStore.getState().refreshSession;
        await refreshSession();

        // Retry request con nuevo token
        const newToken = useAuthStore.getState().accessToken;
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Si refresh falla, logout automático
        useAuthStore.getState().logout();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
```

### Refresh Token Rotation

**ADR-002:** Cada vez que se usa el refresh token, se genera uno nuevo (rotación).

```typescript
// Backend: auth.service.ts
async refreshToken(oldRefreshToken: string) {
  // 1. Validar refresh token
  const session = await validateRefreshToken(oldRefreshToken);

  // 2. Generar nuevos tokens
  const newAccessToken = generateAccessToken(session.user);
  const newRefreshToken = generateRefreshToken(session.user);

  // 3. Invalidar token antiguo
  await sessionRepository.invalidateRefreshToken(oldRefreshToken);

  // 4. Guardar nuevo token
  await sessionRepository.updateRefreshToken(session.id, newRefreshToken);

  return {
    token: newAccessToken,
    refreshToken: newRefreshToken
  };
}
```

**Referencia:** [`ADR-002`](../../../../02-especificaciones-tecnicas/adr/ADR-002-jwt-security-implementation.md)

---

## 5. Flujo de Recuperación de Contraseña

### Fase 1: Solicitud de Reset

```
Usuario → ForgotPasswordForm → authApi.forgotPassword(email)
  → Backend genera reset token → Envía email
  → Muestra mensaje "Revisa tu email"
```

### Fase 2: Reset con Token

```
Usuario click link en email → ResetPasswordForm
  → authApi.resetPassword({ token, newPassword })
  → Backend valida token → Actualiza password
  → Redirect a login
```

### Diagrama Completo

```
┌───────────────────────┐
│ ForgotPasswordForm    │
│ ─────────────────     │
│ email input           │
│ [Enviar]              │
└──────┬────────────────┘
       │
       │ 1. authApi.forgotPassword('user@example.com')
       ▼
┌──────────────────────────┐
│ Backend                  │
│ ──────────────           │
│ POST /api/auth/forgot-password│
│ - Find user by email     │
│ - Generate reset token   │
│ - Set expiry (1 hour)    │
└──────┬───────────────────┘
       │
       │ 2. INSERT reset token
       ▼
┌───────────────────────────────────┐
│ auth_management.password_resets   │
│ ───────────────────────────────   │
│ - user_id                         │
│ - token (hashed)                  │
│ - expires_at (NOW() + 1 hour)     │
└──────┬────────────────────────────┘
       │
       │ 3. Send email with reset link
       ▼
┌────────────────────────────┐
│ Mail Service               │
│ ──────────────             │
│ URL: /reset-password?token=abc123│
└──────┬─────────────────────┘
       │
       │ 4. User clicks link
       ▼
┌───────────────────────┐
│ ResetPasswordForm     │
│ ─────────────────     │
│ newPassword           │
│ confirmPassword       │
│ [Restablecer]         │
└──────┬────────────────┘
       │
       │ 5. authApi.resetPassword({ token, newPassword })
       ▼
┌──────────────────────────────┐
│ Backend                      │
│ ──────────────               │
│ POST /api/auth/reset-password│
│ - Validate token not expired │
│ - Hash new password          │
│ - Update user password       │
│ - Invalidate reset token     │
└──────┬───────────────────────┘
       │
       │ 6. UPDATE password
       ▼
┌──────────────────────────────────┐
│ auth_management.profiles         │
│ ──────────────────────────────   │
│ UPDATE password_hash             │
│ WHERE id = $1                    │
└──────┬───────────────────────────┘
       │
       │ 7. Success → redirect to login
       ▼
┌─────────────────────┐
│ LoginPage           │
│ ─────────────       │
│ "Password updated"  │
└─────────────────────┘
```

### Validaciones

**Token Expiry:** 1 hora desde generación

```typescript
// Backend validation
if (Date.now() > resetToken.expiresAt.getTime()) {
  throw new AppError('Token expired', 400, 'TOKEN_EXPIRED');
}
```

---

## 6. Flujo de Cambio de Contraseña

Para usuarios autenticados que quieren cambiar su contraseña.

```
Usuario autenticado → ChangePasswordForm
  → authApi.changePassword({ currentPassword, newPassword })
  → Backend verifica currentPassword → Actualiza
  → Muestra "Contraseña actualizada"
```

### Validaciones

**Frontend:**
```typescript
const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string()
    .min(8)
    .regex(/[A-Z]/)
    .regex(/[a-z]/)
    .regex(/[0-9]/),
  confirmPassword: z.string(),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
}).refine(data => data.currentPassword !== data.newPassword, {
  message: 'La nueva contraseña debe ser diferente',
  path: ['newPassword'],
});
```

**Backend:**
```typescript
async changePassword(userId: string, currentPassword: string, newPassword: string) {
  const user = await authRepository.findById(userId);

  // Verificar contraseña actual
  const isValid = await bcrypt.compare(currentPassword, user.password_hash);
  if (!isValid) {
    throw new AppError('Current password is incorrect', 400, 'INVALID_PASSWORD');
  }

  // Hash nueva contraseña
  const newHash = await bcrypt.hash(newPassword, 10);

  // Actualizar
  await authRepository.updatePassword(userId, newHash);
}
```

---

## 7. Flujo de Rutas Protegidas

### ProtectedRoute Component

```typescript
// ProtectedRoute.tsx
export const ProtectedRoute = ({ children, requiredRole }: Props) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const checkSession = useAuthStore((state) => state.checkSession);

  // 1. Verificar sesión válida
  const isValid = checkSession();

  if (!isValid || !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // 2. Verificar rol requerido
  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};
```

### Uso en Routes

```typescript
// App routes
<Route path="/student/*" element={
  <ProtectedRoute requiredRole="student">
    <StudentApp />
  </ProtectedRoute>
} />

<Route path="/admin/*" element={
  <ProtectedRoute requiredRole="admin_teacher">
    <AdminApp />
  </ProtectedRoute>
} />
```

### Diagrama de Flujo

```
Usuario navega a /student/dashboard
  ↓
ProtectedRoute component mount
  ↓
checkSession() → isAuthenticated?
  ├─ No → <Navigate to="/login" />
  └─ Sí → Verificar role
           ├─ No match → <Navigate to="/unauthorized" />
           └─ Match → Render children (StudentApp)
```

### Validación de Sesión

```typescript
checkSession: () => {
  const { isAuthenticated, sessionExpiresAt } = get();

  if (!isAuthenticated || !sessionExpiresAt) {
    return false;
  }

  const isExpired = Date.now() > sessionExpiresAt;

  if (isExpired) {
    get().logout(); // Logout automático
    return false;
  }

  return true;
}
```

---

## 📊 Resumen de Flujos

| Flujo | Componentes | Endpoints | DB Tables | Duration |
|-------|-------------|-----------|-----------|----------|
| **Registro** | RegisterForm, useRegister, authStore | POST /auth/register | profiles, user_sessions | ~2s |
| **Login** | LoginForm, useLogin, authStore | POST /auth/login | profiles, user_sessions | ~1s |
| **Logout** | Header, authStore | POST /auth/logout | user_sessions | ~500ms |
| **Refresh** | Interceptor, authStore | POST /auth/refresh | user_sessions | ~300ms |
| **Forgot Password** | ForgotPasswordForm | POST /auth/forgot-password | password_resets | ~2s |
| **Reset Password** | ResetPasswordForm | POST /auth/reset-password | profiles, password_resets | ~1s |
| **Change Password** | ChangePasswordForm | PUT /auth/password | profiles | ~1s |

---

**Mantenedores:** @frontend-team, @auth-owner
**Última actualización:** 2025-11-07
**Documentos relacionados:** [README.md](./README.md), [AUTH-Components.md](./AUTH-Components.md), [AUTH-Store.md](./AUTH-Store.md)
