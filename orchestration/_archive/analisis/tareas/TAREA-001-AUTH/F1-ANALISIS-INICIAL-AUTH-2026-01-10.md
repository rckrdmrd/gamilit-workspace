# F1: ANALISIS INICIAL - TAREA-001 AUTH_MANAGEMENT

## Metadata

| Campo | Valor |
|-------|-------|
| **Tarea** | TAREA-001 |
| **Modulo** | auth_management |
| **Fecha** | 2026-01-10 |
| **Estado** | COMPLETADO |
| **Agente** | @PERFIL_ORQUESTADOR |

---

## 1. OBJETIVO

Realizar analisis inicial del modulo de autenticacion para identificar alcance, archivos y dependencias antes del analisis detallado (F2).

---

## 2. RESUMEN EJECUTIVO

### 2.1 Metricas por Capa

| Capa | Objetos | Estado |
|------|---------|--------|
| **Base de Datos** | 16 tablas, 6 funciones, 6 triggers, 23 RLS | Produccion |
| **Backend** | 14 entities, 5 services, 3 controllers, 37 DTOs | Produccion |
| **Frontend** | 12 types, 13 API calls, 5 hooks, 10+ components | Produccion |

### 2.2 Puntos de Integracion Criticos

| Integracion | Estado | Notas |
|-------------|--------|-------|
| DDL → Entity | OK | 14/16 tablas mapeadas |
| Entity → DTO | OK | UserResponseDto sincronizado |
| DTO → Type | OK | User type sincronizado 2025-11-26 |
| API Routes | OK | 13 endpoints backend ↔ frontend |

---

## 3. CAPA 1: BASE DE DATOS (Schema auth_management)

### 3.1 Tablas (16)

| # | Tabla | Columnas | FKs | Proposito |
|---|-------|----------|-----|-----------|
| 1 | tenants | 12 | 0 | Multi-tenancy |
| 2 | profiles | 22 | 3 | Perfiles de usuario |
| 3 | auth_attempts | 9 | 0 | Anti-bruteforce |
| 4 | roles | 6 | 0 | Catalogo de roles |
| 5 | user_roles | 13 | 4 | Asignacion de roles |
| 6 | auth_providers | 15 | 0 | OAuth providers |
| 7 | email_verification_tokens | 7 | 1 | Verificacion email |
| 8 | password_reset_tokens | 6 | 1 | Reset password |
| 9 | security_events | 9 | 1 | Auditoria seguridad |
| 10 | user_preferences | 9 | 1 | Preferencias |
| 11 | memberships | 12 | 2 | Relacion usuario-tenant |
| 12 | user_sessions | 16 | 2 | Sesiones activas |
| 13 | user_suspensions | 8 | 2 | Suspensiones |
| 14 | parent_accounts | 19 | 1 | Cuentas padres |
| 15 | parent_student_links | 20 | 4 | Vinculos padre-hijo |
| 16 | parent_notifications | 18 | 2 | Notificaciones padres |

### 3.2 Funciones (6)

| Funcion | Proposito |
|---------|-----------|
| assign_role_to_user | Asigna rol a usuario |
| get_user_role | Obtiene rol mas privilegiado |
| user_has_permission | Verifica permiso |
| revoke_role_from_user | Revoca rol |
| hash_token | Hash SHA-256 de tokens |
| update_user_preferences | UPSERT preferencias |

### 3.3 Triggers (6)

| Trigger | Tabla | Evento |
|---------|-------|--------|
| trg_set_default_tenant | profiles | BEFORE INSERT |
| trg_audit_profile_changes | profiles | AFTER UPDATE |
| trg_initialize_user_stats | profiles | AFTER INSERT |
| trg_assign_default_classroom | profiles | AFTER INSERT |
| batch_updated_at | multiple | BEFORE UPDATE |

### 3.4 RLS Policies (23)

- **profiles**: 5 policies (read_own, read_teacher, read_admin, update_own, update_admin)
- **user_sessions**: 1 policy
- **security_events**: 2 policies
- **user_suspensions**: 5 policies
- **Otras**: 10 policies

### 3.5 Dependencias Externas

