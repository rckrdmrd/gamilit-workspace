# Routing y Navegación - Frontend GAMILIT Platform v2

**Proyecto:** GAMILIT Platform v2
**Fecha:** 2025-10-27
**Router:** React Router v6.20.0
**Total de Rutas:** 60+

---

## 1. Resumen Ejecutivo

GAMILIT Platform implementa un sistema de routing con **React Router v6** que gestiona **3 aplicaciones independientes** (student, teacher, admin) con más de **60 rutas** protegidas y públicas.

### Características:

- **React Router v6**: Declarative routing
- **Protected Routes**: Autenticación y autorización
- **Lazy Loading**: Code splitting por ruta
- **Breadcrumbs**: Navegación contextual
- **Query Parameters**: Filtros y búsqueda
- **Not Found**: 404 handling

---

## 2. Estructura de Rutas

```
/                                 # Landing page (public)
├── /login                        # Login (public)
├── /register                     # Register (public)
├── /forgot-password              # Password reset (public)
│
├── /dashboard                    # Student Dashboard (protected)
│   ├── /overview
│   ├── /stats
│   └── /recent
│
├── /learning                     # Learning (protected - student)
│   ├── /                         # Módulos list
│   ├── /:moduleId                # Detalle módulo
│   ├── /:moduleId/exercise/:id   # Ejercicio específico
│   └── /progress                 # Progreso general
│
├── /achievements                 # Achievements (protected - student)
│   ├── /                         # Lista de logros
│   ├── /unlocked                 # Logros desbloqueados
│   ├── /in-progress              # En progreso
│   └── /:achievementId           # Detalle logro
│
├── /shop                         # Shop (protected - student)
│   ├── /                         # Tienda
│   ├── /cart                     # Carrito
│   ├── /inventory                # Inventario
│   └── /item/:itemId             # Detalle item
│
├── /social                       # Social (protected - student)
│   ├── /guilds                   # Gremios
│   │   ├── /                     # Lista gremios
│   │   ├── /my-guild             # Mi gremio
│   │   └── /:guildId             # Detalle gremio
│   ├── /friends                  # Amigos
│   │   ├── /                     # Lista amigos
│   │   ├── /requests             # Solicitudes
│   │   └── /:friendId            # Perfil amigo
│   └── /leaderboard              # Rankings
│       ├── /xp                   # Por XP
│       ├── /coins                # Por ML Coins
│       └── /streak               # Por racha
│
├── /profile                      # Perfil (protected)
│   ├── /                         # Perfil general
│   ├── /edit                     # Editar perfil
│   ├── /settings                 # Configuración
│   └── /history                  # Historial
│
├── /teacher                      # Teacher App (protected - teacher)
│   ├── /dashboard                # Dashboard profesor
│   ├── /monitoring               # Monitoreo
│   │   ├── /                     # Monitoreo general
│   │   ├── /live                 # Tiempo real
│   │   └── /student/:id          # Detalle estudiante
│   ├── /assignments              # Tareas
│   │   ├── /                     # Lista tareas
│   │   ├── /create               # Crear tarea
│   │   ├── /:assignmentId        # Detalle tarea
│   │   └── /:assignmentId/edit   # Editar tarea
│   ├── /analytics                # Analytics
│   │   ├── /overview             # Vista general
│   │   ├── /performance          # Rendimiento
│   │   ├── /engagement           # Engagement
│   │   └── /reports              # Reportes
│   └── /interventions            # Intervenciones
│       ├── /                     # Alertas
│       ├── /active               # Activas
│       └── /history              # Historial
│
└── /admin                        # Admin App (protected - admin)
    ├── /dashboard                # Dashboard admin
    ├── /users                    # Gestión usuarios
    │   ├── /                     # Lista usuarios
    │   ├── /create               # Crear usuario
    │   ├── /:userId              # Detalle usuario
    │   └── /:userId/edit         # Editar usuario
    ├── /organizations            # Organizaciones
    │   ├── /                     # Lista
    │   ├── /create               # Crear
    │   └── /:orgId               # Detalle
    ├── /monitoring               # Monitoreo sistema
    │   ├── /health               # Salud del sistema
    │   ├── /logs                 # Logs
    │   └── /metrics              # Métricas
    └── /content                  # Gestión contenido
        ├── /modules              # Módulos
        ├── /exercises            # Ejercicios
        └── /settings             # Configuración
```

