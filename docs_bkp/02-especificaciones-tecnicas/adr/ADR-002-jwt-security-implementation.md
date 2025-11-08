# ADR-002: JWT Security Implementation

**Fecha:** 2025-10-28
**Estado:** ✅ Aceptado
**Autores:** Security Team, Backend Lead
**Impacto:** Alto - Seguridad de autenticación

---

## 🔗 Trazabilidad

**Casos de uso relacionados:**
- [UC-STU-001: Registro de estudiante](../../../01-requerimientos/casos-uso/student/UC-STU-001-registro.md) - Emisión de tokens JWT post-registro

**User Stories:**
- [US-FUND-001: Autenticación básica JWT](../../../04-planificacion/01-alcance-inicial/EAI-001-fundamentos/historias/US-FUND-001-autenticacion-basica-jwt.md) - Implementación de sistema JWT (Access 15min + Refresh 30 días)
- [US-FUND-005: Sistema de sesiones y estado](../../../04-planificacion/01-alcance-inicial/EAI-001-fundamentos/historias/US-FUND-005-sistema-sesiones-estado.md) - Refresh token rotation

**Épicas:**
- [EAI-001: Fundamentos](../../../04-planificacion/01-alcance-inicial/EAI-001-fundamentos/_MAP.md) - Autenticación y autorización base

**Especificaciones técnicas relacionadas:**
- [Sistema de Seguridad](../seguridad/SISTEMA-SEGURIDAD.md) - Arquitectura de seguridad completa (5 capas)
- [Backend Architecture](../arquitectura/BACKEND-ARCHITECTURE.md) - Middleware de autenticación JWT

**ADRs relacionados:**
- [ADR-001: Email Verification Removal](./ADR-001-email-verification-removal.md) - Simplificación del flujo de registro
- [ADR-003: RLS vs App-Layer Authorization](./ADR-003-rls-vs-app-layer-authorization.md) - Complementa con RLS en PostgreSQL
- [ADR-005: Multi-tenancy Implementation](./ADR-005-multi-tenancy-implementation.md) - Context de tenant en JWT payload

**Requerimientos funcionales:**
- FERPA compliance (datos educativos sensibles)
- Multi-tenant con aislamiento por organización
- Roles: Student, Teacher, Admin, Super Admin

---

## Contexto

GAMILIT es una plataforma educativa multi-tenant que requiere autenticación segura y escalable para estudiantes, maestros y administradores. El sistema maneja sesiones de usuario de larga duración y necesita soportar:

**Requisitos del sistema:**
- Autenticación stateless para escalar horizontalmente
- Soporte multi-tenant (aislamiento por organización)
- Diferentes roles de usuario (Student, Teacher, Admin, Super Admin)
- Sesiones persistentes entre dispositivos
- API RESTful para web y futuras apps móviles
- Revocación de tokens en caso de compromiso

**Contexto de seguridad:**
- Datos educativos sensibles (FERPA compliance en EE.UU.)
- Acceso desde múltiples dispositivos (casa, escuela, biblioteca)
- Usuarios menores de edad con supervisión institucional
- Necesidad de auditoría de accesos

---

## Problema

La implementación de autenticación debe resolver múltiples desafíos de seguridad:

1. **Escalabilidad:** Sesiones server-side requieren sticky sessions o store compartido
2. **Seguridad:** Tokens deben ser imposibles de falsificar
3. **Revocación:** Necesidad de invalidar sesiones comprometidas
4. **Experiencia de usuario:** Balance entre seguridad y conveniencia (no re-login frecuente)
5. **Multi-dispositivo:** Misma sesión accesible desde varios dispositivos
6. **Auditoría:** Tracking de autenticación por compliance

**Preguntas clave:**
- ¿Cómo manejar tokens de larga duración sin comprometer seguridad?
- ¿Cómo revocar acceso inmediatamente si es necesario?
- ¿Dónde almacenar tokens en el frontend de forma segura?
- ¿Qué algoritmo de firma usar para JWT?

---

## Decisión

**Implementar autenticación basada en JWT con refresh token rotation.**

**Arquitectura seleccionada:**
- **Access Tokens:** JWT cortos firmados con RS256
- **Refresh Tokens:** Tokens opacos de larga duración con rotación
- **Storage:** httpOnly cookies para máxima seguridad
- **Algoritmo:** RS256 (asymmetric) para permitir verificación sin secreto compartido

**Flujo de autenticación:**
```
1. Login → Access Token (15 min) + Refresh Token (30 días)
2. Request API → Bearer Access Token en Authorization header
3. Token expira → Frontend usa Refresh Token para obtener nuevo Access Token
4. Refresh usado → Nuevo Refresh Token emitido (rotation)
5. Logout → Refresh Token invalidado en base de datos
```

