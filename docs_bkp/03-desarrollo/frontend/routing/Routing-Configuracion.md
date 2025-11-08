# Configuración de Routing - Frontend GAMILIT

**Proyecto:** GAMILIT Platform v2
**Módulo:** Routing y Navegación - Configuración Base
**Router:** React Router v6.20.0
**Fecha:** 2025-11-01
**Versión:** 1.0

---

## RFC-0001 Header

```yaml
id: FRONTEND-ROUTING-CONFIG-001
título: Configuración de React Router v6
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

Este documento describe la **configuración del sistema de routing** del frontend de GAMILIT, basado en React Router v6, incluyendo setup principal, layouts y configuración de lazy loading.

### Características:

- **React Router v6:** Routing declarativo
- **Lazy Loading:** Code splitting por ruta
- **Protected Routes:** Autenticación y autorización
- **Nested Routes:** Rutas anidadas con layouts
- **Scroll Restoration:** Scroll al cambiar de página

---

## 2. Instalación y Setup

### 2.1 Instalación

```bash
npm install react-router-dom@6.20.0
```

### 2.2 Dependencias

```json
{
  "dependencies": {
    "react-router-dom": "^6.20.0"
  }
}
```

---

## 3. Router Principal

### 3.1 Implementación

**Ubicación:** `src/routes.tsx`

```typescript
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { LoadingScreen } from '@shared/components/common/LoadingScreen';

// Lazy loaded pages
const LandingPage = lazy(() => import('@apps/landing/pages/LandingPage'));
const LoginPage = lazy(() => import('@apps/auth/pages/LoginPage'));
const RegisterPage = lazy(() => import('@apps/auth/pages/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('@apps/auth/pages/ForgotPasswordPage'));

// Student App
const StudentDashboard = lazy(() => import('@apps/student/pages/dashboard'));
const LearningPage = lazy(() => import('@apps/student/pages/learning'));
const ModuleDetailPage = lazy(() => import('@apps/student/pages/learning/ModuleDetail'));
const ExercisePage = lazy(() => import('@apps/student/pages/learning/Exercise'));
const AchievementsPage = lazy(() => import('@apps/student/pages/achievements'));
const ShopPage = lazy(() => import('@apps/student/pages/shop'));
const CartPage = lazy(() => import('@apps/student/pages/shop/Cart'));
const InventoryPage = lazy(() => import('@apps/student/pages/shop/Inventory'));
const SocialPage = lazy(() => import('@apps/student/pages/social'));

// Teacher App
const TeacherDashboard = lazy(() => import('@apps/teacher/pages/dashboard'));
const MonitoringPage = lazy(() => import('@apps/teacher/pages/monitoring'));
const AssignmentsPage = lazy(() => import('@apps/teacher/pages/assignments'));
const AnalyticsPage = lazy(() => import('@apps/teacher/pages/analytics'));

// Admin App
const AdminDashboard = lazy(() => import('@apps/admin/pages/dashboard'));
const UsersPage = lazy(() => import('@apps/admin/pages/users'));
const OrganizationsPage = lazy(() => import('@apps/admin/pages/organizations'));
const SystemMonitoringPage = lazy(() => import('@apps/admin/pages/monitoring'));

// Layouts
import { PublicLayout } from '@shared/components/layout/PublicLayout';
import { StudentLayout } from '@shared/components/layout/StudentLayout';
import { TeacherLayout } from '@shared/components/layout/TeacherLayout';
import { AdminLayout } from '@shared/components/layout/AdminLayout';

// Protected Route
import { ProtectedRoute } from '@shared/components/routing/ProtectedRoute';

// 404
const NotFoundPage = lazy(() => import('@shared/pages/NotFound'));

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
              {
                path: ':moduleId/exercise/:exerciseId',
                element: <ExercisePage />,
              },
            ],
          },
          { path: 'achievements', element: <AchievementsPage /> },
          {
            path: 'shop',
            children: [
              { index: true, element: <ShopPage /> },
              { path: 'cart', element: <CartPage /> },
              { path: 'inventory', element: <InventoryPage /> },
            ],
          },
          { path: 'social', element: <SocialPage /> },
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

---

## 4. Layouts

### 4.1 PublicLayout

**Ubicación:** `src/shared/components/layout/PublicLayout.tsx`

```typescript
import React from 'react';
import { Outlet } from 'react-router-dom';
import { PublicHeader } from './PublicHeader';
import { PublicFooter } from './PublicFooter';

export const PublicLayout: React.FC = () => {
  return (
    <div className="public-layout min-h-screen flex flex-col">
      <PublicHeader />
      <main className="flex-1">
        <Outlet />
      </main>
      <PublicFooter />
    </div>
  );
};
```

---

### 4.2 StudentLayout

**Ubicación:** `src/shared/components/layout/StudentLayout.tsx`