---

## 3. Implementación

### 3.1 Router Principal

```typescript
// src/routes.tsx
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { lazy, Suspense } from 'react';

// Lazy loaded pages
const StudentDashboard = lazy(() => import('@apps/student/pages/dashboard'));
const LearningPage = lazy(() => import('@apps/student/pages/learning'));
const TeacherDashboard = lazy(() => import('@apps/teacher/pages/dashboard'));
const AdminDashboard = lazy(() => import('@apps/admin/pages/dashboard'));

const router = createBrowserRouter([
  // Public routes
  {
    path: '/',
    element: <PublicLayout />,
    children: [
      { index: true, element: <LandingPage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },
      { path: 'forgot-password', element: <ForgotPasswordPage /> },
    ],
  },

  // Student routes
  {
    path: '/',
    element: <ProtectedRoute allowedRoles={['student']} />,
    children: [
      {
        element: <StudentLayout />,
        children: [
          { path: 'dashboard', element: <StudentDashboard /> },
          {
            path: 'learning',
            children: [
              { index: true, element: <LearningPage /> },
              { path: ':moduleId', element: <ModuleDetailPage /> },
              { path: ':moduleId/exercise/:exerciseId', element: <ExercisePage /> },
            ],
          },
          {
            path: 'achievements',
            element: <AchievementsPage />,
          },
          {
            path: 'shop',
            children: [
              { index: true, element: <ShopPage /> },
              { path: 'cart', element: <CartPage /> },
              { path: 'inventory', element: <InventoryPage /> },
            ],
          },
          {
            path: 'social',
            children: [
              { path: 'guilds', element: <GuildsPage /> },
              { path: 'friends', element: <FriendsPage /> },
              { path: 'leaderboard', element: <LeaderboardPage /> },
            ],
          },
        ],
      },
    ],
  },

  // Teacher routes
  {
    path: '/teacher',
    element: <ProtectedRoute allowedRoles={['admin_teacher']} />,
    children: [
      {
        element: <TeacherLayout />,
        children: [
          { path: 'dashboard', element: <TeacherDashboard /> },
          { path: 'monitoring', element: <MonitoringPage /> },
          { path: 'assignments', element: <AssignmentsPage /> },
          { path: 'analytics', element: <AnalyticsPage /> },
        ],
      },
    ],
  },

  // Admin routes
  {
    path: '/admin',
    element: <ProtectedRoute allowedRoles={['super_admin']} />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { path: 'dashboard', element: <AdminDashboard /> },
          { path: 'users', element: <UsersPage /> },
          { path: 'organizations', element: <OrganizationsPage /> },
          { path: 'monitoring', element: <SystemMonitoringPage /> },
        ],
      },
    ],
  },

  // 404
  { path: '*', element: <NotFoundPage /> },
]);

export const AppRouter = () => {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <RouterProvider router={router} />
    </Suspense>
  );
};
```

### 3.2 Protected Route

```typescript
// src/shared/components/routing/ProtectedRoute.tsx
interface ProtectedRouteProps {
  allowedRoles: Array<'student' | 'admin_teacher' | 'super_admin'>;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  allowedRoles,
}) => {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();

  // Check authentication
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check authorization
  if (user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};
```

### 3.3 Navigation Hook

```typescript
// src/shared/hooks/useNavigation.ts
export const useNavigation = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const goToDashboard = () => {
    const path =
      user?.role === 'student'
        ? '/dashboard'
        : user?.role === 'admin_teacher'
        ? '/teacher/dashboard'
        : '/admin/dashboard';
    navigate(path);
  };

  const goToModule = (moduleId: string) => {
    navigate(`/learning/${moduleId}`);
  };

  const goToExercise = (moduleId: string, exerciseId: string) => {
    navigate(`/learning/${moduleId}/exercise/${exerciseId}`);
  };

  const goBack = () => navigate(-1);

  return {
    goToDashboard,
    goToModule,
    goToExercise,
    goBack,
    navigate,
  };
};
```

---

## 4. Layouts

### 4.1 PublicLayout

