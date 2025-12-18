# RF-AUTH-003: Proveedores de Autenticación OAuth

## 📋 Metadata

| Campo | Valor |
|-------|-------|
| **ID** | RF-AUTH-003 |
| **Módulo** | Autenticación y Autorización |
| **Prioridad** | Alta |
| **Estado** | ✅ Implementado |
| **Versión** | 1.0 |
| **Fecha creación** | 2025-11-07 |
| **Última actualización** | 2025-11-07 |

## 🔗 Referencias

### Especificación Técnica
📐 [ET-AUTH-003: OAuth 2.0 Providers](../../02-especificaciones-tecnicas/01-autenticacion-autorizacion/ET-AUTH-003-oauth.md)

### Implementación DDL
🗄️ **ENUM Canónico:**
- **Ubicación:** `apps/database/ddl/00-prerequisites.sql:38-40`
- **Tipo:** `public.auth_provider`
- **Valores:** `local`, `google`, `facebook`, `apple`, `microsoft`, `github`

🗄️ **Tablas que usan el ENUM:**
1. `auth_management.auth_providers` → `apps/database/ddl/schemas/auth_management/tables/05-auth_providers.sql`
   - Columna: `provider_name public.auth_provider NOT NULL`
   - Configuración de cada proveedor OAuth

2. `auth_management.profiles` → `apps/database/ddl/schemas/auth_management/tables/03-profiles.sql`
   - Columna: `auth_provider public.auth_provider DEFAULT 'local'`
   - Tracking del origen de registro

🗄️ **Funciones:**
- `auth.get_available_providers()` → Retorna lista de proveedores habilitados
- `auth.validate_oauth_token()` → Valida tokens OAuth

### Backend
💻 **Implementación:**
- **Enum:** `apps/backend/src/modules/auth/enums/auth-provider.enum.ts`
- **Strategies (Passport.js):**
  - `apps/backend/src/modules/auth/strategies/google.strategy.ts`
  - `apps/backend/src/modules/auth/strategies/facebook.strategy.ts`
  - `apps/backend/src/modules/auth/strategies/apple.strategy.ts`
  - `apps/backend/src/modules/auth/strategies/microsoft.strategy.ts`
  - `apps/backend/src/modules/auth/strategies/github.strategy.ts`
- **Config:** `apps/backend/src/config/oauth.config.ts`
- **Controllers:** `apps/backend/src/modules/auth/controllers/oauth.controller.ts`
- **Guards:** `apps/backend/src/modules/auth/guards/oauth.guard.ts`

### Frontend
🎨 **Componentes:**
- **Types:** `apps/frontend/src/types/auth.types.ts`
- **Componentes:**
  - `apps/frontend/src/components/auth/LoginProviderButtons.tsx`
  - `apps/frontend/src/components/auth/ProviderIcon.tsx`
  - `apps/frontend/src/components/auth/OAuthCallback.tsx`
  - `apps/frontend/src/components/auth/LoginForm.tsx`

