---
id: "US-FUND-001"
title: "Autenticacion basica con JWT"
type: "User Story"
status: "Done"
priority: "Alta"
assignee: "@Backend-Agent, @Frontend-Agent"
epic: "EAI-001"
story_points: 8
budget: "$2,900 MXN"
sprint: "Sprint-1"
labels: ["auth", "jwt", "seguridad", "fundamentos"]
created_date: "2025-11-02"
updated_date: "2026-01-04"
completed_date: "2025-08-08"
---

# US-FUND-001: Autenticacion basica con JWT

**Epica:** EAI-001 - Fundamentos
**Sprint:** Mes 1, Semana 1
**Story Points:** 8 SP
**Presupuesto:** $2,900 MXN
**Prioridad:** Alta (Alcance Inicial)
**Estado:** Done

---

## Descripción

Como **estudiante o profesor**, quiero poder **registrarme, iniciar sesión y recuperar mi contraseña** para **acceder de forma segura a la plataforma GAMILIT**.

**Contexto del Alcance Inicial:**
En el MVP se implementó un sistema de autenticación básico con JWT que soporta dos roles fijos: estudiante y profesor. El sistema incluye funcionalidades esenciales de autenticación sin características avanzadas como 2FA o SSO, que serán agregadas en extensiones futuras.

---

## Criterios de Aceptación

- [ ] **CA-01:** El sistema permite registrar nuevos usuarios con email, contraseña y rol (estudiante/profesor)
- [ ] **CA-02:** Al registrarse, se valida que el email sea único y tenga formato válido
- [ ] **CA-03:** Las contraseñas se almacenan hasheadas con bcrypt (min. 10 rounds)
- [ ] **CA-04:** El login genera un JWT token válido por 24 horas
- [ ] **CA-05:** El JWT incluye el userId y rol en el payload
- [ ] **CA-06:** Existe un endpoint de recuperación de contraseña que envía email con token temporal
- [ ] **CA-07:** El token de recuperación expira en 1 hora
- [ ] **CA-08:** El sistema permite cerrar sesión (invalidación de token en frontend)
- [ ] **CA-09:** Las contraseñas deben tener mínimo 8 caracteres
- [ ] **CA-10:** Se retorna mensaje de error apropiado para credenciales inválidas

---

## Especificaciones Técnicas

### Backend (NestJS)

**Endpoints:**
```
POST /api/auth/register (public self-service)
- Body: { email, password, first_name?, last_name? }
- Response: { user, accessToken }
- Note: role is assigned automatically as 'student'

POST /api/auth/login
- Body: { email, password }
- Response: { user, accessToken }

POST /api/auth/forgot-password
- Body: { email }
- Response: { message: "Email sent" }

POST /api/auth/reset-password
- Body: { token, newPassword }
- Response: { message: "Password updated" }

GET /api/auth/me
- Headers: Authorization: Bearer {token}
- Response: { user }
```

**Servicios:**
- **AuthService:** Lógica de autenticación (register, login, validateUser)
- **JwtService:** Generación y validación de tokens JWT
- **MailService:** Envío de emails de recuperación

**Entidades:**
```typescript
@Entity('users')
class User {
  id: string (UUID)
  email: string (unique)
  password: string (hashed)
  first_name: string  // snake_case for DB consistency
  last_name: string   // snake_case for DB consistency
  role: 'student' | 'teacher'
  createdAt: Date
  updatedAt: Date
}

@Entity('password_reset_tokens')
class PasswordResetToken {
  id: string (UUID)
  userId: string (FK to users)
  token: string
  expiresAt: Date
  used: boolean
}
```

**Guards:**
- **JwtAuthGuard:** Protege rutas que requieren autenticación
- **RolesGuard:** Valida roles específicos (estudiante/profesor)

### Frontend (React + Vite)

**Componentes:**
- `LoginForm.tsx`: Formulario de inicio de sesión
- `RegisterForm.tsx`: Formulario de registro
- `ForgotPasswordForm.tsx`: Solicitud de recuperación
- `ResetPasswordForm.tsx`: Establecer nueva contraseña

**Estado (Zustand):**
```typescript
interface AuthStore {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  login: (email, password) => Promise<void>
  register: (data) => Promise<void>
  logout: () => void
  forgotPassword: (email) => Promise<void>
  resetPassword: (token, newPassword) => Promise<void>
}
```

**Rutas:**
- `/login` - Página de inicio de sesión
- `/register` - Página de registro
- `/forgot-password` - Solicitar recuperación
- `/reset-password/:token` - Restablecer contraseña

