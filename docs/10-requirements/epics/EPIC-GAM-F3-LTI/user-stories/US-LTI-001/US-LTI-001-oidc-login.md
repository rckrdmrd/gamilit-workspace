---
id: "US-LTI-001"
title: "OIDC Login Flow"
type: "User Story"
status: "Backlog"
priority: "Alta"
assignee: "@Backend-Agent, @Frontend-Agent"
epic: "EXT-007"
story_points: 12
budget: "$1,800 USD"
sprint: "Sprint-17"
labels: ["lti", "oidc", "login", "sso", "canvas", "moodle", "authentication", "security"]
created_date: "2025-11-07"
updated_date: "2026-01-04"
---

# US-LTI-001: OIDC Login Flow

**Épica:** EXT-007: LTI Integration
**Prioridad:** P0 (Bloqueador para otras historias LTI)
**Story Points:** 12
**Esfuerzo:** 12 horas
**Costo:** $1,800 USD
**Sprint:** 17

---

## 📋 User Story

```
Como estudiante que usa Canvas/Moodle en mi universidad,
Quiero hacer clic en "GAMILIT Platform" dentro de mi curso
Para acceder automáticamente sin tener que crear otra cuenta o recordar otra contraseña
```

---

## 🎯 Contexto de Negocio

### Problema Actual
- Estudiantes deben registrarse manualmente en GAMILIT Platform
- Profesores deben gestionar usuarios en dos sistemas (LMS + GAMILIT
- Fricción en onboarding reduce adopción institucional

### Solución
- Single Sign-On (SSO) vía LTI 1.3 OIDC
- Usuario hace clic en LMS → automáticamente autenticado en GLIT
- Primera vez: cuenta GAMILITcreada automáticamente
- Siguientes veces: login automático

### Valor
- **Time to first exercise:** 30 segundos vs 5 minutos (registro manual)
- **Adoption rate:** +40% (menos fricción)
- **Support tickets:** -50% (no problemas de login/password)

---

## ✅ Criterios de Aceptación

### Funcionales

1. **OIDC Initiation:**
   - [ ] LMS envía OIDC login request a `/api/v1/lti/login`
   - [ ] GAMILITvalida parámetros requeridos: `iss`, `login_hint`, `target_link_uri`, `lti_message_hint`
   - [ ] GAMILITencuentra plataforma registrada por `iss` + `client_id`
   - [ ] Si plataforma no existe → retorna 401 con mensaje claro

2. **State y Nonce (Security):**
   - [ ] GAMILITgenera `state` aleatorio (32 bytes, secure random)
   - [ ] GAMILITguarda state en Redis con TTL 5 minutos
   - [ ] GAMILITgenera `nonce` aleatorio (16 bytes)
   - [ ] Nonce asociado al state para validación posterior

3. **Redirección a LMS:**
   - [ ] GAMILITredirige a `auth_login_url` del LMS con parámetros:
     - `response_type=id_token`
     - `scope=openid`
     - `client_id` (de configuración)
     - `redirect_uri` (callback GAMILIT
     - `state` (generado)
     - `nonce` (generado)
     - `login_hint` (del request inicial)

4. **OIDC Authentication Callback:**
   - [ ] LMS redirige a `/api/v1/lti/callback` con `id_token` (JWT)
   - [ ] GAMILITvalida JWT signature usando public key del LMS (RSA-256)
   - [ ] GAMILITvalida claims:
     - `iss` matches plataforma registrada
     - `aud` matches `client_id` de GLIT
     - `nonce` matches nonce guardado
     - `exp` no expirado
   - [ ] Si JWT inválido → retorna 403 con error específico

5. **Provisión Automática de Usuario:**
   - [ ] Si `sub` (LMS user ID) no existe en `lti_launches`:
     - Crear usuario en `auth_management.users`
     - Extraer datos del JWT: `email`, `name`, `given_name`, `family_name`
     - Asignar rol según `roles` claim (student, teacher, admin)
     - Crear registro en `lti_launches`
   - [ ] Si `sub` existe:
     - Buscar usuario asociado
     - Actualizar `last_login_at`

6. **Sesión GAMILIT**
   - [ ] Generar JWT de GAMILIT(access token + refresh token)
   - [ ] Guardar en httpOnly cookies
   - [ ] Redirigir a dashboard o `target_link_uri`

### No Funcionales

7. **Performance:**
   - [ ] Login flow completo <3 segundos (p95)
   - [ ] Soporta 100 logins concurrentes

8. **Seguridad:**
   - [ ] State almacenado en Redis con TTL (no en memoria)
   - [ ] Nonce validado solo una vez (protección replay attack)
   - [ ] Public key del LMS cacheado (actualizado cada 24h)
   - [ ] Audit log de todos los intentos de login (success/fail)

9. **Multi-tenant:**
   - [ ] Cada plataforma LMS asociada a un `tenant_id`
   - [ ] Usuarios creados pertenecen al tenant correcto
   - [ ] RLS policies aplicadas correctamente

---

## 🔧 Tareas Técnicas

### Backend (10h)

1. **Configuración LTI (1h)**
   - [ ] Instalar `@nest-edu/lti` o `ltijs`
   - [ ] Configurar módulo LTI en NestJS
   - [ ] Variables de entorno (REDIS_URL, LTI_SECRET_KEY)

2. **Endpoints OIDC (3h)**
   - [ ] `GET /api/v1/lti/login` - OIDC initiation
   - [ ] `POST /api/v1/lti/callback` - Authentication callback
   - [ ] DTOs: `OIDCLoginDto`, `OIDCCallbackDto`

3. **Validación JWT (2h)**
   - [ ] Service para obtener JWKS del LMS
   - [ ] Función de validación de JWT con RSA-256
   - [ ] Cache de public keys (Redis, 24h TTL)

4. **Provisión de Usuarios (2h)**
   - [ ] Service para crear usuario desde LTI claims
   - [ ] Mapeo de roles LTI → roles GLIT
   - [ ] Actualizar usuario existente si datos cambiaron

5. **State Management (1h)**
   - [ ] Service Redis para state/nonce storage
   - [ ] Validación de state en callback
   - [ ] Cleanup de states expirados

6. **Testing (1h)**
   - [ ] Unit tests de validación JWT
   - [ ] Integration test de login flow completo
   - [ ] Mock LMS responses

### Frontend (2h)

7. **Landing Page LTI (1h)**
   - [ ] Página `/lti/loading` con spinner
   - [ ] Mensaje "Conectando con [LMS Name]..."
   - [ ] Manejo de errores de autenticación

8. **Error Handling (1h)**
   - [ ] Página `/lti/error` para errores OIDC
   - [ ] Mensajes user-friendly
   - [ ] Botón "Volver a [LMS]" o "Contactar soporte"

---

## 🧪 Escenarios de Testing

### Happy Path
```
Given: Estudiante registrado en Canvas
When: Hace clic en "GAMILIT Platform" en su curso
Then:
  - Es redirigido a OIDC login
  - Canvas autentica al estudiante
  - GAMILITrecibe JWT válido
  - Usuario es creado/actualizado automáticamente
  - Redirigido a dashboard GLIT
  - Sesión activa en GLIT
```

### Edge Cases

1. **Primera vez del estudiante:**
   ```
   Given: Estudiante nunca ha usado GLIT
   When: Accede vía LTI por primera vez
   Then:
     - Cuenta GAMILITcreada automáticamente
     - Email extraído del JWT
     - Rol "student" asignado
     - Bienvenida mostrada
   ```

2. **JWT expirado:**
   ```
   Given: LMS envía JWT con `exp` pasado
   When: GAMILITintenta validar JWT
   Then:
     - Error 403 "Token expirado"
     - Mensaje: "Por favor, intenta nuevamente desde tu LMS"
   ```

3. **State inválido (CSRF attack):**
   ```
   Given: Atacante modifica parameter `state` en callback
   When: GAMILITvalida state contra Redis
   Then:
     - State no encontrado → 403
     - Audit log registra intento sospechoso
   ```

4. **Plataforma LMS no registrada:**
   ```
   Given: LMS no configurado en GLIT
   When: Request OIDC con `iss` desconocido
   Then:
     - Error 401 "Plataforma no autorizada"
     - Mensaje al admin para registrar plataforma
   ```

---

## 📊 Métricas de Éxito

### Durante Desarrollo
- **Tests passing:** 100%
- **Code coverage:** >85%
- **Security scan:** 0 vulnerabilidades

### Post-Lanzamiento (1 mes)
- **Login success rate:** >99%
- **Average login time:** <3 segundos
- **Error rate:** <0.5%
- **User satisfaction (SSO):** >90%

---

## 🔗 Dependencias

### Bloqueado por
- Base de datos schema `lti_integration` creado
- Tabla `lti_platforms` con al menos 1 plataforma de prueba

### Bloquea
- **US-LTI-002:** Grade Passback (requiere usuario autenticado)
- **US-LTI-003:** Deep Linking (requiere sesión LTI)

---

## 📚 Referencias Técnicas

### LTI 1.3 Specification
- [IMS Security Framework](https://www.imsglobal.org/spec/security/v1p0/)
- [OIDC Login Flow](https://www.imsglobal.org/spec/lti/v1p3/#openid-connect-launch-flow)

### Bibliotecas
- [@nest-edu/lti](https://www.npmjs.com/package/@nest-edu/lti)
- [ltijs](https://cvmcosta.me/ltijs/)
- [jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken)

### Código de Referencia
```typescript
// Controller
@Controller('api/v1/lti')
export class LTILoginController {
  @Get('login')
  async oidcLogin(@Query() query: OIDCLoginDto) {
    // 1. Validate platform
    const platform = await this.ltiService.findPlatformByIssuer(query.iss, query.client_id);
    if (!platform) throw new UnauthorizedException('Unknown platform');

    // 2. Generate state & nonce
    const state = this.cryptoService.generateSecureToken(32);
    const nonce = this.cryptoService.generateSecureToken(16);

    // 3. Store in Redis
    await this.redis.setex(`lti:state:${state}`, 300, JSON.stringify({
      nonce,
      platform_id: platform.id,
      login_hint: query.login_hint
    }));

    // 4. Redirect to LMS
    const authUrl = new URL(platform.auth_login_url);
    authUrl.searchParams.set('response_type', 'id_token');
    authUrl.searchParams.set('scope', 'openid');
    authUrl.searchParams.set('client_id', platform.client_id);
    authUrl.searchParams.set('redirect_uri', `${process.env.GLIT_BASE_URL}/api/v1/lti/callback`);
    authUrl.searchParams.set('state', state);
    authUrl.searchParams.set('nonce', nonce);
    authUrl.searchParams.set('login_hint', query.login_hint);

    return { redirect_url: authUrl.toString() };
  }
}
```

---

**Creado:** 2025-11-07
**Asignado a:** Backend Team
**Revisor:** Tech Lead + Security Engineer