---

## Alternativas Consideradas

### Opción 1: JWT Simple (Solo Access Token)

**Descripción:** Un solo JWT de larga duración (7-30 días).

**Pros:**
- Implementación simple
- Sin complejidad de refresh
- Stateless al 100%

**Contras:**
- ❌ Imposible revocar tokens antes de expiración
- ❌ Si token es comprometido, atacante tiene acceso por días
- ❌ Violación de principio de least privilege (token de larga duración)

**Decisión:** ❌ **Rechazada** - Riesgo de seguridad inaceptable

---

### Opción 2: Session-Based Authentication

**Descripción:** Sesiones tradicionales server-side con cookies de sesión.

**Pros:**
- Revocación inmediata
- Implementación conocida
- Control total sobre sesiones

**Contras:**
- ❌ Requiere session store (Redis) como punto único de fallo
- ❌ Sticky sessions o session replication en múltiples instancias
- ❌ No escalable para microservicios futuros
- ❌ Complejidad en deployment

**Decisión:** ❌ **Rechazada** - Escalabilidad limitada

---

### Opción 3: JWT con Refresh Tokens (SELECCIONADA)

**Descripción:** Access tokens cortos + refresh tokens rotables almacenados en DB.

**Pros:**
- ✅ Access tokens stateless (escalabilidad)
- ✅ Refresh tokens revocables (seguridad)
- ✅ Balance entre conveniencia y seguridad
- ✅ Estándar de industria (OAuth 2.0 pattern)

**Contras:**
- ⚠️ Complejidad media de implementación
- ⚠️ Requiere tabla de refresh tokens en DB
- ⚠️ Lógica de rotación debe ser robusta

**Decisión:** ✅ **Aceptada** - Mejor balance seguridad/escalabilidad

---

## Implementación

### Access Tokens

**Características:**
```typescript
{
  algorithm: 'RS256',
  expiresIn: '15m',
  issuer: 'gamilit-api',
  audience: 'gamilit-web'
}
```

**Payload Structure:**
```json
{
  "sub": "user-uuid",
  "email": "student@school.edu",
  "role": "student",
  "tenant_id": "org-uuid",
  "iat": 1698765432,
  "exp": 1698766332,
  "iss": "gamilit-api",
  "aud": "gamilit-web"
}
```

**Firma:**
- Algoritmo: **RS256** (RSA Signature with SHA-256)
- Private key: Almacenada en secret manager (nunca en código)
- Public key: Distribuida a servicios que validan tokens
- Rotación de keys: Cada 6 meses + ante compromiso

**¿Por qué RS256 vs HS256?**
- HS256 requiere secreto compartido → riesgo si múltiples servicios
- RS256 permite verificación con public key → zero-trust architecture
- RS256 facilita key rotation sin downtime

---

### Refresh Tokens

**Características:**
```typescript
{
  length: 64,
  algorithm: 'crypto.randomBytes',
  expiresIn: '30d',
  storage: 'postgres',
  hashing: 'bcrypt'
}
```

**Tabla de base de datos:**
```sql
CREATE TABLE refresh_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash VARCHAR(255) NOT NULL,  -- bcrypt hash
  device_fingerprint VARCHAR(255),   -- browser/device info
  ip_address INET,
  user_agent TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_used_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,

  INDEX idx_refresh_tokens_user_id (user_id),
  INDEX idx_refresh_tokens_expires_at (expires_at) WHERE revoked_at IS NULL
);
```

**Rotación de tokens:**
1. Cliente usa refresh token
2. Backend valida y marca como "usado"
3. Backend genera NUEVO refresh token
4. Retorna nuevo access + refresh token
5. Token anterior invalidado (revoked_at = NOW())

**Detección de replay attacks:**
```typescript
// Si token ya fue usado (last_used_at existe y es reciente)
// → Posible robo de token
// → Revocar TODOS los refresh tokens del usuario
// → Forzar re-login
```

---

### Token Storage

**Frontend:**
- **Access Token:** `localStorage` o `sessionStorage`
  - Accesible por JavaScript (necesario para llamadas API)
  - Expira en 15 minutos (ventana de riesgo limitada)

- **Refresh Token:** `httpOnly cookie`
  - NO accesible por JavaScript → protección contra XSS
  - Secure flag → solo HTTPS
  - SameSite=Strict → protección contra CSRF
  - Expira en 30 días

