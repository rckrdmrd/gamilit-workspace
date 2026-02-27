# ET-AUTH-003: OAuth 2.0 Providers

## 📋 Metadata

| Campo | Valor |
|-------|-------|
| **ID** | ET-AUTH-003 |
| **Módulo** | Autenticación y Autorización |
| **Tipo** | Especificación Técnica |
| **Estado** | ✅ Implementado |
| **Versión** | 1.0 |
| **Fecha creación** | 2025-11-07 |

## 🔗 Referencias

### Requerimiento Funcional
📄 [RF-AUTH-003: Proveedores de Autenticación OAuth](../requirements/RF-AUTH-003-oauth.md)

### Implementación DDL
🗄️ **ENUM Principal:**
```sql
-- apps/database/ddl/00-prerequisites.sql:38-40
DO $$ BEGIN
    CREATE TYPE auth_management.auth_provider AS ENUM (
        'local',     -- Email/password tradicional
        'google',    -- Google OAuth 2.0
        'facebook',  -- Facebook Login
        'apple',     -- Apple Sign In
        'microsoft', -- Microsoft Account
        'github'     -- GitHub OAuth
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;
```

**Tabla de Configuración:**
```sql
-- apps/database/ddl/schemas/auth_management/tables/05-auth_providers.sql
CREATE TABLE auth_management.auth_providers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_name auth_management.auth_provider NOT NULL UNIQUE,
    is_enabled BOOLEAN NOT NULL DEFAULT true,
    client_id TEXT, -- Almacenado encriptado
    client_secret_encrypted TEXT,
    config JSONB, -- Configuración específica del provider
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**Tabla de Vinculación:**
```sql
-- apps/database/ddl/schemas/auth_management/tables/06-linked_providers.sql
CREATE TABLE auth_management.linked_providers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth_management.profiles(user_id) ON DELETE CASCADE,
    provider auth_management.auth_provider NOT NULL,
    provider_user_id TEXT NOT NULL, -- ID del usuario en el provider externo
    provider_email TEXT,
    provider_data JSONB, -- Datos adicionales del provider
    linked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE(user_id, provider),
    UNIQUE(provider, provider_user_id)
);

CREATE INDEX idx_linked_providers_user ON auth_management.linked_providers(user_id);
CREATE INDEX idx_linked_providers_provider ON auth_management.linked_providers(provider, provider_user_id);
```

---

## 🏗️ Arquitectura OAuth

```
┌─────────────────────────────────────────────────────────────────┐
│                        USUARIO FRONTEND                          │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  Login Page                                             │    │
│  │  [Continue with Google] [Continue with Facebook] [...] │    │
│  └───────────────────┬────────────────────────────────────┘    │
└────────────────────────┼────────────────────────────────────────┘
                         │ Click
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                     BACKEND GAMILIT                              │
│  GET /auth/{provider}                                            │
│  ┌──────────────────────────────────────────────────────┐      │
│  │  1. Generar state (CSRF protection)                  │      │
│  │  2. Almacenar state en Redis (5 min TTL)             │      │
│  │  3. Construir authorization URL                      │      │
│  │  4. Redirigir a provider                             │      │
│  └────────────────┬─────────────────────────────────────┘      │
└─────────────────────┼────────────────────────────────────────────┘
                      │ Redirect
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                   OAUTH PROVIDER (Google, etc.)                  │
│  ┌──────────────────────────────────────────────────────┐      │
│  │  Consent Screen                                       │      │
│  │  "Gamilit wants to access:"                          │      │
│  │  ✓ Your email                                        │      │
│  │  ✓ Your name                                         │      │
│  │  ✓ Your profile picture                              │      │
│  │                                                        │      │
│  │  [Allow]  [Cancel]                                   │      │
│  └────────────────┬─────────────────────────────────────┘      │
└─────────────────────┼────────────────────────────────────────────┘
                      │ User clicks Allow
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│              OAUTH PROVIDER → BACKEND CALLBACK                   │
│  GET /auth/{provider}/callback?code=abc123&state=xyz            │
│  ┌──────────────────────────────────────────────────────┐      │
│  │  1. Validar state (CSRF check)                       │      │
│  │  2. Intercambiar code por access_token               │      │
│  │     POST to provider token endpoint                  │      │
│  │  3. Obtener perfil de usuario                        │      │
│  │     GET to provider userinfo endpoint                │      │
│  │  4. Buscar/crear usuario en DB                       │      │
│  │  5. Generar JWT                                      │      │
│  │  6. Redirigir a frontend con token                   │      │
│  └────────────────┬─────────────────────────────────────┘      │
└─────────────────────┼────────────────────────────────────────────┘
                      │ Redirect
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND CALLBACK                             │
│  /auth/callback?token=jwt_token                                 │
│  ┌──────────────────────────────────────────────────────┐      │
│  │  1. Extraer JWT de query params                      │      │
│  │  2. Almacenar en localStorage                        │      │
│  │  3. Configurar axios headers                         │      │
│  │  4. Redirigir a dashboard                            │      │
│  └──────────────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔧 Implementación por Provider

