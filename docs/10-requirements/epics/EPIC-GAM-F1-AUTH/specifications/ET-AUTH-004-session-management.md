---
titulo: "ET-AUTH-004: Session Management"
tipo: especificacion-tecnica
fecha_creacion: "2025-10-01"
ultima_actualizacion: "2026-02-28"
estado: activo
---

# ET-AUTH-004: Session Management

## Metadata

| Campo | Valor |
|-------|-------|
| **ID** | ET-AUTH-004 |
| **Modulo** | Autenticacion y Autorizacion |
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
- RF-AUTH-005: Session Management

### User Stories
- US-AUTH-005: Session Lifecycle Management

---

## Descripcion Funcional

El sistema de gestion de sesiones controla el ciclo de vida completo de las sesiones de usuario, incluyendo:
- Creacion de sesiones con JWT
- Renovacion automatica (refresh tokens)
- Invalidacion de sesiones
- Persistencia de sesiones en multiples dispositivos
- Tracking de sesiones activas

---

## Arquitectura

### Diagrama de Componentes

```
+----------------------------------------------------------+
|                   FRONTEND (React)                        |
|  - AuthProvider                                           |
|  - useAuthStore (Zustand)                                 |
|  - TokenManager                                           |
|  - SessionRefreshTimer                                    |
+-----------------------------+----------------------------+
                              | HTTP + JWT
+-----------------------------v----------------------------+
|                  BACKEND (NestJS)                        |
|  - AuthService                                           |
|  - JwtStrategy                                           |
|  - RefreshTokenService                                   |
|  - SessionService                                        |
+-----------------------------+----------------------------+
                              | TypeORM
+-----------------------------v----------------------------+
|               DATABASE (PostgreSQL)                       |
|  - auth_management.profiles                               |
|  - progress_tracking.learning_sessions                   |
+----------------------------------------------------------+
```

### Flujo de Sesion

```
Usuario hace login
        |
        v
AuthService.login()
  - Valida credenciales
  - Genera access_token (15min)
  - Genera refresh_token (7 dias)
        |
        v
Frontend guarda tokens
  - localStorage: access_token
  - httpOnly cookie: refresh_token
        |
        v
Cada request incluye Authorization header
        |
        v
JwtStrategy valida token
  ├── Valido → Procesa request
  └── Expirado → 401 Unauthorized
        |
        v
Frontend detecta 401
        |
        v
Intenta refresh con refresh_token
  ├── Valido → Nuevo access_token
  └── Invalido → Logout forzado
```

---

## Implementacion Existente

### Backend - AuthService

**Ubicacion:** `apps/backend/src/modules/auth/services/auth.service.ts`

**Estado:** COMPLETO (100%)

**Metodos Implementados:**
| Metodo | Descripcion |
|--------|-------------|
| login(email, password) | Autenticacion con generacion de tokens |
| validateUser(payload) | Validacion de JWT payload |
| refreshToken(token) | Renovacion de access token |
| logout(userId) | Invalidacion de sesion |
| getProfile(userId) | Obtener perfil de sesion actual |

### Backend - JwtStrategy

**Ubicacion:** `apps/backend/src/modules/auth/strategies/jwt.strategy.ts`

**Estado:** COMPLETO (100%)

```typescript
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: JwtPayload): Promise<User> {
    return this.authService.validateUser(payload);
  }
}
```

### Backend - Learning Sessions

**Ubicacion:** `apps/backend/src/modules/progress/services/learning-session.service.ts`

**Estado:** COMPLETO (100%)

**Campos Principales:**
| Campo | Tipo | Descripcion |
|-------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | FK a profiles |
| start_time | TIMESTAMP | Inicio de sesion |
| end_time | TIMESTAMP | Fin de sesion (null si activa) |
| duration_minutes | INT | Duracion calculada |
| module_id | UUID | Modulo actual (opcional) |
| exercises_completed | INT | Ejercicios completados |