```typescript
import React from 'react';
import { Outlet } from 'react-router-dom';
import { GamifiedHeader } from '../layout/GamifiedHeader';
import { GamilitSidebar } from '../layout/GamilitSidebar';
import { useAuthStore } from '@stores/authStore';
import { useGamificationData } from '@shared/hooks/useGamificationData';

export const StudentLayout: React.FC = () => {
  const { user } = useAuthStore();
  const { xp, mlCoins, rank } = useGamificationData();

  if (!user) return null;

  return (
    <div className="student-layout min-h-screen bg-detective-bg">
      <GamifiedHeader
        user={user}
        xp={xp}
        mlCoins={mlCoins}
        rank={rank}
      />
      <div className="layout-content flex">
        <GamilitSidebar
          userRole="student"
          currentPath={window.location.pathname}
        />
        <main className="main-content flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
```

---

### 4.3 TeacherLayout

**Ubicación:** `src/shared/components/layout/TeacherLayout.tsx`

```typescript
import React from 'react';
import { Outlet } from 'react-router-dom';
import { GamilitSidebar } from '../layout/GamilitSidebar';
import { useAuthStore } from '@stores/authStore';

export const TeacherLayout: React.FC = () => {
  const { user } = useAuthStore();

  if (!user) return null;

  return (
    <div className="teacher-layout min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <h1 className="text-2xl font-bold text-gray-800">
          Panel de Profesor - {user.name}
        </h1>
      </header>
      <div className="layout-content flex">
        <GamilitSidebar
          userRole="admin_teacher"
          currentPath={window.location.pathname}
        />
        <main className="main-content flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
```

---

### 4.4 AdminLayout

**Ubicación:** `src/shared/components/layout/AdminLayout.tsx`

```typescript
import React from 'react';
import { Outlet } from 'react-router-dom';
import { GamilitSidebar } from '../layout/GamilitSidebar';
import { useAuthStore } from '@stores/authStore';

export const AdminLayout: React.FC = () => {
  const { user } = useAuthStore();

  if (!user) return null;

  return (
    <div className="admin-layout min-h-screen bg-gray-100">
      <header className="bg-gray-800 text-white px-6 py-4">
        <h1 className="text-2xl font-bold">
          Panel de Administración - {user.name}
        </h1>
      </header>
      <div className="layout-content flex">
        <GamilitSidebar
          userRole="super_admin"
          currentPath={window.location.pathname}
        />
        <main className="main-content flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
```

---

## 5. Loading Screen

### 5.1 LoadingScreen Component

**Ubicación:** `src/shared/components/common/LoadingScreen.tsx`

```typescript
import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-detective-bg flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-16 h-16 text-detective-orange animate-spin mx-auto mb-4" />
        <p className="text-detective-text-secondary">Cargando...</p>
      </div>
    </div>
  );
};
```

---

## 6. Scroll Restoration

### 6.1 ScrollRestoration Component

**Ubicación:** `src/shared/components/routing/ScrollRestoration.tsx`

```typescript
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const ScrollRestoration: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};
```

### 6.2 Uso en App

**Ubicación:** `src/App.tsx`

```typescript
import { AppRouter } from './routes';
import { ScrollRestoration } from '@shared/components/routing/ScrollRestoration';

export const App = () => {
  return (
    <>
      <ScrollRestoration />
      <AppRouter />
    </>
  );
};
```

---

## 7. Hooks de Navegación

### 7.1 useNavigation

**Ubicación:** `src/shared/hooks/useNavigation.ts`

```typescript
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@stores/authStore';

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

**Uso:**
```typescript
import { useNavigation } from '@shared/hooks/useNavigation';

const MyComponent = () => {
  const { goToDashboard, goToModule } = useNavigation();

  return (
    <>
      <button onClick={goToDashboard}>Ir al Dashboard</button>
      <button onClick={() => goToModule('module-1')}>
        Ir al Módulo 1
      </button>
    </>
  );
};
```

---

## 8. Mejores Prácticas

### 8.1 Lazy Loading

✅ **Correcto:**
```typescript
const DashboardPage = lazy(() => import('@apps/student/pages/dashboard'));
```

❌ **Incorrecto:**
```typescript
import DashboardPage from '@apps/student/pages/dashboard';
```

### 8.2 Nested Routes

✅ **Correcto:**
```typescript
{
  path: 'learning',
  children: [
    { index: true, element: <LearningPage /> },
    { path: ':moduleId', element: <ModuleDetailPage /> },
  ],
}
```

### 8.3 Protected Routes

✅ **Correcto:**
```typescript
{
  path: '/',
  element: <ProtectedRoute allowedRoles={['student']} />,
  children: [/* rutas protegidas */],
}
```

---

## 9. Referencias

- **Archivo Original:** `ROUTING-Y-NAVEGACION.md` (líneas 1-304)
- **Rutas Completas:** Ver `Routing-Rutas.md`
- **Guards de Navegación:** Ver `Navegacion-Guards.md`
- **README Principal:** Ver `routing/README.md`

---

**Documento generado:** 2025-11-01
**Versión:** 1.0
**Router:** React Router v6.20.0
