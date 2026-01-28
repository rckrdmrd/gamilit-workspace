# ET-AUTH-007: Reusable Auth Components

## Metadata

| Campo | Valor |
|-------|-------|
| **ID** | ET-AUTH-007 |
| **Modulo** | Autenticacion y Autorizacion |
| **Tipo** | Especificacion Tecnica |
| **Estado** | Implementado |
| **Completitud** | 90% |
| **Version** | 1.0 |
| **Fecha Creacion** | 2026-01-27 |
| **Ultima Actualizacion** | 2026-01-27 |
| **Autor** | Architecture Analyst |

---

## Referencias

### Requerimiento Funcional
- RF-AUTH-008: Reusable Authentication Components

### User Stories
- US-AUTH-008: Component Library for Auth

---

## Descripcion Funcional

Biblioteca de componentes reutilizables para autenticacion:
- LoginForm
- RegisterForm
- RoleBadge
- UserAvatar
- LogoutButton
- PermissionGate
- useAuth hook

---

## Componentes Implementados

### 1. LoginForm

**Ubicacion:** `apps/frontend/src/features/auth/components/LoginForm.tsx`

**Estado:** COMPLETO (100%)

```typescript
interface LoginFormProps {
  onSuccess?: (user: User) => void;
  onError?: (error: Error) => void;
  redirectTo?: string;
  showRememberMe?: boolean;
  showSocialLogin?: boolean;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onSuccess,
  onError,
  redirectTo = '/dashboard',
  showRememberMe = true,
  showSocialLogin = false,
}) => {
  // Form with email, password, remember me
  // Validation with react-hook-form + zod
  // Error handling with toast notifications
};
```

**Ejemplo de Uso:**
```tsx
<LoginForm
  onSuccess={(user) => console.log('Logged in:', user.email)}
  redirectTo="/teacher/dashboard"
  showRememberMe={true}
/>
```

### 2. RegisterForm

**Ubicacion:** `apps/frontend/src/features/auth/components/RegisterForm.tsx`

**Estado:** COMPLETO (100%)

```typescript
interface RegisterFormProps {
  onSuccess?: (user: User) => void;
  onError?: (error: Error) => void;
  role?: 'student' | 'admin_teacher';
  requireInviteCode?: boolean;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({
  onSuccess,
  onError,
  role = 'student',
  requireInviteCode = false,
}) => {
  // Form with email, password, confirm password, name
  // Optional invite code for teacher registration
  // Password strength indicator
};
```

### 3. RoleBadge

**Ubicacion:** `apps/frontend/src/features/auth/components/RoleBadge.tsx`

**Estado:** COMPLETO (100%)

```typescript
interface RoleBadgeProps {
  role: 'student' | 'admin_teacher' | 'super_admin';
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const RoleBadge: React.FC<RoleBadgeProps> = ({
  role,
  size = 'md',
  showIcon = true,
}) => {
  const config = {
    student: {
      label: 'Estudiante',
      color: 'bg-blue-100 text-blue-800',
      icon: <StudentIcon />,
    },
    admin_teacher: {
      label: 'Profesor',
      color: 'bg-green-100 text-green-800',
      icon: <TeacherIcon />,
    },
    super_admin: {
      label: 'Administrador',
      color: 'bg-purple-100 text-purple-800',
      icon: <AdminIcon />,
    },
  };

  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 ${config[role].color}`}>
      {showIcon && config[role].icon}
      {config[role].label}
    </span>
  );
};
```

### 4. UserAvatar

**Ubicacion:** `apps/frontend/src/features/auth/components/UserAvatar.tsx`

**Estado:** COMPLETO (100%)

```typescript
interface UserAvatarProps {
  user: User | null;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showStatus?: boolean;
  onClick?: () => void;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  user,
  size = 'md',
  showStatus = false,
  onClick,
}) => {
  const sizeClasses = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-14 h-14 text-lg',
    xl: 'w-20 h-20 text-xl',
  };

  // Muestra avatar_url si existe, sino iniciales
  return (
    <div
      className={`relative ${sizeClasses[size]} rounded-full overflow-hidden`}
      onClick={onClick}
    >
      {user?.avatarUrl ? (
        <img src={user.avatarUrl} alt={user.displayName} />
      ) : (
        <div className="bg-orange-500 flex items-center justify-center text-white">
          {getInitials(user?.displayName)}
        </div>
      )}
      {showStatus && <OnlineIndicator />}
    </div>
  );
};
```

### 5. LogoutButton

**Ubicacion:** `apps/frontend/src/features/auth/components/LogoutButton.tsx`

**Estado:** COMPLETO (100%)

```typescript
interface LogoutButtonProps {
  variant?: 'text' | 'outlined' | 'contained';
  showConfirmation?: boolean;
  onLogout?: () => void;
}