### Frontend - AuthStore (Zustand)

**Ubicacion:** `apps/frontend/src/features/auth/store/authStore.ts`

**Estado:** COMPLETO (100%)

```typescript
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  accessToken: string | null;

  // Actions
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  refreshSession: () => Promise<void>;
  setUser: (user: User) => void;
  checkSession: () => Promise<void>;
}
```

---

## Configuracion de Tokens

### Access Token
| Parametro | Valor |
|-----------|-------|
| Algoritmo | HS256 |
| Expiracion | 15 minutos |
| Payload | { sub: profileId, email, role, iat, exp } |
| Almacenamiento | localStorage |

### Refresh Token
| Parametro | Valor |
|-----------|-------|
| Algoritmo | HS256 |
| Expiracion | 7 dias |
| Payload | { sub: profileId, type: 'refresh' } |
| Almacenamiento | httpOnly cookie |

---

## Lo que Falta para Completar (15%)

### 1. Session Registry (10%)

```typescript
// services/session-registry.service.ts (NUEVO)
@Injectable()
export class SessionRegistryService {
  /**
   * Registra nueva sesion
   */
  async registerSession(
    userId: string,
    deviceInfo: DeviceInfo
  ): Promise<SessionRecord>;

  /**
   * Lista sesiones activas del usuario
   */
  async getActiveSessions(userId: string): Promise<SessionRecord[]>;

  /**
   * Invalida sesion especifica
   */
  async revokeSession(sessionId: string): Promise<void>;

  /**
   * Invalida todas las sesiones excepto actual
   */
  async revokeOtherSessions(
    userId: string,
    currentSessionId: string
  ): Promise<number>;
}
```

### 2. Multi-Device Support (5%)

- Tracking de dispositivos
- Limite de sesiones simultaneas
- UI para ver/revocar sesiones

---

## API REST Endpoints

| Metodo | Ruta | Descripcion | Auth |
|--------|------|-------------|------|
| POST | `/auth/login` | Login con email/password | No |
| POST | `/auth/refresh` | Renovar access token | Refresh Token |
| POST | `/auth/logout` | Cerrar sesion | Si |
| GET | `/auth/profile` | Perfil de sesion actual | Si |
| GET | `/auth/sessions` | Listar sesiones activas | Si |
| DELETE | `/auth/sessions/:id` | Revocar sesion | Si |

---

## Criterios de Aceptacion

### Funcionales
- [x] Usuario puede iniciar sesion con email/password
- [x] Access token expira en 15 minutos
- [x] Refresh token renueva access token
- [x] Usuario puede cerrar sesion
- [x] Sesion persiste en recargas de pagina
- [ ] Usuario puede ver sesiones activas
- [ ] Usuario puede revocar otras sesiones

### No Funcionales
- [x] JWT firmado con secreto seguro
- [x] Refresh token en httpOnly cookie
- [x] Rate limiting en login (5 intentos/min)
- [ ] Sesiones auditadas en logs

### Seguridad
- [x] Tokens no expuestos en URLs
- [x] CORS configurado correctamente
- [x] XSS protection en frontend
- [ ] Session fixation prevention

---

## Dependencias

### Bloqueado Por
- Profile Entity (COMPLETO)
- JWT Module (COMPLETO)

### Bloquea
- Multi-tenancy sessions
- Remember me functionality
- Session analytics

---

## Estimacion de Esfuerzo Restante

| Componente | Horas Estimadas |
|------------|-----------------|
| SessionRegistryService | 4h |
| Active Sessions UI | 3h |
| Multi-device tracking | 4h |
| Tests | 2h |
| **Total** | **13h** |

---

## Historial de Cambios

| Version | Fecha | Autor | Cambios |
|---------|-------|-------|---------|
| 1.0 | 2026-01-27 | Architecture Analyst | Creacion inicial |

---

*Documento: ET-AUTH-004-session-management.md*
*Generado: 2026-01-27*