### 1. Google OAuth 2.0

#### Configuración
```typescript
// apps/backend/src/config/oauth.config.ts
export const googleConfig = {
  clientID: process.env.GOOGLE_CLIENT_ID!,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  callbackURL: `${process.env.API_URL}/auth/google/callback`,
  scope: ['profile', 'email'],
};
```

#### Strategy (Passport.js)
```typescript
// apps/backend/src/modules/auth/strategies/google.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { AuthService } from '../services/auth.service';
import { googleConfig } from '@/config/oauth.config';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private authService: AuthService) {
    super(googleConfig);
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const { id, emails, displayName, photos } = profile;

    const user = await this.authService.findOrCreateOAuthUser({
      provider: 'google',
      providerId: id,
      email: emails[0].value,
      name: displayName,
      picture: photos[0]?.value,
    });

    done(null, user);
  }
}
```

#### Endpoints
```typescript
// apps/backend/src/modules/auth/controllers/oauth.controller.ts
@Controller('auth')
export class OAuthController {
  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleLogin() {
    // Passport maneja la redirección
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleCallback(@Req() req, @Res() res) {
    const jwt = await this.authService.generateJWT(req.user);
    res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${jwt}`);
  }
}
```

---

### 2. Apple Sign In

#### Peculiaridades de Apple

**1. Configuración más compleja:**
```typescript
// apps/backend/src/config/oauth.config.ts
import * as fs from 'fs';

export const appleConfig = {
  clientID: process.env.APPLE_SERVICE_ID!, // Service ID
  teamID: process.env.APPLE_TEAM_ID!,
  keyID: process.env.APPLE_KEY_ID!,
  privateKey: fs.readFileSync(process.env.APPLE_PRIVATE_KEY_PATH!, 'utf8'),
  callbackURL: `${process.env.API_URL}/auth/apple/callback`,
  scope: ['name', 'email'],
  passReqToCallback: true,
};
```

**2. Datos solo en primer login:**
```typescript
// apps/backend/src/modules/auth/strategies/apple.strategy.ts
@Injectable()
export class AppleStrategy extends PassportStrategy(Strategy, 'apple') {
  async validate(
    req: Request,
    accessToken: string,
    refreshToken: string,
    idToken: any,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const { sub: appleId } = idToken;

    // Apple solo envía user info en PRIMER login
    const userInfo = req.body?.user
      ? JSON.parse(req.body.user)
      : null;

    // Buscar usuario existente
    let user = await this.authService.findUserByProvider('apple', appleId);

    if (!user) {
      // Primer login - crear usuario con info de Apple
      if (!userInfo) {
        throw new BadRequestException('User info not provided by Apple');
      }

      user = await this.authService.createOAuthUser({
        provider: 'apple',
        providerId: appleId,
        email: userInfo.email,
        name: `${userInfo.name.firstName} ${userInfo.name.lastName}`,
      });
    }

    // Logins subsecuentes - solo tenemos appleId
    done(null, user);
  }
}
```

**3. Email Relay:**
```typescript
// Manejar relay emails de Apple
if (email.includes('@privaterelay.appleid.com')) {
  // Es un relay email - almacenar como email real del usuario
  // Emails enviados a este relay se reenviarán al usuario
  user.email = email;
  user.is_relay_email = true;
}
```

---

### 3. Microsoft Account

```typescript
// apps/backend/src/modules/auth/strategies/microsoft.strategy.ts
import { Strategy } from 'passport-microsoft';

export const microsoftConfig = {
  clientID: process.env.MICROSOFT_CLIENT_ID!,
  clientSecret: process.env.MICROSOFT_CLIENT_SECRET!,
  callbackURL: `${process.env.API_URL}/auth/microsoft/callback`,
  scope: ['user.read'],
  tenant: 'common', // Acepta cuentas personales Y organizacionales
};

@Injectable()
export class MicrosoftStrategy extends PassportStrategy(Strategy, 'microsoft') {
  async validate(accessToken: string, refreshToken: string, profile: any) {
    const { oid, mail, displayName, photos } = profile;

    return await this.authService.findOrCreateOAuthUser({
      provider: 'microsoft',
      providerId: oid,
      email: mail,
      name: displayName,
      picture: photos[0]?.value,
    });
  }
}
```

---

## 🔐 Seguridad

### 1. State Parameter (CSRF Protection)

```typescript
// apps/backend/src/modules/auth/services/oauth-state.service.ts
import { Injectable } from '@nestjs/common';
import { RedisService } from '@/modules/redis/redis.service';
import { randomBytes } from 'crypto';

@Injectable()
export class OAuthStateService {
  constructor(private redis: RedisService) {}

  /**
   * Genera y almacena state para CSRF protection
   */
  async generateState(userId?: string): Promise<string> {
    const state = randomBytes(32).toString('hex');

    await this.redis.set(
      `oauth:state:${state}`,
      JSON.stringify({ userId, createdAt: Date.now() }),
      'EX',
      300, // 5 minutos
    );

    return state;
  }