**Almacenamiento:**
- Token JWT guardado en `localStorage`
- Auto-login si existe token válido al cargar la app

### Seguridad

- Contraseñas hasheadas con bcrypt (10 rounds)
- JWT firmado con secret key (desde ENV)
- Tokens de recuperación de un solo uso
- Validación de email en backend y frontend
- Rate limiting en endpoints de auth (10 req/min)

---

## Dependencias

**Antes:**
- Ninguna (primera historia del proyecto)

**Después:**
- US-FUND-002 (Perfiles de usuario - requiere autenticación)
- US-FUND-003 (Dashboard - requiere autenticación)
- US-FUND-005 (Sistema de sesiones - extiende esta funcionalidad)

---

## Definición de Hecho (DoD)

- [x] Código implementado y revisado
- [x] Tests unitarios para AuthService (>80% coverage)
- [x] Tests E2E para flujos de autenticación
- [x] Validación de seguridad (password hashing, JWT signing)
- [x] Documentación de API en Swagger
- [x] Probado en ambiente de desarrollo
- [x] Sin warnings de seguridad en audit

---

## Notas del Alcance Inicial

- ✅ Solo 2 roles básicos: estudiante y profesor
- ✅ JWT simple sin refresh tokens (agregado en US-FUND-005)
- ✅ Recuperación de contraseña por email (requiere configuración SMTP)
- ✅ Sin autenticación social (Google, Facebook)
- ✅ Sin autenticación de dos factores (2FA)
- ⚠️ **Extensión futura:** EXT-001-Admin (roles adicionales: admin, superadmin)
- ⚠️ **Extensión futura:** EXT-002-Security (2FA, SSO, OAuth)

---

## Tareas de Implementación

### Backend (Estimado: 16h, Real: 17h)

**Total Backend:** 17h (~4.25 SP)

- [x] **Tarea B.1:** Configuración JWT y entidades base - Estimado: 4h, Real: 4.5h
  - [x] Subtarea B.1.1: Instalar dependencias (@nestjs/jwt, @nestjs/passport, bcrypt) - 0.5h
  - [x] Subtarea B.1.2: Crear entidad User con campos de autenticación - 1h
  - [x] Subtarea B.1.3: Crear entidad PasswordResetToken - 0.5h
  - [x] Subtarea B.1.4: Generar migración de base de datos - 0.5h
  - [x] Subtarea B.1.5: Configurar JwtModule con variables de entorno - 1h
  - [x] Subtarea B.1.6: Crear JwtStrategy para validación de tokens - 1h

- [x] **Tarea B.2:** Implementación de AuthService - Estimado: 5h, Real: 5.5h
  - [x] Subtarea B.2.1: Método register con hash de contraseña (bcrypt 10 rounds) - 2h
  - [x] Subtarea B.2.2: Método login con validación de credenciales - 1.5h
  - [x] Subtarea B.2.3: Método validateUser para JWT strategy - 1h
  - [x] Subtarea B.2.4: Generación de tokens JWT con payload (userId, role) - 1h

- [x] **Tarea B.3:** Endpoints de autenticación - Estimado: 4h, Real: 4h
  - [x] Subtarea B.3.1: POST /auth/register con validación de DTO - 1.5h
  - [x] Subtarea B.3.2: POST /auth/login con manejo de errores - 1h
  - [x] Subtarea B.3.3: GET /auth/me con JWT guard - 1h
  - [x] Subtarea B.3.4: Documentación Swagger de endpoints - 0.5h

- [x] **Tarea B.4:** Sistema de recuperación de contraseña - Estimado: 3h, Real: 3h
  - [x] Subtarea B.4.1: MailService para envío de emails - 1h
  - [x] Subtarea B.4.2: POST /auth/forgot-password con generación de token - 1h
  - [x] Subtarea B.4.3: POST /auth/reset-password con validación de token - 1h

### Frontend (Estimado: 8h, Real: 9h)

**Total Frontend:** 9h (~2.25 SP)

- [x] **Tarea F.1:** Componentes de autenticación - Estimado: 5h, Real: 5.5h
  - [x] Subtarea F.1.1: Componente LoginForm con validación - 1.5h
  - [x] Subtarea F.1.2: Componente RegisterForm con validación - 1.5h
  - [x] Subtarea F.1.3: Componente ForgotPasswordForm - 1h
  - [x] Subtarea F.1.4: Componente ResetPasswordForm - 1h
  - [x] Subtarea F.1.5: Páginas de rutas (/login, /register, etc.) - 0.5h

