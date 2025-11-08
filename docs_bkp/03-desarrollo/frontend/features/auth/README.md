# Feature: Autenticación (Auth)

**Proyecto:** GAMILIT Platform
**Feature:** Authentication System
**Versión:** 2.0
**Fecha:** 2025-11-07
**Ubicación:** `apps/frontend/src/features/auth/`

---

## 📋 Índice de Documentación

| Documento | Descripción | Estado |
|-----------|-------------|--------|
| [AUTH-Components.md](./AUTH-Components.md) | Componentes de UI de autenticación | ✅ |
| [AUTH-Store.md](./AUTH-Store.md) | Zustand store de autenticación | ✅ |
| [AUTH-Hooks.md](./AUTH-Hooks.md) | Custom hooks de autenticación | ✅ |
| [AUTH-API.md](./AUTH-API.md) | Cliente API de autenticación | ✅ |
| [AUTH-Flows.md](./AUTH-Flows.md) | Flujos de usuario completos | ✅ |

---

## 🎯 Propósito

Sistema completo de autenticación que maneja:
- Registro de usuarios
- Login/Logout
- Gestión de sesiones con JWT
- Refresh tokens automático
- Recuperación de contraseñas
- Protección de rutas
- Persistencia de sesión

---

## 📚 Referencias a Documentación Base

### Requerimientos
- **Casos de Uso:** [`docs/01-requerimientos/casos-uso/student/UC-STU-001-registro.md`](../../../../01-requerimientos/casos-uso/student/UC-STU-001-registro.md)
  - Registro completo de estudiante
  - Validaciones de formulario
  - Flujo de onboarding

### Especificaciones Técnicas
- **API Spec:** [`docs/02-especificaciones-tecnicas/apis/api-reference/01-AUTH-API.md`](../../../../02-especificaciones-tecnicas/apis/api-reference/01-AUTH-API.md)
  - 15 endpoints documentados
  - Request/Response schemas
  - Error handling

- **Tipos Compartidos:** [`docs/02-especificaciones-tecnicas/tipos-compartidos/TYPES-AUTH.md`](../../../../02-especificaciones-tecnicas/tipos-compartidos/TYPES-AUTH.md)
  - AuthUser, UserRole, UserStatus
  - LoginDto, RegisterDto, AuthResponse
  - Validaciones Zod

- **Trazabilidad:** [`docs/02-especificaciones-tecnicas/trazabilidad/01-foundation-authentication.md`](../../../../02-especificaciones-tecnicas/trazabilidad/01-foundation-authentication.md)
  - Flujo completo Frontend → Backend → Database
  - JWT token management
  - Session handling

- **ADRs:** [`docs/02-especificaciones-tecnicas/adr/ADR-002-jwt-security-implementation.md`](../../../../02-especificaciones-tecnicas/adr/ADR-002-jwt-security-implementation.md)
  - Decisiones de implementación JWT
  - RS256 signing
  - Refresh token rotation

---

## 🏗️ Arquitectura del Feature

### Estructura de Archivos

```
apps/frontend/src/features/auth/
├── api/                    # API clients
│   ├── authApi.ts         # API calls
│   ├── sessionApi.ts      # Session management
│   └── index.ts
├── components/            # UI Components
│   ├── LoginForm.tsx      # Formulario de login
│   ├── RegisterForm.tsx   # Formulario de registro
│   ├── ForgotPasswordForm.tsx
│   ├── ResetPasswordForm.tsx
│   ├── ChangePasswordForm.tsx
│   └── index.ts
├── hooks/                 # Custom hooks
│   ├── useAuth.ts         # Hook principal de auth
│   ├── useUser.ts         # Hook de usuario actual
│   ├── useSession.ts      # Hook de sesión
│   ├── useLogin.ts        # Hook de login
│   ├── useRegister.ts     # Hook de registro
│   └── index.ts
├── store/                 # Zustand store
│   ├── authStore.ts       # Store principal
│   └── index.ts
├── types/                 # TypeScript types
│   ├── auth.types.ts      # Tipos de auth
│   └── index.ts
├── schemas/               # Zod schemas
│   ├── login.schema.ts
│   ├── register.schema.ts
│   └── index.ts
├── providers/             # Context providers
│   ├── AuthProvider.tsx   # Provider de auth
│   └── index.ts
├── mocks/                 # Mock data para testing
│   └── authMocks.ts
├── __tests__/             # Tests
│   ├── authStore.test.ts
│   └── components/
└── index.ts               # Public exports
```

---

## 🔑 Componentes Clave

### 1. AuthStore (Zustand)

**Estado Global:**
```typescript
interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}
```

**Acciones:**
- `login(credentials)` - Iniciar sesión
- `register(userData)` - Registrar usuario
- `logout()` - Cerrar sesión
- `refreshSession()` - Renovar tokens
- `updateUser(userData)` - Actualizar perfil
- `clearError()` - Limpiar errores

**Ver:** [AUTH-Store.md](./AUTH-Store.md)

### 2. Hooks Principales

- **useAuth()** - Hook principal con todas las operaciones
- **useUser()** - Acceso al usuario actual
- **useSession()** - Manejo de sesión activa
- **useLogin()** - Lógica de login con validación
- **useRegister()** - Lógica de registro con validación

