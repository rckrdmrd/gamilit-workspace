# Guards de Navegación - Frontend GAMILIT

**Proyecto:** GAMILIT Platform v2
**Módulo:** Routing y Navegación - Guards y Protección
**Router:** React Router v6.20.0
**Fecha:** 2025-11-01
**Versión:** 1.0

---

## RFC-0001 Header

```yaml
id: FRONTEND-ROUTING-GUARDS-003
título: Guards de Autenticación y Autorización
estado: Implementado
fecha_creación: 2025-10-27
última_actualización: 2025-11-01
autor: Equipo Frontend GAMILIT
```

**Historial de Cambios:**
- **2025-11-01:** Modularización desde ROUTING-Y-NAVEGACION.md
- **2025-10-27:** Creación inicial

---

## 1. Resumen Ejecutivo

Este documento describe los **guards de navegación** del frontend de GAMILIT, incluyendo protección de rutas por autenticación y autorización, redirecciones y manejo de roles.

---

## 2. ProtectedRoute Component

### 2.1 Implementación

**Ubicación:** `src/shared/components/routing/ProtectedRoute.tsx`

```typescript
import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '@stores/authStore';
import { LoadingScreen } from '../common/LoadingScreen';

interface ProtectedRouteProps {
  allowedRoles: Array<'student' | 'admin_teacher' | 'super_admin'>;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  allowedRoles,
}) => {
  const { isAuthenticated, user, isLoading } = useAuthStore();
  const location = useLocation();

  // Mostrar loading mientras se verifica autenticación
  if (isLoading) {
    return <LoadingScreen />;
  }

  // Verificar autenticación
  if (!isAuthenticated) {
    // Guardar la ubicación actual para redirigir después del login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Verificar autorización
  if (user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};
```

---

### 2.2 Uso

**En router:**
```typescript
{
  path: '/',
  element: <ProtectedRoute allowedRoles={['student']} />,
  children: [
    { path: 'dashboard', element: <StudentDashboard /> },
    { path: 'learning', element: <LearningPage /> },
  ],
}
```

**Múltiples roles:**
```typescript
{
  path: '/profile',
  element: <ProtectedRoute allowedRoles={['student', 'admin_teacher', 'super_admin']} />,
  children: [
    { index: true, element: <ProfilePage /> },
  ],
}
```

---

## 3. Redirect después de Login

### 3.1 Implementación en LoginPage

**Ubicación:** `src/apps/auth/pages/LoginPage.tsx`

```typescript
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@stores/authStore';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { login, user } = useAuthStore();

  // Obtener la ubicación previa del state
  const from = location.state?.from?.pathname || getDefaultRoute(user?.role);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await login(email, password);

      // Redirigir a la ubicación original o al dashboard
      navigate(from, { replace: true });
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <form onSubmit={handleLogin}>
      {/* Formulario de login */}
    </form>
  );
};

// Helper para obtener ruta por defecto según rol
function getDefaultRoute(role?: string): string {
  if (role === 'student') return '/dashboard';
  if (role === 'admin_teacher') return '/teacher/dashboard';
  if (role === 'super_admin') return '/admin/dashboard';
  return '/';
}
```

---

### 3.2 Flujo de Redirección

**Escenario 1: Usuario no autenticado intenta acceder a ruta protegida**

1. Usuario navega a `/learning`
2. `ProtectedRoute` detecta que no está autenticado
3. Redirige a `/login` con `state: { from: { pathname: '/learning' } }`
4. Usuario inicia sesión
5. `LoginPage` redirige a `/learning` (ubicación guardada en state)

**Escenario 2: Usuario autenticado con rol incorrecto**

1. Estudiante navega a `/teacher/dashboard`
2. `ProtectedRoute` detecta que el rol 'student' no está en `allowedRoles`
3. Redirige a `/unauthorized`

---

## 4. RoleRedirect Component

### 4.1 Implementación

**Ubicación:** `src/shared/components/routing/RoleRedirect.tsx`