  /**
   * Valida state recibido del provider
   */
  async validateState(state: string): Promise<boolean> {
    const data = await this.redis.get(`oauth:state:${state}`);

    if (!data) {
      return false;
    }

    // Eliminar state (one-time use)
    await this.redis.del(`oauth:state:${state}`);

    return true;
  }
}
```

### 2. Validación de Tokens

```typescript
// apps/backend/src/modules/auth/services/oauth-validation.service.ts
@Injectable()
export class OAuthValidationService {
  /**
   * Valida token de Google con tokeninfo endpoint
   */
  async validateGoogleToken(accessToken: string): Promise<boolean> {
    try {
      const response = await fetch(
        `https://oauth2.googleapis.com/tokeninfo?access_token=${accessToken}`
      );

      if (!response.ok) {
        return false;
      }

      const data = await response.json();

      // Validar que el token es para nuestra app
      if (data.aud !== process.env.GOOGLE_CLIENT_ID) {
        return false;
      }

      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Valida JWT de Apple
   */
  async validateAppleJWT(idToken: string): Promise<any> {
    const jwksClient = require('jwks-rsa');
    const jwt = require('jsonwebtoken');

    const client = jwksClient({
      jwksUri: 'https://appleid.apple.com/auth/keys',
    });

    const getKey = (header, callback) => {
      client.getSigningKey(header.kid, (err, key) => {
        callback(err, key?.getPublicKey());
      });
    };

    return new Promise((resolve, reject) => {
      jwt.verify(idToken, getKey, {
        issuer: 'https://appleid.apple.com',
        audience: process.env.APPLE_SERVICE_ID,
      }, (err, decoded) => {
        if (err) reject(err);
        else resolve(decoded);
      });
    });
  }
}
```

### 3. Rate Limiting

```typescript
// Prevenir abuse de OAuth endpoints
@UseGuards(ThrottlerGuard)
@Throttle(5, 60) // 5 intentos por minuto
@Get('auth/:provider')
async oauthLogin(@Param('provider') provider: string) {
  // ...
}

@UseGuards(ThrottlerGuard)
@Throttle(10, 60) // 10 callbacks por minuto
@Get('auth/:provider/callback')
async oauthCallback(@Param('provider') provider: string) {
  // ...
}
```

---

## 📊 Métricas y Monitoreo

### Eventos a Trackear

```typescript
// apps/backend/src/modules/auth/services/oauth-metrics.service.ts
@Injectable()
export class OAuthMetricsService {
  async trackOAuthEvent(event: string, provider: string, metadata?: any) {
    await this.metricsService.increment(`oauth.${event}`, {
      provider,
      ...metadata,
    });
  }

  // Eventos:
  // - oauth.login_initiated
  // - oauth.login_success
  // - oauth.login_failed
  // - oauth.account_linked
  // - oauth.token_validation_failed
}
```

### Dashboard Metrics

Métricas importantes para monitorear:
- **Success Rate** por provider (%)
- **Average Response Time** del flujo OAuth
- **Error Rate** por provider
- **Token Validation Failures**
- **Account Linking Rate**

---

## 🧪 Testing

### Test Case: Login con Google exitoso
```typescript
test('User can login with Google OAuth', async () => {
  // Mock Google OAuth
  mockPassportStrategy('google', {
    id: 'google_123',
    emails: [{ value: 'test@gmail.com' }],
    displayName: 'Test User',
    photos: [{ value: 'https://photo.url' }],
  });

  // Iniciar flujo
  const loginResponse = await request(app.getHttpServer())
    .get('/auth/google')
    .expect(302); // Redirect

  // Simular callback
  const callbackResponse = await request(app.getHttpServer())
    .get('/auth/google/callback')
    .query({ code: 'mock_code', state: 'valid_state' })
    .expect(302); // Redirect to frontend

  // Verificar JWT en redirect
  const redirectUrl = callbackResponse.headers.location;
  expect(redirectUrl).toContain('/auth/callback?token=');

  // Extraer y validar JWT
  const token = new URL(redirectUrl).searchParams.get('token');
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  expect(decoded.sub).toBeDefined();
  expect(decoded.email).toBe('test@gmail.com');
});
```

---

## 📚 Referencias

### Documentos Relacionados
- 📄 [RF-AUTH-003: Proveedores OAuth](../requirements/RF-AUTH-003-oauth.md)

### Documentación Oficial
- [OAuth 2.0 RFC 6749](https://datatracker.ietf.org/doc/html/rfc6749)
- [Google OAuth Docs](https://developers.google.com/identity/protocols/oauth2)
- [Apple Sign In Docs](https://developer.apple.com/sign-in-with-apple/)

---

**Documento:** `docs/20-architecture/01-autenticacion-autorizacion/ET-AUTH-003-oauth.md`
**Ruta relativa desde docs/:** `10-requirements/epics/EPIC-GAM-F1-AUTH/specifications/ET-AUTH-003-oauth.md`