```typescript
export const PublicLayout: React.FC = () => {
  return (
    <div className="public-layout">
      <PublicHeader />
      <main>
        <Outlet />
      </main>
      <PublicFooter />
    </div>
  );
};
```

### 4.2 StudentLayout

```typescript
export const StudentLayout: React.FC = () => {
  const { user } = useAuthStore();
  const { xp, mlCoins, rank } = useGamificationData();

  return (
    <div className="student-layout">
      <GamifiedHeader user={user} xp={xp} mlCoins={mlCoins} rank={rank} />
      <div className="layout-content">
        <GamilitSidebar userRole="student" />
        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
```

---

## 5. Navegación Programática

### 5.1 Después de Login

```typescript
const handleLogin = async (email: string, password: string) => {
  await login(email, password);

  // Redirigir según rol
  const role = useAuthStore.getState().user?.role;
  if (role === 'student') {
    navigate('/dashboard');
  } else if (role === 'admin_teacher') {
    navigate('/teacher/dashboard');
  } else {
    navigate('/admin/dashboard');
  }
};
```

### 5.2 Después de Completar Ejercicio

```typescript
const handleExerciseComplete = (result: ScoreResult) => {
  // Mostrar modal de feedback
  setShowFeedback(true);

  // Después de cerrar modal, volver al módulo
  setTimeout(() => {
    navigate(`/learning/${moduleId}`);
  }, 3000);
};
```

---

## 6. Breadcrumbs

```typescript
// shared/components/navigation/Breadcrumbs.tsx
export const Breadcrumbs: React.FC = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  return (
    <nav className="breadcrumbs">
      <Link to="/">Inicio</Link>
      {pathnames.map((value, index) => {
        const to = `/${pathnames.slice(0, index + 1).join('/')}`;
        const isLast = index === pathnames.length - 1;

        return isLast ? (
          <span key={to}>{formatPathname(value)}</span>
        ) : (
          <Link key={to} to={to}>
            {formatPathname(value)}
          </Link>
        );
      })}
    </nav>
  );
};
```

---

## 7. Query Parameters

### 7.1 Filters

```typescript
// pages/shop/ShopPage.tsx
const [searchParams, setSearchParams] = useSearchParams();

const category = searchParams.get('category') || 'all';
const sort = searchParams.get('sort') || 'name';

const handleCategoryChange = (newCategory: string) => {
  setSearchParams({ category: newCategory, sort });
};
```

### 7.2 Pagination

```typescript
const page = parseInt(searchParams.get('page') || '1', 10);
const limit = parseInt(searchParams.get('limit') || '20', 10);

const handlePageChange = (newPage: number) => {
  setSearchParams({ page: newPage.toString(), limit: limit.toString() });
};
```

---

## 8. Scroll Restoration

```typescript
// src/App.tsx
export const App = () => {
  return (
    <Router>
      <ScrollRestoration />
      <Routes>
        {/* ... rutas */}
      </Routes>
    </Router>
  );
};

// ScrollRestoration component
export const ScrollRestoration = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};
```

---

## 9. Redirecciones

### 9.1 Redirect después de Login

```typescript
const location = useLocation();
const from = location.state?.from?.pathname || '/dashboard';

const handleLoginSuccess = () => {
  navigate(from, { replace: true });
};
```

### 9.2 Redirect por Rol

```typescript
export const RoleRedirect: React.FC = () => {
  const { user } = useAuthStore();

  if (!user) return <Navigate to="/login" />;

  if (user.role === 'student') {
    return <Navigate to="/dashboard" />;
  } else if (user.role === 'admin_teacher') {
    return <Navigate to="/teacher/dashboard" />;
  } else {
    return <Navigate to="/admin/dashboard" />;
  }
};
```

---

## 10. Mejores Prácticas

### 10.1 Lazy Loading

- Lazy load rutas pesadas
- Usar Suspense con fallback
- Code splitting por ruta

### 10.2 Protected Routes

- Validar autenticación primero
- Validar autorización después
- Guardar location para redirect post-login

### 10.3 URLs Amigables

- Usar slugs descriptivos
- Mantener URLs limpias
- Evitar IDs en URLs cuando sea posible

---

**Documento generado:** 2025-10-27
**Versión:** 1.0
**Total de Rutas:** 60+