| Schema Externo | Relacion |
|----------------|----------|
| auth (Supabase) | profiles.user_id → auth.users |
| social_features | profiles.school_id → schools |
| gamification_system | user_stats via trigger |
| audit_logging | log_audit_event() |

---

## 4. CAPA 2: BACKEND (Modulo auth)

### 4.1 Entities (14)

| Entity | Tabla DDL | Columnas | Relaciones |
|--------|-----------|----------|------------|
| User | auth.users | 15 | ManyToMany Role |
| Profile | auth_management.profiles | 22 | ManyToOne Tenant |
| Role | auth_management.roles | 6 | ManyToMany User |
| UserRole | auth_management.user_roles | 13 | ManyToOne Profile |
| Tenant | auth_management.tenants | 12 | OneToMany Profile |
| Membership | auth_management.memberships | 12 | ManyToOne User/Tenant |
| UserSession | auth_management.user_sessions | 16 | ManyToOne User |
| EmailVerificationToken | auth_management.email_verification_tokens | 7 | ManyToOne User |
| PasswordResetToken | auth_management.password_reset_tokens | 6 | ManyToOne User |
| AuthAttempt | auth_management.auth_attempts | 9 | - |
| SecurityEvent | auth_management.security_events | 9 | ManyToOne User |
| UserSuspension | auth_management.user_suspensions | 8 | ManyToOne User |
| UserPreferences | auth_management.user_preferences | 9 | ManyToOne Profile |
| AuthProvider | auth_management.auth_providers | 15 | ManyToOne User |

### 4.2 Services (5)

| Service | Metodos | Responsabilidad |
|---------|---------|-----------------|
| AuthService | 13 | Registro, login, JWT |
| SessionManagementService | 8 | Gestion sesiones |
| SecurityService | 8 | Rate limiting, auditoria |
| EmailVerificationService | 7 | Verificacion email |
| PasswordRecoveryService | 6 | Reset password |

### 4.3 Controllers (3)

| Controller | Endpoints | Base Path |
|------------|-----------|-----------|
| AuthController | 13 | /api/auth |
| UsersController | 6 | /api/users |
| PasswordController | 6 | /auth |

### 4.4 Endpoints Principales (25)

```
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
POST /api/auth/refresh
GET  /api/auth/profile
PUT  /api/auth/profile
POST /api/auth/verify-email
POST /api/auth/forgot-password
POST /api/auth/reset-password
PUT  /api/auth/password
GET  /api/auth/sessions
DELETE /api/auth/sessions/:id
DELETE /api/auth/sessions
GET  /api/users/profile
PUT  /api/users/profile
GET  /api/users/preferences
PUT  /api/users/preferences
POST /api/users/avatar
GET  /api/users/statistics
```

### 4.5 Guards y Decorators

| Guard/Decorator | Proposito |
|-----------------|-----------|
| JwtAuthGuard | Protege rutas con JWT |
| RolesGuard | Verifica roles |
| @Roles() | Define roles permitidos |

---

## 5. CAPA 3: FRONTEND (Feature auth)

### 5.1 Types (12)

| Type | Origen | Proposito |
|------|--------|-----------|
| User | UserResponseDto | Usuario autenticado |
| AuthProfile | Profile entity | Perfil completo |
| LoginCredentials | LoginDto | Request login |
| RegisterData | RegisterUserDto | Request registro |
| AuthResponse | Backend response | Response auth |
| SessionInfo | - | Info sesion |
| UserSessionInfo | UserSessionResponseDto | Sesion activa |

### 5.2 API Functions (13)

| Funcion | Endpoint Backend |
|---------|------------------|
| login | POST /api/auth/login |
| register | POST /api/auth/register |
| logout | POST /api/auth/logout |
| refreshToken | POST /api/auth/refresh |
| getCurrentUser | GET /api/auth/me |
| updateProfile | PATCH /api/auth/profile |
| requestPasswordReset | POST /api/auth/forgot-password |
| resetPassword | POST /api/auth/reset-password |
| changePassword | PUT /api/auth/password |
| checkSession | GET /api/auth/validate-token |
| getSessions | GET /api/auth/sessions |
| revokeSession | DELETE /api/auth/sessions/:id |
| verifyEmail | POST /api/auth/verify-email (DEPRECATED) |