```typescript
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@stores/authStore';

/**
 * Componente que redirige al dashboard apropiado según el rol del usuario
 */
export const RoleRedirect: React.FC = () => {
  const { user, isAuthenticated } = useAuthStore();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === 'student') {
    return <Navigate to="/dashboard" replace />;
  } else if (user.role === 'admin_teacher') {
    return <Navigate to="/teacher/dashboard" replace />;
  } else if (user.role === 'super_admin') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <Navigate to="/" replace />;
};
```

---

### 4.2 Uso

**En router:**
```typescript
{
  path: '/home',
  element: <RoleRedirect />,
}
```

**Después del login:**
```typescript
const handleLoginSuccess = () => {
  // Redirigir según rol
  navigate('/home'); // RoleRedirect manejará la redirección final
};
```

---

## 5. Unauthorized Page

### 5.1 Implementación

**Ubicación:** `src/shared/pages/Unauthorized.tsx`

```typescript
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';

export const UnauthorizedPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-detective-bg flex items-center justify-center">
      <div className="max-w-md text-center">
        <AlertTriangle className="w-24 h-24 text-detective-danger mx-auto mb-6" />
        <h1 className="text-4xl font-bold text-detective-text mb-4">
          Acceso Denegado
        </h1>
        <p className="text-detective-text-secondary mb-8">
          No tienes permisos para acceder a esta página.
        </p>
        <button
          onClick={() => navigate(-1)}
          className="bg-detective-orange hover:bg-detective-orange-dark text-white px-6 py-3 rounded-detective transition-all"
        >
          Volver
        </button>
      </div>
    </div>
  );
};
```

---

### 5.2 Configuración en Router

```typescript
{
  path: '/unauthorized',
  element: <UnauthorizedPage />,
}
```

---

## 6. Verificación de Autenticación

### 6.1 useAuth Hook

**Ubicación:** `src/shared/hooks/useAuth.ts`

```typescript
import { useAuthStore } from '@stores/authStore';

export const useAuth = () => {
  const { user, isAuthenticated, isLoading } = useAuthStore();

  const hasRole = (role: string) => {
    return user?.role === role;
  };

  const hasAnyRole = (roles: string[]) => {
    return user ? roles.includes(user.role) : false;
  };

  const isStudent = () => hasRole('student');
  const isTeacher = () => hasRole('admin_teacher');
  const isAdmin = () => hasRole('super_admin');

  return {
    user,
    isAuthenticated,
    isLoading,
    hasRole,
    hasAnyRole,
    isStudent,
    isTeacher,
    isAdmin,
  };
};
```

---

### 6.2 Uso en Componentes

```typescript
import { useAuth } from '@shared/hooks/useAuth';

const MyComponent = () => {
  const { isAuthenticated, isStudent, hasRole } = useAuth();

  if (!isAuthenticated) {
    return <p>Por favor inicia sesión</p>;
  }

  return (
    <div>
      {isStudent() && <StudentFeature />}
      {hasRole('admin_teacher') && <TeacherFeature />}
    </div>
  );
};
```

---

## 7. Conditional Rendering

### 7.1 RoleBasedComponent

**Ubicación:** `src/shared/components/routing/RoleBasedComponent.tsx`

```typescript
import React from 'react';
import { useAuth } from '@shared/hooks/useAuth';

interface RoleBasedComponentProps {
  roles: string[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const RoleBasedComponent: React.FC<RoleBasedComponentProps> = ({
  roles,
  children,
  fallback = null,
}) => {
  const { hasAnyRole } = useAuth();

  if (hasAnyRole(roles)) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
};
```

---

### 7.2 Uso

```typescript
import { RoleBasedComponent } from '@shared/components/routing/RoleBasedComponent';

<RoleBasedComponent roles={['admin_teacher', 'super_admin']}>
  <AdminPanel />
</RoleBasedComponent>

// Con fallback
<RoleBasedComponent
  roles={['student']}
  fallback={<p>Solo para estudiantes</p>}
>
  <StudentDashboard />
</RoleBasedComponent>
```

