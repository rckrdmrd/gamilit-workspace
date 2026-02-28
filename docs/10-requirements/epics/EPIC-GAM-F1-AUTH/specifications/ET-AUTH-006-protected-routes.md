---
titulo: "ET-AUTH-006: Protected Routes"
tipo: especificacion-tecnica
fecha_creacion: "2025-10-01"
ultima_actualizacion: "2026-02-28"
estado: activo
---

# ET-AUTH-006: Protected Routes

## Metadata

| Campo | Valor |
|-------|-------|
| **ID** | ET-AUTH-006 |
| **Modulo** | Autenticacion y Autorizacion |
| **Tipo** | Especificacion Tecnica |
| **Estado** | Implementado |
| **Completitud** | 100% |
| **Version** | 1.0 |
| **Fecha Creacion** | 2026-01-27 |
| **Ultima Actualizacion** | 2026-01-27 |
| **Autor** | Architecture Analyst |

---

## Referencias

### Requerimiento Funcional
- RF-AUTH-007: Protected Routes System

### User Stories
- US-AUTH-007: Route Protection and Access Control

---

## Descripcion Funcional

El sistema de rutas protegidas implementa:
- Proteccion de rutas que requieren autenticacion
- Control de acceso basado en roles (RBAC)
- Redireccion inteligente segun estado de sesion
- Preservacion de destino para post-login redirect
- Pagina de acceso denegado (403)

---

## Arquitectura

### Diagrama de Flujo

```
Usuario navega a /admin
        |
        v
ProtectedRoute wrapper
        |
        v
¿isLoading?
  └── SI → Mostrar spinner
        |
        v
¿isAuthenticated?
  └── NO → Navigate to /login
            (preserva destino en state)
        |
        v
¿allowedRoles definidos?
  ├── NO → Renderizar children
  └── SI → ¿user.role in allowedRoles?
              ├── SI → Renderizar children
              └── NO → Navigate to /unauthorized
```

---

## Implementacion Existente

### Frontend - ProtectedRoute Component

**Ubicacion:** `apps/frontend/src/shared/components/ProtectedRoute.tsx`

**Estado:** COMPLETO (100%)

```typescript
interface ProtectedRouteProps {
  children?: React.ReactNode;
  allowedRoles?: string[];
  redirectTo?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
  redirectTo = '/login',
}) => {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);
  const location = useLocation();

  // Initialize WebSocket for real-time notifications
  useWebSocket();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-b-2 border-orange-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Check role-based access control
  if (allowedRoles && allowedRoles.length > 0) {
    const hasRequiredRole = allowedRoles.includes(user?.role || '');
    if (!hasRequiredRole) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return <>{children}</>;
};
```

### Frontend - UnauthorizedPage Component

**Ubicacion:** `apps/frontend/src/shared/components/ProtectedRoute.tsx`

**Estado:** COMPLETO (100%)

```typescript
export const UnauthorizedPage: React.FC = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="max-w-md px-4 text-center">
        <div className="mb-4 text-6xl">403</div>
        <h1 className="mb-2 text-3xl font-bold text-gray-900">Access Denied</h1>
        <p className="mb-6 text-gray-600">
          You don't have permission to access this page.
        </p>
        <div className="space-x-4">
          <a href="/" className="btn-primary">Go to Home</a>
          <a href="/dashboard" className="btn-secondary">Go to Dashboard</a>
        </div>
      </div>
    </div>
  );
};
```

### Frontend - Route Configuration

**Ubicacion:** `apps/frontend/src/App.tsx`

**Estado:** COMPLETO (100%)

```typescript
<Routes>
  {/* Public routes */}
  <Route path="/login" element={<LoginPage />} />
  <Route path="/register" element={<RegisterPage />} />
  <Route path="/unauthorized" element={<UnauthorizedPage />} />

  {/* Protected routes - any authenticated user */}
  <Route path="/dashboard" element={
    <ProtectedRoute>
      <StudentDashboard />
    </ProtectedRoute>
  } />

  {/* Protected routes - teacher/admin only */}
  <Route path="/teacher/*" element={
    <ProtectedRoute allowedRoles={['admin_teacher', 'super_admin']}>
      <TeacherApp />
    </ProtectedRoute>
  } />

  {/* Protected routes - super_admin only */}
  <Route path="/admin/*" element={
    <ProtectedRoute allowedRoles={['super_admin']}>
      <AdminApp />
    </ProtectedRoute>
  } />
</Routes>
```