- [x] **Tarea F.2:** Estado de autenticación con Zustand - Estimado: 3h, Real: 3.5h
  - [x] Subtarea F.2.1: Crear AuthStore con interface - 1h
  - [x] Subtarea F.2.2: Implementar métodos login/register/logout - 1.5h
  - [x] Subtarea F.2.3: Persistencia de token en localStorage - 0.5h
  - [x] Subtarea F.2.4: Hook useAuth para acceso al store - 0.5h

### Testing (Estimado: 6h, Real: 5.5h)

**Total Testing:** 5.5h (~1.4 SP)

- [x] **Tarea T.1:** Tests unitarios backend - Estimado: 3h, Real: 2.5h
  - [x] Subtarea T.1.1: Tests de AuthService (hash, JWT, validación) - 1.5h
  - [x] Subtarea T.1.2: Tests de MailService - 0.5h
  - [x] Subtarea T.1.3: Tests de guards (JwtAuthGuard) - 0.5h

- [x] **Tarea T.2:** Tests E2E - Estimado: 2h, Real: 2h
  - [x] Subtarea T.2.1: Tests de endpoints de auth (register, login) - 1h
  - [x] Subtarea T.2.2: Tests de recuperación de contraseña - 0.5h
  - [x] Subtarea T.2.3: Tests de protección de rutas (401) - 0.5h

- [x] **Tarea T.3:** Tests frontend - Estimado: 1h, Real: 1h
  - [x] Subtarea T.3.1: Tests de componentes de formularios - 0.5h
  - [x] Subtarea T.3.2: Tests de AuthStore - 0.5h

### Deployment (Estimado: 2h, Real: 2h)

**Total Deployment:** 2h (~0.5 SP)

- [x] **Tarea D.1:** Configuración de ambiente - Estimado: 1h, Real: 1h
  - [x] Subtarea D.1.1: Variables de entorno JWT_SECRET - 0.25h
  - [x] Subtarea D.1.2: Configuración SMTP para emails - 0.5h
  - [x] Subtarea D.1.3: Secrets management en .env - 0.25h

- [x] **Tarea D.2:** Deploy y validación - Estimado: 1h, Real: 1h
  - [x] Subtarea D.2.1: Deploy a staging - 0.5h
  - [x] Subtarea D.2.2: Smoke tests de autenticación - 0.25h
  - [x] Subtarea D.2.3: Validación de seguridad (bcrypt, JWT) - 0.25h

---

## Resumen de Horas

| Categoría | Estimado | Real | Variación |
|-----------|----------|------|-----------|
| Backend | 16h | 17h | +6.25% |
| Frontend | 8h | 9h | +12.5% |
| Testing | 6h | 5.5h | -8.3% |
| Deployment | 2h | 2h | 0% |
| **TOTAL** | **32h** | **33.5h** | **+4.7%** |

**Validación:** 8 SP × 4h/SP = 32 horas estimadas ✅

---

## Cronograma Real

**Sprint:** Sprint 1-2 (05-16 Agosto 2024)
**Fecha Inicio Real:** 05 Agosto 2024
**Fecha Fin Real:** 08 Agosto 2024
**Estado:** ✅ Completada
**Notas:** La implementación tomó 0.5 días adicionales debido a la configuración del servicio de email SMTP que requirió troubleshooting. El sistema de autenticación quedó robusto con todas las validaciones de seguridad implementadas.

---

## Testing

### Tests Unitarios
```typescript
describe('AuthService', () => {
  it('should hash password on register')
  it('should generate JWT on successful login')
  it('should throw error for invalid credentials')
  it('should create password reset token')
  it('should validate reset token expiry')
})
```

### Tests E2E
```typescript
describe('Auth API', () => {
  it('POST /auth/register - success')
  it('POST /auth/register - duplicate email')
  it('POST /auth/login - success')
  it('POST /auth/login - invalid credentials')
  it('GET /auth/me - with valid token')
  it('GET /auth/me - without token (401)')
})
```

---

## Estimación

**Desglose de Esfuerzo (8 SP = ~3 días):**
- Backend setup + JWT config: 1 día
- Endpoints de auth: 1 día
- Frontend forms + store: 0.5 días
- Password reset flow: 0.5 días
- Testing: 0.5 días
- Ajustes y documentación: 0.5 días

**Riesgos:**
- Configuración de email service puede requerir tiempo adicional
- Validaciones de seguridad requieren atención especial

---

**Creado:** 2025-11-02
**Actualizado:** 2025-11-02
**Responsable:** Equipo Backend + Frontend