### 5.3 Hooks (5)

| Hook | Proposito |
|------|-----------|
| useAuth | Estado y acciones auth |
| useUser | Datos usuario actual |
| useRole | Verificacion de rol |
| usePermissions | Sistema RBAC |
| useSession | Gestion sesion con auto-refresh |

### 5.4 Components (10+)

| Componente | Proposito |
|------------|-----------|
| LoginForm | Formulario login |
| RegisterForm | Formulario registro |
| EmailInput | Input email especializado |
| PasswordInput | Input con toggle show/hide |
| PasswordStrengthMeter | Medidor fortaleza |
| SessionsList | Lista sesiones activas |
| SessionTimeoutWarning | Alerta expiracion |
| PermissionMatrix | Matriz permisos |
| RoleSelector | Selector de rol |

### 5.5 Pages (3)

| Pagina | Ruta |
|--------|------|
| LoginPage | /login |
| RegisterPage | /register |
| ForgotPasswordPage | /forgot-password |

### 5.6 State Management (Zustand)

- **Store**: authStore.ts
- **State**: user, token, refreshToken, isAuthenticated, isLoading, error, sessionExpiresAt
- **Persistencia**: localStorage con key 'auth-storage'

---

## 6. MATRIZ DE DEPENDENCIAS

```
┌─────────────────────────────────────────────────────────────────────┐
│                    DEPENDENCIAS AUTH_MANAGEMENT                      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   TABLAS INTERNAS:                                                  │
│   tenants ──┬─> profiles                                            │
│             ├─> user_roles                                          │
│             ├─> memberships                                         │
│             └─> user_sessions                                       │
│                                                                      │
│   profiles ──┬─> user_preferences (1:1)                             │
│              ├─> user_roles (1:N)                                   │
│              ├─> memberships (1:N)                                  │
│              ├─> user_sessions (1:N)                                │
│              └─> parent_accounts (1:1)                              │
│                                                                      │
│   DEPENDENCIAS EXTERNAS:                                            │
│   auth.users ←── profiles (user_id FK)                              │
│   auth.users ←── email_verification_tokens                          │
│   auth.users ←── password_reset_tokens                              │
│   auth.users ←── security_events                                    │
│   auth.users ←── user_suspensions                                   │
│                                                                      │
│   social_features.schools ←── profiles (school_id FK diferido)      │
│                                                                      │
│   gamification_system.user_stats <── trg_initialize_user_stats      │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 7. INCONSISTENCIAS PRELIMINARES

### 7.1 Potenciales Brechas

| # | Capa | Descripcion | Severidad |
|---|------|-------------|-----------|
| 1 | Frontend | verifyEmail() marcado DEPRECATED | BAJA |
| 2 | Frontend | Organization field no retornado (DT-001) | MEDIA |
| 3 | BD/Backend | parent_accounts sin RLS policies | MEDIA |

### 7.2 Deuda Tecnica

| ID | Descripcion | Impacto |
|----|-------------|---------|
| DT-001 | Organization no incluido en AuthResponse | UI incompleta |
| DT-002 | OAuth providers estructura definida no integrada | Feature incompleta |

---

## 8. CRITERIOS DE EXITO PARA F2

- [ ] Inventario completo de columnas DDL vs Entity fields
- [ ] Validacion de tipos TypeScript vs PostgreSQL
- [ ] Mapeo completo de Foreign Keys
- [ ] Identificacion de campos faltantes en DTOs
- [ ] Validacion de RLS policies vs Guards
- [ ] Verificacion de endpoints documentados

---

## 9. PROXIMOS PASOS

1. **F2**: Analisis detallado campo por campo
2. **F3**: Plan de validacion/correccion
3. **F4**: Validacion del plan
4. **F5**: Refinamiento
5. **F6**: Ejecucion
6. **F7**: Validacion final

---

## 10. ARCHIVOS RELACIONADOS

- BD: `/apps/database/ddl/schemas/auth_management/`
- Backend: `/apps/backend/src/modules/auth/`
- Frontend: `/apps/frontend/src/features/auth/`

---

**Documento generado por:** ORQUESTADOR
**Fecha:** 2026-01-10
**Version:** 1.0.0