### Mapeo Completo
📊 [Ver mapeo completo: Requerimientos → Implementación](../../03-desarrollo/base-de-datos/MAPEO-REQUERIMIENTOS-IMPLEMENTACION.md#13-proveedores-de-autenticación-oauth)

---

## 📝 Descripción del Requerimiento

### Contexto

La autenticación moderna requiere soportar múltiples métodos de inicio de sesión para mejorar la experiencia del usuario y reducir fricción en el onboarding. Los usuarios esperan poder registrarse con sus cuentas existentes de servicios populares.

### Necesidad del Negocio

**Problema:**
Depender únicamente de autenticación local (email/password):
- Aumenta fricción en el registro (crear contraseña, verificar email)
- Mayor probabilidad de abandono durante onboarding
- Usuarios olvidan contraseñas frecuentemente
- No aprovecha la confianza en proveedores establecidos

**Solución:**
Implementar OAuth 2.0 con 6 proveedores de autenticación que cubren >90% de usuarios potenciales:
- **Local:** Para usuarios que prefieren control completo
- **Google:** Mayor penetración en educación (Google Workspace)
- **Facebook:** Alta penetración en México
- **Apple:** Requerido para iOS, énfasis en privacidad
- **Microsoft:** Común en instituciones educativas
- **GitHub:** Para desarrolladores y usuarios técnicos

---

## 🎯 Requerimiento Funcional

### RF-AUTH-003.1: Proveedores Soportados

El sistema **DEBE** soportar 6 proveedores de autenticación:

#### 1. Local (`local`) 🔐
**Descripción:** Autenticación tradicional con email y contraseña

**Características:**
- Email + contraseña almacenados en autenticación estándar
- Contraseña hasheada con bcrypt
- Verificación de email obligatoria
- Recuperación de contraseña vía email

**Flujo de Registro:**
```
1. Usuario ingresa email + contraseña
2. Sistema valida formato y fortaleza de contraseña
3. Sistema crea cuenta en auth.users (sistema)
4. Sistema envía email de verificación
5. Estado inicial: pending
6. Usuario verifica email → estado: active
```

**Ventajas:**
- ✅ Control completo de credenciales
- ✅ No depende de terceros
- ✅ Funciona offline (una vez autenticado)

**Desventajas:**
- ❌ Usuario debe recordar contraseña
- ❌ Mayor fricción en registro
- ❌ Requiere verificación de email

**Casos de Uso:**
- Usuarios que priorizan privacidad
- Instituciones con políticas estrictas de seguridad
- Usuarios sin cuentas en otros proveedores

---

#### 2. Google (`google`) 🔴🟡🟢🔵
**Descripción:** OAuth 2.0 con Google

**Características:**
- Integración con Google Workspace (común en educación)
- Obtiene: email, nombre, foto de perfil
- No requiere contraseña en Gamilit

**Configuración OAuth:**
```javascript
{
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: 'https://gamilit.com/auth/google/callback',
  scope: ['profile', 'email']
}
```

**Flujo de Autenticación:**
```
1. Usuario hace click en "Continuar con Google"
2. Redirige a consent screen de Google
3. Usuario autoriza permisos (profile, email)
4. Google redirige a callback con authorization code
5. Backend intercambia code por access token
6. Backend obtiene perfil de usuario vía Google People API
7. Sistema busca/crea usuario con email de Google
8. Sistema crea sesión y retorna JWT
```

**Datos Obtenidos:**
- ✅ Email (verificado por Google)
- ✅ Nombre completo
- ✅ Foto de perfil (avatar URL)
- ✅ Google ID (para vincular cuenta)

**Ventajas:**
- ✅ Sin fricción (1 click)
- ✅ Email pre-verificado
- ✅ Alta confianza del usuario
- ✅ Común en educación (Google Classroom)

**Restricciones:**
- Solo emails públicos (no G Suite corporativos con restricciones)

---

#### 3. Facebook (`facebook`) 💙
**Descripción:** OAuth 2.0 con Facebook/Meta

**Características:**
- Alta penetración en México (~70% de usuarios de internet)
- Obtiene: email, nombre, foto

**Configuración OAuth:**
```javascript
{
  clientID: process.env.FACEBOOK_APP_ID,
  clientSecret: process.env.FACEBOOK_APP_SECRET,
  callbackURL: 'https://gamilit.com/auth/facebook/callback',
  scope: ['public_profile', 'email'],
  profileFields: ['id', 'emails', 'name', 'picture']
}
```

**Consideraciones Especiales:**
- Email puede no estar verificado → Sistema requiere verificación adicional
- Algunos usuarios no tienen email en Facebook → Solicitar email alternativo

**Ventajas:**
- ✅ Alta adopción en México
- ✅ Familiar para usuarios no técnicos

**Desventajas:**
- ⚠️ Email no siempre verificado
- ⚠️ Perfil puede ser incompleto

---

#### 4. Apple (`apple`)
**Descripción:** Sign in with Apple (OAuth 2.0)

**Características:**
- **Requerido** para apps iOS (política de Apple)
- Énfasis en privacidad
- Permite ocultar email real (relay email)

**Configuración OAuth:**
```javascript
{
  clientID: process.env.APPLE_SERVICE_ID,
  teamID: process.env.APPLE_TEAM_ID,
  keyID: process.env.APPLE_KEY_ID,
  privateKey: process.env.APPLE_PRIVATE_KEY,
  callbackURL: 'https://gamilit.com/auth/apple/callback',
  scope: ['name', 'email']
}
```

**Peculiaridades de Apple:**

1. **Email Relay (Hide My Email):**
   - Usuario puede ocultar email real
   - Apple proporciona relay: `xyz@privaterelay.appleid.com`
   - Emails enviados a relay se reenvían al email real
   - **Sistema debe soportar relay emails**

2. **Datos solo en primer login:**
   - Nombre y email solo se proporcionan en **primer login**
   - Logins subsecuentes solo retornan Apple ID
   - **Sistema debe almacenar datos en primer login**

3. **Token especial:**
   - Usa JWT firmado (no access token tradicional)
   - Requiere validación de firma

**Flujo Especial:**
```typescript
// Primer login
{
  id: 'apple_user_id',
  email: 'user@example.com', // o relay
  name: { firstName: 'Juan', lastName: 'Pérez' }
}

// Logins subsecuentes
{
  id: 'apple_user_id'
  // No email, no name
}
```

**Ventajas:**
- ✅ Requerido para iOS
- ✅ Alta confianza en privacidad
- ✅ Email verificado por Apple

**Complejidad:**
- ⚠️ Configuración más compleja (certificates, keys)
- ⚠️ Datos solo en primer login

---

#### 5. Microsoft (`microsoft`) 🟦
**Descripción:** OAuth 2.0 con Microsoft Account / Azure AD

**Características:**
- Común en instituciones educativas (Office 365 Education)
- Soporta cuentas personales y organizacionales
- Obtiene: email, nombre, foto

**Configuración OAuth:**
```javascript
{
  clientID: process.env.MICROSOFT_CLIENT_ID,
  clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
  callbackURL: 'https://gamilit.com/auth/microsoft/callback',
  scope: ['User.Read'],
  tenant: 'common' // Acepta cuentas personales y organizacionales
}
```

**Tipos de Cuenta:**
- **Personal:** `@outlook.com`, `@hotmail.com`, `@live.com`
- **Organizacional:** `@edu.mx`, `@universidad.edu`, etc.

**Ventajas:**
- ✅ Común en instituciones educativas
- ✅ Integración con Office 365
- ✅ Soporte para cuentas institucionales

**Consideraciones:**
- Algunas organizaciones restringen OAuth externo
- Verificar permisos de tenant organization

---

#### 6. GitHub (`github`) 🐙
**Descripción:** OAuth 2.0 con GitHub

**Características:**
- Para desarrolladores y usuarios técnicos
- Obtiene: email, nombre, username, avatar
- Útil para contenido de programación/lógica

**Configuración OAuth:**
```javascript
{
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL: 'https://gamilit.com/auth/github/callback',
  scope: ['user:email']
}
```

**Datos Obtenidos:**
- ✅ Username (único, útil para mostrar)
- ✅ Email (puede requerir scope adicional si es privado)
- ✅ Avatar
- ✅ Bio

**Ventajas:**
- ✅ Preferido por usuarios técnicos
- ✅ Username como identificador amigable

**Limitación:**
- Email puede ser privado → Requiere scope `user:email`

---

### RF-AUTH-003.2: Flujo OAuth Unificado

Todos los proveedores OAuth **DEBEN** seguir este flujo:

```
┌─────────────┐
│   Usuario   │
│ hace click  │
│ en provider │
└──────┬──────┘
       │
       ▼
┌──────────────────────────────────────┐
│ Frontend: Redirige a OAuth provider  │
│ URL: /auth/{provider}                │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│ Provider: Consent screen             │
│ Usuario autoriza permisos            │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│ Provider: Redirige a callback        │
│ Con authorization code               │
│ URL: /auth/{provider}/callback?code=│
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│ Backend: Intercambia code por token │
│ Obtiene perfil de usuario            │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│ Backend: Busca/crea usuario          │
│ - Buscar por email                   │
│ - Si no existe → crear               │
│ - Si existe → actualizar profile     │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│ Backend: Crea sesión                 │
│ Genera JWT con user_id + role        │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│ Backend: Redirige a frontend         │
│ Con JWT en query param o cookie      │
│ URL: /auth/callback?token={jwt}     │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│ Frontend: Almacena JWT               │
│ Redirige a dashboard                 │
└──────────────────────────────────────┘
```

---

### RF-AUTH-003.3: Vinculación de Cuentas

Usuario **PUEDE** vincular múltiples proveedores a una cuenta:

**Escenario:**
1. Usuario se registra con Google → email: `juan@gmail.com`
2. Más tarde, intenta login con Facebook → mismo email: `juan@gmail.com`
3. Sistema detecta email existente
4. Sistema ofrece vincular cuentas

**Flujo de Vinculación:**
```typescript
// Usuario ya tiene cuenta con email X
const existingUser = await findUserByEmail(oauthProfile.email);

if (existingUser && existingUser.auth_provider !== currentProvider) {
  // Mostrar modal: "Ya tienes cuenta con {existingProvider}. ¿Vincular?"

  if (userConfirms) {
    // Añadir nuevo provider a auth_providers
    await linkProvider(existingUser.id, currentProvider, oauthProfile);

    // Usuario ahora puede usar cualquiera de los proveedores
  }
}
```

**Tabla de Vinculación:**
```sql
-- auth_management.linked_providers
CREATE TABLE auth_management.linked_providers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth_management.profiles(user_id),
    provider public.auth_provider NOT NULL,
    provider_user_id TEXT NOT NULL, -- ID del usuario en el provider
    linked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE(user_id, provider),
    UNIQUE(provider, provider_user_id)
);
```

---

### RF-AUTH-003.4: Manejo de Errores OAuth

El sistema **DEBE** manejar casos de error:

#### 1. Usuario Cancela Autorización
```
Provider → callback?error=access_denied

Sistema → Redirige a login con mensaje:
"Cancelaste la autorización. Intenta de nuevo o usa otro método."
```

#### 2. Email No Proporcionado
```
Provider → perfil sin email

Sistema → Solicita email al usuario:
"Necesitamos tu email para continuar. Por favor ingresa uno."
```

#### 3. Email Ya Registrado con Otro Provider
```
Sistema → Modal:
"Ya tienes cuenta con {provider1}. ¿Deseas vincular {provider2}?"
[Vincular] [Cancelar]
```

#### 4. Token Inválido/Expirado
```
Sistema → Reintenta obtener token
Si falla 3 veces → Error genérico:
"Error al autenticar. Intenta de nuevo."
```

#### 5. Provider Temporalmente No Disponible
```
Sistema → Mensaje amigable:
"El servicio de {provider} no está disponible. Intenta otro método."
```

---

## 📊 Casos de Uso

### UC-AUTH-005: Usuario se registra con Google
**Actor:** Usuario nuevo
**Precondiciones:** Usuario tiene cuenta de Google

**Flujo:**
1. Usuario visita página de registro
2. Usuario hace click en "Continuar con Google"
3. Frontend redirige a: `https://gamilit.com/auth/google`
4. Backend redirige a Google consent screen
5. Usuario selecciona cuenta de Google
6. Usuario autoriza permisos (profile, email)
7. Google redirige a: `/auth/google/callback?code=abc123`
8. Backend intercambia code por access token
9. Backend obtiene perfil de Google:
   ```json
   {
     "id": "google_user_id",
     "email": "juan@gmail.com",
     "name": "Juan Pérez",
     "picture": "https://..."
   }
   ```
10. Backend busca usuario por email → No existe
11. Backend crea nuevo usuario:
    ```sql
    INSERT INTO auth_management.profiles (
        user_id, email, display_name, avatar_url,
        auth_provider, status, role
    ) VALUES (
        gen_random_uuid(),
        'juan@gmail.com',
        'Juan Pérez',
        'https://...',
        'google',
        'active', -- Pre-verificado por Google
        'student'
    );
    ```
12. Backend genera JWT
13. Backend redirige a: `/auth/callback?token={jwt}`
14. Frontend almacena JWT en localStorage
15. Frontend redirige a dashboard

**Resultado:** Usuario registrado y autenticado con Google, sin crear contraseña

---

### UC-AUTH-006: Usuario inicia sesión con Apple ID
**Actor:** Usuario existente (registrado previamente con local)
**Precondiciones:** Usuario tiene cuenta local, quiere vincular Apple

**Flujo:**
1. Usuario en configuración de cuenta
2. Usuario hace click en "Vincular Apple ID"
3. Sistema inicia flujo OAuth con Apple
4. Usuario autoriza en Apple
5. Apple redirige con authorization code
6. Backend intercambia code por token
7. Backend obtiene perfil:
   ```json
   {
     "id": "apple_user_id",
     "email": "juan@privaterelay.appleid.com", // Relay
     "name": { "firstName": "Juan", "lastName": "Pérez" }
   }
   ```
8. Backend detecta que usuario ya está autenticado
9. Backend crea vinculación:
   ```sql
   INSERT INTO auth_management.linked_providers (
       user_id, provider, provider_user_id
   ) VALUES (
       current_user_id,
       'apple',
       'apple_user_id'
   );
   ```
10. Sistema muestra notificación: "Apple ID vinculado exitosamente"

**Resultado:** Usuario puede usar Apple ID o local para login futuro

---

### UC-AUTH-007: Error - Email ya registrado con otro provider
**Actor:** Usuario
**Precondiciones:** Usuario se registró previamente con Google

**Flujo:**
1. Usuario hace click en "Continuar con Facebook"
2. Usuario autoriza en Facebook
3. Backend obtiene perfil de Facebook → email: `juan@gmail.com`
4. Backend busca usuario por email → **Existe** (registrado con Google)
5. Backend verifica que `auth_provider` es diferente: `google` ≠ `facebook`
6. Frontend muestra modal:
   ```
   Ya tienes una cuenta con Google

   ¿Deseas vincular tu cuenta de Facebook?

   [Vincular Cuentas] [Cancelar]
   ```
7. Usuario hace click en "Vincular Cuentas"
8. Sistema vincula Facebook a cuenta existente
9. Usuario puede usar Google o Facebook para futuros logins

**Resultado:** Cuentas vinculadas, usuario tiene múltiples métodos de login

---

## 🔐 Consideraciones de Seguridad

### 1. Validación de Tokens

**SIEMPRE validar tokens con el provider:**
```typescript
async function validateOAuthToken(provider: string, token: string) {
  switch (provider) {
    case 'google':
      // Validar con Google tokeninfo endpoint
      const response = await fetch(
        `https://oauth2.googleapis.com/tokeninfo?access_token=${token}`
      );
      if (!response.ok) throw new UnauthorizedException();
      break;

    case 'apple':
      // Validar firma JWT de Apple
      const decoded = await verifyAppleJWT(token);
      if (!decoded) throw new UnauthorizedException();
      break;

    // ... otros providers
  }
}
```

### 2. State Parameter (CSRF Protection)

Usar `state` parameter para prevenir CSRF:
```typescript
// Antes de redirigir a provider
const state = generateRandomString(32);
await storeState(userId, state, 300); // 5 min expiration