---

## 8. Breadcrumbs con Autorización

### 8.1 Implementación

**Ubicación:** `src/shared/components/navigation/Breadcrumbs.tsx`

```typescript
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

export const Breadcrumbs: React.FC = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  const formatPathname = (path: string): string => {
    return path
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <nav className="breadcrumbs flex items-center gap-2 text-sm text-detective-text-secondary mb-6">
      <Link to="/" className="hover:text-detective-orange transition-colors">
        Inicio
      </Link>

      {pathnames.map((value, index) => {
        const to = `/${pathnames.slice(0, index + 1).join('/')}`;
        const isLast = index === pathnames.length - 1;

        return (
          <React.Fragment key={to}>
            <ChevronRight className="w-4 h-4" />
            {isLast ? (
              <span className="text-detective-text font-medium">
                {formatPathname(value)}
              </span>
            ) : (
              <Link
                to={to}
                className="hover:text-detective-orange transition-colors"
              >
                {formatPathname(value)}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};
```

---

## 9. Mejores Prácticas

### 9.1 Protección de Rutas

✅ **Correcto:**
```typescript
{
  path: '/',
  element: <ProtectedRoute allowedRoles={['student']} />,
  children: [/* rutas protegidas */],
}
```

❌ **Incorrecto:**
```typescript
{
  path: '/dashboard',
  element: user ? <Dashboard /> : <Navigate to="/login" />,
}
```

---

### 9.2 Autorización

✅ **Correcto:**
```typescript
{
  element: <ProtectedRoute allowedRoles={['admin_teacher']} />,
  children: [/* rutas solo para profesores */],
}
```

❌ **Incorrecto:**
```typescript
// Verificar rol manualmente en cada página
const DashboardPage = () => {
  const { user } = useAuth();
  if (user.role !== 'admin_teacher') {
    return <Navigate to="/unauthorized" />;
  }
  return <Dashboard />;
};
```

---

### 9.3 Redirección Post-Login

✅ **Correcto:**
```typescript
const from = location.state?.from?.pathname || getDefaultRoute(user?.role);
navigate(from, { replace: true });
```

❌ **Incorrecto:**
```typescript
navigate('/dashboard'); // Siempre redirige al mismo lugar
```

---

## 10. Testing

### 10.1 Test de ProtectedRoute

```typescript
import { render, screen } from '@testing-library/react';
import { ProtectedRoute } from './ProtectedRoute';
import { useAuthStore } from '@stores/authStore';

jest.mock('@stores/authStore');

describe('ProtectedRoute', () => {
  it('should redirect to login if not authenticated', () => {
    (useAuthStore as jest.Mock).mockReturnValue({
      isAuthenticated: false,
      user: null,
      isLoading: false,
    });

    render(<ProtectedRoute allowedRoles={['student']} />);

    // Verificar redirección
    expect(window.location.pathname).toBe('/login');
  });

  it('should render children if authenticated and authorized', () => {
    (useAuthStore as jest.Mock).mockReturnValue({
      isAuthenticated: true,
      user: { role: 'student' },
      isLoading: false,
    });

    render(
      <ProtectedRoute allowedRoles={['student']}>
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('should redirect to unauthorized if role not allowed', () => {
    (useAuthStore as jest.Mock).mockReturnValue({
      isAuthenticated: true,
      user: { role: 'student' },
      isLoading: false,
    });

    render(<ProtectedRoute allowedRoles={['admin_teacher']} />);

    expect(window.location.pathname).toBe('/unauthorized');
  });
});
```

---

## 11. Referencias

- **Archivo Original:** `ROUTING-Y-NAVEGACION.md` (líneas 238-527)
- **Configuración de Routing:** Ver `Routing-Configuracion.md`
- **Rutas Completas:** Ver `Routing-Rutas.md`
- **README Principal:** Ver `routing/README.md`

---

**Documento generado:** 2025-11-01
**Versión:** 1.0
**Router:** React Router v6.20.0