---

## Patrones de Uso

### 1. Proteccion Basica (Solo Autenticacion)

```tsx
<Route path="/profile" element={
  <ProtectedRoute>
    <ProfilePage />
  </ProtectedRoute>
} />
```

### 2. Proteccion por Rol

```tsx
<Route path="/classroom/:id/manage" element={
  <ProtectedRoute allowedRoles={['admin_teacher', 'super_admin']}>
    <ClassroomManagement />
  </ProtectedRoute>
} />
```

### 3. Redireccion Personalizada

```tsx
<Route path="/premium" element={
  <ProtectedRoute redirectTo="/upgrade">
    <PremiumContent />
  </ProtectedRoute>
} />
```

### 4. Nested Routes

```tsx
<Route path="/teacher" element={
  <ProtectedRoute allowedRoles={['admin_teacher', 'super_admin']}>
    <TeacherLayout />
  </ProtectedRoute>
}>
  <Route index element={<TeacherDashboard />} />
  <Route path="classrooms" element={<ClassroomList />} />
  <Route path="students" element={<StudentList />} />
</Route>
```

---

## Roles del Sistema

| Rol | Descripcion | Rutas Permitidas |
|-----|-------------|------------------|
| student | Estudiante regular | /dashboard, /exercises, /profile, /gamification |
| admin_teacher | Profesor/Admin | + /teacher/*, /classroom/manage |
| super_admin | Super administrador | + /admin/* |

---

## Integracion con WebSocket

El ProtectedRoute inicializa automaticamente la conexion WebSocket:

```typescript
// Inside ProtectedRoute
useWebSocket();
```

Esto permite:
- Notificaciones en tiempo real
- Actualizaciones de gamificacion
- Alertas del sistema

---

## Post-Login Redirect

### Flujo

1. Usuario no autenticado intenta acceder a `/dashboard`
2. ProtectedRoute redirige a `/login` con `state: { from: '/dashboard' }`
3. LoginPage detecta el state despues de login exitoso
4. Redirige a `/dashboard` en lugar de ruta por defecto

### Implementacion

```typescript
// LoginPage.tsx
const location = useLocation();
const from = location.state?.from?.pathname || '/dashboard';

const handleLogin = async (credentials) => {
  await login(credentials);
  navigate(from, { replace: true });
};
```

---

## Testing

### Unit Tests

**Ubicacion:** `apps/frontend/src/shared/components/__tests__/ProtectedRoute.test.tsx`

```typescript
describe('ProtectedRoute', () => {
  it('renders children when authenticated', () => {
    mockAuthStore({ isAuthenticated: true });
    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('redirects to login when not authenticated', () => {
    mockAuthStore({ isAuthenticated: false });
    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );
    expect(mockNavigate).toHaveBeenCalledWith('/login', expect.anything());
  });

  it('redirects to unauthorized when role not allowed', () => {
    mockAuthStore({ isAuthenticated: true, user: { role: 'student' } });
    render(
      <ProtectedRoute allowedRoles={['super_admin']}>
        <div>Admin Content</div>
      </ProtectedRoute>
    );
    expect(mockNavigate).toHaveBeenCalledWith('/unauthorized', expect.anything());
  });
});
```

---

## Criterios de Aceptacion

### Funcionales
- [x] Rutas protegidas bloquean acceso sin autenticacion
- [x] Redireccion a login preserva destino original
- [x] Roles restringen acceso a rutas especificas
- [x] Pagina 403 para acceso denegado
- [x] Loading state mientras verifica sesion
- [x] WebSocket se inicializa en rutas protegidas

### No Funcionales
- [x] No flash de contenido protegido
- [x] Transiciones suaves entre estados
- [x] Zustand store para HMR resilience

---

## Dependencias

### Bloqueado Por
- AuthStore (COMPLETO)
- React Router (COMPLETO)
- WebSocket Hook (COMPLETO)

### Bloquea
- Ninguno

---

## Historial de Cambios

| Version | Fecha | Autor | Cambios |
|---------|-------|-------|---------|
| 1.0 | 2026-01-27 | Architecture Analyst | Creacion inicial |

---

*Documento: ET-AUTH-006-protected-routes.md*
*Generado: 2026-01-27*