**Configuración de cookies:**
```typescript
const cookieOptions = {
  httpOnly: true,        // No accesible por JS
  secure: true,          // Solo HTTPS
  sameSite: 'strict',    // CSRF protection
  maxAge: 30 * 24 * 60 * 60 * 1000,  // 30 días
  path: '/api/auth',     // Solo enviado a endpoints de auth
  domain: '.gamilit.com' // Compartido entre subdominios
};
```

---

### Token Expiration Strategy

| Token Type | Duración | Justificación |
|------------|----------|---------------|
| **Access Token** | 15 minutos | Balance UX/seguridad - suficiente para sesión activa |
| **Refresh Token** | 30 días | Contexto educativo - estudiantes no necesitan re-login diario |
| **Remember Me** | 90 días | Opcional - para dispositivos personales confiables |

**Sliding expiration (Refresh Tokens):**
- Si refresh token usado dentro de 7 días antes de expirar → extender 30 días más
- Usuarios activos nunca necesitan re-login
- Usuarios inactivos >30 días → re-login requerido

---

### Endpoints de Autenticación

```typescript
POST /api/auth/login
  → Returns: { accessToken, refreshToken (cookie) }

POST /api/auth/refresh
  → Cookie: refreshToken
  → Returns: { accessToken, refreshToken (new cookie) }

POST /api/auth/logout
  → Cookie: refreshToken
  → Returns: { success: true }

POST /api/auth/logout-all
  → Revokes ALL refresh tokens for user
  → Returns: { success: true }
```

---

### Security Headers

**API Responses:**
```http
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains
Content-Security-Policy: default-src 'self'
```

**CORS Configuration:**
```typescript
const corsOptions = {
  origin: ['https://app.gamilit.com', 'https://admin.gamilit.com'],
  credentials: true,  // Allow cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Authorization', 'Content-Type']
};
```

---

## Consecuencias

### Positivas ✅

1. **Escalabilidad horizontal:** Access tokens stateless permiten añadir servidores sin sesiones compartidas
2. **Seguridad robusta:** RS256 + refresh rotation + httpOnly cookies = múltiples capas de protección
3. **Revocación inmediata:** Logout invalida refresh tokens en DB
4. **Auditoría completa:** Tabla refresh_tokens registra dispositivos, IPs, timestamps
5. **Multi-dispositivo:** Usuario puede tener múltiples refresh tokens activos
6. **Zero-trust:** Servicios verifican tokens con public key sin secreto compartido
7. **Experiencia fluida:** Refresh automático cada 15 min sin interrumpir usuario

---

### Negativas ❌

1. **Complejidad de implementación:** Lógica de refresh + rotación + revocación requiere 20+ horas desarrollo
2. **Base de datos requerida:** Refresh tokens en DB → no es stateless al 100%
3. **Gestión de keys:** Rotación de claves RSA requiere proceso operacional
4. **Debugging más difícil:** Tokens cortos dificultan reproducir bugs de autenticación
5. **Clock skew:** Servidores con relojes desincronizados pueden rechazar tokens válidos

---

### Mitigaciones 🛡️

| Riesgo | Mitigación |
|--------|------------|
| **Robo de Access Token** | Expiración corta (15 min) + HTTPS obligatorio |
| **Robo de Refresh Token** | httpOnly cookie + rotación + detección de replay |
| **XSS Attack** | CSP headers + sanitización de inputs + httpOnly para refresh |
| **CSRF Attack** | SameSite=Strict cookies + CORS estricto |
| **Compromiso de clave privada** | Rotación de keys + secret manager + alertas de uso anómalo |
| **Clock skew** | Sincronización NTP + tolerancia de 5 min en validación |
| **Token flooding (DoS)** | Rate limiting en /refresh (10 req/min por usuario) |

---

### Monitoreo y Alertas

**Métricas a trackear:**
```typescript
- refresh_token_usage_rate (req/min por usuario)
- failed_token_validations (intentos con tokens inválidos)
- multiple_device_logins (mismo usuario, múltiples IPs simultáneas)
- refresh_token_rotation_failures
- average_session_duration
```

**Alertas críticas:**
- Spike en validaciones fallidas → posible ataque
- Múltiples logins desde países diferentes en <1 hora → cuenta comprometida
- Refresh token usado después de revocación → replay attack detectado

---

## Compliance y Estándares

**RFC 7519 (JWT):** ✅ Cumple con estándar JWT oficial
**OAuth 2.0:** ✅ Sigue patron de refresh token rotation
**OWASP Top 10:** ✅ Mitigaciones para A01 (Broken Access Control) y A07 (Identification and Authentication Failures)
**FERPA:** ✅ Auditoría de accesos a datos educativos
**GDPR:** ✅ Usuario puede revocar sesiones desde perfil

---