// Redirigir a provider con state
redirect(`${providerAuthUrl}?state=${state}&...`);

// En callback, validar state
const receivedState = req.query.state;
const storedState = await getStoredState(userId);

if (receivedState !== storedState) {
  throw new ForbiddenException('Invalid state');
}
```

### 3. Rate Limiting

Prevenir abuse de OAuth endpoints:
```typescript
@UseGuards(ThrottlerGuard)
@Throttle(5, 60) // 5 intentos por minuto
@Get('auth/:provider')
async oauthLogin(@Param('provider') provider: string) {
  // ...
}
```

### 4. Validación de Redirect URI

**CRÍTICO:** Validar redirect URIs para prevenir Open Redirect:
```typescript
const allowedRedirects = [
  'https://gamilit.com/auth/callback',
  'http://localhost:3000/auth/callback', // Solo en dev
];

if (!allowedRedirects.includes(redirectUri)) {
  throw new BadRequestException('Invalid redirect URI');
}
```

### 5. Almacenamiento Seguro de Secrets

**NUNCA hardcodear secrets:**
```typescript
// ❌ MAL
const googleClientSecret = 'abc123...';

// ✅ BIEN
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

// Validar que existan al iniciar
if (!googleClientSecret) {
  throw new Error('GOOGLE_CLIENT_SECRET not configured');
}
```

---

## ✅ Criterios de Aceptación

### AC-001: Proveedores Configurados
- [x] 6 proveedores configurados en backend
- [x] Credentials almacenados en variables de entorno
- [x] Callbacks registrados en cada provider

### AC-002: OAuth Flows Funcionales
- [x] Usuario puede registrarse con cualquier provider
- [x] Usuario puede iniciar sesión con cualquier provider
- [x] Redirect correctamente después de auth
- [x] JWT generado con user_id y role

### AC-003: Vinculación de Cuentas
- [x] Sistema detecta email duplicado
- [x] Modal de vinculación se muestra
- [x] Vinculación funciona correctamente
- [x] Usuario puede usar múltiples providers

### AC-004: Manejo de Errores
- [x] Error de cancelación manejado
- [x] Email faltante solicitado
- [x] Token inválido manejado
- [x] Provider no disponible manejado

### AC-005: Seguridad
- [x] Tokens validados con provider
- [x] State parameter implementado
- [x] Rate limiting en endpoints OAuth
- [x] Redirect URIs validados
- [x] Secrets en variables de entorno

### AC-006: UI/UX
- [x] Botones de providers visibles en login/registro
- [x] Iconos de cada provider correctos
- [x] Loading states durante OAuth flow
- [x] Mensajes de error amigables

---

## 🧪 Testing

### Test Case 1: Registro exitoso con Google
```typescript
test('User can register with Google', async () => {
  // Mock Google OAuth response
  mockGoogleOAuth({
    id: 'google_123',
    email: 'test@gmail.com',
    name: 'Test User',
    picture: 'https://...',
  });

  const response = await request(app.getHttpServer())
    .get('/auth/google/callback')
    .query({ code: 'mock_code' });

  expect(response.status).toBe(302); // Redirect
  expect(response.headers.location).toContain('/auth/callback?token=');

  // Verificar usuario creado
  const user = await getUserByEmail('test@gmail.com');
  expect(user).toBeDefined();
  expect(user.auth_provider).toBe('google');
  expect(user.status).toBe('active'); // Pre-verified
});
```

### Test Case 2: Vinculación de cuentas
```typescript
test('Can link multiple OAuth providers to same account', async () => {
  // Crear usuario con Google
  const user = await createUserWithProvider({
    email: 'test@example.com',
    provider: 'google',
  });

  // Intentar login con Facebook (mismo email)
  await loginAs(user);

  mockFacebookOAuth({
    id: 'fb_123',
    email: 'test@example.com',
  });

  const response = await request(app.getHttpServer())
    .get('/auth/facebook/callback')
    .query({ code: 'mock_code' });

  // Verificar vinculación
  const linkedProviders = await getLinkedProviders(user.id);
  expect(linkedProviders).toHaveLength(2);
  expect(linkedProviders).toContainEqual(
    expect.objectContaining({ provider: 'google' })
  );
  expect(linkedProviders).toContainEqual(
    expect.objectContaining({ provider: 'facebook' })
  );
});
```

### Test Case 3: Error - Usuario cancela OAuth
```typescript
test('Handles OAuth cancellation gracefully', async () => {
  const response = await request(app.getHttpServer())
    .get('/auth/google/callback')
    .query({ error: 'access_denied' });

  expect(response.status).toBe(302);
  expect(response.headers.location).toContain('/login');
  expect(response.headers.location).toContain('error=cancelled');
});
```

---

## 📚 Referencias Adicionales

### Documentos Relacionados
- 📄 [RF-AUTH-001: Sistema de Roles](./RF-AUTH-001-roles.md)
- 📄 [RF-AUTH-002: Estados de Cuenta](./RF-AUTH-002-estados-cuenta.md)

### Documentación OAuth
- [OAuth 2.0 RFC](https://datatracker.ietf.org/doc/html/rfc6749)
- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Facebook Login Documentation](https://developers.facebook.com/docs/facebook-login)
- [Sign in with Apple Documentation](https://developer.apple.com/sign-in-with-apple/)
- [Microsoft Identity Platform](https://docs.microsoft.com/en-us/azure/active-directory/develop/)
- [GitHub OAuth Documentation](https://docs.github.com/en/developers/apps/building-oauth-apps)

### Seguridad
- [OWASP: Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [OAuth 2.0 Security Best Practices](https://datatracker.ietf.org/doc/html/draft-ietf-oauth-security-topics)

---

## 📅 Historial de Cambios

| Versión | Fecha | Autor | Cambios |
|---------|-------|-------|---------|
| 1.0 | 2025-11-07 | Database Team | Creación inicial del requerimiento |

---

**Documento:** `docs/01-requerimientos/01-autenticacion-autorizacion/RF-AUTH-003-oauth.md`
**Ruta relativa desde docs/:** `01-requerimientos/01-autenticacion-autorizacion/RF-AUTH-003-oauth.md`