**Ver:** [AUTH-Hooks.md](./AUTH-Hooks.md)

### 3. Componentes UI

- **LoginForm** - Formulario de inicio de sesión
- **RegisterForm** - Formulario de registro
- **ForgotPasswordForm** - Recuperar contraseña
- **ResetPasswordForm** - Restablecer contraseña
- **ChangePasswordForm** - Cambiar contraseña

**Ver:** [AUTH-Components.md](./AUTH-Components.md)

### 4. API Client

Métodos principales:
- `authApi.login()` - POST /api/auth/login
- `authApi.register()` - POST /api/auth/register
- `authApi.logout()` - POST /api/auth/logout
- `authApi.refresh()` - POST /api/auth/refresh
- `authApi.me()` - GET /api/auth/me

**Ver:** [AUTH-API.md](./AUTH-API.md)

---

## 🔐 Seguridad

### Tokens JWT

- **Access Token:** 7 días, httpOnly cookie
- **Refresh Token:** 30 días, almacenado en backend
- **Algoritmo:** RS256 (asimétrico)
- **Rotación:** Refresh token rota en cada uso

**Referencia:** [`ADR-002`](../../../../02-especificaciones-tecnicas/adr/ADR-002-jwt-security-implementation.md)

### Protección de Rutas

```typescript
// Componente ProtectedRoute
<ProtectedRoute requiredRole="student">
  <StudentDashboard />
</ProtectedRoute>
```

---

## 🔄 Flujos de Usuario

### 1. Registro Completo

```
Usuario → RegisterForm → useRegister
  → Validación Zod
  → authApi.register()
  → Backend crea usuario
  → authStore.login() automático
  → Redirección a onboarding
```

**Ver detalle:** [AUTH-Flows.md](./AUTH-Flows.md#registro)

### 2. Login

```
Usuario → LoginForm → useLogin
  → Validación Zod
  → authApi.login()
  → Backend valida credenciales
  → authStore.setUser + tokens
  → Persistencia localStorage
  → Redirección según rol
```

**Ver detalle:** [AUTH-Flows.md](./AUTH-Flows.md#login)

### 3. Refresh Automático

```
API request → Interceptor detecta 401
  → authApi.refresh()
  → Nuevo access token
  → Retry request original
  → Si falla: logout automático
```

**Ver detalle:** [AUTH-Flows.md](./AUTH-Flows.md#refresh)

---

## 🧪 Testing

### Cobertura

- **Store:** 85% cobertura (15 tests)
- **Hooks:** 78% cobertura (12 tests)
- **Components:** 82% cobertura (18 tests)
- **API:** 90% cobertura (10 tests)

### Estrategia

- Unit tests con Vitest
- Integration tests con MSW (Mock Service Worker)
- E2E tests con Playwright (flujo completo)

---

## 🔗 Integraciones

### Backend

- **Módulo:** `apps/backend/src/modules/auth/`
- **Endpoints:** 15 endpoints
- **Base de datos:** `auth_management` schema

**Referencias:**
- Backend: [`docs/03-desarrollo/backend/estructura/Modulos-Core.md#1-auth-module`](../../../backend/estructura/Modulos-Core.md#1-auth-module)
- Database: [`docs/03-desarrollo/base-de-datos/ESQUEMA-COMPLETO.md#auth_management`](../../../base-de-datos/ESQUEMA-COMPLETO.md#auth_management)

### Otros Features

- **Gamification:** Inicialización de user stats al registrarse
- **Progress:** User ID para tracking
- **Notifications:** WebSocket authentication

---

## 📊 Métricas

| Métrica | Valor |
|---------|-------|
| Componentes | 5 |
| Hooks | 5 |
| Store slices | 1 |
| API methods | 13 |
| Types | 12 |
| Schemas Zod | 5 |
| Tests | 55 |
| Líneas de código | ~2,500 |

---

## 🚀 Próximos Pasos

### Features Planeadas

- [ ] OAuth integration (Google, Facebook)
- [ ] Magic link login
- [ ] Biometric authentication (web)
- [ ] 2FA (Two-Factor Authentication)
- [ ] Remember me functionality
- [ ] Session analytics

### Mejoras

- [ ] Aumentar cobertura de tests a 90%
- [ ] Agregar rate limiting visual
- [ ] Mejorar UX de error handling
- [ ] Agregar loading states más descriptivos

---

## 📝 Notas de Implementación

### Decisiones Técnicas

1. **Zustand sobre Redux:** Menor boilerplate, mejor DX
2. **Zod para validación:** Type-safe, client + server
3. **React Hook Form:** Mejor performance que Formik
4. **httpOnly cookies:** Prevención XSS

### Lecciones Aprendidas

1. Separar lógica de auth de UI permite reusabilidad
2. Refresh automático mejora UX significativamente
3. Centralizar error handling simplifica debugging
4. Mock Service Worker esencial para testing

---

**Mantenedores:** @frontend-team, @auth-owner
**Última actualización:** 2025-11-07
**Próxima revisión:** Mensual