export const LogoutButton: React.FC<LogoutButtonProps> = ({
  variant = 'text',
  showConfirmation = false,
  onLogout,
}) => {
  const { logout } = useAuthStore();

  const handleLogout = () => {
    if (showConfirmation && !confirm('¿Cerrar sesion?')) return;
    logout();
    onLogout?.();
  };

  return (
    <button onClick={handleLogout} className={buttonStyles[variant]}>
      <LogoutIcon />
      Cerrar Sesion
    </button>
  );
};
```

### 6. PermissionGate

**Ubicacion:** `apps/frontend/src/features/auth/components/PermissionGate.tsx`

**Estado:** COMPLETO (100%)

```typescript
interface PermissionGateProps {
  children: React.ReactNode;
  allowedRoles: string[];
  fallback?: React.ReactNode;
}

export const PermissionGate: React.FC<PermissionGateProps> = ({
  children,
  allowedRoles,
  fallback = null,
}) => {
  const user = useAuthStore((state) => state.user);

  if (!user || !allowedRoles.includes(user.role)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
```

**Ejemplo de Uso:**
```tsx
<PermissionGate allowedRoles={['admin_teacher', 'super_admin']}>
  <button onClick={handleDelete}>Eliminar Aula</button>
</PermissionGate>
```

---

## Hooks Implementados

### useAuth Hook

**Ubicacion:** `apps/frontend/src/features/auth/hooks/useAuth.ts`

**Estado:** COMPLETO (100%)

```typescript
interface UseAuthReturn {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  refreshSession: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  hasRole: (roles: string[]) => boolean;
  canAccess: (permission: string) => boolean;
}

export function useAuth(): UseAuthReturn {
  const store = useAuthStore();

  const hasRole = useCallback((roles: string[]) => {
    return store.user ? roles.includes(store.user.role) : false;
  }, [store.user]);

  const canAccess = useCallback((permission: string) => {
    // Check if user has specific permission
    return checkPermission(store.user, permission);
  }, [store.user]);

  return {
    ...store,
    hasRole,
    canAccess,
  };
}
```

### useRoleCheck Hook

**Ubicacion:** `apps/frontend/src/features/auth/hooks/useRoleCheck.ts`

**Estado:** COMPLETO (100%)

```typescript
export function useRoleCheck(allowedRoles: string[]): boolean {
  const user = useAuthStore((state) => state.user);
  return user ? allowedRoles.includes(user.role) : false;
}

// Uso
const isAdmin = useRoleCheck(['super_admin']);
const canManageClassroom = useRoleCheck(['admin_teacher', 'super_admin']);
```

---

## Exports Centralizados

**Ubicacion:** `apps/frontend/src/features/auth/index.ts`

```typescript
// Components
export { LoginForm } from './components/LoginForm';
export { RegisterForm } from './components/RegisterForm';
export { RoleBadge } from './components/RoleBadge';
export { UserAvatar } from './components/UserAvatar';
export { LogoutButton } from './components/LogoutButton';
export { PermissionGate } from './components/PermissionGate';

// Hooks
export { useAuth } from './hooks/useAuth';
export { useRoleCheck } from './hooks/useRoleCheck';

// Store
export { useAuthStore } from './store/authStore';

// Types
export type { User, LoginCredentials, RegisterData } from './types/auth.types';
```

---

## Lo que Falta para Completar (10%)

### 1. ForgotPasswordForm (5%)

```typescript
// components/ForgotPasswordForm.tsx (NUEVO)
interface ForgotPasswordFormProps {
  onSuccess?: () => void;
}

export const ForgotPasswordForm: React.FC<ForgotPasswordFormProps>;
```

### 2. ResetPasswordForm (5%)

```typescript
// components/ResetPasswordForm.tsx (NUEVO)
interface ResetPasswordFormProps {
  token: string;
  onSuccess?: () => void;
}

export const ResetPasswordForm: React.FC<ResetPasswordFormProps>;
```

---

## Criterios de Aceptacion

### Funcionales
- [x] LoginForm con validacion y error handling
- [x] RegisterForm con password strength
- [x] RoleBadge muestra rol con color/icono
- [x] UserAvatar con fallback a iniciales
- [x] LogoutButton con confirmacion opcional
- [x] PermissionGate oculta contenido por rol
- [x] useAuth hook centraliza acceso a auth
- [ ] ForgotPasswordForm implementado
- [ ] ResetPasswordForm implementado

### No Funcionales
- [x] Componentes accesibles (ARIA)
- [x] Responsive en todos los breakpoints
- [x] Theming con Tailwind
- [x] Documentados con JSDoc

---

## Estimacion de Esfuerzo Restante

| Componente | Horas Estimadas |
|------------|-----------------|
| ForgotPasswordForm | 3h |
| ResetPasswordForm | 3h |
| Tests | 2h |
| **Total** | **8h** |

---

## Historial de Cambios

| Version | Fecha | Autor | Cambios |
|---------|-------|-------|---------|
| 1.0 | 2026-01-27 | Architecture Analyst | Creacion inicial |

---

*Documento: ET-AUTH-007-reusable-components.md*
*Generado: 2026-01-27*