## Decisiones Relacionadas

- **ADR-001:** Email Verification Removal → Simplifica registro, JWT maneja autenticación post-registro
- **ADR-003:** RLS vs App-Layer Authorization (pendiente) → JWT payload incluye tenant_id para RLS
- **ADR-006:** Authentication Architecture (pendiente) → Documento maestro de arquitectura auth

**Epics relacionados:**
- EP002: Authentication & Authorization
- EP008: Security & Compliance

---

## Referencias

**Estándares:**
- [RFC 7519 - JSON Web Token (JWT)](https://datatracker.ietf.org/doc/html/rfc7519)
- [OAuth 2.0 RFC 6749](https://datatracker.ietf.org/doc/html/rfc6749)

**Security Best Practices:**
- [OWASP JWT Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_for_Java_Cheat_Sheet.html)
- [OWASP Session Management](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html)

**Análisis interno:**
- `/docs-analisys/doc-validation/integraciones/ANALISIS_COMPLETO_APIS.md`
- `/docs/02-especificaciones-tecnicas/04-seguridad-y-autorizacion/SECURITY-COMPLIANCE.md`

---

## Código de Ejemplo

### Backend (NestJS + Passport)

**JWT Strategy:**
```typescript
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_PUBLIC_KEY'),
      algorithms: ['RS256'],
      issuer: 'gamilit-api',
      audience: 'gamilit-web',
    });
  }

  async validate(payload: JwtPayload) {
    return {
      userId: payload.sub,
      email: payload.email,
      role: payload.role,
      tenantId: payload.tenant_id,
    };
  }
}
```

**Refresh Token Service:**
```typescript
@Injectable()
export class RefreshTokenService {
  async createRefreshToken(userId: string, deviceInfo: DeviceInfo): Promise<string> {
    const token = crypto.randomBytes(64).toString('hex');
    const tokenHash = await bcrypt.hash(token, 10);

    await this.prisma.refreshToken.create({
      data: {
        userId,
        tokenHash,
        deviceFingerprint: deviceInfo.fingerprint,
        ipAddress: deviceInfo.ip,
        userAgent: deviceInfo.userAgent,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    return token;
  }

  async rotateRefreshToken(oldToken: string): Promise<string> {
    const tokenRecord = await this.findRefreshToken(oldToken);

    // Detect replay attack
    if (tokenRecord.lastUsedAt && Date.now() - tokenRecord.lastUsedAt < 60000) {
      await this.revokeAllUserTokens(tokenRecord.userId);
      throw new UnauthorizedException('Token replay detected');
    }

    // Mark as used
    await this.prisma.refreshToken.update({
      where: { id: tokenRecord.id },
      data: { lastUsedAt: new Date() },
    });

    // Create new token
    const newToken = await this.createRefreshToken(tokenRecord.userId, {
      fingerprint: tokenRecord.deviceFingerprint,
      ip: tokenRecord.ipAddress,
      userAgent: tokenRecord.userAgent,
    });

    // Revoke old token
    await this.prisma.refreshToken.update({
      where: { id: tokenRecord.id },
      data: { revokedAt: new Date() },
    });

    return newToken;
  }
}
```

---

### Frontend (React + Axios)

**Axios Interceptor:**
```typescript
// Attach access token to requests
axios.interceptors.request.use((config) => {
  const accessToken = localStorage.getItem('accessToken');
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// Auto-refresh on 401
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Refresh token is sent automatically via httpOnly cookie
        const { data } = await axios.post('/api/auth/refresh');
        localStorage.setItem('accessToken', data.accessToken);

        // Retry original request
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return axios(originalRequest);
      } catch (refreshError) {
        // Refresh failed → logout user
        localStorage.removeItem('accessToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
```

---

## Revisiones

| Fecha | Cambio | Autor |
|-------|--------|-------|
| 2025-10-28 | Decisión inicial y documentación | Security Team + Backend Lead |
| - | Pendiente implementación en código | - |
| - | Pendiente revisión post-deployment | - |

---

## Próximos Pasos

1. **Desarrollo (Fase 4):**
   - Implementar JwtStrategy en NestJS
   - Crear RefreshTokenService
   - Migración DB para tabla refresh_tokens
   - Configurar RS256 keys en secret manager

2. **Testing:**
   - Unit tests para token generation/validation
   - Integration tests para flujo completo de auth
   - Security tests para replay attack detection

3. **Documentación:**
   - API documentation para endpoints de auth
   - Frontend guide para implementar interceptors
   - Runbook para rotación de keys

---

*ADR-002 - Creado: 28 de Octubre, 2025*
*Estado: Aceptado - Pendiente implementación en código*
